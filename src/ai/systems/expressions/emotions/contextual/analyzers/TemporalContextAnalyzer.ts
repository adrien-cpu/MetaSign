// src/ai/systems/expressions/emotions/contextual/analyzers/TemporalContextAnalyzer.ts

import { TemporalContext, TemporalPatternsAnalysis } from '../types';
import { ITemporalContextAnalyzer } from '../interfaces';

/**
 * Interface pour les patterns temporels améliorés
 */
interface EnhancedTimingPattern {
    /** Type de pattern temporel */
    type: string;
    /** Durée du pattern */
    duration: number;
    /** Fréquence optionnelle */
    frequency?: number | undefined;
    /** Vitesse recommandée */
    recommendedSpeed: string;
    /** Courbe d'intonation */
    intonationCurve: string;
    /** Emphase rythmique */
    rhythmicEmphasis: string;
    /** Style de transition */
    transitionStyle: string;
    /** Autres propriétés */
    [key: string]: unknown;
}

/**
 * Analyseur de contexte temporel pour les adaptations émotionnelles
 */
export class TemporalContextAnalyzer implements ITemporalContextAnalyzer {
    // Durées standard pour différents types d'expressions émotionnelles (en secondes)
    private readonly STANDARD_DURATIONS = {
        brief: 1.0,
        standard: 2.5,
        extended: 4.0,
        elaborate: 6.0
    };

    /**
     * Analyse le contexte temporel pour déterminer les patterns d'adaptation
     * @param temporal Contexte temporel
     * @returns Analyse des patterns temporels
     */
    public analyzeTemporalContext(temporal: TemporalContext): TemporalPatternsAnalysis {
        // Gérer le cas où le contexte est incomplet
        if (!temporal || typeof temporal !== 'object') {
            return this.createDefaultAnalysis();
        }

        // Améliorer les patterns temporels avec des informations additionnelles
        const enhancedPatterns = this.enhanceTimingPatterns(temporal);

        // Analyser les contraintes temporelles
        const constraints = this.analyzeTemporalConstraints(temporal);

        // Calculer le rythme temporel
        const temporalRhythm = this.calculateTemporalRhythm(enhancedPatterns);

        return {
            timingPatterns: enhancedPatterns,
            constraints,
            temporalRhythm
        };
    }

    /**
     * Implémentation de l'interface IContextAnalyzer
     */
    public analyze(context: TemporalContext): TemporalPatternsAnalysis {
        return this.analyzeTemporalContext(context);
    }

    /**
     * Crée une analyse par défaut quand le contexte est incomplet
     * @returns Analyse des patterns temporels par défaut
     */
    private createDefaultAnalysis(): TemporalPatternsAnalysis {
        return {
            timingPatterns: [{
                type: 'standard',
                duration: this.STANDARD_DURATIONS.standard,
                recommendedSpeed: 'moderate',
                intonationCurve: 'balanced',
                rhythmicEmphasis: 'natural',
                transitionStyle: 'smooth'
            }],
            constraints: {
                minDuration: 1.0,
                maxDuration: 5.0,
                priorityTransitions: [],
                flexibility: 'moderate'
            },
            temporalRhythm: {
                tempo: 'moderate',
                regularity: 'steady',
                adaptability: 'moderate',
                complexity: 'simple'
            }
        };
    }

    /**
     * Améliore les patterns temporels avec des informations additionnelles
     * @param temporal Contexte temporel
     * @returns Patterns temporels améliorés
     */
    private enhanceTimingPatterns(temporal: TemporalContext): EnhancedTimingPattern[] {
        // Si aucun pattern n'est défini, créer un pattern par défaut
        if (!temporal.timingPatterns || temporal.timingPatterns.length === 0) {
            return [this.createDefaultTimingPattern(temporal.duration)];
        }

        // Améliorer les patterns existants
        return temporal.timingPatterns.map(pattern => {
            // Valider et normaliser les valeurs
            const validatedType = this.normalizePatternType(pattern.type);
            const validatedDuration = this.normalizeDuration(pattern.duration, validatedType);
            const validatedFrequency = typeof pattern.frequency === 'number' ? pattern.frequency : undefined;

            return {
                type: validatedType,
                duration: validatedDuration,
                frequency: validatedFrequency,
                recommendedSpeed: this.determineRecommendedSpeed(validatedType, validatedDuration),
                intonationCurve: this.determineIntonationCurve(validatedType),
                rhythmicEmphasis: this.determineRhythmicEmphasis(validatedType, validatedFrequency),
                transitionStyle: this.determineTransitionStyle(validatedType)
            };
        });
    }

