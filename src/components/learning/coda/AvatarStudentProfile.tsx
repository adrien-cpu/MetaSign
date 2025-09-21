/**
 * @fileoverview Profil détaillé de l'étudiant avatar CODA
 * Chemin: src/components/learning/coda/AvatarStudentProfile.tsx
 * 
 * Interface complète pour visualiser et gérer le profil de l'avatar étudiant,
 * incluant sa progression, ses compétences, son style d'apprentissage et son évolution.
 * 
 * @author MetaSign AI Team
 * @version 1.0.0
 * @since 2024
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Progress from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
    User,
    Brain,
    TrendingUp,
    Target,
    Book,
    Clock,
    Star,
    AlertTriangle,
    CheckCircle,
    BarChart3,
    Settings,
    Calendar,
    Award,
    Lightbulb,
    Eye,
    Hand,
    Smile,
    MessageSquare
} from 'lucide-react';

// Types pour le profil de l'avatar
interface AvatarProfile {
    id: string;
    name: string;
    avatar: string;
    createdAt: Date;
    lastSessionAt: Date;
    totalSessionsCompleted: number;
    currentLevel: CECRLLevel;
    overallProgress: number;
    personality: PersonalityTraits;
    learningStyle: LearningStyle;
    competencies: CompetencyMap;
    progressHistory: ProgressEntry[];
    preferences: LearningPreferences;
}

interface PersonalityTraits {
    curiosity: number; // 0-100
    persistence: number;
    adaptability: number;
    enthusiasm: number;
    patience: number;
}

interface LearningStyle {
    visualLearner: number; // 0-100
    kinestheticLearner: number;
    auditoryLearner: number;
    socialLearner: number;
    preferredPace: 'slow' | 'moderate' | 'fast';
    errorTolerance: 'low' | 'medium' | 'high';
}

interface CompetencyMap {
    vocabulary: SkillLevel;
    grammar: SkillLevel;
    spatialSyntax: SkillLevel;
    facialExpressions: SkillLevel;
    manualComponents: SkillLevel;
    nonManualMarkers: SkillLevel;
    culturalContext: SkillLevel;
    comprehension: SkillLevel;
}

interface SkillLevel {
    current: number; // 0-100
    target: number;
    lastImprovement: Date;
    weakPoints: string[];
    strengths: string[];
    exercisesCompleted: number;
    averageScore: number;
}

interface ProgressEntry {
    date: Date;
    skillArea: keyof CompetencyMap;
    previousLevel: number;
    newLevel: number;
    sessionType: string;
    achievements: string[];
}

interface LearningPreferences {
    favoriteTopics: string[];
    difficultTopics: string[];
    preferredSessionDuration: number; // minutes
    breakFrequency: number; // minutes
    motivationFactors: string[];
}

type CECRLLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Composant de profil détaillé de l'avatar étudiant
 * 
 * Affiche et permet de gérer :
 * - Informations personnelles et style d'apprentissage
 * - Carte des compétences détaillée
 * - Historique de progression
 * - Préférences et recommandations
 */
