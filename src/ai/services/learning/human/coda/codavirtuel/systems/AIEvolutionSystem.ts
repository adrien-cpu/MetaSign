/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/AIEvolutionSystem.ts
 * @description Système révolutionnaire d'évolution adaptatif pour IA-élèves avec apprentissage continu
 * 
 * Fonctionnalités révolutionnaires :
 * - 🧬 Évolution dynamique basée sur l'expérience d'apprentissage
 * - 🎯 Adaptation comportementale intelligente
 * - 📊 Métriques d'évolution multi-dimensionnelles
 * - 🔄 Rétroaction continue et auto-amélioration
 * - 🌱 Croissance cognitive et émotionnelle
 * - 🏆 Système de récompenses et motivations évolutives
 * 
 * @module AIEvolutionSystem
 * @version 3.0.0 - Révolution CODA (Refactorisé)
 * @since 2025
 * @author MetaSign Team - Evolutionary AI Division
 */

import { LoggerFactory } from '@/ai/utils/LoggerFactory';
import { EvolutionAlgorithmManager } from '@/ai/services/learning/human/coda/codavirtuel/algorithms/EvolutionAlgorithmManager';
import { EvolutionMetricsManager } from '@/ai/services/learning/human/coda/codavirtuel/metrics/EvolutionMetricsManager';
import { EvolutionPredictor } from '@/ai/services/learning/human/coda/codavirtuel/prediction/EvolutionPredictor';
import { EvolutionAnalyzer } from '@/ai/services/learning/human/coda/codavirtuel/analysis/EvolutionAnalyzer';

import type {
    EvolutionMetrics,
    EvolutionEvent,
    EvolutionFactors,
    EvolutionAnalysisResult,
    EvolutionPrediction,
    AIEvolutionSystemConfig,
    AIPersonalityProfile
} from '@/ai/services/learning/human/coda/codavirtuel/types/evolution.types';

/**
 * Système révolutionnaire d'évolution adaptatif pour IA-élèves
 * 
 * @class AIEvolutionSystem
 * @description Orchestrateur principal qui coordonne tous les composants spécialisés
 * du système d'évolution. Utilise une architecture modulaire pour une maintenance
 * et une extensibilité optimales.
 * 
 * @example
 * ```typescript
 * const evolutionSystem = new AIEvolutionSystem({
 *   evolutionSensitivity: 0.7,
 *   enableAutoOptimization: true,
 *   baseEvolutionRate: 0.1
 * });
 * 
 * // Analyser l'évolution
 * const analysis = await evolutionSystem.analyzeEvolution('student123', {
 *   recentExperiences: experiences,
 *   emotionalPatterns: patterns,
 *   memoryMetrics: metrics
 * });
 * 
 * // Appliquer l'évolution
 * const newMetrics = await evolutionSystem.evolveStudent('student123', factors);
 * ```
 */
export class AIEvolutionSystem {
    /**
     * Logger pour le système d'évolution
     * @private
     * @readonly
     */
    private readonly logger = LoggerFactory.getLogger('AIEvolutionSystem_v3_Refactored');

    /**
     * Configuration du système
     * @private
     * @readonly
     */
    private readonly config: AIEvolutionSystemConfig;

    /**
     * Gestionnaire des algorithmes d'évolution
     * @private
     * @readonly
     */
    private readonly algorithmManager: EvolutionAlgorithmManager;

    /**
     * Gestionnaire des métriques d'évolution
     * @private
     * @readonly
     */
    private readonly metricsManager: EvolutionMetricsManager;

    /**
     * Prédicteur d'évolution
     * @private
     * @readonly
     */
    private readonly predictor: EvolutionPredictor;

    /**
     * Analyseur d'évolution
     * @private
     * @readonly
     */
    private readonly analyzer: EvolutionAnalyzer;

    /**
     * Historique des événements d'évolution par IA-élève
     * @private
     */
    private readonly evolutionHistory: Map<string, EvolutionEvent[]> = new Map();

