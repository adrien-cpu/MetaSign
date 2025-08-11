// src/ai/api/security/behavior/AnomalyFactory.ts
import { BehaviorEvent, BehaviorAnomaly, AnomalyLevel } from './types';
import { randomUUID } from 'crypto';

/**
 * Fabrique de création d'anomalies de comportement
 * Fournit des méthodes statiques pour créer différents types d'anomalies
 */
export class AnomalyFactory {
    /**
     * Crée une anomalie temporelle (accès à des heures inhabituelles)
     * @param event Événement comportemental
     * @param confidence Niveau de confiance (0-1)
     * @param actualTime Heure actuelle
     * @returns Objet anomalie
     */
    public static createTemporalAnomaly(
        event: BehaviorEvent,
        confidence: number,
        actualTime: number
    ): BehaviorAnomaly {
        return {
            id: this.generateAnomalyId(),
            timestamp: event.timestamp,
            userId: event.userId,
            type: 'temporal_anomaly',
            level: AnomalyLevel.MEDIUM,
            confidence,
            evidence: {
                expected: 'normal working hours',
                actual: `${actualTime} minutes`,
                deviation: 1
            },
            context: event.context || {},
            event,
            riskScore: 0.65
        };
    }

    /**
     * Crée une anomalie de fréquence d'accès (nombre d'accès anormal)
     * @param event Événement comportemental
     * @param expectedFrequency Fréquence attendue
     * @param currentFrequency Fréquence actuelle
     * @returns Objet anomalie
     */
    public static createAccessFrequencyAnomaly(
        event: BehaviorEvent,
        expectedFrequency: number,
        currentFrequency: number
    ): BehaviorAnomaly {
        return {
            id: this.generateAnomalyId(),
            timestamp: event.timestamp,
            userId: event.userId,
            type: 'high_frequency',
            level: AnomalyLevel.HIGH,
            confidence: 0.9,
            evidence: {
                expected: expectedFrequency,
                actual: currentFrequency,
                deviation: currentFrequency / expectedFrequency
            },
            context: event.context || {},
            event,
            riskScore: 0.8
        };
    }

    /**
     * Crée une anomalie d'opération inhabituelle
     * @param event Événement comportemental
     * @param expectedOperations Opérations attendues
     * @param level Niveau d'anomalie (optionnel)
     * @returns Objet anomalie
     */
    public static createUnusualOperationAnomaly(
        event: BehaviorEvent,
        expectedOperations: string[],
        level: AnomalyLevel = AnomalyLevel.MEDIUM
    ): BehaviorAnomaly {
        return {
            id: this.generateAnomalyId(),
            timestamp: event.timestamp,
            userId: event.userId,
            type: 'unusual_operation',
            level,
            confidence: 0.8,
            evidence: {
                expected: expectedOperations,
                actual: event.action,
                deviation: 1
            },
            context: event.context || {},
            event,
            riskScore: level === AnomalyLevel.HIGH ? 0.85 : 0.7
        };
    }

    /**
     * Crée une anomalie d'utilisation de ressource
     * @param event Événement comportemental
     * @param minUsage Utilisation minimale attendue
     * @param maxUsage Utilisation maximale attendue
     * @param actualUsage Utilisation actuelle
     * @returns Objet anomalie
     */
    public static createResourceUsageAnomaly(
        event: BehaviorEvent,
        minUsage: number,
        maxUsage: number,
        actualUsage: number
    ): BehaviorAnomaly {
        const level = actualUsage > maxUsage * 2 ? AnomalyLevel.HIGH : AnomalyLevel.MEDIUM;

        return {
            id: this.generateAnomalyId(),
            timestamp: event.timestamp,
            userId: event.userId,
            type: 'resource_usage_anomaly',
            level,
            confidence: 0.85,
            evidence: {
                expected: `${minUsage}-${maxUsage}`,
                actual: actualUsage,
                deviation: Math.max(
                    actualUsage / maxUsage,
                    minUsage / actualUsage
                )
            },
            context: event.context || {},
            event,
            riskScore: level === AnomalyLevel.HIGH ? 0.85 : 0.65
        };
    }

