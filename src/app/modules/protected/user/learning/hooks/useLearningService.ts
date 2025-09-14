/**
 * @file useLearningService.ts
 * @description Hook React principal pour intégrer tous les services d'apprentissage
 * @author MetaSign Team
 * @version 1.0.0
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  LearningServiceBridge, 
  type ExerciseRequest, 
  type ExerciseResponse,
  type EvaluationRequest,
  type EvaluationResponse,
  type LearningSessionConfig,
  type LearningSessionData,
  type UserLearningProfile,
  type LearningServiceConfig
} from '../services/LearningServiceBridge';

// Types pour l'interface du hook
interface LearningState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  currentSession: LearningSessionData | null;
  userProfile: UserLearningProfile | null;
}

interface LearningActions {
  // Exercices
  generateExercise: (request: ExerciseRequest) => Promise<ExerciseResponse>;
  evaluateResponse: (request: EvaluationRequest) => Promise<EvaluationResponse>;
  
  // Sessions
  createSession: (config: LearningSessionConfig) => Promise<LearningSessionData>;
  endSession: (sessionId?: string) => Promise<void>;
  
  // Profil utilisateur
  getUserProfile: (userId: string) => Promise<UserLearningProfile | null>;
  refreshProfile: (userId: string) => Promise<void>;
  
  // Utilitaires
  reconnect: () => Promise<boolean>;
  clearError: () => void;
  clearCache: () => void;
}

interface LearningServiceStats {
  isInitialized: boolean;
  retryCount: number;
  config: LearningServiceConfig;
  eventHandlerStats?: any;
}

export const useLearningService = (config?: Partial<LearningServiceConfig>) => {
  // État principal
  const [state, setState] = useState<LearningState>({
    isConnected: false,
    isLoading: false,
    error: null,
    retryCount: 0,
    currentSession: null,
    userProfile: null
  });

  // Référence vers le service bridge
  const bridgeRef = useRef<LearningServiceBridge | null>(null);
  const maxRetries = 3;

  // Cache des données
  const profileCacheRef = useRef<Map<string, { data: UserLearningProfile; timestamp: number }>>(new Map());
  const exerciseCacheRef = useRef<Map<string, { data: ExerciseResponse; timestamp: number }>>(new Map());

  // Initialise le service bridge avec retry automatique
  const initializeBridge = useCallback(async () => {
    if (!bridgeRef.current) {
      bridgeRef.current = new LearningServiceBridge(config);
    }

    // Attendre l'initialisation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const connected = bridgeRef.current.isConnected();
    
    setState(prev => ({
      ...prev,
      isConnected: connected,
      error: connected ? null : `Tentative de connexion ${prev.retryCount + 1}/${maxRetries}...`
    }));

    if (!connected && state.retryCount < maxRetries) {
      setState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
      // Retry avec backoff exponentiel
      setTimeout(() => initializeBridge(), 3000 * (state.retryCount + 1));
    } else if (!connected) {
      setState(prev => ({
        ...prev,
        error: 'Mode simulation activé - Services d\'apprentissage non disponibles'
      }));
    } else {
      setState(prev => ({
        ...prev,
        error: null,
        retryCount: 0
      }));
    }
  }, [config, state.retryCount, maxRetries]);

  useEffect(() => {
    initializeBridge();
    
    // Cleanup function
    return () => {
      if (bridgeRef.current) {
        bridgeRef.current.dispose();
        bridgeRef.current = null;
      }
    };
  }, [initializeBridge]);

  /**
   * Génère un exercice avec cache et validation
   */
  const generateExercise = useCallback(async (request: ExerciseRequest): Promise<ExerciseResponse> => {
    if (!bridgeRef.current) {
      throw new Error('Service bridge non initialisé');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Vérifier le cache
      const cacheKey = `${request.userId}_${request.sessionId}_${request.exerciseType || 'default'}`;
      const cached = exerciseCacheRef.current.get(cacheKey);
      const cacheExpiry = 120000; // 2 minutes

      if (cached && (Date.now() - cached.timestamp) < cacheExpiry) {
        setState(prev => ({ ...prev, isLoading: false }));
        return cached.data;
      }

      const exercise = await bridgeRef.current.generateExercise(request);
      
      // Mettre en cache
      exerciseCacheRef.current.set(cacheKey, {
        data: exercise,
        timestamp: Date.now()
      });

      setState(prev => ({ ...prev, isConnected: true }));
      return exercise;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de génération d\'exercice';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw err;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  /**
   * Évalue une réponse utilisateur
   */
  const evaluateResponse = useCallback(async (request: EvaluationRequest): Promise<EvaluationResponse> => {
    if (!bridgeRef.current) {
      throw new Error('Service bridge non initialisé');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const evaluation = await bridgeRef.current.evaluateResponse(request);
      setState(prev => ({ ...prev, isConnected: true }));
      return evaluation;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur d\'évaluation';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw err;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  /**
   * Crée une nouvelle session d'apprentissage
   */
  const createSession = useCallback(async (sessionConfig: LearningSessionConfig): Promise<LearningSessionData> => {
    if (!bridgeRef.current) {
      throw new Error('Service bridge non initialisé');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const session = await bridgeRef.current.createLearningSession(sessionConfig);
      
      setState(prev => ({
        ...prev,
        currentSession: session,
        isConnected: true
      }));

      return session;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de création de session';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw err;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  /**
   * Termine la session actuelle ou spécifiée
   */
  const endSession = useCallback(async (sessionId?: string): Promise<void> => {
    if (!bridgeRef.current) {
      return;
    }

    const targetSessionId = sessionId || state.currentSession?.id;
    if (!targetSessionId) {
      throw new Error('Aucune session à fermer');
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await bridgeRef.current.endLearningSession(targetSessionId);
      
      setState(prev => ({
        ...prev,
        currentSession: prev.currentSession?.id === targetSessionId ? null : prev.currentSession
      }));

    } catch (err) {
      console.warn('Erreur lors de la fermeture de session:', err);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.currentSession?.id]);

  /**
   * Récupère le profil utilisateur avec cache
   */
  const getUserProfile = useCallback(async (userId: string): Promise<UserLearningProfile | null> => {
    if (!bridgeRef.current) {
      throw new Error('Service bridge non initialisé');
    }

    if (!userId?.trim()) {
      throw new Error('userId est requis');
    }

    // Vérifier le cache
    const cached = profileCacheRef.current.get(userId);
    const cacheExpiry = 300000; // 5 minutes

    if (cached && (Date.now() - cached.timestamp) < cacheExpiry) {
      setState(prev => ({ ...prev, userProfile: cached.data }));
      return cached.data;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const profile = await bridgeRef.current.getUserProfile(userId);
      
      if (profile) {
        // Mettre en cache
        profileCacheRef.current.set(userId, {
          data: profile,
          timestamp: Date.now()
        });

        setState(prev => ({
          ...prev,
          userProfile: profile,
          isConnected: true
        }));
      }

      return profile;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de récupération du profil';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw err;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  /**
   * Actualise le profil utilisateur (force le rechargement)
   */
  const refreshProfile = useCallback(async (userId: string): Promise<void> => {
    profileCacheRef.current.delete(userId);
    await getUserProfile(userId);
  }, [getUserProfile]);

  /**
   * Force la reconnexion aux services
   */
  const reconnect = useCallback(async (): Promise<boolean> => {
    if (!bridgeRef.current) {
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const reconnected = await bridgeRef.current.reconnect();
      
      setState(prev => ({
        ...prev,
        isConnected: reconnected,
        retryCount: 0,
        error: reconnected ? null : 'Reconnexion échouée'
      }));

      return reconnected;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de reconnexion';
      setState(prev => ({ ...prev, error: errorMessage }));
      return false;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  /**
   * Nettoie tous les caches
   */
  const clearCache = useCallback(() => {
    profileCacheRef.current.clear();
    exerciseCacheRef.current.clear();
  }, []);

  /**
   * Nettoie les erreurs
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Obtient les statistiques des services
   */
  const getStats = useCallback((): LearningServiceStats | null => {
    if (!bridgeRef.current) {
      return null;
    }
    return bridgeRef.current.getServiceStatistics();
  }, []);

  // Actions regroupées
  const actions: LearningActions = {
    generateExercise,
    evaluateResponse,
    createSession,
    endSession,
    getUserProfile,
    refreshProfile,
    reconnect,
    clearError,
    clearCache
  };

  return {
    // État
    ...state,
    
    // Actions
    ...actions,
    
    // Utilitaires
    getStats,
    isInitialized: bridgeRef.current?.isConnected() ?? false
  };
};