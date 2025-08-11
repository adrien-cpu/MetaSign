/**
 * @file src/ai/services/learning/interfaces/Utils.ts
 * @description Utilitaires de validation et exemples d'utilisation des interfaces LSF
 * Version corrigée avec imports corrects
 * Compatible avec exactOptionalPropertyTypes: true
 * @module InterfacesUtils
 * @version 3.0.0
 * @since 2025-01-15
 * @author MetaSign Team
 * 
 * @example
 * ```typescript
 * import { validateInterfaceStructure, createExampleData } from './Utils';
 * 
 * const isValid = validateInterfaceStructure();
 * const examples = createExampleData();
 * ```
 */

// ================================
// IMPORTS CORRECTS DEPUIS LES BONS FICHIERS
// ================================

// Types de base depuis CoreLearningInterfaces
import type {
    LearningProgress,
    LearningContext,
    CompetencyLevel,
    ModuleCategory,
    LSFEventType
} from './CoreLearningInterfaces';

// Types de contenu depuis LSFContentInterfaces
import type {
    LSFLearningModule,
    LSFBadge
} from './LSFContentInterfaces';

// Types d'analytics depuis AnalyticsInterfaces
import type {
    LSFSystemEvent,
    AnalyticsData
} from './AnalyticsInterfaces';

// Types de services depuis ServiceInterfaces
import type {
    ServiceOperationResult
} from './ServiceInterfaces';

// ================================
// TYPE GUARDS ET VALIDATEURS
// ================================

/**
 * Type guards pour LSF - Version corrigée avec types importés
 */
export const LSFTypeGuards = {
    /**
     * Vérifie si un objet est un module LSF valide
     */
    isLSFModule: (obj: unknown): obj is LSFLearningModule => {
        return obj !== null &&
            typeof obj === 'object' &&
            typeof (obj as Record<string, unknown>).id === 'string' &&
            typeof (obj as Record<string, unknown>).title === 'object' &&
            typeof ((obj as Record<string, unknown>).title as Record<string, unknown>).french === 'string' &&
            typeof (obj as Record<string, unknown>).category === 'string' &&
            typeof (obj as Record<string, unknown>).difficulty === 'number';
    },

    /**
     * Vérifie si un objet est un badge LSF valide
     */
    isLSFBadge: (obj: unknown): obj is LSFBadge => {
        return obj !== null &&
            typeof obj === 'object' &&
            typeof (obj as Record<string, unknown>).id === 'string' &&
            typeof (obj as Record<string, unknown>).title === 'string' &&
            typeof (obj as Record<string, unknown>).description === 'string' &&
            typeof (obj as Record<string, unknown>).difficulty === 'string';
    },

    /**
     * Vérifie si un objet est une progression d'apprentissage valide
     */
    isLearningProgress: (obj: unknown): obj is LearningProgress => {
        return obj !== null &&
            typeof obj === 'object' &&
            typeof (obj as Record<string, unknown>).userId === 'string' &&
            Array.isArray((obj as Record<string, unknown>).completedModules) &&
            typeof (obj as Record<string, unknown>).totalExperience === 'number' &&
            typeof (obj as Record<string, unknown>).level === 'number';
    },

    /**
     * Vérifie si un objet est un contexte d'apprentissage valide
     */
    isLearningContext: (obj: unknown): obj is LearningContext => {
        return obj !== null &&
            typeof obj === 'object' &&
            typeof (obj as Record<string, unknown>).sessionId === 'string' &&
            typeof (obj as Record<string, unknown>).userId === 'string' &&
            typeof (obj as Record<string, unknown>).userLevel === 'string';
    },

    /**
     * Vérifie si un objet est un événement système LSF valide
     */
    isLSFSystemEvent: (obj: unknown): obj is LSFSystemEvent => {
        return obj !== null &&
            typeof obj === 'object' &&
            typeof (obj as Record<string, unknown>).eventType === 'string' &&
            typeof (obj as Record<string, unknown>).userId === 'string' &&
            (obj as Record<string, unknown>).timestamp instanceof Date;
    }
} as const;

/**
 * Utilitaires de validation avancés
 */
