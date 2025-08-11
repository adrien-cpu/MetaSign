// src/ai/api/distributed/optimization/strategies/__tests__/ResourceBalancingStrategy.test.ts
import {
    BottleneckType,
    OptimizationActionType,
    OptimizationResult,
    ResourceData
} from '../../types/optimization.types';
import { ResourceBalancingStrategy } from '../ResourceBalancingStrategy';

describe('ResourceBalancingStrategy', () => {
    let strategy: ResourceBalancingStrategy;
    let mockResourceData: ResourceData;

    beforeEach(() => {
        strategy = new ResourceBalancingStrategy();

        // Create mock resource data
        mockResourceData = {
            resources: {
                'cpu': {
                    utilization: 85,
                    available: 15,
                    total: 100,
                    averageLoad: 75,
                    peakLoad: 90,
                    bottlenecks: []
                },
                'memory': {
                    utilization: 60,
                    available: 40,
                    total: 100,
                    averageLoad: 55,
                    peakLoad: 70,
                    bottlenecks: []
                },
                'network': {
                    utilization: 45,
                    available: 55,
                    total: 100,
                    averageLoad: 40,
                    peakLoad: 80,
                    bottlenecks: []
                },
                'storage': {
                    utilization: 30,
                    available: 70,
                    total: 100,
                    averageLoad: 25,
                    peakLoad: 40,
                    bottlenecks: []
                },
                'gpu': {
                    utilization: 95,
                    available: 5,
                    total: 100,
                    averageLoad: 80,
                    peakLoad: 100,
                    bottlenecks: []
                }
            },
            timestamp: Date.now(),
            systemId: 'test-system',
            currentLoad: 70,
            requestRate: 100
        };
    });

    test('should implement IOptimizationStrategy interface correctly', () => {
        expect(strategy.getStrategyType()).toBeDefined();
        expect(strategy.getPriority()).toBeDefined();
        expect(typeof strategy.optimize).toBe('function');
    });

    test('should return correct strategy type', () => {
        expect(strategy.getStrategyType()).toBe('resource_balancing');
    });

    test('should return a valid priority value', () => {
        const priority = strategy.getPriority();
        expect(priority).toBeGreaterThanOrEqual(1);
        expect(priority).toBeLessThanOrEqual(5);
    });

    test('should generate optimization result with valid structure', async () => {
        const result = await strategy.optimize(mockResourceData);

        expect(result).toBeDefined();
        expect(result.optimizations).toBeInstanceOf(Array);
        expect(result.metrics).toBeDefined();
        expect(result.timestamp).toBeDefined();
    });

    test('should identify bottlenecks correctly', async () => {
        const result = await strategy.optimize(mockResourceData);

        // We expect CPU and GPU to be identified as bottlenecks
        const cpuAction = result.optimizations.find(
            a => a.target === 'cpu' && a.type === OptimizationActionType.SCALE_UP
        );

        const gpuAction = result.optimizations.find(
            a => a.target === 'gpu' && a.type === OptimizationActionType.SCALE_UP
        );

        expect(cpuAction).toBeDefined();
        expect(gpuAction).toBeDefined();
    });

    test('should generate appropriate warnings', async () => {
        const result = await strategy.optimize(mockResourceData);

        expect(result.warnings).toBeDefined();
        expect(result.warnings!.length).toBeGreaterThan(0);

        // Expect warning about GPU high utilization
        const gpuWarning = result.warnings!.find(w => w.includes('gpu'));
        expect(gpuWarning).toBeDefined();
    });

    test('should not suggest scaling down resources below a minimum threshold', async () => {
        // Create data with very low utilization
        const lowUtilizationData = {
            ...mockResourceData,
            resources: {
                ...mockResourceData.resources,
                'memory': {
                    ...mockResourceData.resources.memory,
                    utilization: 5,
                    available: 95
                }
            }
        };

        const result = await strategy.optimize(lowUtilizationData);

        // Check if any action scales memory below minimum threshold
        const memoryActions = result.optimizations.filter(a => a.target === 'memory');

        memoryActions.forEach(action => {
            if (action.type === OptimizationActionType.SCALE_DOWN) {
                // Make sure we don't scale below 10% allocation
                const memoryTotal = lowUtilizationData.resources.memory.total;
                expect(action.amount).toBeLessThanOrEqual(memoryTotal * 0.9);
            }
        });
    });

    test('should calculate meaningful optimization metrics', async () => {
        const result = await strategy.optimize(mockResourceData);

        expect(result.metrics.improvementPercentage).toBeGreaterThanOrEqual(0);
        expect(result.metrics.resourceEfficiency).toBeGreaterThan(0);
        expect(result.metrics.balanceScore).toBeGreaterThan(0);
        expect(result.metrics.balanceScore).toBeLessThanOrEqual(100);
    });

    test('should handle imbalanced resource allocation correctly', async () => {
        // Create data with significant imbalance
        const imbalancedData = {
            ...mockResourceData,
            resources: {
                ...mockResourceData.resources,
                'cpu': {
                    ...mockResourceData.resources.cpu,
                    utilization: 95,
                    available: 5
                },
                'memory': {
                    ...mockResourceData.resources.memory,
                    utilization: 20,
                    available: 80
                }
            }
        };

        const result = await strategy.optimize(imbalancedData);

        // Expect redistribute action
        const redistributeAction = result.optimizations.find(
            a => a.type === OptimizationActionType.REDISTRIBUTE
        );

        expect(redistributeAction).toBeDefined();
    });
});