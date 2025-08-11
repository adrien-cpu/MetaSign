/**
 * @file src/ai/services/learning/human/coda/codavirtuel/scenarios/exercises/skills/ExerciseSkillsService.ts
 * @description Service de gestion des compétences ciblées dans les exercices
 * Génère et analyse les compétences linguistiques travaillées dans chaque exercice.
 * @module services/learning/codavirtuel/scenarios/exercises/skills
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 */

import { CECRLLevel } from '@/ai/services/learning/human/coda/codavirtuel/types';
import { Logger } from '@/ai/utils/Logger';
import { ExerciseType } from '@/ai/services/learning/human/coda/codavirtuel/scenarios/types/DifficultyTypes';

/**
 * Catégories d'erreurs et compétences linguistiques en LSF
 */
export enum ErrorCategory {
    VOCABULARY = 'vocabulary',
    GRAMMAR = 'grammar',
    SYNTAX = 'syntax',
    CULTURAL = 'cultural',
    SPATIAL = 'spatial',
    TEMPORAL = 'temporal',
    PROSODY = 'prosody',
    EXPRESSION = 'expression'
}

/**
 * Interface pour les statistiques de compétences d'un utilisateur
 */
export interface UserSkillStats {
    /** Niveau actuel dans chaque compétence (0-100) */
    skillLevels: Record<ErrorCategory, number>;
    /** Historique des exercices par compétence */
    exerciseHistory: Record<ErrorCategory, {
        totalAttempts: number;
        successRate: number;
        lastPracticed: Date;
    }>;
    /** Compétences récemment travaillées */
    recentFocus: ErrorCategory[];
}

/**
 * Résultat d'analyse des compétences
 */
export interface SkillsAnalysisResult {
    /** Compétences recommandées pour les prochains exercices */
    recommendedSkills: ErrorCategory[];
    /** Compétences qui ont le plus progressé */
    mostImproved: ErrorCategory[];
    /** Compétences qui nécessitent plus de travail */
    needsImprovement: ErrorCategory[];
    /** Score de maîtrise global (0-100) */
    overallMasteryScore: number;
}

/**
 * Service responsable de la gestion et de l'attribution des compétences ciblées
 * pour les exercices d'apprentissage de la LSF.
 */
export class ExerciseSkillsService {
    private readonly logger: Logger;

    /**
     * Initialise le service de gestion des compétences
     */
    constructor() {
        this.logger = new Logger('ExerciseSkillsService');
    }

    /**
     * Génère le focus des compétences pour un exercice en fonction de son type
     * et du niveau actuel de l'apprenant dans chaque domaine.
     * 
     * @param type - Type d'exercice
     * @param level - Niveau CECRL de l'apprenant
     * @param skillLevels - Niveaux de compétence actuels
     * @returns Répartition des compétences ciblées avec leur pondération
     */
    public generateSkillsFocus(
        type: ExerciseType,
        level: CECRLLevel,
        skillLevels: Record<ErrorCategory, number>
    ): Partial<Record<ErrorCategory, number>> {
        // Définir des poids par défaut selon le type d'exercice
        const baseWeights = this.getBaseWeightsByExerciseType(type);

        // Facteurs d'ajustement par niveau CECRL
        const levelFactors = this.getLevelAdjustmentFactors(level);

        // Calculer les poids ajustés
        const adjustedFocus: Partial<Record<ErrorCategory, number>> = {};

        // Parcourir les poids de base et appliquer les ajustements
        Object.entries(baseWeights).forEach(([category, baseWeight]) => {
            if (baseWeight !== undefined) {
                const skillCategory = category as ErrorCategory;
                const levelFactor = levelFactors[skillCategory] || 1.0;
                const skillLevel = skillLevels[skillCategory] || 50; // Valeur par défaut si non définie

                // Ajuster en fonction du niveau de compétence (plus la compétence est basse, 
                // plus le poids est élevé pour travailler cette compétence)
                const skillFactor = 1 + (100 - skillLevel) / 200; // entre 0.5 et 1.5

                adjustedFocus[skillCategory] = Math.round(baseWeight * levelFactor * skillFactor);
            }
        });

        this.logger.debug(
            `Generated skills focus for ${type} exercise (level ${level}): ${JSON.stringify(adjustedFocus)}`
        );

        return adjustedFocus;
    }

