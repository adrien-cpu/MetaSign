// src/ai/feedback/validators/zone/ZoneRelationshipValidator.ts

import { LSFExpression } from '../../../emotions/lsf/types';
import { ZoneDefinition, SpatialRelationship, Boundaries } from '../interfaces/ISpatialValidator';
import { ValidationResult, ValidationIssue } from '../../types/validation';

/**
 * Classe responsable de la validation des relations spatiales entre zones
 */
export class ZoneRelationshipValidator {
    constructor(private zoneCache: Map<string, ZoneDefinition>) { }

    /**
     * Valide un ensemble de relations spatiales pour une expression LSF
     */
    async validateRelationships(
        expression: LSFExpression,
        relationships: SpatialRelationship[]
    ): Promise<ValidationResult> {
        const issues: ValidationIssue[] = [];

        for (const relationship of relationships) {
            const relationshipIssues = await this.validateSingleRelationship(expression, relationship);
            issues.push(...relationshipIssues);
        }

        return {
            isValid: issues.length === 0,
            issues,
            score: this.calculateRelationshipScore(issues)
        };
    }

    /**
     * Valide une relation spatiale spécifique pour une expression LSF
     */
    private async validateSingleRelationship(
        expression: LSFExpression,
        relationship: SpatialRelationship
    ): Promise<ValidationIssue[]> {
        const issues: ValidationIssue[] = [];

        // Vérifier si les positions respectent la relation spatiale
        const sourceZone = this.zoneCache.get(relationship.source);
        const targetZone = this.zoneCache.get(relationship.target);

        if (!sourceZone || !targetZone) {
            issues.push({
                type: 'zone_not_found',
                severity: 'high',
                description: `One or both zones not found: ${relationship.source} -> ${relationship.target}`
            });
            return issues;
        }

        // Vérifier la relation selon son type
        if (relationship.type === 'adjacent' && !this.areZonesAdjacent(sourceZone, targetZone)) {
            issues.push({
                type: 'invalid_adjacency',
                severity: 'medium',
                description: `Zones ${relationship.source} and ${relationship.target} are not adjacent`
            });
        }

        if (relationship.type === 'contains' && !this.doesZoneContain(sourceZone, targetZone)) {
            issues.push({
                type: 'invalid_containment',
                severity: 'high',
                description: `Zone ${relationship.source} does not contain ${relationship.target}`
            });
        }

        if (relationship.type === 'overlaps') {
            const overlapping = this.doZonesOverlap(sourceZone, targetZone);
            if (!overlapping) {
                issues.push({
                    type: 'invalid_overlap',
                    severity: 'medium',
                    description: `Zones ${relationship.source} and ${relationship.target} do not overlap`
                });
            }
        }

        if (relationship.type === 'disjoint') {
            const overlapping = this.doZonesOverlap(sourceZone, targetZone);
            if (overlapping) {
                issues.push({
                    type: 'invalid_disjoint',
                    severity: 'medium',
                    description: `Zones ${relationship.source} and ${relationship.target} are not disjoint`
                });
            }
        }

        return issues;
    }

    /**
     * Vérifie si deux zones sont adjacentes
     */
    private areZonesAdjacent(zone1: ZoneDefinition, zone2: ZoneDefinition): boolean {
        const b1 = zone1.boundaries;
        const b2 = zone2.boundaries;

        // Deux zones sont adjacentes si elles partagent au moins une face
        const xAdjacent = (Math.abs(b1.x[1] - b2.x[0]) < 0.001 || Math.abs(b1.x[0] - b2.x[1]) < 0.001) &&
            this.rangesOverlap(b1.y, b2.y) &&
            this.rangesOverlap(b1.z, b2.z);

        const yAdjacent = (Math.abs(b1.y[1] - b2.y[0]) < 0.001 || Math.abs(b1.y[0] - b2.y[1]) < 0.001) &&
            this.rangesOverlap(b1.x, b2.x) &&
            this.rangesOverlap(b1.z, b2.z);

        const zAdjacent = (Math.abs(b1.z[1] - b2.z[0]) < 0.001 || Math.abs(b1.z[0] - b2.z[1]) < 0.001) &&
            this.rangesOverlap(b1.x, b2.x) &&
            this.rangesOverlap(b1.y, b2.y);

        return xAdjacent || yAdjacent || zAdjacent;
    }

    /**
     * Vérifie si deux plages de valeurs se chevauchent
     */
    private rangesOverlap(range1: [number, number], range2: [number, number]): boolean {
        return range1[0] <= range2[1] && range2[0] <= range1[1];
    }

    /**
     * Vérifie si une zone en contient une autre
     */
    private doesZoneContain(outerZone: ZoneDefinition, innerZone: ZoneDefinition): boolean {
        const outer = outerZone.boundaries;
        const inner = innerZone.boundaries;

        return (
            outer.x[0] <= inner.x[0] && inner.x[1] <= outer.x[1] &&
            outer.y[0] <= inner.y[0] && inner.y[1] <= outer.y[1] &&
            outer.z[0] <= inner.z[0] && inner.z[1] <= outer.z[1]
        );
    }

    /**
     * Vérifie si deux zones se chevauchent
     */
    private doZonesOverlap(zone1: ZoneDefinition, zone2: ZoneDefinition): boolean {
        const b1 = zone1.boundaries;
        const b2 = zone2.boundaries;

        return (
            this.rangesOverlap(b1.x, b2.x) &&
            this.rangesOverlap(b1.y, b2.y) &&
            this.rangesOverlap(b1.z, b2.z)
        );
    }

    /**
     * Calcule un score de validation pour les relations
     */
    private calculateRelationshipScore(issues: ValidationIssue[]): number {
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