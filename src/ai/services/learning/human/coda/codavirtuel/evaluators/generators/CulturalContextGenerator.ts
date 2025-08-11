/**
 * Générateur de contexte culturel adaptatif - Version corrigée et optimisée
 * @file src/ai/services/learning/human/coda/codavirtuel/evaluators/generators/CulturalContextGenerator.ts
 * @module ai/services/learning/human/coda/codavirtuel/evaluators/generators
 * @description Génère des contextes culturels authentiques pour l'apprentissage CODA avec IA révolutionnaire
 * Compatible avec exactOptionalPropertyTypes: true et optimisé
 * @author MetaSign Learning Team
 * @version 3.0.1
 * @since 2025
 * @lastModified 2025-01-15
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type { TeachingSession } from '../types/CODAEvaluatorTypes';
import type { UserNeeds } from '../analyzers/EmotionalAnalyzer';

/**
 * Types d'environnements culturels disponibles
 */
export type CulturalEnvironment =
    | 'deaf_family_home'
    | 'deaf_school'
    | 'deaf_community_center'
    | 'deaf_workplace'
    | 'deaf_social_event'
    | 'mixed_environment';

/**
 * Interface pour les éléments culturels d'un contexte
 */
export interface CulturalElements {
    readonly historicalReferences: readonly string[];
    readonly idiomaticExpressions: readonly string[];
    readonly socialCodes: readonly string[];
    readonly culturalEvents: readonly string[];
}

/**
 * Interface pour un contexte culturel complet
 */
export interface CulturalContext {
    readonly environment: CulturalEnvironment;
    readonly culturalElements: CulturalElements;
    readonly immersionLevel: number;
    readonly authenticity: number;
    readonly adaptationLevel?: number;
    readonly socialComplexity?: number;
}

/**
 * Interface pour les informations d'environnement
 */
export interface EnvironmentInfo {
    readonly environment: CulturalEnvironment;
    readonly name: string;
    readonly description: string;
    readonly targetAudience: string;
    readonly immersionLevel: number;
    readonly culturalDepth: number;
    readonly socialInteraction: number;
}

/**
 * Interface pour les métriques de génération culturelle
 */
export interface CulturalGenerationMetrics {
    readonly totalElementsGenerated: number;
    readonly authenticity: number;
    readonly culturalDepth: number;
    readonly adaptationAccuracy: number;
    readonly processingTime: number;
}

/**
 * Générateur de contexte culturel adaptatif révolutionnaire
 * Responsable de la création de contextes culturels authentiques pour l'apprentissage
 * 
 * @example
 * ```typescript
 * const generator = new CulturalContextGenerator();
 * const context = generator.generateCulturalContext(sessions, userNeeds);
 * 
 * // Avec métriques avancées
 * const { context, metrics } = generator.generateDetailedCulturalContext(sessions, userNeeds);
 * console.log(`Authenticité: ${(metrics.authenticity * 100).toFixed(1)}%`);
 * ```
 */
export class CulturalContextGenerator {
    private readonly logger = LoggerFactory.getLogger('CulturalContextGenerator');

    /** Version du générateur */
    private static readonly GENERATOR_VERSION = '3.0.1';

