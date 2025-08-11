/**
 * Représente une adaptation d'apprentissage générée
 */
export interface LearningAdaptation {
    /** Type d'adaptation */
    type: string;

    /** Configuration de l'adaptation */
    config: Record<string, unknown>;

    /** Importance de l'adaptation (0-1) */
    importance: number;

    /** Justification de l'adaptation */
    reasoning: string;
}