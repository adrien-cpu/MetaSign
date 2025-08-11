/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/examples/EmotionalSystemExamples.ts
 * @description Exemples pratiques et cas d'usage du système émotionnel révolutionnaire
 * 
 * Contient des exemples complets pour :
 * - 🎓 Intégration dans un cours LSF
 * - 🤖 Création d'IA-élèves personnalisées
 * - 📊 Analyse de progression émotionnelle
 * - 🎮 Intégration avec systèmes de gamification
 * - 🏥 Applications thérapeutiques
 * - 🔬 Études de recherche
 * 
 * @module EmotionalSystemExamples
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Examples & Integration Division
 */

import {
    AIEmotionalSystem,
    createEmotionalSystem,
    EmotionalConfigFactory,
    PRESET_CONFIGS
} from '../index';

import { AIPersonalitySystem } from '../AIPersonalitySystem';

import type {
    EmotionGenerationParams,
    CompleteEmotionalAnalysis,
    EmotionalState,
    PrimaryEmotion
} from '../types/EmotionalTypes';

import type {
    AIPersonalityProfile,
    InteractionData,
    LearningStyle,
    MotivationFactor
} from '../AIPersonalitySystem';

/**
 * Exemple 1 : Intégration complète dans un cours LSF
 * 
 * @class LSFCourseIntegrationExample
 * @description Montre comment intégrer le système émotionnel dans
 * un cours complet de LSF avec suivi personnalisé.
 */
export class LSFCourseIntegrationExample {
    private readonly emotionalSystem: AIEmotionalSystem;
    private readonly personalitySystem: AIPersonalitySystem;

    constructor() {
        // Configuration adaptée pour cours LSF standard
        const config = EmotionalConfigFactory.createForContext('intermediate_adaptive');
        this.emotionalSystem = createEmotionalSystem(config.systemConfig);
        this.personalitySystem = new AIPersonalitySystem();
    }

    /**
     * Démonstration complète d'un cours LSF
     */
    public async demonstrateCompleteLSFCourse(): Promise<void> {
        console.log('🎓 === EXEMPLE : Cours LSF Complet avec Système Émotionnel ===\n');

        // 1. Création de plusieurs IA-élèves avec profils différents
        const students = await this.createDiverseStudentProfiles();

        // 2. Simulation d'une leçon avec exercices variés
        await this.simulateCompleteLesson(students);

        // 3. Analyse des résultats et recommandations
        await this.analyzeAndProvideRecommendations(students);
    }

    /**
     * Crée des profils d'étudiants diversifiés
     */
    private async createDiverseStudentProfiles(): Promise<string[]> {
        const students = [
            'marie_debutante',
            'alex_intermediaire',
            'jordan_avance',
            'sam_tdah',
            'taylor_autiste'
        ];

        // Marie - Débutante anxieuse
        const marieProfile = this.personalitySystem.createInitialProfile('marie_debutante', {
            bigFiveTraits: {
                openness: 0.6,
                conscientiousness: 0.8,
                extraversion: 0.3,     // Introvertie
                agreeableness: 0.9,
                neuroticism: 0.7       // Anxieuse
            },
            learningStyle: 'visual',
            motivationFactors: ['achievement', 'helping_others'],
            stressThreshold: 0.4,      // Seuil bas
            culturalBackground: 'hearing_family',
            preferredFeedbackStyle: 'positive_reinforcement'
        });

        // Alex - Intermédiaire équilibré
        const alexProfile = this.personalitySystem.createInitialProfile('alex_intermediaire', {
            bigFiveTraits: {
                openness: 0.7,
                conscientiousness: 0.6,
                extraversion: 0.7,     // Extraverti
                agreeableness: 0.6,
                neuroticism: 0.4       // Stable
            },
            learningStyle: 'kinesthetic',
            motivationFactors: ['mastery', 'social_interaction'],
            stressThreshold: 0.7,
            culturalBackground: 'mixed_background',
            preferredFeedbackStyle: 'constructive_criticism'
        });

        // Jordan - Avancé perfectionniste
        const jordanProfile = this.personalitySystem.createInitialProfile('jordan_avance', {
            bigFiveTraits: {
                openness: 0.9,
                conscientiousness: 0.9,  // Très consciencieux
                extraversion: 0.5,
                agreeableness: 0.5,
                neuroticism: 0.3         // Très stable
            },
            learningStyle: 'analytical',
            motivationFactors: ['mastery', 'challenge', 'recognition'],
            stressThreshold: 0.8,
            culturalBackground: 'deaf_community',
            preferredFeedbackStyle: 'detailed_analysis'
        });

        // Enregistrer les profils
        this.emotionalSystem.registerPersonalityProfile('marie_debutante', marieProfile);
        this.emotionalSystem.registerPersonalityProfile('alex_intermediaire', alexProfile);
        this.emotionalSystem.registerPersonalityProfile('jordan_avance', jordanProfile);

        console.log('👥 Profils d\'étudiants créés :');
        console.log('- Marie : Débutante anxieuse (famille entendante)');
        console.log('- Alex : Intermédiaire équilibré (contexte mixte)');
        console.log('- Jordan : Avancé perfectionniste (communauté sourde)');
        console.log('');

        return students.slice(0, 3); // Pour cet exemple, on utilise 3 étudiants
    }

