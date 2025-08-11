// src/ai/systems/expressions/cultural/__tests__/utils/generators/ScenarioGenerator.ts

import {
    Challenge,
    ComplexScenario,
    ComplexityLevel,
    CulturalRequirements,
    ScenarioData,
    ScenarioParameters,
    SuccessCriteria
} from '../types/scenario-types';
import { describeChallengeFromKey } from '../helpers/ScenarioUtils';

/**
 * Générateur de scénarios pour les tests culturels complexes
 */
export class ScenarioGenerator {
    /**
     * Structure de données des scénarios complexes
     */
    private readonly COMPLEX_SCENARIOS = {
        // Scénarios multi-factoriels
        MULTI_FACTOR_SCENARIOS: {
            CULTURAL_COLLISION: {
                description: "Conflit entre traditions régionales différentes durant une urgence",
                setup: {
                    primary_region: {
                        type: 'PARIS',
                        traditions: ['ACADEMIC_FORMAL', 'INSTITUTIONAL'],
                        community_expectations: 'HIGH'
                    },
                    visiting_region: {
                        type: 'MARSEILLE',
                        traditions: ['EXPRESSIVE_INFORMAL', 'COMMUNITY_BASED'],
                        adaptation_level: 'REQUIRED'
                    },
                    emergency_context: {
                        type: 'EVACUATION',
                        urgency: 'HIGH',
                        complexity: 'SEVERE'
                    }
                },
                challenges: {
                    cultural: [
                        'STYLE_DIFFERENCES',
                        'RESPECT_HIERARCHIES',
                        'COMMUNICATION_PREFERENCES'
                    ],
                    emergency: [
                        'TIME_PRESSURE',
                        'MULTI_GROUP_COORDINATION',
                        'CLARITY_MAINTENANCE'
                    ],
                    social: [
                        'GROUP_DYNAMICS',
                        'AUTHORITY_RECOGNITION',
                        'FACE_SAVING'
                    ]
                }
            },

            GENERATIONAL_COMPLEXITY: {
                description: "Gestion simultanée de différentes générations avec besoins spécifiques",
                setup: {
                    population_mix: {
                        elders: {
                            count: 15,
                            needs: ['TRADITIONAL_RESPECT', 'PHYSICAL_SUPPORT'],
                            communication_style: 'FORMAL_TRADITIONAL'
                        },
                        adults: {
                            count: 40,
                            needs: ['CLEAR_DIRECTION', 'ROLE_ASSIGNMENT'],
                            communication_style: 'BALANCED'
                        },
                        youth: {
                            count: 25,
                            needs: ['RAPID_ADAPTATION', 'TECH_INTEGRATION'],
                            communication_style: 'MODERN_ADAPTIVE'
                        }
                    },
                    emergency_factors: {
                        type: 'COMPLEX_EVACUATION',
                        time_constraints: 'SEVERE',
                        physical_challenges: ['STAIRS', 'DISTANCE', 'OBSTACLES']
                    }
                },
                requirements: {
                    respect_maintenance: 'ABSOLUTE',
                    efficiency_balance: 'CRITICAL',
                    cultural_preservation: 'ESSENTIAL'
                }
            }
        },

        // Scénarios technologiques complexes
        TECH_COMPLEXITY: {
            SYSTEM_DEGRADATION: {
                description: "Dégradation progressive des systèmes technologiques",
                phases: [
                    {
                        name: 'INITIAL_DEGRADATION',
                        conditions: {
                            lighting: 'PARTIAL',
                            visual_aids: 'DEGRADING',
                            communication_systems: 'INTERMITTENT'
                        },
                        required_adaptations: [
                            'SIGNAL_AMPLIFICATION',
                            'REDUNDANCY_INCREASE',
                            'VISUAL_ENHANCEMENT'
                        ]
                    },
                    {
                        name: 'SEVERE_LIMITATION',
                        conditions: {
                            lighting: 'MINIMAL',
                            visual_aids: 'FAILED',
                            communication_systems: 'DOWN'
                        },
                        required_adaptations: [
                            'MANUAL_FALLBACK',
                            'GROUP_RELAY',
                            'PRIMITIVE_SIGNALS'
                        ]
                    }
                ],
                cultural_requirements: {
                    clarity_maintenance: 'CRITICAL',
                    respect_preservation: 'MANDATORY',
                    community_cohesion: 'ESSENTIAL'
                }
            }
        },

        // Scénarios d'évolution dynamique
        DYNAMIC_EVOLUTION: {
            CASCADING_EVENTS: {
                description: "Événements qui s'enchaînent et se complexifient",
                sequence: [
                    {
                        stage: 'INITIAL_EMERGENCY',
                        conditions: {
                            type: 'FIRE_ALERT',
                            complexity: 'MODERATE',
                            cultural_impact: 'MINIMAL'
                        }
                    },
                    {
                        stage: 'COMPLICATION',
                        conditions: {
                            type: 'STRUCTURAL_THREAT',
                            complexity: 'HIGH',
                            cultural_impact: 'SIGNIFICANT'
                        }
                    },
                    {
                        stage: 'CRITICAL_ESCALATION',
                        conditions: {
                            type: 'MULTI_THREAT',
                            complexity: 'SEVERE',
                            cultural_impact: 'MAXIMUM'
                        }
                    }
                ],
                adaptation_requirements: {
                    cultural_integrity: 'MAINTAINED',
                    response_efficiency: 'PROGRESSIVE',
                    community_support: 'ENHANCED'
                }
            }
        },

        // Scénarios de conflits culturels-pratiques
        CULTURAL_PRACTICAL_CONFLICTS: {
            EMERGENCY_TRADITIONS: {
                description: "Conflit entre traditions culturelles et nécessités d'urgence",
                conflicts: [
                    {
                        type: 'RESPECT_VS_SPEED',
                        context: {
                            cultural_requirement: 'FORMAL_ELDER_RESPECT',
                            emergency_need: 'RAPID_EVACUATION',
                            resolution_priority: 'BALANCED'
                        }
                    },
                    {
                        type: 'SPACE_VS_TRADITION',
                        context: {
                            cultural_requirement: 'TRADITIONAL_SPACING',
                            emergency_need: 'COMPACT_MOVEMENT',
                            resolution_priority: 'SAFETY_FIRST'
                        }
                    },
                    {
                        type: 'AUTHORITY_VS_EFFICIENCY',
                        context: {
                            cultural_requirement: 'HIERARCHICAL_RESPECT',
                            emergency_need: 'DIRECT_ACTION',
                            resolution_priority: 'SITUATION_DEPENDENT'
                        }
                    }
                ]
            }
        }
    };

