// src/ai/systems/expressions/rpm/ExpressionSequencer.ts
class ExpressionSequencer {
 private sequences = new Map<string, ExpressionSequence>();
 
 createSequence(name: string, steps: ExpressionStep[]): void {
   this.sequences.set(name, {
     steps,
     duration: this.calculateTotalDuration(steps),
     currentStep: 0,
     isPlaying: false
   });
 }

 async playSequence(name: string): Promise<void> {
   const sequence = this.sequences.get(name);
   if (!sequence) throw new Error(`Sequence ${name} not found`);

   sequence.isPlaying = true;
   sequence.currentStep = 0;

   for (const step of sequence.steps) {
     if (!sequence.isPlaying) break;
     await this.executeStep(step);
     sequence.currentStep++;
   }

   sequence.isPlaying = false;
 }

 private async executeStep(step: ExpressionStep): Promise<void> {
   await this.applyExpression(step.expression);
   await this.delay(step.duration);
 }
}