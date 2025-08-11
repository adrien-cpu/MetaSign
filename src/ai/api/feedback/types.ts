// src/ai/api/feedback/types.ts

export interface FeedbackEntry {
  id: string;
  type: string;
  content: string;
  timestamp: number;
  metadata: FeedbackMetadata;
}

export interface FeedbackMetadata {
  source: string;
  context: string;
  priority: number;
  tags: string[];
}

export interface FeedbackAnalysis {
  entryId: string;
  score: number;
  evaluations: Evaluation[];
  recommendations: Recommendation[];
  metadata: AnalysisMetadata;
}

export interface Evaluation {
  criterion: string;
  score: number;
  comments: string;
  confidence: number;
}

export interface Recommendation {
  type: string;
  description: string;
  priority: number;
  implementationSteps?: string[];
}

export interface AnalysisMetadata {
  timestamp: number;
  analyzerId: string;
  version: string;
  processingTime: number;
  confidenceScore: number;
}

export interface FeedbackRequestOptions {
  priority: number;
  analysisDepth: 'quick' | 'normal' | 'deep';
  synchronous: boolean;
  timeout?: number;
}

export interface FeedbackAPIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface FeedbackAPIMetadata {
  requestId: string;
  timestamp: number;
  processingTime: number;
  version: string;
}