    /**
     * Configuration des environnements disponibles avec leurs caractéristiques
     * @private
     */
    private readonly environmentsConfig: ReadonlyMap<CulturalEnvironment, EnvironmentInfo> = new Map([
        ['deaf_family_home', {
            environment: 'deaf_family_home',
            name: 'Foyer familial sourd',
            description: 'Environnement familial authentique de la communauté sourde',
            targetAudience: 'Débutants, apprentissage des bases',
            immersionLevel: 0.7,
            culturalDepth: 0.8,
            socialInteraction: 0.6
        }],
        ['deaf_school', {
            environment: 'deaf_school',
            name: 'École pour sourds',
            description: 'Contexte scolaire spécialisé avec pédagogie adaptée',
            targetAudience: 'Tous niveaux, apprentissage structuré',
            immersionLevel: 0.8,
            culturalDepth: 0.9,
            socialInteraction: 0.7
        }],
        ['deaf_community_center', {
            environment: 'deaf_community_center',
            name: 'Centre communautaire sourd',
            description: 'Espace de vie sociale et culturelle sourde',
            targetAudience: 'Intermédiaires, immersion culturelle',
            immersionLevel: 0.9,
            culturalDepth: 0.95,
            socialInteraction: 0.9
        }],
        ['deaf_workplace', {
            environment: 'deaf_workplace',
            name: 'Lieu de travail inclusif',
            description: 'Environnement professionnel avec adaptation LSF',
            targetAudience: 'Avancés, contexte professionnel',
            immersionLevel: 0.6,
            culturalDepth: 0.7,
            socialInteraction: 0.8
        }],
        ['deaf_social_event', {
            environment: 'deaf_social_event',
            name: 'Événement social sourd',
            description: 'Contexte festif et convivial de la communauté',
            targetAudience: 'Tous niveaux, aspect social',
            immersionLevel: 0.85,
            culturalDepth: 0.8,
            socialInteraction: 0.95
        }],
        ['mixed_environment', {
            environment: 'mixed_environment',
            name: 'Environnement mixte',
            description: 'Contexte d\'intégration sourds/entendants',
            targetAudience: 'Avancés, situations réelles',
            immersionLevel: 0.5,
            culturalDepth: 0.6,
            socialInteraction: 0.7
        }]
    ]);

    /**
     * Génère un contexte culturel adaptatif
     * @param sessions Sessions d'enseignement
     * @param userNeeds Besoins analysés de l'utilisateur
     * @returns Contexte culturel généré
     */
    public generateCulturalContext(
        sessions: readonly TeachingSession[],
        userNeeds: UserNeeds
    ): CulturalContext {
        this.logger.debug('Génération de contexte culturel', {
            sessionsCount: sessions.length,
            userNeeds: {
                culturalImmersion: userNeeds.culturalImmersion,
                confidence: userNeeds.confidence
            }
        });

        // Sélection d'environnement basée sur les besoins
        const environment = this.selectOptimalEnvironment(userNeeds, sessions);

        // Génération des éléments culturels
        const culturalElements = this.generateCulturalElements(environment, sessions);

        // Calcul du niveau d'immersion
        const immersionLevel = this.calculateImmersionLevel(userNeeds, sessions);

        // Calcul de l'authenticité
        const authenticity = this.calculateAuthenticity(environment, sessions);

        // Calculs avancés
        const adaptationLevel = this.calculateAdaptationLevel(userNeeds, sessions);
        const socialComplexity = this.calculateSocialComplexity(environment, userNeeds);

        const context: CulturalContext = {
            environment,
            culturalElements,
            immersionLevel,
            authenticity,
            adaptationLevel,
            socialComplexity
        };

        this.logger.debug('Contexte culturel généré', {
            environment,
            immersionLevel: parseFloat(immersionLevel.toFixed(3)),
            authenticity: parseFloat(authenticity.toFixed(3)),
            elementsCount: this.countCulturalElements(culturalElements)
        });

        return context;
    }

    /**
     * Génère un contexte culturel avec métriques détaillées
     * @param sessions Sessions d'enseignement
     * @param userNeeds Besoins analysés de l'utilisateur
     * @returns Contexte culturel et métriques détaillées
     */
    public generateDetailedCulturalContext(
        sessions: readonly TeachingSession[],
        userNeeds: UserNeeds
    ): { context: CulturalContext; metrics: CulturalGenerationMetrics } {
        const startTime = Date.now();

        this.logger.debug('Génération de contexte culturel détaillé', {
            version: CulturalContextGenerator.GENERATOR_VERSION,
            sessionsCount: sessions.length
        });

        const context = this.generateCulturalContext(sessions, userNeeds);
        const processingTime = Date.now() - startTime;

        const metrics: CulturalGenerationMetrics = {
            totalElementsGenerated: this.countCulturalElements(context.culturalElements),
            authenticity: context.authenticity,
            culturalDepth: this.calculateCulturalDepth(context),
            adaptationAccuracy: context.adaptationLevel || 0.5,
            processingTime
        };

        this.logger.info('Contexte culturel détaillé généré', {
            environment: context.environment,
            processingTime: `${processingTime}ms`,
            metrics
        });

        return { context, metrics };
    }

