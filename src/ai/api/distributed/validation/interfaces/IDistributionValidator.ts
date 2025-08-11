// src/ai/api/distributed/validation/interfaces/IDistributionValidator.ts
import { NodeTrainingResult } from '../../../types/DistributedTypes';

/**
 * Interface for validating distributed training results
 */
export interface IDistributionValidator {
    /**
     * Validate distribution of training results
     * @param results Training results to validate
     */
    validateDistribution(results: NodeTrainingResult[]): Promise<void>;
}