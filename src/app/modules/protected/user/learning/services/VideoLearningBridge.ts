/**
 * @file VideoLearningBridge.ts
 * @description Bridge pour l'apprentissage LSF multimodal avec vidéo temps réel
 * @author MetaSign Team
 * @version 1.0.0
 */

import { LoggerFactory } from '../../../../../../ai/utils/LoggerFactory';

// Types pour la capture vidéo et reconnaissance de signes
export interface VideoStreamConfig {
  width: number;
  height: number;
  frameRate: number;
  facingMode: 'user' | 'environment';
  enableAudio: boolean;
}

export interface HandPose {
  landmarks: number[][];
  confidence: number;
  handedness: 'Left' | 'Right';
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface SignRecognitionResult {
  signId: string;
  signName: string;
  confidence: number;
  timestamp: number;
  handPoses: HandPose[];
  description: string;
  category: 'letter' | 'word' | 'phrase' | 'number';
}

export interface TextSignAssociation {
  textSegment: string;
  startTime: number;
  endTime: number;
  associatedSigns: SignRecognitionResult[];
  teacherNotes?: string;
}

export interface LearningSession {
  sessionId: string;
  teacherId: string;
  studentId?: string; // Pour CODA, c'est l'IA
  startTime: Date;
  topic: string;
  targetLevel: string;
  videoStream?: MediaStream;
  recordings: VideoRecording[];
  textSignAssociations: TextSignAssociation[];
  status: 'preparing' | 'active' | 'paused' | 'completed';
}

export interface VideoRecording {
  id: string;
  blob: Blob;
  duration: number;
  startTime: Date;
  associatedText: string;
  recognizedSigns: SignRecognitionResult[];
}

export interface StreamingMessage {
  type: 'video-frame' | 'sign-recognition' | 'text-update' | 'session-control';
  timestamp: number;
  sessionId: string;
  data: unknown;
}

/**
 * Service principal pour l'apprentissage vidéo LSF
 */
export class VideoLearningBridge {
  private logger = LoggerFactory.getLogger('VideoLearningBridge');
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private websocket: WebSocket | null = null;
  private signRecognitionWorker: Worker | null = null;
  private isInitialized = false;
  
  // Cache des sessions et données
  private currentSession: LearningSession | null = null;
  private recordingChunks: Blob[] = [];
  private signRecognitionBuffer: SignRecognitionResult[] = [];
  
  // Configuration par défaut
  private defaultVideoConfig: VideoStreamConfig = {
    width: 1280,
    height: 720,
    frameRate: 30,
    facingMode: 'user',
    enableAudio: true
  };

  constructor(private websocketUrl: string = 'ws://localhost:8080/video-learning') {
    this.initializeServices();
  }

  /**
   * Initialise tous les services vidéo et IA
   */
  private async initializeServices(): Promise<void> {
    try {
      // Vérifier le support WebRTC
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC non supporté par ce navigateur');
      }

      // Initialiser le worker pour la reconnaissance de signes
      this.initializeSignRecognitionWorker();

      // Se connecter au serveur WebSocket
      await this.connectWebSocket();

      this.isInitialized = true;
      this.logger.info('✅ VideoLearningBridge initialisé');

    } catch (error) {
      this.logger.error('Erreur initialisation VideoLearningBridge:', error);
      throw error;
    }
  }

