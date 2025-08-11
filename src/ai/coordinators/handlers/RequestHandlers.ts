/**
 * @file: src/ai/coordinators/handlers/RequestHandlers.ts
 * 
 * Classes de gestionnaires de requêtes pour SystemeOrchestrateurCentral
 * Extrait la logique de traitement spécifique à chaque type de requête
 */

import { Logger } from '@ai/utils/Logger';
import {
    LSFRequest,
    OrchestrationResult
} from '@ai/coordinators/types/orchestrator.types';
import {
    RequestProcessingError,
    OrchestrationError
} from '@ai/coordinators/errors/orchestrator.errors';
import { MetricsCollector } from '@ai/coordinators/services/MetricsCollector';
import { IACore } from '@ai/base/IACore';
import { SystemeExpressions } from '@ai/systems/SystemeExpressions';
import { SystemeControleEthique } from '@ai/ethics/core/SystemeControleEthique';
import { GestionVariantesDiatopiques } from '@ai/cultural/GestionVariantesDiatopiques';
import { ValidationCollaborative } from '@ai/validation/ValidationCollaborative';
import { GestionEspaceSpatial } from '@ai/spatial/GestionEspaceSpatial';
import { LearningSystem } from '@ai/learning/LearningSystem';

/**
 * Classe de base pour tous les gestionnaires de requêtes
 */
export abstract class BaseRequestHandler<T> {
    protected readonly logger = Logger.getInstance('RequestHandler');
    protected componentsUsed: string[] = [];
    protected processingPath: string[] = [];
    protected startTime: number;

    constructor(
        protected readonly iaCore: IACore,
        protected readonly ethicsSystem: SystemeControleEthique,
        protected readonly expressionsSystem: SystemeExpressions,
        protected readonly dialectSystem: GestionVariantesDiatopiques,
        protected readonly validationSystem: ValidationCollaborative,
        protected readonly spatialSystem: GestionEspaceSpatial,
        protected readonly learningSystem: LearningSystem | null,
        protected readonly performanceMetrics: MetricsCollector
    ) {
        this.startTime = Date.now();
    }

    /**
     * Méthode principale de traitement des requêtes
     * @param request Requête à traiter
     */
    public abstract process(request: LSFRequest): Promise<OrchestrationResult<T>>;

    /**
     * Crée un résultat de succès
     */
    protected createSuccessResult(
        data: T,
        componentsUsed: string[] = this.componentsUsed,
        processingPath: string[] = this.processingPath
    ): OrchestrationResult<T> {
        const executionTime = Date.now() - this.startTime;

        return {
            success: true,
            data,
            metrics: {
                executionTime,
                cacheUsed: false,
                componentsUsed,
                path: processingPath,
                timestamp: Date.now()
            }
        };
    }

    /**
     * Crée un résultat d'erreur
     */
    protected createErrorResult(
        error: string,
        componentsUsed: string[] = this.componentsUsed,
        processingPath: string[] = this.processingPath,
        errorCode: string = 'UNKNOWN_ERROR'
    ): OrchestrationResult<T> {
        const executionTime = Date.now() - this.startTime;

        return {
            success: false,
            data: null as unknown as T,
            error,
            errorCode,
            metrics: {
                executionTime,
                cacheUsed: false,
                componentsUsed,
                path: processingPath,
                timestamp: Date.now()
            }
        };
    }
}

/**
 * Gestionnaire pour les requêtes de traduction
 */
