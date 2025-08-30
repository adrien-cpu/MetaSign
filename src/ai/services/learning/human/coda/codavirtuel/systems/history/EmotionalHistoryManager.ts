/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/history/EmotionalHistoryManager.ts
 * @description Gestionnaire d'historique émotionnel pour IA-élèves
 * 
 * Module refactorisé selon le Guide de refactorisation MetaSign.
 * Responsabilité unique: gestion de l'historique émotionnel avec stockage optimisé.
 * 
 * @module EmotionalHistoryManager
 * @version 3.1.0 - Refactorisation conforme au guide MetaSign
 * @since 2025
 * @author MetaSign Team - Emotional AI Division
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type {
    EmotionalState,
    EmotionalTransition,
    EmotionalHistory,
    PrimaryEmotion
} from '../types/EmotionalTypes';

// ================== INTERFACES ET TYPES ==================

/**
 * Configuration du gestionnaire d'historique
 */
export interface HistoryManagerConfig {
    readonly maxHistoryDepth: number;
    readonly entryTTL: number;
    readonly cleanupInterval: number;
    readonly enableCompression: boolean;
}

/**
 * Critères de recherche simplifiés
 */
export interface HistorySearchCriteria {
    readonly emotions?: readonly PrimaryEmotion[];
    readonly minIntensity?: number;
    readonly maxIntensity?: number;
    readonly limit?: number;
}

/**
 * Résultat de recherche
 */
export interface HistorySearchResult {
    readonly states: readonly EmotionalState[];
    readonly transitions: readonly EmotionalTransition[];
    readonly totalCount: number;
    readonly searchTime: number;
}

/**
 * Analyse de tendances émotionnelles
 */
export interface EmotionalTrendAnalysis {
    readonly valenceTrend: TrendDirection;
    readonly dominantEmotion: PrimaryEmotion;
    readonly emotionFrequency: ReadonlyMap<PrimaryEmotion, number>;
    readonly averageStateDuration: number;
    readonly emotionalStability: number;
}

/**
 * Direction de tendance
 */
export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'volatile';

/**
 * Statistiques d'historique
 */
export interface HistoryStatistics {
    readonly totalStates: number;
    readonly totalTransitions: number;
    readonly totalDuration: number;
    readonly uniqueEmotions: readonly PrimaryEmotion[];
    readonly memoryUsage: number;
    readonly lastAnalysis: Date;
}

/**
 * Configuration par défaut
 */
const DEFAULT_CONFIG: HistoryManagerConfig = {
    maxHistoryDepth: 1000,
    entryTTL: 7 * 24 * 60 * 60 * 1000, // 7 jours
    cleanupInterval: 60 * 60 * 1000, // 1 heure
    enableCompression: true
} as const;

// ================== CLASSE PRINCIPALE ==================

/**
 * Gestionnaire d'historique émotionnel
 * 
 * Responsabilité unique: Gestion de l'historique avec stockage optimisé
 * Respecte les seuils: < 300 lignes, < 20 méthodes
 * 
 * @class EmotionalHistoryManager
 */
export class EmotionalHistoryManager {
    private readonly logger = LoggerFactory.getLogger('EmotionalHistoryManager');
    private readonly config: HistoryManagerConfig;
    private readonly histories = new Map<string, EmotionalHistory>();
    private readonly lastActivity = new Map<string, Date>();
    private cleanupTimer?: NodeJS.Timeout;

    constructor(config?: Partial<HistoryManagerConfig>) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.startCleanupProcess();

