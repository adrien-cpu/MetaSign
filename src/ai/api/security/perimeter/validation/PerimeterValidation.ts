// src/ai/api/security/perimeter/validation/PerimeterValidation.ts

import { SystemeControleEthique } from '@ethics/core/SystemeControleEthique';
import { ValidationCollaborative } from '@ai/validation/ValidationCollaborative';
import { SecurityZone, AccessRequest, AccessResult } from '@security/types/perimeter-types';

/**
 * Centralise les validations avancées (éthique et collaborative) pour le périmètre de sécurité.
 */
export class PerimeterValidation {
    constructor(
        private readonly ethicsSystem: SystemeControleEthique,
        private readonly validationCollaborative: ValidationCollaborative
    ) { }

    /**
     * Effectue la validation éthique d'une requête d'accès
     * @returns Un résultat d'accès si la validation échoue, null sinon
     */
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

    /**
     * Effectue la validation collaborative d'une requête d'accès
     * @returns Un résultat d'accès si la validation échoue, null sinon
     */
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

    /**
     * Détermine si une zone nécessite une validation collaborative
     */
    private requiresCollaborativeValidation(zone: SecurityZone): boolean {
        // Vérifier si la zone nécessite une validation collaborative
        // Par exemple, les zones avec un niveau de sécurité élevé
        return zone.level >= 8 || zone.isolationLevel === 'full';
    }
}