/**
 * src/ai/api/common/detection/interfaces/IAnomalyDetector.ts
 * @file IAnomalyDetector.ts
  * Interface pour la détection d'anomalies dans les métriques système
  * @description
  * Cette interface définit les méthodes nécessaires pour détecter les anomalies
  * dans les métriques système. Elle inclut des méthodes pour détecter les anomalies,
  * configurer les seuils de détection et réinitialiser l'état interne du détecteur.
  * @version 1.0
  * @example
  * import { IAnomalyDetector } from './IAnomalyDetector';
  * const anomalyDetector: IAnomalyDetector = new AnomalyDetector();
  * const anomalies = await anomalyDetector.detectAnomalies(metrics, context);
  * anomalyDetector.setThresholds(config);
  * anomalyDetector.reset();
  * @remarks
  * - Cette interface est conçue pour être implémentée par des classes qui fournissent
  *   des algorithmes de détection d'anomalies spécifiques.
  * - Les types de données utilisés dans les méthodes sont définis dans le fichier
  *   `AnomalyTypes.ts`.
  * - Les méthodes sont asynchrones pour permettre des opérations de détection
  *   potentiellement longues, comme l'analyse de grandes quantités de données.
  * - La méthode `setThresholds` permet de configurer dynamiquement les seuils
  *   de détection d'anomalies, ce qui peut être utile pour ajuster le comportement
  *   du détecteur en fonction des besoins spécifiques de l'application.
  * - La méthode `reset` permet de réinitialiser l'état interne du détecteur,
  *   ce qui peut être utile pour libérer des ressources ou redémarrer le processus
  *   de détection d'anomalies.
  * @license MIT
  */
import { SystemMetrics, AnomalyContext, AnomalyRecord, ThresholdConfig } from '../types/AnomalyTypes';

export interface IAnomalyDetector {
  /**
   * Détecte les anomalies dans les métriques système fournies
   * @param metrics Les métriques système actuelles
   * @param context Le contexte de l'analyse d'anomalies
   * @returns Un tableau des anomalies détectées
   */
  detectAnomalies(metrics: SystemMetrics, context: AnomalyContext): Promise<AnomalyRecord[]>;

  /**
   * Configure les seuils de détection d'anomalies
   * @param config La configuration des seuils
   */
  setThresholds(config: ThresholdConfig): void;

  /**
   * Réinitialise l'état interne du détecteur
   */
  reset(): void;
}