/**
 * @file src/ai/services/learning/human/coda/codavirtuel/factory/EvolutionSystemFactory.ts
 * @description Factory pour créer et configurer le système d'évolution des IA-élèves
 * 
 * @module EvolutionSystemFactory
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Evolutionary AI Division
 */

import { AIEvolutionSystem } from '@/ai/services/learning/human/coda/codavirtuel/systems/AIEvolutionSystem';
import type { AIEvolutionSystemConfig } from '@/ai/services/learning/human/coda/codavirtuel/types/evolution.types';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Configurations prédéfinies pour différents environnements
 */
export const EVOLUTION_PRESETS = {
    /** Configuration pour développement avec évolution rapide */
    DEVELOPMENT: {
        evolutionSensitivity: 0.8,
        baseEvolutionRate: 0.1,
        evolutionThreshold: 0.05,
        changePersistence: 0.7,
        enableAutoOptimization: true,
        analysisDepth: 15
    } as AIEvolutionSystemConfig,

    /** Configuration pour production avec évolution stable */
    PRODUCTION: {
        evolutionSensitivity: 0.6,
        baseEvolutionRate: 0.03,
        evolutionThreshold: 0.1,
        changePersistence: 0.9,
        enableAutoOptimization: true,
        analysisDepth: 25
    } as AIEvolutionSystemConfig,

    /** Configuration pour tests avec évolution contrôlée */
    TESTING: {
        evolutionSensitivity: 0.5,
        baseEvolutionRate: 0.01,
        evolutionThreshold: 0.15,
        changePersistence: 0.8,
        enableAutoOptimization: false,
        analysisDepth: 10
    } as AIEvolutionSystemConfig,

    /** Configuration pour apprentissage accéléré */
    ACCELERATED: {
        evolutionSensitivity: 0.9,
        baseEvolutionRate: 0.15,
        evolutionThreshold: 0.03,
        changePersistence: 0.6,
        enableAutoOptimization: true,
        analysisDepth: 30
    } as AIEvolutionSystemConfig,

    /** Configuration pour apprentissage conservateur */
    CONSERVATIVE: {
        evolutionSensitivity: 0.4,
        baseEvolutionRate: 0.02,
        evolutionThreshold: 0.2,
        changePersistence: 0.95,
        enableAutoOptimization: true,
        analysisDepth: 20
    } as AIEvolutionSystemConfig
} as const;

/**
 * Type pour les presets disponibles
 */
export type EvolutionPreset = keyof typeof EVOLUTION_PRESETS;

/**
 * Factory pour créer des instances du système d'évolution
 * 
 * @class EvolutionSystemFactory
 * @description Simplifie la création et la configuration du système d'évolution
 * avec des presets optimisés pour différents cas d'usage.
 */
export class EvolutionSystemFactory {
    /**
     * Logger pour la factory
     * @private
     * @readonly
     */
    private static readonly logger = LoggerFactory.getLogger('EvolutionSystemFactory_v3');

    /**
     * Cache des instances créées
     * @private
     * @static
     */
    private static readonly instanceCache = new Map<string, AIEvolutionSystem>();

    /**
     * Crée une instance du système d'évolution avec un preset
     * 
     * @method createWithPreset
     * @static
     * @param {EvolutionPreset} preset - Preset de configuration
     * @param {Partial<AIEvolutionSystemConfig>} [overrides] - Surcharges de configuration
     * @returns {AIEvolutionSystem} Instance configurée du système
     * @public
     */
    public static createWithPreset(
        preset: EvolutionPreset,
        overrides?: Partial<AIEvolutionSystemConfig>
    ): AIEvolutionSystem {
        const baseConfig = EVOLUTION_PRESETS[preset];
        const finalConfig = { ...baseConfig, ...overrides };

        this.logger.info('🏭 Création système évolution avec preset', {
            preset,
            hasOverrides: !!overrides,
            finalConfig
        });

        return new AIEvolutionSystem(finalConfig);
    }

    /**
     * Crée une instance du système d'évolution avec configuration personnalisée
     * 
     * @method createCustom
     * @static
     * @param {AIEvolutionSystemConfig} config - Configuration personnalisée
     * @returns {AIEvolutionSystem} Instance configurée du système
     * @public
     */
    public static createCustom(config: AIEvolutionSystemConfig): AIEvolutionSystem {
        this.validateConfig(config);

        this.logger.info('🏭 Création système évolution personnalisé', { config });

        return new AIEvolutionSystem(config);
    }

