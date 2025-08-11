// src/ai/validation/interfaces/IConsensusCalculator.ts

import {
    CollaborativeValidationRequest,
    ValidationFeedback,
    ConsensusResult,
    ConsensusOptions
} from '../types';

/**
 * Type pour les propositions d'amélioration générées par le calculateur de consensus
 */
export type ImproveProposal = Record<string, unknown>;

/**
 * Interface pour le calculateur de consensus
 * Responsable de déterminer le résultat collectif à partir des retours individuels
 */
export interface IConsensusCalculator {
    /**
     * Calcule le consensus à partir des retours d'experts
     * @param request Requête de validation originale
     * @param feedback Liste des retours d'experts
     * @param options Options pour le calcul du consensus
     * @returns Résultat du consensus
     */
    calculateConsensus(
        request: CollaborativeValidationRequest,
        feedback: ValidationFeedback[],
        options?: ConsensusOptions
    ): Promise<ConsensusResult>;

    /**
     * Calcule le niveau d'accord entre les experts
     * @param feedback Liste des retours d'experts
     * @returns Niveau d'accord (0-1)
     */
    calculateAgreementLevel(feedback: ValidationFeedback[]): Promise<number>;

    /**
     * Aggrège les commentaires des experts
     * @param feedback Liste des retours d'experts
     * @returns Liste des commentaires agrégés
     */
    aggregateComments(feedback: ValidationFeedback[]): Promise<string[]>;

    /**
     * Génère une proposition d'amélioration basée sur les retours
     * @param request Requête de validation originale
     * @param feedback Liste des retours d'experts
     * @returns Proposition d'amélioration ou null
     */
    generateImproveProposal(
        request: CollaborativeValidationRequest,
        feedback: ValidationFeedback[]
    ): Promise<ImproveProposal | null>;

    /**
     * Vérifie si un consensus peut être considéré comme valide
     * @param consensus Résultat du consensus
     * @param options Options de validation
     * @returns True si le consensus est valide
     */
    isConsensusValid(
        consensus: ConsensusResult,
        options?: ConsensusOptions
    ): boolean;
}