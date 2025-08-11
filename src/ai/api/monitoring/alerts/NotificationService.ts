// alerts/NotificationService.ts
export class NotificationService {
    private readonly notificationChannels: NotificationChannel[];

    async notify(alert: Alert): Promise<void> {
        const channels = this.selectChannels(alert);

        await Promise.all(
            channels.map(channel => channel.send(this.formatAlert(alert)))
        );
    }

    private selectChannels(alert: Alert): NotificationChannel[] {
        return this.notificationChannels.filter(channel => 
            channel.severity <= alert.severity
        );
    }

    private formatAlert(alert: Alert): NotificationMessage {
        return {
            title: `[${alert.severity.toUpperCase()}] ${alert.name}`,
            message: alert.description,
            metadata: {
                timestamp: alert.timestamp,
                context: alert.context
            }
        };
    }
}