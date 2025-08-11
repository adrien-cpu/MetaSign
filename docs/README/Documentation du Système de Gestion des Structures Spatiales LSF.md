# Système de Gestion des Structures Spatiales LSF

Ce module fournit une architecture modulaire pour la gestion des structures spatiales en Langue des Signes Française (LSF).

## Architecture

L'architecture du système est basée sur le principe de la séparation des responsabilités (SRP) et de l'inversion des dépendances (DIP), offrant une solution extensible, testable et maintenable.

```
SpatialStructureManager
│
├── Core
│   ├── SigningSpace           // Gestion de l'espace de signation
│   └── ProformeRegistry       // Gestion des proformes
│
├── Generators
│   ├── ReferenceZoneGenerator // Génération des zones spatiales
│   └── LayoutGenerator        // Génération des dispositions spatiales
│
├── Analyzers
│   ├── SpatialAnalyzer        // Analyse des structures spatiales
│   └── ComponentExtractor     // Extraction des composants spatiaux
│
└── Validation
    └── SpatialValidator       // Validation des structures spatiales
```

## Utilisation de base

### Exemple 1 : Génération d'une structure spatiale

```typescript
import { 
  createSpatialStructureManager, 
  CulturalContext 
} from '@ai/specialized/spatial';

// Création d'un gestionnaire avec les services par défaut
const manager = createSpatialStructureManager();

// Définition d'un contexte culturel
const context: CulturalContext = {
  region: 'france',
  formalityLevel: 0.7,
  context: 'formal'
};

// Génération d'une structure spatiale
async function generateStructure() {
  try {
    const structure = await manager.generateSpatialStructure(context);
    console.log('Structure générée avec succès');
    console.log('Nombre de zones:', structure.zones.length);
    console.log('Nombre de proformes:', structure.proformes.length);
    console.log('Score de cohérence:', structure.metadata.coherenceScore);
    return structure;
  } catch (error) {
    console.error('Erreur lors de la génération de la structure:', error);
  }
}
```

### Exemple 2 : Analyse d'une entrée LSF

```typescript
import { 
  createSpatialStructureManager, 
  LSFInput, 
  LSFInputType 
} from '@ai/specialized/spatial';

// Création d'un gestionnaire avec les services par défaut
const manager = createSpatialStructureManager();

// Définition d'une entrée LSF à analyser
const input: LSFInput = {
  type: LSFInputType.TEXT_CONVERSION,
  data: "Un exemple de texte à convertir en LSF",
  culturalContext: {
    region: 'france',
    formalityLevel: 0.5
  }
};

// Analyse de l'entrée LSF
async function analyzeInput() {
  try {
    const analysis = await manager.analyzeSpatialStructure(input);
    console.log('Analyse réalisée avec succès');
    console.log('Nombre de composants:', analysis.components.length);
    console.log('Nombre de relations:', analysis.relations.length);
    return analysis;
  } catch (error) {
    console.error('Erreur lors de l\'analyse:', error);
  }
}
```

## Configuration avancée

### Personnalisation des services

Vous pouvez personnaliser le comportement du système en injectant vos propres implémentations des services :

```typescript
import { 
  SpatialStructureManager, 
  SigningSpace, 
  ProformeRegistry, 
  ReferenceZoneGenerator, 
  LayoutGenerator, 
  SpatialAnalyzer, 
  SpatialValidator 
} from '@ai/specialized/spatial';

// Création des services personnalisés
const signingSpace = new SigningSpace();
const proformeRegistry = new ProformeRegistry();
const referenceZoneGenerator = new ReferenceZoneGenerator(signingSpace);
const layoutGenerator = new LayoutGenerator(signingSpace, proformeRegistry);
const spatialAnalyzer = new SpatialAnalyzer();
const spatialValidator = new SpatialValidator();

// Création du gestionnaire avec les services personnalisés
const manager = new SpatialStructureManager(
  signingSpace,
  proformeRegistry,
  referenceZoneGenerator,
  layoutGenerator,
  spatialAnalyzer,
  spatialValidator
);
```

