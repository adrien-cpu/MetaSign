/**
 * Tampon circulaire pour stocker des métriques en temps réel
 * @file src/ai/api/distributed/monitoring/metrics/MetricsBuffer.ts
 */

// Définition de l'interface RealtimeMetric ici pour éviter les dépendances problématiques
export interface RealtimeMetric {
    /** Nom de la métrique */
    name: string;

    /** Valeur de la métrique */
    value: number;

    /** Horodatage de la métrique */
    timestamp: number;

    /** Tags associés à la métrique */
    tags?: Map<string, string>;

    /** Unité de la métrique */
    unit?: string;

    /** Description de la métrique */
    description?: string;

    /** Métadonnées supplémentaires */
    metadata?: Record<string, unknown>;
}

/**
 * Options de filtrage pour les métriques
 */
export interface MetricFilterOptions {
    /** Filtre par nom de métrique */
    name?: string | RegExp;

    /** Filtre par plage de temps (début) */
    startTime?: number;

    /** Filtre par plage de temps (fin) */
    endTime?: number;

    /** Filtre par tags */
    tags?: Map<string, string> | Record<string, string>;

    /** Nombre maximum de métriques à retourner */
    limit?: number;
}

/**
 * Résultat d'une agrégation de métriques
 */
export interface MetricAggregationResult {
    /** Nom de la métrique */
    name: string;

    /** Valeur minimale */
    min: number;

    /** Valeur maximale */
    max: number;

    /** Valeur moyenne */
    avg: number;

    /** Nombre de métriques dans l'agrégation */
    count: number;

    /** Dernier horodatage dans l'agrégation */
    lastTimestamp: number;

    /** Valeur médiane */
    median?: number;

    /** Percentiles calculés */
    percentiles?: Record<string, number>;
}

/**
 * Implémentation d'un buffer circulaire pour stocker des données
 */
export class CircularBuffer<T> {
    private items: T[] = [];
    private pointer = 0;

    /**
     * Crée une nouvelle instance de buffer circulaire
     * @param capacity - Capacité maximale du buffer
     */
    constructor(public readonly capacity: number) {
        if (capacity <= 0) {
            throw new Error('La capacité du buffer doit être supérieure à zéro');
        }
    }

    /**
     * Ajoute un élément au buffer, remplaçant le plus ancien si nécessaire
     * @param item - Élément à ajouter
     */
    push(item: T): void {
        if (this.items.length < this.capacity) {
            this.items.push(item);
        } else {
            this.items[this.pointer] = item;
        }

        this.pointer = (this.pointer + 1) % this.capacity;
    }

    /**
     * Convertit le buffer en tableau
     * @returns Tableau des éléments dans l'ordre chronologique
     */
    toArray(): T[] {
        // Réorganiser pour que les éléments soient dans l'ordre chronologique
        const result = [...this.items];

        // Aucune réorganisation nécessaire si le buffer n'est pas plein
        if (this.items.length < this.capacity) {
            return result;
        }

        // Réorganiser quand le buffer est plein pour maintenir l'ordre d'insertion
        return [...result.slice(this.pointer), ...result.slice(0, this.pointer)];
    }

    /**
     * Retourne le nombre d'éléments actuellement dans le buffer
     */
    size(): number {
        return this.items.length;
    }

    /**
     * Vérifie si le buffer est vide
     */
    isEmpty(): boolean {
        return this.items.length === 0;
    }

    /**
     * Vérifie si le buffer est plein
     */
    isFull(): boolean {
        return this.items.length === this.capacity;
    }

    /**
     * Efface tous les éléments du buffer
     */
    clear(): void {
        this.items = [];
        this.pointer = 0;
    }

    /**
     * Obtient le dernier élément ajouté au buffer
     * @returns Le dernier élément ou undefined si le buffer est vide
     */
    getLatest(): T | undefined {
        if (this.isEmpty()) {
            return undefined;
        }

        const index = (this.pointer - 1 + this.capacity) % this.capacity;
        return this.items[index];
    }

