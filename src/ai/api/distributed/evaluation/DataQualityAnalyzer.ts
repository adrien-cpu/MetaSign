// src/ai/api/distributed/evaluation/DataQualityAnalyzer.ts
import {
    TrainingData,
    DataQualityMetrics,
    ConsistencyResult,
    DistributionResult,
    BiasResult,
    QualityIssue,
    QualityRecommendation
} from './types';
import { ConsistencyChecker } from './ConsistencyChecker';
import { DistributionAnalyzer } from './DistributionAnalyzer';
import { BiasDetector } from './BiasDetector';

/**
 * Classe responsable de l'analyse complète de la qualité des données
 */
export class DataQualityAnalyzer {
    private readonly consistencyChecker: ConsistencyChecker;
    private readonly distributionAnalyzer: DistributionAnalyzer;
    private readonly biasDetector: BiasDetector;

    /**
     * Constructeur
     */
    constructor() {
        this.consistencyChecker = new ConsistencyChecker();
        this.distributionAnalyzer = new DistributionAnalyzer();
        this.biasDetector = new BiasDetector();
    }

    /**
     * Analyse la qualité globale des données d'entraînement
     * @param data Données d'entraînement à analyser
     * @returns Métriques de qualité des données
     */
    async analyzeQuality(data: TrainingData): Promise<DataQualityMetrics> {
        // Exécuter les différentes analyses
        const consistency = await this.consistencyChecker.check(data);
        const distribution = await this.distributionAnalyzer.analyze(data);
        const bias = await this.biasDetector.detect(data);

        // Assembler les résultats
        return {
            score: this.calculateQualityScore(consistency, distribution, bias),
            issues: this.identifyQualityIssues(consistency, bias),
            recommendations: this.generateRecommendations({
                consistency,
                distribution,
                bias
            })
        };
    }

    /**
     * Calcule le score global de qualité des données
     * @param consistency Résultats de vérification de cohérence
     * @param distribution Résultats d'analyse de distribution
     * @param bias Résultats de détection de biais
     * @returns Score global de qualité (0-1)
     */
    private calculateQualityScore(
        consistency: ConsistencyResult,
        distribution: DistributionResult,
        bias: BiasResult
    ): number {
        // Pondération des différentes composantes
        const weights = {
            consistency: 0.4, // La cohérence est la plus importante
            distribution: 0.3,
            bias: 0.3
        };

        // Calculer le score pondéré
        const weightedScore =
            consistency.score * weights.consistency +
            distribution.score * weights.distribution +
            bias.score * weights.bias;

        // Normaliser entre 0 et 1
        return Math.max(0, Math.min(1, weightedScore));
    }

    /**
     * Identifie tous les problèmes de qualité des données
     * @param consistency Résultats de vérification de cohérence
     * @param bias Résultats de détection de biais
     * @returns Liste des problèmes de qualité
     */
    private identifyQualityIssues(
        consistency: ConsistencyResult,
        bias: BiasResult
    ): QualityIssue[] {
        const issues: QualityIssue[] = [];

        // Ajouter les problèmes de cohérence
        consistency.issues.forEach(issue => {
            issues.push({
                type: issue.type,
                severity: issue.severity,
                description: issue.description
            });
        });

        // Ajouter les biais détectés
        bias.biases.forEach(biasIssue => {
            issues.push({
                type: biasIssue.type,
                severity: biasIssue.severity,
                description: biasIssue.description,
                location: biasIssue.features
            });
        });

        // Trier par sévérité décroissante
        return issues.sort((a, b) => b.severity - a.severity);
    }

    /**
     * Génère des recommandations pour améliorer la qualité des données
     * @param results Résultats des différentes analyses
     * @returns Liste des recommandations d'amélioration
     */
    private generateRecommendations(results: {
        consistency: ConsistencyResult;
        distribution: DistributionResult;
        bias: BiasResult;
    }): QualityRecommendation[] {
        const recommendations: QualityRecommendation[] = [];
        const { consistency, distribution, bias } = results;

        // Générer des recommandations basées sur les problèmes de cohérence
        if (consistency.issues.length > 0) {
            // Recommandation pour les valeurs manquantes
            const missingValueIssue = consistency.issues.find(issue => issue.type === 'missing_values');
            if (missingValueIssue) {
                recommendations.push(this.createRecommendation(
                    'cleaning',
                    'Handle missing values',
                    [
                        'Impute missing values using mean, median, or mode',
                        'Consider removing samples with excessive missing values',
                        'Apply advanced imputation techniques for critical features'
                    ],
                    missingValueIssue.severity,
                    3
                ));
            }

            // Recommandation pour les incohérences de type
            const typeIssue = consistency.issues.find(issue => issue.type === 'type_inconsistency');
            if (typeIssue) {
                recommendations.push(this.createRecommendation(
                    'cleaning',
                    'Fix data type inconsistencies',
                    [
                        'Convert inconsistent data types to the most appropriate type',
                        'Standardize date formats across the dataset',
                        'Apply validation rules for each data type'
                    ],
                    typeIssue.severity,
                    2
                ));
            }
        }

        // Générer des recommandations basées sur les problèmes de distribution
        if (distribution.imbalances.length > 0) {
            recommendations.push(this.createRecommendation(
                'balancing',
                'Balance feature distributions',
                [
                    'Apply resampling techniques like SMOTE for imbalanced classes',
                    'Consider data augmentation for underrepresented categories',
                    'Use weighted training approaches for imbalanced data'
                ],
                Math.max(...distribution.imbalances.map(imb => imb.severity)),
                4
            ));
        }

        // Générer des recommandations basées sur les biais
        if (bias.biases.length > 0) {
            recommendations.push(this.createRecommendation(
                'transformation',
                'Mitigate bias in the dataset',
                [
                    'Apply fairness-aware preprocessing techniques',
                    'Consider post-processing methods to equalize predictions across groups',
                    'Collect additional data for underrepresented groups'
                ],
                Math.max(...bias.biases.map(b => b.severity)),
                5
            ));
        }

        // Si le dataset est globalement de bonne qualité, ajouter une recommandation générale
        const overallScore = this.calculateQualityScore(consistency, distribution, bias);
        if (overallScore > 0.8) {
            recommendations.push(this.createRecommendation(
                'augmentation',
                'Further improve data quality',
                [
                    'Consider data augmentation techniques to increase sample diversity',
                    'Implement monitoring for data drift in production',
                    'Document data quality metrics for future reference'
                ],
                0.3, // Faible sévérité car c'est pour optimisation
                1
            ));
        }

        // Trier par priorité décroissante
        return recommendations.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Crée une recommandation formatée
     */
    private createRecommendation(
        type: string,
        description: string,
        actions: string[],
        issueSeverity: number,
        complexityLevel: number
    ): QualityRecommendation {
        // Calculer l'impact attendu en fonction de la sévérité du problème
        const currentScore = Math.max(0.5, 1 - issueSeverity);
        const expectedImprovement = Math.min(0.95, issueSeverity * 0.8);
        const afterScore = Math.min(1, currentScore + expectedImprovement);

        // Calculer le pourcentage d'amélioration
        const improvementPercentage = ((afterScore - currentScore) / currentScore) * 100;

        return {
            id: `rec_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            type,
            description,
            actions,
            expectedImpact: {
                before: currentScore,
                after: afterScore,
                improvement: improvementPercentage
            },
            priority: Math.round(issueSeverity * 10), // 0-10
            complexity: complexityLevel // 1-10
        };
    }
}