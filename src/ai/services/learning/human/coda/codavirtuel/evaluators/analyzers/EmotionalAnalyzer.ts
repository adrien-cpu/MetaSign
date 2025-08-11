/**
 * Analyseur émotionnel pour l'évaluateur CODA - Version corrigée
 * @file src/ai/services/learning/human/coda/codavirtuel/evaluators/analyzers/EmotionalAnalyzer.ts
 * @module ai/services/learning/human/coda/codavirtuel/evaluators/analyzers
 * @description Analyse le contexte émotionnel et génère des adaptations
 * Compatible avec exactOptionalPropertyTypes: true et optimisé
 * @author MetaSign Learning Team
 * @version 3.0.1
 * @since 2025
 * @lastModified 2025-01-15
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type {
    TeachingSession,
    EmotionalConfig
} from '../types/CODAEvaluatorTypes';

/**
 * Type pour les émotions détectées
 */
export type DetectedEmotion = 'frustrated' | 'confused' | 'motivated' | 'confident' | 'neutral';

/**
 * Interface pour le contexte émotionnel analysé
 */
export interface EmotionalContext {
    readonly detectedEmotion: DetectedEmotion;
    readonly intensity: number;
    readonly contributingFactors: readonly string[];
    readonly adaptationRecommendations: readonly string[];
}

/**
 * Interface pour les besoins utilisateur analysés
 */
export interface UserNeeds {
    readonly confidence: number;
    readonly emotionalSupport: number;
    readonly intellectualChallenge: number;
    readonly culturalImmersion: number;
}

/**
 * Analyseur émotionnel pour les sessions CODA - Version optimisée
 * Responsable de l'analyse du contexte émotionnel et de la génération d'adaptations
 */
export class EmotionalAnalyzer {
    private readonly logger = LoggerFactory.getLogger('EmotionalAnalyzer');
    private readonly emotionalConfig: EmotionalConfig;

    /**
     * Constructeur de l'analyseur émotionnel
     * @param emotionalConfig Configuration émotionnelle
     */
    constructor(emotionalConfig: EmotionalConfig) {
        this.emotionalConfig = emotionalConfig;
    }

    /**
     * Analyse le contexte émotionnel avec IA révolutionnaire
     * @param sessions Sessions à analyser
     * @returns Contexte émotionnel analysé
     */
    public analyzeEmotionalContext(sessions: readonly TeachingSession[]): EmotionalContext {
        if (sessions.length === 0) {
            return {
                detectedEmotion: 'neutral',
                intensity: 0.5,
                contributingFactors: ['Aucune session disponible'],
                adaptationRecommendations: ['Commencer par des exercices simples']
            };
        }

        // Analyse des patterns émotionnels récents
        const recentSessions = sessions.slice(-3);
        const comprehensionValues = recentSessions.map(s => s.aiReactions.comprehension);
        const frustrationValues = recentSessions.map(s => s.aiReactions.frustrationSigns);
        const satisfactionValues = recentSessions.map(s => s.results.aiSatisfaction);

        const avgComprehension = this.calculateAverage(comprehensionValues);
        const avgFrustration = this.calculateAverage(frustrationValues);
        const avgSatisfaction = this.calculateAverage(satisfactionValues);

        // Détection émotionnelle intelligente
        const emotionAnalysis = this.detectEmotion(
            avgComprehension,
            avgFrustration,
            avgSatisfaction
        );

        // Génération de recommandations adaptatives
        const adaptationRecommendations = this.generateEmotionalAdaptations(
            emotionAnalysis.detectedEmotion
        );

        const result: EmotionalContext = {
            detectedEmotion: emotionAnalysis.detectedEmotion,
            intensity: emotionAnalysis.intensity,
            contributingFactors: emotionAnalysis.contributingFactors,
            adaptationRecommendations
        };

        this.logger.debug('Contexte émotionnel analysé', {
            emotion: result.detectedEmotion,
            intensity: result.intensity,
            sessionsAnalyzed: recentSessions.length
        });

        return result;
    }

    /**
     * Analyse les besoins utilisateur par IA prédictive
     * @param sessions Sessions à analyser
     * @param emotionalContext Contexte émotionnel
     * @returns Besoins utilisateur analysés
     */
    public analyzeUserNeeds(
        sessions: readonly TeachingSession[],
        emotionalContext: EmotionalContext
    ): UserNeeds {
        if (sessions.length === 0) {
            return {
                confidence: 0.3,
                emotionalSupport: 0.7,
                intellectualChallenge: 0.5,
                culturalImmersion: 0.6
            };
        }

        const comprehensionValues = sessions.map(s => s.aiReactions.comprehension);
        const avgPerformance = this.calculateAverage(comprehensionValues);

        const sessionVariability = this.calculateSessionVariability(sessions);
        const teachingMethodDiversity = this.calculateMethodDiversity(sessions);

        // Calcul des besoins adaptatifs
        const confidence = Math.max(0.2, avgPerformance * 0.7 + sessionVariability * 0.3);

        const emotionalSupport = this.calculateEmotionalSupportNeed(emotionalContext);
        const intellectualChallenge = avgPerformance > 0.7 ? 0.8 : 0.4;
        const culturalImmersion = teachingMethodDiversity > 0.6 ? 0.8 : 0.6;

        const result: UserNeeds = {
            confidence,
            emotionalSupport,
            intellectualChallenge,
            culturalImmersion
        };

        this.logger.debug('Besoins utilisateur analysés', {
            confidence: result.confidence,
            emotionalSupport: result.emotionalSupport,
            avgPerformance,
            emotion: emotionalContext.detectedEmotion
        });

        return result;
    }

