/**
 * Types centralisés pour le système CODA Virtuel - Version Refactorisée
 * @file types/index.ts
 * @description Point d'entrée centralisé pour tous les types du système CODA
 * 
 * Architecture refactorisée selon le Guide de refactorisation MetaSign :
 * - Séparation par domaines fonctionnels
 * - Responsabilité unique par fichier
 * - Réduction de la complexité (1042 -> ~50 lignes)
 * - Respect des seuils critiques
 * 
 * @module types
 * @version 2.0.0 - Architecture refactorisée
 * @since 2025
 * @author MetaSign Team - CODA Types
 */

// ===== TYPES DE BASE =====
export * from './base';

// ===== PERSONNALITÉ ET ÉMOTIONS =====
export * from './personality';

// ===== CONFIGURATION =====
export * from './config';

// ===== MÉTRIQUES ET STATISTIQUES =====
export * from './metrics';

// ===== APPRENTISSAGE =====
export * from './learning';

// ===== SESSIONS =====
export * from './session';

// ===== UTILITAIRES =====
export * from './utils';

// ===== FONCTIONS DE COMPATIBILITÉ =====
// Fonctions utilitaires pour maintenir la compatibilité avec l'ancienne API

import { CODAPersonalityType } from './base';
import { AIPersonalityProfile, ExtendedLearningPreferences } from './personality';
import { CODATypeUtils } from './utils';

/**
 * Crée un profil de personnalité AI par défaut avec traits LSF
 * @deprecated Utilisez CODATypeUtils.createDefaultPersonalityProfile ou les nouvelles fonctions
 */
export function createDefaultAIPersonalityProfile(type: CODAPersonalityType): AIPersonalityProfile {
    const baseProfile = CODATypeUtils.createDefaultPersonalityProfile(type);

    return {
        ...baseProfile,
        learningPreferences: {
            ...baseProfile.learningPreferences,
            visualLearningAffinity: 0.7,
            socialLearningPreference: 0.6
        } as ExtendedLearningPreferences,
        lsfTraits: {
            spatialExpression: 0.6,
            facialExpression: 0.5,
            manualPrecision: 0.7,
            culturalAwareness: 0.6,
            gestualFluency: 0.5,
            contextualAdaptation: 0.6
        }
    };
}