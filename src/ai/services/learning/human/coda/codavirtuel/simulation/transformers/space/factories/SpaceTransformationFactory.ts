/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/space/factories/SpaceTransformationFactory.ts
 * @description Factory pour créer les stratégies de transformation d'espace syntaxique
 * @author MetaSign
 * @version 1.0.2
 * @since 2025-05-29
 * @updated 2025-05-29
 */

import { LSFSpaceParameter } from '../../../types/LSFContentTypes';
import {
    SpaceTransformationContext,
    SpaceStrategyConfig
} from '../types/SpaceTransformationTypes';

/**
 * Interface pour les stratégies de transformation d'espace syntaxique
 */
interface ISyntacticSpaceTransformationStrategy {
    apply(space: LSFSpaceParameter, context: SpaceTransformationContext): Promise<void>;
    validate(space: LSFSpaceParameter): boolean;
    getImpactScore(): number;
}

/**
 * Stratégie par défaut pour les transformations d'espace
 */
class DefaultSpaceTransformationStrategy implements ISyntacticSpaceTransformationStrategy {
    private impactScore: number = 0;
    private readonly config: SpaceStrategyConfig;

    constructor(config?: SpaceStrategyConfig) {
        this.config = config || this.createDefaultConfig();
    }

    /**
     * Crée la configuration par défaut pour la stratégie
     * @returns Configuration par défaut
     * @private
     */
    private createDefaultConfig(): SpaceStrategyConfig {
        return {
            minAccuracyThreshold: 0.1,
            maxDegradationFactor: 0.8,
            semanticPreservation: true,
            strictValidation: true,
            strategySpecific: {}
        };
    }

    public async apply(
        space: LSFSpaceParameter,
        context: SpaceTransformationContext
    ): Promise<void> {
        // Réduction progressive de la précision
        const reductionFactor = Math.min(this.config.maxDegradationFactor, context.severity);
        space.accuracy = Math.max(0, (space.accuracy || 1) - reductionFactor);

        // Application d'une dégradation générale
        if (context.severity > 0.5) {
            space.referenceConsistency = false;
        }

        if (context.severity > 0.7) {
            space.zoneConfusion = true;
        }

        this.impactScore = reductionFactor;
    }

    public validate(space: LSFSpaceParameter): boolean {
        return space !== null && typeof space === 'object';
    }

    public getImpactScore(): number {
        return this.impactScore;
    }
}

/**
 * Stratégie spécialisée pour la confusion de zones
 */
class ZoneConfusionStrategy extends DefaultSpaceTransformationStrategy {
    public async apply(
        space: LSFSpaceParameter,
        context: SpaceTransformationContext
    ): Promise<void> {
        await super.apply(space, context);

        // Logique spécifique à la confusion de zones
        if (context.severity > 0.3) {
            space.zoneConfusion = true;
            // Activation de la réorganisation spatiale pour simuler la confusion
            space.spatialReorganization = true;
            // Placement aléatoire activé si la sévérité est élevée
            if (context.severity > 0.6) {
                space.randomPlacement = true;
            }
        }
    }
}

/**
 * Stratégie spécialisée pour les violations de référence
 */
class ReferenceViolationStrategy extends DefaultSpaceTransformationStrategy {
    public async apply(
        space: LSFSpaceParameter,
        context: SpaceTransformationContext
    ): Promise<void> {
        await super.apply(space, context);

        // Logique spécifique aux violations de référence
        if (context.severity > 0.4) {
            space.referenceConsistency = false;
            // Activation des confusions pronominales et références ambiguës
            space.pronounConfusion = true;
            space.ambiguousReference = true;

            // Omission de références si sévérité très élevée
            if (context.severity > 0.7) {
                space.referenceOmission = true;
            }
        }
    }
}

/**
 * Factory pour créer et configurer les stratégies de transformation d'espace syntaxique
 * 
 * Cette factory centralise la création des différentes stratégies de transformation
 * et permet leur configuration selon les besoins pédagogiques
 */
export class SpaceTransformationFactory {
    private readonly strategyConfigs: Map<string, SpaceStrategyConfig>;
    private readonly defaultConfig: SpaceStrategyConfig;

    constructor() {
        this.defaultConfig = this.createDefaultConfig();
        this.strategyConfigs = this.initializeStrategyConfigs();
    }

