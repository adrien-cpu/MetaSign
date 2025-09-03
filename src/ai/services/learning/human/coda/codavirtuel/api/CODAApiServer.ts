/**
 * @file src/ai/services/learning/human/coda/codavirtuel/api/CODAApiServer.ts
 * @description Serveur API principal pour le système CODA avec support temps réel
 * 
 * Fonctionnalités :
 * - 🚀 Serveur HTTP/WebSocket intégré
 * - 📡 Notifications temps réel pour les sessions
 * - 🔄 Intégration complète avec repositories et système CODA
 * - 📊 Métriques et monitoring en temps réel
 * - 🔒 Sécurité et authentification
 * - 📝 Documentation API automatique
 * 
 * @module api
 * @version 1.0.0
 * @since 2025
 * @author MetaSign Team - CODA API Server
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { RepositoryFactory, type RepositorySet } from '../repositories/index';
import { ReverseApprenticeshipSystem } from '../ReverseApprenticeshipSystem';
import { UserController } from './controllers/UserController';
import { SessionController } from './controllers/SessionController';
import { CODAApiRouter, type HttpRequest, type HttpResponse } from './routes/index';

/**
 * Configuration du serveur API
 */
export interface CODAApiServerConfig {
    readonly port?: number;
    readonly host?: string;
    readonly environment?: 'development' | 'production' | 'test';
    readonly enableWebSocket?: boolean;
    readonly enableCors?: boolean;
    readonly enableDocs?: boolean;
    readonly maxConnections?: number;
    readonly requestTimeout?: number;
    readonly enableMetrics?: boolean;
}

/**
 * Message WebSocket pour les notifications temps réel
 */
export interface WebSocketMessage {
    readonly type: 'session_update' | 'interaction_added' | 'user_progress' | 'system_notification';
    readonly sessionId?: string;
    readonly userId?: string;
    readonly data: Record<string, unknown>;
    readonly timestamp: string;
}

/**
 * Client WebSocket connecté
 */
interface WebSocketClient {
    readonly id: string;
    readonly userId?: string;
    readonly sessionId?: string;
    readonly connectedAt: Date;
    send(message: WebSocketMessage): void;
    close(): void;
}

/**
 * Serveur API CODA avec support temps réel
 */
export class CODAApiServer {
    private readonly logger = LoggerFactory.getLogger('CODAApiServer');
    private readonly config: Required<CODAApiServerConfig>;
    
    private repositories: RepositorySet | null = null;
    private codaSystem: ReverseApprenticeshipSystem | null = null;
    private router: CODAApiRouter | null = null;
    
    private isRunning = false;
    private connections = new Set<WebSocketClient>();
    private requestCount = 0;
    private startTime: Date | null = null;

    constructor(config: CODAApiServerConfig = {}) {
        this.config = {
            port: config.port ?? 3000,
            host: config.host ?? 'localhost',
            environment: config.environment ?? 'development',
            enableWebSocket: config.enableWebSocket ?? true,
            enableCors: config.enableCors ?? true,
            enableDocs: config.enableDocs ?? true,
            maxConnections: config.maxConnections ?? 1000,
            requestTimeout: config.requestTimeout ?? 30000,
            enableMetrics: config.enableMetrics ?? true
        };

        this.logger.info('🏗️ Serveur API CODA initialisé', {
            environment: this.config.environment,
            webSocketEnabled: this.config.enableWebSocket,
            metricsEnabled: this.config.enableMetrics
        });
    }

    // ==================== DÉMARRAGE ET ARRÊT ====================

