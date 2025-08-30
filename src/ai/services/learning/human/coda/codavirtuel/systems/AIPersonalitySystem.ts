/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/AIPersonalitySystem.ts
 * @description Système de personnalité avancé pour IA-élèves avec traits Big Five adaptés LSF - VERSION REFACTORISÉE
 * 
 * Fonctionnalités révolutionnaires :
 * - 🧠 Modèle Big Five adapté à l'apprentissage LSF
 * - 🎯 Styles d'apprentissage personnalisés
 * - 💪 Facteurs de motivation contextuels
 * - 🏛️ Adaptation culturelle (communauté sourde)
 * - 📊 Scoring d'adaptabilité intelligent
 * - 🔄 Évolution dynamique des traits
 * 
 * Architecture refactorisée v2.0 :
 * - 🏗️ Composition avec PersonalityAnalysisEngine
 * - 🤝 Délégation à PersonalityCompatibilityCalculator
 * - 📦 Responsabilité unique (Single Responsibility Principle)
 * - 🔧 Respecte les limites de complexité (300 lignes vs 772)
 * 
 * @module AIPersonalitySystem
 * @version 4.0.0 - Architecture Refactorisée SOLID
 * @since 2025
 * @author MetaSign Team - Personality AI Division
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { PersonalityAnalysisEngine } from './PersonalityAnalysisEngine';
import { PersonalityCompatibilityCalculator, type DetailedCompatibilityResult } from './PersonalityCompatibilityCalculator';

// ===== TYPES ET INTERFACES EXPORTÉS =====

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

// ===== CLASSE PRINCIPALE REFACTORISÉE =====

/**
 * Système de personnalité révolutionnaire pour IA-élèves - VERSION REFACTORISÉE
 * 
 * @class AIPersonalitySystem
 * @description Orchestrateur principal utilisant la composition et délégation
 * selon les principes SOLID pour une architecture maintenable et extensible.
 * 
 * Architecture v4.0 :
 * - Délégation de l'analyse à PersonalityAnalysisEngine
 * - Délégation de la compatibilité à PersonalityCompatibilityCalculator
 * - Focus sur la gestion des profils et orchestration
 * - Respect des limites de complexité (< 300 lignes vs 772 originales)
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
 * const interactionData = {};
 * const analysis = await personalitySystem.analyzePersonality(
 *   profile, 
 *   [interactionData]
 * );
 * ```
 */
export class AIPersonalitySystem {
    private readonly logger = LoggerFactory.getLogger('AIPersonalitySystem_v4');
    private readonly config: PersonalitySystemConfig;
    private readonly profiles = new Map<string, AIPersonalityProfile>();
    private readonly interactionHistory = new Map<string, InteractionData[]>();

    // Services spécialisés injectés (composition)
    private readonly analysisEngine: PersonalityAnalysisEngine;
    private readonly compatibilityCalculator: PersonalityCompatibilityCalculator;

