/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/services/RhythmAnalysisService.ts
 * @description Service d'analyse et d'évaluation rythmique LSF
 * @author MetaSign
 * @version 1.0.0
 * @since 2024
 * 
 * Ce service fournit des utilitaires pour analyser la qualité rythmique,
 * générer des rapports d'évaluation et suggérer des améliorations.
 * 
 * @module RhythmAnalysisService
 * @requires LSFRhythmSystem
 */

import { LSF_RHYTHM_SYSTEM } from '../rhythm/LSFRhythmSystem';
import type { LSFTimingParameter } from '../types/LSFContentTypes';

/**
 * Interface pour l'analyse de l'impact de vitesse
 */
export interface SpeedImpactAnalysis {
    readonly description: string;
    readonly severity: 'low' | 'medium' | 'high';
    readonly communicationImpact: string;
}

/**
 * Interface pour l'analyse de fluidité
 */
export interface FluidityAnalysis {
    readonly description: string;
    readonly level: string;
    readonly causes: readonly string[];
    readonly impact: string;
}

/**
 * Interface pour l'analyse rythmique complète
 */
export interface RhythmAnalysisReport {
    readonly overallScore: number;
    readonly tempo: string;
    readonly fluidityLevel: string;
    readonly issues: readonly string[];
    readonly recommendations: readonly string[];
    readonly metrics: {
        readonly speed: number;
        readonly fluidity: number;
        readonly accuracy: number;
        readonly duration?: number;
    };
    readonly expertDiagnosis: string;
}

/**
 * Interface pour l'évaluation de compatibilité contextuelle
 */
export interface ContextCompatibilityEvaluation {
    readonly compatibility: number;
    readonly appropriateness: string;
    readonly suggestions: readonly string[];
}

/**
 * Interface pour les statistiques du système rythmique
 */
export interface RhythmSystemStats {
    readonly tempos: number;
    readonly fluidityLevels: number;
    readonly pausePatterns: number;
    readonly microTimings: number;
    readonly rhythmMetrics: number;
    readonly difficultyLevels: number;
}

/**
 * Interface pour les exigences contextuelles
 */
interface ContextRequirement {
    readonly idealSpeed: readonly [number, number];
    readonly minFluidity: number;
    readonly description: string;
}

/**
 * Service d'analyse rythmique LSF
 * Fournit des utilitaires pour l'évaluation de la qualité rythmique
 */
export class RhythmAnalysisService {
    private static readonly CONTEXT_REQUIREMENTS: Record<string, ContextRequirement> = {
        conversational: { idealSpeed: [0.8, 1.2], minFluidity: 0.7, description: 'Conversation détendue' },
        formal: { idealSpeed: [0.6, 1.0], minFluidity: 0.8, description: 'Présentation formelle' },
        artistic: { idealSpeed: [0.4, 1.8], minFluidity: 0.9, description: 'Expression artistique' },
        pedagogical: { idealSpeed: [0.5, 0.8], minFluidity: 0.6, description: 'Enseignement' },
        emergency: { idealSpeed: [1.2, 2.0], minFluidity: 0.5, description: 'Situation d\'urgence' }
    } as const;

    /**
     * Analyse l'impact d'un changement de vitesse
     * @param speed - Nouvelle vitesse
     * @returns Analyse de l'impact
     */
    public static analyzeSpeedImpact(speed: number): SpeedImpactAnalysis {
        if (speed <= 0.3) {
            return {
                description: 'Extrêmement lent',
                severity: 'high',
                communicationImpact: 'Perte d\'attention, communication laborieuse'
            };
        } else if (speed <= 0.6) {
            return {
                description: 'Très lent',
                severity: 'medium',
                communicationImpact: 'Communication pédagogique, emphase'
            };
        } else if (speed >= 2.0) {
            return {
                description: 'Très rapide',
                severity: 'high',
                communicationImpact: 'Perte de clarté, stress communicationnel'
            };
        } else if (speed >= 1.5) {
            return {
                description: 'Rapide',
                severity: 'medium',
                communicationImpact: 'Excitation, urgence'
            };
        } else {
            return {
                description: 'Vitesse normale',
                severity: 'low',
                communicationImpact: 'Communication fluide'
            };
        }
    }

