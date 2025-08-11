/**
 * Service d'analyse pour l'adaptateur d'exercices
 * @file src/ai/services/learning/human/coda/codavirtuel/adapters/services/AdapterAnalysisService.ts
 * @module ai/services/learning/codavirtuel/adapters/services
 * @description Service spécialisé dans l'analyse des profils utilisateurs et la recommandation d'exercices
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @version 3.0.0
 * @author MetaSign Learning Team
 * @since 2024
 * @lastModified 2025-01-15
 */

import {
    Exercise,
    SupportedExerciseType,
    CECRLLevel,
    ExerciseTypeUtils
} from '../../exercises/types/ExerciseGeneratorTypes';
import { UserReverseProfile } from '../../types';
import { ErrorSimulator } from '../../simulation/ErrorSimulator';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Configuration pour l'adaptateur
 */
interface AdapterConfig {
    readonly enableErrorSimulation: boolean;
    readonly defaultErrorRate: number;
    readonly maxDifficultyBoost: number;
    readonly focusOnWeaknessesWeight: number;
}

/**
 * Type pour le contenu d'exercice en LSF
 */
interface LSFExerciseContent {
    readonly id: string;
    readonly type: string;
    readonly exerciseParams: Readonly<Record<string, unknown>>;
    readonly [key: string]: unknown;
}

/**
 * Interface étendue pour l'ErrorSimulator
 */
interface ExtendedErrorSimulator extends ErrorSimulator {
    processError(content: LSFExerciseContent, errorRate: number): LSFExerciseContent;
}

/**
 * Type pour l'historique de progression
 */
interface ProgressHistoryEntry {
    readonly date: Date;
    readonly level: string;
    readonly scores: Readonly<Record<string, number>>;
}

/**
 * Service d'analyse pour l'adaptateur d'exercices
 * Responsable de l'analyse des profils et des algorithmes de recommandation
 * @class AdapterAnalysisService
 */
export class AdapterAnalysisService {
    private readonly logger = LoggerFactory.getLogger('AdapterAnalysisService');

    constructor(
        private readonly levelTypesMap: Readonly<Record<CECRLLevel, readonly SupportedExerciseType[]>>,
        private readonly config: AdapterConfig
    ) {
        this.logger.debug('AdapterAnalysisService initialized');
    }

    /**
     * Adapte le contenu d'un exercice avec simulation d'erreurs
     * @param exercise Exercice à adapter
     * @param profile Profil utilisateur
     * @param simulateErrors Active la simulation d'erreurs
     * @param errorRate Taux d'erreur
     * @param errorSimulator Simulateur d'erreurs
     * @returns Exercice adapté
     */
    public async adaptExerciseContent(
        exercise: Exercise,
        profile: UserReverseProfile,
        simulateErrors: boolean,
        errorRate: number,
        errorSimulator: ErrorSimulator
    ): Promise<Exercise> {
        if (!simulateErrors || exercise.content === undefined) {
            return { ...exercise };
        }

        if (this.isLSFExerciseContent(exercise.content)) {
            try {
                const adjustedErrorRate = this.calculateAdjustedErrorRate(errorRate, profile);
                const adaptedContent = (errorSimulator as ExtendedErrorSimulator).processError(
                    exercise.content,
                    adjustedErrorRate
                );

                return {
                    ...exercise,
                    content: adaptedContent
                };
            } catch (error) {
                this.logger.error('Error during exercise content adaptation', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    exerciseId: exercise.id
                });
                return { ...exercise };
            }
        }

