/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/PersonalityCompatibilityCalculator.ts
 * @description Calculateur spécialisé pour la compatibilité entre profils de personnalité
 * 
 * Fonctionnalités spécialisées :
 * - 🤝 Calcul de compatibilité entre traits Big Five
 * - 🏛️ Évaluation de compatibilité culturelle LSF
 * - 🎯 Analyse de compatibilité des motivations
 * - 📚 Compatibilité des styles d'apprentissage
 * - 🎨 Matrices de compatibilité avancées
 * 
 * @module PersonalityCompatibilityCalculator
 * @version 1.0.0 - Extraction SOLID
 * @since 2025
 * @author MetaSign Team - Compatibility Analysis Division
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type {
    AIPersonalityProfile,
    BigFiveTraits,
    CulturalBackground,
    MotivationFactor,
    LearningStyle,
    FeedbackStyle
} from './AIPersonalitySystem';

/**
 * Résultat détaillé de compatibilité
 */
export interface DetailedCompatibilityResult {
    readonly overallCompatibility: number;
    readonly traitCompatibility: number;
    readonly culturalCompatibility: number;
    readonly learningStyleCompatibility: number;
    readonly motivationCompatibility: number;
    readonly feedbackStyleCompatibility: number;
    readonly strengths: readonly string[];
    readonly challenges: readonly string[];
    readonly recommendations: readonly string[];
}

/**
 * Calculateur spécialisé pour la compatibilité entre personnalités
 * 
 * @class PersonalityCompatibilityCalculator
 * @description Responsable des calculs de compatibilité multi-dimensionnels
 */
export class PersonalityCompatibilityCalculator {
    private readonly logger = LoggerFactory.getLogger('PersonalityCompatibilityCalculator');

    constructor() {
        this.logger.info('🤝 Calculateur de compatibilité initialisé');
    }

    /**
     * Calcule la compatibilité complète entre deux profils
     * @param profile1 - Premier profil de personnalité
     * @param profile2 - Deuxième profil de personnalité
     * @returns Résultat détaillé de compatibilité
     */
    public calculateDetailedCompatibility(
        profile1: AIPersonalityProfile,
        profile2: AIPersonalityProfile
    ): DetailedCompatibilityResult {
        // Calculs individuels de compatibilité
        const traitCompatibility = this.calculateTraitCompatibility(profile1.bigFiveTraits, profile2.bigFiveTraits);
        const culturalCompatibility = this.calculateCulturalCompatibility(profile1.culturalBackground, profile2.culturalBackground);
        const learningStyleCompatibility = this.calculateLearningStyleCompatibility(profile1.learningStyle, profile2.learningStyle);
        const motivationCompatibility = this.calculateMotivationCompatibility(profile1.motivationFactors, profile2.motivationFactors);
        const feedbackStyleCompatibility = this.calculateFeedbackStyleCompatibility(profile1.preferredFeedbackStyle, profile2.preferredFeedbackStyle);

        // Score global pondéré avec nouvelle formule avancée
        const overallCompatibility = this.calculateWeightedCompatibility({
            traitCompatibility,
            culturalCompatibility,
            learningStyleCompatibility,
            motivationCompatibility,
            feedbackStyleCompatibility
        });

        // Analyse des forces et défis
        const { strengths, challenges } = this.analyzeCompatibilityInsights(
            profile1, profile2,
            { traitCompatibility, culturalCompatibility, learningStyleCompatibility, motivationCompatibility, feedbackStyleCompatibility }
        );

        // Génération de recommandations
        const recommendations = this.generateCompatibilityRecommendations(
            overallCompatibility, strengths, challenges
        );

        const result: DetailedCompatibilityResult = {
            overallCompatibility,
            traitCompatibility,
            culturalCompatibility,
            learningStyleCompatibility,
            motivationCompatibility,
            feedbackStyleCompatibility,
            strengths,
            challenges,
            recommendations
        };

        this.logger.info('🤝 Compatibilité calculée', {
            profile1: profile1.personalityId,
            profile2: profile2.personalityId,
            overallScore: overallCompatibility.toFixed(2),
            strengths: strengths.length,
            challenges: challenges.length
        });

        return result;
    }

