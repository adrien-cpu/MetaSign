// src/ai/systems/expressions/emotions/contextual/analyzers/SocialContextAnalyzer.ts

import { SocialContext, SocialFactorsAnalysis } from '../types';
import { ISocialContextAnalyzer } from '../interfaces';

/**
 * Analyseur de contexte social pour les adaptations émotionnelles
 */
export class SocialContextAnalyzer implements ISocialContextAnalyzer {
    /**
     * Analyse le contexte social pour déterminer les facteurs d'adaptation
     * @param social Contexte social
     * @returns Analyse des facteurs sociaux
     */
    public analyzeSocialContext(social: SocialContext): SocialFactorsAnalysis {
        // Gérer le cas où le contexte est incomplet
        if (!social || typeof social !== 'object') {
            return this.createDefaultAnalysis();
        }

        // Normaliser et déterminer le niveau de formalité
        const formalityLevel = this.determineFormalityLevel(social);

        // Analyser les dynamiques relationnelles
        const relationshipDynamics = this.analyzeRelationshipDynamics(social);

        // Analyser les facteurs environnementaux
        const environmentalFactors = this.analyzeEnvironmentalFactors(social);

        return {
            formalityLevel,
            setting: social.setting || 'neutral',
            relationshipDynamics,
            environmentalFactors
        };
    }

    /**
     * Implémentation de l'interface IContextAnalyzer
     */
    public analyze(context: SocialContext): SocialFactorsAnalysis {
        return this.analyzeSocialContext(context);
    }

    /**
     * Crée une analyse par défaut quand le contexte est incomplet
     * @returns Analyse des facteurs sociaux par défaut
     */
    private createDefaultAnalysis(): SocialFactorsAnalysis {
        return {
            formalityLevel: 0.5,
            setting: 'neutral',
            relationshipDynamics: {
                intimacy: 0.5,
                familiarity: 0.5,
                relationType: 'neutral',
                emotionalOpenness: 'moderate'
            },
            environmentalFactors: {
                distractionLevel: 0.3,
                noiseLevel: 0.3,
                crowdedness: 0.3,
                personalSpace: 'comfortable',
                environmentalImpact: 'low'
            }
        };
    }

    /**
  * Détermine le niveau de formalité du contexte social
  * @param social Contexte social
  * @returns Niveau de formalité normalisé (0-1)
  */
    private determineFormalityLevel(social: SocialContext): number {
        // Utiliser le niveau de formalité fourni ou une valeur par défaut
        let baseLevel = typeof social.formalityLevel === 'number' ?
            social.formalityLevel : 0.5;

        // S'assurer que la valeur est dans la plage [0, 1]
        baseLevel = Math.min(1, Math.max(0, baseLevel));

        // Ajustement selon le contexte
        if (social.setting === 'professional' || social.setting === 'academic') {
            baseLevel = Math.min(1.0, baseLevel + 0.2);
        } else if (social.setting === 'intimate') {
            baseLevel = Math.max(0.0, baseLevel - 0.3);
        } else if (social.setting === 'social_gathering' || social.setting === 'casual') {
            baseLevel = Math.max(0.0, baseLevel - 0.1);
        }

        // Ajustement selon le nombre de participants
        if (social.participants?.count) {
            if (social.participants.count > 10) {
                baseLevel = Math.min(1.0, baseLevel + 0.1);
            } else if (social.participants.count < 3) {
                baseLevel = Math.max(0.0, baseLevel - 0.1);
            }
        }

        // Ajustement selon les dynamiques relationnelles
        if (social.relationshipDynamics?.intimacy) {
            if (social.relationshipDynamics.intimacy > 0.7) {
                baseLevel = Math.max(0.0, baseLevel - 0.15);
            }
        }

        // Niveau final normalisé
        return Math.min(1, Math.max(0, baseLevel));
    }

    /**
     * Analyse les dynamiques relationnelles du contexte social
     * @param social Contexte social
     * @returns Analyse des dynamiques relationnelles
     */
    private analyzeRelationshipDynamics(social: SocialContext): Record<string, unknown> {
        if (!social.relationshipDynamics) {
            return {
                intimacy: 0.5,
                familiarity: 0.5,
                relationType: 'neutral',
                emotionalOpenness: 'moderate',
                participantsCount: 0,
                participantsFamiliarity: 0.5
            };
        }

        // Extraire et normaliser les valeurs des dynamiques relationnelles
        const intimacy = typeof social.relationshipDynamics.intimacy === 'number' ?
            Math.min(1, Math.max(0, social.relationshipDynamics.intimacy)) : 0.5;

        const familiarity = typeof social.relationshipDynamics.familiarity === 'number' ?
            Math.min(1, Math.max(0, social.relationshipDynamics.familiarity)) : 0.5;

        // Déterminer l'ouverture émotionnelle
        const emotionalOpenness = this.determineEmotionalOpenness(intimacy, familiarity);

        // Informations sur les participants
        const participantsCount = social.participants?.count || 0;
        const participantsFamiliarity = social.participants?.familiarity || 0.5;
        const participantsDiversity = social.participants?.diversity;

        // Combiner les valeurs
        return {
            intimacy,
            hierarchy: social.relationshipDynamics.hierarchy || 'neutral',
            familiarity,
            relationType: this.determineRelationType(intimacy, familiarity),
            emotionalOpenness,
            participantsCount,
            participantsFamiliarity,
            ...(participantsDiversity !== undefined && { participantsDiversity })
        };
    }

