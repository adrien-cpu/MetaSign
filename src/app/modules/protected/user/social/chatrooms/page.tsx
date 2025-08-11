/**
 * @fileoverview Exemple d'intégration du chat moderne dans l'application
 * @path src/app/modules/protected/user/social/chatrooms/page.tsx
 * @description Page dédiée aux salles de chat avec le composant ModernChat
 * @author MetaSign Team
 * @version 3.0.0
 * @since 2025-01-08
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ModernChat, ChatMessage } from '@/components/chat/ModernChat';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Users,
    MessageCircle,
    Globe,
    Lock,
    Star,
    Search,
    Filter,
    Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

/**
 * Interface pour une salle de chat
 */
interface ChatRoom {
    id: string;
    name: string;
    description: string;
    type: 'public' | 'private' | 'club';
    memberCount: number;
    onlineCount: number;
    isJoined: boolean;
    lastActivity: Date;
    unreadCount: number;
    category: string;
    level: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Tous niveaux';
    avatar: string;
}

/**
 * Page des salles de chat modernes
 */
export default function ChatRoomsPage() {
    // État de l'utilisateur actuel
    const [currentUser] = useState({
        id: 'current-user',
        name: 'Adrien Simon',
        avatar: '👨‍💻'
    });

    // État des salles de chat
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
        {
            id: 'lsf-general',
            name: 'LSF Général',
            description: 'Discussion générale sur la Langue des Signes Française',
            type: 'public',
            memberCount: 1247,
            onlineCount: 89,
            isJoined: true,
            lastActivity: new Date(),
            unreadCount: 3,
            category: 'Général',
            level: 'Tous niveaux',
            avatar: '🤟'
        },
        {
            id: 'lsf-avance',
            name: 'LSF Avancée',
            description: 'Discussions techniques et expressions complexes',
            type: 'public',
            memberCount: 456,
            onlineCount: 23,
            isJoined: true,
            lastActivity: new Date(Date.now() - 300000),
            unreadCount: 0,
            category: 'Apprentissage',
            level: 'Avancé',
            avatar: '🎓'
        },
        {
            id: 'club-enseignants',
            name: 'Club Enseignants',
            description: 'Espace privé pour les formateurs LSF',
            type: 'private',
            memberCount: 34,
            onlineCount: 7,
            isJoined: false,
            lastActivity: new Date(Date.now() - 600000),
            unreadCount: 0,
            category: 'Professionnel',
            level: 'Tous niveaux',
            avatar: '👩‍🏫'
        },
        {
            id: 'aide-debutants',
            name: 'Aide Débutants',
            description: 'Entraide et conseils pour commencer la LSF',
            type: 'public',
            memberCount: 892,
            onlineCount: 45,
            isJoined: true,
            lastActivity: new Date(Date.now() - 120000),
            unreadCount: 7,
            category: 'Entraide',
            level: 'Débutant',
            avatar: '🌱'
        }
    ]);

    // État du chat actuel
    const [activeChat, setActiveChat] = useState<string | null>('lsf-general');
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            user: { id: 'user1', name: 'Marie Dubois', avatar: '👩‍🦰', isOnline: true, role: 'moderator' },
            content: 'Bonjour à tous ! N\'hésitez pas à poser vos questions sur la LSF ici 😊',
            type: 'text',
            timestamp: new Date(Date.now() - 1800000),
            reactions: [{ emoji: '👋', count: 5, users: ['user2', 'user3', 'user4', 'user5', 'user6'] }],
            isRead: true,
            isDelivered: true
        },
        {
            id: '2',
            user: { id: 'user2', name: 'Thomas Martin', avatar: '👨‍💼', isOnline: true },
            content: 'Salut tout le monde ! Je débute en LSF, des conseils pour bien commencer ?',
            type: 'text',
            timestamp: new Date(Date.now() - 1200000),
            reactions: [
                { emoji: '🤝', count: 3, users: ['user1', 'user3', 'user4'] },
                { emoji: '💡', count: 2, users: ['user1', 'user5'] }
            ],
            isRead: true,
            isDelivered: true
        },
        {
            id: '3',
            user: { id: 'user3', name: 'Sophie Lambert', avatar: '👩‍🎓', isOnline: false },
            content: 'Je recommande de commencer par l\'alphabet dactylologique et les nombres. C\'est la base ! 📚',
            type: 'text',
            timestamp: new Date(Date.now() - 900000),
            reactions: [{ emoji: '👍', count: 8, users: ['user1', 'user2', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9'] }],
            isRead: true,
            isDelivered: true
        },
        {
            id: '4',
            user: { id: 'user4', name: 'Pierre Rousseau', avatar: '👨‍🔬', isOnline: true },
            content: 'Excellente suggestion Sophie ! Et n\'oubliez pas de pratiquer devant un miroir pour voir vos propres signes 🪞',
            type: 'text',
            timestamp: new Date(Date.now() - 600000),
            reactions: [{ emoji: '💡', count: 4, users: ['user1', 'user2', 'user3', 'user5'] }],
            isRead: true,
            isDelivered: true
        }
    ]);

    const [typingUsers, setTypingUsers] = useState<{ id: string; name: string; avatar: string }[]>([]);

    /**
     * Gère l'envoi d'un nouveau message
     */
    const handleSendMessage = (content: string, type: ChatMessage['type'], attachments?: any[]) => {
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            user: {
                id: currentUser.id,
                name: currentUser.name,
                avatar: currentUser.avatar,
                isOnline: true
            },
            content,
            type,
            timestamp: new Date(),
            reactions: [],
            isRead: false,
            isDelivered: true
        };

        setMessages(prev => [...prev, newMessage]);

        // Simulation de livraison et lecture
        setTimeout(() => {
            setMessages(prev => prev.map(msg =>
                msg.id === newMessage.id ? { ...msg, isDelivered: true } : msg
            ));
        }, 500);

        setTimeout(() => {
            setMessages(prev => prev.map(msg =>
                msg.id === newMessage.id ? { ...msg, isRead: true } : msg
            ));
        }, 2000);
    };

    /**
     * Gère les réactions sur les messages
     */
    const handleReaction = (messageId: string, emoji: string) => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
                const existingReaction = msg.reactions.find(r => r.emoji === emoji);

                if (existingReaction) {
                    // Si l'utilisateur a déjà réagi avec cet emoji, le retirer
                    if (existingReaction.users.includes(currentUser.id)) {
                        existingReaction.count -= 1;
                        existingReaction.users = existingReaction.users.filter(id => id !== currentUser.id);

                        // Supprimer la réaction si plus personne ne l'a
                        if (existingReaction.count === 0) {
                            msg.reactions = msg.reactions.filter(r => r.emoji !== emoji);
                        }
                    } else {
                        // Ajouter la réaction de l'utilisateur
                        existingReaction.count += 1;
                        existingReaction.users.push(currentUser.id);
                    }
                } else {
                    // Nouvelle réaction
                    msg.reactions.push({
                        emoji,
                        count: 1,
                        users: [currentUser.id]
                    });
                }
            }
            return msg;
        }));
    };

    /**
     * Gère le typing indicator
     */
    const handleTyping = (isTyping: boolean) => {
        if (isTyping) {
            // Simulation d'autres utilisateurs qui tapent
            const simulatedUser = {
                id: 'typing-user',
                name: 'Julie Martin',
                avatar: '👩‍💻'
            };

            setTypingUsers(prev => {
                if (!prev.find(u => u.id === simulatedUser.id)) {
                    return [...prev, simulatedUser];
                }
                return prev;
            });

            // Retirer après 3 secondes
            setTimeout(() => {
                setTypingUsers(prev => prev.filter(u => u.id !== simulatedUser.id));
            }, 3000);
        }
    };

    /**
     * Rejoint une salle de chat
     */
    const handleJoinRoom = (roomId: string) => {
        setChatRooms(prev => prev.map(room =>
            room.id === roomId
                ? { ...room, isJoined: true, memberCount: room.memberCount + 1 }
                : room
        ));

        toast.success('🎉 Salle rejointe !', {
            description: `Vous avez rejoint la salle de chat`,
            duration: 3000
        });

        setActiveChat(roomId);
    };

    /**
     * Change de salle de chat active
     */
    const handleRoomSelect = (roomId: string) => {
        const room = chatRooms.find(r => r.id === roomId);

        if (room?.isJoined) {
            setActiveChat(roomId);

            // Marquer les messages comme lus
            setChatRooms(prev => prev.map(r =>
                r.id === roomId ? { ...r, unreadCount: 0 } : r
            ));
        } else {
            handleJoinRoom(roomId);
        }
    };

    // Trouver la salle active
    const activeChatRoom = chatRooms.find(room => room.id === activeChat);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-900 dark:to-purple-900">
            <div className="container mx-auto px-6 py-8">

                {/* En-tête */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                                💬 Salles de Chat LSF
                            </h1>
                            <p className="text-slate-600 dark:text-slate-300">
                                Rejoignez la communauté et échangez avec les passionnés de LSF
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" className="flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                Rechercher
                            </Button>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Filtrer
                            </Button>
                            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Créer une salle
                            </Button>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Liste des salles */}
                    <motion.div
                        className="lg:col-span-1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0 shadow-xl">
                            <CardContent className="p-4">
                                <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5" />
                                    Salles disponibles
                                </h2>

                                <div className="space-y-3">
                                    {chatRooms.map((room) => (
                                        <motion.div
                                            key={room.id}
                                            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${activeChat === room.id
                                                    ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600'
                                                    : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-600'
                                                }`}
                                            onClick={() => handleRoomSelect(room.id)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">{room.avatar}</span>
                                                    <div>
                                                        <div className="font-medium text-sm text-slate-800 dark:text-white">
                                                            {room.name}
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                                            {room.category}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-1">
                                                    {room.type === 'private' && (
                                                        <Lock className="w-3 h-3 text-amber-500" />
                                                    )}
                                                    {room.unreadCount > 0 && (
                                                        <Badge variant="destructive" className="text-xs h-5 min-w-5 rounded-full">
                                                            {room.unreadCount > 9 ? '9+' : room.unreadCount}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
                                                {room.description}
                                            </p>

                                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {room.memberCount}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                        {room.onlineCount}
                                                    </span>
                                                </div>

                                                <Badge variant="outline" className="text-xs">
                                                    {room.level}
                                                </Badge>
                                            </div>

                                            {!room.isJoined && (
                                                <Button
                                                    size="sm"
                                                    className="w-full mt-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleJoinRoom(room.id);
                                                    }}
                                                >
                                                    Rejoindre
                                                </Button>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Chat principal */}
                    <motion.div
                        className="lg:col-span-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {activeChatRoom ? (
                            <ModernChat
                                chatId={activeChatRoom.id}
                                title={activeChatRoom.name}
                                description={`${activeChatRoom.onlineCount} membres en ligne • ${activeChatRoom.category}`}
                                messages={messages}
                                currentUser={currentUser}
                                onSendMessage={handleSendMessage}
                                onReaction={handleReaction}
                                typingUsers={typingUsers}
                                onTyping={handleTyping}
                                height="h-[600px]"
                                config={{
                                    allowVoice: true,
                                    allowVideo: true,
                                    allowFiles: true,
                                    allowReactions: true,
                                    maxMessageLength: 1000
                                }}
                            />
                        ) : (
                            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0 shadow-xl h-[600px]">
                                <CardContent className="p-8 flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <MessageCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">
                                            Sélectionnez une salle de chat
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400">
                                            Choisissez une salle dans la liste pour commencer à discuter
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}