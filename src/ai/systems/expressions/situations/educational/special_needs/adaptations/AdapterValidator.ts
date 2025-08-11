import {
    BaseOptions,
    PredictionOptions,
    DynamicAdaptationOptions,
    CollaborationOptions,
    IntegratedOptions,
    SessionData
} from './AdapterTypes';

/**
 * Interface pour les résultats de validation
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * Validateur pour les options d'adaptateur
 */
export class AdapterOptionsValidator {
    /**
     * Valide les options de base
     * @param options Options à valider
     * @returns Résultat de validation
     */
    static validateBaseOptions(options: BaseOptions): ValidationResult {
        const errors: string[] = [];

        if (!options.feature_type) {
            errors.push('feature_type is required');
        } else if (!['PREDICTIVE', 'INTELLIGENT_ASSISTANCE', 'COLLABORATION', 'INTEGRATED', 'BALANCED'].includes(options.feature_type)) {
            errors.push(`Invalid feature_type: ${options.feature_type}`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valide les options de prédiction
     * @param options Options à valider
     * @returns Résultat de validation
     */
    static validatePredictionOptions(options: PredictionOptions): ValidationResult {
        const baseResult = this.validateBaseOptions(options);
        const errors = [...baseResult.errors];

        if (options.feature_type !== 'PREDICTIVE') {
            errors.push(`Expected feature_type to be 'PREDICTIVE', got '${options.feature_type}'`);
        }

        if (!options.prediction_focus) {
            errors.push('prediction_focus is required');
        } else if (!['FATIGUE_MANAGEMENT', 'PERFORMANCE_OPTIMIZATION', 'LEARNING_EFFICIENCY'].includes(options.prediction_focus)) {
            errors.push(`Invalid prediction_focus: ${options.prediction_focus}`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valide les options d'adaptation dynamique
     * @param options Options à valider
     * @returns Résultat de validation
     */
    static validateDynamicAdaptationOptions(options: DynamicAdaptationOptions): ValidationResult {
        const baseResult = this.validateBaseOptions(options);
        const errors = [...baseResult.errors];

        if (options.feature_type !== 'INTELLIGENT_ASSISTANCE') {
            errors.push(`Expected feature_type to be 'INTELLIGENT_ASSISTANCE', got '${options.feature_type}'`);
        }

        if (!options.optimization_priority) {
            errors.push('optimization_priority is required');
        } else if (!['LEARNING_EFFICIENCY', 'COGNITIVE_SUPPORT', 'ENVIRONMENTAL'].includes(options.optimization_priority)) {
            errors.push(`Invalid optimization_priority: ${options.optimization_priority}`);
        }

        if (!options.support_level) {
            errors.push('support_level is required');
        } else if (!['LOW', 'MODERATE', 'HIGH', 'ADAPTIVE'].includes(options.support_level)) {
            errors.push(`Invalid support_level: ${options.support_level}`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valide les options de collaboration
     * @param options Options à valider
     * @returns Résultat de validation
     */
    static validateCollaborationOptions(options: CollaborationOptions): ValidationResult {
        const baseResult = this.validateBaseOptions(options);
        const errors = [...baseResult.errors];

        if (options.feature_type !== 'COLLABORATION') {
            errors.push(`Expected feature_type to be 'COLLABORATION', got '${options.feature_type}'`);
        }

        if (!options.matching_criteria) {
            errors.push('matching_criteria is required');
        } else if (!['COMPLEMENTARY_SKILLS', 'SIMILAR_LEVEL', 'DIVERSE_BACKGROUNDS'].includes(options.matching_criteria)) {
            errors.push(`Invalid matching_criteria: ${options.matching_criteria}`);
        }

        if (!options.focus) {
            errors.push('focus is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valide les options intégrées
     * @param options Options à valider
     * @returns Résultat de validation
     */
    static validateIntegratedOptions(options: IntegratedOptions): ValidationResult {
        const baseResult = this.validateBaseOptions(options);
        const errors = [...baseResult.errors];

        if (options.feature_type !== 'INTEGRATED') {
            errors.push(`Expected feature_type to be 'INTEGRATED', got '${options.feature_type}'`);
        }

        if (!options.integration_level) {
            errors.push('integration_level is required');
        } else if (!['MINIMAL', 'PARTIAL', 'FULL'].includes(options.integration_level)) {
            errors.push(`Invalid integration_level: ${options.integration_level}`);
        }

        if (!options.prediction_focus) {
            errors.push('prediction_focus is required');
        } else if (!['FATIGUE_MANAGEMENT', 'PERFORMANCE_OPTIMIZATION', 'LEARNING_EFFICIENCY'].includes(options.prediction_focus)) {
            errors.push(`Invalid prediction_focus: ${options.prediction_focus}`);
        }

        if (!options.optimization_priority) {
            errors.push('optimization_priority is required');
        } else if (!['LEARNING_EFFICIENCY', 'COGNITIVE_SUPPORT', 'ENVIRONMENTAL'].includes(options.optimization_priority)) {
            errors.push(`Invalid optimization_priority: ${options.optimization_priority}`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

/**
 * Validateur pour les données de session
 */
export class SessionDataValidator {
    /**
     * Valide les données de session de base
     * @param sessionData Données à valider
     * @returns Résultat de validation
     */
    static validateSessionData(sessionData: SessionData): ValidationResult {
        const errors: string[] = [];

        // Validation de base - vérification que les données essentielles sont présentes
        if (!sessionData) {
            errors.push('Session data is required');
            return { isValid: false, errors };
        }

        // Vérification des éléments critiques pour le fonctionnement
        if (sessionData.duration === undefined || sessionData.duration <= 0) {
            errors.push('Valid duration is required');
        }

        if (!sessionData.intensity) {
            errors.push('Intensity is required');
        }

        if (!sessionData.challenges || !Array.isArray(sessionData.challenges)) {
            errors.push('Challenges array is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valide les données de session pour les prédictions
     * @param sessionData Données à valider
     * @returns Résultat de validation
     */
    static validateForPrediction(sessionData: SessionData): ValidationResult {
        const baseResult = this.validateSessionData(sessionData);
        const errors = [...baseResult.errors];

        // Vérifications spécifiques aux prédictions
        if (!sessionData.student || !sessionData.student.fatigue_history) {
            errors.push('Fatigue history is required for prediction');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valide les données de session pour les adaptations dynamiques
     * @param sessionData Données à valider
     * @returns Résultat de validation
     */
    static validateForDynamicAdaptation(sessionData: SessionData): ValidationResult {
        const baseResult = this.validateSessionData(sessionData);
        const errors = [...baseResult.errors];

        // Vérifications spécifiques aux adaptations dynamiques
        if (!sessionData.learner) {
            errors.push('Learner information is required for dynamic adaptation');
        }

        if (!sessionData.environment) {
            errors.push('Environment information is required for dynamic adaptation');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valide les données de session pour la collaboration
     * @param sessionData Données à valider
     * @returns Résultat de validation
     */
    static validateForCollaboration(sessionData: SessionData): ValidationResult {
        const baseResult = this.validateSessionData(sessionData);
        const errors = [...baseResult.errors];

        // Vérifications spécifiques à la collaboration
        if (!sessionData.group_composition) {
            errors.push('Group composition is required for collaboration');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valide les données de session pour l'approche intégrée
     * @param sessionData Données à valider
     * @returns Résultat de validation
     */
    static validateForIntegrated(sessionData: SessionData): ValidationResult {
        const baseResult = this.validateSessionData(sessionData);
        const errors = [...baseResult.errors];

        // Pour l'approche intégrée, nous avons besoin de la plupart des informations
        const requiredProperties = [
            'student', 'learner', 'environment', 'task'
        ];

        for (const prop of requiredProperties) {
            if (!sessionData[prop as keyof SessionData]) {
                errors.push(`${prop} information is required for integrated approach`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}