    /**
     * Crée ou récupère une instance singleton avec cache
     * 
     * @method createSingleton
     * @static
     * @param {string} instanceId - Identifiant unique de l'instance
     * @param {EvolutionPreset} preset - Preset de configuration
     * @param {Partial<AIEvolutionSystemConfig>} [overrides] - Surcharges de configuration
     * @returns {AIEvolutionSystem} Instance singleton
     * @public
     */
    public static createSingleton(
        instanceId: string,
        preset: EvolutionPreset,
        overrides?: Partial<AIEvolutionSystemConfig>
    ): AIEvolutionSystem {
        if (this.instanceCache.has(instanceId)) {
            this.logger.debug('Récupération instance cache', { instanceId });
            return this.instanceCache.get(instanceId)!;
        }

        const instance = this.createWithPreset(preset, overrides);
        this.instanceCache.set(instanceId, instance);

        this.logger.info('Instance singleton créée et mise en cache', { instanceId, preset });

        return instance;
    }

    /**
     * Crée un système optimisé pour l'apprentissage LSF
     * 
     * @method createForLSF
     * @static
     * @param {Partial<AIEvolutionSystemConfig>} [customizations] - Personnalisations spécifiques LSF
     * @returns {AIEvolutionSystem} Instance optimisée pour LSF
     * @public
     */
    public static createForLSF(customizations?: Partial<AIEvolutionSystemConfig>): AIEvolutionSystem {
        const lsfOptimizedConfig: Partial<AIEvolutionSystemConfig> = {
            evolutionSensitivity: 0.7,
            baseEvolutionRate: 0.05,
            evolutionThreshold: 0.08,
            changePersistence: 0.85,
            enableAutoOptimization: true,
            analysisDepth: 20
        };

        const finalConfig = { ...lsfOptimizedConfig, ...customizations };

        this.logger.info('🏭 Création système évolution optimisé LSF', { finalConfig });

        return new AIEvolutionSystem(finalConfig);
    }

    /**
     * Crée un système pour l'apprentissage en groupe
     * 
     * @method createForGroup
     * @static
     * @param {number} groupSize - Taille du groupe
     * @param {Partial<AIEvolutionSystemConfig>} [customizations] - Personnalisations
     * @returns {AIEvolutionSystem} Instance optimisée pour groupe
     * @public
     */
    public static createForGroup(
        groupSize: number,
        customizations?: Partial<AIEvolutionSystemConfig>
    ): AIEvolutionSystem {
        // Ajuster la configuration selon la taille du groupe
        const groupFactor = Math.min(2, Math.max(0.5, groupSize / 10));

        const groupOptimizedConfig: Partial<AIEvolutionSystemConfig> = {
            evolutionSensitivity: 0.6 * groupFactor,
            baseEvolutionRate: 0.04 * groupFactor,
            evolutionThreshold: 0.12 / groupFactor,
            changePersistence: 0.8,
            enableAutoOptimization: true,
            analysisDepth: Math.min(30, 15 + groupSize)
        };

        const finalConfig = { ...groupOptimizedConfig, ...customizations };

        this.logger.info('🏭 Création système évolution pour groupe', {
            groupSize,
            groupFactor,
            finalConfig
        });

        return new AIEvolutionSystem(finalConfig);
    }

    /**
     * Crée un système pour l'apprentissage adaptatif personnalisé
     * 
     * @method createAdaptive
     * @static
     * @param {Record<string, unknown>} learnerProfile - Profil de l'apprenant
     * @returns {AIEvolutionSystem} Instance adaptée au profil
     * @public
     */
    public static createAdaptive(learnerProfile: Record<string, unknown>): AIEvolutionSystem {
        const adaptiveConfig = this.generateAdaptiveConfig(learnerProfile);

        this.logger.info('🏭 Création système évolution adaptatif', {
            learnerProfile,
            adaptiveConfig
        });

        return new AIEvolutionSystem(adaptiveConfig);
    }

    /**
     * Obtient la liste des presets disponibles avec descriptions
     * 
     * @method getAvailablePresets
     * @static
     * @returns {Record<EvolutionPreset, string>} Presets avec descriptions
     * @public
     */
    public static getAvailablePresets(): Record<EvolutionPreset, string> {
        return {
            DEVELOPMENT: 'Configuration rapide pour développement et tests',
            PRODUCTION: 'Configuration stable et optimisée pour production',
            TESTING: 'Configuration contrôlée pour tests automatisés',
            ACCELERATED: 'Configuration pour apprentissage accéléré',
            CONSERVATIVE: 'Configuration prudente pour apprentissage progressif'
        };
    }

