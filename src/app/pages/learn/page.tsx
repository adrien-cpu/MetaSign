'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Search,
    RefreshCcw,
    MessageCircle,
    Star,
    Video,
    Trophy,
    LockIcon
} from 'lucide-react';
import Banner from '@/components/ui/banner';
import { ROUTES } from '@/constants/routes';
import { GraduationCap } from 'lucide-react';

// Types for Learning Modules
type ModuleStatus = 'locked' | 'in-progress' | 'completed';

interface LearningModule {
    id: string;
    title: string;
    description: string;
    category: 'Débutant' | 'Intermédiaire' | 'Avancé';
    difficulty: number;
    prerequisites?: string[];
    status: ModuleStatus;
    progress: number;
    estimatedTime: number;
    skills: string[];
    icon: React.ReactNode;
    href: string;
}

// Modules de formation
const modulesData: LearningModule[] = [
    {
        id: 'learningGame',
        title: "Jeu d'apprentissage",
        description: 'Apprenez à travers des jeux interactifs.',
        category: 'Débutant',
        difficulty: 2,
        status: 'in-progress',
        progress: 50,
        estimatedTime: 60,
        skills: ['Jeux', 'Apprentissage interactif'],
        icon: <Star className="w-6 h-6 text-yellow-500" />,
        href: '/modules/learning/learning-game',
        prerequisites: []
    },
    {
        id: 'videoRecognition',
        title: 'Reconnaissance vidéo',
        description: 'Découvrez comment utiliser la reconnaissance vidéo.',
        category: 'Intermédiaire',
        difficulty: 3,
        status: 'locked',
        progress: 0,
        estimatedTime: 90,
        skills: ['Vidéo', 'Reconnaissance'],
        icon: <Video className="w-6 h-6 text-blue-500" />,
        href: '/modules/learning/video-recognition',
        prerequisites: ['learningGame']
    },
    {
        id: 'culturalQuiz',
        title: 'Quiz culturel',
        description: 'Testez vos connaissances culturelles.',
        category: 'Débutant',
        difficulty: 1,
        status: 'locked',
        progress: 0,
        estimatedTime: 45,
        skills: ['Culture', 'Quiz'],
        icon: <Trophy className="w-6 h-6 text-green-500" />,
        href: '/modules/learning/cultural-quiz',
        prerequisites: []
    }
];

