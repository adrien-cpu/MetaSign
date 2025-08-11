/**
 * @file src/ai/services/learning/interfaces/LSFContentInterfaces.ts
 * @description Interfaces spécialisées pour le contenu d'apprentissage LSF.
 * Contient les définitions des modules, badges, ressources et contenus multimédia.
 * Compatible avec exactOptionalPropertyTypes: true
 * @module LSFContentInterfaces
 * @version 3.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * @example
 * ```typescript
 * import type { 
 *   LSFLearningModule, 
 *   LSFBadge, 
 *   LSFVocabularyEntry 
 * } from './LSFContentInterfaces';
 * ```
 */

import type { ModuleCategory, ModuleStatus, CompetencyLevel } from './CoreLearningInterfaces';

/**
 * Module d'apprentissage spécialisé pour la LSF
 * Étend le concept de base avec des spécificités linguistiques
 */
export interface LSFLearningModule {
    /** Identifiant unique du module LSF */
    readonly id: string;
    /** Titre du module en français et LSF */
    readonly title: {
        readonly french: string;
        /** Représentation textuelle ou gloss LSF (optionnel) */
        readonly lsf?: string;
    };
    /** Description détaillée du module */
    readonly description: string;
    /** Catégorie spécialisée LSF */
    readonly category: ModuleCategory;
    /** Niveau de difficulté LSF (1-10) */
    readonly difficulty: number;
    /** Prérequis LSF nécessaires */
    readonly prerequisites: readonly string[];
    /** Statut actuel du module */
    readonly status: ModuleStatus;
    /** Progression actuelle (0-100) */
    readonly progress: number;
    /** Temps estimé d'apprentissage (minutes) */
    readonly estimatedTime: number;
    /** Compétences LSF développées */
    readonly skills: readonly string[];
    /** Niveau CECRL équivalent si applicable (optionnel) */
    readonly cecrLevel?: CompetencyLevel;
    /** Contenu spécialisé LSF */
    readonly content: LSFModuleContent;
}

/**
 * Contenu spécialisé d'un module LSF
 */
export interface LSFModuleContent {
    /** Sections théoriques et pratiques */
    readonly sections: readonly LSFModuleSection[];
    /** Quiz de compréhension LSF */
    readonly quizzes: readonly string[];
    /** Exercices pratiques de signation */
    readonly exercises: readonly string[];
    /** Ressources vidéo et multimédia */
    readonly resources: readonly LSFResource[];
    /** Dictionnaire de signes associé (optionnel) */
    readonly vocabulary?: readonly LSFVocabularyEntry[];
}

/**
 * Section d'un module LSF avec contenu multimodal
 */
export interface LSFModuleSection {
    /** Identifiant de la section */
    readonly id: string;
    /** Titre en français */
    readonly title: string;
    /** Contenu textuel */
    readonly content: string;
    /** Ordre dans le module */
    readonly order: number;
    /** Type de section LSF */
    readonly sectionType: 'theory' | 'practice' | 'assessment' | 'culture';
    /** Vidéos associées (optionnel) */
    readonly videos?: {
        /** URL de la vidéo principale (optionnel) */
        readonly mainVideo?: string;
        /** URL de la vidéo avec sous-titres (optionnel) */
        readonly subtitledVideo?: string;
        /** URL de la vidéo ralentie pour apprentissage (optionnel) */
        readonly slowMotionVideo?: string;
    };
    /** Exercices interactifs intégrés (optionnel) */
    readonly interactiveElements?: readonly {
        /** Type d'élément interactif */
        readonly type: 'sign_recognition' | 'gesture_practice' | 'translation';
        /** Configuration de l'élément */
        readonly config: Readonly<Record<string, unknown>>;
    }[];
}

/**
 * Ressource multimédia pour l'apprentissage LSF
 */
export interface LSFResource {
    /** Identifiant de la ressource */
    readonly id: string;
    /** Titre de la ressource */
    readonly title: string;
    /** Type de ressource */
    readonly type: 'video' | 'image' | 'dictionary' | 'grammar_guide' | 'cultural_note';
    /** URL de la ressource */
    readonly url: string;
    /** Description du contenu (optionnel) */
    readonly description?: string;
    /** Durée (pour les vidéos, en secondes) (optionnel) */
    readonly duration?: number;
    /** Niveau de difficulté (optionnel) */
    readonly difficulty?: number;
    /** Métadonnées spécifiques LSF (optionnel) */
    readonly metadata?: {
        /** Signataire dans la vidéo (optionnel) */
        readonly signer?: string;
        /** Dialecte ou variation régionale (optionnel) */
        readonly dialect?: string;
        /** Vitesse de signation (optionnel) */
        readonly signingSpeed?: 'slow' | 'normal' | 'fast';
    };
}

