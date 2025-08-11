/**
 * @file src/ai/api/distributed/monitoring/metrics/MetricsBuffer.ts
 * Tampon circulaire pour stocker les métriques
 * Maintient un historique limité des métriques pour analyse
 */
export class MetricsBuffer<T> {
    private buffer: T[] = [];
    private readonly maxSize: number;

    /**
     * Crée un nouveau tampon de métriques
     * @param maxSize Taille maximale du tampon
     */
    constructor(maxSize: number) {
        this.maxSize = maxSize;
    }

    /**
     * Ajoute une métrique au tampon
     * Si le tampon est plein, la plus ancienne métrique est supprimée
     * @param metric Métrique à ajouter
     */
    public add(metric: T): void {
        this.buffer.push(metric);
        if (this.buffer.length > this.maxSize) {
            this.buffer.shift();
        }
    }

    /**
     * Récupère toutes les métriques du tampon
     * @returns Tableau de toutes les métriques
     */
    public getAll(): ReadonlyArray<T> {
        return [...this.buffer];
    }

    /**
     * Récupère les n métriques les plus récentes
     * @param count Nombre de métriques à récupérer
     * @returns Tableau des n métriques les plus récentes
     */
    public getRecent(count: number): ReadonlyArray<T> {
        const start = Math.max(0, this.buffer.length - count);
        return this.buffer.slice(start);
    }

    /**
     * Récupère la dernière métrique ajoutée
     * @returns La dernière métrique ou undefined si le tampon est vide
     */
    public getLast(): T | undefined {
        if (this.buffer.length === 0) {
            return undefined;
        }
        return this.buffer[this.buffer.length - 1];
    }

    /**
     * Vide le tampon
     */
    public clear(): void {
        this.buffer = [];
    }

    /**
     * Récupère le nombre de métriques dans le tampon
     * @returns Nombre de métriques
     */
    public size(): number {
        return this.buffer.length;
    }
}