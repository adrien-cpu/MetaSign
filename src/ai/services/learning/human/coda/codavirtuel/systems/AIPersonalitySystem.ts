/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/AIPersonalitySystem.ts
 * @description Système de personnalité avancé pour IA-élèves avec traits Big Five adaptés LSF
 * 
 * Fonctionnalités révolutionnaires :
 * - 🧠 Modèle Big Five adapté à l'apprentissage LSF
 * - 🎯 Styles d'apprentissage personnalisés
 * - 💪 Facteurs de motivation contextuels
 * - 🏛️ Adaptation culturelle (communauté sourde)
 * - 📊 Scoring d'adaptabilité intelligent
 * - 🔄 Évolution dynamique des traits
 * 
 * @module AIPersonalitySystem
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Personality AI Division
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Traits de personnalité Big Five adaptés LSF
 */
export interface BigFiveTraits {
    /** Ouverture à l'expérience (0-1) */
    readonly openness: number;
    /** Conscienciosité (0-1) */
    readonly conscientiousness: number;
    /** Extraversion (0-1) */
    readonly extraversion: number;
    /** Agréabilité (0-1) */
    readonly agreeableness: number;
    /** Neuroticisme (0-1) */
    readonly neuroticism: number;
}

/**
 * Styles d'apprentissage LSF
 */
export type LearningStyle =
    | 'visual'          // Préférence pour stimuli visuels
    | 'kinesthetic'     // Apprentissage par le mouvement
    | 'spatial'         // Compréhension spatiale 3D
    | 'analytical'      // Décomposition systématique
    | 'intuitive'       // Apprentissage holistique
    | 'social'          // Apprentissage collaboratif
    | 'independent';    // Apprentissage autonome

/**
 * Facteurs de motivation spécifiques LSF
 */
export type MotivationFactor =
    | 'achievement'         // Réussite personnelle
    | 'social_interaction'  // Interaction avec communauté
    | 'mastery'            // Maîtrise technique
    | 'creativity'         // Expression créative
    | 'recognition'        // Reconnaissance par pairs
    | 'cultural_pride'     // Fierté culturelle sourde
    | 'practical_utility'  // Utilité pratique
    | 'challenge'          // Défis intellectuels
    | 'helping_others'     // Aider d'autres apprenants
    | 'personal_growth';   // Développement personnel

/**
 * Contextes culturels
 */
export type CulturalBackground =
    | 'deaf_community'      // Communauté sourde native
    | 'hard_of_hearing'     // Malentendant
    | 'hearing_family'      // Famille entendante
    | 'mixed_background'    // Contexte mixte
    | 'international'       // Contexte international
    | 'late_deafened';      // Surdité tardive

/**
 * Styles de feedback préférés
 */
export type FeedbackStyle =
    | 'positive_reinforcement'  // Renforcement positif
    | 'constructive_criticism'  // Critique constructive
    | 'visual_cues'            // Indices visuels
    | 'peer_feedback'          // Feedback des pairs
    | 'detailed_analysis'      // Analyse détaillée
    | 'immediate_correction'   // Correction immédiate
    | 'progress_tracking';     // Suivi des progrès

/**
 * Profil de personnalité complet pour IA-élève
 */
export interface AIPersonalityProfile {
    /** Identifiant unique du profil */
    readonly personalityId: string;
    /** Traits Big Five */
    readonly bigFiveTraits: BigFiveTraits;
    /** Style d'apprentissage préféré */
    readonly learningStyle: LearningStyle;
    /** Facteurs de motivation */
    readonly motivationFactors: readonly MotivationFactor[];
    /** Seuil de stress (0-1) */
    readonly stressThreshold: number;
    /** Score d'adaptabilité (0-1) */
    readonly adaptabilityScore: number;
    /** Contexte culturel */
    readonly culturalBackground: CulturalBackground;
    /** Style de feedback préféré */
    readonly preferredFeedbackStyle: FeedbackStyle;
    /** Timestamp de création/modification */
    readonly timestamp: Date;
    /** Métadonnées optionnelles */
    readonly metadata?: PersonalityMetadata;
}

