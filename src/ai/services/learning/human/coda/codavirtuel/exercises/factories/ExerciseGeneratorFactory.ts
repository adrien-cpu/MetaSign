/**
 * Factory pour la création et la gestion des générateurs d'exercices
 * Centralise la logique de création et fournit une interface unifiée pour l'accès aux générateurs
 * 
 * @file src/ai/services/learning/human/coda/codavirtuel/exercises/factories/ExerciseGeneratorFactory.ts
 * @description Factory avancée pour obtenir le générateur d'exercices approprié selon le type et le contexte
 * @version 2.2.0
 * @author MetaSign Learning Team
 * @since 2025-05-26
 * @lastModified 2025-05-27
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { LearningServiceRegistry } from '@/ai/services/learning/registry/LearningServiceRegistry';
import {
    ExerciseGeneratorService,
    SupportedExerciseType,
    Exercise,
    CECRLLevel,
    ExerciseGenerationParams
} from '../ExerciseGeneratorService';
import {
    ExerciseGenerator,
    BaseExerciseParams,
    BaseEvaluationResult
} from '../ExerciseGenerator.interface';
import { BaseService } from '@/ai/services/learning/registry/interfaces/ServiceDescription';

/**
 * Interface étendue pour les générateurs d'exercices avec support asynchrone
 * Résout l'incompatibilité entre synchrone et asynchrone pour la méthode evaluate
 * 
 * @template T Type d'exercice généré
 * @template P Type de paramètres pour la génération (doit étendre BaseExerciseParams)
 * @template R Type de réponse utilisateur
 * @template E Type de résultat d'évaluation (doit étendre BaseEvaluationResult)
 */
export interface IAsyncExerciseGenerator<
    T = unknown,
    P extends BaseExerciseParams = BaseExerciseParams,
    R = unknown,
    E extends BaseEvaluationResult = BaseEvaluationResult
> {
    /**
     * Génère un exercice en fonction des paramètres fournis
     * @param params - Paramètres de génération
     * @returns Promise contenant l'exercice généré
     */
    generate(params: P): Promise<T>;

    /**
     * Évalue la réponse d'un utilisateur à un exercice (version asynchrone)
     * @param exercise - Exercice à évaluer
     * @param response - Réponse de l'utilisateur
     * @returns Promise contenant le résultat de l'évaluation
     */
    evaluate(exercise: T, response: R): Promise<E>;

    /**
     * Obtient les types d'exercices supportés par ce générateur
     * @returns Liste des types supportés
     */
    getSupportedTypes(): readonly SupportedExerciseType[];

    /**
     * Indique si le générateur est opérationnel
     * @returns true si le générateur fonctionne correctement
     */
    isHealthy(): boolean;

    /**
     * Obtient les métadonnées du générateur
     * @returns Métadonnées complètes du générateur
     */
    getMetadata(): GeneratorMetadata;

    /**
     * Initialise le générateur avec une configuration (optionnel)
     * @param config - Configuration d'initialisation
     * @returns Promise de l'initialisation
     */
    initialize?(config: GeneratorConfiguration): Promise<void>;

    /**
     * Libère les ressources du générateur (optionnel)
     * @returns Promise de la libération des ressources
     */
    dispose?(): Promise<void>;
}

/**
 * Adaptateur pour rendre un ExerciseGenerator compatible avec IAsyncExerciseGenerator
 * Convertit les méthodes synchrones en asynchrones de manière transparente
 * 
 * @template T Type d'exercice généré
 * @template P Type de paramètres pour la génération
 * @template R Type de réponse utilisateur
 * @template E Type de résultat d'évaluation
 */
export class SyncToAsyncGeneratorAdapter<
    T = unknown,
    P extends BaseExerciseParams = BaseExerciseParams,
    R = unknown,
    E extends BaseEvaluationResult = BaseEvaluationResult
> implements IAsyncExerciseGenerator<T, P, R, E> {

    constructor(
        private readonly syncGenerator: ExerciseGenerator<T, P, R, E>,
        private readonly supportedTypes: readonly SupportedExerciseType[],
        private readonly metadata: GeneratorMetadata
    ) { }

    async generate(params: P): Promise<T> {
        return await this.syncGenerator.generate(params);
    }

    async evaluate(exercise: T, response: R): Promise<E> {
        // Convertit l'évaluation synchrone en asynchrone
        return Promise.resolve(this.syncGenerator.evaluate(exercise, response));
    }

    getSupportedTypes(): readonly SupportedExerciseType[] {
        return [...this.supportedTypes];
    }

    isHealthy(): boolean {
        try {
            // Test simple de fonctionnalité
            return this.supportedTypes.length > 0;
        } catch {
            return false;
        }
    }

    getMetadata(): GeneratorMetadata {
        return { ...this.metadata };
    }
}

/**
 * Métadonnées complètes d'un générateur d'exercices
 */
