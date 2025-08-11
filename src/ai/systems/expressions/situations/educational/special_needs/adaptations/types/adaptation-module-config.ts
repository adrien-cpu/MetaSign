// src/ai/systems/expressions/situations/educational/special_needs/adaptations/types/adaptation-module-config.ts

import { AdaptationFeatureType, LogLevel } from './adaptation-types';

/**
 * Configuration pour le module d'adaptation
 */
export interface AdaptationModuleConfig {
    /**
     * Type d'implémentation par défaut
     */
    defaultImplementation: AdaptationFeatureType;

    /**
     * Active l'adaptation dynamique
     */
    enableDynamicAdaptation?: boolean;

    /**
     * Active le mode de débogage
     */
    debugMode?: boolean;

    /**
     * Niveau de journalisation
     */
    logLevel?: LogLevel;

    /**
     * Activation de la validation continue
     */
    enableContinuousValidation?: boolean;

    /**
     * Chemin vers les ressources personnalisées
     */
    customResourcesPath?: string;

    /**
     * Options supplémentaires pour l'implémentation spécifique
     */
    implementationOptions?: Record<string, unknown>;
}