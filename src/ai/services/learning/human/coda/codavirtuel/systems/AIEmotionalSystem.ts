/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/AIEmotionalSystem.ts
 * @description Moteur émotionnel révolutionnaire pour IA-élèves avec intelligence émotionnelle avancée
 * 
 * Fonctionnalités révolutionnaires :
 * - 🎭 Modèle émotionnel multi-dimensionnel (Plutchik + LSF)
 * - 💫 Transitions émotionnelles fluides et naturelles
 * - 🧠 Intelligence émotionnelle contextuelle
 * - 🔄 Adaptation émotionnelle temps réel
 * - 🌈 Expressions émotionnelles spécifiques LSF
 * - 📊 Historique émotionnel et patterns d'apprentissage
 * 
 * @module AIEmotionalSystem
 * @version 3.0.0 - Révolution CODA (Refactorisé)
 * @since 2025
 * @author MetaSign Team - Emotional AI Division
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type { AIPersonalityProfile } from './AIPersonalitySystem';

// Modules spécialisés
import { EmotionalPatternDetector } from './pattern/EmotionalPatternDetector';
import { EmotionalTransitionManager } from './transition/EmotionalTransitionManager';
import { EmotionalHistoryManager } from './history/EmotionalHistoryManager';

// Types et constantes
import {
    DEFAULT_EMOTIONAL_CONFIG,
    EMOTION_VALENCE_MAP,
    EMOTION_BASE_DURATIONS
} from './types/EmotionalTypes';

import type {
    EmotionalState,
    EmotionalTransition,
    EmotionalHistory,
    EmotionalPattern,
    AIEmotionalSystemConfig,
    EmotionGenerationParams,
    PrimaryEmotion,
    EmotionIntensity
} from './types/EmotionalTypes';

/**
 * Résultat complet d'analyse émotionnelle
 */
export interface CompleteEmotionalAnalysis {
    /** État émotionnel actuel */
    readonly currentState: EmotionalState;
    /** Patterns détectés */
    readonly patterns: readonly EmotionalPattern[];
    /** Historique récent */
    readonly recentHistory: readonly EmotionalState[];
    /** Confiance de l'analyse */
    readonly confidence: number;
    /** Recommandations */
    readonly recommendations: readonly string[];
}

/**
 * Moteur émotionnel révolutionnaire pour IA-élèves
 * 
 * @class AIEmotionalSystem
 * @description Orchestre l'intelligence émotionnelle des IA-élèves avec modules
 * spécialisés pour les transitions, patterns et historique émotionnel.
 * 
 * @example
 * ```typescript
 * const emotionalSystem = new AIEmotionalSystem({
 *   baseVolatility: 0.6,
 *   enablePatternDetection: true,
 *   triggerSensitivity: 0.7
 * });
 * 
 * // Générer état émotionnel
 * const state = await emotionalSystem.generateEmotionalState('student123', {
 *   learningContext: 'basic_signs',
 *   stimulus: 'successful_sign_execution',
 *   stimulusIntensity: 0.8,
 *   learningOutcome: 'success',
 *   contextualFactors: ['first_success', 'after_struggle']
 * });
 * 
 * // Analyse complète
 * const analysis = await emotionalSystem.performCompleteAnalysis('student123');
 * ```
 */
export class AIEmotionalSystem {
    /**
     * Logger pour le système émotionnel
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('AIEmotionalSystem_v3');

    /**
     * Configuration du système
     * @private
     * @readonly
     */
    private readonly config: AIEmotionalSystemConfig;

    /**
     * Détecteur de patterns émotionnels
     * @private
     * @readonly
     */
    private readonly patternDetector: EmotionalPatternDetector;

    /**
     * Gestionnaire de transitions
     * @private
     * @readonly
     */
    private readonly transitionManager: EmotionalTransitionManager;

    /**
     * Gestionnaire d'historique
     * @private
     * @readonly
     */
    private readonly historyManager: EmotionalHistoryManager;

    /**
     * États émotionnels actuels par IA-élève
     * @private
     */
    private readonly currentStates = new Map<string, EmotionalState>();

    /**
     * Profils de personnalité pour adaptation
     * @private
     */
    private readonly personalityProfiles = new Map<string, AIPersonalityProfile>();

