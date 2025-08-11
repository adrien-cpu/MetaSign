/**
 * @file src/ai/services/learning/human/coda/codavirtuel/services/CompatibilityCalculator.ts
 * @description Service spécialisé pour les calculs de compatibilité mentor-IA
 * 
 * Responsabilités :
 * - 🧮 Calculs de scores de compatibilité
 * - 🎯 Évaluation des alignements personnalité/culture
 * - 📊 Pondération des métriques
 * - ✨ Compatible exactOptionalPropertyTypes: true
 * 
 * @module services
 * @version 4.0.0 - Calculateur de compatibilité CODA
 * @since 2025
 * @author MetaSign Team - CODA Compatibility Calculator
 * @lastModified 2025-07-31
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type {
    MentorProfile,
    ComprehensiveAIStatus,
    TeachingSession,
    CompatibilityScores,
    TeachingStyleConfig,
    CompatibilityThresholds
} from '../types/CompatibilityTypes';

/**
 * Service de calcul de compatibilité pour le système CODA
 * 
 * @class CompatibilityCalculator
 * @description Service spécialisé dans le calcul des scores de compatibilité
 * entre mentors et IA-élèves, avec gestion des pondérations et seuils.
 * 
 * @example
 * ```typescript
 * const calculator = new CompatibilityCalculator();
 * 
 * const scores = calculator.calculateCompatibilityScores(
 *   mentorProfile, aiStudent, sessions
 * );
 * 
 * const overallScore = calculator.calculateWeightedOverallScore(scores);
 * ```
 */
export class CompatibilityCalculator {
    /**
     * Logger pour le calculateur de compatibilité
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('CompatibilityCalculator');

    /**
     * Mappings des types de personnalité et leur compatibilité
     * @private
     * @readonly
     */
    private readonly personalityCompatibilityMatrix = new Map([
        ['analytical-analytical', 0.95],
        ['analytical-logical', 0.9],
        ['analytical-methodical', 0.85],
        ['creative-intuitive', 0.9],
        ['creative-adaptive', 0.85],
        ['empathetic-social', 0.9],
        ['empathetic-adaptive', 0.85],
        ['methodical-structured', 0.95],
        ['methodical-analytical', 0.85],
        ['adaptive-flexible', 0.95],
        ['adaptive-creative', 0.8],
        ['social-empathetic', 0.9],
        // Compatibilités croisées par défaut
        ['default', 0.7]
    ]);

    /**
     * Configurations des styles d'enseignement
     * @private
     * @readonly
     */
    private readonly teachingStyles: Record<string, TeachingStyleConfig> = {
        directive: { effectiveness: 0.8, adaptability: 0.6 },
        collaborative: { effectiveness: 0.9, adaptability: 0.8 },
        supportive: { effectiveness: 0.85, adaptability: 0.9 },
        delegative: { effectiveness: 0.7, adaptability: 0.7 },
        adaptive: { effectiveness: 0.95, adaptability: 0.95 },
        methodical: { effectiveness: 0.85, adaptability: 0.75 },
        creative: { effectiveness: 0.8, adaptability: 0.85 },
        analytical: { effectiveness: 0.9, adaptability: 0.7 }
    } as const;

    /**
     * Seuils pour l'évaluation de compatibilité
     * @private
     * @readonly
     */
    private readonly compatibilityThresholds: CompatibilityThresholds = {
        excellent: 0.9,
        good: 0.75,
        adequate: 0.6,
        needsImprovement: 0.45,
        poor: 0.3
    } as const;

    /**
     * Constructeur du calculateur de compatibilité
     * 
     * @constructor
     */
    constructor() {
        this.logger.info('🧮 CompatibilityCalculator initialisé');
    }

