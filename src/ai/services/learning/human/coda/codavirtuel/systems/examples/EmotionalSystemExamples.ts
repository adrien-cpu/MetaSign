/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/examples/EmotionalSystemExamples.ts
 * @description Exemples pratiques du système émotionnel CODA
 * 
 * Module refactorisé selon le Guide de refactorisation MetaSign.
 * Respecte les seuils de complexité et le principe de responsabilité unique.
 * 
 * @module EmotionalSystemExamples
 * @version 3.1.0 - Refactorisation conforme au guide MetaSign
 * @since 2025
 * @author MetaSign Team - Examples & Integration Division
 */

import { createEmotionalSystem } from '../index';
import type {
    EmotionGenerationParams,
    EmotionalState,
    PrimaryEmotion
} from '../types/EmotionalTypes';

// ================== INTERFACES ET TYPES ==================

/**
 * Configuration d'un étudiant virtuel
 */
interface StudentConfig {
    readonly id: string;
    readonly name: string;
    readonly level: 'beginner' | 'intermediate' | 'advanced';
    readonly anxietyLevel: number;
    readonly motivation: number;
}

/**
 * Résultat d'un exercice
 */
interface ExerciseResult {
    readonly studentId: string;
    readonly exerciseName: string;
    readonly outcome: 'success' | 'partial' | 'failure';
    readonly emotionalState: EmotionalState;
    readonly adaptationNeeded: boolean;
}

/**
 * Métadonnées d'exercice
 */
interface ExerciseMetadata {
    readonly name: string;
    readonly difficulty: 'easy' | 'medium' | 'hard';
    readonly type: 'recognition' | 'production' | 'conversation';
    readonly icon: string;
}

// ================== CLASSE PRINCIPALE ==================

/**
 * Exemples d'intégration du système émotionnel
 * 
 * Responsabilité unique: Démonstration des cas d'usage principaux
 * Respecte les seuils: < 300 lignes, < 20 méthodes
 * 
 * @class EmotionalSystemExamples
 */
export class EmotionalSystemExamples {
    private readonly emotionalSystem;

    constructor() {
        this.emotionalSystem = createEmotionalSystem();
    }

    /**
     * Exécute l'exemple principal d'un cours LSF
     * @public
     */
    public async demonstrateLSFCourse(): Promise<void> {
        console.log('Cours LSF avec Système Émotionnel');
        console.log('==================================\n');

        const students = this.createStudentConfigs();
        const exercises = this.createExerciseDefinitions();

        for (const exercise of exercises) {
            console.log(`${exercise.icon} ${exercise.name} (${exercise.difficulty})`);

            for (const student of students) {
                const result = await this.executeExerciseForStudent(student, exercise);
                this.displayExerciseResult(result);
            }
            console.log('');
        }

        await this.displayFinalAnalysis(students);
    }

    /**
     * Démontre l'adaptation en temps réel
     * @public
     */
    public async demonstrateRealTimeAdaptation(): Promise<void> {
        console.log('Adaptation en Temps Réel');
        console.log('========================\n');

        const studentId = 'adaptive_student';

        // Créer un état initial de frustration
        await this.createFrustratedStudent(studentId);

        // Série d'exercices adaptatifs
        const adaptiveExercises = this.createAdaptiveExercises();

        for (const exercise of adaptiveExercises) {
            const result = await this.executeAdaptiveExercise(studentId, exercise);
            this.displayAdaptationResult(result);
        }
    }

    /**
     * Démontre l'analyse de groupe
     * @public
     */
    public async demonstrateGroupAnalysis(): Promise<void> {
        console.log('Analyse de Groupe');
        console.log('================\n');

        const groupStudents = this.createGroupStudents();

        // Simuler une activité collaborative
        await this.simulateCollaborativeActivity(groupStudents);

        // Analyser les résultats de groupe
        this.analyzeGroupResults(groupStudents);
    }

    // ================== MÉTHODES PRIVÉES ==================

    private createStudentConfigs(): StudentConfig[] {
        return [
            {
                id: 'marie_debutante',
                name: 'Marie',
                level: 'beginner',
                anxietyLevel: 0.7,
                motivation: 0.8
            },
            {
                id: 'alex_intermediaire',
                name: 'Alex',
                level: 'intermediate',
                anxietyLevel: 0.4,
                motivation: 0.6
            },
            {
                id: 'jordan_avance',
                name: 'Jordan',
                level: 'advanced',
                anxietyLevel: 0.3,
                motivation: 0.9
            }
        ];
    }

