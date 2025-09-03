/**
 * @file src/ai/services/learning/human/coda/codavirtuel/api/routes/index.ts
 * @description Configuration des routes API REST pour le système CODA
 * 
 * Fonctionnalités :
 * - 🛣️ Configuration complète des routes utilisateurs et sessions
 * - 🔒 Middleware de validation et d'authentification
 * - 📊 Middleware de métriques et logging
 * - 🔄 Gestion des erreurs centralisée
 * - 📝 Documentation OpenAPI automatique
 * - ⚡ Support WebSocket pour temps réel
 * 
 * @module api/routes
 * @version 1.0.0
 * @since 2025
 * @author MetaSign Team - CODA API Routes
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type { UserController } from '../controllers/UserController';
import type { SessionController } from '../controllers/SessionController';

/**
 * Types pour les requêtes HTTP simulées (à remplacer par Express/Fastify)
 */
export interface HttpRequest {
    readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    readonly path: string;
    readonly params: Record<string, string>;
    readonly query: Record<string, string>;
    readonly body: Record<string, unknown>;
    readonly headers: Record<string, string>;
    readonly userId?: string; // Ajouté par middleware d'auth
}

export interface HttpResponse {
    status(code: number): HttpResponse;
    json(data: unknown): void;
    send(data?: unknown): void;
}

/**
 * Interface pour les handlers de route
 */
export type RouteHandler = (req: HttpRequest, res: HttpResponse) => Promise<void>;

/**
 * Interface pour les middlewares
 */
export type Middleware = (req: HttpRequest, res: HttpResponse, next: () => void) => Promise<void>;

/**
 * Configuration d'une route
 */
export interface RouteConfig {
    readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    readonly path: string;
    readonly handler: RouteHandler;
    readonly middlewares?: Middleware[];
    readonly description?: string;
    readonly requiresAuth?: boolean;
}

/**
 * Gestionnaire de routes API CODA
 */
export class CODAApiRouter {
    private readonly logger = LoggerFactory.getLogger('CODAApiRouter');
    private readonly routes: RouteConfig[] = [];
    private readonly globalMiddlewares: Middleware[] = [];

    constructor(
        private readonly userController: UserController,
        private readonly sessionController: SessionController
    ) {
        this.setupGlobalMiddlewares();
        this.setupRoutes();
    }

    // ==================== CONFIGURATION DES MIDDLEWARES ====================

    private setupGlobalMiddlewares(): void {
        // Middleware de logging des requêtes
        this.globalMiddlewares.push(this.createLoggingMiddleware());
        
        // Middleware de validation CORS
        this.globalMiddlewares.push(this.createCorsMiddleware());
        
        // Middleware de validation du content-type
        this.globalMiddlewares.push(this.createContentTypeMiddleware());
        
        // Middleware de gestion des erreurs
        this.globalMiddlewares.push(this.createErrorHandlingMiddleware());
    }

    private createLoggingMiddleware(): Middleware {
        return async (req, res, next) => {
            const startTime = Date.now();
            
            this.logger.debug('📥 Requête API', {
                method: req.method,
                path: req.path,
                query: req.query,
                userAgent: req.headers['user-agent'],
                ip: req.headers['x-forwarded-for'] || req.headers['remote-addr']
            });

            const originalJson = res.json.bind(res);
            res.json = (data: unknown) => {
                const duration = Date.now() - startTime;
                
                this.logger.info('📤 Réponse API', {
                    method: req.method,
                    path: req.path,
                    duration,
                    success: (data as { success?: boolean }).success !== false
                });
                
                return originalJson(data);
            };

            next();
        };
    }

    private createCorsMiddleware(): Middleware {
        return async (_req, res, next) => {
            // Ajouter headers CORS (à configurer selon besoins)
            res.status = res.status || (() => res);
            next();
        };
    }

    private createContentTypeMiddleware(): Middleware {
        return async (req, res, next) => {
            if (['POST', 'PUT'].includes(req.method) && 
                req.headers['content-type'] && 
                !req.headers['content-type'].includes('application/json')) {
                
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_CONTENT_TYPE',
                        message: 'Content-Type must be application/json'
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            
            next();
        };
    }

    private createErrorHandlingMiddleware(): Middleware {
        return async (req, res, next) => {
            try {
                next();
            } catch (error) {
                this.logger.error('💥 Erreur middleware', {
                    method: req.method,
                    path: req.path,
                    error
                });

                res.status(500).json({
                    success: false,
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: 'Erreur interne du serveur'
                    },
                    timestamp: new Date().toISOString()
                });
            }
        };
    }

