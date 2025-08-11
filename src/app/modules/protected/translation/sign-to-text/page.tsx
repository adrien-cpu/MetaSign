'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Maximize2,
    MessageCircle,
    Flag,
    Info
} from 'lucide-react';

// Sign interface for type safety
export interface Sign {
    id: number;
    word: string;
    timestamp: number;
    videoUrl: string;
}

// Minimalist LSFArea component with enhanced functionality
const LSFArea = ({
    isInput = true,
    currentTime = 0,
    signs,
    selectedSigns = [],
    onSignSelect,
    previewRef,
    onTimeChange
}: {
    isInput?: boolean;
    currentTime?: number;
    signs: Sign[];
    selectedSigns?: number[];
    onSignSelect?: (index: number) => void;
    previewRef: React.RefObject<HTMLDivElement>;
    onTimeChange?: (time: number) => void;
}) => {
    // Use isInput to conditionally render or modify component
    const renderMode = isInput ? 'Entrée' : 'Sortie';

    // Memoize time progression calculation
    const calculateNextTime = useCallback((prevTime: number) => {
        const maxTimestamp = signs[signs.length - 1]?.timestamp || 10;
        const newTime = prevTime + 0.1;
        // Reset time after reaching max timestamp
        return newTime > maxTimestamp ? 0 : newTime;
    }, [signs]);

    // Simulate time progression for demonstration
    useEffect(() => {
        const timer = setInterval(() => {
            // Directly call onTimeChange with calculated time
            onTimeChange?.(calculateNextTime(currentTime));
        }, 100);

        return () => clearInterval(timer);
    }, [onTimeChange, currentTime, calculateNextTime]);

    return (
        <div className="space-y-4">
            {/* Prévisualisation */}
            <div className="relative">
                <div
                    ref={previewRef}
                    className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center"
                >
                    <div className="text-white text-sm">
                        Zone d&apos;aperçu ({renderMode})
                    </div>
                    {/* Utilize Maximize2 for fullscreen toggle */}
                    <button
                        className="absolute top-2 right-2 text-white hover:bg-white/20 p-2 rounded"
                        title="Mode plein écran"
                    >
                        <Maximize2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Timeline with current time tracking */}
            <div className="bg-white rounded-lg p-4 border">
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-start gap-2">
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>
                        Temps actuel : {currentTime.toFixed(2)} secondes
                        | Mode : {renderMode}
                    </p>
                </div>

                <div className="relative h-32 bg-gray-100 rounded overflow-hidden">
                    <div className="absolute inset-0 bottom-8 flex">
                        {signs.map((sign, index) => (
                            <div
                                key={sign.id}
                                className="relative flex-1 border-r border-gray-200 cursor-pointer group"
                                onClick={() => onSignSelect?.(index)}
                            >
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                                    <div className={`w-16 h-16 rounded flex items-center justify-center mb-1 ${selectedSigns.includes(index)
                                        ? 'bg-red-100 border-2 border-red-500'
                                        : 'bg-gray-300 hover:bg-gray-200'
                                        }`}>
                                        <span className="text-xs text-center">{sign.word}</span>
                                    </div>
                                    {selectedSigns.includes(index) && (
                                        <div className="absolute top-1 right-1">
                                            <Flag className="w-4 h-4 text-red-500" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Communication Feature */}
                <div className="mt-4 flex justify-end">
                    <button
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded flex items-center"
                        title="Envoyer un feedback"
                    >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Feedback
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function SignToText() {
    // Use non-null assertion for previewRef to resolve type issue
    const previewRef = useRef<HTMLDivElement>(null!);

    // Example signs data
    const signs: Sign[] = [
        { id: 1, word: "Bonjour", timestamp: 0, videoUrl: "/signed/bonjour.mp4" },
        { id: 2, word: "Comment", timestamp: 5, videoUrl: "/signed/comment.mp4" },
    ];

    // Memoized sign selection handler
    const handleSignSelect = useCallback((index: number) => {
        setSelectedSigns(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    }, []);

    // State to manage sign selection
    const [selectedSigns, setSelectedSigns] = useState<number[]>([]);

    // State to track current time with explicit type
    const [currentTime, setCurrentTime] = useState<number>(0);

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <LSFArea
                isInput={true}
                currentTime={currentTime}
                signs={signs}
                selectedSigns={selectedSigns}
                onSignSelect={handleSignSelect}
                previewRef={previewRef}
                onTimeChange={setCurrentTime}
            />
        </div>
    );
}