//src/i/pyramid/ParallelProcessingManager.ts
import { PyramidData, ProcessingResult, PyramidLevelType, ProcessingOptions, ProcessingStatus } from '../interfaces/IPyramidDataFlow';
import { Logger } from '@ai/utils/Logger';
import os from 'os';

/**
 * Configuration du traitement parallèle
 */
export interface ParallelProcessingOptions {
    // Nombre maximum de tâches parallèles (0 = auto = nombre de CPU cores)
    maxConcurrency: number;

    // Priorité des tâches (influencer l'ordre d'exécution)
    priority: 'high' | 'normal' | 'low';

    // Regrouper les tâches par lots pour réduire les surcharges
    batchSize: number;

    // Délai maximum d'exécution (ms)
    timeout?: number;

    // Réessai automatique en cas d'échec
    retry?: {
        // Nombre de tentatives
        attempts: number;
        // Délai entre les tentatives (ms)
        delay: number;
        // Facteur d'augmentation du délai (backoff)
        backoffFactor: number;
    };

    // Mode d'exécution (eager = démarrer toutes les tâches immédiatement,
    // conservative = contrôler le nombre de tâches actives)
    executionMode: 'eager' | 'conservative';

    // Liste des niveaux pouvant être exécutés en parallèle
    parallelizableLevels?: PyramidLevelType[];

    // Dépendances entre les niveaux (clé = niveau dépendant, valeur = niveaux dont il dépend)
    levelDependencies?: Record<PyramidLevelType, PyramidLevelType[]>;
}

/**
 * Tâche à traiter en parallèle
 */
interface ProcessingTask<T extends PyramidData> {
    // Données à traiter
    data: T;

    // Niveau de la pyramide
    level: PyramidLevelType;

    // Direction (montante ou descendante)
    direction: 'up' | 'down';

    // Options de traitement
    options?: ProcessingOptions;

    // Priorité de la tâche
    priority: number;

    // Timestamp de création
    createdAt: number;

    // Fonction de traitement
    processFn: (
        data: T,
        level: PyramidLevelType,
        options?: ProcessingOptions
    ) => Promise<ProcessingResult<T>>;

    // Fonction de résolution (pour les Promises)
    resolve: (result: ProcessingResult<T>) => void;

    // Fonction de rejet (pour les Promises)
    reject: (error: Error) => void;

    // Nombre de tentatives déjà effectuées
    attempts: number;

    // Métadonnées de contexte
    context?: Record<string, unknown>;
}

/**
 * Métriques du traitement parallèle
 */
export interface ParallelProcessingMetrics {
    // Nombre total de tâches traitées
    totalTasks: number;

    // Nombre de tâches réussies
    successfulTasks: number;

    // Nombre de tâches en échec
    failedTasks: number;

    // Taux de réussite
    successRate: number;

    // Nombre de tâches en cours
    activeTasks: number;

    // Nombre de tâches en attente
    queuedTasks: number;

    // Temps moyen de traitement (ms)
    averageProcessingTime: number;

    // Nombre de tâches exécutées en parallèle (moyenne)
    averageConcurrentTasks: number;

    // Nombre maximum de tâches parallèles atteint
    peakConcurrentTasks: number;

    // Temps moyen d'attente en file (ms)
    averageQueueTime: number;
}

/**
 * Résultat d'un traitement par lots
 */
export interface BatchProcessingResult<T extends PyramidData> {
    // Résultats individuels
    results: ProcessingResult<T>[];

    // Nombre de succès
    successCount: number;

    // Nombre d'échecs
    failureCount: number;

    // Temps total de traitement (ms)
    totalProcessingTime: number;

    // Temps moyen par tâche (ms)
    averageTaskTime: number;
}

/**
 * Manager de traitement parallèle pour la pyramide IA
 * Gère l'exécution parallèle des traitements à travers les niveaux de la pyramide
 */
export class ParallelProcessingManager {
    private options: ParallelProcessingOptions;
    private logger: Logger;
    private taskQueue: ProcessingTask<PyramidData>[] = [];
    private activeTasks: Set<ProcessingTask<PyramidData>> = new Set();
    private metrics: ParallelProcessingMetrics;
    private processingTimesHistory: number[] = [];
    private queueTimesHistory: number[] = [];
    private concurrencyHistory: number[] = [];
    private isProcessing: boolean = false;
    private activeTasksCount: number = 0;

    // File d'attente de préchauffage
    private warmupTasks: Record<string, ProcessingTask<PyramidData>> = {};

