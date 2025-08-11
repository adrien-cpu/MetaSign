// src/ai/errors/ErrorManager.ts

/**
 * Énumération des niveaux de sévérité des erreurs
 */
export enum ErrorSeverity {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
  CRITICAL = 3
}

/**
 * Interface pour les erreurs spécifiques à l'IA
 */
export interface AIError {
  id: string;
  message: string;
  code: string;
  severity: ErrorSeverity;
  timestamp: number;
  source: string;
  context?: Record<string, unknown>;
  stackTrace?: string;
}

/**
 * Interface pour la supervision humaine
 */
export interface HumanSupervisionInterface {
  notify(error: AIError): Promise<void>;
  acknowledge(errorId: string): Promise<void>;
  resolve(errorId: string, resolution: string): Promise<void>;
  getActiveAlerts(): Promise<AIError[]>;
}

/**
 * @class ErrorManager
 * @brief Gestionnaire d'erreurs pour le système d'IA
 * @details Gère la détection, le traitement et la correction des erreurs
 */
export class ErrorManager {
  /** 
   * @brief Map des erreurs actives
   * @private
   */
  private errors: Map<string, AIError> = new Map();

  /** 
   * @brief Interface de supervision humaine
   * @private
   */
  private humanSupervision: HumanSupervisionInterface;

  /**
   * Constructeur du gestionnaire d'erreurs
   * @param humanSupervision Interface de supervision humaine
   */
  constructor(humanSupervision: HumanSupervisionInterface) {
    this.humanSupervision = humanSupervision;
  }

  /**
   * @brief Gère une erreur détectée
   * @param error Erreur à traiter
   * @returns Promise<void>
   * @throws Error si la gestion échoue
   */
  async handleError(error: AIError): Promise<void> {
    // Stocker l'erreur
    this.errors.set(error.id, error);

    if (error.severity >= ErrorSeverity.HIGH) {
      await this.escalateToHuman(error);
    }
    await this.logError(error);
    await this.attemptAutoCorrection(error);
  }

  /**
   * @brief Tente une correction automatique
   * @param error Erreur à corriger
   * @returns Promise<boolean> True si correction réussie
   * @private
   */
  private async attemptAutoCorrection(error: AIError): Promise<boolean> {
    // Implémentation à venir - pour l'instant, on utilise le paramètre pour éviter l'avertissement
    console.debug(`Tentative de correction automatique pour l'erreur: ${error.id}`);
    return false;
  }

  /**
   * @brief Escalade l'erreur à la supervision humaine
   * @param error Erreur à escalader
   * @returns Promise<void>
   * @private
   */
  private async escalateToHuman(error: AIError): Promise<void> {
    await this.humanSupervision.notify(error);
  }

  /**
   * @brief Enregistre l'erreur dans les logs
   * @param error Erreur à logger
   * @returns Promise<void>
   * @private
   */
  private async logError(error: AIError): Promise<void> {
    // Implémentation à venir - pour l'instant, on utilise le paramètre pour éviter l'avertissement
    console.error(`[${error.severity}] ${error.code}: ${error.message}`, {
      errorDetails: {
        id: error.id,
        timestamp: error.timestamp,
        source: error.source,
        context: error.context
      }
    });
  }

  /**
   * @brief Récupère toutes les erreurs actives
   * @returns AIError[] Liste des erreurs actives
   */
  getActiveErrors(): AIError[] {
    return Array.from(this.errors.values());
  }

  /**
   * @brief Marque une erreur comme résolue
   * @param errorId ID de l'erreur résolue
   * @param resolution Description de la résolution
   * @returns Promise<boolean> True si l'erreur a été résolue
   */
  async resolveError(errorId: string, resolution: string): Promise<boolean> {
    const error = this.errors.get(errorId);
    if (!error) {
      return false;
    }

    // Notifier la supervision humaine
    await this.humanSupervision.resolve(errorId, resolution);

    // Supprimer l'erreur de la map
    this.errors.delete(errorId);

    return true;
  }
}