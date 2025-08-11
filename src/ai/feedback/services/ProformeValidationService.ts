// src/ai/validation/types.ts

/**
 * Types de clubs thématiques pour la validation collaborative
 */
export enum ThematicClubType {
  HISTOIRE_LSF = 'histoire_lsf',
  ETYMOLOGIE = 'etymologie',
  PRATIQUES_CULTURELLES = 'pratiques_culturelles',
  INNOVATIONS_LINGUISTIQUES = 'innovations_linguistiques',
  REGISTRES_SPECIALISES = 'registres_specialises',
  ASPECTS_INTERNATIONAUX = 'aspects_internationaux'
}

/**
 * Niveaux d'expertise pour les validateurs
 */
export enum ExpertiseLevel {
  NOVICE = 'novice',
  INTERMEDIAIRE = 'intermediaire',
  AVANCE = 'avance',
  EXPERT = 'expert',
  NATIF = 'natif',
  FORMATEUR = 'formateur',
  CHERCHEUR = 'chercheur'
}

/**
 * Type pour les métadonnées des experts
 */
export interface ExpertMetadata {
  certifications?: string[];
  publications?: string[];
  languages?: string[];
  additionalTraining?: string[];
  specialProjects?: string[];
  [key: string]: unknown;
}

/**
 * Profil d'un expert validateur
 */
export interface ExpertProfile {
  /**
   * Identifiant unique de l'expert
   */
  id: string;

  /**
   * Nom de l'expert
   */
  name: string;

  /**
   * Niveau d'expertise
   */
  expertiseLevel: ExpertiseLevel;

  /**
   * Indique si l'expert est un locuteur natif de la LSF
   */
  isNative: boolean;

  /**
   * Domaines d'expertise spécifiques
   */
  specialties: string[];

  /**
   * Expérience en années
   */
  experience: number;

  /**
   * Affiliation (institution, association, etc.)
   */
  affiliation?: string;

  /**
   * Métadonnées additionnelles sur l'expert
   */
  metadata?: ExpertMetadata;
}

/**
 * Type pour le contenu à valider
 */
export type ValidationContent =
  | SignContent
  | TranslationContent
  | ExpressionContent
  | DocumentContent;

/**
 * Contenu de type signe
 */
export interface SignContent {
  type: 'sign';
  signId: string;
  video?: string;
  parameters: {
    handshape: string;
    location: string;
    movement: string;
    orientation: string;
    expression?: string;
  };
  variants?: string[];
}

/**
 * Contenu de type traduction
 */
export interface TranslationContent {
  type: 'translation';
  sourceText: string;
  targetSign: string;
  context?: string;
  alternativeTranslations?: string[];
}

/**
 * Contenu de type expression
 */
export interface ExpressionContent {
  type: 'expression';
  name: string;
  video?: string;
  intensity: number;
  components: string[];
  usageContext: string[];
}

/**
 * Contenu de type document
 */
export interface DocumentContent {
  type: 'document';
  title: string;
  content: string;
  language: string;
  format: 'text' | 'html' | 'markdown' | 'pdf';
}

/**
 * Type pour le contexte de validation
 */
export interface ValidationContext {
  region?: string;
  dialect?: string;
  audience?: string;
  domain?: string;
  purpose?: string;
  formality?: 'formal' | 'informal' | 'neutral';
  culturalNotes?: string[];
  [key: string]: unknown;
}

/**
 * Type pour les métadonnées de requête de validation
 */
export interface RequestMetadata {
  source: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  previousVersions?: string[];
  relatedRequests?: string[];
  [key: string]: unknown;
}

/**
 * Requête de validation collaborative
 */
export interface CollaborativeValidationRequest {
  /**
   * Identifiant unique de la requête
   */
  id?: string;

  /**
   * Type de contenu à valider
   */
  type: string;

  /**
   * Contenu à valider
   */
  content: ValidationContent;

  /**
   * Contexte pour la validation
   */
  context?: ValidationContext;

  /**
   * Date de soumission
   */
  submissionDate?: Date;

  /**
   * Date limite pour la validation
   */
  dueDate?: Date;

