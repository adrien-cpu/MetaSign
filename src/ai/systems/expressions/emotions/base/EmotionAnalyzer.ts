// src/ai/systems/expressions/emotions/base/EmotionAnalyzer.ts (mise à jour)

import {
    EmotionInput,
    AnalyzedEmotion,
    EmotionComponent
} from './types';
import { FacialComponentsManager } from '../components/FacialComponentsManager';
import { BodyComponentsManager } from '../components/BodyComponentsManager';
import { TimingManager } from '../components/TimingManager';
import { MetricsCalculator } from '../validation/MetricsCalculator';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

/**
 * Classe responsable de l'analyse des émotions
 * Convertit une entrée émotionnelle en une analyse détaillée
 */
export class EmotionAnalyzer {
    private facialComponentsManager: FacialComponentsManager;
    private bodyComponentsManager: BodyComponentsManager;
    private timingManager: TimingManager;
    private metricsCalculator: MetricsCalculator;
    private performanceMonitor: PerformanceMonitor;

    constructor() {
        this.facialComponentsManager = new FacialComponentsManager();
        this.bodyComponentsManager = new BodyComponentsManager();
        this.timingManager = new TimingManager();
        this.metricsCalculator = new MetricsCalculator();
        this.performanceMonitor = new PerformanceMonitor();
    }

    /**
     * Analyse une émotion et prépare sa traduction en LSF
     */
    public async analyzeEmotion(emotion: EmotionInput): Promise<AnalyzedEmotion> {
        const startTime = performance.now();

        // Calibrer l'intensité
        const calibratedIntensity = this.calibrateIntensity(emotion.type, emotion.intensity);

        // Créer les composantes faciales
        const facialComponents = this.facialComponentsManager.createFacialComponents(emotion.type, calibratedIntensity);

        // Créer les composantes corporelles
        const bodyComponents = this.bodyComponentsManager.createBodyComponents(emotion.type, calibratedIntensity);

        // Calculer le timing
        const timing = this.timingManager.calculateEmotionTiming(
            emotion.type,
            calibratedIntensity,
            facialComponents,
            bodyComponents
        );

        // Initialiser les métriques de qualité
        const metrics = {
            authenticity: 0.9,
            culturalAccuracy: 0.9,
            expressiveness: 0.9
        };

        // Créer l'émotion analysée
        const analyzedEmotion: AnalyzedEmotion = {
            baseType: emotion.type,
            calibratedIntensity,
            facialComponents,
            bodyComponents,
            timing,
            metrics
        };

        // Calculer les métriques réelles
        analyzedEmotion.metrics.authenticity = this.metricsCalculator.calculateAuthenticity(analyzedEmotion);
        analyzedEmotion.metrics.culturalAccuracy = this.metricsCalculator.calculateCulturalAccuracy(analyzedEmotion);
        analyzedEmotion.metrics.expressiveness = this.metricsCalculator.calculateExpressiveness(analyzedEmotion);

        const endTime = performance.now();
        this.performanceMonitor.recordOperation('analyzeEmotion', endTime - startTime);

        return analyzedEmotion;
    }

    /**
     * Calibre l'intensité d'une émotion selon son type
     * @param emotionType Type d'émotion
     * @param rawIntensity Intensité brute (0-1)
     * @returns Intensité calibrée
     */
    private calibrateIntensity(emotionType: string, rawIntensity: number): number {
        // Normaliser l'intensité entre 0 et 1
        const normalizedIntensity = Math.max(0, Math.min(1, rawIntensity));

        // Ajuster selon le type d'émotion (certaines émotions sont naturellement plus ou moins intenses)
        switch (emotionType.toLowerCase()) {
            case 'joy':
                return Math.min(1, normalizedIntensity * 1.1); // La joie est légèrement amplifiée
            case 'anger':
                return Math.min(1, normalizedIntensity * 1.2); // La colère est amplifiée
            case 'sadness':
                return Math.min(1, normalizedIntensity * 0.9); // La tristesse est légèrement atténuée
            case 'surprise':
                return Math.min(1, normalizedIntensity * 1.3); // La surprise est fortement amplifiée
            case 'fear':
                return Math.min(1, normalizedIntensity * 1.1); // La peur est légèrement amplifiée
            case 'disgust':
                return Math.min(1, normalizedIntensity * 1.0); // Le dégoût reste tel quel
            default:
                return normalizedIntensity;
        }
    }

    /**
     * Applique des ajustements contextuels à l'émotion analysée
     * @param analyzedEmotion Émotion analysée
     * @param context Contexte de l'émotion
     */
    public applyContextualAdjustments(analyzedEmotion: AnalyzedEmotion, context: EmotionInput['context']): void {
        if (!context) return;

        // Appliquer les ajustements selon le contexte social
        if (context.social) {
            const socialAdjustments = this.getSocialAdjustments(context.social);
            this.applyAdjustments(analyzedEmotion, socialAdjustments);
        }

        // Ajuster selon le niveau de formalité
        if (context.formalityLevel !== undefined) {
            this.adjustForFormality(analyzedEmotion, context.formalityLevel);
        }
    }

