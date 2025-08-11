/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/RhythmTransformer.ts
 * @description Transformateur révolutionnaire pour les erreurs de rythme et temporalité en LSF
 * @author MetaSign
 * @version 1.3.0
 * @since 2024
 * 
 * Ce module gère les transformations de la temporalité dans les simulations LSF,
 * en appliquant des erreurs sophistiquées de rythme, cadence, fluidité et timing.
 * Il hérite de BaseErrorTransformer pour créer des perturbations temporelles réalistes
 * basées sur les caractéristiques rythmiques de la langue des signes.
 * 
 * La temporalité en LSF est cruciale car elle porte du sens linguistique :
 * - Le rythme distingue les types de signes
 * - La vitesse indique l'intensité émotionnelle
 * - Les pauses marquent la structure syntaxique
 * - La fluidité reflète la maîtrise linguistique
 * 
 * @module RhythmTransformer
 * @requires BaseErrorTransformer
 * @requires RhythmAnalysisService
 * @requires RhythmPatternService
 * @requires ErrorTypes
 * @requires LSFContentTypes
 */

import { BaseErrorTransformer } from './BaseErrorTransformer';
import { RhythmAnalysisService } from '../services/RhythmAnalysisService';
import { RhythmPatternService } from '../services/RhythmPatternService';
import {
    ErrorCategoryType,
    ErrorTransformationType
} from '../types/ErrorTypes';
import type {
    ErrorCatalogEntry,
    ErrorTransformation
} from '../types/ErrorTypes';
import type {
    LSFParameters,
    LSFTimingParameter
} from '../types/LSFContentTypes';

/**
 * Configuration des transformations rythmiques
 */
interface RhythmTransformationConfig {
    /** Facteur de réduction de précision par défaut */
    readonly defaultAccuracyReduction: number;
    /** Facteurs de réduction par type d'erreur */
    readonly accuracyReductionFactors: Record<string, number>;
}

/**
 * Transformateur révolutionnaire pour les erreurs de rythme et temporalité
 * Simule des erreurs sophistiquées de cadence, fluidité et synchronisation temporelle
 * 
 * @class RhythmTransformer
 * @extends BaseErrorTransformer
 */
export class RhythmTransformer extends BaseErrorTransformer {
    /** Configuration des transformations */
    private static readonly TRANSFORMATION_CONFIG: RhythmTransformationConfig = {
        defaultAccuracyReduction: 0.25,
        accuracyReductionFactors: {
            speed: 0.3,
            pause: 0.4,
            hesitation: 0.5,
            fluidity: 0.4,
            intensity: 0.3,
            desynchronization: 0.6,
            omission: 0.8
        }
    } as const;

    /**
     * Initialise le transformateur pour les erreurs de rythme
     * @param errorCategory - Catégorie d'erreur avec ses transformations possibles
     */
    constructor(errorCategory: ErrorCatalogEntry) {
        super(ErrorCategoryType.RHYTHM, errorCategory);
    }

    /**
     * Applique une transformation spécifique de rythme
     * @param content - Contenu LSF à modifier
     * @param transform - Transformation à appliquer
     * @protected
     * @override
     */
    protected applySpecificTransformation(content: Record<string, unknown>, transform: ErrorTransformation): void {
        const timing = this.getTargetParameter(content);
        if (!timing) {
            this.logger.warn('Aucun paramètre de timing trouvé dans le contenu');
            return;
        }

        // Applique la transformation selon son type
        switch (transform.type) {
            case ErrorTransformationType.ACCELERATION:
            case ErrorTransformationType.DECELERATION:
                if (transform.factor !== undefined) {
                    this.applySpeedTransformation(timing, transform);
                }
                break;

            case ErrorTransformationType.INAPPROPRIATE_PAUSE:
                this.applyPauseTransformation(timing, transform);
                break;

            case ErrorTransformationType.HESITATION:
                this.applyHesitationTransformation(timing, transform);
                break;

            case ErrorTransformationType.FLUIDITY:
                if (transform.factor !== undefined) {
                    this.applyFluidityTransformation(timing, transform);
                }
                break;

            case ErrorTransformationType.INTENSITY:
                if (transform.factor !== undefined) {
                    this.applyIntensityTransformation(timing, transform);
                }
                break;

            case ErrorTransformationType.DESYNCHRONIZATION:
                if (transform.offset !== undefined) {
                    this.applyDesynchronizationTransformation(timing, transform);
                }
                break;

            case ErrorTransformationType.OMISSION:
                this.applyOmissionTransformation(timing);
                break;

            default:
                // Fallback: réduit simplement la précision
                this.reduceAccuracy(timing, RhythmTransformer.TRANSFORMATION_CONFIG.defaultAccuracyReduction);
                break;
        }
    }

