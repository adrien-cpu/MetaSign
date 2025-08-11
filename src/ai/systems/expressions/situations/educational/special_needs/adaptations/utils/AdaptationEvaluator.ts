// src/ai/systems/expressions/situations/educational/special_needs/adaptations/utils/AdaptationEvaluator.ts

import {
    AdvancedFeaturesResult,
    CognitiveSupport,
    CustomRecord
} from '@ai/systems/expressions/situations/educational/special_needs/adaptations/types/adaptation-types';

import {
    Accommodations,
    Optimizations
} from '@ai/systems/expressions/situations/educational/special_needs/adaptations/types/supplementary.types';

import { IndexablePeerSupport } from '@ai/systems/expressions/situations/educational/special_needs/adaptations/types/intervention.types';

// Alias Record to CustomRecord for backward compatibility
type Record = CustomRecord;

/**
 * Interface pour les domaines d'évaluation
 */
interface EvaluationArea {
    /** Nom du domaine d'évaluation */
    name: string;
    /** Score du domaine (0-1) */
    score: number;
    /** Recommandations optionnelles pour amélioration */
    recommendations?: string[];
}

/**
 * Classe pour évaluer l'efficacité des adaptations
 * 
 * Cette classe fournit des méthodes pour analyser et évaluer les résultats
 * des adaptations pédagogiques, en calculant des scores d'efficacité
 * dans différents domaines et en générant des recommandations d'amélioration.
 */
export class AdaptationEvaluator {
    /**
     * Évalue l'efficacité des adaptations
     * @param adaptationResult - Résultat d'adaptation
     * @returns Résultats d'évaluation comprenant un score global, des métriques détaillées et des évaluations par domaine
     */
    public evaluateEffectiveness(
        adaptationResult: AdvancedFeaturesResult
    ): {
        effectivenessScore: number;
        metrics: Record;
        areas: EvaluationArea[];
    } {
        // Initialiser les scores par domaine
        const areas: EvaluationArea[] = [
            { name: 'learning_efficiency', score: 0 },
            { name: 'cognitive_support', score: 0 },
            { name: 'engagement', score: 0 },
            { name: 'emotional_connection', score: 0 },
            { name: 'adaptation_relevance', score: 0 }
        ];

        // Métriques basées sur les résultats d'adaptation
        const metrics: Record = {
            learning_efficiency: this.calculateLearningEfficiency(adaptationResult),
            cognitive_load_reduction: this.calculateCognitiveLoadReduction(adaptationResult),
            engagement: this.calculateEngagementBoost(adaptationResult),
            emotional_connection: this.calculateEmotionalConnection(adaptationResult),
            adaptation_relevance: this.getPropertyValueSafe(adaptationResult, 'integration.harmony_score', 0.8),
            overall_effectiveness: this.getPropertyValueSafe(adaptationResult, 'assistance.effectiveness.overall', 0.85)
        };

        // Calculer les scores par domaine
        areas[0].score = metrics.learning_efficiency as number;
        areas[1].score = metrics.cognitive_load_reduction as number;
        areas[2].score = metrics.engagement as number;
        areas[3].score = metrics.emotional_connection as number;
        areas[4].score = metrics.adaptation_relevance as number;

        // Ajouter des recommandations pour les domaines à améliorer
        areas.forEach(area => {
            if (area.score < 0.7) {
                area.recommendations = this.generateRecommendationsForArea(area.name);
            }
        });

        // Calculer le score global d'efficacité
        const effectivenessScore = metrics.overall_effectiveness as number ||
            (areas.reduce((sum, area) => sum + area.score, 0) / areas.length);

        return {
            effectivenessScore,
            metrics,
            areas
        };
    }

