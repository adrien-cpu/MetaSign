/**
 * Processeur d'analytique d'apprentissage pour MetaSign
 * @file src/ai/learning/analytics/LearningAnalyticsProcessor.ts
 */

// Types personnalisés pour l'analytique d'apprentissage
interface TimeSeriesData {
    [key: string]: Array<{ timestamp: number; value: number }>;
}

interface AnomalyData {
    metricId: string;
    timestamp: number;
    value: number;
    expectedValue: number;
    deviation: number;
    severity: 'low' | 'medium' | 'high';
}

interface RiskPrediction {
    type: string;
    probability: number;
    description: string;
    mitigationStrategies: string[];
}

interface Recommendation {
    id: string;
    type: string;
    priority: string;
    description: string;
    suggestedActions: string[];
    relevanceScore: number;
}

interface PerformanceMetrics {
    overallScore: number;
    improvementRate: number;
    consistencyScore: number;
    topPerformingAreas: string[];
    areasNeedingAttention: string[];
    [key: string]: unknown;
}

interface LearningMetrics {
    id: string;
    metricType: string;
    value: number;
    timestamp?: number;
    userId?: string;
    category?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
}

interface LearningAnalyticsResult {
    anomalies: AnomalyData[];
    trends: unknown;
    longitudinalInsights: unknown;
    riskPredictions: RiskPrediction[];
    engagementMetrics: unknown;
    recommendations: Recommendation[];
    performanceMetrics: PerformanceMetrics;
    timestamp: number;
    processingTimeMs: number;
}

// Interface pour le détecteur d'anomalies
interface IAnomalyDetector {
    detectAnomalies(data: TimeSeriesData): Promise<AnomalyData[]>;
}

// Interface pour le collecteur de métriques
interface IMetricsCollector {
    recordMetric(name: string, value: number): void;
}

// Énumération des niveaux de cache
enum CacheLevel {
    L1 = 'L1',
    L2 = 'L2',
    L3 = 'L3'
}

// Classe MultiLevelCache simulée pour résoudre les dépendances
class MultiLevelCache<K, V> {
    private readonly options: {
        L1?: { maxSize: number; ttl: number };
        L2?: { maxSize: number; ttl: number };
        L3?: { maxSize: number; ttl: number };
    };
    private readonly cacheL1 = new Map<K, { value: V; timestamp: number }>();
    private readonly cacheL2 = new Map<K, { value: V; timestamp: number }>();
    private readonly cacheL3 = new Map<K, { value: V; timestamp: number }>();

    constructor(
        options: {
            L1?: { maxSize: number; ttl: number };
            L2?: { maxSize: number; ttl: number };
            L3?: { maxSize: number; ttl: number };
        }
    ) { 
        this.options = options;
    }

    get(key: K): V | undefined {
        const now = Date.now();
        
        // Check L1 cache first
        if (this.options.L1) {
            const item = this.cacheL1.get(key);
            if (item && (now - item.timestamp) < this.options.L1.ttl) {
                return item.value;
            } else if (item) {
                this.cacheL1.delete(key);
            }
        }
        
        // Check L2 cache
        if (this.options.L2) {
            const item = this.cacheL2.get(key);
            if (item && (now - item.timestamp) < this.options.L2.ttl) {
                return item.value;
            } else if (item) {
                this.cacheL2.delete(key);
            }
        }
        
        // Check L3 cache
        if (this.options.L3) {
            const item = this.cacheL3.get(key);
            if (item && (now - item.timestamp) < this.options.L3.ttl) {
                return item.value;
            } else if (item) {
                this.cacheL3.delete(key);
            }
        }
        
        return undefined;
    }

