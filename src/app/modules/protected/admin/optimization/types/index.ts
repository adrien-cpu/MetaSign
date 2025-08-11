// src/app/adminModules/optimization/types/index.ts

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Status = 'ACTIVE' | 'RESOLVED' | 'ACKNOWLEDGED' | 'IN_PROGRESS';
export type Category = 'PERFORMANCE' | 'SYSTEM' | 'SECURITY' | 'QUALITY';
export type OptimizationType = 'CODE' | 'ARCHITECTURE' | 'PERFORMANCE' | 'RESOURCE';

export interface Impact {
  type: string;
  value: string;
  trend: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

export interface BaseItem {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  impacts: Impact[];
}

export interface Alert extends BaseItem {
  severity: Severity;
  status: Status;
  category: Category;
  source: string;
  affectedComponents: string[];
  resolvedAt?: number;
  resolvedBy?: string;
  resolution?: string;
}

export interface Improvement extends BaseItem {
  type: OptimizationType;
  priority: Severity;
  status: Status;
  suggestedBy: string;
  codeChanges?: string[];
  implementationComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedEffort: string;
  metrics: {
    performance?: number;
    reliability?: number;
    maintainability?: number;
    [key: string]: number | undefined;
  };
}

export interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: number;
  threshold: {
    warning: number;
    critical: number;
  };
  category: Category;
  history: Array<{
    timestamp: number;
    value: number;
  }>;
}

export interface OptimizationState {
  alerts: Alert[];
  improvements: Improvement[];
  metrics: Metric[];
  filters: {
    severity: Severity[];
    status: Status[];
    category: Category[];
    type: OptimizationType[];
    search: string;
  };
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOptions {
  severity?: Severity[];
  status?: Status[];
  category?: Category[];
  type?: OptimizationType[];
  search?: string;
  dateRange?: {
    start: number;
    end: number;
  };
}

export interface MetricThreshold {
  warning: number;
  critical: number;
  unit: string;
}

export interface ThresholdConfig {
  [key: string]: MetricThreshold;
}