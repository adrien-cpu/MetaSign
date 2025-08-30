/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/pattern/EmotionalPatternDetector.ts
 * @description Détecteur de patterns émotionnels avancé pour IA-élèves
 * 
 * Fonctionnalités révolutionnaires :
 * - 🔍 Détection de cycles d'apprentissage automatique
 * - 🌀 Identification de spirales de frustration
 * - 📈 Analyse de construction de confiance
 * - ⚡ Détection de moments de révélation
 * - 📊 Analyse de stagnation sur plateaux
 * - 🔄 Reconnaissance de patterns de récupération
 * 
 * @module EmotionalPatternDetector
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Emotional AI Division
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type {
    EmotionalState,
    EmotionalPattern,
    PrimaryEmotion
} from '../types/EmotionalTypes';

/**
 * Configuration du détecteur de patterns
 */
export interface PatternDetectorConfig {
    /** Taille minimale de séquence pour détecter un pattern */
    readonly minSequenceLength: number;
    /** Confiance minimale pour valider un pattern */
    readonly minConfidence: number;
    /** Fenêtre temporelle d'analyse (ms) */
    readonly analysisWindow: number;
    /** Seuil de fréquence minimum */
    readonly minFrequency: number;
}

/**
 * Résultat d'analyse de pattern
 */
export interface PatternAnalysisResult {
    /** Patterns détectés */
    readonly patterns: readonly EmotionalPattern[];
    /** Confiance globale de l'analyse */
    readonly overallConfidence: number;
    /** Temps d'analyse */
    readonly analysisTime: number;
    /** Statistiques d'analyse */
    readonly statistics: PatternStatistics;
}

/**
 * Statistiques de l'analyse de patterns
 */
export interface PatternStatistics {
    /** Nombre total d'états analysés */
    readonly totalStatesAnalyzed: number;
    /** Séquences uniques trouvées */
    readonly uniqueSequences: number;
    /** Patterns validés */
    readonly validatedPatterns: number;
    /** Patterns rejetés */
    readonly rejectedPatterns: number;
}

/**
 * Détecteur de patterns émotionnels révolutionnaire
 * 
 * @class EmotionalPatternDetector
 * @description Analyse les séquences émotionnelles pour détecter des patterns
 * significatifs dans l'apprentissage des IA-élèves.
 * 
 * @example
 * ```typescript
 * const detector = new EmotionalPatternDetector({
 *   minSequenceLength: 3,
 *   minConfidence: 0.7,
 *   analysisWindow: 300000 // 5 minutes
 * });
 * 
 * const result = await detector.analyzePatterns(emotionalHistory);
 * console.log(`${result.patterns.length} patterns détectés`);
 * ```
 */
export class EmotionalPatternDetector {
    /**
     * Logger pour le détecteur de patterns
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('EmotionalPatternDetectorV3');

    /**
     * Configuration du détecteur
     * @private
     * @readonly
     */
    private readonly config: PatternDetectorConfig;

    /**
     * Constructeur du détecteur de patterns
     * 
     * @constructor
     * @param {Partial<PatternDetectorConfig>} [config] - Configuration optionnelle
     */
    constructor(config?: Partial<PatternDetectorConfig>) {
        this.config = {
            minSequenceLength: 3,
            minConfidence: 0.6,
            analysisWindow: 300000, // 5 minutes
            minFrequency: 2,
            ...config
        };

        this.logger.info('🔍 Détecteur de patterns émotionnels initialisé', {
            config: this.config
        });
    }

