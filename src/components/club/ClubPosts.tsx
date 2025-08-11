/**
 * @fileoverview Composant pour afficher et gérer les posts d'un club
 * @path src/components/club/ClubPosts.tsx
 * @description Interface moderne pour les posts de club avec création et interactions
 * @author MetaSign Team
 * @version 3.0.0
 * @since 2025-01-08
 * 
 * @features
 * - Affichage des posts avec design moderne
 * - Création de nouveaux posts
 * - Système de likes et commentaires
 * - Support des médias (images, vidéos)
 * - Pagination automatique
 * - Animation et micro-interactions
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Heart,
    MessageCircle,
    Share,
    MoreVertical,
    Pin,
    Send,
    Image,
    Video,
    FileText,
    Hash,
    Smile,
    Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

/**
 * Interface pour un post de club
 */
interface ClubPost {
    id: string;
    content: string;
    authorId: string;
    author: {
        id: string;
        email: string;
        role: string;
    };
    clubId: string;
    mediaUrls?: string[];
    mediaType?: 'image' | 'video' | 'document';
    likesCount: number;
    commentsCount: number;
    isLikedByUser?: boolean;
    isPinned: boolean;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Interface pour les propriétés du composant
 */
interface ClubPostsProps {
    clubId: string;
    isUserMember: boolean;
    currentUserId: string;
    className?: string;
}

/**
 * Interface pour créer un nouveau post
 */
interface CreatePostData {
    content: string;
    tags: string[];
    mediaUrls?: string[];
    mediaType?: 'image' | 'video' | 'document';
}

/**
 * Composant principal pour les posts de club
 */
export function ClubPosts({
    clubId,
    isUserMember,
    currentUserId,
    className = ''
}: ClubPostsProps) {

    // États
    const [posts, setPosts] = useState<ClubPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    // États pour la création de post
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostTags, setNewPostTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    /**
     * Formate la date de manière relative
     */
    const formatRelativeTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'À l\'instant';
        if (minutes < 60) return `${minutes}min`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}j`;
        return date.toLocaleDateString();
    };

    /**
     * Récupère les posts du club
     */
    const fetchPosts = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
        try {
            setIsLoading(true);

            const response = await fetch(
                `/api/clubs/${clubId}/posts?page=${pageNum}&limit=10&sortBy=createdAt&sortOrder=desc`
            );

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                const newPosts = result.data.posts.map((post: any) => ({
                    ...post,
                    createdAt: new Date(post.createdAt),
                    updatedAt: new Date(post.updatedAt)
                }));

                if (reset) {
                    setPosts(newPosts);
                } else {
                    setPosts(prev => [...prev, ...newPosts]);
                }

                setHasMore(result.data.hasMore);
                setPage(pageNum);
            } else {
                throw new Error(result.error || 'Erreur lors du chargement des posts');
            }
        } catch (error) {
            console.error('Erreur lors du chargement des posts:', error);
            toast.error('❌ Erreur de chargement', {
                description: 'Impossible de charger les posts du club',
                duration: 4000
            });
        } finally {
            setIsLoading(false);
        }
    }, [clubId]);

    /**
     * Crée un nouveau post
     */
    const createPost = async () => {
        if (!newPostContent.trim()) return;

        try {
            setIsCreating(true);

            const postData: CreatePostData = {
                content: newPostContent.trim(),
                tags: newPostTags
            };

            const response = await fetch(`/api/clubs/${clubId}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                const newPost = {
                    ...result.data,
                    createdAt: new Date(result.data.createdAt),
                    updatedAt: new Date(result.data.updatedAt)
                };

                setPosts(prev => [newPost, ...prev]);
                setNewPostContent('');
                setNewPostTags([]);
                setShowCreateForm(false);

