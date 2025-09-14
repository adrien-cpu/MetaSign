/**
 * @file CODAVideoIntegration.ts
 * @description Intégration entre le système vidéo et CODA pour l'apprentissage multimodal
 * @author MetaSign Team
 * @version 1.0.0
 */

import { LoggerFactory } from '../../../../../../ai/utils/LoggerFactory';
import { CODAServiceBridge } from '../../../coda/services/CODAServiceBridge';
import type { 
  VideoLearningBridge,
  LearningSession,
  SignRecognitionResult,
  TextSignAssociation 
} from './VideoLearningBridge';

// Types pour l'intégration CODA-Vidéo
export interface CODALearningContext {
  textContent: string;
  associatedSigns: SignRecognitionResult[];
  visualContext: {
    teacherGestures: HandPose[];
    facialExpressions?: string[];
    environmentContext?: string;
  };
  temporalContext: {
    duration: number;
    sequenceOrder: number;
    repetitions: number;
  };
}

export interface MultimodalLearningData {
  sessionId: string;
  timestamp: number;
  textInput: string;
  visualInput: {
    handPoses: HandPose[];
    signRecognitions: SignRecognitionResult[];
    videoMetadata: {
      resolution: string;
      frameRate: number;
      quality: 'high' | 'medium' | 'low';
    };
  };
  audioInput?: {
    transcription?: string;
    audioQuality: number;
  };
  learningObjectives: {
    targetLevel: string;
    skillCategory: 'vocabulary' | 'grammar' | 'conversation' | 'comprehension';
    difficulty: number;
  };
}

export interface CODAFeedback {
  understanding: number; // 0-1
  questions: string[];
  requestedRepetitions: SignRecognitionResult[];
  emotionalResponse: 'curious' | 'confused' | 'excited' | 'frustrated';
  learningProgress: {
    concept: string;
    mastery: number; // 0-1
    needsPractice: boolean;
  }[];
}

interface HandPose {
  landmarks: number[][];
  confidence: number;
  handedness: 'Left' | 'Right';
}

/**
 * Service d'intégration entre vidéo et CODA pour l'apprentissage IA
 */
export class CODAVideoIntegration {
  private logger = LoggerFactory.getLogger('CODAVideoIntegration');
  private codaBridge: CODAServiceBridge;
  private videoBridge: VideoLearningBridge;
  private isConnected = false;
  
  // Context d'apprentissage multimodal
  private currentContext: CODALearningContext | null = null;
  private learningHistory: MultimodalLearningData[] = [];
  private feedbackBuffer: CODAFeedback[] = [];

  constructor(
    codaBridge: CODAServiceBridge,
    videoBridge: VideoLearningBridge
  ) {
    this.codaBridge = codaBridge;
    this.videoBridge = videoBridge;
    this.initializeIntegration();
  }

  /**
   * Initialise l'intégration entre les deux systèmes
   */
  private async initializeIntegration(): Promise<void> {
    try {
      // Vérifier la connexion des deux bridges
      const codaConnected = this.codaBridge.isConnected();
      const videoConnected = this.videoBridge.isConnected();

      if (!codaConnected || !videoConnected) {
        this.logger.warn('Bridges non connectés', { codaConnected, videoConnected });
        return;
      }

      this.isConnected = true;
      this.logger.info('✅ Intégration CODA-Vidéo initialisée');

      // Démarrer l'écoute des événements
      this.startEventListening();

    } catch (error) {
      this.logger.error('Erreur initialisation intégration:', error);
    }
  }

  /**
   * Démarre l'écoute des événements des deux systèmes
   */
  private startEventListening(): void {
    // En production, cela écouterait les événements réels
    // Pour l'instant, simulation d'événements
    setInterval(() => {
      this.processRealtimeLearning();
    }, 2000);
  }

  /**
   * Traite l'apprentissage en temps réel
   */
  private processRealtimeLearning(): void {
    const videoStats = this.videoBridge.getSessionStats();
    
    if (!videoStats.sessionActive) return;

    // Récupérer les données récentes
    const recentSigns = this.videoBridge.getRecentSigns(5);
    const textAssociations = this.videoBridge.getTextSignAssociations();
    
    if (recentSigns.length > 0 && textAssociations.length > 0) {
      const latestAssociation = textAssociations[textAssociations.length - 1];
      this.processMultimodalLearning(latestAssociation, recentSigns);
    }
  }

