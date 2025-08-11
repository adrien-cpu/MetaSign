// src/ai/types/IAState.ts
export type IAType = 'linguist' | 'emotion' | 'expression' | 'validation';

export interface IAState {
    id: string;
    status: 'active' | 'idle' | 'error';
    type: IAType;
}