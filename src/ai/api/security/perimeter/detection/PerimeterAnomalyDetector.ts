// src/ai/api/security/perimeter/detection/PerimeterAnomalyDetector.ts

import { UnifiedAnomalyDetector } from '@api/common/detection/UnifiedAnomalyDetector';
import { AccessRequest, AccessResult } from '@security/types/perimeter-types';

export class PerimeterAnomalyDetector {
    constructor(
        private readonly anomalyDetector: UnifiedAnomalyDetector
    ) { }

    async detectAnomalies(request: AccessRequest, result: AccessResult): Promise<void> {
        // Détection des patterns suspects d'accès
        await this.detectSuspiciousAccessPatterns(request, result);

        // Détection des comportements inhabituels
        await this.detectUnusualBehavior(request);

        // Détection des tentatives d'élévation de privilèges
        await this.detectPrivilegeEscalation(request, result);
    }

    private async detectSuspiciousAccessPatterns(request: AccessRequest, result: AccessResult): Promise<void> {
        await this.anomalyDetector.checkPattern({
            category: 'security_perimeter',
            subCategory: 'access_pattern',
            entityId: request.context.userId || 'anonymous',
            attributes: {
                sourceZone: request.source.zone,
                targetZone: request.target.zone,
                resource: request.target.resource,
                allowed: result.allowed
            }
        });
    }

    private async detectUnusualBehavior(request: AccessRequest): Promise<void> {
        await this.anomalyDetector.checkFrequency({
            category: 'security_perimeter',
            subCategory: 'access_frequency',
            entityId: request.context.userId || 'anonymous',
            operation: request.operation,
            resourceId: request.target.resource
        });
    }

    private async detectPrivilegeEscalation(request: AccessRequest, result: AccessResult): Promise<void> {
        if (request.context.roles.length > 0) {
            await this.anomalyDetector.checkEscalation({
                category: 'security_perimeter',
                entityId: request.context.userId || 'anonymous',
                currentLevel: request.context.deviceSecurityLevel,
                targetLevel: this.extractSecurityLevel(request.target.zone),
                outcome: result.allowed
            });
        }
    }

    private extractSecurityLevel(zoneId: string): number {
        // Logique pour déterminer le niveau de sécurité de la zone
        // En pratique, cela viendrait d'un mapping ou d'une requête
        switch (zoneId) {
            case 'public': return 0;
            case 'dmz': return 5;
            case 'internal': return 8;
            default: return 1;
        }
    }
}