# Système de Sécurité du Périmètre

## Vue d'ensemble

Le système de sécurité du périmètre (`SecurityPerimeterManager`) est une solution complète de gestion de la sécurité des accès entre différentes zones du système. Il définit et applique des politiques de sécurité entre les différentes composantes internes de l'application.

Ce système fait partie de l'architecture de sécurité globale et complète les middlewares de sécurité API (situés dans `src/ai/api/core/middleware/`) qui protègent l'interface externe.

## Principales fonctionnalités

- Gestion de zones de sécurité avec niveaux différents
- Règles d'accès configurables et évaluables dynamiquement
- Validation éthique des accès basée sur le `SystemeControleEthique`
- Validation collaborative impliquant la communauté d'experts
- Détection d'anomalies et d'intrusions
- Surveillance et métriques en temps réel
- Reporting avancé et analyse de sécurité

## Architecture

L'architecture a été optimisée pour réduire la complexité tout en maintenant une excellente séparation des responsabilités :

### Module principal

**SecurityPerimeterManager** - Point d'entrée central qui :
- Coordonne tous les aspects de la sécurité du périmètre
- Fournit une API unifiée pour toutes les opérations
- Gère le cache et les performances
- Assure la traçabilité des opérations

### Modules spécialisés

1. **ZoneManager** - Gestionnaire de zones de sécurité
   - Création et configuration des zones
   - Gestion de la hiérarchie des zones
   - Application des restrictions de zone

2. **RuleManager** - Gestionnaire de règles d'accès
   - Définition des règles d'accès
   - Évaluation des conditions
   - Résolution des conflits entre règles

3. **PerimeterValidation** - Validation des accès
   - Validation éthique via `SystemeControleEthique`
   - Validation collaborative 
   - Vérification des permissions

4. **PerimeterMonitoring** - Surveillance et métriques
   - Collecte de métriques en temps réel
   - Détection d'anomalies
   - Alertes et notifications

5. **PerimeterReporting** - Rapports et analyses
   - Génération de rapports de sécurité
   - Analyses de tendances
   - Profils de sécurité des zones

## Utilisation

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
// Rapport général de sécurité
const securityReport = await perimeterManager.generateSecurityReport({
  startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 jours
  endTime: new Date()
});

// Profil de sécurité d'une zone spécifique
const zoneProfile = await perimeterManager.generateZoneSecurityProfile('finance');

// Rapport sur les menaces
const threatReport = await perimeterManager.generateThreatIntelligenceReport();
```

### Arrêt propre

```typescript
// Arrêt propre du système
await perimeterManager.shutdown();
```

## Bonnes pratiques

### Gestion des zones

1. **Hiérarchie claire** : Créer une hiérarchie de zones logique et cohérente
2. **Niveaux progressifs** : Définir des niveaux de sécurité qui augmentent progressivement
3. **Transitions limitées** : Limiter les transitions entre zones de niveaux très différents

### Règles d'accès

1. **Priorisation** : Les règles de priorité supérieure sont évaluées en premier
2. **Granularité** : Combiner les conditions pour une sécurité plus précise
3. **Restrictions temporelles** : Limiter l'accès en dehors des heures ouvrables

### Surveillance

1. **Seuils d'alerte** : Définir des seuils d'alerte appropriés dans les configurations de zone
2. **Analyse régulière** : Examiner régulièrement les rapports de sécurité
3. **Investigation** : Suivre et investiguer les anomalies détectées

### Validation éthique et collaborative

1. **Configuration éthique** : Configurer le SystemeControleEthique pour éviter les faux positifs
2. **Zones critiques** : Intégrer la ValidationCollaborative pour les zones sensibles
3. **Documentation** : Documenter les décisions de validation pour audit

## Intégration avec les middlewares de sécurité API

Pour une sécurité complète, ce système devrait être utilisé conjointement avec les middlewares de sécurité API (`src/ai/api/core/middleware/`). Voir la [documentation globale de sécurité](../../../security/README.md) pour plus de détails sur l'intégration.

## Avantages de cette architecture

1. **Complexité réduite**:
   - Regroupement des fonctionnalités connexes en modules cohérents
   - Interfaces plus claires et moins fragmentées

2. **Intégration complète**:
   - Validation éthique intégrée au flux de validation
   - Monitoring et métriques en temps réel
   - Détection d'anomalies incorporée
   - Génération de rapports avancée

3. **Maintenabilité améliorée**:
   - Documentation complète pour l'utilisation
   - Tests unitaires couvrant toutes les nouvelles fonctionnalités
   - Structure modulaire facilitant les évolutions futures

4. **Performance optimisée**:
   - Utilisation intelligente du cache pour réduire les calculs
   - Métriques permettant d'identifier les goulots d'étranglement
   - Mesures précises des temps de traitement
