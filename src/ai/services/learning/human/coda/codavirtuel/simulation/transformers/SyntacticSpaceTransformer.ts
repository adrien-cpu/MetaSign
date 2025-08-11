/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/SyntacticSpaceTransformer.ts
 * @description Transformateur principal pour les erreurs d'espace syntaxique en LSF
 * Coordonne les différentes stratégies de transformation d'espace syntaxique
 * @author MetaSign
 * @version 2.0.1
 * @since 2025-05-29
 */

import { BaseErrorTransformer } from './BaseErrorTransformer';
import { ErrorCategoryType, ErrorTransformation, ErrorCatalogEntry } from '../types/ErrorTypes';
import { LSFParameters, LSFSpaceParameter } from '../types/LSFContentTypes';
import { SyntacticSpaceValidator } from './space/SyntacticSpaceValidator';
import { SpaceTransformationFactory } from './space/factories/SpaceTransformationFactory';
import { SyntacticSpaceMetrics } from './space/metrics/SyntacticSpaceMetrics';
import { SpaceTransformationContext } from './space/types/SpaceTransformationTypes';
import { ExtendedLSFSpaceParameter, LSFTypeConverter, isExtendedLSFSpaceParameter } from './space/types/ExtendedLSFTypes';
import { ReferenceTransformationStrategy } from './space/strategies/ReferenceTransformationStrategy';
import { ScaleTransformationStrategy } from './space/strategies/ScaleTransformationStrategy';
import { PlacementTransformationStrategy } from './space/strategies/PlacementTransformationStrategy';
import { LocationTransformationStrategy } from './space/strategies/LocationTransformationStrategy';

/**
 * Interface pour les stratégies de transformation d'espace syntaxique
 */
interface ISyntacticSpaceTransformationStrategy {
    apply(space: ExtendedLSFSpaceParameter, context: SpaceTransformationContext): void;
    validate(space: ExtendedLSFSpaceParameter): boolean;
    getImpactScore(): number;
}

/**
 * Configuration des stratégies de transformation
 */
interface StrategyConfig {
    readonly type: string;
    readonly priority: number;
    readonly description: string;
}

/**
 * Transformateur principal pour les erreurs d'espace syntaxique en LSF
 * 
 * Cette classe orchestre les différentes stratégies de transformation
 * d'espace syntaxique en respectant les principes linguistiques de la LSF
 * et en maintenant la cohérence sémantique des transformations.
 * 
 * @extends BaseErrorTransformer
 */
export class SyntacticSpaceTransformer extends BaseErrorTransformer {
    private readonly validator: SyntacticSpaceValidator;
    private readonly transformationFactory: SpaceTransformationFactory;
    private readonly metricsCollector: SyntacticSpaceMetrics;
    private readonly strategies: Map<string, ISyntacticSpaceTransformationStrategy>;
    private readonly strategyConfigs: ReadonlyArray<StrategyConfig>;

    /**
     * Initialise le transformateur pour les erreurs d'espace syntaxique
     * @param errorCategory Catégorie d'erreur avec ses transformations possibles
     */
    constructor(errorCategory: ErrorCatalogEntry) {
        super(ErrorCategoryType.SYNTACTIC_SPACE, errorCategory);

        this.validator = new SyntacticSpaceValidator();
        this.transformationFactory = new SpaceTransformationFactory();
        this.metricsCollector = new SyntacticSpaceMetrics();

        this.strategyConfigs = this.defineStrategyConfigs();
        this.strategies = this.initializeStrategies();
    }

    /**
     * Définit la configuration des stratégies disponibles
     * @returns Configuration des stratégies
     * @private
     */
    private defineStrategyConfigs(): ReadonlyArray<StrategyConfig> {
        return [
            { type: 'ZONE_CONFUSION', priority: 1, description: 'Confusion entre zones spatiales' },
            { type: 'REFERENCE_VIOLATION', priority: 2, description: 'Violation de références spatiales' },
            { type: 'REDUCED_SPACE', priority: 3, description: 'Réduction de l\'espace de signation' },
            { type: 'RANDOM_PLACEMENT', priority: 4, description: 'Placement aléatoire des signes' },
            { type: 'LOCATION_OMISSION', priority: 5, description: 'Omission d\'informations de localisation' }
        ] as const;
    }

