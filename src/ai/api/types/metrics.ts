export interface MetricDefinition {
  name: string;
  type: MetricType;
  unit: string;
  thresholds: MetricThresholds;
}

export interface MetricValue {
  metricId: string;
  value: number;
  timestamp: number;
  context: MetricContext;
}

export interface MetricThresholds {
  warning: number;
  critical: number;
  target?: number;
}

export interface MetricContext {
  source: string;
  labels: Record<string, string>;
  interval?: [number, number];
}

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

export interface MetricsRegistry {
  definitions: Map<string, MetricDefinition>;
  values: Map<string, MetricValue[]>;
  aggregations: Map<string, AggregationRule>;
}

export interface AggregationRule {
  type: AggregationType;
  window: number;
  groupBy?: string[];
}

export type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'percentile';