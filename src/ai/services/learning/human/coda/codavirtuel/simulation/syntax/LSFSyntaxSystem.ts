/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/syntax/LSFSyntaxSystem.ts
 * @description Système syntaxique révolutionnaire pour la LSF
 * @author MetaSign
 * @version 2.0.0
 * @since 2024
 * 
 * Ce module définit le système complet de patterns syntaxiques en LSF,
 * incluant les structures de base, complexes et les interférences françaises.
 * 
 * @module LSFSyntaxSystem
 */

/**
 * Interface pour un pattern syntaxique LSF
 */
export interface LSFSyntaxPattern {
    readonly name: string;
    readonly description: string;
    readonly structure: readonly string[];
    readonly difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    readonly commonErrors: readonly string[];
    readonly frequency: number;
}

/**
 * Configuration des structures de base LSF
 */
export interface BasicSyntaxPatterns {
    readonly sov: LSFSyntaxPattern;
    readonly osv: LSFSyntaxPattern;
    readonly vs: LSFSyntaxPattern;
}

/**
 * Configuration des structures complexes LSF
 */
export interface ComplexSyntaxPatterns {
    readonly temporal_marking: LSFSyntaxPattern;
    readonly spatial_reference: LSFSyntaxPattern;
    readonly classifier_construction: LSFSyntaxPattern;
}

/**
 * Configuration des interférences françaises
 */
export interface FrenchInterferencePatterns {
    readonly svo_structure: LSFSyntaxPattern;
    readonly auxiliary_verbs: LSFSyntaxPattern;
    readonly article_insertion: LSFSyntaxPattern;
}

/**
 * Système complet de patterns syntaxiques LSF
 */
export interface LSFSyntaxSystemConfig {
    readonly basic: BasicSyntaxPatterns;
    readonly complex: ComplexSyntaxPatterns;
    readonly french_interference: FrenchInterferencePatterns;
}

/**
 * Patterns syntaxiques révolutionnaires de la LSF
 * Basés sur la recherche linguistique contemporaine
 */
export const LSF_SYNTAX_PATTERNS: LSFSyntaxSystemConfig = {
    // Structures de base LSF
    basic: {
        sov: {
            name: 'SOV (Sujet-Objet-Verbe)',
            description: 'Structure canonique LSF',
            structure: ['SUJET', 'OBJET', 'VERBE'],
            difficulty: 'beginner',
            commonErrors: ['french_interference', 'verb_fronting'],
            frequency: 0.7
        },
        osv: {
            name: 'OSV (Objet-Sujet-Verbe)',
            description: 'Topicalisation de l\'objet',
            structure: ['OBJET', 'SUJET', 'VERBE'],
            difficulty: 'intermediate',
            commonErrors: ['missing_topicalization_markers'],
            frequency: 0.15
        },
        vs: {
            name: 'VS (Verbe-Sujet)',
            description: 'Structure intransitive',
            structure: ['VERBE', 'SUJET'],
            difficulty: 'beginner',
            commonErrors: ['unnecessary_object_insertion'],
            frequency: 0.1
        }
    },

    // Structures complexes
    complex: {
        temporal_marking: {
            name: 'Marquage temporel',
            description: 'Structures avec marqueurs temporels',
            structure: ['TEMPS', 'SUJET', 'OBJET', 'VERBE'],
            difficulty: 'intermediate',
            commonErrors: ['temporal_marker_position', 'missing_temporal_reference'],
            frequency: 0.3
        },
        spatial_reference: {
            name: 'Référence spatiale',
            description: 'Utilisation de l\'espace syntaxique',
            structure: ['ETABLISSEMENT_REFERENCE', 'REFERENCE_ANAPHORIQUE'],
            difficulty: 'advanced',
            commonErrors: ['inconsistent_spatial_reference', 'missing_establishment'],
            frequency: 0.25
        },
        classifier_construction: {
            name: 'Construction classificatoire',
            description: 'Structures avec classificateurs',
            structure: ['SUJET', 'CLASSIFICATEUR', 'MOUVEMENT'],
            difficulty: 'expert',
            commonErrors: ['inappropriate_classifier', 'movement_inconsistency'],
            frequency: 0.2
        }
    },

    // Interférences françaises typiques
    french_interference: {
        svo_structure: {
            name: 'Structure SVO française',
            description: 'Calque de l\'ordre français',
            structure: ['SUJET', 'VERBE', 'OBJET'],
            difficulty: 'beginner',
            commonErrors: ['direct_translation', 'missing_lsf_syntax'],
            frequency: 0.6
        },
        auxiliary_verbs: {
            name: 'Verbes auxiliaires français',
            description: 'Insertion d\'auxiliaires inexistants en LSF',
            structure: ['SUJET', 'AUXILIAIRE', 'VERBE_PRINCIPAL'],
            difficulty: 'intermediate',
            commonErrors: ['unnecessary_auxiliary', 'modal_confusion'],
            frequency: 0.3
        },
        article_insertion: {
            name: 'Insertion d\'articles',
            description: 'Ajout d\'articles inexistants en LSF',
            structure: ['ARTICLE', 'NOM'],
            difficulty: 'beginner',
            commonErrors: ['determiner_insertion', 'gender_marking'],
            frequency: 0.4
        }
    }
} as const;