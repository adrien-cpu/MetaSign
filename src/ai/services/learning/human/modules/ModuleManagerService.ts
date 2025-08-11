/**
 * Service de gestion des modules d'apprentissage MetaSign
 * 
 * @file src/ai/services/learning/human/modules/ModuleManagerService.ts
 * @description Service complet de gestion des modules d'apprentissage avec fonctionnalités 
 * de filtrage, validation des prérequis et recommandations personnalisées.
 * @version 1.3.0
 * @author MetaSign Learning Module
 * @since 1.0.0
 */

import type {
    LearningModule,
    LearningProgress,
    ModuleFilterCriteria,
    DefaultModuleConfig
} from '@/ai/services/learning/types/LearningExtensions';
import { MetricsCollector } from '@/ai/services/learning/registry/utils/MetricsCollector';
import { LearningLogger } from '@/ai/services/learning/utils/logger';

/**
 * @interface ExtendedLearningModule
 * @description Module d'apprentissage avec propriétés étendues
 */
interface ExtendedLearningModule extends LearningModule {
    readonly version?: number;
    readonly lastModified?: Date;
    readonly updatedBy?: string;
    readonly createdBy?: string;
    readonly tags?: ReadonlyArray<string>;
}

/**
 * @interface ExtendedDefaultModuleConfig
 * @description Configuration étendue pour les modules par défaut
 */
interface ExtendedDefaultModuleConfig extends DefaultModuleConfig {
    readonly maxRecommendations?: number;
    readonly enableAnalytics?: boolean;
    readonly enableCaching?: boolean;
    readonly cacheMaxSize?: number;
}

/**
 * @interface ModuleManagerMetrics
 * @description Métriques internes du gestionnaire de modules
 */
interface ModuleManagerMetrics {
    readonly totalModulesCreated: number;
    readonly totalModulesUpdated: number;
    readonly totalModulesRemoved: number;
    readonly totalOperations: number;
    readonly lastActivityTimestamp: Date;
    readonly averageResponseTime: number;
}

/**
 * @interface ModuleValidationResult
 * @description Résultat de validation d'un module
 */
interface ModuleValidationResult {
    readonly isValid: boolean;
    readonly errors: ReadonlyArray<string>;
    readonly warnings: ReadonlyArray<string>;
}

/**
 * @interface ModuleSearchOptions
 * @description Options pour la recherche de modules
 */
interface ModuleSearchOptions {
    readonly includeDescription?: boolean;
    readonly includeSkills?: boolean;
    readonly caseSensitive?: boolean;
    readonly maxResults?: number;
}

/**
 * Utilitaire pour le suivi des performances
 */
class PerformanceTracker {
    static track<T>(methodName: string, fn: () => T): T {
        const startTime = performance.now();
        const result = fn();
        const endTime = performance.now();

        LearningLogger.debug(`Performance: ${methodName} executed in ${endTime - startTime}ms`);
        return result;
    }

    static async trackAsync<T>(methodName: string, fn: () => Promise<T>): Promise<T> {
        const startTime = performance.now();
        const result = await fn();
        const endTime = performance.now();

        LearningLogger.debug(`Performance: ${methodName} executed in ${endTime - startTime}ms`);
        return result;
    }
}

/**
 * @class ModuleManagerService
 * @description Service complet de gestion des modules d'apprentissage.
 * Gère la création, récupération, filtrage, validation des prérequis et recommandations.
 */
export class ModuleManagerService {
    private readonly moduleMap: Map<string, ExtendedLearningModule> = new Map();
    private readonly metricsCollector: MetricsCollector;
    private readonly config: Required<ExtendedDefaultModuleConfig>;
    private readonly moduleAccessCount: Map<string, number> = new Map();

    // Métriques internes
    private metrics: ModuleManagerMetrics;

