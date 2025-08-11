/**
 * @file src/ai/api/distributed/monitoring/types/memory.types.ts
 * Types et interfaces pour la surveillance de mémoire du système
 */

export enum LeakSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export interface MemorySnapshot {
    timestamp: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    arrayBuffers?: number | undefined;
    gcInfo?: {
        majorGCs: number;
        minorGCs: number;
        incrementalGCs: number;
    } | undefined;
}

export interface MemoryMetrics {
    timestamp: number;
    heap: {
        used: number;
        total: number;
        limit: number;
        executionTime?: number;
    };
    external?: number;
    arrayBuffers?: number;
    rss: number;
    gcMetrics?: {
        collections: number;
        pause: number;
        totalTime: number;
    };
    system: {
        total: number;
        free: number;
        used: number;
        usagePercent: number;
    };
    process: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
        arrayBuffers: number;
        heapUsagePercent: number;
    };
}

/**
 * Seuils d'alerte pour la surveillance de la mémoire
 */
export interface MemoryThresholds {
    /** Seuil d'avertissement pour l'utilisation système (%) */
    warning?: number;
    /** Seuil critique pour l'utilisation système (%) */
    critical?: number;
    /** Seuil d'avertissement pour l'utilisation du tas (%) */
    heapWarning?: number;
    /** Seuil critique pour l'utilisation du tas (%) */
    heapCritical?: number;
}

/**
 * Événement d'alerte mémoire
 */
export interface MemoryAlertEvent {
    /** Niveau d'alerte ('warning' ou 'critical') */
    level: 'warning' | 'critical';
    /** Pourcentage d'utilisation de la mémoire système */
    systemUsage: number;
    /** Pourcentage d'utilisation du tas */
    heapUsage: number;
    /** Horodatage de l'événement */
    timestamp: number;
    /** Métriques complètes au moment de l'alerte */
    metrics: MemoryMetrics;
}

/**
 * Événement de retour à la normale de la mémoire
 */
export interface MemoryNormalEvent {
    /** Pourcentage d'utilisation de la mémoire système */
    systemUsage: number;
    /** Pourcentage d'utilisation du tas */
    heapUsage: number;
    /** Horodatage de l'événement */
    timestamp: number;
    /** Métriques complètes au moment du retour à la normale */
    metrics: MemoryMetrics;
}

export interface GrowthTrend {
    slope: number;      // Rate of growth (bytes per millisecond)
    confidence: number; // R² value (0-1)
    sustainedGrowth: {
        duration: number; // How long the growth has been sustained
        percentage: number; // Total percentage growth over the period
        steady: boolean;  // Whether growth is steady or erratic
    };
}

export interface LeakLocation {
    module: string;
    type: string;
    stackTrace?: string[];
    size: number;
    instances: number;
    retainedSize: number;
    growth: number; // Percentage growth
}

export interface MemoryLeak {
    type: 'MEMORY_LEAK';
    severity: LeakSeverity;
    location: LeakLocation;
    trend: GrowthTrend;
    recommendations?: string[];
}

/**
 * Circular buffer for efficient storage of fixed-size historical data
 */
export class CircularBuffer<T> {
    private buffer: T[];
    private size: number;
    private currentIndex = 0;
    private isFull = false;

    constructor(size: number) {
        this.size = size;
        this.buffer = new Array<T>(size);
    }

    push(item: T): void {
        this.buffer[this.currentIndex] = item;
        this.currentIndex = (this.currentIndex + 1) % this.size;
        if (this.currentIndex === 0) {
            this.isFull = true;
        }
    }

    get(index: number): T | undefined {
        if (index < 0 || index >= this.count()) {
            return undefined;
        }

        let actualIndex: number;
        if (this.isFull) {
            actualIndex = (this.currentIndex + index) % this.size;
        } else {
            actualIndex = index;
        }

        return this.buffer[actualIndex];
    }

    count(): number {
        return this.isFull ? this.size : this.currentIndex;
    }

    toArray(): T[] {
        if (!this.isFull) {
            return this.buffer.slice(0, this.currentIndex);
        }

        // The buffer is full, need to reorder items
        const result = new Array<T>(this.size);
        for (let i = 0; i < this.size; i++) {
            result[i] = this.buffer[(this.currentIndex + i) % this.size];
        }
        return result;
    }

    clear(): void {
        this.buffer = new Array<T>(this.size);
        this.currentIndex = 0;
        this.isFull = false;
    }
}