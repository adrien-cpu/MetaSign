// src/ai/api/security/gateway/types.ts

/**
 * Représente une propriété de schéma JSON
 */
export type SchemaPropertyType =
    | { type: 'string'; format?: string; pattern?: string; enum?: string[] }
    | { type: 'number'; minimum?: number; maximum?: number }
    | { type: 'integer'; minimum?: number; maximum?: number }
    | { type: 'boolean' }
    | { type: 'array'; items: SchemaPropertyType }
    | { type: 'object'; properties: Record<string, SchemaPropertyType>; required?: string[] }
    | { oneOf: SchemaPropertyType[] }
    | { anyOf: SchemaPropertyType[] }
    | { allOf: SchemaPropertyType[] }
    | { $ref: string };

export interface GatewayConfig {
    cors: CORSConfig;
    rateLimit: RateLimitConfig;
    schemas: Record<string, SchemaConfig>;
    allowedContentTypes: string[];
    requiredHeaders: string[];
    security: SecurityConfig;
}

export interface CORSConfig {
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
    maxAge: number;
}

export interface RateLimitConfig {
    windowMs: number;
    max: number;
    headers: boolean;
    skipFailedRequests: boolean;
    skipSuccessfulRequests: boolean;
}

export interface SchemaConfig {
    type: string;
    properties: Record<string, SchemaPropertyType>; // Remplacé any par SchemaPropertyType
    required: string[];
}

export interface SecurityConfig {
    authentication: {
        jwtSecret: string;
        apiKeys: string[];
        oauth: {
            clientId: string;
            clientSecret: string;
            authorizationURL: string;
            tokenURL: string;
        };
    };
    authorization: {
        roles: Record<string, string[]>;
        permissions: Record<string, string[]>;
    };
}

export interface APIEndpoint {
    path: string;
    method: string;
    rateLimit: number;
    auth: boolean;
    roles: string[];
}

export interface APIRequest {
    method: string;
    path: string;
    headers: Record<string, string>;
    query: Record<string, string>;
    body: unknown; // Remplacé any par unknown
    ip: string;
}

export interface APIResponse {
    status: number;
    headers: Record<string, string>;
    body: unknown; // Remplacé any par unknown
}

export interface SecurityViolation {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: Record<string, unknown>; // Remplacé any par unknown
    timestamp: number;
}

export interface AuthResult {
    success: boolean;
    error?: string;
    context?: {
        userId: string;
        roles: string[];
        permissions: string[];
        metadata?: Record<string, unknown>; // Remplacé any par unknown
    };
}

export interface ValidationResult {
    valid: boolean;
    error?: string;
}