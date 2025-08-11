// src/ai/systems/expressions/validation/LSFValidationRules.ts
export class LSFValidationRules {
 private grammarRules = new Map<string, ValidationRule>([
   ['question_yn', {
     eyebrows: { minPosition: 0.5, maxTension: 0.3 },
     eyes: { minOpenness: 1.0, allowedDirections: ['forward'] },
     mouth: { allowedShapes: ['neutral', 'slightly_open'] }
   }],
   ['question_wh', {
     eyebrows: { minPosition: -0.5, maxTension: 0.6 },
     eyes: { minOpenness: 1.2, allowedDirections: ['forward'] },
     mouth: { allowedShapes: ['open'] }
   }]
 ]);

 validate(expressionType: string, pattern: ExpressionPattern): ValidationResult {
   const rule = this.grammarRules.get(expressionType);
   if (!rule) return { isValid: false, error: 'Unknown expression type' };

   return this.checkRule(rule, pattern);
 }

 private checkRule(rule: ValidationRule, pattern: ExpressionPattern): ValidationResult {
   const eyebrowsValid = this.validateEyebrows(rule.eyebrows, pattern.eyebrows);
   const eyesValid = this.validateEyes(rule.eyes, pattern.eyes);
   const mouthValid = this.validateMouth(rule.mouth, pattern.mouth);

   return {
     isValid: eyebrowsValid && eyesValid && mouthValid,
     issues: this.collectIssues(rule, pattern)
   };
 }
}