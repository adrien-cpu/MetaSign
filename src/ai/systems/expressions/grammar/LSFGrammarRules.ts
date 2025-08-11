// src/ai/systems/expressions/grammar/LSFGrammarRules.ts
export interface GrammarRule {
    eyebrowPattern: { raise: boolean; intensity: number };
    headMovement: { forward: boolean; tilt: number };
    mouthPattern: { closed: boolean; corners: string };
    type: string;
}

export class LSFGrammarRules {
    private rules: Map<string, GrammarRule>;

    constructor() {
        this.rules = new Map([
            ['QUESTION', {
                type: 'QUESTION',
                eyebrowPattern: { raise: true, intensity: 0.8 },
                headMovement: { forward: true, tilt: 0.2 },
                mouthPattern: { closed: false, corners: 'neutral' }
            }]
        ]);
    }

    getRule(intent: string): GrammarRule {
        const rule = this.rules.get(intent);
        if (!rule) {
            throw new Error(`No rule found for intent: ${intent}`);
        }
        return rule;
    }
}