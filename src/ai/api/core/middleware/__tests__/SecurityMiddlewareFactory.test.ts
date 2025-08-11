import { SecurityMiddlewareFactory, createSecurityMiddleware } from '../SecurityMiddlewareFactory';
import { SecurityMiddlewareChain } from '../SecurityMiddlewareChain';
import { SecurityServiceKeys } from '../di/types';
import { SecurityServiceProvider } from '../di/SecurityServiceProvider';
import { RequestIdMiddleware } from '../middlewares/RequestIdMiddleware';
import { RateLimitingMiddleware } from '../middlewares/RateLimitingMiddleware';
import { AuthenticationMiddleware } from '../middlewares/AuthenticationMiddleware';
import { SecurityHeadersMiddleware } from '../middlewares/SecurityHeadersMiddleware';
import { ErrorHandlerMiddleware } from '../middlewares/ErrorHandlerMiddleware';

// Mock de l'interface IMiddleware
interface IMiddleware {
    process(context: unknown, next: () => Promise<void>): Promise<void>;
}

describe('SecurityMiddlewareFactory', () => {
    beforeEach(() => {
        // Réinitialiser les mocks
        jest.resetModules();
    });

    afterEach(() => {
        // Restaurer les mocks
        jest.restoreAllMocks();
    });

    test('should create a factory with default config', () => {
        // Arrange & Act
        const factory = new SecurityMiddlewareFactory();

        // Assert
        expect(factory).toBeInstanceOf(SecurityMiddlewareFactory);
    });

    test('should create a complete security middleware chain', () => {
        // Arrange
        const factory = new SecurityMiddlewareFactory();

        // Act
        const middleware = factory.createFullChain();

        // Assert
        expect(middleware).toBeInstanceOf(SecurityMiddlewareChain);
    });

    test('should use mocks when specified', () => {
        // Arrange
        const factory = new SecurityMiddlewareFactory({ useMocks: true });

        // Accès à la propriété privée via accesseur
        const serviceProvider = getPrivateProperty<SecurityServiceProvider>(
            factory,
            'serviceProvider'
        );

        // Act & Assert
        expect(serviceProvider.has(SecurityServiceKeys.JWT_SERVICE)).toBe(true);
        expect(serviceProvider.has(SecurityServiceKeys.TOKEN_VALIDATOR)).toBe(true);
        expect(serviceProvider.has(SecurityServiceKeys.RATE_LIMITER)).toBe(true);
        expect(serviceProvider.has(SecurityServiceKeys.SECURITY_AUDITOR)).toBe(true);
    });

    test('should create custom chain with specified features', () => {
        // Arrange
        const factory = new SecurityMiddlewareFactory();

        // Act
        const chain = factory.createCustomChain({
            chainName: 'TestChain',
            enableRateLimiting: true,
            enableAuthentication: false,
            enableSecurityHeaders: true
        });

        // Assert
        expect(chain).toBeInstanceOf(SecurityMiddlewareChain);

        // Accès à la propriété privée via accesseur
        const middlewares = getPrivateProperty<IMiddleware[]>(chain, 'middlewares');

        // Should have ErrorHandler, RequestId, RateLimiting, and SecurityHeaders, but not Authentication
        expect(middlewares.some(m => m instanceof ErrorHandlerMiddleware)).toBe(true);
        expect(middlewares.some(m => m instanceof RequestIdMiddleware)).toBe(true);
        expect(middlewares.some(m => m instanceof RateLimitingMiddleware)).toBe(true);
        expect(middlewares.some(m => m instanceof SecurityHeadersMiddleware)).toBe(true);
        expect(middlewares.some(m => m instanceof AuthenticationMiddleware)).toBe(false);
    });

    test('should respect environment configuration', () => {
        // Arrange
        // Utilisation de jest.spyOn pour simuler l'environnement
        const envSpy = jest.spyOn(process, 'env', 'get');
        envSpy.mockReturnValue({ ...process.env, NODE_ENV: 'production' });

        // Act
        const factory = new SecurityMiddlewareFactory();
        const chain = factory.createFullChain();

        // Restaurer le spy
        envSpy.mockRestore();

        // Assert
        // In production, we expect more strict security settings
        const middlewares = getPrivateProperty<IMiddleware[]>(chain, 'middlewares');

        // Should have rate limiting and token validation in production
        expect(middlewares.some(m => m instanceof RateLimitingMiddleware)).toBe(true);
        expect(middlewares.some(m => m instanceof AuthenticationMiddleware)).toBe(true);
    });

    test('should use custom services when provided', () => {
        // Arrange
        const mockJwtService = {
            generateToken: jest.fn(),
            verifyToken: jest.fn(),
            decodeToken: jest.fn()
        };

        const mockRateLimiter = {
            isAllowed: jest.fn(),
            recordRequest: jest.fn(),
            resetCounters: jest.fn()
        };

        // Act
        // Créer un mock du provider pour injecter directement les services
        const mockServiceProvider = new SecurityServiceProvider();
        mockServiceProvider.register(SecurityServiceKeys.JWT_SERVICE, () => mockJwtService);
        mockServiceProvider.register(SecurityServiceKeys.RATE_LIMITER, () => mockRateLimiter);

        const factory = new SecurityMiddlewareFactory({
            serviceProvider: mockServiceProvider
        });

        const serviceProvider = getPrivateProperty<SecurityServiceProvider>(
            factory,
            'serviceProvider'
        );

        // Assert
        expect(serviceProvider.get(SecurityServiceKeys.JWT_SERVICE)).toBe(mockJwtService);
        expect(serviceProvider.get(SecurityServiceKeys.RATE_LIMITER)).toBe(mockRateLimiter);
    });

    test('createSecurityMiddleware helper should create a valid middleware', () => {
        // Arrange & Act
        const middleware = createSecurityMiddleware();

        // Assert
        expect(middleware).toBeInstanceOf(SecurityMiddlewareChain);
    });

    test('createSecurityMiddleware helper should accept options', () => {
        // Arrange
        const mockJwtService = {
            generateToken: jest.fn(),
            verifyToken: jest.fn(),
            decodeToken: jest.fn()
        };

        // Act
        // Créer un mock du provider pour le test du helper
        const mockServiceProvider = new SecurityServiceProvider();
        mockServiceProvider.register(SecurityServiceKeys.JWT_SERVICE, () => mockJwtService);

        const middleware = createSecurityMiddleware({
            useMocks: true,
            config: {
                enableRateLimiting: false,
                validateTokens: false
            },
            serviceProvider: mockServiceProvider
        });

        // Assert
        expect(middleware).toBeInstanceOf(SecurityMiddlewareChain);
    });
});

/**
 * Fonction utilitaire qui permet d'accéder de façon typée aux propriétés privées d'un objet
 * à des fins de test uniquement.
 * 
 * @param obj Objet dont on veut accéder à une propriété privée
 * @param propName Nom de la propriété privée
 * @returns La valeur de la propriété, typée selon le type générique
 */
function getPrivateProperty<T>(obj: object, propName: string): T {
    return (obj as unknown as Record<string, T>)[propName];
}