// src/ai/api/security/perimeter/ethics/PerimeterEthicsValidator.ts

import { SystemeControleEthique } from '@ethics/core/SystemeControleEthique';
import { AccessRequest, AccessResult } from '@security/types/perimeter-types';

export class PerimeterEthicsValidator {
    constructor(
        private readonly ethicsSystem: SystemeControleEthique
    ) { }

    async validateEthically(request: AccessRequest): Promise<AccessResult | null> {
        // Conversion de la requête d'accès en format approprié pour le système éthique
        const ethicsContext = {
            userId: request.context.userId,
            action: {
                type: 'zone_access',
                details: {
                    sourceZone: request.source.zone,
                    targetZone: request.target.zone,
                    resource: request.target.resource,
                    operation: request.operation
                }
            },
            environment: {
                securityLevel: request.context.deviceSecurityLevel || 0,
                deviceType: request.context.deviceType || 'unknown'
            }
        };

        // Validation éthique
        const ethicsResult = await this.ethicsSystem.validateAction(ethicsContext);

        if (!ethicsResult.approved) {
            return {
                allowed: false,
                reason: `Ethics violation: ${ethicsResult.reason}`,
                auditTrail: {
                    rules: ['ethics_validation'],
                    decisions: [ethicsResult.reason || 'Ethics validation failed'],
                    timestamp: Date.now()
                }
            };
        }

        // Si approuvé, retourner null pour continuer la validation
        return null;
    }
}