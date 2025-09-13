/**
 * @file src/ai/services/learning/human/coda/codavirtuel/api/controllers/SessionController.ts
 * @description Contrôleur API REST pour la gestion des sessions d'enseignement CODA
 * 
 * Fonctionnalités :
 * - 📚 CRUD complet des sessions d'enseignement
 * - 🎮 Contrôle temps réel des sessions (start, pause, resume, end)
 * - 💬 Gestion des interactions durant les sessions
 * - 📊 Métriques et analytics des sessions
 * - 🔍 Recherche et filtrage avancés
 * - 🔄 WebSocket pour notifications temps réel
 * 
 * @module api/controllers
 * @version 1.0.0
 * @since 2025
 * @author MetaSign Team - CODA Session API
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type { 
    SessionRepository, 
    StoredSession, 
    SessionInteraction,
    SessionSearchCriteria,
    SessionStatus
} from '../../repositories/SessionRepository';
import type { ReverseApprenticeshipSystem } from '../../ReverseApprenticeshipSystem';
import type { TeachingSession, CECRLLevel, AIMood } from '../../types/index';

/**
 * Interfaces pour les requêtes API
 */
export interface CreateSessionRequest {
    readonly mentorId: string;
    readonly topic: string;
    readonly targetLevel: CECRLLevel;
    readonly concepts?: string[];
    readonly teachingMethod?: string;
    readonly expectedDuration?: number;
    readonly materials?: string[];
    readonly tags?: string[];
}

export interface UpdateSessionRequest {
    readonly status?: SessionStatus;
    readonly notes?: string;
    readonly tags?: string[];
}

export interface AddInteractionRequest {
    readonly type: 'teaching' | 'question' | 'correction' | 'encouragement' | 'break';
    readonly concept: string;
    readonly mentorInput: string;
    readonly aiResponse?: string;
    readonly comprehensionScore?: number;
    readonly emotionalState?: AIMood;
}

export interface SessionSearchRequest {
    readonly mentorId?: string;
    readonly studentId?: string;
    readonly status?: SessionStatus[];
    readonly dateFrom?: string;
    readonly dateTo?: string;
    readonly minDuration?: number;
    readonly maxDuration?: number;
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
 * Interfaces pour les réponses API
 */
export interface SessionResponse {
    readonly sessionId: string;
    readonly mentorId: string;
    readonly studentId: string;
    readonly status: SessionStatus;
    readonly topic: string;
    readonly targetLevel: CECRLLevel;
    readonly startTime: string;
    readonly endTime?: string;
    readonly duration: number;
    readonly realTimeMetrics: {
        readonly totalActiveTime: number;
        readonly interactionCount: number;
        readonly averageComprehension: number;
        readonly conceptsIntroduced: string[];
        readonly currentMood: AIMood;
        readonly difficultyLevel: number;
    };
    readonly tags: string[];
    readonly notes: string;
    readonly createdAt: string;
    readonly lastUpdateAt: string;
}

export interface InteractionResponse {
    readonly id: string;
    readonly sessionId: string;
    readonly timestamp: string;
    readonly type: string;
    readonly concept: string;
    readonly mentorInput: string;
    readonly aiResponse: string;
    readonly comprehensionScore: number;
    readonly emotionalState: AIMood;
    readonly duration: number;
}

export interface SessionStatsResponse {
    readonly totalSessions: number;
    readonly activeSessionsCount: number;
    readonly completedSessionsCount: number;
    readonly averageDuration: number;
    readonly totalLearningTime: number;
    readonly averageComprehension: number;
    readonly topConcepts: Array<{
        readonly concept: string;
        readonly count: number;
        readonly avgComprehension: number;
    }>;
    readonly levelDistribution: Record<CECRLLevel, number>;
    readonly mentorRankings: Array<{
        readonly mentorId: string;
        readonly sessionCount: number;
        readonly averageScore: number;
        readonly totalTime: number;
    }>;
}

export interface ApiResponse<T = any> {
    readonly success: boolean;
    readonly data?: T;
    readonly error?: {
        readonly code: string;
        readonly message: string;
        readonly details?: Record<string, unknown>;
    };
    readonly timestamp: string;
    readonly requestId?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    readonly pagination?: {
        readonly total: number;
        readonly limit: number;
        readonly offset: number;
        readonly hasMore: boolean;
    };
}

/**
 * Contrôleur pour les opérations de sessions
 */
export class SessionController {
    private readonly logger = LoggerFactory.getLogger('SessionController');

