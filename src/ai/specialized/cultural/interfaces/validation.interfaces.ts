// src/ai/specialized/cultural/interfaces/validation.interfaces.ts

import { CulturalElement, AdaptedElement, CulturalContext } from '../types';
import { ElementValidation, ValidationResults } from '../types-extended';

/**
 * Interface pour les services de validation culturelle
 * 
 * Cette interface définit les méthodes de validation pour assurer l'authenticité
 * et la cohérence culturelle des éléments dans le système MetaSign.
 * 
 * @interface ICulturalValidator
 * @since 1.0.0
 * 
 * @example
 * ```typescript
 * const validator: ICulturalValidator = new CulturalValidatorImpl();
 * const score = await validator.validateAuthenticity(elements);
 * console.log(`Authenticité: ${(score * 100).toFixed(1)}%`);
 * ```
 */
export interface ICulturalValidator {
    /**
     * Valide l'authenticité culturelle des éléments
     * 
     * Vérifie si les éléments adaptés préservent l'authenticité culturelle
     * d'origine en analysant les marqueurs culturels, les expressions
     * idiomatiques et les références contextuelles.
     * 
     * @param elements - Éléments adaptés à valider
     * @returns Promise<number> Score d'authenticité compris entre 0 et 1
     * 
     * @throws {ValidationError} Si les éléments sont invalides
     * 
     * @example
     * ```typescript
     * const score = await validator.validateAuthenticity(adaptedElements);
     * if (score < 0.7) {
     *   console.warn('Authenticité culturelle insuffisante');
     * }
     * ```
     */
    validateAuthenticity(elements: AdaptedElement[]): Promise<number>;

    /**
     * Évalue la cohérence culturelle des éléments
     * 
     * Analyse la cohérence entre les différents éléments culturels
     * dans le contexte donné, en vérifiant l'harmonie des références
     * culturelles et l'absence de contradictions.
     * 
     * @param elements - Éléments à évaluer pour la cohérence
     * @param context - Contexte culturel de référence
     * @returns Promise<number> Score de cohérence compris entre 0 et 1
     * 
     * @example
     * ```typescript
     * const coherence = await validator.evaluateCulturalCoherence(elements, context);
     * console.log(`Cohérence culturelle: ${(coherence * 100).toFixed(1)}%`);
     * ```
     */
    evaluateCulturalCoherence(elements: AdaptedElement[], context: CulturalContext): Promise<number>;

    /**
     * Valide la précision régionale des éléments
     * 
     * Vérifie si les éléments respectent les spécificités régionales
     * et les variations locales de la culture cible.
     * 
     * @param elements - Éléments à valider pour la précision régionale
     * @returns Promise<number> Score de précision régionale compris entre 0 et 1
     * 
     * @example
     * ```typescript
     * const precision = await validator.validateRegionalAccuracy(elements);
     * if (precision > 0.8) {
     *   console.log('Précision régionale excellente');
     * }
     * ```
     */
    validateRegionalAccuracy(elements: AdaptedElement[]): Promise<number>;

    /**
     * Valide l'adaptation culturelle globale
     * 
     * Effectue une validation complète de l'adaptation culturelle
     * en combinant tous les aspects : authenticité, cohérence,
     * précision régionale et pertinence contextuelle.
     * 
     * @param elements - Éléments adaptés à valider
     * @param context - Contexte culturel complet
     * @returns Promise<ValidationResults> Résultats détaillés de la validation
     * 
     * @example
     * ```typescript
     * const results = await validator.validateCulturalAdaptation(elements, context);
     * console.log(`Score global: ${results.overallScore}`);
     * console.log(`Recommandations: ${results.recommendations.length}`);
     * ```
     */
    validateCulturalAdaptation(elements: AdaptedElement[], context: CulturalContext): Promise<ValidationResults>;
}

/**
 * Interface pour les services de gestion des règles culturelles
 * 
 * Cette interface définit les méthodes pour appliquer et gérer
 * les règles d'adaptation culturelle dans le système MetaSign.
 * Les règles culturelles permettent de transformer les éléments
 * selon les spécificités culturelles et contextuelles.
 * 
 * @interface ICulturalRuleService
 * @since 1.0.0
 * 
 * @example
 * ```typescript
 * const ruleService: ICulturalRuleService = new CulturalRuleServiceImpl();
 * const adaptedElements = await ruleService.applyCulturalRules(elements, context);
 * ```
 */
