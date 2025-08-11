// src/ai/system/expressions/situations/emergency/safety/__tests__/EvacuationSignalSystem.advanced.test.ts
import { EvacuationSignalSystem } from '../EvacuationSignalSystem';
import { EvacuationHandler } from '../EvacuationHandler';

describe('Evacuation Signal System Advanced Scenarios', () => {
  let signalSystem: EvacuationSignalSystem;
  let evacuationHandler: EvacuationHandler;

  beforeEach(() => {
    signalSystem = new EvacuationSignalSystem();
    evacuationHandler = new EvacuationHandler();
  });

  describe('Complex Environmental Challenges', () => {
    test('should handle power outage during evacuation', async () => {
      const scenario = {
        primary_emergency: 'FIRE',
        secondary_conditions: ['POWER_OUTAGE', 'SMOKE'],
        time: 'NIGHT',
        visibility: 'NEAR_ZERO'
      };

      const context = {
        lighting: 'EMERGENCY_ONLY',
        backup_systems: 'PARTIAL',
        population: {
          count: 75,
          distribution: 'MULTIPLE_FLOORS',
          special_needs: true
        }
      };

      const response = await signalSystem.generateEvacuationSignal(scenario, context);

      expect(response.signals.visibility_adaptations).toContain('REFLECTIVE_MARKERS');
      expect(response.signals.alternate_methods).toBeDefined();
      expect(response.metadata.effectiveness_in_darkness).toBeGreaterThan(0.85);
    });

    test('should manage multiple simultaneous hazards', async () => {
      const multiHazardScenario = {
        hazards: [
          { type: 'STRUCTURAL_DAMAGE', location: 'CENTRAL_STAIRS' },
          { type: 'WATER_LEAK', location: 'ELECTRICAL_ROOM' },
          { type: 'BLOCKED_PATH', location: 'MAIN_CORRIDOR' }
        ],
        urgency: 'HIGH',
        complexity: 'SEVERE'
      };

      const response = await evacuationHandler.handleEvacuation(multiHazardScenario);

      expect(response.route_planning.alternatives).toHaveLength(3);
      expect(response.hazard_signals.priority_order).toBeDefined();
      expect(response.coordination.decision_points).toBeGreaterThan(0);
    });
  });

  describe('Special Population Scenarios', () => {
    test('should handle mixed group with varying sign language proficiency', async () => {
      const mixedGroup = {
        population: {
          total: 100,
          composition: {
            native_signers: 30,
            beginner_signers: 40,
            non_signers: 30
          },
          languages: ['LSF', 'ASL', 'NON_SIGNING']
        }
      };

      const signals = await signalSystem.generateEvacuationSignal(
        { urgency: 'HIGH' },
        mixedGroup
      );

      expect(signals.communication_layers.length).toBeGreaterThanOrEqual(3);
      expect(signals.universal_signals).toBeDefined();
      expect(signals.comprehension_validation.methods.length).toBeGreaterThan(1);
    });

    test('should coordinate multiple disability accommodations', async () => {
      const complexNeeds = {
        population: {
          special_needs: [
            { type: 'DEAF_BLIND', count: 5 },
            { type: 'MOBILITY_IMPAIRED', count: 10 },
            { type: 'COGNITIVE_DISABILITY', count: 8 },
            { type: 'ELDERLY', count: 15 }
          ]
        },
        resources: {
          assistive_devices: ['TACTILE_SIGNALS', 'MOBILITY_AIDS'],
          support_personnel: 12
        }
      };

      const response = await evacuationHandler.handleEvacuation({ 
        urgency: 'HIGH',
        context: complexNeeds 
      });

      expect(response.support_assignments).toBeDefined();
      expect(response.pace_management.adaptations).toHaveLength(4);
      expect(response.accessibility_measures.coverage).toBe('COMPLETE');
    });
  });

  describe('Dynamic Situation Changes', () => {
    test('should adapt to rapidly changing conditions', async () => {
      const dynamicScenario = {
        initial_condition: 'FIRE_CONTAINED',
        changes: [
          { time: '+2min', event: 'FIRE_SPREAD' },
          { time: '+4min', event: 'STRUCTURAL_WARNING' },
          { time: '+6min', event: 'EXIT_BLOCKED' }
        ]
      };

      const signalUpdates = await signalSystem.monitorAndUpdateSignals(dynamicScenario);

      expect(signalUpdates.length).toBe(3);
      signalUpdates.forEach(update => {
        expect(update.response_time).toBeLessThan(1000);
        expect(update.clarity_score).toBeGreaterThan(0.85);
      });
    });

    test('should handle evacuation route changes mid-process', async () => {
      const routeChangeScenario = {
        initial_routes: ['MAIN', 'SECONDARY'],
        changes: [
          { 
            trigger: 'MAIN_ROUTE_BLOCKED',
            time: 'MID_EVACUATION',
            affected_groups: ['A', 'B']
          }
        ]
      };

      const response = await evacuationHandler.handleRouteChange(routeChangeScenario);

      expect(response.regroup_signals).toBeDefined();
      expect(response.new_route_communication.clarity).toBeGreaterThan(0.9);
      expect(response.transition_management.confusion_prevention).toBeDefined();
    });
  });

  describe('System Resilience', () => {
    test('should maintain effectiveness with partial system failure', async () => {
      const failureScenario = {
        system_status: {
          main_lights: 'FAILED',
          emergency_lights: 'PARTIAL',
          communication_system: 'DEGRADED'
        },
        backup_systems: {
          power: 'LIMITED',
          visibility_aids: 'AVAILABLE'
        }
      };

      const response = await signalSystem.generateEvacuationSignal(
        { urgency: 'HIGH' },
        failureScenario
      );

      expect(response.fallback_methods).toBeDefined();
      expect(response.redundancy_measures.active).toBe(true);
      expect(response.effectiveness_degraded).toBeFalsy();
    });

    test('should handle communication chain breaks', async () => {
      const chainBreakScenario = {
        visual_chain: {
          total_points: 10,
          broken_links: [3, 7],
          group_distribution: 'SCATTERED'
        }
      };

      const recovery = await signalSystem.handleChainBreak(chainBreakScenario);

      expect(recovery.chain_reconstruction.success).toBe(true);
      expect(recovery.message_propagation.coverage).toBe('COMPLETE');
      expect(recovery.response_time).toBeLessThan(2000);
    });
  });
});