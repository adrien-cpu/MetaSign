/**
 * @file: src/ai/coordinators/services/AlertManager.ts
 * 
 * Gestionnaire d'alertes pour l'orchestrateur
 * Gère les alertes système et les actions associées
 */

import { EventEmitter } from 'events';
import { Logger } from '@ai/utils/Logger';
import { MetricsCollector } from '@ai/coordinators/services/MetricsCollector';
import { Alert } from '@ai/coordinators/types/orchestrator.types';
import { SystemeControleEthique } from '@ai/ethics/core/SystemeControleEthique';
import { MonitoringUnifie } from '@ai/monitoring/MonitoringUnifie';
import { OptimizationService } from '@ai/coordinators/services/OptimizationService';

/**
 * Options de configuration du gestionnaire d'alertes
 */
export interface AlertManagerOptions {
    /** Capacité maximale de l'historique d'alertes */
    maxAlertHistory?: number;
    /** Activer les notifications administrateurs */
    enableAdminNotifications?: boolean;
    /** Activer le blocage automatique d'utilisateurs suspects */
    enableAutoUserBlocking?: boolean;
}

/**
 * Gestionnaire d'alertes système
 * Centralise la gestion des alertes et les actions associées
 */
export class AlertManager extends EventEmitter {
    private readonly logger = Logger.getInstance('AlertManager');
    private readonly alerts: Alert[] = [];
    private readonly options: Required<AlertManagerOptions>;

    /**
     * Crée une nouvelle instance du gestionnaire d'alertes
     */
    constructor(
        private readonly metrics: MetricsCollector,
        private readonly ethicsSystem: SystemeControleEthique,
        private readonly monitoringSystem: MonitoringUnifie,
        private readonly optimizationService: OptimizationService,
        options?: AlertManagerOptions
    ) {
        super();

        // Définir les options par défaut
        this.options = {
            maxAlertHistory: 500,
            enableAdminNotifications: true,
            enableAutoUserBlocking: false,
            ...options
        };

        this.logger.debug('AlertManager initialized', { options: this.options });
    }

    /**
     * Gère une alerte système
     * @param alert Alerte à traiter
     */
    public handleAlert(alert: Alert): void {
        // Enregistrer l'alerte dans l'historique
        this.alerts.push(alert);

        // Limiter la taille de l'historique
        if (this.alerts.length > this.options.maxAlertHistory) {
            this.alerts.splice(0, this.alerts.length - this.options.maxAlertHistory);
        }

        // Log de l'alerte
        if (alert.severity === 'critical' || alert.severity === 'error') {
            this.logger.error('System alert', { alert });
        } else {
            this.logger.warn('System alert', { alert });
        }

        // Enregistrer les métriques
        this.metrics.recordMetric('alerts_received', 1);
        this.metrics.recordMetric(`alert_severity_${alert.severity}`, 1);
        this.metrics.recordMetric(`alert_type_${alert.type}`, 1);

        // Émission d'un événement
        this.emit('alert', alert);

        // Actions spécifiques selon le type d'alerte
        switch (alert.type) {
            case 'component_failure':
                this.handleComponentFailureAlert(alert);
                break;

            case 'resource_limit':
                this.handleResourceLimitAlert(alert);
                break;

            case 'security_threat':
                this.handleSecurityThreatAlert(alert);
                break;

            case 'performance_degradation':
                this.handlePerformanceDegradationAlert(alert);
                break;
        }
    }

    /**
     * Récupère toutes les alertes actives
     * @returns Liste des alertes actives
     */
    public getActiveAlerts(): Alert[] {
        return [...this.alerts];
    }

    /**
     * Récupère l'historique des alertes
     * @param limit Nombre maximum d'alertes à récupérer
     * @returns Historique des alertes
     */
    public getAlertHistory(limit: number = 100): Alert[] {
        return this.alerts.slice(-Math.min(limit, this.alerts.length));
    }

    /**
     * Marque une alerte comme résolue
     * @param alertId Identifiant de l'alerte
     * @returns true si l'alerte a été résolue, false sinon
     */
    public resolveAlert(alertId: string): boolean {
        const alertIndex = this.alerts.findIndex(alert => alert.id === alertId);

        if (alertIndex === -1) {
            return false;
        }

        // Créer une nouvelle alerte résolue
        const alert = this.alerts[alertIndex];
        const resolvedAlert: Alert = {
            ...alert,
            severity: 'info',
            message: `Resolved: ${alert.message}`,
            context: {
                ...alert.context,
                resolved: true,
                resolvedAt: Date.now(),
                originalAlert: alert
            }
        };

        // Remplacer l'alerte originale
        this.alerts[alertIndex] = resolvedAlert;

        // Émettre un événement de résolution
        this.emit('alert:resolved', resolvedAlert);

        // Enregistrer la métrique
        this.metrics.recordMetric('alerts_resolved', 1);

        this.logger.info(`Alert resolved: ${alert.message}`, {
            alertId,
            alertType: alert.type
        });

        return true;
    }

