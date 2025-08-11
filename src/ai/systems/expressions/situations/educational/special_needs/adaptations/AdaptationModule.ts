// src/ai/systems/expressions/situations/educational/special_needs/adaptations/adaptation-module.ts

import { PerformanceMonitoringSystem } from '@ai/performance/PerformanceMonitoringSystem';
import {
    AdaptationStrategy,
    AdaptationType,
    AdvancedFeatureType,
    AdaptationConfig,
    AdaptationEvaluationResult,
    AdaptationFeatureType
} from '@ai/systems/expressions/situations/educational/special_needs/adaptations/types/adaptation-types';
import { AdaptationModuleConfig } from '@ai/systems/expressions/situations/educational/special_needs/adaptations/types/adaptation-module-config';
import { ILSFAdaptationInterface } from '@ai/systems/expressions/situations/educational/special_needs/adaptations/interfaces/adaptation-interfaces';
import { LSFAdaptationInterface } from '@ai/systems/expressions/situations/educational/special_needs/adaptations/lsf-adaptation-interface';
import { AdaptationLogger } from '@ai/systems/expressions/situations/educational/special_needs/adaptations/utils/adaptation-logger';

/**
 * Module de gestion des adaptations pour les besoins spéciaux en LSF
 * Ce module centralise les fonctionnalités d'adaptation et optimise les performances
 */
export class AdaptationModule {
    private static instance: AdaptationModule;
    private adaptationInterface: ILSFAdaptationInterface;
    private adaptationsCache: Map<string, AdaptationConfig>;
    private featureCache: Map<string, unknown>;
    private performanceMonitor: PerformanceMonitoringSystem;
    private activeAdaptations: Set<AdaptationType>;
    private config: AdaptationModuleConfig;
    private initialized: boolean;
    private activeFeatures: Set<AdvancedFeatureType>;
    private logger: AdaptationLogger;

    /**
     * Constructeur privé (singleton)
     */
    private constructor(config?: Partial<AdaptationModuleConfig>) {
        this.adaptationInterface = new LSFAdaptationInterface();
        this.adaptationsCache = new Map<string, AdaptationConfig>();
        this.featureCache = new Map<string, unknown>();
        this.performanceMonitor = PerformanceMonitoringSystem.getInstance();
        this.activeAdaptations = new Set<AdaptationType>();
        this.activeFeatures = new Set<AdvancedFeatureType>();
        this.initialized = false;

        // Configuration par défaut
        this.config = {
            defaultImplementation: AdaptationFeatureType.DYNAMIC,
            enableDynamicAdaptation: true,
            debugMode: false,
            logLevel: 'info',
            enableContinuousValidation: true,
            ...config
        };

        // Initialiser le logger avant tout
        this.logger = new AdaptationLogger(this.config.logLevel);

        // Initialiser le module
        this.initialize();
    }

    /**
     * Obtient l'instance unique du module d'adaptation
     */
    public static getInstance(config?: Partial<AdaptationModuleConfig>): AdaptationModule {
        if (!AdaptationModule.instance) {
            AdaptationModule.instance = new AdaptationModule(config);
        }
        return AdaptationModule.instance;
    }

    /**
     * Initialise le module avec des configurations
     */
    private initialize(): void {
        const startTime = performance.now();

        if (this.config.debugMode) {
            this.logger.debug('Initializing AdaptationModule with config:', this.config);
        }

        this.initialized = true;

        // Enregistrer la performance de l'initialisation
        const endTime = performance.now();
        this.performanceMonitor.recordMetric(
            'adaptation',
            'initialization_time',
            endTime - startTime,
            { moduleType: 'AdaptationModule' }
        );

        this.logger.info(`Adaptation module initialized with ${this.adaptationsCache.size} predefined configurations`);
    }

