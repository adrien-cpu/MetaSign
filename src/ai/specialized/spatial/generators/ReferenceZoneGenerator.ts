// src/ai/specialized/spatial/generators/ReferenceZoneGenerator.ts

import { IReferenceZoneGenerator } from './interfaces/IReferenceZoneGenerator';
import {
    CulturalContext,
    ReferenceZone,
    ReferenceZoneType,
    SigningSpace
} from '../types';

/**
 * Générateur de zones de référence pour la LSF
 * Responsable de la création et de l'optimisation des zones spatiales
 */
export class ReferenceZoneGenerator implements IReferenceZoneGenerator {
    /**
     * Constructeur
     * @param signingSpace Espace de signation dans lequel les zones seront placées
     */
    constructor(private signingSpace: SigningSpace) { }

    /**
     * Génère toutes les zones de référence pour un contexte culturel donné
     * @param context Contexte culturel
     * @returns Tableau des zones de référence générées
     */
    public async generateZones(context: CulturalContext): Promise<ReferenceZone[]> {
        const zones: ReferenceZone[] = [];

        // Création des zones temporelles
        const timelineZones = await this.generateZonesByType(context, ReferenceZoneType.TIMELINE);
        zones.push(...timelineZones);

        // Création des zones d'actants
        const actantZones = await this.generateZonesByType(context, ReferenceZoneType.ACTANT);
        zones.push(...actantZones);

        // Création des zones thématiques
        const topicZones = await this.generateZonesByType(context, ReferenceZoneType.TOPIC);
        zones.push(...topicZones);

        // Création des zones neutres
        const neutralZones = await this.generateZonesByType(context, ReferenceZoneType.NEUTRAL);
        zones.push(...neutralZones);

        // Création des zones abstraites
        const abstractZones = await this.generateZonesByType(context, ReferenceZoneType.ABSTRACT);
        zones.push(...abstractZones);

        // Création des zones conteneurs
        const containerZones = await this.generateZonesByType(context, ReferenceZoneType.CONTAINER);
        zones.push(...containerZones);

        // Optimisation de la disposition des zones
        return this.optimizeZoneLayout(zones);
    }

    /**
     * Génère des zones de référence d'un type spécifique
     * @param context Contexte culturel
     * @param type Type de zone à générer
     * @returns Tableau des zones de référence du type spécifié
     */
    public async generateZonesByType(
        context: CulturalContext,
        type: ReferenceZoneType
    ): Promise<ReferenceZone[]> {
        switch (type) {
            case ReferenceZoneType.TIMELINE:
                return this.createTimelineZones(context);
            case ReferenceZoneType.ACTANT:
                return this.createActantZones(context);
            case ReferenceZoneType.TOPIC:
                return this.createTopicZones(context);
            case ReferenceZoneType.NEUTRAL:
                return this.createNeutralZones(context);
            case ReferenceZoneType.ABSTRACT:
                return this.createAbstractZones(context);
            case ReferenceZoneType.CONTAINER:
                return this.createContainerZones(context);
            default:
                return [];
        }
    }

    /**
     * Optimise la disposition des zones pour éviter les chevauchements et utiliser l'espace efficacement
     * @param zones Zones à optimiser
     * @returns Zones optimisées
     */
    public async optimizeZoneLayout(zones: ReferenceZone[]): Promise<ReferenceZone[]> {
        // Clone des zones pour éviter de modifier les originales
        const optimizedZones = JSON.parse(JSON.stringify(zones)) as ReferenceZone[];

        // Tri par priorité décroissante
        optimizedZones.sort((a, b) => b.priority - a.priority);

        // Pour chaque zone (sauf la première), vérifier et ajuster les chevauchements
        for (let i = 1; i < optimizedZones.length; i++) {
            const currentZone = optimizedZones[i];

            // Vérifier les chevauchements avec les zones précédentes (de priorité supérieure)
            for (let j = 0; j < i; j++) {
                const previousZone = optimizedZones[j];

                // Si chevauchement détecté, ajuster la position de la zone courante
                if (this.zonesOverlap(currentZone, previousZone)) {
                    this.adjustZonePosition(currentZone, previousZone);
                }
            }
        }

        return optimizedZones;
    }

