/**
 * Types et interfaces pour le système d'alertes
 */

/**
 * Types d'alertes supportés par le système
 */
export enum AlertType {
    PERFORMANCE = 'performance',
    SECURITY = 'security',
    RESOURCE = 'resource',
    AVAILABILITY = 'availability',
    ERROR = 'error',
    SYSTEM = 'system'
}

/**
 * Niveaux de sévérité des alertes
 */
export enum AlertSeverity {
    LOW = 0,
    MEDIUM = 1,
    HIGH = 2,
    CRITICAL = 3
}

/**
 * Interface de base pour une alerte
 */
export interface Alert {
    id: string;
    type: AlertType;
    source: string;
    timestamp: Date;
    message: string;
    data?: Record<string, unknown>;
    consecutiveCount?: number;
}

/**
 * Alerte enrichie avec des informations contextuelles
 */
export interface EnrichedAlert extends Alert {
    context: Record<string, unknown>; // définition explicite sans undefined
    severity: AlertSeverity;
    relatedAlerts: Alert[];
}

/**
 * Alerte après traitement
 */
export interface ProcessedAlert extends EnrichedAlert {
    processed: boolean;
    processingTime: number;
    actionRequired?: boolean;
    suggestedActions?: string[];
}

/**
 * Configuration des seuils d'escalade par type d'alerte
 */
export interface EscalationThresholds {
    [AlertType.PERFORMANCE]: number;
    [AlertType.SECURITY]: number;
    [AlertType.RESOURCE]: number;
    [AlertType.AVAILABILITY]: number;
    [AlertType.ERROR]: number;
    [AlertType.SYSTEM]: number;
}

/**
 * Interface pour les processeurs d'alertes
 */
export interface AlertProcessor {
    process(alert: EnrichedAlert): Promise<ProcessedAlert>;
    canHandle(alertType: AlertType): boolean;
}