/**
 * Types utilitaires globaux pour l'application
 * 
 * @file src/types/utility-types.d.ts
 */

// Définition des types utilitaires globaux pour éviter les erreurs avec exactOptionalPropertyTypes
declare global {
    // Types fondamentaux
    interface String {
        split(separator: string | RegExp, limit?: number): string[];
    }

    // Utilitaires TypeScript
    type Record<K extends string | number | symbol, T> = { [P in K]: T };
    type Partial<T> = { [P in keyof T]?: T[P] };
    type Required<T> = { [P in keyof T]-?: T[P] };
    type Readonly<T> = { readonly [P in keyof T]: T[P] };
    type Pick<T, K extends keyof T> = { [P in K]: T[P] };
    type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
    type Exclude<T, U> = T extends U ? never : T;
    type Extract<T, U> = T extends U ? T : never;
    type ReturnType<T extends (...args: unknown[]) => unknown> = T extends (...args: unknown[]) => infer R ? R : unknown;

    // Types fonctionnels
    interface Function {
        readonly length: number;
        readonly name: string;
        apply(thisArg: unknown, argArray?: unknown): unknown;
        call(thisArg: unknown, ...argArray: unknown[]): unknown;
        bind(thisArg: unknown, ...argArray: unknown[]): unknown;
    }

    type CallableFunction = Function;
    type NewableFunction = Function;
}

// Pour permettre l'utilisation de ce fichier comme module
export { };