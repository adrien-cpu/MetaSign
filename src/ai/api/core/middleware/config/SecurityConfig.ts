// src/ai/api/core/middleware/config/SecurityConfig.ts
import { SecurityConfig } from '../types/middleware.types';

/**
 * Obtient la configuration de sécurité par défaut
 * @returns Configuration de sécurité par défaut
 */
export function getSecurityConfig(): SecurityConfig {
  return {
    enableRateLimiting: true,
    validateTokens: true,
    detailedErrors: process.env.NODE_ENV !== 'production',
    enableComplianceChecks: false,
    enableBehaviorAnalysis: false,
    enableIntrusionDetection: false,
    enableDataSanitization: true,
    enableEncryption: false,
    enableAudit: false,
    enableSecurityHeaders: true,

    // Configurations spécifiques par défaut
    rateLimiting: {
      defaultLimit: 100,
      windowMs: 60000, // 1 minute
      pathLimits: {}
    },
    authentication: {
      publicPaths: ['/api/health', '/api/docs', '/public']
    },
    securityHeaders: {
      hsts: {
        enabled: true,
        maxAge: 31536000, // 1 an
        includeSubDomains: true,
        preload: false
      },
      noSniff: true,
      frameOptions: 'DENY',
      xssProtection: true,
      referrerPolicy: 'strict-origin-when-cross-origin'
    }
  };
}

/**
 * Fusionne la configuration de sécurité par défaut avec une configuration personnalisée
 * @param customConfig Configuration personnalisée
 * @returns Configuration fusionnée
 */
export function mergeSecurityConfig(customConfig?: Partial<SecurityConfig>): SecurityConfig {
  if (!customConfig) {
    return getSecurityConfig();
  }

  const defaultConfig = getSecurityConfig();

  // Fusionner les configurations de premier niveau
  const mergedConfig = { ...defaultConfig, ...customConfig };

  // Fusionner les configurations imbriquées
  if (customConfig.rateLimiting) {
    mergedConfig.rateLimiting = {
      ...defaultConfig.rateLimiting,
      ...customConfig.rateLimiting,
      pathLimits: {
        ...defaultConfig.rateLimiting?.pathLimits,
        ...customConfig.rateLimiting?.pathLimits
      }
    };
  }

  if (customConfig.authentication) {
    mergedConfig.authentication = {
      ...defaultConfig.authentication,
      ...customConfig.authentication
    };
  }

  if (customConfig.securityHeaders && typeof customConfig.securityHeaders !== 'boolean') {
    mergedConfig.securityHeaders = {
      ...defaultConfig.securityHeaders,
      ...customConfig.securityHeaders,
      hsts: {
        ...defaultConfig.securityHeaders?.hsts,
        ...customConfig.securityHeaders?.hsts
      }
    };
  }

  return mergedConfig;
}