/**
 * Système d'évaluation CECRL pour l'apprentissage de la LSF
 * 
 * @file src/ai/services/learning/evaluation/EvaluationCECRL.ts
 * @module ai/services/learning/evaluation
 * @description Évaluation des niveaux CECRL adaptée à la LSF selon le diagramme d'état
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 1.0.0
 * @since 2025
 * @lastModified 2025-01-22
 */

import type { CECRLLevel } from '@learning/types/LearningPathTypes';
import type { UserReverseProfile } from '@learning/human/coda/codavirtuel/types';
import { Logger } from '@ai/utils/Logger';

export interface CECRLEvaluationResult {
    level: CECRLLevel;
    score: number;
    feedback: string;
}

export interface CategoryEvaluationResult {
    category: CECRLCategory;
    score: number;
    feedback: string;
}

export interface EvaluationData {
    context: 'initial' | 'progress' | 'certification' | 'self_assessment';
    exerciseResponses: readonly {
        questionId: string;
        userResponse: string;
        correctAnswer: string;
    }[];
    evaluationDuration: number;
}

/**
 * Catégories d'évaluation CECRL pour la LSF
 */
export const CECRL_CATEGORIES = {
    VOCABULAIRE: 'vocabulaire',
    GRAMMAIRE: 'grammaire',
    EXPRESSION: 'expression',
    COMPREHENSION: 'comprehension',
    INTERACTION: 'interaction',
    CULTURE: 'culture'
} as const;

export type CECRLCategory = typeof CECRL_CATEGORIES[keyof typeof CECRL_CATEGORIES];

/**
 * Critères d'évaluation par niveau CECRL
 */
interface CECRLCriteria {
    /**
     * Analyse les données de performance pour une catégorie
     * 
     * @param category - Catégorie
     * @param evaluationData - Données d'évaluation
     * @returns number Score basé sur la performance (0-100)
     * @private
     */
    private analyzePerformanceData(
        category: CECRLCategory,
        evaluationData: EvaluationData
    ): number {
    // Analyse simplifiée des réponses aux exercices
    const responses = evaluationData.exerciseResponses;
    let categoryScore = 70; // Score par défaut

    // Ajustements basés sur le contexte d'évaluation
    switch (evaluationData.context) {
        case 'initial':
            categoryScore *= 0.9; // Plus conservateur
            break;
        case 'progress':
            categoryScore *= 1.0; // Score normal
            break;
        case 'certification':
            categoryScore *= 1.1; // Plus strict mais valorisant
            break;
        case 'self_assessment':
            categoryScore *= 0.8; // Auto-évaluation tend à surestimer
            break;
    }

    // Ajustement selon la durée (trop court = moins fiable)
    if (evaluationData.evaluationDuration < 30) {
        categoryScore *= 0.85;
    } else if (evaluationData.evaluationDuration > 90) {
        categoryScore *= 0.95; // Fatigue possible
    }

    return Math.max(0, Math.min(100, Math.round(categoryScore)));
}

    /**
     * Détermine le niveau CECRL atteint selon un score
     * 
     * @param score - Score obtenu (0-100)
     * @returns CECRLLevel Niveau correspondant
     * @private
     */
    private determineAchievedLevel(score: number): CECRLLevel {
    if (score >= 95) return 'C2';
    if (score >= 85) return 'C1';
    if (score >= 75) return 'B2';
    if (score >= 65) return 'B1';
    if (score >= 55) return 'A2';
    return 'A1';
}

    /**
     * Détermine le niveau global à partir des résultats par catégorie
     * 
     * @param categoryResults - Résultats par catégorie
     * @returns CECRLLevel Niveau global
     * @private
     */
    private determineOverallLevel(categoryResults: readonly CategoryEvaluationResult[]): CECRLLevel {
    // Calcul du niveau moyen pondéré
    const levelWeights = {
        'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6
    };

    const categoryWeights = {
        [CECRL_CATEGORIES.VOCABULAIRE]: 1.2,
        [CECRL_CATEGORIES.GRAMMAIRE]: 1.2,
        [CECRL_CATEGORIES.EXPRESSION]: 1.1,
        [CECRL_CATEGORIES.COMPREHENSION]: 1.1,
        [CECRL_CATEGORIES.INTERACTION]: 1.0,
        [CECRL_CATEGORIES.CULTURE]: 0.8
    };

    let weightedSum = 0;
    let totalWeight = 0;

    for (const result of categoryResults) {
        const levelValue = levelWeights[result.achievedLevel];
        const categoryWeight = categoryWeights[result.category];

        weightedSum += levelValue * categoryWeight;
        totalWeight += categoryWeight;
    }

    const averageLevel = weightedSum / totalWeight;

    // Conversion vers niveau CECRL
    if (averageLevel >= 5.5) return 'C2';
    if (averageLevel >= 4.5) return 'C1';
    if (averageLevel >= 3.5) return 'B2';
    if (averageLevel >= 2.5) return 'B1';
    if (averageLevel >= 1.5) return 'A2';
    return 'A1';
}