    /**
     * Obtient les environnements culturels disponibles
     * @returns Liste des environnements avec descriptions
     */
    public getAvailableEnvironments(): readonly EnvironmentInfo[] {
        return Array.from(this.environmentsConfig.values());
    }

    /**
     * Obtient les informations d'un environnement spécifique
     * @param environment Type d'environnement
     * @returns Informations détaillées de l'environnement
     */
    public getEnvironmentInfo(environment: CulturalEnvironment): EnvironmentInfo | null {
        return this.environmentsConfig.get(environment) || null;
    }

    /**
     * Analyse la compatibilité d'un environnement avec les besoins utilisateur
     * @param environment Environnement à analyser
     * @param userNeeds Besoins de l'utilisateur
     * @returns Score de compatibilité (0-1)
     */
    public analyzeEnvironmentCompatibility(
        environment: CulturalEnvironment,
        userNeeds: UserNeeds
    ): number {
        const envInfo = this.environmentsConfig.get(environment);
        if (!envInfo) return 0;

        // Calculer la compatibilité selon différents critères
        const immersionMatch = Math.abs(envInfo.immersionLevel - userNeeds.culturalImmersion);
        const confidenceMatch = userNeeds.confidence > 0.7 ? envInfo.socialInteraction : (1 - envInfo.socialInteraction);
        const intellectualMatch = Math.abs(envInfo.culturalDepth - userNeeds.intellectualChallenge);

        // Score global de compatibilité
        const compatibility = 1 - ((immersionMatch + confidenceMatch + intellectualMatch) / 3);

        return Math.max(0, Math.min(1, compatibility));
    }

    // === MÉTHODES PRIVÉES ===

    /**
     * Compte le nombre total d'éléments culturels
     * @param elements Éléments culturels
     * @returns Nombre total d'éléments
     * @private
     */
    private countCulturalElements(elements: CulturalElements): number {
        return (
            elements.historicalReferences.length +
            elements.idiomaticExpressions.length +
            elements.socialCodes.length +
            elements.culturalEvents.length
        );
    }

    /**
     * Calcule la profondeur culturelle d'un contexte
     * @param context Contexte culturel
     * @returns Profondeur culturelle (0-1)
     * @private
     */
    private calculateCulturalDepth(context: CulturalContext): number {
        const envInfo = this.environmentsConfig.get(context.environment);
        const baseDepth = envInfo?.culturalDepth || 0.5;
        const elementsBonus = this.countCulturalElements(context.culturalElements) * 0.02;

        return Math.min(1, baseDepth + elementsBonus);
    }

    /**
     * Sélectionne l'environnement optimal basé sur les besoins
     * @param userNeeds Besoins de l'utilisateur
     * @param sessions Sessions d'enseignement
     * @returns Environnement sélectionné
     * @private
     */
    private selectOptimalEnvironment(
        userNeeds: UserNeeds,
        sessions: readonly TeachingSession[]
    ): CulturalEnvironment {
        // Analyse du niveau de l'utilisateur basé sur les sessions
        const userLevel = this.estimateUserLevel(sessions);

        this.logger.debug('Sélection d\'environnement', {
            userLevel: parseFloat(userLevel.toFixed(3)),
            culturalImmersion: userNeeds.culturalImmersion,
            confidence: userNeeds.confidence
        });

        // Sélection basée sur les besoins et le niveau
        if (userNeeds.culturalImmersion > 0.8 && userLevel >= 0.6) {
            return 'deaf_community_center';
        }

        if (userNeeds.intellectualChallenge > 0.7) {
            return userLevel >= 0.4 ? 'deaf_school' : 'deaf_family_home';
        }

        if (userNeeds.emotionalSupport > 0.8) {
            return 'deaf_family_home';
        }

        if (userLevel >= 0.8) {
            return userNeeds.culturalImmersion > 0.6 ? 'deaf_social_event' : 'mixed_environment';
        }

        // Par défaut pour débutants
        return 'deaf_family_home';
    }

