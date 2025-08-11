/**
 * @file src/ai/services/learning/human/coda/codavirtuel/services/legacy/LegacyTypeConverter.ts
 * @description Convertisseur spécialisé pour les types legacy
 * 
 * Fonctionnalités :
 * - 🔄 Conversion complète des types legacy vers nouveaux formats
 * - 📊 Migration de données legacy en lot
 * - 🎯 Validation et mapping sécurisés des types
 * - ✨ Compatible exactOptionalPropertyTypes: true
 * - 🔧 Module < 300 lignes
 * 
 * @module legacy
 * @version 1.0.0 - Convertisseur de types refactorisé
 * @since 2025
 * @author MetaSign Team - CODA Legacy Type Conversion
 * @lastModified 2025-08-03
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';

// Imports des types harmonisés
import type {
    UserReverseProfile,
    ExerciseGenerationParams,
    EvaluationResult,
    CECRLLevel,
    CulturalEnvironment
} from '../../types/index';

/**
 * Interface pour les profils utilisateur legacy
 */
interface LegacyUserProfile {
    readonly userId: string;
    readonly currentLevel: string;
    readonly strengths: readonly string[];
    readonly weaknesses: readonly string[];
    readonly preferences: readonly string[];
    readonly sessionCount: number;
    readonly lastActivity: Date;
    readonly culturalBackground?: string;
    readonly motivationLevel?: number;
}

/**
 * Interface pour les exercices legacy
 */
interface LegacyExercise {
    readonly id: string;
    readonly type: string;
    readonly content: Record<string, unknown>;
    readonly level: string;
    readonly difficulty: number;
    readonly targetSkills?: readonly string[];
    readonly estimatedDuration?: number;
}

/**
 * Interface pour les résultats d'évaluation legacy
 */
interface LegacyEvaluationResult {
    readonly score: number;
    readonly feedback: string;
    readonly isCorrect: boolean;
    readonly suggestions: readonly string[];
    readonly timeSpent?: number;
    readonly difficulty?: number;
    readonly legacyVersion?: string;
    readonly migrationTimestamp?: Date;
}

/**
 * Interface pour les données legacy en lot
 */
interface LegacyDataBatch {
    readonly profiles?: LegacyUserProfile[];
    readonly exercises?: LegacyExercise[];
    readonly evaluations?: Array<{
        readonly result: LegacyEvaluationResult;
        readonly exerciseId: string;
        readonly userId: string;
    }>;
}

/**
 * Interface pour les données migrées
 */
interface MigratedData {
    readonly profiles: UserReverseProfile[];
    readonly evaluations: EvaluationResult[];
    readonly exercises: ExerciseGenerationParams[];
}

/**
 * Convertisseur spécialisé pour les types legacy
 * 
 * @class LegacyTypeConverter
 * @description Gère toutes les conversions entre les anciens et nouveaux formats
 * avec validation et mapping sécurisés des types.
 */
export class LegacyTypeConverter {
    /**
     * Logger pour le convertisseur de types
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('LegacyTypeConverter');

    /**
     * Cache des conversions pour éviter les recalculs
     * @private
     */
    private readonly conversionCache = new Map<string, unknown>();

    /**
     * Métriques de conversion
     * @private
     */
    private readonly metrics = {
        profilesConverted: 0,
        exercisesConverted: 0,
        evaluationsConverted: 0,
        migrationsCompleted: 0
    };

    /**
     * Constructeur du convertisseur de types legacy
     * 
     * @constructor
     */
    constructor() {
        this.logger.info('🔄 LegacyTypeConverter initialisé');
    }

    /**
     * Convertit un profil legacy vers le nouveau format
     * 
     * @method convertLegacyProfile
     * @param {unknown} legacyProfile - Profil legacy à convertir (typage sécurisé)
     * @returns {UserReverseProfile} Profil converti
     * @public
     */
    public convertLegacyProfile(legacyProfile: unknown): UserReverseProfile {
        // Validation et typage sécurisé
        const profile = this.validateLegacyProfile(legacyProfile);

        const culturalBackground = this.mapStringToCulturalEnvironment(
            profile.culturalBackground || 'deaf_family_home'
        );

        // Création sécurisée sans propriétés non existantes
        const baseProfile: UserReverseProfile = {
            userId: profile.userId,
            currentLevel: this.mapStringToCECRLLevel(profile.currentLevel),
            strengths: [...profile.strengths],
            weaknesses: [...profile.weaknesses],
            learningPreferences: [...profile.preferences],
            progressHistory: [],
            culturalBackground,
            motivationFactors: [...profile.preferences],
            learningStyle: 'visual',
            sessionCount: profile.sessionCount,
            totalLearningTime: 0,
            lastActivity: profile.lastActivity
        };

        // Stocker les propriétés étendues dans le cache de conversion
        const extendedProperties = {
            averageSessionDuration: 0,
            preferredDifficulty: 0.5,
            adaptabilityScore: profile.motivationLevel || 0.5
        };

        this.conversionCache.set(`profile_${profile.userId}`, extendedProperties);
        this.metrics.profilesConverted++;

        this.logger.debug('✅ Profil legacy converti', {
            userId: profile.userId,
            level: baseProfile.currentLevel,
            culturalBackground: baseProfile.culturalBackground
        });

        return baseProfile;
    }

