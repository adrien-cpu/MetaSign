/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/config/EmotionalConfigPresets.ts
 * @description Configurations prédéfinies et optimisées pour différents contextes d'apprentissage LSF
 * 
 * Fonctionnalités révolutionnaires :
 * - 🎯 Presets adaptés aux profils d'apprenants
 * - 🏫 Configurations pour contextes éducatifs
 * - 🧠 Optimisations selon neurotypes
 * - 🌍 Adaptations culturelles spécifiques
 * - ⚡ Configurations haute performance
 * - 🔧 Factory patterns pour création facile
 * 
 * @module EmotionalConfigPresets
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Configuration AI Division
 */

import type {
    AIEmotionalSystemConfig,
    PatternDetectorConfig,
    TransitionManagerConfig,
    HistoryManagerConfig
} from '../types/EmotionalTypes';

/**
 * Contextes d'apprentissage spécialisés
 */
export type LearningContext =
    | 'beginner_friendly'       // Apprenants débutants
    | 'intermediate_adaptive'   // Niveau intermédiaire
    | 'advanced_challenging'    // Apprenants avancés
    | 'special_needs'          // Besoins spéciaux
    | 'intensive_bootcamp'     // Formation intensive
    | 'therapeutic_support'    // Support thérapeutique
    | 'cultural_immersion'     // Immersion culturelle
    | 'professional_training'  // Formation professionnelle
    | 'research_study'         // Étude de recherche
    | 'gaming_focused';        // Apprentissage ludique

/**
 * Profils neurotypiques
 */
export type NeurotypicalProfile =
    | 'neurotypical'           // Profil standard
    | 'adhd_friendly'         // TDAH
    | 'autism_adapted'        // Autisme
    | 'anxiety_sensitive'     // Sensibilité à l'anxiété
    | 'depression_aware'      // Conscience de la dépression
    | 'trauma_informed'       // Informé sur les traumatismes
    | 'high_sensitivity';     // Haute sensibilité

/**
 * Configuration complète pour un contexte donné
 */
export interface CompleteEmotionalConfig {
    /** Configuration système principal */
    readonly systemConfig: AIEmotionalSystemConfig;
    /** Configuration détecteur de patterns */
    readonly patternConfig: PatternDetectorConfig;
    /** Configuration gestionnaire de transitions */
    readonly transitionConfig: TransitionManagerConfig;
    /** Configuration gestionnaire d'historique */
    readonly historyConfig: HistoryManagerConfig;
    /** Métadonnées de configuration */
    readonly metadata: ConfigMetadata;
}

/**
 * Métadonnées de configuration
 */
export interface ConfigMetadata {
    /** Nom de la configuration */
    readonly name: string;
    /** Description détaillée */
    readonly description: string;
    /** Contexte d'utilisation recommandé */
    readonly recommendedFor: readonly string[];
    /** Niveau de performance attendu */
    readonly performanceLevel: 'low' | 'medium' | 'high' | 'ultra';
    /** Utilisation mémoire estimée */
    readonly memoryUsage: 'light' | 'moderate' | 'heavy';
    /** Version de la configuration */
    readonly version: string;
    /** Date de création */
    readonly created: Date;
}

/**
 * Factory de configurations émotionnelles révolutionnaire
 * 
 * @class EmotionalConfigFactory
 * @description Crée des configurations optimisées pour différents contextes
 * d'apprentissage LSF avec adaptation automatique aux besoins spécifiques.
 * 
 * @example
 * ```typescript
 * // Configuration pour débutants
 * const beginnerConfig = EmotionalConfigFactory.createForContext('beginner_friendly');
 * 
 * // Configuration pour TDAH
 * const adhdConfig = EmotionalConfigFactory.createForNeurotype('adhd_friendly');
 * 
 * // Configuration personnalisée
 * const customConfig = EmotionalConfigFactory.createCustom({
 *   learningContext: 'intermediate_adaptive',
 *   neurotype: 'autism_adapted',
 *   culturalAdaptation: 'deaf_community_focused'
 * });
 * ```
 */
