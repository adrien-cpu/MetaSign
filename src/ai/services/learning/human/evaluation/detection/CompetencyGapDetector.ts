/**
 * Détecteur de lacunes de compétences
 * 
 * @file src/ai/services/learning/human/evaluation/detection/CompetencyGapDetector.ts
 * @description Service spécialisé dans la détection des lacunes de compétences LSF
 * @version 1.0.0
 * @author MetaSign Learning Module
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { ICompetencyGapDetector } from '@/ai/services/learning/human/evaluation/interfaces/ICompetencyGapDetector';
import {
    CompetencyGap,
    CompetencyLevel,
    LearningContext,
    RecommendedActivity
} from '@/ai/services/learning/types/learning-interfaces';
import { MetricsCollector } from '@/ai/services/learning/registry/utils/MetricsCollector';

/**
 * @interface CompetencyGapDetectorConfig
 * @description Configuration pour le détecteur de lacunes de compétences
 */
export interface CompetencyGapDetectorConfig {
    /** Seuil minimal d'impact pour considérer une lacune */
    readonly minimumImpact?: number;
    /** Seuil minimal de priorité pour rapporter une lacune */
    readonly minimumPriority?: number;
    /** Active l'enregistrement détaillé des métriques */
    readonly enableDetailedMetrics?: boolean;
    /** Nombre maximum de lacunes détectées par analyse */
    readonly maxGapsPerAnalysis?: number;
}

/**
 * @interface CompetencyGapAnalysisResult
 * @description Résultat d'une analyse de lacunes de compétences
 */
export interface CompetencyGapAnalysisResult {
    /** Lacunes détectées */
    readonly gaps: ReadonlyArray<CompetencyGap>;
    /** Métadonnées de l'analyse */
    readonly metadata: {
        readonly userId: string;
        readonly analysisTimestamp: Date;
        readonly totalGapsDetected: number;
        readonly averageImpact: number;
        readonly averagePriority: number;
        readonly performanceMetrics: {
            readonly averageScore: number;
            readonly errorRate: number;
            readonly completionRate: number;
        };
    };
}

/**
 * @class CompetencyGapDetector
 * @description Service spécialisé dans la détection des lacunes de compétences LSF
 * Implémente l'interface ICompetencyGapDetector
 */
export class CompetencyGapDetector implements ICompetencyGapDetector {
    private readonly logger = LoggerFactory.getLogger('CompetencyGapDetector');
    private readonly metricsCollector: MetricsCollector;
    private readonly config: Required<CompetencyGapDetectorConfig>;

    /**
     * @constructor
     * @param {MetricsCollector} metricsCollector - Collecteur de métriques
     * @param {CompetencyGapDetectorConfig} [config] - Configuration
     */
    constructor(
        metricsCollector: MetricsCollector,
        config: CompetencyGapDetectorConfig = {}
    ) {
        this.metricsCollector = metricsCollector;

        this.config = Object.freeze({
            minimumImpact: config.minimumImpact ?? 5,
            minimumPriority: config.minimumPriority ?? 5,
            enableDetailedMetrics: config.enableDetailedMetrics ?? true,
            maxGapsPerAnalysis: config.maxGapsPerAnalysis ?? 10
        });

        this.validateConfig();
        this.logInitialization();
    }

    /**
     * @method detectGaps
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {LearningContext} context - Contexte d'apprentissage
     * @returns {Promise<CompetencyGap[]>} - Lacunes de compétences détectées
     * @description Détecte les lacunes dans les compétences de l'utilisateur
     * Implémente l'interface ICompetencyGapDetector
     */
    public async detectGaps(userId: string, context: LearningContext): Promise<CompetencyGap[]> {
        const result = await this.detectCompetencyGaps(userId, context);
        return [...result.gaps];
    }

