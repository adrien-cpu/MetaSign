// src/ai/coordinators/bridges/ExpressionsSystemBridge.ts

import { BaseAI } from '@ai/base/BaseAI';
import { SystemeExpressions } from '@ai/systems/SystemeExpressions';
import { LogService } from '@ai/api/common/monitoring/LogService';
import {
    SystemState,
    RequestType,
    ComponentType,
    TaskPriority,
    GestureFrame,
    FacialExpressionFrame,
    ExpressionData
} from '../types';
import {
    GestureSequence,
    FacialExpressions,
    TemporalMarkers
} from '@ai-types/base';

/**
 * Bridge pour adapter le SystemeExpressions à l'interface BaseAI
 * Implémente le pattern Adapter
 */
export class ExpressionsSystemBridge extends BaseAI {
    private expressionSystem: SystemeExpressions;
    private logger: LogService;

    // Propriétés requises
    public state: SystemState = SystemState.INITIALIZING;
    public stats: Record<string, number> = {
        requestsProcessed: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageProcessingTimeMs: 0,
        lastProcessingTimeMs: 0,
        cacheHitRate: 0
    };

    /**
     * Crée une nouvelle instance de pont pour le système d'expressions
     * @param expressionSystem Instance du système d'expressions
     */
    constructor(expressionSystem: SystemeExpressions) {
        super();
        this.expressionSystem = expressionSystem;
        this.logger = new LogService('ExpressionsSystemBridge');
    }

    /**
     * Initialise le bridge
     */
    public async initialize(): Promise<void> {
        this.logger.info("Initializing ExpressionsSystemBridge");
        this.state = SystemState.INITIALIZING;
        await this.internalInitialize();
        this.state = SystemState.READY;
        this.logger.info("ExpressionsSystemBridge initialized");
    }

    /**
     * Initialisation interne du bridge
     */
    public async internalInitialize(): Promise<void> {
        this.logger.debug("Internal initializing ExpressionsSystemBridge");
        // Initialisation interne, si nécessaire
    }

    /**
     * Fermeture interne du bridge
     */
    public async internalShutdown(): Promise<void> {
        this.logger.debug("Internal shutting down ExpressionsSystemBridge");
        // Nettoyage des ressources internes
    }

    /**
     * Ferme le bridge
     */
    public async shutdown(): Promise<void> {
        this.logger.info("Shutting down ExpressionsSystemBridge");
        this.state = SystemState.SHUTDOWN;
        await this.internalShutdown();
        this.logger.info("ExpressionsSystemBridge shut down");
    }

    /**
     * Traite une requête en la relayant au système d'expressions
     * @param requestId Identifiant de la requête
     * @param requestType Type de requête
     * @param data Données de la requête
     * @returns Résultat du traitement
     */
    public async processRequest<T>(
        requestId: string,
        requestType: RequestType,
        data: unknown
    ): Promise<T> {
        // Vérifier si le type de requête est géré par le système d'expressions
        if (!this.canHandleRequestType(requestType)) {
            throw new Error(`ExpressionsSystemBridge ne peut pas traiter les requêtes de type: ${requestType}`);
        }

        // Mesurer les performances
        const startTime = performance.now();

        try {
            // Relayer la requête au système d'expressions
            const result = await this.expressionSystem.processRequest<T>(requestId, requestType, data);

            // Mettre à jour les statistiques
            this.stats.requestsProcessed++;
            this.stats.successfulRequests++;

            const endTime = performance.now();
            const processingTime = endTime - startTime;

            this.stats.lastProcessingTimeMs = processingTime;
            this.stats.averageProcessingTimeMs =
                ((this.stats.averageProcessingTimeMs * (this.stats.successfulRequests - 1)) + processingTime) /
                this.stats.successfulRequests;

            return result;
        } catch (error) {
            // Mettre à jour les statistiques d'erreur
            this.stats.requestsProcessed++;
            this.stats.failedRequests++;

            // Enregistrer l'erreur
            this.logger.error(`Erreur lors du traitement de la requête ${requestId}`, {
                requestId,
                requestType,
                error: error instanceof Error ? error.message : String(error)
            });

            // Propager l'erreur
            throw error;
        }
    }

    /**
     * Vérifie si le type de requête est pris en charge
     * @param requestType Type de requête à vérifier
     * @returns true si le type est pris en charge
     */
    public canHandleRequestType(requestType: RequestType): boolean {
        const supportedTypes = [
            RequestType.GENERATE_EXPRESSION,
            RequestType.ANALYZE_EXPRESSION,
            RequestType.OPTIMIZE_EXPRESSION,
            RequestType.GESTURE_GENERATION,
            RequestType.FACIAL_SYNC
        ];

        return supportedTypes.includes(requestType);
    }

