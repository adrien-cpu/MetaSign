/**
 * @file src/ai/services/learning/human/coda/codavirtuel/scenarios/exercises/types/ExerciseTypesEnums.ts
 * @description Énumérations pour les types d'exercices et leurs paramètres
 * @module services/learning/human/coda/codavirtuel/scenarios/exercises/types
 * @author MetaSign
 * @version 1.0.0
 * @since 2024
 */

/**
 * Énumération des catégories d'erreurs possibles
 * Déplacé depuis ExerciseTypes.ts pour éviter les imports cycliques
 */
export enum ErrorCategoryEnum {
    VOCABULARY = 'vocabulary',
    GRAMMAR = 'grammar',
    SYNTAX = 'syntax',
    CULTURAL = 'cultural',
    SPATIAL = 'spatial',
    TEMPORAL = 'temporal',
    PROSODY = 'prosody',
    EXPRESSION = 'expression'
}