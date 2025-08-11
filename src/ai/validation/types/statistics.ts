//src/ai/validation/types/statistics.ts
import { ValidationState } from './index';

/**
 * Statistiques du système de validation
 */
export interface ValidationStats {
    /**
     * Nombre total de validations
     */
    totalValidations: number;

    /**
     * Nombre de validations en attente
     */
    pendingValidations: number;

    /**
     * Nombre de validations terminées
     */
    completedValidations: number;

    /**
     * Temps moyen de validation (ms)
     */
    averageCompletionTime: number;

    /**
     * Niveau moyen de consensus
     */
    averageConsensusLevel: number;

    /**
     * Nombre d'experts actifs
     */
    expertCount: number;

    /**
     * Nombre de validations par état
     */
    validationsByState: Record<ValidationState, number>;

    /**
     * Indique si les statistiques sont réellement calculées
     */
    implemented: boolean;
}