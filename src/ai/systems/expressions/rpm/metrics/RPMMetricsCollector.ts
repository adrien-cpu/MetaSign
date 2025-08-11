// src/ai/systems/expressions/rpm/metrics/RPMMetricsCollector.ts
// Correction de l'importation en utilisant l'alias défini dans tsconfig.json

import { IMetricsCollector } from '@api/common/metrics/interfaces/IMetricsCollector';
import {
  SystemMetrics,
  MetricData,
  TimeFrame,
  MetricQuery,
  MetricValidation,
  MetricTransformation
} from '@api/common/metrics/types/MetricTypes';
import { MetricBucket } from '@api/common/metrics/MetricBucket';

/**
 * Collecteur de métriques spécifique au système RPM (Real-time Performance Monitoring)
 * Cette classe étend les fonctionnalités du collecteur de métriques standard
 * pour ajouter des fonctionnalités spécifiques aux performances du rendu en temps réel
 */
export class RPMMetricsCollector implements IMetricsCollector {
  private metrics: Map<string, MetricBucket> = new Map();
  private readonly maxRetentionTime: number = 7 * 24 * 60 * 60 * 1000; // 7 jours 
  private counters: Map<string, number> = new Map();
  private timings: Map<string, number[]> = new Map();

  private latencyTimestamps: number[] = [];
  private frametimeTimestamps: Map<string, number[]> = new Map();
  private memoryTimestamps: Map<string, number[]> = new Map();

  // Métriques spécifiques au RPM
  private rpmLatencyValues: number[] = [];
  private rpmFrametimeValues: Map<string, number[]> = new Map();
  private rpmMemoryUsage: Map<string, number[]> = new Map();

  /**
   * Incrémente un compteur
   * @param name Nom du compteur
   */
  incrementCounter(name: string): void {
    const currentValue = this.counters.get(name) || 0;
    this.counters.set(name, currentValue + 1);
  }

  /**
   * Enregistre une durée
   * @param name Nom de la métrique de durée
   * @param value Valeur de la durée
   */
  recordTiming(name: string, value: number): void {
    const timestamp = Date.now();
    const values = this.timings.get(name) || [];
    values.push(value);
    this.timings.set(name, values);

    // Si c'est une métrique de latence RPM, la stocker séparément aussi
    if (name.startsWith('rpm.latency')) {
      this.rpmLatencyValues.push(value);
      this.latencyTimestamps.push(timestamp);
      this.pruneLatencyValues(); // Limiter la taille du tableau
    }

    // Si c'est une métrique de frametime RPM, la stocker
    if (name.startsWith('rpm.frametime')) {
      const componentId = name.split('.')[2] || 'default';
      const frametimes = this.rpmFrametimeValues.get(componentId) || [];
      frametimes.push(value);
      this.rpmFrametimeValues.set(componentId, frametimes);

      const timestamps = this.frametimeTimestamps.get(componentId) || [];
      timestamps.push(timestamp);
      this.frametimeTimestamps.set(componentId, timestamps);

      this.pruneFrametimeValues(componentId);
    }

    // Si c'est une métrique d'utilisation mémoire
    if (name.startsWith('rpm.memory')) {
      const memoryType = name.split('.')[2] || 'default';
      const memoryValues = this.rpmMemoryUsage.get(memoryType) || [];
      memoryValues.push(value);
      this.rpmMemoryUsage.set(memoryType, memoryValues);

      const timestamps = this.memoryTimestamps.get(memoryType) || [];
      timestamps.push(timestamp);
      this.memoryTimestamps.set(memoryType, timestamps);

      this.pruneMemoryValues(memoryType);
    }
  }

  /**
   * Récupère la valeur d'un compteur
   * @param name Nom du compteur
   * @returns Valeur actuelle du compteur ou 0 si non trouvé
   */
  getCounter(name: string): number {
    return this.counters.get(name) || 0;
  }