    /**
     * Obtient les poids de base des compétences par type d'exercice
     * @param type - Type d'exercice
     * @returns Poids de base pour chaque compétence
     */
    private getBaseWeightsByExerciseType(type: ExerciseType): Partial<Record<ErrorCategory, number>> {
        // Définition des poids de base pour les différents types d'exercices
        const baseWeights: Partial<Record<ExerciseType, Partial<Record<ErrorCategory, number>>>> = {
            'multiple-choice': {
                [ErrorCategory.VOCABULARY]: 3,
                [ErrorCategory.GRAMMAR]: 1,
                [ErrorCategory.SYNTAX]: 1,
                [ErrorCategory.CULTURAL]: 0,
                [ErrorCategory.SPATIAL]: 0
            },
            'drag-drop': {
                [ErrorCategory.VOCABULARY]: 2,
                [ErrorCategory.GRAMMAR]: 1,
                [ErrorCategory.SYNTAX]: 2,
                [ErrorCategory.CULTURAL]: 0,
                [ErrorCategory.SPATIAL]: 2
            },
            'fill-blank': {
                [ErrorCategory.VOCABULARY]: 3,
                [ErrorCategory.GRAMMAR]: 2,
                [ErrorCategory.SYNTAX]: 2,
                [ErrorCategory.CULTURAL]: 0,
                [ErrorCategory.SPATIAL]: 0
            },
            'text-entry': {
                [ErrorCategory.VOCABULARY]: 2,
                [ErrorCategory.GRAMMAR]: 3,
                [ErrorCategory.SYNTAX]: 3,
                [ErrorCategory.CULTURAL]: 1,
                [ErrorCategory.SPATIAL]: 1
            },
            'video-response': {
                [ErrorCategory.VOCABULARY]: 2,
                [ErrorCategory.GRAMMAR]: 2,
                [ErrorCategory.SYNTAX]: 2,
                [ErrorCategory.CULTURAL]: 2,
                [ErrorCategory.SPATIAL]: 3
            },
            'correction': {
                [ErrorCategory.VOCABULARY]: 1,
                [ErrorCategory.GRAMMAR]: 3,
                [ErrorCategory.SYNTAX]: 3,
                [ErrorCategory.CULTURAL]: 1,
                [ErrorCategory.SPATIAL]: 2
            },
            'matching': {
                [ErrorCategory.VOCABULARY]: 3,
                [ErrorCategory.GRAMMAR]: 1,
                [ErrorCategory.SYNTAX]: 1,
                [ErrorCategory.CULTURAL]: 2,
                [ErrorCategory.SPATIAL]: 1
            },
            'ordering': {
                [ErrorCategory.VOCABULARY]: 1,
                [ErrorCategory.GRAMMAR]: 2,
                [ErrorCategory.SYNTAX]: 3,
                [ErrorCategory.CULTURAL]: 1,
                [ErrorCategory.SPATIAL]: 2
            }
        };

        // Retourner les poids pour le type spécifié ou des valeurs par défaut
        return baseWeights[type] || {
            [ErrorCategory.VOCABULARY]: 2,
            [ErrorCategory.GRAMMAR]: 2,
            [ErrorCategory.SYNTAX]: 2,
            [ErrorCategory.CULTURAL]: 1,
            [ErrorCategory.SPATIAL]: 1
        };
    }

