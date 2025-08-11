// src/ai/systems/expressions/emotions/SystemeEmotionnel.ts
import { LSFExpression } from '../../../types';
import { EmotionType, ValidationResult, ValidationIssue } from './syntax/types';

/**
 * Interfaces pour les paramètres des composantes émotionnelles
 */
interface EmotionComponentParameters {
    [key: string]: number;
}

interface FacialComponents {
    eyebrows: EmotionComponentParameters;
    mouth: EmotionComponentParameters;
    eyes: EmotionComponentParameters;
}

interface BodyComponents {
    posture: EmotionComponentParameters;
    movement: EmotionComponentParameters;
}

interface HandComponents {
    tension: number;
    speed: number;
    fluidity: number;
    trembling?: number;
    suddenness?: number;
    [key: string]: number | undefined;
}

interface EmotionParameters {
    facialComponents: FacialComponents;
    bodyComponents: BodyComponents;
    handComponents: HandComponents;
}

/**
 * Détails de validation pour les composantes
 */
interface ValidationDetails {
    expected: EmotionComponentParameters;
    actual: EmotionComponentParameters;
    missing: string[];
    differences: Record<string, { expected: number; actual: number; diff: number }>;
}

/**
 * Système de gestion des émotions selon le diagramme d'état
 */
export class SystemeEmotionnel {
    private readonly EMOTION_PARAMETERS: Record<string, EmotionParameters> = {
        JOY: {
            facialComponents: {
                eyebrows: { raised: 0.5, inner: 0.3 },
                mouth: { smiling: 0.8, open: 0.3 },
                eyes: { openness: 0.6 }
            },
            bodyComponents: {
                posture: { openness: 0.7, tension: 0.3 },
                movement: { speed: 1.2, amplitude: 1.2 }
            },
            handComponents: {
                tension: 0.3,
                speed: 1.2,
                fluidity: 0.8
            }
        },
        ANGER: {
            facialComponents: {
                eyebrows: { lowered: 0.8, inner: 0.2 },
                mouth: { tightened: 0.7, open: 0.2 },
                eyes: { openness: 0.7, squint: 0.6 }
            },
            bodyComponents: {
                posture: { openness: 0.4, tension: 0.8 },
                movement: { speed: 1.3, amplitude: 1.3, tension: 0.8 }
            },
            handComponents: {
                tension: 0.8,
                speed: 1.3,
                fluidity: 0.5
            }
        },
        SADNESS: {
            facialComponents: {
                eyebrows: { raised: 0.1, inner: 0.8 },
                mouth: { smiling: 0, open: 0.1, corners: -0.7 },
                eyes: { openness: 0.4 }
            },
            bodyComponents: {
                posture: { openness: 0.3, tension: 0.2 },
                movement: { speed: 0.8, amplitude: 0.8 }
            },
            handComponents: {
                tension: 0.2,
                speed: 0.8,
                fluidity: 0.6
            }
        },
        FEAR: {
            facialComponents: {
                eyebrows: { raised: 0.7, inner: 0.7 },
                mouth: { open: 0.4, tightened: 0.5 },
                eyes: { openness: 0.8, widen: 0.7 }
            },
            bodyComponents: {
                posture: { openness: 0.2, tension: 0.7 },
                movement: { speed: 1.1, amplitude: 0.9, trembling: 0.6 }
            },
            handComponents: {
                tension: 0.7,
                speed: 1.1,
                fluidity: 0.4,
                trembling: 0.6
            }
        },
        SURPRISE: {
            facialComponents: {
                eyebrows: { raised: 0.9, inner: 0.5 },
                mouth: { open: 0.8, round: 0.7 },
                eyes: { openness: 0.9 }
            },
            bodyComponents: {
                posture: { openness: 0.6, tension: 0.5 },
                movement: { speed: 1.2, amplitude: 1.1, suddenness: 0.8 }
            },
            handComponents: {
                tension: 0.5,
                speed: 1.2,
                fluidity: 0.7,
                suddenness: 0.8
            }
        },
        NEUTRAL: {
            facialComponents: {
                eyebrows: { raised: 0, inner: 0 },
                mouth: { smiling: 0, open: 0 },
                eyes: { openness: 0.5 }
            },
            bodyComponents: {
                posture: { openness: 0.5, tension: 0.5 },
                movement: { speed: 1.0, amplitude: 1.0 }
            },
            handComponents: {
                tension: 0.5,
                speed: 1.0,
                fluidity: 0.5
            }
        }
    };

