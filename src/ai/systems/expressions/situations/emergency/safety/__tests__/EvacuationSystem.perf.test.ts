// src/ai/systems/expressions/situations/emergency/safety/__tests__/EvacuationSystem.perf.test.ts
import { EvacuationHandler } from '../EvacuationHandler';
import { EmergencyCoordinator } from '../EmergencyCoordinator';
import type {
  EvacuationSituation,
  SignalContext,
  PerformanceMetrics,
  SystemChange
} from '../types';

describe('Evacuation System Performance', () => {
  let evacuationHandler: EvacuationHandler;
  let coordinator: EmergencyCoordinator;
  let testContext: SignalContext;

  const PERFORMANCE_THRESHOLDS = {
    SIGNAL_GENERATION: 100,
    COORDINATION_UPDATE: 150,
    ROUTE_RECALCULATION: 200,
    MEMORY_USAGE_LIMIT: 100 * 1024 * 1024,
    MAX_CPU_USAGE: 80
  };

  beforeEach(() => {
    testContext = {
      environment: 'INDOOR',
      population: {
        total: 1000,
        distribution: { floor1: 300, floor2: 400, floor3: 300 }
      },
      constraints: {
        maxTime: 300,
        priority: 1
      },
      resources: {
        available: ['EXIT_A', 'EXIT_B', 'STAIRS'],
        capacity: { EXIT_A: 50, EXIT_B: 50, STAIRS: 30 }
      }
    };
    evacuationHandler = new EvacuationHandler();
    coordinator = new EmergencyCoordinator();
  });

  describe('High Load Scenarios', () => {
    test('should handle large crowd evacuation efficiently', async () => {
      const largeCrowdScenario: EvacuationSituation = {
        urgency: 0.9,
        affected_areas: ['FLOOR1', 'FLOOR2', 'FLOOR3'],
        hazards: [
          { type: 'FIRE', location: 'FLOOR2', severity: 0.8 }
        ],
        type: 'COMPLEX',
        scale: 'LARGE',
        building: {
          exits: ['MAIN', 'EMERGENCY1', 'EMERGENCY2', 'SIDE'],
          stairwells: ['A', 'B', 'C'],
          layout: 'COMPLEX'
        }
      };

      const startTime = performance.now();
      const response = await evacuationHandler.handleEvacuation(largeCrowdScenario, testContext);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.SIGNAL_GENERATION);
      expect(response.metrics.resource_usage.memory)
        .toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_USAGE_LIMIT);
      expect(response.metrics.route_calculation_time)
        .toBeLessThan(PERFORMANCE_THRESHOLDS.ROUTE_RECALCULATION);
    });

    test('should maintain performance under continuous updates', async () => {
      const updateInterval = 100; // ms
      const testDuration = 5000; // 5 secondes
      const metrics: PerformanceMetrics[] = [];

      const startTime = performance.now();
      while (performance.now() - startTime < testDuration) {
        const changes = generateRandomChanges();
        const updateMetrics = await measurePerformance(async () => {
          await coordinator.updateSystemStatus({
            time: Date.now(),
            changes
          });
        });

        metrics.push(updateMetrics);
        await new Promise(resolve => setTimeout(resolve, updateInterval));
      }

      const averageResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
      const maxMemoryUsage = Math.max(...metrics.map(m => m.memoryUsage));
      const avgCpuUsage = metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length;

      expect(averageResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.COORDINATION_UPDATE);
      expect(maxMemoryUsage).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_USAGE_LIMIT);
      expect(avgCpuUsage).toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_CPU_USAGE);
    });

    test('should handle multiple concurrent evacuations', async () => {
      const concurrentScenarios = Array(5).fill(null).map((_, index) => ({
        urgency: 0.8 + (index * 0.04),
        affected_areas: [`ZONE_${index}_A`, `ZONE_${index}_B`],
        hazards: [
          { type: 'FIRE', location: `ZONE_${index}_A`, severity: 0.7 }
        ],
        type: 'COMPLEX',
        scale: 'MEDIUM',
        building: {
          exits: ['MAIN', 'EMERGENCY'],
          stairwells: ['A', 'B'],
          layout: 'COMPLEX'
        }
      } as EvacuationSituation));

      const startTime = performance.now();
      const responses = await Promise.all(
        concurrentScenarios.map(scenario =>
          evacuationHandler.handleEvacuation(scenario, testContext)
        )
      );
      const duration = performance.now() - startTime;

      expect(duration / concurrentScenarios.length)
        .toBeLessThan(PERFORMANCE_THRESHOLDS.SIGNAL_GENERATION * 1.5);

      responses.forEach(response => {
        expect(response.metrics.response_time)
          .toBeLessThan(PERFORMANCE_THRESHOLDS.SIGNAL_GENERATION * 2);
        expect(response.metrics.resource_usage.memory)
          .toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_USAGE_LIMIT / concurrentScenarios.length);
      });
    });

    test('should handle system stress recovery', async () => {
      await Promise.all(Array(20).fill(null).map(() =>
        coordinator.updateSystemStatus({
          time: Date.now(),
          changes: generateRandomChanges()
        })
      ));

      await new Promise(resolve => setTimeout(resolve, 1000));

      const recoveryMetrics = await measurePerformance(async () => {
        const scenario: EvacuationSituation = {
          urgency: 0.9,
          affected_areas: ['RECOVERY_ZONE'],
          hazards: [{ type: 'FIRE', location: 'RECOVERY_ZONE', severity: 0.6 }],
          type: 'STANDARD',
          scale: 'SMALL',
          building: {
            exits: ['MAIN'],
            stairwells: ['A'],
            layout: 'SIMPLE'
          }
        };

        return await evacuationHandler.handleEvacuation(scenario, testContext);
      });

      expect(recoveryMetrics.responseTime)
        .toBeLessThan(PERFORMANCE_THRESHOLDS.SIGNAL_GENERATION);
      expect(recoveryMetrics.memoryUsage)
        .toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_USAGE_LIMIT * 0.8);
      expect(recoveryMetrics.cpuUsage)
        .toBeLessThan(PERFORMANCE_THRESHOLDS.MAX_CPU_USAGE * 0.9);
    });
  });

  function generateRandomChanges(): SystemChange[] {
    return [{
      type: 'ROUTE',
      location: `ZONE_${Math.floor(Math.random() * 10)}`,
      details: {
        status: Math.random() > 0.5 ? 'BLOCKED' : 'OPEN',
        capacity: Math.floor(Math.random() * 100)
      }
    }];
  }

  async function measurePerformance<T>(operation: () => Promise<T>): Promise<PerformanceMetrics> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    const startCPU = process.cpuUsage();

    await operation();

    const endCPU = process.cpuUsage(startCPU);
    return {
      responseTime: performance.now() - startTime,
      memoryUsage: process.memoryUsage().heapUsed - startMemory,
      cpuUsage: (endCPU.user + endCPU.system) / 1000000
    };
  }
});