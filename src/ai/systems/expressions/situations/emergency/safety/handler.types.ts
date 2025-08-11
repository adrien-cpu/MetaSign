// src/ai/systems/expressions/situations/emergency/safety/handler.types.ts

export interface EvacuationSituation {
    type: string;
    urgency: number;
    affected_areas: string[];
    hazards: Hazard[];
}

export interface EvacuationContext {
    environment: Environment;
    population: Population;
    resources: EvacuationResources;
    constraints: EvacuationConstraints;
}

export interface Hazard {
    type: string;
    severity: number;
    location: string;
    spread_rate?: number;
}

export interface Environment {
    type: string;
    layout: LayoutInfo;
    conditions: EnvironmentConditions;
}

interface LayoutInfo {
    floors: number;
    exits: ExitPoint[];
    obstacles: Obstacle[];
}

interface ExitPoint {
    id: string;
    location: string;
    capacity: number;
    accessibility: string[];
}

interface Obstacle {
    type: string;
    location: string;
    severity: number;
}

export interface Population {
    total: number;
    distribution: Record<string, number>;
    special_needs: SpecialNeeds[];
}

interface SpecialNeeds {
    type: string;
    count: number;
    requirements: string[];
}

export interface EvacuationResources {
    personnel: Personnel[];
    equipment: Equipment[];
    routes: EvacuationRoute[];
}

interface Personnel {
    role: string;
    count: number;
    location: string;
}

interface Equipment {
    type: string;
    count: number;
    location: string;
}

interface EvacuationRoute {
    id: string;
    path: string[];
    capacity: number;
    accessibility: string[];
}

export interface EvacuationConstraints {
    time_limits: TimeLimits;
    capacity_limits: CapacityLimits;
    accessibility_requirements: string[];
}

interface TimeLimits {
    total_evacuation: number;
    zone_clearance: number;
}

interface CapacityLimits {
    route_capacity: number;
    gathering_points: number;
}

export interface EvacuationResponse {
    status: 'completed' | 'in_progress' | 'failed';
    phases: PhaseResults;
    metrics: EvacuationMetrics;
}

interface PhaseResults {
    initialization: InitializationResult;
    signaling: SignalingResult;
    groupOrganization: GroupOrganizationResult;
    movement: MovementResult;
    assembly: AssemblyResult;
}

export interface InitializationResult {
    status: string;
    hazard_assessment: HazardAssessment;
    resource_allocation: ResourceAllocation;
}

interface HazardAssessment {
    identified_hazards: Hazard[];
    risk_levels: Record<string, number>;
}

interface ResourceAllocation {
    assigned_personnel: Personnel[];
    assigned_equipment: Equipment[];
}

export interface SignalingResult {
    status: string;
    coverage: SignalCoverage;
    effectiveness: SignalEffectiveness;
}

interface SignalCoverage {
    zones_reached: string[];
    confirmation_rate: number;
}

interface SignalEffectiveness {
    comprehension_rate: number;
    response_time: number;
}

export interface GroupOrganizationResult {
    status: string;
    groups: EvacuationGroup[];
    distribution: GroupDistribution;
}

interface EvacuationGroup {
    id: string;
    size: number;
    composition: string[];
    assigned_route: string;
}

interface GroupDistribution {
    by_route: Record<string, number>;
    by_type: Record<string, number>;
}

export interface MovementResult {
    status: string;
    progress: RouteProgress[];
    bottlenecks: Bottleneck[];
}

interface RouteProgress {
    route_id: string;
    completion: number;
    current_load: number;
}

interface Bottleneck {
    location: string;
    severity: number;
    affected_routes: string[];
}

export interface AssemblyResult {
    status: string;
    headcount: HeadcountInfo;
    organization: AssemblyOrganization;
}

interface HeadcountInfo {
    total_present: number;
    missing: number;
    by_zone: Record<string, number>;
}

interface AssemblyOrganization {
    zones: AssemblyZone[];
    services: EmergencyService[];
}

interface AssemblyZone {
    id: string;
    capacity: number;
    occupancy: number;
    status: string;
}

interface EmergencyService {
    type: string;
    location: string;
    status: string;
}

export interface EvacuationMetrics {
    total_time: number;
    evacuation_rate: number;
    safety_score: number;
    efficiency_metrics: EfficiencyMetrics;
}

interface EfficiencyMetrics {
    route_utilization: number;
    resource_efficiency: number;
    coordination_score: number;
}

interface EnvironmentConditions {
    lighting: string;
    visibility: string;
    air_quality: string;
    obstacles: string[];
}