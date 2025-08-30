/**
 * Interface avancée pour les détecteurs de lacunes de compétences
 * 
 * @file src/ai/services/learning/human/evaluation/interfaces/ICompetencyGapDetector.ts
 * @description Interface complète et extensible pour l'analyse sophistiquée des compétences
 * 
 * Fonctionnalités avancées v2.0 :
 * - 🎯 Détection multi-dimensionnelle des lacunes
 * - 📊 Analyse prédictive et tendances d'apprentissage
 * - 🔥 Recommandations personnalisées avec IA
 * - 📊 Métriques de performance avancées
 * - 🔄 Suivi temps réel de la progression
 * - 🏢 Intégration avec systèmes externes
 * - 🔍 Analytics comportementaux
 * - ⚙️ Configuration dynamique
 * 
 * @module ICompetencyGapDetector
 * @version 2.0.0 - Interface avancée
 * @since 2025
 * @author MetaSign Team
 */

import { CompetencyGap, LearningContext, RecommendedActivity } from '@/ai/services/learning/types/learning-interfaces';

// ===== TYPES AVANCÉS ET INTERFACES SUPPORT =====

/** Niveaux de sévérité des lacunes */
export type GapSeverity = 'critical' | 'high' | 'medium' | 'low' | 'negligible';

/** Types de compétences analysées */
export type CompetencyType = 
    | 'technical' 
    | 'cognitive' 
    | 'behavioral' 
    | 'communication' 
    | 'problem_solving'
    | 'creativity'
    | 'leadership'
    | 'collaboration';

/** Méthodes de détection disponibles */
export type DetectionMethod = 
    | 'performance_analysis'
    | 'behavioral_patterns'
    | 'peer_comparison'
    | 'ai_prediction'
    | 'self_assessment'
    | 'expert_evaluation'
    | 'historical_trends';

/** Stratégies de recommandation */
export type RecommendationStrategy = 
    | 'adaptive_learning'
    | 'microlearning'
    | 'gamification'
    | 'collaborative'
    | 'personalized_ai'
    | 'spaced_repetition'
    | 'project_based';

/** Configuration de détection avancée */
export interface AdvancedDetectionConfig {
    readonly enablePredictiveAnalysis?: boolean;
    readonly includeBehavioralPatterns?: boolean;
    readonly usePeerComparison?: boolean;
    readonly aiConfidenceThreshold?: number;
    readonly timeWindowDays?: number;
    readonly minimumDataPoints?: number;
    readonly excludeCompetencyTypes?: CompetencyType[];
    readonly preferredDetectionMethods?: DetectionMethod[];
}

/** Contexte étendu avec métadonnées */
export interface ExtendedLearningContext extends LearningContext {
    readonly sessionHistory?: LearningSession[];
    readonly behavioralMetrics?: BehavioralMetrics;
    readonly learningPreferences?: LearningPreferences;
    readonly environmentalFactors?: EnvironmentalFactors;
}

/** Session d'apprentissage */
export interface LearningSession {
    readonly id: string;
    readonly timestamp: Date;
    readonly duration: number;
    readonly competenciesAddressed: string[];
    readonly performanceScore: number;
    readonly engagementLevel: number;
    readonly completionRate: number;
}

/** Métriques comportementales */
export interface BehavioralMetrics {
    readonly averageSessionDuration: number;
    readonly learningConsistency: number;
    readonly preferredLearningTimes: string[];
    readonly interactionPatterns: Record<string, number>;
    readonly motivationIndicators: MotivationIndicator[];
}

/** Indicateurs de motivation */
export interface MotivationIndicator {
    readonly type: 'intrinsic' | 'extrinsic';
    readonly level: number;
    readonly factors: string[];
}

/** Préférences d'apprentissage */
export interface LearningPreferences {
    readonly learningStyles: string[];
    readonly preferredContentTypes: string[];
    readonly difficultyPreference: 'gradual' | 'challenging' | 'mixed';
    readonly feedbackFrequency: 'immediate' | 'periodic' | 'summary';
}

/** Facteurs environnementaux */
export interface EnvironmentalFactors {
    readonly deviceTypes: string[];
    readonly networkQuality: 'excellent' | 'good' | 'fair' | 'poor';
    readonly distractionLevel: number;
    readonly supportSystemAvailable: boolean;
}

