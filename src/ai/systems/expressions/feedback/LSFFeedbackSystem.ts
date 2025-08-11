// src/ai/systems/expressions/feedback/LSFFeedbackSystem.ts
import {
  LSFFeedback,
  ValidatedFeedback,
  UserExpertise,
  ContextIssue,
  AnalyzedContextIssue,
  GrammaticalFeedback,
  GrammaticalSuggestion,
  ExpressionFeedback,
  ExpressionAdjustment,
  FeedbackAnalysis,
  ExpressionModification,
  ExpertiseLevel
} from '@ai-types/feedback';

/**
 * Classe pour stocker et gérer les données de feedback
 */
class FeedbackDatabase {
  private feedback: Map<string, ValidatedFeedback[]> = new Map();
  private contextualRules: Map<string, number> = new Map();
  private grammaticalRules: Map<string, number> = new Map();
  private expressionParameters: Map<string, number> = new Map();

  async storeFeedback(feedback: ValidatedFeedback): Promise<void> {
    const userFeedback = this.feedback.get(feedback.userId) || [];
    userFeedback.push(feedback);
    this.feedback.set(feedback.userId, userFeedback);
  }

  async updateContextualRule(ruleType: string, adjustmentFactor: number): Promise<void> {
    const currentValue = this.contextualRules.get(ruleType) || 0.5;
    this.contextualRules.set(ruleType, currentValue + adjustmentFactor);
  }

  async updateGrammaticalRule(ruleId: string, adjustmentFactor: number): Promise<void> {
    const currentValue = this.grammaticalRules.get(ruleId) || 0.5;
    this.grammaticalRules.set(ruleId, currentValue + adjustmentFactor);
  }

  async updateExpressionParameter(parameter: string, adjustmentFactor: number): Promise<void> {
    const currentValue = this.expressionParameters.get(parameter) || 0.5;
    this.expressionParameters.set(parameter, currentValue + adjustmentFactor);
  }
}

export class LSFFeedbackSystem {
  private feedbackDatabase: FeedbackDatabase;
  private readonly LEARNING_RATE = 0.1;

  constructor() {
    this.feedbackDatabase = new FeedbackDatabase();
  }

  /**
   * Traite le feedback reçu de l'utilisateur
   * @param feedback Le feedback brut reçu
   */
  async processFeedback(feedback: LSFFeedback): Promise<void> {
    // Valider le feedback
    const validatedFeedback = await this.validateFeedback(feedback);

    // Analyser le feedback
    const analysis = await this.analyzeFeedback(validatedFeedback);

    // Stocker le feedback et son analyse
    await this.feedbackDatabase.storeFeedback(validatedFeedback);

    // Appliquer les ajustements basés sur le feedback
    await this.applyFeedbackAdjustments(analysis);
  }

  /**
   * Évalue le niveau d'expertise d'un utilisateur
   * @returns Le niveau d'expertise évalué
   */
  private async assessUserExpertise(): Promise<UserExpertise> {
    // Logique pour évaluer l'expertise basée sur l'historique et le profil
    // Pour l'instant retournons une valeur par défaut
    return {
      level: 'ADVANCED_SIGNER' as ExpertiseLevel,
      yearsOfExperience: 0
    };
  }

  /**
   * Calcule la fiabilité d'un feedback basé sur sa cohérence et source
   * @returns Score de fiabilité entre 0 et 1
   */
  private async calculateFeedbackReliability(): Promise<number> {
    // Logique pour évaluer la fiabilité du feedback
    // Valeur par défaut modérée
    return 0.7;
  }

  /**
   * Valide le feedback et enrichit avec des métadonnées
   * @param feedback Le feedback brut
   * @returns Le feedback validé et enrichi
   */
  private async validateFeedback(feedback: LSFFeedback): Promise<ValidatedFeedback> {
    // Vérifier l'authenticité et la pertinence du feedback
    const userExpertise = await this.assessUserExpertise();
    const feedbackReliability = await this.calculateFeedbackReliability();

    return {
      ...feedback,
      reliability: feedbackReliability,
      expertise: userExpertise,
      timestamp: Date.now()
    };
  }

