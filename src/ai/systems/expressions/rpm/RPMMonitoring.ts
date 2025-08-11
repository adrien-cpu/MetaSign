/**
 * @class RPMMonitoring
 * @extends RPMEventEmitter
 * @brief Système de monitoring RPM
 * @details Surveille et enregistre les métriques du système RPM
 */
class RPMMonitoring extends RPMEventEmitter {
  /**
   * @brief Métriques du système
   * @private
   */
  private metrics: RPMMetrics = {
    /** @brief Historique des latences */
    latency: [],
    /** @brief Nombre d'erreurs de synchronisation */
    syncErrors: 0,
    /** @brief Nombre de changements d'état */
    stateChanges: 0,
    /** @brief Dernier horodatage de mise à jour */
    lastUpdate: Date.now()
  };

  /**
   * @brief Constructeur
   * @details Initialise le système de monitoring
   */
  constructor() {
    super();
    this.initializeMonitoring();
  }

  /**
   * @brief Initialise le monitoring
   * @private
   */
  private initializeMonitoring(): void {
    this.subscribe(RPMEvent.LATENCY_WARNING, this.trackLatency.bind(this));
    this.subscribe(RPMEvent.SYNC_ERROR, this.trackSyncError.bind(this));
    this.subscribe(RPMEvent.STATE_CHANGE, this.trackStateChange.bind(this));
  }

  /**
   * @brief Suit la latence du système
   * @param data Données de latence
   * @private
   */
  private trackLatency(data: { latency: number }): void {
    this.metrics.latency.push({
      value: data.latency,
      timestamp: Date.now()
    });
    
    if (this.metrics.latency.length > 100) {
      this.metrics.latency.shift();
    }
  }

  getMetrics(): RPMMetrics {
    return { ...this.metrics };
  }
}
// RPMMonitoring.ts - Extensions
interface LSFQualityMetrics {
  grammaticalAccuracy: number;
  fluidityScore: number;
  culturalScore: number;
  expressionLatency: number;
}

export class RPMMonitoring {
  private lsfMetrics: LSFQualityMetrics;
  private readonly METRICS_HISTORY_SIZE = 100;
  private metricsHistory: LSFQualityMetrics[] = [];

  constructor() {
    this.lsfMetrics = this.initializeLSFMetrics();
  }

  updateLSFMetrics(metrics: Partial<LSFQualityMetrics>) {
    this.lsfMetrics = { ...this.lsfMetrics, ...metrics };
    this.metricsHistory.push({ ...this.lsfMetrics });
    if (this.metricsHistory.length > this.METRICS_HISTORY_SIZE) {
      this.metricsHistory.shift();
    }
  }

  getLSFQualityReport(): LSFQualityReport {
    return {
      currentMetrics: this.lsfMetrics,
      trends: this.calculateMetricsTrends(),
      recommendations: this.generateRecommendations()
    };
  }

  private calculateMetricsTrends() {
    // Calcul des tendances sur les dernières métriques
    return {
      grammarTrend: this.calculateTrend('grammaticalAccuracy'),
      fluidityTrend: this.calculateTrend('fluidityScore'),
      culturalTrend: this.calculateTrend('culturalScore')
    };
  }
}