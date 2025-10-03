/**
 * @file src/ai/services/learning/types/index.ts
 * @description Types et interfaces principaux du module d'apprentissage LSF
 * @module Learning/Types
 */

// ============================================================================
// TYPES DE BASE
// ============================================================================

/**
 * Niveaux CECRL pour l'évaluation linguistique
 */
export enum CECRLLevel {
    A1 = 'A1',
    A2 = 'A2',
    B1 = 'B1',
    B2 = 'B2',
    C1 = 'C1',
    C2 = 'C2'
}

/**
 * Catégories d'évaluation CECRL
 */
export enum CECRLCategory {
    VOCABULAIRE = 'vocabulaire',
    GRAMMAIRE = 'grammaire',
    EXPRESSION = 'expression',
    COMPREHENSION = 'comprehension',
    INTERACTION = 'interaction',
    CULTURE = 'culture'
}

/**
 * Niveaux d'apprentissage de l'avatar
 */
export enum AvatarLevel {
    DEBUTANT = 'debutant',
    INTERMEDIAIRE = 'intermediaire',
    AVANCE = 'avance',
    MAITRISE_CODA = 'maitrise_coda'
}

/**
 * Types d'erreurs possibles en LSF
 */
export enum LSFErrorType {
    CONFIGURATION = 'configuration',
    EMPLACEMENT = 'emplacement',
    MOUVEMENT = 'mouvement',
    ORIENTATION = 'orientation',
    EXPRESSION_FACIALE = 'expression_faciale',
    RYTHME = 'rythme',
    SYNTAXE = 'syntaxe',
    ESPACE = 'espace'
}

// ============================================================================
// PROFIL UTILISATEUR
// ============================================================================

/**
 * Profil utilisateur pour l'apprentissage inversé
 */
export interface UserReverseProfile {
    id: string;
    name: string;
    currentLevel: CECRLLevel;
    avatarLevel: AvatarLevel;
    strengths: CECRLCategory[];
    weaknesses: CECRLCategory[];
    learningStyle: LearningStyle;
    preferredDifficulty: DifficultyLevel;
    completedModules: string[];
    currentProgress: number;
    lastSessionDate?: Date;
    totalSessionsCompleted: number;
    achievements: Achievement[];
    preferences: UserPreferences;
}

/**
 * Style d'apprentissage
 */
export interface LearningStyle {
    visual: number;
    kinesthetic: number;
    theoretical: number;
    practical: number;
    collaborative: number;
    autonomous: number;
}

/**
 * Niveau de difficulté
 */
export enum DifficultyLevel {
    FACILE = 'facile',
    MOYEN = 'moyen',
    DIFFICILE = 'difficile',
    EXPERT = 'expert'
}

/**
 * Préférences utilisateur
 */
export interface UserPreferences {
    sessionDuration: number; // en minutes
    errorTolerance: number; // 0-1
    feedbackFrequency: 'immediate' | 'periodic' | 'summary';
    avatarSpeed: 'slow' | 'normal' | 'fast';
    showSubtitles: boolean;
    showGloss: boolean;
}

/**
 * Accomplissement/Badge
 */
export interface Achievement {
    id: string;
    name: string;
    description: string;
    unlockedAt: Date;
    type: 'badge' | 'milestone' | 'challenge';
    level: number;
}

// ============================================================================
// CONFIGURATION AVATAR
// ============================================================================

/**
 * Configuration du comportement de l'avatar apprenant
 */
export interface AvatarBehaviorConfig {
    level: AvatarLevel;
    errorProbability: number;
    learningSpeed: number;
    emotionalResponses: boolean;
    personalityTraits: PersonalityTraits;
    commonMistakes: LSFErrorPattern[];
    progressionRate: number;
}

/**
 * Traits de personnalité de l'avatar
 */
export interface PersonalityTraits {
    confidence: number; // 0-1
    curiosity: number; // 0-1
    patience: number; // 0-1
    expressiveness: number; // 0-1
    persistence: number; // 0-1
}

/**
 * Pattern d'erreur LSF
 */
export interface LSFErrorPattern {
    type: LSFErrorType;
    frequency: number; // 0-1
    context: string[];
    severity: 'minor' | 'moderate' | 'major';
    examples: string[];
}

/**
 * État d'apprentissage de l'avatar
 */
export interface AvatarLearningState {
    currentLevel: AvatarLevel;
    masteredConcepts: string[];
    strugglingConcepts: string[];
    recentErrors: LSFErrorPattern[];
    emotionalState: EmotionalState;
    sessionHistory: SessionSummary[];
    progressMetrics: ProgressMetrics;
}

