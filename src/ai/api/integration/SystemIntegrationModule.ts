/**
 * src/ai/api/integration/SystemIntegrationModule.ts
 * Module d'intégration système refactorisé
 * Responsable de la coordination entre différents composants du système LSF
 */
import {
    NotificationConfig,
    ResourceLimits,
    PerformanceRequirements
} from '@api/common/types';
import {
    DetailedProgressTracker,
    MultimodalSupportSystem,
    IntegrationContext,
    IntegrationResult,
    SystemNotification
} from '@api/common/types/system-integration.types';
import { LogService } from '@api/common/monitoring/LogService';
import { CoordinationService } from './services/coordination.service';
import { CommunicationService } from './services/communication.service';
import { DataManagementService } from './services/data-management.service';
import { MonitoringService } from './services/monitoring.service';
import { NotificationService } from './services/notification.service';
import { CleanupService } from './services/cleanup.service';
import { StatusEvaluator } from './evaluators/status.evaluator';

/**
 * Module d'intégration système refactorisé qui respecte les bonnes pratiques du projet
 * et optimise les performances tout en conservant les fonctionnalités existantes.
 */
export class SystemIntegrationModule {
    /**
     * Paramètres d'intégration par défaut utilisés lors des opérations
     * @private
     */
    private readonly INTEGRATION_PARAMETERS = {
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 5000,
        validationLevel: 'STRICT'
    };

    private readonly logger = new LogService('SystemIntegrationModule');
    private readonly coordinationService: CoordinationService;
    private readonly communicationService: CommunicationService;
    private readonly dataManagementService: DataManagementService;
    private readonly monitoringService: MonitoringService;
    private readonly notificationService: NotificationService;
    private readonly cleanupService: CleanupService;
    private readonly statusEvaluator: StatusEvaluator;

    /**
     * Crée une nouvelle instance du module d'intégration système
     * @param notificationConfig Configuration des notifications système
     * @param resourceLimits Limites des ressources système
     * @param performanceRequirements Exigences de performance du système
     */
    constructor(
        private readonly notificationConfig: NotificationConfig,
        private readonly resourceLimits: ResourceLimits,
        private readonly performanceRequirements: PerformanceRequirements
    ) {
        this.logger.debug('Initializing SystemIntegrationModule');
        this.coordinationService = new CoordinationService();
        this.communicationService = new CommunicationService();
        this.dataManagementService = new DataManagementService();
        this.monitoringService = new MonitoringService();
        this.notificationService = new NotificationService(notificationConfig);
        this.cleanupService = new CleanupService();
        this.statusEvaluator = new StatusEvaluator();
    }

    /**
     * Intègre les composants système spécifiés dans un environnement cohérent
     * @param trackingSystem Système de suivi de progression
     * @param multimodalSystem Système de support multimodal
     * @param context Contexte d'intégration
     * @returns Résultat de l'intégration contenant tous les composants configurés
     * @throws Error si l'intégration échoue
     */
    public async integrateComponents(
        trackingSystem: DetailedProgressTracker,
        multimodalSystem: MultimodalSupportSystem,
        context: IntegrationContext
    ): Promise<IntegrationResult> {
        try {
            this.logger.info('Starting component integration', {
                environment: context.environment,
                trackerId: trackingSystem.id,
                multimodalId: multimodalSystem.id
            });

            // Initialiser la coordination
            const coordination = await this.coordinationService.initializeSystemCoordination(
                trackingSystem,
                multimodalSystem,
                context
            );

            // Établir les canaux de communication
            const communication = await this.communicationService.establishCommunicationChannels(
                coordination,
                context
            );

            // Configurer la gestion des données
            const dataManagement = await this.dataManagementService.setupDataManagement(
                coordination,
                context
            );

            // Activer le monitoring
            const monitoring = await this.monitoringService.activateSystemMonitoring(
                coordination,
                communication,
                dataManagement
            );

            // Évaluer le statut global
            const status = await this.statusEvaluator.evaluateIntegrationStatus(
                coordination,
                communication,
                dataManagement,
                monitoring
            );

            this.logger.info('Component integration completed', {
                success: status.success
            });

            return {
                coordination,
                communication,
                dataManagement,
                monitoring,
                status
            };
        } catch (error) {
            const typedError = error instanceof Error ? error : new Error(String(error));
            this.logger.error('Integration failed', {
                error: typedError.message,
                stack: typedError.stack
            });

            await this.handleIntegrationError(typedError);
            throw typedError;
        }
    }

    /**
     * Gère les erreurs d'intégration
     * @param error Erreur survenue pendant l'intégration
     * @returns Promise résolue après traitement de l'erreur
     * @private
     */
    private async handleIntegrationError(error: Error): Promise<void> {
        this.logger.error('Handling integration error', { message: error.message });

        // Notifier les administrateurs
        await this.notificationService.notifyAdministrators({
            type: 'ERROR',
            message: `Integration error: ${error.message}`,
            timestamp: new Date(),
            severity: 'HIGH'
        });

        // Nettoyer les ressources
        await this.cleanupService.cleanup();
    }
}