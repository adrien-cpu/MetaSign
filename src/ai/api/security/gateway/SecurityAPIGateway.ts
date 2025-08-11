//src/ai/api/security/gateway/SecurityAPIGateway.ts

import { SecurityAuditor } from '../types/SecurityTypes';
import { APIEndpoint, GatewayConfig, APIRequest, APIResponse, SecurityViolation } from './types';

export class SecurityAPIGateway {
    private readonly endpoints = new Map<string, APIEndpoint>();
    private readonly violations = new Map<string, SecurityViolation[]>();
    private readonly BLOCKED_IPS = new Set<string>();
    private readonly WAF_RULES = new Map<string, RegExp>();

    constructor(
        private readonly config: GatewayConfig,
        private readonly securityAuditor: SecurityAuditor
    ) {
        this.initializeWAFRules();
        this.startPeriodicCleanup();
    }

    public async handleRequest(request: APIRequest): Promise<APIResponse> {
        try {
            // Vérification de l'IP bloquée
            if (this.BLOCKED_IPS.has(request.ip)) {
                return this.createErrorResponse(403, 'IP blocked due to security violations');
            }

            // Rate limiting
            const rateLimit = await this.checkRateLimit(request);
            if (!rateLimit.allowed) {
                return this.createErrorResponse(429, 'Rate limit exceeded');
            }

            // WAF rules
            const wafViolations = this.checkWAFRules(request);
            if (wafViolations.length > 0) {
                await this.handleSecurityViolations(request, wafViolations);
                return this.createErrorResponse(400, 'Request blocked by WAF');
            }

            // CORS validation
            const corsResult = this.validateCORS(request, this.config.cors);
            if (corsResult) {
                return corsResult;
            }

            // Authentification
            const authResult = await this.validateAuthentication(request);
            if (!authResult.success) {
                return this.createErrorResponse(401, authResult.error || 'Authentication failed');
            }

            // Autorisation
            const authzResult = await this.validateAuthorization(request, authResult.context);
            if (!authzResult.allowed) {
                return this.createErrorResponse(403, authzResult.error || 'Access denied');
            }

            // Validation de la requête
            const validatedRequest = await this.validateRequest(request);
            if (!validatedRequest.valid) {
                return this.createErrorResponse(400, validatedRequest.error || 'Invalid request');
            }

            // Traitement de la requête
            const response = await this.processRequestWithTimeout(request);

            // Audit
            await this.auditRequest(request, response, []);

            return response;

        } catch (error) {
            await this.securityAuditor.logError({
                timestamp: Date.now(),
                error: error instanceof Error ? error.message : 'Unknown error',
                request: {
                    method: request.method,
                    path: request.path,
                    ip: request.ip
                }
            });

            return this.createErrorResponse(500, 'Internal server error');
        }
    }

    private async validateAuthentication(request: APIRequest): Promise<AuthResult> {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return { success: false, error: 'No authorization header' };
        }

        if (authHeader.startsWith('Bearer ')) {
            const token = authHeader.slice(7);
            const jwtResult = await this.validateJWT(token);
            if (jwtResult.success) {
                return jwtResult;
            }
            const oauth2Result = await this.validateOAuth2Token(token);
            return oauth2Result;
        }

        if (authHeader.startsWith('Basic ')) {
            return this.validateBasicAuth(authHeader.slice(6));
        }

        const apiKeyResult = await this.validateAPIKey(authHeader);
        if (apiKeyResult.success) {
            return apiKeyResult;
        }