    /**
     * Cache des analyses récentes
     * @private
     */
    private readonly analysisCache: Map<string, { result: EvolutionAnalysisResult; timestamp: Date }> = new Map();

    /**
     * Durée de validité du cache d'analyse en millisecondes (15 minutes)
     * @private
     * @readonly
     */
    private readonly analysisCacheValidityMs = 15 * 60 * 1000;

    /**
     * Intervalle de traitement automatique en millisecondes (5 minutes)
     * @private
     * @readonly
     */
    private readonly autoProcessingIntervalMs = 5 * 60 * 1000;

    /**
     * Timer pour le traitement automatique
     * @private
     */
    private autoProcessingTimer?: NodeJS.Timeout;

    /**
     * Constructeur du système d'évolution
     * 
     * @constructor
     * @param {Partial<AIEvolutionSystemConfig>} [config] - Configuration optionnelle
     */
    constructor(config?: Partial<AIEvolutionSystemConfig>) {
        this.config = {
            evolutionSensitivity: 0.6,
            baseEvolutionRate: 0.05,
            evolutionThreshold: 0.1,
            changePersistence: 0.8,
            enableAutoOptimization: true,
            analysisDepth: 20,
            ...config
        };

        // Initialiser les composants spécialisés
        this.algorithmManager = new EvolutionAlgorithmManager();
        this.metricsManager = new EvolutionMetricsManager();
        this.predictor = new EvolutionPredictor();
        this.analyzer = new EvolutionAnalyzer();

        // Démarrer le traitement automatique si activé
        if (this.config.enableAutoOptimization) {
            this.startAutoProcessing();
        }

        this.logger.info('🧬 Système d\'évolution révolutionnaire initialisé (Version Refactorisée)', {
            config: this.config,
            componentsLoaded: ['AlgorithmManager', 'MetricsManager', 'Predictor', 'Analyzer']
        });
    }

    /**
     * Analyse l'évolution actuelle d'un étudiant
     * 
     * @method analyzeEvolution
     * @async
     * @param {string} studentId - ID de l'IA-élève
     * @param {EvolutionFactors} factors - Facteurs d'évolution
     * @returns {Promise<EvolutionAnalysisResult>} Résultat d'analyse
     * @public
     */
    public async analyzeEvolution(
        studentId: string,
        factors: EvolutionFactors
    ): Promise<EvolutionAnalysisResult> {
        try {
            this.logger.info('🔬 Début analyse évolution IA-élève', {
                studentId,
                experiencesCount: factors.recentExperiences.length,
                patternsCount: factors.emotionalPatterns.length
            });

            // Vérifier le cache d'analyse
            const cachedAnalysis = this.getCachedAnalysis(studentId);
            if (cachedAnalysis) {
                this.logger.debug('Utilisation cache analyse', { studentId });
                return cachedAnalysis;
            }

            // Obtenir les métriques actuelles
            const currentMetrics = this.metricsManager.getStudentMetrics(studentId) ||
                this.metricsManager.updateStudentMetrics(studentId, {}, 'Initialisation');

            // Obtenir l'historique d'évolution
            const history = this.getEvolutionHistory(studentId);

            // Générer des prédictions
            const predictions = await this.predictor.predictEvolution(
                studentId,
                currentMetrics,
                history,
                { timeHorizon: 24, confidenceThreshold: 0.6 }
            );

            // Effectuer l'analyse complète
            const analysisResult = await this.analyzer.analyzeEvolution(
                studentId,
                currentMetrics,
                history,
                factors,
                predictions
            );

            // Mettre en cache le résultat
            this.cacheAnalysisResult(studentId, analysisResult);

            this.logger.info('✨ Analyse évolution terminée', {
                studentId,
                overallScore: analysisResult.overallEvolutionScore.toFixed(3),
                predictionsCount: predictions.length,
                recommendationsCount: analysisResult.improvementRecommendations.length
            });

            return analysisResult;
        } catch (error) {
            this.logger.error('❌ Erreur analyse évolution', { studentId, error });
            throw error;
        }
    }

