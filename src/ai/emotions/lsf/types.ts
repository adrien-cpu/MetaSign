// Fichier: src/ai/emotions/lsf/types.ts

// Types de base pour les expressions LSF
export interface LSFExpression {
    id?: string;
    handshapes: {
        left?: string;
        right?: string;
    };
    orientations: {
        left?: string;
        right?: string;
    };
    movements: string[];
    locations: {
        x: number;
        y: number;
        z: number;
    }[];
    timestamp?: number;
    nonManualFeatures?: {
        facial?: string[];
        mouth?: string[];
        head?: string[];
        eyebrows?: string;
        eyeGaze?: string;
        body?: string;
    };
    duration?: number;
    intensity?: number;
    context?: string[];
}

// Types d'émotions en LSF
export enum LSFEmotionType {
    JOY = 'joy',
    SADNESS = 'sadness',
    ANGER = 'anger',
    FEAR = 'fear',
    SURPRISE = 'surprise',
    DISGUST = 'disgust',
    NEUTRAL = 'neutral',
    PRIDE = 'pride',
    SHAME = 'shame',
    CONFUSION = 'confusion',
    INTEREST = 'interest',
    FRUSTRATION = 'frustration'
}

// Interface pour les expressions émotionnelles en LSF
export interface LSFEmotionalExpression extends LSFExpression {
    emotion: LSFEmotionType;
    intensity: number; // 0 à 1
    context?: string[];
    culturalFactors?: string[];
    variations?: {
        dialectal?: string;
        contextual?: string;
        personal?: string;
    };
}

// Interface pour les paramètres d'animation LSF
export interface LSFAnimationParams {
    duration: number; // en millisecondes
    easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'springy';
    delay?: number;
    repeat?: number;
    yoyo?: boolean; // aller-retour
    intensity?: number; // facteur d'intensité pour les émotions
}

// Interface pour les transitions entre expressions
export interface LSFTransition {
    from: LSFExpression;
    to: LSFExpression;
    duration: number;
    easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'springy';
    keyframes?: LSFExpression[];
    metadata?: {
        type: 'natural' | 'dynamic' | 'abrupt';
        description?: string;
        difficulty?: 'easy' | 'medium' | 'hard';
    };
}

// Interface pour les séquences d'expressions
export interface LSFSequence {
    id: string;
    name?: string;
    expressions: LSFExpression[];
    transitions?: LSFTransition[];
    duration: number;
    loop?: boolean;
    metadata?: {
        context?: string[];
        category?: string;
        difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
        cultural?: string[];
    };
}

// Interface pour le contexte d'utilisation LSF
export interface LSFContext {
    setting: 'formal' | 'informal' | 'educational' | 'professional' | 'emergency' | 'personal';
    audience: {
        age?: string;
        proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'native';
        cultural?: string[];
        size?: 'individual' | 'small' | 'large';
    };
    environment?: {
        lighting?: 'bright' | 'normal' | 'dim' | 'dark';
        distance?: 'close' | 'normal' | 'far';
        noise?: 'quiet' | 'moderate' | 'loud';
    };
    dialect?: string;
    region?: string;
    priority?: 'clarity' | 'speed' | 'expressiveness' | 'cultural';
}

// Interface pour la validation des expressions LSF
export interface LSFValidationResult {
    isValid: boolean;
    score: number;
    errors: LSFValidationError[];
    warnings: LSFValidationWarning[];
    metrics: {
        fluency?: number;
        accuracy?: number;
        naturalness?: number;
        expressiveness?: number;
        comprehensibility?: number;
    };
}

// Interface pour les erreurs de validation
export interface LSFValidationError {
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    component?: keyof LSFExpression;
    suggestion?: LSFValidationSuggestion;
}

// Interface pour les avertissements de validation
export interface LSFValidationWarning {
    type: string;
    description: string;
    component?: keyof LSFExpression;
    suggestion?: LSFValidationSuggestion;
}

// Interface pour les suggestions de validation
export interface LSFValidationSuggestion {
    description: string;
    modifiedExpression?: Partial<LSFExpression>;
    replacementComponent?: Partial<LSFExpression[keyof LSFExpression]>;
}

// Types pour l'intégration avec le système d'expressions
export interface LSFExpressionTemplate {
    id: string;
    name: string;
    description?: string;
    baseExpression: Partial<LSFExpression>;
    variations: {
        id: string;
        name: string;
        description?: string;
        modifications: Partial<LSFExpression>;
        context?: string[];
    }[];
    metadata: {
        category: string;
        difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
        cultural?: string[];
        usage?: string[];
        tags?: string[];
    };
}