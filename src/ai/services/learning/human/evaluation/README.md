# Module d'évaluation d'apprentissage

Ce module fait partie du système MetaSign et fournit des fonctionnalités pour évaluer la compréhension des apprenants, identifier les lacunes d'apprentissage et générer des recommandations personnalisées.

## Composants principaux

- **ComprehensionEvaluator** : Évalue la compréhension des utilisateurs et fournit des recommandations
- **PerformanceAnalyzer** : Analyse les performances des utilisateurs
- **KnowledgeGapDetector** : Détecte les lacunes dans les connaissances
- **DifficultyPredictor** : Prédit le niveau de difficulté approprié
- **LearningPathRecommender** : Génère des recommandations de parcours d'apprentissage

## Intégration avec le registre de services

Le module d'évaluation s'intègre au registre de services d'apprentissage (`LearningServiceRegistry`) pour permettre une architecture modulaire et flexible.

### Exemple d'intégration

```typescript
// Initialiser le registre
const registry = LearningServiceRegistry.getInstance();

// Créer et enregistrer le service d'évaluation
const evaluationRegistration = new EvaluationServiceRegistration(registry);
const serviceId = await evaluationRegistration.registerEvaluationService({
    confidenceThreshold: 0.7,
    masteryThreshold: 80,
    maxRecommendations: 5
});

// Récupérer le service via le registre
const evaluator = await registry.getService<ComprehensionEvaluator>(serviceId);

// Utiliser le service
const evaluationResult = await evaluator.evaluateUserComprehension('user123', 'course_lsf_intermediate');
```

## Structure des données

### ComprehensionEvaluationResult

Résultat de l'évaluation de compréhension d'un utilisateur.

```typescript
interface ComprehensionEvaluationResult {
    userId: string;              // Identifiant de l'utilisateur
    courseId: string;            // Identifiant du cours
    globalScore: number;         // Score global (0-100)
    comprehensionLevel: ComprehensionLevel; // Niveau de compréhension
    evaluationDate: Date;        // Date de l'évaluation
    conceptEvaluations: ConceptEvaluation[]; // Évaluations par concept
    strengths: string[];         // Points forts (concepts)
    weaknesses: string[];        // Points faibles (concepts)
    gaps: LearningGap[];         // Lacunes identifiées
    recommendations: string[];   // Recommandations de parcours
    confidence: number;          // Confiance dans l'évaluation (0-1)
}
```

### SubmissionEvaluationResult

Résultat de l'évaluation d'une soumission d'exercice.

```typescript
interface SubmissionEvaluationResult {
    exerciseId: string;          // Identifiant de l'exercice
    userId: string;              // Identifiant de l'utilisateur
    score: number;               // Score obtenu (0-100)
    isCorrect: boolean;          // Indique si la soumission est correcte
    answerEvaluations: {...}[];  // Évaluations par réponse
    conceptMastery: Record<string, number>; // Niveaux de maîtrise
    potentialGaps: LearningGap[]; // Lacunes potentielles
    strengths: string[];         // Points forts
    weaknesses: string[];        // Points faibles
    recommendedDifficulty: string; // Difficulté recommandée
    submittedAt: Date;           // Date de soumission
}
```

## Utilisation

### Évaluation de la compréhension globale

```typescript
const result = await evaluator.evaluateUserComprehension('user123', 'course_intermediate');
console.log(`Score global: ${result.globalScore}`);
console.log(`Niveau: ${result.comprehensionLevel}`);
```

### Évaluation d'une soumission d'exercice

```typescript
const result = await evaluator.evaluateSubmission(exercise, submission, sessionContext);
console.log(`Score: ${result.score}`);
console.log(`Correct: ${result.isCorrect}`);
```

### Identification des lacunes d'apprentissage

```typescript
const gaps = await evaluator.identifyLearningGaps('user123');
console.log(`Lacunes identifiées: ${gaps.length}`);
```

### Recommandation de niveau de difficulté

```typescript
const difficulty = await evaluator.recommendDifficultyLevel('user123', 'concept_classifiers');
console.log(`Difficulté recommandée: ${difficulty}`);
```

## Performances et optimisations

Le module d'évaluation utilise plusieurs techniques pour optimiser les performances :

1. Extraction des calculs complexes dans des méthodes dédiées
2. Utilisation de `Math.exp()` pour les calculs exponentiels
3. Implémentation de la courbe d'oubli d'Ebbinghaus optimisée
4. Structure modulaire pour la maintenance et l'évolutivité

## Remarques sur l'exactitude des types

Le module respecte la configuration TypeScript `exactOptionalPropertyTypes: true` en utilisant l'opérateur de coalescence nulle (`??`) pour gérer correctement les propriétés optionnelles.