    /**
     * Fait évoluer un étudiant basé sur les facteurs fournis
     * 
     * @method evolveStudent
     * @async
     * @param {string} studentId - ID de l'IA-élève
     * @param {EvolutionFactors} factors - Facteurs d'évolution
     * @returns {Promise<EvolutionMetrics>} Nouvelles métriques d'évolution
     * @public
     */
    public async evolveStudent(
        studentId: string,
        factors: EvolutionFactors
    ): Promise<EvolutionMetrics> {
        try {
            this.logger.info('🚀 Évolution IA-élève déclenchée', { studentId });

            // Obtenir les métriques actuelles
            const currentMetrics = this.metricsManager.getStudentMetrics(studentId) ||
                this.metricsManager.updateStudentMetrics(studentId, {}, 'Initialisation évolution');

            // Détecter les événements d'évolution potentiels
            const potentialEvents = this.algorithmManager.detectEvolutionEvents(currentMetrics, factors);

            // Filtrer selon les seuils de configuration
            const significantEvents = potentialEvents.filter(
                event => event.impact >= this.config.evolutionThreshold
            );

            this.logger.debug('Événements d\'évolution détectés', {
                studentId,
                potentialEvents: potentialEvents.length,
                significantEvents: significantEvents.length
            });

            let updatedMetrics = currentMetrics;

            // Appliquer chaque événement d'évolution significatif
            for (const event of significantEvents) {
                updatedMetrics = this.metricsManager.applyEvolutionEvent(studentId, event);
                this.recordEvolutionEvent(studentId, event);
            }

            // Appliquer l'évolution graduelle
            updatedMetrics = this.metricsManager.applyGradualEvolution(
                studentId,
                factors,
                this.config.baseEvolutionRate
            );

            // Invalider le cache d'analyse pour ce student
            this.invalidateAnalysisCache(studentId);

            this.logger.info('🎯 Évolution appliquée avec succès', {
                studentId,
                eventsApplied: significantEvents.length,
                finalScore: this.calculateQuickScore(updatedMetrics)
            });

            return updatedMetrics;
        } catch (error) {
            this.logger.error('❌ Erreur évolution étudiant', { studentId, error });
            throw error;
        }
    }

    /**
     * Obtient les métriques d'évolution actuelles
     * 
     * @method getEvolutionMetrics
     * @param {string} studentId - ID de l'IA-élève
     * @returns {EvolutionMetrics | undefined} Métriques d'évolution
     * @public
     */
    public getEvolutionMetrics(studentId: string): EvolutionMetrics | undefined {
        return this.metricsManager.getStudentMetrics(studentId);
    }

    /**
     * Obtient l'historique d'évolution
     * 
     * @method getEvolutionHistory
     * @param {string} studentId - ID de l'IA-élève
     * @returns {readonly EvolutionEvent[]} Historique d'évolution
     * @public
     */
    public getEvolutionHistory(studentId: string): readonly EvolutionEvent[] {
        return this.evolutionHistory.get(studentId) || [];
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
        this.metricsManager.registerPersonalityProfile(studentId, profile);
        this.logger.debug('📋 Profil personnalité enregistré', { studentId });
    }

    /**
     * Prédit l'évolution future basée sur les tendances actuelles
     * 
     * @method predictFutureEvolution
     * @async
     * @param {string} studentId - ID de l'IA-élève
     * @param {number} timeHorizon - Horizon temporel (en heures)
     * @returns {Promise<readonly EvolutionPrediction[]>} Prédictions d'évolution
     * @public
     */
    public async predictFutureEvolution(
        studentId: string,
        timeHorizon: number
    ): Promise<readonly EvolutionPrediction[]> {
        try {
            const currentMetrics = this.metricsManager.getStudentMetrics(studentId);
            const history = this.getEvolutionHistory(studentId);

            if (!currentMetrics || history.length < 3) {
                this.logger.warn('Données insuffisantes pour prédictions', {
                    studentId,
                    hasMetrics: !!currentMetrics,
                    historyLength: history.length
                });
                return [];
            }

            return await this.predictor.predictEvolution(
                studentId,
                currentMetrics,
                history,
                { timeHorizon, confidenceThreshold: 0.5 }
            );
        } catch (error) {
            this.logger.error('❌ Erreur prédiction évolution', { studentId, error });
            return [];
        }
    }

