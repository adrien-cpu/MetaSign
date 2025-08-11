// src/ai/systems/expressions/emotions/validation/CoherenceValidator.ts

import { EmotionInput } from '../base/types';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';
import {
    EmotionalLSFExpression,
    FacialCoherenceResult,
    BodyCoherenceResult,
    CoherenceResult
} from '../types/emotional-expression.types';

/**
 * Classe responsable de vérifier la cohérence émotionnelle des expressions
 * S'assure que les différentes composantes sont cohérentes entre elles et avec le type d'émotion
 */
export class CoherenceValidator {
    private performanceMonitor: PerformanceMonitor;

    constructor() {
        this.performanceMonitor = new PerformanceMonitor();
    }

    /**
     * Vérifie la cohérence émotionnelle d'une expression
     * @param expression Expression émotionnelle à vérifier
     * @param emotion Émotion attendue
     * @returns Résultat de la vérification
     */
    async checkEmotionalCoherence(
        expression: EmotionalLSFExpression,
        emotion: EmotionInput
    ): Promise<CoherenceResult> {
        const startTime = performance.now();
        const issues: string[] = [];

        // Vérifier la cohérence du type d'émotion
        if (expression.emotionType !== emotion.type) {
            issues.push(`Type d'émotion incohérent: attendu ${emotion.type}, trouvé ${expression.emotionType}`);
        }

        // Calcul de l'intensité de l'expression (puisque intensity n'existe pas sur LSFExpression)
        const expressionIntensity = this.calculateOverallIntensity(expression);

        // Vérifier la cohérence de l'intensité
        if (Math.abs(expressionIntensity - emotion.intensity) > 0.2) {
            issues.push(`Intensité incohérente: attendue ${emotion.intensity}, trouvée ${expressionIntensity.toFixed(2)}`);
        }

        // Vérifier la cohérence des composantes faciales selon le type d'émotion
        const facialCoherence = this.checkFacialCoherence(expression, emotion.type);
        if (!facialCoherence.isCoherent) {
            issues.push(...facialCoherence.issues);
        }

        // Vérifier la cohérence des composantes corporelles
        const bodyCoherence = this.checkBodyCoherence(expression, emotion.type);
        if (!bodyCoherence.isCoherent) {
            issues.push(...bodyCoherence.issues);
        }

        // Vérifier la cohérence entre les composantes faciales et corporelles
        const crossCoherence = this.checkFacialBodyCoherence(expression);
        if (!crossCoherence.isCoherent) {
            issues.push(...crossCoherence.issues);
        }

        const result = {
            isCoherent: issues.length === 0,
            issues
        };

        // Enregistrer les métriques de performance
        const endTime = performance.now();
        this.performanceMonitor.recordOperation('checkEmotionalCoherence', endTime - startTime);

        return result;
    }

    /**
     * Calcule l'intensité globale de l'expression en combinant les intensités faciales et corporelles
     * @param expression Expression LSF émotionnelle
     * @returns Intensité globale calculée
     */
    private calculateOverallIntensity(expression: EmotionalLSFExpression): number {
        const facialIntensity = this.calculateFacialIntensity(expression);
        const bodyIntensity = this.calculateBodyIntensity(expression);

        // Moyenne pondérée donnant plus d'importance à l'expression faciale
        return facialIntensity * 0.7 + bodyIntensity * 0.3;
    }

    /**
     * Vérifie la cohérence entre les composantes faciales
     * @param expression Expression à vérifier
     * @param emotionType Type d'émotion
     * @returns Résultat de cohérence faciale
     */
    private checkFacialCoherence(
        expression: EmotionalLSFExpression,
        emotionType: string
    ): FacialCoherenceResult {
        const issues: string[] = [];
        const { mouth, eyebrows, eyes } = expression;

        // Vérification spécifique selon le type d'émotion
        switch (emotionType.toLowerCase()) {
            case 'joy':
                if (mouth?.smiling !== undefined && mouth.smiling < 0.5) {
                    issues.push("Expression de joie avec un sourire insuffisant");
                }
                if (eyebrows?.raised !== undefined && eyebrows.raised < 0.3) {
                    issues.push("Expression de joie avec des sourcils trop bas");
                }
                break;

            case 'sadness':
                if (mouth?.smiling !== undefined && mouth.smiling > 0.4) {
                    issues.push("Expression de tristesse avec un sourire trop prononcé");
                }
                if (eyes?.openness !== undefined && typeof eyes.openness === 'number' && eyes.openness > 0.7) {
                    issues.push("Expression de tristesse avec des yeux trop ouverts");
                }
                break;

            case 'anger':
                if (eyebrows?.furrowed !== undefined && eyebrows.furrowed < 0.5) {
                    issues.push("Expression de colère avec des sourcils insuffisamment froncés");
                }
                if (mouth?.tension !== undefined && mouth.tension < 0.6) {
                    issues.push("Expression de colère avec une bouche insuffisamment tendue");
                }
                break;

            case 'surprise':
                if (eyebrows?.raised !== undefined && eyebrows.raised < 0.6) {
                    issues.push("Expression de surprise avec des sourcils insuffisamment levés");
                }
                if (eyes?.openness !== undefined && typeof eyes.openness === 'number' && eyes.openness < 0.7) {
                    issues.push("Expression de surprise avec des yeux insuffisamment ouverts");
                }
                break;

            case 'fear':
                if (eyebrows?.raised !== undefined && eyebrows.raised < 0.5) {
                    issues.push("Expression de peur avec des sourcils insuffisamment levés");
                }
                if (eyes?.openness !== undefined && typeof eyes.openness === 'number' && eyes.openness < 0.7) {
                    issues.push("Expression de peur avec des yeux insuffisamment ouverts");
                }
                break;

            case 'disgust':
                if (mouth?.corners !== undefined && mouth.corners > 0.3) {
                    issues.push("Expression de dégoût avec des coins de bouche trop hauts");
                }
                break;
        }

        return {
            isCoherent: issues.length === 0,
            issues
        };
    }

