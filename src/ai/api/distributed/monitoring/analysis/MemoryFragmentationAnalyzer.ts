/**
 * @file src/ai/api/distributed/monitoring/analysis/MemoryFragmentationAnalyzer.ts
 * Analyseur de fragmentation mémoire
 * Détecte les problèmes de fragmentation dans le tas (heap)
 */
import { MemoryMetrics } from '../types/memory.types';
import { FragmentationReport } from '../types/performance.types';
import { Logger } from '@common/monitoring/LogService';

/**
 * Paramètres pour l'analyse de fragmentation
 */
export interface FragmentationAnalysisParams {
    /** Utilisation actuelle du tas */
    heapUsed: number;
    /** Taille totale du tas */
    heapTotal: number;
    /** Échantillons historiques pour l'analyse de tendance */
    samples?: ReadonlyArray<MemoryMetrics>;
}

/**
 * Niveau de sévérité de la fragmentation
 */
export type FragmentationSeverity = 'low' | 'medium' | 'high';

/**
 * Analyseur de fragmentation mémoire
 */
export class MemoryFragmentationAnalyzer {
    private readonly logger: Logger;

    constructor() {
        this.logger = new Logger('MemoryFragmentationAnalyzer');
    }

    /**
     * Analyse la fragmentation du tas
     * @param params Paramètres d'analyse
     * @returns Rapport de fragmentation
     */
    public async analyze(params: FragmentationAnalysisParams): Promise<FragmentationReport> {
        this.logger.debug('Analyzing memory fragmentation');

        // Calculer le ratio de fragmentation
        const fragRatio = params.heapTotal > 0 ?
            (params.heapTotal - params.heapUsed) / params.heapTotal : 0;

        // Analyser la tendance si des échantillons sont fournis
        const samples = params.samples || [];
        const trend = samples.length >= 5 ? this.analyzeTrend(samples) : 'stable';

        // Déterminer la sévérité
        const severity = this.determineSeverity(fragRatio, trend);

        // Créer le rapport
        return {
            timestamp: Date.now(),
            fragmentationRatio: fragRatio,
            fragmentationDetected: fragRatio > 0.3, // 30% de fragmentation ou plus
            severity,
            trend,
            heapDetails: {
                totalBytes: params.heapTotal,
                usedBytes: params.heapUsed,
                wastedBytes: params.heapTotal - params.heapUsed
            },
            recommendations: this.getRecommendations(severity, trend)
        };
    }

    /**
     * Analyse la tendance de fragmentation
     * @param samples Échantillons historiques
     * @returns Tendance de fragmentation
     */
    private analyzeTrend(samples: ReadonlyArray<MemoryMetrics>): 'increasing' | 'decreasing' | 'stable' {
        if (samples.length < 5) return 'stable';

        // Calculer les ratios de fragmentation pour chaque échantillon
        const ratios = samples.map(sample => {
            const total = sample.process.heapTotal;
            const used = sample.process.heapUsed;
            return total > 0 ? (total - used) / total : 0;
        });

        // Calculer la pente de la tendance linéaire
        const n = ratios.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

        for (let i = 0; i < n; i++) {
            const x = i; // Index comme variable indépendante
            const y = ratios[i];

            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        }

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

        // Interpréter la pente
        if (Math.abs(slope) < 0.01) {
            return 'stable';
        } else if (slope > 0) {
            return 'increasing';
        } else {
            return 'decreasing';
        }
    }

    /**
     * Détermine la sévérité de la fragmentation
     * @param ratio Ratio de fragmentation
     * @param trend Tendance de fragmentation
     * @returns Niveau de sévérité
     */
    private determineSeverity(ratio: number, trend: 'increasing' | 'decreasing' | 'stable'): FragmentationSeverity {
        if (ratio >= 0.5 && trend === 'increasing') {
            return 'high';
        } else if (ratio >= 0.5 || (ratio >= 0.3 && trend === 'increasing')) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Génère des recommandations selon la sévérité et la tendance
     * @param severity Niveau de sévérité
     * @param trend Tendance de fragmentation
     * @returns Liste de recommandations
     */
    private getRecommendations(
        severity: FragmentationSeverity,
        trend: 'increasing' | 'decreasing' | 'stable'
    ): string[] {
        const recommendations: string[] = [];

        if (severity === 'high') {
            recommendations.push('Consider restarting the application to reclaim memory');
            recommendations.push('Review memory allocation patterns to reduce fragmentation');
        }

        if (severity === 'medium' || severity === 'high') {
            recommendations.push('Consider implementing memory compaction if applicable');
            recommendations.push('Monitor heap usage more frequently');
        }

        if (trend === 'increasing') {
            recommendations.push('Monitor the trend closely as fragmentation is increasing');
            if (severity !== 'low') {
                recommendations.push('Investigate recent changes that might cause increased fragmentation');
            }
        }

        if (recommendations.length === 0) {
            recommendations.push('No immediate action needed, fragmentation is within acceptable limits');
        }

        return recommendations;
    }
}