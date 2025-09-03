/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulators/ErrorSimulationEngine.ts
 * @description Moteur de simulation d'erreurs réalistes pour l'IA-élève CODA
 * 
 * Fonctionnalités :
 * - 🎯 Erreurs spécifiques par niveau CECRL (A1 à C2)
 * - 🧠 Patterns d'erreurs basés sur la linguistique LSF
 * - 📊 Progression réaliste des erreurs dans le temps
 * - 🎭 Erreurs influencées par la personnalité de l'IA
 * - 🔄 Apprentissage à partir des corrections
 * - 📝 Documentation complète des types d'erreurs
 * 
 * @module simulators
 * @version 1.0.0
 * @since 2025
 * @author MetaSign Team - CODA Error Simulation
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type { CECRLLevel, AIMood, AIStudentPersonalityType } from '../types/index';

/**
 * Types d'erreurs en LSF
 */
export enum LSFErrorType {
    // Erreurs de configuration manuelle
    HAND_SHAPE_ERROR = 'hand_shape_error',           // Forme de main incorrecte
    MOVEMENT_ERROR = 'movement_error',               // Mouvement incorrect
    PLACEMENT_ERROR = 'placement_error',             // Placement spatial incorrect
    ORIENTATION_ERROR = 'orientation_error',         // Orientation de la main incorrecte
    
    // Erreurs non-manuelles
    FACIAL_EXPRESSION_ERROR = 'facial_expression_error',  // Expression faciale incorrecte
    HEAD_MOVEMENT_ERROR = 'head_movement_error',          // Mouvement de tête incorrect
    EYE_GAZE_ERROR = 'eye_gaze_error',                   // Direction du regard incorrecte
    
    // Erreurs grammaticales
    SYNTAX_ERROR = 'syntax_error',                   // Ordre des signes incorrect
    TEMPORAL_ERROR = 'temporal_error',               // Marquage temporel incorrect
    MODAL_ERROR = 'modal_error',                     // Modalité incorrecte
    
    // Erreurs lexicales
    SIGN_CONFUSION = 'sign_confusion',               // Confusion entre signes similaires
    NEOLOGISM = 'neologism',                        // Création de signes inexistants
    REGIONAL_VARIANT = 'regional_variant',           // Utilisation de variante régionale
    
    // Erreurs discursives
    REFERENCE_ERROR = 'reference_error',             // Référence spatiale incorrecte
    COHESION_ERROR = 'cohesion_error',              // Manque de cohésion
    PRAGMATIC_ERROR = 'pragmatic_error'              // Erreur pragmatique
}

/**
 * Paramètres de configuration d'erreur
 */
export interface ErrorConfig {
    readonly type: LSFErrorType;
    readonly severity: 'minor' | 'moderate' | 'major';
    readonly frequency: number; // 0.0 à 1.0
    readonly correctabilityRate: number; // Facilité à corriger l'erreur
    readonly levelAppearance: CECRLLevel; // Niveau où l'erreur apparaît
    readonly levelDisappearance?: CECRLLevel; // Niveau où l'erreur disparaît
    readonly personalityInfluence: Record<AIStudentPersonalityType, number>;
    readonly moodInfluence: Record<AIMood, number>;
}

/**
 * Erreur simulée avec contexte
 */
export interface SimulatedError {
    readonly id: string;
    readonly type: LSFErrorType;
    readonly concept: string;
    readonly originalSign: string;
    readonly errorSign: string;
    readonly description: string;
    readonly severity: 'minor' | 'moderate' | 'major';
    readonly timestamp: Date;
    readonly correctionHints: string[];
    readonly pedagogicalNote: string;
    readonly canBeRepeated: boolean;
    readonly relatedConcepts: string[];
}

/**
 * Contexte de l'apprenant pour la génération d'erreurs
 */
