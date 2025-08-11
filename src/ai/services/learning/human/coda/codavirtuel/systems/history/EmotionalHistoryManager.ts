/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/history/EmotionalHistoryManager.ts
 * @description Gestionnaire d'historique émotionnel avancé pour IA-élèves
 * 
 * Fonctionnalités révolutionnaires :
 * - 📊 Stockage et indexation optimisés de l'historique
 * - 🔍 Recherche et filtrage avancés
 * - 📈 Analyse de tendances émotionnelles
 * - 🎯 Détection d'anomalies émotionnelles
 * - 💾 Gestion mémoire intelligente avec TTL
 * - 📋 Export et import d'historiques
 * 
 * @module EmotionalHistoryManager
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Emotional AI Division
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type {
    EmotionalState,
    EmotionalTransition,
    EmotionalHistory,
    EmotionalPattern,
    PrimaryEmotion
} from '../types/EmotionalTypes';

/**
 * Configuration du gestionnaire d'historique
 */
export interface HistoryManagerConfig {
    /** Profondeur maximale de l'historique */
    readonly maxHistoryDepth: number;
    /** TTL pour les entrées d'historique (ms) */
    readonly entryTTL: number;
    /** Intervalle de nettoyage automatique (ms) */
    readonly cleanupInterval: number;
    /** Activer la compression automatique */
    readonly enableCompression: boolean;
    /** Seuil de compression (nombre d'entrées) */
    readonly compressionThreshold: number;
}

/**
 * Critères de recherche dans l'historique
 */
export interface HistorySearchCriteria {
    /** Émotions à rechercher */
    readonly emotions?: readonly PrimaryEmotion[];
    /** Période de recherche */
    readonly timeRange?: {
        readonly start: Date;
        readonly end: Date;
    };
    /** Intensité minimale */
    readonly minIntensity?: number;
    /** Intensité maximale */
    readonly maxIntensity?: number;
    /** Déclencheurs à rechercher */
    readonly triggers?: readonly string[];
    /** Limite de résultats */
    readonly limit?: number;
}

/**
 * Résultat de recherche dans l'historique
 */
export interface HistorySearchResult {
    /** États trouvés */
    readonly states: readonly EmotionalState[];
    /** Transitions trouvées */
    readonly transitions: readonly EmotionalTransition[];
    /** Nombre total de résultats */
    readonly totalCount: number;
    /** Temps de recherche (ms) */
    readonly searchTime: number;
}

/**
 * Analyse de tendances émotionnelles
 */
export interface EmotionalTrendAnalysis {
    /** Tendance de valence (positive/négative) */
    readonly valenceTrend: TrendDirection;
    /** Tendance d'intensité */
    readonly intensityTrend: TrendDirection;
    /** Émotion dominante */
    readonly dominantEmotion: PrimaryEmotion;
    /** Fréquence des émotions */
    readonly emotionFrequency: ReadonlyMap<PrimaryEmotion, number>;
    /** Durée moyenne des états */
    readonly averageStateDuration: number;
    /** Stabilité émotionnelle (coefficient de variation) */
    readonly emotionalStability: number;
}

/**
 * Direction de tendance
 */
export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'volatile';

/**
 * Anomalie émotionnelle détectée
 */
export interface EmotionalAnomaly {
    /** Type d'anomalie */
    readonly type: AnomalyType;
    /** État concerné */
    readonly state: EmotionalState;
    /** Score d'anomalie (0-1) */
    readonly anomalyScore: number;
    /** Description de l'anomalie */
    readonly description: string;
    /** Recommandations */
    readonly recommendations: readonly string[];
}

/**
 * Types d'anomalies émotionnelles
 */
export type AnomalyType =
    | 'intensity_spike'     // Pic d'intensité inhabituel
    | 'rapid_oscillation'   // Oscillation rapide d'émotions
    | 'prolonged_negative'  // État négatif prolongé
    | 'emotional_flatline'  // Absence de variation émotionnelle
    | 'unexpected_trigger'; // Déclencheur inattendu

/**
 * Statistiques d'historique
 */
