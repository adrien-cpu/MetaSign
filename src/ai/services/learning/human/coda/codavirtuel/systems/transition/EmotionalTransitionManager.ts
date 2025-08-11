/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/transition/EmotionalTransitionManager.ts
 * @description Gestionnaire de transitions émotionnelles fluides pour IA-élèves
 * 
 * Fonctionnalités révolutionnaires :
 * - 🌊 Transitions émotionnelles fluides et naturelles
 * - 📈 Courbes de transition personnalisées
 * - ⚡ Calcul de durées adaptatif
 * - 🎯 Règles de transition basées sur recherche
 * - 🔄 Gestion des transitions multiples simultanées
 * 
 * @module EmotionalTransitionManager
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Emotional AI Division
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type { AIPersonalityProfile } from '../AIPersonalitySystem';
import type {
    EmotionalState,
    EmotionalTransition,
    TransitionCurve,
    PrimaryEmotion
} from '../types/EmotionalTypes';
import { TRANSITION_RULES } from '../types/EmotionalTypes';

/**
 * Configuration du gestionnaire de transitions
 */
export interface TransitionManagerConfig {
    /** Vitesse de transition par défaut (ms) */
    readonly defaultTransitionSpeed: number;
    /** Facteur de lissage des transitions */
    readonly smoothingFactor: number;
    /** Délai minimum entre transitions */
    readonly minTransitionDelay: number;
    /** Délai maximum pour une transition */
    readonly maxTransitionDuration: number;
    /** Activer les transitions personnalisées */
    readonly enablePersonalizedTransitions: boolean;
}

/**
 * Résultat de calcul de transition
 */
export interface TransitionCalculationResult {
    /** Durée calculée de la transition */
    readonly duration: number;
    /** Courbe de transition recommandée */
    readonly curve: TransitionCurve;
    /** Confiance dans le calcul */
    readonly confidence: number;
    /** Facteurs utilisés dans le calcul */
    readonly factors: TransitionFactors;
}

/**
 * Facteurs influençant une transition
 */
export interface TransitionFactors {
    /** Facteur de personnalité */
    readonly personalityFactor: number;
    /** Facteur d'intensité */
    readonly intensityFactor: number;
    /** Facteur de règle de transition */
    readonly ruleFactor: number;
    /** Facteur de contexte */
    readonly contextFactor: number;
}

/**
 * État d'une transition active
 */
export interface ActiveTransitionState {
    /** Transition en cours */
    readonly transition: EmotionalTransition;
    /** Progression (0-1) */
    readonly progress: number;
    /** État interpolé actuel */
    readonly currentState: EmotionalState;
    /** Temps restant (ms) */
    readonly remainingTime: number;
}

/**
 * Gestionnaire de transitions émotionnelles révolutionnaire
 * 
 * @class EmotionalTransitionManager
 * @description Gère les transitions fluides entre états émotionnels avec
 * personnalisation, courbes adaptatives et règles basées sur la recherche.
 * 
 * @example
 * ```typescript
 * const manager = new EmotionalTransitionManager({
 *   defaultTransitionSpeed: 2000,
 *   enablePersonalizedTransitions: true
 * });
 * 
 * const result = await manager.calculateTransition(fromState, toState, personality);
 * await manager.executeTransition(studentId, transition);
 * ```
 */
export class EmotionalTransitionManager {
    /**
     * Logger pour le gestionnaire de transitions
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('EmotionalTransitionManager_v3');

    /**
     * Configuration du gestionnaire
     * @private
     * @readonly
     */
    private readonly config: TransitionManagerConfig;

    /**
     * Transitions actives par étudiant
     * @private
     */
    private readonly activeTransitions = new Map<string, ActiveTransitionState>();

    /**
     * Callbacks de fin de transition
     * @private
     */
    private readonly transitionCallbacks = new Map<string, () => void>();

    /**
     * Constructeur du gestionnaire de transitions
     * 
     * @constructor
     * @param {Partial<TransitionManagerConfig>} [config] - Configuration optionnelle
     */
    constructor(config?: Partial<TransitionManagerConfig>) {
        this.config = {
            defaultTransitionSpeed: 2000,
            smoothingFactor: 0.8,
            minTransitionDelay: 100,
            maxTransitionDuration: 10000,
            enablePersonalizedTransitions: true,
            ...config
        };

        this.startTransitionProcessor();

        this.logger.info('🌊 Gestionnaire de transitions émotionnelles initialisé', {
            config: this.config
        });
    }

