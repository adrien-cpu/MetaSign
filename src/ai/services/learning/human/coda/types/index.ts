/**
 * Point d'entrée centralisé pour les types du module émotionnel
 * @file src/ai/services/learning/human/coda/types/index.ts
 * @module ai/services/learning/human/coda/types
 * @description Exports centralisés pour tous les types liés au système émotionnel
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.1
 * @since 2025
 * @lastModified 2025-01-15
 */

// === TYPES ÉMOTIONNELS PRINCIPAUX ===

/**
 * Type pour les émotions détectées dans le système CODA
 */
export type DetectedEmotion = 'frustrated' | 'confused' | 'motivated' | 'confident' | 'neutral';

/**
 * Interface pour le contexte émotionnel analysé
 * Contient les informations sur l'état émotionnel détecté et les recommandations associées
 */
export interface EmotionalContext {
    /** Émotion principale détectée */
    readonly detectedEmotion: DetectedEmotion;
    /** Intensité de l'émotion (0-1) */
    readonly intensity: number;
    /** Facteurs ayant contribué à cette détection */
    readonly contributingFactors: readonly string[];
    /** Recommandations d'adaptation basées sur l'émotion */
    readonly adaptationRecommendations: readonly string[];
    /** Timestamp de la détection émotionnelle (optionnel) */
    readonly timestamp?: Date;
}

/**
 * Interface pour les besoins utilisateur analysés
 * Représente les différents aspects du support nécessaire pour l'apprenant
 */
export interface UserNeeds {
    /** Niveau de confiance nécessaire (0-1) */
    readonly confidence: number;
    /** Niveau de support émotionnel requis (0-1) */
    readonly emotionalSupport: number;
    /** Niveau de défi intellectuel souhaitable (0-1) */
    readonly intellectualChallenge: number;
    /** Niveau d'immersion culturelle nécessaire (0-1) */
    readonly culturalImmersion: number;
}

// === TYPES DE SUPPORT ET CONFIGURATION ===

/**
 * Configuration pour l'analyseur émotionnel
 */
export interface EmotionalAnalyzerConfig {
    /** Seuil de frustration pour déclencher des adaptations (0-10) */
    readonly frustrationThreshold: number;
    /** Fenêtre d'analyse des sessions récentes */
    readonly analysisWindow: number;
    /** Poids accordé à la sensibilité culturelle (0-1) */
    readonly culturalSensitivityWeight: number;
    /** Activation du mode de debug pour les logs détaillés */
    readonly debugMode?: boolean;
}

/**
 * Résultat d'analyse émotionnelle complet
 */
export interface EmotionalAnalysisResult {
    /** Contexte émotionnel détecté */
    readonly emotionalContext: EmotionalContext;
    /** Besoins utilisateur calculés */
    readonly userNeeds: UserNeeds;
    /** Techniques de support recommandées */
    readonly supportTechniques: readonly string[];
    /** Métriques de confiance de l'analyse (0-1) */
    readonly analysisConfidence: number;
    /** Horodatage de l'analyse */
    readonly timestamp: Date;
}

// === TYPES POUR LES TECHNIQUES DE SUPPORT ===

/**
 * Catégories de techniques de support émotionnel
 */
export type SupportTechniqueCategory =
    | 'relaxation'
    | 'engagement'
    | 'challenge'
    | 'encouragement'
    | 'clarity';

/**
 * Technique de support émotionnel détaillée
 */
export interface SupportTechnique {
    /** Identifiant unique de la technique */
    readonly id: string;
    /** Nom de la technique */
    readonly name: string;
    /** Description de la technique */
    readonly description: string;
    /** Catégorie de la technique */
    readonly category: SupportTechniqueCategory;
    /** Émotions pour lesquelles cette technique est recommandée */
    readonly applicableEmotions: readonly DetectedEmotion[];
    /** Niveau d'efficacité estimé (0-1) */
    readonly effectivenessLevel: number;
    /** Durée d'application recommandée en minutes */
    readonly recommendedDuration?: number;
}

// === TYPES POUR L'HISTORIQUE ET LE TRACKING ===

/**
 * Entrée d'historique émotionnel
 */
