/**
 * Point d'entrée pour le module de gamification centralisé
 * 
 * @file src/ai/services/gamification/index.ts
 */

// Exporter le gestionnaire principal
export { GamificationManager } from './GamificationManager';

// Exporter les types génériques
export * from './types';
export * from './types/action';

// Exporter les adaptateurs
export * from './adapters';

// Exporter les services individuels (si nécessaire pour une utilisation directe)
export { BadgeService } from './services/BadgeService';
export { ChallengeService } from './services/ChallengeService';
export { EventService } from './services/EventService';
export { LevelService } from './services/LevelService';
export { ProfileService } from './services/ProfileService';