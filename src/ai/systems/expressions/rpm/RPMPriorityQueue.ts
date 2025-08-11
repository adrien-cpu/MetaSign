// src/ai/systems/expressions/rpm/RPMPriorityQueue.ts
class RPMPriorityQueue {
 private queue: PrioritizedEvent[] = [];

 enqueue(event: RPMEvent, priority: number): void {
   this.queue.push({ event, priority });
   this.queue.sort((a, b) => b.priority - a.priority);
 }

 private async processNextBatch(): Promise<void> {
   const batch = this.getBatchToProcess();
   
   for (const item of batch) {
     if (this.shouldProcessImmediately(item)) {
       await this.processHighPriorityEvent(item.event);
     } else {
       this.scheduleNormalPriority(item.event);
     }
   }
 }

 private shouldProcessImmediately(item: PrioritizedEvent): boolean {
   return item.priority > 8 || 
          item.event.type === 'ERROR_RECOVERY' ||
          item.event.type === 'SYNC_CRITICAL';
 }
}