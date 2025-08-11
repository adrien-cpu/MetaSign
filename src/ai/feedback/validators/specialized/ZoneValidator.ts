// src/ai/systems/expressions/situations/educational/types.ts

export type LearningLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type ContentType = 'VIDEO' | 'INTERACTIVE' | 'PRACTICE' | 'THEORY';
export type ExerciseType = 'INDIVIDUAL' | 'PAIR' | 'GROUP';
export type ResourceType = 'VIDEO' | 'DOCUMENT' | 'INTERACTIVE' | 'EXTERNAL';
export type AssessmentType = 'QUIZ' | 'OBSERVATION' | 'PERFORMANCE' | 'SELF_EVALUATION';
export type CompletionStatus = 'COMPLETE' | 'PARTIAL' | 'INCOMPLETE';
export type ImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type AdjustmentType = 'ADDITION' | 'REMOVAL' | 'MODIFICATION' | 'REORDERING';
export type LearningObjectiveCategory = 'KNOWLEDGE' | 'SKILL' | 'ATTITUDE';
export type LearningStyleType = 'VISUAL' | 'AUDITORY' | 'KINESTHETIC' | 'READING_WRITING';
export type GroupPreference = 'INDIVIDUAL' | 'PAIR' | 'SMALL_GROUP' | 'LARGE_GROUP';
export type RecommendationType = 'CONTENT' | 'METHODOLOGY' | 'PACING' | 'GROUPING' | 'RESOURCE';
export type AdaptationType = 'VISUAL' | 'CULTURAL' | 'LINGUISTIC' | 'PEDAGOGICAL';

export interface SessionAnalysis {
  level: string;
  identified_needs: string[];
  recommended_focus: string[];
  adaptation_requirements: AdaptationRequirement[];
  estimated_time: number;
  complexity_assessment: ImpactLevel;
  recommended_methodologies: string[];
}

export interface AdaptationRequirement {
  type: AdaptationType;
  description: string;
  priority: ImpactLevel;
}

export interface EducationalContent {
  modules: ContentModule[];
  exercises: Exercise[];
  resources: Resource[];
  progression_path: ProgressionStep[];
  assessment_tools: AssessmentTool[];
  cultural_elements: CulturalElement[];
}

export interface ContentModule {
  id: string;
  title: string;
  learning_objectives: string[];
  content_type: ContentType;
  duration: number;
  difficulty: LearningLevel;
  prerequisite_modules?: string[];
}

export interface Exercise {
  id: string;
  title: string;
  type: ExerciseType;
  objectives: string[];
  instructions: string;
  materials_needed: string[];
  duration: number;
  evaluation_criteria: string[];
}

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
  description: string;
  language: string;
  accessibility_features: string[];
}

export interface ProgressionStep {
  order: number;
  activity_id: string;
  expected_outcomes: string[];
  checkpoint: boolean;
  adaptable: boolean;
}

export interface AssessmentTool {
  id: string;
  title: string;
  type: AssessmentType;
  metrics: string[];
  scoring_method: string;
  feedback_mechanism: string;
}

export interface CulturalElement {
  id: string;
  title: string;
  description: string;
  integration_points: string[];
  cultural_context: string;
}

export interface SessionDelivery {
  delivered_modules: DeliveredModule[];
  participant_engagement: ParticipantEngagement[];
  adaptations_applied: AdaptationApplied[];
  time_metrics: TimeMetrics;
  technical_issues: TechnicalIssue[];
  instructor_notes: string;
  content_adaptation?: string;
  differentiation_strategies?: unknown;
  peer_learning_opportunities?: boolean;
}

export interface DeliveredModule {
  module_id: string;
  actual_duration: number;
  completion_status: CompletionStatus;
  engagement_level: number;
  adaptation_notes: string;
}

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

export interface AdaptationApplied {
  original_requirement_id: string;
  adaptation_type: string;
  effectiveness_rating: number;
  participant_feedback: string;
}

export interface TimeMetrics {
  total_duration: number;
  instruction_time: number;
  practice_time: number;
  assessment_time: number;
  breaks: number;
  efficiency_rating: number;
}

export interface TechnicalIssue {
  issue_type: string;
  impact: ImpactLevel;
  resolution: string;
  time_impact: number;
}

export interface LearningOutcomes {
  objectives_met: ObjectiveMet[];
  skill_acquisition: SkillAcquisition[];
  knowledge_retention: KnowledgeRetention[];
  participant_feedback: ParticipantFeedback[];
  overall_effectiveness: number;
  foundational_understanding?: number;
  group_interaction?: number;
  cultural_understanding?: number;
  visual_comprehension?: number;
  skill_improvement?: number;
}

export interface ObjectiveMet {
  objective_id: string;
  achievement_level: number;
  evidence: string[];
}

