/**
 * @file src/ai/services/learning/interfaces/ServiceInterfaces.ts
 * @description Interfaces pour les services d'apprentissage LSF.
 * Contient les définitions des gestionnaires de modules, badges et progression.
 * Compatible avec exactOptionalPropertyTypes: true
 * @module ServiceInterfaces
 * @version 3.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * @example
 * ```typescript
 * import type { 
 *   IModuleManager, 
 *   IBadgeManager, 
 *   IProgressManager 
 * } from './ServiceInterfaces';
 * ```
 */

import type {
    LearningProgress,
    ProgressUpdateSummary,
    ProgressStatistics,
    ModuleCategory,
    QuizAttempt
} from './CoreLearningInterfaces';
import type {
    LSFLearningModule,
    LSFBadge,
    LSFContentMetadata,
    LSFQualityAssurance
} from './LSFContentInterfaces';

/**
 * Interface de base pour les gestionnaires de services d'apprentissage LSF
 */
export interface ILearningServiceManager {
    /** Initialise le service avec la configuration LSF */
    initialize(): Promise<void>;
    /** Arrête proprement le service */
    shutdown(): Promise<void>;
    /** Vérifie la santé du service */
    checkHealth(): Promise<boolean>;
    /** Obtient les métriques du service (optionnel) */
    getMetrics?(): Promise<Readonly<Record<string, unknown>>>;
}

/**
 * Interface pour le gestionnaire de modules LSF
 */
export interface IModuleManager extends ILearningServiceManager {
    /** Ajoute ou met à jour un module LSF */
    setModule(module: LSFLearningModule): Promise<void>;
    /** Récupère un module LSF par son ID */
    getModule(moduleId: string): LSFLearningModule | undefined;
    /** Récupère tous les modules LSF */
    getAllModules(): readonly LSFLearningModule[];
    /** Récupère les modules par catégorie LSF */
    getModulesByCategory(category: ModuleCategory): readonly LSFLearningModule[];
    /** Vérifie si un module LSF est déverrouillé */
    isModuleUnlocked(moduleId: string, userProgress: LearningProgress): boolean;
    /** Récupère les modules LSF recommandés */
    getRecommendedModules(userProgress: LearningProgress, count?: number): readonly LSFLearningModule[];
    /** Supprime un module LSF */
    removeModule(moduleId: string): Promise<boolean>;
    /** Recherche des modules par compétences LSF */
    findModulesBySkills(skills: readonly string[]): readonly LSFLearningModule[];
}

/**
 * Interface pour le gestionnaire de badges LSF
 */
export interface IBadgeManager extends ILearningServiceManager {
    /** Ajoute ou met à jour un badge LSF */
    setBadge(badge: LSFBadge): Promise<void>;
    /** Récupère un badge LSF par son ID */
    getBadge(badgeId: string): LSFBadge | undefined;
    /** Récupère tous les badges LSF */
    getAllBadges(): readonly LSFBadge[];
    /** Vérifie si un badge LSF est débloqué */
    checkBadgeUnlocked(badgeId: string, userProgress: LearningProgress): boolean;
    /** Vérifie et attribue les nouveaux badges LSF */
    checkAndAwardBadges(userProgress: LearningProgress): readonly string[];
    /** Supprime un badge LSF */
    removeBadge(badgeId: string): Promise<boolean>;
    /** Récupère les badges par catégorie */
    getBadgesByCategory(category: string): readonly LSFBadge[];
}

/**
 * Interface pour le gestionnaire de progression LSF
 */
export interface IProgressManager extends ILearningServiceManager {
    /** Met à jour la progression d'un module LSF */
    updateModuleProgress(
        userProgress: LearningProgress,
        moduleId: string,
        progress: number
    ): ProgressUpdateSummary;
    /** Ajoute une tentative de quiz LSF */
    addQuizAttempt(
        userProgress: LearningProgress,
        quizId: string,
        attempt: Omit<QuizAttempt, 'quizId' | 'date'>
    ): ProgressUpdateSummary;
    /** Crée une nouvelle progression utilisateur LSF */
    createNewUserProgress(userId: string): LearningProgress;
    /** Calcule le niveau pour une expérience donnée */
    calculateLevel(totalExperience: number): number;
    /** Calcule l'expérience requise pour un niveau */
    calculateExperienceForLevel(targetLevel: number): number;
    /** Obtient des statistiques de progression détaillées */
    getProgressStatistics(userProgress: LearningProgress): ProgressStatistics;
}

/**
 * Interface pour les observateurs de services LSF
 */
export interface IServiceObserver<T = unknown> {
    /** Notifie l'observateur d'un événement LSF */
    notify(event: string, data: T): Promise<void>;
    /** Type d'événements LSF auxquels l'observateur s'intéresse */
    getInterestedEvents(): readonly string[];
    /** Identifiant unique de l'observateur */
    getId(): string;
}

/**
 * Interface pour les services observables LSF
 */
