/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/index.ts
 * @description Index centralisé pour les systèmes AI spécialisés
 * 
 * Module refactorisé selon le Guide de refactorisation MetaSign.
 * Responsabilité unique: exports centralisés et configuration des systèmes.
 * 
 * @module systems
 * @version 1.2.0 - Refactorisation conforme au guide MetaSign
 * @since 2025
 * @author MetaSign Team - CODA Systems
 */

// ================== IMPORTS DES SYSTÈMES ==================

export { AIEmotionalSystem } from './AIEmotionalSystem';
import { AIEmotionalSystem } from './AIEmotionalSystem';
import type { AIEmotionalSystemConfig } from './types/EmotionalTypes';

// Export des types émotionnels
export * from './types/EmotionalTypes';

// ================== TYPES PRINCIPAUX ==================

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
 * Profil de personnalité IA
 */
export interface AIPersonalityProfile {
    readonly name?: string;
    readonly personalityId?: string;
    readonly bigFiveTraits: BigFiveTraits;
    readonly learningStyle?: string;
    readonly motivationFactors: readonly string[];
    readonly adaptationRate?: number;
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
    readonly trigger?: string;
    readonly expectedDuration?: number;
    readonly timestamp: Date;
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
 * Métriques d'évolution
 */
export interface EvolutionMetrics {
    readonly globalConfidence: number;
    readonly adaptationRate: number;
    readonly learningEfficiency: number;
    readonly emotionalStability: number;
    readonly progressConsistency: number;
    readonly evolutionTrend: 'improving' | 'stable' | 'declining';
    readonly lastEvolutionDate: Date;
}

// ================== FONCTIONS UTILITAIRES ==================

/**
 * Crée une instance du système émotionnel
 * @param config Configuration optionnelle
 * @returns Instance configurée
 */
export const createEmotionalSystem = (config?: Partial<AIEmotionalSystemConfig>): AIEmotionalSystem => {
    return new AIEmotionalSystem(config || {
        baseVolatility: 0.5,
        enablePatternDetection: true,
        triggerSensitivity: 0.6
    });
};

/**
 * Configuration pour l'apprentissage adaptatif
 * @returns Configuration optimisée
 */
export const createAdaptiveLearningConfig = (): Partial<AIEmotionalSystemConfig> => {
    return {
        baseVolatility: 0.6,
        enablePatternDetection: true,
        triggerSensitivity: 0.5,
        emotionalPersistence: 0.7
    };
};

/**
 * Configuration pour étudiants sensibles
 * @returns Configuration stable
 */
export const createSensitiveStudentConfig = (): Partial<AIEmotionalSystemConfig> => {
    return {
        baseVolatility: 0.4,
        triggerSensitivity: 0.6,
        emotionalPersistence: 0.9,
        defaultTransitionSpeed: 3000
    };
};

/**
 * Configuration pour apprentissage intensif
 * @returns Configuration réactive
 */
export const createIntensiveLearningConfig = (): Partial<AIEmotionalSystemConfig> => {
    return {
        baseVolatility: 0.8,
        triggerSensitivity: 0.9,
        emotionalPersistence: 0.4,
        defaultTransitionSpeed: 1000
    };
};

/**
 * Valide une configuration émotionnelle
 * @param config Configuration à valider
 * @returns Résultat de validation
 * @throws Error si invalide
 */
export const validateEmotionalConfig = (
    config: Partial<AIEmotionalSystemConfig>
): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

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

    if (errors.length > 0) {
        throw new Error(`Configuration invalide: ${errors.join(', ')}`);
    }

    return { valid: true, errors: [] };
};

// ================== SYSTÈMES SIMULÉS ==================

/**
 * Système de personnalités AI
 * Responsabilité: Gestion des profils de personnalité
 */
export class AIPersonalitySystem {
    private profiles = new Map<string, AIPersonalityProfile>();

