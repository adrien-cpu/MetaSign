import { RateLimitingMiddleware, RateLimitExceededError } from '../middlewares/RateLimitingMiddleware';
import { SecurityServiceProvider } from '../di/SecurityServiceProvider';
import { SecurityServiceKeys } from '../di/types';
import { IRateLimiter } from '../interfaces';
import { IAPIContext, MetadataValue } from '@api/core/types';

// Mock pour le limiteur de débit
const createMockRateLimiter = (options: {
    allowedPaths?: string[];
    blockedPaths?: string[];
    blockedUsers?: string[];
}): IRateLimiter => {
    return {
        isAllowed: jest.fn().mockImplementation(async (clientId: string, path: string): Promise<boolean> => {
            // Simuler des chemins autorisés/bloqués pour les tests
            if (options.blockedPaths && options.blockedPaths.some(p => path.includes(p))) {
                return false;
            }

            if (options.blockedUsers && options.blockedUsers.includes(clientId)) {
                return false;
            }

            if (options.allowedPaths && options.allowedPaths.some(p => path.includes(p))) {
                return true;
            }

            // Par défaut, autoriser
            return true;
        }),
        recordRequest: jest.fn(),
        resetCounters: jest.fn()
    };
};

// Helper pour créer un contexte API
const createMockContext = (options: {
    path?: string;
    userId?: string;
    ip?: string;
}): IAPIContext => {
    const metadataMap = new Map<string, MetadataValue>();

    const context = {
        startTime: Date.now(),
        request: {
            method: 'GET',
            path: options.path || '/api/test',
            params: {},
            query: {},
            headers: {},
            userId: options.userId,
            ip: options.ip
        },
        response: null,
        errors: [],
        metadata: metadataMap,
        security: {},
        requestId: 'test-request-id',
        duration: 0,
        responseTime: 0,
        addError: jest.fn(),
        setMetadata: function (key: string, value: MetadataValue): void {
            metadataMap.set(key, value);
        },
        getMetadata: function (key: string): MetadataValue | undefined {
            return metadataMap.get(key);
        },
        toJSON: jest.fn(),

        // Ajout des méthodes requises par IAPIContext
        setResponse: jest.fn(),
        createSuccessResponse: jest.fn(),
        createErrorResponse: jest.fn()
    };

    // Cast à unknown puis à IAPIContext pour éviter les erreurs de typage
    return context as unknown as IAPIContext;
};

describe('RateLimitingMiddleware', () => {
    let serviceProvider: SecurityServiceProvider;
    let rateLimiter: IRateLimiter;
    let next: jest.Mock;

    beforeEach(() => {
        serviceProvider = new SecurityServiceProvider();
        rateLimiter = createMockRateLimiter({});
        serviceProvider.register(SecurityServiceKeys.RATE_LIMITER, () => rateLimiter);
        next = jest.fn();
    });

    test('should allow requests under limit', async () => {
        // Arrange
        const middleware = new RateLimitingMiddleware(serviceProvider);
        const context = createMockContext({
            userId: 'user-123',
            path: '/api/allowed'
        });

        // Act
        await middleware.process(context, next);

        // Assert
        expect(rateLimiter.isAllowed).toHaveBeenCalledWith('user-123', '/api/allowed');
        expect(next).toHaveBeenCalled();
    });

    test('should use IP when userId is not available', async () => {
        // Arrange
        const middleware = new RateLimitingMiddleware(serviceProvider);
        const context = createMockContext({
            ip: '192.168.1.1',
            path: '/api/test'
        });

        // Act
        await middleware.process(context, next);

        // Assert
        expect(rateLimiter.isAllowed).toHaveBeenCalledWith('192.168.1.1', '/api/test');
        expect(next).toHaveBeenCalled();
    });

    test('should use "anonymous" when neither userId nor IP is available', async () => {
        // Arrange
        const middleware = new RateLimitingMiddleware(serviceProvider);
        const context = createMockContext({
            path: '/api/test'
        });

        // Act
        await middleware.process(context, next);

        // Assert
        expect(rateLimiter.isAllowed).toHaveBeenCalledWith('anonymous', '/api/test');
        expect(next).toHaveBeenCalled();
    });

    test('should throw RateLimitExceeded error when limit is exceeded', async () => {
        // Arrange
        rateLimiter = createMockRateLimiter({
            blockedPaths: ['limited']
        });
        serviceProvider.register(SecurityServiceKeys.RATE_LIMITER, () => rateLimiter);

        const middleware = new RateLimitingMiddleware(serviceProvider);
        const context = createMockContext({
            userId: 'user-123',
            path: '/api/limited'
        });

        // Act & Assert
        await expect(middleware.process(context, next)).rejects.toThrow(RateLimitExceededError);
        await expect(middleware.process(context, next)).rejects.toMatchObject({
            code: 'RATE_LIMIT_EXCEEDED',
            statusCode: 429
        });
        expect(next).not.toHaveBeenCalled();
    });

    test('should add rate limit headers when limit is exceeded', async () => {
        // Arrange
        rateLimiter = createMockRateLimiter({
            blockedUsers: ['limited-user']
        });
        serviceProvider.register(SecurityServiceKeys.RATE_LIMITER, () => rateLimiter);

        const middleware = new RateLimitingMiddleware(serviceProvider, {
            defaultLimit: 100,
            windowMs: 60000
        });

        const context = createMockContext({
            userId: 'limited-user',
            path: '/api/test'
        });

        // Act
        try {
            await middleware.process(context, next);
            fail('Expected error was not thrown');
        } catch (error) {
            // Assert
            expect(error).toBeInstanceOf(RateLimitExceededError);
            expect(context.response).toBeDefined();
            if (context.response) {
                expect(context.response.status).toBe(429);
                expect(context.response.headers['X-RateLimit-Limit']).toBe('100');
                expect(context.response.headers['X-RateLimit-Remaining']).toBe('0');
                expect(context.response.headers['Retry-After']).toBe('60');
            }
        }
    });

    test('should respect path-specific limits', async () => {
        // Arrange
        const middleware = new RateLimitingMiddleware(serviceProvider, {
            defaultLimit: 100,
            pathLimits: {
                '/api/high-traffic': 500,
                '/api/low-traffic': 50
            }
        });

        // Paths to test
        const paths = [
            '/api/high-traffic',
            '/api/low-traffic',
            '/api/default'
        ];

        // Act & Assert
        for (let i = 0; i < paths.length; i++) {
            const context = createMockContext({
                path: paths[i]
            });

            await middleware.process(context, next);

            // Verify the right path was passed to the rate limiter
            expect(rateLimiter.isAllowed).toHaveBeenCalledWith('anonymous', paths[i]);
        }
    });

    test('should handle sub-path matching for path limits', async () => {
        // Arrange
        rateLimiter = createMockRateLimiter({
            blockedPaths: ['api/admin']
        });
        serviceProvider.register(SecurityServiceKeys.RATE_LIMITER, () => rateLimiter);

        const middleware = new RateLimitingMiddleware(serviceProvider, {
            pathLimits: {
                '/api': 100,
                '/api/admin': 10
            }
        });

        const context = createMockContext({
            path: '/api/admin/users'
        });

        // Act & Assert
        await expect(middleware.process(context, next)).rejects.toThrow(RateLimitExceededError);
    });
});