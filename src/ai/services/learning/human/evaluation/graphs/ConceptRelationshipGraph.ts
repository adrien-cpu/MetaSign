/**
 * Graphe des relations entre concepts
 * 
 * @file src/ai/services/learning/human/evaluation/graphs/ConceptRelationshipGraph.ts
 * @description Représente et gère les relations entre différents concepts d'apprentissage
 */

/**
 * Type de relation entre concepts
 */
export type RelationshipType = 'prerequisite' | 'related' | 'extension' | 'application';

/**
 * Représente une relation entre deux concepts
 */
export interface ConceptRelationship {
    fromConcept: string;
    toConcept: string;
    type: RelationshipType;
    strength: number;
}

/**
 * Graphe des relations entre concepts d'apprentissage
 * Permet de modéliser les dépendances et connexions entre différents concepts
 */
export class ConceptRelationshipGraph {
    private relationships: ConceptRelationship[] = [];
    private concepts: Set<string> = new Set();

    /**
     * Crée une nouvelle instance du graphe de relations entre concepts
     * @param initialConcepts - Liste initiale de concepts (optionnelle)
     */
    constructor(initialConcepts: string[] = []) {
        initialConcepts.forEach(concept => this.concepts.add(concept));
    }

    /**
     * Ajoute un nouveau concept au graphe
     * @param conceptId - Identifiant du concept à ajouter
     * @param prerequisites - Prérequis du concept (optionnels)
     * @returns true si le concept a été ajouté, false s'il existait déjà
     */
    public addConcept(conceptId: string, prerequisites: string[] = []): boolean {
        let conceptAdded = false;

        if (!this.concepts.has(conceptId)) {
            this.concepts.add(conceptId);
            conceptAdded = true;
        }

        // Ajouter les relations de prérequis
        for (const prereq of prerequisites) {
            // Ajouter le prérequis s'il n'existe pas encore
            if (!this.concepts.has(prereq)) {
                this.concepts.add(prereq);
            }

            // Ajouter la relation
            this.addRelationship(prereq, conceptId, 'prerequisite');
        }

        return conceptAdded;
    }

    /**
     * Ajoute une relation entre deux concepts
     * @param fromConcept - Concept source
     * @param toConcept - Concept cible
     * @param type - Type de relation
     * @param strength - Force de la relation (0 à 1)
     * @returns true si la relation a été ajoutée avec succès
     */
    public addRelationship(
        fromConcept: string,
        toConcept: string,
        type: RelationshipType = 'related',
        strength: number = 1
    ): boolean {
        // Ajouter les concepts s'ils n'existent pas
        this.addConcept(fromConcept);
        this.addConcept(toConcept);

        // Vérifier si la relation existe déjà
        const existingRelationship = this.relationships.find(
            rel => rel.fromConcept === fromConcept &&
                rel.toConcept === toConcept &&
                rel.type === type
        );

        if (existingRelationship) {
            // Mettre à jour la force de la relation existante
            existingRelationship.strength = strength;
            return false;
        }

        // Ajouter la nouvelle relation
        this.relationships.push({
            fromConcept,
            toConcept,
            type,
            strength: Math.max(0, Math.min(1, strength)) // Limiter entre 0 et 1
        });

        return true;
    }

    /**
     * Obtient toutes les relations pour un concept donné
     * @param conceptId - Identifiant du concept
     * @param direction - Direction des relations à récupérer ('outgoing', 'incoming', ou 'both')
     * @returns Liste des relations trouvées
     */
    public getRelationships(
        conceptId: string,
        direction: 'outgoing' | 'incoming' | 'both' = 'both'
    ): ConceptRelationship[] {
        if (!this.concepts.has(conceptId)) {
            return [];
        }

        return this.relationships.filter(rel => {
            if (direction === 'outgoing' && rel.fromConcept === conceptId) {
                return true;
            }
            if (direction === 'incoming' && rel.toConcept === conceptId) {
                return true;
            }
            if (direction === 'both' && (rel.fromConcept === conceptId || rel.toConcept === conceptId)) {
                return true;
            }
            return false;
        });
    }

    /**
     * Obtient tous les concepts qui dépendent du concept donné
     * @param conceptId - Identifiant du concept
     * @returns Liste des concepts dépendants
     */
    public getDependentConcepts(conceptId: string): string[] {
        if (!this.concepts.has(conceptId)) {
            return [];
        }

        return this.relationships
            .filter(rel => rel.fromConcept === conceptId && rel.type === 'prerequisite')
            .map(rel => rel.toConcept);
    }

