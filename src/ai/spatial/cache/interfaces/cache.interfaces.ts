// src/ai/spatial/cache/interfaces/cache.interfaces.ts

/**
 * Interface de base pour tous les mécanismes de cache
 */
export interface ICache<T> {
    /**
     * Stocke une valeur dans le cache
     * @param key Clé pour identifier l'élément
     * @param value Valeur à stocker
     * @param ttl Durée de vie en millisecondes (optionnel)
     * @returns true si l'opération a réussi
     */
    set(key: string, value: T, ttl?: number): boolean;

    /**
     * Récupère une valeur du cache
     * @param key Clé de l'élément
     * @returns La valeur si trouvée, undefined sinon
     */
    get(key: string): T | undefined;

    /**
     * Vérifie si une clé existe dans le cache
     * @param key Clé à vérifier
     * @returns true si la clé existe
     */
    has(key: string): boolean;

    /**
     * Supprime un élément du cache
     * @param key Clé de l'élément à supprimer
     * @returns true si la suppression a réussi
     */
    remove(key: string): boolean;

    /**
     * Efface tout le contenu du cache
     */
    clear(): void;
}