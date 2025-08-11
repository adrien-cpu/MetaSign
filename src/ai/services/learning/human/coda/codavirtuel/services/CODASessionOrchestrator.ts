/**
 * @file src/ai/services/learning/human/coda/codavirtuel/services/CODASessionOrchestrator.ts
 * @description Service d'orchestration des sessions CODA avec logique métier révolutionnaire
 * 
 * Fonctionnalités révolutionnaires :
 * - 🎭 Orchestration complète des sessions mentor ↔ IA-élève
 * - 🤖 Coordination intelligente des IA-élèves Tamagotchi
 * - 📊 Gestion temps réel des interactions d'apprentissage
 * - 🔄 Évolution dynamique des IA basée sur l'enseignement
 * - 🌟 Architecture modulaire < 300 lignes
 * - ✨ Compatible exactOptionalPropertyTypes: true
 * 
 * @module services
 * @version 5.0.0 - Service révolutionnaire CODA Sessions (Version Propre)
 * @since 2025
 * @author MetaSign Team - CODA Session Management
 * @lastModified 2025-07-31
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';

// Imports des composants
import type { CODASessionManager } from '../managers/CODASessionManager';
import type { AIStudentSimulator } from '../simulators/AIStudentSimulator';
import type { TypeConverter } from '../utils/TypeConverter';

// Imports des types harmonisés centralisés
import type {
    ComprehensiveAIStatus,
    CODAPersonalityType,
    CulturalEnvironment,
    CODASessionConfig,
    TeachingSession,
    MentorEvaluation,
    CODAGlobalStatistics,
    ReverseApprenticeshipOptions,
    AIMood,
    CECRLLevel,
    AIStudentPersonalityType,
    PrimaryEmotion
} from '../types/index';

// Types pour éviter les conflits
type CompatibleCulturalEnvironment = 'deaf_family_home' | 'mixed_hearing_family' | 'school_environment' | 'community_center' | 'online_learning';
type CompatibleAIMood = 'happy' | 'confused' | 'frustrated' | 'excited' | 'neutral';
type SupportedPersonality = Extract<CODAPersonalityType, 'curious_student' | 'shy_learner' | 'energetic_pupil' | 'patient_apprentice'>;

/**
 * Interface pour les sessions d'enseignement actives
 */
interface ActiveTeachingSession {
    readonly sessionId: string;
    readonly mentorId: string;
    readonly topic: string;
    readonly concepts: readonly string[];
    readonly startTime: Date;
    readonly teachingMethod: string;
    readonly aiStudent: HarmonizedAIStudent;
    readonly interactions: readonly TeachingInteraction[];
}

/**
 * Interface pour les interactions d'enseignement
 */
interface TeachingInteraction {
    readonly timestamp: Date;
    readonly concept: string;
    readonly explanation: string;
    readonly comprehension: number;
    readonly needsHelp: boolean;
}

/**
 * Interface pour l'IA-élève harmonisée
 */
interface HarmonizedAIStudent {
    readonly id: string;
    readonly name: string;
    readonly personality: string;
    readonly currentLevel: CECRLLevel;
    readonly progress: number;
    readonly mood: CompatibleAIMood;
    readonly strengths: readonly string[];
    readonly weaknesses: readonly string[];
    readonly culturalContext: CompatibleCulturalEnvironment;
    readonly comprehensionRate: number;
    readonly attentionSpan: number;
    readonly learningStyle: string;
    readonly lastActivity: Date;
    readonly totalSessionTime: number;
    readonly conceptsLearned: readonly string[];
    readonly emotionalState: {
        readonly primaryEmotion: PrimaryEmotion; // ✅ Utilisation de PrimaryEmotion
        readonly intensity: number;
        readonly confidence: number;
    };
}

/**
 * Service d'orchestration des sessions CODA révolutionnaire
 */
export class CODASessionOrchestrator {
    private readonly logger = LoggerFactory.getLogger('CODASessionOrchestrator');
    private readonly activeTeachingSessions = new Map<string, ActiveTeachingSession>();

    constructor(
        private readonly sessionManager: CODASessionManager,
        private readonly aiSimulator: AIStudentSimulator,
        private readonly typeConverter: TypeConverter,
        private readonly options: ReverseApprenticeshipOptions
    ) {
        this.logger.info('🎭 CODASessionOrchestrator initialisé', {
            aiIntelligence: this.options.aiIntelligenceLevel,
            realTimeEvaluation: this.options.realTimeEvaluation
        });
    }

