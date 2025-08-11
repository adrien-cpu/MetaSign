/**
 * Registre de proformes pour la LSF
 * Gère la collection de proformes disponibles et leur contextualisation
 * 
 * @file src/ai/specialized/spatial/core/ProformeRegistry.ts
 */

import { IProformeRegistry } from './interfaces/IProformeRegistry';
import {
    CulturalContext,
    Proforme,
    HandshapeConfig,
    Point3D,
    FingerConfig
} from '../types';

/**
 * Registre de proformes pour la LSF
 * Gère la collection de proformes disponibles et leur contextualisation
 */
export class ProformeRegistry implements IProformeRegistry {
    /**
     * Collection de proformes par identifiant
     */
    private proformes: Map<string, Proforme>;

    /**
     * Indique les proformes actives pour le contexte actuel
     */
    private activeProformeIds: Set<string>;

    /**
     * Registre des proformes par concept représenté
     */
    private conceptIndex: Map<string, Set<string>>;

    /**
     * Constructeur
     */
    constructor() {
        this.proformes = new Map<string, Proforme>();
        this.activeProformeIds = new Set<string>();
        this.conceptIndex = new Map<string, Set<string>>();

        // Initialiser avec les proformes de base
        this.initializeBaseProformes();
    }

    /**
     * Prépare les proformes appropriées pour un contexte culturel donné
     * @param context Contexte culturel
     */
    public async prepareForContext(context: CulturalContext): Promise<void> {
        // Réinitialiser les proformes actives
        this.activeProformeIds.clear();

        // Charger les proformes spécifiques à la région
        const regionalProformes = await this.loadRegionalProformes(context.region);

        // Activer les proformes de base
        const baseProformeIds = Array.from(this.proformes.keys()).filter(id =>
            id.startsWith('base-')
        );

        for (const id of baseProformeIds) {
            this.activeProformeIds.add(id);
        }

        // Activer les proformes régionales
        for (const proforme of regionalProformes) {
            // Ajouter si elle n'existe pas déjà
            if (!this.proformes.has(proforme.id)) {
                this.addProforme(proforme);
            }

            this.activeProformeIds.add(proforme.id);
        }

        // Adapter les proformes au niveau de formalité
        if (context.formalityLevel !== undefined) {
            this.adaptProformalityLevel(context.formalityLevel);
        }
    }

    /**
     * Récupère toutes les proformes actives
     * @returns Tableau des proformes actives
     */
    public getActiveProformes(): Proforme[] {
        return Array.from(this.activeProformeIds)
            .map(id => this.proformes.get(id))
            .filter((p): p is Proforme => p !== undefined);
    }

    /**
     * Récupère une proforme par son identifiant
     * @param id Identifiant de la proforme
     * @returns Proforme trouvée ou undefined
     */
    public getProforme(id: string): Proforme | undefined {
        return this.proformes.get(id);
    }

    /**
     * Récupère les proformes par concept représenté
     * @param concept Concept représenté
     * @returns Tableau des proformes correspondantes
     */
    public getProformesByRepresentation(concept: string): Proforme[] {
        const conceptLower = concept.toLowerCase();
        const proformeIds = this.conceptIndex.get(conceptLower) || new Set<string>();

        return Array.from(proformeIds)
            .map(id => this.proformes.get(id))
            .filter((p): p is Proforme => p !== undefined)
            // Filtrer pour ne retourner que les proformes actives
            .filter(p => this.activeProformeIds.has(p.id));
    }

    /**
     * Ajoute une proforme au registre
     * @param proforme Proforme à ajouter
     * @returns Vrai si la proforme a été ajoutée avec succès
     */
    public addProforme(proforme: Proforme): boolean {
        // Vérifier si la proforme existe déjà
        if (this.proformes.has(proforme.id)) {
            return false;
        }

        // Ajouter la proforme
        this.proformes.set(proforme.id, { ...proforme });

        // Indexer par concept
        const conceptLower = proforme.represents.toLowerCase();
        if (!this.conceptIndex.has(conceptLower)) {
            this.conceptIndex.set(conceptLower, new Set<string>());
        }
        this.conceptIndex.get(conceptLower)!.add(proforme.id);

        return true;
    }

