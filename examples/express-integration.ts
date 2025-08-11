//metasign/examples/express-integration.ts
// Exemple d'intégration du middleware de sécurité dans une application Express
import express, { Request, Response, NextFunction } from 'express';
import {
    createSecurityMiddleware,
    SecurityMiddlewareFactory,
    SecurityServiceProvider,
    SecurityServiceKeys
} from '../src/ai/api/core/middleware';
import { APIContext, NextFunction as SecurityNextFunction } from '../src/ai/api/core/types';

const app = express();
const PORT = process.env.PORT || 3000;

// Fonction pour convertir le middleware de sécurité en middleware Express
const adaptSecurityMiddleware = (securityMiddleware: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Convertir la requête Express en APIContext
            const context: APIContext = {
                startTime: Date.now(),
                request: {
                    method: req.method,
                    path: req.path,
                    params: req.params,
                    query: req.query,
                    headers: req.headers as Record<string, string>,
                    ip: req.ip,
                    userId: (req as any).userId,
                    body: req.body
                },
                response: null,
                errors: [],
                metadata: new Map(),
                security: {},
                requestId: '',
                get duration() {
                    return Date.now() - this.startTime;
                },
                get responseTime() {
                    return this.duration;
                },
                addError(error: Error) {
                    this.errors.push(error);
                },
                setMetadata(key: string, value: any) {
                    this.metadata.set(key, value);
                },
                getMetadata(key: string) {
                    return this.metadata.get(key);
                },
                toJSON() {
                    return {
                        requestId: this.requestId,
                        duration: this.duration,
                        request: this.request,
                        response: this.response,
                        errors: this.errors,
                        metadata: Object.fromEntries(this.metadata)
                    };
                }
            };

            // Exécuter le middleware de sécurité
            await securityMiddleware.process(context, async () => {
                // Stocker le contexte pour pouvoir y accéder plus tard
                (req as any).securityContext = context;

                // Transférer des données du contexte à la requête Express
                if (context.security?.tokenInfo) {
                    (req as any).user = context.security.tokenInfo;
                    (req as any).userId = context.security.tokenInfo.userId;
                }

                // Continuer le traitement Express
                next();
            });

            // Si le middleware de sécurité a généré une réponse, l'envoyer
            if (context.response) {
                // Définir le statut
                res.status(context.response.status);

                // Définir les en-têtes
                Object.entries(context.response.headers).forEach(([key, value]) => {
                    res.setHeader(key, value);
                });

                // Envoyer le corps de la réponse
                res.send(context.response.body);
            }
        } catch (error) {
            // En cas d'erreur non gérée, la transmettre au gestionnaire d'erreurs Express
            next(error);
        }
    };
};

// 1. Utilisation simple avec configuration par défaut
const defaultSecurityMiddleware = createSecurityMiddleware();
app.use(adaptSecurityMiddleware(defaultSecurityMiddleware));

// 2. Utilisation avancée avec une fabrique personnalisée
const createAdvancedSecurityMiddleware = () => {
    // Créer un fournisseur de services personnalisé
    const serviceProvider = new SecurityServiceProvider();

    // Enregistrer des services personnalisés si nécessaire
    // serviceProvider.register(SecurityServiceKeys.JWT_SERVICE, () => customJwtService);

    // Créer une fabrique avec des options personnalisées
    const factory = new SecurityMiddlewareFactory({
        config: {
            enableRateLimiting: true,
            validateTokens: true,
            detailedErrors: process.env.NODE_ENV !== 'production',
            logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
            rateLimiting: {
                defaultLimit: 100,
                windowMs: 60000,
                pathLimits: {
                    '/api/auth': 20,
                    '/api/search': 200
                }
            },
            authentication: {
                publicPaths: ['/api/health', '/api/docs', '/public']
            }
        }
    });

    // Créer une chaîne de middlewares personnalisée
    return factory.createCustomChain({
        chainName: 'ApiSecurityChain',
        enableRateLimiting: true,
        enableAuthentication: true,
        enableSecurityHeaders: true
    });
};

// Utiliser le middleware avancé pour les routes API
const apiRouter = express.Router();
apiRouter.use(adaptSecurityMiddleware(createAdvancedSecurityMiddleware()));

// Définir quelques routes d'exemple
apiRouter.get('/users', (req, res) => {
    res.json({ message: 'List of users', user: (req as any).user });
});

apiRouter.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Utiliser le routeur API
app.use('/api', apiRouter);

// Route publique
app.get('/public', (req, res) => {
    res.json({ message: 'This is a public endpoint' });
});

// Gestionnaire d'erreurs global
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Global error handler:', err);

    // Obtenir le contexte de sécurité s'il existe
    const securityContext = (req as any).securityContext as APIContext | undefined;

    // Si une réponse a déjà été définie dans le contexte, l'utiliser
    if (securityContext?.response) {
        res.status(securityContext.response.status).json(securityContext.response.body);
        return;
    }

    // Sinon, construire une réponse d'erreur par défaut
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const code = err.code || 'INTERNAL_ERROR';

    res.status(statusCode).json({
        error: message,
        code,
        requestId: securityContext?.requestId || 'unknown'
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});