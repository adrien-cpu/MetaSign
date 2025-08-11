// src/ai/systems/expressions/situations/educational/special_needs/adaptations/SituationalAnalyzer.ts
import {
    SituationalAnalysisResult,
    SituationType
} from './types';
import { ISituationalAnalyzer } from './interfaces/IAdaptationDependencies';

// Définir le type DetectedPattern qui manque dans l'import
interface DetectedPattern {
    id: string;
    name: string;
    description: string;
    confidence: number;
    type: string;
    indicators: string[];
    significance: number;
}

/**
 * Interface pour l'analyseur de contexte
 */
interface IContextAnalyzer {
    analyzeContext(data: Record<string, unknown>): Promise<Record<string, unknown>>;
}

/**
 * Analyseur de situation pour détecter des modèles dans les données d'apprentissage
 * et recommander des adaptations appropriées
 */
export class SituationalAnalyzer implements ISituationalAnalyzer {
    private contextAnalyzer: IContextAnalyzer;

    /**
     * Initialise un nouvel analyseur situationnel
     * @param contextAnalyzer Analyseur de contexte à utiliser
     */
    constructor(contextAnalyzer: IContextAnalyzer) {
        this.contextAnalyzer = contextAnalyzer;
    }

    /**
  * Analyse un pattern dans les données fournies
  * @param data Données à analyser
  * @returns Résultat de l'analyse situationnelle
  */
    async analyzePattern(data: Record<string, unknown>): Promise<SituationalAnalysisResult> {
        // Analyser le contexte
        const contextAnalysis = await this.contextAnalyzer.analyzeContext(data);

        // Extraire les modèles détectés
        const detectedPatterns = this.detectPatternsInternal(data, contextAnalysis);

        // Calculer un niveau de confiance
        const confidence = this.calculateConfidence(detectedPatterns, contextAnalysis);

        // Créer un ID unique pour cette analyse
        const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        // Déterminer le type de situation - mapper les patterns aux types de situations standards
        let situationType = SituationType.INDIVIDUAL; // Valeur par défaut

        // Mapper le pattern au type de situation approprié selon le contexte
        if (detectedPatterns.some((p: DetectedPattern) => p.type === 'FATIGUE')) {
            // Fatigue suggère que c'est une pratique individuelle
            situationType = SituationType.PRACTICE;
        } else if (detectedPatterns.some((p: DetectedPattern) => p.type === 'LEARNING_DIFFICULTY')) {
            // Difficulté d'apprentissage pourrait indiquer une évaluation
            situationType = SituationType.ASSESSMENT;
        } else if (detectedPatterns.some((p: DetectedPattern) => p.type === 'HIGH_ENGAGEMENT')) {
            // Engagement élevé peut être lié à un travail de groupe
            situationType = SituationType.GROUP;
        }

        // Extraire les opportunités d'apprentissage et défis potentiels
        const learningOpportunities = this.extractLearningOpportunities(detectedPatterns);
        const potentialChallenges = this.extractPotentialChallenges(detectedPatterns);

        // Déterminer la priorité (calculée sur une échelle de 1 à 10)
        const priority = Math.round(confidence * 10);

        // Construction du résultat conformément à l'interface SituationalAnalysisResult
        return {
            id: analysisId,
            timestamp: Date.now(),
            situationType,
            priority,
            environmentalFactors: this.extractEnvironmentalFactors(contextAnalysis),
            learningOpportunities,
            potentialChallenges
        };
    }

    /**
     * Analyse une situation spécifique pour identifier les adaptations nécessaires
     * Implémente l'interface ISituationalAnalyzer
     * @param situation Données de la situation à analyser
     * @returns Résultats d'analyse situationnels
     */
    async analyzeSituation(situation: Record<string, unknown>): Promise<SituationalAnalysisResult> {
        // Utiliser directement analyzePattern qui renvoie déjà le bon type
        return await this.analyzePattern(situation);
    }

