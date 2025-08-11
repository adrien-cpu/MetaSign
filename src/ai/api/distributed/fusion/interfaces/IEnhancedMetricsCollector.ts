/**
 * src/ai/api/distributed/fusion/interfaces/IEnhancedMetricsCollector.ts
 * Interface étendue pour le collecteur de métriques
 */
import { IMetricsCollector } from '@api/common/metrics/interfaces/IMetricsCollector';

/**
 * Interface étendant IMetricsCollector avec des fonctionnalités supplémentaires
 * pour la collecte de métriques plus détaillées
 */
export interface IEnhancedMetricsCollector extends IMetricsCollector {
    /**
     * Incrémente un compteur par une valeur spécifiée
     * @param name - Nom du compteur
     * @param incrementBy - Valeur d'incrémentation (défaut: 1)
     */
    incrementCounter(name: string, incrementBy?: number): void;

    /**
     * Enregistre une valeur métrique avec des tags optionnels
     * @param name - Nom de la métrique
     * @param value - Valeur à enregistrer
     * @param tags - Tags associés à la métrique
     */
    recordValue(name: string, value: number, tags?: Record<string, string>): void;
}