export interface LearnerContext {
    readonly currentLevel: CECRLLevel;
    readonly personality: AIStudentPersonalityType;
    readonly currentMood: AIMood;
    readonly sessionDuration: number; // en minutes
    readonly fatigue: number; // 0.0 à 1.0
    readonly recentConcepts: string[];
    readonly masteredConcepts: string[];
    readonly strugglingConcepts: string[];
    readonly previousErrors: SimulatedError[];
}

/**
 * Résultat de l'analyse d'erreur
 */
export interface ErrorAnalysis {
    readonly shouldMakeError: boolean;
    readonly errorProbability: number;
    readonly recommendedErrorType: LSFErrorType;
    readonly errorIntensity: number;
    readonly explanation: string;
}

/**
 * Moteur de simulation d'erreurs réalistes
 */
export class ErrorSimulationEngine {
    private readonly logger = LoggerFactory.getLogger('ErrorSimulationEngine');
    private readonly errorConfigs: Map<LSFErrorType, ErrorConfig> = new Map();
    private readonly errorHistory: Map<string, SimulatedError[]> = new Map(); // Par apprenant
    
    constructor() {
        this.initializeErrorConfigurations();
        this.logger.info('🎯 Moteur de simulation d\'erreurs initialisé');
    }

    // ==================== INITIALISATION DES ERREURS ====================

    private initializeErrorConfigurations(): void {
        // Erreurs niveau A1 (débutant)
        this.addErrorConfig({
            type: LSFErrorType.HAND_SHAPE_ERROR,
            severity: 'moderate',
            frequency: 0.4,
            correctabilityRate: 0.8,
            levelAppearance: 'A1',
            levelDisappearance: 'B1',
            personalityInfluence: {
                'curious_student': 0.6,
                'shy_learner': 0.8,
                'energetic_pupil': 0.5,
                'patient_apprentice': 0.3,
                'analytical_learner': 0.4,
                'creative_thinker': 0.7
            },
            moodInfluence: {
                'excited': 0.7,
                'confused': 0.9,
                'frustrated': 0.8,
                'happy': 0.4,
                'neutral': 0.5,
                'curious': 0.6
            }
        });

        this.addErrorConfig({
            type: LSFErrorType.MOVEMENT_ERROR,
            severity: 'moderate',
            frequency: 0.35,
            correctabilityRate: 0.7,
            levelAppearance: 'A1',
            levelDisappearance: 'A2',
            personalityInfluence: {
                'curious_student': 0.5,
                'shy_learner': 0.7,
                'energetic_pupil': 0.8,
                'patient_apprentice': 0.4,
                'analytical_learner': 0.3,
                'creative_thinker': 0.6
            },
            moodInfluence: {
                'excited': 0.8,
                'confused': 0.7,
                'frustrated': 0.6,
                'happy': 0.4,
                'neutral': 0.5,
                'curious': 0.7
            }
        });

        // Erreurs niveau A2
        this.addErrorConfig({
            type: LSFErrorType.FACIAL_EXPRESSION_ERROR,
            severity: 'minor',
            frequency: 0.3,
            correctabilityRate: 0.6,
            levelAppearance: 'A2',
            levelDisappearance: 'B2',
            personalityInfluence: {
                'curious_student': 0.4,
                'shy_learner': 0.9,
                'energetic_pupil': 0.3,
                'patient_apprentice': 0.5,
                'analytical_learner': 0.2,
                'creative_thinker': 0.4
            },
            moodInfluence: {
                'excited': 0.3,
                'confused': 0.6,
                'frustrated': 0.7,
                'happy': 0.2,
                'neutral': 0.4,
                'curious': 0.5
            }
        });

        this.addErrorConfig({
            type: LSFErrorType.SYNTAX_ERROR,
            severity: 'major',
            frequency: 0.25,
            correctabilityRate: 0.5,
            levelAppearance: 'A2',
            levelDisappearance: 'C1',
            personalityInfluence: {
                'curious_student': 0.6,
                'shy_learner': 0.4,
                'energetic_pupil': 0.7,
                'patient_apprentice': 0.3,
                'analytical_learner': 0.5,
                'creative_thinker': 0.8
            },
            moodInfluence: {
                'excited': 0.6,
                'confused': 0.8,
                'frustrated': 0.5,
                'happy': 0.4,
                'neutral': 0.5,
                'curious': 0.7
            }
        });

        // Erreurs niveau B1
        this.addErrorConfig({
            type: LSFErrorType.REFERENCE_ERROR,
            severity: 'moderate',
            frequency: 0.2,
            correctabilityRate: 0.4,
            levelAppearance: 'B1',
            levelDisappearance: 'C2',
            personalityInfluence: {
                'curious_student': 0.5,
                'shy_learner': 0.3,
                'energetic_pupil': 0.6,
                'patient_apprentice': 0.4,
                'analytical_learner': 0.6,
                'creative_thinker': 0.4
            },
            moodInfluence: {
                'excited': 0.4,
                'confused': 0.7,
                'frustrated': 0.6,
                'happy': 0.3,
                'neutral': 0.4,
                'curious': 0.5
            }
        });

        // Erreurs niveau B2
        this.addErrorConfig({
            type: LSFErrorType.MODAL_ERROR,
            severity: 'moderate',
            frequency: 0.15,
            correctabilityRate: 0.3,
            levelAppearance: 'B2',
            personalityInfluence: {
                'curious_student': 0.4,
                'shy_learner': 0.2,
                'energetic_pupil': 0.5,
                'patient_apprentice': 0.3,
                'analytical_learner': 0.4,
                'creative_thinker': 0.3
            },
            moodInfluence: {
                'excited': 0.3,
                'confused': 0.6,
                'frustrated': 0.4,
                'happy': 0.2,
                'neutral': 0.3,
                'curious': 0.4
            }
        });

        // Erreurs niveau C1-C2 (avancées)
        this.addErrorConfig({
            type: LSFErrorType.PRAGMATIC_ERROR,
            severity: 'minor',
            frequency: 0.1,
            correctabilityRate: 0.2,
            levelAppearance: 'C1',
            personalityInfluence: {
                'curious_student': 0.3,
                'shy_learner': 0.1,
                'energetic_pupil': 0.4,
                'patient_apprentice': 0.2,
                'analytical_learner': 0.1,
                'creative_thinker': 0.2
            },
            moodInfluence: {
                'excited': 0.2,
                'confused': 0.4,
                'frustrated': 0.3,
                'happy': 0.1,
                'neutral': 0.2,
                'curious': 0.3
            }
        });

        this.logger.debug('✅ Configurations d\'erreurs initialisées', {
            totalConfigs: this.errorConfigs.size
        });
    }

