/**
 * @file src/ai/services/learning/human/coda/codavirtuel/types.ts
 * @description Types et interfaces consolidés pour le système d'apprentissage inversé (CODA virtuel)
 * @author MetaSign
 * @version 1.2.0
 */

/**
 * Niveaux du Cadre Européen Commun de Référence pour les Langues (CECRL)
 * Applicable à l'apprentissage de la LSF
 */
export enum CECRLLevel {
    A1 = 'A1', // Découverte
    A2 = 'A2', // Intermédiaire
    B1 = 'B1', // Seuil
    B2 = 'B2', // Avancé
    C1 = 'C1', // Autonome
    C2 = 'C2'  // Maîtrise
}

/**
 * Description des niveaux CECRL dans le contexte de la LSF
 */
export const CECRL_LEVEL_DESCRIPTIONS: Record<CECRLLevel, string> = {
    [CECRLLevel.A1]: 'Niveau découverte - Compréhension et expression de base en LSF',
    [CECRLLevel.A2]: 'Niveau intermédiaire - Communication simple sur des sujets familiers',
    [CECRLLevel.B1]: 'Niveau seuil - Communication avec une certaine aisance sur des sujets variés',
    [CECRLLevel.B2]: 'Niveau avancé - Communication fluide sur des sujets complexes',
    [CECRLLevel.C1]: 'Niveau autonome - Expression spontanée et précise dans des contextes exigeants',
    [CECRLLevel.C2]: 'Niveau maîtrise - Expression nuancée équivalente à celle d\'un locuteur natif'
};

/**
 * Niveaux d'apprentissage généraux
 */
export enum LearningLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
    EXPERT = 'EXPERT'
}

/**
 * Correspondance entre niveaux CECRL et niveaux généraux
 */
export const CECRLToLearningLevel: Record<CECRLLevel, LearningLevel> = {
    [CECRLLevel.A1]: LearningLevel.BEGINNER,
    [CECRLLevel.A2]: LearningLevel.BEGINNER,
    [CECRLLevel.B1]: LearningLevel.INTERMEDIATE,
    [CECRLLevel.B2]: LearningLevel.INTERMEDIATE,
    [CECRLLevel.C1]: LearningLevel.ADVANCED,
    [CECRLLevel.C2]: LearningLevel.EXPERT
};

/**
 * Types de compétences évaluées dans l'apprentissage de la LSF
 */
export enum SkillType {
    COMPREHENSION = 'comprehension', // Compréhension visuelle
    EXPRESSION = 'expression',       // Expression gestuelle
    VOCABULARY = 'vocabulary',       // Vocabulaire en LSF
    GRAMMAR = 'grammar',             // Grammaire spatiale et structure
    FLUENCY = 'fluency',             // Fluidité des mouvements
    CULTURAL = 'cultural',           // Compréhension culturelle sourde
    INTERACTION = 'interaction'      // Capacité d'interaction en contexte
}

/**
 * Catégories d'erreurs possibles en LSF
 * Utilisées pour cibler les domaines d'apprentissage
 */
export enum ErrorCategory {
    // Catégories grammaticales
    SPATIAL_GRAMMAR = 'spatial_grammar',       // Erreurs dans l'utilisation de l'espace grammatical
    TEMPORAL_MARKERS = 'temporal_markers',     // Erreurs dans les marqueurs temporels
    CLASSIFIER_USE = 'classifier_use',         // Erreurs dans l'utilisation des classificateurs
    ROLE_SHIFTING = 'role_shifting',           // Erreurs dans le changement de rôle
    INDEXING = 'indexing',                    // Erreurs dans l'indexation et les références

    // Catégories expressives
    FACIAL_EXPRESSION = 'facial_expression',   // Expressions faciales inappropriées ou manquantes
    MOUTH_PATTERNS = 'mouth_patterns',         // Erreurs dans les mouvements de la bouche
    NON_MANUAL_FEATURES = 'non_manual',        // Erreurs dans les composantes non manuelles

