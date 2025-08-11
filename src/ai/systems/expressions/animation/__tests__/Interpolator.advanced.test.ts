// src/ai/systems/expressions/animation/__tests__/Interpolator.advanced.test.ts
describe('Interpolator Advanced Tests', () => {
  let interpolator: Interpolator;

  beforeEach(() => {
    interpolator = new Interpolator();
  });

  describe('Edge Cases', () => {
    test('should handle extreme morph values', () => {
      const start = { browInnerUp: Number.MIN_VALUE };
      const end = { browInnerUp: Number.MAX_VALUE };
      
      const result = interpolator.interpolateExpressions(start, end, 0.5);
      expect(isFinite(result.browInnerUp)).toBe(true);
    });

    test('should handle NaN and invalid values', () => {
      const start = { browInnerUp: NaN };
      const end = { browInnerUp: 1 };
      
      const result = interpolator.interpolateExpressions(start, end, 0.5);
      expect(isNaN(result.browInnerUp)).toBe(false);
    });
  });

  describe('Easing Functions', () => {
    const testPoints = [0, 0.25, 0.5, 0.75, 1];
    const easingFunctions = [
      'easeInQuad',
      'easeOutQuad',
      'easeInOutQuad',
      'easeInElastic'
    ];

    test.each(easingFunctions)('%s should maintain output bounds', (funcName) => {
      testPoints.forEach(point => {
        const result = interpolator[funcName](point);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Performance Tests', () => {
    test('should handle large number of morph targets efficiently', () => {
      const largeMorphSet = Array.from({ length: 1000 }).reduce((acc, _, i) => {
        acc[`morph_${i}`] = Math.random();
        return acc;
      }, {});

      const startTime = performance.now();
      interpolator.interpolateExpressions(largeMorphSet, largeMorphSet, 0.5);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Moins de 100ms
    });
  });
});
