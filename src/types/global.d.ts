/**
 * Définitions de types globaux pour l'environnement TypeScript
 * 
 * @file src/types/globals.d.ts
 */

// Déclarations globales pour l'utilisation avec globalThis
declare global {
    // Objets natifs standard
    interface JSON {
        parse(text: string): unknown;
        stringify(value: unknown): string;
    }

    interface Math {
        abs(x: number): number;
        max(...values: number[]): number;
        min(...values: number[]): number;
        round(x: number): number;
    }

    interface Object {
        keys<T extends object>(o: T): string[];
        assign<T, U>(target: T, source: U): T & U;
    }

    interface Array<T> {
        length: number;
        push(...items: T[]): number;
        pop(): T | undefined;
        filter(predicate: (value: T, index: number, array: T[]) => unknown): T[];
        map<U>(callbackfn: (value: T, index: number, array: T[]) => U): U[];
        reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
        slice(start?: number, end?: number): T[];
        sort(compareFn?: (a: T, b: T) => number): this;
        every(predicate: (value: T, index: number, array: T[]) => unknown): boolean;
        forEach(callbackfn: (value: T, index: number, array: T[]) => void): void;
        [n: number]: T;
    }

    interface Date {
        getTime(): number;
        toISOString(): string;
    }

    interface Storage {
        getItem(key: string): string | null;
        setItem(key: string, value: string): void;
        removeItem(key: string): void;
        clear(): void;
        key(index: number): string | null;
        readonly length: number;
    }

    // Namespace globalThis pour accéder aux types natifs
    namespace globalThis {
        const JSON: JSON;
        const Math: Math;
        const Object: typeof Object;
        const Array: ArrayConstructor;
        const Date: DateConstructor;
        const localStorage: Storage;
        const sessionStorage: Storage;
        function parseInt(string: string, radix?: number): number;
        function parseFloat(string: string): number;
    }
}

// Export vide pour que le fichier soit traité comme un module
export { };