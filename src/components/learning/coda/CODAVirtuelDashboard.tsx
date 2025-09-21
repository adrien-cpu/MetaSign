/**
 * @fileoverview Composant principal du tableau de bord CODA Virtuel
 * Chemin: src/components/learning/coda/CODAVirtuelDashboard.tsx
 * 
 * Interface utilisateur principale pour le système d'apprentissage inversé CODA,
 * permettant aux utilisateurs d'enseigner à un avatar IA et de suivre sa progression.
 * 
 * @author MetaSign AI Team
 * @version 1.0.0
 * @since 2024
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Progress from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
    User,
    Trophy,
    Target,
    BookOpen,
    Brain,
    Star,
    TrendingUp,
    Award,
    ChevronRight,
    Play,
    Pause,
    RotateCcw
} from 'lucide-react';

// Types pour le dashboard CODA
interface CODASession {
    id: string;
    studentLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    theme: string;
    duration: number;
    progress: number;
    mistakes: number;
    improvements: string[];
    status: 'active' | 'completed' | 'paused';
    createdAt: Date;
}

interface TeachingStats {
    totalSessions: number;
    totalMinutes: number;
    avgProgress: number;
    bestSubject: string;
    currentStreak: number;
    totalBadgesEarned: number;
    studentImprovements: number;
}

interface AvatarStudent {
    id: string;
    name: string;
    currentLevel: string;
    overallProgress: number;
    strengths: string[];
    weaknesses: string[];
    nextLesson: string;
    mood: 'enthusiastic' | 'focused' | 'struggling' | 'confident';
}

/**
 * Composant principal du tableau de bord CODA Virtuel
 * 
 * Fonctionnalités:
 * - Vue d'ensemble des sessions d'enseignement
 * - Suivi de la progression de l'avatar étudiant
 * - Statistiques et métriques d'enseignement
 * - Interface de gestion des leçons
 */
