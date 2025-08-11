// src/ai/learning/types/AdaptedContent.ts

/**
 * Types d'adaptation possibles
 */
export type AdaptationType =
    | 'difficulty'
    | 'pace'
    | 'content'
    | 'assistance'
    | 'feedback'
    | 'structure'
    | 'interaction'
    | 'motivation';

/**
 * Actions possibles pour chaque type d'adaptation
 */
export type AdaptationAction =
    | 'increase'    // Augmenter (difficulté, rythme, etc.)
    | 'decrease'    // Diminuer (difficulté, rythme, etc.)
    | 'maintain'    // Maintenir le niveau actuel
    | 'provide'     // Fournir (assistance, explications, etc.)
    | 'remove'      // Supprimer (distractions, contraintes, etc.)
    | 'personalize' // Personnaliser (contenu, feedback, etc.)
    | 'minimal'     // Fournir une version minimale
    | 'detailed'    // Fournir une version détaillée
    | 'restructure' // Restructurer (organisation, séquencement, etc.)
    | 'substitute'; // Substituer par une alternative

/**
 * Adaptation recommandée pour l'utilisateur
 */
export interface Adaptation {
    /**
     * Type d'adaptation
     */
    type: string;

    /**
     * Description de l'adaptation
     */
    description: string;

    /**
     * Éléments sur lesquels l'adaptation s'applique
     */
    appliedElements: string[];

    /**
     * Raison de l'adaptation
     */
    reason: string;

    /**
     * Action à entreprendre
     */
    action?: AdaptationAction;

    /**
     * Intensité de l'adaptation (0-1)
     */
    intensity?: number;

    /**
     * Explication utilisateur de l'adaptation
     */
    explanation?: string;

    /**
     * Indique si l'utilisateur peut ignorer l'adaptation
     */
    overridable?: boolean;

    /**
     * Métadonnées supplémentaires spécifiques à l'adaptation
     */
    metadata?: Record<string, unknown>;
}