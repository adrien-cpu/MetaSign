/**
 * @file src/ai/services/learning/evaluation/interfaces/ICompetencyGapDetector.ts
 * @description Interface pour la détection des lacunes de compétences en LSF
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.1.0
 * @since 2024
 * @lastModified 2025-01-15
 */

// ================================
// TYPES ET INTERFACES
// ================================

/**
 * Contexte simple pour la détection de lacunes
 */
export interface SimpleDetectionContext {
    /** Identifiant utilisateur */
    readonly userId: string;
    /** Temps passé sur l'activité */
    readonly timeSpent: number;
    /** Données additionnelles */
    readonly additionalData?: Readonly<Record<string, unknown>>;
}

/**
 * Lacune de compétence détectée
 */
export interface CompetencyGap {
    /** Identifiant unique de la lacune */
    readonly id: string;
    /** Compétence concernée */
    readonly competency: string;
    /** Description de la lacune */
    readonly description: string;
    /** Niveau de sévérité (1-10) */
    readonly severity: number;
    /** Impact sur l'apprentissage (1-10) */
    readonly impact: number;
    /** Confiance dans la détection (0-1) */
    readonly confidence: number;
    /** Recommandations pour combler la lacune */
    readonly recommendations: readonly string[];
    /** Timestamp de détection */
    readonly detectedAt: Date;
    /** Métadonnées additionnelles */
    readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Résultat de détection de lacunes
 */
export interface GapDetectionResult {
    /** Lacunes détectées */
    readonly gaps: readonly CompetencyGap[];
    /** Nombre total de lacunes */
    readonly totalGaps: number;
    /** Score global de l'évaluation */
    readonly overallScore: number;
    /** Recommandations générales */
    readonly generalRecommendations: readonly string[];
    /** Métadonnées de l'analyse */
    readonly analysisMetadata: {
        readonly analysisDate: Date;
        readonly analysisVersion: string;
        readonly processingTime: number;
        readonly confidence: number;
    };
}

/**
 * Lacune priorisée
 */
export interface PrioritizedGap extends CompetencyGap {
    /** Priorité calculée (1-10) */
    readonly priority: number;
    /** Ordre de traitement recommandé */
    readonly treatmentOrder: number;
    /** Estimation du temps nécessaire pour combler la lacune */
    readonly estimatedTimeToResolve: number;
    /** Dépendances avec d'autres lacunes */
    readonly dependencies: readonly string[];
}

/**
 * Résultat de priorisation des lacunes
 */
export interface GapPrioritizationResult {
    /** Lacunes priorisées */
    readonly prioritizedGaps: readonly PrioritizedGap[];
    /** Plan d'action recommandé */
    readonly actionPlan: {
        readonly phases: readonly {
            readonly phase: number;
            readonly gapIds: readonly string[];
            readonly estimatedDuration: number;
            readonly description: string;
        }[];
        readonly totalEstimatedTime: number;
    };
    /** Métadonnées de priorisation */
    readonly prioritizationMetadata: {
        readonly algorithm: string;
        readonly version: string;
        readonly processedAt: Date;
    };
}

/**
 * Configuration pour la détection de lacunes
 */
export interface GapDetectionConfig {
    /** Seuil minimum d'impact pour considérer une lacune */
    readonly minimumImpact?: number;
    /** Nombre maximum de lacunes à détecter par analyse */
    readonly maxGapsPerAnalysis?: number;
    /** Activer les métriques détaillées */
    readonly enableDetailedMetrics?: boolean;
    /** Configuration spécifique à la LSF */
    readonly lsfSpecificConfig?: {
        readonly includeCulturalAspects: boolean;
        readonly includeRegionalVariations: boolean;
        readonly focusOnPracticalSkills: boolean;
    };
}

// ================================
// INTERFACE PRINCIPALE
// ================================

/**
 * Interface pour la détection des lacunes de compétences
 * Responsable d'identifier les domaines où l'utilisateur a besoin d'amélioration
 */
export interface ICompetencyGapDetector {
    /**
     * Détecte les lacunes de compétences pour un utilisateur
     * @param userId - Identifiant unique de l'utilisateur
     * @param context - Contexte de détection avec données supplémentaires
     * @param config - Configuration optionnelle pour la détection
     * @returns Résultat de la détection avec lacunes identifiées
     * @throws {Error} Si la détection échoue
     */
    detectGaps(
        userId: string,
        context: SimpleDetectionContext,
        config?: GapDetectionConfig
    ): Promise<GapDetectionResult>;

