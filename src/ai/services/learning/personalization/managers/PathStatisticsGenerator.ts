/**
 * Générateur de statistiques pour les parcours d'apprentissage personnalisés
 * 
 * @file src/ai/services/learning/personalization/managers/PathStatisticsGenerator.ts
 * @module ai/services/learning/personalization/managers
 * @description Service spécialisé pour la génération de statistiques détaillées des parcours
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import type {
    PersonalizedLearningPathModel,
    LearningPathStep,
    PathStatistics,
    StepStatus,
    StepType
} from '../types/LearningPathTypes';
import { ProgressCalculator } from './ProgressCalculator';
import { Logger } from '@/ai/utils/Logger';

/**
 * Configuration pour la génération de statistiques
 */
interface StatisticsGenerationConfig {
    /**
     * Inclure les métriques de performance détaillées
     */
    readonly includePerformanceMetrics: boolean;

    /**
     * Inclure les prédictions de completion
     */
    readonly includeCompletionPredictions: boolean;

    /**
     * Inclure l'analyse des compétences
     */
    readonly includeSkillsAnalysis: boolean;

    /**
     * Seuil pour identifier les compétences difficiles (0-1)
     */
    readonly difficultyThreshold: number;
}

/**
 * Configuration par défaut
 */
const DEFAULT_STATISTICS_CONFIG: StatisticsGenerationConfig = {
    includePerformanceMetrics: true,
    includeCompletionPredictions: false,
    includeSkillsAnalysis: true,
    difficultyThreshold: 0.7
} as const;

/**
 * Métriques de performance détaillées
 */
interface PerformanceMetrics {
    readonly averageStepDuration: number;
    readonly completionVelocity: number; // étapes par jour
    readonly difficultyTrend: 'increasing' | 'decreasing' | 'stable';
    readonly criticStepsCompleted: number;
    readonly optimizationSuggestions: readonly string[];
}

/**
 * Analyse des compétences
 */
interface SkillsAnalysis {
    readonly totalSkills: number;
    readonly masteredSkills: readonly string[];
    readonly difficultSkills: readonly string[];
    readonly skillsInProgress: readonly string[];
    readonly skillsNotStarted: readonly string[];
    readonly skillsMasteryRate: number;
}

/**
 * Prédictions de completion
 */
interface CompletionPredictions {
    readonly estimatedCompletionDate: Date;
    readonly confidenceLevel: number; // 0-1
    readonly remainingDaysEstimate: number;
    readonly completionProbability: number; // 0-1
    readonly riskFactors: readonly string[];
}

/**
 * Statistiques étendues avec analyses avancées
 */
export interface ExtendedPathStatistics extends PathStatistics {
    readonly performanceMetrics?: PerformanceMetrics;
    readonly skillsAnalysis?: SkillsAnalysis;
    readonly completionPredictions?: CompletionPredictions;
    readonly generationTimestamp: Date;
    readonly configUsed: StatisticsGenerationConfig;
}

/**
 * Générateur de statistiques pour les parcours d'apprentissage
 */
export class PathStatisticsGenerator {
    private readonly logger = Logger.getInstance('PathStatisticsGenerator');
    private readonly config: StatisticsGenerationConfig;
    private readonly progressCalculator: ProgressCalculator;

    /**
     * Constructeur du générateur de statistiques
     * 
     * @param config Configuration du générateur (optionnelle)
     * @param progressCalculator Instance du calculateur de progression (optionnelle)
     * 
     * @example
     * ```typescript
     * const generator = new PathStatisticsGenerator({
     *     includePerformanceMetrics: true,
     *     includeCompletionPredictions: true
     * });
     * ```
     */
    constructor(
        config?: Partial<StatisticsGenerationConfig>,
        progressCalculator?: ProgressCalculator
    ) {
        this.config = { ...DEFAULT_STATISTICS_CONFIG, ...config };
        this.progressCalculator = progressCalculator || new ProgressCalculator();

        this.logger.info('PathStatisticsGenerator initialisé', this.config);
    }

