//src/ai/systems/expressions/situations/educational/__tests__/LSFEducationalSystem.test.ts
import { LSFEducationalHandler } from '@/ai/systems/expressions/situations/educational/LSFEducationalHandler';
import {
  LearningJourneyData,
  ProgressReportData,
  EducationalSessionData,
  LearningContextData,
  LearningLevel,
  SessionAnalysis,
  EducationalContent,
  SessionDelivery,
  LearningOutcomes
} from '@/ai/systems/expressions/situations/educational/types/educational-types';

describe('LSF Educational System', () => {
  let educationalHandler: LSFEducationalHandler;
  let learningContext: LearningContextData;

  beforeEach(() => {
    educationalHandler = new LSFEducationalHandler();
    learningContext = {
      culturalBackground: 'HEARING',
      learningStyle: 'VISUAL_KINESTHETIC',
      previousExperience: 'NONE',
      cultural_emphasis: 'HIGH',
      cultural_sensitivity: 'HIGH',
      visual_learning: 'PRIORITIZED',
      feedback_intensity: 'BALANCED',
      adaptive_learning: 'ENABLED'
    };
  });

  test('should track learning journey and generate progress report', async () => {
    const learningJourney: LearningJourneyData = {
      studentId: 'student1',
      stages: [
        {
          name: 'INTRODUCTION',
          completed: true,
          progressPercentage: 100,
          skillsAcquired: ['BASIC_VOCABULARY', 'CULTURAL_AWARENESS']
        },
        {
          name: 'BASIC_SKILLS',
          completed: false,
          progressPercentage: 50,
          skillsAcquired: ['HAND_SHAPES']
        }
      ],
      currentLevel: LearningLevel.BEGINNER,
      totalProgress: 75
    };

    // Utilisation d'un cast explicite pour satisfaire TypeScript avec exactOptionalPropertyTypes
    const progressReport = educationalHandler.generateProgressReport(
      learningJourney
    ) as ProgressReportData;

    expect(progressReport).toBeDefined();
    expect(progressReport.progressPercentage).toBeGreaterThanOrEqual(0);
    expect(progressReport.skillsSummary.improvementAreas).toBeTruthy();
    expect(progressReport.recommendedNextSteps).toBeTruthy();
    expect(progressReport.recommendedNextSteps.length).toBeGreaterThan(0);
  });

  test('should analyze session requirements and return adaptation strategy', () => {
    const beginnerSession: EducationalSessionData = {
      level: LearningLevel.BEGINNER,
      objectives: [
        {
          id: 'OBJ1',
          description: 'BASIC_VOCABULARY',
          category: 'KNOWLEDGE',
          difficultyLevel: 'BASIC',
          assessmentCriteria: []
        }
      ],
      participants: [
        {
          id: 'student1',
          proficiencyLevel: 'BEGINNER',
          preferredLearningStyles: ['VISUAL'],
          accessibilityNeeds: [],
          experience: 'NONE',
          learningStyle: 'VISUAL',
          culturalBackground: 'HEARING'
        }
      ],
      duration: 90
    };

    const sessionAnalysis: SessionAnalysis = educationalHandler.analyzeSessionRequirements(
      beginnerSession,
      learningContext
    );

    expect(sessionAnalysis).toBeDefined();
    expect(sessionAnalysis.adaptationStrategy).toBe('VISUAL_GUIDED_LEARNING');
  });

  test('should prepare educational content based on session requirements', () => {
    const beginnerSession: EducationalSessionData = {
      level: LearningLevel.BEGINNER,
      objectives: [
        {
          id: 'OBJ1',
          description: 'BASIC_VOCABULARY',
          category: 'KNOWLEDGE',
          difficultyLevel: 'BASIC',
          assessmentCriteria: []
        }
      ],
      participants: [
        {
          id: 'student1',
          proficiencyLevel: 'BEGINNER',
          preferredLearningStyles: ['VISUAL'],
          accessibilityNeeds: [],
          experience: 'NONE',
          learningStyle: 'VISUAL',
          culturalBackground: 'HEARING'
        }
      ],
      duration: 90
    };

    const educationalContent: EducationalContent = educationalHandler.prepareEducationalContent(
      beginnerSession
    );

    expect(educationalContent).toBeDefined();
    expect(educationalContent.contentType).toBe('INTERACTIVE_VISUAL');
    expect(educationalContent.difficulty).toBe(LearningLevel.BEGINNER);
  });

  test('should deliver educational content and return session delivery details', () => {
    const educationalContent: EducationalContent = {
      contentType: 'INTERACTIVE_VISUAL',
      difficulty: LearningLevel.BEGINNER
    };

    const sessionDelivery: SessionDelivery = educationalHandler.deliverEducationalContent(
      educationalContent,
      learningContext
    );

    expect(sessionDelivery).toBeDefined();
    expect(sessionDelivery.deliveryMethod).toBe('SUCCESSFUL_DELIVERY');
  });

  test('should evaluate session results and return learning outcomes', () => {
    const beginnerSession: EducationalSessionData = {
      level: LearningLevel.BEGINNER,
      objectives: [
        {
          id: 'OBJ1',
          description: 'BASIC_VOCABULARY',
          category: 'KNOWLEDGE',
          difficultyLevel: 'BASIC',
          assessmentCriteria: []
        }
      ],
      participants: [
        {
          id: 'student1',
          proficiencyLevel: 'BEGINNER',
          preferredLearningStyles: ['VISUAL'],
          accessibilityNeeds: [],
          experience: 'NONE',
          learningStyle: 'VISUAL',
          culturalBackground: 'HEARING'
        }
      ],
      duration: 90
    };

    const learningOutcomes: LearningOutcomes = educationalHandler.evaluateSessionResults(
      beginnerSession,
      learningContext
    );

    expect(learningOutcomes).toBeDefined();
    expect(learningOutcomes.understanding).toBeGreaterThan(0);
    expect(learningOutcomes.skillsGained).toContain('BASIC_VOCABULARY');
  });

  test('should handle complete educational session flow', () => {
    const beginnerSession: EducationalSessionData = {
      level: LearningLevel.BEGINNER,
      objectives: [
        {
          id: 'OBJ1',
          description: 'BASIC_VOCABULARY',
          category: 'KNOWLEDGE',
          difficultyLevel: 'BASIC',
          assessmentCriteria: []
        }
      ],
      participants: [
        {
          id: 'student1',
          proficiencyLevel: 'BEGINNER',
          preferredLearningStyles: ['VISUAL'],
          accessibilityNeeds: [],
          experience: 'NONE',
          learningStyle: 'VISUAL',
          culturalBackground: 'HEARING'
        }
      ],
      duration: 90
    };

    // Step 1: Analyze requirements
    const sessionAnalysis: SessionAnalysis = educationalHandler.analyzeSessionRequirements(
      beginnerSession,
      learningContext
    );

    // Step 2: Prepare content
    const educationalContent: EducationalContent = educationalHandler.prepareEducationalContent(
      beginnerSession
    );

    // Step 3: Deliver content
    const sessionDelivery: SessionDelivery = educationalHandler.deliverEducationalContent(
      educationalContent,
      learningContext
    );

    // Step 4: Evaluate results
    const learningOutcomes: LearningOutcomes = educationalHandler.evaluateSessionResults(
      beginnerSession,
      learningContext
    );

    // Verify all components worked correctly
    expect(sessionAnalysis.adaptationStrategy).toBe('VISUAL_GUIDED_LEARNING');
    expect(educationalContent.contentType).toBe('INTERACTIVE_VISUAL');
    expect(sessionDelivery.deliveryMethod).toBe('SUCCESSFUL_DELIVERY');
    expect(learningOutcomes.understanding).toBeGreaterThan(0);
    expect(learningOutcomes.skillsGained.length).toBeGreaterThan(0);
  });

  test('should adapt educational strategy based on learning level', () => {
    const learningLevels = [
      LearningLevel.BEGINNER,
      LearningLevel.INTERMEDIATE,
      LearningLevel.ADVANCED
    ];

    const strategies: Record<LearningLevel, string> = {
      [LearningLevel.BEGINNER]: 'VISUAL_GUIDED_LEARNING',
      [LearningLevel.INTERMEDIATE]: 'INTERACTIVE_CHALLENGE',
      [LearningLevel.ADVANCED]: 'PROBLEM_BASED_LEARNING'
    };

    learningLevels.forEach((level) => {
      const session: EducationalSessionData = {
        level,
        objectives: [{
          id: 'OBJ1',
          description: 'TEST_OBJECTIVE',
          category: 'KNOWLEDGE',
          difficultyLevel: 'BASIC',
          assessmentCriteria: []
        }],
        participants: [{
          id: 'student1',
          proficiencyLevel: level,
          preferredLearningStyles: ['VISUAL'],
          accessibilityNeeds: [],
          experience: 'VARIES',
          learningStyle: 'VISUAL',
          culturalBackground: 'HEARING'
        }],
        duration: 90
      };

      const analysis = educationalHandler.analyzeSessionRequirements(session, learningContext);
      expect(analysis.adaptationStrategy).toBe(strategies[level]);
    });
  });
});