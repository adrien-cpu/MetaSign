// src/ai/specialized/cultural/config/CulturalAdaptationConfig.ts

import { ICulturalValidator } from '../interfaces/validation.interfaces';
import { CulturalValidationService } from '../services/CulturalValidationService';
import { CulturalRuleService } from '../services/CulturalRuleService';
import { CulturalContextAdapter } from '../CulturalContextAdapter';
import { CulturalPerformanceMonitor } from '../monitoring/CulturalPerformanceMonitor';

/**
 * Configuration pour l'adaptation culturelle
 */
export interface CulturalAdaptationConfig {
    validator?: ICulturalValidator;
    ruleService?: CulturalRuleService;
    adapter?: CulturalContextAdapter;
    performanceMonitor?: CulturalPerformanceMonitor;
    cacheEnabled?: boolean;
    monitoringEnabled?: boolean;
    monitoringMaxMetrics?: number;
    authenticityThreshold?: number;
    coherenceThreshold?: number;
    regionalAccuracyThreshold?: number;
}

/**
 * Crée une instance de configuration avec les valeurs par défaut
 */
export function createDefaultConfig(): CulturalAdaptationConfig {
    return {
        cacheEnabled: true,
        monitoringEnabled: true,
        monitoringMaxMetrics: 1000,
        authenticityThreshold: 0.85,
        coherenceThreshold: 0.7,
        regionalAccuracyThreshold: 0.8
    };
}

/**
 * Service de configuration pour l'adaptation culturelle
 */
export class CulturalAdaptationConfigService {
    private config: CulturalAdaptationConfig;

    constructor(config: Partial<CulturalAdaptationConfig> = {}) {
        this.config = { ...createDefaultConfig(), ...config };
    }

    /**
     * Récupère la configuration
     */
    getConfig(): CulturalAdaptationConfig {
        return this.config;
    }

    /**
     * Met à jour la configuration
     */
    updateConfig(newConfig: Partial<CulturalAdaptationConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Récupère ou crée un validateur
     */
    getValidator(): ICulturalValidator {
        if (!this.config.validator) {
            this.config.validator = new CulturalValidationService();
        }
        return this.config.validator;
    }

    /**
     * Récupère ou crée un service de règles
     */
    getRuleService(): CulturalRuleService {
        if (!this.config.ruleService) {
            this.config.ruleService = new CulturalRuleService();
        }
        return this.config.ruleService;
    }

    /**
     * Récupère ou crée un adaptateur
     */
    getAdapter(): CulturalContextAdapter {
        if (!this.config.adapter) {
            this.config.adapter = new CulturalContextAdapter();
        }
        return this.config.adapter;
    }

    /**
     * Récupère ou crée un moniteur de performance
     */
    getPerformanceMonitor(): CulturalPerformanceMonitor {
        if (!this.config.performanceMonitor) {
            this.config.performanceMonitor = new CulturalPerformanceMonitor();
        }
        return this.config.performanceMonitor;
    }
}