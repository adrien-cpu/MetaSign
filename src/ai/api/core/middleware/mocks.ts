// src/ai/api/core/middleware/mocks.ts
import {
    IJWTService,
    ITokenValidator,
    IEncryptionService,
    IDataSanitizer,
    ISecurityBehaviorAnalyzer,
    IIntrusionDetectionSystem,
    IRateLimiter,
    ISecurityAuditor,
    IComplianceValidator,
    ISensitiveDataChecker,
    ISecurityMetricsCollector,
    IFraudDetectionSystem,
    ISecurityEventMonitor
} from './interfaces';

import {
    TokenValidationResult,
    BehaviorAnalysisResult,
    IntrusionDetectionResult,
    ComplianceValidationResult,
    AnomalyType
} from '@api/core/types';

import { SecurityErrorType } from './types/middleware.types';

// Interface pour les événements de sécurité
interface SecurityEvent {
    timestamp: number;
    [key: string]: unknown;
}

/**
 * Crée un service JWT mock pour les tests
 */
export function createMockJwtService(): IJWTService {
    return {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        generateToken: async (payload: Record<string, unknown>, options?: Record<string, unknown>) => {
            return `mock.jwt.token.${Date.now()}.${JSON.stringify(payload).substring(0, 20)}`;
        },
        verifyToken: async (token: string) => {
            if (token === 'invalid-token') {
                throw new Error('Invalid token');
            }
            return {
                userId: 'mock-user-123',
                roles: ['user'],
                permissions: ['read:api'],
                exp: Math.floor(Date.now() / 1000) + 3600
            };
        },
        decodeToken: (token: string) => {
            if (token === 'invalid-token') {
                return null;
            }
            return {
                userId: 'mock-user-123',
                roles: ['user'],
                permissions: ['read:api'],
                exp: Math.floor(Date.now() / 1000) + 3600,
                iat: Math.floor(Date.now() / 1000) - 3600
            };
        }
    };
}

/**
 * Crée un validateur de token mock
 */
export function createMockTokenValidator(): ITokenValidator {
    return {
        validate: async (token: string): Promise<TokenValidationResult> => {
            if (token === 'invalid-token') {
                throw new Error('Invalid token');
            }

            return {
                valid: true,
                userId: 'mock-user-123',
                roles: ['user'],
                permissions: ['read:api'],
                issuedAt: new Date(Date.now() - 3600000),
                expiresAt: new Date(Date.now() + 3600000),
                encryptionKey: 'mock-key-123',
                clearanceLevel: 'standard'
            };
        }
    };
}

/**
 * Crée un service de chiffrement mock
 */
