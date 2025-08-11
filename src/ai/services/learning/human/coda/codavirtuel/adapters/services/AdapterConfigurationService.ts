/**
 * Service de configuration pour l'adaptateur d'exercices
 * @file src/ai/services/learning/human/coda/codavirtuel/adapters/services/AdapterConfigurationService.ts
 * @module ai/services/learning/codavirtuel/adapters/services
 * @description Service spécialisé dans la génération des paramètres d'exercices
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @version 3.0.0
 * @author MetaSign Learning Team
 * @since 2024
 * @lastModified 2025-01-15
 */

import {
    ExerciseGenerationParams,
    SupportedExerciseType,
    CECRLLevel
} from '../../exercises/types/ExerciseGeneratorTypes';
import { UserReverseProfile } from '../../types';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { AdapterAnalysisService } from './AdapterAnalysisService';

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
 * Service de configuration pour l'adaptateur d'exercices
 * Responsable de la génération des paramètres d'exercices personnalisés
 * @class AdapterConfigurationService
 */
export class AdapterConfigurationService {
    private readonly logger = LoggerFactory.getLogger('AdapterConfigurationService');

    constructor(private readonly config: AdapterConfig) {
        this.logger.debug('AdapterConfigurationService initialized');
    }

    /**
     * Génère les paramètres complets d'un exercice
     * @param profile Profil utilisateur
     * @param type Type d'exercice validé
     * @param adaptiveDifficulty Mode adaptatif activé
     * @param focusOnWeaknesses Focus sur les faiblesses
     * @param analysisService Service d'analyse pour délégation
     * @returns Paramètres de génération d'exercice
     */
    public generateExerciseParameters(
        profile: UserReverseProfile,
        type: SupportedExerciseType,
        adaptiveDifficulty: boolean,
        focusOnWeaknesses: boolean,
        analysisService: AdapterAnalysisService
    ): ExerciseGenerationParams {
        // Calculer les paramètres via le service d'analyse
        const difficulty = analysisService.calculateAdaptiveDifficulty(profile, adaptiveDifficulty);
        const focusAreas = analysisService.selectIntelligentFocusAreas(profile, focusOnWeaknesses);

        // Générer les paramètres spécifiques au type
        const typeSpecificParams = this.generateTypeSpecificParams(profile, type);

        const params: ExerciseGenerationParams = {
            type,
            level: profile.currentLevel as CECRLLevel,
            difficulty,
            focusAreas,
            userId: profile.userId,
            typeSpecificParams
        };

        this.logger.debug('Exercise parameters configured', {
            userId: profile.userId,
            type,
            difficulty,
            focusAreasCount: focusAreas.length
        });

        return params;
    }

    /**
     * Génère des paramètres spécifiques au type d'exercice
     * @param profile Profil utilisateur
     * @param type Type d'exercice
     * @returns Paramètres spécifiques
     */
    public generateTypeSpecificParams(
        profile: UserReverseProfile,
        type: SupportedExerciseType
    ): Readonly<Record<string, unknown>> | undefined {
        const baseParams = {
            userId: profile.userId,
            userLevel: profile.currentLevel,
            adaptToWeaknesses: profile.weaknessAreas.length > 0
        };

        switch (type) {
            case 'MultipleChoice':
                return this.configureMultipleChoiceParams(profile, baseParams);
            case 'VideoResponse':
                return this.configureVideoResponseParams(profile, baseParams);
            case 'DragDrop':
                return this.configureDragDropParams(profile, baseParams);
            case 'FillBlank':
                return this.configureFillBlankParams(profile, baseParams);
            case 'TextEntry':
                return this.configureTextEntryParams(profile, baseParams);
            case 'SigningPractice':
                return this.configureSigningPracticeParams(profile, baseParams);
            default:
                return baseParams;
        }
    }

    /**
     * Configure les paramètres pour les exercices QCM
     * @param profile Profil utilisateur
     * @param baseParams Paramètres de base
     * @returns Paramètres configurés
     * @private
     */
    private configureMultipleChoiceParams(
        profile: UserReverseProfile,
        baseParams: Record<string, unknown>
    ): Readonly<Record<string, unknown>> {
        return {
            ...baseParams,
            numberOfChoices: this.calculateChoicesCount(profile),
            includeVisualHints: this.shouldIncludeVisualHints(profile),
            randomizeChoices: true,
            showProgressIndicator: true
        };
    }

    /**
     * Configure les paramètres pour les exercices vidéo
     * @param profile Profil utilisateur
     * @param baseParams Paramètres de base
     * @returns Paramètres configurés
     * @private
     */
    private configureVideoResponseParams(
        profile: UserReverseProfile,
        baseParams: Record<string, unknown>
    ): Readonly<Record<string, unknown>> {
        return {
            ...baseParams,
            maxRecordingTime: this.calculateMaxRecordingTime(profile),
            requireLSFOnly: true,
            allowRetakes: this.shouldAllowRetakes(profile),
            qualityThreshold: this.getVideoQualityThreshold(profile)
        };
    }

    /**
     * Configure les paramètres pour les exercices glisser-déposer
     * @param profile Profil utilisateur
     * @param baseParams Paramètres de base
     * @returns Paramètres configurés
     * @private
     */
    private configureDragDropParams(
        profile: UserReverseProfile,
        baseParams: Record<string, unknown>
    ): Readonly<Record<string, unknown>> {
        return {
            ...baseParams,
            numberOfElements: this.calculateDragDropElementsCount(profile),
            enableSnapToGrid: true,
            showDropZoneHighlight: this.shouldShowDropZoneHighlight(profile),
            allowPartialMatching: this.shouldAllowPartialMatching(profile)
        };
    }

