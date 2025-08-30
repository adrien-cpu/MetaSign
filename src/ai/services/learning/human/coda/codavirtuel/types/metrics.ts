/**
 * @file src/ai/services/learning/human/coda/codavirtuel/types/metrics.ts
 * @description Types et interfaces révolutionnaires pour les métriques et statistiques CODA
 * 
 * Fonctionnalités avancées :
 * - 📊 Métriques d'évolution et progression IA
 * - 🧠 Statistiques de mémoire et consolidation
 * - 📈 Historique de performance détaillé
 * - 🎯 Statut complet des IA-élèves
 * - 🌐 Statistiques globales du système
 * - 🔄 Suivi temps réel et prédictions
 * - 💡 Analytics comportementales avancées
 * 
 * @module MetricsTypes
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Analytics Division
 */

import { CECRLLevel, AIMood, CulturalEnvironment, AIStudentPersonalityType } from './base';
import { EmotionalState, AIPersonalityProfile } from './personality';

/**
 * Métriques fondamentales d'évolution des IA-élèves
 * 
 * @interface EvolutionMetrics
 * @description Suit l'évolution comportementale et cognitive
 * des IA-élèves avec prédictions de performance
 * 
 * @example
 * ```typescript
 * const metrics: EvolutionMetrics = {
 *   globalConfidence: 0.85,
 *   recentSuccessRate: 0.78,
 *   learningCurve: [0.6, 0.7, 0.75, 0.8],
 *   adaptationCount: 15
 * };
 * ```
 */
export interface EvolutionMetrics {
    /** Niveau de confiance global de l'IA-élève (0-1) */
    readonly globalConfidence: number;
    /** Taux de réussite récent (0-1) */
    readonly recentSuccessRate: number;
    /** Courbe d'apprentissage temporelle */
    readonly learningCurve: readonly number[];
    /** Nombre total d'adaptations effectuées */
    readonly adaptationCount: number;
    /** Cohérence comportementale (0-1) */
    readonly behavioralConsistency: number;
    /** Temps écoulé depuis dernière évolution (ms) */
    readonly timeSinceLastEvolution: number;
    /** Prédiction de performance future (0-1) */
    readonly futurePerformancePrediction?: number;
    /** Domaines d'amélioration identifiés */
    readonly improvementAreas?: readonly string[];
}

/**
 * Métriques d'évolution étendues avec indicateurs avancés
 * 
 * @interface ExtendedEvolutionMetrics
 * @extends EvolutionMetrics
 * @description Enrichit les métriques de base avec des indicateurs
 * spécialisés pour l'analyse comportementale approfondie
 */
export interface ExtendedEvolutionMetrics extends EvolutionMetrics {
    /** Vitesse d'apprentissage mesurée (0-1) */
    readonly learningSpeed?: number;
    /** Capacité d'adaptation aux nouveaux contextes (0-1) */
    readonly adaptability?: number;
    /** Progression du développement émotionnel (0-1) */
    readonly emotionalProgress?: number;
    /** Stabilité comportementale dans le temps (0-1) */
    readonly behavioralStability?: number;
}

/**
 * Statistiques complètes du système de mémoire IA
 * 
 * @interface MemoryStats
 * @description Surveille l'utilisation, l'efficacité et la santé
 * du système de mémoire adaptatif des IA-élèves
 */
export interface MemoryStats {
    /** Capacité totale de mémoire disponible */
    readonly totalCapacity: number;
    /** Mémoire actuellement utilisée */
    readonly usedMemory: number;
    /** Nombre total de souvenirs stockés */
    readonly memoriesCount: number;
    /** Taux de récupération réussi (0-1) */
    readonly retrievalRate: number;
    /** Âge moyen des souvenirs (en heures) */
    readonly averageMemoryAge: number;
    /** Niveau de fragmentation mémoire (0-1) */
    readonly fragmentation: number;
    /** Dernière consolidation de mémoire */
    readonly lastConsolidation?: Date;
    /** Efficacité de stockage (0-1) */
    readonly storageEfficiency?: number;
}

/**
 * Historique détaillé des performances d'apprentissage
 * 
 * @interface PerformanceHistory
 * @description Capture l'évolution temporelle des compétences,
 * erreurs récurrentes et améliorations notables
 */
export interface PerformanceHistory {
    readonly recentScores: readonly number[];
    readonly averageResponseTimes: readonly number[];
    readonly competencyProgression: ReadonlyMap<string, readonly number[]>;
    readonly frequentErrors: readonly string[];
    readonly notableImprovements: readonly {
        readonly area: string;
        readonly improvementRate: number;
        readonly timestamp: Date;
    }[];
    readonly totalSessions: number;
    readonly totalLearningTime: number;
}

/**
 * Statut complet et détaillé d'une IA-élève
 * 
 * @interface ComprehensiveAIStatus
 * @description Vue d'ensemble exhaustive incluant personnalité,
 * émotions, métriques et historique pour monitoring complet
 * 
 * @example
 * ```typescript
 * const aiStatus: ComprehensiveAIStatus = {
 *   id: 'ai_student_001',
 *   name: 'Sophie',
 *   personality: 'curious',
 *   currentLevel: 'A2',
 *   progress: 0.75
 * };
 * ```
 */
export interface ComprehensiveAIStatus {
    /** Identifiant unique de l'IA-élève */
    readonly id: string;
    /** Nom personnalisé de l'IA-élève */
    readonly name: string;
    /** Type de personnalité d'apprentissage */
    readonly personality: AIStudentPersonalityType;
    /** Niveau CECRL actuel */
    readonly currentLevel: CECRLLevel;
    /** Humeur actuelle de l'IA */
    readonly mood: AIMood;
    readonly culturalContext: CulturalEnvironment;
    readonly personalityProfile: AIPersonalityProfile;
    readonly emotionalState: EmotionalState;
    readonly evolutionMetrics: ExtendedEvolutionMetrics;
    readonly memoryStats: MemoryStats;
    readonly performanceHistory: PerformanceHistory;
    readonly weaknesses: readonly string[];
    readonly strengths: readonly string[];
    readonly lastLearned?: string;
    /** Progression globale d'apprentissage (0-1) */
    readonly progress: number;
    /** Niveau de motivation actuel (0-1) */
    readonly motivation: number;
    readonly totalLearningTime: number;
    readonly comprehensionRate: number;
    readonly attentionSpan: number;
}

/**
 * Statistiques globales et santé du système CODA
 * 
 * @interface CODAGlobalStatistics
 * @description Métriques système pour monitoring global,
 * performance et distribution des éléments actifs
 */
export interface CODAGlobalStatistics {
    readonly totalSessions: number;
    readonly activeMentors: number;
    readonly totalAIStudents: number;
    readonly averageMentorScore: number;
    readonly totalTeachingSessions: number;
    readonly activeSessions: number;
    readonly emotionalDistribution: Readonly<Record<string, number>>;
    readonly popularConcepts: readonly string[];
    readonly systemHealth: {
        readonly uptime: number;
        readonly responseTime: number;
        readonly errorRate: number;
    };
}