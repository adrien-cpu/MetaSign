/**
 * @file src/ai/services/learning/human/coda/codavirtuel/adapters/ExerciseAdapter.ts
 * @description Adaptateur d'exercices révolutionnaire pour le système CODA v4.0.0
 * 
 * Fonctionnalités révolutionnaires :
 * - 🎯 Adaptation intelligente des exercices aux profils utilisateur
 * - 🔄 Conversion entre formats d'exercices legacy et nouveaux
 * - 📊 Génération de paramètres optimisés selon les besoins
 * - 🌟 Simulation d'erreurs pédagogiques contrôlées
 * - ✨ Compatible exactOptionalPropertyTypes: true
 * - 🔧 Architecture modulaire < 300 lignes
 * 
 * @module adapters
 * @version 4.0.0 - Adaptateur révolutionnaire d'exercices
 * @since 2025
 * @author MetaSign Team - CODA Exercise Adaptation
 * @lastModified 2025-07-19
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';

// Imports des types harmonisés
import type {
    UserReverseProfile,
    ExerciseGenerationParams,
    UserAdaptedExercise,
    CECRLLevel
} from '../types/index';

/**
 * Interface pour les exercices de base
 */
interface BaseExercise {
    readonly id: string;
    readonly type: string;
    readonly level: string;
    readonly difficulty: number;
    readonly content: Record<string, unknown>;
    readonly metadata?: Record<string, unknown>;
}

/**
 * Interface pour les paramètres d'adaptation
 */
interface AdaptationParams {
    readonly personalityAdjustment: number;
    readonly difficultyModifier: number;
    readonly errorSimulationRate: number;
    readonly focusAreasWeight: number;
    readonly culturalAdaptation: boolean;
}

/**
 * Interface pour les résultats d'adaptation
 */
interface AdaptationResult {
    readonly adaptedContent: Record<string, unknown>;
    readonly adjustedDifficulty: number;
    readonly addedErrors: readonly string[];
    readonly adaptationScore: number;
}

/**
 * Adaptateur d'exercices révolutionnaire
 * 
 * @class ExerciseAdapter
 * @description Service d'adaptation intelligent qui transforme les exercices
 * selon les profils utilisateur, simule des erreurs pédagogiques et optimise
 * la difficulté pour un apprentissage optimal.
 * 
 * @example
 * ```typescript
 * const adapter = new ExerciseAdapter();
 * 
 * // Générer paramètres d'exercice adaptés
 * const params = adapter.generateExerciseParams(
 *   userProfile, undefined, true, true
 * );
 * 
 * // Adapter un exercice au profil
 * const adapted = await adapter.adaptExercise(
 *   exercise, userProfile, true, 0.3
 * );
 * ```
 */
export class ExerciseAdapter {
    /**
     * Logger pour l'adaptateur
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('ExerciseAdapter');

    /**
     * Cache des adaptations récentes
     * @private
     */
    private readonly adaptationCache = new Map<string, AdaptationResult>();

    /**
     * Constructeur de l'adaptateur d'exercices
     * 
     * @constructor
     */
    constructor() {
        this.logger.info('🎯 ExerciseAdapter initialisé');
    }

    /**
     * Génère des paramètres d'exercice optimisés pour un profil utilisateur
     * 
     * @method generateExerciseParams
     * @param {UserReverseProfile} userProfile - Profil utilisateur
     * @param {string} [specificType] - Type d'exercice spécifique
     * @param {boolean} [adaptiveDifficulty=true] - Difficulté adaptative
     * @param {boolean} [focusOnWeaknesses=true] - Se concentrer sur les faiblesses
     * @returns {ExerciseGenerationParams} Paramètres générés
     * @public
     */
    public generateExerciseParams(
        userProfile: UserReverseProfile,
        specificType?: string,
        adaptiveDifficulty: boolean = true,
        focusOnWeaknesses: boolean = true
    ): ExerciseGenerationParams {
        try {
            this.logger.info('📊 Génération paramètres exercice', {
                userId: userProfile.userId,
                currentLevel: userProfile.currentLevel,
                specificType,
                adaptiveDifficulty,
                focusOnWeaknesses
            });

            // Déterminer le type d'exercice optimal
            const exerciseType = specificType || this.selectOptimalExerciseType(userProfile);

            // Calculer la difficulté adaptée
            const difficulty = adaptiveDifficulty
                ? this.calculateAdaptiveDifficulty(userProfile)
                : this.getDefaultDifficulty(userProfile.currentLevel);

            // Identifier les zones de focus
            const focusAreas = focusOnWeaknesses && userProfile.weaknesses.length > 0
                ? this.selectFocusAreas(userProfile)
                : this.getDefaultFocusAreas(userProfile.currentLevel);

            const params: ExerciseGenerationParams = {
                type: exerciseType,
                level: userProfile.currentLevel,
                difficulty,
                focusAreas,
                userId: userProfile.userId,
                culturalContext: userProfile.culturalBackground,
                teachingMethod: this.selectTeachingMethod(userProfile)
            };

            this.logger.info('✅ Paramètres générés', {
                userId: userProfile.userId,
                type: params.type,
                level: params.level,
                difficulty: params.difficulty.toFixed(2),
                focusAreasCount: params.focusAreas?.length || 0
            });

            return params;
        } catch (error) {
            this.logger.error('❌ Erreur génération paramètres', {
                userId: userProfile.userId,
                error
            });
            throw error;
        }
    }