    /**
     * Gère une alerte de défaillance de composant
     * @param alert Alerte de défaillance
     */
    private handleComponentFailureAlert(alert: Alert): void {
        if (typeof alert.context?.componentId !== 'string') {
            this.logger.error('Cannot handle component failure: missing componentId in alert context');
            return;
        }

        const componentId = alert.context.componentId as string;
        this.logger.info(`Component failure detected`, { componentId });

        // Enregistrer la détection de défaillance
        this.metrics.recordMetric('component_failures', 1);
        this.metrics.recordMetric(`component_failure_${componentId}`, 1);

        // Émettre un événement de défaillance de composant
        this.emit('component:failure', {
            componentId,
            alert,
            timestamp: Date.now()
        });
    }

    /**
     * Gère une alerte de limite de ressources
     * @param alert Alerte de limite de ressources
     */
    private handleResourceLimitAlert(alert: Alert): void {
        this.logger.warn('Resource limit alert', { alert });

        // Actions spécifiques selon le contexte
        if (alert.context?.resource === 'memory') {
            this.logger.info('Memory limit reached, optimizing memory usage');
            this.optimizationService.optimizeMemoryUsage();
        } else if (alert.context?.resource === 'cpu') {
            this.logger.info('CPU limit reached, optimizing CPU usage');
            this.optimizationService.optimizeCPUUsage();
        }

        // Émettre un événement de limite de ressources
        this.emit('resource:limit', {
            resource: alert.context?.resource || 'unknown',
            alert,
            timestamp: Date.now()
        });
    }

    /**
     * Gère une alerte de menace de sécurité
     * @param alert Alerte de menace de sécurité
     */
    private handleSecurityThreatAlert(alert: Alert): void {
        this.logger.error('Security threat detected', { alert });

        // Actions de sécurité
        if (alert.context?.userId && this.options.enableAutoUserBlocking) {
            const userId = alert.context.userId as string;
            this.logger.info('Blocking user due to security threat', { userId });
            this.blockUser(userId);
        }

        // Notification aux administrateurs
        if (this.options.enableAdminNotifications) {
            this.notifyAdministrators(alert);
        }

        // Augmenter la sécurité du système
        this.optimizationService.enhanceSecurityMeasures();

        // Émettre un événement de menace de sécurité
        this.emit('security:threat', {
            alert,
            timestamp: Date.now()
        });
    }

    /**
     * Gère une alerte de dégradation de performance
     * @param alert Alerte de dégradation de performance
     */
    private handlePerformanceDegradationAlert(alert: Alert): void {
        this.logger.warn('Performance degradation detected', { alert });

        // Identifier le composant concerné
        const componentId = alert.context?.componentId as string;

        if (componentId) {
            this.logger.info('Optimizing component performance', { componentId });

            // Appliquer des optimisations spécifiques selon le composant
            switch (componentId) {
                case 'cache':
                    // Émission d'un événement d'optimisation
                    this.emit('optimize:component', {
                        componentId,
                        type: 'cache',
                        timestamp: Date.now()
                    });
                    break;

                default:
                    // Optimisation générale
                    this.optimizationService.optimizePerformance();
            }
        } else {
            // Optimisation générale
            this.optimizationService.optimizePerformance();
        }

        // Émettre un événement de dégradation de performance
        this.emit('performance:degradation', {
            componentId: componentId || 'unknown',
            alert,
            timestamp: Date.now()
        });
    }

    /**
     * Bloque un utilisateur
     * @param userId Identifiant de l'utilisateur à bloquer
     */
    private blockUser(userId: string): void {
        this.logger.info('Blocking user', { userId });

        // Dans une implémentation réelle, implémenter le blocage d'utilisateur
        // via un système d'authentification et d'autorisation

        // Émettre un événement de blocage
        this.emit('user:blocked', {
            userId,
            timestamp: Date.now(),
            reason: 'security_threat'
        });

        // Enregistrer la métrique
        this.metrics.recordMetric('users_blocked', 1);
    }

    /**
     * Notifie les administrateurs
     * @param alert Alerte à notifier
     */
    private notifyAdministrators(alert: Alert): void {
        this.logger.info('Notifying administrators about security threat', { alertId: alert.id });

        // Dans une implémentation réelle, envoyer des notifications
        // via e-mail, SMS, ou un système de notification interne

        // Émettre un événement de notification
        this.emit('admin:notified', {
            alertId: alert.id,
            timestamp: Date.now()
        });

        // Enregistrer la métrique
        this.metrics.recordMetric('admin_notifications', 1);
    }
}