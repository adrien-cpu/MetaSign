// src/ai/systems/expressions/situations/educational/special_needs/adaptations/SystemIntegration.ts

import {
    SessionData,
    AdaptationStrategy,
    AdaptationSuggestionResult,
    AdaptationType,
    AdaptationRecommendation
} from './types';
import { LSFAdaptationInterface } from './AdaptationInterface';

/**
 * Interface pour une stratégie complète d'adaptation
 * Cette interface définit la structure d'objet utilisée en interne
 */
interface AdaptationStrategyConfig {
    id: string;
    name: string;
    description: string;
    targetNeeds: string[];
    adaptations: AdaptationSuggestionResult[];
    sequence: string[];
    activationConditions: {
        threshold: number;
        requiredContext: string[];
    };
    evaluationMetrics: string[];
}

/**
 * Système d'éducation adaptatif pour l'apprentissage LSF
 */
export class AdaptiveEducationalSystem {
    private adaptationInterface: LSFAdaptationInterface;
    private activeStrategies: AdaptationStrategyConfig[] = [];
    private sessionHistory: Record<string, unknown>[] = [];

    /**
     * Constructeur du système adaptatif éducatif
     */
    constructor() {
        this.adaptationInterface = new LSFAdaptationInterface();
        this.initialize();
    }

    /**
     * Initialise le système
     */
    private initialize(): void {
        console.log('Initializing AdaptiveEducationalSystem');
    }

    /**
     * Traite une session éducative
     * @param sessionData Données de la session
     */
    public async processEducationalSession(
        sessionData: SessionData
    ): Promise<Record<string, unknown>> {
        console.log('Processing educational session');

        // Préparation de la session
        const preparedSession = await this.adaptationInterface.prepareSession(sessionData);

        // Obtention des recommandations
        const recommendations = await this.adaptationInterface.getRecommendations(preparedSession);

        // Sélection de la meilleure stratégie
        const selectedStrategy = this.selectBestStrategy(recommendations as AdaptationRecommendation[]);

        // Conversion vers le type AdaptationStrategy (string)
        const strategyType = this.getStrategyTypeFromConfig(selectedStrategy);

        // Application de la stratégie
        const success = await this.adaptationInterface.applyStrategy(
            strategyType,
            preparedSession
        );

        // Évaluation de l'efficacité
        const effectiveness = await this.adaptationInterface.evaluateEffectiveness({
            session: preparedSession,
            strategy: strategyType,
            success
        });

        // Enregistrement de la session
        const sessionResult = {
            sessionId: preparedSession.sessionId,
            timestamp: Date.now(),
            strategy: selectedStrategy,
            strategyType,
            recommendations,
            effectiveness,
            success
        };

        this.sessionHistory.push(sessionResult);

        return sessionResult;
    }

    /**
     * Obtient un type de stratégie à partir de la configuration
     */
    private getStrategyTypeFromConfig(config: AdaptationStrategyConfig): AdaptationStrategy {
        // Conversion basée sur la principale adaptation
        if (config.adaptations.length > 0) {
            const mainAdaptation = config.adaptations[0].adaptationType;
            // Correspondance entre AdaptationType et AdaptationStrategy
            switch (mainAdaptation) {
                case AdaptationType.VISUAL_SIMPLIFICATION:
                    return 'VISUAL_SIMPLIFICATION';
                case AdaptationType.SPATIAL_OPTIMIZATION:
                    return 'SPATIAL_OPTIMIZATION';
                case AdaptationType.TEMPORAL_ADJUSTMENT:
                    return 'TEMPORAL_ADJUSTMENT';
                case AdaptationType.COMPLEXITY_REDUCTION:
                    return 'COMPLEXITY_REDUCTION';
                case AdaptationType.CONTEXT_ENHANCEMENT:
                    return 'CONTEXT_ENHANCEMENT';
                case AdaptationType.BREAK_SCHEDULING:
                    return 'BREAK_SCHEDULING';
                default:
                    return 'ADAPTIVE_PACING'; // Stratégie par défaut
            }
        }
        return 'ADAPTIVE_PACING'; // Stratégie par défaut
    }