    /**
     * Extrait les facteurs environnementaux du contexte
     */
    private extractEnvironmentalFactors(contextAnalysis: Record<string, unknown>): Record<string, unknown> {
        const environmental = this.getNestedObject(contextAnalysis, 'environmental') as Record<string, unknown>;
        return environmental || {};
    }

    /**
     * Extrait les opportunités d'apprentissage basées sur les patterns détectés
     */
    private extractLearningOpportunities(patterns: DetectedPattern[]): string[] {
        const opportunities: string[] = [];

        for (const pattern of patterns) {
            if (pattern.type === 'HIGH_ENGAGEMENT') {
                opportunities.push('Opportunité pour contenu avancé');
                opportunities.push('Possibilité de collaboration en peer-learning');
            }
            if (pattern.type === 'LEARNING_DIFFICULTY') {
                opportunities.push('Occasion pour renforcement ciblé');
                opportunities.push('Moment propice pour approche multi-sensorielle');
            }
        }

        return opportunities;
    }

    /**
     * Extrait les défis potentiels basés sur les patterns détectés
     */
    private extractPotentialChallenges(patterns: DetectedPattern[]): string[] {
        const challenges: string[] = [];

        for (const pattern of patterns) {
            if (pattern.type === 'FATIGUE') {
                challenges.push('Risque de désengagement');
                challenges.push('Réduction de la capacité d\'attention');
            }
            if (pattern.type === 'LEARNING_DIFFICULTY') {
                challenges.push('Frustration potentielle');
                challenges.push('Besoin d\'encadrement supplémentaire');
            }
        }

        return challenges;
    }

    /**
     * Détecte des modèles dans les données (implémentation interne)
     * @param data Données brutes
     * @param contextAnalysis Analyse contextuelle
     * @returns Modèles détectés
     */
    private detectPatternsInternal(
        data: Record<string, unknown>,
        contextAnalysis: Record<string, unknown>
    ): DetectedPattern[] {
        const patterns: DetectedPattern[] = [];

        // Détecter le modèle de fatigue
        if (this.detectFatiguePattern(data, contextAnalysis)) {
            patterns.push({
                id: 'pattern-fatigue',
                name: 'Fatigue Pattern',
                description: 'Signes de fatigue ou de perte d\'attention',
                confidence: 0.8,
                type: 'FATIGUE',
                indicators: ['reduced_engagement', 'increased_errors', 'slower_response'],
                significance: 0.9
            });
        }

        // Détecter le modèle de difficulté d'apprentissage
        if (this.detectLearningDifficultyPattern(data, contextAnalysis)) {
            patterns.push({
                id: 'pattern-learning-difficulty',
                name: 'Learning Difficulty Pattern',
                description: 'Difficultés spécifiques dans le processus d\'apprentissage',
                confidence: 0.75,
                type: 'LEARNING_DIFFICULTY',
                indicators: ['repeated_errors', 'specific_challenge_areas', 'frustration_signs'],
                significance: 0.85
            });
        }

        // Détecter le modèle d'engagement élevé
        if (this.detectHighEngagementPattern(data, contextAnalysis)) {
            patterns.push({
                id: 'pattern-high-engagement',
                name: 'High Engagement Pattern',
                description: 'Niveau d\'engagement et de motivation élevé',
                confidence: 0.85,
                type: 'HIGH_ENGAGEMENT',
                indicators: ['rapid_progress', 'active_participation', 'positive_feedback'],
                significance: 0.8
            });
        }

        return patterns;
    }