  /**
   * Analyse le feedback validé pour en extraire des insights et actions
   * @param feedback Le feedback validé
   * @returns Analyse complète du feedback
   */
  private async analyzeFeedback(feedback: ValidatedFeedback): Promise<FeedbackAnalysis> {
    const analysis: FeedbackAnalysis = {
      contextualIssues: [],
      grammaticalSuggestions: [],
      expressionAdjustments: [],
      culturalNotes: [],
      confidence: 0
    };

    // Analyser les problèmes contextuels
    if (feedback.contextIssues) {
      analysis.contextualIssues = await this.analyzeContextualIssues(
        feedback.contextIssues,
        feedback.expertise
      );
    }

    // Analyser les suggestions grammaticales
    if (feedback.grammaticalFeedback) {
      analysis.grammaticalSuggestions = await this.analyzeGrammaticalFeedback(
        feedback.grammaticalFeedback,
        feedback.reliability
      );
    }

    // Analyser les ajustements d'expression
    if (feedback.expressionFeedback) {
      analysis.expressionAdjustments = await this.analyzeExpressionFeedback(
        feedback.expressionFeedback
      );
    }

    // Calculer la confiance globale dans l'analyse
    analysis.confidence = this.calculateAnalysisConfidence(analysis);

    return analysis;
  }

  /**
   * Calcule la confiance globale dans l'analyse du feedback
   * @param analysis L'analyse à évaluer
   * @returns Score de confiance entre 0 et 1
   */
  private calculateAnalysisConfidence(analysis: FeedbackAnalysis): number {
    // Calcul de la confiance moyenne sur tous les aspects analysés
    const confidences: number[] = [];

    if (analysis.contextualIssues.length > 0) {
      const avgConfidence = analysis.contextualIssues.reduce(
        (sum, issue) => sum + issue.confidence, 0
      ) / analysis.contextualIssues.length;
      confidences.push(avgConfidence);
    }

    if (analysis.grammaticalSuggestions.length > 0) {
      const avgConfidence = analysis.grammaticalSuggestions.reduce(
        (sum, suggestion) => sum + suggestion.confidence, 0
      ) / analysis.grammaticalSuggestions.length;
      confidences.push(avgConfidence);
    }

    if (analysis.expressionAdjustments.length > 0) {
      const avgPriority = analysis.expressionAdjustments.reduce(
        (sum, adj) => sum + adj.priority, 0
      ) / analysis.expressionAdjustments.length;
      confidences.push(avgPriority);
    }

    return confidences.length > 0
      ? confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length
      : 0.5;
  }

  /**
   * Analyse les problèmes contextuels identifiés
   * @param issues Liste des problèmes contextuels
   * @param expertise Niveau d'expertise de l'utilisateur
   * @returns Liste des problèmes analysés
   */
  private async analyzeContextualIssues(
    issues: ContextIssue[],
    expertise: UserExpertise
  ): Promise<AnalyzedContextIssue[]> {
    return issues.map(issue => {
      const severity = this.calculateIssueSeverity(issue, expertise);
      return {
        type: issue.type,
        description: issue.description || `Problème de type ${issue.type}`,
        severity,
        impact: severity * 0.8, // Convertir l'impact en nombre simple
        suggestedFixes: this.generateFixSuggestions(issue),
        confidence: this.calculateIssueConfidence(issue, expertise)
      };
    });
  }

  /**
   * Évalue l'impact d'un problème contextuel
   * @param issue Le problème à évaluer
   * @returns Évaluation de l'impact
   */
  private assessIssueImpact(issue: ContextIssue): number {
    // Analyse de l'impact global
    return issue.impactLevel ? issue.impactLevel * 0.85 : 0.5;
  }

  /**
   * Génère des suggestions de correction pour un problème
   * @param issue Le problème à corriger
   * @returns Liste des corrections suggérées
   */
  private generateFixSuggestions(issue: ContextIssue): string[] {
    // Génération de suggestions basées sur le type de problème
    switch (issue.type) {
      case 'SPATIAL_INCONSISTENCY':
        return ['Maintenir une référence spatiale cohérente', 'Réinitialiser l\'espace avant nouvelle référence'];
      case 'TEMPORAL_SEQUENCE':
        return ['Clarifier l\'ordre temporel avec des marqueurs dédiés'];
      default:
        return ['Vérifier la cohérence contextuelle'];
    }
  }