  /**
   * Traite une session d'apprentissage multimodal
   */
  async processMultimodalLearning(
    textAssociation: TextSignAssociation,
    recognizedSigns: SignRecognitionResult[]
  ): Promise<CODAFeedback> {
    try {
      // Créer le contexte d'apprentissage multimodal
      const learningData = this.createMultimodalLearningData(
        textAssociation,
        recognizedSigns
      );

      // Envoyer à CODA pour apprentissage
      const codaResponse = await this.sendToCODA(learningData);
      
      // Analyser la réponse de CODA
      const feedback = this.analyzeCODAResponse(codaResponse);
      
      // Stocker dans l'historique
      this.learningHistory.push(learningData);
      this.feedbackBuffer.push(feedback);

      // Garder seulement les 100 derniers éléments
      if (this.learningHistory.length > 100) {
        this.learningHistory.shift();
        this.feedbackBuffer.shift();
      }

      this.logger.info('Apprentissage multimodal traité', {
        textSegment: textAssociation.textSegment,
        signsCount: recognizedSigns.length,
        understanding: feedback.understanding
      });

      return feedback;

    } catch (error) {
      this.logger.error('Erreur traitement apprentissage multimodal:', error);
      
      // Retourner un feedback par défaut en cas d'erreur
      return this.createDefaultFeedback(textAssociation);
    }
  }

  /**
   * Crée les données d'apprentissage multimodal
   */
  private createMultimodalLearningData(
    textAssociation: TextSignAssociation,
    recognizedSigns: SignRecognitionResult[]
  ): MultimodalLearningData {
    return {
      sessionId: `multimodal_${Date.now()}`,
      timestamp: Date.now(),
      textInput: textAssociation.textSegment,
      visualInput: {
        handPoses: recognizedSigns.flatMap(sign => sign.handPoses || []),
        signRecognitions: recognizedSigns,
        videoMetadata: {
          resolution: '1280x720',
          frameRate: 30,
          quality: 'high'
        }
      },
      learningObjectives: {
        targetLevel: 'A2', // À récupérer depuis la session
        skillCategory: this.inferSkillCategory(textAssociation.textSegment),
        difficulty: this.calculateDifficulty(recognizedSigns)
      }
    };
  }

  /**
   * Envoie les données à CODA via le service bridge
   */
  private async sendToCODA(learningData: MultimodalLearningData): Promise<any> {
    try {
      // Créer une session CODA si nécessaire
      let sessionId = 'coda_video_learning_session';
      
      // En production, cela interagirait avec le vrai système CODA
      // Pour l'instant, simulation d'interaction
      const interaction = await this.codaBridge.sendInteraction({
        sessionId,
        message: this.formatLearningDataForCODA(learningData),
        timestamp: new Date()
      });

      return interaction;

    } catch (error) {
      this.logger.error('Erreur envoi vers CODA:', error);
      throw error;
    }
  }

  /**
   * Formate les données d'apprentissage pour CODA
   */
  private formatLearningDataForCODA(data: MultimodalLearningData): string {
    const signNames = data.visualInput.signRecognitions.map(s => s.signName).join(', ');
    const avgConfidence = data.visualInput.signRecognitions.reduce((sum, s) => sum + s.confidence, 0) / data.visualInput.signRecognitions.length;

    return JSON.stringify({
      type: 'multimodal_learning',
      text: data.textInput,
      recognizedSigns: signNames,
      confidence: avgConfidence,
      visualContext: {
        handPosesCount: data.visualInput.handPoses.length,
        videoQuality: data.visualInput.videoMetadata.quality
      },
      learningContext: {
        targetLevel: data.learningObjectives.targetLevel,
        skillCategory: data.learningObjectives.skillCategory,
        difficulty: data.learningObjectives.difficulty
      }
    });
  }

