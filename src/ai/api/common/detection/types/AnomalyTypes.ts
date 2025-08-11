/**
 * src/ai/api/common/detection/types/AnomalyTypes.ts
 * @file AnomalyTypes.ts
 * @description
 * Types et interfaces pour la détection d'anomalies dans les métriques système
 * Métriques système utilisées pour la détection d'anomalies
 */
export interface SystemMetrics {
  value: number;
  metricName: string;
  timestamp: number;
  cpu: number;
  memory: number;
  latency: number;
  errorRate: number;
  performance: {
    responseTime: number;
    throughput: number;
    utilization: number;
  };
  resources: {
    cpuLoad: number;
    memoryUsage: number;
    diskSpace: number;
    networkBandwidth: number;
  };
  health: {
    status: string;
    uptime: number;
    errorCount: number;
    warningCount: number;
  };
}

/**
 * Données de métriques simplifiées
 */
export interface MetricData {
  name: string;
  value: number;
  timestamp: number;
  source: string;
  unit?: string;
  tags?: Record<string, string>;
}

/**
 * Types d'anomalies détectables
 */
export type AnomalyType = 'performance' | 'resource' | 'security' | 'availability';

/**
 * Types d'anomalies détectables (format enum)
 */
export enum DetailedAnomalyType {
  SPIKE = 'spike',                     // Pic soudain d'une métrique
  DROP = 'drop',                       // Chute soudaine d'une métrique
  TREND = 'trend',                     // Tendance anormale 
  PATTERN_CHANGE = 'pattern_change',   // Changement de modèle
  OUTLIER = 'outlier',                 // Valeur aberrante
  THRESHOLD_BREACH = 'threshold_breach',// Dépassement de seuil
  CORRELATION_BREAK = 'correlation_break', // Rupture de corrélation entre métriques
  SEASONALITY_BREAK = 'seasonality_break' // Rupture de saisonnalité
}

/**
 * Métriques affectées par une anomalie
 */
export interface AffectedMetrics {
  name: string;
  currentValue: number;
  threshold: number;
  deviation: number;
}

/**
 * Contexte de l'analyse d'anomalies
 */
export interface AnomalyContext {
  timestamp: number;
  source: string;
  relatedEvents: string[];
  timeWindow?: number;                       // Fenêtre d'analyse en ms
  serviceId?: string;                        // Identifiant du service analysé
  environment?: 'dev' | 'staging' | 'prod';  // Environnement d'exécution
  baselineAvailable?: boolean;               // Si une ligne de base est disponible
  previousMetrics?: SystemMetrics[];         // Historique des métriques précédentes
  knownIssues?: string[];                    // Problèmes connus actuels
  features?: string[];                       // Fonctionnalités activées
}

/**
 * Structure d'une anomalie
 * Note: Étendue avec metricName et timestamp pour la compatibilité avec CorrelationEngine
 */
export interface Anomaly {
  type: AnomalyType;
  severity: 'low' | 'medium' | 'high';
  details: string;
  metrics: AffectedMetrics;
  context: AnomalyContext;
  // Propriétés additionnelles requises par CorrelationEngine
  metricName: string;
  timestamp: number;
  value?: number;
  expectedValue?: number;
  deviation?: number;
}

/**
 * Niveaux de sévérité des anomalies
 */
export enum SeverityLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Enregistrement d'une anomalie détectée (requis par IAnomalyDetector)
 */
export interface AnomalyRecord {
  id: string;                          // Identifiant unique de l'anomalie
  type: AnomalyType;                   // Type d'anomalie
  metricName: string;                  // Nom de la métrique concernée
  timestamp: number;                   // Horodatage de détection
  value: number;                       // Valeur actuelle
  expectedValue?: number;              // Valeur attendue
  deviation: number;                   // Écart en pourcentage
  severity: SeverityLevel | 'low' | 'medium' | 'high'; // Niveau de sévérité
  context: {                           // Contexte spécifique à l'anomalie
    serviceId: string;                 // Service concerné
    environment: string;               // Environnement
    relatedMetrics?: string[];         // Métriques liées
    previousOccurrences?: number;      // Occurrences précédentes
  };
  message: string;                     // Message décrivant l'anomalie
  suggestedActions?: string[];         // Actions suggérées
}

