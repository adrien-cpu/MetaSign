// src/ai/systems/expressions/rpm/ExpressionCombinator.ts
class ExpressionCombinator {
 private combinations = new Map([
   ['SMILE_WITH_BROW', {
     morphs: {
       mouthSmile: 1,
       browInnerUp: 0.3
     },
     duration: 500
   }],
   ['SURPRISE', {
     morphs: {
       browInnerUp: 1,
       eyeWideLeft: 0.8,
       eyeWideRight: 0.8,
       mouthOpen: 0.5
     },
     duration: 300
   }]
 ]);

 async applyCombination(name: string): Promise<void> {
   const combo = this.combinations.get(name);
   if (!combo) throw new Error(`Combination ${name} not found`);

   await this.applyMorphs(combo.morphs, combo.duration);
 }

 private async applyMorphs(morphs: Record<string, number>, duration: number): Promise<void> {
   // Implémentation de l'application des morphs
 }
}