export interface GeneratorMetadata {
    /** Nom unique du générateur */
    readonly name: string;
    /** Version du générateur */
    readonly version: string;
    /** Description détaillée du générateur */
    readonly description: string;
    /** Auteur ou équipe responsable */
    readonly author: string;
    /** Types d'exercices supportés */
    readonly supportedTypes: readonly SupportedExerciseType[];
    /** Capacités spéciales du générateur */
    readonly capabilities: readonly string[];
    /** Date de dernière mise à jour */
    readonly lastUpdated: Date;
    /** Informations sur les performances */
    readonly performance?: {
        readonly averageGenerationTime: number;
        readonly averageEvaluationTime: number;
        readonly reliability: number;
    };
}

/**
 * Configuration avancée pour un générateur d'exercices
 */
export interface GeneratorConfiguration {
    /** Type d'exercice supporté */
    readonly type: SupportedExerciseType;
    /** Priorité du générateur (1-10, plus élevé = prioritaire) */
    readonly priority: number;
    /** Contextes dans lesquels ce générateur est préféré */
    readonly preferredContexts: readonly string[];
    /** Niveau de qualité du générateur (1-10) */
    readonly qualityScore: number;
    /** Indique si le générateur est activé */
    readonly enabled: boolean;
    /** Poids pour l'équilibrage de charge (1-10) */
    readonly loadWeight: number;
    /** Nombre maximum d'exercices simultanés */
    readonly maxConcurrentExercises: number;
    /** Temps de réponse moyen attendu (en ms) */
    readonly averageResponseTime: number;
    /** Configuration spécifique au générateur */
    readonly specificConfig: Readonly<Record<string, unknown>>;
    /** Métadonnées supplémentaires */
    readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Stratégies de sélection de générateur avec algorithmes optimisés
 */
export enum GeneratorSelectionStrategy {
    /** Première implémentation trouvée */
    FIRST_AVAILABLE = 'first_available',
    /** Générateur avec la priorité la plus élevée */
    HIGHEST_PRIORITY = 'highest_priority',
    /** Générateur avec le meilleur score de qualité */
    BEST_QUALITY = 'best_quality',
    /** Générateur le mieux adapté au contexte */
    CONTEXT_AWARE = 'context_aware',
    /** Distribution équilibrée entre générateurs */
    LOAD_BALANCED = 'load_balanced',
    /** Sélection basée sur les performances historiques */
    PERFORMANCE_BASED = 'performance_based',
    /** Rotation séquentielle entre générateurs */
    ROUND_ROBIN = 'round_robin',
    /** Sélection aléatoire pondérée */
    WEIGHTED_RANDOM = 'weighted_random'
}

/**
 * Contexte de sélection pour affiner le choix du générateur
 */
export interface SelectionContext {
    /** Niveau de l'utilisateur (CECRL) */
    readonly userLevel: CECRLLevel;
    /** Historique de performance (scores récents) */
    readonly performanceHistory?: readonly number[];
    /** Préférences utilisateur */
    readonly userPreferences?: Readonly<Record<string, unknown>>;
    /** Contraintes temporelles */
    readonly timeConstraints?: {
        readonly maxDuration: number;
        readonly urgency: 'low' | 'medium' | 'high';
    };
    /** Ressources disponibles */
    readonly availableResources?: {
        readonly bandwidth: number;
        readonly processingPower: number;
    };
    /** Métriques de session */
    readonly sessionMetrics?: {
        readonly errorRate: number;
        readonly avgResponseTime: number;
        readonly userSatisfaction: number;
    };
}

/**
 * Statistiques de performance d'un générateur
 */
interface PerformanceStats {
    /** Nombre total d'exercices générés */
    totalGenerated: number;
    /** Temps de réponse moyen en millisecondes */
    averageResponseTime: number;
    /** Taux de réussite (0-1) */
    successRate: number;
    /** Score de satisfaction utilisateur (0-10) */
    userSatisfactionScore: number;
    /** Nombre d'erreurs rencontrées */
    errorCount: number;
    /** Dernière mise à jour des statistiques */
    lastUpdated: Date;
}

/**
 * Gestionnaire d'équilibrage de charge optimisé
 */
class GeneratorLoadBalancer {
    private readonly loadMap = new Map<string, number>();
    private readonly maxLoad = 100;

    /**
     * Met à jour la charge d'un générateur
     * @param generatorId - Identifiant du générateur
     * @param load - Nouvelle charge (0-100)
     */
    updateLoad(generatorId: string, load: number): void {
        const clampedLoad = Math.max(0, Math.min(this.maxLoad, load));
        this.loadMap.set(generatorId, clampedLoad);
    }

    /**
     * Obtient la charge actuelle d'un générateur
     * @param generatorId - Identifiant du générateur
     * @returns Charge actuelle (0-100)
     */
    getLoad(generatorId: string): number {
        return this.loadMap.get(generatorId) ?? 0;
    }

    /**
     * Sélectionne le générateur avec la charge la plus faible
     * @param generatorIds - Liste des identifiants de générateurs
     * @returns Identifiant du générateur le moins chargé
     */
    selectLeastLoaded(generatorIds: readonly string[]): string {
        if (generatorIds.length === 0) {
            throw new Error('Aucun générateur disponible pour l\'équilibrage de charge');
        }

        return generatorIds.reduce((least, current) =>
            this.getLoad(current) < this.getLoad(least) ? current : least
        );
    }

