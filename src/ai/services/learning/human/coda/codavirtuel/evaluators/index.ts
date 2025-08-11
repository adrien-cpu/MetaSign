/**
 * Point d'entrée principal pour le module évaluateur CODA refactorisé
 * @file src/ai/services/learning/human/coda/codavirtuel/evaluators/index.ts
 * @module ai/services/learning/human/coda/codavirtuel/evaluators
 * @description Exporte tous les composants du système d'évaluation CODA révolutionnaire
 * @author MetaSign Learning Team
 * @version 2.1.0
 * @since 2025
 * @lastModified 2025-01-15
 */

// ==================== EXPORTS PRINCIPAUX ====================

// Service principal d'évaluation CODA
export { CECRLCODAEvaluator } from './CECRLCODAEvaluator';

// Types et interfaces
export * from './types/CODAEvaluatorTypes';

// Analyseurs spécialisés
export { EmotionalAnalyzer } from './analyzers/EmotionalAnalyzer';
export { MentorEvaluator } from './analyzers/MentorEvaluator';
export { AIStudentEvolver } from './analyzers/AIStudentEvolver';

// Générateurs spécialisés
export { SupportGenerator } from './generators/SupportGenerator';
export { PredictionGenerator } from './generators/PredictionGenerator';
export { CulturalContextGenerator } from './generators/CulturalContextGenerator';

// ==================== TYPES D'EXPORT POUR COMPATIBILITÉ ====================

// Re-export des types principaux pour compatibilité ascendante
export type {
    TeachingSession,
    AIStudentStatus,
    MentorEvaluation,
    TeachingSupport,
    CODAExperienceEvaluation,
    CODAEvaluatorConfig,
    EmotionalConfig,
    SkillAnalysisResult,
    StrengthsImprovementsResult
} from './types/CODAEvaluatorTypes';

// ==================== FACTORY FUNCTIONS ====================

import { CECRLCODAEvaluator } from './CECRLCODAEvaluator';
import { EmotionalAnalyzer } from './analyzers/EmotionalAnalyzer';
import { MentorEvaluator } from './analyzers/MentorEvaluator';
import { AIStudentEvolver } from './analyzers/AIStudentEvolver';
import { SupportGenerator } from './generators/SupportGenerator';
import { PredictionGenerator } from './generators/PredictionGenerator';
import { CulturalContextGenerator } from './generators/CulturalContextGenerator';
import type { CODAEvaluatorConfig, EmotionalConfig } from './types/CODAEvaluatorTypes';

/**
 * Crée une instance configurée de l'évaluateur CODA
 * @param config Configuration optionnelle
 * @returns Instance de l'évaluateur CODA
 */
export const createCODAEvaluator = (config?: CODAEvaluatorConfig): CECRLCODAEvaluator => {
    return new CECRLCODAEvaluator(config);
};

/**
 * Crée un analyseur émotionnel configuré
 * @param emotionalConfig Configuration émotionnelle
 * @returns Instance de l'analyseur émotionnel
 */
export const createEmotionalAnalyzer = (emotionalConfig: EmotionalConfig): EmotionalAnalyzer => {
    return new EmotionalAnalyzer(emotionalConfig);
};

/**
 * Crée un évaluateur de mentors configuré
 * @param emotionalConfig Configuration émotionnelle
 * @returns Instance de l'évaluateur de mentors
 */
export const createMentorEvaluator = (emotionalConfig: EmotionalConfig): MentorEvaluator => {
    return new MentorEvaluator(emotionalConfig);
};

/**
 * Crée un évoluteur d'IA-élève
 * @returns Instance de l'évoluteur d'IA-élève
 */
export const createAIStudentEvolver = (): AIStudentEvolver => {
    return new AIStudentEvolver();
};

/**
 * Crée un générateur de supports pédagogiques
 * @returns Instance du générateur de supports
 */
export const createSupportGenerator = (): SupportGenerator => {
    return new SupportGenerator();
};

/**
 * Crée un générateur de prédictions d'apprentissage
 * @returns Instance du générateur de prédictions
 */
