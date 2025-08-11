/**
 * Service de données pour les concepts LSF avec implémentation complète
 * @file src/ai/services/learning/human/coda/codavirtuel/exercises/services/ConceptsDataService.ts
 * @description Gère les données des concepts LSF pour les exercices de Coda Virtuel avec cache et données de test
 * @module ConceptsDataService
 * @version 2.0.0
 * @since 2024
 * @lastModified 2025-05-27
 * @author MetaSign Team
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { LearningServiceRegistry } from '@/ai/services/learning/registry/LearningServiceRegistry';
import { BaseService } from '@/ai/services/learning/registry/interfaces/ServiceDescription';

/**
 * Interface représentant un concept LSF avec toutes ses propriétés
 */
export interface LSFConcept {
    /** Identifiant unique du concept */
    readonly id: string;
    /** Texte ou mot représenté par le concept */
    readonly text: string;
    /** URL de la vidéo montrant le signe */
    readonly videoUrl?: string;
    /** URL de l'image illustrant le signe */
    readonly imageUrl?: string;
    /** Niveau CECRL (A1, A2, B1, B2, C1, C2) */
    readonly level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    /** Catégories auxquelles appartient le concept */
    readonly categories: readonly string[];
    /** Concepts liés ou similaires */
    readonly relatedConcepts: readonly string[];
    /** Difficulté du concept (0-1) */
    readonly difficulty: number;
    /** Date de création */
    readonly createdAt: Date;
    /** Dernière modification */
    readonly updatedAt: Date;
    /** Fréquence d'utilisation */
    readonly frequency: number;
}

/**
 * Interface représentant les détails supplémentaires d'un concept
 */
export interface LSFConceptDetails {
    /** Identifiant unique du concept */
    readonly id: string;
    /** Explication détaillée du concept */
    readonly explanation?: string;
    /** Exemples d'utilisation */
    readonly examples: readonly string[];
    /** Variantes régionales ou culturelles */
    readonly variants: Readonly<Record<string, string>>;
    /** Historique du signe */
    readonly history?: string;
    /** Éléments grammaticaux associés */
    readonly grammar: Readonly<Record<string, string>>;
    /** Contextes d'utilisation */
    readonly contexts: readonly string[];
    /** Synonymes ou signes similaires */
    readonly synonyms: readonly string[];
}

/**
 * Interface pour les critères de recherche de concepts
 */
export interface ConceptSearchCriteria {
    /** Niveau CECRL */
    readonly level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    /** Catégories à inclure */
    readonly categories?: readonly string[];
    /** Niveau de difficulté minimum */
    readonly minDifficulty?: number;
    /** Niveau de difficulté maximum */
    readonly maxDifficulty?: number;
    /** Identifiants à exclure */
    readonly excludeIds?: readonly string[];
    /** Texte à rechercher */
    readonly searchText?: string;
    /** Nombre maximum de résultats */
    readonly limit?: number;
    /** Tri par fréquence */
    readonly sortByFrequency?: boolean;
    /** Inclure uniquement les concepts avec vidéo */
    readonly withVideoOnly?: boolean;
}

/**
 * Interface pour les statistiques de concepts
 */
export interface ConceptStatistics {
    /** Nombre total de concepts */
    readonly totalConcepts: number;
    /** Répartition par niveau */
    readonly levelDistribution: Readonly<Record<string, number>>;
    /** Répartition par catégorie */
    readonly categoryDistribution: Readonly<Record<string, number>>;
    /** Concept le plus utilisé */
    readonly mostUsedConcept: string;
    /** Concept le moins utilisé */
    readonly leastUsedConcept: string;
    /** Difficulté moyenne */
    readonly averageDifficulty: number;
}

/**
 * Interface abstraite pour le service de données de concepts
 */
export interface IConceptsDataService {
    /** Récupère les identifiants des concepts disponibles */
    getConceptIds(): Promise<readonly string[]>;

    /** Récupère les données d'un concept spécifique */
    getConceptData(conceptId: string): Promise<LSFConcept | null>;

    /** Récupère les détails d'un concept spécifique */
    getConceptDetails(conceptId: string): Promise<LSFConceptDetails | null>;

    /** Récupère des concepts par leurs identifiants */
    getConceptsByIds(conceptIds: readonly string[]): Promise<readonly LSFConcept[]>;

    /** Recherche des concepts selon des critères spécifiques */
    searchConcepts(criteria: ConceptSearchCriteria): Promise<readonly LSFConcept[]>;