    set(key: K, value: V, level: CacheLevel = CacheLevel.L1): void {
        const timestamp = Date.now();
        const item = { value, timestamp };
        
        switch (level) {
            case CacheLevel.L1:
                if (this.options.L1) {
                    // Check size limit
                    if (this.cacheL1.size >= this.options.L1.maxSize) {
                        // Remove oldest entry
                        const oldestKey = this.cacheL1.keys().next().value;
                        if (oldestKey) this.cacheL1.delete(oldestKey);
                    }
                    this.cacheL1.set(key, item);
                }
                break;
            case CacheLevel.L2:
                if (this.options.L2) {
                    if (this.cacheL2.size >= this.options.L2.maxSize) {
                        const oldestKey = this.cacheL2.keys().next().value;
                        if (oldestKey) this.cacheL2.delete(oldestKey);
                    }
                    this.cacheL2.set(key, item);
                }
                break;
            case CacheLevel.L3:
                if (this.options.L3) {
                    if (this.cacheL3.size >= this.options.L3.maxSize) {
                        const oldestKey = this.cacheL3.keys().next().value;
                        if (oldestKey) this.cacheL3.delete(oldestKey);
                    }
                    this.cacheL3.set(key, item);
                }
                break;
        }
    }
}

// Classes d'analyseurs simulées pour résoudre les dépendances
class TrendAnalyzer {
    analyzeTrends(metrics: LearningMetrics[]): unknown {
        if (metrics.length === 0) {
            return { status: 'no_data' };
        }

        // Analyze trends based on metric values and timestamps
        const performanceMetrics = metrics.filter(m => m.category === 'performance');
        const engagementMetrics = metrics.filter(m => m.category === 'engagement');

        // Simple trend analysis
        const avgPerformance = performanceMetrics.length > 0 
            ? performanceMetrics.reduce((sum, m) => sum + m.value, 0) / performanceMetrics.length
            : 0;

        const avgEngagement = engagementMetrics.length > 0
            ? engagementMetrics.reduce((sum, m) => sum + m.value, 0) / engagementMetrics.length
            : 0;

        const decliningAreas = [];
        const improvingAreas = [];
        const improvementStrategies = [];

        if (avgPerformance < 0.6) {
            decliningAreas.push('performance');
            improvementStrategies.push('Focus on skill reinforcement exercises');
        } else {
            improvingAreas.push('performance');
        }

        if (avgEngagement < 0.5) {
            decliningAreas.push('engagement');
            improvementStrategies.push('Introduce more interactive learning elements');
        } else {
            improvingAreas.push('engagement');
        }

        return {
            decliningAreas,
            improvingAreas,
            improvementStrategies,
            avgPerformance,
            avgEngagement,
            trendsDetected: decliningAreas.length > 0 || improvingAreas.length > 0
        };
    }
}

class LongitudinalAnalyzer {
    analyze(metrics: LearningMetrics[]): unknown {
        if (metrics.length === 0) {
            return { status: 'no_data' };
        }

        // Sort metrics by timestamp to analyze progression over time
        const sortedMetrics = metrics
            .filter(m => m.timestamp)
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

        if (sortedMetrics.length < 2) {
            return { status: 'insufficient_data' };
        }

        // Calculate learning progression
        const firstQuarter = sortedMetrics.slice(0, Math.floor(sortedMetrics.length / 4));
        const lastQuarter = sortedMetrics.slice(-Math.floor(sortedMetrics.length / 4));

        const firstAvg = firstQuarter.reduce((sum, m) => sum + m.value, 0) / firstQuarter.length;
        const lastAvg = lastQuarter.reduce((sum, m) => sum + m.value, 0) / lastQuarter.length;

        const progressionRate = ((lastAvg - firstAvg) / firstAvg) * 100;
        const timeSpan = (sortedMetrics[sortedMetrics.length - 1].timestamp || 0) - (sortedMetrics[0].timestamp || 0);
        const daysPassed = Math.floor(timeSpan / (1000 * 60 * 60 * 24));

        return {
            progressionRate,
            daysPassed,
            initialPerformance: firstAvg,
            currentPerformance: lastAvg,
            dataPoints: sortedMetrics.length,
            trend: progressionRate > 10 ? 'improving' : progressionRate < -10 ? 'declining' : 'stable',
            insights: this.generateLongitudinalInsights(progressionRate, daysPassed)
        };
    }

