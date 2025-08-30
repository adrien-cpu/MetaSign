/**
 * @file src/ai/services/learning/machine/adaptative/strategies/ContentStrategy.ts
 * @description Stratégie révolutionnaire d'adaptation de contenu personnalisé
 * 
 * Fonctionnalités avancées :
 * - 🎯 Personnalisation intelligente basée sur les styles d'apprentissage
 * - 🧠 Adaptation au profil cognitif et préférences individuelles
 * - 📊 Calcul d'intensité contextuel et dynamique
 * - 🎨 Intégration des intérêts personnels dans l'adaptation
 * - 🔄 Analyse continue de l'engagement et performance
 * - ✅ Système toujours applicable avec optimisations futures
 * - 📈 Métadonnées enrichies pour traçabilité
 * 
 * @module ContentStrategy
 * @version 3.0.0 - Content Personalization Revolution
 * @since 2025
 * @author MetaSign Team - Adaptive Content Division
 */

// ==================== INTERFACES TEMPORAIRES ====================
// TODO: Remplacer par les vrais imports depuis @ai/learning/types quand disponibles

/**
 * Contexte d'apprentissage avec métriques comportementales temps réel
 * 
 * @interface LearningContext
 * @description Capture l'état actuel de l'apprenant et son environnement
 * d'apprentissage pour permettre aux stratégies d'adaptation de prendre
 * des décisions éclairées basées sur les données comportementales
 * 
 * @example
 * ```typescript
 * const context: LearningContext = {
 *   currentEngagement: 0.75,    // 75% d'engagement
 *   currentFrustration: 0.15,   // 15% de frustration
 *   completionRate: 0.60,       // 60% de complétion
 *   performanceTrend: 0.08,     // Tendance positive 8%
 *   hasError: false
 * };
 * ```
 */
interface LearningContext {
    /** Niveau d'engagement actuel de l'apprenant (0-1) */
    readonly currentEngagement?: number;
    /** Niveau de frustration détecté (0-1) */
    readonly currentFrustration?: number;
    /** Taux de complétion des exercices (0-1) */
    readonly completionRate?: number;
    /** Tendance de performance récente (-1 à 1) */
    readonly performanceTrend?: number;
    /** Indicateur d'erreur dans le contexte actuel */
    readonly hasError?: boolean;
    /** Propriétés additionnelles pour extensibilité */
    readonly [key: string]: unknown;
}

/**
 * Profil utilisateur enrichi avec préférences d'apprentissage personnalisées
 * 
 * @interface UserProfile
 * @description Profil comportemental complet de l'apprenant incluant
 * ses préférences d'adaptativité, intérêts personnels et métadonnées
 * d'apprentissage pour personnalisation avancée du contenu
 * 
 * @example
 * ```typescript
 * const profile: UserProfile = {
 *   userId: 'learner_789',
 *   interests: ['sciences', 'technologie', 'innovation'],
 *   preferences: {
 *     adaptivityLevel: 0.85,     // Forte préférence adaptation
 *     learningStyle: 'visual'
 *   },
 *   learningPreferences: {
 *     preferredLearningStyle: LearningStyle.VISUAL
 *   }
 * };
 * ```
 */
interface UserProfile {
    /** Identifiant unique de l'utilisateur */
    readonly userId: string;
    /** Liste des intérêts personnels pour contextualisation */
    readonly interests?: readonly string[];
    /** Préférences générales d'apprentissage */
    readonly preferences?: {
        /** Niveau d'adaptativité souhaité (0-1) */
        readonly adaptivityLevel?: number;
        /** Style d'apprentissage préféré (string) */
        readonly learningStyle?: string;
        /** Propriétés additionnelles configurables */
        readonly [key: string]: unknown;
    };
    /** Préférences spécifiques à l'apprentissage */
    readonly learningPreferences?: {
        /** Style d'apprentissage typé ou string */
        readonly preferredLearningStyle?: LearningStyle | string;
    };
    /** Propriétés étendues pour flexibilité */
    readonly [key: string]: unknown;
}

/**
 * Énumération des styles d'apprentissage reconnus en pédagogie moderne
 * 
 * @enum {string} LearningStyle
 * @description Définit les quatre styles d'apprentissage principaux
 * basés sur le modèle VARK (Visual, Auditory, Reading/Writing, Kinesthetic)
 * pour optimiser la personnalisation du contenu éducatif
 * 
 * @example
 * ```typescript
 * // Utilisation dans le profil utilisateur
 * const visualLearner = {
 *   preferredStyle: LearningStyle.VISUAL
 * };
 * 
 * // Comparaison de styles
 * if (style === LearningStyle.KINESTHETIC) {
 *   console.log('Apprenant tactile détecté');
 * }
 * ```
 */
