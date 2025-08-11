// Fichier: src/ai/feedback/types/index.ts
import {
  FeedbackTypeValue,
  FeedbackContentType,
  LSFSign,
  CorrectionType,
  CorrectionData,
  LearningContext,
  ExpressionFeedback,
  CorrectionFeedback,
  EvaluationFeedback,
  SuggestionFeedback,
  AnalysisFeedback,
  CorrectionValue
} from './FeedbackInterfaces';

/**
 * Type d'union pour les différents types de feedback possibles
 */
export type FeedbackType = FeedbackTypeValue;

/**
 * Type d'union pour le contenu des différents types de feedback
 */
export type FeedbackContent = FeedbackContentType;

/**
 * Métadonnées communes à tous les types de feedback
 */
export interface FeedbackMetadata {
  source: string;
  timestamp: number;
  sessionId?: string;
  userId?: string;
  context?: LearningContext | Record<string, unknown>;
  priority?: 'low' | 'medium' | 'high';
  seen?: boolean;
  acknowledged?: boolean;
  tags?: string[];
}

/**
 * Interface de base pour toutes les entrées de feedback
 */
export interface FeedbackEntry {
  id: string;
  timestamp: number;
  type: FeedbackType;
  content: FeedbackContent;
  metadata: FeedbackMetadata;
}

/**
 * Représente une séquence de feedback, généralement liée à une session
 */
export interface FeedbackSequence {
  id: string;
  entries: FeedbackEntry[];
  startTime: number;
  endTime?: number;
  sessionId: string;
  userId: string;
  summary?: {
    totalEntries: number;
    byType: Record<FeedbackType, number>;
    averageScores?: Record<string, number>;
    highlights: {
      strengths: string[];
      areas_to_improve: string[];
    };
  };
}

// Types spécifiques pour la validation spatiale et des proformes
export interface SpatialValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
  suggestions?: string[];
}

// Extensions spécifiques au contexte LSF
export interface LSFContext {
  handshapeLeft?: string;
  handshapeRight?: string;
  orientationLeft?: string;
  orientationRight?: string;
  movement?: string[];
  location?: {
    x: number;
    y: number;
    z: number;
  }[];
}

/**
 * Interface pour les données de feedback utilisées par FeedbackQualityAssessor
 */
export interface FeedbackData {
  emotion?: {
    type: string;
    intensity: number;
    details?: string;
  };
  expression?: {
    clarity: number;
    naturalness: number;
    accuracy: number;
    details?: string;
  };
  input?: {
    text?: string;
    source?: string;
    language?: string;
  };
  context: {
    timestamp: number;
    userProfile?: {
      expertiseLevel: string;
      preferences?: Record<string, unknown>;
    };
    environment?: string;
    sessionId?: string;
  };
  [key: string]: unknown;
}

// Type d'analyse de feedback
export interface FeedbackAnalysis {
  id: string;
  feedbackEntryId: string;
  timestamp: number;
  metrics: {
    accuracy?: number;
    fluency?: number;
    naturalness?: number;
    comprehensibility?: number;
  };
  annotations: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    position?: {
      start: number;
      end: number;
    };
  }[];
}

// Type pour les statistiques de feedback
export interface FeedbackStatistics {
  totalEntries: number;
  typeDistribution: Record<FeedbackType, number>;
  averageMetrics?: {
    accuracy: number;
    fluency: number;
    naturalness: number;
    comprehensibility: number;
  };
  commonIssues: {
    type: string;
    count: number;
    examples: string[];
  }[];
  trends: {
    period: string;
    count: number;
    improvement: number;
  }[];
}

// Réexporter les types depuis FeedbackInterfaces pour une utilisation plus simple
// Utilisation de 'export type' pour être compatible avec isolatedModules
export type {
  LSFSign,
  CorrectionType,
  CorrectionData,
  LearningContext,
  ExpressionFeedback,
  CorrectionFeedback,
  EvaluationFeedback,
  SuggestionFeedback,
  AnalysisFeedback,
  CorrectionValue
};