import { SecurityMiddleware } from '../SecurityMiddleware';
import { IAPIContext, MetadataValue, APIResponse, ResponseBody } from '@api/core/types';
import { TokenValidator } from '@security/authentication/TokenValidator';
import { TokenValidationResult } from '@security/types/SecurityTypes';

// Interface pour les mocks du middleware (pour les tests uniquement)
// Définit les propriétés et méthodes auxquelles nous devons accéder pendant les tests
interface MockableSecurityMiddleware {
    rateLimiter: {
        isAllowed: jest.Mock;
    };
    intrusionDetection: {
        analyze: jest.Mock;
    };
    behaviorAnalyzer: {
        analyzeRequest: jest.Mock;
    };
    complianceValidator: {
        validateRequest: jest.Mock;
    };
    dataSanitizer: {
        sanitize: jest.Mock;
        checkForSensitiveData: jest.Mock;
    };
    encryptionService: {
        decrypt: jest.Mock;
        encrypt: jest.Mock;
    };
    securityAuditor: {
        logRequest: jest.Mock;
        logResponse: jest.Mock;
        logComplianceIssue: jest.Mock;
    };
    securityEventMonitor: {
        reportThreat: jest.Mock;
        reportAnomaly: jest.Mock;
    };
}

// Mocks
jest.mock('@security/authentication/JWTService');
jest.mock('@security/authentication/TokenValidator');
jest.mock('@security/encryption/EncryptionService');
jest.mock('@security/data/DataSanitizer');
jest.mock('@security/behavior/SecurityBehaviorAnalyzer');
jest.mock('@security/ids/IntrusionDetectionSystem');
jest.mock('@security/protection/RateLimiter');
jest.mock('@security/audit/SecurityAuditor');
jest.mock('@security/fraud/FraudDetectionSystem');
jest.mock('@security/compliance/SecurityComplianceValidator');
jest.mock('@security/monitoring/SecurityEventMonitor');
jest.mock('@api/common/monitoring/LogService');

