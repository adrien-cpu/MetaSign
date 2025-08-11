/**
 * @file: src/ai/coordinators/utils/ErrorHandling.ts
 * 
 * Utilitaire amélioré pour la gestion centralisée des erreurs.
 * Consolide les fonctionnalités existantes et ajoute de nouvelles capacités.
 */

import { logger } from '../../utils/Logger';
import { ComponentType, ErrorSeverity } from '../types';

/**
 * Types d'erreurs standardisés pour le système
 */
export enum ErrorType {
    VALIDATION = 'VALIDATION_ERROR',
    TIMEOUT = 'TIMEOUT_ERROR',
    NOT_FOUND = 'NOT_FOUND_ERROR',
    PERMISSION = 'PERMISSION_ERROR',
    CONFIGURATION = 'CONFIGURATION_ERROR',
    COMMUNICATION = 'COMMUNICATION_ERROR',
    RESOURCE = 'RESOURCE_ERROR',
    INTERNAL = 'INTERNAL_ERROR',
    EXTERNAL = 'EXTERNAL_ERROR',
    UNKNOWN = 'UNKNOWN_ERROR'
}

/**
 * Erreur standardisée pour le système
 */
/**
 * Erreur standardisée pour le système
 */
export class SystemError extends Error {
    /** Type d'erreur standardisé */
    public readonly type: ErrorType;
    /** Code d'erreur spécifique */
    public readonly code: string;
    /** Données supplémentaires */
    public readonly data: Record<string, unknown> | undefined;
    /** Erreur d'origine */
    public readonly cause: Error | undefined;
    /** Horodatage de l'erreur */
    public readonly timestamp: number;
    /** Est-il sûr de réessayer cette opération ? */
    public readonly retryable: boolean;
    /** Composant à l'origine de l'erreur */
    public readonly component: ComponentType;
    /** Sévérité de l'erreur */
    public readonly severity: ErrorSeverity;

    /**
     * Crée une nouvelle erreur système
     * @param message Message d'erreur
     * @param type Type d'erreur
     * @param code Code d'erreur spécifique
     * @param options Options supplémentaires
     */
    constructor(
        message: string,
        type: ErrorType = ErrorType.UNKNOWN,
        code: string = 'ERR_UNKNOWN',
        options: {
            data?: Record<string, unknown>;
            cause?: Error;
            retryable?: boolean;
            component?: ComponentType;
            severity?: ErrorSeverity;
        } = {}
    ) {
        super(message);
        this.name = 'SystemError';
        this.type = type;
        this.code = code;
        this.data = options.data;
        this.cause = options.cause;
        this.timestamp = Date.now();
        this.retryable = options.retryable ?? false;
        this.component = options.component ?? ComponentType.Orchestrator;
        this.severity = options.severity ?? ErrorSeverity.Error;

        // Capturer la stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, SystemError);
        }
    }

    /**
     * Convertit l'erreur en objet pour la sérialisation
     */
    public toJSON(): Record<string, unknown> {
        return {
            name: this.name,
            message: this.message,
            type: this.type,
            code: this.code,
            data: this.data,
            component: this.component,
            severity: this.severity,
            timestamp: this.timestamp,
            retryable: this.retryable,
            stack: this.stack
        };
    }
}

/**
 * Options pour la gestion des erreurs
 */
export interface ErrorHandlingOptions {
    /** Niveau de journalisation */
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    /** Capturer automatiquement les erreurs non gérées */
    captureGlobalErrors?: boolean;
    /** Nombre maximum d'erreurs à conserver dans l'historique */
    maxErrorHistorySize?: number;
}

/**
 * Utilitaire pour la gestion centralisée des erreurs
 */
export class ErrorHandling {
    private readonly errorHistory: SystemError[] = [];
    private readonly maxHistorySize: number;

    /**
     * Crée une nouvelle instance de gestion des erreurs
     * @param options Options de configuration
     */
    constructor(options: ErrorHandlingOptions = {}) {
        this.maxHistorySize = options.maxErrorHistorySize || 100;

        // Capturer les erreurs globales si demandé
        if (options.captureGlobalErrors) {
            this.setupGlobalErrorHandling();
        }
    }

