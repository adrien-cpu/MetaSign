/**
 * @file src/ai/services/learning/human/coda/codavirtuel/algorithms/EvolutionAlgorithmManager.ts
 * @description Gestionnaire des algorithmes d'évolution spécialisés pour chaque type d'événement
 * 
 * @module EvolutionAlgorithmManager
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Evolutionary AI Division
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type {
    EvolutionEventType,
    EvolutionFactors,
    EvolutionMetrics,
    EvolutionEvent,
    LearningExperience,
    EmotionalPattern
} from '@/ai/services/learning/human/coda/codavirtuel/types/evolution.types';

/**
 * Type pour un algorithme d'évolution
 */
export type EvolutionAlgorithm = (
    factors: EvolutionFactors,
    metrics: EvolutionMetrics
) => number;

/**
 * Gestionnaire des algorithmes d'évolution
 * 
 * @class EvolutionAlgorithmManager
 * @description Centralise et gère tous les algorithmes spécialisés pour détecter 
 * et calculer l'impact des différents types d'événements d'évolution.
 */
export class EvolutionAlgorithmManager {
    /**
     * Logger pour le gestionnaire d'algorithmes
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('EvolutionAlgorithmManager_v3');

    /**
     * Algorithmes d'évolution par type d'événement
     * @private
     * @readonly
     */
    private readonly algorithms: Map<EvolutionEventType, EvolutionAlgorithm> = new Map();

    /**
     * Constructeur du gestionnaire d'algorithmes
     * 
     * @constructor
     */
    constructor() {
        this.initializeAlgorithms();
        this.logger.info('🧬 Gestionnaire algorithmes évolution initialisé');
    }

    /**
     * Détecte les événements d'évolution potentiels
     * 
     * @method detectEvolutionEvents
     * @param {EvolutionMetrics} currentMetrics - Métriques actuelles
     * @param {EvolutionFactors} factors - Facteurs d'évolution
     * @returns {EvolutionEvent[]} Liste des événements détectés
     * @public
     */
    public detectEvolutionEvents(
        currentMetrics: EvolutionMetrics,
        factors: EvolutionFactors
    ): EvolutionEvent[] {
        const events: EvolutionEvent[] = [];

        this.algorithms.forEach((algorithm, eventType) => {
            const impact = algorithm(factors, currentMetrics);

            if (impact > 0) {
                const event = this.createEvolutionEvent(eventType, currentMetrics, factors, impact);
                events.push(event);
            }
        });

        this.logger.debug('Événements d\'évolution détectés', {
            eventsCount: events.length,
            eventTypes: events.map(e => e.eventType)
        });

        return events;
    }

    /**
     * Ajoute ou met à jour un algorithme d'évolution
     * 
     * @method registerAlgorithm
     * @param {EvolutionEventType} eventType - Type d'événement
     * @param {EvolutionAlgorithm} algorithm - Algorithme à enregistrer
     * @returns {void}
     * @public
     */
    public registerAlgorithm(eventType: EvolutionEventType, algorithm: EvolutionAlgorithm): void {
        this.algorithms.set(eventType, algorithm);
        this.logger.debug('Algorithme enregistré', { eventType });
    }

    /**
     * Obtient un algorithme spécifique
     * 
     * @method getAlgorithm
     * @param {EvolutionEventType} eventType - Type d'événement
     * @returns {EvolutionAlgorithm | undefined} Algorithme ou undefined
     * @public
     */
    public getAlgorithm(eventType: EvolutionEventType): EvolutionAlgorithm | undefined {
        return this.algorithms.get(eventType);
    }

    // ================== MÉTHODES PRIVÉES ==================

