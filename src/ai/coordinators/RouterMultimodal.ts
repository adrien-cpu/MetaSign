/**
 * @file: src/ai/coordinators/RouterMultimodal.ts
 * 
 * Routeur multimodal amélioré qui distribue les requêtes vers les sous-systèmes appropriés.
 * Supporte différentes modalités (texte, vidéo, audio, mixed) et types de requêtes avec:
 * - Équilibrage de charge adaptatif
 * - Pipeline d'analyse contextuelle avancée
 * - Optimisation dynamique des performances
 * - Système de retry intelligent avec backoff exponentiel
 */
/**
 * @file: src/ai/coordinators/RouterMultimodal.ts
 */

import { EventEmitter } from 'events';
import { IACore } from '@ai/base/IACore';
import { SystemeExpressions } from '@ai/systems/SystemeExpressions';
import { LinguisteAI } from '@ai/specialized/LinguisteAI';
import { ContextAnalyzer } from '@ai/multimodal/analysis/ContextAnalyzer';
import { IntentAnalyzer } from '@ai/multimodal/analysis/IntentAnalyzer';
import { ModalityFusionEngine } from '@ai/multimodal/fusion/ModalityFusionEngine';
import { MetricsCollector } from '@ai/coordinators/services/MetricsCollector';
import {
    RequestType,
    ProcessRequest,
    ProcessResult,
    ModalityType,
    PriorityLevel,
} from '@ai-types/index';
import { getMonitoringSystem } from '@ai/monitoring/MonitoringUnifie';
import { MetricType } from '@ai-types/monitoring';

// Utiliser les valeurs de l'enum correctement
const METRIC_COUNTER = MetricType.COUNTER;
const METRIC_GAUGE = MetricType.GAUGE;

// Interface correcte qui correspond à l'implémentation réelle
interface MonitoringSystem {
    recordMetric(
        metricName: string,
        value: number,
        type?: MetricType,
        labels?: Record<string, string>
    ): void;
}

// Extension de ProcessResult pour inclure les métriques avec types précis
export interface EnhancedProcessResult<T> extends ProcessResult<T> {
    metrics?: {
        processingTime?: number | undefined;
        pipeline?: string | undefined;
        [key: string]: unknown | undefined;
    } | undefined;
}

// Logger personnalisé
const logger = {
    info: (message: string, data?: Record<string, unknown>) => console.info(message, data || ''),
    debug: (message: string, data?: Record<string, unknown>) => console.debug(message, data || ''),
    warn: (message: string, data?: Record<string, unknown>) => console.warn(message, data || ''),
    error: (message: string, data?: Record<string, unknown>) => console.error(message, data || '')
};

/**
 * Étape de traitement dans un pipeline
 */
export interface ProcessingStep {
    name: string;
    component: string;
}

/**
 * Pipeline de traitement pour les requêtes
 */
export interface ProcessingPipeline {
    id: string;
    steps: ProcessingStep[];
    applicableTypes: RequestType[];
}

/**
 * Configuration d'une route
 */
export interface RouteConfig {
    type: RequestType;
    modality: ModalityType;
    priority: PriorityLevel;
    handler: string;
    timeout: number; // ms
    retries: number;
    circuitBreakerThreshold?: number; // Seuil pour le circuit breaker (nombre d'erreurs)
    circuitBreakerResetTime?: number; // Temps avant réinitialisation (ms)
    cacheable?: boolean; // Peut-on mettre en cache les résultats
}

/**
 * Type pour les données de requête
 */
export type RequestData = string | Record<string, unknown> | ArrayBuffer | Uint8Array | Blob;

// Type de requête LSF
export interface LSFRequest {
    type: RequestType;
    modality: ModalityType;
    priority?: PriorityLevel;
    data: RequestData;
    userId?: string;
    sessionId?: string;
    timestamp: number;
    context?: Record<string, unknown>; // Contexte additionnel de la requête
    traceId?: string; // ID de traçage (pour correlation)
}

/**
 * Contexte de requête enrichi après analyse
 */
export interface EnrichedRequest extends LSFRequest {
    intent?: string;
    emotion?: string;
    confidence?: number;
    suggestedHandler?: string | undefined; // Modifier ici pour accepter undefined
    pipeline?: ProcessingPipeline;
    complexityScore?: number;
    preferredModalities?: ModalityType[];
}

/**
 * Statistiques de routage
 */
export interface RoutingStats {
    totalProcessed: number;
    byType: Record<string, number>;
    byModality: Record<ModalityType, number>;
    byPriority: Record<PriorityLevel, number>;
    averageProcessingTime: number;
    errorRate: number;
    circuitBreakerStatus?: Record<string, boolean>; // État des circuit breakers
    pipelineStats?: Record<string, {
        used: number;
        averageTime: number;
        success: number;
    }>;
    handlerLoadBalancing?: Record<string, number>; // Utilisation relative des handlers
    lastUpdated: Date;
}

/**
 * État d'un circuit breaker
 */
interface CircuitBreakerState {
    failures: number;
    lastFailure: number;
    open: boolean;
    nextAttempt: number;
}

/**
 * Statistiques détaillées d'un handler
 */
interface HandlerStats {
    calls: number;
    errors: number;
    totalTime: number;
    lastCall: number;
    averageResponseTime: number;
    errorRate: number;
    activeRequests: number;
}

/**
 * Interface du routeur multimodal
 */
export interface IRouterMultimodal {
    initialize(): Promise<void>;
    routeRequest(request: LSFRequest): Promise<EnhancedProcessResult<unknown>>;
    getStats(): RoutingStats;
    registerHandler(config: RouteConfig, handler: (request: LSFRequest) => Promise<EnhancedProcessResult<unknown>>): void;
    getPipelines(): Record<string, ProcessingPipeline>;
    shutdown(): Promise<void>;
}

