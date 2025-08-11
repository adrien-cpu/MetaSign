// src/ai/api/security/perimeter/collaborative/PerimeterCollaborativeValidator.ts

import { ValidationCollaborative } from '@ai/validation/ValidationCollaborative';
import { SecurityZone, AccessRequest, AccessResult } from '@security/types/perimeter-types';

export class PerimeterCollaborativeValidator {
    constructor(
        private readonly validationCollaborative: ValidationCollaborative
    ) { }

    async validateCollaboratively(zone: SecurityZone, request: AccessRequest): Promise<AccessResult | null> {
        // Vérifier si la zone nécessite une validation collaborative
        if (!this.requiresCollaborativeValidation(zone)) {
            return null; // Pas besoin de validation collaborative
        }

        const validationRequest = {
            resourceType: 'security_perimeter',
            actionType: 'zone_access',
            parameters: {
                sourceZone: request.source.zone,
                targetZone: request.target.zone,
                resource: request.target.resource,
                userId: request.context.userId || 'anonymous',
                roles: request.context.roles || []
            }
        };

        // Obtenir le résultat de la validation collaborative
        const validationResult = await this.validationCollaborative.validateRequest(validationRequest);

        if (!validationResult.approved) {
            return {
                allowed: false,
                reason: `Collaborative validation failed: ${validationResult.reason}`,
                auditTrail: {
                    rules: ['collaborative_validation'],
                    decisions: [validationResult.reason || 'Not approved by validators'],
                    timestamp: Date.now()
                }
            };
        }

        // Si approuvé, retourner null pour continuer la validation
        return null;
    }

    private requiresCollaborativeValidation(zone: SecurityZone): boolean {
        // Vérifier si la zone nécessite une validation collaborative
        // Par exemple, les zones avec un niveau de sécurité élevé
        return zone.level >= 8 || zone.isolationLevel === 'full';
    }
}