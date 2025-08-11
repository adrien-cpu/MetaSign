/**
 * Service unifié de détection de lacunes
 * 
 * @file src/ai/services/learning/human/evaluation/detection/UnifiedGapDetectorService.ts
 * @description Service unifié qui combine la détection de lacunes de connaissances et de compétences
 * @version 1.0.0
 * @author MetaSign Learning Module
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { ICompetencyGapDetector } from '@/ai/services/learning/human/evaluation/interfaces/ICompetencyGapDetector';
import {
    CompetencyGap,
    ConceptEvaluation,
    LearningContext,
    LearningGap,
    RecommendedActivity
} from '@/ai/services/learning/types/learning-interfaces';
import { MetricsCollector } from '@/ai/services/learning/registry/utils/MetricsCollector';
import { ConceptRelationshipGraph } from '@/ai/services/learning/human/evaluation/graphs/ConceptRelationshipGraph';
import { KnowledgeGapDetector, KnowledgeGapDetectorConfig } from './KnowledgeGapDetector';

/**
 * @interface CompetencyGapDetectorConfig
 * @description Configuration pour le détecteur de lacunes de compétences
 */
export interface CompetencyGapDetectorConfig {
    /** Seuil minimum pour détecter une lacune de compétence (0-1) */
    readonly competencyThreshold?: number;
    /** Nombre maximum de lacunes à détecter par analyse */
    readonly maxGapsPerAnalysis?: number;
    /** Active l'analyse des dépendances entre compétences */
    readonly enableDependencyAnalysis?: boolean;
    /** Poids accordé aux compétences fondamentales */
    readonly fundamentalSkillWeight?: number;
}

/**
 * @interface ActivityRecommendationConfig
 * @description Configuration pour le service de recommandation d'activités
 */
export interface ActivityRecommendationConfig {
    /** Nombre maximum d'activités à recommander */
    readonly maxRecommendations?: number;
    /** Priorise les activités courtes (< 30 min) */
    readonly prioritizeShortActivities?: boolean;
    /** Active la personnalisation basée sur le style d'apprentissage */
    readonly enableLearningStyleAdaptation?: boolean;
    /** Seuil de difficulté maximum pour les recommandations */
    readonly maxDifficultyLevel?: number;
}

/**
 * @interface UnifiedGapDetectorConfig
 * @description Configuration pour le service unifié de détection de lacunes
 */
export interface UnifiedGapDetectorConfig {
    /** Configuration pour la détection de lacunes de connaissances */
    readonly knowledgeGapConfig?: KnowledgeGapDetectorConfig;
    /** Configuration pour la détection de lacunes de compétences */
    readonly competencyGapConfig?: CompetencyGapDetectorConfig;
    /** Configuration pour la recommandation d'activités */
    readonly activityRecommendationConfig?: ActivityRecommendationConfig;
    /** Active l'enregistrement détaillé des métriques */
    readonly enableDetailedMetrics?: boolean;
    /** Active la détection automatique de lacunes lors de l'analyse */
    readonly autoDetectGaps?: boolean;
}

/**
 * @interface UnifiedGapAnalysisResult
 * @description Résultat complet d'une analyse de lacunes
 */
export interface UnifiedGapAnalysisResult {
    /** Lacunes de connaissances détectées */
    readonly knowledgeGaps: ReadonlyArray<LearningGap>;
    /** Lacunes de compétences détectées */
    readonly competencyGaps: ReadonlyArray<CompetencyGap>;
    /** Activités recommandées pour combler les lacunes */
    readonly recommendedActivities: ReadonlyArray<RecommendedActivity>;
    /** Métadonnées de l'analyse complète */
    readonly metadata: {
        readonly userId: string;
        readonly analysisTimestamp: Date;
        readonly totalKnowledgeGaps: number;
        readonly totalCompetencyGaps: number;
        readonly totalRecommendations: number;
        readonly analysisCompletionTime: number; // en millisecondes
        readonly priorityDistribution: {
            readonly high: number; // Lacunes priorité 8-10
            readonly medium: number; // Lacunes priorité 5-7
            readonly low: number; // Lacunes priorité 1-4
        };
    };
}

