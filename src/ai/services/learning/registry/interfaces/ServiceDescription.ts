/**
 * @file src/ai/services/learning/registry/interfaces/ServiceDescription.ts
 * @description Interfaces pour la description des services d'apprentissage
 * @module ServiceDescription
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * Ce module définit les interfaces utilisées pour décrire et gérer les services
 * dans le registre de services d'apprentissage.
 */

/**
 * État de santé d'un service
 * @interface ServiceHealth
 */
export interface ServiceHealth {
    /**
     * Le service est-il en bonne santé
     */
    isHealthy: boolean;

    /**
     * Statut du service
     */
    status: 'healthy' | 'degraded' | 'unhealthy' | 'starting' | 'stopped' | 'not_found';

    /**
     * Message détaillant l'état de santé
     */
    message: string;

    /**
     * Timestamp de la dernière vérification
     */
    lastChecked?: Date;

    /**
     * Détails supplémentaires
     */
    details?: Record<string, unknown>;
}

/**
 * Configuration du registre de services
 * @interface ServiceRegistryConfig
 */
export interface ServiceRegistryConfig {
    /**
     * Activer la récupération automatique des services
     */
    autoRecover: boolean;

    /**
     * Intervalle de vérification de santé (en ms)
     */
    healthCheckInterval: number;

    /**
     * Nombre maximum de tentatives de récupération
     */
    maxRecoveryAttempts: number;

    /**
     * Délai d'attente pour les opérations de service (en ms)
     */
    serviceTimeout: number;
}

/**
 * Interface de base pour tous les services enregistrables
 * Cette interface définit les méthodes communes que tous les services devraient implémenter
 */
export interface BaseService {
    /**
     * Initialise le service
     */
    initialize?(): Promise<void>;

    /**
     * Démarre le service
     */
    start?(): Promise<void>;

    /**
     * Arrête le service
     */
    stop?(): Promise<void>;

    /**
     * Redémarre le service
     */
    restart?(): Promise<void>;

    /**
     * Reconnecte le service
     */
    reconnect?(): Promise<void>;

    /**
     * Réinitialise le service
     */
    reset?(): Promise<void>;

    /**
     * Vérifie l'état de santé du service
     */
    checkHealth?(): Promise<ServiceHealth>;

    /**
     * Méthode générique pour exécuter une commande sur le service
     */
    execute?(command: string, params?: Record<string, unknown>): Promise<unknown>;
}

/**
 * Description d'un service d'apprentissage
 * @interface ServiceDescription
 */
export interface ServiceDescription {
    /**
     * Identifiant unique du service
     */
    id: string;

    /**
     * Nom du service
     */
    name: string;

    /**
     * Version du service
     */
    version: string;

    /**
     * Description du service
     */
    description: string;

    /**
     * Type de service
     */
    type?: string;

    /**
     * Instance du service
     * Utilisation d'un type plus spécifique au lieu de any
     */
    instance: BaseService | Record<string, unknown>;

    /**
     * Liste des dépendances (IDs d'autres services)
     */
    dependencies?: string[];

    /**
     * Liste des tags
     */
    tags?: string[];

    /**
     * Fonction de vérification de santé personnalisée
     */
    healthCheck?: () => Promise<ServiceHealth>;

    /**
     * Poids de priorité (pour la résolution des conflits)
     */
    priority?: number;

    /**
     * Métadonnées supplémentaires
     */
    metadata?: Record<string, unknown>;
}