  /**
   * Démarre une session d'apprentissage vidéo
   */
  async startLearningSession(config: {
    teacherId: string;
    studentId?: string;
    topic: string;
    targetLevel: string;
    videoConfig?: Partial<VideoStreamConfig>;
  }): Promise<LearningSession> {
    this.validateInitialization();

    try {
      // Créer la session
      const session: LearningSession = {
        sessionId: `video_session_${Date.now()}`,
        teacherId: config.teacherId,
        studentId: config.studentId,
        startTime: new Date(),
        topic: config.topic,
        targetLevel: config.targetLevel,
        recordings: [],
        textSignAssociations: [],
        status: 'preparing'
      };

      // Démarrer la capture vidéo
      const videoConfig = { ...this.defaultVideoConfig, ...config.videoConfig };
      await this.startVideoCapture(videoConfig);

      session.videoStream = this.mediaStream;
      session.status = 'active';
      this.currentSession = session;

      // Notifier le serveur
      this.sendWebSocketMessage({
        type: 'session-control',
        timestamp: Date.now(),
        sessionId: session.sessionId,
        data: { action: 'start', session }
      });

      this.logger.info('Session d\'apprentissage vidéo démarrée', { 
        sessionId: session.sessionId,
        topic: config.topic 
      });

      return session;

    } catch (error) {
      this.logger.error('Erreur démarrage session vidéo:', error);
      throw error;
    }
  }

