// src/ai/systems/expressions/validation/ValidationMethods.ts
export class ValidationMethods {
 validateEyebrows(rule: EyebrowRule, pattern: EyebrowConfig): ValidationIssue[] {
   const issues: ValidationIssue[] = [];
   
   if (pattern.position < rule.minPosition) {
     issues.push({
       component: 'eyebrows',
       message: `Position trop basse: ${pattern.position}, minimum requis: ${rule.minPosition}`,
       severity: 'error'
     });
   }

   if (pattern.tension > rule.maxTension) {
     issues.push({
       component: 'eyebrows',
       message: `Tension trop forte: ${pattern.tension}, maximum autorisé: ${rule.maxTension}`,
       severity: 'error'
     });
   }

   return issues;
 }

 validateEyes(rule: EyeRule, pattern: EyeConfig): ValidationIssue[] {
   const issues: ValidationIssue[] = [];

   if (pattern.openness < rule.minOpenness) {
     issues.push({
       component: 'eyes',
       message: `Ouverture insuffisante: ${pattern.openness}, minimum requis: ${rule.minOpenness}`,
       severity: 'error'
     });
   }

   if (!rule.allowedDirections.includes(pattern.direction)) {
     issues.push({
       component: 'eyes',
       message: `Direction non autorisée: ${pattern.direction}`,
       severity: 'error'
     });
   }

   return issues;
 }
}