// src/ai/learning/fine-tuning/utils/ThreadPool.ts

import { Worker } from 'worker_threads';
import * as os from 'os';
import { Logger } from '@ai/utils/Logger';
import * as path from 'path';

/**
 * Tâche à exécuter dans le pool de threads
 */
interface Task<T> {
    /** ID unique de la tâche */
    id: string;
    /** Code de la fonction à exécuter */
    code: string;
    /** Arguments pour la fonction */
    args: unknown[];
    /** Callback de résolution */
    resolve: (result: T) => void;
    /** Callback de rejet */
    reject: (error: Error) => void;
    /** Priorité de la tâche (plus le nombre est élevé, plus la priorité est haute) */
    priority: number;
}

/**
 * Métriques de performance du pool de threads
 */
interface ThreadPoolMetrics {
    /** Nombre total de tâches exécutées */
    totalTasksExecuted: number;
    /** Nombre de tâches en attente */
    pendingTasks: number;
    /** Nombre de workers actifs */
    activeWorkers: number;
    /** Nombre total de workers */
    totalWorkers: number;
    /** Temps moyen d'exécution des tâches (ms) */
    averageExecutionTime: number;
    /** Utilisation CPU estimée (0-100) */
    cpuUtilization: number;
    /** Tâches par seconde */
    throughput: number;
}

/**
 * Pool de threads pour exécuter des tâches en parallèle
 */
export class ThreadPool {
    private readonly logger = new Logger('ThreadPool');
    private readonly workers: Worker[] = [];
    private readonly tasks: Task<unknown>[] = [];
    private readonly workerStatus: Map<number, { busy: boolean; taskId?: string }> = new Map();
    private readonly executionTimes: number[] = [];
    private readonly taskStartTimes: Map<string, number> = new Map();
    private readonly maxExecutionTimesHistory = 100;

    private metrics: ThreadPoolMetrics = {
        totalTasksExecuted: 0,
        pendingTasks: 0,
        activeWorkers: 0,
        totalWorkers: 0,
        averageExecutionTime: 0,
        cpuUtilization: 0,
        throughput: 0
    };

    private throughputHistory: { timestamp: number; tasksCompleted: number }[] = [];
    private isShutdown = false;
    private metricsUpdateInterval: NodeJS.Timeout | null = null;

    /**
     * Crée un nouveau pool de threads
     * @param numThreads Nombre de threads à créer (par défaut: auto-détecté)
     */
    constructor(
        private readonly numThreads: number = Math.max(2, Math.min(os.cpus().length - 1, 8))
    ) {
        this.initializeWorkers();
        this.startMetricsUpdateInterval();

        this.logger.info(`Thread pool initialized with ${this.numThreads} workers`);
    }

    /**
     * Initialise les workers du pool
     */
    private initializeWorkers(): void {
        for (let i = 0; i < this.numThreads; i++) {
            this.createWorker(i);
        }
    }

    /**
     * Crée un worker et l'ajoute au pool
     * @param id Identifiant du worker
     */
    private createWorker(id: number): void {
        // Créer un nouveau worker exécutant le script worker
        const worker = new Worker(path.join(__dirname, 'workerScript.js'));

        // Initialiser le statut du worker
        this.workerStatus.set(id, { busy: false });

        // Gérer les messages du worker
        worker.on('message', (message: { type: string; taskId: string; result?: unknown; error?: string }) => {
            if (message.type === 'task_completed') {
                this.handleTaskCompletion(id, message.taskId, message.result);
            } else if (message.type === 'task_failed') {
                this.handleTaskFailure(id, message.taskId, new Error(message.error || 'Unknown error'));
            } else if (message.type === 'worker_ready') {
                this.logger.debug(`Worker ${id} is ready`);
            }
        });

        // Gérer les erreurs du worker
        worker.on('error', (error) => {
            this.logger.error(`Worker ${id} encountered an error`, error);

            // Marquer le worker comme non occupé pour permettre de réassigner des tâches
            const status = this.workerStatus.get(id);

            if (status && status.busy && status.taskId) {
                const taskIndex = this.tasks.findIndex(task => task.id === status.taskId);

                if (taskIndex !== -1) {
                    const task = this.tasks[taskIndex];
                    task.reject(error);
                    this.tasks.splice(taskIndex, 1);
                }
            }

            // Recréer le worker si le pool n'est pas en cours d'arrêt
            if (!this.isShutdown) {
                this.workers[id].terminate();
                this.workers[id] = null as any;
                this.workerStatus.delete(id);

                setTimeout(() => {
                    this.createWorker(id);
                }, 1000);
            }
        });

        // Gérer la fin du worker
        worker.on('exit', (code) => {
            this.logger.debug(`Worker ${id} exited with code ${code}`);

            // Recréer le worker si le pool n'est pas en cours d'arrêt
            if (!this.isShutdown && code !== 0) {
                setTimeout(() => {
                    this.createWorker(id);
                }, 1000);
            }
        });

        // Ajouter le worker au pool
        this.workers[id] = worker;

        // Mettre à jour les métriques
        this.metrics.totalWorkers = this.workers.filter(Boolean).length;
    }

