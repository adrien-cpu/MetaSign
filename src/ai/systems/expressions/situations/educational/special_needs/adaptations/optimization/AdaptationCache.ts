// src/ai/systems/expressions/situations/educational/special_needs/adaptations/optimization/AdaptationCache.ts

import { AdaptationStrategy, ContextAnalysisResult } from '../types';

/**
 * Cache pour les opérations d'adaptation coûteuses
 */
export class AdaptationCache {
    private static instance: AdaptationCache;
    private contextCache = new Map<string, { result: ContextAnalysisResult, timestamp: number }>();
    private strategyCache = new Map<string, { strategy: AdaptationStrategy, effectiveness: number, timestamp: number }>();

    // TTL par défaut de 5 minutes pour les entrées de cache
    private readonly DEFAULT_TTL = 5 * 60 * 1000;

    private constructor() {
        // Nettoyage périodique du cache toutes les 10 minutes
        setInterval(() => this.cleanupCache(), 10 * 60 * 1000);
    }

    /**
     * Obtient l'instance singleton
     */
    public static getInstance(): AdaptationCache {
        if (!AdaptationCache.instance) {
            AdaptationCache.instance = new AdaptationCache();
        }
        return AdaptationCache.instance;
    }

    /**
     * Récupère un contexte du cache si disponible et non expiré
     */
    public getContext(key: string): ContextAnalysisResult | null {
        const cached = this.contextCache.get(key);
        if (!cached) return null;

        // Vérifier si l'entrée de cache est expirée
        if (Date.now() - cached.timestamp > this.DEFAULT_TTL) {
            this.contextCache.delete(key);
            return null;
        }

        return cached.result;
    }

    /**
     * Stocke un contexte dans le cache
     */
    public setContext(key: string, result: ContextAnalysisResult): void {
        this.contextCache.set(key, {
            result,
            timestamp: Date.now()
        });
    }

    /**
     * Récupère une stratégie du cache si disponible et non expirée
     */
    public getStrategy(key: string): { strategy: AdaptationStrategy, effectiveness: number } | null {
        const cached = this.strategyCache.get(key);
        if (!cached) return null;

        // Vérifier si l'entrée de cache est expirée
        if (Date.now() - cached.timestamp > this.DEFAULT_TTL) {
            this.strategyCache.delete(key);
            return null;
        }

        return {
            strategy: cached.strategy,
            effectiveness: cached.effectiveness
        };
    }

    /**
     * Stocke une stratégie dans le cache
     */
    public setStrategy(key: string, strategy: AdaptationStrategy, effectiveness: number): void {
        this.strategyCache.set(key, {
            strategy,
            effectiveness,
            timestamp: Date.now()
        });
    }

    /**
     * Nettoie les entrées expirées du cache
     * Cette méthode est publique pour permettre un nettoyage manuel si nécessaire
     */
    public cleanupCache(): void {
        const now = Date.now();

        // Nettoyer le cache de contextes
        for (const [key, cached] of this.contextCache.entries()) {
            if (now - cached.timestamp > this.DEFAULT_TTL) {
                this.contextCache.delete(key);
            }
        }

        // Nettoyer le cache de stratégies
        for (const [key, cached] of this.strategyCache.entries()) {
            if (now - cached.timestamp > this.DEFAULT_TTL) {
                this.strategyCache.delete(key);
            }
        }
    }

    /**
     * Génère une clé de cache basée sur un objet
     */
    public static generateKey(obj: Record<string, unknown>): string {
        // Ignorer les propriétés comme timestamp pour la génération de clé
        const { timestamp: _, ...rest } = obj;
        return JSON.stringify(rest);
    }
}