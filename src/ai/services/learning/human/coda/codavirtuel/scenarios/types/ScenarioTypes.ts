/**
 * @file src/ai/services/learning/human/coda/codavirtuel/scenarios/types/ScenarioTypes.ts
 * @description Types pour les scénarios d'apprentissage et les options de génération
 * @module ScenarioTypes
 * @version 1.0.0
 * @since 2024 
 * @author MetaSign Team
 */

import { CECRLLevel } from '../../types';
import { ErrorCategory } from '../exercises/types/ExerciseTypes';

/**
 * Options de génération d'un scénario d'apprentissage
 */
export interface ScenarioGenerationOptions {
    /**
     * Niveau CECRL de l'apprenant
     */
    level: CECRLLevel;

    /**
     * Niveaux de compétence actuels par catégorie (0-100)
     */
    skillLevels: Record<ErrorCategory, number>;

    /**
     * IDs de scénarios à exclure (déjà vus par l'apprenant)
     */
    excludeIds?: string[];

    /**
     * Domaines d'intérêt spécifiés par l'apprenant ou l'enseignant
     */
    focusAreas?: string[];

    /**
     * Thème spécifique à utiliser (optionnel)
     */
    theme?: string;
}