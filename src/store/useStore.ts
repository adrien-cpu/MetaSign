/**
 * @fileoverview Store global de l'application utilisant Zustand
 * @module useStore
 */

/**
 * @typedef {Object} AppState
 * @property {string|null} currentModel - ID du modèle actuellement sélectionné
 * @property {boolean} sidebarOpen - État d'ouverture de la sidebar
 * @property {'light'|'dark'} theme - Thème actuel de l'application
 */

import create from 'zustand';

interface AppState {
  currentModel: string | null;
  setCurrentModel: (modelId: string | null) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useStore = create<AppState>((set) => ({
  currentModel: null,
  setCurrentModel: (modelId) => set({ currentModel: modelId }),
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  theme: 'light',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));