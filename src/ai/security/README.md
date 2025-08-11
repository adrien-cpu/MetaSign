# src/ai/security/README.md
# Architecture de Sécurité Complète

Ce document présente l'architecture de sécurité globale du système, qui comprend deux composants complémentaires :

1. **Middlewares de Sécurité API** - Protège l'interface externe (couche API)
2. **Gestionnaire de Périmètre de Sécurité** - Gère la sécurité entre les zones internes du système

## Vue d'ensemble

Notre architecture de sécurité adopte une approche en couches :

```
┌────────────────────────────────────────────────────┐
│                                                    │
│          Middlewares de Sécurité API              │
│  (Authentication, RateLimit, Headers, Encryption)  │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│      Gestionnaire de Périmètre de Sécurité        │
│  (Zones, Règles d'accès, Validation éthique)      │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│                 Systèmes Internes                 │
│                                                    │
└────────────────────────────────────────────────────┘
```

Ces deux systèmes travaillent ensemble pour fournir une solution de sécurité complète, où :

- Les **Middlewares de Sécurité API** protègent contre les menaces externes en filtrant et validant les requêtes entrantes
- Le **Gestionnaire de Périmètre de Sécurité** assure que les accès entre différentes zones internes sont contrôlés et conformes aux politiques de sécurité

## 1. Middlewares de Sécurité API

> *Localisation: `src/ai/api/core/middleware/`*

### Caractéristiques principales

- **Middlewares chainables** : Composez différents middlewares de sécurité selon vos besoins
- **Injection de dépendances** : Minimise les dépendances rigides entre composants
- **Configuration flexible** : Personnalisation par environnement (dev, test, prod)
- **Type-safe** : Écrit entièrement en TypeScript avec des types stricts
- **Évolutivité** : Facile à étendre avec de nouveaux middlewares

### Middlewares disponibles

- **RequestIdMiddleware** : Attribue un identifiant unique à chaque requête
- **RateLimitingMiddleware** : Limite le nombre de requêtes par client/endpoint
- **AuthenticationMiddleware** : Vérifie et valide les tokens JWT
- **SecurityHeadersMiddleware** : Ajoute des en-têtes de sécurité aux réponses
- **ErrorHandlerMiddleware** : Gère les erreurs de manière unifiée et sécurisée

### Installation de base

```typescript
import { createSecurityMiddleware } from '@api/core/middleware';

// Création de la chaîne de middlewares avec configuration par défaut
const securityMiddleware = createSecurityMiddleware();

// Intégration dans votre système
api.use(securityMiddleware);
```

### Personnalisation avancée

```typescript
import { 
  SecurityMiddlewareFactory,
  SecurityServiceProvider,
  SecurityServiceKeys 
} from '@api/core/middleware';

// Créer une fabrique avec options personnalisées
const factory = new SecurityMiddlewareFactory({
  config: {
    enableRateLimiting: true,
    validateTokens: true,
    detailedErrors: process.env.NODE_ENV !== 'production',
    rateLimiting: {
      defaultLimit: 100,
      windowMs: 60000, // 1 minute
      pathLimits: {
        '/api/auth': 20   // Limite plus stricte pour auth
      }
    }
  }
});

// Créer une chaîne personnalisée
const securityMiddleware = factory.createCustomChain({
  enableAuthentication: true,
  enableSecurityHeaders: true
});
```

## 2. Gestionnaire de Périmètre de Sécurité

> *Localisation: `src/ai/api/security/perimeter/`*

### Vue d'ensemble

Le `SecurityPerimeterManager` est une solution complète pour gérer la sécurité des accès entre différentes zones du système. Il intègre :

- Gestion de zones de sécurité avec niveaux différents
- Règles d'accès configurables et évaluables dynamiquement
- Validation éthique des accès basée sur le `SystemeControleEthique`
- Validation collaborative impliquant la communauté d'experts
- Détection d'anomalies et d'intrusions
- Surveillance et métriques en temps réel
- Reporting avancé et analyse de sécurité

### Architecture

