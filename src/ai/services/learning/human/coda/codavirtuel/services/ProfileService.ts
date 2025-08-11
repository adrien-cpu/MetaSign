/**
 * @file src/ai/services/learning/human/coda/codavirtuel/services/ProfileService.ts
 * @description Service de gestion des profils utilisateur CODA - Version Corrigée
 * 
 * Fonctionnalités corrigées :
 * - 🔧 Suppression des imports inutilisés
 * - 🎯 Remplacement de tous les 'any' par des types stricts
 * - 📊 Implémentation des propriétés manquantes dans LevelEvaluation
 * - ✨ Compatible exactOptionalPropertyTypes: true
 * - 🔄 Utilisation correcte des types harmonisés
 * 
 * @module services
 * @version 1.2.0 - Service de profils complètement corrigé
 * @since 2025
 * @author MetaSign Team - CODA Profile Management
 * @lastModified 2025-08-06
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';

// ✅ Imports corrigés : Suppression des imports inutilisés
import type {
    UserReverseProfile,
    LevelEvaluation,
    EvaluationResult,
    CECRLLevel
} from '../types/index';

/**
 * Interface pour l'analyse de progression (remplace 'any')
 * ✅ Nouvelle interface pour le typage strict
 */
interface ProgressAnalysis {
    readonly suggestedLevel: CECRLLevel;
    readonly shouldLevelUp: boolean;
    readonly currentProgress: number;
    readonly progressToNext: number;
}

/**
 * Interface pour l'évaluation de niveau enrichie avec propriétés étendues
 * ✅ Corrige les propriétés manquantes nextLevel et progressToNext
 */
interface EnhancedLevelEvaluation extends LevelEvaluation {
    readonly nextLevel?: CECRLLevel;
    readonly progressToNext: number;
    readonly areasForImprovement: readonly string[];
    readonly estimatedTimeToNext: number;
    readonly confidenceScore: number;
}

/**
 * Interface pour les exercices (simulée pour compatibilité legacy)
 */
interface LegacyExercise {
    readonly id: string;
    readonly type: string;
    readonly content: Record<string, unknown>;
    readonly level: string;
    readonly difficulty: number;
}

/**
 * Service de gestion des profils utilisateur CODA
 * 
 * @class ProfileService
 * @description Gère l'initialisation, la mise à jour et l'évaluation des profils
 * utilisateur avec intégration CODA et support des types harmonisés.
 * 
 * @example
 * ```typescript
 * const profileService = new ProfileService('A1');
 * const profile = await profileService.initializeUserProfile('user123', 'A2');
 * const evaluation = await profileService.evaluateUserLevel('user123');
 * ```
 */
export class ProfileService {
    /**
     * Logger pour le service de profils
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('ProfileService');

    /**
     * Cache des profils utilisateur
     * @private
     */
    private readonly profileCache = new Map<string, UserReverseProfile>();

    /**
     * Cache des évaluations de niveau
     * @private
     */
    private readonly evaluationCache = new Map<string, EnhancedLevelEvaluation>();

    /**
     * Métriques de performance du service
     * @private
     */
    private readonly metrics = {
        profilesInitialized: 0,
        profilesUpdated: 0,
        evaluationsPerformed: 0,
        cacheHits: 0,
        cacheMisses: 0
    };

    /**
     * Constructeur du service de profils
     * 
     * @constructor
     * @param {string} defaultLevel - Niveau par défaut pour les nouveaux profils
     */
    constructor(
        private readonly defaultLevel: string = 'A1'
    ) {
        this.logger.info('👤 ProfileService initialisé', {
            defaultLevel: this.defaultLevel
        });
    }

