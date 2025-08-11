/**
 * Types et interfaces pour le système d'adaptations pédagogiques
 * @module ai/types/adaptation-types
 */

// ========== Énumérations ==========

/**
 * Types de besoins spécifiques supportés
 */
export enum SpecialNeedType {
    VISUAL = 'visual',
    AUDITORY = 'auditory',
    COGNITIVE = 'cognitive',
    MOTOR = 'motor',
    ATTENTION = 'attention',
    LANGUAGE = 'language',
    SOCIAL = 'social',
    EMOTIONAL = 'emotional'
}

/**
 * Types de contraintes supportées
 */
export enum ConstraintType {
    TECHNICAL = 'technical',
    ENVIRONMENTAL = 'environmental',
    TEMPORAL = 'temporal',
    RESOURCE = 'resource',
    POLICY = 'policy'
}

/**
 * Types de situations supportées
 */
export enum SituationType {
    CLASSROOM = 'classroom',
    INDIVIDUAL = 'individual',
    GROUP = 'group',
    ASSESSMENT = 'assessment',
    PRACTICE = 'practice',
    PLAYGROUND = 'playground',
    REMOTE = 'remote'
}

/**
 * Types d'adaptation disponibles
 */
export enum AdaptationType {
    VISUAL_SIMPLIFICATION = 'visual_simplification',
    SPATIAL_OPTIMIZATION = 'spatial_optimization',
    TEMPORAL_ADJUSTMENT = 'temporal_adjustment',
    COMPLEXITY_REDUCTION = 'complexity_reduction',
    CONTEXT_ENHANCEMENT = 'context_enhancement',
    BREAK_SCHEDULING = 'break_scheduling',
    SPEED_ADJUSTMENT = 'speed_adjustment',
    CONTENT_REPETITION = 'content_repetition',
    ALTERNATIVE_PRESENTATION = 'alternative_presentation',
    EMPHASIS_ENHANCEMENT = 'emphasis_enhancement',
    MULTIMODAL_SUPPORT = 'multimodal_support',
    INTERACTION_MODIFICATION = 'interaction_modification',
    FEEDBACK_ADAPTATION = 'feedback_adaptation'
}

/**
 * Types d'adaptation de fonctionnalités
 */
export enum AdaptationFeatureType {
    PREDICTIVE = 'predictive',
    DYNAMIC = 'dynamic',
    INTELLIGENT_ASSISTANCE = 'intelligent_assistance',
    INTEGRATED = 'integrated',
    COLLABORATION = 'collaboration'
}

/**
 * Types d'intervention
 */
export enum InterventionType {
    PREDICTIVE = 'predictive',
    REACTIVE = 'reactive',
    PREVENTIVE = 'preventive'
}

/**
 * Type de focus pour les prédictions
 */
export enum PredictionFocusType {
    ENGAGEMENT = 'engagement',
    COMPREHENSION = 'comprehension',
    RETENTION = 'retention',
    PERFORMANCE_OPTIMIZATION = 'performance_optimization',
    COGNITIVE_LOAD = 'cognitive_load'
}

/**
 * Niveau d'intensité d'adaptation
 */
export enum AdaptationIntensity {
    LOW = 'low',
    MODERATE = 'moderate',
    HIGH = 'high',
    DYNAMIC = 'dynamic'
}

/**
 * Niveau de fatigue
 */
export enum FatigueLevel {
    NONE = 'none',
    LIGHT = 'light',
    MODERATE = 'moderate',
    SEVERE = 'severe'
}

/**
 * Niveau de performance
 */
export enum PerformanceLevel {
    EXCELLENT = 'excellent',
    GOOD = 'good',
    AVERAGE = 'average',
    BELOW_AVERAGE = 'below_average',
    POOR = 'poor'
}

/**
 * Priorité d'optimisation
 */
export enum OptimizationPriority {
    LEARNING_EFFICIENCY = 'learning_efficiency',
    COGNITIVE_LOAD_REDUCTION = 'cognitive_load_reduction',
    ENGAGEMENT = 'engagement',
    ACCESSIBILITY = 'accessibility',
    BALANCE = 'balance'
}

