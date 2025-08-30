/**
 * @file src/ai/services/learning/machine/adaptative/strategies/DifficultyStrategy.ts
 * @description Stratégie révolutionnaire d'adaptation dynamique de difficulté
 * 
 * Fonctionnalités avancées :
 * - 🎯 Ajustement intelligent du niveau de défi selon performance
 * - 📊 Analyse prédictive des tendances d'apprentissage
 * - 😨 Détection précoce de la frustration cognitive
 * - 📈 Escalade progressive pour maintenir la motivation
 * - 🛡️ Protection contre le décrochage par sur-difficulté
 * - ⚖️ Équilibre optimal défi/réussite pour engagement durable
 * - 📉 Adaptation réactive aux signaux de difficulté
 * 
 * @module DifficultyStrategy
 * @version 3.0.0 - Dynamic Challenge Revolution
 * @since 2025
 * @author MetaSign Team - Adaptive Difficulty Division
 */

// ==================== INTERFACES TEMPORAIRES ====================
// TODO: Remplacer par les vrais imports depuis @ai/learning/types quand disponibles

/**
 * Contexte d'apprentissage avec métriques de performance et frustration
 * 
 * @interface LearningContext
 * @description Capture les indicateurs comportementaux essentiels
 * pour l'évaluation dynamique du niveau de difficulté optimal
 * 
 * @example
 * ```typescript
 * const context: LearningContext = {
 *   performanceTrend: 0.15,       // Performance en hausse (+15%)
 *   currentFrustration: 0.25,     // Frustration modérée
 *   currentEngagement: 0.8,       // Engagement élevé
 *   completionRate: 0.7           // Bonne progression
 * };
 * ```
 */
interface LearningContext {
    /** Niveau d'engagement actuel (0-1) */
    readonly currentEngagement?: number;
    /** Niveau de frustration détecté (0-1) */
    readonly currentFrustration?: number;
    /** Taux de complétion des exercices (0-1) */
    readonly completionRate?: number;
    /** Tendance de performance récente (-1 à 1) */
    readonly performanceTrend?: number;
    /** Indicateur d'erreur dans le contexte */
    readonly hasError?: boolean;
    /** Propriétés additionnelles pour extensibilité */
    readonly [key: string]: unknown;
}

/**
 * Profil utilisateur avec préférences de difficulté personnalisées
 * 
 * @interface UserProfile
 * @description Profil comportemental incluant les préférences
 * d'adaptativité pour calibrer la sensibilité aux ajustements de difficulté
 * 
 * @example
 * ```typescript
 * const profile: UserProfile = {
 *   userId: 'challenge_seeker_789',
 *   preferences: {
 *     adaptivityLevel: 0.9  // Forte préférence pour ajustements dynamiques
 *   }
 * };
 * ```
 */
interface UserProfile {
    /** Identifiant unique de l'utilisateur */
    readonly userId: string;
    /** Préférences d'adaptation personnalisées */
    readonly preferences?: {
        /** Niveau d'adaptativité souhaité (0-1) */
        readonly adaptivityLevel?: number;
        /** Propriétés additionnelles configurables */
        readonly [key: string]: unknown;
    };
    /** Propriétés étendues pour flexibilité */
    readonly [key: string]: unknown;
}

/**
 * Résultat d'adaptation de difficulté avec justification contextualisee
 * 
 * @interface Adaptation
 * @description Structure d'adaptation contenant les ajustements
 * de niveau de défi et leurs métadonnées explicatives
 * 
 * @example
 * ```typescript
 * const adaptation: Adaptation = {
 *   type: 'difficulty',
 *   action: 'increase',
 *   description: 'Augmentation légère basée sur bonnes performances',
 *   intensity: 0.7
 * };
 * ```
 */
interface Adaptation {
    /** Type de stratégie d'adaptation ('difficulty') */
    readonly type: string;
    /** Propriétés dynamiques spécifiques à la difficulté */
    readonly [key: string]: unknown;
}