export interface SkillAcquisition {
  skill_id: string;
  proficiency_level: number;
  practice_needs: string[];
  strengths: string[];
  areas_for_improvement: string[];
}

export interface KnowledgeRetention {
  topic_id: string;
  retention_score: number;
  application_examples: string[];
  reinforcement_needed: boolean;
}

export interface ParticipantFeedback {
  participant_id: string;
  satisfaction_rating: number;
  confidence_gain: number;
  specific_feedback: string;
  suggestions: string[];
}

export interface Recommendation {
  id: string;
  type: RecommendationType;
  description: string;
  justification: string;
  implementation_difficulty: 'EASY' | 'MODERATE' | 'COMPLEX';
  expected_impact: ImpactLevel;
  priority: number;
}

export interface LearningPlan {
  recommended_sessions: PlannedSession[];
  learning_path_adjustments: PathAdjustment[];
  resource_recommendations: RecommendedResource[];
  support_strategies: SupportStrategy[];
  success_indicators: SuccessIndicator[];
  progression_path?: string;
}

export interface PlannedSession {
  title: string;
  objectives: string[];
  content_focus: string[];
  recommended_duration: number;
  prerequisites: string[];
  scheduling_priority: number;
}

export interface PathAdjustment {
  original_path_element: string;
  adjustment_type: AdjustmentType;
  details: string;
  rationale: string;
}

export interface RecommendedResource {
  resource_id: string;
  relevance: string;
  usage_instructions: string;
  expected_benefits: string[];
}

export interface SupportStrategy {
  target_area: string;
  strategy_description: string;
  implementation_steps: string[];
  success_criteria: string;
}

export interface SuccessIndicator {
  area: string;
  description: string;
  measurement_method: string;
  threshold: string;
}

export interface LearningObjective {
  id: string;
  description: string;
  category: LearningObjectiveCategory;
  difficulty_level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  assessment_criteria: string[];
}

export interface Learner {
  id: string;
  proficiency_level: LearningLevel;
  preferred_learning_styles: string[];
  accessibility_needs: string[];
  experience?: string;
  learning_style?: string;
  cultural_background?: string;
  level?: string;
  previous_session_data?: {
    completed_modules: string[];
    strengths: string[];
    areas_for_improvement: string[];
    engagement_patterns: string[];
  };
}

export interface CulturalBackground {
  primary_culture: string;
  linguistic_background: string[];
  cultural_exposure: string[];
  cultural_sensitivity_notes: string;
}

export interface LearningStyle {
  primary_style: LearningStyleType;
  secondary_styles: string[];
  engagement_preferences: string[];
  group_work_preference: GroupPreference;
}

export interface PreviousExperience {
  formal_education: {
    level: string;
    relevant_courses: string[];
    completion_date?: Date;
  };
  informal_learning: {
    description: string[];
    duration: string;
    self_assessment: string;
  };
  practical_application: {
    contexts: string[];
    frequency: string;
    confidence_level: number;
  };
}

export interface EducationalSession {
  level: string;
  objectives: LearningObjective[];
  participants: Learner[];
  duration: number;
  focus?: string;
  teaching_method?: string;
  components?: string[];
  visual_aids?: string[];
  feedback_types?: string[];
  elements?: string[];
  group_dynamics?: string;
}

export interface SessionResult {
  session_delivery: SessionDelivery;
  learning_outcomes: LearningOutcomes;
  recommendations: Recommendation[];
  next_steps: LearningPlan;
  visual_effectiveness?: { clarity: number };
  feedback_mechanisms?: { visual_components: unknown };
  feedback_metrics?: { timeliness: number; constructiveness: number };
  cultural_integration_metrics?: { authenticity: number };
  content_adaptation?: { cultural_relevance: number };
  cultural_sensitivity_score?: number;
  teaching_adaptations?: unknown;
  focused_practice_areas?: string[];
  support_strategies?: unknown;
}

export interface ProgressReport {
  skill_progression: unknown;
  learning_curve: unknown;
  achievement_milestones: unknown[];
}

// Type pour les résultats des méthodes spécifiques aux tests
export interface LearningJourney {
  student_id: string;
  starting_level: string;
  sessions: {
    date: string;
    focus: string;
  }[];
}

// src/ai/systems/expressions/situations/educational/types.ts
// Ajout à l'interface LearningContext

export interface LearningContext {
  cultural_background?: CulturalBackground | string;
  learning_style?: LearningStyle | string;
  previous_experience?: PreviousExperience | string;
  cultural_emphasis?: string;
  visual_learning?: string;
  feedback_intensity?: string;
  cultural_sensitivity?: string;
  adaptive_learning?: string;
  group_focus?: string;
  // Ajout de learning_history pour les tests
  learning_history?: {
    strengths: string[];
    challenges: string[];
  };
}