    constructor(
        private readonly sessionRepository: SessionRepository,
        private readonly codaSystem: ReverseApprenticeshipSystem
    ) {}

    // ==================== GESTION DES SESSIONS ====================

    /**
     * POST /api/sessions
     * Crée et démarre une nouvelle session d'enseignement
     */
    public async createSession(request: CreateSessionRequest): Promise<ApiResponse<SessionResponse>> {
        const requestId = this.generateRequestId();
        
        try {
            this.logger.info('📚 Création nouvelle session', {
                requestId,
                mentorId: request.mentorId,
                topic: request.topic,
                targetLevel: request.targetLevel
            });

            // Validation des données
            const validationError = this.validateCreateSessionRequest(request);
            if (validationError) {
                return this.errorResponse(validationError, 'VALIDATION_ERROR', requestId);
            }

            // Démarrer la session via le système CODA
            const sessionId = await this.codaSystem.startTeachingSession(
                request.mentorId,
                request.topic,
                request.concepts,
                request.teachingMethod
            );

            // Créer l'objet session de base
            const baseSession: TeachingSession = {
                sessionId,
                mentorId: request.mentorId,
                aiStudentId: `ai_student_${request.mentorId}`,
                startTime: new Date(),
                content: {
                    topic: request.topic,
                    targetLevel: request.targetLevel,
                    teachingMethod: request.teachingMethod || 'interactive',
                    duration: request.expectedDuration || 30,
                    materials: request.materials || [],
                    exercises: [],
                    visualAids: []
                },
                aiReactions: {
                    comprehension: 0.5,
                    textualReactions: [],
                    questions: [],
                    errors: [],
                    emotion: 'neutral',
                    engagementEvolution: [0.5],
                    strugglingMoments: []
                },
                metrics: {
                    actualDuration: 0,
                    participationRate: 0,
                    teacherInterventions: 0,
                    successScore: 0,
                    conceptsMastered: [],
                    conceptsToReview: [],
                    teachingEffectiveness: 0.5
                },
                status: 'active' as const,
                teacherNotes: '',
                objectives: []
            };

            // Créer la session dans le repository
            const storedSessionId = await this.sessionRepository.createSession(baseSession, 'active');

            // Récupérer la session créée
            const createdSession = await this.sessionRepository.getSession(storedSessionId);
            if (!createdSession) {
                throw new Error('Erreur lors de la création de la session');
            }

            // Ajouter les tags si fournis
            if (request.tags && request.tags.length > 0) {
                await this.sessionRepository.updateSession(storedSessionId, {
                    tags: request.tags
                });
            }

            const response = this.transformToSessionResponse(createdSession);

            this.logger.info('✅ Session créée avec succès', {
                requestId,
                sessionId: storedSessionId,
                mentorId: request.mentorId
            });

            return this.successResponse(response, requestId);

        } catch (error) {
            this.logger.error('❌ Erreur création session', {
                requestId,
                mentorId: request.mentorId,
                error
            });

            return this.errorResponse(
                'Erreur interne lors de la création de la session',
                'INTERNAL_ERROR',
                requestId,
                { originalError: String(error) }
            );
        }
    }

