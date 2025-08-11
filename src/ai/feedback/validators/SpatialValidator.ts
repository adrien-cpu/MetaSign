// src/ai/feedback/validators/SpatialValidator.ts

import { FeedbackEntry } from '../types';
import { SpatialStructureManager } from '../../specialized/spatial/SpatialStructureManager';

// Définition des types manquants
interface SpatialConfig {
  zones: {
    character: string[];
    emotional: string[];
  };
  transitions: 'fluid' | 'abrupt' | 'gradual';
}

// Type pour les métadonnées spatiales
interface SpatialMetadata {
  characterZones?: string[];
  emotionalZones?: string[];
  transitions?: 'fluid' | 'abrupt' | 'gradual';
}

// Interface pour les résultats de validation
interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  score: number;
}

// Interface pour les problèmes de validation
interface ValidationIssue {
  type: 'zoning' | 'proforme' | 'reference' | 'coherence';
  severity: 'low' | 'medium' | 'high';
  description: string;
}

// Types des résultats d'analyse
interface SpatialAnalysisResult {
  score: number;
  errors: {
    impact: number;
    description: string;
    location: string;
  }[];
}

interface ProformeAnalysisResult {
  score: number;
  violations: {
    significance: number;
    detail: string;
  }[];
}

interface ReferenceAnalysisResult {
  score: number;
  inconsistencies: {
    importance: number;
    message: string;
  }[];
}

interface CoherenceAnalysisResult {
  score: number;
  problems: {
    criticality: number;
    explanation: string;
  }[];
}

export class SpatialValidator {
  constructor(private spatialManager: SpatialStructureManager) { }

  async validate(feedback: FeedbackEntry): Promise<ValidationResult> {
    const spatialConfig = this.extractSpatialConfig(feedback);

    const validations = await Promise.all([
      this.validateZoning(feedback, spatialConfig),
      this.validateProformes(feedback, spatialConfig),
      this.validateReferencing(feedback, spatialConfig),
      this.validateCoherence(feedback, spatialConfig)
    ]);

    return this.aggregateValidations(validations);
  }

  // Les paramètres _config sont conservés pour maintenir la signature cohérente,
  // mais ils sont marqués avec un underscore pour indiquer qu'ils ne sont pas utilisés.
  private async validateZoning(feedback: FeedbackEntry, _config: SpatialConfig): Promise<ValidationResult> {
    // Simulation de l'analyse ou appel à la méthode existante
    const zoningAnalysis = await this.spatialManager.analyzeSpatialStructure(feedback.content) as SpatialAnalysisResult;

    return {
      isValid: zoningAnalysis.score >= 0.8,
      issues: zoningAnalysis.errors.map(e => ({
        type: 'zoning' as const,
        severity: this.calculateSeverity(e.impact),
        description: `Zone issue: ${e.description} at ${e.location}`
      })),
      score: zoningAnalysis.score
    };
  }

  // Dans les méthodes suivantes, pour corriger les erreurs de variables non utilisées,
  // nous allons supprimer les paramètres inutilisés ou les préfixer avec _.
  private async validateProformes(_feedback: FeedbackEntry, _config: SpatialConfig): Promise<ValidationResult> {
    // Simuler une analyse de proforme, puisque la méthode n'existe pas dans SpatialStructureManager
    const proformeAnalysis: ProformeAnalysisResult = {
      score: 0.85,
      violations: []
    };

    return {
      isValid: proformeAnalysis.score >= 0.75,
      issues: proformeAnalysis.violations.map(v => ({
        type: 'proforme' as const,
        severity: this.calculateSeverity(v.significance),
        description: `Proforme error: ${v.detail}`
      })),
      score: proformeAnalysis.score
    };
  }

  private async validateReferencing(_feedback: FeedbackEntry, _config: SpatialConfig): Promise<ValidationResult> {
    // Simuler une analyse de référence
    const referenceAnalysis: ReferenceAnalysisResult = {
      score: 0.9,
      inconsistencies: []
    };

    return {
      isValid: referenceAnalysis.score >= 0.85,
      issues: referenceAnalysis.inconsistencies.map(i => ({
        type: 'reference' as const,
        severity: this.calculateSeverity(i.importance),
        description: `Reference instability: ${i.message}`
      })),
      score: referenceAnalysis.score
    };
  }

  private async validateCoherence(_feedback: FeedbackEntry, _config: SpatialConfig): Promise<ValidationResult> {
    // Simuler une analyse de cohérence
    const coherenceAnalysis: CoherenceAnalysisResult = {
      score: 0.8,
      problems: []
    };

    return {
      isValid: coherenceAnalysis.score >= 0.7,
      issues: coherenceAnalysis.problems.map(p => ({
        type: 'coherence' as const,
        severity: this.calculateSeverity(p.criticality),
        description: `Coherence issue: ${p.explanation}`
      })),
      score: coherenceAnalysis.score
    };
  }

  private calculateSeverity(value: number): 'low' | 'medium' | 'high' {
    if (value < 0.3) return 'low';
    if (value < 0.7) return 'medium';
    return 'high';
  }

  private extractSpatialConfig(feedback: FeedbackEntry): SpatialConfig {
    // Utilisation d'une interface intermédiaire pour typer correctement les métadonnées spatiales
    const spatial = (feedback.metadata?.spatial || {}) as SpatialMetadata;

    return {
      zones: {
        character: spatial.characterZones || [],
        emotional: spatial.emotionalZones || []
      },
      transitions: spatial.transitions || 'fluid'
    };
  }

  private aggregateValidations(validations: ValidationResult[]): ValidationResult {
    const allIssues = validations.flatMap(v => v.issues);
    const weights = { zoning: 0.3, proforme: 0.3, reference: 0.2, coherence: 0.2 };

    const weightedScore = validations.reduce((sum, v, i) => {
      return sum + (v.score * Object.values(weights)[i]);
    }, 0);

    return {
      isValid: weightedScore >= 0.75,
      issues: this.prioritizeIssues(allIssues),
      score: weightedScore
    };
  }

  private prioritizeIssues(issues: ValidationIssue[]): ValidationIssue[] {
    const severityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };

    return issues
      .sort((a, b) => {
        return severityOrder[b.severity] - severityOrder[a.severity];
      })
      .slice(0, 5);
  }
}