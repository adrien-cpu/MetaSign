// src/ai/learning/adapters/realtime/PaceAdjuster.ts

import { LearningContext, PaceAdjustment } from '../../types';
import { Logger } from '@ai/utils/Logger';

/**
 * Énumération des facteurs affectant le rythme d'apprentissage
 */
export enum PaceFactor {
    PERFORMANCE = 'performance',
    ENGAGEMENT = 'engagement',
    FRUSTRATION = 'frustration',
    CONTENT_DIFFICULTY = 'contentDifficulty',
    LEARNING_STYLE = 'learningStyle',
    TIME_CONSTRAINTS = 'timeConstraints',
    PRIOR_KNOWLEDGE = 'priorKnowledge'
}

/**
 * Interface pour les facteurs d'ajustement de rythme
 */
interface AdjustmentFactors {
    [PaceFactor.PERFORMANCE]: number;       // Score de performance (-1 à 1)
    [PaceFactor.ENGAGEMENT]: number;        // Niveau d'engagement (-1 à 1)
    [PaceFactor.FRUSTRATION]: number;       // Niveau de frustration (-1 à 1)
    [PaceFactor.CONTENT_DIFFICULTY]: number; // Difficulté du contenu (-1 à 1)
    [PaceFactor.LEARNING_STYLE]: number;    // Compatibilité avec le style d'apprentissage (-1 à 1)
    [PaceFactor.TIME_CONSTRAINTS]: number;  // Contraintes de temps (-1 à 1)
    [PaceFactor.PRIOR_KNOWLEDGE]: number;   // Connaissances préalables (-1 à 1)
}

/**
 * Interface pour les impacts estimés internes (plus détaillée que ce qui est retourné à l'API)
 */
interface DetailedImpactEstimation {
    comprehension: number;   // Impact sur la compréhension (pourcentage)
    retention: number;       // Impact sur la rétention (pourcentage)
    completion: number;      // Impact sur le taux de complétion (pourcentage)
    satisfaction: number;    // Impact sur la satisfaction (pourcentage)
    timeToMastery: number;   // Impact sur le temps de maîtrise (pourcentage)
}

/**
 * Ajusteur de rythme responsable de recommander des ajustements de rythme d'apprentissage
 */
export class PaceAdjuster {
    private readonly logger: Logger;
    private readonly DEFAULT_PACE = 1.0;  // Rythme normal par défaut
    private readonly MIN_PACE = 0.5;      // Rythme minimum (50% plus lent)
    private readonly MAX_PACE = 2.0;      // Rythme maximum (200% plus rapide)

    // Poids des facteurs pour le calcul du rythme recommandé
    private readonly factorWeights = {
        [PaceFactor.PERFORMANCE]: 0.25,
        [PaceFactor.ENGAGEMENT]: 0.20,
        [PaceFactor.FRUSTRATION]: 0.20,
        [PaceFactor.CONTENT_DIFFICULTY]: 0.15,
        [PaceFactor.LEARNING_STYLE]: 0.10,
        [PaceFactor.TIME_CONSTRAINTS]: 0.05,
        [PaceFactor.PRIOR_KNOWLEDGE]: 0.05
    };

    constructor() {
        this.logger = new Logger('PaceAdjuster');
    }

    /**
     * Ajuste le rythme d'apprentissage en fonction du contexte
     * 
     * @param userId - L'identifiant de l'utilisateur
     * @param context - Contexte d'apprentissage actuel
     * @returns Informations sur l'ajustement de rythme recommandé
     */
    public async adjust(userId: string, context: LearningContext): Promise<PaceAdjustment> {
        this.logger.info(`Adjusting pace for user ${userId}`);

        // Estimer le rythme actuel
        const currentPace = this.estimateCurrentPace(context);

        // Calculer les facteurs d'ajustement
        const factors = await this.calculateFactors(context);

        // Calculer le rythme recommandé
        const recommendedPace = this.calculateRecommendedPace(factors);

        // Générer le raisonnement
        const reasoning = this.generateReasoning(factors, currentPace, recommendedPace);

        // Estimer l'impact
        const detailedImpact = this.estimateImpact(currentPace, recommendedPace, factors);

        return {
            currentPace,
            recommendedPace,
            reasoning,
            estimatedImpact: {
                onComprehension: detailedImpact.comprehension,
                onEngagement: detailedImpact.satisfaction, // Utiliser satisfaction comme proxy pour engagement
                onCompletion: detailedImpact.completion
            }
        };
    }

