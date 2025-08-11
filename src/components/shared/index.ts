/**
 * @fileoverview Point d'entrée centralisé pour les composants partagés de traduction
 * @filepath src/components/shared/index.ts
 * @author MetaSign Team
 * @version 1.0.0
 * 
 * Ce module exporte tous les composants, types et constantes
 * nécessaires pour les fonctionnalités de traduction LSF
 */

// === COMPOSANTS PRINCIPAUX ===

/**
 * Composant de sélection de langue avec interface riche
 * Supporte les drapeaux, noms natifs et langues personnalisées
 */
export { default as LanguageSelector } from './LanguageSelector';

/**
 * Composant de contrôles de traduction (play/pause/stop/reset)
 * Gère les états de session et le feedback utilisateur
 */
export { default as TranslationControls } from './TranslationControls';

/**
 * Composant de boutons d'action (sauvegarder/partager/télécharger/copier)
 * Inclut le feedback visuel et la gestion d'erreurs
 */
export { default as ActionButtons } from './ActionButtons';

// === TYPES ET INTERFACES ===

/**
 * Interface pour la représentation d'une langue
 * Suit le standard ISO 639-1
 */
export type {
    Language
} from './types';

/**
 * Props pour le composant LanguageSelector
 */
export type {
    LanguageSelectorProps,
} from './types';

/**
 * Props pour le composant TranslationControls
 */
export type {
    TranslationControlsProps,
} from './types';

/**
 * Props pour le composant ActionButtons
 */
export type {
    ActionButtonsProps,
} from './types';

// === CONSTANTES ===

/**
 * Liste des 10 langues par défaut supportées par le système
 * Inclut les métadonnées complètes (codes, noms, drapeaux)
 */
export { DEFAULT_LANGUAGES } from './types';