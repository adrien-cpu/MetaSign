// src/ai/system/expressions/situations/educational/integration/types/index.ts

// Types de base
export type StorageType = 'LOCAL' | 'DISTRIBUTED' | 'CLOUD';
export type StorageLocation = 'MEMORY' | 'DISK' | 'NETWORK';
export type ConnectionType = 'SYNC' | 'ASYNC' | 'HYBRID';
export type ChannelType = 'COMMAND' | 'DATA' | 'EVENT' | 'MONITORING';
export type HealthStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL';
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Interfaces de données d'apprentissage
export interface LearningDataInterface {
    metrics: LearningMetrics;
    history: LearningHistory;
    configuration: LearningConfig;
}

export interface AdaptationDataInterface {
    strategy: AdaptationStrategy;
    history: AdaptationHistory;
    rules: AdaptationRules;
}

export interface AdaptationControl {
    strategy: string;
    parameters: Map<string, unknown>;
    feedback: FeedbackLoop;
}

// Interfaces culturelles
export interface CulturalAlignment {
    context: string;
    adaptations: CulturalAdaptation[];
    validation: CulturalValidation;
}

export interface CommunityIntegration {
    community: string;
    interactions: CommunityInteraction[];
    feedback: CommunityFeedback[];
}

// Interfaces de performance et monitoring
export interface PerformanceMonitoring {
    metrics: MetricCollection;
    analysis: PerformanceAnalysis;
    alerts: AlertSystem;
}

export interface ComponentHealth {
    id: string;
    status: HealthStatus;
    metrics: HealthMetrics;
    lastCheck: Date;
}

export interface SystemHealth {
    overall: HealthStatus;
    components: ComponentHealth[];
    alerts: Alert[];
}

export interface HealthHistory {
    snapshots: HealthSnapshot[];
    events: HealthEvent[];
    trends: HealthTrend[];
}

// Interfaces de métriques et analyse
export interface StatusMetrics {
    performance: number;
    reliability: number;
    availability: number;
    quality: number;
}

export interface PerformanceAnalysis {
    metrics: Map<string, number>;
    trends: AnalysisTrend[];
    recommendations: string[];
    confidence: number;
}

export interface ModalityConfig {
    type: string;
    parameters: Map<string, unknown>;
    validation: {
        rules: string[];
        threshold: number;
    };
}

// Types et interfaces de configuration d'apprentissage
export interface LearningMetrics {
    accuracy: number;
    completion: number;
    understanding: number;
    engagement: number;
}

export interface LearningHistory {
    sessions: LearningSession[];
    progress: ProgressMetric[];
    milestones: Milestone[];
}

export interface LearningConfig {
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    adaptiveMode: boolean;
    customParameters: Map<string, unknown>;
}

// Types et interfaces d'adaptation
export interface AdaptationStrategy {
    triggers: AdaptationTrigger[];
    rules: AdaptationRule[];
    priorities: Map<string, number>;
}

export interface AdaptationHistory {
    adaptations: AdaptationEvent[];
    effectiveness: EffectivenessMetrics[];
    feedback: AdaptationFeedback[];
}

export interface AdaptationRules {
    conditions: RuleCondition[];
    actions: RuleAction[];
    constraints: RuleConstraint[];
}

// Interfaces de validation culturelle
export interface CulturalValidation {
    rules: ValidationRule[];
    context: CulturalContext;
    results: ValidationResult[];
}

export interface CommunityInteraction {
    type: string;
    participants: string[];
    context: InteractionContext;
    outcome: InteractionOutcome;
}

export interface CommunityFeedback {
    source: string;
    content: string;
    rating: number;
    context: FeedbackContext;
}

// Types et interfaces de support
export interface LearningSession {
    id: string;
    startTime: Date;
    endTime: Date;
    activities: Activity[];
    metrics: ActivityMetrics;
}

export interface ProgressMetric {
    timestamp: Date;
    metric: string;
    value: number;
    context: string;
}

export interface Milestone {
    id: string;
    name: string;
    achievements: string[];
    completedDate: Date;
}

export interface AdaptationTrigger {
    condition: string;
    threshold: number;
    action: string;
}

export interface AdaptationEvent {
    type: string;
    timestamp: Date;
    changes: Map<string, unknown>;
}

export interface EffectivenessMetrics {
    adaptationId: string;
    impact: number;
    confidence: number;
}

export interface AdaptationFeedback {
    success: boolean;
    comments: string;
    suggestions: string[];
}