    /**
     * Réinitialise toutes les charges
     */
    resetLoads(): void {
        this.loadMap.clear();
    }
}

/**
 * Adaptateur pour rendre un IAsyncExerciseGenerator compatible avec BaseService
 */
class ExerciseGeneratorServiceAdapter implements BaseService {

    constructor(private readonly generator: IAsyncExerciseGenerator) { }

    async initialize(): Promise<void> {
        if (this.generator.initialize) {
            const defaultConfig: GeneratorConfiguration = {
                type: this.generator.getSupportedTypes()[0] || 'MultipleChoice',
                priority: 5,
                preferredContexts: ['default'],
                qualityScore: 7,
                enabled: true,
                loadWeight: 5,
                maxConcurrentExercises: 10,
                averageResponseTime: 500,
                specificConfig: {}
            };
            await this.generator.initialize(defaultConfig);
        }
    }

    async start(): Promise<void> {
        // Les générateurs sont démarrés par défaut
    }

    async stop(): Promise<void> {
        if (this.generator.dispose) {
            await this.generator.dispose();
        }
    }

    async checkHealth() {
        const isHealthy = this.generator.isHealthy();
        return {
            isHealthy,
            status: isHealthy ? 'healthy' as const : 'unhealthy' as const,
            message: isHealthy ? 'Generator is operational' : 'Generator is not operational',
            metadata: this.generator.getMetadata()
        };
    }

    /**
     * Expose le générateur pour l'accès direct
     * @returns Instance du générateur
     */
    getGenerator(): IAsyncExerciseGenerator {
        return this.generator;
    }
}

/**
 * Erreurs spécifiques à la factory avec codes d'erreur structurés
 */
export class GeneratorFactoryError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly context?: Readonly<Record<string, unknown>>
    ) {
        super(message);
        this.name = 'GeneratorFactoryError';
    }
}

/**
 * Factory avancée pour la création et la gestion des générateurs d'exercices
 * Implémente le pattern Singleton avec des fonctionnalités d'équilibrage de charge,
 * de mise en cache intelligente et de sélection contextuelle
 */
export class ExerciseGeneratorFactory {
    private static instance: ExerciseGeneratorFactory | null = null;
    private readonly logger = LoggerFactory.getLogger('ExerciseGeneratorFactory');
    private readonly registry: LearningServiceRegistry;

    // Configuration et état
    private readonly generatorConfigurations = new Map<SupportedExerciseType, GeneratorConfiguration>();
    private readonly generatorInstances = new Map<string, IAsyncExerciseGenerator>();
    private readonly generatorPerformanceStats = new Map<string, PerformanceStats>();
    private readonly loadBalancer = new GeneratorLoadBalancer();
    private readonly roundRobinCounters = new Map<SupportedExerciseType, number>();

    private defaultStrategy: GeneratorSelectionStrategy = GeneratorSelectionStrategy.HIGHEST_PRIORITY;
    private cacheEnabled = true;
    private readonly maxCacheSize = 100;

    /**
     * Constructeur privé pour le pattern Singleton
     */
    private constructor() {
        this.logger.info('Initializing ExerciseGeneratorFactory...');
        this.registry = LearningServiceRegistry.getInstance();
        this.initializeDefaultConfigurations();
    }

    /**
     * Obtient l'instance unique de la factory (Thread-safe)
     * @returns Instance de la factory
     */
    public static getInstance(): ExerciseGeneratorFactory {
        if (!ExerciseGeneratorFactory.instance) {
            ExerciseGeneratorFactory.instance = new ExerciseGeneratorFactory();
        }
        return ExerciseGeneratorFactory.instance;
    }

    /**
     * Obtient un générateur d'exercices selon le type et la stratégie
     * @param exerciseType - Type d'exercice souhaité
     * @param selectionContext - Contexte de sélection (optionnel)
     * @param strategy - Stratégie de sélection (optionnel)
     * @returns Promise du générateur d'exercices approprié
     * @throws {GeneratorFactoryError} Si aucun générateur n'est disponible
     */
    public async getGenerator(
        exerciseType: SupportedExerciseType,
        selectionContext?: SelectionContext,
        strategy?: GeneratorSelectionStrategy
    ): Promise<IAsyncExerciseGenerator> {
        const usedStrategy = strategy ?? this.defaultStrategy;

        this.logger.debug('Getting generator', {
            exerciseType,
            hasContext: !!selectionContext,
            strategy: usedStrategy
        });

        try {
            // Vérifier le cache si activé
            if (this.cacheEnabled) {
                const cacheKey = this.buildCacheKey(exerciseType, selectionContext);
                const cachedGenerator = this.generatorInstances.get(cacheKey);

                if (cachedGenerator?.isHealthy()) {
                    this.logger.debug('Returning cached generator', { cacheKey });
                    this.updatePerformanceStats(cacheKey, 'cache_hit');
                    return cachedGenerator;
                }
            }

            // Rechercher des générateurs disponibles
            const availableGenerators = await this.findAvailableGenerators(exerciseType);

            if (availableGenerators.length === 0) {
                this.logger.warn('No specialized generators found, falling back to default service');
                return await this.getDefaultGenerator(exerciseType);
            }

            // Sélectionner le meilleur générateur
            const selectedGenerator = await this.selectGenerator(
                availableGenerators,
                usedStrategy,
                selectionContext
            );

            // Mise en cache si activée
            if (this.cacheEnabled) {
                const cacheKey = this.buildCacheKey(exerciseType, selectionContext);
                this.cacheGenerator(cacheKey, selectedGenerator);
                this.updatePerformanceStats(cacheKey, 'generation_success');
            }

            this.logger.info('Generator selected successfully', {
                exerciseType,
                strategy: usedStrategy,
                generatorType: selectedGenerator.constructor.name
            });

            return selectedGenerator;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Error getting exercise generator', {
                exerciseType,
                error: errorMessage
            });

