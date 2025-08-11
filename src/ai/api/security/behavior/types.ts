// src/ai/api/security/behavior/types.ts

/**
 * Type de modèle comportemental temporel
 */
export type TemporalPatternType = 'login' | 'activity' | 'session';

/**
 * Niveau de gravité d'une anomalie (type string)
 */
export type AnomalySeverity = 'low' | 'medium' | 'high';

/**
 * Niveau de gravité d'une anomalie (enum)
 */
export enum AnomalyLevel {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH'
}

/**
 * Type de modèle comportemental
 */
export enum BehaviorPatternType {
    TEMPORAL = 'TEMPORAL',
    ACCESS = 'ACCESS',
    RESOURCE = 'RESOURCE',
    INTERACTION = 'INTERACTION',
    GEO = 'GEO'
}

/**
 * Plage horaire pour les modèles temporels
 */
export interface TimeRange {
    /** Heure de début (minutes depuis minuit) */
    start: number;
    /** Heure de fin (minutes depuis minuit) */
    end: number;
    /** Jours de la semaine (0-6, où 0 = dimanche) */
    daysOfWeek: number[];
    /** Poids de cette plage (importance relative) */
    weight: number;
}

/**
 * Événement comportemental
 */
export interface BehaviorEvent {
    /** Identifiant de l'utilisateur */
    userId: string;
    /** Horodatage de l'événement (timestamp Unix en ms) */
    timestamp: number;
    /** Ressource concernée */
    resource: string;
    /** Action effectuée */
    action: string;
    /** Résultat de l'action (succès/échec) */
    result: 'success' | 'failure';
    /** Type d'événement */
    type?: string;
    /** Contexte additionnel */
    context?: Record<string, unknown>;
    /** Adresse IP (optionnelle) */
    ip?: string;
    /** Identifiant de session (optionnel) */
    sessionId?: string;
    /** Permissions de l'utilisateur (optionnelles) */
    permissions?: string[];
}

/**
 * Anomalie comportementale
 */
export interface BehaviorAnomaly {
    /** Identifiant unique de l'anomalie */
    id: string;
    /** Horodatage de l'anomalie (timestamp Unix en ms) */
    timestamp: number;
    /** Identifiant de l'utilisateur */
    userId: string;
    /** Type d'anomalie */
    type: string;
    /** Niveau de gravité (compatible avec les deux versions) */
    severity?: AnomalySeverity;
    level?: AnomalyLevel;
    /** Niveau de confiance (0-1) */
    confidence: number;
    /** Preuve/données justifiant l'anomalie */
    evidence: Record<string, unknown>;
    /** Contexte additionnel (OPTIONNEL - important pour compatibilité) */
    context?: Record<string, unknown>;
    /** Événement ayant déclenché l'anomalie */
    event?: BehaviorEvent;
    /** Score de risque (0-1) */
    riskScore?: number;
}

/**
 * Modèle temporel avancé
 */
export interface TemporalPattern {
    /** Type de modèle temporel */
    type: BehaviorPatternType.TEMPORAL | TemporalPatternType;
    /** Ressource concernée ('*' pour global) */
    resource?: string;
    /** Plages horaires typiques */
    timeRanges?: TimeRange[];
    /** Distribution des heures d'accès (0-23) */
    hourDistribution?: number[];
    /** Distribution des jours de la semaine (0-6) */
    weekdayDistribution?: number[];
    /** Fréquence d'occurrence */
    frequency?: number;
    /** Niveau de cohérence du modèle (0-1) */
    consistency?: number;
}

/**
 * Modèle d'accès
 */
export interface AccessPattern {
    /** Ressource concernée */
    resource: string;
    /** Fréquence d'accès (accès par jour) */
    frequency: number;
    /** Permissions nécessaires */
    permissions: string[];
    /** Opérations couramment effectuées */
    commonOperations: string[];
    /** Taux de succès des opérations */
    successRate: number;
    /** Niveau de sensibilité de la ressource */
    sensitivityLevel?: 'low' | 'normal' | 'high' | 'critical';
    /** Type de modèle */
    type?: BehaviorPatternType.ACCESS;
}

/**
 * Modèle de ressource
 */
export interface ResourcePattern {
    /** Type de ressource */
    type: string | BehaviorPatternType.RESOURCE;
    /** Ressource concernée */
    resource?: string;
    /** Utilisation moyenne */
    averageUsage: number;
    /** Utilisation maximale ou pic d'utilisation */
    maxUsage?: number;
    peakUsage?: number;
    /** Plage d'utilisation normale [min, max] */
    normalRange?: [number, number];
    /** Utilisation minimale */
    minUsage?: number;
    /** Durée moyenne d'utilisation (ms) */
    averageDuration?: number;
}

/**
 * Modèle d'interaction
 */
export interface InteractionPattern {
    /** Type d'interaction ou source */
    type: string | BehaviorPatternType.INTERACTION;
    /** Source de l'interaction */
    source?: string;
    /** Cibles courantes */
    commonTargets: string[];
    /** Fréquence d'interaction */
    frequency?: number;
    /** Taux de succès des interactions */
    successRate?: number;
    /** Séquences d'interaction courantes */
    commonSequences?: string[][];
}

/**
 * Modèle géographique
 */
export interface GeoPattern {
    /** Latitude */
    latitude: number;
    /** Longitude */
    longitude: number;
    /** Rayon en kilomètres */
    radiusKm: number;
    /** Pays */
    country: string;
    /** Ville */
    city: string;
    /** Date de première observation */
    firstSeen: string;
    /** Date de dernière observation */
    lastSeen: string;
    /** Fréquence d'utilisation */
    frequency: number;
    /** Type de modèle */
    type: BehaviorPatternType.GEO;
}

/**
 * Interface pour un service de géolocalisation IP
 */
export interface GeoIPService {
    /**
     * Obtient la localisation géographique à partir d'une adresse IP
     * @param ip Adresse IP
     * @returns Promesse contenant les informations de localisation
     */
    getLocationFromIP(ip: string): Promise<{
        latitude: number;
        longitude: number;
        country: string;
        city: string;
        [key: string]: unknown;
    } | null>;
}

/**
 * Profil comportemental d'un utilisateur
 */
export interface BehaviorProfile {
    /** Identifiant de l'utilisateur */
    userId: string;
    /** Date de création (format string ISO) */
    created?: string;
    /** Date de création (timestamp) */
    createdAt?: number;
    /** Date de dernière mise à jour (format string ISO) */
    lastUpdated?: string;
    /** Phase d'apprentissage active */
    learningPhase: boolean;
    /** Modèles comportementaux */
    patterns: {
        temporal: TemporalPattern[];
        access: AccessPattern[];
        resource: ResourcePattern[];
        interaction: InteractionPattern[];
        geo?: GeoPattern[];
    };
    /** Ressources sensibles */
    sensitiveResources?: string[];
    /** Score de risque global de l'utilisateur */
    riskScore?: number;
    /** Seuil d'anomalie pour cet utilisateur */
    anomalyThreshold?: number;
}

/**
 * Analyse comportementale complète
 */
export interface BehaviorAnalysis {
    /** Identifiant de l'utilisateur */
    userId: string;
    /** Horodatage de l'analyse */
    timestamp: number;
    /** Score de risque global */
    riskScore: number;
    /** Anomalies détectées */
    anomalies: BehaviorAnomaly[];
    /** Recommandations d'actions */
    recommendations: string[];
    /** Niveau de confiance de l'analyse */
    confidence: number;
}