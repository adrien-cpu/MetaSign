/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/space/managers/ZoneManager.ts
 * @description Gestionnaire des zones référentielles spatiales
 * @author MetaSign
 * @version 1.0.0
 * @since 2025-05-29
 */

import { LSF_SPATIAL_SYSTEM } from '../../../spatial/LSFSpatialSystem';

/**
 * Interface standardisée pour les zones référentielles spatiales (locale)
 */
export interface StandardLSFReferentialZone {
    id: string;
    name: string;
    coordinates: [number, number];
    semanticRole: string;
    established: boolean;
    consistency: number;
    usage_frequency: number;
}

/**
 * Interface pour les données de zone du système spatial
 */
interface SpatialSystemZoneData {
    name: string;
    coordinates: unknown; // Type flexible pour accepter SpatialCoordinates
    semanticRole: string;
}

/**
 * Interface compatible avec les services d'analyse spatiale
 */
export interface ServiceCompatibleZone {
    id: string;
    name: string;
    coordinates: {
        x: [number, number];
        y: [number, number];
        z: [number, number];
    };
    semanticRole: "object" | "subject" | "temporal" | "modal" | "discourse";
    established: boolean;
    consistency: number;
    usage_frequency: number;
}

/**
 * Utilitaires de conversion intégrés
 */
class LocalSpatialTypeUtils {
    /**
     * Convertit les données du système spatial vers une zone standardisée
     */
    public static fromSpatialSystemData(
        zoneId: string,
        zoneData: SpatialSystemZoneData
    ): StandardLSFReferentialZone {
        // Conversion flexible des coordonnées
        let coordinates: [number, number] = [0, 0];

        if (Array.isArray(zoneData.coordinates)) {
            coordinates = [
                Number(zoneData.coordinates[0]) || 0,
                Number(zoneData.coordinates[1]) || 0
            ];
        } else if (typeof zoneData.coordinates === 'object' && zoneData.coordinates !== null) {
            const coords = zoneData.coordinates as Record<string, unknown>;
            coordinates = [
                Number(coords.x) || Number(coords[0]) || 0,
                Number(coords.y) || Number(coords[1]) || 0
            ];
        }

        return {
            id: zoneId,
            name: zoneData.name,
            coordinates,
            semanticRole: zoneData.semanticRole,
            established: false,
            consistency: 1.0,
            usage_frequency: 0
        };
    }

    /**
     * Convertit une zone standardisée vers le format compatible avec les services
     */
    public static toServiceCompatible(zone: StandardLSFReferentialZone): ServiceCompatibleZone {
        // Conversion du rôle sémantique vers les valeurs acceptées
        const validRoles: Array<"object" | "subject" | "temporal" | "modal" | "discourse"> =
            ["object", "subject", "temporal", "modal", "discourse"];

        const semanticRole = validRoles.includes(zone.semanticRole as "object" | "subject" | "temporal" | "modal" | "discourse")
            ? zone.semanticRole as "object" | "subject" | "temporal" | "modal" | "discourse"
            : "object"; // Valeur par défaut

        return {
            id: zone.id,
            name: zone.name,
            coordinates: {
                x: [zone.coordinates[0], zone.coordinates[1]],
                y: [zone.coordinates[0], zone.coordinates[1]],
                z: [0, 0] // Coordonnée Z par défaut
            },
            semanticRole,
            established: zone.established,
            consistency: zone.consistency,
            usage_frequency: zone.usage_frequency
        };
    }

    /**
     * Validation d'une zone standardisée
     */
    public static isValidStandardZone(zone: unknown): zone is StandardLSFReferentialZone {
        if (!zone || typeof zone !== 'object') {
            return false;
        }

        const z = zone as Record<string, unknown>;
        return (
            typeof z.id === 'string' &&
            typeof z.name === 'string' &&
            Array.isArray(z.coordinates) &&
            z.coordinates.length === 2 &&
            typeof z.coordinates[0] === 'number' &&
            typeof z.coordinates[1] === 'number' &&
            typeof z.semanticRole === 'string' &&
            typeof z.established === 'boolean' &&
            typeof z.consistency === 'number' &&
            typeof z.usage_frequency === 'number'
        );
    }

    /**
     * Clonage profond d'une zone standardisée
     */
    public static cloneStandardZone(zone: StandardLSFReferentialZone): StandardLSFReferentialZone {
        return {
            id: zone.id,
            name: zone.name,
            coordinates: [...zone.coordinates] as [number, number],
            semanticRole: zone.semanticRole,
            established: zone.established,
            consistency: zone.consistency,
            usage_frequency: zone.usage_frequency
        };
    }

