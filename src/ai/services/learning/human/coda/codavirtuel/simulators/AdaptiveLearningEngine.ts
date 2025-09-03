/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulators/AdaptiveLearningEngine.ts
 * @description Moteur d'apprentissage adaptatif pour l'IA-élève CODA
 * 
 * Fonctionnalités :
 * - 🧠 Adaptation intelligente selon les performances
 * - 📊 Analyse des patterns d'apprentissage
 * - 🎯 Ajustement dynamique de la difficulté
 * - 🔄 Intégration avec le moteur d'erreurs
 * - 📈 Prédiction des besoins d'apprentissage
 * - 🎭 Simulation de courbes d'apprentissage réalistes
 * 
 * @module simulators
 * @version 1.0.0
 * @since 2025
 * @author MetaSign Team - CODA Adaptive Learning
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { ErrorSimulationEngine, type SimulatedError, type LearnerContext } from './ErrorSimulationEngine';
import type { CECRLLevel, AIMood, AIStudentPersonalityType } from '../types/index';

/**
 * Modèle d'apprentissage d'un concept
 */
export interface ConceptLearningModel {
    readonly conceptId: string;
    readonly name: string;
    readonly currentMastery: number; // 0.0 à 1.0
    readonly exposureCount: number;
    readonly successfulAttempts: number;
    readonly totalAttempts: number;
    readonly lastPracticeDate: Date;
    readonly difficultyLevel: number; // 0.0 à 1.0
    readonly prerequisiteMastery: number; // Maîtrise des prérequis
    readonly forgettingCurve: number; // Taux d'oubli
    readonly retentionStrength: number; // Force de rétention
    readonly learningVelocity: number; // Vitesse d'apprentissage
}

/**
 * Profil d'apprentissage personnalisé
 */
export interface LearningProfile {
    readonly learnerId: string;
    readonly personality: AIStudentPersonalityType;
    readonly currentLevel: CECRLLevel;
    readonly globalLearningRate: number;
    readonly attentionSpan: number; // en minutes
    readonly preferredDifficulty: number; // 0.0 à 1.0
    readonly motivationLevel: number;
    readonly fatigueRate: number;
    readonly errorTolerance: number;
    readonly conceptModels: Map<string, ConceptLearningModel>;
    readonly learningHistory: LearningEvent[];
    readonly strengths: string[]; // Types de concepts mieux maîtrisés
    readonly weaknesses: string[]; // Types de concepts plus difficiles
}

/**
 * Événement d'apprentissage
 */
export interface LearningEvent {
    readonly timestamp: Date;
    readonly eventType: 'concept_introduction' | 'practice_session' | 'error_correction' | 'mastery_achieved';
    readonly conceptId: string;
    readonly performance: number;
    readonly duration: number; // en secondes
    readonly context: {
        readonly sessionId: string;
        readonly mood: AIMood;
        readonly fatigue: number;
        readonly difficulty: number;
    };
}

/**
 * Recommandations d'adaptation
 */
export interface AdaptationRecommendations {
    readonly shouldAdjustDifficulty: boolean;
    readonly difficultyChange: number; // -1.0 à 1.0
    readonly recommendedConcepts: string[];
    readonly reviewConcepts: string[];
    readonly skipConcepts: string[];
    readonly paceAdjustment: 'slower' | 'normal' | 'faster';
    readonly motivationBoostNeeded: boolean;
    readonly breakRecommended: boolean;
    readonly explanation: string;
}

/**
 * Prédiction de performance
 */
export interface PerformancePrediction {
    readonly conceptId: string;
    readonly predictedMastery: number;
    readonly confidenceInterval: [number, number];
    readonly estimatedTimeToMastery: number; // en minutes
    readonly riskFactors: string[];
    readonly successProbability: number;
}

/**
 * Moteur d'apprentissage adaptatif
 */
export class AdaptiveLearningEngine {
    private readonly logger = LoggerFactory.getLogger('AdaptiveLearningEngine');
    private readonly errorEngine: ErrorSimulationEngine;
    private readonly learningProfiles: Map<string, LearningProfile> = new Map();
    
    // Paramètres du modèle d'apprentissage
    private readonly MASTERY_THRESHOLD = 0.8;
    private readonly FORGETTING_BASE_RATE = 0.1;
    private readonly MIN_EXPOSURE_FOR_MASTERY = 3;
    private readonly ATTENTION_DECAY_RATE = 0.95;

