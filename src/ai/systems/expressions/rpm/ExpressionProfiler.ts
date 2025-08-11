// src/ai/systems/expressions/rpm/ExpressionProfiler.ts
class ExpressionProfiler {
 private readonly profiles = new Map<string, PerformanceProfile>();

 startProfiling(id: string): void {
   this.profiles.set(id, {
     startTime: performance.now(),
     operations: [],
     memory: this.getMemoryUsage()
   });
 }

 endProfiling(id: string): PerformanceReport {
   const profile = this.profiles.get(id);
   if (!profile) throw new Error(`Profile ${id} not found`);

   return {
     duration: performance.now() - profile.startTime,
     operations: profile.operations,
     memoryUsage: this.getMemoryUsage() - profile.memory,
     bottlenecks: this.identifyBottlenecks(profile.operations)
   };
 }

 private identifyBottlenecks(operations: Operation[]): Bottleneck[] {
   return operations
     .filter(op => op.duration > op.expectedDuration)
     .map(op => ({
       operation: op.name,
       duration: op.duration,
       impact: op.duration / op.expectedDuration
     }));
 }
}