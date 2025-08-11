/**
 * @file src/ai/services/learning/LearningService.ts
 * @description Service principal du module d'apprentissage - façade unifiée pour l'accès
 * aux différents services d'apprentissage avec architecture orientée services.
 * @version 2.0.0
 * @since 2024
 */

import { LearningServiceRegistry } from '@/ai/services/learning/registry/LearningServiceRegistry';
import { EventBus } from '@/ai/services/shared/events/EventBus';
import type {
    LearningServiceConfig,
    ServiceHealthStatus
} from '@/ai/services/learning/types';
import type {
    LearningSession,
    LearningModule,
    LearningProgress,
    ProgressUpdateSummary
} from '@/ai/services/learning/types/LearningExtensions';
import type { UserReverseProfile } from '@/ai/services/learning/human/coda/codavirtuel/types';
import type { Exercise } from '@/ai/services/learning/human/coda/codavirtuel/exercises/ExerciseGeneratorService';

// Services spécialisés
import { ModuleManagerService } from '@/ai/services/learning/human/modules/ModuleManagerService';
import { BadgeManagerService } from '@/ai/services/learning/human/badges/BadgeManagerService';
import { ProgressManagerService } from '@/ai/services/learning/human/progress/ProgressManagerService';

// Gestionnaires principaux
import { LearningServiceInitializer } from './LearningServiceInitializer';
import { SessionManager } from './SessionManager';
import { ExerciseManager } from './ExerciseManager';

// Utilitaires
import { MetricsCollector } from './registry/utils/MetricsCollector';
import { LearningLogger } from './utils/logger';

/**
 * Interface pour les résultats d'évaluation étendus avec gamification
 */
export interface ExtendedEvaluationResult {
    /** Score obtenu (0-100) */
    score: number;
    /** Feedback textuel */
    feedback: string;
    /** Réponse correcte ou non */
    correct: boolean;
    /** Recommandations pour l'amélioration */
    recommendations?: string[];
    /** Données de gamification */
    gamification?: {
        pointsEarned: number;
        achievements?: string[];
        levelUp?: boolean;
        newLevel?: number;
    };
}

/**
 * Options pour la génération d'exercices
 */
export interface ExerciseGenerationOptions {
    /** Type d'exercice spécifique */
    exerciseType?: string;
    /** Niveau de difficulté souhaité */
    difficulty?: number;
    /** Compétences à cibler */
    targetSkills?: string[];
    /** Durée maximale estimée (en minutes) */
    maxDuration?: number;
}

/**
 * @class LearningService
 * @description Service principal du module d'apprentissage implémentant le pattern Façade.
 * Coordonne les différents services spécialisés et fournit une interface unifiée.
 */
export class LearningService {
    private readonly registry: LearningServiceRegistry;
    private eventHandler: LearningEventHandler | undefined;
    private sessionManager: SessionManager | undefined;
    private exerciseManager: ExerciseManager | undefined;
    private readonly config: LearningServiceConfig;

    // Services spécialisés pour l'apprentissage humain
    private readonly moduleManager: ModuleManagerService;
    private readonly badgeManager: BadgeManagerService;
    private readonly progressManager: ProgressManagerService;
    private readonly metricsCollector: MetricsCollector;

    // Instance unique (Singleton)
    private static instance: LearningService | null = null;

    /**
     * Constructeur privé pour le pattern Singleton
     * @param config - Configuration partielle du service
     */
    private constructor(config: Partial<LearningServiceConfig> = {}) {
        // Configuration par défaut
        this.config = {
            useMockServices: false,
            enableReverseApprenticeship: true,
            enablePyramidIntegration: true,
            enableGamification: true,
            enableImmersiveEnvironments: false,
            defaultInitialLevel: 'A1',
            ...config
        };

        LearningLogger.info('Initialisation du LearningService');

        // Initialisation du registre de services
        this.registry = LearningServiceRegistry.getInstance();

        // Initialisation du collecteur de métriques
        this.metricsCollector = this.initializeMetricsCollector();

        // Initialisation des services spécialisés
        this.moduleManager = new ModuleManagerService(this.metricsCollector);
        this.badgeManager = new BadgeManagerService(this.metricsCollector);
        this.progressManager = new ProgressManagerService(
            this.moduleManager,
            this.badgeManager,
            this.metricsCollector
        );

        // Enregistrement des services dans le registre
        this.registerSpecializedServices();

        // Initialisation des services complémentaires
        this.initializeComplementaryServices();

        LearningLogger.info('LearningService initialisé avec succès');
    }

