// src/ai/specialized/cultural/facade/CulturalAdaptationFacade.ts

import { SemanticAnalysis } from '@ai/specialized/analysis/types';
import { SpatialAnalysis } from '@ai/specialized/analysis/spatial-types';
import { Translation } from '@ai/specialized/analysis/translation-types';
import {
    CulturalContext,
    AdaptedContext,
    AdaptedElement
} from '../types';
import {
    CulturalContextAdapter
} from '../CulturalContextAdapter';
import {
    CulturalValidationService
} from '../services/CulturalValidationService';
import {
    CulturalRuleService
} from '../services/CulturalRuleService';
import {
    CulturalPerformanceMonitor
} from '../monitoring/CulturalPerformanceMonitor';
import {
    CulturalAdaptationConfig,
    CulturalAdaptationConfigService
} from '../config/CulturalAdaptationConfig';

// Suppression de l'import non utilisé de ValidationResults

/**
 * Façade pour l'adaptation culturelle
 * Simplifie l'accès aux fonctionnalités d'adaptation culturelle
 */
export class CulturalAdaptationFacade {
    private adapter: CulturalContextAdapter;
    private validationService: CulturalValidationService;
    private ruleService: CulturalRuleService;
    private performanceMonitor: CulturalPerformanceMonitor;
    private configService: CulturalAdaptationConfigService;

    constructor(config?: Partial<CulturalAdaptationConfig>) {
        this.configService = new CulturalAdaptationConfigService(config);

        // Casting sécurisé avec as unknown d'abord
        this.validationService = this.configService.getValidator() as unknown as CulturalValidationService;
        this.ruleService = this.configService.getRuleService();
        this.adapter = this.configService.getAdapter();
        this.performanceMonitor = this.configService.getPerformanceMonitor();
    }

    /**
     * Adapte un contexte sémantique au contexte culturel
     */
    async adaptContext(
        semanticAnalysis: SemanticAnalysis,
        culturalContext: CulturalContext
    ): Promise<AdaptedContext> {
        const config = this.configService.getConfig();

        if (config.monitoringEnabled) {
            return this.performanceMonitor.measureOperation(
                'adaptContext',
                () => this.adapter.adaptContext(semanticAnalysis, culturalContext),
                { analysisId: semanticAnalysis.id, contextRegion: culturalContext.region }
            );
        } else {
            return this.adapter.adaptContext(semanticAnalysis, culturalContext);
        }
    }

    /**
     * Extrait le contexte culturel d'une analyse spatiale
     * Délègue à l'adaptateur
     */
    async extractCulturalContext(spatialAnalysis: SpatialAnalysis): Promise<CulturalContext> {
        const config = this.configService.getConfig();

        if (config.monitoringEnabled) {
            return this.performanceMonitor.measureOperation(
                'extractCulturalContext',
                () => this.extractContextFromSpatial(spatialAnalysis),
                { analysisId: spatialAnalysis.id }
            );
        } else {
            return this.extractContextFromSpatial(spatialAnalysis);
        }
    }

    /**
     * Extrait le contexte à partir d'une analyse spatiale
     * Méthode privée d'implémentation
     */
    private async extractContextFromSpatial(spatialAnalysis: SpatialAnalysis): Promise<CulturalContext> {
        if (this.adapter.extractContext) {
            return this.adapter.extractContext(spatialAnalysis);
        }

        // Implémentation par défaut si l'adaptateur ne fournit pas cette méthode
        return {
            region: spatialAnalysis.metadata?.region as string || 'france',
            formalityLevel: 'SEMI_FORMAL',
            markers: [],
            specifics: {
                deafCultureMarkers: [],
                regionalVariations: [],
                customPractices: []
            },
            timestamp: Date.now()
        };
    }

    /**
     * Mesure la précision culturelle d'une traduction
     */
    async evaluateTranslationAccuracy(translation: Translation): Promise<number> {
        const config = this.configService.getConfig();

        if (config.monitoringEnabled) {
            return this.performanceMonitor.measureOperation(
                'evaluateTranslationAccuracy',
                () => this.measureTranslationAccuracy(translation),
                { translationId: translation.id }
            );
        } else {
            return this.measureTranslationAccuracy(translation);
        }
    }

    /**
     * Implémentation interne de la mesure de précision
     */
    private async measureTranslationAccuracy(translation: Translation): Promise<number> {
        if (this.adapter.measureAccuracy) {
            return this.adapter.measureAccuracy(translation);
        }

        // Implémentation par défaut si l'adaptateur ne fournit pas cette méthode
        // Convertir la traduction en éléments adaptés pour l'évaluation
        const adaptedElements = this.convertTranslationToAdaptedElements(translation);

        // Calculer un score d'authenticité
        const authenticityScore = await this.validationService.validateAuthenticity(adaptedElements as AdaptedElement[]);

        // Créer un contexte culturel pour l'évaluation
        const context: CulturalContext = {
            region: translation.metadata?.culturalRegion as string || 'france',
            formalityLevel: 'SEMI_FORMAL',
            markers: [],
            specifics: {
                deafCultureMarkers: [],
                regionalVariations: [],
                customPractices: []
            },
            timestamp: Date.now()
        };

        // Calculer un score de cohérence
        const coherenceScore = await this.validationService.evaluateCulturalCoherence(adaptedElements as AdaptedElement[], context);

        // Calculer un score global
        return (authenticityScore * 0.6) + (coherenceScore * 0.4);
    }

    /**
     * Convertit une traduction en éléments adaptés pour l'évaluation
     * Cette méthode devrait être implémentée selon les besoins spécifiques
     */
    private convertTranslationToAdaptedElements(translation: Translation): AdaptedElement[] {
        // Implémentation simplifiée pour l'exemple
        return [{
            original: {
                id: `translation_${Math.random().toString(36).substring(2, 9)}`,
                type: 'EXPRESSION',
                content: translation.sourceContent || '',
                culturalSignificance: 0.7,
                validation: {
                    culturalAccuracy: 0.7,
                    regionalFit: 0.7,
                    formalityMatch: 0.7,
                    overallValidity: 0.7
                }
            },
            adaptations: [{
                type: 'CULTURAL',
                changes: [
                    {
                        property: 'content',
                        from: translation.sourceContent || '',
                        to: translation.targetContent || '',
                        reason: 'Translation adaptation'
                    }
                ],
                rationale: 'Cultural translation',
                confidence: translation.metadata?.accuracy || 0.7
            }],
            validation: {
                culturalAccuracy: translation.metadata?.culturalRelevance || 0.7,
                regionalFit: 0.7,
                formalityMatch: 0.7,
                overallValidity: translation.metadata?.accuracy || 0.7
            }
        }];
    }

    /**
     * Récupère les métriques de performance
     */
    getPerformanceMetrics(): Record<string, unknown> {
        return this.performanceMonitor.getGlobalMetrics();
    }

    /**
     * Met à jour la configuration
     */
    updateConfig(newConfig: Partial<CulturalAdaptationConfig>): void {
        this.configService.updateConfig(newConfig);
    }

    /**
     * Récupère la configuration actuelle
     */
    getConfig(): CulturalAdaptationConfig {
        return this.configService.getConfig();
    }
}

/**
 * Fonction utilitaire pour créer une instance de la façade
 */
export function createCulturalAdaptation(config?: Partial<CulturalAdaptationConfig>): CulturalAdaptationFacade {
    return new CulturalAdaptationFacade(config);
}