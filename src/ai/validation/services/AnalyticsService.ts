//src/ai/validation/services/AnalyticsService.ts
import {
    ValidationFeedback,
    ValidationState,
    CollaborativeValidationRequest,
    ExpertiseLevel
} from '../types';

/**
 * Statistiques générales sur le système de validation
 */
export interface ValidationStats {
    /**
     * Nombre total de validations
     */
    totalValidations: number;

    /**
     * Nombre de validations par état
     */
    validationsByState: Record<ValidationState, number>;

    /**
     * Nombre de validations par type de contenu
     */
    validationsByType: Record<string, number>;

    /**
     * Nombre total de feedbacks
     */
    totalFeedbacks: number;

    /**
     * Taux d'approbation global (0-1)
     */
    approvalRate: number;

    /**
     * Score moyen global (0-10)
     */
    averageScore: number;

    /**
     * Temps moyen jusqu'à la complétion (ms)
     */
    averageCompletionTime: number;

    /**
     * Nombre moyen de feedbacks par validation
     */
    averageFeedbacksPerValidation: number;
}

/**
 * Statistiques pour un expert
 */
export interface ExpertStats {
    /**
     * Identifiant de l'expert
     */
    expertId: string;

    /**
     * Nombre total de feedbacks
     */
    totalFeedbacks: number;

    /**
     * Taux d'approbation (0-1)
     */
    approvalRate: number;

    /**
     * Score moyen attribué (0-10)
     */
    averageScore: number;

    /**
     * Niveau de confiance moyen (0-1)
     */
    averageConfidence: number;

    /**
     * Alignement avec le consensus (0-1)
     */
    consensusAlignment: number;

    /**
     * Temps de réponse moyen (ms)
     */
    averageResponseTime: number;
}

/**
 * Service d'analyse pour le système de validation
 */
export class AnalyticsService {
    /**
     * Calcule les statistiques globales du système
     * @param validations Liste des validations
     * @param feedbackMap Map des feedbacks par validation
     * @param completionTimes Map des temps de complétion par validation
     * @returns Statistiques générales
     */
    calculateSystemStats(
        validations: Map<string, CollaborativeValidationRequest>,
        feedbackMap: Map<string, ValidationFeedback[]>,
        stateMap: Map<string, ValidationState>,
        completionTimes?: Map<string, number>
    ): ValidationStats {
        // Initialiser les compteurs
        const validationsByState: Record<ValidationState, number> = {} as Record<ValidationState, number>;
        const validationsByType: Record<string, number> = {};

        // Initialiser pour tous les états possibles
        Object.values(ValidationState).forEach(state => {
            validationsByState[state] = 0;
        });

        // Calculer les statistiques de base
        let totalFeedbacks = 0;
        let totalApprovals = 0;
        let totalScores = 0;
        let totalScoreCount = 0;
        let totalCompletionTime = 0;
        let completedValidations = 0;

        // Analyser les validations
        for (const [validationId, validation] of validations.entries()) {
            // Statistiques par état
            const state = stateMap.get(validationId) || ValidationState.UNKNOWN;
            validationsByState[state] = (validationsByState[state] || 0) + 1;

            // Statistiques par type
            const type = validation.type;
            validationsByType[type] = (validationsByType[type] || 0) + 1;

            // Statistiques de complétion
            if ([ValidationState.APPROVED, ValidationState.REJECTED, ValidationState.INTEGRATED].includes(state)) {
                completedValidations++;

                if (completionTimes?.has(validationId)) {
                    totalCompletionTime += completionTimes.get(validationId) || 0;
                }
            }

            // Statistiques de feedback
            const feedbacks = feedbackMap.get(validationId) || [];
            totalFeedbacks += feedbacks.length;

            for (const feedback of feedbacks) {
                if (feedback.approved) {
                    totalApprovals++;
                }

                if (typeof feedback.score === 'number') {
                    totalScores += feedback.score;
                    totalScoreCount++;
                }
            }
        }

        // Calculer les moyennes
        const approvalRate = totalFeedbacks > 0 ? totalApprovals / totalFeedbacks : 0;
        const averageScore = totalScoreCount > 0 ? totalScores / totalScoreCount : 0;
        const averageCompletionTime = completedValidations > 0 ? totalCompletionTime / completedValidations : 0;
        const averageFeedbacksPerValidation = validations.size > 0 ? totalFeedbacks / validations.size : 0;

        return {
            totalValidations: validations.size,
            validationsByState,
            validationsByType,
            totalFeedbacks,
            approvalRate,
            averageScore,
            averageCompletionTime,
            averageFeedbacksPerValidation
        };
    }

