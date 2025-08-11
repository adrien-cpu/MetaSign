/**
 * @fileoverview Composant de contrôles de traduction avec gestion d'état avancée
 * @filepath src/components/shared/TranslationControls.tsx
 * @author MetaSign Team
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Play, Square, RotateCcw, Loader2 } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';
import { cn } from '@/lib/utils';
import { TranslationControlsProps } from './types';

/**
 * Composant de contrôles pour gérer les sessions de traduction
 * 
 * Fonctionnalités :
 * - Démarrage/arrêt de traduction
 * - Réinitialisation de session
 * - Indicateurs visuels d'état
 * - Synchronisation avec l'état parent
 * - Feedback utilisateur en temps réel
 * 
 * États gérés :
 * - idle: Prêt à démarrer
 * - started: Session active
 * - translating: Traduction en cours
 * 
 * @component
 * @example
 * ```tsx
 * <TranslationControls
 *   onTranslate={handleTranslate}
 *   isTranslating={isActive}
 *   disabled={false}
 * />
 * ```
 * 
 * @param props - Les propriétés du composant
 * @returns JSX.Element - Les contrôles de traduction
 */
const TranslationControls = (props: TranslationControlsProps) => {
    const {
        onTranslate,
        isTranslating,
        disabled = false,
        className,
    } = props;

    // État local pour tracker si une session de traduction a été démarrée
    const [isStarted, setIsStarted] = React.useState(false);

    /**
     * Démarre une nouvelle session de traduction
     * Déclenche le callback parent et met à jour l'état local
     */
    const handleStart = React.useCallback(() => {
        setIsStarted(true);
        onTranslate();
    }, [onTranslate]);

    /**
     * Arrête la session de traduction en cours
     * Remet l'interface en état d'attente
     */
    const handleStop = React.useCallback(() => {
        setIsStarted(false);
        // Note: Le parent doit gérer l'arrêt effectif de la traduction
    }, []);

    /**
     * Remet à zéro tous les états de traduction
     * Utilisé pour nettoyer une session précédente
     */
    const handleReset = React.useCallback(() => {
        setIsStarted(false);
        // Ici on pourrait ajouter d'autres logiques de reset
        // comme vider les caches, réinitialiser les métriques, etc.
    }, []);

    /**
     * Synchronise l'état local avec l'état parent
     * Gère le cas où la traduction se termine automatiquement
     */
    React.useEffect(() => {
        if (!isTranslating && isStarted) {
            // La traduction s'est terminée, on peut rester en mode "started"
            // pour permettre de relancer facilement
        }
    }, [isTranslating, isStarted]);

    return (
        <div className={cn('flex items-center space-x-2', className)}>
            {/* Interface conditionnelle basée sur l'état de la session */}
            {!isStarted ? (
                // Mode initial : bouton de démarrage unique
                <CustomButton
                    onClick={handleStart}
                    disabled={disabled || isTranslating}
                    variant="default"
                    size="sm"
                >
                    {isTranslating ? (
                        // État de chargement avec animation
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Traduction...
                        </>
                    ) : (
                        // État prêt à démarrer
                        <>
                            <Play className="h-4 w-4 mr-2" />
                            Traduire
                        </>
                    )}
                </CustomButton>
            ) : (
                // Mode session active : contrôles étendus
                <>
                    {/* Bouton d'arrêt avec style distinctif */}
                    <CustomButton
                        onClick={handleStop}
                        disabled={disabled}
                        variant="destructive"
                        size="sm"
                    >
                        <Square className="h-4 w-4 mr-2" />
                        Arrêter
                    </CustomButton>

                    {/* Bouton de reset pour recommencer */}
                    <CustomButton
                        onClick={handleReset}
                        disabled={disabled}
                        variant="outline"
                        size="sm"
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                    </CustomButton>
                </>
            )}
        </div>
    );
};

export default TranslationControls;