    /**
     * Initialise un profil utilisateur avec niveau spécifié
     * 
     * @method initializeUserProfile
     * @async
     * @param {string} userId - Identifiant utilisateur
     * @param {CECRLLevel} initialLevel - Niveau initial CECRL
     * @returns {Promise<UserReverseProfile>} Profil utilisateur initialisé
     * @public
     */
    public async initializeUserProfile(
        userId: string,
        initialLevel: CECRLLevel
    ): Promise<UserReverseProfile> {
        this.logger.info('🚀 Initialisation profil utilisateur', {
            userId,
            initialLevel
        });

        // Vérifier le cache d'abord
        const cached = this.profileCache.get(userId);
        if (cached) {
            this.metrics.cacheHits++;
            this.logger.debug('📋 Profil récupéré du cache', { userId });
            return cached;
        }

        this.metrics.cacheMisses++;

        // Valider le niveau CECRL
        const validLevel = this.validateCECRLLevel(initialLevel);

        // Créer le profil avec toutes les propriétés requises
        const profile: UserReverseProfile = {
            userId,
            currentLevel: validLevel,
            strengths: ['motivation', 'curiosity'],
            weaknesses: ['basic_vocabulary'],
            learningPreferences: ['visual', 'interactive'],
            progressHistory: [],
            culturalBackground: 'deaf_family_home',
            motivationFactors: ['personal_growth', 'communication'],
            learningStyle: 'visual',
            sessionCount: 0,
            totalLearningTime: 0,
            lastActivity: new Date()
        };

        // Mettre en cache
        this.profileCache.set(userId, profile);
        this.metrics.profilesInitialized++;

        this.logger.info('✅ Profil utilisateur initialisé', {
            userId,
            level: profile.currentLevel,
            strengths: profile.strengths.length,
            weaknesses: profile.weaknesses.length
        });

        return profile;
    }

    /**
     * Met à jour un profil utilisateur avec les résultats d'un exercice
     * 
     * @method updateUserProfile
     * @async
     * @param {UserReverseProfile} profile - Profil utilisateur à mettre à jour
     * @param {LegacyExercise} exercise - Exercice réalisé
     * @param {EvaluationResult} evaluation - Résultat de l'évaluation
     * @returns {Promise<UserReverseProfile>} Profil mis à jour
     * @public
     */
    public async updateUserProfile(
        profile: UserReverseProfile,
        exercise: LegacyExercise,
        evaluation: EvaluationResult
    ): Promise<UserReverseProfile> {
        this.logger.info('🔄 Mise à jour profil utilisateur', {
            userId: profile.userId,
            exerciseId: exercise.id,
            score: evaluation.score
        });

        // Mettre à jour l'historique de progression
        const progressEntry = {
            date: new Date(),
            level: profile.currentLevel,
            score: evaluation.score
        };

        // Analyser la performance pour ajuster les forces/faiblesses
        const adjustments = this.analyzePerformanceForAdjustments(evaluation, exercise);

        // Créer le profil mis à jour
        const updatedProfile: UserReverseProfile = {
            ...profile,
            progressHistory: [...profile.progressHistory, progressEntry],
            strengths: this.updateStrengthsBasedOnPerformance(profile.strengths, adjustments.strengths),
            weaknesses: this.updateWeaknessesBasedOnPerformance(profile.weaknesses, adjustments.weaknesses),
            sessionCount: profile.sessionCount + 1,
            totalLearningTime: profile.totalLearningTime + (evaluation.completionTime || 0),
            lastActivity: new Date()
        };

        // Mettre à jour le cache
        this.profileCache.set(profile.userId, updatedProfile);
        this.metrics.profilesUpdated++;

        this.logger.info('✅ Profil utilisateur mis à jour', {
            userId: profile.userId,
            newSessionCount: updatedProfile.sessionCount,
            totalTime: updatedProfile.totalLearningTime
        });

        return updatedProfile;
    }

    /**
     * Obtient un profil utilisateur avec gestion du cache
     * 
     * @method getUserProfile
     * @async
     * @param {string} userId - Identifiant utilisateur
     * @returns {Promise<UserReverseProfile | null>} Profil utilisateur ou null si non trouvé
     * @public
     */
    public async getUserProfile(userId: string): Promise<UserReverseProfile | null> {
        this.logger.debug('👤 Récupération profil utilisateur', { userId });

        // Vérifier le cache
        const cached = this.profileCache.get(userId);
        if (cached) {
            this.metrics.cacheHits++;
            return cached;
        }

        this.metrics.cacheMisses++;

        // Dans un vrai système, nous interrogerions la base de données ici
        // Pour cette version, nous retournons null si pas en cache
        this.logger.warn('Profil non trouvé', { userId });
        return null;
    }

