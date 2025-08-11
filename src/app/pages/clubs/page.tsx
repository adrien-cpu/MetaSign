/**
 * @fileoverview Page des clubs thématiques MetaSign
 * @path src/app/pages/clubs/page.tsx
 * @description Interface pour gérer les clubs thématiques, adhésions et communauté LSF
 * @author MetaSign Team
 * @version 2.0.0
 * 
 * @features
 * - Affichage des clubs thématiques disponibles
 * - Gestion des adhésions (rejoindre/quitter)
 * - Interface moderne avec animations
 * - Gestion d'erreur robuste avec notifications
 * - Optimisations performance et accessibilité
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
    Users,
    UserPlus,
    UserMinus,
    ArrowRight,
    Heart,
    MessageCircle,
    Trophy,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Star
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Banner from "@/components/ui/banner";
import { ROUTES } from "@/constants/routes";

/**
 * Types pour la gestion des clubs
 */
interface Club {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    readonly memberCount: number;
    readonly isMember?: boolean;
    readonly category?: 'general' | 'advanced' | 'specialized' | 'innovation';
    readonly rating?: number;
    readonly isActive?: boolean;
    readonly lastActivity?: string;
}

interface ApiResponse<T> {
    readonly success: boolean;
    readonly data?: T;
    readonly error?: string;
}

interface ClubsPageState {
    readonly clubs: Club[];
    readonly loading: boolean;
    readonly error: string | null;
    readonly membershipLoading: Set<string>;
}

/**
 * Types pour les notifications
 */
interface Notification {
    readonly id: string;
    readonly type: 'success' | 'error' | 'info';
    readonly message: string;
    readonly duration?: number;
}

/**
 * Composant de notification toast
 */
const Toast: React.FC<{ notification: Notification; onDismiss: (id: string) => void }> = ({
    notification,
    onDismiss
}) => {
    const { id, type, message } = notification;

    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(id);
        }, notification.duration || 4000);

        return () => clearTimeout(timer);
    }, [id, notification.duration, onDismiss]);

    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    }[type];

    const Icon = {
        success: CheckCircle2,
        error: AlertCircle,
        info: Users
    }[type];

    return (
        <div className={`fixed top-4 right-4 z-50 ${bgColor} text-white p-4 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in-right`}>
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{message}</span>
            <button
                onClick={() => onDismiss(id)}
                className="ml-2 text-white/80 hover:text-white transition-colors"
                aria-label="Fermer la notification"
            >
                ×
            </button>
        </div>
    );
};

/**
 * Composant pour afficher une carte de club
 */
