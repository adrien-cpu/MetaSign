// src/components/translation/types.ts

export interface Sign {
    id: string;
    word: string;
    timestamp: number;
}

export interface TimelineProps {
    signs: Sign[];
    selectedSigns: number[];
    setSelectedSigns: React.Dispatch<React.SetStateAction<number[]>>;
}