export interface HistoryStatistics {
    /** Nombre total d'états */
    readonly totalStates: number;
    /** Nombre total de transitions */
    readonly totalTransitions: number;
    /** Durée totale couverte (ms) */
    readonly totalDuration: number;
    /** Émotions uniques observées */
    readonly uniqueEmotions: readonly PrimaryEmotion[];
    /** Taille mémoire utilisée (bytes) */
    readonly memoryUsage: number;
    /** Date de la dernière analyse */
    readonly lastAnalysis: Date;
}

/**
 * Gestionnaire d'historique émotionnel révolutionnaire
 * 
 * @class EmotionalHistoryManager
 * @description Gère l'historique émotionnel avec stockage optimisé,
 * recherche avancée et analyse de tendances pour IA-élèves.
 * 
 * @example
 * ```typescript
 * const historyManager = new EmotionalHistoryManager({
 *   maxHistoryDepth: 1000,
 *   enableCompression: true
 * });
 * 
 * // Ajouter un état
 * await historyManager.addState('student123', emotionalState);
 * 
 * // Rechercher
 * const results = await historyManager.searchHistory('student123', {
 *   emotions: ['joy', 'surprise'],
 *   minIntensity: 0.7
 * });
 * 
 * // Analyser les tendances
 * const trends = await historyManager.analyzeTrends('student123');
 * ```
 */
export class EmotionalHistoryManager {
    /**
     * Logger pour le gestionnaire d'historique
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('EmotionalHistoryManager_v3');

    /**
     * Configuration du gestionnaire
     * @private
     * @readonly
     */
    private readonly config: HistoryManagerConfig;

    /**
     * Historiques par étudiant
     * @private
     */
    private readonly histories = new Map<string, EmotionalHistory>();

    /**
     * Index de recherche par émotion
     * @private
     */
    private readonly emotionIndex = new Map<string, Map<PrimaryEmotion, EmotionalState[]>>();

    /**
     * Index de recherche par déclencheur
     * @private
     */
    private readonly triggerIndex = new Map<string, Map<string, EmotionalState[]>>();

    /**
     * Horodatages de dernière activité
     * @private
     */
    private readonly lastActivity = new Map<string, Date>();

    /**
     * Constructeur du gestionnaire d'historique
     * 
     * @constructor
     * @param {Partial<HistoryManagerConfig>} [config] - Configuration optionnelle
     */
    constructor(config?: Partial<HistoryManagerConfig>) {
        this.config = {
            maxHistoryDepth: 1000,
            entryTTL: 7 * 24 * 60 * 60 * 1000, // 7 jours
            cleanupInterval: 60 * 60 * 1000, // 1 heure
            enableCompression: true,
            compressionThreshold: 500,
            ...config
        };

        this.startCleanupProcess();

        this.logger.info('📊 Gestionnaire d\'historique émotionnel initialisé', {
            config: this.config
        });
    }

    /**
     * Ajoute un état émotionnel à l'historique
     * 
     * @method addState
     * @async
     * @param {string} studentId - ID de l'IA-élève
     * @param {EmotionalState} state - État émotionnel à ajouter
     * @returns {Promise<void>}
     * @public
     */
    public async addState(studentId: string, state: EmotionalState): Promise<void> {
        try {
            this.logger.debug('📝 Ajout état à l\'historique', {
                studentId,
                emotion: state.primaryEmotion,
                intensity: state.intensity.toFixed(2)
            });

            // Obtenir ou créer l'historique
            let history = this.histories.get(studentId);
            if (!history) {
                history = this.createEmptyHistory();
                this.histories.set(studentId, history);
                this.initializeIndexes(studentId);
            }

            // Ajouter l'état
            const newStateHistory = [...history.stateHistory, state];

            // Respecter la profondeur maximale
            const trimmedStateHistory = newStateHistory.slice(-this.config.maxHistoryDepth);

            // Mettre à jour l'historique
            const updatedHistory: EmotionalHistory = {
                ...history,
                stateHistory: trimmedStateHistory,
                lastAnalysis: new Date()
            };

            this.histories.set(studentId, updatedHistory);

            // Mettre à jour les index
            this.updateIndexes(studentId, state);

            // Mettre à jour l'activité
            this.lastActivity.set(studentId, new Date());

            // Vérifier si compression nécessaire
            if (this.config.enableCompression &&
                trimmedStateHistory.length >= this.config.compressionThreshold) {
                await this.compressHistory(studentId);
            }

            this.logger.debug('✅ État ajouté à l\'historique', {
                studentId,
                totalStates: trimmedStateHistory.length
            });
        } catch (error) {
            this.logger.error('❌ Erreur ajout état historique', { studentId, error });
            throw error;
        }
    }

