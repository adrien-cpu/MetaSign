// src/types/learning-progression.ts

export type ModuleStatus = 'locked' | 'in-progress' | 'completed';

export interface LearningModule {
    id: string;
    title: string;
    description: string;
    category: 'Débutant' | 'Intermédiaire' | 'Avancé';
    difficulty: number;
    prerequisites?: string[]; // IDs des modules prérequis
    status: ModuleStatus;
    progress: number; // 0-100
    estimatedTime: number; // en minutes
    skills: string[];
    icon: React.ReactNode;
    href: string;
}

export interface UserLearningProgress {
    completedModules: string[];
    currentModule?: string;
    totalExperience: number;
    lastActivityDate: Date;
}

// Fonction utilitaire pour déterminer si un module peut être déverrouillé
export function canUnlockModule(
    module: LearningModule,
    userProgress: UserLearningProgress
): boolean {
    // Si pas de prérequis, le module est déverrouillé
    if (!module.prerequisites || module.prerequisites.length === 0) {
        return true;
    }

    // Vérifier si tous les prérequis sont complétés
    return module.prerequisites.every((prereqId: string) =>
        userProgress.completedModules.includes(prereqId)
    );
}

// Fonction pour calculer la progression globale
export function calculateOverallProgress(
    modules: LearningModule[],
    userProgress: UserLearningProgress
): number {
    const completedModulesCount = userProgress.completedModules.length;
    const totalModules = modules.length;

    return Math.round((completedModulesCount / totalModules) * 100);
}