    /**
     * Création d'une zone par défaut
     */
    public static createDefaultZone(id: string, name: string): StandardLSFReferentialZone {
        return {
            id,
            name,
            coordinates: [0, 0],
            semanticRole: 'neutral',
            established: false,
            consistency: 1.0,
            usage_frequency: 0
        };
    }
}

/**
 * Historique des actions sur les zones
 */
export interface ZoneHistoryEntry {
    timestamp: number;
    action: string;
    zone: string;
    coordinates?: { x: number; y: number; z: number };
}

/**
 * Gestionnaire des zones référentielles spatiales
 * 
 * Centralise la gestion des zones actives, leur historique et les conversions
 * nécessaires pour l'intégration avec les différents services
 */
export class ZoneManager {
    private readonly activeZones: Map<string, StandardLSFReferentialZone>;
    private readonly spatialHistory: ZoneHistoryEntry[];
    private readonly maxHistorySize: number = 100;

    constructor() {
        this.activeZones = new Map();
        this.spatialHistory = [];
        this.initializeCanonicalZones();
    }

    /**
     * Initialise les zones canoniques du système spatial LSF
     * @private
     */
    private initializeCanonicalZones(): void {
        Object.entries(LSF_SPATIAL_SYSTEM.canonical_zones).forEach(([zoneId, zoneData]) => {
            const zone = LocalSpatialTypeUtils.fromSpatialSystemData(zoneId, zoneData);
            this.activeZones.set(zoneId, zone);
        });
    }

    /**
     * Obtient une zone par son ID
     * @param zoneId - Identifiant de la zone
     * @returns Zone ou undefined si non trouvée
     */
    public getZone(zoneId: string): StandardLSFReferentialZone | undefined {
        return this.activeZones.get(zoneId);
    }

    /**
     * Obtient toutes les zones actives
     * @returns Tableau des zones actives (readonly)
     */
    public getAllZones(): readonly StandardLSFReferentialZone[] {
        return Array.from(this.activeZones.values());
    }

    /**
     * Obtient une copie de la Map des zones actives
     * @returns Map des zones actives (copie)
     */
    public getActiveZonesMap(): Map<string, StandardLSFReferentialZone> {
        const zonesMap = new Map<string, StandardLSFReferentialZone>();

        for (const [id, zone] of this.activeZones) {
            zonesMap.set(id, LocalSpatialTypeUtils.cloneStandardZone(zone));
        }

        return zonesMap;
    }

    /**
     * Obtient les zones au format compatible avec les services
     * @returns Map des zones compatibles avec les services
     */
    public getServiceCompatibleZones(): Map<string, ServiceCompatibleZone> {
        const serviceZones = new Map<string, ServiceCompatibleZone>();

        for (const [id, zone] of this.activeZones) {
            serviceZones.set(id, LocalSpatialTypeUtils.toServiceCompatible(zone));
        }

        return serviceZones;
    }

    /**
     * Ajoute une zone personnalisée
     * @param zone - Zone à ajouter
     * @returns True si ajoutée avec succès
     */
    public addCustomZone(zone: StandardLSFReferentialZone): boolean {
        if (!LocalSpatialTypeUtils.isValidStandardZone(zone)) {
            return false;
        }

        this.activeZones.set(zone.id, LocalSpatialTypeUtils.cloneStandardZone(zone));
        this.addToHistory('zone_added', zone.id);

        return true;
    }

    /**
     * Supprime une zone
     * @param zoneId - ID de la zone à supprimer
     * @returns True si supprimée avec succès
     */
    public removeZone(zoneId: string): boolean {
        const removed = this.activeZones.delete(zoneId);

        if (removed) {
            this.addToHistory('zone_removed', zoneId);
        }

        return removed;
    }

    /**
     * Met à jour la consistance d'une zone
     * @param zoneId - ID de la zone
     * @param consistency - Nouvelle valeur de consistance (0-1)
     * @returns True si mise à jour réussie
     */
    public updateZoneConsistency(zoneId: string, consistency: number): boolean {
        const zone = this.activeZones.get(zoneId);

        if (!zone || consistency < 0 || consistency > 1) {
            return false;
        }

        zone.consistency = consistency;
        this.addToHistory('consistency_updated', zoneId);

        return true;
    }

