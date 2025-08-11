// src/ai/api/resilience/core/SelfHealer.ts
import {
    Anomaly,
    HealingPlan,
    HealingAction,
    ActionTarget,
    ActionParameters,
    RollbackPlan,
    HealingActionType
} from '../types/ResilienceTypes';

export class SelfHealer {
    async createHealingPlan(anomalies: Anomaly[]): Promise<HealingPlan> {
        const actions = this.createActionsForAnomalies(anomalies);

        return {
            actions: actions,
            priority: this.calculatePlanPriority(actions),
            estimatedDuration: this.estimateDuration(actions)
        };
    }

    private createActionsForAnomalies(anomalies: Anomaly[]): HealingAction[] {
        const actions: HealingAction[] = [];

        for (const anomaly of anomalies) {
            const actionType = this.determineActionType(anomaly);
            const target = this.determineActionTarget(anomaly);
            const parameters = this.createActionParameters(anomaly, actionType);
            const rollbackPlan = this.createRollbackPlan(actionType, target);

            // Utiliser un identifiant unique basé sur la date et un nombre aléatoire
            // au lieu de chercher un id sur l'anomalie qui n'existe pas
            actions.push({
                id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: actionType,
                target: target,
                parameters: parameters,
                rollbackPlan: rollbackPlan,
                priority: this.calculateActionPriority(anomaly),
                createdAt: Date.now()
            });
        }

        return actions;
    }

    private determineActionType(anomaly: Anomaly): HealingActionType {
        // Logique simplifiée pour déterminer le type d'action
        if (anomaly.severity === 'high') {
            return 'restart'; // Pour les anomalies graves, un redémarrage est souvent nécessaire
        } else if (anomaly.severity === 'medium') {
            return 'reconfigure';
        } else {
            return 'throttle';
        }
    }

    private determineActionTarget(anomaly: Anomaly): ActionTarget {
        // Logique simplifiée pour déterminer la cible de l'action
        // Ne pas utiliser source et location qui n'existent pas sur Anomaly
        return {
            resource: `affected-resource-${anomaly.metrics.name || 'unknown'}`,
            type: 'service', // Type requis
            location: 'default',
            constraints: {}
        };
    }

    private createActionParameters(_anomaly: Anomaly, _actionType: HealingActionType): ActionParameters {
        // Préfixer les paramètres non utilisés avec un underscore
        // Création des paramètres d'action en fonction de l'anomalie et du type d'action
        return {
            timeout: 30000, // 30 secondes par défaut
            retryPolicy: {
                maxAttempts: 3,
                backoffMs: 1000,
                maxBackoffMs: 10000,
                factor: 2,
                jitter: 0.1
            },
            requireValidation: true
        };
    }

    private createRollbackPlan(actionType: HealingActionType, target: ActionTarget): RollbackPlan {
        // Création du plan de rollback en fonction du type d'action et de la cible
        return {
            steps: [`Restore previous state for ${target.resource} after ${actionType}`],
            checkpoints: ['Verify service status'],
            validationCriteria: ['Service responding with 200 OK']
        };
    }

    private calculateActionPriority(anomaly: Anomaly): number {
        // Calcul de la priorité de l'action en fonction de la gravité de l'anomalie
        const priorities = {
            'high': 3,
            'medium': 2,
            'low': 1
        };

        return priorities[anomaly.severity as 'high' | 'medium' | 'low'] || 1;
    }

    private calculatePlanPriority(actions: HealingAction[]): number {
        // Calcul de la priorité globale du plan
        if (actions.length === 0) return 0;

        // Moyenne des priorités des actions
        const sum = actions.reduce((acc, action) => acc + action.priority, 0);
        return Math.ceil(sum / actions.length);
    }

    private estimateDuration(actions: HealingAction[]): number {
        // Estimation de la durée d'exécution du plan
        const baseDuration = 5000; // 5 secondes de base

        // Estimation basée sur le nombre et le type d'actions
        return actions.reduce((total, action) => {
            const actionDurations = {
                'restart': 15000,
                'scale': 60000,
                'reconfigure': 10000,
                'failover': 30000,
                'throttle': 5000,
                // Durées pour les autres types d'actions
                'isolate': 20000,
                'reconnect': 10000,
                'purge': 15000,
                'redeploy': 90000,
                'migrate': 120000
            };

            return total + (actionDurations[action.type] || baseDuration);
        }, 0);
    }
}