# Architecture de Middlewares de Sécurité API

Ce module fournit une architecture modulaire et chainable pour la sécurité des API, conçue selon les principes SOLID.Il protège l'interface externe de votre application contre diverses menaces et attaques.

Ce système fait partie de l'architecture de sécurité globale et complète le gestionnaire de périmètre de sécurité (situé dans `src/ai/api/security/perimeter/`) qui gère la sécurité entre les différentes zones internes.

## Caractéristiques principales

    - ** Middlewares chainables ** : Composez différents middlewares de sécurité selon vos besoins
        - ** Injection de dépendances ** : Minimise les dépendances rigides entre composants
            - ** Configuration flexible ** : Personnalisez le comportement par environnement
                - ** Type - safe ** : Écrit entièrement en TypeScript avec des types stricts
                    - ** Performance optimisée ** : Middlewares conçus pour un impact minimal sur la latence
                        - ** Évolutivité ** : Facile à étendre avec de nouveaux middlewares
                            - ** Testabilité ** : Architecture conçue pour faciliter les tests unitaires et d'intégration

## Architecture

L'architecture s'articule autour de plusieurs composants clés:

- ** SecurityMiddlewareChain ** : Permet de chaîner plusieurs middlewares ensemble
    - ** SecurityMiddlewareFactory ** : Crée des middlewares ou des chaînes précomposées
        - ** Middlewares spécialisés ** : Chaque middleware a une responsabilité unique

## Installation rapide

Pour créer une chaîne de middlewares de sécurité avec la configuration par défaut:

```typescript
import { createSecurityMiddleware } from '@api/core/middleware';

// Création de la chaîne de middlewares avec configuration par défaut
const securityMiddleware = createSecurityMiddleware();

// Intégration dans votre système
api.use(securityMiddleware);
```

## Middlewares disponibles

### Sécurité de base

#### RequestIdMiddleware

Assure qu'un identifiant unique est attribué à chaque requête.

    ```typescript
const middleware = new RequestIdMiddleware();
```

#### RateLimitingMiddleware

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

#### AuthenticationMiddleware

Vérifie les tokens JWT et gère l'authentification des requêtes.

    ```typescript
const middleware = new AuthenticationMiddleware(serviceProvider, {
  publicPaths: ['/api/health', '/api/docs', '/public/*'] // Chemins publics
});
```

#### SecurityHeadersMiddleware

Ajoute des en - têtes de sécurité aux réponses HTTP.

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

#### ErrorHandlerMiddleware

Gère les erreurs de sécurité de manière uniforme et sécurisée.

```typescript
const middleware = new ErrorHandlerMiddleware(serviceProvider, {
  includeErrorDetails: false, // Masquer les détails en production
  includeStackTrace: false,   // Masquer la pile d'appels
  defaultStatusCode: 500,     // Code HTTP par défaut
  defaultErrorMessage: 'An unexpected error occurred'
});
```

### Sécurité avancée

#### IntrusionDetectionMiddleware

Détecte les tentatives d'intrusion et les attaques potentielles.

    ```typescript
const middleware = new IntrusionDetectionMiddleware(serviceProvider, {
  blockOnLowThreat: false,  // Ne pas bloquer pour les menaces de faible niveau
  logOnly: false,          // Bloquer les requêtes (pas seulement journaliser)
  excludedPaths: ['/health', '/metrics']  // Chemins à exclure
});
```

#### BehaviorAnalysisMiddleware

Analyse le comportement des utilisateurs pour détecter des anomalies.

```typescript
const middleware = new BehaviorAnalysisMiddleware(serviceProvider, {
  anomalyThreshold: 0.8,  // Score d'anomalie à partir duquel agir
  blockAnomalous: true,   // Bloquer les comportements anormaux
  logOnly: false          // Bloquer les requêtes (pas seulement journaliser)
});
```

#### ComplianceValidationMiddleware

Vérifie la conformité aux réglementations(RGPD, CCPA, etc.).

```typescript
const middleware = new ComplianceValidationMiddleware(serviceProvider, {
  standards: ['gdpr', 'ccpa'],  // Standards à valider
  enforceCompliance: true,      // Appliquer la conformité
  logOnly: false                // Bloquer les requêtes non conformes
});
```

#### DataSanitizationMiddleware

Nettoie les données entrantes pour prévenir les injections et XSS.

```typescript
const middleware = new DataSanitizationMiddleware({
  html: {
    enabled: true,
    allowedTags: ['b', 'i', 'em', 'strong']
  },
  sql: {
    enabled: true,
    mode: 'escape'
  },
  xss: {
    enabled: true,
    mode: 'escape'
  }
});
```

#### EncryptionMiddleware

Chiffre et déchiffre les données sensibles automatiquement.

```typescript
const middleware = new EncryptionMiddleware(serviceProvider, {
  encryptedResponseFields: ['creditCard', 'personalData'],  // Champs à chiffrer dans la réponse
  encryptedRequestFields: ['sensitiveData'],               // Champs à déchiffrer dans la requête
  enableLogging: true,                                     // Journaliser les opérations
  throwOnError: true                                       // Lancer une erreur en cas d'échec
});
```