        this.logger.info('Gestionnaire d\'historique émotionnel initialisé', {
            config: this.config
        });
    }

    /**
     * Ajoute un état émotionnel à l'historique
     */
    public async addState(studentId: string, state: EmotionalState): Promise<void> {
        try {
            this.logger.debug('Ajout état à l\'historique', {
                studentId,
                emotion: state.primaryEmotion,
                intensity: state.intensity.toFixed(2)
            });

            const history = this.getOrCreateHistory(studentId);
            const newStateHistory = [...history.stateHistory, state];
            const trimmedStateHistory = newStateHistory.slice(-this.config.maxHistoryDepth);

            const updatedHistory: EmotionalHistory = {
                ...history,
                stateHistory: trimmedStateHistory,
                lastAnalysis: new Date()
            };

            this.histories.set(studentId, updatedHistory);
            this.updateActivity(studentId);

            if (this.shouldCompress(trimmedStateHistory.length)) {
                await this.compressHistory(studentId);
            }

            this.logger.debug('État ajouté à l\'historique', {
                studentId,
                totalStates: trimmedStateHistory.length
            });
        } catch (error) {
            this.logger.error('Erreur ajout état historique', { studentId, error });
            throw error;
        }
    }

    /**
     * Ajoute une transition émotionnelle
     */
    public async addTransition(studentId: string, transition: EmotionalTransition): Promise<void> {
        try {
            const history = this.getOrCreateHistory(studentId);
            const currentTransitions = history.transitionHistory ? [...history.transitionHistory] : [];
            const newTransitionHistory = [...currentTransitions, transition];
            const trimmedHistory = newTransitionHistory.slice(-this.config.maxHistoryDepth);

            const updatedHistory: EmotionalHistory = {
                ...history,
                transitionHistory: trimmedHistory,
                lastAnalysis: new Date()
            };

            this.histories.set(studentId, updatedHistory);
            this.updateActivity(studentId);

            this.logger.debug('Transition ajoutée', {
                studentId,
                totalTransitions: trimmedHistory.length
            });
        } catch (error) {
            this.logger.error('Erreur ajout transition', { studentId, error });
            throw error;
        }
    }

    /**
     * Recherche dans l'historique
     */
    public async searchHistory(
        studentId: string,
        criteria: HistorySearchCriteria
    ): Promise<HistorySearchResult> {
        const startTime = Date.now();

        try {
            const history = this.histories.get(studentId);
            if (!history) {
                return this.createEmptyResult(startTime);
            }

            const filteredStates = this.filterStates(history.stateHistory, criteria);
            const filteredTransitions = history.transitionHistory || [];

            const searchTime = Date.now() - startTime;

            return {
                states: filteredStates,
                transitions: filteredTransitions,
                totalCount: filteredStates.length + filteredTransitions.length,
                searchTime
            };
        } catch (error) {
            this.logger.error('Erreur recherche historique', { studentId, error });
            throw error;
        }
    }

    /**
     * Analyse les tendances émotionnelles
     */
    public async analyzeTrends(studentId: string): Promise<EmotionalTrendAnalysis> {
        try {
            const history = this.histories.get(studentId);
            if (!history || history.stateHistory.length < 5) {
                throw new Error('Historique insuffisant pour analyse');
            }

            const recentStates = history.stateHistory.slice(-50);

            return {
                valenceTrend: this.calculateValenceTrend(recentStates),
                dominantEmotion: this.calculateDominantEmotion(recentStates),
                emotionFrequency: this.calculateEmotionFrequency(recentStates),
                averageStateDuration: this.calculateAverageStateDuration(recentStates),
                emotionalStability: this.calculateEmotionalStability(recentStates)
            };
        } catch (error) {
            this.logger.error('Erreur analyse tendances', { studentId, error });
            throw error;
        }
    }

    /**
     * Obtient les statistiques d'historique
     */
    public getHistoryStatistics(studentId: string): HistoryStatistics | undefined {
        const history = this.histories.get(studentId);
        if (!history) return undefined;

        const uniqueEmotions = Array.from(
            new Set(history.stateHistory.map(s => s.primaryEmotion))
        );

        const totalDuration = this.calculateTotalDuration(history.stateHistory);
        const memoryUsage = this.estimateMemoryUsage(history);

        return {
            totalStates: history.stateHistory.length,
            totalTransitions: history.transitionHistory?.length || 0,
            totalDuration,
            uniqueEmotions,
            memoryUsage,
            lastAnalysis: history.lastAnalysis
        };
    }

    /**
     * Nettoie les ressources
     */
    public cleanup(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = undefined;
        }

        this.histories.clear();
        this.lastActivity.clear();

        this.logger.info('Gestionnaire d\'historique nettoyé');
    }

    // ================== MÉTHODES PRIVÉES ==================

    private getOrCreateHistory(studentId: string): EmotionalHistory {
        let history = this.histories.get(studentId);
        if (!history) {
            history = {
                stateHistory: [],
                transitionHistory: [],
                detectedPatterns: [],
                lastAnalysis: new Date()
            };
            this.histories.set(studentId, history);
        }
        return history;
    }

    private updateActivity(studentId: string): void {
        this.lastActivity.set(studentId, new Date());
    }

    private shouldCompress(historyLength: number): boolean {
        return this.config.enableCompression && historyLength >= 500;
    }

    private async compressHistory(studentId: string): Promise<void> {
        const history = this.histories.get(studentId);
        if (!history) return;

        const half = Math.floor(history.stateHistory.length / 2);
        const firstHalf = history.stateHistory
            .slice(0, half)
            .filter((_, index) => index % 2 === 0);
        const secondHalf = history.stateHistory.slice(half);

        const compressedHistory: EmotionalHistory = {
            ...history,
            stateHistory: [...firstHalf, ...secondHalf]
        };

        this.histories.set(studentId, compressedHistory);
        this.logger.debug('Historique compressé', { studentId });
    }

    private startCleanupProcess(): void {
        this.cleanupTimer = setInterval(() => {
            this.performCleanup();
        }, this.config.cleanupInterval);
    }

    private performCleanup(): void {
        const now = Date.now();
        const cutoffTime = now - this.config.entryTTL;

        this.lastActivity.forEach((lastTime, studentId) => {
            if (lastTime.getTime() < cutoffTime) {
                this.histories.delete(studentId);
                this.lastActivity.delete(studentId);
                this.logger.debug('Historique nettoyé (TTL)', { studentId });
            }
        });
    }

    private filterStates(
        states: readonly EmotionalState[],
        criteria: HistorySearchCriteria
    ): readonly EmotionalState[] {
        let filtered = states;

        if (criteria.emotions && criteria.emotions.length > 0) {
            filtered = filtered.filter(state =>
                criteria.emotions!.includes(state.primaryEmotion)
            );
        }

        if (criteria.minIntensity !== undefined) {
            filtered = filtered.filter(state =>
                state.intensity >= criteria.minIntensity!
            );
        }

        if (criteria.maxIntensity !== undefined) {
            filtered = filtered.filter(state =>
                state.intensity <= criteria.maxIntensity!
            );
        }

        if (criteria.limit && criteria.limit > 0) {
            filtered = filtered.slice(-criteria.limit);
        }

        return filtered;
    }

    private createEmptyResult(startTime: number): HistorySearchResult {
        return {
            states: [],
            transitions: [],
            totalCount: 0,
            searchTime: Date.now() - startTime
        };
    }

    // ================== MÉTHODES D'ANALYSE ==================

    private calculateValenceTrend(states: readonly EmotionalState[]): TrendDirection {
        if (states.length < 3) return 'stable';

        const valences = states.map(s => s.valence);
        const trend = this.calculateLinearTrend(valences);

        if (Math.abs(trend) < 0.01) return 'stable';
        if (this.isVolatile(valences)) return 'volatile';
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

        return mean > 0 ? 1 - (stdDev / mean) : 1;
    }

    private calculateTotalDuration(states: readonly EmotionalState[]): number {
        if (states.length < 2) return 0;

        const first = states[0].timestamp.getTime();
        const last = states[states.length - 1].timestamp.getTime();
        return last - first;
    }

    private estimateMemoryUsage(history: EmotionalHistory): number {
        return JSON.stringify(history).length * 2;
    }

    // ================== MÉTHODES UTILITAIRES ==================

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
        return variance > 0.5;
    }

    private calculateVariance(values: readonly number[]): number {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }
}