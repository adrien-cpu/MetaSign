/**
 * @fileoverview Page principale du système CODA virtuel
 * Chemin: src/app/modules/protected/learning/coda/page.tsx
 * 
 * Page principale qui orchestre tous les composants du système CODA virtuel.
 * Permet la navigation entre les différentes sections et gère l'état global.
 * 
 * @author MetaSign AI Team
 * @version 1.0.0
 * @since 2024
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
    Brain,
    BookOpen,
    User,
    Settings,
    BarChart3,
    Play,
    Pause,
    Clock,
    Target,
    Trophy,
    Lightbulb,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Star,
    Calendar,
    Activity
} from 'lucide-react';

// Import des composants CODA (simulés pour la démo)
// import { 
//   CODAVirtuelDashboard, 
//   CODATeachingSession, 
//   AvatarStudentProfile, 
//   CODAExerciseManager 
// } from '@/components/learning/coda';

// Types pour la page principale
interface CODAPageState {
    activeTab: string;
    currentSession: CODASessionInfo | null;
    studentProgress: StudentProgressSummary;
    recentActivities: ActivityItem[];
    systemStatus: SystemStatus;
}

interface CODASessionInfo {
    id: string;
    isActive: boolean;
    startTime: Date;
    duration: number; // en secondes
    exerciseTitle: string;
    studentName: string;
    progress: number; // 0-100
}

interface StudentProgressSummary {
    currentLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    overallProgress: number; // 0-100
    completedSessions: number;
    totalLearningTime: number; // en minutes
    recentAchievements: Achievement[];
    nextMilestone: string;
}

interface Achievement {
    id: string;
    title: string;
    description: string;
    earnedAt: Date;
    type: 'skill' | 'progress' | 'consistency' | 'special';
}

interface ActivityItem {
    id: string;
    type: 'session_completed' | 'level_up' | 'achievement' | 'exercise_created';
    title: string;
    description: string;
    timestamp: Date;
    icon: React.ReactNode;
}

interface SystemStatus {
    isOnline: boolean;
    lastSync: Date;
    aiSystemsStatus: 'operational' | 'degraded' | 'maintenance';
    activeUsers: number;
}

/**
 * Page principale du système CODA virtuel
 * 
 * Centralise l'accès à toutes les fonctionnalités :
 * - Tableau de bord principal
 * - Sessions d'enseignement
 * - Gestion des exercices
 * - Profil de l'avatar étudiant
 * - Statistiques et analytics
 */
