/**
 * @file useExercises.ts
 * @description Hook spécialisé pour la gestion des exercices
 * @author MetaSign Team
 * @version 1.0.0
 */

import { useState, useCallback, useRef } from 'react';
import { useLearningService } from './useLearningService';
import type { ExerciseRequest, ExerciseResponse, EvaluationRequest, EvaluationResponse } from '../services/LearningServiceBridge';

interface ExerciseSession {
  currentExercise: ExerciseResponse | null;
  exerciseHistory: ExerciseResponse[];
  evaluationHistory: EvaluationResponse[];
  stats: {
    totalExercises: number;
    correctAnswers: number;
    averageScore: number;
    timeSpent: number;
  };
}

interface ExerciseState {
  session: ExerciseSession;
  isGenerating: boolean;
  isEvaluating: boolean;
  error: string | null;
}

export const useExercises = (userId: string, sessionId: string) => {
  const learningService = useLearningService();
  
  const [state, setState] = useState<ExerciseState>({
    session: {
      currentExercise: null,
      exerciseHistory: [],
      evaluationHistory: [],
      stats: {
        totalExercises: 0,
        correctAnswers: 0,
        averageScore: 0,
        timeSpent: 0
      }
    },
    isGenerating: false,
    isEvaluating: false,
    error: null
  });

  const startTimeRef = useRef<number>(0);

  /**
   * Génère un nouvel exercice
   */
  const generateNextExercise = useCallback(async (exerciseType?: string, difficulty?: number) => {
    setState(prev => ({ ...prev, isGenerating: true, error: null }));
    startTimeRef.current = Date.now();

    try {
      const request: ExerciseRequest = {
        userId,
        sessionId,
        exerciseType,
        difficulty
      };

      const exercise = await learningService.generateExercise(request);

      setState(prev => ({
        ...prev,
        session: {
          ...prev.session,
          currentExercise: exercise,
          exerciseHistory: [...prev.session.exerciseHistory, exercise],
          stats: {
            ...prev.session.stats,
            totalExercises: prev.session.stats.totalExercises + 1
          }
        }
      }));

      return exercise;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de génération';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw err;
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [userId, sessionId, learningService]);

  /**
   * Évalue une réponse et met à jour les statistiques
   */
  const submitAnswer = useCallback(async (response: unknown) => {
    if (!state.session.currentExercise) {
      throw new Error('Aucun exercice actuel à évaluer');
    }

    setState(prev => ({ ...prev, isEvaluating: true, error: null }));
    const timeSpent = Date.now() - startTimeRef.current;

    try {
      const request: EvaluationRequest = {
        userId,
        sessionId,
        exerciseId: state.session.currentExercise.id,
        response,
        timeSpent
      };

      const evaluation = await learningService.evaluateResponse(request);

      // Mettre à jour les statistiques
      setState(prev => {
        const newCorrectAnswers = prev.session.stats.correctAnswers + (evaluation.correct ? 1 : 0);
        const newTotalExercises = prev.session.stats.totalExercises;
        const newTotalTime = prev.session.stats.timeSpent + timeSpent;
        
        // Calculer la moyenne des scores
        const totalScore = prev.session.evaluationHistory.reduce((sum, eval) => sum + eval.score, 0) + evaluation.score;
        const newAverageScore = totalScore / (prev.session.evaluationHistory.length + 1);

        return {
          ...prev,
          session: {
            ...prev.session,
            evaluationHistory: [...prev.session.evaluationHistory, evaluation],
            stats: {
              totalExercises: newTotalExercises,
              correctAnswers: newCorrectAnswers,
              averageScore: newAverageScore,
              timeSpent: newTotalTime
            }
          }
        };
      });

      return evaluation;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur d\'évaluation';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw err;
    } finally {
      setState(prev => ({ ...prev, isEvaluating: false }));
    }
  }, [userId, sessionId, state.session.currentExercise, learningService]);

  /**
   * Recommence avec un nouvel exercice après évaluation
   */
  const nextExercise = useCallback(async (exerciseType?: string) => {
    // Déterminer le type d'exercice basé sur les performances
    let suggestedType = exerciseType;
    
    if (!suggestedType && state.session.evaluationHistory.length > 0) {
      const lastEvaluation = state.session.evaluationHistory[state.session.evaluationHistory.length - 1];
      
      // Logique d'adaptation basée sur la performance
      if (lastEvaluation.correct && lastEvaluation.score > 0.8) {
        // Bon résultat, peut-être augmenter la difficulté
        suggestedType = state.session.currentExercise?.type;
      } else if (!lastEvaluation.correct || lastEvaluation.score < 0.5) {
        // Résultat faible, garder le même type ou simplifier
        suggestedType = state.session.currentExercise?.type;
      }
    }

    return await generateNextExercise(suggestedType);
  }, [generateNextExercise, state.session.evaluationHistory, state.session.currentExercise]);

  /**
   * Remet à zéro la session d'exercices
   */
  const resetSession = useCallback(() => {
    setState({
      session: {
        currentExercise: null,
        exerciseHistory: [],
        evaluationHistory: [],
        stats: {
          totalExercises: 0,
          correctAnswers: 0,
          averageScore: 0,
          timeSpent: 0
        }
      },
      isGenerating: false,
      isEvaluating: false,
      error: null
    });
    startTimeRef.current = 0;
  }, []);

  /**
   * Obtient des recommandations basées sur les performances
   */
  const getRecommendations = useCallback((): string[] => {
    const { stats, evaluationHistory } = state.session;
    const recommendations: string[] = [];

    if (stats.totalExercises === 0) {
      recommendations.push("Commencez par faire quelques exercices pour évaluer votre niveau");
      return recommendations;
    }

    const successRate = stats.correctAnswers / stats.totalExercises;
    const avgTime = stats.timeSpent / stats.totalExercises;

    if (successRate < 0.5) {
      recommendations.push("Concentrez-vous sur les bases avant de passer à des exercices plus complexes");
      recommendations.push("Prenez le temps de bien lire les consignes");
    } else if (successRate > 0.8) {
      recommendations.push("Excellents résultats ! Vous pouvez essayer des exercices plus difficiles");
      if (avgTime < 30000) { // moins de 30 secondes
        recommendations.push("Vous répondez rapidement, c'est très bien !");
      }
    } else {
      recommendations.push("Bons progrès ! Continuez sur cette voie");
    }

    if (avgTime > 120000) { // plus de 2 minutes
      recommendations.push("Essayez de répondre plus rapidement pour améliorer votre fluidité");
    }

    // Analyser les derniers exercices pour des patterns
    const recentEvaluations = evaluationHistory.slice(-3);
    const recentSuccessRate = recentEvaluations.filter(e => e.correct).length / recentEvaluations.length;
    
    if (recentSuccessRate === 1 && recentEvaluations.length >= 3) {
      recommendations.push("Série parfaite ! Vous maîtrisez bien ce niveau");
    } else if (recentSuccessRate === 0 && recentEvaluations.length >= 2) {
      recommendations.push("Prenez une pause et revisitez les concepts de base");
    }

    return recommendations;
  }, [state.session]);

  /**
   * Nettoie l'erreur
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // État
    ...state,
    isLoading: state.isGenerating || state.isEvaluating,
    
    // Actions
    generateNextExercise,
    submitAnswer,
    nextExercise,
    resetSession,
    clearError,
    
    // Utilitaires
    getRecommendations,
    
    // État du service parent
    isServiceConnected: learningService.isConnected,
    serviceError: learningService.error
  };
};