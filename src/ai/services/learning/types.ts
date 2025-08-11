/**
 * @file src/ai/services/learning/types.ts
 * @description Types pour le module d'apprentissage - Fichier de compatibilité
 * @module LearningTypes
 * @version 3.0.0
 * @since 2024
 * @author MetaSign Team
 * 
 * @deprecated Ce fichier maintient la compatibilité ascendante.
 * Utilisez les imports depuis ./types/ pour de meilleures performances.
 * 
 * Migration recommandée :
 * - import { UserInteraction } from './types'              → import { UserInteraction } from './types/interaction'
 * - import { InteractionType } from './types'              → import { InteractionType } from './types/base'
 * - import { LEARNING_CONSTANTS } from './types'           → import { LEARNING_CONSTANTS } from './types/constants'
 * - import { InteractionUtils } from './types'             → import { InteractionUtils } from './types/interaction-utils'
 * 
 * Ce module définit les types principaux utilisés dans le module d'apprentissage.
 * Version consolidée incluant tous les types existants et les extensions nécessaires.
 * Compatible avec exactOptionalPropertyTypes: true
 */

// ===== REDIRECTION VERS LA NOUVELLE ARCHITECTURE MODULAIRE =====

// Réexport de tous les types depuis la nouvelle architecture
export * from './types';

// Imports statiques pour les types utilisés internellement
import type {
    UserInteraction,
    DeviceInfo
} from './types/interaction';
import {
    InteractionType
} from './types/base';
import type {
    LearningLevel,
    LearningSessionType,
    LearningSessionState,
    ProfilType,
    LearningStyle,
    SettingValue,
    Exercise
} from './types/base';

// ===== TYPES SUPPLÉMENTAIRES POUR COMPATIBILITÉ =====

/**
 * Interface utilisateur étendue avec profil détaillé (version legacy)
 * @interface LegacyExtendedUserProfile
 * @description Maintient la compatibilité avec l'ancienne interface ExtendedUserProfile
 */
export interface LegacyExtendedUserProfile {
    /** Identifiant unique de l'utilisateur */
    readonly id: string;
    /** Nom d'affichage */
    readonly displayName: string;
    /** Adresse email */
    readonly email: string;
    /** Type de profil utilisateur */
    readonly profileType: ProfilType;
    /** Niveau actuel en LSF */
    readonly currentLevel: LearningLevel;
    /** Style d'apprentissage préféré */
    readonly preferredLearningStyle: LearningStyle;
    /** Paramètres personnalisés */
    readonly settings: Record<string, SettingValue>;
    /** Date de création du profil */
    readonly createdAt: Date;
    /** Dernière mise à jour */
    readonly updatedAt: Date;
    /** Informations optionnelles supplémentaires */
    readonly additionalInfo?: {
        readonly age?: number;
        readonly location?: string;
        readonly experience?: string;
        readonly goals?: ReadonlyArray<string>;
        readonly accessibility?: {
            readonly needsHighContrast?: boolean;
            readonly needsLargeText?: boolean;
            readonly needsSlowMotion?: boolean;
        };
    };
}

/**
 * Session d'apprentissage étendue (version legacy)
 * @interface ExtendedLearningSession
 * @description Interface pour les sessions d'apprentissage étendues
 */
export interface ExtendedLearningSession {
    /** Identifiant de la session */
    readonly id: string;
    /** Identifiant de l'utilisateur */
    readonly userId: string;
    /** Type de session */
    readonly type: LearningSessionType;
    /** État actuel de la session */
    readonly state: LearningSessionState;
    /** Date de début */
    readonly startTime: Date;
    /** Date de fin (optionnelle) */
    readonly endTime?: Date;
    /** Durée totale en millisecondes */
    readonly duration: number;
    /** Exercices complétés */
    readonly completedExercises: ReadonlyArray<Exercise>;
    /** Score global de la session */
    readonly sessionScore?: number;
    /** Métadonnées de la session */
    readonly metadata: {
        readonly deviceUsed: DeviceInfo;
        readonly interactions: ReadonlyArray<UserInteraction>;
        readonly notes?: string;
    };
}

// Alias pour la compatibilité ascendante
export type UserProfileWithExtensions = LegacyExtendedUserProfile;
export type ExtendedUserProfile = LegacyExtendedUserProfile;

// Alias pour la compatibilité avec l'ancien code
export type {
    UserInteraction as LegacyUserInteraction,
    InteractionFilter as LegacyInteractionFilter,
    InteractionStatistics as LegacyInteractionStatistics
} from './types/interaction';

export {
    InteractionType as LegacyInteractionType,
    LearningLevel as LegacyCECRLevel
} from './types/base';

/**
 * @deprecated Utilisez LearningTypeUtils depuis ./types/index.ts à la place
 * Utilitaires legacy maintenus pour compatibilité
 */
