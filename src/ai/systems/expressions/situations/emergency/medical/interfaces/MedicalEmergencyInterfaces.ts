// src/ai/systems/expressions/situations/emergency/medical/interfaces/MedicalEmergencyInterfaces.ts

// Types de base pour la localisation et les ressources
export interface Location {
  zone: string;
  floor: number;
  details?: string;
  accessibility: {
    visual: 'CLEAR' | 'PARTIAL' | 'OBSTRUCTED';
    physical: 'EASY' | 'MODERATE' | 'DIFFICULT';
  };
}

export interface VictimStatus {
  consciousness: 'ALERT' | 'RESPONSIVE' | 'UNRESPONSIVE';
  breathing: 'NORMAL' | 'LABORED' | 'ABSENT';
  circulation: 'NORMAL' | 'COMPROMISED' | 'ABSENT';
  additional?: {
    bleeding?: 'NONE' | 'MILD' | 'SEVERE';
    mobility?: 'NORMAL' | 'RESTRICTED' | 'IMMOBILE';
    pain?: {
      level: number;
      location: string;
    };
  };
}

// Types pour le gestionnaire d'urgence médicale
export interface EmergencyContext {
  environment: 'INDOOR' | 'OUTDOOR';
  lighting: 'ADEQUATE' | 'LOW' | 'VARIABLE';
  availableResources: MedicalResource[];
  personnel: MedicalPersonnel[];
  constraints: EmergencyConstraints;
}

export interface EmergencyConstraints {
  visual: VisualConstraint[];
  spatial: SpatialConstraint[];
  temporal: TemporalConstraint[];
}

export interface EmergencyResponse {
  initialAlert: {
    signal: SignalComponents;
    clarityScore: number;
    receptionConfirmation: boolean;
  };
  actionPlan: EmergencyActionPlan;
  statusTracking: StatusTracking;
}

export interface EmergencyActionPlan {
  immediateSteps: ActionStep[];
  resourceAllocation: ResourceAllocation;
  communicationStrategy: CommunicationStrategy;
}

export interface StatusTracking {
  timeline: TimelineEvent[];
  effectivenessMetrics: EffectivenessMetrics;
  adjustments: ResponseAdjustment[];
}

// Types pour les composants de signalisation
export interface SignalComponents {
  attentionGetting: {
    type: 'WAVE' | 'FLASH' | 'MOVEMENT';
    intensity: 'MAXIMUM' | 'HIGH' | 'MODERATE';
    duration: number;
    repetitions: number;
  };
  informationConveyance: {
    primaryMessage: SignalMessage;
    supportingElements: SignalElement[];
    confirmationRequired: boolean;
  };
  spatialCharacteristics: {
    range: 'SHORT' | 'MEDIUM' | 'LONG';
    coverage: 'FOCUSED' | 'BROAD' | 'OMNIDIRECTIONAL';
    positioning: SpatialPosition;
  };
}

export interface SignalEffectiveness {
  visibility: number;
  comprehension: number;
  responseTime: number;
  maintenance: {
    duration: number;
    quality: number;
    degradationRate?: number;
  };
}

// Types pour la coordination d'urgence
export interface CoordinationState {
  activeRoles: Map<string, RoleAssignment>;
  resourceStatus: Map<string, ResourceStatus>;
  communicationChannels: CommunicationChannel[];
  spatialOrganization: SpatialOrganization;
}

export interface RoleAssignment {
  role: string;
  personnel: MedicalPersonnel;
  responsibilities: string[];
  location: Location;
  communication: {
    primaryChannel: string;
    backupChannel: string;
    reportingTo: string[];
  };
}

export interface SpatialOrganization {
  zones: EmergencyZone[];
  accessRoutes: AccessRoute[];
  restrictedAreas: RestrictedArea[];
}

// Types de mise à jour et communication
export interface CoordinationUpdate {
  type: 'RESOURCE' | 'PERSONNEL' | 'SITUATION' | 'ENVIRONMENT';
  timestamp: number;
  changes: {
    added?: MedicalResource[];
    removed?: MedicalResource[];
    modified?: MedicalResource[];
  };
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

// Types de base
export interface MedicalResource {
  id: string;
  type: string;
  status: string;
  location: string;
}

export interface MedicalPersonnel {
  id: string;
  role: string;
  skills: string[];
  location: string;
}

export interface VisualConstraint {
  type: string;
  threshold: number;
  impact: string;
}

export interface SpatialConstraint {
  area: string;
  restriction: string;
  duration: number;
}

export interface TemporalConstraint {
  phase: string;
  maxDuration: number;
  priority: number;
}

export interface ActionStep {
  id: string;
  description: string;
  priority: number;
  dependencies?: string[];
}

export interface ResourceAllocation {
  resourceId: string;
  assignedTo: string;
  duration: number;
}

export interface CommunicationStrategy {
  channels: string[];
  frequency: number;
  priority: string;
}

export interface TimelineEvent {
  timestamp: number;
  type: string;
  details: Record<string, string>;
}

export interface EffectivenessMetrics {
  responseTime: number;
  coverageRate: number;
  successRate: number;
}

export interface ResponseAdjustment {
  trigger: string;
  action: string;
  impact: string;
}

export interface SignalMessage {
  content: string;
  priority: number;
  repetitions: number;
}

export interface SignalElement {
  type: string;
  timing: number;
  intensity: number;
}

export interface SpatialPosition {
  coordinates: number[];
  orientation: string;
}

export interface ResourceStatus {
  availability: string;
  condition: string;
  nextMaintenance: number;
}

export interface CommunicationChannel {
  type: string;
  status: string;
  bandwidth: number;
}

export interface EmergencyZone {
  id: string;
  status: string;
  capacity: number;
}

export interface AccessRoute {
  id: string;
  status: string;
  capacity: number;
}

export interface RestrictedArea {
  id: string;
  reason: string;
  duration: number;
}