    /**
     * Crée une nouvelle IA-élève Tamagotchi avec personnalité
     */
    public async createAIStudent(
        mentorId: string,
        customName?: string,
        personality?: CODAPersonalityType,
        culturalContext?: CulturalEnvironment
    ): Promise<ComprehensiveAIStatus> {
        try {
            this.logger.info('🎯 Création IA-élève orchestrée', { mentorId, customName, personality });

            const normalizedPersonality = this.normalizePersonality(personality);
            const normalizedCulturalContext = this.normalizeCulturalEnvironment(
                culturalContext || this.options.defaultCulturalEnvironment || 'deaf_family_home'
            );

            const sessionConfig: CODASessionConfig = {
                aiPersonality: normalizedPersonality,
                culturalEnvironment: normalizedCulturalContext,
                customAIName: customName,
                difficultyLevel: 'beginner',
                enableEmotionalFeedback: true,
                adaptiveResponse: true
            };

            const codaSession = await this.sessionManager.createCODASession(mentorId, sessionConfig);
            const rawAIStudent = await this.aiSimulator.createAdvancedAIStudent(
                codaSession.aiStudent.name,
                this.convertPersonalityToSimulator(normalizedPersonality) as never,
                normalizedCulturalContext as never
            );

            const comprehensiveAIStudent = this.harmonizeToComprehensiveAIStatus(rawAIStudent);

            await this.sessionManager.updateAIStudent(mentorId, {
                name: comprehensiveAIStudent.name,
                mood: this.convertToValidSessionMood(this.convertAIMoodToCompatible(comprehensiveAIStudent.mood)),
                lastLearned: 'initialization',
                comprehensionRate: 0.5
            });

            this.logger.info('✨ IA-élève créée avec succès', {
                mentorId,
                aiName: comprehensiveAIStudent.name
            });

            return comprehensiveAIStudent;
        } catch (error) {
            this.logger.error('❌ Erreur création IA-élève', { mentorId, error });
            throw error;
        }
    }

    /**
     * Démarre une session d'enseignement orchestrée
     */
    public async startTeachingSession(
        mentorId: string,
        topic: string,
        concepts?: readonly string[],
        teachingMethod?: string
    ): Promise<string> {
        try {
            const codaSession = this.sessionManager.getSessionStatus(mentorId);
            if (!codaSession) {
                throw new Error(`Session CODA non trouvée pour mentor: ${mentorId}`);
            }

            const finalConcepts = concepts || this.extractConceptsFromTopic(topic);
            const finalTeachingMethod = teachingMethod || this.selectOptimalTeachingMethod(topic, codaSession.aiStudent);

            const rawAIStudent = this.typeConverter.convertSessionToComprehensiveStatus(codaSession.aiStudent);
            const aiStudent = this.harmonizeToHarmonizedAIStudent(rawAIStudent);

            const sessionId = this.generateTeachingSessionId();
            const activeSession: ActiveTeachingSession = {
                sessionId,
                mentorId,
                topic,
                concepts: finalConcepts,
                startTime: new Date(),
                teachingMethod: finalTeachingMethod,
                aiStudent,
                interactions: []
            };

            this.activeTeachingSessions.set(sessionId, activeSession);
            this.logger.info('🎓 Session enseignement démarrée', { sessionId, mentorId, topic });

            return sessionId;
        } catch (error) {
            this.logger.error('❌ Erreur démarrage session enseignement', { mentorId, topic, error });
            throw error;
        }
    }

