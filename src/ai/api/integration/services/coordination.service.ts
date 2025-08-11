/**
 * src/ai/api/integration/services/coordination.service.ts
 * Service spécialisé pour la gestion de la coordination système
 */
import {
    SystemCoordination,
    SystemConnections,
    SystemInterfaces,
    SystemSynchronization,
    CoordinationStatus
} from '@api/common/types';
import {
    IntegrationContext,
    DetailedProgressTracker,
    MultimodalSupportSystem
} from '@api/common/types/system-integration.types';
import { ConnectionService } from './connection.service';
import { InterfaceService } from './interface.service';
import { SynchronizationService } from './synchronization.service';
import { StatusEvaluator } from '../evaluators/status.evaluator';
import { LogService } from '@api/common/monitoring/LogService';

export class CoordinationService {
    private readonly logger = new LogService('CoordinationService');
    private readonly connectionService: ConnectionService;
    private readonly interfaceService: InterfaceService;
    private readonly synchronizationService: SynchronizationService;
    private readonly statusEvaluator: StatusEvaluator;

    /**
     * Crée une nouvelle instance du service de coordination
     */
    constructor() {
        this.connectionService = new ConnectionService();
        this.interfaceService = new InterfaceService();
        this.synchronizationService = new SynchronizationService();
        this.statusEvaluator = new StatusEvaluator();
    }

    /**
     * Initialise le système de coordination entre les composants
     * @param trackingSystem Système de suivi de progression
     * @param multimodalSystem Système de support multimodal
     * @param context Contexte d'intégration
     * @returns Promesse du système de coordination configuré
     */
    public async initializeSystemCoordination(
        trackingSystem: DetailedProgressTracker,
        multimodalSystem: MultimodalSupportSystem,
        context: IntegrationContext
    ): Promise<SystemCoordination> {
        this.logger.info('Initializing system coordination', {
            context: context.environment,
            trackerId: trackingSystem.id
        });

        try {
            // Établir les connexions système
            const connections = await this.connectionService.establishSystemConnections(
                trackingSystem,
                multimodalSystem
            );

            // Configurer les interfaces
            const interfaces = await this.interfaceService.configureInterfaces(
                connections,
                context
            );

            // Initialiser la synchronisation
            const synchronization = await this.synchronizationService.initializeSynchronization(
                interfaces,
                context
            );

            // Évaluer le statut de coordination
            const status = await this.statusEvaluator.evaluateCoordinationStatus(
                connections,
                interfaces,
                synchronization
            );

            return {
                connections,
                interfaces,
                synchronization,
                status
            };
        } catch (error) {
            this.logger.error('Failed to initialize system coordination', { error });
            throw error;
        }
    }
}