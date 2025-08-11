// src/ai/systems/expressions/emotions/components/BodyComponentsManager.ts

import { EmotionComponent, AnalyzedEmotion } from '../base/types';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

/**
 * Classe responsable de la gestion des composantes corporelles
 */
export class BodyComponentsManager {
    private performanceMonitor: PerformanceMonitor;

    constructor() {
        this.performanceMonitor = new PerformanceMonitor();
    }

    /**
     * Crée les composantes corporelles pour un type d'émotion et une intensité donnés
     * @param emotionType Type d'émotion
     * @param intensity Intensité de l'émotion (0-1)
     * @returns Composantes corporelles analysées
     */
    public createBodyComponents(emotionType: string, intensity: number): AnalyzedEmotion['bodyComponents'] {
        const startTime = performance.now();

        // Créer des composantes corporelles selon le type d'émotion
        let bodyComponents: AnalyzedEmotion['bodyComponents'];

        switch (emotionType.toLowerCase()) {
            case 'joy':
                bodyComponents = {
                    shoulders: {
                        intensity: intensity * 0.6,
                        timing: { onset: 180, hold: 350, release: 220 },
                        parameters: { raised: 0.4, back: 0.2 }
                    },
                    arms: {
                        intensity: intensity * 0.7,
                        timing: { onset: 200, hold: 400, release: 250 },
                        parameters: { openness: 0.7, raised: 0.5 }
                    },
                    posture: {
                        intensity: intensity * 0.5,
                        timing: { onset: 220, hold: 450, release: 280 },
                        parameters: { upright: 0.6, forward: 0.3 }
                    }
                };
                break;

            case 'sadness':
                bodyComponents = {
                    shoulders: {
                        intensity: intensity * 0.7,
                        timing: { onset: 200, hold: 400, release: 250 },
                        parameters: { forward: 0.8, dropped: 0.7 }
                    },
                    arms: {
                        intensity: intensity * 0.5,
                        timing: { onset: 220, hold: 380, release: 230 },
                        parameters: { lowered: 0.6, close: 0.7 }
                    },
                    posture: {
                        intensity: intensity * 0.8,
                        timing: { onset: 250, hold: 450, release: 300 },
                        parameters: { downward: 0.7, collapsed: 0.6 }
                    }
                };
                break;

            case 'anger':
                bodyComponents = {
                    shoulders: {
                        intensity: intensity * 0.8,
                        timing: { onset: 150, hold: 350, release: 200 },
                        parameters: { raised: 0.7, tension: 0.9 }
                    },
                    arms: {
                        intensity: intensity * 0.9,
                        timing: { onset: 140, hold: 330, release: 190 },
                        parameters: { tension: 0.9, forward: 0.6 }
                    },
                    posture: {
                        intensity: intensity * 0.8,
                        timing: { onset: 160, hold: 370, release: 210 },
                        parameters: { forward: 0.7, tension: 0.9, upright: 0.8 }
                    }
                };
                break;

            case 'surprise':
                bodyComponents = {
                    shoulders: {
                        intensity: intensity * 0.7,
                        timing: { onset: 90, hold: 250, release: 160 },
                        parameters: { raised: 0.8, recoil: 0.7 }
                    },
                    arms: {
                        intensity: intensity * 0.6,
                        timing: { onset: 100, hold: 230, release: 150 },
                        parameters: { raised: 0.6, openness: 0.5 }
                    },
                    posture: {
                        intensity: intensity * 0.7,
                        timing: { onset: 85, hold: 240, release: 155 },
                        parameters: { backward: 0.7, upright: 0.6 }
                    }
                };
                break;

            case 'fear':
                bodyComponents = {
                    shoulders: {
                        intensity: intensity * 0.8,
                        timing: { onset: 130, hold: 320, release: 190 },
                        parameters: { raised: 0.7, tension: 0.9, protective: 0.8 }
                    },
                    arms: {
                        intensity: intensity * 0.7,
                        timing: { onset: 120, hold: 300, release: 180 },
                        parameters: { tension: 0.8, protective: 0.9 }
                    },
                    posture: {
                        intensity: intensity * 0.9,
                        timing: { onset: 110, hold: 330, release: 200 },
                        parameters: { backward: 0.7, tension: 0.9, frozen: 0.8 }
                    }
                };
                break;

            case 'disgust':
                bodyComponents = {
                    shoulders: {
                        intensity: intensity * 0.6,
                        timing: { onset: 170, hold: 350, release: 230 },
                        parameters: { raised: 0.4, backward: 0.7 }
                    },
                    arms: {
                        intensity: intensity * 0.5,
                        timing: { onset: 180, hold: 330, release: 220 },
                        parameters: { distancing: 0.8, protective: 0.6 }
                    },
                    posture: {
                        intensity: intensity * 0.7,
                        timing: { onset: 160, hold: 340, release: 210 },
                        parameters: { backward: 0.8, avoidance: 0.9 }
                    }
                };
                break;

            default:
                // Émotion non reconnue, posture neutre
                bodyComponents = {
                    shoulders: {
                        intensity: intensity * 0.4,
                        timing: { onset: 200, hold: 300, release: 200 },
                        parameters: { raised: 0.1, tension: 0.2 }
                    },
                    posture: {
                        intensity: intensity * 0.3,
                        timing: { onset: 250, hold: 350, release: 200 },
                        parameters: { upright: 0.5 }
                    }
                };
        }

        const endTime = performance.now();
        this.performanceMonitor.recordOperation('createBodyComponents', endTime - startTime);

        return bodyComponents;
    }