    /**
     * Simule une leçon complète avec exercices variés
     */
    private async simulateCompleteLesson(students: string[]): Promise<void> {
        console.log('📚 === SIMULATION LEÇON : "Les Salutations en LSF" ===\n');

        const exercises = [
            {
                name: 'Reconnaissance des signes de base',
                difficulty: 'easy',
                type: 'recognition'
            },
            {
                name: 'Production de salutations formelles',
                difficulty: 'medium',
                type: 'production'
            },
            {
                name: 'Conversation contextuelle',
                difficulty: 'hard',
                type: 'conversation'
            }
        ];

        for (const exercise of exercises) {
            console.log(`\n🎯 Exercice : ${exercise.name}`);
            console.log(`   Difficulté : ${exercise.difficulty}`);
            console.log('');

            for (const studentId of students) {
                await this.simulateExerciseForStudent(studentId, exercise);
            }
        }
    }

    /**
     * Simule un exercice pour un étudiant spécifique
     */
    private async simulateExerciseForStudent(
        studentId: string,
        exercise: { name: string; difficulty: string; type: string }
    ): Promise<void> {
        // Simuler différents résultats selon le profil
        const profile = this.emotionalSystem.getCurrentEmotionalState(studentId);
        let outcome: 'success' | 'partial' | 'failure';
        let stimulusIntensity: number;

        // Adapter les résultats selon le niveau et la personnalité
        if (studentId === 'marie_debutante') {
            outcome = exercise.difficulty === 'easy' ? 'success' :
                exercise.difficulty === 'medium' ? 'partial' : 'failure';
            stimulusIntensity = exercise.difficulty === 'hard' ? 0.9 : 0.6;
        } else if (studentId === 'alex_intermediaire') {
            outcome = exercise.difficulty === 'hard' ? 'partial' : 'success';
            stimulusIntensity = 0.7;
        } else { // jordan_avance
            outcome = 'success';
            stimulusIntensity = exercise.difficulty === 'easy' ? 0.4 : 0.8;
        }

        const params: EmotionGenerationParams = {
            learningContext: `lsf_greetings_${exercise.type}`,
            stimulus: `${exercise.name.toLowerCase().replace(/\s+/g, '_')}_${outcome}`,
            stimulusIntensity,
            learningOutcome: outcome,
            contextualFactors: [exercise.difficulty, exercise.type, 'group_learning']
        };

        const emotionalState = await this.emotionalSystem.generateEmotionalState(studentId, params);

        // Afficher le résultat
        const studentName = studentId.split('_')[0];
        const emotionEmoji = this.getEmotionEmoji(emotionalState.primaryEmotion);
        const outcomeEmoji = outcome === 'success' ? '✅' : outcome === 'partial' ? '🟡' : '❌';

        console.log(`   ${studentName.padEnd(10)} ${outcomeEmoji} ${emotionEmoji} ${emotionalState.primaryEmotion} (${emotionalState.intensity.toFixed(2)})`);
    }