    /**
     * Obtient les ajustements selon le contexte social
     * @param socialContext Contexte social
     * @returns Ajustements à appliquer
     */
    private getSocialAdjustments(socialContext: string): Map<string, number> {
        // Initialiser les ajustements
        const adjustments = new Map<string, number>();

        // Appliquer les ajustements selon le contexte social
        switch (socialContext) {
            case 'formal':
                // En contexte formel, réduire l'intensité globale
                adjustments.set('intensityMultiplier', 0.8);
                // Privilégier les expressions faciales sur les expressions corporelles
                adjustments.set('facialEmphasis', 0.7);
                adjustments.set('bodyEmphasis', 0.3);
                break;

            case 'educational':
                // En contexte éducatif, accentuer l'expressivité
                adjustments.set('intensityMultiplier', 1.1);
                // Équilibrer facial et corporel
                adjustments.set('facialEmphasis', 0.5);
                adjustments.set('bodyEmphasis', 0.5);
                // Augmenter la durée des expressions
                adjustments.set('durationMultiplier', 1.2);
                break;

            case 'intimate':
                // En contexte intime, expressions plus subtiles mais intenses
                adjustments.set('intensityMultiplier', 0.9);
                // Privilégier les expressions faciales
                adjustments.set('facialEmphasis', 0.8);
                adjustments.set('bodyEmphasis', 0.2);
                break;

            case 'public':
                // En contexte public, expressions plus larges
                adjustments.set('intensityMultiplier', 1.2);
                // Privilégier les expressions corporelles
                adjustments.set('facialEmphasis', 0.4);
                adjustments.set('bodyEmphasis', 0.6);
                break;

            default:
                // Contexte standard
                adjustments.set('intensityMultiplier', 1.0);
                adjustments.set('facialEmphasis', 0.5);
                adjustments.set('bodyEmphasis', 0.5);
        }

        return adjustments;
    }

    /**
     * Applique les ajustements à une émotion analysée
     * @param analyzedEmotion Émotion analysée
     * @param adjustments Ajustements à appliquer
     */
    private applyAdjustments(analyzedEmotion: AnalyzedEmotion, adjustments: Map<string, number>): void {
        // Appliquer les ajustements d'intensité
        if (adjustments.has('intensityMultiplier')) {
            const multiplier = adjustments.get('intensityMultiplier') ?? 1;
            analyzedEmotion.calibratedIntensity *= multiplier;
        }

        // Appliquer les ajustements de durée
        if (adjustments.has('durationMultiplier')) {
            const multiplier = adjustments.get('durationMultiplier') ?? 1;
            analyzedEmotion.timing.totalDuration *= multiplier;
            analyzedEmotion.timing.onset *= multiplier;
            analyzedEmotion.timing.apex *= multiplier;
            analyzedEmotion.timing.offset *= multiplier;
        }

        // Appliquer les ajustements d'emphase
        if (adjustments.has('facialEmphasis') && adjustments.has('bodyEmphasis')) {
            const facialEmphasis = adjustments.get('facialEmphasis') ?? 0.5;
            const bodyEmphasis = adjustments.get('bodyEmphasis') ?? 0.5;

            // Ajuster les intensités des composantes faciales
            this.adjustComponentSetIntensity(analyzedEmotion.facialComponents, facialEmphasis);

            // Ajuster les intensités des composantes corporelles
            this.adjustComponentSetIntensity(analyzedEmotion.bodyComponents, bodyEmphasis);
        }
    }

    /**
     * Ajuste l'intensité d'un ensemble de composantes
     * @param components Ensemble de composantes
     * @param emphasisFactor Facteur d'emphase
     */
    private adjustComponentSetIntensity(components: Record<string, EmotionComponent>, emphasisFactor: number): void {
        for (const key in components) {
            if (components[key]) {
                components[key].intensity *= emphasisFactor;
            }
        }
    }

    /**
     * Ajuste l'expression émotionnelle selon le niveau de formalité
     * @param analyzedEmotion Émotion analysée
     * @param formalityLevel Niveau de formalité (0-1)
     */
    private adjustForFormality(analyzedEmotion: AnalyzedEmotion, formalityLevel: number): void {
        // Limiter la formalité entre 0 et 1
        const normalizedFormality = Math.max(0, Math.min(1, formalityLevel));

        // Ajuster l'intensité des composantes en fonction de la formalité
        // Plus le niveau est élevé, plus l'expression est contrôlée

        // Ajuster les composantes faciales
        this.adjustComponentIntensity(analyzedEmotion.facialComponents.eyebrows, normalizedFormality);
        this.adjustComponentIntensity(analyzedEmotion.facialComponents.eyes, normalizedFormality);
        this.adjustComponentIntensity(analyzedEmotion.facialComponents.mouth, normalizedFormality);

        if (analyzedEmotion.facialComponents.head) {
            this.adjustComponentIntensity(analyzedEmotion.facialComponents.head, normalizedFormality);
        }

        // Ajuster les composantes corporelles
        if (analyzedEmotion.bodyComponents.shoulders) {
            this.adjustComponentIntensity(analyzedEmotion.bodyComponents.shoulders, normalizedFormality);
        }

        if (analyzedEmotion.bodyComponents.arms) {
            this.adjustComponentIntensity(analyzedEmotion.bodyComponents.arms, normalizedFormality);
        }

        if (analyzedEmotion.bodyComponents.posture) {
            this.adjustComponentIntensity(analyzedEmotion.bodyComponents.posture, normalizedFormality);
        }

        // Ajuster le timing pour une expression plus contrôlée
        this.timingManager.adjustTimingForFormality(analyzedEmotion.timing, normalizedFormality);
    }

    /**
     * Ajuste l'intensité d'une composante selon le niveau de formalité
     * @param component Composante à ajuster
     * @param formalityLevel Niveau de formalité
     */
    private adjustComponentIntensity(component: EmotionComponent, formalityLevel: number): void {
        // Plus le niveau est élevé, plus l'intensité est réduite
        const reductionFactor = 1 - (formalityLevel * 0.3);
        component.intensity *= reductionFactor;

        // Ajuster également certains paramètres
        for (const param in component.parameters) {
            if (component.parameters.hasOwnProperty(param)) {
                component.parameters[param] *= reductionFactor;
            }
        }
    }
}