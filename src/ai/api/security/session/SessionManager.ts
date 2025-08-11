//src/ai/api/security/session/SessionManager.ts
import { SecurityAuditor } from '../types/SecurityTypes';
import { randomBytes } from 'crypto';

// Types manquants
export interface CreateSessionParams {
    userId: string;
    ip: string;
    userAgent: string;
    fingerprint?: string;
    data?: Record<string, unknown>;
}

export interface SessionContext {
    ip: string;
    userAgent: string;
    fingerprint?: string;
}

export interface SessionConfig {
    // Configuration générale des sessions
    session: {
        lifetime: number;           // Durée de vie en ms
        inactivityTimeout: number;  // Timeout d'inactivité en ms
        renewalThreshold: number;   // Seuil de renouvellement en ms
        maxConcurrentSessions: number;
        singleSessionPerUser: boolean;
    };
    // Configuration de sécurité
    security: {
        tokenLength: number;        // Longueur du token en bytes
        rotateTokens: boolean;      // Rotation des tokens
        validateIP: boolean;        // Validation de l'IP
        validateUserAgent: boolean; // Validation du User-Agent
        csrfProtection: boolean;    // Protection CSRF
        fingerprintValidation: boolean; // Validation de l'empreinte du navigateur
    };
    // Configuration du stockage
    storage: {
        type: 'memory' | 'redis';
        cleanupInterval: number;    // Intervalle de nettoyage en ms
        persistSessions: boolean;   // Persistance des sessions
    };
}

export interface Session {
    id: string;
    userId: string;
    token: string;
    csrfToken?: string;
    createdAt: number;
    expiresAt: number;
    lastActivity: number;
    ip: string;
    userAgent: string;
    fingerprint?: string;
    data: Record<string, unknown>;
    isValid: boolean;
    renewalCount: number;
}

export interface SessionValidationResult {
    valid: boolean;
    session?: Session;
    error?: string;
    requiresRenewal?: boolean;
}

export interface SessionMetrics {
    activeSessions: number;
    totalSessions: number;
    averageSessionDuration: number;
    invalidatedSessions: number;
    renewedSessions: number;
}

// Extension de SecurityAuditor pour ajouter les méthodes manquantes
interface SessionAuditMethods {
    logSessionCreation(data: { sessionId: string; userId: string; ip: string; timestamp: number }): Promise<void>;
    logError(data: { operation: string; error: string; context: unknown; timestamp: number }): Promise<void>;
    logSessionRenewal(data: { sessionId: string; userId: string; timestamp: number }): Promise<void>;
    logSessionInvalidation(data: { sessionId: string; userId: string; reason: string; timestamp: number }): Promise<void>;
    logCleanup(data: { type: string; cleaned: number; timestamp: number }): Promise<void>;
}

// Type composé pour l'auditeur avec les méthodes de session
type SessionSecurityAuditor = SecurityAuditor & SessionAuditMethods;

export class SessionManager {
    private sessions: Map<string, Session> = new Map();
    private userSessions: Map<string, Set<string>> = new Map();
    private metrics: SessionMetrics = {
        activeSessions: 0,
        totalSessions: 0,
        averageSessionDuration: 0,
        invalidatedSessions: 0,
        renewedSessions: 0
    };

    constructor(
        private readonly config: SessionConfig,
        private readonly securityAuditor: SessionSecurityAuditor
    ) {
        this.startCleanupInterval();
    }

    public async createSession(params: CreateSessionParams): Promise<Session> {
        try {
            // Vérifier les sessions concurrentes
            await this.checkConcurrentSessions(params.userId);

            // Créer la nouvelle session
            const session: Session = {
                id: this.generateSessionId(),
                userId: params.userId,
                token: this.generateToken(),
                csrfToken: this.config.security.csrfProtection ? this.generateToken() : undefined,
                createdAt: Date.now(),
                expiresAt: Date.now() + this.config.session.lifetime,
                lastActivity: Date.now(),
                ip: params.ip,
                userAgent: params.userAgent,
                fingerprint: params.fingerprint,
                data: params.data || {},
                isValid: true,
                renewalCount: 0
            };

            // Enregistrer la session
            this.sessions.set(session.id, session);

            // Associer la session à l'utilisateur
            this.addUserSession(params.userId, session.id);

            // Mettre à jour les métriques
            this.updateMetrics('create');

            // Audit
            await this.securityAuditor.logSessionCreation({
                sessionId: session.id,
                userId: params.userId,
                ip: params.ip,
                timestamp: Date.now()
            });

            return session;
        } catch (error) {
            await this.securityAuditor.logError({
                operation: 'session_creation',
                error: error instanceof Error ? error.message : 'Unknown error',
                context: params,
                timestamp: Date.now()
            });
            throw error;
        }
    }