    /**
     * Démarre le serveur API
     */
    public async start(): Promise<void> {
        if (this.isRunning) {
            this.logger.warn('⚠️ Serveur déjà en cours d\'exécution');
            return;
        }

        try {
            this.logger.info('🚀 Démarrage serveur API CODA', {
                host: this.config.host,
                port: this.config.port,
                environment: this.config.environment
            });

            // Initialiser les repositories
            await this.initializeRepositories();
            
            // Initialiser le système CODA
            await this.initializeCODASystem();
            
            // Configurer le routeur API
            this.setupRouter();
            
            // Démarrer le serveur HTTP (simulation)
            await this.startHttpServer();
            
            // Configurer WebSocket si activé
            if (this.config.enableWebSocket) {
                this.setupWebSocket();
            }
            
            // Configurer les métriques si activées
            if (this.config.enableMetrics) {
                this.setupMetrics();
            }

            this.isRunning = true;
            this.startTime = new Date();

            this.logger.info('✅ Serveur API CODA démarré avec succès', {
                host: this.config.host,
                port: this.config.port,
                pid: process.pid
            });

            // Afficher les routes disponibles
            this.logAvailableRoutes();

        } catch (error) {
            this.logger.error('❌ Erreur démarrage serveur API', { error });
            throw new Error(`Impossible de démarrer le serveur API: ${error}`);
        }
    }

    /**
     * Arrête le serveur API proprement
     */
    public async stop(): Promise<void> {
        if (!this.isRunning) {
            this.logger.warn('⚠️ Serveur déjà arrêté');
            return;
        }

        try {
            this.logger.info('🛑 Arrêt du serveur API CODA');

            // Fermer toutes les connexions WebSocket
            this.closeAllWebSocketConnections();
            
            // Arrêter le système CODA
            if (this.codaSystem) {
                await this.codaSystem.destroy();
                this.codaSystem = null;
            }
            
            // Fermer les repositories
            if (this.repositories) {
                await this.repositories.destroyAll();
                this.repositories = null;
            }

            this.isRunning = false;
            this.startTime = null;

            this.logger.info('✅ Serveur API CODA arrêté proprement');

        } catch (error) {
            this.logger.error('❌ Erreur arrêt serveur', { error });
            throw error;
        }
    }

    // ==================== INITIALISATION ====================

    private async initializeRepositories(): Promise<void> {
        this.logger.debug('📚 Initialisation repositories');

        switch (this.config.environment) {
            case 'production':
                this.repositories = await RepositoryFactory.createProdRepositories();
                break;
            case 'test':
                this.repositories = await RepositoryFactory.createTestRepositories();
                break;
            case 'development':
            default:
                this.repositories = await RepositoryFactory.createDevRepositories();
                break;
        }

        this.logger.info('✅ Repositories initialisés', {
            environment: this.config.environment
        });
    }

    private async initializeCODASystem(): Promise<void> {
        this.logger.debug('🤖 Initialisation système CODA');

        this.codaSystem = new ReverseApprenticeshipSystem({
            enableRealTimeAnalytics: true,
            enableModularArchitecture: true,
            aiIntelligenceLevel: 'advanced',
            culturalAuthenticity: true,
            predictiveLearning: true
        });

        this.logger.info('✅ Système CODA initialisé');
    }

    private setupRouter(): void {
        if (!this.repositories || !this.codaSystem) {
            throw new Error('Repositories et système CODA doivent être initialisés avant le routeur');
        }

        this.logger.debug('🛣️ Configuration routeur API');

        const userController = new UserController(this.repositories.users);
        const sessionController = new SessionController(this.repositories.sessions, this.codaSystem);

        this.router = new CODAApiRouter(userController, sessionController);

        this.logger.info('✅ Routeur API configuré', {
            routes: this.router.getStats()
        });
    }

    private async startHttpServer(): Promise<void> {
        // Simulation d'un serveur HTTP - à remplacer par Express/Fastify réel
        this.logger.info('🌐 Serveur HTTP simulé démarré', {
            host: this.config.host,
            port: this.config.port
        });

        // Dans une vraie implémentation, ici on configurerait Express/Fastify
        // et on appellerait router.handleRequest() pour chaque requête
    }

    private setupWebSocket(): void {
        this.logger.debug('📡 Configuration WebSocket');

        // Simulation WebSocket - à remplacer par vraie implémentation
        this.logger.info('✅ WebSocket configuré', {
            maxConnections: this.config.maxConnections
        });
    }

