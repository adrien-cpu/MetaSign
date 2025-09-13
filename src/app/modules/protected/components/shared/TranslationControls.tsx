import React from 'react';
import { Button } from '@/components/ui/button';

interface TranslationControlsProps {
  isTranslating?: boolean;
  onTranslate?: () => void;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onReset?: () => void;
}

export const TranslationControls: React.FC<TranslationControlsProps> = ({
  isTranslating = false,
  onTranslate,
  onStart,
  onPause,
  onStop,
  onReset
}) => {
  return (
    <div className="flex gap-2 mt-4">
      {onTranslate && (
        <Button onClick={onTranslate} disabled={isTranslating}>
          {isTranslating ? 'Translating...' : 'Translate'}
        </Button>
      )}
      {onStart && (
        <Button onClick={onStart}>Start</Button>
      )}
      {onPause && (
        <Button onClick={onPause} variant="outline">Pause</Button>
      )}
      {onStop && (
        <Button onClick={onStop} variant="outline">Stop</Button>
      )}
      {onReset && (
        <Button onClick={onReset} variant="outline">Reset</Button>
      )}
    </div>
  );
};