    /**
     * Configure la capture des erreurs globales
     * @private
     */
    private setupGlobalErrorHandling(): void {
        if (typeof process !== 'undefined') {
            process.on('uncaughtException', (error: Error) => {
                this.captureError(error);
                logger.error('Uncaught exception', { error: this.getFormattedError(error) });
            });

            process.on('unhandledRejection', (reason: unknown) => {
                this.captureError(reason);
                logger.error('Unhandled rejection', {
                    error: this.getFormattedError(reason)
                });
            });
        }
    }

    /**
     * Capture une erreur dans l'historique
     * @param error Erreur à capturer
     * @returns SystemError créée
     */
    public captureError(error: unknown): SystemError {
        const systemError = this.convertToSystemError(error);

        // Ajouter à l'historique
        this.errorHistory.push(systemError);

        // Limiter la taille de l'historique
        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory.shift();
        }

        return systemError;
    }

    /**
     * Convertit une erreur quelconque en SystemError
     * @param error Erreur à convertir
     * @returns SystemError correspondante
     */
    public convertToSystemError(error: unknown): SystemError {
        // Si c'est déjà une SystemError, la retourner directement
        if (error instanceof SystemError) {
            return error;
        }

        // Si c'est une Error standard
        if (error instanceof Error) {
            return new SystemError(
                error.message,
                this.determineErrorType(error),
                this.getErrorCode(error),
                {
                    cause: error,
                    component: this.getErrorComponent(error),
                    severity: this.getErrorSeverity(error),
                    data: this.getErrorDetails(error)
                }
            );
        }

        // Pour les autres types
        const message = this.getErrorMessage(error);
        return new SystemError(
            message,
            ErrorType.UNKNOWN,
            'ERR_UNKNOWN',
            {
                data: { originalError: error },
                component: this.getErrorComponent(error),
                severity: this.getErrorSeverity(error)
            }
        );
    }

    /**
     * Détermine le type d'erreur à partir d'une erreur standard
     * @param error Erreur à analyser
     * @returns Type d'erreur
     */
    private determineErrorType(error: Error): ErrorType {
        const name = error.name.toLowerCase();

        if (name.includes('timeout')) {
            return ErrorType.TIMEOUT;
        }

        if (name.includes('not found') || name.includes('404')) {
            return ErrorType.NOT_FOUND;
        }

        if (name.includes('permission') || name.includes('unauthorized') || name.includes('forbidden')) {
            return ErrorType.PERMISSION;
        }

        if (name.includes('validation') || name.includes('invalid')) {
            return ErrorType.VALIDATION;
        }

        if (name.includes('configuration') || name.includes('config')) {
            return ErrorType.CONFIGURATION;
        }

        if (name.includes('communication') || name.includes('network')) {
            return ErrorType.COMMUNICATION;
        }

        if (name.includes('resource')) {
            return ErrorType.RESOURCE;
        }

        if (name.includes('external')) {
            return ErrorType.EXTERNAL;
        }

        return ErrorType.INTERNAL;
    }

    /**
     * Extrait le code d'erreur d'une erreur
     * @param error Erreur à analyser
     * @returns Code d'erreur
     */
    public getErrorCode(error: unknown): string {
        if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
            return error.code;
        }

        // Pour les erreurs standard, générer un code basé sur le nom
        if (error instanceof Error) {
            return `ERR_${error.name.toUpperCase().replace(/[^A-Z0-9_]/g, '_')}`;
        }

        return 'PROCESSING_ERROR';
    }

    /**
     * Extrait le message d'erreur d'une erreur
     * @param error Erreur à analyser
     * @returns Message d'erreur
     */
    public getErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }

        if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
            return error.message;
        }

        if (typeof error === 'string') {
            return error;
        }

        if (error === null) {
            return 'Null error';
        }

        if (error === undefined) {
            return 'Undefined error';
        }

        try {
            return JSON.stringify(error);
        } catch {
            return String(error);
        }
    }

    /**
     * Extrait le composant d'erreur d'une erreur
     * @param error Erreur à analyser
     * @returns Composant d'erreur
     */
    public getErrorComponent(error: unknown): ComponentType {
        if (error && typeof error === 'object' && 'component' in error &&
            typeof error.component === 'string' &&
            Object.values(ComponentType).includes(error.component as ComponentType)) {
            return error.component as ComponentType;
        }
        return ComponentType.Orchestrator;
    }

    /**
     * Extrait la sévérité d'erreur d'une erreur
     * @param error Erreur à analyser
     * @returns Sévérité d'erreur
     */
    public getErrorSeverity(error: unknown): ErrorSeverity {
        if (error && typeof error === 'object' && 'severity' in error &&
            typeof error.severity === 'string' &&
            Object.values(ErrorSeverity).includes(error.severity as ErrorSeverity)) {
            return error.severity as ErrorSeverity;
        }
        return ErrorSeverity.Error;
    }

    /**
     * Extrait les détails d'erreur d'une erreur
     * @param error Erreur à analyser
     * @returns Détails d'erreur
     */
    public getErrorDetails(error: unknown): Record<string, unknown> {
        if (error && typeof error === 'object') {
            if ('details' in error) {
                // S'assurer que le résultat est un Record<string, unknown>
                if (error.details && typeof error.details === 'object') {
                    return error.details as Record<string, unknown>;
                }
                // Encapsuler les valeurs non-objets
                return { value: error.details };
            }
            // Convertir l'objet d'erreur en Record<string, unknown>
            const details: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(error)) {
                if (key !== 'code' && key !== 'message' && key !== 'component' && key !== 'severity') {
                    details[key] = value;
                }
            }
            return details;
        }
        // Pour les erreurs non-objets
        return { value: error };
    }

    /**
     * Obtient une représentation formatée d'une erreur
     * @param error Erreur à formater
     * @returns Erreur formatée
     */
    public getFormattedError(error: unknown): string {
        const systemError = this.convertToSystemError(error);
        return `[${systemError.component}:${systemError.type}:${systemError.code}] ${systemError.message}`;
    }

    /**
     * Traite une erreur de façon unifiée
     * @param error Erreur à traiter
     * @param context Contexte supplémentaire
     * @returns Information d'erreur structurée
     */
    public handleError(error: unknown, context?: Record<string, unknown>): Record<string, unknown> {
        const systemError = this.convertToSystemError(error);

        return {
            code: systemError.code,
            message: systemError.message,
            type: systemError.type,
            component: systemError.component,
            severity: systemError.severity,
            details: systemError.data || {},
            context: context || {},
            timestamp: systemError.timestamp,
            retryable: systemError.retryable,
            stack: systemError.stack
        };
    }

    /**
     * Obtient l'historique des erreurs
     * @param limit Nombre maximum d'erreurs à retourner
     * @returns Historique des erreurs
     */
    public getErrorHistory(limit?: number): SystemError[] {
        if (!limit || limit >= this.errorHistory.length) {
            return [...this.errorHistory];
        }

        return this.errorHistory.slice(-limit);
    }

    /**
     * Vide l'historique des erreurs
     */
    public clearErrorHistory(): void {
        this.errorHistory.length = 0;
    }
}

