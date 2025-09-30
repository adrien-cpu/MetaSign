/**
 * Gestionnaire de progression pour les parcours d'apprentissage personnalisés
 * 
 * @file src/ai/services/learning/personalization/managers/PathProgressManager.ts
 * @module ai/services/learning/personalization/managers
 * @description Gestion de la progression, adaptation et statistiques des parcours d'apprentissage LSF
 * Compatible avec exactOptionalPropertyTypes: true et respecte la limite de 300 lignes
 * @author MetaSign Learning Team
 * @version 1.0.0
 * @since 2025
 * @lastModified 2025-01-22
 */

import type {
    PersonalizedLearningPathModel,
    LearningPathStep,
    PathStatistics,
    StepStatus
} from '@learning/types/LearningPathTypes';

import { Logger } from '@ai/utils/Logger';

/**
 * Configuration du gestionnaire de progression
 */
interface ProgressManagerConfig {
    /** Activer l'adaptation automatique */
    readonly enableAutoAdaptation: boolean;
    /** Seuil de réussite pour débloquer l'étape suivante (0-1) */
    readonly unlockThreshold: number;
    /** Nombre maximum de tentatives par étape */
    readonly maxAttempts: number;
}

/**
 * Résultat de mise à jour de progression
 */
interface ProgressUpdateResult {
    /** Parcours mis à jour */
    readonly updatedPath: PersonalizedLearningPathModel;
    /** Nouvelle progression globale */
    readonly newProgress: number;
    /** Étapes débloquées */
    readonly unlockedSteps: readonly string[];
    /** Parcours terminé */
    readonly isCompleted: boolean;
    /** Messages informatifs */
    readonly messages: readonly string[];
}

/**
 * Résultat d'adaptation de parcours
 */
interface PathAdaptationResult {
    /** Parcours adapté */
    readonly adaptedPath: PersonalizedLearningPathModel;
    /** Liste des changements apportés */
    readonly changes: readonly string[];
    /** Nouvelles étapes ajoutées */
    readonly addedSteps: readonly string[];
    /** Étapes supprimées */
    readonly removedSteps: readonly string[];
}

/**
 * Configuration par défaut
 */
const DEFAULT_CONFIG: ProgressManagerConfig = {
    enableAutoAdaptation: true,
    unlockThreshold: 0.7,
    maxAttempts: 5
} as const;

/**
 * Gestionnaire de progression des parcours d'apprentissage
 * 
 * @class PathProgressManager
 * @example
 * ```typescript
 * const manager = new PathProgressManager({ enableAutoAdaptation: true });
 * const result = manager.updateProgress(path, stepId, true);
 * console.log(`Nouvelle progression: ${result.newProgress}%`);
 * ```
 */
export class PathProgressManager {
    private readonly logger = Logger.getInstance('PathProgressManager');
    private readonly config: ProgressManagerConfig;

    /**
     * Constructeur du gestionnaire de progression
     * 
     * @param config - Configuration du gestionnaire (optionnelle)
     */
    constructor(config?: Partial<ProgressManagerConfig>) {
        this.config = { ...DEFAULT_CONFIG, ...config };

        this.logger.info('PathProgressManager initialisé', this.config);
    }

