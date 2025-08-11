/**
 * conflict.types.ts
 * 
 * Types for consensus conflicts in distributed systems.
 */

import { ConflictType } from './ConsensusTypes';

/**
 * Priority levels for conflict resolution
 */
export enum ConflictPriority {
    CRITICAL = 'critical',
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low'
}

/**
 * Represents a conflict detected during consensus
 */
export interface Conflict {
    /**
     * Unique identifier for the conflict
     */
    id: string;

    /**
     * Type of conflict
     */
    type: ConflictType;

    /**
     * Affected nodes or components
     */
    affectedElements: string[];

    /**
     * Description of the conflict
     */
    description: string;

    /**
     * Severity score (0-10)
     */
    severity: number;

    /**
     * Priority for resolution
     */
    priority: ConflictPriority;

    /**
     * Timestamp when conflict was detected
     */
    timestamp: number;

    /**
     * Optional additional data specific to this conflict
     */
    metadata?: Record<string, unknown>;

    /**
     * Index signature for extensibility
     */
    [key: string]: unknown;
}

/**
 * Resolution status for conflicts
 */
export enum ResolutionStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    RESOLVED = 'resolved',
    FAILED = 'failed',
    DEFERRED = 'deferred'
}

/**
 * Represents a resolution for a conflict
 */
export interface ConflictResolution {
    /**
     * ID of the conflict being resolved
     */
    conflictId: string;

    /**
     * Current status of the resolution
     */
    status: ResolutionStatus;

    /**
     * Strategy used to resolve the conflict
     */
    strategy: string;

    /**
     * Actions taken to resolve the conflict
     */
    actions: string[];

    /**
     * Timestamp when resolution was attempted
     */
    timestamp: number;

    /**
     * Optional outcome or result of the resolution
     */
    outcome?: string;
}