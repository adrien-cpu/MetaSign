// src/ai/feedback/core/LSFAlertSystem.ts
export class LSFAlertSystem {
    private readonly notificationService: NotificationService;
    private readonly alertPrioritizer: AlertPrioritizer;

    async notify(feedback: FeedbackData): Promise<void> {
        const alert = this.createAlert(feedback);
        const priority = this.alertPrioritizer.getPriority(alert);

        await this.notificationService.send(alert, priority);
    }
}