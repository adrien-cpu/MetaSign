// src/ai/specialized/spatial/generators/LayoutGenerator.ts

import { ILayoutGenerator } from './interfaces/ILayoutGenerator';
import { ISigningSpace } from '../core/interfaces/ISigningSpace';
import { IProformeRegistry } from '../core/interfaces/IProformeRegistry';
import {
    CulturalContext,
    ReferenceZone,
    SpatialElement,
    SpatialLayout,
    SpatialRelation,
    ReferenceZoneType,
    SpatialRelationType,
    SpatialLayoutError
} from '../types';

// Définir d'abord les types manquants
type EntityType = 'entity' | 'landmark' | 'container' | 'concept';

interface ElementProperties {
    role?: string;
    importance?: number;
    timeSegment?: string;
    thematicField?: string;
    emphasis?: 'standard' | 'high' | 'low';
    containerType?: string;
    conceptType?: string;
}

/**
 * Générateur de disposition spatiale pour la LSF
 * Responsable de la création et de l'optimisation des dispositions spatiales
 */
export class LayoutGenerator implements ILayoutGenerator {
    /**
     * Constructeur
     * @param signingSpace Espace de signation
     * @param proformeRegistry Registre des proformes
     */
    constructor(
        private signingSpace: ISigningSpace,
        private proformeRegistry: IProformeRegistry
    ) { }

    /**
     * Génère une disposition spatiale à partir des zones de référence
     * @param zones Zones de référence
     * @param context Contexte culturel (optionnel, pour des adaptations spécifiques)
     * @returns Disposition spatiale générée
     */
    public async generateLayout(
        zones: ReferenceZone[],
        context?: CulturalContext
    ): Promise<SpatialLayout> {
        // Création de la disposition initiale
        const layout: SpatialLayout = {
            zones,
            elements: new Map<string, SpatialElement>(),
            relations: [],
            getZones: () => zones,
            getRelations: () => layout.relations
        };

        // Placement des éléments dans les zones
        await this.placeElements(layout);

        // Création des relations entre éléments
        await this.createRelations(layout);

        // Optimisation des positions des éléments
        await this.optimizeElementPositions(layout);

        // Validation de la disposition
        const isValid = await this.validateLayout(layout);
        if (!isValid) {
            throw new SpatialLayoutError('Invalid spatial layout generated');
        }

        return layout;
    }

    /**
     * Place des éléments dans les zones de la disposition
     * @param layout Disposition spatiale
     * @returns Disposition avec les éléments placés
     */
    public async placeElements(layout: SpatialLayout): Promise<SpatialLayout> {
        const zones = layout.getZones();

        // Pour chaque zone, créer des éléments appropriés
        for (const zone of zones) {
            switch (zone.type) {
                case ReferenceZoneType.ACTANT:
                    await this.placeActantInZone(zone, layout);
                    break;
                case ReferenceZoneType.TIMELINE:
                    await this.placeTimemarkersInZone(zone, layout);
                    break;
                case ReferenceZoneType.TOPIC:
                    await this.placeTopicMarkersInZone(zone, layout);
                    break;
                case ReferenceZoneType.CONTAINER:
                    await this.placeContainerInZone(zone, layout);
                    break;
                case ReferenceZoneType.ABSTRACT:
                    await this.placeAbstractConceptInZone(zone, layout);
                    break;
                case ReferenceZoneType.NEUTRAL:
                    // Pas d'éléments spécifiques pour les zones neutres
                    break;
            }
        }

        return layout;
    }

