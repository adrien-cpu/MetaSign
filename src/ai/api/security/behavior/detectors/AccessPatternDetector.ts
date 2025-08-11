// src/ai/api/security/behavior/detectors/AccessPatternDetector.ts
import {
    BehaviorEvent,
    BehaviorProfile,
    BehaviorAnomaly,
    AccessPattern,
    TemporalPattern,
    GeoPattern,
    AnomalyLevel,
    BehaviorPatternType,
    GeoIPService
} from '../types';
import { PatternDetectorBase } from './PatternDetectorBase';
import { AnomalyFactory } from '../AnomalyFactory';
import { Logger } from '@/ai/utils/Logger';

/**
 * Options de configuration pour le détecteur de modèles d'accès
 */
export interface AccessPatternDetectorOptions {
    /** Fenêtre de temps (en ms) pour les événements récents (défaut: 1 heure) */
    recentTimeWindow?: number;
    /** Seuil de fréquence pour les anomalies (défaut: 2x la moyenne) */
    frequencyThreshold?: number;
    /** Seuil de distance géographique (en km) pour les anomalies de voyage impossible */
    geoDistanceThreshold?: number;
    /** Seuil de temps (en ms) pour les anomalies de voyage impossible */
    geoTimeThreshold?: number;
    /** Facteur d'apprentissage pour l'adaptation des profils (0-1) */
    learningRate?: number;
    /** Période d'expiration des données historiques (en jours) */
    historyExpirationDays?: number;
    /** Service de géolocalisation par IP */
    geoIPService?: GeoIPService | null;
}

/**
 * Structure des statistiques d'accès
 */
interface AccessStats {
    /** Nombre total d'accès */
    totalAccesses: number;
    /** Distribution des heures d'accès */
    hourDistribution: number[];
    /** Distribution des jours de la semaine */
    weekdayDistribution: number[];
    /** Taux de succès */
    successRate: number;
    /** Durée moyenne des sessions */
    averageSessionDuration: number;
    /** Intervalle moyen entre sessions */
    averageTimeBetweenSessions: number;
}

/**
 * Coordonnées géographiques
 */
interface GeoCoordinates {
    /** Latitude */
    latitude: number;
    /** Longitude */
    longitude: number;
    /** Précision (optionnelle, en mètres) */
    accuracy?: number;
}

/**
 * Détecteur avancé de modèles d'accès
    * 
 * Ce détecteur analyse les habitudes d'accès des utilisateurs et identifie les anomalies
    * basées sur la fréquence, les horaires, les opérations effectuées et la localisation.
 */
export class AccessPatternDetector extends PatternDetectorBase {
    private readonly behaviorHistory: Map<string, BehaviorEvent[]>;
    private readonly activeSessions: Map<string, BehaviorEvent[]>;
    private readonly accessStats: Map<string, Map<string, AccessStats>>;
    protected readonly logger: Logger;
    private readonly options: Required<Omit<AccessPatternDetectorOptions, 'geoIPService'>> & { geoIPService: GeoIPService | null };
    private readonly geoIPService: GeoIPService | null;

    /**
     * Crée une nouvelle instance du détecteur de modèles d'accès
     * @param behaviorHistory Historique des événements de comportement
     * @param options Options de configuration
     */
    constructor(
        behaviorHistory: Map<string, BehaviorEvent[]>,
        options: AccessPatternDetectorOptions = {}
    ) {
        super();
        this.behaviorHistory = behaviorHistory;
        this.activeSessions = new Map<string, BehaviorEvent[]>();
        this.accessStats = new Map<string, Map<string, AccessStats>>();
        this.logger = Logger.getInstance('AccessPatternDetector');

        // Définir les options par défaut
        this.options = {
            recentTimeWindow: options.recentTimeWindow || 60 * 60 * 1000, // 1 heure
            frequencyThreshold: options.frequencyThreshold || 2.0,
            geoDistanceThreshold: options.geoDistanceThreshold || 500, // 500 km
            geoTimeThreshold: options.geoTimeThreshold || 3 * 60 * 60 * 1000, // 3 heures
            learningRate: options.learningRate || 0.3, // 30% d'influence des nouvelles données
            historyExpirationDays: options.historyExpirationDays || 90, // 90 jours
            geoIPService: options.geoIPService || null
        };

        this.geoIPService = this.options.geoIPService;

        // Initialiser les statistiques d'accès pour les utilisateurs existants
        this.initializeAccessStats();
    }

    /**
     * Initialise les statistiques d'accès pour tous les utilisateurs existants
     * @private
     */
    private initializeAccessStats(): void {
        for (const [userId, events] of this.behaviorHistory.entries()) {
            const userStats = new Map<string, AccessStats>();

            // Regrouper les événements par ressource
            const resourceGroups = this.groupEventsByResource(events);

            for (const [resource, resourceEvents] of resourceGroups.entries()) {
                userStats.set(resource, this.calculateAccessStats(resourceEvents));
            }

            this.accessStats.set(userId, userStats);
        }
    }

