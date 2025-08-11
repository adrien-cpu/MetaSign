// src/ai/coordinators/managers/EventManager.ts

import { EventEmitter } from 'events';
import { IEventManager } from '../interfaces/IOrchestrator';

export class EventManager implements IEventManager {
    private emitter: EventEmitter;
    private subscriptions: Map<string, { type: string; handler: (payload: Record<string, unknown>) => void }>;
    private nextSubscriptionId: number;

    constructor() {
        this.emitter = new EventEmitter();
        this.subscriptions = new Map();
        this.nextSubscriptionId = 1;

        // Augmenter la limite d'écouteurs pour éviter les avertissements
        this.emitter.setMaxListeners(100);
    }

    public emit(type: string, payload: Record<string, unknown>): void {
        this.emitter.emit(type, payload);
    }

    public subscribe(type: string, handler: (payload: Record<string, unknown>) => void): string {
        const subscriptionId = `sub_${this.nextSubscriptionId++}`;
        this.subscriptions.set(subscriptionId, { type, handler });
        this.emitter.on(type, handler);
        return subscriptionId;
    }

    public unsubscribe(subscriptionId: string): boolean {
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription) {
            return false;
        }
        const { type, handler } = subscription;
        this.emitter.off(type, handler);
        return this.subscriptions.delete(subscriptionId);
    }
}