/**
 * @interface CompetencyGapDetectionResult
 * @description Résultat de la détection de lacunes de compétences
 */
interface CompetencyGapDetectionResult {
    readonly gaps: ReadonlyArray<CompetencyGap>;
    readonly metadata: {
        readonly analyzedCompetencies: number;
        readonly detectedGaps: number;
        readonly averageGapSeverity: number;
        readonly analysisTimestamp: Date;
    };
}

/**
 * @interface ActivityRecommendationResult
 * @description Résultat de la recommandation d'activités
 */
interface ActivityRecommendationResult {
    readonly recommendations: ReadonlyArray<RecommendedActivity>;
    readonly metadata: {
        readonly userId: string;
        readonly processedGaps: number;
        readonly totalRecommendations: number;
        readonly estimatedTotalDuration: number;
        readonly averageDifficulty: number;
        readonly recommendationTimestamp: Date;
    };
}

/**
 * @class CompetencyGapDetector
 * @description Service temporaire pour la détection de lacunes de compétences
 * En attendant l'implémentation complète du service dédié
 */
class CompetencyGapDetector {
    private readonly logger = LoggerFactory.getLogger('CompetencyGapDetector');

    constructor(
        private readonly metricsCollector: MetricsCollector,
        private readonly config: CompetencyGapDetectorConfig
    ) { }

    async detectGaps(userId: string, context: LearningContext): Promise<CompetencyGap[]> {
        this.logger.info(`Detecting competency gaps for user ${userId}`, {
            contextType: context.type,
            domain: context.domain
        });

        // Implémentation temporaire - retourne un tableau vide
        // TODO: Implémenter la logique de détection réelle basée sur le contexte
        // Le contexte sera utilisé pour analyser les compétences spécifiques au domaine
        return [];
    }

    async prioritizeGaps(gaps: CompetencyGap[]): Promise<CompetencyGap[]> {
        // Tri par priorité décroissante
        return [...gaps].sort((a, b) => b.priority - a.priority);
    }

    async detectCompetencyGaps(userId: string, context: LearningContext): Promise<CompetencyGapDetectionResult> {
        const gaps = await this.detectGaps(userId, context);

        return {
            gaps,
            metadata: {
                analyzedCompetencies: 0,
                detectedGaps: gaps.length,
                averageGapSeverity: 0,
                analysisTimestamp: new Date()
            }
        };
    }

    getServiceInfo(): { name: string; version: string; features: string[] } {
        return {
            name: 'CompetencyGapDetector',
            version: '1.0.0',
            features: ['competency_gap_detection', 'gap_prioritization']
        };
    }
}

/**
 * @class ActivityRecommendationService
 * @description Service temporaire pour la recommandation d'activités
 * En attendant l'implémentation complète du service dédié
 */
class ActivityRecommendationService {
    private readonly logger = LoggerFactory.getLogger('ActivityRecommendationService');

    constructor(
        private readonly metricsCollector: MetricsCollector,
        private readonly config: ActivityRecommendationConfig
    ) { }

    async recommendActivities(userId: string, gaps: CompetencyGap[]): Promise<ActivityRecommendationResult> {
        this.logger.info(`Recommending activities for user ${userId} based on ${gaps.length} gaps`);

        // Implémentation temporaire - retourne un tableau vide
        // TODO: Implémenter la logique de recommandation réelle
        const recommendations: RecommendedActivity[] = [];

        return {
            recommendations,
            metadata: {
                userId,
                processedGaps: gaps.length,
                totalRecommendations: recommendations.length,
                estimatedTotalDuration: 0,
                averageDifficulty: 0,
                recommendationTimestamp: new Date()
            }
        };
    }

