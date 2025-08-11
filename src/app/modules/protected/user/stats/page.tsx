'use client';

import React from 'react';
import {
    BarChart2
} from 'lucide-react';
import { Tabs, Tab } from './tabs';
import StatsTab from './statsTab';
import AchievementsTab from './achievementsTab';
import LeaderboardTab from './leaderboardTab';

const StatsPage: React.FC = () => {
    return (
        <div className="bg-gray-900 min-h-screen text-white p-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center">
                <BarChart2 className="mr-2 text-blue-400" />
                Tableau de Bord LSF
            </h1>

            <Tabs>
                <Tab label="Statistiques">
                    <StatsTab />
                </Tab>
                <Tab label="Réalisations">
                    <AchievementsTab />
                </Tab>
                <Tab label="Classement">
                    <LeaderboardTab />
                </Tab>
            </Tabs>
        </div>
    );
};

export default StatsPage;