    /**
     * Configure les paramètres pour les exercices à trous
     * @param profile Profil utilisateur
     * @param baseParams Paramètres de base
     * @returns Paramètres configurés
     * @private
     */
    private configureFillBlankParams(
        profile: UserReverseProfile,
        baseParams: Record<string, unknown>
    ): Readonly<Record<string, unknown>> {
        return {
            ...baseParams,
            numberOfBlanks: this.calculateBlanksCount(profile),
            provideWordBank: this.shouldProvideWordBank(profile),
            caseSensitive: false,
            acceptAlternativeAnswers: true
        };
    }

    /**
     * Configure les paramètres pour les exercices de saisie de texte
     * @param profile Profil utilisateur
     * @param baseParams Paramètres de base
     * @returns Paramètres configurés
     * @private
     */
    private configureTextEntryParams(
        profile: UserReverseProfile,
        baseParams: Record<string, unknown>
    ): Readonly<Record<string, unknown>> {
        return {
            ...baseParams,
            maxCharacters: this.calculateMaxCharacters(profile),
            enableSpellCheck: true,
            provideHints: this.shouldProvideTextHints(profile),
            allowDrafts: true
        };
    }

    /**
     * Configure les paramètres pour les exercices de pratique de signes
     * @param profile Profil utilisateur
     * @param baseParams Paramètres de base
     * @returns Paramètres configurés
     * @private
     */
    private configureSigningPracticeParams(
        profile: UserReverseProfile,
        baseParams: Record<string, unknown>
    ): Readonly<Record<string, unknown>> {
        return {
            ...baseParams,
            practiceMode: this.getPracticeMode(profile),
            enableSlowMotion: this.shouldEnableSlowMotion(profile),
            repetitionsAllowed: this.getRepetitionsAllowed(profile),
            provideFeedback: true
        };
    }

    /**
     * Calcule le nombre de choix pour les QCM selon le niveau
     * @param profile Profil utilisateur
     * @returns Nombre de choix
     * @private
     */
    private calculateChoicesCount(profile: UserReverseProfile): number {
        const level = profile.currentLevel;
        const baseChoices = level <= 'A2' ? 3 : level <= 'B2' ? 4 : 5;
        const difficultyBonus = Math.floor(profile.exercisePreferences.difficultyPreference * 2);
        return Math.min(6, Math.max(2, baseChoices + difficultyBonus));
    }

    /**
     * Calcule le temps d'enregistrement maximum pour les exercices vidéo
     * @param profile Profil utilisateur
     * @returns Temps en secondes
     * @private
     */
    private calculateMaxRecordingTime(profile: UserReverseProfile): number {
        const level = profile.currentLevel;
        const baseTime = level <= 'A2' ? 30 : level <= 'B2' ? 60 : 90;
        const experienceBonus = profile.progressHistory.length > 10 ? 30 : 0;
        return baseTime + experienceBonus;
    }

    /**
     * Calcule le nombre d'éléments pour les exercices glisser-déposer
     * @param profile Profil utilisateur
     * @returns Nombre d'éléments
     * @private
     */
    private calculateDragDropElementsCount(profile: UserReverseProfile): number {
        const level = profile.currentLevel;
        return level <= 'A2' ? 4 : level <= 'B2' ? 6 : 8;
    }

    /**
     * Calcule le nombre de trous pour les exercices à trous
     * @param profile Profil utilisateur
     * @returns Nombre de trous
     * @private
     */
    private calculateBlanksCount(profile: UserReverseProfile): number {
        const level = profile.currentLevel;
        return level <= 'A2' ? 3 : level <= 'B2' ? 5 : 7;
    }

    /**
     * Calcule le nombre maximum de caractères pour la saisie de texte
     * @param profile Profil utilisateur
     * @returns Nombre maximum de caractères
     * @private
     */
    private calculateMaxCharacters(profile: UserReverseProfile): number {
        const level = profile.currentLevel;
        return level <= 'A2' ? 100 : level <= 'B2' ? 200 : 300;
    }

    // Méthodes utilitaires pour les options booléennes
    private shouldIncludeVisualHints(profile: UserReverseProfile): boolean {
        return profile.currentLevel <= 'B1';
    }

    private shouldAllowRetakes(profile: UserReverseProfile): boolean {
        return profile.currentLevel <= 'B2';
    }

    private getVideoQualityThreshold(profile: UserReverseProfile): number {
        return profile.currentLevel <= 'A2' ? 0.6 : 0.8;
    }

    private shouldShowDropZoneHighlight(profile: UserReverseProfile): boolean {
        return profile.currentLevel <= 'A2';
    }

    private shouldAllowPartialMatching(profile: UserReverseProfile): boolean {
        return profile.currentLevel <= 'B1';
    }

    private shouldProvideWordBank(profile: UserReverseProfile): boolean {
        return profile.currentLevel <= 'A2';
    }

    private shouldProvideTextHints(profile: UserReverseProfile): boolean {
        return profile.currentLevel <= 'B1';
    }

    private getPracticeMode(profile: UserReverseProfile): string {
        return profile.currentLevel <= 'A2' ? 'guided' : 'free';
    }

    private shouldEnableSlowMotion(profile: UserReverseProfile): boolean {
        return profile.currentLevel <= 'B1';
    }

    private getRepetitionsAllowed(profile: UserReverseProfile): number {
        return profile.currentLevel <= 'A2' ? 5 : profile.currentLevel <= 'B2' ? 3 : 1;
    }
}