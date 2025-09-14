/**
 * @file AvatarSigningService.ts
 * @description Service pour l'avatar 3D qui signe en LSF
 * @author MetaSign Team
 * @version 1.0.0
 */

import { LoggerFactory } from '../../../../../../ai/utils/LoggerFactory';

// Types pour l'avatar et les animations
export interface HandPosition {
  x: number;
  y: number;
  z: number;
  rotation: {
    x: number;
    y: number;
    z: number;
  };
}

export interface FingerConfiguration {
  thumb: number;    // 0-1 (fermé-ouvert)
  index: number;
  middle: number;
  ring: number;
  pinky: number;
}

export interface SignKeyframe {
  timestamp: number;
  leftHand: HandPosition;
  rightHand: HandPosition;
  leftFingers: FingerConfiguration;
  rightFingers: FingerConfiguration;
  faceExpression?: string;
  bodyPosture?: {
    shoulderTilt: number;
    headTilt: number;
    eyeDirection: { x: number; y: number };
  };
}

export interface SignAnimation {
  signId: string;
  signName: string;
  duration: number;
  keyframes: SignKeyframe[];
  category: 'letter' | 'word' | 'phrase' | 'number';
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  variations?: SignAnimation[];
}

export interface AvatarState {
  isAnimating: boolean;
  currentAnimation?: SignAnimation;
  position: { x: number; y: number; z: number };
  scale: number;
  emotion: 'neutral' | 'happy' | 'confused' | 'excited' | 'thinking';
  isVisible: boolean;
}

export interface AnimationQueue {
  animations: SignAnimation[];
  currentIndex: number;
  isPlaying: boolean;
  loopMode: 'none' | 'single' | 'all';
}

/**
 * Service principal pour l'avatar signeur 3D
 */
export class AvatarSigningService {
  private logger = LoggerFactory.getLogger('AvatarSigningService');
  private isInitialized = false;
  
  // État de l'avatar
  private avatarState: AvatarState = {
    isAnimating: false,
    position: { x: 0, y: 0, z: 0 },
    scale: 1,
    emotion: 'neutral',
    isVisible: true
  };

  // Queue d'animations
  private animationQueue: AnimationQueue = {
    animations: [],
    currentIndex: 0,
    isPlaying: false,
    loopMode: 'none'
  };

  // Base de données des animations LSF
  private signDatabase: Map<string, SignAnimation> = new Map();
  
  // Callbacks pour l'interface
  private onAnimationStart?: (animation: SignAnimation) => void;
  private onAnimationEnd?: (animation: SignAnimation) => void;
  private onAnimationFrame?: (keyframe: SignKeyframe, progress: number) => void;

  constructor() {
    this.initializeService();
  }

  /**
   * Initialise le service d'avatar
   */
  private async initializeService(): Promise<void> {
    try {
      // Charger la base de données des signes
      await this.loadSignDatabase();
      
      // Initialiser l'état par défaut
      this.resetToNeutralPose();
      
      this.isInitialized = true;
      this.logger.info('✅ AvatarSigningService initialisé');

    } catch (error) {
      this.logger.error('Erreur initialisation AvatarSigningService:', error);
    }
  }

