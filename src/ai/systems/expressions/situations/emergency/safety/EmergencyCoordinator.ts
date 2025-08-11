// src/ai/systems/expressions/situations/emergency/safety/EmergencyCoordinator.ts

import {
    EmergencyContext,
    RouteUpdateRequest,
    RouteUpdateResponse,
    SystemChange,
    OptimalRoutesRequest,
    OptimalRoutesResponse,
    Route,
    SystemState,
    RouteStatus,
    EnvironmentalFactors
} from './emergency.types';

// Type local pour ZoneState qui est utilisé mais pas exporté
interface ZoneState {
    id: string;
    population: number;
    density: 'LOW' | 'MEDIUM' | 'HIGH';
    hazardLevel: number;
    connectedRoutes: string[];
    evacuationRoutes?: string[]; // propriété ajoutée par notre implémentation
    lastUpdated?: number; // propriété ajoutée par notre implémentation
}

export class EmergencyCoordinator {
    private state: SystemState;

    constructor() {
        this.state = {
            routes: new Map(),
            zones: new Map(),
            lastUpdate: Date.now()
        };
    }

    async updateEvacuationRoute(
        request: RouteUpdateRequest,
        context: EmergencyContext
    ): Promise<RouteUpdateResponse> {
        const startTime = performance.now();

        try {
            const route = this.state.routes.get(request.route_id) || this.createNewRoute(request);

            route.status = request.status;
            route.alternatives = request.alternatives;

            this.state.routes.set(request.route_id, route);
            await this.propagateRouteUpdate(route, context);

            return {
                update_success: true,
                propagation_time: performance.now() - startTime
            };
        } catch (error) {
            console.error('Route update failed:', error);
            return {
                update_success: false,
                propagation_time: performance.now() - startTime
            };
        }
    }

    async updateSystemStatus(update: { time: number; changes: SystemChange[] }): Promise<void> {
        for (const change of update.changes) {
            switch (change.type) {
                case 'ROUTE':
                    await this.handleRouteChange(change);
                    break;
                case 'POPULATION':
                    await this.handlePopulationChange(change);
                    break;
                case 'HAZARD':
                    await this.handleHazardChange(change);
                    break;
            }
        }
        this.state.lastUpdate = update.time;
    }

    async calculateOptimalRoutes(request: OptimalRoutesRequest): Promise<OptimalRoutesResponse> {
        const startTime = performance.now();
        const routes = await this.computeOptimalRoutes(request);

        return {
            routes,
            calculationTime: performance.now() - startTime,
            resourceUsage: {
                memoryUsage: process.memoryUsage().heapUsed,
                cpuUsage: process.cpuUsage().user / 1000000
            }
        };
    }

    private createNewRoute(request: RouteUpdateRequest): {
        id: string;
        status: RouteStatus;
        capacity: number;
        currentLoad: number;
        alternatives: string[];
    } {
        return {
            id: request.route_id,
            status: request.status,
            capacity: 100, // Valeur par défaut
            currentLoad: 0,
            alternatives: request.alternatives
        };
    }

    private async propagateRouteUpdate(
        route: { id: string; status: RouteStatus; alternatives: string[] },
        context: EmergencyContext
    ): Promise<void> {
        // Simuler un délai de propagation
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50));

        // Mettre à jour les zones connectées
        for (const zoneId of this.findConnectedZones(route.id)) {
            const zone = this.state.zones.get(zoneId);
            if (zone) {
                await this.recalculateZoneEvacuationPaths(zone, context);
            }
        }
    }

    private findConnectedZones(routeId: string): string[] {
        return Array.from(this.state.zones.values())
            .filter(zone => zone.connectedRoutes.includes(routeId))
            .map(zone => zone.id);
    }

    private async recalculateZoneEvacuationPaths(
        zone: ZoneState,
        context: EmergencyContext
    ): Promise<void> {
        // Implémentation du recalcul des chemins d'évacuation
        const simulationDelay = Math.min(30, zone.population / 100 * 10); // Délai proportionnel à la population
        await new Promise(resolve => setTimeout(resolve, simulationDelay));

        // Récupérer les routes disponibles pour l'évacuation
        const availableRoutes = Array.from(this.state.routes.values())
            .filter(route => route.status === 'OPEN')
            .filter(route => {
                // Vérifier si la route est adaptée au contexte actuel
                const isHazardCompatible = context.severity <= zone.hazardLevel + 1;
                const hasCapacity = route.currentLoad < route.capacity;
                return isHazardCompatible && hasCapacity;
            });

        // Mise à jour du niveau de danger en fonction du contexte
        if (this.hasLowVisibility(context.environmentalFactors) && zone.hazardLevel < 3) {
            zone.hazardLevel++; // Augmenter le niveau de danger en cas de visibilité réduite
        }

        // Mise à jour de la zone avec les nouvelles informations de chemin
        const updatedZone: ZoneState = {
            ...zone,
            evacuationRoutes: availableRoutes.map(route => route.id),
            lastUpdated: Date.now()
        };

        // Sauvegarder la zone mise à jour
        this.state.zones.set(zone.id, updatedZone);
    }

    // Méthode utilitaire pour vérifier si la visibilité est faible dans les facteurs environnementaux
    private hasLowVisibility(factors: EnvironmentalFactors): boolean {
        return factors.visibility === 'low' || factors.visibility === 'LOW';
    }

    private async handleRouteChange(change: SystemChange): Promise<void> {
        const route = this.state.routes.get(change.location);
        if (route) {
            Object.assign(route, change.details);
            this.state.routes.set(change.location, route);
        }
    }

    private async handlePopulationChange(change: SystemChange): Promise<void> {
        const zone = this.state.zones.get(change.location);
        if (zone) {
            Object.assign(zone, change.details);
            this.state.zones.set(change.location, zone);
        }
    }

    private async handleHazardChange(change: SystemChange): Promise<void> {
        const zone = this.state.zones.get(change.location);
        if (zone) {
            zone.hazardLevel = (change.details as { level: number }).level;
            this.state.zones.set(change.location, zone);
        }
    }

    private async computeOptimalRoutes(request: OptimalRoutesRequest): Promise<Route[]> {
        // Simulation de calcul d'itinéraire
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

        return Array(request.exits).fill(null).map((_, index) => ({
            id: `ROUTE_${index}`,
            path: [`NODE_${index}_START`, `NODE_${index}_MID`, `NODE_${index}_END`],
            capacity: Math.floor(request.population / request.exits),
            estimatedEvacuationTime: Math.random() * 300 + 100
        }));
    }
}