/**
 * Constantes de formatage pour les parcours d'apprentissage personnalisés
 * 
 * @file src/ai/services/learning/personalization/utils/FormatConstants.ts
 * @module ai/services/learning/personalization/utils
 * @description Constantes de mapping pour le formatage des noms, descriptions et identifiants
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import type { CECRLLevel, StepType } from '../types/LearningPathTypes';

/**
 * Mapping des noms de compétences pour l'affichage
 */
export const SKILL_NAME_MAP: Readonly<Record<string, string>> = {
    'basicVocabulary': 'Vocabulaire de base',
    'recognition': 'Reconnaissance des signes',
    'simpleGreetings': 'Salutations simples',
    'basicQuestions': 'Questions de base',
    'simpleExpressions': 'Expressions simples',
    'dailyLifeCommunication': 'Communication quotidienne',
    'shortNarrative': 'Récits simples',
    'extendedVocabulary': 'Vocabulaire étendu',
    'expressionVariety': 'Variété d\'expressions',
    'narrativeSkills': 'Techniques narratives',
    'topicExplanation': 'Explication de sujets',
    'advancedVocabulary': 'Vocabulaire avancé',
    'subtleties': 'Subtilités linguistiques',
    'fluentConversation': 'Conversation fluide',
    'abstractTopics': 'Sujets abstraits',
    'complexExpressions': 'Expressions complexes',
    'culturalSubtleties': 'Subtilités culturelles',
    'idiomaticUsage': 'Expressions idiomatiques',
    'socialPragmatics': 'Pragmatique sociale',
    'nativelikeFluency': 'Fluidité native',
    'culturalMastery': 'Maîtrise culturelle',
    'subtleExpressions': 'Expressions subtiles',
    'metaLinguisticAwareness': 'Conscience métalinguistique'
} as const;

/**
 * Mapping inverse des noms de compétences (affichage vers identifiant)
 */
export const INVERSE_SKILL_NAME_MAP: Readonly<Record<string, string>> = {
    'Vocabulaire de base': 'basicVocabulary',
    'Reconnaissance des signes': 'recognition',
    'Salutations simples': 'simpleGreetings',
    'Questions de base': 'basicQuestions',
    'Expressions simples': 'simpleExpressions',
    'Communication quotidienne': 'dailyLifeCommunication',
    'Récits simples': 'shortNarrative',
    'Vocabulaire étendu': 'extendedVocabulary',
    'Variété d\'expressions': 'expressionVariety',
    'Techniques narratives': 'narrativeSkills',
    'Explication de sujets': 'topicExplanation',
    'Vocabulaire avancé': 'advancedVocabulary',
    'Subtilités linguistiques': 'subtleties',
    'Conversation fluide': 'fluentConversation',
    'Sujets abstraits': 'abstractTopics',
    'Expressions complexes': 'complexExpressions',
    'Subtilités culturelles': 'culturalSubtleties',
    'Expressions idiomatiques': 'idiomaticUsage',
    'Pragmatique sociale': 'socialPragmatics',
    'Fluidité native': 'nativelikeFluency',
    'Maîtrise culturelle': 'culturalMastery',
    'Expressions subtiles': 'subtleExpressions',
    'Conscience métalinguistique': 'metaLinguisticAwareness'
} as const;

/**
 * Mapping des descriptions de compétences
 */
export const SKILL_DESCRIPTION_MAP: Readonly<Record<string, string>> = {
    'basicVocabulary': 'utiliser le vocabulaire de base en LSF',
    'recognition': 'reconnaître et comprendre les signes courants',
    'simpleGreetings': 'maîtriser les salutations de base',
    'basicQuestions': 'poser des questions simples en LSF',
    'simpleExpressions': 'former des expressions simples en LSF',
    'dailyLifeCommunication': 'communiquer dans la vie quotidienne',
    'shortNarrative': 'raconter de courts récits en LSF',
    'extendedVocabulary': 'élargir votre vocabulaire en LSF',
    'expressionVariety': 'varier vos expressions en LSF',
    'narrativeSkills': 'développer vos techniques narratives',
    'topicExplanation': 'expliquer des sujets variés',
    'advancedVocabulary': 'maîtriser un vocabulaire avancé en LSF',
    'subtleties': 'comprendre les subtilités linguistiques de la LSF',
    'fluentConversation': 'converser de manière fluide',
    'abstractTopics': 'aborder des sujets abstraits',
    'complexExpressions': 'former des expressions complexes en LSF',
    'culturalSubtleties': 'comprendre les subtilités culturelles de la LSF',
    'idiomaticUsage': 'utiliser des expressions idiomatiques en LSF',
    'socialPragmatics': 'maîtriser la pragmatique sociale en LSF',
    'nativelikeFluency': 'signer avec une fluidité proche des natifs',
    'culturalMastery': 'maîtriser les aspects culturels de la LSF',
    'subtleExpressions': 'utiliser des expressions subtiles en LSF',
    'metaLinguisticAwareness': 'développer une conscience métalinguistique'
} as const;

