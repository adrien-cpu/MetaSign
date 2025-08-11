// src/ai/types/emotions.ts

export interface EmotionInput {
    type: string;
    intensity: number;
    duration: number;
    valence: number;
}

export interface EmotionalContext {
    purpose: string;
    formalityLevel: number;
    culturalContext?: string;
    socialContext?: string;
}

export interface EmotionalNuances {
    authenticity: number;
    culturalAccuracy: number;
    expressiveness: number;
}

export interface EmotionMetadata {
    authenticity: number;
    culturalAccuracy: number;
    expressiveness: number;
    socialAdaptation: number;
}

export interface EmotionalExpression {
    type: string;
    intensity: number;
    components: ExpressionComponent[];
}

export interface ExpressionComponent {
    type: string;
    position: number;
    intensity: number;
    duration: number;
    properties: Record<string, number | boolean>;
}

export interface EmotionTransition {
    fromType: string;
    toType: string;
    duration: number;
    curve: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
    intensityChange: {
        start: number;
        end: number;
        steps?: number;
    };
    metadata?: {
        priority?: number;
        smoothness?: number;
        customCurve?: number[];
    };
}

export interface TimingComponent {
    components: Record<string, number>;
    transitions: EmotionTransition[];
    totalDuration: number;
}

export interface AnalyzedEmotion {
    type: string;
    intensity: number;
    authenticity: number;
    culturalAccuracy: number;
    expressiveness: number;
}

export interface EmotionalState {
    intensity: number;
    confidence: number;
    primary: EmotionData;
    secondary?: EmotionData;
    metadata: Record<string, unknown>;
}

export interface Emotion {
    type: EmotionType;
    intensity: number;
    duration: number;
}

export enum EmotionType {
    JOY = 'joy',
    SADNESS = 'sadness',
    ANGER = 'anger',
    FEAR = 'fear',
    SURPRISE = 'surprise'
}

interface EmotionData {
    intensity: number;
    duration: number;
    context: EmotionContext;
}

interface EmotionContext {
    trigger: string;
    category: string;
    metadata: Record<string, unknown>;
}