    /**
     * Initialise les adaptations avec des configurations prédéfinies
     */
    public async initializeAdaptations(initialConfigs?: AdaptationConfig[]): Promise<void> {
        if (!this.initialized) {
            throw new Error('Module not initialized');
        }

        const startTime = performance.now();

        // Ajouter les configurations initiales si fournies
        if (initialConfigs && initialConfigs.length > 0) {
            initialConfigs.forEach(config => {
                const key = this.generateConfigKey(config);
                this.adaptationsCache.set(key, config);

                if (config.enabled) {
                    this.activeAdaptations.add(config.type);
                }
            });
        }

        const endTime = performance.now();
        this.performanceMonitor.recordMetric(
            'adaptation',
            'adaptations_initialization_time',
            endTime - startTime,
            { moduleType: 'AdaptationModule' }
        );

        this.logger.info(`Adaptations initialized with ${this.adaptationsCache.size} predefined configurations`);
    }

    /**
     * Convertit une chaîne en AdaptationStrategy
     */
    private stringToAdaptationStrategy(strategyName: string): AdaptationStrategy | undefined {
        const strategies = Object.values(AdaptationStrategy);
        return strategies.find(s => s === strategyName) as AdaptationStrategy | undefined;
    }

    /**
     * Applique les adaptations appropriées en fonction du contexte
     */
    public async applyAdaptations(context: Record<string, unknown>): Promise<boolean[]> {
        if (!this.initialized) {
            throw new Error('Module not initialized');
        }

        const startTime = performance.now();
        const results: boolean[] = [];

        this.logger.debug('Applying adaptations with context:', context);

        // Obtenir des recommandations d'adaptation basées sur le contexte
        const recommendations = await this.adaptationInterface.getRecommendations(context);

        // Filtrer les recommandations par priorité (seulement celles > 0.6)
        const highPriorityRecommendations = recommendations.filter(rec => rec.priority > 0.6);

        // Appliquer chaque stratégie recommandée
        for (const recommendation of highPriorityRecommendations) {
            // Convertir le type de recommandation en stratégie d'adaptation
            const strategyName = recommendation.type.toUpperCase();
            const strategy = this.stringToAdaptationStrategy(strategyName);

            if (!strategy) {
                this.logger.warn(`Unknown strategy: ${strategyName}`);
                results.push(false);
                continue;
            }

            try {
                // Tenter d'appliquer la stratégie
                const result = await this.adaptationInterface.applyStrategy(strategy, {
                    ...context,
                    recommendationId: recommendation.id,
                    priority: recommendation.priority,
                    parameters: recommendation.parameters || {}
                });

                results.push(result);

                // Si réussi, mettre à jour les adaptations actives
                if (result) {
                    const adaptationType = this.mapStrategyToType(strategy);
                    if (adaptationType) {
                        this.activeAdaptations.add(adaptationType);
                    }
                }
            } catch (error) {
                this.logger.error(`Error applying adaptation strategy ${strategy}:`, error);
                results.push(false);
            }
        }

        // Enregistrer la performance
        const endTime = performance.now();
        this.performanceMonitor.recordMetric(
            'adaptation',
            'application_time',
            endTime - startTime,
            {
                recommendationCount: recommendations.length,
                appliedCount: results.filter(r => r).length
            }
        );

        return results;
    }

