/**
 * Gestionnaire de webhooks pour les intégrations externes
 */
import { LogService } from '@api/common/monitoring/LogService';
import {
    APIResponse,
    WebhookConfig,
    WebhookEvent
} from './types';
import { createHmac } from 'crypto';

/**
 * Classe responsable de la gestion des webhooks et notifications externes
 */
export class WebhookManager {
    private readonly logger = new LogService('WebhookManager');
    private readonly webhooks: Map<string, WebhookConfig> = new Map();
    private readonly rateLimits: Map<string, {
        count: number,
        resetTime: number
    }> = new Map();

    /**
     * Crée une instance du gestionnaire de webhooks
     * @param httpClient Client HTTP pour l'envoi des notifications
     */
    constructor(private readonly httpClient: any) {
        this.logger.debug('WebhookManager initialized');
    }

    /**
     * Ajoute ou met à jour un webhook
     * @param config Configuration du webhook
     * @returns Le webhook mis à jour
     */
    public registerWebhook(config: WebhookConfig): WebhookConfig {
        this.logger.info(`Registering webhook ${config.id}`, {
            url: config.url,
            events: config.events.join(',')
        });

        this.webhooks.set(config.id, config);
        return config;
    }

    /**
     * Supprime un webhook
     * @param webhookId Identifiant du webhook
     * @returns true si le webhook a été supprimé
     */
    public unregisterWebhook(webhookId: string): boolean {
        this.logger.info(`Unregistering webhook ${webhookId}`);
        return this.webhooks.delete(webhookId);
    }

    /**
     * Notifie tous les abonnés concernés par une réponse API
     * @param response Réponse API à notifier
     * @returns Nombre de webhooks notifiés avec succès
     */
    public async notifySubscribers(response: APIResponse): Promise<number> {
        this.logger.debug(`Notifying subscribers for response ${response.requestId}`);

        // Construire l'événement
        const event: WebhookEvent = {
            id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
            type: 'api.response',
            data: response,
            timestamp: new Date(),
            apiVersion: '1.0'
        };

        // Filtrer les webhooks qui s'abonnent à tous les événements ou spécifiquement à api.response
        const eligibleWebhooks = Array.from(this.webhooks.values())
            .filter(webhook =>
                webhook.active &&
                (webhook.events.includes('*') || webhook.events.includes('api.response'))
            );

        this.logger.debug(`Found ${eligibleWebhooks.length} eligible webhooks`);

        // Envoyer les notifications en parallèle
        const results = await Promise.allSettled(
            eligibleWebhooks.map(webhook => this.deliverWebhookEvent(webhook, event))
        );

        // Compter les succès
        const successCount = results.filter(r => r.status === 'fulfilled').length;

        this.logger.info(`Successfully notified ${successCount}/${eligibleWebhooks.length} webhooks`);
        return successCount;
    }

