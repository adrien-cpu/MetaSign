/**
 * @file src/ai/services/learning/human/coda/codavirtuel/types/LSFBaseTypes.ts
 * @description Types de base manquants pour le système CODA révolutionnaire
 * 
 * Contient les types fondamentaux :
 * - 📚 Niveaux CECRL pour LSF
 * - 🎭 Humeurs et états émotionnels IA
 * - 📝 Sessions d'enseignement et apprentissage
 * - 🔄 États et transitions
 * 
 * @module LSFBaseTypes
 * @version 1.0.0
 * @since 2025
 * @author MetaSign Team - CODA Revolutionary Edition
 */

// ==================== NIVEAUX CECRL POUR LSF ====================

/**
 * Niveaux du Cadre Européen Commun de Référence pour les Langues adaptés à la LSF
 */
export type CECRLLevel =
    | 'A1'    // Débutant - découverte de la LSF
    | 'A2'    // Élémentaire - survie en LSF
    | 'B1'    // Intermédiaire - seuil en LSF  
    | 'B2'    // Intermédiaire avancé - indépendance en LSF
    | 'C1'    // Autonome - maîtrise efficace en LSF
    | 'C2';   // Maîtrise - maîtrise complète en LSF

/**
 * Interface détaillée des compétences par niveau CECRL
 */
export interface CECRLLevelDetails {
    /** Niveau CECRL */
    readonly level: CECRLLevel;
    /** Description du niveau */
    readonly description: string;
    /** Compétences attendues */
    readonly competencies: readonly string[];
    /** Durée d'apprentissage estimée (en heures) */
    readonly estimatedHours: number;
    /** Prérequis */
    readonly prerequisites: readonly CECRLLevel[];
}

/**
 * Mapping complet des niveaux CECRL pour la LSF
 */
export const CECRL_LEVELS_MAPPING: Record<CECRLLevel, CECRLLevelDetails> = {
    'A1': {
        level: 'A1',
        description: 'Découverte de la LSF - premiers signes et expressions de base',
        competencies: [
            'alphabet_dactylologique',
            'salutations_base',
            'nombres_simples',
            'famille_proche',
            'besoins_essentiels'
        ],
        estimatedHours: 60,
        prerequisites: []
    },
    'A2': {
        level: 'A2',
        description: 'Survie en LSF - communication simple du quotidien',
        competencies: [
            'temps_horaires',
            'activités_quotidiennes',
            'lieux_familiers',
            'descriptions_simples',
            'demandes_polies'
        ],
        estimatedHours: 120,
        prerequisites: ['A1']
    },
    'B1': {
        level: 'B1',
        description: 'Seuil en LSF - autonomie dans les situations courantes',
        competencies: [
            'récits_expériences',
            'opinions_simples',
            'projets_futurs',
            'problèmes_quotidiens',
            'conversations_structurées'
        ],
        estimatedHours: 180,
        prerequisites: ['A1', 'A2']
    },
    'B2': {
        level: 'B2',
        description: 'Indépendance en LSF - compréhension de sujets complexes',
        competencies: [
            'débats_opinions',
            'sujets_abstraits',
            'nuances_émotionnelles',
            'registres_langue',
            'culture_sourde_approfondie'
        ],
        estimatedHours: 300,
        prerequisites: ['A1', 'A2', 'B1']
    },
    'C1': {
        level: 'C1',
        description: 'Autonomie en LSF - expression fluide et spontanée',
        competencies: [
            'expression_spontanée',
            'textes_complexes',
            'implicites_culturels',
            'registres_spécialisés',
            'leadership_discussions'
        ],
        estimatedHours: 450,
        prerequisites: ['A1', 'A2', 'B1', 'B2']
    },
    'C2': {
        level: 'C2',
        description: 'Maîtrise complète de la LSF - niveau natif',
        competencies: [
            'maîtrise_parfaite',
            'créativité_linguistique',
            'enseignement_LSF',
            'recherche_linguistique',
            'préservation_patrimoine'
        ],
        estimatedHours: 600,
        prerequisites: ['A1', 'A2', 'B1', 'B2', 'C1']
    }
} as const;