const ClubCard: React.FC<{
    club: Club;
    isMembershipLoading: boolean;
    onToggleMembership: (clubId: string) => Promise<void>;
}> = ({ club, isMembershipLoading, onToggleMembership }) => {
    const categoryStyles = {
        general: 'from-blue-500 to-blue-700',
        advanced: 'from-purple-500 to-purple-700',
        specialized: 'from-green-500 to-green-700',
        innovation: 'from-orange-500 to-orange-700'
    };

    const categoryLabels = {
        general: 'Général',
        advanced: 'Avancé',
        specialized: 'Spécialisé',
        innovation: 'Innovation'
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105">
            {/* Header avec gradient */}
            <div className={`h-24 bg-gradient-to-r ${categoryStyles[club.category || 'general']} relative`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-3 left-4 flex items-center space-x-2">
                    <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                        {categoryLabels[club.category || 'general']}
                    </span>
                    {club.rating && (
                        <div className="flex items-center space-x-1 text-white">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{club.rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>
                {club.isMember && (
                    <div className="absolute top-3 right-4">
                        <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg"></div>
                    </div>
                )}
            </div>

            {/* Contenu */}
            <div className="p-6">
                <div className="mb-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {club.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mt-2">
                        {club.description || 'Aucune description disponible'}
                    </p>
                </div>

                {/* Statistiques */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{club.memberCount} membres</span>
                    </div>
                    {club.lastActivity && (
                        <div className="flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>Actif il y a {club.lastActivity}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                    <Button
                        onClick={() => onToggleMembership(club.id)}
                        disabled={isMembershipLoading}
                        className={`flex-1 transition-all duration-200 ${club.isMember
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                        aria-label={club.isMember ? `Quitter le club ${club.name}` : `Rejoindre le club ${club.name}`}
                    >
                        {isMembershipLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : club.isMember ? (
                            <>
                                <UserMinus className="h-4 w-4 mr-2" />
                                Quitter
                            </>
                        ) : (
                            <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Rejoindre
                            </>
                        )}
                    </Button>

                    {club.isMember && (
                        <Link href={`/pages/clubs/${club.id}`}>
                            <Button
                                variant="outline"
                                className="border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                                aria-label={`Entrer dans le club ${club.name}`}
                            >
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Entrer
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Composant principal de la page des clubs
 */
export default function ClubsPage(): React.JSX.Element {
    const { data: session } = useSession();
    const [state, setState] = useState<ClubsPageState>({
        clubs: [],
        loading: true,
        error: null,
        membershipLoading: new Set()
    });
    const [notifications, setNotifications] = useState<Notification[]>([]);

    /**
     * Ajouter une notification
     */
    const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
        const id = `notification-${Date.now()}-${Math.random()}`;
        setNotifications(prev => [...prev, { ...notification, id }]);
    }, []);

    /**
     * Supprimer une notification
     */
    const dismissNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const handleError = useCallback((message: string) => {
        setState(prev => ({ ...prev, error: message, loading: false }));
        addNotification({ type: 'error', message });
    }, [addNotification]);

    /**
     * Charger les clubs et adhésions
     */
    const fetchClubs = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const [clubsResponse, membershipsResponse] = await Promise.all([
                fetch("/api/clubs"),
                fetch("/api/clubs/memberships")
            ]);

            if (!clubsResponse.ok || !membershipsResponse.ok) {
                throw new Error('Erreur lors de la récupération des données');
            }

            const responses = await Promise.all([
                clubsResponse.json(),
                membershipsResponse.json()
            ]);

            const clubsData = responses[0] as Club[];
            const membershipsData = responses[1] as string[];

            if (!Array.isArray(clubsData) || !Array.isArray(membershipsData)) {
                throw new Error('Format de données invalide');
            }

            const updatedClubs = clubsData.map((club) => ({
                ...club,
                isMember: membershipsData.includes(club.id),
                isActive: true,
                lastActivity: club.lastActivity || '1 jour'
            }));

            setState(prev => ({
                ...prev,
                clubs: updatedClubs,
                loading: false,
                error: null
            }));

        } catch {
            handleError('Impossible de charger les clubs. Veuillez réessayer.');
        }
    }, [handleError]);

    /**
     * Gérer l'adhésion/désinscription d'un club
     */
    const toggleMembership = useCallback(async (clubId: string) => {
        if (!session) {
            addNotification({
                type: 'error',
                message: 'Vous devez être connecté pour rejoindre un club'
            });
            return;
        }

        setState(prev => ({
            ...prev,
            membershipLoading: new Set([...prev.membershipLoading, clubId])
        }));

        try {
            const response = await fetch(`/api/clubs/${clubId}/membership`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const result: ApiResponse<{ action: 'joined' | 'left' }> = await response.json();

            if (result.success) {
                setState(prev => ({
                    ...prev,
                    clubs: prev.clubs.map(club =>
                        club.id === clubId
                            ? {
                                ...club,
                                isMember: !club.isMember,
                                memberCount: club.isMember ? club.memberCount - 1 : club.memberCount + 1
                            }
                            : club
                    )
                }));

                const action = result.data?.action || 'updated';
                addNotification({
                    type: 'success',
                    message: action === 'joined'
                        ? 'Vous avez rejoint le club avec succès !'
                        : 'Vous avez quitté le club.'
                });
            } else {
                throw new Error(result.error || 'Erreur inconnue');
            }

        } catch {
            handleError('Erreur lors de la mise à jour de l&apos;adhésion');
        } finally {
            setState(prev => ({
                ...prev,
                membershipLoading: new Set([...prev.membershipLoading].filter(id => id !== clubId))
            }));
        }
    }, [session, addNotification, handleError]);

    /**
     * Charger les données au montage
     */
    useEffect(() => {
        fetchClubs();
    }, [fetchClubs]);

    /**
     * Filtrer et trier les clubs
     */
    const sortedClubs = useMemo(() => {
        return state.clubs
            .filter(club => club.isActive)
            .sort((a, b) => {
                // Clubs rejoints en premier
                if (a.isMember && !b.isMember) return -1;
                if (!a.isMember && b.isMember) return 1;
                // Puis par nombre de membres
                return b.memberCount - a.memberCount;
            });
    }, [state.clubs]);

    /**
     * Statistiques des clubs
     */
    const stats = useMemo(() => ({
        total: state.clubs.length,
        joined: state.clubs.filter(club => club.isMember).length,
        available: state.clubs.filter(club => !club.isMember).length
    }), [state.clubs]);

    if (state.loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Chargement des clubs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Notifications */}
            {notifications.map(notification => (
                <Toast
                    key={notification.id}
                    notification={notification}
                    onDismiss={dismissNotification}
                />
            ))}

            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4">
                    <Banner
                        title="Clubs Thématiques"
                        description="Rejoignez notre communauté d'experts et passionnés de la LSF"
                        icon={<Users className="text-blue-600" />}
                        backHref={ROUTES.SOCIAL}
                    />
                </div>
            </div>

            {/* Contenu principal */}
            <div className="container mx-auto px-4 py-8">
                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total des clubs</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Clubs rejoints</p>
                                <p className="text-2xl font-bold text-green-600">{stats.joined}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Heart className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Disponibles</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.available}</p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <Trophy className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Liste des clubs */}
                {state.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                            <p className="text-red-700">{state.error}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchClubs}
                                className="ml-auto"
                            >
                                Réessayer
                            </Button>
                        </div>
                    </div>
                )}

                {sortedClubs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedClubs.map((club) => (
                            <ClubCard
                                key={club.id}
                                club={club}
                                isMembershipLoading={state.membershipLoading.has(club.id)}
                                onToggleMembership={toggleMembership}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Aucun club disponible
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Il semble qu&apos;aucun club ne soit disponible pour le moment.
                        </p>
                        <Button onClick={fetchClubs} className="bg-blue-600 hover:bg-blue-700">
                            Actualiser
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}