    /**
     * Génère un scénario complexe en fonction des paramètres
     * @param type Type de scénario à générer
     * @param parameters Paramètres de personnalisation
     * @returns Scénario complexe généré
     */
    async generateComplexScenario(
        type: keyof typeof this.COMPLEX_SCENARIOS,
        parameters: ScenarioParameters
    ): Promise<ComplexScenario> {
        const baseScenario = this.COMPLEX_SCENARIOS[type];
        const adaptedScenario = await this.adaptScenarioToParameters(
            baseScenario,
            parameters
        );

        return {
            scenario: adaptedScenario,
            expectedChallenges: this.predictChallenges(adaptedScenario),
            successCriteria: this.defineSuccessCriteria(adaptedScenario),
            culturalRequirements: this.defineCulturalRequirements(adaptedScenario)
        };
    }

    /**
     * Adapte un scénario de base aux paramètres spécifiés
     * @param baseScenario Scénario de base
     * @param parameters Paramètres de personnalisation
     * @returns Scénario adapté
     */
    private async adaptScenarioToParameters(
        baseScenario: Record<string, ScenarioData>,
        parameters: ScenarioParameters
    ): Promise<ScenarioData> {
        // Sélectionner un sous-scénario basé sur la complexité
        const subScenarioKeys = Object.keys(baseScenario);
        let selectedKey: string;

        switch (parameters.complexity) {
            case ComplexityLevel.EXTREME:
            case ComplexityLevel.SEVERE:
                // Choisir les scénarios les plus complexes
                selectedKey = subScenarioKeys[subScenarioKeys.length - 1];
                break;
            case ComplexityLevel.HIGH:
                // Choisir un scénario de complexité moyenne à élevée
                selectedKey = subScenarioKeys[Math.floor(subScenarioKeys.length * 0.7)];
                break;
            case ComplexityLevel.MODERATE:
                // Choisir un scénario de complexité moyenne
                selectedKey = subScenarioKeys[Math.floor(subScenarioKeys.length * 0.5)];
                break;
            default:
                // Choisir un scénario simple
                selectedKey = subScenarioKeys[0];
        }

        const selectedScenario = baseScenario[selectedKey];

        // Adapter le scénario au contexte culturel
        const adaptedScenario: ScenarioData = {
            ...selectedScenario,
            setup: {
                ...selectedScenario.setup,
                cultural_context: {
                    region: parameters.culturalContext.region,
                    traditions: parameters.culturalContext.traditions,
                    adaptation_level: parameters.culturalContext.adaptationLevel,
                    community_expectations: parameters.culturalContext.communityExpectations
                },
                emergency_factors: parameters.emergencyFactors
            }
        };

        return adaptedScenario;
    }

