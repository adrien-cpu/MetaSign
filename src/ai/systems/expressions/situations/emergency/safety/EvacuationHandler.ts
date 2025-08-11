// src/ai/systems/expressions/situations/emergency/safety/EvacuationHandler.ts

import {
  EvacuationSituation,
  EvacuationContext,
  EvacuationResponse,
  InitializationResult,
  SignalingResult,
  GroupOrganizationResult,
  MovementResult,
  AssemblyResult,
  EvacuationMetrics,
  Hazard
} from './handler.types';

interface EvacuationGroup {
  id: string;
  size: number;
  composition: string[];
  assigned_route: string;
}

interface MovementMonitor {
  trackGroup(group: EvacuationGroup): Promise<void>;
  getProgress(): Promise<Record<string, number>>;
}

interface SafetyValidator {
  validateRoute(routeId: string): Promise<boolean>;
  checkHazards(location: string): Promise<string[]>;
}

export class EvacuationHandler {
  private readonly movementMonitor: MovementMonitor;
  private readonly safetyValidator: SafetyValidator;

  constructor(
    movementMonitor: MovementMonitor,
    safetyValidator: SafetyValidator
  ) {
    this.movementMonitor = movementMonitor;
    this.safetyValidator = safetyValidator;
  }

  async handleEvacuation(
    situation: EvacuationSituation,
    context: EvacuationContext
  ): Promise<EvacuationResponse> {
    const initialization = await this.initializeEvacuation(situation, context);
    const signaling = await this.manageEvacuationSignals(initialization);
    const groupOrganization = await this.organizeGroups(initialization);
    const movement = await this.manageEvacuationMovement(groupOrganization);
    const assembly = await this.manageAssemblyPoint(movement);

    return {
      status: this.determineEvacuationStatus(assembly),
      phases: {
        initialization,
        signaling,
        groupOrganization,
        movement,
        assembly
      },
      metrics: await this.calculateEvacuationMetrics({
        initialization,
        signaling,
        groupOrganization,
        movement,
        assembly
      })
    };
  }

  private determineEvacuationStatus(assembly: AssemblyResult): 'completed' | 'in_progress' | 'failed' {
    if (assembly.headcount.missing > 0) {
      return 'in_progress';
    }
    return assembly.status === 'completed' ? 'completed' : 'in_progress';
  }

  private assessRiskLevels(hazards: Hazard[]): Record<string, number> {
    return hazards.reduce((levels, hazard) => ({
      ...levels,
      [hazard.type]: hazard.severity
    }), {} as Record<string, number>);
  }

  private async initializeEvacuation(
    situation: EvacuationSituation,
    context: EvacuationContext
  ): Promise<InitializationResult> {
    const hazardAssessment = {
      identified_hazards: situation.hazards,
      risk_levels: this.assessRiskLevels(situation.hazards)
    };

    const resourceAllocation = {
      assigned_personnel: context.resources.personnel,
      assigned_equipment: context.resources.equipment
    };

    return {
      status: 'completed',
      hazard_assessment: hazardAssessment,
      resource_allocation: resourceAllocation
    };
  }

  private async manageEvacuationSignals(
    initialization: InitializationResult
  ): Promise<SignalingResult> {
    const hazards = initialization.hazard_assessment.identified_hazards;
    const highRiskZones = hazards.filter(h => h.severity > 0.7).map(h => h.location);

    return {
      status: 'completed',
      coverage: {
        zones_reached: highRiskZones,
        confirmation_rate: 0.85
      },
      effectiveness: {
        comprehension_rate: 0.9,
        response_time: highRiskZones.length > 0 ? 15 : 30
      }
    };
  }

  private async organizeGroups(
    initialization: InitializationResult
  ): Promise<GroupOrganizationResult> {
    const personnel = initialization.resource_allocation.assigned_personnel;
    const equipmentCount = initialization.resource_allocation.assigned_equipment.length;
    const maxGroupSize = Math.ceil(personnel.length / equipmentCount);

    return {
      status: 'completed',
      groups: Array.from({ length: equipmentCount }, (_, i) => ({
        id: `group_${i}`,
        size: maxGroupSize,
        composition: ['standard'],
        assigned_route: `route_${i}`
      })),
      distribution: {
        by_route: { main: maxGroupSize * equipmentCount },
        by_type: { standard: equipmentCount }
      }
    };
  }

  private async manageEvacuationMovement(
    groupOrganization: GroupOrganizationResult
  ): Promise<MovementResult> {
    const groups = groupOrganization.groups;
    const progressByGroup = await Promise.all(
      groups.map(async (group) => {
        const progress = await this.movementMonitor.getProgress();
        return {
          routeId: group.assigned_route,
          progress: Object.values(progress)[0] || 0
        };
      })
    );

    return {
      status: 'completed',
      progress: progressByGroup.map(p => ({
        route_id: p.routeId,
        completion: p.progress,
        current_load: 20
      })),
      bottlenecks: []
    };
  }

  private async manageAssemblyPoint(
    movement: MovementResult
  ): Promise<AssemblyResult> {
    const completedGroups = movement.progress.filter(p => p.completion >= 1).length;
    const totalGroups = movement.progress.length;

    return {
      status: completedGroups === totalGroups ? 'completed' : 'in_progress',
      headcount: {
        total_present: completedGroups * 20,
        missing: (totalGroups - completedGroups) * 20,
        by_zone: { assembly_point_1: completedGroups * 20 }
      },
      organization: {
        zones: [{
          id: 'assembly_point_1',
          capacity: totalGroups * 25,
          occupancy: completedGroups * 20,
          status: completedGroups === totalGroups ? 'READY' : 'RECEIVING'
        }],
        services: []
      }
    };
  }

  private async calculateEvacuationMetrics(phases: {
    initialization: InitializationResult;
    signaling: SignalingResult;
    groupOrganization: GroupOrganizationResult;
    movement: MovementResult;
    assembly: AssemblyResult;
  }): Promise<EvacuationMetrics> {
    const totalGroups = phases.groupOrganization.groups.length;
    const completedGroups = phases.movement.progress.filter(p => p.completion >= 1).length;
    const evacuationRate = completedGroups / totalGroups;

    return {
      total_time: phases.assembly.headcount.total_present > 0 ? 300 : 0,
      evacuation_rate: evacuationRate,
      safety_score: evacuationRate * phases.signaling.effectiveness.comprehension_rate,
      efficiency_metrics: {
        route_utilization: evacuationRate,
        resource_efficiency: phases.assembly.headcount.total_present /
          (phases.initialization.resource_allocation.assigned_personnel.length * 100),
        coordination_score: phases.signaling.effectiveness.comprehension_rate
      }
    };
  }
}