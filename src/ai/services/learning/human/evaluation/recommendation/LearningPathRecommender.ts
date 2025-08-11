/**
 * @file src/ai/services/learning/human/evaluation/recommendation/LearningPathRecommender.ts
 * @description Recommandeur de parcours d'apprentissage
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { ConceptRelationshipGraph } from '../graphs/ConceptRelationshipGraph';
import { ConceptEvaluation, LearningGap } from '../types';

/**
 * @class LearningPathRecommender
 * @description Génère des recommandations de parcours d'apprentissage personnalisés
 */
export class LearningPathRecommender {
    private readonly logger = LoggerFactory.getLogger('LearningPathRecommender');
    private readonly conceptGraph: ConceptRelationshipGraph;

    /**
     * @constructor
     * @param {ConceptRelationshipGraph} conceptGraph - Graphe des relations entre concepts
     */
    constructor(conceptGraph: ConceptRelationshipGraph) {
        this.conceptGraph = conceptGraph;
        this.logger.info('LearningPathRecommender initialized');
    }

    /**
     * @method generateRecommendations
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {LearningGap[]} gaps - Lacunes identifiées
     * @param {ConceptEvaluation[]} evaluations - Évaluations des concepts
     * @returns {Promise<string[]>} - Recommandations de parcours d'apprentissage
     * @description Génère des recommandations de parcours d'apprentissage
     */
    public async generateRecommendations(
        userId: string,
        gaps: LearningGap[],
        evaluations: ConceptEvaluation[]
    ): Promise<string[]> {
        this.logger.debug(`Generating recommendations for user ${userId}`);

        try {
            // Concepts cibles prioritaires (basés sur les lacunes)
            const targetConcepts = gaps
                .sort((a, b) => b.priority - a.priority)
                .slice(0, 5)
                .map(gap => gap.conceptId);

            if (targetConcepts.length === 0) {
                // Si pas de lacunes identifiées, cibler les concepts avec les scores les plus bas
                const weakConcepts = evaluations
                    .filter(evaluation => evaluation.confidence > 0.5) // Uniquement les évaluations fiables
                    .sort((a, b) => a.score - b.score)
                    .slice(0, 3)
                    .map(evaluation => evaluation.conceptId);

                targetConcepts.push(...weakConcepts);
            }

            if (targetConcepts.length === 0) {
                // Toujours pas de cibles, recommander un parcours général
                return this.generateGeneralPath(evaluations);
            }

            // Génération du chemin d'apprentissage optimal
            const optimalPath = this.conceptGraph.getOptimalLearningPath(targetConcepts);

            // Limiter le nombre de recommandations (pour ne pas submerger l'utilisateur)
            return optimalPath.slice(0, 10);
        } catch (error) {
            this.logger.error(`Error generating recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return this.fallbackRecommendations();
        }
    }

    /**
     * @method generateGeneralPath
     * @private
     * @param {ConceptEvaluation[]} evaluations - Évaluations des concepts
     * @returns {string[]} - Recommandations générales
     * @description Génère un parcours d'apprentissage général
     */
    private generateGeneralPath(evaluations: ConceptEvaluation[]): string[] {
        // Identifier les concepts déjà maîtrisés
        const masteredConcepts = new Set(
            evaluations
                .filter(evaluation => evaluation.score >= 80 && evaluation.confidence >= 0.7)
                .map(evaluation => evaluation.conceptId)
        );

        // Liste des concepts fondamentaux (exemple simplifié)
        const fundamentalConcepts = [
            'concept_basic_handshapes',
            'concept_spatial_reference',
            'concept_non_manual_markers',
            'concept_classifiers',
            'concept_verb_agreement'
        ];

        // Filtrer les concepts non maîtrisés
        const conceptsToLearn = fundamentalConcepts.filter(concept => !masteredConcepts.has(concept));

        // Si tous les concepts fondamentaux sont maîtrisés, recommander des concepts avancés
        if (conceptsToLearn.length === 0) {
            return [
                'concept_advanced_classifiers',
                'concept_complex_spatial_grammar',
                'concept_role_shifting',
                'concept_metaphorical_mapping',
                'concept_prosodic_features'
            ];
        }

        return conceptsToLearn;
    }

    /**
     * @method fallbackRecommendations
     * @private
     * @returns {string[]} - Recommandations par défaut
     * @description Fournit des recommandations par défaut en cas d'erreur
     */
    private fallbackRecommendations(): string[] {
        return [
            'concept_basic_handshapes',
            'concept_spatial_reference',
            'concept_non_manual_markers'
        ];
    }
}