/**
 * Mapping des types d'exercices pour l'affichage
 */
export const EXERCISE_TYPE_MAP: Readonly<Record<string, string>> = {
    'MultipleChoice': 'Choix multiples',
    'DragDrop': 'Glisser-déposer',
    'FillBlank': 'Texte à trous',
    'TextEntry': 'Saisie de texte',
    'SigningPractice': 'Pratique de signes',
    'VideoResponse': 'Réponse vidéo',
    'Matching': 'Association',
    'Ordering': 'Remise en ordre',
    'Classification': 'Classification'
} as const;

/**
 * Mapping des niveaux CECRL pour l'affichage
 */
export const CECRL_LEVEL_DESCRIPTIONS: Readonly<Record<CECRLLevel, string>> = {
    'A1': 'Découverte - Niveau débutant',
    'A2': 'Intermédiaire - Niveau élémentaire',
    'B1': 'Seuil - Niveau intermédiaire',
    'B2': 'Avancé - Niveau intermédiaire supérieur',
    'C1': 'Autonome - Niveau avancé',
    'C2': 'Maîtrise - Niveau expert'
} as const;

/**
 * Mapping des types d'étapes pour l'affichage
 */
export const STEP_TYPE_MAP: Readonly<Record<StepType, string>> = {
    'lesson': 'Leçon',
    'exercise': 'Exercice',
    'practice': 'Pratique',
    'assessment': 'Évaluation',
    'revision': 'Révision'
} as const;

/**
 * Niveaux de difficulté et leurs descriptions
 */
export const DIFFICULTY_LEVELS: Readonly<Array<{ min: number; max: number; label: string }>> = [
    { min: 0, max: 0.2, label: 'Très facile' },
    { min: 0.2, max: 0.4, label: 'Facile' },
    { min: 0.4, max: 0.6, label: 'Modéré' },
    { min: 0.6, max: 0.8, label: 'Difficile' },
    { min: 0.8, max: 1, label: 'Très difficile' }
] as const;

/**
 * Formats de date standard
 */
export const DATE_FORMATS = {
    SHORT: 'dd/MM/yyyy',
    LONG: 'dd MMMM yyyy',
    RELATIVE_UNITS: {
        MINUTE: 60 * 1000,
        HOUR: 60 * 60 * 1000,
        DAY: 24 * 60 * 60 * 1000,
        WEEK: 7 * 24 * 60 * 60 * 1000,
        MONTH: 30 * 24 * 60 * 60 * 1000,
        YEAR: 365 * 24 * 60 * 60 * 1000
    }
} as const;

/**
 * Expressions régulières pour la validation et la normalisation
 */
export const VALIDATION_PATTERNS = {
    ID_CLEANUP: /[^\w\s-]/g,
    SPACES_TO_DASHES: /\s+/g,
    MULTIPLE_DASHES: /-+/g,
    LEADING_TRAILING_DASHES: /^-|-$/g,
    CAMEL_CASE_SPACES: /([A-Z])/g,
    MULTIPLE_SPACES: /\s+/g
} as const;

/**
 * Limites d'affichage par défaut
 */
export const DISPLAY_LIMITS = {
    MAX_SKILLS_DISPLAY: 3,
    MAX_TITLE_LENGTH: 60,
    MAX_DESCRIPTION_LENGTH: 200,
    PROGRESS_PRECISION: 1
} as const;

/**
 * Symboles et caractères spéciaux utilisés dans le formatage
 */
export const FORMAT_SYMBOLS = {
    ARROW: '→',
    SEPARATOR: ' : ',
    LIST_SEPARATOR: ', ',
    ELLIPSIS: '...',
    PERCENT: '%',
    DEGREE: '°'
} as const;