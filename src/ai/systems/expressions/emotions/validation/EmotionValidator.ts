// src/ai/systems/expressions/emotions/validation/EmotionValidator.ts

import { LSFExpression } from '../../lsf/types';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

/**
 * Interface pour les propriétés émotionnelles d'une expression LSF
 */
export interface EmotionalProperties {
    /**
     * Intensité globale de l'expression
     */
    intensity?: number;
}

/**
 * Type combiné pour une expression LSF avec propriétés émotionnelles
 */
export type EmotionalLSFExpression = LSFExpression & EmotionalProperties;

/**
 * Classe responsable de la validation des expressions LSF
 * Vérifie que les expressions sont bien formées et complètes
 */
export class EmotionValidator {
    private performanceMonitor: PerformanceMonitor;

    constructor() {
        this.performanceMonitor = new PerformanceMonitor();
    }

    /**
     * Valide une expression LSF
     * @param expression Expression à valider
     * @returns Résultat de la validation
     */
    async validateExpression(expression: EmotionalLSFExpression): Promise<{ isValid: boolean; errors: string[] }> {
        const startTime = performance.now();

        const errors: string[] = [];

        // Vérifier les composantes faciales
        if (!expression.eyebrows || Object.keys(expression.eyebrows).length === 0) {
            errors.push("Composante 'eyebrows' manquante ou vide");
        }

        if (!expression.eyes || Object.keys(expression.eyes).length === 0) {
            errors.push("Composante 'eyes' manquante ou vide");
        }

        if (!expression.mouth || Object.keys(expression.mouth).length === 0) {
            errors.push("Composante 'mouth' manquante ou vide");
        }

        // Vérifier la configuration temporelle
        if (!expression.timing) {
            errors.push("Configuration temporelle manquante");
        } else {
            if (expression.timing.duration === undefined) {
                errors.push("Durée totale non spécifiée");
            }

            if (expression.timing.onset === undefined) {
                errors.push("Temps d'apparition non spécifié");
            }
        }

        // Vérifier l'intensité
        if (expression.intensity === undefined) {
            errors.push("Intensité globale non spécifiée");
        } else if (expression.intensity < 0 || expression.intensity > 1) {
            errors.push("Intensité hors limites (doit être entre 0 et 1)");
        }

        const result = {
            isValid: errors.length === 0,
            errors
        };

        // Enregistrer les métriques de performance
        const endTime = performance.now();
        this.performanceMonitor.recordOperation('validateExpression', endTime - startTime);

        return result;
    }

    /**
     * Vérifie si l'expression est complète et utilisable
     * @param expression Expression à vérifier
     * @returns True si l'expression est complète
     */
    isExpressionComplete(expression: EmotionalLSFExpression): boolean {
        return !!(
            expression.eyebrows &&
            expression.eyes &&
            expression.mouth &&
            expression.timing &&
            expression.timing.duration !== undefined &&
            expression.intensity !== undefined
        );
    }

    /**
     * Vérifie si les valeurs numériques sont dans les limites acceptables
     * @param expression Expression à vérifier
     * @returns True si les valeurs sont valides
     */
    hasValidNumericValues(expression: EmotionalLSFExpression): boolean {
        // Vérifier l'intensité
        if (expression.intensity === undefined || expression.intensity < 0 || expression.intensity > 1) {
            return false;
        }

        // Vérifier que toutes les valeurs sont des nombres finis
        const checkComponentValues = <T>(component: T | undefined): boolean => {
            if (!component) return true; // Aucun problème si le composant n'existe pas

            // Vérifier récursivement toutes les propriétés numériques
            for (const key in component) {
                const value = (component as Record<string, unknown>)[key];
                if (typeof value === 'number' && !isFinite(value)) {
                    return false;
                } else if (typeof value === 'object' && value !== null) {
                    // Vérifier récursivement les objets imbriqués
                    if (!checkComponentValues(value as Record<string, unknown>)) {
                        return false;
                    }
                }
            }
            return true;
        };

        return (
            checkComponentValues(expression.eyebrows) &&
            checkComponentValues(expression.eyes) &&
            checkComponentValues(expression.mouth) &&
            checkComponentValues(expression.timing)
        );
    }
}