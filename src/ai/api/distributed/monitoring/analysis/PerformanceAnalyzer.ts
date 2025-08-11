/**
 * @file src/ai/api/distributed/monitoring/types/performance.types.ts
 * Types et interfaces pour l'analyse de performance du système distribué
 */

/**
 * Rapport de fuite mémoire
 */
export interface MemoryLeakReport {
    /** Type de fuite détectée */
    type: 'heap_growth' | 'external_memory' | 'array_buffer' | 'unknown';
    /** Niveau de confiance dans la détection (0-1) */
    confidence: number;
    /** Taux de croissance en MB par minute */
    growthRatePerMinute: number;
    /** Timestamp de détection */
    detectedAt: number;
    /** Nombre d'échantillons analysés */
    samples: number;
    /** Métriques détaillées */
    metrics: Record<string, number>;
}

/**
 * Rapport de fragmentation mémoire
 */
export interface FragmentationReport {
    /** Timestamp du rapport */
    timestamp: number;
    /** Ratio de fragmentation (0-1) */
    fragmentationRatio: number;
    /** Indique si une fragmentation significative est détectée */
    fragmentationDetected: boolean;
    /** Sévérité de la fragmentation */
    severity: 'low' | 'medium' | 'high';
    /** Tendance de fragmentation */
    trend: 'increasing' | 'decreasing' | 'stable';
    /** Détails sur le tas */
    heapDetails: {
        /** Taille totale du tas en bytes */
        totalBytes: number;
        /** Taille utilisée du tas en bytes */
        usedBytes: number;
        /** Mémoire gaspillée en bytes */
        wastedBytes: number;
    };
    /** Recommandations */
    recommendations: string[];
}

/**
 * Types d'événements de performance
 */
export enum PerformanceEventType {
    MEMORY_LEAK = 'memory_leak',
    FRAGMENTATION = 'fragmentation',
    CPU_SPIKE = 'cpu_spike',
    IO_BOTTLENECK = 'io_bottleneck',
    NETWORK_LATENCY = 'network_latency'
}

/**
 * Rapport de performance consolidé
 */
export interface PerformanceReport {
    /** Identifiant du rapport */
    id: string;
    /** Timestamp de génération */
    timestamp: number;
    /** Type de rapport */
    type: PerformanceEventType;
    /** Sévérité */
    severity: 'low' | 'medium' | 'high';
    /** Détails spécifiques */
    details: Record<string, unknown>;
    /** Recommandations */
    recommendations: string[];
    /** Métriques contextuelles */
    contextMetrics?: Record<string, number>;
}

/**
 * Performance metrics collected from a distributed system
 */
export interface PerformanceMetrics {
    /** Unique identifier for this metrics collection */
    id: string;

    /** When the metrics were collected */
    timestamp: Date;

    /** Duration covered by these metrics in milliseconds */
    duration: number;

    /** Node/service that produced these metrics */
    source: string;

    /** CPU-related metrics */
    cpu?: {
        /** CPU utilization as percentage (0-100) */
        utilization: number;

        /** Number of cores available */
        cores: number;

        /** Load average (1min, 5min, 15min) */
        loadAverage?: [number, number, number];

        /** CPU execution profile if available */
        profile?: Profile;

        /** Process CPU time in milliseconds */
        processTime?: number;

        /** System CPU time in milliseconds */
        systemTime?: number;
    };

    /** Memory-related metrics */
    memory?: {
        /** Total memory usage in bytes */
        used: number;

        /** Total available memory in bytes */
        total: number;

        /** Memory usage as percentage (0-100) */
        utilization: number;

        /** Heap usage if applicable (for JS/JVM systems) */
        heap?: {
            used: number;
            total: number;
            utilization: number;
        };

        /** Details about memory allocations */
        allocations?: {
            rate: number;
            size: number;
        };
    };

    /** Thread-related metrics */
    thread?: {
        /** Total number of threads */
        count: number;

        /** Thread states */
        states: {
            running: number;
            blocked: number;
            waiting: number;
            idle: number;
        };

        /** Thread pool metrics if applicable */
        pools?: {
            name: string;
            size: number;
            active: number;
            queued: number;
            completed: number;
        }[];
    };

