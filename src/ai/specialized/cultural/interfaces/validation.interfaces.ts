// src/ai/specialized/cultural/interfaces/validation.interfaces.ts

import { CulturalElement, AdaptedElement, CulturalContext } from '../types';
import { ElementValidation, ValidationResults } from '../types-extended';

/**
 * Interface pour les services de validation culturelle
 */
export interface ICulturalValidator {
    /**
     * Valide l'authenticité culturelle des éléments
     * @param elements Éléments à valider
     * @returns Score d'authenticité (0-1)
     */
    validateAuthenticity(elements: AdaptedElement[]): Promise<number>;

    /**
     * Évalue la cohérence culturelle des éléments
     * @param elements Éléments à évaluer
     * @param context Contexte culturel
     * @returns Score de cohérence (0-1)
     */
    evaluateCulturalCoherence(elements: AdaptedElement[], context: CulturalContext): Promise<number>;

    /**
     * Valide la précision régionale des éléments
     * @param elements Éléments à valider
     * @returns Score de précision régionale (0-1)
     */
    validateRegionalAccuracy(elements: AdaptedElement[]): Promise<number>;

    /**
     * Valide l'adaptation culturelle globale
     * @param elements Éléments adaptés
     * @param context Contexte culturel
     * @returns Résultats de validation
     */
    validateCulturalAdaptation(elements: AdaptedElement[], context: CulturalContext): Promise<ValidationResults>;
}

/**
 * Interface pour les règles culturelles
 */
export interface ICulturalRuleService {
    /**
     * Applique les règles culturelles aux éléments
     * @param elements Éléments à adapter
     * @param context Contexte culturel
     * @returns Éléments adaptés
     */
    applyCulturalRules(elements: CulturalElement[], context: CulturalContext): Promise<AdaptedElement[]>;

    /**
     * Vérifie si une règle est applicable
     * @param ruleId Identifiant de la règle
     * @param element Élément à vérifier
     * @param context Contexte culturel
     * @returns Vrai si la règle est applicable
     */
    isRuleApplicable(ruleId: string, element: CulturalElement, context: CulturalContext): boolean;
}