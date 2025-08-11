// src/ai/api/security/perimeter/__tests__/SecurityPerimeterManager.test.ts

import { SecurityPerimeterManager } from '../SecurityPerimeterManager';
import { AccessRequest } from '@security/types/perimeter-types';
import { SecurityAuditor } from '@security/types/SecurityTypes';
import { SystemeControleEthique } from '@ethics/core/SystemeControleEthique';
import { ValidationCollaborative } from '@ai/validation/ValidationCollaborative';
import { MetricsCollector } from '@api/common/metrics/MetricsCollector';
import { UnifiedAnomalyDetector } from '@api/common/detection/UnifiedAnomalyDetector';

// Création des mocks pour tous les composants
const createMocks = () => {
    const mockAuditor: jest.Mocked<SecurityAuditor> = {
        logSecurityEvent: jest.fn().mockResolvedValue(undefined)
    } as any;

    const mockEthicsSystem: jest.Mocked<SystemeControleEthique> = {
        validateAction: jest.fn().mockResolvedValue({ approved: true })
    } as any;

    const mockValidationCollaborative: jest.Mocked<ValidationCollaborative> = {
        validateRequest: jest.fn().mockResolvedValue({ approved: true })
    } as any;

    const mockMetricsCollector: jest.Mocked<MetricsCollector> = {
        incrementCounter: jest.fn(),
        recordHistogram: jest.fn(),
        recordGauge: jest.fn()
    } as any;

    const mockAnomalyDetector: jest.Mocked<UnifiedAnomalyDetector> = {
        checkPattern: jest.fn().mockResolvedValue(undefined),
        checkFrequency: jest.fn().mockResolvedValue(undefined),
        checkEscalation: jest.fn().mockResolvedValue(undefined)
    } as any;

    return {
        mockAuditor,
        mockEthicsSystem,
        mockValidationCollaborative,
        mockMetricsCollector,
        mockAnomalyDetector
    };
};

