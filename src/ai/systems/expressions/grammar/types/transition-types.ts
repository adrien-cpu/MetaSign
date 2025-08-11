// src/ai/systems/expressions/grammar/types/transition-types.ts
import { LSFExpression } from '../../lsf/types';

/**
 * Types d'expressions grammaticales en LSF
 */
export enum LSFExpressionType {
    QUESTION = 'question',
    NEGATION = 'negation',
    EMPHASIS = 'emphasis',
    CONDITION = 'condition',
    ASSERTION = 'assertion',
    DEFAULT = 'default'
}

/**
 * Types de transitions entre expressions grammaticales
 */
export enum TransitionType {
    QUESTION_TO_QUESTION = 'QUESTION_TO_QUESTION',
    TO_NEGATION = 'TO_NEGATION',
    TO_EMPHASIS = 'TO_EMPHASIS',
    TO_CONDITION = 'TO_CONDITION',
    DEFAULT = 'DEFAULT'
}

/**
 * Règles de transition entre expressions
 */
export interface TransitionRule {
    minDuration: number;
    requiresReset: boolean;
    blendFactor: number;
}

/**
 * Dictionnaire de règles de transition indexé par type de transition
 */
export interface TransitionRuleSet {
    [TransitionType.QUESTION_TO_QUESTION]: TransitionRule;
    [TransitionType.TO_NEGATION]: TransitionRule;
    [TransitionType.TO_EMPHASIS]: TransitionRule;
    [TransitionType.TO_CONDITION]: TransitionRule;
    [key: string]: TransitionRule;  // Signature d'index pour permettre l'indexation par chaîne
}

/**
 * Contexte influençant les transitions
 */
export interface TransitionContext {
    speed?: 'slow' | 'normal' | 'fast';
    importance?: 'low' | 'normal' | 'high';
    environment?: 'formal' | 'casual';
    quantizationLevel?: 'low' | 'medium' | 'high';
}

/**
 * Étape individuelle dans une séquence de transition
 */
export interface TransitionStep {
    expression: LSFExpression;
    duration: number;
    easing: string;
}

/**
 * Séquence complète de transition entre deux expressions
 */
export interface TransitionSequence {
    steps: TransitionStep[];
    duration: number;
    metadata: {
        type: string;
        requiresReset: boolean;
        importance: string;
    };
}