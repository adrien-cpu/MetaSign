// src/ai/systems/expressions/rpm/MorphQueueManager.ts
class MorphQueueManager {
 private queue: MorphOperation[] = [];
 private isProcessing = false;
 private readonly processingInterval = 16.67;

 async queueOperation(operation: MorphOperation): Promise<void> {
   this.queue.push(operation);
   if (!this.isProcessing) {
     await this.startProcessing();
   }
 }

 private async startProcessing(): Promise<void> {
   this.isProcessing = true;
   
   while (this.queue.length > 0) {
     const operation = this.queue.shift();
     if (operation) {
       try {
         await this.processOperation(operation);
       } catch (error) {
         this.handleError(error, operation);
       }
       await new Promise(resolve => setTimeout(resolve, this.processingInterval));
     }
   }

   this.isProcessing = false;
 }

 private async processOperation(operation: MorphOperation): Promise<void> {
   switch (operation.type) {
     case 'UPDATE':
       await this.processUpdate(operation);
       break;
     case 'TRANSITION':
       await this.processTransition(operation);
       break;
     case 'RESET':
       await this.processReset(operation);
       break;
   }
 }
}