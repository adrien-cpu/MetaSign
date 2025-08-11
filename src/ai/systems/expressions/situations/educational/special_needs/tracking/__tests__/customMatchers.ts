// src/ai/systems/expressions/situations/educational/special_needs/tracking/__tests__/customMatchers.ts
// Utiliser 'jest-extended' au lieu de '@jest/globals' qui n'est pas trouvé
import 'jest-extended';

function calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b) / secondHalf.length;
    return secondAvg - firstAvg;
}

interface DataDrivenObject {
    data: unknown[];
}

// Interface pour les matchers Jest personnalisés
interface CustomMatcherResult {
    pass: boolean;
    message: () => string;
}

// Interface de contexte pour les matchers
interface MatcherContext {
    isNot?: boolean;
}

// Définition avant l'export 
const customMatchers = {
    toBeAnalyzed(this: MatcherContext, received: unknown): CustomMatcherResult {
        const hasAnalysis = typeof received === 'object' &&
            received !== null &&
            'analysis_type' in received &&
            'metrics' in received;

        return {
            message: (): string =>
                `expected ${received} ${this.isNot ? 'not ' : ''}to be analyzed with proper metrics`,
            pass: hasAnalysis
        };
    },

    toBeQuantified(this: MatcherContext, received: unknown): CustomMatcherResult {
        const isQuantified = typeof received === 'object' &&
            received !== null &&
            'value' in received &&
            'unit' in received;

        return {
            message: (): string =>
                `expected ${received} ${this.isNot ? 'not ' : ''}to be quantified with value and unit`,
            pass: isQuantified
        };
    },

    toBeIdentified(this: MatcherContext, received: unknown): CustomMatcherResult {
        const isIdentified = typeof received === 'object' &&
            received !== null &&
            'id' in received &&
            'type' in received;

        return {
            message: (): string =>
                `expected ${received} ${this.isNot ? 'not ' : ''}to be properly identified`,
            pass: isIdentified
        };
    },

    toBeWithinRange(this: MatcherContext, received: number, min: number, max: number): CustomMatcherResult {
        const isWithinRange = received >= min && received <= max;

        return {
            message: (): string =>
                `expected ${received} ${this.isNot ? 'not ' : ''}to be within range [${min}, ${max}]`,
            pass: isWithinRange
        };
    },

    toShowSteadyProgress(this: MatcherContext, received: number[] | { progress: number[] }): CustomMatcherResult {
        const values = Array.isArray(received) ? received : received.progress;
        const trend = calculateTrend(values);

        return {
            pass: trend > 0,
            message: (): string =>
                trend > 0
                    ? `Expected progress not to be steady, but it had a positive trend of ${trend}`
                    : `Expected steady progress, but trend was ${trend}`
        };
    },

    toBeProgressing(this: MatcherContext, received: { value: number; baseline: number } | number): CustomMatcherResult {
        const progress = typeof received === 'number'
            ? received
            : received.value - received.baseline;

        return {
            pass: progress > 0,
            message: (): string =>
                progress > 0
                    ? `Expected no progression, but got progress of ${progress}`
                    : `Expected progression, but got no progress (${progress})`
        };
    },

    toBeDataDriven(this: MatcherContext, received: string[] | DataDrivenObject): CustomMatcherResult {
        const hasData = Array.isArray(received)
            ? received.some(item => item.includes('data'))
            : received.data.length > 0;

        return {
            pass: hasData,
            message: (): string =>
                hasData
                    ? `Expected recommendations not to be data-driven, but they were`
                    : `Expected recommendations to be data-driven, but they weren't`
        };
    },

    toBeMaintatined(this: MatcherContext, received: { consistency: number } | number): CustomMatcherResult {
        const value = typeof received === 'number' ? received : received.consistency;
        const threshold = 0.8;

        return {
            pass: value >= threshold,
            message: (): string =>
                value >= threshold
                    ? `Expected value not to be maintained above ${threshold}, but got ${value}`
                    : `Expected value to be maintained above ${threshold}, but got ${value}`
        };
    }
};

// Export après la déclaration
export default customMatchers;