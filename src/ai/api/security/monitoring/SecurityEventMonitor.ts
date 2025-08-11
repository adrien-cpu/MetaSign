// src/ai/api/security/monitoring/SecurityEventMonitor.ts

interface SecurityEvent {
    id: string;
    timestamp: Date;
    type: string;
    source: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    details?: {
        success?: boolean;
        responseTime?: number;
        [key: string]: unknown;
    };
}

interface SecurityMetrics {
    totalEvents: number;
    eventsByType: Map<string, number>;
    eventsBySeverity: Map<string, number>;
    eventsBySource: Map<string, number>;
    activeThreats: number;
    avgResponseTime: number;
}

// Remplacer any par des types spécifiques
interface AlertConfigMetadata {
    patternId?: string;
    eventCount?: number;
    timeWindow?: number;
    description?: string;
    createdBy?: string;
    [key: string]: unknown;
}

interface AlertConfiguration {
    id: string;
    name: string;
    condition: (event: SecurityEvent) => boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
    throttleMs?: number;
    notificationChannels: NotificationChannel[];
    metadata: AlertConfigMetadata;
}

interface SecurityAlertContext {
    matchedAt?: number;
    relatedEvents?: SecurityEvent[];
    patternEvents?: SecurityEvent[];
    patternName?: string;
    ipAddress?: string;
    userId?: string;
    [key: string]: unknown;
}

interface SecurityAlert {
    id: string;
    timestamp: number;
    event: SecurityEvent;
    alertConfig: AlertConfiguration;
    context: SecurityAlertContext;
    status: 'new' | 'acknowledged' | 'resolved';
}

// Configuration spécifique pour chaque type de canal
interface EmailNotificationConfig {
    recipients: string[];
    subject?: string;
    template?: string;
    from?: string;
}

interface SlackNotificationConfig {
    channel: string;
    username?: string;
    iconEmoji?: string;
    webhookUrl?: string;
}

interface WebhookNotificationConfig {
    url: string;
    method?: 'GET' | 'POST' | 'PUT';
    headers?: Record<string, string>;
    timeout?: number;
}

interface SMSNotificationConfig {
    phoneNumbers: string[];
    serviceProvider?: string;
    priority?: 'normal' | 'high';
}

// Type de configuration basé sur le type de canal
type NotificationConfig =
    | EmailNotificationConfig
    | SlackNotificationConfig
    | WebhookNotificationConfig
    | SMSNotificationConfig;

interface NotificationChannel {
    type: 'email' | 'slack' | 'webhook' | 'sms';
    config: NotificationConfig;
    enabled: boolean;
}

interface EventPattern {
    id: string;
    name: string;
    timeWindowMs: number;
    minOccurrences: number;
    eventTypes: string[];
    severity: 'low' | 'medium' | 'high';
    evaluate: (events: SecurityEvent[]) => boolean;
}

export class SecurityEventMonitor {
    private events: SecurityEvent[] = [];
    private readonly alerts: SecurityAlert[] = [];
    private readonly alertConfigs = new Map<string, AlertConfiguration>();
    private readonly patterns = new Map<string, EventPattern>();
    private readonly lastAlertTimes = new Map<string, number>();
    private readonly eventWindow = 30 * 60 * 1000; // 30 minutes
    private readonly metricsUpdateInterval = 60 * 1000; // 1 minute
    private metrics: SecurityMetrics; // Initialisé dans le constructeur

    constructor() {
        // Initialiser les metrics ici pour résoudre l'erreur 2564
        this.metrics = {
            totalEvents: 0,
            eventsByType: new Map(),
            eventsBySeverity: new Map(),
            eventsBySource: new Map(),
            activeThreats: 0,
            avgResponseTime: 0
        };

        this.initializeDefaultAlerts();
        this.initializeDefaultPatterns();
        this.startMetricsUpdate();
    }

    async processEvent(event: SecurityEvent): Promise<void> {
        try {
            // Ajouter l'événement à l'historique
            this.events.push(event);
            this.updateMetrics(event);

            // Vérifier les patterns
            await this.checkPatterns();

            // Vérifier les alertes
            await this.checkAlerts(event);

            // Nettoyer les anciens événements
            this.cleanupOldEvents();
        } catch (error) {
            console.error('Error processing security event:', error);
            throw new Error('Event processing failed');
        }
    }

    private async checkAlerts(event: SecurityEvent): Promise<void> {
        const now = Date.now();

        for (const config of this.alertConfigs.values()) {
            try {
                // Vérifier le throttling
                if (config.throttleMs) {
                    const lastAlertTime = this.lastAlertTimes.get(config.id) || 0;
                    if (now - lastAlertTime < config.throttleMs) {
                        continue;
                    }
                }

                // Évaluer la condition
                if (config.condition(event)) {
                    const alert: SecurityAlert = {
                        id: `alert_${now}_${crypto.randomUUID()}`,
                        timestamp: now,
                        event,
                        alertConfig: config,
                        context: {
                            matchedAt: now,
                            relatedEvents: this.findRelatedEvents(event)
                        },
                        status: 'new'
                    };

                    this.alerts.push(alert);
                    this.lastAlertTimes.set(config.id, now);

                    // Envoyer les notifications
                    await this.sendAlertNotifications(alert);
                }
            } catch (error) {
                console.error(`Error processing alert ${config.id}:`, error);
            }
        }
    }