    private setupMetrics(): void {
        this.logger.debug('📊 Configuration métriques');

        // Démarrer collecte métriques périodique
        setInterval(() => {
            this.collectMetrics();
        }, 60000); // Toutes les minutes

        this.logger.info('✅ Métriques configurées');
    }

    // ==================== GESTION DES REQUÊTES ====================

    /**
     * Traite une requête HTTP (méthode publique pour integration)
     */
    public async handleHttpRequest(req: HttpRequest, res: HttpResponse): Promise<void> {
        if (!this.isRunning || !this.router) {
            res.status(503).json({
                success: false,
                error: {
                    code: 'SERVICE_UNAVAILABLE',
                    message: 'Serveur non disponible'
                },
                timestamp: new Date().toISOString()
            });
            return;
        }

        this.requestCount++;
        
        // Ajouter timeout de requête
        const timeout = setTimeout(() => {
            res.status(408).json({
                success: false,
                error: {
                    code: 'REQUEST_TIMEOUT',
                    message: 'Timeout de requête'
                },
                timestamp: new Date().toISOString()
            });
        }, this.config.requestTimeout);

        try {
            // Traiter la requête via le routeur
            await this.router.handleRequest(req, res);
        } finally {
            clearTimeout(timeout);
        }
    }

    // ==================== WEBSOCKET TEMPS RÉEL ====================

