// src/ai/api/security/behavior/detectors/PatternDetectorBase.ts
import { IPatternDetector } from '../interfaces';
import { BehaviorEvent, BehaviorProfile, BehaviorAnomaly } from '../types';
import { Logger } from '@/ai/utils/Logger';

/**
 * Classe de base abstraite pour tous les détecteurs de modèles comportementaux
 * Définit l'interface commune et fournit des méthodes utilitaires partagées
 */
export abstract class PatternDetectorBase implements IPatternDetector {
    protected logger: Logger;

    constructor() {
        // Utiliser correctement la méthode statique getInstance()
        this.logger = Logger.getInstance(this.constructor.name);
    }

    /**
     * Détecte les anomalies dans un événement comportemental
     * @param event Événement à analyser
     * @param profile Profil comportemental de l'utilisateur
     * @returns Liste des anomalies détectées
     */
    public abstract detectAnomalies(
        event: BehaviorEvent,
        profile: BehaviorProfile
    ): Promise<BehaviorAnomaly[]>;

    /**
     * Met à jour le profil comportemental avec un nouvel événement
     * @param profile Profil à mettre à jour
     * @param event Nouvel événement à intégrer
     */
    public abstract updateProfile(
        profile: BehaviorProfile,
        event: BehaviorEvent
    ): Promise<void>;

    /**
     * Récupère les événements récents d'un utilisateur
     * @param history Historique des événements
     * @param userId Identifiant de l'utilisateur
     * @param resource Ressource spécifique (optionnel)
     * @param timeWindow Fenêtre de temps en millisecondes
     * @returns Liste des événements récents
     */
    protected getRecentEvents(
        history: Map<string, BehaviorEvent[]>,
        userId: string,
        resource?: string,
        timeWindow: number = 60 * 60 * 1000 // 1 heure par défaut
    ): BehaviorEvent[] {
        const userHistory = history.get(userId) || [];
        const cutoff = Date.now() - timeWindow;

        return userHistory.filter(event =>
            event.timestamp > cutoff &&
            (!resource || event.resource === resource)
        );
    }

    /**
     * Calcule la distance entre deux points géographiques
     * @param lat1 Latitude point 1
     * @param lon1 Longitude point 1 
     * @param lat2 Latitude point 2
     * @param lon2 Longitude point 2
     * @returns Distance en kilomètres
     */
    protected calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Rayon de la Terre en km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Convertit des degrés en radians
     */
    protected deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }
}