    /**
     * GET /api/sessions/:sessionId
     * Récupère une session par son ID
     */
    public async getSession(sessionId: string): Promise<ApiResponse<SessionResponse>> {
        const requestId = this.generateRequestId();

        try {
            this.logger.debug('🔍 Récupération session', { requestId, sessionId });

            const session = await this.sessionRepository.getSession(sessionId);
            if (!session) {
                return this.errorResponse(
                    `Session non trouvée: ${sessionId}`,
                    'SESSION_NOT_FOUND',
                    requestId
                );
            }

            const response = this.transformToSessionResponse(session);
            return this.successResponse(response, requestId);

        } catch (error) {
            this.logger.error('❌ Erreur récupération session', {
                requestId,
                sessionId,
                error
            });

            return this.errorResponse(
                'Erreur lors de la récupération de la session',
                'INTERNAL_ERROR',
                requestId
            );
        }
    }

    /**
     * PUT /api/sessions/:sessionId
     * Met à jour une session
     */
    public async updateSession(
        sessionId: string,
        updates: UpdateSessionRequest
    ): Promise<ApiResponse<SessionResponse>> {
        const requestId = this.generateRequestId();

        try {
            this.logger.info('🔄 Mise à jour session', {
                requestId,
                sessionId,
                updates: Object.keys(updates)
            });

            // Vérifier que la session existe
            const existingSession = await this.sessionRepository.getSession(sessionId);
            if (!existingSession) {
                return this.errorResponse(
                    `Session non trouvée: ${sessionId}`,
                    'SESSION_NOT_FOUND',
                    requestId
                );
            }

            // Appliquer les mises à jour
            if (updates.status && updates.status !== existingSession.status) {
                await this.sessionRepository.updateSessionStatus(sessionId, updates.status);
            }

            const sessionUpdates: Partial<StoredSession> = {};
            if (updates.notes !== undefined) {
                (sessionUpdates as { notes?: string }).notes = updates.notes;
            }
            if (updates.tags !== undefined) {
                (sessionUpdates as { tags?: string[] }).tags = updates.tags;
            }

            if (Object.keys(sessionUpdates).length > 0) {
                await this.sessionRepository.updateSession(sessionId, sessionUpdates);
            }

            // Récupérer la session mise à jour
            const updatedSession = await this.sessionRepository.getSession(sessionId);
            if (!updatedSession) {
                throw new Error('Erreur lors de la mise à jour');
            }

            const response = this.transformToSessionResponse(updatedSession);

            this.logger.info('✅ Session mise à jour', { requestId, sessionId });
            return this.successResponse(response, requestId);

        } catch (error) {
            this.logger.error('❌ Erreur mise à jour session', {
                requestId,
                sessionId,
                error
            });

            return this.errorResponse(
                'Erreur lors de la mise à jour de la session',
                'INTERNAL_ERROR',
                requestId
            );
        }
    }

    /**
     * DELETE /api/sessions/:sessionId
     * Supprime une session
     */
    public async deleteSession(sessionId: string): Promise<ApiResponse<void>> {
        const requestId = this.generateRequestId();

        try {
            this.logger.info('🗑️ Suppression session', { requestId, sessionId });

            const existingSession = await this.sessionRepository.getSession(sessionId);
            if (!existingSession) {
                return this.errorResponse(
                    `Session non trouvée: ${sessionId}`,
                    'SESSION_NOT_FOUND',
                    requestId
                );
            }

            // Arrêter la session dans le système CODA si elle est active
            if (existingSession.status === 'active') {
                await this.codaSystem.terminateCODASession(existingSession.mentorId);
            }

            await this.sessionRepository.deleteSession(sessionId);

            this.logger.info('✅ Session supprimée', { requestId, sessionId });
            return this.successResponse(undefined, requestId);

        } catch (error) {
            this.logger.error('❌ Erreur suppression session', {
                requestId,
                sessionId,
                error
            });

            return this.errorResponse(
                'Erreur lors de la suppression de la session',
                'INTERNAL_ERROR',
                requestId
            );
        }
    }

