// src/ai/specialized/grammar/LSFGrammarValidator.ts

import { 
  GrammaticalRule, 
  ValidationResult, 
  GrammaticalStructure,
  LSFSentence 
} from './types';

export class LSFGrammarValidator {
  private readonly rules: Map<string, GrammaticalRule>;
  private readonly CORRECTNESS_THRESHOLD = 0.9;
  private readonly spatialValidator: SpatialGrammarValidator;
  private readonly temporalValidator: TemporalGrammarValidator;
  private readonly nonManualValidator: NonManualGrammarValidator;

  constructor() {
    this.rules = this.initializeGrammarRules();
    this.spatialValidator = new SpatialGrammarValidator();
    this.temporalValidator = new TemporalGrammarValidator();
    this.nonManualValidator = new NonManualGrammarValidator();
  }

  async validate(structure: GrammaticalStructure): Promise<ValidationResult> {
    try {
      // Validation de la structure spatiale
      const spatialValidation = await this.spatialValidator.validate(structure);
      if (!spatialValidation.isValid) {
        return this.buildValidationError('Spatial structure validation failed', spatialValidation);
      }

      // Validation des aspects temporels
      const temporalValidation = await this.temporalValidator.validate(structure);
      if (!temporalValidation.isValid) {
        return this.buildValidationError('Temporal structure validation failed', temporalValidation);
      }

      // Validation des composants non manuels
      const nonManualValidation = await this.nonManualValidator.validate(structure);
      if (!nonManualValidation.isValid) {
        return this.buildValidationError('Non-manual components validation failed', nonManualValidation);
      }

      // Validation des règles grammaticales spécifiques
      const ruleValidation = await this.validateGrammaticalRules(structure);
      if (!ruleValidation.isValid) {
        return this.buildValidationError('Grammatical rules validation failed', ruleValidation);
      }

      return {
        isValid: true,
        score: this.calculateOverallScore([
          spatialValidation,
          temporalValidation,
          nonManualValidation,
          ruleValidation
        ]),
        details: this.compileValidationDetails([
          spatialValidation,
          temporalValidation,
          nonManualValidation,
          ruleValidation
        ])
      };
    } catch (error) {
      throw new LSFGrammarValidationError('Grammar validation failed', error);
    }
  }

  async measureCorrectness(sentence: LSFSentence): Promise<number> {
    const evaluations = await Promise.all([
      this.evaluateSpatialCorrectness(sentence),
      this.evaluateTemporalCorrectness(sentence),
      this.evaluateNonManualCorrectness(sentence),
      this.evaluateGrammaticalRules(sentence)
    ]);

    return this.calculateWeightedScore(evaluations);
  }

  private async validateGrammaticalRules(
    structure: GrammaticalStructure
  ): Promise<RuleValidationResult> {
    const results: RuleValidationResult[] = [];

    // Validation des règles de base
    for (const [ruleId, rule] of this.rules) {
      const ruleResult = await this.validateRule(rule, structure);
      results.push(ruleResult);

      // Arrêt précoce si une règle critique échoue
      if (rule.critical && !ruleResult.isValid) {
        return this.buildCriticalRuleFailure(ruleId, ruleResult);
      }
    }

    // Validation des règles composées
    const compositeResults = await this.validateCompositeRules(structure, results);
    results.push(...compositeResults);

    return this.compileRuleResults(results);
  }

  private async validateRule(
    rule: GrammaticalRule,
    structure: GrammaticalStructure
  ): Promise<RuleValidationResult> {
    // Validation du contexte de la règle
    if (!await this.isRuleApplicable(rule, structure)) {
      return { isValid: true, score: 1, rule: rule.id };
    }

    // Application de la règle
    const validationResult = await rule.validate(structure);

    // Enrichissement du résultat
    return {
      isValid: validationResult.isValid,
      score: validationResult.score,
      rule: rule.id,
      details: {
        context: await this.extractRuleContext(rule, structure),
        violations: validationResult.violations,
        suggestions: await this.generateSuggestions(validationResult)
      }
    };
  }

  private async validateCompositeRules(
    structure: GrammaticalStructure,
    baseResults: RuleValidationResult[]
  ): Promise<RuleValidationResult[]> {
    const compositeResults: RuleValidationResult[] = [];

    // Validation des règles d'interaction
    const interactionResults = await this.validateRuleInteractions(structure, baseResults);
    compositeResults.push(...interactionResults);

    // Validation des règles de séquence
    const sequenceResults = await this.validateRuleSequences(structure, baseResults);
    compositeResults.push(...sequenceResults);

    // Validation des règles de dépendance
    const dependencyResults = await this.validateRuleDependencies(structure, baseResults);
    compositeResults.push(...dependencyResults);

    return compositeResults;
  }

  private async isRuleApplicable(
    rule: GrammaticalRule,
    structure: GrammaticalStructure
  ): Promise<boolean> {
    // Vérification des prérequis de la règle
    const prerequisitesMet = await this.checkRulePrerequisites(rule, structure);
    if (!prerequisitesMet) return false;

    // Vérification du contexte d'application
    const contextValid = await this.validateRuleContext(rule, structure);
    if (!contextValid) return false;

    // Vérification des exceptions
    return !await this.checkRuleExceptions(rule, structure);
  }

  private buildValidationError(
    message: string,
    validationResult: ValidationResult
  ): ValidationResult {
    return {
      isValid: false,
      score: validationResult.score,
      errors: [{
        type: 'VALIDATION_ERROR',
        message,
        details: validationResult.details
      }],
      details: validationResult.details
    };
  }

  private calculateOverallScore(validations: ValidationResult[]): number {
    const weights = {
      spatial: 0.4,
      temporal: 0.2,
      nonManual: 0.2,
      rules: 0.2
    };

    return validations.reduce((total, validation, index) => {
      const weight = Object.values(weights)[index];
      return total + (validation.score * weight);
    }, 0);
  }

  private compileValidationDetails(
    validations: ValidationResult[]
  ): ValidationDetails {
    return {
      spatialAnalysis: validations[0].details,
      temporalAnalysis: validations[1].details,
      nonManualAnalysis: validations[2].details,
      ruleAnalysis: validations[3].details,
      timestamp: Date.now()
    };
  }

  private calculateWeightedScore(evaluations: number[]): number {
    const weights = [0.4, 0.2, 0.2, 0.2];
    return evaluations.reduce(
      (total, score, index) => total + (score * weights[index]),
      0
    );
  }
}

class LSFGrammarValidationError extends Error {
  constructor(message: string, public context: any) {
    super(message);
    this.name = 'LSFGrammarValidationError';
  }
}