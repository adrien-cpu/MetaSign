/**
 * @fileoverview Types et interfaces pour les composants partagés de traduction LSF
 * @filepath src/components/shared/types.ts
 * @author MetaSign Team
 * @version 1.0.0
 */

/**
 * Interface représentant une langue disponible dans le système
 * Suit le standard ISO 639-1 pour les codes de langue
 */
export interface Language {
    /** Code ISO 639-1 de la langue (ex: 'fr', 'en', 'es') */
    code: string;
    /** Nom de la langue en anglais */
    name: string;
    /** Nom de la langue dans sa propre écriture */
    nativeName: string;
    /** Emoji du drapeau correspondant (optionnel) */
    flag?: string;
}

/**
 * Props pour le composant LanguageSelector
 * Permet la sélection d'une langue avec interface utilisateur riche
 */
export interface LanguageSelectorProps {
    /** Libellé affiché au-dessus du sélecteur */
    label: string;
    /** Code de la langue actuellement sélectionnée */
    selectedLanguage: string;
    /** Callback appelé lors du changement de langue */
    onLanguageChange: (language: string) => void;
    /** Liste personnalisée de langues (utilise DEFAULT_LANGUAGES si non fourni) */
    languages?: Language[];
    /** Classes CSS personnalisées pour le conteneur */
    className?: string;
    /** Désactive l'interaction avec le composant */
    disabled?: boolean;
}

/**
 * Props pour le composant TranslationControls
 * Gère les contrôles de traduction (play/pause/stop/reset)
 */
export interface TranslationControlsProps {
    /** Callback appelé pour démarrer une traduction */
    onTranslate: () => void;
    /** Indique si une traduction est en cours */
    isTranslating: boolean;
    /** Désactive tous les contrôles */
    disabled?: boolean;
    /** Classes CSS personnalisées pour le conteneur */
    className?: string;
}

/**
 * Props pour le composant ActionButtons
 * Fournit des actions secondaires sur les traductions
 */
export interface ActionButtonsProps {
    /** Callback pour sauvegarder la traduction */
    onSave: () => void;
    /** Callback pour partager la traduction */
    onShare: () => void;
    /** Désactive tous les boutons d'action */
    disabled?: boolean;
    /** Classes CSS personnalisées pour le conteneur */
    className?: string;
}

/**
 * Liste des langues par défaut supportées par le système
 * Inclut les 10 langues les plus couramment utilisées avec leurs métadonnées
 * 
 * @constant
 * @type {Language[]}
 */
export const DEFAULT_LANGUAGES: Language[] = [
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
];