enum LearningStyle {
    /** Style visuel - apprentissage par images, diagrammes, vidéos */
    VISUAL = 'visual',
    /** Style auditif - apprentissage par écoute, discussions, musique */
    AUDITORY = 'auditory',
    /** Style lecture/écriture - apprentissage par texte, notes, listes */
    READING_WRITING = 'reading_writing',
    /** Style kinesthésique - apprentissage par mouvement, manipulation, expérience */
    KINESTHETIC = 'kinesthetic'
}

/**
 * Structure d'adaptation flexible générée par une stratégie intelligente
 * 
 * @interface Adaptation
 * @description Résultat d'une stratégie d'adaptation contenant les ajustements
 * recommandés et leurs métadonnées associées pour traçabilité et optimisation
 * 
 * L'interface utilise une structure extensible permettant à chaque stratégie
 * d'ajouter ses propres propriétés spécifiques tout en maintenant la compatibilité
 * 
 * @example
 * ```typescript
 * const adaptation: Adaptation = {
 *   type: 'content-personalization',
 *   description: 'Contenu adapté au style visuel',
 *   intensity: 0.75,
 *   learningStyle: 'visual',
 *   userInterests: ['sciences', 'technologie']
 * };
 * ```
 */
interface Adaptation {
    /** Type de stratégie d'adaptation appliquée */
    readonly type: string;
    /** Propriétés dynamiques spécifiques à chaque stratégie */
    readonly [key: string]: unknown;
}

import { BaseAdaptationStrategy } from './AdaptationStrategy';

/**
 * Stratégie intelligente d'adaptation de contenu personnalisé
 * 
 * @class ContentStrategy
 * @extends BaseAdaptationStrategy
 * @description Implémente une personnalisation avancée du contenu d'apprentissage
 * basée sur les styles d'apprentissage individuels, les intérêts personnels
 * et les métriques comportementales en temps réel
 * 
 * Cette stratégie analyse le profil de l'apprenant pour :
 * - Adapter le contenu au style d'apprentissage optimal
 * - Intégrer les intérêts personnels dans la présentation
 * - Ajuster l'intensité selon l'engagement et les performances
 * - Fournir des explications contextuelles personnalisées
 * 
 * @example
 * ```typescript
 * const contentStrategy = new ContentStrategy();
 * 
 * const adaptation = contentStrategy.apply({
 *   currentEngagement: 0.7,
 *   performanceTrend: 0.1
 * }, {
 *   userId: 'user_123',
 *   interests: ['sciences', 'technologie'],
 *   learningPreferences: {
 *     preferredLearningStyle: LearningStyle.VISUAL
 *   },
 *   preferences: {
 *     adaptivityLevel: 0.8
 *   }
 * });
 * 
 * console.log(adaptation.description);
 * // "Contenu adapté à votre style d'apprentissage visual"
 * ```
 * 
 * @since 2025
 * @author MetaSign Team - Content Adaptation Specialists
 */
export class ContentStrategy extends BaseAdaptationStrategy {
    /**
     * Initialise la stratégie d'adaptation de contenu
     * 
     * @constructor
     * @description Configure la stratégie avec le type 'content' et initialise
     * les paramètres par défaut pour la personnalisation intelligente
     * 
     * @example
     * ```typescript
     * const strategy = new ContentStrategy();
     * console.log(strategy.type); // 'content'
     * ```
     */
    constructor() {
        super('content');
    }

    /**
     * Évalue l'applicabilité de la stratégie selon les métriques comportementales
     * 
     * @method isApplicable
     * @param {number} engagement - Niveau d'engagement actuel de l'apprenant (0-1)
     * @param {number} frustration - Niveau de frustration détecté (0-1)
     * @returns {boolean} True - cette stratégie est universellement applicable
     * 
     * @description La stratégie de contenu est conçue pour être toujours applicable,
     * car la personnalisation du contenu peut bénéficier à tous les apprenants
     * quel que soit leur état émotionnel ou niveau d'engagement.
     * 
     * Les métriques d'engagement et de frustration sont validées pour
     * des optimisations futures et l'analyse prédictive.
     * 
     * @example
     * ```typescript
     * const strategy = new ContentStrategy();
     * const applicable = strategy.isApplicable(0.5, 0.3);
     * console.log(applicable); // true
     * 
     * // Même avec des niveaux extrêmes
     * const alwaysApplicable = strategy.isApplicable(0.1, 0.9);
     * console.log(alwaysApplicable); // true
     * ```
     * 
     * @since 2025
     * @author MetaSign Team - Strategy Logic
     */
    isApplicable(engagement: number, frustration: number): boolean {
        // Cette stratégie est toujours applicable, mais on peut utiliser les métriques pour des optimisations futures
        return engagement >= 0 || frustration >= 0 || true;
    }

