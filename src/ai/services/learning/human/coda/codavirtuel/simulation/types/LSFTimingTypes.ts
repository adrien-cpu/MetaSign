/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/types/LSFTimingTypes.ts
 * @description Types spécifiques pour les paramètres de timing LSF
 * @author MetaSign
 * @version 1.0.0
 * @since 2024
 * 
 * Ce module définit les types TypeScript pour les paramètres de timing
 * utilisés dans les simulations d'erreur rythmique LSF.
 * 
 * @module LSFTimingTypes
 */

/**
 * Paramètres de timing LSF avec indicateurs d'erreur rythmique
 * Extension du type de base pour inclure les flags d'erreur spécifiques
 */
export interface LSFTimingParameter {
    /** Précision du timing (0-1) */
    accuracy?: number;

    /** Vitesse de signation (multiplicateur, 1 = normal) */
    speed?: number;

    /** Niveau de fluidité gestuelle (0-1) */
    fluidity?: number;

    /** Durée totale en secondes */
    duration?: number;

    /** Indicateur de pauses inappropriées */
    inappropriatePauses?: boolean;

    /** Indicateur d'hésitations fréquentes */
    hesitations?: boolean;

    /** Tempo classifié (very_slow, slow, moderate, fast, very_fast) */
    tempo?: 'very_slow' | 'slow' | 'moderate' | 'fast' | 'very_fast';

    /** Niveau de fluidité classifié */
    fluidityLevel?: 'choppy' | 'hesitant' | 'regular' | 'smooth' | 'flowing';

    /** Patterns de pause détectés */
    pausePatterns?: readonly string[];

    /** Types d'hésitation identifiés */
    hesitationTypes?: readonly string[];

    /** Métriques de régularité rythmique */
    rhythmRegularity?: number;

    /** Index de prévisibilité temporelle */
    predictabilityIndex?: number;

    /** Précision des micro-timings */
    microTimingPrecision?: number;

    /** Contexte d'usage du timing */
    context?: 'conversational' | 'formal' | 'artistic' | 'pedagogical' | 'emergency';

    /** Fonction linguistique du rythme */
    linguisticFunction?: 'emphasis' | 'clarity' | 'conversational' | 'intensity' | 'high_intensity';

    /** Contexte émotionnel associé */
    emotionalContext?: readonly string[];

    /** Erreurs communes détectées */
    detectedErrors?: readonly string[];

    /** Métadonnées additionnelles */
    metadata?: Record<string, unknown>;
}