    /** Récupère un exemple aléatoire pour un concept donné */
    getRandomExample(conceptId: string): Promise<string | null>;

    /** Récupère les statistiques globales */
    getStatistics(): Promise<ConceptStatistics>;

    /** Récupère les concepts par catégorie */
    getConceptsByCategory(category: string): Promise<readonly LSFConcept[]>;

    /** Récupère les concepts par niveau */
    getConceptsByLevel(level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'): Promise<readonly LSFConcept[]>;
}

/**
 * Erreurs spécifiques au service de concepts
 */
export class ConceptDataError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly conceptId?: string
    ) {
        super(message);
        this.name = 'ConceptDataError';
    }
}

/**
 * Cache intelligent pour les concepts LSF
 */
class ConceptCache {
    private readonly conceptsMap = new Map<string, LSFConcept>();
    private readonly detailsMap = new Map<string, LSFConceptDetails>();
    private readonly searchCache = new Map<string, readonly LSFConcept[]>();
    private readonly maxCacheSize = 1000;
    private readonly maxSearchCacheSize = 100;

    setConcept(concept: LSFConcept): void {
        if (this.conceptsMap.size >= this.maxCacheSize) {
            const firstKey = this.conceptsMap.keys().next().value;
            if (firstKey) {
                this.conceptsMap.delete(firstKey);
            }
        }
        this.conceptsMap.set(concept.id, concept);
    }

    getConcept(id: string): LSFConcept | undefined {
        return this.conceptsMap.get(id);
    }

    setDetails(details: LSFConceptDetails): void {
        if (this.detailsMap.size >= this.maxCacheSize) {
            const firstKey = this.detailsMap.keys().next().value;
            if (firstKey) {
                this.detailsMap.delete(firstKey);
            }
        }
        this.detailsMap.set(details.id, details);
    }

    getDetails(id: string): LSFConceptDetails | undefined {
        return this.detailsMap.get(id);
    }

    setSearchResults(key: string, results: readonly LSFConcept[]): void {
        if (this.searchCache.size >= this.maxSearchCacheSize) {
            const firstKey = this.searchCache.keys().next().value;
            if (firstKey) {
                this.searchCache.delete(firstKey);
            }
        }
        this.searchCache.set(key, results);
    }

    getSearchResults(key: string): readonly LSFConcept[] | undefined {
        return this.searchCache.get(key);
    }

    clear(): void {
        this.conceptsMap.clear();
        this.detailsMap.clear();
        this.searchCache.clear();
    }

    getStats(): { concepts: number; details: number; searches: number } {
        return {
            concepts: this.conceptsMap.size,
            details: this.detailsMap.size,
            searches: this.searchCache.size
        };
    }
}

/**
 * Service de gestion des données de concepts LSF avec implémentation complète
 * Inclut un cache intelligent, des données de test et une architecture extensible
 */
export class ConceptsDataService implements IConceptsDataService, BaseService {
    private static instance: ConceptsDataService | null = null;
    private readonly logger = LoggerFactory.getLogger('ConceptsDataService');
    private readonly cache = new ConceptCache();
    private readonly mockData = new Map<string, LSFConcept>();
    private readonly mockDetails = new Map<string, LSFConceptDetails>();
    private isInitialized = false;

    /**
     * Constructeur privé pour le pattern Singleton
     */
    private constructor() {
        this.logger.info('Initializing ConceptsDataService...');
    }

    /**
     * Obtient l'instance unique du service
     * @returns Instance du service
     */
    public static getInstance(): ConceptsDataService {
        if (!ConceptsDataService.instance) {
            ConceptsDataService.instance = new ConceptsDataService();
        }
        return ConceptsDataService.instance;
    }

    /**
     * Implémentation BaseService - Initialisation
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        this.logger.info('Initializing concepts data service...');
        await this.loadMockData();
        this.registerWithServiceRegistry();
        this.isInitialized = true;
        this.logger.info('ConceptsDataService initialized successfully');
    }

    /**
     * Implémentation BaseService - Démarrage
     */
    async start(): Promise<void> {
        if (!this.isInitialized) {
            await this.initialize();
        }
        this.logger.info('ConceptsDataService started');
    }

    /**
     * Implémentation BaseService - Arrêt
     */
    async stop(): Promise<void> {
        this.cache.clear();
        this.logger.info('ConceptsDataService stopped');
    }

