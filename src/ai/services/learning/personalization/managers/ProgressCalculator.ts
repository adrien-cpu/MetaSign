/**
 * Calculateur de progression pour les parcours d'apprentissage personnalisés
 * 
 * @file src/ai/services/learning/personalization/managers/ProgressCalculator.ts
 * @module ai/services/learning/personalization/managers
 * @description Service spécialisé pour les calculs de progression et de statuts
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import type {
    PersonalizedLearningPathModel,
    LearningPathStep,
    StepStatus,
    StepType
} from '../types/LearningPathTypes';
import { Logger } from '@/ai/utils/Logger';

/**
 * Configuration pour les calculs de progression
 */
interface ProgressCalculationConfig {
    /**
     * Poids par type d'étape pour le calcul de progression
     */
    readonly stepTypeWeights: Readonly<Record<StepType, number>>;

    /**
     * Facteur de pondération pour la difficulté
     */
    readonly difficultyWeightFactor: number;

    /**
     * Pondération minimale pour une étape
     */
    readonly minStepWeight: number;

    /**
     * Pondération maximale pour une étape
     */
    readonly maxStepWeight: number;
}

/**
 * Configuration par défaut pour les calculs
 */
const DEFAULT_CALCULATION_CONFIG: ProgressCalculationConfig = {
    stepTypeWeights: {
        'lesson': 1.2,      // Les leçons sont importantes
        'exercise': 1.0,    // Poids de base
        'practice': 1.1,    // Légèrement plus important que les exercices
        'assessment': 1.5,  // Les évaluations ont plus de poids
        'revision': 0.8     // Les révisions ont moins de poids
    },
    difficultyWeightFactor: 0.5,
    minStepWeight: 0.5,
    maxStepWeight: 2.0
} as const;

/**
 * Résultat du calcul de mise à jour des statuts
 */
export interface StatusUpdateResult {
    /**
     * Identifiants des étapes débloquées
     */
    readonly unlockedSteps: readonly string[];

    /**
     * Nombre total d'étapes mises à jour
     */
    readonly updatedStepsCount: number;

    /**
     * Nombre d'étapes disponibles après mise à jour
     */
    readonly availableStepsCount: number;

    /**
     * Nombre d'étapes verrouillées après mise à jour
     */
    readonly lockedStepsCount: number;
}

/**
 * Détails d'une étape pour le calcul de progression
 */
interface StepProgressDetails {
    readonly id: string;
    readonly type: StepType;
    readonly status: StepStatus;
    readonly difficulty: number;
    readonly weight: number;
    readonly contributesToProgress: boolean;
}

/**
 * Service de calcul de progression pour les parcours d'apprentissage
 */
export class ProgressCalculator {
    private readonly logger = Logger.getInstance('ProgressCalculator');
    private readonly config: ProgressCalculationConfig;

    /**
     * Constructeur du calculateur de progression
     * 
     * @param config Configuration du calculateur (optionnelle)
     * 
     * @example
     * ```typescript
     * const calculator = new ProgressCalculator({
     *     stepTypeWeights: { 'assessment': 2.0 },
     *     difficultyWeightFactor: 0.6
     * });
     * ```
     */
    constructor(config?: Partial<ProgressCalculationConfig>) {
        this.config = {
            ...DEFAULT_CALCULATION_CONFIG,
            ...config,
            stepTypeWeights: {
                ...DEFAULT_CALCULATION_CONFIG.stepTypeWeights,
                ...config?.stepTypeWeights
            }
        };

        this.logger.debug('ProgressCalculator initialisé', this.config);
    }