  /**
   * Calcule la confiance dans l'identification d'un problème
   * @param issue Le problème identifié
   * @param expertise L'expertise de l'utilisateur
   * @returns Score de confiance entre 0 et 1
   */
  private calculateIssueConfidence(issue: ContextIssue, expertise: UserExpertise): number {
    const baseConfidence = 0.6;
    const expertiseWeight = this.calculateExpertiseWeight(expertise);
    return Math.min(1, baseConfidence * expertiseWeight);
  }

  /**
   * Analyse les feedbacks grammaticaux
   * @param feedback Le feedback grammatical
   * @param reliability La fiabilité globale du feedback
   * @returns Liste des suggestions analysées
   */
  private async analyzeGrammaticalFeedback(
    feedback: GrammaticalFeedback,
    reliability: number
  ): Promise<GrammaticalSuggestion[]> {
    return feedback.points.map(point => {
      const priority = this.calculateSuggestionPriority(point, reliability);
      return {
        rule: point.rule,
        suggestion: point.suggestion,
        priority,
        applicability: 0.85, // Valeur simple de l'applicabilité
        confidence: reliability * this.calculateSuggestionConfidence()
      };
    });
  }

  /**
   * Calcule la priorité d'une suggestion grammaticale
   * @param point Le point grammatical
   * @param reliability La fiabilité du feedback
   * @returns Score de priorité entre 0 et 1
   */
  private calculateSuggestionPriority(
    point: { rule: string; suggestion: string },
    reliability: number
  ): number {
    // Logique pour déterminer la priorité de la suggestion
    return Math.min(1, 0.7 * reliability);
  }

  /**
   * Évalue l'applicabilité d'une suggestion grammaticale
   * @returns Évaluation de l'applicabilité
   */
  private assessSuggestionApplicability(): number {
    // Évaluation simplifiée de l'applicabilité
    return 0.8;
  }

  /**
   * Calcule la confiance dans une suggestion grammaticale
   * @returns Score de confiance entre 0 et 1
   */
  private calculateSuggestionConfidence(): number {
    // Logique pour déterminer la confiance dans cette suggestion
    return 0.8; // Valeur par défaut élevée pour les règles grammaticales
  }

  /**
   * Analyse les feedbacks d'expression
   * @param feedback Le feedback d'expression
   * @returns Liste des ajustements analysés
   */
  private async analyzeExpressionFeedback(
    feedback: ExpressionFeedback
  ): Promise<ExpressionAdjustment[]> {
    return feedback.adjustments.map(adjustment => {
      const priority = this.calculateAdjustmentPriority(adjustment);
      const modifiedChange = this.convertToExpressionModification(adjustment.change);
      return {
        component: adjustment.component,
        suggestedChange: modifiedChange,
        priority,
        impact: priority * 0.9, // Convertir impact en nombre simple
        culturalRelevance: this.evaluateCulturalRelevance(adjustment)
      };
    });
  }

  /**
   * Convertit une string ou un ExpressionModification en ExpressionModification
   * @param modification La modification à convertir
   * @returns ExpressionModification
   */
  private convertToExpressionModification(modification: ExpressionModification): ExpressionModification {
    if (typeof modification === 'string') {
      // Si c'est une string, retourner tel quel (car ExpressionModification peut être une string)
      return modification;
    }
    return modification;
  }

  /**
   * Convertit un objet ExpressionModification en string pour affichage
   * @param modification L'objet modification
   * @returns Chaîne décrivant la modification
   */
  private expressionModificationToString(modification: ExpressionModification): string {
    if (typeof modification === 'string') {
      return modification;
    }

    // Convertir l'objet en chaîne représentative
    if ('intensity' in modification) {
      return `Modifier l'intensité à ${modification.intensity}`;
    } else if ('timing' in modification) {
      return `Ajuster le timing à ${modification.timing}`;
    } else if ('position' in modification) {
      return `Repositionner à ${JSON.stringify(modification.position)}`;
    }

    return JSON.stringify(modification);
  }

  /**
   * Calcule la priorité d'un ajustement d'expression
   * @param adjustment L'ajustement proposé
   * @returns Score de priorité entre 0 et 1
   */
  private calculateAdjustmentPriority(
    adjustment: { component: string; change: ExpressionModification; reason?: string }
  ): number {
    // Logique pour déterminer la priorité de l'ajustement
    switch (adjustment.component) {
      case 'FACIAL_EXPRESSION':
        return 0.9; // Haute priorité pour les expressions faciales
      case 'HAND_CONFIGURATION':
        return 0.85;
      default:
        return 0.7;
    }
  }

