// src/ai/systems/expressions/timing/TimingController.ts
export class TimingController {
 private readonly DEFAULT_TRANSITION_MS = 300;
 private currentSequence: TimingSequence | null = null;

 async executeSequence(components: ExpressionComponents): Promise<void> {
   this.currentSequence = new TimingSequence(components, this.DEFAULT_TRANSITION_MS);
   
   try {
     await this.currentSequence.start();
     await this.validateExecution();
   } catch (error) {
     await this.handleTimingError(error);
   }
 }

 private async validateExecution(): Promise<void> {
   if (this.currentSequence) {
     const timing = await this.currentSequence.getTiming();
     if (!this.isValidTiming(timing)) {
       throw new Error('Invalid timing sequence');
     }
   }
 }
}

