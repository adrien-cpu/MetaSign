//src/ai/validation/services/ConsensusService.ts
import {
    ValidationFeedback,
    ConsensusOptions,
    ConsensusResult,
    ConsensusImprovement,
    ExpertiseLevel,
    ImprovementProposal
} from '../types';
import { getAnalyticsService } from './AnalyticsService';

/**
 * Algorithmes de calcul de consensus
 */
export type ConsensusAlgorithm = 'majority' | 'weighted' | 'delphi' | 'supermajority';

/**
 * Configuration par défaut pour le calcul du consensus
 */
const DEFAULT_CONSENSUS_OPTIONS: Required<ConsensusOptions> = {
    algorithm: 'weighted',
    approvalThreshold: 0.7,
    expertWeights: {
        'novice': 0.7,
        'intermediaire': 0.85,
        'avance': 1.0,
        'expert': 1.2,
        'natif': 1.3,
        'formateur': 1.4,
        'chercheur': 1.5
    },
    nativeValidatorBonus: 0.25,
    minParticipants: 3
};

/**
 * Interface pour les métadonnées spécifiques à l'algorithme Delphi
 */
interface DelphiMetadata {
    highExpertiseCount: number;
    nativeCount: number;
    convergenceRate: number;
}

/**
 * Service pour le calcul de consensus
 */
export class ConsensusService {
    private readonly analyticsService = getAnalyticsService();

    /**
     * Calcule le consensus à partir des feedbacks
     * @param validationId ID de la validation
     * @param feedbacks Liste des feedbacks pour la validation
     * @param options Options de calcul du consensus
     * @returns Résultat du consensus
     */
    calculateConsensus(
        validationId: string,
        feedbacks: ValidationFeedback[],
        options?: Partial<ConsensusOptions>
    ): ConsensusResult {
        // Fusionner les options avec les valeurs par défaut
        const mergedOptions: Required<ConsensusOptions> = {
            ...DEFAULT_CONSENSUS_OPTIONS,
            ...options
        };

        // Vérifier s'il y a assez de feedbacks
        if (feedbacks.length < mergedOptions.minParticipants) {
            return {
                validationId,
                approved: false,
                confidence: 0,
                consensusLevel: 0,
                expertCount: feedbacks.length,
                participantCount: feedbacks.length,
                voteDistribution: { approve: 0, reject: 0 },
                timestamp: new Date()
            };
        }

        // Appliquer l'algorithme approprié
        let result: ConsensusResult;

        switch (mergedOptions.algorithm) {
            case 'majority':
                result = this.calculateMajorityConsensus(validationId, feedbacks, mergedOptions);
                break;

            case 'weighted':
                result = this.calculateWeightedConsensus(validationId, feedbacks, mergedOptions);
                break;

            case 'supermajority':
                result = this.calculateSupermajorityConsensus(validationId, feedbacks, mergedOptions);
                break;

            case 'delphi':
                result = this.calculateDelphiConsensus(validationId, feedbacks, mergedOptions);
                break;

            default:
                result = this.calculateWeightedConsensus(validationId, feedbacks, mergedOptions);
        }

        // Agréger les suggestions d'amélioration
        result.improveProposal = this.aggregateImprovementProposals(feedbacks);

        // Calculer un score global du consensus
        result.consensusScore = this.calculateConsensusScore(result);

        return result;
    }