    constructor(errorEngine: ErrorSimulationEngine) {
        this.errorEngine = errorEngine;
        this.logger.info('🧠 Moteur d\'apprentissage adaptatif initialisé');
    }

    // ==================== GESTION DES PROFILS ====================

    /**
     * Crée un nouveau profil d'apprentissage
     */
    public createLearningProfile(
        learnerId: string,
        personality: AIStudentPersonalityType,
        initialLevel: CECRLLevel
    ): LearningProfile {
        const profile: LearningProfile = {
            learnerId,
            personality,
            currentLevel: initialLevel,
            globalLearningRate: this.calculateInitialLearningRate(personality),
            attentionSpan: this.calculateAttentionSpan(personality),
            preferredDifficulty: this.calculatePreferredDifficulty(personality),
            motivationLevel: 0.8,
            fatigueRate: 0.1,
            errorTolerance: this.calculateErrorTolerance(personality),
            conceptModels: new Map(),
            learningHistory: [],
            strengths: this.getPersonalityStrengths(personality),
            weaknesses: this.getPersonalityWeaknesses(personality)
        };

        this.learningProfiles.set(learnerId, profile);
        
        this.logger.info('👤 Profil d\'apprentissage créé', {
            learnerId,
            personality,
            initialLevel
        });

        return profile;
    }

    /**
     * Met à jour un profil d'apprentissage après une session
     */
    public updateLearningProfile(
        learnerId: string,
        sessionData: {
            conceptsPracticed: string[];
            performance: Record<string, number>;
            sessionDuration: number;
            mood: AIMood;
            errors: SimulatedError[];
        }
    ): void {
        const profile = this.learningProfiles.get(learnerId);
        if (!profile) {
            this.logger.warn('⚠️ Profil d\'apprentissage introuvable', { learnerId });
            return;
        }

        // Mettre à jour la fatigue
        const newFatigueRate = Math.min(1, profile.fatigueRate + sessionData.sessionDuration / 3600);
        
        // Mettre à jour les modèles de concepts
        sessionData.conceptsPracticed.forEach(conceptId => {
            this.updateConceptModel(profile, conceptId, sessionData.performance[conceptId] || 0.5);
        });

        // Ajouter les événements d'apprentissage
        sessionData.conceptsPracticed.forEach(conceptId => {
            const event: LearningEvent = {
                timestamp: new Date(),
                eventType: 'practice_session',
                conceptId,
                performance: sessionData.performance[conceptId] || 0.5,
                duration: sessionData.sessionDuration,
                context: {
                    sessionId: `session_${Date.now()}`,
                    mood: sessionData.mood,
                    fatigue: newFatigueRate,
                    difficulty: this.getConceptDifficulty(profile, conceptId)
                }
            };
            profile.learningHistory.push(event);
        });

        // Limiter l'historique à 100 événements récents
        if (profile.learningHistory.length > 100) {
            profile.learningHistory.splice(0, profile.learningHistory.length - 100);
        }

        this.logger.debug('📊 Profil d\'apprentissage mis à jour', {
            learnerId,
            conceptsPracticed: sessionData.conceptsPracticed.length,
            newFatigueRate
        });
    }

    // ==================== ADAPTATION INTELLIGENTE ====================

    /**
     * Analyse les besoins d'adaptation pour un apprenant
     */
    public analyzeAdaptationNeeds(
        learnerId: string,
        currentContext: LearnerContext
    ): AdaptationRecommendations {
        const profile = this.learningProfiles.get(learnerId);
        if (!profile) {
            return this.createDefaultRecommendations();
        }

        // Analyser les performances récentes
        const recentPerformance = this.analyzeRecentPerformance(profile);
        const difficultyAnalysis = this.analyzeDifficultyFit(profile, currentContext);
        const motivationAnalysis = this.analyzeMotivation(profile, currentContext);
        
        // Calculer les ajustements nécessaires
        let difficultyChange = 0;
        let paceAdjustment: 'slower' | 'normal' | 'faster' = 'normal';
        
        if (recentPerformance.averageScore < 0.4) {
            difficultyChange = -0.3;
            paceAdjustment = 'slower';
        } else if (recentPerformance.averageScore > 0.8) {
            difficultyChange = 0.2;
            paceAdjustment = 'faster';
        }

        // Concepts à recommander ou réviser
        const recommendedConcepts = this.getRecommendedConcepts(profile, currentContext);
        const reviewConcepts = this.getConceptsNeedingReview(profile);
        const skipConcepts = this.getConceptsToSkip(profile);

        const explanation = this.generateAdaptationExplanation(
            recentPerformance,
            difficultyAnalysis,
            motivationAnalysis
        );

        return {
            shouldAdjustDifficulty: Math.abs(difficultyChange) > 0.1,
            difficultyChange,
            recommendedConcepts,
            reviewConcepts,
            skipConcepts,
            paceAdjustment,
            motivationBoostNeeded: motivationAnalysis.needsBoost,
            breakRecommended: currentContext.fatigue > 0.7 || currentContext.sessionDuration > profile.attentionSpan,
            explanation
        };
    }

