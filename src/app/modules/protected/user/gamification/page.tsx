'use client';

import React, { useState } from 'react';
import {
    Globe, Users, Award,
    TrendingUp, Hammer,
    ChevronRight, ChevronLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import Banner from '@/components/ui/banner';
import { ROUTES } from '@/constants/routes';

// Types de badges
interface BadgeCategory {
    id: string;
    title: string;
    icon: React.ReactNode;
    description: string;
}

interface Badge {
    title: string;
    description: string;
    progress: number;
    rewards: string[];
}

interface BadgeDetails {
    [key: string]: Badge[];
}

// Types de badges
const BADGE_CATEGORIES: BadgeCategory[] = [
    {
        id: 'culture',
        title: 'Culture Sourde',
        icon: <Globe className="w-6 h-6 text-blue-500" />,
        description: "Découvrez et comprenez l'histoire et les traditions de la communauté sourde"
    },
    {
        id: 'linguistic',
        title: 'Compétences Linguistiques',
        icon: <Hammer className="w-6 h-6 text-green-500" />,
        description: "Maîtrisez les nuances et la grammaire de la Langue des Signes"
    },
    {
        id: 'community',
        title: 'Interaction Communautaire',
        icon: <Users className="w-6 h-6 text-purple-500" />,
        description: "Engagez-vous et contribuez à la communauté LSF"
    },
    {
        id: 'personal',
        title: 'Progression Personnelle',
        icon: <TrendingUp className="w-6 h-6 text-yellow-500" />,
        description: "Suivez votre développement et vos réalisations personnelles"
    }
];

// Badges pour chaque catégorie
const BADGE_DETAILS: BadgeDetails = {
    culture: [
        {
            title: 'Explorateur Sourd',
            description: 'Découvrez 10 événements historiques de la communauté sourde',
            progress: 60,
            rewards: ['XP', 'Titre Spécial']
        },
        {
            title: 'Gardien de la Mémoire',
            description: 'Documentez 5 histoires de la communauté sourde',
            progress: 30,
            rewards: ['Badge Unique', 'Accès à des ressources']
        }
    ],
    linguistic: [
        {
            title: 'Maître des Signes',
            description: 'Maîtrisez 50 signes complexes',
            progress: 45,
            rewards: ['Certificat', 'Niveau Avancé']
        }
    ]
};

const LSFQuestInterface: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState(BADGE_CATEGORIES[0].id);
    const [earnedBadges] = useState<Badge[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    // Utiliser ChevronRight et ChevronLeft pour la pagination
    const handleNextPage = () => {
        const maxPages = Math.ceil((BADGE_DETAILS[selectedCategory]?.length || 0) / itemsPerPage);
        setCurrentPage(prev => Math.min(prev + 1, maxPages));
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    // Filtrer les badges pour la pagination
    const displayedBadges = BADGE_DETAILS[selectedCategory]
        ?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];

    return (
        <div>
            <Banner
                icon={<Award className="w-6 h-6 text-white" />}
                title="Mes Badges"
                description="Participer au parcours LSF et gagner des badges."
                backHref={ROUTES.USER_DASHBOARD}
            />
            <div className="flex h-screen bg-gray-900 text-white">

                {/* Colonne de gauche - Catégories de Badges */}
                <div className="w-64 bg-gray-800 p-4 border-r border-gray-700">
                    <h2 className="text-xl font-bold mb-6">Parcours LSF</h2>
                    {BADGE_CATEGORIES.map(category => (
                        <div
                            key={category.id}
                            className={`flex items-center p-3 mb-2 cursor-pointer rounded-lg transition-all ${selectedCategory === category.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}
                            onClick={() => {
                                setSelectedCategory(category.id);
                                setCurrentPage(1); // Réinitialiser la page lors du changement de catégorie
                            }}
                        >
                            {category.icon}
                            <span className="ml-3">{category.title}</span>
                        </div>
                    ))}
                </div>

                {/* Colonne centrale - Détails des Badges */}
                <div className="flex-grow p-6 overflow-y-auto relative">
                    <h3 className="text-2xl font-bold mb-4">
                        {BADGE_CATEGORIES.find(c => c.id === selectedCategory)?.title}
                    </h3>
                    <p className="text-gray-400 mb-6">
                        {BADGE_CATEGORIES.find(c => c.id === selectedCategory)?.description}
                    </p>

                    {displayedBadges.map((badge, index) => (
                        <motion.div
                            key={index}
                            className="bg-gray-800 rounded-lg p-4 mb-4 flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Award className="w-10 h-10 text-yellow-500 mr-4" />
                            <div className="flex-grow">
                                <h4 className="font-bold text-lg">{badge.title}</h4>
                                <p className="text-gray-400">{badge.description}</p>
                                <div className="w-full bg-gray-700 h-2 rounded-full mt-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full"
                                        style={{ width: `${badge.progress}%` }}
                                    />
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-500">Récompenses :</p>
                                {badge.rewards.map(reward => (
                                    <span
                                        key={reward}
                                        className="bg-gray-700 text-xs px-2 py-1 rounded-full mr-1"
                                    >
                                        {reward}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}

                    {/* Pagination avec ChevronLeft et ChevronRight */}
                    <div className="flex justify-center items-center mt-4 space-x-4">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="disabled:opacity-50"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <span className="text-sm text-gray-400">
                            Page {currentPage} / {Math.ceil((BADGE_DETAILS[selectedCategory]?.length || 0) / itemsPerPage)}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === Math.ceil((BADGE_DETAILS[selectedCategory]?.length || 0) / itemsPerPage)}
                            className="disabled:opacity-50"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Colonne de droite - Badges Gagnés */}
                <div className="w-64 bg-gray-800 p-4 border-l border-gray-700">
                    <h3 className="text-xl font-bold mb-4">Badges Gagnés</h3>
                    {earnedBadges.length === 0 ? (
                        <p className="text-gray-500 text-center">Aucun badge gagné</p>
                    ) : (
                        // Logique des badges gagnés
                        <div>Badges gagnés seront affichés ici</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LSFQuestInterface;