/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/index.ts
 * @description Index centralisé pour tous les systèmes AI spécialisés
 * 
 * Fonctionnalités :
 * - 🔗 Exports centralisés des systèmes AI
 * - 📊 Types et interfaces unifiés
 * - 🎯 Compatible avec AIStudentSimulator
 * - 🌟 Architecture modulaire révolutionnaire
 * - 🧠 Fonctions utilitaires pour les systèmes émotionnels
 * 
 * @module systems
 * @version 1.1.0 - Exports révolutionnaires avec utilitaires émotionnels
 * @since 2025
 * @author MetaSign Team - CODA Systems
 * @lastModified 2025-08-11
 */

// ===== IMPORTS DES SYSTÈMES =====

// Systèmes AI existants
export { AIEmotionalSystem } from './AIEmotionalSystem';
import { AIEmotionalSystem } from './AIEmotionalSystem';
import type { AIEmotionalSystemConfig } from './types/EmotionalTypes';

// ===== TYPES SIMULÉS POUR COMPATIBILITÉ =====

/**
 * Profil de personnalité Big Five
 */
export interface BigFiveTraits {
    readonly openness: number;
    readonly conscientiousness: number;
    readonly extraversion: number;
    readonly agreeableness: number;
    readonly neuroticism: number;
}

/**
 * Profil complet de personnalité IA
 */
export interface AIPersonalityProfile {
    readonly name?: string;
    readonly personalityId?: string;
    readonly personalityType?: string;
    readonly culturalContext?: string;
    readonly culturalBackground?: string;
    readonly bigFiveTraits: BigFiveTraits;
    readonly learningPreferences?: readonly string[];
    readonly learningStyle?: string;
    readonly motivationFactors: readonly string[];
    readonly challengeAreas?: readonly string[];
    readonly strengths?: readonly string[];
    readonly adaptationRate?: number;
    readonly adaptabilityScore?: number;
    readonly stressThreshold?: number;
    readonly preferredFeedbackStyle?: string;
    readonly timestamp?: Date;
}

/**
 * État émotionnel de l'IA
 */
export interface EmotionalState {
    readonly primaryEmotion: string;
    readonly intensity: number;
    readonly valence: number;
    readonly arousal: number;
    readonly confidence?: number;
    readonly triggers?: readonly string[];
    readonly trigger?: string;
    readonly duration?: number;
    readonly expectedDuration?: number;
    readonly timestamp: Date;
}

/**
 * Souvenir d'apprentissage
 */
export interface LearningMemory {
    readonly id: string;
    readonly concept: string;
    readonly content: string;
    readonly strength: number;
    readonly emotion: string;
    readonly timestamp: Date;
    readonly consolidationLevel: number;
    readonly retrievalCount: number;
    readonly associations: readonly string[];
}

/**
 * Paramètres de rappel de mémoire
 */
export interface RecallParameters {
    readonly context: string;
    readonly cues: readonly string[];
    readonly minStrength?: number;
    readonly memoryTypes?: readonly string[];
    readonly includeAssociations?: boolean;
}

/**
 * Paramètres de génération émotionnelle
 */
export interface EmotionGenerationParams {
    readonly learningContext: string;
    readonly stimulus: string;
    readonly stimulusIntensity: number;
    readonly learningOutcome: 'success' | 'partial' | 'failure';
    readonly contextualFactors: readonly string[];
}

/**
 * Métriques d'évolution
 */
export interface EvolutionMetrics {
    readonly globalConfidence: number;
    readonly adaptationRate: number;
    readonly learningEfficiency: number;
    readonly emotionalStability: number;
    readonly socialSkills: number;
    readonly progressConsistency: number;
    readonly evolutionTrend: 'improving' | 'stable' | 'declining';
    readonly lastEvolutionDate: Date;
}

/**
 * Expérience d'apprentissage
 */
