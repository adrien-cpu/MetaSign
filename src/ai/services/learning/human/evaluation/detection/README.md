# Module de Détection de Lacunes - MetaSign

## Vue d'ensemble

Le module de détection de lacunes est responsable de l'identification et de l'analyse des lacunes dans l'apprentissage de la Langue des Signes Française (LSF). Il fournit des services spécialisés pour détecter les lacunes de connaissances et de compétences, ainsi que pour recommander des activités personnalisées.

## Architecture

```
detection/
├── KnowledgeGapDetector.ts          # Détection lacunes connaissances
├── CompetencyGapDetector.ts         # Détection lacunes compétences
├── ActivityRecommendationService.ts # Recommandation d'activités
├── UnifiedGapDetectorService.ts     # Service unifié
├── index.ts                         # Exports et factories
├── MIGRATION_GUIDE.md              # Guide de migration
├── README.md                       # Documentation
└── __tests__/
    └── KnowledgeGapDetector.test.ts # Tests unitaires
```

## Services Disponibles

### 🧠 KnowledgeGapDetector

**Responsabilité :** Détection des lacunes dans les connaissances conceptuelles LSF

**Fonctionnalités :**
- Analyse des évaluations de concepts
- Identification des prérequis faibles
- Priorisation des lacunes par importance
- Recommandation de ressources d'apprentissage

**Usage :**
```typescript
import { KnowledgeGapDetector } from './detection/KnowledgeGapDetector';

const detector = new KnowledgeGapDetector(conceptGraph, metricsCollector, {
    masteryThreshold: 70,
    minimumConfidence: 0.4,
    maxRecommendedResources: 3
});

const result = await detector.detectKnowledgeGaps(userId, conceptEvaluations);
console.log(result.gaps);
console.log(result.metadata);
```

### 💪 CompetencyGapDetector

**Responsabilité :** Détection des lacunes dans les compétences pratiques LSF

**Fonctionnalités :**
- Analyse des performances d'apprentissage
- Détection de lacunes par compétence LSF spécifique
- Calcul de priorités et impacts
- Génération d'activités de base

**Usage :**
```typescript
import { CompetencyGapDetector } from './detection/CompetencyGapDetector';

const detector = new CompetencyGapDetector(metricsCollector, {
    minimumImpact: 5,
    maxGapsPerAnalysis: 10
});

const result = await detector.detectCompetencyGaps(userId, learningContext);
console.log(result.gaps);
```

### 🎯 ActivityRecommendationService

**Responsabilité :** Recommandation d'activités personnalisées pour combler les lacunes

**Fonctionnalités :**
- Génération d'activités basées sur des templates
- Adaptation de difficulté selon les lacunes
- Optimisation des sessions d'apprentissage
- Support multi-compétences LSF

**Usage :**
```typescript
import { ActivityRecommendationService } from './detection/ActivityRecommendationService';

const service = new ActivityRecommendationService(metricsCollector, {
    maxActivitiesPerGap: 3,
    maxSessionDuration: 1800, // 30 minutes
    defaultDifficulty: 3
});

const result = await service.recommendActivities(userId, competencyGaps);
console.log(result.recommendations);
```

### 🔗 UnifiedGapDetectorService

**Responsabilité :** Orchestration et coordination de tous les services de détection

**Fonctionnalités :**
- Analyse complète en une seule opération
- Coordination des différents types de détection
- Statistiques et métriques globales
- Compatibilité avec l'interface legacy

**Usage :**
```typescript
import { UnifiedGapDetectorService } from './detection/UnifiedGapDetectorService';

const service = new UnifiedGapDetectorService(conceptGraph, metricsCollector, {
    enableDetailedMetrics: true,
    knowledgeGapConfig: { masteryThreshold: 75 },
    competencyGapConfig: { minimumImpact: 6 },
    activityRecommendationConfig: { maxActivitiesPerGap: 2 }
});

// Analyse complète
const result = await service.analyzeAllGaps(userId, context, evaluations);
console.log(result.knowledgeGaps);
console.log(result.competencyGaps);
console.log(result.recommendedActivities);
console.log(result.metadata);
```

## Factory Functions

Pour simplifier l'instanciation :

