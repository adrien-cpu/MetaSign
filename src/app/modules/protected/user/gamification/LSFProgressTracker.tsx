interface SkillProgress {
    title: string;
    value: number;
    description?: string;
}

export class LSFProgressTracker {
    private lsfSkillProgress: SkillProgress[] = [
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
        }
    ];

    private skillAreas = [
        {
            name: "Grammaire LSF",
            subSkills: [
                "Syntaxe spatiale",
                "Expressions non-manuelles",
                "Variations dialectales"
            ]
        },
        {
            name: "Culture Sourde",
            subSkills: [
                "Histoire",
                "Traditions",
                "Communauté"
            ]
        }
    ];

    getLSFSkillProgress(): SkillProgress[] {
        return this.lsfSkillProgress;
    }

    getDetailedSkillAreas() {
        return this.skillAreas;
    }

    calculateOverallProgress(): number {
        const totalProgress = this.lsfSkillProgress.reduce((sum, skill) => sum + skill.value, 0);
        return Math.round(totalProgress / this.lsfSkillProgress.length);
    }

    suggestNextLearningFocus(): string {
        const lowestProgressSkill = this.lsfSkillProgress.reduce((lowest, current) =>
            (current.value < lowest.value) ? current : lowest
        );
        return lowestProgressSkill.title;
    }
}