  /**
   * Récupère la moyenne d'une durée
   * @param name Nom de la métrique de durée
   * @returns Moyenne des durées ou 0 si non trouvé
   */
  getAverageTiming(name: string): number {
    const values = this.timings.get(name);
    if (!values || values.length === 0) {
      return 0;
    }
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }

  /**
   * Collecte une métrique système
   * @param metric Métrique à collecter
   * @returns true si collectée avec succès
   */
  async collect(metric: SystemMetrics): Promise<boolean> {
    try {
      const metricName = metric.name;

      // Vérifier si c'est une métrique RPM et l'enregistrer de manière appropriée
      if (metricName.startsWith('rpm.')) {
        if (metricName.includes('latency')) {
          this.recordTiming(metricName, metric.value);
        } else if (metricName.includes('frametime')) {
          this.recordTiming(metricName, metric.value);
        } else if (metricName.includes('memory')) {
          this.recordTiming(metricName, metric.value);
        } else {
          // Autres métriques RPM
          await this.storeMetric(metric);
        }
      } else {
        // Métriques standards
        await this.storeMetric(metric);
      }

      return true;
    } catch (error) {
      console.error('Error collecting RPM metrics:', error);
      return false;
    }
  }

  /**
   * Récupère toutes les métriques pour une période donnée
   */
  async getMetrics(timeFrame: TimeFrame): Promise<SystemMetrics[]> {
    const result: SystemMetrics[] = [];
    for (const [metricName, bucket] of this.metrics) {
      const bucketData = await bucket.aggregateByTimeFrame(timeFrame);
      result.push({
        name: metricName,
        timestamp: Date.now(),
        value: bucketData.avg,
        unit: metricName.includes('time') ? 'ms' : 'count',
        tags: { source: 'rpm' },
        source: 'rpm-collector',
        type: metricName.includes('time') ? 'histogram' : 'gauge'
      });
    }

    // Ajouter les métriques de performance RPM calculées
    this.addRPMPerformanceMetrics(result, timeFrame);

    return result;
  }

  /**
   * Agrège une métrique sur une période donnée
   */
  async aggregateMetric(metricName: string, timeFrame: TimeFrame): Promise<MetricData> {
    const bucket = this.getBucketForMetric(metricName);
    if (!bucket) {
      return this.createEmptyMetricData();
    }
    return bucket.aggregateByTimeFrame(timeFrame);
  }

  /**
   * Interroge les métriques avec des filtres
   */
  async queryMetrics(query: MetricQuery): Promise<SystemMetrics[]> {
    const { timeFrame, filters } = query;
    let metrics = await this.getMetrics(timeFrame);

    // Appliquer les filtres
    if (filters) {
      metrics = metrics.filter(metric => {
        return Object.entries(filters).every(([key, value]) => {
          if (Array.isArray(value)) {
            return value.includes(metric.tags[key]);
          }
          return metric.tags[key] === value;
        });
      });
    }

    return metrics;
  }

  /**
   * Valide une métrique
   */
  validateMetric(metric: SystemMetrics): MetricValidation {
    const validation: MetricValidation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Vérifier les champs requis
    if (!metric.name) {
      validation.isValid = false;
      validation.errors?.push('Metric name is required');
    }

    if (typeof metric.value !== 'number') {
      validation.isValid = false;
      validation.errors?.push('Metric value must be a number');
    }

    if (!metric.timestamp) {
      validation.isValid = false;
      validation.errors?.push('Timestamp is required');
    }

    // Vérifier les valeurs aberrantes pour les métriques RPM
    if (metric.name.startsWith('rpm.')) {
      if (metric.name.includes('frametime') && metric.value > 100) {
        validation.warnings?.push('High frametime detected (>100ms)');
      }

      if (metric.name.includes('latency') && metric.value > 200) {
        validation.warnings?.push('High latency detected (>200ms)');
      }

      if (metric.name.includes('memory') && metric.value > 1000000000) {
        validation.warnings?.push('High memory usage detected (>1GB)');
      }
    }

    return validation;
  }

