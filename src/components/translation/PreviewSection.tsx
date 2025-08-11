// src/app/modules/protected/translation/text-to-sign/components/PreviewSection.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserRound } from 'lucide-react';

interface PreviewSectionProps {
    translatedContent: string;
    isLoading: boolean;
}

export function PreviewSection({ translatedContent, isLoading }: PreviewSectionProps) {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <UserRound className="mr-2 h-5 w-5" />
                    Prévisualisation LSF
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center min-h-32">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : translatedContent ? (
                    <div className="min-h-32 bg-muted rounded-md p-4">
                        {translatedContent}
                    </div>
                ) : (
                    <div className="min-h-32 flex items-center justify-center text-muted-foreground">
                        La traduction apparaîtra ici
                    </div>
                )}
            </CardContent>
        </Card>
    );
}