    /**
     * @constructor
     * @param {MetricsCollector} metricsCollector - Collecteur de métriques
     * @param {Partial<ExtendedDefaultModuleConfig>} [config] - Configuration
     */
    constructor(
        metricsCollector: MetricsCollector,
        config: Partial<ExtendedDefaultModuleConfig> = {}
    ) {
        this.metricsCollector = metricsCollector;
        this.config = this.buildConfig(config);

        // Initialisation des métriques
        this.metrics = {
            totalModulesCreated: 0,
            totalModulesUpdated: 0,
            totalModulesRemoved: 0,
            totalOperations: 0,
            lastActivityTimestamp: new Date(),
            averageResponseTime: 0
        };

        this.logInitialization();
        this.initializeDefaultModules();
    }

    /**
     * @method setModule
     * @param {LearningModule} learningModule - Module à ajouter/mettre à jour
     * @throws {Error} Si le module est invalide
     * @description Ajoute ou met à jour un module avec validation complète
     */
    public setModule(learningModule: LearningModule): void {
        PerformanceTracker.track('setModule', () => {
            const startTime = performance.now();

            try {
                // Validation du module
                const validationResult = this.validateModule(learningModule);
                if (!validationResult.isValid) {
                    throw new Error(`Module invalide: ${validationResult.errors.join(', ')}`);
                }

                // Préparation du module
                const isUpdate = this.moduleMap.has(learningModule.id);
                const moduleToStore = this.prepareModuleForStorage(learningModule, isUpdate);

                // Stockage
                this.moduleMap.set(learningModule.id, Object.freeze(moduleToStore));

                // Mise à jour des métriques et logging
                this.updateMetricsForSetModule(isUpdate, startTime);
                this.logModuleOperation(isUpdate ? 'updated' : 'created', moduleToStore);

            } catch (error) {
                this.handleError('setModule', error, { moduleId: learningModule.id });
                throw error;
            }
        });
    }

    /**
     * @method getModule
     * @param {string} moduleId - Identifiant du module
     * @returns {LearningModule | undefined} Module ou undefined
     * @description Récupère un module par son identifiant
     */
    public getModule(moduleId: string): LearningModule | undefined {
        if (!this.validateModuleId(moduleId)) {
            return undefined;
        }

        const learningModule = this.moduleMap.get(moduleId);

        if (learningModule) {
            this.recordAccess(moduleId);
            this.metricsCollector.recordEvent('module_accessed', { moduleId });
            return { ...learningModule };
        }

        return undefined;
    }

    /**
     * @method getAllModules
     * @returns {LearningModule[]} Tous les modules
     * @description Récupère tous les modules du système
     */
    public getAllModules(): LearningModule[] {
        return Array.from(this.moduleMap.values()).map(learningModule => ({ ...learningModule }));
    }

    /**
     * @method getFilteredModules
     * @param {ModuleFilterCriteria} criteria - Critères de filtrage
     * @returns {LearningModule[]} Modules filtrés
     * @description Filtre les modules selon les critères
     */
    public getFilteredModules(criteria: ModuleFilterCriteria): LearningModule[] {
        return PerformanceTracker.track('getFilteredModules', () => {
            try {
                this.validateFilterCriteria(criteria);
                const modules = this.getAllModules();
                const filtered = this.filterModules(modules, criteria);

                this.metricsCollector.recordEvent('modules_filtered', {
                    totalModules: modules.length,
                    filteredCount: filtered.length
                });

                return filtered;
            } catch (error) {
                this.handleError('getFilteredModules', error, { criteria });
                return [];
            }
        });
    }

    /**
     * @method searchModules
     * @param {string} query - Requête de recherche
     * @param {ModuleSearchOptions} [options] - Options de recherche
     * @returns {LearningModule[]} Modules correspondants
     * @description Recherche textuelle dans les modules
     */
    public searchModules(query: string, options: ModuleSearchOptions = {}): LearningModule[] {
        if (!query?.trim()) {
            return [];
        }

        const modules = this.getAllModules();
        return this.searchInModules(modules, query, options);
    }

