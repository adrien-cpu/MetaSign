import { AdvancedAdaptationFeatures } from '../AdvancedFeatures';
import { AdaptationStrategy } from '../types/intervention.types';
import {
  AdvancedFeatureType,
  PredictionFocusType,
  SupportLevel,
  MatchingCriteria
} from '../types';

describe('Advanced Adaptation Features Tests', () => {
  let advancedFeatures: AdvancedAdaptationFeatures;

  beforeEach(() => {
    advancedFeatures = new AdvancedAdaptationFeatures();
  });

  describe('Predictive Adaptation Tests', () => {
    test('should predict and prevent fatigue-related challenges', async () => {
      const learningSession = {
        student: {
          id: 'student1',
          fatigue_history: [
            { timestamp: '2025-01-29T10:00:00', level: 'LOW' },
            { timestamp: '2025-01-29T10:30:00', level: 'MEDIUM' },
            { timestamp: '2025-01-29T11:00:00', level: 'HIGH' }
          ],
          known_patterns: {
            fatigue_onset: 'GRADUAL',
            recovery_time: 'MODERATE',
            peak_performance_window: 'MORNING'
          }
        },
        duration: 120, // minutes
        intensity: 'MODERATE'
      };

      const result = await advancedFeatures.implementAdvancedFeatures(
        learningSession,
        { prediction_focus: PredictionFocusType.FATIGUE_MANAGEMENT }
      );

      expect(result.featureType).toBe(AdvancedFeatureType.PREDICTIVE);
      expect(result.success).toBe(true);
      expect(result.predictions?.intervention_points.length).toBeGreaterThan(0);
      expect(result.strategies?.primary).toContain(AdaptationStrategy.BREAK_SCHEDULING);
      expect(result.metrics?.predictionAccuracy).toBeGreaterThan(0.85);
      expect(result.effectiveness).toBeGreaterThan(0.7);
    });

    test('should adapt to changing learning patterns in real-time', async () => {
      const dynamicSession = {
        basePerformance: 'MODERATE',
        progressionHistory: [
          { phase: 'INITIAL', performance: 0.7 },
          { phase: 'MIDPOINT', performance: 0.8 },
          { phase: 'CURRENT', performance: 0.75 }
        ],
        realTimeMetrics: {
          attention: 'FLUCTUATING',
          comprehension: 'VARIABLE',
          engagement: 'DECLINING'
        }
      };

      const adaptations = await advancedFeatures.implementAdvancedFeatures(
        dynamicSession,
        {
          sensitivity: 'HIGH',
          feature_type: AdvancedFeatureType.PREDICTIVE
        }
      );

      expect(adaptations.success).toBe(true);
      expect(adaptations.predictions?.scores.engagement).toBeLessThan(0.9);
      expect(adaptations.recommendations?.length).toBeGreaterThan(0);
      expect(adaptations.recommendations?.[0].priority).toBeGreaterThan(7);
      expect(adaptations.effectiveness).toBeGreaterThan(0.7);
    });
  });

  describe('Intelligent Assistance Tests', () => {
    test('should optimize environmental conditions based on learner needs', async () => {
      const environmentSession = {
        environment: {
          lighting: 'VARIABLE',
          noise_level: 'MODERATE',
          space_constraints: 'LIMITED'
        },
        learner: {
          visual_sensitivity: 'HIGH',
          attention_factors: ['EASILY_DISTRACTED', 'NEEDS_STRUCTURE'],
          spatial_preferences: 'ORGANIZED'
        },
        learning_objectives: ['SIGN_RECOGNITION', 'SPATIAL_GRAMMAR']
      };

      const assistance = await advancedFeatures.implementAdvancedFeatures(
        environmentSession,
        {
          optimization_priority: 'LEARNING_EFFICIENCY',
          feature_type: AdvancedFeatureType.INTELLIGENT_ASSISTANCE
        }
      );

      expect(assistance.featureType).toBe(AdvancedFeatureType.INTELLIGENT_ASSISTANCE);
      expect(assistance.success).toBe(true);
      expect(assistance.strategies?.primary).toContain(AdaptationStrategy.COGNITIVE_SUPPORT);
      expect(assistance.metrics?.environmentalOptimization).toBeGreaterThan(0.8);
      expect(assistance.recommendations?.some(r => r.type.includes('ENVIRONMENT'))).toBe(true);
    });

    test('should provide contextually appropriate cognitive support', async () => {
      const cognitiveSession = {
        learner: {
          processing_speed: 'VARIABLE',
          working_memory: 'LIMITED',
          attention_span: 'FLUCTUATING'
        },
        task: {
          complexity: 'HIGH',
          sequential_steps: true,
          memory_requirements: 'SIGNIFICANT'
        },
        current_state: {
          cognitive_load: 'INCREASING',
          comprehension: 'PARTIAL',
          frustration: 'LOW'
        }
      };

      const support = await advancedFeatures.implementAdvancedFeatures(
        cognitiveSession,
        {
          support_level: SupportLevel.ADAPTIVE,
          feature_type: AdvancedFeatureType.INTELLIGENT_ASSISTANCE
        }
      );

      expect(support.featureType).toBe(AdvancedFeatureType.INTELLIGENT_ASSISTANCE);
      expect(support.success).toBe(true);
      expect(support.strategies?.primary).toContain(AdaptationStrategy.COGNITIVE_SUPPORT);
      expect(support.effectiveness).toBeGreaterThan(0.8);
      expect(support.metrics?.cognitiveLoadReduction).toBeGreaterThan(0.7);
      expect(support.recommendations?.some(r => r.type === 'COGNITIVE_SUPPORT')).toBe(true);
    });
  });

  describe('Collaborative Learning Tests', () => {
    test('should effectively match peers for optimal learning support', async () => {
      const peerGroup = {
        students: [
          {
            id: 'student1',
            level: 'INTERMEDIATE',
            strengths: ['VOCABULARY', 'EXPRESSION'],
            needs: ['GRAMMAR', 'FLUENCY']
          },
          {
            id: 'student2',
            level: 'ADVANCED',
            strengths: ['GRAMMAR', 'CLARITY'],
            needs: ['CULTURAL_CONTEXT']
          },
          {
            id: 'student3',
            level: 'BEGINNER',
            strengths: ['ENTHUSIASM', 'CULTURAL_AWARENESS'],
            needs: ['TECHNICAL_SKILLS']
          }
        ],
        learning_objectives: ['PEER_SUPPORT', 'SKILL_EXCHANGE']
      };

      const collaboration = await advancedFeatures.implementAdvancedFeatures(
        peerGroup,
        {
          matching_criteria: MatchingCriteria.COMPLEMENTARY_SKILLS,
          feature_type: AdvancedFeatureType.COLLABORATION
        }
      );

      expect(collaboration.featureType).toBe(AdvancedFeatureType.COLLABORATION);
      expect(collaboration.success).toBe(true);
      expect(collaboration.strategies?.primary).toContain(AdaptationStrategy.PEER_SUPPORT);
      expect(collaboration.effectiveness).toBeGreaterThan(0.85);
      expect(collaboration.metrics?.peerInteraction).toBeGreaterThan(0.8);
      expect(collaboration.recommendations?.some(r => r.type === 'PEER_MATCHING')).toBe(true);
    });

    test('should maintain effective group dynamics in mixed-ability settings', async () => {
      const groupSession = {
        group_composition: {
          size: 5,
          levels: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
          special_needs: ['VISUAL', 'MOTOR', 'COGNITIVE']
        },
        activity: {
          type: 'COLLABORATIVE_PRACTICE',
          duration: 60,
          objectives: ['SKILL_SHARING', 'MUTUAL_SUPPORT']
        },
        dynamics: {
          current_interaction: 'POSITIVE',
          support_patterns: 'EMERGING',
          participation_levels: 'VARIED'
        }
      };

      const groupDynamics = await advancedFeatures.implementAdvancedFeatures(
        groupSession,
        {
          focus: 'GROUP_COHESION',
          feature_type: AdvancedFeatureType.COLLABORATION
        }
      );

      expect(groupDynamics.featureType).toBe(AdvancedFeatureType.COLLABORATION);
      expect(groupDynamics.success).toBe(true);
      expect(groupDynamics.effectiveness).toBeGreaterThan(0.85);
      expect(groupDynamics.metrics?.groupCohesion).toBeGreaterThan(0.8);
      expect(groupDynamics.recommendations?.some(r => r.type.includes('RESOURCE'))).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    test('should seamlessly integrate all advanced features', async () => {
      const complexSession = {
        learner: {
          profile: 'MULTI_NEED',
          adaptations: ['VISUAL', 'COGNITIVE'],
          learning_style: 'MIXED'
        },
        environment: {
          setting: 'DYNAMIC',
          resources: 'VARIED',
          support_network: 'AVAILABLE'
        },
        objectives: {
          primary: 'SKILL_ACQUISITION',
          secondary: 'SOCIAL_INTEGRATION'
        }
      };

      const result = await advancedFeatures.implementAdvancedFeatures(
        complexSession,
        { integration_level: 'FULL' }
      );

      expect(result.featureType).toBe(AdvancedFeatureType.INTEGRATED);
      expect(result.success).toBe(true);
      expect(result.effectiveness).toBeGreaterThan(0.9);
      expect(result.metrics?.systemIntegration).toBeGreaterThan(0.9);
      expect(result.strategies?.primary.length).toBeGreaterThan(2);
      expect(result.recommendations?.some(r => r.type === 'INTEGRATED_APPROACH')).toBe(true);
    });

    test('should handle complex adaptation scenarios gracefully', async () => {
      const complexScenario = {
        challenges: ['FATIGUE', 'ATTENTION', 'SOCIAL'],
        environment: 'CHANGING',
        support_needs: 'MULTIPLE',
        time_constraints: 'SIGNIFICANT'
      };

      const adaptations = await advancedFeatures.implementAdvancedFeatures(
        complexScenario,
        { complexity: 'HIGH' }
      );

      expect(adaptations.featureType).toBe(AdvancedFeatureType.INTEGRATED);
      expect(adaptations.success).toBe(true);
      expect(adaptations.effectiveness).toBeGreaterThan(0.85);
      expect(adaptations.strategies?.primary.length).toBeGreaterThan(1);
      expect(adaptations.recommendations?.length).toBeGreaterThan(1);
    });
  });

  describe('Utility Methods Tests', () => {
    test('should suggest adaptations based on context analysis', async () => {
      const context = {
        learner: {
          special_needs: ['VISUAL', 'ATTENTION'],
          preferences: {
            learning_style: 'VISUAL',
            pace: 'MODERATE'
          }
        },
        environment: {
          noise_level: 'HIGH',
          lighting: 'POOR'
        }
      };

      const suggestions = await advancedFeatures.suggestAdaptations(context);

      expect(suggestions.suggestions.length).toBeGreaterThan(0);
      expect(suggestions.urgency).toBeGreaterThan(0.7);
      expect(suggestions.relevance).toBeGreaterThan(0.8);
      expect(suggestions.contextFactors.length).toBeGreaterThan(0);
    });

    test('should evaluate effectiveness of adaptations', async () => {
      const adaptations = [
        {
          type: 'COGNITIVE_SUPPORT',
          implementation: 'MEMORY_AIDS',
          target: 'WORKING_MEMORY'
        },
        {
          type: 'ENVIRONMENTAL_OPTIMIZATION',
          implementation: 'NOISE_REDUCTION',
          target: 'ATTENTION'
        }
      ];

      const metrics = {
        cognitive_load_reduction: 0.75,
        attention: 0.82,
        engagement: 0.78,
        learning_efficiency: 0.8
      };

      const evaluation = await advancedFeatures.evaluateEffectiveness(adaptations, metrics);

      expect(evaluation.overallScore).toBeGreaterThan(0.75);
      expect(evaluation.breakdown).toBeDefined();
      expect(Object.keys(evaluation.breakdown).length).toBe(Object.keys(metrics).length);
      expect(evaluation.successMetrics).toEqual(metrics);
    });

    test('should refine adaptation strategies based on evaluation', async () => {
      const evaluation = {
        overallScore: 0.65,
        improvementAreas: ['engagement', 'cognitive_load']
      };

      const currentStrategies = [
        AdaptationStrategy.BREAK_SCHEDULING,
        AdaptationStrategy.CONTENT_RESTRUCTURING
      ];

      const refinement = await advancedFeatures.refineStrategy(evaluation,
        currentStrategies.map(s => s as string));

      expect(refinement.refinedStrategies.length).toBeGreaterThan(currentStrategies.length);
      expect(refinement.refinedStrategies).toContain(AdaptationStrategy.SIMPLIFIED_CONTENT);
      expect(refinement.refinedStrategies).toContain(AdaptationStrategy.COLLABORATIVE_LEARNING);
      expect(refinement.projectedImprovement).toBeGreaterThan(0);
      expect(refinement.implementation.priority).toBe('HIGH');
    });
  });
});