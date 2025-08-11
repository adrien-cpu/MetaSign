import { BaseAI } from '@ai/base/BaseAI';
import { PyramidLevelType } from './types';
import {
    IPyramidDataFlow,
    PyramidData,
    ProcessingOptions,
    ProcessingResult,
    ProcessingStatus,
    PyramidMetadata,
    PyramidMetrics
} from './interfaces/IPyramidDataFlow';
import { Logger } from '@ai/utils/Logger';
import { PyramidLevelFactory } from './PyramidLevelFactory';

/**
 * Cœur de la Pyramide IA - Implémente la logique de traitement à travers les niveaux
 * de la pyramide, en montant (bottom-up) ou descendant (top-down)
 */
export class PyramideIACore extends BaseAI implements IPyramidDataFlow {
    private logger: Logger;
    private levelFactory: PyramidLevelFactory;
    private orderedLevels: PyramidLevelType[] = [];
    private processors = new Map<PyramidLevelType, unknown>();
    private metrics: PyramidMetrics = {
        processingTime: {
            upward: 0,
            downward: 0
        },
        successRate: {
            upward: 0,
            downward: 0
        },
        throughput: {
            upward: 0,
            downward: 0
        }
    };

    constructor() {
        super();
        this.logger = new Logger('PyramideIACore');
        this.levelFactory = new PyramidLevelFactory();
    }

    /**
     * Initialise la pyramide IA en créant tous les niveaux
     */
    public async initialize(): Promise<void> {
        this.logger.info('Initializing PyramideIACore...');
        try {
            await this.initializePyramidLevels();
            this.logger.info('PyramideIACore initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize PyramideIACore', { error });
            throw error;
        }
    }

    /**
     * Méthode d'initialisation interne - implémentation requise par BaseAI
     */
    protected async internalInitialize(): Promise<void> {
        // Initialisation déjà gérée dans initialize()
    }

    /**
     * Méthode d'arrêt interne - implémentation requise par BaseAI
     */
    protected async internalShutdown(): Promise<void> {
        this.logger.info('Shutting down PyramideIACore...');
        // Nettoyage si nécessaire
    }

    /**
     * Initialise tous les niveaux de la pyramide
     */
    private async initializePyramidLevels(): Promise<void> {
        this.logger.info('Initializing pyramid levels...');

        // Définition explicite de l'ordre des niveaux pour éviter les problèmes avec les enum
        const levelTypes: PyramidLevelType[] = [
            PyramidLevelType.COLLECTOR,
            PyramidLevelType.PREPARATOR,
            PyramidLevelType.SPECTATOR,
            PyramidLevelType.ANOMALY_MANAGER,
            PyramidLevelType.ANALYST,
            PyramidLevelType.MENTOR,
            PyramidLevelType.GENERATOR,
            PyramidLevelType.ETHICIST,
            PyramidLevelType.SIMULATOR,
            PyramidLevelType.PREDICTOR,
            PyramidLevelType.HISTORIAN,
            PyramidLevelType.MEDIATOR,
            PyramidLevelType.EXPLORER
        ];

        this.orderedLevels = levelTypes;

        // Initialiser chaque niveau
        for (const levelType of this.orderedLevels) {
            try {
                const processor = this.levelFactory.createLevel(levelType);
                this.processors.set(levelType, processor);
                this.logger.debug(`Initialized level ${String(levelType)}`);
            } catch (error) {
                this.logger.error(`Failed to initialize level ${String(levelType)}`, { error });
                throw error;
            }
        }

        this.logger.info('All pyramid levels initialized successfully');
    }

