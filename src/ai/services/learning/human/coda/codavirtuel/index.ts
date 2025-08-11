/**
 * @file src/ai/services/learning/human/coda/codavirtuel/index.ts
 * @description Point d'entrée pour le module d'apprentissage inversé (CODA virtuel)
 * @author MetaSign
 * @version 1.0.0
 */

// Exporte le système principal
export { ReverseApprenticeshipSystem } from './ReverseApprenticeshipSystem';

// Exporte les types
export * from './types';

// Exporte les évaluateurs
export { CECRLLevelEvaluator } from './evaluators/CECRLLevelEvaluator';

// Exporte les interfaces
// Correction: utilisation de 'export type' pour la réexportation de types
export type { ILevelEvaluator } from './interfaces/ILevelEvaluator';

// Exporte le simulateur d'erreurs
export { ErrorSimulator } from './simulation/ErrorSimulator';

// Exporte le gestionnaire de stockage
export { UserReverseApprenticeshipRepository } from './repositories/UserReverseApprenticeshipRepository';

/**
 * @namespace codavirtuel
 * @description
 * Module d'apprentissage inversé (CODA virtuel) qui simule un apprentissage progressif
 * de la LSF comme le ferait un enfant entendant de parents sourds (CODA).
 * 
 * Ce système permet de créer une expérience d'apprentissage plus engageante où l'avatar
 * "apprend" en même temps que l'utilisateur, faisant des erreurs et s'améliorant progressivement.
 * 
 * ## Fonctionnalités principales:
 * 
 * - Simulation d'erreurs typiques d'un apprenant LSF selon le niveau CECRL
 * - Progression adaptative basée sur les performances de l'utilisateur
 * - Évaluation des compétences selon le cadre CECRL
 * - Gestion des variantes dialectales de la LSF
 * - Intégration avec le système de validation collaborative
 * 
 * ## Utilisation:
 * 
 * ```typescript
 * import { ReverseApprenticeshipSystem } from '@codavirtuel/index';
 * 
 * // Obtenir l'instance du système
 * const codarSystem = ReverseApprenticeshipSystem.getInstance();
 * 
 * // Initialiser la progression d'un utilisateur
 * const userProgress = await codarSystem.initializeUserProgress('user123');
 * 
 * // Générer un scénario adapté au niveau de l'utilisateur
 * const scenario = await codarSystem.generateLearningScenario('user123', 'CONVERSATION');
 * ```
 */