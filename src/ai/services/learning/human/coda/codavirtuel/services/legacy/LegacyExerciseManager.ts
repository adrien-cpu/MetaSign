/**
 * @file src/ai/services/learning/human/coda/codavirtuel/services/legacy/LegacyExerciseManager.ts
 * @description Gestionnaire spécialisé pour les exercices legacy
 * 
 * Fonctionnalités :
 * - 🎯 Génération d'exercices adaptés legacy
 * - 📊 Cache intelligent d'exercices
 * - 🔄 Support mode CODA avec exercices d'enseignement
 * - ✨ Compatible exactOptionalPropertyTypes: true
 * - 🔧 Module < 300 lignes
 * 
 * @module legacy
 * @version 1.0.0 - Gestionnaire d'exercices refactorisé
 * @since 2025
 * @author MetaSign Team - CODA Legacy Exercise Management
 * @lastModified 2025-08-03
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';

// Imports des services legacy
import { ExerciseGeneratorService } from '../../exercises/ExerciseGeneratorService';
import { ExerciseAdapter } from '../../adapters/ExerciseAdapter';

// Imports des services mock (fallback)
import {
    MockExerciseGeneratorService,
    MockExerciseAdapter,
    warnIfMockMode
} from './MockServices';

// Imports des types harmonisés
import type {
    UserReverseProfile,
    UserAdaptedExercise,
    ExerciseGenerationParams,
    ReverseApprenticeshipOptions,
    CECRLLevel,
    CulturalEnvironment
} from '../../types/index';

// Import type pour l'orchestrateur de sessions
import type { CODASessionOrchestrator } from '../CODASessionOrchestrator';

/**
 * Interface unifiée pour les exercices générés (compatible avec tous les services)
 */
interface GeneratedExercise {
    readonly id: string;
    readonly type: string;
    readonly content: Record<string, unknown>;
    readonly level: string;
    readonly difficulty: number;
}

/**
 * Interface pour BaseExercise compatible
 */
interface BaseExercise {
    readonly id: string;
    readonly type: string;
    readonly content: Record<string, unknown>;
    readonly level: string;
    readonly difficulty: number;
}

/**
 * Données de l'IA-élève pour exercices CODA
 */
interface CODAStudentData {
    readonly id: string;
    readonly name: string;
    readonly personality: string;
    readonly currentLevel: CECRLLevel;
    readonly culturalContext: CulturalEnvironment;
    readonly mood: string;
    readonly weaknesses: readonly string[];
    readonly strengths: readonly string[];
    readonly learningPreferences: readonly string[];
}

/**
 * Gestionnaire spécialisé pour les exercices legacy
 * 
 * @class LegacyExerciseManager
 * @description Gère la génération, l'adaptation et le cache des exercices
 * legacy avec support CODA et paramètres enrichis.
 */
export class LegacyExerciseManager {
    /**
     * Logger pour le gestionnaire d'exercices
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('LegacyExerciseManager');

    /**
     * Service de génération d'exercices legacy
     * @private
     * @readonly
     */
    private readonly exerciseGenerator: ExerciseGeneratorService | MockExerciseGeneratorService;

    /**
     * Adaptateur d'exercices legacy
     * @private
     * @readonly
     */
    private readonly exerciseAdapter: ExerciseAdapter | MockExerciseAdapter;

    /**
     * Cache des exercices générés
     * @private
     */
    private readonly exerciseCache = new Map<string, UserAdaptedExercise>();

    /**
     * Cache des profils utilisateur
     * @private
     */
    private readonly profileCache = new Map<string, UserReverseProfile>();