    /**
     * Analyse les résultats et fournit des recommandations
     */
    private async analyzeAndProvideRecommendations(students: string[]): Promise<void> {
        console.log('\n📊 === ANALYSE DES RÉSULTATS ET RECOMMANDATIONS ===\n');

        for (const studentId of students) {
            const analysis = await this.emotionalSystem.performCompleteAnalysis(studentId);
            const studentName = studentId.split('_')[0];

            console.log(`👤 Analyse pour ${studentName} :`);
            console.log(`   État actuel : ${analysis.currentState.primaryEmotion} (intensité: ${analysis.currentState.intensity.toFixed(2)})`);
            console.log(`   Patterns détectés : ${analysis.patterns.length}`);
            console.log(`   Confiance analyse : ${(analysis.confidence * 100).toFixed(0)}%`);

            console.log('   Recommandations :');
            analysis.recommendations.forEach((rec, index) => {
                console.log(`   ${index + 1}. ${rec}`);
            });

            // Afficher les patterns détectés
            if (analysis.patterns.length > 0) {
                console.log('   Patterns émotionnels :');
                analysis.patterns.forEach(pattern => {
                    console.log(`   - ${pattern.type} : ${pattern.sequence.join(' → ')} (${pattern.frequency}x)`);
                });
            }

            console.log('');
        }

        // Statistiques globales
        const stats = this.emotionalSystem.getSystemStatistics();
        console.log('📈 Statistiques de la session :');
        console.log(`   Étudiants actifs : ${stats.totalActiveStudents}`);
        console.log(`   Distribution émotionnelle :`, stats.currentEmotionDistribution);
    }

    /**
     * Obtient un emoji pour une émotion
     */
    private getEmotionEmoji(emotion: PrimaryEmotion): string {
        const emojiMap: Record<PrimaryEmotion, string> = {
            'joy': '😊',
            'sadness': '😢',
            'anger': '😠',
            'fear': '😰',
            'surprise': '😲',
            'disgust': '😖',
            'trust': '😌',
            'anticipation': '🤔'
        };
        return emojiMap[emotion] || '😐';
    }
}

/**
 * Exemple 2 : Système d'adaptation en temps réel
 * 
 * @class RealTimeAdaptationExample
 * @description Montre comment adapter l'enseignement en temps réel
 * basé sur l'état émotionnel de l'IA-élève.
 */
export class RealTimeAdaptationExample {
    private readonly emotionalSystem: AIEmotionalSystem;

    constructor() {
        // Configuration pour adaptation rapide
        const config = EmotionalConfigFactory.createForContext('intensive_bootcamp');
        this.emotionalSystem = createEmotionalSystem(config.systemConfig);
    }

    /**
     * Démontre l'adaptation en temps réel
     */
    public async demonstrateRealTimeAdaptation(): Promise<void> {
        console.log('\n⚡ === EXEMPLE : Adaptation en Temps Réel ===\n');

        const studentId = 'realtime_student';

        // Créer un étudiant avec tendance à la frustration
        await this.createFrustrationProneStudent(studentId);

        // Simuler une série d'exercices avec adaptation
        await this.simulateAdaptiveExerciseSeries(studentId);
    }

    /**
     * Crée un étudiant enclin à la frustration
     */
    private async createFrustrationProneStudent(studentId: string): Promise<void> {
        // Premier exercice difficile qui génère de la frustration
        const frustrationParams: EmotionGenerationParams = {
            learningContext: 'complex_grammar_exercise',
            stimulus: 'repeated_failure_difficult_concept',
            stimulusIntensity: 0.9,
            learningOutcome: 'failure',
            contextualFactors: ['time_pressure', 'complex_material', 'third_attempt']
        };

        const initialState = await this.emotionalSystem.generateEmotionalState(studentId, frustrationParams);
        console.log(`😤 État initial : ${initialState.primaryEmotion} (${initialState.intensity.toFixed(2)})`);
        console.log(`   Valence : ${initialState.valence.toFixed(2)} (négative)\n`);
    }

