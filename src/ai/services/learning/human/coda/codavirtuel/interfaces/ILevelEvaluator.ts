/**
 * Interface pour les évaluateurs de niveau CECRL
 * @file src/ai/services/learning/codavirtuel/interfaces/ILevelEvaluator.ts
 * @description Définit les méthodes pour évaluer le niveau d'un utilisateur
 * @module ILevelEvaluator
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 */

import { ExerciseResult } from '../repositories/UserReverseApprenticeshipRepository';

/**
 * Interface pour les résultats d'évaluation de niveau
 */
export interface LevelEvaluationResult {
    /** Niveau actuel de l'utilisateur */
    currentLevel: string;

    /** Niveau recommandé pour l'utilisateur */
    recommendedLevel: string;

    /** Scores par domaine de compétence */
    scores: Record<string, number>;

    /** Explication de l'évaluation */
    explanation?: string;
}

/**
 * Interface pour les évaluateurs de niveau CECRL
 * Définit les méthodes requises pour évaluer le niveau d'un utilisateur
 */
export interface ILevelEvaluator {
    /**
     * Évalue le niveau d'un utilisateur en fonction de son historique d'exercices
     * @param currentLevel Niveau actuel de l'utilisateur
     * @param exerciseHistory Historique des exercices de l'utilisateur
     * @returns Résultat de l'évaluation contenant le niveau recommandé
     */
    evaluateLevel(
        currentLevel: string,
        exerciseHistory: ExerciseResult[]
    ): LevelEvaluationResult;

    /**
     * Estime la progression dans le niveau actuel
     * @param currentLevel Niveau actuel de l'utilisateur
     * @param exerciseHistory Historique des exercices récents
     * @returns Valeur entre 0 et 1 indiquant la progression dans le niveau
     */
    estimateProgressInLevel(
        currentLevel: string,
        exerciseHistory: ExerciseResult[]
    ): number;

    /**
     * Détermine si l'utilisateur devrait passer au niveau suivant
     * @param currentLevel Niveau actuel de l'utilisateur
     * @param exerciseHistory Historique complet des exercices
     * @param threshold Seuil de progression requis (0-1)
     * @returns Vrai si l'utilisateur devrait passer au niveau suivant
     */
    shouldProgressToNextLevel(
        currentLevel: string,
        exerciseHistory: ExerciseResult[],
        threshold?: number
    ): boolean;

    /**
     * Détermine si l'utilisateur devrait régresser au niveau précédent
     * @param currentLevel Niveau actuel de l'utilisateur
     * @param exerciseHistory Historique récent des exercices
     * @param threshold Seuil de régression (0-1)
     * @returns Vrai si l'utilisateur devrait régresser au niveau précédent
     */
    shouldRegressToPreviousLevel(
        currentLevel: string,
        exerciseHistory: ExerciseResult[],
        threshold?: number
    ): boolean;
}