/**
 * État émotionnel
 */
export interface EmotionalState {
    mood: 'happy' | 'neutral' | 'frustrated' | 'confused' | 'proud';
    energy: number; // 0-1
    motivation: number; // 0-1
    stress: number; // 0-1
}

/**
 * Métriques de progression
 */
export interface ProgressMetrics {
    accuracyRate: number;
    improvementRate: number;
    consistencyScore: number;
    engagementLevel: number;
    masteryScore: number;
}

/**
 * Résumé de session
 */
export interface SessionSummary {
    id: string;
    date: Date;
    duration: number;
    conceptsCovered: string[];
    errorsCount: number;
    successRate: number;
    feedback: string[];
}

/**
 * Réponse de l'avatar
 */
export interface AvatarResponse {
    signSequence: SignSequence;
    errors?: LSFError[];
    emotionalReaction?: EmotionalState;
    requestedHelp?: boolean;
    feedbackNeeded?: string[];
}

/**
 * Séquence de signes
 */
export interface SignSequence {
    signs: Sign[];
    timing: TimingInfo;
    spatialReferences: SpatialReference[];
    nonManualMarkers: NonManualMarker[];
}

/**
 * Signe individuel
 */
export interface Sign {
    gloss: string;
    handshape: string;
    location: string;
    movement: string;
    orientation: string;
    duration: number;
}

/**
 * Information de timing
 */
export interface TimingInfo {
    totalDuration: number;
    signTimings: number[];
    pauseDurations: number[];
    rhythm: 'regular' | 'irregular' | 'syncopated';
}

/**
 * Référence spatiale
 */
export interface SpatialReference {
    id: string;
    location: [number, number, number];
    entity: string;
    active: boolean;
}

/**
 * Marqueur non-manuel
 */
export interface NonManualMarker {
    type: 'facial' | 'head' | 'body' | 'gaze';
    value: string;
    startTime: number;
    endTime: number;
    intensity: number;
}

/**
 * Erreur LSF détectée
 */
export interface LSFError {
    type: LSFErrorType;
    timestamp: number;
    description: string;
    severity: 'minor' | 'moderate' | 'major';
    correction?: string;
}

/**
 * Session d'enseignement
 */
export interface TeachingSession {
    id: string;
    studentProfile: UserReverseProfile;
    avatarState: AvatarLearningState;
    currentExercise: Exercise;
    sessionGoals: string[];
    startTime: Date;
    interactions: TeachingInteraction[];
}

/**
 * Interaction d'enseignement
 */
export interface TeachingInteraction {
    timestamp: Date;
    userInput: SignSequence;
    avatarResponse: AvatarResponse;
    feedback: TeachingFeedback;
    learningOutcome: LearningOutcome;
}

/**
 * Feedback d'enseignement
 */
export interface TeachingFeedback {
    type: 'correction' | 'encouragement' | 'explanation' | 'demonstration';
    content: string;
    targetError?: LSFError;
    effectiveness: number;
}

/**
 * Résultat d'apprentissage
 */
export interface LearningOutcome {
    conceptLearned: boolean;
    errorCorrected: boolean;
    improvementMeasured: number;
    nextSteps: string[];
}

// ============================================================================
// ÉVALUATION CECRL
// ============================================================================

/**
 * Données d'évaluation
 */
export interface EvaluationData {
    context: 'academic' | 'professional' | 'social' | 'general';
    duration: number;
    complexity: number;
    authenticScenario: boolean;
}

/**
 * Résultat d'évaluation par catégorie
 */
export interface CategoryEvaluationResult {
    category: CECRLCategory;
    score: number;
    achievedLevel: CECRLLevel;
    strengths: string[];
    weaknesses: string[];
    feedback: string;
}

/**
 * Résultat d'évaluation CECRL complet
 */
export interface CECRLEvaluationResult {
    id: string;
    userId: string;
    date: Date;
    categoryResults: Record<CECRLCategory, CategoryEvaluationResult>;
    overallLevel: CECRLLevel;
    overallScore: number;
    recommendations: string[];
    nextSteps: string[];
    validityPeriod: number;
    detailedFeedback: {
        strengths: string[];
        areasForImprovement: string[];
        learningPath: string[];
    };
    progressionSuggestions: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
}

/**
 * Critères CECRL
 */
