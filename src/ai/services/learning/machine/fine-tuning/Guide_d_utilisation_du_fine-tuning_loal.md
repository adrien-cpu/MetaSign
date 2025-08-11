# Guide d'utilisation du fine-tuning local pour MetaSign

Ce guide vous explique comment utiliser le système de fine-tuning local de MetaSign sur votre ordinateur équipé d'un processeur AMD Ryzen 9 6900HX.

## Prérequis

- Node.js 16+ installé
- Au moins 8 Go de RAM libre
- 10 Go d'espace disque disponible
- Système d'exploitation Windows 64 bits

## Installation

1. Clonez le dépôt MetaSign et installez les dépendances :

```bash
git clone https://github.com/votre-organisation/metasign.git
cd metasign
npm install
```

2. Créez le dossier de fine-tuning :

```bash
mkdir -p data/fine-tuning/models
mkdir -p data/fine-tuning/datasets
```

3. Configurez le système pour utiliser votre matériel AMD :

```bash
npm run configure-amd
```

## Structure du projet

Le système de fine-tuning se compose des éléments suivants :

- `LocalFineTuningSystem` : Système principal qui orchestre le fine-tuning
- `FineTuningManager` : Gère l'exécution des sessions de fine-tuning
- `AMDOptimizedEngine` : Moteur d'entraînement optimisé pour votre Ryzen 9 6900HX
- `ThreadPool` : Gestion parallélisée des tâches pour exploiter pleinement vos 16 threads
- `LocalStorageManager` : Sauvegarde et chargement des modèles fine-tunés localement

## Interface utilisateur

Démarrez l'interface utilisateur :

```bash
npm run start-fine-tuning-ui
```

L'interface s'ouvre dans votre navigateur et propose trois onglets :

1. **Models** : Liste des modèles fine-tunés disponibles
2. **Training** : Configuration et lancement d'une session de fine-tuning
3. **Settings** : Paramètres d'optimisation pour votre matériel

## Préparation des données

Le système accepte les données aux formats suivants :

- JSON pour les datasets de texte
- CSV pour les données tabulaires
- Images (JPEG/PNG) pour les données visuelles

Placez vos fichiers de données dans le dossier `data/fine-tuning/datasets`.

### Structure d'un dataset

```json
{
  "samples": [
    {
      "input": "Texte d'entrée",
      "expectedOutput": "Texte de sortie attendu"
    },
    ...
  ],
  "validationSamples": [
    {
      "input": "Texte de validation",
      "expectedOutput": "Sortie de validation attendue"
    },
    ...
  ]
}
```

## Fine-tuning d'un modèle

1. Ouvrez l'onglet **Training** dans l'interface utilisateur
2. Configurez vos paramètres :
   - **Iterations** : Nombre d'epochs d'entraînement (recommandé : 10-20)
   - **Batch Size** : Taille des lots (recommandé : 64 pour votre RAM de 32 Go)
   - **Learning Rate** : Taux d'apprentissage (recommandé : 0.001)
   - **Dropout Rate** : Taux de dropout (recommandé : 0.2)
   - **Model Pruning** : Activez pour réduire la taille du modèle final
   - **Quantization** : Activez pour accélérer l'inférence

3. Cliquez sur "Start Training"

Le système utilise automatiquement les optimisations suivantes pour votre Ryzen 9 :
- Optimisations SIMD AVX2 pour accélérer les calculs 
- Multithreading optimisé pour utiliser vos 8 cœurs / 16 threads
- Gestion intelligente de la mémoire pour éviter les dépassements

## Optimisations spécifiques AMD

L'`AMDOptimizedEngine` est spécifiquement conçu pour votre processeur :

- Utilisation des instructions AVX2 et FMA3 disponibles sur votre Ryzen 9
- Détection automatique des capacités de votre GPU Radeon intégré
- Optimisation de la taille de batch en fonction de votre mémoire disponible
- Scheduling intelligent pour équilibrer la charge entre vos cœurs

## Surveillance de l'entraînement

Pendant l'entraînement, vous pouvez suivre :
- La progression globale
- La perte (loss) en temps réel
- L'utilisation de la mémoire
- L'utilisation CPU
- Le temps restant estimé

## Gestion des modèles fine-tunés

Une fois l'entraînement terminé, le modèle apparaît dans l'onglet **Models**. Vous pouvez :

- **Load** : Charger le modèle pour l'utiliser dans MetaSign
- **Export** : Exporter le modèle pour le partager
- **Delete** : Supprimer le modèle

## Utilisation programmatique

Vous pouvez également utiliser le système de fine-tuning directement dans votre code :

```typescript
import { LocalFineTuningSystem } from '@ai/learning/fine-tuning/LocalFineTuningSystem';

// Initialiser le système
const fineTuningSystem = new LocalFineTuningSystem(
  iaCore,
  orchestrator,
  validationSystem,
  ethicsSystem,
  metricsCollector,
  {
    storagePath: './data/fine-tuning',
    memoryLimit: 28000, // 28 GB
    optimizationSettings: {
      quantizationLevel: 'int8',
      compressionFormat: 'zstd',
      pruningStrategy: 'magnitude',
      supportedDistillationAlgorithms: ['vanilla'],
      enableONNXOptimization: true,
      hardwareOptimizations: ['cpu'],
      targetModelSize: 0
    },
    supportedModelTypes: ['transformer', 'lstm', 'gru'],
    defaultValidationStrategy: 'k_fold',
    debugMode: false,
    storageQuota: 10240 // 10 GB
  }
);

// Préparer un dataset
const dataset = await fineTuningSystem.prepareDataset(rawData);

// Démarrer un fine-tuning
const result = await fineTuningSystem.runFineTuning(dataset, {
  modelType: 'transformer',
  iterations: 10,
  learningRate: 0.001,
  batchSize: 64,
  applyPruning: true,
  applyQuantization: true,
  enableCollaborativeValidation: false,
  dropoutRate: 0.2,
  optimizationFlags: ['mixed_precision', 'gradient_checkpointing']
});

// Charger un modèle fine-tuné
await fineTuningSystem.loadFineTunedModel(result.modelId);
```

## Dépannage

### Problèmes de mémoire

Si vous rencontrez des erreurs de mémoire, essayez :
- Réduire la taille de batch
- Activer le gradient checkpointing dans les paramètres avancés
- Réduire la quantité de données si votre dataset est très volumineux

### Performances lentes

Pour améliorer les performances :
- Vérifiez que l'option AVX2 est activée dans les paramètres
- Fermez les applications gourmandes en ressources pendant l'entraînement
- Utilisez un disque SSD pour le stockage des modèles

### Problèmes de modèles

Si vos modèles fine-tunés ne fonctionnent pas correctement :
- Vérifiez la qualité de vos données d'entraînement
- Augmentez le nombre d'itérations
- Ajustez le taux d'apprentissage (essayez 0.0001 pour plus de stabilité)

## Ressources techniques

Pour plus d'informations sur l'implémentation interne, consultez :

- `AMDOptimizedEngine.ts` : Optimisations spécifiques à votre CPU/GPU
- `ThreadPool.ts` : Gestion des threads pour maximiser l'utilisation du CPU
- `DeviceDetector.ts` : Détection des capacités matérielles

## Conclusion

Ce système vous permet de fine-tuner des modèles MetaSign localement sur votre Ryzen 9 6900HX, en exploitant pleinement ses capacités sans avoir besoin d'un serveur externe. Les optimisations spécifiques à AMD vous garantissent les meilleures performances possibles pour vos tâches de fine-tuning.