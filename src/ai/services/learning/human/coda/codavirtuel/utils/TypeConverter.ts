/**
 * @file src/ai/services/learning/human/coda/codavirtuel/utils/TypeConverter.ts
 * @description Convertisseur de types harmonisé pour le système CODA v4.0.0
 * 
 * Fonctionnalités révolutionnaires :
 * - 🔄 Conversions harmonisées entre tous les types CODA
 * - ✨ Compatible exactOptionalPropertyTypes: true
 * - 🎯 Mapping intelligent entre interfaces legacy et nouvelles
 * - 🌟 Validation robuste et fallbacks sécurisés
 * - 📊 Optimisations performance et cache de conversions
 * - 🔧 Architecture modulaire < 300 lignes
 * 
 * @module utils
 * @version 4.0.0 - Convertisseur révolutionnaire harmonisé
 * @since 2025
 * @author MetaSign Team - CODA Type Harmonization
 * @lastModified 2025-07-06
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';

// Imports des types harmonisés
import type {
    ComprehensiveAIStatus,
    EmotionalState,
    EvolutionMetrics,
    PersonalityProfile,
    MemoryStats,
    PerformanceHistory,
    AIStudentPersonalityType,
    CODAPersonalityType,
    CulturalEnvironment,
    CECRLLevel,
    AIMood,
    CODATypeUtils
} from '../types/index';

/**
 * Interface pour le statut IA-élève dans les sessions (legacy)
 */
interface SessionAIStatus {
    readonly id: string;
    readonly name: string;
    readonly currentLevel: string;
    readonly mood: 'happy' | 'confused' | 'frustrated' | 'excited' | 'neutral';
    readonly personality: AIStudentPersonalityType;
    readonly weaknesses: readonly string[];
    readonly strengths: readonly string[];
    readonly lastLearned?: string;
    readonly comprehensionRate: number;
    readonly attentionSpan: number;
    readonly emotionalState: string;
}

/**
 * Cache des conversions pour optimiser les performances
 */
interface ConversionCache {
    readonly personalityMap: Map<string, AIStudentPersonalityType>;
    readonly levelMap: Map<string, CECRLLevel>;
    readonly moodMap: Map<string, AIMood>;
    readonly culturalMap: Map<string, CulturalEnvironment>;
}

/**
 * Convertisseur de types harmonisé révolutionnaire
 * 
 * @class TypeConverter
 * @description Service de conversion intelligent qui harmonise tous les types
 * du système CODA, optimise les performances avec cache et garantit la
 * compatibilité entre les interfaces legacy et nouvelles.
 * 
 * @example
 * ```typescript
 * const converter = new TypeConverter();
 * 
 * // Convertir personnalité CODA vers IA-élève
 * const aiPersonality = converter.convertCODAToAIPersonality('curious_student');
 * 
 * // Convertir statut complet vers statut session
 * const sessionStatus = converter.convertComprehensiveToSessionStatus(comprehensiveAI);
 * 
 * // Conversion avec validation
 * const validLevel = converter.convertToValidCECRLLevel('B2', 'A1');
 * ```
 */
export class TypeConverter {
    /**
     * Logger pour le convertisseur
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('TypeConverter');

    /**
     * Cache des conversions pour performance
     * @private
     * @readonly
     */
    private readonly cache: ConversionCache;

    /**
     * Constructeur du convertisseur harmonisé
     * 
     * @constructor
     */
    constructor() {
        // Initialiser le cache de conversions
        this.cache = {
            personalityMap: new Map(),
            levelMap: new Map(),
            moodMap: new Map(),
            culturalMap: new Map()
        };

        this.initializeConversionMaps();

        this.logger.info('🔄 TypeConverter harmonisé initialisé');
    }

    // ==================== CONVERSIONS PERSONNALITÉ ====================

