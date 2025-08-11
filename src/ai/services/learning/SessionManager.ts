/**
 * @file src/ai/services/learning/SessionManager.ts
 * @description Gestionnaire de session pour le module d'apprentissage
 * @module SessionManager
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * Ce module gère les sessions d'apprentissage, leur création, leur suivi
 * et leur récupération en cas de problème.
 */

import { LearningServiceRegistry } from '@/ai/services/learning/registry/registry/LearningServiceRegistry';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Interface pour les options de session
 * @interface SessionOptions
 */
interface SessionOptions {
    /**
     * Durée maximale de la session (en ms)
     */
    maxDuration?: number;

    /**
     * Période d'inactivité avant expiration (en ms)
     */
    inactivityTimeout?: number;

    /**
     * Persistance de la session
     */
    persistent?: boolean;

    /**
     * Données initiales de la session
     */
    initialData?: Record<string, unknown>;
}

/**
 * Interface pour les données de session
 * @interface SessionData
 */
interface SessionData {
    /**
     * Identifiant unique de la session
     */
    id: string;

    /**
     * Horodatage de création
     */
    createdAt: Date;

    /**
     * Dernier accès
     */
    lastAccess: Date;

    /**
     * État de la session
     */
    state: 'active' | 'idle' | 'expired' | 'closed';

    /**
     * Données associées à la session
     */
    data: Record<string, unknown>;
}

/**
 * Gestionnaire de session pour le module d'apprentissage
 * 
 * @class SessionManager
 * @description Gère les sessions d'apprentissage, y compris leur création,
 * leur suivi et leur récupération en cas de problème.
 */
export class SessionManager {
    /**
     * Instance unique (singleton)
     * @private
     * @static
     */
    private static instance?: SessionManager;

    /**
     * Logger pour le suivi des opérations
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('SessionManager');

    /**
     * Sessions actives
     * @private
     */
    private sessions: Map<string, SessionData>;

    /**
     * Options par défaut
     * @private
     * @readonly
     */
    private readonly defaultOptions: SessionOptions = {
        maxDuration: 3600000, // 1 heure
        inactivityTimeout: 1800000, // 30 minutes
        persistent: false
    };

    /**
     * Intervalle de vérification des sessions expirées
     * @private
     */
    private cleanupInterval?: NodeJS.Timeout;

    /**
     * Constructeur du gestionnaire de session
     * 
     * @constructor
     * @private
     */
    private constructor() {
        this.sessions = new Map<string, SessionData>();

        // Démarrer le nettoyage périodique
        this.startCleanup();

        this.logger.info('SessionManager initialized');
    }

    /**
     * Obtient l'instance unique du gestionnaire de session (singleton)
     * 
     * @method getInstance
     * @static
     * @returns {SessionManager} Instance unique du gestionnaire de session
     * @public
     */
    public static getInstance(): SessionManager {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }

    /**
     * Crée une nouvelle session
     * 
     * @method createSession
     * @param {SessionOptions} [options] - Options de la session
     * @returns {string} Identifiant de la session
     * @public
     */
    public createSession(options?: SessionOptions): string {
        const sessionId = this.generateSessionId();
        const now = new Date();

        const mergedOptions = {
            ...this.defaultOptions,
            ...options
        };

        const session: SessionData = {
            id: sessionId,
            createdAt: now,
            lastAccess: now,
            state: 'active',
            data: mergedOptions.initialData || {}
        };

        this.sessions.set(sessionId, session);

        this.logger.info(`Session ${sessionId} created`);

        return sessionId;
    }

    /**
     * Récupère une session
     * 
     * @method getSession
     * @param {string} sessionId - Identifiant de la session
     * @returns {SessionData | undefined} Données de la session ou undefined si non trouvée
     * @public
     */
    public getSession(sessionId: string): SessionData | undefined {
        const session = this.sessions.get(sessionId);

        if (session) {
            // Mettre à jour le dernier accès
            session.lastAccess = new Date();

            // Si la session était inactive, la réactiver
            if (session.state === 'idle') {
                session.state = 'active';
            }
        }

        return session;
    }

    /**
     * Met à jour les données d'une session
     * 
     * @method updateSession
     * @param {string} sessionId - Identifiant de la session
     * @param {Record<string, unknown>} data - Données à mettre à jour
     * @returns {boolean} Vrai si la mise à jour a réussi
     * @public
     */
    public updateSession(sessionId: string, data: Record<string, unknown>): boolean {
        const session = this.sessions.get(sessionId);

        if (!session) {
            return false;
        }

        // Mettre à jour les données
        session.data = {
            ...session.data,
            ...data
        };

        // Mettre à jour le dernier accès
        session.lastAccess = new Date();

        return true;
    }

    /**
     * Ferme une session
     * 
     * @method closeSession
     * @param {string} sessionId - Identifiant de la session
     * @returns {boolean} Vrai si la fermeture a réussi
     * @public
     */
    public closeSession(sessionId: string): boolean {
        const session = this.sessions.get(sessionId);

        if (!session) {
            return false;
        }

        // Marquer la session comme fermée
        session.state = 'closed';

        // Supprimer la session
        this.sessions.delete(sessionId);

        this.logger.info(`Session ${sessionId} closed`);

        return true;
    }