    /**
     * Calcule tous les scores de compatibilité
     * 
     * @method calculateCompatibilityScores
     * @param {MentorProfile} mentorProfile - Profil du mentor
     * @param {ComprehensiveAIStatus} aiStudent - État de l'IA-élève
     * @param {readonly TeachingSession[]} [sessions] - Sessions pour contexte
     * @returns {CompatibilityScores} Scores de compatibilité détaillés
     * @public
     */
    public calculateCompatibilityScores(
        mentorProfile: MentorProfile,
        aiStudent: ComprehensiveAIStatus,
        sessions?: readonly TeachingSession[]
    ): CompatibilityScores {
        try {
            this.logger.debug('🧮 Calcul scores compatibilité', {
                mentorId: mentorProfile.id,
                aiStudentName: aiStudent.name
            });

            const personalityCompatibility = this.calculatePersonalityCompatibility(
                mentorProfile, aiStudent
            );

            const culturalCompatibility = this.calculateCulturalCompatibility(
                mentorProfile, aiStudent
            );

            const teachingStyleCompatibility = this.calculateTeachingStyleCompatibility(
                mentorProfile, aiStudent
            );

            const experienceAlignment = this.calculateExperienceAlignment(
                mentorProfile, aiStudent
            );

            const methodologyMatch = this.calculateMethodologyMatch(
                mentorProfile, aiStudent, sessions
            );

            const scores: CompatibilityScores = {
                personalityCompatibility,
                culturalCompatibility,
                teachingStyleCompatibility,
                experienceAlignment,
                methodologyMatch
            };

            // Conversion pour le logging compatible avec exactOptionalPropertyTypes
            const scoresForLogging = {
                personalityCompatibility: scores.personalityCompatibility,
                culturalCompatibility: scores.culturalCompatibility,
                teachingStyleCompatibility: scores.teachingStyleCompatibility,
                experienceAlignment: scores.experienceAlignment,
                methodologyMatch: scores.methodologyMatch,
                averageScore: this.calculateWeightedOverallScore(scores)
            };

            this.logger.debug('✅ Scores calculés', scoresForLogging);
            return scores;

        } catch (error) {
            this.logger.error('❌ Erreur calcul scores', { error });
            return this.createDefaultCompatibilityScores();
        }
    }

    /**
     * Calcule le score global pondéré
     * 
     * @method calculateWeightedOverallScore
     * @param {CompatibilityScores} scores - Scores individuels
     * @returns {number} Score global pondéré
     * @public
     */
    public calculateWeightedOverallScore(scores: CompatibilityScores): number {
        const weightedScore = (
            scores.personalityCompatibility * 0.25 +
            scores.culturalCompatibility * 0.2 +
            scores.teachingStyleCompatibility * 0.25 +
            scores.experienceAlignment * 0.15 +
            scores.methodologyMatch * 0.15
        );

        this.logger.debug('📊 Score global calculé', {
            weightedScore: Number(weightedScore.toFixed(3)),
            components: {
                personality: Number((scores.personalityCompatibility * 0.25).toFixed(3)),
                cultural: Number((scores.culturalCompatibility * 0.2).toFixed(3)),
                teachingStyle: Number((scores.teachingStyleCompatibility * 0.25).toFixed(3)),
                experience: Number((scores.experienceAlignment * 0.15).toFixed(3)),
                methodology: Number((scores.methodologyMatch * 0.15).toFixed(3))
            }
        });

        return Number(weightedScore.toFixed(3));
    }

    /**
     * Obtient les seuils de compatibilité
     * 
     * @method getCompatibilityThresholds
     * @returns {CompatibilityThresholds} Seuils configurés
     * @public
     */
    public getCompatibilityThresholds(): CompatibilityThresholds {
        return { ...this.compatibilityThresholds };
    }

    /**
     * Évalue le niveau de compatibilité basé sur le score
     * 
     * @method evaluateCompatibilityLevel
     * @param {number} score - Score à évaluer
     * @returns {keyof CompatibilityThresholds} Niveau de compatibilité
     * @public
     */
    public evaluateCompatibilityLevel(score: number): keyof CompatibilityThresholds {
        if (score >= this.compatibilityThresholds.excellent) return 'excellent';
        if (score >= this.compatibilityThresholds.good) return 'good';
        if (score >= this.compatibilityThresholds.adequate) return 'adequate';
        if (score >= this.compatibilityThresholds.needsImprovement) return 'needsImprovement';
        return 'poor';
    }

    // ==================== MÉTHODES PRIVÉES DE CALCUL ====================

    /**
     * Calcule la compatibilité des personnalités
     * 
     * @private
     * @param {MentorProfile} mentorProfile - Profil du mentor
     * @param {ComprehensiveAIStatus} aiStudent - État de l'IA-élève
     * @returns {number} Score de compatibilité personnalité (0-1)
     */
    private calculatePersonalityCompatibility(
        mentorProfile: MentorProfile,
        aiStudent: ComprehensiveAIStatus
    ): number {
        const key = `${mentorProfile.personality}-${aiStudent.personality}`;
        const reverseKey = `${aiStudent.personality}-${mentorProfile.personality}`;

        const compatibilityScore = this.personalityCompatibilityMatrix.get(key) ||
            this.personalityCompatibilityMatrix.get(reverseKey) ||
            this.personalityCompatibilityMatrix.get('default') ||
            0.7;

        this.logger.debug('🧠 Compatibilité personnalité calculée', {
            mentorPersonality: mentorProfile.personality,
            aiPersonality: aiStudent.personality,
            compatibilityKey: key,
            score: compatibilityScore
        });

        return compatibilityScore;
    }