    /**
     * Algorithme de consensus simple par majorité
     * @param validationId ID de la validation
     * @param feedbacks Liste des feedbacks
     * @param options Options de calcul
     * @returns Résultat du consensus
     */
    private calculateMajorityConsensus(
        validationId: string,
        feedbacks: ValidationFeedback[],
        options: Required<ConsensusOptions>
    ): ConsensusResult {
        let approveCount = 0;
        let rejectCount = 0;

        // Compter les votes
        for (const feedback of feedbacks) {
            if (feedback.approved) {
                approveCount++;
            } else {
                rejectCount++;
            }
        }

        // Calculer le taux d'approbation
        const totalVotes = approveCount + rejectCount;
        const approvalRate = totalVotes > 0 ? approveCount / totalVotes : 0;

        // Déterminer si le consensus est atteint
        const approved = approvalRate >= options.approvalThreshold;

        // Calculer le niveau de consensus (force du consensus)
        const consensusLevel = Math.abs(approvalRate - 0.5) * 2; // Entre 0 et 1

        // Calculer le niveau de confiance
        const confidence = this.calculateConfidenceLevel(feedbacks, approved);

        // Extraire les scores
        const expertScores = feedbacks
            .filter(feedback => typeof feedback.score === 'number')
            .map(feedback => feedback.score as number);

        // Extraire les commentaires
        const expertComments = feedbacks
            .filter(feedback => feedback.comments && feedback.comments.trim().length > 0)
            .map(feedback => feedback.comments as string);

        return {
            validationId,
            approved,
            confidence,
            consensusLevel,
            expertCount: feedbacks.length,
            participantCount: feedbacks.length,
            voteDistribution: {
                approve: approveCount,
                reject: rejectCount
            },
            expertScores,
            expertComments,
            timestamp: new Date()
        };
    }

    /**
     * Algorithme de consensus pondéré par l'expertise
     * @param validationId ID de la validation
     * @param feedbacks Liste des feedbacks
     * @param options Options de calcul
     * @returns Résultat du consensus
     */
    private calculateWeightedConsensus(
        validationId: string,
        feedbacks: ValidationFeedback[],
        options: Required<ConsensusOptions>
    ): ConsensusResult {
        let weightedApproveCount = 0;
        let totalWeight = 0;

        // Calculer les votes pondérés
        for (const feedback of feedbacks) {
            // Déterminer le poids du feedback
            let weight = 1.0;

            // Appliquer le poids selon le niveau d'expertise
            if (feedback.expertiseLevel && options.expertWeights[feedback.expertiseLevel]) {
                weight *= options.expertWeights[feedback.expertiseLevel];
            }

            // Appliquer le bonus pour les validateurs natifs
            if (feedback.isNativeValidator) {
                weight *= (1 + options.nativeValidatorBonus);
            }

            // Appliquer le niveau de confiance si disponible
            if (typeof feedback.confidence === 'number') {
                weight *= 0.5 + 0.5 * feedback.confidence; // Entre 50% et 100% du poids
            }

            // Ajouter le vote pondéré
            if (feedback.approved) {
                weightedApproveCount += weight;
            }
            // Note: Nous n'avons pas besoin de suivre weightedRejectCount séparément
            // car nous pouvons le calculer à partir de totalWeight - weightedApproveCount

            totalWeight += weight;
        }

        // Calculer le taux d'approbation pondéré
        const approvalRate = totalWeight > 0 ? weightedApproveCount / totalWeight : 0;

        // Déterminer si le consensus est atteint
        const approved = approvalRate >= options.approvalThreshold;

        // Calculer le niveau de consensus (force du consensus)
        const consensusLevel = Math.abs(approvalRate - 0.5) * 2; // Entre 0 et 1

        // Calculer le niveau d'accord entre les experts
        const agreementLevel = this.calculateAgreementLevel(feedbacks);

        // Extraire les scores
        const expertScores = feedbacks
            .filter(feedback => typeof feedback.score === 'number')
            .map(feedback => feedback.score as number);

        // Extraire les commentaires
        const expertComments = feedbacks
            .filter(feedback => feedback.comments && feedback.comments.trim().length > 0)
            .map(feedback => feedback.comments as string);

        // Agréger les commentaires
        const aggregatedComments = this.aggregateComments(feedbacks);

        return {
            validationId,
            approved,
            confidence: this.calculateConfidenceLevel(feedbacks, approved),
            consensusLevel,
            agreementLevel,
            expertCount: feedbacks.length,
            participantCount: feedbacks.length,
            voteDistribution: {
                approve: feedbacks.filter(f => f.approved).length,
                reject: feedbacks.filter(f => !f.approved).length
            },
            expertScores,
            expertComments,
            aggregatedComments,
            timestamp: new Date()
        };
    }

