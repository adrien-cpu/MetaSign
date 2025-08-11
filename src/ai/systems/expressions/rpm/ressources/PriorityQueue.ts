// src/ai/systems/expressions/rpm/ressources/PriorityQueue.ts

export class PriorityQueue<T> {
  private items: Array<PrioritizedItem<T>> = [];

  enqueue(item: T, priority: number): void {
    this.items.push({ item, priority });
    this.items.sort((a, b) => b.priority - a.priority);
  }

  dequeue(): T {
    if (this.isEmpty()) {
      throw new QueueError('Queue is empty');
    }
    return this.items.shift()!.item;
  }

  peek(): T {
    if (this.isEmpty()) {
      throw new QueueError('Queue is empty');
    }
    return this.items[0].item;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }

  contains(item: T, comparator: (a: T, b: T) => boolean): boolean {
    return this.items.some(qItem => comparator(qItem.item, item));
  }

  updatePriority(item: T, newPriority: number, comparator: (a: T, b: T) => boolean): void {
    const index = this.items.findIndex(qItem => comparator(qItem.item, item));
    if (index !== -1) {
      this.items[index].priority = newPriority;
      this.items.sort((a, b) => b.priority - a.priority);
    }
  }
}

interface PrioritizedItem<T> {
  item: T;
  priority: number;
}

// Exportation des interfaces pour réutilisation dans d'autres modules
export interface ResourceLimits {
  memory: number;
  gpu: number;
  cpu: number;
}

export interface PoolMetrics {
  utilization: number;
  fragmentation: number;
  efficiency: number;
}

export interface ResourceUsage {
  memory: number;
  gpu: number;
  cpu: number;
  timestamp: number;
}

export class QueueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QueueError';
  }
}