  /**
   * Analyse la réponse de CODA
   */
  private analyzeCODAResponse(codaResponse: any): CODAFeedback {
    // Analyser la réponse de CODA pour extraire le feedback
    const content = codaResponse.content || '';
    
    // Simulation d'analyse sémantique de la réponse
    const understanding = this.extractUnderstanding(content);
    const questions = this.extractQuestions(content);
    const emotionalResponse = this.inferEmotionalResponse(content);

    return {
      understanding,
      questions,
      requestedRepetitions: [], // À implémenter selon la réponse
      emotionalResponse,
      learningProgress: this.assessLearningProgress()
    };
  }

  /**
   * Extrait le niveau de compréhension de la réponse CODA
   */
  private extractUnderstanding(content: string): number {
    // Mots-clés indiquant la compréhension
    const understandingKeywords = [
      'compris', 'comprendre', 'clair', 'merci', 'parfait', 'excellent'
    ];
    
    const confusionKeywords = [
      'confus', 'difficile', 'répéter', 'expliquer', 'aide', 'comment'
    ];

    const lowerContent = content.toLowerCase();
    let understandingScore = 0.5; // Score neutre

    understandingKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        understandingScore += 0.1;
      }
    });

    confusionKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        understandingScore -= 0.15;
      }
    });

    return Math.max(0, Math.min(1, understandingScore));
  }

  /**
   * Extrait les questions de la réponse CODA
   */
  private extractQuestions(content: string): string[] {
    const questions: string[] = [];
    
    // Rechercher les phrases avec des mots interrogatifs
    const questionWords = ['comment', 'pourquoi', 'quoi', 'où', 'quand', 'qui'];
    const sentences = content.split(/[.!?]+/);
    
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase().trim();
      if (questionWords.some(word => lowerSentence.includes(word)) || lowerSentence.includes('?')) {
        questions.push(sentence.trim());
      }
    });

    return questions;
  }

  /**
   * Infère la réponse émotionnelle
   */
  private inferEmotionalResponse(content: string): 'curious' | 'confused' | 'excited' | 'frustrated' {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('excellent') || lowerContent.includes('super') || lowerContent.includes('🌟')) {
      return 'excited';
    } else if (lowerContent.includes('difficile') || lowerContent.includes('compliqué')) {
      return 'frustrated';
    } else if (lowerContent.includes('comment') || lowerContent.includes('🤔')) {
      return 'curious';
    } else if (lowerContent.includes('confus') || lowerContent.includes('compris pas')) {
      return 'confused';
    }
    
    return 'curious'; // Par défaut
  }

  /**
   * Évalue les progrès d'apprentissage
   */
  private assessLearningProgress(): CODAFeedback['learningProgress'] {
    // Analyser l'historique pour évaluer les progrès
    const recentHistory = this.learningHistory.slice(-10);
    
    const progress: CODAFeedback['learningProgress'] = [];
    
    // Grouper par catégorie de compétences
    const skillCategories = ['vocabulary', 'grammar', 'conversation', 'comprehension'] as const;
    
    skillCategories.forEach(skill => {
      const skillData = recentHistory.filter(data => 
        data.learningObjectives.skillCategory === skill
      );
      
      if (skillData.length > 0) {
        const avgDifficulty = skillData.reduce((sum, data) => 
          sum + data.learningObjectives.difficulty, 0
        ) / skillData.length;
        
        const recentFeedback = this.feedbackBuffer.slice(-skillData.length);
        const avgUnderstanding = recentFeedback.reduce((sum, feedback) => 
          sum + feedback.understanding, 0
        ) / recentFeedback.length;

        progress.push({
          concept: skill,
          mastery: avgUnderstanding,
          needsPractice: avgUnderstanding < 0.7 || avgDifficulty > 0.6
        });
      }
    });

    return progress;
  }

  /**
   * Infère la catégorie de compétence du texte
   */
  private inferSkillCategory(text: string): 'vocabulary' | 'grammar' | 'conversation' | 'comprehension' {
    const lowerText = text.toLowerCase();
    
    // Mots-clés pour chaque catégorie
    const vocabularyKeywords = ['mot', 'signe', 'signifie', 'appelle'];
    const grammarKeywords = ['phrase', 'structure', 'ordre', 'conjugaison'];
    const conversationKeywords = ['dialogue', 'conversation', 'répondre', 'discuter'];
    
    if (vocabularyKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'vocabulary';
    } else if (grammarKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'grammar';
    } else if (conversationKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'conversation';
    }
    
    return 'comprehension'; // Par défaut
  }

  /**
   * Calcule la difficulté basée sur les signes reconnus
   */
  private calculateDifficulty(signs: SignRecognitionResult[]): number {
    if (signs.length === 0) return 0.5;
    
    // Facteurs de difficulté
    const avgConfidence = signs.reduce((sum, sign) => sum + sign.confidence, 0) / signs.length;
    const complexityFactor = signs.some(sign => 
      sign.category === 'phrase' || sign.signName.includes(' ')
    ) ? 0.3 : 0;
    
    // Difficulté inverse de la confiance, ajustée par la complexité
    const difficulty = (1 - avgConfidence) + complexityFactor;
    
    return Math.max(0, Math.min(1, difficulty));
  }

  /**
   * Crée un feedback par défaut en cas d'erreur
   */
  private createDefaultFeedback(textAssociation: TextSignAssociation): CODAFeedback {
    return {
      understanding: 0.5,
      questions: [`Peux-tu répéter l'explication pour "${textAssociation.textSegment}" ?`],
      requestedRepetitions: [],
      emotionalResponse: 'curious',
      learningProgress: [{
        concept: 'general',
        mastery: 0.5,
        needsPractice: true
      }]
    };
  }

  /**
   * Obtient les statistiques d'intégration
   */
  getIntegrationStats(): {
    isConnected: boolean;
    learningSessionsCount: number;
    averageUnderstanding: number;
    mostCommonEmotion: string;
    skillProgress: Record<string, number>;
  } {
    const avgUnderstanding = this.feedbackBuffer.length > 0
      ? this.feedbackBuffer.reduce((sum, f) => sum + f.understanding, 0) / this.feedbackBuffer.length
      : 0;

    const emotions = this.feedbackBuffer.map(f => f.emotionalResponse);
    const emotionCounts = emotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'curious';

    const skillProgress: Record<string, number> = {};
    this.feedbackBuffer.forEach(feedback => {
      feedback.learningProgress.forEach(progress => {
        skillProgress[progress.concept] = (skillProgress[progress.concept] || 0) + progress.mastery;
      });
    });

    Object.keys(skillProgress).forEach(skill => {
      const count = this.feedbackBuffer.filter(f => 
        f.learningProgress.some(p => p.concept === skill)
      ).length;
      skillProgress[skill] = skillProgress[skill] / count;
    });

    return {
      isConnected: this.isConnected,
      learningSessionsCount: this.learningHistory.length,
      averageUnderstanding: Math.round(avgUnderstanding * 100) / 100,
      mostCommonEmotion,
      skillProgress
    };
  }

  /**
   * Obtient le feedback récent
   */
  getRecentFeedback(limit: number = 5): CODAFeedback[] {
    return this.feedbackBuffer.slice(-limit);
  }

  /**
   * Obtient l'historique d'apprentissage
   */
  getLearningHistory(limit: number = 10): MultimodalLearningData[] {
    return this.learningHistory.slice(-limit);
  }

  /**
   * Force une interaction d'apprentissage
   */
  async forcelearningInteraction(
    text: string,
    signs: SignRecognitionResult[]
  ): Promise<CODAFeedback> {
    const mockAssociation: TextSignAssociation = {
      textSegment: text,
      startTime: Date.now() - 5000,
      endTime: Date.now(),
      associatedSigns: signs
    };

    return await this.processMultimodalLearning(mockAssociation, signs);
  }

  /**
   * Vérifie si l'intégration est active
   */
  isActive(): boolean {
    return this.isConnected && 
           this.codaBridge.isConnected() && 
           this.videoBridge.isConnected();
  }

  /**
   * Nettoie les ressources
   */
  dispose(): void {
    this.currentContext = null;
    this.learningHistory = [];
    this.feedbackBuffer = [];
    this.isConnected = false;
    
    this.logger.info('CODAVideoIntegration disposé');
  }
}