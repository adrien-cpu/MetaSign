// src/ai/systems/expressions/rpm/RPMEventProcessor.ts
class RPMEventProcessor {
 private priorityQueue: RPMPriorityQueue;
 private eventHistory: Map<string, ProcessedEvent> = new Map();

 constructor(priorityQueue: RPMPriorityQueue) {
   this.priorityQueue = priorityQueue;
   this.setupProcessors();
 }

 private async handleEvent(event: RPMEvent): Promise<void> {
   const processedEvent = {
     id: event.id,
     timestamp: Date.now(),
     processingTime: 0,
     result: await this.processEventByType(event)
   };

   this.eventHistory.set(event.id, processedEvent);
 }

 private async processEventByType(event: RPMEvent): Promise<ProcessingResult> {
   const startTime = performance.now();
   let result: ProcessingResult;

   try {
     switch (event.type) {
       case 'MORPH_UPDATE':
         result = await this.processMorphUpdate(event);
         break;
       case 'STATE_SYNC':
         result = await this.processStateSync(event);
         break;
       default:
         throw new Error(`Unknown event type: ${event.type}`);
     }
   } catch (error) {
     result = { success: false, error };
   }

   result.processingTime = performance.now() - startTime;
   return result;
 }
}