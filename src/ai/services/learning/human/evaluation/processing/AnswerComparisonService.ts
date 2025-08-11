/**
 * @file src/ai/services/learning/human/evaluation/processing/AnswerComparisonService.ts
 * @description Service de comparaison des réponses pour l'évaluation des exercices
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * @class AnswerComparisonService
 * @description Service responsable de la comparaison des réponses pour l'évaluation des exercices
 */
export class AnswerComparisonService {
    private readonly logger = LoggerFactory.getLogger('AnswerComparisonService');

    /**
     * @method compareAnswers
     * @param {unknown} userAnswer - Réponse de l'utilisateur
     * @param {unknown} expectedAnswer - Réponse attendue
     * @param {string} answerType - Type de réponse
     * @returns {boolean} - Vrai si la réponse est exactement correcte
     * @description Compare la réponse de l'utilisateur avec la réponse attendue pour déterminer si elle est exactement correcte
     */
    public compareAnswers(userAnswer: unknown, expectedAnswer: unknown, answerType: string): boolean {
        switch (answerType) {
            case 'multiple_choice':
                return this.compareMultipleChoiceAnswers(userAnswer, expectedAnswer);
            case 'text':
                return this.compareTextAnswers(userAnswer, expectedAnswer);
            case 'number':
                return this.compareNumberAnswers(userAnswer, expectedAnswer);
            case 'boolean':
                return this.compareBooleanAnswers(userAnswer, expectedAnswer);
            case 'date':
                return this.compareDateAnswers(userAnswer, expectedAnswer);
            case 'regex':
                return this.compareRegexAnswers(userAnswer, expectedAnswer);
            case 'approximate':
                return this.compareApproximateAnswers(userAnswer, expectedAnswer, 0.8);
            default:
                // Comparer directement pour les autres types
                return JSON.stringify(expectedAnswer) === JSON.stringify(userAnswer);
        }
    }

    /**
     * @method compareAnswersPartially
     * @param {unknown} userAnswer - Réponse de l'utilisateur
     * @param {unknown} expectedAnswer - Réponse attendue
     * @param {string} answerType - Type de réponse
     * @returns {boolean} - Vrai si la réponse est partiellement correcte
     * @description Compare la réponse de l'utilisateur avec la réponse attendue pour déterminer si elle est partiellement correcte
     */
    public compareAnswersPartially(userAnswer: unknown, expectedAnswer: unknown, answerType: string): boolean {
        switch (answerType) {
            case 'multiple_choice':
                return this.compareMultipleChoiceAnswersPartially(userAnswer, expectedAnswer);
            case 'text':
                return this.compareTextAnswersPartially(userAnswer, expectedAnswer);
            case 'number':
                return this.compareNumberAnswersPartially(userAnswer, expectedAnswer);
            case 'date':
                return this.compareDateAnswersPartially(userAnswer, expectedAnswer);
            case 'regex':
                return this.compareRegexAnswersPartially(userAnswer, expectedAnswer);
            case 'approximate':
                return this.compareApproximateAnswers(userAnswer, expectedAnswer, 0.5, 0.8);
            default:
                // Par défaut, pas de correspondance partielle
                return false;
        }
    }

    /**
     * @method compareMultipleChoiceAnswers
     * @private
     * @param {unknown} userAnswer - Réponse de l'utilisateur
     * @param {unknown} expectedAnswer - Réponse attendue
     * @returns {boolean} - Vrai si les réponses à choix multiples correspondent exactement
     */
    private compareMultipleChoiceAnswers(userAnswer: unknown, expectedAnswer: unknown): boolean {
        if (Array.isArray(expectedAnswer) && Array.isArray(userAnswer)) {
            return (
                expectedAnswer.length === userAnswer.length &&
                expectedAnswer.every(item => userAnswer.includes(item))
            );
        }
        return expectedAnswer === userAnswer;
    }

    /**
     * @method compareMultipleChoiceAnswersPartially
     * @private
     * @param {unknown} userAnswer - Réponse de l'utilisateur
     * @param {unknown} expectedAnswer - Réponse attendue
     * @returns {boolean} - Vrai si les réponses à choix multiples correspondent partiellement
     */
    private compareMultipleChoiceAnswersPartially(userAnswer: unknown, expectedAnswer: unknown): boolean {
        if (Array.isArray(expectedAnswer) && Array.isArray(userAnswer)) {
            // Au moins une réponse correcte mais pas toutes
            const correctCount = expectedAnswer.filter(item => userAnswer.includes(item)).length;
            return correctCount > 0 && correctCount < expectedAnswer.length;
        }
        return false;
    }

