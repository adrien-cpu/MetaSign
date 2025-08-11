// src/ai/systems/expressions/rpm/MorphRelationshipValidator.ts
class MorphRelationshipValidator {
 validateRelationships(morphs: Record<string, number>): ValidationResult {
   const issues = [];

   // Vérifier les relations symétriques
   if (!this.checkSymmetry(morphs)) {
     issues.push(this.createIssue('ASYMMETRIC_MORPHS'));
   }

   // Vérifier les conflits
   if (this.hasConflictingMorphs(morphs)) {
     issues.push(this.createIssue('CONFLICTING_MORPHS'));
   }

   return {
     isValid: issues.length === 0,
     issues
   };
 }

 private checkSymmetry(morphs: Record<string, number>): boolean {
   const pairs = {
     browOuterUpLeft: 'browOuterUpRight',
     eyeSquintLeft: 'eyeSquintRight',
     eyeWideLeft: 'eyeWideRight'
   };

   return Object.entries(pairs).every(([left, right]) => 
     Math.abs((morphs[left] || 0) - (morphs[right] || 0)) < 0.1
   );
 }
}