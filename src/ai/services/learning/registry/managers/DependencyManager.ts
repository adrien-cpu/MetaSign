/**
 * @file src/ai/services/learning/registry/managers/DependencyManager.ts
 * @description Gestionnaire de dépendances entre services
 * @module DependencyManager
 * @requires @/ai/services/learning/registry/interfaces/ServiceDescription
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * Ce module gère les dépendances entre les services enregistrés dans le registre
 * de services d'apprentissage.
 */

import { ServiceDescription } from '../interfaces/ServiceDescription';

/**
 * Gestionnaire de dépendances entre services
 * 
 * @class DependencyManager
 * @description Gère les relations de dépendance entre services et vérifie
 * si les dépendances sont satisfaites.
 */
export class DependencyManager {
    /**
     * Carte des dépendances (serviceId -> array of dependencyIds)
     * @private
     */
    private dependencies: Map<string, string[]>;

    /**
     * Constructeur du gestionnaire de dépendances
     * 
     * @constructor
     */
    constructor() {
        this.dependencies = new Map<string, string[]>();
    }

    /**
     * Ajoute des dépendances pour un service
     * 
     * @method addDependencies
     * @param {string} serviceId - Identifiant du service
     * @param {string[]} dependencyIds - Identifiants des dépendances
     * @public
     */
    public addDependencies(serviceId: string, dependencyIds: string[]): void {
        this.dependencies.set(serviceId, [...dependencyIds]);
    }

    /**
     * Supprime les dépendances d'un service
     * 
     * @method removeDependencies
     * @param {string} serviceId - Identifiant du service
     * @public
     */
    public removeDependencies(serviceId: string): void {
        this.dependencies.delete(serviceId);
    }

    /**
     * Vérifie si les dépendances d'un service sont satisfaites
     * 
     * @method areDependenciesSatisfied
     * @param {string} serviceId - Identifiant du service
     * @param {Map<string, ServiceDescription>} services - Services disponibles
     * @returns {boolean} Vrai si toutes les dépendances sont satisfaites
     * @public
     */
    public areDependenciesSatisfied(
        serviceId: string,
        services: Map<string, ServiceDescription>
    ): boolean {
        // Si le service n'a pas de dépendances, elles sont satisfaites par défaut
        if (!this.dependencies.has(serviceId)) {
            return true;
        }

        const dependencies = this.dependencies.get(serviceId)!;

        // Vérifier si toutes les dépendances sont disponibles
        return dependencies.every(dependencyId => services.has(dependencyId));
    }

    /**
     * Obtient les dépendances d'un service
     * 
     * @method getDependencies
     * @param {string} serviceId - Identifiant du service
     * @returns {string[] | undefined} Liste des dépendances ou undefined
     * @public
     */
    public getDependencies(serviceId: string): string[] | undefined {
        return this.dependencies.get(serviceId);
    }

    /**
     * Vérifie s'il existe des dépendances circulaires
     * 
     * @method hasCircularDependencies
     * @returns {boolean} Vrai s'il existe des dépendances circulaires
     * @public
     */
    public hasCircularDependencies(): boolean {
        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        // Vérifier chaque service
        for (const serviceId of this.dependencies.keys()) {
            if (this.isCircularDependency(serviceId, visited, recursionStack)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Vérifie si un service a des dépendances circulaires
     * 
     * @method isCircularDependency
     * @param {string} serviceId - Identifiant du service à vérifier
     * @param {Set<string>} visited - Ensemble des services déjà visités
     * @param {Set<string>} recursionStack - Pile de récursion
     * @returns {boolean} Vrai si une dépendance circulaire est détectée
     * @private
     */
    private isCircularDependency(
        serviceId: string,
        visited: Set<string>,
        recursionStack: Set<string>
    ): boolean {
        // Si le service a déjà été visité et n'a pas de dépendances circulaires
        if (visited.has(serviceId) && !recursionStack.has(serviceId)) {
            return false;
        }

        // Si le service est déjà dans la pile de récursion, c'est une dépendance circulaire
        if (recursionStack.has(serviceId)) {
            return true;
        }

        // Marquer le service comme visité et l'ajouter à la pile de récursion
        visited.add(serviceId);
        recursionStack.add(serviceId);

        // Vérifier les dépendances du service
        const dependencies = this.dependencies.get(serviceId);
        if (dependencies) {
            for (const dependencyId of dependencies) {
                if (this.isCircularDependency(dependencyId, visited, recursionStack)) {
                    return true;
                }
            }
        }

        // Retirer le service de la pile de récursion
        recursionStack.delete(serviceId);

        return false;
    }

    /**
     * Obtient tous les services qui dépendent d'un service donné
     * 
     * @method getDependents
     * @param {string} serviceId - Identifiant du service
     * @returns {string[]} Services dépendants
     * @public
     */
    public getDependents(serviceId: string): string[] {
        const dependents: string[] = [];

        for (const [id, deps] of this.dependencies.entries()) {
            if (deps.includes(serviceId)) {
                dependents.push(id);
            }
        }

        return dependents;
    }

    /**
     * Obtient un ordre de résolution des dépendances
     * 
     * @method getResolutionOrder
     * @returns {string[]} Ordre de résolution des dépendances
     * @public
     */
    public getResolutionOrder(): string[] {
        const result: string[] = [];
        const visited = new Set<string>();

        // Tri topologique
        for (const serviceId of this.dependencies.keys()) {
            this.topologicalSort(serviceId, visited, result);
        }

        // L'ordre doit être inversé
        return result.reverse();
    }

    /**
     * Effectue un tri topologique
     * 
     * @method topologicalSort
     * @param {string} serviceId - Identifiant du service
     * @param {Set<string>} visited - Ensemble des services déjà visités
     * @param {string[]} result - Résultat du tri
     * @private
     */
    private topologicalSort(
        serviceId: string,
        visited: Set<string>,
        result: string[]
    ): void {
        // Si le service a déjà été visité
        if (visited.has(serviceId)) {
            return;
        }

        // Marquer le service comme visité
        visited.add(serviceId);

        // Visiter les dépendances du service
        const dependencies = this.dependencies.get(serviceId);
        if (dependencies) {
            for (const dependencyId of dependencies) {
                this.topologicalSort(dependencyId, visited, result);
            }
        }

        // Ajouter le service au résultat
        result.push(serviceId);
    }
}