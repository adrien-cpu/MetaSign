/**
 * Gestionnaire de fusion pour les résultats distribués
 * Responsable de la fusion, validation et optimisation des résultats
 * provenant de différents nœuds de traitement
 */
import { SecurityValidator } from '@api/security/validation/SecurityValidator';
import { OptimizationService } from '@distributed/optimization/OptimizationService';
import { Logger } from '@common/monitoring/LogService';
import { IEnhancedMetricsCollector } from './interfaces/IEnhancedMetricsCollector';
import { IFusionManager } from './interfaces/IFusionManager';
import {
    FusionStrategy,
    FusionOptions,
    EnhancedProcessingResult,
    EnhancedDistributedResult
} from './types/fusion.types';
import { ValidationError, IntegrityError } from './types/errors.types';

/**
 * Gestionnaire pour la fusion de résultats traités dans un environnement distribué
 */
export class FusionManager implements IFusionManager {
    private readonly securityValidator: SecurityValidator;
    private readonly optimizationService: OptimizationService;
    private readonly logger: Logger;
    private readonly metricsCollector: IEnhancedMetricsCollector;
    private readonly fusionStrategies: Map<string, FusionStrategy>;

    /**
     * Constructeur
     * @param securityValidator - Validateur de sécurité pour vérifier les résultats
     * @param optimizationService - Service d'optimisation pour améliorer les résultats
     * @param logger - Logger pour les événements de fusion
     * @param metricsCollector - Collecteur de métriques pour suivre les performances
     */
    constructor(
        securityValidator: SecurityValidator,
        optimizationService: OptimizationService,
        logger: Logger = new Logger('FusionManager'),
        metricsCollector: IEnhancedMetricsCollector
    ) {
        this.securityValidator = securityValidator;
        this.optimizationService = optimizationService;
        this.logger = logger;
        this.metricsCollector = metricsCollector;
        this.fusionStrategies = new Map<string, FusionStrategy>();

        // Initialiser les stratégies de fusion par défaut
        this.registerDefaultStrategies();
    }

