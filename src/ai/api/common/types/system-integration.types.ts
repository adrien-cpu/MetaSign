/**
 * src/ai/api/common/types/system-integration.types.ts
 * Types pour le module d'intégration système
 */

// Ces types seraient normalement importés, mais nous allons les définir ici temporairement
// pour éviter les problèmes d'importation
/**
 * Types nécessaires qui devraient être définis ailleurs mais sont inclus ici temporairement
 */
export type SystemCoordination = Record<string, unknown>;
export type CommunicationChannels = Record<string, unknown>;
export type DataManagement = Record<string, unknown>;
export type MonitoringStatus = 'ACTIVE' | 'INACTIVE' | 'WARNING' | 'ERROR';
export type PerformanceMonitoring = {
    cpu: number;
    memory: number;
    latency: number;
    throughput: number;
    customMetrics?: Record<string, number>;
};

/**
 * Interface définissant le système de surveillance pour l'intégration
 */
export interface SystemMonitoring {
    /** Métriques de performance du système */
    performance: PerformanceMonitoring;
    /** Statut actuel du monitoring */
    status: MonitoringStatus;
    /** Suivi des erreurs */
    errorTracking: ErrorTracking;
    /** Vérifications d'état du système */
    healthChecks: HealthChecks;
}

/**
 * Interface définissant le suivi des erreurs système
 */
export interface ErrorTracking {
    /** Indique si le suivi des erreurs est actif */
    active: boolean;
    /** Liste des erreurs enregistrées */
    errors: ErrorRecord[];
}

/**
 * Interface définissant la structure d'un enregistrement d'erreur
 */
export interface ErrorRecord {
    /** Identifiant unique de l'erreur */
    id: string;
    /** Message descriptif de l'erreur */
    message: string;
    /** Horodatage de l'erreur */
    timestamp: Date;
    /** Niveau de sévérité de l'erreur */
    severity: ErrorSeverity;
    /** Indique si l'erreur a été résolue */
    resolved: boolean;
}

/**
 * Types de sévérité d'erreur
 */
export type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Types de statut de santé
 */
export type HealthStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL';

/**
 * Interface définissant les vérifications d'état du système
 */
export interface HealthChecks {
    /** Date de la dernière vérification */
    lastCheck: Date;
    /** Statut général de santé du système */
    status: HealthStatus;
    /** Liste des problèmes identifiés */
    issues: string[];
}

/**
 * Types d'environnement d'exécution
 */
export type ExecutionEnvironment = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';

/**
 * Interface définissant le contexte d'intégration
 */
export interface IntegrationContext {
    /** Environnement d'exécution */
    environment: ExecutionEnvironment;
    /** Région de déploiement */
    region: string;
    /** Fonctionnalités activées */
    features: string[];
    /** Version du système */
    version: string;
}

/**
 * Interface définissant le statut d'une opération d'intégration
 */
export interface IntegrationStatus {
    /** Indique si l'intégration a réussi */
    success: boolean;
    /** Horodatage de l'opération */
    timestamp: Date;
    /** Messages associés à l'opération */
    messages: string[];
}

/**
 * Interface définissant le résultat complet d'une intégration
 */
export interface IntegrationResult {
    /** Système de coordination intégré */
    coordination: SystemCoordination;
    /** Canaux de communication établis */
    communication: CommunicationChannels;
    /** Gestion des données configurée */
    dataManagement: DataManagement;
    /** Système de monitoring activé */
    monitoring: SystemMonitoring;
    /** Statut global de l'intégration */
    status: IntegrationStatus;
}

/**
 * Types de niveau de suivi
 */
export type TrackingLevel = 'BASIC' | 'DETAILED' | 'COMPREHENSIVE';

/**
 * Interface définissant un système de suivi détaillé des progrès
 */
export interface DetailedProgressTracker {
    /** Identifiant unique du traqueur */
    id: string;
    /** Nom descriptif du traqueur */
    name: string;
    /** Indique si les métriques sont activées */
    metricsEnabled: boolean;
    /** Niveau de détail du suivi */
    trackingLevel: TrackingLevel;
}

/**
 * Types de statut de support
 */
export type SupportStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR';

/**
 * Interface définissant un système de support multimodal
 */
export interface MultimodalSupportSystem {
    /** Identifiant unique du système */
    id: string;
    /** Nom descriptif du système */
    name: string;
    /** Modalités supportées par le système */
    supportedModalities: string[];
    /** État actuel du système */
    status: SupportStatus;
}

/**
 * Interface définissant la configuration du monitoring
 */
export interface MonitoringConfig {
    /** Intervalle de collecte des métriques (en ms) */
    metricsInterval: number;
    /** Seuil de déclenchement des alertes */
    alertThreshold: number;
    /** Durée de rétention des données (en jours) */
    storageRetention: number;
    /** Indique si la correction automatique est activée */
    autoRemediation: boolean;
}

/**
 * Interface pour les notifications système
 */
export interface SystemNotification {
    /** Type de notification */
    type: string;
    /** Message de la notification */
    message: string;
    /** Horodatage de la notification */
    timestamp: Date;
    /** Niveau de sévérité */
    severity: string;
}