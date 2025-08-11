// src/app/modules/protected/translation/text-to-sign/components/InputSection.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { PenSquare } from 'lucide-react';

interface InputSectionProps {
    /**
     * Texte saisi par l'utilisateur
     */
    inputText: string;

    /**
     * Fonction appelée lorsque le texte change
     */
    handleInputChange: (text: string) => void;
}

export function InputSection({ inputText, handleInputChange }: InputSectionProps) {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <PenSquare className="mr-2 h-5 w-5" />
                    Texte à traduire
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea
                    placeholder="Saisissez le texte à traduire en LSF..."
                    className="min-h-32 resize-none"
                    value={inputText}
                    onChange={(e) => handleInputChange(e.target.value)}
                />
                <div className="text-xs text-muted-foreground mt-2">
                    {inputText.length} caractères
                </div>
            </CardContent>
        </Card>
    );
}