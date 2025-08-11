//src/ai/learning/config/learning-config.ts
export interface LearningSystemConfig {
    defaultStudyTime: number;
    maxDailyLearningHours: number;
    experienceMultipliers: {
        moduleCompletion: number;
        quizPerformance: number;
        exerciseCompletion: number;
    };
}

export const defaultLearningConfig: LearningSystemConfig = {
    defaultStudyTime: 30,
    maxDailyLearningHours: 2,
    experienceMultipliers: {
        moduleCompletion: 1,
        quizPerformance: 0.5,
        exerciseCompletion: 0.75
    }
};