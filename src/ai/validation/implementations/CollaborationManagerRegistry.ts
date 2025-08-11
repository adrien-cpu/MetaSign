// src/ai/validation/implementations/CollaborationManagerRegistry.ts
import { ICollaborationManagerRegistry } from '../interfaces/ICollaborationManagerRegistry';
import { IValidationManager } from '../interfaces/IValidationManager';
import { IFeedbackManager } from '../interfaces/IFeedbackManager';
import { IConsensusManager } from '../interfaces/IConsensusManager';
import { IExpertProfileManager } from '../interfaces/IExpertProfileManager';
import { IValidationStateManager } from '../interfaces/IValidationStateManager';
import { IEventManager } from '../interfaces/IEventManager';
import { Result, ErrorCode, tryCatch } from '../utils/result-helpers';
import { EventManager, getEventManager } from '../services/EventManager';
import { ValidationManager, ValidationManagerConfig } from './ValidationManager';
import { FeedbackManager, FeedbackManagerConfig } from './FeedbackManager';
import { ConsensusManager, ConsensusManagerConfig } from './ConsensusManager';
import { ExpertProfileManager, ExpertProfileManagerConfig } from './ExpertProfileManager';
import { ValidationStateManager, ValidationStateManagerConfig } from './ValidationStateManager';
import {
    ValidationFeedback,
    ConsensusOptions,
    CollaborativeValidationRequest,
    ValidationEventType
} from '../types';

/**
 * Type pour le callback d'événement
 */
type EventCallback = (validationId: string, eventType: ValidationEventType, data: unknown) => void;

/**
 * Adaptateur pour EventManager qui implémente correctement l'interface IEventManager
 */
class EventManagerAdapter implements IEventManager {
    private eventManager: EventManager;
    private subscriptions: Map<string, { eventType: ValidationEventType | 'all'; callback: EventCallback }> = new Map();
    private subscriptionCount = 0;

    constructor(eventManager: EventManager) {
        this.eventManager = eventManager;
    }

    /**
     * S'abonne à un événement
     */
    subscribe(
        eventType: ValidationEventType | 'all',
        callback: EventCallback
    ): string {
        const id = `subscription_${++this.subscriptionCount}`;

        // Stocker l'abonnement localement
        this.subscriptions.set(id, { eventType, callback });

        // Implémenter nous-mêmes la gestion des abonnements sans dépendre de EventManager
        // si les types ne sont pas compatibles

        return id;
    }

    /**
     * Se désabonne d'un événement
     */
    unsubscribe(subscriptionId: string): boolean {
        // Supprimer l'abonnement de notre registre local
        return this.subscriptions.delete(subscriptionId);
    }

    /**
     * Déclenche un événement
     */
    trigger(validationId: string, eventType: ValidationEventType, data?: unknown): void {
        // Notifier tous les abonnés concernés
        for (const [, subscription] of this.subscriptions) {
            if (subscription.eventType === 'all' || subscription.eventType === eventType) {
                subscription.callback(validationId, eventType, data);
            }
        }
    }

    /**
     * Efface tous les abonnements
     */
    clearSubscriptions(): void {
        this.subscriptions.clear();
    }

    /**
     * Obtient le nombre d'abonnements
     */
    getSubscriptionCount(): number {
        return this.subscriptions.size;
    }
}

/**
 * Extensions pour les interfaces de base avec types de retour compatibles
 */
interface InitializableValidationStateManager extends IValidationStateManager {
    initialize(): Promise<Result<void>>;
    shutdown(force?: boolean): Promise<Result<void>>;
}

interface InitializableValidationManager extends IValidationManager {
    initialize(): Promise<Result<void>>;
    shutdown(force?: boolean): Promise<Result<void>>;
}

interface InitializableFeedbackManager extends IFeedbackManager {
    initialize(): Promise<Result<void>>;
    shutdown(force?: boolean): Promise<Result<void>>;
}

interface InitializableExpertProfileManager extends IExpertProfileManager {
    initialize(): Promise<Result<void>>;
    shutdown(force?: boolean): Promise<Result<void>>;
}

interface InitializableConsensusManager extends IConsensusManager {
    initialize(): Promise<Result<void>>;
    shutdown(force?: boolean): Promise<Result<void>>;
}

/**
 * Configuration pour le registre des gestionnaires
 */
export interface CollaborationManagerRegistryConfig {
    /**
     * Activer la journalisation
     */
    enableLogging?: boolean;

    /**
     * Niveau de journalisation
     */
    logLevel?: 'error' | 'warn' | 'info' | 'debug';

    /**
     * Configuration du gestionnaire d'événements
     */
    eventManagerConfig?: {
        enableLogging?: boolean;
        logLevel?: 'error' | 'warn' | 'info' | 'debug';
    };

    /**
     * Configuration du gestionnaire de validations
     */
    validationManagerConfig?: ValidationManagerConfig;

    /**
     * Configuration du gestionnaire de feedback
     */
    feedbackManagerConfig?: FeedbackManagerConfig;

    /**
     * Configuration du gestionnaire de consensus
     */
    consensusManagerConfig?: ConsensusManagerConfig;

