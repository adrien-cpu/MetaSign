//src/ai/types/conversational.ts

/**
 * Types et interfaces pour le système conversationnel avancé
 */

/**
 * Configuration du système conversationnel
 */
export interface ConversationConfig {
    /** Période de rétention du contexte de conversation (en ms) */
    contextRetentionPeriod: number;

    /** Indique si l'adaptation émotionnelle est activée */
    emotionalAdaptation: boolean;

    /** Stratégie de réponse par défaut */
    defaultStrategy: string;

    /** Taux d'apprentissage pour l'amélioration continue */
    learningRate: number;

    /** Taille maximale du contexte (nombre de tours de conversation) */
    maxContextSize: number;

    /** Indique si la synchronisation multimodale est activée */
    multimodalSynchronization: boolean;
}

/**
 * Contexte d'une conversation
 */
export interface ConversationContext {
    /** Identifiant unique de la conversation */
    conversationId: string;

    /** Moment de début de la conversation */
    startTime: number;

    /** Moment de la dernière mise à jour */
    lastUpdateTime: number;

    /** Tours de conversation */
    turns: ConversationTurn[];

    /** Intentions utilisateur détectées */
    userIntents: ConversationIntent[];

    /** États émotionnels détectés */
    detectedEmotions: EmotionalState[];

    /** Références à la mémoire long-terme */
    memoryReferences: string[];

    /** Contextes multimodaux utilisés */
    multimodalContexts: MultimodalContext[];
}

/**
 * Tour de conversation
 */
export interface ConversationTurn {
    /** Horodatage de ce tour */
    timestamp: number;

    /** Entrée utilisateur */
    input: {
        /** Contenu de l'entrée */
        content: string;

        /** Type d'entrée (texte, lsf, etc.) */
        type: string;
    };

    /** Réponse système */
    response: {
        /** Contenu de la réponse */
        content: string;

        /** Émotion associée à la réponse */
        emotion: EmotionalState;
    };

    /** ID de la stratégie utilisée pour ce tour */
    strategyUsed: string;
}

/**
 * Intention conversationnelle détectée
 */
export interface ConversationIntent {
    /** Type d'intention */
    type: string;

    /** Score de confiance (0-1) */
    confidence: number;

    /** Entités associées à l'intention */
    entities?: Array<{
        name: string;
        value: string;
        confidence: number;
    }>;

    /** Contexte de l'intention */
    context?: Record<string, unknown>;

    /** Horodatage de la détection */
    timestamp: number;
}

/**
 * État émotionnel
 */
export interface EmotionalState {
    /** Émotion principale */
    primaryEmotion: string;

    /** Intensité de l'émotion (0-1) */
    intensity: number;

    /** Émotions secondaires */
    secondaryEmotions?: Array<{
        emotion: string;
        intensity: number;
    }>;

    /** Valence émotionnelle (optionnelle) */
    valence?: number;

    /** Activation émotionnelle (optionnelle) */
    arousal?: number;
}

/**
 * Contexte multimodal pour la synchronisation
 */
export interface MultimodalContext {
    /** Identifiant unique du contexte */
    id: string;

    /** Expression faciale */
    facialExpression?: {
        /** Type d'expression */
        type: string;

        /** Intensité de l'expression (0-1) */
        intensity: number;

        /** Paramètres spécifiques de l'expression */
        parameters?: Record<string, number>;
    };

    /** Expression corporelle */
    bodyExpression?: {
        /** Type d'expression */
        type: string;

        /** Intensité de l'expression (0-1) */
        intensity: number;

        /** Paramètres spécifiques de l'expression */
        parameters?: Record<string, number>;
    };

    /** Paramètres prosodiques */
    prosody?: {
        /** Rythme (0-1 où 1 est le plus rapide) */
        rate: number;

        /** Volume (0-1) */
        volume: number;

        /** Variation de fréquence pour simulation de ton */
        pitch: number;
    };

    /** Paramètres spatiaux (pour LSF) */
    spatial?: {
        /** Amplitude des mouvements (0-1) */
        amplitude: number;

        /** Espace de signation utilisé */
        signingSpace: string;

        /** Références spatiales actives */
        activeReferences?: string[];
    };
}

/**
 * Stratégie de réponse
 */
export interface ResponseStrategy {
    /** Identifiant unique de la stratégie */
    id: string;

    /** Nom lisible de la stratégie */
    name: string;

    /** Priorité de la stratégie (plus élevé = plus prioritaire) */
    priority: number;

    /** Paramètres de la stratégie */
    parameters: {
        /** Niveau de détail (0-1) */
        detailLevel: number;

        /** Niveau de formalité (0-1) */
        formalityLevel: number;

        /** Expression émotionnelle (0-1) */
        emotionalExpression: number;

        /** Fréquence d'exemples (optionnelle, 0-1) */
        exampleFrequency?: number;

        /** Autres paramètres spécifiques */
        [key: string]: number | undefined;
    };

    /** Conditions contextuelles d'application */
    contextConditions?: {
        /** Types d'intention compatibles */
        intentTypes?: string[];

        /** États émotionnels compatibles */
        emotionalStates?: string[];

        /** Score de confiance minimum requis */
        minConfidenceScore?: number;

        /** Contraintes temporelles */
        timeConstraints?: boolean;

        /** Niveau utilisateur */
        userLevel?: string[];

        /** Autres conditions spécifiques */
        [key: string]: unknown;
    };
}