    // ==================== CONTRÔLE DES SESSIONS ====================

    /**
     * POST /api/sessions/:sessionId/pause
     * Met en pause une session active
     */
    public async pauseSession(sessionId: string): Promise<ApiResponse<SessionResponse>> {
        const requestId = this.generateRequestId();

        try {
            this.logger.info('⏸️ Pause session', { requestId, sessionId });

            const session = await this.sessionRepository.getSession(sessionId);
            if (!session) {
                return this.errorResponse(
                    `Session non trouvée: ${sessionId}`,
                    'SESSION_NOT_FOUND',
                    requestId
                );
            }

            if (session.status !== 'active') {
                return this.errorResponse(
                    'La session doit être active pour être mise en pause',
                    'INVALID_SESSION_STATE',
                    requestId
                );
            }

            await this.sessionRepository.updateSessionStatus(sessionId, 'paused');

            const updatedSession = await this.sessionRepository.getSession(sessionId);
            const response = this.transformToSessionResponse(updatedSession!);

            return this.successResponse(response, requestId);

        } catch (error) {
            this.logger.error('❌ Erreur pause session', { requestId, sessionId, error });
            return this.errorResponse('Erreur lors de la pause', 'INTERNAL_ERROR', requestId);
        }
    }

    /**
     * POST /api/sessions/:sessionId/resume
     * Reprend une session en pause
     */
    public async resumeSession(sessionId: string): Promise<ApiResponse<SessionResponse>> {
        const requestId = this.generateRequestId();

        try {
            this.logger.info('▶️ Reprise session', { requestId, sessionId });

            const session = await this.sessionRepository.getSession(sessionId);
            if (!session) {
                return this.errorResponse(
                    `Session non trouvée: ${sessionId}`,
                    'SESSION_NOT_FOUND',
                    requestId
                );
            }

            if (session.status !== 'paused') {
                return this.errorResponse(
                    'La session doit être en pause pour être reprise',
                    'INVALID_SESSION_STATE',
                    requestId
                );
            }

            await this.sessionRepository.updateSessionStatus(sessionId, 'active');

            const updatedSession = await this.sessionRepository.getSession(sessionId);
            const response = this.transformToSessionResponse(updatedSession!);

            return this.successResponse(response, requestId);

        } catch (error) {
            this.logger.error('❌ Erreur reprise session', { requestId, sessionId, error });
            return this.errorResponse('Erreur lors de la reprise', 'INTERNAL_ERROR', requestId);
        }
    }

    /**
     * POST /api/sessions/:sessionId/complete
     * Termine une session
     */
    public async completeSession(sessionId: string): Promise<ApiResponse<SessionResponse>> {
        const requestId = this.generateRequestId();

        try {
            this.logger.info('🏁 Fin session', { requestId, sessionId });

            const session = await this.sessionRepository.getSession(sessionId);
            if (!session) {
                return this.errorResponse(
                    `Session non trouvée: ${sessionId}`,
                    'SESSION_NOT_FOUND',
                    requestId
                );
            }

            if (!['active', 'paused'].includes(session.status)) {
                return this.errorResponse(
                    'La session doit être active ou en pause pour être terminée',
                    'INVALID_SESSION_STATE',
                    requestId
                );
            }

            // Terminer la session dans le système CODA
            await this.codaSystem.endTeachingSession(session.mentorId, sessionId);

            // Mettre à jour le statut
            await this.sessionRepository.updateSessionStatus(sessionId, 'completed');

            const updatedSession = await this.sessionRepository.getSession(sessionId);
            const response = this.transformToSessionResponse(updatedSession!);

            return this.successResponse(response, requestId);

        } catch (error) {
            this.logger.error('❌ Erreur fin session', { requestId, sessionId, error });
            return this.errorResponse('Erreur lors de la fin de session', 'INTERNAL_ERROR', requestId);
        }
    }

