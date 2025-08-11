// src/ai/systems/expressions/timing/ExpressionsAnimator.ts
import { Frame, FrameComponent } from './types';

interface ExpressionState {
  eyebrows: number;
  eyes: number;
  mouth: number;
  timestamp?: number;
}

interface ExpressionComponents {
  start: ExpressionState;
  end: ExpressionState;
  duration: number;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

interface AnimationConfig {
  frameRate?: number;
  minDuration?: number;
  maxDuration?: number;
}

export class ExpressionsAnimator {
  private static readonly DEFAULT_FRAME_DURATION = 16.67; // ~60fps
  private static readonly MIN_DURATION = 100; // 100ms minimum
  private static readonly MAX_DURATION = 5000; // 5s maximum

  private readonly frameDuration: number;
  private isAnimating: boolean = false;

  constructor(config?: AnimationConfig) {
    this.frameDuration = config?.frameRate
      ? 1000 / config.frameRate
      : ExpressionsAnimator.DEFAULT_FRAME_DURATION;
  }

  async animateComponents(components: ExpressionComponents): Promise<void> {
    if (this.isAnimating) {
      throw new Error('Animation already in progress');
    }

    try {
      this.isAnimating = true;
      const frames = this.generateFrames(components);

      for (const frame of frames) {
        await this.applyFrame(frame);
        await this.delay(this.frameDuration);
      }
    } finally {
      this.isAnimating = false;
    }
  }

  private generateFrames(components: ExpressionComponents): Frame[] {
    const duration = this.clampDuration(components.duration);
    const totalFrames = Math.ceil(duration / this.frameDuration);

    return Array.from({ length: totalFrames }, (_, i) => {
      const progress = i / (totalFrames - 1);
      const timestamp = Date.now() + i * this.frameDuration;
      return this.interpolateFrame(
        components.start,
        components.end,
        progress,
        timestamp,
        components.easing
      );
    });
  }

  private interpolateFrame(
    start: ExpressionState,
    end: ExpressionState,
    progress: number,
    timestamp: number,
    easing: ExpressionComponents['easing'] = 'easeInOut'
  ): Frame {
    const easedProgress = this.applyEasing(progress, easing);

    return {
      eyebrows: this.createFrameComponent(start.eyebrows, end.eyebrows, easedProgress),
      eyes: this.createFrameComponent(start.eyes, end.eyes, easedProgress),
      mouth: this.createFrameComponent(start.mouth, end.mouth, easedProgress),
      timestamp
    };
  }

  private createFrameComponent(start: number, end: number, progress: number): FrameComponent {
    const position = this.interpolateValue(start, end, progress);
    const velocity = (end - start) / this.frameDuration;
    const acceleration = 0; // Pour l'instant, pas d'accélération

    return { position, velocity, acceleration };
  }

  private interpolateValue(start: number, end: number, progress: number): number {
    return start + (end - start) * progress;
  }

  private applyEasing(progress: number, type?: ExpressionComponents['easing']): number {
    switch (type) {
      case 'linear':
        return progress;
      case 'easeIn':
        return this.easeInCubic(progress);
      case 'easeOut':
        return this.easeOutCubic(progress);
      case 'easeInOut':
      default:
        return this.easeInOutCubic(progress);
    }
  }

  private easeInCubic(t: number): number {
    return t * t * t;
  }

  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private clampDuration(duration: number): number {
    return Math.min(
      Math.max(duration, ExpressionsAnimator.MIN_DURATION),
      ExpressionsAnimator.MAX_DURATION
    );
  }

  private async applyFrame(frame: Frame): Promise<void> {
    // Ici, implémentez l'application réelle de la frame
    // Par exemple, mise à jour du DOM ou envoi à un moteur 3D
    console.log('Applying frame:', frame);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public stop(): void {
    this.isAnimating = false;
  }

  public get isActive(): boolean {
    return this.isAnimating;
  }
}