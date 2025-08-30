/**
 * Gestionnaire de configuration pour le système CODA
 * @file config/CODAConfigManager.ts
 */

export interface CODASystemConfig {
    readonly personality?: {
        readonly enthusiasmLevel?: number;
        readonly patienceLevel?: number;
        readonly creativityLevel?: number;
        readonly culturalBackground?: 'deaf-native' | 'hearing-learning' | 'mixed';
    };
    readonly learning?: {
        readonly adaptiveSpeed?: number;
        readonly errorTolerance?: number;
        readonly memoryRetention?: number;
        readonly preferredLearningStyle?: 'visual' | 'kinesthetic' | 'mixed';
    };
    readonly simulation?: {
        readonly realismLevel?: number;
        readonly errorSimulationRate?: number;
        readonly progressVariability?: number;
    };
    readonly interaction?: {
        readonly responseLatency?: number;
        readonly verbosityLevel?: number;
        readonly questionFrequency?: number;
        readonly encouragementStyle?: 'formal' | 'casual' | 'enthusiastic';
    };
}

export class CODAConfigManager {
    private readonly config: Required<CODASystemConfig>;

    constructor(userConfig: CODASystemConfig = {}) {
        this.config = this.createCompleteConfig(userConfig);
    }

    public getPersonalityConfig(): Required<CODASystemConfig>['personality'] {
        return this.config.personality;
    }

    public getLearningConfig(): Required<CODASystemConfig>['learning'] {
        return this.config.learning;
    }

    public getSimulationConfig(): Required<CODASystemConfig>['simulation'] {
        return this.config.simulation;
    }

    public getInteractionConfig(): Required<CODASystemConfig>['interaction'] {
        return this.config.interaction;
    }

    public getFullConfig(): Required<CODASystemConfig> {
        return { ...this.config };
    }

    private createCompleteConfig(partial: CODASystemConfig): Required<CODASystemConfig> {
        return {
            personality: {
                enthusiasmLevel: partial.personality?.enthusiasmLevel ?? 0.7,
                patienceLevel: partial.personality?.patienceLevel ?? 0.8,
                creativityLevel: partial.personality?.creativityLevel ?? 0.6,
                culturalBackground: partial.personality?.culturalBackground ?? 'hearing-learning'
            },
            learning: {
                adaptiveSpeed: partial.learning?.adaptiveSpeed ?? 0.6,
                errorTolerance: partial.learning?.errorTolerance ?? 0.4,
                memoryRetention: partial.learning?.memoryRetention ?? 0.7,
                preferredLearningStyle: partial.learning?.preferredLearningStyle ?? 'visual'
            },
            simulation: {
                realismLevel: partial.simulation?.realismLevel ?? 0.8,
                errorSimulationRate: partial.simulation?.errorSimulationRate ?? 0.2,
                progressVariability: partial.simulation?.progressVariability ?? 0.3
            },
            interaction: {
                responseLatency: partial.interaction?.responseLatency ?? 2000,
                verbosityLevel: partial.interaction?.verbosityLevel ?? 0.6,
                questionFrequency: partial.interaction?.questionFrequency ?? 0.3,
                encouragementStyle: partial.interaction?.encouragementStyle ?? 'enthusiastic'
            }
        };
    }
}