    /**
     * Crée une anomalie d'interaction inhabituelle
     * @param event Événement comportemental
     * @param expectedTargets Cibles attendues
     * @param actualTarget Cible actuelle
     * @returns Objet anomalie
     */
    public static createUnusualInteractionAnomaly(
        event: BehaviorEvent,
        expectedTargets: string[],
        actualTarget: string
    ): BehaviorAnomaly {
        return {
            id: this.generateAnomalyId(),
            timestamp: event.timestamp,
            userId: event.userId,
            type: 'unusual_interaction_anomaly',
            level: AnomalyLevel.MEDIUM,
            confidence: 0.75,
            evidence: {
                expected: expectedTargets,
                actual: actualTarget,
                deviation: 1
            },
            context: event.context || {},
            event,
            riskScore: 0.6
        };
    }

    /**
     * Crée une anomalie de premier accès à une ressource
     * @param event Événement comportemental
     * @returns Objet anomalie
     */
    public static createFirstTimeAccessAnomaly(
        event: BehaviorEvent
    ): BehaviorAnomaly {
        return {
            id: this.generateAnomalyId(),
            timestamp: event.timestamp,
            userId: event.userId,
            type: 'first_time_access',
            level: AnomalyLevel.LOW,
            confidence: 0.8,
            evidence: {
                resource: event.resource,
                action: event.action
            },
            context: event.context || {},
            event,
            riskScore: 0.4
        };
    }

    /**
     * Crée une anomalie d'accès à une heure inhabituelle
     * @param event Événement comportemental
     * @param timeType Type de temps ('hour' ou 'weekday')
     * @param actualTime Heure ou jour actuel
     * @param distribution Distribution temporelle normale
     * @returns Objet anomalie
     */
    public static createUnusualTimeAnomaly(
        event: BehaviorEvent,
        timeType: 'hour' | 'weekday',
        actualTime: number,
        distribution: number[]
    ): BehaviorAnomaly {
        const timeLabel = timeType === 'hour'
            ? `${actualTime}:00`
            : ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][actualTime];