    /**
     * Convertit un exercice legacy vers le nouveau format
     * 
     * @method convertLegacyExercise
     * @param {unknown} legacyExercise - Exercice legacy à convertir (typage sécurisé)
     * @returns {ExerciseGenerationParams} Paramètres d'exercice convertis
     * @public
     */
    public convertLegacyExercise(legacyExercise: unknown): ExerciseGenerationParams {
        // Validation et typage sécurisé
        const exercise = this.validateLegacyExercise(legacyExercise);

        const convertedParams: ExerciseGenerationParams = {
            type: exercise.type,
            level: this.mapStringToCECRLLevel(exercise.level),
            difficulty: exercise.difficulty,
            focusAreas: exercise.targetSkills ? [...exercise.targetSkills] : [], // ✅ Toujours défini
            userId: undefined, // sera défini lors de l'utilisation
            culturalContext: 'deaf_family_home',
            aiPersonality: 'encouraging_mentor',
            teachingMethod: 'interactive'
        };

        this.metrics.exercisesConverted++;

        this.logger.debug('✅ Exercice legacy converti', {
            id: exercise.id,
            type: convertedParams.type,
            level: convertedParams.level
        });

        return convertedParams;
    }

    /**
     * Convertit un résultat d'évaluation legacy vers le nouveau format
     * 
     * @method convertLegacyEvaluationResult
     * @param {unknown} legacyResult - Résultat legacy à convertir (typage sécurisé)
     * @param {string} exerciseId - ID de l'exercice associé
     * @param {string} userId - ID de l'utilisateur
     * @returns {EvaluationResult} Résultat converti
     * @public
     */
    public convertLegacyEvaluationResult(
        legacyResult: unknown,
        exerciseId: string,
        userId: string
    ): EvaluationResult {
        // Validation et typage sécurisé
        const result = this.validateLegacyEvaluationResult(legacyResult);

        const convertedResult: EvaluationResult = {
            exerciseId,
            userId,
            score: result.score,
            percentage: result.score * 100,
            isCorrect: result.isCorrect,
            feedback: result.feedback,
            suggestions: [...result.suggestions],
            timestamp: result.migrationTimestamp || new Date(),
            completionTime: result.timeSpent // ✅ Corrigé: timeSpent -> completionTime
        };

        this.metrics.evaluationsConverted++;

        this.logger.debug('✅ Résultat d\'évaluation legacy converti', {
            exerciseId,
            userId,
            score: convertedResult.score,
            isCorrect: convertedResult.isCorrect
        });

        return convertedResult;
    }

    /**
     * Migre des données legacy complètes
     * 
     * @method migrateLegacyData
     * @param {unknown} legacyData - Données legacy complètes (typage sécurisé)
     * @returns {Promise<MigratedData>} Données migrées
     * @public
     */
    public async migrateLegacyData(legacyData: unknown): Promise<MigratedData> {
        // Validation et typage sécurisé
        const data = this.validateLegacyDataBatch(legacyData);

        const migratedProfiles = (data.profiles || []).map(profile =>
            this.convertLegacyProfile(profile)
        );

        const migratedEvaluations = (data.evaluations || []).map(evalItem =>
            this.convertLegacyEvaluationResult(evalItem.result, evalItem.exerciseId, evalItem.userId)
        );

        const migratedExercises = (data.exercises || []).map(exercise =>
            this.convertLegacyExercise(exercise)
        );

        this.metrics.migrationsCompleted++;

        this.logger.info('📦 Migration legacy complétée', {
            profilesCount: migratedProfiles.length,
            evaluationsCount: migratedEvaluations.length,
            exercisesCount: migratedExercises.length,
            totalMigrations: this.metrics.migrationsCompleted
        });

        return {
            profiles: migratedProfiles,
            evaluations: migratedEvaluations,
            exercises: migratedExercises
        };
    }

    /**
     * Obtient les métriques de conversion
     * 
     * @method getMetrics
     * @returns {Record<string, number>} Métriques détaillées
     * @public
     */
    public getMetrics(): Record<string, number> {
        return { ...this.metrics };
    }

    /**
     * Nettoie les ressources et cache
     * 
     * @method destroy
     * @async
     * @returns {Promise<void>}
     * @public
     */
    public async destroy(): Promise<void> {
        this.conversionCache.clear();

        this.logger.info('🧹 LegacyTypeConverter détruit et cache nettoyé', {
            finalMetrics: this.getMetrics()
        });
    }

