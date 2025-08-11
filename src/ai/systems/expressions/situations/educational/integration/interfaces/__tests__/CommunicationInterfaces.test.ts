// src/ai/systems/expressions/situations/educational/integration/interfaces/__tests__/CommunicationInterfaces.test.ts

import { CommunicationInterfaces } from '../CommunicationInterfaces';
import {
  InterfaceConfiguration,
  LSFLearningMetrics,
  LSFPerformanceData,
  NotificationConfig,
  ResourceLimits
} from '../types';

describe('CommunicationInterfaces', () => {
  let communicationInterfaces: CommunicationInterfaces;
  let mockConfig: InterfaceConfiguration;

  beforeEach(() => {
    // Configuration pour les notifications requise par le constructeur
    const notificationConfig: NotificationConfig = {
      priority: 'MEDIUM',
      channels: ['EMAIL', 'DASHBOARD']
    };

    // Configuration des limites de ressources requise par le constructeur
    const resourceLimits: ResourceLimits = {
      memory: 1024,
      cpu: 50,
      concurrentConnections: 100
    };

    // Initialisation avec les paramètres requis
    communicationInterfaces = new CommunicationInterfaces(
      notificationConfig,
      resourceLimits
    );

    mockConfig = {
      learningParameters: {
        adaptationEnabled: true,
        feedbackFrequency: 'HIGH',
        culturalContext: 'FRENCH_LSF'
      },
      systemSettings: {
        performanceMonitoring: true,
        errorThreshold: 0.05,
        realTimeUpdates: true
      }
    };
  });

  describe('LSF Metrics Setup', () => {
    it('should initialize LSF metrics with default values', async () => {
      const setup = await communicationInterfaces.setupInterfaces(mockConfig);

      // Vérification que lsf est défini
      expect(setup.lsf).toBeDefined();
      if (!setup.lsf) {
        throw new Error('LSF interface not initialized');
      }

      const metrics = setup.lsf.metrics;
      expect(metrics).toBeDefined();
      expect(metrics.signAccuracy).toBe(0);
      expect(metrics.nonManualComponents).toBeDefined();
      expect(metrics.culturalCompetency).toBe(0);
    });

    it('should handle custom initial values from configuration', async () => {
      mockConfig.initialMetrics = {
        signAccuracy: 0.5,
        culturalCompetency: 0.7
      };

      const setup = await communicationInterfaces.setupInterfaces(mockConfig);

      // Vérification que lsf est défini
      expect(setup.lsf).toBeDefined();
      if (!setup.lsf) {
        throw new Error('LSF interface not initialized');
      }

      const metrics = setup.lsf.metrics;
      expect(metrics.signAccuracy).toBe(0.5);
      expect(metrics.culturalCompetency).toBe(0.7);
    });
  });

  describe('LSF Educational Control', () => {
    it('should adjust teaching pace based on metrics', async () => {
      const setup = await communicationInterfaces.setupInterfaces(mockConfig);

      // Vérification que lsf est défini
      expect(setup.lsf).toBeDefined();
      if (!setup.lsf) {
        throw new Error('LSF interface not initialized');
      }

      const control = setup.lsf.control;
      const testMetrics: LSFLearningMetrics = {
        signAccuracy: 0.7,
        spatialUnderstanding: 0.6,
        expressiveClarity: 0.8,
        nonManualComponents: {
          facialExpressions: 0.75,
          bodyPosture: 0.8,
          gazeDirection: 0.65
        },
        culturalCompetency: 0.7
      };

      await expect(control.adjustTeachingPace(testMetrics)).resolves.not.toThrow();
    });

    it('should provide appropriate feedback for performance', async () => {
      const setup = await communicationInterfaces.setupInterfaces(mockConfig);

      // Vérification que lsf est défini
      expect(setup.lsf).toBeDefined();
      if (!setup.lsf) {
        throw new Error('LSF interface not initialized');
      }

      const control = setup.lsf.control;
      const performance: LSFPerformanceData = {
        signAttempts: [{
          signId: 'BONJOUR',
          accuracy: 0.8,
          attempts: 3,
          commonErrors: ['HAND_POSITION']
        }],
        sessionDuration: 1800,
        completedExercises: ['BASIC_GREETINGS'],
        challengeAreas: ['SPATIAL_ARRANGEMENT']
      };

      const feedback = await control.provideFeedback(performance);
      expect(feedback).toBeDefined();
      expect(feedback.type).toBeDefined();
      expect(feedback.priority).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    it('should successfully integrate all interface components', async () => {
      const setup = await communicationInterfaces.setupInterfaces(mockConfig);

      expect(setup.data).toBeDefined();
      expect(setup.lsf).toBeDefined();
      expect(setup.status.success).toBe(true);
    });

    it('should properly monitor interface health', async () => {
      const setup = await communicationInterfaces.setupInterfaces(mockConfig);
      const status = await communicationInterfaces.monitorInterfaces(setup);

      expect(status.health).toBeDefined();
      expect(status.performance).toBeGreaterThan(0);
      expect(status.issues).toBeInstanceOf(Array);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid configuration gracefully', async () => {
      const invalidConfig = {} as InterfaceConfiguration;

      await expect(communicationInterfaces.setupInterfaces(invalidConfig))
        .rejects.toThrow();
    });

    it('should detect and report interface issues', async () => {
      // Créer une configuration problématique
      const badConfig = { ...mockConfig };
      if (badConfig.systemSettings) {
        badConfig.systemSettings.errorThreshold = -1; // Valeur invalide
      }

      const setup = await communicationInterfaces.setupInterfaces(badConfig);
      const status = await communicationInterfaces.monitorInterfaces(setup);

      expect(status.issues.length).toBeGreaterThan(0);
    });
  });
});