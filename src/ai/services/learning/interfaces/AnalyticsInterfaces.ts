/**
 * @file src/ai/services/learning/interfaces/AnalyticsInterfaces.ts
 * @description Interfaces pour l'analytics et les événements d'apprentissage LSF.
 * Contient les définitions pour le suivi, l'évaluation et les parcours personnalisés.
 * Compatible avec exactOptionalPropertyTypes: true
 * @module AnalyticsInterfaces
 * @version 3.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * @example
 * ```typescript
 * import type { 
 *   LSFInteractionAnalytics, 
 *   LSFAssessmentResult,
 *   LSFSystemEvent 
 * } from './AnalyticsInterfaces';
 * ```
 */

import type { LSFEventType, InteractionRecord, CompetencyLevel } from './CoreLearningInterfaces';

/**
 * Données d'analytics génériques
 */
export interface AnalyticsData {
    /** Identifiant des données */
    readonly id: string;
    /** Timestamp de collecte */
    readonly timestamp: Date;
    /** Source des données */
    readonly source: string;
    /** Type de données */
    readonly dataType: string;
    /** Payload des données */
    readonly payload: Readonly<Record<string, unknown>>;
    /** Métadonnées (optionnel) */
    readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Métriques de performance
 */
export interface PerformanceMetrics {
    /** Identifiant des métriques */
    readonly id: string;
    /** Service concerné */
    readonly serviceName: string;
    /** Timestamp de mesure */
    readonly timestamp: Date;
    /** Temps de réponse (ms) */
    readonly responseTime: number;
    /** Utilisation CPU (%) */
    readonly cpuUsage: number;
    /** Utilisation mémoire (MB) */
    readonly memoryUsage: number;
    /** Nombre de requêtes */
    readonly requestCount: number;
    /** Taux d'erreur (%) */
    readonly errorRate: number;
    /** Débit (requêtes/sec) */
    readonly throughput: number;
}

/**
 * Insights d'apprentissage
 */
export interface LearningInsights {
    /** Identifiant de l'insight */
    readonly id: string;
    /** Utilisateur concerné */
    readonly userId: string;
    /** Type d'insight */
    readonly type: 'pattern' | 'recommendation' | 'prediction' | 'anomaly';
    /** Titre de l'insight */
    readonly title: string;
    /** Description */
    readonly description: string;
    /** Score de confiance (0-1) */
    readonly confidence: number;
    /** Données supportant l'insight */
    readonly supportingData: Readonly<Record<string, unknown>>;
    /** Actions recommandées */
    readonly recommendedActions: readonly string[];
    /** Date de création */
    readonly createdAt: Date;
}

/**
 * Analytics comportementales
 */
export interface BehavioralAnalytics {
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Période d'analyse */
    readonly period: {
        readonly start: Date;
        readonly end: Date;
    };
    /** Patterns de navigation */
    readonly navigationPatterns: {
        /** Pages les plus visitées */
        readonly topPages: readonly string[];
        /** Chemins de navigation courants */
        readonly commonPaths: readonly string[];
        /** Taux de rebond */
        readonly bounceRate: number;
        /** Temps moyen par page */
        readonly avgTimePerPage: number;
    };
    /** Engagement */
    readonly engagement: {
        /** Sessions totales */
        readonly totalSessions: number;
        /** Durée moyenne de session */
        readonly avgSessionDuration: number;
        /** Pages par session */
        readonly pagesPerSession: number;
        /** Taux de retour */
        readonly returnRate: number;
    };
    /** Préférences déduites */
    readonly inferredPreferences: {
        /** Types de contenu préférés */
        readonly preferredContentTypes: readonly string[];
        /** Horaires d'activité */
        readonly activeHours: readonly number[];
        /** Fréquence d'utilisation */
        readonly usageFrequency: 'daily' | 'weekly' | 'monthly' | 'irregular';
    };
}

/**
 * Analytics prédictives
 */
export interface PredictiveAnalytics {
    /** Identifiant de la prédiction */
    readonly id: string;
    /** Utilisateur concerné */
    readonly userId: string;
    /** Type de prédiction */
    readonly predictionType: 'performance' | 'completion' | 'engagement' | 'churn';
    /** Valeur prédite */
    readonly predictedValue: number;
    /** Confiance de la prédiction (0-1) */
    readonly confidence: number;
    /** Horizon temporel (jours) */
    readonly timeHorizon: number;
    /** Facteurs influents */
    readonly influencingFactors: readonly {
        readonly factor: string;
        readonly weight: number;
        readonly impact: 'positive' | 'negative' | 'neutral';
    }[];
    /** Date de prédiction */
    readonly predictionDate: Date;
    /** Modèle utilisé */
    readonly model: string;
}

/**
 * Analytics temps réel
 */
export interface RealtimeAnalytics {
    /** Timestamp de l'événement */
    readonly timestamp: Date;
    /** Utilisateurs actifs */
    readonly activeUsers: {
        /** Nombre d'utilisateurs en ligne */
        readonly current: number;
        /** Pic dans les dernières 24h */
        readonly peak24h: number;
        /** Répartition par région */
        readonly byRegion: Readonly<Record<string, number>>;
    };
    /** Activité en cours */
    readonly currentActivity: {
        /** Sessions actives */
        readonly activeSessions: number;
        /** Modules en cours */
        readonly modulesInProgress: number;
        /** Exercices actifs */
        readonly activeExercises: number;
    };
    /** Performance système */
    readonly systemPerformance: {
        /** Temps de réponse moyen */
        readonly avgResponseTime: number;
        /** Taux d'erreur */
        readonly errorRate: number;
        /** Charge serveur */
        readonly serverLoad: number;
    };
}

/**
 * Analytics historiques
 */
export interface HistoricalAnalytics {
    /** Période couverte */
    readonly period: {
        readonly start: Date;
        readonly end: Date;
    };
    /** Tendances d'utilisation */
    readonly usageTrends: {
        /** Utilisateurs uniques par jour */
        readonly dailyActiveUsers: readonly {
            readonly date: Date;
            readonly count: number;
        }[];
        /** Temps d'engagement par semaine */
        readonly weeklyEngagement: readonly {
            readonly week: string;
            readonly totalTime: number;
            readonly avgSession: number;
        }[];
        /** Croissance mensuelle */
        readonly monthlyGrowth: readonly {
            readonly month: string;
            readonly newUsers: number;
            readonly retainedUsers: number;
            readonly churnRate: number;
        }[];
    };
    /** Performance des contenus */
    readonly contentPerformance: {
        /** Modules les plus populaires */
        readonly topModules: readonly {
            readonly moduleId: string;
            readonly completions: number;
            readonly avgRating: number;
        }[];
        /** Taux de complétion par catégorie */
        readonly completionRates: Readonly<Record<string, number>>;
    };
}

/**
 * Résultat d'évaluation spécialisé LSF
 */
export interface LSFAssessmentResult {
    /** Identifiant de l'évaluation */
    readonly assessmentId: string;
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Score global (0-100) */
    readonly overallScore: number;
    /** Scores par compétence LSF */
    readonly skillScores: Readonly<Record<string, number>>;
    /** Niveau CECRL évalué */
    readonly cecrLevel: CompetencyLevel;
    /** Temps d'évaluation */
    readonly duration: number;
    /** Date d'évaluation */
    readonly date: Date;
    /** Recommandations personnalisées */
    readonly recommendations: {
        /** Modules recommandés */
        readonly suggestedModules: readonly string[];
        /** Compétences à améliorer */
        readonly skillsToImprove: readonly string[];
        /** Prochaines étapes */
        readonly nextSteps: readonly string[];
    };
    /** Analyse détaillée */
    readonly detailedAnalysis: {
        /** Points forts identifiés */
        readonly strengths: readonly string[];
        /** Points d'amélioration */
        readonly areasForImprovement: readonly string[];
        /** Erreurs fréquentes */
        readonly commonMistakes: readonly string[];
    };
}

/**
 * Parcours d'apprentissage personnalisé LSF
 */
export interface LSFLearningPath {
    /** Identifiant du parcours */
    readonly pathId: string;
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Titre du parcours */
    readonly title: string;
    /** Description du parcours */
    readonly description: string;
    /** Objectif d'apprentissage */
    readonly learningGoal: string;
    /** Niveau cible */
    readonly targetLevel: CompetencyLevel;
    /** Durée estimée (semaines) */
    readonly estimatedDuration: number;
    /** Modules du parcours */
    readonly modules: readonly {
        /** Identifiant du module */
        readonly moduleId: string;
        /** Ordre dans le parcours */
        readonly order: number;
        /** Statut */
        readonly status: 'pending' | 'current' | 'completed' | 'skipped';
        /** Date de début prévue (optionnel) */
        readonly scheduledStart?: Date;
        /** Date de fin prévue (optionnel) */
        readonly scheduledEnd?: Date;
    }[];
    /** Progression globale */
    readonly overallProgress: number;
    /** Date de création */
    readonly createdAt: Date;
    /** Dernière mise à jour */
    readonly lastUpdated: Date;
    /** Personnalisation */
    readonly customization: {
        /** Rythme d'apprentissage */
        readonly pace: 'slow' | 'normal' | 'fast';
        /** Préférences d'horaires */
        readonly timePreferences: readonly string[];
        /** Objectifs spécifiques */
        readonly specificGoals: readonly string[];
    };
}

/**
 * Analytics des interactions utilisateur avec le contenu LSF
 */
export interface LSFInteractionAnalytics {
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Période d'analyse */
    readonly period: {
        /** Date de début */
        readonly startDate: Date;
        /** Date de fin */
        readonly endDate: Date;
    };
    /** Temps total d'engagement */
    readonly totalEngagementTime: number;
    /** Sessions d'apprentissage */
    readonly sessions: {
        /** Nombre total de sessions */
        readonly total: number;
        /** Durée moyenne par session */
        readonly averageDuration: number;
        /** Fréquence par semaine */
        readonly weeklyFrequency: number;
    };
    /** Contenus les plus consultés */
    readonly topContent: readonly {
        /** Identifiant du contenu */
        readonly contentId: string;
        /** Nombre de consultations */
        readonly viewCount: number;
        /** Temps passé */
        readonly timeSpent: number;
    }[];
    /** Patterns d'apprentissage */
    readonly learningPatterns: {
        /** Heures préférées */
        readonly preferredHours: readonly number[];
        /** Jours de la semaine actifs */
        readonly activeDays: readonly string[];
        /** Durée de session préférée */
        readonly preferredSessionLength: number;
    };
    /** Difficultés rencontrées */
    readonly challenges: {
        /** Concepts difficiles */
        readonly difficultConcepts: readonly string[];
        /** Erreurs fréquentes */
        readonly frequentErrors: readonly string[];
        /** Zones d'abandon */
        readonly dropOffPoints: readonly string[];
    };
}

/**
 * Événement système LSF
 */
export interface LSFSystemEvent {
    /** Type d'événement */
    readonly eventType: LSFEventType;
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Horodatage */
    readonly timestamp: Date;
    /** Données de l'événement */
    readonly eventData: Readonly<Record<string, unknown>>;
    /** Métadonnées (optionnel) */
    readonly metadata?: {
        /** Source de l'événement */
        readonly source: string;
        /** Version du système */
        readonly systemVersion: string;
        /** Contexte utilisateur */
        readonly userContext: Readonly<Record<string, unknown>>;
    };
}

/**
 * Interface pour le service d'analytics LSF
 */
export interface ILSFAnalyticsService {
    /** Collecte les interactions utilisateur */
    trackInteraction(interaction: InteractionRecord): Promise<void>;
    /** Génère un rapport d'analytics */
    generateReport(
        userId: string,
        period: { readonly startDate: Date; readonly endDate: Date }
    ): Promise<LSFInteractionAnalytics>;
    /** Identifie les patterns d'apprentissage */
    identifyLearningPatterns(userId: string): Promise<Readonly<Record<string, unknown>>>;
    /** Recommande du contenu basé sur l'analytics */
    recommendContent(userId: string, count?: number): Promise<readonly string[]>;
}

/**
 * Interface pour le processeur d'événements LSF
 */
export interface ILSFEventProcessor {
    /** Traite un événement LSF */
    processEvent(event: LSFSystemEvent): Promise<void>;
    /** Enregistre un listener d'événement */
    addEventListener(
        eventType: LSFEventType,
        listener: (event: LSFSystemEvent) => void
    ): void;
    /** Supprime un listener d'événement */
    removeEventListener(
        eventType: LSFEventType,
        listener: (event: LSFSystemEvent) => void
    ): void;
    /** Émet un événement */
    emitEvent(event: LSFSystemEvent): Promise<void>;
}