    /**
     * Initialise les stratégies de transformation disponibles
     * @returns Map des stratégies indexées par leur type
     * @private
     */
    private initializeStrategies(): Map<string, ISyntacticSpaceTransformationStrategy> {
        const strategies = new Map<string, ISyntacticSpaceTransformationStrategy>();

        for (const config of this.strategyConfigs) {
            try {
                let strategy: ISyntacticSpaceTransformationStrategy;

                // Crée les stratégies spécifiques selon le type
                switch (config.type) {
                    case 'ZONE_CONFUSION':
                        strategy = this.transformationFactory.createStrategy(config.type) ??
                            this.transformationFactory.createDefaultStrategy();
                        break;

                    case 'REFERENCE_VIOLATION':
                        strategy = new ReferenceTransformationStrategy();
                        break;

                    case 'REDUCED_SPACE':
                        strategy = new ScaleTransformationStrategy();
                        break;

                    case 'RANDOM_PLACEMENT':
                        strategy = new PlacementTransformationStrategy();
                        break;

                    case 'LOCATION_OMISSION':
                        strategy = new LocationTransformationStrategy();
                        break;

                    default:
                        this.logger.warn(`Type de stratégie non reconnu: ${config.type}, utilisation de la stratégie par défaut`);
                        strategy = this.transformationFactory.createDefaultStrategy();
                }

                strategies.set(config.type, strategy);
                this.logger.debug(`Stratégie ${config.type} initialisée avec succès`);

            } catch (error) {
                this.logger.error(`Erreur lors de l'initialisation de la stratégie ${config.type}:`, error);
                strategies.set(config.type, this.transformationFactory.createDefaultStrategy());
            }
        }

        return strategies;
    }

    /**
     * Applique une transformation spécifique d'espace syntaxique
     * @param content Contenu LSF à modifier
     * @param transform Transformation à appliquer
     * @override
     */
    protected applySpecificTransformation(
        content: Record<string, unknown>,
        transform: ErrorTransformation
    ): void {
        const space = this.getTargetParameter(content);

        if (!this.isValidSpaceParameter(space)) {
            this.logger.warn('Paramètre d\'espace invalide ou manquant');
            return;
        }

        try {
            const extendedSpace = this.convertToExtendedSpace(space);
            const context = this.createTransformationContext(transform, extendedSpace);

            this.executeTransformation(extendedSpace, transform, context);
            this.updateOriginalSpace(content, extendedSpace);
            this.recordTransformationMetrics(transform, context);

        } catch (error) {
            this.logger.error('Erreur lors de l\'application de la transformation:', error);
            throw error;
        }
    }

    /**
     * Valide le paramètre d'espace
     * @param space Paramètre d'espace à valider
     * @returns true si le paramètre est valide
     * @private
     */
    private isValidSpaceParameter(space: LSFSpaceParameter | undefined): space is LSFSpaceParameter {
        return Boolean(space && this.validator.isValidSpace(space as ExtendedLSFSpaceParameter));
    }

    /**
     * Convertit un paramètre d'espace en paramètre étendu
     * @param space Paramètre d'espace original
     * @returns Paramètre d'espace étendu
     * @private
     */
    private convertToExtendedSpace(space: LSFSpaceParameter): ExtendedLSFSpaceParameter {
        // Vérifie d'abord si c'est déjà un paramètre étendu
        if (isExtendedLSFSpaceParameter(space)) {
            return space;
        }

        // Créer un objet compatible avec Record<string, unknown> en copiant les propriétés
        const spaceRecord: Record<string, unknown> = {};

        // Copie explicite de chaque propriété pour éviter les problèmes de type
        if (space.accuracy !== undefined) spaceRecord.accuracy = space.accuracy;
        if (space.scale !== undefined) spaceRecord.scale = space.scale;
        if (space.zoneConfusion !== undefined) spaceRecord.zoneConfusion = space.zoneConfusion;
        if (space.referenceConsistency !== undefined) spaceRecord.referenceConsistency = space.referenceConsistency;
        if (space.randomPlacement !== undefined) spaceRecord.randomPlacement = space.randomPlacement;
        if (space.locationOmission !== undefined) spaceRecord.locationOmission = space.locationOmission;
        if (space.ambiguousReference !== undefined) spaceRecord.ambiguousReference = space.ambiguousReference;
        if (space.referenceOmission !== undefined) spaceRecord.referenceOmission = space.referenceOmission;
        if (space.pronounConfusion !== undefined) spaceRecord.pronounConfusion = space.pronounConfusion;
        if (space.spatialReorganization !== undefined) spaceRecord.spatialReorganization = space.spatialReorganization;

        // Utilise le convertisseur de type pour créer le paramètre étendu
        return LSFTypeConverter.toExtended(spaceRecord);
    }

