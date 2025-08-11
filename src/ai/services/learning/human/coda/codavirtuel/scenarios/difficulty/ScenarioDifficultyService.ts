/**
 * @file src/ai/services/learning/codavirtuel/scenarios/difficulty/ScenarioDifficultyService.ts
 * @description Service pour gérer la difficulté des scénarios et des exercices
 * Permet de calculer et d'ajuster la difficulté en fonction du niveau de l'apprenant
 * @module services/learning/codavirtuel/scenarios/difficulty
 * @version 1.0.0
 * @since 2024
 * @author MetaSign Team
 */

import { CECRLLevel } from '@/ai/services/learning/human/coda/codavirtuel/types';
import { ExerciseDifficulty } from '@/ai/services/learning/human/coda/codavirtuel/scenarios/types/DifficultyTypes';
import { Logger } from '@/ai/utils/Logger';

/**
 * Catégories d'erreurs pour le système d'apprentissage
 * Ces catégories sont utilisées pour évaluer les compétences de l'apprenant
 */
export enum ErrorCategory {
  GRAMMAR = 'GRAMMAR',
  VOCABULARY = 'VOCABULARY',
  EXPRESSION = 'EXPRESSION',
  SPATIAL = 'SPATIAL',
  TEMPORAL = 'TEMPORAL',
  PROSODY = 'PROSODY'
}

/**
 * Service de gestion de la difficulté des scénarios et exercices
 * Calcule et ajuste la difficulté en fonction de divers facteurs comme:
 * - Le niveau CECRL de l'apprenant
 * - La difficulté thématique du contenu
 * - Les niveaux de compétence actuels dans différentes catégories
 */
export class ScenarioDifficultyService {
  private readonly logger: Logger;

  /**
   * Initialise le service de difficulté
   */
  constructor() {
    this.logger = new Logger('ScenarioDifficultyService');
  }

  /**
   * Calcule la difficulté globale d'un scénario
   * @param level - Niveau CECRL de l'apprenant
   * @param themeDifficulty - Difficulté thématique (1-10)
   * @param skillLevels - Niveaux de compétence actuels de l'apprenant
   * @returns Difficulté globale calculée
   */
  public calculateGlobalDifficulty(
    level: CECRLLevel,
    themeDifficulty: number,
    skillLevels: Record<ErrorCategory, number>
  ): ExerciseDifficulty {
    this.logger.debug(`Calcul de la difficulté globale pour niveau ${level}, difficulté thématique ${themeDifficulty}`);

    // Facteur de niveau CECRL (A1: plus facile, C2: plus difficile)
    const levelFactor = this.getLevelFactor(level);

    // Facteur de compétences (moyenne des niveaux de compétence)
    const skillFactor = this.calculateSkillFactor(skillLevels);

    // Normaliser la difficulté thématique (1-10) à (0-1)
    const normalizedThemeDifficulty = (themeDifficulty - 1) / 9;

    // Combiner les facteurs (avec pondérations)
    const combinedDifficulty =
      (normalizedThemeDifficulty * 0.4) +  // 40% basé sur la difficulté du thème
      (levelFactor * 0.3) +                // 30% basé sur le niveau CECRL
      (skillFactor * 0.3);                 // 30% basé sur les compétences de l'apprenant

    // Mapper la difficulté combinée à un niveau de difficulté
    return this.mapToDifficultyLevel(combinedDifficulty);
  }

  /**
   * Obtient les difficultés adjacentes à une difficulté donnée
   * @param difficulty - Difficulté de référence
   * @returns Tableau des difficultés adjacentes
   */
  public getAdjacentDifficulties(difficulty: ExerciseDifficulty): ExerciseDifficulty[] {
    switch (difficulty) {
      case 'easy':
        return ['medium'];
      case 'medium':
        return ['easy', 'hard'];
      case 'hard':
        return ['medium'];
      default:
        return ['medium'];
    }
  }

  /**
   * Ajuste la difficulté en fonction de la performance de l'apprenant
   * @param currentDifficulty - Difficulté actuelle
   * @param successRate - Taux de réussite (0-1)
   * @param threshold - Seuil de changement (défaut: 0.75)
   * @returns Difficulté ajustée
   */
  public adjustDifficulty(
    currentDifficulty: ExerciseDifficulty,
    successRate: number,
    threshold = 0.75
  ): ExerciseDifficulty {
    // Si le taux de réussite est élevé, augmenter la difficulté
    if (successRate >= threshold) {
      return this.increaseDifficulty(currentDifficulty);
    }

    // Si le taux de réussite est faible, diminuer la difficulté
    if (successRate <= (1 - threshold)) {
      return this.decreaseDifficulty(currentDifficulty);
    }

    // Sinon, maintenir la difficulté actuelle
    return currentDifficulty;
  }

  /**
   * Calcule le facteur de niveau CECRL
   * @param level - Niveau CECRL
   * @returns Facteur de niveau (0-1)
   */
  private getLevelFactor(level: CECRLLevel): number {
    const levelFactors: Record<CECRLLevel, number> = {
      [CECRLLevel.A1]: 0.0,
      [CECRLLevel.A2]: 0.2,
      [CECRLLevel.B1]: 0.4,
      [CECRLLevel.B2]: 0.6,
      [CECRLLevel.C1]: 0.8,
      [CECRLLevel.C2]: 1.0
    };

    return levelFactors[level] || 0.5;
  }

  /**
   * Calcule le facteur de compétences
   * @param skillLevels - Niveaux de compétence de l'apprenant
   * @returns Facteur de compétences (0-1)
   */
  private calculateSkillFactor(skillLevels: Record<ErrorCategory, number>): number {
    // Si pas de données de compétences, retourner une valeur médiane
    if (!skillLevels || Object.keys(skillLevels).length === 0) {
      return 0.5;
    }

    // Calculer la moyenne des niveaux de compétence (supposés être sur une échelle de 0 à 10)
    const totalSkills = Object.values(skillLevels).reduce((sum, level) => sum + level, 0);
    const averageSkill = totalSkills / Object.values(skillLevels).length;

    // Normaliser à une échelle de 0 à 1 (en supposant que les compétences sont sur 0-10)
    // Inverser pour que des compétences élevées donnent une difficulté plus faible
    return 1 - (averageSkill / 10);
  }

  /**
   * Convertit une valeur numérique en niveau de difficulté
   * @param value - Valeur de difficulté (0-1)
   * @returns Niveau de difficulté
   */
  private mapToDifficultyLevel(value: number): ExerciseDifficulty {
    if (value < 0.33) {
      return 'easy';
    }

    if (value < 0.67) {
      return 'medium';
    }

    return 'hard';
  }

  /**
   * Augmente la difficulté d'un niveau
   * @param difficulty - Difficulté actuelle
   * @returns Difficulté augmentée
   */
  private increaseDifficulty(difficulty: ExerciseDifficulty): ExerciseDifficulty {
    switch (difficulty) {
      case 'easy':
        return 'medium';
      case 'medium':
        return 'hard';
      case 'hard':
        return 'hard'; // Déjà au maximum
      default:
        return 'medium';
    }
  }

  /**
   * Diminue la difficulté d'un niveau
   * @param difficulty - Difficulté actuelle
   * @returns Difficulté diminuée
   */
  private decreaseDifficulty(difficulty: ExerciseDifficulty): ExerciseDifficulty {
    switch (difficulty) {
      case 'easy':
        return 'easy'; // Déjà au minimum
      case 'medium':
        return 'easy';
      case 'hard':
        return 'medium';
      default:
        return 'easy';
    }
  }
}