    /**
     * Crée une nouvelle instance du manager de traitement parallèle
     * @param options Options de configuration
     */
    constructor(options?: Partial<ParallelProcessingOptions>) {
        // Déterminer le nombre de cœurs disponibles
        const cpuCount = os.cpus().length;

        this.options = {
            maxConcurrency: options?.maxConcurrency || cpuCount,
            priority: options?.priority || 'normal',
            batchSize: options?.batchSize || 10,
            executionMode: options?.executionMode || 'conservative',
            parallelizableLevels: options?.parallelizableLevels || Object.values(PyramidLevelType),
            levelDependencies: options?.levelDependencies || {},
            retry: options?.retry || { attempts: 3, delay: 500, backoffFactor: 1.5 },
            timeout: options?.timeout || 30000
        };

        // Si maxConcurrency est 0, utiliser le nombre de cœurs
        if (this.options.maxConcurrency === 0) {
            this.options.maxConcurrency = cpuCount;
        }

        this.logger = new Logger('ParallelProcessingManager');

        this.metrics = {
            totalTasks: 0,
            successfulTasks: 0,
            failedTasks: 0,
            successRate: 0,
            activeTasks: 0,
            queuedTasks: 0,
            averageProcessingTime: 0,
            averageConcurrentTasks: 0,
            peakConcurrentTasks: 0,
            averageQueueTime: 0
        };

        this.logger.info('Parallel processing manager initialized', {
            maxConcurrency: this.options.maxConcurrency,
            executionMode: this.options.executionMode
        });
    }

    /**
     * Exécute une tâche de traitement de données en parallèle
     * @param data Données à traiter
     * @param level Niveau de la pyramide
     * @param direction Direction (montante ou descendante)
     * @param processFn Fonction de traitement
     * @param options Options de traitement
     * @returns Promesse avec le résultat du traitement
     */
    public async process<T extends PyramidData>(
        data: T,
        level: PyramidLevelType,
        direction: 'up' | 'down',
        processFn: (data: T, level: PyramidLevelType, options?: ProcessingOptions) => Promise<ProcessingResult<T>>,
        options?: ProcessingOptions
    ): Promise<ProcessingResult<T>> {
        const priorityMap = { high: 3, normal: 2, low: 1 };
        const taskPriority = priorityMap[options?.priority || 'normal'];

        return new Promise<ProcessingResult<T>>((resolve, reject) => {
            // Créer la tâche
            const task: ProcessingTask<T> = {
                data,
                level,
                direction,
                options,
                priority: taskPriority,
                createdAt: Date.now(),
                processFn,
                resolve,
                reject,
                attempts: 0
            };

            // Ajouter la tâche à la file d'attente
            this.addTask(task);
        });
    }

    /**
     * Traite un lot de données en parallèle
     * @param tasks Liste des tâches de traitement
     * @returns Résultat du traitement par lots
     */
    public async processBatch<T extends PyramidData>(
        tasks: Array<{
            data: T;
            level: PyramidLevelType;
            direction: 'up' | 'down';
            options?: ProcessingOptions;
        }>,
        processFn: (data: T, level: PyramidLevelType, options?: ProcessingOptions) => Promise<ProcessingResult<T>>
    ): Promise<BatchProcessingResult<T>> {
        const startTime = Date.now();

        // Convertir les tâches en promises
        const promises = tasks.map(task =>
            this.process(task.data, task.level, task.direction, processFn, task.options)
        );

        // Attendre que toutes les tâches soient terminées
        const results = await Promise.all(promises);

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        // Compter les succès et les échecs
        const successCount = results.filter(result => result.status === ProcessingStatus.SUCCESS).length;
        const failureCount = results.length - successCount;

        return {
            results,
            successCount,
            failureCount,
            totalProcessingTime: totalTime,
            averageTaskTime: totalTime / tasks.length
        };
    }

    /**
     * Ajoute une tâche à la file d'attente et démarre le traitement si nécessaire
     * @param task Tâche à ajouter
     */
    private addTask<T extends PyramidData>(task: ProcessingTask<T>): void {
        this.taskQueue.push(task as ProcessingTask<PyramidData>);
        this.metrics.queuedTasks = this.taskQueue.length;

        this.logger.debug('Task added to queue', {
            level: task.level,
            direction: task.direction,
            queueSize: this.taskQueue.length
        });

        // Démarrer le traitement si ce n'est pas déjà fait
        if (!this.isProcessing) {
            this.processNextTasks();
        }
    }

