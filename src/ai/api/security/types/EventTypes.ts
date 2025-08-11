/**
 * @file Types et interfaces liés aux événements de sécurité
 */

/**
 * Niveaux de sévérité pour les événements de sécurité
 * Utilisé pour catégoriser les incidents selon leur impact potentiel
 */
export enum SecurityEventSeverity {
    /** Informationnel - aucun impact sur la sécurité */
    INFO = 'INFO',
    /** Avertissement - impact potentiel mineur */
    WARNING = 'WARNING',
    /** Erreur - impact significatif sur un sous-système */
    ERROR = 'ERROR',
    /** Critique - menace majeure à la sécurité du système */
    CRITICAL = 'CRITICAL'
}

/**
 * Méthodes d'authentification supportées par le système
 */
export enum AuthenticationMethod {
    /** Authentification par mot de passe */
    PASSWORD = 'PASSWORD',
    /** Authentification à deux facteurs */
    MFA = 'MFA',
    /** Authentification par token */
    TOKEN = 'TOKEN',
    /** Authentification par certificat */
    CERTIFICATE = 'CERTIFICATE',
    /** Authentification par identité fédérée (SSO) */
    FEDERATED = 'FEDERATED',
    /** Authentification biométrique */
    BIOMETRIC = 'BIOMETRIC'
}

/**
 * Types d'événements de sécurité
 */
export enum SecurityEventType {
    /** Tentative d'authentification */
    AUTHENTICATION = 'AUTHENTICATION',
    /** Tentative d'accès à une ressource */
    ACCESS = 'ACCESS',
    /** Modification de données sensibles */
    DATA_MODIFICATION = 'DATA_MODIFICATION',
    /** Configuration modifiée */
    CONFIGURATION_CHANGE = 'CONFIGURATION_CHANGE',
    /** Alerte de système de détection d'intrusion */
    IDS_ALERT = 'IDS_ALERT',
    /** Violation de politique de sécurité */
    POLICY_VIOLATION = 'POLICY_VIOLATION',
    /** Activité utilisateur suspecte */
    SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
    /** Événement d'audit de sécurité */
    AUDIT = 'AUDIT'
}

/**
 * Interface pour les événements de sécurité
 * Utilisée pour la journalisation et l'analyse des activités liées à la sécurité
 */
export interface SecurityEvent {
    /** Identifiant unique de l'événement */
    id: string;
    /** Horodatage de l'événement (ISO 8601) */
    timestamp: string;
    /** Type d'événement */
    type: SecurityEventType;
    /** Niveau de sévérité */
    severity: SecurityEventSeverity;
    /** Identifiant de l'utilisateur concerné */
    userId?: string;
    /** Identifiant de session */
    sessionId?: string;
    /** Adresse IP source */
    sourceIp?: string;
    /** URI de la ressource concernée */
    resourceUri?: string;
    /** Action réalisée ou tentée */
    action: string;
    /** Résultat de l'action (succès, échec, etc.) */
    result: 'success' | 'failure' | 'partial' | 'pending';
    /** Méthode d'authentification utilisée (si applicable) */
    authMethod?: AuthenticationMethod;
    /** Données contextuelles additionnelles */
    context?: Record<string, unknown>;
    /** Message descriptif */
    message: string;
}

/**
 * Interface pour les réponses à des incidents de sécurité
 */
export interface SecurityIncidentResponse {
    /** Identifiant de l'incident */
    incidentId: string;
    /** Horodatage de la détection */
    detectedAt: string;
    /** Horodatage de la réponse */
    respondedAt: string;
    /** Liste des événements de sécurité liés */
    relatedEvents: string[];
    /** Sévérité de l'incident */
    severity: SecurityEventSeverity;
    /** Statut actuel de l'incident */
    status: 'open' | 'investigating' | 'contained' | 'remediated' | 'closed';
    /** Actions entreprises */
    actions: string[];
    /** Mesures d'atténuation mises en place */
    mitigations: string[];
    /** Personnes impliquées dans la réponse */
    responders: string[];
    /** Notes et commentaires */
    notes?: string;
}

/**
 * Type pour les méta-données des événements de sécurité
 */
export type SecurityEventMetadata = {
    /** Tags associés à l'événement */
    tags: string[];
    /** Identifiants d'alertes associées */
    alertIds: string[];
    /** Niveau de confiance (0-100) */
    confidenceScore: number;
    /** Indicateurs de compromission */
    iocDetected: boolean;
    /** Données d'enrichissement */
    enrichment?: Record<string, unknown>;
};