    /**
     * Enregistre les métriques de transformation
     * @param transform Transformation appliquée
     * @param context Contexte de transformation
     * @private
     */
    private recordTransformationMetrics(
        transform: ErrorTransformation,
        context: SpaceTransformationContext
    ): void {
        this.metricsCollector.recordTransformation(
            transform.type ?? 'UNKNOWN',
            context
        );
    }

    /**
     * Met à jour l'espace original avec les modifications de l'espace étendu
     * @param content Contenu LSF original
     * @param extendedSpace Espace étendu modifié
     * @private
     */
    private updateOriginalSpace(
        content: Record<string, unknown>,
        extendedSpace: ExtendedLSFSpaceParameter
    ): void {
        const parameters = content.parameters as LSFParameters | undefined;
        if (!parameters?.space) {
            this.logger.warn('Impossible de mettre à jour l\'espace original: paramètres manquants');
            return;
        }

        // Copie sélective des propriétés modifiées
        const updatedProperties: Partial<LSFSpaceParameter> = {
            accuracy: extendedSpace.accuracy,
            scale: extendedSpace.scale,
            ...(extendedSpace.zoneConfusion !== undefined && { zoneConfusion: extendedSpace.zoneConfusion }),
            ...(extendedSpace.referenceConsistency !== undefined && { referenceConsistency: extendedSpace.referenceConsistency }),
            ...(extendedSpace.randomPlacement !== undefined && { randomPlacement: extendedSpace.randomPlacement }),
            ...(extendedSpace.locationOmission !== undefined && { locationOmission: extendedSpace.locationOmission })
        };

        Object.assign(parameters.space, updatedProperties);
    }

    /**
     * Crée le contexte de transformation
     * @param transform Transformation à appliquer
     * @param space Paramètre d'espace étendu
     * @returns Contexte de transformation
     * @private
     */
    private createTransformationContext(
        transform: ErrorTransformation,
        space: ExtendedLSFSpaceParameter
    ): SpaceTransformationContext {
        return {
            transformationType: transform.type ?? 'UNKNOWN',
            severity: this.errorCategory.defaultTransformation.severity,
            factor: transform.factor,
            originalAccuracy: space.accuracy ?? 1,
            linguisticContext: this.extractLinguisticContext(space),
            preserveSemantics: true
        };
    }

    /**
     * Exécute la transformation appropriée
     * @param space Paramètre d'espace étendu
     * @param transform Transformation à appliquer
     * @param context Contexte de transformation
     * @private
     */
    private executeTransformation(
        space: ExtendedLSFSpaceParameter,
        transform: ErrorTransformation,
        context: SpaceTransformationContext
    ): void {
        const transformationType = transform.type ?? 'DEFAULT';
        const strategy = this.strategies.get(transformationType);

        if (!strategy) {
            this.logger.warn(`Stratégie inconnue: ${transformationType}`);
            this.applyFallbackTransformation(space, context);
            return;
        }

        if (!strategy.validate(space)) {
            this.logger.warn(`Validation échouée pour la transformation ${transformationType}`);
            this.applyFallbackTransformation(space, context);
            return;
        }

        try {
            strategy.apply(space, context);
            this.logger.debug(
                `Transformation ${transformationType} appliquée avec succès. Impact: ${strategy.getImpactScore()}`
            );
        } catch (error) {
            this.logger.error(`Erreur lors de l'application de la stratégie ${transformationType}:`, error);
            this.applyFallbackTransformation(space, context);
        }
    }

    /**
     * Applique une transformation de repli
     * @param space Paramètre d'espace étendu
     * @param context Contexte de transformation
     * @private
     */
    private applyFallbackTransformation(
        space: ExtendedLSFSpaceParameter,
        context: SpaceTransformationContext
    ): void {
        const fallbackReduction = Math.min(0.4, context.severity);
        const currentAccuracy = space.accuracy ?? 1;
        space.accuracy = Math.max(0, currentAccuracy - fallbackReduction);

        this.logger.debug(
            `Transformation de repli appliquée. Précision réduite de ${currentAccuracy} à ${space.accuracy}`
        );
    }