    /**
     * Implémentation BaseService - Vérification de santé
     */
    async checkHealth() {
        const isHealthy = this.isInitialized && this.mockData.size > 0;
        const cacheStats = this.cache.getStats();

        return {
            isHealthy,
            status: isHealthy ? 'healthy' as const : 'unhealthy' as const,
            message: isHealthy ? 'Service operational' : 'Service not initialized or no data available',
            metadata: {
                conceptsLoaded: this.mockData.size,
                cacheStats,
                lastCheck: new Date().toISOString()
            }
        };
    }

    /**
     * Récupère les identifiants des concepts disponibles
     * @returns Liste des identifiants de concepts
     */
    public async getConceptIds(): Promise<readonly string[]> {
        this.ensureInitialized();

        try {
            const ids = Array.from(this.mockData.keys());
            this.logger.debug('Retrieved concept IDs', { count: ids.length });
            return ids;
        } catch (error) {
            this.logger.error('Error retrieving concept IDs', { error });
            throw new ConceptDataError(
                'Failed to retrieve concept IDs',
                'CONCEPT_IDS_RETRIEVAL_FAILED'
            );
        }
    }

    /**
     * Récupère les données d'un concept spécifique
     * @param conceptId Identifiant du concept
     * @returns Données du concept ou null si non trouvé
     */
    public async getConceptData(conceptId: string): Promise<LSFConcept | null> {
        this.ensureInitialized();
        this.validateConceptId(conceptId);

        try {
            // Vérifier le cache d'abord
            const cached = this.cache.getConcept(conceptId);
            if (cached) {
                this.logger.debug('Retrieved concept from cache', { conceptId });
                return cached;
            }

            // Récupérer depuis les données mock
            const concept = this.mockData.get(conceptId) || null;

            if (concept) {
                this.cache.setConcept(concept);
                this.logger.debug('Retrieved and cached concept', { conceptId });
            } else {
                this.logger.warn('Concept not found', { conceptId });
            }

            return concept;
        } catch (error) {
            this.logger.error('Error retrieving concept data', { conceptId, error });
            throw new ConceptDataError(
                `Failed to retrieve concept data for ${conceptId}`,
                'CONCEPT_DATA_RETRIEVAL_FAILED',
                conceptId
            );
        }
    }

    /**
     * Récupère les détails d'un concept spécifique
     * @param conceptId Identifiant du concept
     * @returns Détails du concept ou null si non trouvé
     */
    public async getConceptDetails(conceptId: string): Promise<LSFConceptDetails | null> {
        this.ensureInitialized();
        this.validateConceptId(conceptId);

        try {
            // Vérifier le cache d'abord
            const cached = this.cache.getDetails(conceptId);
            if (cached) {
                this.logger.debug('Retrieved concept details from cache', { conceptId });
                return cached;
            }

            // Récupérer depuis les données mock
            const details = this.mockDetails.get(conceptId) || null;

            if (details) {
                this.cache.setDetails(details);
                this.logger.debug('Retrieved and cached concept details', { conceptId });
            } else {
                this.logger.warn('Concept details not found', { conceptId });
            }

            return details;
        } catch (error) {
            this.logger.error('Error retrieving concept details', { conceptId, error });
            throw new ConceptDataError(
                `Failed to retrieve concept details for ${conceptId}`,
                'CONCEPT_DETAILS_RETRIEVAL_FAILED',
                conceptId
            );
        }
    }

    /**
     * Récupère des concepts par leurs identifiants
     * @param conceptIds Liste d'identifiants de concepts
     * @returns Liste des concepts trouvés
     */
    public async getConceptsByIds(conceptIds: readonly string[]): Promise<readonly LSFConcept[]> {
        this.ensureInitialized();

        if (conceptIds.length === 0) {
            return [];
        }

        try {
            const concepts: LSFConcept[] = [];

            for (const id of conceptIds) {
                const concept = await this.getConceptData(id);
                if (concept) {
                    concepts.push(concept);
                }
            }

            this.logger.debug('Retrieved concepts by IDs', {
                requestedCount: conceptIds.length,
                foundCount: concepts.length
            });

            return concepts;
        } catch (error) {
            this.logger.error('Error retrieving concepts by IDs', { conceptIds, error });
            throw new ConceptDataError(
                'Failed to retrieve concepts by IDs',
                'CONCEPTS_BY_IDS_RETRIEVAL_FAILED'
            );
        }
    }

