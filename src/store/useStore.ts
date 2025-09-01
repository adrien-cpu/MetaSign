/**
 * @fileoverview Store global de l'application utilisant Zustand pour la gestion d'état
 * @module useStore
 * @description Ce module fournit un store global centralisé pour l'état de l'application
 * incluant le modèle actuel, l'état de la sidebar et le thème.
 */

import create from 'zustand';

/**
 * Interface définissant la structure de l'état global de l'application
 * @interface AppState
 */
interface AppState {
  /** ID du modèle actuellement sélectionné */
  currentModel: string | null;
  /** 
   * Définit le modèle actuel
   * @param modelId - L'ID du modèle à définir, ou null pour désélectionner
   */
  setCurrentModel: (modelId: string | null) => void;
  /** État d'ouverture de la sidebar */
  sidebarOpen: boolean;
  /** Basculer l'état d'ouverture de la sidebar */
  toggleSidebar: () => void;
  /** Thème actuel de l'application */
  theme: 'light' | 'dark';
  /** Basculer entre les thèmes clair et sombre */
  toggleTheme: () => void;
}

/**
 * Hook personnalisé utilisant Zustand pour la gestion d'état global
 * @function useStore
 * @returns {AppState} L'état global de l'application avec ses méthodes de mise à jour
 * @example
 * ```typescript
 * const { currentModel, setCurrentModel, theme, toggleTheme } = useStore();
 * ```
 */
export const useStore = create<AppState>((set) => ({
  currentModel: null,
  setCurrentModel: (modelId) => set({ currentModel: modelId }),
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  theme: 'light',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));