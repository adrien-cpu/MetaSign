// src/ai/systems/expressions/emotions/components/FacialComponentsManager.ts

import { EmotionComponent, AnalyzedEmotion } from '../base/types';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

/**
 * Classe responsable de la gestion des composantes faciales
 */
export class FacialComponentsManager {
    private performanceMonitor: PerformanceMonitor;

    constructor() {
        this.performanceMonitor = new PerformanceMonitor();
    }

    /**
     * Crée les composantes faciales pour un type d'émotion et une intensité donnés
     * @param emotionType Type d'émotion
     * @param intensity Intensité de l'émotion (0-1)
     * @returns Composantes faciales analysées
     */
    public createFacialComponents(emotionType: string, intensity: number): AnalyzedEmotion['facialComponents'] {
        const startTime = performance.now();

        // Créer des composantes spécifiques selon le type d'émotion
        let facialComponents: AnalyzedEmotion['facialComponents'];

        switch (emotionType.toLowerCase()) {
            case 'joy':
                facialComponents = {
                    eyebrows: {
                        intensity: intensity * 0.7,
                        timing: { onset: 100, hold: 300, release: 200 },
                        parameters: { raised: 0.7, inner: 0.3, outer: 0.6 }
                    },
                    eyes: {
                        intensity: intensity * 0.8,
                        timing: { onset: 120, hold: 280, release: 180 },
                        parameters: { openness: 0.6, squint: 0.3 }
                    },
                    mouth: {
                        intensity: intensity,
                        timing: { onset: 150, hold: 400, release: 250 },
                        parameters: { smiling: 0.9, open: 0.3, corners: 0.8 }
                    },
                    head: {
                        intensity: intensity * 0.6,
                        timing: { onset: 200, hold: 350, release: 250 },
                        parameters: { tilt: 0.2, nod: 0.3 }
                    }
                };
                break;

            case 'sadness':
                facialComponents = {
                    eyebrows: {
                        intensity: intensity * 0.8,
                        timing: { onset: 180, hold: 350, release: 220 },
                        parameters: { inner: 0.7, raised: 0.3, outer: 0.1 }
                    },
                    eyes: {
                        intensity: intensity * 0.7,
                        timing: { onset: 150, hold: 300, release: 200 },
                        parameters: { openness: 0.4, squint: 0.2, downward: 0.5 }
                    },
                    mouth: {
                        intensity: intensity * 0.9,
                        timing: { onset: 200, hold: 450, release: 300 },
                        parameters: { corners: 0.2, downturned: 0.8, tension: 0.3 }
                    },
                    head: {
                        intensity: intensity * 0.7,
                        timing: { onset: 220, hold: 400, release: 280 },
                        parameters: { downward: 0.7, tilt: 0.3 }
                    }
                };
                break;

            case 'anger':
                facialComponents = {
                    eyebrows: {
                        intensity: intensity * 0.9,
                        timing: { onset: 100, hold: 350, release: 200 },
                        parameters: { furrowed: 0.9, inner: 0.8, lowered: 0.7 }
                    },
                    eyes: {
                        intensity: intensity * 0.8,
                        timing: { onset: 120, hold: 330, release: 180 },
                        parameters: { squint: 0.7, narrowed: 0.8, intensity: 0.9 }
                    },
                    mouth: {
                        intensity: intensity * 0.9,
                        timing: { onset: 130, hold: 370, release: 220 },
                        parameters: { tension: 0.9, pressed: 0.8, corners: 0.4 }
                    },
                    head: {
                        intensity: intensity * 0.7,
                        timing: { onset: 150, hold: 320, release: 200 },
                        parameters: { forward: 0.6, tension: 0.8 }
                    }
                };
                break;

            case 'surprise':
                facialComponents = {
                    eyebrows: {
                        intensity: intensity * 0.9,
                        timing: { onset: 80, hold: 250, release: 180 },
                        parameters: { raised: 0.9, arched: 0.8, heightened: 0.9 }
                    },
                    eyes: {
                        intensity: intensity * 0.9,
                        timing: { onset: 70, hold: 270, release: 160 },
                        parameters: { openness: 0.9, widened: 0.9, startle: 0.8 }
                    },
                    mouth: {
                        intensity: intensity * 0.8,
                        timing: { onset: 90, hold: 260, release: 170 },
                        parameters: { open: 0.8, roundness: 0.9, drop: 0.8 }
                    },
                    head: {
                        intensity: intensity * 0.7,
                        timing: { onset: 85, hold: 240, release: 150 },
                        parameters: { back: 0.7, recoil: 0.6 }
                    }
                };
                break;

            case 'fear':
                facialComponents = {
                    eyebrows: {
                        intensity: intensity * 0.8,
                        timing: { onset: 120, hold: 320, release: 200 },
                        parameters: { raised: 0.8, inner: 0.7, tension: 0.9 }
                    },
                    eyes: {
                        intensity: intensity * 0.9,
                        timing: { onset: 110, hold: 340, release: 180 },
                        parameters: { openness: 0.9, widened: 0.8, fixated: 0.7 }
                    },
                    mouth: {
                        intensity: intensity * 0.7,
                        timing: { onset: 130, hold: 300, release: 190 },
                        parameters: { tension: 0.7, retracted: 0.6, open: 0.4 }
                    },
                    head: {
                        intensity: intensity * 0.6,
                        timing: { onset: 120, hold: 280, release: 180 },
                        parameters: { back: 0.6, frozen: 0.7 }
                    }
                };
                break;

            case 'disgust':
                facialComponents = {
                    eyebrows: {
                        intensity: intensity * 0.7,
                        timing: { onset: 150, hold: 350, release: 220 },
                        parameters: { lowered: 0.6, knitted: 0.7 }
                    },
                    eyes: {
                        intensity: intensity * 0.7,
                        timing: { onset: 140, hold: 330, release: 200 },
                        parameters: { narrowed: 0.7, squint: 0.6 }
                    },
                    mouth: {
                        intensity: intensity * 0.9,
                        timing: { onset: 130, hold: 370, release: 230 },
                        parameters: { curled: 0.8, asymmetry: 0.7, tension: 0.8 }
                    },
                    head: {
                        intensity: intensity * 0.6,
                        timing: { onset: 160, hold: 320, release: 210 },
                        parameters: { turned: 0.6, backward: 0.5 }
                    }
                };
                break;

            default:
                // Émotion non reconnue, expression neutre
                facialComponents = {
                    eyebrows: {
                        intensity: intensity * 0.5,
                        timing: { onset: 150, hold: 300, release: 200 },
                        parameters: { raised: 0.3, inner: 0.2, outer: 0.2 }
                    },
                    eyes: {
                        intensity: intensity * 0.5,
                        timing: { onset: 150, hold: 300, release: 200 },
                        parameters: { openness: 0.5 }
                    },
                    mouth: {
                        intensity: intensity * 0.5,
                        timing: { onset: 150, hold: 300, release: 200 },
                        parameters: { smiling: 0.2, open: 0.1 }
                    }
                };
        }

        const endTime = performance.now();
        this.performanceMonitor.recordOperation('createFacialComponents', endTime - startTime);

        return facialComponents;
    }

