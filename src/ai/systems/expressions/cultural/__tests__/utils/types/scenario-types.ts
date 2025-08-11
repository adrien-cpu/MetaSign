// src/ai/systems/expressions/cultural/__tests__/utils/types/scenario-types.ts

/**
 * Types pour les scénarios culturels complexes
 */

/**
 * Types de scénarios disponibles (clés de premier niveau dans COMPLEX_SCENARIOS)
 */
export type ScenarioType = 'MULTI_FACTOR_SCENARIOS' | 'TECH_COMPLEXITY' | 'DYNAMIC_EVOLUTION' | 'CULTURAL_PRACTICAL_CONFLICTS';

/**
 * Types de sous-scénarios (clés de second niveau dans COMPLEX_SCENARIOS)
 */
export type SubScenarioType =
    | 'CULTURAL_COLLISION'
    | 'GENERATIONAL_COMPLEXITY'
    | 'SYSTEM_DEGRADATION'
    | 'CASCADING_EVENTS'
    | 'EMERGENCY_TRADITIONS';

/**
 * Niveaux de complexité pour les scénarios
 */
export enum ComplexityLevel {
    LOW = 'LOW',
    MODERATE = 'MODERATE',
    HIGH = 'HIGH',
    SEVERE = 'SEVERE',
    EXTREME = 'EXTREME'
}

/**
 * Contexte culturel pour les scénarios
 */
export interface CulturalContext {
    region: string;
    traditions: string[];
    adaptationLevel: 'MINIMAL' | 'MODERATE' | 'REQUIRED' | 'ESSENTIAL';
    communityExpectations: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

/**
 * Facteurs d'urgence pour les scénarios
 */
export interface EmergencyFactors {
    type: string;
    urgency: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    complexity: ComplexityLevel;
    physicalChallenges?: string[];
    timeConstraints?: string;
}

/**
 * Paramètres pour la génération de scénarios
 */
export interface ScenarioParameters {
    complexity: ComplexityLevel;
    culturalContext: CulturalContext;
    emergencyFactors: EmergencyFactors;
}

/**
 * Défis associés à un scénario
 */
export interface Challenge {
    type: string;
    description: string;
    severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    impact: string[];
}

/**
 * Critères de succès pour un scénario
 */
export interface SuccessCriteria {
    essentialRequirements: string[];
    optimalOutcomes: string[];
    measurementCriteria: {
        cultural: string[];
        practical: string[];
        balance: string[];
    };
}

/**
 * Exigences culturelles pour un scénario
 */
export interface CulturalRequirements {
    mustPreserve: string[];
    shouldConsider: string[];
    adaptationLimits: string[];
    contextualFactors: Record<string, string>;
}

/**
 * Scénario complexe généré
 */
export interface ComplexScenario {
    scenario: ScenarioData;
    expectedChallenges: Challenge[];
    successCriteria: SuccessCriteria;
    culturalRequirements: CulturalRequirements;
}

/**
 * Données du scénario
 */
export interface ScenarioData {
    description: string;
    setup?: Record<string, unknown>;
    challenges?: Record<string, string[]>;
    requirements?: Record<string, string>;
    phases?: Array<Record<string, unknown>>;
    sequence?: Array<Record<string, unknown>>;
    conflicts?: Array<Record<string, unknown>>;
    cultural_requirements?: Record<string, string>;
    adaptation_requirements?: Record<string, string>;
}

/**
 * Réponse à un scénario
 */
export interface ScenarioResponse {
    approachDescription: string;
    actionsTaken: {
        cultural: string[];
        emergency: string[];
        balancing: string[];
    };
    adaptationMechanisms: string[];
    expectedOutcomes: string[];
    alternativesConsidered: string[];
}

/**
 * Score de validation
 */
export interface ValidationScore {
    overall: number;
    culturalPreservation: number;
    practicalEffectiveness: number;
    balancedApproach: number;
    adaptability: number;
}

/**
 * Détails de validation
 */
export interface ValidationDetails {
    cultural: ValidationAspect;
    practical: ValidationAspect;
    balance: ValidationAspect;
}

/**
 * Aspect de la validation
 */
export interface ValidationAspect {
    score: number;
    strengths: string[];
    weaknesses: string[];
    contextualRelevance: number;
}

/**
 * Recommandation d'amélioration
 */
export interface Recommendation {
    area: 'CULTURAL' | 'PRACTICAL' | 'BALANCE' | 'GENERAL';
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    implementationSuggestions: string[];
}

/**
 * Résultat global de la validation
 */
export interface ValidationResult {
    overall: ValidationScore;
    details: ValidationDetails;
    recommendations: Recommendation[];
}

/**
 * Type d'un défi d'urgence simplifié pour les tests
 */
export interface EmergencyChallenge {
    description: string;
    impact: string[];
}