    // ==================== INTERACTIONS ====================

    /**
     * POST /api/sessions/:sessionId/interactions
     * Ajoute une interaction à la session
     */
    public async addInteraction(
        sessionId: string,
        interaction: AddInteractionRequest
    ): Promise<ApiResponse<InteractionResponse>> {
        const requestId = this.generateRequestId();

        try {
            this.logger.debug('💬 Ajout interaction', {
                requestId,
                sessionId,
                type: interaction.type
            });

            const session = await this.sessionRepository.getSession(sessionId);
            if (!session) {
                return this.errorResponse(
                    `Session non trouvée: ${sessionId}`,
                    'SESSION_NOT_FOUND',
                    requestId
                );
            }

            if (session.status !== 'active') {
                return this.errorResponse(
                    'La session doit être active pour ajouter des interactions',
                    'INVALID_SESSION_STATE',
                    requestId
                );
            }

            // Enseigner le concept via le système CODA si c'est un enseignement
            let aiResponse = interaction.aiResponse || '';
            let comprehensionScore = interaction.comprehensionScore || 0.5;

            if (interaction.type === 'teaching') {
                const teachResult = await this.codaSystem.teachConcept(
                    session.mentorId,
                    sessionId,
                    interaction.concept,
                    interaction.mentorInput
                );
                aiResponse = teachResult.aiReaction;
                comprehensionScore = teachResult.comprehension;
            }

            // Créer l'objet interaction
            const interactionData: Omit<SessionInteraction, 'id'> = {
                timestamp: new Date(),
                type: interaction.type,
                concept: interaction.concept,
                mentorInput: interaction.mentorInput,
                aiResponse,
                comprehensionScore,
                emotionalState: interaction.emotionalState || 'neutral',
                duration: 30 // Durée par défaut en secondes
            };

            const interactionId = await this.sessionRepository.addInteraction(sessionId, interactionData);

            // Récupérer l'interaction créée
            const interactions = await this.sessionRepository.getSessionInteractions(sessionId);
            const createdInteraction = interactions.find(i => i.id === interactionId);

            if (!createdInteraction) {
                throw new Error('Erreur lors de la création de l\'interaction');
            }

            const response: InteractionResponse = {
                id: createdInteraction.id,
                sessionId,
                timestamp: createdInteraction.timestamp.toISOString(),
                type: createdInteraction.type,
                concept: createdInteraction.concept,
                mentorInput: createdInteraction.mentorInput,
                aiResponse: createdInteraction.aiResponse,
                comprehensionScore: createdInteraction.comprehensionScore,
                emotionalState: createdInteraction.emotionalState,
                duration: createdInteraction.duration
            };

            return this.successResponse(response, requestId);

        } catch (error) {
            this.logger.error('❌ Erreur ajout interaction', {
                requestId,
                sessionId,
                error
            });

            return this.errorResponse(
                'Erreur lors de l\'ajout de l\'interaction',
                'INTERNAL_ERROR',
                requestId
            );
        }
    }

    /**
     * GET /api/sessions/:sessionId/interactions
     * Récupère les interactions d'une session
     */
    public async getSessionInteractions(
        sessionId: string,
        limit?: number,
        offset?: number
    ): Promise<PaginatedResponse<InteractionResponse>> {
        const requestId = this.generateRequestId();

        try {
            this.logger.debug('📖 Récupération interactions', { requestId, sessionId });

            const interactions = await this.sessionRepository.getSessionInteractions(sessionId, limit, offset);
            
            const interactionResponses: InteractionResponse[] = interactions.map(interaction => ({
                id: interaction.id,
                sessionId,
                timestamp: interaction.timestamp.toISOString(),
                type: interaction.type,
                concept: interaction.concept,
                mentorInput: interaction.mentorInput,
                aiResponse: interaction.aiResponse,
                comprehensionScore: interaction.comprehensionScore,
                emotionalState: interaction.emotionalState,
                duration: interaction.duration
            }));

            const response: PaginatedResponse<InteractionResponse> = {
                success: true,
                data: interactionResponses,
                pagination: limit ? {
                    total: interactions.length,
                    limit,
                    offset: offset || 0,
                    hasMore: interactions.length === limit
                } : undefined,
                timestamp: new Date().toISOString(),
                requestId
            };

            return response;

        } catch (error) {
            this.logger.error('❌ Erreur récupération interactions', {
                requestId,
                sessionId,
                error
            });

            return {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Erreur lors de la récupération des interactions'
                },
                timestamp: new Date().toISOString(),
                requestId
            };
        }
    }

