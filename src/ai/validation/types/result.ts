// src/ai/validation/types/result.ts
export interface Result<T> {
    success: boolean;
    data?: T;
    error?: ValidationError;
}

export interface ValidationError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}