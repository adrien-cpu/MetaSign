/**
 * @file useLearningSession.ts
 * @description Hook spécialisé pour la gestion des sessions d'apprentissage
 * @author MetaSign Team
 * @version 1.0.0
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useLearningService } from './useLearningService';
import type { LearningSessionConfig, LearningSessionData } from '../services/LearningServiceBridge';

interface SessionTimer {
  startTime: Date | null;
  pauseTime: Date | null;
  totalPausedTime: number;
  isRunning: boolean;
  elapsedTime: number;
}

interface SessionProgress {
  exercisesCompleted: number;
  totalExercises: number;
  currentScore: number;
  averageScore: number;
  timeElapsed: number;
  percentComplete: number;
  estimatedTimeRemaining: number;
}

interface SessionState {
  session: LearningSessionData | null;
  timer: SessionTimer;
  progress: SessionProgress;
  isPaused: boolean;
  isLoading: boolean;
  error: string | null;
}

interface SessionActions {
  startSession: (config: LearningSessionConfig) => Promise<LearningSessionData>;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => Promise<void>;
  updateProgress: (exercisesCompleted: number, score: number) => void;
  extendSession: (additionalMinutes: number) => void;
}

export const useLearningSession = () => {
  const learningService = useLearningService();
  
  const [state, setState] = useState<SessionState>({
    session: null,
    timer: {
      startTime: null,
      pauseTime: null,
      totalPausedTime: 0,
      isRunning: false,
      elapsedTime: 0
    },
    progress: {
      exercisesCompleted: 0,
      totalExercises: 0,
      currentScore: 0,
      averageScore: 0,
      timeElapsed: 0,
      percentComplete: 0,
      estimatedTimeRemaining: 0
    },
    isPaused: false,
    isLoading: false,
    error: null
  });

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const exerciseTimesRef = useRef<number[]>([]);

  /**
   * Met à jour le timer en temps réel
   */
  const updateTimer = useCallback(() => {
    setState(prev => {
      if (!prev.timer.isRunning || !prev.timer.startTime) {
        return prev;
      }

      const now = new Date();
      const elapsedTime = now.getTime() - prev.timer.startTime.getTime() - prev.timer.totalPausedTime;

      return {
        ...prev,
        timer: {
          ...prev.timer,
          elapsedTime
        },
        progress: {
          ...prev.progress,
          timeElapsed: elapsedTime
        }
      };
    });
  }, []);

  /**
   * Démarre ou reprend le timer
   */
  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    timerIntervalRef.current = setInterval(updateTimer, 1000);
  }, [updateTimer]);

  /**
   * Arrête le timer
   */
  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  /**
   * Démarre une nouvelle session d'apprentissage
   */
  const startSession = useCallback(async (config: LearningSessionConfig): Promise<LearningSessionData> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Arrêter toute session précédente
      if (state.session && state.timer.isRunning) {
        await learningService.endSession(state.session.id);
      }

      const session = await learningService.createSession(config);
      const now = new Date();

      setState(prev => ({
        ...prev,
        session,
        timer: {
          startTime: now,
          pauseTime: null,
          totalPausedTime: 0,
          isRunning: true,
          elapsedTime: 0
        },
        progress: {
          exercisesCompleted: 0,
          totalExercises: session.progress.totalExercises,
          currentScore: 0,
          averageScore: 0,
          timeElapsed: 0,
          percentComplete: 0,
          estimatedTimeRemaining: config.duration || 1800000 // 30 min par défaut
        },
        isPaused: false
      }));

      // Démarrer le timer
      startTimer();
      
      // Réinitialiser les temps d'exercices
      exerciseTimesRef.current = [];

      return session;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de création de session';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw err;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.session, state.timer.isRunning, learningService, startTimer]);

  /**
   * Met en pause la session
   */
  const pauseSession = useCallback(() => {
    if (!state.timer.isRunning) return;

    const now = new Date();
    setState(prev => ({
      ...prev,
      timer: {
        ...prev.timer,
        pauseTime: now,
        isRunning: false
      },
      isPaused: true
    }));

    stopTimer();
  }, [state.timer.isRunning, stopTimer]);

  /**
   * Reprend la session
   */
  const resumeSession = useCallback(() => {
    if (state.timer.isRunning || !state.timer.pauseTime) return;

    const now = new Date();
    const pauseDuration = now.getTime() - state.timer.pauseTime.getTime();

    setState(prev => ({
      ...prev,
      timer: {
        ...prev.timer,
        pauseTime: null,
        totalPausedTime: prev.timer.totalPausedTime + pauseDuration,
        isRunning: true
      },
      isPaused: false
    }));

    startTimer();
  }, [state.timer.isRunning, state.timer.pauseTime, startTimer]);

  /**
   * Termine la session
   */
  const endSession = useCallback(async () => {
    if (!state.session) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await learningService.endSession(state.session.id);

      setState(prev => ({
        ...prev,
        session: null,
        timer: {
          startTime: null,
          pauseTime: null,
          totalPausedTime: 0,
          isRunning: false,
          elapsedTime: 0
        },
        isPaused: false
      }));

      stopTimer();
      exerciseTimesRef.current = [];

    } catch (err) {
      console.warn('Erreur lors de la fermeture de session:', err);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.session, learningService, stopTimer]);

  /**
   * Met à jour les progrès de la session
   */
  const updateProgress = useCallback((exercisesCompleted: number, score: number) => {
    if (!state.session) return;

    const exerciseTime = state.timer.elapsedTime - (exerciseTimesRef.current.reduce((sum, time) => sum + time, 0));
    exerciseTimesRef.current.push(exerciseTime);

    setState(prev => {
      const newExercisesCompleted = Math.max(prev.progress.exercisesCompleted, exercisesCompleted);
      const percentComplete = prev.progress.totalExercises > 0 
        ? (newExercisesCompleted / prev.progress.totalExercises) * 100
        : 0;

      // Calculer le score moyen
      const totalScore = (prev.progress.averageScore * prev.progress.exercisesCompleted) + score;
      const averageScore = newExercisesCompleted > 0 ? totalScore / newExercisesCompleted : 0;

      // Estimer le temps restant basé sur la vitesse actuelle
      const avgTimePerExercise = exerciseTimesRef.current.length > 0
        ? exerciseTimesRef.current.reduce((sum, time) => sum + time, 0) / exerciseTimesRef.current.length
        : 60000; // 1 minute par défaut
      
      const exercisesRemaining = prev.progress.totalExercises - newExercisesCompleted;
      const estimatedTimeRemaining = exercisesRemaining * avgTimePerExercise;

      return {
        ...prev,
        progress: {
          ...prev.progress,
          exercisesCompleted: newExercisesCompleted,
          currentScore: score,
          averageScore,
          percentComplete,
          estimatedTimeRemaining
        }
      };
    });
  }, [state.session, state.timer.elapsedTime]);

  /**
   * Étend la durée de la session
   */
  const extendSession = useCallback((additionalMinutes: number) => {
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        estimatedTimeRemaining: prev.progress.estimatedTimeRemaining + (additionalMinutes * 60 * 1000)
      }
    }));
  }, []);

  /**
   * Formate le temps écoulé en format lisible
   */
  const getFormattedElapsedTime = useCallback((): string => {
    const totalSeconds = Math.floor(state.timer.elapsedTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [state.timer.elapsedTime]);

  /**
   * Formate le temps restant estimé
   */
  const getFormattedTimeRemaining = useCallback((): string => {
    const totalSeconds = Math.floor(state.progress.estimatedTimeRemaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [state.progress.estimatedTimeRemaining]);

  /**
   * Vérifie si la session approche de la fin
   */
  const isNearingEnd = useCallback((): boolean => {
    return state.progress.percentComplete > 80 || state.progress.estimatedTimeRemaining < 300000; // 5 minutes
  }, [state.progress.percentComplete, state.progress.estimatedTimeRemaining]);

  /**
   * Obtient les statistiques de performance
   */
  const getPerformanceStats = useCallback(() => {
    if (exerciseTimesRef.current.length === 0) return null;

    const times = exerciseTimesRef.current;
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const fastestTime = Math.min(...times);
    const slowestTime = Math.max(...times);

    return {
      averageTimePerExercise: Math.round(avgTime / 1000), // en secondes
      fastestExercise: Math.round(fastestTime / 1000),
      slowestExercise: Math.round(slowestTime / 1000),
      totalExercises: times.length,
      currentPace: state.progress.averageScore > 0.7 ? 'good' : state.progress.averageScore > 0.4 ? 'moderate' : 'slow'
    };
  }, [state.progress.averageScore]);

  /**
   * Nettoie l'erreur
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const actions: SessionActions = {
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    updateProgress,
    extendSession
  };

  return {
    // État
    ...state,
    
    // Actions
    ...actions,
    
    // Utilitaires
    getFormattedElapsedTime,
    getFormattedTimeRemaining,
    isNearingEnd,
    getPerformanceStats,
    clearError,
    
    // État calculé
    isActive: !!state.session && state.timer.isRunning,
    
    // État du service parent
    isServiceConnected: learningService.isConnected,
    serviceError: learningService.error
  };
};