    /**
     * Évalue le niveau utilisateur avec propriétés enrichies
     * ✅ Corrige les propriétés manquantes dans LevelEvaluation
     * 
     * @method evaluateUserLevel
     * @async
     * @param {string} userId - Identifiant utilisateur
     * @returns {Promise<EnhancedLevelEvaluation>} Évaluation complète du niveau
     * @public
     */
    public async evaluateUserLevel(userId: string): Promise<EnhancedLevelEvaluation> {
        this.logger.info('📈 Évaluation niveau utilisateur', { userId });

        // Vérifier le cache d'évaluation
        const cachedEvaluation = this.evaluationCache.get(userId);
        if (cachedEvaluation) {
            this.metrics.cacheHits++;
            return cachedEvaluation;
        }

        this.metrics.cacheMisses++;

        // Obtenir le profil utilisateur
        const profile = await this.getUserProfile(userId);
        if (!profile) {
            throw new Error(`Profil utilisateur non trouvé: ${userId}`);
        }

        // Analyser l'historique de progression
        const progressAnalysis = this.analyzeProgressHistory(profile.progressHistory);

        // Calculer les scores par domaine
        const domainScores = this.calculateDomainScores(profile);

        // ✅ Créer l'évaluation de base conforme à LevelEvaluation
        const baseEvaluation: LevelEvaluation = {
            currentLevel: profile.currentLevel,
            recommendedLevel: progressAnalysis.suggestedLevel,
            levelChangeRecommended: progressAnalysis.shouldLevelUp,
            progressInCurrentLevel: progressAnalysis.currentProgress,
            scores: domainScores,
            explanation: this.generateEvaluationExplanation(profile, progressAnalysis),
            strengthAreas: [...profile.strengths],
            weaknessAreas: [...profile.weaknesses],
            recommendations: this.generateRecommendations(profile, progressAnalysis)
        };

        // ✅ Enrichir avec les propriétés étendues manquantes
        const enhancedEvaluation: EnhancedLevelEvaluation = {
            ...baseEvaluation,
            nextLevel: this.calculateNextLevel(profile.currentLevel),
            progressToNext: progressAnalysis.progressToNext,
            areasForImprovement: this.identifyImprovementAreas(profile, domainScores),
            estimatedTimeToNext: this.estimateTimeToNextLevel(progressAnalysis),
            confidenceScore: this.calculateConfidenceScore(progressAnalysis)
        };

        // Mettre en cache l'évaluation
        this.evaluationCache.set(userId, enhancedEvaluation);
        this.metrics.evaluationsPerformed++;

        this.logger.info('✅ Évaluation niveau complétée', {
            userId,
            currentLevel: enhancedEvaluation.currentLevel,
            recommendedLevel: enhancedEvaluation.recommendedLevel,
            progressToNext: enhancedEvaluation.progressToNext.toFixed(2),
            confidenceScore: enhancedEvaluation.confidenceScore
        });

        return enhancedEvaluation;
    }

    /**
     * Calcule la progression de niveau pour un profil
     * 
     * @method calculateLevelProgress
     * @param {UserReverseProfile} profile - Profil utilisateur
     * @returns {number} Progression (0-1)
     * @public
     */
    public calculateLevelProgress(profile: UserReverseProfile): number {
        if (profile.progressHistory.length === 0) {
            return 0;
        }

        // Analyser les derniers résultats
        const recentResults = profile.progressHistory.slice(-10);
        const averageScore = recentResults.reduce((sum, entry) => sum + entry.score, 0) / recentResults.length;

        // Ajuster selon la cohérence des résultats
        const consistency = this.calculateConsistency(recentResults);
        const adjustedProgress = averageScore * consistency;

        return Math.min(0.95, Math.max(0.05, adjustedProgress));
    }

