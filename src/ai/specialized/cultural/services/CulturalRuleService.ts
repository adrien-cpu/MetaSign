// src/ai/specialized/cultural/services/CulturalRuleService.ts

import { CulturalElement, CulturalContext, AdaptedElement, Adaptation, AdaptationType } from '../types';
import { CulturalRule, ElementValidation } from '../types-extended';
import { ICulturalRuleService } from '../interfaces/validation.interfaces';

/**
 * Service de gestion des règles culturelles
 */
export class CulturalRuleService implements ICulturalRuleService {
    private culturalRules: Map<string, CulturalRule>;

    constructor() {
        this.culturalRules = this.initializeCulturalRules();
    }

    /**
     * Initialise les règles culturelles
     */
    private initializeCulturalRules(): Map<string, CulturalRule> {
        const rules = new Map<string, CulturalRule>();

        // Règle d'exemple pour le contexte formel
        rules.set('formal_expression', {
            id: 'formal_expression',
            name: 'Formal Expression Rule',
            description: 'Adapts expressions to formal context',
            applicableRegions: ['france', 'belgium', 'switzerland'],
            formalityRange: [0.7, 1.0],
            priority: 10,
            contexts: ['formal', 'educational', 'official'],
            condition: (element, context) =>
                this.mapFormalityLevelToNumeric(context.formalityLevel) > 0.7,
            apply: async (element, context) => {
                // Création des adaptations
                const adaptations: Adaptation[] = [{
                    type: 'FORMAL' as AdaptationType,
                    changes: [
                        {
                            property: 'content',
                            from: element.content,
                            to: this.formalizeContent(element.content),
                            reason: 'Formalization of expression'
                        }
                    ],
                    rationale: 'Adapting to formal context',
                    confidence: 0.85
                }];

                return {
                    original: element,
                    adaptations,
                    validation: {
                        culturalAccuracy: 0.8,
                        regionalFit: 0.8,
                        formalityMatch: 0.9,
                        overallValidity: 0.85
                    }
                };
            }
        });

        return rules;
    }

    /**
     * Convertit un niveau de formalité en valeur numérique
     */
    private mapFormalityLevelToNumeric(level: FormalityLevel): number {
        switch (level) {
            case 'VERY_FORMAL': return 0.9;
            case 'FORMAL': return 0.7;
            case 'SEMI_FORMAL': return 0.5;
            case 'INFORMAL': return 0.3;
            case 'VERY_INFORMAL': return 0.1;
        }
    }

    /**
     * Formalise le contenu 
     */
    private formalizeContent(content: unknown): unknown {
        if (typeof content === 'string') {
            return content.replace(/informel/g, 'formel');
        }
        return content;
    }

    /**
     * Vérifie si une règle est applicable
     */
    isRuleApplicable(ruleId: string, element: CulturalElement, context: CulturalContext): boolean {
        const rule = this.culturalRules.get(ruleId);
        if (!rule) {
            return false;
        }

        return rule.condition(element, context);
    }

    /**
     * Applique les règles culturelles aux éléments
     */
    async applyCulturalRules(
        elements: CulturalElement[],
        context: CulturalContext
    ): Promise<AdaptedElement[]> {
        const adaptedElements: AdaptedElement[] = [];

        for (const element of elements) {
            // Application des règles générales
            let adapted = await this.applyGeneralRules(element, context);

            // Application des règles spécifiques au contexte
            adapted = await this.applyContextSpecificRules(adapted, context);

            // Validation de l'adaptation
            if (await this.validateAdaptation(adapted, context)) {
                adaptedElements.push(adapted);
            }
        }

        return adaptedElements;
    }

    /**
     * Applique les règles générales à un élément culturel
     */
    private async applyGeneralRules(
        element: CulturalElement,
        context: CulturalContext
    ): Promise<AdaptedElement> {
        let adaptations: Adaptation[] = [];

        // Appliquer les règles générales
        for (const rule of this.culturalRules.values()) {
            // Vérifier si la règle est applicable
            if (rule.condition(element, context)) {
                // Appliquer la règle
                const adaptedElement = await rule.apply(element, context);

                // Fusionner les adaptations
                adaptations = [...adaptations, ...adaptedElement.adaptations];
            }
        }

        if (adaptations.length === 0) {
            // Si aucune règle n'a été appliquée, créer une adaptation par défaut
            adaptations = [{
                type: 'CONTEXTUAL',
                changes: [],
                rationale: 'Default contextual adaptation',
                confidence: 0.6
            }];
        }

        return {
            original: element,
            adaptations,
            validation: {
                culturalAccuracy: 0.7,
                regionalFit: 0.7,
                formalityMatch: 0.7,
                overallValidity: 0.7
            }
        };
    }

    /**
     * Applique les règles spécifiques au contexte
     */
    private async applyContextSpecificRules(
        element: AdaptedElement,
        context: CulturalContext
    ): Promise<AdaptedElement> {
        // Identifier les règles spécifiques au contexte
        const contextSpecificRules = Array.from(this.culturalRules.values()).filter(rule =>
            rule.applicableRegions.includes(context.region) &&
            rule.formalityRange[0] <= this.mapFormalityLevelToNumeric(context.formalityLevel) &&
            rule.formalityRange[1] >= this.mapFormalityLevelToNumeric(context.formalityLevel)
        );

        let adaptations = [...element.adaptations];

        // Appliquer les règles spécifiques au contexte
        for (const rule of contextSpecificRules) {
            if (rule.condition(element.original, context)) {
                const adaptedElement = await rule.apply(element.original, context);

                // Fusionner les adaptations
                adaptations = [...adaptations, ...adaptedElement.adaptations];
            }
        }

        return {
            ...element,
            adaptations,
            validation: {
                ...element.validation,
                regionalFit: Math.min(0.95, element.validation.regionalFit + 0.05),
                overallValidity: Math.min(0.95, element.validation.overallValidity + 0.05)
            }
        };
    }

    /**
     * Valide l'adaptation d'un élément
     */
    private async validateAdaptation(
        element: AdaptedElement,
        context: CulturalContext
    ): Promise<boolean> {
        if (element.adaptations.length === 0) {
            return false;
        }

        // Vérifier si les adaptations sont cohérentes avec le contexte
        const hasRelevantAdaptations = element.adaptations.some(currentAdaptation => {
            switch (currentAdaptation.type) {
                case 'REGIONAL':
                    return true; // Les adaptations régionales sont toujours pertinentes
                case 'FORMAL':
                    return context.formalityLevel === 'FORMAL' || context.formalityLevel === 'VERY_FORMAL';
                case 'CULTURAL':
                    return true; // Les adaptations culturelles sont toujours pertinentes
                case 'CONTEXTUAL':
                    return element.validation.overallValidity > 0.6;
                default:
                    return false;
            }
        });

        // Vérifier si la validation est suffisante
        const hasGoodValidation =
            element.validation.culturalAccuracy > 0.6 &&
            element.validation.regionalFit > 0.6 &&
            element.validation.overallValidity > 0.6;

        return hasRelevantAdaptations && hasGoodValidation;
    }
}