    /**
     * Détecte les anomalies dans un événement de comportement
     * @param event Événement à analyser
     * @param profile Profil de comportement de l'utilisateur
     * @returns Liste des anomalies détectées
     */
    public async detectAnomalies(
        event: BehaviorEvent,
        profile: BehaviorProfile
    ): Promise<BehaviorAnomaly[]> {
        // Si l'utilisateur est en phase d'apprentissage, ne pas détecter d'anomalies
        if (profile.learningPhase) {
            return [];
        }

        const anomalies: BehaviorAnomaly[] = [];

        // Collecter les anomalies de différentes catégories
        anomalies.push(...await this.detectAccessFrequencyAnomalies(event, profile));
        anomalies.push(...await this.detectUnusualOperationAnomalies(event, profile));
        anomalies.push(...await this.detectTemporalAnomalies(event, profile));
        anomalies.push(...await this.detectGeographicAnomalies(event, profile));
        anomalies.push(...await this.detectConcurrentSessions(event));
        anomalies.push(...await this.detectSequenceAnomalies(event, profile));

        // Ajouter un score de risque à chaque anomalie
        for (const anomaly of anomalies) {
            anomaly.riskScore = this.calculateAnomalyRiskScore(anomaly, profile);
        }

        // Journaliser les anomalies trouvées
        if (anomalies.length > 0) {
            this.logger.warn(
                `Detected ${anomalies.length} access pattern anomalies for user ${event.userId}`,
                {
                    userId: event.userId,
                    resource: event.resource,
                    anomalyCount: anomalies.length,
                    highRiskCount: anomalies.filter(a => (a.riskScore ?? 0) > 0.7).length
                }
            );
        }

        // Mettre à jour la session active
        this.updateActiveSession(event);

        return anomalies;
    }

    /**
     * Détecte les anomalies de fréquence d'accès
     * @param event Événement à analyser
     * @param profile Profil de comportement
     * @returns Liste des anomalies détectées
     * @private
     */
    private async detectAccessFrequencyAnomalies(
        event: BehaviorEvent,
        profile: BehaviorProfile
    ): Promise<BehaviorAnomaly[]> {
        const anomalies: BehaviorAnomaly[] = [];

        // Trouver le modèle d'accès pour cette ressource
        const accessPattern: AccessPattern | undefined = profile.patterns.access.find(p =>
            p.resource === event.resource
        );

        if (!accessPattern) {
            // Si aucun modèle n'existe, c'est potentiellement une anomalie (premier accès)
            return [
                AnomalyFactory.createFirstTimeAccessAnomaly(event)
            ];
        }

        // Vérifier la fréquence d'accès
        const recentAccesses = this.getRecentEventsInternal(event.userId, event.resource);
        const currentFrequency = recentAccesses.length;

        // Calculer la fenêtre de temps normalisée (en heures)
        const timeWindowHours = this.options.recentTimeWindow / (60 * 60 * 1000);

        // Calculer le taux d'accès par heure
        const currentAccessRate = currentFrequency / timeWindowHours;
        const normalAccessRate = accessPattern.frequency / 24; // Normaliser à l'heure

        // Si le taux d'accès actuel dépasse le seuil, créer une anomalie
        if (currentAccessRate > normalAccessRate * this.options.frequencyThreshold) {
            anomalies.push(
                AnomalyFactory.createAccessFrequencyAnomaly(
                    event,
                    normalAccessRate,
                    currentAccessRate
                )
            );
        }

        return anomalies;
    }

    /**
     * Détecte les opérations inhabituelles
     * @param event Événement à analyser
     * @param profile Profil de comportement
     * @returns Liste des anomalies détectées
     * @private
     */
    private async detectUnusualOperationAnomalies(
        event: BehaviorEvent,
        profile: BehaviorProfile
    ): Promise<BehaviorAnomaly[]> {
        const anomalies: BehaviorAnomaly[] = [];

        // Trouver le modèle d'accès pour cette ressource
        const accessPattern: AccessPattern | undefined = profile.patterns.access.find(p =>
            p.resource === event.resource
        );

        if (accessPattern) {
            // Vérifier si l'opération est inhabituelle
            if (!accessPattern.commonOperations.includes(event.action)) {
                // Vérifier si cet utilisateur a déjà effectué cette opération sur d'autres ressources
                const hasPerformedOnOtherResources = this.hasPerformedActionOnOtherResources(
                    event.userId,
                    event.action,
                    event.resource
                );

                // Une opération jamais effectuée est plus suspecte
                const severity = hasPerformedOnOtherResources ?
                    AnomalyLevel.MEDIUM :
                    AnomalyLevel.HIGH;

                anomalies.push(
                    AnomalyFactory.createUnusualOperationAnomaly(
                        event,
                        accessPattern.commonOperations,
                        severity
                    )
                );
            }

            // Vérifier si l'utilisateur a les permissions nécessaires
            if (accessPattern.permissions.length > 0 &&
                !this.hasRequiredPermissions(event, accessPattern.permissions)) {
                anomalies.push(
                    AnomalyFactory.createInsufficientPermissionsAnomaly(
                        event,
                        accessPattern.permissions
                    )
                );
            }
        }

        return anomalies;
    }

    /**
     * Détecte les anomalies temporelles (accès à des heures inhabituelles)
     * @param event Événement à analyser
     * @param profile Profil de comportement
     * @returns Liste des anomalies détectées
     */
    public async detectTemporalAnomalies(
        event: BehaviorEvent,
        profile: BehaviorProfile
    ): Promise<BehaviorAnomaly[]> {
        const anomalies: BehaviorAnomaly[] = [];

        // Extraire les modèles temporels du profil
        const temporalPatterns = profile.patterns.temporal || [];

        // Trouver le modèle temporel pour cette ressource ou le modèle global
        const resourcePattern = temporalPatterns.find(p => p.resource === event.resource);
        const globalPattern = temporalPatterns.find(p => p.resource === '*');

        // Utiliser le modèle spécifique à la ressource ou le modèle global
        const pattern = resourcePattern || globalPattern;

        if (pattern) {
            const eventDate = new Date(event.timestamp);
            const hour = eventDate.getHours();
            const weekday = eventDate.getDay();

            // Vérifier si l'heure est inhabituelle
            if (pattern.hourDistribution && pattern.hourDistribution[hour] < 0.05) { // Moins de 5% des accès
                anomalies.push(
                    AnomalyFactory.createUnusualTimeAnomaly(
                        event,
                        'hour',
                        hour,
                        pattern.hourDistribution
                    )
                );
            }

            // Vérifier si le jour de la semaine est inhabituel
            if (pattern.weekdayDistribution && pattern.weekdayDistribution[weekday] < 0.05) {
                anomalies.push(
                    AnomalyFactory.createUnusualTimeAnomaly(
                        event,
                        'weekday',
                        weekday,
                        pattern.weekdayDistribution
                    )
                );
            }
        }

        return anomalies;
    }

