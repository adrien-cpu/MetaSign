// src/ai/specialized/spatial/core/SigningSpace.ts

import { ISigningSpace } from './interfaces/ISigningSpace';
import {
    Area3D,
    CulturalContext,
    Point3D,
    ReferenceZone,
    ReferenceZoneType,
    SigningSpaceConfig,
    Vector3D
} from '../types';

/**
 * Implémentation de l'espace de signation LSF
 * Représente l'espace 3D dans lequel les signes sont effectués
 */
export class SigningSpace implements ISigningSpace {
    /**
     * Zone principale de l'espace de signation
     */
    public mainArea: Area3D;

    /**
     * Facteur d'échelle de l'espace
     */
    public scale: number;

    /**
     * Orientation de l'espace
     */
    public orientation: Vector3D;

    /**
     * Point d'origine (référence)
     */
    public origin: Point3D;

    /**
     * Zones actives dans l'espace
     */
    public activeZones: Map<string, ReferenceZone>;

    /**
     * Constructeur
     * @param initialConfig Configuration initiale optionnelle
     */
    constructor(initialConfig?: SigningSpaceConfig) {
        // Configuration par défaut
        this.mainArea = {
            center: { x: 0, y: 0, z: 0 },
            dimensions: { width: 2, height: 2, depth: 1.5 }
        };
        this.scale = 1;
        this.orientation = { x: 0, y: 0, z: 1 };
        this.origin = { x: 0, y: 0, z: 0 };
        this.activeZones = new Map<string, ReferenceZone>();

        // Appliquer la configuration initiale si fournie
        if (initialConfig) {
            this.configure(initialConfig);
        }
    }

    /**
     * Initialise l'espace de signation pour un contexte culturel spécifique
     * @param context Contexte culturel
     */
    public async initialize(context: CulturalContext): Promise<void> {
        // Réinitialiser l'espace
        this.reset();

        // Adapter l'espace au contexte culturel
        const config = this.createConfigFromContext(context);
        this.configure(config);

        // Initialiser les zones de base
        await this.initializeBaseZones(context);
    }

    /**
     * Configure l'espace de signation avec de nouveaux paramètres
     * @param config Configuration à appliquer
     */
    public configure(config: SigningSpaceConfig): void {
        // Appliquer les paramètres fournis
        if (config.scale !== undefined) this.scale = config.scale;
        if (config.orientation) this.orientation = { ...config.orientation };
        if (config.origin) this.origin = { ...config.origin };

        if (config.size) {
            this.mainArea = {
                center: { ...this.mainArea.center },
                dimensions: {
                    width: config.size.width,
                    height: config.size.height,
                    depth: config.size.depth
                }
            };
        }
    }

    /**
     * Ajoute une zone à l'espace de signation
     * @param zone Zone à ajouter
     * @returns Vrai si la zone a été ajoutée avec succès
     */
    public addZone(zone: ReferenceZone): boolean {
        if (this.activeZones.has(zone.id)) {
            return false; // Zone déjà présente
        }

        this.activeZones.set(zone.id, { ...zone });
        return true;
    }

    /**
     * Supprime une zone de l'espace de signation
     * @param zoneId Identifiant de la zone à supprimer
     * @returns Vrai si la zone a été supprimée avec succès
     */
    public removeZone(zoneId: string): boolean {
        return this.activeZones.delete(zoneId);
    }

    /**
     * Récupère une zone par son identifiant
     * @param zoneId Identifiant de la zone
     * @returns Zone trouvée ou undefined
     */
    public getZone(zoneId: string): ReferenceZone | undefined {
        return this.activeZones.get(zoneId);
    }

    /**
     * Transforme un point du monde réel en coordonnées de l'espace de signation
     * @param point Point du monde réel
     * @returns Point dans l'espace de signation
     */
    public transformToSpace(point: Point3D): Point3D {
        // Application de la translation (origine)
        const translated = {
            x: point.x - this.origin.x,
            y: point.y - this.origin.y,
            z: point.z - this.origin.z
        };

        // Application de l'échelle
        return {
            x: translated.x / this.scale,
            y: translated.y / this.scale,
            z: translated.z / this.scale
        };
    }

    /**
     * Transforme un point de l'espace de signation en coordonnées du monde réel
     * @param point Point dans l'espace de signation
     * @returns Point dans le monde réel
     */
    public transformFromSpace(point: Point3D): Point3D {
        // Application de l'échelle
        const scaled = {
            x: point.x * this.scale,
            y: point.y * this.scale,
            z: point.z * this.scale
        };

        // Application de la translation (origine)
        return {
            x: scaled.x + this.origin.x,
            y: scaled.y + this.origin.y,
            z: scaled.z + this.origin.z
        };
    }

    /**
     * Crée un clone de l'espace de signation actuel
     * @returns Nouvelle instance avec les mêmes propriétés
     */
    public clone(): ISigningSpace {
        const clone = new SigningSpace();

        // Copier les propriétés
        clone.mainArea = {
            center: { ...this.mainArea.center },
            dimensions: { ...this.mainArea.dimensions }
        };
        clone.scale = this.scale;
        clone.orientation = { ...this.orientation };
        clone.origin = { ...this.origin };

        // Copier les zones actives
        this.activeZones.forEach((zone, id) => {
            clone.activeZones.set(id, { ...zone });
        });

        return clone;
    }

    /**
     * Réinitialise l'espace de signation à son état par défaut
     */
    public reset(): void {
        this.mainArea = {
            center: { x: 0, y: 0, z: 0 },
            dimensions: { width: 2, height: 2, depth: 1.5 }
        };
        this.scale = 1;
        this.orientation = { x: 0, y: 0, z: 1 };
        this.origin = { x: 0, y: 0, z: 0 };
        this.activeZones.clear();
    }

    /**
     * Crée une configuration d'espace à partir d'un contexte culturel
     * @param context Contexte culturel
     * @returns Configuration adaptée
     */
    private createConfigFromContext(context: CulturalContext): SigningSpaceConfig {
        // Adaptation selon le contexte régional
        const regionalFactor = context.region === 'france' ? 1.0 : 0.9;

        // Adaptation selon le niveau de formalité
        const formalityFactor = context.formalityLevel ? 1 + (context.formalityLevel * 0.2) : 1;

        // Configuration adaptée
        return {
            scale: regionalFactor * formalityFactor,
            orientation: { x: 0, y: 0, z: 1 },
            origin: { x: 0, y: 0, z: 0 },
            size: {
                width: 2 * regionalFactor,
                height: 2 * formalityFactor,
                depth: 1.5 * regionalFactor
            },
            culturalSettings: context.regionalPreferences || {}
        };
    }

    /**
     * Initialise les zones de base de l'espace de signation
     * @param context Contexte culturel
     */
    private async initializeBaseZones(context: CulturalContext): Promise<void> {
        // Zone neutre centrale
        const neutralZone: ReferenceZone = {
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
        };

        this.addZone(neutralZone);

        // Autres zones de base peuvent être ajoutées selon le contexte
        if (context.context === 'formal') {
            // Ajouter des zones spécifiques au contexte formel
            const formalZone: ReferenceZone = {
                id: 'formal-space',
                name: 'Espace formel',
                type: ReferenceZoneType.ABSTRACT,
                area: {
                    center: { x: 0, y: 0.3, z: 0.3 },
                    dimensions: { width: 0.6, height: 0.6, depth: 0.4 }
                },
                significance: 0.7,
                priority: 3,
                metadata: {
                    formalityLevel: 'high'
                }
            };

            this.addZone(formalZone);
        }
    }
}