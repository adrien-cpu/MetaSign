# Guide de décision pour la refactorisation de fichiers

Ce guide a pour but de fournir un cadre structuré pour décider quand et comment refactoriser un fichier au sein de nos projets, en s'inspirant des principes de la dette technique et du "refactoring" de Martin Fowler.

## 1. Introduction: Pourquoi refactoriser?

La refactorisation est le processus qui consiste à restructurer le code existant sans en modifier le comportement externe. Les objectifs principaux sont:

-   **Améliorer la lisibilité**: Un code clair est plus facile à comprendre et à maintenir.
-   **Réduire la complexité**: Simplifier la logique réduit le risque de bugs.
-   **Faciliter l'évolution**: Un code bien conçu est plus facile à faire évoluer.
-   **Partager la connaissance**: Un code propre est un support de documentation en soi.

## 2. Quand envisager une refactorisation?

La refactorisation ne doit pas être une activité aléatoire. Elle doit être déclenchée par des signaux spécifiques:

1.  **Avant d'ajouter une nouvelle fonctionnalité**: Si le code existant rend l'ajout difficile, une refactorisation préalable est justifiée.
2.  **Lors de la correction d'un bug**: La difficulté à trouver un bug est souvent un symptôme d'un code trop complexe.
3.  **Pendant une revue de code**: Si un pair a du mal à comprendre votre code, c'est un signal fort.

## 3. Indicateurs quantitatifs (Métriques)

Ces métriques fournissent des signaux d'alerte clairs et faciles à mesurer:

| Métrique | Seuil d'alerte | Seuil critique | Notes |
|----------|----------------|----------------|-------|
| **Longueur du fichier** | > 300 lignes | > 500 lignes | Hors commentaires et lignes vides |
| **Longueur des fonctions/méthodes** | > 30 lignes | > 50 lignes | Envisager d'extraire des méthodes |
| **Nombre de méthodes par classe** | > 10 | > 20 | Indication d'une classe qui fait trop de choses |
| **Profondeur d'imbrication** | > 3 niveaux | > 4 niveaux | Structures conditionnelles ou boucles imbriquées |
| **Nombre de paramètres** | > 4 | > 6 | Par fonction/méthode |
| **Nombre de dépendances** | > 10 | > 15 | Imports/modules requis |

### Métriques de complexité et maintenabilité

Ces métriques requièrent des outils d'analyse statique mais offrent une vision plus approfondie:

| Métrique | Seuil d'alerte | Seuil critique | Notes |
|----------|----------------|----------------|-------|
| **Complexité cyclomatique** | > 10 par fonction | > 15 par fonction | Mesure les chemins d'exécution possibles |
| **Dette technique** | Score moyen | Score élevé | Mesurée par SonarQube ou outils similaires |
| **Indice de maintenabilité** | < 65 | < 50 | Sur une échelle de 0-100 |
| **Couplage afférent** | > 10 | > 20 | Nombre de modules dépendant de ce fichier |
| **Couplage efférent** | > 15 | > 25 | Nombre de modules dont ce fichier dépend |
| **Duplication de code** | > 10% | > 20% | Pourcentage de code dupliqué dans le fichier |

## 4. Indicateurs Qualitatifs (Code Smells)

Au-delà des métriques, une inspection manuelle peut révéler des problèmes de conception (aussi appelés "code smells") :