    /**
     * Estime le rythme actuel en fonction du contexte d'apprentissage
     * 
     * @param context - Contexte d'apprentissage actuel
     * @returns Estimation du rythme actuel (1.0 = rythme normal)
     */
    private estimateCurrentPace(context: LearningContext): number {
        // Début avec le rythme par défaut
        let estimatedPace = this.DEFAULT_PACE;

        // Utiliser les données du contexte pour estimer le rythme actuel

        // 1. Estimation basée sur le temps passé
        if (context.timeSpent !== undefined) {
            const activityDifficulty = context.currentActivity?.difficulty || 0.5;
            const expectedTimeForDifficulty = 300 + (activityDifficulty * 300); // Estimation simple: 5-10 minutes selon difficulté

            if (context.timeSpent > 0 && expectedTimeForDifficulty > 0) {
                // Calculer un ratio approximatif de vitesse
                const timeRatio = expectedTimeForDifficulty / context.timeSpent;

                // Si l'utilisateur va plus vite que prévu, son rythme est plus élevé
                if (timeRatio > 0.2 && timeRatio < 5) { // Bornes pour éviter les valeurs aberrantes
                    estimatedPace = timeRatio;
                }
            }
        }

        // 2. Ajustement basé sur l'attention estimée
        if (context.userState?.estimatedAttention !== undefined) {
            const attentionFactor = context.userState.estimatedAttention / 100;
            estimatedPace *= (0.8 + 0.4 * attentionFactor); // Ajustement modéré basé sur l'attention
        }

        // 3. Ajustement basé sur les performances précédentes
        if (context.previousPerformance?.averageScore !== undefined) {
            const performanceFactor = context.previousPerformance.averageScore / 100;

            if (performanceFactor > 0.9) {
                estimatedPace *= 1.2; // Bonus de vitesse pour haute performance
            } else if (performanceFactor < 0.6) {
                estimatedPace *= 0.8; // Ralentissement pour basse performance
            }
        }

        // Limiter aux bornes min/max
        return Math.max(this.MIN_PACE, Math.min(this.MAX_PACE, estimatedPace));
    }

    /**
     * Calcule les facteurs d'ajustement basés sur le contexte
     * 
     * @param context - Contexte d'apprentissage actuel
     * @returns Facteurs d'ajustement normalisés (-1 à 1)
     */
    private async calculateFactors(context: LearningContext): Promise<AdjustmentFactors> {
        const factors: AdjustmentFactors = {
            [PaceFactor.PERFORMANCE]: 0,
            [PaceFactor.ENGAGEMENT]: 0,
            [PaceFactor.FRUSTRATION]: 0,
            [PaceFactor.CONTENT_DIFFICULTY]: 0,
            [PaceFactor.LEARNING_STYLE]: 0,
            [PaceFactor.TIME_CONSTRAINTS]: 0,
            [PaceFactor.PRIOR_KNOWLEDGE]: 0
        };

        // Facteur de performance
        factors[PaceFactor.PERFORMANCE] = this.calculatePerformanceFactor(context);

        // Facteur d'engagement
        factors[PaceFactor.ENGAGEMENT] = this.calculateEngagementFactor(context);

        // Facteur de frustration
        factors[PaceFactor.FRUSTRATION] = this.calculateFrustrationFactor(context);

        // Facteur de difficulté du contenu
        factors[PaceFactor.CONTENT_DIFFICULTY] = this.calculateContentDifficultyFactor(context);

        // Facteur de style d'apprentissage
        factors[PaceFactor.LEARNING_STYLE] = this.calculateLearningStyleFactor();

        // Facteur de contraintes de temps
        factors[PaceFactor.TIME_CONSTRAINTS] = this.calculateTimeConstraintsFactor(context);

        // Facteur de connaissances préalables
        factors[PaceFactor.PRIOR_KNOWLEDGE] = this.calculatePriorKnowledgeFactor();

        return factors;
    }

    /**
     * Calcule le facteur de performance (-1 à 1)
     * 
     * @param context - Contexte d'apprentissage
     * @returns Score de performance normalisé
     */
    private calculatePerformanceFactor(context: LearningContext): number {
        if (context.previousPerformance?.averageScore === undefined) {
            return 0; // Neutre si pas de données
        }

        const averageScore = context.previousPerformance.averageScore;

        // Seuils pour déterminer la performance
        const excellentThreshold = 90;  // Score excellent
        const goodThreshold = 75;       // Score bon
        const averageThreshold = 60;    // Score moyen
        const poorThreshold = 40;       // Score faible

        // Calculer le facteur
        if (averageScore >= excellentThreshold) {
            // Performance excellente - rythme plus rapide recommandé
            return 0.8;
        } else if (averageScore >= goodThreshold) {
            // Bonne performance - rythme légèrement plus rapide
            return 0.4;
        } else if (averageScore >= averageThreshold) {
            // Performance moyenne - rythme inchangé
            return 0;
        } else if (averageScore >= poorThreshold) {
            // Performance faible - rythme légèrement plus lent
            return -0.4;
        } else {
            // Performance très faible - rythme beaucoup plus lent
            return -0.8;
        }
    }

