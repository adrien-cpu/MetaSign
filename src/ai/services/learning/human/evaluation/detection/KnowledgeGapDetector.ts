/**
 * Détecteur de lacunes de connaissances
 * 
 * @file src/ai/services/learning/human/evaluation/detection/KnowledgeGapDetector.ts
 * @description Service spécialisé dans la détection des lacunes de connaissances
 * @version 1.1.0
 * @author MetaSign Learning Module
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { ConceptRelationshipGraph } from '@/ai/services/learning/human/evaluation/graphs/ConceptRelationshipGraph';
import {
    ConceptEvaluation,
    LearningGap
} from '@/ai/services/learning/types/learning-interfaces';
import { ConceptRepository, LearningResource } from '@/ai/services/learning/human/coda/codavirtuel/evaluators/repositories/ConceptRepository';
import { MetricsCollector } from '@/ai/services/learning/registry/utils/MetricsCollector';

/**
 * @interface KnowledgeGapDetectorConfig
 * @description Configuration pour le détecteur de lacunes de connaissances
 */
export interface KnowledgeGapDetectorConfig {
    /** Seuil de maîtrise pour considérer un concept comme acquis (entre 0 et 100) */
    readonly masteryThreshold?: number;
    /** Priorité minimale pour les lacunes rapportées */
    readonly minimumGapPriority?: number;
    /** Active l'enregistrement détaillé des métriques */
    readonly enableDetailedMetrics?: boolean;
    /** Seuil de confiance minimum pour analyser un concept */
    readonly minimumConfidence?: number;
    /** Nombre maximum de ressources recommandées par lacune */
    readonly maxRecommendedResources?: number;
}

/**
 * @interface KnowledgeGapAnalysisResult
 * @description Résultat d'une analyse de lacunes de connaissances
 */
export interface KnowledgeGapAnalysisResult {
    /** Lacunes détectées */
    readonly gaps: ReadonlyArray<LearningGap>;
    /** Métadonnées de l'analyse */
    readonly metadata: {
        readonly analyzedConcepts: number;
        readonly lowScoringConcepts: number;
        readonly analysisTimestamp: Date;
        readonly averageGapPriority: number;
    };
}

/**
 * @class KnowledgeGapDetector
 * @description Service spécialisé dans la détection des lacunes de connaissances
 * Se concentre uniquement sur l'analyse des connaissances conceptuelles
 */
export class KnowledgeGapDetector {
    private readonly logger = LoggerFactory.getLogger('KnowledgeGapDetector');
    private readonly conceptGraph: ConceptRelationshipGraph;
    private readonly conceptRepository: ConceptRepository;
    private readonly metricsCollector: MetricsCollector;

    // Configuration immutable
    private readonly config: Required<KnowledgeGapDetectorConfig>;

    /**
     * @constructor
     * @param {ConceptRelationshipGraph} conceptGraph - Graphe de relations entre concepts
     * @param {MetricsCollector} metricsCollector - Collecteur de métriques
     * @param {KnowledgeGapDetectorConfig} [config] - Configuration
     */
    constructor(
        conceptGraph: ConceptRelationshipGraph,
        metricsCollector: MetricsCollector,
        config: KnowledgeGapDetectorConfig = {}
    ) {
        this.conceptGraph = conceptGraph;
        this.metricsCollector = metricsCollector;
        this.conceptRepository = new ConceptRepository();

        // Configuration par défaut immutable
        this.config = Object.freeze({
            masteryThreshold: config.masteryThreshold ?? 70,
            minimumGapPriority: config.minimumGapPriority ?? 3,
            enableDetailedMetrics: config.enableDetailedMetrics ?? true,
            minimumConfidence: config.minimumConfidence ?? 0.4,
            maxRecommendedResources: config.maxRecommendedResources ?? 3
        });

        this.validateConfig();
        this.logInitialization();
    }