    /**
     * Calcule les paramètres optimaux d'une transition
     * 
     * @method calculateTransition
     * @async
     * @param {EmotionalState} fromState - État de départ
     * @param {EmotionalState} toState - État d'arrivée
     * @param {AIPersonalityProfile} [personality] - Profil de personnalité
     * @returns {Promise<TransitionCalculationResult>} Résultat du calcul
     * @public
     */
    public async calculateTransition(
        fromState: EmotionalState,
        toState: EmotionalState,
        personality?: AIPersonalityProfile
    ): Promise<TransitionCalculationResult> {
        try {
            this.logger.debug('🔄 Calcul de transition', {
                from: fromState.primaryEmotion,
                to: toState.primaryEmotion,
                hasPersonality: !!personality
            });

            // Calculer les facteurs d'influence
            const factors = this.calculateTransitionFactors(fromState, toState, personality);

            // Calculer la durée basée sur les facteurs
            const duration = this.calculateDuration(fromState, toState, factors);

            // Sélectionner la courbe de transition
            const curve = this.selectTransitionCurve(fromState, toState, factors);

            // Calculer la confiance
            const confidence = this.calculateTransitionConfidence(factors);

            const result: TransitionCalculationResult = {
                duration,
                curve,
                confidence,
                factors
            };

            this.logger.debug('✨ Transition calculée', {
                duration,
                curve,
                confidence: confidence.toFixed(2)
            });

            return result;
        } catch (error) {
            this.logger.error('❌ Erreur calcul transition', { error });
            throw error;
        }
    }

    /**
     * Exécute une transition émotionnelle
     * 
     * @method executeTransition
     * @async
     * @param {string} studentId - ID de l'IA-élève
     * @param {EmotionalTransition} transition - Transition à exécuter
     * @returns {Promise<void>}
     * @public
     */
    public async executeTransition(
        studentId: string,
        transition: EmotionalTransition
    ): Promise<void> {
        try {
            this.logger.debug('🚀 Exécution transition', {
                studentId,
                from: transition.fromState.primaryEmotion,
                to: transition.toState.primaryEmotion,
                duration: transition.duration
            });

            // Arrêter toute transition en cours
            this.stopTransition(studentId);

            // Créer l'état de transition active
            const activeState: ActiveTransitionState = {
                transition,
                progress: 0,
                currentState: transition.fromState,
                remainingTime: transition.duration
            };

            this.activeTransitions.set(studentId, activeState);

            // Planifier la fin de transition
            const timeoutId = setTimeout(() => {
                this.completeTransition(studentId);
            }, transition.duration);

            this.transitionCallbacks.set(studentId, () => {
                clearTimeout(timeoutId);
            });

            this.logger.info('🌊 Transition démarrée', {
                studentId,
                duration: transition.duration,
                curve: transition.curve
            });
        } catch (error) {
            this.logger.error('❌ Erreur exécution transition', { studentId, error });
            throw error;
        }
    }

    /**
     * Obtient l'état de transition actuel d'un étudiant
     * 
     * @method getTransitionState
     * @param {string} studentId - ID de l'IA-élève
     * @returns {ActiveTransitionState | undefined} État de transition actuel
     * @public
     */
    public getTransitionState(studentId: string): ActiveTransitionState | undefined {
        return this.activeTransitions.get(studentId);
    }

    /**
     * Arrête une transition en cours
     * 
     * @method stopTransition
     * @param {string} studentId - ID de l'IA-élève
     * @returns {void}
     * @public
     */
    public stopTransition(studentId: string): void {
        const callback = this.transitionCallbacks.get(studentId);
        if (callback) {
            callback();
            this.transitionCallbacks.delete(studentId);
        }

        this.activeTransitions.delete(studentId);
        this.logger.debug('⏹️ Transition arrêtée', { studentId });
    }

    /**
     * Vérifie si une transition est en cours
     * 
     * @method isTransitioning
     * @param {string} studentId - ID de l'IA-élève
     * @returns {boolean} True si transition en cours
     * @public
     */
    public isTransitioning(studentId: string): boolean {
        return this.activeTransitions.has(studentId);
    }

    // ================== MÉTHODES PRIVÉES ==================

