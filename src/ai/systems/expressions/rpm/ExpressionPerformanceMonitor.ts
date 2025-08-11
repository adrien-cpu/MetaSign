// src/ai/systems/expressions/rpm/ExpressionPerformanceMonitor.ts
class ExpressionPerformanceMonitor {
 private metrics: PerformanceMetrics = {
   frameTime: [],
   morphUpdates: [],
   transitionTime: []
 };

 trackPerformance(operation: string, duration: number): void {
   const metric = this.metrics[operation] || [];
   metric.push({
     value: duration,
     timestamp: Date.now()
   });

   if (metric.length > 100) metric.shift();
   
   if (duration > this.getThreshold(operation)) {
     this.reportPerformanceIssue({
       operation,
       duration,
       threshold: this.getThreshold(operation)
     });
   }
 }

 private getThreshold(operation: string): number {
   const thresholds = {
     frameTime: 16.67,  // 60fps
     morphUpdates: 5,   // 5ms
     transitionTime: 33 // 30fps
   };
   return thresholds[operation];
 }
}