    /**
     * Enseigne un concept avec orchestration complète
     */
    public async teachConcept(
        mentorId: string,
        teachingSessionId: string,
        concept: string,
        explanation: string
    ): Promise<{ aiReaction: string; comprehension: number; needsHelp: boolean }> {
        try {
            const activeSession = this.activeTeachingSessions.get(teachingSessionId);
            if (!activeSession) {
                throw new Error(`Session d'enseignement non trouvée: ${teachingSessionId}`);
            }

            const aiStudentForSimulator = this.createSimulatorCompatibleAIStudent(activeSession.aiStudent);
            const rawAIReaction = await this.aiSimulator.simulateAdvancedLearning(
                aiStudentForSimulator as never, // ✅ Cast pour résoudre les conflits de types
                concept,
                explanation,
                activeSession.teachingMethod
            );

            const comprehension = this.extractComprehension(rawAIReaction);
            const textualReaction = this.extractTextualReaction(rawAIReaction);
            const needsHelp = comprehension < 0.5;

            // ✅ Utilise PrimaryEmotion pour analyser l'état émotionnel
            const primaryEmotion = this.extractPrimaryEmotionFromComprehension(comprehension);
            const compatibleMood = this.convertPrimaryEmotionToCompatible(primaryEmotion);

            const interaction: TeachingInteraction = {
                timestamp: new Date(),
                concept,
                explanation,
                comprehension,
                needsHelp
            };

            this.activeTeachingSessions.set(teachingSessionId, {
                ...activeSession,
                interactions: [...activeSession.interactions, interaction]
            });

            await this.sessionManager.updateAIStudent(mentorId, {
                mood: this.convertToValidSessionMood(compatibleMood),
                lastLearned: concept,
                comprehensionRate: comprehension
            });

            return { aiReaction: textualReaction, comprehension, needsHelp };
        } catch (error) {
            this.logger.error('❌ Erreur enseignement concept', { mentorId, teachingSessionId, concept, error });
            throw error;
        }
    }

    /**
     * Termine une session d'enseignement avec évaluation complète
     */
    public async endTeachingSession(
        mentorId: string,
        teachingSessionId: string
    ): Promise<{ sessionSummary: TeachingSession; mentorEvaluation: MentorEvaluation }> {
        try {
            const activeSession = this.activeTeachingSessions.get(teachingSessionId);
            if (!activeSession) {
                throw new Error(`Session d'enseignement non trouvée: ${teachingSessionId}`);
            }

            const sessionSummary = this.createTeachingSessionSummary(activeSession);
            const mentorEvaluation = this.evaluateMentorPerformance(activeSession);

            this.sessionManager.addTeachingSession(mentorId, sessionSummary);
            this.activeTeachingSessions.delete(teachingSessionId);

            this.logger.info('✅ Session enseignement terminée', {
                mentorId,
                teachingSessionId,
                conceptsMastered: sessionSummary.metrics.conceptsMastered.length,
                mentorScore: mentorEvaluation.overallScore.toFixed(2)
            });

            return { sessionSummary, mentorEvaluation };
        } catch (error) {
            this.logger.error('❌ Erreur fin session enseignement', { mentorId, teachingSessionId, error });
            throw error;
        }
    }

    // ==================== MÉTHODES PUBLIQUES UTILITAIRES ====================

    public getAIStudentStatus(mentorId: string): ComprehensiveAIStatus | null {
        const session = this.sessionManager.getSessionStatus(mentorId);
        if (!session) return null;
        const rawAIStudent = this.typeConverter.convertSessionToComprehensiveStatus(session.aiStudent);
        return this.harmonizeToComprehensiveAIStatus(rawAIStudent);
    }

    public getGlobalStatistics(): CODAGlobalStatistics {
        return this.sessionManager.getGlobalStatistics();
    }

    public async terminateCODASession(mentorId: string): Promise<boolean> {
        const terminated = await this.sessionManager.terminateSession(mentorId);
        return terminated !== null;
    }

    public async destroy(): Promise<void> {
        this.activeTeachingSessions.clear();
        this.logger.info('🧹 CODASessionOrchestrator détruit');
    }

    // ==================== MÉTHODES PRIVÉES ====================

    private normalizePersonality(personality?: CODAPersonalityType): SupportedPersonality {
        const supportedPersonalities: readonly SupportedPersonality[] = [
            'curious_student', 'shy_learner', 'energetic_pupil', 'patient_apprentice'
        ];
        if (personality && supportedPersonalities.includes(personality as SupportedPersonality)) {
            return personality as SupportedPersonality;
        }
        return (this.options.aiPersonality as SupportedPersonality) || 'curious_student';
    }