    /**
     * @method compareTextAnswers
     * @private
     * @param {unknown} userAnswer - Réponse de l'utilisateur
     * @param {unknown} expectedAnswer - Réponse attendue
     * @returns {boolean} - Vrai si les réponses textuelles correspondent exactement
     */
    private compareTextAnswers(userAnswer: unknown, expectedAnswer: unknown): boolean {
        if (typeof expectedAnswer === 'string' && typeof userAnswer === 'string') {
            return expectedAnswer.toLowerCase().trim() === userAnswer.toLowerCase().trim();
        }
        return false;
    }

    /**
     * @method compareTextAnswersPartially
     * @private
     * @param {unknown} userAnswer - Réponse de l'utilisateur
     * @param {unknown} expectedAnswer - Réponse attendue
     * @returns {boolean} - Vrai si les réponses textuelles correspondent partiellement
     */
    private compareTextAnswersPartially(userAnswer: unknown, expectedAnswer: unknown): boolean {
        if (typeof expectedAnswer === 'string' && typeof userAnswer === 'string') {
            const userText = userAnswer.toLowerCase().trim();
            const expectedText = expectedAnswer.toLowerCase().trim();

            // Vérifier si la réponse contient certains mots-clés importants
            const keywordsMatch = expectedText.split(' ')
                .filter(word => word.length > 3) // Ignorer les mots courts
                .some(keyword => userText.includes(keyword));

            return keywordsMatch && userText !== expectedText;
        }
        return false;
    }

    /**
     * @method compareNumberAnswers
     * @private
     * @param {unknown} userAnswer - Réponse de l'utilisateur
     * @param {unknown} expectedAnswer - Réponse attendue
     * @returns {boolean} - Vrai si les réponses numériques correspondent exactement
     */
    private compareNumberAnswers(userAnswer: unknown, expectedAnswer: unknown): boolean {
        // Conversion sécurisée pour les nombres
        const userNum = typeof userAnswer === 'string' ? parseFloat(userAnswer) : Number(userAnswer);
        const expectedNum = typeof expectedAnswer === 'string' ? parseFloat(expectedAnswer as string) : Number(expectedAnswer);

        if (!isNaN(userNum) && !isNaN(expectedNum)) {
            // Comparer avec une petite marge d'erreur pour les nombres à virgule flottante
            return Math.abs(userNum - expectedNum) < 0.0001;
        }
        return false;
    }

    /**
     * @method compareNumberAnswersPartially
     * @private
     * @param {unknown} userAnswer - Réponse de l'utilisateur
     * @param {unknown} expectedAnswer - Réponse attendue
     * @returns {boolean} - Vrai si les réponses numériques correspondent partiellement
     */
    private compareNumberAnswersPartially(userAnswer: unknown, expectedAnswer: unknown): boolean {
        const userNum = typeof userAnswer === 'string' ? parseFloat(userAnswer) : Number(userAnswer);
        const expectedNum = typeof expectedAnswer === 'string' ? parseFloat(expectedAnswer as string) : Number(expectedAnswer);

        if (!isNaN(userNum) && !isNaN(expectedNum)) {
            // Partiellement correct si proche mais pas exact
            const difference = Math.abs(userNum - expectedNum);
            const tolerance = Math.max(0.1, expectedNum * 0.1); // 10% de tolérance
            return difference > 0.0001 && difference <= tolerance;
        }
        return false;
    }

    /**
     * @method compareBooleanAnswers
     * @private
     * @param {unknown} userAnswer - Réponse de l'utilisateur
     * @param {unknown} expectedAnswer - Réponse attendue
     * @returns {boolean} - Vrai si les réponses booléennes correspondent
     */
    private compareBooleanAnswers(userAnswer: unknown, expectedAnswer: unknown): boolean {
        return Boolean(userAnswer) === Boolean(expectedAnswer);
    }

