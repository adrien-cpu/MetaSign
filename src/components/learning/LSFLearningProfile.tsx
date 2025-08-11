/**
 * @file: src/app/components/learning/LSFLearningProfile.tsx
 * 
 * Gestionnaire de profil d'apprentissage pour l'application LSF.
 * Permet de suivre la progression, les objectifs et de générer des recommandations.
 */

// Types pour le profil d'apprentissage
export interface LearningMetric {
    label: string;
    value: string | number;
}

export interface LearningObjective {
    title: string;
    progress: number;
    description: string;
}

export interface SkillProgress {
    title: string;
    value: number;
    description?: string;
}

export interface UserLearningData {
    totalScore: number;
    level: string;
    learningHours: number;
    communityContribution: number;
    completedModules: number;
    totalModules: number;
    lastActivityDate: Date;
    streakDays: number;
    strengths: string[];
    weaknesses: string[];
}

/**
 * Gestionnaire de profil d'apprentissage LSF
 */
export class LSFLearningProfile {
    private userData: UserLearningData = {
        totalScore: 1540,
        level: "Avancé",
        learningHours: 120,
        communityContribution: 45,
        completedModules: 12,
        totalModules: 24,
        lastActivityDate: new Date(),
        streakDays: 7,
        strengths: ["Vocabulaire", "Expression faciale"],
        weaknesses: ["Grammaire spatiale", "Fluidité"]
    };

    private learningObjectives: LearningObjective[] = [
        {
            title: "Maîtrise Dialectale",
            progress: 60,
            description: "Comprendre les variations régionales de la LSF"
        },
        {
            title: "Certification Professionnelle",
            progress: 40,
            description: "Préparation à la certification d'interprète"
        },
        {
            title: "Fluidité Conversationnelle",
            progress: 75,
            description: "Améliorer la fluidité dans les conversations courantes"
        }
    ];

    private skillProgress: SkillProgress[] = [
        {
            title: "Expression LSF",
            value: 65,
            description: "Maîtrise des expressions gestuelles et faciales"
        },
        {
            title: "Compréhension Linguistique",
            value: 45,
            description: "Compréhension des nuances grammaticales et culturelles"
        },
        {
            title: "Interaction Communautaire",
            value: 55,
            description: "Engagement et pratique dans la communauté sourde"
        },
        {
            title: "Grammaire Spatiale",
            value: 35,
            description: "Maîtrise de l'utilisation de l'espace en LSF"
        }
    ];

    /**
     * Récupère le score total de l'utilisateur
     */
    public getTotalScore(): number {
        return this.userData.totalScore;
    }

    /**
     * Récupère les métriques clés d'apprentissage
     */
    public getKeyMetrics(): LearningMetric[] {
        return [
            {
                label: "Niveau",
                value: this.userData.level
            },
            {
                label: "Heures d'Apprentissage",
                value: this.userData.learningHours
            },
            {
                label: "Contribution Communautaire",
                value: `${this.userData.communityContribution}%`
            },
            {
                label: "Modules Complétés",
                value: `${this.userData.completedModules}/${this.userData.totalModules}`
            },
            {
                label: "Série d'Apprentissage",
                value: `${this.userData.streakDays} jours`
            }
        ];
    }

    /**
     * Récupère les objectifs d'apprentissage
     */
    public getLearningObjectives(): LearningObjective[] {
        return this.learningObjectives;
    }

    /**
     * Récupère la progression des compétences
     */
    public getSkillProgress(): SkillProgress[] {
        return this.skillProgress;
    }
}
