/**
 * Types pour la configuration du système de monitoring avancé
 */
import { SystemHealth } from '@monitoring/health/types/health.types';

/**
 * Configuration générale du système de monitoring
 */
export interface MonitoringConfiguration {
    /** Intervalle entre les vérifications en ms */
    checkInterval: number;

    /** Seuils CPU */
    cpuThresholds: {
        critical: number;
        warning: number;
    };

    /** Seuils mémoire */
    memoryThresholds: {
        critical: number;
        warning: number;
    };

    /** Endpoints à surveiller */
    endpoints: Array<EndpointCheckConfig>;

    /** Vérifications spéciales */
    customChecks: Array<CustomCheckConfig>;

    /** Configuration des alertes */
    alerting: AlertingConfiguration;

    /** Configuration de persistance des métriques */
    metrics: MetricsConfiguration;
}

/**
 * Configuration pour la vérification d'un endpoint
 */
export interface EndpointCheckConfig {
    /** Nom unique de l'endpoint */
    name: string;

    /** URL à vérifier */
    url: string;

    /** Méthode HTTP à utiliser */
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS';

    /** Codes HTTP attendus pour considérer l'endpoint en bonne santé */
    expectedStatus: number[];

    /** Si true, un échec de cette vérification causera un état 'unhealthy' */
    critical: boolean;

    /** Timeout de la requête en ms */
    timeout?: number;

    /** Nombre de tentatives en cas d'échec */
    retries?: number;
}

/**
 * Configuration pour une vérification personnalisée
 */
export interface CustomCheckConfig {
    /** Nom unique de la vérification */
    name: string;

    /** Description de la vérification */
    description: string;

    /** Si true, un échec de cette vérification causera un état 'unhealthy' */
    critical: boolean;

    /** Fonction de vérification personnalisée */
    checkFn: () => Promise<{
        status: SystemHealth;
        message: string;
        details?: Record<string, unknown>
    }>;
}

/**
 * Configuration des mécanismes d'alerte
 */
export interface AlertingConfiguration {
    /** Configuration des alertes par email */
    email?: {
        enabled: boolean;
        recipients: string[];
        throttling: number; // Minutes entre deux alertes
    };

    /** Configuration des alertes Slack */
    slack?: {
        enabled: boolean;
        webhookUrl: string;
        channel: string;
        throttling: number; // Minutes entre deux alertes
    };

    /** Configuration des alertes PagerDuty */
    pagerDuty?: {
        enabled: boolean;
        serviceKey: string;
        throttling: number; // Minutes entre deux alertes
    };
}

/**
 * Configuration de la gestion des métriques
 */
export interface MetricsConfiguration {
    /** Temps de rétention des métriques en heures */
    retention: number;

    /** Intervalle d'agrégation en minutes */
    aggregationInterval: number;

    /** Si true, les métriques seront exportées */
    exportEnabled: boolean;

    /** Chemin d'export des métriques */
    exportPath?: string;
}