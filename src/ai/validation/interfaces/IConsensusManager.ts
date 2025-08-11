//src/ai/validation/interfaces/IConsensusManager.ts
import {
    ConsensusResult,
    ConsensusOptions,
    Result
} from '../types';

/**
 * Interface pour le gestionnaire de consensus
 * Responsable du calcul et de la gestion des consensus entre experts
 */
export interface IConsensusManager {
    /**
     * Calcule le consensus pour une validation
     * @param validationId ID de la validation
     * @param options Options pour le calcul du consensus
     */
    calculateConsensus(
        validationId: string,
        options?: ConsensusOptions
    ): Promise<Result<ConsensusResult>>;

    /**
     * Récupère le résultat de consensus d'une validation
     * @param validationId ID de la validation
     */
    getConsensusResult(validationId: string): Promise<Result<ConsensusResult>>;

    /**
     * Vérifie si le nombre minimum de feedbacks est atteint pour calculer un consensus
     * @param validationId ID de la validation
     */
    isReadyForConsensus(validationId: string): Promise<Result<boolean>>;

    /**
     * Annule un consensus et permet à nouveau la collecte de feedbacks
     * @param validationId ID de la validation
     * @param reason Raison de l'annulation
     */
    reopenConsensus(
        validationId: string,
        reason: string
    ): Promise<Result<void>>;
}