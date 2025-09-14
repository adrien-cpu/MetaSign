'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AvatarSigningService, type SignKeyframe } from '../services/AvatarSigningService';

export interface AvatarSigningState {
  isInitialized: boolean;
  isPlaying: boolean;
  currentSign: string | null;
  currentKeyframe: SignKeyframe | null;
  emotional: 'neutral' | 'happy' | 'confused' | 'excited' | 'focused';
  error: string | null;
  availableSigns: string[];
}

export interface AvatarSigningControls {
  playSign: (signName: string) => Promise<void>;
  playSignSequence: (signs: string[], delayMs?: number) => Promise<void>;
  setEmotional: (emotional: AvatarSigningState['emotional']) => void;
  stopCurrent: () => void;
  resetToNeutral: () => void;
  initialize: () => Promise<void>;
  getSignInfo: (signName: string) => any | null;
}

export interface AvatarSigningHookReturn extends AvatarSigningState, AvatarSigningControls {}

export const useAvatarSigning = (): AvatarSigningHookReturn => {
  const serviceRef = useRef<AvatarSigningService>(new AvatarSigningService());
  const animationRef = useRef<AsyncIterator<SignKeyframe> | null>(null);
  const isPlayingRef = useRef(false);

  const [state, setState] = useState<AvatarSigningState>({
    isInitialized: false,
    isPlaying: false,
    currentSign: null,
    currentKeyframe: null,
    emotional: 'neutral',
    error: null,
    availableSigns: []
  });

  // Initialisation du service
  const initialize = useCallback(async () => {
    try {
      await serviceRef.current.initialize();
      const signs = serviceRef.current.getAvailableSigns();
      
      setState(prev => ({
        ...prev,
        isInitialized: true,
        availableSigns: signs,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isInitialized: false,
        error: error instanceof Error ? error.message : 'Erreur initialisation'
      }));
    }
  }, []);

  // Auto-initialisation au montage
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Jouer un signe
  const playSign = useCallback(async (signName: string) => {
    if (!state.isInitialized) {
      throw new Error('Service avatar non initialisé');
    }

    if (isPlayingRef.current) {
      console.warn('Animation déjà en cours, arrêt de l\'animation précédente');
      stopCurrent();
    }

    try {
      isPlayingRef.current = true;
      setState(prev => ({
        ...prev,
        isPlaying: true,
        currentSign: signName,
        error: null
      }));

      const animation = serviceRef.current.playSign(signName);
      animationRef.current = animation;

      for await (const keyframe of animation) {
        if (!isPlayingRef.current) break; // Animation interrompue
        
        setState(prev => ({
          ...prev,
          currentKeyframe: keyframe
        }));

        // Pause pour animation fluide
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Animation terminée
      if (isPlayingRef.current) {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          currentSign: null,
          currentKeyframe: null
        }));
        isPlayingRef.current = false;
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        isPlaying: false,
        currentSign: null,
        error: error instanceof Error ? error.message : 'Erreur animation'
      }));
      isPlayingRef.current = false;
    }
  }, [state.isInitialized]);

  // Jouer une séquence de signes
  const playSignSequence = useCallback(async (signs: string[], delayMs: number = 1000) => {
    if (!state.isInitialized) {
      throw new Error('Service avatar non initialisé');
    }

    try {
      for (const signName of signs) {
        if (!isPlayingRef.current) break;
        
        await playSign(signName);
        
        // Pause entre les signes
        if (delayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur séquence'
      }));
    }
  }, [state.isInitialized, playSign]);

  // Changer l'état émotionnel
  const setEmotional = useCallback((emotional: AvatarSigningState['emotional']) => {
    setState(prev => ({
      ...prev,
      emotional
    }));
  }, []);

  // Arrêter l'animation en cours
  const stopCurrent = useCallback(() => {
    isPlayingRef.current = false;
    animationRef.current = null;
    
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentSign: null,
      currentKeyframe: null
    }));
  }, []);

  // Retour à la position neutre
  const resetToNeutral = useCallback(() => {
    stopCurrent();
    setState(prev => ({
      ...prev,
      emotional: 'neutral'
    }));
  }, [stopCurrent]);

  // Obtenir des infos sur un signe
  const getSignInfo = useCallback((signName: string) => {
    if (!state.isInitialized) return null;
    return serviceRef.current.getSignInfo(signName);
  }, [state.isInitialized]);

  // Nettoyage à la destruction
  useEffect(() => {
    return () => {
      stopCurrent();
    };
  }, [stopCurrent]);

  return {
    // État
    ...state,
    
    // Contrôles
    playSign,
    playSignSequence,
    setEmotional,
    stopCurrent,
    resetToNeutral,
    initialize,
    getSignInfo
  };
};