  /**
   * Transforme une métrique
   */
  transformMetric(metric: SystemMetrics, transformation: MetricTransformation): SystemMetrics {
    const transformed = { ...metric };

    switch (transformation.type) {
      case 'scale':
        transformed.value *= transformation.value;
        break;
      case 'offset':
        transformed.value += transformation.value;
        break;
      case 'rate':
        // Calculer le taux de changement
        const previousValue = this.getPreviousValue(metric.name);
        if (previousValue !== undefined) {
          transformed.value = (metric.value - previousValue) / transformation.value;
        }
        break;
      case 'delta':
        const lastValue = this.getPreviousValue(metric.name);
        if (lastValue !== undefined) {
          transformed.value = metric.value - lastValue;
        }
        break;
    }

    return transformed;
  }

  /**
   * Récupère la valeur précédente d'une métrique
   */
  private getPreviousValue(metricName: string): number | undefined {
    const bucket = this.metrics.get(metricName);
    if (bucket) {
      const data = bucket.getBucketData();
      return data.count > 0 ? data.avg : undefined;
    }
    return undefined;
  }

  /**
   * Nettoie les données anciennes
   */
  async cleanup(olderThan: number): Promise<number> {
    let totalDeleted = 0;
    for (const [metricName, bucket] of this.metrics) {
      const deleted = bucket.cleanupOldData(olderThan);
      totalDeleted += deleted;

      // Supprimer les buckets vides
      if (bucket.getBucketData().count === 0) {
        this.metrics.delete(metricName);
      }
    }

    // Nettoyer aussi les valeurs de latence et frametime trop vieilles
    this.cleanupRPMSpecificMetrics(olderThan);

    return totalDeleted;
  }

  /**
   * Récupère les statistiques de la collection
   */
  async getCollectionStats(): Promise<{
    totalMetrics: number;
    oldestMetric: number;
    newestMetric: number;
    storageSize: number;
  }> {
    let totalMetrics = 0;
    let oldestMetric = Date.now();
    let newestMetric = 0;
    let storageSize = 0;

    for (const bucket of this.metrics.values()) {
      const data = bucket.getBucketData();
      totalMetrics += data.count;
      oldestMetric = Math.min(oldestMetric, data.lastUpdate);
      newestMetric = Math.max(newestMetric, data.lastUpdate);
      storageSize += bucket.getStorageSize();
    }

    // Ajouter les tailles des tableaux RPM spécifiques
    storageSize += this.rpmLatencyValues.length * 8;
    for (const values of this.rpmFrametimeValues.values()) {
      storageSize += values.length * 8;
    }
    for (const values of this.rpmMemoryUsage.values()) {
      storageSize += values.length * 8;
    }

    return {
      totalMetrics,
      oldestMetric,
      newestMetric,
      storageSize
    };
  }

  // Méthodes spécifiques au RPM

  /**
   * Récupère les statistiques de performance RPM
   */
  getRPMPerformanceStats(): {
    avgLatency: number;
    maxLatency: number;
    avgFrametime: Record<string, number>;
    maxFrametime: Record<string, number>;
    memoryUsage: Record<string, number>;
  } {
    // Calcul de la latence moyenne
    const avgLatency = this.rpmLatencyValues.length > 0
      ? this.rpmLatencyValues.reduce((sum, val) => sum + val, 0) / this.rpmLatencyValues.length
      : 0;

    // Latence maximum
    const maxLatency = this.rpmLatencyValues.length > 0
      ? Math.max(...this.rpmLatencyValues)
      : 0;

    // Frametime par composant
    const avgFrametime: Record<string, number> = {};
    const maxFrametime: Record<string, number> = {};

    for (const [componentId, values] of this.rpmFrametimeValues.entries()) {
      if (values.length > 0) {
        avgFrametime[componentId] = values.reduce((sum, val) => sum + val, 0) / values.length;
        maxFrametime[componentId] = Math.max(...values);
      }
    }

    // Utilisation mémoire
    const memoryUsage: Record<string, number> = {};
    for (const [memoryType, values] of this.rpmMemoryUsage.entries()) {
      if (values.length > 0) {
        // Utiliser la dernière valeur comme valeur actuelle
        memoryUsage[memoryType] = values[values.length - 1];
      }
    }

    return {
      avgLatency,
      maxLatency,
      avgFrametime,
      maxFrametime,
      memoryUsage
    };
  }