#### SecurityAuditMiddleware

Enregistre les événements de sécurité pour audit et conformité.

```typescript
const middleware = new SecurityAuditMiddleware(serviceProvider, {
  detailLevel: 'detailed',  // Niveau de détail des journaux
  events: ['authentication', 'authorization', 'intrusion'],  // Événements à auditer
  storage: 'database'       // Où stocker les journaux
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
    enableIntrusionDetection: true,  // Activer la détection d'intrusion
    enableDataSanitization: true,    // Activer l'assainissement des données
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
  enableSecurityHeaders: true,
  enableIntrusionDetection: true
});
```

### Création d'une chaîne personnalisée

    ```typescript
import { 
  SecurityMiddlewareChain,
  RequestIdMiddleware,
  RateLimitingMiddleware,
  AuthenticationMiddleware,
  IntrusionDetectionMiddleware
} from '@api/core/middleware';

// Créer une chaîne de middlewares
const chain = new SecurityMiddlewareChain()
  .use(new RequestIdMiddleware())
  .useIf(config.enableRateLimiting, new RateLimitingMiddleware(serviceProvider))
  .useIf(config.enableAuthentication, new AuthenticationMiddleware(serviceProvider, {
    publicPaths: ['/api/health', '/api/docs']
  }))
  .useIf(config.enableIntrusionDetection, new IntrusionDetectionMiddleware(serviceProvider));

// Utiliser la chaîne
api.use(chain);
```

## Utilitaires

### Validation des requêtes

    ```typescript
import { validateRequiredHeaders, validateRequestBody } from '@api/core/middleware/utils/validation-helpers';

// Valider les en-têtes requis
const { isValid, errors } = validateRequiredHeaders(context, 
  ['content-type', 'authorization'], 
  { strictMode: true }
);

// Valider le corps de la requête
const schema = {
  username: 'string',
  email: 'string',
  age: 'number'
};

const { isValid, errors, validatedBody } = validateRequestBody(context.request.body, schema, {
  strictMode: true,
  throwOnError: false
});
```

### Journalisation de sécurité

    ```typescript
import { SecurityLogger, SecurityLogLevel } from '@api/core/middleware/utils/security-logger';

// Créer un logger de sécurité
const logger = new SecurityLogger('authentication', {
  includeTimestamp: true,
  includeStack: false
});

// Journaliser un événement de sécurité
logger.warning('Authentication failed', {
  userId: 'user123',
  reason: 'Invalid token',
  ip: '192.168.1.1'
}, {
  correlationId: 'req-123',
  tags: ['auth', 'failed']
});
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

### Mocks disponibles pour tests

    ```typescript
import { 
  MockIntrusionDetectionSystem,
  MockBehaviorAnalyzer,
  MockComplianceValidator
} from '@api/core/middleware/mocks';

// Configurer un mock pour la détection d'intrusions
const mockIDS = new MockIntrusionDetectionSystem({
  anomaliesDetected: true,
  threatLevel: ThreatLevel.MEDIUM
});

// Injecter le mock dans le service provider
serviceProvider.register(
  SecurityServiceKeys.INTRUSION_DETECTION_SYSTEM, 
  () => mockIDS
);
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

1. ** Positionnement des middlewares ** : Le middleware de gestion des erreurs doit être le premier dans la chaîne pour intercepter toutes les erreurs.

2. ** Configuration par environnement ** : Utilisez des configurations différentes selon l'environnement :
    - Développement : Moins restrictif avec des erreurs détaillées
        - Test : Configuration similaire à la production mais avec plus de détails
            - Production : Strict avec messages d'erreur génériques

3. ** Journalisation ** : Configurez correctement les niveaux de journalisation selon l'environnement.

4. ** Middlewares conditionnels ** : Utilisez `.useIf()` pour activer / désactiver des middlewares selon le contexte.

5. ** Validation des entrées ** : Assurez - vous que toutes les entrées sont validées avant traitement.

## Intégration avec le gestionnaire de périmètre de sécurité

Pour une sécurité complète, ce système devrait être utilisé conjointement avec le gestionnaire de périmètre de sécurité(`src/ai/api/security/perimeter/`).Voir la[documentation globale de sécurité](../../../../ security / README.md) pour plus de détails sur l'intégration.

## Dépannage

### Problèmes courants

#### Erreur "Token validation failed"

Vérifiez que le secret JWT configuré correspond à celui utilisé pour générer les tokens.

#### Erreur "Rate limit exceeded"

Le client a dépassé sa limite de requêtes.Vérifiez les paramètres de limitation dans la configuration.

#### Les en - têtes de sécurité ne sont pas appliqués

Assurez - vous que le middleware SecurityHeadersMiddleware est correctement inclus dans la chaîne.

#### Erreur "Security intrusion detected"

Une tentative d'intrusion a été détectée. Vérifiez les journaux pour plus de détails et examinez les paramètres de détection.