    /**
     * Obtient les métriques de performance du service
     * 
     * @method getMetrics
     * @returns {Record<string, number>} Métriques détaillées
     * @public
     */
    public getMetrics(): Record<string, number> {
        return {
            ...this.metrics,
            cacheEfficiency: this.calculateCacheEfficiency()
        };
    }

    /**
     * Nettoie les ressources et caches
     * 
     * @method destroy
     * @async
     * @returns {Promise<void>}
     * @public
     */
    public async destroy(): Promise<void> {
        this.profileCache.clear();
        this.evaluationCache.clear();

        this.logger.info('🧹 ProfileService détruit et caches nettoyés', {
            finalMetrics: this.getMetrics()
        });
    }

    // ==================== MÉTHODES PRIVÉES ====================

    /**
     * Valide un niveau CECRL
     * ✅ Corrigé : validation directe sans dépendance externe
     */
    private validateCECRLLevel(level: string): CECRLLevel {
        const validLevels: CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

        // Vérifier si le niveau est valide
        if (validLevels.includes(level as CECRLLevel)) {
            return level as CECRLLevel;
        }

        // Retourner le niveau par défaut si invalide
        this.logger.warn('Niveau CECRL invalide, utilisation du défaut', {
            invalidLevel: level,
            defaultLevel: this.defaultLevel
        });

        return this.defaultLevel as CECRLLevel;
    }

    /**
     * Analyse la performance pour déterminer les ajustements
     */
    private analyzePerformanceForAdjustments(
        evaluation: EvaluationResult,
        exercise: LegacyExercise
    ): { strengths: string[]; weaknesses: string[] } {
        const adjustments = { strengths: [] as string[], weaknesses: [] as string[] };

        // Analyser selon le type d'exercice et la performance
        if (evaluation.percentage >= 80) {
            adjustments.strengths.push(exercise.type);
        } else if (evaluation.percentage < 60) {
            adjustments.weaknesses.push(exercise.type);
        }

        return adjustments;
    }

    /**
     * Met à jour les forces basées sur la performance
     */
    private updateStrengthsBasedOnPerformance(
        currentStrengths: readonly string[],
        newStrengths: string[]
    ): readonly string[] {
        const updated = [...currentStrengths];

        newStrengths.forEach(strength => {
            if (!updated.includes(strength)) {
                updated.push(strength);
            }
        });

        return updated;
    }

    /**
     * Met à jour les faiblesses basées sur la performance
     */
    private updateWeaknessesBasedOnPerformance(
        currentWeaknesses: readonly string[],
        newWeaknesses: string[]
    ): readonly string[] {
        const updated = [...currentWeaknesses];

        newWeaknesses.forEach(weakness => {
            if (!updated.includes(weakness)) {
                updated.push(weakness);
            }
        });

        return updated;
    }

    /**
     * ✅ Analyse l'historique de progression (typage strict)
     */
    private analyzeProgressHistory(
        progressHistory: readonly UserReverseProfile['progressHistory'][0][]
    ): ProgressAnalysis {
        if (progressHistory.length === 0) {
            return {
                suggestedLevel: 'A1',
                shouldLevelUp: false,
                currentProgress: 0,
                progressToNext: 0
            };
        }

        const recentScores = progressHistory.slice(-5).map(entry => entry.score);
        const averageScore = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
        const currentLevel = progressHistory[progressHistory.length - 1].level;

        const shouldLevelUp = averageScore >= 0.8 && recentScores.every(score => score >= 0.7);
        const suggestedLevel = shouldLevelUp ? this.calculateNextLevel(currentLevel) || currentLevel : currentLevel;

        return {
            suggestedLevel,
            shouldLevelUp,
            currentProgress: Math.min(0.95, averageScore),
            progressToNext: shouldLevelUp ? 0.9 : averageScore * 0.8
        };
    }

