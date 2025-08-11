/**
 * Dépôt de concepts d'apprentissage
 * 
 * @file src/ai/services/learning/human/coda/codavirtuel/evaluators/repositories/ConceptRepository.ts
 * @description Fournit un accès aux concepts d'apprentissage et à leurs ressources associées
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Interface représentant une ressource d'apprentissage
 */
export interface LearningResource {
    /**
     * Identifiant unique de la ressource
     */
    id: string;

    /**
     * Titre de la ressource
     */
    title: string;

    /**
     * Type de ressource
     */
    type: 'video' | 'article' | 'exercise' | 'quiz' | 'interactive';

    /**
     * Difficulté de la ressource (1-5)
     */
    difficulty: number;

    /**
     * Niveau de la ressource
     */
    level: 'beginner' | 'intermediate' | 'advanced';

    /**
     * URL ou emplacement de la ressource
     */
    url?: string;

    /**
     * Durée estimée (en secondes)
     */
    duration?: number;

    /**
     * Description de la ressource
     */
    description?: string;

    /**
     * Tags associés à la ressource
     */
    tags?: string[];
}

/**
 * Interface représentant un concept d'apprentissage
 */
export interface Concept {
    /**
     * Identifiant unique du concept
     */
    id: string;

    /**
     * Nom du concept
     */
    name: string;

    /**
     * Description du concept
     */
    description: string;

    /**
     * Catégorie du concept
     */
    category: string;

    /**
     * Complexité du concept (1-10)
     */
    complexity: number;

    /**
     * Importance du concept (1-10)
     */
    importance: number;

    /**
     * Concepts prérequis
     */
    prerequisites?: string[];

    /**
     * Concepts dérivés
     */
    derivatives?: string[];

    /**
     * Tags associés au concept
     */
    tags?: string[];

    /**
     * Métadonnées supplémentaires
     */
    metadata?: Record<string, unknown>;
}

/**
 * Interface pour les options de recherche de concepts
 */
export interface ConceptSearchOptions {
    /**
     * Mots-clés de recherche
     */
    keywords?: string;

    /**
     * Catégorie à filtrer
     */
    category?: string;

    /**
     * Complexité minimale
     */
    minComplexity?: number;

    /**
     * Complexité maximale
     */
    maxComplexity?: number;

    /**
     * Importance minimale
     */
    minImportance?: number;

    /**
     * Tags à inclure
     */
    tags?: string[];

    /**
     * Limite de résultats
     */
    limit?: number;

    /**
     * Décalage pour la pagination
     */
    offset?: number;
}

/**
 * Dépôt pour accéder aux concepts d'apprentissage et à leurs ressources
 */
export class ConceptRepository {
    private readonly logger = LoggerFactory.getLogger('ConceptRepository');
    private readonly concepts: Map<string, Concept> = new Map();
    private readonly resources: Map<string, LearningResource[]> = new Map();
    private initialized = false;

    /**
     * Crée une nouvelle instance du dépôt de concepts
     */
    constructor() {
        // Initialiser avec des données simulées (pour le développement)
        this.initializeMockData();
        this.logger.info('ConceptRepository initialized');
    }