    /**
     * @method isModuleUnlocked
     * @param {string} moduleId - Identifiant du module
     * @param {LearningProgress} userProgress - Progression utilisateur
     * @returns {boolean} true si déverrouillé
     * @description Vérifie si un module est accessible
     */
    public isModuleUnlocked(moduleId: string, userProgress: LearningProgress): boolean {
        const learningModule = this.getModule(moduleId);
        if (!learningModule || !this.validateUserProgress(userProgress)) {
            return false;
        }

        return this.checkPrerequisites(learningModule, userProgress);
    }

    /**
     * @method getUnlockedModules
     * @param {LearningProgress} userProgress - Progression utilisateur
     * @returns {LearningModule[]} Modules déverrouillés
     * @description Récupère tous les modules accessibles
     */
    public getUnlockedModules(userProgress: LearningProgress): LearningModule[] {
        if (!this.validateUserProgress(userProgress)) {
            return [];
        }

        return this.getAllModules().filter(learningModule =>
            this.isModuleUnlocked(learningModule.id, userProgress)
        );
    }

    /**
     * @method getRecommendedModules
     * @param {LearningProgress} userProgress - Progression utilisateur
     * @param {number} [count=3] - Nombre de recommandations
     * @returns {LearningModule[]} Modules recommandés
     * @description Génère des recommandations personnalisées
     */
    public getRecommendedModules(userProgress: LearningProgress, count = 3): LearningModule[] {
        return PerformanceTracker.track('getRecommendedModules', () => {
            if (!this.validateUserProgress(userProgress)) {
                return [];
            }

            const unlockedModules = this.getUnlockedModules(userProgress);
            const availableModules = unlockedModules.filter(learningModule =>
                !userProgress.completedModules.includes(learningModule.id)
            );

            return this.generateRecommendations(
                availableModules,
                userProgress,
                Math.min(count, this.config.maxRecommendations)
            );
        });
    }

    /**
     * @method removeModule
     * @param {string} moduleId - Identifiant du module
     * @returns {boolean} true si supprimé
     * @description Supprime un module du système
     */
    public removeModule(moduleId: string): boolean {
        if (!this.validateModuleId(moduleId) || !this.moduleMap.has(moduleId)) {
            return false;
        }

        // Vérification des dépendances
        const dependents = this.findDependentModules(moduleId);
        if (dependents.length > 0) {
            LearningLogger.warn('Module avec dépendances supprimé', {
                moduleId,
                dependentCount: dependents.length
            });
        }

        this.moduleMap.delete(moduleId);
        this.recordRemoval(moduleId);
        this.updateMetricsForRemoval();

        this.metricsCollector.recordEvent('module_removed', { moduleId });
        LearningLogger.info('Module supprimé', { moduleId });

        return true;
    }

    /**
     * @method getModuleStatistics
     * @returns {object} Statistiques complètes
     * @description Obtient les statistiques détaillées
     */
    public getModuleStatistics(): {
        readonly totalModules: number;
        readonly modulesByCategory: Record<string, number>;
        readonly modulesByDifficulty: Record<number, number>;
        readonly modulesByStatus: Record<string, number>;
        readonly metrics: ModuleManagerMetrics;
        readonly analytics: object;
    } {
        const modules = this.getAllModules();
        const basicStats = this.calculateBasicStatistics(modules);
        const analytics = this.generateAnalytics(modules);

        return {
            totalModules: modules.length,
            modulesByCategory: (basicStats as { modulesByCategory: Record<string, number> }).modulesByCategory,
            modulesByDifficulty: (basicStats as { modulesByDifficulty: Record<number, number> }).modulesByDifficulty,
            modulesByStatus: (basicStats as { modulesByStatus: Record<string, number> }).modulesByStatus,
            metrics: { ...this.metrics },
            analytics
        };
    }

