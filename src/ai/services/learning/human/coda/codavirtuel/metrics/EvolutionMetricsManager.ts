/**
 * @file src/ai/services/learning/human/coda/codavirtuel/metrics/EvolutionMetricsManager.ts
 * @description Gestionnaire spécialisé pour les métriques d'évolution des IA-élèves
 * 
 * @module EvolutionMetricsManager
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Evolutionary AI Division
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import type {
    EvolutionMetrics,
    EvolutionEvent,
    EvolutionFactors,
    AIPersonalityProfile
} from '@/ai/services/learning/human/coda/codavirtuel/types/evolution.types';

/**
 * Interface pour l'historique des métriques
 */
export interface MetricsHistory {
    readonly timestamp: Date;
    readonly metrics: EvolutionMetrics;
    readonly context: string;
}

/**
 * Gestionnaire des métriques d'évolution
 * 
 * @class EvolutionMetricsManager
 * @description Gère le stockage, la mise à jour et l'historique des métriques d'évolution
 * pour chaque IA-élève, avec prise en compte des profils de personnalité.
 */
export class EvolutionMetricsManager {
    /**
     * Logger pour le gestionnaire de métriques
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('EvolutionMetricsManager_v3');

    /**
     * Métriques d'évolution par IA-élève
     * @private
     */
    private readonly studentMetrics: Map<string, EvolutionMetrics> = new Map();

    /**
     * Historique des métriques par IA-élève
     * @private
     */
    private readonly metricsHistory: Map<string, MetricsHistory[]> = new Map();

    /**
     * Profils de personnalité pour adaptation des métriques
     * @private
     */
    private readonly personalityProfiles: Map<string, AIPersonalityProfile> = new Map();

    /**
     * Seuils de validation par métrique
     * @private
     * @readonly
     */
    private readonly validationThresholds: Record<keyof EvolutionMetrics, { min: number; max: number }> = {
        learningSpeed: { min: 0, max: 1 },
        knowledgeRetention: { min: 0, max: 1 },
        adaptability: { min: 0, max: 1 },
        emotionalResilience: { min: 0, max: 1 },
        intellectualCuriosity: { min: 0, max: 1 },
        lsfCommunicationEfficiency: { min: 0, max: 1 },
        globalConfidence: { min: 0, max: 1 },
        culturalProgress: { min: 0, max: 1 }
    };

    /**
     * Constructeur du gestionnaire de métriques
     * 
     * @constructor
     */
    constructor() {
        this.logger.info('📊 Gestionnaire métriques évolution initialisé');
    }

    /**
     * Obtient les métriques actuelles d'un étudiant
     * 
     * @method getStudentMetrics
     * @param {string} studentId - ID de l'IA-élève
     * @returns {EvolutionMetrics | undefined} Métriques ou undefined si non trouvées
     * @public
     */
    public getStudentMetrics(studentId: string): EvolutionMetrics | undefined {
        return this.studentMetrics.get(studentId);
    }

    /**
     * Met à jour les métriques d'un étudiant
     * 
     * @method updateStudentMetrics
     * @param {string} studentId - ID de l'IA-élève
     * @param {Partial<EvolutionMetrics>} updates - Mises à jour des métriques
     * @param {string} [context] - Contexte de la mise à jour
     * @returns {EvolutionMetrics} Nouvelles métriques complètes
     * @public
     */
    public updateStudentMetrics(
        studentId: string,
        updates: Partial<Record<keyof EvolutionMetrics, number>>,
        context?: string
    ): EvolutionMetrics {
        // Récupérer les métriques actuelles ou créer des métriques initiales
        const existingMetrics = this.studentMetrics.get(studentId);

        if (existingMetrics) {
            // Sauvegarder les anciennes métriques dans l'historique
            this.saveToHistory(studentId, existingMetrics, context || 'Mise à jour standard');
        }

        // Utiliser les métriques existantes ou créer des métriques initiales
        const metrics = existingMetrics || this.createInitialMetrics();

        // Fusionner et valider les métriques
        const newMetrics = this.mergeMetrics(metrics, updates);
        const validatedMetrics = this.validateMetrics(newMetrics);

        // Mettre à jour avec les nouvelles métriques
        this.studentMetrics.set(studentId, validatedMetrics);

        this.logger.debug('Métriques mises à jour', {
            studentId,
            changedMetrics: this.getChangedMetrics(metrics, validatedMetrics),
            context
        });

        return validatedMetrics;
    }