    /**
     * Algorithme de consensus par supermajorité
     * @param validationId ID de la validation
     * @param feedbacks Liste des feedbacks
     * @param options Options de calcul
     * @returns Résultat du consensus
     */
    private calculateSupermajorityConsensus(
        validationId: string,
        feedbacks: ValidationFeedback[],
        options: Required<ConsensusOptions>
    ): ConsensusResult {
        // Utiliser une variante du consensus par majorité avec un seuil plus élevé
        const supermajorityOptions: Required<ConsensusOptions> = {
            ...options,
            approvalThreshold: Math.max(options.approvalThreshold, 0.75) // Minimum 75% pour supermajorité
        };

        return this.calculateMajorityConsensus(validationId, feedbacks, supermajorityOptions);
    }

    /**
     * Algorithme de consensus Delphi (simulation)
     * @param validationId ID de la validation
     * @param feedbacks Liste des feedbacks
     * @param options Options de calcul
     * @returns Résultat du consensus
     */
    private calculateDelphiConsensus(
        validationId: string,
        feedbacks: ValidationFeedback[],
        options: Required<ConsensusOptions>
    ): ConsensusResult {
        // Dans une implémentation réelle, l'algorithme Delphi impliquerait plusieurs tours de feedback
        // avec anonymisation des opinions et convergence progressive.
        // Ici, nous simulons le résultat final d'un processus Delphi.

        // Diviser les feedbacks par niveau d'expertise
        const highExpertiseFeedbacks = feedbacks.filter(f =>
            f.expertiseLevel === ExpertiseLevel.EXPERT ||
            f.expertiseLevel === ExpertiseLevel.FORMATEUR ||
            f.expertiseLevel === ExpertiseLevel.CHERCHEUR
        );

        const nativeFeedbacks = feedbacks.filter(f => f.isNativeValidator);

        // Donner plus de poids aux experts de haut niveau et aux natifs
        const weightedResult = this.calculateWeightedConsensus(
            validationId,
            feedbacks,
            {
                ...options,
                expertWeights: {
                    ...options.expertWeights,
                    [ExpertiseLevel.EXPERT]: 1.5,
                    [ExpertiseLevel.FORMATEUR]: 1.8,
                    [ExpertiseLevel.CHERCHEUR]: 2.0
                },
                nativeValidatorBonus: 0.5
            }
        );

        // Calculer un niveau de consensus ajusté pour refléter la convergence Delphi
        const delphiConsensusLevel = Math.min(1, weightedResult.consensusLevel * 1.2);

        // Calculer un niveau de confiance ajusté
        const confidenceAdjustment =
            (highExpertiseFeedbacks.length / Math.max(1, feedbacks.length)) * 0.3 +
            (nativeFeedbacks.length / Math.max(1, feedbacks.length)) * 0.2;

        const delphiConfidence = Math.min(1, (weightedResult.confidence || 0) + confidenceAdjustment);

        // Créer le résultat de base
        const result: ConsensusResult = {
            ...weightedResult,
            consensusLevel: delphiConsensusLevel,
            confidence: delphiConfidence,
            timestamp: new Date()
        };

        // Stocker les métadonnées Delphi séparément (puisqu'elles ne font pas partie du type ConsensusResult)
        const delphiMetadata: DelphiMetadata = {
            highExpertiseCount: highExpertiseFeedbacks.length,
            nativeCount: nativeFeedbacks.length,
            convergenceRate: delphiConsensusLevel
        };

        // Si nécessaire, les métadonnées peuvent être utilisées ailleurs dans la classe
        this.logDelphiData(validationId, delphiMetadata);

        return result;
    }