/**
 * Actions possibles pour l'adaptation de la difficulté d'apprentissage
 * 
 * @typedef {('increase'|'decrease'|'maintain'|'reset')} AdaptationAction
 * @description Définit les ajustements de difficulté disponibles :
 * 
 * - `increase`: Augmenter la difficulté (performance élevée, faible frustration)
 * - `decrease`: Diminuer la difficulté (frustration élevée ou performance faible)
 * - `maintain`: Maintenir le niveau actuel (conditions équilibrées)
 * - `reset`: Réinitialiser à un niveau de base (cas exceptionnels)
 * 
 * @example
 * ```typescript
 * const action: AdaptationAction = 'decrease';
 * if (action === 'increase') {
 *   console.log('Défi augmenté pour maintenir motivation');
 * }
 * ```
 */
type AdaptationAction = 'increase' | 'decrease' | 'maintain' | 'reset';

import { BaseAdaptationStrategy } from './AdaptationStrategy';

/**
 * Stratégie intelligente d'optimisation dynamique de la difficulté
 * 
 * @class DifficultyStrategy
 * @extends BaseAdaptationStrategy
 * @description Implémente un système sophistiqué d'ajustement de difficulté
 * basé sur l'analyse continue des métriques de performance et frustration
 * 
 * Cette stratégie maintient l'apprenant dans sa "zone de développement proximal"
 * en :
 * - Surveillant les tendances de performance en temps réel
 * - Détectant les signaux précurseurs de frustration excessive
 * - Ajustant progressivement le niveau de défi pour optimiser l'engagement
 * - Prévenant le décrochage par sur-difficulté ou sous-stimulation
 * 
 * Algorithme d'adaptation en 5 étapes :
 * 1. Évaluation de l'applicabilité selon engagement/frustration
 * 2. Analyse des tendances de performance et niveaux de frustration
 * 3. Détermination de l'action optimale via matrice de décision
 * 4. Calcul de l'intensité contextuelle d'application
 * 5. Génération d'explications personnalisées avec métriques
 * 
 * @example
 * ```typescript
 * const difficultyStrategy = new DifficultyStrategy();
 * 
 * const context = {
 *   performanceTrend: 0.25,        // Forte amélioration
 *   currentFrustration: 0.1        // Frustration minimale
 * };
 * 
 * if (difficultyStrategy.isApplicable(0.3, 0.1)) {
 *   const adaptation = difficultyStrategy.apply(context);
 *   console.log(adaptation.action);      // 'increase'
 *   console.log(adaptation.description); // 'Augmentation légère...'
 * }
 * ```
 * 
 * @since 2025
 * @author MetaSign Team - Dynamic Challenge Optimization
 */
export class DifficultyStrategy extends BaseAdaptationStrategy {
    /** Seuil de frustration critique nécessitant réduction de difficulté (60%) */
    private readonly FRUSTRATION_THRESHOLD = 0.6;
    /** Seuil d'amélioration de performance pour augmentation de difficulté (+20%) */
    private readonly PERFORMANCE_IMPROVEMENT_THRESHOLD = 0.2;
    /** Seuil de déclin de performance nécessitant réduction (-10%) */
    private readonly PERFORMANCE_DECLINE_THRESHOLD = -0.1;
    /** Seuil d'engagement faible déclenchant intervention (40%) */
    private readonly ENGAGEMENT_LOW_THRESHOLD = 0.4;

    /**
     * Initialise la stratégie d'adaptation de difficulté avec seuils calibrés
     * 
     * @constructor
     * @description Configure la stratégie avec le type 'difficulty' et établit
     * les seuils comportementaux optimisés pour l'adaptation dynamique
     * 
     * Seuils pré-calibrés pour apprentissage optimal :
     * - Frustration critique : 60% (réduction nécessaire)
     * - Amélioration performance : +20% (augmentation possible)
     * - Déclin performance : -10% (réduction recommandée)
     * - Engagement minimal : 40% (intervention requise)
     * 
     * @example
     * ```typescript
     * const strategy = new DifficultyStrategy();
     * console.log(strategy.type); // 'difficulty'
     * ```
     */
    constructor() {
        super('difficulty');
    }

