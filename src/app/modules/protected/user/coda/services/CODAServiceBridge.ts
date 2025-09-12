/**
 * @file CODAServiceBridge.ts
 * @description Pont entre l'UI React et les services CODA existants dans src/ai/services/learning/human/coda
 * @author MetaSign Team
 * @version 1.0.0
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';

// Types pour l'interface UI
export interface CODASessionConfig {
  targetLevel: string;
  personalityType: string;
  mentorId: string;
  topic?: string;
}

export interface CODAInteractionRequest {
  sessionId: string;
  message: string;
  timestamp: Date;
}

export interface CODAResponse {
  content: string;
  emotionalState: string;
  gestureDescription?: string;
  currentLevel: string;
  suggestions?: string[];
}

export interface CODASessionData {
  id: string;
  mentorId: string;
  status: string;
  emotionalState: string;
  currentLevel: string;
  startTime: Date;
  interactions: number;
}

/**
 * Pont direct vers les services CODA existants
 * Évite la duplication d'APIs et utilise directement l'architecture existante
 */
export class CODAServiceBridge {
  private logger = LoggerFactory.getLogger('CODAServiceBridge');
  private codaApiServer: any = null;
  private sessionController: any = null;
  private reverseApprenticeshipSystem: any = null;

  constructor() {
    this.initializeServices();
  }

  /**
   * Initialise les services CODA existants
   */
  private async initializeServices(): Promise<void> {
    try {
      // Import des services réels
      const { CODAApiServer } = await import('@/ai/services/learning/human/coda/codavirtuel/api/CODAApiServer');
      const { SessionController } = await import('@/ai/services/learning/human/coda/codavirtuel/api/controllers/SessionController');
      const { ReverseApprenticeshipSystem } = await import('@/ai/services/learning/human/coda/codavirtuel/ReverseApprenticeshipSystem');

      // Configuration et initialisation
      this.codaApiServer = new CODAApiServer({
        port: 3001, // Port différent de Next.js
        environment: 'development',
        enableWebSocket: false, // Pour éviter les conflits
        enableMetrics: true
      });

      this.sessionController = new SessionController();
      this.reverseApprenticeshipSystem = new ReverseApprenticeshipSystem();

      this.logger.info('✅ Services CODA initialisés avec succès');
    } catch (error) {
      this.logger.warn('⚠️ Services CODA non disponibles, mode simulation activé:', error);
    }
  }

  /**
   * Crée une nouvelle session CODA
   */
  async createSession(config: CODASessionConfig): Promise<CODASessionData> {
    if (this.sessionController) {
      try {
        const session = await this.sessionController.createSession({
          mentorId: config.mentorId,
          topic: config.topic || 'Session LSF',
          targetLevel: config.targetLevel as any,
          concepts: [],
          teachingMethod: config.personalityType,
          expectedDuration: 30 * 60 * 1000, // 30 minutes
          materials: [],
          tags: [config.personalityType, config.targetLevel]
        });

        return {
          id: session.id,
          mentorId: session.mentorId,
          status: session.status || 'active',
          emotionalState: 'curious',
          currentLevel: config.targetLevel,
          startTime: new Date(session.startTime),
          interactions: 0
        };
      } catch (error) {
        this.logger.error('Erreur création session CODA:', error);
        throw error;
      }
    }

    // Fallback simulation
    return {
      id: `sim_session_${Date.now()}`,
      mentorId: config.mentorId,
      status: 'active',
      emotionalState: 'curious',
      currentLevel: config.targetLevel,
      startTime: new Date(),
      interactions: 0
    };
  }

  /**
   * Envoie une interaction à l'IA CODA
   */
  async sendInteraction(request: CODAInteractionRequest): Promise<CODAResponse> {
    if (this.reverseApprenticeshipSystem) {
      try {
        // Utilisation du système CODA réel
        const response = await this.reverseApprenticeshipSystem.processTeacherInput(
          request.message,
          {
            sessionId: request.sessionId,
            timestamp: request.timestamp
          }
        );

        return {
          content: response.response || response.content || '',
          emotionalState: response.emotionalState || 'focused',
          gestureDescription: response.gestureDescription,
          currentLevel: response.currentLevel || 'A2',
          suggestions: response.suggestions || []
        };
      } catch (error) {
        this.logger.error('Erreur interaction CODA:', error);
        throw error;
      }
    }

    // Fallback simulation
    const responses = [
      {
        content: "Oh ! C'est intéressant ! Peux-tu me montrer ce signe une fois de plus ? Je pense que j'ai mal fait la position de la main... 🤔",
        emotionalState: 'curious',
        gestureDescription: 'Geste d\'interrogation avec les mains',
        currentLevel: 'A2',
        suggestions: ['Répéter le mouvement', 'Corriger la position']
      },
      {
        content: "Wow ! J'ai l'impression de progresser ! Peux-tu me corriger si je fais une erreur ? Je veux vraiment bien apprendre ! 🌟",
        emotionalState: 'excited',
        gestureDescription: 'Geste d\'enthousiasme et d\'attention',
        currentLevel: 'A2',
        suggestions: ['Encourager', 'Proposer un exercice plus complexe']
      }
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    return response;
  }

  /**
   * Termine une session CODA
   */
  async endSession(sessionId: string): Promise<void> {
    if (this.sessionController) {
      try {
        await this.sessionController.endSession(sessionId, {
          endTime: new Date(),
          reason: 'user_requested'
        });
        this.logger.info('✅ Session CODA fermée:', sessionId);
        return;
      } catch (error) {
        this.logger.error('Erreur fermeture session CODA:', error);
      }
    }

    // Simulation
    this.logger.info('⚠️ Session CODA fermée (simulation):', sessionId);
  }

  /**
   * Vérifie si les services CODA sont disponibles
   */
  isConnected(): boolean {
    return !!(this.sessionController && this.reverseApprenticeshipSystem);
  }

  /**
   * Obtient les métriques de la session
   */
  async getSessionMetrics(sessionId: string): Promise<any> {
    if (this.sessionController) {
      try {
        return await this.sessionController.getSessionMetrics(sessionId);
      } catch (error) {
        this.logger.error('Erreur récupération métriques:', error);
      }
    }

    return {
      interactions: Math.floor(Math.random() * 20 + 5),
      duration: Math.floor(Math.random() * 30 + 10),
      emotionalEvolution: ['curious', 'focused', 'excited'],
      learningProgress: 75
    };
  }
}