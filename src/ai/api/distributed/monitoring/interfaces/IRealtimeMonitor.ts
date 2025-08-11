/**
 * @file src/ai/api/distributed/monitoring/interfaces/IRealtimeMonitor.ts
 * Interface pour les moniteurs temps réel
 * Définit le contrat de base pour tous les moniteurs
 */
export interface IRealtimeMonitor {
    /**
     * Démarre le moniteur avec une configuration optionnelle
     * @param config Configuration optionnelle
     */
    start(config?: unknown): Promise<void>;

    /**
     * Arrête le moniteur
     */
    stop(): void;

    /**
     * Vérifie si le moniteur est en cours d'exécution
     * @returns true si le moniteur est actif, false sinon
     */
    isRunning(): boolean;
}