    /**
     * @method detectCompetencyGaps
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {LearningContext} context - Contexte d'apprentissage
     * @returns {Promise<CompetencyGapAnalysisResult>} - Résultat complet de l'analyse
     * @description Détecte les lacunes dans les compétences d'un utilisateur avec métadonnées
     */
    public async detectCompetencyGaps(
        userId: string,
        context: LearningContext
    ): Promise<CompetencyGapAnalysisResult> {
        this.validateInputs(userId, context);

        this.logger.info(`Detecting competency gaps for user ${userId}`);

        if (this.config.enableDetailedMetrics) {
            this.metricsCollector.recordEvent('gap_detection.competency.started', { userId });
        }

        try {
            const performanceMetrics = this.extractPerformanceMetrics(context);
            const gaps = await this.analyzeCompetencyGaps(userId, context, performanceMetrics);
            const filteredGaps = this.filterGapsByThreshold(gaps);

            const result = this.buildAnalysisResult(userId, filteredGaps, performanceMetrics);

            if (this.config.enableDetailedMetrics) {
                this.metricsCollector.recordEvent('gap_detection.competency.completed', {
                    userId,
                    gapsCount: result.gaps.length,
                    averageImpact: result.metadata.averageImpact,
                    averagePriority: result.metadata.averagePriority
                });
            }

            this.logger.info(`Detected ${result.gaps.length} competency gaps for user ${userId}`);
            return result;

        } catch (error) {
            this.handleError('detectCompetencyGaps', error, { userId });
            throw error;
        }
    }

    /**
     * @method prioritizeGaps
     * @async
     * @param {CompetencyGap[]} gaps - Lacunes de compétences
     * @returns {Promise<CompetencyGap[]>} - Lacunes de compétences priorisées
     * @description Priorise les lacunes détectées en fonction de leur impact
     * Implémente l'interface ICompetencyGapDetector
     */
    public async prioritizeGaps(gaps: CompetencyGap[]): Promise<CompetencyGap[]> {
        if (!Array.isArray(gaps)) {
            throw new Error('gaps must be an array');
        }

        this.logger.debug(`Prioritizing ${gaps.length} competency gaps`);

        if (this.config.enableDetailedMetrics) {
            this.metricsCollector.recordEvent('gap_prioritization.started', {
                gapsCount: gaps.length
            });
        }

        try {
            const prioritizedGaps = this.sortGapsByPriority([...gaps]);

            if (this.config.enableDetailedMetrics) {
                this.metricsCollector.recordEvent('gap_prioritization.completed', {
                    gapsCount: gaps.length
                });
            }

            return prioritizedGaps;

        } catch (error) {
            this.handleError('prioritizeGaps', error, { gapsCount: gaps.length });
            throw error;
        }
    }

    /**
     * @method recommendActivities
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {CompetencyGap[]} gaps - Lacunes de compétences
     * @returns {Promise<RecommendedActivity[]>} - Activités recommandées
     * @description Recommande des activités pour combler les lacunes
     * Implémente l'interface ICompetencyGapDetector
     */
    public async recommendActivities(userId: string, gaps: CompetencyGap[]): Promise<RecommendedActivity[]> {
        this.logger.info(`Generating basic activity recommendations for user ${userId}`);

        // Cette méthode fournit des recommandations de base
        // Pour des recommandations avancées, utiliser ActivityRecommendationService
        return gaps.map(gap => ({
            id: `basic_activity_${gap.id}`,
            name: `Exercice pour améliorer ${gap.competencyName}`,
            type: 'practice' as const,
            targetGaps: [gap.id],
            difficulty: Math.max(1, Math.min(10, gap.gap)),
            estimatedDuration: 600, // 10 minutes par défaut
            expectedImpact: Math.max(5, gap.impact),
            prerequisites: []
        }));
    }

    /**
     * @method extractPerformanceMetrics
     * @private
     * @param {LearningContext} context - Contexte d'apprentissage
     * @returns {CompetencyGapAnalysisResult['metadata']['performanceMetrics']} - Métriques extraites
     * @description Extrait les métriques de performance du contexte
     */
    private extractPerformanceMetrics(
        context: LearningContext
    ): CompetencyGapAnalysisResult['metadata']['performanceMetrics'] {
        return {
            averageScore: context.averageScore ?? 0.5,
            errorRate: context.errorRate ?? 0.3,
            completionRate: context.completionRate ?? 0.6
        };
    }