    private createExerciseDefinitions(): ExerciseMetadata[] {
        return [
            {
                name: 'Reconnaissance des signes',
                difficulty: 'easy',
                type: 'recognition',
                icon: '👀'
            },
            {
                name: 'Production de salutations',
                difficulty: 'medium',
                type: 'production',
                icon: '🤝'
            },
            {
                name: 'Conversation contextuelle',
                difficulty: 'hard',
                type: 'conversation',
                icon: '💬'
            }
        ];
    }

    private async executeExerciseForStudent(
        student: StudentConfig,
        exercise: ExerciseMetadata
    ): Promise<ExerciseResult> {
        const outcome = this.determineOutcome(student, exercise);
        const stimulusIntensity = this.calculateStimulusIntensity(student, exercise);

        const params: EmotionGenerationParams = {
            learningContext: `lsf_course_${exercise.type}`,
            stimulus: `${exercise.name}_${outcome}`,
            stimulusIntensity,
            learningOutcome: outcome,
            contextualFactors: [exercise.difficulty, student.level, 'group_learning']
        };

        const emotionalState = await this.emotionalSystem.generateEmotionalState(
            student.id,
            params
        );

        return {
            studentId: student.id,
            exerciseName: exercise.name,
            outcome,
            emotionalState,
            adaptationNeeded: this.needsAdaptation(emotionalState, student)
        };
    }

    private determineOutcome(
        student: StudentConfig,
        exercise: ExerciseMetadata
    ): 'success' | 'partial' | 'failure' {
        const difficultyScore = { easy: 1, medium: 2, hard: 3 }[exercise.difficulty];
        const studentScore = { beginner: 1, intermediate: 2, advanced: 3 }[student.level];

        const stressImpact = student.anxietyLevel > 0.6 ? 0.5 : 0;
        const motivationBoost = student.motivation > 0.7 ? 0.3 : 0;

        const successProbability = (studentScore - difficultyScore + motivationBoost - stressImpact + 1) / 3;

        const random = Math.random();
        if (random < successProbability) return 'success';
        if (random < successProbability + 0.3) return 'partial';
        return 'failure';
    }

    private calculateStimulusIntensity(
        student: StudentConfig,
        exercise: ExerciseMetadata
    ): number {
        const baseIntensity = { easy: 0.4, medium: 0.6, hard: 0.8 }[exercise.difficulty];
        const anxietyMultiplier = 1 + student.anxietyLevel * 0.5;

        return Math.min(0.9, baseIntensity * anxietyMultiplier);
    }

    private needsAdaptation(state: EmotionalState, student: StudentConfig): boolean {
        return state.valence < -0.3 || (student.anxietyLevel > 0.6 && state.intensity > 0.7);
    }

    private displayExerciseResult(result: ExerciseResult): void {
        const name = result.studentId.split('_')[0];
        const outcomeIcon = this.getOutcomeIcon(result.outcome);
        const emotionIcon = this.getEmotionIcon(result.emotionalState.primaryEmotion);
        const adaptationIcon = result.adaptationNeeded ? '⚠️' : '';

        console.log(
            `   ${name.padEnd(6)} ${outcomeIcon} ${emotionIcon} ` +
            `${result.emotionalState.primaryEmotion} (${result.emotionalState.intensity.toFixed(2)}) ${adaptationIcon}`
        );
    }

    private getOutcomeIcon(outcome: string): string {
        const icons = { success: '✅', partial: '🟡', failure: '❌' };
        return icons[outcome as keyof typeof icons] || '❓';
    }

    private getEmotionIcon(emotion: PrimaryEmotion): string {
        const icons = {
            joy: '😊', sadness: '😢', anger: '😠', fear: '😰',
            surprise: '😲', disgust: '😖', trust: '😌', anticipation: '🤔'
        };
        return icons[emotion] || '😐';
    }

    private async displayFinalAnalysis(students: StudentConfig[]): Promise<void> {
        console.log('Analyse Finale');
        console.log('==============\n');

        for (const student of students) {
            const analysis = await this.emotionalSystem.performCompleteAnalysis(student.id);

            console.log(`${student.name}:`);
            console.log(`   État final: ${analysis.currentState.primaryEmotion}`);
            console.log(`   Confiance: ${(analysis.confidence * 100).toFixed(0)}%`);
            console.log(`   Recommandations: ${analysis.recommendations.length}`);
            console.log('');
        }
    }

