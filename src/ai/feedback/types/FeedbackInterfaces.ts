// Fichier: src/ai/feedback/types/FeedbackInterfaces.ts
import { FeedbackEntry } from './index';

// Définition du type LSFSign
export interface LSFSign {
    id: string;
    name: string;
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
    nonManualFeatures?: {
        facial?: string[];
        mouth?: string[];
        gaze?: string;
        head?: string;
        body?: string;
    };
    meaning: string[];
    contexts?: string[];
    dialectVariants?: string[];
    culturalNotes?: string[];
    createdAt: number;
    updatedAt: number;
}

// Définition du type de correction
export enum CorrectionType {
    HANDSHAPE = 'handshape',
    ORIENTATION = 'orientation',
    MOVEMENT = 'movement',
    LOCATION = 'location',
    EXPRESSION = 'expression',
    TIMING = 'timing',
    GRAMMAR = 'grammar',
    SEMANTIC = 'semantic',
    CULTURAL = 'cultural'
}

// Type pour les données de correction originales et suggérées
export type CorrectionValue =
    | string
    | string[]
    | { left?: string; right?: string }
    | { x: number; y: number; z: number }[]
    | {
        facial?: string[];
        mouth?: string[];
        gaze?: string;
        head?: string;
        body?: string
    };

// Structure de données pour les corrections
export interface CorrectionData {
    type: CorrectionType;
    original: CorrectionValue;
    suggested: CorrectionValue;
    explanation: string;
    importance: 'low' | 'medium' | 'high';
    culturalContext?: string[];
}

// Interface pour le contexte d'apprentissage
export interface LearningContext {
    userId: string;
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    currentModule: string;
    progress: number;
    focusAreas: string[];
    settings: {
        feedbackLevel: 'minimal' | 'moderate' | 'detailed';
        adaptationLevel: 'none' | 'low' | 'high';
        cultural: boolean;
        dialectal: boolean;
    };
    history: {
        completedLessons: string[];
        challenges: {
            id: string;
            score: number;
            completedAt: number;
        }[];
    };
}

// Types possibles de feedback
export type FeedbackTypeValue = 'expression' | 'correction' | 'evaluation' | 'suggestion' | 'analysis';

// Interface pour les métadonnées de feedback communes
export interface FeedbackMetadataInterface {
    timestamp: number;
    sessionId: string;
    userId: string;
    context?: LearningContext;
    source: 'automatic' | 'human-teacher' | 'peer' | 'self';
    priority: 'low' | 'medium' | 'high';
    seen: boolean;
    acknowledged: boolean;
    tags?: string[];
}

// Interfaces spécifiques pour les différents types de feedback
export interface ExpressionFeedback extends FeedbackEntry {
    type: 'expression';
    content: {
        sign: LSFSign;
        performance: {
            accuracy: number;
            fluency: number;
            clarity: number;
        };
    };
}

export interface CorrectionFeedback extends FeedbackEntry {
    type: 'correction';
    content: {
        signId: string;
        corrections: CorrectionData[];
    };
}

export interface EvaluationFeedback extends FeedbackEntry {
    type: 'evaluation';
    content: {
        signId: string;
        scores: {
            handshape: number;
            orientation: number;
            movement: number;
            location: number;
            timing: number;
            expressiveness: number;
            overall: number;
        };
        comments: string;
    };
}

export interface SuggestionFeedback extends FeedbackEntry {
    type: 'suggestion';
    content: {
        context: string;
        suggestions: {
            type: string;
            description: string;
            example?: LSFSign;
        }[];
    };
}

export interface AnalysisFeedback extends FeedbackEntry {
    type: 'analysis';
    content: {
        signSequence: string[];
        grammaticalAnalysis: {
            structure: string;
            correctness: number;
            issues: {
                type: string;
                description: string;
                position: number;
            }[];
        };
        semanticAnalysis: {
            clarity: number;
            coherence: number;
            issues: {
                type: string;
                description: string;
                suggestion?: string;
            }[];
        };
    };
}

// Type union pour le contenu de feedback
export type FeedbackContentType =
    | ExpressionFeedback['content']
    | CorrectionFeedback['content']
    | EvaluationFeedback['content']
    | SuggestionFeedback['content']
    | AnalysisFeedback['content'];