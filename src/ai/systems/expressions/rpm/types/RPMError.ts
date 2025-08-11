/**
 * @class RPMError
 * @brief Custom error class for RPM system errors
 */
export class RPMError extends Error {
    /**
     * @brief Create a new RPM error
     * @param message Error message
     * @param cause Original error that caused this error (optional)
     */
    constructor(message: string, public readonly cause?: unknown) {
        super(message);
        this.name = 'RPMError';

        // Maintain proper stack trace in Node.js
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RPMError);
        }
    }

    /**
     * @brief Get the error type
     * @return Error type string
     */
    public getErrorType(): string {
        if (this.message.includes('connection')) {
            return 'CONNECTION';
        } else if (this.message.includes('timeout')) {
            return 'TIMEOUT';
        } else if (this.message.includes('resource')) {
            return 'RESOURCE';
        } else {
            return 'GENERAL';
        }
    }

    /**
     * @brief Get the severity level of the error
     * @return Error severity level (1-5)
     */
    public getSeverity(): number {
        if (this.message.includes('critical')) {
            return 5;
        } else if (this.message.includes('severe')) {
            return 4;
        } else if (this.message.includes('warning')) {
            return 2;
        } else {
            return 3; // Default moderate severity
        }
    }
}