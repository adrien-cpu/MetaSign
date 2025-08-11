/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/types/LSFSpaceTypes.ts
 * @description Types spécifiques pour les paramètres spatiaux LSF
 * @author MetaSign
 * @version 2.0.0
 * @since 2024
 * 
 * Ce module définit les types TypeScript pour les paramètres spatiaux
 * utilisés dans les simulations d'erreur spatiale LSF.
 * 
 * @module LSFSpaceTypes
 */

/**
 * Paramètres spatiaux LSF avec indicateurs d'erreur
 * Extension du type de base pour inclure les flags d'erreur spécifiques
 */
export interface LSFSpaceParameter {
    /** Précision spatiale (0-1) */
    accuracy?: number;

    /** Indicateur de référence ambiguë */
    ambiguousReference?: boolean;

    /** Zones ambiguës identifiées */
    ambiguousZones?: readonly string[];

    /** Consistance référentielle */
    referenceConsistency?: boolean;

    /** Type d'incohérence détectée */
    inconsistencyType?: string;

    /** Zones affectées par l'incohérence */
    affectedZones?: readonly string[];

    /** Indicateur d'omission de référence */
    referenceOmission?: boolean;

    /** Références omises */
    omittedReferences?: readonly string[];

    /** Indicateur de confusion pronominale */
    pronounConfusion?: boolean;

    /** Pattern de confusion utilisé */
    confusionPattern?: string;

    /** Pronoms affectés par la confusion */
    affectedPronouns?: readonly string[];

    /** Indicateur de réorganisation spatiale */
    spatialReorganization?: boolean;

    /** Organisation spatiale originale */
    originalOrganization?: {
        readonly type: string;
        readonly zones: readonly string[];
        readonly coherence_score: number;
        readonly complexity_level: string;
    };

    /** Nouvelle organisation spatiale */
    newOrganization?: {
        readonly type: string;
        readonly affected_zones: readonly string[];
        readonly changes: readonly {
            readonly zone_id: string;
            readonly old_position: { x: number; y: number; z: number };
            readonly new_position: { x: number; y: number; z: number };
        }[];
        readonly expected_impact: number;
    };

    /** Indicateur d'erreur générique */
    genericError?: boolean;

    /** Sévérité de l'erreur générique */
    errorSeverity?: number;

    /** Position spatiale principale */
    position?: {
        x: number;
        y: number;
        z: number;
    };

    /** Zone de référence principale */
    referenceZone?: string;

    /** Niveau de complexité spatiale */
    complexityLevel?: 'simple' | 'moderate' | 'complex' | 'expert';

    /** Charge cognitive associée */
    cognitiveLoad?: number;

    /** Métadonnées additionnelles */
    metadata?: Record<string, unknown>;
}