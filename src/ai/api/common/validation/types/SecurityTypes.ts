/**
 * src/ai/api/common/validation/types/SecurityTypes.ts
 * @file SecurityTypes.ts
 * @description
 * Définit les types et interfaces liés à la sécurité, y compris les contextes de sécurité,
 * les règles de sécurité, les audits et les méthodes de validation.
 */

import { DependencyValidationResult } from '../../../security/dependency/SecurityDependencyValidator';

/**
 * Interface pour l'auditeur de sécurité.
 * Fournit des méthodes pour enregistrer et suivre les activités liées à la sécurité.
 */
export interface SecurityAuditor {
    /**
     * Enregistre les résultats d'une vérification de dépendances.
     * 
     * @param result Résultat de la validation des dépendances.
     * @returns Une promesse résolue une fois que l'enregistrement est terminé.
     */
    logDependencyCheck(result: DependencyValidationResult): Promise<void>;
}

/**
 * Représente le contexte de sécurité dans lequel une opération est effectuée.
 */
export interface SecurityContext {
    /**
     * Identifiant de l'utilisateur (facultatif).
     */
    userId?: string;

    /**
     * Liste des rôles attribués à l'utilisateur.
     */
    roles: string[];

    /**
     * Liste des permissions attribuées à l'utilisateur.
     */
    permissions: string[];

    /**
     * Identifiant de la session (facultatif).
     */
    sessionId?: string;

    /**
     * Adresse IP de l'utilisateur.
     */
    ip: string;

    /**
     * Agent utilisateur (User-Agent) de l'utilisateur.
     */
    userAgent: string;

    /**
     * Horodatage de l'opération.
     */
    timestamp: number;

    /**
     * Environnement dans lequel l'opération est effectuée (ex. : "production", "test").
     */
    environment: string;

    /**
     * Niveau de chiffrement requis pour l'opération.
     */
    encryptionLevel: 'none' | 'basic' | 'high';

    /**
     * Informations d'authentification de l'utilisateur.
     */
    auth: {
        /**
         * Type d'authentification utilisé (ex. : "none", "basic", "jwt", "oauth").
         */
        type: 'none' | 'basic' | 'jwt' | 'oauth';

        /**
         * Jeton d'authentification (facultatif).
         */
        token?: string;

        /**
         * Date d'expiration du jeton (facultatif).
         */
        expires?: number;
    };
}

/**
 * Représente une règle de sécurité générique.
 */
export interface SecurityRule {
    /**
     * Identifiant unique de la règle.
     */
    id: string;

    /**
     * Type de la règle (ex. : "authentication", "authorization", "data_protection").
     */
    type: 'authentication' | 'authorization' | 'data_protection';

    /**
     * Fonction de validation pour vérifier si le contexte respecte la règle.
     * 
     * @param context Contexte de sécurité à valider.
     * @returns Une promesse résolue avec `true` si la règle est respectée, sinon `false`.
     */
    validate: (context: SecurityContext) => Promise<boolean>;

    /**
     * Message d'erreur en cas de violation de la règle.
     */
    errorMessage: string;

    /**
     * Niveau de sévérité de la règle.
     */
    severity: 'low' | 'medium' | 'high' | 'critical';

    /**
     * Catégories auxquelles appartient la règle.
     */
    category: string[];
}

/**
 * Représente une règle de protection des données.
 */
export interface DataProtectionRule extends SecurityRule {
    /**
     * Type de la règle (toujours "data_protection").
     */
    type: 'data_protection';

    /**
     * Types de données concernés par la règle.
     */
    dataTypes: string[];

    /**
     * Niveau de chiffrement requis pour les données.
     */
    requiredEncryption: 'none' | 'basic' | 'high';

    /**
     * Niveau de confidentialité des données.
     */
    privacyLevel: 'public' | 'internal' | 'confidential' | 'restricted';
}

/**
 * Représente une règle d'authentification.
 */
export interface AuthenticationRule extends SecurityRule {
    /**
     * Type de la règle (toujours "authentication").
     */
    type: 'authentication';

    /**
     * Méthodes d'authentification acceptées.
     */
    methods: string[];

    /**
     * Niveau minimal de force requis pour l'authentification.
     */
    minStrength: number;

    /**
     * Indique si l'authentification multi-facteurs (MFA) est requise.
     */
    requireMFA: boolean;
}

/**
 * Représente une règle d'autorisation.
 */
export interface AuthorizationRule extends SecurityRule {
    /**
     * Type de la règle (toujours "authorization").
     */
    type: 'authorization';

    /**
     * Rôles requis pour accéder à la ressource.
     */
    requiredRoles: string[];

    /**
     * Permissions requises pour accéder à la ressource.
     */
    requiredPermissions: string[];

    /**
     * Type de ressource concernée par la règle.
     */
    resourceType: string;
}

/**
 * Représente un audit de sécurité.
 */
export interface SecurityAudit {
    /**
     * Horodatage de l'audit.
     */
    timestamp: number;

    /**
     * Contexte de sécurité associé à l'audit.
     */
    context: SecurityContext;

    /**
     * Résultats des règles appliquées lors de l'audit.
     */
    rules: {
        /**
         * Liste des règles respectées.
         */
        passed: string[];

        /**
         * Liste des règles non respectées.
         */
        failed: string[];
    };

    /**
     * Détails supplémentaires associés à l'audit.
     */
    details: Record<string, unknown>;
}