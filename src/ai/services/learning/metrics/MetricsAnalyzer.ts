/**
 * Analyseur de métriques d'apprentissage
 * 
 * @file src/ai/services/learning/metrics/MetricsAnalyzer.ts
 */

import { UserMetricsProfile } from './interfaces/MetricsInterfaces';
import { LearningMetricsCollector } from './LearningMetricsCollector';
import { LearningPyramidIntegration } from '../integration/pyramid/LearningPyramidIntegration';

// Types définis localement pour éviter les imports manquants
export interface MetricsAnalysisStrategy {
    name: string;
    requiredMetrics: string[];
    execute(profile: ExtendedUserMetricsProfile, options?: AnalysisOptions): AnalysisResult;
}

// Extension de UserMetricsProfile avec les propriétés manquantes
export interface ExtendedUserMetricsProfile extends UserMetricsProfile {
    mastery?: Record<string, { score: number; level: string }>;
    performance?: Record<string, { score: number; metrics: Record<string, unknown> }>;
    engagement?: Record<string, { score: number; activities: unknown[] }>;
    progression?: Record<string, { rate: number; milestones: unknown[] }>;
}

/**
 * Interface pour les résultats d'analyse
 */
export interface AnalysisResult {
    id: string;
    title: string;
    description: string;
    confidence: number;
    results: Record<string, unknown>;
    recommendations?: string[];
    insights?: string[];
    timestamp: Date;
    metricsUsed: string[];
    strategy: string;
}

/**
 * Interface pour les options d'analyse
 */
export interface AnalysisOptions {
    strategies?: string[];
    detailLevel?: number;
    categories?: Array<'performance' | 'engagement' | 'progression' | 'mastery' | 'emotional'>;
    maxRecommendations?: number;
    maxInsights?: number;
    usePyramidIntegration?: boolean;
}

/**
 * Classe principale pour l'analyse des métriques d'apprentissage
 */
export class MetricsAnalyzer {
    private readonly metricsCollector: LearningMetricsCollector;
    private readonly pyramidIntegration?: LearningPyramidIntegration;
    private readonly strategies: Map<string, MetricsAnalysisStrategy>;

    constructor(
        metricsCollector: LearningMetricsCollector,
        pyramidIntegration?: LearningPyramidIntegration
    ) {
        this.metricsCollector = metricsCollector;
        this.pyramidIntegration = pyramidIntegration;
        this.strategies = new Map();

        // Initialiser les stratégies par défaut
        this.initializeDefaultStrategies();
    }

    /**
     * Analyse un profil utilisateur selon les options spécifiées
     */
    public async analyze(
        profile: UserMetricsProfile,
        options: AnalysisOptions = {}
    ): Promise<AnalysisResult[]> {
        const extendedProfile = this.extendProfile(profile);
        const results: AnalysisResult[] = [];

        // Déterminer les stratégies à utiliser
        const strategiesToUse = this.selectStrategies(options);

        // Exécuter chaque stratégie
        for (const strategy of strategiesToUse) {
            try {
                const result = strategy.execute(extendedProfile, options);
                results.push(result);
            } catch (error) {
                console.error(`Error executing strategy ${strategy.name}:`, error);
            }
        }

        return results;
    }

    /**
     * Analyse les performances d'un utilisateur
     */
    public analyzePerformance(profile: UserMetricsProfile): AnalysisResult {
        const extendedProfile = this.extendProfile(profile);
        
        const performanceData = extendedProfile.performance || {};
        const performanceEntries = Object.entries(performanceData);
        
        let totalScore = 0;
        let count = 0;

        for (const [, data] of performanceEntries) {
            if (typeof data === 'object' && data !== null && 'score' in data) {
                totalScore += (data as { score: number }).score;
                count++;
            }
        }

        const averageScore = count > 0 ? totalScore / count : 0;

        return {
            id: `performance_${Date.now()}`,
            title: 'Performance Analysis',
            description: 'Analysis of user performance metrics',
            confidence: count > 0 ? 0.8 : 0.3,
            results: {
                averageScore,
                totalMetrics: count,
                performanceLevel: this.getPerformanceLevel(averageScore)
            },
            recommendations: this.generatePerformanceRecommendations(averageScore),
            insights: this.generatePerformanceInsights(averageScore, count),
            timestamp: new Date(),
            metricsUsed: Object.keys(performanceData),
            strategy: 'performance_analysis'
        };
    }

