// src/ai/specialized/cultural/types.ts

// Contexte culturel
export interface CulturalContext {
  region: string;
  formalityLevel: FormalityLevel;
  markers: CulturalMarker[];
  specifics: CulturalSpecifics;
  timestamp: number;
}

export interface CulturalSpecifics {
  deafCultureMarkers: DeafCultureMarker[];
  regionalVariations: RegionalVariation[];
  customPractices: CustomPractice[];
  historicalContext?: unknown; // Référencé dans types-extended.ts
}

// Marqueurs culturels
export interface CulturalMarker {
  id: string;
  type: CulturalMarkerType;
  significance: number;
  attributes: MarkerAttributes;
  validation: MarkerValidation;
}

export type CulturalMarkerType =
  | 'DEAF_CULTURE'      // Marqueurs de la culture Sourde
  | 'REGIONAL'          // Spécificités régionales
  | 'GENERATIONAL'      // Variations générationnelles
  | 'SOCIAL'            // Marqueurs sociaux
  | 'INSTITUTIONAL'     // Marqueurs institutionnels
  | 'LINGUISTIC';       // Marqueurs linguistiques

export interface MarkerAttributes {
  origin: string;
  prevalence: number;
  evolution: EvolutionPattern[];
  contextualUse: ContextualUse[];
}

export interface MarkerValidation {
  validatedBy: string[];
  lastValidation: number;
  confidence: number;
  feedback: ValidationFeedback[];
}

// Culture Sourde
export interface DeafCultureMarker {
  type: DeafCultureType;
  expression: string;
  importance: number;
  context: DeafCultureContext;
}

export type DeafCultureType =
  | 'VISUAL_VERNACULAR'   // Expression visuelle naturelle
  | 'SPATIAL_GRAMMAR'     // Grammaire spatiale
  | 'CULTURAL_REFERENCE'  // Références culturelles
  | 'COMMUNITY_PRACTICE' // Pratiques communautaires
  | 'DEAF_PERSPECTIVE';   // Perspective Sourde

export interface DeafCultureContext {
  community: string[];
  historicalSignificance?: string;
  modernUsage: UsagePattern[];
  preservation: PreservationStatus;
}

// Variations régionales
export interface RegionalVariation {
  region: string;
  characteristics: RegionalCharacteristic[];
  influences: unknown[]; // CulturalInfluence défini dans types-extended.ts
  usage: unknown; // RegionalUsage défini dans types-extended.ts
}

export interface RegionalCharacteristic {
  type: CharacteristicType;
  description: string;
  prevalence: number;
  validation: ValidationStatus;
}

export type CharacteristicType =
  | 'LEXICAL'           // Variations lexicales
  | 'GRAMMATICAL'       // Variations grammaticales
  | 'EXPRESSION'        // Variations expressives
  | 'SOCIAL'           // Variations sociales
  | 'CONTEXTUAL';       // Variations contextuelles

// Niveaux de formalité
export type FormalityLevel =
  | 'VERY_FORMAL'      // Très formel (institutionnel)
  | 'FORMAL'           // Formel (professionnel)
  | 'SEMI_FORMAL'      // Semi-formel (situations mixtes)
  | 'INFORMAL'         // Informel (familier)
  | 'VERY_INFORMAL';   // Très informel (intime)

// Pratiques culturelles
export interface CustomPractice {
  name: string;
  description: string;
  context: PracticeContext;
  validation: unknown; // PracticeValidation défini dans types-extended.ts
}

export interface PracticeContext {
  settings: string[];
  participants: string[];
  frequency: unknown; // FrequencyPattern défini dans types-extended.ts
  evolution: unknown; // EvolutionStatus défini dans types-extended.ts
}

// Éléments culturels
export interface CulturalElement {
  id: string;
  type: ElementType;
  content: unknown;
  culturalSignificance: number;
  validation: unknown; // ElementValidation défini dans types-extended.ts
}

export type ElementType =
  | 'EXPRESSION'        // Expression LSF
  | 'GESTURE'           // Geste culturel
  | 'REFERENCE'         // Référence culturelle
  | 'PRACTICE'          // Pratique culturelle
  | 'INTERACTION';      // Mode d'interaction

// Adaptation
export interface AdaptedContext {
  elements: AdaptedElement[];
  markers: CulturalMarker[];
  metadata: AdaptationMetadata;
}

export interface AdaptedElement {
  original: CulturalElement;
  adaptations: Adaptation[];
  validation: AdaptationValidation;
}

export interface Adaptation {
  type: AdaptationType;
  changes: Change[];
  rationale: string;
  confidence: number;
}

export type AdaptationType =
  | 'CULTURAL'         // Adaptation culturelle
  | 'REGIONAL'         // Adaptation régionale
  | 'FORMAL'          // Adaptation de formalité
  | 'GENERATIONAL'    // Adaptation générationnelle
  | 'CONTEXTUAL';      // Adaptation contextuelle

// Validation
export interface ValidationStatus {
  isValid: boolean;
  confidence: number;
  validatedBy: string[];
  lastValidation: number;
}

export interface ValidationFeedback {
  source: string;
  type: FeedbackType;
  content: string;
  timestamp: number;
}

export type FeedbackType =
  | 'CORRECTION'       // Correction
  | 'SUGGESTION'       // Suggestion
  | 'CONFIRMATION'     // Confirmation
  | 'CLARIFICATION';   // Demande de clarification

// Métadonnées
export interface AdaptationMetadata {
  authenticity: number;
  confidence: number;
  timestamp: number;
}

// Types utilitaires
export interface UsagePattern {
  context: string[];
  frequency: number;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
}

export interface PreservationStatus {
  status: 'ACTIVE' | 'ENDANGERED' | 'STABLE' | 'GROWING';
  efforts: PreservationEffort[];
  documentation: DocumentationStatus;
}

export interface PreservationEffort {
  type: 'DOCUMENTATION' | 'EDUCATION' | 'PROMOTION';
  description: string;
  impact: number;
}

export interface DocumentationStatus {
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  sources: string[];
  lastUpdate: number;
}

export interface EvolutionPattern {
  period: string;
  changes: string[];
  influences: string[];
}

export interface ContextualUse {
  context: string;
  appropriateness: number;
  constraints: string[];
}

export interface Change {
  property: string;
  from: unknown;
  to: unknown;
  reason: string;
}

export interface AdaptationValidation {
  culturalAccuracy: number;
  regionalFit: number;
  formalityMatch: number;
  overallValidity: number;
}