#### Problèmes de performance

Si vous constatez des problèmes de latence, vérifiez les configurations des middlewares gourmands en ressources(IntrusionDetection, BehaviorAnalysis) et envisagez d'ajuster leur configuration ou de les désactiver temporairement.

### Journalisation pour le dépannage

Activez la journalisation détaillée pour identifier les problèmes:

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
│   ├── ErrorHandlerMiddleware.ts   // Middleware de gestion d'erreurs
│   ├── IntrusionDetectionMiddleware.ts // Détection d'intrusions
│   ├── BehaviorAnalysisMiddleware.ts  // Analyse comportementale
│   ├── ComplianceValidationMiddleware.ts // Validation de conformité
│   ├── DataSanitizationMiddleware.ts // Assainissement des données
│   ├── EncryptionMiddleware.ts      // Chiffrement des données
│   └── SecurityAuditMiddleware.ts   // Audit de sécurité
│
├── utils/                          // Utilitaires
│   ├── validation-helpers.ts       // Aides à la validation
│   ├── security-logger.ts          // Logger de sécurité
│   └── performance-metrics.ts      // Métriques de performance
│
├── mocks/                          // Mocks pour tests
│   ├── MockIntrusionDetectionSystem.ts // Mock pour tests d'intrusion
│   ├── MockBehaviorAnalyzer.ts      // Mock pour analyse comportementale
│   └── MockComplianceValidator.ts   // Mock pour validation de conformité
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
    ├── AuthenticationMiddleware.test.ts
    ├── IntrusionDetectionMiddleware.test.ts
    └── integration.test.ts         // Tests d'intégration
```

## Migration depuis l'ancienne version

Si vous utilisez l'ancienne version du middleware de sécurité, consultez notre [guide de migration](./MIGRATION.md) pour une transition en douceur.

## Configuration

Consultez notre documentation détaillée pour toutes les options de configuration disponibles.Chaque middleware peut être configuré individuellement pour répondre à vos besoins spécifiques.

# Architecture de Middlewares de Sécurité API(suite)

## Exemples d'utilisation

### Scénario 1: Application API standard

    ```typescript
import { createSecurityMiddleware } from '@api/core/middleware';
import express from 'express';

const app = express();

// Configuration de base pour une API standard
const securityMiddleware = createSecurityMiddleware({
  config: {
    enableRateLimiting: true,
    validateTokens: true,
    enableSecurityHeaders: true,
    enableDataSanitization: true
  }
});

// Appliquer le middleware de sécurité
app.use(securityMiddleware);

// Routes de l'application
app.get('/api/users', (req, res) => {
  // Le middleware a déjà vérifié l'authentification et assaini les données
  res.json({ users: [] });
});

app.listen(3000);
```

### Scénario 2: API hautement sécurisée

    ```typescript
import { SecurityMiddlewareFactory, SecurityServiceProvider } from '@api/core/middleware';
import express from 'express';

const app = express();
const serviceProvider = new SecurityServiceProvider();

// Configuration avancée pour une API hautement sécurisée
const factory = new SecurityMiddlewareFactory({
  config: {
    // Activer toutes les protections
    enableRateLimiting: true,
    validateTokens: true,
    enableSecurityHeaders: true,
    enableIntrusionDetection: true,
    enableBehaviorAnalysis: true,
    enableDataSanitization: true,
    enableEncryption: true,
    enableCompliance: true,
    enableSecurityAudit: true,
    
    // Configuration spécifique pour la limitation de débit
    rateLimiting: {
      defaultLimit: 50,        // Limite stricte
      windowMs: 60000,         // 1 minute
      skipTrustedIPs: false    // Ne pas sauter la vérification pour les IPs de confiance
    },
    
    // Configuration pour la détection d'intrusion
    intrusionDetection: {
      enabled: true,
      blockThreshold: 'low',   // Bloquer même les menaces de faible niveau
      logOnly: false
    }
  }
});

// Créer la chaîne complète
const securityMiddleware = factory.createFullChain();

// Appliquer le middleware de sécurité
app.use(securityMiddleware);

// Routes de l'application
app.listen(3000);
```

### Scénario 3: API avec zones de sécurité différentes

    ```typescript
import { 
  SecurityMiddlewareFactory, 
  SecurityServiceProvider,
  SecurityHeadersMiddleware,
  RateLimitingMiddleware,
  AuthenticationMiddleware
} from '@api/core/middleware';
import express from 'express';

const app = express();
const serviceProvider = new SecurityServiceProvider();
const factory = new SecurityMiddlewareFactory({ serviceProvider });

// Middleware de base pour toutes les routes
const baseMiddleware = factory.createCustomChain({
  enableSecurityHeaders: true,
  enableRateLimiting: true
});

// Middleware pour les routes authentifiées
const authMiddleware = factory.createCustomChain({
  enableAuthentication: true,
  enableDataSanitization: true
});

// Middleware pour les routes d'administration
const adminMiddleware = factory.createCustomChain({
  enableIntrusionDetection: true,
  enableBehaviorAnalysis: true,
  enableSecurityAudit: true
});