                toast.success('🎉 Post créé !', {
                    description: 'Votre post a été publié avec succès',
                    duration: 3000
                });
            } else {
                throw new Error(result.error || 'Erreur lors de la création du post');
            }
        } catch (error) {
            console.error('Erreur lors de la création du post:', error);
            toast.error('❌ Erreur de publication', {
                description: 'Impossible de publier votre post',
                duration: 4000
            });
        } finally {
            setIsCreating(false);
        }
    };

    /**
     * Gère le like/unlike d'un post
     */
    const toggleLike = async (postId: string) => {
        try {
            const response = await fetch(`/api/clubs/${clubId}/posts/${postId}/like`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Erreur lors du like');
            }

            const result = await response.json();

            if (result.success) {
                setPosts(prev => prev.map(post =>
                    post.id === postId
                        ? {
                            ...post,
                            isLikedByUser: result.data.isLiked,
                            likesCount: result.data.likesCount
                        }
                        : post
                ));

                toast.success(result.data.isLiked ? '❤️ Post liké !' : '💔 Like retiré', {
                    duration: 1500
                });
            }
        } catch (error) {
            console.error('Erreur lors du like:', error);
            toast.error('❌ Erreur', {
                description: 'Impossible de liker ce post',
                duration: 2000
            });
        }
    };

    /**
     * Ajoute un tag
     */
    const addTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !newPostTags.includes(tag) && newPostTags.length < 5) {
            setNewPostTags(prev => [...prev, tag]);
            setTagInput('');
        }
    };

    /**
     * Supprime un tag
     */
    const removeTag = (tagToRemove: string) => {
        setNewPostTags(prev => prev.filter(tag => tag !== tagToRemove));
    };

    // Chargement initial
    useEffect(() => {
        if (isUserMember) {
            fetchPosts(1, true);
        }
    }, [fetchPosts, isUserMember]);

    if (!isUserMember) {
        return (
            <Card className={`bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0 shadow-xl ${className}`}>
                <CardContent className="p-8 text-center">
                    <MessageCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">
                        Rejoignez le club pour voir les posts
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                        Devenez membre pour participer aux discussions et voir le contenu exclusif
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>

            {/* Formulaire de création de post */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0 shadow-xl">
                <CardContent className="p-6">
                    {!showCreateForm ? (
                        <Button
                            onClick={() => setShowCreateForm(true)}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Créer un post
                        </Button>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                        >
                            {/* Zone de texte */}
                            <textarea
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                placeholder="Partagez quelque chose avec le club..."
                                className="w-full p-4 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none"
                                rows={4}
                                maxLength={2000}
                            />

                            {/* Tags */}
                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    {newPostTags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                        >
                                            <Hash className="w-3 h-3" />
                                            {tag}
                                            <button
                                                onClick={() => removeTag(tag)}
                                                className="ml-1 text-blue-500 hover:text-blue-700"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    ))}
                                </div>

                                {newPostTags.length < 5 && (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                            placeholder="Ajouter un tag..."
                                            className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            maxLength={20}
                                        />
                                        <Button size="sm" onClick={addTag} disabled={!tagInput.trim()}>
                                            <Hash className="w-3 h-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline">
                                        <Image className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <Video className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <FileText className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <Smile className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowCreateForm(false);
                                            setNewPostContent('');
                                            setNewPostTags([]);
                                        }}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        onClick={createPost}
                                        disabled={!newPostContent.trim() || isCreating}
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                                    >
                                        {isCreating ? (
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                                                <Send className="w-4 h-4" />
                                            </motion.div>
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        {isCreating ? 'Publication...' : 'Publier'}
                                    </Button>
                                </div>
                            </div>

                            {/* Compteur de caractères */}
                            <div className="text-xs text-slate-500 dark:text-slate-400 text-right">
                                {newPostContent.length}/2000 caractères
                            </div>
                        </motion.div>
                    )}
                </CardContent>
            </Card>

            {/* Liste des posts */}
            <div className="space-y-4">
                <AnimatePresence>
                    {posts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                                <CardContent className="p-6">

                                    {/* En-tête du post */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                {post.author.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-800 dark:text-white">
                                                    {post.author.email.split('@')[0]}
                                                </div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                    {formatRelativeTime(post.createdAt)}
                                                    {post.isPinned && (
                                                        <Pin className="w-3 h-3 text-yellow-500" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Contenu du post */}
                                    <div className="mb-4">
                                        <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                                            {post.content}
                                        </p>
                                    </div>

                                    {/* Tags */}
                                    {post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {post.tags.map((tag) => (
                                                <Badge key={tag} variant="outline" className="text-xs">
                                                    <Hash className="w-3 h-3 mr-1" />
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-600">
                                        <div className="flex items-center gap-4">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => toggleLike(post.id)}
                                                className={`flex items-center gap-2 ${post.isLikedByUser
                                                        ? 'text-red-500 hover:text-red-600'
                                                        : 'text-slate-500 hover:text-red-500'
                                                    }`}
                                            >
                                                <Heart className={`w-4 h-4 ${post.isLikedByUser ? 'fill-current' : ''}`} />
                                                {post.likesCount}
                                            </Button>

                                            <Button size="sm" variant="ghost" className="flex items-center gap-2 text-slate-500 hover:text-blue-500">
                                                <MessageCircle className="w-4 h-4" />
                                                {post.commentsCount}
                                            </Button>
                                        </div>

                                        <Button size="sm" variant="ghost" className="text-slate-500 hover:text-blue-500">
                                            <Share className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Bouton charger plus */}
            {hasMore && !isLoading && (
                <div className="text-center">
                    <Button
                        onClick={() => fetchPosts(page + 1)}
                        variant="outline"
                        className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                    >
                        Charger plus de posts
                    </Button>
                </div>
            )}

            {/* Indicateur de chargement */}
            {isLoading && (
                <div className="text-center py-8">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
                    />
                    <p className="text-slate-500 dark:text-slate-400 mt-4">
                        Chargement des posts...
                    </p>
                </div>
            )}

            {/* Message si aucun post */}
            {!isLoading && posts.length === 0 && (
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0 shadow-xl">
                    <CardContent className="p-8 text-center">
                        <MessageCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">
                            Aucun post pour le moment
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">
                            Soyez le premier à partager quelque chose avec le club !
                        </p>
                        <Button
                            onClick={() => setShowCreateForm(true)}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Créer le premier post
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}