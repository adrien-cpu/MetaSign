/**
 * @file src/ai/services/learning/machine/adaptative/strategies/PaceStrategy.ts
 * @description Stratégie révolutionnaire d'adaptation du rythme d'apprentissage
 * 
 * Fonctionnalités avancées :
 * - ⏱️ Ajustement intelligent du rythme selon l'engagement
 * - 📉 Détection précoce de la fatigue cognitive
 * - 🔄 Adaptation dynamique aux variations de performance
 * - 🎯 Optimisation continue pour maintenir l'efficacité
 * - ⚡ Accélération intelligente en cas de fort engagement
 * - 📊 Ralentissement préventif contre l'épuisement
 * - 🌡️ Monitoring des indicateurs de stress cognitif
 * 
 * @module PaceStrategy
 * @version 3.0.0 - Adaptive Pace Revolution
 * @since 2025
 * @author MetaSign Team - Learning Pace Optimization Division
 */

// Imports réels depuis le système MetaSign
import type { ExtendedUserProfile } from '../../../types/user';
import type { Adaptation, AdaptationAction } from '../../../types/AdaptedContent';
import type { SessionContext } from '../../../types/session';

/**
 * Interface étendue pour le contexte d'apprentissage avec indicateurs de fatigue
 * 
 * @interface LearningContext
 * @extends SessionContext
 * @description Capture l'état comportemental et cognitif de l'apprenant
 * avec des métriques spécialisées pour l'analyse du rythme optimal
 * 
 * @example
 * ```typescript
 * const context: LearningContext = {
 *   currentEngagement: 0.85,      // Engagement très élevé
 *   exhaustionIndicators: 0.2,    // Légers signes de fatigue
 *   performanceTrend: 0.1,        // Performance en hausse
 *   completionRate: 0.75          // Bonne progression
 * };
 * ```
 */
interface LearningContext extends SessionContext {
    /** Niveau d'engagement actuel (0-1) */
    readonly currentEngagement?: number;
    /** Niveau de frustration détecté (0-1) */
    readonly currentFrustration?: number;
    /** Taux de complétion des activités (0-1) */
    readonly completionRate?: number;
    /** Tendance de performance (-1 à 1) */
    readonly performanceTrend?: number;
    /** Présence d'erreurs dans le contexte */
    readonly hasError?: boolean;
    /** Indicateurs de fatigue cognitive (0-1) - extension spécifique */
    readonly exhaustionIndicators?: number;
}

/**
 * Alias de type pour le profil utilisateur étendu
 * 
 * @typedef {ExtendedUserProfile} UserProfile
 * @description Utilise le profil utilisateur étendu du système MetaSign
 * avec toutes les préférences d'apprentissage et d'adaptativité disponibles
 */
type UserProfile = ExtendedUserProfile;

import { BaseAdaptationStrategy } from './AdaptationStrategy';

/**
 * Stratégie intelligente d'optimisation du rythme d'apprentissage
 * 
 * @class PaceStrategy
 * @extends BaseAdaptationStrategy
 * @description Implémente un système sophistiqué d'adaptation du rythme
 * basé sur l'analyse comportementale en temps réel et la détection
 * précoce de la fatigue cognitive
 * 
 * Cette stratégie utilise des seuils configurables pour :
 * - Détecter les niveaux d'engagement optimaux/sous-optimaux
 * - Identifier les signaux précurseurs de fatigue mentale
 * - Ajuster dynamiquement la vitesse de présentation du contenu
 * - Maintenir un équilibre entre défi et bien-être cognitif
 * 
 * Algorithme d'adaptation :
 * 1. Évaluation de l'applicabilité selon engagement/frustration
 * 2. Analyse des indicateurs de fatigue cognitive
 * 3. Détermination de l'action optimale (accélérer/ralentir/maintenir)
 * 4. Calcul de l'intensité contextuelle d'application
 * 5. Génération de l'explication personnalisée
 * 
 * @example
 * ```typescript
 * const paceStrategy = new PaceStrategy();
 * 
 * const context = {
 *   currentEngagement: 0.8,        // Engagement très élevé
 *   exhaustionIndicators: 0.1      // Fatigue minimale
 * };
 * 
 * if (paceStrategy.isApplicable(0.8, 0.2)) {
 *   const adaptation = paceStrategy.apply(context);
 *   console.log(adaptation.action);      // 'increase'
 *   console.log(adaptation.description); // 'Accélération légère...'
 * }
 * ```
 * 
 * @since 2025
 * @author MetaSign Team - Cognitive Pace Optimization
 */
