// src/ai/systems/expressions/animation/PerformanceMonitor.ts
import { RPMEventEmitter } from '../rpm/RPMEventEmitter';

/**
 * Interface du moniteur de performance pour l'animation
 */
export interface IPerformanceMonitor {
  /**
   * Démarre le suivi d'une opération
   */
  startTracking(operation: string): void;

  /**
   * Arrête le suivi d'une opération
   */
  stopTracking(operation: string): void;

  /**
   * Récupère les métriques de performance
   */
  getMetrics(): Record<string, number>;

  /**
   * Suit le temps d'une frame
   */
  trackFrameTime(duration: number): void;

  /**
   * Récupère un rapport de performance
   */
  getPerformanceReport(): PerformanceReport;
}

export interface PerformanceReport {
  timestamp: number;
  averageFrameTime: number;
  maxFrameTime: number;
  droppedFrames: number;
  framesAnalyzed: number;
  performanceScore: number;
}

export interface PerformanceAlert {
  type: 'FRAME_DROP' | 'MEMORY_WARNING' | 'GPU_STRESS';
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  data: Record<string, unknown>;
}

/**
 * Implémentation du moniteur de performance
 */
export class PerformanceMonitor extends RPMEventEmitter implements IPerformanceMonitor {
  private static readonly MAX_SAMPLES = 60;
  private static readonly FRAME_TIME_THRESHOLD = 16.67;
  private static readonly ALERT_THRESHOLD = 5;

  private frameTimeSamples: number[] = [];
  private consecutiveDrops = 0;
  private lastReport: PerformanceReport | null = null;
  private operations: Map<string, { startTime: number, totalTime: number, count: number }> = new Map();

  /**
   * Démarre le suivi d'une opération
   */
  startTracking(operation: string): void {
    const opData = this.operations.get(operation) || { startTime: 0, totalTime: 0, count: 0 };
    opData.startTime = performance.now();
    this.operations.set(operation, opData);
  }

  /**
   * Arrête le suivi d'une opération
   */
  stopTracking(operation: string): void {
    const opData = this.operations.get(operation);
    if (opData && opData.startTime > 0) {
      const duration = performance.now() - opData.startTime;
      opData.totalTime += duration;
      opData.count++;
      opData.startTime = 0;
      this.operations.set(operation, opData);
    }
  }

  /**
   * Récupère les métriques de performance
   */
  getMetrics(): Record<string, number> {
    const metrics: Record<string, number> = {};

    // Ajouter les métriques des opérations
    for (const [operation, data] of this.operations.entries()) {
      metrics[`${operation}_total`] = data.totalTime;
      metrics[`${operation}_count`] = data.count;
      metrics[`${operation}_avg`] = data.count > 0 ? data.totalTime / data.count : 0;
    }

    // Ajouter les métriques des frames
    const report = this.getPerformanceReport();
    metrics.averageFrameTime = report.averageFrameTime;
    metrics.maxFrameTime = report.maxFrameTime;
    metrics.droppedFrames = report.droppedFrames;
    metrics.performanceScore = report.performanceScore;

    return metrics;
  }

  /**
   * Suit le temps d'une frame
   */
  trackFrameTime(duration: number): void {
    this.frameTimeSamples.push(duration);

    if (this.frameTimeSamples.length > PerformanceMonitor.MAX_SAMPLES) {
      this.frameTimeSamples.shift();
    }

    this.analyzePerformance(duration);
  }

  /**
   * Récupère un rapport de performance
   */
  getPerformanceReport(): PerformanceReport {
    const currentTime = performance.now();

    if (
      this.lastReport &&
      currentTime - this.lastReport.timestamp < 1000
    ) {
      return this.lastReport;
    }

    const report = this.generateReport();
    this.lastReport = report;
    return report;
  }

  /**
   * Analyse les performances
   */
  private analyzePerformance(frameDuration: number): void {
    if (frameDuration > PerformanceMonitor.FRAME_TIME_THRESHOLD) {
      this.consecutiveDrops++;

      if (this.consecutiveDrops >= PerformanceMonitor.ALERT_THRESHOLD) {
        this.emit('performance-alert', {
          type: 'FRAME_DROP',
          message: `Frame time above threshold: ${frameDuration.toFixed(2)}ms`,
          severity: this.calculateAlertSeverity(frameDuration),
          data: {
            duration: frameDuration,
            threshold: PerformanceMonitor.FRAME_TIME_THRESHOLD,
            consecutiveDrops: this.consecutiveDrops
          }
        });
      }
    } else {
      this.consecutiveDrops = 0;
    }
  }

  /**
   * Génère un rapport de performance
   */
  private generateReport(): PerformanceReport {
    const samples = this.frameTimeSamples;
    const avgFrameTime = samples.length > 0
      ? samples.reduce((a, b) => a + b, 0) / samples.length
      : 0;
    const maxFrameTime = samples.length > 0 ? Math.max(...samples) : 0;
    const droppedFrames = samples.filter(
      time => time > PerformanceMonitor.FRAME_TIME_THRESHOLD
    ).length;

    return {
      timestamp: performance.now(),
      averageFrameTime: avgFrameTime,
      maxFrameTime: maxFrameTime,
      droppedFrames: droppedFrames,
      framesAnalyzed: samples.length,
      performanceScore: this.calculatePerformanceScore(avgFrameTime, droppedFrames)
    };
  }

  /**
   * Calcule un score de performance
   */
  private calculatePerformanceScore(avgFrameTime: number, droppedFrames: number): number {
    const frameTimeScore = Math.max(0, 1 - (avgFrameTime / (PerformanceMonitor.FRAME_TIME_THRESHOLD * 2)));
    const dropScore = Math.max(0, 1 - (droppedFrames / Math.max(1, this.frameTimeSamples.length)));
    return (frameTimeScore * 0.7 + dropScore * 0.3);
  }

  /**
   * Calcule la sévérité d'une alerte
   */
  private calculateAlertSeverity(frameDuration: number): PerformanceAlert['severity'] {
    const ratio = frameDuration / PerformanceMonitor.FRAME_TIME_THRESHOLD;
    if (ratio > 2) return 'CRITICAL';
    if (ratio > 1.5) return 'HIGH';
    if (ratio > 1.2) return 'MEDIUM';
    return 'LOW';
  }
}