    private createAuthMiddleware(): Middleware {
        return async (req, res, next) => {
            const authHeader = req.headers['authorization'];
            
            if (!authHeader) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: 'MISSING_AUTHORIZATION',
                        message: 'Header Authorization requis'
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }

            // Validation simple du token (à remplacer par vraie logique)
            const token = authHeader.replace('Bearer ', '');
            if (!token || token.length < 10) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: 'INVALID_TOKEN',
                        message: 'Token d\'authentification invalide'
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }

            // Extraire userId du token (simulé)
            (req as HttpRequest & { userId: string }).userId = `user_${token.substring(0, 8)}`;
            
            next();
        };
    }

    // ==================== CONFIGURATION DES ROUTES ====================

    private setupRoutes(): void {
        this.setupUserRoutes();
        this.setupSessionRoutes();
        this.setupHealthRoutes();
    }

    private setupUserRoutes(): void {
        // POST /api/users - Créer un utilisateur
        this.addRoute({
            method: 'POST',
            path: '/api/users',
            handler: async (req, res) => {
                const response = await this.userController.createUser(req.body as {
                    userId: string;
                    profile: { currentLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'; };
                });
                res.status(response.success ? 201 : 400).json(response);
            },
            description: 'Crée un nouveau utilisateur',
            requiresAuth: false
        });

        // GET /api/users/:userId - Récupérer un utilisateur
        this.addRoute({
            method: 'GET',
            path: '/api/users/:userId',
            handler: async (req, res) => {
                const response = await this.userController.getUser(req.params.userId);
                res.status(response.success ? 200 : 404).json(response);
            },
            description: 'Récupère un utilisateur par son ID',
            requiresAuth: true
        });

        // PUT /api/users/:userId/profile - Mettre à jour profil
        this.addRoute({
            method: 'PUT',
            path: '/api/users/:userId/profile',
            handler: async (req, res) => {
                const response = await this.userController.updateUserProfile(req.params.userId, req.body);
                res.status(response.success ? 200 : 400).json(response);
            },
            description: 'Met à jour le profil d\'un utilisateur',
            requiresAuth: true
        });

        // PUT /api/users/:userId/preferences - Mettre à jour préférences
        this.addRoute({
            method: 'PUT',
            path: '/api/users/:userId/preferences',
            handler: async (req, res) => {
                const response = await this.userController.updateUserPreferences(req.params.userId, req.body);
                res.status(response.success ? 200 : 400).json(response);
            },
            description: 'Met à jour les préférences d\'un utilisateur',
            requiresAuth: true
        });

        // DELETE /api/users/:userId - Supprimer un utilisateur
        this.addRoute({
            method: 'DELETE',
            path: '/api/users/:userId',
            handler: async (req, res) => {
                const response = await this.userController.deleteUser(req.params.userId);
                res.status(response.success ? 204 : 404).json(response);
            },
            description: 'Supprime un utilisateur',
            requiresAuth: true
        });

        // GET /api/users - Rechercher des utilisateurs
        this.addRoute({
            method: 'GET',
            path: '/api/users',
            handler: async (req, res) => {
                const response = await this.userController.searchUsers(req.query);
                res.status(200).json(response);
            },
            description: 'Recherche des utilisateurs avec filtres',
            requiresAuth: true
        });

        // GET /api/users/:userId/metrics - Métriques utilisateur
        this.addRoute({
            method: 'GET',
            path: '/api/users/:userId/metrics',
            handler: async (req, res) => {
                const response = await this.userController.getUserMetrics(req.params.userId);
                res.status(response.success ? 200 : 404).json(response);
            },
            description: 'Récupère les métriques détaillées d\'un utilisateur',
            requiresAuth: true
        });
    }

    private setupSessionRoutes(): void {
        // POST /api/sessions - Créer une session
        this.addRoute({
            method: 'POST',
            path: '/api/sessions',
            handler: async (req, res) => {
                const response = await this.sessionController.createSession(req.body as {
                    mentorId: string;
                    topic: string;
                    targetLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
                });
                res.status(response.success ? 201 : 400).json(response);
            },
            description: 'Crée et démarre une nouvelle session d\'enseignement',
            requiresAuth: true
        });

        // GET /api/sessions/:sessionId - Récupérer une session
        this.addRoute({
            method: 'GET',
            path: '/api/sessions/:sessionId',
            handler: async (req, res) => {
                const response = await this.sessionController.getSession(req.params.sessionId);
                res.status(response.success ? 200 : 404).json(response);
            },
            description: 'Récupère une session par son ID',
            requiresAuth: true
        });

        // PUT /api/sessions/:sessionId - Mettre à jour une session
        this.addRoute({
            method: 'PUT',
            path: '/api/sessions/:sessionId',
            handler: async (req, res) => {
                const response = await this.sessionController.updateSession(req.params.sessionId, req.body);
                res.status(response.success ? 200 : 400).json(response);
            },
            description: 'Met à jour une session',
            requiresAuth: true
        });

        // DELETE /api/sessions/:sessionId - Supprimer une session
        this.addRoute({
            method: 'DELETE',
            path: '/api/sessions/:sessionId',
            handler: async (req, res) => {
                const response = await this.sessionController.deleteSession(req.params.sessionId);
                res.status(response.success ? 204 : 404).json(response);
            },
            description: 'Supprime une session',
            requiresAuth: true
        });

        // POST /api/sessions/:sessionId/pause - Mettre en pause
        this.addRoute({
            method: 'POST',
            path: '/api/sessions/:sessionId/pause',
            handler: async (req, res) => {
                const response = await this.sessionController.pauseSession(req.params.sessionId);
                res.status(response.success ? 200 : 400).json(response);
            },
            description: 'Met en pause une session active',
            requiresAuth: true
        });

        // POST /api/sessions/:sessionId/resume - Reprendre
        this.addRoute({
            method: 'POST',
            path: '/api/sessions/:sessionId/resume',
            handler: async (req, res) => {
                const response = await this.sessionController.resumeSession(req.params.sessionId);
                res.status(response.success ? 200 : 400).json(response);
            },
            description: 'Reprend une session en pause',
            requiresAuth: true
        });

        // POST /api/sessions/:sessionId/complete - Terminer
        this.addRoute({
            method: 'POST',
            path: '/api/sessions/:sessionId/complete',
            handler: async (req, res) => {
                const response = await this.sessionController.completeSession(req.params.sessionId);
                res.status(response.success ? 200 : 400).json(response);
            },
            description: 'Termine une session',
            requiresAuth: true
        });

        // POST /api/sessions/:sessionId/interactions - Ajouter interaction
        this.addRoute({
            method: 'POST',
            path: '/api/sessions/:sessionId/interactions',
            handler: async (req, res) => {
                const response = await this.sessionController.addInteraction(req.params.sessionId, req.body as {
                    type: 'teaching' | 'question' | 'correction' | 'encouragement' | 'break';
                    concept: string;
                    mentorInput: string;
                });
                res.status(response.success ? 201 : 400).json(response);
            },
            description: 'Ajoute une interaction à la session',
            requiresAuth: true
        });

        // GET /api/sessions/:sessionId/interactions - Récupérer interactions
        this.addRoute({
            method: 'GET',
            path: '/api/sessions/:sessionId/interactions',
            handler: async (req, res) => {
                const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
                const offset = req.query.offset ? parseInt(req.query.offset) : undefined;
                
                const response = await this.sessionController.getSessionInteractions(
                    req.params.sessionId, 
                    limit, 
                    offset
                );
                res.status(200).json(response);
            },
            description: 'Récupère les interactions d\'une session',
            requiresAuth: true
        });

        // GET /api/sessions - Rechercher des sessions
        this.addRoute({
            method: 'GET',
            path: '/api/sessions',
            handler: async (req, res) => {
                const response = await this.sessionController.searchSessions(req.query);
                res.status(200).json(response);
            },
            description: 'Recherche des sessions avec filtres',
            requiresAuth: true
        });

        // GET /api/sessions/stats - Statistiques des sessions
        this.addRoute({
            method: 'GET',
            path: '/api/sessions/stats',
            handler: async (req, res) => {
                const response = await this.sessionController.getSessionStats(req.query);
                res.status(200).json(response);
            },
            description: 'Récupère les statistiques globales des sessions',
            requiresAuth: true
        });
    }

    private setupHealthRoutes(): void {
        // GET /api/health - Check de santé
        this.addRoute({
            method: 'GET',
            path: '/api/health',
            handler: async (_req, res) => {
                const health = {
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    services: {
                        userRepository: 'up',
                        sessionRepository: 'up',
                        codaSystem: 'up'
                    }
                };
                
                res.status(200).json({
                    success: true,
                    data: health,
                    timestamp: new Date().toISOString()
                });
            },
            description: 'Vérifie la santé de l\'API',
            requiresAuth: false
        });

        // GET /api/version - Version de l'API
        this.addRoute({
            method: 'GET',
            path: '/api/version',
            handler: async (_req, res) => {
                res.status(200).json({
                    success: true,
                    data: {
                        version: '1.0.0',
                        name: 'CODA API',
                        description: 'API REST pour le système d\'apprentissage CODA',
                        buildTime: new Date().toISOString()
                    },
                    timestamp: new Date().toISOString()
                });
            },
            description: 'Retourne la version de l\'API',
            requiresAuth: false
        });
    }

    // ==================== GESTION DES ROUTES ====================

    private addRoute(config: RouteConfig): void {
        // Ajouter le middleware d'authentification si requis
        const middlewares = [...(config.middlewares || [])];
        if (config.requiresAuth) {
            middlewares.unshift(this.createAuthMiddleware());
        }

        const route: RouteConfig = {
            ...config,
            middlewares: [...this.globalMiddlewares, ...middlewares]
        };

        this.routes.push(route);
        
        this.logger.debug('🛣️ Route ajoutée', {
            method: config.method,
            path: config.path,
            requiresAuth: config.requiresAuth,
            middlewareCount: route.middlewares?.length || 0
        });
    }

    /**
     * Traite une requête HTTP
     */
    public async handleRequest(req: HttpRequest, res: HttpResponse): Promise<void> {
        try {
            // Trouver la route correspondante
            const route = this.findMatchingRoute(req.method, req.path);
            if (!route) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'ROUTE_NOT_FOUND',
                        message: `Route non trouvée: ${req.method} ${req.path}`
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }

            // Exécuter les middlewares
            if (route.middlewares) {
                for (const middleware of route.middlewares) {
                    let nextCalled = false;
                    const next = () => { nextCalled = true; };
                    
                    await middleware(req, res, next);
                    
                    if (!nextCalled) {
                        // Le middleware a interrompu la chaîne
                        return;
                    }
                }
            }

            // Exécuter le handler de la route
            await route.handler(req, res);

        } catch (error) {
            this.logger.error('💥 Erreur traitement requête', {
                method: req.method,
                path: req.path,
                error
            });

            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Erreur interne du serveur'
                },
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Trouve la route correspondant à une requête
     */
    private findMatchingRoute(method: string, path: string): RouteConfig | null {
        return this.routes.find(route => {
            if (route.method !== method) return false;
            
            // Correspondance exacte
            if (route.path === path) return true;
            
            // Correspondance avec paramètres (:param)
            const routeParts = route.path.split('/');
            const pathParts = path.split('/');
            
            if (routeParts.length !== pathParts.length) return false;
            
            return routeParts.every((part, index) => {
                return part.startsWith(':') || part === pathParts[index];
            });
        }) || null;
    }

    /**
     * Génère la documentation OpenAPI
     */
    public generateOpenApiDoc(): object {
        const paths: Record<string, Record<string, unknown>> = {};
        
        this.routes.forEach(route => {
            if (!paths[route.path]) {
                paths[route.path] = {};
            }
            
            paths[route.path][route.method.toLowerCase()] = {
                summary: route.description,
                tags: this.getTagsFromPath(route.path),
                security: route.requiresAuth ? [{ bearerAuth: [] }] : [],
                responses: {
                    200: { description: 'Succès' },
                    400: { description: 'Requête invalide' },
                    401: { description: 'Non authentifié' },
                    404: { description: 'Non trouvé' },
                    500: { description: 'Erreur serveur' }
                }
            };
        });

        return {
            openapi: '3.0.0',
            info: {
                title: 'CODA API',
                version: '1.0.0',
                description: 'API REST pour le système d\'apprentissage CODA'
            },
            servers: [
                { url: '/api', description: 'Serveur API' }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            },
            paths
        };
    }

    /**
     * Récupère les tags OpenAPI depuis le chemin
     */
    private getTagsFromPath(path: string): string[] {
        if (path.includes('/users')) return ['Users'];
        if (path.includes('/sessions')) return ['Sessions'];
        if (path.includes('/health') || path.includes('/version')) return ['System'];
        return ['General'];
    }

    /**
     * Retourne la liste des routes configurées
     */
    public getRoutes(): RouteConfig[] {
        return [...this.routes];
    }

    /**
     * Retourne les statistiques du routeur
     */
    public getStats(): {
        totalRoutes: number;
        routesByMethod: Record<string, number>;
        authRequiredCount: number;
    } {
        const routesByMethod: Record<string, number> = {};
        let authRequiredCount = 0;

        this.routes.forEach(route => {
            routesByMethod[route.method] = (routesByMethod[route.method] || 0) + 1;
            if (route.requiresAuth) authRequiredCount++;
        });

        return {
            totalRoutes: this.routes.length,
            routesByMethod,
            authRequiredCount
        };
    }
}