    /**
     * Applique un événement d'évolution aux métriques
     * 
     * @method applyEvolutionEvent
     * @param {string} studentId - ID de l'IA-élève
     * @param {EvolutionEvent} event - Événement d'évolution à appliquer
     * @returns {EvolutionMetrics} Métriques mises à jour
     * @public
     */
    public applyEvolutionEvent(studentId: string, event: EvolutionEvent): EvolutionMetrics {
        const currentMetrics = this.studentMetrics.get(studentId) || this.createInitialMetrics();
        const personality = this.personalityProfiles.get(studentId);
        this.logger.debug('Métriques actuelles avant application de l\'événement', { studentId, currentMetrics });
        // Créer un objet pour les mises à jour
        const updatesObj: Record<string, number> = {};
        // Appliquer le changement principal
        updatesObj[event.affectedMetric] = event.newValue;
        // Appliquer les effets secondaires selon la personnalité
        const secondaryEffects = this.calculateSecondaryEffects(event, personality);
        // Fusionner les effets secondaires
        Object.entries(secondaryEffects).forEach(([key, value]) => {
            updatesObj[key] = value;
        });
        return this.updateStudentMetrics(
            studentId,
            updatesObj,
            `Événement: ${event.eventType} (${event.trigger})`
        );
    }


    /**
     * Applique une évolution graduelle basée sur les facteurs
     * 
     * @method applyGradualEvolution
     * @param {string} studentId - ID de l'IA-élève
     * @param {EvolutionFactors} factors - Facteurs d'évolution
     * @param {number} evolutionRate - Taux d'évolution (0-1)
     * @returns {EvolutionMetrics} Métriques mises à jour
     * @public
     */
    public applyGradualEvolution(
        studentId: string,
        factors: EvolutionFactors,
        evolutionRate: number = 0.01
    ): EvolutionMetrics {
        const gradualUpdates = this.calculateGradualUpdates(
            this.studentMetrics.get(studentId) || this.createInitialMetrics(),
            factors,
            evolutionRate
        );
        return this.updateStudentMetrics(
            studentId,
            gradualUpdates,
            'Évolution graduelle'
        );
    }

    /**
     * Obtient l'historique des métriques d'un étudiant
     * 
     * @method getMetricsHistory
     * @param {string} studentId - ID de l'IA-élève
     * @param {number} [limit] - Nombre maximum d'entrées à retourner
     * @returns {readonly MetricsHistory[]} Historique des métriques
     * @public
     */
    public getMetricsHistory(studentId: string, limit?: number): readonly MetricsHistory[] {
        const history = this.metricsHistory.get(studentId) || [];
        return limit ? history.slice(-limit) : history;
    }

    /**
     * Enregistre un profil de personnalité
     * 
     * @method registerPersonalityProfile
     * @param {string} studentId - ID de l'IA-élève
     * @param {AIPersonalityProfile} profile - Profil de personnalité
     * @returns {void}
     * @public
     */
    public registerPersonalityProfile(studentId: string, profile: AIPersonalityProfile): void {
        this.personalityProfiles.set(studentId, profile);
        this.logger.debug('Profil personnalité enregistré', { studentId });
    }

    /**
     * Calcule les tendances d'évolution pour un étudiant
     * 
     * @method calculateEvolutionTrends
     * @param {string} studentId - ID de l'IA-élève
     * @param {number} [periodDays] - Période d'analyse en jours
     * @returns {Record<keyof EvolutionMetrics, number>} Tendances par métrique
     * @public
     */
    public calculateEvolutionTrends(
        studentId: string,
        periodDays: number = 7
    ): Record<keyof EvolutionMetrics, number> {
        const history = this.getMetricsHistory(studentId);
        const cutoffDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
        const recentHistory = history.filter(entry => entry.timestamp >= cutoffDate);

        if (recentHistory.length < 2) {
            // Pas assez de données pour calculer une tendance
            return this.createEmptyTrends();
        }

        const trends = this.createEmptyTrends();
        const firstEntry = recentHistory[0];
        const lastEntry = recentHistory[recentHistory.length - 1];
        const timeDiff = lastEntry.timestamp.getTime() - firstEntry.timestamp.getTime();

        if (timeDiff === 0) {
            return trends;
        }

        // Calculer la tendance pour chaque métrique
        for (const metricKey of Object.keys(firstEntry.metrics) as Array<keyof EvolutionMetrics>) {
            const valueDiff = lastEntry.metrics[metricKey] - firstEntry.metrics[metricKey];
            trends[metricKey] = valueDiff / (timeDiff / (24 * 60 * 60 * 1000)); // Tendance par jour
        }

        return trends;
    }

    /**
     * Réinitialise les métriques d'un étudiant
     * 
     * @method resetStudentMetrics
     * @param {string} studentId - ID de l'IA-élève
     * @param {string} [reason] - Raison de la réinitialisation
     * @returns {EvolutionMetrics} Nouvelles métriques initiales
     * @public
     */
    public resetStudentMetrics(studentId: string, reason?: string): EvolutionMetrics {
        const currentMetrics = this.studentMetrics.get(studentId);

        if (currentMetrics) {
            this.saveToHistory(studentId, currentMetrics, `Réinitialisation: ${reason || 'Non spécifiée'}`);
        }

        const initialMetrics = this.createInitialMetrics();
        this.studentMetrics.set(studentId, initialMetrics);

        this.logger.info('Métriques réinitialisées', { studentId, reason });

        return initialMetrics;
    }