    /**
     * Obtient les facteurs d'ajustement des compétences par niveau CECRL
     * @param level - Niveau CECRL de l'apprenant
     * @returns Facteurs d'ajustement pour chaque compétence
     */
    private getLevelAdjustmentFactors(level: CECRLLevel): Record<ErrorCategory, number> {
        const levelFactors: Record<CECRLLevel, Record<ErrorCategory, number>> = {
            [CECRLLevel.A1]: {
                [ErrorCategory.VOCABULARY]: 1.5,
                [ErrorCategory.GRAMMAR]: 1.2,
                [ErrorCategory.SYNTAX]: 1.0,
                [ErrorCategory.CULTURAL]: 0.5,
                [ErrorCategory.SPATIAL]: 0.5,
                [ErrorCategory.TEMPORAL]: 0.5,
                [ErrorCategory.PROSODY]: 0.3,
                [ErrorCategory.EXPRESSION]: 0.5
            },
            [CECRLLevel.A2]: {
                [ErrorCategory.VOCABULARY]: 1.3,
                [ErrorCategory.GRAMMAR]: 1.3,
                [ErrorCategory.SYNTAX]: 1.1,
                [ErrorCategory.CULTURAL]: 0.7,
                [ErrorCategory.SPATIAL]: 0.8,
                [ErrorCategory.TEMPORAL]: 0.7,
                [ErrorCategory.PROSODY]: 0.5,
                [ErrorCategory.EXPRESSION]: 0.7
            },
            [CECRLLevel.B1]: {
                [ErrorCategory.VOCABULARY]: 1.1,
                [ErrorCategory.GRAMMAR]: 1.2,
                [ErrorCategory.SYNTAX]: 1.2,
                [ErrorCategory.CULTURAL]: 0.9,
                [ErrorCategory.SPATIAL]: 1.0,
                [ErrorCategory.TEMPORAL]: 0.9,
                [ErrorCategory.PROSODY]: 0.8,
                [ErrorCategory.EXPRESSION]: 0.9
            },
            [CECRLLevel.B2]: {
                [ErrorCategory.VOCABULARY]: 1.0,
                [ErrorCategory.GRAMMAR]: 1.1,
                [ErrorCategory.SYNTAX]: 1.3,
                [ErrorCategory.CULTURAL]: 1.1,
                [ErrorCategory.SPATIAL]: 1.2,
                [ErrorCategory.TEMPORAL]: 1.1,
                [ErrorCategory.PROSODY]: 1.0,
                [ErrorCategory.EXPRESSION]: 1.1
            },
            [CECRLLevel.C1]: {
                [ErrorCategory.VOCABULARY]: 0.9,
                [ErrorCategory.GRAMMAR]: 1.0,
                [ErrorCategory.SYNTAX]: 1.2,
                [ErrorCategory.CULTURAL]: 1.3,
                [ErrorCategory.SPATIAL]: 1.3,
                [ErrorCategory.TEMPORAL]: 1.2,
                [ErrorCategory.PROSODY]: 1.3,
                [ErrorCategory.EXPRESSION]: 1.3
            },
            [CECRLLevel.C2]: {
                [ErrorCategory.VOCABULARY]: 0.8,
                [ErrorCategory.GRAMMAR]: 0.9,
                [ErrorCategory.SYNTAX]: 1.1,
                [ErrorCategory.CULTURAL]: 1.5,
                [ErrorCategory.SPATIAL]: 1.5,
                [ErrorCategory.TEMPORAL]: 1.4,
                [ErrorCategory.PROSODY]: 1.5,
                [ErrorCategory.EXPRESSION]: 1.5
            }
        };

        return levelFactors[level] || {
            [ErrorCategory.VOCABULARY]: 1.0,
            [ErrorCategory.GRAMMAR]: 1.0,
            [ErrorCategory.SYNTAX]: 1.0,
            [ErrorCategory.CULTURAL]: 1.0,
            [ErrorCategory.SPATIAL]: 1.0,
            [ErrorCategory.TEMPORAL]: 1.0,
            [ErrorCategory.PROSODY]: 1.0,
            [ErrorCategory.EXPRESSION]: 1.0
        };
    }

    /**
     * Analyse et fait des recommandations sur les compétences à travailler
     * en se basant sur les performances antérieures de l'apprenant.
     * 
     * @param skillLevels - Niveaux de compétence actuels
     * @param recentFocus - Compétences récemment travaillées
     * @returns Recommandations de compétences à cibler
     */
    public analyzeSkillsGaps(
        skillLevels: Record<ErrorCategory, number>,
        recentFocus: ErrorCategory[]
    ): ErrorCategory[] {
        // Identifier les compétences les plus faibles
        const sortedSkills = Object.entries(skillLevels)
            .sort(([, levelA], [, levelB]) => levelA - levelB)
            .map(([skill]) => skill as ErrorCategory);

        // Prioriser les compétences faibles qui n'ont pas été récemment travaillées
        const prioritizedSkills = sortedSkills.filter(skill => !recentFocus.includes(skill));

        // Si toutes les compétences ont été récemment travaillées, revenir aux plus faibles
        return prioritizedSkills.length > 0
            ? prioritizedSkills.slice(0, 2)
            : sortedSkills.slice(0, 2);
    }

