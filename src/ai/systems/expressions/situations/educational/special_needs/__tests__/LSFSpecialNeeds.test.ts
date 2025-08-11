// src/ai/system/expressions/situations/educational/special_needs/__tests__/LSFSpecialNeeds.test.ts
import { LSFSpecialNeedsHandler } from '../LSFSpecialNeedsHandler';

describe('LSF Special Needs System', () => {
  let specialNeedsHandler: LSFSpecialNeedsHandler;

  beforeEach(() => {
    specialNeedsHandler = new LSFSpecialNeedsHandler();
  });

  describe('Visual Impairment Adaptations', () => {
    test('should adapt correctly for low vision students', async () => {
      const session = {
        participant: {
          id: 'student1',
          needs_profile: 'LOW_VISION',
          visual_acuity: 0.3,
          preferred_distance: 'CLOSE'
        },
        objectives: ['BASIC_VOCABULARY', 'SPATIAL_CONCEPTS'],
        support_requirements: {
          lighting: 'ENHANCED',
          contrast: 'HIGH',
          viewing_distance: 'FLEXIBLE'
        }
      };

      const result = await specialNeedsHandler.handleSpecialNeedsSession(
        session,
        { environment: 'CONTROLLED_LIGHTING' }
      );

      expect(result.adaptations.visual.contrast_enhancement).toBeGreaterThan(0.9);
      expect(result.adaptations.spatial.distance_adjustment).toBe('OPTIMIZED');
      expect(result.effectiveness.learning_access).toBeGreaterThan(0.85);
    });

    test('should handle specific visual field restrictions', async () => {
      const visualFieldCases = [
        { field: 'CENTRAL', adaptation: 'PERIPHERAL_FOCUS' },
        { field: 'PERIPHERAL', adaptation: 'CENTRAL_FOCUS' },
        { field: 'PATCHY', adaptation: 'MULTI_ZONE' }
      ];

      for (const caseData of visualFieldCases) {
        const result = await specialNeedsHandler.handleSpecialNeedsSession({
          participant: {
            needs_profile: 'SPECIFIC_VISUAL_FIELD',
            field_type: caseData.field,
            adaptation_history: 'DOCUMENTED'
          },
          objectives: ['SIGN_RECOGNITION', 'SPATIAL_TRACKING']
        }, { adaptation_focus: caseData.adaptation });

        expect(result.adaptations.visual_field.coverage).toBe('COMPLETE');
        expect(result.adaptations.strategy).toBe(caseData.adaptation);
        expect(result.effectiveness.visual_access).toBeGreaterThan(0.8);
      }
    });
  });

  describe('Motor Challenges Adaptations', () => {
    test('should provide appropriate fine motor adaptations', async () => {
      const motorSession = {
        participant: {
          needs_profile: 'FINE_MOTOR',
          mobility_level: 'RESTRICTED',
          fatigue_pattern: 'PROGRESSIVE'
        },
        objectives: ['SIGN_PRODUCTION', 'MOVEMENT_CONTROL'],
        duration: 45
      };

      const result = await specialNeedsHandler.handleSpecialNeedsSession(
        motorSession,
        { support_level: 'HIGH' }
      );

      expect(result.adaptations.movement.simplification).toBeDefined();
      expect(result.adaptations.energy_management.rest_intervals).toBeDefined();
      expect(result.effectiveness.motor_support).toBeGreaterThan(0.85);
    });

    test('should manage fatigue and endurance effectively', async () => {
      const extendedSession = {
        participant: {
          needs_profile: 'MOTOR_FATIGUE',
          endurance_level: 'LIMITED',
          rest_requirements: 'FREQUENT'
        },
        duration: 90,
        activity_intensity: 'VARIABLE'
      };

      const result = await specialNeedsHandler.handleSpecialNeedsSession(
        extendedSession,
        { energy_management: 'PRIORITY' }
      );

      expect(result.adaptations.session_structure.breaks).toHaveLength(3);
      expect(result.adaptations.activity_intensity.curve).toBe('MANAGED');
      expect(result.effectiveness.endurance_management).toBeGreaterThan(0.9);
    });
  });

  describe('Cognitive Variations Support', () => {
    test('should adapt to different processing speeds', async () => {
      const processingSpeedCases = [
        { speed: 'SLOW', adaptation_level: 'HIGH' },
        { speed: 'VARIABLE', adaptation_level: 'DYNAMIC' },
        { speed: 'INCONSISTENT', adaptation_level: 'FLEXIBLE' }
      ];

      for (const caseData of processingSpeedCases) {
        const result = await specialNeedsHandler.handleSpecialNeedsSession({
          participant: {
            needs_profile: 'PROCESSING_SPEED',
            speed_characteristic: caseData.speed,
            learning_style: 'SEQUENTIAL'
          },
          objectives: ['CONCEPT_UNDERSTANDING', 'SIGN_PRODUCTION']
        }, { pace_adaptation: caseData.adaptation_level });

        expect(result.adaptations.pacing.type).toBe(caseData.adaptation_level);
        expect(result.effectiveness.comprehension).toBeGreaterThan(0.8);
        expect(result.support_strategies).toContain('STEP_BY_STEP');
      }
    });

    test('should provide effective attention support', async () => {
      const attentionSession = {
        participant: {
          needs_profile: 'ATTENTION_FOCUS',
          attention_pattern: 'FLUCTUATING',
          environmental_sensitivity: 'HIGH'
        },
        objectives: ['SUSTAINED_ATTENTION', 'CONCEPT_RETENTION'],
        session_type: 'STRUCTURED'
      };

      const result = await specialNeedsHandler.handleSpecialNeedsSession(
        attentionSession,
        { environment: 'CONTROLLED' }
      );

      expect(result.adaptations.environment.distractions).toBe('MINIMIZED');
      expect(result.adaptations.session_structure.segments).toBeDefined();
      expect(result.effectiveness.attention_maintenance).toBeGreaterThan(0.85);
    });
  });

  describe('Multi-Need Integration', () => {
    test('should handle multiple needs effectively', async () => {
      const complexSession = {
        participant: {
          needs_profile: 'MULTI_NEED',
          primary_needs: ['VISUAL', 'MOTOR'],
          secondary_needs: ['PROCESSING'],
          interaction_effects: 'DOCUMENTED'
        },
        objectives: ['INTEGRATED_LEARNING', 'ADAPTIVE_STRATEGIES']
      };

      const result = await specialNeedsHandler.handleSpecialNeedsSession(
        complexSession,
        { integration_level: 'COMPREHENSIVE' }
      );

      expect(result.adaptations.strategy_integration).toBe('HARMONIZED');
      expect(result.adaptations.conflict_resolution).toBeDefined();
      expect(result.effectiveness.overall_support).toBeGreaterThan(0.85);
    });

    test('should prioritize adaptations appropriately', async () => {
      const prioritySession = {
        participant: {
          needs_profile: 'COMPLEX',
          needs_hierarchy: ['CRITICAL', 'IMPORTANT', 'SUPPORTIVE'],
          adaptation_history: 'PROGRESSIVE'
        },
        resources: 'LIMITED'
      };

      const result = await specialNeedsHandler.handleSpecialNeedsSession(
        prioritySession,
        { prioritization: 'REQUIRED' }
      );

      expect(result.adaptations.priority_implementation).toBeDefined();
      expect(result.resource_allocation).toBeOptimized();
      expect(result.effectiveness.critical_needs_support).toBeGreaterThan(0.9);
    });
  });

  describe('Progress Monitoring', () => {
    test('should track adaptation effectiveness over time', async () => {
      const longTermSession = {
        participant: {
          id: 'student1',
          tracking_history: ['WEEK1', 'WEEK2', 'WEEK3'],
          adaptation_adjustments: 'DOCUMENTED'
        },
        evaluation_period: 'MONTHLY'
      };

      const result = await specialNeedsHandler.generateProgressReport(
        longTermSession
      );

      expect(result.progress_trends).toBeDefined();
      expect(result.adaptation_effectiveness).toShowImprovement();
      expect(result.recommendations).toBeDataDriven();
    });
  });
});