    /**
     * Met à jour la progression d'un parcours après completion d'une étape
     * 
     * @param path - Parcours d'apprentissage
     * @param stepId - Identifiant de l'étape complétée
     * @param success - Succès de la completion
     * @returns ProgressUpdateResult Résultat de la mise à jour
     */
    public updateProgress(
        path: PersonalizedLearningPathModel,
        stepId: string,
        success: boolean
    ): ProgressUpdateResult {
        this.logger.debug('Mise à jour de la progression', {
            pathId: path.id,
            stepId,
            success
        });

        const updatedPath = { ...path };
        const messages: string[] = [];
        let unlockedSteps: string[] = [];

        // Trouver l'étape concernée
        const stepIndex = updatedPath.steps.findIndex(step => step.id === stepId);
        if (stepIndex === -1) {
            throw new Error(`Étape non trouvée: ${stepId}`);
        }

        const step = { ...updatedPath.steps[stepIndex] };

        // Mettre à jour les statistiques de l'étape
        step.attempts = step.attempts + 1;
        step.completedAt = success ? new Date() : step.completedAt;

        if (success) {
            step.status = 'completed';
            step.progress = 100;
            step.bestScore = Math.max(step.bestScore ?? 0, 100);

            messages.push(`Étape "${step.title}" complétée avec succès`);
        } else {
            // Logique d'échec
            if (step.attempts >= this.config.maxAttempts) {
                step.status = 'failed';
                messages.push(`Étape "${step.title}" échouée après ${step.attempts} tentatives`);
            } else {
                step.status = 'in_progress';
                messages.push(`Tentative ${step.attempts} pour l'étape "${step.title}"`);
            }
        }

        // Remplacer l'étape dans le parcours
        updatedPath.steps = [
            ...updatedPath.steps.slice(0, stepIndex),
            step,
            ...updatedPath.steps.slice(stepIndex + 1)
        ];

        // Débloquer les étapes suivantes si nécessaire
        if (success) {
            unlockedSteps = this.unlockNextSteps(updatedPath, stepId);
            messages.push(...unlockedSteps.map(id => `Étape ${id} débloquée`));
        }

        // Recalculer la progression globale
        const newProgress = this.calculateOverallProgress(updatedPath.steps);
        updatedPath.overallProgress = newProgress;
        updatedPath.updatedAt = new Date();

        // Vérifier si le parcours est terminé
        const isCompleted = this.isPathCompleted(updatedPath.steps);

        if (isCompleted) {
            messages.push('Parcours d\'apprentissage terminé avec succès !');
        }

        return {
            updatedPath,
            newProgress,
            unlockedSteps,
            isCompleted,
            messages
        };
    }

    /**
     * Met à jour les statuts des étapes selon leurs dépendances
     * 
     * @param path - Parcours d'apprentissage
     * @returns PersonalizedLearningPathModel Parcours mis à jour
     */
    public updateStepsStatus(path: PersonalizedLearningPathModel): PersonalizedLearningPathModel {
        const updatedPath = { ...path };
        const updatedSteps = [...updatedPath.steps];

        // Première étape toujours disponible
        if (updatedSteps.length > 0 && updatedSteps[0].status === 'locked') {
            updatedSteps[0] = { ...updatedSteps[0], status: 'available' };
        }

        // Ordonner les étapes par ordre si pas déjà fait
        updatedSteps.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        // Définir les ordres si manquants
        updatedSteps.forEach((step, index) => {
            if (step.order === undefined || step.order === 0) {
                updatedSteps[index] = { ...step, order: index + 1 };
            }
        });

        updatedPath.steps = updatedSteps;

        this.logger.debug('Statuts des étapes mis à jour', {
            pathId: path.id,
            totalSteps: updatedSteps.length
        });

        return updatedPath;
    }

    /**
     * Adapte un parcours en fonction des performances et domaines de force/faiblesse
     * 
     * @param path - Parcours d'apprentissage
     * @param strengthAreas - Domaines de force
     * @param weaknessAreas - Domaines de faiblesse
     * @returns PathAdaptationResult Résultat de l'adaptation
     */
    public adaptPath(
        path: PersonalizedLearningPathModel,
        strengthAreas: readonly string[],
        weaknessAreas: readonly string[]
    ): PathAdaptationResult {
        this.logger.info('Adaptation du parcours', {
            pathId: path.id,
            strengthAreas: strengthAreas.length,
            weaknessAreas: weaknessAreas.length
        });

        if (!this.config.enableAutoAdaptation) {
            this.logger.warn('Adaptation automatique désactivée');
            return {
                adaptedPath: path,
                changes: [],
                addedSteps: [],
                removedSteps: []
            };
        }

        const adaptedPath = { ...path };
        const changes: string[] = [];
        const addedSteps: string[] = [];
        const removedSteps: string[] = [];

        // Analyser les étapes existantes
        const updatedSteps = [...adaptedPath.steps];

        // Réduire la difficulté des domaines de force
        for (let i = 0; i < updatedSteps.length; i++) {
            const step = updatedSteps[i];
            const isStrengthArea = step.skillsTargeted.some(skill =>
                strengthAreas.includes(skill)
            );

            if (isStrengthArea && step.difficulty > 1) {
                const oldDifficulty = step.difficulty;
                updatedSteps[i] = {
                    ...step,
                    difficulty: Math.max(1, step.difficulty - 1),
                    estimatedDuration: Math.round(step.estimatedDuration * 0.8)
                };
                changes.push(
                    `Étape "${step.title}" : difficulté réduite de ${oldDifficulty} à ${updatedSteps[i].difficulty}`
                );
            }
        }

        // Renforcer les domaines de faiblesse
        for (let i = 0; i < updatedSteps.length; i++) {
            const step = updatedSteps[i];
            const isWeaknessArea = step.skillsTargeted.some(skill =>
                weaknessAreas.includes(skill)
            );

            if (isWeaknessArea) {
                const oldDifficulty = step.difficulty;
                updatedSteps[i] = {
                    ...step,
                    difficulty: Math.min(5, step.difficulty + 1),
                    estimatedDuration: Math.round(step.estimatedDuration * 1.2),
                    weight: step.weight * 1.5
                };
                changes.push(
                    `Étape "${step.title}" : renforcement pour faiblesse (difficulté ${oldDifficulty} → ${updatedSteps[i].difficulty})`
                );
            }
        }

        adaptedPath.steps = updatedSteps;
        adaptedPath.updatedAt = new Date();

        this.logger.info('Adaptation du parcours terminée', {
            pathId: path.id,
            changesCount: changes.length
        });

        return {
            adaptedPath,
            changes,
            addedSteps,
            removedSteps
        };
    }

