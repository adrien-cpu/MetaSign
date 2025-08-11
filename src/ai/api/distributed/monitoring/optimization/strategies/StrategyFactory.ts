/**
 * Fabrique de stratégies d'optimisation de cache
 * @file src/ai/api/distributed/monitoring/optimization/strategies/StrategyFactory.ts
 */
import { CacheEvictionStrategy, CacheOptimizationStrategy } from '../types/optimization.types';
import { LRUStrategy } from './LRUStrategy';
import { LFUStrategy } from './LFUStrategy';
import { FIFOStrategy } from './FIFOStrategy';
import { SizeStrategy } from './SizeStrategy';
import { AdaptiveStrategy } from './AdaptiveStrategy';
import { Logger } from '@api/common/monitoring/LogService';
import { Strategy } from './Strategy';

/**
 * Fabrique responsable de créer les stratégies d'optimisation de cache appropriées
 */
export class StrategyFactory {
    private readonly logger: Logger;

    /**
     * Construit une nouvelle fabrique de stratégies
     */
    constructor() {
        this.logger = new Logger('StrategyFactory');
    }

    /**
     * Crée une stratégie d'optimisation de cache basée sur le type spécifié
     * @param strategy Type de la stratégie d'éviction
     * @returns La stratégie d'optimisation concrète appropriée
     */
    public createStrategy(strategy: CacheEvictionStrategy): CacheOptimizationStrategy {
        this.logger.debug(`Creating cache optimization strategy: ${strategy}`);

        switch (strategy) {
            case CacheEvictionStrategy.LRU:
                return this.wrapStrategy(new LRUStrategy(), CacheEvictionStrategy.LRU);

            case CacheEvictionStrategy.LFU:
                return this.wrapStrategy(new LFUStrategy(), CacheEvictionStrategy.LFU);

            case CacheEvictionStrategy.FIFO:
                return this.wrapStrategy(new FIFOStrategy(), CacheEvictionStrategy.FIFO);

            case CacheEvictionStrategy.SIZE:
                return this.wrapStrategy(new SizeStrategy(), CacheEvictionStrategy.SIZE);

            case CacheEvictionStrategy.ADAPTIVE:
                return this.wrapStrategy(new AdaptiveStrategy(), CacheEvictionStrategy.ADAPTIVE);

            default:
                this.logger.warn(`Unknown strategy type: ${strategy}, falling back to LRU`);
                return this.wrapStrategy(new LRUStrategy(), CacheEvictionStrategy.LRU);
        }
    }

    /**
     * Enveloppe une stratégie concrète avec l'interface CacheOptimizationStrategy
     * @param strategy La stratégie concrète à envelopper
     * @param strategyType Le type de stratégie
     * @returns Une stratégie conforme à l'interface CacheOptimizationStrategy
     */
    private wrapStrategy<T extends Strategy>(
        concreteStrategy: T,
        strategyType: CacheEvictionStrategy
    ): CacheOptimizationStrategy {
        // Crée un adaptateur qui implémente l'interface CacheOptimizationStrategy
        const strategyAdapter: CacheOptimizationStrategy = {
            type: strategyType,

            // Implémentation de la méthode apply
            apply: async (): Promise<void> => {
                if (typeof concreteStrategy.apply === 'function') {
                    return concreteStrategy.apply();
                }
                this.logger.warn(`Strategy ${strategyType} does not implement apply method`);
                return Promise.resolve();
            },

            // Gestion de la configuration
            getConfig: (): Record<string, unknown> => {
                if (typeof concreteStrategy.getConfig === 'function') {
                    return concreteStrategy.getConfig();
                }
                return {};
            },

            updateConfig: (newConfig: Record<string, unknown>): void => {
                if (typeof concreteStrategy.updateConfig === 'function') {
                    concreteStrategy.updateConfig(newConfig);
                } else {
                    this.logger.warn(`Strategy ${strategyType} does not implement updateConfig method`);
                }
            }
        };

        return strategyAdapter;
    }
}