    /**
     * Convertit CODAPersonalityType vers AIStudentPersonalityType
     * 
     * @method convertCODAToAIPersonality
     * @param {CODAPersonalityType} codaPersonality - Personnalité CODA
     * @returns {AIStudentPersonalityType} Personnalité IA-élève
     * @public
     */
    public convertCODAToAIPersonality(codaPersonality: CODAPersonalityType): AIStudentPersonalityType {
        // Vérifier le cache d'abord
        const cached = this.cache.personalityMap.get(codaPersonality);
        if (cached) {
            return cached;
        }

        const conversionMap: Record<CODAPersonalityType, AIStudentPersonalityType> = {
            'curious_student': 'curious_student',
            'shy_learner': 'shy_learner',
            'energetic_pupil': 'energetic_pupil',
            'patient_apprentice': 'patient_apprentice',
            'analytical_learner': 'analytical_learner',
            'creative_thinker': 'creative_thinker',
            // Conversions de types mentor vers types élève
            'encouraging_mentor': 'curious_student',
            'strict_teacher': 'patient_apprentice',
            'patient_guide': 'shy_learner'
        };

        const result = conversionMap[codaPersonality] || 'curious_student';
        this.cache.personalityMap.set(codaPersonality, result);
        return result;
    }

    /**
     * Convertit AIStudentPersonalityType vers CODAPersonalityType
     * 
     * @method convertAIToCODAPersonality
     * @param {AIStudentPersonalityType} aiPersonality - Personnalité IA-élève
     * @returns {CODAPersonalityType} Personnalité CODA
     * @public
     */
    public convertAIToCODAPersonality(aiPersonality: AIStudentPersonalityType): CODAPersonalityType {
        // Conversion directe car AIStudentPersonalityType ⊆ CODAPersonalityType
        return aiPersonality as CODAPersonalityType;
    }

    // ==================== CONVERSIONS ÉMOTIONS ET HUMEURS ====================

    /**
     * Convertit une émotion en AIMood
     * 
     * @method convertEmotionToMood
     * @param {string} emotion - Émotion textuelle
     * @returns {AIMood} Humeur IA
     * @public
     */
    public convertEmotionToMood(emotion: string): AIMood {
        const normalizedEmotion = emotion.toLowerCase();

        // Vérifier le cache
        const cached = this.cache.moodMap.get(normalizedEmotion);
        if (cached) {
            return cached;
        }

        const emotionMoodMap: Record<string, AIMood> = {
            'joy': 'happy',
            'happiness': 'happy',
            'happy': 'happy',
            'excited': 'excited',
            'excitement': 'excited',
            'enthusiasm': 'excited',
            'confused': 'confused',
            'confusion': 'confused',
            'puzzled': 'confused',
            'frustrated': 'frustrated',
            'frustration': 'frustrated',
            'angry': 'frustrated',
            'curious': 'curious',
            'curiosity': 'curious',
            'interested': 'curious',
            'neutral': 'neutral',
            'calm': 'neutral',
            'focused': 'neutral'
        };

        const result = emotionMoodMap[normalizedEmotion] || 'neutral';
        this.cache.moodMap.set(normalizedEmotion, result);
        return result;
    }

    /**
     * Convertit un mood local vers AIMood
     * 
     * @method convertLocalMoodToAIMood
     * @param {string} localMood - Humeur locale
     * @returns {AIMood} Humeur IA standardisée
     * @public
     */
    public convertLocalMoodToAIMood(localMood: string): AIMood {
        const moodMap: Record<string, AIMood> = {
            'happy': 'happy',
            'confused': 'confused',
            'frustrated': 'frustrated',
            'excited': 'excited',
            'neutral': 'neutral'
        };

        return moodMap[localMood] || 'neutral';
    }

    // ==================== CONVERSIONS NIVEAUX ====================

    /**
     * Convertit une chaîne vers CECRLLevel avec validation
     * 
     * @method convertToValidCECRLLevel
     * @param {string} level - Niveau en chaîne
     * @param {CECRLLevel} [fallback='A1'] - Niveau de fallback
     * @returns {CECRLLevel} Niveau CECRL valide
     * @public
     */
    public convertToValidCECRLLevel(level: string, fallback: CECRLLevel = 'A1'): CECRLLevel {
        const cached = this.cache.levelMap.get(level);
        if (cached) {
            return cached;
        }

        const result = CODATypeUtils.isCECRLLevel(level) ? level : fallback;
        this.cache.levelMap.set(level, result);
        return result;
    }