    public async validateSession(token: string, context: SessionContext): Promise<SessionValidationResult> {
        try {
            const session = this.findSessionByToken(token);
            if (!session) {
                return { valid: false, error: 'Session not found' };
            }

            if (!session.isValid) {
                return { valid: false, error: 'Session invalidated' };
            }

            if (Date.now() > session.expiresAt) {
                await this.invalidateSession(session.id, 'expired');
                return { valid: false, error: 'Session expired' };
            }

            // Valider le contexte de sécurité
            const contextValidation = this.validateSessionContext(session, context);
            if (!contextValidation.valid) {
                await this.invalidateSession(session.id, contextValidation.error || 'context_validation_failed');
                return contextValidation;
            }

            // Vérifier si la session nécessite un renouvellement
            const requiresRenewal = this.checkRenewalNeeded(session);

            // Mettre à jour l'activité
            session.lastActivity = Date.now();

            return {
                valid: true,
                session,
                requiresRenewal
            };
        } catch (error) {
            await this.securityAuditor.logError({
                operation: 'session_validation',
                error: error instanceof Error ? error.message : 'Unknown error',
                context: { token },
                timestamp: Date.now()
            });
            throw error;
        }
    }

    public async renewSession(sessionId: string): Promise<Session> {
        try {
            const session = this.sessions.get(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }

            if (!session.isValid) {
                throw new Error('Cannot renew invalid session');
            }

            // Générer un nouveau token si configuré
            if (this.config.security.rotateTokens) {
                session.token = this.generateToken();
                if (this.config.security.csrfProtection) {
                    session.csrfToken = this.generateToken();
                }
            }

            // Mettre à jour les timestamps
            session.lastActivity = Date.now();
            session.expiresAt = Date.now() + this.config.session.lifetime;
            session.renewalCount++;

            // Mettre à jour les métriques
            this.updateMetrics('renew');

            // Audit
            await this.securityAuditor.logSessionRenewal({
                sessionId,
                userId: session.userId,
                timestamp: Date.now()
            });

            return session;
        } catch (error) {
            await this.securityAuditor.logError({
                operation: 'session_renewal',
                error: error instanceof Error ? error.message : 'Unknown error',
                context: { sessionId },
                timestamp: Date.now()
            });
            throw error;
        }
    }

    public async invalidateSession(sessionId: string, reason: string): Promise<void> {
        try {
            const session = this.sessions.get(sessionId);
            if (!session || !session.isValid) return;

            // Invalider la session
            session.isValid = false;

            // Retirer des sessions utilisateur
            this.removeUserSession(session.userId, sessionId);

            // Mettre à jour les métriques
            this.updateMetrics('invalidate');

            // Audit
            await this.securityAuditor.logSessionInvalidation({
                sessionId,
                userId: session.userId,
                reason,
                timestamp: Date.now()
            });

        } catch (error) {
            await this.securityAuditor.logError({
                operation: 'session_invalidation',
                error: error instanceof Error ? error.message : 'Unknown error',
                context: { sessionId, reason },
                timestamp: Date.now()
            });
            throw error;
        }
    }

    public async invalidateUserSessions(userId: string, reason: string): Promise<void> {
        const userSessionIds = this.userSessions.get(userId);
        if (!userSessionIds) return;

        const promises = Array.from(userSessionIds).map(sessionId =>
            this.invalidateSession(sessionId, reason)
        );

        await Promise.all(promises);
    }

    public async getSessionData(sessionId: string, key: string): Promise<unknown> {
        const session = this.sessions.get(sessionId);
        if (!session || !session.isValid) {
            throw new Error('Invalid session');
        }
        return session.data[key];
    }