    /**
     * Effectue une analyse complète des compétences d'un utilisateur
     * et propose des recommandations personnalisées
     * 
     * @param userStats - Statistiques de compétences de l'utilisateur
     * @param level - Niveau CECRL de l'utilisateur
     * @returns Résultat d'analyse détaillé
     */
    public performComprehensiveAnalysis(
        userStats: UserSkillStats,
        level: CECRLLevel
    ): SkillsAnalysisResult {
        const { skillLevels, exerciseHistory, recentFocus } = userStats;

        // Compétences recommandées (basées sur les lacunes)
        const recommendedSkills = this.analyzeSkillsGaps(skillLevels, recentFocus);

        // Déterminer les compétences qui se sont le plus améliorées
        const mostImproved = this.identifyMostImprovedSkills(skillLevels, exerciseHistory);

        // Identifier les compétences qui nécessitent plus de travail
        const needsImprovement = this.identifySkillsNeedingImprovement(skillLevels, level);

        // Calculer un score global de maîtrise
        const overallMasteryScore = this.calculateOverallMasteryScore(skillLevels, level);

        return {
            recommendedSkills,
            mostImproved,
            needsImprovement,
            overallMasteryScore
        };
    }

    /**
     * Identifie les compétences qui se sont le plus améliorées
     * 
     * @param skillLevels - Niveaux de compétence actuels
     * @param exerciseHistory - Historique des exercices
     * @returns Liste des compétences avec la plus grande amélioration
     */
    private identifyMostImprovedSkills(
        skillLevels: Record<ErrorCategory, number>,
        exerciseHistory: Record<ErrorCategory, {
            totalAttempts: number;
            successRate: number;
            lastPracticed: Date;
        }>
    ): ErrorCategory[] {
        // Calculer une métrique d'amélioration basée sur le taux de réussite
        // et le nombre total de tentatives
        const improvementMetrics: Array<[ErrorCategory, number]> = [];

        Object.entries(exerciseHistory).forEach(([category, history]) => {
            const skillCategory = category as ErrorCategory;
            // Les compétences avec un bon taux de réussite et beaucoup de pratique sont considérées comme améliorées
            const improvementScore = history.successRate * Math.min(history.totalAttempts / 10, 1);
            improvementMetrics.push([skillCategory, improvementScore]);
        });

        // Trier par score d'amélioration décroissant
        improvementMetrics.sort((a, b) => b[1] - a[1]);

        // Retourner les 2 compétences les plus améliorées
        return improvementMetrics.slice(0, 2).map(([category]) => category);
    }

    /**
     * Identifie les compétences qui nécessitent plus de travail
     * en fonction du niveau CECRL attendu
     * 
     * @param skillLevels - Niveaux de compétence actuels
     * @param level - Niveau CECRL de l'utilisateur
     * @returns Liste des compétences nécessitant du travail
     */
    private identifySkillsNeedingImprovement(
        skillLevels: Record<ErrorCategory, number>,
        level: CECRLLevel
    ): ErrorCategory[] {
        // Niveaux de compétence attendus pour chaque niveau CECRL
        const expectedLevels = this.getExpectedSkillLevels(level);

        // Calculer l'écart entre le niveau attendu et le niveau actuel
        const skillGaps: Array<[ErrorCategory, number]> = [];

        Object.entries(expectedLevels).forEach(([category, expectedLevel]) => {
            const skillCategory = category as ErrorCategory;
            const currentLevel = skillLevels[skillCategory] || 0;
            const gap = Math.max(0, expectedLevel - currentLevel);
            skillGaps.push([skillCategory, gap]);
        });

        // Trier par écart décroissant
        skillGaps.sort((a, b) => b[1] - a[1]);

        // Retourner les 3 compétences avec le plus grand écart
        return skillGaps.slice(0, 3).map(([category]) => category);
    }

