/**
 * Interface pour les détecteurs de lacunes de compétences
 * 
 * @file src/ai/services/learning/human/evaluation/interfaces/ICompetencyGapDetector.ts
 * @description Définit l'interface commune pour tous les détecteurs de lacunes de compétences
 */

import { CompetencyGap, LearningContext, RecommendedActivity } from '@/ai/services/learning/types/learning-interfaces';

/**
 * Interface pour les détecteurs qui analysent les performances des utilisateurs
 * et identifient des lacunes dans leurs compétences
 */
export interface ICompetencyGapDetector {
    /**
     * Détecte les lacunes de compétences basées sur le contexte d'apprentissage
     * @param userId - Identifiant de l'utilisateur
     * @param context - Contexte d'apprentissage de l'utilisateur
     * @returns Promesse contenant la liste des lacunes de compétence identifiées
     */
    detectGaps(userId: string, context: LearningContext): Promise<CompetencyGap[]>;

    /**
     * Priorise les lacunes de compétence identifiées
     * @param gaps - Liste des lacunes à prioriser
     * @returns Promesse contenant la liste des lacunes priorisées
     */
    prioritizeGaps(gaps: CompetencyGap[]): Promise<CompetencyGap[]>;

    /**
     * Recommande des activités pour combler les lacunes identifiées
     * @param userId - Identifiant de l'utilisateur
     * @param gaps - Lacunes de compétences identifiées
     * @returns Promesse contenant les activités recommandées
     */
    recommendActivities(userId: string, gaps: CompetencyGap[]): Promise<RecommendedActivity[]>;

    /**
     * Obtient les informations sur le service de détection
     * @returns Informations sur le service (nom, version, fonctionnalités)
     */
    getServiceInfo(): { name: string, version: string, features: string[] };
}