    /** Context switch metrics */
    contextSwitch?: {
        /** Voluntary context switches */
        voluntary: number;

        /** Involuntary context switches */
        involuntary: number;

        /** Total context switches */
        total: number;

        /** Context switch rate per second */
        rate: number;
    };

    /** Network-related metrics */
    network?: {
        /** Bytes received */
        bytesReceived: number;

        /** Bytes sent */
        bytesSent: number;

        /** Packets received */
        packetsReceived: number;

        /** Packets sent */
        packetsSent: number;

        /** Network errors */
        errors: number;

        /** Connections */
        connections: {
            total: number;
            active: number;
            idle: number;
        };
    };

    /** Custom metrics */
    custom?: Record<string, number | string | boolean>;
}

/**
 * Profile data collected from CPU profiling
 */
export interface Profile {
    /** Total time covered by this profile in milliseconds */
    totalTime: number;

    /** Profile nodes (function calls) */
    nodes: {
        /** Function name or identifier */
        functionName: string;

        /** Self time (time spent in this function excluding calls) in milliseconds */
        selfTime: number;

        /** Total time (including child calls) in milliseconds */
        totalTime: number;

        /** Number of times this function was called */
        hitCount: number;

        /** Call stack leading to this function */
        callStack?: string[];
    }[];
}

/**
 * Represents a performance hotspot
 */
export interface Hotspot {
    /** Location of the hotspot (function name, file, etc.) */
    location: string;

    /** Impact percentage (0-100) */
    impact: number;

    /** Duration in milliseconds */
    duration: number;

    /** Number of times this hotspot was hit */
    frequency: number;

    /** Call stack leading to this hotspot */
    callStack: string[];
}

/**
 * Results of thread analysis
 */
export interface ThreadAnalysisResult {
    /** Total thread count */
    count: number;

    /** Thread state distribution */
    states: {
        running: number;
        blocked: number;
        waiting: number;
        idle: number;
    };

    /** Thread utilization (0-1) */
    utilization: number;

    /** Thread imbalance factor (0-1) */
    imbalance: number;

    /** Thread blocking events */
    blockingEvents: {
        count: number;
        duration: number;
        impact: number;
    };

    /** Thread pool metrics */
    pools: {
        name: string;
        size: number;
        active: number;
        queued: number;
        completed: number;
        utilization: number;
    }[];

    /** Thread-related recommendations */
    recommendations: string[];
}

/**
 * Results of context switch analysis
 */
export interface ContextSwitchAnalysisResult {
    /** Voluntary context switches */
    voluntary: number;

    /** Involuntary context switches */
    involuntary: number;

    /** Total context switches */
    total: number;

    /** Context switch rate per second */
    rate: number;

    /** Impact of context switches on performance (0-1) */
    impact: number;

    /** Whether context switches are problematic */
    isProblematic: boolean;

    /** Root causes if problematic */
    rootCauses?: string[];

    /** Recommendations to improve */
    recommendations: string[];
}

/**
 * Performance score details
 */
export interface PerformanceScore {
    /** Numeric score (0-100) */
    score: number;

    /** Performance level */
    level: 'critical' | 'poor' | 'fair' | 'good' | 'excellent';

    /** Detailed breakdown of score components */
    details: string[];
}

/**
 * Complete CPU analysis results
 */
export interface CPUAnalysis {
    /** CPU utilization analysis */
    utilization: {
        /** Average utilization (0-100) */
        average: number;

        /** Peak utilization (0-100) */
        peak: number;

        /** Minimum utilization (0-100) */
        minimum: number;

        /** Variance in utilization */
        variance: number;

        /** Utilization pattern */
        pattern: 'stable' | 'spiky' | 'increasing' | 'decreasing';
    };

    /** Performance hotspots */
    hotspots: Hotspot[];

    /** Thread analysis results */
    threads: ThreadAnalysisResult;

    /** Context switch analysis results */
    contextSwitches: ContextSwitchAnalysisResult;

    /** Overall performance score */
    performance: PerformanceScore;

    /** Timestamp when analysis was performed */
    timestamp: Date;

    /** Duration covered by analysis in milliseconds */
    duration: number;
}