export interface LearningExperience {
    readonly concept: string;
    readonly method: string;
    readonly successRate: number;
    readonly duration: number;
    readonly challenges: readonly string[];
    readonly emotions: readonly string[];
    readonly timestamp: Date;
}

/**
 * Métriques de mémoire
 */
export interface MemoryMetrics {
    readonly overallRetention: number;
    readonly totalMemories: number;
    readonly memoriesByType: Record<string, number>;
    readonly averageStrength: number;
    readonly averageConsolidation: number;
    readonly strongestConcepts: readonly string[];
    readonly needsReview: readonly string[];
    readonly learningEfficiency: number;
}

/**
 * Résultat de rappel de mémoires
 */
export interface RecallResult {
    readonly memories: readonly LearningMemory[];
    readonly totalFound: number;
    readonly averageStrength: number;
    readonly recallSuccess: boolean;
}

// ===== FONCTIONS UTILITAIRES POUR LE SYSTÈME ÉMOTIONNEL =====

/**
 * Crée une instance du système émotionnel avec la configuration spécifiée
 * @param config Configuration partielle du système émotionnel
 * @returns Instance du système émotionnel configurée
 */
export const createEmotionalSystem = (config?: Partial<AIEmotionalSystemConfig>): AIEmotionalSystem => {
    return new AIEmotionalSystem(config || {
        baseVolatility: 0.5,
        enablePatternDetection: true,
        triggerSensitivity: 0.6
    });
};

/**
 * Crée une configuration optimisée pour l'apprentissage adaptatif
 * Cette configuration privilégie l'adaptation progressive et la détection de patterns
 * @returns Configuration pour l'apprentissage adaptatif
 */
export const createAdaptiveLearningConfig = (): Partial<AIEmotionalSystemConfig> => {
    return {
        baseVolatility: 0.6,
        enablePatternDetection: true,
        triggerSensitivity: 0.5,
        emotionalPersistence: 0.7,
        historyDepth: 150,
        learningBias: 'positive'
    };
};

/**
 * Crée une configuration optimisée pour les étudiants sensibles émotionnellement
 * Cette configuration privilégie la stabilité émotionnelle et les transitions douces
 * @returns Configuration pour les étudiants sensibles
 */
export const createSensitiveStudentConfig = (): Partial<AIEmotionalSystemConfig> => {
    return {
        baseVolatility: 0.4,
        triggerSensitivity: 0.6,
        emotionalPersistence: 0.9,
        defaultTransitionSpeed: 3000,
        enablePatternDetection: true,
        emotionalResilience: 0.3
    };
};

/**
 * Crée une configuration optimisée pour l'apprentissage intensif
 * Cette configuration privilégie des réactions rapides et une haute sensibilité
 * @returns Configuration pour l'apprentissage intensif
 */
export const createIntensiveLearningConfig = (): Partial<AIEmotionalSystemConfig> => {
    return {
        baseVolatility: 0.8,
        triggerSensitivity: 0.9,
        emotionalPersistence: 0.4,
        defaultTransitionSpeed: 1000,
        enablePatternDetection: true,
        focusIntensity: 0.9
    };
};

/**
 * Valide une configuration émotionnelle et vérifie que les paramètres sont dans les plages acceptables
 * @param config Configuration émotionnelle à valider
 * @returns Résultat de validation avec indicateur de validité et erreurs éventuelles
 * @throws Error si la configuration contient des paramètres invalides
 */