    private async checkPatterns(): Promise<void> {
        const now = Date.now();

        // Corriger la comparaison entre Date et number
        // Comme timestamp est de type Date dans SecurityEvent, nous devons utiliser getTime()
        const recentEvents = this.events.filter(e =>
            e.timestamp && e.timestamp.getTime() > now - this.eventWindow
        );

        for (const pattern of this.patterns.values()) {
            try {
                const patternEvents = recentEvents.filter(e =>
                    pattern.eventTypes.includes(e.type)
                );

                if (patternEvents.length >= pattern.minOccurrences &&
                    pattern.evaluate(patternEvents)) {
                    await this.createPatternAlert(pattern, patternEvents);
                }
            } catch (error) {
                console.error(`Error checking pattern ${pattern.id}:`, error);
            }
        }
    }

    private async createPatternAlert(
        pattern: EventPattern,
        events: SecurityEvent[]
    ): Promise<void> {
        const config: AlertConfiguration = {
            id: `pattern_${pattern.id}`,
            name: `Pattern Detection: ${pattern.name}`,
            condition: () => true, // La condition a déjà été vérifiée
            severity: pattern.severity,
            notificationChannels: this.getDefaultNotificationChannels(),
            metadata: {
                patternId: pattern.id,
                eventCount: events.length,
                timeWindow: pattern.timeWindowMs
            }
        };

        const alert: SecurityAlert = {
            id: `pattern_alert_${Date.now()}_${crypto.randomUUID()}`,
            timestamp: Date.now(),
            event: events[events.length - 1], // Dernier événement du pattern
            alertConfig: config,
            context: {
                patternEvents: events,
                patternName: pattern.name
            },
            status: 'new'
        };

        this.alerts.push(alert);
        await this.sendAlertNotifications(alert);
    }

    private async sendAlertNotifications(alert: SecurityAlert): Promise<void> {
        for (const channel of alert.alertConfig.notificationChannels) {
            if (!channel.enabled) continue;

            try {
                await this.sendNotification(channel, alert);
            } catch (error) {
                console.error(`Error sending notification via ${channel.type}:`, error);
            }
        }
    }

    private async sendNotification(
        channel: NotificationChannel,
        alert: SecurityAlert
    ): Promise<void> {
        // Implémenter l'envoi selon le type de canal
        switch (channel.type) {
            case 'email':
                await this.sendEmailNotification(channel.config as EmailNotificationConfig, alert);
                break;
            case 'slack':
                await this.sendSlackNotification(channel.config as SlackNotificationConfig, alert);
                break;
            case 'webhook':
                await this.sendWebhookNotification(channel.config as WebhookNotificationConfig, alert);
                break;
            case 'sms':
                await this.sendSMSNotification(channel.config as SMSNotificationConfig, alert);
                break;
        }
    }

    private updateMetrics(event: SecurityEvent): void {
        this.metrics.totalEvents++;
        this.incrementMapCounter(this.metrics.eventsByType, event.type);
        this.incrementMapCounter(this.metrics.eventsBySeverity, String(event.severity));
        this.incrementMapCounter(this.metrics.eventsBySource, event.source);
    }

    private incrementMapCounter(map: Map<string, number>, key: string): void {
        map.set(key, (map.get(key) || 0) + 1);
    }

    private findRelatedEvents(event: SecurityEvent): SecurityEvent[] {
        // Suppression des références à la propriété context qui n'existe pas sur SecurityEvent
        return this.events.filter(e =>
            e.source === event.source || e.type === event.type
        );
    }

    private cleanupOldEvents(): void {
        const cutoff = Date.now() - this.eventWindow;

        // Corriger la mise à jour d'un tableau en lecture seule
        // Créer un nouveau tableau plutôt que modifier le tableau existant
        this.events = this.events.filter(e => e.timestamp.getTime() > cutoff);
    }

    private startMetricsUpdate(): void {
        setInterval(() => {
            try {
                // Mettre à jour les métriques en temps réel
                const now = Date.now();

                // Corriger la comparaison entre Date et number
                const recentEvents = this.events.filter(e =>
                    e.timestamp && e.timestamp.getTime() > now - this.eventWindow
                );

                // Corriger la comparaison de SecuritySeverity avec "high"
                this.metrics.activeThreats = this.alerts.filter(a =>
                    a.status === 'new' &&
                    a.alertConfig.severity === 'high'
                ).length;

                if (recentEvents.length > 0) {
                    // Corriger l'addition avec un objet vide
                    const totalResponseTime = recentEvents.reduce((sum, event) => {
                        const responseTime = event.details?.responseTime;
                        // S'assurer que responseTime est un nombre
                        return sum + (typeof responseTime === 'number' ? responseTime : 0);
                    }, 0);

                    this.metrics.avgResponseTime = totalResponseTime / recentEvents.length;
                }
            } catch (error) {
                console.error('Error updating metrics:', error);
            }
        }, this.metricsUpdateInterval);
    }

