// src/ai/learning/adapters/strategies/AdaptationStrategy.ts

import { LearningContext, UserProfile } from '@ai/learning/types';
import { Adaptation } from '@ai/learning/types/AdaptedContent';

/**
 * Définition des niveaux de priorité pour les adaptations
 */
export type AdaptationPriority = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';

/**
 * Seuils d'application des stratégies en fonction des métriques
 */
export interface StrategyThresholds {
    /** Seuil minimal d'engagement pour appliquer la stratégie */
    minEngagement: number;
    /** Seuil maximal d'engagement pour appliquer la stratégie */
    maxEngagement: number;
    /** Seuil minimal de frustration pour appliquer la stratégie */
    minFrustration: number;
    /** Seuil maximal de frustration pour appliquer la stratégie */
    maxFrustration: number;
}

/**
 * Métadonnées d'une adaptation
 */
export interface AdaptationMetadata {
    /** Pourcentage d'efficacité prévu (0-1) */
    predictedEffectiveness?: number;
    /** Facteurs influençant l'application de cette stratégie */
    influencingFactors?: string[];
    /** Justification de l'intensité appliquée */
    intensityReasoning?: string;
    /** Historique des adaptations similaires appliquées */
    previousApplications?: Array<{
        timestamp: Date;
        context: string;
        success: boolean;
    }>;
    /** Métadonnées supplémentaires spécifiques à la stratégie */
    [key: string]: unknown;
}

/**
 * Interface définissant une stratégie d'adaptation
 */
export interface IAdaptationStrategy {
    /**
     * Type d'adaptation produit par cette stratégie
     */
    readonly type: string;

    /**
     * Priorité de la stratégie (utilisée pour résoudre les conflits)
     */
    readonly priority: AdaptationPriority;

    /**
     * Description de la stratégie
     */
    readonly description: string;

    /**
     * Applique la stratégie d'adaptation au contexte actuel
     * 
     * @param context Contexte d'apprentissage actuel
     * @param profile Profil de l'utilisateur
     * @returns Adaptation recommandée
     */
    apply(context: LearningContext, profile?: UserProfile): Adaptation;

    /**
     * Détermine si cette stratégie est applicable dans le contexte actuel
     * 
     * @param engagement Niveau d'engagement prédit
     * @param frustration Niveau de frustration prédit
     * @param context Contexte d'apprentissage complet (optionnel)
     * @returns Si la stratégie est applicable
     */
    isApplicable(engagement: number, frustration: number, context?: LearningContext): boolean;

    /**
     * Évalue l'impact potentiel de cette stratégie dans le contexte actuel
     * 
     * @param context Contexte d'apprentissage
     * @param profile Profil utilisateur
     * @returns Score d'impact prédit (0-1)
     */
    evaluateImpact(context: LearningContext, profile?: UserProfile): number;

    /**
     * Génère les métadonnées pour cette adaptation
     * 
     * @param context Contexte d'apprentissage
     * @param profile Profil utilisateur
     * @returns Métadonnées de l'adaptation
     */
    generateMetadata(context: LearningContext, profile?: UserProfile): AdaptationMetadata;
}

/**
 * Classe de base abstraite pour les stratégies d'adaptation
 */
export abstract class BaseAdaptationStrategy implements IAdaptationStrategy {
    /**
     * Seuils d'application par défaut pour cette stratégie
     */
    protected readonly thresholds: StrategyThresholds;

    /**
     * Crée une nouvelle stratégie d'adaptation
     * 
     * @param type Type d'adaptation produit par cette stratégie
     * @param priority Priorité de la stratégie (défaut: 'medium')
     * @param description Description de la stratégie
     * @param thresholds Seuils d'application (optionnel, valeurs par défaut appliquées)
     */
    constructor(
        public readonly type: string,
        public readonly priority: AdaptationPriority = 'medium',
        public readonly description: string = '',
        thresholds?: Partial<StrategyThresholds>
    ) {
        // Valeurs par défaut qui permettent à la stratégie d'être applicable
        // dans la plupart des cas, mais les classes dérivées peuvent les personnaliser
        this.thresholds = {
            minEngagement: 0.0,
            maxEngagement: 1.0,
            minFrustration: 0.0,
            maxFrustration: 1.0,
            ...thresholds
        };
    }

