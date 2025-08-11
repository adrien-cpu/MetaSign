// src/ai/api/distributed/monitoring/optimization/CacheOptimizer.ts

import { Logger } from '@ai/utils/Logger';

// Types pour le système de cache
export interface CacheMetrics {
    hitCount: number;
    missCount: number;
    evictionCount: number;
    totalRequestCount: number;
    totalSize: number;
    averageAccessTime: number;
    ageDistribution: Record<string, number>;
    keySizeDistribution: Record<string, number>;
    coldKeys: string[];
    hotKeys: string[];
}

export interface CacheAnalysis {
    hitRate: number;
    evictionRate: number;
    hotKeys: string[];
    coldKeys: string[];
    averageAccessTime: number;
    ageDistribution: Record<string, number>;
    keySizeDistribution: Record<string, number>;
    metrics: CacheMetrics;
    performanceImpact: number;
}

export enum CacheEvictionStrategy {
    LRU = 'lru',
    LFU = 'lfu',
    FIFO = 'fifo',
    ADAPTIVE = 'adaptive',
    WEIGHTED = 'weighted'
}

export interface CacheOptimizationResult {
    optimizationApplied: boolean;
    recommendedStrategy: CacheEvictionStrategy;
    recommendedSize: number;
    preloadKeys: string[];
    evictKeys: string[];
    expectedHitRateImprovement: number;
    recommendations: string[];
}

/**
 * Classe utilitaire pour gérer le buffer de métriques du cache
 */
class MetricsBuffer {
    private readonly bufferSize: number;
    private metricsBuffer: CacheMetrics[];
    private currentIndex: number;

    constructor(bufferSize = 100) {
        this.bufferSize = bufferSize;
        this.metricsBuffer = [];
        this.currentIndex = 0;
    }

    /**
     * Ajoute une métrique au buffer
     * @param metrics Métrique à ajouter
     */
    public add(metrics: CacheMetrics): void {
        if (this.metricsBuffer.length < this.bufferSize) {
            this.metricsBuffer.push(metrics);
        } else {
            this.metricsBuffer[this.currentIndex] = metrics;
            this.currentIndex = (this.currentIndex + 1) % this.bufferSize;
        }
    }

    /**
     * Récupère toutes les métriques du buffer
     */
    public getAll(): CacheMetrics[] {
        return [...this.metricsBuffer];
    }

    /**
     * Récupère les N dernières métriques
     */
    public getLast(count: number): CacheMetrics[] {
        const length = this.metricsBuffer.length;
        if (length === 0) return [];

        count = Math.min(count, length);
        const startIndex = (this.currentIndex - count + length) % length;

        if (startIndex < this.currentIndex) {
            return [...this.metricsBuffer.slice(startIndex, this.currentIndex)];
        } else {
            return [
                ...this.metricsBuffer.slice(startIndex),
                ...this.metricsBuffer.slice(0, this.currentIndex)
            ];
        }
    }

    /**
     * Vide le buffer
     */
    public clear(): void {
        this.metricsBuffer = [];
        this.currentIndex = 0;
    }
}

/**
 * Fabrique pour créer des stratégies d'éviction
 */
class StrategyFactory {
    /**
     * Crée une stratégie d'éviction basée sur l'analyse du cache
     */
    public createStrategy(analysis: CacheAnalysis): CacheEvictionStrategy {
        if (!analysis) {
            return CacheEvictionStrategy.LRU;
        }

        // Si le taux de hit est très élevé, la stratégie actuelle fonctionne bien
        if (analysis.hitRate > 0.85) {
            return CacheEvictionStrategy.ADAPTIVE;
        }

        // Si les accès sont très inégaux (certaines clés sont très chaudes)
        if (analysis.hotKeys.length > 0 && analysis.hotKeys.length < 20) {
            return CacheEvictionStrategy.WEIGHTED;
        }

        // Si les évictions sont fréquentes, utiliser LFU
        if (analysis.evictionRate > 0.2) {
            return CacheEvictionStrategy.LFU;
        }

        // Par défaut, utiliser LRU
        return CacheEvictionStrategy.LRU;
    }
}

/**
 * Optimiseur de cache intelligent pour améliorer les performances du système
 * Analyse et optimise l'utilisation du cache pour maximiser les taux de succès.
 */
