// src/ai/api/core/middleware/tests/IntrusionDetectionMiddleware.test.ts
import { IntrusionDetectionMiddleware } from '../middlewares/IntrusionDetectionMiddleware';
import { MockIntrusionDetectionSystem } from '../mocks/MockIntrusionDetectionSystem';
import { APIContext } from '@api/core/APIContext';
// Importer l'enum de middleware.types au lieu de le redéfinir
import { ThreatLevel } from '../types/middleware.types';
import { SecurityServiceProvider } from '../di/SecurityServiceProvider';
import { SecurityServiceKeys } from '../di/types';

describe('IntrusionDetectionMiddleware', () => {
    // Setup mock context and services
    let context: APIContext;
    let serviceProvider: SecurityServiceProvider;
    let mockIntrusionSystem: MockIntrusionDetectionSystem;
    const mockNext = jest.fn();

    beforeEach(() => {
        // Reset mocks
        mockNext.mockReset();

        // Créer un objet de contexte en utilisant la classe APIContext directement
        // plutôt que de tenter de la construire manuellement
        const request = {
            path: '/api/test',
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: { test: 'data' },
            ip: '192.168.1.100',
            params: {},
            query: {}
        };

        context = new APIContext(request);
        context.requestId = 'test-request-id';
        context.security = {};

        // Setup service provider with mock
        serviceProvider = new SecurityServiceProvider();
        mockIntrusionSystem = new MockIntrusionDetectionSystem();
        serviceProvider.register(
            SecurityServiceKeys.INTRUSION_DETECTION, // Correction de la clé
            () => mockIntrusionSystem
        );
    });

    test('should allow requests when no intrusion detected', async () => {
        // Arrange
        const middleware = new IntrusionDetectionMiddleware(serviceProvider);

        // Act
        await middleware.process(context, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalled();
        expect(context.security?.intrusionDetection).toBeDefined();
        // Utiliser la propriété correcte selon l'interface IntrusionDetectionResult
        expect(context.security?.intrusionDetection?.threatDetected).toBe(false);
    });

    test('should block requests when intrusion detected with high threat', async () => {
        // Arrange
        mockIntrusionSystem = new MockIntrusionDetectionSystem({
            anomaliesDetected: true,
            threatLevel: ThreatLevel.HIGH
        });
        serviceProvider.register(
            SecurityServiceKeys.INTRUSION_DETECTION, // Correction de la clé
            () => mockIntrusionSystem
        );

        const middleware = new IntrusionDetectionMiddleware(serviceProvider);

        // Act & Assert
        await expect(middleware.process(context, mockNext))
            .rejects
            .toThrow('Security intrusion detected');

        expect(mockNext).not.toHaveBeenCalled();
        expect(context.security?.intrusionDetection).toBeDefined();
        // Utiliser la propriété correcte selon l'interface IntrusionDetectionResult
        expect(context.security?.intrusionDetection?.threatDetected).toBe(true);
        expect(context.response?.status).toBe(403);
    });

    test('should log warning but allow request with low threat level', async () => {
        // Arrange
        mockIntrusionSystem = new MockIntrusionDetectionSystem({
            anomaliesDetected: true,
            threatLevel: ThreatLevel.LOW
        });
        serviceProvider.register(
            SecurityServiceKeys.INTRUSION_DETECTION, // Correction de la clé
            () => mockIntrusionSystem
        );

        const middleware = new IntrusionDetectionMiddleware(serviceProvider, {
            // Utiliser les bonnes propriétés selon IntrusionDetectionConfig
            enableSignatureDetection: true,
            enableAnomalyDetection: true,
            signatureDatabase: 'default',
            alertThreshold: 0.1, // Seuil bas pour les menaces faibles
            actions: ['log'] // Seulement journaliser, ne pas bloquer
        });

        // Act
        await middleware.process(context, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalled();
        expect(context.security?.intrusionDetection).toBeDefined();
        // Utiliser la propriété correcte selon l'interface IntrusionDetectionResult
        expect(context.security?.intrusionDetection?.threatDetected).toBe(true);
        expect(context.security?.intrusionDetection?.threatLevel).toBe(ThreatLevel.LOW);
    });
});