    /**
     * @method getServiceInfo
     * @returns {{name: string, version: string, features: string[]}} Informations du service
     * @description Retourne les informations du service
     */
    public getServiceInfo(): { name: string; version: string; features: string[] } {
        return {
            name: 'ModuleManagerService',
            version: '1.3.0',
            features: [
                'module_management',
                'prerequisite_validation',
                'smart_recommendations',
                'advanced_filtering',
                'text_search',
                'analytics_tracking',
                'performance_monitoring',
                'dependency_analysis'
            ]
        };
    }

    // Méthodes privées

    /**
     * @method buildConfig
     * @private
     * @param {Partial<ExtendedDefaultModuleConfig>} userConfig - Configuration utilisateur
     * @returns {Required<ExtendedDefaultModuleConfig>} Configuration complète
     */
    private buildConfig(userConfig: Partial<ExtendedDefaultModuleConfig>): Required<ExtendedDefaultModuleConfig> {
        return Object.freeze({
            enableDefaultModules: userConfig.enableDefaultModules ?? true,
            defaultLanguage: userConfig.defaultLanguage ?? 'fr',
            startingDifficulty: userConfig.startingDifficulty ?? 1,
            maxRecommendations: userConfig.maxRecommendations ?? 5,
            enableAnalytics: userConfig.enableAnalytics ?? true,
            enableCaching: userConfig.enableCaching ?? true,
            cacheMaxSize: userConfig.cacheMaxSize ?? 1000
        });
    }

