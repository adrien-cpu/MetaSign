/**
 * Système CODA virtuel révolutionnaire - Version refactorisée
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/EnhancedCODASystem.ts
 * @module ai/services/learning/human/coda/codavirtuel/systems
 * @description Système CODA (Children of Deaf Adults) virtuel avec IA avancée pour l'apprentissage inverse
 * Simule un environnement d'apprentissage où l'IA joue le rôle d'un apprenant LSF
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 4.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import {
    ExerciseGeneratorService,
    Exercise,
    SupportedExerciseType,
    CECRLLevel,
    createExerciseService,
    createExerciseValidator
} from '../exercises';
// Import temporaire direct jusqu'à la correction de l'export
// import { AIPersonalitySystem } from './AIPersonalitySystem';
import { AIMemorySystem } from './AIMemorySystem';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { CODAConfigManager, CODASystemConfig } from './config/CODAConfigManager';
import { CODAStateManager, CODALearningState, CODALearningSession } from './state/CODAStateManager';
import { CODAResponseGenerator, CODAResponse } from './response/CODAResponseGenerator';
import { CODAEmotionalProcessor, TrainerFeedback } from './emotional/CODAEmotionalProcessor';

/**
 * Système CODA virtuel révolutionnaire refactorisé
 * Simule un apprenant LSF avec personnalité, émotions et mémoire
 */
export class EnhancedCODASystem {
    private readonly logger = LoggerFactory.getLogger('EnhancedCODASystem');
    private readonly exerciseService: ExerciseGeneratorService;
    // private readonly personalitySystem: any; // TODO: Corriger le type quand AIPersonalitySystem sera disponible
    private readonly memorySystem: AIMemorySystem;
    private readonly validator = createExerciseValidator();
    
    private readonly configManager: CODAConfigManager;
    private readonly stateManager: CODAStateManager;
    private readonly responseGenerator: CODAResponseGenerator;
    private readonly emotionalProcessor: CODAEmotionalProcessor;

    /**
     * Constructeur du système CODA enrichi
     * @param config Configuration du système
     */
    constructor(config: CODASystemConfig = {}) {
        this.configManager = new CODAConfigManager(config);
        this.stateManager = new CODAStateManager();
        this.responseGenerator = new CODAResponseGenerator();
        this.emotionalProcessor = new CODAEmotionalProcessor();
        
        this.exerciseService = createExerciseService();
        // this.personalitySystem = new AIPersonalitySystem(); // TODO: Réactiver après correction des exports
        this.memorySystem = new AIMemorySystem();

        this.logger.info('EnhancedCODASystem initialized', {
            personality: this.configManager.getPersonalityConfig(),
            learningConfig: this.configManager.getLearningConfig()
        });
    }

    /**
     * Initialise le système CODA
     */
    public async initialize(): Promise<void> {
        try {
            this.logger.info('Initializing Enhanced CODA System');

            await this.exerciseService.initialize();
            // await this.initializePersonality(); // TODO: Réactiver après correction
            await this.emotionalProcessor.initialize();

            this.logger.info('Enhanced CODA System initialized successfully', {
                currentLevel: this.stateManager.getCurrentState().currentLevel,
                personalityTraits: this.configManager.getPersonalityConfig(),
                ready: true
            });
        } catch (error) {
            this.logger.error('Failed to initialize Enhanced CODA System', { error });
            throw new Error('CODA system initialization failed');
        }
    }

    /**
     * Démarre une nouvelle session d'apprentissage
     */
    public async startLearningSession(
        targetLevel?: CECRLLevel,
        focusAreas?: readonly string[]
    ): Promise<CODALearningSession> {
        const session = this.stateManager.startNewSession(targetLevel, focusAreas);

        this.logger.info('CODA learning session started', {
            sessionId: session.sessionId,
            targetLevel,
            focusAreas
        });

        return session;
    }

    /**
     * Présente un exercice à l'IA CODA et obtient sa réponse
     */
    public async presentExercise(exercise: Exercise): Promise<CODAResponse> {
        const activeSession = this.stateManager.getActiveSession();
        if (!activeSession) {
            throw new Error('No active learning session. Start a session first.');
        }

        const validation = this.validator.validateExercise(exercise);
        if (!validation.isValid) {
            throw new Error(`Invalid exercise: ${validation.errors.join(', ')}`);
        }

        const currentState = this.stateManager.getCurrentState();
        const config = this.configManager.getFullConfig();
        const response = await this.responseGenerator.generateResponse(exercise, config, currentState);

        this.updateLearningStateAfterResponse(response);

        this.logger.debug('CODA response generated', {
            exerciseId: exercise.id,
            confidence: response.confidence,
            emotionalReaction: response.emotionalReaction.type
        });

        return response;
    }