    /**
     * Démarre l'intervalle de mise à jour des métriques
     */
    private startMetricsUpdateInterval(): void {
        this.metricsUpdateInterval = setInterval(() => {
            this.updateMetrics();
        }, 1000);
    }

    /**
     * Met à jour les métriques du pool
     */
    private updateMetrics(): void {
        // Calculer le nombre de workers actifs
        const activeWorkers = Array.from(this.workerStatus.values()).filter(status => status.busy).length;

        // Mettre à jour les métriques de base
        this.metrics.pendingTasks = this.tasks.length;
        this.metrics.activeWorkers = activeWorkers;

        // Calculer le temps d'exécution moyen
        if (this.executionTimes.length > 0) {
            this.metrics.averageExecutionTime = this.executionTimes.reduce((sum, time) => sum + time, 0) /
                this.executionTimes.length;
        }

        // Calculer le throughput (tâches par seconde)
        const now = Date.now();
        // Supprimer les entrées plus anciennes que 10 secondes
        this.throughputHistory = this.throughputHistory.filter(entry => now - entry.timestamp < 10000);

        if (this.throughputHistory.length >= 2) {
            const oldestEntry = this.throughputHistory[0];
            const newestEntry = this.throughputHistory[this.throughputHistory.length - 1];
            const timeSpanSeconds = (newestEntry.timestamp - oldestEntry.timestamp) / 1000;

            if (timeSpanSeconds > 0) {
                const tasksCompleted = newestEntry.tasksCompleted - oldestEntry.tasksCompleted;
                this.metrics.throughput = tasksCompleted / timeSpanSeconds;
            }
        }

        // Estimer l'utilisation CPU
        // Utilisation simple basée sur le rapport entre workers actifs et total
        this.metrics.cpuUtilization = (activeWorkers / this.numThreads) * 100;
    }

    /**
     * Exécute une fonction dans un thread du pool
     * @param fn Fonction à exécuter (sera sérialisée)
     * @param args Arguments pour la fonction
     * @param priority Priorité de la tâche
     * @returns Promise avec le résultat de la fonction
     */
    public run<T>(fn: (...args: any[]) => T, args: unknown[] = [], priority: number = 0): Promise<T> {
        if (this.isShutdown) {
            return Promise.reject(new Error('Thread pool is shut down'));
        }

        return new Promise<T>((resolve, reject) => {
            // Créer une tâche avec un ID unique
            const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Transformer la fonction en chaîne de caractères
            const fnString = fn.toString();

            // Créer le code à exécuter
            const code = `
        const fn = ${fnString};
        try {
          const result = fn(...args);
          if (result instanceof Promise) {
            return result;
          } else {
            return Promise.resolve(result);
          }
        } catch (error) {
          return Promise.reject(error);
        }
      `;

            // Ajouter la tâche à la file d'attente
            this.tasks.push({
                id: taskId,
                code,
                args,
                resolve: resolve as (result: unknown) => void,
                reject,
                priority
            });

            // Enregistrer l'heure de début pour mesurer le temps d'exécution
            this.taskStartTimes.set(taskId, Date.now());

            // Mettre à jour les métriques
            this.metrics.pendingTasks = this.tasks.length;

            // Trier les tâches par priorité
            this.tasks.sort((a, b) => b.priority - a.priority);

            // Tenter d'attribuer la tâche à un worker disponible
            this.assignTasksToWorkers();
        });
    }