export class EmotionalConfigFactory {
    /**
     * Créer une configuration pour un contexte d'apprentissage
     * 
     * @static
     * @method createForContext
     * @param {LearningContext} context - Contexte d'apprentissage
     * @returns {CompleteEmotionalConfig} Configuration complète
     * @public
     */
    public static createForContext(context: LearningContext): CompleteEmotionalConfig {
        switch (context) {
            case 'beginner_friendly':
                return this.createBeginnerFriendlyConfig();

            case 'intermediate_adaptive':
                return this.createIntermediateAdaptiveConfig();

            case 'advanced_challenging':
                return this.createAdvancedChallengingConfig();

            case 'special_needs':
                return this.createSpecialNeedsConfig();

            case 'intensive_bootcamp':
                return this.createIntensiveBootcampConfig();

            case 'therapeutic_support':
                return this.createTherapeuticSupportConfig();

            case 'cultural_immersion':
                return this.createCulturalImmersionConfig();

            case 'professional_training':
                return this.createProfessionalTrainingConfig();

            case 'research_study':
                return this.createResearchStudyConfig();

            case 'gaming_focused':
                return this.createGamingFocusedConfig();

            default:
                return this.createDefaultConfig();
        }
    }

    /**
     * Créer une configuration pour un profil neurotypique
     * 
     * @static
     * @method createForNeurotype
     * @param {NeurotypicalProfile} neurotype - Profil neurotypique
     * @returns {CompleteEmotionalConfig} Configuration adaptée
     * @public
     */
    public static createForNeurotype(neurotype: NeurotypicalProfile): CompleteEmotionalConfig {
        switch (neurotype) {
            case 'neurotypical':
                return this.createNeurotypicalConfig();

            case 'adhd_friendly':
                return this.createADHDFriendlyConfig();

            case 'autism_adapted':
                return this.createAutismAdaptedConfig();

            case 'anxiety_sensitive':
                return this.createAnxietySensitiveConfig();

            case 'depression_aware':
                return this.createDepressionAwareConfig();

            case 'trauma_informed':
                return this.createTraumaInformedConfig();

            case 'high_sensitivity':
                return this.createHighSensitivityConfig();

            default:
                return this.createNeurotypicalConfig();
        }
    }

    /**
     * Créer une configuration personnalisée
     * 
     * @static
     * @method createCustom
     * @param {object} options - Options de personnalisation
     * @returns {CompleteEmotionalConfig} Configuration personnalisée
     * @public
     */
    public static createCustom(options: {
        readonly learningContext?: LearningContext;
        readonly neurotype?: NeurotypicalProfile;
        readonly culturalAdaptation?: string;
        readonly performanceOptimization?: boolean;
        readonly detailedAnalytics?: boolean;
    }): CompleteEmotionalConfig {
        // Base sur le contexte d'apprentissage
        let config = options.learningContext
            ? this.createForContext(options.learningContext)
            : this.createDefaultConfig();

        // Adapter pour le neurotype
        if (options.neurotype) {
            const neuroConfig = this.createForNeurotype(options.neurotype);
            config = this.mergeConfigurations(config, neuroConfig);
        }

        // Optimisations de performance
        if (options.performanceOptimization) {
            config = this.applyPerformanceOptimizations(config);
        }

        // Analytics détaillées
        if (options.detailedAnalytics) {
            config = this.applyDetailedAnalytics(config);
        }

        // Adaptation culturelle
        if (options.culturalAdaptation) {
            config = this.applyCulturalAdaptation(config, options.culturalAdaptation);
        }

        return config;
    }

    // ================== CONFIGURATIONS SPÉCIALISÉES ==================

