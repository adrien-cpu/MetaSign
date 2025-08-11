/**
 * Gestionnaire de progression pour les parcours d'apprentissage personnalisés - Version refactorisée
 * 
 * @file src/ai/services/learning/personalization/managers/PathProgressManager.ts
 * @module ai/services/learning/personalization/managers
 * @description Gestionnaire spécialisé pour le suivi et la mise à jour de la progression - Version modulaire
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import type {
    PersonalizedLearningPathModel,
    LearningPathStep,
    PathStatistics,
    PathAdaptationResult,
    StepStatus
} from '../types/LearningPathTypes';
import { LEARNING_PATH_CONSTANTS } from '../types/LearningPathTypes';
import { ProgressCalculator } from './ProgressCalculator';
import { PathStatisticsGenerator } from './PathStatisticsGenerator';
import { Logger } from '@/ai/utils/Logger';

/**
 * Configuration pour le gestionnaire de progression
 */
interface ProgressManagerConfig {
    /**
     * Seuil minimum de progression pour débloquer les étapes suivantes
     */
    readonly progressThreshold: number;

    /**
     * Activer l'adaptation automatique
     */
    readonly enableAutoAdaptation: boolean;

    /**
     * Intervalle de sauvegarde automatique (ms)
     */
    readonly autoSaveInterval: number;

    /**
     * Générer des statistiques étendues
     */
    readonly generateExtendedStatistics: boolean;
}

/**
 * Résultat d'une mise à jour de progression
 */
export interface ProgressUpdateResult {
    /**
     * Parcours mis à jour
     */
    readonly updatedPath: PersonalizedLearningPathModel;

    /**
     * Étapes débloquées suite à la mise à jour
     */
    readonly unlockedSteps: readonly string[];

    /**
     * Parcours terminé
     */
    readonly isCompleted: boolean;

    /**
     * Progression précédente
     */
    readonly previousProgress: number;

    /**
     * Nouvelle progression
     */
    readonly newProgress: number;

    /**
     * Horodatage de la mise à jour
     */
    readonly timestamp: Date;
}

/**
 * Configuration par défaut
 */
const DEFAULT_PROGRESS_CONFIG: ProgressManagerConfig = {
    progressThreshold: LEARNING_PATH_CONSTANTS.MIN_PROGRESS_THRESHOLD,
    enableAutoAdaptation: true,
    autoSaveInterval: 30000,
    generateExtendedStatistics: false
} as const;

/**
 * Gestionnaire de progression des parcours d'apprentissage - Version refactorisée
 * 
 * @example
 * ```typescript
 * const manager = new PathProgressManager({
 *     enableAutoAdaptation: true,
 *     generateExtendedStatistics: true
 * });
 * ```
 */
export class PathProgressManager {
    private readonly logger = Logger.getInstance('PathProgressManager');
    private readonly config: ProgressManagerConfig;
    private readonly progressCalculator: ProgressCalculator;
    private readonly statisticsGenerator: PathStatisticsGenerator;

    /**
     * Constructeur du gestionnaire de progression
     * 
     * @param config Configuration du gestionnaire (optionnelle)
     * @param progressCalculator Instance du calculateur de progression (optionnelle)
     * @param statisticsGenerator Instance du générateur de statistiques (optionnelle)
     * 
     * @example
     * ```typescript
     * const manager = new PathProgressManager({
     *     progressThreshold: 0.8,
     *     enableAutoAdaptation: true
     * });
     * ```
     */
    constructor(
        config?: Partial<ProgressManagerConfig>,
        progressCalculator?: ProgressCalculator,
        statisticsGenerator?: PathStatisticsGenerator
    ) {
        this.config = { ...DEFAULT_PROGRESS_CONFIG, ...config };
        this.progressCalculator = progressCalculator || new ProgressCalculator();
        this.statisticsGenerator = statisticsGenerator || new PathStatisticsGenerator({
            includePerformanceMetrics: this.config.generateExtendedStatistics,
            includeCompletionPredictions: this.config.generateExtendedStatistics
        });

        this.logger.info('PathProgressManager initialisé', this.config);
    }