    /**
     * Détecte un modèle de fatigue
     * @param data Données brutes
     * @param contextAnalysis Analyse contextuelle
     * @returns Vrai si le modèle est détecté
     */
    private detectFatiguePattern(
        data: Record<string, unknown>,
        contextAnalysis: Record<string, unknown>
    ): boolean {
        // Extraction des métriques relatives à la fatigue
        const fatigue = this.extractMetric(data, 'fatigue', 0);
        const attention = this.extractMetric(data, 'attention', 1);
        const engagement = this.extractMetric(data, 'engagement', 1);

        // Extraction des durées
        const duration = this.extractMetric(data, 'duration', 0);

        // Si des métriques de fatigue explicites sont disponibles
        if (fatigue > 0.5) {
            return true;
        }

        // Si l'attention ou l'engagement est faible
        if (attention < 0.4 || engagement < 0.4) {
            return true;
        }

        // Si la session dure depuis longtemps
        if (duration > 45) { // par exemple, plus de 45 minutes
            return true;
        }

        // Vérifier les valeurs dans l'analyse de contexte
        const learner = this.getNestedObject(contextAnalysis, 'learner') as Record<string, unknown> | undefined;
        if (learner) {
            const attentionNeeds = String(learner['attention_needs'] || learner['attention'] || '').toLowerCase();
            if (attentionNeeds.includes('low') || attentionNeeds.includes('reduc')) {
                return true;
            }
        }

        return false;
    }

    /**
     * Détecte un modèle de difficulté d'apprentissage
     * @param data Données brutes
     * @param contextAnalysis Analyse contextuelle
     * @returns Vrai si le modèle est détecté
     */
    private detectLearningDifficultyPattern(
        data: Record<string, unknown>,
        contextAnalysis: Record<string, unknown>
    ): boolean {
        // Extraction des métriques relatives à l'apprentissage
        const errors = this.extractMetric(data, 'error_rate', 0);
        const frustration = this.extractMetric(data, 'frustration', 0);
        const progress = this.extractMetric(data, 'progress', 1);

        // Si le taux d'erreur est élevé
        if (errors > 0.3) {
            return true;
        }

        // Si la frustration est élevée
        if (frustration > 0.4) {
            return true;
        }

        // Si le progrès est faible
        if (progress < 0.3) {
            return true;
        }

        // Vérifier l'historique de progression
        const progressionHistory = this.getNestedArray(data, 'progressionHistory');
        if (progressionHistory && progressionHistory.length > 1) {
            // Vérifier si les performances ont diminué ou stagnent
            let decreasing = true;
            for (let i = 1; i < progressionHistory.length; i++) {
                const curr = this.extractMetric(progressionHistory[i], 'performance', 0);
                const prev = this.extractMetric(progressionHistory[i - 1], 'performance', 0);
                if (curr > prev) {
                    decreasing = false;
                    break;
                }
            }
            if (decreasing) {
                return true;
            }
        }

        // Vérifier les valeurs dans l'analyse de contexte
        const learner = this.getNestedObject(contextAnalysis, 'learner') as Record<string, unknown> | undefined;
        if (learner) {
            const cognitiveNeeds = String(learner['cognitive_needs'] || learner['cognitive'] || '').toLowerCase();
            if (cognitiveNeeds.includes('support') || cognitiveNeeds.includes('difficulty')) {
                return true;
            }
        }

        return false;
    }

    /**
     * Détecte un modèle d'engagement élevé
     * @param data Données brutes
     * @param contextAnalysis Analyse contextuelle
     * @returns Vrai si le modèle est détecté
     */
    private detectHighEngagementPattern(
        data: Record<string, unknown>,
        contextAnalysis: Record<string, unknown>
    ): boolean {
        // Extraction des métriques relatives à l'engagement
        const engagement = this.extractMetric(data, 'engagement', 0);
        const attention = this.extractMetric(data, 'attention', 0);
        const progress = this.extractMetric(data, 'progress', 0);

        // Si l'engagement est élevé
        if (engagement > 0.7) {
            return true;
        }

        // Si l'attention est élevée
        if (attention > 0.7) {
            return true;
        }

        // Si le progrès est rapide
        if (progress > 0.7) {
            return true;
        }

        // Vérifier l'historique de progression
        const progressionHistory = this.getNestedArray(data, 'progressionHistory');
        if (progressionHistory && progressionHistory.length > 1) {
            // Vérifier si les performances s'améliorent constamment
            let improving = true;
            for (let i = 1; i < progressionHistory.length; i++) {
                const curr = this.extractMetric(progressionHistory[i], 'performance', 0);
                const prev = this.extractMetric(progressionHistory[i - 1], 'performance', 0);
                if (curr <= prev) {
                    improving = false;
                    break;
                }
            }
            if (improving) {
                return true;
            }
        }

        // Vérifier les valeurs dans l'analyse de contexte
        const learner = this.getNestedObject(contextAnalysis, 'learner') as Record<string, unknown> | undefined;
        if (learner) {
            const attentionState = String(learner['attention'] || '').toLowerCase();
            if (attentionState.includes('focus') || attentionState.includes('high')) {
                return true;
            }
        }

        return false;
    }