// ==================== HUMEURS ET ÉTATS ÉMOTIONNELS IA ====================

/**
 * Humeurs possibles pour les IA-élèves Tamagotchi
 */
export type AIMood =
    | 'happy'         // Heureux et motivé
    | 'excited'       // Excité et enthousiaste  
    | 'curious'       // Curieux et investigateur
    | 'focused'       // Concentré et attentif
    | 'confident'     // Confiant et sûr de soi
    | 'neutral'       // État neutre par défaut
    | 'tired'         // Fatigué, besoin de pause
    | 'confused'      // Confus, ne comprend pas
    | 'frustrated'    // Frustré par la difficulté
    | 'sad'           // Triste ou démotivé
    | 'anxious'       // Anxieux ou stressé
    | 'bored';        // Ennuyé par la répétition

/**
 * Interface pour l'état émotionnel détaillé d'une IA
 */
export interface AIMoodState {
    /** Humeur principale actuelle */
    readonly currentMood: AIMood;
    /** Intensité de l'humeur (0-1) */
    readonly intensity: number;
    /** Humeur secondaire (optionnelle) */
    readonly secondaryMood?: AIMood;
    /** Facteurs qui influencent l'humeur */
    readonly influencingFactors: readonly string[];
    /** Durée dans cet état (en millisecondes) */
    readonly duration: number;
    /** Timestamp du changement d'humeur */
    readonly changedAt: Date;
    /** Tendance d'évolution (amélioration/dégradation) */
    readonly trend: 'improving' | 'stable' | 'declining';
}

/**
 * Mapping des humeurs vers les émotions primaires
 */
export const MOOD_TO_EMOTION_MAPPING: Record<AIMood, string> = {
    'happy': 'joy',
    'excited': 'joy',
    'curious': 'joy',
    'focused': 'neutral',
    'confident': 'joy',
    'neutral': 'neutral',
    'tired': 'sadness',
    'confused': 'fear',
    'frustrated': 'anger',
    'sad': 'sadness',
    'anxious': 'fear',
    'bored': 'sadness'
} as const;

// ==================== SESSIONS D'ENSEIGNEMENT ====================

/**
 * Interface pour une session d'enseignement CODA
 */
export interface TeachingSession {
    /** Identifiant unique de la session */
    readonly sessionId: string;
    /** Identifiant de l'utilisateur enseignant */
    readonly teacherId: string;
    /** Identifiant de l'IA-élève */
    readonly aiStudentId: string;
    /** Timestamp de début */
    readonly startTime: Date;
    /** Timestamp de fin (si terminée) */
    readonly endTime?: Date;
    /** Contenu de la session */
    readonly content: TeachingContent;
    /** Réactions de l'IA pendant la session */
    readonly aiReactions: AISessionReactions;
    /** Métriques de performance */
    readonly metrics: SessionMetrics;
    /** État de la session */
    readonly status: 'active' | 'completed' | 'paused' | 'cancelled';
    /** Notes de l'enseignant */
    readonly teacherNotes?: string;
    /** Objectifs pédagogiques */
    readonly objectives: readonly string[];
}

/**
 * Interface pour le contenu d'enseignement
 */
export interface TeachingContent {
    /** Sujet principal */
    readonly topic: string;
    /** Niveau CECRL ciblé */
    readonly targetLevel: CECRLLevel;
    /** Méthode d'enseignement utilisée */
    readonly teachingMethod?: string;
    /** Durée prévue (en secondes) */
    readonly duration: number;
    /** Matériel pédagogique utilisé */
    readonly materials: readonly string[];
    /** Exercices inclus */
    readonly exercises: readonly string[];
    /** Supports visuels */
    readonly visualAids?: readonly string[];
}

/**
 * Interface pour les réactions de l'IA pendant la session
 */
