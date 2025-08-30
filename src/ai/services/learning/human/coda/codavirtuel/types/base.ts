/**
 * Types de base pour le système CODA
 * @file types/base.ts
 */

/** Niveaux CECRL */
export type CECRLLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/** Humeurs de l'IA-élève */
export type AIMood = 'happy' | 'confused' | 'frustrated' | 'excited' | 'neutral' | 'curious';

/** Types de personnalité de l'IA-élève */
export type AIStudentPersonalityType =
    | 'curious_student'
    | 'shy_learner'
    | 'energetic_pupil'
    | 'patient_apprentice'
    | 'analytical_learner'
    | 'creative_thinker';

/** Types de personnalité CODA */
export type CODAPersonalityType =
    | 'curious_student'
    | 'shy_learner'
    | 'energetic_pupil'
    | 'patient_apprentice'
    | 'encouraging_mentor'
    | 'strict_teacher'
    | 'patient_guide';

/** Environnements culturels */
export type CulturalEnvironment =
    | 'deaf_family_home'
    | 'mixed_hearing_family'
    | 'school_environment'
    | 'community_center'
    | 'online_learning'
    | 'deaf_school'
    | 'deaf_community_center'
    | 'deaf_workplace';

/** Émotions primaires disponibles */
export type PrimaryEmotion =
    | 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust'
    | 'trust' | 'anticipation' | 'confusion' | 'excitement' | 'curiosity'
    | 'frustration' | 'satisfaction' | 'boredom' | 'engagement';

/** Intensité émotionnelle (0-1) */
export type EmotionIntensity = number;

/** État de session CODA */
export type CODASessionState =
    | 'initializing'
    | 'active'
    | 'paused'
    | 'learning'
    | 'evaluating'
    | 'completed'
    | 'error'
    | 'terminated';

// Constantes
export const CECRL_LEVELS: readonly CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export const CODA_PERSONALITY_TYPES: readonly CODAPersonalityType[] = [
    'curious_student', 'shy_learner', 'energetic_pupil', 'patient_apprentice',
    'encouraging_mentor', 'strict_teacher', 'patient_guide'
] as const;
export const CULTURAL_ENVIRONMENTS: readonly CulturalEnvironment[] = [
    'deaf_family_home', 'mixed_hearing_family', 'school_environment',
    'community_center', 'online_learning', 'deaf_school',
    'deaf_community_center', 'deaf_workplace'
] as const;
export const AI_MOODS: readonly AIMood[] = [
    'happy', 'confused', 'frustrated', 'excited', 'neutral', 'curious'
] as const;
export const PRIMARY_EMOTIONS: readonly PrimaryEmotion[] = [
    'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust',
    'trust', 'anticipation', 'confusion', 'excitement', 'curiosity',
    'frustration', 'satisfaction', 'boredom', 'engagement'
] as const;
export const CODA_SESSION_STATES: readonly CODASessionState[] = [
    'initializing', 'active', 'paused', 'learning',
    'evaluating', 'completed', 'error', 'terminated'
] as const;