export class CacheOptimizer {
    private readonly logger: Logger;
    private readonly metricsBuffer: MetricsBuffer;
    private readonly strategyFactory: StrategyFactory;
    private readonly analysisInterval: number;
    private readonly minSampleSize: number;
    private analysisTimer: NodeJS.Timeout | null;
    private isAnalyzing: boolean;

    /**
     * Crée un nouvel optimiseur de cache
     * @param analysisInterval Intervalle entre les analyses (ms)
     * @param bufferSize Taille du buffer de métriques
     * @param minSampleSize Nombre minimum d'échantillons pour l'analyse
     */
    constructor(
        analysisInterval = 60000,
        bufferSize = 100,
        minSampleSize = 30
    ) {
        this.logger = new Logger('CacheOptimizer');
        this.metricsBuffer = new MetricsBuffer(bufferSize);
        this.strategyFactory = new StrategyFactory();
        this.analysisInterval = analysisInterval;
        this.minSampleSize = minSampleSize;
        this.analysisTimer = null;
        this.isAnalyzing = false;

        this.logger.info(`Cache optimizer initialized with analysis interval: ${analysisInterval}ms`);
    }

    /**
     * Démarre l'analyse périodique du cache
     */
    public startPeriodicAnalysis(): void {
        if (this.analysisTimer) {
            this.stopPeriodicAnalysis();
        }

        this.analysisTimer = setInterval(() => {
            this.analyzeCache().catch(error => {
                this.logger.error('Error during periodic cache analysis:', error);
            });
        }, this.analysisInterval);

        this.logger.info(`Started periodic cache analysis every ${this.analysisInterval}ms`);
    }

    /**
     * Arrête l'analyse périodique du cache
     */
    public stopPeriodicAnalysis(): void {
        if (this.analysisTimer) {
            clearInterval(this.analysisTimer);
            this.analysisTimer = null;
            this.logger.info('Stopped periodic cache analysis');
        }
    }

    /**
     * Ajoute des métriques à analyser
     * @param metrics Métriques du cache
     */
    public addMetrics(metrics: CacheMetrics): void {
        this.metricsBuffer.add(metrics);
    }

    /**
     * Analyse les performances du cache
     * @returns Analyse du cache
     */
    public async analyzeCache(): Promise<CacheAnalysis> {
        if (this.isAnalyzing) {
            this.logger.debug('Analysis already in progress, skipping');
            return this.createDefaultAnalysis();
        }

        this.isAnalyzing = true;

        try {
            const metrics = this.metricsBuffer.getAll();

            if (metrics.length < this.minSampleSize) {
                this.logger.debug(`Not enough samples for analysis: ${metrics.length}/${this.minSampleSize}`);
                this.isAnalyzing = false;
                return this.createDefaultAnalysis();
            }

            this.logger.debug(`Analyzing cache performance with ${metrics.length} samples`);

            // Calculer les métriques agrégées
            let totalHits = 0;
            let totalMisses = 0;
            let totalEvictions = 0;
            let totalRequests = 0;
            // On utilise cette variable pour décider de la taille recommandée du cache
            let maxObservedSize = 0;
            let totalAccessTime = 0;

            // Maps pour suivre les clés chaudes et froides
            const keyAccessCount: Record<string, number> = {};
            const keySizes: Record<string, number> = {};
            const keyAges: Record<string, number> = {};

            // Agréger les données
            for (const metric of metrics) {
                totalHits += metric.hitCount;
                totalMisses += metric.missCount;
                totalEvictions += metric.evictionCount;
                totalRequests += metric.totalRequestCount;
                maxObservedSize = Math.max(maxObservedSize, metric.totalSize);
                totalAccessTime += metric.averageAccessTime * metric.totalRequestCount;

                // Agréger les distributions
                this.aggregateDistribution(keyAges, metric.ageDistribution);
                this.aggregateDistribution(keySizes, metric.keySizeDistribution);

                // Suivre les accès aux clés
                for (const key of metric.hotKeys) {
                    keyAccessCount[key] = (keyAccessCount[key] || 0) + 2;
                }

                for (const key of metric.coldKeys) {
                    keyAccessCount[key] = (keyAccessCount[key] || 0) - 1;
                }
            }

            // Calculer les taux
            const hitRate = totalRequests > 0 ? totalHits / totalRequests : 0;
            const evictionRate = totalRequests > 0 ? totalEvictions / totalRequests : 0;
            const averageAccessTime = totalRequests > 0 ? totalAccessTime / totalRequests : 0;

            // Identifier les clés chaudes et froides
            const keyEntries = Object.entries(keyAccessCount);
            keyEntries.sort((a, b) => b[1] - a[1]);

            const hotKeys = keyEntries
                .filter(([, count]) => count > 5)
                .slice(0, 20)
                .map(([key]) => key);

            const coldKeys = keyEntries
                .filter(([, count]) => count < -2)
                .slice(0, 20)
                .map(([key]) => key);

            // Estimation de l'impact sur les performances
            const performanceImpact = totalRequests > 0
                ? (totalMisses * 10 + totalHits * 0.1) / totalRequests
                : 0;

            const analysis: CacheAnalysis = {
                hitRate,
                evictionRate,
                hotKeys,
                coldKeys,
                averageAccessTime,
                ageDistribution: this.normalizeDistribution(keyAges),
                keySizeDistribution: this.normalizeDistribution(keySizes),
                metrics: this.aggregateMetrics(metrics),
                performanceImpact
            };

            this.logger.info(`Cache analysis complete. Hit rate: ${hitRate.toFixed(2)}, Eviction rate: ${evictionRate.toFixed(2)}`);

            return analysis;
        } catch (error) {
            this.logger.error('Error analyzing cache:', error);
            return this.createDefaultAnalysis();
        } finally {
            this.isAnalyzing = false;
        }
    }