    private addErrorConfig(config: ErrorConfig): void {
        this.errorConfigs.set(config.type, config);
    }

    // ==================== ANALYSE ET GÉNÉRATION D'ERREURS ====================

    /**
     * Analyse si l'apprenant doit faire une erreur dans le contexte actuel
     */
    public analyzeErrorProbability(context: LearnerContext, concept: string): ErrorAnalysis {
        const applicableErrors = this.getApplicableErrors(context);
        
        if (applicableErrors.length === 0) {
            return {
                shouldMakeError: false,
                errorProbability: 0,
                recommendedErrorType: LSFErrorType.HAND_SHAPE_ERROR,
                errorIntensity: 0,
                explanation: 'Aucune erreur applicable pour ce niveau'
            };
        }

        // Calculer la probabilité globale d'erreur
        let totalProbability = 0;
        let bestErrorType = applicableErrors[0].type;
        let maxProbability = 0;

        for (const errorType of applicableErrors) {
            const config = this.errorConfigs.get(errorType.type)!;
            const probability = this.calculateErrorProbability(config, context, concept);
            
            totalProbability += probability;
            if (probability > maxProbability) {
                maxProbability = probability;
                bestErrorType = errorType.type;
            }
        }

        const averageProbability = totalProbability / applicableErrors.length;
        
        // Facteurs de modification selon le contexte
        const fatigueMultiplier = 1 + context.fatigue * 0.5;
        const sessionDurationMultiplier = Math.min(2, 1 + context.sessionDuration / 60); // Plus d'erreurs après 1h
        
        const finalProbability = Math.min(1, averageProbability * fatigueMultiplier * sessionDurationMultiplier);
        
        return {
            shouldMakeError: finalProbability > 0.3,
            errorProbability: finalProbability,
            recommendedErrorType: bestErrorType,
            errorIntensity: maxProbability,
            explanation: `Probabilité calculée: ${(finalProbability * 100).toFixed(1)}% (fatigue: ${context.fatigue}, durée: ${context.sessionDuration}min)`
        };
    }