  /**
   * Nombre minimum de retours requis
   */
  minFeedbackRequired?: number;

  /**
   * Indique si une validation par un locuteur natif est requise
   */
  requiresNativeValidation?: boolean;

  /**
   * Métadonnées additionnelles sur la requête
   */
  metadata?: RequestMetadata;
}

/**
 * Type pour les suggestions d'amélioration
 */
export interface ImprovementProposal {
  field: string;
  currentValue: string | number | boolean;
  proposedValue: string | number | boolean;
  reason: string;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Retour d'un expert sur une validation
 */
export interface ValidationFeedback {
  /**
   * Identifiant unique du retour
   */
  id: string;

  /**
   * Identifiant de l'expert
   */
  expertId: string;

  /**
   * Identifiant de la validation
   */
  validationId: string;

  /**
   * Indique si le contenu est approuvé
   */
  approved: boolean;

  /**
   * Score d'évaluation (0-1)
   */
  score?: number;

  /**
   * Commentaires textuels
   */
  comments?: string;

  /**
   * Suggestions d'amélioration
   */
  suggestions?: ImprovementProposal[];

  /**
   * Indique si l'expert est un validateur natif
   */
  isNativeValidator: boolean;

  /**
   * Niveau de confiance dans l'évaluation (0-1)
   */
  confidence?: number;

  /**
   * Date du retour
   */
  timestamp: Date;
}

/**
 * Type pour les propositions d'amélioration du consensus
 */
export interface ConsensusImprovement {
  field: string;
  proposedValue: string | number | boolean;
  confidence: number;
  supportPercentage: number;
  implementationDifficulty: 'easy' | 'medium' | 'complex';
}

/**
 * Résultat d'un consensus de validation
 */
export interface ConsensusResult {
  /**
   * Identifiant de la validation
   */
  validationId: string;

  /**
   * Indique si le contenu est approuvé par consensus
   */
  approved: boolean;

  /**
   * Score global du consensus (0-1)
   */
  consensusScore: number;

  /**
   * Niveau d'accord entre les experts (0-1)
   */
  agreementLevel: number;

  /**
   * Liste des commentaires agrégés
   */
  aggregatedComments: string[];

  /**
   * Proposition d'amélioration finale
   */
  improveProposal?: Record<string, ConsensusImprovement>;

  /**
   * Nombre d'experts ayant participé
   */
  participantCount: number;

  /**
   * Répartition des votes (pour/contre)
   */
  voteDistribution: {
    approve: number;
    reject: number;
  };

  /**
   * Date du calcul du consensus
   */
  timestamp: Date;
}

/**
 * États possibles d'une validation collaborative
 */
export enum ValidationState {
  SUBMITTED = 'submitted',
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  FEEDBACK_COLLECTING = 'feedback_collecting',
  CONSENSUS_REACHED = 'consensus_reached',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_IMPROVEMENT = 'needs_improvement',
  INTEGRATED = 'integrated',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

/**
 * Types d'événements pour la validation collaborative
 */
export enum ValidationEventType {
  SUBMISSION = 'submission',
  FEEDBACK_ADDED = 'feedback_added',
  EXPERT_ADDED = 'expert_added',
  CONSENSUS_REACHED = 'consensus_reached',
  IMPROVEMENT_INTEGRATED = 'improvement_integrated',
  STATE_CHANGED = 'state_changed',
  VALIDATION_COMPLETED = 'validation_completed'
}

/**
 * Options pour le calcul du consensus
 */
export interface ConsensusOptions {
  /**
   * Algorithme de calcul du consensus
   */
  algorithm?: 'majority' | 'weighted' | 'delphi' | 'supermajority';

  /**
   * Seuil d'approbation (0-1)
   */
  approvalThreshold?: number;

  /**
   * Poids supplémentaires pour certains types d'experts
   */
  expertWeights?: Record<ExpertiseLevel, number>;

  /**
   * Bonus pour les validateurs natifs
   */
  nativeValidatorBonus?: number;

  /**
   * Nombre minimum de participants pour un consensus valide
   */
  minParticipants?: number;
}