    /**
     * Simule une série d'exercices avec adaptation
     */
    private async simulateAdaptiveExerciseSeries(studentId: string): Promise<void> {
        const exerciseSeries = [
            {
                name: 'Exercice de récupération simple',
                difficulty: 'very_easy',
                adaptation: 'recovery_mode'
            },
            {
                name: 'Exercice motivant',
                difficulty: 'easy',
                adaptation: 'confidence_building'
            },
            {
                name: 'Retour progressif',
                difficulty: 'medium',
                adaptation: 'gradual_increase'
            },
            {
                name: 'Consolidation',
                difficulty: 'medium',
                adaptation: 'stabilization'
            }
        ];

        for (let i = 0; i < exerciseSeries.length; i++) {
            const exercise = exerciseSeries[i];

            console.log(`🎯 ${exercise.name} (${exercise.adaptation})`);

            // Adapter les paramètres selon l'état émotionnel actuel
            const currentState = this.emotionalSystem.getCurrentEmotionalState(studentId);
            const adaptedParams = this.adaptExerciseParams(exercise, currentState!);

            const newState = await this.emotionalSystem.generateEmotionalState(studentId, adaptedParams);

            console.log(`   État résultant : ${newState.primaryEmotion} (${newState.intensity.toFixed(2)})`);
            console.log(`   Valence : ${newState.valence.toFixed(2)}`);
            console.log(`   Adaptation efficace : ${this.evaluateAdaptationSuccess(currentState!, newState)}\n`);
        }

        // Analyse finale
        const finalAnalysis = await this.emotionalSystem.performCompleteAnalysis(studentId);
        console.log('📊 Analyse finale :');
        console.log(`   Patterns détectés : ${finalAnalysis.patterns.map(p => p.type).join(', ')}`);
        console.log(`   Recommandations : ${finalAnalysis.recommendations[0]}`);
    }

    /**
     * Adapte les paramètres d'exercice selon l'état émotionnel
     */
    private adaptExerciseParams(
        exercise: { name: string; difficulty: string; adaptation: string },
        currentState: EmotionalState
    ): EmotionGenerationParams {
        // Adapter l'intensité du stimulus selon l'état émotionnel
        let stimulusIntensity = 0.5;
        let outcome: 'success' | 'partial' | 'failure' = 'success';

        if (currentState.valence < -0.3) {
            // État négatif - exercice de récupération
            stimulusIntensity = 0.3;
            outcome = 'success';
        } else if (currentState.valence > 0.5) {
            // État positif - peut augmenter la difficulté
            stimulusIntensity = 0.7;
            outcome = Math.random() > 0.2 ? 'success' : 'partial';
        }

        return {
            learningContext: `adaptive_${exercise.adaptation}`,
            stimulus: exercise.name.toLowerCase().replace(/\s+/g, '_'),
            stimulusIntensity,
            learningOutcome: outcome,
            contextualFactors: [exercise.difficulty, exercise.adaptation, 'adaptive_response']
        };
    }

    /**
     * Évalue le succès de l'adaptation
     */
    private evaluateAdaptationSuccess(previousState: EmotionalState, newState: EmotionalState): string {
        const valenceImprovement = newState.valence - previousState.valence;

        if (valenceImprovement > 0.3) return '✅ Excellente';
        if (valenceImprovement > 0.1) return '🟢 Bonne';
        if (valenceImprovement > -0.1) return '🟡 Modérée';
        return '❌ Insuffisante';
    }
}

/**
 * Exemple 3 : Analyse de groupe et dynamiques sociales
 * 
 * @class GroupDynamicsExample
 * @description Montre comment analyser les dynamiques émotionnelles
 * dans un groupe d'IA-élèves.
 */
export class GroupDynamicsExample {
    private readonly emotionalSystem: AIEmotionalSystem;

    constructor() {
        const config = PRESET_CONFIGS.DEFAULT;
        this.emotionalSystem = createEmotionalSystem(config.systemConfig);
    }

    /**
     * Démontre l'analyse de dynamiques de groupe
     */
    public async demonstrateGroupDynamics(): Promise<void> {
        console.log('\n👥 === EXEMPLE : Dynamiques de Groupe ===\n');

        // Créer un groupe d'étudiants
        const groupStudents = await this.createStudentGroup();

        // Simuler une activité collaborative
        await this.simulateCollaborativeActivity(groupStudents);

        // Analyser les dynamiques de groupe
        await this.analyzeGroupDynamics(groupStudents);
    }