    /**
     * @method detectKnowledgeGaps
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {ReadonlyArray<ConceptEvaluation>} conceptEvaluations - Évaluations de concepts
     * @returns {Promise<KnowledgeGapAnalysisResult>} - Résultat de l'analyse des lacunes
     * @description Détecte les lacunes dans les connaissances d'un utilisateur
     */
    public async detectKnowledgeGaps(
        userId: string,
        conceptEvaluations: ReadonlyArray<ConceptEvaluation>
    ): Promise<KnowledgeGapAnalysisResult> {
        this.validateInputs(userId, conceptEvaluations);

        this.logger.debug(`Detecting knowledge gaps for user ${userId}`, {
            conceptCount: conceptEvaluations.length
        });

        if (this.config.enableDetailedMetrics) {
            this.metricsCollector.recordEvent('gap_detection.knowledge.started', {
                userId,
                conceptCount: conceptEvaluations.length
            });
        }

        try {
            const lowScoringConcepts = this.filterLowScoringConcepts(conceptEvaluations);
            const gaps = await this.analyzeConceptGaps(lowScoringConcepts, conceptEvaluations);
            const prioritizedGaps = this.prioritizeGaps(gaps);

            const result = this.buildAnalysisResult(
                prioritizedGaps,
                conceptEvaluations.length,
                lowScoringConcepts.length
            );

            if (this.config.enableDetailedMetrics) {
                this.metricsCollector.recordEvent('gap_detection.knowledge.completed', {
                    userId,
                    gapsCount: result.gaps.length,
                    averagePriority: result.metadata.averageGapPriority
                });
            }

            this.logger.debug(`Detected ${result.gaps.length} knowledge gaps for user ${userId}`);
            return result;

        } catch (error) {
            this.handleError('detectKnowledgeGaps', error, { userId });
            throw error;
        }
    }

    /**
     * @method filterLowScoringConcepts
     * @private
     * @param {ReadonlyArray<ConceptEvaluation>} conceptEvaluations - Évaluations de concepts
     * @returns {ReadonlyArray<ConceptEvaluation>} - Concepts avec scores faibles
     * @description Filtre les concepts avec un score inférieur au seuil de maîtrise
     */
    private filterLowScoringConcepts(
        conceptEvaluations: ReadonlyArray<ConceptEvaluation>
    ): ReadonlyArray<ConceptEvaluation> {
        return conceptEvaluations.filter(evaluation =>
            evaluation.score < this.config.masteryThreshold &&
            evaluation.confidence > this.config.minimumConfidence
        );
    }

    /**
     * @method analyzeConceptGaps
     * @private
     * @async
     * @param {ReadonlyArray<ConceptEvaluation>} lowScoringConcepts - Concepts à analyser
     * @param {ReadonlyArray<ConceptEvaluation>} allEvaluations - Toutes les évaluations
     * @returns {Promise<LearningGap[]>} - Lacunes détectées
     * @description Analyse les lacunes pour chaque concept avec un score faible
     */
    private async analyzeConceptGaps(
        lowScoringConcepts: ReadonlyArray<ConceptEvaluation>,
        allEvaluations: ReadonlyArray<ConceptEvaluation>
    ): Promise<LearningGap[]> {
        const gaps: LearningGap[] = [];

        for (const concept of lowScoringConcepts) {
            const gap = await this.analyzeConceptGap(concept, allEvaluations);
            if (gap && gap.priority >= this.config.minimumGapPriority) {
                gaps.push(gap);
            }
        }

        return gaps;
    }