/**
 * Entrée de vocabulaire LSF
 */
export interface LSFVocabularyEntry {
    /** Identifiant unique du signe */
    readonly id: string;
    /** Mot en français */
    readonly frenchWord: string;
    /** Gloss LSF (représentation textuelle) */
    readonly lsfGloss: string;
    /** Catégorie grammaticale */
    readonly category: 'nom' | 'verbe' | 'adjectif' | 'adverbe' | 'expression' | 'classificateur';
    /** Description de la forme */
    readonly description: string;
    /** Paramètres du signe */
    readonly parameters: {
        /** Configuration manuelle */
        readonly handshape: string;
        /** Lieu d'articulation */
        readonly location: string;
        /** Mouvement */
        readonly movement: string;
        /** Orientation */
        readonly orientation: string;
        /** Expressions non-manuelles (optionnel) */
        readonly nonManualMarkers?: readonly string[];
    };
    /** Niveau de difficulté */
    readonly difficulty: number;
    /** Fréquence d'usage */
    readonly frequency: 'rare' | 'common' | 'frequent' | 'essential';
}

/**
 * Badge de récompense spécialisé LSF
 */
export interface LSFBadge {
    /** Identifiant unique du badge */
    readonly id: string;
    /** Titre du badge en français */
    readonly title: string;
    /** Titre en LSF (gloss) (optionnel) */
    readonly titleLSF?: string;
    /** Description du badge */
    readonly description: string;
    /** URL de l'image du badge */
    readonly imageUrl: string;
    /** Critères d'obtention spécifiques LSF */
    readonly criteria: {
        /** Type de critère */
        readonly type: 'modules_completed' | 'skills_mastered' | 'streak_days' | 'quiz_performance';
        /** Valeur requise */
        readonly value: number;
        /** Compétences LSF spécifiques (optionnel) */
        readonly lsfSkills?: readonly string[];
    };
    /** Niveau de difficulté */
    readonly difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
    /** Catégorie spécialisée LSF */
    readonly category: 'progression' | 'completion' | 'excellence' | 'consistency' | 'culture_sourde';
    /** Points d'expérience attribués */
    readonly experiencePoints: number;
}

/**
 * Métadonnées pour le contenu LSF
 */
export interface LSFContentMetadata {
    /** Identifiant du contenu */
    readonly contentId: string;
    /** Type de contenu */
    readonly contentType: 'video' | 'image' | 'text' | 'interactive' | 'quiz' | 'exercise';
    /** Langue principale */
    readonly primaryLanguage: 'LSF' | 'French' | 'Bilingual';
    /** Qualité de la vidéo (optionnel) */
    readonly videoQuality?: '720p' | '1080p' | '4K';
    /** Présence de sous-titres */
    readonly hasSubtitles: boolean;
    /** Présence d'interprétation */
    readonly hasInterpretation: boolean;
    /** Accessibilité */
    readonly accessibility: {
        /** Compatible lecteur d'écran */
        readonly screenReaderCompatible: boolean;
        /** Contraste élevé disponible */
        readonly highContrastAvailable: boolean;
        /** Navigation clavier */
        readonly keyboardNavigable: boolean;
    };
    /** Métadonnées techniques */
    readonly technical: {
        /** Taille du fichier (MB) (optionnel) */
        readonly fileSize?: number;
        /** Format du fichier (optionnel) */
        readonly format?: string;
        /** Résolution (optionnel) */
        readonly resolution?: string;
        /** Frame rate (pour vidéos) (optionnel) */
        readonly frameRate?: number;
    };
}

/**
 * Assurance qualité pour le contenu LSF
 */
export interface LSFQualityAssurance {
    /** Identifiant du contenu évalué */
    readonly contentId: string;
    /** Date d'évaluation */
    readonly evaluationDate: Date;
    /** Évaluateur */
    readonly evaluator: {
        /** Identifiant */
        readonly id: string;
        /** Nom */
        readonly name: string;
        /** Qualifications */
        readonly qualifications: readonly string[];
    };
    /** Critères d'évaluation */
    readonly criteria: {
        /** Précision linguistique LSF */
        readonly linguisticAccuracy: number;
        /** Clarté gestuelle */
        readonly gestureClarity: number;
        /** Qualité technique */
        readonly technicalQuality: number;
        /** Accessibilité */
        readonly accessibility: number;
        /** Pertinence pédagogique */
        readonly pedagogicalRelevance: number;
    };
    /** Score global */
    readonly overallScore: number;
    /** Statut de validation */
    readonly validationStatus: 'pending' | 'approved' | 'rejected' | 'needs_revision';
    /** Commentaires */
    readonly comments: string;
    /** Actions recommandées */
    readonly recommendedActions: readonly string[];
}