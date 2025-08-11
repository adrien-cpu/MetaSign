/**
 * @file src/ai/services/learning/human/coda/codavirtuel/services/legacy/LegacyProfileManager.ts
 * @description Gestionnaire spécialisé pour les profils utilisateur legacy
 * 
 * Fonctionnalités :
 * - 🔄 Gestion complète des profils utilisateur legacy
 * - 📊 Cache intelligent avec gestion unifiée null/undefined
 * - 🎯 Enrichissement avec données CODA
 * - ✨ Compatible exactOptionalPropertyTypes: true
 * - 🔧 Module < 300 lignes
 * 
 * @module legacy
 * @version 1.0.0 - Gestionnaire de profils refactorisé
 * @since 2025
 * @author MetaSign Team - CODA Legacy Profile Management
 * @lastModified 2025-08-03
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';

// Imports des services legacy
import { ProfileService } from '../ProfileService';

// Imports des types harmonisés
import type {
    UserReverseProfile,
    ReverseApprenticeshipOptions,
    CECRLLevel,
    CulturalEnvironment
} from '../../types/index';

// Import type pour l'orchestrateur de sessions
import type { CODASessionOrchestrator } from '../CODASessionOrchestrator';

/**
 * Interface pour les profils utilisateur legacy
 */
interface LegacyUserProfile {
    readonly userId: string;
    readonly currentLevel: string;
    readonly strengths: readonly string[];
    readonly weaknesses: readonly string[];
    readonly preferences: readonly string[];
    readonly sessionCount: number;
    readonly lastActivity: Date;
    readonly culturalBackground?: string;
    readonly motivationLevel?: number;
}

/**
 * Données de l'IA-élève adaptées
 */
interface AIStudentData {
    readonly id: string;
    readonly name: string;
    readonly personality: string;
    readonly currentLevel: CECRLLevel;
    readonly culturalContext: CulturalEnvironment;
    readonly mood: string;
    readonly weaknesses: readonly string[];
    readonly strengths: readonly string[];
    readonly learningPreferences: readonly string[];
}

/**
 * Gestionnaire spécialisé pour les profils utilisateur legacy
 * 
 * @class LegacyProfileManager
 * @description Gère l'initialisation, la récupération et l'enrichissement des profils
 * utilisateur legacy avec compatibilité CODA et cache intelligent.
 */
export class LegacyProfileManager {
    /**
     * Logger pour le gestionnaire de profils
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('LegacyProfileManager');

    /**
     * Service de gestion des profils legacy
     * @private
     * @readonly
     */
    private readonly profileService: ProfileService;

    /**
     * Cache des profils utilisateur avec gestion unifiée null/undefined
     * @private
     */
    private readonly profileCache = new Map<string, UserReverseProfile>();

    /**
     * Cache des propriétés étendues
     * @private
     */
    private readonly extendedPropertiesCache = new Map<string, Record<string, unknown>>();

    /**
     * Constructeur du gestionnaire de profils legacy
     * 
     * @constructor
     * @param {ReverseApprenticeshipOptions} options - Options du système
     * @param {CODASessionOrchestrator} sessionOrchestrator - Orchestrateur de sessions
     */
    constructor(
        private readonly options: ReverseApprenticeshipOptions,
        private readonly sessionOrchestrator: CODASessionOrchestrator
    ) {
        this.profileService = new ProfileService(this.options.initialLevel || 'A1');

        this.logger.info('👤 LegacyProfileManager initialisé', {
            codaMode: this.options.codaMode,
            initialLevel: this.options.initialLevel
        });
    }