    // Catégories lexicales
    SIGN_FORMATION = 'sign_formation',         // Formation incorrecte des signes
    VOCABULARY = 'vocabulary',                 // Erreurs de vocabulaire ou signes inappropriés
    IDIOMATIC_EXPRESSION = 'idiomatic',        // Utilisation incorrecte d'expressions idiomatiques

    // Catégories pragmatiques
    REGISTER = 'register',                     // Erreurs de registre de langue
    CULTURAL_REFERENCE = 'cultural_reference', // Références culturelles inappropriées
    DISCOURSE_STRUCTURE = 'discourse',         // Erreurs dans la structure du discours

    // Catégories d'interaction
    TURN_TAKING = 'turn_taking',               // Erreurs dans la prise de tour de parole
    ATTENTION_GETTING = 'attention_getting',   // Erreurs dans les stratégies pour attirer l'attention
    FEEDBACK_SIGNALS = 'feedback_signals'      // Erreurs dans les signaux de feedback
}

/**
 * Types d'erreurs simulées dans le système d'apprentissage inversé
 */
export enum ErrorType {
    CONFIGURATION = 'configuration',       // Erreur de configuration manuelle
    MOVEMENT = 'movement',                 // Erreur de mouvement
    SPATIAL = 'spatial',                   // Erreur d'utilisation de l'espace
    FACIAL_EXPRESSION = 'facialExpression',// Erreur d'expression faciale
    TIMING = 'timing',                     // Erreur de timing/rythme
    GRAMMAR = 'grammar',                   // Erreur de grammaire spatiale
    CULTURAL = 'cultural'                  // Erreur culturelle
}

/**
 * Types de scénarios d'apprentissage
 */
export enum ScenarioType {
    CONVERSATION = 'CONVERSATION',    // Conversation quotidienne
    VOCABULARY = 'VOCABULARY',        // Vocabulaire
    GRAMMAR = 'GRAMMAR',              // Grammaire
    CULTURAL = 'CULTURAL',            // Aspects culturels
    PRACTICAL = 'PRACTICAL',          // Pratique
    ASSESSMENT = 'ASSESSMENT',        // Évaluation
    ACADEMIC = 'academic',            // Contexte académique
    PROFESSIONAL = 'professional',    // Contexte professionnel
    EMERGENCY = 'emergency',          // Situation d'urgence
    STORYTELLING = 'storytelling'     // Narration et histoires
}

/**
 * Types d'exercices disponibles
 */
export enum ExerciseType {
    // Version 1
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
    DRAG_DROP = 'DRAG_DROP',
    VIDEO_RESPONSE = 'VIDEO_RESPONSE',
    FILL_BLANK = 'FILL_BLANK',
    TRUE_FALSE = 'TRUE_FALSE',
    MATCHING = 'MATCHING',
    REORDERING = 'REORDERING',
    TEXT_ENTRY = 'TEXT_ENTRY',

    // Version 2 (kebab-case)
    MULTIPLE_CHOICE_KEBAB = 'multiple-choice',
    DRAG_DROP_KEBAB = 'drag-drop',
    FILL_BLANK_KEBAB = 'fill-blank',
    VIDEO_RESPONSE_KEBAB = 'video-response',
    TEXT_ENTRY_KEBAB = 'text-entry',
    CORRECTION = 'correction',
    MATCHING_KEBAB = 'matching',
    ORDERING = 'ordering'
}

/**
 * Niveaux de difficulté des exercices
 */
export enum DifficultyLevel {
    EASY = 'EASY',
    MEDIUM = 'MEDIUM',
    HARD = 'HARD',
    EXPERT = 'EXPERT'
}

/**
 * Niveaux de difficulté pour les scénarios d'apprentissage
 */
export enum ScenarioDifficulty {
    BEGINNER = 'beginner',       // Pour débutants (A1-A2)
    INTERMEDIATE = 'intermediate',// Pour niveau intermédiaire (B1-B2)
    ADVANCED = 'advanced',       // Pour niveau avancé (C1-C2)
    ADAPTIVE = 'adaptive'        // S'adapte au niveau de l'apprenant
}