    /**
     * Prédit la performance future d'un apprenant sur un concept
     */
    public predictPerformance(
        learnerId: string,
        conceptId: string,
        futureSessions?: number
    ): PerformancePrediction {
        const profile = this.learningProfiles.get(learnerId);
        if (!profile) {
            return this.createDefaultPrediction(conceptId);
        }

        const conceptModel = profile.conceptModels.get(conceptId);
        if (!conceptModel) {
            return this.createDefaultPrediction(conceptId);
        }

        // Calculer la maîtrise prédite avec courbe d'apprentissage
        const sessions = futureSessions || 5;
        const learningCurve = this.calculateLearningCurve(conceptModel, sessions);
        const forgettingEffect = this.calculateForgettingEffect(conceptModel);
        
        const predictedMastery = Math.min(1, conceptModel.currentMastery + learningCurve - forgettingEffect);
        
        // Calculer l'intervalle de confiance
        const variance = this.calculatePredictionVariance(conceptModel, sessions);
        const confidenceInterval: [number, number] = [
            Math.max(0, predictedMastery - variance),
            Math.min(1, predictedMastery + variance)
        ];

        // Estimer le temps jusqu'à la maîtrise
        const timeToMastery = this.estimateTimeToMastery(conceptModel, profile);

        // Identifier les facteurs de risque
        const riskFactors = this.identifyRiskFactors(conceptModel, profile);

        return {
            conceptId,
            predictedMastery,
            confidenceInterval,
            estimatedTimeToMastery: timeToMastery,
            riskFactors,
            successProbability: this.calculateSuccessProbability(predictedMastery, variance)
        };
    }

    /**
     * Optimise la séquence d'apprentissage
     */
    public optimizeLearningSequence(
        learnerId: string,
        availableConcepts: string[],
        sessionDuration: number
    ): {
        optimizedSequence: string[];
        expectedImprovement: number;
        reasoning: string;
    } {
        const profile = this.learningProfiles.get(learnerId);
        if (!profile) {
            return {
                optimizedSequence: availableConcepts.slice(0, 3),
                expectedImprovement: 0.5,
                reasoning: 'Profil non disponible, séquence par défaut'
            };
        }

        // Calculer le score d'efficacité pour chaque concept
        const conceptScores = availableConcepts.map(conceptId => {
            const prediction = this.predictPerformance(learnerId, conceptId);
            const difficulty = this.getConceptDifficulty(profile, conceptId);
            const prerequisiteReady = this.arePrerequisitesReady(profile, conceptId);
            
            // Score composite basé sur plusieurs facteurs
            const score = 
                prediction.successProbability * 0.4 +
                (1 - difficulty) * 0.3 +
                (prerequisiteReady ? 1 : 0) * 0.3;

            return {
                conceptId,
                score,
                prediction
            };
        });

        // Trier par score d'efficacité
        conceptScores.sort((a, b) => b.score - a.score);

        // Sélectionner les concepts optimaux pour la durée de session
        const conceptsPerSession = Math.max(1, Math.min(5, Math.floor(sessionDuration / 10)));
        const optimizedSequence = conceptScores.slice(0, conceptsPerSession).map(cs => cs.conceptId);

        // Calculer l'amélioration attendue
        const expectedImprovement = conceptScores.slice(0, conceptsPerSession)
            .reduce((sum, cs) => sum + cs.prediction.predictedMastery, 0) / conceptsPerSession;

        const reasoning = `Séquence optimisée basée sur ${conceptScores.length} concepts disponibles. ` +
            `Sélection de ${optimizedSequence.length} concepts avec probabilité de succès moyenne: ` +
            `${(conceptScores.slice(0, conceptsPerSession).reduce((sum, cs) => sum + cs.score, 0) / conceptsPerSession * 100).toFixed(1)}%`;

        return {
            optimizedSequence,
            expectedImprovement,
            reasoning
        };
    }

