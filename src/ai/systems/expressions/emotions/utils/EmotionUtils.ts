// src/ai/systems/expressions/emotions/utils/EmotionUtils.ts

import { LSFExpression } from '../../lsf/types';

/**
 * Classe utilitaire pour les opérations communes sur les émotions
 */
export class EmotionUtils {
    /**
     * Effectue une copie profonde d'un objet
     * @param obj Objet à copier
     * @returns Copie profonde de l'objet
     */
    public static deepCopy<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Mélange deux expressions avec un ratio donné
     * @param target Expression cible
     * @param source Expression source
     * @param ratio Ratio de mélange (0-1)
     */
    public static blendExpressions(target: LSFExpression, source: LSFExpression, ratio: number): void {
        // Vérifier que le ratio est entre 0 et 1
        const blendRatio = Math.max(0, Math.min(1, ratio));
        const inverseRatio = 1 - blendRatio;

        // Mélanger les composantes faciales
        for (const component of ['eyebrows', 'eyes', 'mouth']) {
            if (target[component] && source[component]) {
                for (const param in target[component]) {
                    if (param in source[component]) {
                        target[component][param] =
                            target[component][param] * inverseRatio +
                            source[component][param] * blendRatio;
                    }
                }

                // Ajouter les paramètres qui existent dans source mais pas dans target
                for (const param in source[component]) {
                    if (!(param in target[component])) {
                        target[component][param] = source[component][param] * blendRatio;
                    }
                }
            }
        }

        // Mélanger les composantes corporelles
        if (target.body && source.body) {
            // Mélanger la posture
            if (target.body.posture && source.body.posture) {
                for (const param in target.body.posture) {
                    if (param in source.body.posture) {
                        target.body.posture[param] =
                            target.body.posture[param] * inverseRatio +
                            source.body.posture[param] * blendRatio;
                    }
                }

                for (const param in source.body.posture) {
                    if (!(param in target.body.posture)) {
                        target.body.posture[param] = source.body.posture[param] * blendRatio;
                    }
                }
            }

            // Mélanger le mouvement
            if (target.body.movement && source.body.movement) {
                for (const param in target.body.movement) {
                    if (param in source.body.movement) {
                        target.body.movement[param] =
                            target.body.movement[param] * inverseRatio +
                            source.body.movement[param] * blendRatio;
                    }
                }

                for (const param in source.body.movement) {
                    if (!(param in target.body.movement)) {
                        target.body.movement[param] = source.body.movement[param] * blendRatio;
                    }
                }
            }
        }

        // Mélanger l'intensité globale
        if (source.intensity !== undefined && target.intensity !== undefined) {
            target.intensity = target.intensity * inverseRatio + source.intensity * blendRatio;
        }
    }

    /**
     * Normalise une valeur entre 0 et 1
     * @param value Valeur à normaliser
     * @returns Valeur normalisée
     */
    public static normalizeValue(value: number): number {
        return Math.max(0, Math.min(1, value));
    }

    /**
     * Calcule la moyenne des valeurs numériques d'un objet
     * @param obj Objet avec des valeurs numériques
     * @returns Moyenne des valeurs ou 0 si objet vide
     */
    public static getAverageValue(obj: Record<string, unknown>): number {
        const values = Object.values(obj).filter(v => typeof v === 'number') as number[];
        if (values.length === 0) return 0;
        return values.reduce((a, b) => a + b, 0) / values.length;
    }

    /**
     * Ajuste toutes les valeurs numériques d'un objet par un facteur
     * @param obj Objet à ajuster
     * @param factor Facteur d'ajustement
     */
    public static adjustValues(obj: Record<string, unknown>, factor: number): void {
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && typeof obj[key] === 'number') {
                obj[key] = (obj[key] as number) * factor;
            }
        }
    }

    /**
     * Génère une valeur interpolée entre deux valeurs
     * @param start Valeur de départ
     * @param end Valeur de fin
     * @param factor Facteur d'interpolation (0-1)
     * @returns Valeur interpolée
     */
    public static interpolate(start: number, end: number, factor: number): number {
        const normalizedFactor = Math.max(0, Math.min(1, factor));
        return start + (end - start) * normalizedFactor;
    }
}