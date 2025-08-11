// committee/EthicsCommittee.ts
import {
    EthicsContext,
    EthicsDecision,
    EthicsPriority,
    EthicsResult
} from '../types';
import { Member } from './Member';
import { VotingSystem } from '../voting/VotingSystem';
import { VoteConflictResolver } from '../voting/VoteConflictResolver';

interface CommitteeReviewCase {
    context: EthicsContext;
    evidence: Array<{ type: string; result: any }>;
    preliminaryDecision: EthicsDecision;
}

interface CommitteeConfiguration {
    minRequiredMembers: number;
    consensusThreshold: number;
    maxReviewTimeMs: number;
    autoEscalationThreshold: number;
}

export class EthicsCommittee {
    private members: Map<string, Member>;
    private votingSystem: VotingSystem;
    private conflictResolver: VoteConflictResolver;
    private config: CommitteeConfiguration;
    private activeReviews: Map<string, CommitteeReviewCase>;

    constructor(config?: Partial<CommitteeConfiguration>) {
        this.members = new Map();
        this.votingSystem = new VotingSystem();
        this.conflictResolver = new VoteConflictResolver();
        this.activeReviews = new Map();
        this.config = {
            minRequiredMembers: 3,
            consensusThreshold: 0.75,
            maxReviewTimeMs: 24 * 60 * 60 * 1000, // 24 heures
            autoEscalationThreshold: 0.9,
            ...config
        };
        this.initializeCommittee();
    }

    private initializeCommittee(): void {
        // Initialiser les membres du comité avec différentes spécialisations
        this.addMember(new Member('ethics-1', 'Ethics Specialist', ['ethics', 'philosophy']));
        this.addMember(new Member('tech-1', 'Technical Expert', ['ai', 'security']));
        this.addMember(new Member('legal-1', 'Legal Advisor', ['gdpr', 'compliance']));
        this.addMember(new Member('safety-1', 'Safety Officer', ['safety', 'risk']));
        this.addMember(new Member('human-1', 'Human Rights Advocate', ['rights', 'social']));
    }

    addMember(member: Member): void {
        if (this.members.has(member.getId())) {
            throw new Error(`Member ${member.getId()} already exists`);
        }
        this.members.set(member.getId(), member);
    }

    async reviewCase(reviewCase: CommitteeReviewCase): Promise<EthicsResult> {
        const reviewId = this.generateReviewId();
        this.activeReviews.set(reviewId, reviewCase);

        try {
            // 1. Sélectionner les membres pertinents pour la revue
            const selectedMembers = this.selectReviewers(reviewCase);
            if (selectedMembers.length < this.config.minRequiredMembers) {
                return this.escalateReview(reviewCase, 'Insufficient qualified members');
            }

            // 2. Collecter les votes
            const votes = await this.collectVotes(selectedMembers, reviewCase);
            
            // 3. Analyser le consensus
            const consensus = this.votingSystem.analyzeConsensus(votes);
            if (consensus.consensusReached) {
                return this.createResult(consensus.decision, reviewCase, selectedMembers);
            }

            // 4. Résoudre les conflits si nécessaire
            if (consensus.requiresConflictResolution) {
                const resolvedDecision = await this.conflictResolver.resolveConflict(votes, reviewCase);
                return this.createResult(resolvedDecision, reviewCase, selectedMembers);
            }

            // 5. Escalader si nécessaire
            return this.escalateReview(reviewCase, 'No consensus reached');

        } catch (error) {
            return this.createErrorResult(error, reviewCase);
        } finally {
            this.activeReviews.delete(reviewId);
        }
    }

    private selectReviewers(reviewCase: CommitteeReviewCase): Member[] {
        return Array.from(this.members.values()).filter(member => 
            member.isQualifiedFor(reviewCase.context) && 
            member.isAvailable()
        );
    }

    private async collectVotes(members: Member[], reviewCase: CommitteeReviewCase): Promise<Map<string, EthicsDecision>> {
        const votes = new Map<string, EthicsDecision>();
        const votePromises = members.map(async member => {
            try {
                const vote = await member.reviewAndVote(reviewCase);
                votes.set(member.getId(), vote);
            } catch (error) {
                console.error(`Vote error from member ${member.getId()}:`, error);
            }
        });

        await Promise.all(votePromises);
        return votes;
    }

    private createResult(
        decision: EthicsDecision,
        reviewCase: CommitteeReviewCase,
        reviewers: Member[]
    ): EthicsResult {
        return {
            decision,
            timestamp: Date.now(),
            context: reviewCase.context,
            violations: reviewCase.preliminaryDecision === EthicsDecision.REJECTED ? [{
                ruleId: 'COMMITTEE_REVIEW',
                message: 'Committee review required modifications',
                priority: EthicsPriority.HIGH
            }] : [],
            metadata: {
                validatedBy: reviewers.map(r => r.getId()),
                auditId: this.generateReviewId(),
                processingTime: 0,
                committee: {
                    reviewers: reviewers.map(r => ({
                        id: r.getId(),
                        expertise: r.getExpertise()
                    })),
                    evidence: reviewCase.evidence
                }
            }
        };
    }

    private createErrorResult(error: unknown, reviewCase: CommitteeReviewCase): EthicsResult {
        return {
            decision: EthicsDecision.ESCALATED,
            timestamp: Date.now(),
            context: reviewCase.context,
            violations: [{
                ruleId: 'COMMITTEE_ERROR',
                message: `Committee review error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                priority: EthicsPriority.CRITICAL
            }],
            metadata: {
                validatedBy: ['EthicsCommittee'],
                auditId: this.generateReviewId(),
                processingTime: 0
            }
        };
    }

    private escalateReview(reviewCase: CommitteeReviewCase, reason: string): EthicsResult {
        return {
            decision: EthicsDecision.ESCALATED,
            timestamp: Date.now(),
            context: reviewCase.context,
            violations: [{
                ruleId: 'COMMITTEE_ESCALATION',
                message: `Review escalated: ${reason}`,
                priority: EthicsPriority.HIGH
            }],
            metadata: {
                validatedBy: ['EthicsCommittee'],
                auditId: this.generateReviewId(),
                processingTime: 0,
                escalation: {
                    reason,
                    originalDecision: reviewCase.preliminaryDecision
                }
            }
        };
    }

    private generateReviewId(): string {
        return `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Méthodes publiques de gestion
    getActiveReviewCount(): number {
        return this.activeReviews.size;
    }

    getMemberCount(): number {
        return this.members.size;
    }

    getConfiguration(): CommitteeConfiguration {
        return { ...this.config };
    }

    updateConfiguration(newConfig: Partial<CommitteeConfiguration>): void {
        this.config = {
            ...this.config,
            ...newConfig
        };
    }
}