    /**
     * Évalue l'efficacité des adaptations actuellement actives
     */
    public async evaluateAdaptations(context: Record<string, unknown>): Promise<AdaptationEvaluationResult[]> {
        if (!this.initialized) {
            throw new Error('Module not initialized');
        }

        const results: AdaptationEvaluationResult[] = [];

        this.logger.debug('Evaluating adaptations with context:', context);

        // Pour chaque adaptation active, évaluer son efficacité
        for (const [key, config] of this.adaptationsCache.entries()) {
            if (!config.enabled) continue;

            try {
                // Évaluer l'efficacité de l'adaptation
                const effectivenessScore = await this.adaptationInterface.evaluateEffectiveness({
                    ...context,
                    adaptationType: config.type,
                    parameters: config.parameters
                });

                // Créer un résultat d'évaluation
                const evaluationResult: AdaptationEvaluationResult = {
                    adaptationId: key,
                    effectivenessScore,
                    metrics: {
                        intensity: config.intensity,
                        usageFrequency: Math.random(), // Simulé
                        userSatisfaction: 0.5 + Math.random() * 0.5 // Simulé
                    },
                    observations: [
                        `Adaptation de type ${config.type} appliquée avec une intensité de ${config.intensity}`,
                        `Score d'efficacité: ${effectivenessScore.toFixed(2)}`
                    ],
                    recommendations: []
                };

                // Ajouter des recommandations basées sur le score d'efficacité
                if (effectivenessScore < 0.6) {
                    evaluationResult.recommendations.push(
                        `Augmenter l'intensité de l'adaptation pour améliorer l'efficacité`
                    );
                } else if (effectivenessScore > 0.9) {
                    evaluationResult.recommendations.push(
                        `L'adaptation est très efficace, envisager de la standardiser`
                    );
                }

                results.push(evaluationResult);
            } catch (error) {
                this.logger.error(`Error evaluating adaptation ${key}:`, error);
            }
        }

        return results;
    }

    /**
     * Analyse les besoins visuels spécifiques
     */
    public async analyzeVisualNeeds(context: Record<string, unknown>): Promise<Record<string, unknown>> {
        if (!this.initialized) {
            throw new Error('Module not initialized');
        }

        this.logger.debug('Analyzing visual needs with context:', context);

        const result = await this.adaptationInterface.analyzeVisualNeeds(context);

        // Mettre en cache les résultats pour une utilisation future
        const config: AdaptationConfig = {
            type: result.adaptationType,
            intensity: result.priority,
            parameters: result.parameters,
            enabled: true
        };

        const key = this.generateConfigKey(config);
        this.adaptationsCache.set(key, config);

        // Activer l'adaptation
        this.activeAdaptations.add(result.adaptationType);

        return {
            result,
            cachedConfig: config,
            activeAdaptations: Array.from(this.activeAdaptations)
        };
    }

    /**
     * Désactive une adaptation spécifique
     */
    public disableAdaptation(type: AdaptationType): void {
        if (!this.initialized) {
            throw new Error('Module not initialized');
        }

        this.logger.info(`Disabling adaptation: ${type}`);

        // Mettre à jour toutes les configurations correspondantes
        for (const [key, config] of this.adaptationsCache.entries()) {
            if (config.type === type) {
                config.enabled = false;
                this.adaptationsCache.set(key, config);
            }
        }

        // Retirer des adaptations actives
        this.activeAdaptations.delete(type);
    }

    /**
     * Active une fonctionnalité avancée spécifique
     */
    public enableFeature(featureType: AdvancedFeatureType): void {
        if (!this.initialized) {
            throw new Error('Module not initialized');
        }

        this.logger.info(`Enabling feature: ${featureType}`);
        this.activeFeatures.add(featureType);

        // Implémentation spécifique selon le type de fonctionnalité
        switch (featureType) {
            case AdvancedFeatureType.CONTINUOUS_LEARNING:
                // Configuration apprentissage continu
                if (this.config.implementationOptions?.learningRate) {
                    this.featureCache.set('learningRate', this.config.implementationOptions.learningRate);
                }
                break;

            case AdvancedFeatureType.AUTOMATIC_OPTIMIZATION:
                // Optimisation automatique
                this.performanceMonitor.addAlertListener('adaptation', (metricName: string, metricValue: number, thresholdValue: number) => {
                    this.logger.debug(`Performance alert for ${metricName}: ${metricValue} (threshold: ${thresholdValue})`);
                    // Logique d'optimisation
                });
                break;

            case AdvancedFeatureType.VOICE_COMMANDS:
                // Configuration commandes vocales
                break;

            case AdvancedFeatureType.ADAPTIVE_UI:
                // Configuration interface adaptative
                break;

            case AdvancedFeatureType.PREDICTIVE_SUGGESTIONS:
                // Configuration suggestions prédictives
                break;

            default:
                this.logger.warn(`Unknown feature type: ${featureType}`);
                break;
        }
    }