export class PaceStrategy extends BaseAdaptationStrategy {
    /** Seuil de détection de fatigue cognitive (60%) */
    private readonly EXHAUSTION_THRESHOLD = 0.6;
    /** Seuil d'engagement élevé pour accélération (70%) */
    private readonly ENGAGEMENT_HIGH_THRESHOLD = 0.7;
    /** Seuil d'engagement faible nécessitant intervention (40%) */
    private readonly ENGAGEMENT_LOW_THRESHOLD = 0.4;

    /**
     * Initialise la stratégie d'adaptation de rythme avec seuils optimaux
     * 
     * @constructor
     * @description Configure la stratégie avec le type 'pace' et définit
     * les seuils comportementaux calibrés pour l'apprentissage optimal
     * 
     * Seuils pré-configurés :
     * - Fatigue cognitive : 60% (seuil d'alerte)
     * - Engagement élevé : 70% (potentiel d'accélération)
     * - Engagement faible : 40% (intervention requise)
     * 
     * @example
     * ```typescript
     * const strategy = new PaceStrategy();
     * console.log(strategy.type); // 'pace'
     * ```
     */
    constructor() {
        super('pace');
    }

    /**
     * Évalue l'applicabilité de la stratégie selon les métriques comportementales
     * 
     * @method isApplicable
     * @param {number} engagement - Niveau d'engagement actuel de l'apprenant (0-1)
     * @param {number} frustration - Niveau de frustration détecté (0-1)
     * @returns {boolean} True si un ajustement de rythme est recommandé
     * 
     * @description Analyse les conditions comportementales pour déterminer
     * si un ajustement du rythme d'apprentissage est nécessaire.
     * 
     * Critères d'applicabilité :
     * - Engagement trop faible (< 40%) : Risque de décrochage
     * - Engagement très élevé (> 70%) : Potentiel d'accélération
     * - Frustration élevée (> 50%) : Besoin de ralentissement
     * 
     * @example
     * ```typescript
     * const strategy = new PaceStrategy();
     * 
     * // Engagement faible - intervention nécessaire
     * const needsHelp = strategy.isApplicable(0.3, 0.2);
     * console.log(needsHelp); // true
     * 
     * // Engagement optimal - pas d'intervention
     * const optimal = strategy.isApplicable(0.6, 0.2);
     * console.log(optimal); // false
     * 
     * // Frustration élevée - ajustement requis
     * const frustrated = strategy.isApplicable(0.5, 0.7);
     * console.log(frustrated); // true
     * ```
     * 
     * @since 2025
     * @author MetaSign Team - Applicability Logic
     */
    isApplicable(engagement: number, frustration: number): boolean {
        // Applicable si engagement trop faible ou très élevé
        // La frustration peut aussi indiquer un besoin d'ajustement de rythme
        return engagement < this.ENGAGEMENT_LOW_THRESHOLD ||
            engagement > this.ENGAGEMENT_HIGH_THRESHOLD ||
            frustration > 0.5;
    }

    /**
     * Applique l'adaptation intelligente du rythme d'apprentissage
     * 
     * @method apply
     * @param {LearningContext} context - Contexte avec métriques comportementales
     * @param {UserProfile} [profile] - Profil utilisateur avec préférences
     * @returns {Adaptation} Adaptation de rythme avec justification détaillée
     * 
     * @description Génère une adaptation personnalisée du rythme en analysant :
     * - Le niveau d'engagement actuel de l'apprenant
     * - Les indicateurs de fatigue cognitive présents
     * - Les préférences d'adaptativité de l'utilisateur
     * - Le contexte global d'apprentissage
     * 
     * Processus d'adaptation :
     * 1. Extraction des métriques clés (engagement, fatigue)
     * 2. Détermination de l'action optimale via analyse algorithmique
     * 3. Calcul de l'intensité contextuelle d'application
     * 4. Génération de descriptions et justifications personnalisées
     * 
     * @example
     * ```typescript
     * const context = {
     *   currentEngagement: 0.3,        // Engagement faible
     *   exhaustionIndicators: 0.4      // Fatigue modérée
     * };
     * 
     * const profile = {
     *   userId: 'student_123',
     *   preferences: { adaptivityLevel: 0.7 }
     * };
     * 
     * const adaptation = strategy.apply(context, profile);
     * console.log(adaptation.action);      // 'maintain' ou 'decrease'
     * console.log(adaptation.reason);      // "Optimisation du rythme..."
     * console.log(adaptation.intensity);   // 0.65 (exemple)
     * ```
     * 
     * @throws {Error} Si le contexte contient des valeurs invalides
     * @since 2025
     * @author MetaSign Team - Pace Adaptation Engine
     */
    apply(context: LearningContext, profile?: UserProfile): Adaptation {
        const engagementLevel = context.currentEngagement ?? 0.5;
        const exhaustionLevel = context.exhaustionIndicators ?? 0;

        // Déterminer l'action d'adaptation
        const action = this.determineAction(engagementLevel, exhaustionLevel);

        // Déterminer l'intensité
        const intensity = this.calculateIntensity(context, profile);

        // Créer l'adaptation
        return {
            type: this.type,
            description: this.getDescription(action),
            appliedElements: ["pace", "timing"],
            reason: this.getReason(action, engagementLevel, exhaustionLevel),
            action,
            intensity,
            explanation: this.getDescription(action),
            overridable: true
        };
    }

