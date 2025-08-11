/**
 * src/ai/api/common/validation/interfaces/IValidator.ts
 * @file IValidator.ts
 * @description
 * Interface IValidator pour la validation des données
 * Utilisée pour la validation des données dans les systèmes distribués
 * Centralisation de la logique de validation des données
 * dans les systèmes distribués
 * 
 */
import {
    ValidationResult,
    ValidationOptions,
    ValidationContext,
    ValidationError,
    ValidationWarning
} from '../types/ValidationTypes';

/**
 * Interface définissant un validateur générique
 */
export interface IValidator<T> {
    /**
     * Valide une donnée d'entrée
     * @param data Les données à valider
     * @param options Options de validation
     * @returns Résultat de la validation
     */
    validate(data: T, options?: ValidationOptions): Promise<ValidationResult>;

    /**
     * Vérifie si une erreur spécifique existe dans les résultats
     * @param result Résultat de validation
     * @param errorCode Code d'erreur à rechercher
     */
    hasError(result: ValidationResult, errorCode: string): boolean;

    /**
     * Récupère les statistiques de validation
     * @returns Les statistiques collectées par ce validateur
     */
    getValidationStatistics(): ValidationStatistics;

    /**
     * Ajoute une règle de validation personnalisée
     * @param rule Règle de validation à ajouter
     */
    addRule(rule: ValidationRuleDefinition): void;

    /**
     * Récupère le nom du validateur
     */
    getName(): string;
}

/**
 * Définit une règle de validation
 */
export interface ValidationRuleDefinition {
    /**
     * Identifiant unique de la règle
     */
    id: string;

    /**
     * Description de la règle
     */
    description: string;

    /**
     * Fonction de validation
     */
    validate: <T>(data: T, context?: ValidationContext) => Promise<ValidationRuleResult>;

    /**
     * Indique si la règle est activée
     */
    isEnabled: boolean;

    /**
     * Catégorie de la règle
     */
    category: 'syntax' | 'semantic' | 'cultural' | 'security';

    /**
     * Poids de la règle dans le processus de validation
     */
    weight?: number;
}

/**
 * Résultat de l'application d'une règle de validation
 */
export interface ValidationRuleResult {
    /**
     * Indique si la validation a réussi
     */
    isValid: boolean;

    /**
     * Erreurs générées par la règle
     */
    errors?: ValidationError[];

    /**
     * Avertissements générés par la règle
     */
    warnings?: ValidationWarning[];
}

/**
 * Statistiques de validation
 */
export interface ValidationStatistics {
    /**
     * Nombre total de validations effectuées
     */
    totalValidations: number;

    /**
     * Nombre de validations réussies
     */
    successfulValidations: number;

    /**
     * Nombre de validations ayant échoué
     */
    failedValidations: number;

    /**
     * Temps moyen d'exécution (en ms)
     */
    averageExecutionTime: number;

    /**
     * Règles les plus fréquemment enfreintes
     */
    mostFrequentRuleViolations: Array<{
        ruleId: string;
        count: number;
        percentage: number;
    }>;

    /**
     * Date de la dernière validation
     */
    lastValidationTimestamp?: number;

    /**
     * Métadonnées additionnelles
     */
    metadata?: Record<string, unknown>;
}