    /**
     * Analyse le niveau de fluidité atteint
     * @param fluidity - Niveau de fluidité
     * @returns Analyse de la fluidité
     */
    public static analyzeFluidityLevel(fluidity: number): FluidityAnalysis {
        const { fluidityLevels } = LSF_RHYTHM_SYSTEM;

        for (const [level, data] of Object.entries(fluidityLevels)) {
            if (fluidity <= data.value + 0.1) {
                return {
                    description: data.description,
                    level,
                    causes: data.causes,
                    impact: data.impact
                };
            }
        }

        return {
            description: 'Fluidité exceptionnelle',
            level: 'expert',
            causes: ['native_fluency'],
            impact: 'enhanced_expression'
        };
    }

    /**
     * Classifie un tempo selon sa vitesse
     * @param speed - Vitesse
     * @returns Classification du tempo
     */
    public static classifyTempo(speed: number): string {
        if (speed <= 0.4) return 'very_slow';
        if (speed <= 0.7) return 'slow';
        if (speed <= 1.3) return 'moderate';
        if (speed <= 1.7) return 'fast';
        return 'very_fast';
    }

    /**
     * Obtient des statistiques sur le système rythmique
     * @returns Statistiques du système rythmique
     */
    public static getRhythmStats(): RhythmSystemStats {
        const { tempos, fluidityLevels, pausePatterns, microTimings, rhythmMetrics, difficulty } = LSF_RHYTHM_SYSTEM;

        return {
            tempos: Object.keys(tempos).length,
            fluidityLevels: Object.keys(fluidityLevels).length,
            pausePatterns: Object.keys(pausePatterns).length,
            microTimings: Object.keys(microTimings).length,
            rhythmMetrics: Object.keys(rhythmMetrics).length,
            difficultyLevels: Object.keys(difficulty).length
        };
    }

    /**
     * Génère un rapport d'analyse rythmique complet
     * @param timing - Paramètre de timing
     * @returns Rapport d'analyse rythmique
     */
    public static generateRhythmAnalysis(timing: LSFTimingParameter): RhythmAnalysisReport {
        const issues: string[] = [];
        const recommendations: string[] = [];

        // Analyse de la vitesse
        const speed = timing.speed ?? 1;
        const tempoAnalysis = this.analyzeSpeedImpact(speed);

        if (tempoAnalysis.severity === 'high') {
            issues.push(`Vitesse ${speed > 1.5 ? 'excessive' : 'trop lente'}: ${tempoAnalysis.description}`);
            recommendations.push(`Ajuster la vitesse vers une cadence ${speed > 1.5 ? 'plus modérée' : 'plus soutenue'}`);
        }

        // Analyse de la fluidité
        const fluidity = timing.fluidity ?? 1;
        const fluidityAnalysis = this.analyzeFluidityLevel(fluidity);

        if (fluidityAnalysis.level === 'choppy' || fluidityAnalysis.level === 'hesitant') {
            issues.push(`Fluidité insuffisante: ${fluidityAnalysis.description}`);
            recommendations.push('Travailler la continuité gestuelle et la confiance');
        }

        // Analyse des problèmes spécifiques
        if (timing.inappropriatePauses) {
            issues.push('Pauses inappropriées détectées');
            recommendations.push('Revoir le placement des pauses selon la structure linguistique');
        }

        if (timing.hesitations) {
            issues.push('Hésitations fréquentes');
            recommendations.push('Renforcer la maîtrise lexicale et syntaxique');
        }

        // Score global
        const accuracy = timing.accuracy ?? 1;
        const overallScore = (speed * 0.3 + fluidity * 0.4 + accuracy * 0.3);

        // Diagnostic expert
        let expertDiagnosis = '';
        if (overallScore >= 0.9) {
            expertDiagnosis = 'Excellente maîtrise rythmique - expression naturelle et fluide';
        } else if (overallScore >= 0.7) {
            expertDiagnosis = 'Bonne maîtrise rythmique - quelques ajustements possibles';
        } else if (overallScore >= 0.5) {
            expertDiagnosis = 'Maîtrise rythmique modérée - travail sur la fluidité recommandé';
        } else {
            expertDiagnosis = 'Difficultés rythmiques importantes - accompagnement pédagogique nécessaire';
        }

        return {
            overallScore,
            tempo: this.classifyTempo(speed),
            fluidityLevel: fluidityAnalysis.level,
            issues,
            recommendations,
            metrics: {
                speed,
                fluidity,
                accuracy,
                duration: timing.duration
            },
            expertDiagnosis
        };
    }