    /**
     * Obtient l'instance unique du service (Singleton)
     * @param config - Configuration du service
     * @returns Instance unique du service
     */
    public static getInstance(config: Partial<LearningServiceConfig> = {}): LearningService {
        if (!LearningService.instance) {
            LearningService.instance = new LearningService(config);
        }
        return LearningService.instance;
    }

    /**
     * Démarre une nouvelle session d'apprentissage
     * @param userId - Identifiant de l'utilisateur
     * @returns Identifiant de la session créée
     */
    public startLearningSession(userId: string): string {
        this.validateUserId(userId);

        if (!this.sessionManager) {
            throw new Error('SessionManager non initialisé');
        }

        const sessionId = this.sessionManager.startSession(userId);

        LearningLogger.info('Session d\'apprentissage démarrée', { userId, sessionId });
        return sessionId;
    }

    /**
     * Termine une session d'apprentissage
     * @param sessionId - Identifiant de la session
     * @returns Statistiques de la session terminée
     */
    public endLearningSession(sessionId: string): LearningSession | undefined {
        if (!this.sessionManager) {
            throw new Error('SessionManager non initialisé');
        }

        const sessionStats = this.sessionManager.endSession(sessionId);

        if (sessionStats) {
            LearningLogger.info('Session d\'apprentissage terminée', {
                sessionId,
                metrics: sessionStats.metrics
            });
        }

        return sessionStats;
    }

    /**
     * Génère un exercice adapté pour un utilisateur
     * @param userId - Identifiant de l'utilisateur
     * @param sessionId - Identifiant de la session
     * @param options - Options de génération (optionnel)
     * @returns Exercice généré
     */
    public async generateExercise(
        userId: string,
        sessionId: string,
        options: ExerciseGenerationOptions = {}
    ): Promise<Exercise> {
        this.validateUserId(userId);

        if (!this.exerciseManager) {
            throw new Error('ExerciseManager non initialisé');
        }

        return this.exerciseManager.generateExercise(
            userId,
            sessionId,
            options.exerciseType
        );
    }

    /**
     * Évalue la réponse d'un utilisateur à un exercice
     * @param userId - Identifiant de l'utilisateur
     * @param sessionId - Identifiant de la session
     * @param exerciseId - Identifiant de l'exercice
     * @param response - Réponse de l'utilisateur
     * @returns Résultat de l'évaluation avec données de gamification
     */
    public async evaluateResponse(
        userId: string,
        sessionId: string,
        exerciseId: string,
        response: unknown
    ): Promise<ExtendedEvaluationResult> {
        this.validateUserId(userId);

        if (!this.exerciseManager) {
            throw new Error('ExerciseManager non initialisé');
        }

        return this.exerciseManager.evaluateResponse(
            userId,
            sessionId,
            exerciseId,
            response
        );
    }

    /**
     * Met à jour la progression d'un module pour un utilisateur
     * @param userId - Identifiant de l'utilisateur
     * @param moduleId - Identifiant du module
     * @param progress - Nouvelle valeur de progression (0-100)
     * @returns Résumé complet des changements ou undefined si utilisateur inexistant
     */
    public updateModuleProgress(
        userId: string,
        moduleId: string,
        progress: number
    ): ProgressUpdateSummary | undefined {
        this.validateUserId(userId);

        const userProgress = this.getUserProgress(userId);
        if (!userProgress) {
            LearningLogger.warn('Utilisateur inexistant pour mise à jour progression', { userId });
            return undefined;
        }

        const updateSummary = this.progressManager.updateModuleProgress(
            userProgress,
            moduleId,
            progress
        );

        // Sauvegarder la progression mise à jour (à implémenter selon le système de stockage)
        this.saveUserProgress(updateSummary.updatedProgress);

        return updateSummary;
    }

