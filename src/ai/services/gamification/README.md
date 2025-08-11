# Exemples d'intégration du service de gamification

Voici comment intégrer le service de gamification central dans différents modules de MetaSign.

## 1. Intégration dans le module Learning (rétrocompatibilité)

```typescript
// src/ai/services/learning/LearningService.ts
import { GamificationManager } from '@/ai/services/gamification';

export class LearningService {
  private gamificationManager: GamificationManager;
  
  constructor() {
    this.gamificationManager = new GamificationManager();
    // Reste de l'initialisation...
  }
  
  // Méthode utilisant l'ancienne API (toujours supportée)
  public async evaluateExercise(userId: string, exerciseId: string, result: EvaluationResult) {
    // Logique d'évaluation...
    
    // Utiliser la méthode de compatibilité existante
    const gamificationResult = await this.gamificationManager.processExerciseResult(
      userId, 
      exerciseId, 
      result
    );
    
    return {
      ...evaluationResult,
      gamification: gamificationResult
    };
  }
}
```

## 2. Intégration dans un nouveau module de traduction

```typescript
// src/ai/services/translation/TranslationService.ts
import { 
  GamificationManager, 
  ActionType, 
  ActionContext,
  ActionData 
} from '@/ai/services/gamification';

export class TranslationService {
  private gamificationManager: GamificationManager;
  
  constructor() {
    this.gamificationManager = new GamificationManager();
    // Reste de l'initialisation...
  }
  
  // Méthode utilisant la nouvelle API générique
  public async completeTranslation(userId: string, translationId: string, result: TranslationResult) {
    // Logique de traduction...
    
    // Créer une action de gamification
    const actionData: ActionData = {
      actionId: `translation_${translationId}_${Date.now()}`,
      type: ActionType.TRANSLATION_COMPLETED,
      context: ActionContext.TRANSLATION,
      result: {
        success: result.isValid,
        score: result.quality / 100, // Normaliser entre 0 et 1
        details: {
          sourceLanguage: result.sourceLanguage,
          targetLanguage: result.targetLanguage,
          characterCount: result.characterCount,
          complexity: result.complexity
        }
      },
      metadata: {
        translationId,
        duration: result.duration,
        contentType: result.contentType
      }
    };
    
    // Traiter l'action
    const gamificationResult = await this.gamificationManager.processAction(userId, actionData);
    
    return {
      ...translationResult,
      gamification: gamificationResult
    };
  }
}
```

## 3. Création d'un adaptateur personnalisé

Si vous souhaitez ajouter un adaptateur pour un nouveau module, suivez ce modèle :

```typescript
// src/ai/services/gamification/adapters/MyModuleAdapter.ts
import { ActionContext, ActionData, ActionType } from '../types/action';

export class MyModuleAdapter {
  /**
   * Convertit un résultat d'action spécifique en données d'action de gamification
   */
  public static convertMyAction(userId: string, actionId: string, myResult: MyResultType): ActionData {
    return {
      actionId: `my_action_${actionId}_${Date.now()}`,
      type: ActionType.CUSTOM, // Ou définir un type spécifique
      context: 'my_module', // Ou utiliser ActionContext si approprié
      result: {
        success: myResult.succeeded,
        score: myResult.score || 1.0,
        details: myResult.details || {}
      },
      metadata: {
        userId,
        actionSpecificData: myResult.specificData,
        timestamp: new Date().toISOString()
      }
    };
  }
}

// Ensuite ajoutez l'exportation dans src/ai/services/gamification/adapters/index.ts
export * from './MyModuleAdapter';
```

## 4. Abonnement aux événements de gamification

Vous pouvez vous abonner aux événements de gamification pour réagir aux accomplissements des utilisateurs :

```typescript
import { GamificationManager, GamificationEvent } from '@/ai/services/gamification';

export class UserInterfaceService {
  private gamificationManager: GamificationManager;
  private unsubscribeFromEvents: () => void;
  
  constructor() {
    this.gamificationManager = new GamificationManager();
    
    // S'abonner aux événements
    this.unsubscribeFromEvents = this.gamificationManager.subscribeToEvents(
      this.handleGamificationEvent.bind(this)
    );
  }
  
  // Gestionnaire d'événements
  private handleGamificationEvent(event: GamificationEvent) {
    // Réagir à différents types d'événements
    switch (event.type) {
      case 'badge_earned':
        this.showBadgeEarnedNotification(event);
        break;
      
      case 'level_up':
        this.showLevelUpCelebration(event);
        break;
      
      case 'challenge_completed':
        this.showChallengeCompletedNotification(event);
        break;
    }
  }
  
  // Nettoyer lors de la destruction
  public destroy() {
    if (this.unsubscribeFromEvents) {
      this.unsubscribeFromEvents();
    }
  }
}
```