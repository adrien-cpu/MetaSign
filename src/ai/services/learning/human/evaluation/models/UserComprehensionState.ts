/**
 * @file src/ai/services/learning/human/evaluation/models/UserComprehensionState.ts
 * @description Modèle représentant l'état de compréhension d'un utilisateur
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * @interface ConceptPerformance
 * @description Performance d'un utilisateur pour un concept spécifique
 */
interface ConceptPerformance {
    /**
     * Identifiant du concept
     */
    conceptId: string;

    /**
     * Score obtenu
     */
    score: number;

    /**
     * Date de la performance
     */
    timestamp: Date;

    /**
     * Contexte de la performance (exercice, évaluation, etc.)
     */
    context?: string;
}

/**
 * @interface UserPerformance
 * @description Performances d'un utilisateur
 */
interface UserPerformance {
    /**
     * Identifiant de l'utilisateur
     */
    userId: string;

    /**
     * Performances par concept
     */
    performances: ConceptPerformance[];
}

/**
 * @class UserComprehensionState
 * @description Représente l'état de compréhension d'un utilisateur pour tous les concepts
 */
export class UserComprehensionState {
    private readonly logger = LoggerFactory.getLogger('UserComprehensionState');
    private readonly performances: Map<string, ConceptPerformance[]>;
    private readonly userIdentifier: string;

    /**
     * @constructor
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {UserPerformance} userPerformance - Performances de l'utilisateur
     */
    constructor(userId: string, userPerformance: UserPerformance) {
        this.userIdentifier = userId;
        this.performances = new Map();

        // Organiser les performances par concept
        for (const performance of userPerformance.performances) {
            this.addPerformance(performance);
        }

        this.logger.debug(`Created comprehension state for user ${userId} with ${userPerformance.performances.length} performances`);
    }

    /**
     * @method addPerformance
     * @param {ConceptPerformance} performance - Performance à ajouter
     * @returns {void}
     * @description Ajoute une performance au modèle
     */
    public addPerformance(performance: ConceptPerformance): void {
        const conceptId = performance.conceptId;

        if (!this.performances.has(conceptId)) {
            this.performances.set(conceptId, []);
        }

        this.performances.get(conceptId)!.push(performance);
    }

    /**
     * @method getConceptPerformances
     * @param {string} conceptId - Identifiant du concept
     * @returns {ConceptPerformance[]} - Performances pour ce concept
     * @description Récupère toutes les performances liées à un concept
     */
    public getConceptPerformances(conceptId: string): ConceptPerformance[] {
        return this.performances.get(conceptId) || [];
    }

    /**
     * @method getLatestPerformance
     * @param {string} conceptId - Identifiant du concept
     * @returns {ConceptPerformance | null} - Dernière performance ou null si aucune
     * @description Récupère la performance la plus récente pour un concept
     */
    public getLatestPerformance(conceptId: string): ConceptPerformance | null {
        const performances = this.getConceptPerformances(conceptId);

        if (performances.length === 0) {
            return null;
        }

        return performances.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
    }

    /**
     * @method getAverageScore
     * @param {string} conceptId - Identifiant du concept
     * @returns {number} - Score moyen ou 0 si aucune performance
     * @description Calcule le score moyen pour un concept
     */
    public getAverageScore(conceptId: string): number {
        const performances = this.getConceptPerformances(conceptId);

        if (performances.length === 0) {
            return 0;
        }

        const totalScore = performances.reduce((sum, perf) => sum + perf.score, 0);
        return totalScore / performances.length;
    }

    /**
     * @method getAllConceptIds
     * @returns {string[]} - Identifiants de tous les concepts avec des performances
     * @description Récupère les identifiants de tous les concepts avec des performances
     */
    public getAllConceptIds(): string[] {
        return Array.from(this.performances.keys());
    }

    /**
     * @method getUserId
     * @returns {string} - Identifiant de l'utilisateur
     * @description Récupère l'identifiant de l'utilisateur associé à cet état de compréhension
     */
    public getUserId(): string {
        return this.userIdentifier;
    }
}