    /**
     * Met à jour la fréquence d'usage d'une zone
     * @param zoneId - ID de la zone
     * @param increment - Incrément à ajouter à la fréquence
     * @returns True si mise à jour réussie
     */
    public updateZoneUsageFrequency(zoneId: string, increment: number = 1): boolean {
        const zone = this.activeZones.get(zoneId);

        if (!zone) {
            return false;
        }

        zone.usage_frequency = Math.max(0, zone.usage_frequency + increment);
        this.addToHistory('usage_updated', zoneId);

        return true;
    }

    /**
     * Établit une zone comme référence active
     * @param zoneId - ID de la zone
     * @returns True si établie avec succès
     */
    public establishZone(zoneId: string): boolean {
        const zone = this.activeZones.get(zoneId);

        if (!zone) {
            return false;
        }

        zone.established = true;
        this.addToHistory('zone_established', zoneId);

        return true;
    }

    /**
     * Réinitialise toutes les zones
     */
    public resetAllZones(): void {
        this.activeZones.clear();
        this.spatialHistory.length = 0;
        this.initializeCanonicalZones();
        this.addToHistory('zones_reset', 'all');
    }

    /**
     * Obtient le nombre de zones actives
     * @returns Nombre de zones
     */
    public getZoneCount(): number {
        return this.activeZones.size;
    }

    /**
     * Obtient l'historique spatial
     * @returns Copie de l'historique
     */
    public getHistory(): readonly ZoneHistoryEntry[] {
        return [...this.spatialHistory];
    }

    /**
     * Obtient les statistiques des zones
     * @returns Statistiques détaillées
     */
    public getZoneStatistics() {
        const zones = Array.from(this.activeZones.values());

        return {
            totalZones: zones.length,
            establishedZones: zones.filter(z => z.established).length,
            averageConsistency: zones.reduce((sum, z) => sum + z.consistency, 0) / zones.length || 0,
            totalUsage: zones.reduce((sum, z) => sum + z.usage_frequency, 0),
            mostUsedZone: zones.reduce((max, z) =>
                z.usage_frequency > max.usage_frequency ? z : max,
                zones[0] || LocalSpatialTypeUtils.createDefaultZone('', '')
            ),
            historySize: this.spatialHistory.length
        };
    }

    /**
     * Filtre les zones selon des critères
     * @param criteria - Critères de filtrage
     * @returns Zones filtrées
     */
    public filterZones(criteria: {
        established?: boolean;
        minConsistency?: number;
        minUsage?: number;
        semanticRole?: string;
    }): StandardLSFReferentialZone[] {
        return Array.from(this.activeZones.values()).filter(zone => {
            if (criteria.established !== undefined && zone.established !== criteria.established) {
                return false;
            }

            if (criteria.minConsistency !== undefined && zone.consistency < criteria.minConsistency) {
                return false;
            }

            if (criteria.minUsage !== undefined && zone.usage_frequency < criteria.minUsage) {
                return false;
            }

            if (criteria.semanticRole !== undefined && zone.semanticRole !== criteria.semanticRole) {
                return false;
            }

            return true;
        });
    }

    /**
     * Applique une transformation de consistance à plusieurs zones
     * @param zoneIds - IDs des zones à modifier
     * @param consistencyReduction - Réduction de consistance à appliquer
     * @returns Nombre de zones modifiées
     */
    public applyConsistencyReduction(zoneIds: string[], consistencyReduction: number): number {
        let modifiedCount = 0;

        for (const zoneId of zoneIds) {
            const zone = this.activeZones.get(zoneId);
            if (zone) {
                zone.consistency = Math.max(0.1, zone.consistency - consistencyReduction);
                modifiedCount++;
            }
        }

        if (modifiedCount > 0) {
            this.addToHistory('bulk_consistency_reduction', `${modifiedCount}_zones`);
        }

        return modifiedCount;
    }

    /**
     * Ajoute une entrée à l'historique
     * @param action - Action effectuée
     * @param zone - Zone concernée
     * @param coordinates - Coordonnées optionnelles
     * @private
     */
    private addToHistory(action: string, zone: string, coordinates?: { x: number; y: number; z: number }): void {
        this.spatialHistory.push({
            timestamp: Date.now(),
            action,
            zone,
            coordinates: coordinates || { x: 0, y: 0, z: 0 }
        });

        // Limite la taille de l'historique
        if (this.spatialHistory.length > this.maxHistorySize) {
            this.spatialHistory.shift();
        }
    }
}