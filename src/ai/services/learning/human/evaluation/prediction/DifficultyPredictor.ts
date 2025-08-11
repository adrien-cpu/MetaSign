/**
 * @file src/ai/services/learning/human/evaluation/prediction/DifficultyPredictor.ts
 * @description Prédicteur de difficulté pour les exercices
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * @class DifficultyPredictor
 * @description Prédit le niveau de difficulté approprié pour un utilisateur
 * en se basant sur ses performances passées et son niveau actuel
 */
export class DifficultyPredictor {
    private readonly logger = LoggerFactory.getLogger('DifficultyPredictor');
    private readonly confidenceThreshold: number;

    /**
     * @constructor
     * @param {number} confidenceThreshold - Seuil de confiance pour les prédictions
     */
    constructor(confidenceThreshold: number) {
        this.confidenceThreshold = confidenceThreshold;
        this.logger.info(`DifficultyPredictor initialized with confidence threshold: ${confidenceThreshold}`);
    }

    /**
     * @method predictNextDifficulty
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string[]} conceptIds - Identifiants des concepts
     * @param {number} currentScore - Score actuel
     * @returns {Promise<string>} - Niveau de difficulté recommandé
     * @description Prédit le niveau de difficulté approprié pour le prochain exercice
     */
    public async predictNextDifficulty(
        userId: string,
        conceptIds: string[],
        currentScore: number
    ): Promise<string> {
        this.logger.debug(`Predicting difficulty for user ${userId} with score ${currentScore} on ${conceptIds.length} concepts`);

        // Logique de prédiction basée sur le score et le seuil de confiance
        // Le seuil de confiance est utilisé pour déterminer si la prédiction est fiable
        if (currentScore >= 90) {
            this.logger.debug(`High score (${currentScore}). Recommending advanced difficulty.`);
            return this.isConfident(userId) ? 'advanced' : 'intermediate';
        } else if (currentScore >= 70) {
            this.logger.debug(`Medium score (${currentScore}). Recommending intermediate difficulty.`);
            return 'intermediate';
        } else {
            // Pour les scores faibles, analyse des concepts pour une recommandation plus précise
            const conceptAnalysis = this.analyzeConceptDifficulties(conceptIds);
            this.logger.debug(`Low score (${currentScore}). Concept analysis: ${conceptAnalysis}`);
            return 'beginner';
        }
    }

    /**
     * @method predictConceptDifficulty
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} conceptId - Identifiant du concept
     * @param {Array<{score: number, timestamp: Date}>} performances - Performances de l'utilisateur
     * @returns {Promise<string>} - Niveau de difficulté recommandé
     * @description Prédit le niveau de difficulté approprié pour un concept spécifique
     */
    public async predictConceptDifficulty(
        userId: string,
        conceptId: string,
        performances: Array<{ score: number, timestamp: Date }>
    ): Promise<string> {
        this.logger.debug(`Predicting difficulty for user ${userId} on concept ${conceptId} with ${performances.length} performances`);

        // Si aucune performance, commencer au niveau débutant
        if (performances.length === 0) {
            this.logger.debug('No performance data available. Recommending beginner level.');
            return 'beginner';
        }

        // Calculer le score moyen en tenant compte de la récence des performances
        const weightedScores = this.calculateWeightedScores(performances);

        // Prédiction basée sur le score moyen pondéré et le seuil de confiance
        if (weightedScores.average >= 90 && weightedScores.confidence > this.confidenceThreshold) {
            this.logger.debug(`High weighted score (${weightedScores.average.toFixed(2)}). Recommending advanced level.`);
            return 'advanced';
        } else if (weightedScores.average >= 70) {
            this.logger.debug(`Medium weighted score (${weightedScores.average.toFixed(2)}). Recommending intermediate level.`);
            return 'intermediate';
        } else {
            this.logger.debug(`Low weighted score (${weightedScores.average.toFixed(2)}). Recommending beginner level.`);
            return 'beginner';
        }
    }

    /**
     * @method isConfident
     * @private
     * @param {string} userId - Identifiant de l'utilisateur
     * @returns {boolean} - Indique si la prédiction est fiable
     * @description Détermine si la prédiction pour un utilisateur est suffisamment fiable
     */
    private isConfident(userId: string): boolean {
        // Dans une implémentation réelle, on pourrait vérifier 
        // le nombre total de performances de l'utilisateur,
        // la cohérence de ses résultats, etc.
        this.logger.debug(`Checking confidence for user ${userId} against threshold ${this.confidenceThreshold}`);

        // Simuler un niveau de confiance pour la démonstration
        const simulatedConfidence = Math.random();
        return simulatedConfidence > this.confidenceThreshold;
    }

    /**
     * @method analyzeConceptDifficulties
     * @private
     * @param {string[]} conceptIds - Identifiants des concepts
     * @returns {string} - Résultat d'analyse
     * @description Analyse les difficultés des concepts impliqués
     */
    private analyzeConceptDifficulties(conceptIds: string[]): string {
        // Exemple simple : utilisation de la longueur de la liste des concepts
        // Dans une implémentation réelle, on analyserait la difficulté intrinsèque de chaque concept
        if (conceptIds.length === 0) {
            return 'no concepts to analyze';
        }

        this.logger.debug(`Analyzing ${conceptIds.length} concepts: ${conceptIds.join(', ')}`);
        return `analyzed ${conceptIds.length} concepts`;
    }

    /**
     * @method calculateWeightedScores
     * @private
     * @param {Array<{score: number, timestamp: Date}>} performances - Performances de l'utilisateur
     * @returns {{average: number, confidence: number}} - Score moyen pondéré et niveau de confiance
     * @description Calcule un score moyen pondéré en donnant plus d'importance aux performances récentes
     */
    private calculateWeightedScores(performances: Array<{ score: number, timestamp: Date }>): { average: number, confidence: number } {
        let weightedSum = 0;
        let totalWeight = 0;
        const now = new Date();

        // Trier par date (plus récent en dernier)
        const sortedPerformances = [...performances].sort(
            (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );

        // Donner plus de poids aux performances récentes
        for (let i = 0; i < sortedPerformances.length; i++) {
            const performance = sortedPerformances[i];
            const daysSince = (now.getTime() - performance.timestamp.getTime()) / (1000 * 60 * 60 * 24);

            // Poids basé sur la récence et la position dans la séquence
            const recencyWeight = Math.max(0.1, 1 - (daysSince / 30)); // Diminue avec le temps (30 jours comme référence)
            const positionWeight = (i + 1) / sortedPerformances.length; // Augmente pour les performances plus récentes

            const weight = (recencyWeight * 0.7) + (positionWeight * 0.3);
            weightedSum += performance.score * weight;
            totalWeight += weight;
        }

        const average = totalWeight > 0 ? weightedSum / totalWeight : 0;

        // Confiance basée sur le nombre de performances et leur récence
        const daysFromLastPerformance = performances.length > 0
            ? (now.getTime() - sortedPerformances[sortedPerformances.length - 1].timestamp.getTime()) / (1000 * 60 * 60 * 24)
            : 30;

        const recencyFactor = Math.max(0.1, 1 - (daysFromLastPerformance / 30));
        const countFactor = Math.min(1, performances.length / 10); // Maximum atteint à 10 performances

        const confidence = recencyFactor * 0.6 + countFactor * 0.4;

        return { average, confidence };
    }
}