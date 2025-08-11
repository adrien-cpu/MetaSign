/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/rhythm/LSFRhythmSystem.ts
 * @description Système de temporalité et rythmique LSF
 * @author MetaSign
 * @version 1.0.0
 * @since 2024
 * 
 * Ce module définit le système complet de temporalité et rythmique en LSF,
 * incluant les tempos, niveaux de fluidité, patterns de pauses et métriques temporelles.
 * 
 * @module LSFRhythmSystem
 */

/**
 * Configuration d'un tempo spécifique
 */
export interface TempoConfig {
    readonly bpm: number;
    readonly multiplier: number;
    readonly description: string;
    readonly linguisticFunction: string;
    readonly emotionalContext: readonly string[];
    readonly commonErrors: readonly string[];
}

/**
 * Configuration d'un niveau de fluidité
 */
export interface FluidityConfig {
    readonly value: number;
    readonly description: string;
    readonly causes: readonly string[];
    readonly impact: string;
}

/**
 * Configuration d'un pattern de pause
 */
export interface PausePatternConfig {
    readonly description: string;
    readonly positions: readonly string[];
    readonly duration_range: readonly [number, number];
    readonly function: string;
}

/**
 * Configuration d'un micro-timing
 */
export interface MicroTimingConfig {
    readonly description: string;
    readonly precision_required: 'low' | 'moderate' | 'high' | 'critical';
    readonly common_errors: readonly string[];
}

/**
 * Configuration d'une métrique rythmique
 */
export interface RhythmMetricConfig {
    readonly measurement: string;
    readonly ideal_range: readonly [number, number];
    readonly description: string;
}

/**
 * Configuration d'un niveau de difficulté
 */
export interface DifficultyConfig {
    readonly tempos: readonly string[];
    readonly fluidity_required: number;
    readonly pause_tolerance: 'low' | 'medium' | 'high';
    readonly micro_timing_precision: 'low' | 'medium' | 'high';
}

/**
 * Système complet de temporalité et rythmique LSF
 */
export interface LSFRhythmSystemConfig {
    readonly tempos: Record<string, TempoConfig>;
    readonly fluidityLevels: Record<string, FluidityConfig>;
    readonly pausePatterns: Record<string, PausePatternConfig>;
    readonly microTimings: Record<string, MicroTimingConfig>;
    readonly rhythmMetrics: Record<string, RhythmMetricConfig>;
    readonly difficulty: Record<string, DifficultyConfig>;
}

/**
 * Système de temporalité et rythmique LSF
 * Définit les paramètres temporels et leurs variations expressives
 */