        return { ...exercise };
    }

    /**
     * Détermine le type d'exercice optimal pour un utilisateur
     * @param profile Profil utilisateur
     * @param level Niveau CECRL validé
     * @returns Type d'exercice recommandé
     */
    public determineOptimalExerciseType(profile: UserReverseProfile, level: CECRLLevel): string {
        const availableTypes = this.levelTypesMap[level];

        // Analyser les préférences utilisateur
        if (profile.exercisePreferences.preferredTypes.length > 0) {
            const validPreferences = profile.exercisePreferences.preferredTypes.filter(
                (type): type is SupportedExerciseType =>
                    ExerciseTypeUtils.isSupportedExerciseType(type) &&
                    availableTypes.includes(type as SupportedExerciseType)
            );

            if (validPreferences.length > 0) {
                const readonlyValidPreferences = validPreferences as readonly SupportedExerciseType[];
                return this.selectWeightedType(readonlyValidPreferences, profile);
            }
        }

        // Fallback: type par défaut pour le niveau
        return this.getDefaultExerciseTypeForLevel(level);
    }

    /**
     * Calcule la difficulté adaptative selon les performances
     * @param profile Profil utilisateur
     * @param adaptiveDifficulty Active le mode adaptatif
     * @returns Niveau de difficulté (0-1)
     */
    public calculateAdaptiveDifficulty(profile: UserReverseProfile, adaptiveDifficulty: boolean): number {
        if (!adaptiveDifficulty) {
            return Math.max(0, Math.min(1, profile.exercisePreferences.difficultyPreference));
        }

        const baseDifficulty = profile.exercisePreferences.difficultyPreference;
        const performanceAdjustment = this.calculatePerformanceAdjustment(profile);

        return Math.min(1, Math.max(0.1, baseDifficulty + performanceAdjustment));
    }

    /**
     * Sélectionne intelligemment les domaines de focus
     * @param profile Profil utilisateur
     * @param focusOnWeaknesses Prioriser les faiblesses
     * @returns Domaines de focus sélectionnés
     */
    public selectIntelligentFocusAreas(profile: UserReverseProfile, focusOnWeaknesses: boolean): string[] {
        if (!focusOnWeaknesses || profile.weaknessAreas.length === 0) {
            return [...profile.exercisePreferences.focusAreas];
        }

        const focusAreas: string[] = [];

        // Ajouter les faiblesses prioritaires
        const prioritizedWeaknesses = profile.weaknessAreas
            .slice(0, Math.ceil(profile.weaknessAreas.length * this.config.focusOnWeaknessesWeight));
        focusAreas.push(...prioritizedWeaknesses);

        // Ajouter occasionnellement des domaines de force
        if (profile.strengthAreas.length > 0 && Math.random() > 0.6) {
            const randomStrengthIndex = Math.floor(Math.random() * profile.strengthAreas.length);
            const strengthArea = profile.strengthAreas[randomStrengthIndex];
            if (strengthArea !== undefined) {
                focusAreas.push(strengthArea);
            }
        }

        return focusAreas;
    }

    /**
     * Sélectionne un type d'exercice de manière pondérée
     * @param types Types disponibles
     * @param profile Profil utilisateur
     * @returns Type sélectionné
     * @private
     */
    private selectWeightedType(types: readonly SupportedExerciseType[], profile: UserReverseProfile): string {
        const recentPerformance = this.calculateRecentPerformance(profile);

        // Logique de sélection intelligente
        if (recentPerformance > 0.8 && types.includes('VideoResponse')) {
            return 'VideoResponse';
        }

        if (recentPerformance < 0.6 && types.includes('MultipleChoice')) {
            return 'MultipleChoice';
        }

        // Sélection aléatoire pour performances moyennes
        const index = Math.floor(Math.random() * types.length);
        const selectedType = types[index];
        return selectedType ?? types[0]!;
    }

    /**
     * Calcule l'ajustement de performance pour la difficulté
     * @param profile Profil utilisateur
     * @returns Ajustement (-0.3 à +0.3)
     * @private
     */
    private calculatePerformanceAdjustment(profile: UserReverseProfile): number {
        const recentHistory = profile.progressHistory.slice(-5);

        if (recentHistory.length === 0) {
            return 0;
        }

        const averageScore = this.calculateAverageScoreFromHistory(recentHistory);

        if (averageScore > 0.8) {
            return Math.min(this.config.maxDifficultyBoost, (averageScore - 0.8) * 1.5);
        } else if (averageScore < 0.6) {
            return Math.max(-this.config.maxDifficultyBoost, (averageScore - 0.6) * 1.5);
        }

        return 0;
    }

    /**
     * Calcule le taux d'erreur ajusté selon les performances
     * @param baseRate Taux de base
     * @param profile Profil utilisateur
     * @returns Taux ajusté
     * @private
     */
    private calculateAdjustedErrorRate(baseRate: number, profile: UserReverseProfile): number {
        const recentPerformance = this.calculateRecentPerformance(profile);
        const adjustment = recentPerformance > 0.8 ? -0.05 : recentPerformance < 0.6 ? 0.05 : 0;

        return Math.max(0, Math.min(1, baseRate + adjustment));
    }

    /**
     * Calcule la performance récente
     * @param profile Profil utilisateur
     * @returns Score de performance (0-1)
     * @private
     */
    private calculateRecentPerformance(profile: UserReverseProfile): number {
        const recentHistory = profile.progressHistory.slice(-3);
        return this.calculateAverageScoreFromHistory(recentHistory);
    }

    /**
     * Calcule le score moyen à partir de l'historique
     * @param history Historique des performances
     * @returns Score moyen (0-1)
     * @private
     */
    private calculateAverageScoreFromHistory(history: readonly ProgressHistoryEntry[]): number {
        let totalScore = 0;
        let totalEntries = 0;

        for (const entry of history) {
            for (const score of Object.values(entry.scores)) {
                totalScore += score;
                totalEntries++;
            }
        }

        return totalEntries > 0 ? totalScore / totalEntries : 0.5;
    }

    /**
     * Obtient le type d'exercice par défaut pour un niveau
     * @param level Niveau CECRL
     * @returns Type d'exercice par défaut
     * @private
     */
    private getDefaultExerciseTypeForLevel(level: CECRLLevel): string {
        const types = this.levelTypesMap[level];
        if (!types || types.length === 0) {
            throw new Error(`No exercise types defined for level: ${level}`);
        }

        const index = Math.floor(Math.random() * types.length);
        const selectedType = types[index];

        if (selectedType === undefined) {
            throw new Error(`Failed to select exercise type for level: ${level}`);
        }

        return selectedType;
    }

    /**
     * Vérifie si le contenu est compatible avec la simulation d'erreurs LSF
     * @param content Contenu à vérifier
     * @returns True si compatible
     * @private
     */
    private isLSFExerciseContent(content: unknown): content is LSFExerciseContent {
        if (!content || typeof content !== 'object') {
            return false;
        }

        const candidateContent = content as Record<string, unknown>;

        return (
            'id' in candidateContent &&
            'type' in candidateContent &&
            'exerciseParams' in candidateContent &&
            typeof candidateContent.id === 'string' &&
            typeof candidateContent.type === 'string' &&
            typeof candidateContent.exerciseParams === 'object'
        );
    }
}