    /**
     * Crée un pattern de timing par défaut
     * @param globalDuration Durée globale
     * @returns Pattern de timing par défaut
     */
    private createDefaultTimingPattern(globalDuration: number): EnhancedTimingPattern {
        const duration = typeof globalDuration === 'number' && globalDuration > 0 ?
            globalDuration : this.STANDARD_DURATIONS.standard;

        return {
            type: 'standard',
            duration,
            frequency: 1.0,
            recommendedSpeed: 'moderate',
            intonationCurve: 'balanced',
            rhythmicEmphasis: 'natural',
            transitionStyle: 'smooth'
        };
    }

    /**
     * Normalise le type de pattern temporel
     * @param type Type de pattern brut
     * @returns Type de pattern normalisé
     */
    private normalizePatternType(type: string | undefined): string {
        if (!type || typeof type !== 'string') {
            return 'standard';
        }

        const lowercaseType = type.toLowerCase();

        if (['brief', 'short', 'quick', 'rapid'].includes(lowercaseType)) {
            return 'brief';
        }

        if (['standard', 'normal', 'default', 'regular'].includes(lowercaseType)) {
            return 'standard';
        }

        if (['extended', 'long', 'prolonged', 'sustained'].includes(lowercaseType)) {
            return 'extended';
        }

        if (['elaborate', 'complex', 'detailed', 'comprehensive'].includes(lowercaseType)) {
            return 'elaborate';
        }

        return lowercaseType;
    }

    /**
     * Normalise la durée en fonction du type de pattern
     * @param duration Durée brute
     * @param patternType Type de pattern
     * @returns Durée normalisée
     */
    private normalizeDuration(duration: number | undefined, patternType: string): number {
        if (typeof duration === 'number' && duration > 0) {
            return duration;
        }

        // Utiliser une durée standard basée sur le type de pattern
        switch (patternType) {
            case 'brief':
                return this.STANDARD_DURATIONS.brief;
            case 'standard':
                return this.STANDARD_DURATIONS.standard;
            case 'extended':
                return this.STANDARD_DURATIONS.extended;
            case 'elaborate':
                return this.STANDARD_DURATIONS.elaborate;
            default:
                return this.STANDARD_DURATIONS.standard;
        }
    }

    /**
     * Détermine la vitesse recommandée pour un pattern temporel
     * @param type Type de pattern
     * @param duration Durée du pattern
     * @returns Vitesse recommandée
     */
    private determineRecommendedSpeed(type: string, duration: number): string {
        if (type === 'urgent' || type === 'alert') {
            return 'fast';
        } else if (type === 'ceremonial' || type === 'solemn') {
            return 'slow';
        } else if (type === 'narrative') {
            return 'variable';
        } else {
            // Détermination basée sur la durée
            if (duration < 0.5) {
                return 'fast';
            } else if (duration > 1.5) {
                return 'slow';
            } else {
                return 'moderate';
            }
        }
    }

    /**
     * Détermine la courbe d'intonation pour un pattern temporel
     * @param type Type de pattern
     * @returns Courbe d'intonation
     */
    private determineIntonationCurve(type: string): string {
        switch (type) {
            case 'question':
                return 'rising';
            case 'statement':
                return 'falling';
            case 'expressive':
                return 'dynamic';
            case 'emphasis':
                return 'peaked';
            case 'narrative':
                return 'flowing';
            default:
                return 'balanced';
        }
    }

    /**
     * Détermine l'emphase rythmique pour un pattern temporel
     * @param type Type de pattern
     * @param frequency Fréquence du pattern
     * @returns Emphase rythmique
     */
    private determineRhythmicEmphasis(type: string, frequency: number | undefined): string {
        if (type === 'emphatic' || type === 'dramatic') {
            return 'strong';
        } else if (type === 'subtle' || type === 'nuanced') {
            return 'light';
        }

        // Si la fréquence est définie, l'utiliser pour déterminer l'emphase
        if (frequency !== undefined) {
            if (frequency > 1.2) {
                return 'pronounced';
            } else if (frequency < 0.8) {
                return 'subtle';
            }
        }

        return 'natural';
    }

    /**
     * Détermine le style de transition pour un pattern temporel
     * @param type Type de pattern
     * @returns Style de transition
     */
    private determineTransitionStyle(type: string): string {
        switch (type) {
            case 'abrupt':
            case 'urgent':
            case 'alert':
                return 'sharp';
            case 'flowing':
            case 'narrative':
            case 'expressive':
                return 'fluid';
            case 'ceremonial':
            case 'precise':
                return 'deliberate';
            default:
                return 'smooth';
        }
    }

