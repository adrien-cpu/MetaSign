import { ValidationResult, ValidationSeverity } from '../../../types/validators';

export type VoteType = 'ETHICAL' | 'TECHNICAL' | 'CULTURAL' | 'SAFETY';
export type VotePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type VoteDecision = 'accept' | 'reject';

export interface Vote {
  id: string;
  type: VoteType;
  priority: VotePriority;
  decision: VoteDecision;
  reason: string;
  voter: string;
  timestamp: number;
}

export interface VoteResult {
  decision: VoteDecision;
  reason: string;
  voterCount: number;
  consensusLevel: number;
  dissent?: {
    count: number;
    reasons: string[];
  };
}

interface ConflictAnalysis {
  hasVeto: boolean;
  majorityDecision: VoteDecision;
  consensusLevel: number;
  criticalConcerns: string[];
}

interface VoteMetrics {
  totalVotes: number;
  acceptCount: number;
  rejectCount: number;
  priorityDistribution: Record<VotePriority, number>;
  typeDistribution: Record<VoteType, number>;
}

export class VoteConflictResolver {
  private voteRegistry: Map<string, Vote> = new Map();
  private readonly CONSENSUS_THRESHOLD = 0.75;
  private readonly VETO_PRIORITIES: VotePriority[] = ['CRITICAL'];

  constructor() { }

  public resolveConflicts(votes: Vote[]): VoteResult {
    if (!votes.length) {
      throw new Error('No votes provided for conflict resolution');
    }

    // Enregistrer les votes
    votes.forEach(vote => this.voteRegistry.set(vote.id, vote));

    // Analyser les votes haute priorité
    const highPriorityVotes = this.filterHighPriorityVotes(votes);
    const analysis = this.analyzeConflicts(votes);

    // Vérifier les vetos
    if (analysis.hasVeto) {
      return {
        decision: 'reject',
        reason: this.generateVetoReport(highPriorityVotes),
        voterCount: votes.length,
        consensusLevel: analysis.consensusLevel,
        dissent: this.analyzeDissent(votes)
      };
    }

    // Calculer la décision finale
    const metrics = this.calculateVoteMetrics(votes);
    return {
      decision: analysis.majorityDecision,
      reason: this.generateDecisionReason(analysis, metrics, analysis.consensusLevel >= this.CONSENSUS_THRESHOLD),
      voterCount: votes.length,
      consensusLevel: analysis.consensusLevel,
      dissent: this.analyzeDissent(votes)
    };
  }

  private filterHighPriorityVotes(votes: Vote[]): Vote[] {
    return votes.filter(vote =>
      vote.priority === 'HIGH' || vote.priority === 'CRITICAL'
    );
  }

  private analyzeConflicts(votes: Vote[]): ConflictAnalysis {
    const hasVeto = votes.some(vote =>
      this.VETO_PRIORITIES.includes(vote.priority) && vote.decision === 'reject'
    );

    const acceptCount = votes.filter(v => v.decision === 'accept').length;
    const consensusLevel = acceptCount / votes.length;

    return {
      hasVeto,
      majorityDecision: acceptCount > votes.length / 2 ? 'accept' : 'reject',
      consensusLevel,
      criticalConcerns: this.extractCriticalConcerns(votes)
    };
  }

  private generateVetoReport(votes: Vote[]): string {
    const vetoVotes = votes.filter(vote =>
      this.VETO_PRIORITIES.includes(vote.priority) && vote.decision === 'reject'
    );

    return vetoVotes
      .map(vote => `${vote.type} veto by ${vote.voter}: ${vote.reason}`)
      .join('; ');
  }

  private calculateFinalDecision(votes: Vote[], analysis: ConflictAnalysis): VoteResult {
    const metrics = this.calculateVoteMetrics(votes);
    const consensusReached = analysis.consensusLevel >= this.CONSENSUS_THRESHOLD;

    return {
      decision: analysis.majorityDecision,
      reason: this.generateDecisionReason(analysis, metrics, consensusReached),
      voterCount: votes.length,
      consensusLevel: analysis.consensusLevel,
      dissent: this.analyzeDissent(votes)
    };
  }

  private extractCriticalConcerns(votes: Vote[]): string[] {
    return votes
      .filter(vote => vote.priority === 'CRITICAL' && vote.decision === 'reject')
      .map(vote => vote.reason);
  }

  private calculateVoteMetrics(votes: Vote[]): VoteMetrics {
    const metrics: VoteMetrics = {
      totalVotes: votes.length,
      acceptCount: votes.filter(v => v.decision === 'accept').length,
      rejectCount: votes.filter(v => v.decision === 'reject').length,
      priorityDistribution: {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        CRITICAL: 0
      },
      typeDistribution: {
        ETHICAL: 0,
        TECHNICAL: 0,
        CULTURAL: 0,
        SAFETY: 0
      }
    };

    votes.forEach(vote => {
      metrics.priorityDistribution[vote.priority]++;
      metrics.typeDistribution[vote.type]++;
    });

    return metrics;
  }

  private generateDecisionReason(
    analysis: ConflictAnalysis,
    metrics: VoteMetrics,
    consensusReached: boolean
  ): string {
    const reasons: string[] = [];

    if (consensusReached) {
      reasons.push(`Consensus reached with ${(analysis.consensusLevel * 100).toFixed(1)}% agreement`);
    } else {
      reasons.push(`Decision made with ${(analysis.consensusLevel * 100).toFixed(1)}% majority`);
    }

    if (analysis.criticalConcerns.length > 0) {
      reasons.push(`Critical concerns raised: ${analysis.criticalConcerns.join('; ')}`);
    }

    reasons.push(this.generateMetricsDescription(metrics));

    return reasons.join('. ');
  }

  private generateMetricsDescription(metrics: VoteMetrics): string {
    return `Total votes: ${metrics.totalVotes} (${metrics.acceptCount} accept, ${metrics.rejectCount} reject)`;
  }

  private analyzeDissent(votes: Vote[]): { count: number; reasons: string[] } {
    const majorityDecision = votes.filter(v => v.decision === 'accept').length > votes.length / 2
      ? 'accept'
      : 'reject';

    const dissentVotes = votes.filter(v => v.decision !== majorityDecision);

    return {
      count: dissentVotes.length,
      reasons: Array.from(new Set(dissentVotes.map(v => v.reason)))
    };
  }
}