    /**
     * Recherche des concepts selon des critères spécifiques
     * @param criteria Critères de recherche
     * @returns Liste des concepts correspondant aux critères
     */
    public async searchConcepts(criteria: ConceptSearchCriteria): Promise<readonly LSFConcept[]> {
        this.ensureInitialized();

        try {
            const cacheKey = this.buildSearchCacheKey(criteria);

            // Vérifier le cache de recherche
            const cached = this.cache.getSearchResults(cacheKey);
            if (cached) {
                this.logger.debug('Retrieved search results from cache', { criteria });
                return cached;
            }

            // Effectuer la recherche
            let results = Array.from(this.mockData.values());

            // Filtrer par niveau
            if (criteria.level) {
                results = results.filter(concept => concept.level === criteria.level);
            }

            // Filtrer par catégories
            if (criteria.categories && criteria.categories.length > 0) {
                results = results.filter(concept =>
                    criteria.categories!.some(cat => concept.categories.includes(cat))
                );
            }

            // Filtrer par difficulté
            if (criteria.minDifficulty !== undefined) {
                results = results.filter(concept => concept.difficulty >= criteria.minDifficulty!);
            }
            if (criteria.maxDifficulty !== undefined) {
                results = results.filter(concept => concept.difficulty <= criteria.maxDifficulty!);
            }

            // Exclure des IDs spécifiques
            if (criteria.excludeIds && criteria.excludeIds.length > 0) {
                results = results.filter(concept => !criteria.excludeIds!.includes(concept.id));
            }

            // Recherche textuelle
            if (criteria.searchText) {
                const searchLower = criteria.searchText.toLowerCase();
                results = results.filter(concept =>
                    concept.text.toLowerCase().includes(searchLower) ||
                    concept.categories.some(cat => cat.toLowerCase().includes(searchLower))
                );
            }

            // Filtrer par présence de vidéo
            if (criteria.withVideoOnly) {
                results = results.filter(concept => concept.videoUrl !== undefined);
            }

            // Trier par fréquence si demandé
            if (criteria.sortByFrequency) {
                results.sort((a, b) => b.frequency - a.frequency);
            }

            // Limiter les résultats
            if (criteria.limit && criteria.limit > 0) {
                results = results.slice(0, criteria.limit);
            }

            // Mettre en cache les résultats
            this.cache.setSearchResults(cacheKey, results);

            this.logger.debug('Search completed', {
                criteria,
                resultCount: results.length
            });

            return results;
        } catch (error) {
            this.logger.error('Error searching concepts', { criteria, error });
            throw new ConceptDataError(
                'Failed to search concepts',
                'CONCEPT_SEARCH_FAILED'
            );
        }
    }

    /**
     * Récupère un exemple aléatoire pour un concept donné
     * @param conceptId Identifiant du concept
     * @returns Exemple aléatoire ou null si aucun exemple n'est disponible
     */
    public async getRandomExample(conceptId: string): Promise<string | null> {
        this.ensureInitialized();
        this.validateConceptId(conceptId);

        try {
            const details = await this.getConceptDetails(conceptId);

            if (!details || details.examples.length === 0) {
                this.logger.warn('No examples available for concept', { conceptId });
                return null;
            }

            const randomIndex = Math.floor(Math.random() * details.examples.length);
            const example = details.examples[randomIndex];

            this.logger.debug('Retrieved random example', { conceptId, example });
            return example;
        } catch (error) {
            this.logger.error('Error retrieving random example', { conceptId, error });
            throw new ConceptDataError(
                `Failed to get random example for concept ${conceptId}`,
                'RANDOM_EXAMPLE_RETRIEVAL_FAILED',
                conceptId
            );
        }
    }