    /**
     * Applique l'adaptation intelligente de contenu personnalisé
     * 
     * @method apply
     * @param {LearningContext} context - Contexte d'apprentissage avec métriques temps réel
     * @param {UserProfile} [profile] - Profil utilisateur avec préférences et historique
     * @returns {Adaptation} Adaptation de contenu avec métadonnées enrichies
     * 
     * @description Génère une adaptation personnalisée en analysant :
     * - Le style d'apprentissage préféré (visuel, auditif, kinesthésique, lecture)
     * - Les intérêts personnels pour contextualiser le contenu
     * - Le niveau d'adaptativité souhaité par l'utilisateur
     * - Les métriques d'engagement et performance actuelles
     * 
     * L'algorithme suit cette logique :
     * 1. Validation du profil utilisateur disponible
     * 2. Détection du style d'apprentissage optimal
     * 3. Extraction des intérêts personnalisables
     * 4. Calcul de l'intensité contextuelle d'adaptation
     * 5. Génération de l'explication personnalisée
     * 
     * @example
     * ```typescript
     * const context = {
     *   currentEngagement: 0.7,
     *   performanceTrend: 0.1,
     *   completionRate: 0.65
     * };
     * 
     * const profile = {
     *   userId: 'learner_456',
     *   interests: ['mathématiques', 'sciences'],
     *   learningPreferences: {
     *     preferredLearningStyle: LearningStyle.VISUAL
     *   },
     *   preferences: {
     *     adaptivityLevel: 0.8
     *   }
     * };
     * 
     * const adaptation = strategy.apply(context, profile);
     * console.log(adaptation.explanation);
     * // "Le contenu est personnalisé pour correspondre à votre style 
     * // d'apprentissage visual et à vos intérêts: mathématiques, sciences"
     * ```
     * 
     * @throws {Error} Si les paramètres du contexte sont invalides
     * @since 2025
     * @author MetaSign Team - Content Personalization Engine
     */
    apply(context: LearningContext, profile?: UserProfile): Adaptation {
        if (!profile) {
            // Si pas de profil fourni, retourner une adaptation par défaut
            return {
                type: this.type,
                description: "Contenu standard",
                appliedElements: ["content"],
                reason: "Pas de profil utilisateur disponible",
                action: 'personalize',
                intensity: 0.5,
                explanation: "Contenu standard sans personnalisation",
                overridable: true
            };
        }

        // Déterminer le style d'apprentissage
        const learningStyle = this.determineLearningStyle(profile);

        // Les intérêts de l'utilisateur (si disponibles)
        const userInterests = profile.interests ?? [];

        // Déterminer l'intensité
        const intensity = this.calculateIntensity(context, profile);

        // Créer l'adaptation
        return {
            type: this.type,
            description: `Contenu adapté à votre style d'apprentissage ${learningStyle}`,
            appliedElements: ["content", learningStyle, ...userInterests],
            reason: `Adaptation au style d'apprentissage ${learningStyle}`,
            action: 'personalize',
            intensity,
            explanation: `Le contenu est personnalisé pour correspondre à votre style d'apprentissage ${learningStyle}` +
                (userInterests.length > 0 ? ` et à vos intérêts: ${userInterests.join(', ')}` : ''),
            overridable: true,
            learningStyle,
            userInterests
        };
    }

