/**
 * @class RPMHealthCheck
 * @brief Vérificateur de santé RPM
 * @details Surveille et évalue l'état de santé du système RPM
 */
class RPMHealthCheck {
  /** 
   * @brief Système de monitoring
   * @private 
   */
  private monitoring: RPMMonitoring;

  /** 
   * @brief Seuils de surveillance
   * @private 
   */
  private thresholds = {
    /** @brief Latence maximale acceptable (ms) */
    maxLatency: 200,
    /** @brief Nombre maximal d'erreurs de synchronisation */
    maxSyncErrors: 5,
    /** @brief Temps maximal sans mise à jour (ms) */
    maxTimeWithoutUpdate: 5000
  };

  /**
   * @brief Constructeur
   * @param monitoring Instance de monitoring RPM
   */
  constructor(monitoring: RPMMonitoring) {
    this.monitoring = monitoring;
  }

  /**
   * @brief Vérifie l'état de santé du système
   * @returns HealthStatus État de santé actuel
   */
  checkHealth(): HealthStatus {
    const metrics = this.monitoring.getMetrics();
    return {
      isHealthy: this.evaluateMetrics(metrics),
      latencyStatus: this.checkLatency(metrics.latency),
      syncStatus: this.checkSyncErrors(metrics.syncErrors),
      updateStatus: this.checkLastUpdate(metrics.lastUpdate)
    };
  }

  /**
   * @brief Évalue les métriques du système
   * @param metrics Métriques à évaluer
   * @returns boolean true si les métriques sont dans les seuils
   * @private
   */
  private evaluateMetrics(metrics: RPMMetrics): boolean {
    const avgLatency = this.calculateAverageLatency(metrics.latency);
    const timeSinceUpdate = Date.now() - metrics.lastUpdate;
    
    return (
      avgLatency < this.thresholds.maxLatency &&
      metrics.syncErrors < this.thresholds.maxSyncErrors &&
      timeSinceUpdate < this.thresholds.maxTimeWithoutUpdate
    );
  }
}