        return {
            id: this.generateAnomalyId(),
            timestamp: event.timestamp,
            userId: event.userId,
            type: 'unusual_time',
            level: AnomalyLevel.MEDIUM,
            confidence: 0.75,
            evidence: {
                timeType,
                actual: timeLabel,
                distribution,
                probability: distribution[actualTime]
            },
            context: event.context || {},
            event,
            riskScore: 0.6
        };
    }

    /**
     * Crée une anomalie de permissions insuffisantes
     * @param event Événement comportemental
     * @param requiredPermissions Permissions requises
     * @returns Objet anomalie
     */
    public static createInsufficientPermissionsAnomaly(
        event: BehaviorEvent,
        requiredPermissions: string[]
    ): BehaviorAnomaly {
        return {
            id: this.generateAnomalyId(),
            timestamp: event.timestamp,
            userId: event.userId,
            type: 'insufficient_permissions',
            level: AnomalyLevel.HIGH,
            confidence: 0.95,
            evidence: {
                required: requiredPermissions,
                actual: event.permissions || [],
                resource: event.resource,
                action: event.action
            },
            context: event.context || {},
            event,
            riskScore: 0.9
        };
    }

    /**
     * Crée une anomalie d'emplacement inconnu
     * @param event Événement comportemental
     * @param latitude Latitude de l'emplacement
     * @param longitude Longitude de l'emplacement
     * @param city Ville de l'emplacement
     * @param country Pays de l'emplacement
     * @returns Objet anomalie
     */
    public static createUnknownLocationAnomaly(
        event: BehaviorEvent,
        latitude: number,
        longitude: number,
        city: string,
        country: string
    ): BehaviorAnomaly {
        return {
            id: this.generateAnomalyId(),
            timestamp: event.timestamp,
            userId: event.userId,
            type: 'unknown_location',
            level: AnomalyLevel.MEDIUM,
            confidence: 0.85,
            evidence: {
                location: { latitude, longitude, city, country },
                ip: event.ip
            },
            context: event.context || {},
            event,
            riskScore: 0.7
        };
    }

    /**
     * Crée une anomalie de déplacement impossible
     * @param event Événement comportemental actuel
     * @param previousEvent Événement comportemental précédent
     * @param distance Distance en km
     * @param timeElapsed Temps écoulé en ms
     * @param speed Vitesse calculée en km/h
     * @returns Objet anomalie
     */
    public static createImpossibleTravelAnomaly(
        event: BehaviorEvent,
        previousEvent: BehaviorEvent,
        distance: number,
        timeElapsed: number,
        speed: number
    ): BehaviorAnomaly {
        return {
            id: this.generateAnomalyId(),
            timestamp: event.timestamp,
            userId: event.userId,
            type: 'impossible_travel',
            level: AnomalyLevel.HIGH,
            confidence: 0.9,
            evidence: {
                distance: `${Math.round(distance)} km`,
                timeElapsed: `${Math.round(timeElapsed / 60000)} minutes`,
                speed: `${Math.round(speed)} km/h`,
                previousEvent: {
                    timestamp: previousEvent.timestamp,
                    ip: previousEvent.ip
                }
            },
            context: event.context || {},
            event,
            riskScore: 0.95
        };
    }

    /**
     * Crée une anomalie de sessions concurrentes
     * @param event Événement comportemental actuel
     * @param concurrentEvents Liste des événements concurrents
     * @returns Objet anomalie
     */
    public static createConcurrentSessionAnomaly(
        event: BehaviorEvent,
        concurrentEvents: BehaviorEvent[]
    ): BehaviorAnomaly {
        return {
            id: this.generateAnomalyId(),
            timestamp: event.timestamp,
            userId: event.userId,
            type: 'concurrent_session',
            level: AnomalyLevel.HIGH,
            confidence: 0.9,
            evidence: {
                currentIp: event.ip,
                concurrentIps: concurrentEvents.map(e => e.ip),
                concurrentSessionCount: concurrentEvents.length,
                sessionIds: concurrentEvents.map(e => e.sessionId)
            },
            context: event.context || {},
            event,
            riskScore: 0.85
        };
    }

    /**
     * Crée une anomalie de séquence suspecte d'actions
     * @param event Événement comportemental
     * @param suspiciousSequence Séquence suspecte d'actions
     * @param actualSequence Séquence actuelle d'événements
     * @returns Objet anomalie
     */
    public static createSuspiciousSequenceAnomaly(
        event: BehaviorEvent,
        suspiciousSequence: string[],
        actualSequence: BehaviorEvent[]
    ): BehaviorAnomaly {
        return {
            id: this.generateAnomalyId(),
            timestamp: event.timestamp,
            userId: event.userId,
            type: 'suspicious_sequence',
            level: AnomalyLevel.MEDIUM,
            confidence: 0.8,
            evidence: {
                suspiciousPattern: suspiciousSequence.join(' → '),
                actualSequence: actualSequence.map(e => ({
                    timestamp: e.timestamp,
                    action: e.action,
                    resource: e.resource
                }))
            },
            context: event.context || {},
            event,
            riskScore: 0.75
        };
    }

    /**
     * Crée une anomalie de changement de comportement
     * @param event Événement comportemental
     * @param previousValue Valeur précédente
     * @param currentValue Valeur actuelle
     * @param changeRatio Ratio de changement
     * @param changeType Type de changement
     * @returns Objet anomalie
     */
    public static createBehaviorShiftAnomaly(
        event: BehaviorEvent,
        previousValue: number,
        currentValue: number,
        changeRatio: number,
        changeType: string
    ): BehaviorAnomaly {
        const level = changeRatio > 5 || changeRatio < 0.2
            ? AnomalyLevel.HIGH
            : AnomalyLevel.MEDIUM;

        return {
            id: this.generateAnomalyId(),
            timestamp: event.timestamp,
            userId: event.userId,
            type: 'behavior_shift',
            level,
            confidence: 0.8,
            evidence: {
                changeType,
                previous: previousValue,
                current: currentValue,
                changeRatio,
                percentChange: changeRatio > 1
                    ? `+${Math.round((changeRatio - 1) * 100)}%`
                    : `-${Math.round((1 - changeRatio) * 100)}%`
            },
            context: event.context || {},
            event,
            riskScore: level === AnomalyLevel.HIGH ? 0.85 : 0.7
        };
    }

    /**
     * Génère un identifiant unique pour une anomalie
     * @returns Identifiant unique
     * @private
     */
    private static generateAnomalyId(): string {
        return `anomaly_${Date.now()}_${randomUUID()}`;
    }
}