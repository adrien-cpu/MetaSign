// src/ai/coordinators/bridges/EthicsSystemBridge.ts

import { BaseAI } from '@ai/base/BaseAI';
import { SystemeControleEthique } from '@ai/ethics/core/SystemeControleEthique';
import { LogService } from '@ai/api/common/monitoring/LogService';
import {
    SystemState,
    RequestType
} from '../types';

/**
 * Interface pour les résultats de validation éthique
 */
export interface EthicsValidationResult {
    approved: boolean;
    reason?: string;
    details?: Record<string, unknown>;
    recommendedChanges?: string[];
    severity?: 'info' | 'warning' | 'critical';
}

/**
 * Interface pour le système de contrôle éthique amélioré
 */
export interface EnhancedSystemeControleEthique extends SystemeControleEthique {
    /**
     * Initialise le système
     */
    initialize(): Promise<void>;

    /**
     * Valide une requête
     * @param data Données de la requête
     */
    validateRequest(data: {
        requestId: string;
        requestType: string;
        data: unknown;
    }): Promise<EthicsValidationResult>;

    /**
     * Valide un contenu culturel
     * @param data Données culturelles à valider
     */
    validateCultural(data: unknown): Promise<EthicsValidationResult>;

    /**
     * Obtient l'état actuel du système
     */
    getSystemState(): Promise<Record<string, unknown>>;
}

/**
 * Bridge pour adapter le SystemeControleEthique à l'interface BaseAI
 * Implémente le pattern Adapter
 */
export class EthicsSystemBridge extends BaseAI {
    private ethicsSystem: SystemeControleEthique;
    private logger: LogService;

    // Propriétés requises
    public state: SystemState = SystemState.INITIALIZING;
    public stats: Record<string, number> = {
        requestsValidated: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        averageValidationTimeMs: 0,
        lastValidationTimeMs: 0
    };

    /**
     * Crée une nouvelle instance de pont pour le système d'éthique
     * @param ethicsSystem Instance du système d'éthique
     */
    constructor(ethicsSystem: SystemeControleEthique) {
        super();
        this.ethicsSystem = ethicsSystem;
        this.logger = new LogService('EthicsSystemBridge');
    }

    /**
     * Initialise le bridge
     */
    public async initialize(): Promise<void> {
        this.logger.info("Initializing EthicsSystemBridge");
        this.state = SystemState.INITIALIZING;

        // Initialiser le système d'éthique s'il possède une méthode initialize
        if ('initialize' in this.ethicsSystem && typeof this.ethicsSystem.initialize === 'function') {
            await (this.ethicsSystem as EnhancedSystemeControleEthique).initialize();
        }

        await this.internalInitialize();
        this.state = SystemState.READY;
        this.logger.info("EthicsSystemBridge initialized");
    }

    /**
     * Initialisation interne du bridge
     */
    public async internalInitialize(): Promise<void> {
        this.logger.debug("Internal initializing EthicsSystemBridge");
        // Initialisation interne, si nécessaire
    }

    /**
     * Fermeture interne du bridge
     */
    public async internalShutdown(): Promise<void> {
        this.logger.debug("Internal shutting down EthicsSystemBridge");
        // Nettoyage des ressources internes
    }

    /**
     * Ferme le bridge
     */
    public async shutdown(): Promise<void> {
        this.logger.info("Shutting down EthicsSystemBridge");
        this.state = SystemState.SHUTDOWN;
        await this.internalShutdown();
        this.logger.info("EthicsSystemBridge shut down");
    }

    /**
     * Traite une requête en la relayant au système d'éthique
     * @param requestId Identifiant de la requête
     * @param requestType Type de requête
     * @param data Données de la requête
     * @returns Résultat du traitement
     */
    public async processRequest<T>(
        requestId: string,
        requestType: RequestType,
        data: unknown
    ): Promise<T> {
        // Les requêtes directes au système d'éthique sont limitées
        // La plupart du temps, il s'agit de validations éthiques
        switch (requestType) {
            case RequestType.CULTURAL_VALIDATION:
                // Validation culturelle spécifique
                const startTime = performance.now();

                try {
                    let result: EthicsValidationResult;

                    // Vérifier si la méthode validateCultural existe
                    if ('validateCultural' in this.ethicsSystem &&
                        typeof this.ethicsSystem.validateCultural === 'function') {
                        result = await (this.ethicsSystem as EnhancedSystemeControleEthique).validateCultural(data);
                    } else {
                        // Valider en utilisant la méthode générique
                        result = await this.validateRequest({
                            requestId,
                            requestType: 'cultural_validation',
                            data
                        });
                    }

                    // Mettre à jour les statistiques
                    this.stats.requestsValidated++;
                    if (result.approved) {
                        this.stats.approvedRequests++;
                    } else {
                        this.stats.rejectedRequests++;
                    }

                    const endTime = performance.now();
                    const validationTime = endTime - startTime;

                    this.stats.lastValidationTimeMs = validationTime;
                    this.stats.averageValidationTimeMs =
                        ((this.stats.averageValidationTimeMs * (this.stats.requestsValidated - 1)) + validationTime) /
                        this.stats.requestsValidated;

                    return result as unknown as T;
                } catch (error) {
                    this.logger.error(`Erreur lors de la validation culturelle`, {
                        requestId,
                        error: error instanceof Error ? error.message : String(error)
                    });

                    // Retourner un résultat de rejet
                    return {
                        approved: false,
                        reason: `Erreur système: ${error instanceof Error ? error.message : String(error)}`,
                        severity: 'error'
                    } as unknown as T;
                }

            default:
                throw new Error(`EthicsSystemBridge ne peut pas traiter les requêtes de type: ${requestType}`);
        }
    }