    /**
     * Applique une émotion avec une intensité spécifiée
     */
    async applyEmotion(emotion: EmotionType, intensity: number): Promise<boolean> {
        try {
            // Récupérer les paramètres de l'émotion
            const emotionParams = this.getEmotionParameters(emotion);
            if (!emotionParams) {
                console.error(`Émotion non reconnue: ${emotion}`);
                return false;
            }

            // Ajuster l'intensité
            const adjustedParams = this.adjustEmotionIntensity(emotionParams, intensity);

            // Créer une expression LSF basée sur l'émotion
            const expression = this.createEmotionalExpression(adjustedParams);

            // Appliquer l'expression
            await this.applyEmotionalExpression(expression);

            return true;
        } catch (error) {
            console.error('Erreur lors de l\'application de l\'émotion:', error);
            return false;
        }
    }

    /**
     * Valide une expression émotionnelle
     */
    async validateEmotionalExpression(
        expression: LSFExpression,
        emotion: EmotionType
    ): Promise<ValidationResult> {
        const issues: ValidationIssue[] = [];

        // Récupérer les paramètres de l'émotion pour la validation
        const emotionParams = this.getEmotionParameters(emotion);
        if (!emotionParams) {
            issues.push({
                type: 'SYNTACTIC',
                severity: 'ERROR',
                message: `Émotion non reconnue: ${emotion}`,
                component: 'emotion'
            });
            return {
                isValid: false,
                issues,
                score: 0
            };
        }

        // Valider les composantes faciales
        if (expression.eyebrows) {
            const validationResult = this.validateFacialComponent(
                'eyebrows',
                expression.eyebrows,
                emotionParams.facialComponents.eyebrows
            );
            if (!validationResult.isValid) {
                issues.push({
                    type: 'SYNTACTIC',
                    severity: 'WARNING',
                    message: `Expression des sourcils incompatible avec l'émotion ${emotion}`,
                    component: 'eyebrows',
                    metadata: validationResult.details
                });
            }
        }

        // Validation similaire pour les autres composantes...

        return {
            isValid: issues.length === 0,
            issues,
            score: issues.length === 0 ? 1.0 : Math.max(0, 1.0 - (issues.length * 0.1))
        };
    }

    /**
     * Récupère les paramètres d'une émotion spécifique
     */
    private getEmotionParameters(emotion: EmotionType): EmotionParameters | undefined {
        const emotionKey = emotion.toUpperCase();
        return this.EMOTION_PARAMETERS[emotionKey];
    }

    /**
     * Ajuste l'intensité des paramètres d'une émotion
     */
    private adjustEmotionIntensity(emotionParams: EmotionParameters, intensity: number): EmotionParameters {
        // Copie profonde pour éviter de modifier l'original
        const adjustedParams = JSON.parse(JSON.stringify(emotionParams)) as EmotionParameters;

        // Ajuster les composantes faciales
        for (const component in adjustedParams.facialComponents) {
            const componentKey = component as keyof FacialComponents;
            for (const param in adjustedParams.facialComponents[componentKey]) {
                // Ajuster en fonction de l'intensité
                const originalValue = adjustedParams.facialComponents[componentKey][param];
                adjustedParams.facialComponents[componentKey][param] =
                    this.adjustParameterValue(originalValue, intensity);
            }
        }

        // Ajuster les composantes corporelles
        for (const component in adjustedParams.bodyComponents) {
            const componentKey = component as keyof BodyComponents;
            for (const param in adjustedParams.bodyComponents[componentKey]) {
                const originalValue = adjustedParams.bodyComponents[componentKey][param];
                adjustedParams.bodyComponents[componentKey][param] =
                    this.adjustParameterValue(originalValue, intensity);
            }
        }

        // Ajuster les composantes manuelles
        for (const param in adjustedParams.handComponents) {
            const originalValue = adjustedParams.handComponents[param];
            if (typeof originalValue === 'number') {
                adjustedParams.handComponents[param] =
                    this.adjustParameterValue(originalValue, intensity);
            }
        }

        return adjustedParams;
    }