export interface EmotionalHistoryEntry {
    /** Horodatage de l'entrée */
    readonly timestamp: Date;
    /** Identifiant de la session associée */
    readonly sessionId: string;
    /** Contexte émotionnel à ce moment */
    readonly emotionalContext: EmotionalContext;
    /** Besoins utilisateur détectés */
    readonly userNeeds: UserNeeds;
    /** Actions prises en réponse */
    readonly actionsTaken: readonly string[];
}

/**
 * Historique émotionnel complet d'un utilisateur
 */
export interface EmotionalHistory {
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Liste des entrées d'historique */
    readonly entries: readonly EmotionalHistoryEntry[];
    /** Patterns émotionnels détectés */
    readonly detectedPatterns: readonly string[];
    /** Statistiques d'évolution émotionnelle */
    readonly evolutionStats: EmotionalEvolutionStats;
}

/**
 * Statistiques d'évolution émotionnelle
 */
export interface EmotionalEvolutionStats {
    /** Émotion la plus fréquente */
    readonly mostFrequentEmotion: DetectedEmotion;
    /** Progression de la confiance au fil du temps */
    readonly confidenceProgression: readonly number[];
    /** Réduction du besoin de support émotionnel */
    readonly supportReduction: number;
    /** Amélioration de l'engagement intellectuel */
    readonly intellectualEngagementImprovement: number;
}

// === TYPES UTILITAIRES ===

/**
 * Options pour la configuration des alertes émotionnelles
 */
export interface EmotionalAlertOptions {
    /** Activer les alertes pour la frustration élevée */
    readonly enableFrustrationAlerts?: boolean;
    /** Activer les alertes pour la confusion persistante */
    readonly enableConfusionAlerts?: boolean;
    /** Seuil d'intensité pour déclencher une alerte (0-1) */
    readonly alertThreshold?: number;
    /** Délai minimum entre les alertes en minutes */
    readonly minimumAlertInterval?: number;
}

/**
 * Résultat de validation émotionnelle
 */
export interface EmotionalValidationResult {
    /** L'analyse est-elle valide ? */
    readonly isValid: boolean;
    /** Score de confiance de la validation (0-1) */
    readonly confidenceScore: number;
    /** Messages de validation ou d'erreur */
    readonly messages: readonly string[];
    /** Recommandations pour améliorer la précision */
    readonly improvementSuggestions: readonly string[];
}

// === CONSTANTES UTILES ===

/**
 * Constantes pour l'analyse émotionnelle
 */
export const EMOTIONAL_CONSTANTS = {
    /** Valeurs par défaut pour les seuils */
    DEFAULT_THRESHOLDS: {
        frustration: 0.7,
        confusion: 0.6,
        confidence: 0.8,
        motivation: 0.7
    },
    /** Durées standard pour l'analyse */
    ANALYSIS_WINDOWS: {
        short: 3,
        medium: 7,
        long: 15
    },
    /** Niveaux de support par défaut */
    DEFAULT_SUPPORT_LEVELS: {
        low: 0.3,
        medium: 0.6,
        high: 0.9
    }
} as const;

// === EXPORTS DE TYPES UTILITAIRES ===

/**
 * Type guard pour vérifier si une émotion est valide
 */
export function isValidDetectedEmotion(emotion: string): emotion is DetectedEmotion {
    return ['frustrated', 'confused', 'motivated', 'confident', 'neutral'].includes(emotion);
}

/**
 * Type guard pour vérifier si une catégorie de technique est valide
 */
export function isValidSupportTechniqueCategory(category: string): category is SupportTechniqueCategory {
    return ['relaxation', 'engagement', 'challenge', 'encouragement', 'clarity'].includes(category);
}

// === EXPORTS POUR COMPATIBILITÉ ===

// Ré-exports des types principaux pour la compatibilité avec l'ancien système
export type { DetectedEmotion as EmotionType };
export type { EmotionalContext as EmotionalState };
export type { UserNeeds as LearnerNeeds };

// Export par défaut d'un objet contenant tous les types
export default {
    EMOTIONAL_CONSTANTS,
    isValidDetectedEmotion,
    isValidSupportTechniqueCategory
} as const;