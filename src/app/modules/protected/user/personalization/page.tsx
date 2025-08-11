/**
 * @fileoverview Page de personnalisation pour l'application MetaSign
 * @module @/app/modules/protected/user/personalization/page
 * @version 1.0.0
 * @author MetaSign Team
 * @since 2025-06-16
 * 
 * Page permettant aux utilisateurs de personnaliser leur expérience MetaSign.
 * 
 * @path src/app/modules/protected/user/personalization/page.tsx
 */

'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Banner from "@/components/ui/banner";
import InterfaceSettings from "./InterfaceSettings";
import LearningPreferences from "./LearningPreferences";
import Interests from "./Interests";
import PreferencesPage from "./PreferencesPage";
import { Settings } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from "@/components/ui/Tabs";

/**
 * Interface pour les préférences utilisateur
 */
interface Preferences {
    theme: 'light' | 'dark' | 'system';
    language: string;
    accessibility: {
        reduceMotion: boolean;
        highContrast: boolean;
        fontSize: 'small' | 'medium' | 'large';
    };
    notifications: {
        email: boolean;
        push: boolean;
        inApp: boolean;
    };
}

/**
 * Type pour les thèmes disponibles
 */
type Theme = 'light' | 'dark' | 'system';

/**
 * Page de personnalisation MetaSign
 */
const PersonalizationPage: React.FC = () => {
    const [preferences, setPreferences] = useState<Preferences | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/user/preferences');
                const data = await response.json();
                setPreferences(data.preferences);
            } catch (error) {
                console.error("Échec de la récupération des préférences :", error);
                // Valeurs par défaut en cas d'erreur
                setPreferences({
                    theme: 'system',
                    language: 'fr',
                    accessibility: {
                        reduceMotion: false,
                        highContrast: false,
                        fontSize: 'medium',
                    },
                    notifications: {
                        email: true,
                        push: false,
                        inApp: true,
                    },
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchPreferences();
    }, []);

    const handleThemeChange = (theme: Theme) => {
        if (preferences) {
            setPreferences({ ...preferences, theme });
        }
    };

    const handlePreferencesUpdate = (updates: Partial<Preferences>) => {
        if (preferences) {
            setPreferences({ ...preferences, ...updates });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Chargement des préférences...</p>
                </div>
            </div>
        );
    }

    if (!preferences) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">Erreur lors du chargement des préférences.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Banner
                title="Personnalisation"
                description="Personnalisez votre expérience en fonction de vos préférences."
                icon={<Settings className="text-slate-600" />}
                backHref={ROUTES.USER_DASHBOARD}
            />

            <Card>
                <CardContent className="p-6">
                    <Tabs defaultValue="interface">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="interface">Interface</TabsTrigger>
                            <TabsTrigger value="learning">Apprentissage</TabsTrigger>
                            <TabsTrigger value="interests">Intérêts</TabsTrigger>
                            <TabsTrigger value="display">Affichage</TabsTrigger>
                        </TabsList>

                        <TabsContent value="interface" className="mt-6">
                            <InterfaceSettings
                                preferences={preferences}
                                onThemeChange={handleThemeChange}
                                onPreferencesUpdate={handlePreferencesUpdate}
                            />
                        </TabsContent>

                        <TabsContent value="learning" className="mt-6">
                            <LearningPreferences
                                preferredSignLanguage="french"
                                learningGoals={[]}
                                onUpdate={(updates) => console.log('Learning preferences updated:', updates)}
                            />
                        </TabsContent>

                        <TabsContent value="interests" className="mt-6">
                            <Interests
                                interests={[]}
                                onUpdate={(updates) => console.log('Interests updated:', updates)}
                            />
                        </TabsContent>

                        <TabsContent value="display" className="mt-6">
                            <PreferencesPage
                                preferences={preferences}
                                onUpdate={handlePreferencesUpdate}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default PersonalizationPage;