    /**
     * Calcule les facteurs influençant une transition
     */
    private calculateTransitionFactors(
        fromState: EmotionalState,
        toState: EmotionalState,
        personality?: AIPersonalityProfile
    ): TransitionFactors {
        // Facteur de personnalité
        const personalityFactor = this.calculatePersonalityFactor(fromState, toState, personality);

        // Facteur d'intensité (différence d'intensité)
        const intensityDiff = Math.abs(toState.intensity - fromState.intensity);
        const intensityFactor = 0.5 + intensityDiff * 0.5;

        // Facteur de règle de transition
        const ruleFactor = this.calculateRuleFactor(fromState.primaryEmotion, toState.primaryEmotion);

        // Facteur de contexte (similarité des déclencheurs)
        const contextFactor = this.calculateContextFactor(fromState.trigger, toState.trigger);

        return {
            personalityFactor,
            intensityFactor,
            ruleFactor,
            contextFactor
        };
    }

    /**
     * Calcule le facteur de personnalité
     */
    private calculatePersonalityFactor(
        fromState: EmotionalState,
        toState: EmotionalState,
        personality?: AIPersonalityProfile
    ): number {
        if (!personality || !this.config.enablePersonalizedTransitions) {
            return 1.0;
        }

        // Neuroticisme affecte la volatilité émotionnelle
        const neuroticism = personality.bigFiveTraits.neuroticism;

        // Extraversion affecte les transitions vers émotions positives
        const extraversion = personality.bigFiveTraits.extraversion;

        let factor = 1.0;

        // Ajustement basé sur le neuroticisme
        if (toState.valence < fromState.valence) {
            // Transition vers émotions négatives
            factor *= (0.5 + neuroticism * 0.5); // Plus rapide si névrotique
        } else {
            // Transition vers émotions positives
            factor *= (0.5 + extraversion * 0.5); // Plus rapide si extraverti
        }

        return Math.max(0.3, Math.min(2.0, factor));
    }

    /**
     * Calcule le facteur de règle de transition
     */
    private calculateRuleFactor(from: PrimaryEmotion, to: PrimaryEmotion): number {
        const ruleKey = `${from}->${to}`;
        const rule = TRANSITION_RULES[ruleKey];

        if (rule !== undefined) {
            return rule; // Utilise la règle directement
        }

        // Règle par défaut basée sur la valence
        const fromValence = this.getEmotionValence(from);
        const toValence = this.getEmotionValence(to);
        const valenceDiff = Math.abs(toValence - fromValence);

        return Math.max(0.2, 1.0 - valenceDiff * 0.3);
    }

    /**
     * Calcule le facteur de contexte
     */
    private calculateContextFactor(fromTrigger: string, toTrigger: string): number {
        // Similarité simple basée sur les mots communs
        const fromWords = fromTrigger.toLowerCase().split(/\s+/);
        const toWords = toTrigger.toLowerCase().split(/\s+/);

        const commonWords = fromWords.filter(word => toWords.includes(word));
        const totalWords = new Set([...fromWords, ...toWords]).size;

        return totalWords > 0 ? (commonWords.length / totalWords) * 0.5 + 0.5 : 0.5;
    }

    /**
     * Calcule la durée de transition
     */
    private calculateDuration(
        fromState: EmotionalState,
        toState: EmotionalState,
        factors: TransitionFactors
    ): number {
        let baseDuration = this.config.defaultTransitionSpeed;

        // Ajustement basé sur les facteurs
        baseDuration *= factors.personalityFactor;
        baseDuration *= factors.intensityFactor;
        baseDuration *= (2.0 - factors.ruleFactor); // Règle forte = transition plus rapide
        baseDuration *= (2.0 - factors.contextFactor); // Contexte similaire = transition plus rapide

        // Ajustement basé sur la différence de valence
        const valenceDiff = Math.abs(toState.valence - fromState.valence);
        baseDuration *= (1.0 + valenceDiff * 0.5);

        // Contraintes min/max
        return Math.max(
            this.config.minTransitionDelay,
            Math.min(this.config.maxTransitionDuration, Math.round(baseDuration))
        );
    }

    /**
     * Sélectionne la courbe de transition
     */
    private selectTransitionCurve(
        fromState: EmotionalState,
        toState: EmotionalState,
        factors: TransitionFactors
    ): TransitionCurve {
        // Courbe basée sur le type de transition
        if (toState.primaryEmotion === 'surprise') {
            return 'bounce'; // Surprise = rebond
        }

        if (toState.primaryEmotion === 'joy' && toState.intensity > 0.8) {
            return 'elastic'; // Joie intense = élastique
        }

        // Courbe basée sur l'intensité
        if (fromState.intensity > toState.intensity) {
            return factors.personalityFactor > 1.2 ? 'ease_out' : 'linear';
        } else {
            return factors.intensityFactor > 0.8 ? 'ease_in' : 'ease_in_out';
        }
    }

