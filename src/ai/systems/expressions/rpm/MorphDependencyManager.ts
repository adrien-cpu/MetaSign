// src/ai/systems/expressions/rpm/MorphDependencyManager.ts
class MorphDependencyManager {
 private dependencies = new Map<string, string[]>();

 constructor() {
   this.initializeDependencies();
 }

 checkDependencies(morphs: Record<string, number>): DependencyResult {
   const violations: DependencyViolation[] = [];
   
   for (const [morph, value] of Object.entries(morphs)) {
     const deps = this.dependencies.get(morph);
     if (deps) {
       for (const dep of deps) {
         if (!this.isDependencySatisfied(dep, morphs[dep], value)) {
           violations.push({
             morph,
             dependency: dep,
             expected: this.getExpectedValue(morph, dep, value),
             actual: morphs[dep]
           });
         }
       }
     }
   }

   return {
     isValid: violations.length === 0,
     violations
   };
 }
}