    /**
     * Analyse les patterns émotionnels dans l'historique
     * 
     * @method analyzePatterns
     * @async
     * @param {readonly EmotionalState[]} stateHistory - Historique des états émotionnels
     * @returns {Promise<PatternAnalysisResult>} Résultat de l'analyse
     * @public
     */
    public async analyzePatterns(stateHistory: readonly EmotionalState[]): Promise<PatternAnalysisResult> {
        const startTime = Date.now();

        try {
            this.logger.debug('🔍 Début analyse patterns', {
                statesCount: stateHistory.length,
                windowSize: this.config.analysisWindow
            });

            if (stateHistory.length < this.config.minSequenceLength) {
                return this.createEmptyResult(startTime);
            }

            const patterns: EmotionalPattern[] = [];

            // Détecter cycles d'apprentissage
            const learningCycles = await this.detectLearningCycles(stateHistory);
            patterns.push(...learningCycles);

            // Détecter spirales de frustration
            const frustrationSpirals = await this.detectFrustrationSpirals(stateHistory);
            patterns.push(...frustrationSpirals);

            // Détecter construction de confiance
            const confidenceBuilds = await this.detectConfidenceBuilding(stateHistory);
            patterns.push(...confidenceBuilds);

            // Détecter moments de révélation
            const breakthroughs = await this.detectBreakthroughs(stateHistory);
            patterns.push(...breakthroughs);

            // Détecter stagnation sur plateaux
            const plateauStagnations = await this.detectPlateauStagnation(stateHistory);
            patterns.push(...plateauStagnations);

            // Détecter récupération après échec
            const recoveryBounces = await this.detectRecoveryBounces(stateHistory);
            patterns.push(...recoveryBounces);

            // Calculer confiance globale
            const overallConfidence = this.calculateOverallConfidence(patterns);

            // Générer statistiques
            const statistics = this.generateStatistics(stateHistory, patterns);

            const analysisTime = Date.now() - startTime;

            this.logger.info('✨ Analyse patterns terminée', {
                patternsFound: patterns.length,
                confidence: overallConfidence.toFixed(2),
                analysisTimeMs: analysisTime
            });

            return {
                patterns,
                overallConfidence,
                analysisTime,
                statistics
            };
        } catch (error) {
            this.logger.error('❌ Erreur analyse patterns', { error });
            throw error;
        }
    }

    // ================== DÉTECTEURS SPÉCIALISÉS ==================

    /**
     * Détecte les cycles d'apprentissage (confusion → effort → maîtrise)
     */
    private async detectLearningCycles(states: readonly EmotionalState[]): Promise<EmotionalPattern[]> {
        const patterns: EmotionalPattern[] = [];
        const cycleSequences = [
            ['fear', 'anger', 'anticipation', 'joy'],
            ['sadness', 'anticipation', 'trust', 'joy'],
            ['confusion', 'effort', 'breakthrough', 'satisfaction']
        ];

        for (const sequence of cycleSequences) {
            const matches = this.findSequenceMatches(states, sequence as PrimaryEmotion[]);
            if (matches.length >= this.config.minFrequency) {
                patterns.push({
                    type: 'learningCycle',
                    sequence: sequence as PrimaryEmotion[],
                    frequency: matches.length,
                    triggers: this.extractTriggers(matches),
                    confidence: this.calculatePatternConfidence(matches, sequence.length)
                });
            }
        }

        return patterns;
    }

    /**
     * Détecte les spirales de frustration (colère → peur → plus de colère)
     */
    private async detectFrustrationSpirals(states: readonly EmotionalState[]): Promise<EmotionalPattern[]> {
        const patterns: EmotionalPattern[] = [];
        const spiralIndicators = ['anger', 'fear', 'anger', 'disgust'];

        // Chercher des séquences d'intensité croissante
        for (let i = 0; i < states.length - 3; i++) {
            const window = states.slice(i, i + 4);

            if (this.matchesEmotionSequence(window, spiralIndicators as PrimaryEmotion[]) &&
                this.hasIncreasingIntensity(window)) {

                const frequency = this.countSimilarSequences(states, window);
                if (frequency >= this.config.minFrequency) {
                    patterns.push({
                        type: 'frustrationSpiral',
                        sequence: spiralIndicators as PrimaryEmotion[],
                        frequency,
                        triggers: window.map(s => s.trigger),
                        confidence: this.calculateSequenceConfidence(window)
                    });
                }
            }
        }

        return patterns;
    }

    /**
     * Détecte la construction de confiance (progression graduelle vers trust/joy)
     */
    private async detectConfidenceBuilding(states: readonly EmotionalState[]): Promise<EmotionalPattern[]> {
        const patterns: EmotionalPattern[] = [];
        const confidenceSequences = [
            ['fear', 'anticipation', 'trust', 'joy'],
            ['sadness', 'anticipation', 'surprise', 'joy'],
            ['anger', 'anticipation', 'trust']
        ];

        for (const sequence of confidenceSequences) {
            const matches = this.findConfidenceBuildingMatches(states, sequence as PrimaryEmotion[]);
            if (matches.length >= this.config.minFrequency) {
                patterns.push({
                    type: 'confidenceBuild',
                    sequence: sequence as PrimaryEmotion[],
                    frequency: matches.length,
                    triggers: this.extractTriggers(matches),
                    confidence: this.calculatePatternConfidence(matches, sequence.length)
                });
            }
        }

        return patterns;
    }

