import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  OptimizationState,
  Alert,
  Improvement,
  Metric,
  FilterOptions,
  Status
} from '../types';

interface OptimizationStore extends OptimizationState {
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, update: Partial<Alert>) => void;
  resolveAlert: (id: string, resolution: string, resolvedBy: string) => void;
  acknowledgeAlert: (id: string) => void;
  deleteAlert: (id: string) => void;
  addImprovement: (improvement: Improvement) => void;
  updateImprovement: (id: string, update: Partial<Improvement>) => void;
  deleteImprovement: (id: string) => void;
  implementImprovement: (id: string) => void;
  updateMetric: (metric: Metric) => void;
  addMetricDataPoint: (id: string, value: number) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  clearFilters: () => void;
  fetchAlerts: () => Promise<void>;
  fetchImprovements: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
}

const initialState: OptimizationState = {
  alerts: [],
  improvements: [],
  metrics: [],
  filters: {
    severity: [],
    status: [],
    category: [],
    type: [],
    search: ''
  }
};

export const useOptimizationStore = create<OptimizationStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        addAlert: (alert: Alert) =>
          set((state: OptimizationState) => ({ alerts: [...state.alerts, alert] })),
        updateAlert: (id: string, update: Partial<Alert>) =>
          set((state: OptimizationState) => ({
            alerts: state.alerts.map((alert) =>
              alert.id === id ? { ...alert, ...update } : alert
            ),
          })),
        resolveAlert: (id: string, resolution: string, resolvedBy: string) =>
          set((state: OptimizationState) => ({
            alerts: state.alerts.map((alert) =>
              alert.id === id
                ? {
                  ...alert,
                  status: 'RESOLVED' as Status,
                  resolution,
                  resolvedBy,
                  resolvedAt: Date.now(),
                }
                : alert
            ),
          })),
        acknowledgeAlert: (id: string) =>
          set((state: OptimizationState) => ({
            alerts: state.alerts.map((alert) =>
              alert.id === id
                ? { ...alert, status: 'ACKNOWLEDGED' as Status }
                : alert
            ),
          })),
        deleteAlert: (id: string) =>
          set((state: OptimizationState) => ({
            alerts: state.alerts.filter((alert) => alert.id !== id),
          })),
        addImprovement: (improvement: Improvement) =>
          set((state: OptimizationState) => ({
            improvements: [...state.improvements, improvement],
          })),
        updateImprovement: (id: string, update: Partial<Improvement>) =>
          set((state: OptimizationState) => ({
            improvements: state.improvements.map((improvement) =>
              improvement.id === id
                ? { ...improvement, ...update }
                : improvement
            ),
          })),
        deleteImprovement: (id: string) =>
          set((state: OptimizationState) => ({
            improvements: state.improvements.filter(
              (improvement) => improvement.id !== id
            ),
          })),
        implementImprovement: (id: string) =>
          set((state: OptimizationState) => ({
            improvements: state.improvements.map((improvement) =>
              improvement.id === id
                ? { ...improvement, status: 'IN_PROGRESS' as Status }
                : improvement
            ),
          })),
        updateMetric: (metric: Metric) =>
          set((state: OptimizationState) => ({
            metrics: state.metrics.map((m) =>
              m.id === metric.id ? metric : m
            ),
          })),
        addMetricDataPoint: (id: string, value: number) =>
          set((state: OptimizationState) => ({
            metrics: state.metrics.map((metric) =>
              metric.id === id
                ? {
                  ...metric,
                  value,
                  history: [
                    ...metric.history,
                    { timestamp: Date.now(), value },
                  ],
                }
                : metric
            ),
          })),
        setFilters: (filters: Partial<FilterOptions>) =>
          set((state: OptimizationState) => ({
            filters: { ...state.filters, ...filters },
          })),
        clearFilters: () =>
          set(() => ({
            filters: initialState.filters,
          })),
        fetchAlerts: async () => {
          try {
            const response = await fetch('/api/admin/optimization/alerts');
            if (response.ok) {
              const alerts = await response.json();
              set({ alerts });
            }
          } catch (error) {
            console.error('Failed to fetch alerts:', error);
          }
        },
        fetchImprovements: async () => {
          try {
            const response = await fetch('/api/admin/optimization/improvements');
            if (response.ok) {
              const improvements = await response.json();
              set({ improvements });
            }
          } catch (error) {
            console.error('Failed to fetch improvements:', error);
          }
        },
        fetchMetrics: async () => {
          try {
            const response = await fetch('/api/admin/optimization/metrics');
            if (response.ok) {
              const metrics = await response.json();
              set({ metrics });
            }
          } catch (error) {
            console.error('Failed to fetch metrics:', error);
          }
        },
      }),
      {
        name: 'optimization-storage',
      }
    )
  )
);
