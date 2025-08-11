// src/ai/systems/expressions/emotions/base/EmotionGenerator.ts (mise à jour)

import {
    EmotionInput,
    EmotionResult,
    AnalyzedEmotion,
    EmotionalNuances,
    LSFExpression
} from './types';
import { EmotionAnalyzer } from './EmotionAnalyzer';
import { EmotionValidator } from '../validation/EmotionValidator';
import { CoherenceValidator } from '../validation/CoherenceValidator';
import { EmotionUtils } from '../utils/EmotionUtils';
import { FacialComponentsManager } from '../components/FacialComponentsManager';
import { BodyComponentsManager } from '../components/BodyComponentsManager';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

// Ajout des interfaces nécessaires
interface EmotionalComponent {
    parameters: Record<string, number>;
    intensity: number;
}

interface FacialComponent extends EmotionalComponent {
    type: 'eyebrows' | 'eyes' | 'mouth';
}

interface BodyComponent extends EmotionalComponent {
    type: 'posture' | 'movement';
}

/**
 * Classe responsable de la génération d'expressions LSF à partir d'émotions
 */
export class EmotionGenerator {
    private emotionAnalyzer: EmotionAnalyzer;
    private emotionValidator: EmotionValidator;
    private coherenceValidator: CoherenceValidator;
    private facialComponentsManager: FacialComponentsManager;
    private bodyComponentsManager: BodyComponentsManager;
    private performanceMonitor: PerformanceMonitor;

    constructor() {
        this.emotionAnalyzer = new EmotionAnalyzer();
        this.emotionValidator = new EmotionValidator();
        this.coherenceValidator = new CoherenceValidator();
        this.facialComponentsManager = new FacialComponentsManager();
        this.bodyComponentsManager = new BodyComponentsManager();
        this.performanceMonitor = new PerformanceMonitor();
    }

    /**
     * Génère une expression LSF pour une émotion donnée
     */
    public async generateExpression(emotion: EmotionInput): Promise<EmotionResult> {
        const startTime = performance.now();

        try {
            // Analyser l'émotion
            const analyzedEmotion = await this.emotionAnalyzer.analyzeEmotion(emotion);

            // Appliquer les ajustements contextuels si disponibles
            if (emotion.context) {
                this.emotionAnalyzer.applyContextualAdjustments(analyzedEmotion, emotion.context);
            }

            // Créer l'expression de base
            let expression = this.createBaseExpression(analyzedEmotion);

            // Appliquer les nuances si disponibles
            if (emotion.nuances) {
                expression = await this.applyNuances(expression, emotion.nuances);
            }

            // Valider l'expression
            const validation = await this.emotionValidator.validateExpression(expression);
            if (!validation.isValid) {
                return this.createErrorResult(expression, validation.errors);
            }

            // Vérifier la cohérence émotionnelle
            const coherence = await this.coherenceValidator.checkEmotionalCoherence(expression, emotion);

            // Résultat final
            const endTime = performance.now();
            this.performanceMonitor.recordOperation('generateExpression', endTime - startTime);

            return {
                expression,
                metrics: {
                    authenticity: analyzedEmotion.metrics.authenticity,
                    culturalAccuracy: analyzedEmotion.metrics.culturalAccuracy,
                    expressiveness: analyzedEmotion.metrics.expressiveness,
                    coherence: coherence.isCoherent ? 1.0 : 0.7
                },
                issues: coherence.isCoherent ? [] : coherence.issues,
                success: true
            };
        } catch (error) {
            // Gérer les erreurs
            const endTime = performance.now();
            this.performanceMonitor.recordOperation('generateExpression-error', endTime - startTime);

            return this.createErrorResult({} as LSFExpression,
                [`Erreur lors de la génération: ${error instanceof Error ? error.message : String(error)}`]);
        }
    }

