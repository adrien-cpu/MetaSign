// src/ai/system/expressions/situations/emergency/safety/__tests__/EvacuationSignalSystem.test.ts
import { EvacuationSignalSystem } from '../EvacuationSignalSystem';
import { EvacuationHandler } from '../EvacuationHandler';

describe('Evacuation Signal System', () => {
  let signalSystem: EvacuationSignalSystem;
  let evacuationHandler: EvacuationHandler;

  beforeEach(() => {
    signalSystem = new EvacuationSignalSystem();
    evacuationHandler = new EvacuationHandler();
  });

  describe('Emergency Signal Generation', () => {
    test('should generate high urgency evacuation signals correctly', async () => {
      const situation = {
        type: 'FIRE',
        urgency: 'HIGH',
        location: { zone: 'MAIN_BUILDING', floor: 2 },
        hazards: ['SMOKE', 'HEAT', 'BLOCKED_EXITS']
      };

      const context = {
        environment: {
          lighting: 'POOR',
          visibility: 'REDUCED',
          space: 'CONFINED'
        },
        population: {
          count: 50,
          composition: ['DEAF', 'HARD_OF_HEARING', 'HEARING'],
          special_needs: ['MOBILITY_IMPAIRED']
        }
      };

      const signal = await signalSystem.generateEvacuationSignal(situation, context);

      // Vérification des composants principaux du signal
      expect(signal.signals.primary.manual_components.movement.speed).toBe('VERY_FAST');
      expect(signal.signals.primary.manual_components.amplitude).toBe('MAXIMUM');
      expect(signal.signals.primary.non_manual_components.facial_expression.intensity).toBe('MAXIMUM');
      expect(signal.metadata.urgency_level).toBe('HIGH');
      expect(signal.metadata.effectiveness_metrics.visibility_score).toBeGreaterThan(0.9);
    });

    test('should adapt signals to poor visibility conditions', async () => {
      const situation = {
        type: 'EMERGENCY',
        urgency: 'HIGH',
        constraints: { visibility: 'VERY_LOW' }
      };

      const signal = await signalSystem.generateEvacuationSignal(situation, {
        environment: { lighting: 'MINIMAL' }
      });

      expect(signal.signals.adaptations).toContain('ENHANCED_CONTRAST');
      expect(signal.signals.primary.movement.amplitude).toBe('MAXIMUM');
      expect(signal.signals.backup.visual_aids.active).toBe(true);
    });
  });

  describe('Signal Adaptation and Context Sensitivity', () => {
    test('should modify signals based on spatial constraints', async () => {
      const crowdedContext = {
        environment: { space: 'CROWDED' },
        population: { density: 'HIGH' }
      };

      const signal = await signalSystem.generateEvacuationSignal(
        { type: 'EVACUATION', urgency: 'HIGH' },
        crowdedContext
      );

      expect(signal.signals.space_management.type).toBe('OPTIMIZED_VISIBILITY');
      expect(signal.signals.movement_pattern.adaptation).toBe('CROWD_AWARE');
    });

    test('should handle multiple special needs simultaneously', async () => {
      const specialNeedsContext = {
        population: {
          special_needs: [
            'MOBILITY_IMPAIRED',
            'VISUALLY_IMPAIRED',
            'ELDERLY'
          ]
        }
      };

      const signal = await signalSystem.generateEvacuationSignal(
        { type: 'EVACUATION', urgency: 'HIGH' },
        specialNeedsContext
      );

      expect(signal.signals.adaptations).toContain('MOBILITY_SUPPORT');
      expect(signal.signals.adaptations).toContain('ENHANCED_VISIBILITY');
      expect(signal.signals.pace_control.type).toBe('ADAPTIVE');
    });
  });

  describe('Signal Effectiveness Validation', () => {
    test('should validate signal visibility across different distances', async () => {
      const distances = ['CLOSE', 'MEDIUM', 'FAR'];
      
      for (const distance of distances) {
        const signal = await signalSystem.generateEvacuationSignal(
          { urgency: 'HIGH' },
          { viewing_distance: distance }
        );

        expect(signal.metadata.visibility_metrics[distance]).toBeGreaterThan(0.8);
        expect(signal.metadata.comprehension_scores[distance]).toBeGreaterThan(0.85);
      }
    });

    test('should maintain effectiveness under stress conditions', async () => {
      const stressContext = {
        environment: {
          noise: 'HIGH',
          chaos: 'SIGNIFICANT',
          time_pressure: 'EXTREME'
        }
      };

      const signal = await signalSystem.generateEvacuationSignal(
        { urgency: 'HIGH' },
        stressContext
      );

      expect(signal.metadata.stress_resilience_score).toBeGreaterThan(0.9);
      expect(signal.metadata.clarity_under_pressure).toBeGreaterThan(0.85);
    });
  });

  describe('Group Coordination Signals', () => {
    test('should coordinate multiple group movements effectively', async () => {
      const groupContext = {
        population: {
          groups: [
            { size: 15, location: 'ZONE_A' },
            { size: 20, location: 'ZONE_B' }
          ],
          total: 35
        },
        exit_routes: ['MAIN', 'SECONDARY']
      };

      const coordination = await signalSystem.generateGroupCoordinationSignals(
        { urgency: 'HIGH' },
        groupContext
      );

      expect(coordination.group_signals.length).toBe(2);
      expect(coordination.route_assignments).toBeDefined();
      expect(coordination.convergence_points).toBeDefined();
      expect(coordination.effectiveness_metrics.group_cohesion).toBeGreaterThan(0.8);
    });

    test('should maintain visual contact chain in large groups', async () => {
      const largeGroupContext = {
        population: {
          size: 100,
          distribution: 'SCATTERED'
        }
      };

      const signals = await signalSystem.generateEvacuationSignal(
        { urgency: 'HIGH' },
        largeGroupContext
      );

      expect(signals.visual_chain.coverage).toBe('COMPLETE');
      expect(signals.visual_chain.redundancy).toBeGreaterThan(0);
      expect(signals.relay_points.length).toBeGreaterThan(3);
    });
  });

  describe('Integration Tests with Evacuation Handler', () => {
    test('should coordinate signals with evacuation phases', async () => {
      const evacuation = await evacuationHandler.handleEvacuation({
        type: 'FIRE',
        urgency: 'HIGH'
      });

      const signals = evacuation.phases.map(phase => 
        phase.signals.metadata.effectiveness_metrics
      );

      expect(signals.every(s => s.clarity > 0.8)).toBe(true);
      expect(signals.every(s => s.comprehension > 0.85)).toBe(true);
      expect(signals.every(s => s.response_time < 2000)).toBe(true);
    });

    test('should maintain signal effectiveness throughout evacuation', async () => {
      const longEvacuation = await evacuationHandler.handleEvacuation({
        type: 'COMPLEX',
        duration: 'EXTENDED'
      });

      const effectivenessOverTime = longEvacuation.timeline.map(t => 
        t.signal_effectiveness
      );

      expect(Math.min(...effectivenessOverTime)).toBeGreaterThan(0.8);
      expect(
        effectivenessOverTime.every((val, idx, arr) => 
          idx === 0 || Math.abs(val - arr[idx-1]) < 0.1
        )
      ).toBe(true);
    });
  });
});