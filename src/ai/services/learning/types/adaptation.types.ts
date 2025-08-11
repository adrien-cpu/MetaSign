/**
 * Types pour le système d'adaptation du contenu pédagogique
 */

/**
 * Types d'actions d'adaptation possibles
 */
export type AdaptationAction = 'increase' | 'decrease' | 'maintain' | 'replace' | 'add' | 'remove';

/**
 * Types d'adaptations possibles
 */
export type AdaptationType =
    | 'difficulty'  // Ajustement de la difficulté du contenu
    | 'pace'        // Modification du rythme d'apprentissage
    | 'content'     // Adaptation du contenu pédagogique
    | 'assistance'  // Modification du niveau d'assistance
    | 'structure'   // Adaptation de la structure des contenus
    | 'feedback';   // Modification des retours pédagogiques

/**
 * Interface représentant une adaptation pédagogique
 */
export interface Adaptation {
    /**
     * Type d'adaptation
     */
    type: AdaptationType;

    /**
     * Action à effectuer
     */
    action: AdaptationAction;

    /**
     * Intensité de l'adaptation (0-1)
     * 0 = subtil, 1 = très prononcé
     */
    intensity?: number;

    /**
     * Raison justifiant cette adaptation
     */
    reason: string;

    /**
     * Explication présentée à l'utilisateur
     */
    explanation: string;

    /**
     * Description détaillée de l'adaptation
     */
    description: string;

    /**
     * Éléments sur lesquels appliquer l'adaptation
     */
    appliedElements: string[];

    /**
     * L'utilisateur peut-il désactiver ou modifier cette adaptation
     */
    overridable: boolean;

    /**
     * Métadonnées supplémentaires liées à l'adaptation
     */
    metadata: Record<string, unknown>;
}

/**
 * Interface pour les résultats d'adaptation
 */
export interface AdaptationResult {
    /**
     * L'adaptation a-t-elle été appliquée avec succès
     */
    success: boolean;

    /**
     * L'adaptation appliquée
     */
    adaptation: Adaptation;

    /**
     * Message expliquant le résultat
     */
    message?: string;

    /**
     * Métriques sur l'impact de l'adaptation
     */
    metrics?: Record<string, number>;
}