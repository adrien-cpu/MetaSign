/**
 * Types et interfaces pour le système d'alertes
 * @file src/ai/api/distributed/monitoring/health/types/alert.types.ts
 */

// Importer directement depuis ce fichier pour éviter les problèmes de référence circulaire
export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';

/**
 * Types de canaux d'alerte
 */
export enum AlertChannel {
    EMAIL = 'email',
    SLACK = 'slack',
    PAGER_DUTY = 'pagerduty',
    WEBHOOK = 'webhook'
}

/**
 * Interface de base pour les adaptateurs d'alerte
 */
export interface AlertAdapter {
    /**
     * Envoie une alerte via le canal spécifié
     * @param message Message d'alerte à envoyer
     * @param options Options de configuration pour l'envoi
     */
    sendAlert(message: AlertMessage, options: AlertOptions): Promise<void>;

    /**
     * Vérifie si une alerte peut être envoyée maintenant (gestion du throttling)
     * @param key Clé unique pour le type d'alerte
     * @param throttlingMinutes Temps minimum entre alertes en minutes
     * @returns True si une alerte peut être envoyée maintenant
     */
    canSendAlert(key: string, throttlingMinutes: number): boolean;
}

/**
 * Entrée dans l'historique des alertes
 */
export interface AlertHistoryEntry {
    /** Canal utilisé pour l'alerte */
    channel: string;

    /** Horodatage de l'envoi de l'alerte */
    timestamp: number;

    /** Sévérité de l'alerte */
    severity: AlertSeverity;

    /** Message d'alerte envoyé */
    message: string;
}

/**
 * Message d'alerte à envoyer
 */
export interface AlertMessage {
    /** Titre de l'alerte */
    title: string;

    /** Corps du message */
    body: string;

    /** Sévérité de l'alerte */
    severity: AlertSeverity;

    /** Lien vers plus d'informations ou actions */
    actionLink?: string;

    /** Détails supplémentaires sur l'alerte */
    details?: {
        /** Indicateurs clés de performance */
        kpis?: AlertKPIs;

        /** Pièces jointes supplémentaires */
        attachments?: SlackAttachment[];

        /** Métadonnées spécifiques à l'alerte */
        metadata?: Record<string, unknown>;

        /** Autres détails personnalisés */
        [key: string]: unknown;
    };
}

/**
 * Options pour l'envoi d'alertes
 */
export interface AlertOptions {
    /** Configuration spécifique à l'adaptateur */
    config: SlackConfig | EmailConfig | PagerDutyConfig;

    /** Si l'alerte est activée pour ce canal */
    enabled?: boolean;

    /** Activer/désactiver le throttling */
    enableThrottling?: boolean;

    /** Durée minimale entre alertes en minutes (si throttling activé) */
    throttlingMinutes?: number;

    /** Identifiant unique pour le throttling */
    throttlingKey?: string;

    /** Priorité de l'alerte (plus élevé = plus prioritaire) */
    priority?: number;
}

/**
 * Indicateurs de performance pour les alertes
 */
export interface AlertKPIs {
    /** Temps de réponse en ms */
    responseTime?: number;

    /** Pourcentage de CPU */
    cpuUsage?: number;

    /** Utilisation mémoire en MB */
    memoryUsage?: number;

    /** Taux d'erreur en pourcentage */
    errorRate?: number;

    /** Erreurs par minute */
    errorsPerMinute?: number;

    /** Autres indicateurs personnalisés */
    [key: string]: number | string | boolean | undefined;
}

/**
 * Configuration spécifique pour Slack
 */
export interface SlackConfig {
    /** Type d'adaptateur = slack */
    type: 'slack';

    /** URL du webhook Slack */
    webhookUrl: string;

    /** Canal Slack */
    channel: string;

    /** Nom d'utilisateur pour le bot (optionnel) */
    username?: string;

    /** URL de l'icône (optionnel) */
    iconUrl?: string;
}

/**
 * Configuration spécifique à l'email
 */
export interface EmailConfig {
    /** Type d'adaptateur = email */
    type: 'email';

    /** Liste des destinataires */
    recipients: string[];

    /** Adresse d'expédition */
    from: string;

    /** Configuration SMTP */
    smtp: {
        host: string;
        port: number;
        secure: boolean;
        auth?: {
            user: string;
            pass: string;
        };
    };
}

/**
 * Configuration spécifique à PagerDuty
 */
export interface PagerDutyConfig {
    /** Type d'adaptateur = pagerduty */
    type: 'pagerduty';

    /** Clé d'API PagerDuty */
    apiKey: string;

    /** ID du service PagerDuty */
    serviceId: string;

    /** Niveau d'urgence */
    urgency?: 'high' | 'low';
}

/**
 * Pièce jointe Slack
 */
export interface SlackAttachment {
    /** Titre de la pièce jointe */
    title: string;

    /** Texte de la pièce jointe */
    text: string;

    /** Statut associé */
    status?: string;

    /** Horodatage (timestamp) */
    timestamp: number | string;

    /** Couleur de la barre latérale (optionnel) */
    color?: string;
}

/**
 * Champ Slack
 */
export interface SlackField {
    /** Titre du champ */
    title: string;

    /** Valeur du champ */
    value: string;

    /** Si le champ doit être affiché en colonne (2 par ligne) */
    short?: boolean;
}

/**
 * Attachment Slack (dans le payload)
 */
export interface SlackAttachmentPayload {
    /** Couleur de la bordure latérale */
    color: string;

    /** Titre de l'attachment */
    title: string;

    /** Texte principal */
    text: string;

    /** Champs supplémentaires */
    fields: SlackField[];

    /** Texte de pied de page */
    footer: string;

    /** Timestamp Unix (en secondes) */
    ts: number;
}

/**
 * Payload pour l'API Slack
 */
export interface SlackPayload {
    /** Canal cible */
    channel: string;

    /** Texte principal (optionnel) */
    text?: string;

    /** Nom d'utilisateur (optionnel) */
    username?: string;

    /** URL de l'icône (optionnel) */
    icon_url?: string;

    /** Emoji de l'icône (optionnel) */
    icon_emoji?: string;

    /** Pièces jointes */
    attachments: Array<{
        /** Couleur de la barre latérale */
        color?: string;

        /** Préfixe pour le texte (optionnel) */
        pretext?: string;

        /** Titre de la pièce jointe */
        title?: string;

        /** URL associée au titre (optionnel) */
        title_link?: string;

        /** Texte principal */
        text?: string;

        /** Champs supplémentaires */
        fields?: Array<{
            /** Titre du champ */
            title: string;

            /** Valeur du champ */
            value: string;

            /** Indique si le champ est court (affichage côte à côte) */
            short?: boolean;
        }>;

        /** Texte de pied de page */
        footer?: string;

        /** URL de l'icône de pied de page (optionnel) */
        footer_icon?: string;

        /** Timestamp Unix */
        ts?: number;
    }>;
}