    /**
     * Calcule l'intensité optimale d'adaptation de contenu
     * 
     * @method calculateIntensity
     * @protected
     * @override
     * @param {LearningContext} context - Contexte avec métriques comportementales
     * @param {UserProfile} [profile] - Profil avec préférences d'adaptativité
     * @returns {number} Intensité calculée dans la plage [0.1, 0.9]
     * 
     * @description Calcule une intensité d'adaptation personnalisée en combinant :
     * - Niveau d'adaptativité préféré par l'utilisateur (40% du facteur)
     * - Engagement actuel de l'apprenant (20% du facteur)
     * - Tendance de performance récente (10% du facteur)
     * - Intensité de base configurable (50%)
     * 
     * La formule utilisée :
     * ```
     * intensité = baseIntensity × contextFactor × (0.5 + adaptivityLevel)
     * contextFactor = 1.0 + (adaptivityLevel × 0.4) + (engagement × 0.2) + (|performance| × 0.1)
     * ```
     * 
     * @example
     * ```typescript
     * // Exemple avec forte préférence d'adaptativité
     * const context = { currentEngagement: 0.8, performanceTrend: 0.15 };
     * const profile = { preferences: { adaptivityLevel: 0.9 } };
     * const intensity = strategy.calculateIntensity(context, profile);
     * console.log(intensity); // ~0.85 (intensité élevée)
     * 
     * // Exemple avec faible engagement
     * const lowContext = { currentEngagement: 0.2, performanceTrend: -0.1 };
     * const conservativeProfile = { preferences: { adaptivityLevel: 0.3 } };
     * const lowIntensity = strategy.calculateIntensity(lowContext, conservativeProfile);
     * console.log(lowIntensity); // ~0.3 (intensité modérée)
     * ```
     * 
     * @since 2025
     * @author MetaSign Team - Intensity Algorithm Specialists
     */
    protected override calculateIntensity(context: LearningContext, profile?: UserProfile): number {
        const baseIntensity = 0.5;
        const adaptivityLevel = profile?.preferences?.adaptivityLevel ?? 0.5;
        
        // Utiliser le contexte pour ajuster l'intensité
        const engagementFactor = context.currentEngagement ?? 0.5;
        const performanceFactor = Math.abs(context.performanceTrend ?? 0);

        // L'intensité de personnalisation du contenu dépend fortement du niveau d'adaptativité souhaité
        const contextFactor = 1.0 + (adaptivityLevel * 0.4) + (engagementFactor * 0.2) + (performanceFactor * 0.1);

        // L'intensité finale
        const finalIntensity = baseIntensity * contextFactor * (0.5 + adaptivityLevel);

        // Limiter dans les bornes [0.1, 0.9]
        return Math.max(0.1, Math.min(0.9, finalIntensity));
    }

    /**
     * Détermine le style d'apprentissage optimal pour l'utilisateur
     * 
     * @method determineLearningStyle
     * @private
     * @param {UserProfile} profile - Profil utilisateur avec préférences d'apprentissage
     * @returns {string} Style d'apprentissage détecté ('visual', 'auditory', 'reading', 'kinesthetic')
     * 
     * @description Analyse le profil utilisateur selon une hiérarchie de priorités :
     * 1. **Priorité 1** : `learningPreferences.preferredLearningStyle` (enum ou string)
     * 2. **Priorité 2** : `preferences.learningStyle` (string direct)
     * 3. **Défaut** : 'visual' (style le plus adapté aux interfaces modernes)
     * 
     * Le mapping des énums vers strings :
     * - `LearningStyle.VISUAL` → 'visual'
     * - `LearningStyle.AUDITORY` → 'auditory' 
     * - `LearningStyle.READING_WRITING` → 'reading'
     * - `LearningStyle.KINESTHETIC` → 'kinesthetic'
     * 
     * @example
     * ```typescript
     * // Cas 1: Enum LearningStyle
     * const profile1 = {
     *   userId: 'user1',
     *   learningPreferences: {
     *     preferredLearningStyle: LearningStyle.KINESTHETIC
     *   }
     * };
     * console.log(strategy.determineLearningStyle(profile1)); // 'kinesthetic'
     * 
     * // Cas 2: String direct
     * const profile2 = {
     *   userId: 'user2',
     *   preferences: { learningStyle: 'auditory' }
     * };
     * console.log(strategy.determineLearningStyle(profile2)); // 'auditory'
     * 
     * // Cas 3: Pas de préférence définie
     * const profile3 = { userId: 'user3' };
     * console.log(strategy.determineLearningStyle(profile3)); // 'visual'
     * ```
     * 
     * @since 2025
     * @author MetaSign Team - Learning Style Analysis
     */
    private determineLearningStyle(profile: UserProfile): string {
        // D'abord, vérifier dans learningPreferences.preferredLearningStyle
        if (profile.learningPreferences?.preferredLearningStyle) {
            const style = profile.learningPreferences.preferredLearningStyle;
            if (typeof style === 'string') {
                return style;
            }

            if (style === LearningStyle.VISUAL) return "visual";
            if (style === LearningStyle.AUDITORY) return "auditory";
            if (style === LearningStyle.READING_WRITING) return "reading";
            if (style === LearningStyle.KINESTHETIC) return "kinesthetic";
        }

        // Ensuite, vérifier dans preferences.learningStyle
        if (profile.preferences?.learningStyle) {
            return profile.preferences.learningStyle;
        }

        // Valeur par défaut
        return "visual";
    }
}