    /**
     * Modifie les composantes faciales selon une nuance émotionnelle
     * @param components Composantes faciales à modifier
     * @param subtlety Niveau de subtilité (0-1)
     */
    public reduceFacialComponentsIntensity(components: AnalyzedEmotion['facialComponents'], subtlety: number): void {
        const reductionFactor = 1 - subtlety * 0.6;

        // Ajuster l'intensité de chaque composante
        if (components.eyebrows) {
            components.eyebrows.intensity *= reductionFactor;
            this.reduceParametersIntensity(components.eyebrows.parameters, reductionFactor);
        }

        if (components.eyes) {
            components.eyes.intensity *= reductionFactor;
            this.reduceParametersIntensity(components.eyes.parameters, reductionFactor);
        }

        if (components.mouth) {
            components.mouth.intensity *= reductionFactor;
            this.reduceParametersIntensity(components.mouth.parameters, reductionFactor);
        }

        if (components.head) {
            components.head.intensity *= reductionFactor;
            this.reduceParametersIntensity(components.head.parameters, reductionFactor);
        }
    }

    /**
     * Calcule le timing des sourcils
     * @param component Composante des sourcils
     * @returns Durée en millisecondes
     */
    public calculateEyebrowsTiming(component: EmotionComponent): number {
        // Les sourcils ont généralement un mouvement rapide
        const baseTime = 150; // ms

        // Ajuster selon l'intensité
        const intensityFactor = 1 - component.intensity * 0.3; // Plus intense = plus rapide

        // Ajuster selon les paramètres spécifiques
        const speedFactor = component.parameters.speed || 1.0;

        return baseTime * intensityFactor * speedFactor;
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