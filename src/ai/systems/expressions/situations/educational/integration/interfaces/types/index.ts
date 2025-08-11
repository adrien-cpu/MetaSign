// src/ai/systems/expressions/situations/educational/integration/interfaces/types/index.ts

// Types de base
export type StorageType = 'LOCAL' | 'DISTRIBUTED' | 'CLOUD';
export type StorageLocation = 'MEMORY' | 'DISK' | 'NETWORK';
export type ConnectionType = 'SYNC' | 'ASYNC' | 'HYBRID';
export type ChannelType = 'COMMAND' | 'DATA' | 'EVENT' | 'MONITORING';
export type HealthStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL';
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ProcessStatus = 'IDLE' | 'PROCESSING' | 'ERROR';
export type CommunicationDirection = 'INPUT' | 'OUTPUT' | 'BIDIRECTIONAL';
export type SyncMode = 'ACTIVE' | 'PASSIVE';
export type SyncType = 'FULL' | 'INCREMENTAL' | 'DELTA';
export type UpdateMode = 'PUSH' | 'PULL';
export type NotificationChannelType = 'EMAIL' | 'SMS' | 'WEBHOOK' | 'INTERNAL';
export type EnvironmentMode = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
export type TrendDirection = 'UP' | 'DOWN' | 'STABLE';
export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH';
export type IssueStatus = 'OPEN' | 'CLOSED' | 'IN_PROGRESS';
export type ControlState = 'ACTIVE' | 'INACTIVE' | 'ERROR';

// Type pour remplacer les "any"
export type MetadataValue = string | number | boolean | null | undefined | MetadataObject | MetadataArray;
export interface MetadataObject {
    [key: string]: MetadataValue;
}
export type MetadataArray = MetadataValue[];
export type CommandParams = Record<string, string | number | boolean | null | MetadataObject | MetadataArray>;
export type ResponseData = Record<string, string | number | boolean | null | MetadataObject | MetadataArray>;

// Définition d'Alert manquante
export interface Alert {
    id: string;
    type: string;
    message: string;
    timestamp: Date;
    severity: AlertSeverity;
    sourceComponent: string;
    status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
    metadata: MetadataObject;
}

// Interfaces de base
export interface DateRange {
    start: Date;
    end: Date;
    duration?: number;
}

export interface Issue {
    id: string;
    type: string;
    severity: IssueSeverity;
    description: string;
    timestamp: Date;
    status: IssueStatus;
}

export interface ValidationResult {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
}

// Interfaces de configuration
export interface InterfaceConfiguration {
    environment: EnvironmentConfig;
    requirements: RequirementSet;
    constraints: ConstraintSet;
}

export interface EnvironmentConfig {
    mode: EnvironmentMode;
    region: string;
    features: string[];
}

export interface RequirementSet {
    mandatory: string[];
    optional: string[];
    performance: PerformanceRequirements;
}

export interface ConstraintSet {
    resources: ResourceConstraints;
    timing: TimingConstraints;
    security: SecurityConstraints;
}

export interface PerformanceRequirements {
    minLatency: number;
    maxLatency: number;
    targetThroughput: number;
    resourceLimits: ResourceLimits;
}

export interface ResourceLimits {
    memory: {
        min: number;
        max: number;
        target: number;
    };
    cpu: {
        min: number;
        max: number;
        target: number;
    };
    storage: {
        min: number;
        max: number;
        target: number;
    };
    network: {
        bandwidth: number;
        connections: number;
    };
}

export interface ResourceConstraints {
    maxMemory: number;
    maxCpu: number;
    maxStorage: number;
    maxBandwidth: number;
    maxConcurrentUsers: number;
}

export interface TimingConstraints {
    maxResponseTime: number;
    maxProcessingTime: number;
    maxWaitTime: number;
    deadlines: Map<string, number>;
    schedules: TimeSchedule[];
}

export interface SecurityConstraints {
    encryption: boolean;
    authentication: boolean;
    authorization: boolean;
    auditLevel: string;
    restrictions: SecurityRestriction[];
}

export interface TimeSchedule {
    start: Date;
    end: Date;
    recurrence: string;
    exceptions: Date[];
}

export interface SecurityRestriction {
    type: string;
    scope: string[];
    rules: string[];
}

// Interfaces de statut et état
export interface InterfaceStatus {
    operational: boolean;
    performance: number;
    issues: string[];
    lastChecked: Date;
}

export interface SetupStatus {
    success: boolean;
    errors?: string[];
    warnings?: string[];
}

export interface ManagementStatus {
    efficiency: number;
    reliability: number;
    issues: Issue[];
}

export interface MonitoringStatus {
    health: HealthStatus;
    metrics: PerformanceMetrics;
    issues: Issue[];
}

export interface CoordinationStatus {
    active: boolean;
    health: HealthStatus;
    issues: Issue[];
}

export interface ChannelStatus {
    operational: boolean;
    performance: PerformanceMetrics;
    issues: Issue[];
}