    /**
     * Prédit les défis attendus pour un scénario
     * @param scenario Scénario à analyser
     * @returns Liste de défis prédits
     */
    private predictChallenges(scenario: ScenarioData): Challenge[] {
        const challenges: Challenge[] = [];

        // Extraire les défis culturels
        if (scenario.challenges?.cultural) {
            scenario.challenges.cultural.forEach((challenge: string) => {
                challenges.push({
                    type: 'CULTURAL',
                    description: describeChallengeFromKey(challenge),
                    severity: 'HIGH',
                    impact: ['COMMUNICATION', 'TRUST', 'COOPERATION']
                });
            });
        }

        // Extraire les défis d'urgence
        if (scenario.challenges?.emergency) {
            scenario.challenges.emergency.forEach((challenge: string) => {
                challenges.push({
                    type: 'EMERGENCY',
                    description: describeChallengeFromKey(challenge),
                    severity: 'CRITICAL',
                    impact: ['SAFETY', 'COORDINATION', 'EFFICIENCY']
                });
            });
        }

        // Extraire les défis sociaux
        if (scenario.challenges?.social) {
            scenario.challenges.social.forEach((challenge: string) => {
                challenges.push({
                    type: 'SOCIAL',
                    description: describeChallengeFromKey(challenge),
                    severity: 'MODERATE',
                    impact: ['GROUP_DYNAMICS', 'LEADERSHIP', 'PARTICIPATION']
                });
            });
        }

        return challenges;
    }

    /**
     * Définit les critères de succès pour un scénario
     * @param scenario Scénario à analyser (non utilisé actuellement)
     * @returns Critères de succès
     */
    private defineSuccessCriteria(_unused_scenario: ScenarioData): SuccessCriteria {
        // Critères essentiels basés sur la description du scénario
        const essentialRequirements = [
            "Communication claire et adaptée au contexte culturel",
            "Réponse efficace à la situation d'urgence",
            "Respect des sensibilités culturelles principales"
        ];

        // Critères optimaux
        const optimalOutcomes = [
            "Préservation totale des aspects culturels essentiels",
            "Résolution complète de la situation d'urgence",
            "Maintien de la cohésion de groupe pendant et après l'événement",
            "Participation équilibrée de tous les groupes culturels"
        ];

        return {
            essentialRequirements,
            optimalOutcomes,
            measurementCriteria: {
                cultural: [
                    "Respect des traditions clés",
                    "Adaptation contextuelle des communications",
                    "Préservation de la dignité des participants"
                ],
                practical: [
                    "Efficacité de la résolution de situation",
                    "Rapidité d'exécution appropriée",
                    "Coordination des groupes impliqués"
                ],
                balance: [
                    "Équilibre entre urgence et respect culturel",
                    "Adaptabilité sans compromettre les aspects essentiels",
                    "Préservation des relations à long terme"
                ]
            }
        };
    }

    /**
     * Définit les exigences culturelles pour un scénario
     * @param scenario Scénario à analyser (non utilisé actuellement)
     * @returns Exigences culturelles
     */
    private defineCulturalRequirements(_unused_scenario: ScenarioData): CulturalRequirements {
        // Éléments culturels à préserver absolument
        const mustPreserve = [
            "Respect des structures d'autorité culturelles",
            "Communication adaptée aux normes régionales",
            "Considération des sensibilités culturelles essentielles"
        ];

        // Éléments à considérer mais adaptables
        const shouldConsider = [
            "Formes d'adresse traditionnelles",
            "Disposition spatiale culturellement significative",
            "Séquences et rituels de communication"
        ];

        // Limites à l'adaptation culturelle
        const adaptationLimits = [
            "Maintien de la dignité et du respect en toute circonstance",
            "Éviter les ordres directs sans contexte aux aînés",
            "Préserver les concepts de respect hiérarchique essentiels"
        ];

        return {
            mustPreserve,
            shouldConsider,
            adaptationLimits,
            contextualFactors: {
                urgency: "Influence le degré d'adaptation acceptable",
                severity: "Détermine les priorités entre culture et efficacité",
                demographics: "Définit les aspects culturels les plus sensibles"
            }
        };
    }
}