const CODAMainPage: React.FC = () => {
    // État de la page
    const [pageState, setPageState] = useState<CODAPageState>({
        activeTab: 'dashboard',
        currentSession: null,
        studentProgress: {
            currentLevel: 'A2',
            overallProgress: 68,
            completedSessions: 47,
            totalLearningTime: 720, // 12 heures
            recentAchievements: [],
            nextMilestone: 'Maîtrise de la syntaxe spatiale'
        },
        recentActivities: [],
        systemStatus: {
            isOnline: true,
            lastSync: new Date(),
            aiSystemsStatus: 'operational',
            activeUsers: 156
        }
    });

    const [isLoading, setIsLoading] = useState(true);
    const [quickStartVisible, setQuickStartVisible] = useState(true);

    // Chargement initial
    useEffect(() => {
        const initializePage = async () => {
            setIsLoading(true);

            // Simulation du chargement des données
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Données mockées
            const mockAchievements: Achievement[] = [
                {
                    id: 'ach-001',
                    title: 'Premier mentor',
                    description: 'Première session d\'enseignement complétée',
                    earnedAt: new Date('2024-01-20'),
                    type: 'progress'
                },
                {
                    id: 'ach-002',
                    title: 'Correcteur expert',
                    description: '50 erreurs corrigées avec succès',
                    earnedAt: new Date('2024-01-18'),
                    type: 'skill'
                },
                {
                    id: 'ach-003',
                    title: 'Série dorée',
                    description: '7 sessions consécutives réussies',
                    earnedAt: new Date('2024-01-16'),
                    type: 'consistency'
                }
            ];

            const mockActivities: ActivityItem[] = [
                {
                    id: 'act-001',
                    type: 'session_completed',
                    title: 'Session terminée',
                    description: 'Les émotions de base - 85% de réussite',
                    timestamp: new Date('2024-01-21T14:30:00'),
                    icon: <CheckCircle className="w-4 h-4 text-green-600" />
                },
                {
                    id: 'act-002',
                    type: 'achievement',
                    title: 'Nouvel accomplissement',
                    description: 'Badge "Série dorée" obtenu',
                    timestamp: new Date('2024-01-21T13:15:00'),
                    icon: <Trophy className="w-4 h-4 text-yellow-600" />
                },
                {
                    id: 'act-003',
                    type: 'exercise_created',
                    title: 'Exercice créé',
                    description: 'Nouveau template "Questions complexes"',
                    timestamp: new Date('2024-01-21T11:20:00'),
                    icon: <BookOpen className="w-4 h-4 text-blue-600" />
                },
                {
                    id: 'act-004',
                    type: 'level_up',
                    title: 'Progression détectée',
                    description: 'Amélioration en expressions faciales (+12%)',
                    timestamp: new Date('2024-01-20T16:45:00'),
                    icon: <TrendingUp className="w-4 h-4 text-purple-600" />
                }
            ];

            setPageState(prev => ({
                ...prev,
                studentProgress: {
                    ...prev.studentProgress,
                    recentAchievements: mockAchievements
                },
                recentActivities: mockActivities
            }));

            setIsLoading(false);
        };

        initializePage();
    }, []);

    // Handlers
    const handleStartQuickSession = useCallback(() => {
        const newSession: CODASessionInfo = {
            id: `session-${Date.now()}`,
            isActive: true,
            startTime: new Date(),
            duration: 0,
            exerciseTitle: 'Session express - Révisions',
            studentName: 'Alex',
            progress: 0
        };

        setPageState(prev => ({ ...prev, currentSession: newSession, activeTab: 'session' }));
        setQuickStartVisible(false);
    }, []);

    const handleCreateExercise = useCallback(() => {
        setPageState(prev => ({ ...prev, activeTab: 'exercises' }));
    }, []);

    const handleViewProfile = useCallback(() => {
        setPageState(prev => ({ ...prev, activeTab: 'profile' }));
    }, []);

    const handleTabChange = useCallback((tab: string) => {
        setPageState(prev => ({ ...prev, activeTab: tab }));
    }, []);

    // Helpers
    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}min ${remainingSeconds}s`;
        } else if (minutes > 0) {
            return `${minutes}min ${remainingSeconds}s`;
        } else {
            return `${remainingSeconds}s`;
        }
    };

    const getLevelBadgeColor = (level: string) => {
        const colorMap: Record<string, string> = {
            'A1': 'bg-green-100 text-green-800',
            'A2': 'bg-blue-100 text-blue-800',
            'B1': 'bg-yellow-100 text-yellow-800',
            'B2': 'bg-orange-100 text-orange-800',
            'C1': 'bg-purple-100 text-purple-800',
            'C2': 'bg-red-100 text-red-800'
        };
        return colorMap[level] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIndicator = (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
            'operational': { color: 'bg-green-500', text: 'Opérationnel' },
            'degraded': { color: 'bg-yellow-500', text: 'Dégradé' },
            'maintenance': { color: 'bg-red-500', text: 'Maintenance' }
        };
        return statusMap[status] || { color: 'bg-gray-500', text: 'Inconnu' };
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">CODA Virtuel</h2>
                    <p className="text-gray-500">Initialisation du système d'apprentissage...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header global */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Brain className="w-8 h-8 text-blue-600" />
                        CODA Virtuel
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Système d'apprentissage inversé pour la Langue des Signes Française
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Status système */}
                    <div className="flex items-center gap-2 text-sm">
                        <div className={`w-3 h-3 rounded-full ${getStatusIndicator(pageState.systemStatus.aiSystemsStatus).color}`}></div>
                        <span className="text-gray-600">
                            {getStatusIndicator(pageState.systemStatus.aiSystemsStatus).text}
                        </span>
                    </div>

                    {/* Utilisateurs actifs */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Activity className="w-4 h-4" />
                        <span>{pageState.systemStatus.activeUsers} utilisateurs actifs</span>
                    </div>
                </div>
            </div>

            {/* Session active */}
            {pageState.currentSession && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <div>
                                    <h3 className="font-semibold text-blue-900">
                                        Session active: {pageState.currentSession.exerciseTitle}
                                    </h3>
                                    <p className="text-blue-700 text-sm">
                                        Étudiant: {pageState.currentSession.studentName} •
                                        Durée: {formatDuration(pageState.currentSession.duration)} •
                                        Progression: {pageState.currentSession.progress}%
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                    <Pause className="w-4 h-4 mr-2" />
                                    Pause
                                </Button>
                                <Button size="sm" onClick={() => handleTabChange('session')}>
                                    Reprendre
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Start */}
            {quickStartVisible && !pageState.currentSession && (
                <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-800">
                            <Lightbulb className="w-5 h-5" />
                            Démarrage rapide
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button
                                onClick={handleStartQuickSession}
                                className="h-16 bg-green-600 hover:bg-green-700 flex-col gap-2"
                            >
                                <Play className="w-5 h-5" />
                                <span>Session express</span>
                            </Button>
                            <Button
                                onClick={handleCreateExercise}
                                variant="outline"
                                className="h-16 flex-col gap-2"
                            >
                                <BookOpen className="w-5 h-5" />
                                <span>Créer un exercice</span>
                            </Button>
                            <Button
                                onClick={handleViewProfile}
                                variant="outline"
                                className="h-16 flex-col gap-2"
                            >
                                <User className="w-5 h-5" />
                                <span>Voir le profil</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Contenu principal avec navigation */}
            <Tabs value={pageState.activeTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="dashboard" className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Tableau de bord
                    </TabsTrigger>
                    <TabsTrigger value="session" className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Session
                    </TabsTrigger>
                    <TabsTrigger value="exercises" className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Exercices
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Profil Avatar
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Paramètres
                    </TabsTrigger>
                </TabsList>

                {/* Tableau de bord */}
                <TabsContent value="dashboard" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Vue d'ensemble */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Métriques principales */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold">{pageState.studentProgress.overallProgress}%</p>
                                        <p className="text-sm text-gray-600">Progression globale</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold">{Math.floor(pageState.studentProgress.totalLearningTime / 60)}h</p>
                                        <p className="text-sm text-gray-600">Temps d'enseignement</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <CheckCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold">{pageState.studentProgress.completedSessions}</p>
                                        <p className="text-sm text-gray-600">Sessions complétées</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <Trophy className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold">{pageState.studentProgress.recentAchievements.length}</p>
                                        <p className="text-sm text-gray-600">Accomplissements</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Progression de l'avatar */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Progression de l'avatar Alex
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Niveau actuel</p>
                                            <Badge className={getLevelBadgeColor(pageState.studentProgress.currentLevel)}>
                                                {pageState.studentProgress.currentLevel}
                                            </Badge>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">Progression</p>
                                            <p className="text-lg font-bold text-blue-600">
                                                {pageState.studentProgress.overallProgress}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Vers niveau B1</span>
                                            <span>{pageState.studentProgress.overallProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${pageState.studentProgress.overallProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm font-medium text-blue-800 mb-1">Prochain objectif</p>
                                        <p className="text-sm text-blue-700">{pageState.studentProgress.nextMilestone}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recommandations */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lightbulb className="w-5 h-5" />
                                        Recommandations personnalisées
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <p className="font-medium text-green-800">🎯 Session recommandée</p>
                                            <p className="text-sm text-green-700 mt-1">
                                                Exercice de syntaxe spatiale - L'avatar a besoin de renforcer cette compétence
                                            </p>
                                        </div>

                                        <div className="p-3 bg-yellow-50 rounded-lg">
                                            <p className="font-medium text-yellow-800">⚡ Moment optimal</p>
                                            <p className="text-sm text-yellow-700 mt-1">
                                                Les performances sont meilleures l'après-midi - planifiez vos sessions entre 14h et 17h
                                            </p>
                                        </div>

                                        <div className="p-3 bg-purple-50 rounded-lg">
                                            <p className="font-medium text-purple-800">🏆 Défi adaptatif</p>
                                            <p className="text-sm text-purple-700 mt-1">
                                                Prêt pour des exercices de niveau B1 en expressions faciales
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Panneau latéral */}
                        <div className="space-y-6">
                            {/* Accomplissements récents */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Star className="w-5 h-5" />
                                        Accomplissements récents
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {pageState.studentProgress.recentAchievements.map((achievement) => (
                                        <div key={achievement.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                            <Trophy className="w-5 h-5 text-yellow-500 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{achievement.title}</p>
                                                <p className="text-xs text-gray-600">{achievement.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {achievement.earnedAt.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Activités récentes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="w-5 h-5" />
                                        Activité récente
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {pageState.recentActivities.map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-3">
                                            {activity.icon}
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{activity.title}</p>
                                                <p className="text-xs text-gray-600">{activity.description}</p>
                                                <p className="text-xs text-gray-500">
                                                    {activity.timestamp.toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Actions rapides */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Actions rapides</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button size="sm" className="w-full justify-start" onClick={handleStartQuickSession}>
                                        <Play className="w-4 h-4 mr-2" />
                                        Démarrer une session
                                    </Button>
                                    <Button size="sm" variant="outline" className="w-full justify-start" onClick={handleCreateExercise}>
                                        <BookOpen className="w-4 h-4 mr-2" />
                                        Créer un exercice
                                    </Button>
                                    <Button size="sm" variant="outline" className="w-full justify-start" onClick={handleViewProfile}>
                                        <User className="w-4 h-4 mr-2" />
                                        Consulter le profil
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Session d'enseignement */}
                <TabsContent value="session" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Play className="w-5 h-5" />
                                Session d'enseignement CODA
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pageState.currentSession ? (
                                <div className="text-center py-8">
                                    <div className="animate-pulse mb-4">
                                        <Brain className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Session en cours</h3>
                                    <p className="text-gray-600 mb-4">{pageState.currentSession.exerciseTitle}</p>
                                    <div className="max-w-md mx-auto">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>Progression</span>
                                            <span>{pageState.currentSession.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${pageState.currentSession.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-4">
                                        Le composant CODATeachingSession sera affiché ici
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune session active</h3>
                                    <p className="text-gray-500 mb-4">
                                        Démarrez une nouvelle session d'enseignement avec votre avatar
                                    </p>
                                    <Button onClick={handleStartQuickSession}>
                                        <Play className="w-4 h-4 mr-2" />
                                        Nouvelle session
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Gestion des exercices */}
                <TabsContent value="exercises" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                Gestionnaire d'exercices
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">Gestion des exercices</h3>
                                <p className="text-gray-500 mb-4">
                                    Le composant CODAExerciseManager sera affiché ici
                                </p>
                                <p className="text-sm text-gray-400">
                                    Créez, modifiez et organisez vos exercices d'enseignement
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Profil de l'avatar */}
                <TabsContent value="profile" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Profil de l'avatar étudiant
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">Profil d'Alex</h3>
                                <p className="text-gray-500 mb-4">
                                    Le composant AvatarStudentProfile sera affiché ici
                                </p>
                                <p className="text-sm text-gray-400">
                                    Consultez les compétences, la progression et les préférences d'apprentissage
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Paramètres */}
                <TabsContent value="settings" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Paramètres système */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    Paramètres système
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Durée de session par défaut</label>
                                    <select className="w-full p-2 border border-gray-300 rounded-lg">
                                        <option>15 minutes</option>
                                        <option selected>20 minutes</option>
                                        <option>30 minutes</option>
                                        <option>45 minutes</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Sensibilité d'adaptation</label>
                                    <select className="w-full p-2 border border-gray-300 rounded-lg">
                                        <option>Faible</option>
                                        <option selected>Moyenne</option>
                                        <option>Élevée</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Région culturelle</label>
                                    <select className="w-full p-2 border border-gray-300 rounded-lg">
                                        <option selected>France</option>
                                        <option>Belgique</option>
                                        <option>Suisse</option>
                                        <option>Canada</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="realtime" className="rounded" defaultChecked />
                                    <label htmlFor="realtime" className="text-sm">Analyse en temps réel</label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="notifications" className="rounded" defaultChecked />
                                    <label htmlFor="notifications" className="text-sm">Notifications de progression</label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Paramètres de l'avatar */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Paramètres de l'avatar
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nom de l'avatar</label>
                                    <input
                                        type="text"
                                        defaultValue="Alex"
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Niveau de départ</label>
                                    <select className="w-full p-2 border border-gray-300 rounded-lg">
                                        <option>A1</option>
                                        <option selected>A2</option>
                                        <option>B1</option>
                                        <option>B2</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Style d'apprentissage privilégié</label>
                                    <select className="w-full p-2 border border-gray-300 rounded-lg">
                                        <option selected>Visuel</option>
                                        <option>Kinesthésique</option>
                                        <option>Auditif</option>
                                        <option>Social</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Rythme d'apprentissage</label>
                                    <select className="w-full p-2 border border-gray-300 rounded-lg">
                                        <option>Lent</option>
                                        <option selected>Modéré</option>
                                        <option>Rapide</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="adaptive" className="rounded" defaultChecked />
                                    <label htmlFor="adaptive" className="text-sm">Adaptation automatique de la difficulté</label>
                                </div>

                                <div className="pt-4">
                                    <Button size="sm" variant="outline" className="w-full">
                                        Réinitialiser le profil de l'avatar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Données et export */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Données et export</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button variant="outline" className="w-full justify-start">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Exporter les données de progression
                                </Button>

                                <Button variant="outline" className="w-full justify-start">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Générer un rapport d'activité
                                </Button>

                                <Button variant="outline" className="w-full justify-start">
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Sauvegarder les exercices personnalisés
                                </Button>

                                <hr className="my-4" />

                                <Button variant="destructive" className="w-full">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Réinitialiser toutes les données
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Informations système */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations système</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Version CODA</span>
                                    <span className="font-medium">1.0.0</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Dernière synchronisation</span>
                                    <span className="font-medium">{pageState.systemStatus.lastSync.toLocaleTimeString()}</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Statut IA</span>
                                    <span className={`font-medium ${pageState.systemStatus.aiSystemsStatus === 'operational' ? 'text-green-600' :
                                            pageState.systemStatus.aiSystemsStatus === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                        {getStatusIndicator(pageState.systemStatus.aiSystemsStatus).text}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Utilisateurs actifs</span>
                                    <span className="font-medium">{pageState.systemStatus.activeUsers}</span>
                                </div>

                                <hr className="my-3" />

                                <Button size="sm" variant="outline" className="w-full">
                                    Vérifier les mises à jour
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CODAMainPage;