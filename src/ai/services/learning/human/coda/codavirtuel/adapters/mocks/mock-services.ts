/**
 * @file src/ai/services/learning/human/coda/codavirtuel/adapters/mocks/mock-services.ts
 * @description Services mock pour les tests et le développement
 */

import {
    EngagementMetrics,
    UserInteraction,
    FrustrationLevel,
    LearningContext,
    PaceAdjustment,
    AssistanceResult,
    ExtendedUserProfile,
    ProfilType
} from '../types';

/**
 * Service de surveillance de l'engagement utilisateur
 */
export class EngagementMonitor {
    /**
     * Analyse l'engagement d'un utilisateur
     * 
     * @param userId Identifiant de l'utilisateur
     * @param interactions Interactions récentes
     * @returns Métriques d'engagement calculées
     */
    analyze(userId: string, interactions: UserInteraction[]): EngagementMetrics {
        console.log(`Analyzing engagement for user ${userId} with ${interactions.length} interactions`);
        return {
            overallEngagement: 0.75,
            attentionSpan: 120,
            interactionPatterns: {
                frequency: 5,
                variety: 0.6,
                quality: 0.7
            },
            focusLevel: 0.8,
            timestamp: new Date()
        };
    }
}

/**
 * Service de détection de frustration
 */
export class FrustrationDetector {
    /**
     * Détecte le niveau de frustration
     * 
     * @param userId Identifiant de l'utilisateur
     * @param interactions Interactions récentes
     * @returns Niveau de frustration détecté
     */
    detect(userId: string, interactions: UserInteraction[]): FrustrationLevel {
        console.log(`Detecting frustration for user ${userId} with ${interactions.length} interactions`);
        return FrustrationLevel.MEDIUM;
    }
}

/**
 * Service d'ajustement de rythme
 */
export class PaceAdjuster {
    /**
     * Ajuste le rythme d'apprentissage
     * 
     * @param userId Identifiant de l'utilisateur
     * @param context Contexte d'apprentissage
     * @returns Ajustement de rythme recommandé
     */
    adjust(userId: string, context: LearningContext): PaceAdjustment {
        console.log(`Adjusting pace for user ${userId} in context ${context.activityId}`);
        return {
            currentPace: 5,
            recommendedPace: 5,
            reasoning: "Maintien du rythme actuel",
            estimatedImpact: {
                onEngagement: 0,
                onComprehension: 0,
                onCompletion: 0
            }
        };
    }
}

/**
 * Service de fourniture d'assistance
 */
export class AssistanceProvider {
    /**
     * Fournit de l'assistance contextuelle
     * 
     * @param context Contexte d'apprentissage
     * @param profile Profil utilisateur
     * @returns Résultat d'assistance
     */
    async provideAssistance(context: LearningContext, profile: ExtendedUserProfile): Promise<AssistanceResult> {
        console.log(`Providing assistance in context ${context.activityId} for profile ${profile.id || profile.userId}`);
        return {
            type: 'encouragement',
            content: "Continuez vos efforts, vous progressez bien !",
            priority: 3,
            dismissible: true
        };
    }
}

/**
 * Service de récupération des interactions
 */
export class InteractionService {
    /**
     * Récupère les interactions récentes
     * 
     * @param userId Identifiant de l'utilisateur
     * @returns Liste des interactions récentes
     */
    async getRecentInteractions(userId: string): Promise<UserInteraction[]> {
        console.log(`Getting recent interactions for user ${userId}`);
        return [];
    }
}

/**
 * Fabrique de loggers
 */
export class LoggerFactory {
    /**
     * Récupère un logger
     * 
     * @param name Nom du logger
     * @returns Instance de logger
     */
    static getLogger(name: string): Logger {
        return new Logger(name);
    }
}

/**
 * Service de logging
 */
export class Logger {
    /**
     * Crée une nouvelle instance de logger
     * 
     * @param name Nom du logger
     */
    constructor(private name: string) { }

    /**
     * Enregistre un message de niveau info
     * 
     * @param message Message à logger
     * @param data Données additionnelles
     */
    info(message: string, data?: Record<string, unknown>): void {
        console.log(`[INFO] ${this.name}: ${message}`, data || '');
    }

    /**
     * Enregistre un message de niveau erreur
     * 
     * @param message Message d'erreur
     * @param data Données additionnelles
     */
    error(message: string, data?: Record<string, unknown>): void {
        console.error(`[ERROR] ${this.name}: ${message}`, data || '');
    }
}

/**
 * Service de gestion des profils utilisateur
 */
export class UserProfileManager {
    /**
     * Récupère le profil d'un utilisateur
     * 
     * @param userId Identifiant de l'utilisateur
     * @returns Profil utilisateur
     */
    async getUserProfile(userId: string): Promise<ExtendedUserProfile> {
        console.log(`Getting user profile for ${userId}`);
        return {
            id: userId,
            userId: userId,
            profilType: ProfilType.ENTENDANT,
            learningPreferences: {
                preferredContentTypes: [],
                preferredPace: 'moderate',
                preferredFeedbackFrequency: 'medium'
            },
            skillLevels: {},
            completedCourses: [],
            inProgressCourses: [],
            badges: [],
            experience: 0,
            level: 1,
            lastActive: new Date(),
            preferredEnvironments: [],
            hasFederatedLearningConsent: false
        };
    }
}