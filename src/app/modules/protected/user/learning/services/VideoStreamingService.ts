/**
 * @file VideoStreamingService.ts
 * @description Service de streaming vidéo bidirectionnel pour apprentissage LSF
 * @author MetaSign Team
 * @version 1.0.0
 */

import { EventEmitter } from 'events';

export interface StreamParticipant {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  isConnected: boolean;
  stream?: MediaStream;
  peerConnection?: RTCPeerConnection;
}

export interface StreamingRoom {
  id: string;
  name: string;
  teacherId: string;
  participants: Map<string, StreamParticipant>;
  createdAt: Date;
  isActive: boolean;
}

export interface StreamingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join-room' | 'leave-room' | 'stream-start' | 'stream-stop';
  from: string;
  to?: string;
  roomId: string;
  data?: any;
  timestamp: number;
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  videoConstraints: MediaTrackConstraints;
  audioConstraints: MediaTrackConstraints;
}

export class VideoStreamingService extends EventEmitter {
  private ws: WebSocket | null = null;
  private localStream: MediaStream | null = null;
  private rooms: Map<string, StreamingRoom> = new Map();
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private currentRoom: string | null = null;
  private participantId: string;
  private participantRole: 'teacher' | 'student';
  private isConnected: boolean = false;

  private readonly webrtcConfig: WebRTCConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ],
    videoConstraints: {
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
      frameRate: { ideal: 30, max: 60 },
      facingMode: 'user'
    },
    audioConstraints: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  };

  constructor(
    participantId: string,
    participantRole: 'teacher' | 'student',
    wsUrl: string = 'ws://localhost:8080/video-streaming'
  ) {
    super();
    this.participantId = participantId;
    this.participantRole = participantRole;
    this.initializeWebSocket(wsUrl);
  }

  /**
   * Initialise la connexion WebSocket pour la signalisation
   */
  private async initializeWebSocket(wsUrl: string): Promise<void> {
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('📡 WebSocket connecté pour streaming vidéo');
        this.isConnected = true;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const message: StreamingMessage = JSON.parse(event.data);
          this.handleSignalingMessage(message);
        } catch (error) {
          console.error('Erreur parsing message WebSocket:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('📡 WebSocket déconnecté');
        this.isConnected = false;
        this.emit('disconnected');
        
        // Tentative de reconnexion
        setTimeout(() => this.initializeWebSocket(wsUrl), 3000);
      };

      this.ws.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Erreur initialisation WebSocket:', error);
      throw error;
    }
  }

  /**
   * Démarre le streaming local (caméra + micro)
   */
  async startLocalStream(): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        video: this.webrtcConfig.videoConstraints,
        audio: this.webrtcConfig.audioConstraints
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('📹 Stream local démarré:', {
        videoTracks: this.localStream.getVideoTracks().length,
        audioTracks: this.localStream.getAudioTracks().length
      });

      this.emit('local-stream-started', this.localStream);
      return this.localStream;

    } catch (error) {
      console.error('Erreur démarrage stream local:', error);
      throw new Error(`Impossible d'accéder à la caméra: ${error}`);
    }
  }

  /**
   * Arrête le streaming local
   */
  stopLocalStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
      this.emit('local-stream-stopped');
      console.log('📹 Stream local arrêté');
    }
  }

  /**
   * Crée une room de streaming (enseignant)
   */
  async createRoom(roomName: string): Promise<string> {
    if (this.participantRole !== 'teacher') {
      throw new Error('Seul un enseignant peut créer une room');
    }

    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const room: StreamingRoom = {
      id: roomId,
      name: roomName,
      teacherId: this.participantId,
      participants: new Map(),
      createdAt: new Date(),
      isActive: true
    };

    // Ajouter l'enseignant comme participant
    room.participants.set(this.participantId, {
      id: this.participantId,
      name: 'Enseignant',
      role: 'teacher',
      isConnected: true,
      stream: this.localStream || undefined
    });

    this.rooms.set(roomId, room);
    this.currentRoom = roomId;

    // Notifier le serveur
    this.sendSignalingMessage({
      type: 'join-room',
      from: this.participantId,
      roomId,
      data: {
        participantName: 'Enseignant',
        participantRole: 'teacher',
        roomName
      },
      timestamp: Date.now()
    });

    console.log('🏠 Room créée:', roomId);
    this.emit('room-created', { roomId, room });
    return roomId;
  }

  /**
   * Rejoint une room existante (élève)
   */
  async joinRoom(roomId: string, participantName: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('WebSocket non connecté');
    }

    this.currentRoom = roomId;

    // Notifier le serveur
    this.sendSignalingMessage({
      type: 'join-room',
      from: this.participantId,
      roomId,
      data: {
        participantName,
        participantRole: this.participantRole
      },
      timestamp: Date.now()
    });

    console.log('🚪 Tentative de rejoindre room:', roomId);
    this.emit('joining-room', { roomId, participantName });
  }

  /**
   * Quitte la room actuelle
   */
  async leaveRoom(): Promise<void> {
    if (!this.currentRoom) return;

    const roomId = this.currentRoom;

    // Fermer toutes les connexions peer
    this.peerConnections.forEach((pc, peerId) => {
      pc.close();
      this.peerConnections.delete(peerId);
    });

    // Notifier le serveur
    this.sendSignalingMessage({
      type: 'leave-room',
      from: this.participantId,
      roomId,
      data: {},
      timestamp: Date.now()
    });

    this.currentRoom = null;
    console.log('🚪 Room quittée:', roomId);
    this.emit('room-left', { roomId });
  }

  /**
   * Établit une connexion WebRTC avec un participant
   */
  private async createPeerConnection(participantId: string): Promise<RTCPeerConnection> {
    const peerConnection = new RTCPeerConnection({
      iceServers: this.webrtcConfig.iceServers
    });

    // Ajouter le stream local
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Gérer les candidats ICE
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: 'ice-candidate',
          from: this.participantId,
          to: participantId,
          roomId: this.currentRoom!,
          data: event.candidate,
          timestamp: Date.now()
        });
      }
    };

    // Gérer le stream distant
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      console.log('📺 Stream distant reçu de:', participantId);
      this.emit('remote-stream-received', {
        participantId,
        stream: remoteStream
      });
    };

    // Gérer les changements de connexion
    peerConnection.onconnectionstatechange = () => {
      console.log('🔗 État connexion WebRTC avec', participantId, ':', peerConnection.connectionState);
      
      if (peerConnection.connectionState === 'connected') {
        this.emit('peer-connected', { participantId });
      } else if (peerConnection.connectionState === 'disconnected' || peerConnection.connectionState === 'failed') {
        this.emit('peer-disconnected', { participantId });
        this.peerConnections.delete(participantId);
      }
    };

    this.peerConnections.set(participantId, peerConnection);
    return peerConnection;
  }

  /**
   * Gère les messages de signalisation WebSocket
   */
  private async handleSignalingMessage(message: StreamingMessage): Promise<void> {
    console.log('📨 Message signalisation reçu:', message.type, 'de:', message.from);

    try {
      switch (message.type) {
        case 'offer':
          await this.handleOffer(message);
          break;

        case 'answer':
          await this.handleAnswer(message);
          break;

        case 'ice-candidate':
          await this.handleIceCandidate(message);
          break;

        case 'join-room':
          await this.handleParticipantJoined(message);
          break;

        case 'leave-room':
          await this.handleParticipantLeft(message);
          break;

        default:
          console.warn('Type de message non géré:', message.type);
      }
    } catch (error) {
      console.error('Erreur traitement message signalisation:', error);
    }
  }

  /**
   * Gère une offre WebRTC
   */
  private async handleOffer(message: StreamingMessage): Promise<void> {
    const peerConnection = await this.createPeerConnection(message.from);
    
    await peerConnection.setRemoteDescription(new RTCSessionDescription(message.data));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    this.sendSignalingMessage({
      type: 'answer',
      from: this.participantId,
      to: message.from,
      roomId: message.roomId,
      data: answer,
      timestamp: Date.now()
    });
  }

  /**
   * Gère une réponse WebRTC
   */
  private async handleAnswer(message: StreamingMessage): Promise<void> {
    const peerConnection = this.peerConnections.get(message.from);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(message.data));
    }
  }

  /**
   * Gère un candidat ICE
   */
  private async handleIceCandidate(message: StreamingMessage): Promise<void> {
    const peerConnection = this.peerConnections.get(message.from);
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(message.data));
    }
  }

  /**
   * Gère l'arrivée d'un participant
   */
  private async handleParticipantJoined(message: StreamingMessage): Promise<void> {
    if (message.from === this.participantId) return;

    console.log('👤 Participant rejoint:', message.from, message.data);

    // Si on est l'enseignant, initier la connexion
    if (this.participantRole === 'teacher') {
      const peerConnection = await this.createPeerConnection(message.from);
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      this.sendSignalingMessage({
        type: 'offer',
        from: this.participantId,
        to: message.from,
        roomId: message.roomId,
        data: offer,
        timestamp: Date.now()
      });
    }

    this.emit('participant-joined', {
      participantId: message.from,
      participantName: message.data?.participantName,
      participantRole: message.data?.participantRole
    });
  }

  /**
   * Gère le départ d'un participant
   */
  private async handleParticipantLeft(message: StreamingMessage): Promise<void> {
    console.log('👤 Participant parti:', message.from);

    const peerConnection = this.peerConnections.get(message.from);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(message.from);
    }

    this.emit('participant-left', { participantId: message.from });
  }

  /**
   * Envoie un message de signalisation
   */
  private sendSignalingMessage(message: StreamingMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket non ouvert, message non envoyé:', message.type);
    }
  }

  /**
   * Obtient les statistiques de streaming
   */
  async getStreamingStats(): Promise<any> {
    const stats = {
      isConnected: this.isConnected,
      currentRoom: this.currentRoom,
      localStreamActive: !!this.localStream,
      connectedPeers: this.peerConnections.size,
      participants: []
    };

    // Statistiques WebRTC pour chaque peer
    for (const [peerId, pc] of this.peerConnections) {
      try {
        const rtcStats = await pc.getStats();
        stats.participants.push({
          peerId,
          connectionState: pc.connectionState,
          iceConnectionState: pc.iceConnectionState,
          statsCount: rtcStats.size
        });
      } catch (error) {
        console.error('Erreur récupération stats pour', peerId, ':', error);
      }
    }

    return stats;
  }

  /**
   * Nettoie les ressources
   */
  dispose(): void {
    console.log('🧹 Nettoyage VideoStreamingService');

    // Arrêter le stream local
    this.stopLocalStream();

    // Fermer toutes les connexions peer
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();

    // Quitter la room
    if (this.currentRoom) {
      this.leaveRoom().catch(console.error);
    }

    // Fermer WebSocket
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.removeAllListeners();
  }

  // Getters
  get isStreamingConnected(): boolean { return this.isConnected; }
  get currentRoomId(): string | null { return this.currentRoom; }
  get localStreamActive(): boolean { return !!this.localStream; }
  get connectedPeersCount(): number { return this.peerConnections.size; }
}