    /**
     * Méthode pour enregistrer ou traiter les métadonnées Delphi
     * @param validationId ID de la validation
     * @param metadata Métadonnées Delphi
     */
    private logDelphiData(validationId: string, metadata: DelphiMetadata): void {
        // Dans une implémentation réelle, on pourrait enregistrer ces données
        // dans des logs, une base de données, ou les utiliser pour des analyses
        try {
            // Vérifier si l'analyticsService a une méthode compatible pour enregistrer des événements
            // Utilisons une approche de type sécurisé
            const analyticsService = this.analyticsService as unknown as {
                recordMetric?: (name: string, data: Record<string, unknown>) => void,
                trackEvent?: (eventName: string, eventData: Record<string, unknown>) => void
            };

            // Essayer d'utiliser une méthode disponible dans analyticsService
            if (analyticsService && typeof analyticsService.recordMetric === 'function') {
                analyticsService.recordMetric('delphi_consensus', {
                    validationId,
                    ...metadata
                });
            } else if (analyticsService && typeof analyticsService.trackEvent === 'function') {
                analyticsService.trackEvent('delphi_consensus', {
                    validationId,
                    ...metadata
                });
            } else {
                // Fallback: utiliser console.log pour ne pas perdre l'information
                console.log('Delphi consensus data:', {
                    validationId,
                    ...metadata
                });
            }
        } catch (error) {
            // Capturer les erreurs pour éviter qu'elles ne perturbent le flux principal
            console.warn('Failed to log Delphi data:', error);
        }
    }

    /**
     * Calcule le niveau de confiance global à partir des feedbacks
     * @param feedbacks Liste des feedbacks
     * @param consensusOutcome Résultat du consensus (approuvé ou rejeté)
     * @returns Niveau de confiance (0-1)
     */
    private calculateConfidenceLevel(feedbacks: ValidationFeedback[], consensusOutcome: boolean): number {
        // Extraire les niveaux de confiance individuels
        const confidenceLevels = feedbacks
            .filter(feedback => typeof feedback.confidence === 'number')
            .map(feedback => {
                // Ajuster la confiance en fonction de l'alignement avec le résultat
                const alignmentFactor = feedback.approved === consensusOutcome ? 1.2 : 0.8;
                return (feedback.confidence as number) * alignmentFactor;
            });

        if (confidenceLevels.length === 0) {
            // Si aucune confiance explicite, utiliser le niveau d'accord
            return this.calculateAgreementLevel(feedbacks);
        }

        // Calculer la moyenne
        const avgConfidence = confidenceLevels.reduce((sum, val) => sum + val, 0) / confidenceLevels.length;

        // Limiter entre 0 et 1
        return Math.max(0, Math.min(1, avgConfidence));
    }

    /**
     * Calcule le niveau d'accord entre les experts
     * @param feedbacks Liste des feedbacks
     * @returns Niveau d'accord (0-1)
     */
    private calculateAgreementLevel(feedbacks: ValidationFeedback[]): number {
        if (feedbacks.length <= 1) {
            return 1; // Accord parfait avec un seul feedback
        }

        // Compter les approbations et rejets
        const approveCount = feedbacks.filter(f => f.approved).length;
        const rejectCount = feedbacks.length - approveCount;

        // Calculer la proportion du vote majoritaire
        const majorityProportion = Math.max(approveCount, rejectCount) / feedbacks.length;

        // Transformer la proportion en niveau d'accord (0.5 à 1)
        return (majorityProportion - 0.5) * 2;
    }

    /**
     * Agrège les commentaires des experts en extrayant les points clés
     * @param feedbacks Liste des feedbacks
     * @returns Liste des commentaires agrégés
     */
    private aggregateComments(feedbacks: ValidationFeedback[]): string[] {
        // Extraire les commentaires non vides
        const validComments = feedbacks
            .filter(feedback => feedback.comments && feedback.comments.trim().length > 0)
            .map(feedback => feedback.comments as string);

        if (validComments.length === 0) {
            return [];
        }

        // Dans une implémentation réelle, on pourrait utiliser du NLP pour agréger
        // Ici, nous retournons simplement les commentaires uniques
        const uniqueComments = [...new Set(validComments)];

        // Limiter le nombre de commentaires
        return uniqueComments.slice(0, 5);
    }