describe('SecurityMiddleware', () => {
    let middleware: SecurityMiddleware;
    let middlewareMock: MockableSecurityMiddleware;
    let context: IAPIContext;
    let nextFunction: jest.Mock;
    let startTimeValue: number;

    beforeEach(() => {
        middleware = new SecurityMiddleware();
        middlewareMock = middleware as unknown as MockableSecurityMiddleware;

        startTimeValue = Date.now();

        // Créer un contexte API de test avec sécurité bien initialisée
        const contextObj = {
            requestId: 'test-request-id',
            request: {
                path: '/api/test',
                method: 'GET',
                token: 'valid.jwt.token',
                ip: '127.0.0.1',
                headers: {
                    'user-agent': 'test-agent',
                    'content-type': 'application/json'
                },
                params: {}, // Ajout de params obligatoire
                query: { key: 'value' },
                body: { test: 'data' },
            },
            security: {
                tokenInfo: undefined,
                intrusionDetection: undefined,
                behaviorAnalysis: undefined,
                compliance: undefined,
                requireEncryption: false
            },
            response: null,
            errors: [],
            metadata: new Map<string, MetadataValue>(),
            startTime: startTimeValue,
            // Utilisation d'une valeur capturée pour éviter l'erreur "startTime n'existe pas sur {}"
            get responseTime(): number {
                return Date.now() - startTimeValue;
            },
            duration: 0,
            addError: jest.fn(),
            setMetadata: jest.fn(),
            getMetadata: jest.fn(),
            toJSON: jest.fn(),

            // Ajout des méthodes requises par IAPIContext
            setResponse: jest.fn(),
            createSuccessResponse: jest.fn(),
            createErrorResponse: jest.fn()
        };

        // Cast à unknown puis à IAPIContext pour éviter les erreurs de typage
        context = contextObj as unknown as IAPIContext;

        nextFunction = jest.fn().mockResolvedValue(undefined);

        // Mock des méthodes du TokenValidator
        (TokenValidator.prototype as unknown as { validate: jest.Mock }).validate = jest.fn().mockResolvedValue({
            valid: true,
            userId: 'test-user',
            roles: ['user'],
            permissions: ['read'],
            clearanceLevel: 'confidential',
            encryptionKey: 'test-key'
        } as TokenValidationResult);

        // Initialisation des mocks avec l'interface typée
        middlewareMock.rateLimiter = {
            isAllowed: jest.fn().mockResolvedValue(true)
        };

        middlewareMock.intrusionDetection = {
            analyze: jest.fn().mockResolvedValue({
                threatDetected: false,
                threatLevel: 'LOW',
                details: 'No threat detected',
                confidence: 0.1
            })
        };

        middlewareMock.behaviorAnalyzer = {
            analyzeRequest: jest.fn().mockResolvedValue({
                anomalyDetected: false,
                anomalyConfidence: 0.1,
                details: 'No anomaly detected',
                riskScore: 0.1
            })
        };

        middlewareMock.complianceValidator = {
            validateRequest: jest.fn().mockResolvedValue({
                compliant: true,
                issues: [],
                regulations: ['GDPR'],
                riskLevel: 'low'
            })
        };

        middlewareMock.dataSanitizer = {
            sanitize: jest.fn().mockImplementation((data: unknown) => data),
            checkForSensitiveData: jest.fn().mockResolvedValue({
                containsSensitiveData: false,
                dataTypes: []
            })
        };

        middlewareMock.encryptionService = {
            decrypt: jest.fn().mockImplementation((data: unknown) => data),
            encrypt: jest.fn().mockImplementation((data: unknown) => data)
        };

        middlewareMock.securityAuditor = {
            logRequest: jest.fn(),
            logResponse: jest.fn(),
            logComplianceIssue: jest.fn()
        };

        middlewareMock.securityEventMonitor = {
            reportThreat: jest.fn(),
            reportAnomaly: jest.fn()
        };
    });

    test('devrait traiter une requête valide avec succès', async () => {
        await middleware.process(context, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(context.security).toBeDefined();
        expect(context.security!.tokenInfo).toBeDefined();
        expect(context.security!.tokenInfo!.valid).toBe(true);
    });

    test('devrait rejeter une requête avec un token invalide', async () => {
        // Modifier le mock pour retourner un token invalide
        (TokenValidator.prototype as unknown as { validate: jest.Mock }).validate = jest.fn().mockResolvedValue({
            valid: false,
            reason: 'Token expired'
        } as TokenValidationResult);

        await middleware.process(context, nextFunction);

        expect(nextFunction).not.toHaveBeenCalled();
        expect(context.response).toBeDefined();
        // Utilisation de l'assertion non-null car on a vérifié que c'est défini
        expect(context.response!.statusCode).toBe(401);
    });

    test('devrait rejeter une requête qui dépasse les limites de taux', async () => {
        // Mock pour simuler un dépassement de limite de taux
        middlewareMock.rateLimiter.isAllowed = jest.fn().mockResolvedValue(false);

        await middleware.process(context, nextFunction);

        expect(nextFunction).not.toHaveBeenCalled();
        expect(context.response).toBeDefined();
        expect(context.response!.statusCode).toBe(429);
    });

    test('devrait détecter une tentative d\'intrusion', async () => {
        // Mock pour simuler une détection d'intrusion
        middlewareMock.intrusionDetection.analyze = jest.fn().mockResolvedValue({
            threatDetected: true,
            threatLevel: 'HIGH',
            details: 'SQL injection detected',
            confidence: 0.95
        });

        await middleware.process(context, nextFunction);

        expect(nextFunction).not.toHaveBeenCalled();
        expect(context.response).toBeDefined();
        expect(context.response!.statusCode).toBe(403);
        expect(middlewareMock.securityEventMonitor.reportThreat).toHaveBeenCalled();
    });

    test('devrait détecter un comportement suspect', async () => {
        // Mock pour simuler une détection de comportement suspect
        middlewareMock.behaviorAnalyzer.analyzeRequest = jest.fn().mockResolvedValue({
            anomalyDetected: true,
            anomalyType: 'UNUSUAL_LOCATION',
            anomalyConfidence: 0.9,
            details: 'Access from unusual location',
            riskScore: 0.8
        });

        await middleware.process(context, nextFunction);

        expect(nextFunction).not.toHaveBeenCalled();
        expect(context.response).toBeDefined();
        expect(context.response!.statusCode).toBe(403);
        expect(middlewareMock.securityEventMonitor.reportAnomaly).toHaveBeenCalled();
    });

    test('devrait détecter un problème de conformité', async () => {
        // Mock pour simuler un problème de conformité
        middlewareMock.complianceValidator.validateRequest = jest.fn().mockResolvedValue({
            compliant: false,
            issues: ['PII data accessed without consent'],
            regulations: ['GDPR'],
            riskLevel: 'high'
        });

        await middleware.process(context, nextFunction);

        expect(nextFunction).not.toHaveBeenCalled();
        expect(context.response).toBeDefined();
        expect(context.response!.statusCode).toBe(403);
        expect(middlewareMock.securityAuditor.logComplianceIssue).toHaveBeenCalled();
    });

    test('devrait chiffrer la réponse quand demandé', async () => {
        // S'assurer que headers existe
        if (!context.request.headers) {
            context.request.headers = {};
        }

        // Modifier le contexte pour demander une réponse chiffrée
        context.request.headers['request-encrypted-response'] = 'true';

        // Ajouter une réponse simulée
        context.response = {
            status: 200,
            statusCode: 200,
            body: { result: 'success' },
            headers: {}
        } as APIResponse<ResponseBody>;

        await middleware.process(context, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(context.response!.headers['content-encryption']).toBe('true');
    });

    test('devrait ajouter des en-têtes de sécurité à la réponse', async () => {
        await middleware.process(context, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(context.response).toBeDefined();
        expect(context.response!.headers).toBeDefined();
        expect(context.response!.headers['Strict-Transport-Security']).toBeDefined();
        expect(context.response!.headers['X-Content-Type-Options']).toBeDefined();
        expect(context.response!.headers['X-Frame-Options']).toBeDefined();
        expect(context.response!.headers['Content-Security-Policy']).toBeDefined();
        expect(context.response!.headers['X-XSS-Protection']).toBeDefined();
    });

    test('devrait journaliser les activités pour audit', async () => {
        await middleware.process(context, nextFunction);

        expect(middlewareMock.securityAuditor.logRequest).toHaveBeenCalled();
        expect(middlewareMock.securityAuditor.logResponse).toHaveBeenCalled();
    });
});