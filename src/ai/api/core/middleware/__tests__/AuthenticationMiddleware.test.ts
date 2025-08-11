/**
 * 
 */

import { AuthenticationMiddleware, AuthenticationError } from '../middlewares/AuthenticationMiddleware';
import { SecurityServiceProvider } from '../di/SecurityServiceProvider';
import { SecurityServiceKeys } from '../di/types';
import { ITokenValidator } from '../interfaces';
import {
    IAPIContext,
    MetadataValue,
    TokenValidationResult
} from '@api/core/types';

describe('AuthenticationMiddleware Unit Tests', () => {
    let serviceProvider: SecurityServiceProvider;
    let mockTokenValidator: ITokenValidator;
    let middleware: AuthenticationMiddleware;
    let context: IAPIContext<Record<string, unknown>, Record<string, unknown>>;
    let next: jest.Mock;

    beforeEach(() => {
        // Créer le mock pour le validateur de token
        mockTokenValidator = {
            validate: jest.fn().mockResolvedValue({
                valid: true,
                userId: 'test-user',
                roles: ['user'],
                permissions: ['read:api'],
                issuedAt: new Date(),
                expiresAt: new Date(Date.now() + 3600000),
                encryptionKey: 'test-key',
                clearanceLevel: 'confidential'
            } as TokenValidationResult)
        };

        // Créer le service provider et enregistrer le mock
        serviceProvider = new SecurityServiceProvider();
        serviceProvider.register(SecurityServiceKeys.TOKEN_VALIDATOR, () => mockTokenValidator);

        // Créer le middleware
        middleware = new AuthenticationMiddleware(serviceProvider, {
            publicPaths: ['/api/public', '/api/health']
        });

        // Créer un contexte de test avec des types concrets
        const contextObj = {
            startTime: Date.now(),
            request: {
                method: 'GET',
                path: '/api/users',
                params: {},
                query: {},
                headers: {
                    'authorization': 'Bearer valid.token'
                },
                ip: '127.0.0.1',
                userId: ''  // Chaîne vide au lieu de undefined
            },
            response: null,
            errors: [],
            metadata: new Map<string, MetadataValue>(),
            // Initialiser security comme un objet vide
            security: {
                // Omettre les propriétés optionnelles au lieu de les initialiser avec undefined
                requireEncryption: false
            },
            requestId: 'test-request-id',
            duration: 0,
            responseTime: 0,
            addError: jest.fn(),
            setMetadata: function (key: string, value: MetadataValue): void {
                this.metadata.set(key, value);
            },
            getMetadata: function (key: string): MetadataValue | undefined {
                return this.metadata.get(key);
            },
            toJSON: jest.fn(),

            // Ajout des méthodes requises par IAPIContext
            setResponse: jest.fn(),
            createSuccessResponse: jest.fn(),
            createErrorResponse: jest.fn()
        };

        // Cast à IAPIContext pour éviter les erreurs de typage
        context = contextObj as unknown as IAPIContext<Record<string, unknown>, Record<string, unknown>>;

        // Créer la fonction next
        next = jest.fn().mockResolvedValue(undefined);
    });

    test('devrait passer les requêtes à des chemins publics sans vérification de token', async () => {
        // Modifier le chemin pour qu'il soit public
        context.request.path = '/api/public';

        // Supprimer le token pour s'assurer qu'il n'est pas nécessaire
        context.request.headers = {};

        // Exécuter le middleware
        await middleware.process(context, next);

        // Vérifier que la fonction validate n'a pas été appelée
        expect(mockTokenValidator.validate).not.toHaveBeenCalled();

        // Vérifier que la fonction next a été appelée
        expect(next).toHaveBeenCalled();
    });

    test('devrait valider correctement un token JWT valide', async () => {
        // Exécuter le middleware
        await middleware.process(context, next);

        // Vérifier que la fonction validate a été appelée
        expect(mockTokenValidator.validate).toHaveBeenCalledWith('valid.token');

        // Vérifier que la fonction next a été appelée
        expect(next).toHaveBeenCalled();

        // Utiliser des assertions non-nulles pour indiquer à TypeScript que l'objet existe
        expect(context.security!).toBeDefined();
        expect(context.security!.tokenInfo).toBeDefined();
        expect(context.security!.tokenInfo?.valid).toBe(true);
        expect(context.security!.tokenInfo?.userId).toBe('test-user');
    });

    test('devrait définir l\'ID utilisateur à partir du token s\'il n\'est pas défini', async () => {
        // Réinitialiser l'ID utilisateur avec une chaîne vide
        context.request.userId = '';

        // Exécuter le middleware
        await middleware.process(context, next);

        // Vérifier que l'ID utilisateur a été défini
        expect(context.request.userId).toBe('test-user');
    });

    test('ne devrait pas écraser l\'ID utilisateur s\'il est déjà défini', async () => {
        // Définir l'ID utilisateur
        context.request.userId = 'existing-user';

        // Exécuter le middleware
        await middleware.process(context, next);

        // Vérifier que l'ID utilisateur n'a pas été écrasé
        expect(context.request.userId).toBe('existing-user');
    });

    test('devrait lever une erreur si aucun token n\'est fourni', async () => {
        // Supprimer le token
        context.request.headers = {};

        // Exécuter le middleware et s'attendre à une erreur
        await expect(middleware.process(context, next))
            .rejects.toThrow(AuthenticationError);

        // Vérifier que l'erreur est du bon type
        await expect(middleware.process(context, next))
            .rejects.toMatchObject({
                code: 'MISSING_TOKEN',
                statusCode: 401
            });

        // Vérifier que la fonction next n'a pas été appelée
        expect(next).not.toHaveBeenCalled();
    });

    test('devrait lever une erreur si le token est invalide', async () => {
        // Configurer le mock pour retourner un token invalide
        mockTokenValidator.validate = jest.fn().mockResolvedValue({
            valid: false,
            userId: '',
            roles: [],
            permissions: [],
            issuedAt: new Date(),
            expiresAt: new Date(),
            encryptionKey: '',
            clearanceLevel: ''
        } as TokenValidationResult);

        // Exécuter le middleware et s'attendre à une erreur
        await expect(middleware.process(context, next))
            .rejects.toThrow(AuthenticationError);

        // Vérifier que l'erreur est du bon type
        await expect(middleware.process(context, next))
            .rejects.toMatchObject({
                code: 'INVALID_TOKEN',
                statusCode: 401
            });

        // Vérifier que la fonction next n'a pas été appelée
        expect(next).not.toHaveBeenCalled();
    });

    test('devrait gérer les erreurs de validation', async () => {
        // Configurer le mock pour lancer une erreur
        mockTokenValidator.validate = jest.fn().mockRejectedValue(
            new Error('Token validation failed')
        );

        // Exécuter le middleware et s'attendre à une erreur
        await expect(middleware.process(context, next))
            .rejects.toThrow(AuthenticationError);

        // Vérifier que l'erreur est du bon type
        await expect(middleware.process(context, next))
            .rejects.toMatchObject({
                code: 'TOKEN_VALIDATION_FAILED',
                statusCode: 401
            });

        // Vérifier que la fonction next n'a pas été appelée
        expect(next).not.toHaveBeenCalled();
    });

    test('devrait accepter les tokens sans préfixe Bearer', async () => {
        // Modifier l'en-tête pour utiliser un token sans préfixe
        context.request.headers = {
            'authorization': 'simple-token'
        };

        // Exécuter le middleware
        await middleware.process(context, next);

        // Vérifier que la fonction validate a été appelée avec le bon token
        expect(mockTokenValidator.validate).toHaveBeenCalledWith('simple-token');

        // Vérifier que la fonction next a été appelée
        expect(next).toHaveBeenCalled();
    });

    test('devrait gérer correctement les caractères joker dans les chemins publics', async () => {
        // Créer un middleware avec un chemin public utilisant un joker
        const wildcardMiddleware = new AuthenticationMiddleware(serviceProvider, {
            publicPaths: ['/api/docs/*']
        });

        // Définir un chemin qui devrait correspondre au joker
        context.request.path = '/api/docs/v1/endpoints';

        // Supprimer le token pour s'assurer qu'il n'est pas nécessaire
        context.request.headers = {};

        // Exécuter le middleware
        await wildcardMiddleware.process(context, next);

        // Vérifier que la fonction validate n'a pas été appelée
        expect(mockTokenValidator.validate).not.toHaveBeenCalled();

        // Vérifier que la fonction next a été appelée
        expect(next).toHaveBeenCalled();
    });
});