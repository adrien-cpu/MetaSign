// src/ai/validation/types/history.ts

/**
 * Importons depuis le bon fichier où ValidationState est défini.
 * Si ValidationState n'existe pas encore, nous devrons le créer.
 */
import { ValidationState } from './validation-state';

/**
 * Représente un changement d'état pour une validation collaborative.
 * Enregistre l'historique complet des transitions d'état pour l'audit et le suivi.
 */
export interface ValidationStateChange {
    /** Identifiant unique de la validation concernée */
    validationId: string;

    /** État précédent de la validation */
    previousState: ValidationState;

    /** Nouvel état de la validation */
    newState: ValidationState;

    /** Identifiant de l'utilisateur ou du système ayant effectué le changement */
    changedBy: string;

    /** Date et heure du changement */
    changedAt: Date;

    /** Raison optionnelle du changement d'état */
    reason?: string;

    /** Métadonnées additionnelles liées au changement (optionnel) */
    metadata?: Record<string, unknown>;
}

/**
 * Type représentant un journal d'historique des changements d'état
 */
export type ValidationStateHistory = ValidationStateChange[];

/**
 * Interface pour les services de gestion d'historique des validations
 */
export interface IHistoryService {
    /**
     * Ajoute une entrée dans l'historique des changements d'état
     * @param change Changement d'état à enregistrer
     */
    addHistoryEntry(change: ValidationStateChange): Promise<void>;

    /**
     * Récupère l'historique complet des changements d'état pour une validation
     * @param validationId Identifiant de la validation
     * @returns Historique des changements d'état
     */
    getValidationHistory(validationId: string): Promise<ValidationStateHistory>;

    /**
     * Recherche dans l'historique selon des critères spécifiques
     * @param criteria Critères de recherche
     * @param limit Nombre maximum d'entrées à retourner
     * @returns Entrées d'historique correspondant aux critères
     */
    searchHistory(criteria: Partial<ValidationStateChange>, limit?: number): Promise<ValidationStateHistory>;
}