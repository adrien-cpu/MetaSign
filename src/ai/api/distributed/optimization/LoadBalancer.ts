// src/ai/api/distributed/optimization/LoadBalancer.ts
export interface WorkerStatus {
    id: string;
    cpuLoad: number;
    memoryUsage: number;
    activeTaskCount: number;
    availableCapacity: number;
}

export interface Task {
    id: string;
    type: string;
    priority: number;
    data: unknown;
    estimatedComplexity: number;
}

export class LoadBalancer {
    private workers: Map<string, WorkerStatus> = new Map();
    private taskQueue: Task[] = [];
    private taskAssignments: Map<string, string> = new Map(); // TaskId -> WorkerId

    registerWorker(status: WorkerStatus): void {
        this.workers.set(status.id, status);
        this.processQueue(); // Traitement de la file d'attente quand un nouveau worker est disponible
    }

    updateWorkerStatus(status: WorkerStatus): void {
        this.workers.set(status.id, status);
    }

    unregisterWorker(workerId: string): void {
        this.workers.delete(workerId);

        // Réassigner les tâches de ce worker
        for (const [taskId, assignedWorkerId] of this.taskAssignments.entries()) {
            if (assignedWorkerId === workerId) {
                this.taskAssignments.delete(taskId);
                const task = this.findTaskById(taskId);
                if (task) {
                    this.taskQueue.push(task);
                }
            }
        }

        this.processQueue();
    }

    queueTask(task: Task): string {
        this.taskQueue.push(task);
        this.processQueue();
        return task.id;
    }

    getWorkerForTask(taskId: string): string | null {
        return this.taskAssignments.get(taskId) || null;
    }

    private processQueue(): void {
        if (this.taskQueue.length === 0 || this.workers.size === 0) {
            return;
        }

        // Trier la file d'attente par priorité
        this.taskQueue.sort((a, b) => b.priority - a.priority);

        // Pour chaque tâche, trouver le worker le plus approprié
        const processedTasks: Task[] = [];

        for (const task of this.taskQueue) {
            const workerId = this.findBestWorkerForTask(task);
            if (workerId) {
                this.assignTaskToWorker(task, workerId);
                processedTasks.push(task);
            }
        }

        // Retirer les tâches traitées de la file
        this.taskQueue = this.taskQueue.filter(task => !processedTasks.includes(task));
    }

    private findBestWorkerForTask(task: Task): string | null {
        let bestWorkerId: string | null = null;
        let bestScore = -Infinity;

        for (const [workerId, status] of this.workers.entries()) {
            if (status.availableCapacity < task.estimatedComplexity) {
                continue; // Ce worker n'a pas assez de capacité
            }

            // Calcul d'un score pour ce worker (plus élevé = meilleur)
            const score = this.calculateWorkerScore(status, task);

            if (score > bestScore) {
                bestScore = score;
                bestWorkerId = workerId;
            }
        }

        return bestWorkerId;
    }

    private calculateWorkerScore(worker: WorkerStatus, task: Task): number {
        // Formule simple pour pondérer capacité disponible et charge actuelle
        const capacityScore = worker.availableCapacity / task.estimatedComplexity;
        const loadScore = 1 - (worker.cpuLoad * 0.7 + worker.memoryUsage * 0.3);

        return capacityScore * 0.6 + loadScore * 0.4;
    }

    private assignTaskToWorker(task: Task, workerId: string): void {
        this.taskAssignments.set(task.id, workerId);

        // Mettre à jour la capacité disponible du worker
        const worker = this.workers.get(workerId)!;
        worker.activeTaskCount++;
        worker.availableCapacity -= task.estimatedComplexity;

        console.log(`Assigned task ${task.id} to worker ${workerId}`);
    }

    private findTaskById(taskId: string): Task | undefined {
        return this.taskQueue.find(task => task.id === taskId);
    }
}