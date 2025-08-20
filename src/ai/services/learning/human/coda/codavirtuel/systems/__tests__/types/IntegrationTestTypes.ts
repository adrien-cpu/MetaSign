/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/__tests__/types/IntegrationTestTypes.ts
 * @description Types TypeScript stricts pour les tests d'intégration du système émotionnel
 * 
 * Ce fichier définit tous les types utilisés dans les tests d'intégration avec un typage strict
 * conforme aux bonnes pratiques du projet MetaSign.
 * 
 * ## Types définis :
 * - 🔧 **Configuration générique** : Types pour la configuration des systèmes de test
 * - 👤 **Données de personnalité** : Types stricts pour les profils de personnalité
 * - 🧪 **Systèmes de test** : Interfaces pour les mocks et factories
 * - 📊 **Métriques de performance** : Types pour les mesures de performance
 * - 🔍 **Analyse des patterns** : Types pour la détection de patterns émotionnels
 * 
 * @module IntegrationTestTypes
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Testing Division
 * 
 * @requires EmotionalTypes
 * 
 * @see {@link ../IntegrationTestFactory} - Factory pour créer les instances de test
 * @see {@link ../IntegrationTestUtils} - Utilitaires pour les tests
 */

// Types de base pour le système émotionnel (définis localement pour éviter les dépendances)
export interface EmotionalState {
    readonly primaryEmotion: string;
    readonly intensity: number;
    readonly valence: number;
    readonly arousal: number;
    readonly timestamp: Date;
    readonly trigger: string;
    readonly context?: string;
    readonly studentId?: string;
}

export interface EmotionGenerationParams {
    readonly learningContext: string;
    readonly stimulus: string;
    readonly stimulusIntensity: number;
    readonly learningOutcome: 'success' | 'partial' | 'failure';
    readonly contextualFactors: ReadonlyArray<string>;
}

/**
 * Configuration générique pour les systèmes de test
 */
export interface TestSystemConfig {
    readonly enableAdvancedFeatures?: boolean;
    readonly testMode?: boolean;
    readonly complexity?: 'low' | 'medium' | 'high' | 'adaptive';
    readonly supportLevel?: 'low' | 'medium' | 'high' | 'specialized';
    readonly adaptationEnabled?: boolean;
    readonly enableExperimentalFeatures?: boolean;
    readonly debugMode?: boolean;
    readonly [key: string]: unknown;
}

/**
 * Données de personnalité avec typage strict
 */
export interface PersonalityTestData {
    readonly learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
    readonly culturalBackground?: 'deaf_community' | 'hearing_family' | 'mixed' | 'other';
    readonly motivationFactors?: ReadonlyArray<'achievement' | 'helping_others' | 'learning' | 'social'>;
    readonly stressThreshold?: number;
    readonly bigFiveTraits?: {
        readonly openness: number;
        readonly conscientiousness: number;
        readonly extraversion: number;
        readonly agreeableness: number;
        readonly neuroticism: number;
    };
    readonly [key: string]: unknown;
}

/**
 * Interface pour les systèmes de personnalité mockés
 */
export interface MockPersonalitySystem {
    createInitialProfile(studentId: string, data: PersonalityTestData): PersonalityTestData;
}

/**
 * Interface pour les systèmes émotionnels avec méthodes optionnelles
 */
export interface TestableEmotionalSystem {
    generateEmotionalState(studentId: string, params: EmotionGenerationParams): Promise<EmotionalState>;
    getCurrentEmotionalState?(studentId: string): EmotionalState | undefined;
    registerPersonalityProfile?(studentId: string, personality: PersonalityTestData): Promise<void>;
    performCompleteAnalysis?(studentId: string): Promise<EmotionalAnalysis>;
    getEmotionalHistory?(studentId: string): Promise<EmotionalHistory | undefined>;
    getSystemStatistics?(): SystemStatistics;
    cleanupStudentData?(studentId: string): Promise<void>;
    shutdown?(): Promise<void>;
    restoreEmotionalState?(studentId: string, state: EmotionalState): Promise<void>;
}

/**
 * Résultat d'analyse émotionnelle complète
 */