    /**
     * Calcule le score global
     * 
     * @param categoryResults - Résultats par catégorie
     * @returns number Score global (0-100)
     * @private
     */
    private calculateOverallScore(categoryResults: readonly CategoryEvaluationResult[]): number {
    const categoryWeights = {
        [CECRL_CATEGORIES.VOCABULAIRE]: 1.2,
        [CECRL_CATEGORIES.GRAMMAIRE]: 1.2,
        [CECRL_CATEGORIES.EXPRESSION]: 1.1,
        [CECRL_CATEGORIES.COMPREHENSION]: 1.1,
        [CECRL_CATEGORIES.INTERACTION]: 1.0,
        [CECRL_CATEGORIES.CULTURE]: 0.8
    };

    let weightedSum = 0;
    let totalWeight = 0;

    for (const result of categoryResults) {
        const categoryWeight = categoryWeights[result.category];
        weightedSum += result.score * categoryWeight;
        totalWeight += categoryWeight;
    }

    return Math.round(weightedSum / totalWeight);
}

    /**
     * Identifie les points forts d'une catégorie
     * 
     * @param category - Catégorie
     * @param score - Score obtenu
     * @param profile - Profil utilisateur
     * @returns string[] Points forts
     * @private
     */
    private identifyStrengths(
    category: CECRLCategory,
    score: number,
    profile: UserReverseProfile
): readonly string[] {
    const strengths: string[] = [];

    if (score >= 80) {
        const categoryStrengths = {
            [CECRL_CATEGORIES.VOCABULAIRE]: [
                'Vocabulaire riche et varié',
                'Maîtrise des termes techniques',
                'Créativité lexicale'
            ],
            [CECRL_CATEGORIES.GRAMMAIRE]: [
                'Structures grammaticales maîtrisées',
                'Usage correct des temps',
                'Syntaxe claire'
            ],
            [CECRL_CATEGORIES.EXPRESSION]: [
                'Expression fluide et naturelle',
                'Organisation du discours',
                'Clarté du message'
            ],
            [CECRL_CATEGORIES.COMPREHENSION]: [
                'Compréhension rapide',
                'Saisie des nuances',
                'Adaptation au contexte'
            ],
            [CECRL_CATEGORIES.INTERACTION]: [
                'Aisance relationnelle',
                'Gestion des échanges',
                'Spontanéité'
            ],
            [CECRL_CATEGORIES.CULTURE]: [
                'Connaissance culturelle approfondie',
                'Sensibilité aux codes sociaux',
                'Respect des normes communautaires'
            ]
        };

        const availableStrengths = categoryStrengths[category] ?? [];
        const numStrengths = Math.min(2, Math.floor(score / 30));

        for (let i = 0; i < numStrengths; i++) {
            if (availableStrengths[i]) {
                strengths.push(availableStrengths[i]);
            }
        }
    }

    return strengths;
}

