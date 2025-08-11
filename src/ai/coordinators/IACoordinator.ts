// src/ai/coordinators/IACoordinator.ts
import { SystemType } from './types';
import { BaseAI } from '@ai/base/BaseAI';
import { EnhancedIACoordinator } from './interfaces/ISystemComponents';

export class IACoordinator implements EnhancedIACoordinator {
  private systems: Map<SystemType, BaseAI> = new Map();
  private eventHandlers: Map<string, ((data: Record<string, unknown>) => void)[]> = new Map();

  public async initialize(systems: Map<SystemType, BaseAI>): Promise<void> {
    this.systems = new Map(systems);
    console.log("IACoordinator initialized with systems:", Array.from(systems.keys()));
  }

  public on(event: string, handler: (data: Record<string, unknown>) => void): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.push(handler);
    this.eventHandlers.set(event, handlers);
  }

  // Ajoutez d'autres méthodes si nécessaires
}