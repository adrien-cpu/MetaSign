import {
    Alert,
    AlertType,
    AlertProcessor,
    EnrichedAlert,
    ProcessedAlert,
    AlertSeverity,
    EscalationThresholds
} from './types';
import { NotificationService } from './NotificationService';
import { EscalationManager } from './EscalationManager.js';
import { Logger } from '@ai/utils/Logger';

/**
 * Gestionnaire central des alertes système
 */
export class AlertManager {
    private readonly logger = new Logger('AlertManager');
    private readonly alertProcessors: Map<AlertType, AlertProcessor>;
    private readonly escalationThresholds: EscalationThresholds;

    /**
     * Crée une nouvelle instance du gestionnaire d'alertes
     */
    constructor(
        private readonly notificationService: NotificationService,
        private readonly escalationManager: EscalationManager,
        processors: AlertProcessor[]
    ) {
        this.alertProcessors = new Map();

        // Initialisation des processeurs d'alertes
        for (const processor of processors) {
            for (const alertType of Object.values(AlertType)) {
                if (processor.canHandle(alertType)) {
                    this.alertProcessors.set(alertType, processor);
                }
            }
        }

        // Configuration par défaut des seuils d'escalade
        this.escalationThresholds = {
            [AlertType.PERFORMANCE]: 3,
            [AlertType.SECURITY]: 1,
            [AlertType.RESOURCE]: 5,
            [AlertType.AVAILABILITY]: 2,
            [AlertType.ERROR]: 3,
            [AlertType.SYSTEM]: 2
        };

        this.logger.info('AlertManager initialized');
    }

    /**
     * Traite une alerte entrante
     */
    public async handleAlert(alert: Alert): Promise<void> {
        try {
            this.logger.debug(`Processing alert: ${alert.id} of type ${alert.type}`);

            const enrichedAlert = this.createEnrichedAlert(alert);
            const processor = this.getProcessor(enrichedAlert.type);

            if (!processor) {
                throw new Error(`No processor found for alert type: ${enrichedAlert.type}`);
            }

            const processedAlert = await processor.process(enrichedAlert);

            if (this.shouldEscalate(processedAlert)) {
                this.logger.info(`Escalating alert: ${processedAlert.id} with severity ${processedAlert.severity}`);
                await this.escalationManager.escalate(processedAlert);
            } else {
                this.logger.debug(`Notifying alert: ${processedAlert.id}`);
                await this.notificationService.notify(processedAlert);
            }
        } catch (error) {
            this.logger.error(`Error handling alert ${alert.id}:`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * Crée une alerte enrichie à partir d'une alerte de base
     * 
     * Méthode synchrone pour éviter les problèmes d'inférence de type
     */
    private createEnrichedAlert(alert: Alert): EnrichedAlert {
        // Contexte statique défini comme Record<string, unknown>
        const contextData: Record<string, unknown> = {
            systemLoad: Math.random() * 100,
            memoryUsage: Math.random() * 100,
            timestamp: new Date().toISOString(),
            environmentInfo: process.env.NODE_ENV || 'development'
        };

        // Créer l'objet enrichi avec ses propriétés obligatoires
        return {
            // Copier toutes les propriétés de l'alerte de base
            ...alert,

            // Propriétés spécifiques à EnrichedAlert
            context: contextData,
            severity: this.calculateSeverity(alert),
            relatedAlerts: []
        };
    }

    /**
     * Récupère le processeur associé à un type d'alerte
     */
    private getProcessor(type: AlertType): AlertProcessor | undefined {
        return this.alertProcessors.get(type);
    }

    /**
     * Calcule la sévérité d'une alerte en fonction de son type et de ses données
     */
    private calculateSeverity(alert: Alert): AlertSeverity {
        if (alert.type === AlertType.SECURITY) {
            return AlertSeverity.HIGH;
        }

        if (alert.consecutiveCount && alert.consecutiveCount > 3) {
            return AlertSeverity.HIGH;
        }

        switch (alert.type) {
            case AlertType.ERROR:
                return AlertSeverity.MEDIUM;
            case AlertType.AVAILABILITY:
                return AlertSeverity.HIGH;
            case AlertType.PERFORMANCE:
                return AlertSeverity.LOW;
            default:
                return AlertSeverity.MEDIUM;
        }
    }

    /**
     * Détermine si une alerte doit être escaladée
     */
    private shouldEscalate(alert: ProcessedAlert): boolean {
        return alert.severity >= AlertSeverity.HIGH ||
            (alert.consecutiveCount !== undefined &&
                alert.consecutiveCount > this.escalationThresholds[alert.type]);
    }
}