    /**
     * Traite les données en remontant la pyramide depuis le niveau source
     * @param data Les données à traiter
     * @param sourceLevel Le niveau source de départ
     * @param options Options de traitement
     * @returns Résultat du traitement
     */
    public async processUp<T extends PyramidData>(
        data: T,
        sourceLevel: PyramidLevelType,
        options?: ProcessingOptions
    ): Promise<ProcessingResult<T>> {
        const startTime = Date.now();
        this.logger.debug(`Processing data upward from level ${String(sourceLevel)}`);

        try {
            // Vérifier que le niveau source existe
            if (!this.processors.has(sourceLevel)) {
                throw new Error(`Source level ${String(sourceLevel)} not found`);
            }

            // Créer une copie des données et préparer les métadonnées
            const processedData = { ...data };
            const metadata: PyramidMetadata = {
                processingPath: [sourceLevel],
                processedBy: [sourceLevel],
                processingTime: 0,
                sourceLevel: sourceLevel,
                targetLevel: sourceLevel, // Initialisation avec sourceLevel
                transformations: [],
                completedAt: 0
            };

            // Trouver l'index du niveau source
            const sourceIndex = this.orderedLevels.indexOf(sourceLevel);
            if (sourceIndex === -1) {
                throw new Error(`Source level ${String(sourceLevel)} not found in ordered levels`);
            }

            // Déterminer l'index du niveau cible
            let targetIndex = this.orderedLevels.length - 1; // Par défaut, jusqu'au sommet

            // Essayer de trouver l'index du niveau cible à partir des options
            if (options && typeof options.targetLevel !== 'undefined') {
                // Convertir en string pour une comparaison sûre
                const targetLevelStr = String(options.targetLevel);

                // Chercher l'index correspondant
                const foundIndex = this.orderedLevels.findIndex(
                    level => String(level) === targetLevelStr
                );

                if (foundIndex !== -1) {
                    targetIndex = foundIndex;
                }
            }

            // Récupérer le niveau cible à partir de son index
            const targetLevel = this.orderedLevels[targetIndex];

            // Mettre à jour le niveau cible dans les métadonnées
            metadata.targetLevel = targetLevel;

            // Le niveau actuel pour le traitement
            let currentLevel = sourceLevel;

            // Traiter les niveaux en remontant (de l'indice source vers l'indice cible)
            const maxLevels = typeof options?.maxLevels === 'number' ? options.maxLevels : Number.MAX_SAFE_INTEGER;
            let processedLevels = 0;

            // Si sourceIndex < targetIndex, on monte dans la hiérarchie
            if (sourceIndex < targetIndex) {
                for (let i = sourceIndex + 1; i <= targetIndex && processedLevels < maxLevels; i++) {
                    const nextLevel = this.orderedLevels[i];

                    // Vérifier si le niveau actuel a un processeur
                    if (!this.processors.has(currentLevel)) {
                        throw new Error(`Level processor not found for level ${String(currentLevel)}`);
                    }

                    // Enregistrer le chemin de traitement
                    metadata.processingPath.push(nextLevel);
                    if (metadata.processedBy) {
                        metadata.processedBy.push(nextLevel);
                    }
                    if (metadata.transformations) {
                        metadata.transformations.push(`${String(currentLevel)}_to_${String(nextLevel)}`);
                    }

                    // Passer au niveau suivant et incrémenter le compteur
                    currentLevel = nextLevel;
                    processedLevels++;
                }
            } else if (sourceIndex > targetIndex) {
                // Cas anormal, mais géré quand même
                this.logger.warn(`Target level (${String(targetLevel)}) is below source level (${String(sourceLevel)}) for upward processing`);
            }

            // Mettre à jour le niveau cible avec le niveau final atteint
            metadata.targetLevel = currentLevel;

            const endTime = Date.now();
            metadata.processingTime = endTime - startTime;
            metadata.completedAt = endTime;

            // Mettre à jour les métriques
            this.updateMetrics('upward', metadata.processingTime, true);

            return {
                data: processedData,
                metadata,
                status: ProcessingStatus.SUCCESS
            };
        } catch (error) {
            const endTime = Date.now();
            const processingTime = endTime - startTime;

            // Mettre à jour les métriques en cas d'échec
            this.updateMetrics('upward', processingTime, false);

            this.logger.error('Error processing data upward', { error, sourceLevel });

            return {
                data,
                metadata: {
                    processingPath: [sourceLevel],
                    processingTime,
                    sourceLevel: sourceLevel,
                    targetLevel: sourceLevel,
                    error: error instanceof Error ? error.message : String(error)
                },
                status: ProcessingStatus.ERROR,
                errors: [{
                    level: sourceLevel,
                    code: 'PROCESSING_ERROR',
                    message: error instanceof Error ? error.message : String(error)
                }]
            };
        }
    }