    /**
     * Génère une erreur spécifique selon le contexte
     */
    public generateError(
        context: LearnerContext, 
        concept: string, 
        originalSign: string,
        errorType?: LSFErrorType
    ): SimulatedError | null {
        
        const analysis = this.analyzeErrorProbability(context, concept);
        const selectedErrorType = errorType || analysis.recommendedErrorType;
        
        if (!analysis.shouldMakeError && !errorType) {
            this.logger.debug('🎯 Pas d\'erreur générée', {
                concept,
                probability: analysis.errorProbability
            });
            return null;
        }

        const config = this.errorConfigs.get(selectedErrorType);
        if (!config) {
            this.logger.warn('⚠️ Configuration d\'erreur introuvable', { errorType: selectedErrorType });
            return null;
        }

        const error = this.createSimulatedError(config, context, concept, originalSign);
        
        // Enregistrer l'erreur dans l'historique
        const learnerId = `learner_${context.currentLevel}_${context.personality}`;
        if (!this.errorHistory.has(learnerId)) {
            this.errorHistory.set(learnerId, []);
        }
        this.errorHistory.get(learnerId)!.push(error);

        this.logger.info('🎯 Erreur générée', {
            type: error.type,
            concept: error.concept,
            severity: error.severity
        });

        return error;
    }

    /**
     * Simule l'apprentissage à partir d'une correction
     */
    public processCorrection(
        context: LearnerContext,
        error: SimulatedError,
        correctionQuality: 'poor' | 'adequate' | 'excellent'
    ): {
        learned: boolean;
        retentionRate: number;
        improvementSuggestions: string[];
    } {
        const config = this.errorConfigs.get(error.type)!;
        
        // Facteurs influençant l'apprentissage
        const personalityFactor = config.personalityInfluence[context.personality];
        const moodFactor = config.moodInfluence[context.currentMood];
        const correctionFactor = correctionQuality === 'excellent' ? 1.0 : 
                                correctionQuality === 'adequate' ? 0.7 : 0.4;
        
        const learningRate = config.correctabilityRate * personalityFactor * moodFactor * correctionFactor;
        const learned = Math.random() < learningRate;
        
        const improvementSuggestions: string[] = [];
        
        if (!learned) {
            improvementSuggestions.push(
                'Répéter l\'exercice avec plus d\'exemples',
                'Utiliser des supports visuels supplémentaires',
                'Décomposer le signe en étapes plus petites'
            );
        }

        if (correctionQuality === 'poor') {
            improvementSuggestions.push(
                'Améliorer la clarté des explications',
                'Donner plus d\'exemples concrets',
                'Utiliser la répétition espacée'
            );
        }

        this.logger.debug('🔄 Correction processée', {
            errorType: error.type,
            learned,
            learningRate: learningRate.toFixed(2),
            correctionQuality
        });

        return {
            learned,
            retentionRate: learningRate,
            improvementSuggestions
        };
    }

    // ==================== MÉTHODES PRIVÉES ====================