    /**
     * Optimise le cache en fonction de l'analyse
     * @param analysis Analyse du cache
     * @returns Résultat de l'optimisation
     */
    public async optimizeCache(analysis?: CacheAnalysis): Promise<CacheOptimizationResult> {
        const validAnalysis = analysis ?? await this.analyzeCache();

        // Résultat par défaut
        const result: CacheOptimizationResult = {
            optimizationApplied: false,
            recommendedStrategy: CacheEvictionStrategy.LRU,
            recommendedSize: 0,
            preloadKeys: [],
            evictKeys: [],
            expectedHitRateImprovement: 0,
            recommendations: []
        };

        // Si le taux de hit est déjà élevé, pas besoin d'optimiser
        if (validAnalysis.hitRate > 0.9) {
            result.recommendations.push('Cache already performing well, no optimization needed');
            return result;
        }

        // Déterminer la stratégie d'éviction recommandée
        result.recommendedStrategy = this.strategyFactory.createStrategy(validAnalysis);
        result.recommendations.push(`Recommended eviction strategy: ${result.recommendedStrategy}`);

        // Gérer les clés chaudes et froides
        if (validAnalysis.hotKeys.length > 0) {
            result.preloadKeys = validAnalysis.hotKeys.slice(0, 10);
            result.recommendations.push(`Preload ${result.preloadKeys.length} hot keys to improve hit rate`);
        }

        if (validAnalysis.coldKeys.length > 0) {
            result.evictKeys = validAnalysis.coldKeys.slice(0, 10);
            result.recommendations.push(`Consider evicting ${result.evictKeys.length} cold keys to free up space`);
        }

        // Estimer la taille recommandée du cache
        const currentSize = validAnalysis.metrics.totalSize;
        if (validAnalysis.evictionRate > 0.1) {
            // Si le taux d'éviction est élevé, augmenter la taille du cache
            result.recommendedSize = Math.ceil(currentSize * 1.5);
            result.recommendations.push(`Consider increasing cache size to ${result.recommendedSize} (currently ${currentSize})`);
        } else if (validAnalysis.evictionRate < 0.01 && validAnalysis.hitRate < 0.7) {
            // Si le taux d'éviction est faible mais le taux de hit aussi, réduire légèrement la taille
            result.recommendedSize = Math.ceil(currentSize * 0.9);
            result.recommendations.push(`Consider decreasing cache size to ${result.recommendedSize} to improve efficiency`);
        } else {
            result.recommendedSize = currentSize;
        }

        // Estimer l'amélioration du taux de hit
        result.expectedHitRateImprovement = this.estimateHitRateImprovement(validAnalysis, result);

        // Marquer comme appliqué si des recommandations ont été faites
        result.optimizationApplied = result.recommendations.length > 0;

        this.logger.info(`Cache optimization complete: ${result.recommendations.length} recommendations`);

        return result;
    }