    /**
     * @method analyzeCompetencyGaps
     * @private
     * @async
     * @param {string} userId - Identifiant utilisateur
     * @param {LearningContext} context - Contexte d'apprentissage
     * @param {CompetencyGapAnalysisResult['metadata']['performanceMetrics']} performanceMetrics - Métriques de performance
     * @returns {Promise<CompetencyGap[]>} - Lacunes détectées
     * @description Analyse les lacunes de compétences basées sur le contexte d'apprentissage
     */
    private async analyzeCompetencyGaps(
        userId: string,
        context: LearningContext,
        performanceMetrics: CompetencyGapAnalysisResult['metadata']['performanceMetrics']
    ): Promise<CompetencyGap[]> {
        const gaps: CompetencyGap[] = [];

        // Utiliser le contexte pour personnaliser la détection
        const hasGrammarFocus = context.contentTags?.includes('grammar') ||
            Boolean(context.situationalFactors?.focusAreas);

        // Compétence de configuration manuelle
        if (performanceMetrics.averageScore < 0.6) {
            gaps.push(this.createHandshapeGap(performanceMetrics));
        }

        // Compétence spatiale
        if (performanceMetrics.errorRate > 0.4) {
            gaps.push(this.createSpatialGap(performanceMetrics));
        }

        // Compétence d'expressions faciales
        if (performanceMetrics.completionRate < 0.7) {
            gaps.push(this.createFacialExpressionGap(performanceMetrics));
        }

        // Compétence de mouvement et orientation
        if (performanceMetrics.averageScore < 0.5 && performanceMetrics.errorRate > 0.5) {
            gaps.push(this.createMovementGap(performanceMetrics));
        }

        // Compétence grammaticale
        if (hasGrammarFocus && performanceMetrics.averageScore < 0.6) {
            gaps.push(this.createGrammarGap(performanceMetrics));
        }

        return gaps;
    }

    /**
     * @method createHandshapeGap
     * @private
     * @param {CompetencyGapAnalysisResult['metadata']['performanceMetrics']} metrics - Métriques de performance
     * @returns {CompetencyGap} - Lacune de configuration manuelle
     * @description Crée une lacune pour les configurations manuelles
     */
    private createHandshapeGap(
        metrics: CompetencyGapAnalysisResult['metadata']['performanceMetrics']
    ): CompetencyGap {
        const gapLevel = this.calculateGapLevel(metrics.averageScore);
        const impact = Math.round((1 - metrics.averageScore) * 10);
        const priority = Math.round(impact * 0.9);

        return {
            id: `gap_handshape_${Date.now()}`,
            competencyId: 'comp_handshape',
            competencyName: 'Configuration manuelle précise',
            currentLevel: this.scoreToCompetencyLevel(metrics.averageScore),
            targetLevel: CompetencyLevel.INTERMEDIATE,
            gap: gapLevel,
            priority,
            impact,
            detectedAt: new Date()
        };
    }

    /**
     * @method createSpatialGap
     * @private
     * @param {CompetencyGapAnalysisResult['metadata']['performanceMetrics']} metrics - Métriques de performance
     * @returns {CompetencyGap} - Lacune spatiale
     * @description Crée une lacune pour l'utilisation de l'espace de signation
     */
    private createSpatialGap(
        metrics: CompetencyGapAnalysisResult['metadata']['performanceMetrics']
    ): CompetencyGap {
        const gapLevel = Math.round(metrics.errorRate * 5) + 1;
        const impact = Math.round(metrics.errorRate * 10);
        const priority = Math.round(impact * 1.1);

        return {
            id: `gap_spatial_${Date.now()}`,
            competencyId: 'comp_spatial',
            competencyName: 'Utilisation de l\'espace de signation',
            currentLevel: CompetencyLevel.NOVICE,
            targetLevel: CompetencyLevel.INTERMEDIATE,
            gap: gapLevel,
            priority: Math.min(10, priority),
            impact,
            detectedAt: new Date()
        };
    }