export interface RuleCondition {
    field: string;
    operator: string;
    value: unknown;
}

export interface RuleAction {
    type: string;
    parameters: Map<string, unknown>;
}

export interface RuleConstraint {
    type: string;
    value: unknown;
    priority: number;
}

export interface ValidationRule {
    id: string;
    criteria: string;
    importance: number;
}

export interface CulturalContext {
    region: string;
    language: string;
    customs: string[];
}

export interface ValidationResult {
    ruleId: string;
    passed: boolean;
    notes: string[];
}

export interface InteractionContext {
    setting: string;
    purpose: string;
    duration: number;
}

export interface InteractionOutcome {
    success: boolean;
    feedback: string;
    nextSteps: string[];
}

export interface FeedbackContext {
    topic: string;
    environment: string;
    relevance: number;
}

export interface ActivityMetrics {
    duration: number;
    accuracy: number;
    completion: number;
    engagement: number;
}

export interface MetricCollection {
    values: Map<string, number>;
    timestamp: Date;
    metadata: Map<string, unknown>;
}

export interface AlertSystem {
    rules: AlertRule[];
    notifications: NotificationConfig[];
    history: AlertHistory;
}

export interface Alert {
    id: string;
    type: string;
    message: string;
    severity: string;
    timestamp: Date;
}

export interface HealthMetrics {
    performance: number;
    reliability: number;
    resources: ResourceUsage;
}

export interface HealthSnapshot {
    timestamp: Date;
    status: HealthStatus;
    metrics: HealthMetrics;
}

export interface HealthEvent {
    type: string;
    timestamp: Date;
    description: string;
    impact: string;
}

export interface HealthTrend {
    metric: string;
    values: number[];
    period: DateRange;
}

export interface AnalysisTrend {
    metric: string;
    direction: 'INCREASING' | 'STABLE' | 'DECREASING';
    confidence: number;
}

export interface CulturalAdaptation {
    type: string;
    parameters: Map<string, unknown>;
    validation: ValidationResult;
}

// Interfaces utilitaires
export interface DateRange {
    start: Date;
    end: Date;
    duration?: number;
}

export interface ResourceUsage {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
}

// Interfaces de feedback et monitoring
export interface FeedbackLoop {
    input: FeedbackInput;
    processing: FeedbackProcessing;
    output: FeedbackOutput;
    status: FeedbackStatus;
}

export interface AdaptationRule {
    id: string;
    conditions: string[];
    actions: string[];
    priority: number;
    enabled: boolean;
}

export interface Activity {
    id: string;
    type: ActivityType;
    startTime: Date;
    endTime: Date;
    status: ActivityStatus;
    metrics: ActivityMetrics;
}

export type ActivityType =
    | 'LEARNING'
    | 'PRACTICE'
    | 'ASSESSMENT'
    | 'REVIEW'
    | 'FEEDBACK';

export type ActivityStatus =
    | 'NOT_STARTED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'PAUSED'
    | 'ABANDONED';

export interface AlertRule {
    id: string;
    condition: string;
    severity: string;
    action: string;
    threshold: number;
}

export interface NotificationConfig {
    channels: NotificationChannel[];
    priority: NotificationPriority;
    throttling: {
        maxPerMinute: number;
        maxPerHour: number;
    };
    templates: Map<string, string>;
}

export interface AlertHistory {
    alerts: Alert[];
    resolutions: AlertResolution[];
    trends: AlertTrend[];
}

export interface AlertResolution {
    alertId: string;
    timestamp: Date;
    action: string;
    result: string;
}

export interface AlertTrend {
    type: string;
    frequency: number;
    period: string;
    severity: string;
}

export interface FeedbackInput {
    source: string;
    data: unknown;
    timestamp: Date;
    context: string;
}

export interface FeedbackProcessing {
    steps: ProcessingStep[];
    validation: ValidationRule[];
    transformation: TransformationRule[];
}

export interface FeedbackOutput {
    destination: string;
    format: string;
    data: unknown;
    metadata: Map<string, unknown>;
}

export interface FeedbackStatus {
    state: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    progress: number;
    errors: string[];
}

export interface ProcessingStep {
    type: string;
    config: Map<string, unknown>;
    order: number;
}

export interface TransformationRule {
    input: string;
    output: string;
    condition: string;
}

export interface NotificationChannel {
    type: 'EMAIL' | 'SMS' | 'WEBHOOK' | 'INTERNAL';
    endpoint: string;
    credentials?: {
        username?: string;
        apiKey?: string;
    };
    enabled: boolean;
}