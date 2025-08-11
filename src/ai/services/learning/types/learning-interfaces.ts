/**
 * Interfaces pour le système d'apprentissage
 * 
 * @file src/ai/services/learning/types/learning-interfaces.ts
 * @description Contient les interfaces et types communs utilisés dans le module d'apprentissage
 */

import { Adaptation } from './AdaptedContent';

/**
 * Niveaux de compétence
 */
export enum CompetencyLevel {
    NOVICE = 'novice',
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
    EXPERT = 'expert'
}

/**
 * Styles d'apprentissage
 */
export enum LearningStyle {
    VISUAL = 'visual',
    AUDITORY = 'auditory',
    READING_WRITING = 'reading_writing',
    KINESTHETIC = 'kinesthetic'
}

/**
 * Interface définissant le contexte de sortie d'une adaptation
 */
export interface AdaptationContext {
    /**
     * Identifiant de l'utilisateur
     */
    userId: string;

    /**
     * Timestamp de la dernière mise à jour (millisecondes)
     */
    timestamp: number;

    /**
     * Timestamp de la dernière mise à jour (millisecondes)
     */
    lastUpdate: number;

    /**
     * Message d'erreur en cas de problème
     */
    error?: string;

    /**
     * Indique si une erreur est survenue
     */
    hasError?: boolean;
}

/**
 * Interface pour les métadonnées d'adaptation
 */
export interface AdaptationMetadata {
    /**
     * Nombre d'adaptations générées
     */
    adaptationCount: number;

    /**
     * Niveau de confiance de l'adaptation (0-1)
     */
    confidence: number;

    /**
     * Temps de traitement en millisecondes
     */
    processingTime: number;

    /**
     * Message d'erreur en cas de problème
     */
    error?: string;
}

/**
 * Interface pour les prédictions utilisées dans l'adaptation
 */
export interface AdaptationPredictions {
    engagement?: {
        predictedEngagement: number;
        confidence: number;
        factors: string[];
        timestamp: Date;
    };
    frustration?: {
        score: number;
        level: string;
        confidence: number;
        contributingFactors: string[];
        recommendedInterventions: string[];
        timestamp: Date;
    };
}

/**
 * Interface définissant le résultat d'adaptation retourné par l'adaptateur intelligent
 */
export interface LearningAdaptation {
    /**
     * Les adaptations recommandées pour l'utilisateur
     */
    adaptations: Adaptation[];

    /**
     * Le contexte d'adaptation
     */
    context: AdaptationContext;

    /**
     * Métadonnées additionnelles sur l'adaptation
     */
    metadata: AdaptationMetadata;

    /**
     * Prédictions générées pour l'adaptation
     */
    predictions?: AdaptationPredictions;
}

/**
 * Contexte d'apprentissage représentant l'état actuel de l'utilisateur
 */
export interface LearningContext {
    /**
     * Identifiant unique de l'utilisateur
     */
    userId: string;

    /**
     * Timestamp du contexte d'apprentissage
     */
    timestamp?: Date;

    /**
     * Dernière activité de l'utilisateur
     */
    lastActivityTime?: Date;

    /**
     * Dernière adaptation appliquée
     */
    lastAdaptationTime?: Date;

    /**
     * Temps total passé sur l'apprentissage (en secondes)
     */
    totalTimeSpent?: number;

    /**
     * Nombre de sessions d'apprentissage
     */
    sessionCount?: number;

    /**
     * Taux de complétion des modules (0-1)
     */
    completionRate?: number;

    /**
     * Score moyen de l'utilisateur (0-1)
     */
    averageScore?: number;

    /**
     * Taux d'interaction avec l'interface (0-1)
     */
    interactionRate?: number;

    /**
     * Fréquence des pauses (par heure)
     */
    pauseFrequency?: number;

    /**
     * Taux d'erreur dans les exercices (0-1)
     */
    errorRate?: number;

    /**
     * Tendance de performance récente (-1 à 1)
     */
    performanceTrend?: number;

    /**
     * Tendance du temps par tâche (-1 à 1)
     */
    timePerTaskTrend?: number;

    /**
     * Fréquence des clics (par minute)
     */
    clickFrequency?: number;

    /**
     * Nombre de demandes d'aide
     */
    helpRequests?: number;

    /**
     * Taux d'abandon des tâches (0-1)
     */
    abandonmentRate?: number;

