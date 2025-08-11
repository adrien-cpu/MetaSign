// src/components/translation/Timeline.tsx
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Sign, TimelineProps } from './types';

export const Timeline: React.FC<TimelineProps> = ({
    signs,
    selectedSigns,
    setSelectedSigns
}) => {
    const timelineRef = useRef<HTMLDivElement>(null);
    const [timelineWidth, setTimelineWidth] = useState<number>(0);

    // Memoize the maximum timestamp to avoid recalculating
    const maxTimestamp = useMemo(() =>
        signs.length > 0 ? signs[signs.length - 1].timestamp : 1,
        [signs]
    );

    // Use useCallback to prevent unnecessary re-renders
    const updateTimelineWidth = useCallback(() => {
        if (timelineRef.current) {
            setTimelineWidth(timelineRef.current.clientWidth);
        }
    }, []);

    // Resize event listener and cleanup
    useEffect(() => {
        updateTimelineWidth();
        window.addEventListener('resize', updateTimelineWidth);
        return () => window.removeEventListener('resize', updateTimelineWidth);
    }, [updateTimelineWidth]);

    // Memoize toggle selection to prevent unnecessary re-renders
    const toggleSignSelection = useCallback((index: number) => {
        setSelectedSigns(prevSelected => {
            const isSelected = prevSelected.includes(index);
            return isSelected
                ? prevSelected.filter(i => i !== index)
                : [...prevSelected, index].sort((a, b) => a - b);
        });
    }, [setSelectedSigns]);

    // Calculate position with memoization
    const calculatePosition = useCallback((timestamp: number): number => {
        return timelineWidth > 0
            ? (timestamp / maxTimestamp) * timelineWidth
            : 0;
    }, [timelineWidth, maxTimestamp]);

    // Render sign point
    const renderSignPoint = (sign: Sign, index: number) => {
        const position = calculatePosition(sign.timestamp);
        const isSelected = selectedSigns.includes(index);

        return (
            <div
                key={sign.id}
                className={`absolute -translate-x-1/2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all
                    ${isSelected
                        ? 'bg-blue-600 text-white shadow-md scale-110'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'}`}
                style={{ left: `${position}px` }}
                onClick={() => toggleSignSelection(index)}
                title={sign.word}
            >
                {index + 1}
            </div>
        );
    };

    // Render timeline tick
    const renderTimelineTick = (sign: Sign) => {
        const position = calculatePosition(sign.timestamp);

        return (
            <div
                key={`tick-${sign.id}`}
                className="absolute top-0 h-full w-0.5 bg-gray-400"
                style={{ left: `${position}px` }}
            />
        );
    };

    return (
        <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Sign Timeline</h3>
            <div className="timeline-container relative">
                <div
                    ref={timelineRef}
                    className="relative w-full h-10 bg-gray-200 rounded-md"
                >
                    {/* Render timeline points */}
                    {signs.map(renderSignPoint)}

                    {/* Timeline base line */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-400 -translate-y-1/2"></div>

                    {/* Render timeline ticks */}
                    {signs.map(renderTimelineTick)}
                </div>

                {/* Timestamp labels */}
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>0s</span>
                    <span>{maxTimestamp.toFixed(1)}s</span>
                </div>
            </div>
        </div>
    );
};

// Add display name for better debugging
Timeline.displayName = 'Timeline';

export default Timeline;