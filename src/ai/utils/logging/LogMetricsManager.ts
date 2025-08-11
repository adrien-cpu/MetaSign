/**
 * @file src/ai/utils/logging/LogMetricsManager.ts
 * @description Gestionnaire de métriques pour le système de journalisation
 * Collecte et maintient des statistiques sur les logs générés
 */

import { LogLevel, LOG_LEVEL_NAMES } from './LogLevel';
import { LogOptions, LogMetrics, MessageFrequency } from './LoggerTypes';

/**
 * Gère la collecte et l'analyse des métriques de journalisation
 */
export class LogMetricsManager {
    private totalLogs: number = 0;
    private countByLevel: Record<LogLevel, number> = {
        [LogLevel.DEBUG]: 0,
        [LogLevel.INFO]: 0,
        [LogLevel.WARN]: 0,
        [LogLevel.ERROR]: 0,
        [LogLevel.FATAL]: 0
    };
    private firstLogTimestamp: number = 0;
    private lastLogTimestamp: number = 0;
    private totalMessageSize: number = 0;
    private tagDistribution: Record<string, number> = {};
    private messageFrequency: Map<string, number> = new Map();
    private errorFrequency: Map<string, number> = new Map();
    private readonly bufferSize: number;

    /**
     * Crée une nouvelle instance du gestionnaire de métriques
     * @param bufferSize Taille du buffer pour le suivi des messages fréquents
     */
    constructor(bufferSize: number = 100) {
        this.bufferSize = bufferSize;
    }

    /**
     * Met à jour les métriques avec un nouveau message de log
     * @param level Niveau de log
     * @param message Message journalisé
     * @param timestamp Horodatage du message
     * @param options Options du message
     */
    public updateMetrics(
        level: LogLevel,
        message: string,
        timestamp: number,
        options: LogOptions = {}
    ): void {
        // Incrémenter le compteur total
        this.totalLogs++;

        // Mettre à jour le compteur par niveau
        this.countByLevel[level]++;

        // Mettre à jour les timestamps
        if (this.firstLogTimestamp === 0 || timestamp < this.firstLogTimestamp) {
            this.firstLogTimestamp = timestamp;
        }
        this.lastLogTimestamp = Math.max(this.lastLogTimestamp, timestamp);

        // Mettre à jour la taille totale des messages
        this.totalMessageSize += message.length;

        // Mettre à jour la distribution des tags
        if (options.tags && options.tags.length > 0) {
            for (const tag of options.tags) {
                this.tagDistribution[tag] = (this.tagDistribution[tag] || 0) + 1;
            }
        }

        // Mettre à jour la fréquence des messages
        this.updateMessageFrequency(message);

        // Mettre à jour la fréquence des erreurs pour les niveaux ERROR et FATAL
        if (level >= LogLevel.ERROR) {
            this.updateErrorFrequency(message);
        }
    }

    /**
     * Met à jour la fréquence d'apparition d'un message
     * @param message Message à tracker
     */
    private updateMessageFrequency(message: string): void {
        // Limiter la taille du message pour éviter des clés trop longues
        const normalizedMessage = message.length > 100
            ? message.substring(0, 97) + '...'
            : message;

        // Mettre à jour le compteur
        const currentCount = this.messageFrequency.get(normalizedMessage) || 0;
        this.messageFrequency.set(normalizedMessage, currentCount + 1);

        // Limiter la taille de la map
        if (this.messageFrequency.size > this.bufferSize) {
            this.pruneFrequencyMap(this.messageFrequency);
        }
    }

    /**
     * Met à jour la fréquence d'apparition d'une erreur
     * @param errorMessage Message d'erreur à tracker
     */
    private updateErrorFrequency(errorMessage: string): void {
        // Limiter la taille du message pour éviter des clés trop longues
        const normalizedMessage = errorMessage.length > 100
            ? errorMessage.substring(0, 97) + '...'
            : errorMessage;

        // Mettre à jour le compteur
        const currentCount = this.errorFrequency.get(normalizedMessage) || 0;
        this.errorFrequency.set(normalizedMessage, currentCount + 1);

        // Limiter la taille de la map
        if (this.errorFrequency.size > this.bufferSize) {
            this.pruneFrequencyMap(this.errorFrequency);
        }
    }

    /**
     * Réduit la taille d'une map de fréquence en gardant les éléments les plus fréquents
     * @param map Map de fréquence à réduire
     */
    private pruneFrequencyMap(map: Map<string, number>): void {
        // Convertir la map en tableau pour pouvoir trier
        const entries = Array.from(map.entries());

        // Trier par fréquence décroissante
        entries.sort((a, b) => b[1] - a[1]);

        // Garder seulement les entrées les plus fréquentes
        const keepEntries = entries.slice(0, this.bufferSize / 2);

        // Recréer la map avec les entrées conservées
        map.clear();
        for (const [key, value] of keepEntries) {
            map.set(key, value);
        }
    }

