/**
 * @class RPMAlertSystem
 * @extends RPMEventEmitter
 * @brief Système d'alertes RPM
 * @details Surveille l'état du système RPM et émet des alertes
 */
class RPMAlertSystem extends RPMEventEmitter {
  /** 
   * @brief Vérificateur de santé du système
   * @private 
   */
  private healthCheck: RPMHealthCheck;

  /** 
   * @brief Historique des alertes
   * @private 
   */
  private alertHistory: Alert[] = [];

  /**
   * @brief Constructeur
   * @param healthCheck Vérificateur de santé à utiliser
   */
  constructor(healthCheck: RPMHealthCheck) {
    super();
    this.healthCheck = healthCheck;
    this.startMonitoring();
  }

  /**
   * @brief Démarre la surveillance du système
   * @private
   */
  private startMonitoring(): void {
    setInterval(() => {
      const status = this.healthCheck.checkHealth();
      if (!status.isHealthy) {
        this.createAlert(status);
      }
    }, 1000);
  }

  /**
   * @brief Crée une nouvelle alerte
   * @param status État de santé ayant déclenché l'alerte
   * @private
   */
  private createAlert(status: HealthStatus): void {
    const alert: Alert = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: this.determineAlertType(status),
      severity: this.determineSeverity(status),
      details: status
    };

    this.alertHistory.push(alert);
    this.emit('alert', alert);
  }

  private determineAlertType(status: HealthStatus): AlertType {
    // Logique de détermination du type d'alerte
    return 'ERROR';
  }
}