    /**
     * @method createFacialExpressionGap
     * @private
     * @param {CompetencyGapAnalysisResult['metadata']['performanceMetrics']} metrics - Métriques de performance
     * @returns {CompetencyGap} - Lacune d'expressions faciales
     * @description Crée une lacune pour les expressions faciales grammaticales
     */
    private createFacialExpressionGap(
        metrics: CompetencyGapAnalysisResult['metadata']['performanceMetrics']
    ): CompetencyGap {
        const gapLevel = Math.round((1 - metrics.completionRate) * 4) + 1;
        const impact = Math.round((1 - metrics.completionRate) * 8);
        const priority = Math.round(impact * 0.8);

        return {
            id: `gap_facial_${Date.now()}`,
            competencyId: 'comp_facial',
            competencyName: 'Expressions faciales grammaticales',
            currentLevel: CompetencyLevel.BEGINNER,
            targetLevel: CompetencyLevel.INTERMEDIATE,
            gap: gapLevel,
            priority,
            impact,
            detectedAt: new Date()
        };
    }

    /**
     * @method createMovementGap
     * @private
     * @param {CompetencyGapAnalysisResult['metadata']['performanceMetrics']} metrics - Métriques de performance
     * @returns {CompetencyGap} - Lacune de mouvement
     * @description Crée une lacune pour les mouvements et orientations
     */
    private createMovementGap(
        metrics: CompetencyGapAnalysisResult['metadata']['performanceMetrics']
    ): CompetencyGap {
        const combinedScore = (metrics.averageScore + (1 - metrics.errorRate)) / 2;
        const gapLevel = this.calculateGapLevel(combinedScore);
        const impact = Math.round((1 - combinedScore) * 9);
        const priority = Math.round(impact * 0.85);

        return {
            id: `gap_movement_${Date.now()}`,
            competencyId: 'comp_movement',
            competencyName: 'Précision des mouvements et orientations',
            currentLevel: this.scoreToCompetencyLevel(combinedScore),
            targetLevel: CompetencyLevel.ADVANCED,
            gap: gapLevel,
            priority,
            impact,
            detectedAt: new Date()
        };
    }

    /**
     * @method createGrammarGap
     * @private
     * @param {CompetencyGapAnalysisResult['metadata']['performanceMetrics']} metrics - Métriques de performance
     * @returns {CompetencyGap} - Lacune grammaticale
     * @description Crée une lacune pour les structures grammaticales
     */
    private createGrammarGap(
        metrics: CompetencyGapAnalysisResult['metadata']['performanceMetrics']
    ): CompetencyGap {
        const gapLevel = this.calculateGapLevel(metrics.averageScore);
        const impact = Math.round((1 - metrics.averageScore) * 10);
        const priority = Math.round(impact * 1.2);

        return {
            id: `gap_grammar_${Date.now()}`,
            competencyId: 'comp_grammar',
            competencyName: 'Structures grammaticales LSF',
            currentLevel: this.scoreToCompetencyLevel(metrics.averageScore),
            targetLevel: CompetencyLevel.ADVANCED,
            gap: gapLevel,
            priority: Math.min(10, priority),
            impact,
            detectedAt: new Date()
        };
    }

    /**
     * @method calculateGapLevel
     * @private
     * @param {number} score - Score de performance (0-1)
     * @returns {number} - Niveau de lacune (1-5)
     * @description Calcule le niveau de lacune basé sur le score
     */
    private calculateGapLevel(score: number): number {
        if (score >= 0.8) return 1;
        if (score >= 0.6) return 2;
        if (score >= 0.4) return 3;
        if (score >= 0.2) return 4;
        return 5;
    }