    /**
     * Identifie les points à améliorer d'une catégorie
     * 
     * @param category - Catégorie
     * @param score - Score obtenu
     * @param profile - Profil utilisateur
     * @returns string[] Points faibles
     * @private
     */
    private identifyWeaknesses(
    category: CECRLCategory,
    score: number,
    profile: UserReverseProfile
): readonly string[] {
    const weaknesses: string[] = [];

    if (score < 70) {
        const categoryWeaknesses = {
            [CECRL_CATEGORIES.VOCABULAIRE]: [
                'Vocabulaire limité',
                'Hésitations lexicales',
                'Répétitions fréquentes'
            ],
            [CECRL_CATEGORIES.GRAMMAIRE]: [
                'Erreurs grammaticales',
                'Structures simplistes',
                'Confusion des temps'
            ],
            [CECRL_CATEGORIES.EXPRESSION]: [
                'Expression hésitante',
                'Organisation du discours',
                'Manque de fluidité'
            ],
            [CECRL_CATEGORIES.COMPREHENSION]: [
                'Compréhension partielle',
                'Besoin de répétitions',
                'Difficultés avec l\'implicite'
            ],
            [CECRL_CATEGORIES.INTERACTION]: [
                'Timidité en interaction',
                'Difficultés d\'adaptation',
                'Dépendance à l\'aide'
            ],
            [CECRL_CATEGORIES.CULTURE]: [
                'Connaissances culturelles limitées',
                'Méconnaissance des codes',
                'Stéréotypes persistants'
            ]
        };

        const availableWeaknesses = categoryWeaknesses[category] ?? [];
        const numWeaknesses = Math.min(2, Math.floor((100 - score) / 30));

        for (let i = 0; i < numWeaknesses; i++) {
            if (availableWeaknesses[i]) {
                weaknesses.push(availableWeaknesses[i]);
            }
        }
    }

    return weaknesses;
}

    /**
     * Génère un feedback pour une catégorie
     * 
     * @param category - Catégorie
     * @param score - Score obtenu
     * @param level - Niveau atteint
     * @returns string Feedback détaillé
     * @private
     */
    private generateCategoryFeedback(
    category: CECRLCategory,
    score: number,
    level: CECRLLevel
): string {
    const categoryNames = {
        [CECRL_CATEGORIES.VOCABULAIRE]: 'vocabulaire',
        [CECRL_CATEGORIES.GRAMMAIRE]: 'grammaire',
        [CECRL_CATEGORIES.EXPRESSION]: 'expression',
        [CECRL_CATEGORIES.COMPREHENSION]: 'compréhension',
        [CECRL_CATEGORIES.INTERACTION]: 'interaction',
        [CECRL_CATEGORIES.CULTURE]: 'culture'
    };

    const categoryName = categoryNames[category];

    if (score >= 85) {
        return `Excellente maîtrise du ${categoryName}. Votre niveau ${level} reflète une aisance remarquable dans cette dimension.`;
    } else if (score >= 70) {
        return `Bonne maîtrise du ${categoryName}. Niveau ${level} consolidé avec quelques axes d'amélioration.`;
    } else if (score >= 55) {
        return `Maîtrise correcte du ${categoryName}. Niveau ${level} en cours d'acquisition, travail régulier recommandé.`;
    } else {
        return `Le ${categoryName} nécessite un renforcement. Niveau ${level} fragile, pratique intensive conseillée.`;
    }
}

    /**
     * Génère les recommandations d'apprentissage
     * 
     * @param categoryResults - Résultats par catégorie
     * @param overallLevel - Niveau global
     * @returns string[] Recommandations
     * @private
     */
    private generateRecommendations(
    categoryResults: readonly CategoryEvaluationResult[],
    overallLevel: CECRLLevel
): readonly string[] {
    const recommendations: string[] = [];

    // Recommandations basées sur les catégories les plus faibles
    const weakestCategories = [...categoryResults]
        .sort((a, b) => a.score - b.score)
        .slice(0, 2);

    for (const category of weakestCategories) {
        if (category.score < 70) {
            recommendations.push(
                `Renforcer ${category.category} par des exercices ciblés et pratique régulière`
            );
        }
    }

    // Recommandations selon le niveau global
    const levelRecommendations = {
        'A1': [
            'Concentrez-vous sur le vocabulaire de base et les structures simples',
            'Pratiquez les dialogues quotidiens',
            'Familiarisez-vous avec la culture sourde'
        ],
        'A2': [
            'Développez votre capacité à raconter des expériences',
            'Travaillez l\'expression des sentiments et opinions',
            'Enrichissez votre vocabulaire thématique'
        ],
        'B1': [
            'Perfectionnez l\'argumentation et la justification',
            'Travaillez les registres de langue',
            'Développez l\'autonomie en interaction'
        ],
        'B2': [
            'Affinez la précision et les nuances',
            'Maîtrisez les implicites culturels',
            'Développez l\'expression créative'
        ],
        'C1': [
            'Perfectionnez la spontanéité et la fluidité',
            'Travaillez les styles et registres avancés',
            'Développez le leadership communicationnel'
        ],
        'C2': [
            'Maintenez l\'excellence par la pratique variée',
            'Explorez la création et l\'innovation linguistique',
            'Partagez vos compétences par l\'enseignement'
        ]
    };

    recommendations.push(...(levelRecommendations[overallLevel] ?? []));

    return recommendations.slice(0, 5); // Limiter à 5 recommandations
}

