/**
 * @file src/ai/services/learning/human/coda/codavirtuel/scenarios/types/CatalogTypes.ts
 * @description Types pour le catalogue de thèmes des scénarios d'apprentissage
 * @module catalog
 * @author MetaSign
 * @version 1.0.0
 * @since 2024
 */

import { CECRLLevel } from '../../types';

/**
 * Information complète sur un thème de scénario
 */
export interface ThemeInfo {
    /**
     * Titre du thème
     */
    title: string;

    /**
     * Description détaillée du thème
     */
    description: string;

    /**
     * Difficultés disponibles par niveau CECRL
     */
    difficulties: Record<CECRLLevel, string[]>;

    /**
     * Vocabulaire clé associé au thème
     */
    vocabulary: string[];
}

/**
 * Catalogue complet des thèmes disponibles
 */
export interface ThemeCatalog {
    [key: string]: ThemeInfo;
}