/**
 * Métadonnées additionnelles du profil
 */
export interface PersonalityMetadata {
    /** Version du modèle de personnalité */
    readonly modelVersion?: string;
    /** Confiance dans le profil (0-1) */
    readonly confidence?: number;
    /** Nombre d'interactions pour calibrage */
    readonly interactionCount?: number;
    /** Dernière mise à jour */
    readonly lastUpdate?: Date;
    /** Évolution des traits dans le temps */
    readonly traitEvolution?: ReadonlyMap<keyof BigFiveTraits, number[]>;
}

/**
 * Configuration du système de personnalité
 */
export interface PersonalitySystemConfig {
    /** Activer l'évolution dynamique des traits */
    readonly enableDynamicEvolution: boolean;
    /** Seuil de confiance minimum */
    readonly minConfidenceThreshold: number;
    /** Nombre d'interactions pour calibrage */
    readonly calibrationInteractions: number;
    /** Facteur d'adaptation temporelle */
    readonly temporalAdaptationFactor: number;
}

/**
 * Données d'interaction pour calibrage
 */
export interface InteractionData {
    /** ID de l'interaction */
    readonly interactionId: string;
    /** Type d'exercice */
    readonly exerciseType: string;
    /** Performance (0-1) */
    readonly performance: number;
    /** Temps passé (ms) */
    readonly timeSpent: number;
    /** Niveau de frustration observé (0-1) */
    readonly frustrationLevel: number;
    /** Engagement mesuré (0-1) */
    readonly engagementLevel: number;
    /** Préférences exprimées */
    readonly expressedPreferences: readonly string[];
    /** Timestamp */
    readonly timestamp: Date;
}

/**
 * Résultat d'analyse de personnalité
 */
export interface PersonalityAnalysisResult {
    /** Profil mis à jour */
    readonly updatedProfile: AIPersonalityProfile;
    /** Changements détectés */
    readonly detectedChanges: readonly PersonalityChange[];
    /** Recommandations d'adaptation */
    readonly adaptationRecommendations: readonly string[];
    /** Confiance dans l'analyse */
    readonly analysisConfidence: number;
}

/**
 * Changement de personnalité détecté
 */
export interface PersonalityChange {
    /** Trait modifié */
    readonly trait: keyof BigFiveTraits | 'learningStyle' | 'motivationFactors';
    /** Ancienne valeur */
    readonly oldValue: number | string | readonly string[];
    /** Nouvelle valeur */
    readonly newValue: number | string | readonly string[];
    /** Magnitude du changement */
    readonly changeMagnitude: number;
    /** Raison du changement */
    readonly reason: string;
}