// Appliquer les middlewares aux différentes zones
app.use(baseMiddleware);                     // Pour toutes les routes
app.use('/api/secure', authMiddleware);      // Pour les routes sécurisées
app.use('/api/admin', adminMiddleware);      // Pour les routes d'administration

app.listen(3000);
```

## Guide de déploiement

### Préparation

Avant de déployer cette architecture de sécurité en production, assurez - vous de:

1. ** Effectuer des tests approfondis **: Vérifiez que tous les middlewares fonctionnent correctement dans votre environnement spécifique
2. ** Configurer correctement par environnement **: Utilisez des configurations distinctes pour le développement, les tests, la mise en scène et la production
3. ** Mettre en place une surveillance **: Configurez des alertes pour les événements de sécurité critiques

### Déploiement graduel

Pour une transition en douceur, suivez cette approche progressive:

1. ** Phase 1: Middlewares de base **
    - Déployez d'abord les middlewares essentiels: RequestId, SecurityHeaders, ErrorHandler
        - Surveillez pour détecter tout impact sur les performances ou la stabilité

2. ** Phase 2: Authentification et limitation de débit **
    - Ajoutez les middlewares Authentication et RateLimiting
        - Commencez avec des paramètres permissifs, puis resserrez progressivement

3. ** Phase 3: Protection avancée **
    - Ajoutez les middlewares de sécurité avancés un par un
        - Commencez en mode "log only" avant d'activer le blocage

### Configuration de production recommandée

    ```typescript
const prodConfig = {
  enableRateLimiting: true,
  validateTokens: true,
  enableSecurityHeaders: true,
  enableIntrusionDetection: true,
  enableDataSanitization: true,
  enableSecurityAudit: true,
  
  // Désactiver les détails d'erreur en production
  detailedErrors: false,
  
  // Configuration stricte pour la limitation de débit
  rateLimiting: {
    defaultLimit: 60,
    windowMs: 60000
  },
  
  // Configuration de détection d'intrusion
  intrusionDetection: {
    enabled: true,
    blockThreshold: 'medium',
    logOnly: false,
    cacheTtl: 300000 // 5 minutes
  },
  
  // Configuration d'audit de sécurité
  securityAudit: {
    enabled: true,
    detailLevel: 'full',
    events: ['authentication', 'authorization', 'intrusion', 'data-access'],
    storage: 'database'
  }
};
```

## Considérations de performance

### Impact sur la latence

Chaque middleware ajoute un certain temps de traitement à la requête.Voici une estimation approximative de l'impact relatif:

    | Middleware | Impact sur la latence | Notes |
| ------------| ----------------------| -------|
| RequestId | Minimal(<1ms) | Simple génération d'ID |
    | SecurityHeaders | Minimal(<1ms) | Juste ajout d'en-têtes |
        | RateLimiting | Faible(1 - 5ms) | Dépend du stockage utilisé |
| Authentication | Moyen(5 - 20ms) | Dépend de la validation JWT |
| DataSanitization | Moyen(5 - 30ms) | Dépend de la taille des données |
| IntrusionDetection | Élevé(10 - 50ms) | Analyse complexe de la requête |
| BehaviorAnalysis | Très élevé(20 - 100ms) | Analyse comportementale avancée |
| EncryptionMiddleware | Élevé(10 - 40ms) | Dépend de la quantité de données |

### Optimisation

Pour minimiser l'impact sur les performances:

1. ** Utilisez uniquement les middlewares nécessaires **: Activez seulement les fonctionnalités dont vous avez besoin
2. ** Mettez en cache les résultats **: Utilisez le caching pour les opérations coûteuses
3. ** Configurez des exclusions **: Excluez certains chemins des vérifications intensives
4. ** Surveillez et ajustez **: Utilisez des métriques de performance pour identifier les goulots d'étranglement

    ```typescript