  /**
   * Démarre la capture vidéo avec configuration
   */
  private async startVideoCapture(config: VideoStreamConfig): Promise<void> {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: config.width },
          height: { ideal: config.height },
          frameRate: { ideal: config.frameRate },
          facingMode: config.facingMode
        },
        audio: config.enableAudio
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Configurer l'enregistrement
      this.setupMediaRecorder();
      
      // Démarrer la reconnaissance de signes en temps réel
      this.startRealtimeSignRecognition();

      this.logger.info('Capture vidéo démarrée', { config });

    } catch (error) {
      this.logger.error('Erreur capture vidéo:', error);
      throw new Error(`Impossible d'accéder à la caméra: ${error}`);
    }
  }

  /**
   * Configure l'enregistreur média
   */
  private setupMediaRecorder(): void {
    if (!this.mediaStream) return;

    try {
      // Utiliser le codec le plus compatible
      const options = { mimeType: 'video/webm;codecs=vp9' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
      }

      this.mediaRecorder = new MediaRecorder(this.mediaStream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordingChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.handleRecordingComplete();
      };

      this.logger.info('MediaRecorder configuré', { mimeType: options.mimeType });

    } catch (error) {
      this.logger.error('Erreur configuration MediaRecorder:', error);
    }
  }

  /**
   * Démarre la reconnaissance de signes en temps réel
   */
  private startRealtimeSignRecognition(): void {
    if (!this.mediaStream || !this.signRecognitionWorker) return;

    // Créer un canvas pour capturer les frames
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) return;

    video.srcObject = this.mediaStream;
    video.play();

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Traiter les frames à intervalles réguliers
      const processFrame = () => {
        if (this.currentSession?.status !== 'active') return;

        context.drawImage(video, 0, 0);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Envoyer au worker pour reconnaissance
        this.signRecognitionWorker?.postMessage({
          type: 'process-frame',
          imageData: imageData.data,
          width: canvas.width,
          height: canvas.height,
          timestamp: Date.now()
        });

        setTimeout(processFrame, 100); // 10 FPS pour la reconnaissance
      };

      processFrame();
    };
  }

  /**
   * Initialise le worker de reconnaissance de signes
   */
  private initializeSignRecognitionWorker(): void {
    try {
      // Créer le worker inline pour éviter les problèmes de chemin
      const workerScript = `
        // Worker pour la reconnaissance de signes LSF
        let handPoseModel = null;
        let signClassifier = null;

        self.onmessage = async function(e) {
          const { type, imageData, width, height, timestamp } = e.data;
          
          if (type === 'process-frame') {
            try {
              // Simuler la reconnaissance de signes
              // En production, utiliser TensorFlow.js ou MediaPipe
              const mockResult = {
                signId: 'sign_' + Math.random().toString(36).substr(2, 9),
                signName: ['bonjour', 'merci', 'au revoir', 'oui', 'non'][Math.floor(Math.random() * 5)],
                confidence: 0.7 + Math.random() * 0.3,
                timestamp,
                handPoses: [{
                  landmarks: Array.from({length: 21}, () => [Math.random(), Math.random()]),
                  confidence: 0.8,
                  handedness: Math.random() > 0.5 ? 'Right' : 'Left',
                  boundingBox: {
                    x: Math.random() * 0.5,
                    y: Math.random() * 0.5,
                    width: 0.2 + Math.random() * 0.3,
                    height: 0.2 + Math.random() * 0.3
                  }
                }],
                description: 'Signe détecté avec les mains',
                category: 'word'
              };

              self.postMessage({
                type: 'sign-recognized',
                result: mockResult
              });

            } catch (error) {
              self.postMessage({
                type: 'error',
                error: error.message
              });
            }
          }
        };
      `;

      const blob = new Blob([workerScript], { type: 'application/javascript' });
      this.signRecognitionWorker = new Worker(URL.createObjectURL(blob));

      this.signRecognitionWorker.onmessage = (e) => {
        const { type, result, error } = e.data;
        
        if (type === 'sign-recognized') {
          this.handleSignRecognized(result);
        } else if (type === 'error') {
          this.logger.error('Erreur reconnaissance de signe:', error);
        }
      };

      this.logger.info('Worker de reconnaissance de signes initialisé');

    } catch (error) {
      this.logger.error('Erreur initialisation worker:', error);
    }
  }

  /**
   * Gère la reconnaissance d'un signe
   */
  private handleSignRecognized(result: SignRecognitionResult): void {
    if (!this.currentSession) return;

    // Ajouter au buffer de reconnaissance
    this.signRecognitionBuffer.push(result);

    // Garder seulement les 10 derniers signes
    if (this.signRecognitionBuffer.length > 10) {
      this.signRecognitionBuffer.shift();
    }

    // Envoyer au serveur pour traitement IA
    this.sendWebSocketMessage({
      type: 'sign-recognition',
      timestamp: result.timestamp,
      sessionId: this.currentSession.sessionId,
      data: result
    });

    this.logger.debug('Signe reconnu', { 
      signName: result.signName, 
      confidence: result.confidence 
    });
  }

  /**
   * Associe du texte aux signes reconnus
   */
  async associateTextWithSigns(
    textSegment: string, 
    startTime: number, 
    endTime: number,
    teacherNotes?: string
  ): Promise<TextSignAssociation> {
    if (!this.currentSession) {
      throw new Error('Aucune session active');
    }

    // Récupérer les signes dans la fenêtre de temps
    const associatedSigns = this.signRecognitionBuffer.filter(sign => 
      sign.timestamp >= startTime && sign.timestamp <= endTime
    );

    const association: TextSignAssociation = {
      textSegment,
      startTime,
      endTime,
      associatedSigns,
      teacherNotes
    };

    this.currentSession.textSignAssociations.push(association);

    // Envoyer au serveur pour apprentissage IA
    this.sendWebSocketMessage({
      type: 'text-update',
      timestamp: Date.now(),
      sessionId: this.currentSession.sessionId,
      data: association
    });

    this.logger.info('Association texte-signe créée', { 
      textSegment, 
      signsCount: associatedSigns.length 
    });

    return association;
  }

  /**
   * Démarre l'enregistrement vidéo
   */
  startRecording(): void {
    if (!this.mediaRecorder) {
      throw new Error('MediaRecorder non initialisé');
    }

    this.recordingChunks = [];
    this.mediaRecorder.start(1000); // Chunk de 1 seconde
    this.logger.info('Enregistrement démarré');
  }

  /**
   * Arrête l'enregistrement vidéo
   */
  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.logger.info('Enregistrement arrêté');
    }
  }

  /**
   * Gère la fin d'un enregistrement
   */
  private handleRecordingComplete(): void {
    if (!this.currentSession || this.recordingChunks.length === 0) return;

    const blob = new Blob(this.recordingChunks, { type: 'video/webm' });
    const recording: VideoRecording = {
      id: `recording_${Date.now()}`,
      blob,
      duration: 0, // À calculer
      startTime: new Date(),
      associatedText: '', // À remplir par l'enseignant
      recognizedSigns: [...this.signRecognitionBuffer]
    };

    this.currentSession.recordings.push(recording);
    this.recordingChunks = [];

    this.logger.info('Enregistrement sauvegardé', { recordingId: recording.id });
  }

  /**
   * Termine la session d'apprentissage
   */
  async endLearningSession(): Promise<void> {
    if (!this.currentSession) return;

    try {
      // Arrêter l'enregistrement si en cours
      this.stopRecording();

      // Arrêter la capture vidéo
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }

      // Mettre à jour le statut
      this.currentSession.status = 'completed';

      // Notifier le serveur
      this.sendWebSocketMessage({
        type: 'session-control',
        timestamp: Date.now(),
        sessionId: this.currentSession.sessionId,
        data: { action: 'end', session: this.currentSession }
      });

      this.logger.info('Session terminée', { 
        sessionId: this.currentSession.sessionId,
        recordingsCount: this.currentSession.recordings.length,
        associationsCount: this.currentSession.textSignAssociations.length
      });

      this.currentSession = null;

    } catch (error) {
      this.logger.error('Erreur fin de session:', error);
    }
  }

  /**
   * Se connecte au serveur WebSocket
   */
  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.websocket = new WebSocket(this.websocketUrl);

      this.websocket.onopen = () => {
        this.logger.info('WebSocket connecté');
        resolve();
      };

      this.websocket.onmessage = (event) => {
        this.handleWebSocketMessage(JSON.parse(event.data));
      };

      this.websocket.onclose = () => {
        this.logger.warn('WebSocket fermé');
        // Tentative de reconnexion
        setTimeout(() => this.connectWebSocket(), 5000);
      };

      this.websocket.onerror = (error) => {
        this.logger.error('Erreur WebSocket:', error);
        reject(error);
      };
    });
  }

  /**
   * Envoie un message via WebSocket
   */
  private sendWebSocketMessage(message: StreamingMessage): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    }
  }

  /**
   * Gère les messages WebSocket reçus
   */
  private handleWebSocketMessage(message: StreamingMessage): void {
    switch (message.type) {
      case 'sign-recognition':
        // Traitement des résultats IA du serveur
        break;
      case 'text-update':
        // Mise à jour des associations texte-signe
        break;
      default:
        this.logger.debug('Message WebSocket reçu', { type: message.type });
    }
  }

  /**
   * Obtient les signes reconnus récents
   */
  getRecentSigns(limit: number = 5): SignRecognitionResult[] {
    return this.signRecognitionBuffer.slice(-limit);
  }

  /**
   * Obtient les associations texte-signe de la session
   */
  getTextSignAssociations(): TextSignAssociation[] {
    return this.currentSession?.textSignAssociations || [];
  }

  /**
   * Valide l'initialisation
   */
  private validateInitialization(): void {
    if (!this.isInitialized) {
      throw new Error('VideoLearningBridge non initialisé');
    }
  }

  /**
   * Vérifie si le service est connecté
   */
  isConnected(): boolean {
    return this.isInitialized && this.websocket?.readyState === WebSocket.OPEN;
  }

  /**
   * Obtient les statistiques de la session
   */
  getSessionStats(): {
    sessionActive: boolean;
    recordingsCount: number;
    signsRecognized: number;
    textAssociations: number;
    streamActive: boolean;
  } {
    return {
      sessionActive: !!this.currentSession && this.currentSession.status === 'active',
      recordingsCount: this.currentSession?.recordings.length || 0,
      signsRecognized: this.signRecognitionBuffer.length,
      textAssociations: this.currentSession?.textSignAssociations.length || 0,
      streamActive: !!this.mediaStream
    };
  }

  /**
   * Nettoie les ressources
   */
  dispose(): void {
    // Arrêter la capture vidéo
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }

    // Fermer WebSocket
    if (this.websocket) {
      this.websocket.close();
    }

    // Terminer le worker
    if (this.signRecognitionWorker) {
      this.signRecognitionWorker.terminate();
    }

    this.currentSession = null;
    this.recordingChunks = [];
    this.signRecognitionBuffer = [];

    this.logger.info('VideoLearningBridge disposé');
  }
}