    /**
     * Génère les éléments culturels pour un environnement
     * @param environment Environnement sélectionné
     * @param sessions Sessions pour adaptation
     * @returns Éléments culturels
     * @private
     */
    private generateCulturalElements(
        environment: CulturalEnvironment,
        sessions: readonly TeachingSession[]
    ): CulturalElements {
        const baseElements = this.getBaseElementsForEnvironment(environment);
        const adaptedElements = this.adaptElementsToSessions(baseElements, sessions);

        return adaptedElements;
    }

    /**
     * Obtient les éléments culturels de base pour un environnement
     * @param environment Environnement
     * @returns Éléments de base
     * @private
     */
    private getBaseElementsForEnvironment(environment: CulturalEnvironment): CulturalElements {
        const environmentElements: Record<CulturalEnvironment, CulturalElements> = {
            deaf_family_home: {
                historicalReferences: [
                    'Traditions familiales sourdes',
                    'Transmission intergénérationnelle LSF',
                    'Histoire de l\'éducation sourde en famille',
                    'Héritage culturel sourd familial'
                ],
                idiomaticExpressions: [
                    'Expressions familiales LSF authentiques',
                    'Proverbes sourds traditionnels',
                    'Métaphores visuelles familiales',
                    'Sagesse populaire sourde'
                ],
                socialCodes: [
                    'Politesse familiale sourde',
                    'Respect des aînés sourds',
                    'Communication visuelle familiale',
                    'Étiquette des repas signés'
                ],
                culturalEvents: [
                    'Réunions de famille sourdes',
                    'Célébrations traditionnelles LSF',
                    'Anniversaires en langue des signes',
                    'Transmissions de récits familiaux'
                ]
            },
            deaf_school: {
                historicalReferences: [
                    'Histoire des écoles pour sourds',
                    'Évolution des méthodes pédagogiques LSF',
                    'Pionners de l\'enseignement sourd',
                    'Renaissance de l\'éducation bilingue'
                ],
                idiomaticExpressions: [
                    'Expressions scolaires LSF',
                    'Vocabulaire académique sourd',
                    'Métaphores éducatives visuelles',
                    'Langage spécialisé de l\'enseignement'
                ],
                socialCodes: [
                    'Respect enseignant-élève sourd',
                    'Collaboration entre pairs sourds',
                    'Codes de conduite en classe LSF',
                    'Étiquette de l\'apprentissage collectif'
                ],
                culturalEvents: [
                    'Spectacles scolaires en LSF',
                    'Concours inter-écoles sourdes',
                    'Remises de diplômes bilingues',
                    'Projets culturels étudiants'
                ]
            },
            deaf_community_center: {
                historicalReferences: [
                    'Histoire des centres communautaires sourds',
                    'Mouvement des droits sourds',
                    'Leaders communautaires historiques',
                    'Luttes pour la reconnaissance LSF'
                ],
                idiomaticExpressions: [
                    'Expressions communautaires spécialisées',
                    'Argot sourd local authentique',
                    'Références culturelles partagées',
                    'Vocabulaire militant et revendicatif'
                ],
                socialCodes: [
                    'Protocoles communautaires établis',
                    'Solidarité sourde traditionnelle',
                    'Codes de reconnaissance identitaire',
                    'Éthique de l\'entraide communautaire'
                ],
                culturalEvents: [
                    'Assemblées communautaires démocratiques',
                    'Festivals culturels sourds',
                    'Conférences et débats citoyens',
                    'Manifestations pour les droits'
                ]
            },
            deaf_workplace: {
                historicalReferences: [
                    'Évolution de l\'emploi des personnes sourdes',
                    'Pionniers professionnels sourds',
                    'Conquête des droits du travail',
                    'Innovation en accessibilité professionnelle'
                ],
                idiomaticExpressions: [
                    'Jargon professionnel LSF spécialisé',
                    'Expressions du monde du travail adaptées',
                    'Métaphores business en langue des signes',
                    'Vocabulaire technique professionnel'
                ],
                socialCodes: [
                    'Étiquette professionnelle sourde',
                    'Communication en réunion LSF',
                    'Réseautage professionnel inclusif',
                    'Protocoles de collaboration mixte'
                ],
                culturalEvents: [
                    'Réunions d\'équipe inclusives',
                    'Formations professionnelles LSF',
                    'Événements d\'entreprise adaptés',
                    'Conférences sectorielles bilingues'
                ]
            },
            deaf_social_event: {
                historicalReferences: [
                    'Traditions festives de la communauté sourde',
                    'Histoire des rassemblements culturels',
                    'Événements marquants communautaires',
                    'Célébrations identitaires sourdes'
                ],
                idiomaticExpressions: [
                    'Expressions festives LSF',
                    'Humour sourd partagé et subtil',
                    'Chants et poésie visuels',
                    'Références culturelles festives'
                ],
                socialCodes: [
                    'Savoir-vivre festif sourd',
                    'Interactions sociales LSF spontanées',
                    'Codes de convivialité communautaire',
                    'Étiquette des célébrations'
                ],
                culturalEvents: [
                    'Soirées communautaires thématiques',
                    'Spectacles et représentations artistiques',
                    'Célébrations culturelles annuelles',
                    'Festivals de créativité sourde'
                ]
            },
            mixed_environment: {
                historicalReferences: [
                    'Histoire de l\'intégration sociale',
                    'Évolution des droits inclusifs',
                    'Pionniers de l\'accessibilité universelle',
                    'Progrès de la sensibilisation sociale'
                ],
                idiomaticExpressions: [
                    'Expressions d\'adaptation culturelle',
                    'Vocabulaire de l\'inclusion sociale',
                    'Métaphores de coexistence harmonieuse',
                    'Langage de la diversité'
                ],
                socialCodes: [
                    'Codes d\'interaction mixte respectueuse',
                    'Sensibilisation des entendants',
                    'Communication adaptée bilingue',
                    'Étiquette de l\'accessibilité'
                ],
                culturalEvents: [
                    'Événements inclusifs et ouverts',
                    'Sensibilisations publiques éducatives',
                    'Collaborations créatives mixtes',
                    'Initiatives d\'intégration sociale'
                ]
            }
        };

        return environmentElements[environment];
    }