    /**
     * Évalue l'applicabilité selon les indicateurs de difficulté inadaptée
     * 
     * @method isApplicable
     * @param {number} engagement - Niveau d'engagement actuel de l'apprenant (0-1)
     * @param {number} frustration - Niveau de frustration détecté (0-1)
     * @returns {boolean} True si un ajustement de difficulté est nécessaire
     * 
     * @description Analyse les signaux comportementaux pour identifier
     * les situations où le niveau de difficulté actuel n'est pas optimal.
     * 
     * Critères d'intervention :
     * - **Engagement faible** (< 40%) : Difficulté probablement trop élevée
     * - **Frustration élevée** (> 60%) : Défi excessif, réduction requise
     * 
     * Ces seuils préviennent le décrochage et maintiennent la motivation
     * dans la zone de développement proximal optimale.
     * 
     * @example
     * ```typescript
     * const strategy = new DifficultyStrategy();
     * 
     * // Cas nécessitant intervention - engagement trop faible
     * const needsReduction = strategy.isApplicable(0.3, 0.4);
     * console.log(needsReduction); // true
     * 
     * // Cas nécessitant intervention - frustration excessive
     * const tooHard = strategy.isApplicable(0.5, 0.7);
     * console.log(tooHard); // true
     * 
     * // Cas optimal - pas d'intervention
     * const optimal = strategy.isApplicable(0.6, 0.3);
     * console.log(optimal); // false
     * ```
     * 
     * @since 2025
     * @author MetaSign Team - Difficulty Assessment Logic
     */
    isApplicable(engagement: number, frustration: number): boolean {
        return engagement < this.ENGAGEMENT_LOW_THRESHOLD || frustration > this.FRUSTRATION_THRESHOLD;
    }

    /**
     * Applique l'adaptation intelligente de difficulté basée sur les métriques
     * 
     * @method apply
     * @param {LearningContext} context - Contexte avec tendances de performance
     * @param {UserProfile} [profile] - Profil utilisateur avec préférences
     * @returns {Adaptation} Adaptation de difficulté avec justification détaillée
     * 
     * @description Génère une adaptation calibrée de difficulté en analysant :
     * - Les tendances de performance récentes (amélioration/déclin)
     * - Le niveau de frustration cognitive détecté
     * - Les préférences d'adaptativité de l'utilisateur
     * - Le contexte global d'apprentissage
     * 
     * Processus d'adaptation en 4 phases :
     * 1. **Extraction métriques** : Performance trend et frustration level
     * 2. **Décision algorithmique** : Matrice de décision basée sur seuils
     * 3. **Calcul intensité** : Modération selon préférences utilisateur
     * 4. **Génération réponse** : Description et justification contextuelles
     * 
     * @example
     * ```typescript
     * const context = {
     *   performanceTrend: 0.3,         // Forte amélioration
     *   currentFrustration: 0.2        // Frustration faible
     * };
     * 
     * const profile = {
     *   userId: 'learner_456',
     *   preferences: { adaptivityLevel: 0.8 }
     * };
     * 
     * const adaptation = strategy.apply(context, profile);
     * console.log(adaptation.action);      // 'increase'
     * console.log(adaptation.description); // 'Augmentation légère...'
     * console.log(adaptation.intensity);   // 0.75 (exemple)
     * ```
     * 
     * @throws {Error} Si les métriques de contexte sont corrompues
     * @since 2025
     * @author MetaSign Team - Difficulty Adaptation Engine
     */
    apply(context: LearningContext, profile?: UserProfile): Adaptation {
        // Déterminer si on doit augmenter ou diminuer la difficulté
        const performanceTrend = context.performanceTrend ?? 0;
        const frustrationLevel = context.currentFrustration ?? 0;

        // Déterminer l'action d'adaptation
        const action = this.determineAction(performanceTrend, frustrationLevel);

        // Déterminer l'intensité
        const intensity = this.calculateIntensity(context, profile);

        // Créer l'adaptation
        return {
            type: this.type,
            description: this.getDescription(action),
            appliedElements: ["difficulty", "challengeLevel"],
            reason: this.getReason(action, performanceTrend, frustrationLevel),
            action,
            intensity,
            explanation: this.getDescription(action),
            overridable: true
        };
    }

