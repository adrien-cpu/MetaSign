/**
 * src/ai/api/common/detection/types/index.ts
 * @file index.ts
 * @description
 * Centralisation des types pour la détection d'anomalies et de corrélations
 */
// 1. First import all types that will be re-exported
import type {
    SystemMetrics,
    Anomaly,
    MetricStats,
    AnomalyThresholds,
    AnomalyContext,
    ThresholdConfig,
    AnomalyRecord,
    SystemState,
    AnomalyType,
    IAnomalyDetector,
    MetricData
} from './AnomalyTypes';

import type {
    UnifiedDetectionConfig,
    Correlation,
    TrendAnalysis,
    DetectionResult as UnifiedDetectionResult,
    UnifiedAnomalyReport,
    AnomalyAnalysisResult as UnifiedAnalysisResult
} from './UnifiedTypes';

import type {
    BaseCorrelation,
    CorrelatedAnomaly,
    DetectionResult as CorrelationDetectionResult,
    CorrelationConfig,
    CorrelationMetrics,
    AnomalyGroup
} from './CorrelationTypes';

import type {
    CPUMetrics,
    MemoryMetrics,
    NetworkMetrics,
    PerformanceMetrics
} from './MetricTypes';

// 2. Export all types explicitly to avoid naming conflicts
export type {
    // From AnomalyTypes
    SystemMetrics,
    Anomaly,
    MetricStats,
    AnomalyThresholds,
    AnomalyContext,
    ThresholdConfig,
    AnomalyRecord,
    SystemState,
    AnomalyType,
    IAnomalyDetector,
    MetricData,

    // From UnifiedTypes
    UnifiedDetectionConfig,
    Correlation,
    TrendAnalysis,
    UnifiedDetectionResult,
    UnifiedAnomalyReport,
    UnifiedAnalysisResult,

    // From CorrelationTypes
    BaseCorrelation,
    CorrelatedAnomaly,
    CorrelationDetectionResult,
    CorrelationConfig,
    CorrelationMetrics,
    AnomalyGroup,

    // From MetricTypes
    CPUMetrics,
    MemoryMetrics,
    NetworkMetrics,
    PerformanceMetrics
};

// 3. Export the AnomalyDetectionError class directly
export type { AnomalyDetectionError } from './AnomalyTypes';