    /**
     * Applique la stratégie d'adaptation au contexte actuel
     */
    abstract apply(context: LearningContext, profile?: UserProfile): Adaptation;

    /**
     * Détermine si la stratégie est applicable en fonction des niveaux d'engagement et de frustration
     * 
     * @param engagement Niveau d'engagement prédit (0-1)
     * @param frustration Niveau de frustration prédit (0-1)
     * @param context Contexte d'apprentissage complet (optionnel)
     * @returns Si la stratégie est applicable
     */
    isApplicable(engagement: number, frustration: number, context?: LearningContext): boolean {
        // Vérification des niveaux d'engagement et de frustration par rapport aux seuils
        const engagementInRange =
            engagement >= this.thresholds.minEngagement &&
            engagement <= this.thresholds.maxEngagement;

        const frustrationInRange =
            frustration >= this.thresholds.minFrustration &&
            frustration <= this.thresholds.maxFrustration;

        // Vérification de base sur les seuils
        const baseApplicability = engagementInRange && frustrationInRange;

        // Si le contexte est fourni, appliquer une validation supplémentaire spécifique
        if (context && baseApplicability) {
            return this.validateContextSpecificConditions(context);
        }

        return baseApplicability;
    }

    /**
     * Évalue l'impact potentiel de cette stratégie dans le contexte actuel
     * 
     * @param context Contexte d'apprentissage
     * @param profile Profil utilisateur
     * @returns Score d'impact prédit (0-1)
     */
    evaluateImpact(context: LearningContext, profile?: UserProfile): number {
        // Implémentation par défaut : impact moyen basé sur l'intensité
        const intensity = this.calculateIntensity(context, profile);

        // L'impact est modélisé comme une fonction de l'intensité et de facteurs contextuels
        const baseImpact = intensity * 0.8; // 80% de l'impact est déterminé par l'intensité

        // Le reste de l'impact est déterminé par des facteurs contextuels
        const contextualFactor = this.evaluateContextualFactor(context, profile);

        // Combinaison des facteurs pour le score d'impact final
        return Math.min(1.0, baseImpact + (contextualFactor * 0.2));
    }

    /**
     * Génère les métadonnées pour cette adaptation
     * 
     * @param context Contexte d'apprentissage
     * @param profile Profil utilisateur
     * @returns Métadonnées de l'adaptation
     */
    generateMetadata(context: LearningContext, profile?: UserProfile): AdaptationMetadata {
        const intensity = this.calculateIntensity(context, profile);
        const impact = this.evaluateImpact(context, profile);

        return {
            predictedEffectiveness: impact,
            influencingFactors: this.identifyInfluencingFactors(context, profile),
            intensityReasoning: `Intensité ${(intensity * 100).toFixed(0)}% basée sur le profil utilisateur et le contexte d'apprentissage actuel.`
        };
    }

    /**
     * Calcule l'intensité d'une adaptation en fonction du contexte et du profil
     * 
     * @param context Contexte d'apprentissage actuel
     * @param profile Profil de l'utilisateur 
     * @returns Valeur d'intensité entre 0.1 et 0.9
     */
    protected calculateIntensity(context: LearningContext, profile?: UserProfile): number {
        const baseIntensity = 0.5;

        // Facteurs liés au profil utilisateur
        const adaptivityLevel = profile?.preferences?.adaptivityLevel ?? 0.5;

        // Facteurs liés au contexte d'apprentissage
        const engagementFactor = this.calculateEngagementFactor(context);
        const frustrationFactor = this.calculateFrustrationFactor(context);
        const progressionFactor = this.calculateProgressionFactor(context);

        // Calcul de l'intensité en combinant tous les facteurs
        let finalIntensity = baseIntensity;

        // Modulation par le niveau d'adaptativité souhaité
        finalIntensity *= (0.5 + adaptivityLevel);

        // Modulation par les facteurs contextuels
        finalIntensity *= (0.8 + (engagementFactor * 0.1) + (frustrationFactor * 0.1) - (progressionFactor * 0.1));

        // Limiter dans les bornes [0.1, 0.9]
        return Math.max(0.1, Math.min(0.9, finalIntensity));
    }