    getServiceInfo(): { name: string; version: string; features: string[] } {
        return {
            name: 'ActivityRecommendationService',
            version: '1.0.0',
            features: ['activity_recommendation', 'personalized_learning_paths']
        };
    }
}

/**
 * @class UnifiedGapDetectorService
 * @description Service unifié qui orchestre la détection de lacunes de connaissances et compétences
 * Maintient la compatibilité avec l'interface ICompetencyGapDetector tout en ajoutant la détection de connaissances
 */
export class UnifiedGapDetectorService implements ICompetencyGapDetector {
    private readonly logger = LoggerFactory.getLogger('UnifiedGapDetectorService');
    private readonly metricsCollector: MetricsCollector;
    private readonly config: Required<UnifiedGapDetectorConfig>;

    // Services spécialisés
    private readonly knowledgeGapDetector: KnowledgeGapDetector;
    private readonly competencyGapDetector: CompetencyGapDetector;
    private readonly activityRecommendationService: ActivityRecommendationService;

    /**
     * @constructor
     * @param {ConceptRelationshipGraph} conceptGraph - Graphe de relations entre concepts
     * @param {MetricsCollector} metricsCollector - Collecteur de métriques
     * @param {UnifiedGapDetectorConfig} [config] - Configuration
     */
    constructor(
        conceptGraph: ConceptRelationshipGraph,
        metricsCollector: MetricsCollector,
        config: UnifiedGapDetectorConfig = {}
    ) {
        this.metricsCollector = metricsCollector;

        this.config = Object.freeze({
            knowledgeGapConfig: config.knowledgeGapConfig ?? {},
            competencyGapConfig: config.competencyGapConfig ?? {},
            activityRecommendationConfig: config.activityRecommendationConfig ?? {},
            enableDetailedMetrics: config.enableDetailedMetrics ?? true,
            autoDetectGaps: config.autoDetectGaps ?? true
        });

        // Initialisation des services spécialisés
        this.knowledgeGapDetector = new KnowledgeGapDetector(
            conceptGraph,
            metricsCollector,
            this.config.knowledgeGapConfig
        );

        this.competencyGapDetector = new CompetencyGapDetector(
            metricsCollector,
            this.config.competencyGapConfig
        );

        this.activityRecommendationService = new ActivityRecommendationService(
            metricsCollector,
            this.config.activityRecommendationConfig
        );

        this.logInitialization();
    }

    /**
     * @method detectGaps
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {LearningContext} context - Contexte d'apprentissage
     * @returns {Promise<CompetencyGap[]>} - Lacunes de compétences détectées
     * @description Détecte les lacunes dans les compétences de l'utilisateur
     * Implémente l'interface ICompetencyGapDetector pour la compatibilité ascendante
     */
    public async detectGaps(userId: string, context: LearningContext): Promise<CompetencyGap[]> {
        const result = await this.competencyGapDetector.detectGaps(userId, context);
        return [...result];
    }

    /**
     * @method prioritizeGaps
     * @async
     * @param {CompetencyGap[]} gaps - Lacunes de compétences
     * @returns {Promise<CompetencyGap[]>} - Lacunes de compétences priorisées
     * @description Priorise les lacunes détectées en fonction de leur impact
     * Implémente l'interface ICompetencyGapDetector pour la compatibilité ascendante
     */
    public async prioritizeGaps(gaps: CompetencyGap[]): Promise<CompetencyGap[]> {
        return this.competencyGapDetector.prioritizeGaps(gaps);
    }

