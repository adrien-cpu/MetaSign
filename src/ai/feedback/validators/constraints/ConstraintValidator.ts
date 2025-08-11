// src/ai/feedback/validators/constraints/ConstraintValidator.ts

import {
    ZoneDefinition,
    Position3D,
    Boundaries,
    ZoneConstraint
    // Suppression de ZoneConstraintType qui n'est pas utilisé
} from '../interfaces/ISpatialValidator';
import { ZoneUsage, ConstraintValidationResult } from '../../types/zone-validation';
import { ValidationResult, ValidationIssue } from '../../types/validation';

/**
 * Classe responsable de la validation des contraintes associées aux zones
 * Implémente la logique du diagramme d'état pour SystemeValidation
 */
export class ConstraintValidator {
    /**
     * Valide une utilisation de zone par rapport à sa définition et ses contraintes
     */
    async validateZoneUsage(
        usage: ZoneUsage,
        definition: ZoneDefinition
    ): Promise<ValidationResult> {
        const issues: ValidationIssue[] = [];

        // Vérification des limites spatiales
        if (!this.isWithinBoundaries(usage.position, definition.boundaries)) {
            issues.push({
                type: 'boundary_violation',
                severity: 'high',
                description: `Position outside zone boundaries: ${JSON.stringify(usage.position)}`,
                location: usage.position,
                context: {} // Ajout d'un objet vide pour satisfaire l'exigence non-optionnelle
            });
        }

        // Vérification des formes de main (si définies)
        if (definition.allowedHandshapes && usage.handshapes) {
            for (const handshape of usage.handshapes) {
                if (!definition.allowedHandshapes.includes(handshape)) {
                    issues.push({
                        type: 'handshape_violation',
                        severity: 'medium',
                        description: `Handshape '${handshape}' not allowed in zone '${definition.name}'`,
                        context: { handshape, allowedHandshapes: definition.allowedHandshapes }
                    });
                }
            }
        }

        // Vérification des mouvements (si définis)
        if (definition.allowedMovements && usage.movements) {
            for (const movement of usage.movements) {
                if (!definition.allowedMovements.includes(movement)) {
                    issues.push({
                        type: 'movement_violation',
                        severity: 'medium',
                        description: `Movement '${movement}' not allowed in zone '${definition.name}'`,
                        context: { movement, allowedMovements: definition.allowedMovements }
                    });
                }
            }
        }

        // Vérification de la durée (si définie)
        if (definition.minDuration !== undefined && usage.duration < definition.minDuration) {
            issues.push({
                type: 'duration_violation',
                severity: 'low',
                description: `Duration (${usage.duration}ms) too short for zone '${definition.name}' (min: ${definition.minDuration}ms)`,
                context: { duration: usage.duration, minDuration: definition.minDuration }
            });
        }

        if (definition.maxDuration !== undefined && usage.duration > definition.maxDuration) {
            issues.push({
                type: 'duration_violation',
                severity: 'medium',
                description: `Duration (${usage.duration}ms) too long for zone '${definition.name}' (max: ${definition.maxDuration}ms)`,
                context: { duration: usage.duration, maxDuration: definition.maxDuration }
            });
        }

        // Validation des contraintes spécifiques
        for (const constraint of definition.constraints) {
            const constraintValidation = this.validateConstraint(usage, constraint);
            if (!constraintValidation.isValid) {
                issues.push({
                    type: 'constraint_violation',
                    severity: constraintValidation.severity,
                    description: constraintValidation.reason,
                    context: constraintValidation.context || {} // Fourni un objet vide si context est undefined
                });
            }
        }

        return {
            isValid: issues.length === 0,
            issues,
            score: this.calculateValidationScore(issues),
            metadata: {
                validatedAt: Date.now(),
                validatedBy: 'ConstraintValidator',
                validationContext: {
                    zoneName: definition.name,
                    zoneId: definition.id,
                    zonePriority: definition.priority
                }
            }
        };
    }

    /**
     * Valide une contrainte spécifique pour une utilisation de zone
     */
    validateConstraint(usage: ZoneUsage, constraint: ZoneConstraint): ConstraintValidationResult {
        let isValid = true;
        let reason = '';
        // Changement de 'let' à 'const' et de 'any' à 'unknown'
        const context: Record<string, unknown> = {
            constraintType: constraint.type,
            constraintValue: constraint.value
        };

        // Vérification basée sur le type de contrainte
        switch (constraint.type) {
            case 'duration':
                const durationValue = Number(constraint.value);
                if (!isNaN(durationValue) && usage.duration > durationValue) {
                    isValid = false;
                    reason = `Zone usage duration (${usage.duration}ms) exceeds maximum allowed (${durationValue}ms)`;
                    context.duration = usage.duration;
                }
                break;

            case 'movement':
                const movementCount = Number(constraint.value);
                if (!isNaN(movementCount) && usage.elements.length > movementCount) {
                    isValid = false;
                    reason = `Number of elements (${usage.elements.length}) exceeds maximum allowed (${movementCount})`;
                    context.elementsCount = usage.elements.length;
                }
                break;

            case 'handshape':
                if (typeof constraint.value === 'string' && usage.handshapes) {
                    if (!usage.handshapes.includes(constraint.value as string)) {
                        isValid = false;
                        reason = `Required handshape '${constraint.value}' not found in usage`;
                        context.handshapes = usage.handshapes;
                    }
                }
                break;

            case 'orientation':
                // Validation spécifique à l'orientation - à implémenter selon les besoins
                break;

            case 'custom':
                // Traitement personnalisé - à implémenter selon les besoins
                break;

            default:
                // Type exhaustive check pour s'assurer que tous les types sont traités
                const exhaustiveCheck: never = constraint.type;
                throw new Error(`Unhandled constraint type: ${exhaustiveCheck}`);
        }

        return {
            isValid,
            severity: constraint.severity,
            reason: reason || constraint.description,
            context
        };
    }

    /**
     * Vérifie si une position est à l'intérieur des limites d'une zone
     */
    private isWithinBoundaries(position: Position3D, boundaries: Boundaries): boolean {
        return (
            position.x >= boundaries.x[0] && position.x <= boundaries.x[1] &&
            position.y >= boundaries.y[0] && position.y <= boundaries.y[1] &&
            position.z >= boundaries.z[0] && position.z <= boundaries.z[1]
        );
    }

    /**
     * Calcule un score de validation basé sur les problèmes détectés
     */
    private calculateValidationScore(issues: ValidationIssue[]): number {
        if (issues.length === 0) return 1.0;

        const weights = {
            high: 0.4,
            medium: 0.2,
            low: 0.1
        };

        const weightedSum = issues.reduce((sum, issue) =>
            sum + weights[issue.severity], 0);

        return Math.max(0, 1 - weightedSum);
    }
}

// src/ai/feedback/validators/constraints/index.ts

export * from './ConstraintValidator';