    /**
     * Analyse l'engagement d'un utilisateur
     */
    public analyzeEngagement(profile: UserMetricsProfile): AnalysisResult {
        const extendedProfile = this.extendProfile(profile);
        
        const engagementData = extendedProfile.engagement || {};
        const engagementEntries = Object.entries(engagementData);
        
        let totalScore = 0;
        let count = 0;

        for (const [, data] of engagementEntries) {
            if (typeof data === 'object' && data !== null && 'score' in data) {
                totalScore += (data as { score: number }).score;
                count++;
            }
        }

        const averageEngagement = count > 0 ? totalScore / count : 0;

        return {
            id: `engagement_${Date.now()}`,
            title: 'Engagement Analysis',
            description: 'Analysis of user engagement metrics',
            confidence: count > 0 ? 0.8 : 0.3,
            results: {
                averageEngagement,
                totalMetrics: count,
                engagementLevel: this.getEngagementLevel(averageEngagement)
            },
            recommendations: this.generateEngagementRecommendations(averageEngagement),
            insights: this.generateEngagementInsights(averageEngagement, count),
            timestamp: new Date(),
            metricsUsed: Object.keys(engagementData),
            strategy: 'engagement_analysis'
        };
    }

    /**
     * Analyse la progression d'un utilisateur
     */
    public analyzeProgression(profile: UserMetricsProfile): AnalysisResult {
        const extendedProfile = this.extendProfile(profile);
        
        const progressionData = extendedProfile.progression || {};
        const progressionEntries = Object.entries(progressionData);
        
        let totalRate = 0;
        let count = 0;

        for (const [, data] of progressionEntries) {
            if (typeof data === 'object' && data !== null && 'rate' in data) {
                totalRate += (data as { rate: number }).rate;
                count++;
            }
        }

        const averageRate = count > 0 ? totalRate / count : 0;

        return {
            id: `progression_${Date.now()}`,
            title: 'Progression Analysis',
            description: 'Analysis of user progression metrics',
            confidence: count > 0 ? 0.8 : 0.3,
            results: {
                averageRate,
                totalMetrics: count,
                progressionLevel: this.getProgressionLevel(averageRate)
            },
            recommendations: this.generateProgressionRecommendations(averageRate),
            insights: this.generateProgressionInsights(averageRate, count),
            timestamp: new Date(),
            metricsUsed: Object.keys(progressionData),
            strategy: 'progression_analysis'
        };
    }

    /**
     * Analyse la maîtrise d'un utilisateur
     */
    public analyzeMastery(profile: UserMetricsProfile): AnalysisResult {
        const extendedProfile = this.extendProfile(profile);
        
        const masteryData = extendedProfile.mastery || {};
        const masteryEntries = Object.entries(masteryData);
        
        let totalScore = 0;
        let count = 0;

        for (const [, data] of masteryEntries) {
            if (typeof data === 'object' && data !== null && 'score' in data) {
                totalScore += (data as { score: number }).score;
                count++;
            }
        }

        const averageScore = count > 0 ? totalScore / count : 0;

        return {
            id: `mastery_${Date.now()}`,
            title: 'Mastery Analysis',
            description: 'Analysis of user mastery metrics',
            confidence: count > 0 ? 0.8 : 0.3,
            results: {
                averageScore,
                totalMetrics: count,
                masteryLevel: this.getMasteryLevel(averageScore)
            },
            recommendations: this.generateMasteryRecommendations(averageScore),
            insights: this.generateMasteryInsights(averageScore, count),
            timestamp: new Date(),
            metricsUsed: Object.keys(masteryData),
            strategy: 'mastery_analysis'
        };
    }

    /**
     * Génère un résumé d'apprentissage personnalisé
     */
    public generateLearningSnapshot(profile: UserMetricsProfile): {
        currentLevel?: string;
        recentActivities?: Array<{
            type: string;
            score: number;
            timestamp: Date;
        }>;
        focusArea?: string;
        pyramidIntegrationActive?: boolean;
        metricsSourceCount?: number;
    } {
        const results = [
            this.analyzePerformance(profile),
            this.analyzeEngagement(profile),
            this.analyzeProgression(profile),
            this.analyzeMastery(profile)
        ];

        // Utiliser le metricsCollector pour obtenir des données supplémentaires
        const metricsSourceCount = this.metricsCollector ? 1 : 0;

        // Vérifier si l'intégration pyramidale est active
        const pyramidIntegrationActive = !!this.pyramidIntegration;

        return {
            currentLevel: 'intermediate',
            recentActivities: results.slice(0, 5).map(result => ({
                type: result.strategy,
                score: result.confidence,
                timestamp: result.timestamp
            })),
            focusArea: results[0]?.strategy || 'general',
            pyramidIntegrationActive,
            metricsSourceCount
        };
    }

