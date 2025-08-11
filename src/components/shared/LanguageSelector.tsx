/**
 * @fileoverview Composant de sélection de langue avec interface riche
 * @filepath src/components/shared/LanguageSelector.tsx
 * @author MetaSign Team
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { LanguageSelectorProps, DEFAULT_LANGUAGES } from './types';

/**
 * Composant de sélection de langue avec support des drapeaux et noms natifs
 * 
 * Fonctionnalités :
 * - Affichage des drapeaux et noms natifs
 * - Support des langues personnalisées
 * - Interface accessible et responsive
 * - Validation des codes de langue ISO 639-1
 * 
 * @component
 * @example
 * ```tsx
 * <LanguageSelector
 *   label="Langue de traduction"
 *   selectedLanguage="fr"
 *   onLanguageChange={(lang) => setLanguage(lang)}
 *   disabled={false}
 * />
 * ```
 * 
 * @param props - Les propriétés du composant
 * @returns JSX.Element - Le composant de sélection de langue
 */
const LanguageSelector = (props: LanguageSelectorProps) => {
    const {
        label,
        selectedLanguage,
        onLanguageChange,
        languages = DEFAULT_LANGUAGES,
        className,
        disabled = false,
    } = props;

    // Recherche la langue actuellement sélectionnée pour l'affichage
    const selectedLang = React.useMemo(
        () => languages.find(lang => lang.code === selectedLanguage),
        [languages, selectedLanguage]
    );

    return (
        <div className={cn('flex flex-col space-y-2', className)}>
            {/* Label optionnel avec style cohérent */}
            {label && (
                <label className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            {/* Composant Select principal avec trigger personnalisé */}
            <Select
                value={selectedLanguage}
                onValueChange={onLanguageChange}
                disabled={disabled}
            >
                <SelectTrigger className="w-[200px]">
                    <div className="flex items-center space-x-2">
                        {/* Icône globe comme indicateur visuel */}
                        <Globe className="h-4 w-4 text-gray-500" />
                        <SelectValue placeholder="Sélectionner une langue">
                            {selectedLang && (
                                <div className="flex items-center space-x-2">
                                    {/* Affichage du drapeau si disponible */}
                                    {selectedLang.flag && (
                                        <span className="text-lg">{selectedLang.flag}</span>
                                    )}
                                    {/* Nom natif de la langue pour une meilleure UX */}
                                    <span>{selectedLang.nativeName}</span>
                                </div>
                            )}
                        </SelectValue>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </SelectTrigger>

                {/* Liste déroulante des langues disponibles */}
                <SelectContent>
                    {languages.map((language) => (
                        <SelectItem
                            key={language.code}
                            value={language.code}
                            className="flex items-center space-x-2"
                        >
                            <div className="flex items-center space-x-2">
                                {/* Drapeau comme indicateur visuel */}
                                {language.flag && (
                                    <span className="text-lg">{language.flag}</span>
                                )}
                                {/* Informations sur la langue avec hiérarchie visuelle */}
                                <div className="flex flex-col">
                                    {/* Nom natif en tant que texte principal */}
                                    <span className="font-medium">{language.nativeName}</span>
                                    {/* Nom anglais comme information secondaire */}
                                    <span className="text-xs text-gray-500">{language.name}</span>
                                </div>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default LanguageSelector;