    /**
     * Constructeur du gestionnaire d'exercices legacy
     * 
     * @constructor
     * @param {ReverseApprenticeshipOptions} options - Options du système
     * @param {CODASessionOrchestrator} sessionOrchestrator - Orchestrateur de sessions
     */
    constructor(
        private readonly options: ReverseApprenticeshipOptions,
        private readonly sessionOrchestrator: CODASessionOrchestrator
    ) {
        // Initialiser avec fallback vers les services mock si nécessaire
        try {
            this.exerciseGenerator = ExerciseGeneratorService.getInstance();
        } catch (error) {
            this.logger.warn('ExerciseGeneratorService non disponible, utilisation du service mock', { error });
            this.exerciseGenerator = MockExerciseGeneratorService.getInstance();
        }

        try {
            this.exerciseAdapter = new ExerciseAdapter();
        } catch (error) {
            this.logger.warn('ExerciseAdapter non disponible, utilisation du service mock', { error });
            this.exerciseAdapter = new MockExerciseAdapter();
        }

        // Avertir si les services mock sont utilisés
        warnIfMockMode();

        this.logger.info('🎯 LegacyExerciseManager initialisé', {
            codaMode: this.options.codaMode,
            adaptiveDifficulty: this.options.adaptiveDifficulty,
            usingMockExerciseGenerator: this.exerciseGenerator instanceof MockExerciseGeneratorService,
            usingMockExerciseAdapter: this.exerciseAdapter instanceof MockExerciseAdapter
        });
    }

    /**
     * Génère un exercice adapté avec paramètres enrichis
     * 
     * @method generateExercise
     * @async
     * @param {string} userId - Identifiant utilisateur
     * @param {Partial<ExerciseGenerationParams>} [customParams] - Paramètres personnalisés
     * @returns {Promise<UserAdaptedExercise>} Exercice généré et optimisé
     * @public
     */
    public async generateExercise(
        userId: string,
        customParams?: Partial<ExerciseGenerationParams>
    ): Promise<UserAdaptedExercise> {
        // Si mode CODA et session active, générer exercice d'enseignement
        if (this.options.codaMode && this.sessionOrchestrator.getAIStudentStatus(userId)) {
            return await this.generateCODATeachingExercise(userId, customParams);
        }

        // Obtenir le profil utilisateur avec gestion unifiée null/undefined
        const userProfile = await this.getUserProfileSafe(userId);
        if (!userProfile) {
            throw new Error(`Profil utilisateur non trouvé: ${userId}`);
        }

        // Créer paramètres d'exercice enrichis
        const generationParams = this.createEnhancedGenerationParams(
            userProfile,
            customParams,
            userId
        );

        // Générer l'exercice via le service legacy
        const rawExercise = await this.exerciseGenerator.generateExercise(generationParams);

        // Conversion vers le type unifié pour compatibilité
        const exercise: GeneratedExercise = {
            id: rawExercise.id,
            type: rawExercise.type,
            content: rawExercise.content as Record<string, unknown>,
            level: rawExercise.level,
            difficulty: rawExercise.difficulty
        };

        // Simuler erreurs si configuré
        const simulateErrors = Math.random() < (this.options.errorSimulationRate || 0);

        // Adapter l'exercice avec conversion de type sécurisée
        const adaptedExercise = await this.exerciseAdapter.adaptExercise(
            this.convertGeneratedExerciseToBase(exercise),
            userProfile,
            simulateErrors,
            this.options.errorSimulationRate
        );

        // Créer exercice utilisateur adapté avec tous les champs requis
        // ✅ Créer des paramètres compatibles avec UserAdaptedExercise.generationParams
        const compatibleGenerationParams = {
            type: generationParams.type,
            level: generationParams.level,
            difficulty: generationParams.difficulty,
            focusAreas: generationParams.focusAreas || [], // ✅ Toujours défini comme readonly string[]
            userId: generationParams.userId || userId
        };

        const userAdaptedExercise: UserAdaptedExercise = {
            ...adaptedExercise,
            generationParams: compatibleGenerationParams,
            errorsSimulated: simulateErrors,
            targetedSkills: [...(generationParams.focusAreas || [])]
        };

        // Mettre en cache
        this.exerciseCache.set(exercise.id, userAdaptedExercise);

        this.logger.info('✨ Exercice généré avec succès', {
            userId,
            exerciseId: exercise.id,
            type: exercise.type,
            level: generationParams.level,
            errorsSimulated: simulateErrors,
            targetedSkills: userAdaptedExercise.targetedSkills.length
        });

        return userAdaptedExercise;
    }

