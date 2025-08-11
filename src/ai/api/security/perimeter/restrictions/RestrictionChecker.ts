// src/ai/api/security/perimeter/restrictions/RestrictionChecker.ts

import {
    ZoneRestriction,
    AccessRequest,
    AccessResult
} from '@security/types/perimeter-types';

export class RestrictionChecker {
    /**
     * Vérifie toutes les restrictions pour une requête
     * @param restrictions - Les restrictions à vérifier
     * @param request - La requête d'accès
     */
    async checkRestrictions(
        restrictions: ZoneRestriction[],
        request: AccessRequest
    ): Promise<AccessResult> {
        for (const restriction of restrictions) {
            let restrictionPassed = false;

            switch (restriction.type) {
                case 'network':
                    restrictionPassed = this.checkNetworkRestriction(restriction, request);
                    if (!restrictionPassed) {
                        return this.createResult(false, 'Network restriction violation');
                    }
                    break;

                case 'device':
                    restrictionPassed = this.checkDeviceRestriction(restriction, request);
                    if (!restrictionPassed) {
                        return this.createResult(false, 'Device restriction violation');
                    }
                    break;

                case 'protocol':
                    restrictionPassed = this.checkProtocolRestriction(restriction, request);
                    if (!restrictionPassed) {
                        return this.createResult(false, 'Protocol restriction violation');
                    }
                    break;

                case 'data':
                    // Pourrait être implémenté ultérieurement
                    restrictionPassed = true;
                    break;
            }
        }

        return this.createResult(true, 'All restrictions passed');
    }

    /**
     * Vérifie les restrictions réseau
     */
    private checkNetworkRestriction(
        restriction: ZoneRestriction,
        request: AccessRequest
    ): boolean {
        // Vérifier si le contexte contient une adresse IP
        if (!request.context.ipAddress) {
            return false; // Rejeter par défaut si l'information nécessaire n'est pas disponible
        }

        const sourceIp = this.extractString(request.context.ipAddress, '');
        if (!sourceIp) {
            return false;
        }

        let allowedNetworks: string[] = [];
        let blockedNetworks: string[] = [];

        if (restriction.rules && typeof restriction.rules === 'object') {
            const ruleObj = restriction.rules as Record<string, unknown>;
            allowedNetworks = this.extractStringArray(ruleObj.allowedNetworks);
            blockedNetworks = this.extractStringArray(ruleObj.blockedNetworks);
        }

        return this.isIpAllowed(sourceIp, allowedNetworks) &&
            !this.isIpBlocked(sourceIp, blockedNetworks);
    }

    /**
     * Vérifie les restrictions de périphérique
     */
    private checkDeviceRestriction(
        restriction: ZoneRestriction,
        request: AccessRequest
    ): boolean {
        // Vérifier si les informations de dispositif sont disponibles
        if (!request.context.deviceType || request.context.deviceSecurityLevel === undefined) {
            return false; // Si les informations ne sont pas disponibles, rejeter par précaution
        }

        let allowedTypes: string[] = [];
        let minSecurityLevel: number | undefined = undefined;

        if (restriction.rules && typeof restriction.rules === 'object') {
            const rules = restriction.rules as Record<string, unknown>;

            if (Array.isArray(rules.allowedTypes)) {
                allowedTypes = rules.allowedTypes.filter(type => typeof type === 'string');
            }

            if (typeof rules.minSecurityLevel === 'number') {
                minSecurityLevel = rules.minSecurityLevel;
            }
        }

        // Vérifier le type de dispositif
        if (allowedTypes.length > 0 && !allowedTypes.includes(request.context.deviceType)) {
            return false;
        }

        // Vérifier le niveau de sécurité du dispositif avec vérification explicite du type
        const deviceSecurityLevel = request.context.deviceSecurityLevel;
        if (minSecurityLevel !== undefined &&
            typeof deviceSecurityLevel === 'number' &&
            deviceSecurityLevel < minSecurityLevel) {
            return false;
        }

        return true;
    }