    /**
     * Adapte les éléments culturels selon les sessions
     * @param baseElements Éléments de base
     * @param sessions Sessions d'enseignement
     * @returns Éléments adaptés
     * @private
     */
    private adaptElementsToSessions(
        baseElements: CulturalElements,
        sessions: readonly TeachingSession[]
    ): CulturalElements {
        // Analyser les sujets abordés dans les sessions
        const topics = new Set(sessions.flatMap(s => [s.content.topic, ...s.content.concepts]));

        // Créer de nouvelles arrays pour respecter les propriétés readonly
        let historicalReferences = [...baseElements.historicalReferences];
        let idiomaticExpressions = [...baseElements.idiomaticExpressions];
        let socialCodes = [...baseElements.socialCodes];
        let culturalEvents = [...baseElements.culturalEvents];

        // Enrichir selon les sujets abordés
        if (topics.has('grammar_lsf')) {
            historicalReferences = [
                ...historicalReferences,
                'Évolution historique de la grammaire LSF'
            ];
        }

        if (topics.has('expression')) {
            idiomaticExpressions = [
                ...idiomaticExpressions,
                'Techniques d\'expression créative en LSF'
            ];
        }

        if (topics.has('basic_signs')) {
            socialCodes = [
                ...socialCodes,
                'Bonnes pratiques des signes de base'
            ];
        }

        if (topics.has('social')) {
            culturalEvents = [
                ...culturalEvents,
                'Événements sociaux de la communauté sourde'
            ];
        }

        // Retourner un nouvel objet avec les éléments adaptés
        return {
            historicalReferences,
            idiomaticExpressions,
            socialCodes,
            culturalEvents
        };
    }

