/**
 * ICognitionManager.ts
 * 
 * Interface for the cognition manager responsible for distributed intelligence coordination.
 */

import { DistributedTask, TaskDistribution } from '@api/distributed/types/DistributedTypes';
import { IHumanSupervisor } from './IHumanSupervisor';
import { TaskAnalysis } from '../types/CognitionTypes';

/**
 * Manages cognitive tasks across the distributed intelligence network
 */
export interface ICognitionManager {
    /**
     * Distributes a cognitive task across the distributed intelligence network
     * @param task The task to distribute
     * @returns A validated task distribution plan
     */
    distributeTask(task: DistributedTask): Promise<TaskDistribution>;

    /**
     * Analyzes a task to determine optimal distribution strategy
     * @param task The task to analyze
     * @returns Analysis results including parallelization and supervision requirements
     */
    analyzeTask(task: DistributedTask): Promise<TaskAnalysis>;

    /**
     * Adds a human supervisor to the system
     * @param supervisor The supervisor to add
     */
    addSupervisor(supervisor: IHumanSupervisor): void;

    /**
     * Removes a human supervisor from the system
     * @param supervisorId The ID of the supervisor to remove
     * @returns Whether the supervisor was successfully removed
     */
    removeSupervisor(supervisorId: string): boolean;

    /**
     * Gets all available supervisors
     * @returns A list of available supervisors
     */
    getAvailableSupervisors(): IHumanSupervisor[];

    /**
     * Finds a supervisor with specific expertise
     * @param expertiseRequired The expertise areas required
     * @returns The most suitable supervisor or undefined if none found
     */
    findSupervisorWithExpertise(expertiseRequired: string[]): IHumanSupervisor | undefined;
}