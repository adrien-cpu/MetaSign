// src/ai/systems/expressions/emotions/base/LSFEmotionSystem.ts (version finale)

import {
    EmotionInput,
    EmotionalContext,
    EmotionMetadata,
    EmotionResult,
    LSFExpression
} from './types';
import { EmotionGenerator } from './EmotionGenerator';
import { EmotionAnalyzer } from './EmotionAnalyzer';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';

/**
 * Système principal pour la gestion des émotions en LSF
 * Sert de façade pour les fonctionnalités d'émotions
 */
export class LSFEmotionSystem {
    private emotionGenerator: EmotionGenerator;
    private emotionAnalyzer: EmotionAnalyzer;
    private performanceMonitor: PerformanceMonitor;

    constructor() {
        this.emotionGenerator = new EmotionGenerator();
        this.emotionAnalyzer = new EmotionAnalyzer();
        this.performanceMonitor = new PerformanceMonitor();
    }

    /**
     * Traite une émotion pour créer une expression LSF
     */
    public async processEmotion(
        emotion: EmotionInput,
        context: EmotionalContext
    ): Promise<{ expression: LSFExpression, metadata?: EmotionMetadata }> {
        const startTime = performance.now();

        try {
            // src/ai/systems/expressions/emotions/base/LSFEmotionSystem.ts (suite)

            // Créer une émotion complète à partir des données partielles
            const completeEmotion: EmotionInput = {
                ...emotion,
                context: {
                    social: context.purpose === 'CONVERSATION' ? 'informal' :
                        context.purpose === 'TEACHING' ? 'educational' : 'formal',
                    formalityLevel: context.formalityLevel
                }
            };

            // Générer l'expression
            const result = await this.emotionGenerator.generateExpression(completeEmotion);

            // Créer les métadonnées
            const metadata: EmotionMetadata = {
                intensity: result.expression.intensity || 0,
                valence: typeof emotion.valence === 'number' ? emotion.valence : 0,
                authenticity: result.metrics.authenticity,
                culturalAccuracy: result.metrics.culturalAccuracy,
                expressiveness: result.metrics.expressiveness
            };

            const endTime = performance.now();
            this.performanceMonitor.recordOperation('processEmotion', endTime - startTime);

            return { expression: result.expression, metadata };
        } catch (error) {
            console.error("Erreur lors du traitement de l'émotion:", error);
            throw error;
        }
    }

    /**
     * Génère une expression LSF pour une émotion donnée
     */
    public async generateExpression(emotion: EmotionInput): Promise<EmotionResult> {
        return this.emotionGenerator.generateExpression(emotion);
    }

    /**
     * Extrait les caractéristiques émotionnelles d'une expression LSF
     */
    public async extractEmotionalFeatures(expression: LSFExpression): Promise<Array<{
        type: string;
        component: string;
        value: number;
        importance: number;
    }>> {
        const startTime = performance.now();
        const features: Array<{
            type: string;
            component: string;
            value: number;
            importance: number;
        }> = [];

        // Extraire les caractéristiques des sourcils
        if (expression.eyebrows) {
            for (const [key, value] of Object.entries(expression.eyebrows)) {
                if (typeof value === 'number') {
                    features.push({
                        type: 'facial',
                        component: `eyebrows_${key}`,
                        value,
                        importance: this.getFeatureImportance('eyebrows', key)
                    });
                }
            }
        }

        // Extraire les caractéristiques des yeux
        if (expression.eyes) {
            for (const [key, value] of Object.entries(expression.eyes)) {
                if (typeof value === 'number') {
                    features.push({
                        type: 'facial',
                        component: `eyes_${key}`,
                        value,
                        importance: this.getFeatureImportance('eyes', key)
                    });
                }
            }
        }

        // Extraire les caractéristiques de la bouche
        if (expression.mouth) {
            for (const [key, value] of Object.entries(expression.mouth)) {
                if (typeof value === 'number') {
                    features.push({
                        type: 'facial',
                        component: `mouth_${key}`,
                        value,
                        importance: this.getFeatureImportance('mouth', key)
                    });
                }
            }
        }

        // Extraire les caractéristiques corporelles
        if (expression.body) {
            if (expression.body.posture) {
                for (const [key, value] of Object.entries(expression.body.posture)) {
                    if (typeof value === 'number') {
                        features.push({
                            type: 'body',
                            component: `posture_${key}`,
                            value,
                            importance: this.getFeatureImportance('posture', key)
                        });
                    }
                }
            }

            if (expression.body.movement) {
                for (const [key, value] of Object.entries(expression.body.movement)) {
                    if (typeof value === 'number') {
                        features.push({
                            type: 'body',
                            component: `movement_${key}`,
                            value,
                            importance: this.getFeatureImportance('movement', key)
                        });
                    }
                }
            }
        }

        const endTime = performance.now();
        this.performanceMonitor.recordOperation('extractEmotionalFeatures', endTime - startTime);

        return features;
    }

    /**
     * Détermine l'importance d'une caractéristique pour l'émotion
     */
    private getFeatureImportance(component: string, feature: string): number {
        // Importance par défaut
        let baseImportance = 0.5;

        // Ajuster selon le composant et la caractéristique
        switch (component) {
            case 'eyebrows':
                if (feature === 'raised' || feature === 'furrowed') {
                    baseImportance = 0.8;
                }
                break;
            case 'eyes':
                if (feature === 'openness' || feature === 'squint') {
                    baseImportance = 0.7;
                }
                break;
            case 'mouth':
                if (feature === 'smiling' || feature === 'open') {
                    baseImportance = 0.9;
                }
                break;
            case 'posture':
                if (feature === 'tension' || feature === 'upright') {
                    baseImportance = 0.6;
                }
                break;
            case 'movement':
                if (feature === 'speed' || feature === 'amplitude') {
                    baseImportance = 0.7;
                }
                break;
        }

        return baseImportance;
    }
}