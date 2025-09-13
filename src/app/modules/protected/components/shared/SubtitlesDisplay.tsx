import React from 'react';

interface SubtitlesDisplayProps {
  text?: string;
  className?: string;
}

export const SubtitlesDisplay: React.FC<SubtitlesDisplayProps> = ({
  text = '',
  className = ''
}) => {
  return (
    <div className={`p-4 bg-gray-100 rounded border ${className}`}>
      <div className="font-medium text-sm text-gray-600 mb-2">Subtitles:</div>
      <div className="text-gray-800">{text}</div>
    </div>
  );
};