    /**
     * Fournit un feedback à l'IA CODA sur sa performance
     */
    public async provideFeedback(
        response: CODAResponse,
        feedback: TrainerFeedback
    ): Promise<CODALearningState> {
        const activeSession = this.stateManager.getActiveSession();
        if (!activeSession) {
            throw new Error('No active learning session');
        }

        this.logger.debug('Providing feedback to CODA', {
            responseId: response.metadata.responseId,
            score: feedback.evaluation.score,
            correct: feedback.evaluation.correct
        });

        await this.emotionalProcessor.processFeedback(feedback);
        await this.updateMemoryWithFeedback(response, feedback);
        this.adjustLearningStateWithFeedback(feedback);

        const newState = this.stateManager.getCurrentState();
        this.logger.info('CODA feedback processed', {
            newConfidence: newState.emotionalState.confidence,
            newMotivation: newState.emotionalState.motivation
        });

        return newState;
    }

    /**
     * Termine la session d'apprentissage en cours
     */
    public async endLearningSession(): Promise<CODALearningSession> {
        const completedSession = this.stateManager.endSession();

        this.logger.info('CODA learning session ended', {
            sessionId: completedSession.sessionId,
            totalExercises: completedSession.sessionSummary.totalExercises,
            averageScore: completedSession.sessionSummary.averageScore
        });

        // Stocker la session en mémoire avec une méthode compatible
        await this.storeInMemory('session', completedSession);
        return completedSession;
    }

    /**
     * Obtient l'état actuel de l'apprentissage CODA
     */
    public getCurrentState(): CODALearningState {
        return this.stateManager.getCurrentState();
    }

    /**
     * Demande à l'IA CODA de poser une question sur le contenu LSF
     */
    public async askQuestion(context?: string): Promise<{
        readonly question: string;
        readonly category: 'clarification' | 'cultural' | 'technical' | 'practice';
        readonly urgency: 'low' | 'medium' | 'high';
        readonly emotionalContext: CODAResponse['emotionalReaction'];
    }> {
        const questionCategory = this.determineQuestionCategory(context);
        const currentState = this.stateManager.getCurrentState();
        const urgency = this.emotionalProcessor.calculateQuestionUrgency(currentState);
        const question = await this.generateContextualQuestion(questionCategory);
        const emotionalContext = this.emotionalProcessor.getQuestionEmotionalContext(questionCategory);

        this.logger.debug('CODA question generated', {
            category: questionCategory,
            urgency,
            emotionalType: emotionalContext.type
        });

        return {
            question,
            category: questionCategory,
            urgency,
            emotionalContext
        };
    }

    /**
     * Obtient des recommandations pour l'étape suivante
     */
    public getNextStepRecommendations(): {
        readonly immediateActions: readonly string[];
        readonly mediumTermGoals: readonly string[];
        readonly longTermObjectives: readonly string[];
        readonly focusAreas: readonly string[];
        readonly suggestedExerciseTypes: readonly SupportedExerciseType[];
    } {
        const currentState = this.stateManager.getCurrentState();
        return {
            immediateActions: this.generateImmediateActions(currentState),
            mediumTermGoals: this.generateMediumTermGoals(),
            longTermObjectives: this.generateLongTermObjectives(),
            focusAreas: [...currentState.weakAreas],
            suggestedExerciseTypes: this.suggestExerciseTypes(currentState)
        };
    }

    // === MÉTHODES PRIVÉES ===

    private async storeInMemory(type: 'session' | 'interaction', data: unknown): Promise<void> {
        // Méthode temporaire pour stocker les données en mémoire
        // En attendant l'adaptation de AIMemorySystem
        this.logger.debug(`Storing ${type} in memory`, { dataType: typeof data });
        
        // Simulation du stockage pour compatibilité
        // TODO: Implémenter le vrai stockage quand AIMemorySystem sera adapté
        await Promise.resolve();
    }

    // Méthode temporairement désactivée
    // private async initializePersonality(): Promise<void> {
    //     // TODO: Réimplémenter après correction des exports
    //     const personalityConfig = this.configManager.getPersonalityConfig();
    //     this.logger.debug('Personality initialization skipped temporarily', { personalityConfig });
    //     /*
    //     await this.personalitySystem.initializeProfile({
    //         enthusiasm: personalityConfig.enthusiasmLevel,
    //         patience: personalityConfig.patienceLevel,
    //         creativity: personalityConfig.creativityLevel,
    //         background: personalityConfig.culturalBackground
    //     });
    //     */
    // }

