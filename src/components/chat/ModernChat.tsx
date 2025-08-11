/**
 * @fileoverview Composant de chat moderne et réutilisable
 * @path src/components/chat/ModernChat.tsx
 * @description Système de chat temps réel avec design glassmorphism
 * @author MetaSign Team
 * @version 3.0.0
 * @since 2025-01-08
 * 
 * @features
 * - Interface moderne avec glassmorphism
 * - Messages temps réel avec animations
 * - Système de réactions emoji
 * - Support vidéo/audio
 * - Typing indicators
 * - Statuts de lecture
 * - Partage de fichiers
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Send,
    Smile,
    Paperclip,
    Video,
    Phone,
    Settings,
    Mic,
    MicOff,
    Search,
    Check,
    CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

/**
 * Interface pour les fichiers attachés
 */
interface AttachmentFile {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
}

/**
 * Interface pour un message du chat
 */
export interface ChatMessage {
    id: string;
    user: {
        id: string;
        name: string;
        avatar: string;
        isOnline: boolean;
        role?: 'admin' | 'moderator' | 'member';
    };
    content: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'system';
    timestamp: Date;
    reactions: { emoji: string; count: number; users: string[] }[];
    isRead: boolean;
    isDelivered: boolean;
    isEdited?: boolean;
    replyTo?: string;
    mentions?: string[];
    attachments?: AttachmentFile[];
}

/**
 * Interface pour un utilisateur qui tape
 */
interface TypingUser {
    id: string;
    name: string;
    avatar: string;
}

/**
 * Interface pour les propriétés du composant Chat
 */
interface ModernChatProps {
    /** Messages du chat */
    messages: ChatMessage[];
    /** Utilisateur actuel */
    currentUser: {
        id: string;
        name: string;
        avatar: string;
    };
    /** Callback pour envoyer un message */
    onSendMessage: (content: string, type: ChatMessage['type'], attachments?: AttachmentFile[]) => void;
    /** Callback pour ajouter une réaction */
    onReaction?: (messageId: string, emoji: string) => void;
    /** Callback pour marquer comme lu */
    onMarkAsRead?: (messageId: string) => void;
    /** Utilisateurs en train de taper */
    typingUsers?: TypingUser[];
    /** Callback quand l'utilisateur tape */
    onTyping?: (isTyping: boolean) => void;
    /** Configuration du chat */
    config?: {
        allowVoice?: boolean;
        allowVideo?: boolean;
        allowFiles?: boolean;
        allowReactions?: boolean;
        maxMessageLength?: number;
        theme?: 'light' | 'dark' | 'auto';
    };
    /** Titre du chat */
    title?: string;
    /** Description du chat */
    description?: string;
    /** Hauteur personnalisée */
    height?: string;
    /** Style personnalisé */
    className?: string;
}

/**
 * Emojis de réaction rapide
 */
const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

/**
 * Composant de chat moderne
 */
