import { SecurityMiddlewareChain } from '../SecurityMiddlewareChain';
import { IMiddleware, NextFunction } from '../types/middleware.types';
import { IAPIContext, MetadataValue } from '@api/core/types';

// Mock pour un middleware simple
class MockMiddleware implements IMiddleware {
    public readonly name: string;
    public executed: boolean = false;
    public error: Error | null = null;

    constructor(name: string, shouldFail: boolean = false) {
        this.name = name;
        this.error = shouldFail ? new Error(`${name} failed`) : null;
    }

    async process(context: IAPIContext, next: NextFunction): Promise<void> {
        this.executed = true;

        if (context.metadata) {
            context.setMetadata('executionOrder',
                [...(context.getMetadata('executionOrder') as string[] || []), this.name]
            );
        }

        if (this.error) {
            throw this.error;
        }

        await next();
    }
}

// Le reste du fichier reste inchangé...

// Mock pour le contexte API
const createMockContext = (): IAPIContext => {
    const metadataMap = new Map<string, MetadataValue>();

    const context = {
        startTime: Date.now(),
        request: {
            method: 'GET',
            path: '/api/test',
            params: {},
            query: {},
            headers: {}
        },
        response: null,
        errors: [],
        metadata: metadataMap,
        security: {
            requireEncryption: false
        },
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

        // Ajout des méthodes manquantes
        setResponse: jest.fn(),
        createSuccessResponse: jest.fn(),
        createErrorResponse: jest.fn()
    };

    // Cast à travers unknown pour éviter les erreurs de typage
    const typedContext = context as unknown as IAPIContext;
    typedContext.setMetadata('executionOrder', []);

    return typedContext;
};

describe('SecurityMiddlewareChain', () => {
    test('should execute middlewares in order', async () => {
        // Arrange
        const middleware1 = new MockMiddleware('middleware1');
        const middleware2 = new MockMiddleware('middleware2');
        const middleware3 = new MockMiddleware('middleware3');

        const chain = new SecurityMiddlewareChain()
            .use(middleware1)
            .use(middleware2)
            .use(middleware3);

        const context = createMockContext();
        const next = jest.fn();

        // Act
        await chain.process(context, next);

        // Assert
        expect(middleware1.executed).toBe(true);
        expect(middleware2.executed).toBe(true);
        expect(middleware3.executed).toBe(true);
        expect(next).toHaveBeenCalled();

        const executionOrder = context.getMetadata('executionOrder') as string[];
        expect(executionOrder).toEqual(['middleware1', 'middleware2', 'middleware3']);
    });

    test('should stop execution chain when middleware throws error', async () => {
        // Arrange
        const middleware1 = new MockMiddleware('middleware1');
        const middleware2 = new MockMiddleware('middleware2', true); // Will throw error
        const middleware3 = new MockMiddleware('middleware3');

        const chain = new SecurityMiddlewareChain()
            .use(middleware1)
            .use(middleware2)
            .use(middleware3);

        const context = createMockContext();
        const next = jest.fn();

        // Act & Assert
        await expect(chain.process(context, next)).rejects.toThrow('middleware2 failed');

        expect(middleware1.executed).toBe(true);
        expect(middleware2.executed).toBe(true);
        expect(middleware3.executed).toBe(false);
        expect(next).not.toHaveBeenCalled();

        const executionOrder = context.getMetadata('executionOrder') as string[];
        expect(executionOrder).toEqual(['middleware1', 'middleware2']);
    });

    test('should allow conditional middleware addition with useIf', async () => {
        // Arrange
        const middleware1 = new MockMiddleware('middleware1');
        const middleware2 = new MockMiddleware('middleware2');
        const middleware3 = new MockMiddleware('middleware3');

        const chain = new SecurityMiddlewareChain()
            .use(middleware1)
            .useIf(false, middleware2) // Should not be added
            .useIf(true, middleware3);  // Should be added

        const context = createMockContext();
        const next = jest.fn();

        // Act
        await chain.process(context, next);

        // Assert
        expect(middleware1.executed).toBe(true);
        expect(middleware2.executed).toBe(false);
        expect(middleware3.executed).toBe(true);
        expect(next).toHaveBeenCalled();

        const executionOrder = context.getMetadata('executionOrder') as string[];
        expect(executionOrder).toEqual(['middleware1', 'middleware3']);
    });

    test('should add multiple middlewares with useAll', async () => {
        // Arrange
        const middleware1 = new MockMiddleware('middleware1');
        const middleware2 = new MockMiddleware('middleware2');
        const middleware3 = new MockMiddleware('middleware3');

        const chain = new SecurityMiddlewareChain()
            .useAll([middleware1, middleware2, middleware3]);

        const context = createMockContext();
        const next = jest.fn();

        // Act
        await chain.process(context, next);

        // Assert
        expect(middleware1.executed).toBe(true);
        expect(middleware2.executed).toBe(true);
        expect(middleware3.executed).toBe(true);
        expect(next).toHaveBeenCalled();

        const executionOrder = context.getMetadata('executionOrder') as string[];
        expect(executionOrder).toEqual(['middleware1', 'middleware2', 'middleware3']);
    });

    test('should handle nested middleware chains', async () => {
        // Arrange
        const middleware1 = new MockMiddleware('middleware1');
        const middleware2 = new MockMiddleware('middleware2');
        const middleware3 = new MockMiddleware('middleware3');

        const innerChain = new SecurityMiddlewareChain('InnerChain')
            .use(middleware2)
            .use(middleware3);

        const outerChain = new SecurityMiddlewareChain('OuterChain')
            .use(middleware1)
            .use(innerChain);

        const context = createMockContext();
        const next = jest.fn();

        // Act
        await outerChain.process(context, next);

        // Assert
        expect(middleware1.executed).toBe(true);
        expect(middleware2.executed).toBe(true);
        expect(middleware3.executed).toBe(true);
        expect(next).toHaveBeenCalled();

        const executionOrder = context.getMetadata('executionOrder') as string[];
        expect(executionOrder).toEqual(['middleware1', 'middleware2', 'middleware3']);
    });
});