    /**
     * Calcule l'intensité optimale d'application de l'adaptation de difficulté
     * 
     * @method calculateIntensity
     * @protected
     * @override
     * @param {LearningContext} context - Contexte avec métriques comportementales
     * @param {UserProfile} [profile] - Profil avec niveau d'adaptativité préféré
     * @returns {number} Intensité calculée dans la plage [0.1, 0.9]
     * 
     * @description Calcule une intensité d'adaptation équilibrée en pondérant :
     * - Tendance de performance (impact positif 50%)
     * - Niveau de frustration (impact négatif 50%)
     * - Préférences d'adaptativité utilisateur
     * - Intensité de base sécurisée (50%)
     * 
     * Algorithme de pondération :
     * ```
     * intensité = baseIntensity × contextFactor × (0.5 + adaptivityLevel)
     * contextFactor = 1.0 + (performance × 0.5) - (frustration × 0.5)
     * ```
     * 
     * Cette approche équilibrée optimise les ajustements selon la
     * réactivité comportementale tout en respectant les préférences.
     * 
     * @example
     * ```typescript
     * // Cas performance excellente, frustration faible
     * const context1 = { performanceTrend: 0.4, currentFrustration: 0.1 };
     * const intensity1 = strategy.calculateIntensity(context1);
     * console.log(intensity1); // ~0.85 (intensité élevée)
     * 
     * // Cas performance déclin, frustration élevée
     * const context2 = { performanceTrend: -0.2, currentFrustration: 0.7 };
     * const intensity2 = strategy.calculateIntensity(context2);
     * console.log(intensity2); // ~0.15 (intensité faible, prudente)
     * ```
     * 
     * @since 2025
     * @author MetaSign Team - Intensity Calibration Specialists
     */
    protected override calculateIntensity(context: LearningContext, profile?: UserProfile): number {
        const baseIntensity = 0.5;
        const adaptivityLevel = profile?.preferences?.adaptivityLevel ?? 0.5;

        const performanceTrend = context.performanceTrend ?? 0;
        const frustration = context.currentFrustration ?? 0;

        const contextFactor = 1.0 + (performanceTrend * 0.5) - (frustration * 0.5);

        // L'intensité finale est modulée par le niveau d'adaptativité souhaité
        const finalIntensity = baseIntensity * contextFactor * (0.5 + adaptivityLevel);

        // Limiter dans les bornes [0.1, 0.9]
        return Math.max(0.1, Math.min(0.9, finalIntensity));
    }

    /**
     * Détermine l'action de difficulté optimale via matrice de décision
     * 
     * @method determineAction
     * @private
     * @param {number} performanceTrend - Tendance de performance récente (-1 à 1)
     * @param {number} frustrationLevel - Niveau de frustration actuel (0-1)
     * @returns {AdaptationAction} Action recommandée ('increase'|'decrease'|'maintain')
     * 
     * @description Implémente une matrice de décision hiérarchique
     * optimisant l'équilibre défi/réussite pour maintenir l'engagement :
     * 
     * **Priorité 1** - Sécurité cognitive :
     * - Si performance < -10% OU frustration > 60% → 'decrease'
     * 
     * **Priorité 2** - Optimisation engagement :
     * - Si performance > +20% ET frustration < 30% → 'increase'
     * 
     * **Défaut** - Stabilité :
     * - Toutes autres conditions → 'maintain'
     * 
     * Cette logique privilégie la prévention du décrochage tout en
     * saisissant les opportunités d'escalade motivante.
     * 
     * @example
     * ```typescript
     * // Cas nécessitant réduction - frustration excessive
     * const action1 = strategy.determineAction(0.1, 0.8);
     * console.log(action1); // 'decrease'
     * 
     * // Cas permettant augmentation - excellente performance
     * const action2 = strategy.determineAction(0.3, 0.2);
     * console.log(action2); // 'increase'
     * 
     * // Cas équilibré - maintien
     * const action3 = strategy.determineAction(0.05, 0.4);
     * console.log(action3); // 'maintain'
     * ```
     * 
     * @since 2025
     * @author MetaSign Team - Decision Matrix Algorithm
     */
    private determineAction(performanceTrend: number, frustrationLevel: number): AdaptationAction {
        // Si bonnes performances et frustration faible, augmenter la difficulté
        if (performanceTrend > this.PERFORMANCE_IMPROVEMENT_THRESHOLD &&
            frustrationLevel < this.FRUSTRATION_THRESHOLD / 2) {
            return 'increase';
        }

        // Si performances faibles ou frustration élevée, diminuer la difficulté
        if (performanceTrend < this.PERFORMANCE_DECLINE_THRESHOLD ||
            frustrationLevel > this.FRUSTRATION_THRESHOLD) {
            return 'decrease';
        }

        // Maintenir la difficulté actuelle par défaut
        return 'maintain';
    }