    /**
     * Convertit un numéro de niveau vers CECRLLevel
     * 
     * @method convertNumberToLevel
     * @param {number} num - Numéro de niveau (1-6)
     * @returns {CECRLLevel} Niveau CECRL
     * @public
     */
    public convertNumberToLevel(num: number): CECRLLevel {
        const levels: readonly CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const index = Math.max(0, Math.min(5, Math.floor(num) - 1));
        return levels[index];
    }

    /**
     * Convertit CECRLLevel vers numéro
     * 
     * @method convertLevelToNumber
     * @param {CECRLLevel} level - Niveau CECRL
     * @returns {number} Numéro de niveau (1-6)
     * @public
     */
    public convertLevelToNumber(level: CECRLLevel): number {
        const levelMap: Record<CECRLLevel, number> = {
            'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6
        };
        return levelMap[level] || 1;
    }

    // ==================== CONVERSIONS ENVIRONNEMENT CULTUREL ====================

    /**
     * Convertit une chaîne vers CulturalEnvironment avec validation
     * 
     * @method convertToValidCulturalEnvironment
     * @param {string} environment - Environnement en chaîne
     * @param {CulturalEnvironment} [fallback='deaf_family_home'] - Environnement de fallback
     * @returns {CulturalEnvironment} Environnement culturel valide
     * @public
     */
    public convertToValidCulturalEnvironment(
        environment: string,
        fallback: CulturalEnvironment = 'deaf_family_home'
    ): CulturalEnvironment {
        const cached = this.cache.culturalMap.get(environment);
        if (cached) {
            return cached;
        }

        const result = CODATypeUtils.isCulturalEnvironment(environment) ? environment : fallback;
        this.cache.culturalMap.set(environment, result);
        return result;
    }

    // ==================== CONVERSIONS STATUT IA-ÉLÈVE ====================

    /**
     * Convertit ComprehensiveAIStatus vers SessionAIStatus
     * 
     * @method convertComprehensiveToSessionStatus
     * @param {ComprehensiveAIStatus} comprehensive - Statut complet
     * @returns {SessionAIStatus} Statut de session
     * @public
     */
    public convertComprehensiveToSessionStatus(comprehensive: ComprehensiveAIStatus): SessionAIStatus {
        return {
            id: comprehensive.id,
            name: comprehensive.name,
            currentLevel: comprehensive.currentLevel,
            mood: comprehensive.mood,
            personality: comprehensive.personality,
            weaknesses: comprehensive.weaknesses,
            strengths: comprehensive.strengths,
            lastLearned: comprehensive.lastLearned,
            comprehensionRate: comprehensive.comprehensionRate,
            attentionSpan: comprehensive.attentionSpan,
            emotionalState: comprehensive.emotionalState.primaryEmotion
        };
    }

    /**
     * Convertit SessionAIStatus vers ComprehensiveAIStatus
     * 
     * @method convertSessionToComprehensiveStatus
     * @param {SessionAIStatus} session - Statut de session
     * @returns {ComprehensiveAIStatus} Statut complet
     * @public
     */
    public convertSessionToComprehensiveStatus(session: SessionAIStatus): ComprehensiveAIStatus {
        return {
            id: session.id,
            name: session.name,
            personality: session.personality,
            currentLevel: this.convertToValidCECRLLevel(session.currentLevel),
            mood: session.mood,
            culturalContext: 'deaf_family_home', // Valeur par défaut
            personalityProfile: this.createDefaultPersonalityProfile(session.personality),
            emotionalState: this.createEmotionalStateFromString(session.emotionalState),
            evolutionMetrics: CODATypeUtils.createDefaultEvolutionMetrics(),
            memoryStats: this.createDefaultMemoryStats(),
            performanceHistory: this.createDefaultPerformanceHistory(),
            weaknesses: session.weaknesses,
            strengths: session.strengths,
            lastLearned: session.lastLearned,
            progress: 0.1,
            motivation: 0.7,
            totalLearningTime: 0,
            comprehensionRate: session.comprehensionRate,
            attentionSpan: session.attentionSpan
        };
    }

    // ==================== MÉTHODES UTILITAIRES ====================

