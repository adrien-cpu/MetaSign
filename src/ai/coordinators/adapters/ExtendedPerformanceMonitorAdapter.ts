//src/ai/coordinators/adapters/ExtendedPerformanceMonitorAdapter.ts
import { PerformanceMonitorAdapter } from './PerformanceMonitorAdapter';
import { PerformanceMonitor } from '../../managers/PerformanceMonitor';

/**
 * Adaptateur étendu qui implémente toutes les méthodes requises
 * par l'interface PerformanceMonitor tout en conservant les fonctionnalités
 * de l'adaptateur original
 */
export class ExtendedPerformanceMonitorAdapter extends PerformanceMonitorAdapter implements PerformanceMonitor {
    /**
     * Constructeur
     * @param internalMonitor L'instance du PerformanceMonitor interne
     */
    constructor(internalMonitor: PerformanceMonitor) {
        super(internalMonitor);
    }

    /**
     * Obtient un rapport complet des performances
     * @returns Rapport de performance
     */
    public getPerformanceReport(): Record<string, unknown> {
        return {
            frameRate: this.getFrameRate(),
            averageFrameTime: this.getAverageFrameTime(),
            droppedFrames: this.getDroppedFrames(),
            consecutiveDrops: this.consecutiveDrops,
            operations: Object.fromEntries(this.operations),
            timestamp: Date.now()
        };
    }

    /**
     * Analyse les performances actuelles du système
     * @returns Résultat de l'analyse avec score et problèmes détectés
     */
    public analyzePerformance(): { score: number; issues: string[] } {
        const issues: string[] = [];
        const avgFrameTime = this.getAverageFrameTime();
        const frameThreshold = 16.67; // ~60 FPS

        if (avgFrameTime > frameThreshold) {
            issues.push(`Average frame time (${avgFrameTime.toFixed(2)}ms) exceeds threshold (${frameThreshold}ms)`);
        }

        if (this.consecutiveDrops >= 5) {
            issues.push(`Consecutive frame drops (${this.consecutiveDrops}) indicates performance issues`);
        }

        const droppedFrames = this.getDroppedFrames();
        if (droppedFrames > 10) {
            issues.push(`High number of dropped frames (${droppedFrames})`);
        }

        const score = this.calculatePerformanceScore();

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
        // Plus le temps de frame est bas, meilleur est le score
        const avgFrameTime = this.getAverageFrameTime();
        if (avgFrameTime <= 0) return 100; // Éviter la division par zéro

        const idealFrame = 16.67; // 60 FPS est idéal
        let score = 100 * (idealFrame / avgFrameTime);

        // Pénaliser les drops de frames consécutifs
        if (this.consecutiveDrops > 0) {
            score -= this.consecutiveDrops * 2;
        }

        // Clamp la valeur entre 0 et 100
        return Math.max(0, Math.min(100, score));
    }

    // Déléguer les méthodes manquantes à l'adaptateur interne si nécessaire
    // Ces méthodes peuvent être ajoutées au besoin
}