    // ================== MÉTHODES PRIVÉES ==================

    /**
     * Crée des métriques initiales pour un nouvel étudiant
     * @private
     * @returns {EvolutionMetrics} Métriques initiales
     */
    private createInitialMetrics(): EvolutionMetrics {
        return {
            learningSpeed: 0.3,
            knowledgeRetention: 0.4,
            adaptability: 0.5,
            emotionalResilience: 0.4,
            intellectualCuriosity: 0.6,
            lsfCommunicationEfficiency: 0.2,
            globalConfidence: 0.3,
            culturalProgress: 0.1
        };
    }

    /**
     * Fusionne les métriques actuelles avec les mises à jour
     * @private
     * @param {EvolutionMetrics} current - Métriques actuelles
     * @param {Record<string, number>} updates - Mises à jour à appliquer
     * @returns {EvolutionMetrics} Métriques fusionnées
     */
    private mergeMetrics(
        current: EvolutionMetrics,
        updates: Record<string, number>
    ): EvolutionMetrics {
        // Créer une copie des métriques actuelles
        const resultObj: EvolutionMetrics = { ...current };

        // Créer un objet pour stocker les résultats temporaires
        const tempObj: Record<string, number> = {
            learningSpeed: resultObj.learningSpeed,
            knowledgeRetention: resultObj.knowledgeRetention,
            adaptability: resultObj.adaptability,
            emotionalResilience: resultObj.emotionalResilience,
            intellectualCuriosity: resultObj.intellectualCuriosity,
            lsfCommunicationEfficiency: resultObj.lsfCommunicationEfficiency,
            globalConfidence: resultObj.globalConfidence,
            culturalProgress: resultObj.culturalProgress
        };

        // Appliquer les mises à jour sur l'objet temporaire
        Object.entries(updates).forEach(([key, value]) => {
            if (key in tempObj && value !== undefined) {
                tempObj[key] = value;
            }
        });

        // Reconstruire l'objet de métriques à partir de l'objet temporaire
        const mergedMetrics: EvolutionMetrics = {
            learningSpeed: tempObj.learningSpeed,
            knowledgeRetention: tempObj.knowledgeRetention,
            adaptability: tempObj.adaptability,
            emotionalResilience: tempObj.emotionalResilience,
            intellectualCuriosity: tempObj.intellectualCuriosity,
            lsfCommunicationEfficiency: tempObj.lsfCommunicationEfficiency,
            globalConfidence: tempObj.globalConfidence,
            culturalProgress: tempObj.culturalProgress
        };

        return mergedMetrics;
    }

    /**
     * Valide que toutes les métriques sont dans les seuils acceptables
     * @private
     * @param {EvolutionMetrics} metricsToValidate - Métriques à valider
     * @returns {EvolutionMetrics} Métriques validées
     */
    private validateMetrics(metricsToValidate: EvolutionMetrics): EvolutionMetrics {
        // Créer un objet vide pour les métriques validées
        const resultObj: Record<string, number> = {};

        // Appliquer les limites pour chaque métrique
        for (const metricKey of Object.keys(this.validationThresholds) as Array<keyof EvolutionMetrics>) {
            const value = metricsToValidate[metricKey];
            const threshold = this.validationThresholds[metricKey];

            // Limiter la valeur entre min et max
            resultObj[metricKey] = Math.max(threshold.min, Math.min(threshold.max, value));
        }

        // Convertir en objet typé EvolutionMetrics de manière sûre
        const validatedMetrics: EvolutionMetrics = {
            learningSpeed: resultObj.learningSpeed,
            knowledgeRetention: resultObj.knowledgeRetention,
            adaptability: resultObj.adaptability,
            emotionalResilience: resultObj.emotionalResilience,
            intellectualCuriosity: resultObj.intellectualCuriosity,
            lsfCommunicationEfficiency: resultObj.lsfCommunicationEfficiency,
            globalConfidence: resultObj.globalConfidence,
            culturalProgress: resultObj.culturalProgress
        };

        return validatedMetrics;
    }

    /**
     * Sauvegarde les métriques dans l'historique
     * @private
     * @param {string} studentId - ID de l'IA-élève
     * @param {EvolutionMetrics} metrics - Métriques à sauvegarder
     * @param {string} context - Contexte de la sauvegarde
     */
    private saveToHistory(studentId: string, metrics: EvolutionMetrics, context: string): void {
        if (!this.metricsHistory.has(studentId)) {
            this.metricsHistory.set(studentId, []);
        }

        const history = this.metricsHistory.get(studentId)!;
        history.push({
            timestamp: new Date(),
            metrics: { ...metrics },
            context
        });

        // Limiter la taille de l'historique (garder 100 dernières entrées)
        if (history.length > 100) {
            this.metricsHistory.set(studentId, history.slice(-100));
        }
    }

