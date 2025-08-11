import {
    ValidationResult,
    RegionalContext,
    ValidationFeedback
} from '../types';

/**
 * Résultat complet de validation d'une variante
 */
export interface VariantValidationResult extends ValidationResult {
    /** La variante a-t-elle été validée par un locuteur natif ? */
    validatedByNative: boolean;

    /** Notes contextuelles sur la validation */
    notes?: string;

    /** Horodatage de la validation */
    timestamp: number;

    /** Identifiant du validateur (si applicable) */
    validatorId?: string;

    /** Nombre de validateurs ayant examiné cette variante */
    validatorCount?: number;

    /** Score de consensus entre les validateurs (0 à 1) */
    consensusScore?: number;
}

/**
 * Interface pour le validateur de variantes dialectales
 * Responsable de la validation des variantes régionales par la communauté
 * S'intègre avec le composant ValidationCollaborative du diagramme d'état
 */
export interface IVariantValidator {
    /**
     * Valide une variante dialectale
     * @param signId Identifiant du signe
     * @param region Code régional
     * @param variant Données de la variante
     * @returns Résultat de la validation
     */
    validateVariant(
        signId: string,
        region: string,
        variant: Record<string, unknown>
    ): Promise<VariantValidationResult>;

    /**
     * Valide une variante dans un contexte régional spécifique
     * @param variant Variante dialectale
     * @param context Contexte régional
     */
    validateVariantInContext(
        variant: Record<string, unknown>,
        context: RegionalContext
    ): Promise<ValidationResult>;

    /**
     * Enregistre une validation par un locuteur natif
     * @param signId Identifiant du signe
     * @param region Code régional
     * @param validatorId Identifiant du validateur
     * @param feedback Retour détaillé du validateur
     * @returns Résultat mis à jour de la validation
     */
    recordNativeValidation(
        signId: string,
        region: string,
        validatorId: string,
        feedback: ValidationFeedback
    ): Promise<VariantValidationResult>;

    /**
     * Calcule le score de consensus pour une variante
     * @param signId Identifiant du signe
     * @param region Code régional
     * @returns Score de consensus entre 0 et 1
     */
    calculateConsensusScore(signId: string, region: string): Promise<number>;

    /**
     * Vérifie si une variante nécessite une validation supplémentaire
     * @param signId Identifiant du signe
     * @param region Code régional
     * @returns true si une validation supplémentaire est nécessaire
     */
    needsAdditionalValidation(signId: string, region: string): Promise<boolean>;

    /**
     * Récupère l'historique de validation d'une variante
     * @param signId Identifiant du signe
     * @param region Code régional
     * @returns Historique des validations
     */
    getValidationHistory(
        signId: string,
        region: string
    ): Promise<VariantValidationResult[]>;

    /**
     * Obtient les statistiques de validation
     * @param region Région optionnelle pour filtrer les statistiques
     * @returns Statistiques de validation
     */
    getValidationStats(region?: string): Promise<Record<string, number>>;

    /**
     * Récupère les validateurs les plus actifs par région
     * @param limit Nombre maximum de validateurs à retourner
     * @returns Liste des validateurs les plus actifs par région
     */
    getTopValidators(limit?: number): Promise<Map<string, Array<{ id: string, count: number }>>>;

    /**
     * Marque une variante comme nécessitant une revue
     * @param signId Identifiant du signe
     * @param region Code régional
     * @param reason Raison de la demande de revue
     * @returns true si l'opération a réussi
     */
    flagForReview(signId: string, region: string, reason: string): Promise<boolean>;
}