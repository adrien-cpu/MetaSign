/**
 * @file src/ai/services/learning/human/coda/codavirtuel/types/evolution.types.ts
 * @description Types et interfaces pour le système d'évolution adaptatif des IA-élèves
 * 
 * @module EvolutionTypes
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Evolutionary AI Division
 */

/**
 * Interface pour les métriques d'évolution
 */
export interface EvolutionMetrics {
    /** Vitesse d'apprentissage (concepts/heure) */
    readonly learningSpeed: number;
    /** Rétention de connaissances (0-1) */
    readonly knowledgeRetention: number;
    /** Adaptabilité aux nouvelles méthodes (0-1) */
    readonly adaptability: number;
    /** Résilience émotionnelle (0-1) */
    readonly emotionalResilience: number;
    /** Curiosité intellectuelle (0-1) */
    readonly intellectualCuriosity: number;
    /** Efficacité de communication LSF (0-1) */
    readonly lsfCommunicationEfficiency: number;
    /** Niveau de confiance global (0-1) */
    readonly globalConfidence: number;
    /** Progrès cultural sourd (0-1) */
    readonly culturalProgress: number;
}

/**
 * Types d'événements d'évolution
 */
export type EvolutionEventType =
    | 'breakthrough'          // Percée majeure
    | 'plateau_breakthrough'  // Sortie de plateau
    | 'skill_mastery'         // Maîtrise d'une compétence
    | 'confidence_boost'      // Gain de confiance
    | 'adaptability_increase' // Amélioration adaptabilité
    | 'emotional_growth'      // Croissance émotionnelle
    | 'cultural_awakening'    // Éveil culturel
    | 'method_preference'     // Développement de préférences
    | 'resilience_build'      // Construction résilience
    | 'curiosity_spark';      // Éveil de curiosité

/**
 * Interface pour un événement d'évolution
 */
export interface EvolutionEvent {
    /** Type d'événement */
    readonly eventType: EvolutionEventType;
    /** Métrique affectée */
    readonly affectedMetric: keyof EvolutionMetrics;
    /** Valeur précédente */
    readonly previousValue: number;
    /** Nouvelle valeur */
    readonly newValue: number;
    /** Impact de l'évolution */
    readonly impact: number;
    /** Cause de l'évolution */
    readonly trigger: string;
    /** Contexte d'apprentissage */
    readonly learningContext: string;
    /** Timestamp de l'événement */
    readonly timestamp: Date;
    /** Confiance dans l'évolution */
    readonly confidence: number;
}

/**
 * Interface pour une expérience d'apprentissage
 */
export interface LearningExperience {
    /** Concept appris */
    readonly concept: string;
    /** Méthode utilisée */
    readonly method: string;
    /** Niveau de réussite (0-1) */
    readonly successRate: number;
    /** Temps passé */
    readonly duration: number;
    /** Difficultés rencontrées */
    readonly challenges: readonly string[];
    /** Émotions ressenties */
    readonly emotions: readonly string[];
    /** Timestamp */
    readonly timestamp: Date;
}

/**
 * Interface pour une interaction sociale
 */
export interface SocialInteraction {
    /** Type d'interaction */
    readonly interactionType: 'mentor' | 'peer' | 'group' | 'community';
    /** Qualité de l'interaction (0-1) */
    readonly quality: number;
    /** Apprentissages tirés */
    readonly learnings: readonly string[];
    /** Impact émotionnel */
    readonly emotionalImpact: number;
    /** Durée */
    readonly duration: number;
    /** Timestamp */
    readonly timestamp: Date;
}

/**
 * Interface pour un événement de feedback
 */
export interface FeedbackEvent {
    /** Source du feedback */
    readonly source: 'mentor' | 'peer' | 'system' | 'self';
    /** Type de feedback */
    readonly type: 'positive' | 'constructive' | 'corrective';
    /** Contenu du feedback */
    readonly content: string;
    /** Impact sur la motivation */
    readonly motivationImpact: number;
    /** Acceptation du feedback (0-1) */
    readonly acceptance: number;
    /** Timestamp */
    readonly timestamp: Date;
}

/**
 * Interface pour les facteurs d'évolution
 */
export interface EvolutionFactors {
    /** Expériences d'apprentissage récentes */
    readonly recentExperiences: readonly LearningExperience[];
    /** Patterns émotionnels détectés */
    readonly emotionalPatterns: readonly EmotionalPattern[];
    /** Métriques de mémoire */
    readonly memoryMetrics: MemoryMetrics;
    /** Interactions sociales */
    readonly socialInteractions: readonly SocialInteraction[];
    /** Feedback reçu */
    readonly feedbackHistory: readonly FeedbackEvent[];
    /** Temps d'apprentissage total */
    readonly totalLearningTime: number;
}

/**
 * Interface pour une prédiction d'évolution
 */
export interface EvolutionPrediction {
    /** Métrique prédite */
    readonly metric: keyof EvolutionMetrics;
    /** Valeur prédite */
    readonly predictedValue: number;
    /** Confiance dans la prédiction */
    readonly confidence: number;
    /** Facteurs influençant */
    readonly influencingFactors: readonly string[];
    /** Horizon temporel */
    readonly timeHorizon: number;
}

/**
 * Configuration du système d'évolution
 */
export interface AIEvolutionSystemConfig {
    /** Sensibilité aux changements */
    readonly evolutionSensitivity: number;
    /** Vitesse d'évolution par défaut */
    readonly baseEvolutionRate: number;
    /** Seuil pour déclencher une évolution */
    readonly evolutionThreshold: number;
    /** Persistence des changements */
    readonly changePersistence: number;
    /** Activer l'auto-optimisation */
    readonly enableAutoOptimization: boolean;
    /** Profondeur d'analyse */
    readonly analysisDepth: number;
}

/**
 * Résultat d'une analyse d'évolution
 */
export interface EvolutionAnalysisResult {
    /** Métriques actuelles */
    readonly currentMetrics: EvolutionMetrics;
    /** Événements d'évolution récents */
    readonly recentEvolutions: readonly EvolutionEvent[];
    /** Prédictions d'évolution */
    readonly evolutionPredictions: readonly EvolutionPrediction[];
    /** Recommandations d'amélioration */
    readonly improvementRecommendations: readonly string[];
    /** Score d'évolution global (0-1) */
    readonly overallEvolutionScore: number;
    /** Prochaines étapes suggérées */
    readonly nextSteps: readonly string[];
}

// Types importés d'autres modules (temporaires pour compilation)
export interface EmotionalPattern {
    readonly type: string;
    readonly intensity: number;
    readonly duration: number;
    readonly timestamp: Date;
}

export interface MemoryMetrics {
    readonly strongestConcepts: readonly string[];
    readonly weakestConcepts: readonly string[];
    readonly retentionRate: number;
    readonly comprehensionSpeed: number;
}

export interface AIPersonalityProfile {
    readonly learningStyle: string;
    readonly preferredMethods: readonly string[];
    readonly emotionalTendencies: readonly string[];
    readonly socialPreferences: readonly string[];
}