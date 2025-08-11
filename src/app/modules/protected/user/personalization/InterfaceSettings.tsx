/**
 * @fileoverview Composant InterfaceSettings pour la gestion des paramètres d'interface
 * @module @/app/modules/protected/user/personalization/InterfaceSettings
 * @version 1.0.0
 * @author MetaSign Team
 * @since 2025-06-16
 * 
 * Composant permettant aux utilisateurs de configurer leur interface utilisateur.
 * 
 * @path src/app/modules/protected/user/personalization/InterfaceSettings.tsx
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CustomButton } from '@/components/ui/custom-button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Theme, Preferences } from '@/types/settings';
import { Monitor, Moon, Sun } from 'lucide-react';

/**
 * Interface pour les propriétés du composant InterfaceSettings
 */
interface InterfaceSettingsProps {
    /** Préférences actuelles de l'utilisateur */
    preferences: Preferences;
    /** Callback appelé lors du changement de thème */
    onThemeChange: (theme: Theme) => void;
    /** Callback pour la mise à jour des préférences */
    onPreferencesUpdate?: (updates: Partial<Preferences>) => void;
}

/**
 * Configuration des thèmes disponibles
 */
const THEME_OPTIONS = [
    {
        value: 'light' as Theme,
        label: 'Clair',
        icon: Sun,
        description: 'Interface claire avec fond blanc'
    },
    {
        value: 'dark' as Theme,
        label: 'Sombre',
        icon: Moon,
        description: 'Interface sombre pour réduire la fatigue oculaire'
    },
    {
        value: 'system' as Theme,
        label: 'Système',
        icon: Monitor,
        description: 'Suit les paramètres de votre système'
    }
];

/**
 * Composant InterfaceSettings pour la personnalisation de l'interface
 */
const InterfaceSettings: React.FC<InterfaceSettingsProps> = ({
    preferences,
    onThemeChange,
    onPreferencesUpdate
}) => {
    const handleDisplaySettingChange = (setting: keyof Preferences['display'], value: boolean | string) => {
        if (!onPreferencesUpdate) return;

        onPreferencesUpdate({
            display: {
                ...preferences.display,
                [setting]: value
            }
        });
    };

    const handleAccessibilitySettingChange = (setting: keyof Preferences['accessibility'], value: boolean | string) => {
        if (!onPreferencesUpdate) return;

        onPreferencesUpdate({
            accessibility: {
                ...preferences.accessibility,
                [setting]: value
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Thème */}
            <Card>
                <CardHeader>
                    <CardTitle>Thème d&aposinterface</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {THEME_OPTIONS.map((theme) => {
                            const Icon = theme.icon;
                            const isSelected = preferences.theme === theme.value;

                            return (
                                <Card
                                    key={theme.value}
                                    className={`cursor-pointer transition-all ${isSelected
                                            ? 'ring-2 ring-primary bg-primary/5'
                                            : 'hover:bg-accent/50'
                                        }`}
                                    onClick={() => onThemeChange(theme.value)}
                                >
                                    <CardContent className="p-4 text-center">
                                        <Icon className="h-8 w-8 mx-auto mb-2" />
                                        <h3 className="font-medium">{theme.label}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {theme.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Paramètres d'affichage */}
            <Card>
                <CardHeader>
                    <CardTitle>Paramètres d&aposaffichage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Densité de l'interface */}
                    <div className="space-y-2">
                        <Label htmlFor="density">Densité de l&aposinterface</Label>
                        <Select
                            value={preferences.display.density}
                            onValueChange={(value) => handleDisplaySettingChange('density', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner la densité" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="compact">Compact</SelectItem>
                                <SelectItem value="comfortable">Confortable</SelectItem>
                                <SelectItem value="spacious">Spacieux</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Barre latérale */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Afficher la barre latérale</Label>
                            <p className="text-sm text-muted-foreground">
                                Affiche la navigation principale sur le côté
                            </p>
                        </div>
                        <Switch
                            checked={preferences.display.sidebarVisible}
                            onCheckedChange={(checked) => handleDisplaySettingChange('sidebarVisible', checked)}
                        />
                    </div>

                    {/* Tooltips */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Afficher les info-bulles</Label>
                            <p className="text-sm text-muted-foreground">
                                Affiche des informations supplémentaires au survol
                            </p>
                        </div>
                        <Switch
                            checked={preferences.display.showTooltips}
                            onCheckedChange={(checked) => handleDisplaySettingChange('showTooltips', checked)}
                        />
                    </div>

                    {/* Animations */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Animations d&aposinterface</Label>
                            <p className="text-sm text-muted-foreground">
                                Active les transitions et animations fluides
                            </p>
                        </div>
                        <Switch
                            checked={preferences.display.enableAnimations}
                            onCheckedChange={(checked) => handleDisplaySettingChange('enableAnimations', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Accessibilité */}
            <Card>
                <CardHeader>
                    <CardTitle>Accessibilité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Taille de police */}
                    <div className="space-y-2">
                        <Label htmlFor="fontSize">Taille de police</Label>
                        <Select
                            value={preferences.accessibility.fontSize}
                            onValueChange={(value) => handleAccessibilitySettingChange('fontSize', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner la taille" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="small">Petite</SelectItem>
                                <SelectItem value="medium">Moyenne</SelectItem>
                                <SelectItem value="large">Grande</SelectItem>
                                <SelectItem value="xlarge">Très grande</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Réduction des mouvements */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Réduire les mouvements</Label>
                            <p className="text-sm text-muted-foreground">
                                Diminue les animations et transitions
                            </p>
                        </div>
                        <Switch
                            checked={preferences.accessibility.reduceMotion}
                            onCheckedChange={(checked) => handleAccessibilitySettingChange('reduceMotion', checked)}
                        />
                    </div>

                    {/* Haut contraste */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Mode haut contraste</Label>
                            <p className="text-sm text-muted-foreground">
                                Améliore la lisibilité avec des contrastes élevés
                            </p>
                        </div>
                        <Switch
                            checked={preferences.accessibility.highContrast}
                            onCheckedChange={(checked) => handleAccessibilitySettingChange('highContrast', checked)}
                        />
                    </div>

                    {/* Sous-titres automatiques */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Sous-titres automatiques</Label>
                            <p className="text-sm text-muted-foreground">
                                Active automatiquement les sous-titres pour les vidéos
                            </p>
                        </div>
                        <Switch
                            checked={preferences.accessibility.autoSubtitles}
                            onCheckedChange={(checked) => handleAccessibilitySettingChange('autoSubtitles', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
                <CustomButton variant="outline">
                    Réinitialiser
                </CustomButton>
                <CustomButton>
                    Sauvegarder les modifications
                </CustomButton>
            </div>
        </div>
    );
};

export default InterfaceSettings;