// src/ai/utils/Observable.ts

/**
 * Interface pour les objets qui souhaitent observer les changements d'un Observable
 * @template T Type des données transmises lors des notifications
 */
export interface Observer<T> {
    /**
     * Méthode appelée lorsque l'Observable notifie un changement
     * @param data Données associées à la notification
     */
    update(data: T): void;
}

/**
 * Classe implémentant le patron de conception Observable
 * Permet la notification à plusieurs observateurs lorsqu'un changement se produit
 * @template T Type des données transmises lors des notifications
 */
export class Observable<T> {
    /**
     * Utilisation d'un Set pour une meilleure performance
     * - Évite les doublons automatiquement
     * - Opérations d'ajout/suppression en O(1) au lieu de O(n)
     */
    private readonly observers = new Set<Observer<T>>();

    /**
     * Ajoute un observateur à la liste
     * @param observer Observateur à ajouter
     * @returns this pour permettre le chaînage des méthodes
     */
    public addObserver(observer: Observer<T>): this {
        if (!observer || typeof observer.update !== 'function') {
            throw new Error('Observer invalide: doit avoir une méthode update');
        }
        this.observers.add(observer);
        return this;
    }

    /**
     * Supprime un observateur de la liste
     * @param observer Observateur à supprimer
     * @returns true si l'observateur a été trouvé et supprimé, false sinon
     */
    public removeObserver(observer: Observer<T>): boolean {
        return this.observers.delete(observer);
    }

    /**
     * Vérifie si un observateur est déjà enregistré
     * @param observer Observateur à vérifier
     * @returns true si l'observateur est enregistré, false sinon
     */
    public hasObserver(observer: Observer<T>): boolean {
        return this.observers.has(observer);
    }

    /**
     * Retourne le nombre d'observateurs enregistrés
     * @returns Nombre d'observateurs
     */
    public get observerCount(): number {
        return this.observers.size;
    }

    /**
     * Supprime tous les observateurs
     */
    public clearObservers(): void {
        this.observers.clear();
    }

    /**
     * Notifie tous les observateurs d'un changement
     * Gère les erreurs individuelles pour ne pas interrompre la chaîne de notification
     * @param data Données à transmettre aux observateurs
     * @protected Méthode protégée pour être utilisée par les classes dérivées
     */
    protected notifyObservers(data: T): void {
        // Array.from permet d'avoir une copie figée des observateurs
        // pour éviter les problèmes si un observateur s'ajoute/supprime pendant la notification
        const observersCopy = Array.from(this.observers);

        for (const observer of observersCopy) {
            try {
                observer.update(data);
            } catch (error) {
                console.error('Erreur lors de la notification d\'un observateur:', error);
                // Continue la notification des autres observateurs malgré l'erreur
            }
        }
    }

    /**
     * Crée un proxy pour faciliter l'enregistrement d'une fonction comme observateur
     * @param updateFn Fonction qui sera appelée lors de la notification
     * @returns Un nouvel observateur qui appelle la fonction fournie
     */
    public static createObserver<T>(updateFn: (data: T) => void): Observer<T> {
        return { update: updateFn };
    }
}