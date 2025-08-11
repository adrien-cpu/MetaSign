// src/ai/feedback/observations/collaborative/ValidationSystem.ts
import {
    ValidationRequest,
    Validation,
    ValidationResults,
    ValidatorType
} from './types/validation-types';
import { ICollaborativeValidationSystem } from './interfaces/validation-interfaces';

export class CollaborativeValidationSystem implements ICollaborativeValidationSystem {
    private validationRequests: Map<string, ValidationRequest> = new Map();
    private validations: Map<string, Validation[]> = new Map();

    createValidationRequest(
        contentId: string,
        contentType: string,
        content: unknown,
        criteria: string[]
    ): ValidationRequest {
        const request: ValidationRequest = {
            id: crypto.randomUUID(),
            contentId,
            contentType,
            content,
            criteria,
            status: 'pending',
            requiredValidators: this.calculateRequiredValidators(criteria.length),
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.validationRequests.set(request.id, request);
        this.validations.set(request.id, []);

        return request;
    }

    submitValidation(
        requestId: string,
        validatorId: string,
        validatorType: ValidatorType,
        criteria: string,
        score: number,
        feedback: string
    ): Validation {
        const request = this.validationRequests.get(requestId);
        if (!request) {
            throw new Error(`Validation request ${requestId} not found`);
        }

        if (!request.criteria.includes(criteria)) {
            throw new Error(`Criteria "${criteria}" not found in request`);
        }

        const validation: Validation = {
            id: crypto.randomUUID(),
            requestId,
            validatorId,
            validatorType,
            criteria,
            score: Math.max(0, Math.min(100, score)),
            feedback,
            timestamp: Date.now()
        };

        const requestValidations = this.validations.get(requestId)!;
        requestValidations.push(validation);

        this.updateRequestStatus(requestId);

        return validation;
    }

    getValidationResults(requestId: string): ValidationResults {
        const request = this.validationRequests.get(requestId);
        if (!request) {
            throw new Error(`Validation request ${requestId} not found`);
        }

        const validations = this.validations.get(requestId) || [];

        const scores = this.calculateScores(request, validations);
        const avgScore = this.calculateAverageScore(scores);
        const consensusReached = this.isConsensusReached(request, validations);

        return {
            request,
            validations,
            scores,
            avgScore,
            consensusReached
        };
    }

    private updateRequestStatus(requestId: string): void {
        const request = this.validationRequests.get(requestId)!;
        const validations = this.validations.get(requestId)!;

        const criteriaCounts = this.countCriteriaValidations(request, validations);
        const consensusReached = this.isConsensusReached(request, validations);

        const completedCriteria = Object.entries(criteriaCounts)
            .filter(([criteria, count]) =>
                count >= (request.requiredValidators || 3) &&
                this.isCriteriaConsensusReached(criteria, validations)
            ).length;

        if (consensusReached || completedCriteria === request.criteria.length) {
            request.status = 'completed';
        } else if (validations.length >= (request.requiredValidators || 3)) {
            request.status = 'rejected';
        } else {
            request.status = 'in_progress';
        }

        request.updatedAt = Date.now();
    }

    private calculateRequiredValidators(criteriaCount: number): number {
        return Math.max(3, Math.ceil(criteriaCount * 1.5));
    }

    private calculateScores(request: ValidationRequest, validations: Validation[]): Record<string, number> {
        const scores: Record<string, number> = {};

        request.criteria.forEach(criteria => {
            const criteriaValidations = validations.filter(v => v.criteria === criteria);
            scores[criteria] = criteriaValidations.length > 0
                ? criteriaValidations.reduce((sum, val) => sum + val.score, 0) / criteriaValidations.length
                : 0;
        });

        return scores;
    }

    private calculateAverageScore(scores: Record<string, number>): number {
        const scoreValues = Object.values(scores);
        return scoreValues.length > 0
            ? scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length
            : 0;
    }

    private countCriteriaValidations(request: ValidationRequest, validations: Validation[]): Record<string, number> {
        const counts: Record<string, number> = {};
        request.criteria.forEach(criteria => {
            counts[criteria] = validations.filter(v => v.criteria === criteria).length;
        });
        return counts;
    }

    private isConsensusReached(request: ValidationRequest, validations: Validation[]): boolean {
        const criteriaCounts = this.countCriteriaValidations(request, validations);
        return Object.values(criteriaCounts)
            .every(count => count >= (request.requiredValidators || 3));
    }

    private isCriteriaConsensusReached(criteria: string, validations: Validation[]): boolean {
        const criteriaValidations = validations.filter(v => v.criteria === criteria);
        if (criteriaValidations.length === 0) return false;

        const scores = criteriaValidations.map(v => v.score);
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;

        return variance < 10;
    }
}