    /**
     * Calcule le facteur d'engagement (-1 à 1)
     * 
     * @param context - Contexte d'apprentissage
     * @returns Score d'engagement normalisé
     */
    private calculateEngagementFactor(context: LearningContext): number {
        // Si l'estimation d'engagement est disponible dans le contexte
        if (context.userState?.recentEngagement !== undefined) {
            // Normaliser entre -1 et 1 (considérant que recentEngagement est sur 100)
            return (context.userState.recentEngagement / 50) - 1;
        }

        // Utiliser l'attention estimée comme proxy si disponible
        if (context.userState?.estimatedAttention !== undefined) {
            return (context.userState.estimatedAttention / 50) - 1;
        }

        // Valeur neutre par défaut
        return 0;
    }

    /**
     * Calcule le facteur de frustration (-1 à 1)
     * 
     * @param context - Contexte d'apprentissage
     * @returns Score de frustration normalisé
     */
    private calculateFrustrationFactor(context: LearningContext): number {
        // Utiliser l'estimation de fatigue comme proxy pour la frustration
        if (context.userState?.estimatedFatigue !== undefined) {
            // Transforme la fatigue (0-100) en un score de frustration (-1 à 0)
            return -Math.min(1, context.userState.estimatedFatigue / 100);
        }

        // Si aucune information n'est disponible, supposer qu'il n'y a pas de frustration
        return 0;
    }

    /**
     * Calcule le facteur de difficulté du contenu (-1 à 1)
     * 
     * @param context - Contexte d'apprentissage
     * @returns Score de difficulté normalisé
     */
    private calculateContentDifficultyFactor(context: LearningContext): number {
        // Si le contexte inclut une activité actuelle avec niveau de difficulté
        if (context.currentActivity?.difficulty !== undefined) {
            // Transformer la difficulté (typiquement 0-1) en facteur (-1 à 1)
            // Où -1 signifie "trop difficile, ralentir" et 1 signifie "trop facile, accélérer"
            return 1 - (context.currentActivity.difficulty * 2);
        }

        // Si le module actuel a un niveau de difficulté
        if (context.currentModule?.difficultyLevel !== undefined) {
            // Transformer la difficulté en facteur (-1 à 1)
            return 1 - (context.currentModule.difficultyLevel * 2);
        }

        return 0; // Neutre par défaut
    }

    /**
     * Calcule le facteur de style d'apprentissage (-1 à 1)
     * 
     * @returns Score de compatibilité avec le style d'apprentissage
     */
    private calculateLearningStyleFactor(): number {
        // Dans cette implémentation simple, nous supposons une compatibilité neutre
        // Cette fonction pourrait être étendue pour prendre en compte le profil d'apprentissage de l'utilisateur
        return 0;
    }

    /**
     * Calcule le facteur de contraintes de temps (-1 à 1)
     * 
     * @param context - Contexte d'apprentissage
     * @returns Score de contrainte de temps normalisé
     */
    private calculateTimeConstraintsFactor(context: LearningContext): number {
        // Calcul basé sur le temps passé par rapport au temps attendu pour ce type d'activité
        if (context.timeSpent !== undefined && context.currentActivity !== undefined) {
            // Estimation grossière du temps attendu basée sur la difficulté
            const difficulty = context.currentActivity.difficulty || 0.5;
            const expectedTime = 300 + (difficulty * 300); // 5-10 minutes selon la difficulté

            // Si l'utilisateur a déjà passé beaucoup de temps, suggérer d'accélérer
            if (context.timeSpent > expectedTime * 1.5) {
                return 0.5; // Accélérer significativement
            } else if (context.timeSpent > expectedTime * 1.2) {
                return 0.3; // Accélérer modérément
            }
        }

        return 0; // Neutre par défaut
    }

    /**
     * Calcule le facteur de connaissances préalables (-1 à 1)
     * 
     * @returns Score de connaissances préalables normalisé
     */
    private calculatePriorKnowledgeFactor(): number {
        // Cette fonction nécessiterait d'accéder au profil utilisateur
        // Dans cette implémentation simplifiée, on retourne une valeur neutre
        return 0;
    }