    /**
     * Ajoute une transition émotionnelle à l'historique
     * 
     * @method addTransition
     * @async
     * @param {string} studentId - ID de l'IA-élève
     * @param {EmotionalTransition} transition - Transition à ajouter
     * @returns {Promise<void>}
     * @public
     */
    public async addTransition(studentId: string, transition: EmotionalTransition): Promise<void> {
        try {
            this.logger.debug('🔄 Ajout transition à l\'historique', {
                studentId,
                from: transition.fromState.primaryEmotion,
                to: transition.toState.primaryEmotion
            });

            let history = this.histories.get(studentId);
            if (!history) {
                history = this.createEmptyHistory();
                this.histories.set(studentId, history);
            }

            const newTransitionHistory = [...history.transitionHistory, transition];
            const trimmedTransitionHistory = newTransitionHistory.slice(-this.config.maxHistoryDepth);

            const updatedHistory: EmotionalHistory = {
                ...history,
                transitionHistory: trimmedTransitionHistory,
                lastAnalysis: new Date()
            };

            this.histories.set(studentId, updatedHistory);
            this.lastActivity.set(studentId, new Date());

            this.logger.debug('✅ Transition ajoutée à l\'historique', {
                studentId,
                totalTransitions: trimmedTransitionHistory.length
            });
        } catch (error) {
            this.logger.error('❌ Erreur ajout transition historique', { studentId, error });
            throw error;
        }
    }

    /**
     * Recherche dans l'historique émotionnel
     * 
     * @method searchHistory
     * @async
     * @param {string} studentId - ID de l'IA-élève
     * @param {HistorySearchCriteria} criteria - Critères de recherche
     * @returns {Promise<HistorySearchResult>} Résultats de recherche
     * @public
     */
    public async searchHistory(
        studentId: string,
        criteria: HistorySearchCriteria
    ): Promise<HistorySearchResult> {
        const startTime = Date.now();

        try {
            this.logger.debug('🔍 Recherche dans l\'historique', {
                studentId,
                criteria
            });

            const history = this.histories.get(studentId);
            if (!history) {
                return this.createEmptySearchResult(startTime);
            }

            let filteredStates = history.stateHistory;
            let filteredTransitions = history.transitionHistory;

            // Filtrer par émotions
            if (criteria.emotions && criteria.emotions.length > 0) {
                filteredStates = filteredStates.filter(state =>
                    criteria.emotions!.includes(state.primaryEmotion)
                );
            }

            // Filtrer par période
            if (criteria.timeRange) {
                filteredStates = filteredStates.filter(state =>
                    state.timestamp >= criteria.timeRange!.start &&
                    state.timestamp <= criteria.timeRange!.end
                );

                filteredTransitions = filteredTransitions.filter(transition =>
                    transition.startTime >= criteria.timeRange!.start &&
                    transition.startTime <= criteria.timeRange!.end
                );
            }

            // Filtrer par intensité
            if (criteria.minIntensity !== undefined) {
                filteredStates = filteredStates.filter(state =>
                    state.intensity >= criteria.minIntensity!
                );
            }

            if (criteria.maxIntensity !== undefined) {
                filteredStates = filteredStates.filter(state =>
                    state.intensity <= criteria.maxIntensity!
                );
            }

            // Filtrer par déclencheurs
            if (criteria.triggers && criteria.triggers.length > 0) {
                filteredStates = filteredStates.filter(state =>
                    criteria.triggers!.some(trigger =>
                        state.trigger.toLowerCase().includes(trigger.toLowerCase())
                    )
                );
            }

            // Appliquer la limite
            if (criteria.limit && criteria.limit > 0) {
                filteredStates = filteredStates.slice(-criteria.limit);
                filteredTransitions = filteredTransitions.slice(-criteria.limit);
            }

            const searchTime = Date.now() - startTime;

            const result: HistorySearchResult = {
                states: filteredStates,
                transitions: filteredTransitions,
                totalCount: filteredStates.length + filteredTransitions.length,
                searchTime
            };

            this.logger.debug('✅ Recherche terminée', {
                studentId,
                resultsCount: result.totalCount,
                searchTimeMs: searchTime
            });

            return result;
        } catch (error) {
            this.logger.error('❌ Erreur recherche historique', { studentId, error });
            throw error;
        }
    }