export interface ICulturalRuleService {
    /**
     * Applique les règles culturelles aux éléments
     * 
     * Transforme les éléments culturels en appliquant les règles
     * d'adaptation appropriées selon le contexte culturel donné.
     * Cette méthode analyse chaque élément et applique les règles
     * pertinentes pour créer des éléments adaptés.
     * 
     * @param elements - Éléments culturels d'origine à adapter
     * @param context - Contexte culturel cible pour l'adaptation
     * @returns Promise<AdaptedElement[]> Éléments adaptés selon les règles culturelles
     * 
     * @throws {RuleApplicationError} Si l'application des règles échoue
     * 
     * @example
     * ```typescript
     * const originalElements = [{ type: 'greeting', content: 'Hello' }];
     * const frenchContext = { language: 'fr', region: 'France' };
     * const adapted = await ruleService.applyCulturalRules(originalElements, frenchContext);
     * console.log(adapted[0].content); // 'Bonjour'
     * ```
     */
    applyCulturalRules(elements: CulturalElement[], context: CulturalContext): Promise<AdaptedElement[]>;

    /**
     * Vérifie si une règle culturelle est applicable
     * 
     * Détermine si une règle spécifique peut être appliquée à un élément
     * donné dans un contexte culturel particulier. Cette vérification
     * permet d'optimiser l'application des règles et d'éviter les conflits.
     * 
     * @param ruleId - Identifiant unique de la règle à vérifier
     * @param element - Élément culturel à tester
     * @param context - Contexte culturel de l'application
     * @returns boolean True si la règle est applicable, false sinon
     * 
     * @example
     * ```typescript
     * const canApply = ruleService.isRuleApplicable('formal-greeting', element, context);
     * if (canApply) {
     *   console.log('Règle de salutation formelle applicable');
     * }
     * ```
     */
    isRuleApplicable(ruleId: string, element: CulturalElement, context: CulturalContext): boolean;
}

/**
 * Interface pour la validation détaillée des éléments culturels
 * 
 * Cette interface étend les capacités de validation en fournissant
 * une analyse granulaire de chaque élément culturel. Elle utilise
 * ElementValidation pour offrir des détails complets sur la validation
 * et permettre un diagnostic précis des problèmes d'adaptation culturelle.
 * 
 * @interface IDetailedCulturalValidator
 * @since 1.0.0
 * 
 * @example
 * ```typescript
 * const detailedValidator: IDetailedCulturalValidator = new DetailedValidatorImpl();
 * const validation = await detailedValidator.validateElement(element, context);
 * if (!validation.isValid) {
 *   console.log('Erreurs:', validation.errors);
 * }
 * ```
 */
export interface IDetailedCulturalValidator {
    /**
     * Valide un élément culturel individuel avec des détails complets
     * 
     * Effectue une validation approfondie d'un élément culturel unique,
     * en analysant tous ses aspects : contenu, contexte, références culturelles,
     * et cohérence. Retourne une validation détaillée avec diagnostic complet.
     * 
     * @param element - Élément culturel à valider en détail
     * @param context - Contexte culturel de référence pour la validation
     * @returns Promise<ElementValidation> Validation détaillée avec erreurs et avertissements
     * 
     * @example
     * ```typescript
     * const element = { type: 'expression', content: 'break a leg', culture: 'en-US' };
     * const validation = await validator.validateElement(element, frenchContext);
     * console.log(`Valide: ${validation.isValid}`);
     * console.log(`Score: ${validation.score}`);
     * ```
     */
    validateElement(element: CulturalElement, context: CulturalContext): Promise<ElementValidation>;

    /**
     * Valide plusieurs éléments et retourne les détails pour chacun
     * 
     * Applique la validation détaillée à une collection d'éléments culturels,
     * en maintenant l'ordre et en fournissant une validation individuelle
     * pour chaque élément. Permet l'analyse batch avec diagnostic granulaire.
     * 
     * @param elements - Liste des éléments culturels à valider
     * @param context - Contexte culturel commun pour la validation
     * @returns Promise<ElementValidation[]> Array des validations détaillées dans l'ordre
     * 
     * @example
     * ```typescript
     * const validations = await validator.validateElements(culturalElements, context);
     * const invalidElements = validations.filter(v => !v.isValid);
     * console.log(`${invalidElements.length} éléments invalides trouvés`);
     * ```
     */
    validateElements(elements: CulturalElement[], context: CulturalContext): Promise<ElementValidation[]>;

    /**
     * Agrège les validations individuelles en résultats globaux
     * 
     * Combine les validations détaillées de plusieurs éléments pour produire
     * des résultats de validation globaux avec métriques agrégées,
     * recommandations consolidées et score global de qualité.
     * 
     * @param elementValidations - Validations individuelles à agréger
     * @returns ValidationResults Résultats consolidés avec métriques globales
     * 
     * @example
     * ```typescript
     * const individualValidations = await validator.validateElements(elements, context);
     * const globalResults = validator.aggregateValidations(individualValidations);
     * console.log(`Score global: ${globalResults.overallScore}`);
     * console.log(`Recommandations: ${globalResults.recommendations.join(', ')}`);
     * ```
     */
    aggregateValidations(elementValidations: ElementValidation[]): ValidationResults;
}