    /**
     * Identifie les métriques qui ont changé
     * @private
     * @param {EvolutionMetrics} oldMetrics - Anciennes métriques
     * @param {EvolutionMetrics} newMetrics - Nouvelles métriques
     * @returns {string[]} Liste des noms de métriques qui ont changé
     */
    private getChangedMetrics(oldMetrics: EvolutionMetrics, newMetrics: EvolutionMetrics): string[] {
        const changed: string[] = [];
        const threshold = 0.001; // Seuil de détection de changement

        for (const metricKey of Object.keys(oldMetrics) as Array<keyof EvolutionMetrics>) {
            if (Math.abs(oldMetrics[metricKey] - newMetrics[metricKey]) > threshold) {
                changed.push(metricKey);
            }
        }

        return changed;
    }

    /**
     * Calcule les effets secondaires d'un événement selon la personnalité
     * @private
     * @param {EvolutionEvent} event - Événement à analyser
     * @param {AIPersonalityProfile | undefined} personality - Profil de personnalité
     * @returns {Record<string, number>} Effets secondaires calculés
     */
    private calculateSecondaryEffects(
        event: EvolutionEvent,
        personality?: AIPersonalityProfile
    ): Record<string, number> {
        // Créer un objet vide pour stocker les effets
        const effectsObj: Record<string, number> = {};

        if (!personality) {
            return effectsObj;
        }

        const baseImpact = event.impact * 0.1; // Effets secondaires plus faibles

        // Effets basés sur le style d'apprentissage
        if (personality.learningStyle === 'visual' && event.eventType === 'skill_mastery') {
            effectsObj['adaptability'] = baseImpact;
        }

        if (personality.learningStyle === 'social' && event.eventType === 'confidence_boost') {
            effectsObj['emotionalResilience'] = baseImpact;
        }

        // Effets basés sur les tendances émotionnelles
        if (personality.emotionalTendencies.includes('optimiste') && event.eventType === 'breakthrough') {
            effectsObj['intellectualCuriosity'] = baseImpact;
        }

        if (personality.emotionalTendencies.includes('persévérant') && event.eventType === 'resilience_build') {
            effectsObj['globalConfidence'] = baseImpact;
        }

        return effectsObj;
    }

    /**
     * Calcule les mises à jour graduelles basées sur les facteurs
     * @private
     * @param {EvolutionMetrics} currentMetrics - Métriques actuelles
     * @param {EvolutionFactors} factors - Facteurs d'évolution
     * @param {number} evolutionRate - Taux d'évolution
     * @returns {Record<string, number>} Mises à jour calculées
     */
    private calculateGradualUpdates(
        currentMetrics: EvolutionMetrics,
        factors: EvolutionFactors,
        evolutionRate: number
    ): Record<string, number> {
        // Créer un objet vide pour stocker les mises à jour
        const updatesObj: Record<string, number> = {};

        // Amélioration basée sur le temps d'apprentissage
        if (factors.totalLearningTime > 0) {
            const timeBonus = Math.min(evolutionRate, factors.totalLearningTime / 10000);
            updatesObj['knowledgeRetention'] = timeBonus;
        }

        // Amélioration basée sur les expériences positives
        const positiveExperiences = factors.recentExperiences.filter(exp => exp.successRate > 0.6);
        if (positiveExperiences.length > 0) {
            const experienceBonus = Math.min(evolutionRate, positiveExperiences.length * 0.005);
            updatesObj['globalConfidence'] = experienceBonus;
        }

        // Amélioration basée sur les interactions sociales
        if (factors.socialInteractions.length > 0) {
            const socialBonus = Math.min(evolutionRate, factors.socialInteractions.length * 0.003);
            updatesObj['emotionalResilience'] = socialBonus;
        }

        return updatesObj;
    }

    /**
     * Crée un objet de tendances vide
     * @private
     * @returns {Record<keyof EvolutionMetrics, number>} Tendances vides initialisées à 0
     */
    private createEmptyTrends(): Record<keyof EvolutionMetrics, number> {
        // Créer un objet avec la structure complète d'EvolutionMetrics, toutes les valeurs à 0
        return {
            learningSpeed: 0,
            knowledgeRetention: 0,
            adaptability: 0,
            emotionalResilience: 0,
            intellectualCuriosity: 0,
            lsfCommunicationEfficiency: 0,
            globalConfidence: 0,
            culturalProgress: 0
        };
    }
}