// Module Card Component
const ModuleCard: React.FC<{
    module: LearningModule
}> = ({ module }) => {
    return (
        <div
            className={`
                bg-white rounded-lg shadow-md overflow-hidden 
                transform transition-all duration-300 
                hover:scale-105
                ${module.status === 'locked' ? 'opacity-60 cursor-not-allowed' : ''}
            `}
        >
            <div className="p-5 relative">
                <div className="flex justify-between items-center mb-3">
                    {module.icon}
                </div>

                <h3 className="text-xl font-semibold mb-2">{module.title}</h3>
                <p className="text-gray-600 mb-3">{module.description}</p>

                {/* Difficulty and Category */}
                <div className="flex justify-between items-center mb-3">
                    <span
                        className={`
                            px-3 py-1 rounded-full text-xs font-medium
                            ${module.category === 'Débutant'
                                ? 'bg-green-100 text-green-800'
                                : module.category === 'Intermédiaire'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                            }
                        `}
                    >
                        {module.category}
                    </span>
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${i < module.difficulty
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Progression */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div
                        className={`h-2.5 rounded-full 
                            ${module.status === 'completed'
                                ? 'bg-green-600'
                                : module.status === 'in-progress'
                                    ? 'bg-blue-600'
                                    : 'bg-gray-400'
                            }`}
                        style={{ width: `${module.progress}%` }}
                    ></div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {module.skills.map((skill) => (
                        <span
                            key={skill}
                            className="text-xs bg-gray-200 px-2 py-1 rounded"
                        >
                            {skill}
                        </span>
                    ))}
                </div>

                {/* Action Button */}
                <div className="mt-4 flex justify-between items-center">
                    {module.status === 'locked' ? (
                        <div className="flex items-center text-gray-500">
                            <LockIcon className="mr-2 w-5 h-5" />
                            Module verrouillé
                        </div>
                    ) : (
                        <Link
                            href={module.href}
                            className="
                                block text-center 
                                bg-blue-500 text-white 
                                py-2 px-4 rounded-lg 
                                hover:bg-blue-600 
                                transition-colors
                            "
                        >
                            {module.status === 'completed' ? 'Revoir' : 'Commencer'}
                        </Link>
                    )}

                    <span className="text-sm text-gray-500">
                        {module.estimatedTime} min
                    </span>
                </div>
            </div>
        </div>
    );
};

// Main Learning Modules Page
const LearningModulesPage: React.FC = () => {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [moduleOrder, setModuleOrder] = useState<'default' | 'difficulty' | 'alphabetic' | 'time'>('default');
    const [modules, setModules] = useState(modulesData);

    // Filtered and searched modules
    const sortedModules = useMemo(() => {
        // Filtrer d'abord
        const filteredModules = modules.filter(module =>
            (module.title.toLowerCase().includes(search.toLowerCase())) &&
            (categoryFilter === "all" || module.category === categoryFilter)
        );

        // Puis trier
        switch (moduleOrder) {
            case 'difficulty':
                return [...filteredModules].sort((a, b) => b.difficulty - a.difficulty);
            case 'alphabetic':
                return [...filteredModules].sort((a, b) => a.title.localeCompare(b.title));
            case 'time':
                return [...filteredModules].sort((a, b) => a.estimatedTime - b.estimatedTime);
            default:
                return filteredModules;
        }
    }, [modules, search, categoryFilter, moduleOrder]);

    // Gérer la réinitialisation
    const handleReset = useCallback(() => {
        setModules(modulesData);
        setCategoryFilter("all");
        setSearch("");
        setModuleOrder('default');
        alert("Modules réinitialisés avec succès !");
    }, []);

    return (
        <div className="container mx-auto px-6 py-8">
            <Banner
                title="Modules d'apprentissage"
                description="Découvrez des modules d'apprentissage pour améliorer vos connaissances."
                icon={<GraduationCap className="text-black" />}
                backHref={ROUTES.HOME}
            />
            {/* Search and Filter Section */}
            <div className="max-w-5xl mx-auto mb-8 pt-8">
                <div className="flex space-x-4 items-center">
                    <div className="flex-grow relative">
                        <Input
                            type="text"
                            placeholder="Rechercher un module..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10"
                        />
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                    </div>

                    {/* Category Filter Dropdown */}
                    <Select
                        value={categoryFilter}
                        onValueChange={(value) => setCategoryFilter(value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrer par niveau" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les niveaux</SelectItem>
                            <SelectItem value="Débutant">Débutant</SelectItem>
                            <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                            <SelectItem value="Avancé">Avancé</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Module Order Dropdown */}
                    <Select
                        value={moduleOrder}
                        onValueChange={(value: typeof moduleOrder) => setModuleOrder(value)}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Trier les modules">
                                <div className="flex items-center">
                                    <MessageCircle className="mr-2 w-4 h-4" />
                                    {moduleOrder === 'default' && "Ordre par défaut"}
                                    {moduleOrder === 'difficulty' && "Par difficulté"}
                                    {moduleOrder === 'alphabetic' && "Alphabétique"}
                                    {moduleOrder === 'time' && "Temps d'apprentissage"}
                                </div>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">Ordre par défaut</SelectItem>
                            <SelectItem value="difficulty">Par difficulté</SelectItem>
                            <SelectItem value="alphabetic">Alphabétique</SelectItem>
                            <SelectItem value="time">Temps d &apos; apprentissage</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Reset Button */}
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        title="Réinitialiser"
                    >
                        <RefreshCcw size={20} />
                    </Button>
                </div>
            </div>

            {/* Modules Grid */}
            <section>
                <h2 className="text-2xl font-bold mb-6">
                    Modules d &apos; Apprentissage ({sortedModules.length})
                </h2>

                {sortedModules.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        Aucun module ne correspond à votre recherche.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedModules.map((module) => (
                            <ModuleCard
                                key={module.id}
                                module={module}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default LearningModulesPage;