// Exemple d'optimisation pour les routes critiques en termes de performance
const optimizedMiddleware = factory.createCustomChain({
  enableRateLimiting: true,
  enableSecurityHeaders: true,
  rateLimiting: {
    // Augmenter les limites pour les routes critiques
    pathLimits: {
      '/api/critical-route': 500
    }
  },
  // Exclure certaines routes des vérifications intensives
  intrusionDetection: {
    excludedPaths: ['/api/critical-route', '/api/high-performance']
  }
});
```

## Matrice de compatibilité

### Versions TypeScript supportées

    | Version TypeScript | Compatibilité |
| -------------------| --------------|
| 4.7 et supérieur | Complète |
| 4.5 - 4.6 | Bonne |
| 4.0 - 4.4 | Partielle |
| Inférieure à 4.0 | Non supportée |

### Frameworks supportés

    | Framework | Adaptateur disponible | Notes |
| -----------| ----------------------| -------|
| Express | Oui | Support complet |
| Fastify | Oui | Support complet |
| Koa | Oui | Support complet |
| NestJS | Oui | Via l'adaptateur Express |
    | Hapi | Non | Planifié pour une version future |

### Environnements d'exécution

    | Environnement | Compatibilité |
| --------------| --------------|
| Node.js 14 + | Complète |
| Node.js 12 | Partielle |
| Deno | Non supporté |
| Navigateur | Non applicable |

## Foire aux questions(FAQ)

### Questions générales

#### Est - ce que cette architecture ajoute un overhead significatif ?
    L'impact sur les performances dépend des middlewares activés. Avec une configuration de base, l'overhead est minime(généralement < 10ms).Une configuration complète peut ajouter 30 - 100ms selon la complexité.

#### Comment gérer l'authentification avec des services externes?
Vous pouvez étendre `AuthenticationMiddleware` ou créer un middleware personnalisé qui s'intègre avec votre fournisseur d'identité.

#### Comment surveiller l'efficacité des protections de sécurité?
Utilisez `SecurityAuditMiddleware` pour enregistrer les événements de sécurité, puis analysez ces journaux pour identifier les tendances et les menaces potentielles.

### Questions techniques

#### Pourquoi utiliser une chaîne de middlewares plutôt qu'un middleware monolithique?
L'approche modulaire offre une meilleure séparation des préoccupations, facilite les tests et permet une configuration plus précise.

#### Comment fonctionne la détection d'intrusion?
`IntrusionDetectionMiddleware` analyse les requêtes pour détecter des modèles suspects(injections SQL, XSS, etc.) en utilisant une combinaison de règles prédéfinies et d'analyses heuristiques.

#### Comment étendre la fonctionnalité de base ?
    Implémentez l'interface `IMiddleware` pour créer vos propres middlewares, puis intégrez-les dans la chaîne existante.

## Contribution au projet

Les contributions sont les bienvenues! Voici comment contribuer:

1. ** Création d'issues**: Utilisez GitHub Issues pour signaler des bugs ou proposer des améliorations
2. ** Pull requests **: Soumettez des pull requests avec des corrections ou de nouvelles fonctionnalités
3. ** Tests **: Assurez - vous que vos contributions incluent des tests appropriés
4. ** Documentation **: Mettez à jour la documentation pour refléter vos changements

### Guide de style

    - Suivez les principes SOLID
        - Utilisez des types stricts pour tout
            - Évitez les dépendances externes sauf si nécessaire
                - Documentez chaque classe et méthode publique

## Ressources supplémentaires

    - [Documentation de l'API](./API.md)
        - [Guide de migration](./ MIGRATION.md)
        -[Exemples d'utilisation](./EXAMPLES.md)
            - [Guide de dépannage avancé](./ TROUBLESHOOTING.md)

## Licence

Ce projet est sous licence MIT.

---

            Cette documentation complète devrait vous permettre d'utiliser efficacement l'architecture de middlewares de sécurité API.Si vous avez des questions supplémentaires, n'hésitez pas à consulter les ressources additionnelles ou à ouvrir une issue sur notre référentiel GitHub.

            # Architecture de Middlewares de Sécurité API(Guide avancé)

## Scénarios de sécurité et solutions

### Prévention des attaques courantes

#### Protection contre les attaques par injection

Les attaques par injection(SQL, NoSQL, commande) sont parmi les menaces les plus courantes.Notre architecture fournit plusieurs couches de défense:

            ```typescript
// Configuration pour prévenir les injections
const antiInjectionMiddleware = factory.createCustomChain({
  enableDataSanitization: true,
  dataSanitization: {
    sql: {
      enabled: true,
      mode: 'escape'
    },
    xss: {
      enabled: true,
      mode: 'escape'
    },
    command: {
      enabled: true,
      allowedCommands: []
    }
  },
  enableIntrusionDetection: true,
  intrusionDetection: {
    patterns: ['sql_injection', 'nosql_injection', 'command_injection']
  }
});
```

#### Mitigation des attaques par déni de service(DoS)

Le middleware offre plusieurs mécanismes pour limiter l'impact des attaques DoS:

                ```typescript
const dosProtectionMiddleware = factory.createCustomChain({
  enableRateLimiting: true,
  rateLimiting: {
    defaultLimit: 30,
    windowMs: 60000,
    // Stratégie par IP pour limiter les attaques distribuées
    clientIdStrategy: 'ip',
    // Limites spéciales pour les endpoints sensibles
    pathLimits: {
      '/api/auth': 10,
      '/api/search': 20
    }
  },
  // Configuration avancée pour la prévention des abus
  abuseProtection: {
    enabled: true,
    // Ralentir progressivement les réponses après répétition
    slowDown: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      delayAfter: 30,           // Après 30 requêtes
      delayMs: 500              // Ajouter 500ms de délai
    }
  }
});
```

#### Protection contre le vol de session et l'usurpation d'identité

Les middlewares d'authentification et de sécurité fournissent des protections contre ces attaques:

                ```typescript