    /**
     * Formater les données d'évaluation dans la structure attendue
     * @param rawData - Données brutes d'évaluation
     * @returns Données formatées avec la structure standardisée
     */
    public formatEvaluationData(rawData: Record): {
        effectivenessScore: number;
        metrics: Record;
        areas: EvaluationArea[];
    } {
        // Si les données sont déjà au bon format, les retourner directement
        if (
            'effectivenessScore' in rawData &&
            'metrics' in rawData &&
            'areas' in rawData
        ) {
            return {
                effectivenessScore: rawData.effectivenessScore as number,
                metrics: rawData.metrics as Record,
                areas: rawData.areas as EvaluationArea[]
            };
        }

        // Sinon, construire un objet au format attendu
        const effectivenessScore = (rawData.overall_score || rawData.effectiveness || 0.8) as number;

        // Extraire ou créer les métriques
        let metrics: Record = {};
        if ('metrics' in rawData && typeof rawData.metrics === 'object' && rawData.metrics) {
            metrics = rawData.metrics as Record;
        } else {
            // Créer des métriques par défaut
            metrics = {
                learning_efficiency: 0.8,
                cognitive_load_reduction: 0.7,
                engagement: 0.75,
                emotional_connection: 0.8,
                adaptation_relevance: 0.85,
                overall_effectiveness: effectivenessScore
            };
        }

        // Créer les domaines
        const areas: EvaluationArea[] = [
            { name: 'learning_efficiency', score: metrics.learning_efficiency as number || 0.8 },
            { name: 'cognitive_support', score: metrics.cognitive_load_reduction as number || 0.7 },
            { name: 'engagement', score: metrics.engagement as number || 0.75 },
            { name: 'emotional_connection', score: metrics.emotional_connection as number || 0.8 },
            { name: 'adaptation_relevance', score: metrics.adaptation_relevance as number || 0.85 }
        ];

        // Ajouter des recommandations pour les domaines à améliorer
        areas.forEach(area => {
            if (area.score < 0.7) {
                area.recommendations = this.generateRecommendationsForArea(area.name);
            }
        });

        return {
            effectivenessScore,
            metrics,
            areas
        };
    }

    /**
     * Crée un ajustement pour une métrique spécifique
     * @param metric - Nom de la métrique
     * @param value - Valeur actuelle
     * @param threshold - Seuil cible
     * @returns Ajustement ou null si la métrique n'est pas reconnue
     */
    public createAdjustmentForMetric(
        metric: string,
        value: number,
        threshold: number
    ): { area: string; action: string; rationale: string } | null {
        const adjustments: { [key: string]: { action: string; rationale: string } } = {
            learning_efficiency: {
                action: 'Renforcer les prédictions de performance',
                rationale: `L'efficacité d'apprentissage est de ${value.toFixed(2)}, inférieure au seuil de ${threshold.toFixed(2)}`
            },
            cognitive_load_reduction: {
                action: 'Augmenter le niveau de support cognitif',
                rationale: `La réduction de charge cognitive est de ${value.toFixed(2)}, inférieure au seuil de ${threshold.toFixed(2)}`
            },
            engagement: {
                action: 'Améliorer la structure de collaboration',
                rationale: `Le niveau d'engagement est de ${value.toFixed(2)}, inférieur au seuil de ${threshold.toFixed(2)}`
            },
            emotional_connection: {
                action: 'Améliorer la réactivité émotionnelle des adaptations',
                rationale: `La connexion émotionnelle est de ${value.toFixed(2)}, inférieure au seuil de ${threshold.toFixed(2)}`
            },
            adaptation_relevance: {
                action: 'Affiner les critères d\'adaptation en fonction du profil spécifique',
                rationale: `La pertinence des adaptations est de ${value.toFixed(2)}, inférieure au seuil de ${threshold.toFixed(2)}`
            }
        };

        if (metric in adjustments) {
            return {
                area: metric,
                ...adjustments[metric]
            };
        }

        return null;
    }

    /**
     * Estime l'amélioration projetée basée sur les ajustements
     * @param currentScore - Score actuel
     * @param adjustmentsCount - Nombre d'ajustements
     * @returns Amélioration projetée (0-1)
     */
    public estimateProjectedImprovement(
        currentScore: number,
        adjustmentsCount: number
    ): number {
        // Estimer l'amélioration en fonction du nombre d'ajustements
        // Plus le score actuel est élevé, plus il est difficile de l'améliorer davantage
        const baseImprovement = 0.05 * adjustmentsCount;
        const diminishingFactor = currentScore * 0.5; // Plus le score est élevé, plus le facteur de diminution est grand

        // Calculer l'amélioration projetée avec un facteur de diminution
        let projectedImprovement = baseImprovement * (1 - diminishingFactor);

        // Limiter l'amélioration maximale possible
        projectedImprovement = Math.min(projectedImprovement, 1 - currentScore);

        // Garantir une valeur positive
        return Math.max(projectedImprovement, 0.01);
    }