    /**
     * Sélectionne la meilleure stratégie à partir des recommandations
     * @param recommendations Recommandations d'adaptation
     */
    private selectBestStrategy(
        recommendations: AdaptationRecommendation[]
    ): AdaptationStrategyConfig {
        console.log('Selecting best strategy from recommendations');

        // Tri des recommandations par priorité
        const sortedRecommendations = recommendations.sort((a, b) => {
            return (b.priority as number) - (a.priority as number);
        });

        // Construction de la stratégie
        const strategy: AdaptationStrategyConfig = {
            id: crypto.randomUUID?.() || Math.random().toString(36).substring(2),
            name: 'Stratégie adaptative optimisée',
            description: 'Stratégie optimisée basée sur les recommandations',
            targetNeeds: ['visual', 'cognitive'],
            adaptations: this.convertToAdaptations(sortedRecommendations),
            sequence: ['preparation', 'implementation', 'follow-up'],
            activationConditions: {
                threshold: 0.6,
                requiredContext: ['educational_session']
            },
            evaluationMetrics: ['attention', 'comprehension', 'engagement']
        };

        this.activeStrategies.push(strategy);

        return strategy;
    }

    /**
     * Convertit les recommandations en adaptations
     * @param recommendations Recommandations à convertir
     */
    private convertToAdaptations(
        recommendations: AdaptationRecommendation[]
    ): AdaptationSuggestionResult[] {
        return recommendations.map(rec => ({
            id: rec.id as string || crypto.randomUUID?.() || Math.random().toString(36).substring(2),
            // Conversion du type de chaîne en enum AdaptationType
            adaptationType: this.mapStringToAdaptationType(rec.type),
            priority: rec.priority as number,
            parameters: {
                content: rec.content,
                description: rec.description
            },
            rationale: rec.rationale as string || 'Based on learner needs',
            expectedBenefits: ['Improved learning experience'],
            compatibilityScore: 0.8
        }));
    }

    /**
     * Convertit une chaîne en type d'adaptation
     * @param type Type d'adaptation en chaîne
     */
    private mapStringToAdaptationType(type: string): AdaptationType {
        // Utilisation des valeurs d'enum correctes selon le fichier de types
        switch (type.toLowerCase()) {
            case 'visual_simplification':
                return AdaptationType.VISUAL_SIMPLIFICATION;
            case 'spatial_optimization':
                return AdaptationType.SPATIAL_OPTIMIZATION;
            case 'temporal_adjustment':
                return AdaptationType.TEMPORAL_ADJUSTMENT;
            case 'complexity_reduction':
                return AdaptationType.COMPLEXITY_REDUCTION;
            case 'context_enhancement':
                return AdaptationType.CONTEXT_ENHANCEMENT;
            case 'speed_adjustment':
                return AdaptationType.SPEED_ADJUSTMENT;
            case 'alternative_presentation':
                return AdaptationType.ALTERNATIVE_PRESENTATION;
            case 'emphasis_enhancement':
                return AdaptationType.EMPHASIS_ENHANCEMENT;
            case 'multimodal_support':
                return AdaptationType.MULTIMODAL_SUPPORT;
            case 'feedback_adaptation':
                return AdaptationType.FEEDBACK_ADAPTATION;
            default:
                // Valeur par défaut
                return AdaptationType.VISUAL_SIMPLIFICATION;
        }
    }

    /**
     * Obtient l'historique des sessions
     */
    public getSessionHistory(): Record<string, unknown>[] {
        return [...this.sessionHistory];
    }

    /**
     * Réinitialise le système
     */
    public reset(): void {
        this.activeStrategies = [];
        this.sessionHistory = [];
        this.initialize();
    }
}