// src/ai/types/intent.ts

export type IntentParameterValue =
    | string
    | number
    | boolean
    | { [key: string]: IntentParameterValue }
    | IntentParameterValue[];

export type IntentModifierValue =
    | string
    | number
    | boolean
    | { intensity?: number; duration?: number; priority?: number }
    | string[];

export interface IntentData {
    primary: Intent;
    modifiers: IntentModifier[];
    confidence: number;
    context: IntentContext;
}

export interface Intent {
    type: string;
    parameters: Record<string, IntentParameterValue>;
    priority: number;
    metadata: IntentMetadata;
    action: IntentAction;
    data: Record<string, unknown>;
}

export interface IntentModifier {
    type: string;
    value: IntentModifierValue;
}

export interface IntentContext {
    situation: string;
    participants: string[];
    environment: string;
}

interface IntentMetadata {
    confidence: number;
    source: string;
    context: Record<string, unknown>;
}

interface IntentAction {
    type: string;
    parameters: Record<string, unknown>;
}