### Extension avec de nouvelles fonctionnalités

Vous pouvez étendre le système en implémentant vos propres versions des interfaces existantes :

```typescript
import { 
  ISigningSpace, 
  IProformeRegistry, 
  IReferenceZoneGenerator 
} from '@ai/specialized/spatial';

// Implémentation personnalisée de l'espace de signation
class CustomSigningSpace implements ISigningSpace {
  // Implémentation spécifique...
}

// Utilisation de l'implémentation personnalisée
const customSpace = new CustomSigningSpace();
const manager = new SpatialStructureManager(customSpace);
```

## Diagramme des dépendances

```
┌───────────────────────────────────────────────┐
│                                               │
│             SpatialStructureManager           │
│                                               │
└───────────┬───────┬───────┬───────┬───────────┘
            │       │       │       │
            ▼       ▼       ▼       ▼
┌──────────┐ ┌─────────┐ ┌───────┐ ┌──────────┐
│SigningSpace│ │ProformeRegistry│ │SpatialAnalyzer│ │SpatialValidator│
└──────────┘ └─────────┘ └───┬───┘ └──────────┘
      ▲                     │
      │                     ▼
      │             ┌───────────────┐
      │             │ComponentExtractor│
┌─────┴────┐        └───────────────┘
│ReferenceZoneGenerator│
└──────────┘
      ▲
      │
┌─────┴────┐
│LayoutGenerator│
└──────────┘
```

## Extension future

Cette architecture a été conçue pour permettre des extensions futures, telles que :

1. **Nouveaux types de contextes culturels** : Ajout de nouvelles variantes régionales ou de niveaux de formalité
2. **Nouvelles méthodes d'analyse** : Implémentation d'algorithmes d'analyse plus sophistiqués
3. **Intégration avec l'apprentissage automatique** : Ajout de capacités d'apprentissage pour améliorer les structures générées
4. **Support pour d'autres langues des signes** : Extension à d'autres langues des signes au-delà de la LSF

## Bonnes pratiques

Lors de l'utilisation et de l'extension de ce système, suivez ces bonnes pratiques :

1. **Respecter les interfaces** : Implémentez toutes les méthodes requises par les interfaces
2. **Tests unitaires** : Assurez-vous que chaque composant a ses propres tests unitaires
3. **Injection de dépendances** : Utilisez le constructeur pour injecter les dépendances
4. **Documentation** : Documentez toutes les classes et méthodes publiques
5. **Gestion des erreurs** : Utilisez les classes d'erreur spécifiques fournies

## Structure des fichiers

```
src/ai/specialized/spatial/
│
├── core/                             // Composants fondamentaux
│   ├── interfaces/                   // Interfaces des composants core
│   │   ├── ISigningSpace.ts
│   │   └── IProformeRegistry.ts
│   ├── SigningSpace.ts               // Espace de signation
│   └── ProformeRegistry.ts           // Registre des proformes
│
├── generators/                       // Générateurs de structures
│   ├── interfaces/                   // Interfaces des générateurs
│   │   ├── IReferenceZoneGenerator.ts
│   │   └── ILayoutGenerator.ts
│   ├── ReferenceZoneGenerator.ts     // Génération des zones
│   └── LayoutGenerator.ts            // Génération des layouts
│
├── analyzers/                        // Analyseurs
│   ├── interfaces/                   // Interfaces des analyseurs
│   │   └── IComponentExtractor.ts
│   ├── SpatialAnalyzer.ts            // Analyse spatiale
│   └── ComponentExtractor.ts         // Extraction de composants
│
├── validation/                       // Validation
│   ├── interfaces/                   // Interfaces de validation
│   │   └── ISpatialValidator.ts
│   └── SpatialValidator.ts           // Validation des structures
│
├── __tests__/                        // Tests d'intégration
│   └── SpatialStructureManager.integration.test.ts
│
├── types.ts                          // Types et interfaces communs
├── SpatialStructureManager.ts        // Classe principale
├── index.ts                          // Point d'entrée et exports
└── README.md                         // Documentation
```