    // Méthodes privées

    private extendProfile(profile: UserMetricsProfile): ExtendedUserMetricsProfile {
        return {
            ...profile,
            mastery: {},
            performance: {},
            engagement: {},
            progression: {}
        };
    }

    private initializeDefaultStrategies(): void {
        // Stratégie d'analyse de performance
        const performanceStrategy: MetricsAnalysisStrategy = {
            name: 'performance_analysis',
            requiredMetrics: ['performance'],
            execute: (profile) => this.analyzePerformance(profile)
        };

        // Stratégie d'analyse d'engagement
        const engagementStrategy: MetricsAnalysisStrategy = {
            name: 'engagement_analysis',
            requiredMetrics: ['engagement'],
            execute: (profile) => this.analyzeEngagement(profile)
        };

        this.strategies.set('performance', performanceStrategy);
        this.strategies.set('engagement', engagementStrategy);
    }

    private selectStrategies(options: AnalysisOptions): MetricsAnalysisStrategy[] {
        const selectedStrategies: MetricsAnalysisStrategy[] = [];

        if (options.strategies && options.strategies.length > 0) {
            for (const strategyName of options.strategies) {
                const strategy = this.strategies.get(strategyName);
                if (strategy) {
                    selectedStrategies.push(strategy);
                }
            }
        } else {
            // Utiliser toutes les stratégies par défaut
            selectedStrategies.push(...this.strategies.values());
        }

        return selectedStrategies;
    }

    private getPerformanceLevel(score: number): string {
        if (score >= 0.8) return 'excellent';
        if (score >= 0.6) return 'good';
        if (score >= 0.4) return 'average';
        return 'needs_improvement';
    }

    private getEngagementLevel(score: number): string {
        if (score >= 0.8) return 'highly_engaged';
        if (score >= 0.6) return 'engaged';
        if (score >= 0.4) return 'moderately_engaged';
        return 'low_engagement';
    }

    private getProgressionLevel(rate: number): string {
        if (rate >= 0.8) return 'fast_progress';
        if (rate >= 0.6) return 'steady_progress';
        if (rate >= 0.4) return 'slow_progress';
        return 'stagnant';
    }

    private getMasteryLevel(score: number): string {
        if (score >= 0.8) return 'expert';
        if (score >= 0.6) return 'proficient';
        if (score >= 0.4) return 'developing';
        return 'novice';
    }

    private generatePerformanceRecommendations(score: number): string[] {
        const recommendations = [];
        if (score < 0.5) {
            recommendations.push('Focus on fundamental concepts');
            recommendations.push('Practice more frequently');
        } else if (score < 0.8) {
            recommendations.push('Challenge yourself with advanced topics');
        }
        return recommendations;
    }

    private generateEngagementRecommendations(score: number): string[] {
        const recommendations = [];
        if (score < 0.5) {
            recommendations.push('Try more interactive content');
            recommendations.push('Set shorter learning goals');
        }
        return recommendations;
    }

    private generateProgressionRecommendations(rate: number): string[] {
        const recommendations = [];
        if (rate < 0.5) {
            recommendations.push('Break down complex topics');
            recommendations.push('Increase practice frequency');
        }
        return recommendations;
    }

    private generateMasteryRecommendations(score: number): string[] {
        const recommendations = [];
        if (score < 0.5) {
            recommendations.push('Review foundational concepts');
            recommendations.push('Seek additional support');
        }
        return recommendations;
    }

    private generatePerformanceInsights(score: number, count: number): string[] {
        const insights = [];
        insights.push(`Performance score: ${(score * 100).toFixed(1)}%`);
        insights.push(`Based on ${count} metrics`);
        return insights;
    }

    private generateEngagementInsights(score: number, count: number): string[] {
        const insights = [];
        insights.push(`Engagement score: ${(score * 100).toFixed(1)}%`);
        insights.push(`Based on ${count} metrics`);
        return insights;
    }

    private generateProgressionInsights(rate: number, count: number): string[] {
        const insights = [];
        insights.push(`Progression rate: ${(rate * 100).toFixed(1)}%`);
        insights.push(`Based on ${count} metrics`);
        return insights;
    }

    private generateMasteryInsights(score: number, count: number): string[] {
        const insights = [];
        insights.push(`Mastery score: ${(score * 100).toFixed(1)}%`);
        insights.push(`Based on ${count} metrics`);
        return insights;
    }
}