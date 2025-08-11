'use client';

import React, { useState } from 'react';
import {
    TrendingUp,
    LineChart,
    Target,
    ArrowUp,
    CheckCircle,
    Flame,
    Users
} from 'lucide-react';

// Define types with usage to prevent ESLint unused vars warning
export type UserStatTrend = 'up' | 'down' | 'stable';

export interface UserStat {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: 'green' | 'red' | 'blue';
    trend?: UserStatTrend;
    description?: string;
}

export interface LearningProgress {
    category: string;
    progress: number;
    icon: React.ReactNode;
    color: string;
}

const StatsTab: React.FC = () => {
    const [showComparison, setShowComparison] = useState(false);

    const userData = {
        stats: [
            {
                title: "Leçons Complétées",
                value: 42,
                icon: <CheckCircle size={24} className="text-green-400" />,
                color: 'green',
                trend: 'up' as UserStatTrend,
                description: "Nombre total de leçons terminées avec succès"
            },
            {
                title: "Temps d&apos;Apprentissage",
                value: 87,
                icon: <Flame size={24} className="text-red-400" />,
                color: 'red',
                trend: 'up' as UserStatTrend,
                description: "Heures totales consacrées à l&apos;apprentissage de la LSF"
            },
            {
                title: "Interactions LSF",
                value: 156,
                icon: <Users size={24} className="text-blue-400" />,
                color: 'blue',
                trend: 'up' as UserStatTrend,
                description: "Nombre d&apos;interactions en langue des signes"
            },
        ],
        learningProgress: [
            {
                category: "Grammaire LSF",
                progress: 65,
                icon: <LineChart size={24} className="text-purple-400" />,
                color: 'purple'
            },
            {
                category: "Culture Sourde",
                progress: 45,
                icon: <Target size={24} className="text-green-400" />,
                color: 'green'
            },
            {
                category: "Communication",
                progress: 55,
                icon: <Users size={24} className="text-blue-400" />,
                color: 'blue'
            }
        ]
    };

    const renderTrendIcon = (trend?: UserStatTrend) => {
        switch (trend) {
            case 'up': return <ArrowUp className="text-green-500 ml-2" size={16} />;
            case 'down': return <ArrowUp className="text-red-500 ml-2 rotate-180" size={16} />;
            case 'stable': return null;
            default: return null;
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Statistiques Principales */}
            <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                    <TrendingUp className="mr-2 text-green-400" />
                    Statistiques Principales
                </h2>
                {userData.stats.map((stat, index) => (
                    <div key={index} className="mb-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                {stat.icon}
                                <span className="ml-2 font-semibold">{stat.title}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-lg font-bold mr-2">{stat.value}</span>
                                {renderTrendIcon(stat.trend)}
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
                    </div>
                ))}
                <button
                    onClick={() => setShowComparison(!showComparison)}
                    className="mt-4 text-blue-400 hover:underline"
                >
                    {showComparison ? 'Masquer' : 'Voir'} comparaison communautaire
                </button>
                {showComparison && (
                    <div className="mt-4 text-sm text-gray-300">
                        <p>🏆 Moyenne communautaire :</p>
                        <ul className="list-disc pl-5">
                            <li>Leçons complétées : 35 (vous : 42)</li>
                            <li>Temps d&apos;apprentissage : 75h (vous : 87h)</li>
                            <li>Interactions : 120 (vous : 156)</li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Progression de l&apos;Apprentissage */}
            <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                    <LineChart className="mr-2 text-blue-400" />
                    Progression de l&apos;Apprentissage
                </h2>
                {userData.learningProgress.map((progress, index) => (
                    <div key={index} className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                                {progress.icon}
                                <span className="ml-2">{progress.category}</span>
                            </div>
                            <span className="text-sm text-gray-400">
                                {progress.progress}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div
                                className={`bg-${progress.color}-500 h-2.5 rounded-full`}
                                style={{ width: `${progress.progress}%` }}
                            />
                        </div>
                    </div>
                ))}
                <div className="mt-4 bg-blue-900/30 p-4 rounded-lg">
                    <p className="text-blue-200">
                        👉 Basé sur vos progrès, nous recommandons :
                        <strong className="block mt-2 text-blue-100">
                            Approfondir votre compréhension de la grammaire LSF
                        </strong>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StatsTab;