/** Lacune de compétence enrichie */
export interface EnrichedCompetencyGap extends CompetencyGap {
    readonly severity: GapSeverity;
    readonly type: CompetencyType;
    readonly detectionMethod: DetectionMethod;
    readonly confidence: number;
    readonly predictedImpact: number;
    readonly estimatedTimeToClose: number;
    readonly prerequisiteGaps: string[];
    readonly relatedCompetencies: string[];
    readonly trends: GapTrend[];
}

/** Tendance d'évolution des lacunes */
export interface GapTrend {
    readonly timestamp: Date;
    readonly severity: GapSeverity;
    readonly progressIndicator: number;
    readonly interventionsApplied: string[];
}

/** Activité recommandée enrichie */
export interface EnrichedRecommendedActivity extends RecommendedActivity {
    readonly strategy: RecommendationStrategy;
    readonly expectedEffectiveness: number;
    readonly personalizationScore: number;
    readonly prerequisites: string[];
    readonly alternativeActivities: string[];
    readonly estimatedCompletionTime: number;
    readonly difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    readonly engagementFactor: number;
}

/** Résultat d'analyse complète */
export interface CompetencyAnalysisResult {
    readonly userId: string;
    readonly analysisTimestamp: Date;
    readonly overallCompetencyScore: number;
    readonly identifiedGaps: EnrichedCompetencyGap[];
    readonly strengths: CompetencyStrength[];
    readonly recommendations: EnrichedRecommendedActivity[];
    readonly nextReviewDate: Date;
    readonly confidence: number;
}

/** Force de compétence identifiée */
export interface CompetencyStrength {
    readonly competencyId: string;
    readonly name: string;
    readonly level: number;
    readonly type: CompetencyType;
    readonly evidenceSources: string[];
    readonly leveragingOpportunities: string[];
}

/** Métriques de performance du détecteur */
export interface DetectorPerformanceMetrics {
    readonly accuracy: number;
    readonly precision: number;
    readonly recall: number;
    readonly f1Score: number;
    readonly processingTime: number;
    readonly dataQualityScore: number;
    readonly recommendationSuccessRate: number;
}

/** Informations de service enrichies */
export interface EnrichedServiceInfo {
    readonly name: string;
    readonly version: string;
    readonly features: string[];
    readonly supportedCompetencyTypes: CompetencyType[];
    readonly detectionMethods: DetectionMethod[];
    readonly recommendationStrategies: RecommendationStrategy[];
    readonly performanceMetrics: DetectorPerformanceMetrics;
    readonly lastUpdated: Date;
    readonly configurationOptions: string[];
}

// ===== INTERFACE PRINCIPALE AVANCÉE =====

/**
 * Interface avancée pour les détecteurs sophistiqués de lacunes de compétences
 * 
 * Cette interface permet une analyse multi-dimensionnelle des compétences
 * avec intelligence artificielle, prédictions et personnalisation avancée.
 * 
 * @interface ICompetencyGapDetector
 * @version 2.0.0 - Interface complète et extensible
 */
export interface ICompetencyGapDetector {
    
    // ===== MÉTHODES PRINCIPALES DE DÉTECTION =====
    
    /**
     * Détecte les lacunes de compétences avec analyse avancée multi-dimensionnelle
     * @param userId - Identifiant unique de l'utilisateur
     * @param context - Contexte d'apprentissage étendu
     * @param config - Configuration avancée de détection (optionnel)
     * @returns Analyse complète avec lacunes enrichies et métriques
     * @throws Error si les données sont insuffisantes ou corrompues
     */
    detectGaps(
        userId: string, 
        context: ExtendedLearningContext, 
        config?: AdvancedDetectionConfig
    ): Promise<EnrichedCompetencyGap[]>;

    /**
     * Effectue une analyse complète des compétences (lacunes + forces)
     * @param userId - Identifiant de l'utilisateur
     * @param context - Contexte d'apprentissage complet
     * @param config - Configuration d'analyse
     * @returns Résultat d'analyse holistique
     */
    performComprehensiveAnalysis(
        userId: string,
        context: ExtendedLearningContext,
        config?: AdvancedDetectionConfig
    ): Promise<CompetencyAnalysisResult>;