export class TranslationRequestHandler extends BaseRequestHandler<unknown> {
    public async process(request: LSFRequest): Promise<OrchestrationResult<unknown>> {
        this.logger.info('Handling translation request', {
            modality: request.modality,
            userId: request.userId
        });
        this.processingPath.push('translation_request');

        // Enregistrer les métriques de début
        const translationStartTime = Date.now();
        this.performanceMetrics.recordMetric('translation_requests', 1);

        try {
            // Traitement par le noyau IA
            this.componentsUsed.push('iaCore');
            this.processingPath.push('ia_core_processing');

            const translationInput = {
                type: 'translation',
                text: request.data,
                outputModality: request.modality,
                context: request.context
            };

            const translationResult = await this.iaCore.process(translationInput);

            // Enregistrer les métriques
            this.performanceMetrics.recordMetric('ia_core_processing_time', Date.now() - translationStartTime);

            // Si c'est une traduction LSF, appliquer les ajustements dialectaux
            if (request.modality === 'lsf') {
                this.componentsUsed.push('dialectSystem');
                this.processingPath.push('dialect_adaptation');

                // Adapter selon la variante dialectale si spécifiée
                const dialectVariant = typeof request.data === 'object' &&
                    request.data !== null &&
                    'dialectVariant' in request.data ?
                    String(request.data.dialectVariant) : 'STANDARD';

                const dialectStartTime = Date.now();

                // Adapte la traduction à la variante dialectale
                const adaptedResult = await this.dialectSystem.adaptToVariant(
                    dialectVariant,
                    translationResult
                );

                // Enregistrer les métriques
                this.performanceMetrics.recordMetric('dialect_adaptation_time', Date.now() - dialectStartTime);
                this.performanceMetrics.recordMetric('total_translation_time', Date.now() - translationStartTime);

                return this.createSuccessResult(adaptedResult);
            }

            // Enregistrer les métriques finales
            this.performanceMetrics.recordMetric('total_translation_time', Date.now() - translationStartTime);

            return this.createSuccessResult(translationResult);
        } catch (error) {
            // Enregistrer l'erreur
            this.performanceMetrics.recordMetric('translation_errors', 1);

            throw new RequestProcessingError(
                request.sessionId,
                'translation',
                error
            );
        }
    }
}

/**
 * Gestionnaire pour les requêtes d'expression
 */
export class ExpressionRequestHandler extends BaseRequestHandler<unknown> {
    public async process(request: LSFRequest): Promise<OrchestrationResult<unknown>> {
        this.logger.info('Handling expression request', { userId: request.userId });
        this.processingPath.push('expression_request');

        // Enregistrer les métriques de début
        const expressionStartTime = Date.now();
        this.performanceMetrics.recordMetric('expression_requests', 1);

        try {
            // Validation par le système d'éthique
            this.componentsUsed.push('ethicsSystem');
            this.processingPath.push('ethics_validation');

            const ethicsStart = Date.now();
            await this.ethicsSystem.validateContentExpression(request.data);
            this.performanceMetrics.recordMetric('ethics_validation_time', Date.now() - ethicsStart);

            // Traitement par le système d'expressions
            this.componentsUsed.push('expressionsSystem');
            this.processingPath.push('expression_processing');

            const expressionProcessingStart = Date.now();

            // Utiliser une conversion de type sécurisée
            const expressionResult = await this.expressionsSystem.applyExpression(request.data);

            this.performanceMetrics.recordMetric('expression_processing_time', Date.now() - expressionProcessingStart);

            // Si validation collaborative requise
            if (request.data &&
                typeof request.data === 'object' &&
                request.data !== null &&
                'requireValidation' in request.data &&
                Boolean(request.data.requireValidation)) {
                this.componentsUsed.push('validationSystem');
                this.processingPath.push('collaborative_validation');

                const validationStart = Date.now();

                await this.validationSystem.submitForValidation({
                    id: `expr_val_${Date.now()}`,
                    type: 'expression_validation',
                    content: expressionResult,
                    requester: request.userId,
                    requiresNativeValidation: true,
                    minFeedbackRequired: 2,
                    deadline: Date.now() + 48 * 60 * 60 * 1000 // 48h
                });

                this.performanceMetrics.recordMetric('collaborative_validation_time', Date.now() - validationStart);
            }

            // Si apprentissage activé
            if (this.learningSystem && request.data &&
                typeof request.data === 'object' &&
                request.data !== null &&
                'enableLearning' in request.data &&
                Boolean(request.data.enableLearning)) {
                this.componentsUsed.push('learningSystem');
                this.processingPath.push('learning_integration');

                const learningStart = Date.now();

                this.learningSystem.recordInteraction({
                    type: 'expression',
                    data: request.data,
                    result: expressionResult,
                    userId: request.userId,
                    timestamp: Date.now()
                });

                this.performanceMetrics.recordMetric('learning_integration_time', Date.now() - learningStart);
            }

            // Enregistrer les métriques finales
            this.performanceMetrics.recordMetric('total_expression_time', Date.now() - expressionStartTime);

            return this.createSuccessResult(expressionResult);
        } catch (error) {
            // Enregistrer l'erreur
            this.performanceMetrics.recordMetric('expression_errors', 1);

            throw new RequestProcessingError(
                request.sessionId,
                'expression',
                error
            );
        }
    }
}

/**
 * Gestionnaire pour les requêtes d'analyse
 */
