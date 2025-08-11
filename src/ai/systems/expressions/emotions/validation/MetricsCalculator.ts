// src/ai/systems/expressions/emotions/validation/MetricsCalculator.ts

import { AnalyzedEmotion, EmotionComponent } from '../base/types';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

/**
 * Interface pour les normes culturelles
 */
interface CulturalNorms {
    facial: Record<string, number>;
    body: Record<string, number>;
}

/**
 * Type pour les facialComponents d'une AnalyzedEmotion
 */
type FacialComponents = AnalyzedEmotion['facialComponents'];

/**
 * Type pour les bodyComponents d'une AnalyzedEmotion
 */
type BodyComponents = AnalyzedEmotion['bodyComponents'];

/**
 * Classe responsable du calcul des métriques de qualité pour les expressions émotionnelles
 */
export class MetricsCalculator {
    private performanceMonitor: PerformanceMonitor;

    constructor() {
        this.performanceMonitor = new PerformanceMonitor();
    }

    /**
     * Calcule l'authenticité d'une émotion analysée
     * @param analyzedEmotion Émotion analysée
     * @returns Score d'authenticité entre 0 et 1
     */
    calculateAuthenticity(analyzedEmotion: AnalyzedEmotion): number {
        const startTime = performance.now();

        // Vérifier la cohérence entre les composantes
        const facialCoherence = this.calculateFacialCoherence(analyzedEmotion.facialComponents);
        const bodyCoherence = this.calculateBodyCoherence(analyzedEmotion.bodyComponents);

        // Vérifier l'adéquation avec le type d'émotion
        const emotionTypeAlignment = this.calculateEmotionTypeAlignment(
            analyzedEmotion.baseType,
            analyzedEmotion.facialComponents,
            analyzedEmotion.bodyComponents
        );

        // Calculer l'authenticité basée sur la cohérence et l'alignement
        const result = (facialCoherence * 0.4) + (bodyCoherence * 0.3) + (emotionTypeAlignment * 0.3);

        // Enregistrer les métriques de performance
        const endTime = performance.now();
        this.performanceMonitor.recordOperation('calculateAuthenticity', endTime - startTime);

        return result;
    }

    /**
     * Calcule la précision culturelle d'une émotion analysée
     * @param analyzedEmotion Émotion analysée
     * @returns Score de précision culturelle entre 0 et 1
     */
    calculateCulturalAccuracy(analyzedEmotion: AnalyzedEmotion): number {
        const startTime = performance.now();

        // Vérifier l'adéquation avec les normes culturelles LSF
        const culturalNorms = this.getCulturalNormsFor(analyzedEmotion.baseType);

        // Calculer la conformité des composantes faciales aux normes culturelles
        const facialAccuracy = this.calculateFacialCulturalAccuracy(
            analyzedEmotion.facialComponents,
            culturalNorms.facial
        );

        // Calculer la conformité des composantes corporelles aux normes culturelles
        const bodyAccuracy = this.calculateBodyCulturalAccuracy(
            analyzedEmotion.bodyComponents,
            culturalNorms.body
        );

        // Pondérer les scores pour obtenir la précision culturelle globale
        const result = (facialAccuracy * 0.6) + (bodyAccuracy * 0.4);

        // Enregistrer les métriques de performance
        const endTime = performance.now();
        this.performanceMonitor.recordOperation('calculateCulturalAccuracy', endTime - startTime);

        return result;
    }

    /**
     * Calcule l'expressivité d'une émotion analysée
     * @param analyzedEmotion Émotion analysée
     * @returns Score d'expressivité entre 0 et 1
     */
    calculateExpressiveness(analyzedEmotion: AnalyzedEmotion): number {
        const startTime = performance.now();

        // Évaluer l'intensité des composantes faciales
        const facialExpressiveness = this.calculateFacialExpressiveness(analyzedEmotion.facialComponents);

        // Évaluer l'intensité des composantes corporelles
        const bodyExpressiveness = this.calculateBodyExpressiveness(analyzedEmotion.bodyComponents);

        // Évaluer la dynamique temporelle
        const temporalExpressiveness = this.calculateTemporalExpressiveness(analyzedEmotion.timing);

        // Calculer l'expressivité globale
        const result = (facialExpressiveness * 0.4) + (bodyExpressiveness * 0.4) + (temporalExpressiveness * 0.2);

        // Enregistrer les métriques de performance
        const endTime = performance.now();
        this.performanceMonitor.recordOperation('calculateExpressiveness', endTime - startTime);

        return result;
    }

