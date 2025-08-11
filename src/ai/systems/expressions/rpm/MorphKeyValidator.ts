// src/ai/systems/expressions/rpm/MorphKeyValidator.ts
class MorphKeyValidator {
 private validMorphKeys = new Set([
   'browInnerUp', 'browOuterUpLeft', 'browOuterUpRight',
   'eyeSquintLeft', 'eyeSquintRight', 'eyeWideLeft', 'eyeWideRight',
   'mouthSmile', 'mouthFrown', 'mouthOpen'
 ]);

 validateKey(key: string): ValidationResult {
   return {
     isValid: this.validMorphKeys.has(key),
     details: this.getKeyValidationDetails(key)
   };
 }

 validateMorphGroup(group: string): ValidationResult {
   const validGroups = ['eyebrows', 'eyes', 'mouth'];
   return {
     isValid: validGroups.includes(group),
     details: this.getGroupValidationDetails(group)
   };
 }
}