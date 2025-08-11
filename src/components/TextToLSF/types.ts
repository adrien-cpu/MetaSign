// src/app/components/TextToLSF/types.ts
export interface Sign {
    id: number | string;
    word: string;
    timestamp: number;
    videoUrl: string;
}

export interface TextToLSFProps {
    onOpenFeedback: (signs: Sign[]) => void;
}