/**
 * @file src/ai/services/learning/human/coda/codavirtuel/adapters/analyzers/interaction-analyzer.ts
 * @description Analyseur de patterns d'interaction pour le système d'apprentissage adaptatif
 * @module InteractionAnalyzer
 * 
 * Ce module analyse les patterns d'interaction utilisateur pour générer des recommandations
 * adaptatives dans le cadre du système CODA virtuel de MetaSign.
 */

import {
    UserInteraction,
    InteractionPattern,
    InteractionRecommendation,
    PatternAnalysisResult,
    FrequencyPattern,
    SequencePattern
} from '../types';

/**
 * Analyseur de patterns d'interaction utilisateur
 * 
 * @class InteractionPatternAnalyzer
 * @description Classe responsable de l'analyse des patterns d'interaction utilisateur
 * et de la génération de recommandations adaptatives pour améliorer l'expérience
 * d'apprentissage de la LSF.
 * 
 * @example
 * ```typescript
 * const analyzer = new InteractionPatternAnalyzer();
 * const patterns = analyzer.analyzePatterns(userInteractions);
 * const recommendations = analyzer.generateRecommendations(patterns);
 * ```
 */
export class InteractionPatternAnalyzer {
    /**
     * Analyse les patterns dans une collection d'interactions utilisateur
     * 
     * @method analyzePatterns
     * @param {UserInteraction[]} interactions - Interactions utilisateur à analyser
     * @returns {InteractionPattern[]} Patterns d'interaction détectés
     * 
     * @description Identifie les patterns de fréquence et de séquence dans les interactions
     * pour comprendre le comportement de l'utilisateur
     */
    public analyzePatterns(interactions: UserInteraction[]): InteractionPattern[] {
        if (!interactions || interactions.length === 0) {
            return [];
        }

        // Grouper les interactions par type
        const interactionsByType = new Map<string, UserInteraction[]>();

        for (const interaction of interactions) {
            const type = interaction.interactionType;
            if (!interactionsByType.has(type)) {
                interactionsByType.set(type, []);
            }
            const typeInteractions = interactionsByType.get(type);
            if (typeInteractions) {
                typeInteractions.push(interaction);
            }
        }

        const patterns: InteractionPattern[] = [];

        // Analyser la fréquence des types d'interactions
        for (const [type, typeInteractions] of interactionsByType.entries()) {
            const freqPattern: FrequencyPattern = {
                type: 'frequency',
                interactionType: type,
                count: typeInteractions.length,
                averageDuration: this.calculateAverageDuration(typeInteractions)
            };
            patterns.push(freqPattern);
        }

        // Analyser les séquences d'interactions
        if (interactions.length > 1) {
            const sequences = this.findSequences(interactions);
            if (sequences.length > 0) {
                const seqPattern: SequencePattern = {
                    type: 'sequence',
                    sequences
                };
                patterns.push(seqPattern);
            }
        }

        return patterns;
    }

    /**
     * Génère des recommandations basées sur les patterns d'interaction
     * 
     * @method generateRecommendations
     * @param {InteractionPattern[]} patterns - Patterns d'interaction détectés
     * @returns {InteractionRecommendation[]} Recommandations adaptatives
     * 
     * @description Transforme les patterns détectés en recommandations concrètes
     * pour améliorer l'expérience d'apprentissage
     */
    public generateRecommendations(patterns: InteractionPattern[]): InteractionRecommendation[] {
        const recommendations: InteractionRecommendation[] = [];

        for (const pattern of patterns) {
            if (pattern.type === 'frequency') {
                this.processFrequencyPattern(pattern, recommendations);
            } else if (pattern.type === 'sequence') {
                this.processSequencePattern(pattern, recommendations);
            }
        }

        return recommendations;
    }

