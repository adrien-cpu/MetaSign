// src/ai/systems/expressions/rpm/metrics/MetricsStore.ts
import { RPMMorphTargets } from '../RPMMorphTargets';

/**
 * Interface pour le cadre temporel
 */
export interface TimeFrame {
  start: number;
  end: number;
}

/**
 * Interface pour les métriques de base
 */
export interface BaseMetrics {
  cpu: number;
  memory: number;
  gpu: number;
  timestamp: number;
}

/**
 * Interface pour les métriques de morph
 */
export interface MorphMetrics {
  activeTargets: number;
  updateLatency: number;
  complexity: number;
  memoryImpact: number;
  gpuImpact: number;
}

/**
 * Interface pour les métriques de performance
 */
export interface PerformanceMetrics {
  /** Temps de frame en ms */
  frameTime: number;

  /** Variation de temps entre les frames en ms */
  jitter: number;

  /** Taille du batch */
  batchSize: number;

  /** Longueur de la file d'attente */
  queueLength: number;

  /** Taux de suppression (frames abandonnées) */
  dropRate: number;

  /** Nom de l'opération (pour la version générique) */
  operationName?: string;

  /** Temps d'exécution en ms (pour la version générique) */
  executionTime?: number;

  /** Timestamp de la mesure */
  timestamp?: number;

  /** Utilisation mémoire (pour la version générique) */
  memoryUsage?: number;
}

/**
 * Interface pour le contexte de collecte
 */
export interface CollectionContext {
  morphTargets: RPMMorphTargets;
  sessionId: string;
  priority: number;
}

/**
 * Interface pour les métriques enrichies
 */
export interface EnrichedMetrics {
  base: BaseMetrics;
  morph: MorphMetrics;
  performance: PerformanceMetrics;
  context: CollectionContext;
  enrichedAt?: number;
  sessionData?: {
    duration: number;
    averages: {
      cpu: number;
      memory: number;
      gpu: number;
      frameTime: number;
    }
  };
}

/**
 * Classe pour gérer un bucket de métriques par période de temps
 */
class MetricsBucket<T> {
  private metrics: T[] = [];
  private readonly bucketId: string;

  constructor(bucketId: string) {
    this.bucketId = bucketId;
  }

  /**
   * Ajoute des métriques au bucket
   */
  async addMetrics(metrics: T): Promise<void> {
    this.metrics.push(metrics);
  }

  /**
   * Récupère les métriques dans un intervalle de temps spécifique
   */
  async getMetrics(timeframe: TimeFrame): Promise<T[]> {
    // Pour les métriques génériques, on renvoie toutes les métriques
    // Pour les métriques enrichies, on filtrerait par timestamp
    return this.metrics;
  }

  /**
   * Retourne l'ID du bucket
   */
  getId(): string {
    return this.bucketId;
  }

  /**
   * Retourne toutes les métriques
   */
  getAllMetrics(): T[] {
    return [...this.metrics];
  }
}

/**
 * Erreur spécifique pour la gestion du stockage de métriques
 */
export class MetricsStoreError extends Error {
  constructor(message: string, public readonly originalError: unknown) {
    super(message);
    this.name = 'MetricsStoreError';
  }
}

/**
 * Classe pour le stockage des métriques en intervalles de temps
 */
export class TimeBasedMetricsStore<T> {
  private metrics: Map<string, MetricsBucket<T>>;
  private retentionPeriod: number;
  private readonly BUCKET_SIZE = 60_000; // 1 minute buckets

  constructor(retentionHours: number) {
    this.retentionPeriod = retentionHours * 3600_000; // Convert to milliseconds
    this.metrics = new Map();
    this.initializeStore();
  }

  /**
   * Stocke des métriques
   * @param metrics Métriques à stocker
   * @param timestamp Timestamp optionnel (par défaut, maintenant)
   */
  async store(metrics: T, timestamp: number = Date.now()): Promise<void> {
    try {
      // Déterminer le bucket approprié
      const bucketId = this.getBucketId(timestamp);

      // Créer ou récupérer le bucket
      let currentBucket = this.metrics.get(bucketId);
      if (!currentBucket) {
        currentBucket = new MetricsBucket<T>(bucketId);
        this.metrics.set(bucketId, currentBucket);
      }

      // Stocker les métriques
      await currentBucket.addMetrics(metrics);

      // Nettoyage des anciennes métriques
      await this.cleanupOldMetrics();
    } catch (error) {
      throw new MetricsStoreError('Failed to store metrics', error);
    }
  }

