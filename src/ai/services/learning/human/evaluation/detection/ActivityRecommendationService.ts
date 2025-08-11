/**
 * Service de recommandation d'activités d'apprentissage
 * 
 * @file src/ai/services/learning/human/evaluation/detection/ActivityRecommendationService.ts
 * @description Service spécialisé dans la recommandation d'activités pour combler les lacunes
 * @version 1.0.0
 * @author MetaSign Learning Module
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import {
    CompetencyGap,
    RecommendedActivity
} from '@/ai/services/learning/types/learning-interfaces';
import { MetricsCollector } from '@/ai/services/learning/registry/utils/MetricsCollector';

/**
 * @interface ActivityRecommendationConfig
 * @description Configuration pour le service de recommandation d'activités
 */
export interface ActivityRecommendationConfig {
    /** Nombre maximum d'activités par lacune */
    readonly maxActivitiesPerGap?: number;
    /** Durée maximale recommandée par session (en secondes) */
    readonly maxSessionDuration?: number;
    /** Active l'enregistrement détaillé des métriques */
    readonly enableDetailedMetrics?: boolean;
    /** Niveau de difficulté par défaut */
    readonly defaultDifficulty?: number;
    /** Impact minimum attendu pour les activités */
    readonly minimumExpectedImpact?: number;
}

/**
 * @interface ActivityRecommendationResult
 * @description Résultat de la recommandation d'activités
 */
export interface ActivityRecommendationResult {
    /** Activités recommandées */
    readonly recommendations: ReadonlyArray<RecommendedActivity>;
    /** Métadonnées de la recommandation */
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
 * @interface ActivityTemplate
 * @description Template pour la génération d'activités
 */
interface ActivityTemplate {
    readonly nameTemplate: string;
    readonly type: RecommendedActivity['type'];
    readonly baseDifficulty: number;
    readonly baseDuration: number;
    readonly baseImpact: number;
    readonly prerequisites: ReadonlyArray<string>;
}

/**
 * @class ActivityRecommendationService
 * @description Service spécialisé dans la recommandation d'activités d'apprentissage
 * Génère des activités personnalisées pour combler les lacunes de compétences
 */
export class ActivityRecommendationService {
    private readonly logger = LoggerFactory.getLogger('ActivityRecommendationService');
    private readonly metricsCollector: MetricsCollector;
    private readonly config: Required<ActivityRecommendationConfig>;

    // Templates d'activités par compétence
    private readonly activityTemplates: ReadonlyMap<string, ReadonlyArray<ActivityTemplate>>;

    /**
     * @constructor
     * @param {MetricsCollector} metricsCollector - Collecteur de métriques
     * @param {ActivityRecommendationConfig} [config] - Configuration
     */
    constructor(
        metricsCollector: MetricsCollector,
        config: ActivityRecommendationConfig = {}
    ) {
        this.metricsCollector = metricsCollector;

        this.config = Object.freeze({
            maxActivitiesPerGap: config.maxActivitiesPerGap ?? 3,
            maxSessionDuration: config.maxSessionDuration ?? 1800, // 30 minutes
            enableDetailedMetrics: config.enableDetailedMetrics ?? true,
            defaultDifficulty: config.defaultDifficulty ?? 3,
            minimumExpectedImpact: config.minimumExpectedImpact ?? 5
        });

        this.activityTemplates = this.initializeActivityTemplates();
        this.validateConfig();
        this.logInitialization();
    }

    /**
     * @method recommendActivities
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {ReadonlyArray<CompetencyGap>} gaps - Lacunes de compétences
     * @returns {Promise<ActivityRecommendationResult>} - Activités recommandées avec métadonnées
     * @description Recommande des activités pour combler les lacunes identifiées
     */
    public async recommendActivities(
        userId: string,
        gaps: ReadonlyArray<CompetencyGap>
    ): Promise<ActivityRecommendationResult> {
        this.validateInputs(userId, gaps);

        this.logger.info(`Recommending activities for user ${userId} to address ${gaps.length} gaps`);

        if (this.config.enableDetailedMetrics) {
            this.metricsCollector.recordEvent('activity_recommendation.started', {
                userId,
                gapsCount: gaps.length
            });
        }

        try {
            const recommendations = await this.generateRecommendations(gaps);
            const optimizedRecommendations = this.optimizeRecommendations(recommendations);
            const result = this.buildRecommendationResult(userId, gaps, optimizedRecommendations);

            if (this.config.enableDetailedMetrics) {
                this.metricsCollector.recordEvent('activity_recommendation.completed', {
                    userId,
                    recommendationsCount: result.recommendations.length,
                    estimatedDuration: result.metadata.estimatedTotalDuration
                });
            }

            this.logger.info(`Generated ${result.recommendations.length} activity recommendations for user ${userId}`);
            return result;

        } catch (error) {
            this.handleError('recommendActivities', error, { userId, gapsCount: gaps.length });
            throw error;
        }
    }