export const LSFValidationUtils = {
    /**
     * Valide un pourcentage de progression
     */
    validateProgress: (progress: number): boolean => {
        return progress >= 0 && progress <= 100 && !isNaN(progress);
    },

    /**
     * Valide un niveau CECRL
     */
    validateLevel: (level: string): level is CompetencyLevel => {
        return ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level);
    },

    /**
     * Valide un identifiant de module
     */
    validateModuleId: (id: string): boolean => {
        return id.length > 0 && id.length <= 100 && /^[a-zA-Z0-9_-]+$/.test(id);
    },

    /**
     * Valide une catégorie de module
     */
    validateModuleCategory: (category: string): category is ModuleCategory => {
        const validCategories: readonly ModuleCategory[] = [
            'LSF_Débutant',
            'LSF_Intermédiaire',
            'LSF_Avancé',
            'LSF_Expert',
            'Culture_Sourde',
            'Histoire_LSF',
            'Linguistique_LSF'
        ];
        return validCategories.includes(category as ModuleCategory);
    },

    /**
     * Valide un type d'événement LSF
     */
    validateEventType: (eventType: string): eventType is LSFEventType => {
        const validEventTypes: readonly LSFEventType[] = [
            'module_started',
            'module_completed',
            'quiz_attempted',
            'exercise_completed',
            'badge_earned',
            'level_up',
            'skill_mastered',
            'daily_goal_reached',
            'streak_milestone',
            'assessment_completed',
            'content_rated',
            'collaboration_joined',
            'mentorship_requested'
        ];
        return validEventTypes.includes(eventType as LSFEventType);
    },

    /**
     * Valide une structure complète de données d'apprentissage
     */
    validateLearningData: (data: unknown): boolean => {
        if (!data || typeof data !== 'object') return false;

        const dataObj = data as Record<string, unknown>;
        return (
            typeof dataObj.userId === 'string' &&
            typeof dataObj.timestamp === 'object' &&
            dataObj.timestamp instanceof Date &&
            typeof dataObj.activity === 'string'
        );
    }
} as const;

/**
 * Utilitaires de conversion et formatage
 */
export const LSFConversionUtils = {
    /**
     * Convertit une progression en pourcentage
     */
    progressToPercentage: (progress: LearningProgress): number => {
        const totalModules = Object.keys(progress.moduleProgress).length;
        if (totalModules === 0) return 0;

        const completedModules = progress.completedModules.length;
        return Math.round((completedModules / totalModules) * 100);
    },

    /**
     * Convertit un niveau CECRL en progression numérique
     */
    levelToProgress: (level: CompetencyLevel): number => {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const index = levels.indexOf(level);
        return index >= 0 ? ((index + 1) / levels.length) * 100 : 0;
    },

    /**
     * Convertit l'expérience en niveau
     */
    experienceToLevel: (experience: number): number => {
        if (experience <= 0) return 1;
        return Math.floor(Math.sqrt(experience / 100)) + 1;
    },

    /**
     * Convertit un score en difficulté relative
     */
    scoreToDifficulty: (score: number): number => {
        if (score >= 90) return 1; // Très facile
        if (score >= 70) return 3; // Facile
        if (score >= 50) return 5; // Moyen
        if (score >= 30) return 7; // Difficile
        return 9; // Très difficile
    }
} as const;

/**
 * Utilitaires de debugging et formatage
 */
export const LSFDebugUtils = {
    /**
     * Formate une progression pour l'affichage
     */
    formatProgress: (progress: LearningProgress): string => {
        const percentage = LSFConversionUtils.progressToPercentage(progress);
        return `User ${progress.userId}: Level ${progress.level}, Experience ${progress.totalExperience} (${percentage}% complete)`;
    },

    /**
     * Formate un module pour l'affichage
     */
    formatModule: (module: LSFLearningModule): string => {
        return `Module ${module.id}: "${module.title.french}" (${module.category}, Difficulté: ${module.difficulty}/10)`;
    },

    /**
     * Formate un événement pour l'affichage
     */
    formatEvent: (event: LSFSystemEvent): string => {
        return `Event [${event.eventType}] - User: ${event.userId} at ${event.timestamp.toISOString()}`;
    },

    /**
     * Formate des données d'analytics
     */
    formatAnalytics: (analytics: AnalyticsData): string => {
        return `Analytics ${analytics.id}: ${analytics.dataType} from ${analytics.source} at ${analytics.timestamp.toISOString()}`;
    }
} as const;

/**
 * Constantes utilitaires
 */
export const LSF_UTILS_CONSTANTS = {
    MAX_PROGRESS: 100,
    MIN_PROGRESS: 0,
    DEFAULT_LEVEL: 'A1' as CompetencyLevel,
    CACHE_TTL: 3600000, // 1 heure
    MAX_MODULES_PER_PAGE: 20,
    MAX_DIFFICULTY: 10,
    MIN_DIFFICULTY: 1,
    DEFAULT_DIFFICULTY: 5,
    EXPERIENCE_PER_LEVEL: 100
} as const;

// ================================
// FONCTIONS UTILITAIRES PRINCIPALES
// ================================