export const createPredictionGenerator = (): PredictionGenerator => {
    return new PredictionGenerator();
};

/**
 * Crée un générateur de contexte culturel
 * @returns Instance du générateur de contexte culturel
 */
export const createCulturalContextGenerator = (): CulturalContextGenerator => {
    return new CulturalContextGenerator();
};

/**
 * Crée un ensemble complet d'analyseurs et générateurs CODA
 * @param config Configuration de l'évaluateur
 * @returns Ensemble complet des composants CODA
 */
export const createCODAComponents = (config?: CODAEvaluatorConfig) => {
    const evaluator = createCODAEvaluator(config);

    // Créer une configuration émotionnelle par défaut
    const defaultEmotionalConfig: EmotionalConfig = {
        frustrationThreshold: 0.7,
        motivationBoost: 0.3,
        culturalSensitivityWeight: config?.aiIntelligenceLevel === 'expert' ? 0.35 : 0.25,
        empathyWeight: config?.aiIntelligenceLevel === 'expert' ? 0.4 : 0.35
    };

    return {
        evaluator,
        emotionalAnalyzer: createEmotionalAnalyzer(defaultEmotionalConfig),
        mentorEvaluator: createMentorEvaluator(defaultEmotionalConfig),
        aiStudentEvolver: createAIStudentEvolver(),
        supportGenerator: createSupportGenerator(),
        predictionGenerator: createPredictionGenerator(),
        culturalContextGenerator: createCulturalContextGenerator()
    };
};

// ==================== UTILITAIRES ====================

// Re-export des utilitaires
export { CODA_EVALUATOR_CONSTANTS, CODAEvaluatorUtils } from './types/CODAEvaluatorTypes';

// ==================== CONFIGURATIONS PRÉDÉFINIES ====================

/**
 * Configurations prédéfinies pour différents contextes d'utilisation
 */
export const CODA_PRESETS = {
    /** Configuration pour débutants */
    BEGINNER: {
        aiIntelligenceLevel: 'basic' as const,
        culturalAuthenticity: true,
        emotionalSensitivity: 0.9
    },

    /** Configuration pour utilisateurs intermédiaires */
    INTERMEDIATE: {
        aiIntelligenceLevel: 'intermediate' as const,
        culturalAuthenticity: true,
        emotionalSensitivity: 0.8
    },

    /** Configuration pour utilisateurs avancés */
    ADVANCED: {
        aiIntelligenceLevel: 'advanced' as const,
        culturalAuthenticity: true,
        emotionalSensitivity: 0.7
    },

    /** Configuration pour experts et formateurs */
    EXPERT: {
        aiIntelligenceLevel: 'expert' as const,
        culturalAuthenticity: true,
        emotionalSensitivity: 0.6
    },

    /** Configuration pour recherche et développement */
    RESEARCH: {
        aiIntelligenceLevel: 'expert' as const,
        culturalAuthenticity: true,
        emotionalSensitivity: 1.0
    }
} as const;

// ==================== DOCUMENTATION ====================