        return { success: false, error: 'Invalid authentication method' };
    }

    private async validateRequest(request: APIRequest): Promise<ValidationResult> {
        // Validation du schéma
        const schema = this.config.schemas[request.path];
        if (schema) {
            const schemaError = this.validateSchema(request.body, schema);
            if (schemaError) {
                return { valid: false, error: schemaError };
            }
        }

        // Validation des paramètres
        if (request.query) {
            const queryError = this.validateQueryParams(request.query);
            if (queryError) {
                return { valid: false, error: queryError };
            }
        }

        // Validation des en-têtes requis
        const headerError = this.validateRequiredHeaders(request.headers);
        if (headerError) {
            return { valid: false, error: headerError };
        }

        // Validation du content type
        if (request.body) {
            const contentType = request.headers['content-type'];
            if (!this.config.allowedContentTypes.includes(contentType)) {
                return { valid: false, error: 'Invalid content type' };
            }
        }

        return { valid: true };
    }

    private async checkRateLimit(request: APIRequest): Promise<{ allowed: boolean; remaining: number }> {
        const endpoint = this.endpoints.get(`${request.method}:${request.path}`);
        if (!endpoint) {
            return { allowed: true, remaining: 0 };
        }

        const key = this.getRateLimitKey(request);
        const currentMinute = Math.floor(Date.now() / 60000);
        const requestCount = await this.getRateLimitCount(key, currentMinute);

        const allowed = requestCount < endpoint.rateLimit;
        if (allowed) {
            await this.incrementRateLimit(key, currentMinute);
        }

        return {
            allowed,
            remaining: Math.max(0, endpoint.rateLimit - requestCount)
        };
    }

    private checkWAFRules(request: APIRequest): SecurityViolation[] {
        const violations: SecurityViolation[] = [];
        const content = JSON.stringify({
            body: request.body,
            query: request.query,
            headers: request.headers
        });

        for (const [ruleType, pattern] of this.WAF_RULES.entries()) {
            if (pattern.test(content)) {
                violations.push({
                    type: ruleType,
                    severity: 'high',
                    details: {
                        pattern: pattern.source,
                        match: content.match(pattern)?.[0]
                    },
                    timestamp: Date.now()
                });
            }
        }

        if (this.detectSQLInjection(request)) {
            violations.push({
                type: 'sql-injection',
                severity: 'critical',
                details: { location: this.findInjectionLocation(request) },
                timestamp: Date.now()
            });
        }

        if (this.detectXSS(request)) {
            violations.push({
                type: 'xss',
                severity: 'high',
                details: { location: this.findInjectionLocation(request) },
                timestamp: Date.now()
            });
        }

        return violations;
    }

    private async handleSecurityViolations(request: APIRequest, violations: SecurityViolation[]): Promise<void> {
        const violationsKey = `violations:${request.ip}`;
        const existingViolations = this.violations.get(violationsKey) || [];
        this.violations.set(violationsKey, [...existingViolations, ...violations]);

        const severityScore = violations.reduce((score, v) =>
            score + (v.severity === 'critical' ? 3 : v.severity === 'high' ? 2 : 1), 0);

        if (severityScore >= 5) {
            this.BLOCKED_IPS.add(request.ip);
            await this.securityAuditor.logBlockedIP({
                ip: request.ip,
                violations,
                timestamp: Date.now()
            });
        }

        await this.securityAuditor.logViolations(violations);
    }

    private initializeWAFRules(): void {
        this.WAF_RULES.set('sql', /(\%27)|(\')|(\-\-)|(\%23)|(#)/i);
        this.WAF_RULES.set('xss', /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/i);
        this.WAF_RULES.set('path', /\.\.|%2e%2e|%252e/i);
        this.WAF_RULES.set('file', /\.(php|asp|aspx|jsp|exe)$/i);
        this.WAF_RULES.set('protocol', /(php|data|file|ftp|ldap|dict|gopher):/i);
    }

    private validateCORS(request: APIRequest, corsConfig: CORSConfig): APIResponse | null {
        const origin = request.headers.origin;
        if (!origin) return null;

        const headers = {
            'Access-Control-Allow-Origin':
                corsConfig.allowedOrigins.includes(origin) ? origin : corsConfig.allowedOrigins[0],
            'Access-Control-Allow-Methods': corsConfig.allowedMethods.join(', '),
            'Access-Control-Allow-Headers': corsConfig.allowedHeaders.join(', '),
            'Access-Control-Max-Age': corsConfig.maxAge.toString()
        };

        if (request.method === 'OPTIONS') {
            return {
                status: 204,
                headers,
                body: null
            };
        }

        if (!corsConfig.allowedOrigins.includes(origin) && !corsConfig.allowedOrigins.includes('*')) {
            return {
                status: 403,
                headers,
                body: { error: 'CORS policy violation' }
            };
        }

        return null;
    }

    private createErrorResponse(status: number, message: string): APIResponse {
        return {
            status,
            headers: this.getSecureHeaders(),
            body: { error: message }
        };
    }

    private getSecureHeaders(): Record<string, string> {
        return {
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Content-Security-Policy': "default-src 'self'",
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Cache-Control': 'no-store, max-age=0'
        };
    }
}