    /**
     * Calcule le rythme recommandé en fonction des facteurs d'ajustement
     * 
     * @param factors - Facteurs d'ajustement
     * @returns Rythme recommandé (1.0 = rythme normal)
     */
    private calculateRecommendedPace(factors: AdjustmentFactors): number {
        // Calculer l'ajustement pondéré
        let adjustment = 0;
        let totalWeight = 0;

        // Parcourir tous les facteurs
        for (const factor of Object.values(PaceFactor)) {
            const weight = this.factorWeights[factor];
            adjustment += factors[factor] * weight;
            totalWeight += weight;
        }

        // Normaliser l'ajustement
        if (totalWeight > 0) {
            adjustment /= totalWeight;
        }

        // Appliquer l'ajustement au rythme de base
        const recommendedPace = this.DEFAULT_PACE * (1 + adjustment);

        // Limiter aux bornes minimales et maximales
        return Math.max(this.MIN_PACE, Math.min(this.MAX_PACE, recommendedPace));
    }

    /**
     * Génère une explication du raisonnement derrière l'ajustement recommandé
     * 
     * @param factors - Facteurs d'ajustement
     * @param currentPace - Rythme actuel
     * @param recommendedPace - Rythme recommandé
     * @returns Explication textuelle du raisonnement
     */
    private generateReasoning(
        factors: AdjustmentFactors,
        currentPace: number,
        recommendedPace: number
    ): string {
        // Déterminer la direction de l'ajustement
        const paceChange = recommendedPace - currentPace;
        let reasoning = '';

        if (Math.abs(paceChange) < 0.1) {
            reasoning = "Le rythme actuel semble approprié. ";
        } else if (paceChange > 0) {
            reasoning = "Un rythme plus rapide est recommandé. ";
        } else {
            reasoning = "Un rythme plus lent est recommandé. ";
        }

        // Ajouter les principaux facteurs influençant cette recommandation
        reasoning += "Cette recommandation est basée sur :\n";

        // Trier les facteurs par importance (magnitude pondérée)
        const sortedFactors = Object.entries(factors)
            .map(([factor, value]) => ({
                factor,
                value,
                weightedValue: Math.abs(value * this.factorWeights[factor as PaceFactor])
            }))
            .sort((a, b) => b.weightedValue - a.weightedValue)
            .slice(0, 3); // Prendre les 3 facteurs les plus importants

        // Ajouter chaque facteur principal
        for (const { factor, value } of sortedFactors) {
            if (Math.abs(value) < 0.1) continue; // Ignorer les facteurs neutres

            switch (factor) {
                case PaceFactor.PERFORMANCE:
                    reasoning += value > 0
                        ? "- Vos performances sont fortes, suggérant que vous pourriez progresser plus rapidement.\n"
                        : "- Vos performances actuelles suggèrent qu'un rythme plus délibéré pourrait être bénéfique.\n";
                    break;
                case PaceFactor.ENGAGEMENT:
                    reasoning += value > 0
                        ? "- Votre niveau d'engagement élevé indique que vous êtes prêt pour un défi plus important.\n"
                        : "- Votre niveau d'engagement suggère qu'un rythme plus accessible pourrait être préférable.\n";
                    break;
                case PaceFactor.FRUSTRATION:
                    reasoning += value > 0
                        ? "- Votre faible niveau de frustration indique que vous gérez bien le contenu actuel.\n"
                        : "- Des signes de fatigue ont été détectés, ce qui suggère de ralentir pour mieux assimiler.\n";
                    break;
                case PaceFactor.CONTENT_DIFFICULTY:
                    reasoning += value > 0
                        ? "- Le contenu actuel semble assez simple pour vous permettre d'avancer plus rapidement.\n"
                        : "- La complexité du contenu actuel suggère de prendre plus de temps pour l'assimiler.\n";
                    break;
                case PaceFactor.LEARNING_STYLE:
                    reasoning += value > 0
                        ? "- Le format d'apprentissage actuel semble bien correspondre à votre style d'apprentissage.\n"
                        : "- Un rythme différent pourrait mieux s'adapter à votre style d'apprentissage préféré.\n";
                    break;
                case PaceFactor.TIME_CONSTRAINTS:
                    reasoning += value > 0
                        ? "- Vos contraintes de temps actuelles suggèrent un besoin d'avancer plus efficacement.\n"
                        : "- Une approche plus approfondie semble appropriée compte tenu de votre disponibilité.\n";
                    break;
                case PaceFactor.PRIOR_KNOWLEDGE:
                    reasoning += value > 0
                        ? "- Vos connaissances préalables dans ce domaine vous permettent d'avancer plus rapidement.\n"
                        : "- Un rythme plus lent est recommandé pour solidifier vos connaissances fondamentales.\n";
                    break;
            }
        }

        // Ajouter une conclusion
        reasoning += `\nLe rythme recommandé est de ${(recommendedPace * 100).toFixed(0)}% du rythme standard.`;

        return reasoning;
    }

