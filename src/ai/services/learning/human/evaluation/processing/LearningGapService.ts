/**
 * @file src/ai/services/learning/human/evaluation/processing/LearningGapService.ts
 * @description Service de gestion des lacunes d'apprentissage
 * @module LearningGapService
 * 
 * Ce module identifie et gère les lacunes d'apprentissage des utilisateurs
 * dans le système MetaSign, en analysant leurs performances et en recommandant
 * des ressources adaptées pour combler ces lacunes.
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { UserPerformanceRepository } from '@/ai/services/learning/human/evaluation/repositories/UserPerformanceRepository';
import { ConceptRepository, LearningResource } from '@/ai/services/learning/human/coda/codavirtuel/evaluators/repositories/ConceptRepository';
import { LearningGap } from '@/ai/services/learning/human/evaluation/types';

/**
 * Liste des concepts considérés comme critiques pour l'apprentissage de la LSF
 * @constant {string[]}
 */
const CRITICAL_CONCEPTS: readonly string[] = [
    'concept_spatial_reference',
    'concept_grammar_role_shifting',
    'concept_classifiers',
    'concept_non_manual_markers',
    'concept_conditional_structures'
] as const;

/**
 * Interface étendue pour les ressources avec des propriétés optionnelles supplémentaires
 * 
 * @interface ExtendedLearningResource
 * @extends {LearningResource}
 * @private
 * @description Étend l'interface LearningResource avec des propriétés optionnelles
 * qui peuvent être ajoutées par d'autres services ou modules pour enrichir les ressources
 */
interface ExtendedLearningResource extends LearningResource {
    /**
     * Score de pertinence calculé dynamiquement (0-100)
     */
    relevanceScore?: number;

    /**
     * Date de dernière mise à jour de la ressource
     */
    updatedAt?: Date | string;
}

/**
 * Service de gestion des lacunes d'apprentissage
 * 
 * @class LearningGapService
 * @description Service responsable de l'identification et de la gestion des lacunes
 * d'apprentissage en analysant les performances des utilisateurs et en recommandant
 * des ressources pédagogiques adaptées.
 * 
 * @example
 * ```typescript
 * const gapService = new LearningGapService(conceptRepo, performanceRepo);
 * const gaps = await gapService.identifyPotentialGaps(userId, conceptIds, masteryScores);
 * ```
 */
export class LearningGapService {
    private readonly logger = LoggerFactory.getLogger('LearningGapService');

    /**
     * Seuil de maîtrise par défaut pour identifier une lacune
     * @private
     * @readonly
     */
    private readonly DEFAULT_MASTERY_THRESHOLD = 70;

    /**
     * Nombre maximum de ressources à recommander par lacune
     * @private
     * @readonly
     */
    private readonly MAX_RECOMMENDED_RESOURCES = 3;

    /**
     * Constructeur du service de gestion des lacunes
     * 
     * @constructor
     * @param {ConceptRepository} conceptRepository - Référentiel de concepts LSF
     * @param {UserPerformanceRepository} userPerformanceRepository - Référentiel de performances utilisateur
     */
    constructor(
        private readonly conceptRepository: ConceptRepository,
        private readonly userPerformanceRepository: UserPerformanceRepository
    ) { }

    /**
     * Identifie les lacunes potentielles à partir des performances sur un exercice
     * 
     * @method identifyPotentialGaps
     * @async
     * @param {string} userId - Identifiant unique de l'utilisateur
     * @param {string[]} conceptIds - Liste des identifiants de concepts évalués
     * @param {Record<string, number>} conceptMastery - Niveaux de maîtrise des concepts (0-100)
     * @returns {Promise<LearningGap[]>} Liste des lacunes identifiées
     * 
     * @description Analyse les scores de maîtrise pour identifier les concepts
     * nécessitant un renforcement, en tenant compte des prérequis et de la criticité
     * 
     * @throws {Error} En cas d'erreur lors de l'accès aux données
     */
    public async identifyPotentialGaps(
        userId: string,
        conceptIds: string[],
        conceptMastery: Record<string, number>
    ): Promise<LearningGap[]> {
        // Validation des paramètres
        if (!userId || !conceptIds || conceptIds.length === 0) {
            this.logger.warn('Invalid parameters provided to identifyPotentialGaps');
            return [];
        }

        // Filtrer d'abord les concepts avec des scores en dessous du seuil
        const lowMasteryConcepts = conceptIds.filter(
            id => (conceptMastery[id] ?? 0) < this.DEFAULT_MASTERY_THRESHOLD
        );

        if (lowMasteryConcepts.length === 0) {
            this.logger.info(`No learning gaps identified for user ${userId}`);
            return [];
        }

        // Traiter tous les concepts à maîtrise faible en parallèle pour de meilleures performances
        const gapPromises = lowMasteryConcepts.map(async (conceptId) => {
            return this.processConceptGap(
                userId,
                conceptId,
                conceptMastery[conceptId] ?? 0,
                this.DEFAULT_MASTERY_THRESHOLD
            );
        });

        // Attendre que toutes les promesses soient résolues
        const gapResults = await Promise.all(gapPromises);

        // Filtrer les résultats null avec un filtre explicite
        const validGaps: LearningGap[] = [];
        for (const gap of gapResults) {
            if (gap !== null) {
                validGaps.push(gap);
            }
        }

        this.logger.info(`Identified ${validGaps.length} learning gaps for user ${userId}`);

        return validGaps;
    }

