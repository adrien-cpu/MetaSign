/**
 * @file src/ai/services/learning/machine/adaptative/interfaces/IAdaptiveLearningSystem.ts
 * @description Interface pour le système d'apprentissage adaptatif MetaSign
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.1.0
 * @since 2024
 * @lastModified 2025-01-15
 */

// Types importés depuis le fichier principal qui les définit
import type {
    LearningContext,
    LearningActivity,
    UserPerformanceData,
    LearningPlan,
    PathAdjustment,
    AssistanceContent
} from '../AdaptiveLearningSystem';

/**
 * Interface principale pour le système d'apprentissage adaptatif
 * Définit les méthodes essentielles pour personnaliser l'expérience d'apprentissage
 */
export interface IAdaptiveLearningSystem {
    /**
     * Initialise le système pour un utilisateur spécifique
     * @param userId - Identifiant unique de l'utilisateur
     * @throws {Error} Si l'initialisation échoue
     */
    initialize(userId: string): Promise<void>;

    /**
     * Génère un plan d'apprentissage personnalisé pour l'utilisateur
     * @param userId - Identifiant unique de l'utilisateur
     * @returns Plan d'apprentissage adapté aux besoins de l'utilisateur
     * @throws {Error} Si la génération du plan échoue
     */
    generateLearningPlan(userId: string): Promise<LearningPlan>;

    /**
     * Adapte le contenu en fonction du contexte d'apprentissage
     * @param userId - Identifiant unique de l'utilisateur
     * @param context - Contexte actuel d'apprentissage
     * @returns Liste d'activités adaptées au contexte et au profil utilisateur
     * @throws {Error} Si l'adaptation du contenu échoue
     */
    adaptContent(userId: string, context: LearningContext): Promise<LearningActivity[]>;

    /**
     * Ajuste le parcours d'apprentissage en fonction des performances
     * @param userId - Identifiant unique de l'utilisateur
     * @param performance - Données de performance de l'utilisateur
     * @returns Ajustements recommandés pour le parcours
     * @throws {Error} Si l'ajustement du parcours échoue
     */
    adjustLearningPath(userId: string, performance: UserPerformanceData): Promise<PathAdjustment>;

    /**
     * Fournit une assistance en temps réel
     * @param userId - Identifiant unique de l'utilisateur
     * @param context - Contexte actuel d'apprentissage
     * @returns Contenu d'assistance contextuel
     * @throws {Error} Si la fourniture d'assistance échoue
     */
    provideRealTimeAssistance(userId: string, context: LearningContext): Promise<AssistanceContent>;
}