    /**
     * Traite les données en descendant la pyramide depuis le niveau source
     * @param data Les données à traiter
     * @param sourceLevel Le niveau source de départ
     * @param options Options de traitement
     * @returns Résultat du traitement
     */
    public async processDown<T extends PyramidData>(
        data: T,
        sourceLevel: PyramidLevelType,
        options?: ProcessingOptions
    ): Promise<ProcessingResult<T>> {
        const startTime = Date.now();
        this.logger.debug(`Processing data downward from level ${String(sourceLevel)}`);

        try {
            // Vérifier que le niveau source existe
            if (!this.processors.has(sourceLevel)) {
                throw new Error(`Source level ${String(sourceLevel)} not found`);
            }

            // Créer une copie des données et préparer les métadonnées
            const processedData = { ...data };
            const metadata: PyramidMetadata = {
                processingPath: [sourceLevel],
                processedBy: [sourceLevel],
                processingTime: 0,
                sourceLevel: sourceLevel,
                targetLevel: sourceLevel, // Initialisation avec sourceLevel
                transformations: [],
                completedAt: 0
            };

            // Trouver l'index du niveau source
            const sourceIndex = this.orderedLevels.indexOf(sourceLevel);
            if (sourceIndex === -1) {
                throw new Error(`Source level ${String(sourceLevel)} not found in ordered levels`);
            }

            // Déterminer l'index du niveau cible
            let targetIndex = 0; // Par défaut, jusqu'au niveau le plus bas

            // Essayer de trouver l'index du niveau cible à partir des options
            if (options && typeof options.targetLevel !== 'undefined') {
                // Convertir en string pour une comparaison sûre
                const targetLevelStr = String(options.targetLevel);

                // Chercher l'index correspondant
                const foundIndex = this.orderedLevels.findIndex(
                    level => String(level) === targetLevelStr
                );

                if (foundIndex !== -1) {
                    targetIndex = foundIndex;
                }
            }

            // Récupérer le niveau cible à partir de son index
            const targetLevel = this.orderedLevels[targetIndex];

            // Mettre à jour le niveau cible dans les métadonnées
            metadata.targetLevel = targetLevel;

            // Le niveau actuel pour le traitement
            let currentLevel = sourceLevel;

            // Traiter les niveaux en descendant (de l'indice source vers l'indice cible)
            const maxLevels = typeof options?.maxLevels === 'number' ? options.maxLevels : Number.MAX_SAFE_INTEGER;
            let processedLevels = 0;

            // Si sourceIndex > targetIndex, on descend dans la hiérarchie
            if (sourceIndex > targetIndex) {
                for (let i = sourceIndex - 1; i >= targetIndex && processedLevels < maxLevels; i--) {
                    const nextLevel = this.orderedLevels[i];

                    // Vérifier si le niveau actuel a un processeur
                    if (!this.processors.has(currentLevel)) {
                        throw new Error(`Level processor not found for level ${String(currentLevel)}`);
                    }

                    // Enregistrer le chemin de traitement
                    metadata.processingPath.push(nextLevel);
                    if (metadata.processedBy) {
                        metadata.processedBy.push(nextLevel);
                    }
                    if (metadata.transformations) {
                        metadata.transformations.push(`${String(currentLevel)}_to_${String(nextLevel)}`);
                    }

                    // Passer au niveau suivant et incrémenter le compteur
                    currentLevel = nextLevel;
                    processedLevels++;
                }
            } else if (sourceIndex < targetIndex) {
                // Cas anormal, mais géré quand même
                this.logger.warn(`Target level (${String(targetLevel)}) is above source level (${String(sourceLevel)}) for downward processing`);
            }

            // Mettre à jour le niveau cible avec le niveau final atteint
            metadata.targetLevel = currentLevel;

            const endTime = Date.now();
            metadata.processingTime = endTime - startTime;
            metadata.completedAt = endTime;

            // Mettre à jour les métriques
            this.updateMetrics('downward', metadata.processingTime, true);

            return {
                data: processedData,
                metadata,
                status: ProcessingStatus.SUCCESS
            };
        } catch (error) {
            const endTime = Date.now();
            const processingTime = endTime - startTime;

            // Mettre à jour les métriques en cas d'échec
            this.updateMetrics('downward', processingTime, false);

            this.logger.error('Error processing data downward', { error, sourceLevel });

            return {
                data,
                metadata: {
                    processingPath: [sourceLevel],
                    processingTime,
                    sourceLevel: sourceLevel,
                    targetLevel: sourceLevel,
                    error: error instanceof Error ? error.message : String(error)
                },
                status: ProcessingStatus.ERROR,
                errors: [{
                    level: sourceLevel,
                    code: 'PROCESSING_ERROR',
                    message: error instanceof Error ? error.message : String(error)
                }]
            };
        }
    }

    /**
     * Vérifie si un niveau est disponible pour le traitement
     * @param level Niveau à vérifier
     * @returns true si le niveau est disponible
     */
    public isLevelAvailable(level: PyramidLevelType): boolean {
        return this.processors.has(level);
    }

    /**
     * Obtient la liste de tous les niveaux actifs dans la pyramide
     * @returns Liste des niveaux actifs
     */
    public getActiveLevels(): PyramidLevelType[] {
        return Array.from(this.processors.keys());
    }

    /**
     * Obtient les métriques de performance de la pyramide
     * @returns Métriques de performance sous forme d'objet
     */
    public getPerformanceMetrics(): Record<string, number> {
        return {
            'upward.processingTime': this.metrics.processingTime.upward,
            'upward.successRate': this.metrics.successRate.upward,
            'upward.throughput': this.metrics.throughput.upward,
            'downward.processingTime': this.metrics.processingTime.downward,
            'downward.successRate': this.metrics.successRate.downward,
            'downward.throughput': this.metrics.throughput.downward
        };
    }

    /**
     * Met à jour les métriques de performance
     * @param direction Direction du traitement
     * @param processingTime Temps de traitement en ms
     * @param success Succès ou échec du traitement
     */
    private updateMetrics(
        direction: 'upward' | 'downward',
        processingTime: number,
        success: boolean
    ): void {
        // Temps de traitement moyen (moyenne mobile)
        this.metrics.processingTime[direction] =
            (this.metrics.processingTime[direction] * 0.9) + (processingTime * 0.1);

        // Taux de réussite (moyenne mobile)
        const successValue = success ? 1 : 0;
        this.metrics.successRate[direction] =
            (this.metrics.successRate[direction] * 0.9) + (successValue * 0.1);

        // Débit (requêtes par seconde)
        this.metrics.throughput[direction] =
            1000 / Math.max(processingTime, 1); // Éviter division par zéro
    }
}