export interface AISessionReactions {
    /** Niveau de compréhension global (0-1) */
    readonly comprehension: number;
    /** Réactions textuelles générées */
    readonly textualReactions: readonly string[];
    /** Questions posées par l'IA */
    readonly questions: readonly string[];
    /** Erreurs commises */
    readonly errors: readonly string[];
    /** État émotionnel au cours de la session */
    readonly emotion: AIMood;
    /** Évolution de l'engagement (0-1) */
    readonly engagementEvolution: readonly number[];
    /** Moments de difficulté identifiés */
    readonly strugglingMoments: readonly Date[];
}

/**
 * Interface pour les métriques de session
 */
export interface SessionMetrics {
    /** Durée effective (en secondes) */
    readonly actualDuration: number;
    /** Taux de participation de l'IA (0-1) */
    readonly participationRate: number;
    /** Nombre d'interventions de l'enseignant */
    readonly teacherInterventions: number;
    /** Score de réussite global (0-1) */
    readonly successScore: number;
    /** Concepts maîtrisés */
    readonly conceptsMastered: readonly string[];
    /** Concepts à revoir */
    readonly conceptsToReview: readonly string[];
    /** Efficacité pédagogique estimée (0-1) */
    readonly teachingEffectiveness: number;
}

// ==================== ALIAS POUR COMPATIBILITÉ ====================

/**
 * Alias pour compatibilité avec les autres parties du système
 */
export type LearningSession = TeachingSession;

// ==================== FONCTIONS UTILITAIRES ====================

/**
 * Détermine le niveau CECRL suivant
 * 
 * @param currentLevel - Niveau actuel
 * @returns Niveau suivant ou undefined si déjà au maximum
 */
export function getNextCECRLLevel(currentLevel: CECRLLevel): CECRLLevel | undefined {
    const levels: CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentIndex = levels.indexOf(currentLevel);

    if (currentIndex === -1 || currentIndex === levels.length - 1) {
        return undefined;
    }

    return levels[currentIndex + 1];
}

/**
 * Détermine le niveau CECRL précédent
 * 
 * @param currentLevel - Niveau actuel  
 * @returns Niveau précédent ou undefined si déjà au minimum
 */
export function getPreviousCECRLLevel(currentLevel: CECRLLevel): CECRLLevel | undefined {
    const levels: CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentIndex = levels.indexOf(currentLevel);

    if (currentIndex <= 0) {
        return undefined;
    }

    return levels[currentIndex - 1];
}

/**
 * Calcule l'écart entre deux niveaux CECRL
 * 
 * @param fromLevel - Niveau de départ
 * @param toLevel - Niveau d'arrivée  
 * @returns Nombre de niveaux d'écart (positif si progression)
 */
export function calculateCECRLGap(fromLevel: CECRLLevel, toLevel: CECRLLevel): number {
    const levels: CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const fromIndex = levels.indexOf(fromLevel);
    const toIndex = levels.indexOf(toLevel);

    return toIndex - fromIndex;
}

/**
 * Vérifie si un niveau CECRL est valide
 * 
 * @param level - Niveau à vérifier
 * @returns True si le niveau est valide
 */
export function isValidCECRLLevel(level: string): level is CECRLLevel {
    return ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level);
}

/**
 * Obtient une humeur aléatoire basée sur un contexte
 * 
 * @param context - Contexte émotionnel
 * @returns Humeur appropriée au contexte
 */
export function getContextualMood(context: 'learning' | 'success' | 'failure' | 'neutral'): AIMood {
    const moodsByContext: Record<typeof context, AIMood[]> = {
        'learning': ['curious', 'focused', 'neutral'],
        'success': ['happy', 'excited', 'confident'],
        'failure': ['confused', 'frustrated', 'sad'],
        'neutral': ['neutral', 'focused']
    };

    const moods = moodsByContext[context];
    return moods[Math.floor(Math.random() * moods.length)];
}

/**
 * Détermine l'intensité émotionnelle basée sur la performance
 * 
 * @param performance - Score de performance (0-1)
 * @returns Intensité émotionnelle (0-1)
 */
export function calculateEmotionalIntensity(performance: number): number {
    // Plus la performance s'éloigne de 0.5, plus l'intensité est forte
    return Math.abs(performance - 0.5) * 2;
}