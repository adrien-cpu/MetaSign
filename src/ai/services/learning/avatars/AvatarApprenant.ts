/**
 * Composant Avatar Apprenant - Système d'apprentissage inverse CODA virtuel
 * 
 * @file src/ai/services/learning/avatars/AvatarApprenant.ts
 * @module ai/services/learning/avatars
 * @description Avatar virtuel qui apprend progressivement la LSF pour engager l'utilisateur enseignant
 * Conforme au diagramme d'état "Apprentissage Inverse" - composant AvatarApprenant
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 1.0.0
 * @since 2025
 * @lastModified 2025-01-22
 */

import type { CECRLLevel } from '@learning/types/LearningPathTypes';
import type { UserReverseProfile } from '@learning/human/coda/codavirtuel/types';
import { Logger } from '@ai/utils/Logger';

/**
 * Niveaux de progression de l'avatar selon le diagramme d'état
 */
export const AVATAR_LEVELS = {
    DEBUTANT: 'debutant',
    INTERMEDIAIRE: 'intermediaire',
    AVANCE: 'avance',
    MAITRISE_CODA: 'maitrise_coda'
} as const;

export type AvatarLevel = typeof AVATAR_LEVELS[keyof typeof AVATAR_LEVELS];

/**
 * État d'apprentissage de l'avatar
 * 
 * @interface AvatarLearningState
 */
interface AvatarLearningState {
    /** Niveau actuel de l'avatar */
    readonly currentLevel: AvatarLevel;
    /** Niveau CECRL correspondant */
    readonly cecrLevel: CECRLLevel;
    /** Compétences acquises */
    readonly acquiredSkills: readonly string[];
    /** Zones de difficulté simulées */
    readonly strugglingAreas: readonly string[];
    /** Progression générale (0-100) */
    readonly overallProgress: number;
    /** Nombre de sessions d'enseignement reçues */
    readonly sessionsCount: number;
    /** Timestamp de la dernière mise à jour */
    readonly lastUpdated: Date;
}

/**
 * Configuration de comportement de l'avatar
 * 
 * @interface AvatarBehaviorConfig
 */
interface AvatarBehaviorConfig {
    /** Taux d'apprentissage simulé */
    readonly learningRate: number;
    /** Probabilité de faire des erreurs */
    readonly errorProbability: number;
    /** Facteur de motivation */
    readonly motivationFactor: number;
    /** Activer les réponses émotionnelles */
    readonly enableEmotionalResponses: boolean;
}

/**
 * Réponse de l'avatar à un enseignement
 * 
 * @interface AvatarResponse
 */
interface AvatarResponse {
    /** Compréhension de l'enseignement (0-1) */
    readonly understanding: number;
    /** Feedback verbal/gestuel */
    readonly feedback: string;
    /** Erreurs commises volontairement */
    readonly simulatedErrors: readonly string[];
    /** Questions posées par l'avatar */
    readonly questions: readonly string[];
    /** État émotionnel simulé */
    readonly emotionalState: 'confused' | 'engaged' | 'frustrated' | 'excited' | 'focused';
}

/**
 * Données de session d'enseignement
 * 
 * @interface TeachingSession
 */
interface TeachingSession {
    /** Identifiant de la session */
    readonly id: string;
    /** Contenu enseigné */
    readonly content: string;
    /** Compétence ciblée */
    readonly targetSkill: string;
    /** Durée de la session (minutes) */
    readonly duration: number;
    /** Qualité perçue de l'enseignement (0-1) */
    readonly teachingQuality: number;
    /** Réponse de l'avatar */
    readonly avatarResponse: AvatarResponse;
    /** Date de la session */
    readonly sessionDate: Date;
}

/**
 * Configuration par défaut de l'avatar
 */
const DEFAULT_BEHAVIOR_CONFIG: AvatarBehaviorConfig = {
    learningRate: 0.7,
    errorProbability: 0.15,
    motivationFactor: 0.8,
    enableEmotionalResponses: true
} as const;

/**
 * État initial de l'avatar débutant
 */
const INITIAL_AVATAR_STATE: AvatarLearningState = {
    currentLevel: AVATAR_LEVELS.DEBUTANT,
    cecrLevel: 'A1',
    acquiredSkills: [],
    strugglingAreas: ['grammaire', 'vocabulaire_avance', 'expressions_faciales'],
    overallProgress: 0,
    sessionsCount: 0,
    lastUpdated: new Date()
} as const;

