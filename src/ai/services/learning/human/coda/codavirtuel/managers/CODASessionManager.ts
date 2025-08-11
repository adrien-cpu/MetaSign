/**
 * @file src/ai/services/learning/human/coda/codavirtuel/managers/CODASessionManager.ts
 * @description Gestionnaire révolutionnaire des sessions CODA avec IA-élèves
 * 
 * Fonctionnalités révolutionnaires :
 * - 🎭 Gestion complète des sessions mentor ↔ IA-élève
 * - 🤖 Coordination des IA-élèves Tamagotchi
 * - 📊 Analytics temps réel et métriques
 * - 🔄 Nettoyage automatique et optimisation
 * - 🌟 Architecture modulaire et scalable
 * 
 * @module managers
 * @version 3.0.0 - Gestionnaire révolutionnaire
 * @since 2025
 * @author MetaSign Team - CODA Session Management
 * @lastModified 2025-07-27
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type {
    CODASessionConfig,
    CODASessionManagerOptions,
    TeachingSession,
    CODAPersonalityType
} from '../types/index';

import type {
    AIStudentPersonalityType
} from '../interfaces/index';

/**
 * Interface pour les statistiques globales CODA
 */
export interface CODAGlobalStatistics {
    readonly totalTeachingSessions: number;
    readonly totalSessions: number;
    readonly activeSessions: number;
    readonly activeMentors: number;
    readonly totalAIStudents: number;
    readonly averageMentorScore: number;
    readonly emotionalDistribution: Record<string, number>;
    readonly popularConcepts: readonly string[];
    readonly systemHealth: {
        readonly uptime: number;
        readonly responseTime: number;
        readonly errorRate: number;
    };
}

/**
 * Interface pour l'état d'une session CODA
 */
export interface CODASessionState {
    readonly sessionId: string;
    readonly mentorId: string;
    readonly aiStudent: CODAStudentStatus;
    readonly teachingSessions: TeachingSessionSummary[];
    readonly createdAt: Date;
    readonly lastActivity: Date;
    readonly isActive: boolean;
}

/**
 * Statut IA-élève spécifique au gestionnaire de sessions
 */
export interface CODAStudentStatus {
    readonly id: string;
    readonly name: string;
    readonly currentLevel: string;
    readonly mood: 'happy' | 'confused' | 'frustrated' | 'excited' | 'neutral';
    readonly personality: AIStudentPersonalityType;
    readonly weaknesses: readonly string[];
    readonly strengths: readonly string[];
    readonly lastLearned?: string;
    readonly comprehensionRate: number;
    readonly attentionSpan: number;
    readonly emotionalState: string;
}

/**
 * Résumé de session d'enseignement
 */
export interface TeachingSessionSummary {
    readonly sessionId: string;
    readonly topic: string;
    readonly concepts: readonly string[];
    readonly duration: number;
    readonly comprehensionScore: number;
    readonly mentorRating: number;
    readonly timestamp: Date;
}

/**
 * Gestionnaire révolutionnaire des sessions CODA
 * 
 * @class CODASessionManager
 * @description Orchestrateur central pour toutes les interactions mentor ↔ IA-élève
 * 
 * @example
 * ```typescript
 * const manager = new CODASessionManager({
 *   maxSessionsPerMentor: 1,
 *   enableRealTimeAnalytics: true
 * });
 * 
 * // Créer une session CODA
 * const session = await manager.createCODASession('mentor123', {
 *   aiPersonality: 'curious_student',
 *   culturalEnvironment: 'deaf_family_home'
 * });
 * 
 * // Mettre à jour l'IA-élève
 * await manager.updateAIStudent('mentor123', {
 *   mood: 'happy',
 *   lastLearned: 'greetings'
 * });
 * ```
 */
export class CODASessionManager {
    /**
     * Logger pour le gestionnaire de sessions
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('CODASessionManager');

    /**
     * Options de configuration
     * @private
     * @readonly
     */
    private readonly options: Required<CODASessionManagerOptions>;