    /**
     * Calcule la compatibilité simple entre deux profils (API legacy)
     * @param profile1 - Premier profil
     * @param profile2 - Deuxième profil
     * @returns Score de compatibilité (0-1)
     */
    public calculateSimpleCompatibility(
        profile1: AIPersonalityProfile,
        profile2: AIPersonalityProfile
    ): number {
        return this.calculateDetailedCompatibility(profile1, profile2).overallCompatibility;
    }

    /**
     * Calcule la compatibilité entre traits Big Five
     * @private
     */
    private calculateTraitCompatibility(traits1: BigFiveTraits, traits2: BigFiveTraits): number {
        const traitWeights = {
            openness: 0.25,
            conscientiousness: 0.25,
            extraversion: 0.20,
            agreeableness: 0.20,
            neuroticism: 0.10 // Moins de poids car la différence peut être complémentaire
        };

        let weightedCompatibility = 0;

        Object.entries(traitWeights).forEach(([trait, weight]) => {
            const key = trait as keyof BigFiveTraits;
            const difference = Math.abs(traits1[key] - traits2[key]);
            
            // Formule spéciale pour le neuroticisme (différence peut être bénéfique)
            let compatibility: number;
            if (key === 'neuroticism') {
                // Une personne stable peut compenser une personne plus anxieuse
                compatibility = difference > 0.3 ? 0.8 : 1 - difference;
            } else {
                // Pour les autres traits, la similarité est généralement meilleure
                compatibility = 1 - difference;
            }

            weightedCompatibility += compatibility * weight;
        });

        return Math.max(0, Math.min(1, weightedCompatibility));
    }

    /**
     * Calcule la compatibilité culturelle avancée
     * @private
     */
    private calculateCulturalCompatibility(
        background1: CulturalBackground,
        background2: CulturalBackground
    ): number {
        if (background1 === background2) return 1.0;

        // Matrice de compatibilité culturelle avancée
        const compatibilityMatrix: Record<string, number> = {
            // Compatibilités très élevées
            'deaf_community-hard_of_hearing': 0.9,
            'deaf_community-mixed_background': 0.8,
            'hard_of_hearing-mixed_background': 0.85,
            
            // Compatibilités moyennes-élevées
            'deaf_community-hearing_family': 0.7,
            'hard_of_hearing-hearing_family': 0.8,
            'mixed_background-hearing_family': 0.75,
            
            // Compatibilités spéciales pour international
            'deaf_community-international': 0.65,
            'hard_of_hearing-international': 0.7,
            'mixed_background-international': 0.8,
            'hearing_family-international': 0.6,
            
            // Compatibilités pour late_deafened
            'deaf_community-late_deafened': 0.75,
            'hard_of_hearing-late_deafened': 0.85,
            'mixed_background-late_deafened': 0.8,
            'hearing_family-late_deafened': 0.7,
            'international-late_deafened': 0.65
        };

        const key1 = `${background1}-${background2}`;
        const key2 = `${background2}-${background1}`;

        return compatibilityMatrix[key1] || compatibilityMatrix[key2] || 0.5;
    }

