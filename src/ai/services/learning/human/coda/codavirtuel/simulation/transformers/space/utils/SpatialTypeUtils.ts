/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/space/utils/SpatialTypeUtils.ts
 * @description Utilitaires de conversion de types pour les références spatiales
 * @author MetaSign
 * @version 1.0.0
 * @since 2025-05-29
 */

/**
 * Interface standardisée pour les zones référentielles spatiales
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
export interface SpatialSystemZoneData {
    name: string;
    coordinates: readonly [number, number];
    semanticRole: string;
}

/**
 * Interface compatible avec les services d'analyse spatiale
 */
export interface ServiceCompatibleZone {
    id: string;
    name: string;
    coordinates: {
        x: readonly [number, number];
        y: readonly [number, number];
    };
    semanticRole: string;
    established: boolean;
    consistency: number;
    usage_frequency: number;
}

/**
 * Utilitaires de conversion de types pour les références spatiales
 */
export class SpatialTypeUtils {
    /**
     * Convertit les données du système spatial vers une zone standardisée
     */
    public static fromSpatialSystemData(
        zoneId: string,
        zoneData: SpatialSystemZoneData
    ): StandardLSFReferentialZone {
        return {
            id: zoneId,
            name: zoneData.name,
            coordinates: [...zoneData.coordinates] as [number, number],
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
        return {
            id: zone.id,
            name: zone.name,
            coordinates: {
                x: zone.coordinates as readonly [number, number],
                y: zone.coordinates as readonly [number, number]
            },
            semanticRole: zone.semanticRole,
            established: zone.established,
            consistency: zone.consistency,
            usage_frequency: zone.usage_frequency
        };
    }

    /**
     * Convertit une Map de zones standardisées vers une Map compatible avec les services
     */
    public static convertZonesMapToServiceCompatible(
        zones: Map<string, StandardLSFReferentialZone>
    ): Map<string, ServiceCompatibleZone> {
        const serviceZones = new Map<string, ServiceCompatibleZone>();

        for (const [id, zone] of zones) {
            serviceZones.set(id, this.toServiceCompatible(zone));
        }

        return serviceZones;
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