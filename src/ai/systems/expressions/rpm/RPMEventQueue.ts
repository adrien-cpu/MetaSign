// src/ai/systems/expressions/rpm/RPMEventQueue.ts
class RPMEventQueue {
 private queue: RPMEvent[] = [];
 private processingInterval = 16;
 private isProcessing = false;

 enqueue(event: RPMEvent): void {
   this.queue.push(event);
   if (!this.isProcessing) {
     this.startProcessing();
   }
 }

 private async startProcessing(): Promise<void> {
   this.isProcessing = true;
   
   while (this.queue.length > 0) {
     const event = this.queue.shift();
     if (event) {
       await this.processEvent(event);
     }
     await this.delay(this.processingInterval);
   }

   this.isProcessing = false;
 }

 private async processEvent(event: RPMEvent): Promise<void> {
   switch (event.type) {
     case 'EXPRESSION_UPDATE':
       await this.handleExpressionUpdate(event.data);
       break;
     case 'SYNC_REQUEST':
       await this.handleSyncRequest(event.data);
       break;
   }
 }
}