export interface ErrorStatus {
    code: string;
    severity: AlertSeverity;
    active: boolean;
    timestamp: Date;
    resolution?: string;
}

export interface StatusMetrics {
    throughput: number;
    latency: number;
    errors: number;
    availability: number;
}

// Interfaces de monitoring et performance
export interface PerformanceMetrics {
    throughput: number;
    latency: number;
    resourceUsage: ResourceUsage;
    errorRate: number;
}

export interface ResourceUsage {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
}

export interface PerformanceMonitoring {
    metrics: MetricCollection;
    analysis: PerformanceAnalysis;
    alerts: AlertSystem;
}

export interface MetricCollection {
    values: Map<string, number>;
    timestamp: Date;
    metadata: Map<string, MetadataValue>;
}

export interface PerformanceAnalysis {
    scores: Map<string, number>;
    trends: Trend[];
    recommendations: string[];
}

export interface AlertSystem {
    rules: AlertRule[];
    notifications: NotificationConfig;
    history: AlertHistory;
}

// Interfaces système
export interface SystemCoordination {
    connections: SystemConnections;
    interfaces: SystemInterfaces;
    synchronization: SystemSynchronization;
    status: CoordinationStatus;
}

export interface SystemInterfaces {
    data: DataInterface;
    control: ControlInterface;
    monitoring: MonitoringInterface;
}

export interface DataInterface {
    inputs: DataChannel[];
    outputs: DataChannel[];
    processing: DataProcessor[];
}

export interface ControlInterface {
    commands: Command[];
    responses: Response[];
    status: ControlStatus;
}

export interface MonitoringInterface {
    metrics: MetricDefinition[];
    alerts: AlertConfiguration[];
    reporting: ReportingConfiguration;
}

export interface SystemSynchronization {
    state: StateSynchronization;
    events: EventSynchronization;
    data: DataSynchronization;
}

export interface StateSynchronization {
    mode: SyncMode;
    interval: number;
    strategy: SyncStrategy;
}

export interface EventSynchronization {
    queueSize: number;
    timeout: number;
    retryPolicy: RetryPolicy;
}

export interface DataSynchronization {
    method: string;
    frequency: number;
    validation: boolean;
}

// Interfaces de connexion et canal
export interface SystemConnections {
    data: DataConnection[];
    events: EventConnection[];
    control: ControlConnection[];
    status: ConnectionStatus;
}

export interface DataConnection {
    source: string;
    destination: string;
    type: ConnectionType;
    config: ConnectionConfig;
}

export interface EventConnection {
    publisher: string;
    subscriber: string;
    eventTypes: string[];
    config: EventConfig;
}

export interface ControlConnection {
    controller: string;
    controlled: string;
    permissions: PermissionSet;
    config: ControlConfig;
}

export interface CommunicationChannels {
    data: DataChannels;
    events: EventChannels;
    errors: ErrorHandling;
    status: ChannelStatus;
}

export interface DataChannels {
    metrics: MetricChannel[];
    state: StateChannel[];
    control: ControlChannel[];
}

export interface EventChannels {
    system: SystemEventChannel[];
    user: UserEventChannel[];
    error: ErrorEventChannel[];
}

export interface MetricChannel {
    id: string;
    type: string;
    metrics: string[];
    config: ChannelConfig;
}

export interface StateChannel {
    id: string;
    scope: string;
    updates: UpdateConfig;
}

export interface ControlChannel {
    id: string;
    type: ChannelType;
    direction: CommunicationDirection;
    permissions: PermissionSet;
    status: ChannelStatus;
}

export interface SystemEventChannel {
    type: string;
    priority: number;
    handlers: EventHandler[];
}

export interface UserEventChannel {
    userId: string;
    eventTypes: string[];
    priority: number;
    filters: EventFilter[];
    handlers: EventHandler[];
}

export interface ErrorEventChannel {
    errorTypes: string[];
    severity: string[];
    handlers: ErrorHandler[];
    notifications: NotificationConfig[];
}

// Interfaces de gestion d'erreurs
export interface ErrorHandling {
    detection: ErrorDetection;
    recovery: RecoveryMechanism;
    reporting: ErrorReporting;
    status: ErrorStatus;
}

export interface ErrorDetection {
    rules: ErrorRule[];
    patterns: ErrorPattern[];
    thresholds: ErrorThreshold[];
}

export interface RecoveryMechanism {
    strategy: RecoveryStrategy;
    maxAttempts: number;
    timeout: number;
    fallback: FallbackAction;
}

export interface ErrorReporting {
    destinations: string[];
    format: string;
    severity: string;
}

export interface ErrorRule {
    condition: string;
    action: ErrorAction;
    priority: number;
    timeout: number;
}

export interface ErrorPattern {
    sequence: ErrorSequence[];
    frequency: number;
    impact: string;
    resolution: ResolutionStep[];
}