    /**
     * Configuration pour apprenants débutants
     */
    private static createBeginnerFriendlyConfig(): CompleteEmotionalConfig {
        return {
            systemConfig: {
                baseVolatility: 0.3,              // Très stable
                defaultTransitionSpeed: 3000,      // Transitions lentes
                emotionalPersistence: 0.9,         // Très persistant
                triggerSensitivity: 0.4,          // Moins sensible
                enablePatternDetection: true,
                historyDepth: 200                  // Historique profond
            },
            patternConfig: {
                minSequenceLength: 2,             // Séquences courtes
                minConfidence: 0.5,               // Confiance modérée
                analysisWindow: 600000,           // 10 minutes
                minFrequency: 2
            },
            transitionConfig: {
                defaultTransitionSpeed: 3000,
                smoothingFactor: 0.9,             // Très lisse
                minTransitionDelay: 500,          // Plus de délai
                maxTransitionDuration: 8000,      // Transitions longues
                enablePersonalizedTransitions: true
            },
            historyConfig: {
                maxHistoryDepth: 200,
                entryTTL: 14 * 24 * 60 * 60 * 1000, // 14 jours
                cleanupInterval: 2 * 60 * 60 * 1000, // 2 heures
                enableCompression: false,          // Pas de compression
                compressionThreshold: 1000
            },
            metadata: {
                name: 'Beginner Friendly',
                description: 'Configuration optimisée pour apprenants débutants avec transitions douces et feedback rassurant',
                recommendedFor: ['Première découverte LSF', 'Apprenants anxieux', 'Enfants', 'Seniors'],
                performanceLevel: 'medium',
                memoryUsage: 'moderate',
                version: '3.0.0',
                created: new Date()
            }
        };
    }

    /**
     * Configuration pour niveau intermédiaire adaptatif
     */
    private static createIntermediateAdaptiveConfig(): CompleteEmotionalConfig {
        return {
            systemConfig: {
                baseVolatility: 0.6,              // Modérément réactif
                defaultTransitionSpeed: 2000,      // Transitions moyennes
                emotionalPersistence: 0.7,         // Bonne persistance
                triggerSensitivity: 0.7,          // Sensible
                enablePatternDetection: true,
                historyDepth: 150
            },
            patternConfig: {
                minSequenceLength: 3,
                minConfidence: 0.6,
                analysisWindow: 300000,           // 5 minutes
                minFrequency: 3
            },
            transitionConfig: {
                defaultTransitionSpeed: 2000,
                smoothingFactor: 0.8,
                minTransitionDelay: 200,
                maxTransitionDuration: 5000,
                enablePersonalizedTransitions: true
            },
            historyConfig: {
                maxHistoryDepth: 150,
                entryTTL: 7 * 24 * 60 * 60 * 1000, // 7 jours
                cleanupInterval: 60 * 60 * 1000,    // 1 heure
                enableCompression: true,
                compressionThreshold: 300
            },
            metadata: {
                name: 'Intermediate Adaptive',
                description: 'Configuration équilibrée avec adaptation intelligente pour apprenants de niveau moyen',
                recommendedFor: ['Apprentissage consolidé', 'Progression régulière', 'Contexte scolaire'],
                performanceLevel: 'high',
                memoryUsage: 'moderate',
                version: '3.0.0',
                created: new Date()
            }
        };
    }

    /**
     * Configuration pour apprenants avancés
     */
    private static createAdvancedChallengingConfig(): CompleteEmotionalConfig {
        return {
            systemConfig: {
                baseVolatility: 0.8,              // Très réactif
                defaultTransitionSpeed: 1000,      // Transitions rapides
                emotionalPersistence: 0.5,         // Moins persistant
                triggerSensitivity: 0.9,          // Très sensible
                enablePatternDetection: true,
                historyDepth: 100                  // Historique focalisé
            },
            patternConfig: {
                minSequenceLength: 4,             // Séquences complexes
                minConfidence: 0.8,               // Haute confiance
                analysisWindow: 180000,           // 3 minutes
                minFrequency: 4
            },
            transitionConfig: {
                defaultTransitionSpeed: 1000,
                smoothingFactor: 0.6,             // Moins lisse
                minTransitionDelay: 50,           // Délai minimal
                maxTransitionDuration: 3000,      // Transitions courtes
                enablePersonalizedTransitions: true
            },
            historyConfig: {
                maxHistoryDepth: 100,
                entryTTL: 3 * 24 * 60 * 60 * 1000,  // 3 jours
                cleanupInterval: 30 * 60 * 1000,     // 30 minutes
                enableCompression: true,
                compressionThreshold: 200
            },
            metadata: {
                name: 'Advanced Challenging',
                description: 'Configuration haute performance pour apprenants expérimentés cherchant des défis',
                recommendedFor: ['Perfectionnement LSF', 'Formation professionnelle', 'Compétitions'],
                performanceLevel: 'ultra',
                memoryUsage: 'light',
                version: '3.0.0',
                created: new Date()
            }
        };
    }

