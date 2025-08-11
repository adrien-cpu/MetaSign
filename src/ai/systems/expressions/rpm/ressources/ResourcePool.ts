// src/ai/systems/expressions/rpm/resources/ResourcePool.ts

export class ResourcePool {
  private resources: PooledResources;
  private allocations: Map<string, ResourceAllocation>;
  private readonly BUFFER_RATIO = 0.1; // 10% buffer

  constructor() {
    this.resources = this.initializePool();
    this.allocations = new Map();
  }

  async allocate(request: ResourceRequest): Promise<ResourceAllocation> {
    // Vérification de la disponibilité
    if (!this.canAllocate(request)) {
      throw new ResourcePoolError('Insufficient resources');
    }

    // Création de l'allocation
    const allocation = await this.createAllocation(request);
    
    // Réservation des ressources
    this.reserveResources(allocation);
    
    // Enregistrement de l'allocation
    this.allocations.set(allocation.id, allocation);

    return allocation;
  }

  async release(allocation: ResourceAllocation): Promise<void> {
    // Vérification de l'existence de l'allocation
    if (!this.allocations.has(allocation.id)) {
      throw new ResourcePoolError('Allocation not found');
    }

    // Libération des ressources
    this.freeResources(allocation);
    
    // Suppression de l'enregistrement
    this.allocations.delete(allocation.id);
  }

  async update(usage: ResourceUsage): Promise<void> {
    // Mise à jour des ressources disponibles
    this.resources.available = this.calculateAvailable(usage);
    
    // Vérification des dépassements
    await this.checkOverallocation();
    
    // Mise à jour des métriques
    this.updateMetrics(usage);
  }

  private initializePool(): PooledResources {
    return {
      total: this.detectTotalResources(),
      available: this.detectTotalResources(),
      reserved: {
        memory: 0,
        gpu: 0,
        cpu: 0
      },
      metrics: {
        utilization: 0,
        fragmentation: 0,
        efficiency: 1
      }
    };
  }

  private canAllocate(request: ResourceRequest): boolean {
    const available = this.resources.available;
    const buffer = this.calculateBuffer();

    return (
      available.memory - buffer.memory >= request.memory &&
      available.gpu - buffer.gpu >= request.gpu &&
      available.cpu - buffer.cpu >= request.cpu
    );
  }

  private async createAllocation(
    request: ResourceRequest
  ): Promise<ResourceAllocation> {
    return {
      id: crypto.randomUUID(),
      resources: {
        memory: request.memory,
        gpu: request.gpu,
        cpu: request.cpu
      },
      performance: await this.estimatePerformance(request),
      quality: await this.estimateQuality(request)
    };
  }

  private reserveResources(allocation: ResourceAllocation): void {
    const { memory, gpu, cpu } = allocation.resources;
    
    this.resources.available.memory -= memory;
    this.resources.available.gpu -= gpu;
    this.resources.available.cpu -= cpu;
    
    this.resources.reserved.memory += memory;
    this.resources.reserved.gpu += gpu;
    this.resources.reserved.cpu += cpu;
  }
}