    // ==================== RECHERCHE ET ANALYTICS ====================

    /**
     * GET /api/sessions
     * Recherche des sessions avec filtrage
     */
    public async searchSessions(searchParams: SessionSearchRequest): Promise<PaginatedResponse<SessionResponse>> {
        const requestId = this.generateRequestId();

        try {
            this.logger.debug('🔍 Recherche sessions', { requestId, searchParams });

            // Convertir les paramètres de recherche
            const searchCriteria: SessionSearchCriteria = {
                mentorId: searchParams.mentorId,
                studentId: searchParams.studentId,
                status: searchParams.status,
                dateRange: (searchParams.dateFrom && searchParams.dateTo) ? {
                    from: new Date(searchParams.dateFrom),
                    to: new Date(searchParams.dateTo)
                } : undefined,
                durationRange: (searchParams.minDuration !== undefined || searchParams.maxDuration !== undefined) ? {
                    minMinutes: searchParams.minDuration || 0,
                    maxMinutes: searchParams.maxDuration || Infinity
                } : undefined,
                level: searchParams.level,
                concepts: searchParams.concepts,
                tags: searchParams.tags,
                minComprehension: searchParams.minComprehension,
                maxComprehension: searchParams.maxComprehension,
                limit: searchParams.limit,
                offset: searchParams.offset,
                sortBy: searchParams.sortBy,
                sortOrder: searchParams.sortOrder
            };

            const sessions = await this.sessionRepository.searchSessions(searchCriteria);

            // Transformer en réponses API
            const sessionResponses = sessions.map(session => this.transformToSessionResponse(session));

            const response: PaginatedResponse<SessionResponse> = {
                success: true,
                data: sessionResponses,
                pagination: searchParams.limit ? {
                    total: sessionResponses.length,
                    limit: searchParams.limit,
                    offset: searchParams.offset || 0,
                    hasMore: sessionResponses.length === searchParams.limit
                } : undefined,
                timestamp: new Date().toISOString(),
                requestId
            };

            return response;

        } catch (error) {
            this.logger.error('❌ Erreur recherche sessions', {
                requestId,
                searchParams,
                error
            });

            return {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Erreur lors de la recherche de sessions'
                },
                timestamp: new Date().toISOString(),
                requestId
            };
        }
    }

    /**
     * GET /api/sessions/stats
     * Récupère les statistiques globales des sessions
     */
    public async getSessionStats(criteria?: SessionSearchRequest): Promise<ApiResponse<SessionStatsResponse>> {
        const requestId = this.generateRequestId();

        try {
            this.logger.debug('📊 Récupération stats sessions', { requestId, criteria });

            const searchCriteria: SessionSearchCriteria | undefined = criteria ? {
                mentorId: criteria.mentorId,
                studentId: criteria.studentId,
                status: criteria.status,
                dateRange: (criteria.dateFrom && criteria.dateTo) ? {
                    from: new Date(criteria.dateFrom),
                    to: new Date(criteria.dateTo)
                } : undefined
            } : undefined;

            const aggregateStats = await this.sessionRepository.getAggregateStats(searchCriteria);

            // Transformer les concepts en format attendu
            const topConcepts = Object.entries(aggregateStats.conceptDistribution)
                .map(([concept, count]) => ({
                    concept,
                    count,
                    avgComprehension: 0.75 // À calculer réellement
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            // Transformer les mentors en format attendu
            const mentorRankings = Object.entries(aggregateStats.mentorActivityStats)
                .map(([mentorId, stats]) => ({
                    mentorId,
                    sessionCount: stats.sessionCount,
                    averageScore: stats.averageScore,
                    totalTime: stats.totalTime
                }))
                .sort((a, b) => b.averageScore - a.averageScore);

            const response: SessionStatsResponse = {
                totalSessions: aggregateStats.totalSessions,
                activeSessionsCount: aggregateStats.activeSessionsCount,
                completedSessionsCount: aggregateStats.completedSessionsCount,
                averageDuration: aggregateStats.averageDuration,
                totalLearningTime: aggregateStats.totalLearningTime,
                averageComprehension: aggregateStats.averageComprehension,
                topConcepts,
                levelDistribution: aggregateStats.levelDistribution,
                mentorRankings
            };

            return this.successResponse(response, requestId);

        } catch (error) {
            this.logger.error('❌ Erreur stats sessions', { requestId, error });
            return this.errorResponse('Erreur lors du calcul des statistiques', 'INTERNAL_ERROR', requestId);
        }
    }

    // ==================== MÉTHODES UTILITAIRES ====================

    private transformToSessionResponse(session: StoredSession): SessionResponse {
        const latestEmotion = session.realTimeMetrics.emotionalEvolution.length > 0 ?
            session.realTimeMetrics.emotionalEvolution[session.realTimeMetrics.emotionalEvolution.length - 1].mood :
            'neutral';

        return {
            sessionId: session.sessionId,
            mentorId: session.mentorId,
            studentId: session.aiStudentId,
            status: session.status,
            topic: session.content.topic,
            targetLevel: session.content.targetLevel,
            startTime: session.startTime.toISOString(),
            endTime: session.completedAt?.toISOString(),
            duration: session.realTimeMetrics.totalActiveTime,
            realTimeMetrics: {
                totalActiveTime: session.realTimeMetrics.totalActiveTime,
                interactionCount: session.realTimeMetrics.interactionCount,
                averageComprehension: session.realTimeMetrics.averageComprehension,
                conceptsIntroduced: session.realTimeMetrics.conceptsIntroduced,
                currentMood: latestEmotion,
                difficultyLevel: 0.5 // À calculer selon les ajustements
            },
            tags: session.tags,
            notes: session.notes,
            createdAt: session.createdAt.toISOString(),
            lastUpdateAt: session.realTimeMetrics.lastUpdateTime.toISOString()
        };
    }

    private validateCreateSessionRequest(request: CreateSessionRequest): string | null {
        if (!request.mentorId?.trim()) {
            return 'mentorId est requis et ne peut pas être vide';
        }
        
        if (!request.topic?.trim()) {
            return 'topic est requis et ne peut pas être vide';
        }
        
        if (!request.targetLevel) {
            return 'targetLevel est requis';
        }
        
        const validLevels: CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        if (!validLevels.includes(request.targetLevel)) {
            return `targetLevel doit être un des: ${validLevels.join(', ')}`;
        }
        
        if (request.expectedDuration !== undefined && request.expectedDuration <= 0) {
            return 'expectedDuration doit être positive';
        }
        
        return null;
    }

    private successResponse<T>(data: T, requestId: string): ApiResponse<T> {
        return {
            success: true,
            data,
            timestamp: new Date().toISOString(),
            requestId
        };
    }

    private errorResponse(
        message: string,
        code: string,
        requestId: string,
        details?: Record<string, unknown>
    ): ApiResponse {
        return {
            success: false,
            error: {
                code,
                message,
                details
            },
            timestamp: new Date().toISOString(),
            requestId
        };
    }

    private generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    }
}