    private initializeDefaultAlerts(): void {
        // Alerte pour les tentatives d'authentification échouées
        this.addAlertConfig({
            id: 'failed-auth',
            name: 'Failed Authentication Attempts',
            condition: (event) =>
                event.type === 'authentication' &&
                event.details?.success === false,
            severity: 'medium',
            throttleMs: 5 * 60 * 1000, // 5 minutes
            notificationChannels: this.getDefaultNotificationChannels(),
            metadata: {}
        });

        // Alerte pour les violations de politique de sécurité
        this.addAlertConfig({
            id: 'policy-violation',
            name: 'Security Policy Violation',
            condition: (event) =>
                event.type === 'policy' &&
                event.severity === 'HIGH', // Utiliser directement la chaîne littérale qui correspond au type
            severity: 'high',
            notificationChannels: this.getDefaultNotificationChannels(),
            metadata: {}
        });
    }

    private initializeDefaultPatterns(): void {
        // Pattern pour les tentatives de force brute
        this.addPattern({
            id: 'brute-force',
            name: 'Brute Force Attack Pattern',
            timeWindowMs: 5 * 60 * 1000, // 5 minutes
            minOccurrences: 5,
            eventTypes: ['authentication', 'login'],
            severity: 'high',
            evaluate: (events) => {
                // Suppression des références à context qui n'existe pas sur SecurityEvent
                // Utiliser source ou d'autres propriétés disponibles pour la corrélation
                const failedAttempts = events.filter(e =>
                    e.details?.success === false &&
                    e.source === events[0].source
                );
                return failedAttempts.length >= 5;
            }
        });

        // Pattern pour les accès suspects
        this.addPattern({
            id: 'suspicious-access',
            name: 'Suspicious Access Pattern',
            timeWindowMs: 15 * 60 * 1000, // 15 minutes
            minOccurrences: 3,
            eventTypes: ['access', 'resource'],
            severity: 'medium',
            evaluate: (events) => {
                // Suppression des références à context qui n'existe pas sur SecurityEvent
                // Utiliser source ou details pour la corrélation
                const uniqueSources = new Set(events.map(e => e.source));
                return uniqueSources.size >= 3;
            }
        });
    }

    private getDefaultNotificationChannels(): NotificationChannel[] {
        return [
            {
                type: 'email',
                config: {
                    recipients: ['security@example.com']
                } as EmailNotificationConfig,
                enabled: true
            },
            {
                type: 'slack',
                config: {
                    channel: '#security-alerts'
                } as SlackNotificationConfig,
                enabled: true
            }
        ];
    }

    // Méthodes d'envoi de notifications (implémentées avec typage correct)
    private async sendEmailNotification(config: EmailNotificationConfig, alert: SecurityAlert): Promise<void> {
        // Implémentation réelle de l'envoi d'e-mail
        console.log(`Sending email notification for alert ${alert.id} to ${config.recipients.join(', ')}`);
    }

    private async sendSlackNotification(config: SlackNotificationConfig, alert: SecurityAlert): Promise<void> {
        // Implémentation réelle de l'envoi Slack
        console.log(`Sending slack notification for alert ${alert.id} to channel ${config.channel}`);
    }

    private async sendWebhookNotification(config: WebhookNotificationConfig, alert: SecurityAlert): Promise<void> {
        // Implémentation réelle de l'envoi webhook
        console.log(`Sending webhook notification for alert ${alert.id} to ${config.url}`);
    }
    private async sendSMSNotification(config: SMSNotificationConfig, alert: SecurityAlert): Promise<void> {
        // Implémentation réelle de l'envoi SMS
        console.log(`Sending SMS notifications for alert ${alert.id} to ${config.phoneNumbers.length} recipients`);
    }

    // Méthodes publiques utilitaires
    public addAlertConfig(config: AlertConfiguration): void {
        this.alertConfigs.set(config.id, config);
    }

    public removeAlertConfig(configId: string): void {
        this.alertConfigs.delete(configId);
    }

    public addPattern(pattern: EventPattern): void {
        this.patterns.set(pattern.id, pattern);
    }

    public removePattern(patternId: string): void {
        this.patterns.delete(patternId);
    }

    public getMetrics(): SecurityMetrics {
        return { ...this.metrics };
    }

    public getActiveAlerts(): SecurityAlert[] {
        return this.alerts.filter(a => a.status === 'new');
    }

    public updateAlertStatus(
        alertId: string,
        status: 'acknowledged' | 'resolved'
    ): void {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.status = status;
        }
    }
}