    /**
     * Génère les prochaines étapes
     * 
     * @param categoryResults - Résultats par catégorie
     * @param overallLevel - Niveau global
     * @returns string[] Prochaines étapes
     * @private
     */
    private generateNextSteps(
    categoryResults: readonly CategoryEvaluationResult[],
    overallLevel: CECRLLevel
): readonly string[] {
    const nextSteps: string[] = [];

    // Étapes basées sur le niveau actuel et le suivant
    const levelIndex = this.getLevelIndex(overallLevel);

    if (levelIndex < CECRL_CRITERIA_DATA.length - 1) {
        const nextLevelCriteria = CECRL_CRITERIA_DATA[levelIndex + 1];

        nextSteps.push(
            `Préparer la progression vers le niveau ${nextLevelCriteria.level}`,
            `Travailler les compétences clés : ${nextLevelCriteria.expectedSkills.join(', ')}`
        );
    }

    // Étapes immédiates basées sur les faiblesses
    const immediateActions = categoryResults
        .filter(result => result.score < 65)
        .map(result => `Améliorer ${result.category} par des exercices quotidiens`)
        .slice(0, 2);

    nextSteps.push(...immediateActions);

    // Étape de réévaluation
    nextSteps.push('Planifier une réévaluation dans 3-6 mois');

    return nextSteps.slice(0, 4);
}

    /**
     * Obtient l'index d'un niveau CECRL
     * 
     * @param level - Niveau CECRL
     * @returns number Index du niveau
     * @private
     */
    private getLevelIndex(level: CECRLLevel): number {
    return CECRL_CRITERIA_DATA.findIndex(criteria => criteria.level === level);
}

    /**
     * Génère un identifiant unique d'évaluation
     * 
     * @param userId - Identifiant utilisateur
     * @returns string Identifiant d'évaluation
     * @private
     */
    private generateEvaluationId(userId: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `eval-cecrl-${userId}-${timestamp}-${random}`;
}

    /**
     * Détermine la période de validité selon le contexte
     * 
     * @param context - Contexte d'évaluation
     * @returns number Période en mois
     * @private
     */
    private getValidityPeriod(context: EvaluationData['context']): number {
    const validityPeriods = {
        'initial': 12,        // 1 an pour évaluation initiale
        'progress': 6,        // 6 mois pour suivi progrès
        'certification': 24,  // 2 ans pour certification
        'self_assessment': 3  // 3 mois pour auto-évaluation
    };

    return validityPeriods[context];
}
} Niveau CECRL */
    readonly level: CECRLLevel;
    /** Description du niveau */
    readonly description: string;
    /** Critères par catégorie */
    readonly criteria: Record<CECRLCategory, string>;
    /** Score minimum requis (0-100) */
    readonly minimumScore: number;
    /** Compétences attendues */
    readonly expectedSkills: readonly string[];
}

/**
 * Résultat d'évaluation pour une catégorie
 */
interface CategoryEvaluationResult {
    /** Catégorie évaluée */
    readonly category: CECRLCategory;
    /** Score obtenu (0-100) */
    readonly score: number;
    /** Niveau atteint pour cette catégorie */
    readonly achievedLevel: CECRLLevel;
    /** Points forts identifiés */
    readonly strengths: readonly string[];
    /** Points à améliorer */
    readonly weaknesses: readonly string[];
    /** Commentaires détaillés */
    readonly feedback: string;
}

/**
 * Résultat complet d'évaluation CECRL
 */
interface CECRLEvaluationResult {
    /** Identifiant unique de l'évaluation */
    readonly evaluationId: string;
    /** Identifiant de l'utilisateur évalué */
    readonly userId: string;
    /** Niveau CECRL déterminé */
    readonly overallLevel: CECRLLevel;
    /** Score global (0-100) */
    readonly overallScore: number;
    /** Résultats par catégorie */
    readonly categoryResults: readonly CategoryEvaluationResult[];
    /** Recommandations d'apprentissage */
    readonly recommendations: readonly string[];
    /** Prochaines étapes suggérées */
    readonly nextSteps: readonly string[];
    /** Date de l'évaluation */
    readonly evaluationDate: Date;
    /** Validité de l'évaluation (en mois) */
    readonly validityPeriod: number;
}

