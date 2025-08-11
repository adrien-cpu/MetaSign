// src/ai/learning/adapters/realtime/FrustrationDetector.ts

import { FrustrationLevel, UserInteraction } from '../../types';
import { Logger } from '@ai/utils/Logger';

/**
 * Interface pour les indicateurs de frustration
 */
interface FrustrationIndicators {
    rapidRepeatedActions: number;
    errorRate: number;
    actionCancellations: number;
    helpRequests: number;
    inactivityPeriods: number;
    erraticNavigation: number;
}

/**
 * Type pour les indicateurs de frustration normalisés
 * Même structure que FrustrationIndicators mais avec des valeurs normalisées (0-1)
 */
type NormalizedIndicators = FrustrationIndicators;

/**
 * Détecteur de frustration responsable d'analyser les signes de frustration
 */
export class FrustrationDetector {
    private readonly logger: Logger;

    constructor() {
        this.logger = new Logger('FrustrationDetector');
    }

    /**
     * Détecte le niveau de frustration à partir des interactions
     */
    public detect(userId: string, interactions: UserInteraction[]): FrustrationLevel {
        this.logger.info(`Detecting frustration level for user ${userId}`);

        // Pas suffisamment de données pour analyser la frustration
        if (interactions.length === 0) {
            return FrustrationLevel.NONE;
        }

        // Indicateurs de frustration
        const frustrationIndicators = this.calculateFrustrationIndicators(interactions);

        // Normaliser les indicateurs
        const normalizedIndicators = this.normalizeIndicators(frustrationIndicators, interactions.length);

        // Calculer le score de frustration
        const frustrationScore = this.calculateFrustrationScore(normalizedIndicators);

        // Convertir en niveau de frustration
        return this.mapScoreToLevel(frustrationScore);
    }

    /**
     * Calcule les indicateurs de frustration à partir des interactions
     */
    private calculateFrustrationIndicators(interactions: UserInteraction[]): FrustrationIndicators {
        // Valeurs par défaut
        const indicators: FrustrationIndicators = {
            rapidRepeatedActions: 0,
            errorRate: 0,
            actionCancellations: 0,
            helpRequests: 0,
            inactivityPeriods: 0,
            erraticNavigation: 0
        };

        // Compteurs pour les calculs
        let errors = 0;
        let cancellations = 0;
        let helpRequests = 0;

        // Trier les interactions par horodatage
        const sortedInteractions = [...interactions].sort(
            (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );

        // Calculer les actions répétées rapidement
        let rapidActions = 0;
        const timeThreshold = 2000; // 2 secondes

        for (let i = 1; i < sortedInteractions.length; i++) {
            const timeDiff = sortedInteractions[i].timestamp.getTime() -
                sortedInteractions[i - 1].timestamp.getTime();

            if (timeDiff < timeThreshold) {
                rapidActions++;
            }
        }

        indicators.rapidRepeatedActions = rapidActions;

        // Calculer le taux d'erreurs
        for (const interaction of interactions) {
            // Compter les erreurs
            if (interaction.details?.success === false) {
                errors++;
            }

            // Compter les annulations
            if (interaction.interactionType === 'cancel' ||
                interaction.interactionType.includes('cancel')) {
                cancellations++;
            }

            // Compter les demandes d'aide
            if (interaction.interactionType === 'help' ||
                interaction.interactionType.includes('help')) {
                helpRequests++;
            }
        }

        indicators.errorRate = errors;
        indicators.actionCancellations = cancellations;
        indicators.helpRequests = helpRequests;

        // Détecter les périodes d'inactivité
        let inactivityPeriods = 0;
        const inactivityThreshold = 30000; // 30 secondes

        for (let i = 1; i < sortedInteractions.length; i++) {
            const timeDiff = sortedInteractions[i].timestamp.getTime() -
                sortedInteractions[i - 1].timestamp.getTime();

            if (timeDiff > inactivityThreshold) {
                inactivityPeriods++;
            }
        }

        indicators.inactivityPeriods = inactivityPeriods;

        // Analyser la navigation erratique (changements rapides entre sections)
        let sectionChanges = 0;
        for (let i = 1; i < sortedInteractions.length; i++) {
            // Extraire la section du chemin d'activité
            const currentSection = this.extractSectionFromActivity(sortedInteractions[i].activityId);
            const previousSection = this.extractSectionFromActivity(sortedInteractions[i - 1].activityId);

            if (currentSection !== previousSection) {
                sectionChanges++;
            }
        }

        indicators.erraticNavigation = sectionChanges;

        return indicators;
    }

    /**
     * Extrait la section principale d'un ID d'activité
     */
    private extractSectionFromActivity(activityId: string): string {
        // Exemple simple : extrait la première partie de l'ID (avant le premier '_')
        const parts = activityId.split('_');
        return parts[0] || '';
    }

    /**
     * Normalise les indicateurs de frustration
     */
    private normalizeIndicators(
        indicators: FrustrationIndicators,
        interactionCount: number
    ): NormalizedIndicators {
        // Éviter la division par zéro
        if (interactionCount === 0) {
            return {
                rapidRepeatedActions: 0,
                errorRate: 0,
                actionCancellations: 0,
                helpRequests: 0,
                inactivityPeriods: 0,
                erraticNavigation: 0
            };
        }

        // Normaliser les valeurs brutes en valeurs relatives (0-1)
        return {
            rapidRepeatedActions: Math.min(indicators.rapidRepeatedActions / interactionCount, 1),
            errorRate: Math.min(indicators.errorRate / interactionCount, 1),
            actionCancellations: Math.min(indicators.actionCancellations / interactionCount, 1),
            helpRequests: Math.min(indicators.helpRequests / interactionCount, 1),
            inactivityPeriods: Math.min(indicators.inactivityPeriods / (interactionCount / 10), 1),
            erraticNavigation: Math.min(indicators.erraticNavigation / (interactionCount / 5), 1)
        };
    }

    /**
     * Calcule le score de frustration à partir des indicateurs normalisés
     */
    private calculateFrustrationScore(indicators: NormalizedIndicators): number {
        // Pondération des indicateurs
        const weights = {
            rapidRepeatedActions: 0.2,
            errorRate: 0.25,
            actionCancellations: 0.15,
            helpRequests: 0.2,
            inactivityPeriods: 0.1,
            erraticNavigation: 0.1
        };

        // Calculer le score pondéré
        const score =
            indicators.rapidRepeatedActions * weights.rapidRepeatedActions +
            indicators.errorRate * weights.errorRate +
            indicators.actionCancellations * weights.actionCancellations +
            indicators.helpRequests * weights.helpRequests +
            indicators.inactivityPeriods * weights.inactivityPeriods +
            indicators.erraticNavigation * weights.erraticNavigation;

        // Normaliser à 100
        return score * 100;
    }

    /**
     * Convertit un score en niveau de frustration
     */
    private mapScoreToLevel(score: number): FrustrationLevel {
        if (score < 20) {
            return FrustrationLevel.NONE;
        } else if (score < 40) {
            return FrustrationLevel.LOW;
        } else if (score < 60) {
            return FrustrationLevel.MEDIUM;
        } else if (score < 80) {
            return FrustrationLevel.HIGH;
        } else {
            return FrustrationLevel.EXTREME;
        }
    }
}