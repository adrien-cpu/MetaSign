/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/PersonalityAnalysisEngine.ts
 * @description Moteur d'analyse avancé pour l'évolution dynamique des profils de personnalité
 * 
 * Fonctionnalités spécialisées :
 * - 🧠 Analyse des patterns d'interaction
 * - 📊 Calcul des ajustements de traits Big Five
 * - 🔍 Détection des changements de style d'apprentissage
 * - 📈 Génération de recommandations d'adaptation
 * - 🎯 Calcul de confiance d'analyse
 * 
 * @module PersonalityAnalysisEngine
 * @version 1.0.0 - Extraction SOLID
 * @since 2025
 * @author MetaSign Team - Personality Analysis Division
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type {
    AIPersonalityProfile,
    BigFiveTraits,
    InteractionData,
    PersonalityChange,
    LearningStyle,
    PersonalitySystemConfig
} from './AIPersonalitySystem';

/**
 * Moteur d'analyse spécialisé pour les profils de personnalité
 * 
 * @class PersonalityAnalysisEngine
 * @description Responsable de l'analyse des interactions et de l'évolution des traits
 */
export class PersonalityAnalysisEngine {
    private readonly logger = LoggerFactory.getLogger('PersonalityAnalysisEngine');
    private readonly config: PersonalitySystemConfig;

    constructor(config: PersonalitySystemConfig) {
        this.config = config;
        this.logger.info('🧠 Moteur d\'analyse de personnalité initialisé');
    }

    /**
     * Analyse les patterns dans les interactions
     * @param interactions - Liste des interactions à analyser
     * @returns Patterns détectés avec métriques
     */
    public analyzeInteractionPatterns(interactions: readonly InteractionData[]): Record<string, number> {
        const patterns: Record<string, number> = {};

        if (interactions.length === 0) return patterns;

        // Analyser la performance moyenne
        patterns.averagePerformance = interactions.reduce((sum, i) => sum + i.performance, 0) / interactions.length;

        // Analyser le niveau de frustration
        patterns.averageFrustration = interactions.reduce((sum, i) => sum + i.frustrationLevel, 0) / interactions.length;

        // Analyser l'engagement
        patterns.averageEngagement = interactions.reduce((sum, i) => sum + i.engagementLevel, 0) / interactions.length;

        // Analyser la persistance (temps passé)
        patterns.averageTimeSpent = interactions.reduce((sum, i) => sum + i.timeSpent, 0) / interactions.length;

        // Analyser la variabilité de performance
        const performances = interactions.map(i => i.performance);
        const perfMean = patterns.averagePerformance;
        const perfVariance = performances.reduce((sum, p) => sum + Math.pow(p - perfMean, 2), 0) / performances.length;
        patterns.performanceStability = 1 - Math.sqrt(perfVariance); // Stabilité inverse de la variance

        this.logger.debug('📊 Patterns d\'interaction analysés', {
            interactionCount: interactions.length,
            avgPerformance: patterns.averagePerformance.toFixed(2),
            avgEngagement: patterns.averageEngagement.toFixed(2)
        });

        return patterns;
    }

    /**
     * Calcule les ajustements de traits Big Five basés sur les patterns
     * @param profile - Profil de personnalité actuel
     * @param patterns - Patterns d'interaction détectés
     * @returns Ajustements proposés pour les traits
     */
    public calculateTraitAdjustments(
        profile: AIPersonalityProfile,
        patterns: Record<string, number>
    ): Partial<BigFiveTraits> {
        const adjustments: Record<string, number> = {};

        // Ajuster le neuroticisme basé sur la frustration
        if (patterns.averageFrustration !== undefined) {
            const frustrationImpact = (patterns.averageFrustration - 0.5) * this.config.temporalAdaptationFactor;
            const newNeuroticism = Math.max(0, Math.min(1, 
                profile.bigFiveTraits.neuroticism + frustrationImpact
            ));
            if (Math.abs(newNeuroticism - profile.bigFiveTraits.neuroticism) > 0.05) {
                adjustments.neuroticism = newNeuroticism;
            }
        }

        // Ajuster la conscienciosité basée sur la persistance
        if (patterns.averageTimeSpent !== undefined) {
            const persistenceScore = Math.min(patterns.averageTimeSpent / 300000, 1); // Normaliser sur 5 minutes
            const persistenceImpact = (persistenceScore - 0.5) * this.config.temporalAdaptationFactor;
            const newConscientiousness = Math.max(0, Math.min(1,
                profile.bigFiveTraits.conscientiousness + persistenceImpact
            ));
            if (Math.abs(newConscientiousness - profile.bigFiveTraits.conscientiousness) > 0.05) {
                adjustments.conscientiousness = newConscientiousness;
            }
        }

        // Ajuster l'ouverture basée sur la variété d'exercices
        if (patterns.performanceStability !== undefined) {
            const openessImpact = (1 - patterns.performanceStability) * this.config.temporalAdaptationFactor * 0.5;
            const newOpenness = Math.max(0, Math.min(1,
                profile.bigFiveTraits.openness + openessImpact
            ));
            if (Math.abs(newOpenness - profile.bigFiveTraits.openness) > 0.05) {
                adjustments.openness = newOpenness;
            }
        }

        // Ajuster l'extraversion basée sur l'engagement social
        if (patterns.averageEngagement !== undefined) {
            const engagementImpact = (patterns.averageEngagement - 0.5) * this.config.temporalAdaptationFactor * 0.3;
            const newExtraversion = Math.max(0, Math.min(1,
                profile.bigFiveTraits.extraversion + engagementImpact
            ));
            if (Math.abs(newExtraversion - profile.bigFiveTraits.extraversion) > 0.05) {
                adjustments.extraversion = newExtraversion;
            }
        }

        // Ajuster l'agréabilité basée sur la performance en contexte social
        if (patterns.averagePerformance !== undefined && patterns.averageEngagement !== undefined) {
            const socialPerformanceScore = (patterns.averagePerformance + patterns.averageEngagement) / 2;
            const agreeabilityImpact = (socialPerformanceScore - 0.5) * this.config.temporalAdaptationFactor * 0.2;
            const newAgreeableness = Math.max(0, Math.min(1,
                profile.bigFiveTraits.agreeableness + agreeabilityImpact
            ));
            if (Math.abs(newAgreeableness - profile.bigFiveTraits.agreeableness) > 0.05) {
                adjustments.agreeableness = newAgreeableness;
            }
        }

        this.logger.debug('🔄 Ajustements de traits calculés', {
            adjustmentCount: Object.keys(adjustments).length,
            traits: Object.keys(adjustments)
        });

        return adjustments as Partial<BigFiveTraits>;
    }