    /**
     * Crée un groupe d'étudiants diversifié
     */
    private async createStudentGroup(): Promise<string[]> {
        const students = ['leader', 'follower', 'creative', 'analytical'];

        // Générer des états émotionnels initiaux variés
        for (const studentId of students) {
            const role = studentId;
            const params: EmotionGenerationParams = {
                learningContext: 'group_formation',
                stimulus: `${role}_role_assignment`,
                stimulusIntensity: 0.6,
                learningOutcome: 'success',
                contextualFactors: ['group_work', 'role_based', role]
            };

            await this.emotionalSystem.generateEmotionalState(studentId, params);
        }

        console.log('👥 Groupe d\'étudiants créé avec rôles assignés\n');
        return students;
    }

    /**
     * Simule une activité collaborative
     */
    private async simulateCollaborativeActivity(students: string[]): Promise<void> {
        console.log('🤝 Simulation : Création d\'une histoire en LSF collaborative\n');

        const phases = [
            'Brainstorming initial',
            'Développement d\'idées',
            'Création collaborative',
            'Présentation finale'
        ];

        for (const phase of phases) {
            console.log(`📌 Phase : ${phase}`);

            for (const studentId of students) {
                // Simuler l'interaction selon le rôle
                const interaction = this.simulateRoleBasedInteraction(studentId, phase);
                const state = await this.emotionalSystem.generateEmotionalState(studentId, interaction);

                console.log(`   ${studentId.padEnd(10)} : ${state.primaryEmotion} (${state.intensity.toFixed(2)})`);
            }
            console.log('');
        }
    }

    /**
     * Simule l'interaction basée sur le rôle
     */
    private simulateRoleBasedInteraction(studentId: string, phase: string): EmotionGenerationParams {
        const roleParams: Record<string, { outcome: 'success' | 'partial' | 'failure', intensity: number }> = {
            'leader': { outcome: 'success', intensity: 0.8 },
            'follower': { outcome: 'success', intensity: 0.6 },
            'creative': { outcome: phase.includes('création') ? 'success' : 'partial', intensity: 0.7 },
            'analytical': { outcome: phase.includes('développement') ? 'success' : 'partial', intensity: 0.7 }
        };

        const roleData = roleParams[studentId] || { outcome: 'success' as const, intensity: 0.6 };

        return {
            learningContext: 'collaborative_storytelling',
            stimulus: `${phase.toLowerCase().replace(/\s+/g, '_')}_${studentId}`,
            stimulusIntensity: roleData.intensity,
            learningOutcome: roleData.outcome,
            contextualFactors: ['group_work', 'collaborative', phase.toLowerCase(), studentId]
        };
    }

    /**
     * Analyse les dynamiques de groupe
     */
    private async analyzeGroupDynamics(students: string[]): Promise<void> {
        console.log('📊 === ANALYSE DES DYNAMIQUES DE GROUPE ===\n');

        // Analyser chaque étudiant individuellement
        const analyses: CompleteEmotionalAnalysis[] = [];
        for (const studentId of students) {
            const analysis = await this.emotionalSystem.performCompleteAnalysis(studentId);
            analyses.push(analysis);

            console.log(`👤 ${studentId} :`);
            console.log(`   État final : ${analysis.currentState.primaryEmotion}`);
            console.log(`   Valence moyenne : ${this.calculateAverageValence(analysis.recentHistory).toFixed(2)}`);
            console.log(`   Patterns : ${analysis.patterns.map(p => p.type).join(', ') || 'Aucun'}`);
            console.log('');
        }

        // Analyser la cohésion du groupe
        this.analyzeGroupCohesion(analyses);

        // Recommandations pour le groupe
        this.provideGroupRecommendations(analyses);
    }

    /**
     * Calcule la valence moyenne de l'historique
     */
    private calculateAverageValence(history: readonly EmotionalState[]): number {
        if (history.length === 0) return 0;
        return history.reduce((sum, state) => sum + state.valence, 0) / history.length;
    }

