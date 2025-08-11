/**
 * Point d'entrée pour le module d'évaluation des mentors CODA - Version finale
 * @file src/ai/services/learning/human/coda/codavirtuel/evaluators/analyzers/index.ts
 * @module ai/services/learning/human/coda/codavirtuel/evaluators/analyzers
 * @description Exports centralisés pour l'évaluation des mentors
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2025
 * @lastModified 2025-01-15
 */

// Export des classes principales
export { MentorEvaluator } from './MentorEvaluator';
export { MentorCompetencyAnalyzer } from './MentorCompetencyAnalyzer';
export { MentorRecommendationEngine } from './MentorRecommendationEngine';

// Export des autres analyseurs existants (si présents - exports conditionnels)
export { EmotionalAnalyzer } from './EmotionalAnalyzer';
export { AIStudentEvolver } from './AIStudentEvolver';

// Import des classes pour les factory functions
import { MentorEvaluator } from './MentorEvaluator';
import { MentorCompetencyAnalyzer } from './MentorCompetencyAnalyzer';
import { MentorRecommendationEngine } from './MentorRecommendationEngine';

// Import des types nécessaires
import type { EmotionalConfig } from '../types/CODAEvaluatorTypes';

/**
 * Factory function pour créer un évaluateur de mentor complet
 * @param emotionalConfig Configuration émotionnelle
 * @returns Instance configurée du MentorEvaluator
 * 
 * @example
 * ```typescript
 * import { createMentorEvaluator } from './analyzers';
 * 
 * const evaluator = createMentorEvaluator({
 *   frustrationThreshold: 0.7,
 *   motivationBoost: 0.3,
 *   culturalSensitivityWeight: 0.2,
 *   empathyWeight: 0.4
 * });
 * ```
 */
export function createMentorEvaluator(emotionalConfig: EmotionalConfig): MentorEvaluator {
    return new MentorEvaluator(emotionalConfig);
}

/**
 * Factory function pour créer un analyseur de compétences
 * @param emotionalConfig Configuration émotionnelle
 * @returns Instance configurée du MentorCompetencyAnalyzer
 * 
 * @example
 * ```typescript
 * import { createCompetencyAnalyzer } from './analyzers';
 * 
 * const analyzer = createCompetencyAnalyzer({
 *   frustrationThreshold: 0.7,
 *   motivationBoost: 0.3,
 *   culturalSensitivityWeight: 0.2,
 *   empathyWeight: 0.4
 * });
 * ```
 */
export function createCompetencyAnalyzer(emotionalConfig: EmotionalConfig): MentorCompetencyAnalyzer {
    return new MentorCompetencyAnalyzer(emotionalConfig);
}

/**
 * Factory function pour créer un moteur de recommandations
 * @param config Configuration optionnelle du moteur
 * @returns Instance configurée du MentorRecommendationEngine
 * 
 * @example
 * ```typescript
 * import { createRecommendationEngine } from './analyzers';
 * 
 * const engine = createRecommendationEngine({
 *   maxRecommendationsPerLevel: 5,
 *   includeEmotionalRecommendations: true,
 *   includePracticeExercises: false
 * });
 * ```
 */
export function createRecommendationEngine(config?: {
    readonly maxRecommendationsPerLevel?: number;
    readonly includeEmotionalRecommendations?: boolean;
    readonly includePracticeExercises?: boolean;
}): MentorRecommendationEngine {
    return new MentorRecommendationEngine(config);
}

/**
 * Configuration par défaut pour l'évaluation émotionnelle
 */
export const DEFAULT_EMOTIONAL_CONFIG: EmotionalConfig = {
    frustrationThreshold: 0.7,
    motivationBoost: 0.3,
    culturalSensitivityWeight: 0.2,
    empathyWeight: 0.4
} as const;

/**
 * Configuration par défaut pour les recommandations
 */
export const DEFAULT_RECOMMENDATION_CONFIG = {
    maxRecommendationsPerLevel: 5,
    includeEmotionalRecommendations: true,
    includePracticeExercises: false
} as const;

/**
 * Factory function pour créer un système complet d'évaluation de mentor
 * avec des configurations par défaut
 * @returns Objet contenant tous les services configurés
 * 
 * @example
 * ```typescript
 * import { createCompleteMentorSystem } from './analyzers';
 * 
 * const system = createCompleteMentorSystem();
 * const evaluation = system.evaluator.evaluateMentorSkills(sessions, context);
 * const recommendations = system.engine.generateRecommendations(competencies, context, level);
 * ```
 */
export function createCompleteMentorSystem(
    emotionalConfig: EmotionalConfig = DEFAULT_EMOTIONAL_CONFIG,
    recommendationConfig = DEFAULT_RECOMMENDATION_CONFIG
) {
    return {
        evaluator: createMentorEvaluator(emotionalConfig),
        analyzer: createCompetencyAnalyzer(emotionalConfig),
        engine: createRecommendationEngine(recommendationConfig),
        config: {
            emotional: emotionalConfig,
            recommendation: recommendationConfig
        }
    } as const;
}