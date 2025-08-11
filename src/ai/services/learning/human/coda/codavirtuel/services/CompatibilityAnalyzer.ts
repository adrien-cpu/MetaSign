/**
 * @file src/ai/services/learning/human/coda/codavirtuel/services/CompatibilityAnalyzer.ts
 * @description Service d'analyse et recommandations pour la compatibilité CODA
 * 
 * Responsabilités :
 * - 🔍 Identification des forces et défis
 * - 💡 Génération de recommandations
 * - 📈 Plans d'amélioration
 * - ✨ Compatible exactOptionalPropertyTypes: true
 * 
 * @module services
 * @version 4.0.0 - Analyseur de compatibilité CODA
 * @since 2025
 * @author MetaSign Team - CODA Compatibility Analyzer
 * @lastModified 2025-07-31
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type {
    MentorProfile,
    ComprehensiveAIStatus,
    CompatibilityScores,
    CompatibilityImprovementPlan,
    CompatibilityThresholds
} from '../types/CompatibilityTypes';

/**
 * Service d'analyse de compatibilité pour le système CODA
 * 
 * @class CompatibilityAnalyzer
 * @description Service spécialisé dans l'analyse des résultats de compatibilité
 * et la génération de recommandations d'amélioration.
 * 
 * @example
 * ```typescript
 * const analyzer = new CompatibilityAnalyzer();
 * 
 * const strengths = analyzer.identifyStrengths(mentorProfile, aiStudent, scores);
 * const challenges = analyzer.identifyChallenges(mentorProfile, aiStudent, scores);
 * const plan = analyzer.generateImprovementPlan(mentorProfile, aiStudent, 0.65);
 * ```
 */
export class CompatibilityAnalyzer {
    /**
     * Logger pour l'analyseur de compatibilité
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('CompatibilityAnalyzer');

    /**
     * Seuils pour l'évaluation de compatibilité
     * @private
     * @readonly
     */
    private readonly thresholds: CompatibilityThresholds = {
        excellent: 0.9,
        good: 0.75,
        adequate: 0.6,
        needsImprovement: 0.45,
        poor: 0.3
    };

    /**
     * Constructeur de l'analyseur de compatibilité
     * 
     * @constructor
     */
    constructor() {
        this.logger.info('🔍 CompatibilityAnalyzer initialisé');
    }

    /**
     * Identifie les forces de compatibilité
     * 
     * @method identifyStrengths
     * @param {MentorProfile} mentorProfile - Profil du mentor
     * @param {ComprehensiveAIStatus} aiStudent - État de l'IA-élève
     * @param {CompatibilityScores} scores - Scores de compatibilité
     * @returns {readonly string[]} Liste des forces identifiées
     * @public
     */
    public identifyStrengths(
        mentorProfile: MentorProfile,
        aiStudent: ComprehensiveAIStatus,
        scores: CompatibilityScores
    ): readonly string[] {
        const strengths: string[] = [];

        try {
            this.logger.debug('🔍 Identification des forces', {
                mentorId: mentorProfile.id,
                overallStrength: Object.values(scores).reduce((a, b) => a + b, 0) / 5
            });

            // Analyse de la personnalité
            if (scores.personalityCompatibility > this.thresholds.good) {
                strengths.push(this.getPersonalityStrengthMessage(
                    mentorProfile.personality, aiStudent.personality, scores.personalityCompatibility
                ));
            }

            // Analyse culturelle
            if (scores.culturalCompatibility > this.thresholds.good) {
                strengths.push(this.getCulturalStrengthMessage(
                    mentorProfile.culturalBackground, aiStudent.culturalContext, scores.culturalCompatibility
                ));
            }

            // Analyse du style d'enseignement
            if (scores.teachingStyleCompatibility > this.thresholds.good) {
                strengths.push(this.getTeachingStyleStrengthMessage(
                    mentorProfile.teachingStyle, scores.teachingStyleCompatibility
                ));
            }

            // Analyse de l'expérience
            if (scores.experienceAlignment > this.thresholds.good) {
                strengths.push(this.getExperienceStrengthMessage(
                    mentorProfile.experience, aiStudent.currentLevel, scores.experienceAlignment
                ));
            }

            // Analyse méthodologique
            if (scores.methodologyMatch > this.thresholds.good) {
                strengths.push(this.getMethodologyStrengthMessage(
                    mentorProfile.preferredMethods, scores.methodologyMatch
                ));
            }

            this.logger.info('✅ Forces identifiées', { count: strengths.length });
            return strengths;

        } catch (error) {
            this.logger.error('❌ Erreur identification forces', { error });
            return ['Analyse des forces indisponible'];
        }
    }