/**
 * Préférences d'apprentissage
 */
export type LearningPreference =
    | 'visual'
    | 'interactive'
    | 'repetitive'
    | 'social'
    | 'analytical'
    | 'practical';

/**
 * Statuts des programmes d'apprentissage
 */
export type ProgramStatus = 'pending' | 'active' | 'paused' | 'completed' | 'abandoned';

/**
 * Distribution des erreurs par catégorie
 */
export type ErrorDistribution = Record<ErrorCategory, number>;

/**
 * Configuration pour la simulation d'erreurs dans les expressions LSF
 */
export interface ErrorSimulationConfig {
    /** Pourcentage d'erreurs à introduire (0-1) */
    errorRate: number;

    /** Types d'erreurs à simuler */
    errorTypes: string[];

    /** Concepts déjà maîtrisés par l'utilisateur (à ne pas altérer) */
    userMasteredConcepts: string[];

    /** Distribution par catégorie (optionnel) */
    categoryDistribution?: Record<ErrorCategory, number>;

    /** Fréquence par niveau CECRL (optionnel) */
    levelFrequency?: Record<CECRLLevel, number>;

    /** Seuil de détection attendu (optionnel) */
    expectedDetectionThreshold?: number;
}

/**
 * Préférences d'apprentissage de l'utilisateur
 */
export interface LearningPreferences {
    /** Thèmes préférés pour l'apprentissage */
    preferredThemes: string[];

    /** Style d'apprentissage préféré */
    learningStyle: 'visual' | 'interactive' | 'theoretical';

    /** Durée de session préférée (en minutes) */
    sessionDuration: number;

    /** Région pour les variantes dialectales (optionnel) */
    region?: string;
}

/**
 * Données de progression d'un utilisateur
 */
export interface UserProgressData {
    /** Identifiant unique de l'utilisateur */
    userId: string;

    /** Niveau CECRL actuel */
    currentLevel: CECRLLevel;

    /** Points d'expérience accumulés */
    experiencePoints: number;

    /** Identifiants des scénarios complétés */
    completedScenarios: string[];

    /** Concepts linguistiques maîtrisés */
    masteredConcepts: string[];

    /** Préférences d'apprentissage */
    learningPreferences: LearningPreferences;

    /** Date de dernière activité */
    lastActive: Date;

    /** Taux d'erreur actuel (0-1) */
    errorRate: number;
}

/**
 * Paramètres de génération de scénario
 */
export interface ScenarioGenerationParams {
    /** Niveau CECRL cible */
    level: CECRLLevel;

    /** Type de scénario à générer */
    type: ScenarioType;

    /** Préférences d'apprentissage de l'utilisateur */
    userPreferences: LearningPreferences;

    /** Concepts déjà maîtrisés */
    masteredConcepts: string[];

    /** Thème spécifique (optionnel) */
    specificTheme?: string;
}

/**
 * Paramètres de génération d'exercices
 */
export interface ExerciseGenerationParams {
    /** Identifiant du thème */
    theme: string;

    /** Niveau CECRL */
    level: CECRLLevel;

    /** Nombre d'exercices à générer */
    count: number;

    /** Concepts déjà maîtrisés */
    masteredConcepts: string[];

    /** Type d'exercices spécifique (optionnel) */
    exerciseType?: ExerciseType;

    /** Niveau de difficulté (optionnel) */
    difficulty?: DifficultyLevel;
}

/**
 * Type pour le contenu des exercices selon leur type
 */
export interface ExerciseContent {
    /** Contenu pour QCM */
    multipleChoice?: {
        question: string;
        options: string[];
        correctAnswer: number;
    };

    /** Contenu pour glisser-déposer */
    dragDrop?: {
        items: Array<{
            id: string;
            text: string;
            position: number;
        }>;
        correctOrder: string[];
    };

    /** Contenu pour réponse vidéo */
    videoResponse?: {
        prompt: string;
        expectedSigns: string[];
        duration: number;
    };

    /** Contenu pour texte à trous */
    fillBlank?: {
        text: string;
        blanks: Array<{
            position: number;
            correctAnswer: string;
        }>;
    };

