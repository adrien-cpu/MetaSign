/**
 *  @file src/ai/services/learning/codavirtuel/exercises/ExerciseGenerator.interface.ts
 *  @description Interface pour les générateurs d'exercices
* @module ExerciseGenerator
* Cette interface définit les méthodes pour générer des exercices
 * et évaluer les réponses des utilisateurs dans le contexte d'apprentissage virtuel.
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 */

/**
 * Interface générique pour les générateurs d'exercices
 * 
 * @template T Type d'exercice généré
 * @template P Type de paramètres pour la génération
 * @template R Type de réponse utilisateur
 * @template E Type de résultat d'évaluation
 */
export interface ExerciseGenerator<T, P, R = unknown, E = unknown> {
    /**
     * Génère un exercice en fonction des paramètres fournis
     * 
     * @param params Paramètres de génération
     * @returns Exercice généré
     */
    generate(params: P): Promise<T>;

    /**
     * Évalue la réponse d'un utilisateur à un exercice
     * 
     * @param exercise Exercice à évaluer
     * @param response Réponse de l'utilisateur
     * @returns Résultat de l'évaluation
     */
    evaluate(exercise: T, response: R): E;
}

/**
 * Interface pour les paramètres de base de génération d'exercices
 */
export interface BaseExerciseParams {
    /**
     * Niveau CECRL (A1, A2, B1, B2, C1, C2)
     */
    level: string;

    /**
     * Difficulté de l'exercice (0-1)
     */
    difficulty: number;

    /**
     * Domaines de compétence sur lesquels se concentrer
     */
    focusAreas?: string[];

    /**
     * Identifiant de l'utilisateur
     */
    userId?: string;
}

/**
 * Interface pour les résultats d'évaluation de base
 */
export interface BaseEvaluationResult {
    /**
     * Indique si la réponse est correcte
     */
    correct: boolean;

    /**
     * Score obtenu (0-1)
     */
    score: number;

    /**
     * Explication de la réponse correcte
     */
    explanation?: string | undefined;

    /**
     * Détails du score par domaine de compétence
     */
    details: Record<string, number>;
}

/**
 * Interface pour les métadonnées de base d'un exercice
 */
export interface BaseExerciseMetadata {
    /**
     * Identifiant unique de l'exercice
     */
    id: string;

    /**
     * Niveau CECRL (A1, A2, B1, B2, C1, C2)
     */
    level: string;

    /**
     * Difficulté de l'exercice (0-1)
     */
    difficulty: number;

    /**
     * Type d'exercice
     */
    type: string;

    /**
     * Domaines de compétence évalués
     */
    skills: string[];

    /**
     * Mots-clés associés à l'exercice
     */
    tags: string[];

    /**
     * Date de création
     */
    createdAt: Date;
}