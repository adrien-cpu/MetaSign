/**
 * src/ai/api/distributed/aggregation/aggregators/MetadataAggregator.ts
 * 
 * Agrégateur de métadonnées de modèle qui calcule et combine les informations
 * de performance et de distribution.
 */

import {
    NodeTrainingResult,
    AggregatedModelMetadata
} from '../../types/DistributedTypes';
import {
    AggregationStrategy,
    DistributionMetrics
} from '../types/aggregation.types';

/**
 * Responsable de l'agrégation des métadonnées du modèle
 */
export class MetadataAggregator {
    /**
     * Agrège les métadonnées de tous les modèles contributeurs
     * 
     * @param results - Résultats d'entraînement des nœuds
     * @param weights - Poids de contribution des nœuds
     * @param strategy - Stratégie d'agrégation utilisée
     * @returns Métadonnées de modèle agrégées
     */
    public aggregateMetadata(
        results: NodeTrainingResult[],
        weights: Map<string, number>,
        strategy: AggregationStrategy
    ): AggregatedModelMetadata {
        // Extraire les nœuds contributeurs (ceux avec un poids > 0)
        const contributors = Array.from(weights.entries())
            .filter(([, weight]) => weight > 0)
            .map(([nodeId]) => nodeId);

        // Calculer les statistiques d'accuracy et loss
        const performanceStats = this.calculatePerformanceStats(results);

        // Calculer les statistiques du jeu de données
        const datasetStats = this.calculateDatasetStats(results);

        return {
            timestamp: Date.now(),
            version: this.generateVersion(results, strategy),
            contributors,
            aggregationMethod: strategy,
            performanceEstimate: {
                accuracy: performanceStats.avgAccuracy,
                loss: performanceStats.avgLoss,
                convergence: this.estimateConvergence(results)
            },
            datasetInfo: {
                totalSamples: datasetStats.totalSamples,
                avgSamplesPerNode: datasetStats.avgSamplesPerNode,
                distributionMetrics: this.calculateDistributionMetrics(results)
            }
        };
    }

    /**
     * Calcule les statistiques de performance à partir des résultats
     */
    private calculatePerformanceStats(results: NodeTrainingResult[]): {
        avgAccuracy: number;
        avgLoss: number;
    } {
        const accuracySum = results.reduce((sum, result) => sum + result.accuracy, 0);
        const lossSum = results.reduce((sum, result) => sum + result.loss, 0);

        return {
            avgAccuracy: accuracySum / results.length,
            avgLoss: lossSum / results.length
        };
    }

    /**
     * Calcule les statistiques sur les données d'entraînement
     */
    private calculateDatasetStats(results: NodeTrainingResult[]): {
        totalSamples: number;
        avgSamplesPerNode: number;
    } {
        const totalSamples = results.reduce((sum, result) => sum + result.samplesProcessed, 0);

        return {
            totalSamples,
            avgSamplesPerNode: totalSamples / results.length
        };
    }

    /**
     * Génère une chaîne de version pour le modèle agrégé
     */
    private generateVersion(results: NodeTrainingResult[], strategy: AggregationStrategy): string {
        // Prendre la version de base du premier modèle
        const baseVersion = results[0].modelVersion;

        // Ajouter horodatage, stratégie et nombre de nœuds
        return `${baseVersion}-${strategy}-${results.length}-${Date.now()}`;
    }

    /**
     * Estime la convergence du modèle en fonction des valeurs de perte
     */
    private estimateConvergence(results: NodeTrainingResult[]): number {
        // Estimation simple de la convergence basée sur la perte moyenne
        // Une perte plus faible signifie une convergence plus élevée
        const avgLoss = results.reduce((sum, result) => sum + result.loss, 0) / results.length;

        // Mapper la perte à une échelle 0-1 où 0 est une perte élevée et 1 est une perte faible
        // En supposant que les valeurs de perte typiques vont de 0 à 5
        return Math.max(0, Math.min(1, 1 - (avgLoss / 5)));
    }

    /**
     * Calcule les métriques de distribution pour les données d'entraînement
     */
    private calculateDistributionMetrics(results: NodeTrainingResult[]): DistributionMetrics {
        // Extraire les nombres d'échantillons
        const sampleCounts = results.map(r => r.samplesProcessed);

        // Calculer le coefficient de Gini pour la distribution des données
        const gini = this.calculateGiniCoefficient(sampleCounts);

        // Calculer le coefficient de variation
        const mean = sampleCounts.reduce((sum, count) => sum + count, 0) / sampleCounts.length;
        const variance = sampleCounts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / sampleCounts.length;
        const stdDev = Math.sqrt(variance);
        const cv = mean > 0 ? stdDev / mean : 0;

        return {
            giniCoefficient: gini,
            coefficientOfVariation: cv,
            minSamples: Math.min(...sampleCounts),
            maxSamples: Math.max(...sampleCounts),
            avgSamples: mean
        };
    }

    /**
     * Calcule le coefficient de Gini pour l'analyse de distribution
     */
    private calculateGiniCoefficient(values: number[]): number {
        // Trier les valeurs
        const sorted = [...values].sort((a, b) => a - b);
        const n = sorted.length;

        if (n === 0 || sorted.every(v => v === 0)) return 0;

        // Calculer le coefficient de Gini
        let sumNumerator = 0;
        for (let i = 0; i < n; i++) {
            sumNumerator += sorted[i] * (i + 1);
        }

        const sumValues = sorted.reduce((sum, val) => sum + val, 0);
        return (2 * sumNumerator) / (n * sumValues) - (n + 1) / n;
    }
}