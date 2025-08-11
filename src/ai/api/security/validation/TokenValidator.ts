// src/ai/api/security/validation/TokenValidator.ts

import { SecurityContext } from '../types/SecurityTypes';

interface TokenPayload {
    sub: string;
    exp: number;
    iat: number;
    roles: string[];
    permissions: string[];
    sessionId: string;
    fingerprint: string;
}

interface ValidationResult {
    isValid: boolean;
    payload?: TokenPayload;
    error?: string;
}

interface TokenValidationOptions {
    requireFingerprint: boolean;
    maxTokenAge: number;
    allowedIssuers: string[];
    requiredClaims: string[];
}

export class TokenValidator {
    private readonly defaultOptions: TokenValidationOptions = {
        requireFingerprint: true,
        maxTokenAge: 24 * 60 * 60, // 24 heures en secondes
        allowedIssuers: ['system'],
        requiredClaims: ['sub', 'exp', 'iat']
    };

    constructor(
        private options: TokenValidationOptions = { ...this.defaultOptions },
        private readonly secretKey: string
    ) { }

    async validateToken(token: string, context?: SecurityContext): Promise<ValidationResult> {
        try {
            // Vérifier la structure du token
            if (!this.isValidTokenFormat(token)) {
                return { isValid: false, error: 'Invalid token format' };
            }

            // Décoder le token
            const [header, payload, signature] = token.split('.');
            const decodedPayload = this.decodePayload(payload);

            // Vérifier la signature
            if (!await this.verifySignature(header, payload, signature)) {
                return { isValid: false, error: 'Invalid signature' };
            }

            // Vérifier l'expiration
            if (!this.verifyExpiration(decodedPayload)) {
                return { isValid: false, error: 'Token expired' };
            }

            // Vérifier les claims requis
            if (!this.verifyRequiredClaims(decodedPayload)) {
                return { isValid: false, error: 'Missing required claims' };
            }

            // Vérifier l'empreinte si nécessaire
            if (this.options.requireFingerprint && context) {
                if (!this.verifyFingerprint(decodedPayload, context)) {
                    return { isValid: false, error: 'Invalid fingerprint' };
                }
            }

            return {
                isValid: true,
                payload: decodedPayload
            };

        } catch (error) {
            return {
                isValid: false,
                error: error instanceof Error ? error.message : 'Validation error'
            };
        }
    }

    private isValidTokenFormat(token: string): boolean {
        const parts = token.split('.');
        return parts.length === 3 && parts.every(part => this.isBase64Url(part));
    }

    private isBase64Url(str: string): boolean {
        return /^[A-Za-z0-9_-]+$/i.test(str);
    }

    private decodePayload(payload: string): TokenPayload {
        const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
        return JSON.parse(decoded);
    }

    private async verifySignature(header: string, payload: string, signature: string): Promise<boolean> {
        try {
            const key = await this.importKey();
            const data = `${header}.${payload}`;
            const signatureBuffer = Buffer.from(signature, 'base64url');

            return await crypto.subtle.verify(
                'HMAC',
                key,
                signatureBuffer,
                new TextEncoder().encode(data)
            );
        } catch {
            return false;
        }
    }

    private async importKey(): Promise<CryptoKey> {
        const keyData = new TextEncoder().encode(this.secretKey);
        return await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );
    }

    private verifyExpiration(payload: TokenPayload): boolean {
        const now = Math.floor(Date.now() / 1000);
        return payload.exp > now &&
            now - payload.iat <= this.options.maxTokenAge;
    }

    private verifyRequiredClaims(payload: TokenPayload): boolean {
        return this.options.requiredClaims.every(claim =>
            claim in payload && payload[claim as keyof TokenPayload] !== undefined
        );
    }

    private verifyFingerprint(payload: TokenPayload, context: SecurityContext): boolean {
        const expectedFingerprint = this.generateFingerprint(context);
        return payload.fingerprint === expectedFingerprint;
    }

    private generateFingerprint(context: SecurityContext): string {
        const data = `${context.userId}:${context.ipAddress}:${context.sessionId}`;
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    // Méthodes publiques utilitaires
    public updateOptions(newOptions: Partial<TokenValidationOptions>): void {
        this.options = {
            ...this.options,
            ...newOptions
        };
    }

    public getOptions(): TokenValidationOptions {
        return { ...this.options };
    }
}