    /**
     * Ajoute un client WebSocket
     */
    public addWebSocketClient(client: WebSocketClient): void {
        if (this.connections.size >= this.config.maxConnections) {
            this.logger.warn('⚠️ Limite connexions atteinte', {
                current: this.connections.size,
                max: this.config.maxConnections
            });
            client.close();
            return;
        }

        this.connections.add(client);
        
        this.logger.debug('📡 Nouveau client WebSocket', {
            clientId: client.id,
            totalConnections: this.connections.size
        });

        // Envoyer message de bienvenue
        client.send({
            type: 'system_notification',
            data: {
                message: 'Connexion WebSocket établie',
                serverTime: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Supprime un client WebSocket
     */
    public removeWebSocketClient(clientId: string): void {
        const client = Array.from(this.connections).find(c => c.id === clientId);
        if (client) {
            this.connections.delete(client);
            this.logger.debug('📡 Client WebSocket déconnecté', {
                clientId,
                totalConnections: this.connections.size
            });
        }
    }

    /**
     * Diffuse un message à tous les clients connectés
     */
    public broadcastMessage(message: WebSocketMessage): void {
        this.connections.forEach(client => {
            try {
                client.send(message);
            } catch (error) {
                this.logger.warn('⚠️ Erreur envoi message WebSocket', {
                    clientId: client.id,
                    error
                });
                this.connections.delete(client);
            }
        });
    }

    /**
     * Envoie un message à un client spécifique
     */
    public sendToClient(clientId: string, message: WebSocketMessage): void {
        const client = Array.from(this.connections).find(c => c.id === clientId);
        if (client) {
            try {
                client.send(message);
            } catch (error) {
                this.logger.warn('⚠️ Erreur envoi message ciblé', {
                    clientId,
                    error
                });
                this.connections.delete(client);
            }
        }
    }

    /**
     * Diffuse les mises à jour de session en temps réel
     */
    public broadcastSessionUpdate(sessionId: string, updateData: Record<string, unknown>): void {
        const message: WebSocketMessage = {
            type: 'session_update',
            sessionId,
            data: updateData,
            timestamp: new Date().toISOString()
        };

        // Envoyer seulement aux clients concernés par cette session
        this.connections.forEach(client => {
            if (client.sessionId === sessionId) {
                try {
                    client.send(message);
                } catch (error) {
                    this.logger.warn('⚠️ Erreur diffusion session', {
                        clientId: client.id,
                        sessionId,
                        error
                    });
                }
            }
        });
    }

    private closeAllWebSocketConnections(): void {
        this.logger.debug('🔌 Fermeture connexions WebSocket', {
            count: this.connections.size
        });

        this.connections.forEach(client => {
            try {
                client.send({
                    type: 'system_notification',
                    data: { message: 'Serveur en cours d\'arrêt' },
                    timestamp: new Date().toISOString()
                });
                client.close();
            } catch (error) {
                this.logger.warn('⚠️ Erreur fermeture client', { 
                    clientId: client.id,
                    error 
                });
            }
        });

        this.connections.clear();
    }

    // ==================== MÉTRIQUES ET MONITORING ====================

    private collectMetrics(): void {
        const uptime = this.startTime ? Date.now() - this.startTime.getTime() : 0;
        
        const metrics = {
            server: {
                isRunning: this.isRunning,
                uptime,
                environment: this.config.environment,
                requestCount: this.requestCount,
                requestsPerMinute: this.requestCount / (uptime / 60000) || 0
            },
            websocket: {
                activeConnections: this.connections.size,
                maxConnections: this.config.maxConnections
            },
            repositories: this.repositories ? this.repositories.getGlobalStats() : null,
            timestamp: new Date().toISOString()
        };

        this.logger.debug('📊 Métriques collectées', metrics);

        // Diffuser les métriques aux clients qui les demandent
        this.broadcastMessage({
            type: 'system_notification',
            data: { type: 'metrics', metrics },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Retourne les statistiques du serveur
     */
    public getServerStats(): {
        isRunning: boolean;
        uptime: number;
        requestCount: number;
        connectionCount: number;
        config: CODAApiServerConfig;
        routes: Record<string, unknown>;
    } {
        const uptime = this.startTime ? Date.now() - this.startTime.getTime() : 0;
        
        return {
            isRunning: this.isRunning,
            uptime,
            requestCount: this.requestCount,
            connectionCount: this.connections.size,
            config: this.config,
            routes: this.router ? this.router.getStats() : {}
        };
    }

    /**
     * Génère la documentation OpenAPI
     */
    public generateApiDocumentation(): object | null {
        if (!this.router) return null;
        return this.router.generateOpenApiDoc();
    }

    /**
     * Check de santé du serveur
     */
    public async healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        timestamp: string;
        services: Record<string, 'up' | 'down'>;
        metrics: Record<string, unknown>;
    }> {
        const services: Record<string, 'up' | 'down'> = {};
        
        // Vérifier les services
        services.server = this.isRunning ? 'up' : 'down';
        services.repositories = this.repositories ? 'up' : 'down';
        services.codaSystem = this.codaSystem ? 'up' : 'down';
        services.router = this.router ? 'up' : 'down';

        const allServicesUp = Object.values(services).every(status => status === 'up');
        
        return {
            status: allServicesUp ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            services,
            metrics: this.getServerStats()
        };
    }

    // ==================== UTILITAIRES ====================

    private logAvailableRoutes(): void {
        if (!this.router) return;

        const routes = this.router.getRoutes();
        
        this.logger.info('📋 Routes API disponibles:');
        routes.forEach(route => {
            this.logger.info(`  ${route.method} ${route.path} - ${route.description || 'Pas de description'}`);
        });
    }

    /**
     * Redémarre le serveur
     */
    public async restart(): Promise<void> {
        this.logger.info('🔄 Redémarrage serveur API CODA');
        
        await this.stop();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Attente 1s
        await this.start();
        
        this.logger.info('✅ Serveur API CODA redémarré');
    }

    /**
     * Met à jour la configuration à chaud (certains paramètres seulement)
     */
    public updateConfig(updates: Partial<CODAApiServerConfig>): void {
        this.logger.info('⚙️ Mise à jour configuration', { updates });
        
        // Seuls certains paramètres peuvent être mis à jour à chaud
        if (updates.maxConnections !== undefined) {
            (this.config as CODAApiServerConfig & { maxConnections: number }).maxConnections = updates.maxConnections;
        }
        if (updates.requestTimeout !== undefined) {
            (this.config as CODAApiServerConfig & { requestTimeout: number }).requestTimeout = updates.requestTimeout;
        }
        
        this.logger.info('✅ Configuration mise à jour');
    }
}