    /**
     * Traite une lacune potentielle pour un concept spécifique
     * 
     * @method processConceptGap
     * @private
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {string} conceptId - Identifiant du concept
     * @param {number} masteryScore - Score de maîtrise actuel (0-100)
     * @param {number} masteryThreshold - Seuil de maîtrise requis
     * @returns {Promise<LearningGap | null>} Lacune d'apprentissage ou null si non applicable
     * 
     * @description Analyse en profondeur un concept spécifique, vérifie ses prérequis
     * et crée une structure de lacune avec recommandations
     */
    private async processConceptGap(
        userId: string,
        conceptId: string,
        masteryScore: number,
        masteryThreshold: number
    ): Promise<LearningGap | null> {
        try {
            // Identification du concept
            const concept = await this.conceptRepository.getConceptById(conceptId);

            if (!concept) {
                this.logger.warn(`Concept ${conceptId} not found in repository`);
                return null;
            }

            // Vérification des prérequis
            const prerequisites = concept.prerequisites ?? [];

            // Récupération des performances sur les prérequis en parallèle
            const prerequisitePerformances = await Promise.all(
                prerequisites.map(async (prereqId) => {
                    try {
                        const performances = await this.userPerformanceRepository.getConceptPerformance(
                            userId,
                            prereqId
                        );

                        const averageScore = performances.length > 0
                            ? performances.reduce((sum, p) => sum + (p.score ?? 0), 0) / performances.length
                            : 0;

                        return {
                            conceptId: prereqId,
                            averageScore
                        };
                    } catch (error) {
                        this.logger.warn(
                            `Error getting performances for prerequisite ${prereqId}: ${error instanceof Error ? error.message : 'Unknown error'
                            }`
                        );
                        return {
                            conceptId: prereqId,
                            averageScore: 0
                        };
                    }
                })
            );

            // Identification des prérequis faibles
            const weakPrerequisites = prerequisitePerformances
                .filter(p => p.averageScore < masteryThreshold)
                .map(p => p.conceptId);

            // Création de la lacune
            const gap: LearningGap = {
                conceptId,
                conceptName: concept.name,
                score: masteryScore,
                status: 'identified',
                priority: this.calculateGapPriority(conceptId, masteryScore, weakPrerequisites.length),
                weakPrerequisites,
                identifiedAt: new Date(),
                recommendedResources: await this.recommendResourcesForGap(conceptId, masteryScore)
            };

            return gap;
        } catch (error) {
            this.logger.error(
                `Error processing gap for concept ${conceptId}: ${error instanceof Error ? error.message : 'Unknown error'
                }`
            );
            return null;
        }
    }

    /**
     * Calcule la priorité d'une lacune d'apprentissage
     * 
     * @method calculateGapPriority
     * @private
     * @param {string} conceptId - Identifiant du concept
     * @param {number} masteryScore - Score de maîtrise actuel (0-100)
     * @param {number} weakPrerequisitesCount - Nombre de prérequis non maîtrisés
     * @returns {number} Priorité de la lacune (1-10, 10 étant le plus prioritaire)
     * 
     * @description Calcule une priorité basée sur le score de maîtrise,
     * le nombre de prérequis faibles et la criticité du concept
     */
    private calculateGapPriority(
        conceptId: string,
        masteryScore: number,
        weakPrerequisitesCount: number
    ): number {
        // Base de priorité inversement proportionnelle au score de maîtrise
        const basePriority = 10 - (masteryScore / 10);

        // Ajustement selon le nombre de prérequis faibles (0.5 point par prérequis)
        const prerequisiteAdjustment = Math.min(weakPrerequisitesCount * 0.5, 3);

        // Bonus pour les concepts critiques
        const criticalConceptBonus = this.isCriticalConcept(conceptId) ? 2 : 0;

        // Calcul de la priorité finale
        const priority = basePriority + prerequisiteAdjustment + criticalConceptBonus;

        // Garantir que la priorité reste dans la plage 1-10
        return Math.max(1, Math.min(10, Math.round(priority)));
    }