    /**
     * Obtient un exercice par son ID avec conversion vers type unifié
     * 
     * @method getExerciseById
     * @async
     * @param {string} exerciseId - Identifiant de l'exercice
     * @returns {Promise<GeneratedExercise | null>} Exercice trouvé ou null
     * @public
     */
    public async getExerciseById(exerciseId: string): Promise<GeneratedExercise | null> {
        try {
            const exercise = await this.exerciseGenerator.getExerciseById(exerciseId);
            if (!exercise) {
                return null;
            }

            // Conversion vers le type unifié
            return {
                id: exercise.id,
                type: exercise.type,
                content: exercise.content as Record<string, unknown>,
                level: exercise.level,
                difficulty: exercise.difficulty
            };
        } catch (error) {
            this.logger.warn('Exercice non trouvé', { exerciseId, error });
            return null;
        }
    }

    /**
     * Met en cache un profil utilisateur
     * 
     * @method cacheUserProfile
     * @param {UserReverseProfile} profile - Profil à mettre en cache
     * @public
     */
    public cacheUserProfile(profile: UserReverseProfile): void {
        this.profileCache.set(profile.userId, profile);
    }

    /**
     * Nettoie les ressources et cache
     * 
     * @method destroy
     * @async
     * @returns {Promise<void>}
     * @public
     */
    public async destroy(): Promise<void> {
        this.exerciseCache.clear();
        this.profileCache.clear();

        this.logger.info('🧹 LegacyExerciseManager détruit et caches nettoyés');
    }

    // ==================== MÉTHODES PRIVÉES ====================

    /**
     * Crée des paramètres de génération enrichis
     * ✅ Corrige l'erreur : méthode manquante
     */
    private createEnhancedGenerationParams(
        userProfile: UserReverseProfile,
        customParams?: Partial<ExerciseGenerationParams>,
        userId?: string
    ): ExerciseGenerationParams {
        // Garantir que focusAreas est toujours défini
        const focusAreas = customParams?.focusAreas || userProfile.weaknesses.slice(0, 3);

        return {
            type: customParams?.type || 'standard_exercise',
            level: customParams?.level || userProfile.currentLevel,
            difficulty: customParams?.difficulty || 0.5,
            focusAreas: [...focusAreas], // ✅ Toujours défini comme readonly string[]
            userId: userId || userProfile.userId,
            culturalContext: customParams?.culturalContext || userProfile.culturalBackground,
            aiPersonality: customParams?.aiPersonality || 'encouraging_mentor',
            teachingMethod: customParams?.teachingMethod || 'interactive'
        };
    }

    /**
     * Génère un exercice d'enseignement CODA
     */
    private async generateCODATeachingExercise(
        userId: string,
        customParams?: Partial<ExerciseGenerationParams>
    ): Promise<UserAdaptedExercise> {
        const aiStudent = this.sessionOrchestrator.getAIStudentStatus(userId);
        if (!aiStudent) {
            throw new Error(`Aucune IA-élève trouvée pour l'utilisateur: ${userId}`);
        }

        // Conversion sécurisée
        const aiStudentData = this.convertToStudentData(aiStudent);
        const weakness = aiStudentData.weaknesses[0] || 'basic_concepts';

        // Garantir que focusAreas est défini
        const focusAreas: readonly string[] = [weakness, ...(customParams?.focusAreas || [])];

        const generationParams: ExerciseGenerationParams = {
            type: 'teaching_session',
            level: aiStudentData.currentLevel,
            difficulty: customParams?.difficulty || 0.5,
            focusAreas, // ✅ Toujours défini
            userId,
            culturalContext: aiStudentData.culturalContext,
            aiPersonality: 'encouraging_mentor',
            teachingMethod: 'demonstration'
        };

        // ✅ Créer des paramètres compatibles avec UserAdaptedExercise.generationParams
        const compatibleGenerationParams = {
            type: generationParams.type,
            level: generationParams.level,
            difficulty: generationParams.difficulty,
            focusAreas: generationParams.focusAreas || [], // ✅ Toujours défini comme readonly string[]
            userId: generationParams.userId || userId
        };

        return {
            id: `coda_teach_${userId}_${Date.now()}`,
            type: 'teaching_session',
            content: {
                instruction: `Enseignez à ${aiStudentData.name} le concept : ${weakness}`,
                aiStudentInfo: {
                    name: aiStudentData.name,
                    level: aiStudentData.currentLevel,
                    mood: aiStudentData.mood,
                    personality: aiStudentData.personality
                },
                suggestedApproach: 'Démonstration visuelle claire + pratique guidée',
                expectedDuration: 15,
                targetConcepts: [weakness]
            },
            generationParams: compatibleGenerationParams,
            errorsSimulated: false,
            targetedSkills: [weakness, 'mentoring_skills', 'patience']
        };
    }

