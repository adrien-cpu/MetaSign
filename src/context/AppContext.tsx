// src/context/AppContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  // Navigation et page courante
  currentPage: string;
  setCurrentPage: (page: string) => void;

  // Mode édition
  editMode: boolean;
  setEditMode: (mode: boolean) => void;

  // Recherche globale
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // État original des layouts pour la réinitialisation
  originalLayouts: { [key: string]: string };
  resetLayout: () => void;

  // Définir l'état global ici
  theme: string;
  setTheme: (theme: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [originalLayouts] = useState({});
  const [theme, setTheme] = useState('light');

  const resetLayout = () => {
    // Logique de réinitialisation spécifique à chaque page
    switch (currentPage) {
      case 'translation':
        // Réinitialiser les modes de traduction
        break;
      case 'dashboard':
        // Réinitialiser le tableau de bord
        break;
      default:
        break;
    }
  };

  const value = {
    currentPage,
    setCurrentPage,
    editMode,
    setEditMode,
    searchQuery,
    setSearchQuery,
    originalLayouts,
    resetLayout,
    theme,
    setTheme,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}