/**
 * Gestionnaire de dépendances pour les étapes d'apprentissage personnalisées
 * 
 * @file src/ai/services/learning/personalization/utils/StepDependencyManager.ts
 * @module ai/services/learning/personalization/utils
 * @description Gestionnaire spécialisé pour les dépendances et prérequis entre étapes d'apprentissage LSF
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import type {
    LearningPathStep,
    StepType,
    CECRLLevel,
    StepStatus
} from '../types/LearningPathTypes';
import type { UserReverseProfile } from '@/ai/services/learning/human/coda/codavirtuel/ReverseApprenticeshipSystem';
import { Logger } from '@/ai/utils/Logger';

/**
 * Règle de dépendance entre étapes
 */
interface DependencyRule {
    readonly type: 'sequential' | 'skill_based' | 'level_based' | 'assessment_gate';
    readonly description: string;
    readonly mandatory: boolean;
    readonly weight: number; // Importance de la dépendance (0-1)
}

/**
 * Relation de dépendance entre deux étapes
 */
export interface StepDependency {
    readonly prerequisiteStepId: string;
    readonly dependentStepId: string;
    readonly rule: DependencyRule;
    readonly estimatedUnlockDelay: number; // Délai estimé avant déblocage (en heures)
    readonly bypassConditions?: readonly string[]; // Conditions pour contourner la dépendance
}

/**
 * Graphe de dépendances pour un parcours
 */
export interface DependencyGraph {
    readonly pathId: string;
    readonly dependencies: readonly StepDependency[];
    readonly criticalPath: readonly string[]; // Chemin critique (étapes bloquantes)
    readonly parallelGroups: readonly (readonly string[])[]; // Groupes d'étapes parallèles
    readonly totalEstimatedDuration: number;
}

/**
 * Résultat d'analyse de dépendances
 */
interface DependencyAnalysisResult {
    readonly canUnlock: boolean;
    readonly missingPrerequisites: readonly string[];
    readonly recommendedNext: readonly string[];
    readonly estimatedReadiness: Date;
    readonly confidence: number; // 0-1
}

/**
 * Configuration pour la génération de dépendances
 */
interface DependencyGenerationConfig {
    readonly enforceSequentialLearning: boolean;
    readonly allowSkillJumping: boolean;
    readonly assessmentGateFrequency: number; // 0-1, fréquence des portes d'évaluation
    readonly parallelismLevel: 'low' | 'medium' | 'high';
    readonly adaptToProfile: boolean;
}

/**
 * Modèles de dépendances par compétence LSF
 */
const LSF_SKILL_DEPENDENCIES: Readonly<Record<string, readonly string[]>> = {
    // Vocabulaire de base
    'basicVocabulary': [],
    'extendedVocabulary': ['basicVocabulary'],
    'advancedVocabulary': ['extendedVocabulary'],

    // Reconnaissance
    'recognition': ['basicVocabulary'],
    'contextualRecognition': ['recognition', 'basicVocabulary'],

    // Grammaire
    'basicGrammar': ['basicVocabulary', 'recognition'],
    'spatialGrammar': ['basicGrammar'],
    'complexGrammar': ['spatialGrammar', 'advancedVocabulary'],

    // Expressions
    'facialExpressions': ['recognition'],
    'nonManualMarkers': ['facialExpressions', 'basicGrammar'],

    // Communication
    'simpleConversation': ['basicVocabulary', 'recognition'],
    'complexConversation': ['simpleConversation', 'basicGrammar'],
    'fluentCommunication': ['complexConversation', 'nonManualMarkers'],

    // Culture
    'culturalBasics': ['simpleConversation'],
    'culturalNuances': ['culturalBasics', 'complexConversation'],

    // Spécialisations
    'technicalVocabulary': ['advancedVocabulary'],
    'interpreting': ['fluentCommunication', 'culturalNuances'],
    'linguisticAwareness': ['complexGrammar', 'culturalNuances']
} as const;

/**
 * Configuration par défaut
 */
const DEFAULT_DEPENDENCY_CONFIG: DependencyGenerationConfig = {
    enforceSequentialLearning: true,
    allowSkillJumping: false,
    assessmentGateFrequency: 0.2,
    parallelismLevel: 'medium',
    adaptToProfile: true
} as const;

