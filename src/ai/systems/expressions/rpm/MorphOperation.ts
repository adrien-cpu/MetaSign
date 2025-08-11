// src/ai/systems/expressions/rpm/MorphOperation.ts
interface Operation {
 id: string;
 type: OperationType;
 data: MorphData;
 priority: number;
 timestamp: number;
}

class MorphOperation implements Operation {
 private static operationCount = 0;

 constructor(
   public readonly type: OperationType,
   public readonly data: MorphData,
   public readonly priority: number = 0
 ) {
   this.id = `op_${++MorphOperation.operationCount}`;
   this.timestamp = Date.now();
 }

 validate(): boolean {
   return (
     this.validateType() &&
     this.validateData() &&
     this.validatePriority()
   );
 }

 private validatePriority(): boolean {
   return this.priority >= 0 && this.priority <= 10;
 }
}