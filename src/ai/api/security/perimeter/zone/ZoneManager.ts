// src/ai/api/security/perimeter/zone/ZoneManager.ts

import { SecurityZone, ZoneTransition, PerimeterError, SecurityPerimeter } from '@security/types/perimeter-types';
import { SecurityAuditor } from '@security/types/SecurityTypes';

export class ZoneManager {
    constructor(
        private readonly perimeter: SecurityPerimeter,
        private readonly securityAuditor: SecurityAuditor
    ) { }

    /**
     * Valide et récupère une zone par son ID
     * @param zoneId - L'identifiant de la zone
     * @throws {PerimeterError} Si la zone n'existe pas
     */
    async validateZone(zoneId: string): Promise<SecurityZone> {
        const zone = this.perimeter.zones.get(zoneId);
        if (!zone) {
            throw new PerimeterError(`Zone not found: ${zoneId}`, 'ZONE_NOT_FOUND');
        }
        return zone;
    }

    /**
     * Configure une zone de sécurité
     * @param zone - La zone à configurer
     */
    async configureZone(zone: SecurityZone): Promise<void> {
        // Valider la configuration de la zone
        await this.validateZoneConfig(zone);

        // Mettre à jour les transitions si nécessaire
        if (zone.parent) {
            await this.updateZoneTransitions(zone);
        }

        // Sauvegarder la zone
        this.perimeter.zones.set(zone.id, zone);

        // Auditer la modification
        await this.auditZoneChange('configure', zone);
    }

    /**
     * Valide la configuration d'une zone
     * @param zone - La zone à valider
     */
    private async validateZoneConfig(zone: SecurityZone): Promise<void> {
        // Vérifier les paramètres obligatoires
        if (!zone.id || !zone.name || zone.level === undefined) {
            throw new PerimeterError(
                'Invalid zone configuration: missing required parameters',
                'INVALID_ZONE_CONFIG'
            );
        }

        // Vérifier la hiérarchie
        if (zone.parent && !this.perimeter.zones.has(zone.parent)) {
            throw new PerimeterError(
                `Parent zone not found: ${zone.parent}`,
                'PARENT_ZONE_NOT_FOUND'
            );
        }
    }

    /**
     * Récupère une zone par son ID
     * @param zoneId - L'identifiant de la zone
     */
    async getZone(zoneId: string): Promise<SecurityZone | undefined> {
        return this.perimeter.zones.get(zoneId);
    }

    /**
     * Récupère toutes les zones
     */
    async getZones(): Promise<SecurityZone[]> {
        return Array.from(this.perimeter.zones.values());
    }

    /**
     * Récupère la hiérarchie des zones
     */
    async getZoneHierarchy(): Promise<SecurityZone[]> {
        return Array.from(this.perimeter.zones.values())
            .filter(zone => !zone.parent)
            .map(zone => this.buildZoneHierarchy(zone));
    }

    /**
     * Construit la hiérarchie d'une zone
     * @param zone - La zone racine
     */
    private buildZoneHierarchy(zone: SecurityZone): SecurityZone {
        const children: string[] = [];

        // Récupérer les zones enfants et les ajouter
        for (const childId of zone.children) {
            const childZone = this.perimeter.zones.get(childId);
            if (childZone) {
                children.push(childId);
            }
        }

        return {
            ...zone,
            children
        };
    }

    /**
     * Met à jour les transitions pour une zone
     * @param zone - La zone dont les transitions doivent être mises à jour
     */
    async updateZoneTransitions(zone: SecurityZone): Promise<void> {
        // Mettre à jour les transitions pour la nouvelle zone
        for (const otherZone of this.perimeter.zones.values()) {
            if (otherZone.id !== zone.id) {
                const forwardTransition: ZoneTransition = {
                    from: zone.id,
                    to: otherZone.id,
                    allowed: zone.level >= otherZone.level,
                    restrictions: otherZone.restrictions
                };

                const reverseTransition: ZoneTransition = {
                    from: otherZone.id,
                    to: zone.id,
                    allowed: otherZone.level >= zone.level,
                    restrictions: zone.restrictions
                };

                this.perimeter.transitions.set(
                    `${zone.id}-${otherZone.id}`,
                    forwardTransition
                );
                this.perimeter.transitions.set(
                    `${otherZone.id}-${zone.id}`,
                    reverseTransition
                );
            }
        }
    }

    /**
     * Valide une transition entre zones
     * @param from - Zone source
     * @param to - Zone destination
     */
    async validateZoneTransition(
        from: SecurityZone,
        to: SecurityZone
    ): Promise<ZoneTransition> {
        const transitionKey = `${from.id}-${to.id}`;
        let transition = this.perimeter.transitions.get(transitionKey);

        if (!transition) {
            // Créer une transition par défaut basée sur les niveaux de sécurité
            transition = {
                from: from.id,
                to: to.id,
                allowed: from.level >= to.level,
                restrictions: to.restrictions
            };
            this.perimeter.transitions.set(transitionKey, transition);
        }

        return transition;
    }

    /**
     * Récupère toutes les transitions
     */
    async getTransitions(): Promise<ZoneTransition[]> {
        return Array.from(this.perimeter.transitions.values());
    }

    /**
     * Audite un changement de zone
     * @param action - L'action effectuée
     * @param zone - La zone modifiée
     */
    private async auditZoneChange(action: string, zone: SecurityZone): Promise<void> {
        await this.securityAuditor.logSecurityEvent({
            type: 'zone_configuration',
            severity: 'HIGH',
            timestamp: new Date(),
            details: {
                action,
                zoneId: zone.id,
                zoneName: zone.name,
                securityLevel: zone.level
            },
            source: 'ZoneManager',
            context: {
                userId: 'system',
                roles: ['admin'],
                permissions: ['config:write'],
                operation: 'zone_update',
                resource: zone.id,
                deviceType: 'system',
                deviceSecurityLevel: 10,
                ipAddress: '127.0.0.1',
                allowed: true,
                reason: `Zone ${action}: ${zone.id}`,
                sourceZone: 'system',
                targetZone: zone.id
            }
        });
    }
}