const sessionProtectionMiddleware = factory.createCustomChain({
  enableAuthentication: true,
  authentication: {
    validateExpiration: true,
    validateIssuer: true,
    validateFingerprint: true, // Valider l'empreinte du navigateur
    csrfProtection: true       // Protection CSRF
  },
  enableSecurityHeaders: true,
  securityHeaders: {
    // Empêcher le clickjacking
    frameOptions: 'DENY',
    // Strict CORS policy
    cors: {
      enabled: true,
      allowedOrigins: ['https://yourdomain.com'],
      allowCredentials: true
    }
  }
});
```

### Intégration avec le périmètre de sécurité interne

Pour une protection complète, le middleware de sécurité API s'intègre avec le gestionnaire de périmètre de sécurité interne:

                ```typescript
import { createSecurityMiddleware } from '@api/core/middleware';
import { SecurityPerimeterManager } from '@security/perimeter/SecurityPerimeterManager';
import express from 'express';

const app = express();
const securityMiddleware = createSecurityMiddleware();
const perimeterManager = new SecurityPerimeterManager(/* ... */);

// Middleware API pour la sécurité externe
app.use(securityMiddleware);

// Middleware pour la vérification du périmètre interne
app.use(async (req, res, next) => {
  try {
    const accessRequest = {
      source: { zone: 'api', endpoint: req.path },
      target: determineTargetZone(req.path),
      context: {
        userId: req.user?.id,
        roles: req.user?.roles || [],
        ip: req.ip,
        operation: req.method
      }
    };
    
    const result = await perimeterManager.validateAccess(accessRequest);
    
    if (result.allowed) {
      return next();
    } else {
      return res.status(403).json({ error: 'Access denied', reason: result.reason });
    }
  } catch (error) {
    next(error);
  }
});
```

## Personnalisations spécifiques par industrie

### Finance et services bancaires

Les applications financières nécessitent des protections renforcées:

            ```typescript
const financialServicesMiddleware = factory.createCustomChain({
  enableRateLimiting: true,
  enableAuthentication: true,
  enableIntrusionDetection: true,
  enableDataSanitization: true,
  enableEncryption: true,
  enableSecurityAudit: true,
  // Conformité PCI DSS et autres réglementations financières
  enableCompliance: true,
  compliance: {
    standards: ['pci_dss', 'soc2', 'finra'],
    enforceCompliance: true
  },
  // Encryption des données sensibles
  encryption: {
    encryptedResponseFields: [
      'accountNumber', 'cardNumber', 'ssn', 'balance', 
      'transactions.amount', 'personalInfo'
    ],
    keyId: 'financial-data-key'
  },
  // Audit détaillé pour la conformité
  securityAudit: {
    detailLevel: 'full',
    retentionPeriod: 365, // 1 an (obligation réglementaire)
    events: ['all'],
    immutableLogs: true  // Logs inaltérables pour l'audit
  }
});
```

### Santé(HIPAA)

Pour les applications médicales soumises à HIPAA:

            ```typescript
const healthcareMiddleware = factory.createCustomChain({
  // Protection de base
  enableRateLimiting: true,
  enableAuthentication: true,
  enableDataSanitization: true,
  // Protection des données de santé
  enableEncryption: true,
  encryption: {
    encryptedResponseFields: [
      'patientData', 'diagnosis', 'treatment', 
      'medicalHistory', 'prescriptions'
    ]
  },
  // Conformité HIPAA
  enableCompliance: true,
  compliance: {
    standards: ['hipaa'],
    enforceCompliance: true,
    // Vérifier le consentement du patient
    validateConsent: true
  },
  // Audit complet obligatoire
  enableSecurityAudit: true,
  securityAudit: {
    events: ['authentication', 'data_access', 'phi_access'],
    detailLevel: 'full',
    accessTracking: {
      trackPHIAccess: true,
      requireReason: true
    }
  }
});
```

### E - commerce

Configuration optimisée pour les plateformes de commerce électronique:

            ```typescript
const ecommerceMiddleware = factory.createCustomChain({
  enableRateLimiting: true,
  rateLimiting: {
    // Limites plus élevées pour les API produits
    pathLimits: {
      '/api/products': 500,
      '/api/search': 300,
      // Limites plus strictes pour le checkout
      '/api/checkout': 30,
      '/api/payment': 20
    }
  },
  enableDataSanitization: true,
  // Protection contre la fraude
  enableBehaviorAnalysis: true,
  behaviorAnalysis: {
    anomalyThreshold: 0.8,
    // Profils comportementaux spécifiques à l'e-commerce
    behaviorProfiles: ['shopping', 'checkout', 'account'],
    // Détection de patterns de fraude
    fraudDetection: true
  },
  // Chiffrement des données de paiement
  enableEncryption: true,
  encryption: {
    encryptedResponseFields: ['paymentInfo', 'personalInfo'],
    encryptedRequestFields: ['cardData']
  }
});
```

## Monitoring et observabilité

### Métriques de sécurité

Utilisez le middleware de métriques pour collecter des statistiques sur les événements de sécurité:

            ```typescript
