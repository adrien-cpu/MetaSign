/**
 * src/ai/api/integration/evaluators/status.evaluator.ts
 * Évaluateur spécialisé pour l'évaluation des statuts système
 */
import { 
  SystemConnections, 
  SystemInterfaces, 
  SystemSynchronization, 
  CoordinationStatus,
  Issue
} from '@api/common/types';
import {
  SystemMonitoring,
  DataManagement,
  CommunicationChannels,
  SystemCoordination,
  IntegrationStatus
} from '@api/common/types/system-integration.types';
import { LogService } from '@api/common/monitoring/LogService';

export class StatusEvaluator {
  private readonly logger = new LogService('StatusEvaluator');

  /**
   * Évalue le statut de coordination entre les composants
   * @param connections Connexions système
   * @param interfaces Interfaces système
   * @param synchronization Synchronisation système
   * @returns Promesse du statut de coordination
   */
  public async evaluateCoordinationStatus(
    connections: SystemConnections,
    interfaces: SystemInterfaces,
    synchronization: SystemSynchronization
  ): Promise<CoordinationStatus> {
    this.logger.debug('Evaluating coordination status');
    
    // Vérifier l'état des composants de coordination
    const connectionActive = connections.status.active;
    const interfaceActive = interfaces.control.status.state === 'ACTIVE';
    const syncActive = synchronization.state.mode === 'ACTIVE';
    
    const allActive = connectionActive && interfaceActive && syncActive;

    // Définir les problèmes si nécessaire
    const issues: Issue[] = allActive ? [] : [
      {
        id: 'COORD-001',
        description: 'Some coordination components are not active',
        severity: 'MEDIUM',
        timestamp: new Date(),
        type: 'COORDINATION',
        status: 'OPEN'
      }
    ];

    return {
      active: allActive,
      health: allActive ? 'HEALTHY' : 'WARNING',
      issues
    };
  }
  
  /**
   * Évalue le statut global de l'intégration
   * @param coordination Coordination système
   * @param communication Communication système
   * @param dataManagement Gestion des données
   * @param monitoring Monitoring système
   * @returns Promesse du statut de l'intégration
   */
  public async evaluateIntegrationStatus(
    coordination: SystemCoordination,
    communication: CommunicationChannels,
    dataManagement: DataManagement,
    monitoring: SystemMonitoring
  ): Promise<IntegrationStatus> {
    this.logger.debug('Evaluating integration status');
    
    // Vérifier si tous les composants sont dans un état valide
    const coordinationValid = coordination.status.active;
    const communicationValid = communication.status.operational;
    const dataManagementValid = dataManagement.status.efficiency > 0.8;
    const monitoringValid = monitoring.status.health === 'HEALTHY';
    
    const allValid = coordinationValid && communicationValid && dataManagementValid && monitoringValid;

    // Générer des messages basés sur l'évaluation
    const messages = allValid
      ? ['Integration completed successfully']
      : ['Some components have issues', 'Check detailed component status'];

    return {
      success: allValid,
      timestamp: new Date(),
      messages
    };
  }
}