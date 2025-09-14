/**
 * @file LearningServiceBridge.ts
 * @description Pont unifié entre l'UI React et tous les services d'apprentissage
 * @author MetaSign Team
 * @version 1.0.0
 */

import { LoggerFactory } from '../../../../../../ai/utils/LoggerFactory';
import { LearningServiceRegistry } from '../../../../../../ai/services/learning/registry/LearningServiceRegistry';
import { ExerciseManager } from '../../../../../../ai/services/learning/ExerciseManager';
import { LearningEventHandler } from '../../../../../../ai/services/learning/LearningEventHandler';

// Types pour l'interface UI
export interface LearningServiceConfig {
  enableGamification: boolean;
  enableAnalytics: boolean;
  defaultInitialLevel: string;
  maxRetries: number;
}

export interface ExerciseRequest {
  userId: string;
  sessionId: string;
  exerciseType?: string;
  difficulty?: number;
  topic?: string;
}

export interface ExerciseResponse {
  id: string;
  type: string;
  question: string;
  options?: string[];
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
  };
  metadata?: Record<string, unknown>;
}

export interface EvaluationRequest {
  userId: string;
  sessionId: string;
  exerciseId: string;
  response: unknown;
  timeSpent?: number;
}

export interface EvaluationResponse {
  correct: boolean;
  score: number;
  feedback: string;
  explanation?: string;
  suggestions?: string[];
  gamification?: {
    pointsEarned: number;
    achievements?: string[];
    levelUp?: boolean;
    newLevel?: number;
  };
}

export interface LearningSessionConfig {
  userId: string;
  targetLevel: string;
  topics: string[];
  duration?: number;
  adaptiveMode: boolean;
}

export interface LearningSessionData {
  id: string;
  userId: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  progress: {
    exercisesCompleted: number;
    totalExercises: number;
    currentScore: number;
    timeElapsed: number;
  };
  currentLevel: string;
  startTime: Date;
}

export interface UserLearningProfile {
  userId: string;
  currentLevel: string;
  strengths: string[];
  weaknesses: string[];
  preferredLearningStyle: string;
  totalPoints: number;
  achievements: string[];
  stats: {
    totalExercises: number;
    averageScore: number;
    streak: number;
    totalTimeSpent: number;
  };
}

/**
 * Pont principal vers tous les services d'apprentissage
 */
export class LearningServiceBridge {
  private logger = LoggerFactory.getLogger('LearningServiceBridge');
  private registry: LearningServiceRegistry;
  private exerciseManager: ExerciseManager;
  private eventHandler: LearningEventHandler;
  private isInitialized = false;
  private connectionRetries = 0;
  private maxRetries = 3;
  
  private config: LearningServiceConfig = {
    enableGamification: true,
    enableAnalytics: true,
    defaultInitialLevel: 'A1',
    maxRetries: 3
  };

  constructor(customConfig?: Partial<LearningServiceConfig>) {
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }
    