    /**
     * Crée des relations entre les éléments placés
     * @param layout Disposition spatiale avec éléments
     * @returns Disposition avec relations créées
     */
    public async createRelations(layout: SpatialLayout): Promise<SpatialLayout> {
        const elements = Array.from(layout.elements.values());

        // Créer des relations entre éléments
        // Par exemple, relations entre actants
        const actants = elements.filter(e => e.type === 'entity');

        if (actants.length >= 2) {
            for (let i = 0; i < actants.length - 1; i++) {
                for (let j = i + 1; j < actants.length; j++) {
                    const actant1 = actants[i];
                    const actant2 = actants[j];

                    const relation: SpatialRelation = {
                        id: `relation-${actant1.id}-${actant2.id}`,
                        type: SpatialRelationType.HIERARCHY,
                        sourceId: actant1.id,
                        targetId: actant2.id,
                        strength: 0.8,
                        properties: {
                            relationName: 'subject-object'
                        }
                    };

                    layout.relations.push(relation);
                }
            }
        }

        // Relations entre marqueurs temporels et actants
        const timeMarkers = elements.filter(e => e.properties.timeSegment !== undefined);

        for (const timeMarker of timeMarkers) {
            for (const actant of actants) {
                const relation: SpatialRelation = {
                    id: `relation-${timeMarker.id}-${actant.id}`,
                    type: SpatialRelationType.ALIGNMENT,
                    sourceId: timeMarker.id,
                    targetId: actant.id,
                    strength: 0.7,
                    properties: {
                        temporalAlignment: timeMarker.properties.timeSegment || 'present'
                    }
                };

                layout.relations.push(relation);
            }
        }

        // Relations entre conteneurs et éléments contenus
        const containers = elements.filter(e => e.type === 'container');
        const otherElements = elements.filter(e => e.type !== 'container');

        for (const container of containers) {
            for (const element of otherElements) {
                // Vérifier si l'élément est dans le conteneur
                if (this.isElementInContainer(element, container)) {
                    const relation: SpatialRelation = {
                        id: `relation-${container.id}-${element.id}`,
                        type: SpatialRelationType.CONTAINMENT,
                        sourceId: container.id,
                        targetId: element.id,
                        strength: 0.9,
                        properties: {
                            relationName: 'container-contained'
                        }
                    };

                    layout.relations.push(relation);
                }
            }
        }

        return layout;
    }

    /**
     * Optimise la disposition des éléments
     * @param layout Disposition à optimiser
     * @returns Disposition optimisée
     */
    public async optimizeElementPositions(layout: SpatialLayout): Promise<SpatialLayout> {
        const elements = Array.from(layout.elements.values());

        // Regroupement par zone
        const elementsByZone = new Map<string, SpatialElement[]>();

        for (const element of elements) {
            if (element.referenceZone) {
                if (!elementsByZone.has(element.referenceZone)) {
                    elementsByZone.set(element.referenceZone, []);
                }
                elementsByZone.get(element.referenceZone)!.push(element);
            }
        }

        // Optimisation pour chaque groupe
        for (const [zoneId, zoneElements] of elementsByZone.entries()) {
            if (zoneElements.length > 1) {
                // Trouver le centre de la zone
                const zone = layout.getZones().find(z => z.id === zoneId);
                if (zone) {
                    const zoneCenter = zone.area.center;

                    // Ajuster les positions pour une meilleure distribution
                    this.distributeElements(zoneElements, zoneCenter);
                }
            }
        }

        // Éviter les chevauchements entre tous les éléments
        this.resolveElementOverlaps(elements);

        // Optimiser la visibilité des éléments importants
        this.optimizeElementVisibility(elements, layout);

        return layout;
    }

    /**
     * Valide la disposition générée
     * @param layout Disposition à valider
     * @returns Vrai si la disposition est valide
     */
    public async validateLayout(layout: SpatialLayout): Promise<boolean> {
        // Vérification de validité basique
        if (layout.zones.length === 0) return false;
        if (layout.elements.size === 0) return false;

        // Vérification que chaque élément référence une zone valide
        for (const element of layout.elements.values()) {
            if (element.referenceZone) {
                const zoneExists = layout.zones.some(zone => zone.id === element.referenceZone);
                if (!zoneExists) return false;
            }
        }

        // Vérification des relations
        for (const relation of layout.relations) {
            const sourceExists = layout.elements.has(relation.sourceId);
            const targetExists = layout.elements.has(relation.targetId);
            if (!sourceExists || !targetExists) return false;
        }

        return true;
    }

    /**
     * Place un actant dans une zone
     * @param zone Zone d'actant
     * @param layout Disposition spatiale
     */
    private async placeActantInZone(zone: ReferenceZone, layout: SpatialLayout): Promise<void> {
        // Création d'un élément d'actant
        const actantElement: SpatialElement = {
            id: `actant-${zone.id}`,
            type: 'entity' as EntityType,
            position: { ...zone.area.center },
            dimensions: {
                width: zone.area.dimensions.width * 0.8,
                height: zone.area.dimensions.height * 0.8,
                depth: zone.area.dimensions.depth * 0.8
            },
            properties: {
                role: zone.metadata.defaultRole || 'generic',
                importance: zone.significance
            },
            referenceZone: zone.id
        };

        layout.elements.set(actantElement.id, actantElement);
    }

