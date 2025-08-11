//src/ai/types/feedback/expression.ts
import { FeedbackContentType } from '@ai-types/feedback';
import { LSFExpressionExtended } from '@ai-types/lsf/extended';

/**
 * Types pour les analyses de composants manuels
 */
export interface ManualAnalysis {
    handshape: { accuracy: number; appropriateness: number };
    movement: { fluidity: number; accuracy: number };
    location: { precision: number; visibility: number };
    orientation: { clarity: number; appropriateness: number };
    [key: string]: unknown;
}

/**
 * Types pour les analyses de composants non-manuels
 */
export interface NonManualAnalysis {
    facial: { expressiveness: number; synchronization: number };
    head: { movement: number; coordination: number };
    body: { posture: number; orientation: number };
    [key: string]: unknown;
}

/**
 * Types pour les analyses de composants spatiaux
 */
export interface SpatialAnalysis {
    space: { utilization: number; consistency: number };
    references: { clarity: number; maintenance: number };
    planes: { appropriate: boolean; consistent: boolean };
    [key: string]: unknown;
}

/**
 * Types pour les analyses de composants temporels
 */
export interface TemporalAnalysis {
    timing: { appropriate: number; consistency: number };
    sequence: { logical: number; fluid: number };
    transitions: { smoothness: number; naturalness: number };
    [key: string]: unknown;
}

/**
 * Structure complète d'une analyse d'expression
 */
export interface ExpressionAnalysis {
    manual: ManualAnalysis;
    nonManual: NonManualAnalysis;
    spatial: SpatialAnalysis;
    temporal: TemporalAnalysis;
}

/**
 * Extension du type FeedbackContentType pour inclure les expressions LSF
 */
export interface ExtendedFeedbackContent extends FeedbackContentType {
    expression?: LSFExpressionExtended;
}