/**
 * Données d'évaluation soumises
 */
interface EvaluationData {
    /** Réponses aux exercices */
    readonly exerciseResponses: Record<string, unknown>;
    /** Vidéos de démonstration LSF */
    readonly demonstrationVideos?: readonly string[];
    /** Durée de l'évaluation (minutes) */
    readonly evaluationDuration: number;
    /** Contexte de l'évaluation */
    readonly context: 'initial' | 'progress' | 'certification' | 'self_assessment';
}

/**
 * Critères CECRL pour la LSF - Données de référence
 */
const CECRL_CRITERIA_DATA: readonly CECRLCriteria[] = [
    {
        level: 'A1',
        description: 'Niveau élémentaire - Découverte de la LSF',
        minimumScore: 50,
        expectedSkills: [
            'salutations_base',
            'presentation_soi',
            'vocabulaire_quotidien',
            'nombres_simples'
        ],
        criteria: {
            [CECRL_CATEGORIES.VOCABULAIRE]: 'Vocabulaire de base (famille, maison, travail)',
            [CECRL_CATEGORIES.GRAMMAIRE]: 'Structures simples, présent',
            [CECRL_CATEGORIES.EXPRESSION]: 'Phrases courtes et simples',
            [CECRL_CATEGORIES.COMPREHENSION]: 'Messages simples et lents',
            [CECRL_CATEGORIES.INTERACTION]: 'Échanges basiques avec aide',
            [CECRL_CATEGORIES.CULTURE]: 'Notions de base sur la culture sourde'
        }
    },
    {
        level: 'A2',
        description: 'Niveau élémentaire - Survie en LSF',
        minimumScore: 60,
        expectedSkills: [
            'conversations_courantes',
            'expressions_temps',
            'descriptions_simples',
            'demandes_information'
        ],
        criteria: {
            [CECRL_CATEGORIES.VOCABULAIRE]: 'Vocabulaire familier et professionnel de base',
            [CECRL_CATEGORIES.GRAMMAIRE]: 'Temps simples, négation',
            [CECRL_CATEGORIES.EXPRESSION]: 'Descriptions courtes d\'expériences',
            [CECRL_CATEGORIES.COMPREHENSION]: 'Sujets familiers à rythme normal',
            [CECRL_CATEGORIES.INTERACTION]: 'Conversations simples et directes',
            [CECRL_CATEGORIES.CULTURE]: 'Codes culturels essentiels'
        }
    },
    {
        level: 'B1',
        description: 'Niveau indépendant - Seuil LSF',
        minimumScore: 70,
        expectedSkills: [
            'recits_experiences',
            'opinions_personnelles',
            'projets_futurs',
            'gestion_imprevus'
        ],
        criteria: {
            [CECRL_CATEGORIES.VOCABULAIRE]: 'Vocabulaire étendu sur centres d\'intérêt',
            [CECRL_CATEGORIES.GRAMMAIRE]: 'Tous les temps, structures complexes',
            [CECRL_CATEGORIES.EXPRESSION]: 'Textes cohérents sur sujets familiers',
            [CECRL_CATEGORIES.COMPREHENSION]: 'Points essentiels sur sujets variés',
            [CECRL_CATEGORIES.INTERACTION]: 'Conversations spontanées',
            [CECRL_CATEGORIES.CULTURE]: 'Nuances culturelles et régionales'
        }
    },
    {
        level: 'B2',
        description: 'Niveau indépendant - Avancé LSF',
        minimumScore: 80,
        expectedSkills: [
            'argumentations_complexes',
            'registres_varies',
            'adaptation_interlocuteur',
            'meta_communication'
        ],
        criteria: {
            [CECRL_CATEGORIES.VOCABULAIRE]: 'Vocabulaire large et précis',
            [CECRL_CATEGORIES.GRAMMAIRE]: 'Structures avancées avec aisance',
            [CECRL_CATEGORIES.EXPRESSION]: 'Textes clairs et détaillés',
            [CECRL_CATEGORIES.COMPREHENSION]: 'Textes complexes et abstraits',
            [CECRL_CATEGORIES.INTERACTION]: 'Aisance et spontanéité',
            [CECRL_CATEGORIES.CULTURE]: 'Subtilités et références culturelles'
        }
    },
    {
        level: 'C1',
        description: 'Niveau expérimenté - Autonome LSF',
        minimumScore: 90,
        expectedSkills: [
            'expression_spontanee',
            'nuances_fines',
            'styles_varies',
            'leadership_communication'
        ],
        criteria: {
            [CECRL_CATEGORIES.VOCABULAIRE]: 'Vocabulaire très étendu et précis',
            [CECRL_CATEGORIES.GRAMMAIRE]: 'Maîtrise complète des structures',
            [CECRL_CATEGORIES.EXPRESSION]: 'Textes bien structurés et nuancés',
            [CECRL_CATEGORIES.COMPREHENSION]: 'Compréhension fine et implicite',
            [CECRL_CATEGORIES.INTERACTION]: 'Communication naturelle et fluide',
            [CECRL_CATEGORIES.CULTURE]: 'Maîtrise des codes socioculturels'
        }
    },
    {
        level: 'C2',
        description: 'Niveau expérimenté - Maîtrise LSF',
        minimumScore: 95,
        expectedSkills: [
            'virtuosite_expression',
            'creation_artistique',
            'enseignement_lsf',
            'interpretation'
        ],
        criteria: {
            [CECRL_CATEGORIES.VOCABULAIRE]: 'Vocabulaire exhaustif et créatif',
            [CECRL_CATEGORIES.GRAMMAIRE]: 'Maîtrise parfaite, créativité linguistique',
            [CECRL_CATEGORIES.EXPRESSION]: 'Expression raffinée et personnelle',
            [CECRL_CATEGORIES.COMPREHENSION]: 'Compréhension totale, implicites subtils',
            [CECRL_CATEGORIES.INTERACTION]: 'Aisance parfaite en tous contextes',
            [CECRL_CATEGORIES.CULTURE]: 'Expertise culturelle et historique'
        }
    }
] as const;