    /**
     * Supprime une proforme du registre
     * @param id Identifiant de la proforme à supprimer
     * @returns Vrai si la proforme a été supprimée avec succès
     */
    public removeProforme(id: string): boolean {
        // Vérifier si la proforme existe
        const proforme = this.proformes.get(id);
        if (!proforme) {
            return false;
        }

        // Supprimer de l'index des concepts
        const conceptLower = proforme.represents.toLowerCase();
        const conceptSet = this.conceptIndex.get(conceptLower);
        if (conceptSet) {
            conceptSet.delete(id);
            if (conceptSet.size === 0) {
                this.conceptIndex.delete(conceptLower);
            }
        }

        // Supprimer des proformes actives
        this.activeProformeIds.delete(id);

        // Supprimer la proforme
        return this.proformes.delete(id);
    }

    /**
     * Réinitialise le registre
     */
    public reset(): void {
        this.proformes.clear();
        this.activeProformeIds.clear();
        this.conceptIndex.clear();

        // Réinitialiser avec les proformes de base
        this.initializeBaseProformes();
    }

    /**
     * Initialise les proformes de base
     */
    private initializeBaseProformes(): void {
        // Proforme d'index pointeur
        const indexPointingProforme: Proforme = {
            id: 'base-index-pointing',
            name: 'Index pointeur',
            handshape: {
                type: 'index-pointing',
                fingers: [
                    { finger: 'index', bend: 0, spread: 0 },
                    { finger: 'middle', bend: 1, spread: 0 },
                    { finger: 'ring', bend: 1, spread: 0 },
                    { finger: 'pinky', bend: 1, spread: 0 },
                    { finger: 'thumb', bend: 0.5, spread: 0.5 }
                ],
                tension: 0.7
            },
            represents: 'pointing-reference',
            associatedConcepts: ['pointing', 'reference', 'direction'],
            properties: {}
        };

        // Proforme de main plate
        const flatHandProforme: Proforme = {
            id: 'base-flat-hand',
            name: 'Main plate',
            handshape: {
                type: 'flat-hand',
                fingers: [
                    { finger: 'index', bend: 0, spread: 0 },
                    { finger: 'middle', bend: 0, spread: 0 },
                    { finger: 'ring', bend: 0, spread: 0 },
                    { finger: 'pinky', bend: 0, spread: 0 },
                    { finger: 'thumb', bend: 0, spread: 1 }
                ],
                tension: 0.5
            },
            represents: 'surface',
            associatedConcepts: ['surface', 'plan', 'plat'],
            properties: {}
        };

        // Proforme en "C"
        const cHandshapeProforme: Proforme = {
            id: 'base-c-handshape',
            name: 'Configuration en C',
            handshape: {
                type: 'c-handshape',
                fingers: [
                    { finger: 'index', bend: 0.5, spread: 0 },
                    { finger: 'middle', bend: 0.5, spread: 0 },
                    { finger: 'ring', bend: 0.5, spread: 0 },
                    { finger: 'pinky', bend: 0.5, spread: 0 },
                    { finger: 'thumb', bend: 0.5, spread: 0.8 }
                ],
                tension: 0.6
            },
            represents: 'cylindrical-object',
            associatedConcepts: ['cylindre', 'objet rond', 'cercle'],
            properties: {}
        };

        // Ajouter les proformes de base
        this.addProforme(indexPointingProforme);
        this.addProforme(flatHandProforme);
        this.addProforme(cHandshapeProforme);

        // Activer les proformes de base
        this.activeProformeIds.add(indexPointingProforme.id);
        this.activeProformeIds.add(flatHandProforme.id);
        this.activeProformeIds.add(cHandshapeProforme.id);
    }

    /**
     * Charge les proformes spécifiques à une région
     * @param region Région culturelle
     * @returns Proformes spécifiques à la région
     */
    private async loadRegionalProformes(region: string): Promise<Proforme[]> {
        // Dans une implémentation réelle, chargement depuis une base de données
        // Pour cet exemple, nous créons des proformes spécifiques à la région

        if (region === 'france') {
            return [
                {
                    id: 'region-france-vehicle',
                    name: 'Véhicule (France)',
                    handshape: this.createBasicHandshape('vehicle-handshape'),
                    represents: 'vehicle',
                    associatedConcepts: ['véhicule', 'transport', 'voiture'],
                    culturalContext: ['france'],
                    properties: {}
                },
                {
                    id: 'region-france-person',
                    name: 'Personne (France)',
                    handshape: this.createBasicHandshape('person-handshape'),
                    represents: 'person',
                    associatedConcepts: ['personne', 'individu', 'humain'],
                    culturalContext: ['france'],
                    properties: {}
                }
            ];
        } else if (region === 'quebec') {
            return [
                {
                    id: 'region-quebec-vehicle',
                    name: 'Véhicule (Québec)',
                    handshape: this.createBasicHandshape('vehicle-handshape-quebec'),
                    represents: 'vehicle',
                    associatedConcepts: ['véhicule', 'transport', 'voiture'],
                    culturalContext: ['quebec'],
                    properties: {}
                }
            ];
        } else {
            // Pour d'autres régions, retourner un tableau vide
            return [];
        }
    }

