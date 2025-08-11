// src/ai/systems/expressions/animation/__tests__/PerformanceMonitor.advanced.test.ts
describe('PerformanceMonitor Advanced Tests', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  describe('Memory Monitoring', () => {
    test('should detect memory leaks', () => {
      const memoryData = Array.from({ length: 1000 }, () => ({
        timestamp: Date.now(),
        frameTime: Math.random() * 16
      }));

      memoryData.forEach(data => {
        monitor.trackFrameTime(data.frameTime);
      });

      const report = monitor.getPerformanceReport();
      expect(report.frameTimeSamples.length).toBeLessThanOrEqual(
        PerformanceMonitor.MAX_SAMPLES
      );
    });
  });

  describe('Progressive Degradation', () => {
    test('should detect gradual performance degradation', () => {
      const alertHandler = jest.fn();
      monitor.on('performance-alert', alertHandler);

      // Simuler une dégradation progressive
      for (let i = 0; i < 100; i++) {
        monitor.trackFrameTime(16 + (i * 0.1));
      }

      expect(alertHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'FRAME_DROP',
          severity: expect.stringMatching(/MEDIUM|HIGH/)
        })
      );
    });
  });

  describe('RPM Metrics Integration', () => {
    test('should integrate with RPM performance metrics', () => {
      const rpmMetrics = {
        fps: 60,
        memoryUsage: 100,
        gpuUtilization: 0.5
      };

      const report = monitor.integrateRPMMetrics(rpmMetrics);
      
      expect(report).toHaveProperty('rpmMetrics');
      expect(report.rpmMetrics).toEqual(rpmMetrics);
    });
  });
});