/**
 * @file src/ai/services/learning/human/coda/codavirtuel/exercises/generators/SigningPracticeGenerator.ts
 * @description Générateur d'exercices de pratique de signes avec feedback en temps réel pour la LSF
 * @version 1.5.0
 * @author MetaSign AI Learning Team
 * @since 2025-05-26
 * @lastModified 2025-05-27
 */

import { BaseExerciseGenerator } from './BaseExerciseGenerator';
import { BaseExerciseParams, BaseEvaluationResult } from '../ExerciseGenerator.interface';
import { ConceptsDataService, LSFConcept, ConceptSearchCriteria } from '../services/ConceptsDataService';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Type union pour les niveaux CECRL valides
 */
export type CECRLLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Interface pour un élément interactif de l'exercice de pratique
 */
interface InteractiveElement {
    readonly name: string;
    readonly description: string;
    readonly tutorialSection: number;
    readonly enabled: boolean;
}

/**
 * Interface pour les options de contrôle de vitesse
 */
interface SpeedControlOptions {
    readonly options: readonly number[];
    readonly default: number;
    readonly allowCustom: boolean;
}

/**
 * Interface pour les options de feedback
 */
interface FeedbackOptions {
    readonly realTime: boolean;
    readonly delayed: boolean;
    readonly detailed: boolean;
    readonly simplified?: boolean;
}

/**
 * Interface pour une variation de pratique
 */
interface PracticeVariation {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly videoUrl: string;
    readonly difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
    readonly duration?: number;
    readonly requiresCompletion?: readonly string[];
    readonly tags: readonly string[];
}

/**
 * Interface pour les métriques de performance en temps réel
 */
interface PerformanceMetrics {
    readonly handConfiguration: boolean;
    readonly handOrientation: boolean;
    readonly movement: boolean;
    readonly facialExpression: boolean;
    readonly bodyPosture: boolean;
    readonly spatialUsage: boolean;
    readonly rhythm: boolean;
    readonly fluidity: boolean;
}

/**
 * Interface pour le contenu d'un exercice de pratique de signes
 */
interface SigningPracticeContent {
    readonly signToLearn: string;
    readonly tutorialVideoUrl: string;
    readonly referenceImageUrl?: string;
    readonly steps: readonly string[];
    readonly performanceMetrics: PerformanceMetrics;
    readonly feedbackMode: 'simple' | 'standard' | 'advanced';
    readonly interactiveElements: {
        readonly comparisonSide: boolean;
        readonly viewAngleSelector: boolean;
        readonly speedControl: SpeedControlOptions;
        readonly parameterFocus: readonly InteractiveElement[];
        readonly feedbackOptions: FeedbackOptions;
    };
    readonly practiceVariations: readonly PracticeVariation[];
    readonly recordingSettings: {
        readonly minDuration: number;
        readonly maxDuration: number;
        readonly autoStart: boolean;
        readonly countdown: boolean;
    };
}

/**
 * Interface pour un exercice de pratique de signes
 */
export interface SigningPracticeExercise {
    readonly id: string;
    readonly question: string;
    readonly content: SigningPracticeContent;
    readonly difficulty: number;
    readonly skills: readonly string[];
    readonly level: CECRLLevel;
    readonly tags: readonly string[];
    readonly explanation?: string;
    readonly timeLimit?: number;
    readonly requiredPeripherals: readonly string[];
}

/**
 * Interface pour les paramètres de génération d'exercices de pratique
 * Étend les paramètres de base avec des spécificités à la pratique de signes
 */
export interface SigningPracticeGeneratorParams extends Omit<BaseExerciseParams, 'focusAreas' | 'level'> {
    readonly level: CECRLLevel;
    readonly difficulty: number;
    readonly focusAreas?: readonly string[];
    readonly userId?: string;
    readonly conceptIds?: readonly string[];
    readonly feedbackMode?: 'simple' | 'standard' | 'advanced';
    readonly includeVariations?: boolean;
    readonly enableRealTimeFeedback?: boolean;
    readonly recordingRequired?: boolean;
}