/**
 * @fileoverview
 * 
 * Module d'évaluation CODA révolutionnaire refactorisé pour MetaSign
 * ==================================================================
 * 
 * Ce module fournit un système complet d'évaluation des compétences CODA
 * (Children of Deaf Adults) avec intelligence émotionnelle et prédictive.
 * 
 * ## Architecture refactorisée
 * 
 * Le module est organisé en composants spécialisés :
 * 
 * ### Service Principal
 * - `CECRLCODAEvaluator` : Orchestrateur principal avec IA émotionnelle
 * 
 * ### Analyseurs Spécialisés
 * - `EmotionalAnalyzer` : Analyse du contexte émotionnel
 * - `MentorEvaluator` : Évaluation des compétences de mentorat
 * - `AIStudentEvolver` : Évolution de l'IA-élève Tamagotchi
 * 
 * ### Générateurs Intelligents
 * - `SupportGenerator` : Supports pédagogiques adaptatifs
 * - `PredictionGenerator` : Prédictions d'apprentissage IA
 * - `CulturalContextGenerator` : Contextes culturels authentiques
 * 
 * ## Utilisation de base
 * 
 * ```typescript
 * import { createCODAEvaluator, CODA_PRESETS } from './evaluators';
 * 
 * // Créer un évaluateur pour niveau intermédiaire
 * const evaluator = createCODAEvaluator(CODA_PRESETS.INTERMEDIATE);
 * 
 * // Évaluer une expérience CODA complète
 * const evaluation = await evaluator.evaluateCODAExperience(
 *   'mentor-123',
 *   teachingSessions
 * );
 * 
 * console.log(`Score mentor: ${evaluation.mentorEvaluation.overallScore}`);
 * console.log(`IA-élève: ${evaluation.aiStudent.name} (${evaluation.aiStudent.mood})`);
 * console.log(`Confiance: ${evaluation.confidence * 100}%`);
 * ```
 * 
 * ## Utilisation avancée avec composants séparés
 * 
 * ```typescript
 * import { createCODAComponents } from './evaluators';
 * 
 * // Créer l'ensemble complet des composants
 * const components = createCODAComponents(CODA_PRESETS.EXPERT);
 * 
 * // Analyser le contexte émotionnel
 * const emotionalContext = components.emotionalAnalyzer.analyzeEmotionalContext(sessions);
 * 
 * // Évaluer les compétences du mentor
 * const mentorEval = components.mentorEvaluator.evaluateMentorSkills(sessions, emotionalContext);
 * 
 * // Faire évoluer l'IA-élève
 * const aiStudent = await components.aiStudentEvolver.evolveAIStudent('mentor-123', sessions);
 * ```
 * 
 * ## Fonctionnalités révolutionnaires
 * 
 * ### IA-élève Tamagotchi
 * - Personnalité évolutive basée sur l'apprentissage
 * - Humeur dynamique réagissant aux méthodes pédagogiques
 * - Progression CECRL authentique
 * - Besoins d'aide adaptatifs
 * 
 * ### Intelligence émotionnelle
 * - Détection automatique des états émotionnels
 * - Adaptations pédagogiques contextuelles
 * - Support émotionnel personnalisé
 * - Prévention de la frustration
 * 
 * ### Prédictions d'apprentissage
 * - Estimation intelligente des temps d'apprentissage
 * - Identification proactive des obstacles
 * - Stratégies d'adaptation personnalisées
 * - Analyse des tendances motivationnelles
 * 
 * ### Contexte culturel authentique
 * - Environnements immersifs de la communauté sourde
 * - Éléments culturels adaptatifs
 * - Références historiques contextuelles
 * - Authenticité validée par la communauté
 * 
 * ## Conformité et qualité
 * 
 * - ✅ Compatible avec `exactOptionalPropertyTypes: true`
 * - ✅ Tous les fichiers < 300 lignes (guide de refactorisation)
 * - ✅ Architecture modulaire avec séparation des responsabilités
 * - ✅ Types stricts sans `any`
 * - ✅ Documentation JSDoc complète
 * - ✅ Gestion d'erreurs robuste
 * - ✅ Logging détaillé pour le debugging
 * - ✅ Factory functions pour faciliter l'utilisation
 * - ✅ Configurations prédéfinies pour différents contextes
 * 
 * ## Support des niveaux CECRL
 * 
 * L'évaluateur supporte l'évolution complète selon le CECRL :
 * - **A1** : Découverte des signes de base
 * - **A2** : Compréhension des conversations simples
 * - **B1** : Communication autonome en LSF
 * - **B2** : Maîtrise approfondie et nuancée
 * - **C1/C2** : Expertise et transmission culturelle
 * 
 * ## Métriques et analytics
 * 
 * Le système fournit des métriques détaillées :
 * - Progression de l'IA-élève avec tendances
 * - Performance du mentor par compétence
 * - Efficacité des adaptations émotionnelles
 * - Authenticité culturelle mesurée
 * - Confiance globale de l'évaluation
 */