    /**
     * @method analyzeConceptGap
     * @private
     * @async
     * @param {ConceptEvaluation} conceptEval - Évaluation du concept
     * @param {ReadonlyArray<ConceptEvaluation>} allEvaluations - Toutes les évaluations
     * @returns {Promise<LearningGap | null>} - Lacune détectée ou null
     * @description Analyse une lacune potentielle pour un concept donné
     */
    private async analyzeConceptGap(
        conceptEval: ConceptEvaluation,
        allEvaluations: ReadonlyArray<ConceptEvaluation>
    ): Promise<LearningGap | null> {
        const concept = await this.conceptRepository.getConceptById(conceptEval.conceptId);

        if (!concept) {
            this.logger.warn(`Concept ${conceptEval.conceptId} not found in repository`);
            return null;
        }

        const weakPrerequisites = this.identifyWeakPrerequisites(
            conceptEval.conceptId,
            allEvaluations
        );

        const priority = this.calculateGapPriority(
            conceptEval.conceptId,
            conceptEval.score,
            weakPrerequisites.length
        );

        const recommendedResources = await this.recommendResourcesForGap(
            conceptEval.conceptId,
            conceptEval.score
        );

        return {
            conceptId: conceptEval.conceptId,
            conceptName: concept.name,
            score: conceptEval.score,
            status: 'identified',
            priority,
            weakPrerequisites: [...weakPrerequisites],
            identifiedAt: new Date(),
            recommendedResources: [...recommendedResources]
        };
    }

    /**
     * @method identifyWeakPrerequisites
     * @private
     * @param {string} conceptId - Identifiant du concept
     * @param {ReadonlyArray<ConceptEvaluation>} allEvaluations - Toutes les évaluations
     * @returns {ReadonlyArray<string>} - Prérequis faibles
     * @description Identifie les prérequis qui ont également un score faible
     */
    private identifyWeakPrerequisites(
        conceptId: string,
        allEvaluations: ReadonlyArray<ConceptEvaluation>
    ): ReadonlyArray<string> {
        const prerequisites = this.conceptGraph.getPrerequisites(conceptId);

        return prerequisites.filter(prereqId => {
            const prereqEvaluation = allEvaluations.find(evaluation => evaluation.conceptId === prereqId);
            return prereqEvaluation && prereqEvaluation.score < this.config.masteryThreshold;
        });
    }

    /**
     * @method calculateGapPriority
     * @private
     * @param {string} conceptId - Identifiant du concept
     * @param {number} score - Score de maîtrise
     * @param {number} weakPrerequisitesCount - Nombre de prérequis faibles
     * @returns {number} - Priorité de la lacune (1-10)
     * @description Calcule la priorité d'une lacune en fonction de divers facteurs
     */
    private calculateGapPriority(
        conceptId: string,
        score: number,
        weakPrerequisitesCount: number
    ): number {
        const basePriority = 10 - (score / 10);
        const prerequisiteAdjustment = weakPrerequisitesCount * 0.5;
        const criticalConceptBonus = this.isCriticalConcept(conceptId) ? 2 : 0;

        const priority = basePriority + prerequisiteAdjustment + criticalConceptBonus;
        return Math.max(1, Math.min(10, Math.round(priority)));
    }

    /**
     * @method isCriticalConcept
     * @private
     * @param {string} conceptId - Identifiant du concept
     * @returns {boolean} - Indique si le concept est critique
     * @description Détermine si un concept est critique pour l'apprentissage
     */
    private isCriticalConcept(conceptId: string): boolean {
        const criticalConcepts: ReadonlySet<string> = new Set([
            'concept_spatial_reference',
            'concept_grammar_role_shifting',
            'concept_classifiers',
            'concept_non_manual_markers',
            'concept_conditional_structures'
        ]);

        return criticalConcepts.has(conceptId);
    }

    /**
     * @method recommendResourcesForGap
     * @private
     * @async
     * @param {string} conceptId - Identifiant du concept
     * @param {number} score - Score de maîtrise
     * @returns {Promise<ReadonlyArray<string>>} - Ressources recommandées
     * @description Recommande des ressources pour combler une lacune
     */
    private async recommendResourcesForGap(
        conceptId: string,
        score: number
    ): Promise<ReadonlyArray<string>> {
        const resources = await this.conceptRepository.getConceptResources(conceptId);
        const targetLevel = this.determineTargetLevel(score);

        const filteredResources = resources.filter(
            (resource: LearningResource) => resource.level === targetLevel
        );

        return filteredResources
            .slice(0, this.config.maxRecommendedResources)
            .map((resource: LearningResource) => resource.id);
    }

