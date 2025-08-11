/**
 * @file src/ai/services/learning/metrics/managers/MetricsProfileManager.ts
 * @description Gestionnaire de profils de métriques d'apprentissage
 * @module MetricsProfileManager
 * @requires @/ai/services/learning/metrics/MetricsStore
 * @requires @/ai/services/learning/metrics/types/DetailedMetricsTypes
 * @requires @/ai/utils/LoggerFactory
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * Ce module gère le cycle de vie des profils de métriques, y compris
 * leur création, leur mise en cache et leur persistance.
 */

import { MetricsStore } from '../MetricsStore';
import { DetailedUserMetricsProfile } from '../types/DetailedMetricsTypes';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Configuration du gestionnaire de profils
 * @interface ProfileManagerOptions
 */
interface ProfileManagerOptions {
    /**
     * Durée de vie du cache (en ms)
     */
    ttl?: number;

    /**
     * Taille maximale du cache
     */
    maxCacheSize?: number;

    /**
     * Intervalle de nettoyage du cache (en ms)
     */
    cleanupInterval?: number;
}

/**
 * Entrée de cache avec timestamp d'expiration
 * @interface CacheEntry<T>
 * @template T
 */
interface CacheEntry<T> {
    /**
     * Données en cache
     */
    data: T;

    /**
     * Timestamp d'expiration
     */
    expiry: number;
}

/**
 * Gestionnaire de profils de métriques
 * 
 * @class MetricsProfileManager
 * @description Gère le cycle de vie des profils de métriques utilisateur,
 * y compris la mise en cache et les opérations de base CRUD
 */
export class MetricsProfileManager {
    /**
     * Logger pour le suivi des opérations
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('MetricsProfileManager');

    /**
     * Store de métriques
     * @private
     * @readonly
     */
    private readonly metricsStore: MetricsStore;

    /**
     * Cache des profils
     * @private
     */
    private readonly cache: Map<string, CacheEntry<DetailedUserMetricsProfile>>;

    /**
     * Options de configuration
     * @private
     * @readonly
     */
    private readonly options: Required<ProfileManagerOptions>;

    /**
     * ID de l'intervalle de nettoyage
     * @private
     */
    private cleanupIntervalId?: NodeJS.Timeout;

    /**
     * Constructeur du gestionnaire de profils
     * 
     * @constructor
     * @param {MetricsStore} metricsStore - Store de métriques
     * @param {ProfileManagerOptions} [options={}] - Options de configuration
     */
    constructor(metricsStore: MetricsStore, options: ProfileManagerOptions = {}) {
        this.metricsStore = metricsStore;
        this.cache = new Map();

        // Options par défaut
        this.options = {
            ttl: options.ttl ?? 5 * 60 * 1000, // 5 minutes
            maxCacheSize: options.maxCacheSize ?? 100,
            cleanupInterval: options.cleanupInterval ?? 60 * 1000 // 1 minute
        };

        // Démarrer le nettoyage périodique
        this.startCleanupInterval();
    }

    /**
     * Récupère ou crée un profil détaillé
     * 
     * @method getOrCreateProfile
     * @async
     * @param {string} userId - Identifiant de l'utilisateur
     * @returns {Promise<DetailedUserMetricsProfile>} Profil détaillé
     * @public
     */
    public async getOrCreateProfile(userId: string): Promise<DetailedUserMetricsProfile> {
        // Vérifier le cache
        const cachedProfile = this.getCachedProfile(userId);
        if (cachedProfile) {
            return cachedProfile;
        }

        // Charger depuis le store
        const profile = await this.metricsStore.loadProfile(userId);

        if (profile) {
            // Convertir en profil détaillé si nécessaire
            const detailedProfile = this.ensureDetailedProfile(profile as Partial<DetailedUserMetricsProfile>);

            // Mettre en cache
            this.cacheProfile(userId, detailedProfile);

            return detailedProfile;
        }

        // Créer un nouveau profil
        const newProfile = this.createDefaultProfile(userId);

        // Mettre en cache
        this.cacheProfile(userId, newProfile);

        return newProfile;
    }

    /**
     * Sauvegarde un profil
     * 
     * @method saveProfile
     * @async
     * @param {DetailedUserMetricsProfile} profile - Profil à sauvegarder
     * @returns {Promise<DetailedUserMetricsProfile>} Profil sauvegardé
     * @public
     */
    public async saveProfile(profile: DetailedUserMetricsProfile): Promise<DetailedUserMetricsProfile> {
        // Mettre à jour la date de dernière modification
        profile.lastUpdated = new Date();

        // Sauvegarder dans le store
        await this.metricsStore.saveProfile(profile);

        // Mettre à jour le cache
        this.cacheProfile(profile.userId, profile);

        return profile;
    }

    /**
     * Récupère un profil détaillé depuis le cache
     * 
     * @method getCachedProfile
     * @param {string} userId - Identifiant de l'utilisateur
     * @returns {DetailedUserMetricsProfile | undefined} Profil en cache ou undefined
     * @private
     */
    private getCachedProfile(userId: string): DetailedUserMetricsProfile | undefined {
        const entry = this.cache.get(userId);

        if (entry && Date.now() < entry.expiry) {
            return entry.data;
        }

        // Supprimer l'entrée expirée si elle existe
        if (entry) {
            this.cache.delete(userId);
        }

        return undefined;
    }