    /**
     * Traite les prochaines tâches dans la file d'attente
     */
    private async processNextTasks(): Promise<void> {
        if (this.isProcessing) return;

        this.isProcessing = true;

        try {
            // Tant qu'il y a des tâches et que nous n'avons pas atteint le maximum de concurrence
            while (this.taskQueue.length > 0 && this.activeTasksCount < this.options.maxConcurrency) {
                // Trier la file par priorité (plus élevée en premier)
                this.taskQueue.sort((a, b) => b.priority - a.priority);

                // Prendre la tâche suivante
                const task = this.taskQueue.shift();
                if (!task) break;

                this.metrics.queuedTasks = this.taskQueue.length;

                // Calculer le temps d'attente
                const queueTime = Date.now() - task.createdAt;
                this.queueTimesHistory.push(queueTime);

                // Limiter l'historique pour éviter une utilisation excessive de mémoire
                if (this.queueTimesHistory.length > 100) {
                    this.queueTimesHistory.shift();
                }

                // Mettre à jour la métrique de temps d'attente moyen
                this.metrics.averageQueueTime = this.queueTimesHistory.reduce((sum, time) => sum + time, 0) /
                    this.queueTimesHistory.length;

                // Vérifier si le niveau est parallélisable
                if (this.options.parallelizableLevels?.includes(task.level)) {
                    // Exécuter la tâche en mode parallèle
                    this.executeTask(task);
                } else {
                    // Exécuter la tâche en mode séquentiel (attendre la fin)
                    await this.executeTaskSequentially(task);
                }
            }
        } finally {
            // Si la file n'est pas vide et qu'il reste de la capacité, continuer le traitement
            if (this.taskQueue.length > 0 && this.activeTasksCount < this.options.maxConcurrency) {
                // Planifier le prochain traitement avec un léger délai pour éviter la récursion infinie
                setTimeout(() => this.processNextTasks(), 0);
            } else {
                this.isProcessing = false;
            }
        }
    }

