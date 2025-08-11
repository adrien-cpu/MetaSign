'use client';

import React, { useState, useMemo } from 'react';
import {
    User,
    MessagesSquare,
    Smile,
    Handshake,
    Users,
    CalendarDays,
    LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import Banner from '@/components/ui/banner';
import { motion } from 'framer-motion';
import { ROUTES } from '@/constants/routes';
import { useCardPreferences, VALID_CARDS } from '@/context/CardPreferencesContext';

const SocialDashboardPage = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const { preferences } = useCardPreferences();

    const allFeatures = useMemo(() => [
        {
            id: "clubs",
            title: "Clubs",
            description: "Rejoignez ou créez un club",
            icon: <Smile className="tile-icon text-orange-600" />,
            href: ROUTES.SOCIAL_CLUBS,
        },
        {
            id: "salons",
            title: "Salon de discussion",
            description: "Réunissez vous autour d&apos;un thème commun",
            icon: <MessagesSquare className="tile-icon text-blue-600" />,
            href: ROUTES.SOCIAL_CHATROOMS,
        },
        {
            id: "rencontres",
            title: "Rencontrez vous !",
            description: "Découvrez de nouvelles personnes",
            icon: <User className="tile-icon text-green-600" />,
            href: ROUTES.SOCIAL_MEETINGS,
        },
        {
            id: "amis",
            title: "Mes amis",
            description: "Gérez vos amis",
            icon: <Handshake className="tile-icon text-purple-600" />,
            href: ROUTES.SOCIAL_FRIENDS,
        },
        {
            id: "groupes",
            title: "Regroupez vous !",
            description: "Rejoignez un groupe",
            icon: <Users className="tile-icon text-indigo-600" />,
            href: ROUTES.SOCIAL_GROUPS,
        },
        {
            id: "evenements",
            title: "Événements",
            description: "Participez à des événements",
            icon: <CalendarDays className="tile-icon text-red-800" />,
            href: ROUTES.SOCIAL_EVENTS,
        },
    ], []);

    const defaultFeatures = useMemo(() =>
        allFeatures.filter(feature =>
            VALID_CARDS.includes(feature.id) && Boolean(preferences[feature.id])
        ), [allFeatures, preferences]);

    return (
        <div>
            <Banner
                icon={<LayoutDashboard className="text-white" />}
                title="Réseau Social"
                description="Bienvenue dans vos espaces de discussion"
                backHref={ROUTES.HOME}
            />

            <div className="container mx-auto px-6 py-4">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-6 mt-2">
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="placeholder-gray-600 px-4 py-2 border border-gray-400 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                    >
                        {defaultFeatures
                            .filter((feature) => feature.title.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((feature) => (
                                <Link key={feature.id} href={feature.href} className="tile">
                                    <div className="tile-header">
                                        {feature.icon}
                                        <h3 className="tile-title">{feature.title}</h3>
                                    </div>
                                    <p className="tile-description">{feature.description}</p>
                                </Link>
                            ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SocialDashboardPage;