    private async createFrustratedStudent(studentId: string): Promise<void> {
        const frustrationParams: EmotionGenerationParams = {
            learningContext: 'difficult_exercise',
            stimulus: 'repeated_failure',
            stimulusIntensity: 0.9,
            learningOutcome: 'failure',
            contextualFactors: ['time_pressure', 'complex_material']
        };

        await this.emotionalSystem.generateEmotionalState(studentId, frustrationParams);
        console.log('État initial: Frustration élevée\n');
    }

    private createAdaptiveExercises() {
        return [
            { name: 'Exercice de récupération', difficulty: 'very_easy' },
            { name: 'Exercice motivant', difficulty: 'easy' },
            { name: 'Retour progressif', difficulty: 'medium' }
        ];
    }

    private async executeAdaptiveExercise(
        studentId: string,
        exercise: { name: string; difficulty: string }
    ): Promise<ExerciseResult> {
        const params: EmotionGenerationParams = {
            learningContext: 'adaptive_exercise',
            stimulus: exercise.name.toLowerCase().replace(/\s+/g, '_'),
            stimulusIntensity: 0.4, // Intensité réduite pour adaptation
            learningOutcome: 'success', // Exercices conçus pour réussir
            contextualFactors: [exercise.difficulty, 'adaptive_response']
        };

        const emotionalState = await this.emotionalSystem.generateEmotionalState(
            studentId,
            params
        );

        return {
            studentId,
            exerciseName: exercise.name,
            outcome: 'success',
            emotionalState,
            adaptationNeeded: false
        };
    }

    private displayAdaptationResult(result: ExerciseResult): void {
        const emotionIcon = this.getEmotionIcon(result.emotionalState.primaryEmotion);
        console.log(
            `${result.exerciseName}: ${emotionIcon} ` +
            `${result.emotionalState.primaryEmotion} (${result.emotionalState.valence.toFixed(2)})`
        );
    }

    private createGroupStudents(): string[] {
        return ['leader', 'follower', 'creative', 'analytical'];
    }

    private async simulateCollaborativeActivity(students: string[]): Promise<void> {
        console.log('Activité collaborative: Création d\'histoire LSF\n');

        for (const studentId of students) {
            const params: EmotionGenerationParams = {
                learningContext: 'collaborative_activity',
                stimulus: `${studentId}_contribution`,
                stimulusIntensity: 0.6,
                learningOutcome: 'success',
                contextualFactors: ['group_work', studentId]
            };

            const state = await this.emotionalSystem.generateEmotionalState(studentId, params);
            const emotionIcon = this.getEmotionIcon(state.primaryEmotion);

            console.log(`${studentId.padEnd(10)}: ${emotionIcon} ${state.primaryEmotion}`);
        }
        console.log('');
    }

    private analyzeGroupResults(students: string[]): void {
        console.log('Analyse de groupe:');
        console.log(`Participants: ${students.length}`);
        console.log('Cohésion: Bonne');
        console.log('Recommandation: Maintenir les activités collaboratives');
    }
}

// ================== UTILITAIRES D'EXEMPLES ==================

/**
 * Utilitaires pour l'exécution des exemples
 * @class ExampleUtils
 */
export class ExampleUtils {
    /**
     * Exécute un exemple spécifique
     * @static
     */
    public static async runExample(exampleName: string): Promise<void> {
        const examples = new EmotionalSystemExamples();

        switch (exampleName.toLowerCase()) {
            case 'course':
                await examples.demonstrateLSFCourse();
                break;
            case 'adaptation':
                await examples.demonstrateRealTimeAdaptation();
                break;
            case 'group':
                await examples.demonstrateGroupAnalysis();
                break;
            default:
                console.log('Exemples disponibles: course, adaptation, group');
        }
    }

    /**
     * Exécute tous les exemples
     * @static
     */
    public static async runAllExamples(): Promise<void> {
        console.log('EXEMPLES SYSTÈME ÉMOTIONNEL METASIGN');
        console.log('====================================\n');

        const examples = new EmotionalSystemExamples();

        try {
            await examples.demonstrateLSFCourse();
            console.log('\n' + '='.repeat(50) + '\n');

            await examples.demonstrateRealTimeAdaptation();
            console.log('\n' + '='.repeat(50) + '\n');

            await examples.demonstrateGroupAnalysis();

            console.log('\nTous les exemples terminés avec succès!');
        } catch (error) {
            console.error('Erreur lors de l\'exécution:', error);
        }
    }
}

// ================== EXPORTS ==================

export const EXAMPLES = {
    EmotionalSystemExamples,
    ExampleUtils
} as const;