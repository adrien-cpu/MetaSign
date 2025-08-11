// src/ai/spatial/validation/SpatialCoherenceValidator.ts

import { ISpatialCoherenceValidator, SpatialCoherenceReport, SpatialCoherenceIssue } from '../types/interfaces/SpatialInterfaces';
import { SpatialMap, SpatialReference, SpatialVector } from '../types/SpatialTypes';

/**
 * Validateur de la cohérence des structures spatiales en LSF
 * Implémente l'interface ISpatialCoherenceValidator
 */
export class SpatialCoherenceValidator implements ISpatialCoherenceValidator {
    // Seuils de validation configurables
    private minDistanceThreshold = 0.1; // Distance minimale entre deux références
    private maxDistanceThreshold = 10.0; // Distance maximale pour une relation
    private overlapThreshold = 0.5; // Seuil de chevauchement acceptable
    private visibilityAngleThreshold = 120; // Angle de visibilité en degrés

    /**
     * Calcule la distance entre deux points
     */
    private calculateDistance(p1: SpatialVector, p2: SpatialVector): number {
        return Math.sqrt(
            Math.pow(p2.x - p1.x, 2) +
            Math.pow(p2.y - p1.y, 2) +
            Math.pow(p2.z - p1.z, 2)
        );
    }

    /**
     * Calcule l'angle entre trois points
     */
    private calculateAngle(p1: SpatialVector, p2: SpatialVector, p3: SpatialVector): number {
        // Vecteurs
        const v1 = {
            x: p1.x - p2.x,
            y: p1.y - p2.y,
            z: p1.z - p2.z
        };

        const v2 = {
            x: p3.x - p2.x,
            y: p3.y - p2.y,
            z: p3.z - p2.z
        };

        // Produit scalaire
        const dotProduct = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;

        // Magnitudes
        const magnitude1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
        const magnitude2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

        // Éviter la division par zéro
        if (magnitude1 === 0 || magnitude2 === 0) {
            return 0;
        }

        // Angle en radians (clamp pour éviter les erreurs d'arrondi)
        const cosTheta = Math.max(-1, Math.min(1, dotProduct / (magnitude1 * magnitude2)));
        const angleRadians = Math.acos(cosTheta);

        // Conversion en degrés
        return angleRadians * (180 / Math.PI);
    }

    /**
     * Vérifie si deux références se chevauchent
     */
    private checkOverlap(ref1: SpatialReference, ref2: SpatialReference): boolean {
        // Distance entre les centres
        const distance = this.calculateDistance(ref1.position, ref2.position);

        // Taille combinée (approximative)
        const size1 = ref1.size || { x: 0.3, y: 0.3, z: 0.3 }; // Taille par défaut
        const size2 = ref2.size || { x: 0.3, y: 0.3, z: 0.3 }; // Taille par défaut

        // Rayon approximatif (moyenne des dimensions)
        const radius1 = (size1.x + size1.y + size1.z) / 6; // Divisé par 6 pour avoir un rayon moyen
        const radius2 = (size2.x + size2.y + size2.z) / 6;

        // Chevauchement si la distance est inférieure à la somme des rayons multipliée par le seuil
        return distance < (radius1 + radius2) * this.overlapThreshold;
    }

