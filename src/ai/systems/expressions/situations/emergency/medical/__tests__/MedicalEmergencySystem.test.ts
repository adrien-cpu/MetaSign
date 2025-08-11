// src/ai/system/expressions/situations/emergency/medical/__tests__/MedicalEmergencySystem.test.ts
import { MedicalEmergencyHandler } from '../MedicalEmergencyHandler';
import { EmergencySignalSystem } from '../EmergencySignalSystem';
import { EmergencyCoordinator } from '../EmergencyCoordinator';

describe('Medical Emergency System', () => {
  let handler: MedicalEmergencyHandler;
  let signalSystem: EmergencySignalSystem;
  let coordinator: EmergencyCoordinator;

  beforeEach(() => {
    handler = new MedicalEmergencyHandler();
    signalSystem = new EmergencySignalSystem();
    coordinator = new EmergencyCoordinator();
  });

  describe('Initial Emergency Response', () => {
    test('should handle urgent medical situation correctly', async () => {
      const emergency = {
        type: 'CARDIAC',
        severity: 'HIGH',
        location: { zone: 'MAIN_HALL', floor: 1 },
        victim: {
          consciousness: 'RESPONSIVE',
          breathing: 'LABORED',
          age_group: 'ADULT'
        }
      };

      const context = {
        environment: 'INDOOR',
        available_resources: ['DEFIBRILLATOR', 'FIRST_AID'],
        personnel: ['MEDICAL_STAFF', 'LSF_INTERPRETER'],
        lighting: 'ADEQUATE'
      };

      const response = await handler.handleMedicalEmergency(emergency, context);

      expect(response.metadata.response_time).toBeLessThan(3000); // 3 seconds max
      expect(response.metadata.effectiveness).toBeGreaterThan(0.8);
      expect(response.response.initial_alert.clarity_score).toBeGreaterThan(0.9);
    });

    test('should adapt to visual constraints', async () => {
      const emergency = {
        type: 'TRAUMA',
        severity: 'HIGH',
        location: { zone: 'OUTDOOR', floor: 0 },
        victim: {
          consciousness: 'RESPONSIVE',
          bleeding: 'SEVERE',
          mobility: 'RESTRICTED'
        }
      };

      const context = {
        environment: 'OUTDOOR',
        lighting: 'LOW',
        visual_obstacles: ['DISTANCE', 'CROWD'],
        available_resources: ['FIRST_AID']
      };

      const response = await handler.handleMedicalEmergency(emergency, context);
      
      expect(response.response.visual_adaptations.signal_amplification).toBeGreaterThan(1.5);
      expect(response.response.space_management.clearing_effectiveness).toBeGreaterThan(0.8);
    });
  });

  describe('Signal System Integration', () => {
    test('should generate and maintain clear emergency signals', async () => {
      const signalContext = {
        distance: 'MEDIUM',
        obstacles: 'MINIMAL',
        audience: ['DEAF', 'HEARING'],
        urgency: 'HIGH'
      };

      const signal = await signalSystem.generateEmergencySignal('MEDICAL', signalContext);
      
      expect(signal.metadata.visibility).toBeGreaterThan(0.9);
      expect(signal.metadata.comprehension).toBeGreaterThan(0.85);
      expect(signal.components.attention_getting.intensity).toBe('MAXIMUM');
    });

    test('should maintain signal effectiveness over time', async () => {
      const signal = await signalSystem.generateEmergencySignal('MEDICAL', {
        distance: 'MEDIUM',
        obstacles: 'MINIMAL',
        audience: ['DEAF', 'HEARING'],
        urgency: 'HIGH'
      });

      const monitoringResult = await signalSystem.monitorSignalEffectiveness(signal, {
        duration: 300000, // 5 minutes
        checkpoints: ['START', 'MIDDLE', 'END']
      });

      expect(monitoringResult.effectiveness_trend).toBe('STABLE');
      expect(monitoringResult.comprehension_rates).toBeGreaterThan(0.8);
    });
  });

  describe('Coordination System', () => {
    test('should coordinate multiple responders effectively', async () => {
      const resources = {
        personnel: [
          { role: 'MEDICAL', count: 2 },
          { role: 'INTERPRETER', count: 1 },
          { role: 'ASSISTANT', count: 2 }
        ],
        equipment: ['FIRST_AID', 'DEFIBRILLATOR'],
        space: { type: 'INDOOR', size: 'LARGE' }
      };

      const coordination = await coordinator.coordinateEmergencyResponse(
        { type: 'CARDIAC', severity: 'HIGH' },
        resources
      );

      expect(coordination.assignments.coverage).toBe('COMPLETE');
      expect(coordination.commFlow.effectiveness).toBeGreaterThan(0.85);
      expect(coordination.management.resource_utilization).toBeGreaterThan(0.8);
    });

    test('should adapt coordination to changing conditions', async () => {
      const initialState = await coordinator.coordinateEmergencyResponse(
        { type: 'TRAUMA', severity: 'HIGH' },
        { personnel: [{ role: 'MEDICAL', count: 2 }] }
      );

      const updates = {
        new_personnel: [{ role: 'SPECIALIST', count: 1 }],
        condition_change: 'DETERIORATING',
        space_change: 'RESTRICTED'
      };

      const adjustments = await coordinator.monitorAndAdjust(initialState, updates);

      expect(adjustments.response_time).toBeLessThan(2000);
      expect(adjustments.effectiveness).toBeGreaterThan(0.8);
      expect(adjustments.roles.specialist_integration).toBe('SUCCESSFUL');
    });
  });

  describe('System Integration', () => {
    test('should maintain coherent response across all components', async () => {
      const emergency = {
        type: 'CARDIAC',
        severity: 'HIGH',
        location: { zone: 'MAIN_HALL', floor: 1 }
      };

      const context = {
        environment: 'INDOOR',
        resources: ['MEDICAL_STAFF', 'DEFIBRILLATOR'],
        constraints: { visual: 'MINIMAL', spatial: 'ADEQUATE' }
      };

      // Initialiser la réponse d'urgence
      const handlerResponse = await handler.handleMedicalEmergency(emergency, context);
      
      // Générer les signaux appropriés
      const signals = await signalSystem.generateEmergencySignal(
        emergency.type,
        { distance: 'MEDIUM', urgency: 'HIGH' }
      );

      // Coordonner la réponse
      const coordination = await coordinator.coordinateEmergencyResponse(
        emergency,
        context.resources
      );

      // Vérifier l'intégration
      expect(handlerResponse.metadata.effectiveness).toBeGreaterThan(0.8);
      expect(signals.metadata.visibility).toBeGreaterThan(0.9);
      expect(coordination.status.integration_score).toBeGreaterThan(0.85);

      // Vérifier la cohérence des temps de réponse
      expect(handlerResponse.metadata.response_time).toBeLessThan(
        coordination.metadata.setup_time
      );
    });
  });
});