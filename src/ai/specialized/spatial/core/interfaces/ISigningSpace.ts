// src/ai/specialized/spatial/core/interfaces/ISigningSpace.ts

import {
    Area3D,
    CulturalContext,
    Point3D,
    ReferenceZone,
    SigningSpaceConfig,
    Vector3D
} from '../../types';

/**
 * Interface pour l'espace de signation LSF
 * Représente l'espace 3D dans lequel les signes sont effectués
 */
export interface ISigningSpace {
    /**
     * Zone principale de l'espace de signation
     */
    readonly mainArea: Area3D;

    /**
     * Facteur d'échelle de l'espace
     */
    readonly scale: number;

    /**
     * Orientation de l'espace
     */
    readonly orientation: Vector3D;

    /**
     * Point d'origine (référence)
     */
    readonly origin: Point3D;

    /**
     * Zones actives dans l'espace
     */
    readonly activeZones: Map<string, ReferenceZone>;

    /**
     * Initialise l'espace de signation pour un contexte culturel spécifique
     * @param context Contexte culturel
     */
    initialize(context: CulturalContext): Promise<void>;

    /**
     * Configure l'espace de signation avec de nouveaux paramètres
     * @param config Configuration à appliquer
     */
    configure(config: SigningSpaceConfig): void;

    /**
     * Ajoute une zone à l'espace de signation
     * @param zone Zone à ajouter
     * @returns Vrai si la zone a été ajoutée avec succès
     */
    addZone(zone: ReferenceZone): boolean;

    /**
     * Supprime une zone de l'espace de signation
     * @param zoneId Identifiant de la zone à supprimer
     * @returns Vrai si la zone a été supprimée avec succès
     */
    removeZone(zoneId: string): boolean;

    /**
     * Récupère une zone par son identifiant
     * @param zoneId Identifiant de la zone
     * @returns Zone trouvée ou undefined
     */
    getZone(zoneId: string): ReferenceZone | undefined;

    /**
     * Transforme un point du monde réel en coordonnées de l'espace de signation
     * @param point Point du monde réel
     * @returns Point dans l'espace de signation
     */
    transformToSpace(point: Point3D): Point3D;

    /**
     * Transforme un point de l'espace de signation en coordonnées du monde réel
     * @param point Point dans l'espace de signation
     * @returns Point dans le monde réel
     */
    transformFromSpace(point: Point3D): Point3D;

    /**
     * Crée un clone de l'espace de signation actuel
     * @returns Nouvelle instance avec les mêmes propriétés
     */
    clone(): ISigningSpace;

    /**
     * Réinitialise l'espace de signation à son état par défaut
     */
    reset(): void;
}