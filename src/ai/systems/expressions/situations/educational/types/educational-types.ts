/**
 * Niveaux d'apprentissage pour les sessions éducatives LSF
 */
export enum LearningLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED'
}

/**
 * Types de ressources éducatives 
 */
export enum ResourceType {
    VIDEO = 'VIDEO',
    DOCUMENT = 'DOCUMENT',
    IMAGE = 'IMAGE',
    INTERACTIVE = 'INTERACTIVE',
    QUIZ = 'QUIZ'
}

/**
 * Types de contenu éducatif
 */
export enum ContentType {
    VISUAL = 'VISUAL',
    INTERACTIVE = 'INTERACTIVE',
    PRACTICAL = 'PRACTICAL',
    THEORETICAL = 'THEORETICAL',
    MIXED = 'MIXED',
    INTERACTIVE_VISUAL = 'INTERACTIVE_VISUAL'
}

/**
 * Représente une étape dans le parcours d'apprentissage
 */
export interface LearningStage {
    name: string;
    completed: boolean;
    progressPercentage: number;
    skillsAcquired: string[];
}

/**
 * Résultat de l'analyse des besoins d'une session éducative
 */
export interface SessionAnalysis {
    adaptationStrategy: string;
    level?: string;
    identified_needs?: string[];
    recommended_focus?: string[];
    adaptation_requirements?: AdaptationRequirement[];
    estimated_time?: number;
    complexity_assessment?: string;
    recommended_methodologies?: string[];
}

/**
 * Structure d'un module éducatif
 */
export interface EducationalModule {
    id: string;
    title: string;
    learning_objectives: string[];
    content_type: string;
    duration: number;
    difficulty: string;
}

/**
 * Structure d'un exercice éducatif
 */
export interface EducationalExercise {
    id: string;
    title: string;
    type: string;
    objectives: string[];
    instructions: string;
    materials_needed: string[];
    duration: number;
    evaluation_criteria: string[];
}

/**
 * Structure d'une ressource éducative
 */
export interface EducationalResource {
    id: string;
    title: string;
    type: ResourceType | string;
    url?: string;
    description: string;
    language: string;
    accessibility_features: string[];
}

/**
 * Structure d'un chemin de progression
 */
export interface ProgressionPathItem {
    step: number;
    title: string;
    objectives: string[];
    dependencies: string[];
    estimated_completion_time: number;
}

/**
 * Structure d'un outil d'évaluation
 */
export interface AssessmentTool {
    id: string;
    type: string;
    objectives: string[];
    scoring_method: string;
    passing_criteria: string | number;
    time_allowed?: number;
}

/**
 * Structure d'un élément culturel
 */
export interface CulturalElement {
    id: string;
    title: string;
    description: string;
    origin: string;
    relevance: string;
    integration_method: string;
}

/**
 * Contenu éducatif préparé pour une session
 */
export interface EducationalContent {
    contentType: string;
    difficulty: LearningLevel;
    modules?: EducationalModule[];
    exercises?: EducationalExercise[];
    resources?: EducationalResource[];
    progression_path?: ProgressionPathItem[];
    assessment_tools?: AssessmentTool[];
    cultural_elements?: CulturalElement[];
}

/**
 * Structure d'un module dispensé
 */
export interface DeliveredModule {
    module_id: string;
    actual_duration: number;
    completion_status: string;
    engagement_level: number;
    adaptation_notes: string;
}

/**
 * Structure d'engagement d'un participant
 */
export interface ParticipantEngagement {
    participant_id: string;
    engagement_metrics: {
        attention: number;
        participation: number;
        comprehension: number;
        application: number;
    };
    notable_moments: string[];
}

/**
 * Structure d'adaptation appliquée
 */
export interface AdaptationApplied {
    original_requirement_id: string;
    adaptation_type: string;
    effectiveness_rating: number;
    participant_feedback: string;
}

/**
 * Structure d'un problème technique
 */
