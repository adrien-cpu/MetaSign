// src/ai/systems/expressions/rpm/MorphTransitionManager.ts
class MorphTransitionManager {
 private pendingTransitions: Map<string, Transition> = new Map();

 async scheduleTransition(from: MorphState, to: MorphState, duration: number): Promise<void> {
   const transitionId = crypto.randomUUID();
   const transition = {
     id: transitionId,
     startState: from,
     endState: to,
     duration,
     startTime: Date.now(),
     frames: this.generateTransitionFrames(from, to, duration)
   };

   this.pendingTransitions.set(transitionId, transition);
   await this.executeTransition(transition);
 }

 private generateTransitionFrames(from: MorphState, to: MorphState, duration: number): MorphFrame[] {
   const frameCount = Math.ceil(duration / 16.67);
   const frames = [];

   for (let i = 0; i < frameCount; i++) {
     const progress = i / (frameCount - 1);
     frames.push({
       morphs: this.interpolateStates(from, to, progress),
       timestamp: Date.now() + (i * 16.67)
     });
   }

   return frames;
 }
}