    /**
     * Obtient le plus ancien élément du buffer
     * @returns Le plus ancien élément ou undefined si le buffer est vide
     */
    getOldest(): T | undefined {
        if (this.isEmpty()) {
            return undefined;
        }

        return this.isFull() ? this.items[this.pointer] : this.items[0];
    }

    /**
     * Récupère les N éléments les plus récents
     * @param count Nombre d'éléments à récupérer
     * @returns Les éléments les plus récents dans l'ordre chronologique
     */
    getRecent(count: number): T[] {
        if (count <= 0 || this.isEmpty()) {
            return [];
        }

        const allItems = this.toArray();
        return allItems.slice(Math.max(0, allItems.length - count));
    }

    /**
     * Récupère tous les éléments du buffer
     * @returns Tous les éléments du buffer
     */
    getAll(): T[] {
        return this.toArray();
    }

    /**
     * Obtient le dernier élément
     * @returns Le dernier élément ou undefined si le buffer est vide
     */
    getLast(): T | undefined {
        return this.getLatest();
    }
}

/**
 * Buffer spécialisé pour les métriques en temps réel
 * @template T Type de métrique à stocker, doit être compatible avec RealtimeMetric
 */
export class MetricsBuffer<T extends RealtimeMetric = RealtimeMetric> {
    private buffer: CircularBuffer<T>;

    /**
     * Crée un nouveau buffer de métriques
     * @param capacity - Capacité maximale du buffer
     */
    constructor(capacity = 1000) {
        this.buffer = new CircularBuffer<T>(capacity);
    }

    /**
     * Ajoute une métrique au buffer
     * @param metric - Métrique à ajouter
     */
    add(metric: T): void {
        // Validation de base
        if (metric.timestamp === undefined || isNaN(metric.timestamp)) {
            metric.timestamp = Date.now();
        }

        if (typeof metric.value !== 'number' || isNaN(metric.value)) {
            throw new Error('La valeur de la métrique doit être un nombre valide');
        }

        this.buffer.push(metric);
    }

    /**
     * Retourne toutes les métriques dans le buffer
     */
    getAll(): T[] {
        return this.buffer.toArray();
    }

    /**
     * Efface toutes les métriques dans le buffer
     */
    clear(): void {
        this.buffer.clear();
    }

    /**
     * Filtre les métriques selon des critères spécifiques
     * @param options - Options de filtrage
     */
    filter(options: MetricFilterOptions = {}): T[] {
        const metrics = this.buffer.toArray();

        return metrics.filter(metric => {
            // Filtre par nom
            if (options.name) {
                if (options.name instanceof RegExp) {
                    if (!options.name.test(metric.name)) {
                        return false;
                    }
                } else if (metric.name !== options.name) {
                    return false;
                }
            }

            // Filtre par plage de temps
            if (options.startTime !== undefined && metric.timestamp < options.startTime) {
                return false;
            }

            if (options.endTime !== undefined && metric.timestamp > options.endTime) {
                return false;
            }

            // Filtre par tags
            if (options.tags) {
                const metricTags = metric.tags;
                if (!metricTags) {
                    return false;
                }

                if (options.tags instanceof Map) {
                    for (const [key, value] of options.tags) {
                        if (metricTags.get(key) !== value) {
                            return false;
                        }
                    }
                } else {
                    for (const [key, value] of Object.entries(options.tags)) {
                        if (metricTags.get(key) !== value) {
                            return false;
                        }
                    }
                }
            }

            return true;
        }).slice(0, options.limit);
    }

    /**
     * Obtient les métriques d'un intervalle de temps spécifique
     * @param startTime - Début de l'intervalle (timestamp)
     * @param endTime - Fin de l'intervalle (timestamp)
     */
    getInTimeRange(startTime: number, endTime: number): T[] {
        return this.filter({
            startTime,
            endTime
        });
    }