export interface TechnicalIssue {
    issue_type: string;
    severity: string;
    impact: string;
    resolution: string;
    time_lost: number;
}

/**
 * Informations sur la dispensation d'une session éducative
 */
export interface SessionDelivery {
    deliveryMethod: string;
    delivered_modules?: DeliveredModule[];
    participant_engagement?: ParticipantEngagement[];
    adaptations_applied?: AdaptationApplied[];
    time_metrics?: {
        total_duration: number;
        instruction_time: number;
        practice_time: number;
        assessment_time: number;
        breaks: number;
        efficiency_rating: number;
    };
    technical_issues?: TechnicalIssue[];
    instructor_notes?: string;
    content_adaptation?: string;
    differentiation_strategies?: {
        visual: boolean;
        interactive: boolean;
    };
    peer_learning_opportunities?: boolean;
}

/**
 * Structure d'un objectif atteint
 */
export interface ObjectiveMet {
    objective_id: string;
    achievement_level: number;
    evidence: string[];
}

/**
 * Structure d'une compétence acquise
 */
export interface SkillAcquisition {
    skill_id: string;
    proficiency_level: number;
    practice_needs: string[];
    strengths: string[];
    areas_for_improvement: string[];
}

/**
 * Structure de rétention de connaissances
 */
export interface KnowledgeRetention {
    topic_id: string;
    retention_score: number;
    application_examples: string[];
    reinforcement_needed: boolean;
}

/**
 * Structure de feedback participant
 */
export interface ParticipantFeedback {
    participant_id: string;
    satisfaction_level: number;
    comments: string[];
    improvement_suggestions: string[];
}

/**
 * Résultats d'apprentissage d'une session éducative
 */
export interface LearningOutcomes {
    understanding: number;
    skillsGained: string[];
    objectives_met?: ObjectiveMet[];
    skill_acquisition?: SkillAcquisition[];
    knowledge_retention?: KnowledgeRetention[];
    participant_feedback?: ParticipantFeedback[];
    overall_effectiveness?: number;
    foundational_understanding?: number;
    group_interaction?: number;
    cultural_understanding?: number;
    visual_comprehension?: number;
    skill_improvement?: number;
}

/**
 * Structure d'une session d'apprentissage
 */
export interface LearningSession {
    date: Date;
    focus: string;
}

/**
 * Données du parcours d'apprentissage d'un étudiant
 */
export interface LearningJourneyData {
    studentId: string;
    stages: LearningStage[];
    currentLevel: LearningLevel;
    totalProgress: number;
    sessions?: LearningSession[];
    starting_level?: string;
}

/**
 * Structure de progression de compétences
 */
export interface SkillProgression {
    vocabulary: number[];
    grammar: number[];
    fluency: number[];
}

/**
 * Structure d'une courbe d'apprentissage
 */
export interface LearningCurve {
    slope: number;
    acceleration: number;
    steadiness: number;
}

/**
 * Structure d'une étape de progression
 */
export interface AchievementMilestone {
    date: Date;
    achievement: string;
    level: string;
}

/**
 * Propriétés communes entre ProgressReportData et ProgressReport
 */
export interface BaseProgressReport {
    skill_progression: SkillProgression;
    learning_curve: LearningCurve;
    achievement_milestones: AchievementMilestone[];
}

/**
 * Données d'un rapport de progression pour un étudiant
 */
export interface ProgressReportData extends BaseProgressReport {
    studentId: string;
    currentLevel: LearningLevel;
    progressPercentage: number;
    skillsSummary: {
        strengths: string[];
        improvementAreas: string[];
    };
    recommendedNextSteps: string[];
}

/**
 * Rapport de progression (version simplifiée)
 */
export type ProgressReport = BaseProgressReport;

/**
 * Données d'une session éducative
 */
