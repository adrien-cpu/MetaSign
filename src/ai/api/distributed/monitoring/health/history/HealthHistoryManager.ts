/**
 * Gestion de l'historique de santé et calcul des KPIs
 */
import { SystemHealth } from '@monitoring/health/types/health.types';
import { HealthHistoryEntry, HealthKPIs } from '../types/health-metrics.types';
import { Logger } from '@common/monitoring/LogService';

/**
 * Classe responsable de la gestion de l'historique de santé et du calcul des KPIs
 */
export class HealthHistoryManager {
    private readonly logger = new Logger('HealthHistoryManager');

    // Historique des états de santé
    private healthHistory: Array<HealthHistoryEntry> = [];

    // Taille maximale de l'historique
    private readonly maxHistorySize: number;

    // Indicateurs de performance clés calculés
    private kpis: HealthKPIs = {
        uptime: 100,
        mtbf: 0,
        mttr: 0,
        lastFailure: null,
        failureCount: 0
    };

    /**
     * Constructeur
     * @param maxHistorySize Taille maximale de l'historique à conserver
     */
    constructor(maxHistorySize: number = 1000) {
        this.maxHistorySize = maxHistorySize;
    }

    /**
     * Ajoute une entrée à l'historique de santé
     * @param entry Entrée à ajouter à l'historique
     */
    public addHistoryEntry(entry: HealthHistoryEntry): void {
        this.healthHistory.push(entry);

        // Limiter la taille de l'historique
        if (this.healthHistory.length > this.maxHistorySize) {
            this.healthHistory = this.healthHistory.slice(-this.maxHistorySize);
        }

        // Recalculer les KPIs à chaque nouvelle entrée
        this.calculateKPIs();
    }

    /**
     * Calcule les indicateurs de performance clés
     */
    public calculateKPIs(): void {
        if (this.healthHistory.length < 2) {
            return; // Pas assez de données pour calculer
        }

        const now = Date.now();
        const historyLengthMs = now - this.healthHistory[0].timestamp;

        // Réinitialiser les variables de calcul
        let unhealthyTimeMs = 0;
        let lastTransition = this.healthHistory[0].timestamp;
        let lastStatus = this.healthHistory[0].status;
        let failureCount = 0;
        let lastFailure: number | null = null;
        let totalRecoveryTimeMs = 0;
        let totalTimeBetweenFailuresMs = 0;

        for (let i = 1; i < this.healthHistory.length; i++) {
            const entry = this.healthHistory[i];
            const duration = entry.timestamp - lastTransition;

            // Calcul du temps total en état unhealthy
            if (lastStatus === 'unhealthy') {
                unhealthyTimeMs += duration;

                // Si on passe de unhealthy à autre chose, c'est une récupération
                if (entry.status !== 'unhealthy') {
                    totalRecoveryTimeMs += duration;
                }
            }

            // Si on passe à unhealthy, c'est une nouvelle panne
            if (entry.status === 'unhealthy' && lastStatus !== 'unhealthy') {
                failureCount++;
                lastFailure = entry.timestamp;

                // Calculer le temps entre pannes si ce n'est pas la première panne
                if (failureCount > 1) {
                    const timeSinceLastFailure = entry.timestamp - (this.healthHistory[i - 1].timestamp);
                    totalTimeBetweenFailuresMs += timeSinceLastFailure;
                }
            }

            lastTransition = entry.timestamp;
            lastStatus = entry.status;
        }

        // Ajouter le temps jusqu'à maintenant si l'état actuel est unhealthy
        if (lastStatus === 'unhealthy') {
            unhealthyTimeMs += now - lastTransition;
        }

        // Calculer les métriques
        const uptime = historyLengthMs > 0 ? 100 - (unhealthyTimeMs / historyLengthMs * 100) : 100;

        // Calculer MTBF (Mean Time Between Failures)
        const mtbf = failureCount > 1 ? totalTimeBetweenFailuresMs / (failureCount - 1) : 0;

        // Calculer MTTR (Mean Time To Recovery)
        const mttr = failureCount > 0 ? totalRecoveryTimeMs / failureCount : 0;

        // Mettre à jour les KPIs
        this.kpis = {
            uptime,
            mtbf,
            mttr,
            lastFailure,
            failureCount
        };

        this.logger.debug(`KPIs mis à jour: Uptime=${uptime.toFixed(2)}%, MTBF=${(mtbf / (3600 * 1000)).toFixed(2)}h, MTTR=${(mttr / 60000).toFixed(2)}min`);
    }

    /**
     * Récupère les KPIs actuels
     */
    public getKPIs(): HealthKPIs {
        return { ...this.kpis };
    }

    /**
     * Récupère l'historique de santé
     */
    public getHealthHistory(): Array<HealthHistoryEntry> {
        return [...this.healthHistory];
    }

    /**
     * Récupère l'état de santé actuel du système
     */
    public getCurrentHealth(): SystemHealth {
        if (this.healthHistory.length === 0) {
            return 'unknown';
        }
        return this.healthHistory[this.healthHistory.length - 1].status;
    }

    /**
     * Efface l'historique de santé
     */
    public clearHistory(): void {
        this.healthHistory = [];
        this.kpis = {
            uptime: 100,
            mtbf: 0,
            mttr: 0,
            lastFailure: null,
            failureCount: 0
        };
        this.logger.info('Historique de santé effacé');
    }
}