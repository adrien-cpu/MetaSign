/**
 * src/ai/api/integration/types/utility.types.ts
 * Types utilitaires pour le module d'intégration
 */
import {
    SystemCoordination,
    CommunicationChannels,
    DataManagement,
    SystemConnections,
    SystemInterfaces,
    SystemSynchronization,
    DataConnection,
    EventConnection,
    ControlConnection
} from '@api/common/types';
import { SystemMonitoring } from '@api/common/types/system-integration.types';

/**
 * Type utilitaire pour la méthode evaluateIntegrationStatus
 */
export type IntegrationComponent = SystemCoordination | CommunicationChannels | DataManagement | SystemMonitoring;

/**
 * Type utilitaire pour la méthode evaluateCoordinationStatus
 */
export type CoordinationComponent = SystemConnections | SystemInterfaces | SystemSynchronization;

/**
 * Type utilitaire pour la méthode evaluateConnectionStatus
 */
export type ConnectionComponent = DataConnection[] | EventConnection[] | ControlConnection[];