/**
 * @file src/ai/utils/logging/LoggerTypes.ts
 * @description Types et interfaces pour le système de journalisation
 * Définit les structures communes pour les options de logger et le formatage
 */

import { LogLevel } from './LogLevel';

/**
 * Structure pour stocker les métriques de message les plus fréquents
 */
export interface MessageFrequency {
    message: string;
    count: number;
}

/**
 * Options de configuration du logger
 */
export interface LoggerOptions {
    /**
     * Niveau minimum de log à afficher
     * Les messages avec un niveau inférieur seront ignorés
     * @default LogLevel.INFO
     */
    minLevel?: LogLevel;

    /**
     * Inclure l'horodatage dans les messages
     * @default true
     */
    includeTimestamp?: boolean;

    /**
     * Inclure le nom du module dans les messages
     * @default true
     */
    includeModuleName?: boolean;

    /**
     * Activer la journalisation dans la console
     * @default true
     */
    enableConsole?: boolean;

    /**
     * Activer la collecte de métriques
     * @default true
     */
    enableMetrics?: boolean;

    /**
     * Masquer les données sensibles dans les logs
     * @default true
     */
    redactSensitiveData?: boolean;

    /**
     * Taille du buffer pour les métriques
     * @default 100
     */
    metricsBufferSize?: number;

    /**
     * Format d'horodatage personnalisé
     * @default 'ISO' (ISO 8601)
     */
    timestampFormat?: 'ISO' | 'locale' | 'epoch';

    /**
     * Format de sortie des logs
     * @default 'text'
     */
    outputFormat?: 'text' | 'json';

    /**
     * Gestionnaire personnalisé pour les logs
     * Permet de rediriger les logs vers un système externe
     */
    customHandler?: (
        level: LogLevel,
        moduleName: string,
        message: string,
        context?: unknown
    ) => void;

    /**
     * Liste des champs à masquer dans les logs (données sensibles)
     * @default ['password', 'token', 'secret', 'key', 'credential']
     */
    sensitiveFields?: string[];

    /**
     * Préfixe à ajouter aux messages de log
     */
    prefix?: string;

    /**
     * Limite de taille des messages de log (en caractères)
     * @default 10000
     */
    maxMessageSize?: number;
}

/**
 * Options pour un message de log spécifique
 */
export interface LogOptions {
    /**
     * Données contextuelles à inclure dans le log
     */
    context?: unknown;

    /**
     * Tags pour catégoriser le log
     */
    tags?: string[];

    /**
     * ID de corrélation pour tracer les logs liés
     */
    correlationId?: string;

    /**
     * Indique si les données du contexte contiennent des informations sensibles
     */
    sensitive?: boolean;

    /**
     * Champs à masquer spécifiquement pour ce message
     */
    sensitiveFields?: string[];

    /**
     * Drapeau pour marquer les erreurs critiques
     */
    isCritical?: boolean;

    /**
     * Code d'erreur pour référence
     */
    errorCode?: string;

    /**
     * Informations d'utilisateur associées au log
     */
    user?: {
        id?: string;
        role?: string;
    };

    /**
     * Métadonnées supplémentaires
     */
    metadata?: Record<string, unknown>;
}

/**
 * Structure d'une entrée de log
 */
export interface LogEntry {
    /**
     * Niveau de log
     */
    level: LogLevel;

    /**
     * Message de log
     */
    message: string;

    /**
     * Nom du module
     */
    module: string;

    /**
     * Horodatage (timestamp)
     */
    timestamp: number;

    /**
     * Données contextuelles
     */
    context?: unknown;

    /**
     * Tags associés
     */
    tags?: string[];

    /**
     * ID de corrélation
     */
    correlationId?: string;

    /**
     * Informations d'utilisateur
     */
    user?: {
        id?: string;
        role?: string;
    };

    /**
     * Métadonnées supplémentaires
     */
    metadata?: Record<string, unknown>;
}

/**
 * Métriques de journalisation
 */
export interface LogMetrics extends Record<string, unknown> {
    /**
     * Nombre total de messages journalisés
     */
    totalLogs: number;

    /**
     * Nombre de logs par niveau
     */
    countByLevel: Record<LogLevel, number>;

    /**
     * Timestamp du premier log
     */
    firstLogTimestamp: number;

    /**
     * Timestamp du dernier log
     */
    lastLogTimestamp: number;

    /**
     * Taille moyenne des messages (en caractères)
     */
    averageMessageSize: number;

    /**
     * Distribution des tags utilisés
     */
    tagDistribution: Record<string, number>;

    /**
     * Messages les plus fréquents
     */
    topMessages: Array<{
        message: string;
        count: number;
    }>;

    /**
     * Erreurs les plus fréquentes
     */
    topErrors: Array<{
        message: string;
        count: number;
    }>;
}