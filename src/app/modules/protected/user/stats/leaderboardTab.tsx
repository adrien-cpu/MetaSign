'use client';

import React from 'react';
import {
    Globe,
    Users,
    Trophy
} from 'lucide-react';

// Types
type LeaderboardCategory = 'Débutant' | 'Intermédiaire' | 'Expert';

interface LeaderboardEntry {
    rank: number;
    name: string;
    score: number;
    category: LeaderboardCategory;
    contributions: number;
    specialBadge?: string;
}

interface LevelDistribution {
    label: string;
    color: string;
    percentage: number;
}

interface RewardEntry {
    rang: number;
    recompense: string;
    bonus: string;
}

const LeaderboardTab: React.FC = () => {
    const userData: {
        leaderboard: LeaderboardEntry[];
        levelDistribution: LevelDistribution[];
        rewards: RewardEntry[];
    } = {
        leaderboard: [
            {
                rank: 1,
                name: "Alpha Signeur",
                score: 2500,
                category: 'Expert',
                contributions: 87,
                specialBadge: 'Maître des Signes'
            },
            {
                rank: 2,
                name: "Beta Communicator",
                score: 2000,
                category: 'Intermédiaire',
                contributions: 65
            },
            {
                rank: 3,
                name: "Gamma Linguist",
                score: 1800,
                category: 'Intermédiaire',
                contributions: 52
            },
            {
                rank: 4,
                name: "Moi",
                score: 1540,
                category: 'Débutant',
                contributions: 35
            }
        ],
        levelDistribution: [
            { label: 'Débutant', color: 'blue', percentage: 50 },
            { label: 'Intermédiaire', color: 'green', percentage: 35 },
            { label: 'Expert', color: 'red', percentage: 15 }
        ],
        rewards: [
            { rang: 1, recompense: "Badge Maître", bonus: "+500 XP" },
            { rang: 2, recompense: "Badge Expert", bonus: "+250 XP" },
            { rang: 3, recompense: "Badge Prometteur", bonus: "+100 XP" }
        ]
    };

    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Classement Principal */}
            <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center">
                        <Globe className="mr-2 text-green-400" />
                        Classement Communautaire
                    </h2>
                </div>

                {userData.leaderboard.map((player, index) => (
                    <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg mb-2 ${player.name === 'Moi' ? 'bg-yellow-600' : 'bg-gray-700'
                            }`}
                    >
                        <div className="flex items-center">
                            <span className="font-semibold mr-2">#{player.rank}</span>
                            <span>{player.name}</span>
                            {player.specialBadge && (
                                <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                                    {player.specialBadge}
                                </span>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="font-bold">{player.score} pts</div>
                            <div className="text-xs text-gray-300">
                                {player.category} | {player.contributions} contributions
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Distribution des Niveaux et Récompenses */}
            <div className="space-y-6">
                {/* Distribution des Niveaux */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        <Users className="mr-2 text-purple-400" />
                        Distribution des Niveaux
                    </h2>
                    <div className="space-y-4">
                        {userData.levelDistribution.map((level, index) => (
                            <div key={index}>
                                <div className="flex justify-between items-center mb-2">
                                    <span>{level.label}</span>
                                    <span className="text-sm text-gray-400">
                                        {level.percentage}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2.5">
                                    <div
                                        className={`bg-${level.color}-500 h-2.5 rounded-full`}
                                        style={{ width: `${level.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Récompenses de Classement */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        <Trophy className="mr-2 text-yellow-400" />
                        Récompenses de Classement
                    </h2>
                    <div className="space-y-3">
                        {userData.rewards.map((reward, index) => (
                            <div
                                key={index}
                                className="bg-gray-700 p-3 rounded-lg flex justify-between items-center"
                            >
                                <div>
                                    <span className="font-semibold mr-2">#{reward.rang}</span>
                                    <span>{reward.recompense}</span>
                                </div>
                                <span className="text-yellow-400">{reward.bonus}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardTab;