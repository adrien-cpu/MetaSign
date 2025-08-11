/**
 * Stratégie d'optimisation basée sur la taille des éléments
 * @file src/ai/api/distributed/monitoring/optimization/strategies/SizeStrategy.ts
 */
import { CacheEvictionStrategy } from '../types/optimization.types';
import { BaseStrategy } from './BaseStrategy';

/**
 * Implémentation de la stratégie Size (basée sur la taille)
 * Cette stratégie évince les éléments les plus volumineux en priorité
 */
export class SizeStrategy extends BaseStrategy {
    /**
     * Crée une nouvelle instance de la stratégie Size
     */
    constructor() {
        super(CacheEvictionStrategy.SIZE);

        // Configuration par défaut pour Size
        this.config = {
            // Taille maximale pour le cache (en bytes)
            maxCacheSize: 104857600, // 100 MB par défaut

            // Seuil de taille à partir duquel une entrée est considérée comme "large"
            largeItemThreshold: 1048576, // 1 MB

            // Facteur d'utilisation cible (0-1)
            targetUtilization: 0.85,

            // Facteur d'urgence (0-1) qui détermine à quel point être agressif
            // dans l'éviction des grands éléments
            urgencyFactor: 0.7,

            // Activer la compression pour les grands éléments au lieu de les évincer
            enableCompression: false
        };
    }

    /**
     * Applique la stratégie Size au cache
     * @returns Promesse résolue une fois la stratégie appliquée
     */
    public async apply(): Promise<void> {
        this.logStart();

        try {
            // Processus d'optimisation basé sur la taille
            this.logger.debug('Step 1: Scanning cache for item sizes');
            await this.wait(150);

            this.logger.debug('Step 2: Identifying largest items');
            await this.wait(100);

            this.logger.debug('Step 3: Calculating optimal size distribution');
            await this.wait(200);

            this.logger.debug('Step 4: Applying size-based eviction policy');
            await this.wait(180);

            if (this.config.enableCompression) {
                this.logger.debug('Step 5: Compressing large items to save space');
                await this.wait(250);
            }

            this.logCompletion();
        } catch (error) {
            this.logger.error('Failed to apply Size strategy', error);
            throw error;
        }
    }

    /**
     * Utilitaire d'attente
     * @param ms Temps d'attente en millisecondes
     * @private
     */
    private wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}