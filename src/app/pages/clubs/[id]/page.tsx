/**
 * @fileoverview Page moderne de club LSF avec chat intégré
 * @path src/app/pages/clubs/[id]/page.tsx
 * @description Interface révolutionnaire pour l'expérience club avec chat temps réel
 * @author MetaSign Team
 * @version 3.0.0
 * @since 2025-01-08
 * 
 * @features
 * - Design glassmorphism avec gradients dynamiques
 * - Chat temps réel intégré pour les membres
 * - Animations fluides et micro-interactions
 * - Dashboard interactif des activités
 * - Système de badges et progression
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
//import { ClubPosts } from '@/components/club/ClubPosts';
import {
    Users,
    BookOpen,
    MessageCircle,
    Send,
    Star,
    Calendar,
    TrendingUp,
    Sparkles,
    Video,
    Settings,
    Smile,
    Paperclip,
    Phone,
    Globe,
    Trophy,
    Target,
    Zap,
    Clock,
    FileText,
    Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Interface pour les données d'un club moderne
 */
interface ModernClubData {
    id: string;
    name: string;
    description: string;
    memberCount: number;
    isJoined: boolean;
    category: string;
    level: 'Débutant' | 'Intermédiaire' | 'Avancé';
    coverImage: string;
    badges: string[];
    weeklyGoal: number;
    currentProgress: number;
    onlineMembers: number;
    totalLessons: number;
    completedLessons: number;
}

/**
 * Interface pour les messages du chat
 */
interface ChatMessage {
    id: string;
    user: {
        name: string;
        avatar: string;
        isOnline: boolean;
    };
    content: string;
    timestamp: Date;
    reactions: { emoji: string; count: number; users: string[] }[];
}

/**
 * Interface pour les membres en ligne
 */
interface OnlineMember {
    id: string;
    name: string;
    avatar: string;
    role: 'member' | 'moderator' | 'admin';
    status: 'active' | 'away' | 'busy';
}

/**
 * Interface pour les activités du club
 */
interface ClubActivity {
    id: string;
    title: string;
    type: 'lesson' | 'challenge' | 'event' | 'discussion';
    status: 'active' | 'completed' | 'upcoming';
    participants: number;
    difficulty: 1 | 2 | 3 | 4 | 5;
    duration: string;
    description: string;
}

/**
 * Page de club LSF ultra-moderne avec chat intégré
 */