            throw new GeneratorFactoryError(
                `Failed to get generator for type ${exerciseType}: ${errorMessage}`,
                'GENERATOR_SELECTION_FAILED',
                { exerciseType, strategy: usedStrategy }
            );
        }
    }

    /**
     * Enregistre une configuration pour un type de générateur
     * @param type - Type d'exercice
     * @param config - Configuration du générateur
     */
    public registerGeneratorConfiguration(type: SupportedExerciseType, config: GeneratorConfiguration): void {
        this.logger.info('Registering generator configuration', { type, priority: config.priority });

        const enhancedConfig: GeneratorConfiguration = {
            ...config,
            type,
            // Validation des valeurs
            priority: Math.max(1, Math.min(10, config.priority)),
            qualityScore: Math.max(1, Math.min(10, config.qualityScore)),
            loadWeight: Math.max(1, Math.min(10, config.loadWeight)),
            maxConcurrentExercises: Math.max(1, config.maxConcurrentExercises),
            averageResponseTime: Math.max(100, config.averageResponseTime)
        };

        this.generatorConfigurations.set(type, enhancedConfig);
    }

    /**
     * Définit la stratégie de sélection par défaut
     * @param strategy - Nouvelle stratégie par défaut
     */
    public setDefaultStrategy(strategy: GeneratorSelectionStrategy): void {
        this.logger.info('Setting default selection strategy', {
            oldStrategy: this.defaultStrategy,
            newStrategy: strategy
        });
        this.defaultStrategy = strategy;
    }

    /**
     * Active ou désactive la mise en cache
     * @param enabled - État du cache
     */
    public setCacheEnabled(enabled: boolean): void {
        this.logger.info('Cache status changed', { enabled });
        this.cacheEnabled = enabled;
        if (!enabled) {
            this.clearCache();
        }
    }

    /**
     * Obtient la liste des types d'exercices supportés
     * @returns Liste des types supportés
     */
    public getSupportedExerciseTypes(): SupportedExerciseType[] {
        const defaultService = ExerciseGeneratorService.getInstance();
        const supportedTypes = defaultService.getSupportedExerciseTypes();
        // Convertir readonly vers mutable array pour compatibilité
        return [...supportedTypes];
    }

    /**
     * Vérifie si un type d'exercice est supporté
     * @param type - Type à vérifier
     * @returns true si supporté
     */
    public isExerciseTypeSupported(type: SupportedExerciseType): boolean {
        const defaultService = ExerciseGeneratorService.getInstance();
        return defaultService.isExerciseTypeSupported(type);
    }

    /**
     * Nettoie le cache des générateurs
     */
    public clearCache(): void {
        this.logger.info('Clearing generator cache');
        this.generatorInstances.clear();
        this.loadBalancer.resetLoads();
    }

    /**
     * Obtient les statistiques détaillées de la factory
     * @returns Statistiques d'utilisation et de performance
     */
    public getFactoryStats(): {
        readonly cachedGenerators: number;
        readonly supportedTypes: number;
        readonly configurations: number;
        readonly defaultStrategy: string;
        readonly cacheEnabled: boolean;
        readonly totalGenerations: number;
        readonly averageResponseTime: number;
    } {
        const totalGenerations = Array.from(this.generatorPerformanceStats.values())
            .reduce((sum, stats) => sum + stats.totalGenerated, 0);

        const averageResponseTime = Array.from(this.generatorPerformanceStats.values())
            .reduce((sum, stats, _, array) => sum + stats.averageResponseTime / array.length, 0);

        return {
            cachedGenerators: this.generatorInstances.size,
            supportedTypes: this.getSupportedExerciseTypes().length,
            configurations: this.generatorConfigurations.size,
            defaultStrategy: this.defaultStrategy,
            cacheEnabled: this.cacheEnabled,
            totalGenerations,
            averageResponseTime
        };
    }

    /**
     * Initialise la factory et enregistre les services par défaut
     * @returns Promise d'initialisation
     */
    public async initialize(): Promise<void> {
        try {
            this.logger.info('Initializing ExerciseGeneratorFactory...');

            await this.registerDefaultService();
            this.initializeDefaultConfigurations();

            this.logger.info('ExerciseGeneratorFactory initialized successfully');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Failed to initialize factory', { error: errorMessage });
            throw new GeneratorFactoryError(
                `Initialization failed: ${errorMessage}`,
                'INITIALIZATION_FAILED'
            );
        }
    }

    /**
     * Valide qu'un niveau est un niveau CECRL valide
     * @param level - Niveau à valider
     * @returns Niveau CECRL valide ou 'A1' par défaut
     */
    public static validateCECRLLevel(level: string): CECRLLevel {
        const validLevels: readonly CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        return validLevels.includes(level as CECRLLevel) ? (level as CECRLLevel) : 'A1';
    }

    /**
     * Réinitialise l'instance (utile pour les tests)
     * @internal
     */
    public static resetInstance(): void {
        ExerciseGeneratorFactory.instance = null;
    }

    // ========== MÉTHODES PRIVÉES ==========

    /**
     * Initialise les configurations par défaut pour tous les types supportés
     * @private
     */
    private initializeDefaultConfigurations(): void {
        const supportedTypes = this.getSupportedExerciseTypes();

        supportedTypes.forEach(type => {
            if (!this.generatorConfigurations.has(type)) {
                this.generatorConfigurations.set(type, {
                    type,
                    priority: this.getDefaultPriority(type),
                    preferredContexts: ['default'],
                    qualityScore: 7,
                    enabled: true,
                    loadWeight: 5,
                    maxConcurrentExercises: 10,
                    averageResponseTime: 500,
                    specificConfig: {}
                });
            }
        });

        this.logger.info('Default configurations initialized', {
            configurationsCount: this.generatorConfigurations.size
        });
    }

    /**
     * Construit une clé de cache optimisée
     * @param exerciseType - Type d'exercice
     * @param selectionContext - Contexte de sélection (optionnel)
     * @returns Clé de cache unique
     * @private
     */
    private buildCacheKey(exerciseType: SupportedExerciseType, selectionContext?: SelectionContext): string {
        if (!selectionContext) {
            return `${exerciseType}:default`;
        }

        const contextFingerprint = [
            selectionContext.userLevel ?? 'A1',
            selectionContext.timeConstraints?.urgency ?? 'medium',
            JSON.stringify(selectionContext.userPreferences ?? {})
        ].join('|');

        const hash = Buffer.from(contextFingerprint).toString('base64').slice(0, 8);
        return `${exerciseType}:${hash}`;
    }

    /**
     * Met en cache un générateur avec gestion de la taille maximale
     * @param cacheKey - Clé de cache
     * @param generator - Générateur à mettre en cache
     * @private
     */
    private cacheGenerator(cacheKey: string, generator: IAsyncExerciseGenerator): void {
        if (this.generatorInstances.size >= this.maxCacheSize) {
            // Supprimer le plus ancien élément (FIFO)
            const firstKey = this.generatorInstances.keys().next().value;
            if (firstKey) {
                this.generatorInstances.delete(firstKey);
            }
        }

        this.generatorInstances.set(cacheKey, generator);
    }

    /**
     * Trouve les générateurs disponibles pour un type d'exercice
     * @param exerciseType - Type d'exercice
     * @returns Promise de la liste des générateurs disponibles
     * @private
     */
    private async findAvailableGenerators(exerciseType: SupportedExerciseType): Promise<IAsyncExerciseGenerator[]> {
        try {
            const registeredGenerators = this.registry.findServicesByType('exercise-generator');
            const validGenerators: IAsyncExerciseGenerator[] = [];

            for (const serviceDesc of registeredGenerators) {
                try {
                    let exerciseGen: IAsyncExerciseGenerator;

                    if (serviceDesc.instance instanceof ExerciseGeneratorServiceAdapter) {
                        exerciseGen = serviceDesc.instance.getGenerator();
                    } else {
                        exerciseGen = serviceDesc.instance as IAsyncExerciseGenerator;
                    }

                    // Vérifications de validité
                    if (this.isValidGenerator(exerciseGen, exerciseType)) {
                        const config = this.generatorConfigurations.get(exerciseType);
                        if (config?.enabled !== false) {
                            const healthStatus = await this.registry.checkServiceHealth(serviceDesc.id);
                            if (healthStatus.isHealthy) {
                                validGenerators.push(exerciseGen);
                            }
                        }
                    }
                } catch (generatorError) {
                    this.logger.warn('Error validating generator', {
                        serviceId: serviceDesc.id,
                        error: generatorError instanceof Error ? generatorError.message : 'Unknown error'
                    });
                }
            }

            this.logger.debug('Found valid generators', {
                exerciseType,
                count: validGenerators.length
            });

            return validGenerators;

        } catch (error) {
            this.logger.warn('Error finding available generators', {
                exerciseType,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return [];
        }
    }

    /**
     * Vérifie si un générateur est valide pour un type d'exercice donné
     * @param generator - Générateur à vérifier
     * @param exerciseType - Type d'exercice
     * @returns true si le générateur est valide
     * @private
     */
    private isValidGenerator(generator: unknown, exerciseType: SupportedExerciseType): generator is IAsyncExerciseGenerator {
        if (!generator || typeof generator !== 'object') {
            return false;
        }

        const gen = generator as Partial<IAsyncExerciseGenerator>;

        return !!(
            typeof gen.getSupportedTypes === 'function' &&
            typeof gen.isHealthy === 'function' &&
            typeof gen.generate === 'function' &&
            typeof gen.evaluate === 'function' &&
            typeof gen.getMetadata === 'function' &&
            gen.getSupportedTypes && gen.getSupportedTypes().includes(exerciseType) &&
            gen.isHealthy && gen.isHealthy()
        );
    }

    /**
     * Sélectionne le meilleur générateur selon la stratégie
     * @param generators - Générateurs disponibles
     * @param strategy - Stratégie de sélection
     * @param selectionContext - Contexte de sélection
     * @returns Promise du générateur sélectionné
     * @private
     */
    private async selectGenerator(
        generators: readonly IAsyncExerciseGenerator[],
        strategy: GeneratorSelectionStrategy,
        selectionContext?: SelectionContext
    ): Promise<IAsyncExerciseGenerator> {
        if (generators.length === 0) {
            throw new GeneratorFactoryError(
                'No generators available for selection',
                'NO_GENERATORS_AVAILABLE'
            );
        }

        if (generators.length === 1) {
            return generators[0];
        }

        this.logger.debug('Selecting generator', {
            availableCount: generators.length,
            strategy,
            hasContext: !!selectionContext
        });

        switch (strategy) {
            case GeneratorSelectionStrategy.FIRST_AVAILABLE:
                return generators[0];

            case GeneratorSelectionStrategy.HIGHEST_PRIORITY:
                return this.selectByPriority(generators);

            case GeneratorSelectionStrategy.BEST_QUALITY:
                return this.selectByQuality(generators);

            case GeneratorSelectionStrategy.CONTEXT_AWARE:
                return this.selectByContext(generators, selectionContext);

            case GeneratorSelectionStrategy.LOAD_BALANCED:
                return this.selectByLoadBalance(generators);

            case GeneratorSelectionStrategy.PERFORMANCE_BASED:
                return this.selectByPerformance(generators);

            case GeneratorSelectionStrategy.ROUND_ROBIN:
                return this.selectByRoundRobin(generators);

            case GeneratorSelectionStrategy.WEIGHTED_RANDOM:
                return this.selectByWeightedRandom(generators);

            default:
                this.logger.warn('Unknown strategy, falling back to first available', { strategy });
                return generators[0];
        }
    }

    /**
     * Sélectionne par priorité
     * @param generators - Générateurs disponibles
     * @returns Générateur avec la priorité la plus élevée
     * @private
     */
    private selectByPriority(generators: readonly IAsyncExerciseGenerator[]): IAsyncExerciseGenerator {
        const priorityScores = generators.map(generator => ({
            generator,
            priority: Math.max(...generator.getSupportedTypes().map(type =>
                this.generatorConfigurations.get(type)?.priority ?? 5
            ))
        }));

        return priorityScores.reduce((best, current) =>
            current.priority > best.priority ? current : best
        ).generator;
    }

    /**
     * Sélectionne par qualité
     * @param generators - Générateurs disponibles
     * @returns Générateur avec le meilleur score de qualité
     * @private
     */
    private selectByQuality(generators: readonly IAsyncExerciseGenerator[]): IAsyncExerciseGenerator {
        const qualityScores = generators.map(generator => ({
            generator,
            quality: Math.max(...generator.getSupportedTypes().map(type =>
                this.generatorConfigurations.get(type)?.qualityScore ?? 7
            ))
        }));

        return qualityScores.reduce((best, current) =>
            current.quality > best.quality ? current : best
        ).generator;
    }

    /**
     * Sélectionne par contexte
     * @param generators - Générateurs disponibles
     * @param selectionContext - Contexte de sélection
     * @returns Générateur le mieux adapté au contexte
     * @private
     */
    private selectByContext(
        generators: readonly IAsyncExerciseGenerator[],
        selectionContext?: SelectionContext
    ): IAsyncExerciseGenerator {
        if (!selectionContext) {
            return generators[0];
        }

        const scoredGenerators = generators.map(generator => ({
            generator,
            score: this.calculateContextScore(generator, selectionContext)
        }));

        return scoredGenerators.reduce((best, current) =>
            current.score > best.score ? current : best
        ).generator;
    }

    /**
     * Sélectionne par équilibrage de charge
     * @param generators - Générateurs disponibles
     * @returns Générateur avec la charge la plus faible
     * @private
     */
    private selectByLoadBalance(generators: readonly IAsyncExerciseGenerator[]): IAsyncExerciseGenerator {
        const generatorIds = generators.map(g => this.getGeneratorId(g));
        const selectedId = this.loadBalancer.selectLeastLoaded(generatorIds);

        const selectedGenerator = generators.find(g => this.getGeneratorId(g) === selectedId);
        if (!selectedGenerator) {
            this.logger.warn('Load balancer selection failed, falling back to first generator');
            return generators[0];
        }

        this.loadBalancer.updateLoad(selectedId, this.loadBalancer.getLoad(selectedId) + 1);
        return selectedGenerator;
    }

    /**
     * Sélectionne par performance historique
     * @param generators - Générateurs disponibles
     * @returns Générateur avec les meilleures performances
     * @private
     */
    private selectByPerformance(generators: readonly IAsyncExerciseGenerator[]): IAsyncExerciseGenerator {
        const performanceScores = generators.map(generator => {
            const generatorId = this.getGeneratorId(generator);
            const stats = this.generatorPerformanceStats.get(generatorId);

            const score = stats ? this.calculatePerformanceScore(stats) : 5;
            return { generator, score };
        });

        return performanceScores.reduce((best, current) =>
            current.score > best.score ? current : best
        ).generator;
    }

    /**
     * Sélectionne par rotation (round-robin)
     * @param generators - Générateurs disponibles
     * @returns Générateur selon rotation
     * @private
     */
    private selectByRoundRobin(generators: readonly IAsyncExerciseGenerator[]): IAsyncExerciseGenerator {
        const firstType = generators[0].getSupportedTypes()[0];
        const currentCounter = this.roundRobinCounters.get(firstType) ?? 0;
        const selectedIndex = currentCounter % generators.length;

        this.roundRobinCounters.set(firstType, currentCounter + 1);
        return generators[selectedIndex];
    }

    /**
     * Sélectionne par randomisation pondérée
     * @param generators - Générateurs disponibles
     * @returns Générateur sélectionné aléatoirement avec pondération
     * @private
     */
    private selectByWeightedRandom(generators: readonly IAsyncExerciseGenerator[]): IAsyncExerciseGenerator {
        const weights = generators.map(generator => {
            const generatorId = this.getGeneratorId(generator);
            const config = this.generatorConfigurations.get(generator.getSupportedTypes()[0]);
            const stats = this.generatorPerformanceStats.get(generatorId);

            let weight = config?.qualityScore ?? 5;
            if (stats) {
                weight *= (1 + stats.successRate);
            }
            return weight;
        });

        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        const random = Math.random() * totalWeight;

        let cumulativeWeight = 0;
        for (let i = 0; i < generators.length; i++) {
            cumulativeWeight += weights[i];
            if (random <= cumulativeWeight) {
                return generators[i];
            }
        }

        return generators[generators.length - 1];
    }

    /**
     * Obtient le générateur par défaut
     * @param exerciseType - Type d'exercice
     * @returns Promise du générateur par défaut
     * @private
     */
    private async getDefaultGenerator(exerciseType: SupportedExerciseType): Promise<IAsyncExerciseGenerator> {
        const defaultService = ExerciseGeneratorService.getInstance();

        const adapter: IAsyncExerciseGenerator = {
            async generate(params: BaseExerciseParams) {
                // Convertir les paramètres vers ExerciseGenerationParams
                const generationParams: ExerciseGenerationParams = {
                    type: exerciseType,
                    level: ExerciseGeneratorFactory.validateCECRLLevel(params.level),
                    difficulty: params.difficulty,
                    focusAreas: params.focusAreas,
                    userId: params.userId
                };
                return await defaultService.generateExercise(generationParams);
            },

            async evaluate(exercise: unknown, response: unknown): Promise<BaseEvaluationResult> {
                const result = await defaultService.evaluateResponse(exercise as Exercise<unknown>, response);
                return result as BaseEvaluationResult;
            },

            getSupportedTypes(): readonly SupportedExerciseType[] {
                return defaultService.getSupportedExerciseTypes();
            },

            isHealthy(): boolean {
                try {
                    const types = defaultService.getSupportedExerciseTypes();
                    return types.length > 0;
                } catch {
                    return false;
                }
            },

            getMetadata(): GeneratorMetadata {
                return {
                    name: 'Default Exercise Generator Service',
                    version: '2.2.0',
                    description: 'Service de génération d\'exercices par défaut pour MetaSign',
                    author: 'MetaSign Learning Team',
                    supportedTypes: defaultService.getSupportedExerciseTypes(),
                    capabilities: [
                        'multiple-choice-generation',
                        'basic-evaluation',
                        'caching',
                        'statistics'
                    ],
                    lastUpdated: new Date(),
                    performance: {
                        averageGenerationTime: 200,
                        averageEvaluationTime: 50,
                        reliability: 0.95
                    }
                };
            }
        };

        return adapter;
    }

    /**
     * Enregistre le service de génération par défaut dans le registre
     * @private
     */
    private async registerDefaultService(): Promise<void> {
        const serviceId = 'exercise-generator-default';

        if (!this.registry.hasService(serviceId)) {
            try {
                const defaultGenerator = await this.getDefaultGenerator('MultipleChoice');
                const serviceAdapter = new ExerciseGeneratorServiceAdapter(defaultGenerator);

                this.registry.registerService({
                    id: serviceId,
                    name: 'Default Exercise Generator',
                    version: '2.2.0',
                    description: 'Service de génération d\'exercices par défaut',
                    type: 'exercise-generator',
                    instance: serviceAdapter,
                    dependencies: [],
                    tags: ['default', 'exercise-generator', 'learning']
                });

                this.logger.info('Default exercise generator service registered');
            } catch (error) {
                this.logger.warn('Failed to register default service', {
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    }

    /**
     * Met à jour les statistiques de performance
     * @param generatorKey - Clé du générateur
     * @param eventType - Type d'événement
     * @private
     */
    private updatePerformanceStats(generatorKey: string, eventType: string): void {
        if (!this.generatorPerformanceStats.has(generatorKey)) {
            this.generatorPerformanceStats.set(generatorKey, {
                totalGenerated: 0,
                averageResponseTime: 500,
                successRate: 1.0,
                userSatisfactionScore: 7.0,
                errorCount: 0,
                lastUpdated: new Date()
            });
        }

        const stats = this.generatorPerformanceStats.get(generatorKey)!;

        switch (eventType) {
            case 'cache_hit':
                // Pas de mise à jour pour les hits de cache
                break;
            case 'generation_success':
                stats.totalGenerated++;
                stats.lastUpdated = new Date();
                break;
            case 'generation_error':
                stats.errorCount++;
                stats.successRate = Math.max(0, stats.successRate - 0.1);
                stats.lastUpdated = new Date();
                break;
        }
    }

    /**
     * Calcule un score de contexte pour un générateur
     * @param generator - Générateur à évaluer
     * @param context - Contexte de sélection
     * @returns Score de compatibilité (0-10)
     * @private
     */
    private calculateContextScore(generator: IAsyncExerciseGenerator, context: SelectionContext): number {
        let score = 5; // Score de base

        // Score basé sur les préférences utilisateur
        if (context.userPreferences) {
            score += this.calculatePreferenceScore(context.userPreferences);
        }

        // Score basé sur les contraintes temporelles
        if (context.timeConstraints) {
            score += this.calculateTimeConstraintScore(generator, context.timeConstraints);
        }

        // Score basé sur l'historique de performance
        if (context.performanceHistory && context.performanceHistory.length > 0) {
            const avgPerformance = context.performanceHistory.reduce((sum, p) => sum + p, 0) / context.performanceHistory.length;
            score += (avgPerformance / 10) * 2; // Bonus jusqu'à 2 points
        }

        return Math.max(0, Math.min(10, score));
    }

    /**
     * Calcule un score basé sur les préférences utilisateur
     * @param preferences - Préférences utilisateur
     * @returns Score de compatibilité (0-2)
     * @private
     */
    private calculatePreferenceScore(preferences: Record<string, unknown>): number {
        // Implémentation simplifiée - peut être étendue selon les besoins
        const preferenceCount = Object.keys(preferences).length;
        return Math.min(2, preferenceCount * 0.5);
    }

    /**
     * Calcule un score basé sur les contraintes temporelles
     * @param generator - Générateur à évaluer
     * @param constraints - Contraintes temporelles
     * @returns Score de compatibilité (0-3)
     * @private
     */
    private calculateTimeConstraintScore(
        generator: IAsyncExerciseGenerator,
        constraints: NonNullable<SelectionContext['timeConstraints']>
    ): number {
        const generatorId = this.getGeneratorId(generator);
        const stats = this.generatorPerformanceStats.get(generatorId);

        if (!stats) return 1;

        const speedScore = constraints.maxDuration / Math.max(stats.averageResponseTime, 100);
        const urgencyMultiplier = constraints.urgency === 'high' ? 2 : constraints.urgency === 'medium' ? 1.5 : 1;

        return Math.min(3, speedScore * urgencyMultiplier);
    }

    /**
     * Calcule un score de performance global
     * @param stats - Statistiques de performance
     * @returns Score de performance (0-10)
     * @private
     */
    private calculatePerformanceScore(stats: PerformanceStats): number {
        return (
            stats.successRate * 0.4 +
            stats.userSatisfactionScore * 0.3 +
            (1 - Math.min(stats.averageResponseTime / 10000, 1)) * 0.2 +
            (1 - Math.min(stats.errorCount / Math.max(stats.totalGenerated, 1), 1)) * 0.1
        ) * 10;
    }

    /**
     * Obtient la priorité par défaut pour un type d'exercice
     * @param type - Type d'exercice
     * @returns Priorité par défaut (1-10)
     * @private
     */
    private getDefaultPriority(type: SupportedExerciseType): number {
        const priorities: Partial<Record<SupportedExerciseType, number>> = {
            'MultipleChoice': 10, // Priorité élevée car bien implémenté
            'DragDrop': 5,
            'FillBlank': 5,
            'TextEntry': 4,
            'VideoResponse': 3,
            'SigningPractice': 8 // Priorité élevée pour la LSF
        };

        return priorities[type] ?? 5;
    }

    /**
     * Obtient un ID unique pour un générateur
     * @param generator - Générateur
     * @returns ID unique
     * @private
     */
    private getGeneratorId(generator: IAsyncExerciseGenerator): string {
        const types = generator.getSupportedTypes().join('_');
        const metadata = generator.getMetadata();
        return `${metadata.name}_${types}_${metadata.version}`.replace(/\s+/g, '_');
    }
}