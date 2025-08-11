/**
 * Interface de base pour toutes les stratégies d'optimisation
 * @file src/ai/api/distributed/monitoring/optimization/strategies/Strategy.ts
 */
import { CacheEvictionStrategy } from '../types/optimization.types';

/**
 * Interface commune pour toutes les stratégies d'optimisation
 */
export interface Strategy {
    /**
     * Type de la stratégie
     */
    readonly type: CacheEvictionStrategy;

    /**
     * Applique la stratégie d'optimisation
     * @returns Promesse résolue une fois la stratégie appliquée
     */
    apply(): Promise<void>;

    /**
     * Récupère la configuration actuelle de la stratégie
     * @returns Configuration actuelle
     */
    getConfig(): Record<string, unknown>;

    /**
     * Met à jour la configuration de la stratégie
     * @param config Nouvelle configuration à appliquer
     */
    updateConfig(config: Record<string, unknown>): void;
}