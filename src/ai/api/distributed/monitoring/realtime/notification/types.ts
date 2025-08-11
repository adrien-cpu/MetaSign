/**
 * Types et interfaces pour le système de notification
 */
import { AlertSeverity } from '../alerts/types';

// Réexporter AlertSeverity pour que les modules qui importent de ce fichier puissent l'utiliser
export { AlertSeverity };

/**
 * Types de canaux de notification supportés
 */
export enum NotificationChannelType {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    SLACK = 'SLACK',
    DASHBOARD = 'DASHBOARD',
    WEBHOOK = 'WEBHOOK',
    PUSH = 'PUSH'
}

/**
 * Structure d'un message d'alerte
 */
export interface AlertMessage {
    id: string;
    title: string;
    body: string;
    summary: string;
    severity: AlertSeverity;
    timestamp: Date;
    source: string;
    metadata: Record<string, unknown>;
    urgency?: boolean;
    category?: string;
    tags?: string[];
}

/**
 * Format d'email
 */
export interface EmailFormat {
    subject: string;
    body: string;
    isHtml: boolean;
    attachments?: EmailAttachment[];
}

/**
 * Pièce jointe d'email
 */
export interface EmailAttachment {
    filename: string;
    content: Buffer | string;
    contentType: string;
}

/**
 * Options d'envoi d'email
 */
export interface EmailSendOptions {
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    body: string;
    isHtml?: boolean;
    attachments?: EmailAttachment[];
    priority: EmailPriority;
    headers?: Record<string, string>;
}

/**
 * Priorité d'email
 */
export enum EmailPriority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
    URGENT = 'urgent'
}

/**
 * Destinataire de notification
 */
export interface Recipient {
    id: string;
    name: string;
    email: string;
    phone?: string;
    slackId?: string;
    preferences: {
        channels: NotificationChannelType[];
        severity: AlertSeverity[];
        schedules?: NotificationSchedule[];
        emailFormat?: 'plain' | 'html';
    };
    groups?: string[];
    tags?: string[];
}

/**
 * Planification des notifications
 */
export interface NotificationSchedule {
    channelType: NotificationChannelType;
    daysOfWeek: number[]; // 0=dimanche, 1=lundi, etc.
    startTime: string; // format HH:MM
    endTime: string; // format HH:MM
    timezone: string;
}

/**
 * Configuration d'une stratégie de nouvelle tentative
 */
export interface RetryPolicyConfig {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
    backoffFactor: number;
    retryableErrors: string[];
}

/**
 * Résultat d'envoi d'une notification
 */
export interface SendResult {
    success: boolean;
    messageId?: string;
    timestamp: Date;
    errors?: Error[];
    retryCount?: number;
    recipients: {
        successful: string[];
        failed: string[];
    };
    metadata?: Record<string, unknown>;
}