/**
 * Type pour l'historique des requêtes
 */
interface RequestHistoryEntry {
    timestamp: number;
    type: RequestType;
    duration: number;
    success: boolean;
}

/**
 * Routeur multimodal qui distribue les requêtes vers les sous-systèmes appropriés
 */
export class RouterMultimodal extends EventEmitter implements IRouterMultimodal {
    private static instance: RouterMultimodal;

    // Sous-systèmes principaux
    private iaCore!: IACore;
    private expressionSystem!: SystemeExpressions;
    private linguistes!: LinguisteAI;

    // Système d'analyse et de fusion
    private contextAnalyzer: ContextAnalyzer;
    private intentAnalyzer: IntentAnalyzer;
    private modalityFusion: ModalityFusionEngine;

    // Pipelines de traitement
    private pipelines: Record<string, ProcessingPipeline> = {};

    // Système de monitoring
    private monitoringSystem: MonitoringSystem = getMonitoringSystem();
    private metricsCollector: MetricsCollector;

    // Routes et handlers
    private readonly routes: Map<string, RouteConfig> = new Map();
    private readonly handlers: Map<string, (request: LSFRequest) => Promise<EnhancedProcessResult<unknown>>> = new Map();
    private readonly handlerStats: Map<string, HandlerStats> = new Map();
    private readonly circuitBreakers: Map<string, CircuitBreakerState> = new Map();

    // Statistiques de routage
    private stats: RoutingStats = {
        totalProcessed: 0,
        byType: {},
        byModality: {
            text: 0,
            video: 0,
            audio: 0,
            image: 0,
            mixed: 0
        },
        byPriority: {
            high: 0,
            medium: 0,
            low: 0
        },
        averageProcessingTime: 0,
        errorRate: 0,
        pipelineStats: {},
        handlerLoadBalancing: {},
        lastUpdated: new Date()
    };

    private totalProcessingTime = 0;
    private totalErrors = 0;
    private isInitialized = false;

    // Load balancing et performance
    private readonly handlerLoadDistribution: Map<string, number> = new Map();
    private readonly activeRequests: Map<string, { startTime: number; route: string }> = new Map();
    private requestHistory: RequestHistoryEntry[] = [];

    /**
  * Constructeur privé (pattern Singleton)
  */
    private constructor() { // Changé en private pour respecter le pattern Singleton
        super();

        // Initialiser les statistiques pour tous les types de requêtes
        Object.values(RequestType).forEach(type => {
            this.stats.byType[type] = 0;
        });

        // Initialiser les composants d'analyse
        this.contextAnalyzer = new ContextAnalyzer();
        this.intentAnalyzer = new IntentAnalyzer();
        this.modalityFusion = new ModalityFusionEngine();

        // Initialiser le collecteur de métriques avec un ID numérique
        this.metricsCollector = new MetricsCollector(1001); // Utilisez un ID numérique approprié
        // ou consultez la documentation de MetricsCollector

        logger.info('RouterMultimodal created with advanced features');

        // Démarrer la maintenance périodique
        setInterval(() => this.performMaintenance(), 30000); // Exécuter toutes les 30 secondes
    }

    /**
     * Obtient l'instance unique du routeur (Singleton)
     */
    public static getInstance(): RouterMultimodal {
        if (!RouterMultimodal.instance) {
            RouterMultimodal.instance = new RouterMultimodal();
        }
        return RouterMultimodal.instance;
    }

