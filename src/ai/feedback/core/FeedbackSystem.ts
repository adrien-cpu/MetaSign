// src/ai/feedback/core/FeedbackSystem.ts
import { LSFEmotionSystem } from '../../systems/expressions/emotions/LSFEmotionSystem';
import { LSFContextualEmotionSystem } from '../../systems/expressions/emotions/LSFContextualEmotionSystem';
import { LSFCulturalValidator } from '../../specialized/cultural/LSFCulturalValidator';
import { LSFCulturalSpecificsSystem } from '../../specialized/cultural/LSFCulturalSpecificsSystem';
import { SpatialStructureManager } from '../../specialized/spatial/SpatialStructureManager';
import { LSFTemporalExpressions } from '../../systems/expressions/temporal/LSFTemporalExpressions';
import { FeedbackQualityAssessor } from '../quality/FeedbackQualityAssessor';
import { 
    FeedbackData, 
    FeedbackResult, 
    ResultScores,
    QualityWeights 
} from '../types';

export class FeedbackSystem {
    constructor(
        private readonly emotionSystem: LSFEmotionSystem,
        private readonly contextualEmotionSystem: LSFContextualEmotionSystem,
        private readonly culturalValidator: LSFCulturalValidator,
        private readonly culturalSpecificsSystem: LSFCulturalSpecificsSystem,
        private readonly spatialManager: SpatialStructureManager,
        private readonly temporalExpressions: LSFTemporalExpressions,
        private readonly qualityAssessor: FeedbackQualityAssessor
    ) {}

    async processFeedback(feedback: FeedbackData): Promise<FeedbackResult> {
        const results: ResultScores = {
            emotional: {
                score: 0,
                analysis: await this.emotionSystem.processEmotion(
                    feedback.emotion, 
                    feedback.context.emotionalContext
                )
            },
            cultural: {
                score: 0,
                analysis: await this.culturalValidator.validateCulturalAuthenticity(
                    feedback.expression, 
                    feedback.context.culturalContext
                )
            },
            spatial: {
                score: 0,
                analysis: await this.spatialManager.analyzeSpatialStructure(
                    feedback.input
                )
            },
            temporal: {
                score: 0,
                analysis: await this.temporalExpressions.analyzeTemporalPattern(
                    feedback.expression, 
                    feedback.context.temporalContext
                )
            }
        };

        const qualityScore = await this.qualityAssessor.assess(feedback);

        return this.aggregateResults(results, qualityScore);
    }

    private aggregateResults(results: ResultScores, qualityScore: number): FeedbackResult {
        const weights: QualityWeights = {
            emotional: 0.25,
            cultural: 0.25,
            spatial: 0.25,
            temporal: 0.25
        };

        Object.keys(weights).forEach(key => {
            results[key].score = this.calculateComponentScore(
                results[key].analysis,
                weights[key]
            );
        });

        return {
            ...results,
            qualityScore
        } as FeedbackResult;
    }

    private calculateComponentScore(analysis: any, weight: number): number {
        // Logique de calcul du score pour chaque composant
        return weight * (analysis?.score || 0);
    }
}