    /**
     * Crée une expression LSF de base à partir d'une analyse émotionnelle
     * @param analyzedEmotion Analyse émotionnelle
     * @returns Expression LSF
     */
    private createBaseExpression(analyzedEmotion: AnalyzedEmotion): LSFExpression {
        const startTime = performance.now();

        // Créer une nouvelle expression LSF
        const expression: LSFExpression = {
            // Composantes faciales
            eyebrows: this.mapFacialComponentToLSF(analyzedEmotion.facialComponents.eyebrows),
            eyes: this.mapFacialComponentToLSF(analyzedEmotion.facialComponents.eyes),
            mouth: this.mapFacialComponentToLSF(analyzedEmotion.facialComponents.mouth),

            // Composantes corporelles
            body: {
                posture: analyzedEmotion.bodyComponents.posture
                    ? this.mapBodyComponentToLSF(analyzedEmotion.bodyComponents.posture)
                    : {},
                movement: this.createBodyMovement(analyzedEmotion)
            },

            // Configuration temporelle
            timing: {
                duration: analyzedEmotion.timing.totalDuration,
                onset: analyzedEmotion.timing.onset,
                hold: analyzedEmotion.timing.apex - analyzedEmotion.timing.onset,
                release: analyzedEmotion.timing.totalDuration - analyzedEmotion.timing.apex
            },

            // Métadonnées
            intensity: analyzedEmotion.calibratedIntensity,
            emotionType: analyzedEmotion.baseType,
            metadata: {
                authenticity: analyzedEmotion.metrics.authenticity,
                culturalAccuracy: analyzedEmotion.metrics.culturalAccuracy,
                expressiveness: analyzedEmotion.metrics.expressiveness
            }
        };

        // Enregistrer les métriques de performance
        const endTime = performance.now();
        this.performanceMonitor.recordOperation('createBaseExpression', endTime - startTime);

        return expression;
    }

    /**
     * Applique des nuances à une expression
     * @param expression Expression de base
     * @param nuances Nuances à appliquer
     * @returns Expression avec nuances
     */
    private async applyNuances(expression: LSFExpression, nuances: EmotionalNuances): Promise<LSFExpression> {
        const startTime = performance.now();

        // Créer une copie de l'expression
        const nuancedExpression = EmotionUtils.deepCopy(expression);

        // Appliquer la subtilité si spécifiée
        if (nuances.subtlety !== undefined) {
            // Ajuster l'intensité globale
            nuancedExpression.intensity *= (1 - nuances.subtlety * 0.5);

            // Ajuster les composantes faciales et corporelles
            this.facialComponentsManager.reduceFacialComponentsIntensity(
                {
                    eyebrows: nuancedExpression.eyebrows,
                    eyes: nuancedExpression.eyes,
                    mouth: nuancedExpression.mouth
                } as Record<string, FacialComponent>,
                nuances.subtlety
            );

            this.bodyComponentsManager.reduceBodyComponentsIntensity(
                {
                    posture: nuancedExpression.body?.posture,
                    movement: nuancedExpression.body?.movement
                } as Record<string, BodyComponent>,
                nuances.subtlety
            );
        }

        // Appliquer l'emphase faciale vs corporelle
        if (nuances.facialVsBodyEmphasis !== undefined) {
            this.applyFacialBodyEmphasis(nuancedExpression, nuances.facialVsBodyEmphasis);
        }

        // Mélanger avec une émotion secondaire si spécifiée
        if (nuances.secondaryEmotion) {
            await this.blendWithSecondaryEmotion(nuancedExpression, nuances.secondaryEmotion);
        }

        const endTime = performance.now();
        this.performanceMonitor.recordOperation('applyNuances', endTime - startTime);

        return nuancedExpression;
    }