    /**
     * Vérifie la cohérence entre les composantes corporelles
     * @param expression Expression à vérifier
     * @param emotionType Type d'émotion
     * @returns Résultat de cohérence corporelle
     */
    private checkBodyCoherence(
        expression: EmotionalLSFExpression,
        emotionType: string
    ): BodyCoherenceResult {
        const issues: string[] = [];
        const { body } = expression;

        // S'assurer que body existe
        if (!body || !body.posture) {
            return { isCoherent: true, issues: [] };
        }

        const { posture } = body;

        // Vérification spécifique selon le type d'émotion
        switch (emotionType.toLowerCase()) {
            case 'joy':
                if (posture.upright !== undefined && typeof posture.upright === 'number' && posture.upright < 0.5) {
                    issues.push("Expression corporelle de joie avec une posture trop affaissée");
                }
                break;

            case 'sadness':
                if (posture.upright !== undefined && typeof posture.upright === 'number' && posture.upright > 0.7) {
                    issues.push("Expression corporelle de tristesse avec une posture trop droite");
                }
                break;

            case 'anger':
                if (posture.tension !== undefined && typeof posture.tension === 'number' && posture.tension < 0.6) {
                    issues.push("Expression corporelle de colère avec une tension insuffisante");
                }
                break;

            case 'fear':
                if (posture.tension !== undefined && typeof posture.tension === 'number' && posture.tension < 0.5) {
                    issues.push("Expression corporelle de peur avec une tension insuffisante");
                }
                break;
        }

        return {
            isCoherent: issues.length === 0,
            issues
        };
    }

    /**
     * Vérifie la cohérence entre les expressions faciales et corporelles
     * @param expression Expression à vérifier
     * @returns Résultat de cohérence croisée
     */
    private checkFacialBodyCoherence(
        expression: EmotionalLSFExpression
    ): CoherenceResult {
        const issues: string[] = [];

        // Si pas de composantes corporelles, on n'a pas d'incohérence
        if (!expression.body) {
            return { isCoherent: true, issues: [] };
        }

        // Vérifier l'alignement des intensités
        const facialIntensity = this.calculateFacialIntensity(expression);
        const bodyIntensity = this.calculateBodyIntensity(expression);

        // Si l'écart est trop important, on a une incohérence
        if (Math.abs(facialIntensity - bodyIntensity) > 0.3) {
            issues.push(`Incohérence d'intensité entre l'expression faciale (${facialIntensity.toFixed(2)}) et corporelle (${bodyIntensity.toFixed(2)})`);
        }

        return {
            isCoherent: issues.length === 0,
            issues
        };
    }

    /**
     * Extrait les valeurs numériques d'un objet
     * @param obj Objet contenant potentiellement des valeurs numériques
     * @returns Tableau de valeurs numériques
     */
    private extractNumericValues(obj: Record<string, unknown> | undefined): number[] {
        if (!obj) return [];
        return Object.values(obj)
            .filter(value => typeof value === 'number') as number[];
    }

    /**
     * Calcule la moyenne d'un tableau de nombres
     * @param values Tableau de nombres
     * @returns Moyenne ou 0 si le tableau est vide
     */
    private calculateAverage(values: number[]): number {
        if (values.length === 0) return 0;
        return values.reduce((sum, value) => sum + value, 0) / values.length;
    }

    /**
     * Calcule l'intensité moyenne des composantes faciales
     * @param expression Expression LSF émotionnelle
     * @returns Intensité faciale moyenne
     */
    private calculateFacialIntensity(expression: EmotionalLSFExpression): number {
        let sum = 0;
        let count = 0;

        // Calculer la moyenne des composantes faciales
        const eyebrowsValues = this.extractNumericValues(expression.eyebrows);
        if (eyebrowsValues.length > 0) {
            sum += this.calculateAverage(eyebrowsValues);
            count++;
        }

        const eyesValues = this.extractNumericValues(expression.eyes);
        if (eyesValues.length > 0) {
            sum += this.calculateAverage(eyesValues);
            count++;
        }

        const mouthValues = this.extractNumericValues(expression.mouth);
        if (mouthValues.length > 0) {
            sum += this.calculateAverage(mouthValues);
            count++;
        }

        return count > 0 ? sum / count : 0;
    }

    /**
     * Calcule l'intensité moyenne des composantes corporelles
     * @param expression Expression LSF émotionnelle
     * @returns Intensité corporelle moyenne
     */
    private calculateBodyIntensity(expression: EmotionalLSFExpression): number {
        if (!expression.body) {
            return 0;
        }

        let sum = 0;
        let count = 0;

        // Calculer la moyenne des composantes corporelles
        const postureValues = this.extractNumericValues(expression.body.posture);
        if (postureValues.length > 0) {
            sum += this.calculateAverage(postureValues);
            count++;
        }

        const movementValues = this.extractNumericValues(expression.body.movement);
        if (movementValues.length > 0) {
            sum += this.calculateAverage(movementValues);
            count++;
        }

        return count > 0 ? sum / count : 0;
    }
}