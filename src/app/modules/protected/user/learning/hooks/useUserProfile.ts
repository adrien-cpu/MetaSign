/**
 * @file useUserProfile.ts
 * @description Hook spécialisé pour la gestion du profil utilisateur d'apprentissage
 * @author MetaSign Team
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from 'react';
import { useLearningService } from './useLearningService';
import type { UserLearningProfile } from '../services/LearningServiceBridge';

interface ProfileAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextLevelProgress: number;
  estimatedTimeToNextLevel: string;
}

interface ProfileState {
  profile: UserLearningProfile | null;
  analysis: ProfileAnalysis | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const LEVEL_HIERARCHY = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const useUserProfile = (userId: string, autoRefresh: boolean = true) => {
  const learningService = useLearningService();
  
  const [state, setState] = useState<ProfileState>({
    profile: null,
    analysis: null,
    isLoading: false,
    error: null,
    lastUpdated: null
  });

  /**
   * Charge le profil utilisateur
   */
  const loadProfile = useCallback(async (forceRefresh: boolean = false) => {
    if (!userId?.trim()) {
      setState(prev => ({ ...prev, error: 'ID utilisateur requis' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const profile = forceRefresh 
        ? (await learningService.refreshProfile(userId), await learningService.getUserProfile(userId))
        : await learningService.getUserProfile(userId);

      if (profile) {
        const analysis = analyzeProfile(profile);
        
        setState(prev => ({
          ...prev,
          profile,
          analysis,
          lastUpdated: new Date()
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: 'Impossible de charger le profil utilisateur'
        }));
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement du profil';
      setState(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [userId, learningService]);

  /**
   * Force le rechargement du profil
   */
  const refreshProfile = useCallback(async () => {
    await loadProfile(true);
  }, [loadProfile]);

  /**
   * Analyse le profil pour fournir des insights
   */
  const analyzeProfile = useCallback((profile: UserLearningProfile): ProfileAnalysis => {
    const currentLevelIndex = LEVEL_HIERARCHY.indexOf(profile.currentLevel);
    const nextLevel = LEVEL_HIERARCHY[currentLevelIndex + 1];
    
    // Calculer le progrès vers le niveau suivant
    const basePointsForLevel = (currentLevelIndex + 1) * 1000; // Points nécessaires pour le niveau actuel
    const pointsForNextLevel = (currentLevelIndex + 2) * 1000; // Points pour le niveau suivant
    const progressInCurrentLevel = Math.max(0, profile.totalPoints - basePointsForLevel);
    const pointsNeededForNext = pointsForNextLevel - basePointsForLevel;
    const nextLevelProgress = Math.min(100, (progressInCurrentLevel / pointsNeededForNext) * 100);

    // Estimer le temps pour le niveau suivant
    const avgPointsPerExercise = profile.stats.totalExercises > 0 
      ? profile.totalPoints / profile.stats.totalExercises 
      : 10;
    const exercisesNeeded = Math.ceil((pointsForNextLevel - profile.totalPoints) / avgPointsPerExercise);
    const avgTimePerExercise = profile.stats.totalExercises > 0
      ? profile.stats.totalTimeSpent / profile.stats.totalExercises
      : 120000; // 2 minutes par défaut
    const estimatedTimeMs = exercisesNeeded * avgTimePerExercise;
    
    // Générer des recommandations
    const recommendations: string[] = [];
    
    if (profile.stats.averageScore < 0.6) {
      recommendations.push("Concentrez-vous sur l'amélioration de la précision avant de progresser");
    } else if (profile.stats.averageScore > 0.85 && nextLevel) {
      recommendations.push(`Vous êtes prêt(e) pour passer au niveau ${nextLevel} !`);
    }
    
    if (profile.stats.streak > 7) {
      recommendations.push("Excellente régularité ! Continuez sur cette lancée");
    } else if (profile.stats.streak < 3) {
      recommendations.push("Essayez de pratiquer plus régulièrement pour de meilleurs résultats");
    }

    if (profile.weaknesses.length > 0) {
      recommendations.push(`Travaillez sur: ${profile.weaknesses.slice(0, 2).join(', ')}`);
    }

    if (profile.stats.totalExercises < 10) {
      recommendations.push("Faites plus d'exercices pour obtenir une évaluation plus précise");
    }

    return {
      strengths: profile.strengths,
      weaknesses: profile.weaknesses,
      recommendations,
      nextLevelProgress,
      estimatedTimeToNextLevel: formatEstimatedTime(estimatedTimeMs)
    };
  }, []);

  /**
   * Formate le temps estimé en format lisible
   */
  const formatEstimatedTime = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours < 1) {
      return `${minutes} minutes`;
    } else if (hours < 24) {
      return `${hours}h ${minutes}min`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days} jour${days > 1 ? 's' : ''} ${remainingHours}h`;
    }
  };

  /**
   * Obtient les statistiques de progression détaillées
   */
  const getProgressStats = useCallback(() => {
    if (!state.profile) return null;

    const { stats } = state.profile;
    const successRate = stats.totalExercises > 0 ? (stats.averageScore * 100) : 0;
    const avgTimePerExercise = stats.totalExercises > 0 
      ? stats.totalTimeSpent / stats.totalExercises / 1000 // en secondes
      : 0;

    return {
      totalExercises: stats.totalExercises,
      successRate: Math.round(successRate),
      currentStreak: stats.streak,
      averageTime: Math.round(avgTimePerExercise),
      totalPoints: state.profile.totalPoints,
      achievements: state.profile.achievements.length,
      currentLevel: state.profile.currentLevel,
      nextLevelProgress: state.analysis?.nextLevelProgress || 0
    };
  }, [state.profile, state.analysis]);

  /**
   * Vérifie si l'utilisateur peut passer au niveau supérieur
   */
  const canLevelUp = useCallback((): boolean => {
    if (!state.profile) return false;

    const currentLevelIndex = LEVEL_HIERARCHY.indexOf(state.profile.currentLevel);
    if (currentLevelIndex === -1 || currentLevelIndex === LEVEL_HIERARCHY.length - 1) {
      return false; // Niveau inconnu ou déjà au maximum
    }

    // Critères pour passer au niveau supérieur
    const hasEnoughExercises = state.profile.stats.totalExercises >= 20;
    const hasGoodAverageScore = state.profile.stats.averageScore >= 0.8;
    const hasEnoughPoints = (state.analysis?.nextLevelProgress || 0) >= 100;

    return hasEnoughExercises && hasGoodAverageScore && hasEnoughPoints;
  }, [state.profile, state.analysis]);

  /**
   * Obtient les achievements récents
   */
  const getRecentAchievements = useCallback((limit: number = 5): string[] => {
    if (!state.profile) return [];
    return state.profile.achievements.slice(-limit).reverse();
  }, [state.profile]);

  /**
   * Nettoie l'erreur
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Charger automatiquement le profil au montage
  useEffect(() => {
    if (userId && autoRefresh) {
      loadProfile();
    }
  }, [userId, autoRefresh, loadProfile]);

  // Auto-refresh périodique si activé
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (state.lastUpdated) {
        const timeSinceUpdate = Date.now() - state.lastUpdated.getTime();
        // Refresh toutes les 5 minutes
        if (timeSinceUpdate > 5 * 60 * 1000) {
          loadProfile(false);
        }
      }
    }, 60 * 1000); // Vérifier chaque minute

    return () => clearInterval(interval);
  }, [autoRefresh, state.lastUpdated, loadProfile]);

  return {
    // État
    ...state,
    
    // Actions
    loadProfile,
    refreshProfile,
    clearError,
    
    // Utilitaires
    getProgressStats,
    canLevelUp,
    getRecentAchievements,
    
    // État du service parent
    isServiceConnected: learningService.isConnected,
    serviceError: learningService.error
  };
};