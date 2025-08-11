// src/ai/coordinators/adapters/PerformanceMonitorAdapter.ts

import { PerformanceMonitor as InternalPerformanceMonitor } from '../../managers/PerformanceMonitor';

/**
 * Interface du PerformanceMonitor attendu par le système d'expressions
 */
export interface ExpressionPerformanceMonitor {
    frameTimeSamples: number[];
    consecutiveDrops: number;
    lastReport: number;
    operations: Map<string, unknown>;
    startMonitoring(): void;
    stopMonitoring(): void;
    reportMetrics(): unknown;
    // Méthodes supplémentaires requises par SystemeExpressions
    startTracking(): void;
    stopTracking(): void;
    getMetrics(): Record<string, unknown>;
    trackFrameTime(frameTime: number): void;
    trackOperation(operation: string, duration: number): void;
    checkPerformance(): boolean;
    getFrameRate(): number;
    getAverageFrameTime(): number;
    getDroppedFrames(): number;
    logPerformanceIssue(issue: string, data?: unknown): void;
    reset(): void;
}

/**
 * Adaptateur qui convertit notre PerformanceMonitor interne
 * vers l'interface attendue par le système d'expressions
 */
export class PerformanceMonitorAdapter implements ExpressionPerformanceMonitor {
    // Propriétés requises par l'interface ExpressionPerformanceMonitor
    public frameTimeSamples: number[] = [];
    public consecutiveDrops: number = 0;
    public lastReport: number = Date.now();
    public operations: Map<string, unknown> = new Map();

    /**
     * Constructeur
     * @param internalMonitor L'instance de notre PerformanceMonitor interne à adapter
     */
    constructor(private internalMonitor: InternalPerformanceMonitor) { }

    /**
     * Démarre le monitoring de performance
     */
    public startMonitoring(): void {
        this.startTracking();
    }

    /**
     * Arrête le monitoring de performance
     */
    public stopMonitoring(): void {
        this.stopTracking();
    }

    /**
     * Rapporte les métriques de performance
     */
    public reportMetrics(): unknown {
        return this.getMetrics();
    }

    /**
     * Démarre le suivi des performances
     */
    public startTracking(): void {
        if (typeof this.internalMonitor.start === 'function') {
            this.internalMonitor.start();
        }
    }

    /**
     * Arrête le suivi des performances
     */
    public stopTracking(): void {
        if (typeof this.internalMonitor.stop === 'function') {
            this.internalMonitor.stop();
        }
    }

    /**
     * Récupère les métriques de performance
     */
    public getMetrics(): Record<string, unknown> {
        if (typeof this.internalMonitor.getMetrics === 'function') {
            return this.internalMonitor.getMetrics() as Record<string, unknown>;
        }
        return {};
    }

    /**
     * Suit le temps de rendu d'une frame
     * @param frameTime Temps de rendu en ms
     */
    public trackFrameTime(frameTime: number): void {
        this.frameTimeSamples.push(frameTime);

        // Limiter la taille du tableau
        if (this.frameTimeSamples.length > 100) {
            this.frameTimeSamples.shift();
        }

        // Simuler un suivi de performance
        const frameThreshold = 16.67; // ~60 FPS
        if (frameTime > frameThreshold) {
            this.consecutiveDrops++;
        } else {
            this.consecutiveDrops = 0;
        }
    }

    /**
     * Suit le temps d'une opération
     * @param operation Nom de l'opération
     * @param duration Durée en ms
     */
    public trackOperation(operation: string, duration: number): void {
        this.operations.set(operation, duration);
    }

    /**
     * Vérifie si les performances sont satisfaisantes
     */
    public checkPerformance(): boolean {
        const avgFrameTime = this.getAverageFrameTime();
        const frameThreshold = 16.67; // ~60 FPS
        return avgFrameTime <= frameThreshold && this.consecutiveDrops < 5;
    }

    /**
     * Calcule le taux de frames par seconde actuel
     */
    public getFrameRate(): number {
        const avgFrameTime = this.getAverageFrameTime();
        if (avgFrameTime <= 0) return 60;
        return 1000 / avgFrameTime;
    }

    /**
     * Calcule le temps moyen de rendu d'une frame
     */
    public getAverageFrameTime(): number {
        if (this.frameTimeSamples.length === 0) return 0;

        const sum = this.frameTimeSamples.reduce((acc, time) => acc + time, 0);
        return sum / this.frameTimeSamples.length;
    }

    /**
     * Récupère le nombre de frames perdues
     */
    public getDroppedFrames(): number {
        const frameThreshold = 16.67; // ~60 FPS
        return this.frameTimeSamples.filter(time => time > frameThreshold).length;
    }

    /**
     * Enregistre un problème de performance
     * @param issue Description du problème
     * @param data Données associées
     */
    public logPerformanceIssue(issue: string, data?: unknown): void {
        console.warn(`[Performance] ${issue}`, data);
    }

    /**
     * Réinitialise les compteurs de performance
     */
    public reset(): void {
        this.frameTimeSamples = [];
        this.consecutiveDrops = 0;
        this.lastReport = Date.now();
        this.operations.clear();
    }
}