// alerts/AlertManager.ts
export class AlertManager {
    private notificationService: NotificationService;
    private escalationManager: EscalationManager;
    private readonly alertThresholds: AlertThresholds;

    async processMetrics(metrics: AggregatedMetrics): Promise<void> {
        const alerts = this.checkThresholds(metrics);

        for (const alert of alerts) {
            if (this.shouldEscalate(alert)) {
                await this.escalationManager.escalate(alert);
            } else {
                await this.notificationService.notify(alert);
            }
        }
    }

    private shouldEscalate(alert: Alert): boolean {
        return alert.severity === 'critical' || 
               alert.consecutiveCount >= this.alertThresholds.escalationThreshold;
    }
}