    /**
     * Initialise le dépôt avec des données simulées
     * @private
     */
    private initializeMockData(): void {
        // Concepts de base LSF
        this.addConcept({
            id: 'concept_handshape',
            name: 'Configuration manuelle',
            description: 'Formes et positions des mains pour les signes',
            category: 'phonology',
            complexity: 6,
            importance: 9,
            tags: ['phonology', 'basic', 'handshape']
        });

        this.addConcept({
            id: 'concept_movement',
            name: 'Mouvement',
            description: 'Mouvements des mains et des bras dans l\'espace',
            category: 'phonology',
            complexity: 5,
            importance: 8,
            tags: ['phonology', 'basic', 'movement']
        });

        this.addConcept({
            id: 'concept_location',
            name: 'Emplacement',
            description: 'Emplacement des signes par rapport au corps',
            category: 'phonology',
            complexity: 4,
            importance: 7,
            tags: ['phonology', 'basic', 'location']
        });

        this.addConcept({
            id: 'concept_orientation',
            name: 'Orientation',
            description: 'Direction vers laquelle les mains sont orientées',
            category: 'phonology',
            complexity: 5,
            importance: 7,
            tags: ['phonology', 'basic', 'orientation']
        });

        // Concepts plus avancés
        this.addConcept({
            id: 'concept_spatial_reference',
            name: 'Référence spatiale',
            description: 'Utilisation de l\'espace pour référencer des personnes ou objets',
            category: 'grammar',
            complexity: 8,
            importance: 9,
            prerequisites: ['concept_location', 'concept_movement'],
            tags: ['grammar', 'advanced', 'spatial']
        });

        this.addConcept({
            id: 'concept_non_manual_markers',
            name: 'Marqueurs non manuels',
            description: 'Expressions faciales et mouvements du corps qui modifient le sens',
            category: 'grammar',
            complexity: 7,
            importance: 8,
            tags: ['grammar', 'intermediate', 'facial']
        });

        this.addConcept({
            id: 'concept_classifiers',
            name: 'Classificateurs',
            description: 'Configurations manuelles qui représentent des catégories d\'objets',
            category: 'grammar',
            complexity: 9,
            importance: 8,
            prerequisites: ['concept_handshape', 'concept_movement'],
            tags: ['grammar', 'advanced', 'classifiers']
        });

        this.addConcept({
            id: 'concept_role_shifting',
            name: 'Transfert personnel',
            description: 'Technique pour représenter différentes personnes dans une narration',
            category: 'discourse',
            complexity: 8,
            importance: 7,
            prerequisites: ['concept_spatial_reference', 'concept_non_manual_markers'],
            tags: ['discourse', 'advanced', 'role']
        });

        // Ajouter des ressources pour chaque concept
        this.addResourcesForConcept('concept_handshape', [
            {
                id: 'res_handshape_1',
                title: 'Les configurations manuelles de base',
                type: 'video',
                difficulty: 2,
                level: 'beginner',
                duration: 480,
                tags: ['handshape', 'tutorial']
            },
            {
                id: 'res_handshape_2',
                title: 'Exercices pratiques de configurations manuelles',
                type: 'exercise',
                difficulty: 3,
                level: 'beginner',
                duration: 900,
                tags: ['handshape', 'practice']
            }
        ]);

        this.addResourcesForConcept('concept_movement', [
            {
                id: 'res_movement_1',
                title: 'Types de mouvements en LSF',
                type: 'video',
                difficulty: 2,
                level: 'beginner',
                duration: 420,
                tags: ['movement', 'tutorial']
            }
        ]);

        this.addResourcesForConcept('concept_spatial_reference', [
            {
                id: 'res_spatial_1',
                title: 'L\'espace de signation',
                type: 'video',
                difficulty: 4,
                level: 'intermediate',
                duration: 540,
                tags: ['spatial', 'tutorial']
            },
            {
                id: 'res_spatial_2',
                title: 'Atelier pratique sur l\'utilisation de l\'espace',
                type: 'interactive',
                difficulty: 5,
                level: 'intermediate',
                duration: 1200,
                tags: ['spatial', 'workshop']
            },
            {
                id: 'res_spatial_3',
                title: 'Quiz sur les références spatiales',
                type: 'quiz',
                difficulty: 4,
                level: 'intermediate',
                duration: 300,
                tags: ['spatial', 'assessment']
            }
        ]);

        this.initialized = true;
    }

    /**
     * Ajoute un concept au dépôt
     * @param concept - Concept à ajouter
     * @returns true si le concept a été ajouté avec succès
     */
    public addConcept(concept: Concept): boolean {
        if (this.concepts.has(concept.id)) {
            this.logger.warn(`Concept ${concept.id} already exists`);
            return false;
        }

        this.concepts.set(concept.id, concept);
        this.logger.debug(`Added concept: ${concept.id}`);
        return true;
    }

