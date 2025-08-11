// src/ai/api/multimodal/analysis/SituationalAnalyzer.ts

import {
    SynchronizedModalities,
    SituationContext,
    EnvironmentInfo,
    ParticipantInfo,
    InteractionState,
    ContextualData
} from './types';

interface EnvironmentDetector {
    detect(modalities: SynchronizedModalities): Promise<EnvironmentInfo>;
}

interface ParticipantAnalyzer {
    analyze(modalities: SynchronizedModalities): Promise<ParticipantInfo[]>;
}

interface InteractionAnalyzer {
    analyze(modalities: SynchronizedModalities): Promise<InteractionState>;
}

interface SystemeControleEthique {
    validateSituation(modalities: SynchronizedModalities): Promise<void>;
    getComplianceStatus(): Promise<string>;
}

interface SystemeSecuriteRenforcee {
    analyzeThreat(modalities: SynchronizedModalities): Promise<void>;
    getCurrentStatus(): Promise<string>;
}

export class SituationalAnalyzer {
    constructor(
        private readonly environmentDetector: EnvironmentDetector,
        private readonly participantAnalyzer: ParticipantAnalyzer,
        private readonly interactionAnalyzer: InteractionAnalyzer,
        private readonly ethicsSystem: SystemeControleEthique,
        private readonly securitySystem: SystemeSecuriteRenforcee
    ) { }

    async analyze(modalities: SynchronizedModalities): Promise<SituationContext> {
        // Validation éthique et sécurité
        await this.ethicsSystem.validateSituation(modalities);
        await this.securitySystem.analyzeThreat(modalities);

        // Analyse parallèle des différents aspects
        const [environment, participants, interaction] = await Promise.all([
            this.environmentDetector.detect(modalities),
            this.participantAnalyzer.analyze(modalities),
            this.interactionAnalyzer.analyze(modalities)
        ]);

        // Construction du contexte
        const context = await this.buildContextualData(environment, participants, interaction);
        const urgency = this.calculateUrgencyLevel(environment, interaction);

        return {
            environment,
            participants,
            interaction,
            context,
            urgency
        };
    }

    private async buildContextualData(
        environment: EnvironmentInfo,
        participants: ParticipantInfo[],
        interaction: InteractionState
    ): Promise<ContextualData> {
        return {
            priority: this.calculatePriority(environment, interaction),
            complexity: this.assessComplexity(participants, interaction),
            timeConstraints: {
                maxDuration: 60000,  // 60 secondes par défaut
                responseWindow: 5000, // 5 secondes par défaut
                processingTime: 1000  // 1 seconde par défaut
            },
            requirements: this.determineRequirements(environment, participants)
        };
    }

    private calculateUrgencyLevel(
        environment: EnvironmentInfo,
        interaction: InteractionState
    ): number {
        const environmentalUrgency = environment.constraints.maxNoiseLevel > 80 ? 0.8 : 0.4;
        const interactionUrgency = (interaction.issues.length / 10) * 0.6;

        return Math.min(environmentalUrgency + interactionUrgency, 1);
    }

    private calculatePriority(
        environment: EnvironmentInfo,
        interaction: InteractionState
    ): number {
        const environmentalUrgency = environment.constraints.maxNoiseLevel > 80 ? 1 : 0;
        const interactionUrgency = interaction.issues.length > 0 ? 1 : 0;
        return Math.min(environmentalUrgency + interactionUrgency, 1);
    }

    private assessComplexity(
        participants: ParticipantInfo[],
        interaction: InteractionState
    ): number {
        const participantComplexity = participants.length * 0.2;
        const issueComplexity = interaction.issues.length * 0.3;
        return Math.min(participantComplexity + issueComplexity, 1);
    }

    private determineRequirements(
        environment: EnvironmentInfo,
        participants: ParticipantInfo[]
    ): string[] {
        const requirements: string[] = [];

        if (environment.conditions.lighting === 'low') {
            requirements.push('enhanced_visibility');
        }

        if (participants.some(p => p.preferences.adaptations.length > 0)) {
            requirements.push('adaptations_required');
        }

        return requirements;
    }
}