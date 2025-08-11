// src/ai/errors/ErrorTypes.ts

/**
 * @enum ErrorSeverity
 * @brief Niveaux de sévérité des erreurs
 * @details Définit les différents niveaux de gravité des erreurs du système
 */
export enum ErrorSeverity {
  /** @brief Erreur mineure, impact minimal */
  LOW,
  /** @brief Erreur moyenne, impact modéré */
  MEDIUM,
  /** @brief Erreur importante, impact significatif */
  HIGH,
  /** @brief Erreur critique, impact majeur */
  CRITICAL
}

/**
 * @interface AIError
 * @brief Structure d'une erreur d'IA
 * @details Définit le format standard des erreurs dans le système
 */
export interface AIError {
  /** 
   * @brief Identifiant unique de l'erreur
   */
  id: string;

  /** 
   * @brief Type spécifique de l'erreur
   * @details Catégorisation de l'erreur (ex: 'validation', 'processing', etc.)
   */
  type: string;

  /** 
   * @brief Niveau de sévérité
   * @see ErrorSeverity
   */
  severity: ErrorSeverity;

  /** 
   * @brief Contexte de l'erreur
   * @details Informations supplémentaires sur les circonstances de l'erreur
   */
  context: Record<string, unknown>;

  /** 
   * @brief Horodatage de l'erreur
   */
  timestamp: Date;
}

/**
 * @class LSFValidationError
 * @brief Erreur spécifique à la validation LSF
 * @extends Error
 */
export class LSFValidationError extends Error implements AIError {
  public id: string;
  public type: string;
  public severity: ErrorSeverity;
  public context: Record<string, unknown>;
  public timestamp: Date;

  constructor(
    message: string,
    public issues: string[],
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ) {
    super(message);
    this.name = 'LSFValidationError';
    this.id = `LSF_${Date.now()}`;
    this.type = 'validation';
    this.severity = severity;
    this.context = { issues };
    this.timestamp = new Date();
  }
}

/**
 * @class RPMValidationError
 * @brief Erreur spécifique à la validation RPM
 * @extends Error
 */
export class RPMValidationError extends Error implements AIError {
  public id: string;
  public type: string;
  public severity: ErrorSeverity;
  public context: Record<string, unknown>;
  public timestamp: Date;

  constructor(
    message: string,
    public issues: string[],
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ) {
    super(message);
    this.name = 'RPMValidationError';
    this.id = `RPM_${Date.now()}`;
    this.type = 'validation';
    this.severity = severity;
    this.context = { issues };
    this.timestamp = new Date();
  }
}

/**
 * Erreur de validation pour les entrées utilisateur incorrectes
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Erreur de sécurité pour les problèmes liés à la sécurité
 */
export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}

/**
 * Erreur d'application pour les erreurs internes
 */
export class ApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApplicationError';
  }
}