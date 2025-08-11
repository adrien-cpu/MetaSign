/**
 * Utilitaires pour l'évaluation de compréhension MetaSign
 * 
 * @file src/ai/services/learning/human/evaluation/evaluation-utilities.ts
 * @description Utilitaires pour l'évaluation de compréhension
 * Fournit des fonctions helper pour calculer les scores, déterminer les niveaux
 * et valider les réponses dans le système d'apprentissage
 * @version 1.3.0
 * @author MetaSign Learning Module
 * @since 1.0.0
 */

import { ComprehensionLevel, ConceptEvaluation, AnswerValue } from './types';

/**
 * @interface AnswerComparison
 * @description Résultat de comparaison de réponses
 */
interface AnswerComparison {
    readonly isCorrect: boolean;
    readonly isPartiallyCorrect: boolean;
    readonly score: number; // 0-100
    readonly confidence: number; // 0-1
    readonly feedback?: string;
}

/**
 * @interface ScoreCalculationOptions
 * @description Options pour le calcul de score
 */
interface ScoreCalculationOptions {
    readonly weightByConfidence?: boolean;
    readonly minimumConfidence?: number;
    readonly penalizeUnknown?: boolean;
    readonly boostHighPerformance?: boolean;
}

/**
 * @interface ValidationResult
 * @description Résultat de validation d'une réponse
 */
interface ValidationResult {
    readonly isValid: boolean;
    readonly errors: ReadonlyArray<string>;
    readonly warnings: ReadonlyArray<string>;
}

/**
 * @class EvaluationUtilities
 * @description Fonctions utilitaires pour l'évaluation de la compréhension
 * Classe statique fournissant des méthodes helper pour les calculs d'évaluation
 */
export class EvaluationUtilities {

    // Constantes de configuration
    private static readonly DEFAULT_TOLERANCE = 0.001;
    private static readonly PARTIAL_MATCH_THRESHOLD = 0.5;
    private static readonly MAX_SCORE = 100;
    private static readonly MIN_CONFIDENCE = 0;
    private static readonly MAX_CONFIDENCE = 1;

    /**
     * @method determineComprehensionLevel
     * @static
     * @param {number} score - Score de compréhension (0-100)
     * @returns {ComprehensionLevel} - Niveau de compréhension correspondant
     * @description Détermine le niveau de compréhension à partir d'un score
     * @throws {Error} Si le score est invalide
     */
    public static determineComprehensionLevel(score: number): ComprehensionLevel {
        this.validateScore(score);

        if (score >= 90) {
            return ComprehensionLevel.MASTERY;
        } else if (score >= 75) {
            return ComprehensionLevel.HIGH;
        } else if (score >= 60) {
            return ComprehensionLevel.MEDIUM;
        } else if (score >= 40) {
            return ComprehensionLevel.LOW;
        } else if (score > 0) {
            return ComprehensionLevel.VERY_LOW;
        } else {
            return ComprehensionLevel.UNKNOWN;
        }
    }

