/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/catalogs/ErrorCatalog.ts
 * @description Catalogue des erreurs typiques en LSF pour la simulation
 * * Ce fichier contient les définitions des erreurs par catégorie, avec des transformations possibles
 * et des descriptions par défaut.
 * @module ErrorCatalog
 * @requires ../types
 * @requires ../types/ErrorCategoryType
 * @requires ../types/ErrorCatalogType
 * @requires ../types/ErrorTransformationType
 * @since 2024
 * @version 1.0.0
 * @author MetaSign Team
 */

import { ErrorCategoryType, ErrorCatalogType, ErrorTransformationType } from '../types';

/**
 * Catalogue des erreurs typiques par catégorie pour la simulation des erreurs LSF
 */
export const ERROR_CATALOG: ErrorCatalogType = {
    // Erreurs de configuration des mains (forme incorrecte)
    [ErrorCategoryType.HAND_CONFIGURATION]: {
        transformations: [
            { from: 'main_plate', to: 'main_relachee', probability: 0.6 },
            { from: 'index_tendu', to: 'deux_doigts_tendus', probability: 0.4 },
            { from: 'poing_ferme', to: 'poing_semi_ouvert', probability: 0.5 },
            { from: 'main_en_griffe', to: 'main_en_coupe', probability: 0.3 },
            { from: 'pouce_tendu', to: 'pouce_plie', probability: 0.4 }
        ],
        defaultTransformation: { severity: 0.3, description: 'Configuration de main imprécise' }
    },

    // Erreurs d'emplacement (mauvais positionnement du signe)
    [ErrorCategoryType.LOCATION]: {
        transformations: [
            { from: 'joue', to: 'menton', probability: 0.3 },
            { from: 'front', to: 'tempe', probability: 0.4 },
            { from: 'poitrine', to: 'poitrine_decalee', probability: 0.5 },
            { from: 'epaule', to: 'cou', probability: 0.4 },
            { from: 'espace_neutre', to: 'espace_neutre_decale', probability: 0.6 }
        ],
        defaultTransformation: { severity: 0.25, description: 'Emplacement du signe incorrectment positionné' }
    },

    // Erreurs de mouvement (amplitude, direction, répétition incorrectes)
    [ErrorCategoryType.MOVEMENT]: {
        transformations: [
            { type: ErrorTransformationType.AMPLITUDE, factor: 0.7, probability: 0.5 }, // Amplitude réduite
            { type: ErrorTransformationType.AMPLITUDE, factor: 1.3, probability: 0.3 }, // Amplitude exagérée
            { type: ErrorTransformationType.DIRECTION, degrees: 15, probability: 0.4 }, // Déviation angulaire
            { type: ErrorTransformationType.REPETITION, factor: 0.5, probability: 0.3 }, // Répétition manquante
            { type: ErrorTransformationType.REPETITION, factor: 2, probability: 0.2 }   // Répétition excessive
        ],
        defaultTransformation: { severity: 0.3, description: 'Mouvement incorrect' }
    },

    // Erreurs d'orientation (orientation de la paume incorrecte)
    [ErrorCategoryType.ORIENTATION]: {
        transformations: [
            { rotation: 'x', degrees: 45, probability: 0.4 },
            { rotation: 'y', degrees: 45, probability: 0.4 },
            { rotation: 'z', degrees: 45, probability: 0.4 },
            { from: 'paume_vers_soi', to: 'paume_vers_bas', probability: 0.3 },
            { from: 'paume_vers_interlocuteur', to: 'paume_vers_cote', probability: 0.3 }
        ],
        defaultTransformation: { severity: 0.2, description: 'Orientation de la main incorrecte' }
    },

    // Erreurs d'expressions faciales (expressions manquantes ou incorrectes)
    [ErrorCategoryType.FACIAL_EXPRESSION]: {
        transformations: [
            { type: ErrorTransformationType.INTENSITY, factor: 0.5, probability: 0.6 }, // Expression atténuée
            { type: ErrorTransformationType.OMISSION, probability: 0.4 },               // Expression omise
            { type: ErrorTransformationType.SUBSTITUTION, probability: 0.3 },           // Expression incorrecte
            { type: ErrorTransformationType.DESYNCHRONIZATION, offset: 0.3, probability: 0.4 }, // Expression désynchronisée
            { from: 'joie', to: 'neutre', probability: 0.3 }
        ],
        defaultTransformation: { severity: 0.35, description: 'Expression faciale incorrecte' }
    },

    // Erreurs de rythme (cadence, timing incorrect)
    [ErrorCategoryType.RHYTHM]: {
        transformations: [
            { type: ErrorTransformationType.ACCELERATION, factor: 1.3, probability: 0.4 }, // Trop rapide
            { type: ErrorTransformationType.DECELERATION, factor: 0.7, probability: 0.5 }, // Trop lent
            { type: ErrorTransformationType.INAPPROPRIATE_PAUSE, probability: 0.3 },       // Pauses au mauvais moment
            { type: ErrorTransformationType.HESITATION, probability: 0.5 },                // Hésitations
            { type: ErrorTransformationType.FLUIDITY, factor: 0.6, probability: 0.4 }      // Manque de fluidité
        ],
        defaultTransformation: { severity: 0.25, description: 'Rythme inapproprié' }
    },

    // Erreurs d'utilisation de l'espace syntaxique (mauvaise gestion de l'espace)
    [ErrorCategoryType.SYNTACTIC_SPACE]: {
        transformations: [
            { type: ErrorTransformationType.ZONE_CONFUSION, probability: 0.5 },         // Confusion entre zones
            { type: ErrorTransformationType.REFERENCE_VIOLATION, probability: 0.6 },    // Non-respect des références
            { type: ErrorTransformationType.REDUCED_SPACE, factor: 0.7, probability: 0.4 }, // Espace de signation réduit
            { type: ErrorTransformationType.RANDOM_PLACEMENT, probability: 0.3 },       // Placement aléatoire
            { type: ErrorTransformationType.LOCATION_OMISSION, probability: 0.4 }       // Oubli de localisation
        ],
        defaultTransformation: { severity: 0.4, description: 'Utilisation incorrecte de l\'espace syntaxique' }
    },

    // Erreurs d'ordre des signes (syntaxe incorrecte)
    [ErrorCategoryType.SIGN_ORDER]: {
        transformations: [
            { type: ErrorTransformationType.INVERSION, probability: 0.5 },               // Inversion de l'ordre
            { type: ErrorTransformationType.OMISSION, probability: 0.4 },                // Omission d'éléments
            { type: ErrorTransformationType.SUPERFLUOUS_ADDITION, probability: 0.3 },    // Ajout d'éléments superflus
            { type: ErrorTransformationType.UNNECESSARY_REPETITION, probability: 0.2 },  // Répétition inutile
            { type: ErrorTransformationType.FRENCH_STRUCTURE, probability: 0.6 }         // Structure calquée sur le français
        ],
        defaultTransformation: { severity: 0.4, description: 'Ordre des signes incorrect' }
    },

    // Erreurs de références spatiales (références ambiguës ou incohérentes)
    [ErrorCategoryType.SPATIAL_REFERENCE]: {
        transformations: [
            { type: ErrorTransformationType.AMBIGUOUS_REFERENCE, probability: 0.6 },        // Référence ambiguë
            { type: ErrorTransformationType.INCONSISTENT_REFERENCE, probability: 0.5 },     // Incohérence des références
            { type: ErrorTransformationType.REFERENCE_OMISSION, probability: 0.4 },         // Oubli de référence
            { type: ErrorTransformationType.PRONOUN_CONFUSION, probability: 0.5 },          // Confusion des pronoms
            { type: ErrorTransformationType.SPATIAL_REORGANIZATION, probability: 0.3 }      // Réorganisation spatiale inadéquate
        ],
        defaultTransformation: { severity: 0.45, description: 'Références spatiales problématiques' }
    },

    // Erreurs de proformes (mauvaise utilisation des classificateurs)
    [ErrorCategoryType.PROFORME]: {
        transformations: [
            { type: ErrorTransformationType.INAPPROPRIATE_PROFORME, probability: 0.6 },     // Proforme inapproprié
            { type: ErrorTransformationType.PROFORME_CONFUSION, probability: 0.5 },         // Confusion entre proformes
            { type: ErrorTransformationType.EXCESSIVE_SIMPLIFICATION, probability: 0.4 },   // Simplification excessive
            { type: ErrorTransformationType.PROFORME_OMISSION, probability: 0.3 },          // Omission de proforme
            { type: ErrorTransformationType.INCONSISTENT_USAGE, probability: 0.5 }          // Inconsistance dans l'usage
        ],
        defaultTransformation: { severity: 0.5, description: 'Utilisation incorrecte des proformes' }
    }
};