    /**
     * Constructeur du système émotionnel
     * 
     * @constructor
     * @param {Partial<AIEmotionalSystemConfig>} [config] - Configuration optionnelle
     */
    constructor(config?: Partial<AIEmotionalSystemConfig>) {
        this.config = {
            ...DEFAULT_EMOTIONAL_CONFIG,
            ...config
        };

        // Initialiser les modules spécialisés
        this.patternDetector = new EmotionalPatternDetector({
            minSequenceLength: 3,
            minConfidence: 0.6,
            analysisWindow: 300000 // 5 minutes
        });

        this.transitionManager = new EmotionalTransitionManager({
            defaultTransitionSpeed: this.config.defaultTransitionSpeed,
            enablePersonalizedTransitions: true
        });

        this.historyManager = new EmotionalHistoryManager({
            maxHistoryDepth: this.config.historyDepth,
            enableCompression: true
        });

        this.logger.info('🎭 Système émotionnel révolutionnaire initialisé', {
            config: this.config,
            modulesLoaded: ['PatternDetector', 'TransitionManager', 'HistoryManager']
        });
    }

    /**
     * Génère un nouvel état émotionnel basé sur les paramètres
     * 
     * @method generateEmotionalState
     * @async
     * @param {string} studentId - ID de l'IA-élève
     * @param {EmotionGenerationParams} params - Paramètres de génération
     * @returns {Promise<EmotionalState>} Nouvel état émotionnel
     * @public
     */
    public async generateEmotionalState(
        studentId: string,
        params: EmotionGenerationParams
    ): Promise<EmotionalState> {
        try {
            this.logger.info('🎭 Génération état émotionnel', {
                studentId,
                context: params.learningContext,
                outcome: params.learningOutcome
            });

            const personality = this.personalityProfiles.get(studentId);
            const currentState = this.currentStates.get(studentId);

            // Générer le nouvel état
            const newState = await this.createEmotionalState(params, personality, currentState);

            // Gérer la transition si état existant
            if (currentState) {
                await this.handleStateTransition(studentId, currentState, newState, personality);
            } else {
                this.currentStates.set(studentId, newState);
            }

            // Ajouter à l'historique
            await this.historyManager.addState(studentId, newState);

            this.logger.info('✨ État émotionnel généré', {
                studentId,
                emotion: newState.primaryEmotion,
                intensity: newState.intensity.toFixed(2),
                valence: newState.valence.toFixed(2)
            });

            return newState;
        } catch (error) {
            this.logger.error('❌ Erreur génération émotionnelle', { studentId, error });
            throw error;
        }
    }

    /**
     * Effectue une analyse émotionnelle complète
     * 
     * @method performCompleteAnalysis
     * @async
     * @param {string} studentId - ID de l'IA-élève
     * @returns {Promise<CompleteEmotionalAnalysis>} Analyse complète
     * @public
     */
    public async performCompleteAnalysis(studentId: string): Promise<CompleteEmotionalAnalysis> {
        try {
            this.logger.debug('🔍 Analyse émotionnelle complète', { studentId });

            const currentState = this.currentStates.get(studentId);
            if (!currentState) {
                throw new Error(`Aucun état émotionnel trouvé pour l'étudiant ${studentId}`);
            }

            // Obtenir l'historique récent
            const searchResult = await this.historyManager.searchHistory(studentId, {
                limit: 20,
                timeRange: {
                    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24h
                    end: new Date()
                }
            });

            // Détecter les patterns
            const patternResult = await this.patternDetector.analyzePatterns(searchResult.states);

            // Générer recommandations
            const recommendations = this.generateRecommendations(
                currentState,
                patternResult.patterns,
                searchResult.states
            );

            const analysis: CompleteEmotionalAnalysis = {
                currentState,
                patterns: patternResult.patterns,
                recentHistory: searchResult.states,
                confidence: patternResult.overallConfidence,
                recommendations
            };

            this.logger.info('📊 Analyse complète terminée', {
                studentId,
                patternsFound: analysis.patterns.length,
                confidence: analysis.confidence.toFixed(2),
                recommendationsCount: analysis.recommendations.length
            });

            return analysis;
        } catch (error) {
            this.logger.error('❌ Erreur analyse complète', { studentId, error });
            throw error;
        }
    }

    /**
     * Obtient l'état émotionnel actuel
     * 
     * @method getCurrentEmotionalState
     * @param {string} studentId - ID de l'IA-élève
     * @returns {EmotionalState | undefined} État émotionnel actuel
     * @public
     */
    public getCurrentEmotionalState(studentId: string): EmotionalState | undefined {
        return this.currentStates.get(studentId);
    }

    /**
     * Obtient l'historique émotionnel
     * 
     * @method getEmotionalHistory
     * @async
     * @param {string} studentId - ID de l'IA-élève
     * @returns {Promise<EmotionalHistory | undefined>} Historique émotionnel
     * @public
     */
    public async getEmotionalHistory(studentId: string): Promise<EmotionalHistory | undefined> {
        const searchResult = await this.historyManager.searchHistory(studentId, {});

        if (searchResult.totalCount === 0) {
            return undefined;
        }

        const patterns = await this.patternDetector.analyzePatterns(searchResult.states);

        return {
            stateHistory: searchResult.states,
            transitionHistory: searchResult.transitions,
            detectedPatterns: patterns.patterns,
            lastAnalysis: new Date()
        };
    }

