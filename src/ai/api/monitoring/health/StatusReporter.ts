// health/StatusReporter.ts
export class StatusReporter {
    private notificationService: NotificationService;
    private history: StatusHistory;

    async report(status: ComponentStatus[]): Promise<void> {
        this.history.add(status);
        
        const degraded = status.filter(s => s.status !== 'healthy');
        if (degraded.length > 0) {
            await this.notificationService.notify({
                severity: 'warning',
                name: 'System Degradation',
                description: this.formatDegradation(degraded)
            });
        }
    }
}