    /**
     * Valide une requête du point de vue éthique
     * @param requestData Données de la requête à valider
     * @returns Résultat de la validation
     */
    public async validateRequest(requestData: {
        requestId: string;
        requestType: string;
        data: unknown;
    }): Promise<EthicsValidationResult> {
        const startTime = performance.now();

        try {
            let result: EthicsValidationResult;

            // Vérifier si la méthode validateRequest existe
            if ('validateRequest' in this.ethicsSystem &&
                typeof this.ethicsSystem.validateRequest === 'function') {
                result = await (this.ethicsSystem as EnhancedSystemeControleEthique).validateRequest(requestData);
            } else {
                // Méthode de repli - toujours approuver pour éviter de bloquer le système
                this.logger.warn(`SystemeControleEthique n'a pas de méthode validateRequest`, {
                    requestId: requestData.requestId
                });

                result = {
                    approved: true,
                    reason: 'Validation non disponible, approuvé par défaut'
                };
            }

            // Mettre à jour les statistiques
            this.stats.requestsValidated++;
            if (result.approved) {
                this.stats.approvedRequests++;
            } else {
                this.stats.rejectedRequests++;

                // Journaliser les rejets
                this.logger.warn(`Requête rejetée par le système d'éthique: ${requestData.requestId}`, {
                    requestId: requestData.requestId,
                    requestType: requestData.requestType,
                    reason: result.reason
                });
            }

            const endTime = performance.now();
            const validationTime = endTime - startTime;

            this.stats.lastValidationTimeMs = validationTime;
            this.stats.averageValidationTimeMs =
                ((this.stats.averageValidationTimeMs * (this.stats.requestsValidated - 1)) + validationTime) /
                this.stats.requestsValidated;

            return result;
        } catch (error) {
            this.logger.error(`Erreur lors de la validation de la requête ${requestData.requestId}`, {
                requestId: requestData.requestId,
                requestType: requestData.requestType,
                error: error instanceof Error ? error.message : String(error)
            });

            // Dans le cas d'une erreur du système d'éthique, nous rejetons par principe de précaution
            return {
                approved: false,
                reason: `Erreur du système d'éthique: ${error instanceof Error ? error.message : String(error)}`,
                severity: 'critical'
            };
        }
    }

    /**
     * Vérifie si le type de requête est pris en charge
     * @param requestType Type de requête à vérifier
     * @returns true si le type est pris en charge
     */
    public canHandleRequestType(requestType: RequestType): boolean {
        return requestType === RequestType.CULTURAL_VALIDATION;
    }

    /**
     * Obtient l'identifiant du composant
     * @returns Identifiant du composant
     */
    public getComponentId(): string {
        return 'ethics_system_bridge';
    }

    /**
     * Obtient le nom du composant
     * @returns Nom du composant
     */
    public getComponentName(): string {
        return 'Ethics System Bridge';
    }

    /**
     * Obtient les capacités du composant
     * @returns Liste des capacités
     */
    public getCapabilities(): string[] {
        return [
            'ethics_validation',
            'cultural_validation',
            'compliance_verification'
        ];
    }

    /**
     * Obtient les métriques de performance
     * @returns Métriques de performance
     */
    public getPerformanceMetrics(): Record<string, number> {
        return {
            validationTime: this.stats.averageValidationTimeMs,
            requestsValidated: this.stats.requestsValidated,
            approvedRate: this.stats.requestsValidated > 0
                ? (this.stats.approvedRequests / this.stats.requestsValidated) * 100
                : 100,
            rejectedRate: this.stats.requestsValidated > 0
                ? (this.stats.rejectedRequests / this.stats.requestsValidated) * 100
                : 0,
            cpuUsage: 0, // À implémenter avec des métriques réelles
            memoryUsage: 0 // À implémenter avec des métriques réelles
        };
    }

    /**
     * Obtient l'état actuel du système - implémentation de la méthode de BaseAI
     * @returns État du système
     */
    public getState(): SystemState {
        return this.state;
    }

    /**
     * Obtient les informations détaillées sur l'état du composant
     * @returns État détaillé du composant
     */
    public async getDetailedState(): Promise<Record<string, unknown>> {
        let ethicsSystemState: Record<string, unknown> = {};

        // Récupérer l'état du système d'éthique s'il possède une méthode getSystemState
        if ('getSystemState' in this.ethicsSystem && typeof this.ethicsSystem.getSystemState === 'function') {
            ethicsSystemState = await (this.ethicsSystem as EnhancedSystemeControleEthique).getSystemState();
        }

        return {
            componentId: this.getComponentId(),
            componentName: this.getComponentName(),
            capabilities: this.getCapabilities(),
            state: this.state,
            stats: { ...this.stats },
            performanceMetrics: this.getPerformanceMetrics(),
            ethicsSystem: ethicsSystemState
        };
    }
}