// src/ai/feedback/validators/zone/ZoneUsageExtractor.ts

import { LSFExpression } from '../../../emotions/lsf/types';
import { Position3D, ZoneDefinition, Boundaries } from '../interfaces/ISpatialValidator';
import { ZoneUsage } from '../../types/zone-validation';

/**
 * Classe responsable de l'extraction des informations d'utilisation des zones
 * à partir des expressions LSF
 */
export class ZoneUsageExtractor {
    constructor(private zoneCache: Map<string, ZoneDefinition>) { }

    /**
     * Extrait les informations d'utilisation d'une zone spécifique à partir d'une expression LSF
     */
    extractZoneUsage(expression: LSFExpression, zoneId: string): ZoneUsage {
        const positions = expression.locations || [];
        const targetZone = this.zoneCache.get(zoneId);

        // Trouver les positions qui correspondent à la zone spécifiée
        const zonePositions = positions.filter(pos => {
            if (!targetZone || !targetZone.boundaries) return false;
            return this.isWithinBoundaries(pos, targetZone.boundaries);
        });

        // Extraire les éléments de l'expression qui se trouvent dans cette zone
        const elements = expression.movements || [];

        // Calculer la durée en fonction du nombre de positions dans la zone
        const duration = zonePositions.length * 200; // 200ms par position comme estimation

        return {
            position: zonePositions[0] || { x: 0, y: 0, z: 0 },
            duration,
            elements: elements.filter((_, index) => index < zonePositions.length)
        };
    }

    /**
     * Vérifie si une position est à l'intérieur des limites d'une zone
     */
    isWithinBoundaries(position: Position3D, boundaries: Boundaries): boolean {
        return (
            position.x >= boundaries.x[0] && position.x <= boundaries.x[1] &&
            position.y >= boundaries.y[0] && position.y <= boundaries.y[1] &&
            position.z >= boundaries.z[0] && position.z <= boundaries.z[1]
        );
    }
}