    /**
     * Calcule la progression globale d'un parcours
     * 
     * @param path Parcours d'apprentissage
     * @returns Progression globale (0-1)
     * 
     * @example
     * ```typescript
     * const progress = calculator.calculateOverallProgress(path);
     * console.log(`Progression: ${(progress * 100).toFixed(1)}%`);
     * ```
     */
    public calculateOverallProgress(path: PersonalizedLearningPathModel): number {
        const stepDetails = this.analyzeStepsForProgress(path.steps);

        if (stepDetails.length === 0) {
            this.logger.debug('Aucune étape à analyser pour la progression', { pathId: path.id });
            return 0;
        }

        // Calculer le score pondéré
        let weightedCompletedScore = 0;
        let totalWeight = 0;

        for (const step of stepDetails) {
            totalWeight += step.weight;

            if (step.status === 'completed' && step.contributesToProgress) {
                weightedCompletedScore += step.weight;
            }
        }

        const progress = totalWeight > 0 ? Math.min(1, weightedCompletedScore / totalWeight) : 0;

        this.logger.debug('Progression calculée', {
            pathId: path.id,
            totalSteps: stepDetails.length,
            completedSteps: stepDetails.filter(s => s.status === 'completed').length,
            totalWeight,
            weightedCompletedScore,
            progress: Math.round(progress * 1000) / 1000
        });

        return progress;
    }

    /**
     * Met à jour le statut de toutes les étapes d'un parcours
     * 
     * @param steps Liste des étapes (mutable)
     * @returns Résultat de la mise à jour des statuts
     * 
     * @example
     * ```typescript
     * const result = calculator.updateStepsStatus(mutablePath.steps);
     * console.log(`${result.unlockedSteps.length} étapes débloquées`);
     * ```
     */
    public updateStepsStatus(steps: Array<Omit<LearningPathStep, 'status'> & { status: StepStatus }>): StatusUpdateResult {
        this.logger.debug('Mise à jour des statuts d\'étapes', { totalSteps: steps.length });

        const unlockedSteps: string[] = [];
        let updatedStepsCount = 0;

        // Mapper les étapes complétées
        const completedSteps = new Set(
            steps
                .filter(step => step.status === 'completed')
                .map(step => step.id)
        );

        // Mettre à jour le statut de chaque étape
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            if (step.status === 'completed') {
                continue; // Déjà complétée
            }

            const previousStatus = step.status;

            // Vérifier les prérequis
            const allPrerequisitesMet = this.arePrerequisitesMet(step.prerequisites, completedSteps);

            // Déterminer le nouveau statut
            const newStatus: StepStatus = allPrerequisitesMet ? 'available' : 'locked';

            if (previousStatus !== newStatus) {
                steps[i] = {
                    ...step,
                    status: newStatus
                };
                updatedStepsCount++;

                // Enregistrer si l'étape a été débloquée
                if (previousStatus === 'locked' && newStatus === 'available') {
                    unlockedSteps.push(step.id);
                }
            }
        }

        // Calculer les statistiques finales
        const availableStepsCount = steps.filter(step => step.status === 'available').length;
        const lockedStepsCount = steps.filter(step => step.status === 'locked').length;

        const result: StatusUpdateResult = {
            unlockedSteps,
            updatedStepsCount,
            availableStepsCount,
            lockedStepsCount
        };

        this.logger.debug('Statuts des étapes mis à jour', result);