```typescript
import { 
    createUnifiedGapDetector,
    createAllGapDetectionServices,
    DEFAULT_CONFIGS 
} from './detection';

// Service unifié avec configuration par défaut
const unifiedDetector = createUnifiedGapDetector(
    conceptGraph, 
    metricsCollector
);

// Tous les services avec configurations personnalisées
const services = createAllGapDetectionServices(conceptGraph, metricsCollector, {
    knowledgeGap: { masteryThreshold: 80 },
    competencyGap: { minimumImpact: 7 },
    activityRecommendation: { maxActivitiesPerGap: 2 }
});
```

## Configurations

### Configuration par défaut

```typescript
export const DEFAULT_CONFIGS = {
    KNOWLEDGE_GAP_DETECTOR: {
        masteryThreshold: 70,
        minimumGapPriority: 3,
        enableDetailedMetrics: true,
        minimumConfidence: 0.4,
        maxRecommendedResources: 3
    },
    COMPETENCY_GAP_DETECTOR: {
        minimumImpact: 5,
        minimumPriority: 5,
        enableDetailedMetrics: true,
        maxGapsPerAnalysis: 10
    },
    ACTIVITY_RECOMMENDATION: {
        maxActivitiesPerGap: 3,
        maxSessionDuration: 1800,
        enableDetailedMetrics: true,
        defaultDifficulty: 3,
        minimumExpectedImpact: 5
    }
};
```

### Configuration avancée

```typescript
const advancedConfig = {
    enableDetailedMetrics: true,
    autoDetectGaps: true,
    knowledgeGapConfig: {
        masteryThreshold: 75,           // Seuil de maîtrise plus strict
        minimumGapPriority: 4,          // Priorité minimale plus élevée
        minimumConfidence: 0.6,         // Confiance minimale plus élevée
        maxRecommendedResources: 5      // Plus de ressources
    },
    competencyGapConfig: {
        minimumImpact: 7,               // Impact minimum plus élevé
        minimumPriority: 6,             // Priorité minimale plus élevée
        maxGapsPerAnalysis: 5           // Moins de lacunes pour plus de focus
    },
    activityRecommendationConfig: {
        maxActivitiesPerGap: 2,         // Moins d'activités pour plus de focus
        maxSessionDuration: 1200,       // Sessions plus courtes (20 min)
        defaultDifficulty: 4,           // Difficulté par défaut plus élevée
        minimumExpectedImpact: 7        // Impact attendu plus élevé
    }
};
```

## Types et Interfaces

### Types principaux

```typescript
interface KnowledgeGapAnalysisResult {
    gaps: ReadonlyArray<LearningGap>;
    metadata: {
        analyzedConcepts: number;
        lowScoringConcepts: number;
        analysisTimestamp: Date;
        averageGapPriority: number;
    };
}

interface CompetencyGapAnalysisResult {
    gaps: ReadonlyArray<CompetencyGap>;
    metadata: {
        userId: string;
        analysisTimestamp: Date;
        totalGapsDetected: number;
        averageImpact: number;
        averagePriority: number;
        performanceMetrics: {
            averageScore: number;
            errorRate: number;
            completionRate: number;
        };
    };
}

interface UnifiedGapAnalysisResult {
    knowledgeGaps: ReadonlyArray<LearningGap>;
    competencyGaps: ReadonlyArray<CompetencyGap>;
    recommendedActivities: ReadonlyArray<RecommendedActivity>;
    metadata: {
        userId: string;
        analysisTimestamp: Date;
        totalKnowledgeGaps: number;
        totalCompetencyGaps: number;
        totalRecommendations: number;
        analysisCompletionTime: number;
        priorityDistribution: {
            high: number;    // Priorité 8-10
            medium: number;  // Priorité 5-7
            low: number;     // Priorité 1-4
        };
    };
}
```

## Métriques et Monitoring

Le module enregistre automatiquement des métriques détaillées :

### Événements de métriques

- `gap_detection.knowledge.started` / `completed` / `error`
- `gap_detection.competency.started` / `completed` / `error`
- `activity_recommendation.started` / `completed` / `error`
- `unified_gap_analysis.started` / `completed` / `error`
- `gap_prioritization.started` / `completed`

### Données collectées

- Nombre de lacunes détectées par type
- Temps d'exécution des analyses
- Taux de succès des recommandations
- Distribution des priorités
- Métriques de performance utilisateur

## Compétences LSF Supportées

Le module supporte spécifiquement les compétences LSF suivantes :

### Compétences de base
- **Configuration manuelle** (`comp_handshape`) - Formes et positions des mains
- **Utilisation de l'espace** (`comp_spatial`) - Espace de signation
- **Expressions faciales** (`comp_facial`) - Marqueurs grammaticaux non-manuels
- **Précision des mouvements** (`comp_movement`) - Mouvements et orientations
- **Structures grammaticales** (`comp_grammar`) - Grammaire LSF

