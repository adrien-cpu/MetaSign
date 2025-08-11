# Architecture de Middlewares de Sécurité API

Ce module fournit une architecture modulaire et chainable pour la sécurité des API, conçue selon les principes SOLID. Il protège l'interface externe de votre application contre diverses menaces et attaques.

Ce système fait partie de l'architecture de sécurité globale et complète le gestionnaire de périmètre de sécurité (situé dans `src/ai/api/security/perimeter/`) qui gère la sécurité entre les différentes zones internes.

## Caractéristiques principales

- **Middlewares chainables** : Composez différents middlewares de sécurité selon vos besoins
- **Injection de dépendances** : Minimise les dépendances rigides entre composants
- **Configuration flexible** : Personnalisez le comportement par environnement
- **Type-safe** : Écrit entièrement en TypeScript avec des types stricts
- **Évolutivité** : Facile à étendre avec de nouveaux middlewares
- **Testabilité** : Architecture conçue pour faciliter les tests unitaires et d'intégration

## Installation rapide

Pour créer une chaîne de middlewares de sécurité avec la configuration par défaut :

```typescript
import { createSecurityMiddleware } from '@api/core/middleware';

// Création de la chaîne de middlewares avec configuration par défaut
const securityMiddleware = createSecurityMiddleware();

// Intégration dans votre système
api.use(securityMiddleware);
```

## Middlewares disponibles

Voici les middlewares inclus dans l'architecture :

### RequestIdMiddleware

Assure qu'un identifiant unique est attribué à chaque requête.

```typescript
const middleware = new RequestIdMiddleware();
```

### RateLimitingMiddleware

Limite le nombre de requêtes qu'un client peut effectuer dans un intervalle de temps donné.

```typescript
const middleware = new RateLimitingMiddleware(serviceProvider, {
  defaultLimit: 100,  // Limite par défaut (requêtes par fenêtre)
  windowMs: 60000,    // Fenêtre de temps (1 minute)
  pathLimits: {       // Limites spécifiques aux chemins
    '/api/auth': 20,
    '/api/search': 200
  }
});
```

### AuthenticationMiddleware

Vérifie les tokens JWT et gère l'authentification des requêtes.

```typescript
const middleware = new AuthenticationMiddleware(serviceProvider, {
  publicPaths: ['/api/health', '/api/docs', '/public/*'] // Chemins publics
});
```

### SecurityHeadersMiddleware

Ajoute des en-têtes de sécurité aux réponses HTTP.

```typescript
const middleware = new SecurityHeadersMiddleware({
  hsts: {
    enabled: true,
    maxAge: 31536000,        // 1 an
    includeSubDomains: true,
    preload: true
  },
  csp: {
    enabled: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'object-src': ["'none'"]
    },
    reportOnly: false
  },
  noSniff: true,
  frameOptions: 'DENY',
  xssProtection: true,
  referrerPolicy: 'strict-origin-when-cross-origin'
});
```

### ErrorHandlerMiddleware

Gère les erreurs de sécurité de manière uniforme et sécurisée.

```typescript
const middleware = new ErrorHandlerMiddleware(serviceProvider, {
  includeErrorDetails: false, // Masquer les détails en production
  includeStackTrace: false,   // Masquer la pile d'appels
  defaultStatusCode: 500,     // Code HTTP par défaut
  defaultErrorMessage: 'An unexpected error occurred'
});
```

## Personnalisation avancée

### Utilisation de la fabrique de middlewares

```typescript
import { 
  SecurityMiddlewareFactory,
  SecurityServiceProvider,
  SecurityServiceKeys 
} from '@api/core/middleware';

// Créer un fournisseur de services personnalisé
const serviceProvider = new SecurityServiceProvider();

// Enregistrer un service personnalisé (facultatif)
serviceProvider.register(SecurityServiceKeys.JWT_SERVICE, () => customJwtService);

// Créer une fabrique avec des options personnalisées
const factory = new SecurityMiddlewareFactory({
  config: {
    enableRateLimiting: true,
    validateTokens: true,
    detailedErrors: process.env.NODE_ENV !== 'production',
    rateLimiting: {
      defaultLimit: 100,
      windowMs: 60000, // 1 minute
      pathLimits: {
        '/api/auth': 20,   // Limite plus stricte pour auth
        '/api/search': 200 // Limite plus élevée pour la recherche
      }
    },
    authentication: {
      publicPaths: ['/api/health', '/api/docs'] // Chemins publics
    }
  }
});

// Créer une chaîne de middlewares personnalisée
const securityMiddleware = factory.createCustomChain({
  chainName: 'ApiSecurityChain',
  enableRateLimiting: true,
  enableAuthentication: true,
  enableSecurityHeaders: true
});
```

### Création d'une chaîne personnalisée

```typescript
import { 
  SecurityMiddlewareChain,
  RequestIdMiddleware,
  RateLimitingMiddleware,
  AuthenticationMiddleware
} from '@api/core/middleware';

// Créer une chaîne de middlewares
const chain = new SecurityMiddlewareChain()
  .use(new RequestIdMiddleware())
  .useIf(config.enableRateLimiting, new RateLimitingMiddleware(serviceProvider))
  .useIf(config.enableAuthentication, new AuthenticationMiddleware(serviceProvider, {
    publicPaths: ['/api/health', '/api/docs']
  }));

// Utiliser la chaîne
api.use(chain);
```

## Extension de l'architecture

L'architecture est conçue pour être facilement extensible. Voici comment créer vos propres middlewares :

