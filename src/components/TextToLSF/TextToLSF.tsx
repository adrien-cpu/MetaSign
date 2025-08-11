// src/components/TextToLSF/TextToLSF.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { Timeline } from '@/components/translation/Timeline';
import { Feedback } from './Feedback';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sign } from '@/types/translation';

interface TextToLSFProps {
    onOpenFeedback: (signs: Sign[]) => void;
}

const MAX_INPUT_LENGTH = 500;

const TextToLSF: React.FC<TextToLSFProps> = ({ onOpenFeedback }) => {
    const [inputText, setInputText] = useState<string>('');
    const [selectedSigns, setSelectedSigns] = useState<number[]>([]);

    // Memoize signs to prevent unnecessary re-renders
    const signs: Sign[] = useMemo(() => [
        { id: '1', word: 'Bonjour', timestamp: 0, videoUrl: '/signed/bonjour.mp4' },
        { id: '2', word: 'Comment', timestamp: 5, videoUrl: '/signed/comment.mp4' },
        { id: '3', word: 'Ça', timestamp: 8, videoUrl: '/signed/ca.mp4' },
        { id: '4', word: 'Va', timestamp: 10, videoUrl: '/signed/va.mp4' },
    ], []);

    // Memoize input change handler
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.length <= MAX_INPUT_LENGTH) {
            setInputText(value);
        }
    }, []);

    // Memoize feedback submission handler
    const handleSubmitFeedback = useCallback(() => {
        const selectedSignsData = selectedSigns.map(index => signs[index]);
        onOpenFeedback(selectedSignsData);
    }, [selectedSigns, signs, onOpenFeedback]);

    // Memoize character count text
    const characterCountText = useMemo(() =>
        `${inputText.length}/${MAX_INPUT_LENGTH} caractères`,
        [inputText.length]
    );

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Textarea
                value={inputText}
                onChange={handleInputChange}
                className="w-full h-32 p-3 resize-none"
                placeholder="Entrez votre texte ici..."
                maxLength={MAX_INPUT_LENGTH}
                aria-label="Texte à traduire en LSF"
            />

            <div
                className="text-sm text-gray-500"
                aria-live="polite"
            >
                {characterCountText}
            </div>

            <Timeline
                signs={signs}
                selectedSigns={selectedSigns}
                setSelectedSigns={setSelectedSigns}
            />

            <Feedback
                selectedSigns={selectedSigns}
                signs={signs}
            />

            <Button
                onClick={handleSubmitFeedback}
                disabled={selectedSigns.length === 0}
                className="w-full md:w-auto"
                aria-label="Soumettre le feedback pour les signes sélectionnés"
            >
                Soumettre le Feedback
            </Button>
        </div>
    );
};

// Add display name for better debugging
TextToLSF.displayName = 'TextToLSF';

export default TextToLSF;