    /**
     * Met un profil en cache
     * 
     * @method cacheProfile
     * @param {string} userId - Identifiant de l'utilisateur
     * @param {DetailedUserMetricsProfile} profile - Profil à mettre en cache
     * @private
     */
    private cacheProfile(userId: string, profile: DetailedUserMetricsProfile): void {
        // Vérifier si le cache est plein
        if (this.cache.size >= this.options.maxCacheSize) {
            this.evictOldestEntry();
        }

        // Ajouter au cache
        this.cache.set(userId, {
            data: { ...profile }, // Copie pour éviter les modifications accidentelles
            expiry: Date.now() + this.options.ttl
        });
    }

    /**
     * Supprime l'entrée la plus ancienne du cache
     * 
     * @method evictOldestEntry
     * @private
     */
    private evictOldestEntry(): void {
        if (this.cache.size === 0) {
            return;
        }

        let oldestKey: string | null = null;
        let oldestExpiry = Infinity;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.expiry < oldestExpiry) {
                oldestKey = key;
                oldestExpiry = entry.expiry;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }

    /**
     * Démarre l'intervalle de nettoyage du cache
     * 
     * @method startCleanupInterval
     * @private
     */
    private startCleanupInterval(): void {
        if (this.cleanupIntervalId) {
            clearInterval(this.cleanupIntervalId);
        }

        this.cleanupIntervalId = setInterval(() => {
            this.cleanupCache();
        }, this.options.cleanupInterval);
    }

    /**
     * Nettoie les entrées expirées du cache
     * 
     * @method cleanupCache
     * @private
     */
    private cleanupCache(): void {
        const now = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiry) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Arrête le nettoyage périodique du cache
     * 
     * @method stopCleanupInterval
     * @public
     */
    public stopCleanupInterval(): void {
        if (this.cleanupIntervalId) {
            clearInterval(this.cleanupIntervalId);
            this.cleanupIntervalId = undefined;
        }
    }

    /**
     * Crée un profil par défaut
     * 
     * @method createDefaultProfile
     * @param {string} userId - Identifiant de l'utilisateur
     * @returns {DetailedUserMetricsProfile} Profil par défaut
     * @private
     */
    private createDefaultProfile(userId: string): DetailedUserMetricsProfile {
        const now = new Date();

        return {
            userId,
            createdAt: now,
            lastUpdated: now,
            profileVersion: '1.0',

            // Progression
            progression: {
                currentLevel: 'A1',
                progressInCurrentLevel: 0,
                levelHistory: [
                    {
                        level: 'A1',
                        achievedAt: now,
                        duration: 0
                    }
                ],
                progressionSpeed: 0,
                skillAreaProgress: {}
            },

            // Performance
            performance: {
                successRate: 0,
                exerciseTypeSuccessRates: {},
                skillSuccessRates: {},
                totalExercisesCompleted: 0,
                averageTimePerExercise: 0,
                exerciseTypeAverageTimes: {},
                performanceTrend: 0,
                recentScores: [],
                errorRates: {},
                averageAttemptsUntilSuccess: 0
            },

            // Maîtrise
            mastery: {
                masteredSkills: [],
                weaknessSkills: [],
                masteredSkillsCount: 0,
                skillMasteryLevels: {},
                forgettingCurves: {},
                retentionRates: {},
                performanceConsistency: {},
                skillAcquisitionRates: {}
            },

            // Engagement
            engagement: {
                averageSessionDuration: 0,
                exercisesPerSession: 0,
                usageFrequency: 0,
                totalLearningTime: 0,
                activityByDayOfWeek: {},
                activityByHourOfDay: {},
                sessionCompletionRate: 0,
                streakDays: 0,
                maxStreakDays: 0,
                interactivityLevel: 0
            },

            // Métriques
            standardMetrics: {},
            customMetrics: {}
        };
    }

    /**
     * Assure qu'un profil est au format détaillé
     * 
     * @method ensureDetailedProfile
     * @param {Partial<DetailedUserMetricsProfile>} profile - Profil à convertir
     * @returns {DetailedUserMetricsProfile} Profil détaillé
     * @private
     */
    private ensureDetailedProfile(profile: Partial<DetailedUserMetricsProfile>): DetailedUserMetricsProfile {
        const defaultProfile = this.createDefaultProfile(profile.userId || 'unknown');

        // Fusionner les profils
        return {
            ...defaultProfile,
            ...profile,
            progression: {
                ...defaultProfile.progression,
                ...(profile.progression || {})
            },
            performance: {
                ...defaultProfile.performance,
                ...(profile.performance || {})
            },
            mastery: {
                ...defaultProfile.mastery,
                ...(profile.mastery || {})
            },
            engagement: {
                ...defaultProfile.engagement,
                ...(profile.engagement || {})
            },
            standardMetrics: {
                ...defaultProfile.standardMetrics,
                ...(profile.standardMetrics || {})
            },
            customMetrics: {
                ...defaultProfile.customMetrics,
                ...(profile.customMetrics || {})
            }
        };
    }
}