    /**
     * Fusionne les résultats distribués en un résultat unique
     * @param results - Résultats à fusionner
     * @param options - Options de fusion
     * @returns Résultat fusionné
     * @throws {ValidationError} Si un résultat ne passe pas la validation
     * @throws {IntegrityError} Si un résultat ne satisfait pas les contrôles d'intégrité
     */
    public async fuseResults(
        results: EnhancedProcessingResult[],
        options: FusionOptions = {}
    ): Promise<EnhancedDistributedResult> {
        if (!results || results.length === 0) {
            this.logger.warn('Tentative de fusion avec un tableau de résultats vide');
            throw new Error('Cannot fuse empty results array');
        }

        const startTime = Date.now();
        this.logger.debug(`Démarrage de la fusion de ${results.length} résultats`);

        try {
            // Validation des résultats
            await this.validateResults(results);

            // Optimisation des résultats
            const optimizedResults = await this.optimizationService.optimizeResults(
                results,
                options.optimizationLevel || 'standard'
            );

            // Sélection de la stratégie de fusion
            const strategy = this.getStrategy(options.strategy || 'weighted');

            // Création du résultat fusionné
            const fusedResult: EnhancedDistributedResult = {
                fused: this.fuseData(optimizedResults, strategy),
                confidence: this.calculateConfidence(optimizedResults),
                metadata: {
                    processingTimeMs: Date.now() - startTime,
                    nodesContributed: optimizedResults.length,
                    aggregationMethod: options.strategy || 'weighted',
                    timestamp: Date.now(),
                    version: '1.0'
                },
                timestamp: Date.now(),
                sources: results.map(r => r.source || 'unknown'),
                processingTime: Date.now() - startTime
            };

            // Collecter les métriques
            this.collectFusionMetrics(fusedResult, startTime);

            this.logger.debug(`Fusion terminée avec succès, confiance: ${fusedResult.confidence.toFixed(2)}`);
            return fusedResult;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Échec de la fusion: ${errorMessage}`);
            this.metricsCollector.incrementCounter('fusion.errors');
            throw error;
        }
    }

    /**
     * Enregistre une stratégie de fusion personnalisée
     * @param name - Nom de la stratégie
     * @param strategy - Fonction de stratégie de fusion
     */
    public registerStrategy(name: string, strategy: FusionStrategy): void {
        this.fusionStrategies.set(name, strategy);
        this.logger.debug(`Stratégie de fusion '${name}' enregistrée`);
    }

    /**
     * Obtient une stratégie de fusion par son nom
     * @param name - Nom de la stratégie
     * @returns Stratégie de fusion
     */
    public getStrategy(name: string): FusionStrategy {
        const strategy = this.fusionStrategies.get(name);
        if (!strategy) {
            this.logger.warn(`Stratégie '${name}' non trouvée, utilisation de 'weighted' par défaut`);
            return this.fusionStrategies.get('weighted') as FusionStrategy;
        }
        return strategy;
    }

    /**
     * Initialise les stratégies de fusion par défaut
     * @private
     */
    private registerDefaultStrategies(): void {
        // Stratégie pondérée par la confiance
        this.registerStrategy('weighted', (data: unknown[], confidences: number[]) => {
            // Si un seul élément, le retourner directement
            if (data.length === 1) return data[0];

            // Fusion selon le type de données
            if (data.every(item => typeof item === 'number')) {
                // Moyenne pondérée pour les nombres
                const totalWeight = confidences.reduce((sum, conf) => sum + conf, 0);
                let weightedSum = 0;

                for (let i = 0; i < data.length; i++) {
                    weightedSum += (data[i] as number) * confidences[i];
                }

                return weightedSum / totalWeight;
            } else if (data.every(item => typeof item === 'string')) {
                // Pour les chaînes, sélectionner celle avec la plus grande confiance
                const maxIndex = confidences.indexOf(Math.max(...confidences));
                return data[maxIndex];
            } else if (data.every(item => Array.isArray(item))) {
                // Fusion d'arrays par concaténation et dédoublonnage
                const allArrays = data as unknown[][];
                const merged: unknown[] = [];

                for (const arr of allArrays) {
                    merged.push(...arr);
                }

                return [...new Set(merged)];
            } else if (data.every(item => typeof item === 'object' && item !== null)) {
                // Fusion d'objets par propriété
                const result: Record<string, unknown> = {};
                const keys = new Set<string>();

                // Collecter toutes les clés
                for (const item of data) {
                    if (item && typeof item === 'object') {
                        Object.keys(item as Record<string, unknown>).forEach(key => keys.add(key));
                    }
                }

                // Fusion des valeurs pour chaque clé
                for (const key of keys) {
                    const values: unknown[] = [];
                    const valueConfidences: number[] = [];

                    for (let i = 0; i < data.length; i++) {
                        const item = data[i];
                        if (item && typeof item === 'object' && key in (item as Record<string, unknown>)) {
                            values.push((item as Record<string, unknown>)[key]);
                            valueConfidences.push(confidences[i]);
                        }
                    }

                    if (values.length > 0) {
                        const strategy = this.getStrategy('weighted');
                        result[key] = strategy(values, valueConfidences);
                    }
                }

                return result;
            }

            // Fallback: retourner la valeur ayant la plus grande confiance
            const maxIndex = confidences.indexOf(Math.max(...confidences));
            return data[maxIndex];
        });

        // Stratégie simple par vote majoritaire
        this.registerStrategy('majority', (data: unknown[]) => {
            if (data.length === 1) return data[0];

            // Count occurrences - convert objects to strings to enable comparison
            const counts = new Map<string, { count: number, original: unknown }>();

            data.forEach(item => {
                try {
                    const key = JSON.stringify(item);
                    const existingItem = counts.get(key);

                    if (existingItem) {
                        existingItem.count += 1;
                    } else {
                        counts.set(key, { count: 1, original: item });
                    }
                } catch {
                    // En cas d'erreur (objet non sérialisable), ignorer silencieusement
                    this.logger.warn('Item non sérialisable détecté lors du comptage majoritaire');
                }
            });

            // Find majority
            let maxCount = 0;
            let majorityItem: unknown = data[0]; // Default to first item

            for (const [, value] of counts.entries()) {
                if (value.count > maxCount) {
                    maxCount = value.count;
                    majorityItem = value.original;
                }
            }

            return majorityItem;
        });

        // Stratégie par moyenne simple
        this.registerStrategy('average', (data: unknown[]) => {
            if (data.length === 1) return data[0];

            // Vérifier si toutes les valeurs sont numériques
            const allNumbers = data.every(item => typeof item === 'number');

            if (allNumbers) {
                // Calculer la moyenne si toutes les valeurs sont des nombres
                let sum = 0;
                for (const item of data) {
                    sum += item as number;
                }
                return sum / data.length;
            }

            // Par défaut, retourner le premier élément
            return data[0];
        });
    }

    /**
     * Valide tous les résultats pour la sécurité et l'intégrité
     * @param results - Résultats à valider
     * @private
     */
    private async validateResults(results: EnhancedProcessingResult[]): Promise<void> {
        for (const result of results) {
            try {
                // Validation de sécurité
                await this.securityValidator.validate(result);

                // Validation d'intégrité
                await this.validateIntegrity(result);
            } catch (error) {
                const resultSource = result.source || 'unknown';
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.error(`Échec de validation pour le résultat de source ${resultSource}: ${errorMessage}`);
                throw error instanceof Error
                    ? error
                    : new ValidationError(`Validation failed: ${errorMessage}`);
            }
        }

        this.logger.debug(`Tous les résultats (${results.length}) validés avec succès`);
    }

    /**
     * Valide l'intégrité d'un résultat
     * @param result - Résultat à valider
     * @private
     */
    private async validateIntegrity(result: EnhancedProcessingResult): Promise<void> {
        // Vérifier que les champs requis sont présents
        if (result.data === undefined || result.data === null) {
            throw new IntegrityError('Missing required field: data');
        }

        if (result.confidence === undefined || result.confidence === null) {
            throw new IntegrityError('Missing required field: confidence');
        }

        if (result.confidence < 0 || result.confidence > 1) {
            throw new IntegrityError('Confidence must be between 0 and 1');
        }

        // Vérifier les signatures si disponibles
        if (result.signature && result.source) {
            const isValid = await this.securityValidator.verifySignature(
                result.data,
                result.signature,
                result.source
            );

            if (!isValid) {
                throw new IntegrityError('Invalid signature');
            }
        }

        // Vérifier les contraintes temporelles si nécessaire
        if (result.timestamp) {
            const now = Date.now();
            const maxAge = 30 * 60 * 1000; // 30 minutes

            if (now - result.timestamp > maxAge) {
                throw new IntegrityError('Result too old');
            }
        }
    }

    /**
     * Fusionne les données des résultats selon la stratégie spécifiée
     * @param results - Résultats à fusionner
     * @param strategy - Stratégie de fusion à utiliser
     * @private
     */
    private fuseData(results: EnhancedProcessingResult[], strategy: FusionStrategy): unknown {
        const data = results.map(r => r.data);
        const confidences = results.map(r => r.confidence);

        return strategy(data, confidences);
    }

    /**
     * Calcule la confiance globale du résultat fusionné
     * @param results - Résultats utilisés pour la fusion
     * @returns Niveau de confiance entre 0 et 1
     * @private
     */
    private calculateConfidence(results: EnhancedProcessingResult[]): number {
        // Plusieurs approches possibles, ici nous utilisons une moyenne pondérée
        const weights = results.map(r => {
            // Facteurs pouvant influencer le poids:
            // - Âge du résultat (plus récent = plus de poids)
            // - Source du résultat (certaines sources peuvent être plus fiables)
            // - Qualité historique de la source

            let weight = r.confidence;

            // Ajustement basé sur l'âge
            if (r.timestamp) {
                const ageInMinutes = (Date.now() - r.timestamp) / (60 * 1000);
                // Réduire le poids pour les données plus anciennes (diminution de 10% par heure)
                weight *= Math.pow(0.9, ageInMinutes / 60);
            }

            return Math.max(0.1, weight); // Garantir un poids minimum de 0.1
        });

        // Calculer la moyenne pondérée des confidences
        let weightedConfidenceSum = 0;
        let totalWeight = 0;

        for (let i = 0; i < results.length; i++) {
            weightedConfidenceSum += results[i].confidence * weights[i];
            totalWeight += weights[i];
        }

        const weightedConfidence = totalWeight > 0
            ? weightedConfidenceSum / totalWeight
            : 0;

        // Normaliser entre 0 et 1
        return Math.min(1, Math.max(0, weightedConfidence));
    }

    /**
     * Collecte les métriques de performance de la fusion
     * @param result - Résultat fusionné  
     * @param startTime - Temps de début de la fusion
     * @private
     */

    /**
     * Collecte les métriques de performance de la fusion
     * @param result - Résultat fusionné
     * @param startTime - Temps de début de la fusion
     * @private
     */
    private collectFusionMetrics(result: EnhancedDistributedResult, startTime: number): void {
        const fusionTime = Date.now() - startTime;

        // Enregistrer les métriques de temps
        this.metricsCollector.recordValue('fusion.time', fusionTime);
        this.metricsCollector.recordValue('fusion.confidence', result.confidence);

        // Incrémenter le compteur de fusions réussies
        this.metricsCollector.incrementCounter('fusion.success');

        // Enregistrer la taille des données fusionnées (approximative)
        const dataSize = JSON.stringify(result.fused).length;
        this.metricsCollector.recordValue('fusion.dataSize', dataSize);

        this.logger.debug(`Fusion completed in ${fusionTime}ms, confidence: ${result.confidence.toFixed(2)}`);
    }
}