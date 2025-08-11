// src/ai/systems/expressions/situations/educational/special_needs/tracking/__tests__/jest.d.ts

export { };

declare global {
    interface CustomMatcherResult {
        pass: boolean;
        message(): string;
    }

    namespace jest {
        interface Matchers<R> {
            toBeIncreasing(): R;
            toShowSteadyProgress(): R;
            toBeProgressing(): R;
            toBeDataDriven(): R;
            toBeMaintatined(): R;
        }
    }
}