    // ==================== MÉTHODES PRIVÉES ====================

    private calculateInitialLearningRate(personality: AIStudentPersonalityType): number {
        const rates: Record<AIStudentPersonalityType, number> = {
            'curious_student': 0.8,
            'shy_learner': 0.6,
            'energetic_pupil': 0.7,
            'patient_apprentice': 0.9,
            'analytical_learner': 0.75,
            'creative_thinker': 0.85
        };
        return rates[personality] || 0.7;
    }

    private calculateAttentionSpan(personality: AIStudentPersonalityType): number {
        const spans: Record<AIStudentPersonalityType, number> = {
            'curious_student': 45,
            'shy_learner': 30,
            'energetic_pupil': 25,
            'patient_apprentice': 60,
            'analytical_learner': 50,
            'creative_thinker': 40
        };
        return spans[personality] || 40;
    }

    private calculatePreferredDifficulty(personality: AIStudentPersonalityType): number {
        const preferences: Record<AIStudentPersonalityType, number> = {
            'curious_student': 0.7,
            'shy_learner': 0.4,
            'energetic_pupil': 0.6,
            'patient_apprentice': 0.5,
            'analytical_learner': 0.8,
            'creative_thinker': 0.6
        };
        return preferences[personality] || 0.5;
    }

    private calculateErrorTolerance(personality: AIStudentPersonalityType): number {
        const tolerances: Record<AIStudentPersonalityType, number> = {
            'curious_student': 0.8,
            'shy_learner': 0.3,
            'energetic_pupil': 0.6,
            'patient_apprentice': 0.9,
            'analytical_learner': 0.7,
            'creative_thinker': 0.8
        };
        return tolerances[personality] || 0.6;
    }

    private getPersonalityStrengths(personality: AIStudentPersonalityType): string[] {
        const strengths: Record<AIStudentPersonalityType, string[]> = {
            'curious_student': ['exploration', 'novelty', 'complex_concepts'],
            'shy_learner': ['precision', 'attention_to_detail', 'careful_practice'],
            'energetic_pupil': ['interaction', 'dynamic_content', 'variety'],
            'patient_apprentice': ['methodology', 'systematic_learning', 'persistence'],
            'analytical_learner': ['logical_thinking', 'problem_solving', 'structured_approach'],
            'creative_thinker': ['innovation', 'artistic_expression', 'flexible_thinking']
        };
        return strengths[personality] || [];
    }

    private getPersonalityWeaknesses(personality: AIStudentPersonalityType): string[] {
        const weaknesses: Record<AIStudentPersonalityType, string[]> = {
            'curious_student': ['repetitive_practice', 'basic_concepts'],
            'shy_learner': ['public_practice', 'spontaneous_interaction'],
            'energetic_pupil': ['slow_methodical_practice', 'patience_required'],
            'patient_apprentice': ['time_pressure', 'rapid_changes'],
            'analytical_learner': ['ambiguous_concepts', 'emotional_expression'],
            'creative_thinker': ['rigid_rules', 'monotonous_practice']
        };
        return weaknesses[personality] || [];
    }

    private updateConceptModel(profile: LearningProfile, conceptId: string, performance: number): void {
        let model = profile.conceptModels.get(conceptId);
        
        if (!model) {
            model = {
                conceptId,
                name: conceptId,
                currentMastery: 0,
                exposureCount: 0,
                successfulAttempts: 0,
                totalAttempts: 0,
                lastPracticeDate: new Date(),
                difficultyLevel: 0.5,
                prerequisiteMastery: 0,
                forgettingCurve: this.FORGETTING_BASE_RATE,
                retentionStrength: 0,
                learningVelocity: profile.globalLearningRate
            };
        }

        // Mettre à jour les statistiques
        const updatedModel: ConceptLearningModel = {
            ...model,
            exposureCount: model.exposureCount + 1,
            totalAttempts: model.totalAttempts + 1,
            successfulAttempts: model.successfulAttempts + (performance > 0.6 ? 1 : 0),
            lastPracticeDate: new Date(),
            currentMastery: this.updateMastery(model.currentMastery, performance, model.exposureCount),
            retentionStrength: this.calculateRetentionStrength(model, performance)
        };

        profile.conceptModels.set(conceptId, updatedModel);
    }