/**
 * Vérifie si un objet implémente l'interface ServiceInterface
 */
export function implementsServiceInterface(obj: unknown): obj is { serviceName: string; version: string; initialize(): Promise<void> } {
    return obj !== null &&
        typeof obj === 'object' &&
        typeof (obj as Record<string, unknown>).serviceName === 'string' &&
        typeof (obj as Record<string, unknown>).version === 'string' &&
        typeof (obj as Record<string, unknown>).initialize === 'function';
}

/**
 * Vérifie si un objet implémente BaseService
 */
export function isBaseService(obj: unknown): boolean {
    return obj !== null &&
        typeof obj === 'object' &&
        typeof (obj as Record<string, unknown>).initialize === 'function' &&
        typeof (obj as Record<string, unknown>).destroy === 'function' &&
        typeof (obj as Record<string, unknown>).getHealth === 'function' &&
        typeof (obj as Record<string, unknown>).serviceName === 'string';
}

/**
 * Convertit un objet en service de base si possible
 */
export function toBaseService(obj: unknown): unknown | null {
    if (isBaseService(obj)) {
        return obj;
    }

    // Pour la compatibilité, retourne l'objet tel quel si les méthodes de base existent
    if (obj !== null && typeof obj === 'object') {
        const objRecord = obj as Record<string, unknown>;
        if (typeof objRecord.initialize === 'function') {
            return obj;
        }
    }

    return null;
}

/**
 * Crée des données d'exemple pour les tests
 */
export function createExampleData() {
    const exampleModule: LSFLearningModule = {
        id: 'lsf_basic_greetings',
        title: {
            french: 'Salutations de base en LSF',
            lsf: 'BONJOUR SALUER BASE'
        },
        description: 'Apprenez les salutations fondamentales en Langue des Signes Française',
        category: 'LSF_Débutant',
        difficulty: 2,
        prerequisites: [],
        status: 'available',
        progress: 0,
        estimatedTime: 30,
        skills: ['salutations', 'politesse', 'communication_de_base'],
        cecrLevel: 'A1',
        content: {
            sections: [],
            quizzes: [],
            exercises: [],
            resources: []
        }
    };

    const exampleProgress: LearningProgress = {
        userId: 'user_123',
        completedModules: ['lsf_basic_greetings'],
        moduleProgress: { 'lsf_basic_greetings': 100 },
        quizAttempts: {},
        exerciseAttempts: {},
        earnedBadges: ['first_module_completed'],
        totalExperience: 150,
        level: 2,
        lastActivityDate: new Date(),
        timeSpent: 45,
        currentModule: 'lsf_basic_expressions',
        interactionHistory: []
    };

    const exampleEvent: LSFSystemEvent = {
        eventType: 'module_completed',
        userId: 'user_123',
        timestamp: new Date(),
        eventData: {
            moduleId: 'lsf_basic_greetings',
            score: 95,
            timeSpent: 30
        }
    };

    return {
        module: exampleModule,
        progress: exampleProgress,
        event: exampleEvent
    };
}

/**
 * Valide la structure complète des interfaces
 */
export function validateInterfaceStructure(): boolean {
    try {
        const examples = createExampleData();

        const validations = [
            LSFTypeGuards.isLSFModule(examples.module),
            LSFTypeGuards.isLearningProgress(examples.progress),
            LSFTypeGuards.isLSFSystemEvent(examples.event),
            LSFValidationUtils.validateLevel('A1'),
            LSFValidationUtils.validateModuleCategory('LSF_Débutant'),
            LSFValidationUtils.validateEventType('module_completed')
        ];

        return validations.every(validation => validation === true);
    } catch (error) {
        console.error('Validation error:', error);
        return false;
    }
}

/**
 * Teste la création d'un résultat d'opération de service
 */
export function createServiceOperationResult<T>(
    success: boolean,
    data?: T,
    error?: string
): ServiceOperationResult<T> {
    return {
        success,
        data,
        error,
        metadata: {
            timestamp: new Date().toISOString(),
            source: 'LSF_Utils'
        }
    };
}

/**
 * Utilitaire pour créer des exemples d'analytics
 */
export function createExampleAnalytics(): AnalyticsData {
    return {
        id: `analytics_${Date.now()}`,
        timestamp: new Date(),
        source: 'LSF_LearningSystem',
        dataType: 'user_interaction',
        payload: {
            action: 'module_completion',
            moduleId: 'lsf_basic_greetings',
            userId: 'user_123',
            score: 95
        },
        metadata: {
            version: '3.0.0',
            environment: 'production'
        }
    };
}