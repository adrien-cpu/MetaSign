/**
 * @file: src/ai/coordinators/ProcessingPipeline.ts
 * 
 * Pipeline de traitement pour les requêtes d'orchestration du système LSF.
 * Gère le flux de traitement des requêtes à travers différentes étapes.
 */

import { logger } from '@/utils/Logger';
import {
    OrchestrationRequest,
    OrchestrationResult,
    OrchestrationRequestState,
    OrchestrationOperationType,
    PerformanceLevel,
    ValidationState,
    createOrchestrationResult
} from '@ai-types/orchestration.types';
import { MetricsCollector } from '@/ai/coordinators/services/MetricsCollector';
import { ICacheManager } from '@/ai/coordinators/interfaces/ICacheManager';
import { IEmotionFeedbackHandler } from '@/ai/coordinators/interfaces/IEmotionFeedbackHandler';
import { ErrorManager } from '@/ai/errors/ErrorManager';

/**
 * Type de gestionnaire d'étape de pipeline
 */
export type PipelineStepHandler<TInput = unknown, TOutput = unknown> =
    (input: TInput, context: PipelineContext) => Promise<TOutput>;

/**
 * Définition d'une étape de pipeline
 */
export interface PipelineStep<TInput = unknown, TOutput = unknown> {
    /** Nom unique de l'étape */
    name: string;
    /** Description de l'étape */
    description: string;
    /** Fonction de gestionnaire d'étape */
    handler: PipelineStepHandler<TInput, TOutput>;
    /** L'étape est-elle facultative */
    optional?: boolean;
    /** L'étape est-elle désactivée */
    disabled?: boolean;
    /** Types d'opérations compatibles (si vide, toutes) */
    supportedOperations?: OrchestrationOperationType[];
    /** Fonction de validation d'entrée */
    validateInput?: (input: unknown) => boolean;
    /** Configuration de reprise en cas d'erreur */
    errorHandling?: {
        /** Nombre maximal de tentatives */
        maxRetries?: number;
        /** Délai entre tentatives (ms) */
        retryDelay?: number;
        /** Stratégie de reprise */
        retryStrategy?: 'immediate' | 'backoff' | 'custom';
        /** Erreurs à ignorer */
        ignoreErrors?: string[];
        /** Fonction personnalisée de reprise */
        customRetryHandler?: (error: Error, attempt: number) => Promise<boolean>;
    };
}

/**
 * Contexte d'exécution du pipeline
 */
export interface PipelineContext {
    /** Requête d'orchestration */
    request: OrchestrationRequest;
    /** Données de contexte partagées entre les étapes */
    sharedData: Map<string, unknown>;
    /** Métriques de performance */
    metrics: {
        /** Heure de début d'exécution */
        startTime: number;
        /** Heure de fin d'exécution */
        endTime?: number;
        /** Métriques par étape */
        stepMetrics: Map<string, {
            /** Durée d'exécution (ms) */
            duration: number;
            /** Utilisation CPU (0-1) */
            cpuUsage: number;
            /** Utilisation mémoire (Mo) */
            memoryUsage: number;
            /** Statut de l'étape */
            status: 'success' | 'failure' | 'skipped';
            /** Erreur (si applicable) */
            error?: Error;
            /** Métriques personnalisées */
            customMetrics?: Record<string, number>;
        }>;
        /** Données de validation collectées */
        validationData?: Partial<ValidationState>;
    };
    /** Étape actuelle en cours d'exécution */
    currentStep?: string;
    /** Abandon du pipeline */
    abort?: () => void;
    /** Passer à une étape spécifique (par nom) */
    jumpToStep?: (stepName: string) => void;
    /** Données de gestionnaire d'erreur */
    errorHandling: {
        /** Erreurs rencontrées */
        errors: Error[];
        /** Dernière erreur rencontrée */
        lastError?: Error;
    };
}

/**
 * Interface du service de facturation
 */
interface IBillingService {
    /**
     * Enregistre l'utilisation d'une ressource
     * @param userId ID utilisateur
     * @param resourceType Type de ressource utilisée
     * @param amount Quantité utilisée
     */
    recordUsage(userId: string, resourceType: string, amount: number): Promise<void>;
}

/**
 * Options de configuration du pipeline de traitement
 */
