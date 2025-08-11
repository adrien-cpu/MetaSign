# Module de Gestion Spatiale LSF

Ce module fournit une infrastructure robuste pour la gestion des références spatiales dans l'espace de signation en Langue des Signes Française (LSF).

## Fonctionnalités principales

- **Gestion des références spatiales** : Création, suivi et manipulation de références dans l'espace 3D
- **Relations spatiales** : Définition et gestion des relations entre références
- **Régions spatiales** : Organisation de l'espace en régions logiques
- **Validation de cohérence** : Vérification de la validité des structures spatiales
- **Cache multi-niveaux** : Optimisation des performances avec un système de cache intelligent
- **Métriques en temps réel** : Suivi des performances et de l'utilisation

## Architecture

Le module est organisé en plusieurs composants spécialisés :

```
src/ai/spatial/
│
├── types/                           # Types et interfaces
│   ├── SpatialTypes.ts              # Types spatiaux de base
│   ├── interfaces/                  # Interfaces spécifiques
│   │   ├── SpatialInterfaces.ts     # Interfaces principales
│   │   ├── IReferenceBuilder.ts     # Interface pour le constructeur de références
│   │   ├── IReferenceTracker.ts     # Interface pour le tracker de références
│   │   └── ISpatialCoherenceValidator.ts  # Interface pour le validateur
│   └── index.ts                     # Point d'entrée des types
│
├── cache/                           # Système de cache
│   ├── MultiLevelCache.ts           # Implémentation du cache multi-niveaux
│   ├── interfaces/                  # Interfaces de cache
│   │   └── cache.interfaces.ts      # Interface ICache
│   └── index.ts                     # Exports du module cache
│
├── reference/                       # Gestion des références
│   ├── ReferenceBuilder.ts          # Constructeur de références
│   ├── ReferenceTracker.ts          # Suiveur de références
│   └── index.ts                     # Exports du module reference
│
├── validation/                      # Validation
│   └── SpatialCoherenceValidator.ts # Validateur de cohérence spatiale
│
├── SpatialManager.ts                # Gestionnaire principal
└── index.ts                         # Point d'entrée du module
```

## Optimisations de Performance

### 1. Cache Multi-niveaux

Le système de cache multi-niveaux (src/ai/spatial/cache/MultiLevelCache.ts) offre plusieurs optimisations :

1. **Cache L1** : Cache rapide pour les accès très fréquents (mémoire)
2. **Cache L2** : Cache secondaire pour les accès moyennement fréquents
3. **Cache prédictif** : Préchargement intelligent basé sur des patterns d'accès

### 2. Politiques d'éviction intelligentes

Le système implémente plusieurs stratégies d'éviction pour optimiser l'utilisation du cache :

- **LRU** (Least Recently Used) : Évacue les éléments non utilisés récemment
- **LFU** (Least Frequently Used) : Évacue les éléments les moins fréquemment utilisés
- **FIFO** (First In First Out) : Évacue les éléments les plus anciens
- **Adaptative** : Combine intelligemment plusieurs facteurs pour une éviction optimale

### 3. Gestion efficace des références

Le `ReferenceTracker` utilise plusieurs mécanismes d'optimisation :

- **Index spatiaux** : Structure de données optimisée pour les requêtes spatiales
- **Index de type** : Recherche rapide par type de référence
- **Mise en cache des relations** : Accès rapide aux connexions entre références

### 4. Algorithmes d'optimisation spatiale

Le `SpatialCoherenceValidator` inclut des algorithmes pour :

- **Détection efficace de chevauchement** : Utilisation d'approximations rapides pour les tests initiaux
- **Optimisation de placement** : Suggestions intelligentes pour résoudre les problèmes de cohérence
- **Validation incrémentale** : Ne vérifie que ce qui a changé depuis la dernière validation

### 5. Monitoring et Métriques

Le système intègre des métriques détaillées :

- **Taux de succès du cache** (hit ratio)
- **Temps d'accès moyen**
- **Nombre d'évictions par niveau**
- **Efficacité du préchargement prédictif**

## Utilisation

Voici un exemple d'utilisation du SpatialManager :

```typescript
import { SpatialManager, SpatialReferenceType, SpatialVector, SpatialRelationship } from '@ai/spatial';

// Créer une instance du gestionnaire
const spatialManager = new SpatialManager();

// Créer une référence
const personRef = {
  id: 'person1',
  type: SpatialReferenceType.PERSON,
  position: { x: 0, y: 1, z: 0 },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  activationState: 'active',
  importance: 0.8,
  persistenceScore: 0.7,
  properties: { name: 'John' }
};

// Ajouter la référence
spatialManager.addReference(personRef);

// Créer une autre référence
const objectRef = {
  id: 'object1',
  type: SpatialReferenceType.OBJECT,
  position: { x: 1, y: 1, z: 0 },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  activationState: 'active',
  importance: 0.6,
  persistenceScore: 0.5,
  properties: { name: 'Book' }
};

// Ajouter la seconde référence
spatialManager.addReference(objectRef);

// Créer une connexion entre les références
spatialManager.createConnection(
  'person1',
  'object1',
  SpatialRelationship.NEXT_TO,
  0.9,
  true
);

// Récupérer toutes les références actives
const activeRefs = spatialManager.getActiveReferences();
console.log(`Nombre de références actives : ${activeRefs.length}`);

// Récupérer les connexions d'une référence
const connections = spatialManager.getConnectionsForReference('person1');
console.log(`Nombre de connexions : ${connections.length}`);

// Valider la cohérence de la carte spatiale
const coherenceReport = spatialManager.validateCoherence();
console.log(`Cohérence : ${coherenceReport.isCoherent ? 'OK' : 'Problèmes détectés'}`);
```