    /**
     * Applique la transformation par défaut pour les erreurs d'espace syntaxique
     * @param content Contenu LSF à modifier
     * @override
     */
    protected applySpecificDefaultTransformation(
        content: Record<string, unknown>
    ): void {
        const space = this.getTargetParameter(content);

        if (!this.isValidSpaceParameter(space)) {
            this.logger.warn('Impossible d\'appliquer la transformation par défaut: paramètre d\'espace invalide');
            return;
        }

        try {
            const extendedSpace = this.convertToExtendedSpace(space);
            const context = this.createDefaultTransformationContext(extendedSpace);
            const defaultStrategy = this.transformationFactory.createDefaultStrategy();

            defaultStrategy.apply(extendedSpace, context);
            this.updateOriginalSpace(content, extendedSpace);

            this.logger.debug(
                `Transformation par défaut appliquée. Précision d'espace syntaxique: ${extendedSpace.accuracy}`
            );
        } catch (error) {
            this.logger.error('Erreur lors de l\'application de la transformation par défaut:', error);
            throw error;
        }
    }

    /**
     * Crée le contexte de transformation par défaut
     * @param space Paramètre d'espace étendu
     * @returns Contexte de transformation par défaut
     * @private
     */
    private createDefaultTransformationContext(space: ExtendedLSFSpaceParameter): SpaceTransformationContext {
        return {
            transformationType: 'DEFAULT_DEGRADATION',
            severity: this.errorCategory.defaultTransformation.severity,
            originalAccuracy: space.accuracy ?? 1,
            linguisticContext: this.extractLinguisticContext(space),
            preserveSemantics: true
        };
    }

    /**
     * Extrait le contexte linguistique de l'espace
     * @param space Paramètre d'espace étendu
     * @returns Contexte linguistique
     * @private
     */
    private extractLinguisticContext(space: ExtendedLSFSpaceParameter): Record<string, unknown> {
        return {
            hasReferentialElements: Boolean(space.referenceConsistency),
            spatialComplexity: this.calculateSpatialComplexity(space),
            semanticDensity: this.calculateSemanticDensity(space)
        };
    }

    /**
     * Calcule la complexité spatiale
     * @param space Paramètre d'espace étendu
     * @returns Score de complexité spatiale entre 0 et 1
     * @private
     */
    private calculateSpatialComplexity(space: ExtendedLSFSpaceParameter): number {
        let complexity = 0;

        if (space.zoneConfusion) complexity += 0.3;
        if (space.randomPlacement) complexity += 0.4;
        if (space.locationOmission) complexity += 0.2;
        if (space.scale && space.scale < 0.8) complexity += 0.1;

        return Math.min(1, complexity);
    }

    /**
     * Calcule la densité sémantique
     * @param space Paramètre d'espace étendu
     * @returns Score de densité sémantique entre 0 et 1
     * @private
     */
    private calculateSemanticDensity(space: ExtendedLSFSpaceParameter): number {
        const accuracy = space.accuracy ?? 1;
        const referenceWeight = space.referenceConsistency ? 0.3 : 0;
        const spatialWeight = (space.scale ?? 1) * 0.7;

        return accuracy * (referenceWeight + spatialWeight);
    }

    /**
     * Obtient le paramètre d'espace dans le contenu LSF
     * @param content Contenu LSF
     * @returns Le paramètre d'espace ou undefined s'il n'existe pas
     * @override
     */
    protected getTargetParameter(content: Record<string, unknown>): LSFSpaceParameter | undefined {
        const parameters = content.parameters as LSFParameters | undefined;
        return parameters?.space;
    }

    /**
     * Obtient les métriques de transformation collectées
     * @returns Métriques de transformation
     */
    public getTransformationMetrics(): Record<string, unknown> {
        return this.metricsCollector.getMetrics();
    }

    /**
     * Réinitialise les métriques collectées
     */
    public resetMetrics(): void {
        this.metricsCollector.reset();
    }

    /**
     * Obtient la liste des stratégies disponibles
     * @returns Configuration des stratégies disponibles
     */
    public getAvailableStrategies(): ReadonlyArray<StrategyConfig> {
        return this.strategyConfigs;
    }

    /**
     * Vérifie si une stratégie est disponible
     * @param strategyType Type de stratégie à vérifier
     * @returns true si la stratégie est disponible
     */
    public hasStrategy(strategyType: string): boolean {
        return this.strategies.has(strategyType);
    }
}