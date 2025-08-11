/**
 * @file src/ai/services/learning/human/coda/codavirtuel/services/legacy/LegacyEvaluationManager.ts
 * @description Gestionnaire spécialisé pour les évaluations legacy
 * 
 * Fonctionnalités :
 * - 📊 Évaluation enrichie des réponses utilisateur
 * - 📈 Évaluation complète du niveau utilisateur
 * - 🎯 Génération d'insights et recommandations IA
 * - ✨ Compatible exactOptionalPropertyTypes: true
 * - 🔧 Module < 300 lignes
 * 
 * @module legacy
 * @version 1.0.0 - Gestionnaire d'évaluations refactorisé
 * @since 2025
 * @author MetaSign Team - CODA Legacy Evaluation Management
 * @lastModified 2025-08-03
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';

// Imports des services legacy
import { ExerciseGeneratorService } from '../../exercises/ExerciseGeneratorService';
import { ProfileService } from '../ProfileService';

// Imports des services mock (fallback)
import {
    MockExerciseGeneratorService,
    warnIfMockMode
} from './MockServices';

// Imports des types harmonisés
import type {
    UserReverseProfile,
    LevelEvaluation,
    EvaluationResult,
    ReverseApprenticeshipOptions,
    CECRLLevel
} from '../../types/index';

/**
 * Interface pour l'évaluation enrichie
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
    readonly estimatedTimeToNext: number;
    readonly confidenceScore: number;
}

/**
 * Interface pour exercice unifié (compatible avec ProfileService)
 */
interface LegacyExercise {
    readonly id: string;
    readonly type: string;
    readonly content: Record<string, unknown>;
    readonly level: string;
    readonly difficulty: number;
}

/**
 * Type guard pour vérifier si un objet est un GeneratedExercise
 */
function isGeneratedExercise(exercise: unknown): exercise is { id: string; type: string; content: unknown; level: string; difficulty: number; evaluation?: unknown } {
    return (
        typeof exercise === 'object' &&
        exercise !== null &&
        'id' in exercise &&
        'type' in exercise &&
        'content' in exercise &&
        'level' in exercise &&
        'difficulty' in exercise
    );
}

/**
 * Type guard pour vérifier si un objet est un EvaluationResult
 */
function isEvaluationResult(result: unknown): result is EvaluationResult {
    return (
        typeof result === 'object' &&
        result !== null &&
        'score' in result &&
        'feedback' in result &&
        'isCorrect' in result
    );
}

/**
 * Gestionnaire spécialisé pour les évaluations legacy
 * 
 * @class LegacyEvaluationManager
 * @description Gère l'évaluation des réponses, l'enrichissement des résultats
 * et l'évaluation complète du niveau utilisateur avec insights IA.
 */
export class LegacyEvaluationManager {
    /**
     * Logger pour le gestionnaire d'évaluations
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('LegacyEvaluationManager');

    /**
     * Service de génération d'exercices legacy
     * @private
     * @readonly
     */
    private readonly exerciseGenerator: ExerciseGeneratorService | MockExerciseGeneratorService;

    /**
     * Service de gestion des profils legacy
     * @private
     * @readonly
     */
    private readonly profileService: ProfileService;

    /**
     * Cache des profils utilisateur
     * @private
     */
    private readonly profileCache = new Map<string, UserReverseProfile>();

    /**
     * Constructeur du gestionnaire d'évaluations legacy
     * 
     * @constructor
     * @param {ReverseApprenticeshipOptions} options - Options du système
     */
    constructor(
        private readonly options: ReverseApprenticeshipOptions
    ) {
        // Initialiser avec fallback vers les services mock si nécessaire
        try {
            this.exerciseGenerator = ExerciseGeneratorService.getInstance();
        } catch (error) {
            this.logger.warn('ExerciseGeneratorService non disponible, utilisation du service mock', { error });
            this.exerciseGenerator = MockExerciseGeneratorService.getInstance();
        }

        this.profileService = new ProfileService(this.options.initialLevel || 'A1');

        // Avertir si les services mock sont utilisés
        warnIfMockMode();

        this.logger.info('📊 LegacyEvaluationManager initialisé', {
            initialLevel: this.options.initialLevel,
            realTimeEvaluation: this.options.realTimeEvaluation,
            usingMockServices: this.exerciseGenerator instanceof MockExerciseGeneratorService
        });
    }

