// src/ai/spatial/types/interfaces/ISpatialCoherenceValidator.ts

// Importer uniquement ce qui est nécessaire
import { SpatialMap } from '../SpatialTypes';

/**
 * Structure des résultats de validation
 */
export interface ValidationResult {
    valid: boolean;
    issues: string[];
}

/**
 * Structure des résultats de validation complète
 */
export interface CompleteValidationResult extends ValidationResult {
    recommendations: string[];
}

/**
 * Interface pour le validateur de cohérence spatiale
 */
export interface ISpatialCoherenceValidator {
    /**
     * Valide la cohérence des références dans une carte
     * @param map Carte spatiale à valider
     */
    validateReferences(map: SpatialMap): ValidationResult;

    /**
     * Valide la cohérence des connexions dans une carte
     * @param map Carte spatiale à valider
     */
    validateConnections(map: SpatialMap): ValidationResult;

    /**
     * Valide les règles linguistiques spatiales
     * @param map Carte spatiale à valider
     */
    validateLinguisticRules(map: SpatialMap): ValidationResult;

    /**
     * Effectue une validation complète
     * @param map Carte spatiale à valider
     */
    validateAll(map: SpatialMap): CompleteValidationResult;
}