    /**
     * Agrège les propositions d'amélioration des experts
     * @param feedbacks Liste des feedbacks
     * @returns Map des améliorations par champ
     */
    private aggregateImprovementProposals(
        feedbacks: ValidationFeedback[]
    ): Record<string, ConsensusImprovement> {
        // Collecter toutes les suggestions
        const allSuggestions: ImprovementProposal[] = [];

        for (const feedback of feedbacks) {
            if (feedback.suggestions && feedback.suggestions.length > 0) {
                allSuggestions.push(...feedback.suggestions);
            }
        }

        if (allSuggestions.length === 0) {
            return {};
        }

        // Regrouper les suggestions par champ
        const groupedSuggestions: Record<string, ImprovementProposal[]> = {};

        for (const suggestion of allSuggestions) {
            if (!groupedSuggestions[suggestion.field]) {
                groupedSuggestions[suggestion.field] = [];
            }

            groupedSuggestions[suggestion.field].push(suggestion);
        }

        // Agréger les suggestions par champ
        const result: Record<string, ConsensusImprovement> = {};

        for (const [field, suggestions] of Object.entries(groupedSuggestions)) {
            // Compter les occurrences de chaque valeur proposée
            const valueCounts: Record<string, { count: number; priority: number }> = {};

            for (const suggestion of suggestions) {
                const valueKey = String(suggestion.proposedValue);

                if (!valueCounts[valueKey]) {
                    valueCounts[valueKey] = { count: 0, priority: 0 };
                }

                valueCounts[valueKey].count++;

                // Ajouter la priorité (low=1, medium=2, high=3)
                const priorityValue =
                    suggestion.priority === 'high' ? 3 :
                        suggestion.priority === 'medium' ? 2 : 1;

                valueCounts[valueKey].priority += priorityValue;
            }

            // Trouver la valeur la plus suggérée
            let bestValue: string | null = null;
            let bestCount = 0;
            let bestPriority = 0;

            for (const [value, stats] of Object.entries(valueCounts)) {
                if (stats.count > bestCount ||
                    (stats.count === bestCount && stats.priority > bestPriority)) {
                    bestValue = value;
                    bestCount = stats.count;
                    bestPriority = stats.priority;
                }
            }

            if (bestValue !== null) {
                // Convertir la valeur au type approprié
                let typedValue: string | number | boolean = bestValue;

                // Détecter le type de la valeur
                if (bestValue === 'true') {
                    typedValue = true;
                } else if (bestValue === 'false') {
                    typedValue = false;
                } else if (!isNaN(Number(bestValue))) {
                    typedValue = Number(bestValue);
                }

                // Calculer le pourcentage de support
                const supportPercentage = (bestCount / suggestions.length) * 100;

                // Déterminer la difficulté d'implémentation (simulée ici)
                const implementationDifficulty =
                    supportPercentage < 60 ? 'complex' :
                        supportPercentage < 80 ? 'medium' : 'easy';

                // Créer l'amélioration consensuelle
                result[field] = {
                    field,
                    proposedValue: typedValue,
                    confidence: supportPercentage / 100,
                    supportPercentage,
                    implementationDifficulty
                };
            }
        }

        return result;
    }

    /**
     * Calcule un score global pour le consensus
     * @param result Résultat du consensus
     * @returns Score global entre 0 et 1
     */
    private calculateConsensusScore(result: Partial<ConsensusResult>): number {
        // Facteurs à prendre en compte
        const consensusLevel = result.consensusLevel || 0;
        const confidence = result.confidence || 0;
        const agreementLevel = result.agreementLevel || 0;
        const expertCount = result.expertCount || 0;

        // Facteur d'échelle pour le nombre d'experts (plus d'experts = plus fiable)
        const expertFactor = Math.min(1, expertCount / 10); // Max à 10 experts

        // Calculer le score composite
        const score =
            (consensusLevel * 0.4) + // Niveau de consensus
            (confidence * 0.3) +     // Confiance
            (agreementLevel * 0.2) + // Niveau d'accord
            (expertFactor * 0.1);    // Nombre d'experts

        return Math.max(0, Math.min(1, score));
    }
}

// Singleton pour un accès global
let globalConsensusService: ConsensusService | null = null;

/**
 * Obtient l'instance globale du service de consensus
 * @returns Instance du service de consensus
 */
export function getConsensusService(): ConsensusService {
    if (!globalConsensusService) {
        globalConsensusService = new ConsensusService();
    }
    return globalConsensusService;
}