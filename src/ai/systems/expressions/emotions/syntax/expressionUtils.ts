// src/ai/systems/expressions/emotions/syntax/expressionUtils.ts
import {
    LSFExpression,
    Handshape,
    CustomEyebrowComponent,
    CustomMouthComponent,
    CustomEyeComponent
} from './types';

/**
 * Effectue une copie profonde d'un objet
 * @param obj Objet à copier
 * @returns Copie profonde de l'objet
 */
export function deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Convertit un objet en Record<string, number> en s'assurant que toutes les propriétés sont numériques
 * @param obj Objet à convertir
 * @returns Objet avec valeurs numériques uniquement
 */
export function ensureNumericRecord(obj: Record<string, unknown>): Record<string, number> {
    const result: Record<string, number> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'number') {
            result[key] = value;
        } else if (typeof value === 'string') {
            const num = parseFloat(value);
            if (!isNaN(num)) {
                result[key] = num;
            }
        }
    }

    return result;
}

/**
 * S'assure que la propriété handshape contient toutes les propriétés requises
 * @param handshape Objet handshape à vérifier
 * @returns Objet handshape avec les propriétés par défaut
 */
export function ensureHandshapeProperties(handshape: Handshape | undefined): Handshape {
    if (!handshape) {
        return {
            configuration: {},
            movement: {
                amplitude: 1.0,
                speed: 1.0,
                fluidity: 0.5
            }
        };
    }

    const result = { ...handshape };

    if (!result.configuration) {
        result.configuration = {};
    }

    if (!result.movement) {
        result.movement = {
            amplitude: 1.0,
            speed: 1.0,
            fluidity: 0.5
        };
    } else {
        const movement = result.movement;
        if (typeof movement.amplitude !== 'number') {
            movement.amplitude = 1.0;
        }
        if (typeof movement.speed !== 'number') {
            movement.speed = 1.0;
        }
        if (typeof movement.fluidity !== 'number') {
            movement.fluidity = 0.5;
        }
    }

    return result;
}

/**
 * Convertit une expression de base en type étendu pour le traitement
 * @param expression Expression de base
 * @returns Expression étendue
 */
export function toExtendedExpression(expression: LSFExpression): LSFExpression {
    // Créer une copie de l'expression et s'assurer que toutes les propriétés existent
    const extendedExpression = deepCopy(expression);

    // S'assurer que toutes les propriétés de base LSFExpression existent
    if (!extendedExpression.id) {
        extendedExpression.id = `expression-${Date.now()}`;
    }

    if (!extendedExpression.type) {
        extendedExpression.type = 'standard';
    }

    // S'assurer que toutes les propriétés étendues sont présentes
    if (!extendedExpression.eyebrows) {
        extendedExpression.eyebrows = {
            position: 0,
            shape: 0
        };
    }

    if (!extendedExpression.mouth) {
        extendedExpression.mouth = {
            openness: 0,
            shape: 0
        };
    }

    if (!extendedExpression.eyes) {
        extendedExpression.eyes = {
            gaze: 0,
            openness: 0
        };
    }

    if (!extendedExpression.handshape) {
        extendedExpression.handshape = {};
    }

    if (!extendedExpression.location) {
        extendedExpression.location = {
            coordinates: { x: 0, y: 0 }
        };
    } else if (!extendedExpression.location.coordinates) {
        extendedExpression.location.coordinates = { x: 0, y: 0 };
    }

    if (!extendedExpression.timing) {
        extendedExpression.timing = {};
    }

    if (!extendedExpression.metadata) {
        extendedExpression.metadata = {};
    }

    return extendedExpression;
}

/**
 * Convertit une expression étendue en type de base pour la sortie
 * @param expression Expression étendue
 * @returns Expression de base
 */
export function toBaseExpression(expression: LSFExpression): LSFExpression {
    // Créer une copie de l'expression
    const baseExpression = deepCopy(expression);

    // Supprimer les propriétés vides pour réduire la taille
    if (baseExpression.eyebrows && Object.keys(baseExpression.eyebrows).length === 0) {
        delete baseExpression.eyebrows;
    }

    if (baseExpression.mouth && Object.keys(baseExpression.mouth).length === 0) {
        delete baseExpression.mouth;
    }

    if (baseExpression.eyes && Object.keys(baseExpression.eyes).length === 0) {
        delete baseExpression.eyes;
    }

    if (baseExpression.handshape && Object.keys(baseExpression.handshape).length === 0) {
        delete baseExpression.handshape;
    }

    if (baseExpression.timing && Object.keys(baseExpression.timing).length === 0) {
        delete baseExpression.timing;
    }

    if (baseExpression.metadata && Object.keys(baseExpression.metadata).length === 0) {
        delete baseExpression.metadata;
    }

    return baseExpression;
}

/**
 * Convertit un record générique en composant spécifique pour les sourcils
 * Garantit que toutes les propriétés requises sont présentes
 * @param record Record source
 * @returns Composant sourcils typé
 */
export function toEyebrowComponent(record: Record<string, number>): CustomEyebrowComponent {
    return {
        position: record.position || 0,
        shape: record.shape || 0,
        ...record
    };
}

/**
 * Convertit un record générique en composant spécifique pour la bouche
 * Garantit que toutes les propriétés requises sont présentes
 * @param record Record source
 * @returns Composant bouche typé
 */
export function toMouthComponent(record: Record<string, number>): CustomMouthComponent {
    return {
        openness: record.openness || 0,
        shape: record.shape || 0,
        ...record
    };
}

/**
 * Convertit un record générique en composant spécifique pour les yeux
 * Garantit que toutes les propriétés requises sont présentes
 * @param record Record source
 * @returns Composant yeux typé
 */
export function toEyeComponent(record: Record<string, number>): CustomEyeComponent {
    return {
        gaze: record.gaze || 0,
        openness: record.openness || 0,
        ...record
    };
}