    /**
     * Adapte un exercice au profil utilisateur avec simulation d'erreurs optionnelle
     * 
     * @method adaptExercise
     * @async
     * @param {BaseExercise} exercise - Exercice de base
     * @param {UserReverseProfile} userProfile - Profil utilisateur
     * @param {boolean} [simulateErrors=false] - Simuler des erreurs
     * @param {number} [errorRate=0.3] - Taux d'erreur
     * @returns {Promise<UserAdaptedExercise>} Exercice adapté
     * @public
     */
    public async adaptExercise(
        exercise: BaseExercise,
        userProfile: UserReverseProfile,
        simulateErrors: boolean = false,
        errorRate: number = 0.3
    ): Promise<UserAdaptedExercise> {
        try {
            this.logger.info('🔄 Adaptation exercice', {
                exerciseId: exercise.id,
                userId: userProfile.userId,
                simulateErrors,
                errorRate
            });

            // Vérifier le cache d'adaptation
            const cacheKey = this.generateCacheKey(exercise, userProfile, simulateErrors, errorRate);
            const cached = this.adaptationCache.get(cacheKey);

            if (cached) {
                this.logger.debug('📋 Adaptation récupérée du cache', { exerciseId: exercise.id });
                return this.buildUserAdaptedExercise(exercise, userProfile, cached, simulateErrors);
            }

            // Calculer les paramètres d'adaptation
            const adaptationParams = this.calculateAdaptationParams(
                exercise, userProfile, simulateErrors, errorRate
            );

            // Adapter le contenu
            const adaptationResult = await this.performAdaptation(
                exercise, userProfile, adaptationParams
            );

            // Mettre en cache
            this.adaptationCache.set(cacheKey, adaptationResult);

            // Construire l'exercice adapté final
            const adaptedExercise = this.buildUserAdaptedExercise(
                exercise, userProfile, adaptationResult, simulateErrors
            );

            this.logger.info('✅ Exercice adapté', {
                exerciseId: exercise.id,
                userId: userProfile.userId,
                adjustedDifficulty: adaptationResult.adjustedDifficulty.toFixed(2),
                errorsAdded: adaptationResult.addedErrors.length,
                adaptationScore: adaptationResult.adaptationScore.toFixed(2)
            });

            return adaptedExercise;
        } catch (error) {
            this.logger.error('❌ Erreur adaptation exercice', {
                exerciseId: exercise.id,
                userId: userProfile.userId,
                error
            });
            throw error;
        }
    }

    /**
     * Évalue la compatibilité d'un exercice avec un profil utilisateur
     * 
     * @method evaluateCompatibility
     * @param {BaseExercise} exercise - Exercice à évaluer
     * @param {UserReverseProfile} userProfile - Profil utilisateur
     * @returns {number} Score de compatibilité (0-1)
     * @public
     */
    public evaluateCompatibility(
        exercise: BaseExercise,
        userProfile: UserReverseProfile
    ): number {
        try {
            // Compatibilité de niveau
            const levelCompatibility = this.calculateLevelCompatibility(
                exercise.level, userProfile.currentLevel
            );

            // Compatibilité de difficulté
            const difficultyCompatibility = this.calculateDifficultyCompatibility(
                exercise.difficulty, userProfile
            );

            // Compatibilité de type d'exercice
            const typeCompatibility = this.calculateTypeCompatibility(
                exercise.type, userProfile
            );

            // Score global pondéré
            const globalCompatibility = (
                levelCompatibility * 0.4 +
                difficultyCompatibility * 0.35 +
                typeCompatibility * 0.25
            );

            this.logger.debug('🔍 Compatibilité évaluée', {
                exerciseId: exercise.id,
                userId: userProfile.userId,
                levelScore: levelCompatibility.toFixed(2),
                difficultyScore: difficultyCompatibility.toFixed(2),
                typeScore: typeCompatibility.toFixed(2),
                globalScore: globalCompatibility.toFixed(2)
            });

            return globalCompatibility;
        } catch (error) {
            this.logger.error('❌ Erreur évaluation compatibilité', {
                exerciseId: exercise.id,
                userId: userProfile.userId,
                error
            });
            return 0.5; // Score par défaut
        }
    }

