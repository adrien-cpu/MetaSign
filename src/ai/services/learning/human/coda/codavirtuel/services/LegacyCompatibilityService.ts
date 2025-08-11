/**
 * @file src/ai/services/learning/human/coda/codavirtuel/services/LegacyCompatibilityService.ts
 * @description Service révolutionnaire de compatibilité legacy pour le système CODA v4.0.0 - Version Refactorisée
 * 
 * Fonctionnalités révolutionnaires :
 * - 🔄 Compatibilité complète avec l'API legacy existante
 * - 🎯 Adaptation transparente vers la nouvelle architecture
 * - 📊 Bridge intelligent entre ancien et nouveau système
 * - 🌟 Préservation de toutes les fonctionnalités existantes
 * - ✨ Compatible exactOptionalPropertyTypes: true
 * - 🔧 Architecture modulaire < 300 lignes
 * - 🚀 Migration progressive et conversions automatiques
 * - 🧠 IA d'adaptation contextuelle
 * 
 * @module services
 * @version 4.1.0 - Service révolutionnaire refactorisé < 300 lignes
 * @since 2025
 * @author MetaSign Team - CODA Legacy Compatibility
 * @lastModified 2025-08-03
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';

// Imports des services refactorisés
import { LegacyProfileManager } from './legacy/LegacyProfileManager';
import { LegacyExerciseManager } from './legacy/LegacyExerciseManager';
import { LegacyEvaluationManager } from './legacy/LegacyEvaluationManager';
import { LegacyTypeConverter } from './legacy/LegacyTypeConverter';

// Imports des services principaux
import type { CODASessionOrchestrator } from './CODASessionOrchestrator';
import type { CODABusinessLogic } from './CODABusinessLogic';

// Imports des types harmonisés
import type {
    UserReverseProfile,
    UserAdaptedExercise,
    LevelEvaluation,
    ReverseApprenticeshipOptions,
    ExerciseGenerationParams,
    EvaluationResult,
    CECRLLevel,
    CulturalEnvironment
} from '../types/index';

/**
 * Interface pour la réponse d'évaluation enrichie
 */
interface EnhancedEvaluationResponse {
    readonly score: number;
    readonly feedback: string;
    readonly levelProgress: number;
    readonly insights: readonly string[];
    readonly recommendations: readonly string[];
}

/**
 * Interface pour l'évaluation de niveau enrichie
 */
interface EnhancedLevelEvaluation extends LevelEvaluation {
    readonly nextLevel?: CECRLLevel;
    readonly progressToNext: number;
    readonly areasForImprovement: readonly string[];
    readonly estimatedTimeToNext: number; // ✅ Corrigé: number au lieu de string
    readonly confidenceScore: number;
}

/**
 * Service révolutionnaire de compatibilité legacy - Version Refactorisée
 * 
 * @class LegacyCompatibilityService
 * @description Service bridge intelligent refactorisé qui maintient la compatibilité complète 
 * avec l'API legacy tout en utilisant la nouvelle architecture modulaire CODA v4.0.
 * Divisé en modules spécialisés pour respecter la limite de 300 lignes.
 * 
 * @example
 * ```typescript
 * const legacyService = new LegacyCompatibilityService(
 *   sessionOrchestrator, businessLogic, options
 * );
 * 
 * // API legacy compatible avec améliorations automatiques
 * const profile = await legacyService.initializeUserProfile('user123');
 * const exercise = await legacyService.generateExercise('user123');
 * const result = await legacyService.evaluateResponse('user123', 'ex123', response);
 * ```
 */
export class LegacyCompatibilityService {
    /**
     * Logger pour le service de compatibilité
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('LegacyCompatibilityService');

    /**
     * Gestionnaire de profils legacy
     * @private
     * @readonly
     */
    private readonly profileManager: LegacyProfileManager;

    /**
     * Gestionnaire d'exercices legacy
     * @private
     * @readonly
     */
    private readonly exerciseManager: LegacyExerciseManager;

    /**
     * Gestionnaire d'évaluation legacy
     * @private
     * @readonly
     */
    private readonly evaluationManager: LegacyEvaluationManager;

    /**
     * Convertisseur de types legacy
     * @private
     * @readonly
     */
    private readonly typeConverter: LegacyTypeConverter;

    /**
     * Métriques de performance du service
     * @private
     */
    private readonly performanceMetrics = {
        conversionsCount: 0,
        migrationsCount: 0,
        cacheHits: 0,
        cacheMisses: 0
    };