    /**
     * Détecte les changements de style d'apprentissage
     * @param profile - Profil actuel
     * @param patterns - Patterns d'interaction
     * @returns Suggestions de nouveau style d'apprentissage
     */
    public detectLearningStyleChanges(
        profile: AIPersonalityProfile,
        patterns: Record<string, number>
    ): { newLearningStyle?: LearningStyle } {
        const changes: { newLearningStyle?: LearningStyle } = {};

        // Si performance faible et frustration élevée, suggérer un style différent
        if (patterns.averagePerformance < 0.4 && patterns.averageFrustration > 0.7) {
            const alternativeStyles: Record<LearningStyle, LearningStyle> = {
                'visual': 'kinesthetic',
                'kinesthetic': 'spatial',
                'spatial': 'analytical',
                'analytical': 'intuitive',
                'intuitive': 'social',
                'social': 'independent',
                'independent': 'visual'
            };

            changes.newLearningStyle = alternativeStyles[profile.learningStyle];

            this.logger.info('🔄 Changement de style d\'apprentissage suggéré', {
                currentStyle: profile.learningStyle,
                suggestedStyle: changes.newLearningStyle,
                reason: 'Performance faible et frustration élevée'
            });
        }

        // Si engagement très faible, basculer vers un style plus interactif
        if (patterns.averageEngagement < 0.3 && ['independent', 'analytical'].includes(profile.learningStyle)) {
            changes.newLearningStyle = patterns.averagePerformance > 0.6 ? 'social' : 'visual';

            this.logger.info('🔄 Changement vers style interactif suggéré', {
                currentStyle: profile.learningStyle,
                suggestedStyle: changes.newLearningStyle,
                reason: 'Engagement très faible'
            });
        }

        return changes;
    }

    /**
     * Détecte tous les changements entre profils
     * @param oldProfile - Ancien profil
     * @param newProfile - Nouveau profil
     * @returns Liste des changements détectés
     */
    public detectAllChanges(
        oldProfile: AIPersonalityProfile,
        newProfile: AIPersonalityProfile
    ): readonly PersonalityChange[] {
        const changes: PersonalityChange[] = [];

        // Changements de traits Big Five
        Object.entries(newProfile.bigFiveTraits).forEach(([trait, newValue]) => {
            const oldValue = oldProfile.bigFiveTraits[trait as keyof BigFiveTraits];
            const changeMagnitude = Math.abs(newValue - oldValue);
            
            if (changeMagnitude > 0.05) { // Seuil de changement significatif
                changes.push({
                    trait: trait as keyof BigFiveTraits,
                    oldValue,
                    newValue,
                    changeMagnitude,
                    reason: this.generateChangeReason(trait as keyof BigFiveTraits, changeMagnitude)
                });
            }
        });

        // Changement de style d'apprentissage
        if (oldProfile.learningStyle !== newProfile.learningStyle) {
            changes.push({
                trait: 'learningStyle',
                oldValue: oldProfile.learningStyle,
                newValue: newProfile.learningStyle,
                changeMagnitude: 1,
                reason: 'Style d\'apprentissage adapté pour améliorer les performances'
            });
        }

        this.logger.debug('🔍 Changements détectés', {
            changeCount: changes.length,
            significantChanges: changes.filter(c => c.changeMagnitude > 0.1).length
        });

        return changes;
    }

