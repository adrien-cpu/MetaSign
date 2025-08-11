// src/ai/api/core/middleware/utils/security-logger.ts
import { Logger } from '@api/common/monitoring/LogService';

export enum SecurityLogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    CRITICAL = 'critical'
}

export interface SecurityLogOptions {
    includeTimestamp?: boolean;
    includeStack?: boolean;
    includeSensitiveData?: boolean;
    correlationId?: string;
    tags?: string[];
}

/**
 * Enhanced logger for security-related events
 */
export class SecurityLogger {
    private readonly baseLogger: Logger;
    private readonly context: string;
    private readonly defaultOptions: SecurityLogOptions;

    constructor(context: string, defaultOptions: SecurityLogOptions = {}) {
        this.baseLogger = new Logger(`security:${context}`);
        this.context = context;
        this.defaultOptions = {
            includeTimestamp: true,
            includeStack: false,
            includeSensitiveData: false,
            ...defaultOptions
        };
    }

    /**
     * Log a security event
     */
    public log(
        level: SecurityLogLevel,
        message: string,
        data?: Record<string, unknown>,
        options?: SecurityLogOptions
    ): void {
        const mergedOptions = { ...this.defaultOptions, ...options };
        const {
            includeTimestamp,
            includeStack,
            includeSensitiveData,
            correlationId,
            tags
        } = mergedOptions;

        // Prepare log data
        const logData: Record<string, unknown> = {
            context: this.context,
            ...data
        };

        // Add standard metadata
        if (includeTimestamp) {
            logData.timestamp = new Date().toISOString();
        }

        if (correlationId) {
            logData.correlationId = correlationId;
        }

        if (tags && tags.length > 0) {
            logData.tags = tags;
        }

        // Handle stack traces for errors
        if (includeStack && data?.error instanceof Error) {
            logData.stack = (data.error as Error).stack;
        }

        // Remove sensitive data unless explicitly included
        if (!includeSensitiveData && data) {
            const sensitiveFields = [
                'password', 'token', 'secret', 'key', 'credential',
                'ssn', 'socialSecurity', 'creditCard', 'authorization'
            ];

            for (const field of sensitiveFields) {
                this.removeSensitiveData(logData, field);
            }
        }

        // Log with appropriate level
        switch (level) {
            case SecurityLogLevel.DEBUG:
                this.baseLogger.debug(message, logData);
                break;
            case SecurityLogLevel.INFO:
                this.baseLogger.info(message, logData);
                break;
            case SecurityLogLevel.WARNING:
                this.baseLogger.warn(message, logData);
                break;
            case SecurityLogLevel.ERROR:
                this.baseLogger.error(message, logData);
                break;
            case SecurityLogLevel.CRITICAL:
                this.baseLogger.error(`[CRITICAL] ${message}`, {
                    ...logData,
                    critical: true
                });
                break;
        }
    }

    /**
     * Log a security event at debug level
     */
    public debug(
        message: string,
        data?: Record<string, unknown>,
        options?: SecurityLogOptions
    ): void {
        this.log(SecurityLogLevel.DEBUG, message, data, options);
    }

    /**
     * Log a security event at info level
     */
    public info(
        message: string,
        data?: Record<string, unknown>,
        options?: SecurityLogOptions
    ): void {
        this.log(SecurityLogLevel.INFO, message, data, options);
    }

    /**
     * Log a security event at warning level
     */
    public warning(
        message: string,
        data?: Record<string, unknown>,
        options?: SecurityLogOptions
    ): void {
        this.log(SecurityLogLevel.WARNING, message, data, options);
    }

    /**
     * Log a security event at error level
     */
    public error(
        message: string,
        data?: Record<string, unknown>,
        options?: SecurityLogOptions
    ): void {
        this.log(SecurityLogLevel.ERROR, message, data, options);
    }

    /**
     * Log a security event at critical level
     */
    public critical(
        message: string,
        data?: Record<string, unknown>,
        options?: SecurityLogOptions
    ): void {
        this.log(SecurityLogLevel.CRITICAL, message, data, options);
    }

    /**
     * Recursively removes sensitive data from an object
     */
    private removeSensitiveData(
        obj: Record<string, unknown>,
        sensitiveField: string
    ): void {
        for (const [key, value] of Object.entries(obj)) {
            if (key.toLowerCase().includes(sensitiveField.toLowerCase())) {
                obj[key] = '[REDACTED]';
            } else if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    // Handle arrays
                    (value as unknown[]).forEach(item => {
                        if (typeof item === 'object' && item !== null) {
                            this.removeSensitiveData(item as Record<string, unknown>, sensitiveField);
                        }
                    });
                } else {
                    // Handle objects
                    this.removeSensitiveData(value as Record<string, unknown>, sensitiveField);
                }
            }
        }
    }
}