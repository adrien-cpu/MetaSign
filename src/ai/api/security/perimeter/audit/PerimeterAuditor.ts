// src/ai/api/security/perimeter/audit/PerimeterAuditor.ts

import { AccessRequest, AccessResult } from '@security/types/perimeter-types';
import { SecurityAuditor, SecurityContext } from '@security/types/SecurityTypes';

export class PerimeterAuditor {
    constructor(
        private readonly securityAuditor: SecurityAuditor
    ) { }

    /**
     * Audite un accès
     * @param request - La requête d'accès
     * @param result - Le résultat de l'accès
     */
    async auditAccess(
        request: AccessRequest,
        result: AccessResult
    ): Promise<void> {
        // Préparer les valeurs pour le contexte en les typant correctement
        const userId = typeof request.context.userId === 'string' ? request.context.userId : 'anonymous';
        const resource = typeof request.target.resource === 'string' ? request.target.resource : '';
        const operation = typeof request.operation === 'string' ? request.operation : '';
        const roles = Array.isArray(request.context.roles) ? request.context.roles : [];
        const permissions = Array.isArray(request.context.permissions) ? request.context.permissions : [];
        const deviceType = typeof request.context.deviceType === 'string' ? request.context.deviceType : 'unknown';
        const deviceSecurityLevel = typeof request.context.deviceSecurityLevel === 'number' ? request.context.deviceSecurityLevel : 0;
        const ipAddress = typeof request.context.ipAddress === 'string' ? request.context.ipAddress : '';
        const reason = typeof result.reason === 'string' ? result.reason : '';
        const sourceZone = typeof request.source.zone === 'string' ? request.source.zone : '';
        const targetZone = typeof request.target.zone === 'string' ? request.target.zone : '';

        // Créer un contexte de sécurité avec des valeurs typées explicitement
        const context: SecurityContext = {
            userId,
            resource,
            operation,
            roles,
            permissions,
            deviceType,
            deviceSecurityLevel,
            ipAddress,
            allowed: result.allowed,
            reason,
            // Ajouter les propriétés personnalisées
            sourceZone,
            targetZone
        };

        await this.securityAuditor.logSecurityEvent({
            type: 'access_audit',
            severity: result.allowed ? 'LOW' : 'MEDIUM',
            timestamp: new Date(),
            details: {
                threatType: result.allowed ? 'access_granted' : 'access_violation',
                source: {
                    zone: sourceZone,
                    endpoint: typeof request.source.endpoint === 'string' ? request.source.endpoint : '',
                    userId
                },
                target: {
                    zone: targetZone,
                    resource
                },
                // S'assurer que les éléments du tableau sont des chaînes
                indicators: [reason || 'Unknown reason'],
                confidence: 0.8
            },
            source: 'SecurityPerimeterManager',
            context
        });
    }
}