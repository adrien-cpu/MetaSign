// src/ai/api/multimodal/analysis/types/modalities.ts
export interface SynchronizedModalities {
    lsf: LSFModality;
    vocal: VocalModality;
    timeOffset: number;
    synchronizationScore: number;
}

export interface LSFModality {
    gestures: GestureData[];
    facial: FacialData;
    temporal: TemporalData;
}

export interface VocalModality {
    audio: AudioData;
    prosody: ProsodyData;
    temporal: TemporalData;
}

export interface EmotionalState {
    primary: Emotion;
    secondary?: Emotion;
    intensity: number;
    confidence: number;
    timestamp: number;
}

export interface Emotion {
    type: EmotionType;
    value: number;
    confidence: number;
}

export enum EmotionType {
    JOY = 'joy',
    SADNESS = 'sadness',
    ANGER = 'anger',
    FEAR = 'fear',
    SURPRISE = 'surprise',
    NEUTRAL = 'neutral'
}