/**
 * Système de personnalité révolutionnaire pour IA-élèves
 * 
 * @class AIPersonalitySystem
 * @description Gère les profils de personnalité avec adaptation dynamique
 * basée sur les interactions d'apprentissage et traits Big Five adaptés LSF.
 * 
 * @example
 * ```typescript
 * const personalitySystem = new AIPersonalitySystem({
 *   enableDynamicEvolution: true,
 *   calibrationInteractions: 50
 * });
 * 
 * // Créer un profil initial
 * const profile = personalitySystem.createInitialProfile('student123', {
 *   learningStyle: 'visual',
 *   culturalBackground: 'deaf_community'
 * });
 * 
 * // Analyser et adapter après interactions
 * const interactionData = { /* ... */ };
 * const analysis = await personalitySystem.analyzePersonality(
 * profile, 
 * [interactionData]
    * );
 * ```
 */
export class AIPersonalitySystem {
    /**
     * Logger pour le système de personnalité
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('AIPersonalitySystem_v3');

    /**
     * Configuration du système
     * @private
     * @readonly
     */
    private readonly config: PersonalitySystemConfig;

    /**
     * Profils de personnalité stockés
     * @private
     */
    private readonly profiles = new Map<string, AIPersonalityProfile>();

    /**
     * Historique des interactions
     * @private
     */
    private readonly interactionHistory = new Map<string, InteractionData[]>();

    /**
     * Constructeur du système de personnalité
     * 
     * @constructor
     * @param {Partial<PersonalitySystemConfig>} [config] - Configuration optionnelle
     */
    constructor(config?: Partial<PersonalitySystemConfig>) {
        this.config = {
            enableDynamicEvolution: true,
            minConfidenceThreshold: 0.6,
            calibrationInteractions: 30,
            temporalAdaptationFactor: 0.1,
            ...config
        };

        this.logger.info('🧠 Système de personnalité IA initialisé', {
            config: this.config
        });
    }

    /**
     * Crée un profil de personnalité initial
     * 
     * @method createInitialProfile
     * @param {string} studentId - ID de l'IA-élève
     * @param {Partial<AIPersonalityProfile>} [initialTraits] - Traits initiaux optionnels
     * @returns {AIPersonalityProfile} Profil de personnalité créé
     * @public
     */
    public createInitialProfile(
        studentId: string,
        initialTraits?: Partial<AIPersonalityProfile>
    ): AIPersonalityProfile {
        try {
            this.logger.debug('🧠 Création profil initial', { studentId });

            const defaultBigFive: BigFiveTraits = {
                openness: 0.6,
                conscientiousness: 0.5,
                extraversion: 0.5,
                agreeableness: 0.7,
                neuroticism: 0.4
            };

            const profile: AIPersonalityProfile = {
                personalityId: `personality_${ studentId }_${ Date.now() } `,
                bigFiveTraits: initialTraits?.bigFiveTraits || defaultBigFive,
                learningStyle: initialTraits?.learningStyle || 'visual',
                motivationFactors: initialTraits?.motivationFactors || ['achievement', 'mastery'],
                stressThreshold: initialTraits?.stressThreshold || 0.7,
                adaptabilityScore: initialTraits?.adaptabilityScore || 0.6,
                culturalBackground: initialTraits?.culturalBackground || 'deaf_community',
                preferredFeedbackStyle: initialTraits?.preferredFeedbackStyle || 'positive_reinforcement',
                timestamp: new Date(),
                metadata: {
                    modelVersion: '3.0.0',
                    confidence: 0.5, // Confiance initiale modérée
                    interactionCount: 0,
                    lastUpdate: new Date(),
                    traitEvolution: new Map()
                }
            };

            this.profiles.set(studentId, profile);
            this.interactionHistory.set(studentId, []);

            this.logger.info('✨ Profil de personnalité créé', {
                studentId,
                learningStyle: profile.learningStyle,
                culturalBackground: profile.culturalBackground
            });

            return profile;
        } catch (error) {
            this.logger.error('❌ Erreur création profil', { studentId, error });
            throw error;
        }
    }

    /**
     * Analyse et met à jour la personnalité basée sur les interactions
     * 
     * @method analyzePersonality
     * @async
     * @param {AIPersonalityProfile} currentProfile - Profil actuel
     * @param {readonly InteractionData[]} newInteractions - Nouvelles interactions
     * @returns {Promise<PersonalityAnalysisResult>} Résultat de l'analyse
     * @public
     */
    public async analyzePersonality(
        currentProfile: AIPersonalityProfile,
        newInteractions: readonly InteractionData[]
    ): Promise<PersonalityAnalysisResult> {
        try {
            this.logger.debug('🔍 Analyse de personnalité', {
                profileId: currentProfile.personalityId,
                newInteractionsCount: newInteractions.length
            });

            if (!this.config.enableDynamicEvolution) {
                return {
                    updatedProfile: currentProfile,
                    detectedChanges: [],
                    adaptationRecommendations: ['Évolution dynamique désactivée'],
                    analysisConfidence: 1.0
                };
            }

            // Ajouter les nouvelles interactions à l'historique
            const studentId = this.extractStudentIdFromProfile(currentProfile);
            const allInteractions = [
                ...(this.interactionHistory.get(studentId) || []),
                ...newInteractions
            ];
            this.interactionHistory.set(studentId, allInteractions);

            // Analyser les patterns d'interaction
            const patterns = this.analyzeInteractionPatterns(allInteractions);

            // Calculer les ajustements de traits
            const traitAdjustments = this.calculateTraitAdjustments(currentProfile, patterns);

            // Détecter les changements de style d'apprentissage
            const learningStyleChanges = this.detectLearningStyleChanges(currentProfile, patterns);

            // Mettre à jour le profil
            const updatedProfile = this.updateProfile(currentProfile, traitAdjustments, learningStyleChanges);

            // Détecter tous les changements
            const detectedChanges = this.detectAllChanges(currentProfile, updatedProfile);

            // Générer des recommandations
            const adaptationRecommendations = this.generateAdaptationRecommendations(
                updatedProfile,
                patterns,
                detectedChanges
            );

            // Calculer la confiance
            const analysisConfidence = this.calculateAnalysisConfidence(
                allInteractions.length,
                patterns,
                detectedChanges
            );

            // Sauvegarder le profil mis à jour
            this.profiles.set(studentId, updatedProfile);

            const result: PersonalityAnalysisResult = {
                updatedProfile,
                detectedChanges,
                adaptationRecommendations,
                analysisConfidence
            };

            this.logger.info('📊 Analyse de personnalité terminée', {
                profileId: currentProfile.personalityId,
                changesDetected: detectedChanges.length,
                confidence: analysisConfidence.toFixed(2)
            });

            return result;
        } catch (error) {
            this.logger.error('❌ Erreur analyse personnalité', { error });
            throw error;
        }
    }

    /**
     * Obtient un profil de personnalité
     * 
     * @method getProfile
     * @param {string} studentId - ID de l'IA-élève
     * @returns {AIPersonalityProfile | undefined} Profil de personnalité
     * @public
     */
    public getProfile(studentId: string): AIPersonalityProfile | undefined {
        return this.profiles.get(studentId);
    }

    /**
     * Calcule la compatibilité entre deux profils
     * 
     * @method calculateCompatibility
     * @param {AIPersonalityProfile} profile1 - Premier profil
     * @param {AIPersonalityProfile} profile2 - Deuxième profil
     * @returns {number} Score de compatibilité (0-1)
     * @public
     */
    public calculateCompatibility(
        profile1: AIPersonalityProfile,
        profile2: AIPersonalityProfile
    ): number {
        try {
            // Compatibilité basée sur les traits Big Five
            const traitCompatibility = this.calculateTraitCompatibility(
                profile1.bigFiveTraits,
                profile2.bigFiveTraits
            );

            // Compatibilité des styles d'apprentissage
            const styleCompatibility = profile1.learningStyle === profile2.learningStyle ? 1.0 : 0.5;

            // Compatibilité culturelle
            const culturalCompatibility = this.calculateCulturalCompatibility(
                profile1.culturalBackground,
                profile2.culturalBackground
            );

            // Compatibilité des motivations
            const motivationCompatibility = this.calculateMotivationCompatibility(
                profile1.motivationFactors,
                profile2.motivationFactors
            );

            // Score global pondéré
            const overallCompatibility = (
                traitCompatibility * 0.4 +
                styleCompatibility * 0.2 +
                culturalCompatibility * 0.2 +
                motivationCompatibility * 0.2
            );

            this.logger.debug('🤝 Compatibilité calculée', {
                profile1: profile1.personalityId,
                profile2: profile2.personalityId,
                compatibility: overallCompatibility.toFixed(2)
            });

            return overallCompatibility;
        } catch (error) {
            this.logger.error('❌ Erreur calcul compatibilité', { error });
            return 0.5; // Compatibilité neutre en cas d'erreur
        }
    }

    // ================== MÉTHODES PRIVÉES ==================

    /**
     * Extrait l'ID étudiant du profil
     */
    private extractStudentIdFromProfile(profile: AIPersonalityProfile): string {
        // Extraire l'ID du personalityId (format: personality_studentId_timestamp)
        const parts = profile.personalityId.split('_');
        return parts.length >= 2 ? parts[1] : profile.personalityId;
    }

    /**
     * Analyse les patterns dans les interactions
     */
    private analyzeInteractionPatterns(interactions: readonly InteractionData[]): Record<string, number> {
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

        return patterns;
    }

    /**
     * Calcule les ajustements de traits basés sur les patterns
     */
    private calculateTraitAdjustments(
        profile: AIPersonalityProfile,
        patterns: Record<string, number>
    ): Partial<BigFiveTraits> {
        const adjustments: Partial<BigFiveTraits> = {};

        // Ajuster le neuroticisme basé sur la frustration
        if (patterns.averageFrustration !== undefined) {
            const frustrationImpact = (patterns.averageFrustration - 0.5) * this.config.temporalAdaptationFactor;
            adjustments.neuroticism = Math.max(0, Math.min(1, 
                profile.bigFiveTraits.neuroticism + frustrationImpact
            ));
        }

        // Ajuster la conscienciosité basée sur la persistance
        if (patterns.averageTimeSpent !== undefined) {
            const persistenceScore = Math.min(patterns.averageTimeSpent / 300000, 1); // Normaliser sur 5 minutes
            const persistenceImpact = (persistenceScore - 0.5) * this.config.temporalAdaptationFactor;
            adjustments.conscientiousness = Math.max(0, Math.min(1,
                profile.bigFiveTraits.conscientiousness + persistenceImpact
            ));
        }

        // Ajuster l'ouverture basée sur la variété d'exercices
        if (patterns.performanceStability !== undefined) {
            const openessImpact = (1 - patterns.performanceStability) * this.config.temporalAdaptationFactor * 0.5;
            adjustments.openness = Math.max(0, Math.min(1,
                profile.bigFiveTraits.openness + openessImpact
            ));
        }

        return adjustments;
    }

    /**
     * Détecte les changements de style d'apprentissage
     */
    private detectLearningStyleChanges(
        profile: AIPersonalityProfile,
        patterns: Record<string, number>
    ): { newLearningStyle?: LearningStyle } {
        // Logique simplifiée pour la détection de changement de style
        const changes: { newLearningStyle?: LearningStyle } = {};

        // Si performance faible et frustration élevée, suggérer un style différent
        if (patterns.averagePerformance < 0.4 && patterns.averageFrustration > 0.7) {
            const alternativeStyles: Record<LearningStyle, LearningStyle> = {
                'visual': 'kinesthetic',
                'kinesthetic': 'visual',
                'spatial': 'analytical',
                'analytical': 'intuitive',
                'intuitive': 'social',
                'social': 'independent',
                'independent': 'social'
            };

            changes.newLearningStyle = alternativeStyles[profile.learningStyle];
        }

        return changes;
    }

    /**
     * Met à jour le profil avec les ajustements
     */
    private updateProfile(
        currentProfile: AIPersonalityProfile,
        traitAdjustments: Partial<BigFiveTraits>,
        learningStyleChanges: { newLearningStyle?: LearningStyle }
    ): AIPersonalityProfile {
        const updatedBigFive: BigFiveTraits = {
            ...currentProfile.bigFiveTraits,
            ...traitAdjustments
        };

        const updatedProfile: AIPersonalityProfile = {
            ...currentProfile,
            bigFiveTraits: updatedBigFive,
            learningStyle: learningStyleChanges.newLearningStyle || currentProfile.learningStyle,
            timestamp: new Date(),
            metadata: {
                ...currentProfile.metadata,
                lastUpdate: new Date(),
                interactionCount: (currentProfile.metadata?.interactionCount || 0) + 1,
                confidence: Math.min(1, (currentProfile.metadata?.confidence || 0.5) + 0.1)
            }
        };

        return updatedProfile;
    }

    /**
     * Détecte tous les changements entre profils
     */
    private detectAllChanges(
        oldProfile: AIPersonalityProfile,
        newProfile: AIPersonalityProfile
    ): readonly PersonalityChange[] {
        const changes: PersonalityChange[] = [];

        // Changements de traits Big Five
        Object.entries(newProfile.bigFiveTraits).forEach(([trait, newValue]) => {
            const oldValue = oldProfile.bigFiveTraits[trait as keyof BigFiveTraits];
            if (Math.abs(newValue - oldValue) > 0.05) { // Seuil de changement significatif
                changes.push({
                    trait: trait as keyof BigFiveTraits,
                    oldValue,
                    newValue,
                    changeMagnitude: Math.abs(newValue - oldValue),
                    reason: 'Adaptation basée sur les interactions récentes'
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

        return changes;
    }

    /**
     * Génère des recommandations d'adaptation
     */
    private generateAdaptationRecommendations(
        profile: AIPersonalityProfile,
        patterns: Record<string, number>,
        changes: readonly PersonalityChange[]
    ): readonly string[] {
        const recommendations: string[] = [];

        // Recommandations basées sur le neuroticisme
        if (profile.bigFiveTraits.neuroticism > 0.7) {
            recommendations.push('Proposer des exercices moins stressants et plus de feedback positif');
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
        if (changes.length > 2) {
            recommendations.push('Période d\'adaptation détectée, maintenir la cohérence pédagogique');
        }

        return recommendations.length > 0 ? recommendations : [
            'Profil stable, continuer l\'approche pédagogique actuelle'
        ];
    }

    /**
     * Calcule la confiance de l'analyse
     */
    private calculateAnalysisConfidence(
        interactionCount: number,
        patterns: Record<string, number>,
        changes: readonly PersonalityChange[]
    ): number {
        // Confiance basée sur le nombre d'interactions
        const countConfidence = Math.min(interactionCount / this.config.calibrationInteractions, 1);

        // Confiance basée sur la cohérence des patterns
        const patternConfidence = patterns.performanceStability || 0.5;

        // Pénalité pour trop de changements (instabilité)
        const stabilityPenalty = Math.max(0, (changes.length - 2) * 0.1);

        const overallConfidence = Math.max(0.1, 
            (countConfidence * 0.5 + patternConfidence * 0.5) - stabilityPenalty
        );

        return Math.min(1, overallConfidence);
    }

    /**
     * Calcule la compatibilité entre traits
     */
    private calculateTraitCompatibility(traits1: BigFiveTraits, traits2: BigFiveTraits): number {
        const differences = Object.keys(traits1).map(trait => {
            const key = trait as keyof BigFiveTraits;
            return Math.abs(traits1[key] - traits2[key]);
        });

        const averageDifference = differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
        return 1 - averageDifference; // Convertir différence en similarité
    }

    /**
     * Calcule la compatibilité culturelle
     */
    private calculateCulturalCompatibility(
        background1: CulturalBackground,
        background2: CulturalBackground
    ): number {
        if (background1 === background2) return 1.0;

        // Compatibilités spéciales
        const compatibilityMatrix: Record<string, number> = {
            'deaf_community-hard_of_hearing': 0.8,
            'deaf_community-mixed_background': 0.7,
            'hard_of_hearing-hearing_family': 0.7,
            'mixed_background-international': 0.6
        };

        const key1 = `${ background1 } -${ background2 } `;
        const key2 = `${ background2 } -${ background1 } `;

        return compatibilityMatrix[key1] || compatibilityMatrix[key2] || 0.5;
    }

    /**
     * Calcule la compatibilité des motivations
     */
    private calculateMotivationCompatibility(
        factors1: readonly MotivationFactor[],
        factors2: readonly MotivationFactor[]
    ): number {
        const commonFactors = factors1.filter(f => factors2.includes(f));
        const totalUniqueFactors = new Set([...factors1, ...factors2]).size;

        return commonFactors.length / totalUniqueFactors;
    }
}