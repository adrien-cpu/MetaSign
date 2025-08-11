// src/ai/systems/expressions/animation/__tests__/ExpressionAnimator.test.ts

import { ExpressionAnimator } from '../ExpressionAnimator';
import { Interpolator } from '../Interpolator';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { RPMClient } from '../../rpm/RPMAPIClient';
import { MorphTargetsManager } from '../../rpm/RPMMorphTargets';
import { RPMError } from '../../rpm/RPMErrorHandling';

// Reste du code inchangé

// Configuration de Jest pour les timers
jest.useFakeTimers();

describe('ExpressionAnimator', () => {
  let animator: ExpressionAnimator;
  let mockRPMClient: jest.Mocked<RPMClient>;
  let mockInterpolator: jest.Mocked<Interpolator>;
  let mockPerformanceMonitor: jest.Mocked<PerformanceMonitor>;

  beforeEach(() => {
    // Utiliser un typage plus précis pour les mocks
    mockRPMClient = {
      sendMorphTargets: jest.fn(),
      getAvatarStatus: jest.fn()
    } as unknown as jest.Mocked<RPMClient>;

    mockInterpolator = {
      interpolateExpressions: jest.fn()
    } as unknown as jest.Mocked<Interpolator>;

    mockPerformanceMonitor = {
      trackFrameTime: jest.fn()
    } as unknown as jest.Mocked<PerformanceMonitor>;

    animator = new ExpressionAnimator(
      mockRPMClient,
      mockInterpolator,
      mockPerformanceMonitor
    );
  });

  test('should start and stop animation correctly', async () => {
    await animator.startAnimation();
    expect(animator['isRunning']).toBe(true);

    await animator.stopAnimation();
    expect(animator['isRunning']).toBe(false);
    // Utiliser sendMorphTargets au lieu de updateMorphTargets
    expect(mockRPMClient.sendMorphTargets).toHaveBeenCalledWith('current', expect.any(Object));
  });

  test('should animate expression with correct interpolation', async () => {
    // Utiliser MorphTargetsManager pour créer des instances valides de RPMMorphTargets
    const targetExpression = new MorphTargetsManager();
    targetExpression.browInnerUp = 1;

    const interpolatedExpression = new MorphTargetsManager();
    interpolatedExpression.browInnerUp = 0.5;

    const duration = 1000;

    mockInterpolator.interpolateExpressions.mockReturnValue(interpolatedExpression);

    await animator.animateExpression(targetExpression, duration);

    // Avance le temps simulé
    jest.advanceTimersByTime(500);

    expect(mockInterpolator.interpolateExpressions).toHaveBeenCalled();
    // Utiliser sendMorphTargets au lieu de updateMorphTargets
    expect(mockRPMClient.sendMorphTargets).toHaveBeenCalled();
  });

  test('should handle animation errors gracefully', async () => {
    // Utiliser sendMorphTargets au lieu de updateMorphTargets
    mockRPMClient.sendMorphTargets.mockRejectedValue(new RPMError('RPM Error'));

    const targetExpression = new MorphTargetsManager();
    targetExpression.browInnerUp = 1;

    await expect(animator.animateExpression(targetExpression, 1000))
      .rejects
      .toThrow('RPM Error');

    // Utiliser getAvatarStatus au lieu de resync
    expect(mockRPMClient.getAvatarStatus).toHaveBeenCalled();
  });
});