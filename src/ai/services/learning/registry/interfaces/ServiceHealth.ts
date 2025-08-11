/**
 * @file src/ai/services/learning/registry/interfaces/ServiceHealth.ts
 * @description Interfaces pour la santé des services
 */

import { RegistryMetrics, ServiceStatus } from './types';

/**
 * @interface ServiceHealth
 * @description État de santé d'un service
 */
export interface ServiceHealth {
    /** État de santé général */
    healthy: boolean;
    /** Message descriptif */
    message: string;
    /** Métriques associées */
    metrics?: Record<string, unknown>;
    /** Horodatage de la vérification */
    timestamp: Date;
}

/**
 * @interface ServiceStatusSummary
 * @description Information résumée sur l'état d'un service
 */
export interface ServiceStatusSummary {
    name: string;
    version: string;
    type: string;
    status: ServiceStatus;
    dependencies: string[];
    registeredAt: Date;
}

/**
 * @interface RegistryHealthStatus
 * @description État de santé global du registre
 */
export interface RegistryHealthStatus {
    timestamp: Date;
    servicesCount: number;
    servicesByStatus: Record<ServiceStatus, number>;
    services: Record<string, ServiceStatusSummary>;
    metrics: RegistryMetrics;
}