export const LSF_RHYTHM_SYSTEM: LSFRhythmSystemConfig = {
    // Tempos de base et leurs caractéristiques expressives
    tempos: {
        very_slow: {
            bpm: 40,
            multiplier: 0.25,
            description: 'Très lent - emphase, solennité',
            linguisticFunction: 'emphasis',
            emotionalContext: ['serious', 'sad', 'contemplative'],
            commonErrors: ['dragging', 'loss_of_attention', 'over_emphasis']
        },
        slow: {
            bpm: 60,
            multiplier: 0.5,
            description: 'Lent - clarté pédagogique',
            linguisticFunction: 'clarity',
            emotionalContext: ['calm', 'explanatory', 'careful'],
            commonErrors: ['monotony', 'pedagogical_over_correction', 'artificial_slowness']
        },
        moderate: {
            bpm: 90,
            multiplier: 1.0,
            description: 'Modéré - conversation normale',
            linguisticFunction: 'conversational',
            emotionalContext: ['neutral', 'friendly', 'informative'],
            commonErrors: ['inconsistency', 'micro_hesitations', 'rhythm_breaks']
        },
        fast: {
            bpm: 120,
            multiplier: 1.5,
            description: 'Rapide - excitation, urgence',
            linguisticFunction: 'intensity',
            emotionalContext: ['excited', 'urgent', 'passionate'],
            commonErrors: ['rushing', 'articulation_loss', 'breathlessness']
        },
        very_fast: {
            bpm: 150,
            multiplier: 2.0,
            description: 'Très rapide - forte émotion',
            linguisticFunction: 'high_intensity',
            emotionalContext: ['panic', 'extreme_joy', 'anger'],
            commonErrors: ['incoherence', 'gestural_blur', 'communication_breakdown']
        }
    },

    // Types de fluidité gestuelle
    fluidityLevels: {
        choppy: {
            value: 0.2,
            description: 'Saccadé - mouvements fragmentés',
            causes: ['nervous_tension', 'lack_of_practice', 'overconcentration'],
            impact: 'severe_comprehension_loss'
        },
        hesitant: {
            value: 0.4,
            description: 'Hésitant - interruptions fréquentes',
            causes: ['uncertainty', 'vocabulary_gaps', 'performance_anxiety'],
            impact: 'moderate_comprehension_loss'
        },
        regular: {
            value: 0.7,
            description: 'Régulier - rythme prévisible',
            causes: ['beginner_level', 'formal_context', 'careful_signing'],
            impact: 'slight_naturalness_loss'
        },
        smooth: {
            value: 0.9,
            description: 'Fluide - transitions naturelles',
            causes: ['intermediate_proficiency', 'comfort', 'practice'],
            impact: 'optimal_communication'
        },
        flowing: {
            value: 1.0,
            description: 'Coulant - maîtrise experte',
            causes: ['native_fluency', 'artistic_expression', 'emotional_engagement'],
            impact: 'enhanced_expression'
        }
    },

    // Patterns de pauses linguistiques
    pausePatterns: {
        syntactic: {
            description: 'Pauses syntaxiques (structure grammaticale)',
            positions: ['clause_boundary', 'sentence_end', 'topic_shift'],
            duration_range: [0.3, 0.8],
            function: 'grammatical_structure'
        },
        semantic: {
            description: 'Pauses sémantiques (clarification du sens)',
            positions: ['after_important_concept', 'before_conclusion', 'emphasis_point'],
            duration_range: [0.2, 0.6],
            function: 'meaning_clarification'
        },
        prosodic: {
            description: 'Pauses prosodiques (rythme expressif)',
            positions: ['dramatic_effect', 'emotional_peak', 'artistic_expression'],
            duration_range: [0.1, 1.5],
            function: 'expressive_enhancement'
        },
        hesitation: {
            description: 'Pauses d\'hésitation (recherche lexicale)',
            positions: ['word_search', 'uncertainty', 'self_correction'],
            duration_range: [0.5, 2.0],
            function: 'cognitive_processing'
        }
    },

    // Micro-temporalités gestuelles
    microTimings: {
        onset: {
            description: 'Début du geste',
            precision_required: 'high',
            common_errors: ['delayed_start', 'false_start', 'preparation_visible']
        },
        stroke: {
            description: 'Phase active du geste',
            precision_required: 'critical',
            common_errors: ['rushed_execution', 'incomplete_stroke', 'trajectory_deviation']
        },
        hold: {
            description: 'Maintien du geste',
            precision_required: 'moderate',
            common_errors: ['premature_release', 'instability', 'drift']
        },
        retraction: {
            description: 'Retour à la position neutre',
            precision_required: 'low',
            common_errors: ['abrupt_ending', 'incomplete_return', 'overshoot']
        }
    },

    // Métriques temporelles avancées
    rhythmMetrics: {
        regularity: {
            measurement: 'coefficient_of_variation',
            ideal_range: [0.05, 0.15],
            description: 'Consistance du rythme'
        },
        predictability: {
            measurement: 'entropy_measure',
            ideal_range: [0.3, 0.7],
            description: 'Prévisibilité des patterns temporels'
        },
        flow_index: {
            measurement: 'transition_smoothness',
            ideal_range: [0.8, 1.0],
            description: 'Indice de fluidité des transitions'
        },
        temporal_precision: {
            measurement: 'timing_accuracy',
            ideal_range: [0.9, 1.0],
            description: 'Précision temporelle absolue'
        }
    },

    // Niveaux de difficulté rythmique
    difficulty: {
        beginner: {
            tempos: ['slow', 'moderate'],
            fluidity_required: 0.4,
            pause_tolerance: 'high',
            micro_timing_precision: 'low'
        },
        intermediate: {
            tempos: ['moderate', 'fast'],
            fluidity_required: 0.7,
            pause_tolerance: 'medium',
            micro_timing_precision: 'medium'
        },
        advanced: {
            tempos: ['all'],
            fluidity_required: 0.9,
            pause_tolerance: 'low',
            micro_timing_precision: 'high'
        }
    }
} as const;