    /**
     * Calcule le niveau d'immersion optimal
     * @param userNeeds Besoins de l'utilisateur
     * @param sessions Sessions d'enseignement
     * @returns Niveau d'immersion (0-1)
     * @private
     */
    private calculateImmersionLevel(
        userNeeds: UserNeeds,
        sessions: readonly TeachingSession[]
    ): number {
        // Base sur les besoins d'immersion culturelle
        let immersionLevel = userNeeds.culturalImmersion;

        // Ajuster selon la performance
        if (sessions.length > 0) {
            const comprehensionValues = sessions.map(s => s.aiReactions.comprehension);
            const avgComprehension = comprehensionValues.reduce((sum, val) => sum + val, 0) / comprehensionValues.length;

            // Plus la compréhension est bonne, plus on peut augmenter l'immersion
            immersionLevel = Math.min(1, immersionLevel + (avgComprehension - 0.5) * 0.3);
        }

        // Ajuster selon la confiance
        if (userNeeds.confidence < 0.5) {
            immersionLevel *= 0.8; // Réduire l'immersion si manque de confiance
        }

        return Math.max(0.3, Math.min(1, immersionLevel));
    }

    /**
     * Calcule l'authenticité du contexte
     * @param environment Environnement sélectionné
     * @param sessions Sessions d'enseignement
     * @returns Niveau d'authenticité (0-1)
     * @private
     */
    private calculateAuthenticity(
        environment: CulturalEnvironment,
        sessions: readonly TeachingSession[]
    ): number {
        // Base d'authenticité par environnement
        const environmentAuthenticity: Record<CulturalEnvironment, number> = {
            deaf_family_home: 0.9,
            deaf_school: 0.85,
            deaf_community_center: 0.95,
            deaf_workplace: 0.7,
            deaf_social_event: 0.9,
            mixed_environment: 0.6
        };

        let authenticity = environmentAuthenticity[environment];

        // Ajuster selon la diversité des méthodes d'enseignement
        if (sessions.length > 0) {
            const methods = new Set(sessions.map(s => s.content.teachingMethod));
            const methodDiversity = methods.size / Math.max(sessions.length, 1);

            // Plus de diversité = plus d'authenticité
            authenticity += methodDiversity * 0.1;
        }

        return Math.max(0.5, Math.min(1, authenticity));
    }

    /**
     * Calcule le niveau d'adaptation contextuelle
     * @param userNeeds Besoins de l'utilisateur
     * @param sessions Sessions d'enseignement
     * @returns Niveau d'adaptation (0-1)
     * @private
     */
    private calculateAdaptationLevel(
        userNeeds: UserNeeds,
        sessions: readonly TeachingSession[]
    ): number {
        // Base sur les besoins de support émotionnel
        let adaptationLevel = 1 - userNeeds.emotionalSupport;

        // Ajuster selon la progression
        if (sessions.length > 1) {
            const improvementValues = sessions.map(s => s.results.improvement);
            const avgImprovement = improvementValues.reduce((sum, val) => sum + val, 0) / improvementValues.length;

            adaptationLevel = Math.min(1, adaptationLevel + avgImprovement * 0.2);
        }

        return Math.max(0.2, Math.min(1, adaptationLevel));
    }

    /**
     * Calcule la complexité sociale de l'environnement
     * @param environment Environnement culturel
     * @param userNeeds Besoins de l'utilisateur
     * @returns Complexité sociale (0-1)
     * @private
     */
    private calculateSocialComplexity(
        environment: CulturalEnvironment,
        userNeeds: UserNeeds
    ): number {
        const envInfo = this.environmentsConfig.get(environment);
        const baseSocialComplexity = envInfo?.socialInteraction || 0.5;

        // Ajuster selon la confiance de l'utilisateur
        const confidenceAdjustment = userNeeds.confidence > 0.7 ? 0.2 : -0.1;

        return Math.max(0.2, Math.min(1, baseSocialComplexity + confidenceAdjustment));
    }