    /**
     * Récupère les normes culturelles pour un type d'émotion
     */
    private getCulturalNormsFor(emotionType: string): CulturalNorms {
        // Définir les normes culturelles pour la LSF selon le type d'émotion
        switch (emotionType.toLowerCase()) {
            case 'joy':
                return {
                    facial: {
                        eyebrowsRaised: 0.7,
                        eyesOpenness: 0.6,
                        mouthSmiling: 0.9
                    },
                    body: {
                        postureUpright: 0.8,
                        shouldersRaised: 0.3,
                        armsOpenness: 0.7
                    }
                };
            case 'sadness':
                return {
                    facial: {
                        eyebrowsRaised: 0.2,
                        eyebrowsInner: 0.7,
                        mouthCorners: 0.2
                    },
                    body: {
                        postureDownward: 0.8,
                        shouldersForward: 0.7
                    }
                };
            // Autres émotions...
            default:
                return {
                    facial: {
                        neutral: 0.5
                    },
                    body: {
                        neutral: 0.5
                    }
                };
        }
    }

    /**
     * Calcule la cohérence des composantes faciales
     */
    private calculateFacialCoherence(facialComponentsInput: FacialComponents): number {
        // Implémentation tirée du code existant
        let coherenceScore = 0.0;
        let totalFactors = 0;

        // Vérifier cohérence sourcils-yeux
        if (facialComponentsInput.eyebrows && facialComponentsInput.eyes) {
            const eyebrowsRaised = facialComponentsInput.eyebrows.parameters.raised || 0;
            const eyesOpenness = facialComponentsInput.eyes.parameters.openness || 0;

            // Les sourcils relevés sont généralement associés à des yeux plus ouverts
            const eyebrowEyeCoherence = 1 - Math.abs(eyebrowsRaised - eyesOpenness) * 0.5;
            coherenceScore += eyebrowEyeCoherence;
            totalFactors++;
        }

        // Autres vérifications de cohérence faciale...

        return totalFactors > 0 ? coherenceScore / totalFactors : 0.9;
    }

    /**
     * Calcule la cohérence des composantes corporelles
     */
    private calculateBodyCoherence(bodyComponentsInput: BodyComponents): number {
        // Implémentation tirée du code existant
        let coherenceScore = 0.0;
        let totalFactors = 0;

        // Vérifier cohérence épaules-posture
        if (bodyComponentsInput.shoulders && bodyComponentsInput.posture) {
            const shouldersRaised = bodyComponentsInput.shoulders.parameters.raised || 0;
            const postureUpright = bodyComponentsInput.posture.parameters.upright || 0;

            // Les épaules relevées sont souvent associées à une posture droite
            const shoulderPostureCoherence = 1 - Math.abs(shouldersRaised - postureUpright) * 0.4;
            coherenceScore += shoulderPostureCoherence;
            totalFactors++;
        }

        // Autres vérifications de cohérence corporelle...

        return totalFactors > 0 ? coherenceScore / totalFactors : 0.85;
    }

    /**
     * Calcule l'alignement entre type d'émotion et expressions
     */
    private calculateEmotionTypeAlignment(
        emotionType: string,
        facialComponents: FacialComponents,
        bodyComponents: BodyComponents
    ): number {
        // Implémentation adaptée selon le type d'émotion (joy, sadness, etc.)
        const alignmentScore = this.calculateEmotionAlignment(emotionType, facialComponents, bodyComponents);
        return alignmentScore;
    }

    /**
     * Méthode d'assistance pour calculer l'alignement d'une émotion
     * en fonction de ses composantes et du type d'émotion
     */
    private calculateEmotionAlignment(
        emotionType: string,
        facialComponents: FacialComponents,
        bodyComponents: BodyComponents
    ): number {
        let score = 0.7; // Valeur par défaut

        // Adapter le score en fonction du type d'émotion
        switch (emotionType.toLowerCase()) {
            case 'joy':
                if (facialComponents.mouth?.parameters.smiling) {
                    score += 0.1;
                }
                if (bodyComponents.posture?.parameters.upright) {
                    score += 0.1;
                }
                break;
            case 'sadness':
                if (facialComponents.eyebrows?.parameters.inner) {
                    score += 0.1;
                }
                if (bodyComponents.posture?.parameters.downward) {
                    score += 0.1;
                }
                break;
            // Autres types d'émotions
        }

        return Math.min(1.0, score);
    }