    /**
     * Cohérence de navigation (0-1)
     */
    navigationConsistency?: number;

    /**
     * Nombre de corrections d'entrée
     */
    inputCorrections?: number;

    /**
     * Tags de contenu actuellement consultés
     */
    contentTags?: string[];

    /**
     * Indicateurs d'épuisement (0-1)
     */
    exhaustionIndicators?: number;

    /**
     * Niveau d'engagement actuel prédit (0-1)
     */
    currentEngagement?: number;

    /**
     * Niveau de frustration actuel prédit (0-1)
     */
    currentFrustration?: number;

    /**
     * Facteurs situationnels particuliers
     */
    situationalFactors?: Record<string, unknown>;

    /**
     * Indique si une erreur est survenue
     */
    hasError?: boolean;

    /**
     * Champ additionnel pour permettre des propriétés dynamiques supplémentaires
     */
    [key: string]: unknown;
}

/**
 * Préférences d'apprentissage de l'utilisateur
 */
export interface LearningPreferences {
    /**
     * Style d'apprentissage préféré
     */
    learningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic' | 'multimodal';

    /**
     * Préférence de rythme d'apprentissage
     */
    pacePreference: 'slow' | 'moderate' | 'fast';

    /**
     * Niveau d'adaptativité souhaité (0-1)
     */
    adaptivityLevel: number;

    /**
     * Niveau d'assistance souhaité (0-1)
     */
    assistanceLevel: number;

    /**
     * Préférence de contrôle sur l'apprentissage
     */
    controlPreference: 'low' | 'medium' | 'high';

    /**
     * Indique si l'utilisateur préfère recevoir du feedback
     */
    prefersFeedback: boolean;

    /**
     * Indique si l'utilisateur a besoin de structure
     */
    requiresStructure?: boolean;

    /**
     * Types de contenu préférés
     */
    preferredContentTypes?: string[];

    /**
     * Moments de la journée préférés pour l'apprentissage
     */
    preferredTimeOfDay?: string[];
}

/**
 * Profil d'utilisateur complet
 */
export interface UserProfile {
    /**
     * Identifiant unique de l'utilisateur
     */
    userId: string;

    /**
     * Préférences d'apprentissage de l'utilisateur
     */
    preferences?: LearningPreferences;

    /**
     * Niveau de compétence global
     */
    skillLevel?: CompetencyLevel;

    /**
     * Compétences spécifiques avec niveau (0-1)
     */
    skills?: Record<string, number>;

    /**
     * Lacunes identifiées avec niveau (0-1)
     */
    gaps?: Record<string, number>;

    /**
     * Centres d'intérêt
     */
    interests?: string[];

    /**
     * Métadonnées utilisateur supplémentaires
     */
    metadata?: Record<string, unknown>;

    /**
     * Préférences d'apprentissage de l'utilisateur (pour compatibilité)
     */
    learningPreferences?: {
        preferredLearningStyle?: LearningStyle | string;
    };
}

/**
 * Types d'actions d'adaptation possibles
 */
export type AdaptationAction = 'increase' | 'decrease' | 'maintain' | 'modify' | 'introduce' | 'remove';

/**
 * Niveaux de sévérité des problèmes éthiques
 */
export type IssueSeverity = 'low' | 'medium' | 'high';

/**
 * Issue éthique détectée dans une adaptation
 */
export interface EthicalIssue {
    /**
     * Type de problème éthique
     */
    type: string;

    /**
     * Description du problème
     */
    description: string;

    /**
     * Sévérité du problème
     */
    severity: IssueSeverity;

    /**
     * Type d'adaptation affectée
     */
    affectedAdaptation: string;
}

/**
 * Résultat d'une validation éthique
 */
export interface EthicalValidationResult {
    /**
     * Indique si l'adaptation est éthiquement valide
     */
    valid: boolean;

    /**
     * Problèmes identifiés (si présents)
     */
    issues?: EthicalIssue[];

    /**
     * Adaptations alternatives suggérées (si nécessaire)
     */
    suggestions?: Adaptation[];
}

/**
 * Interface pour les données de feedback d'adaptation
 */
export interface AdaptationFeedback {
    /**
     * Identifiant de l'utilisateur
     */
    userId: string;

    /**
     * Nombre total d'adaptations évaluées
     */
    adaptationCount: number;

