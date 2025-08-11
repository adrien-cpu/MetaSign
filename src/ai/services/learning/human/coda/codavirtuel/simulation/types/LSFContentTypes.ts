/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/types/LSFContentTypes.ts
 * @description Types pour les contenus LSF utilisés dans le simulateur d'erreurs
 * @author MetaSign
 * @version 1.1.0
 */

// Import du type AppliedError correctement référencé
import { AppliedError } from './ErrorTypes';

/**
 * Interface représentant un paramètre de base en LSF
 */
export interface LSFBaseParameter {
    accuracy?: number;
}

/**
 * Interface pour la configuration de main en LSF
 */
export interface LSFHandshapeParameter extends LSFBaseParameter {
    type?: string;
}

/**
 * Interface pour l'emplacement en LSF
 */
export interface LSFLocationParameter extends LSFBaseParameter {
    type?: string;
    position?: number[];
}

/**
 * Interface pour la direction en LSF
 */
export interface LSFDirectionParameter {
    deviation?: number;
}

/**
 * Interface pour le mouvement en LSF
 */
export interface LSFMovementParameter extends LSFBaseParameter {
    amplitude?: number;
    distance?: number;
    direction?: LSFDirectionParameter;
    repetitions?: number;
}

/**
 * Interface pour l'orientation en LSF
 */
export interface LSFOrientationParameter extends LSFBaseParameter {
    type?: string;
    angles?: {
        x?: number;
        y?: number;
        z?: number;
        [key: string]: number | undefined;
    };
}

/**
 * Interface pour l'expression faciale en LSF
 */
export interface LSFFacialParameter extends LSFBaseParameter {
    expression?: string;
    intensity?: number;
    active?: boolean;
    timing?: {
        offset?: number;
    };
}

/**
 * Interface pour les expressions non manuelles en LSF
 */
export interface LSFNonManualParameter {
    facial?: LSFFacialParameter;
}

/**
 * Interface pour le timing en LSF
 */
export interface LSFTimingParameter extends LSFBaseParameter {
    speed?: number;
    duration?: number;
    inappropriatePauses?: boolean;
    hesitations?: boolean;
    fluidity?: number;
}

/**
 * Interface pour l'espace en LSF
 */
export interface LSFSpaceParameter extends LSFBaseParameter {
    zoneConfusion?: boolean;
    referenceConsistency?: boolean;
    scale?: number;
    randomPlacement?: boolean;
    locationOmission?: boolean;
    ambiguousReference?: boolean;
    referenceOmission?: boolean;
    pronounConfusion?: boolean;
    spatialReorganization?: boolean;
}

/**
 * Interface pour les classificateurs (proformes) en LSF
 */
export interface LSFClassifiersParameter extends LSFBaseParameter {
    inappropriate?: boolean;
    confusion?: boolean;
    oversimplified?: boolean;
    omission?: boolean;
    inconsistentUsage?: boolean;
}

/**
 * Interface pour les paramètres globaux en LSF
 */
export interface LSFParameters {
    handshape?: LSFHandshapeParameter;
    location?: LSFLocationParameter;
    movement?: LSFMovementParameter;
    orientation?: LSFOrientationParameter;
    nonManual?: LSFNonManualParameter;
    timing?: LSFTimingParameter;
    space?: LSFSpaceParameter;
    classifiers?: LSFClassifiersParameter;
}

/**
 * Interface pour un signe LSF dans une séquence
 */
export interface LSFSign {
    id?: string;
    parameters?: LSFParameters;
    // Autres propriétés spécifiques aux signes
    [key: string]: unknown;
}

/**
 * Interface pour le contenu LSF (peut être une chaîne ou un objet complexe)
 */
export type LSFContent = string | {
    id?: string;
    type?: string;
    exerciseParams?: Record<string, unknown>;
    conceptId?: string;
    parameters?: LSFParameters;
    sequence?: LSFSign[];
    syntaxAccuracy?: number;
    syntaxError?: string;
    frenchStructure?: boolean;
    appliedErrors?: AppliedError[];
    [key: string]: unknown;
};

/**
 * Interface pour un échange dans un dialogue
 */
export interface LSFExchange {
    speaker: string;
    content: LSFContent;
}

/**
 * Interface pour un dialogue LSF
 */
export interface LSFDialogue {
    id?: string;
    title?: string;
    exchanges: LSFExchange[];
    [key: string]: unknown;
}

/**
 * Interface pour un exercice LSF
 */
export interface LSFExercise {
    id?: string;
    type: string;
    title?: string;
    content: LSFContent | LSFContent[];
    instructions?: LSFContent;
    options?: LSFContent[];
    [key: string]: unknown;
}

/**
 * Interface pour un scénario d'apprentissage LSF
 */
export interface LSFScenario {
    id?: string;
    title?: string;
    avatarProficiency?: {
        errorRate: number;
        errorTypes: string[];
    };
    exercises?: LSFExercise[];
    dialogues?: LSFDialogue[];
    demonstrations?: LSFContent[];
    [key: string]: unknown;
}