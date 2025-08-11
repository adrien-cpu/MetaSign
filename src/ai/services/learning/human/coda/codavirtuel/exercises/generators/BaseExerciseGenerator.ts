/**
 * Classe de base pour les générateurs d'exercices
 * 
 * @file src/ai/services/learning/codavirtuel/exercises/generators/BaseExerciseGenerator.ts
 */

import { BaseExerciseParams, BaseEvaluationResult, BaseExerciseMetadata } from '../ExerciseGenerator.interface';

/**
 * Classe de base fournissant des fonctionnalités communes à tous les générateurs d'exercices
 */
export abstract class BaseExerciseGenerator {
    /**
     * Génère un identifiant unique pour un exercice
     * @param prefix Préfixe pour l'identifiant
     * @returns Identifiant unique
     * @protected
     */
    protected generateId(prefix: string = 'ex'): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `${prefix}-${timestamp}-${random}`;
    }

    /**
     * Valide la difficulté et la maintient dans la plage 0-1
     * @param difficulty Valeur de difficulté à valider
     * @returns Difficulté validée
     * @protected
     */
    protected validateDifficulty(difficulty: number): number {
        return Math.max(0, Math.min(1, difficulty));
    }

    /**
     * Génère des métadonnées de base pour un exercice
     * @param params Paramètres de base de l'exercice
     * @param type Type d'exercice
     * @param skills Compétences évaluées
     * @param tags Tags supplémentaires
     * @returns Métadonnées de l'exercice
     * @protected
     */
    protected generateMetadata(
        params: BaseExerciseParams,
        type: string,
        skills: string[],
        tags: string[] = []
    ): BaseExerciseMetadata {
        return {
            id: this.generateId(type),
            level: params.level,
            difficulty: this.validateDifficulty(params.difficulty),
            type,
            skills,
            tags: [type, params.level, ...tags],
            createdAt: new Date()
        };
    }

    /**
     * Détermine si un exercice est adapté au niveau CECRL spécifié
     * @param exerciseLevel Niveau de l'exercice
     * @param userLevel Niveau de l'utilisateur
     * @param allowHigher Autoriser les exercices de niveau supérieur
     * @param allowLower Autoriser les exercices de niveau inférieur
     * @returns Vrai si l'exercice est adapté
     * @protected
     */
    protected isExerciseLevelAppropriate(
        exerciseLevel: string,
        userLevel: string,
        allowHigher: boolean = false,
        allowLower: boolean = true
    ): boolean {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const exerciseLevelIndex = levels.indexOf(exerciseLevel);
        const userLevelIndex = levels.indexOf(userLevel);

        if (exerciseLevelIndex === -1 || userLevelIndex === -1) {
            return false; // Niveaux non reconnus
        }

        if (exerciseLevelIndex === userLevelIndex) {
            return true; // Même niveau
        }

        if (exerciseLevelIndex < userLevelIndex && allowLower) {
            return true; // Niveau inférieur autorisé
        }

        if (exerciseLevelIndex > userLevelIndex && allowHigher) {
            return true; // Niveau supérieur autorisé
        }

        return false;
    }

    /**
     * Calcule un score ajusté selon la difficulté de l'exercice
     * @param rawScore Score brut (0-1)
     * @param difficulty Difficulté de l'exercice (0-1)
     * @returns Score ajusté
     * @protected
     */
    protected adjustScoreByDifficulty(rawScore: number, difficulty: number): number {
        // Plus la difficulté est élevée, plus le score est ajusté à la hausse
        const validatedDifficulty = this.validateDifficulty(difficulty);
        const difficultyBonus = validatedDifficulty * 0.2; // Bonus maximum de 20%

        return Math.min(1, rawScore * (1 + difficultyBonus));
    }

    /**
     * Génère un résultat d'évaluation de base
     * @param correct Indique si la réponse est correcte
     * @param rawScore Score brut (0-1)
     * @param difficulty Difficulté de l'exercice (0-1)
     * @param explanation Explication (optionnelle)
     * @param skillDetails Détails par compétence (optionnels)
     * @returns Résultat d'évaluation
     * @protected
     */
    protected generateBaseResult(
        correct: boolean,
        rawScore: number,
        difficulty: number,
        explanation?: string | undefined,
        skillDetails?: Record<string, number>
    ): BaseEvaluationResult {
        const adjustedScore = this.adjustScoreByDifficulty(rawScore, difficulty);

        return {
            correct,
            score: adjustedScore,
            explanation,
            details: skillDetails || {}
        };
    }

    /**
     * Distribue un score global entre plusieurs compétences
     * @param skills Liste des compétences
     * @param globalScore Score global
     * @param variation Variation maximale entre les scores (0-1)
     * @returns Map des scores par compétence
     * @protected
     */
    protected distributeScoreToSkills(
        skills: string[],
        globalScore: number,
        variation: number = 0.2
    ): Record<string, number> {
        if (skills.length === 0) {
            return {};
        }

        const result: Record<string, number> = {};
        const validatedVariation = this.validateDifficulty(variation);

        // Distribuer le score à chaque compétence avec une légère variation
        for (const skill of skills) {
            // Variation aléatoire entre -variation/2 et +variation/2
            const randomVariation = (Math.random() * validatedVariation) - (validatedVariation / 2);

            // Calculer le score ajusté et le maintenir dans la plage 0-1
            let skillScore = globalScore + randomVariation;
            skillScore = Math.max(0, Math.min(1, skillScore));

            result[skill] = skillScore;
        }

        return result;
    }

    /**
     * Shuffle (mélange) un tableau de manière aléatoire
     * @param array Tableau à mélanger
     * @returns Tableau mélangé
     * @protected
     */
    protected shuffleArray<T>(array: T[]): T[] {
        const result = [...array];

        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }

        return result;
    }

    /**
     * Génère un nombre aléatoire dans une plage donnée
     * @param min Valeur minimale (incluse)
     * @param max Valeur maximale (exclue)
     * @returns Nombre aléatoire
     * @protected
     */
    protected getRandomNumber(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    /**
     * Génère un entier aléatoire dans une plage donnée
     * @param min Valeur minimale (incluse)
     * @param max Valeur maximale (incluse)
     * @returns Entier aléatoire
     * @protected
     */
    protected getRandomInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Sélectionne un élément aléatoire dans un tableau
     * @param array Tableau source
     * @returns Élément aléatoire
     * @protected
     */
    protected getRandomElement<T>(array: T[]): T {
        return array[this.getRandomInt(0, array.length - 1)];
    }

    /**
     * Sélectionne plusieurs éléments aléatoires dans un tableau
     * @param array Tableau source
     * @param count Nombre d'éléments à sélectionner
     * @param unique Si vrai, ne sélectionne pas deux fois le même élément
     * @returns Tableau d'éléments sélectionnés
     * @protected
     */
    protected getRandomElements<T>(array: T[], count: number, unique: boolean = true): T[] {
        if (count <= 0) {
            return [];
        }

        if (unique && count >= array.length) {
            return [...array]; // Retourne une copie de tout le tableau
        }

        if (unique) {
            // Mélanger le tableau et prendre les n premiers éléments
            return this.shuffleArray(array).slice(0, count);
        } else {
            // Sélectionner count éléments aléatoires avec possibilité de doublons
            const result: T[] = [];

            for (let i = 0; i < count; i++) {
                result.push(this.getRandomElement(array));
            }

            return result;
        }
    }
}