    /**
     * Détecte les anomalies géographiques (accès depuis des emplacements inhabituels)
     * @param event Événement à analyser
     * @param profile Profil de comportement
     * @returns Liste des anomalies détectées
     */
    public async detectGeographicAnomalies(
        event: BehaviorEvent,
        profile: BehaviorProfile
    ): Promise<BehaviorAnomaly[]> {
        // Si le service de géolocalisation n'est pas disponible ou si l'événement n'a pas d'IP
        if (!this.geoIPService || !event.ip) {
            return [];
        }

        const anomalies: BehaviorAnomaly[] = [];

        try {
            // Obtenir la géolocalisation de l'IP actuelle
            const currentLocation = await this.geoIPService.getLocationFromIP(event.ip);

            if (!currentLocation) {
                return [];
            }

            // Trouver les modèles géographiques dans le profil
            const geoPatterns = profile.patterns.geo || [];

            // Vérifier si l'emplacement est connu
            const knownLocation = geoPatterns.some(pattern =>
                this.isLocationNearby(
                    currentLocation,
                    { latitude: pattern.latitude, longitude: pattern.longitude },
                    pattern.radiusKm || 100
                )
            );

            if (!knownLocation) {
                anomalies.push(
                    AnomalyFactory.createUnknownLocationAnomaly(
                        event,
                        currentLocation.latitude,
                        currentLocation.longitude,
                        currentLocation.city,
                        currentLocation.country
                    )
                );
            }

            // Vérifier si l'utilisateur a effectué d'autres accès récents
            const recentEvents = this.getRecentEventsInternal(
                event.userId,
                undefined,
                this.options.geoTimeThreshold
            );

            for (const prevEvent of recentEvents) {
                // Ignorer les événements sans IP
                if (!prevEvent.ip || prevEvent.ip === event.ip) {
                    continue;
                }

                // Obtenir la géolocalisation de l'IP précédente
                const prevLocation = await this.geoIPService.getLocationFromIP(prevEvent.ip);

                if (!prevLocation) {
                    continue;
                }

                // Calculer la distance entre les emplacements
                const distance = this.calculateDistance(
                    currentLocation.latitude,
                    currentLocation.longitude,
                    prevLocation.latitude,
                    prevLocation.longitude
                );

                // Calculer le temps écoulé entre les événements
                const timeElapsed = event.timestamp - prevEvent.timestamp;

                // Calculer la vitesse de déplacement en km/h
                const speed = (distance / timeElapsed) * 3600000; // km/h

                // Si la vitesse dépasse 1000 km/h, c'est probablement impossible
                if (distance > this.options.geoDistanceThreshold &&
                    timeElapsed < this.options.geoTimeThreshold) {
                    anomalies.push(
                        AnomalyFactory.createImpossibleTravelAnomaly(
                            event,
                            prevEvent,
                            distance,
                            timeElapsed,
                            speed
                        )
                    );

                    // Une seule anomalie de ce type suffit
                    break;
                }
            }
        } catch (error) {
            this.logger.error('Error detecting geographic anomalies', {
                error: error instanceof Error ? error.message : String(error),
                userId: event.userId
            });
        }

        return anomalies;
    }

    /**
     * Détecte les sessions concurrentes d'un même utilisateur
     * @param event Événement à analyser
     * @returns Liste des anomalies détectées
     */
    public async detectConcurrentSessions(
        event: BehaviorEvent
    ): Promise<BehaviorAnomaly[]> {
        const anomalies: BehaviorAnomaly[] = [];

        // Obtenir les sessions actives
        const activeSessions = this.activeSessions.get(event.userId) || [];

        // Grouper les sessions par adresse IP
        const sessionsByIP = new Map<string, BehaviorEvent[]>();

        for (const sessionEvent of activeSessions) {
            // Ignorer les événements sans IP ou les événements de la même session
            if (!sessionEvent.ip || !event.sessionId || sessionEvent.sessionId === event.sessionId) {
                continue;
            }

            // Grouper par IP
            if (!sessionsByIP.has(sessionEvent.ip)) {
                sessionsByIP.set(sessionEvent.ip, []);
            }

            const sessions = sessionsByIP.get(sessionEvent.ip);
            if (sessions) {
                sessions.push(sessionEvent);
            }
        }

        // Rechercher des sessions concurrentes sur différentes IPs
        if (event.ip && sessionsByIP.size > 0 && !sessionsByIP.has(event.ip)) {
            // Trouver les sessions les plus récentes pour chaque IP
            const latestSessionEvents: BehaviorEvent[] = [];

            for (const [, sessions] of sessionsByIP.entries()) {
                // Tri par timestamp décroissant
                sessions.sort((a, b) => b.timestamp - a.timestamp);

                // Ajouter la session la plus récente
                if (sessions.length > 0) {
                    latestSessionEvents.push(sessions[0]);
                }
            }

            // Si des sessions concurrentes existent, créer une anomalie
            if (latestSessionEvents.length > 0) {
                anomalies.push(
                    AnomalyFactory.createConcurrentSessionAnomaly(
                        event,
                        latestSessionEvents
                    )
                );
            }
        }

        return anomalies;
    }

