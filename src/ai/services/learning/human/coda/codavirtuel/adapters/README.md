# Module d'Adaptation en Temps Réel

Ce module fait partie du système d'apprentissage CODA virtuel et fournit des fonctionnalités d'adaptation en temps réel pour améliorer l'expérience d'apprentissage des utilisateurs.

## Structure des fichiers

Le module est organisé comme suit :

- `RealTimeAdapter.ts` - Classe principale qui coordonne l'adaptation en temps réel
- `types.ts` - Définitions de types et interfaces pour le module
- `interfaces/IRealTimeAdapter.ts` - Interface définissant les méthodes publiques de l'adaptateur
- `utils/preference-utils.ts` - Utilitaires pour la conversion et le mapping des préférences d'apprentissage
- `analyzers/interaction-analyzer.ts` - Analyseur de patterns d'interaction utilisateur
- `mocks/mock-services.ts` - Services simulés pour le développement et les tests

## Fonctionnalités

Ce module offre les fonctionnalités suivantes :

- Surveillance de l'engagement de l'utilisateur
- Détection de la frustration
- Ajustement du rythme d'apprentissage
- Fourniture d'assistance contextuelle
- Analyse des patterns d'interaction
- Génération de recommandations d'apprentissage

## Intégration avec le système

Le module s'intègre avec d'autres composants du système d'apprentissage via :

- Le registre de services (LearningServiceRegistry)
- L'intégration avec la pyramide IA
- Le système de métriques d'apprentissage
- Le système de profil utilisateur

## Utilisation

Exemple d'utilisation de base :

```typescript
import { RealTimeAdapter } from './adapters/RealTimeAdapter';

// Créer une instance de l'adaptateur
const realTimeAdapter = new RealTimeAdapter();

// Analyser l'engagement d'un utilisateur
const engagementMetrics = await realTimeAdapter.monitorEngagement('user123');

// Fournir une assistance contextuelle
const assistanceContent = await realTimeAdapter.provideContextualAssistance('user123', learningContext);

// Analyser les patterns d'interaction
const patterns = await realTimeAdapter.analyzeInteractionPatterns('user123');
```

## Architecture technique

L'adaptateur en temps réel suit une architecture de type façade, déléguant les responsabilités à des composants spécialisés :

- `EngagementMonitor` - Surveillance de l'engagement
- `FrustrationDetector` - Détection de la frustration
- `PaceAdjuster` - Ajustement du rythme
- `AssistanceProvider` - Fourniture d'assistance
- `InteractionPatternAnalyzer` - Analyse des patterns

## Notes de développement

1. Les services de mock seront remplacés par des implémentations réelles à mesure que le projet avance.
2. L'intégration avec le registre de services doit être complétée.
3. Des tests unitaires et d'intégration doivent être développés pour toutes les fonctionnalités.
4. L'analyseur de patterns peut être amélioré avec des algorithmes plus sophistiqués.