export interface CECRLCriteria {
    vocabularySize: number;
    grammaticalAccuracy: number;
    fluency: number;
    comprehension: number;
    culturalAwareness: number;
    interactionCapability: number;
    expectedSkills?: string[];
    minimumScore?: number;
}

// ============================================================================
// EXERCICES ET SCÉNARIOS
// ============================================================================

/**
 * Exercice d'apprentissage
 */
export interface Exercise {
    id: string;
    type: ExerciseType;
    title: string;
    description: string;
    targetLevel: CECRLLevel;
    targetSkills: CECRLCategory[];
    content: ExerciseContent;
    expectedDuration: number;
    difficulty: DifficultyLevel;
    adaptiveParameters: AdaptiveParameters;
}

/**
 * Type d'exercice
 */
export enum ExerciseType {
    COMPREHENSION = 'comprehension',
    PRODUCTION = 'production',
    INTERACTION = 'interaction',
    TRANSLATION = 'translation',
    GRAMMAR = 'grammar',
    VOCABULARY = 'vocabulary',
    CULTURAL = 'cultural',
    MIXED = 'mixed'
}

/**
 * Contenu de l'exercice
 */
export interface ExerciseContent {
    instructions: string;
    materials: Material[];
    questions?: Question[];
    scenarios?: Scenario[];
    expectedResponses?: ExpectedResponse[];
}

/**
 * Matériel pédagogique
 */
export interface Material {
    type: 'video' | 'image' | 'text' | 'sign_sequence';
    content: string;
    metadata?: Record<string, any>;
}

/**
 * Question d'exercice
 */
export interface Question {
    id: string;
    text: string;
    type: 'multiple_choice' | 'open' | 'sign_production' | 'comprehension';
    options?: string[];
    correctAnswer?: string;
    points: number;
}

/**
 * Scénario d'apprentissage
 */
export interface Scenario {
    id: string;
    context: string;
    roles: Role[];
    objectives: string[];
    expectedInteractions: number;
    culturalNotes?: string[];
}

/**
 * Rôle dans un scénario
 */
export interface Role {
    id: string;
    name: string;
    description: string;
    personality?: PersonalityTraits;
    knowledge: string[];
}

/**
 * Réponse attendue
 */
export interface ExpectedResponse {
    type: 'sign' | 'text' | 'action';
    content: string;
    variations: string[];
    acceptanceCriteria: AcceptanceCriteria;
}

/**
 * Critères d'acceptation
 */
export interface AcceptanceCriteria {
    minimumAccuracy: number;
    requiredElements: string[];
    forbiddenElements?: string[];
    timingTolerance?: number;
}

/**
 * Paramètres adaptatifs
 */
export interface AdaptiveParameters {
    adjustDifficulty: boolean;
    adjustSpeed: boolean;
    adjustComplexity: boolean;
    adjustSupport: boolean;
    thresholds: {
        increase: number;
        decrease: number;
        maintain: number;
    };
}

// ============================================================================
// CHEMINS D'APPRENTISSAGE
// ============================================================================

/**
 * Chemin d'apprentissage personnalisé
 */
export interface LearningPath {
    id: string;
    userId: string;
    currentStep: number;
    totalSteps: number;
    steps: LearningStep[];
    estimatedCompletion: Date;
    adaptiveAdjustments: AdaptiveAdjustment[];
}

/**
 * Étape d'apprentissage
 */
export interface LearningStep {
    id: string;
    order: number;
    title: string;
    objectives: string[];
    exercises: Exercise[];
    assessmentCriteria: AssessmentCriteria;
    estimatedDuration: number;
    dependencies: string[];
    completed: boolean;
    completionDate?: Date;
    score?: number;
}

/**
 * Critères d'évaluation
 */
export interface AssessmentCriteria {
    minimumScore: number;
    requiredCompetencies: string[];
    masteryThreshold: number;
    evaluationMethod: 'automatic' | 'peer' | 'instructor' | 'mixed';
}

/**
 * Ajustement adaptatif
 */
export interface AdaptiveAdjustment {
    timestamp: Date;
    reason: string;
    adjustmentType: 'difficulty' | 'pace' | 'content' | 'support';
    oldValue: any;
    newValue: any;
    impact: number;
}

// ============================================================================
// EXPORTS DES TYPES LEGACY (pour compatibilité)
// ============================================================================

export * from './LearningPathTypes';

// Types alias pour compatibilité
export type UserProfile = UserReverseProfile;
export type AvatarConfig = AvatarBehaviorConfig;
export type SessionData = TeachingSession;