## Utilisation du Cache

```typescript
import { MultiLevelCache, CacheLevel, EvictionPolicy, PreloadStrategy } from '@ai/spatial/cache';

// Configurer un cache multi-niveaux
const cache = new MultiLevelCache({
  levels: {
    l1: {
      maxSize: 100,
      evictionPolicy: EvictionPolicy.LRU,
      ttl: 60000 // 1 minute
    },
    l2: {
      maxSize: 500,
      evictionPolicy: EvictionPolicy.LFU,
      ttl: 300000 // 5 minutes
    },
    predictive: {
      maxSize: 200,
      evictionPolicy: EvictionPolicy.ADAPTIVE,
      ttl: 600000, // 10 minutes
      preloadStrategy: PreloadStrategy.PATTERN
    }
  },
  metrics: {
    enabled: true,
    detailedStats: true
  }
});

// Stocker une valeur dans le cache L1
cache.set('key1', { data: 'value1' }, CacheLevel.L1);

// Récupérer une valeur (cherche dans tous les niveaux)
const value = cache.get('key1');

// Obtenir les statistiques de performance du cache
const stats = cache.getStats();
console.log(`Taux de succès du cache: ${stats.hitRatio * 100}%`);
console.log(`Temps d'accès moyen: ${stats.averageAccessTime}ms`);
```

## Validation de cohérence spatiale

```typescript
import { SpatialManager, SpatialCoherenceValidator } from '@ai/spatial';

// Créer un validateur
const validator = new SpatialCoherenceValidator();

// Valider une carte spatiale
const spatialMap = spatialManager.getSpatialMap();
const report = validator.validateSpatialMap(spatialMap);

if (report.isCoherent) {
  console.log('La carte spatiale est cohérente!');
  console.log(`Score de cohérence: ${report.score}`);
} else {
  console.log('Des problèmes de cohérence ont été détectés:');
  
  for (const issue of report.issues) {
    console.log(`- ${issue.severity.toUpperCase()}: ${issue.message}`);
  }
  
  console.log('\nRecommandations:');
  for (const recommendation of report.recommendations) {
    console.log(`- ${recommendation}`);
  }
  
  // Suggérer des corrections
  const correctedMap = validator.suggestCoherenceCorrections(spatialMap);
  
  // Appliquer les corrections suggérées
  // spatialManager.updateSpatialMap(correctedMap);
}
```

## Documentation associée

Pour plus d'informations sur la partie spécifique aux structures spatiales, consultez :
- `src/ai/specialized/spatial/README.md` : Documentation des fonctionnalités de structures spatiales
- `src/ai/specialized/spatial/SpatialStructureManager.ts` : Gestionnaire de structures spatiales

## Métriques et Monitoring

Le système intègre des métriques détaillées pour surveiller les performances :

### Métriques du cache
- Taux de succès du cache (hit ratio)
- Temps d'accès moyen 
- Nombre d'évictions par niveau
- Efficacité du préchargement prédictif

### Métriques spatiales
- Densité des références dans l'espace
- Complexité des relations spatiales
- Score de cohérence global
- Nombre de problèmes détectés

## Extensions futures

1. **Optimisation spatiale avancée** : Algorithmes spatiaux plus sophistiqués pour la gestion des références
2. **Apprentissage adaptatif** : Amélioration continue des stratégies de préchargement basée sur l'usage
3. **Synchronisation distribuée** : Support pour les environnements distribués
4. **Compression des données** : Réduction de l'empreinte mémoire pour les grands ensembles de références
5. **Intégration avec des modèles de deep learning** : Pour la prédiction des relations spatiales optimales

## Guide de développement

### Ajouter un nouveau type de référence

1. Ajouter la nouvelle valeur dans l'enum `SpatialReferenceType` dans `SpatialTypes.ts`
2. Étendre `ReferenceBuilder` pour prendre en charge le nouveau type
3. Ajouter le support approprié dans `SpatialCoherenceValidator`

### Optimiser davantage le cache

1. Ajuster les paramètres du cache selon les métriques collectées
2. Développer une stratégie d'éviction personnalisée pour votre cas d'usage
3. Utiliser le préchargement prédictif pour les scénarios critiques en termes de performance

### Personnaliser la validation de cohérence

1. Modifier les seuils dans `SpatialCoherenceValidator` selon vos besoins
2. Ajouter de nouvelles règles de validation en étendant la classe
3. Personnaliser les stratégies de suggestion de correction