    /**
     * Crée une configuration de main basique
     * @param type Type de configuration
     * @returns Configuration de main
     */
    private createBasicHandshape(type: string): HandshapeConfig {
        const basicFingers: FingerConfig[] = [
            { finger: 'index', bend: 0, spread: 0 },
            { finger: 'middle', bend: 0, spread: 0 },
            { finger: 'ring', bend: 0, spread: 0 },
            { finger: 'pinky', bend: 0, spread: 0 },
            { finger: 'thumb', bend: 0, spread: 0 }
        ];

        return {
            type,
            fingers: basicFingers,
            tension: 0.5
        };
    }

    /**
     * Adapte les proformes au niveau de formalité
     * @param formalityLevel Niveau de formalité (0-1)
     */
    private adaptProformalityLevel(formalityLevel: number): void {
        // Pour chaque proforme active, ajuster la tension et potentiellement d'autres paramètres
        for (const id of this.activeProformeIds) {
            const proforme = this.proformes.get(id);
            if (proforme && proforme.handshape) {
                // Dans un contexte formel, la tension est généralement plus élevée
                proforme.handshape.tension = 0.5 + (formalityLevel * 0.3);

                // Si une position est définie, ajuster légèrement
                if (proforme.position) {
                    // Les signes formels ont tendance à être légèrement plus hauts et plus proches du corps
                    proforme.position = this.adjustPositionForFormality(proforme.position, formalityLevel);
                } else if (proforme.defaultPosition) {
                    // Utiliser defaultPosition si position n'est pas définie
                    proforme.position = this.adjustPositionForFormality(proforme.defaultPosition, formalityLevel);
                }

                // Note: L'orientation dans Proforme est de type {palm, fingers}
                // et non un vecteur 3D, donc nous ne la modifions pas ici
                // Si besoin d'ajuster l'orientation, il faudrait adapter la logique au type utilisé
            }
        }
    }

    /**
     * Ajuste la position d'une proforme selon le niveau de formalité
     * @param position Position d'origine
     * @param formalityLevel Niveau de formalité
     * @returns Position ajustée
     */
    private adjustPositionForFormality(position: Point3D, formalityLevel: number): Point3D {
        // Calculer le facteur d'ajustement (plus le niveau de formalité est élevé, plus l'ajustement est important)
        const adjustmentFactor = formalityLevel * 0.2;

        // Dans un contexte formel, les signes tendent à être plus hauts et plus près du corps
        return {
            x: position.x * (1 - adjustmentFactor), // Rapprocher du corps (vers 0)
            y: position.y + adjustmentFactor * 0.1, // Légèrement plus haut
            z: position.z - adjustmentFactor * 0.05  // Légèrement plus près du corps
        };
    }

    /**
     * Méthode protégée pour accéder aux IDs des proformes actives
     * Cette méthode est utilisée par les tests pour accéder aux IDs actifs
     * sans violer l'encapsulation
     * 
     * @returns Ensemble des IDs de proformes actives
     */
    protected getActiveProformeIds(): Set<string> {
        return this.activeProformeIds;
    }

    /**
     * Méthode protégée pour activer une proforme spécifique
     * Cette méthode est utilisée par les tests pour activer des proformes
     * sans violer l'encapsulation
     * 
     * @param id ID de la proforme à activer
     */
    protected activateProforme(id: string): void {
        // Vérifier que la proforme existe avant de l'activer
        if (this.proformes.has(id)) {
            this.activeProformeIds.add(id);
        }
    }

    /**
     * Méthode protégée pour adapter les proformes au niveau de formalité
     * Cette méthode est utilisée par les tests pour simuler l'adaptation
     * sans violer l'encapsulation
     * 
     * @param level Niveau de formalité (0-1)
     */
    protected adaptProformesToFormalityLevel(level: number): void {
        this.adaptProformalityLevel(level);
    }
}