    /**
     * Obtient un profil utilisateur de manière sécurisée
     */
    private async getUserProfileSafe(userId: string): Promise<UserReverseProfile | null> {
        // Vérifier le cache local d'abord
        const cachedProfile = this.profileCache.get(userId);
        if (cachedProfile) {
            return cachedProfile;
        }

        // Note: Dans un vrai système, nous appellerions le ProfileManager
        // Pour cet exemple, nous simulons un profil par défaut
        return this.createDefaultProfile(userId);
    }

    /**
     * Crée un profil par défaut pour les tests
     */
    private createDefaultProfile(userId: string): UserReverseProfile {
        return {
            userId,
            currentLevel: 'A1',
            strengths: ['motivation'],
            weaknesses: ['basic_vocabulary'],
            learningPreferences: ['visual', 'interactive'],
            progressHistory: [],
            culturalBackground: 'deaf_family_home',
            motivationFactors: ['personal_growth'],
            learningStyle: 'visual',
            sessionCount: 0,
            totalLearningTime: 0,
            lastActivity: new Date()
        };
    }

    /**
     * Convertit un GeneratedExercise vers BaseExercise pour compatibilité
     * ✅ Corrige l'incompatibilité de types
     */
    private convertGeneratedExerciseToBase(exercise: GeneratedExercise): BaseExercise {
        return {
            id: exercise.id,
            type: exercise.type,
            content: exercise.content,
            level: exercise.level,
            difficulty: exercise.difficulty
        };
    }

    /**
     * Convertit les données d'IA-élève de manière sécurisée
     */
    private convertToStudentData(aiStudent: unknown): CODAStudentData {
        // Conversion contrôlée avec interface typée
        const student = aiStudent as {
            id?: string;
            name?: string;
            personality?: string;
            currentLevel?: string;
            culturalContext?: string;
            mood?: string;
            weaknesses?: string[];
            challenges?: string[];
            strengths?: string[];
            learningPreferences?: string[];
            preferences?: string[];
        };

        return {
            id: student.id || 'unknown',
            name: student.name || 'AI Student',
            personality: student.personality || 'curious_student',
            currentLevel: this.mapStringToCECRLLevel(student.currentLevel || 'A1'),
            culturalContext: this.mapStringToCulturalEnvironment(student.culturalContext || 'deaf_family_home'),
            mood: student.mood || 'neutral',
            weaknesses: student.weaknesses || student.challenges || ['basic_concepts'],
            strengths: student.strengths || ['enthusiasm'],
            learningPreferences: student.learningPreferences || student.preferences || ['visual']
        };
    }

    /**
     * Mappe une chaîne vers un niveau CECRL valide
     */
    private mapStringToCECRLLevel(level: string): CECRLLevel {
        const validLevels: CECRLLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        return validLevels.includes(level as CECRLLevel) ? level as CECRLLevel : 'A1';
    }

    /**
     * Mappe une chaîne vers un environnement culturel valide
     */
    private mapStringToCulturalEnvironment(culture: string): CulturalEnvironment {
        const validEnvironments: CulturalEnvironment[] = [
            'deaf_family_home', 'mixed_hearing_family', 'school_environment',
            'community_center', 'online_learning', 'deaf_school',
            'deaf_community_center', 'deaf_workplace'
        ];
        return validEnvironments.includes(culture as CulturalEnvironment)
            ? culture as CulturalEnvironment
            : 'deaf_family_home';
    }
}