    /**
     * Détecte les moments de révélation (surprise → joy intense)
     */
    private async detectBreakthroughs(states: readonly EmotionalState[]): Promise<EmotionalPattern[]> {
        const patterns: EmotionalPattern[] = [];
        const breakthroughStates: EmotionalState[] = [];

        for (let i = 0; i < states.length - 1; i++) {
            const current = states[i];
            const next = states[i + 1];

            // Détection: surprise suivie de joie intense
            if (current.primaryEmotion === 'surprise' &&
                next.primaryEmotion === 'joy' &&
                next.intensity > 0.8) {
                breakthroughStates.push(current, next);
            }
        }

        if (breakthroughStates.length >= this.config.minFrequency * 2) {
            patterns.push({
                type: 'breakthrough',
                sequence: ['surprise', 'joy'],
                frequency: Math.floor(breakthroughStates.length / 2),
                triggers: breakthroughStates.map(s => s.trigger),
                confidence: 0.9 // Les breakthroughs sont généralement très clairs
            });
        }

        return patterns;
    }

    /**
     * Détecte la stagnation sur plateaux (émotions neutres prolongées)
     */
    private async detectPlateauStagnation(states: readonly EmotionalState[]): Promise<EmotionalPattern[]> {
        const patterns: EmotionalPattern[] = [];
        const neutralEmotions: PrimaryEmotion[] = ['anticipation', 'trust'];

        let plateauStart = -1;
        let plateauCount = 0;

        for (let i = 0; i < states.length; i++) {
            const state = states[i];

            if (neutralEmotions.includes(state.primaryEmotion) && state.intensity < 0.5) {
                if (plateauStart === -1) {
                    plateauStart = i;
                }
                plateauCount++;
            } else {
                if (plateauCount >= this.config.minSequenceLength) {
                    const plateauStates = states.slice(plateauStart, i);
                    patterns.push({
                        type: 'plateauStagnation',
                        sequence: plateauStates.map(s => s.primaryEmotion),
                        frequency: 1,
                        triggers: plateauStates.map(s => s.trigger),
                        confidence: this.calculatePlateauConfidence(plateauCount)
                    });
                }
                plateauStart = -1;
                plateauCount = 0;
            }
        }

        return patterns;
    }

    /**
     * Détecte la récupération après échec (sadness → anger → determination → joy)
     */
    private async detectRecoveryBounces(states: readonly EmotionalState[]): Promise<EmotionalPattern[]> {
        const patterns: EmotionalPattern[] = [];
        const recoverySequence: PrimaryEmotion[] = ['sadness', 'anger', 'anticipation', 'joy'];

        const matches = this.findRecoveryMatches(states, recoverySequence);
        if (matches.length >= this.config.minFrequency) {
            patterns.push({
                type: 'recoveryBounce',
                sequence: recoverySequence,
                frequency: matches.length,
                triggers: this.extractTriggers(matches),
                confidence: this.calculatePatternConfidence(matches, recoverySequence.length)
            });
        }

        return patterns;
    }

    // ================== MÉTHODES UTILITAIRES ==================

    /**
     * Trouve les correspondances de séquence dans l'historique
     */
    private findSequenceMatches(
        states: readonly EmotionalState[],
        sequence: readonly PrimaryEmotion[]
    ): EmotionalState[][] {
        const matches: EmotionalState[][] = [];

        for (let i = 0; i <= states.length - sequence.length; i++) {
            const window = states.slice(i, i + sequence.length);
            if (this.matchesEmotionSequence(window, sequence)) {
                matches.push(window);
            }
        }

        return matches;
    }

    /**
     * Vérifie si une fenêtre correspond à une séquence d'émotions
     */
    private matchesEmotionSequence(
        window: readonly EmotionalState[],
        sequence: readonly PrimaryEmotion[]
    ): boolean {
        if (window.length !== sequence.length) return false;

        return window.every((state, index) => state.primaryEmotion === sequence[index]);
    }

    /**
     * Vérifie si une séquence a une intensité croissante
     */
    private hasIncreasingIntensity(states: readonly EmotionalState[]): boolean {
        for (let i = 1; i < states.length; i++) {
            if (states[i].intensity <= states[i - 1].intensity) {
                return false;
            }
        }
        return true;
    }

    /**
     * Calcule la confiance d'un pattern
     */
    private calculatePatternConfidence(matches: EmotionalState[][], sequenceLength: number): number {
        const baseConfidence = Math.min(matches.length / this.config.minFrequency, 1);
        const lengthBonus = Math.min(sequenceLength / 5, 0.2);
        return Math.min(baseConfidence + lengthBonus, 1);
    }