    /**
     * Estime le niveau de l'utilisateur basé sur les sessions
     * @param sessions Sessions d'enseignement
     * @returns Niveau estimé (0-1)
     * @private
     */
    private estimateUserLevel(sessions: readonly TeachingSession[]): number {
        if (sessions.length === 0) return 0.3; // Niveau débutant par défaut

        const comprehensionValues = sessions.map(s => s.aiReactions.comprehension);
        const avgComprehension = comprehensionValues.reduce((sum, val) => sum + val, 0) / comprehensionValues.length;

        // Ajuster selon la progression
        const improvementValues = sessions.map(s => s.results.improvement);
        const avgImprovement = improvementValues.reduce((sum, val) => sum + val, 0) / improvementValues.length;

        return Math.max(0.1, Math.min(1, avgComprehension + avgImprovement * 0.2));
    }

    /**
     * Génère des suggestions d'activités culturelles
     * @param environment Environnement culturel
     * @param userLevel Niveau de l'utilisateur
     * @returns Activités suggérées
     */
    public suggestCulturalActivities(
        environment: CulturalEnvironment,
        userLevel: number
    ): readonly string[] {
        const activities: Record<CulturalEnvironment, Record<string, readonly string[]>> = {
            deaf_family_home: {
                beginner: ['Repas en famille LSF', 'Histoires du soir signées', 'Jeux familiaux adaptés'],
                intermediate: ['Conversations familiales profondes', 'Préparation d\'événements familiaux', 'Partage de souvenirs intergénérationnels'],
                advanced: ['Débats familiaux constructifs', 'Transmission de traditions ancestrales', 'Conseil de famille démocratique']
            },
            deaf_school: {
                beginner: ['Cours de base LSF structurés', 'Exercices guidés progressifs', 'Évaluations formatives'],
                intermediate: ['Projets de groupe collaboratifs', 'Présentations académiques', 'Recherches dirigées spécialisées'],
                advanced: ['Enseignement aux pairs novices', 'Projets de recherche complexes', 'Innovation pédagogique']
            },
            deaf_community_center: {
                beginner: ['Visite guidée du centre', 'Présentation personnelle simple', 'Participation à des jeux communautaires'],
                intermediate: ['Ateliers culturels spécialisés', 'Groupes de discussion thématiques', 'Événements culturels participatifs'],
                advanced: ['Animation d\'activités communautaires', 'Débats sociétaux engagés', 'Leadership d\'initiatives citoyennes']
            },
            deaf_workplace: {
                beginner: ['Visite du lieu de travail', 'Présentations professionnelles simples', 'Communication de base en entreprise'],
                intermediate: ['Réunions d\'équipe participatives', 'Projets collaboratifs professionnels', 'Formations spécialisées sectorielles'],
                advanced: ['Leadership de projets stratégiques', 'Mentoring professionnel expert', 'Innovation en accessibilité workplace']
            },
            deaf_social_event: {
                beginner: ['Participation à des fêtes conviviales', 'Jeux communautaires ludiques', 'Présentations sociales informelles'],
                intermediate: ['Organisation d\'événements festifs', 'Animation de soirées thématiques', 'Spectacles participatifs créatifs'],
                advanced: ['Coordination d\'événements majeurs', 'Performance artistique professionnelle', 'Leadership culturel innovant']
            },
            mixed_environment: {
                beginner: ['Sensibilisation basique à l\'inclusion', 'Interactions simples bilingues', 'Découverte de la diversité'],
                intermediate: ['Facilitation d\'échanges interculturels', 'Projets inclusifs collaboratifs', 'Formation à l\'accessibilité'],
                advanced: ['Ambassadeur de l\'inclusion sociale', 'Formation d\'entendants à la LSF', 'Plaidoyer pour l\'accessibilité universelle']
            }
        };

        const levelKey = userLevel < 0.4 ? 'beginner' : userLevel < 0.7 ? 'intermediate' : 'advanced';

        return activities[environment]?.[levelKey] || [
            'Activités d\'immersion culturelle adaptées',
            'Échanges communautaires enrichissants',
            'Participation aux événements de la communauté sourde'
        ];
    }
}