    /**
     * Délivre un événement à un webhook spécifique
     * @param webhook Configuration du webhook
     * @param event Événement à délivrer
     * @returns Promise résolu si l'envoi est réussi
     * @private
     */
    private async deliverWebhookEvent(webhook: WebhookConfig, event: WebhookEvent): Promise<void> {
        this.logger.debug(`Delivering event ${event.id} to webhook ${webhook.id}`);

        // Vérifier le rate limit
        if (!this.checkRateLimit(webhook)) {
            this.logger.warn(`Rate limit exceeded for webhook ${webhook.id}`);
            throw new Error(`Rate limit exceeded for webhook ${webhook.id}`);
        }

        // Préparer les données selon le format
        let payload: string;
        const headers: Record<string, string> = {
            'Content-Type': webhook.format === 'JSON'
                ? 'application/json'
                : webhook.format === 'XML'
                    ? 'application/xml'
                    : 'application/x-www-form-urlencoded',
            'User-Agent': 'MetaSign-WebhookService/1.0',
            'X-Webhook-ID': webhook.id,
            'X-Event-ID': event.id,
            'X-Event-Type': event.type
        };

        // Sérialiser l'événement selon le format requis
        switch (webhook.format) {
            case 'JSON':
                payload = JSON.stringify(event);
                break;
            case 'XML':
                // Simplification: en réalité, on utiliserait une bibliothèque de conversion
                payload = `<event>
          <id>${event.id}</id>
          <type>${event.type}</type>
          <timestamp>${event.timestamp.toISOString()}</timestamp>
          <data>${JSON.stringify(event.data)}</data>
        </event>`;
                break;
            case 'FORM':
                const formData = new URLSearchParams();
                formData.append('event_id', event.id);
                formData.append('event_type', event.type);
                formData.append('timestamp', event.timestamp.toISOString());
                formData.append('data', JSON.stringify(event.data));
                payload = formData.toString();
                break;
            default:
                payload = JSON.stringify(event);
        }

        // Ajouter la signature pour la sécurité
        headers['X-Webhook-Signature'] = this.generateSignature(payload, webhook.secret);

        // Stratégie de retry avec délai exponentiel
        let attempt = 0;
        let lastError: Error | null = null;

        while (attempt < webhook.retryCount) {
            try {
                // Effectuer la requête
                await this.httpClient.post(webhook.url, payload, {
                    headers,
                    timeout: 10000 // 10 secondes de timeout par défaut
                });

                this.logger.debug(`Successfully delivered event ${event.id} to webhook ${webhook.id}`);
                return; // Sortir en cas de succès
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                attempt++;
                this.logger.warn(`Failed to deliver webhook ${webhook.id}, attempt ${attempt}/${webhook.retryCount}`, {
                    error: lastError.message
                });

                if (attempt < webhook.retryCount) {
                    // Attendre avec délai exponentiel avant la réessayer
                    const delay = webhook.retryDelay * Math.pow(2, attempt - 1);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        // Si on arrive ici, toutes les tentatives ont échoué
        this.logger.error(`All attempts failed for webhook ${webhook.id}`, {
            error: lastError?.message
        });

        throw lastError || new Error(`Failed to deliver webhook after ${webhook.retryCount} attempts`);
    }

    /**
     * Vérifie si un webhook a dépassé sa limite de taux
     * @param webhook Configuration du webhook
     * @returns true si le webhook peut être déclenché
     * @private
     */
    private checkRateLimit(webhook: WebhookConfig): boolean {
        if (!webhook.rateLimit) {
            return true; // Pas de limite configurée
        }

        const now = Date.now();
        const resetWindow = 60000; // 1 minute en ms
        const rateLimitKey = webhook.id;

        // Initialiser ou réinitialiser le compteur si nécessaire
        if (!this.rateLimits.has(rateLimitKey) || this.rateLimits.get(rateLimitKey)!.resetTime < now) {
            this.rateLimits.set(rateLimitKey, {
                count: 1,
                resetTime: now + resetWindow
            });
            return true;
        }

        // Vérifier et incrémenter le compteur existant
        const limit = this.rateLimits.get(rateLimitKey)!;
        if (limit.count >= webhook.rateLimit) {
            return false; // Limite dépassée
        }

        // Incrémenter le compteur
        limit.count++;
        return true;
    }

    /**
     * Génère une signature HMAC pour un payload et un secret donnés
     * @param payload Contenu à signer
     * @param secret Clé secrète
     * @returns Signature en hexadécimal
     * @private
     */
    private generateSignature(payload: string, secret: string): string {
        const hmac = createHmac('sha256', secret);
        hmac.update(payload);
        return hmac.digest('hex');
    }

    /**
     * Obtient tous les webhooks enregistrés
     * @returns Liste des configurations de webhook
     */
    public getAllWebhooks(): WebhookConfig[] {
        return Array.from(this.webhooks.values());
    }

    /**
     * Récupère un webhook par son ID
     * @param id Identifiant du webhook
     * @returns Configuration du webhook ou undefined
     */
    public getWebhook(id: string): WebhookConfig | undefined {
        return this.webhooks.get(id);
    }

    /**
     * Active ou désactive un webhook
     * @param id Identifiant du webhook
     * @param active État d'activation
     * @returns true si le webhook a été mis à jour
     */
    public setWebhookActive(id: string, active: boolean): boolean {
        const webhook = this.webhooks.get(id);
        if (!webhook) {
            return false;
        }

        webhook.active = active;
        this.webhooks.set(id, webhook);

        this.logger.info(`Webhook ${id} is now ${active ? 'active' : 'inactive'}`);
        return true;
    }
}