    /**
     * Crée la configuration par défaut
     * @returns Configuration par défaut
     * @private
     */
    private createDefaultConfig(): SpaceStrategyConfig {
        return {
            minAccuracyThreshold: 0.1,
            maxDegradationFactor: 0.8,
            semanticPreservation: true,
            strictValidation: true,
            strategySpecific: {}
        };
    }

    /**
     * Initialise les configurations spécifiques par stratégie
     * @returns Map des configurations par stratégie
     * @private
     */
    private initializeStrategyConfigs(): Map<string, SpaceStrategyConfig> {
        const configs = new Map<string, SpaceStrategyConfig>();

        // Configuration pour les confusions de zone
        configs.set('ZONE_CONFUSION', {
            ...this.defaultConfig,
            maxDegradationFactor: 0.6,
            strategySpecific: {
                allowZoneMixing: true,
                preserveMainZone: false,
                confusionProbability: 0.7
            }
        });

        // Configuration pour les violations de référence
        configs.set('REFERENCE_VIOLATION', {
            ...this.defaultConfig,
            maxDegradationFactor: 0.5,
            semanticPreservation: false,
            strategySpecific: {
                maintainPartialReferences: true,
                cascadeEffect: true
            }
        });

        // Configuration pour la réduction d'échelle
        configs.set('REDUCED_SPACE', {
            ...this.defaultConfig,
            maxDegradationFactor: 0.4,
            strategySpecific: {
                minScaleFactor: 0.3,
                proportionalReduction: true,
                maintainAspectRatio: true
            }
        });

        // Configuration pour le placement aléatoire
        configs.set('RANDOM_PLACEMENT', {
            ...this.defaultConfig,
            maxDegradationFactor: 0.9,
            semanticPreservation: false,
            strategySpecific: {
                randomnessFactor: 0.8,
                allowTotalChaos: false,
                maintainBoundaries: true
            }
        });

        // Configuration pour l'omission de localisation
        configs.set('LOCATION_OMISSION', {
            ...this.defaultConfig,
            maxDegradationFactor: 0.7,
            strategySpecific: {
                partialOmission: true,
                omissionProbability: 0.6,
                affectedElements: ['position', 'orientation', 'reference']
            }
        });

        return configs;
    }

    /**
     * Crée une stratégie de transformation selon le type demandé
     * @param transformationType Type de transformation
     * @param customConfig Configuration personnalisée optionnelle
     * @returns Stratégie de transformation correspondante
     */
    public createStrategy(
        transformationType: string,
        customConfig?: Partial<SpaceStrategyConfig>
    ): ISyntacticSpaceTransformationStrategy {
        const config = this.mergeConfigs(transformationType, customConfig);

        // Création des stratégies spécialisées
        switch (transformationType) {
            case 'ZONE_CONFUSION':
                return this.createZoneStrategy(config);
            case 'REFERENCE_VIOLATION':
                return this.createReferenceStrategy(config);
            case 'REDUCED_SPACE':
                return this.createScaleStrategy(config);
            case 'RANDOM_PLACEMENT':
                return this.createPlacementStrategy(config);
            case 'LOCATION_OMISSION':
                return this.createLocationStrategy(config);
            default:
                return this.createDefaultStrategy(config);
        }
    }

    /**
     * Crée une stratégie par défaut
     * @param config Configuration à appliquer
     * @returns Stratégie par défaut configurée
     */
    public createDefaultStrategy(config?: SpaceStrategyConfig): ISyntacticSpaceTransformationStrategy {
        return new DefaultSpaceTransformationStrategy(config);
    }

    /**
     * Crée une stratégie adaptée au niveau d'apprentissage
     * @param learningLevel Niveau d'apprentissage (débutant, intermédiaire, avancé)
     * @param transformationType Type de transformation souhaité
     * @returns Stratégie adaptée au niveau
     */
    public createAdaptiveStrategy(
        learningLevel: 'beginner' | 'intermediate' | 'advanced',
        transformationType: string
    ): ISyntacticSpaceTransformationStrategy {
        const baseConfig = this.strategyConfigs.get(transformationType) || this.defaultConfig;

        // Adaptation selon le niveau
        const adaptedConfig: SpaceStrategyConfig = {
            ...baseConfig,
            maxDegradationFactor: this.adjustDegradationForLevel(baseConfig.maxDegradationFactor, learningLevel),
            semanticPreservation: learningLevel === 'beginner',
            strictValidation: learningLevel !== 'advanced'
        };

        return this.createStrategy(transformationType, adaptedConfig);
    }