/**
 * Interface pour le résultat d'évaluation d'un exercice de pratique
 * Étend le résultat de base avec des spécificités à la pratique de signes
 */
export interface SigningPracticeEvaluationResult extends BaseEvaluationResult {
    readonly performanceBreakdown: Readonly<Record<string, number>>;
    readonly improvementSuggestions: readonly string[];
    readonly recordingAnalysis?: {
        readonly duration: number;
        readonly qualityScore: number;
        readonly detectedErrors: readonly string[];
    };
}

/**
 * Interface pour les paramètres validés
 */
interface ValidatedSigningPracticeParams {
    readonly level: CECRLLevel;
    readonly difficulty: number;
    readonly focusAreas: readonly string[];
    readonly userId: string;
    readonly conceptIds: readonly string[];
    readonly feedbackMode: 'simple' | 'standard' | 'advanced';
    readonly includeVariations: boolean;
    readonly enableRealTimeFeedback: boolean;
    readonly recordingRequired: boolean;
}

/**
 * Générateur d'exercices de pratique de signes pour l'apprentissage de la LSF
 * 
 * @example
 * ```typescript
 * const conceptsService = new ConceptsDataService();
 * const generator = new SigningPracticeGenerator(conceptsService);
 * 
 * const params: SigningPracticeGeneratorParams = {
 *   level: 'A2',
 *   difficulty: 0.6,
 *   focusAreas: ['greetings', 'politeness'],
 *   enableRealTimeFeedback: true,
 *   recordingRequired: true
 * };
 * 
 * const exercise = await generator.generate(params);
 * ```
 */
export class SigningPracticeGenerator extends BaseExerciseGenerator {
    private readonly conceptsService: ConceptsDataService;
    private readonly logger: ReturnType<typeof LoggerFactory.getLogger>;

    /**
     * Constructeur du générateur d'exercices de pratique de signes
     * @param conceptsService Service de données pour les concepts LSF
     */
    constructor(conceptsService: ConceptsDataService) {
        super();
        this.conceptsService = conceptsService;
        this.logger = LoggerFactory.getLogger('SigningPracticeGenerator');
    }

    /**
     * Génère un exercice de pratique de signes
     * @param params Paramètres de génération
     * @returns Exercice de pratique généré
     */
    public async generate(params: SigningPracticeGeneratorParams): Promise<SigningPracticeExercise> {
        this.logger.info(`Generating signing practice exercise for level ${params.level}`);

        // Valider et définir les paramètres par défaut
        const validatedParams = this.validateAndDefaultParams(params);

        // Obtenir les concepts pour l'exercice
        const concepts = await this.getConcepts(validatedParams);

        if (concepts.length === 0) {
            throw new Error(`No concepts found for level ${validatedParams.level}`);
        }

        // Convertir readonly array en array mutable pour getRandomElement
        const conceptsArray = [...concepts];

        // Sélectionner le concept principal à pratiquer
        const targetConcept = this.getRandomElement(conceptsArray);

        // Sélectionner le signe spécifique à pratiquer
        const signToPractice = this.selectSignToPractice(targetConcept);

        // Générer le contenu de l'exercice
        const content = await this.generateExerciseContent(targetConcept, signToPractice, validatedParams);

        // Construire l'exercice
        const exercise: SigningPracticeExercise = {
            id: this.generateExerciseId('signing-practice'),
            question: this.generateQuestion(targetConcept, signToPractice),
            content,
            difficulty: validatedParams.difficulty,
            skills: this.determineSkills(validatedParams),
            level: validatedParams.level,
            tags: this.generateTags(validatedParams, targetConcept),
            explanation: await this.generateExplanation(targetConcept, signToPractice),
            timeLimit: this.calculateTimeLimit(validatedParams),
            requiredPeripherals: ['camera', 'microphone']
        };

        this.logger.debug(`Generated signing practice exercise for sign: ${signToPractice}`);
        return exercise;
    }