    /**
     * Détecte les anomalies dans des séquences d'actions
     * @param event Événement à analyser
     * @param profile Profil de comportement
     * @returns Liste des anomalies détectées
     */
    public async detectSequenceAnomalies(
        event: BehaviorEvent,
        // Préfixer avec underscore pour indiquer que c'est délibérément non utilisé
        _profile: BehaviorProfile
    ): Promise<BehaviorAnomaly[]> {
        const anomalies: BehaviorAnomaly[] = [];

        // Obtenir les événements récents pour cet utilisateur
        const recentEvents = this.getRecentEventsInternal(event.userId, undefined, 15 * 60 * 1000); // 15 minutes

        // Ajouter l'événement actuel
        const sequence = [...recentEvents, event];

        // Trier par timestamp
        sequence.sort((a, b) => a.timestamp - b.timestamp);

        // Extraire la séquence d'actions
        const actionSequence = sequence.map(e => e.action);

        // Rechercher des séquences suspectes connues (exemples)
        const suspiciousSequences = [
            ['read', 'read', 'read', 'delete'], // Lecture multiple suivie d'une suppression
            ['read', 'create', 'update', 'delete'], // CRUD complet en séquence
            ['failed_auth', 'failed_auth', 'auth'] // Tentatives d'authentification échouées suivies d'un succès
        ];

        // Vérifier si la séquence récente correspond à une séquence suspecte
        for (const suspiciousSeq of suspiciousSequences) {
            if (this.containsSequence(actionSequence, suspiciousSeq)) {
                anomalies.push(
                    AnomalyFactory.createSuspiciousSequenceAnomaly(
                        event,
                        suspiciousSeq,
                        sequence
                    )
                );
            }
        }

        return anomalies;
    }

    /**
     * Calcule un score de risque global pour un événement
     * @param event Événement à analyser
     * @param profile Profil de comportement
     * @returns Score de risque (0-1)
     */
    public calculateRiskScore(event: BehaviorEvent, profile: BehaviorProfile): number {
        let score = 0;
        let factors = 0;

        // Facteur 1: Fréquence d'accès
        const accessPattern = profile.patterns.access.find(p => p.resource === event.resource);
        if (accessPattern) {
            const recentAccesses = this.getRecentEventsInternal(event.userId, event.resource);
            const currentFrequency = recentAccesses.length;

            // Normaliser la fréquence
            const frequencyRatio = accessPattern.frequency > 0
                ? currentFrequency / accessPattern.frequency
                : 1;

            // Plus la fréquence est élevée par rapport à la normale, plus le risque est élevé
            score += Math.min(frequencyRatio / 3, 1); // Plafonné à 1
            factors++;
        }

        // Facteur 2: Opération inhabituelle
        if (accessPattern && !accessPattern.commonOperations.includes(event.action)) {
            score += 0.7; // Opération inhabituelle = risque élevé
            factors++;
        }

        // Facteur 3: Heure inhabituelle
        const date = new Date(event.timestamp);
        const hour = date.getHours();
        const weekday = date.getDay();

        const temporalPatterns = profile.patterns.temporal || [];
        const temporalPattern = temporalPatterns.find(p => p.resource === event.resource) ||
            temporalPatterns.find(p => p.resource === '*');

        if (temporalPattern && temporalPattern.hourDistribution) {
            const hourProbability = temporalPattern.hourDistribution[hour] || 0;
            score += (1 - hourProbability);
            factors++;
        }

        if (temporalPattern && temporalPattern.weekdayDistribution) {
            const weekdayProbability = temporalPattern.weekdayDistribution[weekday] || 0;
            score += (1 - weekdayProbability);
            factors++;
        }

        // Facteur 4: Localisation inhabituelle
        const geoPatterns = profile.patterns.geo || [];
        if (event.ip && geoPatterns.length > 0) {
            // Nous ne pouvons pas effectuer la géolocalisation ici car c'est asynchrone,
            // mais nous pouvons utiliser d'autres informations

            // Si l'IP n'a jamais été utilisée auparavant, augmenter le score
            const ipUsedBefore = this.hasIPBeenUsedBefore(event.userId, event.ip);
            if (!ipUsedBefore) {
                score += 0.8;
                factors++;
            }
        }

        // Calculer la moyenne
        return factors > 0 ? (score / factors) : 0;
    }

    /**
     * Calcule le score de risque d'une anomalie
     * @param anomaly Anomalie à évaluer
     * @param profile Profil de comportement
     * @returns Score de risque (0-1)
     * @private
     */
    private calculateAnomalyRiskScore(
        anomaly: BehaviorAnomaly,
        profile: BehaviorProfile
    ): number {
        if (!anomaly.level) {
            return 0.5; // Valeur par défaut si level n'est pas défini
        }

        // Poids de base selon le niveau d'anomalie
        let baseWeight = 0.5;
        if (anomaly.level === AnomalyLevel.LOW) {
            baseWeight = 0.3;
        } else if (anomaly.level === AnomalyLevel.MEDIUM) {
            baseWeight = 0.6;
        } else if (anomaly.level === AnomalyLevel.HIGH) {
            baseWeight = 0.9;
        }

        // Facteurs d'ajustement
        let adjustmentFactor = 1.0;

        // Ajuster selon le type d'anomalie
        switch (anomaly.type) {
            case 'impossible_travel':
                adjustmentFactor = 1.5; // Très suspect
                break;
            case 'concurrent_session':
                adjustmentFactor = 1.3; // Suspect
                break;
            case 'unknown_location':
                adjustmentFactor = 1.2; // Modérément suspect
                break;
            case 'unusual_time':
                adjustmentFactor = 0.9; // Moins suspect (peut arriver légitimement)
                break;
            case 'unusual_operation':
                adjustmentFactor = 1.1;
                break;
            case 'high_frequency':
                adjustmentFactor = 0.8;
                break;
        }

        // Ajuster selon la sensibilité de la ressource
        const resourceSensitivity = anomaly.event ?
            this.getResourceSensitivity(anomaly.event.resource, profile) : 1.0;

        // Calculer le score final (plafonné à 1.0)
        return Math.min(baseWeight * adjustmentFactor * resourceSensitivity, 1.0);
    }