    /**
     * Désactive une fonctionnalité avancée spécifique
     */
    public disableFeature(featureType: AdvancedFeatureType): void {
        if (!this.initialized) {
            throw new Error('Module not initialized');
        }

        this.logger.info(`Disabling feature: ${featureType}`);
        this.activeFeatures.delete(featureType);

        // Nettoyage spécifique selon le type de fonctionnalité
        switch (featureType) {
            case AdvancedFeatureType.AUTOMATIC_OPTIMIZATION:
                // Suppression des listeners d'alerte
                break;
            // Autres cas spécifiques
        }
    }

    /**
     * Configure le module avec de nouveaux paramètres
     */
    public configure(config: Partial<AdaptationModuleConfig>): void {
        this.config = {
            ...this.config,
            ...config
        };

        this.logger.info('Module reconfigured with:', config);

        // Reconfigurer le logger si le niveau a changé
        if (config.logLevel) {
            this.logger.setLogLevel(config.logLevel);
        }
    }

    /**
     * Génère une clé unique pour une configuration d'adaptation
     */
    private generateConfigKey(config: AdaptationConfig): string {
        return `${config.type}_${config.intensity.toFixed(2)}_${Object.keys(config.parameters).length}`;
    }

    /**
     * Convertit une stratégie d'adaptation en type d'adaptation
     */
    private mapStrategyToType(strategy: AdaptationStrategy): AdaptationType | null {
        // Mapping explicite au lieu de comparaison directe
        const strategyMapping: Record<AdaptationStrategy, AdaptationType> = {
            [AdaptationStrategy.VISUAL_SIMPLIFICATION]: AdaptationType.VISUAL_SIMPLIFICATION,
            [AdaptationStrategy.SPATIAL_OPTIMIZATION]: AdaptationType.SPATIAL_OPTIMIZATION,
            [AdaptationStrategy.TEMPORAL_ADJUSTMENT]: AdaptationType.TEMPORAL_ADJUSTMENT,
            [AdaptationStrategy.COMPLEXITY_REDUCTION]: AdaptationType.COMPLEXITY_REDUCTION,
            [AdaptationStrategy.CONTEXT_ENHANCEMENT]: AdaptationType.CONTEXT_ENHANCEMENT,
            [AdaptationStrategy.BREAK_SCHEDULING]: AdaptationType.BREAK_SCHEDULING
        };

        return strategyMapping[strategy] || null;
    }

    /**
     * Obtient les statistiques d'utilisation des adaptations
     */
    public getAdaptationStats(): Record<string, unknown> {
        if (!this.initialized) {
            throw new Error('Module not initialized');
        }

        return {
            totalAdaptations: this.adaptationsCache.size,
            activeAdaptations: this.activeAdaptations.size,
            activeAdaptationTypes: Array.from(this.activeAdaptations),
            activeFeatures: Array.from(this.activeFeatures),
            averageIntensity: this.calculateAverageIntensity(),
            configuration: {
                ...this.config,
                // Ne pas exposer les données sensibles
                implementationOptions: this.config.implementationOptions ?
                    Object.keys(this.config.implementationOptions) : []
            }
        };
    }

    /**
     * Calcule l'intensité moyenne des adaptations actives
     */
    private calculateAverageIntensity(): number {
        let totalIntensity = 0;
        let count = 0;

        for (const [, config] of this.adaptationsCache.entries()) {
            if (config.enabled && this.activeAdaptations.has(config.type)) {
                totalIntensity += config.intensity;
                count++;
            }
        }

        return count > 0 ? totalIntensity / count : 0;
    }

    /**
     * Obtient la configuration actuelle
     */
    public getConfig(): AdaptationModuleConfig {
        return { ...this.config };
    }

    /**
     * Vérifie si le module est initialisé
     */
    public isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Réinitialise le module
     */
    public reset(): void {
        this.logger.info('Resetting adaptation module');
        this.featureCache.clear();
        this.adaptationsCache.clear();
        this.activeAdaptations.clear();
        this.activeFeatures.clear();
        this.initialize();
    }
}