    /**
     * Configuration du gestionnaire de profils d'experts
     */
    expertProfileManagerConfig?: ExpertProfileManagerConfig;

    /**
     * Configuration du gestionnaire d'états
     */
    validationStateManagerConfig?: ValidationStateManagerConfig;

    /**
     * Options par défaut pour le calcul du consensus
     */
    defaultConsensusOptions?: ConsensusOptions;

    /**
     * Nombre minimum de feedbacks requis par défaut
     */
    defaultMinFeedbackRequired?: number;
}

/**
 * Registre des gestionnaires du système de validation collaborative
 */
export class CollaborationManagerRegistry implements ICollaborationManagerRegistry {
    private initialized = false;
    private readonly config: Required<CollaborationManagerRegistryConfig>;
    private readonly eventManager: EventManager;
    private readonly eventManagerAdapter: IEventManager;
    private readonly validationManager: InitializableValidationManager;
    private readonly feedbackManager: InitializableFeedbackManager;
    private readonly consensusManager: InitializableConsensusManager;
    private readonly expertProfileManager: InitializableExpertProfileManager;
    private readonly validationStateManager: InitializableValidationStateManager;

    // Cache pour la gestion des validations
    private readonly validationCache = new Map<string, CollaborativeValidationRequest>();
    private readonly feedbackMap = new Map<string, ValidationFeedback[]>();
    private readonly minFeedbackRequiredMap = new Map<string, number>();

    /**
     * Crée une nouvelle instance du registre des gestionnaires
     * @param config Configuration optionnelle
     */
    constructor(config: CollaborationManagerRegistryConfig = {}) {
        this.config = {
            enableLogging: config.enableLogging || false,
            logLevel: config.logLevel || 'error',
            eventManagerConfig: {
                enableLogging: config.eventManagerConfig?.enableLogging || false,
                logLevel: config.eventManagerConfig?.logLevel || 'error'
            },
            validationManagerConfig: config.validationManagerConfig || {},
            feedbackManagerConfig: config.feedbackManagerConfig || {},
            consensusManagerConfig: config.consensusManagerConfig || {},
            expertProfileManagerConfig: config.expertProfileManagerConfig || {},
            validationStateManagerConfig: config.validationStateManagerConfig || {},
            defaultConsensusOptions: config.defaultConsensusOptions || {
                algorithm: 'weighted',
                approvalThreshold: 0.7,
                minParticipants: 3
            },
            defaultMinFeedbackRequired: config.defaultMinFeedbackRequired || 3
        };

        // Instancier le gestionnaire d'événements
        // Utilisation des valeurs définies pour éviter le problème avec undefined
        const enableLogging = this.config.eventManagerConfig.enableLogging ?? false;
        const logLevel = this.config.eventManagerConfig.logLevel ?? 'error';

        this.eventManager = getEventManager({
            enableLogging,
            logLevel
        });

        // Créer l'adaptateur pour EventManager qui implémente IEventManager
        this.eventManagerAdapter = new EventManagerAdapter(this.eventManager);

        // Instancier le gestionnaire d'états (dépendance de base)
        this.validationStateManager = new ValidationStateManager(
            this.eventManagerAdapter,
            {
                enableLogging: this.config.enableLogging,
                logLevel: this.config.logLevel,
                ...this.config.validationStateManagerConfig
            }
        ) as unknown as InitializableValidationStateManager;

        // Instancier le gestionnaire de validations
        this.validationManager = new ValidationManager(
            this.eventManagerAdapter,
            this.validationStateManager,
            {
                enableLogging: this.config.enableLogging,
                logLevel: this.config.logLevel,
                defaultMinFeedbackRequired: this.config.defaultMinFeedbackRequired,
                ...this.config.validationManagerConfig
            }
        ) as unknown as InitializableValidationManager;

        // Instancier le gestionnaire de feedback
        this.feedbackManager = new FeedbackManager(
            this.eventManagerAdapter,
            this.validationStateManager,
            {
                enableLogging: this.config.enableLogging,
                logLevel: this.config.logLevel,
                minFeedbackForTransition: this.config.defaultMinFeedbackRequired,
                ...this.config.feedbackManagerConfig
            }
        ) as unknown as InitializableFeedbackManager;

        // Instancier le gestionnaire d'experts
        this.expertProfileManager = new ExpertProfileManager(
            this.eventManagerAdapter,
            this.getExpertFeedback.bind(this),
            this.getConsensusResults.bind(this),
            {
                enableLogging: this.config.enableLogging,
                logLevel: this.config.logLevel,
                ...this.config.expertProfileManagerConfig
            }
        ) as unknown as InitializableExpertProfileManager;

        // Instancier le gestionnaire de consensus
        this.consensusManager = new ConsensusManager(
            this.eventManagerAdapter,
            this.validationStateManager,
            this.getValidationFeedback.bind(this),
            this.getMinFeedbackRequired.bind(this),
            {
                enableLogging: this.config.enableLogging,
                logLevel: this.config.logLevel,
                defaultConsensusOptions: this.config.defaultConsensusOptions,
                ...this.config.consensusManagerConfig
            }
        ) as unknown as InitializableConsensusManager;
    }