    /**
     * Nettoie le cache d'adaptation
     * 
     * @method clearCache
     * @public
     */
    public clearCache(): void {
        this.adaptationCache.clear();
        this.logger.info('🧹 Cache d\'adaptation nettoyé');
    }

    // ==================== MÉTHODES PRIVÉES ====================

    /**
     * Sélectionne le type d'exercice optimal pour un profil
     */
    private selectOptimalExerciseType(userProfile: UserReverseProfile): string {
        // Mapping basé sur le style d'apprentissage
        const typesByLearningStyle: Record<string, readonly string[]> = {
            'visual': ['video_comprehension', 'spatial_placement', 'multiple_choice'],
            'kinesthetic': ['drag_drop', 'sign_production', 'cultural_scenario'],
            'auditory': ['multiple_choice', 'grammar_construction'],
            'mixed': ['multiple_choice', 'drag_drop', 'video_comprehension']
        };

        const availableTypes = typesByLearningStyle[userProfile.learningStyle] ||
            typesByLearningStyle['visual'];

        // Sélectionner selon les faiblesses si possible
        if (userProfile.weaknesses.length > 0) {
            const weakness = userProfile.weaknesses[0];
            if (weakness.includes('grammar')) {
                return 'grammar_construction';
            }
            if (weakness.includes('spatial')) {
                return 'spatial_placement';
            }
            if (weakness.includes('cultural')) {
                return 'cultural_scenario';
            }
        }

        // Sélection par défaut
        return availableTypes[0] || 'multiple_choice';
    }

    /**
     * Calcule la difficulté adaptative
     */
    private calculateAdaptiveDifficulty(userProfile: UserReverseProfile): number {
        // Base sur le niveau CECRL
        const levelDifficulty = this.getDefaultDifficulty(userProfile.currentLevel);

        // Ajustement basé sur l'historique de progression
        const recentHistory = userProfile.progressHistory.slice(-5);
        let performanceAdjustment = 0;

        if (recentHistory.length > 0) {
            const averageScore = recentHistory.reduce((sum, entry) => sum + entry.score, 0) / recentHistory.length;

            // Si performance > 80%, augmenter difficulté
            if (averageScore > 0.8) {
                performanceAdjustment = 0.1;
            }
            // Si performance < 50%, diminuer difficulté
            else if (averageScore < 0.5) {
                performanceAdjustment = -0.15;
            }
        }

        // Ajustement basé sur le nombre de faiblesses
        const weaknessAdjustment = userProfile.weaknesses.length > 3 ? -0.1 : 0;

        return Math.max(0.1, Math.min(1.0, levelDifficulty + performanceAdjustment + weaknessAdjustment));
    }

    /**
     * Obtient la difficulté par défaut selon le niveau
     */
    private getDefaultDifficulty(level: CECRLLevel): number {
        const difficultyByLevel: Record<CECRLLevel, number> = {
            'A1': 0.3,
            'A2': 0.4,
            'B1': 0.5,
            'B2': 0.65,
            'C1': 0.8,
            'C2': 0.9
        };

        return difficultyByLevel[level] || 0.3;
    }

    /**
     * Sélectionne les zones de focus selon les faiblesses
     */
    private selectFocusAreas(userProfile: UserReverseProfile): readonly string[] {
        // Prendre les 2-3 principales faiblesses
        return userProfile.weaknesses.slice(0, 3);
    }

    /**
     * Obtient les zones de focus par défaut selon le niveau
     */
    private getDefaultFocusAreas(level: CECRLLevel): readonly string[] {
        const focusByLevel: Record<CECRLLevel, readonly string[]> = {
            'A1': ['basic_vocabulary', 'simple_grammar', 'greetings'],
            'A2': ['past_tense', 'future_tense', 'daily_activities'],
            'B1': ['complex_sentences', 'opinions', 'storytelling'],
            'B2': ['abstract_concepts', 'argumentation', 'formal_language'],
            'C1': ['nuanced_expressions', 'cultural_references', 'academic_language'],
            'C2': ['literary_language', 'specialized_domains', 'dialectal_variations']
        };

        return focusByLevel[level] || focusByLevel['A1'];
    }

    /**
     * Sélectionne la méthode d'enseignement selon le profil
     */
    private selectTeachingMethod(userProfile: UserReverseProfile): string {
        const methodsByStyle: Record<string, string> = {
            'visual': 'visual_demonstration',
            'kinesthetic': 'hands_on_practice',
            'auditory': 'verbal_explanation',
            'mixed': 'multimodal_approach'
        };

        return methodsByStyle[userProfile.learningStyle] || 'visual_demonstration';
    }