/**
 * Système d'évaluation CECRL pour la LSF
 * 
 * @class EvaluationCECRL
 * @example
 * ```typescript
 * const evaluator = new EvaluationCECRL();
 * const result = await evaluator.evaluateUser(userId, profile, evaluationData);
 * console.log(`Niveau CECRL: ${result.overallLevel}`);
 * ```
 */
export class EvaluationCECRL {
    private readonly logger = Logger.getInstance('EvaluationCECRL');

    /**
     * Évalue le niveau CECRL d'un utilisateur
     * 
     * @param userId - Identifiant de l'utilisateur
     * @param profile - Profil utilisateur actuel
     * @param evaluationData - Données d'évaluation
     * @returns Promise<CECRLEvaluationResult> Résultat de l'évaluation
     */
    public async evaluateUser(
        userId: string,
        profile: UserReverseProfile,
        evaluationData: EvaluationData
    ): Promise<CECRLEvaluationResult> {
        this.logger.info('Début de l\'évaluation CECRL', {
            userId,
            currentLevel: profile.currentLevel,
            context: evaluationData.context
        });

        try {
            // Évaluation par catégorie
            const categoryResults = await this.evaluateAllCategories(
                userId,
                profile,
                evaluationData
            );

            // Détermination du niveau global
            const overallLevel = this.determineOverallLevel(categoryResults);
            const overallScore = this.calculateOverallScore(categoryResults);

            // Génération des recommandations
            const recommendations = this.generateRecommendations(categoryResults, overallLevel);
            const nextSteps = this.generateNextSteps(categoryResults, overallLevel);

            const result: CECRLEvaluationResult = {
                evaluationId: this.generateEvaluationId(userId),
                userId,
                overallLevel,
                overallScore,
                categoryResults,
                recommendations,
                nextSteps,
                evaluationDate: new Date(),
                validityPeriod: this.getValidityPeriod(evaluationData.context)
            };

            this.logger.info('Évaluation CECRL terminée', {
                userId,
                overallLevel,
                overallScore,
                evaluationId: result.evaluationId
            });

            return result;

        } catch (error) {
            this.logger.error('Erreur lors de l\'évaluation CECRL', {
                userId,
                error
            });
            throw error;
        }
    }