export interface IObservableService {
    /** Ajoute un observateur */
    addObserver(observer: IServiceObserver): Promise<void>;
    /** Supprime un observateur */
    removeObserver(observerId: string): Promise<boolean>;
    /** Notifie tous les observateurs */
    notifyObservers(event: string, data: unknown): Promise<void>;
    /** Liste les observateurs actifs */
    getActiveObservers(): readonly string[];
}

/**
 * Cache pour les services d'apprentissage LSF
 */
export interface ILearningServiceCache<T = unknown> {
    /** Récupère une valeur du cache */
    get(key: string): Promise<T | undefined>;
    /** Stocke une valeur dans le cache */
    set(key: string, value: T, ttl?: number): Promise<void>;
    /** Supprime une valeur du cache */
    delete(key: string): Promise<boolean>;
    /** Vide le cache */
    clear(): Promise<void>;
    /** Vérifie si une clé existe */
    has(key: string): Promise<boolean>;
    /** Statistiques du cache */
    getStats(): Promise<CacheStats>;
}

/**
 * Statistiques du cache
 */
export interface CacheStats {
    /** Nombre de hits */
    readonly hits: number;
    /** Nombre de misses */
    readonly misses: number;
    /** Taux de hit */
    readonly hitRate: number;
    /** Taille actuelle */
    readonly size: number;
    /** Mémoire utilisée */
    readonly memoryUsage: number;
}

/**
 * Filtres de recherche spécialisés LSF
 */
export interface LSFSearchFilters {
    /** Catégorie de module LSF (optionnel) */
    readonly category?: ModuleCategory;
    /** Niveau de difficulté (optionnel) */
    readonly difficulty?: number | { readonly min: number; readonly max: number };
    /** Compétences LSF requises (optionnel) */
    readonly skills?: readonly string[];
    /** Statut du contenu (optionnel) */
    readonly status?: 'locked' | 'available' | 'in_progress' | 'completed' | 'mastered';
    /** Type de contenu (optionnel) */
    readonly contentType?: 'module' | 'exercise' | 'quiz' | 'resource';
    /** Durée estimée (optionnel) */
    readonly duration?: { readonly min: number; readonly max: number };
}

/**
 * Options de recherche LSF
 */
export interface LSFSearchOptions {
    /** Recherche floue activée (optionnel) */
    readonly fuzzy?: boolean;
    /** Nombre maximum de résultats (optionnel) */
    readonly maxResults?: number;
    /** Critère de tri (optionnel) */
    readonly sortBy?: 'relevance' | 'difficulty' | 'popularity' | 'recent' | 'alphabetical';
    /** Ordre de tri (optionnel) */
    readonly sortOrder?: 'asc' | 'desc';
    /** Inclure les synonymes LSF (optionnel) */
    readonly includeSynonyms?: boolean;
    /** Recherche par paramètres de signe (optionnel) */
    readonly signParameters?: {
        /** Configuration manuelle (optionnel) */
        readonly handshape?: string;
        /** Lieu d'articulation (optionnel) */
        readonly location?: string;
        /** Type de mouvement (optionnel) */
        readonly movement?: string;
    };
}

/**
 * Interface pour les services avec support de recherche LSF
 */
export interface ISearchableService<T> {
    /** Recherche avec critères spécialisés LSF */
    search(
        query: string,
        filters?: LSFSearchFilters,
        options?: LSFSearchOptions
    ): Promise<readonly T[]>;
}

/**
 * Interface pour les services avec support de pagination
 */
export interface IPaginatedService<T> {
    /** Récupère une page de résultats */
    getPage(
        page: number,
        pageSize: number,
        filters?: Readonly<Record<string, unknown>>
    ): Promise<PaginatedResult<T>>;
}

/**
 * Résultat paginé
 */
export interface PaginatedResult<T> {
    /** Éléments de la page */
    readonly items: readonly T[];
    /** Nombre total d'éléments */
    readonly totalCount: number;
    /** Numéro de page actuel */
    readonly page: number;
    /** Taille de page */
    readonly pageSize: number;
    /** Nombre total de pages */
    readonly totalPages: number;
    /** Y a-t-il une page suivante */
    readonly hasNext: boolean;
    /** Y a-t-il une page précédente */
    readonly hasPrevious: boolean;
}

/**
 * Interface pour le dépôt de contenu LSF
 */
export interface ILSFContentRepository {
    /** Recherche de contenu par critères */
    searchContent(criteria: LSFSearchFilters): Promise<readonly LSFContentMetadata[]>;
    /** Récupère le contenu par ID */
    getContent(contentId: string): Promise<unknown>;
    /** Ajoute nouveau contenu */
    addContent(content: unknown, metadata: LSFContentMetadata): Promise<string>;
    /** Met à jour le contenu existant */
    updateContent(contentId: string, updates: Partial<unknown>): Promise<boolean>;
    /** Supprime le contenu */
    deleteContent(contentId: string): Promise<boolean>;
    /** Valide la qualité du contenu */
    validateContent(contentId: string): Promise<LSFQualityAssurance>;
}

/**
 * Résultat d'opération asynchrone pour les services LSF
 */