    /**
     * Calcule la conformité culturelle des composantes faciales
     */
    private calculateFacialCulturalAccuracy(
        facialComponents: FacialComponents,
        facialNorms: Record<string, number>
    ): number {
        const accuracyScore = this.calculateComponentAccuracy(facialComponents, facialNorms);
        return accuracyScore;
    }

    /**
     * Calcule la conformité culturelle des composantes corporelles
     */
    private calculateBodyCulturalAccuracy(
        bodyComponents: BodyComponents,
        bodyNorms: Record<string, number>
    ): number {
        const accuracyScore = this.calculateComponentAccuracy(bodyComponents, bodyNorms);
        return accuracyScore;
    }

    /**
     * Méthode d'assistance pour calculer la précision des composants
     * par rapport aux normes
     */
    private calculateComponentAccuracy<T extends Record<string, EmotionComponent | undefined>>(
        components: T,
        norms: Record<string, number>
    ): number {
        let score = 0.0;
        let count = 0;

        // Calculer la précision pour chaque norme
        Object.entries(norms).forEach(([key, normValue]) => {
            const componentValue = this.extractComponentValue(components, key);
            if (componentValue !== undefined) {
                score += 1 - Math.min(0.5, Math.abs(componentValue - normValue));
                count++;
            }
        });

        return count > 0 ? score / count : 0.85;
    }

    /**
     * Extrait une valeur de composant en fonction de sa clé
     */
    private extractComponentValue<T extends Record<string, EmotionComponent | undefined>>(
        components: T,
        key: string
    ): number | undefined {
        // Recherche récursive dans les propriétés du composant
        if (!components) return undefined;

        for (const prop in components) {
            const component = components[prop];
            if (component && component.parameters && component.parameters[key] !== undefined) {
                return component.parameters[key];
            }
        }

        return undefined;
    }

    /**
     * Calcule l'expressivité des composantes faciales
     */
    private calculateFacialExpressiveness(facialComponents: FacialComponents): number {
        const expressiveness = this.calculateComponentsExpressiveness(facialComponents);
        return expressiveness;
    }

    /**
     * Calcule l'expressivité des composantes corporelles
     */
    private calculateBodyExpressiveness(bodyComponents: BodyComponents): number {
        const expressiveness = this.calculateComponentsExpressiveness(bodyComponents);
        return expressiveness;
    }

    /**
     * Méthode d'assistance pour calculer l'expressivité des composants
     */
    private calculateComponentsExpressiveness<T extends Record<string, EmotionComponent | undefined>>(
        components: T
    ): number {
        const totalComponents = Object.keys(components || {}).length;
        if (totalComponents === 0) return 0.65;

        let expressiveness = 0;

        // Calculer l'expressivité pour chaque composant
        Object.values(components || {}).forEach(component => {
            if (component && component.parameters) {
                const intensity = this.calculateAverageIntensity(component.parameters);
                expressiveness += intensity;
            }
        });

        return Math.max(0, Math.min(1, expressiveness / totalComponents));
    }

    /**
     * Calcule l'intensité moyenne des paramètres d'un composant
     */
    private calculateAverageIntensity(parameters: Record<string, number | undefined>): number {
        const values = Object.values(parameters).filter((val): val is number => typeof val === 'number');
        if (values.length === 0) return 0.5;

        return values.reduce((sum, val) => sum + Math.abs(val), 0) / values.length;
    }

    /**
     * Calcule l'expressivité de la dynamique temporelle
     */
    private calculateTemporalExpressiveness(timing: AnalyzedEmotion['timing']): number {
        // Implémentation tirée du code existant

        // Calculer la durée de l'apex proportionnellement à la durée totale
        const apexDuration = timing.apex - timing.onset;
        const totalDuration = timing.totalDuration;

        // Un ratio apex/total d'environ 0.3-0.4 est généralement expressif
        const apexRatio = apexDuration / totalDuration;
        const apexScore = 1 - Math.abs(0.35 - apexRatio) * 2;

        // Évaluer la vitesse d'apparition (onset)
        const onsetRatio = timing.onset / totalDuration;
        const onsetScore = 1 - Math.abs(0.2 - onsetRatio) * 3;

        // Calculer le score global
        const expressivityScore = (apexScore * 0.6) + (onsetScore * 0.4);

        // Normaliser entre 0 et 1
        return Math.max(0, Math.min(1, expressivityScore));
    }
}