    /**
     * Évalue la réponse de l'utilisateur pour un exercice de pratique
     * @param exercise Exercice à évaluer
     * @param performanceData Données de performance de l'utilisateur
     * @returns Résultat de l'évaluation
     */
    public evaluate(
        exercise: SigningPracticeExercise,
        performanceData: Record<string, number>
    ): SigningPracticeEvaluationResult {
        // Calculer les scores par métrique
        const performanceBreakdown: Record<string, number> = {};
        const metrics = exercise.content.performanceMetrics;

        let totalScore = 0;
        let metricCount = 0;

        // Évaluer chaque métrique activée
        Object.entries(metrics).forEach(([metricName, enabled]) => {
            if (enabled) {
                const score = performanceData[metricName] || 0;
                performanceBreakdown[metricName] = score;
                totalScore += score;
                metricCount++;
            }
        });

        // Calculer le score global
        const globalScore = metricCount > 0 ? totalScore / metricCount : 0;

        // Générer les suggestions d'amélioration
        const improvementSuggestions = this.generateImprovementSuggestions(performanceBreakdown);

        // Convertir readonly array en array mutable pour la méthode héritée
        const skillsArray = [...exercise.skills];

        // Distribuer le score aux compétences
        const skillDetails = this.distributeScoreToSkills(skillsArray, globalScore, 0.15);

        // Générer le résultat de base
        const baseResult = this.generateBaseResult(
            globalScore >= 0.8, // Considéré comme correct si score >= 80%
            globalScore,
            exercise.difficulty,
            exercise.explanation,
            skillDetails
        );

        return {
            ...baseResult,
            performanceBreakdown,
            improvementSuggestions,
            recordingAnalysis: performanceData.recordingDuration ? {
                duration: performanceData.recordingDuration,
                qualityScore: performanceData.recordingQuality || 0.5,
                detectedErrors: this.analyzeCommonErrors(performanceBreakdown)
            } : undefined
        };
    }

    /**
     * Valide et définit les valeurs par défaut pour les paramètres
     * @param params Paramètres bruts
     * @returns Paramètres validés avec valeurs par défaut
     * @private
     */
    private validateAndDefaultParams(params: SigningPracticeGeneratorParams): ValidatedSigningPracticeParams {
        return {
            level: params.level,
            difficulty: this.validateDifficulty(params.difficulty),
            focusAreas: params.focusAreas ?? [],
            userId: params.userId ?? '',
            conceptIds: params.conceptIds ?? [],
            feedbackMode: params.feedbackMode ?? 'standard',
            includeVariations: params.includeVariations ?? true,
            enableRealTimeFeedback: params.enableRealTimeFeedback ?? true,
            recordingRequired: params.recordingRequired ?? true
        };
    }

    /**
     * Obtient les concepts nécessaires pour l'exercice
     * @param params Paramètres validés
     * @returns Liste de concepts LSF
     * @private
     */
    private async getConcepts(params: ValidatedSigningPracticeParams): Promise<readonly LSFConcept[]> {
        if (params.conceptIds.length > 0) {
            return await this.conceptsService.getConceptsByIds(params.conceptIds);
        }

        const searchCriteria: ConceptSearchCriteria = {
            level: params.level,
            categories: params.focusAreas.length > 0 ? params.focusAreas : undefined,
            maxDifficulty: params.difficulty
        };

        return await this.conceptsService.searchConcepts(searchCriteria);
    }

    /**
     * Sélectionne un signe spécifique à pratiquer à partir d'un concept
     * @param concept Concept LSF
     * @returns Signe à pratiquer
     * @private
     */
    private selectSignToPractice(concept: LSFConcept): string {
        // Utiliser le texte principal du concept comme signe à pratiquer
        return concept.text;
    }