export function createMockEncryptionService(): IEncryptionService {
    return {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        encrypt: async (data: string, key?: string) => {
            return `encrypted:${data.substring(0, 20)}...`;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        decrypt: async (encryptedData: string, key?: string) => {
            if (encryptedData.startsWith('encrypted:')) {
                const dataHint = encryptedData.replace('encrypted:', '').replace('...', '');
                return `{"decrypted":"${dataHint}..."}`;
            }
            return `{"decrypted":"unknown"}`;
        },
        generateKey: async () => {
            return `mock-key-${Date.now()}`;
        }
    };
}

/**
 * Crée un assainisseur de données mock
 */
export function createMockDataSanitizer(): IDataSanitizer {
    return {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        sanitize: async <T>(input: T, options?: Record<string, unknown>): Promise<T> => {
            // Vérifiez si l'entrée est une chaîne
            if (typeof input === 'string') {
                // Simuler l'assainissement en remplaçant des motifs potentiellement dangereux
                const sanitized = (input as string)
                    .replace(/<script.*?>.*?<\/script>/gi, '')
                    .replace(/javascript:/gi, 'removed:')
                    .replace(/on\w+=/gi, 'data-removed=')
                    .replace(/union\s+select/gi, 'removed')
                    .replace(/--/g, '') as unknown as T;

                return sanitized;
            }

            // Si c'est un objet, traiter récursivement
            if (input && typeof input === 'object' && !Array.isArray(input)) {
                const result = { ...input } as Record<string, unknown>;

                for (const key in result) {
                    if (typeof result[key] === 'string') {
                        result[key] = (result[key] as string)
                            .replace(/<script.*?>.*?<\/script>/gi, '')
                            .replace(/javascript:/gi, 'removed:')
                            .replace(/on\w+=/gi, 'data-removed=')
                            .replace(/union\s+select/gi, 'removed')
                            .replace(/--/g, '');
                    }
                }

                return result as T;
            }

            return input;
        }
    };
}

/**
 * Crée un analyseur de comportement mock
 */
export function createMockBehaviorAnalyzer(): ISecurityBehaviorAnalyzer {
    return {

        analyzeRequest: async (
            userId: string,
            endpoint: string,
            method: string,
            ip: string,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            userAgent?: string,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            requestData?: Record<string, unknown>
        ): Promise<BehaviorAnalysisResult> => {
            // Simuler une anomalie pour les tests
            const isAnomalous = endpoint.includes('suspicious') ||
                userId === 'suspicious-user' ||
                ip === '192.168.1.100' ||
                method === 'DELETE';

            // Pour résoudre l'erreur avec exactOptionalPropertyTypes, on ne définit anomalyType
            // que lorsqu'il y a une anomalie, sinon on laisse ce champ absent
            const result: BehaviorAnalysisResult = {
                anomalyDetected: isAnomalous,
                anomalyConfidence: isAnomalous ? 0.85 : 0.1,
                details: isAnomalous ? 'Suspicious behavior detected' : 'No anomaly detected',
                riskScore: isAnomalous ? 0.75 : 0.1,
                baseline: {}
            };

            // Ajouter anomalyType seulement si une anomalie est détectée
            if (isAnomalous) {
                result.anomalyType = 'UNUSUAL_PATTERN' as AnomalyType;
            }

            return result;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        reportAnomaly: async (anomalyInfo: Record<string, unknown>) => {
            // Rien à faire dans le mock
        }
    };
}

/**
* Crée un système de détection d'intrusion mock
*/
export function createMockIntrusionDetectionSystem(): IIntrusionDetectionSystem {
    return {
        analyzeRequest: async (requestInfo: Record<string, unknown>): Promise<IntrusionDetectionResult> => {
            const path = requestInfo.path as string || '';
            const userId = requestInfo.userId as string || '';
            const body = requestInfo.body as string || '';

            // Simuler une menace pour les tests
            const isThreat = path.includes('admin') && !userId.includes('admin') ||
                path.includes('attack') ||
                body.includes('malicious');

            return {
                threatDetected: isThreat,
                threatLevel: isThreat ? 'HIGH' : 'LOW',
                details: isThreat ? 'Unauthorized admin access attempt' : 'No threat detected',
                confidence: isThreat ? 0.9 : 0.1,
                signatures: isThreat ? ['UNAUTHORIZED_ACCESS'] : [],
                mitigationSuggested: isThreat
            };
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        reportThreat: async (threatInfo: Record<string, unknown>) => {
            // Rien à faire dans le mock
        }
    };
}

/**
* Crée un limiteur de débit mock
*/
export function createMockRateLimiter(): IRateLimiter {
    const counters: Record<string, { count: number; reset: number }> = {};

    return {
        isAllowed: async (clientId: string, endpoint: string): Promise<boolean> => {
            const key = `${clientId}:${endpoint}`;

            // Réinitialiser le compteur si nécessaire
            const now = Date.now();
            if (!counters[key] || counters[key].reset < now) {
                counters[key] = { count: 0, reset: now + 60000 };
            }

            // Simuler une limitation pour les tests
            if (clientId === 'rate-limited-user' || endpoint.includes('limited') || key.includes('blocked')) {
                return false;
            }

            // Incrémenter le compteur
            counters[key].count++;

            // Limiter à 100 requêtes par minute
            return counters[key].count <= 100;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        recordRequest: async (clientId: string, endpoint: string): Promise<void> => {
            // Déjà géré par isAllowed
        },
        resetCounters: async (clientId: string): Promise<void> => {
            // Réinitialiser tous les compteurs pour ce client
            Object.keys(counters).forEach(counterKey => {
                if (counterKey.startsWith(`${clientId}:`)) {
                    delete counters[counterKey];
                }
            });
        },
        // Pour compatibilité avec l'ancienne interface
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        checkLimit: (key: string, limit: number) => {
            if (key.includes('blocked')) {
                return { allowed: false, remaining: 0, resetTime: Date.now() + 60000 };
            }
            return { allowed: true, remaining: 10, resetTime: Date.now() + 60000 };
        },
        incrementCounter: () => {
            // Rien à faire dans le mock
        }
    };
}

/**
* Crée un auditeur de sécurité mock
*/
export function createMockSecurityAuditor(): ISecurityAuditor {
    return {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        logSecurityEvent: async (eventType: string, details: Record<string, unknown>) => {
            // Rien à faire dans le mock
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        logRequest: async (requestInfo: Record<string, unknown>) => {
            // Rien à faire dans le mock
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        logResponse: async (responseInfo: Record<string, unknown>) => {
            // Rien à faire dans le mock
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        logError: async (errorInfo: Record<string, unknown>) => {
            // Rien à faire dans le mock
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        logSecurityIncident: async (incidentInfo: Record<string, unknown>) => {
            // Rien à faire dans le mock
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        logSensitiveDataExposure: async (exposureInfo: Record<string, unknown>) => {
            // Rien à faire dans le mock
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        logComplianceIssue: async (issueInfo: Record<string, unknown>) => {
            // Rien à faire dans le mock
        }
    };
}

/**
* Crée un validateur de conformité mock
*/
export function createMockComplianceValidator(): IComplianceValidator {
    return {
        validateRequest: async (
            userId: string,
            endpoint: string,
            requestBody?: Record<string, unknown>
        ): Promise<ComplianceValidationResult> => {
            // Simuler un problème de conformité pour les tests
            const hasSensitiveData = requestBody?.sensitiveData !== undefined;
            const hasUserConsent = requestBody?.userConsent === true;

            const isCompliant = !endpoint.includes('non-compliant') &&
                userId !== 'non-compliant-user' &&
                (!hasSensitiveData || hasUserConsent);

            return {
                compliant: isCompliant,
                issues: isCompliant ? [] : ['Personal data processing without consent'],
                regulations: ['GDPR', 'HIPAA'],
                riskLevel: isCompliant ? 'low' : 'high'
            };
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        logComplianceIssue: async (issueInfo: Record<string, unknown>) => {
            // Rien à faire dans le mock
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        getRegulationRequirements: (regulation: string) => ['user consent', 'data minimization']
    };
}

/**
* Crée un vérificateur de données sensibles mock
*/
export function createMockSensitiveDataChecker(): ISensitiveDataChecker {
    return {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        checkForSensitiveData: async (data: unknown, clearanceLevel?: string) => {
            // Convertir les données en chaîne pour vérifier les données sensibles
            const dataString = JSON.stringify(data);

            // Rechercher des mots-clés sensibles
            const containsPII = dataString.includes('ssn') ||
                dataString.includes('creditCard') ||
                dataString.includes('password');

            return {
                containsSensitiveData: containsPII,
                dataTypes: containsPII ? [
                    { type: 'PII', severity: 'high' }
                ] : []
            };
        }
    };
}

/**
* Crée un collecteur de métriques de sécurité mock
*/
export function createMockSecurityMetricsCollector(): ISecurityMetricsCollector {
    const metrics: Record<string, number[]> = {};
    const events: Record<string, SecurityEvent[]> = {};

    return {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        recordMetric: async (name: string, value: number, tags?: Record<string, string>) => {
            if (!metrics[name]) {
                metrics[name] = [];
            }
            metrics[name].push(value);
        },
        recordEvent: async (name: string, properties: Record<string, unknown> = {}) => {
            if (!events[name]) {
                events[name] = [];
            }
            events[name].push({
                timestamp: Date.now(),
                ...properties
            });
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        getMetricStats: async (name: string, timeRange?: { start: Date; end: Date }) => {
            const values = metrics[name] || [];

            if (values.length === 0) {
                return {
                    min: 0,
                    max: 0,
                    avg: 0,
                    sum: 0,
                    count: 0,
                    p95: 0,
                    p99: 0
                };
            }

            // Trier les valeurs pour les percentiles
            const sortedValues = [...values].sort((a, b) => a - b);

            // Calculer les statistiques
            const sum = values.reduce((acc, val) => acc + val, 0);
            const avg = sum / values.length;
            const min = sortedValues[0];
            const max = sortedValues[sortedValues.length - 1];

            // Calculer les percentiles
            const p95Index = Math.floor(sortedValues.length * 0.95);
            const p99Index = Math.floor(sortedValues.length * 0.99);

            return {
                min,
                max,
                avg,
                sum,
                count: values.length,
                p95: sortedValues[p95Index] || 0,
                p99: sortedValues[p99Index] || 0
            };
        }
    };
}

/**
* Crée un système de détection de fraude mock
*/
export function createMockFraudDetectionSystem(): IFraudDetectionSystem {
    return {
        analyzeTransaction: async (transactionInfo: Record<string, unknown>) => {
            // Simuler une fraude pour les tests
            const userId = transactionInfo.userId as string;
            const amount = transactionInfo.amount as number;

            const isFraudulent = userId === 'fraud-user' || (amount !== undefined && amount > 10000);

            // Pour résoudre le problème avec exactOptionalPropertyTypes, on ne définit
            // fraudType que lorsqu'il y a une fraude, sinon on laisse ce champ absent
            const result: {
                fraudDetected: boolean;
                fraudType?: string;
                confidence: number;
                riskScore: number;
                details: string;
            } = {
                fraudDetected: isFraudulent,
                confidence: isFraudulent ? 0.85 : 0.1,
                riskScore: isFraudulent ? 0.8 : 0.2,
                details: isFraudulent ? 'Suspicious transaction detected' : 'No fraud detected'
            };

            // Ajouter fraudType seulement si une fraude est détectée
            if (isFraudulent) {
                result.fraudType = 'UNUSUAL_AMOUNT';
            }

            return result;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        reportFraud: async (fraudInfo: Record<string, unknown>) => {
            // Rien à faire dans le mock
        }
    };
}

/**
* Crée un moniteur d'événements de sécurité mock
*/
export function createMockSecurityEventMonitor(): ISecurityEventMonitor {
    // Stocker les événements pour simulation
    const events: Record<string, Array<{ timestamp: number; data: Record<string, unknown> }>> = {};
    let isMonitoring = false;

    return {
        startMonitoring: async (): Promise<void> => {
            isMonitoring = true;
        },

        stopMonitoring: async (): Promise<void> => {
            isMonitoring = false;
        },

        recordEvent: async (eventType: string, eventData: Record<string, unknown>): Promise<void> => {
            if (!isMonitoring) {
                return;
            }

            if (!events[eventType]) {
                events[eventType] = [];
            }

            events[eventType].push({
                timestamp: Date.now(),
                data: eventData
            });
        },

        getEventStats: async (
            eventType: string,
            timeRange?: { start: Date; end: Date }
        ): Promise<{
            count: number;
            distribution: Record<string, number>;
            trend: { period: string; count: number }[];
        }> => {
            const eventsOfType = events[eventType] || [];

            // Filtrer par plage de temps si spécifiée
            const filteredEvents = timeRange
                ? eventsOfType.filter(
                    event =>
                        event.timestamp >= timeRange.start.getTime() &&
                        event.timestamp <= timeRange.end.getTime()
                )
                : eventsOfType;

            // Calculer la distribution par propriété (ex: IP, User Agent)
            const distribution: Record<string, number> = {};
            filteredEvents.forEach(event => {
                // Utiliser la première propriété comme clé de distribution
                const firstKey = Object.keys(event.data)[0] || 'unknown';
                const value = String(event.data[firstKey] || 'unknown');

                distribution[value] = (distribution[value] || 0) + 1;
            });

            // Calculer la tendance (par jour pour simplifier)
            const trend: { period: string; count: number }[] = [];
            const periodMap: Record<string, number> = {};

            filteredEvents.forEach(event => {
                const date = new Date(event.timestamp);
                const period = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

                periodMap[period] = (periodMap[period] || 0) + 1;
            });

            Object.entries(periodMap).forEach(([period, count]) => {
                trend.push({ period, count });
            });

            // Trier la tendance par période
            trend.sort((a, b) => a.period.localeCompare(b.period));

            return {
                count: filteredEvents.length,
                distribution,
                trend
            };
        }
    };
}

/**
* Fonctions d'exports supplémentaires pour compatibilité
*/

/**
* Crée une erreur de sécurité pour les tests
*/
export function createSecurityError(
    message = 'Security violation',
    code = 'SEC_ERROR',
    type = SecurityErrorType.GENERAL,
    statusCode = 403
) {
    return {
        code,
        message,
        type,
        statusCode,
        severity: 'medium' as const,
        details: {}, // Ajout d'un objet details vide pour être conforme à l'interface
        toSafeMessage: () => 'A security error occurred'
    };
}

/**
* Alias pour compatibilité avec le code existant
*/
export const createMockJWTService = createMockJwtService;