    /** Contenu pour vrai/faux */
    trueFalse?: {
        statements: Array<{
            text: string;
            isTrue: boolean;
        }>;
    };

    /** Contenu pour association */
    matching?: {
        pairs: Array<{
            left: string;
            right: string;
        }>;
    };

    /** Contenu pour réorganisation */
    reordering?: {
        sentences: string[];
        correctOrder: number[];
    };

    /** Contenu pour saisie de texte */
    textEntry?: {
        prompt: string;
        expectedAnswer: string;
        acceptableVariants?: string[];
    };
}

/**
 * Structure d'un exercice généré (version 1)
 */
export interface ExerciseV1 {
    /** Identifiant unique de l'exercice */
    id: string;

    /** Titre de l'exercice */
    title: string;

    /** Description de l'exercice */
    description: string;

    /** Type d'exercice */
    type: ExerciseType;

    /** Niveau de difficulté */
    difficulty: DifficultyLevel;

    /** Contenu de l'exercice (dépend du type) */
    content: ExerciseContent;

    /** Nombre maximum de points */
    maxPoints: number;

    /** Concepts testés dans cet exercice */
    testedConcepts: string[];

    /** Compétence principale testée */
    primarySkill: string;

    /** Temps estimé pour compléter (en secondes) */
    estimatedTime: number;

    /** Indice pour aider l'utilisateur (optionnel) */
    hint?: string;
}

/**
 * Exercice dans un scénario d'apprentissage (version 2)
 */
export interface ExerciseV2 {
    /** Identifiant unique de l'exercice */
    id: string;

    /** Titre de l'exercice */
    title: string;

    /** Instructions pour l'exercice */
    instructions: string;

    /** Type d'exercice */
    type: ExerciseType | string;

    /** Contenu de l'exercice */
    content: Record<string, unknown>;

    /** Niveau de difficulté */
    difficulty: 'easy' | 'medium' | 'hard';

    /** Réponse attendue */
    expectedResponse: unknown;

    /** Indices pour aider l'utilisateur */
    hints?: string[];

    /** Limite de temps en secondes */
    timeLimit?: number;

    /** Compétences ciblées par l'exercice */
    skillsFocus: Partial<Record<SkillType | ErrorCategory, number>>;
}

/**
 * Structure d'un exercice généré (type unifié)
 * Combine les propriétés essentielles des deux versions
 */
export interface Exercise {
    /** Identifiant unique de l'exercice */
    id: string;

    /** Titre de l'exercice */
    title: string;

    /** Type d'exercice */
    type: string;

    /** Niveau de difficulté */
    difficulty: string;

    /** Contenu de l'exercice (dépend du type) */
    content: unknown;

    /** Description ou instructions */
    description?: string;
    instructions?: string;

    /** Indices pour aider l'utilisateur */
    hint?: string;
    hints?: string[];

    /** Temps estimé ou limite de temps (en secondes) */
    estimatedTime?: number;
    timeLimit?: number;

    /** Concepts ou compétences ciblés */
    testedConcepts?: string[];
    skillsFocus?: Partial<Record<string, number>>;
    primarySkill?: string;

    /** Pour l'évaluation */
    maxPoints?: number;
    expectedResponse?: unknown;
}

/**
 * Structure d'un thème d'apprentissage
 */
export interface LearningTheme {
    /** Identifiant unique du thème */
    id: string;

    /** Nom du thème */
    name: string;

    /** Description du thème */
    description: string;

    /** Niveau CECRL minimum recommandé */
    minLevel: CECRLLevel;

    /** Catégorie du thème */
    category: string;

    /** Concepts associés à ce thème */
    associatedConcepts: string[];

    /** Ressources supplémentaires (optionnel) */
    resources?: {
        videos?: string[];
        images?: string[];
        texts?: string[];
    };
}

/**
 * Interface pour une séquence d'apprentissage au sein d'un scénario
 */
export interface LearningSequence {
    /** Identifiant unique de la séquence */
    id: string;

    /** Description de la séquence */
    description: string;