    /**
     * Calcule les statistiques pour un expert spécifique
     * @param expertId Identifiant de l'expert
     * @param feedbacks Tous les feedbacks du système
     * @param consensusResults Résultats de consensus pour comparer les feedbacks de l'expert
     * @returns Statistiques de l'expert
     */
    calculateExpertStats(
        expertId: string,
        allFeedbacks: Map<string, ValidationFeedback[]>,
        consensusResults?: Map<string, { approved: boolean, score?: number }>
    ): ExpertStats {
        let totalFeedbacks = 0;
        let totalApprovals = 0;
        let totalScores = 0;
        let totalScoreCount = 0;
        let totalConfidence = 0;
        let totalConfidenceCount = 0;
        let alignedWithConsensus = 0;
        let totalConsensusComparisons = 0;

        // Analyser les feedbacks de l'expert
        const expertFeedbacks: ValidationFeedback[] = [];

        for (const [, feedbacks] of allFeedbacks.entries()) {
            for (const feedback of feedbacks) {
                if (feedback.expertId === expertId) {
                    expertFeedbacks.push(feedback);
                }
            }
        }

        totalFeedbacks = expertFeedbacks.length;

        for (const feedback of expertFeedbacks) {
            // Statistiques d'approbation
            if (feedback.approved) {
                totalApprovals++;
            }

            // Statistiques de score
            if (typeof feedback.score === 'number') {
                totalScores += feedback.score;
                totalScoreCount++;
            }

            // Statistiques de confiance
            if (typeof feedback.confidence === 'number') {
                totalConfidence += feedback.confidence;
                totalConfidenceCount++;
            }

            // Alignement avec le consensus
            if (consensusResults && feedback.validationId && consensusResults.has(feedback.validationId)) {
                const consensus = consensusResults.get(feedback.validationId)!;

                if (consensus.approved === feedback.approved) {
                    alignedWithConsensus++;
                }

                totalConsensusComparisons++;
            }
        }

        // Calculer les moyennes
        const approvalRate = totalFeedbacks > 0 ? totalApprovals / totalFeedbacks : 0;
        const averageScore = totalScoreCount > 0 ? totalScores / totalScoreCount : 0;
        const averageConfidence = totalConfidenceCount > 0 ? totalConfidence / totalConfidenceCount : 0;
        const consensusAlignment = totalConsensusComparisons > 0 ? alignedWithConsensus / totalConsensusComparisons : 0;

        // Pour les besoins de cette implémentation, nous utilisons une valeur arbitraire pour le temps de réponse
        const averageResponseTime = 0; // À implémenter avec des données de temps réelles

        return {
            expertId,
            totalFeedbacks,
            approvalRate,
            averageScore,
            averageConfidence,
            consensusAlignment,
            averageResponseTime
        };
    }

    /**
     * Calcule la distribution des scores pour une validation
     * @param feedbacks Liste des feedbacks pour la validation
     * @returns Distribution des scores (nombre de feedbacks par score)
     */
    calculateScoreDistribution(feedbacks: ValidationFeedback[]): Record<number, number> {
        const distribution: Record<number, number> = {};

        // Initialiser la distribution
        for (let i = 0; i <= 10; i++) {
            distribution[i] = 0;
        }

        // Compter les feedbacks par score
        for (const feedback of feedbacks) {
            if (typeof feedback.score === 'number') {
                const roundedScore = Math.round(feedback.score);
                distribution[roundedScore] = (distribution[roundedScore] || 0) + 1;
            }
        }

        return distribution;
    }

