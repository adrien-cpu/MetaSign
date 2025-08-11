/**
 * Déclarations de types ambiants pour l'application MetaSign
 * 
 * @file src/types/ambient.d.ts
 */

// Le code ci-dessous définit les types utilisés par l'application MetaSign
// qui ne sont pas correctement reconnus par TypeScript dans notre configuration

/// <reference lib="es2015.core" />
/// <reference lib="es2015.collection" />
/// <reference lib="es2015.iterable" />
/// <reference lib="es2015.symbol" />
/// <reference lib="es2015.promise" />
/// <reference lib="es2015.symbol.wellknown" />
/// <reference lib="es2016.array.include" />
/// <reference lib="es2017.object" />
/// <reference lib="es2017.string" />
/// <reference lib="es2017.typedarrays" />
/// <reference lib="es2018.asynciterable" />
/// <reference lib="es2018.asyncgenerator" />
/// <reference lib="es2018.promise" />
/// <reference lib="es2019.array" />
/// <reference lib="es2019.object" />
/// <reference lib="es2019.string" />
/// <reference lib="es2019.symbol" />
/// <reference lib="es2020.bigint" />
/// <reference lib="es2020.promise" />
/// <reference lib="es2020.string" />
/// <reference lib="es2020.symbol.wellknown" />
/// <reference lib="esnext.array" />
/// <reference lib="esnext.asynciterable" />
/// <reference lib="esnext.intl" />
/// <reference lib="esnext.promise" />
/// <reference lib="esnext.string" />
/// <reference lib="esnext.weakref" />

// Ces déclarations évitent les erreurs de compilation liées aux types natifs
// tout en permettant l'utilisation normale de ces types dans le code
declare global {
    // Interfaces pour les types natifs
    interface DateConstructor {
        new(): Date;
        new(value: number | string): Date;
        now(): number;
    }

    interface ObjectConstructor {
        keys<T extends object>(o: T): string[];
        assign<T, U>(target: T, source: U): T & U;
    }

    interface JSON {
        parse(text: string): unknown;
        stringify(value: unknown): string;
    }

    interface Math {
        abs(x: number): number;
        max(...values: number[]): number;
        min(...values: number[]): number;
    }

    // Interfaces pour Array
    interface ArrayLike<T> {
        readonly length: number;
        readonly [n: number]: T;
    }

    interface Array<T> {
        length: number;
        [n: number]: T;

        // Méthodes courantes
        push(...items: T[]): number;
        pop(): T | undefined;
        shift(): T | undefined;
        unshift(...items: T[]): number;

        // Méthodes de filtrage et transformation
        filter<S extends T>(predicate: (value: T, index: number, array: readonly T[]) => value is S): S[];
        filter(predicate: (value: T, index: number, array: readonly T[]) => unknown): T[];
        map<U>(callbackfn: (value: T, index: number, array: readonly T[]) => U): U[];
        reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: readonly T[]) => U, initialValue: U): U;
        every(predicate: (value: T, index: number, array: readonly T[]) => unknown): boolean;

        // Méthodes d'accès aux éléments
        slice(start?: number, end?: number): T[];
        splice(start: number, deleteCount?: number, ...items: T[]): T[];

        // Méthodes d'itération
        forEach(callbackfn: (value: T, index: number, array: readonly T[]) => void): void;

        // Méthodes de tri
        sort(compareFn?: (a: T, b: T) => number): this;
    }

    // Support de Promise
    interface PromiseConstructor {
        new <T>(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: unknown) => void) => void): Promise<T>;
        resolve<T>(value: T | PromiseLike<T>): Promise<T>;
        reject<T = never>(reason?: unknown): Promise<T>;
        all<T>(values: readonly (T | PromiseLike<T>)[]): Promise<T[]>;
    }

    interface PromiseLike<T> {
        then<TResult1 = T, TResult2 = never>(
            onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
            onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
        ): PromiseLike<TResult1 | TResult2>;
    }
}

export { };