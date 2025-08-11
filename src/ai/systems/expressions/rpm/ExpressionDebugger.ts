// src/ai/systems/expressions/rpm/ExpressionDebugger.ts
class ExpressionDebugger {
 private debugLog: DebugEntry[] = [];
 private breakpoints = new Set<string>();

 async debug(expression: Expression): Promise<DebugReport> {
   const debugSession = {
     startTime: Date.now(),
     steps: []
   };

   try {
     await this.stepThroughExpression(expression, debugSession);
     return this.generateDebugReport(debugSession);
   } catch (error) {
     return this.handleDebugError(error, debugSession);
   }
 }

 private async stepThroughExpression(expression: Expression, session: DebugSession): Promise<void> {
   for (const [morphName, value] of Object.entries(expression.morphs)) {
     if (this.breakpoints.has(morphName)) {
       await this.handleBreakpoint(morphName, value);
     }
     session.steps.push({
       morphName,
       value,
       timestamp: Date.now()
     });
   }
 }
}