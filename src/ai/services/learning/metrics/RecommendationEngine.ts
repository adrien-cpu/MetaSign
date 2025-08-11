/**
 * @file src/ai/services/learning/metrics/RecommendationEngine.ts
 * @description Moteur de recommandation pour le système d'apprentissage
 */

import { LoggerFactory } from '@utils/LoggerFactory';
import {
    IRecommendationEngine,
    ConceptRecommendation
} from './interfaces/MetricsInterfaces';
import { MetricsStore } from './MetricsStore';
import { ProgressTracker } from './ProgressTracker';

/**
 * Classe responsable de la génération de recommandations d'apprentissage
 */
export class RecommendationEngine implements IRecommendationEngine {
    private static instance: RecommendationEngine;
    private readonly logger = LoggerFactory.getLogger('RecommendationEngine');
    private readonly metricsStore: MetricsStore;
    private readonly progressTracker: ProgressTracker;

    /**
     * @constructor
     * @private
     */
    private constructor() {
        this.logger.info('Initializing RecommendationEngine...');
        this.metricsStore = MetricsStore.getInstance();
        this.progressTracker = ProgressTracker.getInstance();
    }

    /**
     * Récupère ou crée l'instance du service (pattern Singleton)
     * @returns Instance unique du service
     */
    public static getInstance(): RecommendationEngine {
        if (!RecommendationEngine.instance) {
            RecommendationEngine.instance = new RecommendationEngine();
        }

        return RecommendationEngine.instance;
    }

