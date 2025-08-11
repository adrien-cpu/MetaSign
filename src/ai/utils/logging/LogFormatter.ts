/**
 * @file src/ai/utils/logging/LogFormatter.ts
 * @description Formateur de messages de log
 * Gère le formatage des messages selon diverses options et formats de sortie
 */

import { LogLevel, getLevelName } from './LogLevel';
import { LoggerOptions, LogOptions } from './LoggerTypes';

/**
 * Formatte les messages de log selon les options configurées
 */
export class LogFormatter {
    private readonly moduleName: string;
    private options: LoggerOptions;

    /**
     * Crée une nouvelle instance de LogFormatter
     * @param moduleName Nom du module pour identification
     * @param options Options de formatage
     */
    constructor(moduleName: string, options: LoggerOptions) {
        this.moduleName = moduleName;
        this.options = options;
    }

    /**
     * Met à jour les options de formatage
     * @param options Nouvelles options
     */
    public updateOptions(options: LoggerOptions): void {
        this.options = { ...this.options, ...options };
    }

    /**
     * Formatte un message de log
     * @param level Niveau de log
     * @param message Message à formater
     * @param timestamp Horodatage (en millisecondes)
     * @param options Options spécifiques au message
     * @returns Message formaté
     */
    public formatMessage(
        level: LogLevel,
        message: string,
        timestamp: number,
        options: LogOptions = {}
    ): string {
        // Format JSON
        if (this.options.outputFormat === 'json') {
            return this.formatJsonMessage(level, message, timestamp, options);
        }

        // Format texte (par défaut)
        return this.formatTextMessage(level, message, timestamp, options);
    }

    /**
     * Formatte un message au format texte
     * @param level Niveau de log
     * @param message Message à formater
     * @param timestamp Horodatage (en millisecondes)
     * @param options Options spécifiques au message
     * @returns Message formaté au format texte
     */
    private formatTextMessage(
        level: LogLevel,
        message: string,
        timestamp: number,
        options: LogOptions = {}
    ): string {
        const parts: string[] = [];

        // Ajouter le préfixe si configuré
        if (this.options.prefix) {
            parts.push(this.options.prefix);
        }

        // Ajouter l'horodatage si configuré
        if (this.options.includeTimestamp !== false) {
            parts.push(this.formatTimestamp(timestamp));
        }

        // Ajouter le niveau de log
        parts.push(`[${getLevelName(level)}]`);

        // Ajouter le nom du module si configuré
        if (this.options.includeModuleName !== false) {
            parts.push(`[${this.moduleName}]`);
        }

        // Ajouter l'ID de corrélation si présent
        if (options.correlationId) {
            parts.push(`[${options.correlationId}]`);
        }

        // Ajouter les tags si présents
        if (options.tags && options.tags.length > 0) {
            parts.push(`[${options.tags.join(',')}]`);
        }

        // Ajouter le message principal
        // Limiter la taille du message si nécessaire
        const maxSize = this.options.maxMessageSize || 10000;
        if (message.length > maxSize) {
            parts.push(`${message.substring(0, maxSize)}... [tronqué, longueur totale: ${message.length}]`);
        } else {
            parts.push(message);
        }

        // Ajouter le contexte si présent
        if (options.context) {
            const contextStr = this.formatContext(options.context, options.sensitive);
            if (contextStr) {
                parts.push(`- ${contextStr}`);
            }
        }

        // Ajouter le code d'erreur si présent
        if (options.errorCode) {
            parts.push(`(Code: ${options.errorCode})`);
        }

        return parts.join(' ');
    }

