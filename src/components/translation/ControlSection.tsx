// src/components/translation/ControlSection.tsx
import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface ControlSectionProps {
    /**
     * Appelé lorsque les paramètres changent
     */
    onSettingsChange?: (settings: TranslationSettings) => void;

    /**
     * Paramètres initiaux
     */
    initialSettings?: Partial<TranslationSettings>;
}

/**
 * Interface pour les paramètres de traduction
 */
export interface TranslationSettings {
    /**
     * Vitesse de lecture (pourcentage)
     */
    speed: number;

    /**
     * Activer la génération automatique des signes
     */
    autoSigns: boolean;

    /**
     * Afficher les expressions faciales
     */
    showExpressions: boolean;

    /**
     * Niveau de détail de l'animation
     */
    detailLevel: 'low' | 'medium' | 'high';
}

export function ControlSection({
    onSettingsChange,
    initialSettings = {}
}: ControlSectionProps) {
    const [settings, setSettings] = useState<TranslationSettings>({
        speed: initialSettings.speed ?? 50,
        autoSigns: initialSettings.autoSigns ?? true,
        showExpressions: initialSettings.showExpressions ?? true,
        detailLevel: initialSettings.detailLevel ?? 'medium'
    });

    const updateSettings = <K extends keyof TranslationSettings>(
        key: K,
        value: TranslationSettings[K]
    ) => {
        const newSettings = {
            ...settings,
            [key]: value
        };

        setSettings(newSettings);

        if (onSettingsChange) {
            onSettingsChange(newSettings);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="speed">Vitesse des signes</Label>
                    <span className="text-sm text-muted-foreground">{settings.speed}%</span>
                </div>
                <Slider
                    id="speed"
                    min={10}
                    max={100}
                    step={5}
                    value={[settings.speed]}
                    onValueChange={(value: number[]) => updateSettings('speed', value[0])}
                />
            </div>

            <div className="flex items-center justify-between">
                <Label htmlFor="auto-signs">Signes automatiques</Label>
                <Switch
                    id="auto-signs"
                    checked={settings.autoSigns}
                    onCheckedChange={(checked: boolean) => updateSettings('autoSigns', checked)}
                />
            </div>

            <div className="flex items-center justify-between">
                <Label htmlFor="expressions">Expressions faciales</Label>
                <Switch
                    id="expressions"
                    checked={settings.showExpressions}
                    onCheckedChange={(checked: boolean) => updateSettings('showExpressions', checked)}
                />
            </div>

            <div className="space-y-2">
                <Label>Niveau de détail</Label>
                <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map((level) => (
                        <button
                            key={level}
                            type="button"
                            className={`px-3 py-2 text-sm rounded-md border transition-colors ${settings.detailLevel === level
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                                }`}
                            onClick={() => updateSettings('detailLevel', level)}
                        >
                            {level === 'low' && 'Simple'}
                            {level === 'medium' && 'Normal'}
                            {level === 'high' && 'Détaillé'}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}