    /**
     * Calcule la compatibilité culturelle
     * 
     * @private
     * @param {MentorProfile} mentorProfile - Profil du mentor
     * @param {ComprehensiveAIStatus} aiStudent - État de l'IA-élève
     * @returns {number} Score de compatibilité culturelle (0-1)
     */
    private calculateCulturalCompatibility(
        mentorProfile: MentorProfile,
        aiStudent: ComprehensiveAIStatus
    ): number {
        if (mentorProfile.culturalBackground === aiStudent.culturalContext) {
            this.logger.debug('🌍 Parfait alignement culturel détecté', {
                sharedCulture: mentorProfile.culturalBackground
            });
            return 0.95;
        }

        // Calculer compatibilité cross-culturelle
        const adaptabilityBonus = mentorProfile.adaptabilityScore * 0.3;
        const baseCompatibility = 0.6;

        // Bonus pour certaines compatibilités culturelles
        const culturalBonus = this.getCulturalBonus(
            mentorProfile.culturalBackground,
            aiStudent.culturalContext
        );

        const finalScore = Math.min(0.95, baseCompatibility + adaptabilityBonus + culturalBonus);

        this.logger.debug('🌍 Compatibilité culturelle calculée', {
            mentorCulture: mentorProfile.culturalBackground,
            aiCulture: aiStudent.culturalContext,
            adaptabilityScore: mentorProfile.adaptabilityScore,
            adaptabilityBonus,
            culturalBonus,
            finalScore
        });

        return finalScore;
    }

    /**
     * Calcule la compatibilité de style d'enseignement
     * 
     * @private
     * @param {MentorProfile} mentorProfile - Profil du mentor
     * @param {ComprehensiveAIStatus} aiStudent - État de l'IA-élève
     * @returns {number} Score de compatibilité style d'enseignement (0-1)
     */
    private calculateTeachingStyleCompatibility(
        mentorProfile: MentorProfile,
        aiStudent: ComprehensiveAIStatus
    ): number {
        const styleConfig = this.teachingStyles[mentorProfile.teachingStyle];
        if (!styleConfig) {
            this.logger.warn('Style d\'enseignement non reconnu', {
                style: mentorProfile.teachingStyle
            });
            return 0.7;
        }

        // Ajuster selon les préférences d'apprentissage de l'IA
        const personalityBonus = this.getPersonalityTeachingBonus(
            aiStudent.personality,
            mentorProfile.teachingStyle
        );

        const finalScore = Math.min(1, styleConfig.effectiveness + personalityBonus);

        this.logger.debug('🎯 Compatibilité style d\'enseignement calculée', {
            teachingStyle: mentorProfile.teachingStyle,
            baseEffectiveness: styleConfig.effectiveness,
            aiPersonality: aiStudent.personality,
            personalityBonus,
            finalScore
        });

        return finalScore;
    }

    /**
     * Calcule l'alignement d'expérience
     * 
     * @private
     * @param {MentorProfile} mentorProfile - Profil du mentor
     * @param {ComprehensiveAIStatus} aiStudent - État de l'IA-élève
     * @returns {number} Score d'alignement expérience (0-1)
     */
    private calculateExperienceAlignment(
        mentorProfile: MentorProfile,
        aiStudent: ComprehensiveAIStatus
    ): number {
        // Plus d'expérience = meilleur alignement pour niveaux débutants
        const experienceScore = Math.min(1, mentorProfile.experience / 5); // 5 ans = score parfait

        const levelMultiplier = this.getLevelExperienceMultiplier(aiStudent.currentLevel);

        const finalScore = experienceScore * levelMultiplier;

        this.logger.debug('📚 Alignement expérience calculé', {
            mentorExperience: mentorProfile.experience,
            aiLevel: aiStudent.currentLevel,
            experienceScore,
            levelMultiplier,
            finalScore
        });

        return finalScore;
    }

    /**
     * Calcule la correspondance méthodologique
     * 
     * @private
     * @param {MentorProfile} mentorProfile - Profil du mentor
     * @param {ComprehensiveAIStatus} aiStudent - État de l'IA-élève
     * @param {readonly TeachingSession[]} [sessions] - Sessions pour contexte
     * @returns {number} Score de correspondance méthodologique (0-1)
     */
    private calculateMethodologyMatch(
        mentorProfile: MentorProfile,
        aiStudent: ComprehensiveAIStatus,
        sessions?: readonly TeachingSession[]
    ): number {
        // Base sur correspondance entre méthodes préférées du mentor et besoins de l'IA
        const methodsScore = mentorProfile.preferredMethods.length > 0 ? 0.8 : 0.6;

        // Bonus selon spécialisations
        const specializationBonus = this.getSpecializationBonus(
            mentorProfile.specializations,
            aiStudent.currentLevel
        );

        // Bonus si sessions montrent une bonne adaptation méthodologique
        const sessionBonus = this.getSessionMethodologyBonus(sessions);

        const finalScore = Math.min(1, methodsScore + specializationBonus + sessionBonus);

        this.logger.debug('⚙️ Correspondance méthodologique calculée', {
            mentorMethodsCount: mentorProfile.preferredMethods.length,
            mentorSpecializations: mentorProfile.specializations,
            aiLevel: aiStudent.currentLevel,
            methodsScore,
            specializationBonus,
            sessionBonus,
            finalScore
        });

        return finalScore;
    }