    /**
     * Récupère les modules recommandés pour un utilisateur
     * @param userId - Identifiant de l'utilisateur
     * @param count - Nombre de recommandations (défaut: 3)
     * @returns Modules recommandés
     */
    public getRecommendedModules(userId: string, count = 3): LearningModule[] {
        this.validateUserId(userId);

        const userProgress = this.getUserProgress(userId);
        if (!userProgress) {
            LearningLogger.warn('Utilisateur inexistant pour recommandations', { userId });
            return [];
        }

        return this.moduleManager.getRecommendedModules(userProgress, count);
    }

    /**
     * Crée une nouvelle progression pour un utilisateur
     * @param userId - Identifiant de l'utilisateur
     * @returns Nouvelle progression utilisateur
     */
    public createNewUserProgress(userId: string): LearningProgress {
        this.validateUserId(userId);

        const newProgress = this.progressManager.createNewUserProgress(userId);
        this.saveUserProgress(newProgress);

        return newProgress;
    }

    /**
     * Évalue le niveau global d'un utilisateur
     * @param userId - Identifiant de l'utilisateur
     * @returns Résultat de l'évaluation de niveau
     */
    public async evaluateUserLevel(userId: string): Promise<unknown> {
        this.validateUserId(userId);

        if (!this.exerciseManager) {
            throw new Error('ExerciseManager non initialisé');
        }

        return this.exerciseManager.evaluateUserLevel(userId);
    }

    /**
     * Récupère le profil d'apprentissage d'un utilisateur
     * @param userId - Identifiant de l'utilisateur
     * @returns Profil d'apprentissage
     */
    public async getUserProfile(userId: string): Promise<UserReverseProfile | undefined> {
        this.validateUserId(userId);

        if (!this.exerciseManager) {
            throw new Error('ExerciseManager non initialisé');
        }

        return this.exerciseManager.getUserProfile(userId);
    }

    /**
     * Récupère les statistiques d'une session active
     * @param sessionId - Identifiant de la session
     * @returns Statistiques de la session
     */
    public getSessionStats(sessionId: string): LearningSession | undefined {
        if (!this.sessionManager) {
            throw new Error('SessionManager non initialisé');
        }

        return this.sessionManager.getSessionStats(sessionId);
    }

    /**
     * Récupère la progression d'un utilisateur
     * @param userId - Identifiant de l'utilisateur
     * @returns Progression de l'utilisateur ou undefined si non trouvée
     */
    public getUserProgress(userId: string): LearningProgress | undefined {
        // TODO: Implémenter l'accès aux données de progression selon le système de stockage
        // Cette méthode devrait accéder à une base de données ou un service de stockage
        LearningLogger.debug('Récupération progression utilisateur', { userId });
        return undefined;
    }

    /**
     * Accès direct au service de gestion des modules
     * @returns Service de gestion des modules
     */
    public getModuleManager(): ModuleManagerService {
        return this.moduleManager;
    }

    /**
     * Accès direct au service de gestion des badges
     * @returns Service de gestion des badges
     */
    public getBadgeManager(): BadgeManagerService {
        return this.badgeManager;
    }

    /**
     * Accès direct au service de gestion de progression
     * @returns Service de gestion de progression
     */
    public getProgressManager(): ProgressManagerService {
        return this.progressManager;
    }

    /**
     * Récupère la liste des services enregistrés
     * @returns Liste des noms de services
     */
    public getRegisteredServices(): string[] {
        return this.registry.getAllServiceNames();
    }