    /**
     * @method validateModule
     * @private
     * @param {LearningModule} learningModule - Module à valider
     * @returns {ModuleValidationResult} Résultat de validation
     */
    private validateModule(learningModule: LearningModule): ModuleValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!learningModule.id?.trim()) {
            errors.push('Un module doit avoir un identifiant unique non vide');
        }

        if (!learningModule.title?.trim()) {
            errors.push('Un module doit avoir un titre non vide');
        }

        if (typeof learningModule.difficulty !== 'number' ||
            learningModule.difficulty < 1 ||
            learningModule.difficulty > 10) {
            errors.push('La difficulté doit être comprise entre 1 et 10');
        }

        if (typeof learningModule.estimatedTime !== 'number' || learningModule.estimatedTime < 0) {
            errors.push('Le temps estimé ne peut pas être négatif');
        }

        if (learningModule.prerequisites && this.hasCircularDependency(learningModule.id, learningModule.prerequisites)) {
            errors.push('Dépendance circulaire détectée dans les prérequis');
        }

        if (learningModule.skills && learningModule.skills.length === 0) {
            warnings.push('Module sans compétences définies');
        }

        return {
            isValid: errors.length === 0,
            errors: Object.freeze(errors),
            warnings: Object.freeze(warnings)
        };
    }

    /**
     * @method prepareModuleForStorage
     * @private
     * @param {LearningModule} learningModule - Module source
     * @param {boolean} isUpdate - Indique si c'est une mise à jour
     * @returns {ExtendedLearningModule} Module préparé
     */
    private prepareModuleForStorage(learningModule: LearningModule, isUpdate: boolean): ExtendedLearningModule {
        const existingModule = this.moduleMap.get(learningModule.id);

        return {
            ...learningModule,
            lastModified: new Date(),
            version: isUpdate ? ((existingModule?.version ?? 0) + 1) : 1,
            updatedBy: 'system'
        };
    }

    /**
     * @method validateModuleId
     * @private
     * @param {string} moduleId - ID à valider
     * @returns {boolean} true si valide
     */
    private validateModuleId(moduleId: string): boolean {
        return typeof moduleId === 'string' && moduleId.trim().length > 0;
    }

    /**
     * @method validateUserProgress
     * @private
     * @param {LearningProgress} userProgress - Progression à valider
     * @returns {boolean} true si valide
     */
    private validateUserProgress(userProgress: LearningProgress): boolean {
        return userProgress &&
            typeof userProgress.userId === 'string' &&
            userProgress.userId.trim().length > 0 &&
            Array.isArray(userProgress.completedModules) &&
            typeof userProgress.level === 'number' &&
            userProgress.level >= 0;
    }

    /**
     * @method validateFilterCriteria
     * @private
     * @param {ModuleFilterCriteria} criteria - Critères à valider
     * @throws {Error} Si invalides
     */
    private validateFilterCriteria(criteria: ModuleFilterCriteria): void {
        if (!criteria || typeof criteria !== 'object') {
            throw new Error('Les critères de filtrage doivent être un objet valide');
        }

        if (criteria.difficulty !== undefined &&
            (typeof criteria.difficulty !== 'number' || criteria.difficulty < 1 || criteria.difficulty > 10)) {
            throw new Error('La difficulté doit être comprise entre 1 et 10');
        }
    }

    /**
     * @method checkPrerequisites
     * @private
     * @param {LearningModule} learningModule - Module à vérifier
     * @param {LearningProgress} userProgress - Progression utilisateur
     * @returns {boolean} true si les prérequis sont remplis
     */
    private checkPrerequisites(learningModule: LearningModule, userProgress: LearningProgress): boolean {
        if (!learningModule.prerequisites || learningModule.prerequisites.length === 0) {
            return true;
        }

        return learningModule.prerequisites.every((prereqId: string) =>
            userProgress.completedModules.includes(prereqId)
        );
    }

    /**
     * @method filterModules
     * @private
     * @param {LearningModule[]} modules - Modules à filtrer
     * @param {ModuleFilterCriteria} criteria - Critères de filtrage
     * @returns {LearningModule[]} Modules filtrés
     */
    private filterModules(modules: LearningModule[], criteria: ModuleFilterCriteria): LearningModule[] {
        return modules.filter(learningModule => {
            if (criteria.category && learningModule.category !== criteria.category) return false;
            if (criteria.difficulty !== undefined && learningModule.difficulty !== criteria.difficulty) return false;
            if (criteria.status && learningModule.status !== criteria.status) return false;
            if (criteria.maxEstimatedTime !== undefined && learningModule.estimatedTime > criteria.maxEstimatedTime) return false;

            if (criteria.requiredSkills?.length) {
                const hasAllSkills = criteria.requiredSkills.every(skill => learningModule.skills.includes(skill));
                if (!hasAllSkills) return false;
            }

            return true;
        });
    }

    /**
     * @method searchInModules
     * @private
     * @param {LearningModule[]} modules - Modules à rechercher
     * @param {string} query - Requête de recherche
     * @param {ModuleSearchOptions} options - Options de recherche
     * @returns {LearningModule[]} Modules correspondants
     */
    private searchInModules(modules: LearningModule[], query: string, options: ModuleSearchOptions): LearningModule[] {
        const {
            includeDescription = true,
            includeSkills = true,
            caseSensitive = false,
            maxResults = 10
        } = options;

        const searchTerm = caseSensitive ? query : query.toLowerCase();

        const matchingModules = modules.filter(learningModule => {
            const title = caseSensitive ? learningModule.title : learningModule.title.toLowerCase();
            if (title.includes(searchTerm)) return true;

            if (includeDescription && learningModule.description) {
                const description = caseSensitive ? learningModule.description : learningModule.description.toLowerCase();
                if (description.includes(searchTerm)) return true;
            }

            if (includeSkills && learningModule.skills) {
                const skillsText = caseSensitive
                    ? learningModule.skills.join(' ')
                    : learningModule.skills.join(' ').toLowerCase();
                if (skillsText.includes(searchTerm)) return true;
            }

            return false;
        });

        return matchingModules.slice(0, maxResults);
    }

    /**
     * @method generateRecommendations
     * @private
     * @param {LearningModule[]} availableModules - Modules disponibles
     * @param {LearningProgress} userProgress - Progression utilisateur
     * @param {number} count - Nombre de recommandations
     * @returns {LearningModule[]} Modules recommandés
     */
    private generateRecommendations(
        availableModules: LearningModule[],
        userProgress: LearningProgress,
        count: number
    ): LearningModule[] {
        if (availableModules.length === 0) {
            return [];
        }

        const sortedModules = availableModules
            .map(learningModule => ({
                module: learningModule,
                score: this.calculateRelevanceScore(learningModule, userProgress)
            }))
            .sort((a, b) => a.score - b.score)
            .map(item => item.module);

        return sortedModules.slice(0, count);
    }

    /**
     * @method calculateRelevanceScore
     * @private
     * @param {LearningModule} learningModule - Module à évaluer
     * @param {LearningProgress} userProgress - Progression utilisateur
     * @returns {number} Score de pertinence
     */
    private calculateRelevanceScore(learningModule: LearningModule, userProgress: LearningProgress): number {
        let score = 0;

        if (learningModule.id === userProgress.currentModule) score -= 1000;

        const difficultyDifference = Math.abs(learningModule.difficulty - userProgress.level);
        score += difficultyDifference * 10;

        const moduleProgress = userProgress.moduleProgress?.[learningModule.id];
        if (moduleProgress && moduleProgress > 0) score -= 50;

        if (userProgress.timeSpent < 60) score += learningModule.estimatedTime * 0.5;

        const accessCount = this.moduleAccessCount.get(learningModule.id) ?? 0;
        if (accessCount > 10) score -= 5;

        return score;
    }

    /**
     * @method initializeDefaultModules
     * @private
     * @description Initialise les modules par défaut
     */
    private initializeDefaultModules(): void {
        if (!this.config.enableDefaultModules) {
            return;
        }

        const defaultModules = this.getDefaultModules();
        let successCount = 0;

        defaultModules.forEach(learningModule => {
            try {
                this.setModule(learningModule);
                successCount++;
            } catch (error) {
                LearningLogger.error('Erreur initialisation module par défaut', {
                    moduleId: learningModule.id,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        LearningLogger.info('Modules par défaut initialisés', {
            total: defaultModules.length,
            success: successCount,
            failed: defaultModules.length - successCount
        });
    }

    /**
     * @method getDefaultModules
     * @private
     * @returns {LearningModule[]} Modules par défaut
     */
    private getDefaultModules(): LearningModule[] {
        return [
            {
                id: 'lsf-basics',
                title: 'Bases de la Langue des Signes Française',
                description: 'Introduction aux concepts fondamentaux de la LSF',
                category: 'Débutant',
                difficulty: 1,
                prerequisites: [],
                status: 'available',
                progress: 0,
                estimatedTime: 60,
                skills: ['Alphabet', 'Salutations', 'Expressions de base'],
                content: {
                    sections: [],
                    quizzes: [],
                    exercises: [],
                    resources: []
                }
            },
            {
                id: 'lsf-grammar',
                title: 'Grammaire de la LSF',
                description: 'Apprentissage des règles grammaticales spécifiques à la LSF',
                category: 'Intermédiaire',
                difficulty: 3,
                prerequisites: ['lsf-basics'],
                status: 'available',
                progress: 0,
                estimatedTime: 120,
                skills: ['Syntaxe spatiale', 'Expressions non-manuelles', 'Temps et aspects'],
                content: {
                    sections: [],
                    quizzes: [],
                    exercises: [],
                    resources: []
                }
            }
        ];
    }

    // Méthodes utilitaires privées

    private hasCircularDependency(moduleId: string, prerequisites: string[], visited: Set<string> = new Set()): boolean {
        if (visited.has(moduleId)) return true;
        visited.add(moduleId);

        for (const prereqId of prerequisites) {
            const prereqModule = this.moduleMap.get(prereqId);
            if (prereqModule?.prerequisites &&
                this.hasCircularDependency(prereqId, prereqModule.prerequisites, new Set(visited))) {
                return true;
            }
        }
        return false;
    }

    private findDependentModules(moduleId: string): LearningModule[] {
        return this.getAllModules().filter(learningModule =>
            learningModule.prerequisites?.includes(moduleId)
        );
    }

    private recordAccess(moduleId: string): void {
        const currentCount = this.moduleAccessCount.get(moduleId) ?? 0;
        this.moduleAccessCount.set(moduleId, currentCount + 1);
    }

    private recordRemoval(moduleId: string): void {
        this.moduleAccessCount.delete(moduleId);
    }

    private calculateBasicStatistics(modules: LearningModule[]): {
        totalModules: number;
        modulesByCategory: Record<string, number>;
        modulesByDifficulty: Record<number, number>;
        modulesByStatus: Record<string, number>;
        averageEstimatedTime: number;
    } {
        return {
            totalModules: modules.length,
            modulesByCategory: this.groupBy(modules, 'category'),
            modulesByDifficulty: this.groupBy(modules, 'difficulty') as Record<number, number>,
            modulesByStatus: this.groupBy(modules, 'status'),
            averageEstimatedTime: this.calculateAverageTime(modules)
        };
    }

    private generateAnalytics(modules: LearningModule[]): object {
        const popularModules = Array.from(this.moduleAccessCount.entries())
            .map(([moduleId, accessCount]) => ({ moduleId, accessCount }))
            .sort((a, b) => b.accessCount - a.accessCount)
            .slice(0, 5);

        return {
            popularModules,
            totalAccesses: Array.from(this.moduleAccessCount.values()).reduce((sum, count) => sum + count, 0),
            difficultyDistribution: this.groupBy(modules, 'difficulty'),
            categoryPopularity: this.groupBy(modules, 'category')
        };
    }

    private groupBy(modules: LearningModule[], property: keyof LearningModule): Record<string, number> {
        return modules.reduce((acc, learningModule) => {
            const key = String(learningModule[property]);
            acc[key] = (acc[key] ?? 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }

    private calculateAverageTime(modules: LearningModule[]): number {
        if (modules.length === 0) return 0;
        const totalTime = modules.reduce((sum, learningModule) => sum + learningModule.estimatedTime, 0);
        return Math.round(totalTime / modules.length);
    }

    private updateMetricsForSetModule(isUpdate: boolean, startTime: number): void {
        const responseTime = performance.now() - startTime;

        this.metrics = {
            ...this.metrics,
            totalModulesCreated: this.metrics.totalModulesCreated + (isUpdate ? 0 : 1),
            totalModulesUpdated: this.metrics.totalModulesUpdated + (isUpdate ? 1 : 0),
            totalOperations: this.metrics.totalOperations + 1,
            lastActivityTimestamp: new Date(),
            averageResponseTime: (this.metrics.averageResponseTime + responseTime) / 2
        };
    }

    private updateMetricsForRemoval(): void {
        this.metrics = {
            ...this.metrics,
            totalModulesRemoved: this.metrics.totalModulesRemoved + 1,
            totalOperations: this.metrics.totalOperations + 1,
            lastActivityTimestamp: new Date()
        };
    }

    private logModuleOperation(operation: string, learningModule: ExtendedLearningModule): void {
        LearningLogger.debug(`Module ${operation}`, {
            moduleId: learningModule.id,
            title: learningModule.title,
            version: learningModule.version,
            category: learningModule.category
        });

        this.metricsCollector.recordEvent(`module_${operation}`, {
            moduleId: learningModule.id,
            category: learningModule.category,
            difficulty: learningModule.difficulty,
            version: learningModule.version
        });
    }

    private logInitialization(): void {
        LearningLogger.info('ModuleManagerService initialisé', {
            config: this.config,
            serviceVersion: '1.3.0',
            featuresCount: this.getServiceInfo().features.length
        });
    }

    private handleError(operation: string, error: unknown, context: object): void {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        LearningLogger.error(`Erreur dans ${operation}`, {
            error: errorMessage,
            context
        });

        this.metricsCollector.recordEvent('module_manager_error', {
            operation,
            error: errorMessage,
            context
        });
    }
}