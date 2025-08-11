// src/ai/coordinators/services/metrics/alerts/ThresholdManager.ts
import { Logger } from '@ai/utils/Logger';
import { MetricValue, MetricTags } from '@ai/coordinators/types';
import { Observable, Observer } from '@ai/utils/Observable';

export type ThresholdOperator = 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
export type ThresholdSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface ThresholdConfig {
    namespace: string;
    metric: string;
    operator: ThresholdOperator;
    value: number;
    duration?: number; // En millisecondes
    severity: ThresholdSeverity;
    tags?: MetricTags;
}

export interface ThresholdEvent {
    config: ThresholdConfig;
    currentValue: number;
    timestamp: number;
    exceeded: boolean;
}

export class ThresholdManager extends Observable<ThresholdEvent> {
    private readonly logger = Logger.getInstance('ThresholdManager');
    private readonly thresholds: ThresholdConfig[] = [];
    private readonly state: Map<string, {
        exceeded: boolean,
        since?: number,
        lastChecked: number
    }> = new Map();

    public addThreshold(config: ThresholdConfig): void {
        this.thresholds.push(config);
        this.logger.debug(`Added threshold for ${config.namespace}.${config.metric}`, config);
    }

    public removeThreshold(config: ThresholdConfig): void {
        const index = this.thresholds.findIndex(t =>
            t.namespace === config.namespace &&
            t.metric === config.metric &&
            t.operator === config.operator &&
            t.value === config.value
        );

        if (index !== -1) {
            this.thresholds.splice(index, 1);
            this.logger.debug(`Removed threshold for ${config.namespace}.${config.metric}`);
        }
    }

    public checkThreshold(namespace: string, metric: string, value: number, tags: MetricTags = {}): void {
        const now = Date.now();

        for (const threshold of this.thresholds) {
            if (threshold.namespace !== namespace || threshold.metric !== metric) {
                continue;
            }

            // Vérifier si les tags correspondent
            if (threshold.tags && !this.tagsMatch(tags, threshold.tags)) {
                continue;
            }

            const thresholdKey = this.getThresholdKey(threshold);
            let state = this.state.get(thresholdKey);

            if (!state) {
                state = { exceeded: false, lastChecked: now };
                this.state.set(thresholdKey, state);
            }

            const exceeded = this.evaluateThreshold(value, threshold.operator, threshold.value);

            // Si le seuil vient d'être dépassé, enregistrer le moment
            if (exceeded && !state.exceeded) {
                state.exceeded = true;
                state.since = now;
            }

            // Si le seuil n'est plus dépassé, réinitialiser
            if (!exceeded && state.exceeded) {
                state.exceeded = false;
                state.since = undefined;
            }

            // Vérifier si le seuil est dépassé depuis assez longtemps
            if (state.exceeded && state.since) {
                const exceedDuration = now - state.since;

                if (!threshold.duration || exceedDuration >= threshold.duration) {
                    const event: ThresholdEvent = {
                        config: threshold,
                        currentValue: value,
                        timestamp: now,
                        exceeded: true
                    };

                    this.notifyObservers(event);
                }
            }

            state.lastChecked = now;
        }
    }

    private evaluateThreshold(value: number, operator: ThresholdOperator, threshold: number): boolean {
        switch (operator) {
            case 'gt': return value > threshold;
            case 'lt': return value < threshold;
            case 'eq': return value === threshold;
            case 'gte': return value >= threshold;
            case 'lte': return value <= threshold;
            default: return false;
        }
    }

    private tagsMatch(tags: MetricTags, requiredTags: MetricTags): boolean {
        for (const [key, value] of Object.entries(requiredTags)) {
            if (tags[key] !== value) {
                return false;
            }
        }
        return true;
    }

    private getThresholdKey(threshold: ThresholdConfig): string {
        return `${threshold.namespace}.${threshold.metric}.${threshold.operator}.${threshold.value}`;
    }
}