// internal/MessageQueue.ts
export class MessageQueue {
    private queue: PriorityQueue<Message>;
    private consumers: Set<MessageConsumer>;

    async enqueue(message: Message): Promise<void> {
        this.queue.enqueue(message, this.getPriority(message));
        await this.processQueue();
    }

    private async processQueue(): Promise<void> {
        while (!this.queue.isEmpty()) {
            const message = this.queue.dequeue();
            await this.notifyConsumers(message);
        }
    }
}