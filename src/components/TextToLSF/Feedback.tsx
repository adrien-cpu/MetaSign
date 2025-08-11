// src/app/components/TextToLSF/Feedback.tsx
import React from 'react';
import { Sign } from '@/types/translation';
import { Badge } from '@/components/ui/badge';

interface FeedbackProps {
    selectedSigns: number[];
    signs: Sign[];
}

export const Feedback: React.FC<FeedbackProps> = ({ selectedSigns, signs }) => {
    if (selectedSigns.length === 0) {
        return (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-6">
                <h3 className="text-lg font-medium mb-2">Feedback</h3>
                <p className="text-gray-500 italic">
                    Sélectionnez des signes sur la timeline pour les inclure dans votre feedback.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-6">
            <h3 className="text-lg font-medium mb-2">Feedback</h3>
            <p className="text-sm text-gray-600 mb-3">
                Signes sélectionnés pour le feedback:
            </p>
            <div className="flex flex-wrap gap-2">
                {selectedSigns.map(index => (
                    <Badge
                        key={signs[index].id}
                        variant="outline"
                        className="flex items-center gap-1 px-3 py-1"
                    >
                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            {index + 1}
                        </span>
                        <span>{signs[index].word}</span>
                    </Badge>
                ))}
            </div>
        </div>
    );
};