-   **Code dupliqué (Don't Repeat Yourself - DRY)** : Le même bloc de code apparaît à plusieurs endroits.
-   **Longue méthode** : Une fonction qui est devenue trop longue et fait plus d'une seule chose.
-   **Feature Envy (Envie de fonctionnalités)** : Une méthode qui semble plus intéressée par les données d'une autre classe que par celles de sa propre classe.
-   **Data Clumps (Groupes de données)** : Des groupes de variables qui apparaissent toujours ensemble dans différentes parties du code (ex: `startDate`, `endDate`). Elles devraient souvent être groupées dans un objet ou une classe.
-   **Commentaires excessifs** : Si le code est si complexe qu'il nécessite beaucoup de commentaires pour être compris, c'est souvent le code lui-même qui doit être simplifié.
-   **Primitive Obsession (Obsession des types primitifs)** : Utilisation excessive des types de base (string, number) là où un petit objet métier (Email, PhoneNumber, Money) serait plus robuste.
-   **Shotgun Surgery (Chirurgie au fusil de chasse)** : Un seul petit changement nécessite de modifier de nombreux fichiers différents.

### Indicateurs de conception et d'architecture

Ces signaux d'alerte sont plus qualitatifs mais tout aussi importants:

#### Violations de principes SOLID
- **Responsabilité unique**: Le fichier gère plusieurs préoccupations distinctes
- **Ouvert/fermé**: Modifications fréquentes pour ajouter des fonctionnalités
- **Substitution de Liskov**: Sous-classes qui ne peuvent pas remplacer leurs classes de base
- **Ségrégation d'interface**: Interfaces trop larges ou monolithiques
- **Inversion de dépendance**: Dépendances vers des modules concrets plutôt qu'abstraits

#### Autres indicateurs architecturaux
- Fichier difficile à tester unitairement
- Violations des frontières architecturales
- Présence de "code sentinelle" (flags et variables de contrôle)
- Utilisation excessive de valeurs globales ou singletons
- Couplage temporel (dépendances d'ordre d'exécution)

## 5. Indicateurs d'utilisation et d'évolution

Ces facteurs sont basés sur l'utilisation réelle et l'historique du fichier:

| Indicateur | Description | Notes |
|------------|-------------|-------|
| **Fréquence de modification** | Changé plus de 2 fois par mois | Indique une instabilité ou une mauvaise conception |
| **Fréquence des bugs** | > 2 bugs par trimestre | Signale un code fragile |
| **Temps de compréhension** | > 15 minutes pour un développeur expérimenté | Mesure subjective mais importante |
| **Impact sur les performances** | Impliqué dans > 10% des problèmes de performance | Identifié via le profilage |
| **Expansion constante** | Croissance de > 20% en 3 mois | Fichier qui grossit régulièrement |
| **Conflits de fusion** | > 3 conflits par mois | Indique un point de contention |

## 6. Facteurs contextuels

Avant de décider, prenez en compte le contexte:

-   **Criticité du code**: Le risque associé à la modification est-il acceptable?
-   **Ressources disponibles**: Avez-vous le temps et l'expertise nécessaires?
-   **Planification**: Y a-t-il une fenêtre appropriée pour cette refactorisation?
-   **Valeur métier**: Quelle est la durée de vie prévue de cette partie du code?
-   **Tests**: Avez-vous une couverture de tests suffisante pour refactoriser en sécurité?
-   **Documentation**: Est-elle disponible pour comprendre l'intention originale?

## 7. Processus de décision

Suivez ce processus pour décider objectivement:

1.  **Collecte des métriques**: Utilisez des outils automatisés pour mesurer les indicateurs quantitatifs.
2.  **Évaluation qualitative**: Examinez le code à la recherche des "code smells" et des indicateurs de conception.
3.  **Matrice d'impact/effort**:
    -   Impact élevé + Effort faible = **Refactorisation prioritaire**
    -   Impact élevé + Effort élevé = **Planifier avec soin**
    -   Impact faible + Effort faible = **Refactoriser opportunément**
    -   Impact faible + Effort élevé = **Reportez ou ignorez**
4.  **Planification**: Définissez clairement l'objectif et les limites de la refactorisation.
5.  **Validation**: Consultez les parties prenantes sur les risques et avantages.

## 8. Comment aborder la refactorisation

Une fois la décision prise:

1.  **Isoler le périmètre**: Définissez clairement ce qui est inclus et exclu
2.  **Stratégies progressives**:
    -   Refactorisation "étranglement" (strangler pattern) pour les systèmes critiques
    -   Refactorisation "Boy Scout" (laisser le code plus propre qu'à l'arrivée) pour les améliorations progressives
    -   Refactorisation "bulles" pour isoler et remplacer des portions spécifiques
3.  **Tests first**: Assurez-vous d'avoir des tests avant de commencer
4.  **Commits atomiques**: Faites de petits changements avec des messages clairs
5.  **Revue incrémentale**: Obtenez des retours au fur et à mesure

### Techniques de Refactorisation Courantes

Voici quelques techniques de base pour refactoriser :

-   **Extraction** :
    -   **Extraire une méthode/fonction** : Isoler une partie d'une longue méthode dans une nouvelle fonction avec un nom clair.
    -   **Extraire une variable** : Remplacer une expression complexe par une variable au nom explicite.
    -   **Extraire un composant/Hook (pour le Frontend)** : Isoler une partie de la logique ou de l'UI d'un composant complexe dans un composant enfant ou un hook personnalisé (ex: `useEvents`).
-   **Composition** :
    -   **Remplacer les types primitifs par un objet** : Transformer un groupe de données en une classe ou un objet.
    -   **Introduire un objet paramètre** : Regrouper plusieurs paramètres d'une fonction dans un seul objet.
-   **Simplification** :
    -   **Décomposer les conditionnelles** : Extraire la logique complexe des `if/else` dans des fonctions séparées.
    -   **Supprimer le code mort** : Éliminer les variables, fonctions ou fichiers inutilisés.

## 9. Indicateurs spécifiques par type de fichier

### Fichiers de composants UI
- Plus de 3 responsabilités distinctes (rendu, logique d'affaires, état, etc.)
- JSX/HTML imbriqué à plus de 4 niveaux
- Logique de rendu conditionnel complexe

### Fichiers de services/API
- Mélange de logique métier et de gestion d'API
- Manque d'abstraction sur les sources de données
- Gestion d'erreur incohérente ou insuffisante

### Fichiers de modèles/schémas
- Entités devenues trop larges (modèle "god object")
- Relations complexes entre entités définies au même endroit
- Validation et logique métier mélangées avec la définition

### Utilitaires/Helpers
- Collection de fonctions non reliées (fichier "fourre-tout")
- Fonctions qui partagent peu de contexte ou de dépendances
- Croissance sans limite claire

## 10. Outillage de Support

Pour vous aider à identifier et à effectuer des refactorisations :

-   **Analyse statique** : Des outils comme **ESLint** (avec des plugins comme SonarJS ou Unicorn), **CodeClimate**, ou **SonarQube** peuvent détecter automatiquement les "code smells" et la complexité cyclomatique.
-   **Fonctionnalités de l'IDE** : Les IDE modernes (VS Code, WebStorm) proposent des fonctionnalités de refactorisation en un clic ("Extraire la fonction", "Renommer le symbole").
-   **Tests de couverture** : Des outils comme **Vitest Coverage** ou **Jest Coverage** permettent de vérifier que vous avez suffisamment de tests avant de commencer une refactorisation risquée.

## 11. Exemples Concrets

### Exemple 1: Refactorisation d'un composant UI trop complexe

-   **Indicateurs**: Fichier de 600 lignes, 15 `useState`, complexité cyclomatique de 25.
-   **Décision**: Impact élevé (maintenance difficile), effort élevé. À planifier.
-   **Actions**:
    1.  Extraire la logique de gestion d'état dans des hooks personnalisés (ex: `useCalendar`, `useEvents`).
    2.  Diviser le méga-composant en plus petits composants enfants (ex: `CalendarView`, `EventList`).
    3.  Créer un composant parent qui orchestre les enfants.

### Exemple 2: Refactorisation d'une fonction d'authentification (compat vers modular)

**Avant: compat**

```javascript
import "firebase/compat/firestore"

const db = firebase.firestore();
db.collection("cities").where("capital", "==", true)
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
        });
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });
```

**Après: modular**

```javascript
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const db = getFirestore(firebaseApp);
const q = query(collection(db, "cities"), where("capital", "==", true));

const querySnapshot = await getDocs(q);
querySnapshot.forEach((doc) => {
  console.log(doc.id, " => ", doc.data());
});
```
-   **Justification**: Le code modulaire est plus léger, plus facile à "tree-shake" (éliminer le code mort) et représente la pratique recommandée par Firebase.

## Conclusion

La refactorisation est une discipline qui allie mesures objectives et jugement pragmatique. Utilisez ce guide comme point de départ, mais adaptez-le à la culture et aux contraintes spécifiques de votre équipe et de votre projet.

N'oubliez pas: le meilleur moment pour refactoriser est souvent lorsque vous travaillez déjà sur le code concerné, selon le principe du "Boy Scout" - laissez le code un peu plus propre que vous ne l'avez trouvé.

---

## Annexe : Refactorisation pour la Modernisation

Une refactorisation n'est pas toujours liée à un "mauvais" code. Elle est souvent nécessaire pour :

-   **Mettre à jour des dépendances majeures** (ex: passage de Firebase v8 à v9).
-   **Adopter de nouvelles APIs** d'un framework qui améliorent la lisibilité ou les performances (ex: remplacer les Class Components React par des Function Components avec Hooks).
-   **Migrer une technologie** (ex: JavaScript vers TypeScript).

Ces refactorisations doivent être planifiées comme des tâches à part entière, avec une évaluation de l'effort et de la valeur ajoutée.