    private getApplicableErrors(context: LearnerContext): { type: LSFErrorType, weight: number }[] {
        const applicable: { type: LSFErrorType, weight: number }[] = [];
        
        this.errorConfigs.forEach((config, type) => {
            // Vérifier si l'erreur est applicable au niveau actuel
            if (this.isErrorApplicableToLevel(config, context.currentLevel)) {
                // Calculer le poids basé sur les erreurs précédentes
                const recentSameErrors = context.previousErrors
                    .filter(e => e.type === type)
                    .filter(e => Date.now() - e.timestamp.getTime() < 24 * 60 * 60 * 1000); // 24h
                
                // Réduire la probabilité si l'erreur a été faite récemment
                const recentErrorPenalty = Math.max(0.1, 1 - recentSameErrors.length * 0.3);
                
                applicable.push({
                    type,
                    weight: config.frequency * recentErrorPenalty
                });
            }
        });

        return applicable.sort((a, b) => b.weight - a.weight);
    }

    private isErrorApplicableToLevel(config: ErrorConfig, level: CECRLLevel): boolean {
        const levels: CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const currentLevelIndex = levels.indexOf(level);
        const appearanceIndex = levels.indexOf(config.levelAppearance);
        const disappearanceIndex = config.levelDisappearance ? 
            levels.indexOf(config.levelDisappearance) : levels.length;
        
        return currentLevelIndex >= appearanceIndex && currentLevelIndex < disappearanceIndex;
    }

    private calculateErrorProbability(
        config: ErrorConfig, 
        context: LearnerContext, 
        concept: string
    ): number {
        const baseProbability = config.frequency;
        
        // Influence de la personnalité
        const personalityMultiplier = config.personalityInfluence[context.personality] || 0.5;
        
        // Influence de l'humeur
        const moodMultiplier = config.moodInfluence[context.currentMood] || 0.5;
        
        // Influence de la difficulté du concept
        const conceptDifficulty = context.strugglingConcepts.includes(concept) ? 1.5 : 
                                  context.masteredConcepts.includes(concept) ? 0.3 : 1.0;
        
        // Réduction si le concept a été récemment appris
        const recentlyLearned = context.recentConcepts.includes(concept) ? 0.7 : 1.0;
        
        return baseProbability * personalityMultiplier * moodMultiplier * conceptDifficulty * recentlyLearned;
    }