    /**
     * Identifie les défis de compatibilité
     * 
     * @method identifyChallenges
     * @param {MentorProfile} mentorProfile - Profil du mentor
     * @param {ComprehensiveAIStatus} aiStudent - État de l'IA-élève
     * @param {CompatibilityScores} scores - Scores de compatibilité
     * @returns {readonly string[]} Liste des défis identifiés
     * @public
     */
    public identifyChallenges(
        mentorProfile: MentorProfile,
        aiStudent: ComprehensiveAIStatus,
        scores: CompatibilityScores
    ): readonly string[] {
        const challenges: string[] = [];

        try {
            this.logger.debug('🔍 Identification des défis', {
                mentorId: mentorProfile.id,
                lowestScore: Math.min(...Object.values(scores))
            });

            // Défis de personnalité
            if (scores.personalityCompatibility < this.thresholds.adequate) {
                challenges.push(this.getPersonalityChallengeMessage(
                    mentorProfile.personality, aiStudent.personality, scores.personalityCompatibility
                ));
            }

            // Défis culturels
            if (scores.culturalCompatibility < this.thresholds.adequate) {
                challenges.push(this.getCulturalChallengeMessage(
                    mentorProfile.culturalBackground, aiStudent.culturalContext, scores.culturalCompatibility
                ));
            }

            // Défis de style d'enseignement
            if (scores.teachingStyleCompatibility < this.thresholds.adequate) {
                challenges.push(this.getTeachingStyleChallengeMessage(
                    mentorProfile.teachingStyle, scores.teachingStyleCompatibility
                ));
            }

            // Défis d'expérience
            if (scores.experienceAlignment < this.thresholds.adequate) {
                challenges.push(this.getExperienceChallengeMessage(
                    mentorProfile.experience, aiStudent.currentLevel, scores.experienceAlignment
                ));
            }

            // Défis méthodologiques
            if (scores.methodologyMatch < this.thresholds.adequate) {
                challenges.push(this.getMethodologyChallengeMessage(
                    mentorProfile.preferredMethods, scores.methodologyMatch
                ));
            }

            this.logger.info('✅ Défis identifiés', { count: challenges.length });
            return challenges;

        } catch (error) {
            this.logger.error('❌ Erreur identification défis', { error });
            return ['Analyse des défis indisponible'];
        }
    }

    /**
     * Génère des recommandations basées sur l'analyse
     * 
     * @method generateRecommendations
     * @param {MentorProfile} mentorProfile - Profil du mentor
     * @param {ComprehensiveAIStatus} aiStudent - État de l'IA-élève
     * @param {number} overallScore - Score global de compatibilité
     * @param {readonly string[]} challenges - Défis identifiés
     * @returns {readonly string[]} Liste des recommandations
     * @public
     */
    public generateRecommendations(
        mentorProfile: MentorProfile,
        aiStudent: ComprehensiveAIStatus,
        overallScore: number,
        challenges: readonly string[]
    ): readonly string[] {
        const recommendations: string[] = [];

        try {
            this.logger.debug('💡 Génération recommandations', {
                mentorId: mentorProfile.id,
                overallScore,
                challengesCount: challenges.length
            });

            // Recommandations générales basées sur le score
            if (overallScore < this.thresholds.good) {
                recommendations.push(
                    'Formation en adaptation pédagogique recommandée pour améliorer la compatibilité globale'
                );
            }

            // Recommandations spécifiques par défi
            challenges.forEach(challenge => {
                if (challenge.includes('culturel')) {
                    recommendations.push(
                        'Sensibilisation culturelle spécifique nécessaire pour mieux comprendre le contexte de l\'IA-élève'
                    );
                }
                if (challenge.includes('personnalité')) {
                    recommendations.push(
                        'Adaptation du style de communication recommandée pour s\'aligner avec la personnalité de l\'IA'
                    );
                }
                if (challenge.includes('expérience')) {
                    recommendations.push(
                        'Formation complémentaire ou mentorat avec un expert plus expérimenté suggéré'
                    );
                }
                if (challenge.includes('méthode') || challenge.includes('méthodologie')) {
                    recommendations.push(
                        'Diversification des méthodes pédagogiques pour mieux répondre aux besoins spécifiques'
                    );
                }
            });

            // Recommandations personnalisées
            recommendations.push(...this.getPersonalizedRecommendations(mentorProfile, aiStudent));

            this.logger.info('✅ Recommandations générées', { count: recommendations.length });
            return [...new Set(recommendations)]; // Éliminer les doublons

        } catch (error) {
            this.logger.error('❌ Erreur génération recommandations', { error });
            return ['Recommandations indisponibles'];
        }
    }