    /**
     * Calcule les paramètres d'adaptation
     */
    private calculateAdaptationParams(
        exercise: BaseExercise,
        userProfile: UserReverseProfile,
        simulateErrors: boolean,
        errorRate: number
    ): AdaptationParams {
        return {
            personalityAdjustment: this.calculatePersonalityAdjustment(userProfile),
            difficultyModifier: this.calculateDifficultyModifier(exercise, userProfile),
            errorSimulationRate: simulateErrors ? errorRate : 0,
            focusAreasWeight: userProfile.weaknesses.length > 0 ? 0.8 : 0.3,
            culturalAdaptation: userProfile.culturalBackground !== 'online_learning'
        };
    }

    /**
     * Effectue l'adaptation de l'exercice
     */
    private async performAdaptation(
        exercise: BaseExercise,
        userProfile: UserReverseProfile,
        params: AdaptationParams
    ): Promise<AdaptationResult> {
        // Adapter le contenu selon les paramètres
        const adaptedContent = this.adaptContent(exercise.content, params);

        // Ajuster la difficulté
        const adjustedDifficulty = Math.max(0.1, Math.min(1.0,
            exercise.difficulty + params.difficultyModifier
        ));

        // Ajouter des erreurs si nécessaire
        const addedErrors = params.errorSimulationRate > 0
            ? this.simulateErrors(exercise, params.errorSimulationRate)
            : [];

        // Calculer le score d'adaptation
        const adaptationScore = this.calculateAdaptationScore(params);

        return {
            adaptedContent,
            adjustedDifficulty,
            addedErrors,
            adaptationScore
        };
    }

    /**
     * Construit l'exercice adapté final
     */
    private buildUserAdaptedExercise(
        exercise: BaseExercise,
        userProfile: UserReverseProfile,
        adaptation: AdaptationResult,
        simulateErrors: boolean
    ): UserAdaptedExercise {
        return {
            id: exercise.id,
            type: exercise.type,
            content: {
                ...adaptation.adaptedContent,
                originalContent: exercise.content,
                adaptationMetadata: {
                    adaptationScore: adaptation.adaptationScore,
                    adjustedDifficulty: adaptation.adjustedDifficulty,
                    addedErrors: adaptation.addedErrors
                }
            },
            generationParams: {
                type: exercise.type,
                level: exercise.level,
                difficulty: adaptation.adjustedDifficulty,
                focusAreas: userProfile.weaknesses.slice(0, 3),
                userId: userProfile.userId
            },
            errorsSimulated: simulateErrors,
            targetedSkills: [...userProfile.weaknesses.slice(0, 2), exercise.type]
        };
    }

    // Méthodes utilitaires simplifiées
    private generateCacheKey(exercise: BaseExercise, profile: UserReverseProfile, simulate: boolean, rate: number): string {
        return `${exercise.id}_${profile.userId}_${simulate}_${rate}`;
    }

    private calculatePersonalityAdjustment(profile: UserReverseProfile): number {
        return profile.learningStyle === 'visual' ? 0.1 : 0;
    }

    private calculateDifficultyModifier(exercise: BaseExercise, profile: UserReverseProfile): number {
        const profileDifficulty = this.getDefaultDifficulty(profile.currentLevel);
        return (profileDifficulty - exercise.difficulty) * 0.3;
    }

    private adaptContent(content: Record<string, unknown>, params: AdaptationParams): Record<string, unknown> {
        return {
            ...content,
            adapted: true,
            adaptationParams: params
        };
    }

    private simulateErrors(exercise: BaseExercise, rate: number): readonly string[] {
        const possibleErrors = ['spelling_error', 'grammar_error', 'context_error'];
        const errorCount = Math.floor(possibleErrors.length * rate);
        return possibleErrors.slice(0, errorCount);
    }

    private calculateAdaptationScore(params: AdaptationParams): number {
        return (params.personalityAdjustment + params.focusAreasWeight) / 2;
    }

    private calculateLevelCompatibility(exerciseLevel: string, userLevel: CECRLLevel): number {
        const levelMap: Record<string, number> = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
        const exerciseLevelNum = levelMap[exerciseLevel] || 1;
        const userLevelNum = levelMap[userLevel] || 1;
        const difference = Math.abs(exerciseLevelNum - userLevelNum);
        return Math.max(0, 1 - (difference * 0.3));
    }

    private calculateDifficultyCompatibility(exerciseDifficulty: number, profile: UserReverseProfile): number {
        const idealDifficulty = this.calculateAdaptiveDifficulty(profile);
        const difference = Math.abs(exerciseDifficulty - idealDifficulty);
        return Math.max(0, 1 - (difference * 2));
    }

    private calculateTypeCompatibility(exerciseType: string, profile: UserReverseProfile): number {
        const preferredTypes = this.selectOptimalExerciseType(profile);
        return exerciseType === preferredTypes ? 1 : 0.7;
    }
}