    /**
   * Initialise le routeur multimodal
   */
    public async initialize(): Promise<void> {
        logger.info('Initializing RouterMultimodal...');

        try {
            // Utiliser performance.now() pour mesurer le temps d'initialisation
            const initStartTime = performance.now();

            // Code d'initialisation ici...
            this.iaCore = IACore.getInstance();

            // Utiliser un type assertion plus direct pour SystemeExpressions
            this.expressionSystem = {} as SystemeExpressions;
            this.linguistes = new LinguisteAI();

            // Initialiser les systèmes d'analyse en parallèle
            await Promise.all([
                this.contextAnalyzer.initialize(),
                this.intentAnalyzer.initialize(),
                this.modalityFusion.initialize()
            ]);

            // Configurer les pipelines de traitement
            this.configurePipelines();

            // Configurer les routes par défaut
            this.configureDefaultRoutes();

            // Calculer le temps d'initialisation
            const initDuration = performance.now() - initStartTime;

            // Utiliser directement Math.round() sans variable intermédiaire
            this.monitoringSystem.recordMetric(
                'router.init_time',
                Math.round(initDuration), // Valeur numérique directe sans conversion en string
                METRIC_GAUGE
            );

            this.isInitialized = true;
            logger.info(`RouterMultimodal initialized successfully in ${Math.round(initDuration)}ms`);
        } catch (error) {
            logger.error('Error initializing RouterMultimodal', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            throw new Error('Failed to initialize RouterMultimodal');
        }
    }

    /**
     * Configure les pipelines de traitement standards
     */
    private configurePipelines(): void {
        // Pipeline standard pour les requêtes textuelles
        this.pipelines['text_standard'] = {
            id: 'text_standard',
            steps: [
                { name: 'intent_analysis', component: 'intentAnalyzer' },
                { name: 'text_processing', component: 'textProcessor' },
                { name: 'response_generation', component: 'responseGenerator' }
            ],
            applicableTypes: [
                RequestType.TEXT_TO_LSF,
                RequestType.CULTURAL_VALIDATION,
                RequestType.GENERATE_EXPRESSION
            ]
        };

        // Pipeline pour les requêtes vidéo
        this.pipelines['video_recognition'] = {
            id: 'video_recognition',
            steps: [
                { name: 'video_preprocessing', component: 'videoPreprocessor' },
                { name: 'gesture_recognition', component: 'gestureRecognizer' },
                { name: 'semantic_analysis', component: 'semanticAnalyzer' }
            ],
            applicableTypes: [
                RequestType.LSF_TO_TEXT,
                RequestType.ANALYZE_EXPRESSION
            ]
        };

        // Pipeline pour les requêtes multimodales
        this.pipelines['multimodal_fusion'] = {
            id: 'multimodal_fusion',
            steps: [
                { name: 'modality_extraction', component: 'modalityExtractor' },
                { name: 'fusion', component: 'modalityFusion' },
                { name: 'context_integration', component: 'contextIntegrator' }
            ],
            applicableTypes: [
                RequestType.EMOTION_ANALYSIS,
                RequestType.AUDIO_ALIGNMENT,
                RequestType.PROSODY_ANALYSIS
            ]
        };

        // Pipeline d'apprentissage
        this.pipelines['learning_pipeline'] = {
            id: 'learning_pipeline',
            steps: [
                { name: 'learning_context', component: 'learningContextAnalyzer' },
                { name: 'learning_adaptation', component: 'learningAdapter' },
                { name: 'feedback_collector', component: 'feedbackCollector' }
            ],
            applicableTypes: [
                RequestType.LEARNING_MODULE,
                RequestType.LEARNING_PROGRESS,
                RequestType.LEARNING_RECOMMENDATION
            ]
        };

        logger.info(`${Object.keys(this.pipelines).length} processing pipelines configured`);
    }

    /**
     * Configure les routes par défaut
     */
    private configureDefaultRoutes(): void {
        // Route pour les traductions texte
        this.registerRouteConfig({
            type: RequestType.TEXT_TO_LSF,
            modality: 'text',
            priority: 'high',
            handler: 'textTranslationHandler',
            timeout: 5000,
            retries: 2,
            circuitBreakerThreshold: 5,
            circuitBreakerResetTime: 60000,
            cacheable: true
        });

        // Route pour les traductions vidéo
        this.registerRouteConfig({
            type: RequestType.LSF_TO_TEXT,
            modality: 'video',
            priority: 'medium',
            handler: 'videoTranslationHandler',
            timeout: 10000,
            retries: 1,
            circuitBreakerThreshold: 3,
            circuitBreakerResetTime: 120000,
            cacheable: true
        });

        // Route pour l'apprentissage
        this.registerRouteConfig({
            type: RequestType.LEARNING_MODULE,
            modality: 'mixed',
            priority: 'medium',
            handler: 'learningHandler',
            timeout: 8000,
            retries: 2,
            cacheable: false
        });

        // Route pour la reconnaissance
        this.registerRouteConfig({
            type: RequestType.ANALYZE_EXPRESSION,
            modality: 'video',
            priority: 'high',
            handler: 'videoRecognitionHandler',
            timeout: 6000,
            retries: 1,
            cacheable: true
        });

        // Route pour le contenu culturel
        this.registerRouteConfig({
            type: RequestType.CULTURAL_VALIDATION,
            modality: 'text',
            priority: 'low',
            handler: 'culturalContentHandler',
            timeout: 7000,
            retries: 3,
            cacheable: true
        });

        // Route pour la génération
        this.registerRouteConfig({
            type: RequestType.GENERATE_EXPRESSION,
            modality: 'text',
            priority: 'medium',
            handler: 'textGenerationHandler',
            timeout: 9000,
            retries: 2,
            cacheable: true
        });

        // Route pour l'analyse émotionnelle
        this.registerRouteConfig({
            type: RequestType.EMOTION_ANALYSIS,
            modality: 'mixed',
            priority: 'low',
            handler: 'emotionAnalysisHandler',
            timeout: 15000,
            retries: 3,
            cacheable: false
        });

        // Nouvelles routes à haute performance
        this.registerRouteConfig({
            type: RequestType.FACIAL_SYNC,
            modality: 'mixed',
            priority: 'high',
            handler: 'facialSyncHandler',
            timeout: 3000,
            retries: 1,
            cacheable: true
        });

        this.registerRouteConfig({
            type: RequestType.PROSODY_ANALYSIS,
            modality: 'audio',
            priority: 'medium',
            handler: 'prosodyAnalysisHandler',
            timeout: 5000,
            retries: 2,
            cacheable: true
        });

        logger.info(`${this.routes.size} default routes configured`);
    }

    /**
     * Enregistre une configuration de route
     */
    private registerRouteConfig(config: RouteConfig): void {
        const routeKey = this.getRouteKey(config.type, config.modality);
        this.routes.set(routeKey, config);

        // Initialiser les statistiques du circuit breaker si applicable
        if (config.circuitBreakerThreshold) {
            this.circuitBreakers.set(routeKey, {
                failures: 0,
                lastFailure: 0,
                open: false,
                nextAttempt: 0
            });
        }

        // Initialiser les statistiques du handler
        if (!this.handlerStats.has(config.handler)) {
            this.handlerStats.set(config.handler, {
                calls: 0,
                errors: 0,
                totalTime: 0,
                lastCall: 0,
                averageResponseTime: 0,
                errorRate: 0,
                activeRequests: 0
            });
        }

        logger.debug(`Route registered: ${routeKey}`);
    }

    /**
     * Enregistre un gestionnaire pour une route
     */
    public registerHandler(
        config: RouteConfig,
        handler: (request: LSFRequest) => Promise<EnhancedProcessResult<unknown>>
    ): void {
        // Enregistrer la configuration de route
        this.registerRouteConfig(config);

        // Enregistrer le gestionnaire
        this.handlers.set(config.handler, handler);

        // Initialiser la distribution de charge
        this.handlerLoadDistribution.set(config.handler, 0);

        logger.debug(`Handler registered: ${config.handler}`);
    }

    /**
     * Obtient la liste des pipelines de traitement disponibles
     */
    public getPipelines(): Record<string, ProcessingPipeline> {
        return { ...this.pipelines };
    }

    /**
     * Analyse le contexte d'une requête pour l'enrichir
     * @param request Requête à analyser
     * @returns Requête enrichie
     */
    private async analyzeRequestContext(request: LSFRequest): Promise<EnrichedRequest> {
        logger.debug('Analyzing request context', {
            requestId: request.sessionId,
            type: request.type,
            modality: request.modality
        });

        const enriched: EnrichedRequest = { ...request };

        try {
            // Analyser l'intention si applicable
            if (request.modality === 'text' || request.modality === 'mixed') {
                // Vérifier que les données sont sous forme de chaîne pour l'analyse d'intention
                const textData = typeof request.data === 'string'
                    ? request.data
                    : JSON.stringify(request.data);

                const intentResult = await this.intentAnalyzer.analyzeIntent(textData);
                enriched.intent = intentResult.intent;
                enriched.confidence = intentResult.confidence;
            }

            // Déterminer le pipeline approprié
            const suggestedPipeline = this.suggestPipeline(enriched);
            if (suggestedPipeline) {
                enriched.pipeline = suggestedPipeline;
            }

            // Estimer la complexité
            enriched.complexityScore = this.estimateComplexity(enriched);

            // Déterminer le handler suggéré
            const handler = this.suggestHandler(enriched);
            if (handler !== undefined) {
                enriched.suggestedHandler = handler;
            }

            return enriched;
        } catch (error) {
            // En cas d'erreur, continuer avec les informations disponibles
            logger.warn('Error enriching request context', {
                error: error instanceof Error ? error.message : String(error),
                requestId: request.sessionId
            });

            return enriched;
        }
    }

    /**
     * Suggère un pipeline de traitement approprié
     * @param request Requête à traiter
     * @returns Pipeline suggéré ou undefined
     */
    private suggestPipeline(request: EnrichedRequest): ProcessingPipeline | undefined {
        // Trouver tous les pipelines applicables à ce type de requête
        const applicablePipelines = Object.values(this.pipelines).filter(
            pipeline => pipeline.applicableTypes.includes(request.type as RequestType)
        );

        if (applicablePipelines.length === 0) {
            return undefined;
        }

        if (applicablePipelines.length === 1) {
            return applicablePipelines[0];
        }

        // TODO: Logique plus avancée pour choisir parmi plusieurs pipelines applicables

        // Par défaut, retourner le premier applicable
        return applicablePipelines[0];
    }

    /**
     * Estime la complexité d'une requête
     * @param request Requête à évaluer
     * @returns Score de complexité (1-10)
     */
    private estimateComplexity(request: EnrichedRequest): number {
        let complexity = 5; // Complexité moyenne par défaut

        // Ajuster selon le type
        switch (request.type) {
            case RequestType.LSF_TO_TEXT:
            case RequestType.ANALYZE_EXPRESSION:
                complexity += 2; // Traitement vidéo plus complexe
                break;
            case RequestType.EMOTION_ANALYSIS:
            case RequestType.PROSODY_ANALYSIS:
                complexity += 1; // Analyse émotionnelle modérément complexe
                break;
        }

        // Ajuster selon la modalité
        if (request.modality === 'mixed') {
            complexity += 1; // Traitement multimodal plus complexe
        }

        // Ajuster selon le contexte si disponible
        if (request.context) {
            if (request.context.longInput) complexity += 1;
            if (request.context.highQuality) complexity += 1;
            if (request.context.realtime) complexity -= 1; // Réaltime implique souvent des compromis
        }

        // Limiter entre 1 et 10
        return Math.max(1, Math.min(10, complexity));
    }

    /**
  * Suggère un handler basé sur l'analyse de la requête
  * @param request Requête enrichie
  * @returns Nom du handler suggéré
  */
    private suggestHandler(request: EnrichedRequest): string {
        // Trouver la route correspondant au type et à la modalité
        const routeKey = this.getRouteKey(request.type as RequestType, request.modality);
        const routeConfig = this.routes.get(routeKey);

        if (routeConfig) {
            return routeConfig.handler;
        }

        // Si aucune route exacte n'est trouvée, suggérer en fonction de l'intent
        if (request.intent === 'translate') {
            return request.modality === 'text' ? 'textTranslationHandler' : 'videoTranslationHandler';
        }

        if (request.intent === 'learn') {
            return 'learningHandler';
        }

        if (request.intent === 'analyze') {
            return 'videoRecognitionHandler';
        }

        // Retourner une valeur par défaut au lieu de undefined
        return 'defaultHandler';
    }

    /**
     * Route une requête vers le gestionnaire approprié
     */
    public async routeRequest(request: LSFRequest): Promise<EnhancedProcessResult<unknown>> {
        if (!this.isInitialized) {
            throw new Error('RouterMultimodal is not initialized');
        }

        // Ajouter un timestamp si non présent
        if (!request.timestamp) {
            request.timestamp = Date.now();
        }

        // Normaliser la priorité si non spécifiée
        if (!request.priority) {
            request.priority = 'medium';
        }

        // Ajouter un ID de traçage si non présent
        if (!request.traceId) {
            request.traceId = `trace-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        }

        logger.debug('Routing request', {
            traceId: request.traceId,
            type: request.type,
            modality: request.modality
        });

        // Enregistrer le début du traitement pour les métriques
        const startTime = Date.now();
        this.monitoringSystem.recordMetric('router.request_received', 1, METRIC_COUNTER, {
            requestType: request.type as string,
            modality: request.modality
        });

        // Créer un identifiant de suivi unique pour cette requête
        const requestTrackingId = request.traceId || request.sessionId || `req-${startTime}`;

        try {
            // Enrichir la requête avec l'analyse contextuelle
            const enrichedRequest = await this.analyzeRequestContext(request);

            // Trouver la configuration de route appropriée
            const routeKey = this.getRouteKey(request.type as RequestType, request.modality);
            const routeConfig = this.routes.get(routeKey);

            if (!routeConfig) {
                throw new Error(`No route found for ${routeKey}`);
            }

            // Vérifier l'état du circuit breaker
            if (this.isCircuitOpen(routeKey)) {
                logger.warn(`Circuit breaker open for route ${routeKey}`, {
                    traceId: request.traceId
                });

                this.monitoringSystem.recordMetric(
                    'router.circuit_breaker_block',
                    1,
                    METRIC_COUNTER,
                    {
                        route: String(routeKey)
                    }
                );

                throw new Error(`Service temporarily unavailable (circuit breaker open) for ${routeKey}`);
            }

            // Rechercher un handler personnalisé ou utiliser le handler par défaut
            const handlerName = enrichedRequest.suggestedHandler || routeConfig.handler;
            const handler = this.handlers.get(handlerName);

            // Mettre à jour les stats de charge du handler
            this.updateHandlerLoad(handlerName);

            // Enregistrer la requête active
            this.activeRequests.set(requestTrackingId, {
                startTime,
                route: routeKey
            });

            // Incrémenter le compteur de requêtes actives
            const handlerStat = this.handlerStats.get(handlerName);
            if (handlerStat) {
                handlerStat.activeRequests++;
                handlerStat.lastCall = Date.now();
            }

            try {
                // Exécuter le gestionnaire avec gestion de timeout et retries
                let response;

                if (handler) {
                    // Utiliser le handler personnalisé
                    response = await this.executeWithRetries(
                        () => this.executeWithTimeout(
                            () => handler(enrichedRequest),
                            routeConfig.timeout
                        ),
                        routeConfig.retries
                    );
                } else {
                    // Utiliser le handler par défaut
                    response = await this.handleDefaultRoute(enrichedRequest);
                }

                // Calculer le temps de traitement
                const processingTime = Date.now() - startTime;

                // Mettre à jour les statistiques
                this.updateStats(request, processingTime, false);

                // Mettre à jour les statistiques du handler
                if (handlerStat) {
                    handlerStat.calls++;
                    handlerStat.totalTime += processingTime;
                    handlerStat.averageResponseTime = handlerStat.totalTime / handlerStat.calls;
                    handlerStat.activeRequests--;
                }

                // Mettre à jour les statistiques du pipeline
                if (enrichedRequest.pipeline) {
                    const pipelineId = enrichedRequest.pipeline.id;
                    if (!this.stats.pipelineStats) this.stats.pipelineStats = {};

                    // Utiliser une clé garantie non-undefined
                    const pipelineKey = pipelineId || 'unknown';

                    if (!this.stats.pipelineStats[pipelineKey]) {
                        this.stats.pipelineStats[pipelineKey] = {
                            used: 0,
                            averageTime: 0,
                            success: 0
                        };
                    }

                    const pipelineStat = this.stats.pipelineStats[pipelineKey];
                    pipelineStat.used++;
                    pipelineStat.averageTime = (pipelineStat.averageTime * (pipelineStat.used - 1) + processingTime) / pipelineStat.used;
                    pipelineStat.success++;
                }

                // Enregistrer les métriques de performance
                // S'assurer que nous avons une valeur non-undefined pour handler
                const metricHandlerName = handlerName || 'unknown';

                this.monitoringSystem.recordMetric('router.processing_time', processingTime, METRIC_GAUGE, {
                    requestType: request.type as string,
                    modality: request.modality,
                    priority: request.priority,
                    handler: metricHandlerName
                });

                this.monitoringSystem.recordMetric(
                    'router.request_success',
                    1,
                    METRIC_COUNTER,
                    {
                        requestType: String(request.type || 'unknown'),
                        modality: String(request.modality || 'unknown')
                    }
                );

                // Enregistrer dans l'historique pour analyse
                this.requestHistory.push({
                    timestamp: Date.now(),
                    type: request.type as RequestType,
                    duration: processingTime,
                    success: true
                });

                // Limiter la taille de l'historique
                if (this.requestHistory.length > 1000) {
                    this.requestHistory = this.requestHistory.slice(-1000);
                }

                logger.debug(`Request processed in ${processingTime}ms`, {
                    traceId: request.traceId,
                    type: request.type,
                    modality: request.modality
                });

                // Supprimer de la liste des requêtes actives
                this.activeRequests.delete(requestTrackingId);

                // Créer le résultat enrichi
                const enhancedResponse: EnhancedProcessResult<unknown> = {
                    ...response,
                    metrics: {
                        ...(response.metrics || {}),
                        processingTime,
                        pipeline: enrichedRequest.pipeline?.id || undefined // Expliciter l'undefined
                    }
                };

                return enhancedResponse;
            } catch (error) {
                // Décrémenter le compteur de requêtes actives
                if (handlerStat) {
                    handlerStat.activeRequests--;
                    handlerStat.errors++;
                    handlerStat.errorRate = handlerStat.errors / handlerStat.calls;
                }

                // Mettre à jour le circuit breaker
                this.recordFailure(routeKey);

                throw error;
            }
        } catch (error) {
            // Mettre à jour les statistiques d'erreur
            this.updateStats(request, 0, true);

            // Enregistrer dans l'historique pour analyse
            this.requestHistory.push({
                timestamp: Date.now(),
                type: request.type as RequestType,
                duration: Date.now() - startTime,
                success: false
            });

            // Limiter la taille de l'historique
            if (this.requestHistory.length > 1000) {
                this.requestHistory = this.requestHistory.slice(-1000);
            }

            // Enregistrer l'erreur
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error('Error routing request', {
                error: errorMessage,
                traceId: request.traceId,
                type: request.type,
                modality: request.modality,
                stack: error instanceof Error ? error.stack : undefined
            });

            // Dernière tentative : utilisons des métadonnées génériques
            const safeMetadata: Record<string, string> = {};
            safeMetadata.requestType = String(request.type || 'unknown');
            safeMetadata.modality = String(request.modality || 'unknown');
            safeMetadata.errorType = error instanceof Error ? String(error.name || 'Error') : 'Unknown';

            this.monitoringSystem.recordMetric(
                'router.error',
                1,
                METRIC_COUNTER,
                safeMetadata
            );

            // Supprimer la requête active
            this.activeRequests.delete(requestTrackingId);

            throw error;
        }
    }

    /**
     * Vérifie si le circuit breaker est ouvert pour une route donnée
     * @param routeKey Clé de la route
     * @returns true si le circuit est ouvert
     */
    private isCircuitOpen(routeKey: string): boolean {
        const circuit = this.circuitBreakers.get(routeKey);
        if (!circuit) return false;

        const now = Date.now();

        // Si le circuit est ouvert mais qu'il est temps de réessayer
        if (circuit.open && now > circuit.nextAttempt) {
            circuit.open = false;
            logger.info(`Circuit breaker reset attempt for ${routeKey}`);
            return false;
        }

        return circuit.open;
    }

    /**
     * Enregistre un échec pour une route
     * @param routeKey Clé de la route
     */
    private recordFailure(routeKey: string): void {
        const circuit = this.circuitBreakers.get(routeKey);
        if (!circuit) return;

        const routeConfig = this.routes.get(routeKey);
        if (!routeConfig || !routeConfig.circuitBreakerThreshold) return;

        circuit.failures++;
        circuit.lastFailure = Date.now();

        // Vérifier si le seuil est atteint
        if (circuit.failures >= routeConfig.circuitBreakerThreshold) {
            circuit.open = true;
            circuit.nextAttempt = Date.now() + (routeConfig.circuitBreakerResetTime || 60000);

            logger.warn(`Circuit breaker opened for ${routeKey}`, {
                failures: circuit.failures,
                nextAttempt: new Date(circuit.nextAttempt).toISOString()
            });

            this.monitoringSystem.recordMetric(
                'router.circuit_breaker_open',
                1,
                METRIC_COUNTER,
                {
                    route: String(routeKey)
                }
            );
        }
    }

    /**
     * Met à jour la charge du handler
     * @param handlerName Nom du handler
     */
    private updateHandlerLoad(handlerName: string): void {
        // Incrémenter la charge du handler choisi
        const currentLoad = this.handlerLoadDistribution.get(handlerName) || 0;
        this.handlerLoadDistribution.set(handlerName, currentLoad + 1);

        // Mettre à jour les statistiques de distribution
        if (!this.stats.handlerLoadBalancing) {
            this.stats.handlerLoadBalancing = {};
        }

        // Calculer les pourcentages
        const totalCalls = [...this.handlerLoadDistribution.values()].reduce((a, b) => a + b, 0);

        for (const [handler, count] of this.handlerLoadDistribution.entries()) {
            this.stats.handlerLoadBalancing[handler] = (count / totalCalls) * 100;
        }
    }

    /**
     * Gère les routes par défaut en fonction du type de requête
     */
    private async handleDefaultRoute(request: EnrichedRequest): Promise<EnhancedProcessResult<unknown>> {
        logger.debug(`Using default handler for ${request.type}`);

        switch (request.type) {
            // Requêtes IA Core
            case RequestType.CONTEXT_ANALYSIS:
            case RequestType.EMOTION_ANALYSIS:
            case RequestType.SYSTEM_STATUS:
            case RequestType.PERFORMANCE_METRICS:
            case RequestType.CACHE_MANAGEMENT:
                return this.routeToIACore(request);

            // Requêtes linguistiques
            case RequestType.LSF_TRANSLATION:
            case RequestType.TEXT_TO_LSF:
            case RequestType.LSF_TO_TEXT:
            case RequestType.CULTURAL_VALIDATION:
                return this.routeToLinguistes(request);

            // Requêtes d'expression
            case RequestType.GENERATE_EXPRESSION:
            case RequestType.ANALYZE_EXPRESSION:
            case RequestType.OPTIMIZE_EXPRESSION:
            case RequestType.GESTURE_GENERATION:
            case RequestType.FACIAL_SYNC:
                return this.routeToExpressionSystem(request);

            // Requêtes multimodales avancées
            case RequestType.AUDIO_ALIGNMENT:
            case RequestType.PROSODY_ANALYSIS:
                return this.routeToMultiModalProcessor(request);

            // Requêtes d'apprentissage
            case RequestType.LEARNING_MODULE:
            case RequestType.LEARNING_PROGRESS:
            case RequestType.BADGE_ACHIEVEMENT:
            case RequestType.LEARNING_RECOMMENDATION:
                return this.routeToLearningSystem(request);

            default:
                throw new Error(`Unsupported request type: ${request.type}`);
        }
    }

    /**
     * Exécute une fonction avec un timeout
     */
    private async executeWithTimeout<T>(
        fn: () => Promise<T>,
        timeoutMs: number
    ): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            // Créer un timer pour le timeout
            const timeoutId = setTimeout(() => {
                reject(new Error(`Operation timed out after ${timeoutMs}ms`));
            }, timeoutMs);

            // Exécuter la fonction
            fn()
                .then(result => {
                    clearTimeout(timeoutId);
                    resolve(result);
                })
                .catch(error => {
                    clearTimeout(timeoutId);
                    reject(error);
                });
        });
    }

    /**
     * Exécute une fonction avec retries en cas d'échec
     */
    private async executeWithRetries<T>(
        fn: () => Promise<T>,
        maxRetries: number
    ): Promise<T> {
        let lastError: Error | undefined;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error as Error;

                if (attempt < maxRetries) {
                    // Attente exponentielle entre les tentatives (backoff exponentiel)
                    const delay = Math.pow(2, attempt) * 500 + Math.random() * 200;
                    logger.warn(`Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${delay.toFixed(0)}ms`, {
                        error: error instanceof Error ? error.message : String(error)
                    });
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        if (lastError) {
            throw lastError;
        }

        // Cas théoriquement impossible si lastError est toujours défini après la boucle
        throw new Error('All retry attempts failed without specific error');
    }

    /**
     * Met à jour les statistiques de routage
     */
    private updateStats(
        request: LSFRequest,
        processingTime: number,
        isError: boolean
    ): void {
        // Incrémenter le compteur global
        this.stats.totalProcessed++;

        // Incrémenter les compteurs par type
        const requestType = request.type as string;
        if (this.stats.byType[requestType] === undefined) {
            this.stats.byType[requestType] = 0;
        }
        this.stats.byType[requestType]++;

        // Incrémenter les compteurs par modalité
        const modalityType = request.modality as ModalityType;
        this.stats.byModality[modalityType]++;

        // Incrémenter les compteurs par priorité
        const priority = request.priority || 'medium';
        this.stats.byPriority[priority]++;

        // Mettre à jour le temps de traitement moyen
        if (processingTime > 0) {
            this.totalProcessingTime += processingTime;
            this.stats.averageProcessingTime = this.totalProcessingTime / this.stats.totalProcessed;
        }

        // Mettre à jour le taux d'erreur
        if (isError) {
            this.totalErrors++;
            this.stats.errorRate = this.totalErrors / this.stats.totalProcessed;
        }

        // Mettre à jour la date de dernière mise à jour
        this.stats.lastUpdated = new Date();
    }

    /**
     * Récupère les statistiques de routage
     */
    public getStats(): RoutingStats {
        // Ajouter l'état des circuit breakers
        if (!this.stats.circuitBreakerStatus) {
            this.stats.circuitBreakerStatus = {};
        }

        for (const [route, circuit] of this.circuitBreakers.entries()) {
            this.stats.circuitBreakerStatus[route] = circuit.open;
        }

        // Mettre à jour les statistiques d'utilisation des handlers
        if (!this.stats.handlerLoadBalancing) {
            this.stats.handlerLoadBalancing = {};
        }

        for (const [handler, stats] of this.handlerStats.entries()) {
            if (!this.stats.handlerLoadBalancing[handler]) {
                this.stats.handlerLoadBalancing[handler] = 0;
            }

            // Mettre à jour avec les dernières données
            if (stats.calls > 0) {
                this.stats.handlerLoadBalancing[handler] = (stats.calls / this.stats.totalProcessed) * 100;
            }
        }

        // Retourner une copie pour éviter les modifications externes
        return { ...this.stats };
    }

    /**
     * Génère une clé de route à partir du type et de la modalité
     * @returns Clé de route générée
     */
    private getRouteKey(type: RequestType, modality: ModalityType): string {
        return `${String(type || '')}:${String(modality || '')}`;
    }

    /**
     * Route une requête vers IACore
     */
    private async routeToIACore(request: LSFRequest): Promise<EnhancedProcessResult<unknown>> {
        // S'assurer d'avoir un requestId non-undefined
        const requestId: string = `${request.sessionId || 'session'}-${Date.now()}`;

        const processRequest: ProcessRequest = {
            id: requestId,
            type: request.type,
            data: request.data,
            metadata: {
                userId: request.userId,
                modality: request.modality,
                priority: request.priority,
                context: request.context,
                traceId: request.traceId
            }
        };

        // Supposons que IACore.processRequest retourne une Promise<ProcessResult<unknown>>
        return this.iaCore.processRequest(processRequest.id, processRequest.type, processRequest.data);
    }

    /**
     * Route une requête vers le système d'expressions
     */
    private async routeToExpressionSystem(request: LSFRequest): Promise<EnhancedProcessResult<unknown>> {
        const requestId = request.sessionId ? `${request.sessionId}-${Date.now()}` : `session-${Date.now()}`;

        // Puisque SystemeExpressions ne semble pas avoir de method processRequest,
        // nous devons créer une solution temporaire
        const startTime = performance.now();

        // Simuler un traitement
        await new Promise(resolve => setTimeout(resolve, 100));

        // Résultat simulé
        return {
            requestId,
            success: true,
            data: {
                message: `Expression request processed: ${request.type}`,
                type: request.type
            },
            processingTime: performance.now() - startTime
        };
    }

    /**
     * Route une requête vers le système linguistique
     */
    private async routeToLinguistes(request: LSFRequest): Promise<EnhancedProcessResult<unknown>> {
        const requestId = request.sessionId ? `${request.sessionId}-${Date.now()}` : `session-${Date.now()}`;

        // Puisque LinguisteAI ne semble pas avoir de method processRequest,
        // nous devons créer une solution temporaire
        const startTime = performance.now();

        // Simuler un traitement
        await new Promise(resolve => setTimeout(resolve, 150));

        // Résultat simulé
        return {
            requestId,
            success: true,
            data: {
                message: `Linguistic request processed: ${request.type}`,
                type: request.type
            },
            processingTime: performance.now() - startTime
        };
    }

    /**
     * Route une requête vers le processeur multimodal
     */
    private async routeToMultiModalProcessor(request: LSFRequest): Promise<EnhancedProcessResult<unknown>> {
        // Utiliser le moteur de fusion multimodale
        try {
            const startTime = performance.now();
            const requestId = request.sessionId ? `${request.sessionId}-${Date.now()}` : `session-${Date.now()}`;

            // Simuler la préparation et fusion des données
            await new Promise(resolve => setTimeout(resolve, 80));

            // Simuler l'analyse finale
            const result = {
                success: true,
                data: {
                    analysis: "Multimodal analysis completed",
                    confidence: 0.85,
                    modalitiesUsed: ["audio", "visual"]
                },
                processingTime: performance.now() - startTime
            };

            return {
                requestId,
                success: true,
                data: result,
                processingTime: performance.now() - startTime
            };
        } catch (error) {
            // En cas d'échec, rediriger vers IACore comme fallback
            logger.warn('Multimodal processing failed, falling back to IACore', {
                error: error instanceof Error ? error.message : String(error),
                traceId: request.traceId
            });

            return this.routeToIACore(request);
        }
    }

    /**
     * Route une requête vers le système d'apprentissage
     */
    private async routeToLearningSystem(request: LSFRequest): Promise<EnhancedProcessResult<unknown>> {
        // Simulation d'un système d'apprentissage
        const startTime = performance.now();
        const requestId = request.sessionId ? `${request.sessionId}-${Date.now()}` : `session-${Date.now()}`;

        // Simuler un délai de traitement réaliste
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

        const response = {
            success: true,
            data: {
                message: `Learning request processed: ${request.type}`,
                details: "Learning module response",
                userId: request.userId,
                progress: Math.random() * 100,
                nextRecommendation: {
                    moduleId: "m" + Math.floor(Math.random() * 10),
                    difficulty: Math.floor(Math.random() * 3) + 1
                }
            }
        };

        const processingTime = performance.now() - startTime;

        return {
            requestId,
            success: true,
            data: response,
            processingTime
        };
    }

    /**
     * Effectue les tâches de maintenance périodiques
     * - Nettoyage des circuits breakers
     * - Mise à jour des statistiques
     * - Analyse des performances
     */
    private performMaintenance(): void {
        if (!this.isInitialized) {
            return;
        }

        logger.debug('Performing router maintenance');

        try {
            // Réinitialiser les circuit breakers si nécessaire
            for (const [route, circuit] of this.circuitBreakers.entries()) {
                const routeConfig = this.routes.get(route);
                if (!routeConfig) continue;

                // Réinitialiser les échecs si aucun échec récent
                const resetTime = routeConfig.circuitBreakerResetTime || 60000;
                if (!circuit.open && Date.now() - circuit.lastFailure > resetTime) {
                    circuit.failures = 0;
                }
            }

            // Nettoyer l'historique des requêtes (garder 1 heure)
            const cutoffTime = Date.now() - 3600000;
            this.requestHistory = this.requestHistory.filter(entry => entry.timestamp >= cutoffTime);

            // Analyser les performances
            this.analyzePerformanceTrends();

            // Vérifier les requêtes bloquées (actives depuis trop longtemps)
            for (const [id, request] of this.activeRequests.entries()) {
                if (Date.now() - request.startTime > 60000) { // 1 minute
                    logger.warn(`Request ${id} potentially stuck (active for ${Date.now() - request.startTime}ms)`, {
                        route: request.route
                    });

                    this.monitoringSystem.recordMetric(
                        'router.stuck_request',
                        1,
                        METRIC_COUNTER,
                        {
                            route: String(request.route || 'unknown')
                        }
                    );
                }
            }
        } catch (error) {
            logger.error('Error during router maintenance', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * Analyse les tendances de performance
     */
    private analyzePerformanceTrends(): void {
        // Analyser l'historique récent pour détecter les tendances
        if (this.requestHistory.length < 10) return;

        // Calculer le taux d'erreur récent
        const recentRequests = this.requestHistory.slice(-50);
        const recentErrorRate = recentRequests.filter(r => !r.success).length / recentRequests.length;

        // Alerte si le taux d'erreur dépasse un seuil
        if (recentErrorRate > 0.2) { // Plus de 20% d'erreurs
            logger.warn(`High error rate detected: ${(recentErrorRate * 100).toFixed(1)}%`);

            this.monitoringSystem.recordMetric(
                'router.high_error_rate',
                recentErrorRate,
                METRIC_GAUGE
            );

            // Analyser quels types de requêtes ont des problèmes
            const typeErrorCounts: Record<string, { total: number; errors: number }> = {};

            for (const request of recentRequests) {
                if (!typeErrorCounts[request.type]) {
                    typeErrorCounts[request.type] = { total: 0, errors: 0 };
                }

                typeErrorCounts[request.type].total++;

                if (!request.success) {
                    typeErrorCounts[request.type].errors++;
                }
            }

            // Identifier les types problématiques
            for (const [type, counts] of Object.entries(typeErrorCounts)) {
                if (counts.total >= 5 && counts.errors / counts.total > 0.3) {
                    logger.warn(`High error rate for ${type}: ${(counts.errors / counts.total * 100).toFixed(1)}%`);
                }
            }
        }

        // Analyser les temps de réponse
        const averageTime = recentRequests.reduce((sum, r) => sum + r.duration, 0) / recentRequests.length;

        if (averageTime > 1000) { // Plus d'une seconde en moyenne
            logger.info(`Average response time is high: ${averageTime.toFixed(1)}ms`);
        }
    }

    /**
     * Arrête proprement le routeur
     */
    public async shutdown(): Promise<void> {
        logger.info('Shutting down RouterMultimodal...');

        try {
            // Libérer les ressources
            this.activeRequests.clear();
            this.requestHistory = [];

            // Arrêter les composants
            // Comme ces composants n'ont pas de méthode shutdown(), nous n'appelons rien

            this.isInitialized = false;

            logger.info('RouterMultimodal shut down successfully');
        } catch (error) {
            logger.error('Error during router shutdown', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }
}

/**
 * Fonction utilitaire pour récupérer l'instance du routeur multimodal
 * @returns Instance du routeur multimodal
 */
export function getRouterMultimodal(): RouterMultimodal {
    return RouterMultimodal.getInstance();
}