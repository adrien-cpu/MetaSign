/**
 * Classe pour représenter l'état de santé du système
 */
export class SystemStatus {
    /**
     * Horodatage de la dernière vérification d'état
     */
    public timestamp: number;

    /**
     * État global de santé du système
     */
    public healthy: boolean;

    /**
     * État de santé par composant
     */
    private components: Map<string, boolean>;

    /**
     * Raisons des états non-sains par composant
     */
    private reasons: Map<string, string>;

    /**
     * Métriques de santé par composant
     */
    private metrics: Map<string, Record<string, number>>;

    /**
     * Crée une nouvelle instance de SystemStatus
     */
    constructor() {
        this.timestamp = Date.now();
        this.healthy = true;
        this.components = new Map<string, boolean>();
        this.reasons = new Map<string, string>();
        this.metrics = new Map<string, Record<string, number>>();
    }

    /**
     * Ajoute un composant à l'état du système
     * @param componentId Identifiant du composant
     * @param isHealthy État de santé du composant
     * @param reason Raison de l'état non-sain (optionnel)
     * @param metrics Métriques du composant (optionnel)
     */
    public addComponent(
        componentId: string,
        isHealthy: boolean,
        reason?: string,
        metrics?: Record<string, number>
    ): void {
        this.components.set(componentId, isHealthy);

        if (!isHealthy) {
            this.healthy = false;

            if (reason) {
                this.reasons.set(componentId, reason);
            }
        }

        if (metrics) {
            this.metrics.set(componentId, { ...metrics });
        }
    }

    /**
     * Récupère l'état de santé d'un composant
     * @param componentId Identifiant du composant
     * @returns État de santé du composant ou undefined si le composant n'existe pas
     */
    public getComponentHealth(componentId: string): boolean | undefined {
        return this.components.get(componentId);
    }

    /**
     * Récupère la raison de l'état non-sain d'un composant
     * @param componentId Identifiant du composant
     * @returns Raison de l'état non-sain ou undefined si le composant est sain ou n'existe pas
     */
    public getReason(componentId: string): string | undefined {
        return this.reasons.get(componentId);
    }

    /**
     * Récupère les métriques d'un composant
     * @param componentId Identifiant du composant
     * @returns Métriques du composant ou undefined si le composant n'a pas de métriques
     */
    public getMetrics(componentId: string): Record<string, number> | undefined {
        return this.metrics.get(componentId);
    }

    /**
     * Récupère tous les composants avec leur état de santé
     * @returns Carte des composants avec leur état de santé
     */
    public getAllComponents(): Map<string, boolean> {
        return new Map(this.components);
    }

    /**
     * Récupère toutes les raisons des états non-sains
     * @returns Carte des raisons des états non-sains
     */
    public getAllReasons(): Map<string, string> {
        return new Map(this.reasons);
    }

    /**
     * Récupère toutes les métriques
     * @returns Carte des métriques par composant
     */
    public getAllMetrics(): Map<string, Record<string, number>> {
        return new Map(this.metrics);
    }

    /**
     * Formate l'état du système en objet JSON
     * @returns Objet JSON représentant l'état du système
     */
    public toJson(): Record<string, unknown> {
        const componentsObj: Record<string, boolean> = {};
        const reasonsObj: Record<string, string> = {};
        const metricsObj: Record<string, Record<string, number>> = {};

        this.components.forEach((value, key) => {
            componentsObj[key] = value;
        });

        this.reasons.forEach((value, key) => {
            reasonsObj[key] = value;
        });

        this.metrics.forEach((value, key) => {
            metricsObj[key] = value;
        });

        return {
            timestamp: this.timestamp,
            healthy: this.healthy,
            components: componentsObj,
            reasons: reasonsObj,
            metrics: metricsObj
        };
    }
}