export const validateEmotionalConfig = (
    config: Partial<AIEmotionalSystemConfig>
): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validation des plages de valeurs
    if (config.baseVolatility !== undefined) {
        if (config.baseVolatility < 0 || config.baseVolatility > 1) {
            errors.push('baseVolatility doit être entre 0 et 1');
        }
    }

    if (config.triggerSensitivity !== undefined) {
        if (config.triggerSensitivity < 0 || config.triggerSensitivity > 1) {
            errors.push('triggerSensitivity doit être entre 0 et 1');
        }
    }

    if (config.emotionalPersistence !== undefined) {
        if (config.emotionalPersistence < 0 || config.emotionalPersistence > 1) {
            errors.push('emotionalPersistence doit être entre 0 et 1');
        }
    }

    if (config.defaultTransitionSpeed !== undefined) {
        if (config.defaultTransitionSpeed < 100 || config.defaultTransitionSpeed > 10000) {
            errors.push('defaultTransitionSpeed doit être entre 100ms et 10000ms');
        }
    }

    if (config.historyDepth !== undefined) {
        if (config.historyDepth < 1 || config.historyDepth > 1000) {
            errors.push('historyDepth doit être entre 1 et 1000');
        }
    }

    // Si des erreurs ont été détectées, lancer une exception avec toutes les erreurs
    if (errors.length > 0) {
        throw new Error(`Configuration émotionnelle invalide: ${errors.join(', ')}`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

// ===== SYSTÈMES AI SIMULÉS =====

/**
 * Système de personnalités AI (simulé)
 */
export class AIPersonalitySystem {
    constructor(config?: Record<string, unknown>) {
        // Configuration simulée
    }

    /**
     * Crée un profil de personnalité
     */
    createPersonalityProfile(
        name: string,
        personalityType: string,
        culturalContext: string
    ): AIPersonalityProfile {
        return {
            name,
            personalityType,
            culturalContext,
            bigFiveTraits: {
                openness: 0.7,
                conscientiousness: 0.6,
                extraversion: 0.5,
                agreeableness: 0.8,
                neuroticism: 0.3
            },
            learningPreferences: ['visual', 'interactive'],
            motivationFactors: ['curiosity', 'achievement'],
            challengeAreas: ['attention_span', 'complex_concepts'],
            strengths: ['memory', 'pattern_recognition'],
            adaptationRate: 0.6
        };
    }
}

/**
 * Système de mémoire AI (simulé)
 */
export class AIMemorySystem {
    private profiles = new Map<string, AIPersonalityProfile>();
    private memories = new Map<string, LearningMemory[]>();

    constructor(config?: Record<string, unknown>) {
        // Configuration simulée
    }

    /**
     * Enregistre un profil de personnalité
     */
    registerPersonalityProfile(name: string, profile: AIPersonalityProfile): void {
        this.profiles.set(name, profile);
        this.memories.set(name, []);
    }

    /**
     * Stocke un nouveau souvenir
     */
    async storeMemory(
        studentName: string,
        concept: string,
        content: string,
        type: string,
        strength: number,
        emotion: string,
        tags: readonly string[]
    ): Promise<void> {
        const memories = this.memories.get(studentName) || [];
        const newMemory: LearningMemory = {
            id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            concept,
            content,
            strength,
            emotion,
            timestamp: new Date(),
            consolidationLevel: strength,
            retrievalCount: 0,
            associations: [...tags]
        };

        memories.push(newMemory);
        this.memories.set(studentName, memories);
    }

    /**
     * Rappelle des souvenirs
     */
    async recallMemories(studentName: string, params: RecallParameters): Promise<RecallResult> {
        const memories = this.memories.get(studentName) || [];
        const filtered = memories.filter(memory =>
            params.cues.some(cue =>
                memory.concept.includes(cue) ||
                memory.content.includes(cue)
            ) &&
            (params.minStrength === undefined || memory.strength >= params.minStrength)
        );

        return {
            memories: filtered,
            totalFound: filtered.length,
            averageStrength: filtered.length > 0
                ? filtered.reduce((sum, m) => sum + m.strength, 0) / filtered.length
                : 0,
            recallSuccess: filtered.length > 0
        };
    }

    /**
     * Obtient les métriques de mémoire
     */
    getMemoryMetrics(studentName: string): MemoryMetrics | undefined {
        const memories = this.memories.get(studentName);
        if (!memories || memories.length === 0) return undefined;

        const totalMemories = memories.length;
        const averageStrength = memories.reduce((sum, m) => sum + m.strength, 0) / totalMemories;

        return {
            overallRetention: averageStrength,
            totalMemories,
            memoriesByType: {
                sensory: 0, working: 0, short_term: 0, long_term: 0,
                episodic: 0, semantic: totalMemories, procedural: 0
            },
            averageStrength,
            averageConsolidation: averageStrength,
            strongestConcepts: memories
                .filter(m => m.strength > 0.7)
                .map(m => m.concept)
                .slice(0, 5),
            needsReview: memories
                .filter(m => m.strength < 0.5)
                .map(m => m.concept)
                .slice(0, 5),
            learningEfficiency: averageStrength
        };
    }

    /**
     * Applique l'oubli naturel
     */
    async applyNaturalForgetting(studentName: string): Promise<void> {
        const memories = this.memories.get(studentName);
        if (!memories) return;

        // Simulation simple de l'oubli
        memories.forEach(memory => {
            memory.strength = Math.max(0.1, memory.strength * 0.98);
        });
    }

    /**
     * Consolide les mémoires
     */
    async consolidateMemories(studentName: string): Promise<void> {
        const memories = this.memories.get(studentName);
        if (!memories) return;

        // Simulation simple de consolidation
        memories.forEach(memory => {
            if (memory.retrievalCount > 3) {
                memory.consolidationLevel = Math.min(1.0, memory.consolidationLevel * 1.1);
            }
        });
    }
}

/**
 * Système d'évolution AI (simulé)
 */
export class AIEvolutionSystem {
    private profiles = new Map<string, AIPersonalityProfile>();
    private metrics = new Map<string, EvolutionMetrics>();

    constructor(config?: Record<string, unknown>) {
        // Configuration simulée
    }

    /**
     * Enregistre un profil de personnalité
     */
    registerPersonalityProfile(name: string, profile: AIPersonalityProfile): void {
        this.profiles.set(name, profile);
        this.metrics.set(name, {
            globalConfidence: 0.5,
            adaptationRate: profile.adaptationRate || 0.5,
            learningEfficiency: 0.6,
            emotionalStability: 0.7,
            socialSkills: 0.5,
            progressConsistency: 0.6,
            evolutionTrend: 'improving',
            lastEvolutionDate: new Date()
        });
    }

    /**
     * Fait évoluer un étudiant
     */
    async evolveStudent(studentName: string, data: {
        recentExperiences: readonly LearningExperience[];
        emotionalPatterns: readonly unknown[];
        memoryMetrics: MemoryMetrics;
        socialInteractions: readonly unknown[];
        feedbackHistory: readonly unknown[];
        totalLearningTime: number;
    }): Promise<EvolutionMetrics> {
        const currentMetrics = this.metrics.get(studentName) || {
            globalConfidence: 0.5,
            adaptationRate: 0.5,
            learningEfficiency: 0.6,
            emotionalStability: 0.7,
            socialSkills: 0.5,
            progressConsistency: 0.6,
            evolutionTrend: 'improving' as const,
            lastEvolutionDate: new Date()
        };

        // Simulation d'évolution basée sur les expériences
        const avgSuccess = data.recentExperiences.length > 0
            ? data.recentExperiences.reduce((sum, exp) => sum + exp.successRate, 0) / data.recentExperiences.length
            : 0.5;

        const updatedMetrics: EvolutionMetrics = {
            ...currentMetrics,
            globalConfidence: Math.min(1.0, currentMetrics.globalConfidence + (avgSuccess - 0.5) * 0.1),
            learningEfficiency: Math.min(1.0, data.memoryMetrics.learningEfficiency),
            lastEvolutionDate: new Date()
        };

        this.metrics.set(studentName, updatedMetrics);
        return updatedMetrics;
    }

    /**
     * Obtient les métriques d'évolution
     */
    getEvolutionMetrics(studentName: string): EvolutionMetrics | undefined {
        return this.metrics.get(studentName);
    }
}

// Export des types émotionnels pour compatibilité
export * from './types/EmotionalTypes';