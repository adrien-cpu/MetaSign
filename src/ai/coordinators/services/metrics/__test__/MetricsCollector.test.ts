// src/ai/coordinators/services/metrics/__tests__/MetricsCollector.test.ts
import { MetricsCollector } from '../MetricsCollector';
import { MemoryMetricsStorage } from '../MetricsStorage';
import { ThresholdManager, ThresholdConfig } from '../alerts/ThresholdManager';

describe('MetricsCollector', () => {
    let collector: MetricsCollector;

    beforeEach(() => {
        collector = new MetricsCollector('test');
    });

    afterEach(() => {
        collector.shutdown();
    });

    test('should record and retrieve metrics', () => {
        // Arrange
        const now = Date.now();
        jest.spyOn(Date, 'now').mockImplementation(() => now);

        // Act
        collector.recordMetric('cpu', 50, 'gauge');
        const metric = collector.getMetric('cpu');

        // Assert
        expect(metric).toBeDefined();
        expect(metric?.value).toBe(50);
        expect(metric?.timestamp).toBe(now);
    });

    test('should filter metrics by tags', () => {
        // Arrange
        collector.recordMetric('cpu', 50, 'gauge', { server: 'app1' });
        collector.recordMetric('cpu', 70, 'gauge', { server: 'app2' });

        // Act
        const app1Metric = collector.getMetric('cpu', { server: 'app1' });
        const app2Metric = collector.getMetric('cpu', { server: 'app2' });

        // Assert
        expect(app1Metric?.value).toBe(50);
        expect(app2Metric?.value).toBe(70);
    });

    test('should aggregate gauge metrics', () => {
        // Arrange
        const now = Date.now();
        jest.spyOn(Date, 'now').mockImplementation(() => now);

        collector.recordMetric('cpu', 50, 'gauge');

        // Avancer le temps
        jest.spyOn(Date, 'now').mockImplementation(() => now + 1000);

        collector.recordMetric('cpu', 70, 'gauge');

        // Act
        // Forcer l'agrégation
        (collector as any).aggregateMetrics();

        // Assert
        const avgMetric = collector.getMetric('cpu.avg');
        expect(avgMetric).toBeDefined();
        expect(avgMetric?.value).toBeCloseTo(60);
    });

    test('should handle thresholds', () => {
        // Arrange
        const thresholdManager = new ThresholdManager();
        collector = new MetricsCollector('test', { thresholdManager });

        const threshold: ThresholdConfig = {
            namespace: 'test',
            metric: 'cpu',
            operator: 'gt',
            value: 80,
            severity: 'warning'
        };

        thresholdManager.addThreshold(threshold);

        // Mock pour vérifier si l'événement d'alerte est émis
        const mockObserver = { update: jest.fn() };
        thresholdManager.addObserver(mockObserver);

        // Act
        collector.recordMetric('cpu', 70, 'gauge'); // Sous le seuil
        collector.recordMetric('cpu', 90, 'gauge'); // Au-dessus du seuil

        // Assert
        expect(mockObserver.update).toHaveBeenCalledTimes(1);
        expect(mockObserver.update).toHaveBeenCalledWith(expect.objectContaining({
            config: threshold,
            currentValue: 90,
            exceeded: true
        }));
    });

    // Autres tests...
});