export interface ErrorThreshold {
    metric: string;
    warning: number;
    critical: number;
    period: string;
    actions: ThresholdAction[];
}

// Interfaces de notification et configuration
export interface NotificationConfig {
    channels: NotificationChannel[];
    priority: NotificationPriority;
    throttling: {
        maxPerMinute: number;
        maxPerHour: number;
    };
    templates: Map<string, string>;
}

export interface AlertConfiguration {
    condition: string;
    threshold: number;
    action: string;
}

export interface ReportingConfiguration {
    frequency: string;
    format: string;
    destination: string;
}

// Interfaces de gestion des données
export interface DataManagement {
    resources: SharedResources;
    synchronization: StateSynchronization;
    storage: DataStorage;
    status: ManagementStatus;
}

export interface SharedResources {
    profiles: ResourcePool;
    progress: ResourcePool;
    adaptations: ResourcePool;
}

export interface ResourcePool {
    capacity: number;
    used: number;
    available: number;
}

export interface DataStorage {
    type: StorageType;
    location: StorageLocation;
    capacity: number;
}

// Types et interfaces utilitaires
export interface Command {
    id: string;
    type: string;
    params: CommandParams;
}

export interface Response {
    id: string;
    status: string;
    data: ResponseData;
}

export interface EventFilter {
    type: string;
    condition: string;
    priority: number;
}

export interface EventHandler {
    type: string;
    action: string;
    priority: number;
}

export interface ErrorHandler {
    type: string;
    action: string;
    priority: number;
}

export interface PermissionSet {
    roles: string[];
    actions: string[];
    resources: string[];
}

export interface SyncStrategy {
    type: SyncType;
    schedule: string;
    priority: number;
}

export interface RetryPolicy {
    maxAttempts: number;
    backoff: {
        initial: number;
        multiplier: number;
        maxDelay: number;
    };
    timeout: number;
}

export interface Trend {
    period: string;
    data: number[];
    direction: TrendDirection;
}

// Interfaces alertes et surveillance
export interface AlertRule {
    condition: string;
    threshold: number;
    action: string;
    severity: string;
}

export interface AlertHistory {
    alerts: Alert[];
    resolutions: Resolution[];
    trends: AlertTrend[];
}

export interface Resolution {
    id: string;
    alertId: string;
    action: string;
    timestamp: Date;
    outcome: string;
}

// Interfaces canaux et données
export interface DataChannel {
    id: string;
    type: string;
    protocol: string;
    config: ChannelConfig;
}

export interface DataProcessor {
    id: string;
    type: string;
    config: ProcessorConfig;
    state: ProcessorState;
}

export interface ControlStatus {
    state: ControlState;
    lastUpdate: Date;
    errors: string[];
}

export interface MetricDefinition {
    name: string;
    type: string;
    unit: string;
    description: string;
}

export interface ConnectionStatus {
    active: boolean;
    latency: number;
    errors: number;
    lastChecked: Date;
}

// Interfaces configuration
export interface ConnectionConfig {
    timeout: number;
    retries: number;
    protocol: string;
    parameters: Map<string, MetadataValue>;
}

export interface EventConfig {
    queueSize: number;
    bufferPolicy: string;
    errorHandling: string;
    priority: number;
}

export interface ControlConfig {
    permissions: string[];
    timeout: number;
    validation: boolean;
    fallback: string;
}

export interface ChannelConfig {
    bufferSize: number;
    compression: boolean;
    encryption: boolean;
    priority: number;
}

export interface UpdateConfig {
    mode: UpdateMode;
    interval: number;
    conditions: string[];
}

// Interfaces récupération et action
export interface RecoveryStrategy {
    type: string;
    steps: RecoveryStep[];
    timeout: number;
    maxAttempts: number;
}

export interface FallbackAction {
    type: string;
    parameters: Map<string, MetadataValue>;
    priority: number;
}

export interface ErrorAction {
    type: string;
    severity: string;
    handler: string;
    params: Map<string, MetadataValue>;
}

export interface ErrorSequence {
    pattern: string[];
    timeWindow: number;
    frequency: number;
}

export interface ResolutionStep {
    order: number;
    action: string;
    validation: string;
    timeout: number;
}

export interface ThresholdAction {
    condition: string;
    action: string;
    parameters: Map<string, MetadataValue>;
}

export interface NotificationChannel {
    type: NotificationChannelType;
    endpoint: string;
    credentials?: {
        username?: string;
        apiKey?: string;
    };
    enabled: boolean;
}

// Types de configuration supplémentaires
export interface ProcessorConfig {
    type: string;
    parameters: Map<string, MetadataValue>;
    validation: boolean;
}

export interface ProcessorState {
    status: ProcessStatus;
    lastExecution: Date;
    metrics: Map<string, number>;
}

export interface RecoveryStep {
    action: string;
    parameters: Map<string, MetadataValue>;
    validation: string;
}

export interface AlertTrend {
    type: string;
    frequency: number;
    period: string;
    severity: string;
}