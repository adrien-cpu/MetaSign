// src/ai/systems/expressions/rpm/MorphFrameProcessor.ts
class MorphFrameProcessor {
 private frameBuffer: MorphFrame[] = [];
 private currentFrameIndex = 0;

 async processFrame(frame: MorphFrame): Promise<void> {
   this.validateFrame(frame);
   this.addToBuffer(frame);
   await this.applyFrameToAvatar(frame);
 }

 private validateFrame(frame: MorphFrame): void {
   if (!this.isFrameTimingValid(frame) || !this.areMorphValuesValid(frame)) {
     throw new RPMError('Invalid frame data');
   }
 }

 private async applyFrameToAvatar(frame: MorphFrame): Promise<void> {
   const avatarState = await this.getAvatarState();
   const combinedState = this.combineWithCurrentState(frame, avatarState);
   await this.updateAvatarState(combinedState);
 }

 private combineWithCurrentState(frame: MorphFrame, currentState: AvatarState): AvatarState {
   return {
     ...currentState,
     morphs: { ...currentState.morphs, ...frame.morphs }
   };
 }
}