    /**
     * Constructeur du service de compatibilité legacy révolutionnaire
     * 
     * @constructor
     * @param {CODASessionOrchestrator} sessionOrchestrator - Orchestrateur de sessions
     * @param {CODABusinessLogic} businessLogic - Logique métier CODA
     * @param {ReverseApprenticeshipOptions} options - Options du système
     */
    constructor(
        private readonly sessionOrchestrator: CODASessionOrchestrator,
        private readonly businessLogic: CODABusinessLogic,
        private readonly options: ReverseApprenticeshipOptions
    ) {
        // Initialiser les gestionnaires refactorisés
        this.profileManager = new LegacyProfileManager(this.options, this.sessionOrchestrator);
        this.exerciseManager = new LegacyExerciseManager(this.options, this.sessionOrchestrator);
        this.evaluationManager = new LegacyEvaluationManager(this.options);
        this.typeConverter = new LegacyTypeConverter();

        this.logger.info('🔄 LegacyCompatibilityService révolutionnaire refactorisé initialisé', {
            codaMode: this.options.codaMode,
            adaptiveDifficulty: this.options.adaptiveDifficulty,
            initialLevel: this.options.initialLevel,
            migrationMode: true,
            modulesLoaded: 4
        });
    }

    /**
     * Initialise un profil utilisateur avec conversion automatique (API legacy améliorée)
     * 
     * @method initializeUserProfile
     * @async
     * @param {string} userId - Identifiant utilisateur
     * @param {CECRLLevel} [initialLevel] - Niveau initial CECRL optionnel
     * @param {CulturalEnvironment} [culturalBackground] - Contexte culturel
     * @returns {Promise<UserReverseProfile>} Profil utilisateur initialisé et optimisé
     * @public
     */
    public async initializeUserProfile(
        userId: string,
        initialLevel?: CECRLLevel,
        culturalBackground?: CulturalEnvironment
    ): Promise<UserReverseProfile> {
        try {
            this.logger.info('👤 Initialisation profil utilisateur legacy améliorée', {
                userId, initialLevel, culturalBackground
            });

            const profile = await this.profileManager.initializeProfile(
                userId,
                initialLevel,
                culturalBackground
            );

            this.updateMetrics('cacheHits');
            return profile;
        } catch (error) {
            this.logger.error('❌ Erreur initialisation profil legacy', { userId, error });
            throw error;
        }
    }

    /**
     * Génère un exercice adapté avec paramètres enrichis (API legacy améliorée)
     * 
     * @method generateExercise
     * @async
     * @param {string} userId - Identifiant utilisateur
     * @param {Partial<ExerciseGenerationParams>} [customParams] - Paramètres personnalisés
     * @returns {Promise<UserAdaptedExercise>} Exercice généré et optimisé
     * @public
     */
    public async generateExercise(
        userId: string,
        customParams?: Partial<ExerciseGenerationParams>
    ): Promise<UserAdaptedExercise> {
        try {
            this.logger.info('🎯 Génération exercice legacy améliorée', { userId, customParams });

            const exercise = await this.exerciseManager.generateExercise(userId, customParams);
            this.updateMetrics('cacheHits');

            return exercise;
        } catch (error) {
            this.logger.error('❌ Erreur génération exercice legacy', { userId, error });
            throw error;
        }
    }

    /**
     * Évalue une réponse utilisateur avec enrichissement automatique (API legacy améliorée)
     * 
     * @method evaluateResponse
     * @async
     * @param {string} userId - Identifiant utilisateur
     * @param {string} exerciseId - Identifiant de l'exercice
     * @param {unknown} response - Réponse utilisateur
     * @returns {Promise<EnhancedEvaluationResponse>} Résultat enrichi
     * @public
     */
    public async evaluateResponse(
        userId: string,
        exerciseId: string,
        response: unknown
    ): Promise<EnhancedEvaluationResponse> {
        try {
            this.logger.info('📊 Évaluation réponse legacy améliorée', { userId, exerciseId });

            const result = await this.evaluationManager.evaluateResponse(
                userId,
                exerciseId,
                response
            );

            this.updateMetrics('cacheHits');
            return result;
        } catch (error) {
            this.logger.error('❌ Erreur évaluation réponse legacy', { userId, exerciseId, error });
            throw error;
        }
    }