    /**
     * Analyse les tendances émotionnelles
     * 
     * @method analyzeTrends
     * @async
     * @param {string} studentId - ID de l'IA-élève
     * @param {number} [windowSize] - Taille de la fenêtre d'analyse
     * @returns {Promise<EmotionalTrendAnalysis>} Analyse des tendances
     * @public
     */
    public async analyzeTrends(
        studentId: string,
        windowSize: number = 50
    ): Promise<EmotionalTrendAnalysis> {
        try {
            this.logger.debug('📈 Analyse des tendances', { studentId, windowSize });

            const history = this.histories.get(studentId);
            if (!history || history.stateHistory.length < 5) {
                throw new Error('Historique insuffisant pour analyse des tendances');
            }

            const recentStates = history.stateHistory.slice(-windowSize);

            // Analyser la tendance de valence
            const valenceTrend = this.calculateValenceTrend(recentStates);

            // Analyser la tendance d'intensité
            const intensityTrend = this.calculateIntensityTrend(recentStates);

            // Calculer l'émotion dominante
            const dominantEmotion = this.calculateDominantEmotion(recentStates);

            // Calculer la fréquence des émotions
            const emotionFrequency = this.calculateEmotionFrequency(recentStates);

            // Calculer la durée moyenne des états
            const averageStateDuration = this.calculateAverageStateDuration(recentStates);

            // Calculer la stabilité émotionnelle
            const emotionalStability = this.calculateEmotionalStability(recentStates);

            const analysis: EmotionalTrendAnalysis = {
                valenceTrend,
                intensityTrend,
                dominantEmotion,
                emotionFrequency,
                averageStateDuration,
                emotionalStability
            };

            this.logger.info('📊 Tendances analysées', {
                studentId,
                valenceTrend,
                dominantEmotion,
                stability: emotionalStability.toFixed(2)
            });

            return analysis;
        } catch (error) {
            this.logger.error('❌ Erreur analyse tendances', { studentId, error });
            throw error;
        }
    }

    /**
     * Détecte les anomalies émotionnelles
     * 
     * @method detectAnomalies
     * @async
     * @param {string} studentId - ID de l'IA-élève
     * @returns {Promise<readonly EmotionalAnomaly[]>} Anomalies détectées
     * @public
     */
    public async detectAnomalies(studentId: string): Promise<readonly EmotionalAnomaly[]> {
        try {
            this.logger.debug('🚨 Détection d\'anomalies', { studentId });

            const history = this.histories.get(studentId);
            if (!history || history.stateHistory.length < 10) {
                return [];
            }

            const anomalies: EmotionalAnomaly[] = [];

            // Détecter les pics d'intensité
            anomalies.push(...this.detectIntensitySpikes(history.stateHistory));

            // Détecter les oscillations rapides
            anomalies.push(...this.detectRapidOscillations(history.stateHistory));

            // Détecter les états négatifs prolongés
            anomalies.push(...this.detectProlongedNegativeStates(history.stateHistory));

            // Détecter l'absence de variation émotionnelle
            anomalies.push(...this.detectEmotionalFlatlines(history.stateHistory));

            this.logger.info('🔍 Anomalies détectées', {
                studentId,
                anomaliesCount: anomalies.length,
                types: anomalies.map(a => a.type)
            });

            return anomalies;
        } catch (error) {
            this.logger.error('❌ Erreur détection anomalies', { studentId, error });
            throw error;
        }
    }

