/**
 * @file src/ai/services/learning/human/coda/codavirtuel/services/TeachingStyleAnalyzer.ts
 * @description Analyseur spécialisé pour les styles d'enseignement CODA
 * 
 * Responsabilités :
 * - 🎭 Analyse des styles d'enseignement primaires et secondaires
 * - 📊 Évaluation de l'efficacité pédagogique
 * - 🔄 Calcul d'indices d'adaptabilité
 * - 💡 Recommandations d'ajustements
 * - ✨ Compatible exactOptionalPropertyTypes: true
 * 
 * @module services
 * @version 4.0.1 - Analyseur de style d'enseignement CODA (types corrigés)
 * @since 2025
 * @author MetaSign Team - CODA Teaching Style Analyzer
 * @lastModified 2025-08-06
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type {
    MentorProfile,
    TeachingSession,
    TeachingStyleAnalysis
} from '../types/CompatibilityTypes';

/**
 * Interface pour la configuration d'un style d'enseignement
 * ✅ Correction : Permet des valeurs numériques calculées
 */
interface StyleConfiguration {
    readonly baseEffectiveness: number;
    readonly adaptability: number;
    readonly interactionModes: readonly string[];
    readonly optimalDuration: number; // ✅ Type number au lieu de littéraux
}

/**
 * Analyseur de style d'enseignement pour le système CODA
 * 
 * @class TeachingStyleAnalyzer
 * @description Service spécialisé dans l'analyse des styles d'enseignement,
 * l'évaluation de leur efficacité et la génération de recommandations d'amélioration.
 * 
 * @example
 * ```typescript
 * const analyzer = new TeachingStyleAnalyzer();
 * 
 * const analysis = analyzer.analyzeTeachingStyle(mentorProfile, sessions);
 * console.log(`Efficacité: ${analysis.effectivenessScore}`);
 * ```
 */
export class TeachingStyleAnalyzer {
    /**
     * Logger pour l'analyseur de style d'enseignement
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('TeachingStyleAnalyzer');

    /**
     * Configurations des styles d'enseignement avec leurs caractéristiques
     * ✅ Correction : Type explicite pour permettre les calculs dynamiques
     * @private
     * @readonly
     */
    private readonly styleConfigurations: Record<string, StyleConfiguration> = {
        directive: {
            baseEffectiveness: 0.8,
            adaptability: 0.6,
            interactionModes: ['instruction_directe', 'demonstration', 'correction_immediate'],
            optimalDuration: 30
        },
        collaborative: {
            baseEffectiveness: 0.9,
            adaptability: 0.8,
            interactionModes: ['discussion', 'co_construction', 'feedback_bidirectionnel'],
            optimalDuration: 50
        },
        supportive: {
            baseEffectiveness: 0.85,
            adaptability: 0.9,
            interactionModes: ['encouragement', 'guidance', 'accompagnement'],
            optimalDuration: 45
        },
        delegative: {
            baseEffectiveness: 0.7,
            adaptability: 0.7,
            interactionModes: ['autonomie_guidee', 'supervision_distante', 'validation'],
            optimalDuration: 60
        },
        adaptive: {
            baseEffectiveness: 0.95,
            adaptability: 0.95,
            interactionModes: ['ajustement_continu', 'personnalisation', 'feedback_adaptatif'],
            optimalDuration: 40
        },
        methodical: {
            baseEffectiveness: 0.85,
            adaptability: 0.75,
            interactionModes: ['progression_structuree', 'etapes_systematiques', 'verification'],
            optimalDuration: 55
        }
    };

    /**
     * Constructeur de l'analyseur de style d'enseignement
     * 
     * @constructor
     */
    constructor() {
        this.logger.info('🎭 TeachingStyleAnalyzer initialisé');
    }

