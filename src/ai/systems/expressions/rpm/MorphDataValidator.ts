// src/ai/systems/expressions/rpm/MorphDataValidator.ts
class MorphDataValidator {
 validateMorphData(data: MorphData): ValidationReport {
   const issues: ValidationIssue[] = [];

   Object.entries(data).forEach(([key, value]) => {
     if (!this.isValidMorphKey(key)) {
       issues.push({
         type: 'INVALID_KEY',
         message: `Invalid morph key: ${key}`,
         severity: 'error'
       });
     }

     if (!this.isValidMorphValue(value)) {
       issues.push({
         type: 'INVALID_VALUE',
         message: `Invalid value for ${key}: ${value}`,
         severity: 'error'
       });
     }
   });

   return {
     isValid: issues.length === 0,
     issues,
     timestamp: Date.now()
   };
 }

 private isValidMorphKey(key: string): boolean {
   const validKeys = ['browInnerUp', 'browOuterUp', 'eyeSquint', 'mouthSmile'];
   return validKeys.includes(key);
 }
}