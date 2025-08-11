// src/ai/validation/types/notification.ts
export interface NotificationContext {
    validationId?: string;
    priority?: 'low' | 'medium' | 'high';
    expiresAt?: Date;
    actionRequired?: boolean;
    category?: 'feedback' | 'state_change' | 'deadline' | 'assignment' | 'other';
    metadata?: Record<string, unknown>;
}
