/**
 * @file: src/ai/coordinators/services/RequestService.ts
 * 
 * Service de gestion des requêtes pour l'orchestrateur
 * Gère les requêtes en attente et leur traitement
 */

import { EventEmitter } from 'events';
import { Logger } from '@ai/utils/Logger';
import { MetricsCollector } from '@ai/coordinators/services/MetricsCollector';
import { LSFRequest, OrchestrationResult } from '@ai/coordinators/types/orchestrator.types';
import { RequestProcessingError } from '@ai/coordinators/errors/orchestrator.errors';
import { RequestHandlerFactory } from '@ai/coordinators/handlers/RequestHandlers';
import { MonitoringUnifie } from '@ai/monitoring/MonitoringUnifie';
import { SystemeControleEthique } from '@ai/ethics/core/SystemeControleEthique';
import { IACore } from '@ai/base/IACore';
import { SystemeExpressions } from '@ai/systems/SystemeExpressions';
import { GestionVariantesDiatopiques } from '@ai/cultural/GestionVariantesDiatopiques';
import { ValidationCollaborative } from '@ai/validation/ValidationCollaborative';
import { GestionEspaceSpatial } from '@ai/spatial/GestionEspaceSpatial';
import { LearningSystem } from '@ai/learning/LearningSystem';

/**
 * Options pour le service de requêtes
 */
export interface RequestServiceOptions {
    /** Nombre maximal de requêtes en attente */
    maxPendingRequests?: number;
    /** Taille maximale de l'historique de traitement */
    maxProcessHistorySize?: number;
    /** Activer le traitement parallèle */
    enableParallelProcessing?: boolean;
    /** Nombre maximal de requêtes traitées en parallèle */
    maxConcurrentRequests?: number;
}

/**
 * Service de gestion des requêtes
 * Centralise la gestion des requêtes en attente et leur traitement
 */
export class RequestService extends EventEmitter {
    private readonly logger = Logger.getInstance('RequestService');
    private readonly pendingRequests = new Map<string, LSFRequest>();
    private readonly processHistory: string[] = [];
    private readonly options: Required<RequestServiceOptions>;
    private processingCount = 0;

    /**
     * Crée une nouvelle instance du service de requêtes
     */
    constructor(
        private readonly metrics: MetricsCollector,
        private readonly monitoringSystem: MonitoringUnifie,
        private readonly ethicsSystem: SystemeControleEthique,
        private readonly iaCore: IACore,
        private readonly expressionsSystem: SystemeExpressions,
        private readonly dialectSystem: GestionVariantesDiatopiques,
        private readonly validationSystem: ValidationCollaborative,
        private readonly spatialSystem: GestionEspaceSpatial,
        private readonly learningSystem: LearningSystem | null,
        options?: RequestServiceOptions
    ) {
        super();

        // Définir les options par défaut
        this.options = {
            maxPendingRequests: 100,
            maxProcessHistorySize: 1000,
            enableParallelProcessing: true,
            maxConcurrentRequests: navigator.hardwareConcurrency || 4,
            ...options
        };

        this.logger.debug('RequestService initialized', { options: this.options });
    }

    /**
     * Ajoute une requête à la liste des requêtes en attente
     * @param request Requête à ajouter
     * @returns Identifiant de la requête
     */
    public addRequest(request: LSFRequest): string {
        // Vérifier si le nombre maximal de requêtes en attente est atteint
        if (this.pendingRequests.size >= this.options.maxPendingRequests) {
            this.logger.warn('Maximum pending requests reached', {
                pendingCount: this.pendingRequests.size,
                maxPending: this.options.maxPendingRequests
            });
            throw new RequestProcessingError(
                request.sessionId,
                request.type.toString(),
                { message: 'Maximum pending requests reached' }
            );
        }

        const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

        // Ajouter la requête
        this.pendingRequests.set(requestId, request);

        // Ajouter à l'historique de traitement
        this.addToProcessHistory(request);

        // Mettre à jour les métriques
        this.monitoringSystem.recordMetric('pending_requests', this.pendingRequests.size);
        this.metrics.recordMetric('request_received', 1);
        this.metrics.recordMetric(`request_type_${request.type}`, 1);

        // Émettre un événement
        this.emit('request:added', {
            requestId,
            request,
            timestamp: Date.now()
        });

        this.logger.info('Request added to pending queue', {
            requestId,
            type: request.type,
            userId: request.userId
        });

        return requestId;
    }