    /**
     * Recommande des adaptations basées sur les modèles détectés
     * @param patterns Modèles détectés
     * @param contextAnalysis Analyse contextuelle
     * @returns Adaptations recommandées
     */
    private recommendAdaptations(
        patterns: DetectedPattern[],
        contextAnalysis: Record<string, unknown>
    ): string[] {
        const adaptations: string[] = [];

        // Pour chaque modèle, recommander des adaptations spécifiques
        for (const pattern of patterns) {
            switch (pattern.type) {
                case 'FATIGUE':
                    adaptations.push('SHORTER_SESSION');
                    adaptations.push('BREAKS_INTRODUCTION');
                    adaptations.push('ACTIVITY_VARIATION');
                    break;

                case 'LEARNING_DIFFICULTY':
                    adaptations.push('SIMPLIFIED_CONTENT');
                    adaptations.push('ADDITIONAL_EXAMPLES');
                    adaptations.push('STEP_BY_STEP_APPROACH');
                    break;

                case 'HIGH_ENGAGEMENT':
                    adaptations.push('ADVANCED_CONTENT');
                    adaptations.push('CHALLENGE_INCREASE');
                    adaptations.push('CREATIVE_TASKS');
                    break;
            }
        }

        // Ajouter des adaptations basées sur l'analyse contextuelle
        this.addContextualAdaptations(adaptations, contextAnalysis);

        // Supprimer les adaptations en double
        return [...new Set(adaptations)];
    }

    /**
     * Ajoute des adaptations basées sur l'analyse contextuelle
     * @param adaptations Liste d'adaptations à compléter
     * @param contextAnalysis Analyse contextuelle
     */
    private addContextualAdaptations(
        adaptations: string[],
        contextAnalysis: Record<string, unknown>
    ): void {
        // Extraire les informations sur l'environnement
        const environmental = this.getNestedObject(contextAnalysis, 'environmental') as Record<string, unknown> | undefined;
        if (environmental) {
            // Adaptations basées sur l'éclairage
            const lighting = String(environmental['lighting'] || '').toLowerCase();
            if (lighting.includes('low') || lighting.includes('dark')) {
                adaptations.push('INCREASE_CONTRAST');
            }

            // Adaptations basées sur le bruit
            const noise = String(environmental['noise'] || '').toLowerCase();
            if (noise.includes('high') || noise.includes('loud')) {
                adaptations.push('VISUAL_REINFORCEMENT');
            }
        }

        // Extraire les informations sur l'apprenant
        const learner = this.getNestedObject(contextAnalysis, 'learner') as Record<string, unknown> | undefined;
        if (learner) {
            // Adaptations basées sur les besoins visuels
            const visual = String(learner['visual'] || learner['visual_needs'] || '').toLowerCase();
            if (visual.includes('impair') || visual.includes('reduc')) {
                adaptations.push('LARGER_TEXT');
                adaptations.push('HIGH_CONTRAST_MODE');
            }

            // Adaptations basées sur les besoins cognitifs
            const cognitive = String(learner['cognitive'] || learner['cognitive_needs'] || '').toLowerCase();
            if (cognitive.includes('support') || cognitive.includes('difficulty')) {
                adaptations.push('SIMPLIFIED_LANGUAGE');
                adaptations.push('FREQUENT_RECAPS');
            }
        }
    }

