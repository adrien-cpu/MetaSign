// src/ai/systems/expressions/ExpressionPipeline.ts
import { ExpressionConfig, ExpressionResult, Expression } from '@ai-types/expressions';
import { ExpressionCache } from './cache/ExpressionCache';
import { ExpressionCompressor } from './optimization/ExpressionCompressor';
import { ExpressionScheduler } from './timing/ExpressionScheduler';
import { PerformanceMonitor } from './monitoring/PerformanceMonitor';

/**
 * Pipeline optimisé pour le traitement des expressions LSF
 */
export class ExpressionPipeline {
    private cache: ExpressionCache;
    private compressor: ExpressionCompressor;
    private scheduler: ExpressionScheduler;
    private performanceMonitor: PerformanceMonitor;

    constructor() {
        this.cache = new ExpressionCache();
        this.compressor = new ExpressionCompressor();
        this.scheduler = new ExpressionScheduler();
        this.performanceMonitor = new PerformanceMonitor();
    }

    /**
     * Traite une séquence d'expressions LSF
     * @param expressions Expressions à traiter
     * @param config Configuration du traitement
     */
    public async processExpressions(
        expressions: Expression[],
        config: ExpressionConfig
    ): Promise {
        const startTime = performance.now();

        // Vérifier dans le cache
        const cacheKey = this.generateCacheKey(expressions, config);
        const cachedResult = this.cache.get(cacheKey);

        if (cachedResult) {
            this.performanceMonitor.recordCacheHit(cacheKey);
            return cachedResult;
        }

        // Traitement des expressions
        let processedExpressions = expressions;

        // 1. Prétraitement et compression
        if (config.compress) {
            this.performanceMonitor.startMeasurement('compression');
            processedExpressions = this.compressor.compressExpressions(processedExpressions, config.compressionLevel || 1);
            this.performanceMonitor.endMeasurement('compression');
        }

        // 2. Planification temporelle
        this.performanceMonitor.startMeasurement('scheduling');
        const scheduledExpressions = this.scheduler.scheduleExpressions(processedExpressions, config.timing);
        this.performanceMonitor.endMeasurement('scheduling');

        // 3. Génération du résultat
        this.performanceMonitor.startMeasurement('generation');
        const result: ExpressionResult = {
            frames: this.generateFrames(scheduledExpressions),
            metadata: {
                duration: this.calculateDuration(scheduledExpressions),
                expressionCount: expressions.length,
                optimized: config.compress === true,
                timestamp: Date.now()
            }
        };
        this.performanceMonitor.endMeasurement('generation');

        // Mettre en cache le résultat
        if (config.cache !== false) {
            this.cache.set(cacheKey, result);
        }

        // Enregistrer les performances
        const endTime = performance.now();
        this.performanceMonitor.recordTotalProcessingTime(endTime - startTime);

        return result;
    }

    /**
     * Génère une clé unique pour le cache
     */
    private generateCacheKey(expressions: Expression[], config: ExpressionConfig): string {
        // Créer un identifiant unique basé sur les expressions et la configuration
        return `${JSON.stringify(expressions)}_${JSON.stringify(config)}`;
    }

    /**
     * Génère les frames pour le rendu des expressions
     */
    private generateFrames(scheduledExpressions: Array): unknown[] {
        // Implémentation de la génération des frames d'animation
        // Cette partie dépendrait du format de sortie souhaité

        return scheduledExpressions.map(expr => ({
            id: expr.id,
            start: expr.startTime,
            end: expr.endTime,
            parameters: expr.parameters,
            // Autres données nécessaires au rendu
        }));
    }

    /**
     * Calcule la durée totale d'une séquence d'expressions
     */
    private calculateDuration(scheduledExpressions: Array): number {
        if (scheduledExpressions.length === 0) {
            return 0;
        }

        const lastExpression = scheduledExpressions[scheduledExpressions.length - 1];
        return lastExpression.endTime;
    }

    /**
     * Obtient les métriques de performance du pipeline
     */
    public getPerformanceMetrics(): Record {
        return this.performanceMonitor.getMetrics();
    }

    /**
     * Réinitialise le cache d'expressions
     */
    public clearCache(): void {
        this.cache.clear();
    }
}