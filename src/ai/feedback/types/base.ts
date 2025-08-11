//src/ai/feedback/types
import { EmotionState } from '../../emotions/types/base';
import { LSFExpression } from '../../emotions/lsf/types';

export interface FeedbackEntry {
  id: string;
  type: FeedbackType;
  timestamp: number;
  content: FeedbackContent;
  metadata: FeedbackMetadata;
}

export interface FeedbackContent {
  emotion?: EmotionState;
  expression?: LSFExpression;
  rating?: number;
  comment?: string;
}

export interface FeedbackMetadata {
  context: string;
  sessionId: string;
  userId: string;
  priority: number;
}

export type FeedbackType = 'emotion' | 'expression' | 'rating' | 'correction';

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  score: number;
}

export interface ValidationIssue {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  location?: ValidationLocation;
}

// New type to replace 'any' for location
export type ValidationLocation =
  | {
    type: 'expression';
    component: keyof LSFExpression;
    details?: Partial<LSFExpression>;
  }
  | {
    type: 'emotion';
    component: keyof EmotionState;
    details?: Partial<EmotionState>;
  }
  | {
    type: 'general';
    description: string;
  };