/**
 * Statistiques pour les métriques
 */
export interface MetricStats {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  count: number;
  sum: number;
  variance: number;
  q1?: number;
  q3?: number;
  iqr?: number;
}

/**
 * État du système
 */
export interface SystemState {
  status: 'normal' | 'warning' | 'critical';
  timestamp: number;
  lastUpdated: number;
  components: {
    name: string;
    status: 'healthy' | 'degraded' | 'offline';
    metrics: Record<string, number>;
    lastIssue?: {
      timestamp: number;
      description: string;
      resolved: boolean;
    };
  }[];
  trends: {
    metric: string;
    direction: 'increasing' | 'decreasing' | 'stable';
    rate: number;
    window: number;
  }[];
  issues: {
    id: string;
    description: string;
    severity: SeverityLevel | 'low' | 'medium' | 'high';
    timestamp: number;
    status: 'new' | 'acknowledged' | 'resolved';
    relatedComponent?: string;
  }[];
}

/**
 * Configuration des seuils pour les anomalies
 */
export interface AnomalyThresholds {
  metricName: string;
  thresholds: {
    warning: {
      min?: number;
      max?: number;
      changeRate?: number;
    };
    critical: {
      min?: number;
      max?: number;
      changeRate?: number;
    };
  };
  sensitivityLevel: number; // 0-1
  adaptiveThresholding: boolean;
  seasonalAdjustment: boolean;
  baselineWindow: number; // en ms
}

/**
 * Erreur liée à la détection d'anomalies
 */
export interface AnomalyDetectionError extends Error {
  name: 'AnomalyDetectionError';
  code: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Interface du détecteur d'anomalies
 */
export interface IAnomalyDetector {
  detectAnomalies(metrics: SystemMetrics): Promise<Anomaly[]>;
  updateBaselineStats(newMetrics: SystemMetrics): void;
  detectTrendAnomalies(metrics: SystemMetrics): Promise<Anomaly[]>;
  detectContextualAnomalies(metrics: SystemMetrics): Promise<Anomaly[]>;
  detectZScoreAnomalies(metrics: SystemMetrics, stats: MetricStats): Promise<Anomaly[]>;
  detectIQRAnomalies(metrics: SystemMetrics): Promise<Anomaly[]>;
}

/**
 * Configuration de seuil pour une métrique spécifique
 */
export interface MetricThreshold {
  metricName: string;                  // Nom de la métrique
  lowerBound?: number;                 // Borne inférieure
  upperBound?: number;                 // Borne supérieure
  percentageChange?: number;           // Changement en pourcentage
  minSampleSize?: number;              // Taille minimale d'échantillon
  sensitivityLevel?: number;           // Niveau de sensibilité (0-1)
  severityMapping?: {                  // Mappage des niveaux de sévérité
    warning?: number;                  // Seuil pour warning
    error?: number;                    // Seuil pour error
    critical?: number;                 // Seuil pour critical
  };
}

/**
 * Configuration complète des seuils pour la détection d'anomalies
 */
export interface ThresholdConfig {
  globalSensitivity: number;           // Sensibilité globale (0-1)
  metrics: MetricThreshold[];          // Configuration par métrique
  timeWindows: {                       // Fenêtres temporelles d'analyse
    short: number;                     // Courte période (ms)
    medium: number;                    // Période moyenne (ms)
    long: number;                      // Longue période (ms)
  };
  seasonalityEnabled: boolean;         // Activer l'analyse saisonnière
  correlationEnabled: boolean;         // Activer l'analyse de corrélation
  patternDetectionEnabled: boolean;    // Activer la détection de motifs
  baselineAdjustmentRate: number;      // Taux d'ajustement de la ligne de base (0-1)
  minimumAnomalyScore: number;         // Score minimum pour signaler une anomalie (0-1)
  suppressKnownIssues: boolean;        // Ignorer les problèmes connus
  customRules?: Record<string, unknown>; // Règles personnalisées
}