    /**
     * Calcule un niveau de confiance pour l'analyse
     * @param patterns Modèles détectés
     * @param contextAnalysis Analyse contextuelle
     * @returns Niveau de confiance (0-1)
     */
    private calculateConfidence(
        patterns: DetectedPattern[],
        contextAnalysis: Record<string, unknown>
    ): number {
        if (patterns.length === 0) {
            return 0.5; // Confiance moyenne si aucun modèle n'est détecté
        }

        // Calculer la moyenne des niveaux de confiance des modèles
        const patternConfidence = patterns.reduce((sum, pattern) => sum + pattern.confidence, 0) / patterns.length;

        // Facteur de qualité contextuelle (qualité des données disponibles)
        const contextQuality = this.calculateContextQuality(contextAnalysis);

        // Combiner les deux facteurs (60% modèles, 40% qualité du contexte)
        return patternConfidence * 0.6 + contextQuality * 0.4;
    }

    /**
     * Calcule la qualité des données contextuelles disponibles
     * @param contextAnalysis Analyse contextuelle
     * @returns Facteur de qualité (0-1)
     */
    private calculateContextQuality(contextAnalysis: Record<string, unknown>): number {
        let quality = 0.5; // Qualité moyenne par défaut

        // Vérifier la présence et la qualité des données environnementales
        const environmental = this.getNestedObject(contextAnalysis, 'environmental');
        if (environmental && typeof environmental === 'object') {
            // Augmenter la qualité pour chaque propriété significative présente
            const keys = Object.keys(environmental);
            quality += Math.min(keys.length * 0.05, 0.2); // Max +0.2 pour les données environnementales
        }

        // Vérifier la présence et la qualité des données sur l'apprenant
        const learner = this.getNestedObject(contextAnalysis, 'learner');
        if (learner && typeof learner === 'object') {
            // Augmenter la qualité pour chaque propriété significative présente
            const keys = Object.keys(learner);
            quality += Math.min(keys.length * 0.05, 0.3); // Max +0.3 pour les données sur l'apprenant
        }

        // Limiter la qualité à l'intervalle [0, 1]
        return Math.max(0, Math.min(1, quality));
    }

    /**
     * Extrait une métrique numérique d'un objet, avec une valeur par défaut
     * @param obj Objet source
     * @param key Clé de la métrique
     * @param defaultValue Valeur par défaut si non trouvée
     * @returns Valeur numérique de la métrique
     */
    private extractMetric(obj: unknown, key: string, defaultValue: number): number {
        if (!obj || typeof obj !== 'object') {
            return defaultValue;
        }

        const value = (obj as Record<string, unknown>)[key];
        if (typeof value === 'number') {
            return value;
        }

        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            if (!isNaN(parsed)) {
                return parsed;
            }
        }

        return defaultValue;
    }

    /**
     * Récupère un objet imbriqué de manière sécurisée
     * @param obj Objet parent
     * @param key Clé de l'objet imbriqué
     * @returns Objet imbriqué ou undefined
     */
    private getNestedObject(obj: unknown, key: string): unknown {
        if (!obj || typeof obj !== 'object') {
            return undefined;
        }

        return (obj as Record<string, unknown>)[key];
    }

    /**
     * Récupère un tableau imbriqué de manière sécurisée
     * @param obj Objet parent
     * @param key Clé du tableau imbriqué
     * @returns Tableau imbriqué ou undefined
     */
    private getNestedArray(obj: unknown, key: string): unknown[] | undefined {
        const value = this.getNestedObject(obj, key);
        if (Array.isArray(value)) {
            return value;
        }

        return undefined;
    }
}