    /**
     * Ajuste une valeur de paramètre en fonction de l'intensité
     */
    private adjustParameterValue(value: number, intensity: number): number {
        // Si l'intensité est 1, pas de changement
        if (intensity === 1) return value;

        // Si l'intensité est supérieure à 1, augmenter proportionnellement
        if (intensity > 1) {
            // Pour les valeurs entre 0 et 1, limiter à 1
            if (value > 0 && value < 1) {
                return Math.min(1, value * intensity);
            }
            // Pour les autres valeurs, augmenter proportionnellement
            return value * intensity;
        }

        // Si l'intensité est inférieure à 1, réduire proportionnellement
        return value * intensity;
    }

    /**
     * Crée une expression LSF basée sur des paramètres émotionnels
     */
    private createEmotionalExpression(emotionParams: EmotionParameters): LSFExpression {
        return {
            eyebrows: emotionParams.facialComponents.eyebrows,
            mouth: emotionParams.facialComponents.mouth,
            eyes: emotionParams.facialComponents.eyes,
            body: {
                posture: emotionParams.bodyComponents.posture,
                movement: emotionParams.bodyComponents.movement
            },
            handshape: {
                configuration: {
                    // Configurer en fonction des paramètres
                    tension: emotionParams.handComponents.tension
                },
                movement: {
                    speed: emotionParams.handComponents.speed,
                    fluidity: emotionParams.handComponents.fluidity
                }
            },
            // Propriétés requises pour conformité avec LSFExpression
            timing: {
                duration: 1000, // Valeur par défaut en ms
                onset: 0,
                hold: 500,
                release: 500
            },
            intensity: 1.0,
            emotionType: "EMOTIONAL" // Type générique
        };
    }

    /**
     * Applique une expression émotionnelle
     */
    private async applyEmotionalExpression(lsfExpression: LSFExpression): Promise<void> {
        // Implémentation de l'application de l'expression
        // Cette implémentation est vide mais utilisera l'expression
        console.log(`Applying emotional expression with type: ${lsfExpression.emotionType}`);
    }

    /**
     * Valide une composante faciale par rapport aux attentes émotionnelles
     */
    private validateFacialComponent(
        _componentType: string, // Préfixé avec _ pour indiquer qu'il est inutilisé pour le moment
        actualComponent: EmotionComponentParameters,
        expectedComponent: EmotionComponentParameters
    ): { isValid: boolean; details?: ValidationDetails } {
        const missing: string[] = [];
        const differences: Record<string, { expected: number; actual: number; diff: number }> = {};
        let isValid = true;

        // Vérifier que les paramètres clés attendus sont présents
        for (const param in expectedComponent) {
            if (!(param in actualComponent)) {
                missing.push(param);
                isValid = false;
                continue;
            }

            // Vérifier que la valeur est dans une plage raisonnable
            const expected = expectedComponent[param];
            const actual = actualComponent[param];
            const diff = Math.abs(actual - expected);

            // Tolérer une différence de 30% maximum
            if (diff > expected * 0.3) {
                isValid = false;
                differences[param] = { expected, actual, diff };
            }
        }

        if (isValid) {
            return { isValid: true };
        } else {
            return {
                isValid: false,
                details: {
                    expected: expectedComponent,
                    actual: actualComponent,
                    missing,
                    differences
                }
            };
        }
    }
}