const AvatarStudentProfile: React.FC = () => {
    // État du profil
    const [profile, setProfile] = useState<AvatarProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

    // Simulation du chargement des données
    useEffect(() => {
        const loadProfile = async () => {
            setIsLoading(true);

            // Simulation d'appel API
            await new Promise(resolve => setTimeout(resolve, 1200));

            const mockProfile: AvatarProfile = {
                id: 'avatar-001',
                name: 'Alex',
                avatar: '🤖',
                createdAt: new Date('2024-01-15'),
                lastSessionAt: new Date(),
                totalSessionsCompleted: 47,
                currentLevel: 'A2',
                overallProgress: 68,
                personality: {
                    curiosity: 85,
                    persistence: 72,
                    adaptability: 90,
                    enthusiasm: 78,
                    patience: 65
                },
                learningStyle: {
                    visualLearner: 80,
                    kinestheticLearner: 65,
                    auditoryLearner: 45,
                    socialLearner: 88,
                    preferredPace: 'moderate',
                    errorTolerance: 'medium'
                },
                competencies: {
                    vocabulary: {
                        current: 72,
                        target: 85,
                        lastImprovement: new Date('2024-01-20'),
                        weakPoints: ['Émotions complexes', 'Vocabulaire scientifique'],
                        strengths: ['Famille', 'Activités quotidiennes', 'Nourriture'],
                        exercisesCompleted: 23,
                        averageScore: 78
                    },
                    grammar: {
                        current: 58,
                        target: 75,
                        lastImprovement: new Date('2024-01-18'),
                        weakPoints: ['Structures temporelles', 'Questions complexes'],
                        strengths: ['Phrases simples', 'Négation'],
                        exercisesCompleted: 15,
                        averageScore: 65
                    },
                    spatialSyntax: {
                        current: 45,
                        target: 70,
                        lastImprovement: new Date('2024-01-16'),
                        weakPoints: ['Références multiples', 'Perspectives complexes'],
                        strengths: ['Localisation simple', 'Directions de base'],
                        exercisesCompleted: 8,
                        averageScore: 52
                    },
                    facialExpressions: {
                        current: 76,
                        target: 85,
                        lastImprovement: new Date('2024-01-19'),
                        weakPoints: ['Émotions subtiles', 'Intensité variable'],
                        strengths: ['Émotions de base', 'Questions/affirmations'],
                        exercisesCompleted: 19,
                        averageScore: 81
                    },
                    manualComponents: {
                        current: 82,
                        target: 90,
                        lastImprovement: new Date('2024-01-21'),
                        weakPoints: ['Configurations complexes', 'Transitions rapides'],
                        strengths: ['Formes de base', 'Mouvements simples'],
                        exercisesCompleted: 31,
                        averageScore: 85
                    },
                    nonManualMarkers: {
                        current: 38,
                        target: 65,
                        lastImprovement: new Date('2024-01-14'),
                        weakPoints: ['Marqueurs aspectuels', 'Intensité'],
                        strengths: ['Marqueurs basiques'],
                        exercisesCompleted: 6,
                        averageScore: 45
                    },
                    culturalContext: {
                        current: 55,
                        target: 75,
                        lastImprovement: new Date('2024-01-17'),
                        weakPoints: ['Histoire sourde', 'Variations régionales'],
                        strengths: ['Politesse', 'Contextes formels/informels'],
                        exercisesCompleted: 12,
                        averageScore: 62
                    },
                    comprehension: {
                        current: 69,
                        target: 80,
                        lastImprovement: new Date('2024-01-20'),
                        weakPoints: ['Discours rapide', 'Vocabulaire spécialisé'],
                        strengths: ['Conversations simples', 'Instructions'],
                        exercisesCompleted: 21,
                        averageScore: 73
                    }
                },
                progressHistory: [
                    {
                        date: new Date('2024-01-21'),
                        skillArea: 'manualComponents',
                        previousLevel: 78,
                        newLevel: 82,
                        sessionType: 'Configuration manuelle avancée',
                        achievements: ['Maîtrise du classifieur "véhicule"']
                    },
                    {
                        date: new Date('2024-01-20'),
                        skillArea: 'vocabulary',
                        previousLevel: 68,
                        newLevel: 72,
                        sessionType: 'Vocabulaire émotionnel',
                        achievements: ['15 nouveaux signes mémorisés']
                    }
                ],
                preferences: {
                    favoriteTopics: ['Famille', 'Animaux', 'Sport'],
                    difficultTopics: ['Sciences', 'Politique', 'Technologie'],
                    preferredSessionDuration: 20,
                    breakFrequency: 5,
                    motivationFactors: ['Badges', 'Progression visible', 'Défis adaptatifs']
                }
            };

            setProfile(mockProfile);
            setIsLoading(false);
        };

        loadProfile();
    }, []);

    // Calculs dérivés
    const competencyAverage = useMemo(() => {
        if (!profile) return 0;
        const values = Object.values(profile.competencies).map(comp => comp.current);
        return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
    }, [profile]);

    const topStrengths = useMemo(() => {
        if (!profile) return [];
        return Object.entries(profile.competencies)
            .sort(([, a], [, b]) => b.current - a.current)
            .slice(0, 3)
            .map(([skill, data]) => ({ skill: skill as keyof CompetencyMap, level: data.current }));
    }, [profile]);

    const priorityWeaknesses = useMemo(() => {
        if (!profile) return [];
        return Object.entries(profile.competencies)
            .sort(([, a], [, b]) => a.current - b.current)
            .slice(0, 3)
            .map(([skill, data]) => ({ skill: skill as keyof CompetencyMap, level: data.current, target: data.target }));
    }, [profile]);

    // Helpers
    const getSkillIcon = (skill: keyof CompetencyMap) => {
        const iconMap: Record<keyof CompetencyMap, React.ReactNode> = {
            vocabulary: <Book className="w-4 h-4" />,
            grammar: <Target className="w-4 h-4" />,
            spatialSyntax: <BarChart3 className="w-4 h-4" />,
            facialExpressions: <Smile className="w-4 h-4" />,
            manualComponents: <Hand className="w-4 h-4" />,
            nonManualMarkers: <Eye className="w-4 h-4" />,
            culturalContext: <MessageSquare className="w-4 h-4" />,
            comprehension: <Brain className="w-4 h-4" />
        };
        return iconMap[skill];
    };

    const getSkillName = (skill: keyof CompetencyMap) => {
        const nameMap: Record<keyof CompetencyMap, string> = {
            vocabulary: 'Vocabulaire',
            grammar: 'Grammaire',
            spatialSyntax: 'Syntaxe spatiale',
            facialExpressions: 'Expressions faciales',
            manualComponents: 'Composantes manuelles',
            nonManualMarkers: 'Marqueurs non-manuels',
            culturalContext: 'Contexte culturel',
            comprehension: 'Compréhension'
        };
        return nameMap[skill];
    };

    const getProgressColor = (current: number, target: number) => {
        const ratio = current / target;
        if (ratio >= 0.9) return 'text-green-600';
        if (ratio >= 0.7) return 'text-blue-600';
        if (ratio >= 0.5) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getLevelBadgeColor = (level: CECRLLevel) => {
        const colorMap: Record<CECRLLevel, string> = {
            'A1': 'bg-green-100 text-green-800',
            'A2': 'bg-blue-100 text-blue-800',
            'B1': 'bg-yellow-100 text-yellow-800',
            'B2': 'bg-orange-100 text-orange-800',
            'C1': 'bg-purple-100 text-purple-800',
            'C2': 'bg-red-100 text-red-800'
        };
        return colorMap[level];
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Chargement du profil de l'avatar...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Aucun profil d'avatar trouvé.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header du profil */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                        {profile.avatar}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            {profile.name}
                            <Badge className={getLevelBadgeColor(profile.currentLevel)}>
                                Niveau {profile.currentLevel}
                            </Badge>
                        </h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Créé le {profile.createdAt.toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Dernière session: {profile.lastSessionAt.toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                                <Award className="w-4 h-4" />
                                {profile.totalSessionsCompleted} sessions complétées
                            </span>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-sm text-gray-600">Progression globale</p>
                    <div className="flex items-center gap-2">
                        <Progress value={profile.overallProgress} className="w-32" />
                        <span className="text-lg font-bold text-blue-600">{profile.overallProgress}%</span>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                    <TabsTrigger value="competencies">Compétences</TabsTrigger>
                    <TabsTrigger value="personality">Personnalité</TabsTrigger>
                    <TabsTrigger value="progress">Progression</TabsTrigger>
                    <TabsTrigger value="preferences">Préférences</TabsTrigger>
                </TabsList>

                {/* Vue d'ensemble */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Résumé des forces */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-700">
                                    <Star className="w-5 h-5" />
                                    Points forts
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {topStrengths.map(({ skill, level }, index) => (
                                    <div key={skill} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {getSkillIcon(skill)}
                                            <span className="text-sm font-medium">{getSkillName(skill)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Progress value={level} className="w-16" />
                                            <span className="text-sm font-bold text-green-600">{level}%</span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Axes d'amélioration */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-700">
                                    <AlertTriangle className="w-5 h-5" />
                                    Axes d'amélioration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {priorityWeaknesses.map(({ skill, level, target }, index) => (
                                    <div key={skill} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {getSkillIcon(skill)}
                                                <span className="text-sm font-medium">{getSkillName(skill)}</span>
                                            </div>
                                            <span className="text-sm text-orange-600">{level}% / {target}%</span>
                                        </div>
                                        <Progress value={(level / target) * 100} className="h-2" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Style d'apprentissage */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="w-5 h-5" />
                                    Style d'apprentissage
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Visuel</span>
                                        <span className="text-sm font-medium">{profile.learningStyle.visualLearner}%</span>
                                    </div>
                                    <Progress value={profile.learningStyle.visualLearner} className="h-2" />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Kinesthésique</span>
                                        <span className="text-sm font-medium">{profile.learningStyle.kinestheticLearner}%</span>
                                    </div>
                                    <Progress value={profile.learningStyle.kinestheticLearner} className="h-2" />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Social</span>
                                        <span className="text-sm font-medium">{profile.learningStyle.socialLearner}%</span>
                                    </div>
                                    <Progress value={profile.learningStyle.socialLearner} className="h-2" />
                                </div>

                                <div className="pt-2 border-t">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Rythme préféré:</span>
                                        <Badge variant="outline">{profile.learningStyle.preferredPace}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recommandations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="w-5 h-5" />
                                Recommandations pédagogiques
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-medium text-blue-800 mb-2">🎯 Prochains objectifs</h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Améliorer la syntaxe spatiale (+25%)</li>
                                        <li>• Maîtriser les marqueurs non-manuels</li>
                                        <li>• Enrichir le vocabulaire scientifique</li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-green-50 rounded-lg">
                                    <h4 className="font-medium text-green-800 mb-2">✨ Méthodes recommandées</h4>
                                    <ul className="text-sm text-green-700 space-y-1">
                                        <li>• Exercices visuels (80% préférence)</li>
                                        <li>• Sessions courtes (20 min max)</li>
                                        <li>• Apprentissage social et interactif</li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <h4 className="font-medium text-purple-800 mb-2">🚀 Motivation</h4>
                                    <ul className="text-sm text-purple-700 space-y-1">
                                        <li>• Utiliser le système de badges</li>
                                        <li>• Montrer la progression visuelle</li>
                                        <li>• Proposer des défis adaptatifs</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Compétences détaillées */}
                <TabsContent value="competencies" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {Object.entries(profile.competencies).map(([skillKey, competency]) => (
                            <Card key={skillKey}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {getSkillIcon(skillKey as keyof CompetencyMap)}
                                            {getSkillName(skillKey as keyof CompetencyMap)}
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-lg font-bold ${getProgressColor(competency.current, competency.target)}`}>
                                                {competency.current}%
                                            </div>
                                            <div className="text-xs text-gray-500">Objectif: {competency.target}%</div>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Progression vers l'objectif</span>
                                            <span>{Math.round((competency.current / competency.target) * 100)}%</span>
                                        </div>
                                        <Progress value={(competency.current / competency.target) * 100} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Exercices complétés</span>
                                            <p className="font-medium">{competency.exercisesCompleted}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Score moyen</span>
                                            <p className="font-medium">{competency.averageScore}%</p>
                                        </div>
                                    </div>

                                    {competency.strengths.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium text-green-700 mb-2">✅ Points forts</p>
                                            <div className="flex flex-wrap gap-1">
                                                {competency.strengths.map((strength: string, index: number) => (
                                                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                                        {strength}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {competency.weakPoints.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium text-orange-700 mb-2">🎯 À améliorer</p>
                                            <div className="flex flex-wrap gap-1">
                                                {competency.weakPoints.map((weakness: string, index: number) => (
                                                    <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                                                        {weakness}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-2 border-t">
                                        <p className="text-xs text-gray-500">
                                            Dernière amélioration: {competency.lastImprovement.toLocaleDateString()}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Personnalité */}
                <TabsContent value="personality" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Traits de personnalité
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {Object.entries(profile.personality).map(([trait, value]) => (
                                    <div key={trait} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium capitalize">{trait}</span>
                                            <span className="text-sm font-bold">{value}%</span>
                                        </div>
                                        <Progress value={value} className="h-2" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    Paramètres d'apprentissage
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Rythme préféré</p>
                                        <p className="font-bold text-blue-600 capitalize">{profile.learningStyle.preferredPace}</p>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Tolérance aux erreurs</p>
                                        <p className="font-bold text-green-600 capitalize">{profile.learningStyle.errorTolerance}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium mb-2">Facteurs de motivation</p>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.preferences.motivationFactors.map((factor, index) => (
                                            <Badge key={index} variant="outline">{factor}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Progression historique */}
                <TabsContent value="progress" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Historique de progression
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {profile.progressHistory.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            {getSkillIcon(entry.skillArea)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium">{getSkillName(entry.skillArea)}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {entry.previousLevel}% → {entry.newLevel}%
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600">{entry.sessionType}</p>
                                            {entry.achievements.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {entry.achievements.map((achievement, i) => (
                                                        <Badge key={i} className="bg-yellow-100 text-yellow-800 text-xs">
                                                            🏆 {achievement}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">{entry.date.toLocaleDateString()}</p>
                                            <div className="flex items-center gap-1 text-green-600">
                                                <TrendingUp className="w-4 h-4" />
                                                <span className="text-sm font-medium">+{entry.newLevel - entry.previousLevel}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Préférences */}
                <TabsContent value="preferences" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sujets favoris</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {profile.preferences.favoriteTopics.map((topic, index) => (
                                        <Badge key={index} className="bg-green-100 text-green-800">
                                            {topic}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Sujets difficiles</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {profile.preferences.difficultTopics.map((topic, index) => (
                                        <Badge key={index} className="bg-red-100 text-red-800">
                                            {topic}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Préférences de session</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Durée préférée</p>
                                        <p className="font-bold text-blue-600">{profile.preferences.preferredSessionDuration} min</p>
                                    </div>
                                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Pause toutes les</p>
                                        <p className="font-bold text-purple-600">{profile.preferences.breakFrequency} min</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Moyennes globales</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">Niveau de compétence moyen</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <Progress value={competencyAverage} className="w-24" />
                                        <span className="text-xl font-bold text-blue-600">{competencyAverage}%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AvatarStudentProfile;