import { SecurityMetricsCollector } from '@api/core/middleware/utils/metrics-collector';

// Créer un collecteur de métriques
const metricsCollector = new SecurityMetricsCollector({
  metricsPrefix: 'security',
  collectInterval: 60000, // 1 minute
  // Exporter les métriques vers différents systèmes
  exporters: ['prometheus', 'datadog']
});

// Enregistrer le collecteur dans le service provider
serviceProvider.register(
  SecurityServiceKeys.METRICS_COLLECTOR,
  () => metricsCollector
);

// Configurer le middleware avec métriques
const monitoredMiddleware = factory.createCustomChain({
  enableRateLimiting: true,
  enableIntrusionDetection: true,
  // Activer le monitoring avancé
  enableMonitoring: true,
  monitoring: {
    collectMetrics: true,
    alertThresholds: {
      // Alerter si plus de 10 tentatives d'intrusion en 5 minutes
      intrusion_attempts: { count: 10, timeWindowMs: 300000 },
      // Alerter si plus de 50 requêtes bloquées en 1 minute
      blocked_requests: { count: 50, timeWindowMs: 60000 }
    },
    // Générer des dashboards automatiques
    dashboards: {
      enabled: true,
      refreshIntervalMs: 10000
    }
  }
});
```

### Métriques disponibles

Les métriques suivantes sont collectées et disponibles:

| Métrique | Description | Dimensions |
| ----------| -------------| -----------|
| `security.requests.total` | Nombre total de requêtes | path, method |
| `security.requests.blocked` | Requêtes bloquées | reason, path |
| `security.ratelimit.exceeded` | Limites de débit dépassées | path, ip |
| `security.auth.failures` | Échecs d'authentification | reason |
            | `security.intrusion.attempts` | Tentatives d'intrusion | type, path |
            | `security.behavior.anomalies` | Anomalies comportementales | userId, type |
| `security.middleware.latency` | Latence ajoutée par middleware | middleware |

### Intégration avec les systèmes SIEM

Le middleware peut s'intégrer avec des systèmes SIEM (Security Information and Event Management):

                ```typescript
const securityMiddleware = factory.createCustomChain({
  enableSecurityAudit: true,
  securityAudit: {
    storage: 'external',
    externalSystem: {
      type: 'siem',
      endpoint: 'https://siem.company.com/ingest',
      format: 'cef', // Common Event Format
      apiKey: process.env.SIEM_API_KEY,
      // Mappage de champs personnalisés
      fieldMapping: {
        userId: 'subject',
        ip: 'src',
        path: 'request',
        statusCode: 'outcome'
      }
    }
  }
});
```

## Architecture de référence

### Exemple d'architecture complète

Voici une architecture de référence pour une application avec sécurité à plusieurs niveaux:

            ```typescript
import express from 'express';
import { 
  SecurityMiddlewareFactory, 
  SecurityServiceProvider 
} from '@api/core/middleware';
import { SecurityPerimeterManager } from '@security/perimeter/SecurityPerimeterManager';

// Application Express
const app = express();

// Injection de dépendances
const serviceProvider = new SecurityServiceProvider();
const factory = new SecurityMiddlewareFactory({ serviceProvider });

// 1. Middleware de sécurité global (pour toutes les routes)
const globalMiddleware = factory.createCustomChain({
  enableSecurityHeaders: true,
  enableRequestId: true,
  enableErrorHandler: true,
  // Configuration des en-têtes de sécurité
  securityHeaders: {
    hsts: { enabled: true, maxAge: 31536000 },
    csp: { enabled: true, directives: { /* ... */ } },
    frameOptions: 'DENY',
    noSniff: true,
    xssProtection: true
  }
});

// 2. Middleware pour les routes publiques
const publicMiddleware = factory.createCustomChain({
  enableRateLimiting: true,
  enableDataSanitization: true,
  // Limites plus strictes pour réduire les attaques DoS
  rateLimiting: {
    defaultLimit: 30,
    windowMs: 60000
  }
});

// 3. Middleware pour les routes authentifiées
const authenticatedMiddleware = factory.createCustomChain({
  enableAuthentication: true,
  enableRateLimiting: true,
  enableIntrusionDetection: true,
  enableSecurityAudit: true,
  // Configuration de l'authentification
  authentication: {
    publicPaths: [],
    validateExpiration: true,
    validateIssuer: true,
    csrfProtection: true
  },
  // Limites plus élevées pour les utilisateurs authentifiés
  rateLimiting: {
    defaultLimit: 100,
    windowMs: 60000
  }
});

// 4. Middleware pour les routes administratives
const adminMiddleware = factory.createCustomChain({
  enableAuthentication: true,
  enableRateLimiting: true,
  enableIntrusionDetection: true,
  enableBehaviorAnalysis: true,
  enableSecurityAudit: true,
  // Niveau d'audit élevé pour les activités d'administration
  securityAudit: {
    detailLevel: 'full',
    events: ['all']
  }
});

// 5. Gestionnaire de périmètre de sécurité (zones internes)
const perimeterManager = new SecurityPerimeterManager(/* ... */);