    /**
     * Génère des statistiques détaillées sur un parcours
     * 
     * @param path - Parcours d'apprentissage
     * @returns PathStatistics Statistiques du parcours
     */
    public generatePathStatistics(path: PersonalizedLearningPathModel): PathStatistics {
        const totalSteps = path.steps.length;
        const completedSteps = path.steps.filter(step => step.status === 'completed').length;
        const inProgressSteps = path.steps.filter(step => step.status === 'in_progress').length;
        const failedSteps = path.steps.filter(step => step.status === 'failed').length;

        const totalDuration = path.steps.reduce(
            (sum, step) => sum + step.estimatedDuration,
            0
        );

        const completedDuration = path.steps
            .filter(step => step.status === 'completed')
            .reduce((sum, step) => sum + step.estimatedDuration, 0);

        const averageScore = this.calculateAverageScore(path.steps);
        const successRate = this.calculateSuccessRate(path.steps);

        const skillsAcquired = this.identifyAcquiredSkills(path.steps);
        const skillsInProgress = this.identifyInProgressSkills(path.steps);

        const estimatedTimeRemaining = totalDuration - completedDuration;
        const estimatedCompletionDate = this.estimateCompletionDate(
            path.startDate,
            estimatedTimeRemaining
        );

        return {
            totalSteps,
            completedSteps,
            inProgressSteps,
            failedSteps,
            totalDuration,
            completedDuration,
            estimatedTimeRemaining,
            averageScore,
            successRate,
            skillsAcquired,
            skillsInProgress,
            overallProgress: path.overallProgress,
            estimatedCompletionDate,
            lastActivityDate: path.updatedAt
        };
    }

    /**
     * Débloque les étapes suivantes après completion d'une étape
     * 
     * @param path - Parcours d'apprentissage
     * @param completedStepId - Identifiant de l'étape complétée
     * @returns string[] Identifiants des étapes débloquées
     * @private
     */
    private unlockNextSteps(
        path: PersonalizedLearningPathModel,
        completedStepId: string
    ): string[] {
        const unlockedSteps: string[] = [];
        const completedStep = path.steps.find(step => step.id === completedStepId);

        if (!completedStep) {
            return unlockedSteps;
        }

        // Trouver toutes les étapes qui peuvent être débloquées
        for (let i = 0; i < path.steps.length; i++) {
            const step = path.steps[i];

            if (step.status === 'locked') {
                // Vérifier si toutes les prérequis sont satisfaits
                const canUnlock = this.checkPrerequisites(step, path.steps);

                if (canUnlock) {
                    path.steps[i] = { ...step, status: 'available' };
                    unlockedSteps.push(step.id);
                }
            }
        }

        return unlockedSteps;
    }