    /**
     * Calcule un score global de maîtrise en fonction du niveau CECRL
     * 
     * @param skillLevels - Niveaux de compétence actuels
     * @param level - Niveau CECRL de l'utilisateur
     * @returns Score de maîtrise (0-100)
     */
    private calculateOverallMasteryScore(
        skillLevels: Record<ErrorCategory, number>,
        level: CECRLLevel
    ): number {
        // Niveaux de compétence attendus pour chaque niveau CECRL
        const expectedLevels = this.getExpectedSkillLevels(level);

        // Pondération de l'importance de chaque compétence
        const skillWeights = this.getSkillWeightsByLevel(level);

        let weightedScore = 0;
        let totalWeight = 0;

        Object.entries(expectedLevels).forEach(([category, expectedLevel]) => {
            const skillCategory = category as ErrorCategory;
            const currentLevel = skillLevels[skillCategory] || 0;
            const weight = skillWeights[skillCategory] || 1;

            // Calculer le score relatif (par rapport au niveau attendu)
            const relativeScore = Math.min(100, (currentLevel / expectedLevel) * 100);

            weightedScore += relativeScore * weight;
            totalWeight += weight;
        });

        // Calculer le score moyen pondéré
        return Math.round(weightedScore / totalWeight);
    }

    /**
     * Obtient les niveaux de compétence attendus pour un niveau CECRL
     * 
     * @param level - Niveau CECRL
     * @returns Niveaux de compétence attendus
     */
    private getExpectedSkillLevels(level: CECRLLevel): Record<ErrorCategory, number> {
        const baseExpectation: Record<CECRLLevel, Record<ErrorCategory, number>> = {
            [CECRLLevel.A1]: {
                [ErrorCategory.VOCABULARY]: 30,
                [ErrorCategory.GRAMMAR]: 20,
                [ErrorCategory.SYNTAX]: 15,
                [ErrorCategory.CULTURAL]: 10,
                [ErrorCategory.SPATIAL]: 15,
                [ErrorCategory.TEMPORAL]: 10,
                [ErrorCategory.PROSODY]: 10,
                [ErrorCategory.EXPRESSION]: 15
            },
            [CECRLLevel.A2]: {
                [ErrorCategory.VOCABULARY]: 45,
                [ErrorCategory.GRAMMAR]: 35,
                [ErrorCategory.SYNTAX]: 30,
                [ErrorCategory.CULTURAL]: 20,
                [ErrorCategory.SPATIAL]: 30,
                [ErrorCategory.TEMPORAL]: 20,
                [ErrorCategory.PROSODY]: 20,
                [ErrorCategory.EXPRESSION]: 30
            },
            [CECRLLevel.B1]: {
                [ErrorCategory.VOCABULARY]: 60,
                [ErrorCategory.GRAMMAR]: 50,
                [ErrorCategory.SYNTAX]: 45,
                [ErrorCategory.CULTURAL]: 35,
                [ErrorCategory.SPATIAL]: 45,
                [ErrorCategory.TEMPORAL]: 35,
                [ErrorCategory.PROSODY]: 35,
                [ErrorCategory.EXPRESSION]: 45
            },
            [CECRLLevel.B2]: {
                [ErrorCategory.VOCABULARY]: 75,
                [ErrorCategory.GRAMMAR]: 65,
                [ErrorCategory.SYNTAX]: 60,
                [ErrorCategory.CULTURAL]: 50,
                [ErrorCategory.SPATIAL]: 60,
                [ErrorCategory.TEMPORAL]: 50,
                [ErrorCategory.PROSODY]: 50,
                [ErrorCategory.EXPRESSION]: 60
            },
            [CECRLLevel.C1]: {
                [ErrorCategory.VOCABULARY]: 85,
                [ErrorCategory.GRAMMAR]: 80,
                [ErrorCategory.SYNTAX]: 80,
                [ErrorCategory.CULTURAL]: 70,
                [ErrorCategory.SPATIAL]: 80,
                [ErrorCategory.TEMPORAL]: 70,
                [ErrorCategory.PROSODY]: 70,
                [ErrorCategory.EXPRESSION]: 80
            },
            [CECRLLevel.C2]: {
                [ErrorCategory.VOCABULARY]: 95,
                [ErrorCategory.GRAMMAR]: 90,
                [ErrorCategory.SYNTAX]: 90,
                [ErrorCategory.CULTURAL]: 85,
                [ErrorCategory.SPATIAL]: 90,
                [ErrorCategory.TEMPORAL]: 85,
                [ErrorCategory.PROSODY]: 85,
                [ErrorCategory.EXPRESSION]: 90
            }
        };

        return baseExpectation[level] || {
            [ErrorCategory.VOCABULARY]: 50,
            [ErrorCategory.GRAMMAR]: 50,
            [ErrorCategory.SYNTAX]: 50,
            [ErrorCategory.CULTURAL]: 50,
            [ErrorCategory.SPATIAL]: 50,
            [ErrorCategory.TEMPORAL]: 50,
            [ErrorCategory.PROSODY]: 50,
            [ErrorCategory.EXPRESSION]: 50
        };
    }

