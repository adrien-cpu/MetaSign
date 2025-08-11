// src/ai/systems/expressions/rpm/RPMIntegrationSystem.ts

import { RPMMorphTargets } from './RPMMorphTargets';
import { RPMAPIClient } from './RPMAPIClient';
import { RPMEventEmitter } from './RPMEventEmitter';
import { RPMSynchronizer } from './RPMSynchronizationSystem';

export class RPMIntegrationSystem extends RPMEventEmitter {
  private apiClient: RPMAPIClient;
  private synchronizer: RPMSynchronizer;
  private currentState: RPMState;
  private readonly UPDATE_INTERVAL = 16.67; // ~60fps

  constructor() {
    super();
    this.apiClient = new RPMAPIClient();
    this.synchronizer = new RPMSynchronizer();
    this.currentState = this.initializeState();
    this.setupRealtimeUpdates();
  }

  async initializeAvatar(avatarId: string): Promise<void> {
    try {
      // Initialisation de l'avatar avec RPM
      await this.apiClient.initializeAvatar(avatarId);

      // Configuration du système de synchronisation
      await this.synchronizer.initialize(avatarId);

      // Configuration des morph targets par défaut
      await this.setupDefaultMorphTargets();

      this.emit('avatar-initialized', { avatarId });
    } catch (error) {
      throw new RPMIntegrationError('Failed to initialize avatar', error);
    }
  }

  async applyExpression(
    expression: LSFExpression,
    timing: ExpressionTiming
  ): Promise<void> {
    try {
      // Conversion de l'expression LSF en morph targets RPM
      const morphTargets = await this.convertToMorphTargets(expression);

      // Validation des morph targets
      await this.validateMorphTargets(morphTargets);

      // Application synchronisée des morph targets
      await this.synchronizer.synchronizeExpression(morphTargets, timing);

      // Mise à jour de l'état
      this.updateState(morphTargets);

      this.emit('expression-applied', { expression, morphTargets });
    } catch (error) {
      throw new RPMIntegrationError('Failed to apply expression', error);
    }
  }

  async updateExpressionInRealtime(
    updates: ExpressionUpdate[]
  ): Promise<void> {
    try {
      // Traitement des mises à jour en temps réel
      const morphUpdates = await this.processRealtimeUpdates(updates);

      // Application des mises à jour avec interpolation
      await this.synchronizer.applyRealtimeUpdates(morphUpdates);

      this.emit('expression-updated', { updates, morphUpdates });
    } catch (error) {
      throw new RPMIntegrationError('Failed to update expression', error);
    }
  }

  private async setupRealtimeUpdates(): Promise<void> {
    setInterval(async () => {
      try {
        // Vérification des mises à jour en attente
        const pendingUpdates = await this.synchronizer.getPendingUpdates();
        if (pendingUpdates.length > 0) {
          await this.processAndApplyUpdates(pendingUpdates);
        }

        // Vérification de la synchronisation
        await this.checkSynchronization();
      } catch (error) {
        this.handleRealtimeError(error);
      }
    }, this.UPDATE_INTERVAL);
  }

  private async convertToMorphTargets(
    expression: LSFExpression
  ): Promise<RPMMorphTargets> {
    // Conversion des composants LSF en morph targets
    const facialMorphs = await this.convertFacialComponents(expression.facial);
    const gazeTargets = await this.convertGazeComponents(expression.gaze);
    const headMorphs = await this.convertHeadComponents(expression.head);
    const bodyMorphs = await this.convertBodyComponents(expression.body);

    return this.combineMorphTargets([
      facialMorphs,
      gazeTargets,
      headMorphs,
      bodyMorphs
    ]);
  }

  private async validateMorphTargets(
    morphTargets: RPMMorphTargets
  ): Promise<void> {
    // Validation des limites des morph targets
    if (!this.areWithinLimits(morphTargets)) {
      throw new RPMValidationError('Morph targets exceed limits');
    }

    // Validation des combinaisons
    if (!this.areValidCombinations(morphTargets)) {
      throw new RPMValidationError('Invalid morph target combinations');
    }

    // Validation de la performance
    if (!this.meetsPerformanceRequirements(morphTargets)) {
      throw new RPMValidationError('Performance requirements not met');
    }
  }

  private async processRealtimeUpdates(
    updates: ExpressionUpdate[]
  ): Promise<MorphUpdate[]> {
    return Promise.all(updates.map(async update => ({
      targets: await this.convertToMorphTargets(update.expression),
      timing: update.timing,
      priority: update.priority
    })));
  }

  private async processAndApplyUpdates(
    updates: PendingUpdate[]
  ): Promise<void> {
    // Tri des mises à jour par priorité
    const sortedUpdates = this.sortUpdatesByPriority(updates);

    // Application des mises à jour
    for (const update of sortedUpdates) {
      await this.synchronizer.applyUpdate(update);
      this.updateState(update.morphTargets);
    }
  }

  private async checkSynchronization(): Promise<void> {
    const syncStatus = await this.synchronizer.checkStatus();
    if (!syncStatus.isSynchronized) {
      await this.handleDesynchronization(syncStatus);
    }
  }