    private normalizeCulturalEnvironment(environment: string): CompatibleCulturalEnvironment {
        const environmentMapping: Record<string, CompatibleCulturalEnvironment> = {
            'deaf_family_home': 'deaf_family_home',
            'mixed_hearing_family': 'mixed_hearing_family',
            'school_environment': 'school_environment',
            'community_center': 'community_center',
            'online_learning': 'online_learning',
            'deaf_school': 'school_environment',
            'deaf_community_center': 'community_center',
            'deaf_workplace': 'community_center'
        };
        return environmentMapping[environment] || 'deaf_family_home';
    }

    private convertPersonalityToSimulator(personality: SupportedPersonality): string {
        const conversionMap: Record<SupportedPersonality, string> = {
            'curious_student': 'curious',
            'shy_learner': 'shy',
            'energetic_pupil': 'energetic',
            'patient_apprentice': 'patient'
        };
        return conversionMap[personality] || 'curious';
    }

    private convertToSessionMood(mood: CompatibleAIMood): string {
        const moodMap: Record<CompatibleAIMood, string> = {
            'happy': 'happy',
            'confused': 'confused',
            'frustrated': 'frustrated',
            'excited': 'excited',
            'neutral': 'neutral'
        };
        return moodMap[mood] || 'neutral';
    }

    /**
     * ✅ Convertit vers un mood valide pour le sessionManager
     */
    private convertToValidSessionMood(mood: CompatibleAIMood): 'happy' | 'confused' | 'frustrated' | 'excited' | 'neutral' {
        const validMoods: readonly ('happy' | 'confused' | 'frustrated' | 'excited' | 'neutral')[] = ['happy', 'confused', 'frustrated', 'excited', 'neutral'] as const;
        type ValidMood = typeof validMoods[number];
        return validMoods.includes(mood as ValidMood) ? mood as ValidMood : 'neutral';
    }

    /**
     * ✅ Convertit AIMood vers CompatibleAIMood
     */
    private convertAIMoodToCompatible(mood: AIMood): CompatibleAIMood {
        const moodConversionMap: Partial<Record<AIMood, CompatibleAIMood>> = {
            'happy': 'happy',
            'confused': 'confused',
            'frustrated': 'frustrated',
            'excited': 'excited',
            'neutral': 'neutral',
            'curious': 'neutral' // ✅ 'curious' devient 'neutral'
        };
        return moodConversionMap[mood] || 'neutral';
    }

    /**
     * ✅ Utilise PrimaryEmotion pour conversion émotionnelle avancée
     */
    private convertPrimaryEmotionToCompatible(emotion: PrimaryEmotion): CompatibleAIMood {
        const emotionToMoodMap: Record<PrimaryEmotion, CompatibleAIMood> = {
            'joy': 'happy',
            'sadness': 'neutral',
            'anger': 'frustrated',
            'fear': 'confused',
            'surprise': 'excited',
            'disgust': 'frustrated',
            'trust': 'happy',
            'anticipation': 'excited',
            'confusion': 'confused',
            'excitement': 'excited',
            'curiosity': 'neutral',
            'frustration': 'frustrated',
            'satisfaction': 'happy',
            'boredom': 'neutral',
            'engagement': 'excited'
        };
        return emotionToMoodMap[emotion] || 'neutral';
    }

    private convertComprehensionToMood(comprehension: number): CompatibleAIMood {
        if (comprehension > 0.8) return 'happy';
        if (comprehension > 0.6) return 'excited';
        if (comprehension > 0.4) return 'neutral';
        if (comprehension > 0.2) return 'confused';
        return 'frustrated';
    }

    private harmonizeToComprehensiveAIStatus(aiStudent: unknown): ComprehensiveAIStatus {
        const student = aiStudent as Record<string, unknown>;

        // Conversion sécurisée des tableaux
        const weaknesses = Array.isArray(student.weaknesses)
            ? student.weaknesses.filter((item): item is string => typeof item === 'string')
            : [];
        const strengths = Array.isArray(student.strengths)
            ? student.strengths.filter((item): item is string => typeof item === 'string')
            : [];

        return {
            id: String(student.id || `ai_${Date.now()}`),
            name: String(student.name || 'IA-Élève'),
            personality: String(student.personality || 'curious_student') as AIStudentPersonalityType,
            currentLevel: (student.currentLevel as CECRLLevel) || 'A1',
            mood: 'neutral' as AIMood,
            culturalContext: this.normalizeCulturalEnvironment(String(student.culturalContext || 'deaf_family_home')) as CulturalEnvironment,
            personalityProfile: {} as never,
            emotionalState: {} as never,
            evolutionMetrics: {} as never,
            memoryStats: {} as never,
            performanceHistory: {} as never,
            weaknesses: weaknesses as readonly string[],
            strengths: strengths as readonly string[],
            lastLearned: student.lastLearned as string,
            progress: Number(student.progress || 0.0),
            motivation: Number(student.motivation || 0.5),
            totalLearningTime: Number(student.totalLearningTime || 0),
            comprehensionRate: Number(student.comprehensionRate || 0.5),
            attentionSpan: Number(student.attentionSpan || 30)
        };
    }