    /**
     * Initialise tous les algorithmes d'évolution par défaut
     * @private
     */
    private initializeAlgorithms(): void {
        // Algorithme pour les percées majeures
        this.algorithms.set('breakthrough', (factors, metrics) => {
            const avgSuccessRate = this.calculateAverageSuccessRate(factors.recentExperiences);
            const learningSpeedBonus = metrics.learningSpeed > 0.6 ? 0.1 : 0;
            return avgSuccessRate > 0.8 ? Math.min(0.3, avgSuccessRate - 0.8 + learningSpeedBonus) : 0;
        });

        // Algorithme pour la sortie de plateau
        this.algorithms.set('plateau_breakthrough', (factors, metrics) => {
            const recentImprovement = this.detectRecentImprovement(factors.recentExperiences);
            const adaptabilityFactor = metrics.adaptability * 0.2;
            const lowSpeedPenalty = metrics.learningSpeed < 0.4 ? 1.0 : 0.8;
            return recentImprovement ? (0.25 + adaptabilityFactor) * lowSpeedPenalty : 0;
        });

        // Algorithme pour la maîtrise de compétences
        this.algorithms.set('skill_mastery', (factors, metrics) => {
            const masteryCount = factors.memoryMetrics.strongestConcepts.length;
            const efficiencyBonus = metrics.lsfCommunicationEfficiency > 0.7 ? 0.05 : 0;
            const confidenceMultiplier = Math.max(0.5, metrics.globalConfidence);
            const baseScore = masteryCount > 5 ? Math.min(0.2, masteryCount * 0.02 + efficiencyBonus) : 0;
            return baseScore * confidenceMultiplier;
        });

        // Algorithme pour l'augmentation de confiance
        this.algorithms.set('confidence_boost', (factors, metrics) => {
            const positiveExperiences = factors.recentExperiences.filter(exp => exp.successRate > 0.7).length;
            const positiveFeedback = factors.feedbackHistory.filter(fb => fb.type === 'positive').length;
            const socialBonus = factors.socialInteractions.length > 0 ? 0.05 : 0;
            const currentConfidenceModifier = metrics.globalConfidence < 0.5 ? 1.2 : 1.0; // Bonus si confiance faible

            const baseBoost = positiveExperiences > 3 || positiveFeedback > 2 ?
                Math.min(0.25, positiveExperiences * 0.05 + positiveFeedback * 0.03 + socialBonus) : 0;

            return baseBoost * currentConfidenceModifier;
        });

        // Algorithme pour l'amélioration de l'adaptabilité
        this.algorithms.set('adaptability_increase', (factors, metrics) => {
            const diverseMethods = new Set(factors.recentExperiences.map(exp => exp.method)).size;
            const challengeOvercome = factors.recentExperiences.some(exp =>
                exp.challenges.length > 0 && exp.successRate > 0.5
            );
            const currentAdaptability = metrics.adaptability;
            const growthPotential = Math.max(0.2, 1 - currentAdaptability); // Plus de potentiel si adaptabilité faible

            const baseIncrease = diverseMethods > 2 && challengeOvercome ? Math.min(0.2, diverseMethods * 0.05) : 0;
            return baseIncrease * growthPotential;
        });

        // Algorithme pour la croissance émotionnelle
        this.algorithms.set('emotional_growth', (factors, metrics) => {
            const emotionalDiversity = this.calculateEmotionalDiversity(factors.emotionalPatterns);
            const currentResilience = metrics.emotionalResilience;
            const resilienceBonus = currentResilience > 0.6 ? 0.05 : 0;
            const growthModifier = currentResilience < 0.5 ? 1.3 : 1.0; // Plus de croissance si résilience faible

            const baseGrowth = emotionalDiversity > 0.5 ? Math.min(0.15, emotionalDiversity + resilienceBonus) : 0;
            return baseGrowth * growthModifier;
        });

        // Algorithme pour l'éveil culturel
        this.algorithms.set('cultural_awakening', (factors, metrics) => {
            const culturalExposure = factors.recentExperiences.filter(exp =>
                exp.concept.includes('culture') || exp.concept.includes('communauté')
            ).length;
            const currentCulturalProgress = metrics.culturalProgress;
            const progressMultiplier = currentCulturalProgress < 0.3 ? 1.5 : 1.0; // Bonus pour débutants
            const curiosityBonus = metrics.intellectualCuriosity > 0.7 ? 0.1 : 0;

            const baseAwakening = culturalExposure > 0 && currentCulturalProgress < 0.5 ?
                Math.min(0.3, culturalExposure * 0.1 + curiosityBonus) : 0;

            return baseAwakening * progressMultiplier;
        });

        // Algorithme pour le développement de préférences
        this.algorithms.set('method_preference', (factors, metrics) => {
            const preferredMethods = this.identifyPreferredMethods(factors.recentExperiences);
            const consistencyScore = this.calculateMethodConsistency(factors.recentExperiences);
            const adaptabilityFactor = metrics.adaptability > 0.6 ? 1.0 : 1.2; // Bonus si peu adaptable
            const learningSpeedBonus = metrics.learningSpeed > 0.5 ? 0.02 : 0;

            const basePreference = preferredMethods.length > 0 && consistencyScore > 0.6 ?
                Math.min(0.1, consistencyScore * 0.2 + learningSpeedBonus) : 0;

            return basePreference * adaptabilityFactor;
        });

        // Algorithme pour la construction de résilience
        this.algorithms.set('resilience_build', (factors, metrics) => {
            const challengeRecovery = this.calculateChallengeRecovery(factors.recentExperiences);
            const currentResilience = metrics.emotionalResilience;
            const adaptabilityBonus = metrics.adaptability > 0.5 ? 0.02 : 0;
            const confidenceSupport = metrics.globalConfidence > 0.6 ? 0.03 : 0;
            const growthPotential = Math.max(0.3, 1 - currentResilience);

            const baseResilience = challengeRecovery > 0.7 ?
                Math.min(0.15, challengeRecovery + adaptabilityBonus + confidenceSupport) : 0;

            return baseResilience * growthPotential;
        });

        // Algorithme pour l'éveil de curiosité
        this.algorithms.set('curiosity_spark', (factors, metrics) => {
            const explorationRate = this.calculateExplorationRate(factors.recentExperiences);
            const questioningBehavior = factors.feedbackHistory.filter(fb =>
                fb.content.includes('?') || fb.content.includes('pourquoi')
            ).length;
            const currentCuriosity = metrics.intellectualCuriosity;
            const learningSpeedBonus = metrics.learningSpeed > 0.4 ? 0.05 : 0;
            const culturalBonus = metrics.culturalProgress > 0.3 ? 0.03 : 0;
            const growthModifier = currentCuriosity < 0.6 ? 1.2 : 1.0;

            const baseCuriosity = explorationRate > 0.3 || questioningBehavior > 0 ?
                Math.min(0.2, explorationRate + questioningBehavior * 0.05 + learningSpeedBonus + culturalBonus) : 0;

            return baseCuriosity * growthModifier;
        });

        this.logger.info('Algorithmes d\'évolution initialisés', {
            algorithmsCount: this.algorithms.size
        });
    }