    /**
     * Analyse les interactions et génère un rapport complet
     * 
     * @method analyzeInteractions
     * @param {UserInteraction[]} interactions - Liste des interactions à analyser
     * @param {number} [timeRange] - Période d'analyse en secondes (optionnel)
     * @returns {PatternAnalysisResult} Résultat complet de l'analyse
     * 
     * @description Point d'entrée principal pour l'analyse complète des interactions
     * avec support de filtrage temporel
     */
    public analyzeInteractions(
        interactions: UserInteraction[],
        timeRange?: number
    ): PatternAnalysisResult {
        try {
            // Filtrer les interactions par plage de temps si spécifié
            let filteredInteractions = interactions;
            if (timeRange) {
                const timeThreshold = new Date(Date.now() - timeRange * 1000);
                filteredInteractions = interactions.filter(
                    interaction => interaction.timestamp >= timeThreshold
                );
            }

            if (!filteredInteractions || filteredInteractions.length === 0) {
                return {
                    patterns: [],
                    recommendations: [],
                    confidence: 0,
                    timestamp: new Date(),
                    message: "Données insuffisantes pour l'analyse de patterns"
                };
            }

            // Analyser les patterns et générer des recommandations
            const patterns = this.analyzePatterns(filteredInteractions);
            const recommendations = this.generateRecommendations(patterns);

            return {
                patterns,
                recommendations,
                confidence: this.calculateConfidence(patterns, recommendations),
                timestamp: new Date()
            };
        } catch (error) {
            return {
                patterns: [],
                recommendations: [],
                confidence: 0,
                timestamp: new Date(),
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * Calcule la durée moyenne des interactions
     * 
     * @private
     * @method calculateAverageDuration
     * @param {UserInteraction[]} interactions - Liste des interactions
     * @returns {number} Durée moyenne en secondes
     * 
     * @description Calcule la durée moyenne en filtrant les valeurs invalides
     * et en gérant correctement les propriétés optionnelles
     */
    private calculateAverageDuration(interactions: UserInteraction[]): number {
        // Filtrer et extraire uniquement les durées valides
        const validDurations = interactions
            .filter(interaction =>
                interaction !== null &&
                interaction !== undefined &&
                'duration' in interaction &&
                interaction.duration !== undefined &&
                interaction.duration !== null &&
                typeof interaction.duration === 'number' &&
                interaction.duration >= 0
            )
            .map(interaction => interaction.duration as number);

        if (validDurations.length === 0) {
            return 0;
        }

        // Calcul de la moyenne avec protection contre les valeurs extrêmes
        const total = validDurations.reduce((sum, duration) => sum + duration, 0);
        const average = total / validDurations.length;

        // Arrondir à 2 décimales pour la précision
        return Math.round(average * 100) / 100;
    }

    /**
     * Trouve des séquences répétitives dans les interactions
     * 
     * @private
     * @method findSequences
     * @param {UserInteraction[]} interactions - Liste des interactions
     * @returns {Array<{from: string; to: string; frequency: number}>} Séquences détectées
     * 
     * @description Identifie les transitions fréquentes entre types d'interactions
     * pour détecter des patterns comportementaux
     */
    private findSequences(interactions: UserInteraction[]): Array<{
        from: string;
        to: string;
        frequency: number;
    }> {
        // Détecter les transitions fréquentes entre types d'interactions
        const transitions = new Map<string, Map<string, number>>();

        // Valider et filtrer les interactions
        const validInteractions = interactions.filter(
            (interaction): interaction is UserInteraction =>
                interaction !== null &&
                interaction !== undefined &&
                typeof interaction.interactionType === 'string' &&
                interaction.timestamp instanceof Date
        );

        // Analyser les transitions entre interactions consécutives
        for (let i = 0; i < validInteractions.length - 1; i++) {
            const currentType = validInteractions[i].interactionType;
            const nextType = validInteractions[i + 1].interactionType;

            if (!transitions.has(currentType)) {
                transitions.set(currentType, new Map<string, number>());
            }

            const typeTransitions = transitions.get(currentType);
            if (typeTransitions) {
                const currentCount = typeTransitions.get(nextType) ?? 0;
                typeTransitions.set(nextType, currentCount + 1);
            }
        }

        // Convertir en tableau de résultats avec seuil de fréquence
        const sequences: Array<{ from: string; to: string; frequency: number }> = [];
        const SEQUENCE_THRESHOLD = 2; // Seuil minimal pour considérer une séquence significative

        for (const [fromType, toTypes] of transitions.entries()) {
            for (const [toType, count] of toTypes.entries()) {
                if (count >= SEQUENCE_THRESHOLD) {
                    sequences.push({
                        from: fromType,
                        to: toType,
                        frequency: count
                    });
                }
            }
        }

        return sequences;
    }

    /**
     * Traite un pattern de fréquence pour générer des recommandations
     * 
     * @private
     * @method processFrequencyPattern
     * @param {FrequencyPattern} pattern - Pattern de fréquence détecté
     * @param {InteractionRecommendation[]} recommendations - Tableau de recommandations à compléter
     * 
     * @description Applique des règles métier pour transformer les patterns de fréquence
     * en recommandations pédagogiques concrètes
     */
    private processFrequencyPattern(
        pattern: FrequencyPattern,
        recommendations: InteractionRecommendation[]
    ): void {
        const { interactionType: type, count } = pattern;

        // Règles basées sur la fréquence des interactions
        if (type === 'help_request' && count > 3) {
            recommendations.push({
                type: 'assistance',
                priority: 'high',
                reason: 'Nombreuses demandes d\'aide détectées',
                suggestion: 'Proposer des explications détaillées proactivement'
            });
        }

        if (type === 'content_skip' && count > 2) {
            recommendations.push({
                type: 'content',
                priority: 'medium',
                reason: 'Passages de contenus fréquents',
                suggestion: 'Proposer un contenu plus engageant ou interactif'
            });
        }

        if (type === 'error' && count > 2) {
            recommendations.push({
                type: 'support',
                priority: 'high',
                reason: 'Erreurs répétées détectées',
                suggestion: 'Proposer des tutoriels ou des exercices de révision'
            });
        }

        if (type === 'long_pause' && count > 2) {
            recommendations.push({
                type: 'engagement',
                priority: 'medium',
                reason: 'Pauses fréquentes détectées',
                suggestion: 'Proposer des contenus plus courts ou des pauses structurées'
            });
        }
    }

    /**
     * Traite un pattern de séquence pour générer des recommandations
     * 
     * @private
     * @method processSequencePattern
     * @param {SequencePattern} pattern - Pattern de séquence détecté
     * @param {InteractionRecommendation[]} recommendations - Tableau de recommandations à compléter
     * 
     * @description Analyse les séquences comportementales pour identifier
     * des problèmes structurels dans le parcours d'apprentissage
     */
    private processSequencePattern(
        pattern: SequencePattern,
        recommendations: InteractionRecommendation[]
    ): void {
        // Analyser les séquences pour des recommandations plus sophistiquées
        const hasHelpSequence = pattern.sequences.some(
            seq => seq.from === 'content_view' &&
                seq.to === 'help_request' &&
                seq.frequency > 2
        );

        if (hasHelpSequence) {
            recommendations.push({
                type: 'support',
                priority: 'high',
                reason: 'Séquence répétée de consultation puis demande d\'aide',
                suggestion: 'Améliorer les explications initiales du contenu'
            });
        }

        const hasSkipSequence = pattern.sequences.some(
            seq => seq.to === 'content_skip' && seq.frequency > 2
        );

        if (hasSkipSequence) {
            recommendations.push({
                type: 'navigation',
                priority: 'medium',
                reason: 'Patterns de navigation avec sauts fréquents',
                suggestion: 'Optimiser la navigation pour faciliter le parcours d\'apprentissage'
            });
        }
    }

    /**
     * Calcule un score de confiance pour les résultats d'analyse
     * 
     * @private
     * @method calculateConfidence
     * @param {InteractionPattern[]} patterns - Patterns détectés
     * @param {InteractionRecommendation[]} recommendations - Recommandations générées
     * @returns {number} Score de confiance entre 0 et 1
     * 
     * @description Évalue la fiabilité des résultats en fonction du nombre
     * de patterns détectés et de recommandations générées
     */
    private calculateConfidence(
        patterns: InteractionPattern[],
        recommendations: InteractionRecommendation[]
    ): number {
        if (patterns.length === 0) {
            return 0;
        }

        // Calcul pondéré de la confiance avec plafonds
        const MAX_PATTERNS_FOR_CONFIDENCE = 5;
        const MAX_RECOMMENDATIONS_FOR_CONFIDENCE = 3;

        const patternWeight = Math.min(patterns.length / MAX_PATTERNS_FOR_CONFIDENCE, 1) * 0.7;
        const recWeight = Math.min(recommendations.length / MAX_RECOMMENDATIONS_FOR_CONFIDENCE, 1) * 0.3;

        const confidence = patternWeight + recWeight;

        // Arrondir à 2 décimales
        return Math.round(confidence * 100) / 100;
    }
}