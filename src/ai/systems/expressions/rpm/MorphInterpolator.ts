// src/ai/systems/expressions/rpm/MorphInterpolator.ts
class MorphInterpolator {
 private readonly TRANSITION_FRAMES = 60; // 1 second at 60fps

 interpolate(target: MorphUpdate): MorphFrame[] {
   const frames: MorphFrame[] = [];
   const current = this.getCurrentMorphState();

   for (let i = 0; i < this.TRANSITION_FRAMES; i++) {
     const progress = i / (this.TRANSITION_FRAMES - 1);
     frames.push({
       morphs: this.interpolateFrame(current, target, progress),
       timestamp: Date.now() + (i * 16.67) // ~60fps timing
     });
   }

   return frames;
 }

 private interpolateFrame(current: MorphState, target: MorphUpdate, progress: number): MorphState {
   return Object.keys(target.morphs).reduce((frame, morphName) => {
     frame[morphName] = this.lerp(
       current[morphName] || 0,
       target.morphs[morphName],
       this.easeInOutCubic(progress)
     );
     return frame;
   }, {} as MorphState);
 }

 private lerp(start: number, end: number, progress: number): number {
   return start + (end - start) * progress;
 }
}