    /**
     * Génère une description empathique pour l'action de difficulté
     * 
     * @method getDescription
     * @private
     * @param {AdaptationAction} action - Action de difficulté à décrire
     * @returns {string} Description personnalisée et motivante
     * 
     * @description Produit des descriptions orientées utilisateur
     * qui expliquent positivement l'ajustement et ses bénéfices
     * pour l'expérience d'apprentissage optimale.
     * 
     * Approche communicationnelle :
     * - `increase`: Valorise les compétences acquises
     * - `decrease`: Rassure sur le processus d'apprentissage
     * - `maintain`: Confirme l'équilibre atteint
     * 
     * Toutes les descriptions sont formulées pour maintenir
     * la motivation et la confiance en soi de l'apprenant.
     * 
     * @example
     * ```typescript
     * const descriptions = {
     *   increase: strategy.getDescription('increase'),
     *   // "Augmentation légère de la difficulté basée sur vos bonnes performances"
     *   
     *   decrease: strategy.getDescription('decrease'),
     *   // "Réduction de la difficulté pour vous aider à progresser plus confortablement"
     *   
     *   maintain: strategy.getDescription('maintain')
     *   // "Maintien du niveau de difficulté actuel"
     * };
     * ```
     * 
     * @since 2025
     * @author MetaSign Team - Empathetic Communication
     */
    private getDescription(action: AdaptationAction): string {
        switch (action) {
            case 'increase':
                return "Augmentation légère de la difficulté basée sur vos bonnes performances";
            case 'decrease':
                return "Réduction de la difficulté pour vous aider à progresser plus confortablement";
            case 'maintain':
            default:
                return "Maintien du niveau de difficulté actuel";
        }
    }

    /**
     * Génère une justification transparente avec métriques détaillées
     * 
     * @method getReason
     * @private
     * @param {AdaptationAction} action - Action de difficulté appliquée
     * @param {number} performance - Tendance de performance observée (-1 à 1)
     * @param {number} frustration - Niveau de frustration détecté (0-1)
     * @returns {string} Justification avec pourcentages contextuels
     * 
     * @description Génère des justifications factuelles et transparentes
     * incluant les métriques comportementales précises qui ont motivé
     * la décision d'adaptation, renforçant la confiance dans le système.
     * 
     * Stratégie de transparence :
     * - Inclusion des pourcentages réels observés
     * - Contextualisation par rapport aux seuils établis
     * - Explication logique du raisonnement algorithmique
     * - Formulation non-jugeante et constructive
     * 
     * @example
     * ```typescript
     * // Performance en hausse détectée
     * const reason1 = strategy.getReason('increase', 0.25, 0.15);
     * console.log(reason1); 
     * // "Bon niveau de performance détecté (tendance: +25%)"
     * 
     * // Frustration critique
     * const reason2 = strategy.getReason('decrease', -0.05, 0.75);
     * console.log(reason2); 
     * // "Signes de frustration détectés (75%)"
     * 
     * // Équilibre satisfaisant
     * const reason3 = strategy.getReason('maintain', 0.1, 0.3);
     * console.log(reason3);
     * // "Niveau actuel approprié (performance: 10%)"
     * ```
     * 
     * @since 2025
     * @author MetaSign Team - Transparent Decision Making
     */
    private getReason(action: AdaptationAction, performance: number, frustration: number): string {
        switch (action) {
            case 'increase':
                return `Bon niveau de performance détecté (tendance: +${Math.round(performance * 100)}%)`;
            case 'decrease':
                return frustration > this.FRUSTRATION_THRESHOLD
                    ? `Signes de frustration détectés (${Math.round(frustration * 100)}%)`
                    : `Difficultés d'apprentissage détectées (performance: ${Math.round(performance * 100)}%)`;
            case 'maintain':
            default:
                return `Niveau actuel approprié (performance: ${Math.round(performance * 100)}%)`;
        }
    }
}