    /**
     * Estime l'amélioration du taux de hit après optimisation
     */
    private estimateHitRateImprovement(
        analysis: CacheAnalysis,
        optimization: CacheOptimizationResult
    ): number {
        // Estimation simplifiée
        let improvement = 0;

        // Impact de la stratégie d'éviction
        if (optimization.recommendedStrategy !== CacheEvictionStrategy.LRU) {
            improvement += 0.05;
        }

        // Impact du préchargement des clés chaudes
        if (optimization.preloadKeys.length > 0) {
            improvement += 0.02 * Math.min(optimization.preloadKeys.length / 5, 1);
        }

        // Impact de l'éviction des clés froides
        if (optimization.evictKeys.length > 0) {
            improvement += 0.01 * Math.min(optimization.evictKeys.length / 10, 1);
        }

        // Impact de la taille du cache
        const sizeChange = optimization.recommendedSize / analysis.metrics.totalSize;
        if (sizeChange > 1) {
            improvement += 0.03 * Math.min((sizeChange - 1), 1);
        }

        // Normaliser l'amélioration
        const currentHitRate = analysis.hitRate;
        const potentialImprovement = 1 - currentHitRate;
        improvement = Math.min(improvement, potentialImprovement * 0.8);

        return Number(improvement.toFixed(4));
    }

    /**
     * Crée une analyse par défaut
     */
    private createDefaultAnalysis(): CacheAnalysis {
        return {
            hitRate: 0,
            evictionRate: 0,
            hotKeys: [],
            coldKeys: [],
            averageAccessTime: 0,
            ageDistribution: {},
            keySizeDistribution: {},
            metrics: {
                hitCount: 0,
                missCount: 0,
                evictionCount: 0,
                totalRequestCount: 0,
                totalSize: 0,
                averageAccessTime: 0,
                ageDistribution: {},
                keySizeDistribution: {},
                coldKeys: [],
                hotKeys: []
            },
            performanceImpact: 0
        };
    }

    /**
     * Agrège les distributions
     */
    private aggregateDistribution(
        target: Record<string, number>,
        source: Record<string, number>
    ): void {
        for (const [key, value] of Object.entries(source)) {
            target[key] = (target[key] || 0) + value;
        }
    }

    /**
     * Normalise une distribution
     */
    private normalizeDistribution(distribution: Record<string, number>): Record<string, number> {
        const result: Record<string, number> = {};
        const total = Object.values(distribution).reduce((sum, value) => sum + value, 0);

        if (total === 0) {
            return result;
        }

        for (const [key, value] of Object.entries(distribution)) {
            result[key] = value / total;
        }

        return result;
    }

    /**
     * Agrège les métriques
     */
    private aggregateMetrics(metrics: CacheMetrics[]): CacheMetrics {
        if (metrics.length === 0) {
            return this.createEmptyMetrics();
        }

        const result: CacheMetrics = this.createEmptyMetrics();

        for (const metric of metrics) {
            result.hitCount += metric.hitCount;
            result.missCount += metric.missCount;
            result.evictionCount += metric.evictionCount;
            result.totalRequestCount += metric.totalRequestCount;
            result.totalSize = Math.max(result.totalSize, metric.totalSize);

            // Pondérer le temps d'accès moyen
            if (metric.totalRequestCount > 0) {
                result.averageAccessTime =
                    (result.averageAccessTime * result.totalRequestCount +
                        metric.averageAccessTime * metric.totalRequestCount) /
                    (result.totalRequestCount + metric.totalRequestCount || 1);
            }

            // Agréger distributions
            this.aggregateDistribution(result.ageDistribution, metric.ageDistribution);
            this.aggregateDistribution(result.keySizeDistribution, metric.keySizeDistribution);

            // Collecter les clés chaudes/froides uniques
            for (const key of metric.hotKeys) {
                if (!result.hotKeys.includes(key)) {
                    result.hotKeys.push(key);
                }
            }

            for (const key of metric.coldKeys) {
                if (!result.coldKeys.includes(key)) {
                    result.coldKeys.push(key);
                }
            }
        }

        // Limiter la taille des tableaux
        result.hotKeys = result.hotKeys.slice(0, 50);
        result.coldKeys = result.coldKeys.slice(0, 50);

        return result;
    }

    /**
     * Crée des métriques vides
     */
    private createEmptyMetrics(): CacheMetrics {
        return {
            hitCount: 0,
            missCount: 0,
            evictionCount: 0,
            totalRequestCount: 0,
            totalSize: 0,
            averageAccessTime: 0,
            ageDistribution: {},
            keySizeDistribution: {},
            hotKeys: [],
            coldKeys: []
        };
    }
}