    /**
     * Génère des recommandations d'adaptation
     * @param profile - Profil mis à jour
     * @param patterns - Patterns d'interaction
     * @param changes - Changements détectés
     * @returns Recommandations personnalisées
     */
    public generateAdaptationRecommendations(
        profile: AIPersonalityProfile,
        patterns: Record<string, number>,
        changes: readonly PersonalityChange[]
    ): readonly string[] {
        const recommendations: string[] = [];

        // Recommandations basées sur le neuroticisme
        if (profile.bigFiveTraits.neuroticism > 0.7) {
            recommendations.push('Proposer des exercices moins stressants avec feedback positif fréquent');
            recommendations.push('Introduire des pauses régulières pour gérer l\'anxiété');
        }

        // Recommandations basées sur la conscienciosité
        if (profile.bigFiveTraits.conscientiousness < 0.4) {
            recommendations.push('Structurer davantage les exercices avec objectifs clairs');
            recommendations.push('Implémenter un système de rappels et de planification');
        }

        // Recommandations basées sur l'extraversion
        if (profile.bigFiveTraits.extraversion > 0.7) {
            recommendations.push('Favoriser les exercices collaboratifs et interactions sociales');
        } else if (profile.bigFiveTraits.extraversion < 0.3) {
            recommendations.push('Proposer des activités individuelles avec progression autonome');
        }

        // Recommandations basées sur la performance
        if (patterns.averagePerformance < 0.5) {
            recommendations.push('Ajuster la difficulté des exercices pour améliorer le taux de réussite');
        }

        // Recommandations basées sur l'engagement
        if (patterns.averageEngagement < 0.4) {
            recommendations.push('Introduire des éléments de gamification pour augmenter l\'engagement');
        }

        // Recommandations basées sur les changements
        if (changes.length > 3) {
            recommendations.push('Période d\'adaptation détectée, maintenir la cohérence pédagogique');
        }

        // Recommandations spécifiques au style d'apprentissage
        switch (profile.learningStyle) {
            case 'visual':
                recommendations.push('Privilégier les supports visuels et diagrammes');
                break;
            case 'kinesthetic':
                recommendations.push('Intégrer des exercices pratiques et manipulation');
                break;
            case 'social':
                recommendations.push('Organiser des sessions d\'apprentissage en groupe');
                break;
        }

        return recommendations.length > 0 ? recommendations : [
            'Profil stable, continuer l\'approche pédagogique actuelle'
        ];
    }

    /**
     * Calcule la confiance de l'analyse
     * @param interactionCount - Nombre d'interactions
     * @param patterns - Patterns analysés
     * @param changes - Changements détectés
     * @returns Score de confiance (0-1)
     */
    public calculateAnalysisConfidence(
        interactionCount: number,
        patterns: Record<string, number>,
        changes: readonly PersonalityChange[]
    ): number {
        // Confiance basée sur le nombre d'interactions
        const countConfidence = Math.min(interactionCount / this.config.calibrationInteractions, 1);

        // Confiance basée sur la cohérence des patterns
        const patternConfidence = patterns.performanceStability || 0.5;

        // Confiance basée sur la stabilité émotionnelle
        const emotionalStability = 1 - (patterns.averageFrustration || 0.5);

        // Pénalité pour trop de changements (instabilité)
        const stabilityPenalty = Math.max(0, (changes.length - 2) * 0.1);

        const overallConfidence = Math.max(0.1, 
            (countConfidence * 0.4 + patternConfidence * 0.3 + emotionalStability * 0.3) - stabilityPenalty
        );

        this.logger.debug('📊 Confiance d\'analyse calculée', {
            interactionCount,
            countConfidence: countConfidence.toFixed(2),
            patternConfidence: patternConfidence.toFixed(2),
            overallConfidence: overallConfidence.toFixed(2)
        });

        return Math.min(1, overallConfidence);
    }

    /**
     * Génère une raison de changement basée sur le trait et la magnitude
     * @private
     */
    private generateChangeReason(trait: keyof BigFiveTraits, magnitude: number): string {
        const reasonMap: Record<keyof BigFiveTraits, string> = {
            neuroticism: magnitude > 0.1 ? 'Stress détecté dans les interactions récentes' : 'Ajustement mineur du niveau de stress',
            conscientiousness: magnitude > 0.1 ? 'Changement significatif de persistance' : 'Adaptation de la discipline personnelle',
            openness: magnitude > 0.1 ? 'Exposition à de nouveaux défis' : 'Ajustement de la curiosité',
            extraversion: magnitude > 0.1 ? 'Évolution des préférences sociales' : 'Adaptation du niveau d\'interaction',
            agreeableness: magnitude > 0.1 ? 'Changement dans les relations interpersonnelles' : 'Ajustement de la coopération'
        };

        return reasonMap[trait] || 'Adaptation basée sur les interactions récentes';
    }
}