    private updateMastery(currentMastery: number, performance: number, exposureCount: number): number {
        // Courbe d'apprentissage avec rendements décroissants
        const learningRate = 0.3 / Math.sqrt(exposureCount);
        const performanceGap = performance - currentMastery;
        const masteryIncrease = learningRate * performanceGap;
        
        return Math.max(0, Math.min(1, currentMastery + masteryIncrease));
    }

    private calculateRetentionStrength(model: ConceptLearningModel, performance: number): number {
        const successRate = model.totalAttempts > 0 ? model.successfulAttempts / model.totalAttempts : 0;
        const recencyFactor = Math.exp(-0.1 * ((Date.now() - model.lastPracticeDate.getTime()) / (24 * 60 * 60 * 1000)));
        
        return Math.min(1, successRate * 0.7 + performance * 0.3) * recencyFactor;
    }

    private analyzeRecentPerformance(profile: LearningProfile): {
        averageScore: number;
        trend: 'improving' | 'stable' | 'declining';
        consistency: number;
    } {
        const recentEvents = profile.learningHistory.slice(-10);
        
        if (recentEvents.length === 0) {
            return { averageScore: 0.5, trend: 'stable', consistency: 0.5 };
        }

        const scores = recentEvents.map(e => e.performance);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        
        // Calculer la tendance
        const firstHalf = scores.slice(0, Math.ceil(scores.length / 2));
        const secondHalf = scores.slice(Math.floor(scores.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
        
        const trend = secondAvg > firstAvg + 0.1 ? 'improving' : 
                     secondAvg < firstAvg - 0.1 ? 'declining' : 'stable';

        // Calculer la consistance (inverse de la variance)
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / scores.length;
        const consistency = Math.max(0, 1 - variance);

        return { averageScore, trend, consistency };
    }

    private analyzeDifficultyFit(profile: LearningProfile, context: LearnerContext): {
        currentDifficulty: number;
        optimalDifficulty: number;
        adjustment: number;
    } {
        const recentConcepts = context.recentConcepts;
        let totalDifficulty = 0;
        let conceptCount = 0;

        recentConcepts.forEach(conceptId => {
            const model = profile.conceptModels.get(conceptId);
            if (model) {
                totalDifficulty += model.difficultyLevel;
                conceptCount++;
            }
        });

        const currentDifficulty = conceptCount > 0 ? totalDifficulty / conceptCount : 0.5;
        const optimalDifficulty = profile.preferredDifficulty;
        const adjustment = optimalDifficulty - currentDifficulty;

        return { currentDifficulty, optimalDifficulty, adjustment };
    }

    private analyzeMotivation(profile: LearningProfile, context: LearnerContext): {
        currentMotivation: number;
        needsBoost: boolean;
        factors: string[];
    } {
        const motivationFactors: string[] = [];
        let motivationScore = profile.motivationLevel;

        // Facteurs de démotivation
        if (context.fatigue > 0.7) {
            motivationScore -= 0.2;
            motivationFactors.push('fatigue élevée');
        }

        if (context.currentMood === 'frustrated') {
            motivationScore -= 0.3;
            motivationFactors.push('frustration');
        }

        // Facteurs de motivation
        if (context.currentMood === 'excited') {
            motivationScore += 0.2;
            motivationFactors.push('enthousiasme');
        }

        const recentMasteries = Array.from(profile.conceptModels.values())
            .filter(model => model.currentMastery > this.MASTERY_THRESHOLD)
            .length;
        
        if (recentMasteries > 0) {
            motivationScore += recentMasteries * 0.1;
            motivationFactors.push('concepts maîtrisés récemment');
        }

        return {
            currentMotivation: Math.max(0, Math.min(1, motivationScore)),
            needsBoost: motivationScore < 0.4,
            factors: motivationFactors
        };
    }

    private getRecommendedConcepts(profile: LearningProfile, context: LearnerContext): string[] {
        // Logique simplifiée - à améliorer avec une vraie base de connaissances
        const levelConcepts: Record<CECRLLevel, string[]> = {
            'A1': ['salutations', 'presentations', 'famille_base', 'couleurs'],
            'A2': ['activites', 'nourriture', 'temps_presente', 'lieux'],
            'B1': ['opinions', 'experiences', 'projets', 'emotions_complexes'],
            'B2': ['debats', 'nuances', 'hypotheses', 'culture'],
            'C1': ['abstractions', 'subtilites', 'argumentation', 'metaphores'],
            'C2': ['expertise', 'creativite', 'maitrise_complete', 'innovation']
        };

        const availableConcepts = levelConcepts[context.currentLevel] || [];
        
        return availableConcepts.filter(conceptId => {
            const model = profile.conceptModels.get(conceptId);
            return !model || model.currentMastery < this.MASTERY_THRESHOLD;
        }).slice(0, 3);
    }

    private getConceptsNeedingReview(profile: LearningProfile): string[] {
        const now = new Date();
        const needReview: string[] = [];

        profile.conceptModels.forEach((model, conceptId) => {
            const daysSinceLastPractice = (now.getTime() - model.lastPracticeDate.getTime()) / (24 * 60 * 60 * 1000);
            const forgettingRate = model.forgettingCurve * (1 - model.retentionStrength);
            
            if (daysSinceLastPractice * forgettingRate > 0.3) {
                needReview.push(conceptId);
            }
        });

        return needReview.slice(0, 3);
    }

    private getConceptsToSkip(profile: LearningProfile): string[] {
        const skip: string[] = [];

        profile.conceptModels.forEach((model, conceptId) => {
            if (model.currentMastery > 0.95 && model.exposureCount >= this.MIN_EXPOSURE_FOR_MASTERY * 2) {
                skip.push(conceptId);
            }
        });

        return skip;
    }

    private getConceptDifficulty(profile: LearningProfile, conceptId: string): number {
        const model = profile.conceptModels.get(conceptId);
        return model?.difficultyLevel || 0.5;
    }

    private arePrerequisitesReady(profile: LearningProfile, conceptId: string): boolean {
        // Simulation simplifiée - dans une vraie implémentation,
        // ceci utiliserait un graphe de dépendances des concepts
        const hasPrerequisites = profile.learningHistory.length > 0;
        const conceptComplexity = conceptId.length % 3; // Simple heuristic
        return hasPrerequisites || conceptComplexity === 0;
    }

    private calculateLearningCurve(model: ConceptLearningModel, sessions: number): number {
        // Courbe logarithmique d'apprentissage
        const base = model.learningVelocity * 0.3;
        return base * Math.log(sessions + model.exposureCount + 1) / Math.log(model.exposureCount + 2);
    }

    private calculateForgettingEffect(model: ConceptLearningModel): number {
        const daysSinceLastPractice = (Date.now() - model.lastPracticeDate.getTime()) / (24 * 60 * 60 * 1000);
        return model.forgettingCurve * Math.log(daysSinceLastPractice + 1) / 10;
    }

    private calculatePredictionVariance(model: ConceptLearningModel, sessions: number): number {
        // Variance basée sur la consistance passée et le nombre de sessions prédites
        const baseVariance = 0.1;
        const consistencyFactor = model.totalAttempts > 0 ? 
            1 - (model.successfulAttempts / model.totalAttempts) : 1;
        const sessionFactor = Math.min(0.5, sessions / 10);
        
        return baseVariance * consistencyFactor * (1 + sessionFactor);
    }

    private estimateTimeToMastery(model: ConceptLearningModel, profile: LearningProfile): number {
        if (model.currentMastery >= this.MASTERY_THRESHOLD) return 0;
        
        const remainingMastery = this.MASTERY_THRESHOLD - model.currentMastery;
        const personalityBonus = profile.personality === 'patient_apprentice' ? 1.2 : 1.0;
        const averageSessionImprovement = model.learningVelocity * 0.1 * personalityBonus;
        const sessionsNeeded = Math.ceil(remainingMastery / averageSessionImprovement);
        
        return sessionsNeeded * 15; // 15 minutes par session en moyenne
    }

    private identifyRiskFactors(model: ConceptLearningModel, profile: LearningProfile): string[] {
        const risks: string[] = [];

        if (model.currentMastery < 0.3 && model.exposureCount > 5) {
            risks.push('Faible progression malgré expositions multiples');
        }

        if (model.retentionStrength < 0.4) {
            risks.push('Faible rétention du concept');
        }

        const daysSinceLastPractice = (Date.now() - model.lastPracticeDate.getTime()) / (24 * 60 * 60 * 1000);
        if (daysSinceLastPractice > 7) {
            risks.push('Concept non pratiqué récemment');
        }

        if (profile.weaknesses.some(weakness => model.conceptId.includes(weakness))) {
            risks.push('Concept dans zone de faiblesse de l\'apprenant');
        }

        return risks;
    }

    private calculateSuccessProbability(predictedMastery: number, variance: number): number {
        // Probabilité que la maîtrise prédite dépasse le seuil de réussite
        const threshold = 0.6;
        const standardScore = (predictedMastery - threshold) / Math.sqrt(variance);
        
        // Approximation de la fonction de répartition normale
        return Math.max(0, Math.min(1, 0.5 + 0.5 * Math.tanh(standardScore * 0.8)));
    }

    private createDefaultRecommendations(): AdaptationRecommendations {
        return {
            shouldAdjustDifficulty: false,
            difficultyChange: 0,
            recommendedConcepts: [],
            reviewConcepts: [],
            skipConcepts: [],
            paceAdjustment: 'normal',
            motivationBoostNeeded: false,
            breakRecommended: false,
            explanation: 'Profil d\'apprentissage non disponible'
        };
    }

    private createDefaultPrediction(conceptId: string): PerformancePrediction {
        return {
            conceptId,
            predictedMastery: 0.5,
            confidenceInterval: [0.3, 0.7],
            estimatedTimeToMastery: 60,
            riskFactors: ['Données insuffisantes'],
            successProbability: 0.5
        };
    }

    private generateAdaptationExplanation(
        performance: { averageScore: number; trend: string; consistency: number },
        difficulty: { currentDifficulty: number; optimalDifficulty: number; adjustment: number },
        motivation: { currentMotivation: number; needsBoost: boolean; factors: string[] }
    ): string {
        let explanation = `Performance récente: ${(performance.averageScore * 100).toFixed(0)}% (${performance.trend}). `;
        
        if (Math.abs(difficulty.adjustment) > 0.1) {
            explanation += `Ajustement de difficulté recommandé: ${difficulty.adjustment > 0 ? 'augmenter' : 'diminuer'}. `;
        }

        if (motivation.needsBoost) {
            explanation += `Motivation faible (${(motivation.currentMotivation * 100).toFixed(0)}%), boost recommandé. `;
        }

        if (motivation.factors.length > 0) {
            explanation += `Facteurs identifiés: ${motivation.factors.join(', ')}.`;
        }

        return explanation;
    }

    // ==================== MÉTHODES PUBLIQUES UTILITAIRES ====================

    /**
     * Obtient les statistiques d'un profil d'apprentissage
     */
    public getLearningStats(learnerId: string): {
        totalConcepts: number;
        masteredConcepts: number;
        averageMastery: number;
        learningVelocity: number;
        retentionRate: number;
    } | null {
        const profile = this.learningProfiles.get(learnerId);
        if (!profile) return null;

        const concepts = Array.from(profile.conceptModels.values());
        const totalConcepts = concepts.length;
        const masteredConcepts = concepts.filter(c => c.currentMastery >= this.MASTERY_THRESHOLD).length;
        const averageMastery = concepts.length > 0 ? 
            concepts.reduce((sum, c) => sum + c.currentMastery, 0) / concepts.length : 0;
        const averageRetention = concepts.length > 0 ?
            concepts.reduce((sum, c) => sum + c.retentionStrength, 0) / concepts.length : 0;

        return {
            totalConcepts,
            masteredConcepts,
            averageMastery,
            learningVelocity: profile.globalLearningRate,
            retentionRate: averageRetention
        };
    }

    /**
     * Réinitialise un profil d'apprentissage
     */
    public resetLearningProfile(learnerId: string): void {
        this.learningProfiles.delete(learnerId);
        this.logger.info('🔄 Profil d\'apprentissage réinitialisé', { learnerId });
    }

    /**
     * Exporte les données d'apprentissage pour analyse
     */
    public exportLearningData(learnerId: string): {
        profile: Omit<LearningProfile, 'conceptModels'> & {
            conceptModels: Record<string, ConceptLearningModel>;
        };
        exportedAt: string;
    } | null {
        const profile = this.learningProfiles.get(learnerId);
        if (!profile) return null;

        return {
            profile: {
                ...profile,
                conceptModels: Object.fromEntries(profile.conceptModels),
                learningHistory: profile.learningHistory
            },
            exportedAt: new Date().toISOString()
        };
    }
}