    /**
     * Attribue des tâches aux workers disponibles
     */
    private assignTasksToWorkers(): void {
        // Si pas de tâches, rien à faire
        if (this.tasks.length === 0) {
            return;
        }

        // Parcourir tous les workers
        for (let i = 0; i < this.workers.length; i++) {
            // Vérifier si le worker existe et n'est pas occupé
            if (!this.workers[i]) continue;

            const status = this.workerStatus.get(i);

            if (status && !status.busy && this.tasks.length > 0) {
                // Prendre la tâche suivante (la plus prioritaire, après le tri)
                const task = this.tasks.shift() as Task<unknown>;

                // Marquer le worker comme occupé
                status.busy = true;
                status.taskId = task.id;

                // Envoyer la tâche au worker
                this.workers[i].postMessage({
                    type: 'execute_task',
                    taskId: task.id,
                    code: task.code,
                    args: task.args
                });

                // Mettre à jour les métriques
                this.metrics.pendingTasks = this.tasks.length;
                this.metrics.activeWorkers = Array.from(this.workerStatus.values()).filter(s => s.busy).length;
            }
        }
    }

    /**
     * Gère la complétion d'une tâche
     * @param workerId ID du worker
     * @param taskId ID de la tâche
     * @param result Résultat de la tâche
     */
    private handleTaskCompletion(workerId: number, taskId: string, result: unknown): void {
        // Trouver la tâche dans l'historique des temps de début
        const startTime = this.taskStartTimes.get(taskId);

        if (startTime) {
            // Calculer le temps d'exécution
            const executionTime = Date.now() - startTime;

            // Ajouter à l'historique des temps d'exécution
            this.executionTimes.push(executionTime);

            // Limiter la taille de l'historique
            if (this.executionTimes.length > this.maxExecutionTimesHistory) {
                this.executionTimes.shift();
            }

            // Nettoyer
            this.taskStartTimes.delete(taskId);
        }

        // Mettre à jour le statut du worker
        const status = this.workerStatus.get(workerId);

        if (status) {
            status.busy = false;
            status.taskId = undefined;
        }

        // Trouver le callback de résolution
        const task = this.tasks.find(t => t.id === taskId);

        if (task) {
            // Résoudre la promesse
            task.resolve(result);

            // Supprimer la tâche de la liste
            const index = this.tasks.indexOf(task);
            if (index !== -1) {
                this.tasks.splice(index, 1);
            }
        }

        // Mettre à jour les métriques
        this.metrics.totalTasksExecuted++;
        this.throughputHistory.push({
            timestamp: Date.now(),
            tasksCompleted: this.metrics.totalTasksExecuted
        });

        // Essayer d'attribuer de nouvelles tâches
        this.assignTasksToWorkers();
    }

    /**
     * Gère l'échec d'une tâche
     * @param workerId ID du worker
     * @param taskId ID de la tâche
     * @param error Erreur survenue
     */
    private handleTaskFailure(workerId: number, taskId: string, error: Error): void {
        this.logger.error(`Task ${taskId} failed:`, error);

        // Mettre à jour le statut du worker
        const status = this.workerStatus.get(workerId);

        if (status) {
            status.busy = false;
            status.taskId = undefined;
        }

        // Trouver le callback de rejet
        const task = this.tasks.find(t => t.id === taskId);

        if (task) {
            // Rejeter la promesse
            task.reject(error);

            // Supprimer la tâche de la liste
            const index = this.tasks.indexOf(task);
            if (index !== -1) {
                this.tasks.splice(index, 1);
            }
        }

        // Nettoyer
        this.taskStartTimes.delete(taskId);

        // Essayer d'attribuer de nouvelles tâches
        this.assignTasksToWorkers();
    }

    /**
     * Obtient les métriques actuelles du pool
     * @returns Métriques du pool de threads
     */
    public getMetrics(): ThreadPoolMetrics {
        return { ...this.metrics };
    }

    /**
     * Obtient l'utilisation CPU actuelle estimée
     * @returns Utilisation CPU (0-100)
     */
    public getUtilization(): number {
        return this.metrics.cpuUtilization;
    }

    /**
     * Arrête le pool de threads et termine tous les workers
     */
    public shutdown(): void {
        if (this.isShutdown) {
            return;
        }

        this.isShutdown = true;

        // Arrêter l'intervalle de mise à jour des métriques
        if (this.metricsUpdateInterval) {
            clearInterval(this.metricsUpdateInterval);
            this.metricsUpdateInterval = null;
        }

        // Rejeter toutes les tâches en attente
        for (const task of this.tasks) {
            task.reject(new Error('Thread pool is shutting down'));
        }

        this.tasks.length = 0;

        // Terminer tous les workers
        for (const worker of this.workers) {
            if (worker) {
                worker.terminate();
            }
        }

        this.workers.length = 0;
        this.workerStatus.clear();

        this.logger.info('Thread pool shut down');
    }
}