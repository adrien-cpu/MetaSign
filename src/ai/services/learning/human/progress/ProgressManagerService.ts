/**
 * @file src/ai/services/learning/human/progress/ProgressManagerService.ts
 * @description Service de gestion de la progression utilisateur avec calculs d'expérience,
 * niveaux et tracking détaillé des performances d'apprentissage LSF.
 * @module ProgressManagerService
 * @version 2.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * @example
 * ```typescript
 * const progressManager = new ProgressManagerService(
 *   moduleManager, 
 *   badgeManager, 
 *   metricsCollector,
 *   { baseExperienceMultiplier: 1.2 }
 * );
 * 
 * const summary = progressManager.updateModuleProgress(userProgress, 'lsf-basics', 100);
 * ```
 */

import type {
    LearningProgress,
    LearningModule,
    QuizAttempt,
    ProgressSystemConfig,
    ExperienceCalculation,
    ProgressUpdateSummary
} from '@/ai/services/learning/types/LearningExtensions';
import type { ModuleManagerService } from '@/ai/services/learning/human/modules/ModuleManagerService';
import type { BadgeManagerService } from '@/ai/services/learning/human/badges/BadgeManagerService';
import { MetricsCollector } from '@/ai/services/learning/registry/utils/MetricsCollector';
import { Logger } from '@/ai/utils/Logger';

/**
 * @interface ProgressStatistics
 * @description Statistiques détaillées de progression utilisateur
 */
interface ProgressStatistics {
    /** Niveau actuel */
    level: number;
    /** Expérience requise pour le niveau suivant */
    experienceToNextLevel: number;
    /** Progression vers le niveau suivant (%) */
    progressToNextLevel: number;
    /** Nombre de modules complétés */
    modulesCompleted: number;
    /** Nombre total de tentatives de quiz */
    totalQuizAttempts: number;
    /** Score moyen aux quiz */
    averageQuizScore: number;
    /** Nombre de badges gagnés */
    badgesEarned: number;
    /** Temps d'étude en heures */
    studyTimeHours: number;
}

/**
 * @interface LevelChanges
 * @description Informations sur les changements de niveau
 */
interface LevelChanges {
    /** Ancien niveau */
    oldLevel: number;
    /** Nouveau niveau */
    newLevel: number;
    /** Montée de niveau effectuée */
    levelUp: boolean;
}

/**
 * @class ProgressManagerService
 * @description Service de gestion centralisée de la progression utilisateur avec calculs
 * automatiques d'expérience, de niveaux et attribution de récompenses pour l'apprentissage LSF.
 * 
 * Fonctionnalités principales :
 * - Gestion de la progression par module
 * - Calcul automatique de l'expérience et des niveaux
 * - Attribution de badges et récompenses
 * - Suivi détaillé des performances de quiz
 * - Métriques et analytics de progression
 */
export class ProgressManagerService {
    private readonly moduleManager: ModuleManagerService;
    private readonly badgeManager: BadgeManagerService;
    private readonly metricsCollector: MetricsCollector;
    private readonly config: ProgressSystemConfig;
    private readonly logger = Logger.getInstance('ProgressManagerService');

    /**
     * Initialise le service de gestion de progression
     * @param moduleManager - Service de gestion des modules LSF
     * @param badgeManager - Service de gestion des badges
     * @param metricsCollector - Collecteur de métriques système
     * @param config - Configuration du système de progression
     */
    constructor(
        moduleManager: ModuleManagerService,
        badgeManager: BadgeManagerService,
        metricsCollector: MetricsCollector,
        config: Partial<ProgressSystemConfig> = {}
    ) {
        this.moduleManager = moduleManager;
        this.badgeManager = badgeManager;
        this.metricsCollector = metricsCollector;
        this.config = this.createDefaultConfig(config);

        this.logger.info('ProgressManagerService initialisé', {
            baseExperienceMultiplier: this.config.baseExperienceMultiplier,
            baseExperienceForLevel: this.config.baseExperienceForLevel,
            enableTimeBasedBonuses: this.config.enableTimeBasedBonuses
        });
    }

