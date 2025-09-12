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
  
  // Référence vers le service bridge
  const bridgeRef = useRef<CODAServiceBridge | null>(null);

  // Initialise le service bridge
  useEffect(() => {
    if (!bridgeRef.current) {
      bridgeRef.current = new CODAServiceBridge();
      // Vérifier la connexion après un court délai
      setTimeout(() => {
        if (bridgeRef.current) {
          setIsConnected(bridgeRef.current.isConnected());
          if (!bridgeRef.current.isConnected()) {
            setError('Mode simulation activé - Services CODA non disponibles');
          }
        }
      }, 1000);
    }
  }, []);

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
   * Met à jour l'état émotionnel de l'IA
   */
  const updateEmotionalState = useCallback(async (
    sessionId: string, 
    newState: string
  ): Promise<void> => {
    try {
      await fetch(`/api/coda/session/${sessionId}/emotion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotionalState: newState })
      });
    } catch (err) {
      console.warn('Erreur lors de la mise à jour émotionnelle:', err);
    }
  }, []);

  return {
    // État
    isConnected,
    isLoading,
    error,
    
    // Actions
    initializeSession,
    sendMessage,
    endSession,
    updateEmotionalState,
    
    // Utilitaires
    clearError: () => setError(null)
  };
};