    /**
     * @method analyzeAllGaps
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {LearningContext} context - Contexte d'apprentissage
     * @param {ReadonlyArray<ConceptEvaluation>} [conceptEvaluations] - Évaluations de concepts (optionnel)
     * @returns {Promise<UnifiedGapAnalysisResult>} - Analyse complète des lacunes
     * @description Effectue une analyse complète des lacunes de connaissances et compétences
     */
    public async analyzeAllGaps(
        userId: string,
        context: LearningContext,
        conceptEvaluations?: ReadonlyArray<ConceptEvaluation>
    ): Promise<UnifiedGapAnalysisResult> {
        this.validateInputs(userId, context);

        const startTime = Date.now();

        this.logger.info(`Starting unified gap analysis for user ${userId}`);

        if (this.config.enableDetailedMetrics) {
            this.metricsCollector.recordEvent('unified_gap_analysis.started', {
                userId,
                hasConceptEvaluations: !!conceptEvaluations
            });
        }

        try {
            // Détection parallèle des lacunes
            const [knowledgeGapsResult, competencyGapsResult] = await Promise.all([
                conceptEvaluations
                    ? this.knowledgeGapDetector.detectKnowledgeGaps(userId, conceptEvaluations)
                    : Promise.resolve({ gaps: [], metadata: this.createEmptyKnowledgeMetadata() }),
                this.competencyGapDetector.detectCompetencyGaps(userId, context)
            ]);

            // Combinaison des lacunes pour la recommandation d'activités
            const allGaps = [...competencyGapsResult.gaps];

            // Recommandation d'activités si des lacunes sont détectées
            const activityResult = allGaps.length > 0
                ? await this.activityRecommendationService.recommendActivities(userId, allGaps)
                : { recommendations: [], metadata: this.createEmptyActivityMetadata(userId) };

            const completionTime = Date.now() - startTime;

            const result = this.buildUnifiedResult(
                userId,
                knowledgeGapsResult.gaps,
                competencyGapsResult.gaps,
                activityResult.recommendations,
                completionTime
            );

            if (this.config.enableDetailedMetrics) {
                this.metricsCollector.recordEvent('unified_gap_analysis.completed', {
                    userId,
                    totalKnowledgeGaps: result.metadata.totalKnowledgeGaps,
                    totalCompetencyGaps: result.metadata.totalCompetencyGaps,
                    totalRecommendations: result.metadata.totalRecommendations,
                    completionTime
                });
            }

            this.logger.info(`Unified gap analysis completed for user ${userId}`, {
                knowledgeGaps: result.metadata.totalKnowledgeGaps,
                competencyGaps: result.metadata.totalCompetencyGaps,
                recommendations: result.metadata.totalRecommendations,
                completionTime
            });

            return result;

        } catch (error) {
            this.handleError('analyzeAllGaps', error, { userId });
            throw error;
        }
    }

    /**
     * @method detectKnowledgeGaps
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {ReadonlyArray<ConceptEvaluation>} conceptEvaluations - Évaluations de concepts
     * @returns {Promise<ReadonlyArray<LearningGap>>} - Lacunes de connaissances détectées
     * @description Détecte uniquement les lacunes de connaissances
     */
    public async detectKnowledgeGaps(
        userId: string,
        conceptEvaluations: ReadonlyArray<ConceptEvaluation>
    ): Promise<ReadonlyArray<LearningGap>> {
        const result = await this.knowledgeGapDetector.detectKnowledgeGaps(userId, conceptEvaluations);
        return result.gaps;
    }

    /**
     * @method detectCompetencyGaps
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {LearningContext} context - Contexte d'apprentissage
     * @returns {Promise<ReadonlyArray<CompetencyGap>>} - Lacunes de compétences détectées
     * @description Détecte uniquement les lacunes de compétences
     */
    public async detectCompetencyGaps(
        userId: string,
        context: LearningContext
    ): Promise<ReadonlyArray<CompetencyGap>> {
        const result = await this.competencyGapDetector.detectCompetencyGaps(userId, context);
        return result.gaps;
    }

    /**
     * @method recommendActivities
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {CompetencyGap[]} gaps - Lacunes de compétences
     * @returns {Promise<RecommendedActivity[]>} - Activités recommandées
     * @description Recommande des activités pour combler les lacunes
     * Implémente l'interface ICompetencyGapDetector pour la compatibilité ascendante
     */
    public async recommendActivities(
        userId: string,
        gaps: CompetencyGap[]
    ): Promise<RecommendedActivity[]> {
        const result = await this.activityRecommendationService.recommendActivities(userId, gaps);
        return [...result.recommendations];
    }