    /**
     * Obtient les techniques de support émotionnel
     * @param emotion Émotion détectée
     * @returns Techniques recommandées
     */
    public getEmotionalSupportTechniques(
        emotion: DetectedEmotion
    ): readonly string[] {
        const techniques: Record<DetectedEmotion, readonly string[]> = {
            frustrated: ['Respiration calme', 'Pauses fréquentes', 'Encouragements positifs'],
            confused: ['Questions guidées', 'Décomposition étape par étape'],
            motivated: ['Défis progressifs', 'Renforcement positif'],
            confident: ['Autonomie guidée', 'Projets complexes'],
            neutral: ['Stimulation de l\'intérêt', 'Engagement actif']
        };

        return techniques[emotion] || techniques.neutral;
    }

    // === MÉTHODES PRIVÉES ===

    /**
     * Détecte l'émotion principale basée sur les métriques
     * @param avgComprehension Compréhension moyenne
     * @param avgFrustration Frustration moyenne
     * @param avgSatisfaction Satisfaction moyenne
     * @returns Analyse émotionnelle
     * @private
     */
    private detectEmotion(
        avgComprehension: number,
        avgFrustration: number,
        avgSatisfaction: number
    ): {
        detectedEmotion: DetectedEmotion;
        intensity: number;
        contributingFactors: string[];
    } {
        const contributingFactors: string[] = [];
        let detectedEmotion: DetectedEmotion;
        let intensity: number;

        if (avgFrustration > this.emotionalConfig.frustrationThreshold) {
            detectedEmotion = 'frustrated';
            intensity = Math.min(1, avgFrustration);
            contributingFactors.push('Niveau de frustration élevé détecté');
        } else if (avgComprehension > 0.8 && avgSatisfaction > 0.8) {
            detectedEmotion = 'confident';
            intensity = (avgComprehension + avgSatisfaction) / 2;
            contributingFactors.push('Excellente compréhension et satisfaction');
        } else if (avgComprehension < 0.4) {
            detectedEmotion = 'confused';
            intensity = 1 - avgComprehension;
            contributingFactors.push('Compréhension faible persistante');
        } else if (avgSatisfaction > 0.7) {
            detectedEmotion = 'motivated';
            intensity = avgSatisfaction;
            contributingFactors.push('Bon niveau de satisfaction');
        } else {
            detectedEmotion = 'neutral';
            intensity = 0.5;
            contributingFactors.push('État émotionnel stable');
        }

        return { detectedEmotion, intensity, contributingFactors };
    }

    /**
     * Génère des adaptations émotionnelles
     * @param emotion Émotion détectée
     * @returns Recommandations d'adaptation
     * @private
     */
    private generateEmotionalAdaptations(
        emotion: DetectedEmotion
    ): string[] {
        const adaptations: string[] = [];

        switch (emotion) {
            case 'frustrated':
                adaptations.push(
                    'Ralentir le rythme d\'enseignement',
                    'Utiliser plus d\'encouragements positifs',
                    'Simplifier les explications',
                    'Proposer des pauses régulières'
                );
                break;
            case 'confused':
                adaptations.push(
                    'Reprendre les concepts de base',
                    'Utiliser plus d\'exemples visuels',
                    'Décomposer en étapes plus petites',
                    'Vérifier la compréhension fréquemment'
                );
                break;
            case 'motivated':
                adaptations.push(
                    'Augmenter progressivement la difficulté',
                    'Introduire de nouveaux défis',
                    'Maintenir l\'engagement avec la variété'
                );
                break;
            case 'confident':
                adaptations.push(
                    'Proposer des exercices avancés',
                    'Encourager l\'autonomie',
                    'Introduire des concepts complexes'
                );
                break;
            default:
                adaptations.push(
                    'Maintenir un rythme équilibré',
                    'Observer les signes de changement émotionnel'
                );
        }

        return adaptations;
    }

    /**
     * Calcule le besoin de soutien émotionnel
     * @param emotionalContext Contexte émotionnel
     * @returns Niveau de besoin (0-1)
     * @private
     */
    private calculateEmotionalSupportNeed(emotionalContext: EmotionalContext): number {
        switch (emotionalContext.detectedEmotion) {
            case 'frustrated':
                return 0.9;
            case 'confused':
                return 0.8;
            case 'motivated':
                return 0.4;
            case 'confident':
                return 0.3;
            default:
                return 0.6;
        }
    }

    /**
     * Calcule la variabilité des performances entre sessions
     * @param sessions Sessions à analyser
     * @returns Variabilité normalisée
     * @private
     */
    private calculateSessionVariability(sessions: readonly TeachingSession[]): number {
        if (sessions.length < 2) return 0;

        const comprehensions = sessions.map(s => s.aiReactions.comprehension);
        const mean = this.calculateAverage(comprehensions);
        const variance = comprehensions.reduce(
            (sum, val) => sum + Math.pow(val - mean, 2), 0
        ) / comprehensions.length;

        return Math.sqrt(variance);
    }

    /**
     * Calcule la diversité des méthodes d'enseignement
     * @param sessions Sessions à analyser
     * @returns Diversité normalisée (0-1)
     * @private
     */
    private calculateMethodDiversity(sessions: readonly TeachingSession[]): number {
        const methods = new Set(sessions.map(s => s.content.teachingMethod));
        return methods.size / Math.max(sessions.length, 1);
    }

    /**
     * Calcule la moyenne d'un tableau de nombres
     * @param values Valeurs à moyenner
     * @returns Moyenne
     * @private
     */
    private calculateAverage(values: readonly number[]): number {
        if (values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
}