    /**
     * Obtient tous les prérequis du concept donné
     * @param conceptId - Identifiant du concept
     * @param recursive - Récupérer récursivement tous les prérequis
     * @returns Liste des concepts prérequis
     */
    public getPrerequisites(conceptId: string, recursive: boolean = false): string[] {
        if (!this.concepts.has(conceptId)) {
            return [];
        }

        const prereqs = this.relationships
            .filter(rel => rel.toConcept === conceptId && rel.type === 'prerequisite')
            .map(rel => rel.fromConcept);

        if (!recursive) {
            return prereqs;
        }

        // Récupération récursive des prérequis
        const allPrereqs = new Set<string>(prereqs);

        for (const prereq of prereqs) {
            const subPrereqs = this.getPrerequisites(prereq, true);
            for (const subPrereq of subPrereqs) {
                allPrereqs.add(subPrereq);
            }
        }

        return Array.from(allPrereqs);
    }

    /**
     * Calcule l'importance d'un concept dans le graphe
     * basée sur le nombre de concepts qui en dépendent
     * @param conceptId - Identifiant du concept
     * @returns Score d'importance (plus élevé = plus important)
     */
    public calculateConceptImportance(conceptId: string): number {
        if (!this.concepts.has(conceptId)) {
            return 0;
        }

        // Nombre de concepts qui dépendent directement de celui-ci
        const directDependents = this.getDependentConcepts(conceptId).length;

        // Influence indirecte (concepts qui dépendent des concepts dépendants)
        let indirectInfluence = 0;
        this.getDependentConcepts(conceptId).forEach(dependent => {
            indirectInfluence += this.getDependentConcepts(dependent).length * 0.5;
        });

        return directDependents + indirectInfluence;
    }

    /**
     * Calcule un chemin d'apprentissage optimal pour atteindre les concepts cibles
     * @param targetConcepts - Concepts cibles à apprendre
     * @returns Chemin d'apprentissage optimal
     */
    public getOptimalLearningPath(targetConcepts: string[]): string[] {
        // Ensemble des concepts déjà inclus dans le chemin
        const includedConcepts = new Set<string>();

        // Chemins des concepts (conceptId -> [chemin])
        const paths = new Map<string, string[]>();

        // Traitement des concepts cibles et de leurs prérequis (itératif plutôt que récursif)
        const processQueue = [...targetConcepts];

        // Initialiser les chemins pour les concepts cibles
        for (const concept of targetConcepts) {
            paths.set(concept, [concept]);
        }

        while (processQueue.length > 0) {
            const currentConcept = processQueue.shift()!;

            if (includedConcepts.has(currentConcept)) {
                continue;
            }

            includedConcepts.add(currentConcept);

            // Récupérer les prérequis du concept actuel
            const prereqs = this.getPrerequisites(currentConcept);

            for (const prereq of prereqs) {
                if (!includedConcepts.has(prereq)) {
                    processQueue.push(prereq);

                    // Créer un nouveau chemin pour ce prérequis
                    const currentPath = paths.get(currentConcept) || [currentConcept];
                    const prereqPath = [prereq, ...currentPath];

                    // Mettre à jour le chemin si nécessaire
                    if (!paths.has(prereq) || paths.get(prereq)!.length > prereqPath.length) {
                        paths.set(prereq, prereqPath);
                    }
                }
            }
        }

        // Construire le chemin final en ordre topologique
        const result: string[] = [];
        const visited = new Set<string>();

        // Fonction pour ajouter un concept dans l'ordre topologique
        const addInTopologicalOrder = (concept: string): void => {
            if (visited.has(concept)) {
                return;
            }

            visited.add(concept);

            const prereqs = this.getPrerequisites(concept);

            for (const prereq of prereqs) {
                if (!visited.has(prereq)) {
                    addInTopologicalOrder(prereq);
                }
            }

            result.push(concept);
        };

        // Ajouter tous les concepts dans l'ordre topologique
        for (const concept of targetConcepts) {
            addInTopologicalOrder(concept);
        }

        return result;
    }

    /**
     * Obtient tous les concepts dans le graphe
     * @returns Ensemble des concepts
     */
    public getAllConcepts(): string[] {
        return Array.from(this.concepts);
    }

    /**
     * Vérifie si un concept existe dans le graphe
     * @param conceptId - Identifiant du concept
     * @returns true si le concept existe
     */
    public hasConcept(conceptId: string): boolean {
        return this.concepts.has(conceptId);
    }

    /**
     * Supprime un concept et toutes ses relations
     * @param conceptId - Identifiant du concept à supprimer
     * @returns true si le concept a été supprimé
     */
    public removeConcept(conceptId: string): boolean {
        if (!this.concepts.has(conceptId)) {
            return false;
        }

        // Supprimer les relations impliquant ce concept
        this.relationships = this.relationships.filter(
            rel => rel.fromConcept !== conceptId && rel.toConcept !== conceptId
        );

        // Supprimer le concept
        this.concepts.delete(conceptId);

        return true;
    }
}