    /**
     * Détermine si un concept est considéré comme critique
     * 
     * @method isCriticalConcept
     * @private
     * @param {string} conceptId - Identifiant du concept
     * @returns {boolean} True si le concept est critique, false sinon
     * 
     * @description Vérifie si le concept fait partie de la liste des concepts
     * critiques pour la maîtrise de la LSF
     */
    private isCriticalConcept(conceptId: string): boolean {
        return CRITICAL_CONCEPTS.includes(conceptId);
    }

    /**
     * Recommande des ressources pédagogiques pour combler une lacune
     * 
     * @method recommendResourcesForGap
     * @async
     * @param {string} conceptId - Identifiant du concept
     * @param {number} masteryScore - Score de maîtrise actuel (0-100)
     * @returns {Promise<string[]>} Liste des identifiants de ressources recommandées
     * 
     * @description Sélectionne les ressources les plus appropriées en fonction
     * du niveau de maîtrise actuel de l'utilisateur
     * 
     * @example
     * ```typescript
     * const resources = await gapService.recommendResourcesForGap('concept_123', 45);
     * // Retourne des ressources de niveau intermédiaire
     * ```
     */
    public async recommendResourcesForGap(
        conceptId: string,
        masteryScore: number
    ): Promise<string[]> {
        try {
            // Récupération des ressources disponibles pour ce concept
            const resources = await this.conceptRepository.getConceptResources(conceptId);

            if (!resources || resources.length === 0) {
                this.logger.warn(`No resources found for concept ${conceptId}`);
                return [];
            }

            // Détermination du niveau de ressources basé sur le score de maîtrise
            const targetLevel = this.determineResourceLevel(masteryScore);

            // Filtrage des ressources pertinentes selon le niveau de maîtrise
            let filteredResources = resources.filter(r => r.level === targetLevel);

            // Si aucune ressource du niveau cible n'est disponible, utiliser toutes les ressources
            if (filteredResources.length === 0) {
                this.logger.warn(
                    `No resources of level '${targetLevel}' found for concept ${conceptId}, ` +
                    'using all available resources'
                );
                filteredResources = resources;
            }

            // Trier par pertinence (si disponible) et limiter le nombre
            const sortedResources = this.sortResourcesByRelevance(filteredResources);

            // Limiter au nombre maximum de ressources recommandées
            return sortedResources
                .slice(0, this.MAX_RECOMMENDED_RESOURCES)
                .map(r => r.id);
        } catch (error) {
            this.logger.error(
                `Error recommending resources: ${error instanceof Error ? error.message : 'Unknown error'
                }`
            );
            return [];
        }
    }

    /**
     * Détermine le niveau de ressource approprié selon le score de maîtrise
     * 
     * @method determineResourceLevel
     * @private
     * @param {number} masteryScore - Score de maîtrise (0-100)
     * @returns {string} Niveau de ressource ('beginner', 'intermediate', ou 'advanced')
     * 
     * @description Catégorise le niveau de ressource nécessaire en fonction
     * du score de maîtrise actuel
     */
    private determineResourceLevel(masteryScore: number): string {
        if (masteryScore < 40) {
            return 'beginner';
        } else if (masteryScore < 70) {
            return 'intermediate';
        } else {
            return 'advanced';
        }
    }

    /**
     * Trie les ressources par ordre de pertinence
     * 
     * @method sortResourcesByRelevance
     * @private
     * @param {LearningResource[]} resources - Liste des ressources à trier
     * @returns {LearningResource[]} Ressources triées par pertinence décroissante
     * 
     * @description Trie les ressources en privilégiant celles avec un score
     * de pertinence élevé ou une date de mise à jour récente
     */
    private sortResourcesByRelevance(resources: LearningResource[]): LearningResource[] {
        // Traiter les ressources comme ExtendedLearningResource pour accéder aux propriétés optionnelles
        const extendedResources = resources as ExtendedLearningResource[];

        return [...extendedResources].sort((a, b) => {
            // Priorité aux ressources avec un score de pertinence
            if (a.relevanceScore !== undefined && b.relevanceScore !== undefined) {
                return b.relevanceScore - a.relevanceScore;
            }

            // Sinon, priorité aux ressources les plus récentes
            if (a.updatedAt && b.updatedAt) {
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            }

            // Utiliser le niveau de difficulté comme critère secondaire
            if (a.difficulty !== undefined && b.difficulty !== undefined) {
                return a.difficulty - b.difficulty;
            }

            return 0;
        });
    }
}