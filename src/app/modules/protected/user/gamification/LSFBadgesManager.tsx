import React from 'react';
import {
    Award, BookOpen, Globe, Brain, Users, Target
} from 'lucide-react';

interface Badge {
    title: string;
    icon: React.ReactNode;
    description?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
}

export class LSFBadgesManager {
    private culturalBadges: Badge[] = [
        {
            title: "Explorateur Sourd",
            icon: <Globe size={32} className="text-blue-400" />,
            description: "Découvrez l'histoire et la culture sourde",
            difficulty: 'medium'
        },
        {
            title: "Linguiste en Herbe",
            icon: <BookOpen size={32} className="text-green-400" />,
            description: "Maîtrisez les variations linguistiques",
            difficulty: 'hard'
        },
        {
            title: "Ambassadeur LSF",
            icon: <Users size={32} className="text-purple-400" />,
            description: "Contribuez à la communauté linguistique",
            difficulty: 'hard'
        },
        {
            title: "Novice",
            icon: <Brain size={32} className="text-yellow-400" />,
            description: "Premiers pas en langue des signes",
            difficulty: 'easy'
        },
        {
            title: "Pionnier",
            icon: <Target size={32} className="text-red-400" />,
            description: "Atteignez vos premiers objectifs",
            difficulty: 'medium'
        },
        {
            title: "Maître des Signes",
            icon: <Award size={32} className="text-orange-400" />,
            description: "Expert en communication LSF",
            difficulty: 'hard'
        }
    ];

    private upcomingBadges: Badge[] = [
        {
            title: "Interprète Certifié",
            icon: <Award size={32} className="text-gray-500" />,
            description: "Obtenez une certification professionnelle en interprétation LSF",
            difficulty: 'hard'
        },
        {
            title: "Dialecte Expert",
            icon: <Globe size={32} className="text-gray-500" />,
            description: "Maîtrisez les variations régionales de la langue des signes",
            difficulty: 'hard'
        }
    ];

    getCulturalBadges(): Badge[] {
        return this.culturalBadges;
    }

    getUpcomingBadges(): Badge[] {
        return this.upcomingBadges;
    }

    calculateBadgeProgression(earnedBadges: Badge[]): number {
        const totalBadges = this.culturalBadges.length + this.upcomingBadges.length;
        return (earnedBadges.length / totalBadges) * 100;
    }
}