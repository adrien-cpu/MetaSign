// Types manquants à définir dans un fichier séparé
// src/ai/systems/expressions/situations/educational/special_needs/types.ts

export interface Participant {
    id: string;
    visual_acuity: number;
    visual_field?: {
        central: boolean;
        peripheral: boolean;
        complete: boolean;
    };
    tracking_ability?: {
        smooth: boolean;
        saccadic: boolean;
        score: number;
    };
    motor_skills?: {
        fine: {
            precision: number;
            control: number;
            fatigue_resistance: number;
        };
        gross: {
            range: number;
            strength: number;
            coordination: number;
        };
        endurance: {
            duration: number;
            recovery_rate: number;
        };
    };
    cognitive_processing?: {
        speed: {
            baseline: number;
            variability: number;
            fatigue_impact: number;
        };
        attention: {
            duration: number;
            quality: number;
            distractibility: number;
        };
        memory: {
            working: number;
            sequential: number;
            retention: number;
        };
    };
}

export interface NeedsAssessment {
    visual: VisualAssessment;
    motor: MotorAssessment;
    cognitive: CognitiveAssessment;
    combined_impact: CombinedImpact;
}

export interface VisualAssessment {
    acuity: {
        value: number;
        impacts: AcuityImpact[];
    };
    field: {
        coverage: FieldCoverage;
        limitations: string[];
    };
    tracking: {
        ability: number;
        adaptations: string[];
    };
}

export interface AcuityImpact {
    area: string;
    severity: number;
    adaptation: string;
}

export interface FieldCoverage {
    central: boolean;
    peripheral: boolean;
    complete: boolean;
}

export interface MotorAssessment {
    fine_motor: {
        precision: number;
        control: number;
        fatigue: number;
    };
    gross_motor: {
        range: number;
        strength: number;
        coordination: number;
    };
    endurance: {
        duration: number;
        recovery: number;
    };
}

export interface CognitiveAssessment {
    processing_speed: {
        baseline: number;
        variability: number;
        fatigue_impact: number;
    };
    attention: {
        duration: number;
        quality: number;
        distractibility: number;
    };
    memory: {
        working: number;
        sequential: number;
        retention: number;
    };
}

export interface Impact {
    area: string;
    severity: number;
    description: string;
    mitigation?: string;
}

export type InteractionEffect = 'amplifying' | 'mitigating' | 'neutral' | 'complex';

// Réutilisation des interfaces déjà définies dans le fichier original
export interface Assessment {
    type: string;
    severity: number;
    impacts: Impact[];
}

export interface CombinedImpact {
    interactions: NeedsInteraction[];
    priorities: Priority[];
    strategies: CombinedStrategy[];
    overall_impact: number;
}

export interface NeedsInteraction {
    needs: string[];
    effect: InteractionEffect;
    severity: number;
}

export interface Priority {
    need: string;
    level: number;
    rationale: string;
}

export interface CombinedStrategy {
    needs: string[];
    approach: string;
    effectiveness: number;
}