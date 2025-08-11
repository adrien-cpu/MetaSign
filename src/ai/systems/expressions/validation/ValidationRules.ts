/**
 * Règles de validation des expressions
 */
import {
    BodyMovement,
    BodyPosture,
    ExpressionComponentValues,
    HandConfiguration,
    HandMovement
} from '../types';

/**
 * Règles de validation des expressions
 */
export const EXPRESSION_RULES = {
    FACIAL: {
        EYEBROWS: {
            validate: (value: ExpressionComponentValues): boolean => {
                // Valider les sourcils
                return Object.keys(value).length > 0;
            }
        },
        MOUTH: {
            validate: (value: ExpressionComponentValues): boolean => {
                // Valider la bouche
                return Object.keys(value).length > 0;
            }
        },
        EYES: {
            validate: (value: ExpressionComponentValues): boolean => {
                // Valider les yeux
                return Object.keys(value).length > 0;
            }
        }
    },
    BODY: {
        POSTURE: {
            validate: (value: BodyPosture): boolean => {
                // Valider la posture
                return !!value;
            }
        },
        MOVEMENT: {
            validate: (value: BodyMovement): boolean => {
                // Valider les mouvements
                return !!value;
            }
        }
    },
    HAND: {
        CONFIGURATION: {
            validate: (value: HandConfiguration): boolean => {
                // Valider la configuration des mains
                return !!value;
            }
        },
        MOVEMENT: {
            validate: (value: HandMovement): boolean => {
                // Valider les mouvements des mains
                return !!value;
            }
        }
    }
} as const;

export type ExpressionRules = typeof EXPRESSION_RULES;