// Appliquer les middlewares en fonction des routes
app.use(globalMiddleware); // Pour toutes les routes

// Routes publiques
app.use('/api/public', publicMiddleware);

// Routes authentifiées
app.use('/api/user', authenticatedMiddleware);

// Routes administratives
app.use('/api/admin', adminMiddleware);

// Middleware de périmètre pour les routes sensibles
app.use('/api/sensitive', async (req, res, next) => {
  try {
    const accessRequest = {
      source: { zone: 'api', endpoint: req.path },
      target: { zone: 'sensitive', resource: req.path.split('/').pop() },
      context: {
        userId: req.user?.id,
        roles: req.user?.roles || [],
        ip: req.ip,
        operation: req.method
      }
    };
    
    const result = await perimeterManager.validateAccess(accessRequest);
    
    if (result.allowed) {
      return next();
    } else {
      return res.status(403).json({ error: 'Access denied', reason: result.reason });
    }
  } catch (error) {
    next(error);
  }
});

// Démarrer le serveur
app.listen(3000);
```

## Intégration avec le système LSF

### Communication avec les autres composants LSF

Le middleware de sécurité s'intègre avec les autres composants du système LSF:

                ```typescript
import { SystemeControleEthique } from '@ai/ethics/core/SystemeControleEthique';
import { ValidationCollaborative } from '@ai/validation/ValidationCollaborative';
import { SecurityMiddlewareFactory } from '@api/core/middleware';

// Obtenir les instances des systèmes LSF
const ethicsSystem = SystemeControleEthique.getInstance();
const validationSystem = await ValidationCollaborative.create();

// Créer un middleware intégré au système LSF
const factory = new SecurityMiddlewareFactory({
  config: {
    enableEthicsValidation: true,
    enableCollaborativeValidation: true,
    ethicsValidation: {
      validateEthics: true,
      strictMode: false
    },
    collaborativeValidation: {
      validateCriticalOperations: true,
      minimumExpertLevel: 'advanced'
    }
  }
});

// Enregistrer les services LSF
factory.serviceProvider.register('ETHICS_SYSTEM', () => ethicsSystem);
factory.serviceProvider.register('VALIDATION_SYSTEM', () => validationSystem);

// Créer le middleware intégré
const lsfIntegratedMiddleware = factory.createCustomChain({
  enableRateLimiting: true,
  enableAuthentication: true,
  // Activer les intégrations LSF spécifiques
  enableLSFEthicsValidation: true,
  enableLSFCollaborativeValidation: true
});
```

### Protection des opérations LSF sensibles

                ```typescript
// Middleware spécifique pour les opérations LSF sensibles
const lsfSecurityMiddleware = factory.createCustomChain({
  enableAuthentication: true,
  enableSecurityAudit: true,
  // Configuration spécifique pour les opérations LSF
  lsfOperations: {
    // Protection des opérations de modification de signes
    signModification: {
      requireExpertValidation: true,
      minimumExpertCount: 2,
      auditTrail: true
    },
    // Protection des opérations de traduction officielle
    officialTranslation: {
      requireCertification: true,
      doubleValidation: true
    }
  }
});
```

## Roadmap future

Le middleware de sécurité continue d'évoluer. Voici les améliorations planifiées pour les prochaines versions:

### Version 2.0(Q2 2025)

    - ** Machine Learning ** pour la détection d'intrusion adaptative
        - ** Auto - optimisation ** des configurations de sécurité
            - Support pour ** WebAuthn / FIDO2 ** pour l'authentification sans mot de passe
                - ** Intégration avec eBPF ** pour la détection au niveau du noyau
                    - ** SDK client ** pour la communication sécurisée avec l'API

### Version 2.1(Q4 2025)

    - Intégration ** Zero Trust ** complète
        - Support pour ** MFA adaptative ** (basée sur le risque)
- ** Résistance quantique ** (options de cryptographie post - quantique)
- ** Edge Security ** pour le déploiement sur infrastructure edge
    - ** Security Observability Framework ** pour une supervision avancée

## Conclusion

Cette architecture de middlewares de sécurité API fournit une solution complète et flexible pour sécuriser les APIs du système LSF.En adoptant une approche modulaire et configurable, elle permet de personnaliser la sécurité en fonction des besoins spécifiques tout en offrant une protection robuste contre une large gamme de menaces.

En suivant les bonnes pratiques décrites dans cette documentation et en adaptant la configuration à votre environnement, vous pourrez non seulement protéger efficacement vos APIs mais aussi démontrer la conformité avec diverses exigences réglementaires.

La sécurité étant un processus continu plutôt qu'un état, ce middleware est conçu pour évoluer avec les menaces émergentes et les nouvelles exigences de sécurité.

---

    Si vous avez des questions spécifiques ou besoin d'assistance pour l'implémentation, n'hésitez pas à consulter les ressources additionnelles ou à contacter l'équipe de sécurité.La sécurité est l'affaire de tous, et chaque ligne de défense compte.