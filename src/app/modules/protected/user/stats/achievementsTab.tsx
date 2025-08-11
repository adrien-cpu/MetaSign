'use client';

import React from 'react';
import {
    Trophy,
    Award,
    Target
} from 'lucide-react';

// Types
type AchievementDifficulty = 'easy' | 'medium' | 'hard';

interface Achievement {
    title: string;
    icon: React.ReactNode;
    description: string;
    difficulty: AchievementDifficulty;
    progress: number;
    category: string;
}

interface UpcomingChallenge {
    title: string;
    description: string;
    reward: string;
}

const AchievementsTab: React.FC = () => {
    const userData: {
        achievements: Achievement[];
        upcomingChallenges: UpcomingChallenge[];
    } = {
        achievements: [
            {
                title: "Débutant Prometteur",
                icon: <Trophy size={40} className="text-yellow-500" />,
                description: "Terminez vos 10 premières leçons",
                difficulty: 'easy',
                progress: 65,
                category: 'Apprentissage'
            },
            {
                title: "Maître des Signes",
                icon: <Award size={40} className="text-red-500" />,
                description: "Apprenez 50 nouveaux signes",
                difficulty: 'medium',
                progress: 45,
                category: 'Linguistique'
            }
        ],
        upcomingChallenges: [
            {
                title: "Maîtrise Avancée",
                description: "Atteignez 100 heures d'apprentissage",
                reward: "Badge Expert"
            },
            {
                title: "Traducteur Confirmé",
                description: "Traduisez 50 vidéos",
                reward: "Badge Traduction"
            }
        ]
    };

    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Badges Obtenus */}
            <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                    <Trophy className="mr-2 text-yellow-400" />
                    Badges Obtenus
                </h2>
                {userData.achievements.map((achievement, index) => (
                    <div
                        key={index}
                        className="bg-gray-700 rounded-lg p-4 mb-4 flex items-center"
                    >
                        {achievement.icon}
                        <div className="ml-4 flex-grow">
                            <h3 className="font-semibold">{achievement.title}</h3>
                            <p className="text-sm text-gray-400">
                                {achievement.description}
                            </p>
                        </div>
                        <div className="w-16 bg-gray-600 rounded-full h-2.5">
                            <div
                                className="bg-blue-500 h-2.5 rounded-full"
                                style={{ width: `${achievement.progress}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Défis à venir */}
            <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                    <Target className="mr-2 text-green-400" />
                    Défis à Relever
                </h2>
                {userData.upcomingChallenges.map((defi, index) => (
                    <div
                        key={index}
                        className="bg-gray-700 p-3 rounded-lg mb-4"
                    >
                        <h3 className="font-semibold">{defi.title}</h3>
                        <p className="text-sm text-gray-400">{defi.description}</p>
                        <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded mt-2 inline-block">
                            Récompense : {defi.reward}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AchievementsTab;