    /**
     * Analyse le style d'enseignement complet du mentor
     * 
     * @method analyzeTeachingStyle
     * @param {MentorProfile} mentorProfile - Profil du mentor
     * @param {readonly TeachingSession[]} sessions - Sessions d'enseignement
     * @returns {TeachingStyleAnalysis} Analyse complète du style
     * @public
     */
    public analyzeTeachingStyle(
        mentorProfile: MentorProfile,
        sessions: readonly TeachingSession[]
    ): TeachingStyleAnalysis {
        try {
            this.logger.info('🎭 Analyse style d\'enseignement', {
                mentorId: mentorProfile.id,
                primaryStyle: mentorProfile.teachingStyle,
                sessionsCount: sessions.length
            });

            const primaryStyle = mentorProfile.teachingStyle;
            const secondaryStyles = this.identifySecondaryStyles(mentorProfile, sessions);
            const effectivenessScore = this.calculateEffectiveness(mentorProfile, sessions);
            const adaptabilityIndex = this.calculateAdaptabilityIndex(mentorProfile, sessions);
            const preferredInteractionModes = this.identifyInteractionModes(mentorProfile, sessions);
            const optimalSessionDuration = this.calculateOptimalDuration(mentorProfile, sessions);
            const recommendedAdjustments = this.generateAdjustmentRecommendations(
                mentorProfile, sessions, effectivenessScore
            );

            const analysis: TeachingStyleAnalysis = {
                primaryStyle,
                secondaryStyles,
                effectivenessScore,
                adaptabilityIndex,
                preferredInteractionModes,
                optimalSessionDuration,
                recommendedAdjustments
            };

            this.logger.info('✅ Analyse style terminée', {
                mentorId: mentorProfile.id,
                effectiveness: effectivenessScore.toFixed(2),
                adaptability: adaptabilityIndex.toFixed(2),
                secondaryStylesCount: secondaryStyles.length
            });

            return analysis;

        } catch (error) {
            this.logger.error('❌ Erreur analyse style', {
                mentorId: mentorProfile.id,
                error
            });
            return this.createDefaultAnalysis(mentorProfile);
        }
    }

    // ==================== MÉTHODES PRIVÉES D'ANALYSE ====================

    /**
     * Identifie les styles d'enseignement secondaires
     */
    private identifySecondaryStyles(
        mentorProfile: MentorProfile,
        sessions: readonly TeachingSession[]
    ): readonly string[] {
        const secondaryStyles: string[] = [];

        // Analyse basée sur l'adaptabilité
        if (mentorProfile.adaptabilityScore > 0.8) {
            if (mentorProfile.teachingStyle !== 'adaptive') {
                secondaryStyles.push('adaptive');
            }
        }

        // Analyse basée sur l'expérience
        if (mentorProfile.experience > 3) {
            if (mentorProfile.teachingStyle !== 'supportive') {
                secondaryStyles.push('supportive');
            }
        }

        // Analyse basée sur les méthodes préférées
        if (mentorProfile.preferredMethods.some(method =>
            method.includes('collaboration') || method.includes('interaction'))) {
            if (mentorProfile.teachingStyle !== 'collaborative') {
                secondaryStyles.push('collaborative');
            }
        }

        // Analyse basée sur les sessions (si disponibles)
        if (sessions.length > 0) {
            const avgEngagement = sessions.reduce(
                (sum, s) => sum + s.metrics.engagementLevel, 0
            ) / sessions.length;

            if (avgEngagement > 0.8 && !secondaryStyles.includes('collaborative')) {
                secondaryStyles.push('collaborative');
            }
        }

        return secondaryStyles.slice(0, 2); // Limiter à 2 styles secondaires
    }

    /**
     * Calcule l'efficacité pédagogique
     */
    private calculateEffectiveness(
        mentorProfile: MentorProfile,
        sessions: readonly TeachingSession[]
    ): number {
        const styleConfig = this.styleConfigurations[mentorProfile.teachingStyle];
        let baseEffectiveness = styleConfig?.baseEffectiveness || 0.7;

        // Ajustement basé sur l'expérience
        const experienceBonus = Math.min(0.1, mentorProfile.experience / 10);
        baseEffectiveness += experienceBonus;

        // Ajustement basé sur les spécialisations
        const specializationBonus = mentorProfile.specializations.length > 0 ? 0.05 : 0;
        baseEffectiveness += specializationBonus;

        // Ajustement basé sur les sessions réelles (si disponibles)
        if (sessions.length > 0) {
            const sessionEffectiveness = sessions.reduce(
                (sum, s) => sum + s.metrics.teachingEffectiveness, 0
            ) / sessions.length;

            // Pondération 70% théorique, 30% pratique
            baseEffectiveness = baseEffectiveness * 0.7 + sessionEffectiveness * 0.3;
        }

        return Math.min(1, baseEffectiveness);
    }