    /**
     * Formatte un message au format JSON
     * @param level Niveau de log
     * @param message Message à formater
     * @param timestamp Horodatage (en millisecondes)
     * @param options Options spécifiques au message
     * @returns Message formaté au format JSON
     */
    private formatJsonMessage(
        level: LogLevel,
        message: string,
        timestamp: number,
        options: LogOptions = {}
    ): string {
        // Limiter la taille du message si nécessaire
        const maxSize = this.options.maxMessageSize || 10000;
        const formattedMessage = message.length > maxSize
            ? `${message.substring(0, maxSize)}... [tronqué, longueur totale: ${message.length}]`
            : message;

        const logObject: Record<string, unknown> = {
            level: getLevelName(level),
            message: formattedMessage,
            timestamp: this.formatTimestamp(timestamp),
            module: this.moduleName
        };

        // Ajouter l'ID de corrélation si présent
        if (options.correlationId) {
            logObject.correlationId = options.correlationId;
        }

        // Ajouter les tags si présents
        if (options.tags && options.tags.length > 0) {
            logObject.tags = options.tags;
        }

        // Ajouter le contexte si présent
        if (options.context) {
            const context = options.sensitive
                ? this.sanitizeObject(options.context)
                : options.context;
            logObject.context = context;
        }

        // Ajouter les métadonnées si présentes
        if (options.metadata) {
            logObject.metadata = options.metadata;
        }

        // Ajouter les informations d'utilisateur si présentes
        if (options.user) {
            logObject.user = options.user;
        }

        // Ajouter le code d'erreur si présent
        if (options.errorCode) {
            logObject.errorCode = options.errorCode;
        }

        // Ajouter le drapeau critique si présent
        if (options.isCritical) {
            logObject.isCritical = true;
        }

        return JSON.stringify(logObject);
    }

    /**
     * Formatte un horodatage selon le format configuré
     * @param timestamp Horodatage en millisecondes
     * @returns Horodatage formaté
     */
    private formatTimestamp(timestamp: number): string {
        const date = new Date(timestamp);

        switch (this.options.timestampFormat) {
            case 'locale':
                return date.toLocaleString();
            case 'epoch':
                return timestamp.toString();
            case 'ISO':
            default:
                return date.toISOString();
        }
    }

    /**
     * Formatte un objet contexte pour l'affichage
     * @param context Objet contexte
     * @param sensitive Indique si le contexte contient des données sensibles
     * @returns Chaîne formatée du contexte
     */
    private formatContext(context: unknown, sensitive = false): string {
        if (!context) {
            return '';
        }

        try {
            // Si c'est une erreur, extraire les informations pertinentes
            if (context instanceof Error) {
                return `${context.name}: ${context.message}${context.stack ? `\n${context.stack}` : ''}`;
            }

            // Si c'est un objet, le formater selon les options
            if (typeof context === 'object') {
                const sanitized = sensitive && this.options.redactSensitiveData !== false
                    ? this.sanitizeObject(context)
                    : context;

                return JSON.stringify(sanitized, null, 2);
            }

            // Sinon, convertir en chaîne
            return String(context);
        } catch {
            return '[Erreur de formatage du contexte]';
        }
    }

    /**
     * Sanitize un objet en masquant les champs sensibles
     * @param obj Objet à sanitizer
     * @returns Objet avec les champs sensibles masqués
     */
    private sanitizeObject(obj: unknown): unknown {
        if (!obj || typeof obj !== 'object') {
            return obj;
        }

        // Liste des champs sensibles par défaut
        const sensitiveFields = this.options.sensitiveFields || [
            'password', 'token', 'secret', 'key', 'credential', 'auth'
        ];

        // Créer une copie pour éviter de modifier l'original
        const sanitized = Array.isArray(obj)
            ? [...obj]
            : { ...obj as Record<string, unknown> };

        // Parcourir les propriétés et masquer celles qui sont sensibles
        Object.keys(sanitized as Record<string, unknown>).forEach(key => {
            const value = (sanitized as Record<string, unknown>)[key];

            // Vérifier si la clé est sensible
            const isSensitive = sensitiveFields.some(field =>
                key.toLowerCase().includes(field.toLowerCase())
            );

            if (isSensitive) {
                // Masquer la valeur
                (sanitized as Record<string, unknown>)[key] = '***REDACTED***';
            } else if (value && typeof value === 'object') {
                // Récursion pour les objets imbriqués
                (sanitized as Record<string, unknown>)[key] = this.sanitizeObject(value);
            }
        });

        return sanitized;
    }
}