    /**
     * Estime la sensibilité d'une ressource basée sur le profil
     * @param resource Identifiant de la ressource
     * @param profile Profil de comportement
     * @returns Facteur de sensibilité (1.0 par défaut)
     * @private
     */
    private getResourceSensitivity(resource: string, profile: BehaviorProfile): number {
        // Par défaut, toutes les ressources ont une sensibilité de 1.0
        let sensitivity = 1.0;

        // Vérifier si la ressource est marquée comme sensible dans le profil
        const sensitiveResources = profile.sensitiveResources || [];
        if (sensitiveResources.includes(resource)) {
            sensitivity = 1.5;
        }

        // Vérifier si la ressource est rarement accédée
        const accessPattern = profile.patterns.access.find(p => p.resource === resource);
        if (accessPattern && accessPattern.frequency < 5) { // Moins de 5 accès par jour
            sensitivity *= 1.2;
        }

        return sensitivity;
    }

    /**
     * Met à jour le profil de comportement avec un nouvel événement
     * @param profile Profil à mettre à jour
     * @param event Nouvel événement
     */
    public async updateProfile(
        profile: BehaviorProfile,
        event: BehaviorEvent
    ): Promise<void> {
        // Mettre à jour les modèles d'accès
        await this.updateAccessPatterns(profile, event);

        // Mettre à jour les modèles temporels
        await this.updateTemporalPatterns(profile, event);

        // Mettre à jour les modèles géographiques
        if (event.ip && this.geoIPService) {
            await this.updateGeoPatterns(profile, event);
        }

        // Mettre à jour la date de dernière mise à jour du profil
        profile.lastUpdated = new Date().toISOString();
    }

    /**
     * Met à jour les modèles d'accès dans le profil
     * @param profile Profil à mettre à jour
     * @param event Nouvel événement
     * @private
     */
    private async updateAccessPatterns(
        profile: BehaviorProfile,
        event: BehaviorEvent
    ): Promise<void> {
        // Trouver ou créer le modèle d'accès pour cette ressource
        let pattern: AccessPattern | undefined = profile.patterns.access.find(p =>
            p.resource === event.resource
        );

        if (!pattern) {
            pattern = {
                resource: event.resource,
                frequency: 0,
                permissions: [],
                commonOperations: [],
                successRate: 1,
                sensitivityLevel: 'normal'
            } as AccessPattern;

            profile.patterns.access.push(pattern);
        }

        // Mettre à jour la fréquence avec moyenne mobile pondérée
        const recentEvents = this.getRecentEventsInternal(event.userId, event.resource);
        const newFrequency = recentEvents.length;

        pattern.frequency = Math.round(
            pattern.frequency * (1 - this.options.learningRate) +
            newFrequency * this.options.learningRate
        );

        // Mettre à jour les opérations communes
        if (!pattern.commonOperations.includes(event.action)) {
            pattern.commonOperations.push(event.action);
        }

        // Mettre à jour le taux de succès
        const successfulEvents = recentEvents.filter(e => e.result === 'success');
        const newSuccessRate = successfulEvents.length / Math.max(recentEvents.length, 1);

        pattern.successRate = pattern.successRate * (1 - this.options.learningRate) +
            newSuccessRate * this.options.learningRate;

        // Mettre à jour les permissions si présentes dans l'événement
        if (event.permissions && event.permissions.length > 0) {
            // Ajouter uniquement les permissions qui ne sont pas déjà présentes
            for (const permission of event.permissions) {
                if (!pattern.permissions.includes(permission)) {
                    pattern.permissions.push(permission);
                }
            }
        }
    }

    /**
     * Met à jour les modèles temporels dans le profil
     * @param profile Profil à mettre à jour
     * @param event Nouvel événement
     */
    public async updateTemporalPatterns(
        profile: BehaviorProfile,
        event: BehaviorEvent
    ): Promise<void> {
        // Initialiser les modèles temporels s'ils n'existent pas
        if (!profile.patterns.temporal) {
            profile.patterns.temporal = [];
        }

        // Trouver ou créer le modèle pour cette ressource
        let pattern: TemporalPattern | undefined = profile.patterns.temporal.find(p =>
            p.resource === event.resource
        );

        // Si aucun modèle spécifique n'existe, créer un nouveau
        if (!pattern) {
            pattern = {
                resource: event.resource,
                hourDistribution: new Array(24).fill(0),
                weekdayDistribution: new Array(7).fill(0),
                type: BehaviorPatternType.TEMPORAL
            };

            profile.patterns.temporal.push(pattern);
        }

        // Extraire l'heure et le jour de la semaine
        const eventDate = new Date(event.timestamp);
        const hour = eventDate.getHours();
        const weekday = eventDate.getDay();

        // Calculer les nouvelles distributions
        // Pour l'heure
        const hourDist = pattern.hourDistribution
            ? [...pattern.hourDistribution]
            : new Array(24).fill(0);

        hourDist[hour] += 1;

        // Normaliser la distribution des heures
        const hourSum = hourDist.reduce((a, b) => a + b, 0);
        const normalizedHourDist = hourDist.map(count => count / hourSum);

        // Pour le jour de la semaine
        const weekdayDist = pattern.weekdayDistribution
            ? [...pattern.weekdayDistribution]
            : new Array(7).fill(0);

        weekdayDist[weekday] += 1;

        // Normaliser la distribution des jours
        const weekdaySum = weekdayDist.reduce((a, b) => a + b, 0);
        const normalizedWeekdayDist = weekdayDist.map(count => count / weekdaySum);

        // S'assurer que les distributions existent avant d'appliquer la moyenne mobile
        if (!pattern.hourDistribution) {
            pattern.hourDistribution = new Array(24).fill(0);
        }

        if (!pattern.weekdayDistribution) {
            pattern.weekdayDistribution = new Array(7).fill(0);
        }

        // Appliquer la moyenne mobile pondérée
        for (let i = 0; i < 24; i++) {
            pattern.hourDistribution[i] = pattern.hourDistribution[i] * (1 - this.options.learningRate) +
                normalizedHourDist[i] * this.options.learningRate;
        }

        for (let i = 0; i < 7; i++) {
            pattern.weekdayDistribution[i] = pattern.weekdayDistribution[i] * (1 - this.options.learningRate) +
                normalizedWeekdayDist[i] * this.options.learningRate;
        }
    }

