/**
 * @file src/ai/services/learning/human/coda/codavirtuel/repositories/SessionRepository.ts
 * @description Repository pour la gestion des sessions d'enseignement CODA
 * 
 * Fonctionnalités :
 * - 📚 Gestion complète des sessions d'apprentissage
 * - 🔍 Recherche avancée et filtrage
 * - 📊 Métriques et analytics des sessions
 * - 💾 Persistance avec cache intelligent
 * - 🎯 Tracking des interactions en temps réel
 * - 🔄 États des sessions (active, paused, completed)
 * 
 * @module repositories
 * @version 1.0.0
 * @since 2025
 * @author MetaSign Team - CODA Session Repository
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { BasePersistenceAdapter, PersistenceAdapterFactory, type PersistenceConfig } from './core/BasePersistenceAdapter';
import type { TeachingSession, CECRLLevel, AIMood } from '../types/index';

/**
 * États possibles d'une session
 */
export type SessionStatus = 'active' | 'paused' | 'completed' | 'cancelled' | 'scheduled';

/**
 * Données complètes d'une session stockées
 */
export interface StoredSession extends TeachingSession {
    readonly status: SessionStatus;
    readonly createdAt: Date;
    readonly completedAt?: Date;
    readonly pausedAt?: Date;
    readonly resumedAt?: Date;
    readonly interactions: SessionInteraction[];
    readonly realTimeMetrics: RealTimeSessionMetrics;
    readonly tags: string[];
    readonly notes: string;
}

/**
 * Interaction pendant une session
 */
export interface SessionInteraction {
    readonly id: string;
    readonly timestamp: Date;
    readonly type: 'teaching' | 'question' | 'correction' | 'encouragement' | 'break';
    readonly concept: string;
    readonly mentorInput: string;
    readonly aiResponse: string;
    readonly comprehensionScore: number;
    readonly emotionalState: AIMood;
    readonly duration: number; // en secondes
}

/**
 * Métriques temps réel d'une session
 */
export interface RealTimeSessionMetrics {
    readonly startTime: Date;
    readonly lastUpdateTime: Date;
    readonly totalActiveTime: number; // en minutes
    readonly pausedDuration: number; // en minutes
    readonly interactionCount: number;
    readonly averageComprehension: number;
    readonly conceptsIntroduced: string[];
    readonly conceptsReinforced: string[];
    readonly emotionalEvolution: Array<{
        readonly timestamp: Date;
        readonly mood: AIMood;
        readonly intensity: number;
    }>;
    readonly difficultyAdjustments: Array<{
        readonly timestamp: Date;
        readonly from: number;
        readonly to: number;
        readonly reason: string;
    }>;
}

/**
 * Critères de recherche de sessions
 */
export interface SessionSearchCriteria {
    readonly mentorId?: string;
    readonly studentId?: string;
    readonly status?: SessionStatus[];
    readonly dateRange?: {
        readonly from: Date;
        readonly to: Date;
    };
    readonly durationRange?: {
        readonly minMinutes: number;
        readonly maxMinutes: number;
    };
    readonly level?: CECRLLevel[];
    readonly concepts?: string[];
    readonly tags?: string[];
    readonly minComprehension?: number;
    readonly maxComprehension?: number;
    readonly limit?: number;
    readonly offset?: number;
    readonly sortBy?: 'date' | 'duration' | 'comprehension' | 'interactions';
    readonly sortOrder?: 'asc' | 'desc';
}

/**
 * Statistiques d'agrégation des sessions
 */
export interface SessionAggregateStats {
    readonly totalSessions: number;
    readonly activeSessionsCount: number;
    readonly completedSessionsCount: number;
    readonly averageDuration: number;
    readonly totalLearningTime: number;
    readonly averageComprehension: number;
    readonly conceptDistribution: Record<string, number>;
    readonly levelDistribution: Record<CECRLLevel, number>;
    readonly mentorActivityStats: Record<string, {
        readonly sessionCount: number;
        readonly totalTime: number;
        readonly averageScore: number;
    }>;
    readonly timeRangeAnalysis: {
        readonly dailyAverage: number;
        readonly weeklyTrend: number[];
        readonly monthlyGrowth: number;
    };
}