export interface ProcessingPipelineOptions {
    /** Gestionnaire de cache */
    cacheManager?: ICacheManager;
    /** Service de métriques */
    metricsCollector?: MetricsCollector;
    /** Gestionnaire de retour émotionnel */
    emotionFeedbackHandler?: IEmotionFeedbackHandler;
    /** Service de facturation */
    billingService?: IBillingService;
    /** Gestionnaire d'erreur */
    errorManager?: ErrorManager;
    /** Niveau de journalisation */
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Configuration d'exécution du pipeline
 */
export interface PipelineExecutionConfig {
    /** Timeout global (ms) */
    globalTimeout?: number;
    /** ID de corrélation pour le suivi */
    correlationId?: string;
    /** Données personnalisées pour le contexte */
    customContextData?: Record<string, unknown>;
    /** Collecter les métriques détaillées */
    collectDetailedMetrics?: boolean;
    /** Forcer l'exécution sans utiliser le cache */
    forceNoCache?: boolean;
    /** Désactiver la validation */
    skipValidation?: boolean;
}

/**
 * Pipeline de traitement pour les requêtes d'orchestration
 */
export class ProcessingPipeline {
    /** Étapes du pipeline */
    private readonly steps: PipelineStep[] = [];
    /** Options de configuration */
    private readonly options: ProcessingPipelineOptions;
    /** Le pipeline est-il initialisé */
    private initialized = false;
    /** Gérer les dépendances externes */
    private readonly cacheManager?: ICacheManager;
    private readonly metricsCollector?: MetricsCollector;
    private readonly emotionFeedbackHandler?: IEmotionFeedbackHandler;
    private readonly billingService?: IBillingService;
    private readonly errorManager?: ErrorManager;

    /**
     * Crée une nouvelle instance de pipeline de traitement
     * @param options Options de configuration
     */
    constructor(options: ProcessingPipelineOptions = {}) {
        this.options = options;
        this.cacheManager = options.cacheManager;
        this.metricsCollector = options.metricsCollector;
        this.emotionFeedbackHandler = options.emotionFeedbackHandler;
        this.billingService = options.billingService;
        this.errorManager = options.errorManager;

        logger.debug('ProcessingPipeline created', {
            hasCacheManager: !!this.cacheManager,
            hasMetricsCollector: !!this.metricsCollector,
            hasEmotionFeedbackHandler: !!this.emotionFeedbackHandler,
            hasBillingService: !!this.billingService,
            hasErrorManager: !!this.errorManager
        });
    }

    /**
     * Initialise le pipeline de traitement
     * @returns Promise résolue lorsque l'initialisation est terminée
     */
    public async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        logger.info('Initializing ProcessingPipeline...');

        try {
            // Initialiser les dépendances si nécessaire
            const initPromises: Promise<void>[] = [];

            if (this.cacheManager && 'initialize' in this.cacheManager) {
                initPromises.push((this.cacheManager as { initialize(): Promise<void> }).initialize());
            }

            if (this.metricsCollector && 'initialize' in this.metricsCollector) {
                initPromises.push((this.metricsCollector as { initialize(): Promise<void> }).initialize());
            }

            if (initPromises.length > 0) {
                await Promise.all(initPromises);
            }

            // Enregistrer les étapes par défaut
            this.registerDefaultSteps();

            this.initialized = true;
            logger.info('ProcessingPipeline initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize ProcessingPipeline', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw new Error('ProcessingPipeline initialization failed');
        }
    }

    /**
     * Enregistre les étapes par défaut du pipeline
     * @private
     */
    private registerDefaultSteps(): void {
        // Étape 1: Validation de la requête
        this.registerStep({
            name: 'request_validation',
            description: 'Valide la requête d\'orchestration',
            handler: this.validateRequestStep.bind(this)
        });

        // Étape 2: Vérification du cache
        this.registerStep({
            name: 'cache_check',
            description: 'Vérifie si un résultat en cache est disponible',
            handler: this.checkCacheStep.bind(this),
            optional: true
        });

        // Étape 3: Préparation des données
        this.registerStep({
            name: 'data_preparation',
            description: 'Prépare les données pour le traitement',
            handler: this.prepareDataStep.bind(this)
        });

        // Étape 4: Traitement principal (doit être remplacé par des étapes spécifiques)
        this.registerStep({
            name: 'main_processing',
            description: 'Traitement principal de la requête',
            handler: this.mainProcessingStep.bind(this)
        });

        // Étape 5: Validation du résultat
        this.registerStep({
            name: 'result_validation',
            description: 'Valide le résultat du traitement',
            handler: this.validateResultStep.bind(this),
            optional: true
        });

        // Étape 6: Mise en cache du résultat
        this.registerStep({
            name: 'cache_result',
            description: 'Met en cache le résultat du traitement',
            handler: this.cacheResultStep.bind(this),
            optional: true
        });

        // Étape 7: Finalisation et métriques
        this.registerStep({
            name: 'finalization',
            description: 'Finalise le traitement et collecte les métriques',
            handler: this.finalizationStep.bind(this)
        });

        logger.debug(`Registered ${this.steps.length} default steps`);
    }