  /**
   * Ajoute les métriques de performance RPM calculées au résultat
   */
  private addRPMPerformanceMetrics(result: SystemMetrics[], timeFrame: TimeFrame): void {
    const stats = this.getRPMPerformanceStats();
    // Utilisation de timeFrame pour filtrer les métriques par période
    const currentTime = Date.now();
    const isInTimeFrame = currentTime >= timeFrame.start && currentTime <= timeFrame.end;

    // Si on n'est pas dans la période demandée, on peut éventuellement
    // retourner sans ajouter de métriques
    if (!isInTimeFrame && timeFrame.start !== 0 && timeFrame.end !== 0) {
      return;
    }

    // Ajouter la métrique de latence moyenne
    result.push({
      name: 'rpm.latency.avg',
      timestamp: Date.now(),
      value: stats.avgLatency,
      unit: 'ms',
      tags: { source: 'rpm', calculated: 'true' },
      source: 'rpm-collector',
      type: 'gauge'
    });

    // Ajouter la métrique de latence max
    result.push({
      name: 'rpm.latency.max',
      timestamp: Date.now(),
      value: stats.maxLatency,
      unit: 'ms',
      tags: { source: 'rpm', calculated: 'true' },
      source: 'rpm-collector',
      type: 'gauge'
    });

    // Ajouter les métriques de frametime par composant
    for (const [componentId, avgValue] of Object.entries(stats.avgFrametime)) {
      result.push({
        name: `rpm.frametime.${componentId}.avg`,
        timestamp: Date.now(),
        value: avgValue,
        unit: 'ms',
        tags: { source: 'rpm', component: componentId, calculated: 'true' },
        source: 'rpm-collector',
        type: 'gauge'
      });
    }

    for (const [componentId, maxValue] of Object.entries(stats.maxFrametime)) {
      result.push({
        name: `rpm.frametime.${componentId}.max`,
        timestamp: Date.now(),
        value: maxValue,
        unit: 'ms',
        tags: { source: 'rpm', component: componentId, calculated: 'true' },
        source: 'rpm-collector',
        type: 'gauge'
      });
    }

    // Ajouter les métriques d'utilisation mémoire
    for (const [memoryType, value] of Object.entries(stats.memoryUsage)) {
      result.push({
        name: `rpm.memory.${memoryType}.current`,
        timestamp: Date.now(),
        value: value,
        unit: 'bytes',
        tags: { source: 'rpm', memoryType, calculated: 'true' },
        source: 'rpm-collector',
        type: 'gauge'
      });
    }
  }

  /**
   * Nettoie les métriques spécifiques au RPM
   */
  private cleanupRPMSpecificMetrics(olderThan: number): void {
    // Nous pouvons enregistrer un timestamp à chaque ajout de métrique
    // et filtrer basé sur ce timestamp
    const now = Date.now();
    const cutoffTime = now - (now - olderThan);

    // Au lieu de simplement limiter la taille, on nettoie également les anciennes métriques
    this.pruneLatencyValues(cutoffTime);

    for (const componentId of this.rpmFrametimeValues.keys()) {
      this.pruneFrametimeValues(componentId, cutoffTime);
    }

    for (const memoryType of this.rpmMemoryUsage.keys()) {
      this.pruneMemoryValues(memoryType, cutoffTime);
    }
  }
  /**
   * Limite la taille du tableau de valeurs de latence
   */
  private pruneLatencyValues(cutoffTime?: number): void {
    const maxValues = 1000; // Limiter à 1000 valeurs

    if (cutoffTime && this.latencyTimestamps) {
      // Si nous avons un cutoffTime et un tableau de timestamps associé aux valeurs
      // On filtre les valeurs plus récentes que cutoffTime
      const newValues: number[] = [];
      const newTimestamps: number[] = [];

      for (let i = 0; i < this.rpmLatencyValues.length; i++) {
        if (this.latencyTimestamps[i] >= cutoffTime) {
          newValues.push(this.rpmLatencyValues[i]);
          newTimestamps.push(this.latencyTimestamps[i]);
        }
      }

      this.rpmLatencyValues = newValues;
      this.latencyTimestamps = newTimestamps;
    } else if (this.rpmLatencyValues.length > maxValues) {
      // Sinon, on se contente de limiter la taille
      this.rpmLatencyValues = this.rpmLatencyValues.slice(-maxValues);
      if (this.latencyTimestamps) {
        this.latencyTimestamps = this.latencyTimestamps.slice(-maxValues);
      }
    }
  }