    /**
     * Génère un plan d'amélioration complet
     * 
     * @method generateImprovementPlan
     * @param {MentorProfile} mentorProfile - Profil du mentor
     * @param {ComprehensiveAIStatus} aiStudent - État de l'IA-élève
     * @param {number} currentScore - Score actuel
     * @returns {CompatibilityImprovementPlan} Plan d'amélioration détaillé
     * @public
     */
    public generateImprovementPlan(
        mentorProfile: MentorProfile,
        aiStudent: ComprehensiveAIStatus,
        currentScore: number
    ): CompatibilityImprovementPlan {
        try {
            this.logger.info('📈 Génération plan d\'amélioration', {
                mentorId: mentorProfile.id,
                currentScore: currentScore.toFixed(2)
            });

            const targetScore = this.calculateTargetScore(currentScore);
            const timeline = this.estimateTimeline(currentScore, targetScore);

            const plan: CompatibilityImprovementPlan = {
                currentScore,
                targetScore,
                timeline,
                priorityActions: this.identifyPriorityActions(mentorProfile, aiStudent, currentScore),
                trainingRecommendations: this.generateTrainingRecommendations(mentorProfile, aiStudent),
                culturalAdaptationSteps: this.generateCulturalAdaptationSteps(mentorProfile, aiStudent),
                successMetrics: this.defineSuccessMetrics(currentScore, targetScore),
                milestones: this.createMilestones(currentScore, targetScore, timeline)
            };

            this.logger.info('✅ Plan d\'amélioration généré', {
                targetScore: targetScore.toFixed(2),
                timeline,
                actionsCount: plan.priorityActions.length
            });

            return plan;

        } catch (error) {
            this.logger.error('❌ Erreur génération plan amélioration', { error });
            return this.createDefaultImprovementPlan(currentScore);
        }
    }

    // ==================== MÉTHODES PRIVÉES DE GÉNÉRATION DE MESSAGES ====================

    private getPersonalityStrengthMessage(mentorType: string, aiType: string, score: number): string {
        const intensity = score > 0.9 ? 'excellente' : score > 0.8 ? 'très bonne' : 'bonne';
        const scoreIndicator = score > 0.95 ? ' (score exceptionnel)' : '';
        return `${intensity.charAt(0).toUpperCase() + intensity.slice(1)} compatibilité de personnalité (${mentorType} ↔ ${aiType})${scoreIndicator}`;
    }

    private getCulturalStrengthMessage(mentorCulture: string, aiCulture: string, score: number): string {
        if (mentorCulture === aiCulture) {
            return `Parfait alignement culturel - même environnement de référence (score: ${score.toFixed(2)})`;
        }
        const adaptabilityLevel = score > 0.9 ? 'exceptionnelle' : score > 0.8 ? 'excellente' : 'forte';
        return `${adaptabilityLevel.charAt(0).toUpperCase() + adaptabilityLevel.slice(1)} compatibilité culturelle grâce à l'adaptabilité du mentor (${score.toFixed(2)})`;
    }

    private getTeachingStyleStrengthMessage(style: string, score: number): string {
        const effectiveness = score > 0.9 ? 'parfaitement' : score > 0.8 ? 'excellemment' : 'bien';
        return `Style d'enseignement "${style}" ${effectiveness} adapté aux besoins de l'IA (efficacité: ${score.toFixed(2)})`;
    }

    private getExperienceStrengthMessage(experience: number, level: string, score: number): string {
        const adequacy = score > 0.9 ? 'parfaitement' : score > 0.8 ? 'très bien' : 'bien';
        return `Expérience du mentor (${experience} ans) ${adequacy} adaptée au niveau ${level} (adéquation: ${score.toFixed(2)})`;
    }

    private getMethodologyStrengthMessage(methods: readonly string[], score: number): string {
        const alignment = score > 0.9 ? 'exceptionnellement' : score > 0.8 ? 'excellemment' : 'bien';
        return `Méthodes pédagogiques (${methods.length} approches) ${alignment} alignées avec les besoins (score: ${score.toFixed(2)})`;
    }

    private getPersonalityChallengeMessage(mentorType: string, aiType: string, score: number): string {
        const severity = score < 0.3 ? 'majeures' : score < 0.5 ? 'importantes' : 'notables';
        return `Différences de personnalité ${severity} (${mentorType} vs ${aiType}) - nécessite adaptation (score critique: ${score.toFixed(2)})`;
    }

    private getCulturalChallengeMessage(mentorCulture: string, aiCulture: string, score: number): string {
        const gapSeverity = score < 0.3 ? 'critique' : score < 0.5 ? 'important' : 'significatif';
        return `Écart culturel ${gapSeverity} entre ${mentorCulture} et ${aiCulture} - adaptation prioritaire requise (score: ${score.toFixed(2)})`;
    }

    private getTeachingStyleChallengeMessage(style: string, score: number): string {
        const adjustmentLevel = score < 0.3 ? 'majeurs' : score < 0.5 ? 'importants' : 'significatifs';
        return `Style d'enseignement "${style}" nécessite des ajustements ${adjustmentLevel} pour l'IA (inadéquation: ${score.toFixed(2)})`;
    }

    private getExperienceChallengeMessage(experience: number, level: string, score: number): string {
        if (experience < 2) {
            return `Expérience limitée (${experience} an${experience > 1 ? 's' : ''}) pour encadrer niveau ${level} - mentorat supplémentaire recommandé (score: ${score.toFixed(2)})`;
        }
        const mismatchSeverity = score < 0.3 ? 'critique' : score < 0.5 ? 'importante' : 'notable';
        return `Inadéquation ${mismatchSeverity} niveau d'expérience pour le niveau ${level} de l'IA (score: ${score.toFixed(2)})`;
    }

    private getMethodologyChallengeMessage(methods: readonly string[], score: number): string {
        if (methods.length === 0) {
            return `Absence de méthodes pédagogiques spécialisées définies - formation méthodologique urgente (score: ${score.toFixed(2)})`;
        }
        const inadequacy = score < 0.3 ? 'gravement' : score < 0.5 ? 'considérablement' : 'notablement';
        return `Méthodes actuelles ${inadequacy} inadaptées aux besoins spécifiques de l'IA - révision nécessaire (score: ${score.toFixed(2)})`;
    }

    // ==================== MÉTHODES PRIVÉES POUR LE PLAN D'AMÉLIORATION ====================

    private calculateTargetScore(currentScore: number): number {
        if (currentScore < 0.5) return Math.min(0.75, currentScore + 0.25);
        if (currentScore < 0.7) return Math.min(0.85, currentScore + 0.2);
        return Math.min(0.95, currentScore + 0.15);
    }

    private estimateTimeline(currentScore: number, targetScore: number): string {
        const gap = targetScore - currentScore;
        const baseWeeks = Math.ceil(gap * 40); // 40 semaines pour +1.0
        return `${Math.max(4, Math.min(16, baseWeeks))} semaines`;
    }

    private identifyPriorityActions(
        mentorProfile: MentorProfile,
        aiStudent: ComprehensiveAIStatus,
        currentScore: number
    ): readonly string[] {
        const actions: string[] = [];

        if (mentorProfile.culturalBackground !== aiStudent.culturalContext) {
            actions.push('Améliorer l\'adaptation culturelle spécifique');
        }

        if (mentorProfile.adaptabilityScore < 0.7) {
            actions.push('Développer les compétences d\'adaptabilité pédagogique');
        }

        if (currentScore < 0.6) {
            actions.push('Renforcer les techniques de feedback et d\'évaluation');
        }

        actions.push('Établir des sessions de calibrage régulières avec l\'IA');

        return actions;
    }

    private generateTrainingRecommendations(
        mentorProfile: MentorProfile,
        aiStudent: ComprehensiveAIStatus
    ): readonly string[] {
        const baseRecommendations = [
            'Formation en pédagogie adaptative pour IA',
            'Sensibilisation aux spécificités culturelles LSF',
            'Techniques de communication non-verbale avancées',
            'Méthodes d\'évaluation continue et feedback constructif',
            'Gestion des différences de personnalité en enseignement'
        ];

        // Ajout de recommandations spécifiques basées sur les profils
        const specificRecommendations: string[] = [];

        if (mentorProfile.experience < 3) {
            specificRecommendations.push('Formation approfondie en mentorat de systèmes IA avancés');
        }

        if (aiStudent.personality === 'analytical' && mentorProfile.teachingStyle === 'creative') {
            specificRecommendations.push('Formation en approches pédagogiques analytiques et structurées');
        }

        if (mentorProfile.culturalBackground !== aiStudent.culturalContext) {
            specificRecommendations.push(`Immersion culturelle spécifique au contexte ${aiStudent.culturalContext}`);
        }

        return [...baseRecommendations, ...specificRecommendations];
    }

