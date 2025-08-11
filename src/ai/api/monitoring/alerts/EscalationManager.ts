// src/ai/api/monitoring/alerts/EscalationManager.ts

import { Alert, EscalationLevel, EscalationConfig } from './types';

export class EscalationManager {
    private readonly escalationLevels: EscalationLevel[];
    private readonly maxRetries: number;

    constructor(config: EscalationConfig) {
        this.escalationLevels = config.levels;
        this.maxRetries = config.maxRetries;
    }

    async escalate(alert: Alert): Promise<void> {
        for (const level of this.escalationLevels) {
            if (await this.tryEscalation(level, alert)) {
                return;
            }
        }

        throw new Error(`Failed to escalate alert ${alert.id} after ${this.maxRetries} retries at all levels`);
    }

    private async tryEscalation(level: EscalationLevel, alert: Alert): Promise<boolean> {
        for (let i = 0; i < this.maxRetries; i++) {
            try {
                const success = await level.notify(alert);
                if (success) {
                    return true;
                }
            } catch (error) {
                if (i === this.maxRetries - 1) {
                    console.error(`Failed to notify level ${level.name} for alert ${alert.id}:`, error);
                }
                continue;
            }
        }
        return false;
    }
}