    /**
     * Analyse la cohésion du groupe
     */
    private analyzeGroupCohesion(analyses: readonly CompleteEmotionalAnalysis[]): void {
        console.log('🔗 Cohésion du groupe :');

        // Calculer la variance des valences
        const valences = analyses.map(a => a.currentState.valence);
        const meanValence = valences.reduce((sum, v) => sum + v, 0) / valences.length;
        const variance = valences.reduce((sum, v) => sum + Math.pow(v - meanValence, 2), 0) / valences.length;
        const cohesion = 1 - Math.sqrt(variance); // Cohésion inverse de la variance

        console.log(`   Score de cohésion : ${(cohesion * 100).toFixed(0)}%`);
        console.log(`   Valence moyenne : ${meanValence.toFixed(2)}`);
        console.log(`   ${cohesion > 0.7 ? '✅ Groupe cohésif' : cohesion > 0.4 ? '🟡 Cohésion modérée' : '❌ Groupe dispersé'}\n`);
    }

    /**
     * Fournit des recommandations pour le groupe
     */
    private provideGroupRecommendations(analyses: readonly CompleteEmotionalAnalysis[]): void {
        console.log('💡 Recommandations pour le groupe :');

        const negativeStates = analyses.filter(a => a.currentState.valence < -0.2);
        const positiveStates = analyses.filter(a => a.currentState.valence > 0.5);

        if (negativeStates.length > analyses.length / 2) {
            console.log('   1. Activité de remotivation collective recommandée');
            console.log('   2. Réduire la difficulté des prochains exercices');
        }

        if (positiveStates.length === analyses.length) {
            console.log('   1. Excellent état de groupe - augmenter le défi');
            console.log('   2. Considérer des activités de leadership rotatif');
        }

        console.log('   3. Maintenir les activités collaboratives');
        console.log('   4. Surveiller les dynamiques individuelles dans le groupe\n');
    }
}

/**
 * Exemple 4 : Recherche et analytics avancés
 * 
 * @class ResearchAnalyticsExample
 * @description Montre comment utiliser le système pour la recherche
 * avec analytics détaillées et export de données.
 */
export class ResearchAnalyticsExample {
    private readonly emotionalSystem: AIEmotionalSystem;

    constructor() {
        const config = PRESET_CONFIGS.RESEARCH;
        this.emotionalSystem = createEmotionalSystem(config.systemConfig);
    }

    /**
     * Démontre les capacités de recherche et analytics
     */
    public async demonstrateResearchAnalytics(): Promise<void> {
        console.log('\n🔬 === EXEMPLE : Recherche et Analytics Avancés ===\n');

        const researchSubject = 'research_subject_001';

        // Simuler une étude longitudinale
        await this.simulateLongitudinalStudy(researchSubject);

        // Effectuer des analyses approfondies
        await this.performAdvancedAnalytics(researchSubject);

        // Générer des insights de recherche
        await this.generateResearchInsights(researchSubject);
    }

    /**
     * Simule une étude longitudinale
     */
    private async simulateLongitudinalStudy(subjectId: string): Promise<void> {
        console.log('📅 Simulation : Étude longitudinale sur 4 semaines\n');

        const weeks = 4;
        const sessionsPerWeek = 3;

        for (let week = 1; week <= weeks; week++) {
            console.log(`📊 Semaine ${week} :`);

            for (let session = 1; session <= sessionsPerWeek; session++) {
                // Simuler une progression réaliste
                const progress = ((week - 1) * sessionsPerWeek + session - 1) / (weeks * sessionsPerWeek);
                const params = this.createProgressiveParams(week, session, progress);

                const state = await this.emotionalSystem.generateEmotionalState(subjectId, params);
                console.log(`   Session ${session} : ${state.primaryEmotion} (${state.intensity.toFixed(2)})`);
            }
            console.log('');
        }
    }

    /**
     * Crée des paramètres progressifs pour l'étude
     */
    private createProgressiveParams(
        week: number,
        session: number,
        progress: number
    ): EmotionGenerationParams {
        // Simuler une progression réaliste avec hauts et bas
        const basePerformance = Math.min(0.3 + progress * 0.6, 0.9);
        const randomVariation = (Math.random() - 0.5) * 0.4;
        const performance = Math.max(0.1, Math.min(0.9, basePerformance + randomVariation));

        const outcome: 'success' | 'partial' | 'failure' =
            performance > 0.7 ? 'success' :
                performance > 0.4 ? 'partial' : 'failure';

        return {
            learningContext: `longitudinal_study_week_${week}`,
            stimulus: `session_${session}_week_${week}_exercise`,
            stimulusIntensity: 0.5 + progress * 0.3,
            learningOutcome: outcome,
            contextualFactors: [`week_${week}`, `session_${session}`, 'longitudinal_study', `progress_${Math.round(progress * 100)}pct`]
        };
    }

