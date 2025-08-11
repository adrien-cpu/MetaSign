// src/ai/api/distributed/monitoring/health/interfaces/IDistributedHealthChecker.ts
import { NodeHealthStatus } from '../../../types/DistributedTypes';

/**
 * Interface for distributed health checking functionality
 */
export interface IDistributedHealthChecker {
    /**
     * Initialize the health checker
     */
    initialize(): Promise<void>;

    /**
     * Check health status of specified nodes
     * @param nodeIds Array of node IDs to check
     * @returns Array of node health statuses
     */
    checkNodesHealth(nodeIds: string[]): Promise<NodeHealthStatus[]>;
}