    /**
     * Calcule la compatibilité des styles d'apprentissage
     * @private
     */
    private calculateLearningStyleCompatibility(style1: LearningStyle, style2: LearningStyle): number {
        if (style1 === style2) return 1.0;

        // Matrice de compatibilité des styles d'apprentissage
        const styleCompatibilityMatrix: Record<string, number> = {
            // Styles complémentaires
            'visual-spatial': 0.9,
            'visual-analytical': 0.8,
            'kinesthetic-spatial': 0.85,
            'analytical-intuitive': 0.7,
            'social-independent': 0.6,
            
            // Styles modérément compatibles
            'visual-kinesthetic': 0.75,
            'visual-social': 0.7,
            'kinesthetic-social': 0.8,
            'analytical-social': 0.65,
            'intuitive-social': 0.85,
            'spatial-independent': 0.7,
            
            // Styles peu compatibles mais workable
            'visual-independent': 0.6,
            'kinesthetic-analytical': 0.6,
            'kinesthetic-independent': 0.65,
            'analytical-independent': 0.8,
            'intuitive-independent': 0.7,
            'spatial-social': 0.75
        };

        const key1 = `${style1}-${style2}`;
        const key2 = `${style2}-${style1}`;

        return styleCompatibilityMatrix[key1] || styleCompatibilityMatrix[key2] || 0.5;
    }

    /**
     * Calcule la compatibilité des motivations
     * @private
     */
    private calculateMotivationCompatibility(
        factors1: readonly MotivationFactor[],
        factors2: readonly MotivationFactor[]
    ): number {
        const commonFactors = factors1.filter(f => factors2.includes(f));
        const totalUniqueFactors = new Set([...factors1, ...factors2]).size;

        if (totalUniqueFactors === 0) return 0.5;

        // Score de base basé sur le chevauchement
        const overlapScore = commonFactors.length / Math.max(factors1.length, factors2.length);

        // Bonus pour les motivations complémentaires
        const complementaryPairs = [
            ['achievement', 'recognition'],
            ['mastery', 'challenge'],
            ['social_interaction', 'helping_others'],
            ['creativity', 'personal_growth'],
            ['cultural_pride', 'social_interaction']
        ];

        let complementaryBonus = 0;
        complementaryPairs.forEach(([factor1, factor2]) => {
            if ((factors1.includes(factor1 as MotivationFactor) && factors2.includes(factor2 as MotivationFactor)) ||
                (factors1.includes(factor2 as MotivationFactor) && factors2.includes(factor1 as MotivationFactor))) {
                complementaryBonus += 0.1;
            }
        });

        return Math.min(1, overlapScore + complementaryBonus);
    }

    /**
     * Calcule la compatibilité des styles de feedback
     * @private
     */
    private calculateFeedbackStyleCompatibility(style1: FeedbackStyle, style2: FeedbackStyle): number {
        if (style1 === style2) return 1.0;

        // Matrice de compatibilité des styles de feedback
        const feedbackCompatibilityMatrix: Record<string, number> = {
            'positive_reinforcement-constructive_criticism': 0.7,
            'positive_reinforcement-visual_cues': 0.8,
            'positive_reinforcement-peer_feedback': 0.9,
            'positive_reinforcement-progress_tracking': 0.85,
            'constructive_criticism-detailed_analysis': 0.9,
            'constructive_criticism-immediate_correction': 0.8,
            'visual_cues-progress_tracking': 0.85,
            'visual_cues-immediate_correction': 0.75,
            'peer_feedback-progress_tracking': 0.8,
            'detailed_analysis-immediate_correction': 0.7,
            'detailed_analysis-progress_tracking': 0.9
        };

        const key1 = `${style1}-${style2}`;
        const key2 = `${style2}-${style1}`;

        return feedbackCompatibilityMatrix[key1] || feedbackCompatibilityMatrix[key2] || 0.6;
    }

    /**
     * Calcule la compatibilité pondérée globale
     * @private
     */
    private calculateWeightedCompatibility(scores: {
        traitCompatibility: number;
        culturalCompatibility: number;
        learningStyleCompatibility: number;
        motivationCompatibility: number;
        feedbackStyleCompatibility: number;
    }): number {
        const weights = {
            traitCompatibility: 0.3,
            culturalCompatibility: 0.25,
            learningStyleCompatibility: 0.2,
            motivationCompatibility: 0.15,
            feedbackStyleCompatibility: 0.1
        };

        return Object.entries(scores).reduce((total, [key, score]) => {
            return total + (score * weights[key as keyof typeof weights]);
        }, 0);
    }

