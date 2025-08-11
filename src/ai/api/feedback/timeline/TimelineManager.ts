// src/ai/api/feedback/timeline/TimelineManager.ts
export class TimelineManager {
    private readonly signSelector: SignSelector;
    private readonly userInterfaceStorage: UserInterfaceStorage;

    async selectSigns(timeRange: TimeRange): Promise<SelectedSigns> {
        return this.signSelector.select(timeRange);
    }

    async saveToUserInterface(signs: SelectedSigns): Promise<void> {
        await this.userInterfaceStorage.store({
            signs,
            timestamp: Date.now(),
            status: 'pending_correction'
        });
    }
}