    /**
     * Traite une requête spécifique
     * @param requestId Identifiant de la requête
     * @returns Résultat de l'orchestration
     */
    public async processRequest<T>(requestId: string): Promise<OrchestrationResult<T>> {
        const request = this.pendingRequests.get(requestId);

        if (!request) {
            throw new RequestProcessingError(
                'unknown',
                'unknown',
                { message: `Request not found: ${requestId}` }
            );
        }

        const startTime = Date.now();

        try {
            this.logger.info('Processing request', {
                requestId,
                type: request.type,
                priority: request.priority,
                userId: request.userId
            });

            // Incrémenter le compteur de traitement
            this.processingCount++;
            this.metrics.recordMetric('concurrent_processing', this.processingCount);

            // Validation éthique
            const ethicsResult = await this.validateEthics(request);

            if (!ethicsResult.isValid) {
                this.logger.warn('Ethics validation failed for request', {
                    requestId,
                    reason: ethicsResult.reason
                });

                this.metrics.recordMetric('ethics_validation_failures', 1);

                throw new RequestProcessingError(
                    request.sessionId,
                    request.type.toString(),
                    { message: ethicsResult.reason || 'Ethics validation failed' }
                );
            }

            // Créer le gestionnaire approprié pour cette requête
            const handler = RequestHandlerFactory.createHandler<T>(
                request,
                this.iaCore,
                this.ethicsSystem,
                this.expressionsSystem,
                this.dialectSystem,
                this.validationSystem,
                this.spatialSystem,
                this.learningSystem,
                this.metrics
            );

            // Exécuter le traitement
            const result = await handler.process(request);

            // Mettre à jour les métriques
            this.metrics.recordMetric('request_success', 1);
            this.metrics.recordMetric('request_processing_time', Date.now() - startTime);

            // Émettre un événement de succès
            this.emit('request:completed', {
                requestId,
                success: true,
                duration: Date.now() - startTime,
                timestamp: Date.now()
            });

            return result;
        } catch (error) {
            // Mettre à jour les métriques
            this.metrics.recordMetric('request_failures', 1);

            // Émettre un événement d'échec
            this.emit('request:failed', {
                requestId,
                error: error instanceof Error ? error.message : String(error),
                duration: Date.now() - startTime,
                timestamp: Date.now()
            });

            throw error;
        } finally {
            // Supprimer la requête des requêtes en attente
            this.pendingRequests.delete(requestId);

            // Mettre à jour les métriques
            this.monitoringSystem.recordMetric('pending_requests', this.pendingRequests.size);

            // Décrémenter le compteur de traitement
            this.processingCount--;
            this.metrics.recordMetric('concurrent_processing', this.processingCount);
        }
    }

    /**
     * Valide la conformité éthique d'une requête
     * @param request Requête à valider
     * @returns Résultat de la validation
     */
    private async validateEthics(request: LSFRequest): Promise<{ isValid: boolean; reason?: string }> {
        try {
            const startTime = Date.now();

            // Préparer la requête de validation éthique
            const ethicsRequest = {
                type: request.type,
                data: request.data,
                user: { id: request.userId },
                context: {
                    timestamp: request.timestamp,
                    sessionId: request.sessionId
                }
            };

            // Effectuer la validation
            const ethicsResult = await this.ethicsSystem.validateRequest(ethicsRequest);

            // Enregistrer les métriques
            this.metrics.recordMetric('ethics_validation_time', Date.now() - startTime);

            return {
                isValid: ethicsResult.valid,
                reason: ethicsResult.reason
            };
        } catch (error) {
            this.logger.error('Error during ethics validation', {
                error: error instanceof Error ? error.message : String(error)
            });

            // Enregistrer l'erreur
            this.metrics.recordMetric('ethics_validation_errors', 1);

            return {
                isValid: false,
                reason: 'Ethics validation system error'
            };
        }
    }

    /**
     * Récupère les informations sur toutes les requêtes en attente
     * @returns Informations sur les requêtes
     */
    public getPendingRequestsInfo(): Record<string, unknown>[] {
        const requests: Record<string, unknown>[] = [];

        this.pendingRequests.forEach((request, id) => {
            requests.push({
                id,
                type: request.type,
                modality: request.modality,
                userId: request.userId,
                timestamp: request.timestamp,
                age: Date.now() - request.timestamp,
                priority: request.priority
            });
        });

        return requests;
    }

    /**
     * Récupère l'historique de traitement des requêtes
     * @param limit Nombre maximal d'entrées à récupérer
     * @returns Historique de traitement
     */
    public getProcessHistory(limit: number = 100): string[] {
        return this.processHistory.slice(-Math.min(limit, this.processHistory.length));
    }

    /**
     * Ajoute une entrée à l'historique de traitement
     * @param request Requête concernée
     */
    private addToProcessHistory(request: LSFRequest): void {
        const historyEntry = `${new Date(request.timestamp).toISOString()} - ${request.type} - ${request.userId}`;
        this.processHistory.push(historyEntry);

        // Limiter la taille de l'historique
        if (this.processHistory.length > this.options.maxProcessHistorySize) {
            this.processHistory.shift();
        }
    }

    /**
     * Arrête le service et annule toutes les requêtes en attente
     */
    public shutdown(): void {
        this.logger.info('Shutting down request service, cancelling pending requests', {
            pendingCount: this.pendingRequests.size
        });

        // Annuler toutes les requêtes en attente
        this.pendingRequests.clear();

        // Émettre un événement
        this.emit('service:shutdown', {
            timestamp: Date.now()
        });
    }
}