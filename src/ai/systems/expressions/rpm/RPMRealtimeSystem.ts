/**
 * @class RPMRealtimeSystem
 * @brief Système temps réel RPM
 * @details Gère les mises à jour en temps réel des expressions via WebSocket
 */

// Import uniquement RPMError de types.ts
import { RPMError } from './types';

// Définir les interfaces localement pour éviter les erreurs d'importation
interface IWebSocketClient {
  sendLiveUpdate(morphTargets: unknown): Promise<void>;
}

interface IStateManager {
  getCurrentState(): { morphTargets?: unknown };
}

interface IRecoverySystem {
  recoverFromError(error: RPMError): Promise<void>;
}

export class RPMRealtimeSystem {
  /** 
   * @brief Client WebSocket RPM
   * @private 
   */
  private wsClient: IWebSocketClient;

  /** 
   * @brief Gestionnaire d'état RPM
   * @private 
   */
  private stateManager: IStateManager;

  /** 
   * @brief Système de récupération
   * @private 
   */
  private recoverySystem: IRecoverySystem;

  /** 
   * @brief Horodatage dernière mise à jour
   * @private 
   */
  private lastUpdateTime: number = 0;

  /**
   * @brief Constructeur
   * @details Initialise les systèmes en utilisant l'injection de dépendances
   */
  constructor(
    wsClient: IWebSocketClient,
    stateManager: IStateManager,
    recoverySystem: IRecoverySystem
  ) {
    this.wsClient = wsClient;
    this.stateManager = stateManager;
    this.recoverySystem = recoverySystem;
    this.setupRealtimeUpdates();
  }

  /**
   * @brief Configure les mises à jour temps réel
   * @private
   */
  private setupRealtimeUpdates(): void {
    const UPDATE_INTERVAL = 16.67; // ~60fps

    setInterval(async () => {
      const now = performance.now();
      const timeSinceLastUpdate = now - this.lastUpdateTime;

      if (timeSinceLastUpdate >= UPDATE_INTERVAL) {
        await this.sendUpdate();
        this.lastUpdateTime = now;
      }
    }, UPDATE_INTERVAL);
  }

  /**
   * @brief Envoie une mise à jour d'état
   * @returns Promise<void>
   * @throws RPMUpdateError En cas d'échec d'envoi
   * @private
   */
  private async sendUpdate(): Promise<void> {
    try {
      const currentState = this.stateManager.getCurrentState();

      // S'assurer que morphTargets existe avant d'y accéder
      if (currentState && currentState.morphTargets) {
        await this.wsClient.sendLiveUpdate(currentState.morphTargets);
      }
    } catch (error) {
      // Créer une erreur RPM à partir de l'erreur attrapée
      const rpmError = new RPMError(
        error instanceof Error ? error.message : 'Unknown error'
      );

      await this.recoverySystem.recoverFromError(rpmError);
    }
  }
}