// src/ai/systems/expressions/timing/TimingSequence.ts

interface ExpressionComponents {
  eyebrows: ComponentConfig;
  eyes: ComponentConfig;
  mouth: ComponentConfig;
}

interface ComponentConfig {
  startValue: number;
  endValue: number;
  duration?: number;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

interface AnimationState {
  isRunning: boolean;
  currentFrame: number;
  totalFrames: number;
  lastTimestamp: number;
  accumulatedTime: number;
}

export class TimingSequence {
  private components: ExpressionComponents;
  private duration: number;
  private startTime: number;
  private animationState: AnimationState;
  private readonly DEFAULT_FPS = 60;
  private readonly FRAME_DURATION = 1000 / 60; // ms

  constructor(components: ExpressionComponents, duration: number) {
    this.components = components;
    this.duration = duration;
    this.startTime = Date.now();
    this.animationState = {
      isRunning: false,
      currentFrame: 0,
      totalFrames: Math.ceil(duration * this.DEFAULT_FPS / 1000),
      lastTimestamp: 0,
      accumulatedTime: 0
    };
  }

  async start(): Promise<void> {
    if (this.animationState.isRunning) {
      return;
    }

    this.animationState.isRunning = true;
    await this.animateComponents();
  }

  private async animateComponents(): Promise<void> {
    return new Promise((resolve) => {
      const animate = (timestamp: number) => {
        if (!this.animationState.isRunning) {
          resolve();
          return;
        }

        if (!this.animationState.lastTimestamp) {
          this.animationState.lastTimestamp = timestamp;
        }

        const deltaTime = timestamp - this.animationState.lastTimestamp;
        this.animationState.accumulatedTime += deltaTime;

        // Mettre à jour les composants si suffisamment de temps s'est écoulé
        while (this.animationState.accumulatedTime >= this.FRAME_DURATION) {
          this.updateComponents(this.FRAME_DURATION);
          this.animationState.accumulatedTime -= this.FRAME_DURATION;
          this.animationState.currentFrame++;
        }

        if (this.animationState.currentFrame < this.animationState.totalFrames) {
          this.animationState.lastTimestamp = timestamp;
          requestAnimationFrame(animate);
        } else {
          this.animationState.isRunning = false;
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  private updateComponents(deltaTime: number): void {
    // Calculer la progression en tenant compte du deltaTime
    const timeProgress = Math.min(
      (this.animationState.currentFrame * deltaTime) / this.duration,
      1
    );

    for (const [name, config] of Object.entries(this.components)) {
      // Ajuster la progression en fonction de la durée spécifique du composant
      const componentProgress = config.duration
        ? Math.min((this.animationState.currentFrame * deltaTime) / config.duration, 1)
        : timeProgress;

      const easedProgress = this.applyEasing(componentProgress, config.easing);
      const currentValue = this.interpolate(
        config.startValue,
        config.endValue,
        easedProgress
      );

      this.updateComponent(name as keyof ExpressionComponents, currentValue);
    }
  }

  private applyEasing(progress: number, easing?: string): number {
    switch (easing) {
      case 'easeIn':
        return progress * progress;
      case 'easeOut':
        return 1 - (1 - progress) * (1 - progress);
      case 'easeInOut':
        return progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      default:
        return progress; // linear
    }
  }

  private interpolate(start: number, end: number, progress: number): number {
    return start + (end - start) * progress;
  }

  private updateComponent(name: keyof ExpressionComponents, value: number): void {
    // Ici, vous implémenteriez la mise à jour réelle du composant
    console.log(`Updating ${name} to ${value}`);
  }

  stop(): void {
    this.animationState.isRunning = false;
  }

  get isRunning(): boolean {
    return this.animationState.isRunning;
  }

  get progress(): number {
    return this.animationState.currentFrame / this.animationState.totalFrames;
  }
}