    /**
     * Priorise les lacunes détectées selon leur importance et impact
     * @param gaps - Lacunes à prioriser
     * @param userId - Identifiant de l'utilisateur pour contextualiser
     * @returns Lacunes priorisées avec plan d'action
     * @throws {Error} Si la priorisation échoue
     */
    prioritizeGaps(
        gaps: readonly CompetencyGap[] | GapDetectionResult,
        userId?: string
    ): Promise<GapPrioritizationResult>;

    /**
     * Analyse l'évolution des lacunes dans le temps
     * @param userId - Identifiant de l'utilisateur
     * @param timeframe - Période d'analyse en jours
     * @returns Analyse de l'évolution des compétences
     * @throws {Error} Si l'analyse échoue
     */
    analyzeGapEvolution?(
        userId: string,
        timeframe: number
    ): Promise<{
        readonly resolvedGaps: readonly string[];
        readonly persistentGaps: readonly string[];
        readonly newGaps: readonly string[];
        readonly improvementTrend: number;
    }>;

    /**
     * Recommande des activités spécifiques pour combler les lacunes
     * @param gaps - Lacunes à traiter
     * @param userId - Identifiant de l'utilisateur
     * @returns Activités recommandées
     * @throws {Error} Si la recommandation échoue
     */
    recommendActivities?(
        gaps: readonly CompetencyGap[],
        userId: string
    ): Promise<readonly {
        readonly gapId: string;
        readonly activityIds: readonly string[];
        readonly rationale: string;
    }[]>;
}

// ================================
// UTILITAIRES ET CONSTANTS
// ================================

/**
 * Constantes pour la détection de lacunes
 */
export const GAP_DETECTION_CONSTANTS = {
    /** Seuils par défaut */
    DEFAULT_THRESHOLDS: {
        MINIMUM_IMPACT: 5,
        MINIMUM_CONFIDENCE: 0.6,
        SEVERITY_HIGH: 8,
        SEVERITY_MEDIUM: 5,
        SEVERITY_LOW: 2
    } as const,

    /** Configuration par défaut */
    DEFAULT_CONFIG: {
        minimumImpact: 5,
        maxGapsPerAnalysis: 10,
        enableDetailedMetrics: false,
        lsfSpecificConfig: {
            includeCulturalAspects: true,
            includeRegionalVariations: false,
            focusOnPracticalSkills: true
        }
    } as const,

    /** Types de compétences LSF */
    LSF_COMPETENCY_TYPES: [
        'fingerspelling',
        'vocabulary',
        'grammar',
        'spatial_expression',
        'facial_expression',
        'body_language',
        'conversation_skills',
        'cultural_awareness'
    ] as const
} as const;

/**
 * Utilitaires pour la validation et manipulation des lacunes
 */
export const GapDetectionUtils = {
    /**
     * Valide qu'une lacune est bien formée
     */
    isValidGap: (gap: unknown): gap is CompetencyGap => {
        return typeof gap === 'object' &&
            gap !== null &&
            'id' in gap &&
            'competency' in gap &&
            'severity' in gap;
    },

    /**
     * Trie les lacunes par priorité décroissante
     */
    sortByPriority: (gaps: readonly PrioritizedGap[]): readonly PrioritizedGap[] => {
        return [...gaps].sort((a, b) => b.priority - a.priority);
    },

    /**
     * Filtre les lacunes par seuil de sévérité
     */
    filterBySeverity: (
        gaps: readonly CompetencyGap[],
        minSeverity: number
    ): readonly CompetencyGap[] => {
        return gaps.filter(gap => gap.severity >= minSeverity);
    },

    /**
     * Calcule le score moyen des lacunes
     */
    calculateAverageScore: (gaps: readonly CompetencyGap[]): number => {
        if (gaps.length === 0) return 0;
        const totalScore = gaps.reduce((sum, gap) => sum + gap.severity, 0);
        return totalScore / gaps.length;
    }
} as const;