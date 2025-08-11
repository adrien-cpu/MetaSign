'use client';

import React, { useState, useMemo } from 'react';
import {
    Lock,
    Star,
    Check,
    MapPin,
    Award,
    TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

// Types for Learning Progression (local definition)
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

interface UserLearningProgress {
    completedModules: string[];
    currentModule?: string;
    totalExperience: number;
    lastActivityDate: Date;
}

// Utility function to determine if a module can be unlocked
const canUnlockModule = (
    module: LearningModule,
    userProgress: UserLearningProgress
): boolean => {
    // If no prerequisites, the module is unlocked
    if (!module.prerequisites || module.prerequisites.length === 0) {
        return true;
    }

    // Check if all prerequisites are completed
    return module.prerequisites.every(prereqId =>
        userProgress.completedModules.includes(prereqId)
    );
};

// Function to calculate overall progress
const calculateOverallProgress = (
    modules: LearningModule[],
    userProgress: UserLearningProgress
): number => {
    const completedModulesCount = userProgress.completedModules.length;
    const totalModules = modules.length;

    return Math.round((completedModulesCount / totalModules) * 100);
};

// Modules de formation
const learningModules: LearningModule[] = [
    {
        id: 'intro',
        title: 'Introduction à la LSF',
        description: 'Découvrez les bases de la Langue des Signes Française',
        category: 'Débutant',
        difficulty: 1,
        status: 'in-progress',
        progress: 50,
        estimatedTime: 60,
        skills: ['Alphabet', 'Salutations'],
        icon: <Star className="w-6 h-6 text-yellow-500" />,
        href: '/modules/lsf/introduction',
        prerequisites: []
    },
    {
        id: 'alphabet',
        title: 'Alphabet et Épellation',
        description: 'Apprenez à épeler et communiquer les lettres',
        category: 'Débutant',
        difficulty: 2,
        status: 'locked',
        progress: 0,
        estimatedTime: 90,
        skills: ['Épellation', 'Communication de base'],
        icon: <Award className="w-6 h-6 text-blue-500" />,
        href: '/modules/lsf/alphabet',
        prerequisites: ['intro']
    },
    {
        id: 'conversation',
        title: 'Premières Conversations',
        description: 'Initiez-vous aux conversations simples',
        category: 'Débutant',
        difficulty: 3,
        status: 'locked',
        progress: 0,
        estimatedTime: 120,
        skills: ['Dialogues', 'Vocabulaire'],
        icon: <TrendingUp className="w-6 h-6 text-green-500" />,
        href: '/modules/lsf/conversation',
        prerequisites: ['alphabet']
    }
];

// État initial de progression utilisateur
const initialUserProgress: UserLearningProgress = {
    completedModules: [],
    currentModule: 'intro',
    totalExperience: 0,
    lastActivityDate: new Date()
};

const LSFLearningPath: React.FC = () => {
    const [userProgress, setUserProgress] = useState<UserLearningProgress>(initialUserProgress);
    const [modules, setModules] = useState<LearningModule[]>(learningModules);

    // Calculer la progression globale
    const overallProgress = useMemo(() =>
        calculateOverallProgress(modules, userProgress),
        [modules, userProgress]
    );

    // Gérer le déverrouillage/progression des modules
    const handleModuleProgress = (moduleId: string) => {
        const selectedModule = modules.find(m => m.id === moduleId);

        if (!selectedModule) return;

        // Vérifier si le module peut être déverrouillé
        if (!canUnlockModule(selectedModule, userProgress)) {
            alert('Vous devez compléter les modules prérequis !');
            return;
        }

        // Mettre à jour la progression
        setUserProgress(prev => ({
            ...prev,
            currentModule: moduleId,
            completedModules: prev.completedModules.includes(moduleId)
                ? prev.completedModules
                : [...prev.completedModules, moduleId],
            totalExperience: prev.totalExperience + 100, // Exemple de gain d'expérience
            lastActivityDate: new Date()
        }));

        // Mettre à jour le statut du module
        setModules(prevModules =>
            prevModules.map(module =>
                module.id === moduleId
                    ? {
                        ...module,
                        status: 'completed',
                        progress: 100
                    }
                    : module
            )
        );

        alert(`Bravo ! Vous avez progressé dans le module ${selectedModule.title}`);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-black mb-8 flex items-center">
                    <MapPin className="mr-4 text-blue-600" />
                    Votre Parcours d&apos;Apprentissage LSF
                </h1>

                {/* Barre de progression globale */}
                <div className="mb-8 bg-black rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Progression Globale</h2>
                        <span className="text-blue-600 font-bold">{overallProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                            className="bg-blue-600 h-4 rounded-full"
                            style={{ width: `${overallProgress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Liste des modules */}
                <div className="relative">
                    {/* Ligne de progression */}
                    <div className="absolute left-10 top-0 bottom-0 w-1 bg-blue-200"></div>

                    {modules.map((module, index) => (
                        <motion.div
                            key={module.id}
                            className="flex items-center mb-8 relative"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 }}
                        >
                            {/* Indicateur de progression */}
                            <div
                                className={`w-20 h-20 rounded-full flex items-center justify-center z-10 relative 
                                    ${module.status === 'completed'
                                        ? 'bg-green-500 text-black'
                                        : module.status === 'in-progress'
                                            ? 'bg-blue-500 text-black'
                                            : 'bg-gray-300 text-gray-500'
                                    }`}
                            >
                                {module.status === 'completed' ? (
                                    <Check className="w-8 h-8" />
                                ) : module.status === 'in-progress' ? (
                                    <Star className="w-8 h-8" />
                                ) : (
                                    <Lock className="w-8 h-8" />
                                )}
                            </div>

                            {/* Carte de module */}
                            <div
                                className={`ml-6 p-6 rounded-lg shadow-md w-full transition-all 
                                    ${module.status === 'completed'
                                        ? 'bg-green-50 hover:bg-green-100'
                                        : module.status === 'in-progress'
                                            ? 'bg-blue-50 hover:bg-blue-100'
                                            : 'bg-gray-200 opacity-60'
                                    }`}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-black">{module.title}</h2>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs 
                                            ${module.category === 'Débutant'
                                                ? 'bg-green-100 text-green-800'
                                                : module.category === 'Intermédiaire'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {module.category}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-4">{module.description}</p>

                                {/* Barre de progression */}
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

                                {/* Boutons d'action */}
                                <div className="flex justify-between items-center">
                                    {module.status === 'locked' ? (
                                        <div className="flex items-center text-gray-500">
                                            <Lock className="mr-2 w-5 h-5" />
                                            Module verrouillé
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => handleModuleProgress(module.id)}
                                            variant={module.status === 'completed' ? 'secondary' : 'default'}
                                        >
                                            {module.status === 'completed'
                                                ? 'Revoir'
                                                : 'Commencer'
                                            }
                                        </Button>
                                    )}

                                    {/* Affichage des compétences acquises */}
                                    <div className="flex items-center  space-x-2">
                                        {module.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="text-xs text-black bg-gray-200 px-2 py-1 rounded"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LSFLearningPath;