// health/HealthCheck.ts
export class HealthCheck {
    private systemStatus: SystemStatus;
    private statusReporter: StatusReporter;

    async checkHealth(): Promise<HealthStatus> {
        const status = await this.systemStatus.check();
        await this.statusReporter.report(status);

        return {
            status: this.getOverallStatus(status),
            components: status,
            timestamp: Date.now()
        };
    }

    private getOverallStatus(status: ComponentStatus[]): 'healthy' | 'degraded' | 'unhealthy' {
        if (status.some(s => s.status === 'unhealthy')) return 'unhealthy';
        if (status.some(s => s.status === 'degraded')) return 'degraded';
        return 'healthy';
    }
}