    /**
     * Applique une emphase différentielle entre expressions faciales et corporelles
     * @param expression Expression à modifier
     * @param emphasis Emphase (0 = corps, 1 = visage)
     */
    private applyFacialBodyEmphasis(expression: LSFExpression, emphasis: number): void {
        // emphasis: 0 = corps, 1 = visage

        // Facteurs d'ajustement
        const facialFactor = 0.5 + emphasis * 0.5; // 0.5 à 1.0
        const bodyFactor = 1.5 - emphasis * 0.5; // 1.0 à 0.5

        // Ajuster les composantes faciales
        for (const component of ['eyebrows', 'eyes', 'mouth']) {
            if (expression[component]) {
                EmotionUtils.adjustValues(expression[component], facialFactor);
            }
        }

        // Ajuster les composantes corporelles
        if (expression.body) {
            if (expression.body.posture) {
                EmotionUtils.adjustValues(expression.body.posture, bodyFactor);
            }

            if (expression.body.movement) {
                EmotionUtils.adjustValues(expression.body.movement, bodyFactor);
            }
        }
    }

    /**
     * Mélange l'expression avec une émotion secondaire
     * @param expression Expression à modifier
     * @param secondary Émotion secondaire
     */
    private async blendWithSecondaryEmotion(
        expression: LSFExpression,
        secondary: { type: string; blendRatio: number }
    ): Promise<void> {
        const startTime = performance.now();

        // Créer une émotion secondaire temporaire
        const secondaryEmotion: EmotionInput = {
            type: secondary.type,
            intensity: expression.intensity // Même intensité que l'émotion principale
        };

        // Générer l'expression pour l'émotion secondaire
        const secondaryResult = await this.generateExpression(secondaryEmotion);

        if (secondaryResult.success) {
            // Mélanger les expressions
            EmotionUtils.blendExpressions(expression, secondaryResult.expression, secondary.blendRatio);
        }

        const endTime = performance.now();
        this.performanceMonitor.recordOperation('blendWithSecondaryEmotion', endTime - startTime);
    }

    /**
     * Convertit une composante émotionnelle en valeurs LSF
     * @param component Composante émotionnelle
     * @returns Propriétés de composante d'expression
     */
    private mapFacialComponentToLSF(component: FacialComponent): Record<string, number> {
        const result: Record<string, number> = {};

        for (const param in component.parameters) {
            if (Object.prototype.hasOwnProperty.call(component.parameters, param)) {
                result[param] = component.parameters[param] * component.intensity;
            }
        }

        return result;
    }

    /**
     * Convertit une composante corporelle en valeurs LSF
     * @param component Composante corporelle
     * @returns Propriétés de composante d'expression
     */
    private mapBodyComponentToLSF(component: BodyComponent): Record<string, number> {
        return this.mapFacialComponentToLSF(component as FacialComponent);
    }

    // Types pour les valeurs de mouvement
    interface MovementProperties {
    intensity: number;
    speed: number;
    fluidity: number;
    tension?: number;
}

    /**
     * Crée une description du mouvement corporel
     * @param analyzedEmotion Émotion analysée
     * @returns Propriétés de mouvement
     */
    private createBodyMovement(analyzedEmotion: AnalyzedEmotion): MovementProperties {
    const movement: MovementProperties = {
        intensity: analyzedEmotion.calibratedIntensity,
        speed: 1.0,
        fluidity: 0.7
    };

    switch (analyzedEmotion.baseType.toLowerCase()) {
        case 'joy':
            movement.speed = 1.2;
            movement.fluidity = 0.8;
            break;
        case 'anger':
            movement.speed = 1.3;
            movement.fluidity = 0.5;
            movement.tension = 0.8;
            break;
        case 'sadness':
            movement.speed = 0.7;
            movement.fluidity = 0.6;
            break;
    }

    // Ajuster selon l'intensité globale
    Object.keys(movement).forEach(key => {
        if (key !== 'intensity') {
            (movement as Record<string, number>)[key] *= analyzedEmotion.calibratedIntensity;
        }
    });

    return movement;
}

    /**
     * Crée un résultat d'erreur
     * @param expression Expression (peut être vide)
     * @param issues Problèmes détectés
     * @returns Résultat d'erreur
     */
    private createErrorResult(expression: LSFExpression, issues: string[]): EmotionResult {
    return {
        expression,
        metrics: {
            authenticity: 0,
            culturalAccuracy: 0,
            expressiveness: 0,
            coherence: 0
        },
        issues,
        success: false
    };
}
}