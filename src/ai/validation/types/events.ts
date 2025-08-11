// src/ai/validation/types/events.ts
export type ValidationEventType = 'state_change' | 'feedback_added' | 'expert_assigned' | '*';

export type ValidationEventCallback = (
    validationId: string,
    eventType: Exclude<ValidationEventType, '*'>,
    data: unknown
) => void;