    /**
     * Obtient les statistiques d'historique
     * 
     * @method getHistoryStatistics
     * @param {string} studentId - ID de l'IA-élève
     * @returns {HistoryStatistics | undefined} Statistiques d'historique
     * @public
     */
    public getHistoryStatistics(studentId: string): HistoryStatistics | undefined {
        const history = this.histories.get(studentId);
        if (!history) return undefined;

        const uniqueEmotions = Array.from(
            new Set(history.stateHistory.map(s => s.primaryEmotion))
        );

        const totalDuration = history.stateHistory.length > 1
            ? history.stateHistory[history.stateHistory.length - 1].timestamp.getTime() -
            history.stateHistory[0].timestamp.getTime()
            : 0;

        // Estimation approximative de la taille mémoire
        const memoryUsage = JSON.stringify(history).length * 2; // Approximation UTF-16

        return {
            totalStates: history.stateHistory.length,
            totalTransitions: history.transitionHistory.length,
            totalDuration,
            uniqueEmotions,
            memoryUsage,
            lastAnalysis: history.lastAnalysis
        };
    }

    // ================== MÉTHODES PRIVÉES ==================

    /**
     * Crée un historique vide
     */
    private createEmptyHistory(): EmotionalHistory {
        return {
            stateHistory: [],
            transitionHistory: [],
            detectedPatterns: [],
            lastAnalysis: new Date()
        };
    }

    /**
     * Initialise les index de recherche
     */
    private initializeIndexes(studentId: string): void {
        this.emotionIndex.set(studentId, new Map());
        this.triggerIndex.set(studentId, new Map());
    }

    /**
     * Met à jour les index de recherche
     */
    private updateIndexes(studentId: string, state: EmotionalState): void {
        // Index par émotion
        const emotionMap = this.emotionIndex.get(studentId);
        if (emotionMap) {
            const emotionStates = emotionMap.get(state.primaryEmotion) || [];
            emotionStates.push(state);
            emotionMap.set(state.primaryEmotion, emotionStates.slice(-100)); // Limiter l'index
        }

        // Index par déclencheur
        const triggerMap = this.triggerIndex.get(studentId);
        if (triggerMap) {
            const triggerStates = triggerMap.get(state.trigger) || [];
            triggerStates.push(state);
            triggerMap.set(state.trigger, triggerStates.slice(-100)); // Limiter l'index
        }
    }

    /**
     * Démarre le processus de nettoyage automatique
     */
    private startCleanupProcess(): void {
        setInterval(() => {
            this.performCleanup();
        }, this.config.cleanupInterval);
    }

    /**
     * Effectue le nettoyage automatique
     */
    private performCleanup(): void {
        const now = Date.now();
        const cutoffTime = now - this.config.entryTTL;

        this.lastActivity.forEach((lastTime, studentId) => {
            if (lastTime.getTime() < cutoffTime) {
                this.histories.delete(studentId);
                this.emotionIndex.delete(studentId);
                this.triggerIndex.delete(studentId);
                this.lastActivity.delete(studentId);

                this.logger.debug('🧹 Historique nettoyé (TTL expiré)', { studentId });
            }
        });
    }

    /**
     * Comprime l'historique si nécessaire
     */
    private async compressHistory(studentId: string): Promise<void> {
        const history = this.histories.get(studentId);
        if (!history) return;

        // Compression simple : garder 1 état sur 2 pour la première moitié
        const half = Math.floor(history.stateHistory.length / 2);
        const firstHalf = history.stateHistory.slice(0, half).filter((_, index) => index % 2 === 0);
        const secondHalf = history.stateHistory.slice(half);

        const compressedHistory: EmotionalHistory = {
            ...history,
            stateHistory: [...firstHalf, ...secondHalf]
        };

        this.histories.set(studentId, compressedHistory);
        this.logger.debug('🗜️ Historique compressé', {
            studentId,
            originalSize: history.stateHistory.length,
            compressedSize: compressedHistory.stateHistory.length
        });
    }

