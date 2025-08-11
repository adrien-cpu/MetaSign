/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/classifiers/LSFClassifierSystem.ts
 * @description Système de classification des proformes (classificateurs) en LSF
 * @author MetaSign
 * @version 1.1.0
 * @since 2024
 * 
 * Ce module définit le système complet de classification des proformes en LSF,
 * incluant les types de classificateurs, leurs usages appropriés, les erreurs communes
 * et les règles de sélection.
 * 
 * @module LSFClassifierSystem
 */

/**
 * Configuration d'un classificateur spécifique
 */
export interface ClassifierConfig {
    /** Description du classificateur */
    readonly description: string;
    /** Configuration de la main pour ce classificateur */
    readonly handConfig: string;
    /** Objets appropriés pour ce classificateur */
    readonly appropriateFor: readonly string[];
    /** Erreurs communes avec ce classificateur */
    readonly commonMistakes: readonly string[];
}

/**
 * Catégorie de classificateurs par type
 */
export interface ClassifierCategory {
    readonly [key: string]: ClassifierConfig;
}

/**
 * Définition d'une erreur commune
 */
export interface CommonMistake {
    /** Description de l'erreur */
    readonly description: string;
    /** Exemples concrets */
    readonly examples: readonly string[];
}

/**
 * Règles de sélection des classificateurs
 */
export interface SelectionRules {
    /** Critère principal de sélection */
    readonly primary_criterion: string;
    /** Critères secondaires */
    readonly secondary_criteria: readonly string[];
    /** Facteurs contextuels */
    readonly context_factors: readonly string[];
}

/**
 * Niveaux de difficulté des classificateurs
 */
export interface DifficultyLevels {
    readonly beginner: readonly string[];
    readonly intermediate: readonly string[];
    readonly advanced: readonly string[];
}

/**
 * Contextes d'usage spécialisés
 */
export interface SpecializedContexts {
    readonly [context: string]: readonly string[];
}

/**
 * Système complet de classification des proformes LSF
 */
export interface LSFClassifierSystemConfig {
    readonly classifierTypes: {
        readonly shape: ClassifierCategory;
        readonly movement: ClassifierCategory;
        readonly handling: ClassifierCategory;
    };
    readonly commonMistakes: Record<string, CommonMistake>;
    readonly selectionRules: SelectionRules;
    readonly difficulty: DifficultyLevels;
    readonly specializedContexts: SpecializedContexts;
}

/**
 * Système de classification des proformes LSF
 * Définit les différents types de classificateurs et leurs usages appropriés
 */