export default function ModernClubPage() {
    // États pour le club
    const [club, setClub] = useState<ModernClubData>({
        id: 'club-lsf-avance',
        name: 'LSF Expressions Avancées 🚀',
        description: 'Maîtrisez les expressions complexes et les nuances subtiles de la LSF avec notre communauté passionnée.',
        memberCount: 247,
        isJoined: false,
        category: 'Perfectionnement',
        level: 'Avancé',
        coverImage: '/api/placeholder/800/300',
        badges: ['Expert LSF', 'Mentor', 'Innovateur'],
        weeklyGoal: 5,
        currentProgress: 3,
        onlineMembers: 23,
        totalLessons: 48,
        completedLessons: 32
    });

    // États pour le chat
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            user: { name: 'Marie L.', avatar: '👩‍🦰', isOnline: true },
            content: 'Bonjour tout le monde ! Qui a essayé le nouveau défi cette semaine ? 🎯',
            timestamp: new Date(Date.now() - 300000),
            reactions: [{ emoji: '👋', count: 3, users: ['user1', 'user2', 'user3'] }]
        },
        {
            id: '2',
            user: { name: 'Thomas K.', avatar: '👨‍💼', isOnline: true },
            content: 'Salut Marie ! Oui j&apos;ai terminé hier, vraiment enrichissant ! Les expressions de politesse étaient particulièrement intéressantes 🤝',
            timestamp: new Date(Date.now() - 240000),
            reactions: [{ emoji: '💡', count: 2, users: ['user1', 'user4'] }]
        },
        {
            id: '3',
            user: { name: 'Sophie M.', avatar: '👩‍🎓', isOnline: false },
            content: 'Est-ce que quelqu&apos;un peut m&apos;aider avec la leçon sur les marqueurs temporels ? Je trouve ça complexe 🤔',
            timestamp: new Date(Date.now() - 180000),
            reactions: [{ emoji: '🤝', count: 4, users: ['user1', 'user2', 'user5', 'user6'] }]
        }
    ]);

    const [newMessage, setNewMessage] = useState('');
    const [onlineMembers] = useState<OnlineMember[]>([
        { id: '1', name: 'Marie L.', avatar: '👩‍🦰', role: 'moderator', status: 'active' },
        { id: '2', name: 'Thomas K.', avatar: '👨‍💼', role: 'member', status: 'active' },
        { id: '3', name: 'Alex D.', avatar: '👨‍🎨', role: 'admin', status: 'active' },
        { id: '4', name: 'Julie R.', avatar: '👩‍💻', role: 'member', status: 'away' },
        { id: '5', name: 'Pierre L.', avatar: '👨‍🔬', role: 'member', status: 'active' }
    ]);

    const [activities] = useState<ClubActivity[]>([
        {
            id: '1',
            title: 'Expressions Émotionnelles Complexes',
            type: 'lesson',
            status: 'active',
            participants: 156,
            difficulty: 4,
            duration: '45 min',
            description: 'Apprenez à exprimer des émotions nuancées en LSF'
        },
        {
            id: '2',
            title: 'Défi Conversation Spontanée',
            type: 'challenge',
            status: 'active',
            participants: 89,
            difficulty: 5,
            duration: '30 min',
            description: 'Participez à des conversations improvisées'
        },
        {
            id: '3',
            title: 'Webinaire: LSF et Technologie',
            type: 'event',
            status: 'upcoming',
            participants: 203,
            difficulty: 3,
            duration: '1h 30min',
            description: 'Découvrez les innovations technologiques en LSF'
        }
    ]);

    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'chat' | 'activities'>('overview');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll automatique pour les nouveaux messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    /**
     * Gère l'adhésion au club avec animations
     */
    const handleMembershipToggle = async () => {
        setIsLoading(true);

        const loadingToastId = toast.loading(
            club.isJoined ? 'Vous quittez le club...' : 'Vous rejoignez le club...',
            { description: 'Traitement de votre demande en cours' }
        );

        try {
            // Simulation API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            setClub(prev => ({
                ...prev,
                isJoined: !prev.isJoined,
                memberCount: prev.memberCount + (prev.isJoined ? -1 : 1)
            }));

            toast.dismiss(loadingToastId);

            if (!club.isJoined) {
                toast.success('🎉 Bienvenue dans le club !', {
                    description: `Vous avez rejoint "${club.name}" avec succès.`,
                    duration: 5000,
                    action: {
                        label: 'Découvrir',
                        onClick: () => {
                            // Action pour découvrir le club
                            const element = document.getElementById('club-activities');
                            element?.scrollIntoView({ behavior: 'smooth' });
                        }
                    }
                });
            } else {
                toast.info('👋 À bientôt !', {
                    description: `Vous avez quitté "${club.name}". Vous pouvez le rejoindre à tout moment.`,
                    duration: 4000
                });
            }

        } catch (error) {
            console.error('Erreur lors du toggle membership:', error);
            toast.dismiss(loadingToastId);
            toast.error('❌ Erreur de connexion', {
                description: 'Impossible de modifier votre adhésion. Veuillez réessayer.',
                duration: 6000
            });
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Envoie un nouveau message dans le chat
     */
    const handleSendMessage = () => {
        if (!newMessage.trim() || !club.isJoined) return;

        const message: ChatMessage = {
            id: Date.now().toString(),
            user: { name: 'Vous', avatar: '😊', isOnline: true },
            content: newMessage,
            timestamp: new Date(),
            reactions: []
        };

        setMessages(prev => [...prev, message]);
        setNewMessage('');

        toast.success('💬 Message envoyé !', {
            description: 'Votre message a été partagé avec la communauté',
            duration: 2000
        });
    };

    /**
     * Ajoute une réaction à un message
     */
    const handleReaction = (messageId: string, emoji: string) => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
                const existingReaction = msg.reactions.find(r => r.emoji === emoji);
                if (existingReaction) {
                    existingReaction.count += 1;
                    existingReaction.users.push('current-user');
                } else {
                    msg.reactions.push({ emoji, count: 1, users: ['current-user'] });
                }
            }
            return msg;
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900">
            {/* Hero Section avec effet parallax */}
            <motion.div
                className="relative h-80 overflow-hidden"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-90" />
                <div className="absolute inset-0 backdrop-blur-sm bg-black/20" />
                <div className="relative z-10 container mx-auto px-6 py-12 flex items-center justify-between h-full">
                    <motion.div
                        className="text-white max-w-2xl"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <h1 className="text-4xl font-bold">{club.name}</h1>
                            <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
                        </div>
                        <p className="text-xl text-blue-100 mb-6">{club.description}</p>
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                <span>{club.memberCount} membres</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="w-5 h-5" />
                                <span>{club.onlineMembers} en ligne</span>
                            </div>
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                {club.level}
                            </Badge>
                        </div>
                    </motion.div>
                    <motion.div
                        className="text-right"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <Button
                            onClick={handleMembershipToggle}
                            disabled={isLoading}
                            size="lg"
                            className={`px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105
            ${club.isJoined
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-white text-purple-600 hover:bg-blue-50'
                                }
            shadow-2xl backdrop-blur-sm`}
                        >
                            {isLoading ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                </motion.div>
                            ) : null}
                            {club.isJoined ? 'Quitter le club' : 'Rejoindre le club'}
                        </Button>
                    </motion.div>
                </div>
            </motion.div>

            {/* Layout principal */}
            <div className="container mx-auto px-6 py-8">
                {/* Navigation par onglets */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0 shadow-xl">
                        <CardContent className="p-2">
                            <div className="flex items-center gap-2 overflow-x-auto">
                                <Button
                                    variant={activeTab === 'overview' ? 'default' : 'ghost'}
                                    onClick={() => setActiveTab('overview')}
                                    className={`flex items-center gap-2 whitespace-nowrap ${activeTab === 'overview'
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                            : 'hover:bg-blue-50 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <Trophy className="w-4 h-4" />
                                    Vue d&quot;ensemble
                                </Button>
                                <Button
                                    variant={activeTab === 'posts' ? 'default' : 'ghost'}
                                    onClick={() => setActiveTab('posts')}
                                    className={`flex items-center gap-2 whitespace-nowrap ${activeTab === 'posts'
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                            : 'hover:bg-blue-50 dark:hover:bg-slate-700'
                                        }`}
                                    disabled={!club.isJoined}
                                >
                                    <FileText className="w-4 h-4" />
                                    Posts
                                    {!club.isJoined && <span className="text-xs opacity-70">(Membres)</span>}
                                </Button>
                                <Button
                                    variant={activeTab === 'chat' ? 'default' : 'ghost'}
                                    onClick={() => setActiveTab('chat')}
                                    className={`flex items-center gap-2 whitespace-nowrap ${activeTab === 'chat'
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                            : 'hover:bg-blue-50 dark:hover:bg-slate-700'
                                        }`}
                                    disabled={!club.isJoined}
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Chat
                                    {!club.isJoined && <span className="text-xs opacity-70">(Membres)</span>}
                                </Button>
                                <Button
                                    variant={activeTab === 'activities' ? 'default' : 'ghost'}
                                    onClick={() => setActiveTab('activities')}
                                    className={`flex items-center gap-2 whitespace-nowrap ${activeTab === 'activities'
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                            : 'hover:bg-blue-50 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <Activity className="w-4 h-4" />
                                    Activités
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Contenu des onglets */}
                <div className="min-h-[600px]">
                    {/* Onglet Vue d'ensemble */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Colonne principale - Activités et Progression */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Dashboard de progression */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0 shadow-2xl">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                                    <Trophy className="w-6 h-6 text-yellow-500" />
                                                    Votre Progression
                                                </h2>
                                                <div className="flex gap-2">
                                                    {club.badges.map((badge, index) => (
                                                        <Badge key={index} variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                            {badge}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {/* Progression hebdomadaire */}
                                                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                                                    <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                                    <div className="text-2xl font-bold text-blue-600">{club.currentProgress}/{club.weeklyGoal}</div>
                                                    <div className="text-sm text-blue-500">Objectif hebdomadaire</div>
                                                    <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                                                        <motion.div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(club.currentProgress / club.weeklyGoal) * 100}%` }}
                                                            transition={{ delay: 0.5, duration: 1 }}
                                                        />
                                                    </div>
                                                </div>
                                                {/* Leçons terminées */}
                                                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl">
                                                    <BookOpen className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                                                    <div className="text-2xl font-bold text-emerald-600">{club.completedLessons}/{club.totalLessons}</div>
                                                    <div className="text-sm text-emerald-500">Leçons complétées</div>
                                                    <div className="w-full bg-emerald-200 rounded-full h-2 mt-2">
                                                        <motion.div
                                                            className="bg-emerald-600 h-2 rounded-full"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(club.completedLessons / club.totalLessons) * 100}%` }}
                                                            transition={{ delay: 0.7, duration: 1 }}
                                                        />
                                                    </div>
                                                </div>
                                                {/* Niveau d'engagement */}
                                                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                                                    <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                                    <div className="text-2xl font-bold text-purple-600">92%</div>
                                                    <div className="text-sm text-purple-500">Niveau d&quot;engagement</div>
                                                    <div className="flex justify-center mt-2">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                                {/* Activités du club */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0 shadow-2xl">
                                        <CardContent className="p-6">
                                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                                                <Calendar className="w-6 h-6 text-blue-500" />
                                                Activités du Club
                                            </h2>
                                            <div className="space-y-4">
                                                {activities.map((activity, index) => (
                                                    <motion.div
                                                        key={activity.id}
                                                        className="p-4 rounded-xl bg-gradient-to-r from-white to-blue-50 dark:from-slate-700 dark:to-slate-600 border border-blue-100 dark:border-slate-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
                                                        whileHover={{ scale: 1.02, y: -2 }}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.1 * index }}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <div className={`w-3 h-3 rounded-full ${activity.status === 'active' ? 'bg-green-500' :
                                                                            activity.status === 'upcoming' ? 'bg-yellow-500' : 'bg-gray-500'
                                                                        }`} />
                                                                    <h3 className="font-semibold text-slate-800 dark:text-white">{activity.title}</h3>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {activity.type === 'lesson' ? '📚 Leçon' :
                                                                            activity.type === 'challenge' ? '🎯 Défi' :
                                                                                activity.type === 'event' ? '🎪 Événement' : '💬 Discussion'}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{activity.description}</p>
                                                                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                                                    <span className="flex items-center gap-1">
                                                                        <Users className="w-3 h-3" />
                                                                        {activity.participants} participants
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <TrendingUp className="w-3 h-3" />
                                                                        Niveau {activity.difficulty}/5
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        {activity.duration}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                                                            >
                                                                {activity.status === 'upcoming' ? "S'inscrire" : 'Participer'}
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>
                            {/* Colonne latérale - Chat et Membres */}
                            <div className="space-y-6">
                                {/* Membres en ligne */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0 shadow-2xl">
                                        <CardContent className="p-4">
                                            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                                Membres en ligne ({club.onlineMembers})
                                            </h3>
                                            <div className="space-y-2">
                                                {onlineMembers.slice(0, 5).map((member) => (
                                                    <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                                                        <div className="relative">
                                                            <div className="text-2xl">{member.avatar}</div>
                                                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${member.status === 'active' ? 'bg-green-500' :
                                                                    member.status === 'away' ? 'bg-yellow-500' : 'bg-red-500'
                                                                }`} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-medium text-sm text-slate-800 dark:text-white">{member.name}</div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                                {member.role === 'admin' ? '👑 Admin' :
                                                                    member.role === 'moderator' ? '🛡️ Moderator' : '👤 Membre'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                                {/* Chat du club */}
                                {club.isJoined && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0 shadow-2xl">
                                            <CardContent className="p-0">
                                                {/* En-tête du chat */}
                                                <div className="p-4 border-b border-slate-200 dark:border-slate-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 rounded-t-lg">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                                            <MessageCircle className="w-5 h-5 text-blue-500" />
                                                            Chat du Club
                                                        </h3>
                                                        <div className="flex gap-2">
                                                            <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                                                                <Video className="w-4 h-4" />
                                                            </Button>
                                                            <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                                                                <Phone className="w-4 h-4" />
                                                            </Button>
                                                            <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                                                                <Settings className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Messages */}
                                                <div className="h-80 overflow-y-auto p-4 space-y-4">
                                                    <AnimatePresence>
                                                        {messages.map((message) => (
                                                            <motion.div
                                                                key={message.id}
                                                                className="flex gap-3"
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -20 }}
                                                            >
                                                                <div className="text-2xl">{message.user.avatar}</div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="font-medium text-sm text-slate-800 dark:text-white">
                                                                            {message.user.name}
                                                                        </span>
                                                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    </div>
                                                                    <div className="bg-blue-50 dark:bg-slate-700 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-200">
                                                                        {message.content}
                                                                    </div>
                                                                    {message.reactions.length > 0 && (
                                                                        <div className="flex gap-1 mt-2">
                                                                            {message.reactions.map((reaction, index) => (
                                                                                <button
                                                                                    key={index}
                                                                                    className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-600 rounded-full text-xs hover:bg-blue-50 dark:hover:bg-slate-500 transition-colors"
                                                                                    onClick={() => handleReaction(message.id, reaction.emoji)}
                                                                                >
                                                                                    <span>{reaction.emoji}</span>
                                                                                    <span>{reaction.count}</span>
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                    <div ref={messagesEndRef} />
                                                </div>
                                                {/* Zone de saisie */}
                                                <div className="p-4 border-t border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50">
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={newMessage}
                                                            onChange={(e) => setNewMessage(e.target.value)}
                                                            placeholder="Tapez votre message..."
                                                            className="flex-1 px-4 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                        />
                                                        <Button size="sm" variant="ghost" className="w-10 h-10 p-0">
                                                            <Smile className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="w-10 h-10 p-0">
                                                            <Paperclip className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            onClick={handleSendMessage}
                                                            disabled={!newMessage.trim()}
                                                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 px-4"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}
                                {/* Invitation à rejoindre si pas membre */}
                                {!club.isJoined && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-2xl">
                                            <CardContent className="p-6 text-center">
                                                <Sparkles className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
                                                <h3 className="text-xl font-bold mb-2">Rejoignez la conversation !</h3>
                                                <p className="text-blue-100 mb-4">
                                                    Connectez-vous avec {club.memberCount} passionnés de LSF et participez aux discussions en temps réel.
                                                </p>
                                                <Button
                                                    onClick={handleMembershipToggle}
                                                    className="bg-white text-purple-600 hover:bg-blue-50 font-semibold"
                                                >
                                                    Rejoindre maintenant
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}