    /** Réponse attendue */
    expectedResponse: string;

    /** Erreurs possibles */
    possibleErrors: {
        type: ErrorType;
        probability: number; // 0-1
        description: string;
    }[];

    /** Indices pour aider l'utilisateur */
    hints: string[];

    /** Options de feedback */
    feedbackOptions: {
        success: string[];
        partialSuccess: string[];
        failure: string[];
    };

    /** Compétences acquises par la séquence */
    skillsGained: Partial<Record<SkillType, number>>;
}

/**
 * Structure d'un scénario d'apprentissage complet (version 1)
 */
export interface LearningScenarioV1 {
    /** Identifiant unique du scénario */
    id: string;

    /** Titre du scénario */
    title: string;

    /** Type de scénario */
    type: ScenarioType;

    /** Niveau CECRL cible */
    level: CECRLLevel;

    /** Thème principal */
    theme: LearningTheme;

    /** Introduction au scénario */
    introduction: string;

    /** Liste des exercices */
    exercises: Exercise[];

    /** Points totaux disponibles */
    totalPoints: number;

    /** Temps estimé total (en minutes) */
    estimatedDuration: number;

    /** Concepts couverts dans ce scénario */
    coveredConcepts: string[];

    /** Niveau auquel l'avatar CODA signe */
    avatarProficiency: {
        level: CECRLLevel;
        errorRate: number;
        errorTypes: string[];
    };
}

/**
 * Interface pour un scénario d'apprentissage (version 2)
 */
export interface LearningScenarioV2 {
    /** Identifiant unique du scénario */
    id: string;

    /** Titre du scénario */
    title: string;

    /** Description du scénario */
    description: string;

    /** Type de scénario */
    type: ScenarioType;

    /** Niveau de difficulté */
    difficulty: ScenarioDifficulty;

    /** Compétences ciblées */
    targetSkills: SkillType[];

    /** Niveau CECRL requis */
    requiredLevel: CECRLLevel;

    /** Points d'expérience à gagner */
    experienceReward: number;

    /** Temps estimé (en minutes) */
    estimatedTime: number;

    /** Séquences d'apprentissage */
    sequences: LearningSequence[];

    /** Thème (optionnel) */
    theme?: string;

    /** Contexte (optionnel) */
    context?: string;

    /** Indique si le scénario est complété */
    isCompleted?: boolean;

    /** Score obtenu */
    score?: number;

    /** Date de soumission */
    submissionDate?: Date;

    /** Exercices du scénario */
    exercises?: Exercise[];

    /** Ressources supplémentaires */
    resources?: Array<{
        type: 'video' | 'image' | 'audio' | 'text' | 'link';
        url: string;
        title: string;
        description?: string;
    }>;
}

/**
 * Structure d'un scénario d'apprentissage (type unifié)
 * Combine les propriétés essentielles des deux versions
 */
export interface LearningScenario {
    /** Identifiant unique du scénario */
    id: string;

    /** Titre du scénario */
    title: string;

    /** Type de scénario */
    type: ScenarioType;

    /** Niveau CECRL */
    level?: CECRLLevel;
    requiredLevel?: CECRLLevel;

    /** Description ou introduction */
    description?: string;
    introduction?: string;

    /** Difficulté du scénario */
    difficulty?: ScenarioDifficulty;

    /** Exercices du scénario */
    exercises?: Exercise[];

    /** Séquences d'apprentissage */
    sequences?: LearningSequence[];

    /** Thème du scénario */
    theme?: LearningTheme | string;

    /** Niveau de l'avatar CODA */
    avatarProficiency?: {
        level: CECRLLevel;
        errorRate: number;
        errorTypes: string[];
    };

    /** Pour les dialogues et démonstrations */
    dialogues?: unknown[];
    demonstrations?: unknown[];

    /** Métadonnées supplémentaires */
    targetSkills?: SkillType[];
    experienceReward?: number;
    totalPoints?: number;
    estimatedTime?: number;
    estimatedDuration?: number;
    coveredConcepts?: string[];
    context?: string;
    isCompleted?: boolean;
    score?: number;
    submissionDate?: Date;
    resources?: unknown[];
}

