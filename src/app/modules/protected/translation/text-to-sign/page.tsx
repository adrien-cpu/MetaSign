// src/app/modules/protected/translation/text-to-sign/page.tsx
"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Settings2 } from 'lucide-react';

// Components imports - Sections
import { InputSection } from '@/components/translation/InputSection';
import { PreviewSection } from '@/components/translation//PreviewSection';
import { ControlSection } from '@/components/translation//ControlSection';
import { MainActions } from '@/components/translation//MainActions';

// Types
interface TranslationState {
    inputText: string;
    translatedContent: string;
    isLoading: boolean;
    currentTab: string;
}

export default function TextToSignPage() {
    // State management
    const [state, setState] = useState<TranslationState>({
        inputText: '',
        translatedContent: '',
        isLoading: false,
        currentTab: 'text'
    });

    const handleInputChange = (text: string) => {
        setState(prevState => ({
            ...prevState,
            inputText: text
        }));
    };

    const handleTranslation = useCallback(async () => {
        // Prevent empty translations
        if (!state.inputText.trim()) return;

        setState(prevState => ({ ...prevState, isLoading: true }));

        try {
            // Simuler une API de traduction
            await new Promise(resolve => setTimeout(resolve, 1500));

            setState(prevState => ({
                ...prevState,
                translatedContent: `Traduction LSF pour: ${prevState.inputText}`,
                isLoading: false
            }));
        } catch (error) {
            console.error('Erreur de traduction:', error);
            setState(prevState => ({ ...prevState, isLoading: false }));
        }
    }, [state.inputText]);

    const handleTabChange = (tab: string) => {
        setState(prevState => ({ ...prevState, currentTab: tab }));
    };

    // Déclenchement de la traduction automatique en cas de modification du texte
    React.useEffect(() => {
        if (state.inputText.length > 3) {
            const timer = setTimeout(() => handleTranslation(), 1000);
            return () => clearTimeout(timer);
        }
    }, [state.inputText, handleTranslation]);

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold mb-6">Traduction Texte vers LSF</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Section de saisie */}
                <InputSection
                    inputText={state.inputText}
                    handleInputChange={handleInputChange}
                />

                {/* Section de prévisualisation */}
                <PreviewSection
                    translatedContent={state.translatedContent}
                    isLoading={state.isLoading}
                />

                {/* Section de contrôle et paramètres */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Settings2 className="mr-2 h-5 w-5" />
                            Contrôles
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ControlSection />
                    </CardContent>
                </Card>
            </div>

            {/* Actions principales */}
            <MainActions
                onTranslate={handleTranslation}
                isLoading={state.isLoading}
            />

            {/* Onglets d'options supplémentaires */}
            <Tabs
                defaultValue="options"
                className="mt-6"
                onValueChange={handleTabChange}
            >
                <TabsList>
                    <TabsTrigger value="options">Options</TabsTrigger>
                    <TabsTrigger value="history">Historique</TabsTrigger>
                    <TabsTrigger value="help">Aide</TabsTrigger>
                </TabsList>
                <TabsContent value="options" className="p-4 border rounded-md">
                    Options de traduction et de rendu
                </TabsContent>
                <TabsContent value="history" className="p-4 border rounded-md">
                    Historique des traductions récentes
                </TabsContent>
                <TabsContent value="help" className="p-4 border rounded-md">
                    Guide d&apos;utilisation et conseils
                </TabsContent>
            </Tabs>
        </div>
    );
}