    /**
     * Crée un événement d'évolution
     * @private
     */
    private createEvolutionEvent(
        eventType: EvolutionEventType,
        currentMetrics: EvolutionMetrics,
        factors: EvolutionFactors,
        impact: number
    ): EvolutionEvent {
        const affectedMetric = this.selectAffectedMetric(eventType);
        const currentValue = currentMetrics[affectedMetric];
        const newValue = Math.min(1, Math.max(0, currentValue + impact));

        return {
            eventType,
            affectedMetric,
            previousValue: currentValue,
            newValue,
            impact,
            trigger: this.determineTrigger(eventType, factors),
            learningContext: this.extractLearningContext(factors),
            timestamp: new Date(),
            confidence: this.calculateEventConfidence(eventType, factors)
        };
    }

    /**
     * Calcule le taux de réussite moyen des expériences récentes
     * @private
     */
    private calculateAverageSuccessRate(experiences: readonly LearningExperience[]): number {
        if (experiences.length === 0) return 0;
        return experiences.reduce((sum, exp) => sum + exp.successRate, 0) / experiences.length;
    }

    /**
     * Détecte une amélioration récente dans les expériences
     * @private
     */
    private detectRecentImprovement(experiences: readonly LearningExperience[]): boolean {
        if (experiences.length < 2) return false;

        const sortedExperiences = [...experiences].sort((a, b) =>
            b.timestamp.getTime() - a.timestamp.getTime()
        );

        const recent = sortedExperiences.slice(0, 3);
        const older = sortedExperiences.slice(3, 6);

        if (recent.length === 0 || older.length === 0) return false;

        const recentAvg = recent.reduce((sum, exp) => sum + exp.successRate, 0) / recent.length;
        const olderAvg = older.reduce((sum, exp) => sum + exp.successRate, 0) / older.length;

        return recentAvg > olderAvg + 0.1;
    }

    /**
     * Calcule la diversité émotionnelle
     * @private
     */
    private calculateEmotionalDiversity(patterns: readonly EmotionalPattern[]): number {
        if (patterns.length === 0) return 0;

        const uniqueEmotions = new Set(patterns.map(p => p.type));
        return Math.min(1, uniqueEmotions.size / 8); // Normaliser sur 8 émotions de base
    }

    /**
     * Identifie les méthodes préférées
     * @private
     */
    private identifyPreferredMethods(experiences: readonly LearningExperience[]): string[] {
        const methodCounts = new Map<string, number>();

        experiences.forEach(exp => {
            const count = methodCounts.get(exp.method) || 0;
            methodCounts.set(exp.method, count + 1);
        });

        const totalExperiences = experiences.length;
        return Array.from(methodCounts.entries())
            .filter(([, count]) => count / totalExperiences > 0.3)
            .map(([method]) => method);
    }