/**
 * Fonctions utilitaires pour compatiblité avec le code existant
 */

/**
 * Extrait le code d'erreur d'une erreur
 * @param error Erreur à analyser
 * @returns Code d'erreur
 */
export function getErrorCode(error: unknown): string {
    const handler = new ErrorHandling();
    return handler.getErrorCode(error);
}

/**
 * Extrait le message d'erreur d'une erreur
 * @param error Erreur à analyser
 * @returns Message d'erreur
 */
export function getErrorMessage(error: unknown): string {
    const handler = new ErrorHandling();
    return handler.getErrorMessage(error);
}

/**
 * Extrait le composant d'erreur d'une erreur
 * @param error Erreur à analyser
 * @returns Composant d'erreur
 */
export function getErrorComponent(error: unknown): ComponentType {
    const handler = new ErrorHandling();
    return handler.getErrorComponent(error);
}

/**
 * Extrait la sévérité d'erreur d'une erreur
 * @param error Erreur à analyser
 * @returns Sévérité d'erreur
 */
export function getErrorSeverity(error: unknown): ErrorSeverity {
    const handler = new ErrorHandling();
    return handler.getErrorSeverity(error);
}

/**
 * Extrait les détails d'erreur d'une erreur
 * @param error Erreur à analyser
 * @returns Détails d'erreur
 */
export function getErrorDetails(error: unknown): Record<string, unknown> {
    const handler = new ErrorHandling();
    return handler.getErrorDetails(error);
}

/**
 * Traite une erreur de façon unifiée
 * @param error Erreur à traiter
 * @param context Contexte supplémentaire
 * @returns Information d'erreur structurée
 */
export function handleError(error: unknown, context?: Record<string, unknown>): Record<string, unknown> {
    const handler = new ErrorHandling();
    return handler.handleError(error, context);
}