    /**
     * Vérifie si une session est active
     * 
     * @method isSessionActive
     * @param {string} sessionId - Identifiant de la session
     * @returns {boolean} Vrai si la session est active
     * @public
     */
    public isSessionActive(sessionId: string): boolean {
        const session = this.sessions.get(sessionId);

        if (!session) {
            return false;
        }

        return session.state === 'active';
    }

    /**
     * Récupère une session défaillante
     * 
     * @method recoverSession
     * @param {string} sessionId - Identifiant de la session
     * @returns {boolean} Vrai si la récupération a réussi
     * @public
     */
    public recoverSession(sessionId: string): boolean {
        const session = this.sessions.get(sessionId);

        if (!session || session.state === 'closed') {
            return false;
        }

        // Réactiver la session
        session.state = 'active';
        session.lastAccess = new Date();

        this.logger.info(`Session ${sessionId} recovered`);

        return true;
    }

    /**
     * Obtient le nombre de sessions actives
     * 
     * @method getActiveSessionCount
     * @returns {number} Nombre de sessions actives
     * @public
     */
    public getActiveSessionCount(): number {
        let count = 0;

        for (const session of this.sessions.values()) {
            if (session.state === 'active') {
                count++;
            }
        }

        return count;
    }

    /**
     * Démarre le nettoyage périodique des sessions expirées
     * 
     * @method startCleanup
     * @private
     */
    private startCleanup(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredSessions();
        }, 300000); // 5 minutes
    }

    /**
     * Nettoie les sessions expirées
     * 
     * @method cleanupExpiredSessions
     * @private
     */
    private cleanupExpiredSessions(): void {
        const now = Date.now();
        let expiredCount = 0;

        for (const [sessionId, session] of this.sessions.entries()) {
            // Vérifier l'inactivité
            const inactiveTime = now - session.lastAccess.getTime();

            if (inactiveTime > (this.defaultOptions.inactivityTimeout || 1800000)) {
                // Session inactive
                session.state = 'expired';
                this.sessions.delete(sessionId);
                expiredCount++;
            }

            // Vérifier la durée maximale
            const sessionAge = now - session.createdAt.getTime();

            if (sessionAge > (this.defaultOptions.maxDuration || 3600000)) {
                // Session trop ancienne
                session.state = 'expired';
                this.sessions.delete(sessionId);
                expiredCount++;
            }
        }

        if (expiredCount > 0) {
            this.logger.info(`Cleaned up ${expiredCount} expired sessions`);
        }
    }

    /**
     * Génère un identifiant de session unique
     * 
     * @method generateSessionId
     * @returns {string} Identifiant de session
     * @private
     */
    private generateSessionId(): string {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    }

    /**
     * Réinitialise l'état de récupération d'un service
     * 
     * @param {string} serviceId - Identifiant du service à réinitialiser
     * @returns {void}
     * @public
     */
    public resetRecoveryState(serviceId: string): void {
        try {
            // Vérifier si le registre existe
            const registry = LearningServiceRegistry.getInstance();

            if (registry) {
                // Utiliser une approche avec cast de type pour accéder aux propriétés
                // Nous utilisons Record<string, unknown> pour éviter l'utilisation de any
                const registryWithMethods = registry as unknown as Record<string, unknown>;

                // Tentative d'accès à resetServiceRecoveryState
                if (typeof registryWithMethods.resetServiceRecoveryState === 'function') {
                    // Nous pouvons appeler la fonction directement
                    (registryWithMethods.resetServiceRecoveryState as (id: string) => void)(serviceId);
                    this.logger.info(`Recovery state reset for service ${serviceId} using resetServiceRecoveryState`);
                    return;
                }

                // Tentative d'accès au RecoveryManager
                if (
                    registryWithMethods.recoveryManager &&
                    typeof registryWithMethods.recoveryManager === 'object'
                ) {
                    // Cast le recoveryManager en Record<string, unknown>
                    const recoveryManager = registryWithMethods.recoveryManager as Record<string, unknown>;

                    // Vérifier si la méthode resetRecoveryState existe
                    if (typeof recoveryManager.resetRecoveryState === 'function') {
                        // Appeler la méthode
                        (recoveryManager.resetRecoveryState as (id: string) => void)(serviceId);
                        this.logger.info(`Recovery state reset for service ${serviceId} using recoveryManager`);
                        return;
                    }
                }
            }

            // Fallback si aucune méthode n'est disponible
            this.logger.warn(
                `Could not reset recovery state for service ${serviceId}. ` +
                `Please implement resetServiceRecoveryState in LearningServiceRegistry ` +
                `or make recoveryManager accessible.`
            );

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to reset recovery state for service ${serviceId}: ${errorMessage}`);
        }
    }
}