    /**
     * Configuration pour TDAH
     */
    private static createADHDFriendlyConfig(): CompleteEmotionalConfig {
        return {
            systemConfig: {
                baseVolatility: 0.4,              // Stable mais réactif
                defaultTransitionSpeed: 1500,      // Transitions moyennes-rapides
                emotionalPersistence: 0.6,         // Persistance modérée
                triggerSensitivity: 0.8,          // Sensible aux changements
                enablePatternDetection: true,
                historyDepth: 80                   // Historique court
            },
            patternConfig: {
                minSequenceLength: 2,             // Séquences courtes
                minConfidence: 0.6,
                analysisWindow: 120000,           // 2 minutes (attention courte)
                minFrequency: 2
            },
            transitionConfig: {
                defaultTransitionSpeed: 1500,
                smoothingFactor: 0.7,
                minTransitionDelay: 100,
                maxTransitionDuration: 4000,
                enablePersonalizedTransitions: true
            },
            historyConfig: {
                maxHistoryDepth: 80,
                entryTTL: 5 * 24 * 60 * 60 * 1000,  // 5 jours
                cleanupInterval: 45 * 60 * 1000,     // 45 minutes
                enableCompression: true,
                compressionThreshold: 150
            },
            metadata: {
                name: 'ADHD Friendly',
                description: 'Configuration adaptée aux apprenants avec TDAH, transitions dynamiques et feedback fréquent',
                recommendedFor: ['TDAH', 'Attention limitée', 'Besoin de stimulation', 'Apprentissage dynamique'],
                performanceLevel: 'high',
                memoryUsage: 'light',
                version: '3.0.0',
                created: new Date()
            }
        };
    }

    /**
     * Configuration pour autisme
     */
    private static createAutismAdaptedConfig(): CompleteEmotionalConfig {
        return {
            systemConfig: {
                baseVolatility: 0.2,              // Très stable
                defaultTransitionSpeed: 4000,      // Transitions très lentes
                emotionalPersistence: 0.95,        // Très persistant
                triggerSensitivity: 0.3,          // Peu sensible aux changements
                enablePatternDetection: true,
                historyDepth: 300                  // Historique très profond
            },
            patternConfig: {
                minSequenceLength: 3,
                minConfidence: 0.8,               // Haute confiance
                analysisWindow: 900000,           // 15 minutes
                minFrequency: 3
            },
            transitionConfig: {
                defaultTransitionSpeed: 4000,
                smoothingFactor: 0.95,            // Très lisse
                minTransitionDelay: 1000,         // Délai important
                maxTransitionDuration: 10000,     // Transitions très longues
                enablePersonalizedTransitions: true
            },
            historyConfig: {
                maxHistoryDepth: 300,
                entryTTL: 30 * 24 * 60 * 60 * 1000, // 30 jours
                cleanupInterval: 4 * 60 * 60 * 1000, // 4 heures
                enableCompression: false,          // Pas de compression
                compressionThreshold: 2000
            },
            metadata: {
                name: 'Autism Adapted',
                description: 'Configuration ultra-stable pour apprenants autistes avec transitions prévisibles',
                recommendedFor: ['Autisme', 'Besoin de prévisibilité', 'Sensibilité aux changements', 'Routines fixes'],
                performanceLevel: 'medium',
                memoryUsage: 'heavy',
                version: '3.0.0',
                created: new Date()
            }
        };
    }