/**
 * Repository pour les sessions d'enseignement CODA
 */
export class SessionRepository {
    private readonly logger = LoggerFactory.getLogger('SessionRepository');
    private adapter: BasePersistenceAdapter<StoredSession> | null = null;
    private isInitialized = false;

    constructor(
        private readonly persistenceConfig: PersistenceConfig
    ) {
        this.logger.debug('📚 Repository sessions CODA initialisé', {
            storageType: persistenceConfig.type
        });
    }

    // ==================== INITIALISATION ====================

    public async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            this.adapter = await PersistenceAdapterFactory.createAdapter<StoredSession>(
                this.persistenceConfig
            );
            
            await this.adapter.initialize();
            this.isInitialized = true;

            this.logger.info('✅ Repository sessions initialisé', {
                storageType: this.persistenceConfig.type
            });

        } catch (error) {
            this.logger.error('❌ Erreur initialisation repository sessions', { error });
            throw new Error(`Impossible d'initialiser le repository sessions: ${error}`);
        }
    }

    public async destroy(): Promise<void> {
        if (this.adapter) {
            await this.adapter.destroy();
            this.adapter = null;
        }
        this.isInitialized = false;
        this.logger.info('🧹 Repository sessions fermé');
    }

    // ==================== GESTION DES SESSIONS ====================

    /**
     * Crée une nouvelle session
     */
    public async createSession(
        baseSession: TeachingSession,
        status: SessionStatus = 'active'
    ): Promise<string> {
        this.ensureInitialized();

        const sessionId = this.generateSessionId();
        const now = new Date();

        const storedSession: StoredSession = {
            ...baseSession,
            sessionId,
            status,
            createdAt: now,
            interactions: [],
            realTimeMetrics: {
                startTime: now,
                lastUpdateTime: now,
                totalActiveTime: 0,
                pausedDuration: 0,
                interactionCount: 0,
                averageComprehension: 0,
                conceptsIntroduced: [],
                conceptsReinforced: [],
                emotionalEvolution: [],
                difficultyAdjustments: []
            },
            tags: [],
            notes: ''
        };

        await this.adapter!.create(sessionId, storedSession);

        this.logger.info('✨ Nouvelle session créée', {
            sessionId,
            mentorId: baseSession.mentorId,
            topic: baseSession.content.topic
        });

        return sessionId;
    }

    /**
     * Récupère une session par son ID
     */
    public async getSession(sessionId: string): Promise<StoredSession | null> {
        this.ensureInitialized();
        return await this.adapter!.read(sessionId);
    }

    /**
     * Met à jour une session
     */
    public async updateSession(sessionId: string, updates: Partial<StoredSession>): Promise<void> {
        this.ensureInitialized();

        const updatesWithTimestamp = {
            ...updates,
            realTimeMetrics: updates.realTimeMetrics ? {
                ...updates.realTimeMetrics,
                lastUpdateTime: new Date()
            } : undefined
        };

        await this.adapter!.update(sessionId, updatesWithTimestamp);
        this.logger.debug('🔄 Session mise à jour', { sessionId });
    }

    /**
     * Change le statut d'une session
     */
    public async updateSessionStatus(sessionId: string, newStatus: SessionStatus): Promise<void> {
        this.ensureInitialized();

        const now = new Date();
        const updates: Partial<StoredSession> = { status: newStatus };

        // Ajouter les timestamps appropriés selon le statut
        switch (newStatus) {
            case 'completed':
                updates.completedAt = now;
                break;
            case 'paused':
                updates.pausedAt = now;
                break;
            case 'active':
                updates.resumedAt = now;
                break;
        }

        await this.updateSession(sessionId, updates);

        this.logger.info('📊 Statut session changé', {
            sessionId,
            newStatus,
            timestamp: now
        });
    }

    /**
     * Supprime une session
     */
    public async deleteSession(sessionId: string): Promise<void> {
        this.ensureInitialized();
        await this.adapter!.delete(sessionId);
        this.logger.info('🗑️ Session supprimée', { sessionId });
    }

    // ==================== INTERACTIONS ====================

    /**
     * Ajoute une interaction à une session
     */
    public async addInteraction(sessionId: string, interaction: Omit<SessionInteraction, 'id'>): Promise<string> {
        this.ensureInitialized();

        const session = await this.adapter!.read(sessionId);
        if (!session) {
            throw new Error(`Session non trouvée: ${sessionId}`);
        }

        const interactionId = this.generateInteractionId();
        const fullInteraction: SessionInteraction = {
            ...interaction,
            id: interactionId
        };

        // Mettre à jour les interactions et métriques
        const updatedInteractions = [...session.interactions, fullInteraction];
        const updatedMetrics = this.recalculateRealTimeMetrics(session.realTimeMetrics, updatedInteractions);

        await this.updateSession(sessionId, {
            interactions: updatedInteractions,
            realTimeMetrics: updatedMetrics
        });

        this.logger.debug('💬 Interaction ajoutée', {
            sessionId,
            interactionId,
            type: interaction.type
        });

        return interactionId;
    }

    /**
     * Récupère les interactions d'une session
     */
    public async getSessionInteractions(
        sessionId: string,
        limit?: number,
        offset?: number
    ): Promise<SessionInteraction[]> {
        this.ensureInitialized();

        const session = await this.adapter!.read(sessionId);
        if (!session) return [];

        const interactions = session.interactions;
        
        if (limit !== undefined) {
            const start = offset || 0;
            return interactions.slice(start, start + limit);
        }

        return interactions;
    }

    // ==================== RECHERCHE ET FILTRAGE ====================

    /**
     * Recherche des sessions selon des critères
     */
    public async searchSessions(criteria: SessionSearchCriteria): Promise<StoredSession[]> {
        this.ensureInitialized();

        // Récupérer toutes les sessions (à optimiser avec des filtres DB réels)
        let sessions = await this.adapter!.list();

        // Appliquer les filtres
        sessions = this.applySearchCriteria(sessions, criteria);

        // Tri
        if (criteria.sortBy) {
            sessions = this.sortSessions(sessions, criteria.sortBy, criteria.sortOrder || 'desc');
        }

        // Pagination
        if (criteria.limit !== undefined) {
            const start = criteria.offset || 0;
            sessions = sessions.slice(start, start + criteria.limit);
        }

        return sessions;
    }

    /**
     * Récupère les sessions actives d'un mentor
     */
    public async getActiveSessions(mentorId?: string): Promise<StoredSession[]> {
        return this.searchSessions({
            mentorId,
            status: ['active', 'paused']
        });
    }

    /**
     * Récupère l'historique des sessions d'un utilisateur
     */
    public async getUserSessionHistory(
        mentorId: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<StoredSession[]> {
        return this.searchSessions({
            mentorId,
            status: ['completed'],
            sortBy: 'date',
            sortOrder: 'desc',
            limit,
            offset
        });
    }

    // ==================== MÉTRIQUES ET ANALYTICS ====================

    /**
     * Calcule les statistiques agrégées des sessions
     */
    public async getAggregateStats(criteria?: SessionSearchCriteria): Promise<SessionAggregateStats> {
        this.ensureInitialized();

        const sessions = criteria ? 
            await this.searchSessions(criteria) : 
            await this.adapter!.list();

        return this.calculateAggregateStats(sessions);
    }

    /**
     * Obtient les métriques temps réel d'une session
     */
    public async getSessionRealTimeMetrics(sessionId: string): Promise<RealTimeSessionMetrics | null> {
        this.ensureInitialized();

        const session = await this.adapter!.read(sessionId);
        return session?.realTimeMetrics || null;
    }

    // ==================== UTILITAIRES ====================

    /**
     * Crée une sauvegarde des sessions
     */
    public async createBackup(backupPath: string): Promise<void> {
        this.ensureInitialized();
        await this.adapter!.backup(backupPath);
        this.logger.info('📦 Backup sessions créé', { backupPath });
    }

    /**
     * Restaure depuis une sauvegarde
     */
    public async restoreFromBackup(backupPath: string): Promise<void> {
        this.ensureInitialized();
        await this.adapter!.restore(backupPath);
        this.logger.info('♻️ Backup sessions restauré', { backupPath });
    }

    /**
     * Obtient les statistiques du repository
     */
    public getRepositoryStats() {
        this.ensureInitialized();
        return this.adapter!.getStats();
    }

    // ==================== MÉTHODES PRIVÉES ====================

    private ensureInitialized(): void {
        if (!this.isInitialized || !this.adapter) {
            throw new Error('Repository sessions non initialisé. Appelez initialize() d\'abord.');
        }
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateInteractionId(): string {
        return `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    private applySearchCriteria(sessions: StoredSession[], criteria: SessionSearchCriteria): StoredSession[] {
        return sessions.filter(session => {
            // Filtre par mentor
            if (criteria.mentorId && session.mentorId !== criteria.mentorId) {
                return false;
            }

            // Filtre par élève
            if (criteria.studentId && session.aiStudentId !== criteria.studentId) {
                return false;
            }

            // Filtre par statut
            if (criteria.status && !criteria.status.includes(session.status)) {
                return false;
            }

            // Filtre par date
            if (criteria.dateRange) {
                const sessionDate = new Date(session.timestamp);
                if (sessionDate < criteria.dateRange.from || sessionDate > criteria.dateRange.to) {
                    return false;
                }
            }

            // Filtre par durée
            if (criteria.durationRange) {
                const duration = session.realTimeMetrics.totalActiveTime;
                if (duration < criteria.durationRange.minMinutes || duration > criteria.durationRange.maxMinutes) {
                    return false;
                }
            }

            // Filtre par niveau
            if (criteria.level && !criteria.level.includes(session.content.targetLevel)) {
                return false;
            }

            // Filtre par concepts
            if (criteria.concepts && criteria.concepts.length > 0) {
                const sessionConcepts = session.realTimeMetrics.conceptsIntroduced.concat(
                    session.realTimeMetrics.conceptsReinforced
                );
                if (!criteria.concepts.some(concept => sessionConcepts.includes(concept))) {
                    return false;
                }
            }

            // Filtre par compréhension
            if (criteria.minComprehension !== undefined && 
                session.realTimeMetrics.averageComprehension < criteria.minComprehension) {
                return false;
            }

            if (criteria.maxComprehension !== undefined && 
                session.realTimeMetrics.averageComprehension > criteria.maxComprehension) {
                return false;
            }

            return true;
        });
    }

    private sortSessions(
        sessions: StoredSession[], 
        sortBy: NonNullable<SessionSearchCriteria['sortBy']>, 
        order: 'asc' | 'desc'
    ): StoredSession[] {
        return sessions.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'date':
                    comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                    break;
                case 'duration':
                    comparison = a.realTimeMetrics.totalActiveTime - b.realTimeMetrics.totalActiveTime;
                    break;
                case 'comprehension':
                    comparison = a.realTimeMetrics.averageComprehension - b.realTimeMetrics.averageComprehension;
                    break;
                case 'interactions':
                    comparison = a.realTimeMetrics.interactionCount - b.realTimeMetrics.interactionCount;
                    break;
            }

            return order === 'desc' ? -comparison : comparison;
        });
    }

    private recalculateRealTimeMetrics(
        currentMetrics: RealTimeSessionMetrics,
        interactions: SessionInteraction[]
    ): RealTimeSessionMetrics {
        if (interactions.length === 0) return currentMetrics;

        const averageComprehension = interactions.reduce(
            (sum, interaction) => sum + interaction.comprehensionScore, 0
        ) / interactions.length;

        const conceptsIntroduced = Array.from(new Set(
            interactions.filter(i => i.type === 'teaching').map(i => i.concept)
        ));

        const conceptsReinforced = Array.from(new Set(
            interactions.filter(i => i.type === 'correction').map(i => i.concept)
        ));

        const emotionalEvolution = interactions.map(interaction => ({
            timestamp: interaction.timestamp,
            mood: interaction.emotionalState,
            intensity: interaction.comprehensionScore
        }));

        return {
            ...currentMetrics,
            lastUpdateTime: new Date(),
            interactionCount: interactions.length,
            averageComprehension,
            conceptsIntroduced,
            conceptsReinforced,
            emotionalEvolution
        };
    }

    private calculateAggregateStats(sessions: StoredSession[]): SessionAggregateStats {
        if (sessions.length === 0) {
            return {
                totalSessions: 0,
                activeSessionsCount: 0,
                completedSessionsCount: 0,
                averageDuration: 0,
                totalLearningTime: 0,
                averageComprehension: 0,
                conceptDistribution: {},
                levelDistribution: {} as Record<CECRLLevel, number>,
                mentorActivityStats: {},
                timeRangeAnalysis: {
                    dailyAverage: 0,
                    weeklyTrend: [],
                    monthlyGrowth: 0
                }
            };
        }

        const totalSessions = sessions.length;
        const activeSessionsCount = sessions.filter(s => s.status === 'active').length;
        const completedSessionsCount = sessions.filter(s => s.status === 'completed').length;
        
        const totalLearningTime = sessions.reduce((sum, s) => sum + s.realTimeMetrics.totalActiveTime, 0);
        const averageDuration = totalLearningTime / totalSessions;
        
        const averageComprehension = sessions.reduce(
            (sum, s) => sum + s.realTimeMetrics.averageComprehension, 0
        ) / totalSessions;

        // Distribution des concepts
        const conceptDistribution: Record<string, number> = {};
        sessions.forEach(session => {
            session.realTimeMetrics.conceptsIntroduced.forEach(concept => {
                conceptDistribution[concept] = (conceptDistribution[concept] || 0) + 1;
            });
        });

        // Distribution des niveaux
        const levelDistribution = {} as Record<CECRLLevel, number>;
        sessions.forEach(session => {
            const level = session.content.targetLevel;
            levelDistribution[level] = (levelDistribution[level] || 0) + 1;
        });

        // Statistiques des mentors
        const mentorActivityStats: Record<string, {
            sessionCount: number;
            totalTime: number;
            averageScore: number;
        }> = {};

        sessions.forEach(session => {
            const mentorId = session.mentorId;
            if (!mentorActivityStats[mentorId]) {
                mentorActivityStats[mentorId] = {
                    sessionCount: 0,
                    totalTime: 0,
                    averageScore: 0
                };
            }
            
            mentorActivityStats[mentorId].sessionCount++;
            mentorActivityStats[mentorId].totalTime += session.realTimeMetrics.totalActiveTime;
        });

        // Calculer la moyenne des scores pour chaque mentor
        Object.keys(mentorActivityStats).forEach(mentorId => {
            const mentorSessions = sessions.filter(s => s.mentorId === mentorId);
            const avgScore = mentorSessions.reduce(
                (sum, s) => sum + s.realTimeMetrics.averageComprehension, 0
            ) / mentorSessions.length;
            mentorActivityStats[mentorId].averageScore = avgScore;
        });

        return {
            totalSessions,
            activeSessionsCount,
            completedSessionsCount,
            averageDuration,
            totalLearningTime,
            averageComprehension,
            conceptDistribution,
            levelDistribution,
            mentorActivityStats,
            timeRangeAnalysis: {
                dailyAverage: totalLearningTime / 30, // Approximation
                weeklyTrend: [], // À implémenter avec analyse temporelle
                monthlyGrowth: 0 // À implémenter avec analyse temporelle
            }
        };
    }
}