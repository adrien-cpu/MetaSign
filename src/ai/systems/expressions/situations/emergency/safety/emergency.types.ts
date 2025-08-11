// src/ai/systems/expressions/situations/emergency/safety/emergency.types.ts

export interface EmergencyContext {
    timeStamp: number;
    location: string;
    severity: number;
    environmentalFactors: EnvironmentalFactors;
}

export interface EnvironmentalFactors {
    visibility: string;
    noise: string;
    obstacles: string[];
}

export interface RouteUpdateRequest {
    route_id: string;
    status: RouteStatus;
    alternatives: string[];
}

export interface RouteUpdateResponse {
    update_success: boolean;
    propagation_time: number;
}

export interface SystemChange {
    type: ChangeType;
    location: string;
    details: Record<string, unknown>;
    timestamp: number;
}

export type ChangeType = 'ROUTE' | 'POPULATION' | 'HAZARD';

export interface OptimalRoutesRequest {
    start_points: string[];
    exits: number;
    population: number;
    constraints: RouteConstraints;
}

export interface RouteConstraints {
    max_distance: number;
    max_time: number;
    accessibility: string[];
}

export interface OptimalRoutesResponse {
    routes: Route[];
    calculationTime: number;
    resourceUsage: ResourceUsage;
}

export interface Route {
    id: string;
    path: string[];
    capacity: number;
    estimatedEvacuationTime: number;
}

export interface ResourceUsage {
    memoryUsage: number;
    cpuUsage: number;
}

export type RouteStatus = 'OPEN' | 'BLOCKED' | 'CONGESTED';

interface RouteState {
    id: string;
    status: RouteStatus;
    capacity: number;
    currentLoad: number;
    alternatives: string[];
}

interface ZoneState {
    id: string;
    population: number;
    density: 'LOW' | 'MEDIUM' | 'HIGH';
    hazardLevel: number;
    connectedRoutes: string[];
}

export interface SystemState {
    routes: Map<string, RouteState>;
    zones: Map<string, ZoneState>;
    lastUpdate: number;
}