    /**
     * Calcule le poids d'un feedback en fonction du niveau d'expertise et du statut de locuteur natif
     * @param feedback Feedback à analyser
     * @returns Poids calculé pour le feedback
     */
    calculateFeedbackWeight(feedback: ValidationFeedback): number {
        let weight = 1.0;

        // Ajuster le poids en fonction du niveau d'expertise
        if (feedback.expertiseLevel) {
            switch (feedback.expertiseLevel) {
                case ExpertiseLevel.NOVICE:
                    weight *= 0.7;
                    break;
                case ExpertiseLevel.INTERMEDIAIRE:
                    weight *= 0.85;
                    break;
                case ExpertiseLevel.AVANCE:
                    weight *= 1.0;
                    break;
                case ExpertiseLevel.EXPERT:
                    weight *= 1.2;
                    break;
                case ExpertiseLevel.NATIF:
                    weight *= 1.3;
                    break;
                case ExpertiseLevel.FORMATEUR:
                    weight *= 1.4;
                    break;
                case ExpertiseLevel.CHERCHEUR:
                    weight *= 1.5;
                    break;
            }
        }

        // Ajuster le poids pour les locuteurs natifs
        if (feedback.isNativeValidator) {
            weight *= 1.25;
        }

        // Ajuster le poids en fonction de la confiance
        if (typeof feedback.confidence === 'number') {
            weight *= 0.5 + 0.5 * feedback.confidence; // Entre 50% et 100% du poids
        }

        return weight;
    }

    /**
     * Identifie les experts ayant des opinions divergentes du consensus
     * @param allFeedbacks Tous les feedbacks du système
     * @param consensusResults Résultats de consensus pour chaque validation
     * @param threshold Seuil d'alignement en dessous duquel un expert est considéré divergent
     * @returns Liste des experts divergents avec leur taux d'alignement
     */
    identifyDivergentExperts(
        allFeedbacks: Map<string, ValidationFeedback[]>,
        consensusResults: Map<string, { approved: boolean, score?: number }>,
        threshold: number = 0.7
    ): Array<{ expertId: string; alignmentRate: number; feedbackCount: number }> {
        // Calculer l'alignement pour chaque expert
        const expertAlignments: Record<string, { aligned: number; total: number }> = {};

        for (const [validationId, feedbacks] of allFeedbacks.entries()) {
            if (consensusResults.has(validationId)) {
                const consensus = consensusResults.get(validationId)!;

                for (const feedback of feedbacks) {
                    const expertId = feedback.expertId;

                    if (!expertAlignments[expertId]) {
                        expertAlignments[expertId] = { aligned: 0, total: 0 };
                    }

                    if (feedback.approved === consensus.approved) {
                        expertAlignments[expertId].aligned++;
                    }

                    expertAlignments[expertId].total++;
                }
            }
        }

        // Filtrer les experts divergents
        const divergentExperts = Object.entries(expertAlignments)
            .filter(([, stats]) => stats.total >= 5) // Ignorer les experts avec trop peu de feedbacks
            .map(([expertId, stats]) => ({
                expertId,
                alignmentRate: stats.aligned / stats.total,
                feedbackCount: stats.total
            }))
            .filter(expert => expert.alignmentRate < threshold)
            .sort((a, b) => a.alignmentRate - b.alignmentRate); // Trier par alignement croissant

        return divergentExperts;
    }
}

// Singleton pour un accès global
let globalAnalyticsService: AnalyticsService | null = null;

/**
 * Obtient l'instance globale du service d'analyse
 * @returns Instance du service d'analyse
 */
export function getAnalyticsService(): AnalyticsService {
    if (!globalAnalyticsService) {
        globalAnalyticsService = new AnalyticsService();
    }
    return globalAnalyticsService;
}