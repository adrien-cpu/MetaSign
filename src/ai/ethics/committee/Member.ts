// committee/Member.ts
import { 
    CommitteeMember,
    EthicsContext,
    EthicsDecision
} from '../types';

export class Member implements CommitteeMember {
    id: string;
    name: string;
    expertise: string[];
    active: boolean;
    votingWeight: number;
    metadata: {
        joinDate: number;
        reviewCount: number;
        performanceMetrics: Record<string, number>;
    };
    private currentReviews: Set<string>;

    constructor(id: string, name: string, expertise: string[], votingWeight: number = 1.0) {
        this.id = id;
        this.name = name;
        this.expertise = expertise;
        this.active = true;
        this.votingWeight = votingWeight;
        this.metadata = {
            joinDate: Date.now(),
            reviewCount: 0,
            performanceMetrics: {
                consensusAlignment: 1.0,
                responseTime: 0,
                participationRate: 1.0
            }
        };
        this.currentReviews = new Set();
    }

    async reviewAndVote(reviewCase: { context: EthicsContext }): Promise<EthicsDecision> {
        if (!this.active) {
            throw new Error(`Member ${this.id} is not active`);
        }

        if (this.currentReviews.size >= 5) {
            throw new Error(`Member ${this.id} has too many active reviews`);
        }

        const reviewId = this.generateReviewId();
        this.currentReviews.add(reviewId);

        try {
            const startTime = Date.now();
            const decision = await this.makeDecision(reviewCase.context);
            this.updateMetrics(startTime);
            return decision;
        } finally {
            this.currentReviews.delete(reviewId);
        }
    }

    private generateReviewId(): string {
        return `review-${this.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private async makeDecision(context: EthicsContext): Promise<EthicsDecision> {
        const concerns = this.analyzeConcerns(context);
        if (concerns.critical.length > 0) {
            return EthicsDecision.REJECTED;
        }

        if (concerns.major.length > 0) {
            return EthicsDecision.NEEDS_REVIEW;
        }

        if (!this.hasRelevantExpertise(context)) {
            return EthicsDecision.ESCALATED;
        }

        return EthicsDecision.APPROVED;
    }

    private analyzeConcerns(context: EthicsContext): {
        critical: string[];
        major: string[];
        minor: string[];
    } {
        const concerns = {
            critical: [] as string[],
            major: [] as string[],
            minor: [] as string[]
        };

        if (context.environment.safety.securityLevel < 3) {
            concerns.major.push('Insufficient security level');
        }

        if (context.environment.safety.humanPresent && !this.expertise.includes('safety')) {
            concerns.major.push('Human safety considerations require expert review');
        }

        if (context.action.type === 'critical' && !this.expertise.includes('risk')) {
            concerns.critical.push('Critical action requires risk assessment expertise');
        }

        return concerns;
    }

    private hasRelevantExpertise(context: EthicsContext): boolean {
        const requiredExpertise = this.determineRequiredExpertise(context);
        return requiredExpertise.some(exp => this.expertise.includes(exp));
    }

    private determineRequiredExpertise(context: EthicsContext): string[] {
        const required: string[] = [];

        if (context.subject.type === 'human') {
            required.push('ethics', 'rights');
        }

        if (context.environment.safety.securityLevel >= 4) {
            required.push('security', 'safety');
        }

        if (context.action.type.includes('data')) {
            required.push('gdpr', 'compliance');
        }

        return required;
    }

    private updateMetrics(startTime: number): void {
        this.metadata.reviewCount++;
        
        const responseTime = Date.now() - startTime;
        const oldAvg = this.metadata.performanceMetrics.responseTime;
        this.metadata.performanceMetrics.responseTime = 
            (oldAvg * (this.metadata.reviewCount - 1) + responseTime) / this.metadata.reviewCount;

        this.metadata.performanceMetrics.participationRate = 
            this.currentReviews.size > 0 ? 1.0 : 0.9;
    }

    getMetadata(): typeof this.metadata {
        return {
            joinDate: this.metadata.joinDate,
            reviewCount: this.metadata.reviewCount,
            performanceMetrics: { ...this.metadata.performanceMetrics }
        };
    }

    updatePerformanceMetrics(metrics: Record<string, number>): void {
        if (this.metadata.performanceMetrics) {
            this.metadata.performanceMetrics = {
                ...this.metadata.performanceMetrics,
                ...metrics
            };
        }
    }

    resetMetrics(): void {
        this.metadata.performanceMetrics = {
            consensusAlignment: 1.0,
            responseTime: 0,
            participationRate: 1.0
        };
    }

    isQualifiedFor(context: EthicsContext): boolean {
        return this.active && this.hasRelevantExpertise(context);
    }

    isAvailable(): boolean {
        return this.active && this.currentReviews.size < 5;
    }
}