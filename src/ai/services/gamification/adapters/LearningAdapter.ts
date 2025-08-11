/**
 * Adaptateur pour le module d'apprentissage
 * 
 * @file src/ai/services/gamification/adapters/LearningAdapter.ts
 */

import { EvaluationResult } from '../../learning/human/coda/codavirtuel/exercises/ExerciseGeneratorService';
import { ActionContext, ActionData, ActionType } from '../types/action';

/**
 * Adaptateur pour transformer les concepts d'apprentissage en concepts de gamification
 */
export class LearningAdapter {
    /**
     * Convertit un résultat d'exercice en données d'action de gamification
     * @param userId ID de l'utilisateur
     * @param exerciseId ID de l'exercice
     * @param result Résultat de l'évaluation
     * @returns Données d'action
     */
    public static convertExerciseResult(
        userId: string,
        exerciseId: string,
        result: EvaluationResult
    ): ActionData {
        return {
            actionId: `exercise_${exerciseId}_${Date.now()}`,
            type: ActionType.EXERCISE_COMPLETED,
            context: ActionContext.LEARNING,
            result: {
                success: result.correct,
                score: result.score,
                details: result.details || {}
            },
            metadata: {
                userId,
                exerciseId,
                timestamp: new Date().toISOString()
            }
        };
    }

    /**
     * Convertit une maîtrise de compétence en données d'action de gamification
     * @param userId ID de l'utilisateur
     * @param skillId ID de la compétence
     * @returns Données d'action
     */
    public static convertSkillMastery(
        userId: string,
        skillId: string
    ): ActionData {
        return {
            actionId: `skill_${skillId}_${Date.now()}`,
            type: ActionType.SKILL_MASTERED,
            context: ActionContext.LEARNING,
            result: {
                success: true,
                score: 1.0
            },
            metadata: {
                userId,
                skillId,
                timestamp: new Date().toISOString()
            }
        };
    }

    /**
     * Convertit un événement de montée de niveau en données d'action de gamification
     * @param userId ID de l'utilisateur
     * @param previousLevel Niveau précédent
     * @param newLevel Nouveau niveau
     * @returns Données d'action
     */
    public static convertLevelUp(
        userId: string,
        previousLevel: number,
        newLevel: number
    ): ActionData {
        return {
            actionId: `level_up_${userId}_${newLevel}_${Date.now()}`,
            type: ActionType.LEVEL_UP,
            context: ActionContext.SYSTEM,
            result: {
                success: true
            },
            metadata: {
                userId,
                previousLevel,
                newLevel,
                timestamp: new Date().toISOString()
            }
        };
    }
}