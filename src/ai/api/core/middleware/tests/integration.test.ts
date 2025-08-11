// src/ai/api/core/middleware/tests/integration.test.ts
import { SecurityMiddlewareChain } from '../SecurityMiddlewareChain';
import { RequestIdMiddleware } from '../middlewares/RequestIdMiddleware';
import { SecurityHeadersMiddleware } from '../middlewares/SecurityHeadersMiddleware';
import { RateLimitingMiddleware } from '../middlewares/RateLimitingMiddleware';
import { IntrusionDetectionMiddleware } from '../middlewares/IntrusionDetectionMiddleware';
import { DataSanitizationMiddleware } from '../middlewares/DataSanitizationMiddleware';
import { SecurityServiceProvider } from '../di/SecurityServiceProvider';
import { MockIntrusionDetectionSystem } from '../mocks/MockIntrusionDetectionSystem';
import { SecurityServiceKeys } from '../di/types';
import { APIContext } from '@api/core/APIContext';

describe('Security Middleware Integration', () => {
    // Setup common test items
    let serviceProvider: SecurityServiceProvider;
    let context: APIContext;
    let processedMiddlewares: string[];

    beforeEach(() => {
        // Reset tracking
        processedMiddlewares = [];

        // Create a fresh service provider for each test
        serviceProvider = new SecurityServiceProvider();

        // Register mocks
        serviceProvider.register(
            SecurityServiceKeys.INTRUSION_DETECTION, // Correction: utiliser INTRUSION_DETECTION au lieu de INTRUSION_DETECTION_SYSTEM
            () => new MockIntrusionDetectionSystem()
        );

        // Create test context with a proper APIContext instance
        context = new APIContext({
            path: '/api/test',
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'user-agent': 'test-agent'
            },
            body: { test: 'data' },
            ip: '192.168.1.1',
            id: '' // Chaîne vide au lieu de undefined
        });

        // Initialiser la réponse et le contexte de sécurité
        context.setResponse({
            status: 200,
            statusCode: 200,
            headers: {},
            body: null,
            timestamp: Date.now(),
            duration: 0,
            metadata: {}
        });
        context.security = {};
    });

    test('middlewares should execute in the correct order', async () => {
        // Arrange
        const chain = new SecurityMiddlewareChain()
            .use(createTrackingMiddleware('RequestId'))
            .use(new RequestIdMiddleware())
            .use(createTrackingMiddleware('SecurityHeaders'))
            .use(new SecurityHeadersMiddleware())
            .use(createTrackingMiddleware('RateLimiting'))
            .use(new RateLimitingMiddleware(serviceProvider))
            .use(createTrackingMiddleware('IntrusionDetection'))
            .use(new IntrusionDetectionMiddleware(serviceProvider))
            .use(createTrackingMiddleware('DataSanitization'))
            .use(new DataSanitizationMiddleware());

        // Act
        await chain.process(context, async () => { }); // Correction: ajouter une fonction vide comme deuxième argument

        // Assert
        // Check order of execution
        expect(processedMiddlewares).toEqual([
            'RequestId',
            'SecurityHeaders',
            'RateLimiting',
            'IntrusionDetection',
            'DataSanitization'
        ]);

        // Verify RequestId middleware effect
        expect(context.request.id).toBeDefined();

        // Verify SecurityHeaders middleware effect
        if (context.response) { // Correction: vérifier si response existe
            expect(context.response.headers['strict-transport-security']).toBeDefined();
            expect(context.response.headers['x-content-type-options']).toBe('nosniff');
        }

        // Verify IntrusionDetection middleware effect
        if (context.security) { // Correction: vérifier si security existe
            expect(context.security.intrusionDetection).toBeDefined();
            expect(context.security.intrusionDetection?.threatDetected).toBe(false); // Correction: utiliser threatDetected au lieu de isIntrusion
        }
    });

    test('middleware chain should stop processing on error', async () => {
        // Arrange
        const errorMessage = 'Test middleware error';
        const chain = new SecurityMiddlewareChain()
            .use(createTrackingMiddleware('First'))
            .use(createErrorMiddleware(errorMessage))
            .use(createTrackingMiddleware('ShouldNotRun'));

        // Act & Assert
        await expect(chain.process(context, async () => { })) // Correction: ajouter une fonction vide
            .rejects
            .toThrow(errorMessage);

        // Check that only the first middleware ran
        expect(processedMiddlewares).toEqual(['First']);
    });

    test('context should be properly modified by all middlewares', async () => {
        // Arrange
        const chain = new SecurityMiddlewareChain()
            .use(createContextModifierMiddleware('header1', 'value1'))
            .use(createContextModifierMiddleware('header2', 'value2'))
            .use(createContextModifierMiddleware('header3', 'value3'));

        // Act
        await chain.process(context, async () => { }); // Correction: ajouter une fonction vide

        // Assert
        if (context.response) { // Correction: vérifier si response existe
            expect(context.response.headers).toEqual({
                'header1': 'value1',
                'header2': 'value2',
                'header3': 'value3'
            });
        }
    });

    // Helper function to create a middleware that tracks execution
    function createTrackingMiddleware(name: string) {
        return {
            process: async (ctx: APIContext, next: () => Promise<void>) => {
                processedMiddlewares.push(name);
                await next();
            }
        };
    }

    // Helper function to create a middleware that throws an error
    function createErrorMiddleware(errorMessage: string) {
        return {
            process: async () => { // Suppression des paramètres inutilisés pour éviter les warnings ESLint
                throw new Error(errorMessage);
            }
        };
    }

    // Helper function to create a middleware that modifies the context
    function createContextModifierMiddleware(headerName: string, headerValue: string) {
        return {
            process: async (ctx: APIContext, next: () => Promise<void>) => {
                if (ctx.response) { // Correction: vérifier si response existe
                    ctx.response.headers[headerName] = headerValue;
                }
                await next();
            }
        };
    }
});