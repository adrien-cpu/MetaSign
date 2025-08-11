/**
 * @file src/ai/services/learning/human/coda/codavirtuel/interfaces/AISimulatorInterfaces.ts
 * @description Interfaces spécialisées pour le simulateur d'IA-élèves révolutionnaire
 * 
 * Contient toutes les interfaces et types pour :
 * - 🤖 Configuration du simulateur
 * - 📊 Statuts et états des IA-élèves
 * - 🔄 Réactions d'apprentissage
 * - 📈 Métriques et performance
 * - 🎯 Intégration avec les systèmes
 * 
 * @module AISimulatorInterfaces
 * @version 1.0.0
 * @since 2025
 * @author MetaSign Team - CODA Simulator Interfaces
 */

import type {
    AIPersonalityProfile,
    LearningMemory,
    EmotionalState,
    EvolutionMetrics
} from '../systems/index';

// Import des types de base - nous les définirons ici pour éviter les conflits de chemin
/**
 * Niveaux du Cadre Européen Commun de Référence pour les Langues adaptés à la LSF
 */
type CECRLLevel =
    | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Humeurs possibles pour les IA-élèves Tamagotchi
 */
type AIMood =
    | 'happy' | 'excited' | 'curious' | 'focused' | 'confident' | 'neutral'
    | 'tired' | 'confused' | 'frustrated' | 'sad' | 'anxious' | 'bored';

/**
 * Environnements culturels LSF pour l'immersion
 */
type CulturalEnvironment =
    | 'deaf_family_home' | 'deaf_school' | 'deaf_community_center'
    | 'deaf_workplace' | 'deaf_social_event' | 'mixed_environment';

// ==================== EXPORT DES TYPES DE BASE ====================

export type { CECRLLevel, AIMood, CulturalEnvironment };

// ==================== TYPES DE PERSONNALITÉS IA ====================

/**
 * Type pour les personnalités IA-élève spécifiques (compatibilité avec ReverseApprenticeshipOptions)
 */
export type AIStudentPersonalityType =
    | 'curious_student'
    | 'shy_learner'
    | 'energetic_pupil'
    | 'patient_apprentice';

// ==================== CONFIGURATION DU SIMULATEUR ====================

/**
 * Configuration complète du système de simulateur d'IA-élèves
 */
export interface AIStudentSimulatorConfig {
    /** Configuration du système de personnalités */
    readonly personalityConfig?: PersonalitySystemConfig;
    /** Configuration du système de mémoire */
    readonly memoryConfig?: MemorySystemConfig;
    /** Configuration du système émotionnel */
    readonly emotionalConfig?: EmotionalSystemConfig;
    /** Configuration du système d'évolution */
    readonly evolutionConfig?: EvolutionSystemConfig;
    /** Configuration générale du simulateur */
    readonly generalConfig?: GeneralSimulatorConfig;
}

/**
 * Configuration du système de personnalités
 */
export interface PersonalitySystemConfig {
    /** Activer l'évolution dynamique des personnalités */
    readonly enableDynamicEvolution: boolean;
    /** Vitesse d'adaptation des traits (0-1) */
    readonly adaptationSpeed: number;
    /** Influence du contexte culturel (0-1) */
    readonly culturalInfluence: number;
    /** Volatilité émotionnelle de base (0-1) */
    readonly emotionalVolatility?: number;
    /** Seuil pour déclencher une évolution (0-1) */
    readonly evolutionThreshold?: number;
}

/**
 * Configuration du système de mémoire
 */
export interface MemorySystemConfig {
    /** Taux de déclin naturel des souvenirs (0-1) */
    readonly naturalDecayRate: number;
    /** Seuil pour la consolidation automatique (0-1) */
    readonly consolidationThreshold: number;
    /** Activer la consolidation automatique */
    readonly enableAutoConsolidation: boolean;
    /** Nombre maximum de souvenirs actifs */
    readonly maxActiveMemories?: number;
    /** Facteur d'oubli émotionnel (0-1) */
    readonly emotionalForgettingFactor?: number;
}

/**
 * Configuration du système émotionnel
 */
export interface EmotionalSystemConfig {
    /** Volatilité émotionnelle de base (0-1) */
    readonly baseVolatility: number;
    /** Activer la détection de patterns émotionnels */
    readonly enablePatternDetection: boolean;
    /** Sensibilité aux déclencheurs émotionnels (0-1) */
    readonly triggerSensitivity: number;
    /** Vitesse de transition émotionnelle (ms) */
    readonly transitionSpeed?: number;
    /** Profondeur de l'historique émotionnel */
    readonly historyDepth?: number;
}

/**
 * Configuration du système d'évolution
 */