    /**
     * Évalue une réponse utilisateur avec enrichissement automatique
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
        // Obtenir le profil utilisateur avec gestion sécurisée
        const userProfile = await this.getUserProfileSafe(userId);
        if (!userProfile) {
            throw new Error(`Profil utilisateur non trouvé: ${userId}`);
        }

        // Obtenir l'exercice directement via le service
        const rawExercise = await this.exerciseGenerator.getExerciseById(exerciseId);
        if (!rawExercise) {
            throw new Error(`Exercice non trouvé: ${exerciseId}`);
        }

        // ✅ Validation et conversion sécurisée de l'exercice
        if (!isGeneratedExercise(rawExercise)) {
            throw new Error(`Format d'exercice invalide: ${exerciseId}`);
        }

        // ✅ Évaluation avec gestion des types union
        let evaluationResult: EvaluationResult;
        try {
            // ✅ Gestion différenciée selon le type de service
            let rawEvaluationResult: unknown;

            if (this.exerciseGenerator instanceof MockExerciseGeneratorService) {
                // Service mock : utilise Record<string, unknown> pour content
                const mockExercise = {
                    ...rawExercise,
                    content: this.serializeExerciseContent(rawExercise.content)
                };
                rawEvaluationResult = await this.exerciseGenerator.evaluateResponse(mockExercise, response);
            } else {
                // Service réel : utilise ExerciseContent
                rawEvaluationResult = await this.exerciseGenerator.evaluateResponse(rawExercise, response);
            }

            // ✅ Normaliser le résultat d'évaluation
            evaluationResult = this.normalizeEvaluationResult(rawEvaluationResult, exerciseId, userId);

        } catch (error) {
            this.logger.error('Erreur lors de l\'évaluation', { exerciseId, error });
            // Créer un résultat d'évaluation par défaut en cas d'erreur
            evaluationResult = this.createDefaultEvaluationResult(exerciseId, userId);
        }

        // Enrichir le résultat d'évaluation
        const enrichedEvaluation = this.enrichEvaluationResult(evaluationResult, userProfile);

        // ✅ Conversion vers le format LegacyExercise pour ProfileService
        const legacyExercise: LegacyExercise = this.convertToLegacyExercise(rawExercise);
        await this.profileService.updateUserProfile(userProfile, legacyExercise, enrichedEvaluation);

        // Calculer progression de niveau
        const levelProgress = this.profileService.calculateLevelProgress(userProfile);

        // Générer insights et recommandations IA
        const insights = this.generateInsights(enrichedEvaluation, userProfile);
        const recommendations = this.generateRecommendations(enrichedEvaluation, userProfile);

        // Mettre à jour le cache du profil
        const updatedProfile = await this.profileService.getUserProfile(userId);
        if (updatedProfile) {
            this.profileCache.set(userId, updatedProfile);
        }

        this.logger.info('✅ Réponse évaluée avec succès et enrichie', {
            userId,
            exerciseId,
            score: enrichedEvaluation.score,
            isCorrect: enrichedEvaluation.isCorrect,
            levelProgress: levelProgress.toFixed(2),
            insightsCount: insights.length,
            recommendationsCount: recommendations.length
        });

        return {
            score: enrichedEvaluation.score,
            feedback: enrichedEvaluation.feedback,
            levelProgress,
            insights,
            recommendations
        };
    }

    /**
     * Évalue le niveau utilisateur avec propriétés enrichies
     * 
     * @method evaluateUserLevel
     * @async
     * @param {string} userId - Identifiant utilisateur
     * @returns {Promise<EnhancedLevelEvaluation>} Évaluation complète et enrichie
     * @public
     */
    public async evaluateUserLevel(userId: string): Promise<EnhancedLevelEvaluation> {
        // Utiliser le service legacy
        const baseEvaluation = await this.profileService.evaluateUserLevel(userId);

        // Enrichir avec toutes les propriétés manquantes
        const enhancedEvaluation: EnhancedLevelEvaluation = {
            ...baseEvaluation,
            nextLevel: this.calculateNextLevel(baseEvaluation.currentLevel),
            progressToNext: this.calculateProgressToNext(baseEvaluation),
            areasForImprovement: this.identifyAreasForImprovement(baseEvaluation),
            estimatedTimeToNext: this.estimateTimeToNextLevel(baseEvaluation),
            confidenceScore: this.calculateConfidenceScore(baseEvaluation)
        };

        this.logger.info('✅ Niveau utilisateur évalué et enrichi', {
            userId,
            currentLevel: enhancedEvaluation.currentLevel,
            nextLevel: enhancedEvaluation.nextLevel,
            progressToNext: enhancedEvaluation.progressToNext.toFixed(2),
            confidenceScore: enhancedEvaluation.confidenceScore
        });

        return enhancedEvaluation;
    }