/**
 * Niveau de support
 */
export enum SupportLevel {
    MINIMAL = 'minimal',
    STANDARD = 'standard',
    ENHANCED = 'enhanced',
    COMPREHENSIVE = 'comprehensive'
}

/**
 * Critères de matching
 */
export enum MatchingCriteria {
    COMPLEMENTARY_SKILLS = 'complementary_skills',
    SIMILAR_LEVEL = 'similar_level',
    MIXED_ABILITIES = 'mixed_abilities',
    COMMUNICATION_STYLE = 'communication_style'
}

/**
 * Niveau d'intégration
 */
export enum IntegrationLevel {
    MINIMAL = 'minimal',
    PARTIAL = 'partial',
    FULL = 'full',
    DYNAMIC = 'dynamic'
}

/**
 * Type de focus
 */
export enum FocusType {
    INDIVIDUAL = 'individual',
    GROUP = 'group',
    MIXED = 'mixed'
}

/**
 * Type de priorité
 */
export enum PriorityType {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

// ========== Types ==========

/**
 * Types de fonctionnalités avancées disponibles
 */
export type AdvancedFeatureType =
    | 'continuous_learning'      // Apprentissage continu
    | 'automatic_optimization'   // Optimisation automatique des performances
    | 'voice_commands'           // Commandes vocales pour l'adaptation
    | 'adaptive_ui'              // Interface utilisateur adaptative
    | 'predictive_suggestions';  // Suggestions prédictives

/**
 * Type de stratégie d'adaptation
 * Union de toutes les stratégies possibles
 */
export type AdaptationStrategyType =
    // Stratégies principales (correspondant à AdaptationType)
    | 'visual_simplification'
    | 'spatial_optimization'
    | 'temporal_adjustment'
    | 'complexity_reduction'
    | 'context_enhancement'
    | 'break_scheduling'
    // Stratégies étendues
    | 'adaptive_pacing'
    | 'strategic_breaks'
    | 'content_restructuring'
    | 'content_adaptation'
    | 'simplified_content'
    | 'modality_switch'
    | 'peer_support'
    | 'collaborative_learning'
    | 'peer_collaboration'
    | 'role_rotation'
    | 'guided_discussion'
    | 'cognitive_support'
    | 'cognitive_scaffolding'
    | 'environmental_optimization'
    | 'multi_modal_presentation'
    | 'personalized_pacing';

// ========== Interfaces de base ==========

/**
 * Interface pour les données d'environnement d'une session
 */
export interface SessionEnvironment {
    /** Niveau d'éclairage dans l'environnement */
    lighting?: string;
    /** Niveau de bruit dans l'environnement */
    noise_level?: string;
    /** Contraintes spatiales */
    space_constraints?: string;
    /** Propriétés supplémentaires d'environnement */
    [key: string]: unknown;
}

/**
 * Interface pour les données de fatigue
 */
export interface FatigueData {
    /** Niveau de fatigue */
    level: string;
    /** Horodatage */
    timestamp?: number;
}

/**
 * Interface pour les données d'un apprenant
 */
export interface LearnerProfile {
    /** Identifiant de l'apprenant */
    id?: string;
    /** Sensibilité visuelle de l'apprenant */
    visual_sensitivity?: string;
    /** Facteurs d'attention */
    attention_factors?: string[];
    /** Vitesse de traitement */
    processing_speed?: string;
    /** Compétences spécifiques */
    skills?: string[];
    /** Besoins spécifiques */
    needs?: string[];
    /** Préférences d'apprentissage */
    learning_preferences?: string[];
    /** Historique de fatigue */
    fatigue_history?: FatigueData[];
    /** Profil complet de l'apprenant */
    profile?: Record<string, unknown>;
    /** Propriétés supplémentaires */
    [key: string]: unknown;
}

/**
 * Interface pour les données d'activité d'une session
 */
export interface SessionActivity {
    /** Type d'activité */
    type?: string;
    /** Durée de l'activité en minutes */
    duration?: number;
    /** Niveau de complexité */
    complexity?: string;
    /** Objectifs de l'activité */
    objectives?: string[];
    /** Matériels nécessaires */
    materials?: string[];
    /** Propriétés supplémentaires */
    [key: string]: unknown;
}

/**
 * Interface pour les données de groupe
 */
export interface GroupComposition {
    /** Étudiants dans le groupe */
    students?: LearnerProfile[];
    /** Propriétés supplémentaires */
    [key: string]: unknown;
}

/**
 * Interface pour les besoins spécifiques
 */
export interface SpecialNeed {
    /** Type de besoin spécifique */
    type: SpecialNeedType;
    /** Niveau d'intensité (0-1) */
    intensity: number;
    /** Adaptations recommandées */
    recommendedAdaptations: string[];
    /** Aspects à éviter */
    avoidanceAspects?: string[];
}

/**
 * Interface pour les contraintes d'adaptation
 */
export interface Constraint {
    /** Type de contrainte */
    type: ConstraintType;
    /** Description de la contrainte */
    description: string;
    /** Sévérité de la contrainte (0-1) */
    severity: number;
    /** Paramètres spécifiques à la contrainte */
    parameters: Record<string, unknown>;
}

/**
 * Structure d'assistance par les pairs
 */
export interface PeerSupport {
    /** Type de support par les pairs */
    supportType: string;
    /** Stratégie d'appariement */
    pairing: string;
    /** Canal de communication */
    communicationChannel: string;
    /** Fréquence d'interaction */
    frequency: number;
    /** Durée des interactions */
    duration: number;
    /** Liste des pairs impliqués */
    peers: string[];
    /** Autres attributs */
    [key: string]: unknown;
}

/**
 * Interface pour les points d'intervention
 */
export interface InterventionPoint {
    /** Horodatage de l'intervention */
    timestamp: number;
    /** Type d'intervention */
    type: InterventionType;
    /** Raison de l'intervention */
    reason: string;
    /** Priorité de l'intervention */
    priority: number;
    /** Autres attributs */
    [key: string]: unknown;
}

/**
 * Interface pour les alertes de fatigue
 */
export interface FatigueAlert {
    /** Niveau de fatigue */
    level: string;
    /** Horodatage */
    time: number;
    /** Niveau de confiance */
    confidence: number;
    /** Autres attributs */
    [key: string]: unknown;
}

// ========== Interfaces de données de session ==========

/**
 * Interface consolidée pour les données de session
 */
export interface SessionData {
    /** Identifiant unique de la session */
    id?: string;
    /** Durée prévue de la session en minutes */
    duration?: number;
    /** Intensité de la session */
    intensity?: string;
    /** Défis identifiés pour la session */
    challenges?: string[];
    /** Objectifs de la session */
    objectives?: string[];
    /** Données sur l'environnement */
    environment?: SessionEnvironment;
    /** Données sur l'apprenant principal */
    learner?: LearnerProfile;
    /** Données sur les autres apprenants */
    student?: LearnerProfile;
    /** Données sur la composition du groupe */
    group_composition?: GroupComposition;
    /** Données sur l'activité */
    activity?: SessionActivity;
    /** Paramètres spécifiques de la session */
    parameters?: Record<string, unknown>;
    /** Propriétés supplémentaires */
    [key: string]: unknown;
}

// ========== Interfaces d'adaptation ==========

/**
 * Interface pour les stratégies d'adaptation
 */
export interface AdaptationStrategy {
    /** Identifiant unique de la stratégie */
    id: string;
    /** Nom de la stratégie */
    name: string;
    /** Priorité de la stratégie */
    priority: number;
    /** Description de la stratégie */
    description: string;
    /** Autres attributs */
    [key: string]: unknown;
}

/**
 * Structure d'une recommandation d'adaptation
 */
export interface AdaptationRecommendation {
    /** Identifiant unique */
    id: string;
    /** Type d'adaptation */
    type: string;
    /** Description courte du contenu */
    content: string;
    /** Priorité (0-1) */
    priority: number;
    /** Description détaillée */
    description: string;
    /** Justification de la recommandation */
    rationale: string;
    /** Paramètres spécifiques (optionnel) */
    parameters?: Record<string, unknown>;
    /** Autres attributs */
    [key: string]: unknown;
}

/**
 * Résultat d'une suggestion d'adaptation
 */
export interface AdaptationSuggestionResult {
    /** Identifiant unique */
    id: string;
    /** Type d'adaptation */
    adaptationType: AdaptationType;
    /** Priorité (0-1) */
    priority: number;
    /** Paramètres de l'adaptation */
    parameters: Record<string, unknown>;
    /** Justification */
    rationale: string;
    /** Bénéfices attendus */
    expectedBenefits: string[];
    /** Score de compatibilité (0-1) */
    compatibilityScore: number;
}

/**
 * Configuration d'une adaptation
 */
export interface AdaptationConfig {
    /** Type d'adaptation */
    type: AdaptationType;
    /** Niveau d'intensité (0-1) */
    intensity: number;
    /** Paramètres spécifiques */
    parameters: Record<string, unknown>;
    /** Activation/désactivation */
    enabled: boolean;
}

/**
 * Résultat d'évaluation d'une adaptation
 */
export interface AdaptationEvaluationResult {
    /** Identifiant de l'adaptation */
    adaptationId: string;
    /** Score d'efficacité (0-1) */
    effectivenessScore: number;
    /** Métriques détaillées */
    metrics: Record<string, number>;
    /** Commentaires et observations */
    observations: string[];
    /** Recommandations pour amélioration */
    recommendations: string[];
}

/**
 * Prédiction d'adaptation pour les systèmes adaptatifs
 */
export interface AdaptationPrediction {
    /** Identifiant unique */
    id: string;
    /** Horodatage */
    timestamp: number;
    /** Type de prédiction */
    type: string;
    /** Niveau de confiance */
    confidence: number;
    /** Durée estimée */
    expectedTime?: number;
    /** Contenu de la prédiction */
    content: string;
    /** Contexte de la prédiction */
    context?: Record<string, unknown>;
}

/**
 * Scores de prédiction pour les adaptations
 */
export interface PredictionScores {
    /** Score d'attention */
    attention: number;
    /** Score de fatigue */
    fatigue: number;
    /** Score d'engagement */
    engagement: number;
    /** Autres scores */
    [key: string]: number;
}

/**
 * Métriques d'adaptation
 */
export interface AdaptationMetrics {
    /** Temps de traitement */
    processingTime: number;
    /** Niveau de confiance */
    confidenceLevel?: number;
    /** Nombre d'erreurs */
    errorCount?: number;
    /** Autres métriques */
    [key: string]: unknown;
}

/**
 * Groupement des prédictions
 */
export interface Predictions {
    /** Points d'intervention prédits */
    intervention_points: InterventionPoint[];
    /** Scores de prédiction */
    scores: Record<string, number>;
    /** Alertes de fatigue (optionnel) */
    fatigue_alerts?: FatigueAlert[];
    /** Précision des prédictions (optionnel) */
    accuracy?: number;
    /** Autres attributs */
    [key: string]: unknown;
}

/**
 * Stratégies d'adaptation groupées
 */
export interface Strategies {
    /** Stratégies primaires */
    primary: AdaptationStrategy[];
    /** Stratégies de repli */
    fallback: AdaptationStrategy[];
    /** Autres attributs */
    [key: string]: unknown;
}

// ========== Interfaces d'analyse et résultats ==========

/**
 * Interface pour les résultats d'analyse de contexte
 */
export interface ContextAnalysisResult {
    /** Identifiant unique de l'analyse */
    id: string;
    /** Horodatage de l'analyse */
    timestamp: number;
    /** Besoins spécifiques identifiés */
    specialNeeds: SpecialNeed[];
    /** Contraintes identifiées dans le contexte */
    constraints: Constraint[];
    /** Niveau de confiance global de l'analyse (0-1) */
    confidenceLevel: number;
    /** Éléments de contexte additionnels */
    contextualFactors: Record<string, unknown>;
    /** Données environnementales */
    environmental?: Record<string, unknown>;
    /** Données sur l'apprenant */
    learner?: Record<string, unknown>;
    /** Besoins identifiés */
    needs?: string[];
    /** Propriétés supplémentaires */
    [key: string]: unknown;
}

/**
 * Interface pour les résultats d'analyse situationnelle
 */
export interface SituationalAnalysisResult {
    /** Identifiant unique de l'analyse */
    id: string;
    /** Horodatage de l'analyse */
    timestamp: number;
    /** Type de situation analysée */
    situationType: SituationType;
    /** Priorité de la situation (0-1) */
    priority: number;
    /** Facteurs environnementaux pertinents */
    environmentalFactors: Record<string, unknown>;
    /** Opportunités d'apprentissage identifiées */
    learningOpportunities: string[];
    /** Défis potentiels identifiés */
    potentialChallenges: string[];
}

/**
 * Interface pour les résultats d'évaluation d'efficacité
 */
export interface EffectivenessEvaluationResult {
    /** Identifiant unique de l'évaluation */
    id: string;
    /** Identifiant de l'adaptation évaluée */
    adaptationId: string;
    /** Score d'efficacité (0-1) */
    effectivenessScore: number;
    /** Métriques d'engagement */
    engagementMetrics: {
        attention: number;
        participation: number;
        completion: number;
    };
    /** Métriques d'apprentissage */
    learningMetrics: {
        retention: number;
        understanding: number;
        application: number;
    };
    /** Observations qualitatives */
    qualitativeObservations: string[];
    /** Recommandations pour améliorations */
    improvementRecommendations: string[];
    /** Métriques additionnelles (compatibilité) */
    metrics?: Record<string, number>;
    /** Recommandations (compatibilité) */
    recommendations?: string[];
}

/**
 * Interface pour les résultats de raffinement de stratégie
 */
export interface StrategyRefinementResult {
    /** Identifiant unique du raffinement */
    id: string;
    /** Identifiant de la stratégie d'origine */
    originalStrategyId: string;
    /** Modifications apportées */
    modifications: {
        added: string[];
        removed: string[];
        modified: Record<string, unknown>;
    };
    /** Justification des modifications */
    justification: string;
    /** Prédiction d'amélioration (pourcentage) */
    predictedImprovement: number;
    /** Version de la stratégie */
    strategyVersion: number;
    /** ID de la stratégie (compatibilité) */
    strategyId?: string;
    /** Raffinements (compatibilité) */
    refinements?: string[];
    /** Impact attendu (compatibilité) */
    expectedImpact?: number;
    /** Implémentation (compatibilité) */
    implementation?: string | Record<string, unknown>;
}

/**
 * Résultat des fonctionnalités avancées
 */
export interface AdvancedFeaturesResult {
    /** Type de fonctionnalité */
    featureType: AdvancedFeatureType;
    /** Succès de l'opération */
    success: boolean;
    /** Score d'efficacité */
    effectiveness: number;
    /** Prédictions */
    predictions?: Predictions;
    /** Stratégies */
    strategies?: Strategies;
    /** Recommandations */
    recommendations?: AdaptationRecommendation[];
    /** Métriques */
    metrics?: Record<string, number>;
    /** Horodatage */
    timestamp: number;
    /** Données supplémentaires */
    data?: Record<string, unknown>;
    /** Message */
    message?: string;
}

// ========== Interfaces de soutien et contexte ==========

/**
 * Interface pour le soutien cognitif
 */
export interface CognitiveSupport {
    /** Aides mémoire */
    memory_aids: boolean;
    /** Échafaudage cognitif */
    processing_scaffolds: boolean;
    /** Guides d'attention */
    attention_guides: boolean;
    /** Autres attributs */
    [key: string]: unknown;
}

/**
 * Interface pour les accommodations
 */
export interface Accommodations {
    /** Liste des accommodations */
    accommodations: string[];
    /** Type d'accommodation */
    type?: string;
    /** Autres attributs */
    [key: string]: unknown;
}

/**
 * Interface pour les optimisations
 */
export interface Optimizations {
    /** Liste des optimisations */
    optimizations: string[];
    /** Niveau d'impact */
    impact_level?: number;
    /** Autres attributs */
    [key: string]: unknown;
}

/**
 * Interface pour l'appariement de pairs
 */
export interface PeerMatch {
    /** Identifiant du premier étudiant */
    student1: string;
    /** Identifiant du deuxième étudiant */
    student2: string;
    /** Score de complémentarité */
    complementarity: number;
    /** Autres attributs */
    [key: string]: unknown;
}

/**
 * Interface pour les matériels partagés
 */
export interface SharedMaterials {
    /** Contenu adapté */
    adapted_content: boolean;
    /** Ressources multimodales */
    multi_modal_resources: boolean;
    /** Contenu créé par les pairs */
    peer_created_content: boolean;
    /** Accessibilité */
    accessibility?: string;
    /** Autres attributs */
    [key: string]: unknown;
}

/**
 * Interface pour le contexte apprenant
 */
export interface LearnerContext {
    /** Accommodations */
    accommodations: Accommodations;
    /** Soutien cognitif */
    cognitive_support: CognitiveSupport;
    /** Autres attributs */
    [key: string]: unknown;
}

/**
 * Interface pour le contexte environnemental
 */
export interface EnvironmentalContext {
    /** Optimisations */
    optimizations: Optimizations;
    /** Autres attributs */
    [key: string]: unknown;
}

/**
 * Interface pour la prise en compte du contexte
 */
export interface ContextAwareness {
    /** Contexte apprenant */
    learner: LearnerContext;
    /** Contexte environnemental */
    environmental: EnvironmentalContext;
    /** Autres attributs */
    [key: string]: unknown;
}

/**
 * Interface pour l'intégration
 */
export interface Integration {
    /** Score d'harmonie */
    harmony_score: number;
    /** Systèmes connectés */
    systems_connected?: string[];
    /** Autres attributs */
    [key: string]: unknown;
}

/**
 * Interface pour l'assistance
 */
export interface Assistance {
    /** Mesures d'efficacité */
    effectiveness: {
        /** Score global */
        overall: number;
        /** Autres scores */
        [key: string]: number;
    };
    /** Mesures préventives */
    preventive_measures?: string[];
    /** Support cognitif */
    cognitive_support?: Record<string, boolean>;
    /** Autres attributs */
    [key: string]: unknown;
}

/**
 * Interface pour la collaboration
 */
export interface Collaboration {
    /** Appariements */
    matches?: PeerMatch[];
    /** Score de qualité */
    quality?: number;
    /** Autres attributs */
    [key: string]: unknown;
}

// ========== Interfaces d'adaptations avancées ==========

/**
 * Interface pour l'adaptation avancée
 */
export interface IAdvancedAdaptation {
    /**
     * Implémente des fonctionnalités avancées
     * @param sessionData Données de session
     * @param options Options d'implémentation
     * @returns Résultat de l'opération
     */
    implementAdvancedFeatures(
        sessionData: Record<string, unknown>,
        options: Record<string, unknown>
    ): Promise<AdvancedFeaturesResult>;

    /**
     * Analyse le contexte d'une session
     * @param sessionData Données de session
     * @returns Résultat de l'analyse
     */
    analyzeContext(
        sessionData: Record<string, unknown>
    ): Promise<ContextAnalysisResult>;

    /**
     * Suggère des adaptations basées sur l'analyse du contexte
     * @param contextAnalysis Analyse de contexte
     * @returns Suggestions d'adaptation
     */
    suggestAdaptations(
        contextAnalysis: Record<string, unknown>
    ): Promise<AdaptationSuggestionResult>;

    /**
     * Évalue l'efficacité des adaptations
     * @param sessionData Données de session
     * @param adaptationHistory Historique des adaptations
     * @returns Évaluation d'efficacité
     */
    evaluateEffectiveness(
        sessionData: Record<string, unknown>,
        adaptationHistory: unknown[]
    ): Promise<EffectivenessEvaluationResult>;

    /**
     * Affine la stratégie d'adaptation
     * @param effectiveness Score d'efficacité
     * @param currentStrategy Stratégie actuelle
     * @returns Stratégie affinée
     */
    refineStrategy(
        effectiveness: number,
        currentStrategy: AdaptationStrategyType
    ): Promise<StrategyRefinementResult>;
}