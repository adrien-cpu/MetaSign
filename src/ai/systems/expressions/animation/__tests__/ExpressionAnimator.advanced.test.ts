// src/ai/systems/expressions/animation/__tests__/ExpressionAnimator.advanced.test.ts
import { ExpressionAnimator } from '../ExpressionAnimator';
import { RPMError } from '../../rpm/RPMErrorHandling';
import { RPMClient } from '../../rpm/RPMAPIClient';
import { Interpolator } from '../Interpolator';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { MorphTargetsManager } from '../../rpm/RPMMorphTargets';

describe('ExpressionAnimator Advanced Tests', () => {
  let animator: ExpressionAnimator;
  let mockRPMClient: jest.Mocked<RPMClient>;
  let mockInterpolator: jest.Mocked<Interpolator>;
  let mockPerformanceMonitor: jest.Mocked<PerformanceMonitor>;

  beforeEach(() => {
    jest.useFakeTimers();
    mockRPMClient = {
      sendMorphTargets: jest.fn(),
      getAvatarStatus: jest.fn()
      // Suppression de getConnectionStatus qui n'existe pas dans RPMClient
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

  // ... autres tests inchangés ...

  describe('Connection Recovery Tests', () => {
    test('should handle connection loss during animation', async () => {
      mockRPMClient.sendMorphTargets.mockRejectedValueOnce(
        new RPMError('Connection lost')
      );

      const expression = new MorphTargetsManager();
      expression.browInnerUp = 1;

      const animationPromise = animator.animateExpression(expression, 1000);

      await expect(animationPromise).rejects.toThrow('Connection lost');
      expect(mockRPMClient.getAvatarStatus).toHaveBeenCalled();
    });

    test('should recover after connection reestablished', async () => {
      // Modifier ce test pour ne pas utiliser getConnectionStatus
      // Simuler plutôt un échec puis un succès de getAvatarStatus
      mockRPMClient.getAvatarStatus
        .mockRejectedValueOnce(new RPMError('Disconnected'))
        .mockResolvedValueOnce({ id: 'current', status: 'connected', lastUpdated: new Date().toISOString() });

      await animator.startAnimation();
      // Simuler une erreur qui déclenche un appel à getAvatarStatus
      mockRPMClient.sendMorphTargets.mockRejectedValueOnce(new RPMError('Connection error'));

      // Avancer le temps pour déclencher le prochain frame
      jest.advanceTimersByTime(20);

      // Vérifier que getAvatarStatus a été appelé pour récupérer la connexion
      expect(mockRPMClient.getAvatarStatus).toHaveBeenCalled();
    });
  });
});