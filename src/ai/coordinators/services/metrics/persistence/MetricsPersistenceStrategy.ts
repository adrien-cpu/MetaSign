// src/ai/coordinators/services/metrics/persistence/MetricsPersistenceStrategy.ts
import { StoredMetricValue } from '../../../types/metrics.types';

export interface MetricsPersistenceStrategy {
    persist(namespace: string, metrics: Map<string, StoredMetricValue[]>): Promise<void>;
    load(namespace: string): Promise<Map<string, StoredMetricValue[]>>;
}

export class FileStoragePersistence implements MetricsPersistenceStrategy {
    private readonly filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    public async persist(namespace: string, metrics: Map<string, StoredMetricValue[]>): Promise<void> {
        // Implémentation de la persistance fichier
        const serialized = this.serializeMetrics(metrics);
        // TODO: Écrire dans le fichier this.filePath pour le namespace donné
        console.log(`Persisting metrics for ${namespace}:`, serialized.length, 'chars');
    }

    public async load(namespace: string): Promise<Map<string, StoredMetricValue[]>> {
        // Implémentation du chargement depuis un fichier
        // TODO: Lire depuis le fichier this.filePath pour le namespace donné
        console.log(`Loading metrics for ${namespace} from ${this.filePath}`);
        // const fileContent = await fs.readFile(this.filePath, 'utf-8');
        // return this.deserializeMetrics(fileContent);
        return new Map();
    }

    private serializeMetrics(metrics: Map<string, StoredMetricValue[]>): string {
        return JSON.stringify(Array.from(metrics.entries()));
    }

}