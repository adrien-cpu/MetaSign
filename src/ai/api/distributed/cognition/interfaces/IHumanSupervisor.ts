/**
 * IHumanSupervisor.ts
 * 
 * Interface for human supervisors in the distributed intelligence system.
 * Part of the SupervisionHumaineRenforcee component as defined in the state diagrams.
 */

import { SupervisionLevel } from '@ai/ethics/types';

/**
 * Represents a human supervisor in the system
 */
export interface IHumanSupervisor {
    /**
     * Unique identifier for the supervisor
     */
    id: string;

    /**
     * Display name of the supervisor
     */
    name: string;

    /**
     * Areas of expertise for the supervisor
     */
    expertise: string[];

    /**
     * Whether the supervisor is currently available
     */
    availability: boolean;

    /**
     * The level of supervision provided
     */
    supervisionLevel: SupervisionLevel;

    /**
     * Maximum number of concurrent tasks this supervisor can handle
     */
    maxConcurrentTasks: number;

    /**
     * Current number of tasks being supervised
     */
    currentTaskCount: number;

    /**
     * Time availability windows (ISO 8601 time ranges)
     */
    availabilityWindows?: {
        start: string;
        end: string;
    }[];

    /**
     * Contact information for urgent notifications
     */
    contactInfo?: {
        email?: string;
        phone?: string;
        preferredMethod: 'email' | 'phone' | 'system';
    };

    /**
     * Authorization level for making decisions
     */
    authorizationLevel: 'observer' | 'validator' | 'decision-maker';
}