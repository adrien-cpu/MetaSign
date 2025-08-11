/**
 * Types de fonctionnalités avancées disponibles
 */
export enum AdvancedFeatureType {
    PREDICTIVE = 'PREDICTIVE',                  // Adaptations prédictives
    INTELLIGENT_ASSISTANCE = 'INTELLIGENT_ASSISTANCE', // Assistance intelligente
    COLLABORATION = 'COLLABORATION',            // Adaptations collaboratives
    INTEGRATED = 'INTEGRATED'                   // Approche intégrée
}

/**
 * Niveaux d'intégration possibles
 */
export enum IntegrationLevel {
    MINIMAL = 'MINIMAL',       // Intégration minimale
    PARTIAL = 'PARTIAL',       // Intégration partielle
    FULL = 'FULL'              // Intégration complète
}

/**
 * Niveaux de support
 */
export enum SupportLevel {
    MINIMAL = 'MINIMAL',       // Support minimal
    STANDARD = 'STANDARD',     // Support standard
    ENHANCED = 'ENHANCED',     // Support amélioré
    ADAPTIVE = 'ADAPTIVE'      // Support adaptatif
}

/**
 * Types de focus prédictif
 */
export enum PredictionFocusType {
    PERFORMANCE_OPTIMIZATION = 'PERFORMANCE_OPTIMIZATION',
    FATIGUE_MANAGEMENT = 'FATIGUE_MANAGEMENT',
    ENGAGEMENT_MAINTENANCE = 'ENGAGEMENT_MAINTENANCE',
    ERROR_PREVENTION = 'ERROR_PREVENTION'
}

/**
 * Priorités d'optimisation
 */
export enum OptimizationPriority {
    LEARNING_EFFICIENCY = 'LEARNING_EFFICIENCY',
    COGNITIVE_LOAD_REDUCTION = 'COGNITIVE_LOAD_REDUCTION',
    EMOTIONAL_WELL_BEING = 'EMOTIONAL_WELL_BEING',
    LEARNING_PACE = 'LEARNING_PACE'
}

/**
 * Critères de mise en correspondance pour l'apprentissage collaboratif
 */
export enum MatchingCriteria {
    SIMILAR_LEVEL = 'SIMILAR_LEVEL',            // Niveau similaire
    COMPLEMENTARY_SKILLS = 'COMPLEMENTARY_SKILLS', // Compétences complémentaires
    SHARED_INTERESTS = 'SHARED_INTERESTS',      // Intérêts communs
    LEARNING_STYLE = 'LEARNING_STYLE'           // Style d'apprentissage
}

/**
 * Focus du groupe collaboratif
 */
export enum CollaborativeFocus {
    SKILL_DEVELOPMENT = 'SKILL_DEVELOPMENT',    // Développement des compétences
    MUTUAL_SUPPORT = 'MUTUAL_SUPPORT',          // Soutien mutuel
    GROUP_COHESION = 'GROUP_COHESION',          // Cohésion du groupe
    KNOWLEDGE_SHARING = 'KNOWLEDGE_SHARING'     // Partage de connaissances
}

/**
 * Configuration des options d'adaptation avancées
 */
export interface AdvancedAdaptationOptions {
    // Options générales
    feature_type?: string;          // Type de fonctionnalité
    sessionId?: string;             // ID de session (optionnel)

    // Options pour les fonctionnalités prédictives
    prediction_focus?: PredictionFocusType;  // Focus de prédiction
    sensitivity?: 'LOW' | 'MEDIUM' | 'HIGH'; // Sensibilité des prédictions

    // Options pour l'assistance intelligente
    optimization_priority?: OptimizationPriority; // Priorité d'optimisation
    support_level?: SupportLevel;     // Niveau de support

    // Options pour la collaboration
    matching_criteria?: MatchingCriteria; // Critères de mise en correspondance
    focus?: CollaborativeFocus;      // Focus collaboratif

    // Options pour l'approche intégrée
    integration_level?: IntegrationLevel; // Niveau d'intégration
    complexity?: 'LOW' | 'MEDIUM' | 'HIGH'; // Complexité de l'intégration
}