    /**
     * Place des marqueurs de temps dans une zone chronologique
     * @param zone Zone de chronologie
     * @param layout Disposition spatiale
     */
    private async placeTimemarkersInZone(zone: ReferenceZone, layout: SpatialLayout): Promise<void> {
        // Récupération des segments temporels de la zone
        const timeSegments = zone.metadata.timeSegments as string[] || ['past', 'present', 'future'];

        // Placement d'un marqueur pour chaque segment
        const segmentWidth = zone.area.dimensions.width / timeSegments.length;

        timeSegments.forEach((segment, index) => {
            const offset = (index - (timeSegments.length - 1) / 2) * segmentWidth;

            const timeMarker: SpatialElement = {
                id: `time-${segment}`,
                type: 'landmark' as EntityType,
                position: {
                    x: zone.area.center.x + offset,
                    y: zone.area.center.y,
                    z: zone.area.center.z
                },
                properties: {
                    timeSegment: segment,
                    importance: segment === 'present' ? 0.9 : 0.7
                },
                referenceZone: zone.id
            };

            layout.elements.set(timeMarker.id, timeMarker);
        });
    }

    /**
     * Place des marqueurs de thème dans une zone thématique
     * @param zone Zone thématique
     * @param layout Disposition spatiale
     */
    private async placeTopicMarkersInZone(zone: ReferenceZone, layout: SpatialLayout): Promise<void> {
        // Création d'un marqueur de thème
        const topicMarker: SpatialElement = {
            id: `topic-${zone.id}`,
            type: 'landmark' as EntityType,
            position: { ...zone.area.center },
            properties: {
                thematicField: zone.metadata.thematicField || 'general',
                emphasis: zone.metadata.emphasis || 'standard'
            },
            referenceZone: zone.id
        };

        layout.elements.set(topicMarker.id, topicMarker);
    }

    /**
     * Place un conteneur dans une zone
     * @param zone Zone conteneur
     * @param layout Disposition spatiale
     */
    private async placeContainerInZone(zone: ReferenceZone, layout: SpatialLayout): Promise<void> {
        // Création d'un élément conteneur
        const containerElement: SpatialElement = {
            id: `container-${zone.id}`,
            type: 'container' as EntityType,
            position: { ...zone.area.center },
            dimensions: {
                width: zone.area.dimensions.width * 0.9,
                height: zone.area.dimensions.height * 0.9,
                depth: zone.area.dimensions.depth * 0.9
            },
            properties: {
                containerType: zone.metadata.containerType || 'generic',
                importance: zone.significance
            },
            referenceZone: zone.id
        };

        layout.elements.set(containerElement.id, containerElement);
    }

    /**
     * Place un concept abstrait dans une zone
     * @param zone Zone abstraite
     * @param layout Disposition spatiale
     */
    private async placeAbstractConceptInZone(zone: ReferenceZone, layout: SpatialLayout): Promise<void> {
        // Création d'un élément de concept abstrait
        const abstractElement: SpatialElement = {
            id: `abstract-${zone.id}`,
            type: 'concept' as EntityType,
            position: { ...zone.area.center },
            properties: {
                conceptType: zone.metadata.conceptType || 'abstract',
                importance: zone.significance
            },
            referenceZone: zone.id
        };

        layout.elements.set(abstractElement.id, abstractElement);
    }

    /**
     * Vérifie si un élément est à l'intérieur d'un conteneur
     * @param element Élément à vérifier
     * @param container Conteneur potentiel
     * @returns Vrai si l'élément est dans le conteneur
     */
    private isElementInContainer(element: SpatialElement, container: SpatialElement): boolean {
        // Si le conteneur n'a pas de dimensions, on ne peut pas vérifier
        if (!container.dimensions) return false;

        // Calcul des limites du conteneur
        const halfWidth = container.dimensions.width / 2;
        const halfHeight = container.dimensions.height / 2;
        const halfDepth = container.dimensions.depth / 2;

        // Vérification que l'élément est à l'intérieur des limites du conteneur
        return Math.abs(element.position.x - container.position.x) < halfWidth &&
            Math.abs(element.position.y - container.position.y) < halfHeight &&
            Math.abs(element.position.z - container.position.z) < halfDepth;
    }

    /**
     * Distribue les éléments autour d'un point central
     * @param elements Éléments à distribuer
     * @param center Point central
     */
    private distributeElements(elements: SpatialElement[], center: { x: number, y: number, z: number }): void {
        if (elements.length <= 1) return;

        // Pour une distribution simple, on place les éléments en cercle autour du centre
        const radius = 0.3; // Rayon du cercle
        const angleStep = (2 * Math.PI) / elements.length;

        elements.forEach((element, index) => {
            const angle = index * angleStep;

            // Nouvelle position sur le cercle
            element.position = {
                x: center.x + radius * Math.cos(angle),
                y: center.y,
                z: center.z + radius * Math.sin(angle)
            };
        });
    }

