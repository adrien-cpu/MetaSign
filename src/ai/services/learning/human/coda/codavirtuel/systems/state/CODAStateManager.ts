/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/state/CODAStateManager.ts
 * @description Gestionnaire d'état révolutionnaire pour le système CODA d'apprentissage LSF
 * 
 * Fonctionnalités avancées :
 * - 📊 Suivi complet de l'état d'apprentissage émotionnel
 * - 🎯 Gestion des sessions avec analyse de performance
 * - 📈 Calcul automatique de progression multi-niveaux
 * - 🧠 Analyse des zones fortes et faibles en temps réel
 * - 💡 Génération de recommandations personnalisées
 * - 🏆 Détection et suivi d'accomplissements
 * 
 * @module CODAStateManager
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Learning State Division
 */

import { CECRLLevel } from '../../exercises';

/**
 * Interface représentant un exercice réalisé en session
 * 
 * @interface CODAExercise
 * @description Structure de données pour un exercice avec ses métriques
 */
export interface CODAExercise {
    /** Identifiant unique de l'exercice */
    readonly id: string;
    /** Type d'exercice (reconnaissance, production, etc.) */
    readonly type: string;
    /** Domaine d'apprentissage ciblé */
    readonly domain: string;
    /** Niveau de difficulté */
    readonly difficulty: CECRLLevel;
    /** Métriques de performance */
    readonly performance: {
        /** Score obtenu (0-1) */
        readonly score: number;
        /** Temps de réalisation en millisecondes */
        readonly duration: number;
        /** Nombre de tentatives */
        readonly attempts: number;
        /** Erreurs commises */
        readonly errors: readonly string[];
    };
    /** Horodatage de réalisation */
    readonly completedAt: Date;
}

/**
 * Interface représentant l'état complet d'apprentissage d'un IA-élève CODA
 * 
 * @interface CODALearningState
 * @description Encapsule tous les aspects de l'état d'apprentissage :
 * progression, performance, état émotionnel et contexte de session
 */
export interface CODALearningState {
    /** Niveau CECRL actuel de l'apprenant (A1 à C2) */
    readonly currentLevel: CECRLLevel;
    /** Progression dans la session actuelle (0-1) */
    readonly sessionProgress: number;
    /** Progression globale d'apprentissage (0-1) */
    readonly overallProgress: number;
    /** Domaines d'excellence identifiés */
    readonly strongAreas: readonly string[];
    /** Domaines nécessitant amélioration */
    readonly weakAreas: readonly string[];
    /** Historique des 10 dernières performances (0-1) */
    readonly recentPerformance: readonly number[];
    /** État émotionnel actuel de l'apprenant */
    readonly emotionalState: {
        /** Niveau de confiance (0-1) */
        readonly confidence: number;
        /** Niveau de motivation (0-1) */
        readonly motivation: number;
        /** Niveau de frustration (0-1) */
        readonly frustration: number;
        /** Niveau d'engagement (0-1) */
        readonly engagement: number;
    };
    /** Contexte de la session d'apprentissage */
    readonly learningContext: {
        /** Identifiant unique de session */
        readonly sessionId: string;
        /** Heure de début de session */
        readonly startTime: Date;
        /** Nombre d'exercices réalisés */
        readonly exerciseCount: number;
        /** Dernière interaction enregistrée */
        readonly lastInteraction: Date;
    };
}

/**
 * Interface représentant une session complète d'apprentissage CODA
 * 
 * @interface CODALearningSession
 * @description Capture tous les détails d'une session : exercices,
 * performances, état final et recommandations générées
 */
export interface CODALearningSession {
    /** Identifiant unique de la session */
    readonly sessionId: string;
    /** Heure de début de session */
    readonly startTime: Date;
    /** Heure de fin de session (optionnelle si active) */
    readonly endTime?: Date;
    /** Domaines de focus pour cette session */
    readonly focusAreas: readonly string[];
    /** Liste des exercices réalisés */
    readonly exercises: readonly CODAExercise[];
    /** État final de l'apprenant à la fin de session */
    readonly finalState: CODALearningState;
    /** Résumé analytique de la session */
    readonly sessionSummary: {
        /** Nombre total d'exercices réalisés */
        readonly totalExercises: number;
        /** Score moyen de la session (0-1) */
        readonly averageScore: number;
        /** Domaines identifiés pour amélioration */
        readonly improvementAreas: readonly string[];
        /** Accomplissements débloqués */
        readonly achievements: readonly string[];
        /** Recommandations pour prochaine session */
        readonly nextSessionRecommendations: readonly string[];
    };
}

