'use client';
//src/context/learningContext.tsx
import React, { createContext, useContext, useState } from 'react';

// Définition du type des modules d'apprentissage
export type ModuleStatus = 'locked' | 'in-progress' | 'completed';

export interface LearningModule {
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

// Contexte pour gérer le module sélectionné
interface LearningContextProps {
    selectedModule: LearningModule | null;
    setSelectedModule: (module: LearningModule) => void;
}

// Création du contexte
const LearningContext = createContext<LearningContextProps | undefined>(undefined);

// Hook pour utiliser le contexte
export const useLearningContext = () => {
    const context = useContext(LearningContext);
    if (!context) {
        throw new Error('useLearningContext must be used within a LearningProvider');
    }
    return context;
};

// Provider du contexte
export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);

    return (
        <LearningContext.Provider value={{ selectedModule, setSelectedModule }}>
            {children}
        </LearningContext.Provider>
    );
};