    /**
     * Crée les zones de chronologie (timeline)
     * @param context Contexte culturel
     * @returns Zones de chronologie
     */
    private async createTimelineZones(context: CulturalContext): Promise<ReferenceZone[]> {
        // La direction de la timeline peut varier selon le contexte culturel
        const timelineDirection = context.region === 'france' ? 'left-to-right' : 'context-dependent';

        return [
            {
                id: 'timeline-main',
                name: 'Ligne temporelle principale',
                type: ReferenceZoneType.TIMELINE,
                area: {
                    center: { x: 0, y: 0, z: 0.5 },
                    dimensions: { width: 1.5, height: 0.2, depth: 0.2 }
                },
                significance: 0.9,
                priority: 1,
                metadata: {
                    direction: timelineDirection,
                    timeSegments: ['past', 'present', 'future']
                }
            }
        ];
    }

    /**
     * Crée les zones d'actants
     * @param context Contexte culturel
     * @returns Zones d'actants
     */
    private async createActantZones(context: CulturalContext): Promise<ReferenceZone[]> {
        // Adaptation selon le niveau de formalité
        const zoneSize = context.formalityLevel ?
            0.4 + context.formalityLevel * 0.1 : 0.4;

        return [
            {
                id: 'actant-left',
                name: 'Actant gauche',
                type: ReferenceZoneType.ACTANT,
                area: {
                    center: { x: -0.7, y: 0, z: 0.3 },
                    dimensions: { width: zoneSize, height: zoneSize, depth: zoneSize }
                },
                significance: 0.8,
                priority: 2,
                metadata: {
                    defaultRole: 'subject',
                    contextualUsage: context.context || 'standard'
                }
            },
            {
                id: 'actant-right',
                name: 'Actant droit',
                type: ReferenceZoneType.ACTANT,
                area: {
                    center: { x: 0.7, y: 0, z: 0.3 },
                    dimensions: { width: zoneSize, height: zoneSize, depth: zoneSize }
                },
                significance: 0.8,
                priority: 2,
                metadata: {
                    defaultRole: 'object',
                    contextualUsage: context.context || 'standard'
                }
            }
        ];
    }

    /**
     * Crée les zones thématiques
     * @param context Contexte culturel
     * @returns Zones thématiques
     */
    private async createTopicZones(context: CulturalContext): Promise<ReferenceZone[]> {
        // Adaptation selon le thème défini dans le contexte
        const thematicField = context.parameters?.thematicField as string || 'general';
        const emphasis = context.formalityLevel && context.formalityLevel > 0.7 ? 'formal' : 'standard';

        return [
            {
                id: 'topic-main',
                name: 'Thème principal',
                type: ReferenceZoneType.TOPIC,
                area: {
                    center: { x: 0, y: 0.3, z: 0.3 },
                    dimensions: { width: 0.5, height: 0.5, depth: 0.3 }
                },
                significance: 0.75,
                priority: 3,
                metadata: {
                    thematicField,
                    emphasis
                }
            }
        ];
    }

    /**
     * Crée les zones neutres
     * @param context Contexte culturel
     * @returns Zones neutres
     */
    private async createNeutralZones(context: CulturalContext): Promise<ReferenceZone[]> {
        return [
            {
                id: 'neutral-center',
                name: 'Zone neutre centrale',
                type: ReferenceZoneType.NEUTRAL,
                area: {
                    center: { x: 0, y: 0, z: 0 },
                    dimensions: { width: 0.5, height: 0.5, depth: 0.5 }
                },
                significance: 0.8,
                priority: 2,
                metadata: {}
            }
        ];
    }

    /**
     * Crée les zones abstraites
     * @param context Contexte culturel
     * @returns Zones abstraites
     */
    private async createAbstractZones(context: CulturalContext): Promise<ReferenceZone[]> {
        // Ces zones peuvent varier considérablement selon le contexte culturel et linguistique
        if (context.context === 'abstract-reasoning') {
            return [
                {
                    id: 'abstract-concepts',
                    name: 'Zone de concepts abstraits',
                    type: ReferenceZoneType.ABSTRACT,
                    area: {
                        center: { x: 0, y: 0.5, z: 0.5 },
                        dimensions: { width: 0.6, height: 0.6, depth: 0.6 }
                    },
                    significance: 0.7,
                    priority: 4,
                    metadata: {
                        conceptType: 'abstract'
                    }
                }
            ];
        }

        // Par défaut, pas de zones abstraites
        return [];
    }