    /**
     * Valide les conditions spécifiques au contexte pour l'applicabilité de la stratégie
     * Peut être surchargée par les classes dérivées pour ajouter une logique spécifique
     * 
     * @param _context Contexte d'apprentissage à valider
     * @returns Si le contexte satisfait aux conditions spécifiques
     */
    protected validateContextSpecificConditions(_context: LearningContext): boolean {
        // Par défaut, aucune condition supplémentaire
        return true;
    }

    /**
     * Calcule un facteur d'influence basé sur l'engagement dans le contexte actuel
     * 
     * @param context Contexte d'apprentissage
     * @returns Facteur d'engagement (0-1)
     */
    protected calculateEngagementFactor(context: LearningContext): number {
        // Utilisation du niveau d'engagement actuel s'il est disponible,
        // sinon utilisation d'une valeur moyenne
        return context.currentEngagement ?? 0.5;
    }

    /**
     * Calcule un facteur d'influence basé sur la frustration dans le contexte actuel
     * 
     * @param context Contexte d'apprentissage
     * @returns Facteur de frustration (0-1)
     */
    protected calculateFrustrationFactor(context: LearningContext): number {
        // Utilisation du niveau de frustration actuel s'il est disponible,
        // sinon utilisation d'une valeur basse
        return context.currentFrustration ?? 0.2;
    }

    /**
     * Calcule un facteur d'influence basé sur la progression dans le contexte actuel
     * 
     * @param context Contexte d'apprentissage
     * @returns Facteur de progression (0-1)
     */
    protected calculateProgressionFactor(context: LearningContext): number {
        // Utilisation du taux de complétion s'il est disponible,
        // sinon utilisation d'une valeur moyenne
        return context.completionRate ?? 0.5;
    }

    /**
     * Évalue l'influence des facteurs contextuels sur l'impact de la stratégie
     * 
     * @param evaluationContext Contexte d'apprentissage
     * @param evaluationProfile Profil utilisateur
     * @returns Facteur contextuel (0-1)
     */
    protected evaluateContextualFactor(evaluationContext: LearningContext, evaluationProfile?: UserProfile): number {
        // Implémentation par défaut, à surcharger par les classes dérivées
        // Utilisation des paramètres pour éviter les avertissements ESLint
        if (evaluationContext.hasError || (evaluationProfile && evaluationProfile.userId === '')) {
            return 0.3; // Facteur plus faible en cas d'erreur
        }
        return 0.5;
    }

    /**
     * Identifie les facteurs qui influencent cette adaptation dans le contexte actuel
     * 
     * @param context Contexte d'apprentissage
     * @param profile Profil utilisateur
     * @returns Liste des facteurs d'influence
     */
    protected identifyInfluencingFactors(context: LearningContext, profile?: UserProfile): string[] {
        const factors: string[] = [];

        // Facteurs liés à l'engagement
        if (context.currentEngagement !== undefined) {
            if (context.currentEngagement < 0.3) {
                factors.push('Faible engagement détecté');
            } else if (context.currentEngagement > 0.7) {
                factors.push('Niveau d\'engagement élevé');
            }
        }

        // Facteurs liés à la frustration
        if (context.currentFrustration !== undefined) {
            if (context.currentFrustration > 0.6) {
                factors.push('Niveau de frustration élevé');
            }
        }

        // Facteurs liés aux performances
        if (context.performanceTrend !== undefined) {
            if (context.performanceTrend < -0.3) {
                factors.push('Tendance de performance en baisse');
            } else if (context.performanceTrend > 0.3) {
                factors.push('Tendance de performance en hausse');
            }
        }

        // Facteurs liés au profil utilisateur
        if (profile?.preferences?.adaptivityLevel !== undefined) {
            if (profile.preferences.adaptivityLevel > 0.7) {
                factors.push('Préférence pour une forte adaptativité');
            }
        }

        // Si aucun facteur spécifique n'est identifié, ajouter un facteur générique
        if (factors.length === 0) {
            factors.push('Adaptation basée sur les paramètres généraux');
        }

        return factors;
    }
}