    private generateLongitudinalInsights(progressionRate: number, daysPassed: number): string[] {
        const insights = [];
        
        if (progressionRate > 20) {
            insights.push('Excellent learning progression detected');
        } else if (progressionRate > 0) {
            insights.push('Steady improvement observed');
        } else if (progressionRate < -20) {
            insights.push('Significant performance decline - intervention needed');
        }

        if (daysPassed > 30) {
            insights.push('Long-term learning data available for comprehensive analysis');
        }

        return insights;
    }
}

class RiskPredictor {
    predictRisks(metrics: LearningMetrics[], timeSeriesData: TimeSeriesData): RiskPrediction[] {
        const risks: RiskPrediction[] = [];

        if (metrics.length === 0) {
            return risks;
        }

        // Analyze performance metrics for risk prediction
        const performanceMetrics = metrics.filter(m => m.category === 'performance');
        const engagementMetrics = metrics.filter(m => m.category === 'engagement');

        // Check for low performance risk
        const avgPerformance = performanceMetrics.length > 0
            ? performanceMetrics.reduce((sum, m) => sum + m.value, 0) / performanceMetrics.length
            : 0;

        if (avgPerformance < 0.4) {
            risks.push({
                type: 'performance_decline',
                probability: 0.8,
                description: 'High risk of performance decline detected',
                mitigationStrategies: [
                    'Implement targeted remedial exercises',
                    'Provide one-on-one tutoring sessions',
                    'Adjust learning pace and difficulty'
                ]
            });
        }

        // Check for engagement risk
        const avgEngagement = engagementMetrics.length > 0
            ? engagementMetrics.reduce((sum, m) => sum + m.value, 0) / engagementMetrics.length
            : 0;

        if (avgEngagement < 0.3) {
            risks.push({
                type: 'low_engagement',
                probability: 0.75,
                description: 'Risk of learner disengagement',
                mitigationStrategies: [
                    'Introduce gamification elements',
                    'Vary learning modalities',
                    'Provide regular feedback and encouragement'
                ]
            });
        }

        // Analyze time series data for pattern risks
        const timeSeriesKeys = Object.keys(timeSeriesData);
        for (const key of timeSeriesKeys) {
            const series = timeSeriesData[key];
            if (series && series.length > 2) {
                const recentValues = series.slice(-3).map(point => point.value);
                const isDecreasingTrend = recentValues.every((val, i) => 
                    i === 0 || val < recentValues[i - 1]
                );

                if (isDecreasingTrend) {
                    risks.push({
                        type: 'negative_trend',
                        probability: 0.6,
                        description: `Declining trend detected in ${key}`,
                        mitigationStrategies: [
                            'Review recent learning activities',
                            'Identify and address knowledge gaps',
                            'Adjust learning objectives'
                        ]
                    });
                }
            }
        }

        return risks;
    }
}

class EngagementAnalyzer {
    analyzeEngagement(metrics: LearningMetrics[]): unknown {
        if (metrics.length === 0) {
            return { level: 0, improvementStrategies: ['No data available for engagement analysis'] };
        }

        // Filter engagement-related metrics
        const engagementMetrics = metrics.filter(m => 
            m.category === 'engagement' || 
            m.metricType.includes('engagement') ||
            m.metricType.includes('interaction')
        );

        // Calculate engagement level
        let engagementLevel = 0.5; // default moderate engagement
        const improvementStrategies: string[] = [];

        if (engagementMetrics.length > 0) {
            engagementLevel = engagementMetrics.reduce((sum, m) => sum + m.value, 0) / engagementMetrics.length;
        }

        // Analyze overall activity frequency
        const recentMetrics = metrics.filter(m => 
            m.timestamp && (Date.now() - m.timestamp) < (7 * 24 * 60 * 60 * 1000) // last 7 days
        );
        
        const activityFrequency = recentMetrics.length / 7; // metrics per day

        // Adjust engagement based on activity frequency
        if (activityFrequency < 1) {
            engagementLevel = Math.min(engagementLevel, 0.4);
            improvementStrategies.push('Increase learning session frequency');
        }

        // Generate improvement strategies based on engagement level
        if (engagementLevel < 0.3) {
            improvementStrategies.push(
                'Introduce gamification elements',
                'Provide immediate feedback',
                'Use multimedia content',
                'Break content into smaller chunks'
            );
        } else if (engagementLevel < 0.6) {
            improvementStrategies.push(
                'Add interactive exercises',
                'Provide progress tracking',
                'Introduce peer collaboration'
            );
        } else if (engagementLevel > 0.8) {
            improvementStrategies.push(
                'Maintain current engagement strategies',
                'Consider advanced challenges'
            );
        }

        // Analyze engagement patterns
        const patterns = this.analyzeEngagementPatterns(metrics);

        return {
            level: Math.round(engagementLevel * 100) / 100,
            improvementStrategies,
            activityFrequency: Math.round(activityFrequency * 100) / 100,
            patterns,
            status: engagementLevel > 0.7 ? 'high' : engagementLevel > 0.4 ? 'moderate' : 'low'
        };
    }