    /**
     * Vérifie la santé de tous les services
     * @returns État de santé des services
     */
    public checkHealth(): ServiceHealthStatus {
        return this.registry.checkAllServicesHealth();
    }

    /**
     * Arrête proprement le service et libère les ressources
     * @returns Promise résolue quand le service est arrêté
     */
    public async shutdown(): Promise<void> {
        LearningLogger.info('Arrêt du service d\'apprentissage...');

        try {
            // Nettoyage des ressources
            if (this.sessionManager) {
                // Note: endAllSessions n'existe pas dans SessionManager,
                // donc on passe pour l'instant
                LearningLogger.debug('SessionManager présent mais endAllSessions non implémenté');
            }

            // Réinitialiser l'instance singleton
            LearningService.instance = null;

            LearningLogger.info('Service d\'apprentissage arrêté avec succès');
        } catch (error) {
            LearningLogger.error('Erreur lors de l\'arrêt du service', error);
            throw error;
        }
    }

    /**
     * Initialise le collecteur de métriques
     * @returns Instance du collecteur de métriques
     */
    private initializeMetricsCollector(): MetricsCollector {
        let metricsCollector = this.registry.getService('metricsCollector') as MetricsCollector;

        if (!metricsCollector) {
            metricsCollector = new MetricsCollector();
            this.registry.registerService('metricsCollector', metricsCollector);
        }

        return metricsCollector;
    }

    /**
     * Enregistre les services spécialisés dans le registre
     */
    private registerSpecializedServices(): void {
        this.registry.registerService('human.moduleManager', this.moduleManager);
        this.registry.registerService('human.badgeManager', this.badgeManager);
        this.registry.registerService('human.progressManager', this.progressManager);

        LearningLogger.debug('Services spécialisés enregistrés dans le registre');
    }

    /**
     * Initialise les services complémentaires
     */
    private initializeComplementaryServices(): void {
        // Initialisation des services via l'initialiseur
        const initializer = new LearningServiceInitializer(this.config, this.registry);
        initializer.initializeServices();

        // Configuration des gestionnaires d'événements
        const eventBus = EventBus.getInstance();

        // Note: LearningEventHandler n'est pas disponible actuellement
        // this.eventHandler = new LearningEventHandler(this.registry, eventBus, this.config);

        this.sessionManager = new SessionManager(this.registry, eventBus);
        this.exerciseManager = new ExerciseManager(this.registry, eventBus, this.config);

        // Synchronisation des sessions si eventHandler est disponible
        if (this.eventHandler && this.sessionManager) {
            this.sessionManager.setActiveSessions(this.eventHandler.getActiveSessions());
        }
    }

    /**
     * Valide un identifiant utilisateur
     * @param userId - Identifiant à valider
     * @throws {Error} Si l'identifiant est invalide
     */
    private validateUserId(userId: string): void {
        if (!userId?.trim()) {
            throw new Error('L\'identifiant utilisateur ne peut pas être vide');
        }
    }

    /**
     * Sauvegarde la progression d'un utilisateur
     * @param progress - Progression à sauvegarder
     * @todo Implémenter selon le système de stockage choisi
     */
    private saveUserProgress(progress: LearningProgress): void {
        // TODO: Implémenter la sauvegarde selon le système de stockage
        // (base de données, API, fichier, etc.)
        LearningLogger.debug('Sauvegarde progression utilisateur', {
            userId: progress.userId,
            level: progress.level,
            totalExperience: progress.totalExperience
        });
    }
}

/**
 * Instance globale du service d'apprentissage (factory function)
 * @param config - Configuration optionnelle
 * @returns Instance unique du service
 */
export const learningService = (config?: Partial<LearningServiceConfig>): LearningService => {
    return LearningService.getInstance(config);
};

/**
 * Fonction utilitaire pour récupérer l'instance par défaut
 */
export const getLearningService = (): LearningService => {
    return LearningService.getInstance();
};

// Export par défaut
export default LearningService;