    /**
     * @method determineTargetLevel
     * @private
     * @param {number} score - Score de maîtrise
     * @returns {string} - Niveau cible
     * @description Détermine le niveau approprié en fonction du score
     */
    private determineTargetLevel(score: number): string {
        if (score < 40) return 'beginner';
        if (score < 70) return 'intermediate';
        return 'advanced';
    }

    /**
     * @method prioritizeGaps
     * @private
     * @param {LearningGap[]} gaps - Lacunes à prioriser
     * @returns {ReadonlyArray<LearningGap>} - Lacunes priorisées
     * @description Trie les lacunes par priorité décroissante
     */
    private prioritizeGaps(gaps: LearningGap[]): ReadonlyArray<LearningGap> {
        return [...gaps].sort((a, b) => b.priority - a.priority);
    }

    /**
     * @method buildAnalysisResult
     * @private
     * @param {ReadonlyArray<LearningGap>} gaps - Lacunes détectées
     * @param {number} totalConcepts - Nombre total de concepts analysés
     * @param {number} lowScoringCount - Nombre de concepts avec score faible
     * @returns {KnowledgeGapAnalysisResult} - Résultat de l'analyse
     * @description Construit le résultat final de l'analyse
     */
    private buildAnalysisResult(
        gaps: ReadonlyArray<LearningGap>,
        totalConcepts: number,
        lowScoringCount: number
    ): KnowledgeGapAnalysisResult {
        const averageGapPriority = gaps.length > 0
            ? gaps.reduce((sum, gap) => sum + gap.priority, 0) / gaps.length
            : 0;

        return {
            gaps,
            metadata: {
                analyzedConcepts: totalConcepts,
                lowScoringConcepts: lowScoringCount,
                analysisTimestamp: new Date(),
                averageGapPriority: Math.round(averageGapPriority * 100) / 100
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
        const { masteryThreshold, minimumGapPriority, minimumConfidence, maxRecommendedResources } = this.config;

        if (masteryThreshold < 0 || masteryThreshold > 100) {
            throw new Error('masteryThreshold must be between 0 and 100');
        }

        if (minimumGapPriority < 1 || minimumGapPriority > 10) {
            throw new Error('minimumGapPriority must be between 1 and 10');
        }

        if (minimumConfidence < 0 || minimumConfidence > 1) {
            throw new Error('minimumConfidence must be between 0 and 1');
        }

        if (maxRecommendedResources < 1) {
            throw new Error('maxRecommendedResources must be at least 1');
        }
    }

    /**
     * @method validateInputs
     * @private
     * @param {string} userId - Identifiant utilisateur
     * @param {ReadonlyArray<ConceptEvaluation>} conceptEvaluations - Évaluations
     * @throws {Error} Si les entrées sont invalides
     * @description Valide les paramètres d'entrée
     */
    private validateInputs(
        userId: string,
        conceptEvaluations: ReadonlyArray<ConceptEvaluation>
    ): void {
        if (!userId?.trim()) {
            throw new Error('userId is required and cannot be empty');
        }

        if (!Array.isArray(conceptEvaluations)) {
            throw new Error('conceptEvaluations must be an array');
        }

        if (conceptEvaluations.length === 0) {
            throw new Error('conceptEvaluations cannot be empty');
        }
    }

    /**
     * @method logInitialization
     * @private
     * @description Log l'initialisation du service
     */
    private logInitialization(): void {
        this.logger.info('KnowledgeGapDetector initialized', {
            config: this.config,
            serviceVersion: '1.1.0'
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
            this.metricsCollector.recordEvent(`gap_detection.knowledge.error`, {
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
            name: 'KnowledgeGapDetector',
            version: '1.1.0',
            features: [
                'knowledge_gap_detection',
                'concept_analysis',
                'learning_resource_recommendation',
                'gap_prioritization',
                'prerequisite_analysis'
            ]
        };
    }
}