  /**
   * Évalue l'impact d'un ajustement d'expression
   * @param adjustment L'ajustement à évaluer
   * @returns Évaluation de l'impact
   */
  private assessAdjustmentImpact(
    adjustment: { component: string; change: ExpressionModification; reason?: string }
  ): number {
    // Analyse de l'impact global
    return adjustment.component === 'FACIAL_EXPRESSION' ? 0.9 : 0.7;
  }

  /**
   * Évalue la pertinence culturelle d'un ajustement
   * @param adjustment L'ajustement à évaluer
   * @returns Score de pertinence culturelle entre 0 et 1
   */
  private evaluateCulturalRelevance(
    adjustment: { component: string; change: ExpressionModification; reason?: string }
  ): number {
    // Évaluation de la pertinence culturelle
    const changeStr = typeof adjustment.change === 'string'
      ? adjustment.change
      : JSON.stringify(adjustment.change);
    const reasonStr = adjustment.reason || '';
    return (changeStr.includes('culturel') || reasonStr.includes('culturel')) ? 0.9 : 0.6;
  }

  /**
   * Applique les ajustements validés au système
   * @param analysis L'analyse complète du feedback
   */
  private async applyFeedbackAdjustments(analysis: FeedbackAnalysis): Promise<void> {
    // Appliquer les ajustements avec une confiance suffisante
    if (analysis.confidence >= 0.7) {
      // Ajuster les règles contextuelles
      for (const issue of analysis.contextualIssues) {
        if (issue.confidence >= 0.8) {
          await this.adjustContextualRules(issue);
        }
      }

      // Ajuster les règles grammaticales
      for (const suggestion of analysis.grammaticalSuggestions) {
        if (suggestion.confidence >= 0.8) {
          await this.adjustGrammaticalRules(suggestion);
        }
      }

      // Ajuster les paramètres d'expression
      for (const adjustment of analysis.expressionAdjustments) {
        if (adjustment.priority >= 0.8) {
          await this.adjustExpressionParameters(adjustment);
        }
      }
    }
  }

  /**
   * Calcule la sévérité d'un problème contextuel
   * @param issue Le problème à évaluer
   * @param expertise L'expertise de l'utilisateur
   * @returns Score de sévérité entre 0 et 1
   */
  private calculateIssueSeverity(issue: ContextIssue, expertise: UserExpertise): number {
    const baseScore = issue.impactLevel || 0.5;
    const expertiseWeight = this.calculateExpertiseWeight(expertise);
    return Math.min(1, baseScore * expertiseWeight);
  }

  /**
   * Calcule le poids à donner à l'expertise d'un utilisateur
   * @param expertise L'expertise de l'utilisateur
   * @returns Facteur de pondération entre 0 et 1
   */
  private calculateExpertiseWeight(expertise: UserExpertise): number {
    switch (expertise.level) {
      case 'NATIVE_SIGNER':
        return 1.0;
      case 'PROFESSIONAL_INTERPRETER':
        return 0.9;
      case 'ADVANCED_SIGNER':
        return 0.8;
      default:
        return 0.6;
    }
  }

  /**
   * Ajuste les règles contextuelles basées sur le feedback
   * @param issue Le problème contextuel analysé
   */
  private async adjustContextualRules(issue: AnalyzedContextIssue): Promise<void> {
    const adjustmentFactor = this.LEARNING_RATE * issue.confidence;
    await this.feedbackDatabase.updateContextualRule(issue.type, adjustmentFactor);
  }

  /**
   * Ajuste les règles grammaticales basées sur le feedback
   * @param suggestion La suggestion grammaticale analysée
   */
  private async adjustGrammaticalRules(suggestion: GrammaticalSuggestion): Promise<void> {
    const adjustmentFactor = this.LEARNING_RATE * suggestion.confidence;
    await this.feedbackDatabase.updateGrammaticalRule(suggestion.rule, adjustmentFactor);
  }

  /**
   * Ajuste les paramètres d'expression basés sur le feedback
   * @param adjustment L'ajustement d'expression analysé
   */
  private async adjustExpressionParameters(adjustment: ExpressionAdjustment): Promise<void> {
    const adjustmentFactor = this.LEARNING_RATE * adjustment.priority;
    await this.feedbackDatabase.updateExpressionParameter(
      adjustment.component,
      adjustmentFactor
    );
  }
}