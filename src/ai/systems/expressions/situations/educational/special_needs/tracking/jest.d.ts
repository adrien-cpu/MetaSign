// src/ai/systems/expressions/situations/educational/special_needs/tracking/jest.d.ts

export { };

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeIncreasing(): R;
            toShowProgression(): R;
            toBeConsistent(): R;
            toShowImprovement(): R;
            toBeImproving(): R;
            toShowSteadyProgress(): R;
            toBeProgressing(): R;
            toBeDataDriven(): R;
            toBeMaintatined(): R;
        }
    }
}