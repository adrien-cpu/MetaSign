import {
    DialectVariant,
    DialectVariation,
    SubstitutionRule,
    GestureFrame
} from '../types';

/**
 * Interface pour la cartographie des dialectes
 * Responsable de la gestion des variations régionales des signes LSF
 */
export interface IDialectMapper {
    /**
     * Récupère toutes les variantes dialectales pour une région
     * @param region Code de région
     * @returns Map des variantes par identifiant de signe
     */
    getRegionalVariant(region: string): Promise<Map<string, DialectVariant>>;

    /**
     * Récupère les règles de substitution pour une région
     * @param region Code de région
     * @returns Liste des règles de substitution
     */
    getRules(region: string): Promise<SubstitutionRule[]>;

    /**
     * Récupère une variante dialectale spécifique
     * @param signId Identifiant du signe
     * @param region Code régional
     * @returns Variante régionale ou null si non trouvée
     */
    getRegionalVariant(signId: string, region: string): Promise<Record<string, unknown> | null>;

    /**
     * Ajoute une variante dialectale à la cartographie
     * @param signId Identifiant du signe
     * @param region Code régional
     * @param variant Données de la variante
     */
    addRegionalVariant(signId: string, region: string, variant: Record<string, unknown>): Promise<void>;

    /**
     * Recherche les relations entre variantes dialectales
     * @param signId Identifiant du signe
     * @returns Carte des relations entre variantes régionales
     */
    getVariantRelationships(signId: string): Promise<Map<string, Set<string>>>;

    /**
     * Obtient tous les codes régionaux pour lesquels il existe des variantes d'un signe
     * @param signId Identifiant du signe
     * @returns Ensemble des codes régionaux disponibles
     */
    getAvailableRegions(signId: string): Promise<Set<string>>;

    /**
     * Détecte automatiquement la région d'origine d'un signant
     * @param gestureFrames Séquence de gestes à analyser
     * @returns Code régional détecté ou 'standard' si non déterminé
     */
    detectRegionalOrigin(gestureFrames: GestureFrame[]): Promise<string>;

    /**
     * Substitue un signe par sa variante régionale appropriée
     * @param signId Identifiant du signe
     * @param sourceRegion Région source
     * @param targetRegion Région cible
     * @returns Variante substituée ou null si non trouvée
     */
    substituteVariant(
        signId: string,
        sourceRegion: string,
        targetRegion: string
    ): Promise<Record<string, unknown> | null>;

    /**
     * Vérifie l'existence d'une variante pour un signe et une région
     * @param signId Identifiant du signe
     * @param region Code régional
     * @returns true si une variante existe
     */
    hasRegionalVariant(signId: string, region: string): Promise<boolean>;

    /**
     * Crée des variations dialectales pour une séquence d'expressions
     * @param signIds Liste d'identifiants de signes
     * @param sourceRegion Région source
     * @param targetRegion Région cible
     * @returns Informations sur les variations dialectales
     */
    createDialectVariations(
        signIds: string[],
        sourceRegion: string,
        targetRegion: string
    ): Promise<DialectVariation>;

    /**
     * Récupère les métriques de performance du module
     * @returns Métriques de performance
     */
    getPerformanceMetrics(): Record<string, number>;
}