    /**
     * Obtient les critères pour un niveau donné
     * 
     * @param level - Niveau CECRL
     * @returns CECRLCriteria | undefined Critères du niveau
     */
    public getCriteriaForLevel(level: CECRLLevel): CECRLCriteria | undefined {
        return CECRL_CRITERIA_DATA.find(criteria => criteria.level === level);
    }

    /**
     * Obtient tous les niveaux disponibles avec leurs descriptions
     * 
     * @returns Readonly<CECRLCriteria[]> Liste des critères
     */
    public getAllLevelsCriteria(): readonly CECRLCriteria[] {
        return CECRL_CRITERIA_DATA;
    }

    /**
     * Évalue si un utilisateur peut passer au niveau suivant
     * 
     * @param currentResult - Résultat d'évaluation actuel
     * @returns boolean True si progression possible
     */
    public canProgressToNextLevel(currentResult: CECRLEvaluationResult): boolean {
        const currentLevelIndex = this.getLevelIndex(currentResult.overallLevel);

        // Déjà au niveau maximum
        if (currentLevelIndex >= CECRL_CRITERIA_DATA.length - 1) {
            return false;
        }

        // Vérifier si le score global est suffisant pour le niveau actuel
        const currentCriteria = CECRL_CRITERIA_DATA[currentLevelIndex];
        const scoreMargin = currentResult.overallScore - currentCriteria.minimumScore;

        // Besoin d'une marge de 15 points au-dessus du minimum
        return scoreMargin >= 15;
    }

    /**
     * Évalue toutes les catégories CECRL
     * 
     * @param userId - Identifiant utilisateur
     * @param profile - Profil utilisateur
     * @param evaluationData - Données d'évaluation
     * @returns Promise<CategoryEvaluationResult[]> Résultats par catégorie
     * @private
     */
    private async evaluateAllCategories(
        userId: string,
        profile: UserReverseProfile,
        evaluationData: EvaluationData
    ): Promise<readonly CategoryEvaluationResult[]> {
        const results: CategoryEvaluationResult[] = [];

        for (const category of Object.values(CECRL_CATEGORIES)) {
            const result = await this.evaluateCategory(
                category,
                userId,
                profile,
                evaluationData
            );
            results.push(result);
        }

        return results;
    }

    /**
     * Évalue une catégorie spécifique
     * 
     * @param category - Catégorie à évaluer
     * @param userId - Identifiant utilisateur
     * @param profile - Profil utilisateur
     * @param evaluationData - Données d'évaluation
     * @returns Promise<CategoryEvaluationResult> Résultat de la catégorie
     * @private
     */
    private async evaluateCategory(
        category: CECRLCategory,
        userId: string,
        profile: UserReverseProfile,
        evaluationData: EvaluationData
    ): Promise<CategoryEvaluationResult> {
        // Simulation d'évaluation basée sur le profil et les données
        const baseScore = this.calculateBaseCategoryScore(category, profile);
        const performanceScore = this.analyzePerformanceData(category, evaluationData);

        const finalScore = Math.round((baseScore + performanceScore) / 2);
        const achievedLevel = this.determineAchievedLevel(finalScore);

        const strengths = this.identifyStrengths(category, finalScore, profile);
        const weaknesses = this.identifyWeaknesses(category, finalScore, profile);
        const feedback = this.generateCategoryFeedback(category, finalScore, achievedLevel);

        return {
            category,
            score: finalScore,
            achievedLevel,
            strengths,
            weaknesses,
            feedback
        };
    }

    /**
     * Calcule le score de base pour une catégorie
     * 
     * @param category - Catégorie
     * @param profile - Profil utilisateur
     * @returns number Score de base (0-100)
     * @private
     */
    private calculateBaseCategoryScore(
        category: CECRLCategory,
        profile: UserReverseProfile
    ): number {
        // Mapping du niveau actuel vers score de base
        const levelScores = {
            'A1': 45, 'A2': 55, 'B1': 65, 'B2': 75, 'C1': 85, 'C2': 95
        };

        const baseScore = levelScores[profile.currentLevel] ?? 50;

        // Ajustements selon la catégorie et les forces/faiblesses
        let categoryModifier = 0;

        if (profile.strengthAreas?.includes(category)) {
            categoryModifier += 10;
        }

        if (profile.weaknessAreas?.includes(category)) {
            categoryModifier -= 10;
        }

        return Math.max(0, Math.min(100, baseScore + categoryModifier));
    }

/**