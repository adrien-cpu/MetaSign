// src/ai/systems/expressions/rpm/MorphStateValidator.ts
class MorphStateValidator {
 private readonly VALID_RANGES = {
   eyebrows: { min: -1, max: 1 },
   eyes: { min: 0, max: 1 },
   mouth: { min: -0.5, max: 1 }
 };

 validateMorphState(state: AvatarState): ValidationResult {
   const issues = [];
   
   for (const [morphName, value] of Object.entries(state.morphs)) {
     const range = this.getMorphRange(morphName);
     if (!this.isInRange(value, range)) {
       issues.push({
         morphName,
         value,
         validRange: range,
         severity: 'error'
       });
     }
   }

   return {
     isValid: issues.length === 0,
     issues,
     timestamp: Date.now()
   };
 }

 private getMorphRange(morphName: string): Range {
   const [category] = morphName.split('_');
   return this.VALID_RANGES[category] || { min: -1, max: 1 };
 }
}