    /**
     * Sessions actives par mentor ID
     * @private
     */
    private readonly activeSessions = new Map<string, CODASessionState>();

    /**
     * Timer pour le nettoyage automatique
     * @private
     */
    private cleanupTimer?: NodeJS.Timeout;

    /**
     * Heure de démarrage du gestionnaire
     * @private
     */
    private readonly startTime = Date.now();

    /**
     * Constructeur du gestionnaire de sessions
     * 
     * @constructor
     * @param {Partial<CODASessionManagerOptions>} [options] - Options de configuration
     */
    constructor(options?: Partial<CODASessionManagerOptions>) {
        this.options = {
            maxSessionsPerMentor: options?.maxSessionsPerMentor ?? 1,
            enableRealTimeAnalytics: options?.enableRealTimeAnalytics ?? true,
            emotionalUpdateFrequencyMs: options?.emotionalUpdateFrequencyMs ?? 30000,
            autoCleanupExpiredSessions: options?.autoCleanupExpiredSessions ?? true,
            sessionTimeoutMs: options?.sessionTimeoutMs ?? 3600000 // 1 heure
        };

        // Démarrer le nettoyage automatique si activé
        if (this.options.autoCleanupExpiredSessions) {
            this.startAutoCleanup();
        }

        this.logger.info('🚀 CODASessionManager initialisé', {
            maxSessionsPerMentor: this.options.maxSessionsPerMentor,
            realTimeAnalytics: this.options.enableRealTimeAnalytics,
            autoCleanup: this.options.autoCleanupExpiredSessions
        });
    }