    private createSimulatedError(
        config: ErrorConfig,
        context: LearnerContext,
        concept: string,
        originalSign: string
    ): SimulatedError {
        const errorId = `error_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        
        // Générer la version erronée du signe
        const errorSign = this.generateErrorSign(config.type, originalSign);
        
        // Générer la description de l'erreur
        const description = this.generateErrorDescription(config.type, originalSign, errorSign);
        
        // Générer les indices de correction
        const correctionHints = this.generateCorrectionHints(config.type, originalSign, errorSign);
        
        // Note pédagogique
        const pedagogicalNote = this.generatePedagogicalNote(config.type, context.currentLevel);

        return {
            id: errorId,
            type: config.type,
            concept,
            originalSign,
            errorSign,
            description,
            severity: config.severity,
            timestamp: new Date(),
            correctionHints,
            pedagogicalNote,
            canBeRepeated: Math.random() < 0.3, // 30% chance de répéter l'erreur
            relatedConcepts: this.getRelatedConcepts(concept)
        };
    }

    private generateErrorSign(errorType: LSFErrorType, originalSign: string): string {
        // Simulation simplifiée - dans une vraie implémentation, 
        // ceci utiliserait une base de données de signes et de variantes
        
        switch (errorType) {
            case LSFErrorType.HAND_SHAPE_ERROR:
                return `${originalSign}_wrong_handshape`;
            case LSFErrorType.MOVEMENT_ERROR:
                return `${originalSign}_wrong_movement`;
            case LSFErrorType.PLACEMENT_ERROR:
                return `${originalSign}_wrong_placement`;
            case LSFErrorType.ORIENTATION_ERROR:
                return `${originalSign}_wrong_orientation`;
            case LSFErrorType.FACIAL_EXPRESSION_ERROR:
                return `${originalSign}_wrong_expression`;
            case LSFErrorType.SYNTAX_ERROR:
                return `WRONG_ORDER_${originalSign}`;
            case LSFErrorType.SIGN_CONFUSION:
                return `${originalSign}_confused_with_similar`;
            default:
                return `${originalSign}_generic_error`;
        }
    }

    private generateErrorDescription(errorType: LSFErrorType, original: string, error: string): string {
        const descriptions: Record<LSFErrorType, string> = {
            [LSFErrorType.HAND_SHAPE_ERROR]: `Configuration de main incorrecte pour "${original}" (produit "${error}")`,
            [LSFErrorType.MOVEMENT_ERROR]: `Mouvement mal exécuté pour "${original}" (devient "${error}")`,
            [LSFErrorType.PLACEMENT_ERROR]: `Placement spatial incorrect pour le signe "${original}"`,
            [LSFErrorType.ORIENTATION_ERROR]: `Orientation de main incorrecte pour le signe "${original}"`,
            [LSFErrorType.FACIAL_EXPRESSION_ERROR]: `Expression faciale inappropriée accompagnant "${original}"`,
            [LSFErrorType.HEAD_MOVEMENT_ERROR]: `Mouvement de tête incorrect avec le signe "${original}"`,
            [LSFErrorType.EYE_GAZE_ERROR]: `Direction du regard incorrecte pour "${original}"`,
            [LSFErrorType.SYNTAX_ERROR]: `Ordre syntaxique incorrect incluant le signe "${original}"`,
            [LSFErrorType.TEMPORAL_ERROR]: `Marquage temporel incorrect pour "${original}"`,
            [LSFErrorType.MODAL_ERROR]: `Modalité incorrecte avec le signe "${original}"`,
            [LSFErrorType.SIGN_CONFUSION]: `Confusion entre "${original}" et un signe similaire`,
            [LSFErrorType.NEOLOGISM]: `Création d'un signe inexistant à partir de "${original}"`,
            [LSFErrorType.REGIONAL_VARIANT]: `Utilisation d'une variante régionale de "${original}"`,
            [LSFErrorType.REFERENCE_ERROR]: `Référence spatiale incorrecte pour "${original}"`,
            [LSFErrorType.COHESION_ERROR]: `Manque de cohésion discursive avec "${original}"`,
            [LSFErrorType.PRAGMATIC_ERROR]: `Usage pragmatiquement incorrect de "${original}"`
        };