    private updateLearningStateAfterResponse(response: CODAResponse): void {
        const currentState = this.stateManager.getCurrentState();
        const newEmotionalState = this.emotionalProcessor.calculateEmotionalUpdate(response, currentState);
        
        this.stateManager.updateEmotionalState(newEmotionalState);
        this.stateManager.incrementExerciseCount();
    }

    private adjustLearningStateWithFeedback(feedback: TrainerFeedback): void {
        this.stateManager.updatePerformance(feedback.evaluation.score);
        
        const { strongAreas, weakAreas } = this.emotionalProcessor.analyzePerformanceAreas(feedback);
        this.stateManager.updateAreas(strongAreas, weakAreas);
    }

    private async updateMemoryWithFeedback(response: CODAResponse, feedback: TrainerFeedback): Promise<void> {
        const currentState = this.stateManager.getCurrentState();
        // Stocker l'interaction en mémoire avec une méthode compatible
        await this.storeInMemory('interaction', {
            response,
            feedback,
            timestamp: new Date(),
            context: currentState.learningContext
        });
    }

    private determineQuestionCategory(context?: string): 'clarification' | 'cultural' | 'technical' | 'practice' {
        if (!context) return 'clarification';

        if (context.includes('culture') || context.includes('communauté')) return 'cultural';
        if (context.includes('technique') || context.includes('grammaire')) return 'technical';
        if (context.includes('pratique') || context.includes('exercice')) return 'practice';

        return 'clarification';
    }

    private async generateContextualQuestion(
        category: 'clarification' | 'cultural' | 'technical' | 'practice'
    ): Promise<string> {
        const questionBank = {
            clarification: [
                "Pouvez-vous répéter ce signe plus lentement ?",
                "Je ne suis pas sûr(e) de la configuration de la main, pouvez-vous m'aider ?",
                "Quelle est la différence entre ce signe et [signe similaire] ?"
            ],
            cultural: [
                "Ce signe a-t-il une histoire particulière dans la communauté sourde ?",
                "Y a-t-il des variations régionales pour ce concept ?",
                "Comment les personnes sourdes utilisent-elles ce signe au quotidien ?"
            ],
            technical: [
                "Quelle est la règle grammaticale pour ce type de construction ?",
                "Comment modifier l'intensité de ce signe ?",
                "Dans quel ordre placer les signes dans cette phrase ?"
            ],
            practice: [
                "Pouvons-nous faire plus d'exercices sur ce thème ?",
                "Comment puis-je m'améliorer dans ce domaine ?",
                "Y a-t-il des exercices à faire chez moi ?"
            ]
        };

        const questions = questionBank[category];
        const randomIndex = Math.floor(Math.random() * questions.length);
        return questions[randomIndex] ?? questions[0]!;
    }

    private generateImmediateActions(state: CODALearningState): readonly string[] {
        const actions: string[] = [];

        if (state.emotionalState.frustration > 0.6) {
            actions.push('Faire une pause de 5 minutes');
        }

        if (state.weakAreas.length > 0) {
            actions.push(`Réviser: ${state.weakAreas[0]}`);
        }

        if (state.emotionalState.confidence < 0.5) {
            actions.push('Reprendre des exercices plus simples');
        }

        return actions;
    }

    private generateMediumTermGoals(): readonly string[] {
        return [
            'Maîtriser le niveau CECRL actuel',
            'Améliorer la fluidité des signes',
            'Développer la compréhension culturelle'
        ];
    }

    private generateLongTermObjectives(): readonly string[] {
        return [
            'Atteindre une communication naturelle en LSF',
            'Comprendre les nuances culturelles sourdes',
            'Pouvoir enseigner la LSF à d\'autres'
        ];
    }

    private suggestExerciseTypes(state: CODALearningState): readonly SupportedExerciseType[] {
        const suggestions: SupportedExerciseType[] = [];
        const levelIndex = this.getLevelIndex(state.currentLevel);

        if (levelIndex <= 1) {
            suggestions.push('MultipleChoice', 'DragDrop');
        } else if (levelIndex <= 3) {
            suggestions.push('FillBlank', 'TextEntry', 'SigningPractice');
        } else {
            suggestions.push('SigningPractice', 'VideoResponse');
        }

        return suggestions;
    }

    private getLevelIndex(level: CECRLLevel): number {
        const levels: CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        return levels.indexOf(level);
    }
}