    /**
     * Effectue des analyses approfondies
     */
    private async performAdvancedAnalytics(subjectId: string): Promise<void> {
        console.log('🔍 === ANALYSES APPROFONDIES ===\n');

        // Recherche dans l'historique avec critères avancés
        const allHistory = await this.emotionalSystem.searchHistory(subjectId, {});

        console.log(`📊 Données collectées : ${allHistory.totalCount} points de données\n`);

        // Analyse par semaine
        for (let week = 1; week <= 4; week++) {
            const weekData = await this.emotionalSystem.searchHistory(subjectId, {
                triggers: [`week_${week}`]
            });

            if (weekData.states.length > 0) {
                const avgValence = weekData.states.reduce((sum, s) => sum + s.valence, 0) / weekData.states.length;
                const avgIntensity = weekData.states.reduce((sum, s) => sum + s.intensity, 0) / weekData.states.length;

                console.log(`📈 Semaine ${week} :`);
                console.log(`   Valence moyenne : ${avgValence.toFixed(3)}`);
                console.log(`   Intensité moyenne : ${avgIntensity.toFixed(3)}`);
                console.log(`   Progression : ${this.calculateWeeklyProgress(weekData.states)}`);
                console.log('');
            }
        }

        // Analyse complète finale
        const finalAnalysis = await this.emotionalSystem.performCompleteAnalysis(subjectId);
        console.log('🎯 Analyse finale :');
        console.log(`   Patterns détectés : ${finalAnalysis.patterns.length}`);
        console.log(`   Confiance globale : ${(finalAnalysis.confidence * 100).toFixed(1)}%`);
        finalAnalysis.patterns.forEach(pattern => {
            console.log(`   - ${pattern.type} : ${pattern.sequence.join(' → ')} (confiance: ${(pattern.confidence * 100).toFixed(0)}%)`);
        });
        console.log('');
    }

    /**
     * Calcule la progression hebdomadaire
     */
    private calculateWeeklyProgress(states: readonly EmotionalState[]): string {
        if (states.length < 2) return 'Données insuffisantes';

        const firstHalf = states.slice(0, Math.floor(states.length / 2));
        const secondHalf = states.slice(Math.floor(states.length / 2));

        const firstAvg = firstHalf.reduce((sum, s) => sum + s.valence, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, s) => sum + s.valence, 0) / secondHalf.length;

        const improvement = secondAvg - firstAvg;