export interface EvolutionSystemConfig {
    /** Sensibilité à l'évolution (0-1) */
    readonly evolutionSensitivity: number;
    /** Activer l'optimisation automatique */
    readonly enableAutoOptimization: boolean;
    /** Taux d'évolution de base (0-1) */
    readonly baseEvolutionRate: number;
    /** Seuil pour déclencher une évolution (0-1) */
    readonly evolutionThreshold?: number;
    /** Profondeur d'analyse pour l'évolution */
    readonly analysisDepth?: number;
}

/**
 * Configuration générale du simulateur
 */
export interface GeneralSimulatorConfig {
    /** Activer les logs avancés */
    readonly enableAdvancedLogging: boolean;
    /** Intervalle de synchronisation (ms) */
    readonly syncInterval: number;
    /** Nombre maximum d'IA-élèves simultanées */
    readonly maxConcurrentStudents?: number;
    /** Activer le mode développement */
    readonly developmentMode?: boolean;
}

// ==================== STATUTS ET ÉTATS ====================

/**
 * Interface pour le statut complet d'une IA-élève avec tous les systèmes
 */
export interface ComprehensiveAIStatus {
    /** Nom de l'IA-élève */
    readonly name: string;
    /** Niveau CECRL actuel */
    currentLevel: CECRLLevel;
    /** Humeur actuelle */
    mood: AIMood;
    /** Progression globale (0-1) */
    progress: number;
    /** Domaines de faiblesse identifiés */
    weaknesses: string[];
    /** Domaines de force identifiés */
    strengths: string[];
    /** Niveau de motivation (0-1) */
    motivation: number;
    /** Temps total d'apprentissage (secondes) */
    totalLearningTime: number;
    /** Type de personnalité IA */
    personality?: AIStudentPersonalityType;
    /** Contexte culturel */
    culturalContext?: CulturalEnvironment;
    /** Dernier concept appris */
    lastLearned?: string;
    /** Besoin d'aide actuel */
    needsHelp?: string;
    /** Profil de personnalité complet */
    personalityProfile: AIPersonalityProfile;
    /** État émotionnel actuel */
    emotionalState: EmotionalState;
    /** Métriques d'évolution */
    evolutionMetrics: EvolutionMetrics;
    /** Statistiques de mémoire simplifiées */
    readonly memoryStats: {
        readonly totalMemories: number;
        readonly averageRetention: number;
        readonly strongestConcepts: readonly string[];
        readonly conceptsNeedingReview: readonly string[];
        readonly memorizationEfficiency: number;
    };
    /** Historique de performance simplifié */
    readonly performanceHistory: {
        readonly averageComprehension: number;
        readonly learningVelocity: number;
        readonly emotionalStability: number;
        readonly recentProgressRate: number;
        readonly performanceConsistency: number;
    };
}

// ==================== RÉACTIONS D'APPRENTISSAGE ====================

/**
 * Interface pour une réaction d'apprentissage complète avec tous les systèmes
 */
export interface ComprehensiveAIReaction {
    /** Réaction de base */
    readonly basicReaction: {
        /** Niveau de compréhension (0-1) */
        readonly comprehension: number;
        /** Réaction textuelle générée */
        readonly reaction: string;
        /** Niveau de confiance (0-1) */
        readonly confidence: number;
        /** Timestamp de la réaction */
        readonly timestamp: Date;
    };
    /** État émotionnel résultant */
    readonly emotionalState: EmotionalState;
    /** Souvenirs rappelés pendant l'apprentissage */
    readonly recalledMemories: readonly LearningMemory[];
    /** Métriques d'évolution mises à jour */
    readonly evolutionMetrics: EvolutionMetrics;
    /** Question posée par l'IA (optionnelle) */
    readonly question?: string;
    /** Erreur commise (optionnelle) */
    readonly error?: string;
    /** Suggestions d'amélioration pédagogique */
    readonly improvementSuggestions: readonly string[];
    /** Méta-informations sur la réaction */
    readonly metadata: {
        /** Système qui a généré la réaction principale */
        readonly primarySystem: 'personality' | 'memory' | 'emotional' | 'evolution';
        /** Facteurs d'influence principaux */
        readonly influencingFactors: readonly string[];
        /** Niveau de certitude de la réaction (0-1) */
        readonly certaintyLevel: number;
        /** Temps de traitement (ms) */
        readonly processingTime: number;
        /** Version des systèmes utilisés */
        readonly systemVersions: Record<string, string>;
    };
}

// ==================== ANALYSE ET PRÉDICTION ====================

// Types simplifiés pour les fonctions utilitaires (non utilisés directement)

// ==================== TYPES UTILITAIRES ====================

/**
 * Type pour les événements du simulateur
 */
export type SimulatorEvent =
    | 'student_created'
    | 'session_started'
    | 'session_ended'
    | 'learning_achieved'
    | 'difficulty_encountered'
    | 'evolution_triggered'
    | 'emotional_state_changed'
    | 'memory_consolidated'
    | 'performance_milestone';