    /**
     * Récupère les statistiques globales
     * @returns Statistiques des concepts
     */
    public async getStatistics(): Promise<ConceptStatistics> {
        this.ensureInitialized();

        try {
            const concepts = Array.from(this.mockData.values());

            const levelDistribution: Record<string, number> = {};
            const categoryDistribution: Record<string, number> = {};
            let mostUsedConcept = '';
            let leastUsedConcept = '';
            let maxFrequency = 0;
            let minFrequency = Infinity;
            let totalDifficulty = 0;

            for (const concept of concepts) {
                // Distribution par niveau
                levelDistribution[concept.level] = (levelDistribution[concept.level] || 0) + 1;

                // Distribution par catégorie
                for (const category of concept.categories) {
                    categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
                }

                // Fréquence
                if (concept.frequency > maxFrequency) {
                    maxFrequency = concept.frequency;
                    mostUsedConcept = concept.id;
                }
                if (concept.frequency < minFrequency) {
                    minFrequency = concept.frequency;
                    leastUsedConcept = concept.id;
                }

                totalDifficulty += concept.difficulty;
            }

            const statistics: ConceptStatistics = {
                totalConcepts: concepts.length,
                levelDistribution,
                categoryDistribution,
                mostUsedConcept,
                leastUsedConcept,
                averageDifficulty: concepts.length > 0 ? totalDifficulty / concepts.length : 0
            };

            this.logger.debug('Generated statistics', {
                totalConcepts: statistics.totalConcepts,
                averageDifficulty: statistics.averageDifficulty,
                levelsCount: Object.keys(statistics.levelDistribution).length,
                categoriesCount: Object.keys(statistics.categoryDistribution).length
            });
            return statistics;
        } catch (error) {
            this.logger.error('Error generating statistics', { error });
            throw new ConceptDataError(
                'Failed to generate statistics',
                'STATISTICS_GENERATION_FAILED'
            );
        }
    }

    /**
     * Récupère les concepts par catégorie
     * @param category Catégorie recherchée
     * @returns Liste des concepts de cette catégorie
     */
    public async getConceptsByCategory(category: string): Promise<readonly LSFConcept[]> {
        return this.searchConcepts({ categories: [category] });
    }

    /**
     * Récupère les concepts par niveau
     * @param level Niveau CECRL
     * @returns Liste des concepts de ce niveau
     */
    public async getConceptsByLevel(level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'): Promise<readonly LSFConcept[]> {
        return this.searchConcepts({ level });
    }

    /**
     * Nettoie le cache
     */
    public clearCache(): void {
        this.cache.clear();
        this.logger.info('Cache cleared');
    }

    /**
     * Obtient les statistiques du cache
     * @returns Statistiques du cache
     */
    public getCacheStats(): { concepts: number; details: number; searches: number } {
        return this.cache.getStats();
    }

    /**
     * Réinitialise l'instance (pour les tests)
     * @internal
     */
    public static resetInstance(): void {
        ConceptsDataService.instance = null;
    }

    // ========== MÉTHODES PRIVÉES ==========

    /**
     * Vérifie que le service est initialisé
     * @private
     */
    private ensureInitialized(): void {
        if (!this.isInitialized) {
            throw new ConceptDataError(
                'Service not initialized. Call initialize() first.',
                'SERVICE_NOT_INITIALIZED'
            );
        }
    }

    /**
     * Valide un identifiant de concept
     * @param conceptId Identifiant à valider
     * @private
     */
    private validateConceptId(conceptId: string): void {
        if (!conceptId || typeof conceptId !== 'string' || conceptId.trim().length === 0) {
            throw new ConceptDataError(
                'Invalid concept ID provided',
                'INVALID_CONCEPT_ID',
                conceptId
            );
        }
    }

    /**
     * Construit une clé de cache pour les recherches
     * @param criteria Critères de recherche
     * @returns Clé de cache
     * @private
     */
    private buildSearchCacheKey(criteria: ConceptSearchCriteria): string {
        const keyParts = [
            criteria.level || 'any',
            criteria.categories ? [...criteria.categories].sort().join(',') : '',
            criteria.minDifficulty?.toString() || '0',
            criteria.maxDifficulty?.toString() || '1',
            criteria.excludeIds ? [...criteria.excludeIds].sort().join(',') : '',
            criteria.searchText || '',
            criteria.limit?.toString() || 'unlimited',
            criteria.sortByFrequency ? 'freq' : 'default',
            criteria.withVideoOnly ? 'video' : 'all'
        ];

        return Buffer.from(keyParts.join('|')).toString('base64').slice(0, 16);
    }

    /**
     * Charge les données de test/mock
     * @private
     */
    private async loadMockData(): Promise<void> {
        this.logger.info('Loading mock LSF concepts data...');

        const mockConcepts = this.generateMockConcepts();
        const mockDetails = this.generateMockDetails(mockConcepts);

        for (const concept of mockConcepts) {
            this.mockData.set(concept.id, concept);
        }

        for (const detail of mockDetails) {
            this.mockDetails.set(detail.id, detail);
        }

        this.logger.info('Mock data loaded', {
            conceptsCount: this.mockData.size,
            detailsCount: this.mockDetails.size
        });
    }