    /**
     * Enregistre un profil de personnalité
     * 
     * @method registerPersonalityProfile
     * @param {string} studentId - ID de l'IA-élève
     * @param {AIPersonalityProfile} profile - Profil de personnalité
     * @returns {void}
     * @public
     */
    public registerPersonalityProfile(studentId: string, profile: AIPersonalityProfile): void {
        this.personalityProfiles.set(studentId, profile);
        this.logger.debug('📋 Profil personnalité enregistré', { studentId });
    }

    /**
     * Obtient les statistiques du système
     * 
     * @method getSystemStatistics
     * @returns {Record<string, unknown>} Statistiques du système
     * @public
     */
    public getSystemStatistics(): Record<string, unknown> {
        const totalStudents = this.currentStates.size;
        const studentsWithProfiles = this.personalityProfiles.size;

        const emotionDistribution = new Map<PrimaryEmotion, number>();
        this.currentStates.forEach(state => {
            const count = emotionDistribution.get(state.primaryEmotion) || 0;
            emotionDistribution.set(state.primaryEmotion, count + 1);
        });

        return {
            totalActiveStudents: totalStudents,
            studentsWithPersonalityProfiles: studentsWithProfiles,
            currentEmotionDistribution: Object.fromEntries(emotionDistribution),
            systemConfig: this.config
        };
    }

    // ================== MÉTHODES PRIVÉES ==================

    /**
     * Crée un nouvel état émotionnel
     */
    private async createEmotionalState(
        params: EmotionGenerationParams,
        personality?: AIPersonalityProfile,
        currentState?: EmotionalState
    ): Promise<EmotionalState> {
        // Déterminer l'émotion primaire
        const primaryEmotion = this.determinePrimaryEmotion(params, personality);

        // Calculer l'intensité
        const intensity = this.calculateEmotionIntensity(params, personality, currentState);

        // Générer émotions secondaires
        const secondaryEmotions = this.generateSecondaryEmotions(primaryEmotion, intensity);

        // Calculer valence et activation
        const valence = this.calculateValence(primaryEmotion, secondaryEmotions);
        const arousal = this.calculateArousal(intensity, params.stimulusIntensity);

        // Déterminer durée prévue
        const expectedDuration = this.calculateEmotionDuration(primaryEmotion, intensity, personality);

        return {
            primaryEmotion,
            intensity,
            secondaryEmotions,
            valence,
            arousal,
            trigger: params.stimulus,
            timestamp: new Date(),
            expectedDuration
        };
    }

    /**
     * Gère la transition entre états
     */
    private async handleStateTransition(
        studentId: string,
        fromState: EmotionalState,
        toState: EmotionalState,
        personality?: AIPersonalityProfile
    ): Promise<void> {
        // Calculer les paramètres de transition
        const transitionResult = await this.transitionManager.calculateTransition(
            fromState,
            toState,
            personality
        );

        // Créer la transition
        const transition: EmotionalTransition = {
            fromState,
            toState,
            trigger: toState.trigger,
            duration: transitionResult.duration,
            curve: transitionResult.curve,
            startTime: new Date()
        };

        // Exécuter la transition
        await this.transitionManager.executeTransition(studentId, transition);

        // Ajouter à l'historique
        await this.historyManager.addTransition(studentId, transition);

        // Mettre à jour l'état actuel
        this.currentStates.set(studentId, toState);
    }