    /**
     * Réinitialise complètement l'évolution d'un étudiant
     * 
     * @method resetStudentEvolution
     * @param {string} studentId - ID de l'IA-élève
     * @param {string} [reason] - Raison de la réinitialisation
     * @returns {EvolutionMetrics} Nouvelles métriques initiales
     * @public
     */
    public resetStudentEvolution(studentId: string, reason?: string): EvolutionMetrics {
        this.logger.info('🔄 Réinitialisation évolution étudiant', { studentId, reason });

        // Réinitialiser les métriques
        const newMetrics = this.metricsManager.resetStudentMetrics(studentId, reason);

        // Archiver l'historique existant
        const currentHistory = this.evolutionHistory.get(studentId);
        if (currentHistory && currentHistory.length > 0) {
            this.logger.debug('Archivage historique existant', {
                studentId,
                eventsArchived: currentHistory.length
            });
        }

        // Réinitialiser l'historique
        this.evolutionHistory.set(studentId, []);

        // Invalider le cache
        this.invalidateAnalysisCache(studentId);

        return newMetrics;
    }

    /**
     * Obtient les statistiques globales du système
     * 
     * @method getSystemStatistics
     * @returns {Record<string, unknown>} Statistiques du système
     * @public
     */
    public getSystemStatistics(): Record<string, unknown> {
        const totalStudents = this.evolutionHistory.size;
        const totalEvents = Array.from(this.evolutionHistory.values())
            .reduce((sum, events) => sum + events.length, 0);

        const cacheHitRate = this.analysisCache.size > 0 ?
            (this.analysisCache.size / Math.max(totalStudents, 1)) : 0;

        return {
            totalStudents,
            totalEvents,
            cacheHitRate: cacheHitRate.toFixed(2),
            autoProcessingEnabled: this.config.enableAutoOptimization,
            componentStatus: {
                algorithmManager: 'active',
                metricsManager: 'active',
                predictor: 'active',
                analyzer: 'active'
            }
        };
    }

    /**
     * Arrête le système et nettoie les ressources
     * 
     * @method shutdown
     * @returns {void}
     * @public
     */
    public shutdown(): void {
        this.logger.info('🛑 Arrêt du système d\'évolution');

        // Arrêter le traitement automatique
        if (this.autoProcessingTimer) {
            clearInterval(this.autoProcessingTimer);
            this.autoProcessingTimer = undefined;
        }

        // Nettoyer les caches
        this.analysisCache.clear();

        this.logger.info('✅ Système d\'évolution arrêté proprement');
    }

    // ================== MÉTHODES PRIVÉES ==================

    /**
     * Démarre le traitement automatique d'évolution
     * @private
     */
    private startAutoProcessing(): void {
        this.autoProcessingTimer = setInterval(() => {
            this.processAutoEvolution();
        }, this.autoProcessingIntervalMs);

        this.logger.info('⚙️ Traitement automatique d\'évolution démarré', {
            intervalMinutes: this.autoProcessingIntervalMs / (60 * 1000)
        });
    }

    /**
     * Traite l'évolution automatique pour tous les étudiants
     * @private
     */
    private processAutoEvolution(): void {
        try {
            const studentIds = Array.from(this.evolutionHistory.keys());

            this.logger.debug('🔄 Début traitement automatique évolution', {
                studentsCount: studentIds.length
            });

            for (const studentId of studentIds) {
                this.processStudentAutoEvolution(studentId);
            }

            // Nettoyer les caches obsolètes
            this.cleanupExpiredCaches();

        } catch (error) {
            this.logger.error('❌ Erreur traitement automatique', { error });
        }
    }