    /**
     * @method calculateGlobalComprehensionScore
     * @static
     * @param {ConceptEvaluation[]} conceptEvaluations - Évaluations des concepts
     * @param {ScoreCalculationOptions} [options] - Options de calcul
     * @returns {number} - Score global de compréhension
     * @description Calcule un score global de compréhension à partir des évaluations de concepts
     * @throws {Error} Si les évaluations sont invalides
     */
    public static calculateGlobalComprehensionScore(
        conceptEvaluations: ConceptEvaluation[],
        options: ScoreCalculationOptions = {}
    ): number {
        this.validateConceptEvaluations(conceptEvaluations);

        if (conceptEvaluations.length === 0) {
            return 0;
        }

        const config = {
            weightByConfidence: options.weightByConfidence ?? true,
            minimumConfidence: options.minimumConfidence ?? 0.1,
            penalizeUnknown: options.penalizeUnknown ?? true,
            boostHighPerformance: options.boostHighPerformance ?? false,
            ...options
        };

        // Filtrer les évaluations avec confiance suffisante
        const validEvaluations = conceptEvaluations.filter(evaluation =>
            evaluation.confidence >= config.minimumConfidence
        );

        if (validEvaluations.length === 0) {
            return config.penalizeUnknown ? 0 : 50; // Score neutre si pas de données fiables
        }

        let weightedSum = 0;
        let totalWeight = 0;

        for (const evaluation of validEvaluations) {
            let weight = 1;

            if (config.weightByConfidence) {
                weight = evaluation.confidence;
            }

            // Boost pour les hautes performances
            if (config.boostHighPerformance && evaluation.score >= 85) {
                weight *= 1.1;
            }

            // Pénalité pour les concepts inconnus
            if (config.penalizeUnknown && evaluation.level === ComprehensionLevel.UNKNOWN) {
                weight *= 0.5;
            }

            weightedSum += evaluation.score * weight;
            totalWeight += weight;
        }

        const finalScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
        return Math.min(this.MAX_SCORE, Math.max(0, Math.round(finalScore * 100) / 100));
    }

    /**
     * @method calculateResultConfidence
     * @static
     * @param {ConceptEvaluation[]} conceptEvaluations - Évaluations des concepts
     * @returns {number} - Confiance globale dans le résultat (0-1)
     * @description Calcule la confiance globale dans le résultat d'évaluation
     * @throws {Error} Si les évaluations sont invalides
     */
    public static calculateResultConfidence(conceptEvaluations: ConceptEvaluation[]): number {
        this.validateConceptEvaluations(conceptEvaluations);

        if (conceptEvaluations.length === 0) {
            return 0;
        }

        // Moyenne pondérée des confiances
        let totalConfidence = 0;
        let totalWeight = 0;

        for (const evaluation of conceptEvaluations) {
            // Poids basé sur le nombre de pratiques (plus de données = plus fiable)
            const practiceWeight = Math.min(1, evaluation.practiceCount / 10);
            const weight = 0.7 + (practiceWeight * 0.3); // Entre 0.7 et 1.0

            totalConfidence += evaluation.confidence * weight;
            totalWeight += weight;
        }

        const baseConfidence = totalWeight > 0 ? totalConfidence / totalWeight : 0;

        // Ajustement basé sur la taille de l'échantillon
        const sampleSizeBonus = Math.min(0.2, conceptEvaluations.length / 50);

        const finalConfidence = Math.min(this.MAX_CONFIDENCE, baseConfidence + sampleSizeBonus);
        return Math.round(finalConfidence * 1000) / 1000; // 3 décimales
    }

    /**
     * @method compareAnswers
     * @static
     * @param {AnswerValue} userAnswer - Réponse de l'utilisateur
     * @param {AnswerValue} expectedAnswer - Réponse attendue
     * @param {string} answerType - Type de réponse
     * @returns {AnswerComparison} - Résultat détaillé de la comparaison
     * @description Compare deux réponses et retourne un résultat détaillé
     */
    public static compareAnswers(
        userAnswer: AnswerValue,
        expectedAnswer: AnswerValue,
        answerType: string
    ): AnswerComparison {
        const isCorrect = this.isAnswerCorrect(userAnswer, expectedAnswer, answerType);
        const isPartiallyCorrect = !isCorrect && this.isAnswerPartiallyCorrect(userAnswer, expectedAnswer, answerType);

        let score = 0;
        let confidence = 1;
        let feedback = '';

        if (isCorrect) {
            score = 100;
            feedback = 'Réponse correcte';
        } else if (isPartiallyCorrect) {
            score = this.calculatePartialScore(userAnswer, expectedAnswer, answerType);
            feedback = 'Réponse partiellement correcte';
            confidence = 0.7;
        } else {
            score = 0;
            feedback = 'Réponse incorrecte';
            confidence = 0.9; // Haute confiance dans l'incorrection
        }

        return {
            isCorrect,
            isPartiallyCorrect,
            score,
            confidence,
            feedback
        };
    }

