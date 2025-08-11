/**
 * src/ai/api/integration/services/cleanup.service.ts
 * Service spécialisé pour le nettoyage des ressources
 */
import { LogService } from '@api/common/monitoring/LogService';
import { ConnectionService } from './connection.service';
import { DataManagementService } from './data-management.service';
import { MonitoringService } from './monitoring.service';

export class CleanupService {
    private readonly logger = new LogService('CleanupService');
    private readonly connectionService: ConnectionService;
    private readonly dataManagementService: DataManagementService;
    private readonly monitoringService: MonitoringService;

    /**
     * Crée une nouvelle instance du service de nettoyage
     */
    constructor() {
        this.connectionService = new ConnectionService();
        this.dataManagementService = new DataManagementService();
        this.monitoringService = new MonitoringService();
    }

    /**
     * Nettoie les ressources après une erreur d'intégration
     * @returns Promesse résolue après le nettoyage
     */
    public async cleanup(): Promise<void> {
        this.logger.info('Cleaning up resources');

        try {
            // Exécuter les nettoyages en parallèle pour optimiser les performances
            await Promise.all([
                this.connectionService.cleanupConnections(),
                this.dataManagementService.cleanupStorage(),
                this.monitoringService.cleanupMonitoring()
            ]);

            this.logger.info('Cleanup completed successfully');
        } catch (error) {
            this.logger.error('Error during cleanup', { error });
        }
    }
}