    /**
     * Valide et nettoie les données d'entrée
     * 
     * @method validateAndClean
     * @param {unknown} data - Données à valider
     * @param {string} expectedType - Type attendu
     * @returns {boolean} True si valide
     * @public
     */
    public validateAndClean(data: unknown, expectedType: string): boolean {
        if (data === null || data === undefined) {
            this.logger.warn('⚠️ Données nulles ou undefined', { expectedType });
            return false;
        }

        switch (expectedType) {
            case 'CECRLLevel':
                return CODATypeUtils.isCECRLLevel(data);
            case 'CODAPersonalityType':
                return CODATypeUtils.isCODAPersonalityType(data);
            case 'CulturalEnvironment':
                return CODATypeUtils.isCulturalEnvironment(data);
            default:
                return true;
        }
    }

    /**
     * Nettoie le cache de conversions
     * 
     * @method clearCache
     * @public
     */
    public clearCache(): void {
        this.cache.personalityMap.clear();
        this.cache.levelMap.clear();
        this.cache.moodMap.clear();
        this.cache.culturalMap.clear();

        this.logger.info('🧹 Cache de conversions nettoyé');
    }

    /**
     * Obtient les statistiques du cache
     * 
     * @method getCacheStats
     * @returns {Record<string, number>} Statistiques du cache
     * @public
     */
    public getCacheStats(): Record<string, number> {
        return {
            personalityEntries: this.cache.personalityMap.size,
            levelEntries: this.cache.levelMap.size,
            moodEntries: this.cache.moodMap.size,
            culturalEntries: this.cache.culturalMap.size
        };
    }

    // ==================== MÉTHODES PRIVÉES ====================

    /**
     * Initialise les maps de conversion
     */
    private initializeConversionMaps(): void {
        // Pré-charger les conversions les plus courantes pour optimiser les performances

        // Personnalités courantes
        this.cache.personalityMap.set('curious_student', 'curious_student');
        this.cache.personalityMap.set('shy_learner', 'shy_learner');
        this.cache.personalityMap.set('energetic_pupil', 'energetic_pupil');

        // Niveaux courants
        this.cache.levelMap.set('A1', 'A1');
        this.cache.levelMap.set('A2', 'A2');
        this.cache.levelMap.set('B1', 'B1');

        // Humeurs courantes
        this.cache.moodMap.set('happy', 'happy');
        this.cache.moodMap.set('neutral', 'neutral');
        this.cache.moodMap.set('excited', 'excited');

        // Environnements courants
        this.cache.culturalMap.set('deaf_family_home', 'deaf_family_home');
        this.cache.culturalMap.set('school_environment', 'school_environment');
    }

    /**
     * Crée un profil de personnalité par défaut
     */
    private createDefaultPersonalityProfile(personality: AIStudentPersonalityType): PersonalityProfile {
        return CODATypeUtils.createDefaultPersonalityProfile(personality, 'deaf_family_home');
    }

    /**
     * Crée un état émotionnel à partir d'une chaîne
     */
    private createEmotionalStateFromString(emotionString: string): EmotionalState {
        const mood = this.convertEmotionToMood(emotionString);

        return {
            currentMood: mood,
            confidence: 0.5,
            engagement: 0.6,
            stress: 0.3,
            primaryEmotion: emotionString,
            emotionalIntensity: 0.5,
            stabilityIndex: 0.7
        };
    }

    /**
     * Crée des statistiques mémoire par défaut
     */
    private createDefaultMemoryStats(): MemoryStats {
        return {
            totalMemories: 0,
            recentMemories: 0,
            retentionRate: 0.5,
            averageRetention: 0.5,
            strongestConcepts: [],
            conceptsNeedingReview: [],
            memoriesByType: {
                'semantic': 0,
                'episodic': 0,
                'procedural': 0
            }
        };
    }

    /**
     * Crée un historique de performance par défaut
     */
    private createDefaultPerformanceHistory(): PerformanceHistory {
        return {
            averageComprehension: 0.5,
            sessionCount: 0,
            improvementRate: 0.1,
            learningVelocity: 0.3,
            performanceConsistency: 0.6
        };
    }
}