    /**
     * Analyse les forces et défis de la compatibilité
     * @private
     */
    private analyzeCompatibilityInsights(
        profile1: AIPersonalityProfile,
        profile2: AIPersonalityProfile,
        scores: Record<string, number>
    ): { strengths: readonly string[]; challenges: readonly string[] } {
        const strengths: string[] = [];
        const challenges: string[] = [];

        // Analyse des traits
        if (scores.traitCompatibility > 0.8) {
            strengths.push('Traits de personnalité très compatibles');
        } else if (scores.traitCompatibility < 0.4) {
            challenges.push('Différences significatives dans les traits de personnalité');
        }

        // Analyse culturelle
        if (scores.culturalCompatibility > 0.8) {
            strengths.push('Excellente compatibilité culturelle LSF');
        } else if (scores.culturalCompatibility < 0.5) {
            challenges.push('Différences culturelles nécessitant une adaptation');
        }

        // Analyse des styles d'apprentissage
        if (scores.learningStyleCompatibility > 0.8) {
            strengths.push('Styles d\'apprentissage complémentaires');
        } else if (scores.learningStyleCompatibility < 0.5) {
            challenges.push('Styles d\'apprentissage nécessitant des approches différenciées');
        }

        // Analyse des motivations
        if (scores.motivationCompatibility > 0.7) {
            strengths.push('Motivations alignées favorisant la collaboration');
        } else if (scores.motivationCompatibility < 0.4) {
            challenges.push('Motivations divergentes nécessitant une approche personnalisée');
        }

        // Analyses spécifiques aux traits
        const neuroticism1 = profile1.bigFiveTraits.neuroticism;
        const neuroticism2 = profile2.bigFiveTraits.neuroticism;
        
        if (Math.abs(neuroticism1 - neuroticism2) > 0.4) {
            if (Math.min(neuroticism1, neuroticism2) < 0.4) {
                strengths.push('Complémentarité émotionnelle stabilisante');
            } else {
                challenges.push('Niveaux de stress élevés des deux côtés');
            }
        }

        return { strengths, challenges };
    }

    /**
     * Génère des recommandations basées sur la compatibilité
     * @private
     */
    private generateCompatibilityRecommendations(
        overallCompatibility: number,
        strengths: readonly string[],
        challenges: readonly string[]
    ): readonly string[] {
        const recommendations: string[] = [];

        if (overallCompatibility > 0.8) {
            recommendations.push('Excellente compatibilité - favoriser les interactions fréquentes');
            recommendations.push('Utiliser cette paire pour du mentorat peer-to-peer');
        } else if (overallCompatibility > 0.6) {
            recommendations.push('Bonne compatibilité - structurer les interactions pour maximiser les forces');
            if (challenges.length > 0) {
                recommendations.push('Adresser les défis identifiés avec un accompagnement ciblé');
            }
        } else if (overallCompatibility > 0.4) {
            recommendations.push('Compatibilité modérée - supervision recommandée pour les interactions');
            recommendations.push('Mettre l\'accent sur les points communs identifiés');
        } else {
            recommendations.push('Compatibilité faible - limiter les interactions directes');
            recommendations.push('Privilégier des approches d\'apprentissage individualisées');
        }

        // Recommandations spécifiques basées sur les forces
        if (strengths.includes('Excellente compatibilité culturelle LSF')) {
            recommendations.push('Exploiter la base culturelle commune pour renforcer la connection');
        }

        if (strengths.includes('Styles d\'apprentissage complémentaires')) {
            recommendations.push('Organiser des sessions d\'apprentissage collaboratives');
        }

        // Recommandations basées sur les défis
        if (challenges.includes('Différences significatives dans les traits de personnalité')) {
            recommendations.push('Adapter la communication aux différences de personnalité');
        }

        if (challenges.includes('Styles d\'apprentissage nécessitant des approches différenciées')) {
            recommendations.push('Proposer des contenus multi-modaux adaptés aux deux styles');
        }

        return recommendations;
    }
}