    // ==================== MÉTHODES PRIVÉES DE VALIDATION ====================

    /**
     * Valide et type un profil legacy
     */
    private validateLegacyProfile(data: unknown): LegacyUserProfile {
        if (!data || typeof data !== 'object') {
            throw new Error('Données de profil legacy invalides');
        }

        const profile = data as Record<string, unknown>;

        if (typeof profile.userId !== 'string' || !profile.userId) {
            throw new Error('userId manquant ou invalide dans le profil legacy');
        }

        return {
            userId: profile.userId,
            currentLevel: String(profile.currentLevel || 'A1'),
            strengths: Array.isArray(profile.strengths) ? profile.strengths.map(String) : [],
            weaknesses: Array.isArray(profile.weaknesses) ? profile.weaknesses.map(String) : [],
            preferences: Array.isArray(profile.preferences) ? profile.preferences.map(String) : [],
            sessionCount: Number(profile.sessionCount || 0),
            lastActivity: profile.lastActivity instanceof Date ? profile.lastActivity : new Date(),
            culturalBackground: profile.culturalBackground ? String(profile.culturalBackground) : undefined,
            motivationLevel: profile.motivationLevel ? Number(profile.motivationLevel) : undefined
        };
    }

    /**
     * Valide et type un exercice legacy
     */
    private validateLegacyExercise(data: unknown): LegacyExercise {
        if (!data || typeof data !== 'object') {
            throw new Error('Données d\'exercice legacy invalides');
        }

        const exercise = data as Record<string, unknown>;

        if (typeof exercise.id !== 'string' || !exercise.id) {
            throw new Error('id manquant ou invalide dans l\'exercice legacy');
        }

        return {
            id: exercise.id,
            type: String(exercise.type || 'unknown'),
            content: (exercise.content && typeof exercise.content === 'object')
                ? exercise.content as Record<string, unknown>
                : {},
            level: String(exercise.level || 'A1'),
            difficulty: Number(exercise.difficulty || 0.5),
            targetSkills: Array.isArray(exercise.targetSkills)
                ? exercise.targetSkills.map(String)
                : undefined,
            estimatedDuration: exercise.estimatedDuration ? Number(exercise.estimatedDuration) : undefined
        };
    }

    /**
     * Valide et type un résultat d'évaluation legacy
     */
    private validateLegacyEvaluationResult(data: unknown): LegacyEvaluationResult {
        if (!data || typeof data !== 'object') {
            throw new Error('Données de résultat d\'évaluation legacy invalides');
        }

        const result = data as Record<string, unknown>;

        return {
            score: Number(result.score || 0),
            feedback: String(result.feedback || ''),
            isCorrect: Boolean(result.isCorrect),
            suggestions: Array.isArray(result.suggestions) ? result.suggestions.map(String) : [],
            timeSpent: result.timeSpent ? Number(result.timeSpent) : undefined,
            difficulty: result.difficulty ? Number(result.difficulty) : undefined,
            legacyVersion: result.legacyVersion ? String(result.legacyVersion) : undefined,
            migrationTimestamp: result.migrationTimestamp instanceof Date
                ? result.migrationTimestamp
                : undefined
        };
    }

    /**
     * Valide et type un lot de données legacy avec conversion sécurisée
     */
    private validateLegacyDataBatch(data: unknown): LegacyDataBatch {
        if (!data || typeof data !== 'object') {
            throw new Error('Lot de données legacy invalide');
        }

        const batch = data as Record<string, unknown>;

        return {
            profiles: Array.isArray(batch.profiles)
                ? batch.profiles as LegacyUserProfile[]
                : undefined,
            exercises: Array.isArray(batch.exercises)
                ? batch.exercises as LegacyExercise[]
                : undefined,
            evaluations: Array.isArray(batch.evaluations)
                ? batch.evaluations as Array<{
                    readonly result: LegacyEvaluationResult;
                    readonly exerciseId: string;
                    readonly userId: string;
                }>
                : undefined
        };
    }

    // ==================== MÉTHODES PRIVÉES DE MAPPING ====================

    /**
     * Mappe une chaîne vers un niveau CECRL valide
     */
    private mapStringToCECRLLevel(level: string): CECRLLevel {
        const validLevels: CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        return validLevels.includes(level as CECRLLevel) ? level as CECRLLevel : 'A1';
    }

    /**
     * Mappe une chaîne vers un environnement culturel valide
     */
    private mapStringToCulturalEnvironment(culture: string): CulturalEnvironment {
        const validEnvironments: CulturalEnvironment[] = [
            'deaf_family_home', 'mixed_hearing_family', 'school_environment',
            'community_center', 'online_learning', 'deaf_school',
            'deaf_community_center', 'deaf_workplace'
        ];
        return validEnvironments.includes(culture as CulturalEnvironment)
            ? culture as CulturalEnvironment
            : 'deaf_family_home';
    }
}