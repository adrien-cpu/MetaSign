// src/ai/feedback/validators/zone/ZoneTransitionExtractor.ts

import { LSFExpression } from '../../../emotions/lsf/types';
import { Position3D, ZoneDefinition } from '../interfaces/ISpatialValidator';
import { ZoneTransition } from '../../types/zone-validation';
import { ValidationResult, ValidationIssue } from '../../types/validation';

/**
 * Classe responsable de l'extraction et de la validation des transitions entre zones
 */
export class ZoneTransitionExtractor {
    private static readonly MIN_TRANSITION_DURATION = 100; // ms
    private static readonly MAX_TRANSITION_DURATION = 2000; // ms
    private static readonly MIN_POINT_DISTANCE = 0.1; // Distance minimale entre points
    private static readonly MAX_PATH_DIRECT_RATIO = 2.0; // Ratio maximal entre longueur chemin et distance directe

    constructor(private zoneCache: Map<string, ZoneDefinition>) { }

    /**
     * Extrait les transitions entre zones à partir d'une expression LSF
     */
    extractZoneTransitions(expression: LSFExpression): ZoneTransition[] {
        const transitions: ZoneTransition[] = [];
        const positions = expression.locations || [];

        if (positions.length < 2) {
            return transitions;
        }

        // Identifier à quelle zone appartient chaque position
        const positionZones = this.mapPositionsToZones(positions);

        // Créer les transitions entre zones
        for (let i = 1; i < positionZones.length; i++) {
            if (positionZones[i] !== positionZones[i - 1] && positionZones[i] && positionZones[i - 1]) {
                transitions.push({
                    fromZone: positionZones[i - 1],
                    toZone: positionZones[i],
                    duration: 200, // Valeur par défaut
                    path: positions.slice(i - 1, i + 1)
                });
            }
        }

        return transitions;
    }

    /**
     * Valide un ensemble de transitions entre zones
     */
    validateTransitions(transitions: ZoneTransition[]): ValidationResult {
        const issues: ValidationIssue[] = [];

        for (const transition of transitions) {
            const transitionIssues = this.validateSingleTransition(transition);
            issues.push(...transitionIssues);
        }

        return {
            isValid: issues.length === 0,
            issues,
            score: this.calculateTransitionScore(issues)
        };
    }

    /**
     * Valide une transition spécifique entre zones
     */
    private validateSingleTransition(transition: ZoneTransition): ValidationIssue[] {
        const issues: ValidationIssue[] = [];

        if (!this.isValidTransitionDuration(transition.duration)) {
            issues.push({
                type: 'transition_duration',
                severity: 'medium',
                description: `Invalid transition duration: ${transition.duration}ms`
            });
        }

        if (!this.isValidTransitionPath(transition.path)) {
            issues.push({
                type: 'transition_path',
                severity: 'high',
                description: 'Invalid transition path between zones'
            });
        }

        return issues;
    }

    /**
     * Associe chaque position à une zone
     */
    private mapPositionsToZones(positions: Position3D[]): string[] {
        return positions.map(position => {
            for (const [zoneId, definition] of this.zoneCache.entries()) {
                if (this.isWithinBoundaries(position, definition.boundaries)) {
                    return zoneId;
                }
            }
            return '';
        });
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
     * Vérifie si la durée d'une transition est valide
     */
    private isValidTransitionDuration(duration: number): boolean {
        return duration >= ZoneTransitionExtractor.MIN_TRANSITION_DURATION &&
            duration <= ZoneTransitionExtractor.MAX_TRANSITION_DURATION;
    }

    /**
     * Vérifie si le chemin d'une transition est valide
     */
    private isValidTransitionPath(path: Position3D[]): boolean {
        if (!path || path.length < 2) {
            return false;
        }

        // Vérifier que les points sont suffisamment espacés
        for (let i = 1; i < path.length; i++) {
            const distance = this.calculateDistance(path[i - 1], path[i]);
            if (distance < ZoneTransitionExtractor.MIN_POINT_DISTANCE) {
                return false;
            }
        }

        // Vérifier que le chemin ne fait pas de zigzags excessifs
        const totalLength = this.calculatePathLength(path);
        const directDistance = this.calculateDistance(path[0], path[path.length - 1]);

        return (totalLength / directDistance) < ZoneTransitionExtractor.MAX_PATH_DIRECT_RATIO;
    }

    /**
     * Calcule la distance entre deux points 3D
     */
    private calculateDistance(p1: Position3D, p2: Position3D): number {
        return Math.sqrt(
            Math.pow(p2.x - p1.x, 2) +
            Math.pow(p2.y - p1.y, 2) +
            Math.pow(p2.z - p1.z, 2)
        );
    }

    /**
     * Calcule la longueur totale d'un chemin
     */
    private calculatePathLength(path: Position3D[]): number {
        let length = 0;
        for (let i = 1; i < path.length; i++) {
            length += this.calculateDistance(path[i - 1], path[i]);
        }
        return length;
    }

    /**
     * Calcule un score de validation pour les transitions
     */
    private calculateTransitionScore(issues: ValidationIssue[]): number {
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