    /**
     * Traite l'évolution automatique pour un étudiant spécifique
     * @private
     */
    private processStudentAutoEvolution(studentId: string): void {
        try {
            const currentMetrics = this.metricsManager.getStudentMetrics(studentId);
            if (!currentMetrics) {
                return;
            }

            // Appliquer une micro-évolution basée sur le temps
            const microEvolutionFactors = this.createMicroEvolutionFactors(studentId);

            if (microEvolutionFactors) {
                this.metricsManager.applyGradualEvolution(
                    studentId,
                    microEvolutionFactors,
                    this.config.baseEvolutionRate * 0.1 // Micro-évolution plus faible
                );
            }

        } catch (error) {
            this.logger.error('❌ Erreur évolution automatique étudiant', { studentId, error });
        }
    }

    /**
     * Crée des facteurs de micro-évolution pour le traitement automatique
     * @private
     */
    private createMicroEvolutionFactors(studentId: string): EvolutionFactors | null {
        const history = this.getEvolutionHistory(studentId);

        if (history.length === 0) {
            return null;
        }

        // Simuler des facteurs minimaux pour la micro-évolution
        return {
            recentExperiences: [],
            emotionalPatterns: [],
            memoryMetrics: {
                strongestConcepts: [],
                weakestConcepts: [],
                retentionRate: 0.5,
                comprehensionSpeed: 0.5
            },
            socialInteractions: [],
            feedbackHistory: [],
            totalLearningTime: 100 // Temps minimal simulé
        };
    }

    /**
     * Enregistre un événement d'évolution dans l'historique
     * @private
     */
    private recordEvolutionEvent(studentId: string, event: EvolutionEvent): void {
        if (!this.evolutionHistory.has(studentId)) {
            this.evolutionHistory.set(studentId, []);
        }

        const history = this.evolutionHistory.get(studentId)!;
        history.push(event);

        // Limiter la taille de l'historique selon la configuration
        if (history.length > this.config.analysisDepth * 3) {
            this.evolutionHistory.set(studentId, history.slice(-this.config.analysisDepth * 2));
        }

        this.logger.debug('Événement évolution enregistré', {
            studentId,
            eventType: event.eventType,
            impact: event.impact,
            historySize: history.length
        });
    }

    /**
     * Obtient une analyse en cache si elle est valide
     * @private
     */
    private getCachedAnalysis(studentId: string): EvolutionAnalysisResult | null {
        const cached = this.analysisCache.get(studentId);

        if (!cached) {
            return null;
        }

        const isExpired = Date.now() - cached.timestamp.getTime() > this.analysisCacheValidityMs;

        if (isExpired) {
            this.analysisCache.delete(studentId);
            return null;
        }

        return cached.result;
    }

    /**
     * Met en cache un résultat d'analyse
     * @private
     */
    private cacheAnalysisResult(studentId: string, result: EvolutionAnalysisResult): void {
        this.analysisCache.set(studentId, {
            result,
            timestamp: new Date()
        });

        this.logger.debug('Résultat analyse mis en cache', { studentId });
    }

    /**
     * Invalide le cache d'analyse pour un étudiant
     * @private
     */
    private invalidateAnalysisCache(studentId: string): void {
        if (this.analysisCache.has(studentId)) {
            this.analysisCache.delete(studentId);
            this.logger.debug('Cache analyse invalidé', { studentId });
        }
    }

    /**
     * Nettoie les caches expirés
     * @private
     */
    private cleanupExpiredCaches(): void {
        const now = Date.now();
        const expiredStudents: string[] = [];

        this.analysisCache.forEach((cached, studentId) => {
            if (now - cached.timestamp.getTime() > this.analysisCacheValidityMs) {
                expiredStudents.push(studentId);
            }
        });

        expiredStudents.forEach(studentId => {
            this.analysisCache.delete(studentId);
        });

        if (expiredStudents.length > 0) {
            this.logger.debug('Caches expirés nettoyés', {
                cleanedCount: expiredStudents.length
            });
        }
    }