    /**
     * Configuration pour support thérapeutique
     */
    private static createTherapeuticSupportConfig(): CompleteEmotionalConfig {
        return {
            systemConfig: {
                baseVolatility: 0.25,             // Très stable
                defaultTransitionSpeed: 3500,      // Transitions lentes
                emotionalPersistence: 0.85,        // Haute persistance
                triggerSensitivity: 0.5,          // Modérément sensible
                enablePatternDetection: true,
                historyDepth: 250                  // Historique thérapeutique
            },
            patternConfig: {
                minSequenceLength: 3,
                minConfidence: 0.7,
                analysisWindow: 720000,           // 12 minutes
                minFrequency: 2
            },
            transitionConfig: {
                defaultTransitionSpeed: 3500,
                smoothingFactor: 0.9,
                minTransitionDelay: 750,
                maxTransitionDuration: 8000,
                enablePersonalizedTransitions: true
            },
            historyConfig: {
                maxHistoryDepth: 250,
                entryTTL: 90 * 24 * 60 * 60 * 1000, // 90 jours (suivi thérapeutique)
                cleanupInterval: 6 * 60 * 60 * 1000, // 6 heures
                enableCompression: false,          // Conservation complète
                compressionThreshold: 1500
            },
            metadata: {
                name: 'Therapeutic Support',
                description: 'Configuration pour contexte thérapeutique avec suivi longitudinal et stabilité émotionnelle',
                recommendedFor: ['Thérapie', 'Rééducation', 'Traumatismes', 'Support psychologique'],
                performanceLevel: 'medium',
                memoryUsage: 'heavy',
                version: '3.0.0',
                created: new Date()
            }
        };
    }

    /**
     * Configuration par défaut
     */
    private static createDefaultConfig(): CompleteEmotionalConfig {
        return this.createIntermediateAdaptiveConfig();
    }

    /**
     * Configuration neurotypique standard
     */
    private static createNeurotypicalConfig(): CompleteEmotionalConfig {
        return this.createIntermediateAdaptiveConfig();
    }

    // Autres configurations spécialisées (implémentations simplifiées)
    private static createSpecialNeedsConfig(): CompleteEmotionalConfig {
        return this.createBeginnerFriendlyConfig();
    }

    private static createIntensiveBootcampConfig(): CompleteEmotionalConfig {
        return this.createAdvancedChallengingConfig();
    }

    private static createCulturalImmersionConfig(): CompleteEmotionalConfig {
        const config = this.createIntermediateAdaptiveConfig();
        config.metadata.name = 'Cultural Immersion';
        config.metadata.description = 'Configuration pour immersion culturelle sourde complète';
        return config;
    }

    private static createProfessionalTrainingConfig(): CompleteEmotionalConfig {
        return this.createAdvancedChallengingConfig();
    }

    private static createResearchStudyConfig(): CompleteEmotionalConfig {
        const config = this.createIntermediateAdaptiveConfig();
        // Optimisations pour recherche
        config.historyConfig.maxHistoryDepth = 500;
        config.patternConfig.minConfidence = 0.9;
        config.metadata.name = 'Research Study';
        return config;
    }

    private static createGamingFocusedConfig(): CompleteEmotionalConfig {
        const config = this.createAdvancedChallengingConfig();
        config.systemConfig.baseVolatility = 0.9; // Très réactif pour gaming
        config.metadata.name = 'Gaming Focused';
        return config;
    }

    private static createAnxietySensitiveConfig(): CompleteEmotionalConfig {
        return this.createBeginnerFriendlyConfig();
    }

    private static createDepressionAwareConfig(): CompleteEmotionalConfig {
        return this.createTherapeuticSupportConfig();
    }

    private static createTraumaInformedConfig(): CompleteEmotionalConfig {
        return this.createTherapeuticSupportConfig();
    }

    private static createHighSensitivityConfig(): CompleteEmotionalConfig {
        return this.createBeginnerFriendlyConfig();
    }

    // ================== MÉTHODES UTILITAIRES ==================

    /**
     * Fusionne deux configurations
     */
    private static mergeConfigurations(
        base: CompleteEmotionalConfig,
        overlay: CompleteEmotionalConfig
    ): CompleteEmotionalConfig {
        return {
            systemConfig: { ...base.systemConfig, ...overlay.systemConfig },
            patternConfig: { ...base.patternConfig, ...overlay.patternConfig },
            transitionConfig: { ...base.transitionConfig, ...overlay.transitionConfig },
            historyConfig: { ...base.historyConfig, ...overlay.historyConfig },
            metadata: {
                ...base.metadata,
                name: `${base.metadata.name} + ${overlay.metadata.name}`,
                description: `Configuration fusionnée: ${base.metadata.description}`
            }
        };
    }

