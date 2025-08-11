// src/ai/systems/expressions/timing/FrameController.ts
import { Frame, FrameComponent } from './types';

export class FrameController {
  private readonly MAX_VELOCITY = 2.0; // unités par seconde
  private readonly MAX_ACCELERATION = 4.0; // unités par seconde²
  private readonly MIN_FRAME_TIME = 16; // ~60fps en ms

  private frames: Frame[] = [];
  private currentFrameIndex = 0;
  private lastProcessedTime = 0;

  async processNextFrame(): Promise<Frame | null> {
    if (this.currentFrameIndex >= this.frames.length) {
      return null;
    }

    const currentTime = Date.now();
    const deltaTime = this.lastProcessedTime ? currentTime - this.lastProcessedTime : this.MIN_FRAME_TIME;

    if (deltaTime < this.MIN_FRAME_TIME) {
      await new Promise(resolve => setTimeout(resolve, this.MIN_FRAME_TIME - deltaTime));
    }

    const frame = this.frames[this.currentFrameIndex++];
    await this.validateFrame(frame);
    this.lastProcessedTime = Date.now();

    return frame;
  }

  private async validateFrame(frame: Frame): Promise<void> {
    if (!this.isValidVelocity(frame) || !this.isValidAcceleration(frame)) {
      throw new Error('Invalid frame parameters');
    }
  }

  private isValidVelocity(frame: Frame): boolean {
    return this.validateComponentValues(frame, (component) =>
      Math.abs(component.velocity) <= this.MAX_VELOCITY
    );
  }

  private isValidAcceleration(frame: Frame): boolean {
    return this.validateComponentValues(frame, (component) =>
      Math.abs(component.acceleration) <= this.MAX_ACCELERATION
    );
  }

  private validateComponentValues(frame: Frame, validator: (component: FrameComponent) => boolean): boolean {
    return (
      validator(frame.eyebrows) &&
      validator(frame.eyes) &&
      validator(frame.mouth)
    );
  }

  // Méthodes de gestion des frames
  addFrame(frame: Frame): void {
    this.frames.push(frame);
  }

  addFrames(frames: Frame[]): void {
    this.frames.push(...frames);
  }

  reset(): void {
    this.frames = [];
    this.currentFrameIndex = 0;
    this.lastProcessedTime = 0;
  }

  get remainingFrames(): number {
    return this.frames.length - this.currentFrameIndex;
  }

  get hasMoreFrames(): boolean {
    return this.currentFrameIndex < this.frames.length;
  }

  get currentProgress(): number {
    if (this.frames.length === 0) return 0;
    return this.currentFrameIndex / this.frames.length;
  }

  // Méthodes de validation supplémentaires
  private validateFrameSequence(frames: Frame[]): boolean {
    if (frames.length < 2) return true;

    for (let i = 1; i < frames.length; i++) {
      const prevFrame = frames[i - 1];
      const currentFrame = frames[i];

      if (!this.isValidTransition(prevFrame, currentFrame)) {
        return false;
      }
    }

    return true;
  }

  private isValidTransition(prevFrame: Frame, currentFrame: Frame): boolean {
    const timeStep = currentFrame.timestamp - prevFrame.timestamp;
    if (timeStep <= 0) return false;

    return this.validateComponentValues(currentFrame, (component) => {
      const prevComponent = this.getCorrespondingComponent(prevFrame, component);
      return this.isValidComponentTransition(prevComponent, component, timeStep);
    });
  }

  private isValidComponentTransition(
    prev: FrameComponent,
    current: FrameComponent,
    timeStep: number
  ): boolean {
    const expectedPosition = prev.position +
      prev.velocity * timeStep +
      0.5 * prev.acceleration * timeStep * timeStep;

    const tolerance = 0.001; // Pour gérer les erreurs d'arrondi
    return Math.abs(current.position - expectedPosition) <= tolerance;
  }

  private getCorrespondingComponent(frame: Frame, component: FrameComponent): FrameComponent {
    if (component === frame.eyebrows) return frame.eyebrows;
    if (component === frame.eyes) return frame.eyes;
    if (component === frame.mouth) return frame.mouth;
    throw new Error('Component not found in frame');
  }
}