    this.initializeServices();
  }

  /**
   * Initialise tous les services d'apprentissage
   */
  private async initializeServices(): Promise<void> {
    while (this.connectionRetries < this.maxRetries && !this.isInitialized) {
      try {
        // Initialiser le registre des services
        this.registry = new LearningServiceRegistry({
          maxServices: 50,
          healthCheckInterval: 30000,
          retryAttempts: 3,
          enableMetrics: true
        });

        // Initialiser le gestionnaire d'événements
        this.eventHandler = new LearningEventHandler({
          config: {
            maxQueueSize: 1000,
            maxRetries: this.config.maxRetries,
            metricsEnabled: this.config.enableAnalytics
          }
        });

        // Attendre que les services se connectent
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Initialiser le gestionnaire d'exercices
        this.exerciseManager = new ExerciseManager(
          this.registry,
          this.registry.eventBus,
          this.config
        );

        this.isInitialized = true;
        this.logger.info('✅ Services d\'apprentissage initialisés', {
          config: this.config,
          retryCount: this.connectionRetries
        });
        return;

      } catch (error) {
        this.connectionRetries++;
        this.logger.warn(`⚠️ Tentative ${this.connectionRetries}/${this.maxRetries} échouée:`, error);
        
        if (this.connectionRetries < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * this.connectionRetries));
        }
      }
    }
    
    this.logger.warn('⚠️ Impossible d\'initialiser tous les services, mode dégradé activé');
  }

  /**
   * Génère un exercice pour l'utilisateur
   */
  async generateExercise(request: ExerciseRequest): Promise<ExerciseResponse> {
    this.validateInitialization();
    this.validateExerciseRequest(request);

    try {
      const exercise = await this.exerciseManager.generateExercise(
        request.userId,
        request.sessionId,
        request.exerciseType
      );

      // Émettre un événement
      await this.eventHandler.emitEvent('exercise_start', {
        userId: request.userId,
        sessionId: request.sessionId,
        activityId: exercise.id,
        metadata: { exerciseType: request.exerciseType }
      });

      return this.transformExerciseResponse(exercise);

    } catch (error) {
      this.logger.error('Erreur génération exercice:', error);
      
      // Fallback - exercice simple
      return this.generateFallbackExercise(request);
    }
  }

  /**
   * Évalue la réponse d'un utilisateur
   */
  async evaluateResponse(request: EvaluationRequest): Promise<EvaluationResponse> {
    this.validateInitialization();
    this.validateEvaluationRequest(request);

    try {
      const result = await this.exerciseManager.evaluateResponse(
        request.userId,
        request.sessionId,
        request.exerciseId,
        request.response
      );

      // Émettre un événement de completion
      await this.eventHandler.emitEvent('exercise_complete', {
        userId: request.userId,
        sessionId: request.sessionId,
        activityId: request.exerciseId,
        score: result.score,
        metadata: { 
          correct: result.correct,
          timeSpent: request.timeSpent 
        }
      });

      return this.transformEvaluationResponse(result);

    } catch (error) {
      this.logger.error('Erreur évaluation réponse:', error);
      
      // Fallback - évaluation basique
      return this.generateFallbackEvaluation(request);
    }
  }

  /**
   * Crée une nouvelle session d'apprentissage
   */
  async createLearningSession(config: LearningSessionConfig): Promise<LearningSessionData> {
    this.validateInitialization();
    this.validateSessionConfig(config);

    try {
      const sessionId = `session_${Date.now()}_${config.userId}`;
      
      // Émettre un événement de début de session
      await this.eventHandler.emitEvent('lesson_start', {
        userId: config.userId,
        sessionId,
        metadata: { 
          targetLevel: config.targetLevel,
          topics: config.topics,
          adaptiveMode: config.adaptiveMode
        }
      });

      const sessionData: LearningSessionData = {
        id: sessionId,
        userId: config.userId,
        status: 'active',
        progress: {
          exercisesCompleted: 0,
          totalExercises: this.estimateTotalExercises(config),
          currentScore: 0,
          timeElapsed: 0
        },
        currentLevel: config.targetLevel,
        startTime: new Date()
      };

      this.logger.info('✅ Session d\'apprentissage créée', { sessionId, userId: config.userId });
      return sessionData;

    } catch (error) {
      this.logger.error('Erreur création session:', error);
      throw new Error(`Échec de la création de session: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Récupère le profil d'apprentissage d'un utilisateur
   */
  async getUserProfile(userId: string): Promise<UserLearningProfile | null> {
    this.validateInitialization();
    
    if (!userId?.trim()) {
      throw new Error('userId est requis');
    }

    try {
      const profile = await this.exerciseManager.getUserProfile(userId);
      
      if (profile) {
        return this.transformUserProfile(profile, userId);
      }

      // Créer un profil par défaut
      return this.createDefaultUserProfile(userId);

    } catch (error) {
      this.logger.error('Erreur récupération profil utilisateur:', error);
      return this.createDefaultUserProfile(userId);
    }
  }

  /**
   * Termine une session d'apprentissage
   */
  async endLearningSession(sessionId: string): Promise<void> {
    this.validateInitialization();
    
    if (!sessionId?.trim()) {
      throw new Error('sessionId est requis');
    }

    try {
      // Émettre un événement de fin de session
      await this.eventHandler.emitEvent('lesson_complete', {
        userId: 'unknown', // Devrait être récupéré depuis la session
        sessionId: sessionId.trim(),
        metadata: { endReason: 'user_requested' }
      });

      this.logger.info('✅ Session d\'apprentissage terminée', { sessionId });

    } catch (error) {
      this.logger.error('Erreur fermeture session:', error);
    }
  }

  /**
   * Obtient les statistiques des services
   */
  getServiceStatistics(): {
    isInitialized: boolean;
    retryCount: number;
    config: LearningServiceConfig;
    eventHandlerStats?: ReturnType<LearningEventHandler['getStatistics']>;
  } {
    return {
      isInitialized: this.isInitialized,
      retryCount: this.connectionRetries,
      config: this.config,
      eventHandlerStats: this.eventHandler?.getStatistics()
    };
  }

  /**
   * Force la reconnexion aux services
   */
  async reconnect(): Promise<boolean> {
    this.connectionRetries = 0;
    this.isInitialized = false;
    await this.initializeServices();
    return this.isInitialized;
  }

  /**
   * Nettoie les ressources
   */
  dispose(): void {
    if (this.eventHandler) {
      this.eventHandler.dispose();
    }
    if (this.registry) {
      this.registry.dispose();
    }
    this.logger.info('LearningServiceBridge disposé');
  }

  // ===== MÉTHODES PRIVÉES =====

  private validateInitialization(): void {
    if (!this.isInitialized) {
      throw new Error('Services d\'apprentissage non initialisés');
    }
  }

  private validateExerciseRequest(request: ExerciseRequest): void {
    if (!request.userId?.trim()) {
      throw new Error('userId est requis');
    }
    if (!request.sessionId?.trim()) {
      throw new Error('sessionId est requis');
    }
  }

  private validateEvaluationRequest(request: EvaluationRequest): void {
    if (!request.userId?.trim()) {
      throw new Error('userId est requis');
    }
    if (!request.sessionId?.trim()) {
      throw new Error('sessionId est requis');
    }
    if (!request.exerciseId?.trim()) {
      throw new Error('exerciseId est requis');
    }
  }

  private validateSessionConfig(config: LearningSessionConfig): void {
    if (!config.userId?.trim()) {
      throw new Error('userId est requis');
    }
    if (!config.targetLevel?.trim()) {
      throw new Error('targetLevel est requis');
    }
    if (!Array.isArray(config.topics) || config.topics.length === 0) {
      throw new Error('topics ne peut pas être vide');
    }
  }

  private transformExerciseResponse(exercise: any): ExerciseResponse {
    return {
      id: exercise.id,
      type: exercise.type || 'MultipleChoice',
      question: exercise.question || exercise.description || 'Question non définie',
      options: exercise.options || [],
      media: exercise.media,
      metadata: exercise.metadata
    };
  }

  private transformEvaluationResponse(result: any): EvaluationResponse {
    return {
      correct: result.correct || false,
      score: result.score || 0,
      feedback: result.feedback || 'Évaluation terminée',
      explanation: result.explanation,
      suggestions: result.suggestions,
      gamification: result.gamification
    };
  }

  private transformUserProfile(profile: any, userId: string): UserLearningProfile {
    return {
      userId,
      currentLevel: profile.currentLevel || this.config.defaultInitialLevel,
      strengths: profile.strengths || [],
      weaknesses: profile.weaknesses || [],
      preferredLearningStyle: profile.preferredLearningStyle || 'visual',
      totalPoints: profile.totalPoints || 0,
      achievements: profile.achievements || [],
      stats: {
        totalExercises: profile.stats?.totalExercises || 0,
        averageScore: profile.stats?.averageScore || 0,
        streak: profile.stats?.streak || 0,
        totalTimeSpent: profile.stats?.totalTimeSpent || 0
      }
    };
  }

  private createDefaultUserProfile(userId: string): UserLearningProfile {
    return {
      userId,
      currentLevel: this.config.defaultInitialLevel,
      strengths: [],
      weaknesses: [],
      preferredLearningStyle: 'visual',
      totalPoints: 0,
      achievements: [],
      stats: {
        totalExercises: 0,
        averageScore: 0,
        streak: 0,
        totalTimeSpent: 0
      }
    };
  }

  private generateFallbackExercise(request: ExerciseRequest): ExerciseResponse {
    return {
      id: `fallback_${Date.now()}`,
      type: 'MultipleChoice',
      question: 'Question de démonstration - Services d\'apprentissage indisponibles',
      options: ['Option A', 'Option B', 'Option C'],
      metadata: { fallback: true, originalRequest: request }
    };
  }

  private generateFallbackEvaluation(request: EvaluationRequest): EvaluationResponse {
    return {
      correct: true,
      score: 0.5,
      feedback: 'Évaluation en mode simulation - Services indisponibles',
      explanation: 'Les services d\'évaluation ne sont pas disponibles actuellement.',
      suggestions: ['Réessayez plus tard', 'Contactez le support technique']
    };
  }

  private estimateTotalExercises(config: LearningSessionConfig): number {
    const baseExercises = 10;
    const topicMultiplier = config.topics.length;
    const durationMultiplier = config.duration ? Math.ceil(config.duration / 300) : 1; // 5 min par exercice
    
    return Math.min(baseExercises * topicMultiplier * durationMultiplier, 50);
  }

  /**
   * Vérifie si les services sont connectés
   */
  isConnected(): boolean {
    return this.isInitialized;
  }
}