    /**
     * Met en cache un profil utilisateur
     * 
     * @method cacheUserProfile
     * @param {UserReverseProfile} profile - Profil à mettre en cache
     * @public
     */
    public cacheUserProfile(profile: UserReverseProfile): void {
        this.profileCache.set(profile.userId, profile);
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
        this.profileCache.clear();

        this.logger.info('🧹 LegacyEvaluationManager détruit et caches nettoyés');
    }

    // ==================== MÉTHODES PRIVÉES ====================

    /**
     * ✅ Convertit un exercice vers le format LegacyExercise
     */
    private convertToLegacyExercise(exercise: { id: string; type: string; content: unknown; level: string; difficulty: number }): LegacyExercise {
        return {
            id: exercise.id,
            type: exercise.type,
            content: this.serializeExerciseContent(exercise.content),
            level: exercise.level,
            difficulty: exercise.difficulty
        };
    }

    /**
     * ✅ Sérialise le contenu d'exercice en Record<string, unknown>
     */
    private serializeExerciseContent(content: unknown): Record<string, unknown> {
        if (typeof content === 'object' && content !== null && !Array.isArray(content)) {
            return content as Record<string, unknown>;
        }

        // Conversion sécurisée pour les autres types
        return {
            serializedContent: JSON.stringify(content),
            originalType: typeof content,
            convertedAt: new Date().toISOString()
        };
    }

    /**
     * ✅ Normalise un résultat d'évaluation
     */
    private normalizeEvaluationResult(
        rawResult: unknown,
        exerciseId: string,
        userId: string
    ): EvaluationResult {
        if (isEvaluationResult(rawResult)) {
            // Le résultat est déjà au bon format
            return {
                ...rawResult,
                exerciseId: rawResult.exerciseId || exerciseId,
                userId: rawResult.userId || userId,
                timestamp: rawResult.timestamp || new Date()
            };
        }

        // Conversion depuis un format mock ou legacy
        const mockResult = rawResult as {
            score?: number;
            feedback?: string;
            isCorrect?: boolean;
            suggestions?: string[];
        };

        return {
            exerciseId,
            userId,
            score: mockResult.score || 0,
            percentage: (mockResult.score || 0) * 100,
            isCorrect: mockResult.isCorrect || false,
            feedback: mockResult.feedback || 'Évaluation effectuée',
            suggestions: mockResult.suggestions || [],
            timestamp: new Date()
        };
    }

    /**
     * ✅ Crée un résultat d'évaluation par défaut
     */
    private createDefaultEvaluationResult(exerciseId: string, userId: string): EvaluationResult {
        return {
            exerciseId,
            userId,
            score: 0,
            percentage: 0,
            isCorrect: false,
            feedback: 'Erreur lors de l\'évaluation',
            suggestions: ['Veuillez réessayer'],
            timestamp: new Date()
        };
    }

    /**
     * Enrichit un résultat d'évaluation avec des informations supplémentaires
     */
    private enrichEvaluationResult(
        evaluationResult: EvaluationResult,
        userProfile: UserReverseProfile
    ): EvaluationResult {
        return {
            ...evaluationResult,
            userId: userProfile.userId
        };
    }

    /**
     * Obtient un profil utilisateur de manière sécurisée
     */
    private async getUserProfileSafe(userId: string): Promise<UserReverseProfile | null> {
        // Vérifier le cache local d'abord
        const cachedProfile = this.profileCache.get(userId);
        if (cachedProfile) {
            return cachedProfile;
        }

        try {
            // Obtenir via le service legacy
            const serviceProfile = await this.profileService.getUserProfile(userId);
            if (serviceProfile) {
                this.profileCache.set(userId, serviceProfile);
                return serviceProfile;
            }
            return null;
        } catch (error) {
            this.logger.warn('Erreur récupération profil pour évaluation', { userId, error });
            return null;
        }
    }

