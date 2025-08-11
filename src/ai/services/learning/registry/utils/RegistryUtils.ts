/**
 * @file src/ai/services/learning/registry/utils/RegistryUtils.ts
 * @description Utilitaires pour le registre de services
 */

import { ServiceStatus } from '../interfaces';

/**
 * @function formatStatusForDisplay
 * @description Formate un état de service pour l'affichage
 * @param status État du service
 * @returns État formaté
 */
export function formatStatusForDisplay(status: ServiceStatus): string {
    const statusMap: Record<ServiceStatus, string> = {
        initializing: 'Initializing...',
        ready: 'Ready',
        degraded: 'Degraded (Limited Functionality)',
        error: 'Error',
        shutdown: 'Shutting Down'
    };

    return statusMap[status] || status;
}

/**
 * @function getStatusSeverity
 * @description Récupère la sévérité d'un état
 * @param status État du service
 * @returns Niveau de sévérité (0-3, 0 étant le plus critique)
 */
export function getStatusSeverity(status: ServiceStatus): number {
    const severityMap: Record<ServiceStatus, number> = {
        ready: 3,
        initializing: 2,
        degraded: 1,
        error: 0,
        shutdown: 0
    };

    return severityMap[status] || 0;
}

/**
 * @function generateServiceId
 * @description Génère un identifiant unique pour un service
 * @param name Nom du service
 * @param type Type du service
 * @param version Version du service
 * @returns Identifiant de service
 */
export function generateServiceId(name: string, type: string, version: string): string {
    const sanitized = [
        name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        type.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        version.replace(/[^a-z0-9.-]/g, '-')
    ].join('.');

    return sanitized;
}

/**
 * @function sortServicesByDependency
 * @description Trie une liste de services en respectant l'ordre des dépendances
 * @param serviceIds Liste des IDs de services
 * @param getDependencies Fonction pour récupérer les dépendances d'un service
 * @returns Liste triée des IDs de services
 */
export function sortServicesByDependency(
    serviceIds: string[],
    getDependencies: (id: string) => string[]
): string[] {
    // Implémentation basique d'un tri topologique
    const result: string[] = [];
    const visited = new Set<string>();
    const temp = new Set<string>();

    const visit = (id: string): void => {
        if (temp.has(id)) {
            // Détection de cycle, on ignore
            return;
        }

        if (visited.has(id)) {
            return;
        }

        temp.add(id);

        // Visite des dépendances
        const dependencies = getDependencies(id);
        for (const depId of dependencies) {
            if (serviceIds.includes(depId)) {
                visit(depId);
            }
        }

        temp.delete(id);
        visited.add(id);
        result.push(id);
    };

    // Visite de tous les services
    for (const id of serviceIds) {
        if (!visited.has(id)) {
            visit(id);
        }
    }

    return result;
}

/**
 * @function formatTimeDuration
 * @description Formate une durée en secondes sous forme lisible
 * @param seconds Durée en secondes
 * @returns Chaîne formatée (ex: "2h 30m 15s")
 */
export function formatTimeDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const parts: string[] = [];

    if (hours > 0) {
        parts.push(`${hours}h`);
    }

    if (minutes > 0 || hours > 0) {
        parts.push(`${minutes}m`);
    }

    parts.push(`${remainingSeconds}s`);

    return parts.join(' ');
}