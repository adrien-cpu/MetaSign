// src/ai/systems/expressions/situations/educational/special_needs/adaptations/utils/adaptation-logger.ts

import { LogLevel } from '@ai/systems/expressions/situations/educational/special_needs/adaptations/types/adaptation-types';

/**
 * Utilitaire de journalisation spécialisé pour le module d'adaptation.
 * Permet de contrôler le niveau de détail des logs et de formater les messages.
 *
 * @example
 * const logger = new AdaptationLogger('debug');
 * logger.info('Initialisation du module d\'adaptation', { contextId: 'module-123' });
 */
export class AdaptationLogger {
    /**
     * Niveau de journalisation actuel
     */
    private logLevel: LogLevel;

    /**
     * Crée une nouvelle instance du logger
     * @param level - Niveau de journalisation initial (default: 'info')
     */
    constructor(level: LogLevel = 'info') {
        this.logLevel = level;
    }

    /**
     * Modifie le niveau de journalisation
     * @param level - Nouveau niveau de journalisation
     */
    public setLogLevel(level: LogLevel): void {
        this.logLevel = level;
    }

    /**
     * Récupère le niveau de journalisation actuel
     * @returns Le niveau de journalisation actuel
     */
    public getLogLevel(): LogLevel {
        return this.logLevel;
    }

    /**
     * Méthode principale de journalisation qui respecte le niveau configuré
     * @param level - Niveau du message
     * @param message - Message à journaliser
     * @param args - Arguments supplémentaires pour le message
     */
    public log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: unknown[]): void {
        // Gestion des niveaux de log selon une hiérarchie
        const shouldLog = this.shouldLogForLevel(level);

        if (!shouldLog) {
            return;
        }

        switch (level) {
            case 'error':
                console.error(message, ...args);
                break;
            case 'warn':
                console.warn(message, ...args);
                break;
            case 'info':
                console.log(message, ...args);
                break;
            case 'debug':
                console.debug(message, ...args);
                break;
        }
    }

    /**
     * Journalise un message de niveau debug
     * @param message - Message à journaliser
     * @param args - Arguments supplémentaires
     */
    public debug(message: string, ...args: unknown[]): void {
        this.log('debug', message, ...args);
    }

    /**
     * Journalise un message de niveau info
     * @param message - Message à journaliser
     * @param args - Arguments supplémentaires
     */
    public info(message: string, ...args: unknown[]): void {
        this.log('info', message, ...args);
    }

    /**
     * Journalise un message de niveau warn
     * @param message - Message à journaliser
     * @param args - Arguments supplémentaires
     */
    public warn(message: string, ...args: unknown[]): void {
        this.log('warn', message, ...args);
    }

    /**
     * Journalise un message de niveau error
     * @param message - Message à journaliser
     * @param args - Arguments supplémentaires
     */
    public error(message: string, ...args: unknown[]): void {
        this.log('error', message, ...args);
    }

    /**
     * Détermine si un message doit être journalisé en fonction du niveau configuré
     * @param messageLevel - Niveau du message à évaluer
     * @returns true si le message doit être journalisé, false sinon
     * @private
     */
    private shouldLogForLevel(messageLevel: 'debug' | 'info' | 'warn' | 'error'): boolean {
        const logLevels: Record<LogLevel, number> = {
            'none': 0,
            'error': 1,
            'warn': 2,
            'info': 3,
            'debug': 4
        };

        const messageLevelValue = logLevels[messageLevel] || 0;
        const configuredLevelValue = logLevels[this.logLevel] || 0;

        return messageLevelValue <= configuredLevelValue;
    }

    /**
     * Crée une représentation formatée de la date/heure actuelle
     * pour l'horodatage des messages
     * @returns Chaîne de caractères formatée pour l'horodatage
     * @private
     */
    private getTimestamp(): string {
        const now = new Date();
        return now.toISOString();
    }

    /**
     * Formatte un message avec un préfixe d'horodatage
     * @param message - Message à formater
     * @returns Message formaté avec horodatage
     * @private
     */
    private formatMessage(message: string): string {
        return `[${this.getTimestamp()}] ${message}`;
    }
}