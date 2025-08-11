/**
 * @file src/ai/services/learning/human/coda/codavirtuel/adapters/interfaces/IRealTimeAdapter.ts
 * @description Interface pour l'adaptateur d'apprentissage en temps réel
 */

import {
    EngagementMetrics,
    UserInteraction,
    FrustrationLevel,
    LearningContext,
    PaceAdjustment,
    AssistanceContent,
    PatternAnalysisResult
} from '../types';

/**
 * Interface définissant les méthodes publiques de l'adaptateur temps réel
 */
export interface IRealTimeAdapter {
    /**
     * Surveille l'engagement de l'utilisateur en temps réel
     * 
     * @param userId Identifiant de l'utilisateur
     * @returns Métriques d'engagement calculées
     */
    monitorEngagement(userId: string): Promise<EngagementMetrics>;

    /**
     * Détecte les signes de frustration
     * 
     * @param userId Identifiant de l'utilisateur
     * @param interactions Interactions récentes de l'utilisateur
     * @returns Niveau de frustration détecté
     */
    detectFrustration(userId: string, interactions: UserInteraction[]): Promise<FrustrationLevel>;

    /**
     * Ajuste le rythme d'apprentissage
     * 
     * @param userId Identifiant de l'utilisateur
     * @param context Contexte d'apprentissage actuel
     * @returns Ajustement de rythme recommandé
     */
    adjustPace(userId: string, context: LearningContext): Promise<PaceAdjustment>;

    /**
     * Fournit une assistance contextuelle
     * 
     * @param userId Identifiant de l'utilisateur
     * @param context Contexte d'apprentissage actuel
     * @returns Contenu d'assistance approprié
     */
    provideContextualAssistance(userId: string, context: LearningContext): Promise<AssistanceContent>;

    /**
     * Analyse les interactions pour détecter des patterns d'apprentissage
     * et fournir des recommandations en temps réel
     * 
     * @param userId Identifiant de l'utilisateur
     * @param timeRange Période d'analyse en secondes
     * @returns Résultat d'analyse des patterns
     */
    analyzeInteractionPatterns(userId: string, timeRange?: number): Promise<PatternAnalysisResult>;
}