    /**
     * Met à jour la progression d'un module LSF pour un utilisateur
     * @param userProgress - Progression actuelle de l'utilisateur
     * @param moduleId - Identifiant du module LSF
     * @param progress - Nouvelle valeur de progression (0-100)
     * @returns Résumé complet des changements avec métriques
     */
    public updateModuleProgress(
        userProgress: LearningProgress,
        moduleId: string,
        progress: number
    ): ProgressUpdateSummary {
        const startTime = performance.now();

        try {
            this.validateProgressInput(progress);

            const learningModule = this.moduleManager.getModule(moduleId);
            if (!learningModule) {
                throw new Error(`Module LSF inexistant: ${moduleId}`);
            }

            const previousProgress = this.cloneProgress(userProgress);
            const previousModuleProgress = userProgress.moduleProgress[moduleId] || 0;

            // Créer la progression mise à jour
            const updatedProgress = this.createUpdatedProgress(userProgress, moduleId, progress);

            let experienceGained = 0;

            // Gestion de la complétion du module LSF
            if (progress >= 100 && previousModuleProgress < 100) {
                experienceGained += this.handleModuleCompletion(updatedProgress, learningModule);
            }

            // Mise à jour de l'expérience et du niveau
            updatedProgress.totalExperience += experienceGained;
            const levelChanges = this.updateUserLevel(updatedProgress);

            // Gestion du module actuel
            this.updateCurrentModule(updatedProgress, moduleId, progress);

            // Vérification et attribution des nouveaux badges
            const newBadges = this.checkAndAwardBadges(updatedProgress);

            // Enregistrement des métriques
            this.recordProgressMetrics(userProgress.userId, moduleId, {
                previousProgress: previousModuleProgress,
                newProgress: progress,
                experienceGained,
                levelUp: levelChanges.levelUp,
                duration: performance.now() - startTime
            });

            return {
                previousProgress,
                updatedProgress,
                levelChanges,
                newBadges,
                experienceGained
            };

        } catch (error) {
            this.logger.error('Erreur lors de la mise à jour de progression', {
                moduleId,
                userId: userProgress.userId,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * Ajoute une tentative de quiz LSF et met à jour la progression
     * @param userProgress - Progression actuelle de l'utilisateur
     * @param quizId - Identifiant du quiz LSF
     * @param attempt - Détails de la tentative (sans quizId et date)
     * @returns Résumé complet des changements
     */
    public addQuizAttempt(
        userProgress: LearningProgress,
        quizId: string,
        attempt: Omit<QuizAttempt, 'quizId' | 'date'>
    ): ProgressUpdateSummary {
        const startTime = performance.now();

        try {
            this.validateQuizAttempt(attempt);

            const previousProgress = this.cloneProgress(userProgress);
            const quizAttempt = this.createQuizAttempt(quizId, attempt);

            // Calcul de l'expérience pour cette tentative
            const experienceCalculation = this.calculateQuizExperience(attempt);

            // Création de la progression mise à jour
            const updatedProgress = this.createUpdatedProgressFromQuiz(
                userProgress,
                quizId,
                quizAttempt,
                experienceCalculation
            );

            // Mise à jour du niveau
            const levelChanges = this.updateUserLevel(updatedProgress);

            // Vérification des nouveaux badges
            const newBadges = this.checkAndAwardBadges(updatedProgress);

            // Enregistrement des métriques
            this.recordQuizMetrics(userProgress.userId, quizId, {
                score: attempt.score,
                timeSpent: attempt.timeSpent,
                experienceGained: experienceCalculation.totalExperience,
                levelUp: levelChanges.levelUp,
                duration: performance.now() - startTime
            });

            this.logger.debug('Tentative de quiz LSF ajoutée', {
                userId: userProgress.userId,
                quizId,
                score: attempt.score,
                experienceGained: experienceCalculation.totalExperience
            });

            return {
                previousProgress,
                updatedProgress,
                levelChanges,
                newBadges,
                experienceGained: experienceCalculation.totalExperience
            };

        } catch (error) {
            this.logger.error('Erreur lors de l\'ajout de tentative de quiz', {
                quizId,
                userId: userProgress.userId,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * Crée une progression vide pour un nouvel utilisateur apprenant la LSF
     * @param userId - Identifiant de l'utilisateur
     * @returns Nouvelle progression utilisateur initialisée
     */
    public createNewUserProgress(userId: string): LearningProgress {
        if (!userId?.trim()) {
            throw new Error('L\'identifiant utilisateur ne peut pas être vide');
        }

        const newProgress: LearningProgress = {
            userId,
            completedModules: [],
            moduleProgress: {},
            quizAttempts: {},
            exerciseAttempts: {},
            earnedBadges: [],
            totalExperience: 0,
            level: 1,
            lastActivityDate: new Date(),
            timeSpent: 0,
            currentModule: '', // Chaîne vide pour respecter exactOptionalPropertyTypes
            interactionHistory: [],
            // Propriétés héritées de LearningPathProgress
            overallProgress: 0,
            inProgressModules: [],
            recommendedNextModules: [],
            conceptsNeedingRevision: [],
            masteredConcepts: [],
            strengths: [],
            gaps: [],
            lastUpdated: new Date()
        };

        this.metricsCollector.recordEvent('user_progress_created', {
            userId,
            initialLevel: newProgress.level,
            timestamp: new Date()
        });

        this.logger.info('Nouvelle progression utilisateur LSF créée', { userId });

        return newProgress;
    }

    /**
     * Calcule le niveau requis pour une quantité d'expérience donnée
     * @param totalExperience - Expérience totale de l'utilisateur
     * @returns Niveau calculé selon la progression LSF
     */
    public calculateLevel(totalExperience: number): number {
        if (totalExperience < 0) {
            return 1;
        }

        let level = 1;
        let experienceRequired = 0;
        let nextLevelExperience = this.config.baseExperienceForLevel;

        while (totalExperience >= experienceRequired + nextLevelExperience) {
            experienceRequired += nextLevelExperience;
            level++;
            nextLevelExperience = Math.floor(nextLevelExperience * this.config.levelGrowthFactor);
        }

        return level;
    }

    /**
     * Calcule l'expérience requise pour atteindre un niveau donné
     * @param targetLevel - Niveau cible dans l'apprentissage LSF
     * @returns Expérience totale requise
     */
    public calculateExperienceForLevel(targetLevel: number): number {
        if (targetLevel <= 1) {
            return 0;
        }

        let totalExperience = 0;
        let levelExperience = this.config.baseExperienceForLevel;

        for (let level = 2; level <= targetLevel; level++) {
            totalExperience += levelExperience;
            levelExperience = Math.floor(levelExperience * this.config.levelGrowthFactor);
        }

        return totalExperience;
    }

    /**
     * Obtient des statistiques détaillées sur la progression LSF d'un utilisateur
     * @param userProgress - Progression de l'utilisateur
     * @returns Statistiques détaillées avec métriques LSF
     */
    public getProgressStatistics(userProgress: LearningProgress): ProgressStatistics {
        const currentLevelExperience = this.calculateExperienceForLevel(userProgress.level);
        const nextLevelExperience = this.calculateExperienceForLevel(userProgress.level + 1);
        const experienceToNextLevel = nextLevelExperience - userProgress.totalExperience;
        const experienceInCurrentLevel = userProgress.totalExperience - currentLevelExperience;
        const experienceNeededForCurrentLevel = nextLevelExperience - currentLevelExperience;
        const progressToNextLevel = experienceNeededForCurrentLevel > 0
            ? (experienceInCurrentLevel / experienceNeededForCurrentLevel) * 100
            : 100;

        // Calcul de la moyenne des scores de quiz LSF
        const allAttempts = Object.values(userProgress.quizAttempts).flat();
        const averageQuizScore = allAttempts.length > 0
            ? allAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / allAttempts.length
            : 0;

        return {
            level: userProgress.level,
            experienceToNextLevel: Math.max(0, experienceToNextLevel),
            progressToNextLevel: Math.min(100, Math.max(0, progressToNextLevel)),
            modulesCompleted: userProgress.completedModules.length,
            totalQuizAttempts: allAttempts.length,
            averageQuizScore: Math.round(averageQuizScore * 100) / 100,
            badgesEarned: userProgress.earnedBadges.length,
            studyTimeHours: Math.round(userProgress.timeSpent / 60 * 100) / 100
        };
    }

    /**
     * Crée la configuration par défaut du système de progression
     * @param config - Configuration partielle fournie
     * @returns Configuration complète avec valeurs par défaut
     */
    private createDefaultConfig(config: Partial<ProgressSystemConfig>): ProgressSystemConfig {
        return {
            baseExperienceMultiplier: 1.0,
            baseExperienceForLevel: 100,
            levelGrowthFactor: 1.2,
            enableTimeBasedBonuses: true,
            ...config
        };
    }

    /**
     * Clone une progression utilisateur pour éviter les mutations
     * @param progress - Progression à cloner
     * @returns Copie profonde de la progression
     */
    private cloneProgress(progress: LearningProgress): LearningProgress {
        return JSON.parse(JSON.stringify(progress)) as LearningProgress;
    }

    /**
     * Crée une progression mise à jour avec les nouvelles données de module
     * @param userProgress - Progression actuelle
     * @param moduleId - Identifiant du module
     * @param progress - Nouvelle progression
     * @returns Progression mise à jour
     */
    private createUpdatedProgress(
        userProgress: LearningProgress,
        moduleId: string,
        progress: number
    ): LearningProgress {
        const previousModuleProgress = userProgress.moduleProgress[moduleId] || 0;

        return {
            ...userProgress,
            moduleProgress: {
                ...userProgress.moduleProgress,
                [moduleId]: Math.max(previousModuleProgress, progress) // Ne jamais régresser
            },
            lastActivityDate: new Date(),
            lastUpdated: new Date()
        };
    }

    /**
     * Met à jour le niveau de l'utilisateur
     * @param progress - Progression utilisateur
     * @returns Informations sur les changements de niveau
     */
    private updateUserLevel(progress: LearningProgress): LevelChanges {
        const oldLevel = progress.level;
        const newLevel = this.calculateLevel(progress.totalExperience);
        const levelUp = newLevel > oldLevel;

        progress.level = newLevel;

        return { oldLevel, newLevel, levelUp };
    }

    /**
     * Met à jour le module actuel de l'utilisateur
     * @param progress - Progression utilisateur
     * @param moduleId - Identifiant du module
     * @param progressValue - Valeur de progression
     */
    private updateCurrentModule(
        progress: LearningProgress,
        moduleId: string,
        progressValue: number
    ): void {
        if (!progress.currentModule && progressValue > 0 && progressValue < 100) {
            progress.currentModule = moduleId;
        }
    }

    /**
     * Vérifie et attribue de nouveaux badges
     * @param progress - Progression utilisateur
     * @returns Liste des nouveaux badges attribués
     */
    private checkAndAwardBadges(progress: LearningProgress): string[] {
        const newBadges = this.badgeManager.checkAndAwardBadges(progress);
        if (newBadges.length > 0) {
            progress.earnedBadges = [...progress.earnedBadges, ...newBadges];
        }
        return newBadges;
    }

    /**
     * Crée un objet QuizAttempt avec timestamp
     * @param quizId - Identifiant du quiz
     * @param attempt - Données de la tentative
     * @returns Tentative de quiz complète
     */
    private createQuizAttempt(
        quizId: string,
        attempt: Omit<QuizAttempt, 'quizId' | 'date'>
    ): QuizAttempt {
        return {
            ...attempt,
            quizId,
            date: new Date()
        };
    }

    /**
     * Crée une progression mise à jour à partir d'une tentative de quiz
     * @param userProgress - Progression actuelle
     * @param quizId - Identifiant du quiz
     * @param quizAttempt - Tentative de quiz
     * @param experienceCalculation - Calcul d'expérience
     * @returns Progression mise à jour
     */
    private createUpdatedProgressFromQuiz(
        userProgress: LearningProgress,
        quizId: string,
        quizAttempt: QuizAttempt,
        experienceCalculation: ExperienceCalculation
    ): LearningProgress {
        const quizAttempts = userProgress.quizAttempts[quizId] || [];

        return {
            ...userProgress,
            quizAttempts: {
                ...userProgress.quizAttempts,
                [quizId]: [...quizAttempts, quizAttempt]
            },
            totalExperience: userProgress.totalExperience + experienceCalculation.totalExperience,
            lastActivityDate: new Date(),
            lastUpdated: new Date(),
            timeSpent: userProgress.timeSpent + Math.floor(quizAttempt.timeSpent / 60),
            interactionHistory: [
                ...userProgress.interactionHistory,
                {
                    type: 'quiz',
                    itemId: quizId,
                    timestamp: new Date(),
                    score: quizAttempt.score
                }
            ]
        };
    }

    /**
     * Enregistre les métriques de progression de module
     * @param userId - Identifiant utilisateur
     * @param moduleId - Identifiant du module
     * @param metrics - Métriques à enregistrer
     */
    private recordProgressMetrics(
        userId: string,
        moduleId: string,
        metrics: {
            previousProgress: number;
            newProgress: number;
            experienceGained: number;
            levelUp: boolean;
            duration: number;
        }
    ): void {
        this.metricsCollector.recordEvent('module_progress_updated', {
            moduleId,
            userId,
            ...metrics,
            timestamp: new Date()
        });
    }

    /**
     * Enregistre les métriques de tentative de quiz
     * @param userId - Identifiant utilisateur
     * @param quizId - Identifiant du quiz
     * @param metrics - Métriques à enregistrer
     */
    private recordQuizMetrics(
        userId: string,
        quizId: string,
        metrics: {
            score: number;
            timeSpent: number;
            experienceGained: number;
            levelUp: boolean;
            duration: number;
        }
    ): void {
        this.metricsCollector.recordEvent('quiz_attempt_added', {
            quizId,
            userId,
            ...metrics,
            timestamp: new Date()
        });
    }

    /**
     * Gère l'achèvement d'un module LSF
     * @param progress - Progression de l'utilisateur
     * @param learningModule - Module complété
     * @returns Expérience gagnée
     */
    private handleModuleCompletion(progress: LearningProgress, learningModule: LearningModule): number {
        if (!progress.completedModules.includes(learningModule.id)) {
            progress.completedModules = [...progress.completedModules, learningModule.id];

            const experienceCalculation = this.calculateModuleExperience(learningModule);

            this.metricsCollector.recordEvent('module_completed', {
                moduleId: learningModule.id,
                userId: progress.userId,
                experienceGained: experienceCalculation.totalExperience,
                timestamp: new Date()
            });

            this.logger.info('Module LSF complété', {
                userId: progress.userId,
                moduleId: learningModule.id,
                experienceGained: experienceCalculation.totalExperience
            });

            return experienceCalculation.totalExperience;
        }

        return 0;
    }

    /**
     * Calcule l'expérience gagnée pour un module LSF complété
     * @param learningModule - Module complété
     * @returns Calcul détaillé de l'expérience
     */
    private calculateModuleExperience(learningModule: LearningModule): ExperienceCalculation {
        const baseExperience = 50 * learningModule.difficulty * this.config.baseExperienceMultiplier;
        const timeBonus = this.config.enableTimeBasedBonuses
            ? Math.floor(learningModule.estimatedTime / 10)
            : 0;
        const skillBonus = learningModule.skills.length * 5;

        return {
            baseExperience,
            performanceBonus: skillBonus,
            timeBonus,
            totalExperience: baseExperience + skillBonus + timeBonus,
            calculationDetails: `Base: ${baseExperience}, Compétences: ${skillBonus}, Temps: ${timeBonus}`
        };
    }

    /**
     * Calcule l'expérience gagnée pour une tentative de quiz LSF
     * @param attempt - Détails de la tentative
     * @returns Calcul détaillé de l'expérience
     */
    private calculateQuizExperience(attempt: Omit<QuizAttempt, 'quizId' | 'date'>): ExperienceCalculation {
        const baseExperience = 10 * this.config.baseExperienceMultiplier;
        const scoreBonus = Math.floor((attempt.score / 100) * 40);
        const timeBonus = this.config.enableTimeBasedBonuses && attempt.timeSpent < 300
            ? 10 // Bonus pour réponse rapide (moins de 5 minutes)
            : 0;

        return {
            baseExperience,
            performanceBonus: scoreBonus,
            timeBonus,
            totalExperience: baseExperience + scoreBonus + timeBonus,
            calculationDetails: `Base: ${baseExperience}, Score: ${scoreBonus}, Rapidité: ${timeBonus}`
        };
    }

    /**
     * Valide les données d'entrée pour la progression
     * @param progress - Valeur de progression à valider
     * @throws {Error} Si les données sont invalides
     */
    private validateProgressInput(progress: number): void {
        if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
            throw new Error('La progression doit être un nombre valide entre 0 et 100');
        }
    }

    /**
     * Valide une tentative de quiz LSF
     * @param attempt - Tentative à valider
     * @throws {Error} Si les données sont invalides
     */
    private validateQuizAttempt(attempt: Omit<QuizAttempt, 'quizId' | 'date'>): void {
        if (!Number.isFinite(attempt.score) || attempt.score < 0 || attempt.score > 100) {
            throw new Error('Le score doit être un nombre valide entre 0 et 100');
        }

        if (!Number.isFinite(attempt.timeSpent) || attempt.timeSpent < 0) {
            throw new Error('Le temps passé doit être un nombre positif');
        }

        if (!Number.isInteger(attempt.correctAnswers) || attempt.correctAnswers < 0) {
            throw new Error('Le nombre de réponses correctes doit être un entier positif');
        }

        if (!Number.isInteger(attempt.totalQuestions) || attempt.totalQuestions < 0) {
            throw new Error('Le nombre total de questions doit être un entier positif');
        }

        if (attempt.correctAnswers > attempt.totalQuestions) {
            throw new Error('Le nombre de réponses correctes ne peut pas dépasser le total');
        }
    }
}