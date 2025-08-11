/**
 * @file: src/ai/coordinators/SystemeOrchestrateurCentral.ts
 * 
 * Système d'orchestration central conforme au diagramme d'état
 * Coordonne tous les composants du système LSF en utilisant une architecture modulaire
 */

import { EventEmitter } from 'events';
import { Logger } from '@ai/utils/Logger';
import {
    LSFRequest,
    OrchestrationResult,
    OrchestratorOptions,
    OrchestrationMode,
    OrchestratorState,
    DialectInfo,
    PerformanceStats,
    ValidationResult
} from '@ai/coordinators/types/orchestrator.types';
import {
    OrchestratorError,
    ComponentInitializationError
} from '@ai/coordinators/errors/orchestrator.errors';
import { RequestType, SystemState } from '@ai/coordinators/types';

// Imports des systèmes et composants
import { SystemeControleEthique } from '@ai/ethics/core/SystemeControleEthique';
import { SystemeExpressions } from '@ai/systems/SystemeExpressions';
import { IACore } from '@ai/base/IACore';
import { LearningSystem } from '@ai/learning/LearningSystem';
import { GestionVariantesDiatopiques } from '@ai/cultural/GestionVariantesDiatopiques';
import { ValidationCollaborative } from '@ai/validation/ValidationCollaborative';
import { MonitoringUnifie } from '@ai/monitoring/MonitoringUnifie';
import { GestionEspaceSpatial } from '@ai/spatial/GestionEspaceSpatial';

// Imports des services réfactorisés
import { MetricsCollector } from '@ai/coordinators/services/MetricsCollector';
import { CacheService } from '@ai/coordinators/services/CacheService';
import { OptimizationService } from '@ai/coordinators/services/OptimizationService';
import { AlertManager } from '@ai/coordinators/services/AlertManager';
import { RequestService } from '@ai/coordinators/services/RequestService';

/**
 * Système d'orchestration central conforme au diagramme d'état
 * Coordonne tous les composants du système en utilisant une architecture modulaire
 */
export class SystemeOrchestrateurCentral {
    private readonly logger = Logger.getInstance('SystemeOrchestrateurCentral');
    private systemState: SystemState = SystemState.INITIALIZING;
    private readonly eventEmitter = new EventEmitter();
    private orchestrationMode: OrchestrationMode;
    private startTime: number;

    // Composants principaux
    private ethicsSystem!: SystemeControleEthique;
    private iaCore!: IACore;
    private expressionsSystem!: SystemeExpressions;
    private monitoringSystem!: MonitoringUnifie;
    private learningSystem: LearningSystem | null = null;
    private dialectSystem!: GestionVariantesDiatopiques;
    private validationSystem!: ValidationCollaborative;
    private spatialSystem!: GestionEspaceSpatial;

    // Services réfactorisés
    private readonly metricsCollector: MetricsCollector;
    private cacheService!: CacheService;
    private optimizationService!: OptimizationService;
    private alertManager!: AlertManager;
    private requestService!: RequestService;

    // Suivi de l'initialisation des composants
    private componentInitStatus = new Map<string, boolean>();
    private componentLoadTimes = new Map<string, number>();