/**
 * Avatar Apprenant - Système d'apprentissage inverse CODA virtuel
 * Implémente la mécanique de progression du diagramme d'état
 * 
 * @class AvatarApprenant
 * @example
 * ```typescript
 * const avatar = new AvatarApprenant('avatar-001', userProfile);
 * const response = await avatar.receiveTeaching({
 *     content: 'Signe pour "bonjour"',
 *     targetSkill: 'salutations',
 *     duration: 5,
 *     teachingQuality: 0.9
 * });
 * console.log(`Avatar comprend à ${response.understanding * 100}%`);
 * ```
 */
export class AvatarApprenant {
    private readonly logger = Logger.getInstance('AvatarApprenant');
    private readonly config: AvatarBehaviorConfig;
    private state: AvatarLearningState;
    private readonly teachingSessions: TeachingSession[];

    /**
     * Constructeur de l'Avatar Apprenant
     * 
     * @param avatarId - Identifiant unique de l'avatar
     * @param teacherProfile - Profil de l'utilisateur enseignant
     * @param behaviorConfig - Configuration de comportement (optionnelle)
     */
    constructor(
        public readonly avatarId: string,
        private readonly teacherProfile: UserReverseProfile,
        behaviorConfig?: Partial<AvatarBehaviorConfig>
    ) {
        this.config = { ...DEFAULT_BEHAVIOR_CONFIG, ...behaviorConfig };
        this.state = { ...INITIAL_AVATAR_STATE };
        this.teachingSessions = [];

        // Adapter l'état initial selon le profil de l'enseignant
        this.adaptToTeacherProfile();

        this.logger.info('Avatar Apprenant initialisé', {
            avatarId: this.avatarId,
            initialLevel: this.state.currentLevel,
            teacherLevel: this.teacherProfile.currentLevel
        });
    }

    /**
     * L'avatar reçoit un enseignement et y répond
     * 
     * @param teaching - Données d'enseignement
     * @returns Promise<AvatarResponse> Réponse de l'avatar
     */
    public async receiveTeaching(teaching: {
        content: string;
        targetSkill: string;
        duration: number;
        teachingQuality: number;
    }): Promise<AvatarResponse> {
        this.logger.debug('Avatar reçoit un enseignement', {
            avatarId: this.avatarId,
            targetSkill: teaching.targetSkill,
            duration: teaching.duration
        });

        // Générer la réponse de l'avatar
        const response = this.generateAvatarResponse(teaching);

        // Créer la session d'enseignement
        const session: TeachingSession = {
            id: this.generateSessionId(),
            content: teaching.content,
            targetSkill: teaching.targetSkill,
            duration: teaching.duration,
            teachingQuality: teaching.teachingQuality,
            avatarResponse: response,
            sessionDate: new Date()
        };

        // Enregistrer la session
        this.teachingSessions.push(session);

        // Mettre à jour l'état de l'avatar
        await this.updateAvatarState(session);

        this.logger.info('Avatar a traité l\'enseignement', {
            avatarId: this.avatarId,
            understanding: response.understanding,
            newProgress: this.state.overallProgress,
            currentLevel: this.state.currentLevel
        });

        return response;
    }

    /**
     * Obtient l'état actuel de l'avatar
     * 
     * @returns AvatarLearningState État actuel
     */
    public getCurrentState(): AvatarLearningState {
        return { ...this.state };
    }

    /**
     * Obtient l'historique des sessions d'enseignement
     * 
     * @returns TeachingSession[] Historique des sessions
     */
    public getTeachingHistory(): readonly TeachingSession[] {
        return [...this.teachingSessions];
    }

    /**
     * Demande à l'avatar de poser une question spontanée
     * 
     * @returns string | null Question ou null si aucune question
     */
    public askSpontaneousQuestion(): string | null {
        const shouldAsk = Math.random() < 0.3; // 30% de chance

        if (!shouldAsk) {
            return null;
        }

        const questions = this.generateContextualQuestions();

        if (questions.length === 0) {
            return null;
        }

        const selectedQuestion = questions[Math.floor(Math.random() * questions.length)];

        this.logger.debug('Avatar pose une question spontanée', {
            avatarId: this.avatarId,
            question: selectedQuestion
        });

        return selectedQuestion;
    }

