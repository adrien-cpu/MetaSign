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