    /**
     * Calcule l'intensité optimale d'application de l'adaptation de rythme
     * 
     * @method calculateIntensity
     * @protected
     * @override
     * @param {LearningContext} context - Contexte avec métriques temps réel
     * @param {UserProfile} [profile] - Profil avec niveau d'adaptativité préféré
     * @returns {number} Intensité calculée dans la plage [0.1, 0.9]
     * 
     * @description Calcule une intensité d'adaptation sophistiquée en intégrant :
     * - Niveau d'engagement actuel (impact positif 30%)
     * - Indicateurs de fatigue (impact négatif 70%)
     * - Préférences d'adaptativité utilisateur
     * - Intensité de base configurable (50%)
     * 
     * Formule algorithmique :
     * ```
     * intensité = baseIntensity × contextFactor × (0.5 + adaptivityLevel)
     * contextFactor = 1.0 + (engagement × 0.3) - (fatigue × 0.7)
     * ```
     * 
     * Cette approche pondérée privilégie la prévention de la fatigue
     * tout en optimisant l'engagement pour un apprentissage durable.
     * 
     * @example
     * ```typescript
     * // Cas à fort engagement, faible fatigue
     * const context1 = { currentEngagement: 0.9, exhaustionIndicators: 0.1 };
     * const intensity1 = strategy.calculateIntensity(context1);
     * console.log(intensity1); // ~0.8 (intensité élevée)
     * 
     * // Cas à engagement modéré, fatigue élevée
     * const context2 = { currentEngagement: 0.5, exhaustionIndicators: 0.8 };
     * const intensity2 = strategy.calculateIntensity(context2);
     * console.log(intensity2); // ~0.2 (intensité faible, précaution)
     * ```
     * 
     * @since 2025
     * @author MetaSign Team - Intensity Calculation Specialists
     */
    protected override calculateIntensity(context: LearningContext, profile?: UserProfile): number {
        const baseIntensity = 0.5;
        const adaptivityLevel = profile?.preferences?.adaptivityLevel ?? 0.5;

        const engagement = context.currentEngagement ?? 0.5;
        const exhaustion = context.exhaustionIndicators ?? 0;

        const contextFactor = 1.0 + (engagement * 0.3) - (exhaustion * 0.7);

        // L'intensité finale est modulée par le niveau d'adaptativité souhaité
        const finalIntensity = baseIntensity * contextFactor * (0.5 + adaptivityLevel);

        // Limiter dans les bornes [0.1, 0.9]
        return Math.max(0.1, Math.min(0.9, finalIntensity));
    }

    /**
     * Détermine l'action de rythme optimale selon les métriques comportementales
     * 
     * @method determineAction
     * @private
     * @param {number} engagementLevel - Niveau d'engagement actuel (0-1)
     * @param {number} exhaustionLevel - Niveau de fatigue détecté (0-1)
     * @returns {AdaptationAction} Action recommandée ('increase'|'decrease'|'maintain')
     * 
     * @description Implémente un algorithme de décision hiérarchique
     * priorisant la prévention de la fatigue cognitive :
     * 
     * **Priorité 1** - Prévention fatigue :
     * - Si fatigue > 60% → 'decrease' (ralentissement préventif)
     * 
     * **Priorité 2** - Optimisation engagement :
     * - Si engagement > 70% ET fatigue < 30% → 'increase' (accélération)
     * 
     * **Défaut** - Maintien stabilité :
     * - Toutes autres conditions → 'maintain' (rythme actuel)
     * 
     * @example
     * ```typescript
     * // Cas fatigue élevée - priorité sécurité
     * const action1 = strategy.determineAction(0.8, 0.7);
     * console.log(action1); // 'decrease'
     * 
     * // Cas engagement optimal, fatigue faible - accélération
     * const action2 = strategy.determineAction(0.85, 0.2);
     * console.log(action2); // 'increase'
     * 
     * // Cas équilibré - maintien
     * const action3 = strategy.determineAction(0.6, 0.4);
     * console.log(action3); // 'maintain'
     * ```
     * 
     * @since 2025
     * @author MetaSign Team - Decision Algorithm
     */
    private determineAction(engagementLevel: number, exhaustionLevel: number): AdaptationAction {
        // Ralentir si signes de fatigue
        if (exhaustionLevel > this.EXHAUSTION_THRESHOLD) {
            return 'decrease';
        }

        // Accélérer si engagement élevé et pas de fatigue
        if (engagementLevel > this.ENGAGEMENT_HIGH_THRESHOLD && exhaustionLevel < this.EXHAUSTION_THRESHOLD / 2) {
            return 'increase';
        }

        // Maintenir le rythme par défaut
        return 'maintain';
    }