    /**
     * Crée un profil de personnalité
     */
    createPersonalityProfile(
        name: string,
        personalityType: string,
        culturalContext: string
    ): AIPersonalityProfile {
        // Ajustement des traits selon le type de personnalité
        const baseTraits = this.getTraitsForPersonalityType(personalityType);
        
        // Ajustement selon le contexte culturel
        const culturalAdjustments = this.getCulturalAdjustments(culturalContext);
        
        const profile: AIPersonalityProfile = {
            name,
            personalityId: `${personalityType}_${culturalContext}_${Date.now()}`,
            bigFiveTraits: {
                openness: Math.min(1, Math.max(0, baseTraits.openness + culturalAdjustments.openness)),
                conscientiousness: Math.min(1, Math.max(0, baseTraits.conscientiousness + culturalAdjustments.conscientiousness)),
                extraversion: Math.min(1, Math.max(0, baseTraits.extraversion + culturalAdjustments.extraversion)),
                agreeableness: Math.min(1, Math.max(0, baseTraits.agreeableness + culturalAdjustments.agreeableness)),
                neuroticism: Math.min(1, Math.max(0, baseTraits.neuroticism + culturalAdjustments.neuroticism))
            },
            learningStyle: this.getLearningStyleForType(personalityType),
            motivationFactors: this.getMotivationForCulture(culturalContext),
            adaptationRate: baseTraits.adaptationRate,
            timestamp: new Date()
        };

        this.profiles.set(name, profile);
        return profile;
    }

    /**
     * Obtient un profil existant
     */
    getProfile(name: string): AIPersonalityProfile | undefined {
        return this.profiles.get(name);
    }

    /**
     * Liste tous les profils
     */
    getAllProfiles(): readonly AIPersonalityProfile[] {
        return Array.from(this.profiles.values());
    }

    /**
     * Obtient les traits de base selon le type de personnalité
     */
    private getTraitsForPersonalityType(personalityType: string): BigFiveTraits & { adaptationRate: number } {
        const presets: Record<string, BigFiveTraits & { adaptationRate: number }> = {
            'analytical': {
                openness: 0.8,
                conscientiousness: 0.9,
                extraversion: 0.3,
                agreeableness: 0.6,
                neuroticism: 0.4,
                adaptationRate: 0.5
            },
            'creative': {
                openness: 0.9,
                conscientiousness: 0.5,
                extraversion: 0.7,
                agreeableness: 0.7,
                neuroticism: 0.6,
                adaptationRate: 0.8
            },
            'social': {
                openness: 0.6,
                conscientiousness: 0.7,
                extraversion: 0.9,
                agreeableness: 0.9,
                neuroticism: 0.3,
                adaptationRate: 0.7
            },
            'pragmatic': {
                openness: 0.5,
                conscientiousness: 0.8,
                extraversion: 0.5,
                agreeableness: 0.7,
                neuroticism: 0.2,
                adaptationRate: 0.6
            }
        };

        return presets[personalityType] || presets['pragmatic'];
    }

    /**
     * Obtient les ajustements culturels
     */
    private getCulturalAdjustments(culturalContext: string): BigFiveTraits {
        const adjustments: Record<string, BigFiveTraits> = {
            'collectivistic': {
                openness: -0.1,
                conscientiousness: 0.1,
                extraversion: -0.2,
                agreeableness: 0.2,
                neuroticism: 0.0
            },
            'individualistic': {
                openness: 0.1,
                conscientiousness: 0.0,
                extraversion: 0.2,
                agreeableness: -0.1,
                neuroticism: 0.0
            },
            'high-context': {
                openness: 0.0,
                conscientiousness: 0.1,
                extraversion: -0.1,
                agreeableness: 0.1,
                neuroticism: -0.1
            },
            'low-context': {
                openness: 0.1,
                conscientiousness: -0.1,
                extraversion: 0.1,
                agreeableness: 0.0,
                neuroticism: 0.1
            }
        };

        return adjustments[culturalContext] || adjustments['individualistic'];
    }

    /**
     * Détermine le style d'apprentissage selon le type
     */
    private getLearningStyleForType(personalityType: string): string {
        const styles: Record<string, string> = {
            'analytical': 'logical-mathematical',
            'creative': 'visual-spatial',
            'social': 'interpersonal',
            'pragmatic': 'kinesthetic'
        };

        return styles[personalityType] || 'mixed';
    }

    /**
     * Détermine les facteurs de motivation selon la culture
     */
    private getMotivationForCulture(culturalContext: string): readonly string[] {
        const motivations: Record<string, readonly string[]> = {
            'collectivistic': ['group-harmony', 'social-recognition', 'contribution'],
            'individualistic': ['personal-achievement', 'autonomy', 'competition'],
            'high-context': ['relationship-building', 'respect', 'tradition'],
            'low-context': ['efficiency', 'direct-feedback', 'innovation']
        };

        return motivations[culturalContext] || ['curiosity', 'achievement'];
    }
}

