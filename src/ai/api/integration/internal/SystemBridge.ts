// internal/SystemBridge.ts
export class SystemBridge {
    private eventBus: EventBus;
    private messageQueue: MessageQueue;

    async bridgeRequest(request: InternalRequest): Promise<void> {
        const event = this.createEvent(request);
        await this.eventBus.publish(event);
        await this.messageQueue.enqueue(request);
    }
}