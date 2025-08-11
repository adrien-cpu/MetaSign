//src/ai/system/expressions/cultural/__tests__/utils/constants/cultural-test-constants.ts

/**
 * Constantes pour les tests culturels
 */
export const CULTURAL_TEST_CONSTANTS = {
    // Générateurs de scénarios culturels
    SCENARIO_GENERATORS: {
        CULTURAL_CONTEXTS: {
            REGIONAL: {
                PARIS: {
                    dialect_markers: ['STANDARD_LSF', 'URBAN_VARIANTS'],
                    cultural_specifics: ['FORMAL_ACADEMIC', 'INSTITUTIONAL'],
                    community_traits: ['DIVERSE', 'HISTORICALLY_ROOTED']
                },
                TOULOUSE: {
                    dialect_markers: ['SOUTHERN_VARIANTS', 'REGIONAL_SPECIFICS'],
                    cultural_specifics: ['COMMUNITY_CENTERED', 'TRADITIONAL'],
                    community_traits: ['CLOSE_KNIT', 'PRESERVING']
                },
                MARSEILLE: {
                    dialect_markers: ['MEDITERRANEAN_STYLE', 'LOCAL_INNOVATIONS'],
                    cultural_specifics: ['EXPRESSIVE', 'COMMUNITY_DRIVEN'],
                    community_traits: ['DYNAMIC', 'EVOLVING']
                }
            },

            GENERATIONAL: {
                ELDER: {
                    respect_markers: ['FORMAL_ADDRESS', 'TRADITIONAL_SIGNS'],
                    cultural_weight: 'HIGH',
                    adaptation_flexibility: 'LOW'
                },
                ADULT: {
                    respect_markers: ['BALANCED_APPROACH', 'CULTURAL_AWARENESS'],
                    cultural_weight: 'MEDIUM',
                    adaptation_flexibility: 'MODERATE'
                },
                YOUTH: {
                    respect_markers: ['INNOVATIVE_RESPECTFUL', 'MODERN_INTEGRATION'],
                    cultural_weight: 'MODERATE',
                    adaptation_flexibility: 'HIGH'
                }
            }
        },

        EMERGENCY_VARIATIONS: {
            INTENSITY_LEVELS: {
                CRITICAL: {
                    time_pressure: 'EXTREME',
                    clarity_requirements: 'MAXIMUM',
                    cultural_preservation: 'ESSENTIAL_MINIMUM'
                },
                HIGH: {
                    time_pressure: 'SIGNIFICANT',
                    clarity_requirements: 'HIGH',
                    cultural_preservation: 'BALANCED'
                },
                MODERATE: {
                    time_pressure: 'NORMAL',
                    clarity_requirements: 'STANDARD',
                    cultural_preservation: 'FULL'
                }
            },

            COMPLEXITY_FACTORS: {
                ENVIRONMENTAL: ['POOR_VISIBILITY', 'NOISE', 'SPACE_CONSTRAINTS'],
                SOCIAL: ['MIXED_GROUPS', 'VARYING_PROFICIENCY', 'CULTURAL_DIVERSITY'],
                TECHNICAL: ['SYSTEM_LIMITATIONS', 'COMMUNICATION_BARRIERS']
            }
        }
    },

    // Validateurs automatisés
    AUTOMATED_VALIDATORS: {
        CULTURAL_CHECKS: {
            LINGUISTIC: {
                validateSpatialGrammar: () => ({
                    isValid: true,
                    score: 0.95,
                    violations: []
                }),
                validateNonManualComponents: () => ({
                    isValid: true,
                    score: 0.98,
                    violations: []
                })
            },

            RESPECT: {
                validateElderInteraction: () => ({
                    isValid: true,
                    score: 0.97,
                    violations: []
                }),
                validateCommunityNorms: () => ({
                    isValid: true,
                    score: 0.96,
                    violations: []
                })
            }
        },

        EMERGENCY_CHECKS: {
            validateClarity: () => ({
                isValid: true,
                score: 0.94,
                improvements: []
            }),
            validateEffectiveness: () => ({
                isValid: true,
                score: 0.92,
                improvements: []
            })
        }
    },

    // Métriques d'évaluation
    EVALUATION_METRICS: {
        CULTURAL_METRICS: {
            authenticity: {
                weight: 0.4,
                thresholds: {
                    minimum: 0.85,
                    target: 0.95
                }
            },
            respect: {
                weight: 0.3,
                thresholds: {
                    minimum: 0.90,
                    target: 0.98
                }
            },
            preservation: {
                weight: 0.3,
                thresholds: {
                    minimum: 0.88,
                    target: 0.96
                }
            }
        },

        EMERGENCY_METRICS: {
            clarity: {
                weight: 0.4,
                thresholds: {
                    minimum: 0.90,
                    target: 0.98
                }
            },
            speed: {
                weight: 0.3,
                thresholds: {
                    minimum: 0.85,
                    target: 0.95
                }
            },
            effectiveness: {
                weight: 0.3,
                thresholds: {
                    minimum: 0.88,
                    target: 0.96
                }
            }
        }
    }
};