    /**
     * Met à jour les modèles géographiques dans le profil
     * @param profile Profil à mettre à jour
     * @param event Nouvel événement
     * @private
     */
    private async updateGeoPatterns(
        profile: BehaviorProfile,
        event: BehaviorEvent
    ): Promise<void> {
        // Vérifier si le service de géolocalisation et l'IP sont disponibles
        if (!this.geoIPService || !event.ip) {
            return;
        }

        try {
            // Obtenir la géolocalisation
            const location = await this.geoIPService.getLocationFromIP(event.ip);

            if (!location) {
                return;
            }

            // Initialiser les modèles géographiques s'ils n'existent pas
            if (!profile.patterns.geo) {
                profile.patterns.geo = [];
            }

            // Vérifier si l'emplacement est déjà connu
            const existingPattern = profile.patterns.geo.find(pattern =>
                this.isLocationNearby(
                    { latitude: location.latitude, longitude: location.longitude },
                    { latitude: pattern.latitude, longitude: pattern.longitude },
                    pattern.radiusKm || 100
                )
            );

            if (existingPattern) {
                // Mettre à jour le modèle existant
                existingPattern.lastSeen = new Date().toISOString();
                existingPattern.frequency += 1;

                // Ajuster le rayon pour inclure ce point
                const distance = this.calculateDistance(
                    location.latitude,
                    location.longitude,
                    existingPattern.latitude,
                    existingPattern.longitude
                );

                // Étendre le rayon si nécessaire
                if (distance > existingPattern.radiusKm) {
                    existingPattern.radiusKm = Math.max(existingPattern.radiusKm, distance * 1.1);
                }
            } else {
                // Créer un nouveau modèle géographique
                const newPattern: GeoPattern = {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    radiusKm: 100, // Rayon initial
                    country: location.country,
                    city: location.city,
                    firstSeen: new Date().toISOString(),
                    lastSeen: new Date().toISOString(),
                    frequency: 1,
                    type: BehaviorPatternType.GEO
                };

                profile.patterns.geo.push(newPattern);
            }
        } catch (error) {
            this.logger.error('Error updating geo patterns', {
                error: error instanceof Error ? error.message : String(error),
                userId: event.userId
            });
        }
    }

    /**
     * Détecte les changements soudains de comportement sur une période
     * @param userId Identifiant de l'utilisateur
     * @param timeframeInDays Période en jours
     * @returns Liste des anomalies détectées
     */
    public async detectBehaviorShifts(
        userId: string,
        timeframeInDays: number = 30
    ): Promise<BehaviorAnomaly[]> {
        const anomalies: BehaviorAnomaly[] = [];

        // Obtenir tous les événements de l'utilisateur
        const userEvents = this.behaviorHistory.get(userId) || [];

        // Si trop peu d'événements, ne pas analyser
        if (userEvents.length < 20) {
            return [];
        }

        // Définir la période d'analyse
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeframeInDays);

        // Diviser la période en deux parties égales
        const midDate = new Date();
        midDate.setDate(midDate.getDate() - Math.floor(timeframeInDays / 2));

        // Filtrer les événements par période
        const oldEvents = userEvents.filter(e =>
            e.timestamp >= startDate.getTime() && e.timestamp < midDate.getTime()
        );

        const newEvents = userEvents.filter(e =>
            e.timestamp >= midDate.getTime() && e.timestamp <= endDate.getTime()
        );

        // Si l'une des périodes n'a pas suffisamment d'événements, ne pas analyser
        if (oldEvents.length < 10 || newEvents.length < 10) {
            return [];
        }

        // Analyser les changements de fréquence par ressource
        const oldResourceCounts = this.countEventsByResource(oldEvents);
        const newResourceCounts = this.countEventsByResource(newEvents);

        // Comparer les fréquences
        for (const [resource, newCount] of newResourceCounts.entries()) {
            const oldCount = oldResourceCounts.get(resource) || 0;

            // Calculer le ratio de changement
            const changeRatio = oldCount > 0 ? newCount / oldCount : Infinity;

            // Si la fréquence a plus que doublé ou diminué de plus de 70%
            if (changeRatio > 2 || (oldCount > 0 && changeRatio < 0.3)) {
                // Créer un événement artificiel pour l'anomalie
                const dummyEvent: BehaviorEvent = {
                    userId,
                    timestamp: Date.now(),
                    resource,
                    action: 'analyze',
                    result: 'success'
                };

                anomalies.push(
                    AnomalyFactory.createBehaviorShiftAnomaly(
                        dummyEvent,
                        oldCount / (timeframeInDays / 2), // Moyenne par jour avant
                        newCount / (timeframeInDays / 2), // Moyenne par jour après
                        changeRatio,
                        'frequency'
                    )
                );
            }
        }