    /**
     * Ajoute des ressources pour un concept spécifique
     * @param conceptId - Identifiant du concept
     * @param resources - Ressources à ajouter
     * @returns true si les ressources ont été ajoutées avec succès
     */
    public addResourcesForConcept(conceptId: string, resources: LearningResource[]): boolean {
        if (!this.concepts.has(conceptId)) {
            this.logger.warn(`Cannot add resources: Concept ${conceptId} not found`);
            return false;
        }

        const existingResources = this.resources.get(conceptId) || [];
        this.resources.set(conceptId, [...existingResources, ...resources]);

        this.logger.debug(`Added ${resources.length} resources for concept: ${conceptId}`);
        return true;
    }

    /**
     * Récupère un concept par son identifiant
     * @param conceptId - Identifiant du concept
     * @returns Le concept ou undefined s'il n'est pas trouvé
     */
    public async getConceptById(conceptId: string): Promise<Concept | undefined> {
        // Simuler une opération asynchrone
        return this.concepts.get(conceptId);
    }

    /**
     * Recherche des concepts selon des critères
     * @param options - Options de recherche
     * @returns Liste des concepts correspondants
     */
    public async searchConcepts(options: ConceptSearchOptions): Promise<Concept[]> {
        let results = Array.from(this.concepts.values());

        // Filtrer par mots-clés
        if (options.keywords) {
            const keywords = options.keywords.toLowerCase().split(/\s+/);
            results = results.filter(concept =>
                keywords.some(keyword =>
                    concept.name.toLowerCase().includes(keyword) ||
                    concept.description.toLowerCase().includes(keyword)
                )
            );
        }

        // Filtrer par catégorie
        if (options.category) {
            results = results.filter(concept =>
                concept.category === options.category
            );
        }

        // Filtrer par complexité
        if (options.minComplexity !== undefined) {
            results = results.filter(concept =>
                concept.complexity >= options.minComplexity!
            );
        }

        if (options.maxComplexity !== undefined) {
            results = results.filter(concept =>
                concept.complexity <= options.maxComplexity!
            );
        }

        // Filtrer par importance
        if (options.minImportance !== undefined) {
            results = results.filter(concept =>
                concept.importance >= options.minImportance!
            );
        }

        // Filtrer par tags
        if (options.tags && options.tags.length > 0) {
            results = results.filter(concept =>
                options.tags!.some(tag => concept.tags?.includes(tag))
            );
        }

        // Appliquer pagination
        if (options.offset !== undefined) {
            results = results.slice(options.offset);
        }

        if (options.limit !== undefined) {
            results = results.slice(0, options.limit);
        }

        return results;
    }

    /**
     * Récupère les ressources associées à un concept
     * @param conceptId - Identifiant du concept
     * @returns Liste des ressources pour le concept
     */
    public async getConceptResources(conceptId: string): Promise<LearningResource[]> {
        return this.resources.get(conceptId) || [];
    }

    /**
     * Récupère les concepts prérequis pour un concept donné
     * @param conceptId - Identifiant du concept
     * @returns Liste des concepts prérequis
     */
    public async getPrerequisiteConcepts(conceptId: string): Promise<Concept[]> {
        const concept = await this.getConceptById(conceptId);

        if (!concept || !concept.prerequisites || concept.prerequisites.length === 0) {
            return [];
        }

        const prerequisites: Concept[] = [];

        for (const prereqId of concept.prerequisites) {
            const prereqConcept = await this.getConceptById(prereqId);
            if (prereqConcept) {
                prerequisites.push(prereqConcept);
            }
        }

        return prerequisites;
    }

    /**
     * Récupère tous les concepts disponibles
     * @returns Liste de tous les concepts
     */
    public async getAllConcepts(): Promise<Concept[]> {
        return Array.from(this.concepts.values());
    }

    /**
     * Vérifie si le dépôt est initialisé
     * @returns true si le dépôt est initialisé
     */
    public isInitialized(): boolean {
        return this.initialized;
    }
}