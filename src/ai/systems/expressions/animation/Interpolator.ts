// src/ai/systems/expressions/animation/Interpolator.ts
import { RPMMorphTargets } from '../rpm/RPMMorphTargets';

export class Interpolator {
  interpolateExpressions(
    start: RPMMorphTargets,
    end: RPMMorphTargets,
    progress: number
  ): RPMMorphTargets {
    const interpolated: RPMMorphTargets = {};
    const allKeys = new Set([...Object.keys(start), ...Object.keys(end)]);

    for (const key of allKeys) {
      const startValue = start[key] || 0;
      const endValue = end[key] || 0;
      interpolated[key] = this.interpolateValue(
        startValue,
        endValue,
        this.easeInOutCubic(progress)
      );
    }

    return interpolated;
  }

  private interpolateValue(start: number, end: number, progress: number): number {
    return start + (end - start) * progress;
  }

  private easeInOutCubic(x: number): number {
    return x < 0.5
      ? 4 * x * x * x
      : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  // Autres fonctions d'easing disponibles
  private easeInQuad(x: number): number {
    return x * x;
  }

  private easeOutQuad(x: number): number {
    return 1 - (1 - x) * (1 - x);
  }

  private easeInOutQuad(x: number): number {
    return x < 0.5 
      ? 2 * x * x 
      : 1 - Math.pow(-2 * x + 2, 2) / 2;
  }

  private easeInElastic(x: number): number {
    const c4 = (2 * Math.PI) / 3;
    return x === 0 
      ? 0 
      : x === 1
      ? 1
      : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
  }
}