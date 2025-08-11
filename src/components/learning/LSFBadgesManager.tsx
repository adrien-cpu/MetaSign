/**
 * @file: src/app/components/learning/LSFBadgesManager.tsx
 * 
 * Gestionnaire de badges pour le système de gamification de l'application LSF.
 * Implémente une interface pour la gestion des badges, des objectifs d'apprentissage
 * et du suivi de progression.
 */

import React from 'react';
import { Medal, Book, Users, Trophy } from 'lucide-react';

// Définition des types pour le système de badges
type Difficulty = 'easy' | 'medium' | 'hard';
type Category = 'cultural' | 'linguistic' | 'community' | 'achievement';

interface Badge {
    id: string;
    title: string;
    icon: React.ReactNode;
    description: string;
    difficulty: Difficulty;
    category: Category;
    requiredPoints: number;
    rewards: string[];
}

interface UserBadgeProgress {
    earnedBadges: string[];
}

class BadgeManager {
    private badgeCollection: Badge[];

    constructor() {
        this.badgeCollection = [
            { id: 'cultural_1', title: 'First Cultural Badge', icon: <Book />, description: 'Description of the First Cultural Badge', difficulty: 'easy', category: 'cultural', requiredPoints: 50, rewards: ['Reward 1', 'Reward 2'] },
            { id: 'cultural_2', title: 'Second Cultural Badge', icon: <Book />, description: 'Description of the Second Cultural Badge', difficulty: 'medium', category: 'cultural', requiredPoints: 100, rewards: ['Reward 3', 'Reward 4'] },
            { id: 'linguistic_1', title: 'First Linguistic Badge', icon: <Medal />, description: 'Description of the First Linguistic Badge', difficulty: 'easy', category: 'linguistic', requiredPoints: 50, rewards: ['Reward 1', 'Reward 2'] },
            { id: 'linguistic_2', title: 'Second Linguistic Badge', icon: <Medal />, description: 'Description of the Second Linguistic Badge', difficulty: 'medium', category: 'linguistic', requiredPoints: 100, rewards: ['Reward 3', 'Reward 4'] },
            { id: 'community_1', title: 'First Community Badge', icon: <Users />, description: 'Description of the First Community Badge', difficulty: 'easy', category: 'community', requiredPoints: 50, rewards: ['Reward 1', 'Reward 2'] },
            { id: 'community_2', title: 'Second Community Badge', icon: <Users />, description: 'Description of the Second Community Badge', difficulty: 'medium', category: 'community', requiredPoints: 100, rewards: ['Reward 3', 'Reward 4'] },
            { id: 'achievement_1', title: 'First Achievement Badge', icon: <Trophy />, description: 'Description of the First Achievement Badge', difficulty: 'easy', category: 'achievement', requiredPoints: 50, rewards: ['Reward 1', 'Reward 2'] },
            { id: 'achievement_2', title: 'Second Achievement Badge', icon: <Trophy />, description: 'Description of the Second Achievement Badge', difficulty: 'medium', category: 'achievement', requiredPoints: 100, rewards: ['Reward 3', 'Reward 4'] }
        ];
    }

    public getBadgeById(badgeId: string): Badge | undefined {
        return this.badgeCollection.find(badge => badge.id === badgeId);
    }

    public isBadgeUnlocked(badgeId: string, userProgress: UserBadgeProgress): boolean {
        return userProgress.earnedBadges.includes(badgeId);
    }

    public calculateBadgeProgression(userProgress: UserBadgeProgress): number {
        const totalBadges = this.badgeCollection.length;
        if (totalBadges === 0) return 0;

        return Math.round((userProgress.earnedBadges.length / totalBadges) * 100);
    }

    public checkAndUnlockBadges(userProgress: UserBadgeProgress, userMetrics: Record<Category, number>): string[] {
        return this.badgeCollection
            .filter(badge => !userProgress.earnedBadges.includes(badge.id) && userMetrics[badge.category] >= badge.requiredPoints)
            .map(badge => badge.id);
    }

    public suggestNextBadges(userProgress: UserBadgeProgress, count = 3): Badge[] {
        return this.badgeCollection
            .filter(badge => !userProgress.earnedBadges.includes(badge.id))
            .sort((a, b) => a.requiredPoints - b.requiredPoints)
            .slice(0, count);
    }
}

export default BadgeManager;