    /**
     * Calcule un score rapide pour les métriques
     * @private
     */
    private calculateQuickScore(metrics: EvolutionMetrics): number {
        const values = Object.values(metrics);
        const average = values.reduce((sum, val) => sum + val, 0) / values.length;
        return Math.round(average * 1000) / 1000; // Arrondir à 3 décimales
    }

    /**
     * Valide la configuration du système
     * @private
     */
    private validateConfig(): void {
        const { evolutionSensitivity, baseEvolutionRate, evolutionThreshold } = this.config;

        if (evolutionSensitivity < 0 || evolutionSensitivity > 1) {
            throw new Error('evolutionSensitivity doit être entre 0 et 1');
        }

        if (baseEvolutionRate < 0 || baseEvolutionRate > 1) {
            throw new Error('baseEvolutionRate doit être entre 0 et 1');
        }

        if (evolutionThreshold < 0 || evolutionThreshold > 1) {
            throw new Error('evolutionThreshold doit être entre 0 et 1');
        }

        this.logger.debug('Configuration validée avec succès');
    }

    /**
     * Exporte l'état complet d'un étudiant pour sauvegarde
     * 
     * @method exportStudentState
     * @param {string} studentId - ID de l'IA-élève
     * @returns {Record<string, unknown> | null} État exporté ou null
     * @public
     */
    public exportStudentState(studentId: string): Record<string, unknown> | null {
        const metrics = this.metricsManager.getStudentMetrics(studentId);
        const history = this.getEvolutionHistory(studentId);
        const metricsHistory = this.metricsManager.getMetricsHistory(studentId);

        if (!metrics) {
            return null;
        }

        return {
            studentId,
            currentMetrics: metrics,
            evolutionHistory: history,
            metricsHistory,
            exportTimestamp: new Date().toISOString(),
            systemVersion: '3.0.0'
        };
    }

    /**
     * Importe l'état d'un étudiant depuis une sauvegarde
     * 
     * @method importStudentState
     * @param {Record<string, unknown>} state - État à importer
     * @returns {boolean} Succès de l'importation
     * @public
     */
    public importStudentState(state: Record<string, unknown>): boolean {
        try {
            const studentId = state.studentId as string;
            const currentMetrics = state.currentMetrics as EvolutionMetrics;
            const evolutionHistory = state.evolutionHistory as EvolutionEvent[];

            if (!studentId || !currentMetrics) {
                this.logger.error('État invalide pour importation', { state });
                return false;
            }

            // Restaurer les métriques
            this.metricsManager.updateStudentMetrics(studentId, currentMetrics, 'Importation état');

            // Restaurer l'historique
            this.evolutionHistory.set(studentId, evolutionHistory || []);

            this.logger.info('État étudiant importé avec succès', {
                studentId,
                historyEvents: evolutionHistory?.length || 0
            });

            return true;
        } catch (error) {
            this.logger.error('❌ Erreur importation état étudiant', { error });
            return false;
        }
    }

    /**
     * Génère un rapport de santé du système
     * 
     * @method generateHealthReport
     * @returns {Record<string, unknown>} Rapport de santé
     * @public
     */
    public generateHealthReport(): Record<string, unknown> {
        const stats = this.getSystemStatistics();
        const memoryUsage = process.memoryUsage();

        return {
            timestamp: new Date().toISOString(),
            systemStatus: 'healthy',
            statistics: stats,
            memoryUsage: {
                heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
                heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB'
            },
            configuration: this.config,
            componentHealth: {
                algorithmManager: 'operational',
                metricsManager: 'operational',
                predictor: 'operational',
                analyzer: 'operational',
                autoProcessing: this.autoProcessingTimer ? 'active' : 'inactive'
            }
        };
    }
}