/**
 * Structure d'une session d'apprentissage
 */
export interface LearningSession {
    /** Identifiant unique de la session */
    id: string;

    /** Identifiant de l'utilisateur */
    userId: string;

    /** Date de début de session */
    startTime: Date;

    /** Date de fin de session */
    endTime: Date;

    /** Durée totale (en minutes) */
    duration: number;

    /** Identifiant du scénario travaillé */
    scenarioId: string;

    /** Type de scénario */
    scenarioType: ScenarioType;

    /** Thèmes abordés */
    themes: string[];

    /** Nombre d'exercices complétés */
    completedExercises: number;

    /** Points gagnés */
    pointsEarned: number;

    /** Performance générale (0-1) */
    performance: number;

    /** Concepts maîtrisés durant cette session */
    newMasteredConcepts: string[];

    /** Résultats par compétence */
    skillResults?: Record<string, {
        total: number;
        correct: number;
    }>;
}

/**
 * Interface décrivant un apprenant dans le système
 */
export interface LearnerProfile {
    /** Identifiant unique */
    id: string;

    /** Nom de l'apprenant */
    name: string;

    /** Langue maternelle */
    nativeLanguage: string;

    /** Niveau CECRL */
    level: CECRLLevel;

    /** Niveaux par compétence */
    skillLevels: Record<ErrorCategory, number>;

    /** Préférences d'apprentissage */
    learningPreferences: LearningPreference[];

    /** Date de dernière activité */
    lastActive: Date;

    /** Chemin d'apprentissage */
    learningPath?: string;

    /** Points d'expérience */
    experiencePoints?: number;

    /** Nombre de scénarios complétés */
    completedScenarios?: number;

    /** IDs des scénarios complétés */
    completedScenarioIds?: string[];

    /** Temps total d'apprentissage (en minutes) */
    learningTime?: number;

    /** Date de dernière évaluation */
    lastEvaluationDate?: Date;
}

/**
 * Interface représentant un profil d'apprentissage inversé d'un utilisateur
 */
export interface UserReverseProfile {
    /**
     * Identifiant de l'utilisateur
     */
    userId: string;

    /**
     * Niveau CECRL actuel
     */
    currentLevel: string;

    /**
     * Domaines de force
     */
    strengthAreas: string[];

    /**
     * Domaines de faiblesse
     */
    weaknessAreas: string[];

    /**
     * Date de la dernière évaluation
     */
    lastEvaluation: Date;

    /**
     * Historique de progression
     */
    progressHistory: Array<{
        /**
         * Date de l'entrée
         */
        date: Date;

        /**
         * Niveau CECRL
         */
        level: string;

        /**
         * Scores par domaine de compétence
         */
        scores: Record<string, number>;
    }>;

    /**
     * Préférences d'exercice
     */
    exercisePreferences: {
        /**
         * Types d'exercice préférés
         */
        preferredTypes: string[];

        /**
         * Préférence de difficulté (0-1)
         */
        difficultyPreference: number;

        /**
         * Domaines de focus
         */
        focusAreas: string[];
    };
}

/**
 * Interface représentant un exercice généré et adapté pour un utilisateur
 */
export interface UserAdaptedExercise {
    /**
     * Identifiant de l'exercice
     */
    id: string;

    /**
     * Type d'exercice
     */
    type: string;

    /**
     * Contenu de l'exercice
     */
    content: unknown;

    /**
     * Paramètres de génération utilisés
     */
    generationParams: {
        type: string;
        level: string;
        difficulty: number;
        focusAreas: string[];
        userId: string;
    };

    /**
     * Indique si des erreurs ont été simulées
     */
    errorsSimulated: boolean;

    /**
     * Domaines de compétence ciblés
     */
    targetedSkills: string[];
}

/**
 * Interface représentant une évaluation de niveau
 */
export interface LevelEvaluation {
    /**
     * Niveau CECRL actuel
     */
    currentLevel: string;