export function ModernChat({
    messages,
    currentUser,
    onSendMessage,
    onReaction,
    onMarkAsRead,
    typingUsers = [],
    onTyping,
    config = {
        allowVoice: true,
        allowVideo: true,
        allowFiles: true,
        allowReactions: true,
        maxMessageLength: 1000,
        theme: 'auto'
    },
    title = 'Chat',
    description,
    height = 'h-96',
    className = ''
}: ModernChatProps) {

    // États locaux
    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messageInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-scroll vers le bas
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Marquer les messages comme lus
    useEffect(() => {
        const unreadMessages = messages.filter(msg =>
            !msg.isRead && msg.user.id !== currentUser.id
        );

        unreadMessages.forEach(msg => {
            if (onMarkAsRead) {
                onMarkAsRead(msg.id);
            }
        });
    }, [messages, currentUser.id, onMarkAsRead]);

    /**
     * Gère l'envoi d'un message
     */
    const handleSendMessage = useCallback(() => {
        if (!newMessage.trim() && selectedFiles.length === 0) return;

        const messageType: ChatMessage['type'] = selectedFiles.length > 0
            ? (selectedFiles[0].type.startsWith('image/') ? 'image' :
                selectedFiles[0].type.startsWith('video/') ? 'video' : 'file')
            : 'text';

        onSendMessage(newMessage, messageType, selectedFiles);
        setNewMessage('');
        setSelectedFiles([]);
        setReplyTo(null);

        toast.success('💬 Message envoyé !', {
            description: 'Votre message a été livré',
            duration: 2000
        });
    }, [newMessage, selectedFiles, onSendMessage]);

    /**
     * Gère le typing indicator
     */
    const handleTyping = useCallback(() => {
        if (onTyping) {
            onTyping(true);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                onTyping(false);
            }, 1000);
        }
    }, [onTyping]);

    /**
     * Gère les réactions sur un message
     */
    const handleReaction = useCallback((messageId: string, emoji: string) => {
        if (onReaction) {
            onReaction(messageId, emoji);

            toast.success(`Réaction ${emoji} ajoutée !`, {
                duration: 1500
            });
        }
    }, [onReaction]);

    /**
     * Gère la sélection de fichiers
     */
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(prev => [...prev, ...files.filter((file): file is File => file instanceof File)]);
    }, []);

    /**
     * Formate l'horodatage
     */
    const formatTimestamp = (timestamp: Date) => {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'À l\'instant';
        if (minutes < 60) return `${minutes}min`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}j`;
        return timestamp.toLocaleDateString();
    };

    /**
     * Obtient l'icône de statut du message
     */
    const getMessageStatusIcon = (message: ChatMessage) => {
        if (message.user.id !== currentUser.id) return null;

        if (message.isRead) {
            return <CheckCheck className="w-3 h-3 text-blue-500" />;
        } else if (message.isDelivered) {
            return <CheckCheck className="w-3 h-3 text-gray-400" />;
        } else {
            return <Check className="w-3 h-3 text-gray-400" />;
        }
    };

    return (
        <Card className={`bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0 shadow-2xl ${className}`}>
            <CardContent className="p-0">

                {/* En-tête du chat */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 rounded-t-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                {title}
                            </h3>
                            {description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {config.allowVideo && (
                                <Button size="sm" variant="ghost" className="w-8 h-8 p-0 hover:bg-blue-100 dark:hover:bg-slate-600">
                                    <Video className="w-4 h-4" />
                                </Button>
                            )}
                            {config.allowVoice && (
                                <Button size="sm" variant="ghost" className="w-8 h-8 p-0 hover:bg-blue-100 dark:hover:bg-slate-600">
                                    <Phone className="w-4 h-4" />
                                </Button>
                            )}
                            <Button size="sm" variant="ghost" className="w-8 h-8 p-0 hover:bg-blue-100 dark:hover:bg-slate-600">
                                <Search className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="w-8 h-8 p-0 hover:bg-blue-100 dark:hover:bg-slate-600">
                                <Settings className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Zone de réponse */}
                {replyTo && (
                    <div className="p-3 bg-blue-50 dark:bg-slate-700 border-l-4 border-blue-500 mx-4 mt-4 rounded">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                    Répondre à {replyTo.user.name}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-300 truncate">
                                    {replyTo.content}
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="w-6 h-6 p-0"
                                onClick={() => setReplyTo(null)}
                            >
                                ×
                            </Button>
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className={`${height} overflow-y-auto p-4 space-y-4`}>
                    <AnimatePresence>
                        {messages.map((message, index) => {
                            const isOwn = message.user.id === currentUser.id;
                            const showAvatar = index === 0 || messages[index - 1].user.id !== message.user.id;

                            return (
                                <motion.div
                                    key={message.id}
                                    className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    layout
                                >
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 ${showAvatar ? '' : 'opacity-0'}`}>
                                        {!isOwn && showAvatar && (
                                            <div className="text-2xl">{message.user.avatar}</div>
                                        )}
                                    </div>

                                    {/* Message content */}
                                    <div className={`flex-1 max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                                        {/* User name and timestamp */}
                                        {showAvatar && (
                                            <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : ''}`}>
                                                <span className="font-medium text-sm text-slate-800 dark:text-white">
                                                    {isOwn ? 'Vous' : message.user.name}
                                                </span>
                                                {message.user.role && message.user.role !== 'member' && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {message.user.role === 'admin' ? '👑' : '🛡️'}
                                                    </Badge>
                                                )}
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {formatTimestamp(message.timestamp)}
                                                </span>
                                            </div>
                                        )}

                                        {/* Message bubble */}
                                        <div
                                            className={`group relative rounded-lg p-3 max-w-full break-words ${isOwn
                                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white ml-auto'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                                                }`}
                                        >
                                            {/* Message content */}
                                            <div className="text-sm">
                                                {message.content}
                                            </div>

                                            {/* Message status */}
                                            <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? '' : 'hidden'}`}>
                                                {message.isEdited && (
                                                    <span className="text-xs opacity-70">modifié</span>
                                                )}
                                                {getMessageStatusIcon(message)}
                                            </div>

                                            {/* Quick reactions on hover */}
                                            {config.allowReactions && (
                                                <div className={`absolute -top-8 ${isOwn ? 'right-0' : 'left-0'} bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-600 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
                                                    <div className="flex gap-1">
                                                        {QUICK_REACTIONS.map((emoji) => (
                                                            <button
                                                                key={emoji}
                                                                className="w-6 h-6 text-sm hover:scale-125 transition-transform"
                                                                onClick={() => handleReaction(message.id, emoji)}
                                                            >
                                                                {emoji}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Reactions */}
                                        {message.reactions.length > 0 && (
                                            <div className={`flex gap-1 mt-2 ${isOwn ? 'justify-end' : ''}`}>
                                                {message.reactions.map((reaction, index) => (
                                                    <motion.button
                                                        key={index}
                                                        className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-600 rounded-full text-xs hover:bg-blue-50 dark:hover:bg-slate-500 transition-colors border border-slate-200 dark:border-slate-500"
                                                        onClick={() => handleReaction(message.id, reaction.emoji)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <span>{reaction.emoji}</span>
                                                        <span className="font-medium">{reaction.count}</span>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Typing indicator */}
                    {typingUsers.length > 0 && (
                        <motion.div
                            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="flex gap-1">
                                {typingUsers.slice(0, 2).map((user) => (
                                    <span key={user.id} className="text-xs">{user.avatar}</span>
                                ))}
                            </div>
                            <div className="flex gap-1">
                                <motion.div
                                    className="w-2 h-2 bg-slate-400 rounded-full"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                                />
                                <motion.div
                                    className="w-2 h-2 bg-slate-400 rounded-full"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                />
                                <motion.div
                                    className="w-2 h-2 bg-slate-400 rounded-full"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                />
                            </div>
                            <span>
                                {typingUsers.length === 1
                                    ? `${typingUsers[0].name} tape...`
                                    : `${typingUsers.length} personnes tapent...`
                                }
                            </span>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Fichiers sélectionnés */}
                {selectedFiles.length > 0 && (
                    <div className="p-3 bg-blue-50 dark:bg-slate-700 mx-4 mb-4 rounded">
                        <div className="flex flex-wrap gap-2">
                            {selectedFiles.map((file, index) => (
                                <div key={index} className="flex items-center gap-2 bg-white dark:bg-slate-600 rounded px-2 py-1 text-xs">
                                    <Paperclip className="w-3 h-3" />
                                    <span className="truncate max-w-20">{file.name}</span>
                                    <button
                                        onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Zone de saisie */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50">
                    <div className="flex gap-2">
                        {/* Input principal */}
                        <div className="flex-1 relative">
                            <input
                                ref={messageInputRef}
                                type="text"
                                value={newMessage}
                                onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    handleTyping();
                                }}
                                placeholder="Tapez votre message..."
                                maxLength={config.maxMessageLength}
                                className="w-full px-4 py-2 pr-12 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                            />

                            {/* Caractères restants */}
                            {config.maxMessageLength && newMessage.length > config.maxMessageLength * 0.8 && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-400">
                                    {config.maxMessageLength - newMessage.length}
                                </div>
                            )}
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex gap-1">
                            {/* Emoji picker */}
                            <Button
                                size="sm"
                                variant="ghost"
                                className="w-10 h-10 p-0"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                                <Smile className="w-4 h-4" />
                            </Button>

                            {/* File upload */}
                            {config.allowFiles && (
                                <>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                                    />
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="w-10 h-10 p-0"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Paperclip className="w-4 h-4" />
                                    </Button>
                                </>
                            )}

                            {/* Voice recording */}
                            {config.allowVoice && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className={`w-10 h-10 p-0 ${isRecording ? 'text-red-500' : ''}`}
                                    onClick={() => setIsRecording(!isRecording)}
                                >
                                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                </Button>
                            )}

                            {/* Send button */}
                            <Button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim() && selectedFiles.length === 0}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}