describe('SecurityPerimeterManager', () => {
    let manager: SecurityPerimeterManager;
    let mocks: ReturnType<typeof createMocks>;

    beforeEach(() => {
        mocks = createMocks();

        manager = new SecurityPerimeterManager(
            mocks.mockAuditor,
            mocks.mockEthicsSystem,
            mocks.mockValidationCollaborative,
            mocks.mockMetricsCollector,
            mocks.mockAnomalyDetector,
            5000, // 5 secondes de cache pour les tests
            1000  // 1 seconde d'intervalle de monitoring
        );
    });

    afterEach(() => {
        manager.shutdown();
    });

    describe('validateAccess', () => {
        it('devrait permettre l\'accès entre zones du même niveau de sécurité', async () => {
            const request: AccessRequest = {
                source: { zone: 'dmz', endpoint: 'endpoint1' },
                target: { zone: 'dmz', resource: 'resource1' },
                context: {
                    userId: 'user1',
                    roles: ['user'],
                    permissions: ['read'],
                    operation: 'read',
                    resource: 'resource1',
                    deviceType: 'browser',
                    deviceSecurityLevel: 5,
                    ipAddress: '10.0.0.1',
                    allowed: true,
                    reason: ''
                },
                operation: 'read'
            };

            const result = await manager.validateAccess(request);

            expect(result.allowed).toBe(true);
            expect(mocks.mockAuditor.logSecurityEvent).toHaveBeenCalled();
            expect(mocks.mockEthicsSystem.validateAction).toHaveBeenCalled();
            expect(mocks.mockMetricsCollector.incrementCounter).toHaveBeenCalled();
        });

        it('devrait refuser l\'accès entre zones avec niveau de sécurité insuffisant', async () => {
            const request: AccessRequest = {
                source: { zone: 'public', endpoint: 'endpoint1' },
                target: { zone: 'internal', resource: 'resource1' },
                context: {
                    userId: 'user1',
                    roles: ['user'],
                    permissions: ['read'],
                    operation: 'read',
                    resource: 'resource1',
                    deviceType: 'browser',
                    deviceSecurityLevel: 2,
                    ipAddress: '10.0.0.1',
                    allowed: true,
                    reason: ''
                },
                operation: 'read'
            };

            const result = await manager.validateAccess(request);

            expect(result.allowed).toBe(false);
            expect(mocks.mockAuditor.logSecurityEvent).toHaveBeenCalled();
            expect(mocks.mockEthicsSystem.validateAction).toHaveBeenCalled();
        });

        it('devrait refuser l\'accès lorsque la validation éthique échoue', async () => {
            // Configuration pour échouer la validation éthique
            mocks.mockEthicsSystem.validateAction.mockResolvedValueOnce({
                approved: false,
                reason: 'Ethical violation detected'
            });

            const request: AccessRequest = {
                source: { zone: 'dmz', endpoint: 'endpoint1' },
                target: { zone: 'dmz', resource: 'resource1' },
                context: {
                    userId: 'user1',
                    roles: ['user'],
                    permissions: ['read'],
                    operation: 'read',
                    resource: 'resource1',
                    deviceType: 'browser',
                    deviceSecurityLevel: 5,
                    ipAddress: '10.0.0.1',
                    allowed: true,
                    reason: ''
                },
                operation: 'read'
            };

            const result = await manager.validateAccess(request);

            expect(result.allowed).toBe(false);
            expect(result.reason).toContain('Ethics violation');
            expect(mocks.mockAuditor.logSecurityEvent).toHaveBeenCalled();
        });

        it('devrait refuser l\'accès lorsque la validation collaborative échoue', async () => {
            // Configuration pour passer la validation éthique
            mocks.mockEthicsSystem.validateAction.mockResolvedValueOnce({
                approved: true
            });

            // Configuration pour échouer la validation collaborative
            mocks.mockValidationCollaborative.validateRequest.mockResolvedValueOnce({
                approved: false,
                reason: 'Collaborative validation failed'
            });

            const request: AccessRequest = {
                source: { zone: 'dmz', endpoint: 'endpoint1' },
                target: { zone: 'internal', resource: 'resource1' },
                context: {
                    userId: 'user1',
                    roles: ['admin'],
                    permissions: ['read', 'write'],
                    operation: 'write',
                    resource: 'resource1',
                    deviceType: 'workstation',
                    deviceSecurityLevel: 8,
                    ipAddress: '192.168.1.1',
                    allowed: true,
                    reason: ''
                },
                operation: 'write'
            };

            const result = await manager.validateAccess(request);

            expect(result.allowed).toBe(false);
            expect(result.reason).toContain('Collaborative validation failed');
            expect(mocks.mockAuditor.logSecurityEvent).toHaveBeenCalled();
        });

        it('devrait utiliser le cache pour les requêtes répétées', async () => {
            const request: AccessRequest = {
                source: { zone: 'dmz', endpoint: 'endpoint1' },
                target: { zone: 'dmz', resource: 'resource1' },
                context: {
                    userId: 'user1',
                    roles: ['user'],
                    permissions: ['read'],
                    operation: 'read',
                    resource: 'resource1',
                    deviceType: 'browser',
                    deviceSecurityLevel: 5,
                    ipAddress: '10.0.0.1',
                    allowed: true,
                    reason: ''
                },
                operation: 'read'
            };

            // Première requête - devrait évaluer complètement
            await manager.validateAccess(request);

            // Réinitialiser les mocks pour vérifier qu'ils ne sont plus appelés
            mocks.mockEthicsSystem.validateAction.mockClear();
            mocks.mockValidationCollaborative.validateRequest.mockClear();

            // Deuxième requête - devrait utiliser le cache
            const result = await manager.validateAccess(request);

            expect(result.allowed).toBe(true);
            // Vérifier que les validations ne sont pas recalculées
            expect(mocks.mockEthicsSystem.validateAction).not.toHaveBeenCalled();
            expect(mocks.mockValidationCollaborative.validateRequest).not.toHaveBeenCalled();
        });
    });

    describe('reporting', () => {
        it('devrait générer un rapport de sécurité', async () => {
            const report = await manager.generateSecurityReport({
                startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24h en arrière
                endTime: new Date()
            });

            expect(report).toBeDefined();
            expect(report.totalRequests).toBeDefined();
        });

        it('devrait générer un profil de sécurité pour une zone', async () => {
            const profile = await manager.generateZoneSecurityProfile('dmz');

            expect(profile).toBeDefined();
            expect(profile.zone).toBeDefined();
            expect(profile.zone.id).toBe('dmz');
        });
    });
});