    private generateCulturalAdaptationSteps(
        mentorProfile: MentorProfile,
        aiStudent: ComprehensiveAIStatus
    ): readonly string[] {
        const steps: string[] = [
            'Étudier le contexte culturel spécifique de l\'IA-élève',
            'Adapter les références et exemples au contexte culturel',
            'Intégrer les variantes culturelles de la LSF'
        ];

        if (mentorProfile.culturalBackground !== aiStudent.culturalContext) {
            steps.push('Consultation avec un expert culturel du contexte cible');
            steps.push('Pratique supervised avec des cas culturels spécifiques');
        }

        // Ajout d'étapes spécifiques selon le niveau de l'IA
        if (['C1', 'C2'].includes(aiStudent.currentLevel)) {
            steps.push('Maîtrise des nuances culturelles avancées et subtilités régionales');
        }

        return steps;
    }

    private defineSuccessMetrics(currentScore: number, targetScore: number): readonly string[] {
        const baseMetrics = [
            'Score de compatibilité global',
            'Satisfaction et engagement de l\'IA-élève',
            'Efficacité mesurée des sessions d\'enseignement',
            'Progression observable dans l\'apprentissage',
            'Feedback qualitatif des interactions'
        ];

        // Ajout de métriques spécifiques basées sur l'écart de scores
        const scoreGap = targetScore - currentScore;
        const specificMetrics: string[] = [];

        if (scoreGap > 0.2) {
            specificMetrics.push('Réduction mesurable des incompatibilités identifiées');
            specificMetrics.push('Amélioration de la fluidité des échanges pédagogiques');
        }

        if (currentScore < 0.5) {
            specificMetrics.push('Élimination des blocages majeurs de communication');
        }

        return [...baseMetrics, ...specificMetrics];
    }

    private createMilestones(
        currentScore: number,
        targetScore: number,
        timeline: string
    ): readonly { week: number; goal: string; metric: number }[] {
        const weeks = parseInt(timeline.split(' ')[0]);
        const scoreIncrement = (targetScore - currentScore) / 3;

        return [
            {
                week: Math.floor(weeks / 3),
                goal: 'Amélioration initiale mesurable',
                metric: Number((currentScore + scoreIncrement).toFixed(2))
            },
            {
                week: Math.floor(weeks * 2 / 3),
                goal: 'Progrès significatif consolidé',
                metric: Number((currentScore + scoreIncrement * 2).toFixed(2))
            },
            {
                week: weeks,
                goal: 'Objectif de compatibilité atteint',
                metric: Number(targetScore.toFixed(2))
            }
        ];
    }

    private getPersonalizedRecommendations(
        mentorProfile: MentorProfile,
        aiStudent: ComprehensiveAIStatus
    ): string[] {
        const recommendations: string[] = [];

        // Recommandations basées sur la personnalité de l'IA
        if (aiStudent.personality === 'analytical') {
            recommendations.push('Privilégier les approches structurées et les explications logiques détaillées');
        } else if (aiStudent.personality === 'creative') {
            recommendations.push('Intégrer davantage d\'éléments créatifs et d\'approches innovantes');
        }

        // Recommandations basées sur le niveau
        if (['A1', 'A2'].includes(aiStudent.currentLevel)) {
            recommendations.push('Adapter le rythme pour favoriser l\'assimilation progressive');
        } else if (['C1', 'C2'].includes(aiStudent.currentLevel)) {
            recommendations.push('Proposer des défis intellectuels stimulants et des nuances avancées');
        }

        return recommendations;
    }

    private createDefaultImprovementPlan(currentScore: number): CompatibilityImprovementPlan {
        return {
            currentScore,
            targetScore: currentScore + 0.2,
            timeline: '8 semaines',
            priorityActions: ['Évaluation approfondie nécessaire'],
            trainingRecommendations: ['Formation de base en compatibilité'],
            culturalAdaptationSteps: ['Sensibilisation culturelle générale'],
            successMetrics: ['Score de compatibilité'],
            milestones: [
                { week: 4, goal: 'Évaluation intermédiaire', metric: currentScore + 0.1 },
                { week: 8, goal: 'Objectif minimal', metric: currentScore + 0.2 }
            ]
        };
    }
}