    // ==================== MÉTHODES UTILITAIRES ====================

    /**
     * Obtient le bonus de compatibilité culturelle
     * 
     * @private
     * @param {string} mentorCulture - Culture du mentor
     * @param {string} aiCulture - Culture de l'IA
     * @returns {number} Bonus culturel (0-0.1)
     */
    private getCulturalBonus(mentorCulture: string, aiCulture: string): number {
        const compatiblePairs = [
            ['france_metropolitan', 'belgium'],
            ['france_metropolitan', 'switzerland'],
            ['france_outremer', 'multicultural'],
            ['canada_quebec', 'multicultural']
        ];

        const isCompatible = compatiblePairs.some(([a, b]) =>
            (a === mentorCulture && b === aiCulture) ||
            (b === mentorCulture && a === aiCulture)
        );

        return isCompatible ? 0.1 : 0;
    }

    /**
     * Obtient le bonus personnalité-enseignement
     * 
     * @private
     * @param {string} personality - Personnalité de l'IA
     * @param {string} teachingStyle - Style d'enseignement du mentor
     * @returns {number} Bonus personnalité (0-0.15)
     */
    private getPersonalityTeachingBonus(personality: string, teachingStyle: string): number {
        const bonuses = new Map([
            ['analytical-methodical', 0.1],
            ['analytical-directive', 0.05],
            ['creative-adaptive', 0.1],
            ['creative-collaborative', 0.05],
            ['empathetic-supportive', 0.1],
            ['social-collaborative', 0.1],
            ['methodical-directive', 0.05],
            ['adaptive-adaptive', 0.15]
        ]);

        return bonuses.get(`${personality}-${teachingStyle}`) || 0;
    }

    /**
     * Obtient le multiplicateur niveau-expérience
     * 
     * @private
     * @param {string} level - Niveau CECRL de l'IA
     * @returns {number} Multiplicateur d'expérience (0.75-1.0)
     */
    private getLevelExperienceMultiplier(level: string): number {
        const multipliers = new Map([
            ['A1', 1.0],
            ['A2', 0.95],
            ['B1', 0.9],
            ['B2', 0.85],
            ['C1', 0.8],
            ['C2', 0.75]
        ]);

        return multipliers.get(level) || 0.8;
    }

    /**
     * Obtient le bonus de spécialisation
     * 
     * @private
     * @param {readonly string[]} specializations - Spécialisations du mentor
     * @param {string} level - Niveau de l'IA
     * @returns {number} Bonus de spécialisation (0-0.1)
     */
    private getSpecializationBonus(specializations: readonly string[], level: string): number {
        if (specializations.length === 0) return 0;

        const relevantSpecializations = specializations.filter(spec =>
            (spec.includes('debutant') && ['A1', 'A2'].includes(level)) ||
            (spec.includes('avance') && ['C1', 'C2'].includes(level)) ||
            (spec.includes('intermediaire') && ['B1', 'B2'].includes(level))
        );

        return relevantSpecializations.length > 0 ? 0.1 : 0.05;
    }

    /**
     * Obtient le bonus méthodologique des sessions
     * 
     * @private
     * @param {readonly TeachingSession[]} [sessions] - Sessions d'enseignement
     * @returns {number} Bonus méthodologique (0-0.2)
     */
    private getSessionMethodologyBonus(sessions?: readonly TeachingSession[]): number {
        if (!sessions || sessions.length === 0) return 0;

        const recentSessions = sessions.slice(-3);
        const avgEffectiveness = recentSessions.reduce(
            (sum, session) => sum + session.metrics.teachingEffectiveness, 0
        ) / recentSessions.length;

        const bonus = Math.min(0.2, (avgEffectiveness - 0.7) * 0.4);

        this.logger.debug('📊 Bonus méthodologique sessions calculé', {
            sessionsAnalyzed: recentSessions.length,
            averageEffectiveness: Number(avgEffectiveness.toFixed(3)),
            calculatedBonus: Number(bonus.toFixed(3))
        });

        return bonus;
    }

    /**
     * Crée des scores par défaut en cas d'erreur
     * 
     * @private
     * @returns {CompatibilityScores} Scores par défaut
     */
    private createDefaultCompatibilityScores(): CompatibilityScores {
        this.logger.warn('🔄 Utilisation des scores de compatibilité par défaut');

        return {
            personalityCompatibility: 0.7,
            culturalCompatibility: 0.7,
            teachingStyleCompatibility: 0.7,
            experienceAlignment: 0.7,
            methodologyMatch: 0.7
        };
    }
}