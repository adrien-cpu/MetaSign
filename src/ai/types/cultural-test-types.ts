// src/ai/types/cultural-test-types.ts

/**
 * Types et interfaces pour les tests culturels du système LSF
 */

/**
 * Représente un contexte culturel pour les tests
 */
export interface CulturalContext {
    region?: string | undefined;
    generation?: string | undefined;
    community?: string | undefined;
    dialect_markers?: string[] | undefined;
    cultural_specifics?: string[] | undefined;
    community_traits?: string[] | undefined;
}

/**
 * Définit un type d'urgence pour les tests
 */
export interface EmergencyType {
    type: string;
    intensity: 'CRITICAL' | 'HIGH' | 'MODERATE';
    complexity_factors: string[];
}

/**
 * Niveau de complexité d'un scénario de test
 */
export interface ComplexityLevel {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    factors: string[];
}

/**
 * Détails d'une situation d'urgence
 */
export interface EmergencyDetails {
    type: EmergencyType;
    time_pressure: string;
    clarity_requirements: string;
    cultural_preservation: string;
}

/**
 * Éléments culturels pour un scénario de test
 */
export interface CulturalElements {
    regional: RegionalElements;
    generational: GenerationalElements;
    community: CommunityElements;
    metadata: CulturalMetadata;
}

/**
 * Éléments régionaux d'un contexte culturel
 */
export interface RegionalElements {
    dialect_markers: string[];
    cultural_specifics: string[];
    community_traits: string[];
}

/**
 * Éléments générationnels d'un contexte culturel
 */
export interface GenerationalElements {
    respect_markers: string[];
    cultural_weight: string;
    adaptation_flexibility: string;
}

/**
 * Éléments communautaires d'un contexte culturel
 */
export interface CommunityElements {
    traits: string[];
    values: string[];
    practices: string[];
}

/**
 * Métadonnées culturelles
 */
export interface CulturalMetadata {
    authenticity_level: number;
    respect_level: number;
    preservation_level: number;
}

/**
 * Résultats attendus pour un scénario de test
 */
export interface ExpectedOutcomes {
    cultural_integrity: number;
    emergency_response: number;
    overall_effectiveness: number;
}

/**
 * Résultats obtenus lors d'un test
 */
export interface TestResults {
    cultural_integrity: number;
    emergency_response: number;
    overall_effectiveness: number;
    performance_metrics: Record<string, number>;
}

/**
 * Score de validation
 */
export interface ValidationScore {
    score: number;
    passed: boolean;
    threshold: number;
}

/**
 * Détails de validation
 */
export interface ValidationDetails {
    cultural: CulturalValidation;
    emergency: EmergencyValidation;
}

/**
 * Validation des aspects culturels
 */
export interface CulturalValidation {
    score: number;
    aspects: Record<string, number>;
    issues: string[];
}

/**
 * Validation de la réponse d'urgence
 */
export interface EmergencyValidation {
    score: number;
    aspects: Record<string, number>;
    issues: string[];
}

/**
 * Suggestion d'amélioration
 */
export interface ImprovementSuggestion {
    area: string;
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    impact: number;
}

/**
 * Paramètres visuels pour les tests
 */
export interface VisualParameters {
    size: number;
    complexity: number;
    cultural_context: string;
}

/**
 * Éléments visuels pour les tests
 */
export interface VisualElements {
    spatial: SpatialComponents;
    manual: ManualComponents;
    non_manual: NonManualComponents;
    metadata: VisualMetadata;
}

/**
 * Composants spatiaux
 */
export interface SpatialComponents {
    location: Record<string, number>;
    movement: Record<string, number>;
    orientation: Record<string, number>;
}

/**
 * Composants manuels
 */
export interface ManualComponents {
    handshape: string[];
    orientation: string[];
    movement: string[];
}

/**
 * Composants non-manuels
 */
export interface NonManualComponents {
    facial: Record<string, number>;
    body: Record<string, number>;
    head: Record<string, number>;
}

/**
 * Métadonnées visuelles
 */
export interface VisualMetadata {
    visual_clarity: number;
    cultural_alignment: number;
    effectiveness: number;
}

/**
 * Métriques de performance
 */
export interface PerformanceMetrics {
    cultural_score: number;
    emergency_score: number;
    efficiency_metrics: EfficiencyMetrics;
    improvement_potential: Record<string, number>;
}

/**
 * Métriques d'efficacité
 */
export interface EfficiencyMetrics {
    response_time: number;
    clarity_score: number;
    effectiveness_score: number;
}

/**
 * Résumé d'un scénario de test
 */
export interface ScenarioSummary {
    context: string;
    emergency: string;
    complexity: string;
    key_elements: string[];
}

/**
 * Analyse des résultats
 */
export interface ResultsAnalysis {
    strengths: string[];
    weaknesses: string[];
    key_metrics: Record<string, number>;
}

/**
 * Résultats de validation
 */
export interface ValidationFindings {
    overall_score: number;
    passed_checks: string[];
    failed_checks: string[];
    critical_issues: string[];
}

/**
 * Recommandation d'amélioration
 */
export interface Recommendation {
    area: string;
    action: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    expected_impact: number;
}

/**
 * Métriques de test
 */
export interface TestMetrics {
    cultural_integrity: number;
    emergency_response: number;
    overall_effectiveness: number;
    efficiency: EfficiencyMetrics;
}

/**
 * Paramètres de test
 */
export interface TestParameters {
    cultural_context: CulturalContext;
    emergency_type: EmergencyType;
    complexity_level: ComplexityLevel;
}

/**
 * Scénario de test complet
 */
export interface TestScenario {
    context: CulturalContext;
    emergency: EmergencyDetails;
    culturalElements: CulturalElements;
    expectedOutcomes: ExpectedOutcomes;
}

/**
 * Rapport de validation
 */
export interface ValidationReport {
    overall: ValidationScore;
    details: ValidationDetails;
    improvements: ImprovementSuggestion[];
}

/**
 * Rapport de test complet
 */
export interface TestReport {
    scenario_summary: ScenarioSummary;
    results_analysis: ResultsAnalysis;
    validation_findings: ValidationFindings;
    recommendations: Recommendation[];
    metrics: TestMetrics;
}