/**
 * Système de mémoire AI
 * Responsabilité: Gestion des souvenirs d'apprentissage
 */
export class AIMemorySystem {
    private memories = new Map<string, LearningMemory[]>();

    /**
     * Stocke un nouveau souvenir
     */
    async storeMemory(
        studentName: string,
        concept: string,
        content: string,
        strength: number,
        emotion: string
    ): Promise<void> {
        const memories = this.memories.get(studentName) || [];

        const newMemory: LearningMemory = {
            id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            concept,
            content,
            strength,
            emotion,
            timestamp: new Date(),
            consolidationLevel: strength,
            retrievalCount: 0,
            associations: []
        };

        memories.push(newMemory);
        this.memories.set(studentName, memories);
    }

    /**
     * Rappelle des souvenirs
     */
    async recallMemories(studentName: string, concept: string): Promise<readonly LearningMemory[]> {
        const memories = this.memories.get(studentName) || [];
        return memories.filter(memory =>
            memory.concept.includes(concept) ||
            memory.content.includes(concept)
        );
    }

    /**
     * Obtient tous les souvenirs d'un étudiant
     */
    getAllMemories(studentName: string): readonly LearningMemory[] {
        return this.memories.get(studentName) || [];
    }

    /**
     * Applique l'oubli naturel (crée de nouveaux objets mutables)
     */
    async applyNaturalForgetting(studentName: string): Promise<void> {
        const memories = this.memories.get(studentName);
        if (!memories) return;

        const updatedMemories = memories.map(memory => ({
            ...memory,
            strength: Math.max(0.1, memory.strength * 0.98)
        }));

        this.memories.set(studentName, updatedMemories);
    }

    /**
     * Consolide les mémoires (crée de nouveaux objets mutables)
     */
    async consolidateMemories(studentName: string): Promise<void> {
        const memories = this.memories.get(studentName);
        if (!memories) return;

        const updatedMemories = memories.map(memory => ({
            ...memory,
            consolidationLevel: memory.retrievalCount > 3
                ? Math.min(1.0, memory.consolidationLevel * 1.1)
                : memory.consolidationLevel
        }));

        this.memories.set(studentName, updatedMemories);
    }
}

/**
 * Système d'évolution AI
 * Responsabilité: Gestion de l'évolution des étudiants
 */
export class AIEvolutionSystem {
    private metrics = new Map<string, EvolutionMetrics>();

    /**
     * Initialise les métriques pour un étudiant
     */
    initializeStudent(studentName: string, profile: AIPersonalityProfile): void {
        this.metrics.set(studentName, {
            globalConfidence: 0.5,
            adaptationRate: profile.adaptationRate || 0.5,
            learningEfficiency: 0.6,
            emotionalStability: 0.7,
            progressConsistency: 0.6,
            evolutionTrend: 'improving',
            lastEvolutionDate: new Date()
        });
    }

    /**
     * Met à jour les métriques d'évolution
     */
    async updateEvolution(studentName: string, successRate: number): Promise<EvolutionMetrics> {
        const current = this.metrics.get(studentName) || {
            globalConfidence: 0.5,
            adaptationRate: 0.5,
            learningEfficiency: 0.6,
            emotionalStability: 0.7,
            progressConsistency: 0.6,
            evolutionTrend: 'improving' as const,
            lastEvolutionDate: new Date()
        };

        const updated: EvolutionMetrics = {
            ...current,
            globalConfidence: Math.min(1.0, current.globalConfidence + (successRate - 0.5) * 0.1),
            learningEfficiency: Math.min(1.0, current.learningEfficiency + (successRate - 0.5) * 0.05),
            lastEvolutionDate: new Date()
        };

        this.metrics.set(studentName, updated);
        return updated;
    }

    /**
     * Obtient les métriques d'évolution
     */
    getEvolutionMetrics(studentName: string): EvolutionMetrics | undefined {
        return this.metrics.get(studentName);
    }

    /**
     * Liste toutes les métriques
     */
    getAllMetrics(): ReadonlyMap<string, EvolutionMetrics> {
        return new Map(this.metrics);
    }
}