    /**
     * Évalue si l'avatar doit passer au niveau suivant
     * 
     * @returns boolean True si progression possible
     */
    public shouldLevelUp(): boolean {
        const progressThreshold = this.getLevelUpThreshold();
        const hasRequiredSessions = this.state.sessionsCount >= this.getMinimumSessionsForLevel();

        return this.state.overallProgress >= progressThreshold && hasRequiredSessions;
    }

    /**
     * Fait progresser l'avatar au niveau suivant
     * 
     * @returns boolean True si la progression a eu lieu
     */
    public levelUp(): boolean {
        if (!this.shouldLevelUp()) {
            return false;
        }

        const newLevel = this.getNextLevel();
        const newCECRLevel = this.mapAvatarLevelToCECRL(newLevel);

        this.state = {
            ...this.state,
            currentLevel: newLevel,
            cecrLevel: newCECRLevel,
            overallProgress: 0, // Réinitialiser pour le nouveau niveau
            acquiredSkills: [...this.state.acquiredSkills, ...this.getNewSkillsForLevel(newLevel)],
            strugglingAreas: this.getNewStrugglingAreasForLevel(newLevel),
            lastUpdated: new Date()
        };

        this.logger.info('Avatar a progressé de niveau', {
            avatarId: this.avatarId,
            newLevel: newLevel,
            newCECRLevel: newCECRLevel,
            totalSkills: this.state.acquiredSkills.length
        });

        return true;
    }

    /**
     * Génère une réponse contextuelle de l'avatar
     * 
     * @param teaching - Données d'enseignement
     * @returns AvatarResponse Réponse générée
     * @private
     */
    private generateAvatarResponse(teaching: {
        content: string;
        targetSkill: string;
        duration: number;
        teachingQuality: number;
    }): AvatarResponse {
        // Calculer la compréhension basée sur plusieurs facteurs
        const baseUnderstanding = Math.min(
            teaching.teachingQuality * this.config.learningRate,
            0.95
        );

        // Ajuster selon le niveau de difficulté de la compétence
        const difficultyFactor = this.getSkillDifficultyFactor(teaching.targetSkill);
        const understanding = Math.max(baseUnderstanding * difficultyFactor, 0.1);

        // Générer des erreurs simulées
        const simulatedErrors = this.generateSimulatedErrors(teaching.targetSkill, understanding);

        // Générer des questions
        const questions = this.generateQuestions(teaching.targetSkill, understanding);

        // Déterminer l'état émotionnel
        const emotionalState = this.determineEmotionalState(understanding, teaching.duration);

        // Générer le feedback
        const feedback = this.generateFeedback(understanding, emotionalState);

        return {
            understanding,
            feedback,
            simulatedErrors,
            questions,
            emotionalState
        };
    }

    /**
     * Met à jour l'état de l'avatar après une session
     * 
     * @param session - Session d'enseignement
     * @private
     */
    private async updateAvatarState(session: TeachingSession): Promise<void> {
        const progressGain = this.calculateProgressGain(session);
        const newProgress = Math.min(this.state.overallProgress + progressGain, 100);

        // Mettre à jour les compétences acquises
        const newSkills = this.updateAcquiredSkills(session);

        // Mettre à jour les zones de difficulté
        const newStrugglingAreas = this.updateStrugglingAreas(session);

        this.state = {
            ...this.state,
            overallProgress: newProgress,
            sessionsCount: this.state.sessionsCount + 1,
            acquiredSkills: newSkills,
            strugglingAreas: newStrugglingAreas,
            lastUpdated: new Date()
        };
    }

    /**
     * Adapte l'état initial selon le profil de l'enseignant
     * 
     * @private
     */
    private adaptToTeacherProfile(): void {
        // Adapter le taux d'apprentissage selon l'expérience de l'enseignant
        const teacherExperience = this.assessTeacherExperience();

        // Créer une nouvelle configuration adaptée
        const adaptedLearningRate = this.config.learningRate * (1 + teacherExperience * 0.2);
        const adaptedErrorProbability = this.config.errorProbability * (1 - teacherExperience * 0.3);

        // Remplacer la configuration par une nouvelle version adaptée
        (this as { config: AvatarBehaviorConfig }).config = {
            ...this.config,
            learningRate: adaptedLearningRate,
            errorProbability: adaptedErrorProbability
        };

        this.logger.debug('Configuration adaptée au profil enseignant', {
            teacherLevel: this.teacherProfile.currentLevel,
            adaptedLearningRate,
            adaptedErrorProbability
        });
    }