    /**
     * Calcule l'indice d'adaptabilité
     */
    private calculateAdaptabilityIndex(
        mentorProfile: MentorProfile,
        sessions: readonly TeachingSession[]
    ): number {
        let adaptabilityIndex = mentorProfile.adaptabilityScore;

        // Bonus pour variété des méthodes
        const methodsVariety = mentorProfile.preferredMethods.length / 5; // Normalisé sur 5
        adaptabilityIndex += Math.min(0.1, methodsVariety);

        // Analyse des sessions pour détecter l'adaptation en cours
        if (sessions.length > 2) {
            const progressionTrend = this.calculateProgressionTrend(sessions);
            if (progressionTrend > 0) {
                adaptabilityIndex += 0.05; // Bonus pour amélioration continue
            }
        }

        return Math.min(1, adaptabilityIndex);
    }

    /**
     * Identifie les modes d'interaction préférés
     */
    private identifyInteractionModes(
        mentorProfile: MentorProfile,
        sessions: readonly TeachingSession[]
    ): readonly string[] {
        const styleConfig = this.styleConfigurations[mentorProfile.teachingStyle];
        const baseModes = styleConfig?.interactionModes || ['interaction_standard'];

        // Ajouter des modes basés sur l'analyse des sessions
        const additionalModes: string[] = [];

        if (sessions.length > 0) {
            const avgParticipation = sessions.reduce(
                (sum, s) => sum + s.metrics.participationRate, 0
            ) / sessions.length;

            if (avgParticipation > 0.8) {
                additionalModes.push('engagement_eleve');
            }

            const avgComprehension = sessions.reduce(
                (sum, s) => sum + s.metrics.comprehensionScore, 0
            ) / sessions.length;

            if (avgComprehension > 0.85) {
                additionalModes.push('transmission_efficace');
            }
        }

        return [...baseModes, ...additionalModes];
    }

    /**
     * Calcule la durée optimale des sessions
     * ✅ Correction : Variables avec types number explicites
     */
    private calculateOptimalDuration(
        mentorProfile: MentorProfile,
        sessions: readonly TeachingSession[]
    ): number {
        const styleConfig = this.styleConfigurations[mentorProfile.teachingStyle];
        let optimalDuration: number = styleConfig?.optimalDuration || 45;

        // Ajustement basé sur les sessions réelles
        if (sessions.length > 0) {
            const sessionDurations = sessions.map(s => s.duration);
            const avgDuration = sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length;

            // Analyser l'efficacité par rapport à la durée
            const effectivenessByDuration = sessions.map(s => ({
                duration: s.duration,
                effectiveness: s.metrics.teachingEffectiveness
            }));

            // Trouver la durée avec la meilleure efficacité moyenne
            const optimalFromData = this.findOptimalDurationFromData(effectivenessByDuration);

            if (optimalFromData > 0) {
                // ✅ Correction : Calculs avec types number explicites
                const calculatedOptimal: number = Math.round(optimalDuration * 0.6 + optimalFromData * 0.4);
                optimalDuration = calculatedOptimal;
            } else {
                const roundedAvgDuration: number = Math.round(avgDuration);
                optimalDuration = roundedAvgDuration;
            }
        }

        return Math.max(20, Math.min(90, optimalDuration)); // Contraintes réalistes
    }

