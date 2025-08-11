/**
 * @file src/ai/services/learning/LearningServiceInitializer.ts
 * @description Initialisation des services du module d'apprentissage
 */

import { LearningServiceRegistry } from '@/ai/services/learning/registry/LearningServiceRegistry';
import { LearningServiceConfig } from '@/ai/services/learning/types';
import { ReverseApprenticeshipSystem } from '@/ai/services/learning/human/coda/codavirtuel/ReverseApprenticeshipSystem';
import { ExerciseGeneratorService } from '@/ai/services/learning/human/coda/codavirtuel/exercises/ExerciseGeneratorService';
import { LearningPyramidIntegration } from '@/ai/services/learning/integration/pyramid/LearningPyramidIntegration';
import { LearningMetricsCollector } from '@/ai/services/learning/metrics/LearningMetricsCollector';
import { PersonalizedLearningPath } from '@/ai/services/learning/personalization/PersonalizedLearningPath';
import { GamificationManager } from '@/ai/services/gamification/GamificationManager';
import { NeRFEnvironmentManager } from '@/ai/services/learning/human/immersive/NeRFEnvironmentManager';
import { ComprehensionEvaluator } from '@/ai/services/learning/human/evaluation/ComprehensionEvaluator';

/**
 * @interface ComprehensionEvaluatorConfig
 * @description Configuration pour l'évaluateur de compréhension
 */
interface ComprehensionEvaluatorConfig {
    /** Seuil de compréhension (0-1) */
    comprehensionThreshold: number;
    /** Seuil de confiance (0-1) */
    confidenceThreshold: number;
    /** Mode débogage */
    debug: boolean;
}

/**
 * @class LearningServiceInitializer
 * @description Initialise les services du module d'apprentissage
 */
export class LearningServiceInitializer {
    private registry: LearningServiceRegistry;
    private config: LearningServiceConfig;

    /**
     * @constructor
     * @param {LearningServiceConfig} config - Configuration du service d'apprentissage
     * @param {LearningServiceRegistry} registry - Registre des services
     */
    constructor(config: LearningServiceConfig, registry: LearningServiceRegistry) {
        this.config = config;
        this.registry = registry;
    }

    /**
     * @method initializeServices
     * @description Initialise les services en fonction de la configuration
     */
    public initializeServices(): void {
        // Initialiser les services requis
        this.initializeRequiredServices();

        // Initialiser les services optionnels en fonction de la configuration
        if (this.config.enableReverseApprenticeship) {
            this.initializeReverseApprenticeship();
        }

        if (this.config.enablePyramidIntegration) {
            this.initializePyramidIntegration();
        }

        if (this.config.enableGamification) {
            this.initializeGamification();
        }

        if (this.config.enableImmersiveEnvironments) {
            this.initializeImmersiveEnvironments();
        }
    }

    /**
     * @method initializeRequiredServices
     * @private
     * @description Initialise les services requis pour le fonctionnement de base
     */
    private initializeRequiredServices(): void {
        // Exercice Generator (singleton)
        const exerciseGenerator = ExerciseGeneratorService.getInstance();
        this.registry.registerService('exerciseGenerator', exerciseGenerator);

        // Metrics Collector
        const metricsCollector = new LearningMetricsCollector();
        this.registry.registerService('metricsCollector', metricsCollector);

        // Personalized Learning Path
        const personalizedPath = new PersonalizedLearningPath();
        this.registry.registerService('personalizedPath', personalizedPath);

        // Comprehension Evaluator avec configuration
        const comprehensionConfig: ComprehensionEvaluatorConfig = {
            comprehensionThreshold: 0.75,
            confidenceThreshold: 0.7,
            debug: this.config.useMockServices
        };
        const comprehensionEvaluator = new ComprehensionEvaluator(comprehensionConfig);
        this.registry.registerService('comprehensionEvaluator', comprehensionEvaluator);
    }

    /**
     * @method initializeReverseApprenticeship
     * @private
     * @description Initialise le système d'apprentissage inversé (CODA virtuel)
     */
    private initializeReverseApprenticeship(): void {
        const options = this.config.serviceOptions?.reverseApprenticeshipOptions;
        const reverseApprenticeshipSystem = new ReverseApprenticeshipSystem(
            options as Record<string, unknown>
        );
        this.registry.registerService('reverseApprenticeship', reverseApprenticeshipSystem);
    }

    /**
     * @method initializePyramidIntegration
     * @private
     * @description Initialise l'intégration avec la pyramide IA
     */
    private initializePyramidIntegration(): void {
        const pyramidIntegration = new LearningPyramidIntegration();
        this.registry.registerService('pyramidIntegration', pyramidIntegration);
    }

    /**
     * @method initializeGamification
     * @private
     * @description Initialise le système de gamification
     */
    private initializeGamification(): void {
        const gamificationManager = new GamificationManager();
        this.registry.registerService('gamification', gamificationManager);
    }

    /**
     * @method initializeImmersiveEnvironments
     * @private
     * @description Initialise les environnements immersifs NeRF
     */
    private initializeImmersiveEnvironments(): void {
        // Configuration pour l'environnement NeRF
        const nerfConfig = {
            performanceMode: true,
            preloadEnvironments: false,
            defaultRenderQuality: 'medium' as const,
            rendererType: 'standard',
            maxConcurrentEnvironments: 2,
            deviceOptimization: true
        };
        const immersiveEnvironment = new NeRFEnvironmentManager(nerfConfig);
        this.registry.registerService('immersiveEnvironment', immersiveEnvironment);
    }
}