        // Analyser les changements dans les types d'opérations
        const oldActionCounts = this.countEventsByAction(oldEvents);
        const newActionCounts = this.countEventsByAction(newEvents);

        // Identifier les nouvelles actions
        for (const [action, count] of newActionCounts.entries()) {
            if (!oldActionCounts.has(action) && count > 5) {
                // Créer un événement artificiel pour l'anomalie
                const dummyEvent: BehaviorEvent = {
                    userId,
                    timestamp: Date.now(),
                    resource: '*',
                    action,
                    result: 'success'
                };

                anomalies.push(
                    AnomalyFactory.createBehaviorShiftAnomaly(
                        dummyEvent,
                        0,
                        count,
                        Infinity,
                        'new_action'
                    )
                );
            }
        }

        return anomalies;
    }

    /**
     * Met à jour la session active d'un utilisateur
     * @param event Événement à ajouter
     * @private
     */
    private updateActiveSession(event: BehaviorEvent): void {
        // Si l'utilisateur n'a pas de session active, en créer une
        if (!this.activeSessions.has(event.userId)) {
            this.activeSessions.set(event.userId, []);
        }

        const userSessions = this.activeSessions.get(event.userId)!;

        // Ajouter l'événement à la session
        userSessions.push(event);

        // Nettoyer les événements trop anciens (plus de 30 minutes)
        const cutoff = Date.now() - 30 * 60 * 1000;
        const filteredSessions = userSessions.filter(e => e.timestamp >= cutoff);

        this.activeSessions.set(event.userId, filteredSessions);
    }

    /**
     * Récupère les événements récents d'un utilisateur (implémentation conforme à l'interface)
     * @param history Historique des événements
     * @param userId Identifiant de l'utilisateur
     * @param resource Ressource spécifique (optionnel)
     * @param timeWindow Fenêtre de temps en millisecondes
     * @returns Liste des événements récents
     */
    public getRecentEvents(
        history: Map<string, BehaviorEvent[]>,
        userId: string,
        resource?: string,
        timeWindow: number = this.options.recentTimeWindow
    ): BehaviorEvent[] {
        const events = history.get(userId) || [];
        const cutoff = Date.now() - timeWindow;

        return events.filter(event =>
            event.timestamp > cutoff &&
            (!resource || event.resource === resource)
        );
    }

    /**
     * Récupère les événements récents d'un utilisateur de l'historique interne
     * @param userId Identifiant de l'utilisateur
     * @param resource Ressource spécifique (optionnel)
     * @param timeWindow Fenêtre de temps en millisecondes
     * @returns Liste des événements récents
     * @private
     */
    private getRecentEventsInternal(
        userId: string,
        resource?: string,
        timeWindow: number = this.options.recentTimeWindow
    ): BehaviorEvent[] {
        return this.getRecentEvents(this.behaviorHistory, userId, resource, timeWindow);
    }

    /**
     * Vérifie si l'utilisateur a déjà effectué une action sur d'autres ressources
     * @param userId Identifiant de l'utilisateur
     * @param action Action à vérifier
     * @param excludedResource Ressource à exclure
     * @returns true si l'action a été effectuée sur d'autres ressources
     * @private
     */
    private hasPerformedActionOnOtherResources(
        userId: string,
        action: string,
        excludedResource: string
    ): boolean {
        const history = this.behaviorHistory.get(userId) || [];

        return history.some(event =>
            event.action === action &&
            event.resource !== excludedResource
        );
    }

    /**
     * Vérifie si l'utilisateur a les permissions requises
     * @param event Événement à vérifier
     * @param requiredPermissions Permissions requises
     * @returns true si l'utilisateur a les permissions requises
     * @private
     */
    private hasRequiredPermissions(
        event: BehaviorEvent,
        requiredPermissions: string[]
    ): boolean {
        // Si l'événement n'a pas de permissions, on ne peut pas vérifier
        if (!event.permissions) {
            return true; // Par défaut, supposer que les permissions sont correctes
        }

        return requiredPermissions.every(perm =>
            event.permissions?.includes(perm)
        );
    }

    /**
     * Vérifie si une IP a déjà été utilisée par un utilisateur
     * @param userId Identifiant de l'utilisateur
     * @param ip Adresse IP à vérifier
     * @returns true si l'IP a déjà été utilisée
     * @private
     */
    private hasIPBeenUsedBefore(userId: string, ip: string): boolean {
        const history = this.behaviorHistory.get(userId) || [];

        return history.some(event => event.ip === ip);
    }

    /**
     * Vérifie si deux emplacements sont proches l'un de l'autre
     * @param loc1 Premier emplacement
     * @param loc2 Deuxième emplacement
     * @param radiusKm Rayon en kilomètres
     * @returns true si les emplacements sont proches
     * @private
     */
    private isLocationNearby(
        loc1: GeoCoordinates,
        loc2: GeoCoordinates,
        radiusKm: number
    ): boolean {
        const distance = this.calculateDistance(
            loc1.latitude,
            loc1.longitude,
            loc2.latitude,
            loc2.longitude
        );

        return distance <= radiusKm;
    }

    /**
     * Calcule la distance entre deux points en kilomètres
     * Utilise la formule de Haversine
     * @param lat1 Latitude du premier point
     * @param lon1 Longitude du premier point
     * @param lat2 Latitude du deuxième point
     * @param lon2 Longitude du deuxième point
     * @returns Distance en kilomètres
     * @protected
     */
    protected calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const R = 6371; // Rayon de la Terre en km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance;
    }
    /**
     * Convertit des degrés en radians
     * @param deg Angle en degrés
     * @returns Angle en radians
     * @protected
     */
    protected deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    /**
     * Vérifie si une séquence est contenue dans une autre
     * @param mainSequence Séquence principale
     * @param subSequence Sous-séquence à rechercher
     * @returns true si la sous-séquence est présente
     * @private
     */
    private containsSequence<T>(mainSequence: T[], subSequence: T[]): boolean {
        if (subSequence.length > mainSequence.length) {
            return false;
        }

        for (let i = 0; i <= mainSequence.length - subSequence.length; i++) {
            let match = true;

            for (let j = 0; j < subSequence.length; j++) {
                if (mainSequence[i + j] !== subSequence[j]) {
                    match = false;
                    break;
                }
            }

            if (match) {
                return true;
            }
        }

        return false;
    }

    /**
     * Groupe les événements par ressource
     * @param events Liste d'événements
     * @returns Map avec les ressources comme clés et les événements comme valeurs
     * @private
     */
    private groupEventsByResource(events: BehaviorEvent[]): Map<string, BehaviorEvent[]> {
        const resourceGroups = new Map<string, BehaviorEvent[]>();

        for (const event of events) {
            if (!resourceGroups.has(event.resource)) {
                resourceGroups.set(event.resource, []);
            }

            const events = resourceGroups.get(event.resource);
            if (events) {
                events.push(event);
            }
        }

        return resourceGroups;
    }

    /**
     * Compte les événements par ressource
     * @param events Liste d'événements
     * @returns Map avec les ressources comme clés et les compteurs comme valeurs
     * @private
     */
    private countEventsByResource(events: BehaviorEvent[]): Map<string, number> {
        const resourceCounts = new Map<string, number>();

        for (const event of events) {
            const count = resourceCounts.get(event.resource) || 0;
            resourceCounts.set(event.resource, count + 1);
        }

        return resourceCounts;
    }

    /**
     * Compte les événements par action
     * @param events Liste d'événements
     * @returns Map avec les actions comme clés et les compteurs comme valeurs
     * @private
     */
    private countEventsByAction(events: BehaviorEvent[]): Map<string, number> {
        const actionCounts = new Map<string, number>();

        for (const event of events) {
            const count = actionCounts.get(event.action) || 0;
            actionCounts.set(event.action, count + 1);
        }

        return actionCounts;
    }

    /**
     * Calcule les statistiques d'accès pour une liste d'événements
     * @param events Liste d'événements
     * @returns Statistiques d'accès
     * @private
     */
    private calculateAccessStats(events: BehaviorEvent[]): AccessStats {
        // Initialiser les statistiques
        const stats: AccessStats = {
            totalAccesses: events.length,
            hourDistribution: new Array(24).fill(0),
            weekdayDistribution: new Array(7).fill(0),
            successRate: 0,
            averageSessionDuration: 0,
            averageTimeBetweenSessions: 0
        };

        // Si aucun événement, retourner les statistiques vides
        if (events.length === 0) {
            return stats;
        }

        // Calculer les distributions
        for (const event of events) {
            const date = new Date(event.timestamp);
            const hour = date.getHours();
            const weekday = date.getDay();

            stats.hourDistribution[hour] += 1;
            stats.weekdayDistribution[weekday] += 1;
        }

        // Normaliser les distributions
        const hourSum = stats.hourDistribution.reduce((a, b) => a + b, 0);
        const weekdaySum = stats.weekdayDistribution.reduce((a, b) => a + b, 0);

        if (hourSum > 0) {
            stats.hourDistribution = stats.hourDistribution.map(count => count / hourSum);
        }

        if (weekdaySum > 0) {
            stats.weekdayDistribution = stats.weekdayDistribution.map(count => count / weekdaySum);
        }

        // Calculer le taux de succès
        const successfulEvents = events.filter(e => e.result === 'success');
        stats.successRate = successfulEvents.length / events.length;

        // Trier les événements par timestamp
        const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);

        // Calculer l'intervalle moyen entre sessions
        let totalInterval = 0;
        let intervalCount = 0;

        for (let i = 1; i < sortedEvents.length; i++) {
            const interval = sortedEvents[i].timestamp - sortedEvents[i - 1].timestamp;

            // Considérer uniquement les intervalles > 10 minutes comme séparant des sessions
            if (interval > 10 * 60 * 1000) {
                totalInterval += interval;
                intervalCount++;
            }
        }

        stats.averageTimeBetweenSessions = intervalCount > 0 ? totalInterval / intervalCount : 0;

        return stats;
    }

    /**
     * Nettoie les événements trop anciens
     * @returns Nombre d'événements supprimés
     */
    public cleanupOldEvents(): number {
        let totalRemoved = 0;
        const cutoff = Date.now() - this.options.historyExpirationDays * 24 * 60 * 60 * 1000;

        for (const [userId, events] of this.behaviorHistory.entries()) {
            const filteredEvents = events.filter(event => event.timestamp >= cutoff);
            const removedCount = events.length - filteredEvents.length;

            if (removedCount > 0) {
                this.behaviorHistory.set(userId, filteredEvents);
                totalRemoved += removedCount;
            }
        }

        if (totalRemoved > 0) {
            this.logger.info(`Cleaned up ${totalRemoved} old behavioral events`);
        }

        return totalRemoved;
    }
}