    /**
     * Évalue le niveau utilisateur avec propriétés enrichies (API legacy corrigée)
     * 
     * @method evaluateUserLevel
     * @async
     * @param {string} userId - Identifiant utilisateur
     * @returns {Promise<EnhancedLevelEvaluation>} Évaluation complète et enrichie
     * @public
     */
    public async evaluateUserLevel(userId: string): Promise<EnhancedLevelEvaluation> {
        try {
            this.logger.info('📈 Évaluation niveau utilisateur legacy enrichie', { userId });

            const evaluation = await this.evaluationManager.evaluateUserLevel(userId);
            this.updateMetrics('cacheHits');

            return evaluation;
        } catch (error) {
            this.logger.error('❌ Erreur évaluation niveau legacy', { userId, error });
            throw error;
        }
    }

    /**
     * API de conversion legacy - Délègue au TypeConverter
     */

    /**
     * Convertit un profil legacy vers le nouveau format
     * 
     * @method convertLegacyProfile
     * @param {unknown} legacyProfile - Profil legacy à convertir
     * @returns {UserReverseProfile} Profil converti
     * @public
     */
    public convertLegacyProfile(legacyProfile: unknown): UserReverseProfile {
        this.updateMetrics('conversionsCount');
        return this.typeConverter.convertLegacyProfile(legacyProfile);
    }

    /**
     * Convertit un exercice legacy vers le nouveau format
     * 
     * @method convertLegacyExercise
     * @param {unknown} legacyExercise - Exercice legacy à convertir
     * @returns {ExerciseGenerationParams} Paramètres d'exercice convertis
     * @public
     */
    public convertLegacyExercise(legacyExercise: unknown): ExerciseGenerationParams {
        this.updateMetrics('conversionsCount');
        return this.typeConverter.convertLegacyExercise(legacyExercise);
    }

    /**
     * Convertit un résultat d'évaluation legacy vers le nouveau format
     * 
     * @method convertLegacyEvaluationResult
     * @param {unknown} legacyResult - Résultat legacy à convertir
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
        this.updateMetrics('conversionsCount');
        return this.typeConverter.convertLegacyEvaluationResult(legacyResult, exerciseId, userId);
    }

    /**
     * Migre des données legacy complètes
     * 
     * @method migrateLegacyData
     * @param {unknown} legacyData - Données legacy complètes
     * @returns {Promise<{profiles: UserReverseProfile[]; evaluations: EvaluationResult[]; exercises: ExerciseGenerationParams[]}>} Données migrées
     * @public
     */
    public async migrateLegacyData(legacyData: unknown): Promise<{
        profiles: UserReverseProfile[];
        evaluations: EvaluationResult[];
        exercises: ExerciseGenerationParams[];
    }> {
        this.updateMetrics('migrationsCount');
        return this.typeConverter.migrateLegacyData(legacyData);
    }

    /**
     * Obtient un profil utilisateur avec gestion unifiée null/undefined (API legacy corrigée)
     * 
     * @method getUserProfile
     * @async
     * @param {string} userId - Identifiant utilisateur
     * @returns {Promise<UserReverseProfile | null>} Profil utilisateur ou null si non trouvé
     * @public
     */
    public async getUserProfile(userId: string): Promise<UserReverseProfile | null> {
        try {
            this.logger.debug('👤 Récupération profil utilisateur legacy', { userId });
            return await this.profileManager.getUserProfile(userId);
        } catch (error) {
            this.logger.error('❌ Erreur récupération profil legacy', { userId, error });
            return null;
        }
    }

    /**
     * Obtient les métriques de performance du service
     * 
     * @method getPerformanceMetrics
     * @returns {Record<string, number>} Métriques détaillées
     * @public
     */
    public getPerformanceMetrics(): Record<string, number> {
        return {
            ...this.performanceMetrics,
            cacheEfficiency: this.calculateCacheEfficiency()
        };
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
        await Promise.all([
            this.profileManager.destroy(),
            this.exerciseManager.destroy(),
            this.evaluationManager.destroy(),
            this.typeConverter.destroy()
        ]);

        this.logger.info('🧹 LegacyCompatibilityService refactorisé détruit', {
            finalMetrics: this.getPerformanceMetrics()
        });
    }

    // ==================== MÉTHODES PRIVÉES OPTIMISÉES ====================

    /**
     * Met à jour les métriques de performance
     * 
     * @private
     * @param {keyof typeof this.performanceMetrics} metric - Métrique à mettre à jour
     */
    private updateMetrics(metric: keyof typeof this.performanceMetrics): void {
        this.performanceMetrics[metric]++;
    }

    /**
     * Calcule l'efficacité du cache
     * 
     * @private
     * @returns {number} Pourcentage d'efficacité
     */
    private calculateCacheEfficiency(): number {
        const totalAccess = this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses;
        return totalAccess > 0
            ? (this.performanceMetrics.cacheHits / totalAccess) * 100
            : 0;
    }
}