    private analyzeEngagementPatterns(metrics: LearningMetrics[]): unknown {
        const timeBasedMetrics = metrics.filter(m => m.timestamp);
        if (timeBasedMetrics.length < 3) {
            return { status: 'insufficient_data' };
        }

        // Analyze time-of-day patterns
        const hourCounts: { [hour: number]: number } = {};
        timeBasedMetrics.forEach(m => {
            const hour = new Date(m.timestamp!).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        const peakHours = Object.entries(hourCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([hour]) => parseInt(hour));

        return {
            peakEngagementHours: peakHours,
            totalSessions: timeBasedMetrics.length,
            averageSessionsPerDay: timeBasedMetrics.length / 
                Math.max(1, Math.ceil((Date.now() - Math.min(...timeBasedMetrics.map(m => m.timestamp!))) / (24 * 60 * 60 * 1000)))
        };
    }
}

// Utilitaires statistiques et de séries temporelles
const StatisticalUtils = {
    calculateAggregateMetrics(metrics: LearningMetrics[]): PerformanceMetrics {
        if (metrics.length === 0) {
            return {
                overallScore: 0,
                improvementRate: 0,
                consistencyScore: 0,
                topPerformingAreas: [],
                areasNeedingAttention: []
            };
        }

        // Calculate overall score as average of all metrics
        const overallScore = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;

        // Calculate improvement rate using temporal data
        const sortedMetrics = metrics
            .filter(m => m.timestamp)
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

        let improvementRate = 0;
        if (sortedMetrics.length > 1) {
            const firstHalf = sortedMetrics.slice(0, Math.floor(sortedMetrics.length / 2));
            const secondHalf = sortedMetrics.slice(-Math.floor(sortedMetrics.length / 2));
            
            const firstAvg = firstHalf.reduce((sum, m) => sum + m.value, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((sum, m) => sum + m.value, 0) / secondHalf.length;
            
            improvementRate = ((secondAvg - firstAvg) / firstAvg) * 100;
        }

        // Calculate consistency score (lower standard deviation = higher consistency)
        const mean = overallScore;
        const variance = metrics.reduce((sum, m) => sum + Math.pow(m.value - mean, 2), 0) / metrics.length;
        const stdDev = Math.sqrt(variance);
        const consistencyScore = Math.max(0, 1 - (stdDev / mean)); // Normalize to 0-1

        // Identify top performing areas and areas needing attention
        const areaPerformance: { [area: string]: number[] } = {};
        
        metrics.forEach(m => {
            const area = m.category || m.metricType || 'general';
            if (!areaPerformance[area]) {
                areaPerformance[area] = [];
            }
            areaPerformance[area].push(m.value);
        });

        const areaAverages = Object.entries(areaPerformance).map(([area, values]) => ({
            area,
            average: values.reduce((sum, v) => sum + v, 0) / values.length
        }));

        const sortedAreas = areaAverages.sort((a, b) => b.average - a.average);
        const topPerformingAreas = sortedAreas.slice(0, 3).map(a => a.area);
        const areasNeedingAttention = sortedAreas
            .filter(a => a.average < 0.6)
            .slice(-3)
            .map(a => a.area);

        return {
            overallScore: Math.round(overallScore * 100) / 100,
            improvementRate: Math.round(improvementRate * 100) / 100,
            consistencyScore: Math.round(consistencyScore * 100) / 100,
            topPerformingAreas,
            areasNeedingAttention,
            totalMetrics: metrics.length,
            dataQuality: sortedMetrics.length / metrics.length // percentage of metrics with timestamps
        };
    }
};

const TimeSeriesUtils = {
    convertMetricsToTimeSeries(metrics: LearningMetrics[]): TimeSeriesData {
        const timeSeriesData: TimeSeriesData = {};
        
        // Filter metrics with timestamps
        const validMetrics = metrics.filter(m => m.timestamp);
        
        if (validMetrics.length === 0) {
            return timeSeriesData;
        }

        // Group metrics by type/category
        const groupedMetrics: { [key: string]: LearningMetrics[] } = {};
        
        validMetrics.forEach(metric => {
            // Use category if available, otherwise use metricType
            const key = metric.category || metric.metricType || 'general';
            
            if (!groupedMetrics[key]) {
                groupedMetrics[key] = [];
            }
            groupedMetrics[key].push(metric);
        });

        // Convert each group to time series
        Object.entries(groupedMetrics).forEach(([key, metricGroup]) => {
            // Sort by timestamp
            const sortedMetrics = metricGroup.sort((a, b) => 
                (a.timestamp || 0) - (b.timestamp || 0)
            );

            // Convert to time series format
            timeSeriesData[key] = sortedMetrics.map(metric => ({
                timestamp: metric.timestamp || 0,
                value: metric.value
            }));
        });

        // Add aggregated series
        if (validMetrics.length > 1) {
            // Create overall performance time series
            const performanceMetrics = validMetrics.filter(m => 
                m.category === 'performance' || m.metricType.includes('performance')
            );
            
            if (performanceMetrics.length > 0) {
                timeSeriesData['overall_performance'] = performanceMetrics
                    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
                    .map(m => ({ timestamp: m.timestamp || 0, value: m.value }));
            }

            // Create engagement time series
            const engagementMetrics = validMetrics.filter(m => 
                m.category === 'engagement' || m.metricType.includes('engagement')
            );
            
            if (engagementMetrics.length > 0) {
                timeSeriesData['overall_engagement'] = engagementMetrics
                    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
                    .map(m => ({ timestamp: m.timestamp || 0, value: m.value }));
            }
        }

        return timeSeriesData;
    }
};

/**
 * Processes learning analytics data to extract insights, detect patterns,
 * identify risks, and generate recommendations for learners.
 */
export class LearningAnalyticsProcessor {
    private readonly anomalyDetector: IAnomalyDetector;
    private readonly trendAnalyzer: TrendAnalyzer;
    private readonly longitudinalAnalyzer: LongitudinalAnalyzer;
    private readonly riskPredictor: RiskPredictor;
    private readonly engagementAnalyzer: EngagementAnalyzer;
    private readonly metricsCollector: IMetricsCollector;
    private readonly cache: MultiLevelCache<string, LearningAnalyticsResult>;

    constructor(
        anomalyDetector: IAnomalyDetector,
        trendAnalyzer: TrendAnalyzer,
        longitudinalAnalyzer: LongitudinalAnalyzer,
        riskPredictor: RiskPredictor,
        engagementAnalyzer: EngagementAnalyzer,
        metricsCollector: IMetricsCollector
    ) {
        this.anomalyDetector = anomalyDetector;
        this.trendAnalyzer = trendAnalyzer;
        this.longitudinalAnalyzer = longitudinalAnalyzer;
        this.riskPredictor = riskPredictor;
        this.engagementAnalyzer = engagementAnalyzer;
        this.metricsCollector = metricsCollector;

        // Initialize multi-level cache for analytics results
        this.cache = new MultiLevelCache<string, LearningAnalyticsResult>({
            L1: { maxSize: 100, ttl: 300000 }, // 5 minutes in L1
            L2: { maxSize: 1000, ttl: 1800000 }, // 30 minutes in L2
            L3: { maxSize: 5000, ttl: 7200000 } // 2 hours in L3
        });
    }

    /**
     * Process a set of learning metrics to generate comprehensive analytics
     * @param metrics Array of learning metrics to analyze
     * @param userId Optional user ID for caching purposes
     * @param forceRefresh Whether to bypass cache and force recomputation
     */
    public async processMetrics(
        metrics: LearningMetrics[],
        userId?: string,
        forceRefresh = false
    ): Promise<LearningAnalyticsResult> {
        // Generate cache key if userId is provided
        const cacheKey = userId ? `analytics_${userId}_${this.generateMetricsHash(metrics)}` : '';

        // Check cache if userId provided and not forcing refresh
        if (cacheKey && !forceRefresh) {
            const cachedResult = this.cache.get(cacheKey);
            if (cachedResult) {
                this.metricsCollector.recordMetric('learning_analytics.cache_hit', 1);
                return cachedResult;
            }
        }

        this.metricsCollector.recordMetric('learning_analytics.processing_start', 1);
        const processingStart = performance.now();

        try {
            // Convert metrics to time series for analysis
            const timeSeriesData = this.convertToTimeSeries(metrics);

            // Process metrics in parallel for better performance
            const [
                anomaliesData,
                trendsData,
                longitudinalInsightsData,
                riskPredictionsData
            ] = await Promise.all([
                this.detectAnomalies(timeSeriesData),
                this.trendAnalyzer.analyzeTrends(metrics),
                this.longitudinalAnalyzer.analyze(metrics),
                this.riskPredictor.predictRisks(metrics, timeSeriesData)
            ]);

            // Conversions de type explicites - Fix pour l'erreur RiskPrediction[]
            const anomalies = anomaliesData as AnomalyData[];
            const trends = trendsData;
            const longitudinalInsights = longitudinalInsightsData;
            // Ici nous utilisons une conversion de type plus stricte
            const riskPredictions = Array.isArray(riskPredictionsData)
                ? riskPredictionsData as RiskPrediction[]
                : [] as RiskPrediction[];

            // Calculate engagement metrics
            const engagementMetrics = this.engagementAnalyzer.analyzeEngagement(metrics);

            // Generate recommendations based on all insights
            const recommendations = this.generateRecommendations(
                riskPredictions,
                trends,
                longitudinalInsights,
                engagementMetrics
            );

            // Calculate performance metrics
            const performanceMetrics = this.calculatePerformanceMetrics(metrics);

            // Assemble final result
            const result: LearningAnalyticsResult = {
                anomalies,
                trends,
                longitudinalInsights,
                riskPredictions,
                engagementMetrics,
                recommendations,
                performanceMetrics,
                timestamp: Date.now(),
                processingTimeMs: performance.now() - processingStart
            };

            // Cache result if userId is provided
            if (cacheKey) {
                const cacheLevel = this.determineCacheLevel(metrics);
                this.cache.set(cacheKey, result, cacheLevel);
            }

            this.metricsCollector.recordMetric('learning_analytics.processing_success', 1);
            this.metricsCollector.recordMetric('learning_analytics.processing_time_ms', performance.now() - processingStart);

            return result;
        } catch (error) {
            this.metricsCollector.recordMetric('learning_analytics.processing_error', 1);
            throw error;
        }
    }

    /**
     * Converts learning metrics to time series data for analysis
     */
    private convertToTimeSeries(metrics: LearningMetrics[]): TimeSeriesData {
        return TimeSeriesUtils.convertMetricsToTimeSeries(metrics);
    }

    /**
     * Detects anomalies in the time series data
     */
    private async detectAnomalies(timeSeriesData: TimeSeriesData): Promise<AnomalyData[]> {
        return this.anomalyDetector.detectAnomalies(timeSeriesData);
    }

    /**
     * Generates recommendations based on insights from various analyses
     */
    private generateRecommendations(
        risks: RiskPrediction[],
        trends: unknown,
        longitudinalInsights: unknown,
        engagementMetrics: unknown
    ): Recommendation[] {
        // Combine insights from all analyses to generate targeted recommendations
        const recommendations: Recommendation[] = [];

        // Handle risk-based recommendations
        for (const risk of risks) {
            if (risk.probability > 0.7) {
                recommendations.push({
                    id: `risk_${risk.type}_${Date.now()}`,
                    type: 'risk_mitigation',
                    priority: 'high',
                    description: `Address high risk area: ${risk.description}`,
                    suggestedActions: risk.mitigationStrategies,
                    relevanceScore: risk.probability
                });
            }
        }

        // Add trend-based recommendations
        const typedTrends = trends as { decliningAreas?: string[]; improvementStrategies?: string[] };
        if (typedTrends.decliningAreas && typedTrends.decliningAreas.length > 0) {
            recommendations.push({
                id: `trend_decline_${Date.now()}`,
                type: 'trend_reversal',
                priority: 'medium',
                description: 'Address declining performance trends',
                suggestedActions: typedTrends.improvementStrategies || [],
                relevanceScore: 0.8
            });
        }

        // Add engagement-based recommendations
        const typedEngagement = engagementMetrics as { level: number; improvementStrategies?: string[] };
        if (typedEngagement.level < 0.4) {
            recommendations.push({
                id: `engagement_low_${Date.now()}`,
                type: 'engagement_boost',
                priority: 'high',
                description: 'Improve learner engagement',
                suggestedActions: typedEngagement.improvementStrategies || [],
                relevanceScore: 0.9
            });
        }

        // Add longitudinal insights-based recommendations
        const typedLongitudinal = longitudinalInsights as { 
            progressionRate?: number; 
            trend?: string; 
            insights?: string[] 
        };
        
        if (typedLongitudinal.progressionRate !== undefined) {
            if (typedLongitudinal.progressionRate < -10) {
                recommendations.push({
                    id: `longitudinal_decline_${Date.now()}`,
                    type: 'performance_intervention',
                    priority: 'high',
                    description: 'Address declining performance trend over time',
                    suggestedActions: [
                        'Review learning objectives and adjust difficulty',
                        'Provide additional support and resources',
                        'Consider personalized learning path'
                    ],
                    relevanceScore: 0.85
                });
            } else if (typedLongitudinal.progressionRate > 20) {
                recommendations.push({
                    id: `longitudinal_excellent_${Date.now()}`,
                    type: 'advanced_challenge',
                    priority: 'medium',
                    description: 'Maintain excellent progression with advanced challenges',
                    suggestedActions: [
                        'Introduce advanced topics',
                        'Consider accelerated learning path',
                        'Provide leadership opportunities'
                    ],
                    relevanceScore: 0.75
                });
            }
        }

        return recommendations;
    }

    /**
     * Calculates aggregated performance metrics from raw learning metrics
     */
    private calculatePerformanceMetrics(metrics: LearningMetrics[]): PerformanceMetrics {
        return StatisticalUtils.calculateAggregateMetrics(metrics);
    }

    /**
     * Determines the appropriate cache level based on metrics
     */
    private determineCacheLevel(metrics: LearningMetrics[]): CacheLevel {
        // Determine cache level based on metrics characteristics
        const metricCount = metrics.length;
        const hasRecentMetrics = metrics.some(m => 
            m.timestamp && (Date.now() - m.timestamp) < 300000 // 5 minutes
        );
        const hasHighPriorityMetrics = metrics.some(m => 
            m.category === 'performance' || m.category === 'engagement'
        );

        // High-frequency, recent, or high-priority metrics go to L1
        if (hasRecentMetrics || hasHighPriorityMetrics || metricCount < 10) {
            return CacheLevel.L1;
        }
        
        // Medium-sized datasets go to L2
        if (metricCount < 100) {
            return CacheLevel.L2;
        }
        
        // Large datasets go to L3
        return CacheLevel.L3;
    }

    /**
     * Generates a hash for metrics array to use in cache keys
     */
    private generateMetricsHash(metrics: LearningMetrics[]): string {
        // Simple hash function - in production this would be more sophisticated
        const latestTimestamp = Math.max(...metrics.map(m => m.timestamp || 0));
        const count = metrics.length;
        return `${latestTimestamp}_${count}`;
    }
}