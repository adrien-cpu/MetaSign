// src/ai/systems/expressions/rpm/ExpressionScheduler.ts
class ExpressionScheduler {
 private scheduledEvents: Map<string, ScheduledEvent> = new Map();

 schedule(expression: Expression, time: number, options: ScheduleOptions = {}): string {
   const id = crypto.randomUUID();
   this.scheduledEvents.set(id, {
     id,
     expression,
     scheduledTime: time,
     repeat: options.repeat,
     priority: options.priority || 0
   });
   return id;
 }

 private async processScheduledEvents(): Promise<void> {
   setInterval(async () => {
     const now = Date.now();
     const dueEvents = [...this.scheduledEvents.values()]
       .filter(event => event.scheduledTime <= now)
       .sort((a, b) => b.priority - a.priority);

     for (const event of dueEvents) {
       await this.executeScheduledEvent(event);
       this.handleEventCompletion(event);
     }
   }, 16.67); // ~60fps
 }
}