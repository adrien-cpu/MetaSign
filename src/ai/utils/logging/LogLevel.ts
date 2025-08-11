/**
 * @file src/ai/utils/logging/LogLevel.ts
 * @description Définition des niveaux de journalisation supportés par le système de log.
 */

/**
 * Niveaux de journalisation disponibles, du moins sévère au plus sévère
 */
export enum LogLevel {
    /** 
     * Niveau de journalisation pour le débogage
     * Informations détaillées, utiles pour le développement et le débogage
     */
    DEBUG = 0,

    /** 
     * Niveau de journalisation pour les informations
     * Événements normaux du système, messages de confirmation
     */
    INFO = 1,

    /** 
     * Niveau de journalisation pour les avertissements
     * Situations potentiellement problématiques qui ne bloquent pas le système
     */
    WARN = 2,

    /** 
     * Niveau de journalisation pour les erreurs
     * Problèmes empêchant une fonctionnalité mais pas l'ensemble du système
     */
    ERROR = 3,

    /** 
     * Niveau de journalisation pour les erreurs fatales
     * Problèmes critiques mettant en péril l'ensemble du système
     */
    FATAL = 4
}

/**
 * Tableau des noms des niveaux de journalisation pour accès rapide
 */
export const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
    [LogLevel.DEBUG]: 'DEBUG',
    [LogLevel.INFO]: 'INFO',
    [LogLevel.WARN]: 'WARN',
    [LogLevel.ERROR]: 'ERROR',
    [LogLevel.FATAL]: 'FATAL'
};

/**
 * Obtient le nom textuel d'un niveau de log
 * @param level Niveau de log
 * @returns Nom du niveau
 */
export function getLevelName(level: LogLevel): string {
    return LOG_LEVEL_NAMES[level] || 'UNKNOWN';
}

/**
 * Convertit une chaîne de caractères en niveau de log
 * @param levelName Nom du niveau
 * @returns Niveau de log correspondant
 */
export function getLevelFromString(levelName: string): LogLevel {
    switch (levelName.toLowerCase()) {
        case 'debug': return LogLevel.DEBUG;
        case 'info': return LogLevel.INFO;
        case 'warn': return LogLevel.WARN;
        case 'error': return LogLevel.ERROR;
        case 'fatal': return LogLevel.FATAL;
        default: return LogLevel.INFO;
    }
}

export default LogLevel;