    /**
     * @method buildUnifiedResult
     * @private
     * @param {string} userId - Identifiant utilisateur
     * @param {ReadonlyArray<LearningGap>} knowledgeGaps - Lacunes de connaissances
     * @param {ReadonlyArray<CompetencyGap>} competencyGaps - Lacunes de compétences
     * @param {ReadonlyArray<RecommendedActivity>} activities - Activités recommandées
     * @param {number} completionTime - Temps d'exécution
     * @returns {UnifiedGapAnalysisResult} - Résultat unifié
     * @description Construit le résultat unifié de l'analyse
     */
    private buildUnifiedResult(
        userId: string,
        knowledgeGaps: ReadonlyArray<LearningGap>,
        competencyGaps: ReadonlyArray<CompetencyGap>,
        activities: ReadonlyArray<RecommendedActivity>,
        completionTime: number
    ): UnifiedGapAnalysisResult {
        // Calcul de la distribution des priorités
        const allPriorities = [
            ...knowledgeGaps.map(gap => gap.priority),
            ...competencyGaps.map(gap => gap.priority)
        ];

        const priorityDistribution = {
            high: allPriorities.filter(p => p >= 8).length,
            medium: allPriorities.filter(p => p >= 5 && p < 8).length,
            low: allPriorities.filter(p => p < 5).length
        };

        return {
            knowledgeGaps,
            competencyGaps,
            recommendedActivities: activities,
            metadata: {
                userId,
                analysisTimestamp: new Date(),
                totalKnowledgeGaps: knowledgeGaps.length,
                totalCompetencyGaps: competencyGaps.length,
                totalRecommendations: activities.length,
                analysisCompletionTime: completionTime,
                priorityDistribution
            }
        };
    }

    /**
     * @method createEmptyKnowledgeMetadata
     * @private
     * @returns {object} - Métadonnées vides pour l'analyse de connaissances
     * @description Crée des métadonnées vides quand aucune évaluation de concept n'est fournie
     */
    private createEmptyKnowledgeMetadata(): {
        analyzedConcepts: number;
        lowScoringConcepts: number;
        analysisTimestamp: Date;
        averageGapPriority: number;
    } {
        return {
            analyzedConcepts: 0,
            lowScoringConcepts: 0,
            analysisTimestamp: new Date(),
            averageGapPriority: 0
        };
    }

    /**
     * @method createEmptyActivityMetadata
     * @private
     * @param {string} userId - Identifiant utilisateur
     * @returns {object} - Métadonnées vides pour les activités
     * @description Crée des métadonnées vides quand aucune activité n'est recommandée
     */
    private createEmptyActivityMetadata(userId: string): {
        userId: string;
        processedGaps: number;
        totalRecommendations: number;
        estimatedTotalDuration: number;
        averageDifficulty: number;
        recommendationTimestamp: Date;
    } {
        return {
            userId,
            processedGaps: 0,
            totalRecommendations: 0,
            estimatedTotalDuration: 0,
            averageDifficulty: 0,
            recommendationTimestamp: new Date()
        };
    }

    /**
     * @method validateInputs
     * @private
     * @param {string} userId - Identifiant utilisateur
     * @param {LearningContext} context - Contexte d'apprentissage
     * @throws {Error} Si les entrées sont invalides
     * @description Valide les paramètres d'entrée
     */
    private validateInputs(userId: string, context: LearningContext): void {
        if (!userId?.trim()) {
            throw new Error('userId is required and cannot be empty');
        }

        if (!context || typeof context !== 'object') {
            throw new Error('context is required and must be an object');
        }
    }