export class AnalysisRequestHandler extends BaseRequestHandler<unknown> {
    public async process(request: LSFRequest): Promise<OrchestrationResult<unknown>> {
        this.logger.info('Handling analysis request', { userId: request.userId });
        this.processingPath.push('analysis_request');

        // Enregistrer les métriques de début
        const analysisStartTime = Date.now();
        this.performanceMetrics.recordMetric('analysis_requests', 1);

        try {
            // Traitement par le noyau IA
            this.componentsUsed.push('iaCore');
            this.processingPath.push('ia_core_analysis');

            // Différentes analyses selon les métadonnées
            if (request.data &&
                typeof request.data === 'object' &&
                request.data !== null &&
                'analysisType' in request.data) {
                const analysisType = String(request.data.analysisType);

                this.logger.debug('Processing specialized analysis', { analysisType });

                switch (analysisType) {
                    case 'spatial': {
                        this.componentsUsed.push('spatialSystem');
                        this.processingPath.push('spatial_analysis');

                        const spatialStart = Date.now();
                        const spatialResult = await this.spatialSystem.analyze(request.data);
                        this.performanceMetrics.recordMetric('spatial_analysis_time', Date.now() - spatialStart);

                        return this.createSuccessResult(spatialResult);
                    }

                    case 'dialectal': {
                        this.componentsUsed.push('dialectSystem');
                        this.processingPath.push('dialectal_analysis');

                        const dialectStart = Date.now();
                        const dialectalResult = await this.dialectSystem.analyzeVariant(request.data);
                        this.performanceMetrics.recordMetric('dialectal_analysis_time', Date.now() - dialectStart);

                        return this.createSuccessResult(dialectalResult);
                    }

                    default: {
                        // Analyse générique par l'IA Core
                        const iaCoreStart = Date.now();
                        const analysisResult = await this.iaCore.process({
                            type: 'analysis',
                            data: request.data
                        });
                        this.performanceMetrics.recordMetric('generic_analysis_time', Date.now() - iaCoreStart);

                        return this.createSuccessResult(analysisResult);
                    }
                }
            }

            // Analyse par défaut
            const defaultStart = Date.now();
            const defaultResult = await this.iaCore.process({
                type: 'analysis',
                data: request.data
            });
            this.performanceMetrics.recordMetric('default_analysis_time', Date.now() - defaultStart);

            // Enregistrer les métriques finales
            this.performanceMetrics.recordMetric('total_analysis_time', Date.now() - analysisStartTime);

            return this.createSuccessResult(defaultResult);
        } catch (error) {
            // Enregistrer l'erreur
            this.performanceMetrics.recordMetric('analysis_errors', 1);

            throw new RequestProcessingError(
                request.sessionId,
                'analysis',
                error
            );
        }
    }
}

/**
 * Factory pour créer les gestionnaires de requêtes appropriés
 */
export class RequestHandlerFactory {
    /**
     * Crée un gestionnaire pour le type de requête spécifié
     */
    public static createHandler<T>(
        request: LSFRequest,
        iaCore: IACore,
        ethicsSystem: SystemeControleEthique,
        expressionsSystem: SystemeExpressions,
        dialectSystem: GestionVariantesDiatopiques,
        validationSystem: ValidationCollaborative,
        spatialSystem: GestionEspaceSpatial,
        learningSystem: LearningSystem | null,
        performanceMetrics: MetricsCollector
    ): BaseRequestHandler<T> {
        // Choisir le gestionnaire approprié en fonction du type de requête
        switch (request.type) {
            case 'TRANSLATION':
                return new TranslationRequestHandler(
                    iaCore,
                    ethicsSystem,
                    expressionsSystem,
                    dialectSystem,
                    validationSystem,
                    spatialSystem,
                    learningSystem,
                    performanceMetrics
                ) as unknown as BaseRequestHandler<T>;

            case 'EXPRESSION':
                return new ExpressionRequestHandler(
                    iaCore,
                    ethicsSystem,
                    expressionsSystem,
                    dialectSystem,
                    validationSystem,
                    spatialSystem,
                    learningSystem,
                    performanceMetrics
                ) as unknown as BaseRequestHandler<T>;

            case 'ANALYSIS':
                return new AnalysisRequestHandler(
                    iaCore,
                    ethicsSystem,
                    expressionsSystem,
                    dialectSystem,
                    validationSystem,
                    spatialSystem,
                    learningSystem,
                    performanceMetrics
                ) as unknown as BaseRequestHandler<T>;

            default:
                throw new OrchestrationError(
                    request.type.toString(),
                    { message: `No handler for request type: ${request.type}` }
                );
        }
    }
}