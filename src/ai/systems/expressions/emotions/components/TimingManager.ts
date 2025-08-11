// src/ai/systems/expressions/emotions/components/TimingManager.ts

import { AnalyzedEmotion } from '../base/types';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

/**
 * Classe responsable de la gestion du timing des expressions
 */
export class TimingManager {
    private performanceMonitor: PerformanceMonitor;

    constructor() {
        this.performanceMonitor = new PerformanceMonitor();
    }

    /**
     * Calcule les paramètres de timing pour une émotion donnée
     * @param emotionType Type d'émotion
     * @param intensity Intensité de l'émotion
     * @param facialComponents Composantes faciales
     * @param bodyComponents Composantes corporelles
     * @returns Paramètres de timing pour l'émotion
     */
    public calculateEmotionTiming(
        emotionType: string,
        intensity: number,
        facialComponents: AnalyzedEmotion['facialComponents'],
        bodyComponents: AnalyzedEmotion['bodyComponents']
    ): AnalyzedEmotion['timing'] {
        const startTime = performance.now();

        // Calcul de base selon le type d'émotion
        let onset: number, apex: number, offset: number, totalDuration: number;

        // Calculs de base selon le type
        switch (emotionType.toLowerCase()) {
            case 'joy':
                onset = 150;
                apex = 450;
                offset = 650;
                totalDuration = 800;
                break;
            case 'surprise':
                onset = 100; // Plus rapide
                apex = 350;
                offset = 500;
                totalDuration = 600; // Plus court
                break;
            case 'sadness':
                onset = 250; // Plus lent
                apex = 600;
                offset = 950;
                totalDuration = 1200; // Plus long
                break;
            case 'anger':
                onset = 120;
                apex = 400;
                offset = 700;
                totalDuration = 850;
                break;
            case 'fear':
                onset = 130;
                apex = 380;
                offset = 650;
                totalDuration = 780;
                break;
            case 'disgust':
                onset = 180;
                apex = 480;
                offset = 750;
                totalDuration = 900;
                break;
            default:
                onset = 200;
                apex = 500;
                offset = 800;
                totalDuration = 1000;
        }

        // Ajustements selon l'intensité
        if (intensity > 0.7) {
            // Émotions plus intenses sont plus rapides
            onset *= 0.8;
            totalDuration *= 0.9;
        } else if (intensity < 0.3) {
            // Émotions moins intenses sont plus lentes
            onset *= 1.2;
            totalDuration *= 1.1;
        }

        // Recalculer apex et offset
        apex = onset + (totalDuration - onset) * 0.4;
        offset = totalDuration;

        // Tenir compte des timings des composantes individuelles
        // Cette partie pourrait utiliser les timings des composantes pour affiner
        // le timing global, mais gardons-la simple pour l'instant

        const timing = { onset, apex, offset, totalDuration };

        const endTime = performance.now();
        this.performanceMonitor.recordOperation('calculateEmotionTiming', endTime - startTime);

        return timing;
    }

    /**
     * Ajuste le timing de l'expression selon le niveau de formalité
     * @param timing Timing à ajuster
     * @param formalityLevel Niveau de formalité (0-1)
     */
    public adjustTimingForFormality(timing: AnalyzedEmotion['timing'], formalityLevel: number): void {
        // Plus le niveau de formalité est élevé, plus l'expression est mesurée
        const formalityFactor = 1 + formalityLevel * 0.3; // 1.0 - 1.3

        // Ralentir l'apparition et prolonger la durée
        timing.onset *= formalityFactor;
        timing.apex *= formalityFactor;
        timing.offset *= formalityFactor;
        timing.totalDuration *= formalityFactor;
    }

    /**
     * Calcule l'expressivité de la dynamique temporelle
     * @param timing Timing à évaluer
     * @returns Score d'expressivité (0-1)
     */
    public calculateTemporalExpressiveness(timing: AnalyzedEmotion['timing']): number {
        // Calculer l'expressivité basée sur le timing de l'émotion

        // Calculer la durée de l'apex proportionnellement à la durée totale
        const apexDuration = timing.apex - timing.onset;
        const totalDuration = timing.totalDuration;

        // Un ratio apex/total d'environ 0.3-0.4 est généralement expressif
        const apexRatio = apexDuration / totalDuration;
        const apexScore = 1 - Math.abs(0.35 - apexRatio) * 2;

        // Évaluer la vitesse d'apparition (onset)
        // Un onset ni trop rapide ni trop lent est expressif
        const onsetRatio = timing.onset / totalDuration;
        const onsetScore = 1 - Math.abs(0.2 - onsetRatio) * 3;

        // Calculer le score global
        const expressivityScore = (apexScore * 0.6) + (onsetScore * 0.4);

        // Normaliser entre 0 et 1
        return Math.max(0, Math.min(1, expressivityScore));
    }
}