  /**
   * Récupère les métriques pour une période donnée
   */
  async getMetricsForPeriod(timeframe: TimeFrame): Promise<T[]> {
    try {
      const relevantMetrics: T[] = [];

      // Identifier les buckets pertinents
      const relevantBucketIds = this.getRelevantBucketIds(timeframe);

      // Récupérer les métriques de chaque bucket
      for (const bucketId of relevantBucketIds) {
        const bucket = this.metrics.get(bucketId);
        if (bucket) {
          const bucketMetrics = await bucket.getMetrics(timeframe);
          relevantMetrics.push(...bucketMetrics);
        }
      }

      return relevantMetrics;
    } catch (error) {
      throw new MetricsStoreError('Failed to retrieve metrics', error);
    }
  }

  /**
   * Initialise le stockage avec des buckets vides
   */
  private initializeStore(): void {
    // Création des buckets initiaux
    const now = Date.now();
    const initialBucketCount = Math.ceil(this.retentionPeriod / this.BUCKET_SIZE);

    for (let i = 0; i < initialBucketCount; i++) {
      const bucketId = this.getBucketId(now - (i * this.BUCKET_SIZE));
      this.metrics.set(bucketId, new MetricsBucket<T>(bucketId));
    }
  }

  /**
   * Calcule l'ID du bucket pour un timestamp donné
   */
  private getBucketId(timestamp: number): string {
    return Math.floor(timestamp / this.BUCKET_SIZE).toString();
  }

  /**
   * Détermine les IDs des buckets concernés par un intervalle de temps
   */
  private getRelevantBucketIds(timeframe: TimeFrame): string[] {
    const startBucketId = this.getBucketId(timeframe.start);
    const endBucketId = this.getBucketId(timeframe.end);

    const bucketIds: string[] = [];
    let currentId = parseInt(startBucketId);
    const endId = parseInt(endBucketId);

    // Ajouter tous les buckets entre le début et la fin
    while (currentId <= endId) {
      bucketIds.push(currentId.toString());
      currentId++;
    }

    return bucketIds;
  }

  /**
   * Supprime les métriques anciennes
   */
  private async cleanupOldMetrics(): Promise<void> {
    const cutoffTime = Date.now() - this.retentionPeriod;
    const cutoffBucket = this.getBucketId(cutoffTime);

    // Suppression des anciens buckets
    for (const [bucketId] of this.metrics.entries()) {
      if (parseInt(bucketId) < parseInt(cutoffBucket)) {
        this.metrics.delete(bucketId);
      }
    }
  }
}

/**
 * Classe générique pour stocker des métriques par clé
 */
export class MetricsStore<T> {
  private metrics: Map<string, T[]>;

  constructor() {
    this.metrics = new Map<string, T[]>();
  }

  /**
   * Ajoute une métrique pour une clé spécifique
   * @param key Clé associée à la métrique
   * @param metric Métrique à ajouter
   */
  public addMetrics(key: string, metric: T): void {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const metricsArray = this.metrics.get(key);
    if (metricsArray) {
      metricsArray.push(metric);
    }
  }

  /**
   * Récupère les métriques pour une clé spécifique
   * @param key Clé associée aux métriques
   * @returns Tableau des métriques pour la clé
   */
  public getMetrics(key: string): T[] {
    return this.metrics.get(key) || [];
  }

  /**
   * Récupère toutes les métriques
   * @returns Map des métriques par clé
   */
  public getAllMetrics(): Map<string, T[]> {
    return new Map(this.metrics);
  }

  /**
   * Récupère toutes les clés des métriques
   * @returns Tableau des clés
   */
  public getAllMetricsNames(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Définit les métriques pour une clé spécifique
   * @param key Clé associée aux métriques
   * @param metricsArray Tableau des métriques à définir
   */
  public setMetrics(key: string, metricsArray: T[]): void {
    this.metrics.set(key, metricsArray);
  }

  /**
   * Supprime les métriques pour une clé spécifique
   * @param key Clé associée aux métriques à supprimer
   */
  public clearMetrics(key: string): void {
    this.metrics.delete(key);
  }

  /**
   * Supprime toutes les métriques
   */
  public clearAllMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Fusionne des métriques provenant d'une autre instance
   * @param otherStore Instance de MetricsStore à fusionner
   */
  public mergeFrom(otherStore: MetricsStore<T>): void {
    otherStore.getAllMetricsNames().forEach(key => {
      const otherMetrics = otherStore.getMetrics(key);
      otherMetrics.forEach(metric => {
        this.addMetrics(key, metric);
      });
    });
  }
}