    /**
     * Génère des statistiques complètes pour un parcours
     * 
     * @param path Parcours d'apprentissage
     * @returns Statistiques détaillées du parcours
     * 
     * @example
     * ```typescript
     * const stats = generator.generatePathStatistics(path);
     * console.log(`${stats.completedSteps}/${stats.totalSteps} étapes complétées`);
     * ```
     */
    public generatePathStatistics(path: PersonalizedLearningPathModel): PathStatistics {
        this.logger.debug('Génération des statistiques de parcours', { pathId: path.id });

        const startTime = Date.now();

        try {
            // Statistiques de base
            const baseStatistics = this.generateBaseStatistics(path);

            this.logger.debug('Statistiques de base générées', {
                pathId: path.id,
                generationTime: Date.now() - startTime,
                totalSteps: baseStatistics.totalSteps,
                completedSteps: baseStatistics.completedSteps
            });

            return baseStatistics;

        } catch (error) {
            this.logger.error('Erreur lors de la génération des statistiques', {
                pathId: path.id,
                error
            });
            throw new Error(`Génération des statistiques échouée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    /**
     * Génère des statistiques étendues avec analyses avancées
     * 
     * @param path Parcours d'apprentissage
     * @returns Statistiques étendues du parcours
     * 
     * @example
     * ```typescript
     * const extendedStats = generator.generateExtendedStatistics(path);
     * console.log(`Vélocité: ${extendedStats.performanceMetrics?.completionVelocity} étapes/jour`);
     * ```
     */
    public generateExtendedStatistics(path: PersonalizedLearningPathModel): ExtendedPathStatistics {
        this.logger.debug('Génération des statistiques étendues', { pathId: path.id });

        const startTime = Date.now();

        try {
            // Statistiques de base
            const baseStatistics = this.generateBaseStatistics(path);

            // Analyses avancées selon la configuration
            const performanceMetrics = this.config.includePerformanceMetrics
                ? this.generatePerformanceMetrics(path)
                : undefined;

            const skillsAnalysis = this.config.includeSkillsAnalysis
                ? this.generateSkillsAnalysis(path)
                : undefined;

            const completionPredictions = this.config.includeCompletionPredictions
                ? this.generateCompletionPredictions(path)
                : undefined;

            const extendedStatistics: ExtendedPathStatistics = {
                ...baseStatistics,
                performanceMetrics,
                skillsAnalysis,
                completionPredictions,
                generationTimestamp: new Date(),
                configUsed: this.config
            };

            this.logger.info('Statistiques étendues générées avec succès', {
                pathId: path.id,
                generationTime: Date.now() - startTime,
                includesPerformance: !!performanceMetrics,
                includesSkills: !!skillsAnalysis,
                includesPredictions: !!completionPredictions
            });

            return extendedStatistics;

        } catch (error) {
            this.logger.error('Erreur lors de la génération des statistiques étendues', {
                pathId: path.id,
                error
            });
            throw new Error(`Génération des statistiques étendues échouée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    /**
     * Génère des statistiques de base pour un parcours
     * 
     * @param path Parcours d'apprentissage
     * @returns Statistiques de base
     * @private
     */
    private generateBaseStatistics(path: PersonalizedLearningPathModel): PathStatistics {
        const totalSteps = path.steps.length;
        const completedSteps = path.steps.filter(step => step.status === 'completed').length;

        // Calcul des durées
        const totalEstimatedDuration = path.steps.reduce((sum, step) => sum + step.estimatedDuration, 0);
        const remainingSteps = path.steps.filter(step => step.status !== 'completed');
        const remainingEstimatedDuration = remainingSteps.reduce((sum, step) => sum + step.estimatedDuration, 0);

        // Répartitions
        const stepDistribution = this.progressCalculator.calculateStepDistribution(path.steps);
        const statusDistribution = this.progressCalculator.calculateStatusDistribution(path.steps);

        // Compétences couvertes
        const coveredSkills = this.extractCoveredSkills(path.steps);

        // Date de dernière activité
        const lastActivity = this.determineLastActivity(path);

        return {
            totalSteps,
            completedSteps,
            progress: path.overallProgress,
            totalEstimatedDuration,
            remainingEstimatedDuration,
            stepDistribution,
            statusDistribution,
            coveredSkills,
            lastActivity
        };
    }

    /**
     * Génère les métriques de performance
     * 
     * @param path Parcours d'apprentissage
     * @returns Métriques de performance
     * @private
     */
    private generatePerformanceMetrics(path: PersonalizedLearningPathModel): PerformanceMetrics {
        const completedSteps = path.steps.filter(step => step.status === 'completed');
        const totalDuration = completedSteps.reduce((sum, step) => sum + step.estimatedDuration, 0);
        const averageStepDuration = completedSteps.length > 0 ? totalDuration / completedSteps.length : 0;

        // Calcul de la vélocité (étapes par jour)
        const daysSinceStart = this.calculateDaysSinceStart(path);
        const completionVelocity = daysSinceStart > 0 ? completedSteps.length / daysSinceStart : 0;

        // Tendance de difficulté
        const difficultyTrend = this.analyzeDifficultyTrend(completedSteps);

        // Étapes critiques complétées
        const criticalSteps = this.progressCalculator.identifyCriticalSteps(path.steps);
        const criticStepsCompleted = criticalSteps.filter(stepId =>
            path.steps.find(step => step.id === stepId)?.status === 'completed'
        ).length;

        // Suggestions d'optimisation
        const optimizationSuggestions = this.generateOptimizationSuggestions(path);

        return {
            averageStepDuration,
            completionVelocity,
            difficultyTrend,
            criticStepsCompleted,
            optimizationSuggestions
        };
    }

    /**
     * Génère l'analyse des compétences
     * 
     * @param path Parcours d'apprentissage
     * @returns Analyse des compétences
     * @private
     */
    private generateSkillsAnalysis(path: PersonalizedLearningPathModel): SkillsAnalysis {
        const allSkills = this.extractAllSkills(path.steps);
        const totalSkills = allSkills.length;

        // Analyser le statut de chaque compétence
        const masteredSkills: string[] = [];
        const difficultSkills: string[] = [];
        const skillsInProgress: string[] = [];
        const skillsNotStarted: string[] = [];

        for (const skill of allSkills) {
            const skillSteps = path.steps.filter(step => step.targetSkills.includes(skill));
            const completedSkillSteps = skillSteps.filter(step => step.status === 'completed');
            const inProgressSkillSteps = skillSteps.filter(step => step.status === 'available');

            // Déterminer le statut de la compétence
            if (completedSkillSteps.length === skillSteps.length) {
                masteredSkills.push(skill);
            } else if (completedSkillSteps.length > 0 || inProgressSkillSteps.length > 0) {
                const averageDifficulty = skillSteps.reduce((sum, step) => sum + step.difficulty, 0) / skillSteps.length;
                if (averageDifficulty >= this.config.difficultyThreshold) {
                    difficultSkills.push(skill);
                } else {
                    skillsInProgress.push(skill);
                }
            } else {
                skillsNotStarted.push(skill);
            }
        }

        const skillsMasteryRate = totalSkills > 0 ? masteredSkills.length / totalSkills : 0;

        return {
            totalSkills,
            masteredSkills,
            difficultSkills,
            skillsInProgress,
            skillsNotStarted,
            skillsMasteryRate
        };
    }

    /**
     * Génère les prédictions de completion
     * 
     * @param path Parcours d'apprentissage
     * @returns Prédictions de completion
     * @private
     */
    private generateCompletionPredictions(path: PersonalizedLearningPathModel): CompletionPredictions {
        const remainingSteps = path.steps.filter(step => step.status !== 'completed');
        const completedSteps = path.steps.filter(step => step.status === 'completed');

        // Estimation basée sur la vélocité actuelle
        const daysSinceStart = this.calculateDaysSinceStart(path);
        const currentVelocity = daysSinceStart > 0 ? completedSteps.length / daysSinceStart : 1;

        const remainingDaysEstimate = currentVelocity > 0 ? remainingSteps.length / currentVelocity : 0;
        const estimatedCompletionDate = new Date(Date.now() + remainingDaysEstimate * 24 * 60 * 60 * 1000);

        // Calcul du niveau de confiance
        const confidenceLevel = this.calculateConfidenceLevel(path, currentVelocity);

        // Probabilité de completion
        const completionProbability = this.calculateCompletionProbability(path);

        // Facteurs de risque
        const riskFactors = this.identifyRiskFactors(path);

        return {
            estimatedCompletionDate,
            confidenceLevel,
            remainingDaysEstimate: Math.ceil(remainingDaysEstimate),
            completionProbability,
            riskFactors
        };
    }

    /**
     * Extrait toutes les compétences couvertes par les étapes
     * 
     * @param steps Liste des étapes
     * @returns Liste des compétences uniques
     * @private
     */
    private extractCoveredSkills(steps: readonly LearningPathStep[]): readonly string[] {
        const skillsSet = new Set<string>();

        for (const step of steps) {
            for (const skill of step.targetSkills) {
                skillsSet.add(skill);
            }
        }

        return Array.from(skillsSet).sort();
    }

    /**
     * Extrait toutes les compétences présentes dans le parcours
     * 
     * @param steps Liste des étapes
     * @returns Liste de toutes les compétences
     * @private
     */
    private extractAllSkills(steps: readonly LearningPathStep[]): readonly string[] {
        return this.extractCoveredSkills(steps);
    }

    /**
     * Détermine la date de dernière activité
     * 
     * @param path Parcours d'apprentissage
     * @returns Date de dernière activité ou undefined
     * @private
     */
    private determineLastActivity(path: PersonalizedLearningPathModel): Date | undefined {
        const completedStepsCount = path.steps.filter(step => step.status === 'completed').length;

        if (path.actualEndDate) {
            return path.actualEndDate;
        }

        if (completedStepsCount > 0) {
            return path.updatedAt;
        }

        return undefined;
    }

    /**
     * Calcule le nombre de jours depuis le début du parcours
     * 
     * @param path Parcours d'apprentissage
     * @returns Nombre de jours depuis le début
     * @private
     */
    private calculateDaysSinceStart(path: PersonalizedLearningPathModel): number {
        if (!path.startDate) {
            return 0;
        }

        const now = Date.now();
        const startTime = path.startDate.getTime();
        const diffMs = now - startTime;

        return Math.max(0, diffMs / (24 * 60 * 60 * 1000));
    }

    /**
     * Analyse la tendance de difficulté des étapes complétées
     * 
     * @param completedSteps Étapes complétées
     * @returns Tendance de difficulté
     * @private
     */
    private analyzeDifficultyTrend(completedSteps: readonly LearningPathStep[]): 'increasing' | 'decreasing' | 'stable' {
        if (completedSteps.length < 3) {
            return 'stable';
        }

        const recentSteps = completedSteps.slice(-3);
        const averageDifficulty = recentSteps.reduce((sum, step) => sum + step.difficulty, 0) / recentSteps.length;

        const olderSteps = completedSteps.slice(-6, -3);
        if (olderSteps.length === 0) {
            return 'stable';
        }

        const olderAverageDifficulty = olderSteps.reduce((sum, step) => sum + step.difficulty, 0) / olderSteps.length;

        const diffThreshold = 0.1;
        if (averageDifficulty > olderAverageDifficulty + diffThreshold) {
            return 'increasing';
        } else if (averageDifficulty < olderAverageDifficulty - diffThreshold) {
            return 'decreasing';
        } else {
            return 'stable';
        }
    }

    /**
     * Génère des suggestions d'optimisation
     * 
     * @param path Parcours d'apprentissage
     * @returns Liste de suggestions
     * @private
     */
    private generateOptimizationSuggestions(path: PersonalizedLearningPathModel): readonly string[] {
        const suggestions: string[] = [];

        // Analyser la vélocité
        const daysSinceStart = this.calculateDaysSinceStart(path);
        const completedSteps = path.steps.filter(step => step.status === 'completed').length;
        const velocity = daysSinceStart > 0 ? completedSteps / daysSinceStart : 0;

        if (velocity < 0.5) {
            suggestions.push('Considérer réduire la difficulté ou augmenter l\'assistance');
        }

        // Analyser les étapes bloquées
        const lockedSteps = path.steps.filter(step => step.status === 'locked').length;
        if (lockedSteps > path.steps.length * 0.6) {
            suggestions.push('Revoir les prérequis pour débloquer plus d\'étapes');
        }

        // Analyser les étapes critiques non complétées
        const criticalSteps = this.progressCalculator.identifyCriticalSteps(path.steps);
        const pendingCriticalSteps = criticalSteps.filter(stepId =>
            path.steps.find(step => step.id === stepId)?.status !== 'completed'
        );

        if (pendingCriticalSteps.length > 0) {
            suggestions.push('Prioriser les étapes critiques pour maximiser la progression');
        }

        return suggestions;
    }

    /**
     * Calcule le niveau de confiance pour les prédictions
     * 
     * @param path Parcours d'apprentissage
     * @param currentVelocity Vélocité actuelle
     * @returns Niveau de confiance (0-1)
     * @private
     */
    private calculateConfidenceLevel(path: PersonalizedLearningPathModel, currentVelocity: number): number {
        const completedSteps = path.steps.filter(step => step.status === 'completed').length;

        // Plus on a de données, plus la confiance est élevée
        const dataConfidence = Math.min(1, completedSteps / 10);

        // Vélocité stable augmente la confiance
        const velocityConfidence = currentVelocity > 0.1 ? 0.8 : 0.3;

        return (dataConfidence + velocityConfidence) / 2;
    }

    /**
     * Calcule la probabilité de completion du parcours
     * 
     * @param path Parcours d'apprentissage
     * @returns Probabilité de completion (0-1)
     * @private
     */
    private calculateCompletionProbability(path: PersonalizedLearningPathModel): number {
        const progressFactor = path.overallProgress;
        const remainingSteps = path.steps.filter(step => step.status !== 'completed').length;
        const totalSteps = path.steps.length;

        // Plus on est avancé, plus la probabilité est élevée
        const progressWeight = 0.6;
        const momentumWeight = 0.4;

        const momentum = totalSteps > 0 ? (totalSteps - remainingSteps) / totalSteps : 0;

        return (progressFactor * progressWeight) + (momentum * momentumWeight);
    }

    /**
     * Identifie les facteurs de risque pour la completion
     * 
     * @param path Parcours d'apprentissage
     * @returns Liste des facteurs de risque
     * @private
     */
    private identifyRiskFactors(path: PersonalizedLearningPathModel): readonly string[] {
        const riskFactors: string[] = [];

        // Analyser la stagnation
        const daysSinceStart = this.calculateDaysSinceStart(path);
        const completedSteps = path.steps.filter(step => step.status === 'completed').length;

        if (daysSinceStart > 7 && completedSteps === 0) {
            riskFactors.push('Aucune progression depuis plus d\'une semaine');
        }

        // Analyser la complexité restante
        const remainingSteps = path.steps.filter(step => step.status !== 'completed');
        const averageRemainingDifficulty = remainingSteps.length > 0
            ? remainingSteps.reduce((sum, step) => sum + step.difficulty, 0) / remainingSteps.length
            : 0;

        if (averageRemainingDifficulty > 0.7) {
            riskFactors.push('Étapes restantes de difficulté élevée');
        }

        return riskFactors;
    }
}