### Création d'un middleware personnalisé

```typescript
import { IMiddleware, NextFunction } from '@api/core/middleware';
import { APIContext } from '@api/core/types';
import { Logger } from '@api/common/monitoring/LogService';

export class CustomMiddleware implements IMiddleware {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger('CustomMiddleware');
  }

  public async process(context: APIContext, next: NextFunction): Promise<void> {
    try {
      // Traitement avant l'appel au middleware suivant
      this.logger.debug('Processing request', { path: context.request.path });

      // Personnaliser le contexte si nécessaire
      if (!context.security) {
        context.security = {};
      }
      context.security.customData = { someKey: 'value' };

      // Appeler le middleware suivant
      await next();

      // Traitement après l'appel au middleware suivant
      if (context.response) {
        // Personnaliser la réponse si nécessaire
        context.response.headers['X-Custom-Header'] = 'CustomValue';
      }
    } catch (error) {
      // Gérer les erreurs si nécessaire
      this.logger.error('Error in custom middleware', error);
      throw error; // Propager l'erreur
    }
  }
}
```

## Tests

L'architecture inclut des fonctionnalités spéciales pour faciliter les tests :

```typescript
import { createSecurityMiddleware } from '@api/core/middleware';

// Utiliser des mocks pour les tests
const securityMiddleware = createSecurityMiddleware({ useMocks: true });

// Les mocks retournent des valeurs prédéfinies sans dépendances externes
```

## Intégration avec les frameworks web

### Express

```typescript
import express from 'express';
import { createSecurityMiddleware } from '@api/core/middleware';
import { adaptToExpress } from './adapters/express';

const app = express();
const securityMiddleware = createSecurityMiddleware();

// Adapter le middleware de sécurité à Express
app.use(adaptToExpress(securityMiddleware));
```

### Fastify

```typescript
import fastify from 'fastify';
import { createSecurityMiddleware } from '@api/core/middleware';
import { adaptToFastify } from './adapters/fastify';

const app = fastify();
const securityMiddleware = createSecurityMiddleware();

// Adapter le middleware de sécurité à Fastify
app.addHook('onRequest', adaptToFastify(securityMiddleware));
```

## Bonnes pratiques

1. **Positionnement des middlewares** : Le middleware de gestion des erreurs doit être le premier dans la chaîne pour intercepter toutes les erreurs.

2. **Configuration par environnement** : Utilisez des configurations différentes selon l'environnement :
   - Développement : Moins restrictif avec des erreurs détaillées
   - Test : Configuration similaire à la production mais avec plus de détails
   - Production : Strict avec messages d'erreur génériques

3. **Journalisation** : Configurez correctement les niveaux de journalisation selon l'environnement.

4. **Middlewares conditionnels** : Utilisez `.useIf()` pour activer/désactiver des middlewares selon le contexte.

5. **Validation des entrées** : Assurez-vous que toutes les entrées sont validées avant traitement.

## Intégration avec le gestionnaire de périmètre de sécurité

Pour une sécurité complète, ce système devrait être utilisé conjointement avec le gestionnaire de périmètre de sécurité (`src/ai/api/security/perimeter/`). Voir la [documentation globale de sécurité](../../../../security/README.md) pour plus de détails sur l'intégration.

## Dépannage

### Problèmes courants

#### Erreur "Token validation failed"

Vérifiez que le secret JWT configuré correspond à celui utilisé pour générer les tokens.

#### Erreur "Rate limit exceeded"

Le client a dépassé sa limite de requêtes. Vérifiez les paramètres de limitation dans la configuration.

#### Les en-têtes de sécurité ne sont pas appliqués

Assurez-vous que le middleware SecurityHeadersMiddleware est correctement inclus dans la chaîne.

### Journalisation pour le dépannage

Activez la journalisation détaillée pour identifier les problèmes :

```typescript
const factory = new SecurityMiddlewareFactory({
  config: {
    logLevel: 'debug'
  }
});
```

## Structure des fichiers

```
src/ai/api/core/middleware/
│
├── SecurityMiddlewareChain.ts      // Chaîne de middlewares principale
├── SecurityMiddlewareFactory.ts    // Fabrique de middlewares
├── index.ts                        // Point d'entrée du module
│
├── config/                         // Configuration
│   └── SecurityConfig.ts           // Configuration par environnement
│
├── di/                             // Injection de dépendances
│   ├── SecurityServiceProvider.ts  // Fournisseur de services
│   └── types.ts                    // Types pour l'injection
│
├── middlewares/                    // Middlewares spécifiques
│   ├── RequestIdMiddleware.ts      // Middleware d'ID de requête
│   ├── RateLimitingMiddleware.ts   // Middleware de limitation de débit
│   ├── AuthenticationMiddleware.ts // Middleware d'authentification
│   ├── SecurityHeadersMiddleware.ts // Middleware d'en-têtes de sécurité
│   └── ErrorHandlerMiddleware.ts   // Middleware de gestion d'erreurs
│
├── types/                          // Types et interfaces
│   └── middleware.types.ts         // Types des middlewares
│
├── adapters/                       // Adaptateurs pour frameworks
│   ├── express.ts                  // Adaptateur pour Express
│   └── fastify.ts                  // Adaptateur pour Fastify
│
└── __tests__/                      // Tests unitaires
    ├── SecurityMiddlewareChain.test.ts
    ├── RateLimitingMiddleware.test.ts
    └── AuthenticationMiddleware.test.ts
```
