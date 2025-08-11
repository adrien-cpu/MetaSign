// src/ai/api/core/APIRegistry.ts
import { APIHandler, APIHandlerType } from '@api/core/types';

/**
 * Registry for API handlers that manages different types of handlers
 * for various subsystems like LSF, ethics, emotions, etc.
 */
export class APIRegistry {
    private handlers: Map<string, APIHandler>;
    private static validHandlerTypes: APIHandlerType[] = [
        'LSF',
        'ETHICS',
        'EMOTION',
        'CULTURAL'
    ];

    /**
     * Initialize a new API registry with an empty handler map
     */
    constructor() {
        this.handlers = new Map<string, APIHandler>();
    }

    /**
     * Register a handler for a specific type
     * @param type The type of handler
     * @param handler The handler implementation
     * @throws Error if the handler type is invalid
     */
    registerHandler(type: APIHandlerType, handler: APIHandler): void {
        if (!APIRegistry.validHandlerTypes.includes(type)) {
            throw new Error(`Invalid handler type: ${type}`);
        }
        this.handlers.set(type, handler);
    }

    /**
     * Get a handler for a specific type
     * @param type The type of handler to retrieve
     * @returns The registered handler
     * @throws Error if no handler is registered for the specified type
     */
    getHandler(type: APIHandlerType): APIHandler {
        const handler = this.handlers.get(type);
        if (!handler) {
            throw new Error(`No handler registered for type: ${type}`);
        }
        return handler;
    }

    /**
     * Check if a handler exists for a specific type
     * @param type The type of handler to check
     * @returns True if a handler is registered for the type, false otherwise
     */
    hasHandler(type: APIHandlerType): boolean {
        return this.handlers.has(type);
    }
}