    /**
     * Initialise un profil utilisateur avec conversion automatique
     * 
     * @method initializeProfile
     * @async
     * @param {string} userId - Identifiant utilisateur
     * @param {CECRLLevel} [initialLevel] - Niveau initial CECRL optionnel
     * @param {CulturalEnvironment} [culturalBackground] - Contexte culturel
     * @returns {Promise<UserReverseProfile>} Profil utilisateur initialisé et optimisé
     * @public
     */
    public async initializeProfile(
        userId: string,
        initialLevel?: CECRLLevel,
        culturalBackground?: CulturalEnvironment
    ): Promise<UserReverseProfile> {
        // Vérifier le cache d'abord
        const cached = this.profileCache.get(userId);
        if (cached) {
            this.logger.debug('📋 Profil récupéré du cache', { userId });
            return cached;
        }

        // Utiliser le service legacy pour l'initialisation avec valeurs par défaut intelligentes
        const resolvedLevel = initialLevel || this.options.initialLevel as CECRLLevel || 'A1';
        const resolvedCulture = culturalBackground || this.getDefaultCulturalEnvironment();

        const profile = await this.profileService.initializeUserProfile(userId, resolvedLevel);

        // Enrichir avec données CODA si mode CODA activé
        const enrichedProfile = this.options.codaMode
            ? await this.enrichProfileWithCODAData(profile, userId, resolvedCulture)
            : this.enhanceProfileWithDefaults(profile, resolvedCulture);

        // Mettre en cache
        this.profileCache.set(userId, enrichedProfile);

        this.logger.info('✅ Profil utilisateur initialisé et enrichi', {
            userId,
            level: enrichedProfile.currentLevel,
            strengths: enrichedProfile.strengths.length,
            weaknesses: enrichedProfile.weaknesses.length,
            culturalBackground: enrichedProfile.culturalBackground
        });

        return enrichedProfile;
    }

    /**
     * Obtient un profil utilisateur avec gestion sécurisée
     * 
     * @method getUserProfile
     * @async
     * @param {string} userId - Identifiant utilisateur
     * @returns {Promise<UserReverseProfile | null>} Profil utilisateur ou null si non trouvé
     * @public
     */
    public async getUserProfile(userId: string): Promise<UserReverseProfile | null> {
        // Vérifier le cache d'abord
        const cachedProfile = this.profileCache.get(userId);
        if (cachedProfile) {
            return cachedProfile;
        }

        try {
            // Obtenir via le service legacy avec gestion sécurisée
            const serviceProfile = await this.profileService.getUserProfile(userId);

            if (serviceProfile) {
                this.profileCache.set(userId, serviceProfile);
                return serviceProfile;
            }

            return null;
        } catch (error) {
            this.logger.warn('Erreur récupération profil interne', { userId, error });
            return null;
        }
    }

    /**
     * Convertit un profil legacy vers le nouveau format
     * 
     * @method convertLegacyProfile
     * @param {LegacyUserProfile} legacyProfile - Profil legacy à convertir
     * @returns {UserReverseProfile} Profil converti
     * @public
     */
    public convertLegacyProfile(legacyProfile: LegacyUserProfile): UserReverseProfile {
        const culturalBackground = this.mapStringToCulturalEnvironment(
            legacyProfile.culturalBackground || 'deaf_family_home'
        );

        // Création sécurisée du profil de base
        const baseProfile: UserReverseProfile = {
            userId: legacyProfile.userId,
            currentLevel: this.mapStringToCECRLLevel(legacyProfile.currentLevel),
            strengths: [...legacyProfile.strengths],
            weaknesses: [...legacyProfile.weaknesses],
            learningPreferences: [...legacyProfile.preferences],
            progressHistory: [],
            culturalBackground,
            motivationFactors: [...legacyProfile.preferences],
            learningStyle: 'visual',
            sessionCount: legacyProfile.sessionCount,
            totalLearningTime: 0,
            lastActivity: legacyProfile.lastActivity
        };

        // Stocker les propriétés étendues dans le cache séparé
        const extendedProperties = {
            averageSessionDuration: 0,
            preferredDifficulty: 0.5,
            adaptabilityScore: legacyProfile.motivationLevel || 0.5
        };

        this.extendedPropertiesCache.set(`profile_${legacyProfile.userId}`, extendedProperties);

        return baseProfile;
    }

    /**
     * Nettoie les ressources et cache
     * 
     * @method destroy
     * @async
     * @returns {Promise<void>}
     * @public
     */
    public async destroy(): Promise<void> {
        this.profileCache.clear();
        this.extendedPropertiesCache.clear();

        this.logger.info('🧹 LegacyProfileManager détruit et caches nettoyés');
    }

    // ==================== MÉTHODES PRIVÉES ====================