        return result;
    }

    /**
     * Calcule le poids d'une étape selon son type et sa difficulté
     * 
     * @param stepType Type d'étape
     * @param difficulty Difficulté de l'étape (0-1)
     * @returns Poids calculé pour l'étape
     * 
     * @example
     * ```typescript
     * const weight = calculator.calculateStepWeight('assessment', 0.7);
     * console.log(`Poids de l'étape: ${weight}`);
     * ```
     */
    public calculateStepWeight(stepType: StepType, difficulty: number): number {
        const baseWeight = this.config.stepTypeWeights[stepType] || 1.0;
        const difficultyWeight = this.config.minStepWeight + (difficulty * this.config.difficultyWeightFactor);

        const calculatedWeight = baseWeight * difficultyWeight;

        // Appliquer les limites min/max
        return Math.max(
            this.config.minStepWeight,
            Math.min(this.config.maxStepWeight, calculatedWeight)
        );
    }

    /**
     * Estime la progression attendue après completion d'une étape
     * 
     * @param path Parcours d'apprentissage
     * @param stepId Identifiant de l'étape à compléter
     * @returns Progression estimée après completion
     * 
     * @example
     * ```typescript
     * const estimatedProgress = calculator.estimateProgressAfterCompletion(path, 'step-123');
     * console.log(`Progression estimée: ${estimatedProgress * 100}%`);
     * ```
     */
    public estimateProgressAfterCompletion(path: PersonalizedLearningPathModel, stepId: string): number {
        // Créer une copie temporaire pour la simulation
        const simulatedSteps = path.steps.map(step =>
            step.id === stepId ? { ...step, status: 'completed' as StepStatus } : step
        );

        const simulatedPath = { ...path, steps: simulatedSteps };
        return this.calculateOverallProgress(simulatedPath);
    }

    /**
     * Calcule les métriques de répartition par type d'étape
     * 
     * @param steps Liste des étapes
     * @returns Répartition par type
     * 
     * @example
     * ```typescript
     * const distribution = calculator.calculateStepDistribution(path.steps);
     * console.log(`Exercices: ${distribution.exercise}`);
     * ```
     */
    public calculateStepDistribution(steps: readonly LearningPathStep[]): Readonly<Record<StepType, number>> {
        const distribution: Record<StepType, number> = {
            'lesson': 0,
            'exercise': 0,
            'practice': 0,
            'assessment': 0,
            'revision': 0
        };

        for (const step of steps) {
            distribution[step.type]++;
        }

        this.logger.debug('Distribution des étapes calculée', distribution);

        return distribution;
    }

    /**
     * Calcule les métriques de répartition par statut d'étape
     * 
     * @param steps Liste des étapes
     * @returns Répartition par statut
     * 
     * @example
     * ```typescript
     * const distribution = calculator.calculateStatusDistribution(path.steps);
     * console.log(`Disponibles: ${distribution.available}`);
     * ```
     */
    public calculateStatusDistribution(steps: readonly LearningPathStep[]): Readonly<Record<StepStatus, number>> {
        const distribution: Record<StepStatus, number> = {
            'pending': 0,
            'available': 0,
            'completed': 0,
            'locked': 0
        };

        for (const step of steps) {
            distribution[step.status]++;
        }

        this.logger.debug('Distribution des statuts calculée', distribution);

        return distribution;
    }

    /**
     * Identifie les étapes critiques (impact élevé sur la progression)
     * 
     * @param steps Liste des étapes
     * @returns Identifiants des étapes critiques
     * 
     * @example
     * ```typescript
     * const criticalSteps = calculator.identifyCriticalSteps(path.steps);
     * console.log(`${criticalSteps.length} étapes critiques identifiées`);
     * ```
     */
    public identifyCriticalSteps(steps: readonly LearningPathStep[]): readonly string[] {
        const stepDetails = this.analyzeStepsForProgress(steps);
        const averageWeight = stepDetails.reduce((sum, step) => sum + step.weight, 0) / stepDetails.length;

        // Identifier les étapes avec un poids supérieur à 1.5x la moyenne
        const criticalThreshold = averageWeight * 1.5;

        const criticalSteps = stepDetails
            .filter(step => step.weight >= criticalThreshold)
            .map(step => step.id);

        this.logger.debug('Étapes critiques identifiées', {
            totalSteps: stepDetails.length,
            averageWeight: Math.round(averageWeight * 100) / 100,
            criticalThreshold: Math.round(criticalThreshold * 100) / 100,
            criticalStepsCount: criticalSteps.length
        });

        return criticalSteps;
    }

    /**
     * Analyse les étapes pour calculer leurs détails de progression
     * 
     * @param steps Liste des étapes
     * @returns Détails d'analyse pour chaque étape
     * @private
     */
    private analyzeStepsForProgress(steps: readonly LearningPathStep[]): StepProgressDetails[] {
        return steps.map(step => ({
            id: step.id,
            type: step.type,
            status: step.status,
            difficulty: step.difficulty,
            weight: this.calculateStepWeight(step.type, step.difficulty),
            contributesToProgress: step.status !== 'pending' // Les étapes en attente ne contribuent pas
        }));
    }

    /**
     * Vérifie si tous les prérequis d'une étape sont remplis
     * 
     * @param prerequisites Liste des prérequis
     * @param completedSteps Set des étapes complétées
     * @returns True si tous les prérequis sont remplis
     * @private
     */
    private arePrerequisitesMet(prerequisites: readonly string[], completedSteps: Set<string>): boolean {
        if (prerequisites.length === 0) {
            return true;
        }

        return prerequisites.every(prereqId => completedSteps.has(prereqId));
    }
}