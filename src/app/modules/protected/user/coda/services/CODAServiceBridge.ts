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
  private codaApiServer: unknown = null;
  private sessionController: unknown = null;
  private reverseApprenticeshipSystem: unknown = null;

  constructor() {
    this.initializeServices();
  }

  /**
   * Initialise les services CODA existants
   * Mode client-side - utilise des API routes au lieu d'imports directs
   */
  private async initializeServices(): Promise<void> {
    try {
      // Vérifier la disponibilité des services via API
      const response = await fetch('/api/coda/health');
      if (response.ok) {
        this.logger.info('✅ Services CODA disponibles via API');
        // Marquer les services comme disponibles
        this.codaApiServer = true;
        this.sessionController = true;
        this.reverseApprenticeshipSystem = true;
      } else {
        throw new Error('API CODA non accessible');
      }
    } catch (error) {
      this.logger.warn('⚠️ Services CODA non disponibles, mode simulation activé:', error);
      // Les services restent null, le mode simulation sera utilisé
    }
  }

  /**
   * Crée une nouvelle session CODA
   */
  async createSession(config: CODASessionConfig): Promise<CODASessionData> {
    if (this.sessionController) {
      try {
        const response = await fetch('/api/coda/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mentorId: config.mentorId,
            topic: config.topic || 'Session LSF',
            targetLevel: config.targetLevel,
            concepts: [],
            teachingMethod: config.personalityType,
            expectedDuration: 30 * 60 * 1000, // 30 minutes
            materials: [],
            tags: [config.personalityType, config.targetLevel]
          })
        });

        if (!response.ok) {
          throw new Error('Erreur création session API');
        }

        const session = await response.json();
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
        const response = await fetch('/api/coda/interactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: request.sessionId,
            message: request.message,
            timestamp: request.timestamp
          })
        });

        if (!response.ok) {
          throw new Error('Erreur interaction API');
        }

        const data = await response.json();
        return {
          content: data.response || data.content || '',
          emotionalState: data.emotionalState || 'focused',
          gestureDescription: data.gestureDescription,
          currentLevel: data.currentLevel || 'A2',
          suggestions: data.suggestions || []
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
        await (this.sessionController as any).endSession(sessionId, {
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
        return await (this.sessionController as any).getSessionMetrics(sessionId);
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