export interface EmotionalAnalysis {
    readonly currentState: EmotionalState;
    readonly recentHistory: ReadonlyArray<EmotionalState>;
    readonly patterns: ReadonlyArray<EmotionalPattern>;
    readonly recommendations: ReadonlyArray<string>;
    readonly confidence: number;
}

/**
 * Historique émotionnel d'un étudiant
 */
export interface EmotionalHistory {
    readonly studentId: string;
    readonly stateHistory: ReadonlyArray<EmotionalState>;
    readonly createdAt: Date;
    readonly lastUpdated: Date;
}

/**
 * Pattern émotionnel détecté
 */
export interface EmotionalPattern {
    readonly type: 'recovery_bounce' | 'learning_cycle' | 'frustration_pattern' | 'success_pattern';
    readonly confidence: number;
    readonly description: string;
    readonly detectedAt: Date;
    readonly relevantStates: ReadonlyArray<string>; // IDs des états concernés
}

/**
 * Statistiques du système émotionnel
 */
export interface SystemStatistics {
    readonly totalActiveStudents: number;
    readonly totalStatesGenerated: number;
    readonly averageProcessingTime: number;
    readonly memoryUsage: number;
    readonly uptime: number;
}

/**
 * Configuration de contexte d'apprentissage
 */
export interface LearningContext {
    readonly name: string;
    readonly outcome: 'success' | 'partial' | 'failure';
    readonly intensity: number;
    readonly difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Session d'apprentissage pour les tests
 */
export interface LearningSession {
    readonly phase: 'discovery' | 'progression' | 'mastery';
    readonly sessions: number;
    readonly difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Exercice d'apprentissage
 */
export interface LearningExercise {
    readonly name: string;
    readonly outcome: 'success' | 'partial' | 'failure';
    readonly intensity: number;
}

/**
 * Système CODA mocké pour les tests
 */
export interface MockCODASystem {
    evaluateSignExecution(studentId: string, signData: SignExecutionData): Promise<CODAEvaluation>;
}

/**
 * Données d'exécution de signe
 */
export interface SignExecutionData {
    readonly sign: string;
    readonly complexity: 'easy' | 'medium' | 'hard';
    readonly [key: string]: unknown;
}

/**
 * Évaluation CODA
 */
export interface CODAEvaluation {
    readonly accuracy: number;
    readonly feedback: string;
    readonly difficulty: string;
}

/**
 * Métriques de performance pour les tests
 */
export interface PerformanceMetrics {
    readonly startTime: number;
    readonly endTime: number;
    readonly totalTime: number;
    readonly totalOperations: number;
    readonly avgTimePerOperation: number;
    readonly memoryBefore: number;
    readonly memoryAfter: number;
    readonly memoryIncrease: number;
}

/**
 * Résultat de test de performance
 */
export interface PerformanceTestResult {
    readonly metrics: PerformanceMetrics;
    readonly passed: boolean;
    readonly thresholds: {
        readonly maxAvgTimePerOperation: number;
        readonly maxTotalTime: number;
        readonly maxMemoryIncrease: number;
    };
}

/**
 * Configuration de test de stress
 */
export interface StressTestConfig {
    readonly numStudents: number;
    readonly operationsPerStudent: number;
    readonly maxConcurrent: number;
    readonly timeoutMs: number;
}

/**
 * Résultat de test de stress
 */
export interface StressTestResult {
    readonly totalOperations: number;
    readonly totalTime: number;
    readonly successfulOperations: number;
    readonly failedOperations: number;
    readonly averageLatency: number;
    readonly maxLatency: number;
    readonly memoryUsage: number;
}

/**
 * Type guards pour la validation des objets
 */
export const TypeGuards = {
    isPersonalityTestData(obj: unknown): obj is PersonalityTestData {
        return typeof obj === 'object' && obj !== null;
    },

    isEmotionalAnalysis(obj: unknown): obj is EmotionalAnalysis {
        return typeof obj === 'object' && obj !== null &&
            'currentState' in obj && 'confidence' in obj;
    },

    isSystemStatistics(obj: unknown): obj is SystemStatistics {
        return typeof obj === 'object' && obj !== null &&
            'totalActiveStudents' in obj;
    },

    isEmotionalHistory(obj: unknown): obj is EmotionalHistory {
        return typeof obj === 'object' && obj !== null &&
            'studentId' in obj && 'stateHistory' in obj;
    }
} as const;