    /**
     * Met à jour la progression d'un parcours après qu'une étape soit complétée
     * 
     * @param path Parcours d'apprentissage
     * @param stepId Identifiant de l'étape complétée
     * @param success Indique si l'étape a été complétée avec succès
     * @returns Résultat de la mise à jour
     * 
     * @example
     * ```typescript
     * const result = manager.updateProgress(path, 'step-123', true);
     * console.log(`Progression: ${result.newProgress * 100}%`);
     * ```
     */
    public updateProgress(
        path: PersonalizedLearningPathModel,
        stepId: string,
        success: boolean
    ): ProgressUpdateResult {
        this.logger.info('Mise à jour de la progression', {
            pathId: path.id,
            stepId,
            success
        });

        const previousProgress = path.overallProgress;

        try {
            // Créer une copie mutable du parcours pour les modifications
            const mutablePath = this.createMutablePath(path);

            // Valider et mettre à jour l'étape
            this.updateStepStatus(mutablePath, stepId, success);

            // Recalculer la progression globale
            const newProgress = this.progressCalculator.calculateOverallProgress(mutablePath);
            mutablePath.overallProgress = newProgress;

            // Vérifier si le parcours est terminé
            const isCompleted = newProgress >= 1;
            if (isCompleted && !mutablePath.actualEndDate) {
                mutablePath.actualEndDate = new Date();
            }

            // Mettre à jour le statut des autres étapes
            const statusUpdateResult = this.progressCalculator.updateStepsStatus(mutablePath.steps);

            // Mettre à jour la date de dernière modification
            mutablePath.updatedAt = new Date();

            // Appliquer les modifications au parcours original
            Object.assign(path, mutablePath);

            const result: ProgressUpdateResult = {
                updatedPath: path,
                unlockedSteps: statusUpdateResult.unlockedSteps,
                isCompleted,
                previousProgress,
                newProgress,
                timestamp: new Date()
            };

            this.logger.info('Progression mise à jour avec succès', {
                pathId: path.id,
                previousProgress: Math.round(previousProgress * 100) / 100,
                newProgress: Math.round(newProgress * 100) / 100,
                unlockedSteps: statusUpdateResult.unlockedSteps.length,
                isCompleted
            });

            return result;

        } catch (error) {
            this.logger.error('Erreur lors de la mise à jour de la progression', {
                pathId: path.id,
                stepId,
                error
            });
            throw new Error(`Échec de la mise à jour de progression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    /**
     * Met à jour le statut de toutes les étapes d'un parcours
     * 
     * @param path Parcours d'apprentissage (mutable)
     * @returns Identifiants des étapes débloquées
     * 
     * @example
     * ```typescript
     * const unlockedSteps = manager.updateStepsStatus(path);
     * console.log(`${unlockedSteps.length} étapes débloquées`);
     * ```
     */
    public updateStepsStatus(path: MutablePersonalizedLearningPathModel): string[] {
        const statusUpdateResult = this.progressCalculator.updateStepsStatus(path.steps);
        return Array.from(statusUpdateResult.unlockedSteps);
    }

    /**
     * Calcule la progression globale d'un parcours
     * 
     * @param path Parcours d'apprentissage
     * @returns Progression globale (0-1)
     * 
     * @example
     * ```typescript
     * const progress = manager.calculateOverallProgress(path);
     * console.log(`Progression: ${(progress * 100).toFixed(1)}%`);
     * ```
     */
    public calculateOverallProgress(path: PersonalizedLearningPathModel | MutablePersonalizedLearningPathModel): number {
        return this.progressCalculator.calculateOverallProgress(path);
    }

    /**
     * Génère des statistiques détaillées sur un parcours
     * 
     * @param path Parcours d'apprentissage
     * @returns Statistiques du parcours
     * 
     * @example
     * ```typescript
     * const stats = manager.generatePathStatistics(path);
     * console.log(`${stats.completedSteps}/${stats.totalSteps} étapes complétées`);
     * ```
     */
    public generatePathStatistics(path: PersonalizedLearningPathModel): PathStatistics {
        if (this.config.generateExtendedStatistics) {
            return this.statisticsGenerator.generateExtendedStatistics(path);
        }

        return this.statisticsGenerator.generatePathStatistics(path);
    }

    /**
     * Adapte un parcours en fonction des performances récentes
     * 
     * @param path Parcours d'apprentissage
     * @param strengthAreas Domaines de force identifiés
     * @param weaknessAreas Domaines de faiblesse identifiés
     * @returns Résultat de l'adaptation
     * 
     * @example
     * ```typescript
     * const result = manager.adaptPath(path, ['vocabulary'], ['grammar']);
     * console.log(`${result.changes.length} changements appliqués`);
     * ```
     */
    public adaptPath(
        path: PersonalizedLearningPathModel,
        strengthAreas: readonly string[],
        weaknessAreas: readonly string[]
    ): PathAdaptationResult {
        if (!this.config.enableAutoAdaptation) {
            return this.createNoAdaptationResult(path);
        }

        this.logger.info('Adaptation du parcours', {
            pathId: path.id,
            strengthAreas: strengthAreas.length,
            weaknessAreas: weaknessAreas.length
        });

        try {
            const changes: string[] = [];
            const reasons: string[] = [];

            // Créer une copie mutable pour les modifications
            const mutablePath = this.createMutablePath(path);

            // Appliquer les adaptations
            this.applyStrengthBasedAdaptations(mutablePath, strengthAreas, changes, reasons);
            this.applyWeaknessBasedAdaptations(mutablePath, weaknessAreas, changes, reasons);

            // Réorganiser les étapes par priorité si des changements ont été apportés
            if (changes.length > 0) {
                this.reorderStepsByPriority(mutablePath.steps);
                changes.push('Étapes réorganisées par priorité mise à jour');
                mutablePath.updatedAt = new Date();
            }

            // Appliquer les modifications au parcours original
            Object.assign(path, mutablePath);

            const result: PathAdaptationResult = {
                adaptedPath: path,
                changes,
                reasons,
                timestamp: new Date()
            };

            this.logger.info('Adaptation du parcours terminée', {
                pathId: path.id,
                changesCount: changes.length,
                reasonsCount: reasons.length
            });

            return result;

        } catch (error) {
            this.logger.error('Erreur lors de l\'adaptation du parcours', {
                pathId: path.id,
                error
            });
            throw new Error(`Adaptation du parcours échouée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    /**
     * Crée une copie mutable d'un parcours pour permettre les modifications
     * 
     * @param path Parcours d'apprentissage en lecture seule
     * @returns Copie mutable du parcours
     * @private
     */
    private createMutablePath(path: PersonalizedLearningPathModel): MutablePersonalizedLearningPathModel {
        return {
            ...path,
            steps: path.steps.map(step => ({ ...step }))
        };
    }

    /**
     * Met à jour le statut d'une étape spécifique
     * 
     * @param path Parcours mutable
     * @param stepId Identifiant de l'étape
     * @param success Succès de la completion
     * @throws {Error} Si l'étape n'est pas trouvée
     * @private
     */
    private updateStepStatus(path: MutablePersonalizedLearningPathModel, stepId: string, success: boolean): void {
        const stepIndex = path.steps.findIndex(step => step.id === stepId);

        if (stepIndex === -1) {
            throw new Error(`Étape non trouvée: ${stepId}`);
        }

        // Mettre à jour le statut de l'étape
        path.steps[stepIndex] = {
            ...path.steps[stepIndex],
            status: 'completed'
        };
    }

    /**
     * Applique les adaptations basées sur les forces
     * 
     * @param path Parcours mutable
     * @param strengthAreas Domaines de force
     * @param changes Liste des changements
     * @param reasons Liste des raisons
     * @private
     */
    private applyStrengthBasedAdaptations(
        path: MutablePersonalizedLearningPathModel,
        strengthAreas: readonly string[],
        changes: string[],
        reasons: string[]
    ): void {
        for (let i = 0; i < path.steps.length; i++) {
            const step = path.steps[i];

            if (step.status === 'pending' || step.status === 'available') {
                const targetSkills = step.targetSkills.map(this.normalizeSkillName);
                const hasOnlyStrengths = targetSkills.every(skill => strengthAreas.includes(skill)) &&
                    targetSkills.length > 0;

                if (hasOnlyStrengths) {
                    path.steps[i] = {
                        ...step,
                        priority: step.priority - 1,
                        difficulty: Math.max(0, Math.min(1, step.difficulty + 0.1))
                    };
                    changes.push(`Étape "${step.title}": priorité diminuée, difficulté augmentée`);
                    reasons.push(`Cible uniquement des forces: ${targetSkills.join(', ')}`);
                }
            }
        }
    }

    /**
     * Applique les adaptations basées sur les faiblesses
     * 
     * @param path Parcours mutable
     * @param weaknessAreas Domaines de faiblesse
     * @param changes Liste des changements
     * @param reasons Liste des raisons
     * @private
     */
    private applyWeaknessBasedAdaptations(
        path: MutablePersonalizedLearningPathModel,
        weaknessAreas: readonly string[],
        changes: string[],
        reasons: string[]
    ): void {
        for (let i = 0; i < path.steps.length; i++) {
            const step = path.steps[i];

            if (step.status === 'pending' || step.status === 'available') {
                const targetSkills = step.targetSkills.map(this.normalizeSkillName);
                const hasWeakness = targetSkills.some(skill => weaknessAreas.includes(skill));

                if (hasWeakness) {
                    path.steps[i] = {
                        ...step,
                        priority: step.priority + 2,
                        difficulty: Math.max(0, Math.min(1, step.difficulty - 0.1))
                    };
                    changes.push(`Étape "${step.title}": priorité augmentée, difficulté réduite`);
                    reasons.push(`Cible des faiblesses détectées: ${targetSkills.join(', ')}`);
                }
            }
        }
    }

    /**
     * Réorganise les étapes par priorité
     * 
     * @param steps Liste mutable des étapes
     * @private
     */
    private reorderStepsByPriority(steps: Array<Omit<LearningPathStep, 'status' | 'priority'> & { status: StepStatus; priority: number }>): void {
        steps.sort((a, b) => {
            // D'abord par statut
            const statusOrder: Record<StepStatus, number> = {
                'available': 0,
                'pending': 1,
                'locked': 2,
                'completed': 3
            };
            const statusDiff = statusOrder[a.status] - statusOrder[b.status];

            if (statusDiff !== 0) {
                return statusDiff;
            }

            // Ensuite par priorité (décroissante)
            return b.priority - a.priority;
        });
    }

    /**
     * Crée un résultat pour indiquer qu'aucune adaptation n'a été effectuée
     * 
     * @param path Parcours d'apprentissage
     * @returns Résultat sans adaptation
     * @private
     */
    private createNoAdaptationResult(path: PersonalizedLearningPathModel): PathAdaptationResult {
        return {
            adaptedPath: path,
            changes: [],
            reasons: ['Adaptation automatique désactivée'],
            timestamp: new Date()
        };
    }

    /**
     * Normalise le nom d'une compétence
     * 
     * @param skillName Nom de la compétence
     * @returns Nom normalisé
     * @private
     */
    private normalizeSkillName(skillName: string): string {
        return skillName.toLowerCase().trim();
    }
}

/**
 * Type utilitaire pour créer une version mutable d'un parcours
 */
type MutablePersonalizedLearningPathModel = Omit<PersonalizedLearningPathModel, 'steps'> & {
    steps: Array<Omit<LearningPathStep, 'status' | 'priority' | 'difficulty'> & {
        status: StepStatus;
        priority: number;
        difficulty: number;
    }>;
    overallProgress: number;
    updatedAt: Date;
    actualEndDate?: Date;
};