    /**
     * Enrichit un profil avec des données CODA typées
     */
    private async enrichProfileWithCODAData(
        profile: UserReverseProfile,
        userId: string,
        culturalBackground: CulturalEnvironment
    ): Promise<UserReverseProfile> {
        // Vérifier s'il y a une IA-élève associée
        const aiStudent = this.sessionOrchestrator.getAIStudentStatus(userId);

        if (aiStudent) {
            // Conversion sécurisée avec gestion des propriétés manquantes
            const aiStudentData = this.convertToAIStudentData(aiStudent);

            // Enrichir le profil avec les données de l'IA-élève typées
            return {
                ...profile,
                culturalBackground: aiStudentData.culturalContext,
                learningStyle: this.mapPersonalityToLearningStyle(aiStudentData.personality),
                motivationFactors: [...profile.motivationFactors, 'ai_companion_learning']
            };
        }

        return this.enhanceProfileWithDefaults(profile, culturalBackground);
    }

    /**
     * Améliore un profil avec des valeurs par défaut intelligentes
     */
    private enhanceProfileWithDefaults(
        profile: UserReverseProfile,
        culturalBackground: CulturalEnvironment
    ): UserReverseProfile {
        // Stocker les propriétés étendues dans le cache
        const extendedProperties = {
            adaptabilityScore: 0.7,
            preferredDifficulty: 0.5
        };

        this.extendedPropertiesCache.set(`profile_${profile.userId}`, extendedProperties);

        return {
            ...profile,
            culturalBackground
        };
    }

    /**
     * Convertit ComprehensiveAIStatus vers AIStudentData de manière sécurisée
     */
    private convertToAIStudentData(aiStudent: unknown): AIStudentData {
        // Conversion contrôlée avec interface typée
        const student = aiStudent as {
            id?: string;
            name?: string;
            personality?: string;
            currentLevel?: string;
            culturalContext?: string;
            mood?: string;
            weaknesses?: string[];
            challenges?: string[];
            strengths?: string[];
            learningPreferences?: string[];
            preferences?: string[];
        };

        return {
            id: student.id || 'unknown',
            name: student.name || 'AI Student',
            personality: student.personality || 'curious_student',
            currentLevel: this.mapStringToCECRLLevel(student.currentLevel || 'A1'),
            culturalContext: this.mapStringToCulturalEnvironment(student.culturalContext || 'deaf_family_home'),
            mood: student.mood || 'neutral',
            weaknesses: student.weaknesses || student.challenges || ['basic_concepts'],
            strengths: student.strengths || ['enthusiasm'],
            learningPreferences: student.learningPreferences || student.preferences || ['visual']
        };
    }

    /**
     * Obtient l'environnement culturel par défaut
     */
    private getDefaultCulturalEnvironment(): CulturalEnvironment {
        return this.options.defaultCulturalEnvironment || 'deaf_family_home';
    }

    /**
     * Mappe une chaîne vers un niveau CECRL valide
     */
    private mapStringToCECRLLevel(level: string): CECRLLevel {
        const validLevels: CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        return validLevels.includes(level as CECRLLevel) ? level as CECRLLevel : 'A1';
    }

    /**
     * Mappe une chaîne vers un environnement culturel valide
     */
    private mapStringToCulturalEnvironment(culture: string): CulturalEnvironment {
        const validEnvironments: CulturalEnvironment[] = [
            'deaf_family_home', 'mixed_hearing_family', 'school_environment',
            'community_center', 'online_learning', 'deaf_school',
            'deaf_community_center', 'deaf_workplace'
        ];
        return validEnvironments.includes(culture as CulturalEnvironment)
            ? culture as CulturalEnvironment
            : 'deaf_family_home';
    }

    /**
     * Mappe une personnalité vers un style d'apprentissage
     */
    private mapPersonalityToLearningStyle(personality: string): 'visual' | 'kinesthetic' | 'auditory' | 'mixed' {
        const mappings: Record<string, 'visual' | 'kinesthetic' | 'auditory' | 'mixed'> = {
            'curious_student': 'mixed',
            'shy_learner': 'visual',
            'energetic_pupil': 'kinesthetic',
            'patient_apprentice': 'visual',
            'analytical_learner': 'visual',
            'creative_thinker': 'mixed'
        };

        return mappings[personality] || 'visual';
    }
}