// src/ai/coordinators/interfaces/ICache.ts

import { CacheLevel } from '../types';

export interface CacheOptions {
    ttl?: number;
    level?: CacheLevel;
    tags?: string[];
}

export interface CacheStats {
    size: number;
    entries: number;
    hits: number;
    misses: number;
    hitRate: number;
    missRate: number;
    avgAccessTime: number;
    evictions: number;
    memoryUsage: number;
    lastPurgeTime: number;
    totalRequests: number;
    averageAccessTime: number;
}