    /**
     * Applique une transformation de vitesse sophistiquée
     * @param timing - Paramètre de timing
     * @param transform - Transformation à appliquer
     * @private
     */
    private applySpeedTransformation(timing: LSFTimingParameter, transform: ErrorTransformation): void {
        const isAcceleration = transform.type === ErrorTransformationType.ACCELERATION;
        const originalSpeed = timing.speed;
        const originalDuration = timing.duration;

        if (timing.speed !== undefined && transform.factor !== undefined) {
            // Applique la transformation de vitesse
            timing.speed = Math.max(0.1, Math.min(3.0, timing.speed * transform.factor));

            // Analyse l'impact selon le niveau de vitesse atteint
            const speedAnalysis = RhythmAnalysisService.analyzeSpeedImpact(timing.speed);
            this.logger.debug(
                `${isAcceleration ? 'Accélération' : 'Décélération'}: ${originalSpeed} → ${timing.speed} (${speedAnalysis.description})`
            );
        }

        // Ajuste la durée inversement à la vitesse
        if (timing.duration !== undefined && transform.factor !== undefined) {
            timing.duration = Math.max(0.1, timing.duration / transform.factor);
            this.logger.debug(`Durée ajustée: ${originalDuration} → ${timing.duration}s`);
        }

        // Impact sur la fluidité selon la transformation
        if (timing.fluidity !== undefined) {
            const fluidityImpact = RhythmPatternService.calculateFluidityImpact(transform.factor ?? 1);
            timing.fluidity = Math.max(0, Math.min(1, timing.fluidity - fluidityImpact));
        }

        const accuracyImpact = RhythmPatternService.calculateSpeedAccuracyImpact(transform.factor ?? 1);
        this.reduceAccuracy(timing, accuracyImpact);
    }

    /**
     * Applique une transformation de pause sophistiquée
     * @param timing - Paramètre de timing
     * @param transform - Transformation à appliquer
     * @private
     */
    private applyPauseTransformation(timing: LSFTimingParameter, transform: ErrorTransformation): void {
        const transformSeverity = transform.factor ?? 0.5;
        timing.inappropriatePauses = true;

        // Génère des pauses inappropriées contextuelles
        const pauseType = RhythmPatternService.generateInappropriatePause();
        this.logger.debug(`Pauses inappropriées ajoutées: ${pauseType.description} (durée: ${pauseType.duration}s)`);

        // Impact différencié selon le type de pause et la sévérité de la transformation
        const baseAccuracyImpact = RhythmPatternService.calculatePauseAccuracyImpact(pauseType);
        const adjustedAccuracyImpact = baseAccuracyImpact * (1 + transformSeverity);
        this.reduceAccuracy(timing, adjustedAccuracyImpact);

        // Affecte la fluidité
        if (timing.fluidity !== undefined) {
            timing.fluidity = Math.max(0.1, timing.fluidity - pauseType.fluidityImpact);
        }
    }