    /**
     * Estime l'impact potentiel de l'ajustement de rythme recommandé
     * 
     * @param currentPace - Rythme actuel
     * @param recommendedPace - Rythme recommandé
     * @param factors - Facteurs d'ajustement
     * @returns Estimation des impacts potentiels
     */
    private estimateImpact(
        currentPace: number,
        recommendedPace: number,
        factors: AdjustmentFactors
    ): DetailedImpactEstimation {
        // Calculer la magnitude du changement
        const changeDirection = recommendedPace > currentPace ? 1 : -1;
        const changeMagnitude = Math.abs(recommendedPace - currentPace);

        // Impact sur la compréhension
        let comprehensionImpact = 0;
        if (changeDirection < 0) {
            // Ralentir améliore généralement la compréhension
            comprehensionImpact = 10 * changeMagnitude;
        } else {
            // Accélérer peut légèrement réduire la compréhension
            comprehensionImpact = -5 * changeMagnitude;

            // Sauf si les performances et connaissances préalables sont élevées
            if (factors[PaceFactor.PERFORMANCE] > 0.5 && factors[PaceFactor.PRIOR_KNOWLEDGE] > 0.3) {
                comprehensionImpact = 0; // Pas d'impact négatif
            }
        }

        // Impact sur la rétention
        let retentionImpact = 0;
        if (changeDirection < 0) {
            // Ralentir améliore généralement la rétention
            retentionImpact = 15 * changeMagnitude;
        } else {
            // Accélérer peut réduire la rétention
            retentionImpact = -10 * changeMagnitude;

            // Moduler en fonction de l'engagement
            if (factors[PaceFactor.ENGAGEMENT] > 0.7) {
                retentionImpact *= 0.5; // Réduire l'impact négatif si très engagé
            }
        }

        // Impact sur le taux de complétion
        let completionImpact = 0;
        if (changeDirection < 0 && factors[PaceFactor.FRUSTRATION] < -0.3) {
            // Ralentir lorsque frustré améliore le taux de complétion
            completionImpact = 20 * changeMagnitude;
        } else if (changeDirection > 0 && factors[PaceFactor.ENGAGEMENT] < -0.3) {
            // Accélérer lorsque désengagé peut améliorer le taux de complétion
            completionImpact = 15 * changeMagnitude;
        } else if (changeDirection > 0) {
            // Accélérer peut généralement réduire légèrement le taux de complétion
            completionImpact = -5 * changeMagnitude;
        }

        // Impact sur la satisfaction
        let satisfactionImpact = 0;

        // Les apprenants frustrés sont plus satisfaits avec un rythme plus lent
        if (changeDirection < 0 && factors[PaceFactor.FRUSTRATION] < -0.3) {
            satisfactionImpact = 25 * changeMagnitude;
        }
        // Les apprenants performants sont plus satisfaits avec un rythme plus rapide
        else if (changeDirection > 0 && factors[PaceFactor.PERFORMANCE] > 0.5) {
            satisfactionImpact = 20 * changeMagnitude;
        }
        // Les apprenants apprécient généralement que le système s'adapte à leurs besoins
        else {
            satisfactionImpact = 5 * changeMagnitude;
        }

        // Impact sur le temps de maîtrise
        let timeToMasteryImpact = 0;
        if (changeDirection > 0) {
            // Accélérer réduit le temps de maîtrise (impact positif)
            timeToMasteryImpact = -15 * changeMagnitude; // Négatif car c'est une réduction de temps
        } else {
            // Ralentir augmente le temps de maîtrise (impact négatif)
            timeToMasteryImpact = 20 * changeMagnitude;

            // Mais peut être partiellement compensé par une meilleure compréhension
            if (factors[PaceFactor.CONTENT_DIFFICULTY] < -0.4) {
                timeToMasteryImpact *= 0.7; // Réduit l'impact négatif pour du contenu difficile
            }
        }

        // Limiter tous les impacts entre -30% et +30%
        return {
            comprehension: Math.max(-30, Math.min(30, comprehensionImpact)),
            retention: Math.max(-30, Math.min(30, retentionImpact)),
            completion: Math.max(-30, Math.min(30, completionImpact)),
            satisfaction: Math.max(-30, Math.min(30, satisfactionImpact)),
            timeToMastery: Math.max(-30, Math.min(30, timeToMasteryImpact))
        };
    }
}