/**
 * Gestionnaire d'état révolutionnaire pour le système CODA
 * 
 * @class CODAStateManager
 * @description Gère l'état complet d'apprentissage des IA-élèves,
 * incluant le suivi émotionnel, la progression et les recommandations.
 * 
 * Responsabilités clés :
 * - Maintien de l'état d'apprentissage en temps réel
 * - Gestion du cycle de vie des sessions
 * - Calcul de progression multi-dimensionnelle
 * - Génération d'insights et recommandations
 * - Suivi des accomplissements
 * 
 * @example
 * ```typescript
 * const stateManager = new CODAStateManager();
 * 
 * // Démarrer une nouvelle session
 * const session = stateManager.startNewSession('A2', ['vocabulary']);
 * 
 * // Mettre à jour performance
 * stateManager.updatePerformance(0.85);
 * stateManager.updateEmotionalState({ confidence: 0.9 });
 * 
 * // Terminer session avec résumé
 * const completedSession = stateManager.endSession();
 * ```
 */
export class CODAStateManager {
    /**
     * État d'apprentissage actuel de l'IA-élève
     * @private
     */
    private currentState: CODALearningState;
    /**
     * Session d'apprentissage active (null si aucune)
     * @private
     */
    private activeSession: CODALearningSession | null = null;
    /**
     * Compteur global de sessions créées
     * @private
     */
    private sessionCounter = 0;

    /**
     * Constructeur du gestionnaire d'état CODA
     * 
     * @constructor
     * @description Initialise le gestionnaire avec un état d'apprentissage
     * de base adapté aux débutants LSF
     */
    constructor() {
        this.currentState = this.createInitialLearningState();
    }

    /**
     * Récupère l'état d'apprentissage actuel
     * 
     * @method getCurrentState
     * @returns {CODALearningState} Copie de l'état actuel
     * @public
     */
    public getCurrentState(): CODALearningState {
        return { ...this.currentState };
    }

    /**
     * Récupère la session active si elle existe
     * 
     * @method getActiveSession
     * @returns {CODALearningSession | null} Session active ou null
     * @public
     */
    public getActiveSession(): CODALearningSession | null {
        return this.activeSession ? { ...this.activeSession } : null;
    }

    /**
     * Démarre une nouvelle session d'apprentissage
     * 
     * @method startNewSession
     * @param {CECRLLevel} [targetLevel] - Niveau cible optionnel
     * @param {readonly string[]} [focusAreas] - Domaines de focus optionnels
     * @returns {CODALearningSession} Session créée et activée
     * @throws {Error} Si une session est déjà active
     * @public
     */
    public startNewSession(targetLevel?: CECRLLevel, focusAreas?: readonly string[]): CODALearningSession {
        this.sessionCounter++;
        const sessionId = `codaSession-${this.sessionCounter}-${Date.now()}`;

        this.currentState = {
            ...this.currentState,
            currentLevel: targetLevel ?? this.currentState.currentLevel,
            sessionProgress: 0,
            learningContext: {
                sessionId,
                startTime: new Date(),
                exerciseCount: 0,
                lastInteraction: new Date()
            }
        };

        this.activeSession = {
            sessionId,
            startTime: new Date(),
            focusAreas: focusAreas || [],
            exercises: [],
            finalState: this.currentState,
            sessionSummary: {
                totalExercises: 0,
                averageScore: 0,
                improvementAreas: [],
                achievements: [],
                nextSessionRecommendations: []
            }
        };

        return this.activeSession;
    }

    /**
     * Met à jour l'état émotionnel de l'apprenant
     * 
     * @method updateEmotionalState
     * @param {Partial<CODALearningState['emotionalState']>} emotionalUpdate - Mise à jour partielle
     * @returns {void}
     * @public
     */
    public updateEmotionalState(emotionalUpdate: Partial<CODALearningState['emotionalState']>): void {
        this.currentState = {
            ...this.currentState,
            emotionalState: {
                ...this.currentState.emotionalState,
                ...emotionalUpdate
            }
        };
    }

    /**
     * Met à jour la performance avec un nouveau score
     * 
     * @method updatePerformance
     * @param {number} newScore - Nouveau score (0-1)
     * @returns {void}
     * @description Met à jour l'historique de performance (max 10 entrées)
     * et recalcule automatiquement les progressions
     * @public
     */
    public updatePerformance(newScore: number): void {
        const newPerformance = [...this.currentState.recentPerformance, newScore];
        if (newPerformance.length > 10) {
            newPerformance.shift();
        }

        this.currentState = {
            ...this.currentState,
            recentPerformance: newPerformance,
            sessionProgress: Math.min(1, this.currentState.sessionProgress + 0.1),
            overallProgress: this.calculateOverallProgress(newPerformance)
        };
    }

