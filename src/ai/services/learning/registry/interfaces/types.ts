/**
 * @file src/ai/services/learning/registry/interfaces/types.ts
 * @description Types partagés pour le registre de services d'apprentissage
 */

/**
 * État possible d'un service dans le registre
 */
export type ServiceStatus = 'initializing' | 'ready' | 'degraded' | 'error' | 'shutdown';

/**
 * Type d'événement du registre de services
 */
export type RegistryEventType =
    | 'learning.service.registered'
    | 'learning.service.updated'
    | 'learning.service.unregistered'
    | 'learning.service.status.changed'
    | 'learning.service.degraded'
    | 'learning.service.recovered'
    | 'learning.service.metadata.updated'
    | 'learning.service.reconnect.attempt'
    | 'learning.service.external.status'
    | 'learning.service.force.unregister';

/**
 * Données d'événement de base du registre
 */
export interface BaseRegistryEventData {
    serviceId: string;
    [key: string]: unknown;
}

/**
 * Structure des métriques du registre
 */
export interface RegistryMetrics {
    [key: string]: number;
    registrations: number;
    unregistrations: number;
    failedRegistrations: number;
    statusChanges: number;
    healthCheckExecutions: number;
    healthCheckFailures: number;
    serviceRecoveries: number;
}