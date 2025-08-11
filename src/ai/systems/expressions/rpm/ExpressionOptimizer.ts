// src/ai/systems/expressions/rpm/ExpressionOptimizer.ts
class ExpressionOptimizer {
 private cache: Map<string, OptimizedExpression> = new Map();

 optimizeExpression(expression: Expression): OptimizedExpression {
   const cacheKey = this.generateCacheKey(expression);
   
   if (this.cache.has(cacheKey)) {
     return this.cache.get(cacheKey)!;
   }

   const optimized = {
     morphs: this.optimizeMorphs(expression.morphs),
     timing: this.optimizeTiming(expression.timing),
     transitions: this.optimizeTransitions(expression.transitions)
   };

   this.cache.set(cacheKey, optimized);
   return optimized;
 }

 private optimizeMorphs(morphs: Record<string, number>): Record<string, number> {
   return Object.entries(morphs).reduce((acc, [key, value]) => {
     if (Math.abs(value) > 0.01) { // Ignore très petites valeurs
       acc[key] = Math.round(value * 100) / 100; // Limiter la précision
     }
     return acc;
   }, {});
 }
}