### Templates d'activités par compétence

Chaque compétence dispose de templates d'activités spécialisés :
- Exercices pratiques
- Quiz de reconnaissance
- Ateliers interactifs
- Simulations 3D (pour l'espace)
- Analyses grammaticales

## Intégration avec MetaSign

### Dépendances requises

```typescript
import { ConceptRelationshipGraph } from '../graphs/ConceptRelationshipGraph';
import { MetricsCollector } from '../../registry/utils/MetricsCollector';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';
```

### Services externes utilisés

- **ConceptRepository** - Accès aux concepts et ressources LSF
- **MetricsCollector** - Collecte de métriques système
- **ConceptRelationshipGraph** - Relations entre concepts

## Tests

### Structure des tests

```
__tests__/
├── KnowledgeGapDetector.test.ts     # Tests du détecteur de connaissances
├── CompetencyGapDetector.test.ts    # Tests du détecteur de compétences
├── ActivityRecommendationService.test.ts # Tests du service d'activités
├── UnifiedGapDetectorService.test.ts     # Tests du service unifié
└── integration/
    └── detection-integration.test.ts     # Tests d'intégration
```

### Exécution des tests

```bash
# Tests unitaires
npm test src/ai/services/learning/human/evaluation/detection/__tests__/

# Tests avec couverture
npm run test:coverage -- src/ai/services/learning/human/evaluation/detection/

# Tests d'intégration
npm run test:integration -- detection
```

## Bonnes Pratiques

### 1. Utilisation recommandée

- **Utilisez le UnifiedGapDetectorService** pour la plupart des cas d'usage
- **Configurez les seuils** selon votre contexte pédagogique
- **Activez les métriques détaillées** en développement
- **Utilisez les factory functions** pour l'instanciation

### 2. Performance

- Les services sont optimisés pour des analyses < 1 seconde
- La détection parallèle réduit les temps d'attente
- Le cache des concepts améliore les performances répétées

### 3. Extensibilité

- Ajoutez des compétences via les templates d'activités
- Créez des détecteurs spécialisés en étendant les classes de base
- Utilisez les hooks de métriques pour un monitoring personnalisé

## Exemples Complets

### Exemple basique

```typescript
import { createUnifiedGapDetector } from './detection';

// Configuration simple
const detector = createUnifiedGapDetector(conceptGraph, metricsCollector);

// Analyse complète
const analysis = await detector.analyzeAllGaps(
    'user-123', 
    learningContext, 
    conceptEvaluations
);

// Utiliser les résultats
console.log(`${analysis.metadata.totalKnowledgeGaps} lacunes de connaissances`);
console.log(`${analysis.metadata.totalCompetencyGaps} lacunes de compétences`);
console.log(`${analysis.metadata.totalRecommendations} activités recommandées`);
```

### Exemple avancé avec configuration

```typescript
import { UnifiedGapDetectorService } from './detection/UnifiedGapDetectorService';

const detector = new UnifiedGapDetectorService(conceptGraph, metricsCollector, {
    enableDetailedMetrics: true,
    knowledgeGapConfig: {
        masteryThreshold: 80,
        minimumConfidence: 0.7
    },
    competencyGapConfig: {
        minimumImpact: 7,
        maxGapsPerAnalysis: 5
    },
    activityRecommendationConfig: {
        maxActivitiesPerGap: 2,
        maxSessionDuration: 900 // 15 minutes
    }
});

const analysis = await detector.analyzeAllGaps(userId, context, evaluations);

// Statistiques avancées
const stats = detector.getAnalysisStatistics(analysis);
console.log(`Efficacité des recommandations: ${stats.recommendationEfficiency}`);
console.log(`Performance d'analyse: ${stats.analysisPerformance}`);
```

## Support et Contribution

- **Documentation :** Voir `MIGRATION_GUIDE.md` pour la migration
- **Tests :** Suivre les patterns existants pour nouveaux tests
- **Types :** Respecter `exactOptionalPropertyTypes: true`
- **Logging :** Utiliser LoggerFactory pour tous les logs
- **Métriques :** Enregistrer les événements importants

Le module de détection de lacunes est conçu pour être robuste, extensible et facile à utiliser tout en respectant les spécificités de l'apprentissage de la LSF.