    /**
     * Calcule la cohérence des méthodes utilisées
     * @private
     */
    private calculateMethodConsistency(experiences: readonly LearningExperience[]): number {
        if (experiences.length === 0) return 0;

        const methodCounts = new Map<string, number>();
        experiences.forEach(exp => {
            const count = methodCounts.get(exp.method) || 0;
            methodCounts.set(exp.method, count + 1);
        });

        const maxCount = Math.max(...Array.from(methodCounts.values()));
        return maxCount / experiences.length;
    }

    /**
     * Calcule la capacité de récupération face aux défis
     * @private
     */
    private calculateChallengeRecovery(experiences: readonly LearningExperience[]): number {
        const challengingExperiences = experiences.filter(exp => exp.challenges.length > 0);
        if (challengingExperiences.length === 0) return 0;

        const recoveryRate = challengingExperiences.filter(exp => exp.successRate > 0.5).length;
        return recoveryRate / challengingExperiences.length;
    }

    /**
     * Calcule le taux d'exploration
     * @private
     */
    private calculateExplorationRate(experiences: readonly LearningExperience[]): number {
        if (experiences.length === 0) return 0;

        const uniqueConcepts = new Set(experiences.map(exp => exp.concept));
        return Math.min(1, uniqueConcepts.size / experiences.length);
    }

    /**
     * Sélectionne la métrique affectée par un type d'événement
     * @private
     */
    private selectAffectedMetric(eventType: EvolutionEventType): keyof EvolutionMetrics {
        const metricMap: Record<EvolutionEventType, keyof EvolutionMetrics> = {
            'breakthrough': 'learningSpeed',
            'plateau_breakthrough': 'adaptability',
            'skill_mastery': 'lsfCommunicationEfficiency',
            'confidence_boost': 'globalConfidence',
            'adaptability_increase': 'adaptability',
            'emotional_growth': 'emotionalResilience',
            'cultural_awakening': 'culturalProgress',
            'method_preference': 'adaptability',
            'resilience_build': 'emotionalResilience',
            'curiosity_spark': 'intellectualCuriosity'
        };

        return metricMap[eventType];
    }

    /**
     * Détermine le déclencheur d'un événement
     * @private
     */
    private determineTrigger(eventType: EvolutionEventType, factors: EvolutionFactors): string {
        const triggers: Record<EvolutionEventType, string> = {
            'breakthrough': `${factors.recentExperiences.length} expériences récentes réussies`,
            'plateau_breakthrough': 'Amélioration détectée après stagnation',
            'skill_mastery': `Maîtrise de ${factors.memoryMetrics.strongestConcepts.length} concepts`,
            'confidence_boost': `${factors.feedbackHistory.filter(fb => fb.type === 'positive').length} feedbacks positifs`,
            'adaptability_increase': 'Diversification des méthodes d\'apprentissage',
            'emotional_growth': 'Développement de la maturité émotionnelle',
            'cultural_awakening': 'Exposition accrue à la culture sourde',
            'method_preference': 'Développement de préférences pédagogiques',
            'resilience_build': 'Surmonter des défis d\'apprentissage',
            'curiosity_spark': 'Comportement exploratoire renforcé'
        };

        return triggers[eventType];
    }

    /**
     * Extrait le contexte d'apprentissage
     * @private
     */
    private extractLearningContext(factors: EvolutionFactors): string {
        const recentConcepts = factors.recentExperiences
            .slice(0, 3)
            .map(exp => exp.concept)
            .join(', ');

        return recentConcepts || 'Contexte d\'apprentissage général';
    }

    /**
     * Calcule la confiance dans un événement
     * @private
     */
    private calculateEventConfidence(eventType: EvolutionEventType, factors: EvolutionFactors): number {
        // Base de confiance selon le type d'événement
        const baseConfidence: Record<EvolutionEventType, number> = {
            'breakthrough': 0.9,
            'plateau_breakthrough': 0.7,
            'skill_mastery': 0.85,
            'confidence_boost': 0.8,
            'adaptability_increase': 0.75,
            'emotional_growth': 0.6,
            'cultural_awakening': 0.8,
            'method_preference': 0.7,
            'resilience_build': 0.75,
            'curiosity_spark': 0.65
        };

        // Ajustement basé sur la quantité de données
        const dataQualityFactor = Math.min(1, factors.recentExperiences.length / 5);

        return Math.min(1, baseConfidence[eventType] * (0.5 + dataQualityFactor * 0.5));
    }
}