    /**
     * Méthodes d'analyse de tendances
     */
    private calculateValenceTrend(states: readonly EmotionalState[]): TrendDirection {
        if (states.length < 3) return 'stable';

        const valences = states.map(s => s.valence);
        const trend = this.calculateLinearTrend(valences);

        if (Math.abs(trend) < 0.01) return 'stable';
        if (this.isVolatile(valences)) return 'volatile';
        return trend > 0 ? 'increasing' : 'decreasing';
    }

    private calculateIntensityTrend(states: readonly EmotionalState[]): TrendDirection {
        if (states.length < 3) return 'stable';

        const intensities = states.map(s => s.intensity);
        const trend = this.calculateLinearTrend(intensities);

        if (Math.abs(trend) < 0.01) return 'stable';
        if (this.isVolatile(intensities)) return 'volatile';
        return trend > 0 ? 'increasing' : 'decreasing';
    }

    private calculateDominantEmotion(states: readonly EmotionalState[]): PrimaryEmotion {
        const frequency = new Map<PrimaryEmotion, number>();

        states.forEach(state => {
            frequency.set(state.primaryEmotion, (frequency.get(state.primaryEmotion) || 0) + 1);
        });

        let maxCount = 0;
        let dominantEmotion: PrimaryEmotion = 'anticipation';

        frequency.forEach((count, emotion) => {
            if (count > maxCount) {
                maxCount = count;
                dominantEmotion = emotion;
            }
        });

        return dominantEmotion;
    }

    private calculateEmotionFrequency(states: readonly EmotionalState[]): ReadonlyMap<PrimaryEmotion, number> {
        const frequency = new Map<PrimaryEmotion, number>();

        states.forEach(state => {
            frequency.set(state.primaryEmotion, (frequency.get(state.primaryEmotion) || 0) + 1);
        });

        // Normaliser par le nombre total d'états
        const total = states.length;
        const normalizedFrequency = new Map<PrimaryEmotion, number>();

        frequency.forEach((count, emotion) => {
            normalizedFrequency.set(emotion, count / total);
        });

        return normalizedFrequency;
    }

    private calculateAverageStateDuration(states: readonly EmotionalState[]): number {
        const durations = states.map(s => s.expectedDuration);
        return durations.reduce((sum, d) => sum + d, 0) / durations.length;
    }

    private calculateEmotionalStability(states: readonly EmotionalState[]): number {
        const intensities = states.map(s => s.intensity);
        const mean = intensities.reduce((sum, i) => sum + i, 0) / intensities.length;
        const variance = intensities.reduce((sum, i) => sum + Math.pow(i - mean, 2), 0) / intensities.length;
        const stdDev = Math.sqrt(variance);

        // Coefficient de variation (stabilité inverse)
        return mean > 0 ? 1 - (stdDev / mean) : 1;
    }

    /**
     * Méthodes de détection d'anomalies
     */
    private detectIntensitySpikes(states: readonly EmotionalState[]): EmotionalAnomaly[] {
        const anomalies: EmotionalAnomaly[] = [];
        const intensities = states.map(s => s.intensity);
        const mean = intensities.reduce((sum, i) => sum + i, 0) / intensities.length;
        const stdDev = Math.sqrt(intensities.reduce((sum, i) => sum + Math.pow(i - mean, 2), 0) / intensities.length);

        states.forEach(state => {
            const z_score = Math.abs(state.intensity - mean) / stdDev;
            if (z_score > 2.5) { // Seuil de 2.5 sigma
                anomalies.push({
                    type: 'intensity_spike',
                    state,
                    anomalyScore: Math.min(z_score / 3, 1),
                    description: `Pic d'intensité inhabituel: ${state.intensity.toFixed(2)} (z-score: ${z_score.toFixed(2)})`,
                    recommendations: [
                        'Vérifier les déclencheurs de cette émotion intense',
                        'Analyser le contexte d\'apprentissage',
                        'Considérer un ajustement du rythme'
                    ]
                });
            }
        });

        return anomalies;
    }