    /**
     * Analyse les contraintes temporelles
     * @param temporal Contexte temporel
     * @returns Contraintes temporelles analysées
     */
    private analyzeTemporalConstraints(temporal: TemporalContext): Record<string, unknown> {
        // Valeurs par défaut
        const constraints: Record<string, unknown> = {
            minDuration: 1.0,
            maxDuration: 5.0,
            priorityTransitions: [],
            flexibility: 'moderate'
        };

        // Durée globale disponible
        if (typeof temporal.duration === 'number' && temporal.duration > 0) {
            // Définir min/max autour de la durée globale
            constraints.minDuration = Math.max(0.5, temporal.duration * 0.7);
            constraints.maxDuration = temporal.duration * 1.3;

            // Ajuster la flexibilité selon la durée
            if (temporal.duration < 2.0) {
                constraints.flexibility = 'low';
            } else if (temporal.duration > 5.0) {
                constraints.flexibility = 'high';
            }
        }

        // Extraire les séquences si disponibles
        if (Array.isArray(temporal.sequence) && temporal.sequence.length > 0) {
            constraints.sequence = temporal.sequence;
            constraints.sequenceLength = temporal.sequence.length;
        }

        return constraints;
    }

    /**
     * Calcule le rythme temporel
     * @param patterns Patterns temporels
     * @returns Caractéristiques du rythme temporel
     */
    private calculateTemporalRhythm(patterns: EnhancedTimingPattern[]): Record<string, unknown> {
        // Si aucun pattern n'est présent, utiliser des valeurs par défaut
        if (patterns.length === 0) {
            return {
                tempo: 'moderate',
                regularity: 'steady',
                adaptability: 'moderate',
                complexity: 'simple'
            };
        }

        // Déterminer le tempo global
        const tempo = this.determineGlobalTempo(patterns);

        // Déterminer la régularité du rythme
        const regularity = this.determineRhythmRegularity(patterns);

        // Déterminer l'adaptabilité du rythme
        const adaptability = this.determineRhythmAdaptability(patterns);

        // Déterminer la complexité du rythme
        const complexity = patterns.length > 2 ? 'complex' : 'simple';

        return {
            tempo,
            regularity,
            adaptability,
            complexity,
            patternCount: patterns.length,
            dominantTransitionStyle: this.determineDominantTransitionStyle(patterns)
        };
    }

    /**
     * Détermine le tempo global des patterns temporels
     * @param patterns Patterns temporels
     * @returns Tempo global
     */
    private determineGlobalTempo(patterns: EnhancedTimingPattern[]): string {
        // Compter les occurrences de chaque vitesse recommandée
        const speedCounts: Record<string, number> = {};

        patterns.forEach(pattern => {
            const speed = pattern.recommendedSpeed;
            speedCounts[speed] = (speedCounts[speed] || 0) + 1;
        });

        // Trouver la vitesse la plus fréquente
        let mostFrequentSpeed = 'moderate';
        let maxCount = 0;

        for (const [speed, count] of Object.entries(speedCounts)) {
            if (count > maxCount) {
                mostFrequentSpeed = speed;
                maxCount = count;
            }
        }

        return mostFrequentSpeed;
    }

    /**
     * Détermine la régularité du rythme
     * @param patterns Patterns temporels
     * @returns Régularité du rythme
     */
    private determineRhythmRegularity(patterns: EnhancedTimingPattern[]): string {
        // Vérifier si tous les tempos sont identiques
        const uniqueSpeeds = new Set(patterns.map(pattern => pattern.recommendedSpeed));

        if (uniqueSpeeds.size === 1) {
            return 'steady';
        }

        if (uniqueSpeeds.size === patterns.length) {
            return 'variable';
        }

        return 'semi_regular';
    }

    /**
     * Détermine l'adaptabilité du rythme
     * @param patterns Patterns temporels
     * @returns Adaptabilité du rythme
     */
    private determineRhythmAdaptability(patterns: EnhancedTimingPattern[]): string {
        // Vérifier la présence de tempos variables
        const hasVariableSpeeds = patterns.some(pattern =>
            pattern.recommendedSpeed === 'variable'
        );

        if (hasVariableSpeeds) {
            return 'high';
        }

        // Vérifier la diversité des tempos
        const uniqueSpeeds = new Set(patterns.map(pattern => pattern.recommendedSpeed));

        if (uniqueSpeeds.size > 1) {
            return 'moderate';
        }

        return 'low';
    }

    /**
     * Détermine le style de transition dominant
     * @param patterns Patterns temporels
     * @returns Style de transition dominant
     */
    private determineDominantTransitionStyle(patterns: EnhancedTimingPattern[]): string {
        // Compter les occurrences de chaque style de transition
        const styleCounts: Record<string, number> = {};

        patterns.forEach(pattern => {
            const style = pattern.transitionStyle;
            styleCounts[style] = (styleCounts[style] || 0) + 1;
        });

        // Trouver le style le plus fréquent
        let mostFrequentStyle = 'smooth';
        let maxCount = 0;

        for (const [style, count] of Object.entries(styleCounts)) {
            if (count > maxCount) {
                mostFrequentStyle = style;
                maxCount = count;
            }
        }

        return mostFrequentStyle;
    }
}