    /**
     * Vérifie les restrictions de protocole
     */
    private checkProtocolRestriction(
        restriction: ZoneRestriction,
        request: AccessRequest
    ): boolean {
        // Extraire l'opération de manière sûre
        const requestOperation = typeof request.operation === 'string' && request.operation !== ''
            ? request.operation
            : 'default';

        // Extraire les protocoles autorisés de manière sûre
        let allowedProtocols: string[] = [];
        let parameters: Record<string, unknown> | undefined;

        if (restriction.rules && typeof restriction.rules === 'object') {
            const rules = restriction.rules as Record<string, unknown>;

            // Extraire allowedProtocols de manière sûre
            if (Array.isArray(rules.allowedProtocols)) {
                allowedProtocols = rules.allowedProtocols
                    .filter((protocol): protocol is string => typeof protocol === 'string');
            }

            // Extraire parameters de manière sûre
            if (rules.parameters && typeof rules.parameters === 'object') {
                parameters = rules.parameters as Record<string, unknown>;
            }
        }

        // Vérifier si le protocole est autorisé
        if (allowedProtocols.length > 0 && !allowedProtocols.includes(requestOperation)) {
            return false;
        }

        // Vérifier les paramètres du protocole si nécessaire
        if (parameters) {
            return this.validateProtocolParameters(requestOperation, parameters);
        }

        return true;
    }

    private isIpAllowed(ip: string, allowedNetworks: string[]): boolean {
        if (!allowedNetworks || allowedNetworks.length === 0) {
            return true; // Si aucun réseau n'est spécifié, autoriser par défaut
        }
        return allowedNetworks.some(network => this.isIpInNetwork(ip, network));
    }

    private isIpBlocked(ip: string, blockedNetworks: string[]): boolean {
        if (!blockedNetworks || blockedNetworks.length === 0) {
            return false; // Si aucun réseau n'est spécifié, ne pas bloquer
        }
        return blockedNetworks.some(network => this.isIpInNetwork(ip, network));
    }

    private isIpInNetwork(ip: string, network: string): boolean {
        // Implémenter la vérification CIDR
        try {
            const [networkAddress, maskBitsStr] = network.split('/');
            const ipNum = this.ipToNumber(ip);
            const networkNum = this.ipToNumber(networkAddress);
            const maskBits = parseInt(maskBitsStr, 10);

            if (isNaN(maskBits)) {
                return false;
            }

            const mask = ~((1 << (32 - maskBits)) - 1);
            return (ipNum & mask) === (networkNum & mask);
        } catch {
            return false;
        }
    }

    private ipToNumber(ip: string): number {
        return ip.split('.')
            .reduce((sum, byte) => (sum << 8) + parseInt(byte, 10), 0) >>> 0;
    }

    private validateProtocolParameters(
        protocol: string,
        parameters: Record<string, unknown>
    ): boolean {
        if (!protocol || protocol === '') {
            return false; // Le protocole doit être une chaîne non vide
        }

        return Object.keys(parameters).length > 0;
    }

    private createResult(allowed: boolean, reason: string): AccessResult {
        return {
            allowed,
            reason,
            auditTrail: {
                rules: [],
                decisions: [reason],
                timestamp: Date.now()
            }
        };
    }

    /**
     * Extrait un tableau de chaînes à partir d'une valeur inconnue
     * @param value Valeur à convertir
     * @returns Tableau de chaînes ou tableau vide si la valeur n'est pas un tableau valide
     */
    private extractStringArray(value: unknown): string[] {
        if (Array.isArray(value)) {
            return value.filter((item): item is string => typeof item === 'string');
        }
        return [];
    }

    /**
     * Extrait une chaîne à partir d'une valeur inconnue
     * @param value Valeur à convertir
     * @param defaultValue Valeur par défaut si la conversion échoue
     * @returns Chaîne extraite ou valeur par défaut
     */
    private extractString(value: unknown, defaultValue: string = ''): string {
        return typeof value === 'string' ? value : defaultValue;
    }
}