    /**
     * Niveau CECRL recommandé
     */
    recommendedLevel: string;

    /**
     * Indique si un changement de niveau est recommandé
     */
    levelChangeRecommended: boolean;

    /**
     * Progression dans le niveau actuel (0-1)
     */
    progressInCurrentLevel: number;

    /**
     * Scores par domaine de compétence
     */
    scores: Record<string, number>;

    /**
     * Explication de l'évaluation
     */
    explanation?: string;

    /**
     * Domaines de force identifiés
     */
    strengthAreas: string[];

    /**
     * Domaines de faiblesse identifiés
     */
    weaknessAreas: string[];
}

/**
 * Interface des options de configuration du système d'apprentissage inversé
 */
export interface ReverseApprenticeshipOptions {
    /**
     * Active la difficulté adaptative
     */
    adaptiveDifficulty: boolean;

    /**
     * Taux de simulation d'erreurs (0-1)
     */
    errorSimulationRate: number;

    /**
     * Concentre les exercices sur les faiblesses
     */
    focusOnWeaknesses: boolean;

    /**
     * Applique une courbe de progression stricte
     */
    enforceProgressCurve: boolean;

    /**
     * Niveau initial par défaut
     */
    initialLevel?: string;
}

/**
 * Progression d'apprentissage
 */
export interface LearningProgress {
    /** Identifiant de l'utilisateur */
    userId: string;

    /** Progression par compétence */
    skillProgress: Record<ErrorCategory, number>;

    /** Scénarios complétés */
    completedScenarios: string[];

    /** Scénario actuel */
    currentScenario?: string;

    /** Progression de niveau */
    levelProgress: {
        current: CECRLLevel;
        progress: number; // 0-100%
        lastEvaluation: Date;
    };

    /** Statistiques d'apprentissage */
    statistics: {
        totalExercises: number;
        totalTime: number; // en minutes
        successRate: number; // 0-100%
        improvementRate: number; // amélioration relative
    };
}

/**
 * Profil utilisateur du CODA virtuel
 */
export interface UserProfile {
    /** Identifiant de l'utilisateur */
    userId: string;

    /** Identifiant du CODA */
    codaId: string;

    /** Niveau CECRL actuel */
    currentLevel: CECRLLevel;

    /** Progression de l'utilisateur */
    progress: UserProgress;

    /** Préférences de l'utilisateur */
    preferences: {
        learningRate: 'slow' | 'normal' | 'fast';
        errorFrequency: 'low' | 'medium' | 'high';
        focusAreas: string[];
    };

    /** Scénario actuel */
    currentScenario: LearningScenario | null;

    /** Badges gagnés */
    badgesEarned: Array<{
        id: string;
        title: string;
        description: string;
        earnedAt: string;
        imageUrl: string;
    }>;
}

/**
 * Progression de l'utilisateur
 */
export interface UserProgress {
    /** Points d'expérience */
    experiencePoints: number;

    /** Scénarios complétés */
    completedScenarios: Array<{
        scenarioId: string;
        completedAt: string;
        score: number;
        passed: boolean;
        level: CECRLLevel;
        errorSummary: Record<ErrorCategory, number>;
    }>;

    /** Niveaux par compétence */
    skillLevels: Record<ErrorCategory | SkillType, number>;

    /** Distribution des erreurs */
    errorDistribution: ErrorDistribution;

    /** Points forts */
    strengths: Array<{
        skill: ErrorCategory | SkillType;
        level: number;
    }>;

    /** Points faibles */
    weaknesses: Array<{
        skill: ErrorCategory | SkillType;
        level: number;
    }>;
}

/**
 * Mapping entre les niveaux CECRL et les points d'expérience requis
 */
export const LEVEL_XP_REQUIREMENTS: Record<CECRLLevel, number> = {
    [CECRLLevel.A1]: 0,
    [CECRLLevel.A2]: 1000,
    [CECRLLevel.B1]: 3000,
    [CECRLLevel.B2]: 6000,
    [CECRLLevel.C1]: 10000,
    [CECRLLevel.C2]: 15000
};