    /**
     * @method generateRecommendations
     * @private
     * @async
     * @param {ReadonlyArray<CompetencyGap>} gaps - Lacunes de compétences
     * @returns {Promise<RecommendedActivity[]>} - Activités générées
     * @description Génère des recommandations d'activités pour chaque lacune
     */
    private async generateRecommendations(
        gaps: ReadonlyArray<CompetencyGap>
    ): Promise<RecommendedActivity[]> {
        const recommendations: RecommendedActivity[] = [];

        for (const gap of gaps) {
            const activities = this.generateActivitiesForGap(gap);
            recommendations.push(...activities);
        }

        return recommendations;
    }

    /**
     * @method generateActivitiesForGap
     * @private
     * @param {CompetencyGap} gap - Lacune de compétence
     * @returns {RecommendedActivity[]} - Activités recommandées
     * @description Génère des activités spécifiques pour une lacune donnée
     */
    private generateActivitiesForGap(gap: CompetencyGap): RecommendedActivity[] {
        const templates = this.activityTemplates.get(gap.competencyId) ?? this.getDefaultTemplates();
        const activities: RecommendedActivity[] = [];

        const selectedTemplates = templates.slice(0, this.config.maxActivitiesPerGap);

        for (const template of selectedTemplates) {
            const activity = this.createActivityFromTemplate(gap, template);
            activities.push(activity);
        }

        return activities;
    }