    /**
     * Génère des recommandations spécifiques pour un domaine d'adaptation
     * @param area - Domaine d'adaptation
     * @returns Liste de recommandations
     */
    public generateRecommendationsForArea(area: string): string[] {
        const recommendations: { [key: string]: string[] } = {
            learning_efficiency: [
                'Ajouter des points d\'intervention préventifs supplémentaires',
                'Augmenter la granularité des prédictions de fatigue',
                'Intégrer des prédictions basées sur les motifs d\'apprentissage historiques'
            ],
            cognitive_support: [
                'Renforcer la segmentation de l\'information',
                'Ajouter des supports de mémoire de travail',
                'Réduire davantage les distractions dans le matériel pédagogique'
            ],
            engagement: [
                'Améliorer la correspondance des pairs pour la collaboration',
                'Intégrer des éléments de gamification adaptés',
                'Renforcer la pertinence contextuelle du contenu'
            ],
            emotional_connection: [
                'Améliorer la réactivité émotionnelle des adaptations',
                'Intégrer des éléments de reconnaissance de l\'effort',
                'Ajouter des indices d\'encouragement contextuels'
            ],
            adaptation_relevance: [
                'Affiner les critères d\'adaptation en fonction du profil spécifique',
                'Augmenter la spécificité des adaptations environnementales',
                'Intégrer des préférences personnalisées dans les stratégies d\'adaptation'
            ]
        };

        return recommendations[area] || [
            'Réviser la stratégie d\'adaptation globale',
            'Collecter des données supplémentaires sur les besoins spécifiques',
            'Consulter des experts en pédagogie spécialisée'
        ];
    }

    /**
     * Calcule l'efficacité d'apprentissage estimée
     * @param result - Résultat d'adaptation
     * @returns Efficacité d'apprentissage (0-1)
     */
    private calculateLearningEfficiency(result: AdvancedFeaturesResult): number {
        // Calculer l'efficacité d'apprentissage estimée (0-1)
        let baseEfficiency = 0.7; // Efficacité de base

        // Amélioration grâce aux interventions prédictives
        if (result.predictions && result.predictions.intervention_points.length > 0) {
            baseEfficiency += 0.05;
        }

        // Récupérer le support cognitif de manière sécurisée
        const cognitiveSupport = this.getNestedPropertyTyped<CognitiveSupport>(
            result, 'contextAwareness.learner.cognitive_support');

        // Amélioration grâce aux supports cognitifs
        if (cognitiveSupport) {
            if (cognitiveSupport.memory_aids) {
                baseEfficiency += 0.03;
            }

            if (cognitiveSupport.processing_scaffolds) {
                baseEfficiency += 0.04;
            }

            if (cognitiveSupport.attention_guides) {
                baseEfficiency += 0.03;
            }
        }

        // Récupérer les alertes de fatigue de manière sécurisée
        const fatigue_alerts = result.predictions && result.predictions.fatigue_alerts
            ? result.predictions.fatigue_alerts
            : [];

        // Compter les alertes de fatigue élevée
        const highFatigueAlerts = fatigue_alerts.filter((alert): boolean =>
            alert && alert.level === 'HIGH').length;

        baseEfficiency -= (highFatigueAlerts * 0.02);

        // Limiter entre 0 et 1
        return Math.min(Math.max(baseEfficiency, 0), 1);
    }

    /**
     * Calcule la réduction de charge cognitive estimée
     * @param result - Résultat d'adaptation
     * @returns Réduction de charge cognitive (0-1)
     */
    private calculateCognitiveLoadReduction(result: AdvancedFeaturesResult): number {
        // Calculer la réduction de charge cognitive estimée (0-1)
        let baseReduction = 0.3; // Réduction de base

        // Récupérer les accommodations de manière sécurisée
        const accommodations = this.getNestedPropertyTyped<Accommodations>(
            result, 'contextAwareness.learner.accommodations');

        // Récupérer les optimisations de manière sécurisée
        const optimizations = this.getNestedPropertyTyped<Optimizations>(
            result, 'contextAwareness.environmental.optimizations');

        // Amélioration grâce aux accommodations
        if (accommodations && accommodations.accommodations) {
            const accommodationsList = accommodations.accommodations;

            if (accommodationsList.includes('COGNITIVE')) {
                baseReduction += 0.15;
            }

            if (accommodationsList.includes('ATTENTION')) {
                baseReduction += 0.1;
            }
        }

        // Amélioration grâce aux optimisations environnementales
        if (optimizations && optimizations.optimizations) {
            const optimizationsList = optimizations.optimizations;

            if (optimizationsList.includes('NOISE')) {
                baseReduction += 0.05;
            }

            if (optimizationsList.includes('LIGHTING')) {
                baseReduction += 0.05;
            }
        }

        // Limiter entre 0 et 1
        return Math.min(Math.max(baseReduction, 0), 1);
    }