    /**
     * Priorise intelligemment les lacunes avec algorithmes d'optimisation
     * @param gaps - Lacunes identifiées
     * @param userProfile - Profil utilisateur pour personnalisation
     * @param constraints - Contraintes de temps/ressources (optionnel)
     * @returns Lacunes priorisées avec justifications
     */
    prioritizeGaps(
        gaps: EnrichedCompetencyGap[], 
        userProfile?: Record<string, unknown>,
        constraints?: {
            timeAvailable?: number;
            resourceLimits?: string[];
            urgencyFactors?: string[];
        }
    ): Promise<EnrichedCompetencyGap[]>;

    // ===== RECOMMANDATIONS INTELLIGENTES =====

    /**
     * Génère des recommandations personnalisées avec IA
     * @param userId - Identifiant utilisateur
     * @param gaps - Lacunes à traiter
     * @param preferences - Préférences d'apprentissage
     * @returns Activités recommandées avec scoring de pertinence
     */
    recommendActivities(
        userId: string, 
        gaps: EnrichedCompetencyGap[],
        preferences?: LearningPreferences
    ): Promise<EnrichedRecommendedActivity[]>;

    /**
     * Génère un plan d'apprentissage personnalisé sur mesure
     * @param userId - Identifiant utilisateur
     * @param analysisResult - Résultat d'analyse complète
     * @param timeline - Durée souhaitée du plan (en jours)
     * @returns Plan d'apprentissage structuré et optimisé
     */
    generateLearningPlan(
        userId: string,
        analysisResult: CompetencyAnalysisResult,
        timeline: number
    ): Promise<{
        plan: {
            phase: number;
            title: string;
            activities: EnrichedRecommendedActivity[];
            expectedOutcomes: string[];
            duration: number;
        }[];
        totalDuration: number;
        expectedImprovement: number;
    }>;

    // ===== ANALYSE PRÉDICTIVE =====

    /**
     * Prédit l'évolution future des compétences avec IA
     * @param userId - Identifiant utilisateur
     * @param currentState - État actuel des compétences
     * @param timeHorizon - Horizon de prédiction (en jours)
     * @returns Prédictions d'évolution avec intervalles de confiance
     */
    predictCompetencyEvolution(
        userId: string,
        currentState: CompetencyAnalysisResult,
        timeHorizon: number
    ): Promise<{
        predictions: {
            competencyId: string;
            currentLevel: number;
            predictedLevel: number;
            confidence: number;
            trendDirection: 'improving' | 'stable' | 'declining';
        }[];
        overallTrend: 'positive' | 'neutral' | 'concerning';
        riskFactors: string[];
        opportunityAreas: string[];
    }>;

    /**
     * Identifie les patterns comportementaux et tendances d'apprentissage
     * @param userId - Identifiant utilisateur
     * @param sessionHistory - Historique des sessions d'apprentissage
     * @returns Analyse des patterns avec recommandations d'optimisation
     */
    analyzeLearningPatterns(
        userId: string,
        sessionHistory: LearningSession[]
    ): Promise<{
        patterns: {
            type: string;
            description: string;
            frequency: number;
            impact: 'positive' | 'neutral' | 'negative';
        }[];
        optimalLearningTimes: string[];
        recommendedSessionDuration: number;
        motivationTriggers: string[];
    }>;

    // ===== MONITORING ET MÉTRIQUES =====

    /**
     * Suit la progression en temps réel
     * @param userId - Identifiant utilisateur
     * @param competencyIds - Compétences à suivre
     * @returns Flux de données de progression temps réel
     */
    trackProgressRealTime(
        userId: string,
        competencyIds: string[]
    ): Promise<{
        subscribe: (callback: (progress: {
            competencyId: string;
            currentLevel: number;
            progressRate: number;
            lastActivity: Date;
            nextMilestone: string;
        }[]) => void) => void;
        unsubscribe: () => void;
    }>;