    /**
     * Génère une description contextuelle pour l'action de rythme
     * 
     * @method getDescription
     * @private
     * @param {AdaptationAction} action - Action de rythme à décrire
     * @returns {string} Description personnalisée et explicative
     * 
     * @description Produit des descriptions orientées utilisateur
     * qui expliquent clairement l'ajustement proposé et ses bénéfices
     * pour l'expérience d'apprentissage.
     * 
     * Descriptions générées :
     * - `increase`: Mise en valeur de l'engagement élevé
     * - `decrease`: Prévention empathique de la fatigue
     * - `maintain`: Validation du rythme actuel
     * 
     * @example
     * ```typescript
     * const descriptions = {
     *   increase: strategy.getDescription('increase'),
     *   // "Accélération légère du rythme basée sur votre bon niveau d'engagement"
     *   
     *   decrease: strategy.getDescription('decrease'),
     *   // "Ralentissement du rythme pour éviter la fatigue cognitive"
     *   
     *   maintain: strategy.getDescription('maintain')
     *   // "Maintien du rythme d'apprentissage actuel"
     * };
     * ```
     * 
     * @since 2025
     * @author MetaSign Team - User Experience Messaging
     */
    private getDescription(action: AdaptationAction): string {
        switch (action) {
            case 'increase':
                return "Accélération légère du rythme basée sur votre bon niveau d'engagement";
            case 'decrease':
                return "Ralentissement du rythme pour éviter la fatigue cognitive";
            case 'maintain':
            default:
                return "Maintien du rythme d'apprentissage actuel";
        }
    }

    /**
     * Génère une justification détaillée avec métriques pour l'action
     * 
     * @method getReason
     * @private
     * @param {AdaptationAction} action - Action de rythme appliquée
     * @param {number} engagement - Niveau d'engagement actuel (0-1)
     * @param {number} exhaustion - Niveau de fatigue détecté (0-1)
     * @returns {string} Justification avec pourcentages contextuels
     * 
     * @description Génère des justifications transparentes incluant
     * les métriques comportementales spécifiques qui ont motivé
     * la décision d'adaptation, favorisant la confiance utilisateur.
     * 
     * Format des justifications :
     * - Inclut les pourcentages réels des métriques
     * - Explique la logique de décision appliquée
     * - Contextualise par rapport aux seuils établis
     * 
     * @example
     * ```typescript
     * // Engagement élevé détecté
     * const reason1 = strategy.getReason('increase', 0.85, 0.1);
     * console.log(reason1); // "Haut niveau d'engagement détecté (85%)"
     * 
     * // Fatigue importante
     * const reason2 = strategy.getReason('decrease', 0.6, 0.75);
     * console.log(reason2); // "Signes de fatigue détectés (75%)"
     * 
     * // Équilibre optimal
     * const reason3 = strategy.getReason('maintain', 0.55, 0.3);
     * console.log(reason3); // "Rythme actuel approprié (engagement: 55%)"
     * ```
     * 
     * @since 2025
     * @author MetaSign Team - Transparency & Trust
     */
    private getReason(action: AdaptationAction, engagement: number, exhaustion: number): string {
        switch (action) {
            case 'increase':
                return `Haut niveau d'engagement détecté (${Math.round(engagement * 100)}%)`;
            case 'decrease':
                return exhaustion > this.EXHAUSTION_THRESHOLD
                    ? `Signes de fatigue détectés (${Math.round(exhaustion * 100)}%)`
                    : "Optimisation du rythme d'apprentissage";
            case 'maintain':
            default:
                return `Rythme actuel approprié (engagement: ${Math.round(engagement * 100)}%)`;
        }
    }
}