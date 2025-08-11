import { Logger } from '@ai/utils/Logger';
import { RetryPolicyConfig } from '../types';

/**
 * Interface pour les erreurs avec un code
 */
interface ErrorWithCode extends Error {
    code?: string;
}

/**
 * Politique de nouvelle tentative pour les opérations pouvant échouer
 */
export class RetryPolicy {
    private readonly logger = new Logger('RetryPolicy');
    private readonly config: RetryPolicyConfig;

    /**
     * Crée une nouvelle instance de politique de nouvelle tentative
     * 
     * @param config Configuration de la politique
     */
    constructor(config: Partial<RetryPolicyConfig> = {}) {
        this.config = {
            maxRetries: 3,
            baseDelayMs: 100,
            maxDelayMs: 10000,
            backoffFactor: 2,
            retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'NETWORK_ERROR'],
            ...config
        };

        this.logger.debug(`RetryPolicy initialized with max ${this.config.maxRetries} retries`);
    }

    /**
     * Exécute une fonction avec politique de nouvelle tentative
     * 
     * @param fn Fonction à exécuter
     * @returns Résultat de la fonction
     */
    async execute<T>(fn: () => Promise<T>): Promise<T> {
        let lastError: Error | undefined;
        let retryCount = 0;

        while (retryCount <= this.config.maxRetries) {
            try {
                if (retryCount > 0) {
                    this.logger.debug(`Retry attempt ${retryCount}/${this.config.maxRetries}`);
                }

                return await fn();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                // Vérifier si l'erreur est retryable
                if (!this.isRetryableError(lastError)) {
                    this.logger.debug(`Error is not retryable: ${lastError.message}`);
                    throw lastError;
                }

                retryCount++;

                // Vérifier si nous avons atteint le maximum de nouvelles tentatives
                if (retryCount > this.config.maxRetries) {
                    this.logger.warn(`Max retries (${this.config.maxRetries}) reached, giving up`);
                    throw lastError;
                }

                // Calculer le délai de backoff exponentiel
                const delay = this.calculateDelay(retryCount);

                this.logger.debug(`Waiting ${delay}ms before retry ${retryCount}`);
                await this.sleep(delay);
            }
        }

        // Ce code ne devrait jamais être atteint, mais TypeScript l'exige pour la sécurité des types
        throw lastError || new Error('Unexpected retry policy failure');
    }

    /**
     * Calcule le délai de backoff pour une tentative spécifique
     * 
     * @param attempt Numéro de la tentative actuelle
     * @returns Délai en millisecondes
     */
    private calculateDelay(attempt: number): number {
        // Calculer le délai de base avec jitter
        const baseDelay = this.config.baseDelayMs * Math.pow(this.config.backoffFactor, attempt - 1);

        // Ajouter un peu d'aléatoire (jitter) pour éviter les tempêtes de requêtes
        const jitter = Math.random() * 0.3 + 0.85; // 0.85-1.15

        // Retourner le délai avec un maximum
        return Math.min(baseDelay * jitter, this.config.maxDelayMs);
    }

    /**
     * Détermine si une erreur peut faire l'objet d'une nouvelle tentative
     * 
     * @param error Erreur à vérifier
     * @returns Vrai si l'erreur peut faire l'objet d'une nouvelle tentative
     */
    private isRetryableError(error: Error): boolean {
        // Vérifier le code d'erreur
        const errorWithCode = error as ErrorWithCode;
        if (errorWithCode.code && this.config.retryableErrors.includes(errorWithCode.code)) {
            return true;
        }

        // Vérifier le message d'erreur pour les erreurs non codées
        for (const retryablePattern of this.config.retryableErrors) {
            if (error.message.includes(retryablePattern)) {
                return true;
            }
        }

        // Vérifier les erreurs temporaires typiques
        if (
            error.message.includes('timeout') ||
            error.message.includes('exceeded') ||
            error.message.includes('temporarily') ||
            error.message.includes('temporary') ||
            error.message.includes('retry')
        ) {
            return true;
        }

        return false;
    }

    /**
     * Attend un délai spécifié
     * 
     * @param ms Délai en millisecondes
     * @returns Promesse résolue après le délai
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}