  /**
   * Charge la base de données des animations de signes
   */
  private async loadSignDatabase(): Promise<void> {
    // Base de signes LSF de base
    const basicSigns: SignAnimation[] = [
      {
        signId: 'bonjour',
        signName: 'Bonjour',
        duration: 2000,
        category: 'word',
        difficulty: 'easy',
        description: 'Main ouverte vers le visage',
        keyframes: [
          {
            timestamp: 0,
            leftHand: { x: -0.3, y: 0.5, z: 0.2, rotation: { x: 0, y: 0, z: 0 } },
            rightHand: { x: 0.3, y: 0.5, z: 0.2, rotation: { x: 0, y: 0, z: 0 } },
            leftFingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 },
            rightFingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 },
            faceExpression: 'happy'
          },
          {
            timestamp: 1000,
            leftHand: { x: -0.2, y: 0.8, z: 0.1, rotation: { x: 0, y: 0, z: 0 } },
            rightHand: { x: 0.2, y: 0.8, z: 0.1, rotation: { x: 0, y: 0, z: 0 } },
            leftFingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 },
            rightFingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 },
            faceExpression: 'happy'
          },
          {
            timestamp: 2000,
            leftHand: { x: -0.3, y: 0.5, z: 0.2, rotation: { x: 0, y: 0, z: 0 } },
            rightHand: { x: 0.3, y: 0.5, z: 0.2, rotation: { x: 0, y: 0, z: 0 } },
            leftFingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 },
            rightFingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 },
            faceExpression: 'neutral'
          }
        ]
      },
      
      {
        signId: 'merci',
        signName: 'Merci',
        duration: 1500,
        category: 'word',
        difficulty: 'easy',
        description: 'Main vers le cœur puis vers l\'extérieur',
        keyframes: [
          {
            timestamp: 0,
            leftHand: { x: -0.1, y: 0.4, z: 0.3, rotation: { x: 0, y: 0, z: 0 } },
            rightHand: { x: 0.1, y: 0.4, z: 0.3, rotation: { x: 0, y: 0, z: 0 } },
            leftFingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 },
            rightFingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 },
            faceExpression: 'happy'
          },
          {
            timestamp: 750,
            leftHand: { x: -0.05, y: 0.6, z: 0.1, rotation: { x: 0, y: 0, z: 0 } },
            rightHand: { x: 0.05, y: 0.6, z: 0.1, rotation: { x: 0, y: 0, z: 0 } },
            leftFingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 },
            rightFingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 },
            faceExpression: 'happy'
          },
          {
            timestamp: 1500,
            leftHand: { x: -0.4, y: 0.6, z: -0.1, rotation: { x: 0, y: 0, z: 0 } },
            rightHand: { x: 0.4, y: 0.6, z: -0.1, rotation: { x: 0, y: 0, z: 0 } },
            leftFingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 },
            rightFingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 },
            faceExpression: 'neutral'
          }
        ]
      },

      {
        signId: 'oui',
        signName: 'Oui',
        duration: 1000,
        category: 'word',
        difficulty: 'easy',
        description: 'Hochement de tête avec main fermée',
        keyframes: [
          {
            timestamp: 0,
            leftHand: { x: -0.2, y: 0.5, z: 0.2, rotation: { x: 0, y: 0, z: 0 } },
            rightHand: { x: 0.2, y: 0.5, z: 0.2, rotation: { x: 0, y: 0, z: 0 } },
            leftFingers: { thumb: 0.5, index: 0, middle: 0, ring: 0, pinky: 0 },
            rightFingers: { thumb: 0.5, index: 0, middle: 0, ring: 0, pinky: 0 },
            bodyPosture: { shoulderTilt: 0, headTilt: 0, eyeDirection: { x: 0, y: 0 } }
          },
          {
            timestamp: 250,
            leftHand: { x: -0.2, y: 0.6, z: 0.2, rotation: { x: 0, y: 0, z: 0 } },
            rightHand: { x: 0.2, y: 0.6, z: 0.2, rotation: { x: 0, y: 0, z: 0 } },
            leftFingers: { thumb: 0.5, index: 0, middle: 0, ring: 0, pinky: 0 },
            rightFingers: { thumb: 0.5, index: 0, middle: 0, ring: 0, pinky: 0 },
            bodyPosture: { shoulderTilt: 0, headTilt: -0.2, eyeDirection: { x: 0, y: 0 } }
          },
          {
            timestamp: 500,
            leftHand: { x: -0.2, y: 0.4, z: 0.2, rotation: { x: 0, y: 0, z: 0 } },
            rightHand: { x: 0.2, y: 0.4, z: 0.2, rotation: { x: 0, y: 0, z: 0 } },
            leftFingers: { thumb: 0.5, index: 0, middle: 0, ring: 0, pinky: 0 },
            rightFingers: { thumb: 0.5, index: 0, middle: 0, ring: 0, pinky: 0 },
            bodyPosture: { shoulderTilt: 0, headTilt: 0.2, eyeDirection: { x: 0, y: 0 } }
          },
          {
            timestamp: 750,
            leftHand: { x: -0.2, y: 0.6, z: 0.2, rotation: { x: 0, y: 0, z: 0 } },
            rightHand: { x: 0.2, y: 0.6, z: 0.2, rotation: { x: 0, y: 0, z: 0 } },
            leftFingers: { thumb: 0.5, index: 0, middle: 0, ring: 0, pinky: 0 },
            rightFingers: { thumb: 0.5, index: 0, middle: 0, ring: 0, pinky: 0 },
            bodyPosture: { shoulderTilt: 0, headTilt: -0.1, eyeDirection: { x: 0, y: 0 } }
          },
          {
            timestamp: 1000,
            leftHand: { x: -0.2, y: 0.5, z: 0.2, rotation: { x: 0, y: 0, z: 0 } },
            rightHand: { x: 0.2, y: 0.5, z: 0.2, rotation: { x: 0, y: 0, z: 0 } },
            leftFingers: { thumb: 0.5, index: 0, middle: 0, ring: 0, pinky: 0 },
            rightFingers: { thumb: 0.5, index: 0, middle: 0, ring: 0, pinky: 0 },
            bodyPosture: { shoulderTilt: 0, headTilt: 0, eyeDirection: { x: 0, y: 0 } }
          }
        ]
      },

      {
        signId: 'non',
        signName: 'Non',
        duration: 1200,
        category: 'word',
        difficulty: 'easy',
        description: 'Secouement de tête avec index tendu',
        keyframes: [
          {
            timestamp: 0,
            leftHand: { x: -0.2, y: 0.5, z: 0.2, rotation: { x: 0, y: 0, z: 0 } },
            rightHand: { x: 0.2, y: 0.7, z: 0.1, rotation: { x: 0, y: 0, z: 0 } },
            leftFingers: { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 },
            rightFingers: { thumb: 0, index: 1, middle: 0, ring: 0, pinky: 0 },
            bodyPosture: { shoulderTilt: 0, headTilt: 0, eyeDirection: { x: 0, y: 0 } }
          },
          {
            timestamp: 300,
            leftHand: { x: -0.2, y: 0.5, z: 0.2, rotation: { x: 0, y: 0, z: 0 } },
            rightHand: { x: 0.3, y: 0.7, z: 0.1, rotation: { x: 0, y: 0.3, z: 0 } },
            leftFingers: { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 },
            rightFingers: { thumb: 0, index: 1, middle: 0, ring: 0, pinky: 0 },
            bodyPosture: { shoulderTilt: 0, headTilt: 0, eyeDirection: { x: 0.3, y: 0 } }
          },
          {
            timestamp: 600,
            leftHand: { x: -0.2, y: 0.5, z: 0.2, rotation: { x: 0, y: 0, z: 0 } },
            rightHand: { x: 0.1, y: 0.7, z: 0.1, rotation: { x: 0, y: -0.3, z: 0 } },
            leftFingers: { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 },
            rightFingers: { thumb: 0, index: 1, middle: 0, ring: 0, pinky: 0 },
            bodyPosture: { shoulderTilt: 0, headTilt: 0, eyeDirection: { x: -0.3, y: 0 } }
          },
          {
            timestamp: 900,
            leftHand: { x: -0.2, y: 0.5, z: 0.2, rotation: { x: 0, y: 0, z: 0 } },
            rightHand: { x: 0.3, y: 0.7, z: 0.1, rotation: { x: 0, y: 0.2, z: 0 } },
            leftFingers: { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 },
            rightFingers: { thumb: 0, index: 1, middle: 0, ring: 0, pinky: 0 },
            bodyPosture: { shoulderTilt: 0, headTilt: 0, eyeDirection: { x: 0.2, y: 0 } }
          },
          {
            timestamp: 1200,
            leftHand: { x: -0.2, y: 0.5, z: 0.2, rotation: { x: 0, y: 0, z: 0 } },
            rightHand: { x: 0.2, y: 0.7, z: 0.1, rotation: { x: 0, y: 0, z: 0 } },
            leftFingers: { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 },
            rightFingers: { thumb: 0, index: 1, middle: 0, ring: 0, pinky: 0 },
            bodyPosture: { shoulderTilt: 0, headTilt: 0, eyeDirection: { x: 0, y: 0 } }
          }
        ]
      }
    ];

    // Ajouter les signes à la base de données
    basicSigns.forEach(sign => {
      this.signDatabase.set(sign.signId, sign);
    });

    this.logger.info(`Base de signes chargée: ${this.signDatabase.size} signes`);
  }

  /**
   * Joue un signe spécifique
   */
  async playSign(signId: string): Promise<void> {
    const animation = this.signDatabase.get(signId.toLowerCase());
    
    if (!animation) {
      this.logger.warn(`Signe introuvable: ${signId}`);
      throw new Error(`Signe "${signId}" non trouvé dans la base`);
    }

    await this.playAnimation(animation);
  }

  /**
   * Joue une séquence de signes
   */
  async playSignSequence(signIds: string[]): Promise<void> {
    this.animationQueue.animations = [];
    
    for (const signId of signIds) {
      const animation = this.signDatabase.get(signId.toLowerCase());
      if (animation) {
        this.animationQueue.animations.push(animation);
      } else {
        this.logger.warn(`Signe ignoré: ${signId}`);
      }
    }

    if (this.animationQueue.animations.length > 0) {
      await this.playAnimationQueue();
    }
  }

  /**
   * Interprète une phrase et joue les signes correspondants
   */
  async signPhrase(phrase: string): Promise<void> {
    const words = phrase.toLowerCase()
      .replace(/[^\w\s]/g, '') // Enlever la ponctuation
      .split(/\s+/)
      .filter(word => word.length > 0);

    const signIds: string[] = [];
    
    for (const word of words) {
      if (this.signDatabase.has(word)) {
        signIds.push(word);
      } else {
        // Essayer de trouver des signes similaires
        const similar = this.findSimilarSign(word);
        if (similar) {
          signIds.push(similar);
          this.logger.info(`Signe substitué: "${word}" → "${similar}"`);
        } else {
          this.logger.warn(`Aucun signe trouvé pour: "${word}"`);
        }
      }
    }

    if (signIds.length > 0) {
      await this.playSignSequence(signIds);
    } else {
      this.logger.warn('Aucun signe à jouer pour cette phrase');
    }
  }

  /**
   * Joue une animation
   */
  private async playAnimation(animation: SignAnimation): Promise<void> {
    if (this.avatarState.isAnimating) {
      this.logger.warn('Animation déjà en cours');
      return;
    }

    this.avatarState.isAnimating = true;
    this.avatarState.currentAnimation = animation;

    this.onAnimationStart?.(animation);

    try {
      await this.executeAnimation(animation);
    } finally {
      this.avatarState.isAnimating = false;
      this.avatarState.currentAnimation = undefined;
      this.onAnimationEnd?.(animation);
    }
  }

  /**
   * Exécute l'animation frame par frame
   */
  private async executeAnimation(animation: SignAnimation): Promise<void> {
    const startTime = Date.now();
    const { duration, keyframes } = animation;

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Interpoler entre les keyframes
        const currentKeyframe = this.interpolateKeyframes(keyframes, progress);
        
        // Notifier l'interface
        this.onAnimationFrame?.(currentKeyframe, progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Interpole entre les keyframes
   */
  private interpolateKeyframes(keyframes: SignKeyframe[], progress: number): SignKeyframe {
    const totalDuration = keyframes[keyframes.length - 1].timestamp;
    const currentTime = progress * totalDuration;

    // Trouver les keyframes avant et après
    let beforeFrame = keyframes[0];
    let afterFrame = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (currentTime >= keyframes[i].timestamp && currentTime <= keyframes[i + 1].timestamp) {
        beforeFrame = keyframes[i];
        afterFrame = keyframes[i + 1];
        break;
      }
    }

    // Calculer le facteur d'interpolation
    const segmentDuration = afterFrame.timestamp - beforeFrame.timestamp;
    const segmentProgress = segmentDuration > 0 
      ? (currentTime - beforeFrame.timestamp) / segmentDuration 
      : 0;

    // Interpoler toutes les propriétés
    return {
      timestamp: currentTime,
      leftHand: this.interpolateHandPosition(beforeFrame.leftHand, afterFrame.leftHand, segmentProgress),
      rightHand: this.interpolateHandPosition(beforeFrame.rightHand, afterFrame.rightHand, segmentProgress),
      leftFingers: this.interpolateFingers(beforeFrame.leftFingers, afterFrame.leftFingers, segmentProgress),
      rightFingers: this.interpolateFingers(beforeFrame.rightFingers, afterFrame.rightFingers, segmentProgress),
      faceExpression: segmentProgress < 0.5 ? beforeFrame.faceExpression : afterFrame.faceExpression,
      bodyPosture: beforeFrame.bodyPosture && afterFrame.bodyPosture 
        ? this.interpolateBodyPosture(beforeFrame.bodyPosture, afterFrame.bodyPosture, segmentProgress)
        : beforeFrame.bodyPosture || afterFrame.bodyPosture
    };
  }

  /**
   * Interpole les positions des mains
   */
  private interpolateHandPosition(from: HandPosition, to: HandPosition, progress: number): HandPosition {
    return {
      x: this.lerp(from.x, to.x, progress),
      y: this.lerp(from.y, to.y, progress),
      z: this.lerp(from.z, to.z, progress),
      rotation: {
        x: this.lerp(from.rotation.x, to.rotation.x, progress),
        y: this.lerp(from.rotation.y, to.rotation.y, progress),
        z: this.lerp(from.rotation.z, to.rotation.z, progress)
      }
    };
  }

  /**
   * Interpole les configurations des doigts
   */
  private interpolateFingers(from: FingerConfiguration, to: FingerConfiguration, progress: number): FingerConfiguration {
    return {
      thumb: this.lerp(from.thumb, to.thumb, progress),
      index: this.lerp(from.index, to.index, progress),
      middle: this.lerp(from.middle, to.middle, progress),
      ring: this.lerp(from.ring, to.ring, progress),
      pinky: this.lerp(from.pinky, to.pinky, progress)
    };
  }

  /**
   * Interpole la posture du corps
   */
  private interpolateBodyPosture(from: any, to: any, progress: number): any {
    return {
      shoulderTilt: this.lerp(from.shoulderTilt, to.shoulderTilt, progress),
      headTilt: this.lerp(from.headTilt, to.headTilt, progress),
      eyeDirection: {
        x: this.lerp(from.eyeDirection.x, to.eyeDirection.x, progress),
        y: this.lerp(from.eyeDirection.y, to.eyeDirection.y, progress)
      }
    };
  }

  /**
   * Interpolation linéaire
   */
  private lerp(from: number, to: number, progress: number): number {
    return from + (to - from) * progress;
  }

  /**
   * Joue la queue d'animations
   */
  private async playAnimationQueue(): Promise<void> {
    this.animationQueue.isPlaying = true;
    this.animationQueue.currentIndex = 0;

    while (this.animationQueue.currentIndex < this.animationQueue.animations.length) {
      const animation = this.animationQueue.animations[this.animationQueue.currentIndex];
      await this.playAnimation(animation);
      
      // Pause courte entre les signes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.animationQueue.currentIndex++;
    }

    this.animationQueue.isPlaying = false;
  }

  /**
   * Trouve un signe similaire
   */
  private findSimilarSign(word: string): string | null {
    // Recherche approximative simple
    const keys = Array.from(this.signDatabase.keys());
    
    // Recherche exacte d'abord
    if (keys.includes(word)) {
      return word;
    }

    // Recherche par inclusion
    const containing = keys.find(key => key.includes(word) || word.includes(key));
    if (containing) {
      return containing;
    }

    // Recherche par similarité (distance de Levenshtein simple)
    let bestMatch: string | null = null;
    let bestDistance = Infinity;

    for (const key of keys) {
      const distance = this.calculateLevenshteinDistance(word, key);
      if (distance < bestDistance && distance <= 2) {
        bestDistance = distance;
        bestMatch = key;
      }
    }

    return bestMatch;
  }

  /**
   * Calcule la distance de Levenshtein
   */
  private calculateLevenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Remet l'avatar en position neutre
   */
  resetToNeutralPose(): void {
    const neutralKeyframe: SignKeyframe = {
      timestamp: 0,
      leftHand: { x: -0.3, y: 0.5, z: 0.2, rotation: { x: 0, y: 0, z: 0 } },
      rightHand: { x: 0.3, y: 0.5, z: 0.2, rotation: { x: 0, y: 0, z: 0 } },
      leftFingers: { thumb: 0.5, index: 0.5, middle: 0.5, ring: 0.5, pinky: 0.5 },
      rightFingers: { thumb: 0.5, index: 0.5, middle: 0.5, ring: 0.5, pinky: 0.5 },
      faceExpression: 'neutral',
      bodyPosture: { shoulderTilt: 0, headTilt: 0, eyeDirection: { x: 0, y: 0 } }
    };

    this.onAnimationFrame?.(neutralKeyframe, 1);
    this.avatarState.emotion = 'neutral';
  }

  /**
   * Arrête l'animation en cours
   */
  stopAnimation(): void {
    if (this.avatarState.isAnimating) {
      this.avatarState.isAnimating = false;
      this.avatarState.currentAnimation = undefined;
      this.resetToNeutralPose();
    }
  }

  /**
   * Configure les callbacks d'animation
   */
  setAnimationCallbacks(callbacks: {
    onStart?: (animation: SignAnimation) => void;
    onEnd?: (animation: SignAnimation) => void;
    onFrame?: (keyframe: SignKeyframe, progress: number) => void;
  }): void {
    this.onAnimationStart = callbacks.onStart;
    this.onAnimationEnd = callbacks.onEnd;
    this.onAnimationFrame = callbacks.onFrame;
  }

  /**
   * Change l'émotion de l'avatar
   */
  setEmotion(emotion: AvatarState['emotion']): void {
    this.avatarState.emotion = emotion;
  }

  /**
   * Obtient la liste des signes disponibles
   */
  getAvailableSigns(): string[] {
    return Array.from(this.signDatabase.keys());
  }

  /**
   * Obtient les détails d'un signe
   */
  getSignDetails(signId: string): SignAnimation | null {
    return this.signDatabase.get(signId.toLowerCase()) || null;
  }

  /**
   * Obtient l'état actuel de l'avatar
   */
  getAvatarState(): AvatarState {
    return { ...this.avatarState };
  }

  /**
   * Obtient les statistiques d'usage
   */
  getStats(): {
    isInitialized: boolean;
    availableSignsCount: number;
    isAnimating: boolean;
    currentEmotion: string;
    queueLength: number;
  } {
    return {
      isInitialized: this.isInitialized,
      availableSignsCount: this.signDatabase.size,
      isAnimating: this.avatarState.isAnimating,
      currentEmotion: this.avatarState.emotion,
      queueLength: this.animationQueue.animations.length
    };
  }

  /**
   * Nettoie les ressources
   */
  dispose(): void {
    this.stopAnimation();
    this.animationQueue.animations = [];
    this.signDatabase.clear();
    this.isInitialized = false;
    
    this.logger.info('AvatarSigningService disposé');
  }
}