/**
 * Gestionnaire de dépendances pour les étapes d'apprentissage
 */
export class StepDependencyManager {
    private readonly logger = Logger.getInstance('StepDependencyManager');
    private readonly config: DependencyGenerationConfig;

    /**
     * Constructeur du gestionnaire de dépendances
     * 
     * @param config Configuration du gestionnaire (optionnelle)
     * 
     * @example
     * ```typescript
     * const dependencyManager = new StepDependencyManager({
     *     parallelismLevel: 'high',
     *     allowSkillJumping: true
     * });
     * ```
     */
    constructor(config?: Partial<DependencyGenerationConfig>) {
        this.config = { ...DEFAULT_DEPENDENCY_CONFIG, ...config };
        this.logger.info('StepDependencyManager initialisé', this.config);
    }

    /**
     * Génère le graphe de dépendances pour un ensemble d'étapes
     * 
     * @param steps Liste des étapes
     * @param pathId Identifiant du parcours
     * @param profile Profil utilisateur (optionnel)
     * @returns Graphe de dépendances
     * 
     * @example
     * ```typescript
     * const graph = manager.generateDependencyGraph(steps, 'path-123', profile);
     * console.log(`${graph.dependencies.length} dépendances créées`);
     * ```
     */
    public generateDependencyGraph(
        steps: readonly LearningPathStep[],
        pathId: string,
        profile?: UserReverseProfile
    ): DependencyGraph {
        this.logger.debug('Génération du graphe de dépendances', {
            pathId,
            stepsCount: steps.length,
            hasProfile: !!profile
        });

        try {
            // Analyser les compétences et créer les dépendances de base
            const skillBasedDependencies = this.generateSkillBasedDependencies(steps);

            // Ajouter les dépendances séquentielles
            const sequentialDependencies = this.config.enforceSequentialLearning
                ? this.generateSequentialDependencies(steps)
                : [];

            // Ajouter les portes d'évaluation
            const assessmentDependencies = this.generateAssessmentGateDependencies(steps);

            // Adapter selon le profil utilisateur
            const adaptedDependencies = profile && this.config.adaptToProfile
                ? this.adaptDependenciesToProfile([...skillBasedDependencies, ...sequentialDependencies, ...assessmentDependencies], profile)
                : [...skillBasedDependencies, ...sequentialDependencies, ...assessmentDependencies];

            // Calculer le chemin critique
            const criticalPath = this.calculateCriticalPath(steps, adaptedDependencies);

            // Identifier les groupes parallèles
            const parallelGroups = this.identifyParallelGroups(steps, adaptedDependencies);

            // Calculer la durée totale estimée
            const totalEstimatedDuration = this.calculateTotalDuration(steps, adaptedDependencies);

            const dependencyGraph: DependencyGraph = {
                pathId,
                dependencies: adaptedDependencies,
                criticalPath,
                parallelGroups,
                totalEstimatedDuration
            };

            this.logger.info('Graphe de dépendances généré', {
                pathId,
                dependenciesCount: adaptedDependencies.length,
                criticalPathLength: criticalPath.length,
                parallelGroupsCount: parallelGroups.length,
                totalDuration: totalEstimatedDuration
            });

            return dependencyGraph;

        } catch (error) {
            this.logger.error('Erreur lors de la génération du graphe de dépendances', {
                pathId,
                stepsCount: steps.length,
                error
            });
            throw new Error(`Génération du graphe de dépendances échouée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    /**
     * Analyse si une étape peut être débloquée
     * 
     * @param stepId Identifiant de l'étape
     * @param completedSteps Étapes complétées
     * @param dependencyGraph Graphe de dépendances
     * @returns Résultat de l'analyse
     * 
     * @example
     * ```typescript
     * const analysis = manager.analyzeStepReadiness('step-5', completedSteps, graph);
     * console.log(`Peut débloquer: ${analysis.canUnlock}`);
     * ```
     */
    public analyzeStepReadiness(
        stepId: string,
        completedSteps: readonly string[],
        dependencyGraph: DependencyGraph
    ): DependencyAnalysisResult {
        this.logger.debug('Analyse de la disponibilité d\'étape', {
            stepId,
            completedStepsCount: completedSteps.length
        });

        // Trouver toutes les dépendances pour cette étape
        const relevantDependencies = dependencyGraph.dependencies.filter(dep =>
            dep.dependentStepId === stepId
        );

        if (relevantDependencies.length === 0) {
            // Aucune dépendance = toujours disponible
            return {
                canUnlock: true,
                missingPrerequisites: [],
                recommendedNext: [stepId],
                estimatedReadiness: new Date(),
                confidence: 1.0
            };
        }

        // Analyser chaque dépendance
        const missingPrerequisites: string[] = [];
        let totalWeight = 0;
        let satisfiedWeight = 0;

        for (const dependency of relevantDependencies) {
            const isPrerequisiteMet = this.isPrerequisiteSatisfied(
                dependency,
                completedSteps
            );

            totalWeight += dependency.rule.weight;

            if (isPrerequisiteMet) {
                satisfiedWeight += dependency.rule.weight;
            } else if (dependency.rule.mandatory) {
                missingPrerequisites.push(dependency.prerequisiteStepId);
            }
        }

        // Calculer si l'étape peut être débloquée
        const mandatoryMet = missingPrerequisites.length === 0;
        const weightThreshold = 0.7; // 70% des dépendances doivent être satisfaites
        const weightSatisfied = totalWeight > 0 ? satisfiedWeight / totalWeight >= weightThreshold : true;

        const canUnlock = mandatoryMet && weightSatisfied;

        // Calculer la confiance
        const confidence = totalWeight > 0 ? satisfiedWeight / totalWeight : 1.0;

        // Estimer la date de disponibilité
        const estimatedReadiness = this.estimateReadinessDate(
            missingPrerequisites,
            dependencyGraph
        );

        // Recommander les prochaines étapes
        const recommendedNext = canUnlock
            ? [stepId]
            : this.findAlternativeSteps(stepId, completedSteps, dependencyGraph);

        const result: DependencyAnalysisResult = {
            canUnlock,
            missingPrerequisites,
            recommendedNext,
            estimatedReadiness,
            confidence
        };

        this.logger.debug('Analyse de disponibilité terminée', {
            stepId,
            canUnlock,
            missingCount: missingPrerequisites.length,
            confidence: Math.round(confidence * 100) / 100
        });

        return result;
    }

    /**
     * Optimise le graphe de dépendances pour réduire les blocages
     * 
     * @param graph Graphe à optimiser
     * @param currentProgress Progression actuelle
     * @returns Graphe optimisé
     * 
     * @example
     * ```typescript
     * const optimized = manager.optimizeDependencyGraph(graph, progressData);
     * ```
     */
    public optimizeDependencyGraph(
        graph: DependencyGraph,
        currentProgress: readonly string[]
    ): DependencyGraph {
        this.logger.debug('Optimisation du graphe de dépendances', {
            pathId: graph.pathId,
            originalDependencies: graph.dependencies.length,
            currentProgressCount: currentProgress.length
        });

        // Identifier les dépendances bloquantes
        const blockingDependencies = this.identifyBlockingDependencies(graph, currentProgress);

        // Créer des chemins alternatifs
        const alternativeDependencies = this.createAlternativePaths(graph, blockingDependencies);

        // Réduire les dépendances non-critiques
        const reducedDependencies = this.reduceNonCriticalDependencies(
            [...graph.dependencies, ...alternativeDependencies],
            graph.criticalPath
        );

        // Recalculer le chemin critique et les groupes parallèles
        const newCriticalPath = this.calculateCriticalPath([], reducedDependencies);
        const newParallelGroups = this.identifyParallelGroups([], reducedDependencies);
        const newTotalDuration = this.calculateTotalDuration([], reducedDependencies);

        const optimizedGraph: DependencyGraph = {
            ...graph,
            dependencies: reducedDependencies,
            criticalPath: newCriticalPath,
            parallelGroups: newParallelGroups,
            totalEstimatedDuration: newTotalDuration
        };

        this.logger.info('Graphe de dépendances optimisé', {
            pathId: graph.pathId,
            originalDependencies: graph.dependencies.length,
            optimizedDependencies: reducedDependencies.length,
            reductionPercent: Math.round(((graph.dependencies.length - reducedDependencies.length) / graph.dependencies.length) * 100)
        });

        return optimizedGraph;
    }

    /**
     * Génère les dépendances basées sur les compétences
     * 
     * @param steps Liste des étapes
     * @returns Dépendances basées sur les compétences
     * @private
     */
    private generateSkillBasedDependencies(steps: readonly LearningPathStep[]): StepDependency[] {
        const dependencies: StepDependency[] = [];

        for (const step of steps) {
            for (const skill of step.targetSkills) {
                const prerequisiteSkills = LSF_SKILL_DEPENDENCIES[skill] || [];

                for (const prereqSkill of prerequisiteSkills) {
                    // Trouver les étapes qui enseignent cette compétence prérequise
                    const prerequisiteSteps = steps.filter(s =>
                        s.targetSkills.includes(prereqSkill) &&
                        s.id !== step.id
                    );

                    for (const prereqStep of prerequisiteSteps) {
                        dependencies.push({
                            prerequisiteStepId: prereqStep.id,
                            dependentStepId: step.id,
                            rule: {
                                type: 'skill_based',
                                description: `${skill} nécessite ${prereqSkill}`,
                                mandatory: true,
                                weight: 0.8
                            },
                            estimatedUnlockDelay: this.calculateSkillBasedDelay(prereqSkill, skill)
                        });
                    }
                }
            }
        }

        return dependencies;
    }

    /**
     * Génère les dépendances séquentielles
     * 
     * @param steps Liste des étapes
     * @returns Dépendances séquentielles
     * @private
     */
    private generateSequentialDependencies(steps: readonly LearningPathStep[]): StepDependency[] {
        const dependencies: StepDependency[] = [];
        const sortedSteps = [...steps].sort((a, b) => a.priority - b.priority);

        for (let i = 1; i < sortedSteps.length; i++) {
            const currentStep = sortedSteps[i];
            const previousStep = sortedSteps[i - 1];

            // Éviter les dépendances circulaires
            if (currentStep.id !== previousStep.id) {
                dependencies.push({
                    prerequisiteStepId: previousStep.id,
                    dependentStepId: currentStep.id,
                    rule: {
                        type: 'sequential',
                        description: 'Apprentissage séquentiel',
                        mandatory: false,
                        weight: 0.3
                    },
                    estimatedUnlockDelay: 0.5 // 30 minutes
                });
            }
        }

        return dependencies;
    }

    /**
     * Génère les dépendances pour les portes d'évaluation
     * 
     * @param steps Liste des étapes
     * @returns Dépendances d'évaluation
     * @private
     */
    private generateAssessmentGateDependencies(steps: readonly LearningPathStep[]): StepDependency[] {
        const dependencies: StepDependency[] = [];
        const assessmentSteps = steps.filter(step => step.type === 'assessment');

        for (const assessmentStep of assessmentSteps) {
            // Les étapes d'évaluation bloquent les étapes suivantes
            const subsequentSteps = steps.filter(step =>
                step.priority > assessmentStep.priority &&
                step.id !== assessmentStep.id
            );

            for (const nextStep of subsequentSteps.slice(0, 3)) { // Limiter à 3 étapes
                dependencies.push({
                    prerequisiteStepId: assessmentStep.id,
                    dependentStepId: nextStep.id,
                    rule: {
                        type: 'assessment_gate',
                        description: 'Validation par évaluation requise',
                        mandatory: true,
                        weight: 1.0
                    },
                    estimatedUnlockDelay: 1.0 // 1 heure
                });
            }
        }

        return dependencies;
    }

    /**
     * Adapte les dépendances selon le profil utilisateur
     * 
     * @param dependencies Dépendances de base
     * @param profile Profil utilisateur
     * @returns Dépendances adaptées
     * @private
     */
    private adaptDependenciesToProfile(
        dependencies: readonly StepDependency[],
        profile: UserReverseProfile
    ): StepDependency[] {
        return dependencies.map(dependency => {
            // Réduire les dépendances pour les domaines de force
            if (profile.strengthAreas?.some(strength => dependency.rule.description.includes(strength))) {
                return {
                    ...dependency,
                    rule: {
                        ...dependency.rule,
                        weight: dependency.rule.weight * 0.7,
                        mandatory: false
                    },
                    estimatedUnlockDelay: dependency.estimatedUnlockDelay * 0.5
                };
            }

            // Renforcer les dépendances pour les domaines de faiblesse
            if (profile.weaknessAreas?.some(weakness => dependency.rule.description.includes(weakness))) {
                return {
                    ...dependency,
                    rule: {
                        ...dependency.rule,
                        weight: Math.min(1.0, dependency.rule.weight * 1.3),
                        mandatory: true
                    },
                    estimatedUnlockDelay: dependency.estimatedUnlockDelay * 1.5
                };
            }

            return dependency;
        });
    }

    /**
     * Calcule le chemin critique du graphe
     * 
     * @param steps Liste des étapes
     * @param dependencies Dépendances
     * @returns Chemin critique
     * @private
     */
    private calculateCriticalPath(
        steps: readonly LearningPathStep[],
        dependencies: readonly StepDependency[]
    ): readonly string[] {
        // Algorithme simplifié de calcul de chemin critique
        const criticalSteps: string[] = [];
        const mandatoryDependencies = dependencies.filter(dep => dep.rule.mandatory);

        // Identifier les étapes avec le plus de dépendances
        const dependencyCounts = new Map<string, number>();

        for (const dependency of mandatoryDependencies) {
            const count = dependencyCounts.get(dependency.dependentStepId) || 0;
            dependencyCounts.set(dependency.dependentStepId, count + 1);
        }

        // Trier par nombre de dépendances (décroissant)
        const sortedByDependencies = Array.from(dependencyCounts.entries())
            .sort(([, a], [, b]) => b - a)
            .map(([stepId]) => stepId);

        return sortedByDependencies.slice(0, 5); // Top 5 des étapes critiques
    }

    /**
     * Identifie les groupes d'étapes qui peuvent être exécutées en parallèle
     * 
     * @param steps Liste des étapes
     * @param dependencies Dépendances
     * @returns Groupes parallèles
     * @private
     */
    private identifyParallelGroups(
        steps: readonly LearningPathStep[],
        dependencies: readonly StepDependency[]
    ): readonly (readonly string[])[] {
        // Identifier les étapes sans dépendances mutuelles
        const parallelGroups: string[][] = [];
        const processedSteps = new Set<string>();

        // Grouper les étapes par niveau de dépendance
        const dependencyLevels = new Map<string, number>();

        for (const dependency of dependencies) {
            const level = dependencyLevels.get(dependency.dependentStepId) || 0;
            dependencyLevels.set(dependency.dependentStepId, level + 1);
        }

        // Grouper par niveau
        const levelGroups = new Map<number, string[]>();
        for (const [stepId, level] of dependencyLevels.entries()) {
            if (!levelGroups.has(level)) {
                levelGroups.set(level, []);
            }
            levelGroups.get(level)!.push(stepId);
        }

        return Array.from(levelGroups.values());
    }

    /**
     * Calcule la durée totale estimée du parcours
     * 
     * @param steps Liste des étapes
     * @param dependencies Dépendances
     * @returns Durée totale en heures
     * @private
     */
    private calculateTotalDuration(
        steps: readonly LearningPathStep[],
        dependencies: readonly StepDependency[]
    ): number {
        // Calcul simplifié basé sur les délais de déblocage
        const totalUnlockDelay = dependencies.reduce((sum, dep) => sum + dep.estimatedUnlockDelay, 0);
        const baseStepsDuration = steps.reduce((sum, step) => sum + step.estimatedDuration, 0) / 60; // Convertir en heures

        return baseStepsDuration + totalUnlockDelay;
    }

    /**
     * Vérifie si un prérequis est satisfait
     * 
     * @param dependency Dépendance à vérifier
     * @param completedSteps Étapes complétées
     * @returns True si le prérequis est satisfait
     * @private
     */
    private isPrerequisiteSatisfied(
        dependency: StepDependency,
        completedSteps: readonly string[]
    ): boolean {
        return completedSteps.includes(dependency.prerequisiteStepId);
    }

    /**
     * Estime la date de disponibilité d'une étape
     * 
     * @param missingPrerequisites Prérequis manquants
     * @param graph Graphe de dépendances
     * @returns Date estimée
     * @private
     */
    private estimateReadinessDate(
        missingPrerequisites: readonly string[],
        graph: DependencyGraph
    ): Date {
        if (missingPrerequisites.length === 0) {
            return new Date();
        }

        // Estimer le temps nécessaire pour compléter les prérequis
        const estimatedHours = missingPrerequisites.length * 2; // 2h par prérequis en moyenne
        const estimatedMs = estimatedHours * 60 * 60 * 1000;

        return new Date(Date.now() + estimatedMs);
    }

    /**
     * Trouve des étapes alternatives disponibles
     * 
     * @param blockedStepId Étape bloquée
     * @param completedSteps Étapes complétées
     * @param graph Graphe de dépendances
     * @returns Étapes alternatives
     * @private
     */
    private findAlternativeSteps(
        blockedStepId: string,
        completedSteps: readonly string[],
        graph: DependencyGraph
    ): readonly string[] {
        // Trouver les étapes parallèles disponibles
        const alternatives: string[] = [];

        for (const parallelGroup of graph.parallelGroups) {
            if (parallelGroup.includes(blockedStepId)) {
                for (const stepId of parallelGroup) {
                    if (stepId !== blockedStepId && !completedSteps.includes(stepId)) {
                        const analysis = this.analyzeStepReadiness(stepId, completedSteps, graph);
                        if (analysis.canUnlock) {
                            alternatives.push(stepId);
                        }
                    }
                }
            }
        }

        return alternatives;
    }

    /**
     * Calcule le délai basé sur la complexité des compétences
     * 
     * @param prerequisiteSkill Compétence prérequise
     * @param targetSkill Compétence cible
     * @returns Délai en heures
     * @private
     */
    private calculateSkillBasedDelay(prerequisiteSkill: string, targetSkill: string): number {
        // Délais basés sur la complexité relative des compétences
        const complexityMap: Record<string, number> = {
            'basicVocabulary': 1,
            'recognition': 2,
            'basicGrammar': 3,
            'spatialGrammar': 4,
            'complexGrammar': 6,
            'fluentCommunication': 8
        };

        const prereqComplexity = complexityMap[prerequisiteSkill] || 1;
        const targetComplexity = complexityMap[targetSkill] || 1;

        return Math.max(0.5, (targetComplexity - prereqComplexity) * 0.5);
    }

    /**
     * Identifie les dépendances bloquantes
     * 
     * @param graph Graphe de dépendances
     * @param currentProgress Progression actuelle
     * @returns Dépendances bloquantes
     * @private
     */
    private identifyBlockingDependencies(
        graph: DependencyGraph,
        currentProgress: readonly string[]
    ): readonly StepDependency[] {
        return graph.dependencies.filter(dependency =>
            dependency.rule.mandatory &&
            !currentProgress.includes(dependency.prerequisiteStepId)
        );
    }

    /**
     * Crée des chemins alternatifs pour contourner les blocages
     * 
     * @param graph Graphe original
     * @param blockingDependencies Dépendances bloquantes
     * @returns Dépendances alternatives
     * @private
     */
    private createAlternativePaths(
        graph: DependencyGraph,
        blockingDependencies: readonly StepDependency[]
    ): StepDependency[] {
        // Implémentation simplifiée : créer des chemins optionnels
        return blockingDependencies.map(dependency => ({
            ...dependency,
            rule: {
                ...dependency.rule,
                type: 'sequential' as const,
                mandatory: false,
                weight: dependency.rule.weight * 0.5
            },
            bypassConditions: ['alternative_skill_demonstrated', 'time_based_unlock']
        }));
    }

    /**
     * Réduit les dépendances non-critiques
     * 
     * @param dependencies Toutes les dépendances
     * @param criticalPath Chemin critique
     * @returns Dépendances réduites
     * @private
     */
    private reduceNonCriticalDependencies(
        dependencies: readonly StepDependency[],
        criticalPath: readonly string[]
    ): StepDependency[] {
        return dependencies.filter(dependency => {
            // Garder toutes les dépendances critiques
            if (criticalPath.includes(dependency.dependentStepId) || criticalPath.includes(dependency.prerequisiteStepId)) {
                return true;
            }

            // Garder les dépendances mandatoires
            if (dependency.rule.mandatory) {
                return true;
            }

            // Garder les dépendances avec un poids élevé
            return dependency.rule.weight >= 0.6;
        });
    }
}