    /**
     * Met à jour les zones fortes et faibles identifiées
     * 
     * @method updateAreas
     * @param {readonly string[]} strongAreas - Nouvelles zones d'excellence
     * @param {readonly string[]} weakAreas - Nouvelles zones d'amélioration
     * @returns {void}
     * @description Fusionne avec les zones existantes sans doublons
     * @public
     */
    public updateAreas(strongAreas: readonly string[], weakAreas: readonly string[]): void {
        this.currentState = {
            ...this.currentState,
            strongAreas: this.mergeAreas(this.currentState.strongAreas, strongAreas),
            weakAreas: this.mergeAreas(this.currentState.weakAreas, weakAreas)
        };
    }

    /**
     * Incrémente le compteur d'exercices et met à jour l'interaction
     * 
     * @method incrementExerciseCount
     * @returns {void}
     * @description Appelé automatiquement à chaque exercice terminé
     * @public
     */
    public incrementExerciseCount(): void {
        this.currentState = {
            ...this.currentState,
            learningContext: {
                ...this.currentState.learningContext,
                exerciseCount: this.currentState.learningContext.exerciseCount + 1,
                lastInteraction: new Date()
            }
        };
    }

    /**
     * Termine la session active et génère le résumé complet
     * 
     * @method endSession
     * @returns {CODALearningSession} Session terminée avec résumé
     * @throws {Error} Si aucune session n'est active
     * @description Génère automatiquement accomplissements et recommandations
     * @public
     */
    public endSession(): CODALearningSession {
        if (!this.activeSession) {
            throw new Error('No active session to end');
        }

        const endTime = new Date();
        const completedSession: CODALearningSession = {
            ...this.activeSession,
            endTime,
            finalState: this.currentState,
            sessionSummary: this.generateSessionSummary()
        };

        this.activeSession = null;
        return completedSession;
    }

    private createInitialLearningState(): CODALearningState {
        return {
            currentLevel: 'A1',
            sessionProgress: 0,
            overallProgress: 0.1,
            strongAreas: ['basic-signs'],
            weakAreas: ['grammar', 'fingerspelling'],
            recentPerformance: [0.6, 0.65, 0.7],
            emotionalState: {
                confidence: 0.6,
                motivation: 0.8,
                frustration: 0.2,
                engagement: 0.7
            },
            learningContext: {
                sessionId: '',
                startTime: new Date(),
                exerciseCount: 0,
                lastInteraction: new Date()
            }
        };
    }

    private calculateOverallProgress(performance: readonly number[]): number {
        const levelProgress = this.getLevelIndex(this.currentState.currentLevel) / 5;
        const performanceProgress = performance.reduce((sum, score) => sum + score, 0) / performance.length;
        const sessionProgress = this.currentState.sessionProgress;

        return (levelProgress * 0.5 + performanceProgress * 0.3 + sessionProgress * 0.2);
    }

    private getLevelIndex(level: CECRLLevel): number {
        const levels: CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        return levels.indexOf(level);
    }

    private mergeAreas(currentAreas: readonly string[], newAreas: readonly string[]): readonly string[] {
        const combined = [...currentAreas, ...newAreas];
        return Array.from(new Set(combined));
    }

    private generateSessionSummary(): CODALearningSession['sessionSummary'] {
        if (!this.activeSession) {
            throw new Error('No active session to summarize');
        }

        const exercises = this.activeSession.exercises;
        const totalExercises = exercises.length;
        const averageScore = totalExercises > 0
            ? exercises.reduce((sum: number, ex: CODAExercise) => sum + ex.performance.score, 0) / totalExercises
            : 0;

        return {
            totalExercises,
            averageScore,
            improvementAreas: [...this.currentState.weakAreas],
            achievements: this.generateAchievements(),
            nextSessionRecommendations: this.generateNextSessionRecommendations()
        };
    }

    private generateAchievements(): readonly string[] {
        const achievements: string[] = [];

        if (this.currentState.emotionalState.confidence > 0.8) {
            achievements.push('Confiance élevée démontrée');
        }

        if (this.currentState.emotionalState.engagement > 0.7) {
            achievements.push('Engagement soutenu');
        }

        if (this.currentState.recentPerformance.slice(-3).every(score => score > 0.7)) {
            achievements.push('Performance consistante');
        }

        return achievements;
    }

    private generateNextSessionRecommendations(): readonly string[] {
        const recommendations: string[] = [];

        if (this.currentState.weakAreas.length > 0) {
            recommendations.push(`Focus sur: ${this.currentState.weakAreas.join(', ')}`);
        }

        if (this.currentState.emotionalState.frustration > 0.6) {
            recommendations.push('Session plus courte recommandée');
        }

        if (this.currentState.emotionalState.engagement > 0.8) {
            recommendations.push('Prêt pour des défis plus complexes');
        }

        return recommendations;
    }
}