    /**
     * Compare deux configurations et retourne les différences
     * 
     * @method compareConfigs
     * @static
     * @param {AIEvolutionSystemConfig} config1 - Première configuration
     * @param {AIEvolutionSystemConfig} config2 - Deuxième configuration
     * @returns {Record<string, { old: unknown; new: unknown }>} Différences détectées
     * @public
     */
    public static compareConfigs(
        config1: AIEvolutionSystemConfig,
        config2: AIEvolutionSystemConfig
    ): Record<string, { old: unknown; new: unknown }> {
        const differences: Record<string, { old: unknown; new: unknown }> = {};

        for (const key of Object.keys(config1) as Array<keyof AIEvolutionSystemConfig>) {
            if (config1[key] !== config2[key]) {
                differences[key] = {
                    old: config1[key],
                    new: config2[key]
                };
            }
        }

        return differences;
    }

    /**
     * Nettoie le cache des instances
     * 
     * @method clearCache
     * @static
     * @param {string} [instanceId] - ID spécifique à supprimer, ou undefined pour tout nettoyer
     * @returns {void}
     * @public
     */
    public static clearCache(instanceId?: string): void {
        if (instanceId) {
            const instance = this.instanceCache.get(instanceId);
            if (instance) {
                instance.shutdown();
                this.instanceCache.delete(instanceId);
                this.logger.info('Instance supprimée du cache', { instanceId });
            }
        } else {
            // Arrêter toutes les instances avant de nettoyer
            this.instanceCache.forEach((instance, id) => {
                instance.shutdown();
                this.logger.debug('Instance arrêtée', { instanceId: id });
            });

            this.instanceCache.clear();
            this.logger.info('Cache complet nettoyé');
        }
    }

    // ================== MÉTHODES PRIVÉES ==================

    /**
     * Valide une configuration avant création
     * @private
     * @static
     */
    private static validateConfig(config: AIEvolutionSystemConfig): void {
        const validationRules = [
            { key: 'evolutionSensitivity', min: 0, max: 1 },
            { key: 'baseEvolutionRate', min: 0, max: 1 },
            { key: 'evolutionThreshold', min: 0, max: 1 },
            { key: 'changePersistence', min: 0, max: 1 },
            { key: 'analysisDepth', min: 1, max: 100 }
        ];

        for (const rule of validationRules) {
            const value = config[rule.key as keyof AIEvolutionSystemConfig] as number;

            if (typeof value !== 'number' || value < rule.min || value > rule.max) {
                throw new Error(
                    `Configuration invalide: ${rule.key} doit être entre ${rule.min} et ${rule.max}, reçu: ${value}`
                );
            }
        }

        if (typeof config.enableAutoOptimization !== 'boolean') {
            throw new Error('enableAutoOptimization doit être un booléen');
        }

        this.logger.debug('Configuration validée avec succès');
    }

    /**
     * Génère une configuration adaptive basée sur le profil de l'apprenant
     * @private
     * @static
     */
    private static generateAdaptiveConfig(learnerProfile: Record<string, unknown>): AIEvolutionSystemConfig {
        // Configuration de base
        let config = { ...EVOLUTION_PRESETS.PRODUCTION };

        // Adapter selon le niveau d'expérience
        const experienceLevel = learnerProfile.experienceLevel as string;
        if (experienceLevel === 'beginner') {
            config.evolutionSensitivity = 0.8;
            config.baseEvolutionRate = 0.06;
            config.evolutionThreshold = 0.05;
        } else if (experienceLevel === 'advanced') {
            config.evolutionSensitivity = 0.5;
            config.baseEvolutionRate = 0.02;
            config.evolutionThreshold = 0.15;
        }

        // Adapter selon le style d'apprentissage
        const learningStyle = learnerProfile.learningStyle as string;
        if (learningStyle === 'fast') {
            config.baseEvolutionRate *= 1.5;
            config.evolutionThreshold *= 0.8;
        } else if (learningStyle === 'methodical') {
            config.changePersistence = 0.95;
            config.analysisDepth = 30;
        }

        // Adapter selon les préférences de feedback
        const feedbackPreference = learnerProfile.feedbackPreference as string;
        if (feedbackPreference === 'frequent') {
            config.enableAutoOptimization = true;
            config.evolutionSensitivity *= 1.2;
        }

        return config;
    }
}

/**
 * Instance par défaut du système d'évolution pour usage simple
 */
export const defaultEvolutionSystem = EvolutionSystemFactory.createWithPreset('PRODUCTION');

/**
 * Fonction utilitaire pour créer rapidement un système avec preset
 * 
 * @function createEvolutionSystem
 * @param {EvolutionPreset} [preset='PRODUCTION'] - Preset à utiliser
 * @param {Partial<AIEvolutionSystemConfig>} [overrides] - Surcharges optionnelles
 * @returns {AIEvolutionSystem} Instance du système d'évolution
 */
export function createEvolutionSystem(
    preset: EvolutionPreset = 'PRODUCTION',
    overrides?: Partial<AIEvolutionSystemConfig>
): AIEvolutionSystem {
    return EvolutionSystemFactory.createWithPreset(preset, overrides);
}