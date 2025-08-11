/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/types/LSFClassifiersTypes.ts
 * @description Types spécifiques pour les paramètres de classificateurs LSF
 * @author MetaSign
 * @version 1.0.0
 * @since 2024
 * 
 * Ce module définit les types TypeScript pour les paramètres de classificateurs
 * utilisés dans les simulations d'erreur LSF.
 * 
 * @module LSFClassifiersTypes
 */

/**
 * Paramètres de classificateurs LSF avec indicateurs d'erreur
 * Extension du type de base pour inclure les flags d'erreur spécifiques
 */
export interface LSFClassifiersParameter {
    /** Précision du classificateur (0-1) */
    accuracy?: number;

    /** Indicateur de classificateur inapproprié */
    inappropriate?: boolean;

    /** Indicateur de confusion entre classificateurs */
    confusion?: boolean;

    /** Indicateur de simplification excessive */
    oversimplified?: boolean;

    /** Indicateur d'omission de classificateur */
    omission?: boolean;

    /** Indicateur d'usage inconsistant */
    inconsistentUsage?: boolean;

    /** Type de classificateur utilisé */
    type?: string;

    /** Configuration de la main pour le classificateur */
    handConfig?: string;

    /** Contexte d'application du classificateur */
    context?: string;

    /** Objets associés au classificateur */
    objects?: readonly string[];

    /** Catégorie du classificateur (shape, movement, handling) */
    category?: 'shape' | 'movement' | 'handling';

    /** Niveau de difficulté */
    difficulty?: 'beginner' | 'intermediate' | 'advanced';

    /** Métadonnées additionnelles */
    metadata?: Record<string, unknown>;
}