    /**
     * Génère des concepts LSF de test
     * @returns Liste de concepts de test
     * @private
     */
    private generateMockConcepts(): LSFConcept[] {
        const baseDate = new Date('2024-01-01');

        return [
            {
                id: 'bonjour',
                text: 'Bonjour',
                videoUrl: '/videos/lsf/bonjour.mp4',
                imageUrl: '/images/lsf/bonjour.png',
                level: 'A1',
                categories: ['salutations', 'politesse'],
                relatedConcepts: ['bonsoir', 'salut', 'au-revoir'],
                difficulty: 0.1,
                frequency: 95,
                createdAt: baseDate,
                updatedAt: new Date()
            },
            {
                id: 'merci',
                text: 'Merci',
                videoUrl: '/videos/lsf/merci.mp4',
                imageUrl: '/images/lsf/merci.png',
                level: 'A1',
                categories: ['politesse', 'gratitude'],
                relatedConcepts: ['de-rien', 's-il-vous-plait'],
                difficulty: 0.1,
                frequency: 90,
                createdAt: baseDate,
                updatedAt: new Date()
            },
            {
                id: 'famille',
                text: 'Famille',
                videoUrl: '/videos/lsf/famille.mp4',
                imageUrl: '/images/lsf/famille.png',
                level: 'A2',
                categories: ['famille', 'relations'],
                relatedConcepts: ['mère', 'père', 'enfant', 'frère', 'sœur'],
                difficulty: 0.3,
                frequency: 85,
                createdAt: baseDate,
                updatedAt: new Date()
            },
            {
                id: 'apprendre',
                text: 'Apprendre',
                videoUrl: '/videos/lsf/apprendre.mp4',
                level: 'B1',
                categories: ['éducation', 'verbes'],
                relatedConcepts: ['étudier', 'comprendre', 'savoir'],
                difficulty: 0.5,
                frequency: 70,
                createdAt: baseDate,
                updatedAt: new Date()
            },
            {
                id: 'philosophie',
                text: 'Philosophie',
                videoUrl: '/videos/lsf/philosophie.mp4',
                level: 'C2',
                categories: ['académique', 'abstraits'],
                relatedConcepts: ['réflexion', 'pensée', 'sagesse'],
                difficulty: 0.9,
                frequency: 20,
                createdAt: baseDate,
                updatedAt: new Date()
            }
        ];
    }

    /**
     * Génère les détails de test pour les concepts
     * @param concepts Liste des concepts
     * @returns Liste des détails
     * @private
     */
    private generateMockDetails(concepts: LSFConcept[]): LSFConceptDetails[] {
        return concepts.map(concept => ({
            id: concept.id,
            explanation: `Explication détaillée du signe "${concept.text}" en LSF.`,
            examples: [
                `Bonjour, comment ça va ? (avec ${concept.text})`,
                `J'utilise "${concept.text}" dans cette situation.`,
                `Exemple de phrase avec "${concept.text}" au quotidien.`
            ],
            variants: {
                'Paris': `Variante parisienne de ${concept.text}`,
                'Lyon': `Variante lyonnaise de ${concept.text}`,
                'Marseille': `Variante marseillaise de ${concept.text}`
            },
            history: `Histoire et évolution du signe "${concept.text}" en LSF.`,
            grammar: {
                'type': concept.categories.includes('verbes') ? 'verbe' : 'nom',
                'placement': 'espace neutre',
                'mouvement': 'bidirectionnel'
            },
            contexts: ['formel', 'informel', 'éducatif'],
            synonyms: concept.relatedConcepts.slice(0, 2)
        }));
    }

    /**
     * Enregistre le service dans le registre
     * @private
     */
    private registerWithServiceRegistry(): void {
        try {
            const registry = LearningServiceRegistry.getInstance();

            if (!registry.hasService('concepts-data-service')) {
                registry.registerService({
                    id: 'concepts-data-service',
                    name: 'LSF Concepts Data Service',
                    version: '2.0.0',
                    description: 'Service de gestion des données de concepts LSF',
                    type: 'data-service',
                    instance: this,
                    dependencies: [],
                    tags: ['lsf', 'concepts', 'data', 'cache']
                });

                this.logger.info('Service registered with LearningServiceRegistry');
            }
        } catch (error) {
            this.logger.warn('Failed to register with service registry', { error });
        }
    }
}