    /**
     * Calcule des agrégations sur les métriques par nom
     * @param options - Options de filtrage pour les métriques à agréger
     * @param percentiles - Percentiles à calculer (ex: [50, 90, 95, 99])
     */
    aggregate(options: MetricFilterOptions = {}, percentiles?: number[]): MetricAggregationResult[] {
        const metrics = this.filter(options);

        // Regrouper par nom
        const metricsByName = new Map<string, T[]>();
        for (const metric of metrics) {
            if (!metricsByName.has(metric.name)) {
                metricsByName.set(metric.name, []);
            }
            metricsByName.get(metric.name)?.push(metric);
        }

        // Calculer les agrégations
        const results: MetricAggregationResult[] = [];

        for (const [name, groupedMetrics] of metricsByName) {
            const values = groupedMetrics.map(m => m.value);

            // Vérifier s'il y a des valeurs avant de procéder
            if (values.length === 0) {
                continue;
            }

            // Trier pour calculer médiane et percentiles
            const sortedValues = [...values].sort((a, b) => a - b);

            const result: MetricAggregationResult = {
                name,
                min: Math.min(...values),
                max: Math.max(...values),
                avg: values.reduce((sum, value) => sum + value, 0) / values.length,
                count: values.length,
                lastTimestamp: Math.max(...groupedMetrics.map(m => m.timestamp))
            };

            // Calculer la médiane si demandée
            if (percentiles && percentiles.includes(50)) {
                result.median = this.calculatePercentile(sortedValues, 50);
            } else {
                result.median = this.calculatePercentile(sortedValues, 50);
            }

            // Calculer les percentiles demandés
            if (percentiles && percentiles.length > 0) {
                result.percentiles = {};
                for (const p of percentiles) {
                    result.percentiles[`p${p}`] = this.calculatePercentile(sortedValues, p);
                }
            }

            results.push(result);
        }

        return results;
    }

    /**
     * Calcule un percentile sur un tableau de valeurs triées
     * @param sortedValues - Tableau de valeurs triées
     * @param percentile - Percentile à calculer (0-100)
     */
    private calculatePercentile(sortedValues: number[], percentile: number): number {
        if (sortedValues.length === 0) {
            return 0;
        }

        if (sortedValues.length === 1) {
            return sortedValues[0];
        }

        const index = (percentile / 100) * (sortedValues.length - 1);
        const lowerIndex = Math.floor(index);
        const fraction = index - lowerIndex;

        if (lowerIndex + 1 < sortedValues.length) {
            return sortedValues[lowerIndex] + fraction * (sortedValues[lowerIndex + 1] - sortedValues[lowerIndex]);
        } else {
            return sortedValues[lowerIndex];
        }
    }

    /**
     * Obtient des statistiques sur le buffer
     */
    getStats(): {
        capacity: number;
        size: number;
        isFull: boolean;
        oldestTimestamp: number | undefined;
        newestTimestamp: number | undefined;
    } {
        const metrics = this.buffer.toArray();
        const oldestTimestamp = metrics.length > 0 ? Math.min(...metrics.map(m => m.timestamp)) : undefined;
        const newestTimestamp = metrics.length > 0 ? Math.max(...metrics.map(m => m.timestamp)) : undefined;

        return {
            capacity: this.buffer.capacity,
            size: this.buffer.size(),
            isFull: this.buffer.isFull(),
            oldestTimestamp,
            newestTimestamp
        };
    }

    /**
     * Obtient la dernière métrique ajoutée
     */
    getLast(): T | undefined {
        return this.buffer.getLatest();
    }

    /**
     * Obtient la plus ancienne métrique dans le buffer
     */
    getOldest(): T | undefined {
        return this.buffer.getOldest();
    }

    /**
     * Renvoie les métriques récentes en fonction d'une fenêtre temporelle
     * @param timeWindowMs Fenêtre temporelle en millisecondes
     * @returns Métriques dans la fenêtre temporelle
     */
    getInTimeWindow(timeWindowMs: number): T[] {
        const now = Date.now();
        return this.filter({
            startTime: now - timeWindowMs,
            endTime: now
        });
    }

    /**
     * Récupère les N éléments les plus récents
     * @param count Nombre d'éléments à récupérer
     * @returns Les N éléments les plus récents
     */
    getRecent(count: number): T[] {
        return this.buffer.getRecent(count);
    }
}