    /**
     * Évalue l'expérience de l'enseignant (0-1)
     * 
     * @returns number Score d'expérience
     * @private
     */
    private assessTeacherExperience(): number {
        const levelScore = this.getCECRLLevelScore(this.teacherProfile.currentLevel);
        return Math.min(levelScore / 6, 1); // Normaliser sur C2 = 6
    }

    /**
     * Convertit un niveau CECRL en score numérique
     * 
     * @param level - Niveau CECRL
     * @returns number Score (1-6)
     * @private
     */
    private getCECRLLevelScore(level: CECRLLevel): number {
        const scores = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
        return scores[level] ?? 1;
    }

    /**
     * Calcule le gain de progression d'une session
     * 
     * @param session - Session d'enseignement
     * @returns number Gain de progression (0-100)
     * @private
     */
    private calculateProgressGain(session: TeachingSession): number {
        const baseGain = session.avatarResponse.understanding * 10;
        const qualityMultiplier = session.teachingQuality;
        const durationFactor = Math.min(session.duration / 10, 2); // Bonus pour sessions longues

        return baseGain * qualityMultiplier * durationFactor;
    }

    /**
     * Génère un identifiant de session unique
     * 
     * @returns string Identifiant unique
     * @private
     */
    private generateSessionId(): string {
        return `session-${this.avatarId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    /**
     * Détermine l'état émotionnel basé sur la compréhension
     * 
     * @param understanding - Niveau de compréhension
     * @param duration - Durée de la session
     * @returns État émotionnel
     * @private
     */
    private determineEmotionalState(
        understanding: number,
        duration: number
    ): AvatarResponse['emotionalState'] {
        if (understanding > 0.8) return 'excited';
        if (understanding > 0.6) return 'focused';
        if (understanding > 0.4) return 'engaged';
        if (duration > 15) return 'frustrated'; // Sessions trop longues
        return 'confused';
    }

    /**
     * Génère des questions contextuelles
     * 
     * @returns string[] Liste de questions
     * @private
     */
    private generateContextualQuestions(): string[] {
        const questions: string[] = [];

        // Questions basées sur les zones de difficulté
        for (const area of this.state.strugglingAreas) {
            if (Math.random() < 0.4) {
                questions.push(`Peux-tu m'expliquer encore comment faire ${area}?`);
            }
        }

        // Questions basées sur le niveau actuel
        switch (this.state.currentLevel) {
            case AVATAR_LEVELS.DEBUTANT:
                questions.push('Comment je place mes mains pour ce signe?');
                questions.push('Est-ce que je fais bien l\'expression du visage?');
                break;
            case AVATAR_LEVELS.INTERMEDIAIRE:
                questions.push('Comment je peux rendre ce signe plus expressif?');
                questions.push('Quelle est la différence avec le signe similaire?');
                break;
            case AVATAR_LEVELS.AVANCE:
                questions.push('Dans quel contexte utilise-t-on cette variante?');
                questions.push('Comment adapter ce signe selon la région?');
                break;
        }

        return questions;
    }

    /**
     * Génère des erreurs simulées réalistes
     * 
     * @param targetSkill - Compétence ciblée
     * @param understanding - Niveau de compréhension
     * @returns string[] Liste d'erreurs simulées
     * @private
     */
    private generateSimulatedErrors(targetSkill: string, understanding: number): string[] {
        const errors: string[] = [];

        // Plus la compréhension est faible, plus il y a d'erreurs
        const errorCount = Math.floor((1 - understanding) * 3);

        for (let i = 0; i < errorCount; i++) {
            if (Math.random() < this.config.errorProbability) {
                errors.push(this.getRealisticErrorForSkill(targetSkill));
            }
        }

        return errors;
    }

    /**
     * Génère des questions basées sur la compétence et compréhension
     * 
     * @param targetSkill - Compétence ciblée
     * @param understanding - Niveau de compréhension
     * @returns string[] Liste de questions
     * @private
     */
    private generateQuestions(targetSkill: string, understanding: number): string[] {
        const questions: string[] = [];

        // Questions selon le niveau de compréhension
        if (understanding < 0.5) {
            questions.push(`Je ne comprends pas bien ${targetSkill}, peux-tu répéter?`);
            questions.push('Peux-tu me montrer plus lentement?');
        } else if (understanding < 0.8) {
            questions.push(`Y a-t-il des variantes pour ${targetSkill}?`);
            questions.push('Dans quelles situations utilise-t-on ce signe?');
        } else {
            questions.push('Parfait! Peux-tu me montrer un signe plus complexe?');
            questions.push(`Comment puis-je améliorer ma maîtrise de ${targetSkill}?`);
        }

        return questions;
    }

    /**
     * Génère un feedback approprié
     * 
     * @param understanding - Niveau de compréhension
     * @param emotionalState - État émotionnel
     * @returns string Feedback textuel
     * @private
     */
    private generateFeedback(
        understanding: number,
        emotionalState: AvatarResponse['emotionalState']
    ): string {
        const feedbacks = {
            confused: [
                'Je ne suis pas sûr de comprendre...',
                'Peux-tu m\'aider à mieux saisir?',
                'C\'est un peu difficile pour moi'
            ],
            engaged: [
                'D\'accord, je commence à voir!',
                'Ah oui, je pense que je comprends',
                'C\'est intéressant, continue!'
            ],
            frustrated: [
                'C\'est vraiment compliqué...',
                'J\'ai du mal à retenir tout ça',
                'Peux-tu simplifier un peu?'
            ],
            excited: [
                'Génial! J\'ai compris!',
                'C\'est formidable, merci!',
                'Je me sens prêt pour la suite!'
            ],
            focused: [
                'Je vois, laisse-moi essayer',
                'D\'accord, je vais pratiquer ça',
                'Je pense que j\'y arrive!'
            ]
        };

        const categoryFeedbacks = feedbacks[emotionalState];
        return categoryFeedbacks[Math.floor(Math.random() * categoryFeedbacks.length)];
    }

    /**
     * Obtient une erreur réaliste pour une compétence donnée
     * 
     * @param skill - Compétence
     * @returns string Erreur simulée
     * @private
     */
    private getRealisticErrorForSkill(skill: string): string {
        const skillErrors = {
            'grammaire': 'Confusion dans l\'ordre des signes',
            'vocabulaire': 'Forme de main incorrecte',
            'expressions_faciales': 'Expression trop neutre',
            'espace_signe': 'Placement spatial incorrect',
            'mouvement': 'Mouvement trop rapide/lent'
        };

        return skillErrors[skill] ?? 'Hésitation dans l\'exécution';
    }

    /**
     * Obtient le facteur de difficulté d'une compétence
     * 
     * @param skill - Compétence
     * @returns number Facteur (0.5-1.0)
     * @private
     */
    private getSkillDifficultyFactor(skill: string): number {
        const difficulties = {
            'salutations': 0.9,
            'vocabulaire_base': 0.8,
            'grammaire': 0.6,
            'expressions_faciales': 0.5,
            'espace_signe': 0.6,
            'vocabulaire_avance': 0.4
        };

        return difficulties[skill] ?? 0.7;
    }

    /**
     * Met à jour les compétences acquises
     * 
     * @param session - Session d'enseignement
     * @returns string[] Nouvelles compétences
     * @private
     */
    private updateAcquiredSkills(session: TeachingSession): readonly string[] {
        const currentSkills = [...this.state.acquiredSkills];

        // Acquérir la compétence si bien comprise et pas déjà acquise
        if (session.avatarResponse.understanding > 0.7 &&
            !currentSkills.includes(session.targetSkill)) {
            currentSkills.push(session.targetSkill);
        }

        return currentSkills;
    }

    /**
     * Met à jour les zones de difficulté
     * 
     * @param session - Session d'enseignement
     * @returns string[] Nouvelles zones de difficulté
     * @private
     */
    private updateStrugglingAreas(session: TeachingSession): readonly string[] {
        const currentStrugglingAreas = [...this.state.strugglingAreas];

        // Retirer de la difficulté si bien maîtrisé
        if (session.avatarResponse.understanding > 0.8) {
            const index = currentStrugglingAreas.indexOf(session.targetSkill);
            if (index > -1) {
                currentStrugglingAreas.splice(index, 1);
            }
        }

        // Ajouter en difficulté si mal compris
        if (session.avatarResponse.understanding < 0.4 &&
            !currentStrugglingAreas.includes(session.targetSkill)) {
            currentStrugglingAreas.push(session.targetSkill);
        }

        return currentStrugglingAreas;
    }

    /**
     * Obtient le seuil de progression pour le niveau actuel
     * 
     * @returns number Seuil de progression (0-100)
     * @private
     */
    private getLevelUpThreshold(): number {
        const thresholds = {
            [AVATAR_LEVELS.DEBUTANT]: 80,
            [AVATAR_LEVELS.INTERMEDIAIRE]: 85,
            [AVATAR_LEVELS.AVANCE]: 90,
            [AVATAR_LEVELS.MAITRISE_CODA]: 100 // Niveau max
        };

        return thresholds[this.state.currentLevel] ?? 100;
    }

    /**
     * Obtient le nombre minimum de sessions pour progresser
     * 
     * @returns number Nombre de sessions
     * @private
     */
    private getMinimumSessionsForLevel(): number {
        const minimums = {
            [AVATAR_LEVELS.DEBUTANT]: 10,
            [AVATAR_LEVELS.INTERMEDIAIRE]: 15,
            [AVATAR_LEVELS.AVANCE]: 20,
            [AVATAR_LEVELS.MAITRISE_CODA]: Infinity
        };

        return minimums[this.state.currentLevel] ?? Infinity;
    }

    /**
     * Obtient le niveau suivant
     * 
     * @returns AvatarLevel Niveau suivant
     * @private
     */
    private getNextLevel(): AvatarLevel {
        const progression = {
            [AVATAR_LEVELS.DEBUTANT]: AVATAR_LEVELS.INTERMEDIAIRE,
            [AVATAR_LEVELS.INTERMEDIAIRE]: AVATAR_LEVELS.AVANCE,
            [AVATAR_LEVELS.AVANCE]: AVATAR_LEVELS.MAITRISE_CODA,
            [AVATAR_LEVELS.MAITRISE_CODA]: AVATAR_LEVELS.MAITRISE_CODA
        };

        return progression[this.state.currentLevel];
    }

    /**
     * Mappe un niveau d'avatar vers CECRL
     * 
     * @param avatarLevel - Niveau d'avatar
     * @returns CECRLLevel Niveau CECRL correspondant
     * @private
     */
    private mapAvatarLevelToCECRL(avatarLevel: AvatarLevel): CECRLLevel {
        const mapping = {
            [AVATAR_LEVELS.DEBUTANT]: 'A1' as CECRLLevel,
            [AVATAR_LEVELS.INTERMEDIAIRE]: 'A2' as CECRLLevel,
            [AVATAR_LEVELS.AVANCE]: 'B1' as CECRLLevel,
            [AVATAR_LEVELS.MAITRISE_CODA]: 'B2' as CECRLLevel
        };

        return mapping[avatarLevel];
    }

    /**
     * Obtient les nouvelles compétences pour un niveau
     * 
     * @param level - Niveau d'avatar
     * @returns string[] Nouvelles compétences
     * @private
     */
    private getNewSkillsForLevel(level: AvatarLevel): readonly string[] {
        const skillsByLevel = {
            [AVATAR_LEVELS.INTERMEDIAIRE]: [
                'grammaire_base',
                'questions_simples',
                'temps_present'
            ],
            [AVATAR_LEVELS.AVANCE]: [
                'grammaire_avancee',
                'expression_emotions',
                'recit_simple'
            ],
            [AVATAR_LEVELS.MAITRISE_CODA]: [
                'nuances_culturelles',
                'humour_lsf',
                'adaptation_dialectale'
            ]
        };

        return skillsByLevel[level] ?? [];
    }

    /**
     * Obtient les nouvelles zones de difficulté pour un niveau
     * 
     * @param level - Niveau d'avatar
     * @returns string[] Zones de difficulté
     * @private
     */
    private getNewStrugglingAreasForLevel(level: AvatarLevel): readonly string[] {
        const strugglingByLevel = {
            [AVATAR_LEVELS.INTERMEDIAIRE]: [
                'conjugaisons',
                'pronoms_complexes'
            ],
            [AVATAR_LEVELS.AVANCE]: [
                'metaphores',
                'ironie',
                'registres_langue'
            ],
            [AVATAR_LEVELS.MAITRISE_CODA]: [
                'poetique_lsf'
            ]
        };

        return strugglingByLevel[level] ?? [];
    }
}