    /**
     * Modifie les composantes corporelles selon une nuance émotionnelle
     * @param components Composantes corporelles à modifier
     * @param subtlety Niveau de subtilité (0-1)
     */
    public reduceBodyComponentsIntensity(components: AnalyzedEmotion['bodyComponents'], subtlety: number): void {
        const reductionFactor = 1 - subtlety * 0.6;

        // Ajuster l'intensité de chaque composante
        if (components.shoulders) {
            components.shoulders.intensity *= reductionFactor;
            this.reduceParametersIntensity(components.shoulders.parameters, reductionFactor);
        }

        if (components.arms) {
            components.arms.intensity *= reductionFactor;
            this.reduceParametersIntensity(components.arms.parameters, reductionFactor);
        }

        if (components.posture) {
            components.posture.intensity *= reductionFactor;
            this.reduceParametersIntensity(components.posture.parameters, reductionFactor);
        }

        if (components.movement) {
            components.movement.intensity *= reductionFactor;
            this.reduceParametersIntensity(components.movement.parameters, reductionFactor);
        }
    }

    /**
     * Crée une description du mouvement corporel
     * @param emotionType Type d'émotion
     * @param intensity Intensité globale
     * @returns Composante de mouvement
     */
    public createBodyMovement(emotionType: string, intensity: number): EmotionComponent {
        const movement: EmotionComponent = {
            intensity: intensity,
            timing: { onset: 200, hold: 300, release: 200 },
            parameters: {}
        };

        // Ajuster selon le type d'émotion
        switch (emotionType.toLowerCase()) {
            case 'joy':
                movement.parameters = {
                    speed: 1.2,
                    fluidity: 0.8,
                    amplitude: 0.7,
                    expansiveness: 0.8
                };
                break;

            case 'sadness':
                movement.parameters = {
                    speed: 0.6,
                    fluidity: 0.5,
                    amplitude: 0.4,
                    heaviness: 0.8
                };
                break;

            case 'anger':
                movement.parameters = {
                    speed: 1.3,
                    fluidity: 0.4,
                    tension: 0.9,
                    sharpness: 0.8,
                    directness: 0.9
                };
                break;

            case 'surprise':
                movement.parameters = {
                    speed: 1.4,
                    fluidity: 0.7,
                    suddenness: 0.9,
                    amplitude: 0.8
                };
                break;

            case 'fear':
                movement.parameters = {
                    speed: 0.9,
                    fluidity: 0.4,
                    tension: 0.8,
                    restriction: 0.7,
                    trembling: 0.6
                };
                break;

            case 'disgust':
                movement.parameters = {
                    speed: 0.8,
                    fluidity: 0.5,
                    withdrawal: 0.8,
                    rejection: 0.9
                };
                break;

            default:
                movement.parameters = {
                    speed: 1.0,
                    fluidity: 0.6,
                    amplitude: 0.5
                };
        }

        // Ajuster tous les paramètres selon l'intensité
        this.reduceParametersIntensity(movement.parameters, intensity);

        return movement;
    }

    /**
     * Calcule le timing du corps
     * @param component Composante du corps
     * @returns Durée en millisecondes
     */
    public calculateBodyTiming(component: EmotionComponent): number {
        // Le corps a généralement un mouvement plus lent
        const baseTime = 350; // ms

        // Ajuster selon l'intensité
        const intensityFactor = 1 - component.intensity * 0.1;

        // Ajuster selon la tension
        const tensionFactor = component.parameters.tension ?
            (component.parameters.tension > 0.7 ? 0.8 : 1.2) : 1.0;

        return baseTime * intensityFactor * tensionFactor;
    }

    /**
     * Réduit l'intensité des paramètres d'une composante
     * @param parameters Paramètres à réduire
     * @param factor Facteur de réduction
     */
    private reduceParametersIntensity(parameters: Record<string, number>, factor: number): void {
        for (const key in parameters) {
            if (parameters.hasOwnProperty(key)) {
                parameters[key] *= factor;
            }
        }
    }
}