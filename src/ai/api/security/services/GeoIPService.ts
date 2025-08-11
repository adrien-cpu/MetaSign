// src/ai/api/security/services/GeoIPService.ts
import { Logger } from '@/ai/utils/Logger';

/**
 * Interface pour les données de géolocalisation
 */
export interface GeoLocation {
    latitude: number;
    longitude: number;
    country: string;
    city: string;
    region?: string;
    postal?: string;
    timestamp?: number;
    [key: string]: unknown;
}

/**
 * Interface pour la réponse de l'API de géolocalisation
 */
export interface GeoIPResponse {
    latitude: number;
    longitude: number;
    country_name: string;
    city: string;
    region_name?: string;
    zip?: string;
    [key: string]: unknown;
}

/**
 * Interface pour un service de géolocalisation IP
 */
export interface GeoIPService {
    /**
     * Obtient la localisation géographique à partir d'une adresse IP
     * @param ip Adresse IP
     * @returns Promesse contenant les informations de localisation ou null
     */
    getLocationFromIP(ip: string): Promise<GeoLocation | null>;
}

/**
 * Service de géolocalisation IP
 * Permet d'obtenir des informations géographiques à partir d'une adresse IP
 */
export class DefaultGeoIPService implements GeoIPService {
    private readonly logger = Logger.getInstance('GeoIPService');
    private readonly cache: Map<string, GeoLocation> = new Map();
    private readonly apiKey: string;
    private readonly cacheExpirationMs: number;

    /**
     * Crée une instance du service de géolocalisation
     * @param apiKey Clé API pour le service de géolocalisation
     * @param cacheExpirationMs Durée d'expiration du cache en ms (24h par défaut)
     */
    constructor(apiKey: string, cacheExpirationMs = 24 * 60 * 60 * 1000) {
        this.apiKey = apiKey;
        this.cacheExpirationMs = cacheExpirationMs;
    }

    /**
     * Obtient la localisation géographique à partir d'une adresse IP
     * @param ip Adresse IP
     * @returns Promesse contenant les informations de localisation ou null
     */
    public async getLocationFromIP(ip: string): Promise<GeoLocation | null> {
        try {
            // Vérifier le cache
            if (this.cache.has(ip)) {
                const cachedLocation = this.cache.get(ip)!;

                // Vérifier si les données sont encore valides
                if (Date.now() - (cachedLocation.timestamp || 0) < this.cacheExpirationMs) {
                    return cachedLocation;
                }

                // Supprimer les données expirées
                this.cache.delete(ip);
            }

            // Faire une requête à l'API de géolocalisation
            const location = await this.fetchLocationFromAPI(ip);

            // Mettre en cache la localisation
            if (location) {
                this.cache.set(ip, {
                    ...location,
                    timestamp: Date.now()
                });
            }

            return location;
        } catch (error) {
            this.logger.error(`Error getting location for IP ${ip}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return null;
        }
    }

    /**
     * Fait une requête à l'API de géolocalisation
     * @param ip Adresse IP
     * @returns Promesse contenant les informations de localisation ou null
     * @private
     */
    private async fetchLocationFromAPI(ip: string): Promise<GeoLocation | null> {
        try {
            // Exemple d'utilisation d'une API de géolocalisation
            // Dans un environnement réel, on utiliserait fetch ou axios
            // pour faire une requête HTTP à un service comme ipstack, ipapi, etc.

            // Simulation d'une requête (remplacer par une vraie implémentation)
            const response = await this.simulateAPIRequest(ip);

            if (!response) {
                return null;
            }

            // Construire l'objet GeoLocation en respectant les types optionnels
            const location: GeoLocation = {
                latitude: response.latitude,
                longitude: response.longitude,
                country: response.country_name,
                city: response.city,
                timestamp: Date.now()
            };

            // Ajouter les propriétés optionnelles seulement si elles existent
            if (response.region_name) {
                location.region = response.region_name;
            }

            if (response.zip) {
                location.postal = response.zip;
            }

            return location;
        } catch (error) {
            this.logger.error(`API error for IP ${ip}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return null;
        }
    }

    /**
     * Simule une requête API (à remplacer par une vraie implémentation)
     * @param ip Adresse IP
     * @returns Données simulées
     * @private
     */
    private async simulateAPIRequest(ip: string): Promise<GeoIPResponse | null> {
        // Simulation de requête avec délai
        await new Promise(resolve => setTimeout(resolve, 50));

        // Générer des coordonnées aléatoires pour la démonstration
        const randomLat = 40 + (Math.random() * 10) - 5;
        const randomLng = -70 + (Math.random() * 20) - 10;

        // Pour certains IPs connus, retourner des valeurs spécifiques
        if (ip === '127.0.0.1') {
            return {
                latitude: 37.7749,
                longitude: -122.4194,
                country_name: 'United States',
                city: 'San Francisco',
                region_name: 'California',
                zip: '94105'
            };
        }

        // Générer une localisation aléatoire pour les tests
        return {
            latitude: randomLat,
            longitude: randomLng,
            country_name: 'United States',
            city: 'New York',
            region_name: 'New York',
            zip: '10001'
        };
    }
}