    /**
     * Résout les chevauchements entre éléments
     * @param elements Tous les éléments
     */
    private resolveElementOverlaps(elements: SpatialElement[]): void {
        const iterations = 5; // Nombre d'itérations pour résoudre les chevauchements

        for (let iter = 0; iter < iterations; iter++) {
            let overlapsResolved = true;

            // Pour chaque paire d'éléments, vérifier et résoudre les chevauchements
            for (let i = 0; i < elements.length; i++) {
                for (let j = i + 1; j < elements.length; j++) {
                    const elem1 = elements[i];
                    const elem2 = elements[j];

                    // Si les éléments se chevauchent, les écarter
                    if (this.elementsOverlap(elem1, elem2)) {
                        this.resolveOverlap(elem1, elem2);
                        overlapsResolved = false;
                    }
                }
            }

            // Si plus de chevauchements, sortir de la boucle
            if (overlapsResolved) break;
        }
    }

    /**
     * Vérifie si deux éléments se chevauchent
     * @param elem1 Premier élément
     * @param elem2 Second élément
     * @returns Vrai si les éléments se chevauchent
     */
    private elementsOverlap(elem1: SpatialElement, elem2: SpatialElement): boolean {
        // Distance entre les centres
        const dx = elem1.position.x - elem2.position.x;
        const dy = elem1.position.y - elem2.position.y;
        const dz = elem1.position.z - elem2.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Somme des rayons (estimation simple)
        const radius1 = elem1.dimensions ?
            Math.max(elem1.dimensions.width, elem1.dimensions.height, elem1.dimensions.depth) / 2 : 0.1;
        const radius2 = elem2.dimensions ?
            Math.max(elem2.dimensions.width, elem2.dimensions.height, elem2.dimensions.depth) / 2 : 0.1;

        // Chevauchement si la distance est inférieure à la somme des rayons
        return distance < (radius1 + radius2);
    }

    /**
     * Résout le chevauchement entre deux éléments
     * @param elem1 Premier élément
     * @param elem2 Second élément
     */
    private resolveOverlap(elem1: SpatialElement, elem2: SpatialElement): void {
        // Vecteur de séparation
        const dx = elem2.position.x - elem1.position.x;
        const dy = elem2.position.y - elem1.position.y;
        const dz = elem2.position.z - elem1.position.z;

        // Normalisation du vecteur
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (distance < 0.001) {
            // Éviter la division par zéro, déplacer selon un vecteur arbitraire
            elem2.position.x += 0.1;
            elem2.position.z += 0.1;
            return;
        }

        const nx = dx / distance;
        const ny = dy / distance;
        const nz = dz / distance;

        // Somme des rayons (estimation simple)
        const radius1 = elem1.dimensions ?
            Math.max(elem1.dimensions.width, elem1.dimensions.height, elem1.dimensions.depth) / 2 : 0.1;
        const radius2 = elem2.dimensions ?
            Math.max(elem2.dimensions.width, elem2.dimensions.height, elem2.dimensions.depth) / 2 : 0.1;

        // Distance minimale de séparation
        const minDistance = (radius1 + radius2) * 1.1; // 10% de marge

        // Déplacement nécessaire
        const move = minDistance - distance;

        // Répartir le déplacement entre les deux éléments selon leur importance
        const importance1 = elem1.properties.importance || 0.5;
        const importance2 = elem2.properties.importance || 0.5;
        const totalImportance = importance1 + importance2;

        const move1 = move * (importance2 / totalImportance);
        const move2 = move * (importance1 / totalImportance);

        // Appliquer le déplacement
        elem1.position.x -= nx * move1;
        elem1.position.y -= ny * move1;
        elem1.position.z -= nz * move1;

        elem2.position.x += nx * move2;
        elem2.position.y += ny * move2;
        elem2.position.z += nz * move2;
    }

    /**
     * Optimise la visibilité des éléments importants
     * @param elements Éléments à optimiser
     * @param layout Disposition spatiale
     */
    private optimizeElementVisibility(elements: SpatialElement[], layout: SpatialLayout): void {
        // Tri par importance décroissante
        const sortedElements = [...elements].sort((a, b) => {
            const importanceA = a.properties.importance || 0.5;
            const importanceB = b.properties.importance || 0.5;
            return importanceB - importanceA;
        });

        // Pour les éléments les plus importants, ajuster la position
        for (let i = 0; i < Math.min(sortedElements.length, 3); i++) {
            const element = sortedElements[i];

            // Rapprocher légèrement de l'avant (position z plus petite)
            element.position.z *= 0.9;

            // Légèrement plus haut pour être plus visible
            element.position.y += 0.05;
        }
    }
}