    /**
     * Évalue l'efficacité des recommandations passées
     * @param userId - Identifiant utilisateur
     * @param recommendationIds - IDs des recommandations à évaluer
     * @returns Métriques d'efficacité et apprentissages
     */
    evaluateRecommendationEffectiveness(
        userId: string,
        recommendationIds: string[]
    ): Promise<{
        overallEffectiveness: number;
        byRecommendation: {
            id: string;
            effectiveness: number;
            userEngagement: number;
            competencyImprovement: number;
            timeToComplete: number;
        }[];
        learningInsights: string[];
    }>;

    // ===== CONFIGURATION ET ADMINISTRATION =====

    /**
     * Configure dynamiquement le détecteur
     * @param config - Nouvelle configuration
     * @returns Confirmation de mise à jour et impact
     */
    updateConfiguration(config: Partial<AdvancedDetectionConfig>): Promise<{
        updated: boolean;
        changesApplied: string[];
        impactEstimation: string;
    }>;

    /**
     * Calibre le détecteur avec nouvelles données d'entraînement
     * @param trainingData - Données d'entraînement
     * @returns Résultats de calibration
     */
    calibrateDetector(trainingData: {
        userId: string;
        actualOutcomes: Record<string, number>;
        contextData: ExtendedLearningContext;
    }[]): Promise<{
        improvementMetrics: DetectorPerformanceMetrics;
        calibrationSuccess: boolean;
        recommendedAdjustments: string[];
    }>;

    /**
     * Obtient les informations complètes sur le service
     * @returns Informations détaillées avec métriques de performance
     */
    getServiceInfo(): EnrichedServiceInfo;

    /**
     * Obtient les métriques de performance en temps réel
     * @returns Métriques actuelles du détecteur
     */
    getPerformanceMetrics(): Promise<DetectorPerformanceMetrics>;

    // ===== INTÉGRATIONS EXTERNES =====

    /**
     * Synchronise avec des systèmes externes (LMS, HR, etc.)
     * @param externalSystems - Configuration des systèmes externes
     * @returns Statut de synchronisation
     */
    syncWithExternalSystems(externalSystems: {
        type: string;
        endpoint: string;
        credentials?: Record<string, string>;
        dataMapping: Record<string, string>;
    }[]): Promise<{
        syncResults: {
            system: string;
            success: boolean;
            recordsProcessed: number;
            errors?: string[];
        }[];
        overallStatus: 'success' | 'partial' | 'failed';
    }>;

    /**
     * Exporte les données d'analyse pour intégration externe
     * @param userId - Identifiant utilisateur
     * @param format - Format d'export ('json' | 'csv' | 'xml')
     * @param includeRawData - Inclure les données brutes
     * @returns Données formatées pour export
     */
    exportAnalysisData(
        userId: string,
        format: 'json' | 'csv' | 'xml',
        includeRawData?: boolean
    ): Promise<{
        data: string | Record<string, unknown>;
        metadata: {
            exportDate: Date;
            recordCount: number;
            dataIntegrity: boolean;
        };
    }>;

    // ===== CYCLE DE VIE ET NETTOYAGE =====

    /**
     * Initialise le détecteur avec paramètres personnalisés
     * @param config - Configuration initiale
     * @returns Confirmation d'initialisation
     */
    initialize(config?: AdvancedDetectionConfig): Promise<{
        initialized: boolean;
        version: string;
        capabilities: string[];
    }>;

    /**
     * Nettoie les ressources et ferme les connexions
     * @returns Confirmation de nettoyage
     */
    dispose(): Promise<{
        disposed: boolean;
        resourcesFreed: string[];
        finalMetrics: DetectorPerformanceMetrics;
    }>;
}

// ===== INTERFACES OPTIONNELLES POUR EXTENSIONS =====

/**
 * Interface optionnelle pour détecteurs avec capacités d'apprentissage automatique
 */
export interface IMLCapableDetector extends ICompetencyGapDetector {
    /**
     * Entraîne le modèle avec nouvelles données
     * @param trainingData - Données d'entraînement
     * @returns Résultats d'entraînement
     */
    trainModel(trainingData: unknown[]): Promise<{
        trainingSuccess: boolean;
        modelAccuracy: number;
        iterationsCompleted: number;
    }>;
}

/**
 * Interface optionnelle pour détecteurs collaboratifs
 */
