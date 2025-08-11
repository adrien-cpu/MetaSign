/**
 * @file src/ai/services/learning/index.ts
 * @description Point d'entrée pour le module d'apprentissage
 * Exporte tous les composants du système d'apprentissage de MetaSign
 * @author MetaSign
 * @version 1.1.0
 */

// Exporte le service principal d'apprentissage
export { LearningService } from './LearningService';

// Exporte le système CODA virtuel (apprentissage inversé)
export * from './codavirtuel';

// Exporte les types d'évaluation
export * from './evaluation/types';

// Exporte le service de gamification
export { GamificationManager } from '../gamification/GamificationManager';

// Exporte le service de personnalisation
export { PersonalizedLearningPath } from './personalization/PersonalizedLearningPath';

// Exporte les interfaces communes
export { IUserProfileManager } from './interfaces/IUserProfileManager';
export { IEthicsSystem } from './interfaces/IEthicsSystem';

/**
 * @namespace learning
 * @description
 * Module d'apprentissage complet de MetaSign offrant des fonctionnalités avancées pour
 * l'apprentissage de la LSF et l'enseignement adapté aux personnes sourdes et malentendantes.
 * 
 * Ce module intègre plusieurs systèmes spécialisés :
 * 
 * - **Service d'apprentissage personnalisé** : Adapte les parcours d'apprentissage aux besoins spécifiques
 *   de chaque utilisateur en fonction de son profil, ses objectifs et son niveau.
 * 
 * - **CODA virtuel** : Système d'apprentissage inversé qui simule un apprentissage progressif 
 *   de la LSF comme le ferait un enfant entendant de parents sourds (CODA), créant une 
 *   expérience d'apprentissage engageante où l'avatar "apprend" en même temps que l'utilisateur.
 * 
 * - **Gamification** : Intègre des mécanismes ludiques pour augmenter l'engagement et la motivation
 *   des apprenants avec des badges, des défis et un système de points.
 * 
 * - **Évaluation contextuelle** : Mesure précisément les progrès des apprenants en tenant compte
 *   du contexte et en fournissant des retours détaillés et personnalisés.
 * 
 * Le module s'intègre avec les autres composants du système MetaSign, notamment :
 * - L'intelligence distribuée pour l'optimisation des ressources
 * - Le système de validation collaborative pour l'amélioration continue des contenus
 * - Le système émotionnel pour une expérience d'apprentissage plus naturelle
 * 
 * ## Utilisation:
 * 
 * ```typescript
 * import { LearningService, ReverseApprenticeshipSystem } from '@learning/index';
 * 
 * // Obtenir le service d'apprentissage
 * const learningService = LearningService.getInstance();
 * 
 * // Créer un parcours personnalisé
 * const userProfile = await learningService.getUserProfile('user123');
 * const personalizedPath = await learningService.createPersonalizedPath(userProfile);
 * 
 * // Utiliser le système CODA virtuel
 * const codarSystem = ReverseApprenticeshipSystem.getInstance();
 * const scenario = await codarSystem.generateLearningScenario('user123', 'CONVERSATION');
 * ```
 */