    /**
     * Obtient les pondérations des compétences selon le niveau CECRL
     * 
     * @param level - Niveau CECRL
     * @returns Pondérations pour chaque compétence
     */
    private getSkillWeightsByLevel(level: CECRLLevel): Record<ErrorCategory, number> {
        const weights: Record<CECRLLevel, Record<ErrorCategory, number>> = {
            [CECRLLevel.A1]: {
                [ErrorCategory.VOCABULARY]: 3.0,
                [ErrorCategory.GRAMMAR]: 2.5,
                [ErrorCategory.SYNTAX]: 2.0,
                [ErrorCategory.CULTURAL]: 1.0,
                [ErrorCategory.SPATIAL]: 2.0,
                [ErrorCategory.TEMPORAL]: 1.0,
                [ErrorCategory.PROSODY]: 1.0,
                [ErrorCategory.EXPRESSION]: 1.5
            },
            [CECRLLevel.A2]: {
                [ErrorCategory.VOCABULARY]: 2.5,
                [ErrorCategory.GRAMMAR]: 2.5,
                [ErrorCategory.SYNTAX]: 2.0,
                [ErrorCategory.CULTURAL]: 1.5,
                [ErrorCategory.SPATIAL]: 2.0,
                [ErrorCategory.TEMPORAL]: 1.5,
                [ErrorCategory.PROSODY]: 1.0,
                [ErrorCategory.EXPRESSION]: 2.0
            },
            [CECRLLevel.B1]: {
                [ErrorCategory.VOCABULARY]: 2.0,
                [ErrorCategory.GRAMMAR]: 2.5,
                [ErrorCategory.SYNTAX]: 2.5,
                [ErrorCategory.CULTURAL]: 1.5,
                [ErrorCategory.SPATIAL]: 2.5,
                [ErrorCategory.TEMPORAL]: 2.0,
                [ErrorCategory.PROSODY]: 1.5,
                [ErrorCategory.EXPRESSION]: 2.0
            },
            [CECRLLevel.B2]: {
                [ErrorCategory.VOCABULARY]: 2.0,
                [ErrorCategory.GRAMMAR]: 2.0,
                [ErrorCategory.SYNTAX]: 2.5,
                [ErrorCategory.CULTURAL]: 2.0,
                [ErrorCategory.SPATIAL]: 2.5,
                [ErrorCategory.TEMPORAL]: 2.0,
                [ErrorCategory.PROSODY]: 2.0,
                [ErrorCategory.EXPRESSION]: 2.5
            },
            [CECRLLevel.C1]: {
                [ErrorCategory.VOCABULARY]: 1.5,
                [ErrorCategory.GRAMMAR]: 2.0,
                [ErrorCategory.SYNTAX]: 2.5,
                [ErrorCategory.CULTURAL]: 2.5,
                [ErrorCategory.SPATIAL]: 2.5,
                [ErrorCategory.TEMPORAL]: 2.5,
                [ErrorCategory.PROSODY]: 2.5,
                [ErrorCategory.EXPRESSION]: 3.0
            },
            [CECRLLevel.C2]: {
                [ErrorCategory.VOCABULARY]: 1.5,
                [ErrorCategory.GRAMMAR]: 1.5,
                [ErrorCategory.SYNTAX]: 2.0,
                [ErrorCategory.CULTURAL]: 3.0,
                [ErrorCategory.SPATIAL]: 2.5,
                [ErrorCategory.TEMPORAL]: 2.5,
                [ErrorCategory.PROSODY]: 3.0,
                [ErrorCategory.EXPRESSION]: 3.0
            }
        };

        return weights[level] || {
            [ErrorCategory.VOCABULARY]: 2.0,
            [ErrorCategory.GRAMMAR]: 2.0,
            [ErrorCategory.SYNTAX]: 2.0,
            [ErrorCategory.CULTURAL]: 2.0,
            [ErrorCategory.SPATIAL]: 2.0,
            [ErrorCategory.TEMPORAL]: 2.0,
            [ErrorCategory.PROSODY]: 2.0,
            [ErrorCategory.EXPRESSION]: 2.0
        };
    }
}