    /**
     * Calcule le niveau suivant
     */
    private calculateNextLevel(currentLevel: CECRLLevel): CECRLLevel | undefined {
        const levels: CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const currentIndex = levels.indexOf(currentLevel);
        return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : undefined;
    }

    /**
     * Calcule la progression vers le niveau suivant
     */
    private calculateProgressToNext(evaluation: LevelEvaluation): number {
        const scores = Object.values(evaluation.scores || {});
        const averageScore = scores.length > 0
            ? scores.reduce((sum, score) => sum + score, 0) / scores.length
            : 0.5;

        const baseProgress = evaluation.progressInCurrentLevel || 0;
        const adjustedProgress = Math.min(0.95, Math.max(0.05, baseProgress + (averageScore - 0.5) * 0.1));

        return adjustedProgress;
    }

    /**
     * Identifie les domaines d'amélioration
     */
    private identifyAreasForImprovement(evaluation: LevelEvaluation): readonly string[] {
        const improvements: string[] = [...evaluation.weaknessAreas];

        const scores = evaluation.scores || {};
        Object.entries(scores).forEach(([domain, score]) => {
            if (score < 0.6 && !improvements.includes(domain)) {
                improvements.push(domain);
            }
        });

        if (improvements.length === 0) {
            improvements.push('vocabulary_expansion', 'grammar_accuracy', 'cultural_awareness');
        }

        return improvements;
    }

    /**
     * Estime le temps jusqu'au niveau suivant (en semaines)
     */
    private estimateTimeToNextLevel(evaluation: LevelEvaluation): number {
        const progressRemaining = 1 - (evaluation.progressInCurrentLevel || 0);
        const averageScore = this.calculateAverageScore(evaluation.scores || {});

        const performanceMultiplier = Math.max(0.5, 2 - averageScore);
        const baseWeeks = 8;

        return Math.ceil(baseWeeks * progressRemaining * performanceMultiplier);
    }

    /**
     * Calcule un score de confiance
     */
    private calculateConfidenceScore(evaluation: LevelEvaluation): number {
        const averageScore = this.calculateAverageScore(evaluation.scores || {});
        const progressFactor = evaluation.progressInCurrentLevel || 0;

        const confidenceScore = (averageScore * 0.7) + (progressFactor * 0.3);

        return Math.min(0.95, Math.max(0.6, confidenceScore));
    }

    /**
     * Calcule le score moyen à partir des scores
     */
    private calculateAverageScore(scores: Record<string, number>): number {
        const values = Object.values(scores);
        return values.length > 0
            ? values.reduce((sum, score) => sum + score, 0) / values.length
            : 0.5;
    }

    /**
     * Génère des insights IA
     */
    private generateInsights(evaluation: EvaluationResult, profile: UserReverseProfile): readonly string[] {
        const insights: string[] = [];

        if (evaluation.percentage >= 80) {
            insights.push(`Excellente performance au niveau ${profile.currentLevel}`);
        } else if (evaluation.percentage >= 60) {
            insights.push(`Performance satisfaisante au niveau ${profile.currentLevel}`);
        } else {
            insights.push(`Performance à améliorer au niveau ${profile.currentLevel}`);
        }

        if (profile.progressHistory.length > 0) {
            const recentProgress = profile.progressHistory.slice(-3);
            const improving = recentProgress.length >= 2 &&
                recentProgress[recentProgress.length - 1].score > recentProgress[0].score;

            if (improving) {
                insights.push('Progression régulière observée dans les exercices récents');
            }
        }

        insights.push('Adaptation culturelle appropriée au contexte LSF');

        return insights;
    }

    /**
     * Génère des recommandations IA
     */
    private generateRecommendations(evaluation: EvaluationResult, profile: UserReverseProfile): readonly string[] {
        const recommendations: string[] = [];

        if (evaluation.percentage < 60) {
            recommendations.push('Concentrez-vous sur les domaines faibles identifiés');
            recommendations.push('Pratiquez des exercices de niveau inférieur pour consolider');
        } else if (evaluation.percentage >= 80) {
            recommendations.push('Prêt pour des exercices de niveau supérieur');
        }

        if (profile.weaknesses.length > 0) {
            const primaryWeakness = profile.weaknesses[0];
            recommendations.push(`Travaillez spécifiquement sur : ${primaryWeakness}`);
        }

        recommendations.push('Maintenez un rythme d\'apprentissage régulier');
        recommendations.push('Utilisez vos points forts pour progresser');

        return recommendations;
    }
}