    /**
     * Initialise tous les managers
     */
    async initialize(): Promise<Result<void>> {
        if (this.initialized) {
            return { success: true };
        }

        try {
            // Initialiser les gestionnaires dans l'ordre des dépendances
            await this.validationStateManager.initialize();
            await this.validationManager.initialize();
            await this.feedbackManager.initialize();
            await this.expertProfileManager.initialize();
            await this.consensusManager.initialize();

            this.initialized = true;
            return { success: true };
        } catch (error) {
            console.error(`Failed to initialize collaboration manager registry: ${error}`);
            return {
                success: false,
                error: {
                    code: ErrorCode.INITIALIZATION_FAILED,
                    message: 'Failed to initialize collaboration manager registry',
                    details: { error: error instanceof Error ? error.message : String(error) }
                }
            };
        }
    }

    /**
     * Libère les ressources et arrête tous les managers
     * @param force Forcer l'arrêt même si des opérations sont en cours
     */
    async shutdown(force?: boolean): Promise<Result<void>> {
        if (!this.initialized) {
            return { success: true };
        }

        try {
            // Arrêter les gestionnaires dans l'ordre inverse des dépendances
            await this.consensusManager.shutdown(force);
            await this.expertProfileManager.shutdown(force);
            await this.feedbackManager.shutdown(force);
            await this.validationManager.shutdown(force);
            await this.validationStateManager.shutdown(force);

            this.initialized = false;
            return { success: true };
        } catch (error) {
            console.error(`Failed to shutdown collaboration manager registry: ${error}`);
            return {
                success: false,
                error: {
                    code: ErrorCode.OPERATION_FAILED,
                    message: 'Failed to shutdown collaboration manager registry',
                    details: { error: error instanceof Error ? error.message : String(error) }
                }
            };
        }
    }

    /**
     * Obtient le gestionnaire de validations
     */
    getValidationManager(): IValidationManager {
        this.checkInitialized();
        return this.validationManager;
    }

    /**
     * Obtient le gestionnaire de feedback
     */
    getFeedbackManager(): IFeedbackManager {
        this.checkInitialized();
        return this.feedbackManager;
    }

    /**
     * Obtient le gestionnaire de consensus
     */
    getConsensusManager(): IConsensusManager {
        this.checkInitialized();
        return this.consensusManager;
    }

    /**
     * Obtient le gestionnaire de profils d'experts
     */
    getExpertProfileManager(): IExpertProfileManager {
        this.checkInitialized();
        return this.expertProfileManager;
    }

    /**
     * Obtient le gestionnaire d'état des validations
     */
    getValidationStateManager(): IValidationStateManager {
        this.checkInitialized();
        return this.validationStateManager;
    }

    /**
     * Exécute une fonction dans une transaction
     * @param operation Fonction à exécuter dans la transaction
     */
    async transaction<T>(
        operation: (registry: ICollaborationManagerRegistry) => Promise<T>
    ): Promise<Result<T>> {
        this.checkInitialized();

        return tryCatch(
            async () => {
                // Dans une implémentation réelle, on utiliserait des transactions de base de données
                // Pour l'instant, c'est une simulation simple
                return await operation(this);
            },
            ErrorCode.TRANSACTION_FAILED,
            'Transaction failed'
        );
    }

    /**
     * Vérifie que le registre est initialisé, sinon lance une erreur
     */
    private checkInitialized(): void {
        if (!this.initialized) {
            throw new Error('Collaboration manager registry is not initialized');
        }
    }

    /**
     * Récupère les feedbacks d'une validation (pour le gestionnaire de consensus)
     * @param validationId ID de la validation
     */
    private async getValidationFeedback(validationId: string): Promise<ValidationFeedback[]> {
        const result = await this.feedbackManager.getAllFeedback(validationId);
        if (!result.success) {
            return [];
        }
        return result.data?.items || [];
    }

    /**
     * Récupère les feedbacks d'un expert (pour le gestionnaire de profils)
     * Cette méthode sert d'adaptation entre les gestionnaires
     * @returns Liste de feedbacks associés à l'expert
     */
    private async getExpertFeedback(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expertId: string
    ): Promise<{ validationId: string; approved: boolean; score?: number }[]> {
        /* Dans une implémentation complète, cette méthode interrogerait une base de données
         * en utilisant l'ID de l'expert. Pour l'instant, on renvoie un tableau vide. */
        return [];
    }

    /**
     * Récupère les résultats de consensus (pour le gestionnaire de profils)
     */
    private async getConsensusResults(): Promise<Map<string, { approved: boolean; score?: number }>> {
        // Dans une implémentation complète, cette méthode interrogerait une base de données
        // Pour l'instant, on renvoie une map vide
        return new Map();
    }

    /**
     * Récupère le nombre minimum de feedbacks requis pour une validation
     * @param validationId ID de la validation
     */
    private async getMinFeedbackRequired(validationId: string): Promise<number> {
        if (this.minFeedbackRequiredMap.has(validationId)) {
            return this.minFeedbackRequiredMap.get(validationId)!;
        }
        return this.config.defaultMinFeedbackRequired;
    }
}