export interface EducationalSessionData {
    level: LearningLevel;
    objectives: Array<{
        id: string;
        description: string;
        category: string;
        difficultyLevel: string;
        assessmentCriteria: string[];
    }>;
    participants: Array<{
        id: string;
        proficiencyLevel: string;
        preferredLearningStyles: string[];
        accessibilityNeeds: string[];
        experience: string;
        learningStyle: string;
        culturalBackground: string;
    }>;
    duration: number;
}

/**
 * Contexte d'apprentissage pour une session éducative
 */
export interface LearningContextData {
    culturalBackground: string;
    learningStyle: string | { primary_style: string };
    previousExperience: string;
    cultural_emphasis?: string | undefined;
    cultural_sensitivity?: string | undefined;
    visual_learning?: string | undefined;
    feedback_intensity?: string | undefined;
    adaptive_learning?: string | undefined;
    learning_history?: {
        challenges?: string[] | undefined;
    } | undefined;
    cultural_background?: {
        linguistic_background?: string[] | undefined;
    } | undefined;
}

/**
 * Exigence d'adaptation pour une session éducative
 */
export interface AdaptationRequirement {
    type: string;
    description: string;
    priority: string;
}

/**
 * Informations sur un apprenant
 */
export interface Learner {
    id: string;
    accessibility_needs: string[];
}

/**
 * Données d'une session éducative complète
 */
export interface EducationalSession {
    level: string;
    objectives: Array<{
        description: string;
    }>;
    participants: Learner[];
    duration?: number;
}

/**
 * Contexte d'apprentissage
 */
export interface LearningContext {
    learning_style: string | { primary_style: string };
    cultural_emphasis?: string | undefined;
    cultural_sensitivity?: string | undefined;
    visual_learning?: string | undefined;
    feedback_intensity?: string | undefined;
    adaptive_learning?: string | undefined;
    learning_history?: {
        challenges?: string[] | undefined;
    } | undefined;
    cultural_background?: string | {
        linguistic_background?: string[] | undefined;
    } | undefined;
}

/**
 * Parcours d'apprentissage
 */
export interface LearningJourney {
    sessions: LearningSession[];
    starting_level: string;
}

/**
 * Recommandation pour améliorer l'apprentissage
 */
export interface Recommendation {
    id: string;
    type: string;
    description: string;
    justification: string;
    implementation_difficulty: string;
    expected_impact: string;
    priority: number;
}

/**
 * Plan d'apprentissage pour les sessions futures
 */
export interface LearningPlan {
    recommended_sessions: Array<{
        title: string;
        objectives: string[];
        content_focus: string[];
        recommended_duration: number;
        prerequisites: string[];
        scheduling_priority: number;
    }>;
    learning_path_adjustments: Array<{
        original_path_element: string;
        adjustment_type: string;
        details: string;
        rationale: string;
    }>;
    resource_recommendations: Array<{
        resource_id: string;
        relevance: string;
        usage_instructions: string;
        expected_benefits: string[];
    }>;
    support_strategies: Array<{
        target_area: string;
        strategy_description: string;
        implementation_steps: string[];
        success_criteria: string;
    }>;
    success_indicators: Array<{
        area: string;
        description: string;
        measurement_method: string;
        threshold: string;
    }>;
    progression_path: string;
}

/**
 * Résultat d'une session éducative
 */
export interface SessionResult {
    session_delivery: SessionDelivery;
    learning_outcomes: LearningOutcomes;
    recommendations: Recommendation[];
    next_steps: LearningPlan;
    cultural_integration_metrics?: { authenticity: number };
    cultural_sensitivity_score?: number;
    content_adaptation?: { cultural_relevance: number };
    visual_effectiveness?: { clarity: number };
    feedback_mechanisms?: { visual_components: Record<string, unknown> };
    feedback_metrics?: { timeliness: number; constructiveness: number };
    teaching_adaptations?: Record<string, unknown>;
    focused_practice_areas?: string[];
    support_strategies?: Record<string, unknown>;
}