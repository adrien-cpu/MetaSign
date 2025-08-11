interface LearningMetric {
    label: string;
    value: string | number;
}

export class LSFLearningProfile {
    private userData = {
        totalScore: 1540,
        level: "Avancé",
        learningHours: 120,
        communityContribution: 45
    };

    private learningObjectives = [
        {
            title: "Maîtrise Dialectale",
            progress: 60,
            description: "Comprendre les variations régionales de la LSF"
        },
        {
            title: "Certification Professionnelle",
            progress: 40,
            description: "Préparation à la certification d'interprète"
        }
    ];

    getTotalScore(): number {
        return this.userData.totalScore;
    }

    getKeyMetrics(): LearningMetric[] {
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
            }
        ];
    }

    getLearningObjectives() {
        return this.learningObjectives;
    }

    calculateLearningProgress(): number {
        const totalProgress = this.learningObjectives.reduce((sum, obj) => sum + obj.progress, 0);
        return Math.round(totalProgress / this.learningObjectives.length);
    }

    generatePersonalizedRecommendation(): string {
        const lowestProgressObjective = this.learningObjectives.reduce((lowest, current) =>
            (current.progress < lowest.progress) ? current : lowest
        );

        return `Nous vous recommandons de vous concentrer sur : ${lowestProgressObjective.title}. ${lowestProgressObjective.description}`;
    }
}