    private detectRapidOscillations(states: readonly EmotionalState[]): EmotionalAnomaly[] {
        const anomalies: EmotionalAnomaly[] = [];
        let oscillationCount = 0;

        for (let i = 1; i < states.length - 1; i++) {
            const prev = states[i - 1];
            const current = states[i];
            const next = states[i + 1];

            // Détecter changement de direction de valence
            if ((current.valence > prev.valence && current.valence > next.valence) ||
                (current.valence < prev.valence && current.valence < next.valence)) {
                oscillationCount++;

                if (oscillationCount >= 3) { // 3 oscillations consécutives
                    anomalies.push({
                        type: 'rapid_oscillation',
                        state: current,
                        anomalyScore: Math.min(oscillationCount / 5, 1),
                        description: `Oscillation rapide d'émotions détectée (${oscillationCount} pics)`,
                        recommendations: [
                            'Réduire la complexité des exercices',
                            'Introduire des pauses plus fréquentes',
                            'Stabiliser l\'environnement d\'apprentissage'
                        ]
                    });
                    oscillationCount = 0; // Reset pour éviter les doublons
                }
            } else {
                oscillationCount = 0;
            }
        }

        return anomalies;
    }

    private detectProlongedNegativeStates(states: readonly EmotionalState[]): EmotionalAnomaly[] {
        const anomalies: EmotionalAnomaly[] = [];
        let negativeStreak = 0;
        let streakStart = 0;

        states.forEach((state, index) => {
            if (state.valence < -0.3) { // Valence négative
                if (negativeStreak === 0) {
                    streakStart = index;
                }
                negativeStreak++;
            } else {
                if (negativeStreak >= 5) { // 5 états négatifs consécutifs
                    const streakState = states[streakStart];
                    anomalies.push({
                        type: 'prolonged_negative',
                        state: streakState,
                        anomalyScore: Math.min(negativeStreak / 10, 1),
                        description: `État émotionnel négatif prolongé (${negativeStreak} états consécutifs)`,
                        recommendations: [
                            'Introduire des éléments motivants',
                            'Revoir la difficulté des exercices',
                            'Proposer des réussites faciles',
                            'Considérer une pause plus longue'
                        ]
                    });
                }
                negativeStreak = 0;
            }
        });

        return anomalies;
    }

    private detectEmotionalFlatlines(states: readonly EmotionalState[]): EmotionalAnomaly[] {
        const anomalies: EmotionalAnomaly[] = [];
        const intensities = states.map(s => s.intensity);
        const variance = this.calculateVariance(intensities);

        if (variance < 0.01 && states.length >= 10) { // Très faible variance
            const avgState = states[Math.floor(states.length / 2)];
            anomalies.push({
                type: 'emotional_flatline',
                state: avgState,
                anomalyScore: 1 - variance * 100, // Plus la variance est faible, plus le score est élevé
                description: `Absence de variation émotionnelle (variance: ${variance.toFixed(4)})`,
                recommendations: [
                    'Introduire de la variété dans les exercices',
                    'Augmenter l\'interactivité',
                    'Vérifier l\'engagement de l\'étudiant',
                    'Proposer des défis adaptatifs'
                ]
            });
        }

        return anomalies;
    }

    /**
     * Méthodes utilitaires
     */
    private calculateLinearTrend(values: readonly number[]): number {
        const n = values.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const meanX = x.reduce((sum, val) => sum + val, 0) / n;
        const meanY = values.reduce((sum, val) => sum + val, 0) / n;

        const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (values[i] - meanY), 0);
        const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0);

        return denominator !== 0 ? numerator / denominator : 0;
    }

    private isVolatile(values: readonly number[]): boolean {
        const variance = this.calculateVariance(values);
        return variance > 0.5; // Seuil arbitraire pour volatilité
    }

    private calculateVariance(values: readonly number[]): number {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }

    private createEmptySearchResult(startTime: number): HistorySearchResult {
        return {
            states: [],
            transitions: [],
            totalCount: 0,
            searchTime: Date.now() - startTime
        };
    }
}