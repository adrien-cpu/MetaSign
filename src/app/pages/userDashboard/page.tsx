'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { User, Settings, Smile, Medal, BarChart2, Users, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import Banner from '@/components/ui/banner';
import { motion } from 'framer-motion';
import { ROUTES } from '@/constants/routes';
import { useCardPreferences, VALID_CARDS } from '@/context/CardPreferencesContext';

const DashboardMainPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { preferences } = useCardPreferences();

  const allFeatures = useMemo(() => [
    {
      id: "profile",
      title: "Profil",
      description: "Gérez votre profil utilisateur",
      icon: <User className="tile-icon text-blue-600" />,
      href: ROUTES.USER_PROFILE,
    },
    {
      id: "personalization",
      title: "Préférences et paramètres",
      description: "Personnalisez votre expérience",
      icon: <Settings className="tile-icon text-green-600" />,
      href: ROUTES.USER_PERSONALIZATION,
    },
    {
      id: "avatar",
      title: "Mon compagnon",
      description: "Créez et modifiez votre compagnon",
      icon: <Smile className="tile-icon text-orange-600" />,
      href: ROUTES.USER_AVATAR,
    },
    {
      id: "badges",
      title: "Mes badges",
      description: "Vos récompenses et succès",
      icon: <Medal className="tile-icon text-purple-600" />,
      href: ROUTES.USER_BADGES,
    },
    {
      id: "stats",
      title: "Activités et Statistiques",
      description: "Suivez votre progression",
      icon: <BarChart2 className="tile-icon text-indigo-600" />,
      href: ROUTES.USER_STATS,
    },
    {
      id: "contacts",
      title: "Mes contacts",
      description: "Gérez vos contacts",
      icon: <Users className="tile-icon text-red-800" />,
      href: ROUTES.USER_CONTACTS,
    },
  ], []);

  const defaultFeatures = useMemo(() =>
    allFeatures.filter(feature =>
      VALID_CARDS.includes(feature.id) && Boolean(preferences[feature.id])
    ), [allFeatures, preferences]);

  const [features, setFeatures] = useState(defaultFeatures);

  useEffect(() => {
    setFeatures(defaultFeatures);
  }, [defaultFeatures]);

  return (
    <div>
      <Banner
        icon={<LayoutDashboard className="text-black" />}
        title="Tableau de bord"
        description="Bienvenue dans votre espace personnel"
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
            {features
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

export default DashboardMainPage;