export const LSF_CLASSIFIER_SYSTEM: LSFClassifierSystemConfig = {
    // Types de classificateurs par catégorie d'objets
    classifierTypes: {
        // Classificateurs pour objets selon leur forme
        shape: {
            flat_surface: {
                description: 'Surface plate (table, livre, écran)',
                handConfig: 'main_plate',
                appropriateFor: ['table', 'livre', 'ecran', 'feuille', 'panneau'],
                commonMistakes: ['cylindrical', 'spherical']
            },
            cylindrical: {
                description: 'Objet cylindrique (bouteille, tube, poteau)',
                handConfig: 'c',
                appropriateFor: ['bouteille', 'tube', 'poteau', 'tuyau', 'cylindre'],
                commonMistakes: ['flat_surface', 'thin_object']
            },
            spherical: {
                description: 'Objet sphérique (balle, pomme, tête)',
                handConfig: 'cupped_hands',
                appropriateFor: ['balle', 'pomme', 'orange', 'tete', 'ballon'],
                commonMistakes: ['cylindrical', 'small_round']
            },
            thin_object: {
                description: 'Objet fin (crayon, baguette, fil)',
                handConfig: 'index_majeur',
                appropriateFor: ['crayon', 'baguette', 'fil', 'cable', 'tige'],
                commonMistakes: ['cylindrical', 'flat_surface']
            },
            small_round: {
                description: 'Petit objet rond (pièce, bouton, pilule)',
                handConfig: 'pince',
                appropriateFor: ['piece', 'bouton', 'pilule', 'perle', 'graine'],
                commonMistakes: ['spherical', 'thin_object']
            }
        },

        // Classificateurs pour le mouvement d'objets
        movement: {
            vehicle: {
                description: 'Véhicule en mouvement (voiture, avion)',
                handConfig: 'vehicule_cl',
                appropriateFor: ['voiture', 'avion', 'bateau', 'train', 'velo'],
                commonMistakes: ['person_walking', 'animal_moving']
            },
            person_walking: {
                description: 'Personne qui marche (bipède)',
                handConfig: 'index_majeur_marche',
                appropriateFor: ['personne', 'marcheur', 'coureur', 'danseur'],
                commonMistakes: ['vehicle', 'animal_moving']
            },
            animal_moving: {
                description: 'Animal en mouvement (quadrupède)',
                handConfig: 'main_courbee',
                appropriateFor: ['chien', 'chat', 'cheval', 'elephant', 'souris'],
                commonMistakes: ['person_walking', 'vehicle']
            },
            liquid_flow: {
                description: 'Écoulement de liquide',
                handConfig: 'doigts_ondules',
                appropriateFor: ['eau', 'lait', 'huile', 'sang', 'pluie'],
                commonMistakes: ['falling_object', 'flexible_object']
            }
        },

        // Classificateurs pour la manipulation d'objets
        handling: {
            holding_small: {
                description: 'Tenir un petit objet',
                handConfig: 'pince',
                appropriateFor: ['cle', 'piece', 'bijou', 'medicament'],
                commonMistakes: ['holding_large', 'holding_thin']
            },
            holding_large: {
                description: 'Tenir un gros objet',
                handConfig: 'mains_courbees',
                appropriateFor: ['ballon', 'carton', 'oreiller', 'sac'],
                commonMistakes: ['holding_small', 'holding_container']
            },
            holding_thin: {
                description: 'Tenir un objet fin',
                handConfig: 'index_pouce',
                appropriateFor: ['papier', 'carte', 'photo', 'billet'],
                commonMistakes: ['holding_small', 'holding_large']
            },
            holding_container: {
                description: 'Tenir un contenant',
                handConfig: 'c_shape',
                appropriateFor: ['verre', 'tasse', 'bol', 'pot'],
                commonMistakes: ['holding_large', 'holding_cylindrical']
            }
        }
    },

    // Erreurs communes par type d'objet
    commonMistakes: {
        size_mismatch: {
            description: 'Classificateur inadapté à la taille',
            examples: ['petit objet avec classificateur large', 'gros objet avec classificateur fin']
        },
        shape_confusion: {
            description: 'Confusion entre formes similaires',
            examples: ['cylindre vs sphère', 'plat vs fin', 'rond vs carré']
        },
        context_inappropriate: {
            description: 'Classificateur inapproprié au contexte',
            examples: ['classificateur de mouvement pour objet statique', 'mauvaise catégorie d\'objet']
        },
        oversimplification: {
            description: 'Simplification excessive de la forme',
            examples: ['objet complexe réduit à forme simple', 'perte de détails importants']
        },
        inconsistent_usage: {
            description: 'Usage inconsistant dans le même contexte',
            examples: ['changement de classificateur pour même objet', 'mélange de conventions']
        }
    },

    // Règles de sélection de classificateur
    selectionRules: {
        primary_criterion: 'shape',
        secondary_criteria: ['size', 'texture', 'function', 'movement'],
        context_factors: ['cultural_convention', 'speaker_perspective', 'emphasis']
    },

    // Niveaux de difficulté pour les classificateurs
    difficulty: {
        beginner: ['flat_surface', 'spherical', 'holding_large'],
        intermediate: ['cylindrical', 'thin_object', 'person_walking', 'holding_container'],
        advanced: ['small_round', 'liquid_flow', 'animal_moving', 'holding_thin']
    },

    // Contextes d'usage spécialisés
    specializedContexts: {
        spatial_description: ['flat_surface', 'cylindrical', 'spherical'],
        narrative_action: ['person_walking', 'vehicle', 'animal_moving'],
        object_manipulation: ['holding_small', 'holding_large', 'holding_thin'],
        quantity_description: ['small_round', 'thin_object', 'liquid_flow']
    }
} as const;