    /**
     * Enregistre une étape dans le pipeline
     * @param step Définition de l'étape
     * @returns L'instance du pipeline pour le chaînage
     */
    public registerStep(step: PipelineStep): ProcessingPipeline {
        // Vérifier si une étape avec le même nom existe déjà
        const existingIndex = this.steps.findIndex(s => s.name === step.name);
        if (existingIndex !== -1) {
            // Remplacer l'étape existante
            this.steps[existingIndex] = step;
            logger.debug(`Replaced existing step: ${step.name}`);
        } else {
            // Ajouter la nouvelle étape
            this.steps.push(step);
            logger.debug(`Added new step: ${step.name}`);
        }

        return this;
    }

    /**
     * Supprime une étape du pipeline
     * @param stepName Nom de l'étape à supprimer
     * @returns L'instance du pipeline pour le chaînage
     */
    public removeStep(stepName: string): ProcessingPipeline {
        const initialLength = this.steps.length;
        this.steps = this.steps.filter(step => step.name !== stepName);

        if (initialLength !== this.steps.length) {
            logger.debug(`Removed step: ${stepName}`);
        } else {
            logger.debug(`Step not found: ${stepName}`);
        }

        return this;
    }

    /**
     * Obtient toutes les étapes enregistrées
     * @returns Tableau des étapes
     */
    public getSteps(): PipelineStep[] {
        return [...this.steps];
    }

    /**
     * Recherche une étape par son nom
     * @param stepName Nom de l'étape
     * @returns L'étape si trouvée, undefined sinon
     */
    public getStepByName(stepName: string): PipelineStep | undefined {
        return this.steps.find(step => step.name === stepName);
    }

    /**
     * Active ou désactive une étape
     * @param stepName Nom de l'étape
     * @param disabled État désactivé
     * @returns True si l'étape a été trouvée et mise à jour
     */
    public setStepDisabled(stepName: string, disabled: boolean): boolean {
        const step = this.getStepByName(stepName);
        if (step) {
            step.disabled = disabled;
            return true;
        }
        return false;
    }

