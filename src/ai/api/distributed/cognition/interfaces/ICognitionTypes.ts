/**
 * CognitionTypes.ts
 * 
 * Type definitions for the Cognition subsystem.
 */

import { DistributedTask } from '@api/distributed/types/DistributedTypes';
import { SupervisionLevel } from '@ai/ethics/types';

/**
 * Represents the analysis of a distributed task
 */
export interface TaskAnalysis {
    /**
     * The task being analyzed
     */
    task: DistributedTask;

    /**
     * Whether the task can be parallelized
     */
    parallelize: boolean;

    /**
     * The required level of supervision
     */
    supervision: SupervisionLevel;

    /**
     * Estimated resource requirements
     */
    resourceEstimation: ResourceEstimation;
}

/**
 * Represents estimated resource requirements for a task
 */
export interface ResourceEstimation {
    /**
     * Estimated CPU cores required
     */
    cpu: number;

    /**
     * Estimated memory in MB required
     */
    memory: number;

    /**
     * Estimated duration in milliseconds
     */
    estimatedDuration: number;
}