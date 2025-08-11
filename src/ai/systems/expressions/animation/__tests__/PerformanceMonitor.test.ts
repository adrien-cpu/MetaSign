// src/ai/systems/expressions/animation/__tests__/PerformanceMonitor.test.ts
import { PerformanceMonitor } from '../PerformanceMonitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  test('should track frame times correctly', () => {
    monitor.trackFrameTime(16); // Bonne performance
    monitor.trackFrameTime(33); // Frame drop

    const report = monitor.getPerformanceReport();
    expect(report.averageFrameTime).toBeCloseTo(24.5);
    expect(report.maxFrameTime).toBe(33);
    expect(report.droppedFrames).toBe(1);
  });

  test('should emit performance alerts for consecutive drops', () => {
    const alertHandler = jest.fn();
    monitor.on('performance-alert', alertHandler);

    // Simuler 5 frame drops consécutifs
    for (let i = 0; i < 5; i++) {
      monitor.trackFrameTime(33);
    }

    expect(alertHandler).toHaveBeenCalled();
    expect(alertHandler.mock.calls[0][0].type).toBe('FRAME_DROP');
  });

  test('should calculate performance score correctly', () => {
    // Simuler une bonne performance
    for (let i = 0; i < 10; i++) {
      monitor.trackFrameTime(16);
    }

    const report = monitor.getPerformanceReport();
    expect(report.performanceScore).toBeGreaterThanOrEqual(0.9);
  });
});