    /**
     * @method scoreToCompetencyLevel
     * @private
     * @param {number} score - Score de performance (0-1)
     * @returns {CompetencyLevel} - Niveau de compétence correspondant
     * @description Convertit un score en niveau de compétence
     */
    private scoreToCompetencyLevel(score: number): CompetencyLevel {
        if (score >= 0.8) return CompetencyLevel.ADVANCED;
        if (score >= 0.6) return CompetencyLevel.INTERMEDIATE;
        if (score >= 0.4) return CompetencyLevel.BEGINNER;
        return CompetencyLevel.NOVICE;
    }

    /**
     * @method filterGapsByThreshold
     * @private
     * @param {CompetencyGap[]} gaps - Lacunes à filtrer
     * @returns {ReadonlyArray<CompetencyGap>} - Lacunes filtrées
     * @description Filtre les lacunes selon les seuils de configuration
     */
    private filterGapsByThreshold(gaps: CompetencyGap[]): ReadonlyArray<CompetencyGap> {
        return gaps
            .filter(gap =>
                gap.impact >= this.config.minimumImpact &&
                gap.priority >= this.config.minimumPriority
            )
            .slice(0, this.config.maxGapsPerAnalysis);
    }

    /**
     * @method sortGapsByPriority
     * @private
     * @param {CompetencyGap[]} gaps - Lacunes à trier
     * @returns {CompetencyGap[]} - Lacunes triées
     * @description Trie les lacunes par impact puis par priorité
     */
    private sortGapsByPriority(gaps: CompetencyGap[]): CompetencyGap[] {
        return gaps.sort((a, b) => {
            if (a.impact !== b.impact) {
                return b.impact - a.impact;
            }
            return b.priority - a.priority;
        });
    }

    /**
     * @method buildAnalysisResult
     * @private
     * @param {string} userId - Identifiant utilisateur
     * @param {ReadonlyArray<CompetencyGap>} gaps - Lacunes détectées
     * @param {CompetencyGapAnalysisResult['metadata']['performanceMetrics']} performanceMetrics - Métriques de performance
     * @returns {CompetencyGapAnalysisResult} - Résultat de l'analyse
     * @description Construit le résultat final de l'analyse
     */
    private buildAnalysisResult(
        userId: string,
        gaps: ReadonlyArray<CompetencyGap>,
        performanceMetrics: CompetencyGapAnalysisResult['metadata']['performanceMetrics']
    ): CompetencyGapAnalysisResult {
        const averageImpact = gaps.length > 0
            ? Math.round(gaps.reduce((sum, gap) => sum + gap.impact, 0) / gaps.length * 100) / 100
            : 0;

        const averagePriority = gaps.length > 0
            ? Math.round(gaps.reduce((sum, gap) => sum + gap.priority, 0) / gaps.length * 100) / 100
            : 0;

        return {
            gaps,
            metadata: {
                userId,
                analysisTimestamp: new Date(),
                totalGapsDetected: gaps.length,
                averageImpact,
                averagePriority,
                performanceMetrics
            }
        };
    }

    /**
     * @method validateConfig
     * @private
     * @throws {Error} Si la configuration est invalide
     * @description Valide la configuration du service
     */
    private validateConfig(): void {
        const { minimumImpact, minimumPriority, maxGapsPerAnalysis } = this.config;

        if (minimumImpact < 0 || minimumImpact > 10) {
            throw new Error('minimumImpact must be between 0 and 10');
        }

        if (minimumPriority < 0 || minimumPriority > 10) {
            throw new Error('minimumPriority must be between 0 and 10');
        }

        if (maxGapsPerAnalysis < 1) {
            throw new Error('maxGapsPerAnalysis must be at least 1');
        }
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
        this.logger.info('CompetencyGapDetector initialized', {
            config: this.config,
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
            this.metricsCollector.recordEvent(`gap_detection.competency.error`, {
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
            name: 'CompetencyGapDetector',
            version: '1.0.0',
            features: [
                'competency_gap_detection',
                'lsf_skill_analysis',
                'performance_evaluation',
                'gap_prioritization',
                'spatial_competency_analysis',
                'handshape_competency_analysis',
                'facial_expression_analysis',
                'movement_precision_analysis',
                'grammar_structure_analysis'
            ]
        };
    }
}