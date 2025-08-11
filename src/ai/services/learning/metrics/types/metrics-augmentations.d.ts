/**
 * Types pour le module de métriques
 * 
 * @file src/ai/services/learning/metrics/types/metrics-augmentations.d.ts
 */

// Augmentation spécifique pour les types de métriques
declare module '@/ai/services/learning/metrics/types/MetricsTypes' {
    export interface MetricHistoryEntry {
        userId: string;
        metricId: string;
        timestamp: Date;
        value: unknown;
        metadata?: Record<string, unknown>;
    }

    export interface MetricsStoreOptions {
        dbUrl?: string;
        retentionPeriod?: number;
        enablePersistence?: boolean;
        storageMode?: 'memory' | 'local' | 'remote';
    }

    export type ExerciseMetrics = Record<string, unknown>;
    export type StorageMode = 'memory' | 'local' | 'remote';
}

// Ces déclarations sont automatiquement disponibles par le système
interface ArrayConstructor {
    from<T, U>(
        arrayLike: ArrayLike<T>,
        mapfn?: (v: T, k: number) => U,
        thisArg?: unknown
    ): U[];
    isArray(arg: unknown): arg is unknown[];
}

interface Array<T> {
    every<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S): this is S[];
    every(predicate: (value: T, index: number, array: T[]) => unknown): boolean;
}

// Déclarations globales
declare global {
    // Méthodes d'objet natif
    interface Array<T> {
        every<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S): this is S[];
        every(predicate: (value: T, index: number, array: T[]) => unknown): boolean;
    }

    interface Storage {
        getItem(key: string): string | null;
        setItem(key: string, value: string): void;
        removeItem(key: string): void;
        clear(): void;
        key(index: number): string | null;
        readonly length: number;
    }

    interface JSON {
        stringify(value: unknown): string;
        parse(text: string): unknown;
    }

    interface Math {
        abs(x: number): number;
        max(...values: number[]): number;
        min(...values: number[]): number;
        round(x: number): number;
    }
}