    /**
     * Obtient l'identifiant du composant
     * @returns Identifiant du composant
     */
    public getComponentId(): string {
        return 'expressions_system_bridge';
    }

    /**
     * Obtient le nom du composant
     * @returns Nom du composant
     */
    public getComponentName(): string {
        return 'Expressions System Bridge';
    }

    /**
     * Obtient les capacités du composant
     * @returns Liste des capacités
     */
    public getCapabilities(): string[] {
        return [
            'generate_expression',
            'analyze_expression',
            'optimize_expression',
            'gesture_generation',
            'facial_sync'
        ];
    }

    /**
     * Obtient les métriques de performance
     * @returns Métriques de performance
     */
    public getPerformanceMetrics(): Record<string, number> {
        return {
            processingTime: this.stats.averageProcessingTimeMs,
            requestsProcessed: this.stats.requestsProcessed,
            errors: this.stats.failedRequests,
            successRate: this.stats.requestsProcessed > 0
                ? (this.stats.successfulRequests / this.stats.requestsProcessed) * 100
                : 100,
            cpuUsage: 0, // À implémenter avec des métriques réelles
            memoryUsage: 0 // À implémenter avec des métriques réelles
        };
    }

    /**
     * Obtient l'état actuel du composant
     * @returns État du composant
     */
    public async getState(): Promise<Record<string, unknown>> {
        return {
            componentId: this.getComponentId(),
            componentName: this.getComponentName(),
            capabilities: this.getCapabilities(),
            state: this.state,
            stats: { ...this.stats },
            performanceMetrics: this.getPerformanceMetrics()
        };
    }

    /**
     * Génère des expressions à partir d'un texte
     * @param text Texte à analyser
     * @param locale Code de langue
     * @returns Données d'expression générées
     */
    public async generateExpressions(text: string, locale: string): Promise<ExpressionData> {
        const requestId = `gen_expr_${Date.now()}`;

        try {
            return await this.processRequest<ExpressionData>(
                requestId,
                RequestType.GENERATE_EXPRESSION,
                { text, locale }
            );
        } catch (error) {
            this.logger.error(`Erreur lors de la génération d'expressions pour: ${text}`, {
                text,
                locale,
                error: error instanceof Error ? error.message : String(error)
            });

            // Retourner un objet expression vide mais valide
            return {
                facialExpressions: [],
                gestures: [],
                spatialReferences: [],
                temporalMarkers: [],
                nonManualElements: []
            };
        }
    }

    /**
     * Traite une séquence de gestes LSF
     * @param gestureSequence Séquence de gestes à traiter
     * @param optimize Indique si la séquence doit être optimisée
     * @returns Séquence de gestes traitée
     */
    public async processGestureSequence(
        gestureSequence: GestureSequence,
        optimize: boolean = true
    ): Promise<GestureSequence> {
        const requestId = `proc_gest_${Date.now()}`;

        try {
            return await this.processRequest<GestureSequence>(
                requestId,
                RequestType.GESTURE_GENERATION,
                { sequence: gestureSequence, optimize }
            );
        } catch (error) {
            this.logger.error(`Erreur lors du traitement de la séquence de gestes: ${gestureSequence.id}`, {
                sequenceId: gestureSequence.id,
                error: error instanceof Error ? error.message : String(error)
            });

            // Retourner la séquence originale
            return gestureSequence;
        }
    }

    /**
     * Synchronise des expressions faciales avec une séquence de gestes
     * @param facialExpressions Expressions faciales à synchroniser
     * @param gestureSequenceId ID de la séquence de gestes
     * @param temporalMarkers Marqueurs temporels pour la synchronisation
     * @returns Expressions faciales synchronisées
     */
    public async syncFacialExpressions(
        facialExpressions: FacialExpressions,
        gestureSequenceId: string,
        temporalMarkers: TemporalMarkers
    ): Promise<FacialExpressions> {
        const requestId = `sync_facial_${Date.now()}`;

        try {
            return await this.processRequest<FacialExpressions>(
                requestId,
                RequestType.FACIAL_SYNC,
                { expressions: facialExpressions, gestureSequenceId, markers: temporalMarkers }
            );
        } catch (error) {
            this.logger.error(`Erreur lors de la synchronisation des expressions faciales`, {
                expressionsId: facialExpressions.id,
                gestureSequenceId,
                error: error instanceof Error ? error.message : String(error)
            });

            // Retourner les expressions originales
            return facialExpressions;
        }
    }
}