L'architecture a été optimisée pour réduire la complexité tout en maintenant une excellente séparation des responsabilités :

1. **Module principal** (`SecurityPerimeterManager`)
   - Coordonne tous les aspects de la sécurité du périmètre
   - Fournit une API unifiée pour toutes les opérations

2. **Modules spécialisés**
   - **Gestion des zones** (`ZoneManager`)
   - **Gestion des règles** (`RuleManager`)
   - **Validation avancée** (`PerimeterValidation`)
   - **Surveillance et métriques** (`PerimeterMonitoring`)
   - **Reporting et analyse** (`PerimeterReporting`)

### Initialisation

```typescript
import { SecurityPerimeterManager } from '@security/perimeter/SecurityPerimeterManager';

const perimeterManager = new SecurityPerimeterManager(
  securityAuditor,
  ethicsSystem,
  validationCollaborative,
  metricsCollector,
  anomalyDetector,
  300000,  // 5 minutes de cache
  60000    // 1 minute d'intervalle de monitoring
);
```

### Validation d'accès

```typescript
const accessRequest = {
  source: { zone: 'dmz', endpoint: 'app-server' },
  target: { zone: 'internal', resource: 'customer-database' },
  context: {
    userId: 'john.doe',
    roles: ['analyst'],
    permissions: ['read'],
    deviceType: 'corporate-laptop',
    deviceSecurityLevel: 7,
    ipAddress: '192.168.1.100',
    operation: 'query',
    resource: 'customer-database'
  },
  operation: 'read'
};

try {
  const result = await perimeterManager.validateAccess(accessRequest);
  
  if (result.allowed) {
    // Accès autorisé
    console.log('Access granted:', result.reason);
  } else {
    // Accès refusé
    console.log('Access denied:', result.reason);
  }
} catch (error) {
  console.error('Error validating access:', error);
}
```

### Configuration des zones

```typescript
const newZone = {
  id: 'finance',
  name: 'Finance Department',
  level: 9,
  parent: 'internal',
  children: [],
  rules: [],
  isolationLevel: 'full',
  allowedProtocols: ['https', 'sql'],
  restrictions: [
    {
      type: 'network',
      rules: {
        allowedNetworks: ['192.168.5.0/24'],
        blockedNetworks: []
      }
    },
    {
      type: 'device',
      rules: {
        allowedTypes: ['finance-workstation'],
        minSecurityLevel: 8
      }
    }
  ],
  monitoring: {
    logLevel: 'warning',
    metrics: ['access_count', 'error_rate', 'attack_attempts'],
    alertThresholds: {
      error_rate: 0.01,
      attack_attempts: 1
    },
    retention: 365
  }
};

await perimeterManager.configureZone(newZone);
```

### Ajout de règles d'accès

```typescript
const newRule = {
  id: 'fin-policy-1',
  type: 'allow',
  priority: 100,
  conditions: [
    {
      type: 'role',
      parameters: { roles: ['finance-officer', 'auditor'] },
      evaluate: async (context) => context.roles.some(r =>
        ['finance-officer', 'auditor'].includes(r))
    },
    {
      type: 'time',
      parameters: { workHours: true },
      evaluate: async () => {
        const now = new Date();
        const hours = now.getHours();
        return hours >= 8 && hours <= 18;
      }
    }
  ],
  timeRestrictions: [
    {
      daysOfWeek: [1, 2, 3, 4, 5], // Lundi-Vendredi
      startTime: '08:00',
      endTime: '18:00',
      timezone: 'Europe/Paris'
    }
  ],
  action: {
    type: 'permit',
    parameters: {}
  }
};

await perimeterManager.addAccessRule('finance', newRule);
```

### Génération de rapports

```typescript
// Rapport général
const securityReport = await perimeterManager.generateSecurityReport({
  startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 jours
  endTime: new Date()
});

// Profil d'une zone spécifique
const zoneProfile = await perimeterManager.generateZoneSecurityProfile('finance');

// Rapport sur les menaces
const threatReport = await perimeterManager.generateThreatIntelligenceReport();
```

## Bonnes pratiques de sécurité

### Middleware API