    /**
     * Obtient les métriques actuelles
     * @returns Objet contenant les métriques collectées
     */
    public getMetrics(): LogMetrics {
        // Calculer la taille moyenne des messages
        const averageMessageSize = this.totalLogs > 0
            ? Math.round(this.totalMessageSize / this.totalLogs)
            : 0;

        // Extraire les messages les plus fréquents
        const topMessages = this.getTopFrequencies(this.messageFrequency);

        // Extraire les erreurs les plus fréquentes
        const topErrors = this.getTopFrequencies(this.errorFrequency);

        return {
            totalLogs: this.totalLogs,
            countByLevel: { ...this.countByLevel },
            firstLogTimestamp: this.firstLogTimestamp,
            lastLogTimestamp: this.lastLogTimestamp,
            averageMessageSize,
            tagDistribution: { ...this.tagDistribution },
            topMessages,
            topErrors
        };
    }

    /**
     * Obtient les entrées les plus fréquentes d'une map de fréquence
     * @param map Map de fréquence
     * @param limit Nombre maximum d'entrées à retourner
     * @returns Tableau des entrées les plus fréquentes
     */
    private getTopFrequencies(map: Map<string, number>, limit: number = 10): MessageFrequency[] {
        // Convertir la map en tableau pour pouvoir trier
        const entries = Array.from(map.entries());

        // Trier par fréquence décroissante
        entries.sort((a, b) => b[1] - a[1]);

        // Retourner les entrées les plus fréquentes
        return entries.slice(0, limit).map(([message, count]) => ({
            message,
            count
        }));
    }

    /**
     * Réinitialise toutes les métriques
     */
    public resetMetrics(): void {
        this.totalLogs = 0;
        this.countByLevel = {
            [LogLevel.DEBUG]: 0,
            [LogLevel.INFO]: 0,
            [LogLevel.WARN]: 0,
            [LogLevel.ERROR]: 0,
            [LogLevel.FATAL]: 0
        };
        this.firstLogTimestamp = 0;
        this.lastLogTimestamp = 0;
        this.totalMessageSize = 0;
        this.tagDistribution = {};
        this.messageFrequency.clear();
        this.errorFrequency.clear();
    }

    /**
     * Génère un rapport formaté des métriques actuelles
     * @returns Chaîne formatée contenant le rapport de métriques
     */
    public generateReport(): string {
        const metrics = this.getMetrics();
        const lines: string[] = [
            '==== RAPPORT DE MÉTRIQUES DE JOURNALISATION ====',
            `Total des logs: ${metrics.totalLogs}`,
            '',
            '-- Distribution par niveau --',
        ];

        // Ajouter la distribution par niveau
        Object.entries(metrics.countByLevel).forEach(([levelNum, count]) => {
            const level = Number(levelNum) as LogLevel;
            const percentage = metrics.totalLogs > 0
                ? ((count / metrics.totalLogs) * 100).toFixed(1)
                : '0.0';
            lines.push(`${LOG_LEVEL_NAMES[level]}: ${count} (${percentage}%)`);
        });

        // Ajouter l'information de période
        if (metrics.firstLogTimestamp > 0) {
            const firstDate = new Date(metrics.firstLogTimestamp).toISOString();
            const lastDate = new Date(metrics.lastLogTimestamp).toISOString();
            const durationMs = metrics.lastLogTimestamp - metrics.firstLogTimestamp;
            const durationSeconds = Math.round(durationMs / 1000);

            lines.push('');
            lines.push('-- Période --');
            lines.push(`Premier log: ${firstDate}`);
            lines.push(`Dernier log: ${lastDate}`);
            lines.push(`Durée: ${durationSeconds}s`);
        }

        // Ajouter les informations de taille
        lines.push('');
        lines.push('-- Taille moyenne --');
        lines.push(`${metrics.averageMessageSize} caractères par message`);

        // Ajouter les tags les plus utilisés
        if (Object.keys(metrics.tagDistribution).length > 0) {
            lines.push('');
            lines.push('-- Tags les plus utilisés --');

            const sortedTags = Object.entries(metrics.tagDistribution)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            sortedTags.forEach(([tag, count]) => {
                lines.push(`${tag}: ${count}`);
            });
        }

        // Ajouter les messages les plus fréquents
        if (metrics.topMessages.length > 0) {
            lines.push('');
            lines.push('-- Messages les plus fréquents --');

            metrics.topMessages.forEach(({ message, count }) => {
                lines.push(`[${count}x] ${message}`);
            });
        }

        // Ajouter les erreurs les plus fréquentes
        if (metrics.topErrors.length > 0) {
            lines.push('');
            lines.push('-- Erreurs les plus fréquentes --');

            metrics.topErrors.forEach(({ message, count }) => {
                lines.push(`[${count}x] ${message}`);
            });
        }

        lines.push('');
        lines.push('=============================================');

        return lines.join('\n');
    }
}