export const LegacyLearningTypeUtils = {
    /**
     * @deprecated Utilisez LearningTypeUtils.validateUserInteraction
     */
    validateUserInteraction: (interaction: unknown): interaction is UserInteraction => {
        if (!interaction || typeof interaction !== 'object') return false;
        const obj = interaction as Record<string, unknown>;
        return (
            typeof obj.userId === 'string' &&
            typeof obj.activityId === 'string' &&
            typeof obj.interactionType === 'string' &&
            obj.timestamp instanceof Date
        );
    },

    /**
     * @deprecated Utilisez LearningTypeUtils.createDefaultUserInteraction
     */
    createDefaultUserInteraction: (
        userId: string,
        activityId: string,
        interactionType: InteractionType
    ): UserInteraction => {
        // Utilisation d'unknown pour éviter les erreurs de type strict
        const baseInteraction = {
            userId,
            activityId,
            interactionType,
            timestamp: new Date(),
            duration: 0,
            details: {},
            deviceInfo: {
                type: 'web',
                userAgent: 'MetaSign-Legacy-Utils',
                platform: 'unknown'
            },
            data: {},
            metadata: {
                source: 'legacy_utils',
                version: '3.0.0'
            }
        };

        return baseInteraction as unknown as UserInteraction;
    }
};

/**
 * @deprecated Utilisez LEARNING_CONSTANTS depuis ./types/constants.ts à la place
 * Constantes legacy maintenues pour compatibilité
 */
export const LEGACY_CONSTANTS = {
    /** @deprecated Utilisez LEARNING_CONSTANTS.VALID_INTERACTION_TYPES */
    VALID_INTERACTION_TYPES: Object.values(InteractionType),

    /** @deprecated Utilisez LEARNING_CONSTANTS.DEFAULT_INTERACTION_SERVICE_CONFIG */
    DEFAULT_CONFIG: {
        maxCacheSize: 1000,
        retentionTime: 24 * 60 * 60 * 1000,
        cleanupInterval: 60 * 60 * 1000,
        enableAutoAggregation: true,
        performanceThreshold: 2000,
        batchSize: 100,
        maxFlushDelay: 30000
    } as const
};

// ===== FONCTIONS UTILITAIRES LEGACY =====

/**
 * @deprecated Utilisez les nouveaux utilitaires depuis ./types/
 * Fonction de création d'interaction par défaut (legacy)
 */
export function createDefaultUserInteractionLegacy(
    userId: string,
    activityId: string,
    type: InteractionType
): UserInteraction {
    return LegacyLearningTypeUtils.createDefaultUserInteraction(userId, activityId, type);
}

/**
 * @deprecated Utilisez les nouveaux validateurs depuis ./types/validation.ts
 * Validation d'interaction utilisateur (legacy)
 */
export function validateUserInteractionLegacy(interaction: unknown): interaction is UserInteraction {
    return LegacyLearningTypeUtils.validateUserInteraction(interaction);
}

// ===== MESSAGE DE MIGRATION =====

/**
 * @deprecated
 * AVIS DE MIGRATION v3.0.0
 * 
 * Ce fichier est maintenu pour la compatibilité ascendante mais il est recommandé
 * de migrer vers la nouvelle architecture modulaire pour de meilleures performances :
 * 
 * ```typescript
 * // ❌ Ancien (fonctionnel mais pas optimal)
 * import { UserInteraction, InteractionType } from './types';
 * 
 * // ✅ Nouveau (recommandé)
 * import { UserInteraction } from './types/interaction';
 * import { InteractionType } from './types/base';
 * ```
 * 
 * La nouvelle architecture offre :
 * - Temps de compilation plus rapides
 * - Meilleure maintenance du code  
 * - Imports spécialisés pour la performance
 * - Typage plus strict et précis
 */
export const MIGRATION_INFO = {
    version: '3.0.0',
    deprecatedFile: 'types.ts',
    recommendedPath: './types/',
    benefits: [
        'Temps de compilation plus rapides',
        'Meilleure maintenance du code',
        'Imports spécialisés pour la performance',
        'Typage plus strict et précis'
    ]
} as const;

// ===== EXPORTS POUR LA RÉTROCOMPATIBILITÉ COMPLÈTE =====

/**
 * Tous les types et utilitaires sont disponibles via 'export * from ./types'
 * 
 * Types disponibles :
 * - UserInteraction, InteractionType, LearningLevel, LearningSessionType
 * - InteractionFilter, InteractionStatistics
 * - LearningTypeUtils, LEARNING_CONSTANTS
 * 
 * Usage recommandé :
 * ```typescript
 * import { UserInteraction, LearningTypeUtils } from './types';
 * ```
 */

/**
 * @deprecated
 * Fonction helper pour les migrations - À supprimer dans la v4.0.0
 * Permet de détecter l'usage de l'ancien fichier types.ts
 */
export const __LEGACY_TYPES_USAGE_DETECTED__ = true;