    public async setSessionData(sessionId: string, key: string, value: unknown): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session || !session.isValid) {
            throw new Error('Invalid session');
        }
        session.data[key] = value;
    }

    public async validateCSRFToken(sessionId: string, token: string): Promise<boolean> {
        const session = this.sessions.get(sessionId);
        if (!session || !session.isValid || !session.csrfToken) {
            return false;
        }
        return session.csrfToken === token;
    }

    public getMetrics(): SessionMetrics {
        return { ...this.metrics };
    }

    private generateSessionId(): string {
        return randomBytes(16).toString('hex');
    }

    private generateToken(): string {
        return randomBytes(this.config.security.tokenLength).toString('base64');
    }

    private findSessionByToken(token: string): Session | undefined {
        return Array.from(this.sessions.values())
            .find(session => session.token === token);
    }

    private validateSessionContext(session: Session, context: SessionContext): SessionValidationResult {
        // Valider l'IP
        if (this.config.security.validateIP && session.ip !== context.ip) {
            return { valid: false, error: 'IP mismatch' };
        }

        // Valider le User-Agent
        if (this.config.security.validateUserAgent && session.userAgent !== context.userAgent) {
            return { valid: false, error: 'User-Agent mismatch' };
        }

        // Valider l'empreinte du navigateur
        if (this.config.security.fingerprintValidation &&
            session.fingerprint &&
            session.fingerprint !== context.fingerprint) {
            return { valid: false, error: 'Fingerprint mismatch' };
        }

        return { valid: true };
    }

    private checkRenewalNeeded(session: Session): boolean {
        const timeUntilExpiry = session.expiresAt - Date.now();
        return timeUntilExpiry < this.config.session.renewalThreshold;
    }

    private async checkConcurrentSessions(userId: string): Promise<void> {
        const userSessionIds = this.userSessions.get(userId) || new Set();

        // Vérifier le nombre de sessions actives
        if (this.config.session.singleSessionPerUser && userSessionIds.size > 0) {
            // Invalider les sessions existantes
            await this.invalidateUserSessions(userId, 'new_session_created');
        } else if (userSessionIds.size >= this.config.session.maxConcurrentSessions) {
            throw new Error('Maximum concurrent sessions reached');
        }
    }

    private addUserSession(userId: string, sessionId: string): void {
        if (!this.userSessions.has(userId)) {
            this.userSessions.set(userId, new Set());
        }
        const sessions = this.userSessions.get(userId);
        if (sessions) {
            sessions.add(sessionId);
        }
    }

    private removeUserSession(userId: string, sessionId: string): void {
        const userSessionIds = this.userSessions.get(userId);
        if (userSessionIds) {
            userSessionIds.delete(sessionId);
            if (userSessionIds.size === 0) {
                this.userSessions.delete(userId);
            }
        }
    }

    private startCleanupInterval(): void {
        setInterval(() => this.cleanupSessions(), this.config.storage.cleanupInterval);
    }

    private async cleanupSessions(): Promise<void> {
        const now = Date.now();
        let cleaned = 0;

        for (const [sessionId, session] of this.sessions) {
            // Nettoyer les sessions expirées ou inactives
            if (session.expiresAt <= now ||
                (now - session.lastActivity) > this.config.session.inactivityTimeout) {
                await this.invalidateSession(sessionId, 'cleanup');
                cleaned++;
            }
        }

        if (cleaned > 0) {
            await this.securityAuditor.logCleanup({
                type: 'sessions',
                cleaned,
                timestamp: now
            });
        }
    }

    private updateMetrics(action: 'create' | 'renew' | 'invalidate'): void {
        switch (action) {
            case 'create':
                this.metrics.totalSessions++;
                this.metrics.activeSessions++;
                break;
            case 'renew':
                this.metrics.renewedSessions++;
                break;
            case 'invalidate':
                this.metrics.invalidatedSessions++;
                this.metrics.activeSessions--;
                break;
        }

        // Calculer la durée moyenne des sessions
        const activeSessions = Array.from(this.sessions.values())
            .filter(s => s.isValid);

        if (activeSessions.length > 0) {
            const totalDuration = activeSessions.reduce(
                (sum, session) => sum + (Date.now() - session.createdAt),
                0
            );
            this.metrics.averageSessionDuration = totalDuration / activeSessions.length;
        }
    }
}