    /**
     * Détermine le type de relation basé sur l'intimité et la familiarité
     * @param intimacy Niveau d'intimité
     * @param familiarity Niveau de familiarité
     * @returns Type de relation
     */
    private determineRelationType(intimacy: number, familiarity: number): string {
        if (intimacy > 0.8 && familiarity > 0.8) {
            return 'close_personal';
        } else if (intimacy > 0.5 && familiarity > 0.5) {
            return 'friendly';
        } else if (intimacy < 0.3 && familiarity > 0.7) {
            return 'professional_familiar';
        } else if (intimacy < 0.3 && familiarity < 0.3) {
            return 'formal_distant';
        } else {
            return 'casual';
        }
    }

    /**
     * Détermine le niveau d'ouverture émotionnelle basé sur l'intimité et la familiarité
     * @param intimacy Niveau d'intimité
     * @param familiarity Niveau de familiarité
     * @returns Niveau d'ouverture émotionnelle
     */
    private determineEmotionalOpenness(intimacy: number, familiarity: number): string {
        const combinedScore = (intimacy * 0.6) + (familiarity * 0.4);

        if (combinedScore > 0.8) return 'high';
        if (combinedScore > 0.5) return 'moderate';
        if (combinedScore > 0.3) return 'limited';
        return 'guarded';
    }

    /**
     * Analyse les facteurs environnementaux du contexte social
     * @param social Contexte social
     * @returns Analyse des facteurs environnementaux
     */
    private analyzeEnvironmentalFactors(social: SocialContext): Record<string, unknown> {
        if (!social.environmentalFactors) {
            return {
                distractionLevel: 0.3,
                noiseLevel: 0.3,
                crowdedness: 0.3,
                personalSpace: 'comfortable',
                formality: this.determineEnvironmentalFormality(social),
                environmentalImpact: 'low'
            };
        }

        // Extraire et normaliser les valeurs des facteurs environnementaux
        const distractionLevel = typeof social.environmentalFactors.distractionLevel === 'number' ?
            Math.min(1, Math.max(0, social.environmentalFactors.distractionLevel)) : 0.3;

        const noiseLevel = typeof social.environmentalFactors.noise === 'number' ?
            Math.min(1, Math.max(0, social.environmentalFactors.noise)) : 0.3;

        const crowdedness = typeof social.environmentalFactors.crowdedness === 'number' ?
            Math.min(1, Math.max(0, social.environmentalFactors.crowdedness)) : 0.3;

        // Évaluer l'impact global de l'environnement
        const environmentalImpact = this.evaluateEnvironmentalImpact(distractionLevel, noiseLevel, crowdedness);

        // Déterminer la formalité environnementale
        const formality = this.determineEnvironmentalFormality(social);

        // Déterminer l'espace personnel
        const personalSpace = this.determinePersonalSpace(crowdedness);

        return {
            distractionLevel,
            noiseLevel,
            crowdedness,
            personalSpace,
            formality,
            environmentalImpact
        };
    }

    /**
     * Évalue l'impact global de l'environnement sur l'expression émotionnelle
     * @param distractionLevel Niveau de distraction
     * @param noiseLevel Niveau de bruit
     * @param crowdedness Niveau d'affluence
     * @returns Niveau d'impact environnemental
     */
    private evaluateEnvironmentalImpact(
        distractionLevel: number,
        noiseLevel: number,
        crowdedness: number
    ): string {
        const combinedScore = (distractionLevel * 0.4) + (noiseLevel * 0.4) + (crowdedness * 0.2);

        if (combinedScore > 0.7) return 'high';
        if (combinedScore > 0.4) return 'moderate';
        return 'low';
    }

    /**
     * Détermine la formalité de l'environnement
     * @param social Contexte social
     * @returns Niveau de formalité environnementale
     */
    private determineEnvironmentalFormality(social: SocialContext): string {
        if (social.setting === 'professional' || social.setting === 'academic') {
            return 'high';
        } else if (social.setting === 'intimate' || social.setting === 'casual') {
            return 'low';
        } else if (social.setting === 'social_gathering') {
            return 'medium_low';
        } else {
            return 'medium';
        }
    }

    /**
     * Détermine l'espace personnel disponible
     * @param crowdedness Niveau d'affluence
     * @returns Description de l'espace personnel
     */
    private determinePersonalSpace(crowdedness: number): string {
        if (crowdedness > 0.7) {
            return 'restricted';
        } else if (crowdedness > 0.4) {
            return 'limited';
        } else {
            return 'comfortable';
        }
    }
}