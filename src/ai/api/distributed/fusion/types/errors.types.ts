/**
 * src/ai/api/distributed/fusion/types/errors.types.ts
 * Types d'erreurs spécifiques au système de fusion
 */

/**
 * Erreur de validation des résultats
 */
export class ValidationError extends Error {
    /**
     * Constructeur
     * @param message - Message d'erreur
     */
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';

        // Pour un meilleur support des classes d'erreur en TypeScript
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

/**
 * Erreur d'intégrité des résultats
 */
export class IntegrityError extends Error {
    /**
     * Constructeur
     * @param message - Message d'erreur
     */
    constructor(message: string) {
        super(message);
        this.name = 'IntegrityError';

        // Pour un meilleur support des classes d'erreur en TypeScript
        Object.setPrototypeOf(this, IntegrityError.prototype);
    }
}

/**
 * Erreur de stratégie de fusion
 */
export class FusionStrategyError extends Error {
    /**
     * Constructeur
     * @param message - Message d'erreur
     */
    constructor(message: string) {
        super(message);
        this.name = 'FusionStrategyError';

        // Pour un meilleur support des classes d'erreur en TypeScript
        Object.setPrototypeOf(this, FusionStrategyError.prototype);
    }
}

/**
 * Erreur de timeout durant la fusion
 */
export class FusionTimeoutError extends Error {
    /**
     * Constructeur
     * @param message - Message d'erreur
     */
    constructor(message: string) {
        super(message);
        this.name = 'FusionTimeoutError';

        // Pour un meilleur support des classes d'erreur en TypeScript
        Object.setPrototypeOf(this, FusionTimeoutError.prototype);
    }
}