1. **Positionnement des middlewares** : Le middleware de gestion des erreurs doit être le premier dans la chaîne pour intercepter toutes les erreurs.

2. **Configuration par environnement** : Utilisez des configurations différentes selon l'environnement :
   - Développement : Moins restrictif avec des erreurs détaillées
   - Production : Strict avec messages d'erreur génériques

3. **Validation des entrées** : Assurez-vous que toutes les entrées sont validées avant traitement.

### Périmètre de sécurité

1. **Gestion des zones**
   - Créer une hiérarchie de zones claire et cohérente
   - Définir des niveaux de sécurité progressifs
   - Limiter les transitions entre zones de niveaux très différents

2. **Règles d'accès**
   - Prioriser les règles correctement (les règles de priorité supérieure sont évaluées en premier)
   - Combiner les conditions pour une sécurité plus granulaire
   - Utiliser des restrictions temporelles pour limiter l'accès en dehors des heures ouvrables

3. **Surveillance**
   - Définir des seuils d'alerte appropriés dans les configurations de zone
   - Analyser régulièrement les rapports de sécurité
   - Investiguer les anomalies détectées

4. **Validation éthique et collaborative**
   - Configurer correctement le SystemeControleEthique pour éviter les faux positifs
   - Intégrer la ValidationCollaborative pour les zones critiques
   - Documenter les décisions de validation pour audit

## Intégration des deux systèmes

Pour une sécurité optimale, les deux systèmes doivent être intégrés :

```typescript
import { createSecurityMiddleware } from '@api/core/middleware';
import { SecurityPerimeterManager } from '@security/perimeter/SecurityPerimeterManager';

// Créer le middleware de sécurité API
const securityMiddleware = createSecurityMiddleware();

// Créer le gestionnaire de périmètre
const perimeterManager = new SecurityPerimeterManager(
  securityAuditor,
  ethicsSystem,
  validationCollaborative,
  metricsCollector,
  anomalyDetector
);

// Intégrer le gestionnaire de périmètre dans le flux de validation d'API
app.use(securityMiddleware);
app.use(async (req, res, next) => {
  // Si la requête a passé les middlewares de sécurité API
  // Vérifier l'accès au périmètre interne
  const accessRequest = {
    source: { zone: 'api', endpoint: req.originalUrl },
    target: determineTargetZone(req),
    context: {
      userId: req.user?.id,
      roles: req.user?.roles || [],
      permissions: req.user?.permissions || [],
      deviceType: req.headers['device-type'] || 'unknown',
      deviceSecurityLevel: determineSecurityLevel(req),
      ipAddress: req.ip,
      operation: req.method.toLowerCase()
    },
    operation: req.method.toLowerCase()
  };

  try {
    const result = await perimeterManager.validateAccess(accessRequest);
    if (result.allowed) {
      next();
    } else {
      res.status(403).json({
        error: 'Access denied',
        reason: result.reason
      });
    }
  } catch (error) {
    next(error);
  }
});
```

## Documentation spécifique

Pour une documentation plus détaillée de chaque système, consultez :

- [Documentation complète des Middlewares API](../api/core/middleware/README.md)
- [Documentation complète du Gestionnaire de Périmètre](../api/security/perimeter/README.md)

## Avantages de cette architecture de sécurité

1. **Défense en profondeur** : Plusieurs couches de protection complémentaires

2. **Séparation des préoccupations** :
   - Middlewares API : Sécurité de l'interface externe
   - Gestionnaire de périmètre : Sécurité interne entre zones

3. **Maintenabilité améliorée** :
   - Documentation complète
   - Tests unitaires couvrant toutes les fonctionnalités
   - Structure modulaire facilitant les évolutions futures

4. **Performance optimisée** :
   - Utilisation intelligente du cache pour réduire les calculs
   - Métriques permettant d'identifier les goulots d'étranglement
   - Traitement asynchrone pour minimiser l'impact sur les performances

Cette architecture combine le meilleur des deux mondes pour créer un système de sécurité à la fois robuste et flexible, adapté aux besoins spécifiques de notre application.