    /**
     * Calcule la confiance dans la transition
     */
    private calculateTransitionConfidence(factors: TransitionFactors): number {
        // Moyenne pondérée des facteurs
        const weights = {
            personality: 0.2,
            intensity: 0.3,
            rule: 0.4,
            context: 0.1
        };

        return (
            factors.personalityFactor * weights.personality +
            factors.intensityFactor * weights.intensity +
            factors.ruleFactor * weights.rule +
            factors.contextFactor * weights.context
        ) / 4;
    }

    /**
     * Obtient la valence d'une émotion
     */
    private getEmotionValence(emotion: PrimaryEmotion): number {
        const valenceMap: Record<PrimaryEmotion, number> = {
            'joy': 0.9, 'trust': 0.7, 'anticipation': 0.5,
            'surprise': 0.0, 'sadness': -0.7, 'fear': -0.6,
            'anger': -0.8, 'disgust': -0.5
        };
        return valenceMap[emotion];
    }

    /**
     * Démarre le processeur de transitions
     */
    private startTransitionProcessor(): void {
        setInterval(() => {
            this.updateActiveTransitions();
        }, 50); // Mise à jour toutes les 50ms pour fluidité
    }

    /**
     * Met à jour les transitions actives
     */
    private updateActiveTransitions(): void {
        const now = Date.now();

        this.activeTransitions.forEach((activeState, studentId) => {
            const elapsed = now - activeState.transition.startTime.getTime();
            const progress = Math.min(elapsed / activeState.transition.duration, 1);

            if (progress >= 1) {
                this.completeTransition(studentId);
                return;
            }

            // Interpoler l'état actuel
            const currentState = this.interpolateState(
                activeState.transition.fromState,
                activeState.transition.toState,
                progress,
                activeState.transition.curve
            );

            const updatedState: ActiveTransitionState = {
                ...activeState,
                progress,
                currentState,
                remainingTime: activeState.transition.duration - elapsed
            };

            this.activeTransitions.set(studentId, updatedState);
        });
    }

    /**
     * Interpole entre deux états émotionnels
     */
    private interpolateState(
        from: EmotionalState,
        to: EmotionalState,
        progress: number,
        curve: TransitionCurve
    ): EmotionalState {
        // Appliquer la courbe de transition
        const easedProgress = this.applyCurve(progress, curve);

        // Interpoler les valeurs numériques
        const intensity = from.intensity + (to.intensity - from.intensity) * easedProgress;
        const valence = from.valence + (to.valence - from.valence) * easedProgress;
        const arousal = from.arousal + (to.arousal - from.arousal) * easedProgress;

        // Changer l'émotion primaire à mi-chemin
        const primaryEmotion = easedProgress < 0.5 ? from.primaryEmotion : to.primaryEmotion;

        return {
            primaryEmotion,
            intensity,
            secondaryEmotions: progress < 0.5 ? from.secondaryEmotions : to.secondaryEmotions,
            valence,
            arousal,
            trigger: progress < 0.5 ? from.trigger : to.trigger,
            timestamp: new Date(),
            expectedDuration: to.expectedDuration
        };
    }

    /**
     * Applique une courbe de transition
     */
    private applyCurve(progress: number, curve: TransitionCurve): number {
        switch (curve) {
            case 'linear':
                return progress;
            case 'ease_in':
                return progress * progress;
            case 'ease_out':
                return 1 - (1 - progress) * (1 - progress);
            case 'ease_in_out':
                return progress < 0.5
                    ? 2 * progress * progress
                    : 1 - 2 * (1 - progress) * (1 - progress);
            case 'bounce':
                return this.bounceEasing(progress);
            case 'elastic':
                return this.elasticEasing(progress);
            default:
                return progress;
        }
    }

    /**
     * Fonction d'easing bounce
     */
    private bounceEasing(t: number): number {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
    }

    /**
     * Fonction d'easing elastic
     */
    private elasticEasing(t: number): number {
        if (t === 0 || t === 1) return t;

        const period = 0.3;
        const amplitude = 1;
        const s = period / 4;

        return amplitude * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / period) + 1;
    }

    /**
     * Complète une transition
     */
    private completeTransition(studentId: string): void {
        const activeState = this.activeTransitions.get(studentId);
        if (!activeState) return;

        this.logger.debug('✅ Transition terminée', {
            studentId,
            finalEmotion: activeState.transition.toState.primaryEmotion
        });

        this.stopTransition(studentId);
    }
}