    /**
     * @method compareDateAnswers
     * @private
     * @param {unknown} userAnswer - Réponse de l'utilisateur
     * @param {unknown} expectedAnswer - Réponse attendue
     * @returns {boolean} - Vrai si les réponses de date correspondent exactement
     */
    private compareDateAnswers(userAnswer: unknown, expectedAnswer: unknown): boolean {
        const userDate = userAnswer instanceof Date ? userAnswer : new Date(String(userAnswer));
        const expectedDate = expectedAnswer instanceof Date ? expectedAnswer : new Date(String(expectedAnswer));

        return !isNaN(userDate.getTime()) &&
            !isNaN(expectedDate.getTime()) &&
            userDate.getTime() === expectedDate.getTime();
    }

    /**
     * @method compareDateAnswersPartially
     * @private
     * @param {unknown} userAnswer - Réponse de l'utilisateur
     * @param {unknown} expectedAnswer - Réponse attendue
     * @returns {boolean} - Vrai si les réponses de date correspondent partiellement
     */
    private compareDateAnswersPartially(userAnswer: unknown, expectedAnswer: unknown): boolean {
        const userDate = userAnswer instanceof Date ? userAnswer : new Date(String(userAnswer));
        const expectedDate = expectedAnswer instanceof Date ? expectedAnswer : new Date(String(expectedAnswer));

        if (!isNaN(userDate.getTime()) && !isNaN(expectedDate.getTime())) {
            return (
                userDate.getDate() === expectedDate.getDate() &&
                userDate.getMonth() === expectedDate.getMonth() &&
                userDate.getFullYear() === expectedDate.getFullYear() &&
                userDate.getTime() !== expectedDate.getTime()
            );
        }
        return false;
    }

    /**
     * @method compareRegexAnswers
     * @private
     * @param {unknown} userAnswer - Réponse de l'utilisateur
     * @param {unknown} expectedAnswer - Réponse attendue (pattern regex)
     * @returns {boolean} - Vrai si la réponse correspond au pattern regex
     */
    private compareRegexAnswers(userAnswer: unknown, expectedAnswer: unknown): boolean {
        if (typeof expectedAnswer === 'string' && typeof userAnswer === 'string') {
            try {
                const regex = new RegExp(expectedAnswer);
                return regex.test(userAnswer);
            } catch {
                this.logger.error(`Invalid regex pattern: ${expectedAnswer}`);
                return false;
            }
        }
        return false;
    }

    /**
     * @method compareRegexAnswersPartially
     * @private
     * @param {unknown} userAnswer - Réponse de l'utilisateur
     * @param {unknown} expectedAnswer - Réponse attendue (pattern regex)
     * @returns {boolean} - Vrai si la réponse correspond partiellement au pattern regex
     */
    private compareRegexAnswersPartially(userAnswer: unknown, expectedAnswer: unknown): boolean {
        if (typeof expectedAnswer === 'string' && typeof userAnswer === 'string') {
            try {
                const regex = new RegExp(expectedAnswer, 'g');
                const matches = userAnswer.match(regex);

                if (matches) {
                    const matchText = matches.join('');
                    return matchText.length >= userAnswer.length * 0.5 && matchText.length < userAnswer.length;
                }
            } catch {
                return false;
            }
        }
        return false;
    }

    /**
     * @method compareApproximateAnswers
     * @private
     * @param {unknown} userAnswer - Réponse de l'utilisateur
     * @param {unknown} expectedAnswer - Réponse attendue
     * @param {number} minThreshold - Seuil minimum de similarité
     * @param {number} [maxThreshold] - Seuil maximum de similarité (pour correspondance partielle)
     * @returns {boolean} - Vrai si la similarité est supérieure au seuil
     */
    private compareApproximateAnswers(
        userAnswer: unknown,
        expectedAnswer: unknown,
        minThreshold: number,
        maxThreshold?: number
    ): boolean {
        if (typeof expectedAnswer === 'string' && typeof userAnswer === 'string') {
            const userText = userAnswer.toLowerCase().trim();
            const expectedText = expectedAnswer.toLowerCase().trim();

            // Calculer la similarité (implémentation simple)
            const maxLength = Math.max(userText.length, expectedText.length);
            let commonChars = 0;

            for (let i = 0; i < userText.length; i++) {
                if (expectedText.includes(userText[i])) {
                    commonChars++;
                }
            }

            const similarity = commonChars / maxLength;

            // Pour correspondance partielle (si maxThreshold est fourni)
            if (maxThreshold !== undefined) {
                return similarity >= minThreshold && similarity <= maxThreshold;
            }

            // Pour correspondance exacte
            return similarity > minThreshold;
        }
        return false;
    }
}