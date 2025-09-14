/**
 * @file useCODAService.ts
 * @description Hook personnalisé pour intégrer les services CODA existants avec l'UI React
 * Utilise directement CODAServiceBridge au lieu des API dupliquées
 * @author MetaSign Team
 * @version 2.0.0
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { CODAServiceBridge, type CODASessionConfig, type CODAInteractionRequest } from '../services/CODAServiceBridge';

// Types pour l'interface
interface CODAMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  emotionalTone?: string;
  gestureDescription?: string;
}

interface CODASession {
  id: string;
  startTime: Date;
  duration: number;
  interactions: number;
  emotionalState: 'curious' | 'frustrated' | 'excited' | 'focused' | 'tired';
  currentLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  mentorId?: string;
  topic?: string;
}

interface CODAResponse {
  message: string;
  emotionalState: string;
  gestureDescription?: string;
  level: string;
  suggestions?: string[];
}

export const useCODAService = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Référence vers le service bridge
  const bridgeRef = useRef<CODAServiceBridge | null>(null);
  const maxRetries = 3;
  
  // Cache des sessions et métriques
  const sessionCacheRef = useRef<Map<string, any>>(new Map());
  const metricsCacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());

  // Initialise le service bridge avec retry automatique
  const initializeBridge = useCallback(async () => {
    if (!bridgeRef.current) {
      bridgeRef.current = new CODAServiceBridge();
    }
    
    // Attendre un peu pour que l'initialisation se termine
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const connected = bridgeRef.current.isConnected();
    setIsConnected(connected);
    
    if (!connected && retryCount < maxRetries) {
      setError(`Tentative de connexion ${retryCount + 1}/${maxRetries}...`);
      setRetryCount(prev => prev + 1);
      // Retry avec backoff exponentiel
      setTimeout(() => initializeBridge(), 2000 * (retryCount + 1));
    } else if (!connected) {
      setError('Mode simulation activé - Services CODA non disponibles');
    } else {
      setError(null);
      setRetryCount(0);
    }
  }, [retryCount, maxRetries]);
  
  useEffect(() => {
    initializeBridge();
  }, [initializeBridge]);

  /**
   * Initialise une session CODA via le service bridge
   */
  const initializeSession = useCallback(async (config: {
    level: string;
    personality: string;
    mentorId?: string;
  }): Promise<CODASession> => {
    if (!bridgeRef.current) {
      throw new Error('Service bridge non initialisé');
    }

    setIsLoading(true);
    setError(null);

    try {
      const sessionConfig: CODASessionConfig = {
        targetLevel: config.level,
        personalityType: config.personality,
        mentorId: config.mentorId || 'default_mentor',
        topic: 'Session LSF'
      };

      const sessionData = await bridgeRef.current.createSession(sessionConfig);
      
      const session: CODASession = {
        id: sessionData.id,
        startTime: sessionData.startTime,
        duration: 0,
        interactions: sessionData.interactions,
        emotionalState: sessionData.emotionalState as any,
        currentLevel: sessionData.currentLevel as any,
        mentorId: sessionData.mentorId,
        topic: 'Session LSF'
      };

      setIsConnected(bridgeRef.current.isConnected());
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Envoie un message à l'IA CODA via le service bridge
   */
  const sendMessage = useCallback(async (
    sessionId: string, 
    message: string
  ): Promise<CODAResponse> => {
    if (!bridgeRef.current) {
      throw new Error('Service bridge non initialisé');
    }

    setIsLoading(true);
    setError(null);

    try {
      const interactionRequest: CODAInteractionRequest = {
        sessionId,
        message,
        timestamp: new Date()
      };

      const aiResponse = await bridgeRef.current.sendInteraction(interactionRequest);
      
      return {
        message: aiResponse.content,
        emotionalState: aiResponse.emotionalState,
        gestureDescription: aiResponse.gestureDescription,
        level: aiResponse.currentLevel,
        suggestions: aiResponse.suggestions || []
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Termine une session CODA via le service bridge
   */
  const endSession = useCallback(async (sessionId: string): Promise<void> => {
    if (!bridgeRef.current) {
      return;
    }

    setIsLoading(true);
    
    try {
      await bridgeRef.current.endSession(sessionId);
    } catch (err) {
      console.warn('Erreur lors de la fermeture de session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Met à jour l'état émotionnel de l'IA avec validation
   */
  const updateEmotionalState = useCallback(async (
    sessionId: string, 
    newState: string
  ): Promise<void> => {
    if (!sessionId?.trim()) {
      console.warn('sessionId requis pour mise à jour émotionnelle');
      return;
    }
    
    if (!newState?.trim()) {
      console.warn('newState requis pour mise à jour émotionnelle');
      return;
    }
    
    try {
      const response = await fetch(`/api/coda/session/${encodeURIComponent(sessionId.trim())}/emotion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotionalState: newState.trim() })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`Erreur API mise à jour émotionnelle ${response.status}:`, errorData.error);
      }
    } catch (err) {
      console.warn('Erreur lors de la mise à jour émotionnelle:', err);
    }
  }, []);

  /**
   * Récupère les métriques de session avec cache local
   */
  const getSessionMetrics = useCallback(async (sessionId: string) => {
    if (!sessionId?.trim()) {
      throw new Error('sessionId requis');
    }
    
    if (!bridgeRef.current) {
      throw new Error('Service bridge non initialisé');
    }
    
    const cacheKey = `metrics_${sessionId.trim()}`;
    const cached = metricsCacheRef.current.get(cacheKey);
    const cacheExpiry = 30000; // 30 secondes
    
    if (cached && (Date.now() - cached.timestamp) < cacheExpiry) {
      return cached.data;
    }
    
    try {
      const metrics = await bridgeRef.current.getSessionMetrics(sessionId.trim());
      metricsCacheRef.current.set(cacheKey, {
        data: metrics,
        timestamp: Date.now()
      });
      return metrics;
    } catch (err) {
      console.warn('Erreur récupération métriques:', err);
      throw err;
    }
  }, []);

  /**
   * Nettoie le cache des sessions et métriques
   */
  const clearCache = useCallback(() => {
    sessionCacheRef.current.clear();
    metricsCacheRef.current.clear();
  }, []);

  /**
   * Force la reconnexion au service bridge
   */
  const forceReconnect = useCallback(async (): Promise<boolean> => {
    if (!bridgeRef.current) {
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const reconnected = await bridgeRef.current.reconnect();
      setIsConnected(reconnected);
      
      if (reconnected) {
        setRetryCount(0);
        setError(null);
      } else {
        setError('Reconnexion échouée - Mode simulation');
      }
      
      return reconnected;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur reconnexion';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // État
    isConnected,
    isLoading,
    error,
    retryCount,
    
    // Actions principales
    initializeSession,
    sendMessage,
    endSession,
    updateEmotionalState,
    
    // Nouvelles fonctionnalités
    getSessionMetrics,
    forceReconnect,
    clearCache,
    
    // Utilitaires
    clearError: () => setError(null)
  };
};