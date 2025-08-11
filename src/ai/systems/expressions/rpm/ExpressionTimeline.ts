// src/ai/systems/expressions/rpm/ExpressionTimeline.ts
class ExpressionTimeline {
 private timeline: TimelineEvent[] = [];
 private currentTime = 0;

 addKeyframe(time: number, expression: Expression): void {
   this.timeline.push({
     time,
     type: 'keyframe',
     data: expression
   });
   this.timeline.sort((a, b) => a.time - b.time);
 }

 async play(): Promise<void> {
   for (const event of this.timeline) {
     const waitTime = event.time - this.currentTime;
     if (waitTime > 0) {
       await this.delay(waitTime);
     }
     await this.executeEvent(event);
     this.currentTime = event.time;
   }
 }

 private async executeEvent(event: TimelineEvent): Promise<void> {
   switch (event.type) {
     case 'keyframe':
       await this.applyExpression(event.data);
       break;
     case 'transition':
       await this.executeTransition(event.data);
       break;
   }
 }
}