  /**
   * Limite la taille du tableau de valeurs de frametime
   */
  private pruneFrametimeValues(componentId: string, cutoffTime?: number): void {
    const maxValues = 1000;
    const values = this.rpmFrametimeValues.get(componentId) || [];
    const timestamps = this.frametimeTimestamps.get(componentId) || [];

    if (cutoffTime && timestamps.length === values.length) {
      // Filtrer par cutoffTime
      const newValues: number[] = [];
      const newTimestamps: number[] = [];

      for (let i = 0; i < values.length; i++) {
        if (timestamps[i] >= cutoffTime) {
          newValues.push(values[i]);
          newTimestamps.push(timestamps[i]);
        }
      }

      this.rpmFrametimeValues.set(componentId, newValues);
      this.frametimeTimestamps.set(componentId, newTimestamps);
    } else if (values.length > maxValues) {
      // Limiter la taille
      this.rpmFrametimeValues.set(componentId, values.slice(-maxValues));
      if (timestamps.length > 0) {
        this.frametimeTimestamps.set(componentId, timestamps.slice(-maxValues));
      }
    }
  }

  /**
   * Limite la taille du tableau de valeurs d'utilisation mémoire
   */
  private pruneMemoryValues(memoryType: string, cutoffTime?: number): void {
    const maxValues = 100;
    const values = this.rpmMemoryUsage.get(memoryType) || [];
    const timestamps = this.memoryTimestamps.get(memoryType) || [];

    if (cutoffTime && timestamps.length === values.length) {
      // Filtrer par cutoffTime
      const newValues: number[] = [];
      const newTimestamps: number[] = [];

      for (let i = 0; i < values.length; i++) {
        if (timestamps[i] >= cutoffTime) {
          newValues.push(values[i]);
          newTimestamps.push(timestamps[i]);
        }
      }

      this.rpmMemoryUsage.set(memoryType, newValues);
      this.memoryTimestamps.set(memoryType, newTimestamps);
    } else if (values.length > maxValues) {
      // Limiter la taille
      this.rpmMemoryUsage.set(memoryType, values.slice(-maxValues));
      if (timestamps.length > 0) {
        this.memoryTimestamps.set(memoryType, timestamps.slice(-maxValues));
      }
    }
  }

  /**
   * Récupère ou crée un bucket pour une métrique
   */
  private getBucketForMetric(metricName: string): MetricBucket | undefined {
    let bucket = this.metrics.get(metricName);
    if (!bucket) {
      bucket = new MetricBucket();
      this.metrics.set(metricName, bucket);
    }
    return bucket;
  }

  /**
   * Crée un objet MetricData vide
   */
  private createEmptyMetricData(): MetricData {
    return {
      min: 0,
      max: 0,
      avg: 0,
      sum: 0,
      count: 0,
      lastUpdate: Date.now()
    };
  }

  /**
   * Stocke une métrique
   */
  private async storeMetric(metric: SystemMetrics): Promise<void> {
    const bucket = this.getBucketForMetric(metric.name);
    if (bucket) {
      bucket.addValue(metric.value, metric.timestamp);
    }
  }
}