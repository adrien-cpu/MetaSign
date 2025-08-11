/**
 * @file src/ai/services/learning/interfaces.ts
 * Fichier racine qui regroupe et exporte toutes les interfaces du module d'apprentissage
 * pour une utilisation simplifiée dans l'ensemble du système.
 */

// Export interfaces from human learning components
export * from './human/evaluation/interfaces/ICompetencyGapDetector';
export * from './human/personalization/interfaces/IUserProfileManager';
export * from './human/coda/codavirtuel/adapters/interfaces/IRealTimeAdapter';

// Export interfaces from machine learning components
export * from './machine/adaptative/interfaces/IAdaptiveLearningSystem';
export * from './machine/adaptative/interfaces/IIntelligentAdapter';
export * from './machine/adaptative/interfaces/types';

// Export interfaces from pyramid integration
export * from './pyramid/interfaces/IEthicsSystem';

// Export all type definitions
export * from './types';

// Note: If more exports are needed later, they should be added here
// to maintain a centralized interface export system