    /**
     * Nombre d'adaptations positives/acceptées
     */
    positiveCount: number;

    /**
     * Types d'adaptations concernées
     */
    adaptationTypes?: string[];

    /**
     * Horodatage du feedback
     */
    timestamp?: Date;
}

/**
 * Représente une règle éthique à appliquer lors de la validation
 */
export interface EthicalRule {
    /**
     * Nom unique de la règle
     */
    name: string;

    /**
     * Description de la règle
     */
    description: string;

    /**
     * Fonction qui vérifie si une adaptation respecte la règle
     * @returns Un problème éthique si la règle est violée, null sinon
     */
    check: (adaptation: Adaptation, context: LearningContext) => EthicalIssue | null;

    /**
     * Fonction qui suggère une adaptation alternative si la règle est violée
     * @returns Une adaptation modifiée qui respecte la règle
     */
    suggest: (adaptation: Adaptation) => Adaptation;
}

/**
 * Interface pour les lacunes de compétence
 */
export interface CompetencyGap {
    /**
     * Identifiant unique de la lacune
     */
    id: string;

    /**
     * Identifiant de la compétence concernée
     */
    competencyId: string;

    /**
     * Nom de la compétence
     */
    competencyName: string;

    /**
     * Niveau actuel de compétence de l'utilisateur
     */
    currentLevel: CompetencyLevel;

    /**
     * Niveau cible à atteindre
     */
    targetLevel: CompetencyLevel;

    /**
     * Écart entre le niveau actuel et le niveau cible
     */
    gap: number;

    /**
     * Priorité de la lacune (1-10)
     */
    priority: number;

    /**
     * Impact potentiel de la résolution de cette lacune (1-10)
     */
    impact: number;

    /**
     * Date de détection de la lacune
     */
    detectedAt: Date;

    /**
     * Recommandations spécifiques (optionnel)
     */
    recommendations?: string[];
}

/**
 * Interface pour l'évaluation d'un concept
 */
export interface ConceptEvaluation {
    /**
     * Identifiant du concept évalué
     */
    conceptId: string;

    /**
     * Score de maîtrise (0-100)
     */
    score: number;

    /**
     * Niveau de confiance dans l'évaluation (0-1)
     */
    confidence: number;

    /**
     * Date de l'évaluation
     */
    evaluatedAt?: Date;

    /**
     * Nombre d'évaluations réalisées
     */
    evaluationCount?: number;
}

/**
 * Interface pour les lacunes d'apprentissage
 */
export interface LearningGap {
    /**
     * Identifiant du concept concerné
     */
    conceptId: string;

    /**
     * Nom du concept
     */
    conceptName: string;

    /**
     * Score actuel (0-100)
     */
    score: number;

    /**
     * Statut de la lacune
     */
    status: 'identified' | 'in_progress' | 'resolved';

    /**
     * Priorité (1-10)
     */
    priority: number;

    /**
     * Prérequis faibles associés
     */
    weakPrerequisites: string[];

    /**
     * Date d'identification
     */
    identifiedAt: Date;

    /**
     * Ressources recommandées
     */
    recommendedResources: string[];
}

/**
 * Interface pour les ressources recommandées
 */
export interface RecommendedResource {
    /**
     * Identifiant de la ressource
     */
    id: string;

    /**
     * Titre de la ressource
     */
    title: string;

    /**
     * Type de ressource
     */
    type: 'video' | 'article' | 'exercise' | 'quiz' | 'interactive';

    /**
     * Difficulté (1-10)
     */
    difficulty: number;

    /**
     * Durée estimée (en secondes)
     */
    duration: number;

    /**
     * Concepts couverts
     */
    concepts: string[];
}

/**
 * Interface pour les activités recommandées
 */
export interface RecommendedActivity {
    /**
     * Identifiant de l'activité
     */
    id: string;

    /**
     * Nom de l'activité
     */
    name: string;

    /**
     * Type d'activité
     */
    type: 'practice' | 'quiz' | 'workshop' | 'peer_review' | 'general';

    /**
     * Lacunes ciblées
     */
    targetGaps: string[];

    /**
     * Difficulté (1-10)
     */
    difficulty: number;

    /**
     * Durée estimée (en secondes)
     */
    estimatedDuration: number;

    /**
     * Impact attendu (1-10)
     */
    expectedImpact: number;

    /**
     * Prérequis
     */
    prerequisites: string[];
}