    /**
     * Génère des recommandations d'ajustement
     */
    private generateAdjustmentRecommendations(
        mentorProfile: MentorProfile,
        sessions: readonly TeachingSession[],
        effectivenessScore: number
    ): readonly string[] {
        const recommendations: string[] = [];

        // Recommandations basées sur l'efficacité
        if (effectivenessScore < 0.7) {
            recommendations.push('Augmenter l\'interactivité des sessions');
            recommendations.push('Adapter le rythme aux réactions de l\'IA-élève');
        } else if (effectivenessScore < 0.8) {
            recommendations.push('Optimiser les transitions entre activités');
        }

        // Recommandations basées sur l'adaptabilité
        if (mentorProfile.adaptabilityScore < 0.7) {
            recommendations.push('Développer la flexibilité pédagogique');
            recommendations.push('Intégrer davantage de méthodes alternatives');
        }

        // Recommandations basées sur les sessions
        if (sessions.length > 0) {
            const avgEngagement = sessions.reduce(
                (sum, s) => sum + s.metrics.engagementLevel, 0
            ) / sessions.length;

            if (avgEngagement < 0.7) {
                recommendations.push('Renforcer les techniques d\'engagement');
            }

            const avgProgression = sessions.reduce(
                (sum, s) => sum + s.metrics.progressRate, 0
            ) / sessions.length;

            if (avgProgression < 0.6) {
                recommendations.push('Revoir la progression pédagogique');
                recommendations.push('Intégrer plus de feedback formatif');
            }
        }

        // Recommandations spécifiques au style
        const styleSpecificRecommendations = this.getStyleSpecificRecommendations(
            mentorProfile.teachingStyle
        );
        recommendations.push(...styleSpecificRecommendations);

        return [...new Set(recommendations)]; // Éliminer les doublons
    }

    // ==================== MÉTHODES UTILITAIRES ====================

    /**
     * Calcule la tendance de progression dans les sessions
     */
    private calculateProgressionTrend(sessions: readonly TeachingSession[]): number {
        if (sessions.length < 3) return 0;

        const recentSessions = sessions.slice(-3);
        const earlyEffectiveness = recentSessions[0].metrics.teachingEffectiveness;
        const latestEffectiveness = recentSessions[recentSessions.length - 1].metrics.teachingEffectiveness;

        return latestEffectiveness - earlyEffectiveness;
    }

    /**
     * Trouve la durée optimale à partir des données de sessions
     */
    private findOptimalDurationFromData(
        data: { duration: number; effectiveness: number }[]
    ): number {
        if (data.length < 3) return 0;

        // Grouper par tranches de durée et calculer l'efficacité moyenne
        const durationGroups = new Map<number, number[]>();

        data.forEach(({ duration, effectiveness }) => {
            const group = Math.round(duration / 10) * 10; // Grouper par tranches de 10 min
            if (!durationGroups.has(group)) {
                durationGroups.set(group, []);
            }
            durationGroups.get(group)!.push(effectiveness);
        });

        let bestDuration = 0;
        let bestEffectiveness = 0;

        durationGroups.forEach((effectivenessValues, duration) => {
            const avgEffectiveness = effectivenessValues.reduce((a, b) => a + b, 0) / effectivenessValues.length;
            if (avgEffectiveness > bestEffectiveness) {
                bestEffectiveness = avgEffectiveness;
                bestDuration = duration;
            }
        });

        return bestDuration;
    }

    /**
     * Obtient des recommandations spécifiques au style d'enseignement
     */
    private getStyleSpecificRecommendations(teachingStyle: string): string[] {
        const styleRecommendations: Record<string, string[]> = {
            directive: [
                'Intégrer plus de moments d\'interaction',
                'Permettre davantage d\'autonomie progressive'
            ],
            collaborative: [
                'Maintenir l\'équilibre entre collaboration et guidance',
                'Structurer davantage les échanges si nécessaire'
            ],
            supportive: [
                'Équilibrer soutien et défi intellectuel',
                'Graduer progressivement vers plus d\'autonomie'
            ],
            delegative: [
                'Augmenter la fréquence des points de contrôle',
                'Fournir plus de ressources de support'
            ],
            adaptive: [
                'Documenter les adaptations pour optimiser la cohérence',
                'Maintenir un cadre stable malgré l\'adaptabilité'
            ],
            methodical: [
                'Intégrer plus de moments de créativité',
                'Adapter le rythme aux besoins individuels'
            ]
        };

        return styleRecommendations[teachingStyle] || [
            'Continuer l\'analyse pour des recommandations personnalisées'
        ];
    }

    /**
     * Crée une analyse par défaut en cas d'erreur
     */
    private createDefaultAnalysis(mentorProfile: MentorProfile): TeachingStyleAnalysis {
        return {
            primaryStyle: mentorProfile.teachingStyle,
            secondaryStyles: [],
            effectivenessScore: 0.7,
            adaptabilityIndex: mentorProfile.adaptabilityScore || 0.7,
            preferredInteractionModes: ['evaluation_en_cours'],
            optimalSessionDuration: 45,
            recommendedAdjustments: ['Analyse approfondie requise']
        };
    }
}