    /**
     * @method logInitialization
     * @private
     * @description Log l'initialisation du service
     */
    private logInitialization(): void {
        this.logger.info('UnifiedGapDetectorService initialized', {
            config: {
                enableDetailedMetrics: this.config.enableDetailedMetrics,
                autoDetectGaps: this.config.autoDetectGaps
            },
            services: {
                knowledgeGapDetector: this.knowledgeGapDetector.getServiceInfo(),
                competencyGapDetector: this.competencyGapDetector.getServiceInfo(),
                activityRecommendationService: this.activityRecommendationService.getServiceInfo()
            },
            serviceVersion: '1.0.0'
        });
    }

    /**
     * @method handleError
     * @private
     * @param {string} operation - Nom de l'opération
     * @param {unknown} error - Erreur capturée
     * @param {Record<string, unknown>} context - Contexte additionnel
     * @description Gère les erreurs de manière uniforme
     */
    private handleError(
        operation: string,
        error: unknown,
        context: Record<string, unknown>
    ): void {
        this.logger.error(`Error in ${operation}`, { error, context });

        if (this.config.enableDetailedMetrics) {
            this.metricsCollector.recordEvent('unified_gap_analysis.error', {
                operation,
                ...context
            });
        }
    }

    /**
     * @method getServiceInfo
     * @returns {{name: string, version: string, features: string[]}} Informations sur le service
     * @description Renvoie les informations sur le service pour le registre de services
     */
    public getServiceInfo(): { name: string; version: string; features: string[] } {
        return {
            name: 'UnifiedGapDetectorService',
            version: '1.0.0',
            features: [
                'unified_gap_analysis',
                'knowledge_gap_detection',
                'competency_gap_detection',
                'activity_recommendation',
                'gap_prioritization',
                'learning_path_optimization',
                'comprehensive_analysis',
                'performance_metrics'
            ]
        };
    }

    /**
     * @method getDetectorServices
     * @returns {object} - Services détecteurs spécialisés
     * @description Retourne l'accès aux services spécialisés pour usage avancé
     */
    public getDetectorServices(): {
        readonly knowledgeGapDetector: KnowledgeGapDetector;
        readonly competencyGapDetector: CompetencyGapDetector;
        readonly activityRecommendationService: ActivityRecommendationService;
    } {
        return {
            knowledgeGapDetector: this.knowledgeGapDetector,
            competencyGapDetector: this.competencyGapDetector,
            activityRecommendationService: this.activityRecommendationService
        };
    }

    /**
     * @method getAnalysisStatistics
     * @param {UnifiedGapAnalysisResult} result - Résultat d'analyse
     * @returns {object} - Statistiques détaillées
     * @description Génère des statistiques détaillées sur une analyse
     */
    public getAnalysisStatistics(result: UnifiedGapAnalysisResult): {
        readonly gapRatio: number;
        readonly averagePriority: number;
        readonly recommendationEfficiency: number;
        readonly analysisPerformance: string;
    } {
        const totalGaps = result.metadata.totalKnowledgeGaps + result.metadata.totalCompetencyGaps;
        const totalPriorities = [
            ...result.knowledgeGaps.map(gap => gap.priority),
            ...result.competencyGaps.map(gap => gap.priority)
        ];

        const averagePriority = totalPriorities.length > 0
            ? totalPriorities.reduce((sum, priority) => sum + priority, 0) / totalPriorities.length
            : 0;

        const recommendationEfficiency = totalGaps > 0
            ? result.metadata.totalRecommendations / totalGaps
            : 0;

        const analysisPerformance = result.metadata.analysisCompletionTime < 1000
            ? 'excellent'
            : result.metadata.analysisCompletionTime < 3000
                ? 'good'
                : 'needs_optimization';

        return {
            gapRatio: Math.round((totalGaps / Math.max(1, totalGaps + 10)) * 100) / 100,
            averagePriority: Math.round(averagePriority * 100) / 100,
            recommendationEfficiency: Math.round(recommendationEfficiency * 100) / 100,
            analysisPerformance
        };
    }
}