    /**
     * Détermine l'émotion primaire basée sur le résultat d'apprentissage
     */
    private determinePrimaryEmotion(
        params: EmotionGenerationParams,
        personality?: AIPersonalityProfile
    ): PrimaryEmotion {
        const outcomeEmotions: Record<typeof params.learningOutcome, PrimaryEmotion[]> = {
            'success': ['joy', 'trust', 'surprise'],
            'partial': ['anticipation', 'trust', 'joy'],
            'failure': ['sadness', 'anger', 'fear']
        };

        const candidates = outcomeEmotions[params.learningOutcome];

        // Ajustement selon personnalité
        if (personality) {
            const emotionalSensitivity = personality.bigFiveTraits.neuroticism;
            if (emotionalSensitivity > 0.7 && params.learningOutcome === 'failure') {
                return Math.random() > 0.5 ? 'anger' : 'fear';
            }
        }

        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    /**
     * Calcule l'intensité émotionnelle
     */
    private calculateEmotionIntensity(
        params: EmotionGenerationParams,
        personality?: AIPersonalityProfile,
        currentState?: EmotionalState
    ): EmotionIntensity {
        let baseIntensity = params.stimulusIntensity * 0.7;

        // Ajustement selon personnalité
        if (personality) {
            const volatility = personality.bigFiveTraits.neuroticism;
            baseIntensity *= (0.5 + volatility * 0.5);
        }

        // Effet de persistance émotionnelle
        if (currentState) {
            const persistence = this.config.emotionalPersistence;
            baseIntensity = baseIntensity * (1 - persistence) + currentState.intensity * persistence;
        }

        return Math.max(0.1, Math.min(1, baseIntensity));
    }

    /**
     * Génère les émotions secondaires
     */
    private generateSecondaryEmotions(
        primary: PrimaryEmotion,
        intensity: EmotionIntensity
    ): ReadonlyMap<PrimaryEmotion, EmotionIntensity> {
        const secondaryMap = new Map<PrimaryEmotion, EmotionIntensity>();
        const secondaryIntensity = intensity * 0.3;

        // Logique simplifiée pour les émotions secondaires
        if (primary === 'joy' && intensity > 0.7) {
            secondaryMap.set('trust', secondaryIntensity);
        } else if (primary === 'sadness') {
            secondaryMap.set('fear', secondaryIntensity * 0.5);
        } else if (primary === 'anger') {
            secondaryMap.set('disgust', secondaryIntensity * 0.6);
        }

        return secondaryMap;
    }

    /**
     * Calcule la valence émotionnelle
     */
    private calculateValence(
        primary: PrimaryEmotion,
        secondary: ReadonlyMap<PrimaryEmotion, EmotionIntensity>
    ): number {
        let totalValence = EMOTION_VALENCE_MAP[primary];
        let totalWeight = 1;

        secondary.forEach((intensity, emotion) => {
            totalValence += EMOTION_VALENCE_MAP[emotion] * intensity;
            totalWeight += intensity;
        });

        return totalValence / totalWeight;
    }

    /**
     * Calcule le niveau d'activation
     */
    private calculateArousal(intensity: EmotionIntensity, stimulusIntensity: number): number {
        return (intensity + stimulusIntensity) / 2;
    }

    /**
     * Calcule la durée prévue de l'émotion
     */
    private calculateEmotionDuration(
        emotion: PrimaryEmotion,
        intensity: EmotionIntensity,
        personality?: AIPersonalityProfile
    ): number {
        let duration = EMOTION_BASE_DURATIONS[emotion] * (0.5 + intensity * 0.5);

        if (personality) {
            const persistence = personality.bigFiveTraits.neuroticism;
            duration *= (0.7 + persistence * 0.6);
        }

        return Math.round(duration);
    }

    /**
     * Génère des recommandations basées sur l'analyse
     */
    private generateRecommendations(
        currentState: EmotionalState,
        patterns: readonly EmotionalPattern[],
        recentHistory: readonly EmotionalState[]
    ): readonly string[] {
        const recommendations: string[] = [];

        // Recommandations basées sur l'état actuel
        if (currentState.valence < -0.5) {
            recommendations.push('Introduire des éléments motivants pour améliorer l\'état émotionnel');
        }

        if (currentState.intensity > 0.9) {
            recommendations.push('Modérer l\'intensité des stimuli pour éviter la surcharge émotionnelle');
        }

        // Recommandations basées sur les patterns
        const frustrationPatterns = patterns.filter(p => p.type === 'frustration_spiral');
        if (frustrationPatterns.length > 0) {
            recommendations.push('Ajuster la difficulté pour réduire les spirales de frustration');
        }

        const plateauPatterns = patterns.filter(p => p.type === 'plateau_stagnation');
        if (plateauPatterns.length > 0) {
            recommendations.push('Introduire de la variété pour stimuler l\'engagement');
        }

        // Recommandations basées sur l'historique récent
        if (recentHistory.length > 5) {
            const avgValence = recentHistory.reduce((sum, s) => sum + s.valence, 0) / recentHistory.length;
            if (avgValence < 0) {
                recommendations.push('Planifier des activités de réussite pour améliorer le moral');
            }
        }

        return recommendations.length > 0 ? recommendations : [
            'État émotionnel stable, continuer l\'approche actuelle'
        ];
    }
}

// Exports pour compatibilité
export type {
    EmotionalState,
    EmotionalTransition,
    EmotionalHistory,
    EmotionalPattern,
    AIEmotionalSystemConfig,
    EmotionGenerationParams,
    PrimaryEmotion,
    EmotionIntensity
};

export { DEFAULT_EMOTIONAL_CONFIG } from './types/EmotionalTypes';