    /**
     * Calcule la confiance d'une séquence spécifique
     */
    private calculateSequenceConfidence(states: readonly EmotionalState[]): number {
        const avgIntensity = states.reduce((sum, s) => sum + s.intensity, 0) / states.length;
        return Math.min(avgIntensity + 0.3, 1);
    }

    /**
     * Calcule la confiance d'un plateau
     */
    private calculatePlateauConfidence(length: number): number {
        return Math.min(length / 10, 1);
    }

    /**
     * Extrait les déclencheurs d'une série de correspondances
     */
    private extractTriggers(matches: EmotionalState[][]): readonly string[] {
        const triggers = new Set<string>();
        matches.forEach(match => {
            match.forEach(state => triggers.add(state.trigger));
        });
        return Array.from(triggers);
    }

    /**
     * Compte les séquences similaires
     */
    private countSimilarSequences(
        states: readonly EmotionalState[],
        target: readonly EmotionalState[]
    ): number {
        let count = 0;
        const targetEmotions = target.map(s => s.primaryEmotion);

        for (let i = 0; i <= states.length - target.length; i++) {
            const window = states.slice(i, i + target.length);
            if (this.matchesEmotionSequence(window, targetEmotions)) {
                count++;
            }
        }

        return count;
    }

    /**
     * Trouve les correspondances de construction de confiance
     */
    private findConfidenceBuildingMatches(
        states: readonly EmotionalState[],
        sequence: readonly PrimaryEmotion[]
    ): EmotionalState[][] {
        const matches: EmotionalState[][] = [];

        for (let i = 0; i <= states.length - sequence.length; i++) {
            const window = states.slice(i, i + sequence.length);
            if (this.matchesEmotionSequence(window, sequence) &&
                this.hasProgressiveImprovement(window)) {
                matches.push(window);
            }
        }

        return matches;
    }

    /**
     * Trouve les correspondances de récupération
     */
    private findRecoveryMatches(
        states: readonly EmotionalState[],
        sequence: readonly PrimaryEmotion[]
    ): EmotionalState[][] {
        const matches: EmotionalState[][] = [];

        for (let i = 0; i <= states.length - sequence.length; i++) {
            const window = states.slice(i, i + sequence.length);
            if (this.matchesEmotionSequence(window, sequence) &&
                this.hasRecoveryPattern(window)) {
                matches.push(window);
            }
        }

        return matches;
    }

    /**
     * Vérifie si une séquence montre une amélioration progressive
     */
    private hasProgressiveImprovement(states: readonly EmotionalState[]): boolean {
        const firstValence = states[0].valence;
        const lastValence = states[states.length - 1].valence;
        return lastValence > firstValence + 0.3; // Amélioration significative
    }

    /**
     * Vérifie si une séquence montre un pattern de récupération
     */
    private hasRecoveryPattern(states: readonly EmotionalState[]): boolean {
        if (states.length < 4) return false;

        const start = states[0];
        const end = states[states.length - 1];

        return start.valence < -0.5 && end.valence > 0.5; // De négatif à positif
    }

    /**
     * Calcule la confiance globale de l'analyse
     */
    private calculateOverallConfidence(patterns: readonly EmotionalPattern[]): number {
        if (patterns.length === 0) return 0;

        const totalConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0);
        return totalConfidence / patterns.length;
    }

    /**
     * Génère les statistiques d'analyse
     */
    private generateStatistics(
        states: readonly EmotionalState[],
        patterns: readonly EmotionalPattern[]
    ): PatternStatistics {
        const uniqueSequences = new Set(patterns.map(p => p.sequence.join('->'))).size;
        const validatedPatterns = patterns.filter(p => p.confidence >= this.config.minConfidence).length;
        const rejectedPatterns = patterns.length - validatedPatterns;

        return {
            totalStatesAnalyzed: states.length,
            uniqueSequences,
            validatedPatterns,
            rejectedPatterns
        };
    }

    /**
     * Crée un résultat vide en cas d'historique insuffisant
     */
    private createEmptyResult(startTime: number): PatternAnalysisResult {
        return {
            patterns: [],
            overallConfidence: 0,
            analysisTime: Date.now() - startTime,
            statistics: {
                totalStatesAnalyzed: 0,
                uniqueSequences: 0,
                validatedPatterns: 0,
                rejectedPatterns: 0
            }
        };
    }
}