export interface ServiceOperationResult<T = unknown> {
    /** Opération réussie ou non */
    readonly success: boolean;
    /** Données résultantes (optionnel) */
    readonly data?: T;
    /** Message d'erreur (optionnel) */
    readonly error?: string;
    /** Code d'erreur (optionnel) */
    readonly errorCode?: string;
    /** Métadonnées supplémentaires (optionnel) */
    readonly metadata?: Readonly<Record<string, unknown>>;
    /** Durée de l'opération (ms) (optionnel) */
    readonly duration?: number;
    /** Contexte LSF de l'opération (optionnel) */
    readonly lsfContext?: {
        /** Module concerné (optionnel) */
        readonly moduleId?: string;
        /** Compétence LSF impliquée (optionnel) */
        readonly skill?: string;
        /** Niveau de difficulté (optionnel) */
        readonly difficulty?: number;
    };
}

/**
 * Résultat de validation pour les services LSF
 */
export interface ServiceValidationResult {
    /** Service valide ou non */
    readonly isValid: boolean;
    /** Erreurs de validation */
    readonly errors: readonly string[];
    /** Avertissements */
    readonly warnings: readonly string[];
    /** Suggestions d'amélioration LSF */
    readonly suggestions: readonly string[];
    /** Score de qualité (0-100) (optionnel) */
    readonly qualityScore?: number;
}

/**
 * État de performance d'un service LSF
 */
export interface ServicePerformanceState {
    /** Nom du service */
    readonly serviceName: string;
    /** Temps de réponse moyen (ms) */
    readonly averageResponseTime: number;
    /** Nombre d'opérations par seconde */
    readonly operationsPerSecond: number;
    /** Taux d'erreur (%) */
    readonly errorRate: number;
    /** Utilisation mémoire (MB) */
    readonly memoryUsage: number;
    /** Utilisation CPU (%) */
    readonly cpuUsage: number;
    /** Timestamp de la dernière mesure */
    readonly lastMeasured: Date;
    /** Métriques spécifiques LSF (optionnel) */
    readonly lsfMetrics?: {
        /** Modules traités par minute */
        readonly modulesProcessedPerMinute: number;
        /** Temps moyen de traitement vidéo */
        readonly videoProcessingTime: number;
        /** Cache hit rate pour les signes */
        readonly signCacheHitRate: number;
    };
}

/**
 * Configuration de cache pour les services LSF
 */
export interface CacheConfiguration {
    /** TTL par défaut (secondes) */
    readonly defaultTTL: number;
    /** Taille maximale du cache */
    readonly maxSize: number;
    /** Stratégie d'éviction */
    readonly evictionPolicy: 'LRU' | 'LFU' | 'TTL' | 'FIFO';
    /** Activer les statistiques */
    readonly enableStats: boolean;
    /** Préfixe pour les clés LSF (optionnel) */
    readonly keyPrefix?: string;
    /** Cache distribué activé (optionnel) */
    readonly enableDistributed?: boolean;
}

/**
 * Interface générique de service
 */
export interface ServiceInterface {
    /** Nom du service */
    readonly serviceName: string;
    /** Version du service */
    readonly version: string;
    /** Initialise le service */
    initialize(): Promise<void>;
    /** Arrête le service */
    shutdown(): Promise<void>;
    /** Vérifie la santé du service */
    getHealth(): Promise<{ readonly status: string; readonly details?: unknown }>;
}

/**
 * Interface de service d'apprentissage
 */
export interface LearningServiceInterface extends ServiceInterface {
    /** Traite une session d'apprentissage */
    processLearningSession(sessionData: unknown): Promise<unknown>;
    /** Récupère les métriques d'apprentissage */
    getLearningMetrics(userId: string): Promise<unknown>;
}

/**
 * Interface de service de métriques
 */
export interface MetricsServiceInterface extends ServiceInterface {
    /** Collecte des métriques */
    collectMetrics(data: unknown): Promise<void>;
    /** Récupère les métriques */
    getMetrics(query: unknown): Promise<unknown>;
}

/**
 * Interface de service d'analytics
 */
export interface AnalyticsServiceInterface extends ServiceInterface {
    /** Analyse des données */
    analyzeData(data: unknown): Promise<unknown>;
    /** Génère des rapports */
    generateReport(criteria: unknown): Promise<unknown>;
}

/**
 * Interface de service de personnalisation
 */
export interface PersonalizationServiceInterface extends ServiceInterface {
    /** Personnalise le contenu */
    personalizeContent(userId: string, content: unknown): Promise<unknown>;
    /** Met à jour le profil utilisateur */
    updateUserProfile(userId: string, profile: unknown): Promise<void>;
}

/**
 * Interface de service d'adaptation
 */
export interface AdaptationServiceInterface extends ServiceInterface {
    /** Adapte le contenu */
    adaptContent(criteria: unknown): Promise<unknown>;
    /** Évalue la performance */
    assessPerformance(data: unknown): Promise<unknown>;
}

/**
 * Interface de service de recommandation
 */
export interface RecommendationServiceInterface extends ServiceInterface {
    /** Génère des recommandations */
    generateRecommendations(userId: string, context: unknown): Promise<readonly unknown[]>;
    /** Met à jour les modèles de recommandation */
    updateRecommendationModel(data: unknown): Promise<void>;
}