    /**
     * @method isAnswerCorrect
     * @static
     * @param {AnswerValue} userAnswer - Réponse de l'utilisateur
     * @param {AnswerValue} expectedAnswer - Réponse attendue
     * @param {string} answerType - Type de réponse
     * @returns {boolean} - Indique si la réponse est correcte
     * @description Vérifie si une réponse est correcte selon son type
     */
    public static isAnswerCorrect(
        userAnswer: AnswerValue,
        expectedAnswer: AnswerValue,
        answerType: string
    ): boolean {
        try {
            switch (answerType) {
                case 'text':
                    return this.compareTextAnswers(userAnswer, expectedAnswer);

                case 'number':
                    return this.compareNumberAnswers(userAnswer, expectedAnswer);

                case 'multiple_choice':
                    return this.compareMultipleChoiceAnswers(userAnswer, expectedAnswer);

                case 'boolean':
                    return this.compareBooleanAnswers(userAnswer, expectedAnswer);

                case 'signing':
                case 'spatial_selection':
                    return this.compareComplexAnswers(userAnswer, expectedAnswer);

                default:
                    // Comparaison simple pour types non spécifiés
                    return this.compareSimpleAnswers(userAnswer, expectedAnswer);
            }
        } catch {
            // En cas d'erreur de comparaison, considérer comme incorrect
            return false;
        }
    }

    /**
     * @method isAnswerPartiallyCorrect
     * @static
     * @param {AnswerValue} userAnswer - Réponse de l'utilisateur
     * @param {AnswerValue} expectedAnswer - Réponse attendue
     * @param {string} answerType - Type de réponse
     * @returns {boolean} - Indique si la réponse est partiellement correcte
     * @description Vérifie si une réponse est partiellement correcte selon son type
     */
    public static isAnswerPartiallyCorrect(
        userAnswer: AnswerValue,
        expectedAnswer: AnswerValue,
        answerType: string
    ): boolean {
        try {
            switch (answerType) {
                case 'text':
                    return this.isTextPartiallyCorrect(userAnswer, expectedAnswer);

                case 'multiple_choice':
                    return this.isMultipleChoicePartiallyCorrect(userAnswer, expectedAnswer);

                case 'signing':
                case 'spatial_selection':
                    return this.isComplexAnswerPartiallyCorrect(userAnswer, expectedAnswer);

                default:
                    // Pas de correspondance partielle pour les autres types
                    return false;
            }
        } catch {
            return false;
        }
    }

    /**
     * @method validateAnswerValue
     * @static
     * @param {AnswerValue} answer - Réponse à valider
     * @param {string} answerType - Type de réponse attendu
     * @returns {ValidationResult} - Résultat de validation
     * @description Valide qu'une réponse correspond au type attendu
     */
    public static validateAnswerValue(answer: AnswerValue, answerType: string): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (answer === null || answer === undefined) {
            errors.push('Answer cannot be null or undefined');
            return { isValid: false, errors, warnings };
        }

        switch (answerType) {
            case 'text':
                if (typeof answer !== 'string') {
                    errors.push('Answer must be a string for text type');
                } else if (answer.trim().length === 0) {
                    warnings.push('Answer is empty');
                }
                break;

            case 'number':
                if (typeof answer !== 'number') {
                    errors.push('Answer must be a number for number type');
                } else if (!Number.isFinite(answer)) {
                    errors.push('Answer must be a finite number');
                }
                break;

            case 'boolean':
                if (typeof answer !== 'boolean') {
                    errors.push('Answer must be a boolean for boolean type');
                }
                break;

            case 'multiple_choice':
                if (!Array.isArray(answer) && typeof answer !== 'string') {
                    errors.push('Answer must be a string or array for multiple_choice type');
                }
                break;

            default:
                // Type non reconnu - avertissement uniquement
                warnings.push(`Unknown answer type: ${answerType}`);
        }