export interface ICollaborativeDetector extends ICompetencyGapDetector {
    /**
     * Compare les compétences avec des pairs
     * @param userId - Identifiant utilisateur
     * @param peerGroup - Groupe de pairs pour comparaison
     * @returns Analyse comparative
     */
    compareToPeers(userId: string, peerGroup: string[]): Promise<{
        userRanking: number;
        strengthsVsPeers: string[];
        gapsVsPeers: string[];
        improvementOpportunities: string[];
    }>;
}

/**
 * Interface optionnelle pour détecteurs temps réel
 */
export interface IRealTimeDetector extends ICompetencyGapDetector {
    /**
     * Démarre la surveillance temps réel
     * @param userId - Identifiant utilisateur
     * @param callback - Fonction de callback pour les mises à jour
     * @returns Identifiant de la session de surveillance
     */
    startRealTimeMonitoring(
        userId: string,
        callback: (update: {
            timestamp: Date;
            competencyChanges: {
                competencyId: string;
                oldLevel: number;
                newLevel: number;
                trigger: string;
            }[];
            newGapsDetected: EnrichedCompetencyGap[];
            gapsResolved: string[];
        }) => void
    ): Promise<string>;

    /**
     * Arrête la surveillance temps réel
     * @param sessionId - Identifiant de session
     * @returns Confirmation d'arrêt
     */
    stopRealTimeMonitoring(sessionId: string): Promise<boolean>;
}

// ===== TYPES UTILITAIRES =====

/**
 * Type guard pour vérifier les capacités ML
 */
export function isMLCapable(detector: ICompetencyGapDetector): detector is IMLCapableDetector {
    return 'trainModel' in detector && typeof (detector as IMLCapableDetector).trainModel === 'function';
}

/**
 * Type guard pour vérifier les capacités collaboratives
 */
export function isCollaborative(detector: ICompetencyGapDetector): detector is ICollaborativeDetector {
    return 'compareToPeers' in detector && typeof (detector as ICollaborativeDetector).compareToPeers === 'function';
}

/**
 * Type guard pour vérifier les capacités temps réel
 */
export function isRealTime(detector: ICompetencyGapDetector): detector is IRealTimeDetector {
    return 'startRealTimeMonitoring' in detector && typeof (detector as IRealTimeDetector).startRealTimeMonitoring === 'function';
}

/**
 * Factory type pour créer des détecteurs avec capacités spécifiques
 */
export type DetectorFactory<T extends ICompetencyGapDetector = ICompetencyGapDetector> = {
    create: (config?: AdvancedDetectionConfig) => Promise<T>;
    getCapabilities: () => string[];
    getVersion: () => string;
};

/**
 * Union type pour tous les types de détecteurs
 */
export type AnyCompetencyDetector = 
    | ICompetencyGapDetector 
    | IMLCapableDetector 
    | ICollaborativeDetector 
    | IRealTimeDetector
    | (ICompetencyGapDetector & IMLCapableDetector)
    | (ICompetencyGapDetector & ICollaborativeDetector)
    | (ICompetencyGapDetector & IRealTimeDetector)
    | (ICompetencyGapDetector & IMLCapableDetector & ICollaborativeDetector & IRealTimeDetector);

// ===== CONSTANTES ET VALEURS PAR DÉFAUT =====

/** Configuration par défaut pour la détection */
export const DEFAULT_DETECTION_CONFIG: Required<AdvancedDetectionConfig> = {
    enablePredictiveAnalysis: true,
    includeBehavioralPatterns: true,
    usePeerComparison: false,
    aiConfidenceThreshold: 0.75,
    timeWindowDays: 30,
    minimumDataPoints: 10,
    excludeCompetencyTypes: [],
    preferredDetectionMethods: ['performance_analysis', 'ai_prediction']
};

/** Seuils de sévérité par défaut */
export const SEVERITY_THRESHOLDS = {
    critical: 0.9,
    high: 0.7,
    medium: 0.5,
    low: 0.3,
    negligible: 0.1
} as const;

/** Types de compétences supportés */
export const SUPPORTED_COMPETENCY_TYPES: readonly CompetencyType[] = [
    'technical',
    'cognitive', 
    'behavioral',
    'communication',
    'problem_solving',
    'creativity',
    'leadership',
    'collaboration'
] as const;