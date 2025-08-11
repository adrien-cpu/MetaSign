/**
 * @file src/ai/services/learning/human/coda/codavirtuel/scenarios/types/DifficultyTypes.ts
 * @description Types relatifs à la difficulté des exercices et scénarios
 * Définit les niveaux de difficulté et les types d'exercices disponibles
 * @module DifficultyTypes
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 */

/**
 * Niveaux de difficulté des exercices
 */
export type ExerciseDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Types d'exercices disponibles
 */
export type ExerciseType =
    | 'multiple-choice'  // Questions à choix multiples
    | 'drag-drop'        // Glisser-déposer pour ordonner des éléments
    | 'fill-blank'       // Texte à trous
    | 'text-entry'       // Saisie de texte libre
    | 'video-response'   // Réponse en vidéo LSF
    | 'correction'       // Correction d'erreurs
    | 'matching'         // Association d'éléments
    | 'ordering';        // Mise en ordre d'éléments

/**
 * Niveaux de difficulté des scénarios
 */
export enum ScenarioDifficulty {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
    ADAPTIVE = 'adaptive'
}

/**
 * Mappe les niveaux de difficulté au niveau CECRL
 */
export const difficultyToCECRLMap: Record<ScenarioDifficulty, string[]> = {
    [ScenarioDifficulty.BEGINNER]: ['A1', 'A2'],
    [ScenarioDifficulty.INTERMEDIATE]: ['B1', 'B2'],
    [ScenarioDifficulty.ADVANCED]: ['C1', 'C2'],
    [ScenarioDifficulty.ADAPTIVE]: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
};

/**
 * Configuration pour chaque type d'exercice, avec niveau de complexité cognitive
 */
export const exerciseTypeConfig: Record<ExerciseType, {
    complexityLevel: number;  // 1-5, 1 étant le plus simple, 5 le plus complexe
    description: string;
    adaptiveFactor: number;   // Facteur d'adaptation pour le calcul de difficulté (1-2)
}> = {
    'multiple-choice': {
        complexityLevel: 1,
        description: 'Sélection d\'une ou plusieurs réponses parmi des options présentées',
        adaptiveFactor: 1.0
    },
    'drag-drop': {
        complexityLevel: 2,
        description: 'Placement d\'éléments dans des zones spécifiques',
        adaptiveFactor: 1.2
    },
    'fill-blank': {
        complexityLevel: 2,
        description: 'Complétion de phrases ou expressions avec des éléments manquants',
        adaptiveFactor: 1.3
    },
    'text-entry': {
        complexityLevel: 3,
        description: 'Réponse textuelle libre à une question',
        adaptiveFactor: 1.5
    },
    'video-response': {
        complexityLevel: 4,
        description: 'Enregistrement d\'une réponse en vidéo LSF',
        adaptiveFactor: 1.8
    },
    'correction': {
        complexityLevel: 3,
        description: 'Identification et correction d\'erreurs dans un texte ou une vidéo LSF',
        adaptiveFactor: 1.6
    },
    'matching': {
        complexityLevel: 2,
        description: 'Association de paires d\'éléments correspondants',
        adaptiveFactor: 1.2
    },
    'ordering': {
        complexityLevel: 3,
        description: 'Organisation d\'éléments dans un ordre spécifique',
        adaptiveFactor: 1.4
    }
};

/**
 * Vérifie si un type d'exercice est supporté
 * @param type Type d'exercice à vérifier
 * @returns Vrai si le type est supporté
 */
export function isValidExerciseType(type: string): type is ExerciseType {
    return Object.keys(exerciseTypeConfig).includes(type);
}

/**
 * Calcule le niveau de difficulté global d'un exercice
 * @param type Type d'exercice
 * @param difficulty Niveau de difficulté de base
 * @returns Score de difficulté (1-10)
 */
export function calculateExerciseDifficulty(
    type: ExerciseType,
    difficulty: ExerciseDifficulty
): number {
    const baseScore = difficulty === 'easy' ? 1 :
        difficulty === 'medium' ? 2 : 3;

    const complexityFactor = exerciseTypeConfig[type].complexityLevel / 5;
    const adaptiveFactor = exerciseTypeConfig[type].adaptiveFactor;

    return Math.min(10, Math.round(baseScore * complexityFactor * adaptiveFactor * 2));
}

/**
 * Interface pour la configuration de difficulté d'un exercice
 */
export interface ExerciseDifficultyConfig {
    type: ExerciseType;
    difficulty: ExerciseDifficulty;
    weight: number; // Pondération pour la génération aléatoire
}

/**
 * Interface pour les paramètres de progression de difficulté
 */
export interface DifficultyProgressionParams {
    baseLevel: ExerciseDifficulty;
    successThreshold: number; // Seuil de réussite pour augmenter la difficulté (ex: 0.8)
    failureThreshold: number; // Seuil d'échec pour diminuer la difficulté (ex: 0.4)
    adaptationRate: number;   // Vitesse d'adaptation (0-1)
}

/**
 * Interface pour le suivi de progression dans les niveaux de difficulté
 */
export interface DifficultyProgressionTracker {
    currentLevel: ExerciseDifficulty;
    successRate: number;
    exercisesCompleted: number;
    lastScores: number[];
    recommendedLevel: ExerciseDifficulty;
}

/**
 * Fonctions utilitaires pour la gestion de difficulté
 */
export const DifficultyUtils = {
    /**
     * Convertit un niveau de difficulté en valeur numérique
     * @param difficulty - Niveau de difficulté
     * @returns Valeur numérique (0-2)
     */
    difficultyToValue(difficulty: ExerciseDifficulty): number {
        const difficultyValues: Record<ExerciseDifficulty, number> = {
            'easy': 0,
            'medium': 1,
            'hard': 2
        };
        return difficultyValues[difficulty] || 1;
    },

    /**
     * Convertit une valeur numérique en niveau de difficulté
     * @param value - Valeur numérique
     * @returns Niveau de difficulté
     */
    valueToDifficulty(value: number): ExerciseDifficulty {
        if (value <= 0.33) return 'easy';
        if (value <= 1.66) return 'medium';
        return 'hard';
    },

    /**
     * Calcule le niveau de difficulté recommandé en fonction des performances
     * @param params - Paramètres de progression
     * @param currentScores - Scores récents
     * @returns Niveau de difficulté recommandé
     */
    calculateRecommendedDifficulty(
        params: DifficultyProgressionParams,
        currentScores: number[]
    ): ExerciseDifficulty {
        if (currentScores.length === 0) {
            return params.baseLevel;
        }

        const averageScore = currentScores.reduce((sum, score) => sum + score, 0) / currentScores.length;
        const currentDifficultyValue = this.difficultyToValue(params.baseLevel);

        let newDifficultyValue = currentDifficultyValue;

        if (averageScore >= params.successThreshold) {
            // Augmenter la difficulté
            newDifficultyValue += params.adaptationRate;
        } else if (averageScore <= params.failureThreshold) {
            // Diminuer la difficulté
            newDifficultyValue -= params.adaptationRate;
        }

        // Limiter la valeur entre 0 et 2
        newDifficultyValue = Math.max(0, Math.min(2, newDifficultyValue));

        return this.valueToDifficulty(newDifficultyValue);
    }
};