    /**
     * Applique une transformation d'hésitation réaliste
     * @param timing - Paramètre de timing
     * @param transform - Transformation à appliquer
     * @private
     */
    private applyHesitationTransformation(timing: LSFTimingParameter, transform: ErrorTransformation): void {
        const transformIntensity = transform.factor ?? 1.0;
        timing.hesitations = true;

        // Simule différents types d'hésitations
        const hesitationType = RhythmPatternService.generateHesitationPattern();
        this.logger.debug(`Hésitations ajoutées: ${hesitationType.pattern} (fréquence: ${hesitationType.frequency})`);

        // Impact sur la vitesse globale, modulé par l'intensité de la transformation
        if (timing.speed !== undefined) {
            const speedReduction = hesitationType.speedReduction * transformIntensity;
            timing.speed *= Math.max(0.1, speedReduction);
        }

        // Impact majeur sur la fluidité
        if (timing.fluidity !== undefined) {
            const fluidityReduction = hesitationType.fluidityMultiplier * Math.min(1, transformIntensity);
            timing.fluidity = Math.max(0.1, timing.fluidity * fluidityReduction);
        }

        const adjustedAccuracyImpact = hesitationType.accuracyImpact * transformIntensity;
        this.reduceAccuracy(timing, adjustedAccuracyImpact);
    }

    /**
     * Applique une transformation de fluidité avancée
     * @param timing - Paramètre de timing
     * @param transform - Transformation à appliquer
     * @private
     */
    private applyFluidityTransformation(timing: LSFTimingParameter, transform: ErrorTransformation): void {
        const originalFluidity = timing.fluidity ?? 1;

        if (transform.factor !== undefined) {
            // Calcule la nouvelle fluidité avec validation
            const newFluidity = Math.max(0, Math.min(1, originalFluidity * transform.factor));
            timing.fluidity = newFluidity;

            // Analyse le niveau de fluidité atteint
            const fluidityAnalysis = RhythmAnalysisService.analyzeFluidityLevel(newFluidity);
            this.logger.debug(
                `Fluidité modifiée: ${originalFluidity} → ${newFluidity} (${fluidityAnalysis.description})`
            );

            // La perte de fluidité affecte d'autres paramètres
            this.cascadeFluidityEffects(timing, fluidityAnalysis);
        }

        this.reduceAccuracy(timing, (1 - (transform.factor ?? 1)) * 0.4);
    }

    /**
     * Applique une transformation d'intensité temporelle
     * @param timing - Paramètre de timing
     * @param transform - Transformation à appliquer
     * @private
     */
    private applyIntensityTransformation(timing: LSFTimingParameter, transform: ErrorTransformation): void {
        if (transform.factor !== undefined) {
            // L'intensité affecte multiple paramètres temporels
            const intensityLevel = transform.factor;

            // Modifie la vitesse selon l'intensité
            if (timing.speed !== undefined) {
                const speedModification = 1 + (intensityLevel - 1) * 0.5;
                timing.speed *= speedModification;
            }

            // Impact sur la fluidité (intensité trop forte peut nuire)
            if (timing.fluidity !== undefined && intensityLevel > 1.2) {
                const fluidityReduction = (intensityLevel - 1.2) * 0.3;
                timing.fluidity = Math.max(0.2, timing.fluidity - fluidityReduction);
            }

            this.logger.debug(`Intensité temporelle appliquée: facteur ${intensityLevel}`);
            this.reduceAccuracy(timing, Math.abs(intensityLevel - 1) * 0.3);
        }
    }

    /**
     * Applique une transformation de désynchronisation
     * @param timing - Paramètre de timing
     * @param transform - Transformation à appliquer
     * @private
     */
    private applyDesynchronizationTransformation(timing: LSFTimingParameter, transform: ErrorTransformation): void {
        if (transform.offset !== undefined) {
            // Simule une désynchronisation temporelle
            const desyncSeverity = Math.abs(transform.offset);
            this.logger.debug(`Désynchronisation appliquée: offset ${transform.offset}ms`);

            // La désynchronisation affecte la fluidité et la précision
            if (timing.fluidity !== undefined) {
                const fluidityLoss = Math.min(0.5, desyncSeverity / 1000);
                timing.fluidity = Math.max(0.1, timing.fluidity - fluidityLoss);
            }

            this.reduceAccuracy(timing, Math.min(0.7, desyncSeverity / 500));
        }
    }