    /**
     * Exécute le pipeline pour une requête donnée
     * @param request Requête d'orchestration
     * @param config Configuration d'exécution
     * @returns Résultat de l'orchestration
     */
    public async execute(
        request: OrchestrationRequest,
        config: PipelineExecutionConfig = {}
    ): Promise<OrchestrationResult> {
        if (!this.initialized) {
            await this.initialize();
        }

        const startTime = Date.now();

        logger.info('Executing pipeline', {
            requestId: request.requestId,
            operationType: request.operationType,
            priority: request.priority,
            correlationId: config.correlationId
        });

        // Mettre à jour l'état de la requête
        request.state = OrchestrationRequestState.PROCESSING;

        // Initialiser le contexte d'exécution
        const context: PipelineContext = {
            request,
            sharedData: new Map(),
            metrics: {
                startTime,
                stepMetrics: new Map()
            },
            errorHandling: {
                errors: []
            }
        };

        // Ajouter les données personnalisées au contexte
        if (config.customContextData) {
            for (const [key, value] of Object.entries(config.customContextData)) {
                context.sharedData.set(key, value);
            }
        }

        // Fonction d'annulation
        let aborted = false;
        context.abort = () => {
            aborted = true;
            logger.warn('Pipeline execution aborted', { requestId: request.requestId });
        };

        // Navigation entre les étapes
        let currentStepIndex = 0;
        context.jumpToStep = (stepName: string) => {
            const targetIndex = this.steps.findIndex(step => step.name === stepName);
            if (targetIndex !== -1) {
                currentStepIndex = targetIndex - 1; // -1 car on incrémente au début de la boucle
                logger.debug(`Jumping to step: ${stepName}`, { requestId: request.requestId });
            } else {
                logger.warn(`Cannot jump to unknown step: ${stepName}`, { requestId: request.requestId });
            }
        };

        // Résultat de l'exécution
        let finalResult: OrchestrationResult | null = null;
        let finalError: Error | null = null;

        // Traitement des étapes
        try {
            const filteredSteps = this.getFilteredStepsForOperation(request.operationType);

            let stepInput: unknown = request.input;

            // Exécuter chaque étape séquentiellement
            for (currentStepIndex = 0; currentStepIndex < filteredSteps.length; currentStepIndex++) {
                if (aborted) {
                    logger.info('Aborting pipeline execution', { requestId: request.requestId });
                    break;
                }

                const step = filteredSteps[currentStepIndex];
                if (step.disabled) {
                    logger.debug(`Skipping disabled step: ${step.name}`, { requestId: request.requestId });
                    continue;
                }

                context.currentStep = step.name;

                // Vérifier si l'entrée est valide pour cette étape
                if (step.validateInput && !step.validateInput(stepInput)) {
                    if (step.optional) {
                        logger.debug(`Skipping optional step due to invalid input: ${step.name}`, { requestId: request.requestId });
                        continue;
                    } else {
                        throw new Error(`Invalid input for step: ${step.name}`);
                    }
                }

                // Exécuter l'étape avec gestion d'erreur et retry
                const stepStartTime = Date.now();
                const cpuStartUsage = process.cpuUsage();
                let stepResult: unknown;
                let stepSuccess = false;
                let stepError: Error | null = null;
                let retryCount = 0;
                const maxRetries = step.errorHandling?.maxRetries ?? 0;

                while (!stepSuccess && retryCount <= maxRetries) {
                    try {
                        // Si c'est une réessai, ajouter un délai
                        if (retryCount > 0) {
                            const retryDelay = this.calculateRetryDelay(step, retryCount);
                            if (retryDelay > 0) {
                                await new Promise(resolve => setTimeout(resolve, retryDelay));
                            }
                            logger.debug(`Retrying step: ${step.name} (attempt ${retryCount + 1}/${maxRetries + 1})`,
                                { requestId: request.requestId });
                        }

                        stepResult = await step.handler(stepInput, context);
                        stepSuccess = true;
                    } catch (error) {
                        stepError = error instanceof Error ? error : new Error(String(error));

                        // Vérifier si cette erreur doit être ignorée
                        const shouldIgnore = step.errorHandling?.ignoreErrors?.some(
                            errorCode => stepError?.message.includes(errorCode)
                        ) ?? false;

                        if (shouldIgnore) {
                            logger.warn(`Ignoring error in step ${step.name}: ${stepError.message}`,
                                { requestId: request.requestId });
                            stepSuccess = true; // Considérer comme un succès malgré l'erreur
                        } else if (retryCount < maxRetries) {
                            // On peut réessayer
                            retryCount++;
                            logger.warn(`Error in step ${step.name} (attempt ${retryCount}/${maxRetries + 1}): ${stepError.message}`,
                                { requestId: request.requestId });

                            // Vérifier si une stratégie de retry personnalisée est définie
                            if (step.errorHandling?.customRetryHandler) {
                                const shouldRetry = await step.errorHandling.customRetryHandler(stepError, retryCount);
                                if (!shouldRetry) {
                                    logger.info(`Custom retry handler decided not to retry step: ${step.name}`,
                                        { requestId: request.requestId });
                                    break;
                                }
                            }
                        } else {
                            // Plus de tentatives possibles
                            logger.error(`Step ${step.name} failed after ${retryCount + 1} attempts: ${stepError.message}`,
                                { requestId: request.requestId, error: stepError });

                            if (step.optional) {
                                logger.info(`Continuing execution despite failure in optional step: ${step.name}`,
                                    { requestId: request.requestId });
                                stepSuccess = true; // Continuer malgré l'échec d'une étape optionnelle
                            } else {
                                // Propager l'erreur pour une étape obligatoire
                                context.errorHandling.lastError = stepError;
                                context.errorHandling.errors.push(stepError);
                                throw stepError;
                            }
                        }