    /**
     * Exécute une tâche en parallèle
     * @param task Tâche à exécuter
     */
    private executeTask(task: ProcessingTask<PyramidData>): void {
        // Incrémenter le compteur de tâches actives
        this.activeTasksCount++;
        this.activeTasks.add(task);

        this.metrics.activeTasks = this.activeTasksCount;

        // Mettre à jour le pic de concurrence
        if (this.activeTasksCount > this.metrics.peakConcurrentTasks) {
            this.metrics.peakConcurrentTasks = this.activeTasksCount;
        }

        // Enregistrer la concurrence actuelle pour le calcul de la moyenne
        this.concurrencyHistory.push(this.activeTasksCount);

        // Limiter l'historique de concurrence
        if (this.concurrencyHistory.length > 100) {
            this.concurrencyHistory.shift();
        }

        // Calculer la concurrence moyenne
        this.metrics.averageConcurrentTasks = this.concurrencyHistory.reduce((sum, count) => sum + count, 0) /
            this.concurrencyHistory.length;

        this.logger.debug('Executing task', {
            level: task.level,
            direction: task.direction,
            activeTasks: this.activeTasksCount
        });

        // Créer un timeout pour la tâche si nécessaire
        let timeoutId: NodeJS.Timeout | undefined;

        if (this.options.timeout && this.options.timeout > 0) {
            timeoutId = setTimeout(() => {
                // Si la tâche est encore active, la considérer comme échouée
                if (this.activeTasks.has(task)) {
                    this.activeTasks.delete(task);
                    this.activeTasksCount--;
                    this.metrics.activeTasks = this.activeTasksCount;

                    this.metrics.totalTasks++;
                    this.metrics.failedTasks++;
                    this.metrics.successRate = this.metrics.successfulTasks / this.metrics.totalTasks;

                    task.reject(new Error(`Task timed out after ${this.options.timeout}ms`));

                    // Continuer le traitement des tâches suivantes
                    if (this.taskQueue.length > 0) {
                        this.processNextTasks();
                    }
                }
            }, this.options.timeout);
        }

        // Incrémenter le compteur de tentatives
        task.attempts++;

        const startTime = Date.now();

        // Exécuter la tâche
        task.processFn(task.data, task.level, task.options)
            .then((result) => {
                // Annuler le timeout si nécessaire
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }

                // Calculer le temps de traitement
                const processingTime = Date.now() - startTime;
                this.processingTimesHistory.push(processingTime);

                // Limiter l'historique
                if (this.processingTimesHistory.length > 100) {
                    this.processingTimesHistory.shift();
                }

                // Mettre à jour la métrique de temps moyen
                this.metrics.averageProcessingTime = this.processingTimesHistory.reduce((sum, time) => sum + time, 0) /
                    this.processingTimesHistory.length;

                // Mettre à jour les métriques
                this.metrics.totalTasks++;
                this.metrics.successfulTasks++;
                this.metrics.successRate = this.metrics.successfulTasks / this.metrics.totalTasks;

                // Résoudre la promesse
                task.resolve(result);
            })
            .catch((error) => {
                // Annuler le timeout si nécessaire
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }

                // Vérifier si on doit réessayer
                const shouldRetry = this.options.retry &&
                    task.attempts < this.options.retry.attempts;

                if (shouldRetry) {
                    this.logger.debug(`Retrying task (attempt ${task.attempts + 1}/${this.options.retry!.attempts})`, {
                        level: task.level,
                        direction: task.direction,
                        error: error.message
                    });

                    // Calculer le délai avant réessai (avec backoff exponentiel)
                    const retryDelay = this.options.retry!.delay *
                        Math.pow(this.options.retry!.backoffFactor, task.attempts - 1);

                    // Remettre la tâche dans la file d'attente avec un délai
                    setTimeout(() => {
                        this.addTask(task);
                    }, retryDelay);
                } else {
                    // Mettre à jour les métriques
                    this.metrics.totalTasks++;
                    this.metrics.failedTasks++;
                    this.metrics.successRate = this.metrics.successfulTasks / this.metrics.totalTasks;

                    // Rejeter la promesse
                    task.reject(error);

                    this.logger.error('Task execution failed', {
                        level: task.level,
                        direction: task.direction,
                        attempts: task.attempts,
                        error: error.message
                    });
                }
            })
            .finally(() => {
                // Retirer la tâche des tâches actives
                this.activeTasks.delete(task);
                this.activeTasksCount--;
                this.metrics.activeTasks = this.activeTasksCount;

                // Continuer le traitement des tâches suivantes
                if (this.taskQueue.length > 0) {
                    this.processNextTasks();
                }
            });
    }

    /**
     * Exécute une tâche de manière séquentielle (attendre la fin avant de continuer)
     * @param task Tâche à exécuter
     */
    private async executeTaskSequentially(task: ProcessingTask<PyramidData>): Promise<void> {
        this.activeTasksCount++;
        this.activeTasks.add(task);
        this.metrics.activeTasks = this.activeTasksCount;

        this.logger.debug('Executing task sequentially', {
            level: task.level,
            direction: task.direction
        });

        const startTime = Date.now();

        try {
            // Incrémenter le compteur de tentatives
            task.attempts++;

            // Exécuter la tâche
            const result = await Promise.race([
                task.processFn(task.data, task.level, task.options),
                new Promise<never>((_, reject) => {
                    if (this.options.timeout && this.options.timeout > 0) {
                        setTimeout(() => {
                            reject(new Error(`Task timed out after ${this.options.timeout}ms`));
                        }, this.options.timeout);
                    }
                })
            ]);

            // Calculer le temps de traitement
            const processingTime = Date.now() - startTime;
            this.processingTimesHistory.push(processingTime);

            // Limiter l'historique
            if (this.processingTimesHistory.length > 100) {
                this.processingTimesHistory.shift();
            }

            // Mettre à jour la métrique de temps moyen
            this.metrics.averageProcessingTime = this.processingTimesHistory.reduce((sum, time) => sum + time, 0) /
                this.processingTimesHistory.length;

            // Mettre à jour les métriques
            this.metrics.totalTasks++;
            this.metrics.successfulTasks++;
            this.metrics.successRate = this.metrics.successfulTasks / this.metrics.totalTasks;

            // Résoudre la promesse
            task.resolve(result);

        } catch (error) {
            // Vérifier si on doit réessayer
            const shouldRetry = this.options.retry &&
                task.attempts < this.options.retry.attempts;

            if (shouldRetry) {
                this.logger.debug(`Retrying sequential task (attempt ${task.attempts + 1}/${this.options.retry!.attempts})`, {
                    level: task.level,
                    direction: task.direction,
                    error: (error as Error).message
                });

                // Réduire le compteur de tâches actives temporairement
                this.activeTasks.delete(task);
                this.activeTasksCount--;
                this.metrics.activeTasks = this.activeTasksCount;

                // Calculer le délai avant réessai (avec backoff exponentiel)
                const retryDelay = this.options.retry!.delay *
                    Math.pow(this.options.retry!.backoffFactor, task.attempts - 1);

                // Attendre avant de réessayer
                await new Promise(resolve => setTimeout(resolve, retryDelay));

                // Réessayer directement (sans passer par la file d'attente)
                await this.executeTaskSequentially(task);
                return;
            }

            // Mettre à jour les métriques
            this.metrics.totalTasks++;
            this.metrics.failedTasks++;
            this.metrics.successRate = this.metrics.successfulTasks / this.metrics.totalTasks;

            // Rejeter la promesse
            task.reject(error as Error);

            this.logger.error('Sequential task execution failed', {
                level: task.level,
                direction: task.direction,
                attempts: task.attempts,
                error: (error as Error).message
            });
        } finally {
            // Retirer la tâche des tâches actives
            this.activeTasks.delete(task);
            this.activeTasksCount--;
            this.metrics.activeTasks = this.activeTasksCount;
        }
    }

    /**
     * "Préchauffe" le système en préparant des tâches fréquentes
     * @param data Données à préchauffer
     * @param level Niveau de la pyramide
     * @param direction Direction (montante ou descendante)
     * @param processFn Fonction de traitement
     */
    public warmup<T extends PyramidData>(
        data: T,
        level: PyramidLevelType,
        direction: 'up' | 'down',
        processFn: (data: T, level: PyramidLevelType, options?: ProcessingOptions) => Promise<ProcessingResult<T>>
    ): void {
        const taskKey = `${level}:${direction}:${JSON.stringify(data)}`;

        if (this.warmupTasks[taskKey]) {
            // Déjà préchauffé
            return;
        }

        // Créer une tâche de préchauffage (mais ne pas l'exécuter pour l'instant)
        const task: ProcessingTask<T> = {
            data,
            level,
            direction,
            options: { priority: 'low' },  // Priorité basse pour le préchauffage
            priority: 1,  // Priorité basse
            createdAt: Date.now(),
            processFn,
            resolve: () => { }, // Fonction vide car utilisée uniquement pour le préchauffage
            reject: () => { },  // Fonction vide car utilisée uniquement pour le préchauffage
            attempts: 0
        };

        this.warmupTasks[taskKey] = task as ProcessingTask<PyramidData>;

        this.logger.debug('Task prepared for warmup', {
            level,
            direction
        });
    }

    /**
     * Obtient les métriques du traitement parallèle
     * @returns Métriques actuelles du traitement
     */
    public getMetrics(): ParallelProcessingMetrics {
        return { ...this.metrics }; // Retourner une copie
    }

    /**
     * Modifie dynamiquement le nombre maximum de tâches concurrentes
     * @param maxConcurrency Nouveau maximum de concurrence
     */
    public setMaxConcurrency(maxConcurrency: number): void {
        // Éviter les valeurs invalides
        if (maxConcurrency < 1) {
            maxConcurrency = 1;
        }

        this.options.maxConcurrency = maxConcurrency;
        this.logger.info(`Maximum concurrency updated to ${maxConcurrency}`);

        // Si la file n'est pas vide et que nous avons de la capacité, traiter les tâches
        if (this.taskQueue.length > 0 && this.activeTasksCount < this.options.maxConcurrency) {
            this.processNextTasks();
        }
    }

    /**
     * Annule toutes les tâches en cours et vide la file d'attente
     */
    public cancelAllTasks(): void {
        const error = new Error('Tasks cancelled by user');

        // Rejeter toutes les tâches en file d'attente
        this.taskQueue.forEach(task => {
            task.reject(error);
        });

        // Vider la file d'attente
        this.taskQueue = [];
        this.metrics.queuedTasks = 0;

        // Terminer toutes les tâches actives (elles se termineront naturellement)
        this.logger.info(`Cancelled ${this.taskQueue.length} queued tasks. ${this.activeTasksCount} active tasks will complete.`);
    }

    /**
     * Arrête proprement le manager de traitement parallèle
     */
    public shutdown(): Promise<void> {
        this.logger.info('Shutting down parallel processing manager...');

        // Annuler toutes les tâches en file d'attente
        this.cancelAllTasks();

        // Attendre que toutes les tâches actives se terminent
        return new Promise<void>((resolve) => {
            const checkInterval = setInterval(() => {
                if (this.activeTasksCount === 0) {
                    clearInterval(checkInterval);
                    this.logger.info('Parallel processing manager shutdown complete');
                    resolve();
                }
            }, 100);
        });
    }
}