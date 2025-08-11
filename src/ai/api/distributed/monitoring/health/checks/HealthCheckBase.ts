// src/ai/api/distributed/monitoring/health/checks/HealthCheckBase.ts

import {
    HealthCheckConfig,
    HealthCheckPriority,
    HealthCheckResult,
    HealthCheckType,
    IHealthCheck
} from '../types/HealthCheckTypes';

/**
 * Classe de base pour les vérifications de santé
 */
export abstract class HealthCheckBase implements IHealthCheck {
    private config: HealthCheckConfig;

    /**
     * Crée une nouvelle instance de vérification de santé
     * @param id Identifiant de la vérification
     * @param type Type de vérification
     * @param component Composant à vérifier
     */
    constructor(
        id: string,
        type: HealthCheckType,
        component: string
    ) {
        this.config = {
            id,
            type,
            component,
            priority: HealthCheckPriority.MEDIUM,
            checkIntervalMs: 60000, // 1 minute par défaut
            timeoutMs: 10000, // 10 secondes par défaut
            enabled: true,
            parameters: {}
        };
    }

    /**
     * Méthode abstraite à implémenter pour effectuer la vérification
     */
    public abstract check(): Promise<HealthCheckResult>;

    /**
     * Retourne la configuration de la vérification
     */
    public getConfig(): HealthCheckConfig {
        return { ...this.config };
    }

    /**
     * Retourne l'identifiant de la vérification
     */
    public getId(): string {
        return this.config.id;
    }

    /**
     * Retourne le type de vérification
     */
    public getType(): HealthCheckType {
        return this.config.type;
    }

    /**
     * Retourne le composant vérifié
     */
    public getComponent(): string {
        return this.config.component;
    }

    /**
     * Détermine si la vérification est activée
     */
    public isEnabled(): boolean {
        return this.config.enabled;
    }

    /**
     * Active ou désactive la vérification
     */
    public setEnabled(enabled: boolean): void {
        this.config.enabled = enabled;
    }

    /**
     * Retourne la priorité de la vérification
     */
    public getPriority(): HealthCheckPriority {
        return this.config.priority;
    }

    /**
     * Définit la priorité de la vérification
     */
    public setPriority(priority: HealthCheckPriority): void {
        this.config.priority = priority;
    }

    /**
     * Définit l'intervalle de vérification
     */
    public setCheckInterval(intervalMs: number): void {
        this.config.checkIntervalMs = intervalMs;
    }

    /**
     * Retourne l'intervalle de vérification
     */
    public getCheckInterval(): number {
        return this.config.checkIntervalMs;
    }

    /**
     * Définit le délai d'expiration
     */
    public setTimeout(timeoutMs: number): void {
        this.config.timeoutMs = timeoutMs;
    }

    /**
     * Retourne le délai d'expiration
     */
    public getTimeout(): number {
        return this.config.timeoutMs;
    }

    /**
     * Met à jour les paramètres de la vérification
     */
    public updateParameters(parameters: Record<string, unknown>): void {
        this.config.parameters = { ...this.config.parameters, ...parameters };
    }

    /**
     * Définit les seuils de la vérification
     */
    public setThresholds(thresholds: Record<string, number>): void {
        this.config.thresholds = { ...thresholds };
    }

    /**
     * Retourne les seuils de la vérification
     */
    public getThresholds(): Record<string, number> | undefined {
        return this.config.thresholds ? { ...this.config.thresholds } : undefined;
    }
}