    /**
     * Vérifie si les prérequis d'une étape sont satisfaits
     * 
     * @param step - Étape à vérifier
     * @param allSteps - Toutes les étapes du parcours
     * @returns boolean True si les prérequis sont satisfaits
     * @private
     */
    private checkPrerequisites(
        step: LearningPathStep,
        allSteps: readonly LearningPathStep[]
    ): boolean {
        // Si pas de prérequis, toujours disponible
        if (step.prerequisites.length === 0) {
            return true;
        }

        // Vérifier que toutes les compétences prérequises sont acquises
        const acquiredSkills = this.identifyAcquiredSkills(allSteps);

        return step.prerequisites.every(prereq =>
            acquiredSkills.includes(prereq)
        );
    }

    /**
     * Calcule la progression globale du parcours
     * 
     * @param steps - Étapes du parcours
     * @returns number Progression (0-100)
     * @private
     */
    private calculateOverallProgress(steps: readonly LearningPathStep[]): number {
        if (steps.length === 0) {
            return 0;
        }

        // Calcul pondéré par le poids de chaque étape
        let totalWeight = 0;
        let completedWeight = 0;

        for (const step of steps) {
            totalWeight += step.weight;

            if (step.status === 'completed') {
                completedWeight += step.weight;
            } else if (step.status === 'in_progress') {
                completedWeight += step.weight * (step.progress / 100);
            }
        }

        return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
    }

    /**
     * Vérifie si le parcours est terminé
     * 
     * @param steps - Étapes du parcours
     * @returns boolean True si le parcours est terminé
     * @private
     */
    private isPathCompleted(steps: readonly LearningPathStep[]): boolean {
        if (steps.length === 0) {
            return false;
        }

        // Toutes les étapes doivent être complétées ou dépassées
        return steps.every(step =>
            step.status === 'completed' || step.status === 'skipped'
        );
    }

    /**
     * Calcule le score moyen des étapes complétées
     * 
     * @param steps - Étapes du parcours
     * @returns number Score moyen (0-100)
     * @private
     */
    private calculateAverageScore(steps: readonly LearningPathStep[]): number {
        const completedSteps = steps.filter(step =>
            step.status === 'completed' && step.bestScore !== undefined
        );

        if (completedSteps.length === 0) {
            return 0;
        }

        const totalScore = completedSteps.reduce(
            (sum, step) => sum + (step.bestScore ?? 0),
            0
        );

        return Math.round(totalScore / completedSteps.length);
    }

    /**
     * Calcule le taux de réussite
     * 
     * @param steps - Étapes du parcours
     * @returns number Taux de réussite (0-100)
     * @private
     */
    private calculateSuccessRate(steps: readonly LearningPathStep[]): number {
        const attemptedSteps = steps.filter(step => step.attempts > 0);

        if (attemptedSteps.length === 0) {
            return 0;
        }

        const successfulSteps = steps.filter(step => step.status === 'completed');

        return Math.round((successfulSteps.length / attemptedSteps.length) * 100);
    }

    /**
     * Identifie les compétences acquises
     * 
     * @param steps - Étapes du parcours
     * @returns string[] Compétences acquises
     * @private
     */
    private identifyAcquiredSkills(steps: readonly LearningPathStep[]): readonly string[] {
        const acquiredSkills = new Set<string>();

        for (const step of steps) {
            if (step.status === 'completed') {
                step.skillsTargeted.forEach(skill => acquiredSkills.add(skill));
            }
        }

        return Array.from(acquiredSkills);
    }

    /**
     * Identifie les compétences en cours d'acquisition
     * 
     * @param steps - Étapes du parcours
     * @returns string[] Compétences en cours
     * @private
     */
    private identifyInProgressSkills(steps: readonly LearningPathStep[]): readonly string[] {
        const inProgressSkills = new Set<string>();

        for (const step of steps) {
            if (step.status === 'in_progress' || step.status === 'available') {
                step.skillsTargeted.forEach(skill => inProgressSkills.add(skill));
            }
        }

        return Array.from(inProgressSkills);
    }

    /**
     * Estime la date de completion du parcours
     * 
     * @param startDate - Date de début
     * @param remainingMinutes - Minutes restantes
     * @returns Date Date estimée de completion
     * @private
     */
    private estimateCompletionDate(startDate: Date, remainingMinutes: number): Date {
        // Hypothèse : 30 minutes d'étude par jour en moyenne
        const dailyStudyMinutes = 30;
        const daysRemaining = Math.ceil(remainingMinutes / dailyStudyMinutes);

        const completionDate = new Date(startDate);
        completionDate.setDate(completionDate.getDate() + daysRemaining);

        return completionDate;
    }
}