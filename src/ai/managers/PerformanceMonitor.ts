//src/ai/managers/PerformanceMonitor.ts
import { EventManager } from '../coordinators/managers/EventManager';

/**
 * Moniteur de performance qui surveille et analyse les performances du système
 */
export class PerformanceMonitor {
    private isMonitoring: boolean = false;
    private metrics: Record<string, unknown> = {};
    private performanceThreshold: number;
    private eventManager: EventManager;

    /**
     * Constructeur du moniteur de performance
     * @param eventManager Gestionnaire d'événements pour la notification
     * @param performanceThreshold Seuil de performance en pourcentage
     */
    constructor(eventManager: EventManager, performanceThreshold: number = 60) {
        this.eventManager = eventManager;
        this.performanceThreshold = performanceThreshold;
    }

    /**
     * Démarre la surveillance des performances
     */
    public start(): void {
        this.isMonitoring = true;
        this.metrics = {};
    }

    /**
     * Arrête la surveillance des performances
     */
    public stop(): void {
        this.isMonitoring = false;
    }

    /**
     * Récupère les métriques collectées
     * @returns Métriques de performance
     */
    public getMetrics(): Record<string, unknown> {
        return { ...this.metrics };
    }

    /**
     * Obtient un rapport complet des performances
     * @returns Rapport de performance
     */
    public getPerformanceReport(): Record<string, unknown> {
        return {
            ...this.getMetrics(),
            timestamp: Date.now(),
            threshold: this.performanceThreshold
        };
    }

    /**
     * Analyse les performances actuelles du système
     * @returns Résultat de l'analyse avec score et problèmes détectés
     */
    public analyzePerformance(): { score: number; issues: string[] } {
        const score = this.calculatePerformanceScore();
        const issues: string[] = [];

        if (score < this.performanceThreshold) {
            issues.push(`Performance score (${score}) is below threshold (${this.performanceThreshold})`);
        }

        return { score, issues };
    }

    /**
     * Génère un rapport complet d'analyse des performances
     * @returns Rapport d'analyse
     */
    public generateReport(): Record<string, unknown> {
        const analysis = this.analyzePerformance();
        return {
            ...this.getPerformanceReport(),
            analysis
        };
    }

    /**
     * Calcule un score de performance global
     * @returns Score de performance entre 0 et 100
     */
    public calculatePerformanceScore(): number {
        // Implémentation simplifiée - dans un système réel, ce serait plus complexe
        const metrics = this.getMetrics();
        // Simuler un score basé sur les métriques disponibles
        return Math.min(100, 75 + Math.random() * 25); // Retourne une valeur entre 75 et 100
    }
}