    /**
     * Génère le contenu complet de l'exercice de pratique
     * @param concept Concept cible
     * @param sign Signe à pratiquer
     * @param params Paramètres validés
     * @returns Contenu de l'exercice
     * @private
     */
    private async generateExerciseContent(
        concept: LSFConcept,
        sign: string,
        params: ValidatedSigningPracticeParams
    ): Promise<SigningPracticeContent> {
        return {
            signToLearn: sign,
            tutorialVideoUrl: this.generateTutorialVideoUrl(concept, sign),
            referenceImageUrl: concept.imageUrl,
            steps: this.generatePracticeSteps(params.level, params.difficulty),
            performanceMetrics: this.getPerformanceMetrics(params.level),
            feedbackMode: params.feedbackMode,
            interactiveElements: this.generateInteractiveElements(params),
            practiceVariations: await this.generatePracticeVariations(concept, sign, params),
            recordingSettings: this.generateRecordingSettings(params)
        };
    }

    /**
     * Génère l'URL de la vidéo tutorielle
     * @param concept Concept LSF
     * @param sign Signe à pratiquer
     * @returns URL de la vidéo tutorielle
     * @private
     */
    private generateTutorialVideoUrl(concept: LSFConcept, sign: string): string {
        if (concept.videoUrl) {
            return concept.videoUrl;
        }

        // Générer une URL basée sur les conventions
        const normalizedSign = sign.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '_');
        const category = concept.categories[0] || 'general';