    /**
     * Calcule les scores par domaine
     */
    private calculateDomainScores(profile: UserReverseProfile): Record<string, number> {
        const scores: Record<string, number> = {};

        // Scores basés sur les forces et faiblesses
        profile.strengths.forEach(strength => {
            scores[strength] = 0.7 + Math.random() * 0.2; // 0.7-0.9
        });

        profile.weaknesses.forEach(weakness => {
            scores[weakness] = 0.3 + Math.random() * 0.3; // 0.3-0.6
        });

        // Ajouter des domaines par défaut si nécessaire
        if (Object.keys(scores).length === 0) {
            scores['vocabulary'] = 0.5;
            scores['grammar'] = 0.5;
            scores['expression'] = 0.5;
        }

        return scores;
    }

    /**
     * ✅ Génère une explication d'évaluation (typage strict)
     */
    private generateEvaluationExplanation(
        profile: UserReverseProfile,
        progressAnalysis: ProgressAnalysis
    ): string {
        const level = profile.currentLevel;
        const progress = (progressAnalysis.currentProgress * 100).toFixed(0);

        if (progressAnalysis.shouldLevelUp) {
            return `Félicitations ! Vous maîtrisez le niveau ${level} (${progress}% de progression). Vous êtes prêt pour le niveau suivant.`;
        } else {
            return `Vous progressez bien au niveau ${level} (${progress}% de progression). Continuez à pratiquer vos points faibles.`;
        }
    }

    /**
     * ✅ Génère des recommandations (typage strict)
     */
    private generateRecommendations(
        profile: UserReverseProfile,
        progressAnalysis: ProgressAnalysis
    ): readonly string[] {
        const recommendations: string[] = [];

        if (progressAnalysis.shouldLevelUp) {
            recommendations.push('Prêt pour passer au niveau supérieur');
            recommendations.push('Continuez à pratiquer pour consolider vos acquis');
        } else {
            recommendations.push('Concentrez-vous sur vos points faibles identifiés');
            recommendations.push('Pratiquez régulièrement pour améliorer votre progression');
        }

        // Recommandations basées sur les faiblesses
        if (profile.weaknesses.length > 0) {
            const primaryWeakness = profile.weaknesses[0];
            recommendations.push(`Travaillez spécifiquement sur : ${primaryWeakness}`);
        }

        return recommendations;
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
     * Identifie les domaines d'amélioration
     */
    private identifyImprovementAreas(
        profile: UserReverseProfile,
        domainScores: Record<string, number>
    ): readonly string[] {
        const improvements: string[] = [...profile.weaknesses];

        // Ajouter les domaines avec scores faibles
        Object.entries(domainScores).forEach(([domain, score]) => {
            if (score < 0.6 && !improvements.includes(domain)) {
                improvements.push(domain);
            }
        });

        return improvements;
    }

    /**
     * ✅ Estime le temps jusqu'au niveau suivant (typage strict)
     */
    private estimateTimeToNextLevel(progressAnalysis: ProgressAnalysis): number {
        const progressRemaining = 1 - progressAnalysis.currentProgress;
        const baseWeeks = 8; // 8 semaines de base

        return Math.ceil(baseWeeks * progressRemaining);
    }

    /**
     * ✅ Calcule un score de confiance (typage strict)
     */
    private calculateConfidenceScore(progressAnalysis: ProgressAnalysis): number {
        const baseConfidence = progressAnalysis.currentProgress;
        const consistency = progressAnalysis.progressToNext / Math.max(0.001, progressAnalysis.currentProgress);

        return Math.min(0.95, Math.max(0.6, baseConfidence * Math.min(1, consistency)));
    }

    /**
     * Calcule la cohérence des résultats
     */
    private calculateConsistency(results: readonly UserReverseProfile['progressHistory'][0][]): number {
        if (results.length < 2) return 1;

        const scores = results.map(r => r.score);
        const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
        const standardDeviation = Math.sqrt(variance);

        // Plus l'écart-type est faible, plus la cohérence est élevée
        return Math.max(0.5, 1 - standardDeviation);
    }

    /**
     * Calcule l'efficacité du cache
     */
    private calculateCacheEfficiency(): number {
        const totalAccess = this.metrics.cacheHits + this.metrics.cacheMisses;
        return totalAccess > 0
            ? (this.metrics.cacheHits / totalAccess) * 100
            : 0;
    }
}