        return descriptions[errorType] || `Erreur non spécifiée pour "${original}"`;
    }

    private generateCorrectionHints(errorType: LSFErrorType, original: string, error: string): string[] {
        const hints: Record<LSFErrorType, string[]> = {
            [LSFErrorType.HAND_SHAPE_ERROR]: [
                'Vérifiez la configuration exacte des doigts',
                'Observez attentivement la forme de la main dans le modèle',
                'Pratiquez la forme isolément avant le mouvement'
            ],
            [LSFErrorType.MOVEMENT_ERROR]: [
                'Décomposez le mouvement en étapes plus petites',
                'Pratiquez le mouvement lentement d\'abord',
                'Vérifiez les points de départ et d\'arrivée'
            ],
            [LSFErrorType.PLACEMENT_ERROR]: [
                'Repérez les points de référence corporels',
                'Utilisez un miroir pour vérifier la position',
                'Pensez aux relations spatiales avec votre corps'
            ],
            [LSFErrorType.ORIENTATION_ERROR]: ['Vérifiez l\'orientation de la main', 'Attention aux angles'],
            [LSFErrorType.FACIAL_EXPRESSION_ERROR]: ['Travaillez l\'expression faciale', 'Regardez votre visage'],
            [LSFErrorType.HEAD_MOVEMENT_ERROR]: ['Contrôlez les mouvements de tête', 'Synchronisez avec les mains'],
            [LSFErrorType.EYE_GAZE_ERROR]: ['Dirigez correctement le regard', 'Utilisez les yeux pour la référence'],
            [LSFErrorType.SYNTAX_ERROR]: [
                'Revoyez l\'ordre canonique des éléments en LSF',
                'Identifiez le sujet, le verbe et les compléments',
                'Pratiquez avec des phrases simples d\'abord'
            ],
            [LSFErrorType.TEMPORAL_ERROR]: ['Vérifiez les marqueurs temporels', 'Attention à la chronologie'],
            [LSFErrorType.MODAL_ERROR]: ['Revoyez les modalités', 'Précisez l\'intention'],
            [LSFErrorType.SIGN_CONFUSION]: ['Distinguez les signes similaires', 'Pratiquez les différences'],
            [LSFErrorType.NEOLOGISM]: ['Utilisez les signes existants', 'Vérifiez le lexique'],
            [LSFErrorType.REGIONAL_VARIANT]: ['Apprenez la variante standard', 'Notez les différences régionales'],
            [LSFErrorType.REFERENCE_ERROR]: ['Clarifiez les références spatiales', 'Utilisez l\'espace correctement'],
            [LSFErrorType.COHESION_ERROR]: ['Améliorez la cohésion', 'Liez mieux vos idées'],
            [LSFErrorType.PRAGMATIC_ERROR]: ['Adaptez au contexte', 'Considérez la situation']
        };

        const baseHints = hints[errorType] || [
            'Observez attentivement le modèle',
            'Pratiquez lentement et avec précision',
            'Demandez des clarifications si nécessaire'
        ];
        
        // Ajouter des conseils spécifiques basés sur l'erreur produite
        if (error !== original) {
            baseHints.push(`Distinguez "${original}" de "${error}"`);
        }
        
        return baseHints;
    }

    private generatePedagogicalNote(errorType: LSFErrorType, level: CECRLLevel): string {
        const baseNotes: Record<LSFErrorType, string> = {
            [LSFErrorType.HAND_SHAPE_ERROR]: 'Erreur typique des débutants. Nécessite pratique répétée.',
            [LSFErrorType.MOVEMENT_ERROR]: 'Souvent liée à la motricité fine. Patience requise.',
            [LSFErrorType.PLACEMENT_ERROR]: 'Erreur spatiale commune. Travail de repérage nécessaire.',
            [LSFErrorType.ORIENTATION_ERROR]: 'Détail technique important. Attention aux angles.',
            [LSFErrorType.FACIAL_EXPRESSION_ERROR]: 'Aspect non-manuel crucial en LSF.',
            [LSFErrorType.HEAD_MOVEMENT_ERROR]: 'Coordination tête-mains à améliorer.',
            [LSFErrorType.EYE_GAZE_ERROR]: 'Le regard est porteur de sens en LSF.',
            [LSFErrorType.SYNTAX_ERROR]: 'Indique une phase normale d\'acquisition grammaticale.',
            [LSFErrorType.TEMPORAL_ERROR]: 'Marquage temporel à préciser.',
            [LSFErrorType.MODAL_ERROR]: 'Nuance modale à affiner.',
            [LSFErrorType.SIGN_CONFUSION]: 'Confusion lexicale typique.',
            [LSFErrorType.NEOLOGISM]: 'Créativité mal placée, revoir le lexique.',
            [LSFErrorType.REGIONAL_VARIANT]: 'Variation dialectale à noter.',
            [LSFErrorType.REFERENCE_ERROR]: 'Gestion de l\'espace à améliorer.',
            [LSFErrorType.COHESION_ERROR]: 'Liens discursifs à renforcer.',
            [LSFErrorType.PRAGMATIC_ERROR]: 'Erreur avancée, montre une bonne maîtrise technique.'
        };

        const levelNotes: Record<CECRLLevel, string> = {
            'A1': ' Normal pour ce niveau, encourager la persévérance.',
            'A2': ' Commun à ce stade, focus sur la précision.',
            'B1': ' Erreur intermédiaire, réviser les bases.',
            'B2': ' Inattendu pour ce niveau, investigation recommandée.',
            'C1': ' Erreur rare, probablement due à la fatigue.',
            'C2': ' Très inhabituel, peut indiquer un problème spécifique.'
        };

        const baseNote = baseNotes[errorType] || 'Erreur à analyser individuellement.';
        const levelNote = levelNotes[level] || '';

        return baseNote + levelNote;
    }

    private getRelatedConcepts(concept: string): string[] {
        // Simulation simplifiée - dans une vraie implémentation,
        // ceci utiliserait une base de connaissances sémantiques
        const conceptFamilies: Record<string, string[]> = {
            'salutations': ['bonjour', 'bonsoir', 'au_revoir', 'à_bientôt'],
            'famille': ['mère', 'père', 'enfant', 'grand_parent'],
            'couleurs': ['rouge', 'bleu', 'vert', 'jaune'],
            'temps': ['hier', 'aujourd_hui', 'demain', 'semaine']
        };

        for (const [family, concepts] of Object.entries(conceptFamilies)) {
            if (concepts.includes(concept)) {
                console.log(`Concept trouvé dans la famille: ${family}`);
                return concepts.filter(c => c !== concept);
            }
        }

        return [];
    }

    // ==================== MÉTHODES PUBLIQUES UTILITAIRES ====================

    /**
     * Obtient les statistiques d'erreurs pour un apprenant
     */
    public getErrorStats(learnerId: string): {
        totalErrors: number;
        errorsByType: Record<LSFErrorType, number>;
        averageCorrectability: number;
        improvementTrend: number;
    } {
        const history = this.errorHistory.get(learnerId) || [];
        
        if (history.length === 0) {
            return {
                totalErrors: 0,
                errorsByType: {} as Record<LSFErrorType, number>,
                averageCorrectability: 0,
                improvementTrend: 0
            };
        }

        const errorsByType: Record<LSFErrorType, number> = {} as Record<LSFErrorType, number>;
        let totalCorrectability = 0;

        history.forEach(error => {
            errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
            const config = this.errorConfigs.get(error.type);
            if (config) {
                totalCorrectability += config.correctabilityRate;
            }
        });

        // Calculer la tendance d'amélioration (simplifiée)
        const recentErrors = history.slice(-10);
        const olderErrors = history.slice(-20, -10);
        const improvementTrend = olderErrors.length > 0 ? 
            (olderErrors.length - recentErrors.length) / olderErrors.length : 0;

        return {
            totalErrors: history.length,
            errorsByType,
            averageCorrectability: totalCorrectability / history.length,
            improvementTrend
        };
    }

    /**
     * Réinitialise l'historique d'erreurs pour un apprenant
     */
    public resetErrorHistory(learnerId: string): void {
        this.errorHistory.delete(learnerId);
        this.logger.info('🔄 Historique d\'erreurs réinitialisé', { learnerId });
    }

    /**
     * Configure un nouveau type d'erreur personnalisé
     */
    public addCustomErrorConfig(config: ErrorConfig): void {
        this.errorConfigs.set(config.type, config);
        this.logger.info('➕ Configuration d\'erreur personnalisée ajoutée', { 
            type: config.type 
        });
    }

    /**
     * Obtient la configuration d'un type d'erreur
     */
    public getErrorConfig(errorType: LSFErrorType): ErrorConfig | undefined {
        return this.errorConfigs.get(errorType);
    }

    /**
     * Liste tous les types d'erreurs disponibles pour un niveau
     */
    public getAvailableErrorTypes(level: CECRLLevel): LSFErrorType[] {
        const available: LSFErrorType[] = [];
        
        this.errorConfigs.forEach((config, type) => {
            if (this.isErrorApplicableToLevel(config, level)) {
                available.push(type);
            }
        });

        return available;
    }
}