        if (improvement > 0.2) return '📈 Forte amélioration';
        if (improvement > 0.05) return '📊 Amélioration modérée';
        if (improvement > -0.05) return '➡️ Stable';
        if (improvement > -0.2) return '📉 Légère régression';
        return '⬇️ Régression significative';
    }

    /**
     * Génère des insights de recherche
     */
    private async generateResearchInsights(subjectId: string): Promise<void> {
        console.log('💡 === INSIGHTS DE RECHERCHE ===\n');

        const finalAnalysis = await this.emotionalSystem.performCompleteAnalysis(subjectId);

        // Insights sur les patterns
        if (finalAnalysis.patterns.length > 0) {
            console.log('🔍 Insights sur les patterns :');

            const learningCycles = finalAnalysis.patterns.filter(p => p.type === 'learning_cycle');
            if (learningCycles.length > 0) {
                console.log(`   - ${learningCycles.length} cycles d'apprentissage détectés`);
                console.log('   - Recommandation : Structurer l\'enseignement selon ces cycles naturels');
            }

            const breakthroughs = finalAnalysis.patterns.filter(p => p.type === 'breakthrough');
            if (breakthroughs.length > 0) {
                console.log(`   - ${breakthroughs.length} moments de révélation identifiés`);
                console.log('   - Recommandation : Analyser les conditions favorisant ces moments');
            }

            console.log('');
        }

        // Insights sur la progression
        console.log('📊 Insights sur la progression :');
        const history = finalAnalysis.recentHistory;
        if (history.length >= 4) {
            const quarters = [
                history.slice(0, Math.floor(history.length / 4)),
                history.slice(Math.floor(history.length / 4), Math.floor(history.length / 2)),
                history.slice(Math.floor(history.length / 2), Math.floor(3 * history.length / 4)),
                history.slice(Math.floor(3 * history.length / 4))
            ];

            quarters.forEach((quarter, index) => {
                const avgValence = quarter.reduce((sum, s) => sum + s.valence, 0) / quarter.length;
                console.log(`   Période ${index + 1} : ${avgValence.toFixed(3)} (${this.interpretValence(avgValence)})`);
            });
        }

        console.log('\n🎯 Recommandations pour futures études :');
        finalAnalysis.recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. ${rec}`);
        });

        console.log('\n📄 Rapport complet généré pour publication scientifique');
    }

    /**
     * Interprète une valence pour les insights
     */
    private interpretValence(valence: number): string {
        if (valence > 0.5) return 'État très positif';
        if (valence > 0.2) return 'État positif';
        if (valence > -0.2) return 'État neutre';
        if (valence > -0.5) return 'État négatif';
        return 'État très négatif';
    }
}

/**
 * Exécuteur principal des exemples
 * 
 * @class ExampleRunner
 * @description Classe principale pour exécuter tous les exemples
 * de manière séquentielle ou sélective.
 */
export class ExampleRunner {
    /**
     * Exécute tous les exemples
     */
    public static async runAllExamples(): Promise<void> {
        console.log('🚀 ===== EXEMPLES SYSTÈME ÉMOTIONNEL METASIGN =====\n');

        try {
            // Exemple 1 : Cours LSF complet
            const courseExample = new LSFCourseIntegrationExample();
            await courseExample.demonstrateCompleteLSFCourse();

            // Exemple 2 : Adaptation temps réel
            const realtimeExample = new RealTimeAdaptationExample();
            await realtimeExample.demonstrateRealTimeAdaptation();

            // Exemple 3 : Dynamiques de groupe
            const groupExample = new GroupDynamicsExample();
            await groupExample.demonstrateGroupDynamics();

            // Exemple 4 : Recherche et analytics
            const researchExample = new ResearchAnalyticsExample();
            await researchExample.demonstrateResearchAnalytics();

            console.log('✅ Tous les exemples exécutés avec succès !');
            console.log('\n📚 Consultez la documentation complète pour plus d\'informations.');

        } catch (error) {
            console.error('❌ Erreur lors de l\'exécution des exemples :', error);
        }
    }

    /**
     * Exécute un exemple spécifique
     */
    public static async runSpecificExample(exampleName: string): Promise<void> {
        switch (exampleName.toLowerCase()) {
            case 'course':
            case 'cours':
                const courseExample = new LSFCourseIntegrationExample();
                await courseExample.demonstrateCompleteLSFCourse();
                break;

            case 'realtime':
            case 'adaptation':
                const realtimeExample = new RealTimeAdaptationExample();
                await realtimeExample.demonstrateRealTimeAdaptation();
                break;

            case 'group':
            case 'groupe':
                const groupExample = new GroupDynamicsExample();
                await groupExample.demonstrateGroupDynamics();
                break;

            case 'research':
            case 'recherche':
                const researchExample = new ResearchAnalyticsExample();
                await researchExample.demonstrateResearchAnalytics();
                break;

            default:
                console.log('❌ Exemple non reconnu. Exemples disponibles :');
                console.log('   - course : Intégration cours LSF');
                console.log('   - realtime : Adaptation temps réel');
                console.log('   - group : Dynamiques de groupe');
                console.log('   - research : Recherche et analytics');
        }
    }
}

// Export pour utilisation dans d'autres modules
export const EXAMPLES = {
    LSFCourseIntegrationExample,
    RealTimeAdaptationExample,
    GroupDynamicsExample,
    ResearchAnalyticsExample,
    ExampleRunner
} as const;