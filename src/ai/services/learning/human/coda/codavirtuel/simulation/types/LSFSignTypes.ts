/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/types/LSFSignTypes.ts
 * @description Types spécifiques pour les signes LSF dans les transformations syntaxiques
 * @author MetaSign
 * @version 2.0.0
 * @since 2024
 * 
 * Ce module définit les types TypeScript pour les signes LSF
 * utilisés dans les simulations d'erreur syntaxique.
 * 
 * @module LSFSignTypes
 */

/**
 * Paramètres de base pour un signe LSF
 */
export interface LSFSignParameters {
    /** Configuration des formes de main */
    handshape?: {
        dominant: string;
        nonDominant?: string;
    };

    /** Paramètres de mouvement */
    movement?: {
        type: string;
        direction?: string;
        repetition: boolean;
    };

    /** Localisation du signe */
    location?: {
        region: string;
        specific: string;
    };

    /** Paramètres temporels */
    timing?: {
        duration: number;
        speed: number;
        fluidity: number;
    };
}

/**
 * Signe LSF complet avec métadonnées syntaxiques
 */
export interface LSFSign {
    /** Identifiant unique du signe */
    id: string;

    /** Type grammatical du signe */
    type: 'noun' | 'verb' | 'adjective' | 'adverb' | 'pronoun' | 'auxiliary' | 'article' | 'complex_verb';

    /** Catégorie sémantique */
    category?: 'action' | 'classifier' | 'temporal' | 'spatial' | 'modifier' | 'french_interference';

    /** Rôle syntaxique dans la phrase */
    role?: 'subject' | 'object' | 'predicate' | 'modifier';

    /** Précision du signe (0-1) */
    accuracy?: number;

    /** Paramètres de réalisation du signe */
    parameters?: LSFSignParameters;

    /** Métadonnées additionnelles */
    metadata?: Record<string, unknown>;
}