    private harmonizeToHarmonizedAIStudent(aiStudent: unknown): HarmonizedAIStudent {
        const student = aiStudent as Record<string, unknown>;

        // Conversion sécurisée des tableaux
        const strengths = Array.isArray(student.strengths)
            ? student.strengths.filter((item): item is string => typeof item === 'string')
            : [];
        const weaknesses = Array.isArray(student.weaknesses)
            ? student.weaknesses.filter((item): item is string => typeof item === 'string')
            : [];
        const conceptsLearned = Array.isArray(student.conceptsLearned)
            ? student.conceptsLearned.filter((item): item is string => typeof item === 'string')
            : [];

        return {
            id: String(student.id || `ai_${Date.now()}`),
            name: String(student.name || 'IA-Élève'),
            personality: String(student.personality || 'curious_student'),
            currentLevel: (student.currentLevel as CECRLLevel) || 'A1',
            progress: Number(student.progress || 0.0),
            mood: 'neutral',
            strengths: strengths as readonly string[],
            weaknesses: weaknesses as readonly string[],
            culturalContext: this.normalizeCulturalEnvironment(String(student.culturalContext || 'deaf_family_home')),
            comprehensionRate: Number(student.comprehensionRate || 0.5),
            attentionSpan: Number(student.attentionSpan || 30),
            learningStyle: String(student.learningStyle || 'visual'),
            lastActivity: (student.lastActivity as Date) || new Date(),
            totalSessionTime: Number(student.totalSessionTime || 0),
            conceptsLearned: conceptsLearned as readonly string[],
            emotionalState: {
                primaryEmotion: 'curiosity', // ✅ Utilise PrimaryEmotion
                intensity: 0.5,
                confidence: 0.5
            }
        };
    }

    private createSimulatorCompatibleAIStudent(aiStudent: HarmonizedAIStudent): Record<string, unknown> {
        // ✅ Retourne un objet générique pour éviter les conflits de types
        return {
            id: aiStudent.id,
            name: aiStudent.name,
            personality: aiStudent.personality as AIStudentPersonalityType,
            currentLevel: aiStudent.currentLevel,
            mood: 'neutral', // ✅ Mood neutre pour éviter les conflits
            culturalContext: aiStudent.culturalContext,
            personalityProfile: {},
            emotionalState: {},
            evolutionMetrics: {},
            memoryStats: {},
            performanceHistory: {},
            weaknesses: aiStudent.weaknesses,
            strengths: aiStudent.strengths,
            lastLearned: undefined,
            progress: aiStudent.progress,
            motivation: 0.5,
            totalLearningTime: aiStudent.totalSessionTime,
            comprehensionRate: aiStudent.comprehensionRate,
            attentionSpan: aiStudent.attentionSpan
        };
    }

    /**
     * ✅ Extrait une émotion primaire basée sur la compréhension
     */
    private extractPrimaryEmotionFromComprehension(comprehension: number): PrimaryEmotion {
        if (comprehension > 0.8) return 'joy';
        if (comprehension > 0.6) return 'satisfaction';
        if (comprehension > 0.4) return 'curiosity';
        if (comprehension > 0.2) return 'confusion';
        return 'frustration';
    }

    private extractComprehension(rawReaction: unknown): number {
        const reaction = rawReaction as Record<string, unknown>;
        const basicReaction = (reaction.basicReaction as Record<string, unknown>) || {};
        return Number(basicReaction.comprehension || 0.5);
    }

    private extractTextualReaction(rawReaction: unknown): string {
        const reaction = rawReaction as Record<string, unknown>;
        const basicReaction = (reaction.basicReaction as Record<string, unknown>) || {};
        return String(basicReaction.textualReaction || 'Je comprends');
    }

