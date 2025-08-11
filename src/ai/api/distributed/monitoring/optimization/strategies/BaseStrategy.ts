/**
 * Classe de base pour toutes les stratégies d'optimisation
 * @file src/ai/api/distributed/monitoring/optimization/strategies/BaseStrategy.ts
 */
import { Logger } from '@api/common/monitoring/LogService';
import { CacheEvictionStrategy } from '../types/optimization.types';
import { Strategy } from './Strategy';

/**
 * Classe abstraite servant de base pour toutes les stratégies d'optimisation
 */
export abstract class BaseStrategy implements Strategy {
    protected readonly logger: Logger;
    protected config: Record<string, unknown>;
    public readonly type: CacheEvictionStrategy;

    /**
     * Initialise une nouvelle stratégie de base
     * @param type Type de la stratégie
     */
    constructor(type: CacheEvictionStrategy) {
        this.type = type;
        this.logger = new Logger(`${type}Strategy`);
        this.config = {};
    }

    /**
     * Méthode abstraite à implémenter par les stratégies concrètes
     */
    public abstract apply(): Promise<void>;

    /**
     * Récupère la configuration actuelle
     */
    public getConfig(): Record<string, unknown> {
        return { ...this.config };
    }

    /**
     * Met à jour la configuration
     * @param newConfig Nouvelle configuration à appliquer
     */
    public updateConfig(newConfig: Record<string, unknown>): void {
        this.config = { ...this.config, ...newConfig };
        this.logger.debug(`Strategy ${this.type} configuration updated`);
    }

    /**
     * Enregistre le début de l'application de la stratégie
     * @protected
     */
    protected logStart(): void {
        this.logger.info(`Applying ${this.type} optimization strategy`);
    }

    /**
     * Enregistre la fin de l'application de la stratégie
     * @protected
     */
    protected logCompletion(): void {
        this.logger.info(`Successfully applied ${this.type} optimization strategy`);
    }
}