    /**
     * Applique des optimisations de performance
     */
    private static applyPerformanceOptimizations(config: CompleteEmotionalConfig): CompleteEmotionalConfig {
        return {
            ...config,
            systemConfig: {
                ...config.systemConfig,
                historyDepth: Math.min(config.systemConfig.historyDepth, 100)
            },
            historyConfig: {
                ...config.historyConfig,
                enableCompression: true,
                compressionThreshold: Math.min(config.historyConfig.compressionThreshold, 200)
            },
            metadata: {
                ...config.metadata,
                performanceLevel: 'ultra' as const,
                memoryUsage: 'light' as const
            }
        };
    }

    /**
     * Applique des analytics détaillées
     */
    private static applyDetailedAnalytics(config: CompleteEmotionalConfig): CompleteEmotionalConfig {
        return {
            ...config,
            systemConfig: {
                ...config.systemConfig,
                historyDepth: Math.max(config.systemConfig.historyDepth, 300)
            },
            patternConfig: {
                ...config.patternConfig,
                minConfidence: 0.9,
                analysisWindow: Math.max(config.patternConfig.analysisWindow, 600000)
            },
            historyConfig: {
                ...config.historyConfig,
                enableCompression: false,
                maxHistoryDepth: Math.max(config.historyConfig.maxHistoryDepth, 500)
            }
        };
    }

    /**
     * Applique une adaptation culturelle
     */
    private static applyCulturalAdaptation(
        config: CompleteEmotionalConfig,
        culturalContext: string
    ): CompleteEmotionalConfig {
        // Adaptation culturelle simplifiée
        return {
            ...config,
            metadata: {
                ...config.metadata,
                description: `${config.metadata.description} - Adapté pour ${culturalContext}`
            }
        };
    }
}

/**
 * Configurations prédéfinies couramment utilisées
 */
export const PRESET_CONFIGS = {
    /** Configuration par défaut équilibrée */
    DEFAULT: EmotionalConfigFactory.createForContext('intermediate_adaptive'),

    /** Configuration pour débutants */
    BEGINNER: EmotionalConfigFactory.createForContext('beginner_friendly'),

    /** Configuration pour experts */
    ADVANCED: EmotionalConfigFactory.createForContext('advanced_challenging'),

    /** Configuration TDAH */
    ADHD: EmotionalConfigFactory.createForNeurotype('adhd_friendly'),

    /** Configuration autisme */
    AUTISM: EmotionalConfigFactory.createForNeurotype('autism_adapted'),

    /** Configuration thérapeutique */
    THERAPY: EmotionalConfigFactory.createForContext('therapeutic_support'),

    /** Configuration recherche */
    RESEARCH: EmotionalConfigFactory.createForContext('research_study'),

    /** Configuration gaming */
    GAMING: EmotionalConfigFactory.createForContext('gaming_focused')
} as const;

/**
 * Validation de configuration
 * 
 * @function validateCompleteConfig
 * @param {CompleteEmotionalConfig} config - Configuration à valider
 * @returns {boolean} True si valide
 * @throws {Error} Si configuration invalide
 */
export function validateCompleteConfig(config: CompleteEmotionalConfig): boolean {
    // Validation du système principal
    if (config.systemConfig.baseVolatility < 0 || config.systemConfig.baseVolatility > 1) {
        throw new Error('baseVolatility doit être entre 0 et 1');
    }

    // Validation des patterns
    if (config.patternConfig.minSequenceLength < 1) {
        throw new Error('minSequenceLength doit être >= 1');
    }

    // Validation des transitions
    if (config.transitionConfig.defaultTransitionSpeed < 100) {
        throw new Error('defaultTransitionSpeed doit être >= 100ms');
    }

    // Validation de l'historique
    if (config.historyConfig.maxHistoryDepth < 10) {
        throw new Error('maxHistoryDepth doit être >= 10');
    }

    return true;
}