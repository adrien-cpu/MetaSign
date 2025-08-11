// src/ai/systems/expressions/timing/StreamController.ts
import { Frame } from './types';

interface MorphTargets {
  [key: string]: number;
}

export class StreamController {
  private readonly MAX_BUFFER_SIZE = 60; // 1 second at 60fps
  private readonly MAX_PROCESSING_TIME = 16; // ~60fps in ms
  private frameBuffer: Frame[] = [];
  private isProcessing = false;

  constructor(private readonly avatarId: string) { }

  async pushFrame(frame: Frame): Promise<void> {
    this.frameBuffer.push(frame);

    if (this.frameBuffer.length > this.MAX_BUFFER_SIZE) {
      if (!this.isProcessing) {
        await this.processBuffer();
      }
    }
  }

  private async processBuffer(): Promise<void> {
    this.isProcessing = true;
    const startTime = Date.now();

    try {
      while (this.frameBuffer.length > 0 &&
        Date.now() - startTime < this.MAX_PROCESSING_TIME) {
        const frame = this.frameBuffer.shift();
        if (frame) {
          await this.sendFrameToRPM(frame);
        }
      }
    } finally {
      this.isProcessing = false;

      // Si il reste des frames à traiter, planifier le prochain traitement
      if (this.frameBuffer.length > 0) {
        requestAnimationFrame(() => this.processBuffer());
      }
    }
  }

  private async sendFrameToRPM(frame: Frame): Promise<void> {
    try {
      const morphTargets = this.convertFrameToMorphTargets(frame);
      await this.updateAvatarExpression(morphTargets);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la frame à RPM:', error);
      // On pourrait implémenter ici une stratégie de retry ou de fallback
    }
  }

  private convertFrameToMorphTargets(frame: Frame): MorphTargets {
    const morphTargets: MorphTargets = {};

    // Conversion des sourcils
    morphTargets.browInnerUp = frame.eyebrows.position * (frame.eyebrows.velocity > 0 ? 1 : 0.7);
    morphTargets.browOuterUpLeft = frame.eyebrows.position * 0.8;
    morphTargets.browOuterUpRight = frame.eyebrows.position * 0.8;

    // Conversion des yeux
    morphTargets.eyeWideLeft = frame.eyes.position * (frame.eyes.velocity > 0 ? 1 : 0.8);
    morphTargets.eyeWideRight = frame.eyes.position * (frame.eyes.velocity > 0 ? 1 : 0.8);
    morphTargets.eyeSquintLeft = Math.max(0, -frame.eyes.position);
    morphTargets.eyeSquintRight = Math.max(0, -frame.eyes.position);

    // Conversion de la bouche
    morphTargets.mouthOpen = frame.mouth.position;
    morphTargets.jawOpen = frame.mouth.position * 0.6;

    // Normalisation des valeurs
    for (const [key, value] of Object.entries(morphTargets)) {
      morphTargets[key] = Math.max(0, Math.min(1, value));
    }

    return morphTargets;
  }

  private async updateAvatarExpression(morphTargets: MorphTargets): Promise<void> {
    try {
      // Ici, vous implémenteriez l'appel réel à l'API RPM
      // Par exemple:
      await this.sendToRPMAPI(this.avatarId, morphTargets);
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de l'expression: ${error}`);
    }
  }

  private async sendToRPMAPI(avatarId: string, morphTargets: MorphTargets): Promise<void> {
    // Simulation d'un appel API
    // En production, remplacez ceci par votre véritable appel API RPM
    await new Promise(resolve => setTimeout(resolve, 5));
    console.log(`Mise à jour de l'avatar ${avatarId} avec:`, morphTargets);
  }

  // Méthodes utilitaires
  public clearBuffer(): void {
    this.frameBuffer = [];
    this.isProcessing = false;
  }

  public get bufferSize(): number {
    return this.frameBuffer.length;
  }

  public get isBufferFull(): boolean {
    return this.frameBuffer.length >= this.MAX_BUFFER_SIZE;
  }
}