    /**
     * Vérifie la visibilité entre deux références
     */
    private checkVisibility(ref1: SpatialReference, ref2: SpatialReference, intermediateRefs: SpatialReference[]): boolean {
        // Vérifier si une référence bloque la visibilité entre les deux références
        for (const ref of intermediateRefs) {
            // Ignorer les références elles-mêmes
            if (ref.id === ref1.id || ref.id === ref2.id) {
                continue;
            }

            // Angle entre ref1, ref et ref2
            const angle = this.calculateAngle(ref1.position, ref.position, ref2.position);

            // Si l'angle est proche de 180 degrés et la référence est entre les deux autres
            if (angle > this.visibilityAngleThreshold) {
                const dist1ToRef = this.calculateDistance(ref1.position, ref.position);
                const dist2ToRef = this.calculateDistance(ref2.position, ref.position);
                const dist1To2 = this.calculateDistance(ref1.position, ref2.position);

                // Si la référence est entre les deux autres
                if (dist1ToRef < dist1To2 && dist2ToRef < dist1To2) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Valide la cohérence d'une carte spatiale
     * @param map La carte spatiale à valider
     * @returns Un rapport de cohérence
     */
    public validateSpatialMap(map: SpatialMap): SpatialCoherenceReport {
        const issues: SpatialCoherenceIssue[] = [];
        let references: SpatialReference[] = [];

        // Extraire les références selon le type de stockage
        if (map.references instanceof Map) {
            references = Array.from(map.references.values());
        } else {
            references = Object.values(map.references);
        }

        // Vérifier le chevauchement
        for (let i = 0; i < references.length; i++) {
            const ref1 = references[i];

            for (let j = i + 1; j < references.length; j++) {
                const ref2 = references[j];

                // Vérifier la distance minimale
                const distance = this.calculateDistance(ref1.position, ref2.position);

                if (distance < this.minDistanceThreshold) {
                    issues.push({
                        type: 'distance',
                        severity: 'warning',
                        message: `Les références ${ref1.id} et ${ref2.id} sont trop proches (${distance.toFixed(2)})`,
                        references: [ref1.id, ref2.id]
                    });
                }

                // Vérifier le chevauchement
                if (this.checkOverlap(ref1, ref2)) {
                    issues.push({
                        type: 'overlap',
                        severity: 'error',
                        message: `Les références ${ref1.id} et ${ref2.id} se chevauchent`,
                        references: [ref1.id, ref2.id]
                    });
                }
            }
        }

        // Vérifier les relations
        for (const connection of map.connections) {
            let source: SpatialReference | undefined;
            let target: SpatialReference | undefined;

            // Récupérer les références selon le type de stockage
            if (map.references instanceof Map) {
                source = map.references.get(connection.sourceId);
                target = map.references.get(connection.targetId);
            } else {
                source = map.references[connection.sourceId];
                target = map.references[connection.targetId];
            }

            if (!source || !target) {
                issues.push({
                    type: 'relationship',
                    severity: 'error',
                    message: `Relation invalide entre ${connection.sourceId} et ${connection.targetId}: une référence n'existe pas`,
                    references: [connection.sourceId, connection.targetId]
                });
                continue;
            }

            // Vérifier la distance maximale
            const distance = this.calculateDistance(source.position, target.position);

            if (distance > this.maxDistanceThreshold) {
                issues.push({
                    type: 'distance',
                    severity: 'warning',
                    message: `La distance entre ${source.id} et ${target.id} est trop grande (${distance.toFixed(2)})`,
                    references: [source.id, target.id]
                });
            }

            // Vérifier la visibilité
            if (!this.checkVisibility(source, target, references)) {
                issues.push({
                    type: 'visibility',
                    severity: 'warning',
                    message: `La visibilité entre ${source.id} et ${target.id} est obstruée`,
                    references: [source.id, target.id]
                });
            }
        }

        // Calculer le score de cohérence (0-1)
        const baseScore = 1.0;
        const errorPenalty = 0.2; // Pénalité par erreur
        const warningPenalty = 0.05; // Pénalité par avertissement

        const errorCount = issues.filter(issue => issue.severity === 'error').length;
        const warningCount = issues.filter(issue => issue.severity === 'warning').length;

        let score = baseScore - (errorCount * errorPenalty) - (warningCount * warningPenalty);
        score = Math.max(0, Math.min(1, score));

        // Générer des recommandations
        const recommendations: string[] = [];

        if (errorCount > 0) {
            recommendations.push('Corrigez les erreurs de chevauchement pour améliorer la cohérence spatiale.');
        }

        if (warningCount > 0) {
            recommendations.push('Ajustez les distances entre références pour une meilleure lisibilité.');
            recommendations.push('Optimisez la disposition pour améliorer la visibilité entre références liées.');
        }

        if (map.connections.length > 0 && issues.filter(i => i.type === 'visibility').length > 0) {
            recommendations.push('Réorganisez les références pour éviter les obstructions visuelles.');
        }

        return {
            isCoherent: errorCount === 0,
            score,
            issues,
            recommendations
        };
    }

    /**
     * Valide la cohérence entre deux références
     * @param reference1 La première référence
     * @param reference2 La seconde référence
     * @returns true si les références sont cohérentes, false sinon
     */
    public validateReferencesCoherence(reference1: SpatialReference, reference2: SpatialReference): boolean {
        // Vérifier la distance minimale
        const distance = this.calculateDistance(reference1.position, reference2.position);

        if (distance < this.minDistanceThreshold) {
            return false;
        }

        // Vérifier le chevauchement
        if (this.checkOverlap(reference1, reference2)) {
            return false;
        }

        return true;
    }

    /**
     * Vérifie si une nouvelle référence peut être ajoutée de manière cohérente
     * @param map La carte spatiale existante
     * @param newReference La nouvelle référence à ajouter
     * @returns Un objet indiquant si l'ajout est cohérent et les éventuels problèmes
     */
    public validateReferenceAddition(map: SpatialMap, newReference: SpatialReference): {
        isValid: boolean;
        issues: string[];
        suggestions?: SpatialVector[];
    } {
        const issues: string[] = [];
        const suggestions: SpatialVector[] = [];
        let references: SpatialReference[] = [];

        // Extraire les références selon le type de stockage
        if (map.references instanceof Map) {
            references = Array.from(map.references.values());
        } else {
            references = Object.values(map.references);
        }

        // Vérifier les problèmes potentiels avec toutes les références existantes
        for (const reference of references) {
            // Vérifier la distance minimale
            const distance = this.calculateDistance(reference.position, newReference.position);

            if (distance < this.minDistanceThreshold) {
                issues.push(`Distance trop courte (${distance.toFixed(2)}) avec la référence ${reference.id}`);

                // Suggérer une position alternative
                const vector = {
                    x: newReference.position.x - reference.position.x,
                    y: newReference.position.y - reference.position.y,
                    z: newReference.position.z - reference.position.z
                };

                // Normaliser le vecteur
                const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
                if (magnitude > 0) {
                    const adjustmentFactor = Math.max(this.minDistanceThreshold * 1.5, distance);

                    suggestions.push({
                        x: reference.position.x + (vector.x / magnitude) * adjustmentFactor,
                        y: reference.position.y + (vector.y / magnitude) * adjustmentFactor,
                        z: reference.position.z + (vector.z / magnitude) * adjustmentFactor
                    });
                }
            }

            // Vérifier le chevauchement
            if (this.checkOverlap(reference, newReference)) {
                issues.push(`Chevauchement détecté avec la référence ${reference.id}`);
            }
        }

        return {
            isValid: issues.length === 0,
            issues,
            suggestions: suggestions.length > 0 ? suggestions : undefined
        };
    }

    /**
     * Vérifie la cohérence des relations dans une carte spatiale
     * @param map La carte spatiale à valider
     * @returns Un objet indiquant si les relations sont cohérentes et les éventuels problèmes
     */
    public validateRelationships(map: SpatialMap): {
        isValid: boolean;
        issues: string[];
    } {
        const issues: string[] = [];
        let references: SpatialReference[] = [];

        // Extraire les références selon le type de stockage
        if (map.references instanceof Map) {
            references = Array.from(map.references.values());
        } else {
            references = Object.values(map.references);
        }

        for (const connection of map.connections) {
            let source: SpatialReference | undefined;
            let target: SpatialReference | undefined;

            // Récupérer les références selon le type de stockage
            if (map.references instanceof Map) {
                source = map.references.get(connection.sourceId);
                target = map.references.get(connection.targetId);
            } else {
                source = map.references[connection.sourceId];
                target = map.references[connection.targetId];
            }

            if (!source || !target) {
                issues.push(`Relation invalide: une des références (${connection.sourceId} ou ${connection.targetId}) n'existe pas`);
                continue;
            }

            // Vérifier la distance maximale
            const distance = this.calculateDistance(source.position, target.position);

            if (distance > this.maxDistanceThreshold) {
                issues.push(`Distance trop grande (${distance.toFixed(2)}) entre ${source.id} et ${target.id}`);
            }

            // Vérifier la visibilité
            if (!this.checkVisibility(source, target, references)) {
                issues.push(`Visibilité obstruée entre ${source.id} et ${target.id}`);
            }
        }

        return {
            isValid: issues.length === 0,
            issues
        };
    }

    /**
     * Suggère des corrections pour rendre une carte spatiale cohérente
     * @param map La carte spatiale à corriger
     * @returns Une version corrigée de la carte spatiale
     */
    public suggestCoherenceCorrections(map: SpatialMap): SpatialMap {
        // Créer une copie de la carte
        let correctedMap: SpatialMap;

        if (map.references instanceof Map) {
            correctedMap = {
                ...map,
                references: new Map(map.references),
                connections: [...map.connections],
                regions: [...map.regions]
            };
        } else {
            correctedMap = {
                ...map,
                references: { ...map.references },
                connections: [...map.connections],
                regions: [...map.regions]
            };
        }

        let references: SpatialReference[];

        // Extraire les références selon le type de stockage
        if (correctedMap.references instanceof Map) {
            references = Array.from(correctedMap.references.values());
        } else {
            references = Object.values(correctedMap.references);
        }

        // Résoudre les problèmes de chevauchement et de distance minimale
        const adjustments = new Map<string, SpatialVector>();

        for (let i = 0; i < references.length; i++) {
            const ref1 = references[i];

            for (let j = i + 1; j < references.length; j++) {
                const ref2 = references[j];

                // Calculer la distance actuelle
                const distance = this.calculateDistance(ref1.position, ref2.position);

                // Vérifier si un ajustement est nécessaire
                if (distance < this.minDistanceThreshold || this.checkOverlap(ref1, ref2)) {
                    // Calculer le vecteur de direction entre les deux références
                    const direction = {
                        x: ref2.position.x - ref1.position.x,
                        y: ref2.position.y - ref1.position.y,
                        z: ref2.position.z - ref1.position.z
                    };

                    // Normaliser le vecteur
                    const magnitude = Math.sqrt(
                        direction.x * direction.x +
                        direction.y * direction.y +
                        direction.z * direction.z
                    );

                    if (magnitude > 0) {
                        // Calculer la nouvelle distance cible
                        const targetDistance = Math.max(this.minDistanceThreshold * 1.5, distance * 1.5);

                        // Calculer les ajustements pour les deux références
                        const factor = (targetDistance - distance) / magnitude;

                        // Appliquer les ajustements
                        const adjustment1 = adjustments.get(ref1.id) || { x: 0, y: 0, z: 0 };
                        const adjustment2 = adjustments.get(ref2.id) || { x: 0, y: 0, z: 0 };

                        // Référence 1 se déplace dans la direction opposée
                        adjustment1.x -= direction.x * factor * 0.5;
                        adjustment1.y -= direction.y * factor * 0.5;
                        adjustment1.z -= direction.z * factor * 0.5;

                        // Référence 2 se déplace dans la direction
                        adjustment2.x += direction.x * factor * 0.5;
                        adjustment2.y += direction.y * factor * 0.5;
                        adjustment2.z += direction.z * factor * 0.5;

                        adjustments.set(ref1.id, adjustment1);
                        adjustments.set(ref2.id, adjustment2);
                    }
                }
            }
        }

        // Appliquer les ajustements calculés
        for (const [refId, adjustment] of adjustments.entries()) {
            if (correctedMap.references instanceof Map) {
                const reference = correctedMap.references.get(refId);
                if (reference) {
                    reference.position = {
                        x: reference.position.x + adjustment.x,
                        y: reference.position.y + adjustment.y,
                        z: reference.position.z + adjustment.z
                    };
                }
            } else {
                const reference = correctedMap.references[refId];
                if (reference) {
                    reference.position = {
                        x: reference.position.x + adjustment.x,
                        y: reference.position.y + adjustment.y,
                        z: reference.position.z + adjustment.z
                    };
                }
            }
        }

        return correctedMap;
    }

    /**
     * Valide tous les aspects d'une carte spatiale
     * @param map La carte spatiale à valider
     * @returns Un résultat de validation
     */
    public validateAll(map: SpatialMap): { valid: boolean; issues: string[] } {
        const coherenceReport = this.validateSpatialMap(map);
        const relationshipsValidation = this.validateRelationships(map);

        // Combiner les problèmes
        const allIssues: string[] = [
            ...coherenceReport.issues.map(issue => issue.message),
            ...relationshipsValidation.issues
        ];

        return {
            valid: coherenceReport.isCoherent && relationshipsValidation.isValid,
            issues: allIssues
        };
    }
}