  private updateState(morphTargets: RPMMorphTargets): void {
    this.currentState = {
      ...this.currentState,
      morphTargets,
      lastUpdate: Date.now()
    };
  }

  private async convertFacialComponents(
    facial: FacialComponents
  ): Promise<Partial<RPMMorphTargets>> {
    // ...existing code...
  }

  private async convertGazeComponents(
    gaze: GazeComponents
  ): Promise<Partial<RPMMorphTargets>> {
    // ...existing code...
  }

  private async convertHeadComponents(
    head: HeadComponents
  ): Promise<Partial<RPMMorphTargets>> {
    // ...existing code...
  }

  private async convertBodyComponents(
    body: BodyComponents
  ): Promise<Partial<RPMMorphTargets>> {
    // ...existing code...
  }

  private combineMorphTargets(
    morphSets: Array<Partial<RPMMorphTargets>>
  ): RPMMorphTargets {
    // ...existing code...
  }

  private async handleDesynchronization(
    status: SynchronizationStatus
  ): Promise<void> {
    // ...existing code...
  }

  private areWithinLimits(morphTargets: RPMMorphTargets): boolean {
    // ...existing code...
  }

  private areValidCombinations(morphTargets: RPMMorphTargets): boolean {
    // ...existing code...
  }

  private meetsPerformanceRequirements(morphTargets: RPMMorphTargets): boolean {
    // ...existing code...
  }

  private sortUpdatesByPriority(updates: PendingUpdate[]): PendingUpdate[] {
    return [...updates].sort((a, b) => b.priority - a.priority);
  }

  private async setupDefaultMorphTargets(): Promise<void> {
    const defaultMorphs: Partial<RPMMorphTargets> = {
      browInnerUp: 0,
      browOuterUpLeft: 0,
      browOuterUpRight: 0,
      eyeSquintLeft: 0,
      eyeSquintRight: 0,
      // ... autres valeurs par défaut
    };

    await this.synchronizer.initializeMorphTargets(defaultMorphs);
  }

  private initializeState(): RPMState {
    return {
      morphTargets: {} as RPMMorphTargets,
      lastUpdate: Date.now(),
      status: 'IDLE',
      performanceMetrics: {
        fps: 60,
        frameTime: 16.67,
        syncDelay: 0
      }
    };
  }

  private handleRealtimeError(error: unknown): void {
    this.currentState.status = 'ERROR';
    this.emit('realtime-error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
      state: this.currentState
    });
  }
}

interface RPMState {
  morphTargets: RPMMorphTargets;
  lastUpdate: number;
  status: RPMStatus;
  performanceMetrics?: {
    fps: number;
    frameTime: number;
    syncDelay: number;
  };
}

type RPMStatus = 'IDLE' | 'UPDATING' | 'ERROR';

interface ExpressionUpdate {
  expression: LSFExpression;
  timing: ExpressionTiming;
  priority: number;
  metadata?: {
    source: string;
    timestamp: number;
    version: string;
  };
}

interface MorphUpdate {
  targets: RPMMorphTargets;
  timing: ExpressionTiming;
  priority: number;
}

interface PendingUpdate extends MorphUpdate {
  id: string;
  timestamp: number;
}

interface LSFExpression {
  facial: FacialComponents;
  gaze: GazeComponents;
  head: HeadComponents;
  body: BodyComponents;
}

interface FacialComponents {
  eyebrows?: EyebrowConfiguration;
  eyes?: EyeConfiguration;
  mouth?: MouthConfiguration;
  cheeks?: CheekConfiguration;
}

interface GazeComponents {
  direction: Vector3D;
  intensity: number;
  target?: string;
}

interface HeadComponents {
  rotation: Vector3D;
  tilt?: number;
  nod?: NodConfiguration;
}

interface BodyComponents {
  posture: PostureConfiguration;
  tension: number;
}

interface Vector3D {
  x: number;
  y: number;
  z: number;
}

interface ExpressionTiming {
  duration: number;
  delay?: number;
  easing?: string;
}

interface SynchronizationStatus {
  isSynchronized: boolean;
  lastSyncTime: number;
  divergence?: {
    morphTargets: Partial<RPMMorphTargets>;
    timestamp: number;
  };
}

class RPMIntegrationError extends Error {
  constructor(message: string, public readonly context: unknown) {
    super(message);
    this.name = 'RPMIntegrationError';
  }
}

class RPMValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RPMValidationError';
  }
}

// Ajout des configurations manquantes
interface EyebrowConfiguration {
  leftRaise: number;
  rightRaise: number;
  compression: number;
  tension: number;
}

interface EyeConfiguration {
  leftOpen: number;
  rightOpen: number;
  squint: number;
  gaze: Vector3D;
}

interface MouthConfiguration {
  opening: number;
  stretch: number;
  tension: number;
  corners: {
    left: number;
    right: number;
  };
}

interface CheekConfiguration {
  leftRaise: number;
  rightRaise: number;
  inflation: number;
}

interface NodConfiguration {
  amplitude: number;
  frequency: number;
  decay: number;
}

interface PostureConfiguration {
  spine: {
    bend: number;
    twist: number;
    tilt: number;
  };
  shoulders: {
    raise: number;
    forward: number;
  };
  tension: number;
}