    /**
     * Applique une transformation d'omission temporelle
     * @param timing - Paramètre de timing
     * @private
     */
    private applyOmissionTransformation(timing: LSFTimingParameter): void {
        // Simule l'omission d'éléments temporels cruciaux
        timing.inappropriatePauses = true;
        timing.hesitations = true;

        // Réduction drastique de tous les paramètres temporels
        if (timing.speed !== undefined) timing.speed *= 0.6;
        if (timing.fluidity !== undefined) timing.fluidity *= 0.3;
        if (timing.duration !== undefined) timing.duration *= 1.4;

        this.logger.debug('Omission temporelle appliquée - éléments temporels cruciaux manquants');
        this.reduceAccuracy(timing, RhythmTransformer.TRANSFORMATION_CONFIG.accuracyReductionFactors.omission);
    }

    /**
     * Applique les effets en cascade de la perte de fluidité
     * @param timing - Paramètre de timing
     * @param fluidityAnalysis - Analyse de fluidité
     * @private
     */
    private cascadeFluidityEffects(timing: LSFTimingParameter, fluidityAnalysis: ReturnType<typeof RhythmAnalysisService.analyzeFluidityLevel>): void {
        // La perte de fluidité affecte la vitesse
        if (timing.speed !== undefined && fluidityAnalysis.level === 'choppy') {
            timing.speed *= 0.8; // Ralentissement compensatoire
        }

        // Peut induire des hésitations
        if (fluidityAnalysis.level === 'hesitant') {
            timing.hesitations = true;
        }
    }

    /**
     * Réduit la précision (accuracy) d'un paramètre de timing
     * @param timing - Paramètre de timing
     * @param reduction - Valeur de réduction (0-1)
     * @private
     */
    private reduceAccuracy(timing: LSFTimingParameter, reduction: number): void {
        const originalAccuracy = timing.accuracy ?? 1;
        timing.accuracy = Math.max(0, originalAccuracy - reduction);

        this.logger.debug(
            `Précision de timing réduite: ${originalAccuracy} → ${timing.accuracy}`
        );
    }

    /**
     * Applique la transformation par défaut pour les erreurs de rythme
     * @param content - Contenu LSF à modifier
     * @protected
     * @override
     */
    protected applySpecificDefaultTransformation(content: Record<string, unknown>): void {
        const timing = this.getTargetParameter(content);
        if (!timing) {
            this.logger.warn('Aucun paramètre de timing trouvé pour la transformation par défaut');
            return;
        }

        const severity = this.errorCategory.defaultTransformation.severity;
        this.reduceAccuracy(timing, severity);

        this.logger.debug(
            `Transformation par défaut appliquée - Précision réduite de ${severity}: ${timing.accuracy}`
        );
    }

    /**
     * Obtient le paramètre de timing dans le contenu LSF
     * @param content - Contenu LSF
     * @returns Le paramètre de timing ou undefined s'il n'existe pas
     * @protected
     * @override
     */
    protected getTargetParameter(content: Record<string, unknown>): LSFTimingParameter | undefined {
        const parameters = content.parameters as LSFParameters | undefined;
        if (!parameters) {
            return undefined;
        }

        return parameters.timing;
    }

    /**
     * Obtient des statistiques sur le système rythmique
     * @returns Statistiques du système rythmique
     * @public
     */
    public getRhythmStats() {
        return RhythmAnalysisService.getRhythmStats();
    }

    /**
     * Génère un rapport d'analyse rythmique complet
     * @param timing - Paramètre de timing
     * @returns Rapport d'analyse rythmique
     * @public
     */
    public generateRhythmAnalysis(timing: LSFTimingParameter) {
        return RhythmAnalysisService.generateRhythmAnalysis(timing);
    }

    /**
     * Suggère des exercices d'amélioration rythmique
     * @param timing - Paramètre de timing
     * @returns Liste d'exercices recommandés
     * @public
     */
    public suggestRhythmExercises(timing: LSFTimingParameter) {
        return RhythmAnalysisService.suggestRhythmExercises(timing);
    }

    /**
     * Évalue la compatibilité rythmique avec un contexte donné
     * @param timing - Paramètre de timing
     * @param context - Contexte (conversational, formal, artistic, etc.)
     * @returns Évaluation de compatibilité
     * @public
     */
    public evaluateContextCompatibility(timing: LSFTimingParameter, context: string = 'conversational') {
        return RhythmAnalysisService.evaluateContextCompatibility(timing, context);
    }
}