        return `/assets/tutorials/lsf/${category}/${normalizedSign}.mp4`;
    }

    /**
     * Génère les étapes de pratique selon le niveau et la difficulté
     * @param level Niveau CECRL
     * @param difficulty Difficulté numérique
     * @returns Liste des étapes de pratique
     * @private
     */
    private generatePracticeSteps(level: CECRLLevel, difficulty: number): readonly string[] {
        const baseSteps = [
            'Observez attentivement la vidéo tutorielle',
            'Identifiez la configuration des mains',
            'Notez le mouvement principal et sa direction',
            'Observez l\'expression faciale associée'
        ];

        const levelSteps: Record<CECRLLevel, readonly string[]> = {
            'A1': [
                'Pratiquez lentement la configuration des mains',
                'Répétez le mouvement plusieurs fois',
                'Enregistrez votre tentative'
            ],
            'A2': [
                'Pratiquez la configuration et le mouvement ensemble',
                'Ajoutez l\'expression faciale appropriée',
                'Répétez à vitesse normale',
                'Enregistrez votre performance'
            ],
            'B1': [
                'Pratiquez avec les expressions faciales',
                'Travaillez sur la fluidité du mouvement',
                'Intégrez dans une phrase simple',
                'Enregistrez votre performance'
            ],
            'B2': [
                'Maîtrisez toutes les composantes du signe',
                'Pratiquez les variations contextuelles',
                'Travaillez sur le rythme et la prosodie',
                'Enregistrez une performance complète'
            ],
            'C1': [
                'Perfectionnez tous les paramètres',
                'Pratiquez les nuances expressives',
                'Intégrez dans des discours complexes',
                'Enregistrez une démonstration experte'
            ],
            'C2': [
                'Maîtrisez les variations stylistiques',
                'Adaptez selon le registre de langue',
                'Démontrez une maîtrise native',
                'Enregistrez une performance de référence'
            ]
        };

        // Ajouter des étapes supplémentaires pour les difficultés élevées
        const difficultySteps = difficulty > 0.7 ? [
            'Analysez votre enregistrement en détail',
            'Comparez avec le modèle de référence',
            'Identifiez les points d\'amélioration'
        ] : [];

        return [
            ...baseSteps,
            ...(levelSteps[level] || levelSteps['A1']),
            ...difficultySteps
        ];
    }

    /**
     * Détermine les métriques de performance selon le niveau
     * @param level Niveau CECRL
     * @returns Métriques de performance activées
     * @private
     */
    private getPerformanceMetrics(level: CECRLLevel): PerformanceMetrics {
        const levelMetrics: Record<CECRLLevel, PerformanceMetrics> = {
            'A1': {
                handConfiguration: true,
                handOrientation: true,
                movement: true,
                facialExpression: false,
                bodyPosture: false,
                spatialUsage: false,
                rhythm: false,
                fluidity: false
            },
            'A2': {
                handConfiguration: true,
                handOrientation: true,
                movement: true,
                facialExpression: true,
                bodyPosture: false,
                spatialUsage: false,
                rhythm: false,
                fluidity: false
            },
            'B1': {
                handConfiguration: true,
                handOrientation: true,
                movement: true,
                facialExpression: true,
                bodyPosture: true,
                spatialUsage: true,
                rhythm: false,
                fluidity: true
            },
            'B2': {
                handConfiguration: true,
                handOrientation: true,
                movement: true,
                facialExpression: true,
                bodyPosture: true,
                spatialUsage: true,
                rhythm: true,
                fluidity: true
            },
            'C1': {
                handConfiguration: true,
                handOrientation: true,
                movement: true,
                facialExpression: true,
                bodyPosture: true,
                spatialUsage: true,
                rhythm: true,
                fluidity: true
            },
            'C2': {
                handConfiguration: true,
                handOrientation: true,
                movement: true,
                facialExpression: true,
                bodyPosture: true,
                spatialUsage: true,
                rhythm: true,
                fluidity: true
            }
        };

        return levelMetrics[level];
    }

    /**
     * Génère les éléments interactifs de l'exercice
     * @param params Paramètres validés
     * @returns Éléments interactifs configurés
     * @private
     */
    private generateInteractiveElements(params: ValidatedSigningPracticeParams) {
        const speedOptions = params.level === 'A1' ? [0.5, 0.75, 1.0] : [0.75, 1.0, 1.25];

        return {
            comparisonSide: true,
            viewAngleSelector: params.difficulty > 0.5,
            speedControl: {
                options: speedOptions,
                default: params.level === 'A1' ? 0.75 : 1.0,
                allowCustom: params.difficulty > 0.7
            },
            parameterFocus: [
                {
                    name: 'handConfiguration',
                    description: 'Focus sur la configuration des mains',
                    tutorialSection: 0,
                    enabled: true
                },
                {
                    name: 'movement',
                    description: 'Focus sur le mouvement du signe',
                    tutorialSection: 1,
                    enabled: true
                },
                {
                    name: 'facialExpression',
                    description: 'Focus sur les expressions faciales',
                    tutorialSection: 2,
                    enabled: params.level !== 'A1'
                }
            ],
            feedbackOptions: {
                realTime: params.enableRealTimeFeedback,
                delayed: true,
                detailed: params.feedbackMode === 'advanced',
                simplified: params.feedbackMode === 'simple'
            }
        };
    }

    /**
     * Génère les variations de pratique pour le signe
     * @param concept Concept LSF
     * @param sign Signe à pratiquer
     * @param params Paramètres validés
     * @returns Variations de pratique
     * @private
     */
    private async generatePracticeVariations(
        concept: LSFConcept,
        sign: string,
        params: ValidatedSigningPracticeParams
    ): Promise<readonly PracticeVariation[]> {
        if (!params.includeVariations) {
            return [];
        }

        const variations: PracticeVariation[] = [
            {
                id: 'isolated',
                title: 'Signe isolé',
                description: `Pratique du signe "${sign}" de façon isolée`,
                videoUrl: this.generateTutorialVideoUrl(concept, sign),
                difficulty: 'beginner',
                duration: 30,
                tags: ['basic', 'isolated']
            }
        ];

        // Ajouter des variations selon le niveau
        if (params.level !== 'A1') {
            variations.push({
                id: 'in_sentence',
                title: 'Dans une phrase',
                description: `Utilisation du signe "${sign}" dans une phrase simple`,
                videoUrl: `/assets/tutorials/lsf/sentences/${sign.replace(/\s+/g, '_')}.mp4`,
                difficulty: 'medium',
                duration: 60,
                requiresCompletion: ['isolated'],
                tags: ['sentence', 'context']
            });
        }

        if (params.difficulty > 0.6) {
            variations.push({
                id: 'dialogue',
                title: 'Dans un dialogue',
                description: `Pratique du signe "${sign}" dans un contexte conversationnel`,
                videoUrl: `/assets/tutorials/lsf/dialogues/${sign.replace(/\s+/g, '_')}.mp4`,
                difficulty: 'hard',
                duration: 90,
                requiresCompletion: ['isolated', 'in_sentence'],
                tags: ['dialogue', 'conversation', 'advanced']
            });
        }

        return variations;
    }

    /**
     * Génère les paramètres d'enregistrement
     * @param params Paramètres validés
     * @returns Paramètres d'enregistrement
     * @private
     */
    private generateRecordingSettings(params: ValidatedSigningPracticeParams) {
        return {
            minDuration: params.level === 'A1' ? 3 : 5,
            maxDuration: params.difficulty > 0.7 ? 30 : 15,
            autoStart: params.feedbackMode === 'simple',
            countdown: true
        };
    }

    /**
     * Génère une question appropriée pour l'exercice
     * @param concept Concept LSF
     * @param sign Signe à pratiquer
     * @returns Question de l'exercice
     * @private
     */
    private generateQuestion(concept: LSFConcept, sign: string): string {
        const questions = [
            `Pratiquez le signe pour "${sign}" en suivant les étapes proposées.`,
            `Apprenez à signer "${sign}" et enregistrez votre performance.`,
            `Maîtrisez le signe "${sign}" en vous concentrant sur chaque paramètre.`,
            `Démonstrez votre maîtrise du signe "${sign}" avec précision.`
        ];

        // Adapter selon le niveau
        const categoryContext = concept.categories.length > 0 ?
            ` Ce signe fait partie de la catégorie "${concept.categories[0]}".` : '';

        return this.getRandomElement(questions) + categoryContext;
    }

    /**
     * Détermine les compétences évaluées par l'exercice
     * @param params Paramètres validés
     * @returns Liste de compétences
     * @private
     */
    private determineSkills(params: ValidatedSigningPracticeParams): readonly string[] {
        const baseSkills = ['signing', 'motorSkills', 'visualMemory'];

        const levelSkills: Record<CECRLLevel, readonly string[]> = {
            'A1': ['basicSigning', 'handConfiguration'],
            'A2': ['basicSigning', 'handConfiguration', 'facialExpression'],
            'B1': ['intermediateSigning', 'spatialAwareness', 'expressiveSkills'],
            'B2': ['advancedSigning', 'prosodicSkills', 'contextualAdaptation'],
            'C1': ['expertSigning', 'culturalNuances', 'styleVariation'],
            'C2': ['nativeSigning', 'artisticExpression', 'linguisticMastery']
        };

        const skills = [...baseSkills, ...(levelSkills[params.level] || levelSkills['A1'])];

        if (params.focusAreas.length > 0) {
            skills.push(...params.focusAreas);
        }

        return [...new Set(skills)];
    }

    /**
     * Génère les tags pour l'exercice
     * @param params Paramètres validés
     * @param concept Concept LSF
     * @returns Liste de tags
     * @private
     */
    private generateTags(params: ValidatedSigningPracticeParams, concept: LSFConcept): readonly string[] {
        const tags = ['signing-practice', params.level, 'motor-skills', 'real-time'];

        if (params.enableRealTimeFeedback) tags.push('real-time-feedback');
        if (params.recordingRequired) tags.push('recording-required');
        if (params.includeVariations) tags.push('variations');

        tags.push(...concept.categories);

        return tags;
    }

    /**
     * Génère une explication pour l'exercice
     * @param concept Concept LSF
     * @param sign Signe à pratiquer
     * @returns Explication de l'exercice
     * @private
     */
    private async generateExplanation(concept: LSFConcept, sign: string): Promise<string> {
        return `Cet exercice vous permet de pratiquer le signe "${sign}" en temps réel avec feedback immédiat. ` +
            `Concentrez-vous sur la précision de chaque paramètre : configuration des mains, mouvement, ` +
            `orientation et expression faciale. ${concept.categories.length > 0 ?
                `Ce signe appartient à la catégorie "${concept.categories[0]}" et est essentiel pour ` +
                'une communication efficace en LSF.' : ''}`;
    }

    /**
     * Calcule la limite de temps pour l'exercice
     * @param params Paramètres validés
     * @returns Limite de temps en secondes
     * @private
     */
    private calculateTimeLimit(params: ValidatedSigningPracticeParams): number {
        const baseTime = 300; // 5 minutes de base
        const levelMultiplier: Record<CECRLLevel, number> = {
            'A1': 1.5, 'A2': 1.3, 'B1': 1.1, 'B2': 1.0, 'C1': 0.9, 'C2': 0.8
        };

        const difficultyMultiplier = 1 + (params.difficulty * 0.5);

        return Math.round(baseTime * levelMultiplier[params.level] * difficultyMultiplier);
    }

    /**
     * Génère un ID unique pour l'exercice
     * @param type Type d'exercice
     * @returns ID unique
     * @private
     */
    private generateExerciseId(type: string): string {
        return this.generateId(type);
    }

    /**
     * Génère des suggestions d'amélioration basées sur les performances
     * @param performanceBreakdown Détail des performances par métrique
     * @returns Suggestions d'amélioration
     * @private
     */
    private generateImprovementSuggestions(performanceBreakdown: Record<string, number>): readonly string[] {
        const suggestions: string[] = [];

        Object.entries(performanceBreakdown).forEach(([metric, score]) => {
            if (score < 0.6) {
                const metricSuggestions: Record<string, string> = {
                    handConfiguration: 'Travaillez sur la forme et la position de vos mains',
                    handOrientation: 'Attention à l\'orientation de vos paumes',
                    movement: 'Concentrez-vous sur la trajectoire et la vitesse du mouvement',
                    facialExpression: 'N\'oubliez pas les expressions faciales appropriées',
                    bodyPosture: 'Vérifiez votre posture corporelle',
                    spatialUsage: 'Travaillez sur l\'utilisation de l\'espace de signation',
                    rhythm: 'Pratiquez le rythme et le timing du signe',
                    fluidity: 'Travaillez sur la fluidité entre les mouvements'
                };

                if (metricSuggestions[metric]) {
                    suggestions.push(metricSuggestions[metric]);
                }
            }
        });

        if (suggestions.length === 0) {
            suggestions.push('Excellent travail ! Continuez à pratiquer pour maintenir votre niveau.');
        }

        return suggestions;
    }

    /**
     * Analyse les erreurs communes dans la performance
     * @param performanceBreakdown Détail des performances par métrique
     * @returns Liste des erreurs détectées
     * @private
     */
    private analyzeCommonErrors(performanceBreakdown: Record<string, number>): readonly string[] {
        const errors: string[] = [];

        if (performanceBreakdown.handConfiguration < 0.5) {
            errors.push('Configuration des mains incorrecte');
        }
        if (performanceBreakdown.movement < 0.5) {
            errors.push('Mouvement imprécis');
        }
        if (performanceBreakdown.facialExpression < 0.4) {
            errors.push('Expression faciale manquante ou inadéquate');
        }

        return errors;
    }
}