// src/ai/systems/expressions/animation/__tests__/Interpolator.test.ts
import { Interpolator } from '../Interpolator';
import { RPMMorphTargets } from '../../rpm/RPMMorphTargets';

describe('Interpolator', () => {
  let interpolator: Interpolator;

  beforeEach(() => {
    interpolator = new Interpolator();
  });

  test('should interpolate between two expressions correctly', () => {
    const start: RPMMorphTargets = { browInnerUp: 0, mouthSmile: 0 };
    const end: RPMMorphTargets = { browInnerUp: 1, mouthSmile: 1 };
    const progress = 0.5;

    const result = interpolator.interpolateExpressions(start, end, progress);

    expect(result.browInnerUp).toBeCloseTo(0.5);
    expect(result.mouthSmile).toBeCloseTo(0.5);
  });

  test('should handle missing morphs in start expression', () => {
    const start: RPMMorphTargets = { browInnerUp: 0 };
    const end: RPMMorphTargets = { browInnerUp: 1, mouthSmile: 1 };
    const progress = 0.5;

    const result = interpolator.interpolateExpressions(start, end, progress);

    expect(result.browInnerUp).toBeCloseTo(0.5);
    expect(result.mouthSmile).toBeCloseTo(0.5);
  });

  test('should handle easing functions correctly', () => {
    const start: RPMMorphTargets = { browInnerUp: 0 };
    const end: RPMMorphTargets = { browInnerUp: 1 };
    
    // Test à mi-chemin avec easeInOutCubic
    const result = interpolator.interpolateExpressions(start, end, 0.5);
    
    // Pour easeInOutCubic, la valeur à 0.5 devrait être exactement 0.5
    expect(result.browInnerUp).toBeCloseTo(0.5);
  });
});