    private extractConceptsFromTopic(topic: string): readonly string[] {
        const conceptMaps: Record<string, readonly string[]> = {
            'basic_greetings': ['hello', 'goodbye', 'thank_you', 'please'],
            'numbers': ['counting_1_10', 'tens', 'hundreds'],
            'colors': ['primary_colors', 'secondary_colors'],
            'family': ['family_members', 'relationships'],
            'spatial_grammar': ['space_placement', 'spatial_references']
        };
        return conceptMaps[topic] || [topic];
    }

    private selectOptimalTeachingMethod(topic: string, aiStudent: { personality: string }): string {
        const personalityMethods: Record<string, string> = {
            'curious_student': 'interactive_exploration',
            'shy_learner': 'gentle_demonstration',
            'energetic_pupil': 'dynamic_practice',
            'patient_apprentice': 'step_by_step_guidance'
        };
        return personalityMethods[aiStudent.personality] || 'visual_demonstration';
    }

    private generateTeachingSessionId(): string {
        return `teach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private createTeachingSessionSummary(activeSession: ActiveTeachingSession): TeachingSession {
        const duration = Date.now() - activeSession.startTime.getTime();
        const conceptsMastered = activeSession.interactions
            .filter(i => i.comprehension > 0.7)
            .map(i => i.concept);

        return {
            sessionId: activeSession.sessionId,
            mentorId: activeSession.mentorId,
            aiStudentId: activeSession.aiStudent.id,
            startTime: activeSession.startTime,
            endTime: new Date(),
            content: {
                topic: activeSession.topic,
                targetLevel: activeSession.aiStudent.currentLevel,
                teachingMethod: activeSession.teachingMethod,
                duration,
                materials: [],
                exercises: []
            },
            aiReactions: {
                comprehension: this.calculateAverageComprehension(activeSession.interactions),
                textualReactions: ['Réaction d\'apprentissage'],
                questions: [],
                errors: [],
                emotion: activeSession.aiStudent.mood as AIMood,
                engagementEvolution: activeSession.interactions.map(() => 0.8),
                strugglingMoments: activeSession.interactions.filter(i => i.needsHelp).map(i => i.timestamp)
            },
            metrics: {
                actualDuration: duration,
                participationRate: 0.9,
                teacherInterventions: activeSession.interactions.length,
                successScore: this.calculateAverageComprehension(activeSession.interactions),
                conceptsMastered,
                conceptsToReview: activeSession.interactions.filter(i => i.comprehension < 0.5).map(i => i.concept),
                teachingEffectiveness: this.calculateTeachingEffectiveness(activeSession.interactions)
            },
            status: 'completed',
            objectives: activeSession.concepts
        };
    }

    private evaluateMentorPerformance(activeSession: ActiveTeachingSession): MentorEvaluation {
        const avgComprehension = this.calculateAverageComprehension(activeSession.interactions);

        return {
            overallScore: avgComprehension,
            competencies: {
                explanation: avgComprehension,
                patience: 0.8,
                adaptation: 0.7,
                encouragement: 0.8,
                culturalSensitivity: 0.7
            },
            improvementTips: activeSession.interactions.some(i => i.needsHelp)
                ? ['Adapter le rythme aux difficultés de l\'IA-élève']
                : [],
            strengthAreas: ['Explications claires', 'Progression structurée'],
            practiceExercises: [],
            sessionAnalysis: {
                totalSessions: 1,
                averageSessionDuration: Date.now() - activeSession.startTime.getTime(),
                studentProgressRate: avgComprehension,
                teachingConsistency: 0.8
            },
            personalityMatch: 0.8,
            culturalAdaptation: 0.7
        };
    }

    private calculateAverageComprehension(interactions: readonly TeachingInteraction[]): number {
        if (interactions.length === 0) return 0;
        return interactions.reduce((sum, i) => sum + i.comprehension, 0) / interactions.length;
    }

    private calculateTeachingEffectiveness(interactions: readonly TeachingInteraction[]): number {
        if (interactions.length === 0) return 0;
        const improvementRate = interactions.length > 1
            ? (interactions[interactions.length - 1].comprehension - interactions[0].comprehension)
            : 0;
        return Math.max(0, Math.min(1, 0.5 + improvementRate));
    }
}