    /**
     * Recommande les prochains concepts à étudier
     * @param userId ID de l'utilisateur
     * @param count Nombre de recommandations (défaut: 3)
     * @returns Liste des concepts recommandés
     */
    public recommendNextConcepts(userId: string, count = 3): ConceptRecommendation[] {
        this.logger.info(`Recommending next concepts for user ${userId}`);

        try {
            // Récupérer tous les concepts pratiqués par l'utilisateur
            const practicedConcepts = this.metricsStore.getPracticedConcepts(userId);

            // Si aucun concept n'a été pratiqué, retourner une liste vide
            if (practicedConcepts.length === 0) {
                return [];
            }

            // Créer les recommandations pour chaque concept
            const conceptRecommendations = practicedConcepts.map(conceptId => {
                const mastery = this.progressTracker.getConceptMastery(userId, conceptId);
                const lastPracticed = this.metricsStore.getLastPracticeDate(userId, conceptId);

                // Pas de dernière pratique, ne pas recommander
                if (!lastPracticed) {
                    return { conceptId, reason: '', priority: 0 };
                }

                const daysSinceLastPractice = Math.floor(
                    (Date.now() - lastPracticed.getTime()) / (24 * 3600 * 1000)
                );

                // Calculer la priorité
                const priority = this.calculatePriority(mastery, daysSinceLastPractice, conceptId);

                // Générer la raison de la recommandation
                const reason = this.generateRecommendationReason(mastery, daysSinceLastPractice, conceptId);

                return {
                    conceptId,
                    reason,
                    priority
                };
            });

            // Filtrer les recommandations vides et trier par priorité
            return conceptRecommendations
                .filter(rec => rec.priority > 0)
                .sort((a, b) => b.priority - a.priority)
                .slice(0, count);
        } catch (error) {
            this.logger.error(`Error recommending next concepts: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return [];
        }
    }

    /**
     * Recommande des concepts liés à un concept spécifique
     * @param conceptId ID du concept
     * @param count Nombre de recommandations (défaut: 3)
     * @returns Liste des concepts recommandés
     */
    public recommendRelatedConcepts(conceptId: string, count = 3): string[] {
        // Note: Dans une implémentation réelle, cela nécessiterait une base de données
        // de relations entre concepts ou un algorithme d'apprentissage automatique

        // Simuler quelques concepts liés
        const relatedConceptsMap: Record<string, string[]> = {
            'greetings': ['introductions', 'courtesy', 'farewells'],
            'questions-forms': ['wh-questions', 'yes-no-questions', 'rhetorical-questions'],
            'facial-expressions': ['emotional-expressions', 'intensity', 'mood-indicators'],
            'spatial-grammar': ['referencing', 'loci', 'directional-verbs']
        };

        return (relatedConceptsMap[conceptId] || []).slice(0, count);
    }

    /**
     * Recommande des exercices pour un concept et un utilisateur spécifiques
     * @param userId ID de l'utilisateur
     * @param conceptId ID du concept
     * @param count Nombre de recommandations (défaut: 3)
     * @returns Liste des types d'exercices recommandés
     */
    public recommendExerciseTypes(userId: string, conceptId: string, count = 3): string[] {
        const mastery = this.progressTracker.getConceptMastery(userId, conceptId);

        // Recommander différents types d'exercices selon le niveau de maîtrise
        if (mastery < 0.3) {
            // Pour les débutants, privilégier les exercices de reconnaissance
            return ['multiple-choice', 'drag-drop', 'fill-blank'].slice(0, count);
        } else if (mastery < 0.7) {
            // Pour les intermédiaires, mélanger reconnaissance et production
            return ['drag-drop', 'fill-blank', 'text-entry'].slice(0, count);
        } else {
            // Pour les avancés, privilégier les exercices de production
            return ['text-entry', 'video-response', 'signing-practice'].slice(0, count);
        }
    }

    /**
     * Calcule la priorité d'un concept pour les recommandations
     * @param mastery Niveau de maîtrise
     * @param daysSinceLastPractice Jours depuis la dernière pratique
     * @param conceptId ID du concept
     * @returns Priorité (0-1)
     * @private
     */
    private calculatePriority(mastery: number, daysSinceLastPractice: number, conceptId: string): number {
        // Facteurs de priorité:

        // 1. Faible maîtrise (plus de priorité si la maîtrise est faible)
        const masteryFactor = 1 - mastery;

        // 2. Temps écoulé depuis la dernière pratique (courbe d'oubli)
        const forgettingFactor = Math.min(1, daysSinceLastPractice / 30); // Augmente avec le temps, max 1

        // 3. Importance du concept (simulé ici)
        const importanceFactor = this.getConceptImportance(conceptId);

        // Calcul de la priorité (pondéré)
        return (
            0.5 * masteryFactor +       // 50% importance de la maîtrise
            0.3 * forgettingFactor +    // 30% importance de l'oubli
            0.2 * importanceFactor      // 20% importance du concept
        );
    }

    /**
     * Génère la raison d'une recommandation
     * @param mastery Niveau de maîtrise
     * @param daysSinceLastPractice Jours depuis la dernière pratique
     * @param conceptId ID du concept
     * @returns Raison de la recommandation
     * @private
     */
    private generateRecommendationReason(mastery: number, daysSinceLastPractice: number, conceptId: string): string {
        // Calculer le facteur d'oubli, comme dans calculatePriority
        const forgettingFactor = Math.min(1, daysSinceLastPractice / 30);

        // Raison principale de la recommandation
        if (mastery < 0.4) {
            return 'Vous avez besoin de renforcer ce concept';
        } else if (forgettingFactor > 0.7) {
            return 'Il est temps de réviser ce concept';
        } else if (this.getConceptImportance(conceptId) > 0.8) {
            return 'Ce concept est fondamental pour votre progression';
        } else {
            return 'Ce concept est important pour votre apprentissage';
        }
    }

    /**
     * Obtient l'importance d'un concept
     * @param conceptId ID du concept
     * @returns Importance (0-1)
     * @private
     */
    private getConceptImportance(conceptId: string): number {
        // Note: Dans une implémentation réelle, cela viendrait d'une source de données
        // Simuler des valeurs d'importance
        const importanceMap: Record<string, number> = {
            'greetings': 0.9,
            'questions-forms': 0.8,
            'facial-expressions': 0.85,
            'spatial-grammar': 0.95
        };

        return importanceMap[conceptId] || 0.7; // Valeur par défaut
    }
}