    /**
     * @method createActivityFromTemplate
     * @private
     * @param {CompetencyGap} gap - Lacune de compétence
     * @param {ActivityTemplate} template - Template d'activité
     * @returns {RecommendedActivity} - Activité créée
     * @description Crée une activité basée sur un template et une lacune
     */
    private createActivityFromTemplate(
        gap: CompetencyGap,
        template: ActivityTemplate
    ): RecommendedActivity {
        const difficultyModifier = this.calculateDifficultyModifier(gap);
        const impactModifier = this.calculateImpactModifier(gap);

        return {
            id: `activity_${gap.competencyId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: template.nameTemplate.replace('{competency}', gap.competencyName),
            type: template.type,
            targetGaps: [gap.id],
            difficulty: Math.max(1, Math.min(10, template.baseDifficulty + difficultyModifier)),
            estimatedDuration: Math.round(template.baseDuration * (1 + gap.gap * 0.2)),
            expectedImpact: Math.max(this.config.minimumExpectedImpact, template.baseImpact + impactModifier),
            prerequisites: [...template.prerequisites]
        };
    }

    /**
     * @method calculateDifficultyModifier
     * @private
     * @param {CompetencyGap} gap - Lacune de compétence
     * @returns {number} - Modificateur de difficulté
     * @description Calcule l'ajustement de difficulté basé sur la lacune
     */
    private calculateDifficultyModifier(gap: CompetencyGap): number {
        // Plus la lacune est importante, plus on commence par des exercices faciles
        return Math.max(-2, Math.min(2, -gap.gap * 0.5));
    }

    /**
     * @method calculateImpactModifier
     * @private
     * @param {CompetencyGap} gap - Lacune de compétence
     * @returns {number} - Modificateur d'impact
     * @description Calcule l'ajustement d'impact basé sur la lacune
     */
    private calculateImpactModifier(gap: CompetencyGap): number {
        // Plus la priorité est élevée, plus l'impact attendu est élevé
        return Math.round(gap.priority * 0.3);
    }

    /**
     * @method optimizeRecommendations
     * @private
     * @param {RecommendedActivity[]} recommendations - Recommandations à optimiser
     * @returns {ReadonlyArray<RecommendedActivity>} - Recommandations optimisées
     * @description Optimise les recommandations selon les contraintes de durée
     */
    private optimizeRecommendations(
        recommendations: RecommendedActivity[]
    ): ReadonlyArray<RecommendedActivity> {
        // Trier par impact attendu décroissant
        const sortedRecommendations = [...recommendations].sort(
            (a, b) => b.expectedImpact - a.expectedImpact
        );

        // Sélectionner les activités qui respectent la durée maximale
        const optimized: RecommendedActivity[] = [];
        let totalDuration = 0;

        for (const activity of sortedRecommendations) {
            if (totalDuration + activity.estimatedDuration <= this.config.maxSessionDuration) {
                optimized.push(activity);
                totalDuration += activity.estimatedDuration;
            }
        }

        return optimized;
    }

    /**
     * @method buildRecommendationResult
     * @private
     * @param {string} userId - Identifiant utilisateur
     * @param {ReadonlyArray<CompetencyGap>} gaps - Lacunes traitées
     * @param {ReadonlyArray<RecommendedActivity>} recommendations - Recommandations
     * @returns {ActivityRecommendationResult} - Résultat final
     * @description Construit le résultat final avec métadonnées
     */
    private buildRecommendationResult(
        userId: string,
        gaps: ReadonlyArray<CompetencyGap>,
        recommendations: ReadonlyArray<RecommendedActivity>
    ): ActivityRecommendationResult {
        const estimatedTotalDuration = recommendations.reduce(
            (total, activity) => total + activity.estimatedDuration,
            0
        );

        const averageDifficulty = recommendations.length > 0
            ? Math.round(recommendations.reduce((sum, activity) => sum + activity.difficulty, 0) / recommendations.length * 100) / 100
            : this.config.defaultDifficulty;

        return {
            recommendations,
            metadata: {
                userId,
                processedGaps: gaps.length,
                totalRecommendations: recommendations.length,
                estimatedTotalDuration,
                averageDifficulty,
                recommendationTimestamp: new Date()
            }
        };
    }

    /**
     * @method initializeActivityTemplates
     * @private
     * @returns {ReadonlyMap<string, ReadonlyArray<ActivityTemplate>>} - Templates d'activités
     * @description Initialise les templates d'activités par compétence
     */
    private initializeActivityTemplates(): ReadonlyMap<string, ReadonlyArray<ActivityTemplate>> {
        const templates = new Map<string, ReadonlyArray<ActivityTemplate>>();

        // Templates pour les configurations manuelles
        templates.set('comp_handshape', [
            {
                nameTemplate: 'Exercice de configurations manuelles pour {competency}',
                type: 'practice',
                baseDifficulty: 4,
                baseDuration: 600,
                baseImpact: 7,
                prerequisites: []
            },
            {
                nameTemplate: 'Quiz de reconnaissance de {competency}',
                type: 'quiz',
                baseDifficulty: 3,
                baseDuration: 300,
                baseImpact: 5,
                prerequisites: []
            }
        ]);

        // Templates pour l'espace de signation
        templates.set('comp_spatial', [
            {
                nameTemplate: 'Atelier d\'utilisation de l\'espace pour {competency}',
                type: 'workshop',
                baseDifficulty: 5,
                baseDuration: 900,
                baseImpact: 8,
                prerequisites: []
            }
        ]);

        return templates;
    }

    /**
     * @method getDefaultTemplates
     * @private
     * @returns {ReadonlyArray<ActivityTemplate>} - Templates par défaut
     * @description Retourne des templates génériques pour les compétences non spécifiées
     */
    private getDefaultTemplates(): ReadonlyArray<ActivityTemplate> {
        return [
            {
                nameTemplate: 'Exercice général pour améliorer {competency}',
                type: 'practice',
                baseDifficulty: this.config.defaultDifficulty,
                baseDuration: 600,
                baseImpact: this.config.minimumExpectedImpact,
                prerequisites: []
            }
        ];
    }

    /**
     * @method validateConfig
     * @private
     * @throws {Error} Si la configuration est invalide
     * @description Valide la configuration du service
     */
    private validateConfig(): void {
        const {
            maxActivitiesPerGap,
            maxSessionDuration,
            defaultDifficulty,
            minimumExpectedImpact
        } = this.config;

        if (maxActivitiesPerGap < 1) {
            throw new Error('maxActivitiesPerGap must be at least 1');
        }

        if (maxSessionDuration < 60) {
            throw new Error('maxSessionDuration must be at least 60 seconds');
        }

        if (defaultDifficulty < 1 || defaultDifficulty > 10) {
            throw new Error('defaultDifficulty must be between 1 and 10');
        }

        if (minimumExpectedImpact < 1 || minimumExpectedImpact > 10) {
            throw new Error('minimumExpectedImpact must be between 1 and 10');
        }
    }

    /**
     * @method validateInputs
     * @private
     * @param {string} userId - Identifiant utilisateur
     * @param {ReadonlyArray<CompetencyGap>} gaps - Lacunes de compétences
     * @throws {Error} Si les entrées sont invalides
     * @description Valide les paramètres d'entrée
     */
    private validateInputs(userId: string, gaps: ReadonlyArray<CompetencyGap>): void {
        if (!userId?.trim()) {
            throw new Error('userId is required and cannot be empty');
        }

        if (!Array.isArray(gaps)) {
            throw new Error('gaps must be an array');
        }

        if (gaps.length === 0) {
            throw new Error('gaps cannot be empty');
        }

        // Valider chaque lacune
        for (const gap of gaps) {
            if (!gap.id || !gap.competencyId || !gap.competencyName) {
                throw new Error('Each gap must have id, competencyId, and competencyName');
            }

            if (typeof gap.priority !== 'number' || gap.priority < 1 || gap.priority > 10) {
                throw new Error('Gap priority must be a number between 1 and 10');
            }

            if (typeof gap.impact !== 'number' || gap.impact < 1 || gap.impact > 10) {
                throw new Error('Gap impact must be a number between 1 and 10');
            }
        }
    }

    /**
     * @method logInitialization
     * @private
     * @description Log l'initialisation du service
     */
    private logInitialization(): void {
        this.logger.info('ActivityRecommendationService initialized', {
            config: this.config,
            availableCompetencies: Array.from(this.activityTemplates.keys()),
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
            this.metricsCollector.recordEvent('activity_recommendation.error', {
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
            name: 'ActivityRecommendationService',
            version: '1.0.0',
            features: [
                'activity_recommendation',
                'personalized_learning_paths',
                'difficulty_adjustment',
                'duration_optimization',
                'competency_based_activities',
                'lsf_specific_exercises',
                'session_planning',
                'prerequisite_management'
            ]
        };
    }

    /**
     * @method getAvailableCompetencies
     * @returns {ReadonlyArray<string>} - Liste des compétences supportées
     * @description Retourne la liste des compétences pour lesquelles des activités peuvent être générées
     */
    public getAvailableCompetencies(): ReadonlyArray<string> {
        return Array.from(this.activityTemplates.keys());
    }

    /**
     * @method getEstimatedDuration
     * @param {ReadonlyArray<RecommendedActivity>} activities - Activités
     * @returns {number} - Durée estimée totale en secondes
     * @description Calcule la durée estimée totale pour un ensemble d'activités
     */
    public getEstimatedDuration(activities: ReadonlyArray<RecommendedActivity>): number {
        return activities.reduce((total, activity) => total + activity.estimatedDuration, 0);
    }

    /**
     * @method filterActivitiesByDuration
     * @param {ReadonlyArray<RecommendedActivity>} activities - Activités à filtrer
     * @param {number} maxDuration - Durée maximale en secondes
     * @returns {ReadonlyArray<RecommendedActivity>} - Activités filtrées
     * @description Filtre les activités pour respecter une durée maximale
     */
    public filterActivitiesByDuration(
        activities: ReadonlyArray<RecommendedActivity>,
        maxDuration: number
    ): ReadonlyArray<RecommendedActivity> {
        const filtered: RecommendedActivity[] = [];
        let totalDuration = 0;

        // Trier par impact décroissant pour prioriser les activités les plus utiles
        const sortedActivities = [...activities].sort(
            (a, b) => b.expectedImpact - a.expectedImpact
        );

        for (const activity of sortedActivities) {
            if (totalDuration + activity.estimatedDuration <= maxDuration) {
                filtered.push(activity);
                totalDuration += activity.estimatedDuration;
            }
        }

        return filtered;
    }
}