    /**
     * Suggère des exercices d'amélioration rythmique
     * @param timing - Paramètre de timing
     * @returns Liste d'exercices recommandés
     */
    public static suggestRhythmExercises(timing: LSFTimingParameter): readonly string[] {
        const exercises: string[] = [];

        // Exercices selon les problèmes détectés
        if (timing.fluidity !== undefined && timing.fluidity < 0.6) {
            exercises.push('Exercices de continuité gestuelle avec métronome');
            exercises.push('Pratique de transitions fluides entre signes');
        }

        if (timing.speed !== undefined && (timing.speed < 0.5 || timing.speed > 1.8)) {
            exercises.push('Exercices de contrôle du tempo');
            exercises.push('Pratique avec variations de vitesse progressives');
        }

        if (timing.inappropriatePauses) {
            exercises.push('Étude des structures syntaxiques LSF');
            exercises.push('Exercices de respiration et placement des pauses');
        }

        if (timing.hesitations) {
            exercises.push('Renforcement du vocabulaire actif');
            exercises.push('Pratique de discours improvisé');
        }

        // Exercices généraux si pas de problème spécifique
        if (exercises.length === 0) {
            exercises.push('Maintien de l\'excellence rythmique par pratique régulière');
            exercises.push('Exploration de variations expressives avancées');
        }

        return exercises;
    }

    /**
     * Évalue la compatibilité rythmique avec un contexte donné
     * @param timing - Paramètre de timing
     * @param context - Contexte (conversational, formal, artistic, etc.)
     * @returns Évaluation de compatibilité
     */
    public static evaluateContextCompatibility(timing: LSFTimingParameter, context: string): ContextCompatibilityEvaluation {
        const speed = timing.speed ?? 1;
        const fluidity = timing.fluidity ?? 1;

        const requirement = this.CONTEXT_REQUIREMENTS[context] ?? this.CONTEXT_REQUIREMENTS.conversational;

        // Calcule la compatibilité
        const speedCompatibility = speed >= requirement.idealSpeed[0] && speed <= requirement.idealSpeed[1] ? 1 :
            Math.max(0, 1 - Math.abs(speed - (requirement.idealSpeed[0] + requirement.idealSpeed[1]) / 2) * 0.5);

        const fluidityCompatibility = fluidity >= requirement.minFluidity ? 1 : fluidity / requirement.minFluidity;

        const overallCompatibility = (speedCompatibility * 0.6 + fluidityCompatibility * 0.4);

        // Évalue l'appropriation
        let appropriateness = '';
        if (overallCompatibility >= 0.9) appropriateness = 'Parfaitement adapté';
        else if (overallCompatibility >= 0.7) appropriateness = 'Bien adapté';
        else if (overallCompatibility >= 0.5) appropriateness = 'Partiellement adapté';
        else appropriateness = 'Peu adapté';

        // Suggestions d'amélioration
        const suggestions: string[] = [];
        if (speedCompatibility < 0.8) {
            if (speed < requirement.idealSpeed[0]) {
                suggestions.push(`Accélérer légèrement le rythme pour le contexte ${requirement.description}`);
            } else {
                suggestions.push(`Ralentir le rythme pour le contexte ${requirement.description}`);
            }
        }

        if (fluidityCompatibility < 0.8) {
            suggestions.push(`Améliorer la fluidité pour le contexte ${requirement.description}`);
        }

        return {
            compatibility: overallCompatibility,
            appropriateness,
            suggestions
        };
    }
}