    /**
     * Calcule l'amélioration de l'engagement estimée
     * @param result - Résultat d'adaptation
     * @returns Engagement (0-1)
     */
    private calculateEngagementBoost(result: AdvancedFeaturesResult): number {
        // Calculer l'amélioration de l'engagement estimée (0-1)
        let baseBoost = 0.4; // Amélioration de base

        // Récupérer les matches de manière sécurisée en utilisant l'interface indexable
        const peerSupport = result.peerSupport as IndexablePeerSupport;
        const matches = peerSupport && peerSupport.matches ? peerSupport.matches : [];

        // Récupérer les matériaux partagés de manière sécurisée
        const resources = result.resources;
        const sharedMaterials = resources && resources.shared_materials ? resources.shared_materials : undefined;

        // Amélioration grâce aux optimisations collaboratives
        if (matches.length > 0) {
            baseBoost += 0.1;
        }

        // Amélioration grâce aux ressources
        if (sharedMaterials) {
            if (sharedMaterials.multi_modal_resources) {
                baseBoost += 0.1;
            }

            if (sharedMaterials.adapted_content) {
                baseBoost += 0.05;
            }
        }

        // Récupérer les alertes de fatigue de manière sécurisée
        const fatigue_alerts = result.predictions && result.predictions.fatigue_alerts
            ? result.predictions.fatigue_alerts
            : [];

        // Compter les alertes de fatigue élevée
        const highFatigueAlerts = fatigue_alerts.filter((alert): boolean =>
            alert && alert.level === 'HIGH').length;

        baseBoost -= (highFatigueAlerts * 0.05);

        // Limiter entre 0 et 1
        return Math.min(Math.max(baseBoost, 0), 1);
    }

    /**
     * Calcule la connexion émotionnelle estimée
     * @param result - Résultat d'adaptation
     * @returns Connexion émotionnelle (0-1)
     */
    private calculateEmotionalConnection(result: AdvancedFeaturesResult): number {
        // Calculer la connexion émotionnelle estimée (0-1)
        let baseConnection = 0.6; // Connexion de base

        // Récupérer les accommodations de manière sécurisée
        const accommodations = this.getNestedPropertyTyped<Accommodations>(
            result, 'contextAwareness.learner.accommodations');

        // Récupérer les matches de manière sécurisée en utilisant l'interface indexable
        const peerSupport = result.peerSupport as IndexablePeerSupport;
        const matches = peerSupport && peerSupport.matches ? peerSupport.matches : [];

        // Récupérer les matériaux partagés de manière sécurisée
        const resources = result.resources;
        const sharedMaterials = resources && resources.shared_materials ? resources.shared_materials : undefined;

        // Amélioration grâce aux adaptations émotionnelles
        if (accommodations && accommodations.accommodations &&
            accommodations.accommodations.includes('ATTENTION')) {
            baseConnection += 0.05;
        }

        // Amélioration grâce au support par les pairs
        if (matches.length > 0) {
            baseConnection += 0.08;
        }

        // Amélioration grâce aux ressources adaptées
        if (sharedMaterials && sharedMaterials.adapted_content) {
            baseConnection += 0.04;
        }

        // Limiter entre 0 et 1
        return Math.min(Math.max(baseConnection, 0), 1);
    }

    /**
     * Récupère une propriété imbriquée d'un objet de manière sécurisée
     * @param obj - Objet à explorer
     * @param path - Chemin de la propriété (ex: "a.b.c")
     * @returns Valeur trouvée ou undefined
     * @private
     */
    private getNestedProperty(obj: unknown, path: string): unknown {
        if (!obj || typeof obj !== 'object') {
            return undefined;
        }

        const parts = path.split('.');
        let current: unknown = obj;

        for (const part of parts) {
            if (current === null || typeof current !== 'object' || !(part in (current as { [key: string]: unknown }))) {
                return undefined;
            }
            current = (current as { [key: string]: unknown })[part];
        }

        return current;
    }

    /**
     * Récupère une propriété imbriquée d'un objet avec un type spécifique
     * @param obj - Objet à explorer
     * @param path - Chemin de la propriété (ex: "a.b.c")
     * @returns Valeur typée trouvée ou undefined
     * @private
     */
    private getNestedPropertyTyped<T>(obj: unknown, path: string): T | undefined {
        const value = this.getNestedProperty(obj, path);
        if (value === undefined) {
            return undefined;
        }
        return value as T;
    }

    /**
     * Récupère une valeur de propriété avec une valeur par défaut
     * @param obj - Objet source
     * @param path - Chemin de la propriété (points pour hiérarchie)
     * @param defaultValue - Valeur par défaut
     * @returns Valeur trouvée ou valeur par défaut
     */
    public getPropertyValueSafe<T>(obj: unknown, path: string, defaultValue: T): T {
        const value = this.getNestedProperty(obj, path);

        if (value === undefined) {
            return defaultValue;
        }

        // Vérifier si le type est compatible
        if (
            (typeof defaultValue === 'string' && typeof value === 'string') ||
            (typeof defaultValue === 'number' && typeof value === 'number') ||
            (typeof defaultValue === 'boolean' && typeof value === 'boolean') ||
            (Array.isArray(defaultValue) && Array.isArray(value))
        ) {
            return value as T;
        }

        return defaultValue;
    }
}