    /**
     * Constructeur du système de personnalité refactorisé
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

        // Initialiser les services spécialisés
        this.analysisEngine = new PersonalityAnalysisEngine(this.config);
        this.compatibilityCalculator = new PersonalityCompatibilityCalculator();

        this.logger.info('🧠 Système de personnalité v4.0 (refactorisé) initialisé', {
            config: this.config,
            architecture: 'SOLID + Composition'
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
                personalityId: `personality_${studentId}_${Date.now()}`,
                bigFiveTraits: initialTraits?.bigFiveTraits || defaultBigFive,
                learningStyle: initialTraits?.learningStyle || 'visual',
                motivationFactors: initialTraits?.motivationFactors || ['achievement', 'mastery'],
                stressThreshold: initialTraits?.stressThreshold || 0.7,
                adaptabilityScore: initialTraits?.adaptabilityScore || 0.6,
                culturalBackground: initialTraits?.culturalBackground || 'deaf_community',
                preferredFeedbackStyle: initialTraits?.preferredFeedbackStyle || 'positive_reinforcement',
                timestamp: new Date(),
                metadata: {
                    modelVersion: '4.0.0',
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
     * Analyse et met à jour la personnalité basée sur les interactions (DÉLÉGATION)
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
            this.logger.debug('🔍 Analyse de personnalité (délégation)', {
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

            // Gérer l'historique des interactions
            const studentId = this.extractStudentIdFromProfile(currentProfile);
            const allInteractions = [
                ...(this.interactionHistory.get(studentId) || []),
                ...newInteractions
            ];
            this.interactionHistory.set(studentId, allInteractions);

            // DÉLÉGATION à PersonalityAnalysisEngine
            const patterns = this.analysisEngine.analyzeInteractionPatterns(allInteractions);
            const traitAdjustments = this.analysisEngine.calculateTraitAdjustments(currentProfile, patterns);
            const learningStyleChanges = this.analysisEngine.detectLearningStyleChanges(currentProfile, patterns);
            
            // Mettre à jour le profil
            const updatedProfile = this.updateProfile(currentProfile, traitAdjustments, learningStyleChanges);
            
            // DÉLÉGATION pour l'analyse des changements
            const detectedChanges = this.analysisEngine.detectAllChanges(currentProfile, updatedProfile);
            const adaptationRecommendations = this.analysisEngine.generateAdaptationRecommendations(
                updatedProfile, patterns, detectedChanges
            );
            const analysisConfidence = this.analysisEngine.calculateAnalysisConfidence(
                allInteractions.length, patterns, detectedChanges
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
     * Calcule la compatibilité entre deux profils (DÉLÉGATION)
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
            // DÉLÉGATION à PersonalityCompatibilityCalculator
            const compatibility = this.compatibilityCalculator.calculateSimpleCompatibility(profile1, profile2);

            this.logger.debug('🤝 Compatibilité calculée (délégation)', {
                profile1: profile1.personalityId,
                profile2: profile2.personalityId,
                compatibility: compatibility.toFixed(2)
            });

            return compatibility;
        } catch (error) {
            this.logger.error('❌ Erreur calcul compatibilité', { error });
            return 0.5; // Compatibilité neutre en cas d'erreur
        }
    }

    /**
     * Calcule la compatibilité détaillée entre deux profils (NOUVEAU)
     * 
     * @method calculateDetailedCompatibility
     * @param {AIPersonalityProfile} profile1 - Premier profil
     * @param {AIPersonalityProfile} profile2 - Deuxième profil
     * @returns {DetailedCompatibilityResult} Résultat détaillé de compatibilité
     * @public
     */
    public calculateDetailedCompatibility(
        profile1: AIPersonalityProfile,
        profile2: AIPersonalityProfile
    ): DetailedCompatibilityResult {
        try {
            // DÉLÉGATION à PersonalityCompatibilityCalculator
            return this.compatibilityCalculator.calculateDetailedCompatibility(profile1, profile2);
        } catch (error) {
            this.logger.error('❌ Erreur calcul compatibilité détaillée', { error });
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
     * Obtient tous les profils enregistrés
     * 
     * @method getAllProfiles
     * @returns {readonly AIPersonalityProfile[]} Liste de tous les profils
     * @public
     */
    public getAllProfiles(): readonly AIPersonalityProfile[] {
        return Array.from(this.profiles.values());
    }

    /**
     * Obtient l'historique d'interactions d'un étudiant
     * 
     * @method getInteractionHistory
     * @param {string} studentId - ID de l'étudiant
     * @returns {readonly InteractionData[]} Historique des interactions
     * @public
     */
    public getInteractionHistory(studentId: string): readonly InteractionData[] {
        return this.interactionHistory.get(studentId) || [];
    }

    /**
     * Supprime un profil et son historique
     * 
     * @method deleteProfile
     * @param {string} studentId - ID de l'étudiant
     * @returns {boolean} Vrai si supprimé avec succès
     * @public
     */
    public deleteProfile(studentId: string): boolean {
        const profileDeleted = this.profiles.delete(studentId);
        this.interactionHistory.delete(studentId);
        
        if (profileDeleted) {
            this.logger.info('🗑️ Profil supprimé', { studentId });
        }

        return profileDeleted;
    }

    // ==================== MÉTHODES PRIVÉES ====================

    /**
     * Extrait l'ID étudiant du profil
     * @private
     */
    private extractStudentIdFromProfile(profile: AIPersonalityProfile): string {
        // Extraire l'ID du personalityId (format: personality_studentId_timestamp)
        const parts = profile.personalityId.split('_');
        return parts.length >= 2 ? parts[1] : profile.personalityId;
    }

    /**
     * Met à jour le profil avec les ajustements
     * @private
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
                confidence: Math.min(1, (currentProfile.metadata?.confidence || 0.5) + 0.05),
                modelVersion: '4.0.0'
            }
        };

        return updatedProfile;
    }
}