    /**
     * Crée les zones conteneurs
     * @param context Contexte culturel
     * @returns Zones conteneurs
     */
    private async createContainerZones(context: CulturalContext): Promise<ReferenceZone[]> {
        // Ces zones sont utilisées pour représenter des conteneurs ou des environnements
        if (context.parameters?.hasContainers) {
            return [
                {
                    id: 'container-main',
                    name: 'Conteneur principal',
                    type: ReferenceZoneType.CONTAINER,
                    area: {
                        center: { x: 0, y: 0.2, z: 0.7 },
                        dimensions: { width: 0.8, height: 0.6, depth: 0.6 }
                    },
                    significance: 0.6,
                    priority: 5,
                    metadata: {
                        containerType: context.parameters?.containerType || 'generic'
                    }
                }
            ];
        }

        // Par défaut, pas de zones conteneurs
        return [];
    }

    /**
     * Vérifie si deux zones se chevauchent
     * @param zone1 Première zone
     * @param zone2 Seconde zone
     * @returns Vrai si les zones se chevauchent
     */
    private zonesOverlap(zone1: ReferenceZone, zone2: ReferenceZone): boolean {
        // Calcul des demi-dimensions
        const halfWidth1 = zone1.area.dimensions.width / 2;
        const halfHeight1 = zone1.area.dimensions.height / 2;
        const halfDepth1 = zone1.area.dimensions.depth / 2;

        const halfWidth2 = zone2.area.dimensions.width / 2;
        const halfHeight2 = zone2.area.dimensions.height / 2;
        const halfDepth2 = zone2.area.dimensions.depth / 2;

        // Vérification des chevauchements sur chaque axe
        const overlapX = Math.abs(zone1.area.center.x - zone2.area.center.x) < (halfWidth1 + halfWidth2);
        const overlapY = Math.abs(zone1.area.center.y - zone2.area.center.y) < (halfHeight1 + halfHeight2);
        const overlapZ = Math.abs(zone1.area.center.z - zone2.area.center.z) < (halfDepth1 + halfDepth2);

        // Il y a chevauchement si les zones se chevauchent sur tous les axes
        return overlapX && overlapY && overlapZ;
    }

    /**
     * Ajuste la position d'une zone pour éviter le chevauchement
     * @param zoneToAdjust Zone à ajuster
     * @param referenceZone Zone de référence à éviter
     */
    private adjustZonePosition(zoneToAdjust: ReferenceZone, referenceZone: ReferenceZone): void {
        // Calcul du vecteur de chevauchement
        const overlapVector = {
            x: zoneToAdjust.area.center.x - referenceZone.area.center.x,
            y: zoneToAdjust.area.center.y - referenceZone.area.center.y,
            z: zoneToAdjust.area.center.z - referenceZone.area.center.z
        };

        // Normalisation du vecteur
        const length = Math.sqrt(
            overlapVector.x * overlapVector.x +
            overlapVector.y * overlapVector.y +
            overlapVector.z * overlapVector.z
        );

        // Éviter la division par zéro
        if (length < 0.001) {
            // Si les centres sont presque identiques, déplacer dans une direction arbitraire
            zoneToAdjust.area.center.x += 0.2;
            zoneToAdjust.area.center.z += 0.1;
            return;
        }

        // Calcul des demi-dimensions
        const combinedHalfWidth = (zoneToAdjust.area.dimensions.width + referenceZone.area.dimensions.width) / 2;
        const combinedHalfHeight = (zoneToAdjust.area.dimensions.height + referenceZone.area.dimensions.height) / 2;
        const combinedHalfDepth = (zoneToAdjust.area.dimensions.depth + referenceZone.area.dimensions.depth) / 2;

        // Normalisation et mise à l'échelle du vecteur
        const direction = {
            x: overlapVector.x / length,
            y: overlapVector.y / length,
            z: overlapVector.z / length
        };

        // Calculer le déplacement minimal nécessaire sur chaque axe
        const minDistanceX = combinedHalfWidth - Math.abs(overlapVector.x);
        const minDistanceY = combinedHalfHeight - Math.abs(overlapVector.y);
        const minDistanceZ = combinedHalfDepth - Math.abs(overlapVector.z);

        // Trouver l'axe avec le déplacement minimal
        let minDistance = Math.min(minDistanceX, minDistanceY, minDistanceZ);

        // Petite marge supplémentaire pour éviter les cas limites
        minDistance += 0.05;

        // Appliquer le déplacement
        zoneToAdjust.area.center.x += direction.x * minDistance;
        zoneToAdjust.area.center.y += direction.y * minDistance;
        zoneToAdjust.area.center.z += direction.z * minDistance;
    }
}