const CODAVirtuelDashboard: React.FC = () => {
    // États du composant
    const [activeSession, setActiveSession] = useState<CODASession | null>(null);
    const [teachingStats, setTeachingStats] = useState<TeachingStats>({
        totalSessions: 0,
        totalMinutes: 0,
        avgProgress: 0,
        bestSubject: '',
        currentStreak: 0,
        totalBadgesEarned: 0,
        studentImprovements: 0
    });
    const [avatarStudent, setAvatarStudent] = useState<AvatarStudent>({
        id: 'student-001',
        name: 'Alex',
        currentLevel: 'A2',
        overallProgress: 65,
        strengths: ['Vocabulaire de base', 'Expressions faciales'],
        weaknesses: ['Grammaire spatiale', 'Composantes non-manuelles'],
        nextLesson: 'Les émotions en LSF',
        mood: 'enthusiastic'
    });
    const [isLoading, setIsLoading] = useState(true);

    // Simulation du chargement des données
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setIsLoading(true);
                // Simulation d'appel API
                await new Promise(resolve => setTimeout(resolve, 1000));

                setTeachingStats({
                    totalSessions: 24,
                    totalMinutes: 720,
                    avgProgress: 78,
                    bestSubject: 'Vocabulaire familial',
                    currentStreak: 7,
                    totalBadgesEarned: 12,
                    studentImprovements: 156
                });
            } catch (error) {
                console.error('Erreur lors du chargement des données:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // Handlers
    const handleStartNewSession = useCallback(() => {
        const newSession: CODASession = {
            id: `session-${Date.now()}`,
            studentLevel: avatarStudent.currentLevel as CODASession['studentLevel'],
            theme: avatarStudent.nextLesson,
            duration: 0,
            progress: 0,
            mistakes: 0,
            improvements: [],
            status: 'active',
            createdAt: new Date()
        };
        setActiveSession(newSession);
    }, [avatarStudent]);

    const handlePauseSession = useCallback(() => {
        if (activeSession) {
            setActiveSession({ ...activeSession, status: 'paused' });
        }
    }, [activeSession]);

    const handleResumeSession = useCallback(() => {
        if (activeSession) {
            setActiveSession({ ...activeSession, status: 'active' });
        }
    }, [activeSession]);

    const handleEndSession = useCallback(() => {
        if (activeSession) {
            setActiveSession({ ...activeSession, status: 'completed' });
            // Mise à jour des statistiques
            setTeachingStats(prev => ({
                ...prev,
                totalSessions: prev.totalSessions + 1,
                totalMinutes: prev.totalMinutes + activeSession.duration
            }));
            // Reset de la session active après un délai
            setTimeout(() => setActiveSession(null), 3000);
        }
    }, [activeSession]);

    // Fonction pour obtenir la couleur du badge selon le niveau
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

    // Fonction pour obtenir l'emoji selon l'humeur
    const getMoodEmoji = (mood: AvatarStudent['mood']) => {
        const emojiMap: Record<AvatarStudent['mood'], string> = {
            'enthusiastic': '😊',
            'focused': '🤔',
            'struggling': '😓',
            'confident': '😎'
        };
        return emojiMap[mood];
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Chargement du tableau de bord CODA...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">CODA Virtuel</h1>
                    <p className="text-gray-600 mt-1">
                        Enseignez la LSF à votre avatar étudiant et développez vos compétences pédagogiques
                    </p>
                </div>
                {!activeSession ? (
                    <Button onClick={handleStartNewSession} className="bg-blue-600 hover:bg-blue-700">
                        <Play className="w-4 h-4 mr-2" />
                        Nouvelle session
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        {activeSession.status === 'active' ? (
                            <Button onClick={handlePauseSession} variant="outline">
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                            </Button>
                        ) : (
                            <Button onClick={handleResumeSession} className="bg-green-600 hover:bg-green-700">
                                <Play className="w-4 h-4 mr-2" />
                                Reprendre
                            </Button>
                        )}
                        <Button onClick={handleEndSession} variant="destructive">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Terminer
                        </Button>
                    </div>
                )}
            </div>

            {/* Session active */}
            {activeSession && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${activeSession.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                                }`}></div>
                            Session en cours - {activeSession.theme}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Niveau étudiant</p>
                                <Badge className={getLevelBadgeColor(activeSession.studentLevel)}>
                                    {activeSession.studentLevel}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Progression</p>
                                <div className="flex items-center gap-2">
                                    <Progress value={activeSession.progress} className="flex-1" />
                                    <span className="text-sm font-medium">{activeSession.progress}%</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Durée</p>
                                <p className="font-medium">{Math.floor(activeSession.duration / 60)}min {activeSession.duration % 60}s</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Erreurs corrigées</p>
                                <p className="font-medium">{activeSession.mistakes}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                    <TabsTrigger value="student">Étudiant Avatar</TabsTrigger>
                    <TabsTrigger value="progress">Progression</TabsTrigger>
                    <TabsTrigger value="badges">Récompenses</TabsTrigger>
                </TabsList>

                {/* Vue d'ensemble */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Sessions totales</p>
                                        <p className="text-2xl font-bold">{teachingStats.totalSessions}</p>
                                    </div>
                                    <BookOpen className="w-8 h-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Temps d'enseignement</p>
                                        <p className="text-2xl font-bold">{Math.floor(teachingStats.totalMinutes / 60)}h</p>
                                    </div>
                                    <Target className="w-8 h-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Progression moyenne</p>
                                        <p className="text-2xl font-bold">{teachingStats.avgProgress}%</p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Série actuelle</p>
                                        <p className="text-2xl font-bold">{teachingStats.currentStreak}</p>
                                    </div>
                                    <Trophy className="w-8 h-8 text-yellow-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Étudiant Avatar */}
                <TabsContent value="student" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    {avatarStudent.name} {getMoodEmoji(avatarStudent.mood)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">Niveau actuel</span>
                                        <Badge className={getLevelBadgeColor(avatarStudent.currentLevel)}>
                                            {avatarStudent.currentLevel}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Progress value={avatarStudent.overallProgress} className="flex-1" />
                                        <span className="text-sm font-medium">{avatarStudent.overallProgress}%</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Prochaine leçon</p>
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <span className="font-medium">{avatarStudent.nextLesson}</span>
                                        <ChevronRight className="w-4 h-4 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="w-5 h-5" />
                                    Analyse des compétences
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Points forts</p>
                                    <div className="flex flex-wrap gap-2">
                                        {avatarStudent.strengths.map((strength, index) => (
                                            <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                                                {strength}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Axes d'amélioration</p>
                                    <div className="flex flex-wrap gap-2">
                                        {avatarStudent.weaknesses.map((weakness, index) => (
                                            <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                                                {weakness}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Progression */}
                <TabsContent value="progress" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Évolution des performances</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-gray-500">
                                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Graphique de progression en cours de développement</p>
                                <p className="text-sm">Les métriques détaillées seront affichées ici</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Récompenses */}
                <TabsContent value="badges" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardContent className="p-6 text-center">
                                <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                                <h3 className="font-semibold mb-2">Premier pas</h3>
                                <p className="text-sm text-gray-600">Première session d'enseignement complétée</p>
                                <Badge className="mt-2 bg-yellow-100 text-yellow-800">Obtenu</Badge>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6 text-center">
                                <Star className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                                <h3 className="font-semibold mb-2">Mentor patient</h3>
                                <p className="text-sm text-gray-600">Aidé l'étudiant à corriger 50 erreurs</p>
                                <Badge className="mt-2 bg-blue-100 text-blue-800">Obtenu</Badge>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6 text-center">
                                <Trophy className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                                <h3 className="font-semibold mb-2">Série de réussite</h3>
                                <p className="text-sm text-gray-600">7 sessions consécutives réussies</p>
                                <Badge className="mt-2 bg-purple-100 text-purple-800">En cours (7/10)</Badge>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CODAVirtuelDashboard;