    /**
     * Initialise le système d'orchestration central
     * @param options Options d'initialisation
     */
    constructor(private readonly options: OrchestratorOptions = {}) {
        this.startTime = Date.now();
        this.orchestrationMode = options.initialMode || OrchestrationMode.BALANCED;
        this.metricsCollector = new MetricsCollector('orchestrator');

        // Initialiser tous les composants
        this.initializeComponents().catch(error => {
            this.systemState = SystemState.ERROR;
            this.logger.error('Failed to initialize orchestrator components', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
        });
    }

    /**
     * Initialise tous les composants du système de manière orchestrée
     */
    private async initializeComponents(): Promise<void> {
        try {
            this.logger.info('Initializing SystemeOrchestrateurCentral components...', {
                mode: this.orchestrationMode,
                options: this.options
            });

            // Initialisation du système de monitoring (prioritaire pour pouvoir collecter des métriques)
            this.monitoringSystem = await this.createAndInitMonitoringSystem();
            this.componentInitStatus.set('monitoring', true);
            this.componentLoadTimes.set('monitoring', Date.now() - this.startTime);

            // Initialisation du système d'éthique (prioritaire pour les validations)
            this.ethicsSystem = await this.createAndInitEthicsSystem();
            this.componentInitStatus.set('ethics', true);
            this.componentLoadTimes.set('ethics', Date.now() - this.startTime);

            // Initialisation du noyau IA (composant fondamental)
            this.iaCore = await this.createAndInitIACore();
            this.componentInitStatus.set('iaCore', true);
            this.componentLoadTimes.set('iaCore', Date.now() - this.startTime);

            // Initialisation du système d'expressions
            this.expressionsSystem = await this.createAndInitExpressionsSystem();
            this.componentInitStatus.set('expressions', true);
            this.componentLoadTimes.set('expressions', Date.now() - this.startTime);

            // Initialisation des systèmes auxiliaires
            await this.initializeAuxiliarySystems();

            // Initialisation des services
            await this.initializeServices();

            // Configuration des écouteurs d'événements
            this.setupEventListeners();

            // Changement d'état du système
            this.systemState = SystemState.RUNNING;
            this.logger.info('SystemeOrchestrateurCentral initialized successfully', {
                componentLoadTimes: Object.fromEntries(this.componentLoadTimes),
                initTime: Date.now() - this.startTime
            });
        } catch (error) {
            this.systemState = SystemState.ERROR;
            const componentError = new ComponentInitializationError(
                'SystemeOrchestrateurCentral',
                error instanceof Error ? { message: error.message, stack: error.stack } : error
            );
            this.logger.error('Failed to initialize components', { error: componentError });
            throw componentError;
        }
    }

    /**
     * Crée et initialise le système de contrôle éthique
     */
    private async createAndInitEthicsSystem(): Promise<SystemeControleEthique> {
        try {
            this.logger.debug('Creating and initializing ethics system');

            // Utilisez getInstance() pour respecter le pattern Singleton
            const ethicsSystem = SystemeControleEthique.getInstance({
                strictLevel: this.options.ethicsLevel || 'standard',
                enableContinuousMonitoring: true,
                loggingEnabled: true,
                autoUpdate: true,
                transparencyLevel: 'high'
            });

            await ethicsSystem.initialize();
            this.logger.debug('Ethics system initialized successfully');
            return ethicsSystem;
        } catch (error) {
            const ethicsError = new ComponentInitializationError('SystemeControleEthique', error);
            this.logger.error('Failed to initialize ethics system', { error: ethicsError });
            throw ethicsError;
        }
    }

    /**
     * Crée et initialise le noyau IA
     */
    private async createAndInitIACore(): Promise<IACore> {
        try {
            this.logger.debug('Creating and initializing IA Core');

            // Utilisez getInstance() pour respecter le pattern Singleton
            const iaCore = IACore.getInstance({
                preloadModels: this.options.preloadModels !== false,
                enableLearning: true,
                contextAwareness: true,
                adaptiveComputation: true,
                memoryManagement: 'advanced',
                optimizationLevel: this.getOptimizationLevel()
            });

            await iaCore.initialize();
            this.logger.debug('IA Core initialized successfully');
            return iaCore;
        } catch (error) {
            const iaCoreError = new ComponentInitializationError('IACore', error);
            this.logger.error('Failed to initialize IA Core', { error: iaCoreError });
            throw iaCoreError;
        }
    }

    /**
     * Détermine le niveau d'optimisation basé sur le mode d'orchestration
     */
    private getOptimizationLevel(): string {
        switch (this.orchestrationMode) {
            case OrchestrationMode.HIGH_PERFORMANCE:
                return 'maximum';
            case OrchestrationMode.HIGH_ACCURACY:
                return 'balanced_accuracy';
            case OrchestrationMode.LOW_LATENCY:
                return 'speed';
            case OrchestrationMode.BALANCED:
            default:
                return 'balanced';
        }
    }

    /**
     * Crée et initialise le système d'expressions
     */
    private async createAndInitExpressionsSystem(): Promise<SystemeExpressions> {
        try {
            this.logger.debug('Creating and initializing Expressions System');

            // Utilisez getInstance() pour respecter le pattern Singleton
            const expressionsSystem = SystemeExpressions.getInstance();
            await expressionsSystem.initialize();

            this.logger.debug('Expressions System initialized successfully');
            return expressionsSystem;
        } catch (error) {
            const expressionsError = new ComponentInitializationError('SystemeExpressions', error);
            this.logger.error('Failed to initialize Expressions System', { error: expressionsError });
            throw expressionsError;
        }
    }

    /**
     * Crée et initialise le système de monitoring unifié
     */
    private async createAndInitMonitoringSystem(): Promise<MonitoringUnifie> {
        try {
            this.logger.debug('Creating and initializing Monitoring System');

            // Utilisez getInstance() pour respecter le pattern Singleton
            const monitoringSystem = MonitoringUnifie.getInstance();

            // Démarrer la collecte des métriques
            monitoringSystem.start();
            this.logger.debug('Monitoring System initialized successfully');
            return monitoringSystem;
        } catch (error) {
            const monitoringError = new ComponentInitializationError('MonitoringUnifie', error);
            this.logger.error('Failed to initialize Monitoring System', { error: monitoringError });
            throw monitoringError;
        }
    }

    /**
     * Initialise les systèmes auxiliaires
     */
    private async initializeAuxiliarySystems(): Promise<void> {
        try {
            this.logger.debug('Initializing auxiliary systems');

            // Initialiser le système d'apprentissage si disponible
            await this.initializeLearningSystem();

            // Initialiser le système de gestion des variantes dialectales
            this.dialectSystem = GestionVariantesDiatopiques.getInstance();
            await this.dialectSystem.initialize();
            this.componentInitStatus.set('dialectSystem', true);
            this.componentLoadTimes.set('dialectSystem', Date.now() - this.startTime);

            // Initialiser le système de validation collaborative
            this.validationSystem = ValidationCollaborative.getInstance();
            await this.validationSystem.initialize();
            this.componentInitStatus.set('validationSystem', true);
            this.componentLoadTimes.set('validationSystem', Date.now() - this.startTime);

            // Initialiser le système spatial
            this.spatialSystem = GestionEspaceSpatial.getInstance();
            await this.spatialSystem.initialize();
            this.componentInitStatus.set('spatialSystem', true);
            this.componentLoadTimes.set('spatialSystem', Date.now() - this.startTime);

            this.logger.debug('Auxiliary systems initialized successfully');
        } catch (error) {
            const auxError = new ComponentInitializationError('AuxiliarySystems', error);
            this.logger.error('Failed to initialize auxiliary systems', { error: auxError });
            throw auxError;
        }
    }

    /**
     * Initialise le système d'apprentissage si possible
     */
    private async initializeLearningSystem(): Promise<void> {
        try {
            this.logger.debug('Initializing Learning System');

            // Utiliser getInstance() pour respecter le pattern Singleton
            this.learningSystem = LearningSystem.getInstance({
                enableContinuousLearning: true,
                feedbackThreshold: 0.75,
                adaptationRate: 0.25,
                observationalLearning: true,
                selfImprovement: true
            });

            await this.learningSystem.initialize();
            this.componentInitStatus.set('learningSystem', true);
            this.componentLoadTimes.set('learningSystem', Date.now() - this.startTime);
            this.logger.debug('Learning System initialized successfully');
        } catch (error) {
            this.logger.warn('Learning system not available or failed to initialize', {
                error: error instanceof Error ? error.message : String(error)
            });
            this.componentInitStatus.set('learningSystem', false);
        }
    }

    /**
     * Initialise les services refactorisés
     */
    private async initializeServices(): Promise<void> {
        try {
            this.logger.debug('Initializing services');

            // Initialiser le service de cache
            this.cacheService = new CacheService({
                enabled: this.options.cacheEnabled !== false,
                l1Size: 500,
                l2Size: 5000,
                enablePredictiveCache: this.options.cacheEnabled !== false,
                defaultTTL: 3600000,
                compressionEnabled: true
            }, this.metricsCollector);
            this.componentInitStatus.set('cacheService', true);
            this.componentLoadTimes.set('cacheService', Date.now() - this.startTime);

            // Initialiser le service d'optimisation
            this.optimizationService = new OptimizationService(
                this.metricsCollector,
                this.iaCore,
                this.expressionsSystem,
                this.ethicsSystem,
                this.monitoringSystem,
                this.cacheService
            );
            this.componentInitStatus.set('optimizationService', true);
            this.componentLoadTimes.set('optimizationService', Date.now() - this.startTime);

            // Initialiser le gestionnaire d'alertes
            this.alertManager = new AlertManager(
                this.metricsCollector,
                this.ethicsSystem,
                this.monitoringSystem,
                this.optimizationService,
                {
                    maxAlertHistory: 500,
                    enableAdminNotifications: true,
                    enableAutoUserBlocking: false
                }
            );
            this.componentInitStatus.set('alertManager', true);
            this.componentLoadTimes.set('alertManager', Date.now() - this.startTime);

            // Initialiser le service de requêtes
            this.requestService = new RequestService(
                this.metricsCollector,
                this.monitoringSystem,
                this.ethicsSystem,
                this.iaCore,
                this.expressionsSystem,
                this.dialectSystem,
                this.validationSystem,
                this.spatialSystem,
                this.learningSystem,
                {
                    maxPendingRequests: this.options.maxPendingRequests || 100,
                    maxProcessHistorySize: 1000,
                    enableParallelProcessing: true,
                    maxConcurrentRequests: navigator.hardwareConcurrency || 4
                }
            );
            this.componentInitStatus.set('requestService', true);
            this.componentLoadTimes.set('requestService', Date.now() - this.startTime);

            this.logger.debug('Services initialized successfully');
        } catch (error) {
            const servicesError = new ComponentInitializationError('Services', error);
            this.logger.error('Failed to initialize services', { error: servicesError });
            throw servicesError;
        }
    }

    /**
     * Configure les écouteurs d'événements pour les interactions entre composants
     */
    private setupEventListeners(): void {
        // Écouteurs pour le système de monitoring
        this.monitoringSystem.onAlert((alert) => {
            this.alertManager.handleAlert(alert);
        });

        this.monitoringSystem.onOptimize((event) => {
            this.optimizationService.handleOptimizationEvent(event);
        });

        // Écouteurs pour le gestionnaire d'alertes
        this.alertManager.on('component:failure', (data) => {
            if (this.options.autoRecover) {
                this.attemptComponentRecovery(data.componentId);
            }
        });

        // Écouteurs pour le service de requêtes
        this.requestService.on('request:completed', (data) => {
            this.logger.info('Request completed', {
                requestId: data.requestId,
                duration: data.duration,
                success: data.success
            });
        });

        this.requestService.on('request:failed', (data) => {
            this.logger.warn('Request failed', {
                requestId: data.requestId,
                error: data.error,
                duration: data.duration
            });
        });

        // Écoute des événements d'apprentissage
        if (this.learningSystem) {
            this.learningSystem.on('learning:insight', (insight) => {
                this.logger.info('Learning insight detected', { insight });
                this.propagateInsight(insight);
            });
        }

        this.logger.debug('Event listeners configured successfully');
    }

    /**
     * Propage un insight d'apprentissage aux composants concernés
     * @param insight Insight d'apprentissage
     */
    private propagateInsight(insight: any): void {
        // Propager l'insight aux composants concernés selon son domaine
        if (insight.domain === 'expressions' && this.expressionsSystem.integrateInsight) {
            this.expressionsSystem.integrateInsight(insight);
        } else if (insight.domain === 'ethics' && this.ethicsSystem.integrateInsight) {
            this.ethicsSystem.integrateInsight(insight);
        } else if (insight.domain === 'spatial' && this.spatialSystem.integrateInsight) {
            this.spatialSystem.integrateInsight(insight);
        }
    }

    /**
     * Tente de récupérer un composant défaillant
     * @param componentId Identifiant du composant
     */
    private async attemptComponentRecovery(componentId: string): Promise<void> {
        this.logger.info(`Attempting to recover component`, { componentId });
        this.metricsCollector.recordMetric('component_recovery_attempts', 1);

        try {
            switch (componentId) {
                case 'expressions':
                    this.expressionsSystem = await this.createAndInitExpressionsSystem();
                    this.componentInitStatus.set('expressions', true);
                    break;

                case 'ethics':
                    this.ethicsSystem = await this.createAndInitEthicsSystem();
                    this.componentInitStatus.set('ethics', true);
                    break;

                case 'iaCore':
                    this.iaCore = await this.createAndInitIACore();
                    this.componentInitStatus.set('iaCore', true);
                    break;

                default:
                    this.logger.warn('No recovery strategy for component', { componentId });
                    return;
            }

            this.logger.info('Successfully recovered component', { componentId });
            this.metricsCollector.recordMetric('component_recovery_success', 1);
        } catch (error) {
            this.logger.error('Failed to recover component', {
                componentId,
                error: error instanceof Error ? error.message : String(error)
            });
            this.metricsCollector.recordMetric('component_recovery_failures', 1);
        }
    }

    /**
     * Traite une requête LSF
     * Méthode principale d'entrée pour le traitement des requêtes
     * @param request Requête à traiter
     * @returns Résultat de l'orchestration
     */
    public async processRequest<T>(request: LSFRequest): Promise<OrchestrationResult<T>> {
        // Vérifier l'état du système
        if (this.systemState !== SystemState.RUNNING) {
            throw new OrchestratorError(
                `Système non disponible: ${this.systemState}`,
                'SYSTEM_NOT_AVAILABLE'
            );
        }

        const startTime = Date.now();

        try {
            // Vérifier si le résultat est en cache
            if (!request.noCache) {
                const cachedResult = await this.cacheService.get<T>(request);
                if (cachedResult) {
                    this.logger.info('Cache hit for request', { type: request.type });
                    return this.cacheService.prepareCachedResult(cachedResult, startTime);
                }
            }

            // Ajouter la requête au service de requêtes
            const requestId = this.requestService.addRequest(request);

            // Traiter la requête
            const result = await this.requestService.processRequest<T>(requestId);

            // Mettre en cache le résultat si succès et mise en cache non désactivée
            if (result.success && !request.noCache) {
                await this.cacheService.set(request, result);
            }

            return result;
        } catch (error) {
            this.logger.error('Error processing request', {
                error: error instanceof Error ? error.message : String(error)
            });

            // Si c'est une erreur spécifique de l'orchestrateur, la propager
            if (error instanceof OrchestratorError) {
                return {
                    success: false,
                    data: null as unknown as T,
                    error: error.message,
                    errorCode: error.code,
                    metrics: {
                        executionTime: Date.now() - startTime,
                        cacheUsed: false,
                        componentsUsed: ['orchestrator'],
                        path: []
                    }
                };
            }

            return {
                success: false,
                data: null as unknown as T,
                error: error instanceof Error ? error.message : 'Unknown error during processing',
                errorCode: 'PROCESSING_ERROR',
                metrics: {
                    executionTime: Date.now() - startTime,
                    cacheUsed: false,
                    componentsUsed: ['orchestrator'],
                    path: []
                }
            };
        }
    }

    /**
     * Récupère les variantes dialectales supportées
     * @returns Liste des variantes dialectales supportées
     */
    public getSupportedDialectalVariants(): string[] {
        return [
            "STANDARD",
            "FRANCE_NORD",
            "FRANCE_SUD",
            "BELGIQUE",
            "SUISSE",
            "QUEBEC",
            "FRANCE_EST",
            "FRANCE_OUEST"
        ];
    }

    /**
     * Récupère des informations sur les dialectes supportés
     * @returns Informations sur les dialectes
     */
    public getDialectInfo(): DialectInfo {
        return {
            supportedVariants: this.getSupportedDialectalVariants(),
            defaultVariant: "STANDARD",
            variantsDescription: {
                "STANDARD": "Langue des signes française standard",
                "FRANCE_NORD": "Variante du nord de la France",
                "FRANCE_SUD": "Variante du sud de la France",
                "FRANCE_EST": "Variante de l'est de la France",
                "FRANCE_OUEST": "Variante de l'ouest de la France",
                "BELGIQUE": "Variante belge",
                "SUISSE": "Variante suisse",
                "QUEBEC": "Variante québécoise"
            }
        };
    }

    /**
     * Récupère les métriques de performance
     * @returns Métriques de performance
     */
    public getPerformanceMetrics(): PerformanceStats {
        return {
            system: {
                uptime: Date.now() - this.startTime,
                pendingRequests: this.requestService.getPendingRequestsInfo().length,
                alertsCount: this.alertManager.getActiveAlerts().length,
                processHistoryLength: this.requestService.getProcessHistory().length,
                cpuUsage: this.monitoringSystem.getMetric('system.cpu.usage')?.value || 0,
                memoryUsage: this.monitoringSystem.getMetric('system.memory.usage')?.value || 0,
                requestRate: this.monitoringSystem.getMetric('system.request_rate')?.value || 0
            },
            cache: this.cacheService.getMetrics(),
            components: {
                // Métriques des composants individuels
                orchestrator: this.metricsCollector.getAllMetrics(),
            },
            monitoring: this.monitoringSystem.getMetrics()
        };
    }

    /**
     * Récupère l'état du système
     * @returns État du système
     */
    public getSystemState(): OrchestratorState {
        const componentStates: Record<string, string> = {};

        // État des composants
        this.componentInitStatus.forEach((initialized, component) => {
            componentStates[component] = initialized ? 'active' : 'inactive';
        });

        const cpuValue = this.monitoringSystem.getMetric('system.cpu.usage')?.value || 0;
        const memoryValue = this.monitoringSystem.getMetric('system.memory.usage')?.value || 0;
        const networkValue = this.monitoringSystem.getMetric('system.network.usage')?.value || 0;

        return {
            status: this.systemState,
            uptime: Date.now() - this.startTime,
            components: componentStates,
            pendingRequests: this.requestService.getPendingRequestsInfo().length,
            alerts: this.alertManager.getActiveAlerts().length,
            systemLoad: {
                cpu: typeof cpuValue === 'number' ? cpuValue : 0,
                memory: typeof memoryValue === 'number' ? memoryValue : 0,
                network: typeof networkValue === 'number' ? networkValue : 0
            }
        };
    }

    /**
     * Change le mode d'orchestration
     * @param mode Nouveau mode d'orchestration
     * @returns Succès de l'opération
     */
    public changeOrchestrationMode(mode: OrchestrationMode): boolean {
        try {
            this.logger.info('Changing orchestration mode', {
                oldMode: this.orchestrationMode,
                newMode: mode
            });

            this.orchestrationMode = mode;

            // Ajuster les composants selon le nouveau mode
            this.optimizationService.adjustForOrchestrationMode(mode);

            // Enregistrer le changement
            this.metricsCollector.recordMetric('mode_changes', 1);

            return true;
        } catch (error) {
            this.logger.error('Error changing orchestration mode', {
                error: error instanceof Error ? error.message : String(error),
                mode
            });
            return false;
        }
    }

    /**
     * Enregistre un écouteur d'événements
     * @param event Nom de l'événement
     * @param listener Fonction d'écoute
     */
    public on(event: string, listener: (...args: unknown[]) => void): this {
        this.eventEmitter.on(event, listener);
        return this;
    }

    /**
     * Arrête proprement le système d'orchestration
     */
    public async shutdown(): Promise<void> {
        try {
            this.logger.info('Shutting down SystemeOrchestrateurCentral');
            this.systemState = SystemState.STOPPING;

            // Arrêter les services
            this.requestService.shutdown();

            // Arrêter le monitoring
            this.monitoringSystem.stop();

            // Arrêter les composants
            if (this.ethicsSystem.shutdown) await this.ethicsSystem.shutdown();
            if (this.iaCore.shutdown) await this.iaCore.shutdown();
            if (this.expressionsSystem.shutdown) await this.expressionsSystem.shutdown();
            if (this.validationSystem.shutdown) await this.validationSystem.shutdown();

            // Enregistrer l'arrêt du système
            this.systemState = SystemState.STOPPED;
            this.logger.info('SystemeOrchestrateurCentral stopped successfully');
        } catch (error) {
            this.systemState = SystemState.ERROR;
            this.logger.error('Error during system shutdown', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw new OrchestratorError(
                'Failed to shutdown orchestrator properly',
                'SHUTDOWN_ERROR',
                'orchestrator',
                error
            );
        }
    }
}