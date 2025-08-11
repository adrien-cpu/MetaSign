//src/ai/api/core/middleware/middlewares/SecurityHeadersMiddleware.ts
import { IAPIContext } from '@api/core/types';
import { IMiddleware, NextFunction } from '../types/middleware.types';
import { Logger } from '@api/common/monitoring/LogService';

/**
 * Options pour le middleware d'en-têtes de sécurité
 */
export interface SecurityHeadersOptions {
    /**
     * En-tête Strict-Transport-Security
     */
    hsts?: {
        /**
         * Activer/désactiver l'en-tête HSTS
         */
        enabled: boolean;

        /**
         * Durée de vie en secondes
         */
        maxAge: number;

        /**
         * Inclure les sous-domaines
         */
        includeSubDomains: boolean;

        /**
         * Précharger
         */
        preload: boolean;
    };

    /**
     * En-tête Content-Security-Policy
     */
    csp?: {
        /**
         * Activer/désactiver l'en-tête CSP
         */
        enabled: boolean;

        /**
         * Directives CSP
         */
        directives: Record<string, string | string[]>;

        /**
         * Utiliser report-only
         */
        reportOnly: boolean;
    };

    /**
     * En-tête X-Content-Type-Options
     */
    noSniff?: boolean;

    /**
     * En-tête X-Frame-Options
     */
    frameOptions?: 'DENY' | 'SAMEORIGIN' | false;

    /**
     * En-tête X-XSS-Protection
     */
    xssProtection?: boolean;

    /**
     * En-tête Referrer-Policy
     */
    referrerPolicy?: string;

    /**
     * En-tête Feature-Policy / Permissions-Policy
     */
    featurePolicy?: Record<string, string | string[]>;

    /**
     * En-têtes Cache-Control
     */
    cacheControl?: {
        /**
         * Activer/désactiver les en-têtes de cache
         */
        enabled: boolean;

        /**
         * Valeur de l'en-tête Cache-Control
         */
        value: string;
    };
}

/**
 * Middleware qui ajoute des en-têtes de sécurité à la réponse
 */
export class SecurityHeadersMiddleware implements IMiddleware {
    private readonly logger: Logger;
    private readonly options: SecurityHeadersOptions;

    /**
     * Crée un nouveau middleware d'en-têtes de sécurité
     * @param options Options de configuration
     */
    constructor(options: SecurityHeadersOptions = {}) {
        this.logger = new Logger('SecurityHeadersMiddleware');

        // Options par défaut
        this.options = {
            hsts: {
                enabled: true,
                maxAge: 31536000, // 1 an
                includeSubDomains: true,
                preload: true,
                ...options.hsts
            },
            csp: {
                enabled: true,
                directives: {
                    'default-src': ["'self'"],
                    'script-src': ["'self'"],
                    'object-src': ["'none'"],
                    ...options.csp?.directives
                },
                reportOnly: false,
                ...options.csp
            },
            noSniff: options.noSniff !== false,
            frameOptions: options.frameOptions || 'DENY',
            xssProtection: options.xssProtection !== false,
            referrerPolicy: options.referrerPolicy || 'strict-origin-when-cross-origin',
            featurePolicy: {
                'microphone': ["'none'"],
                'camera': ["'none'"],
                'geolocation': ["'none'"],
                ...options.featurePolicy
            },
            cacheControl: {
                enabled: true,
                value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
                ...options.cacheControl
            }
        };
    }

    /**
     * Ajoute des en-têtes de sécurité à la réponse
     * @param context Contexte de la requête API
     * @param next Fonction middleware suivante
     */
    public async process(context: IAPIContext, next: NextFunction): Promise<void> {
        try {
            // Exécuter le reste de la chaîne de middleware
            await next();

            // Assurer que la réponse existe
            if (!context.response) {
                context.response = {
                    status: 200,
                    statusCode: 200,
                    headers: {},
                    body: {}
                };
            }

            // Ajouter les en-têtes de sécurité
            context.response.headers = {
                ...context.response.headers,
                ...this.getSecurityHeaders()
            };
        } catch (error) {
            // Propager l'erreur pour permettre son traitement par d'autres middlewares
            throw error;
        }
    }

    /**
     * Génère les en-têtes de sécurité
     * @returns En-têtes de sécurité
     */
    private getSecurityHeaders(): Record<string, string> {
        const headers: Record<string, string> = {};

        // HSTS (HTTP Strict Transport Security)
        if (this.options.hsts?.enabled) {
            let hstsValue = `max-age=${this.options.hsts.maxAge}`;
            if (this.options.hsts.includeSubDomains) {
                hstsValue += '; includeSubDomains';
            }
            if (this.options.hsts.preload) {
                hstsValue += '; preload';
            }
            headers['Strict-Transport-Security'] = hstsValue;
        }

        // CSP (Content Security Policy)
        if (this.options.csp?.enabled) {
            const cspHeaderName = this.options.csp.reportOnly
                ? 'Content-Security-Policy-Report-Only'
                : 'Content-Security-Policy';

            const cspValue = Object.entries(this.options.csp.directives)
                .map(([directive, values]) => {
                    if (Array.isArray(values)) {
                        return `${directive} ${values.join(' ')}`;
                    }
                    return `${directive} ${values}`;
                })
                .join('; ');

            headers[cspHeaderName] = cspValue;
        }

        // X-Content-Type-Options
        if (this.options.noSniff) {
            headers['X-Content-Type-Options'] = 'nosniff';
        }

        // X-Frame-Options
        if (this.options.frameOptions) {
            headers['X-Frame-Options'] = this.options.frameOptions;
        }

        // X-XSS-Protection
        if (this.options.xssProtection) {
            headers['X-XSS-Protection'] = '1; mode=block';
        }

        // Referrer-Policy
        if (this.options.referrerPolicy) {
            headers['Referrer-Policy'] = this.options.referrerPolicy;
        }

        // Feature-Policy / Permissions-Policy
        if (this.options.featurePolicy) {
            const featurePolicyValue = Object.entries(this.options.featurePolicy)
                .map(([feature, values]) => {
                    if (Array.isArray(values)) {
                        return `${feature} ${values.join(' ')}`;
                    }
                    return `${feature} ${values}`;
                })
                .join('; ');

            headers['Feature-Policy'] = featurePolicyValue;
            headers['Permissions-Policy'] = featurePolicyValue;
        }

        // Cache Control
        if (this.options.cacheControl?.enabled) {
            headers['Cache-Control'] = this.options.cacheControl.value;
            headers['Pragma'] = 'no-cache';
            headers['Expires'] = '0';
        }

        return headers;
    }
}