    /**
     * Crée un ensemble de stratégies pour une simulation complexe
     * @param transformationTypes Types de transformations à combiner
     * @param globalConfig Configuration globale
     * @returns Map des stratégies créées
     */
    public createStrategySet(
        transformationTypes: string[],
        globalConfig?: Partial<SpaceStrategyConfig>
    ): Map<string, ISyntacticSpaceTransformationStrategy> {
        const strategies = new Map<string, ISyntacticSpaceTransformationStrategy>();

        for (const type of transformationTypes) {
            const strategy = this.createStrategy(type, globalConfig);
            strategies.set(type, strategy);
        }

        return strategies;
    }

    /**
     * Ajuste le facteur de dégradation selon le niveau d'apprentissage
     * @param baseFactor Facteur de base
     * @param level Niveau d'apprentissage
     * @returns Facteur ajusté
     * @private
     */
    private adjustDegradationForLevel(
        baseFactor: number,
        level: 'beginner' | 'intermediate' | 'advanced'
    ): number {
        const adjustments = {
            beginner: 0.6,    // Erreurs plus douces
            intermediate: 0.8, // Erreurs modérées
            advanced: 1.0     // Erreurs réalistes
        };

        return baseFactor * adjustments[level];
    }

    /**
     * Fusionne les configurations
     * @param transformationType Type de transformation
     * @param customConfig Configuration personnalisée
     * @returns Configuration fusionnée
     * @private
     */
    private mergeConfigs(
        transformationType: string,
        customConfig?: Partial<SpaceStrategyConfig>
    ): SpaceStrategyConfig {
        const baseConfig = this.strategyConfigs.get(transformationType) || this.defaultConfig;

        if (!customConfig) {
            return baseConfig;
        }

        return {
            ...baseConfig,
            ...customConfig,
            strategySpecific: {
                ...baseConfig.strategySpecific,
                ...customConfig.strategySpecific
            }
        };
    }

    /**
     * Crée une stratégie de zone spécialisée
     * @param config Configuration à appliquer
     * @returns Stratégie de zone
     * @private
     */
    private createZoneStrategy(config: SpaceStrategyConfig): ISyntacticSpaceTransformationStrategy {
        return new ZoneConfusionStrategy(config);
    }

    /**
     * Crée une stratégie de référence spécialisée
     * @param config Configuration à appliquer
     * @returns Stratégie de référence
     * @private
     */
    private createReferenceStrategy(config: SpaceStrategyConfig): ISyntacticSpaceTransformationStrategy {
        return new ReferenceViolationStrategy(config);
    }

    /**
     * Crée une stratégie d'échelle
     * @param config Configuration à appliquer
     * @returns Stratégie d'échelle
     * @private
     */
    private createScaleStrategy(config: SpaceStrategyConfig): ISyntacticSpaceTransformationStrategy {
        return new DefaultSpaceTransformationStrategy(config);
    }

    /**
     * Crée une stratégie de placement
     * @param config Configuration à appliquer
     * @returns Stratégie de placement
     * @private
     */
    private createPlacementStrategy(config: SpaceStrategyConfig): ISyntacticSpaceTransformationStrategy {
        return new DefaultSpaceTransformationStrategy(config);
    }

    /**
     * Crée une stratégie de localisation
     * @param config Configuration à appliquer
     * @returns Stratégie de localisation
     * @private
     */
    private createLocationStrategy(config: SpaceStrategyConfig): ISyntacticSpaceTransformationStrategy {
        return new DefaultSpaceTransformationStrategy(config);
    }

    /**
     * Obtient la configuration pour un type de transformation
     * @param transformationType Type de transformation
     * @returns Configuration correspondante
     */
    public getConfig(transformationType: string): SpaceStrategyConfig {
        return this.strategyConfigs.get(transformationType) || this.defaultConfig;
    }

    /**
     * Met à jour la configuration pour un type de transformation
     * @param transformationType Type de transformation
     * @param config Nouvelle configuration
     */
    public updateConfig(transformationType: string, config: Partial<SpaceStrategyConfig>): void {
        const currentConfig = this.strategyConfigs.get(transformationType) || this.defaultConfig;
        const mergedConfig = { ...currentConfig, ...config };
        this.strategyConfigs.set(transformationType, mergedConfig);
    }

    /**
     * Réinitialise toutes les configurations aux valeurs par défaut
     */
    public resetConfigs(): void {
        this.strategyConfigs.clear();
        this.strategyConfigs.set('default', this.defaultConfig);
    }
}