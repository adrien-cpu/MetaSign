// src/app/modules/protected/translation/text-to-sign/components/MainActions.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Share2, Play, Maximize2, MessageCircle } from 'lucide-react';

interface MainActionsProps {
    onTranslate: () => void;
    isLoading: boolean;
}

export function MainActions({ onTranslate, isLoading }: MainActionsProps) {
    return (
        <div className="flex flex-wrap gap-3 mt-6">
            <Button
                onClick={onTranslate}
                disabled={isLoading}
                className="gap-2"
            >
                {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                    <Play className="h-4 w-4" />
                )}
                {isLoading ? 'Traduction en cours...' : 'Traduire'}
            </Button>

            <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Partager
            </Button>

            <Button variant="outline" className="gap-2">
                <Maximize2 className="h-4 w-4" />
                Plein écran
            </Button>

            <Button variant="outline" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Feedback
            </Button>
        </div>
    );
}