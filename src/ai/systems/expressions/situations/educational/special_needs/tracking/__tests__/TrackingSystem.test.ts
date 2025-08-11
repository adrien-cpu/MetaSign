// src/ai/systems/expressions/situations/educational/special_needs/tracking/__tests__/TrackingSystem.test.ts

import { DetailedProgressTracker } from '../DetailedProgressTracker';
import {
  Learner,
  LearningRecord,
  TrackingPeriod
} from '../types';
import customMatchers from './customMatchers';

// Extension de Jest pour utiliser les matchers personnalisés
expect.extend(customMatchers);

describe('LSF Progress Tracking System', () => {
  let progressTracker: DetailedProgressTracker;

  beforeEach(() => {
    progressTracker = new DetailedProgressTracker();
  });

  describe('Progress Tracking', () => {
    test('should track progress over time accurately', async () => {
      // Préparation des données de test
      const learner = createTestLearner(30);
      const trackingPeriod: TrackingPeriod = { duration: 'MONTH' };

      // Exécution
      const progress = await progressTracker.trackProgress(learner, trackingPeriod);

      // Assertions
      expect(progress.linguistic.manual.accuracy_trend).toBeIncreasing();
      expect(progress.cognitive.spatial.overall).toBeGreaterThan(0);
      expect(progress.adaptations.overall).toBeGreaterThan(0);
    });

    test('should detect learning plateaus', async () => {
      const learner = createTestLearnerWithPlateau();
      const trackingPeriod: TrackingPeriod = { duration: 'WEEK' };

      const progress = await progressTracker.trackProgress(learner, trackingPeriod);

      expect(progress.recommendations.general).toContain(
        expect.stringMatching(/practice|intervention|plateau/i)
      );
    });

    test('should consider different time periods', async () => {
      const learner = createTestLearner(60);
      const monthPeriod: TrackingPeriod = { duration: 'MONTH' };
      const weekPeriod: TrackingPeriod = { duration: 'WEEK' };

      const monthProgress = await progressTracker.trackProgress(learner, monthPeriod);
      const weekProgress = await progressTracker.trackProgress(learner, weekPeriod);

      expect(monthProgress.cognitive.spatial.overall)
        .not.toBe(weekProgress.cognitive.spatial.overall);
    });
  });

  describe('Integration Features', () => {
    test('should evaluate component integration', async () => {
      const learner = createTestLearner(20);
      const progress = await progressTracker.trackProgress(learner);

      expect(progress.linguistic.integration.overall_score).toBeDefined();
      expect(progress.cognitive.integration.synchronization).toBeGreaterThan(0);
      expect(progress.cognitive.integration.fluidity).toBeLessThanOrEqual(1);
    });

    test('should provide meaningful recommendations', async () => {
      const learner = createTestLearner(15);
      const progress = await progressTracker.trackProgress(learner);

      expect(progress.recommendations.linguistic).toHaveLength(expect.any(Number));
      expect(progress.recommendations).toBeDataDriven();
    });
  });

  // Fonctions utilitaires pour la création des données de test
  function createTestLearner(days: number): Learner {
    return {
      id: 'test_learner',
      baseline: {
        manual_skills: {
          accuracy: 0.6,
          fluency: 0.5
        },
        non_manual_features: {
          precision: 0.7,
          naturalness: 0.6
        }
      },
      learning_history: generateLearningHistory(days)
    };
  }

  function createTestLearnerWithPlateau(): Learner {
    return {
      ...createTestLearner(10),
      learning_history: [
        ...generateLearningHistory(5),
        ...Array(5).fill(null).map((_, i) => ({
          day: i + 6,
          performance: {
            accuracy: 0.75,
            fluency: 0.70
          }
        }))
      ]
    };
  }

  function generateLearningHistory(days: number): LearningRecord[] {
    return Array(days).fill(null).map((_, index) => ({
      day: index + 1,
      performance: {
        accuracy: Math.min(0.6 + (index * 0.01), 1),
        fluency: Math.min(0.5 + (index * 0.015), 1)
      }
    }));
  }
});