        return {
            isValid: errors.length === 0,
            errors: Object.freeze(errors),
            warnings: Object.freeze(warnings)
        };
    }

    // Méthodes privées pour la comparaison spécialisée

    /**
     * @method compareTextAnswers
     * @private
     * @static
     * @param {AnswerValue} userAnswer - Réponse utilisateur
     * @param {AnswerValue} expectedAnswer - Réponse attendue
     * @returns {boolean} - Résultat de la comparaison
     */
    private static compareTextAnswers(userAnswer: AnswerValue, expectedAnswer: AnswerValue): boolean {
        if (typeof userAnswer !== 'string' || typeof expectedAnswer !== 'string') {
            return false;
        }
        return userAnswer.trim().toLowerCase() === expectedAnswer.trim().toLowerCase();
    }

    /**
     * @method compareNumberAnswers
     * @private
     * @static
     * @param {AnswerValue} userAnswer - Réponse utilisateur
     * @param {AnswerValue} expectedAnswer - Réponse attendue
     * @returns {boolean} - Résultat de la comparaison
     */
    private static compareNumberAnswers(userAnswer: AnswerValue, expectedAnswer: AnswerValue): boolean {
        if (typeof userAnswer !== 'number' || typeof expectedAnswer !== 'number') {
            return false;
        }
        return Math.abs(userAnswer - expectedAnswer) < this.DEFAULT_TOLERANCE;
    }

    /**
     * @method compareMultipleChoiceAnswers
     * @private
     * @static
     * @param {AnswerValue} userAnswer - Réponse utilisateur
     * @param {AnswerValue} expectedAnswer - Réponse attendue
     * @returns {boolean} - Résultat de la comparaison
     */
    private static compareMultipleChoiceAnswers(userAnswer: AnswerValue, expectedAnswer: AnswerValue): boolean {
        if (Array.isArray(expectedAnswer)) {
            if (!Array.isArray(userAnswer)) {
                return false;
            }

            // Validation et conversion explicite des types
            const userAnswerArray = userAnswer as (string | number)[];
            const expectedAnswerArray = expectedAnswer as (string | number)[];

            if (userAnswerArray.length !== expectedAnswerArray.length) {
                return false;
            }

            return userAnswerArray.every((answer) => {
                // Cast explicite pour éviter le problème de type never
                const answerValue = answer as string | number;
                return expectedAnswerArray.some(expected => expected === answerValue);
            });
        } else {
            return userAnswer === expectedAnswer;
        }
    }

    /**
     * @method compareBooleanAnswers
     * @private
     * @static
     * @param {AnswerValue} userAnswer - Réponse utilisateur
     * @param {AnswerValue} expectedAnswer - Réponse attendue
     * @returns {boolean} - Résultat de la comparaison
     */
    private static compareBooleanAnswers(userAnswer: AnswerValue, expectedAnswer: AnswerValue): boolean {
        return typeof userAnswer === 'boolean' &&
            typeof expectedAnswer === 'boolean' &&
            userAnswer === expectedAnswer;
    }

    /**
     * @method compareComplexAnswers
     * @private
     * @static
     * @param {AnswerValue} userAnswer - Réponse utilisateur
     * @param {AnswerValue} expectedAnswer - Réponse attendue
     * @returns {boolean} - Résultat de la comparaison
     */
    private static compareComplexAnswers(userAnswer: AnswerValue, expectedAnswer: AnswerValue): boolean {
        if (typeof userAnswer !== 'object' || typeof expectedAnswer !== 'object' ||
            userAnswer === null || expectedAnswer === null) {
            return false;
        }
        return JSON.stringify(userAnswer) === JSON.stringify(expectedAnswer);
    }

    /**
     * @method compareSimpleAnswers
     * @private
     * @static
     * @param {AnswerValue} userAnswer - Réponse utilisateur
     * @param {AnswerValue} expectedAnswer - Réponse attendue
     * @returns {boolean} - Résultat de la comparaison
     */
    private static compareSimpleAnswers(userAnswer: AnswerValue, expectedAnswer: AnswerValue): boolean {
        return userAnswer === expectedAnswer;
    }

    /**
     * @method isTextPartiallyCorrect
     * @private
     * @static
     * @param {AnswerValue} userAnswer - Réponse utilisateur
     * @param {AnswerValue} expectedAnswer - Réponse attendue
     * @returns {boolean} - Résultat de la vérification partielle
     */
    private static isTextPartiallyCorrect(userAnswer: AnswerValue, expectedAnswer: AnswerValue): boolean {
        if (typeof userAnswer !== 'string' || typeof expectedAnswer !== 'string') {
            return false;
        }

        const user = userAnswer.toLowerCase().trim();
        const expected = expectedAnswer.toLowerCase().trim();

        return user.includes(expected) || expected.includes(user);
    }

    /**
     * @method isMultipleChoicePartiallyCorrect
     * @private
     * @static
     * @param {AnswerValue} userAnswer - Réponse utilisateur
     * @param {AnswerValue} expectedAnswer - Réponse attendue
     * @returns {boolean} - Résultat de la vérification partielle
     */
    private static isMultipleChoicePartiallyCorrect(userAnswer: AnswerValue, expectedAnswer: AnswerValue): boolean {
        if (!Array.isArray(expectedAnswer) || !Array.isArray(userAnswer)) {
            return false;
        }

        // Cast explicite des tableaux
        const userAnswerArray = userAnswer as (string | number)[];
        const expectedAnswerArray = expectedAnswer as (string | number)[];

        return userAnswerArray.some((answer) => {
            const answerValue = answer as string | number;
            return expectedAnswerArray.some(expected => expected === answerValue);
        });
    }

    /**
     * @method isComplexAnswerPartiallyCorrect
     * @private
     * @static
     * @param {AnswerValue} userAnswer - Réponse utilisateur
     * @param {AnswerValue} expectedAnswer - Réponse attendue
     * @returns {boolean} - Résultat de la vérification partielle
     */
    private static isComplexAnswerPartiallyCorrect(userAnswer: AnswerValue, expectedAnswer: AnswerValue): boolean {
        if (typeof userAnswer !== 'object' || typeof expectedAnswer !== 'object' ||
            userAnswer === null || expectedAnswer === null) {
            return false;
        }

        const userObj = userAnswer as Record<string, unknown>;
        const expectedObj = expectedAnswer as Record<string, unknown>;

        const userKeys = Object.keys(userObj);
        const expectedKeys = Object.keys(expectedObj);

        if (expectedKeys.length === 0) {
            return false;
        }

        let matchCount = 0;
        for (const key of userKeys) {
            if (expectedKeys.includes(key) && userObj[key] === expectedObj[key]) {
                matchCount++;
            }
        }

        return (matchCount / expectedKeys.length) >= this.PARTIAL_MATCH_THRESHOLD;
    }

    /**
     * @method calculatePartialScore
     * @private
     * @static
     * @param {AnswerValue} userAnswer - Réponse utilisateur
     * @param {AnswerValue} expectedAnswer - Réponse attendue
     * @param {string} answerType - Type de réponse
     * @returns {number} - Score partiel (0-100)
     */
    private static calculatePartialScore(
        userAnswer: AnswerValue,
        expectedAnswer: AnswerValue,
        answerType: string
    ): number {
        switch (answerType) {
            case 'multiple_choice':
                if (Array.isArray(userAnswer) && Array.isArray(expectedAnswer)) {
                    // Cast explicite et validation
                    const userAnswerArray = userAnswer as (string | number)[];
                    const expectedAnswerArray = expectedAnswer as (string | number)[];

                    const correctCount = userAnswerArray.filter((answer) => {
                        const answerValue = answer as string | number;
                        return expectedAnswerArray.some(expected => expected === answerValue);
                    }).length;

                    return Math.round((correctCount / expectedAnswerArray.length) * 100);
                }
                return 50; // Score partiel par défaut

            case 'text':
                // Score basé sur la similarité de longueur et contenu
                if (typeof userAnswer === 'string' && typeof expectedAnswer === 'string') {
                    const similarity = this.calculateTextSimilarity(userAnswer, expectedAnswer);
                    return Math.round(similarity * 100);
                }
                return 25;

            default:
                return 50; // Score partiel par défaut
        }
    }

    /**
     * @method calculateTextSimilarity
     * @private
     * @static
     * @param {string} text1 - Premier texte
     * @param {string} text2 - Deuxième texte
     * @returns {number} - Similarité (0-1)
     */
    private static calculateTextSimilarity(text1: string, text2: string): number {
        const a = text1.toLowerCase().trim();
        const b = text2.toLowerCase().trim();

        if (a === b) return 1;
        if (a.length === 0 || b.length === 0) return 0;

        // Calcul simple basé sur les mots communs
        const wordsA = a.split(/\s+/);
        const wordsB = b.split(/\s+/);

        const commonWords = wordsA.filter(word => wordsB.includes(word));
        const totalWords = Math.max(wordsA.length, wordsB.length);

        return commonWords.length / totalWords;
    }

    /**
     * @method validateScore
     * @private
     * @static
     * @param {number} score - Score à valider
     * @throws {Error} Si le score est invalide
     */
    private static validateScore(score: number): void {
        if (typeof score !== 'number' || !Number.isFinite(score)) {
            throw new Error('Score must be a finite number');
        }
        if (score < 0 || score > this.MAX_SCORE) {
            throw new Error(`Score must be between 0 and ${this.MAX_SCORE}`);
        }
    }

    /**
     * @method validateConceptEvaluations
     * @private
     * @static
     * @param {ConceptEvaluation[]} evaluations - Évaluations à valider
     * @throws {Error} Si les évaluations sont invalides
     */
    private static validateConceptEvaluations(evaluations: ConceptEvaluation[]): void {
        if (!Array.isArray(evaluations)) {
            throw new Error('Concept evaluations must be an array');
        }

        for (const evaluation of evaluations) {
            if (!evaluation || typeof evaluation !== 'object') {
                throw new Error('Each evaluation must be a valid object');
            }
            if (typeof evaluation.score !== 'number' || !Number.isFinite(evaluation.score)) {
                throw new Error('Each evaluation must have a valid score');
            }
            if (typeof evaluation.confidence !== 'number' || !Number.isFinite(evaluation.confidence)) {
                throw new Error('Each evaluation must have a valid confidence');
            }
        }
    }

    /**
     * @method getComprehensionLevelDescription
     * @static
     * @param {ComprehensionLevel} level - Niveau de compréhension
     * @returns {string} - Description du niveau
     * @description Retourne une description textuelle du niveau de compréhension
     */
    public static getComprehensionLevelDescription(level: ComprehensionLevel): string {
        switch (level) {
            case ComprehensionLevel.MASTERY:
                return 'Maîtrise excellente - Concept parfaitement intégré';
            case ComprehensionLevel.HIGH:
                return 'Bonne compréhension - Quelques nuances à perfectionner';
            case ComprehensionLevel.MEDIUM:
                return 'Compréhension moyenne - Bases solides avec lacunes';
            case ComprehensionLevel.LOW:
                return 'Compréhension limitée - Révision nécessaire';
            case ComprehensionLevel.VERY_LOW:
                return 'Compréhension très faible - Apprentissage à reprendre';
            case ComprehensionLevel.UNKNOWN:
                return 'Niveau inconnu - Données insuffisantes';
            default:
                return 'Niveau non défini';
        }
    }

    /**
     * @method getServiceInfo
     * @static
     * @returns {{name: string, version: string, features: string[]}} - Informations sur la classe utilitaire
     * @description Retourne les informations sur la classe utilitaire
     */
    public static getServiceInfo(): { name: string; version: string; features: string[] } {
        return {
            name: 'EvaluationUtilities',
            version: '1.3.0',
            features: [
                'comprehension_level_determination',
                'global_score_calculation',
                'confidence_calculation',
                'answer_comparison',
                'partial_scoring',
                'text_similarity',
                'answer_validation',
                'multiple_answer_types'
            ]
        };
    }
}