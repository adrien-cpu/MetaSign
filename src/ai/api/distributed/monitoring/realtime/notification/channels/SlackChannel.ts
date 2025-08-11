/**
 * Système de cache pour les threads de messages
 * Permet de suivre les conversations/threads pour regrouper les messages liés
 */
import { Logger } from '@common/monitoring/LogService';

/**
 * Entrée de cache pour un thread
 */
interface ThreadCacheEntry {
    /** Identifiant du thread (timestamp) */
    threadTs: string;
    /** Timestamp de la dernière mise à jour du thread */
    lastUpdate: number;
}

/**
 * Cache pour les threads de messages
 * Garde une trace des threads actifs pour regrouper les alertes liées
 */
export class ThreadCache {
    /** Période de validité des entrées de cache en ms */
    private readonly windowMs: number;

    /** Cache des threads actifs */
    private readonly cache: Map<string, ThreadCacheEntry> = new Map();

    /** Logger */
    private readonly logger: Logger;

    /** Timer pour le nettoyage périodique du cache */
    private cleanupTimer?: NodeJS.Timeout;

    /**
     * Crée une nouvelle instance de cache de threads
     * @param windowMs Période de validité des entrées en ms (défaut: 30 minutes)
     * @param logger Logger
     */
    constructor(windowMs: number = 30 * 60 * 1000, logger: Logger = new Logger('ThreadCache')) {
        this.windowMs = windowMs;
        this.logger = logger;

        // Configurer le nettoyage périodique
        this.setupCleanupInterval();
    }

    /**
     * Configure l'intervalle de nettoyage du cache
     * @private
     */
    private setupCleanupInterval(): void {
        // Nettoyer les entrées expirées toutes les 5 minutes ou un tiers de la fenêtre
        const cleanupInterval = Math.min(5 * 60 * 1000, this.windowMs / 3);

        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, cleanupInterval);
    }

    /**
     * Stocke un thread dans le cache
     * @param key Clé d'identification du thread
     * @param threadTs Timestamp du message de thread
     */
    public storeThread(key: string, threadTs: string): void {
        this.cache.set(key, {
            threadTs,
            lastUpdate: Date.now()
        });

        this.logger.debug(`Thread stocké dans le cache: ${key} -> ${threadTs}`);
    }

    /**
     * Récupère un thread du cache s'il est encore valide
     * @param key Clé d'identification du thread
     * @returns Timestamp du thread ou undefined si non trouvé ou expiré
     */
    public getThread(key: string): string | undefined {
        const entry = this.cache.get(key);

        if (!entry) {
            return undefined;
        }

        // Vérifier si l'entrée est expirée
        const now = Date.now();
        if (now - entry.lastUpdate > this.windowMs) {
            this.cache.delete(key);
            this.logger.debug(`Thread expiré supprimé du cache: ${key}`);
            return undefined;
        }

        // Mettre à jour le timestamp de dernière utilisation
        entry.lastUpdate = now;
        this.cache.set(key, entry);

        this.logger.debug(`Thread récupéré du cache: ${key} -> ${entry.threadTs}`);
        return entry.threadTs;
    }

    /**
     * Nettoie les entrées expirées du cache
     */
    public cleanup(): void {
        const now = Date.now();
        let expiredCount = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.lastUpdate > this.windowMs) {
                this.cache.delete(key);
                expiredCount++;
            }
        }

        if (expiredCount > 0) {
            this.logger.debug(`Nettoyage du cache: ${expiredCount} thread(s) expiré(s) supprimé(s)`);
        }
    }

    /**
     * Efface toutes les entrées du cache
     */
    public clear(): void {
        const size = this.cache.size;
        this.cache.clear();
        this.logger.debug(`Cache vidé: ${size} entrée(s) supprimée(s)`);
    }

    /**
     * Arrête le nettoyage périodique du cache
     */
    public dispose(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = undefined;
        }
    }

    /**
     * Récupère le nombre d'entrées dans le cache
     */
    public get size(): number {
        return this.cache.size;
    }
}