// src/ai/systems/expressions/rpm/RPMMorphProcessor.ts
class RPMMorphProcessor {
 private morphHistory: MorphUpdate[] = [];
 private interpolator: MorphInterpolator;

 constructor() {
   this.interpolator = new MorphInterpolator();
 }

 async processMorphUpdate(update: MorphUpdate): Promise<ProcessingResult> {
   const validatedUpdate = await this.validateMorphUpdate(update);
   const interpolatedMorphs = this.interpolator.interpolate(validatedUpdate);
   
   this.morphHistory.push(validatedUpdate);
   if (this.morphHistory.length > 100) {
     this.morphHistory.shift();
   }

   return {
     success: true,
     processedMorphs: interpolatedMorphs,
     timestamp: Date.now()
   };
 }

 private async validateMorphUpdate(update: MorphUpdate): Promise<MorphUpdate> {
   if (!this.isValidMorphRange(update)) {
     throw new RPMError('Invalid morph target values');
   }
   return this.normalizeMorphValues(update);
 }
}
import { ExpressionType, LSFParameters } from '../types';

interface MorphBatchConfig {
  batchSize: number;
  frameThreshold: number;
  priorityRules: Map<ExpressionType, number>;
}

export class RPMMorphProcessor {
  private batchConfig: MorphBatchConfig;

  constructor(config: MorphBatchConfig) {
    this.batchConfig = config;
  }

  // Nouvelle méthode pour traiter les expressions LSF
  async processLSFExpression(parameters: LSFParameters) {
    const morphTargets = this.convertLSFToMorphTargets(parameters);
    return this.processMorphTargets(morphTargets);
  }

  private convertLSFToMorphTargets(params: LSFParameters) {
    // Conversion des paramètres LSF en cibles morph
    const { head, eyes, eyebrows } = params;
    return {
      headTilt: head.tilt,
      headNod: head.nod,
      eyeSquint: eyes.squint,
      eyebrowRaise: eyebrows.raise,
      // ... autres conversions
    };
  }
}