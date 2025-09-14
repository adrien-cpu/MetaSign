/**
 * @file useVideoLearning.ts
 * @description Hook React pour l'apprentissage LSF multimodal avec vidéo
 * @author MetaSign Team
 * @version 1.0.0
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  VideoLearningBridge,
  type LearningSession,
  type VideoStreamConfig,
  type SignRecognitionResult,
  type TextSignAssociation,
  type VideoRecording
} from '../services/VideoLearningBridge';

interface VideoLearningState {
  isInitialized: boolean;
  isConnected: boolean;
  currentSession: LearningSession | null;
  isRecording: boolean;
  isStreaming: boolean;
  error: string | null;
  
  // Données temps réel
  recentSigns: SignRecognitionResult[];
  textAssociations: TextSignAssociation[];
  recordings: VideoRecording[];
  
  // Statistiques
  stats: {
    signsRecognized: number;
    recordingsCount: number;
    sessionDuration: number;
  };
}

interface VideoPermissions {
  camera: boolean;
  microphone: boolean;
  checked: boolean;
}

interface TeacherControls {
  startSession: (config: {
    teacherId: string;
    topic: string;
    targetLevel: string;
    videoConfig?: Partial<VideoStreamConfig>;
  }) => Promise<LearningSession>;
  
  endSession: () => Promise<void>;
  startRecording: () => void;
  stopRecording: () => void;
  
  // Association texte-signe
  associateTextWithSigns: (
    text: string,
    startTime?: number,
    endTime?: number,
    notes?: string
  ) => Promise<TextSignAssociation>;
  
  // Contrôles de flux
  pauseStream: () => void;
  resumeStream: () => void;
}

export const useVideoLearning = (websocketUrl?: string) => {
  // État principal
  const [state, setState] = useState<VideoLearningState>({
    isInitialized: false,
    isConnected: false,
    currentSession: null,
    isRecording: false,
    isStreaming: false,
    error: null,
    recentSigns: [],
    textAssociations: [],
    recordings: [],
    stats: {
      signsRecognized: 0,
      recordingsCount: 0,
      sessionDuration: 0
    }
  });

  const [permissions, setPermissions] = useState<VideoPermissions>({
    camera: false,
    microphone: false,
    checked: false
  });

  // Références
  const bridgeRef = useRef<VideoLearningBridge | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTimeRef = useRef<number>(0);

  /**
   * Initialise le service vidéo
   */
  const initializeVideoLearning = useCallback(async () => {
    setState(prev => ({ ...prev, error: null }));

    try {
      // Créer le bridge
      bridgeRef.current = new VideoLearningBridge(websocketUrl);
      
      // Attendre l'initialisation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setState(prev => ({
        ...prev,
        isInitialized: true,
        isConnected: bridgeRef.current?.isConnected() || false
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'initialisation';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [websocketUrl]);

  /**
   * Vérifie les permissions caméra/micro
   */
  const checkPermissions = useCallback(async () => {
    try {
      const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
      const micPermissions = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      
      setPermissions({
        camera: permissions.state === 'granted',
        microphone: micPermissions.state === 'granted',
        checked: true
      });

      return {
        camera: permissions.state === 'granted',
        microphone: micPermissions.state === 'granted'
      };

    } catch (error) {
      // Fallback - demander directement les permissions
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach(track => track.stop());
        
        setPermissions({ camera: true, microphone: true, checked: true });
        return { camera: true, microphone: true };
      } catch {
        setPermissions({ camera: false, microphone: false, checked: true });
        return { camera: false, microphone: false };
      }
    }
  }, []);

  /**
   * Démarre une session d'apprentissage vidéo
   */
  const startSession = useCallback(async (config: {
    teacherId: string;
    topic: string;
    targetLevel: string;
    videoConfig?: Partial<VideoStreamConfig>;
  }) => {
    if (!bridgeRef.current) {
      throw new Error('Service vidéo non initialisé');
    }

    setState(prev => ({ ...prev, error: null }));

    try {
      const session = await bridgeRef.current.startLearningSession({
        ...config,
        studentId: 'coda_ai' // IA apprenante
      });

      sessionStartTimeRef.current = Date.now();
      
      setState(prev => ({
        ...prev,
        currentSession: session,
        isStreaming: true
      }));

      // Démarrer les mises à jour temps réel
      startRealtimeUpdates();

      return session;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de démarrage';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  /**
   * Termine la session
   */
  const endSession = useCallback(async () => {
    if (!bridgeRef.current) return;

    try {
      await bridgeRef.current.endLearningSession();
      
      setState(prev => ({
        ...prev,
        currentSession: null,
        isStreaming: false,
        isRecording: false
      }));

      stopRealtimeUpdates();

    } catch (error) {
      console.error('Erreur fin de session:', error);
    }
  }, []);

  /**
   * Démarre l'enregistrement
   */
  const startRecording = useCallback(() => {
    if (!bridgeRef.current) return;

    try {
      bridgeRef.current.startRecording();
      setState(prev => ({ ...prev, isRecording: true }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'enregistrement';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  }, []);

  /**
   * Arrête l'enregistrement
   */
  const stopRecording = useCallback(() => {
    if (!bridgeRef.current) return;

    try {
      bridgeRef.current.stopRecording();
      setState(prev => ({ ...prev, isRecording: false }));
    } catch (error) {
      console.error('Erreur arrêt enregistrement:', error);
    }
  }, []);

  /**
   * Associe du texte aux signes
   */
  const associateTextWithSigns = useCallback(async (
    text: string,
    startTime?: number,
    endTime?: number,
    notes?: string
  ) => {
    if (!bridgeRef.current) {
      throw new Error('Service vidéo non initialisé');
    }

    const now = Date.now();
    const association = await bridgeRef.current.associateTextWithSigns(
      text,
      startTime || (now - 5000), // 5 secondes avant par défaut
      endTime || now,
      notes
    );

    // Mettre à jour l'état local
    setState(prev => ({
      ...prev,
      textAssociations: [...prev.textAssociations, association]
    }));

    return association;
  }, []);

  /**
   * Attache le flux vidéo à un élément
   */
  const attachVideoToElement = useCallback((videoElement: HTMLVideoElement) => {
    videoElementRef.current = videoElement;
    
    if (state.currentSession?.videoStream) {
      videoElement.srcObject = state.currentSession.videoStream;
      videoElement.play().catch(console.error);
    }
  }, [state.currentSession?.videoStream]);

  /**
   * Démarre les mises à jour temps réel
   */
  const startRealtimeUpdates = useCallback(() => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }

    updateIntervalRef.current = setInterval(() => {
      if (!bridgeRef.current) return;

      // Récupérer les données mises à jour
      const recentSigns = bridgeRef.current.getRecentSigns(10);
      const textAssociations = bridgeRef.current.getTextSignAssociations();
      const stats = bridgeRef.current.getSessionStats();
      const sessionDuration = sessionStartTimeRef.current 
        ? Math.floor((Date.now() - sessionStartTimeRef.current) / 1000)
        : 0;

      setState(prev => ({
        ...prev,
        recentSigns,
        textAssociations,
        stats: {
          signsRecognized: stats.signsRecognized,
          recordingsCount: stats.recordingsCount,
          sessionDuration
        },
        isConnected: bridgeRef.current?.isConnected() || false
      }));

    }, 1000); // Mise à jour chaque seconde
  }, []);

  /**
   * Arrête les mises à jour temps réel
   */
  const stopRealtimeUpdates = useCallback(() => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  }, []);

  /**
   * Obtient les signes par catégorie
   */
  const getSignsByCategory = useCallback(() => {
    const categories = {
      letters: state.recentSigns.filter(s => s.category === 'letter'),
      words: state.recentSigns.filter(s => s.category === 'word'),
      phrases: state.recentSigns.filter(s => s.category === 'phrase'),
      numbers: state.recentSigns.filter(s => s.category === 'number')
    };

    return categories;
  }, [state.recentSigns]);

  /**
   * Obtient les statistiques détaillées
   */
  const getDetailedStats = useCallback(() => {
    const signsByCategory = getSignsByCategory();
    const avgConfidence = state.recentSigns.length > 0
      ? state.recentSigns.reduce((sum, sign) => sum + sign.confidence, 0) / state.recentSigns.length
      : 0;

    return {
      ...state.stats,
      signsByCategory: Object.fromEntries(
        Object.entries(signsByCategory).map(([key, signs]) => [key, signs.length])
      ),
      averageConfidence: Math.round(avgConfidence * 100) / 100,
      textSignRatio: state.textAssociations.length > 0 
        ? state.stats.signsRecognized / state.textAssociations.length
        : 0
    };
  }, [state.recentSigns, state.stats, state.textAssociations, getSignsByCategory]);

  /**
   * Formate la durée de session
   */
  const getFormattedDuration = useCallback(() => {
    const duration = state.stats.sessionDuration;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [state.stats.sessionDuration]);

  /**
   * Nettoie l'erreur
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Initialisation automatique
  useEffect(() => {
    initializeVideoLearning();
    checkPermissions();
    
    return () => {
      stopRealtimeUpdates();
      if (bridgeRef.current) {
        bridgeRef.current.dispose();
      }
    };
  }, [initializeVideoLearning, checkPermissions, stopRealtimeUpdates]);

  // Contrôles pour l'enseignant
  const teacherControls: TeacherControls = {
    startSession,
    endSession,
    startRecording,
    stopRecording,
    associateTextWithSigns,
    pauseStream: () => {
      setState(prev => ({ ...prev, isStreaming: false }));
    },
    resumeStream: () => {
      setState(prev => ({ ...prev, isStreaming: true }));
    }
  };

  return {
    // État
    ...state,
    permissions,
    
    // Contrôles
    ...teacherControls,
    
    // Utilitaires
    attachVideoToElement,
    checkPermissions,
    getSignsByCategory,
    getDetailedStats,
    getFormattedDuration,
    clearError,
    
    // Références
    videoElementRef
  };
};