    /**
     * Crée une nouvelle session CODA
     * 
     * @method createCODASession
     * @async
     * @param {string} mentorId - Identifiant du mentor
     * @param {CODASessionConfig} config - Configuration de la session
     * @returns {Promise<CODASessionState>} Session créée
     * @public
     */
    public async createCODASession(mentorId: string, config: CODASessionConfig): Promise<CODASessionState> {
        try {
            this.logger.info('🎭 Création session CODA', { mentorId, config });

            // Vérifier les limites de sessions
            if (this.activeSessions.has(mentorId)) {
                if (this.options.maxSessionsPerMentor === 1) {
                    await this.terminateSession(mentorId);
                } else {
                    const currentSessions = Array.from(this.activeSessions.values())
                        .filter(session => session.mentorId === mentorId).length;

                    if (currentSessions >= this.options.maxSessionsPerMentor) {
                        throw new Error(`Limite de sessions atteinte pour ${mentorId}`);
                    }
                }
            }

            // Créer l'IA-élève
            const aiStudent = await this.createAIStudent(config);

            // Créer la session
            const sessionId = `coda_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const session: CODASessionState = {
                sessionId,
                mentorId,
                aiStudent,
                teachingSessions: [],
                createdAt: new Date(),
                lastActivity: new Date(),
                isActive: true
            };

            this.activeSessions.set(mentorId, session);

            this.logger.info('✨ Session CODA créée', {
                sessionId,
                mentorId,
                aiStudentName: aiStudent.name,
                totalActiveSessions: this.activeSessions.size
            });

            return session;
        } catch (error) {
            this.logger.error('❌ Erreur création session CODA', { mentorId, error });
            throw error;
        }
    }

    /**
     * Met à jour l'IA-élève dans une session
     * 
     * @method updateAIStudent
     * @async
     * @param {string} mentorId - Identifiant du mentor
     * @param {Partial<CODAStudentStatus>} updates - Mises à jour
     * @returns {Promise<CODAStudentStatus>} IA-élève mise à jour
     * @public
     */
    public async updateAIStudent(
        mentorId: string,
        updates: Partial<CODAStudentStatus>
    ): Promise<CODAStudentStatus> {
        const session = this.activeSessions.get(mentorId);
        if (!session) {
            throw new Error(`Session CODA non trouvée pour ${mentorId}`);
        }

        const updatedAIStudent: CODAStudentStatus = {
            ...session.aiStudent,
            ...updates
        };

        const updatedSession: CODASessionState = {
            ...session,
            aiStudent: updatedAIStudent,
            lastActivity: new Date()
        };

        this.activeSessions.set(mentorId, updatedSession);

        this.logger.info('🔄 IA-élève mise à jour', {
            mentorId,
            aiStudentName: updatedAIStudent.name,
            updates: Object.keys(updates)
        });

        return updatedAIStudent;
    }

    /**
     * Ajoute une session d'enseignement à l'historique
     * 
     * @method addTeachingSession
     * @param {string} mentorId - Identifiant du mentor
     * @param {TeachingSession} teachingSession - Session d'enseignement
     * @public
     */
    public addTeachingSession(mentorId: string, teachingSession: TeachingSession): void {
        const session = this.activeSessions.get(mentorId);
        if (!session) {
            this.logger.warn('⚠️ Session CODA non trouvée pour ajout session enseignement', { mentorId });
            return;
        }

        const summary: TeachingSessionSummary = {
            sessionId: teachingSession.sessionId,
            topic: teachingSession.content.topic,
            concepts: teachingSession.objectives,
            duration: teachingSession.metrics.actualDuration,
            comprehensionScore: teachingSession.aiReactions.comprehension,
            mentorRating: teachingSession.metrics.teachingEffectiveness,
            timestamp: teachingSession.startTime
        };

        const updatedSession: CODASessionState = {
            ...session,
            teachingSessions: [...session.teachingSessions, summary],
            lastActivity: new Date()
        };

        this.activeSessions.set(mentorId, updatedSession);

        this.logger.info('📚 Session d\'enseignement ajoutée', {
            mentorId,
            sessionId: summary.sessionId,
            topic: summary.topic,
            totalSessions: updatedSession.teachingSessions.length
        });
    }

    /**
     * Obtient le statut d'une session
     * 
     * @method getSessionStatus
     * @param {string} mentorId - Identifiant du mentor
     * @returns {CODASessionState | undefined} Statut de la session
     * @public
     */
    public getSessionStatus(mentorId: string): CODASessionState | undefined {
        return this.activeSessions.get(mentorId);
    }

    /**
     * Vérifie si un mentor a une session active
     * 
     * @method hasActiveSession
     * @param {string} mentorId - Identifiant du mentor
     * @returns {boolean} True si session active
     * @public
     */
    public hasActiveSession(mentorId: string): boolean {
        return this.activeSessions.has(mentorId);
    }

    /**
     * Termine une session CODA
     * 
     * @method terminateSession
     * @async
     * @param {string} mentorId - Identifiant du mentor
     * @returns {Promise<CODASessionState | null>} Session terminée
     * @public
     */
    public async terminateSession(mentorId: string): Promise<CODASessionState | null> {
        const session = this.activeSessions.get(mentorId);
        if (!session) {
            this.logger.warn('⚠️ Tentative terminaison session inexistante', { mentorId });
            return null;
        }

        this.activeSessions.delete(mentorId);

        this.logger.info('🛑 Session CODA terminée', {
            sessionId: session.sessionId,
            mentorId,
            duration: Date.now() - session.createdAt.getTime(),
            teachingSessions: session.teachingSessions.length
        });

        return session;
    }

    /**
     * Nettoie les sessions expirées
     * 
     * @method cleanupExpiredSessions
     * @async
     * @returns {Promise<number>} Nombre de sessions nettoyées
     * @public
     */
    public async cleanupExpiredSessions(): Promise<number> {
        const now = new Date();
        const expiredSessions: string[] = [];

        for (const [mentorId, session] of this.activeSessions.entries()) {
            const timeSinceLastActivity = now.getTime() - session.lastActivity.getTime();
            if (timeSinceLastActivity > this.options.sessionTimeoutMs) {
                expiredSessions.push(mentorId);
            }
        }

        // Supprimer les sessions expirées
        for (const mentorId of expiredSessions) {
            await this.terminateSession(mentorId);
        }

        if (expiredSessions.length > 0) {
            this.logger.info('🧹 Sessions expirées nettoyées', {
                cleanedSessions: expiredSessions.length,
                remainingSessions: this.activeSessions.size
            });
        }

        return expiredSessions.length;
    }

    /**
     * Obtient les statistiques globales
     * 
     * @method getGlobalStatistics
     * @returns {CODAGlobalStatistics} Statistiques globales
     * @public
     */
    public getGlobalStatistics(): CODAGlobalStatistics {
        const sessions = Array.from(this.activeSessions.values());
        const totalTeachingSessions = sessions.reduce(
            (total, session) => total + session.teachingSessions.length, 0
        );

        const allScores = sessions.flatMap(session =>
            session.teachingSessions.map(ts => ts.mentorRating)
        );
        const averageMentorScore = allScores.length > 0
            ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
            : 0;

        const emotionalDistribution = this.calculateEmotionalDistribution(sessions);

        // Calculer le nombre de mentors actifs uniques
        const activeMentors = new Set(sessions.map(session => session.mentorId)).size;

        return {
            totalTeachingSessions,
            totalSessions: sessions.length, // Nouveau champ ajouté
            activeSessions: this.activeSessions.size,
            activeMentors, // Nouveau champ ajouté
            totalAIStudents: sessions.length,
            averageMentorScore,
            emotionalDistribution,
            popularConcepts: this.extractPopularConcepts(sessions),
            systemHealth: {
                uptime: Date.now() - this.startTime,
                responseTime: 150, // Simulation
                errorRate: 0.02
            }
        };
    }

    /**
     * Détruit le gestionnaire et nettoie les ressources
     * 
     * @method destroy
     * @async
     * @returns {Promise<void>}
     * @public
     */
    public async destroy(): Promise<void> {
        // Arrêter le nettoyage automatique
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = undefined;
        }

        // Terminer toutes les sessions
        const mentorIds = Array.from(this.activeSessions.keys());
        for (const mentorId of mentorIds) {
            await this.terminateSession(mentorId);
        }

        this.logger.info('💥 CODASessionManager détruit', {
            sessionsTerminated: mentorIds.length
        });
    }

    // ================== MÉTHODES PRIVÉES ==================

    /**
     * Crée une IA-élève basée sur la configuration
     * 
     * @private
     * @param {CODASessionConfig} config - Configuration de session
     * @returns {Promise<CODAStudentStatus>} IA-élève créée
     */
    private async createAIStudent(config: CODASessionConfig): Promise<CODAStudentStatus> {
        const name = config.customAIName || this.generateAIName(config.aiPersonality);

        return {
            id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            name,
            currentLevel: 'A1',
            mood: 'excited',
            personality: this.convertCODAToAIPersonality(config.aiPersonality),
            weaknesses: this.determineInitialWeaknesses(config.aiPersonality),
            strengths: this.determineInitialStrengths(config.aiPersonality),
            comprehensionRate: 0.6,
            attentionSpan: 300, // 5 minutes
            emotionalState: 'curious'
        };
    }

    /**
     * Génère un nom pour l'IA-élève
     * 
     * @private
     * @param {CODAPersonalityType} personality - Type de personnalité
     * @returns {string} Nom généré
     */
    private generateAIName(personality: CODAPersonalityType): string {
        const namesByPersonality: Record<CODAPersonalityType, string[]> = {
            'curious_student': ['Luna', 'Felix', 'Maya', 'Alex'],
            'shy_learner': ['Sam', 'Riley', 'Quinn', 'Robin'],
            'energetic_pupil': ['Zoe', 'Max', 'Aria', 'Leo'],
            'patient_apprentice': ['Sage', 'River', 'Kai', 'Nova'],
            'encouraging_mentor': ['Mentor'],
            'strict_teacher': ['Teacher'],
            'patient_guide': ['Guide']
        };

        const names = namesByPersonality[personality] || namesByPersonality['curious_student'];
        return names[Math.floor(Math.random() * names.length)];
    }

    /**
     * Convertit CODAPersonalityType vers AIStudentPersonalityType
     * 
     * @private
     * @param {CODAPersonalityType} personality - Personnalité CODA
     * @returns {AIStudentPersonalityType} Personnalité IA
     */
    private convertCODAToAIPersonality(personality: CODAPersonalityType): AIStudentPersonalityType {
        const conversionMap: Record<CODAPersonalityType, AIStudentPersonalityType> = {
            'curious_student': 'curious_student',
            'shy_learner': 'shy_learner',
            'energetic_pupil': 'energetic_pupil',
            'patient_apprentice': 'patient_apprentice',
            'encouraging_mentor': 'curious_student',
            'strict_teacher': 'patient_apprentice',
            'patient_guide': 'shy_learner'
        };
        return conversionMap[personality] || 'curious_student';
    }

    /**
     * Détermine les faiblesses initiales
     * 
     * @private
     * @param {CODAPersonalityType} personality - Type de personnalité
     * @returns {readonly string[]} Faiblesses identifiées
     */
    private determineInitialWeaknesses(personality: CODAPersonalityType): readonly string[] {
        const weaknessMap: Record<CODAPersonalityType, string[]> = {
            'curious_student': ['attention_span', 'impatience'],
            'shy_learner': ['confidence', 'participation'],
            'energetic_pupil': ['focus', 'detail_attention'],
            'patient_apprentice': ['speed', 'spontaneity'],
            'encouraging_mentor': ['criticism_acceptance'],
            'strict_teacher': ['flexibility'],
            'patient_guide': ['urgency']
        };
        return weaknessMap[personality] || ['basic_concepts'];
    }

    /**
     * Détermine les forces initiales
     * 
     * @private
     * @param {CODAPersonalityType} personality - Type de personnalité
     * @returns {readonly string[]} Forces identifiées
     */
    private determineInitialStrengths(personality: CODAPersonalityType): readonly string[] {
        const strengthMap: Record<CODAPersonalityType, string[]> = {
            'curious_student': ['motivation', 'exploration'],
            'shy_learner': ['observation', 'thoughtfulness'],
            'energetic_pupil': ['enthusiasm', 'quick_learning'],
            'patient_apprentice': ['persistence', 'thoroughness'],
            'encouraging_mentor': ['positivity'],
            'strict_teacher': ['discipline'],
            'patient_guide': ['understanding']
        };
        return strengthMap[personality] || ['eagerness'];
    }

    /**
     * Démarre le nettoyage automatique
     * 
     * @private
     */
    private startAutoCleanup(): void {
        this.cleanupTimer = setInterval(async () => {
            try {
                await this.cleanupExpiredSessions();
            } catch (error) {
                this.logger.error('❌ Erreur nettoyage automatique', { error });
            }
        }, this.options.emotionalUpdateFrequencyMs);
    }

    /**
     * Calcule la distribution émotionnelle
     * 
     * @private
     * @param {CODASessionState[]} sessions - Sessions à analyser
     * @returns {Record<string, number>} Distribution des émotions
     */
    private calculateEmotionalDistribution(sessions: CODASessionState[]): Record<string, number> {
        const emotions: Record<string, number> = {};

        for (const session of sessions) {
            const mood = session.aiStudent.mood;
            emotions[mood] = (emotions[mood] || 0) + 1;
        }

        const total = sessions.length;
        for (const emotion in emotions) {
            emotions[emotion] = emotions[emotion] / total;
        }

        return emotions;
    }

    /**
     * Extrait les concepts populaires
     * 
     * @private
     * @param {CODASessionState[]} sessions - Sessions à analyser
     * @returns {readonly string[]} Concepts les plus populaires
     */
    private extractPopularConcepts(sessions: CODASessionState[]): readonly string[] {
        const conceptCounts: Record<string, number> = {};

        for (const session of sessions) {
            for (const teachingSession of session.teachingSessions) {
                for (const concept of teachingSession.concepts) {
                    conceptCounts[concept] = (conceptCounts[concept] || 0) + 1;
                }
            }
        }

        return Object.entries(conceptCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([concept]) => concept);
    }
}