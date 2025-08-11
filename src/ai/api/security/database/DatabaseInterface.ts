// src/ai/api/security/database/DatabaseInterface.ts

/**
 * Interface pour les opérations de base de données
 */
export interface DatabaseInterface {
    /**
     * Recherche des documents dans une collection
     * @param collection Nom de la collection
     * @param query Critères de recherche
     * @returns Documents correspondants
     */
    find<T>(collection: string, query: Record<string, unknown>): Promise<T[]>;

    /**
     * Trouve un seul document dans une collection
     * @param collection Nom de la collection
     * @param query Critères de recherche
     * @returns Document correspondant ou null si non trouvé
     */
    findOne<T>(collection: string, query: Record<string, unknown>): Promise<T | null>;

    /**
     * Insère un document dans une collection
     * @param collection Nom de la collection
     * @param document Document à insérer
     * @returns ID du document inséré
     */
    insert<T>(collection: string, document: T): Promise<string>;

    /**
     * Insère plusieurs documents dans une collection
     * @param collection Nom de la collection
     * @param documents Documents à insérer
     * @returns IDs des documents insérés
     */
    insertMany<T>(collection: string, documents: T[]): Promise<string[]>;

    /**
     * Met à jour un document dans une collection
     * @param collection Nom de la collection
     * @param query Critères pour trouver le document
     * @param update Modifications à appliquer
     * @returns Vrai si un document a été modifié
     */
    update<T>(collection: string, query: Record<string, unknown>, update: Partial<T>): Promise<boolean>;

    /**
     * Met à jour plusieurs documents dans une collection
     * @param collection Nom de la collection
     * @param query Critères pour trouver les documents
     * @param update Modifications à appliquer
     * @returns Nombre de documents modifiés
     */
    updateMany<T>(collection: string, query: Record<string, unknown>, update: Partial<T>): Promise<number>;

    /**
     * Supprime un document d'une collection
     * @param collection Nom de la collection
     * @param query Critères pour trouver le document
     * @returns Vrai si un document a été supprimé
     */
    delete(collection: string, query: Record<string, unknown>): Promise<boolean>;

    /**
     * Supprime plusieurs documents d'une collection
     * @param collection Nom de la collection
     * @param query Critères pour trouver les documents
     * @returns Nombre de documents supprimés
     */
    deleteMany(collection: string, query: Record<string, unknown>): Promise<number>;
}