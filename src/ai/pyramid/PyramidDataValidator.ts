//src/ai/pyramid/PyramidDataValidator.ts
import { PyramidData, PyramidLevelType } from '../interfaces/IPyramidDataFlow';
import { Logger } from '@ai/utils/Logger';

/**
 * Type de validation à effectuer
 */
export enum ValidationType {
    REQUIRED = 'required',        // Champ obligatoire
    TYPE = 'type',                // Type de données
    RANGE = 'range',              // Plage de valeurs
    PATTERN = 'pattern',          // Expression régulière
    ENUM = 'enum',                // Valeurs énumérées
    CUSTOM = 'custom',            // Validation personnalisée
    DEPENDENCY = 'dependency',    // Dépendance entre champs
    NESTED = 'nested'             // Validation imbriquée
}

/**
 * Type de données JavaScript
 */
export enum DataType {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    OBJECT = 'object',
    ARRAY = 'array',
    NULL = 'null',
    UNDEFINED = 'undefined',
    ANY = 'any'
}

/**
 * Règle de validation de base
 */
export interface ValidationRule {
    // Type de validation
    type: ValidationType;

    // Message d'erreur personnalisé
    message?: string;

    // Niveau de sévérité (warning = validation souple, error = validation stricte)
    severity?: 'warning' | 'error';
}

/**
 * Règle de champ obligatoire
 */
export interface RequiredRule extends ValidationRule {
    type: ValidationType.REQUIRED;

    // Si true, les chaînes vides sont considérées comme valides
    allowEmpty?: boolean;
}

/**
 * Règle de type de données
 */
export interface TypeRule extends ValidationRule {
    type: ValidationType.TYPE;

    // Type attendu
    dataType: DataType | DataType[];
}

/**
 * Règle de plage de valeurs
 */
export interface RangeRule extends ValidationRule {
    type: ValidationType.RANGE;

    // Valeur minimale
    min?: number;

    // Valeur maximale
    max?: number;

    // Longueur minimale (pour les chaînes et tableaux)
    minLength?: number;

    // Longueur maximale (pour les chaînes et tableaux)
    maxLength?: number;
}

/**
 * Règle d'expression régulière
 */
export interface PatternRule extends ValidationRule {
    type: ValidationType.PATTERN;

    // Expression régulière
    pattern: RegExp;
}

/**
 * Règle de valeurs énumérées
 */
export interface EnumRule extends ValidationRule {
    type: ValidationType.ENUM;

    // Valeurs autorisées
    values: unknown[];
}

/**
 * Règle de validation personnalisée
 */
export interface CustomRule extends ValidationRule {
    type: ValidationType.CUSTOM;

    // Fonction de validation
    validate: (value: unknown, data: Record<string, unknown>) => boolean | Promise<boolean>;
}

/**
 * Règle de dépendance entre champs
 */
export interface DependencyRule extends ValidationRule {
    type: ValidationType.DEPENDENCY;

    // Champ dont dépend la validation
    field: string;

    // Valeur attendue du champ dépendant
    expectedValue?: unknown;

    // Fonction de validation
    condition?: (value: unknown) => boolean;
}

/**
 * Règle de validation imbriquée
 */
export interface NestedRule extends ValidationRule {
    type: ValidationType.NESTED;

    // Schéma de validation pour les objets imbriqués
    schema: ValidationSchema;
}

/**
 * Type union de toutes les règles de validation
 */
export type ValidationRuleType =
    | RequiredRule
    | TypeRule
    | RangeRule
    | PatternRule
    | EnumRule
    | CustomRule
    | DependencyRule
    | NestedRule;

/**
 * Schéma de validation pour un objet
 */
export interface ValidationSchema {
    // Règles par champ
    [field: string]: ValidationRuleType[];
}

/**
 * Erreur de validation
 */
export interface ValidationError {
    // Champ concerné
    field: string;

    // Message d'erreur
    message: string;

    // Type de règle
    rule: ValidationType;

    // Valeur actuelle
    value: unknown;

    // Valeur attendue
    expected?: unknown;

    // Niveau de sévérité
    severity: 'warning' | 'error';

    // Erreurs imbriquées
    nested?: ValidationError[];
}

/**
 * Résultat de validation
 */
export interface ValidationResult {
    // Valide ou non
    valid: boolean;

    // Erreurs de validation
    errors: ValidationError[];

    // Données validées (peut inclure des valeurs par défaut)
    data: Record<string, unknown>;

    // Temps de validation (ms)
    validationTime: number;

    // Valide partiellement (certaines erreurs de niveau warning)
    partiallyValid?: boolean;
}

/**
 * Configuration du validateur
 */
export interface ValidatorConfig {
    // Continuer la validation après la première erreur
    validateAll: boolean;

    // Considérer les avertissements comme des erreurs
    strictMode: boolean;

    // Supprimer les champs non définis dans le schéma
    removeExtraFields: boolean;

    // Activer le mode debug
    debug: boolean;
}

/**
 * Niveau de schéma de validation - détermine quels champs sont validés à quel niveau de la pyramide
 */
export interface PyramidValidationLevel {
    // Niveau de la pyramide
    level: PyramidLevelType;

    // Schéma de validation
    schema: ValidationSchema;

    // Direction (montante, descendante ou les deux)
    direction?: 'up' | 'down' | 'both';

    // Configuration de validation spécifique à ce niveau
    config?: Partial<ValidatorConfig>;
}

/**
 * Validateur de données pour la pyramide IA
 * Assure que les données respectent un schéma attendu avant traitement
 */
export class PyramidDataValidator {
    private schemas: Map<PyramidLevelType, Map<string, ValidationSchema>> = new Map();
    private logger: Logger;
    private config: ValidatorConfig;

    /**
     * Crée une nouvelle instance du validateur de données
     * @param config Configuration du validateur
     */
    constructor(config?: Partial<ValidatorConfig>) {
        this.config = {
            validateAll: config?.validateAll !== undefined ? config.validateAll : true,
            strictMode: config?.strictMode !== undefined ? config.strictMode : false,
            removeExtraFields: config?.removeExtraFields !== undefined ? config.removeExtraFields : false,
            debug: config?.debug !== undefined ? config.debug : false
        };

        this.logger = new Logger('PyramidDataValidator');

        this.logger.info('Data validator initialized', { config: this.config });
    }

    /**
     * Enregistre un schéma de validation pour un niveau de la pyramide
     * @param level Niveau de la pyramide
     * @param schema Schéma de validation
     * @param direction Direction (up/down)
     * @returns true si le schéma a été enregistré avec succès
     */
    public registerSchema(
        level: PyramidLevelType,
        schema: ValidationSchema,
        direction: 'up' | 'down' = 'both'
    ): boolean {
        if (!this.schemas.has(level)) {
            this.schemas.set(level, new Map());
        }

        const levelSchemas = this.schemas.get(level)!;
        levelSchemas.set(direction, schema);

        this.logger.debug(`Registered schema for level ${level}, direction ${direction}`);
        return true;
    }

    /**
     * Enregistre plusieurs schémas de validation
     * @param levels Niveaux de validation
     * @returns true si tous les schémas ont été enregistrés avec succès
     */
    public registerSchemas(levels: PyramidValidationLevel[]): boolean {
        let success = true;

        for (const level of levels) {
            const direction = level.direction || 'both';
            const result = this.registerSchema(level.level, level.schema, direction);

            if (!result) {
                success = false;
            }
        }

        return success;
    }

    /**
     * Valide des données pour un niveau spécifique
     * @param data Données à valider
     * @param level Niveau de la pyramide
     * @param direction Direction (montante ou descendante)
     * @param config Configuration de validation
     * @returns Résultat de la validation
     */
    public async validate<T extends PyramidData>(
        data: T,
        level: PyramidLevelType,
        direction: 'up' | 'down',
        config?: Partial<ValidatorConfig>
    ): Promise<ValidationResult> {
        const startTime = Date.now();

        // Fusionner la configuration
        const mergedConfig: ValidatorConfig = {
            ...this.config,
            ...config
        };

        // Vérifier si un schéma existe pour ce niveau et cette direction
        if (!this.schemas.has(level)) {
            this.logger.warn(`No schema registered for level ${level}`);
            return {
                valid: true,  // Par défaut, considérer valide si pas de schéma
                errors: [],
                data: { ...data as Record<string, unknown> },
                validationTime: Date.now() - startTime
            };
        }

        const levelSchemas = this.schemas.get(level)!;

        // Essayer d'abord la direction spécifique, puis 'both' si non trouvé
        let schema = levelSchemas.get(direction);
        if (!schema) {
            schema = levelSchemas.get('both');
        }

        if (!schema) {
            this.logger.warn(`No schema registered for level ${level}, direction ${direction}`);
            return {
                valid: true,  // Par défaut, considérer valide si pas de schéma
                errors: [],
                data: { ...data as Record<string, unknown> },
                validationTime: Date.now() - startTime
            };
        }

        // Valider les données avec le schéma
        const result = await this.validateAgainstSchema(
            data as Record<string, unknown>,
            schema,
            mergedConfig
        );

        const endTime = Date.now();
        result.validationTime = endTime - startTime;

        if (!result.valid) {
            this.logger.warn(`Validation failed for level ${level}, direction ${direction}`, {
                errorCount: result.errors.length,
                time: result.validationTime
            });

            if (mergedConfig.debug) {
                this.logger.debug('Validation errors', { errors: result.errors });
            }
        } else {
            this.logger.debug(`Validation passed for level ${level}, direction ${direction}`, {
                time: result.validationTime
            });
        }

        return result;
    }

    /**
     * Valide des données contre un schéma
     * @param data Données à valider
     * @param schema Schéma de validation
     * @param config Configuration de validation
     * @returns Résultat de la validation
     */
    private async validateAgainstSchema(
        data: Record<string, unknown>,
        schema: ValidationSchema,
        config: ValidatorConfig
    ): Promise<ValidationResult> {
        const errors: ValidationError[] = [];
        const validatedData: Record<string, unknown> = { ...data };

        // Valider chaque champ du schéma
        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];

            for (const rule of rules) {
                const error = await this.validateRule(field, value, rule, data);

                if (error) {
                    errors.push(error);

                    // Si mode strict et erreur de niveau "error", arrêter la validation
                    if (!config.validateAll && error.severity === 'error') {
                        break;
                    }
                }
            }
        }

        // Supprimer les champs non définis dans le schéma si demandé
        if (config.removeExtraFields) {
            for (const field of Object.keys(data)) {
                if (!schema[field]) {
                    delete validatedData[field];
                }
            }
        }

        // Déterminer si les données sont valides
        const hasErrors = errors.some(error =>
            error.severity === 'error' || (error.severity === 'warning' && config.strictMode)
        );

        const hasWarnings = errors.some(error => error.severity === 'warning');

        return {
            valid: !hasErrors,
            partiallyValid: !hasErrors && hasWarnings,
            errors,
            data: validatedData,
            validationTime: 0 // Sera mis à jour par la méthode appelante
        };
    }

    /**
     * Valide une valeur contre une règle
     * @param field Nom du champ
     * @param value Valeur à valider
     * @param rule Règle de validation
     * @param data Données complètes (pour les règles de dépendance)
     * @returns Erreur de validation ou null si valide
     */
    private async validateRule(
        field: string,
        value: unknown,
        rule: ValidationRuleType,
        data: Record<string, unknown>
    ): Promise<ValidationError | null> {
        const severity = rule.severity || 'error';
        let error: ValidationError | null = null;

        // Valider selon le type de règle
        switch (rule.type) {
            case ValidationType.REQUIRED:
                error = this.validateRequired(field, value, rule);
                break;

            case ValidationType.TYPE:
                error = this.validateType(field, value, rule);
                break;

            case ValidationType.RANGE:
                error = this.validateRange(field, value, rule);
                break;

            case ValidationType.PATTERN:
                error = this.validatePattern(field, value, rule);
                break;

            case ValidationType.ENUM:
                error = this.validateEnum(field, value, rule);
                break;

            case ValidationType.DEPENDENCY:
                error = this.validateDependency(field, value, rule, data);
                break;

            case ValidationType.NESTED:
                error = await this.validateNested(field, value, rule);
                break;

            case ValidationType.CUSTOM:
                error = await this.validateCustom(field, value, rule, data);
                break;
        }

        return error;
    }

    /**
     * Valide qu'un champ est présent
     * @param field Nom du champ
     * @param value Valeur à valider
     * @param rule Règle de validation
     * @returns Erreur de validation ou null si valide
     */
    private validateRequired(
        field: string,
        value: unknown,
        rule: RequiredRule
    ): ValidationError | null {
        // Vérifier si la valeur est définie
        const isEmpty = value === undefined || value === null ||
            (typeof value === 'string' && value.trim() === '' && !rule.allowEmpty);

        if (isEmpty) {
            return {
                field,
                message: rule.message || `Le champ ${field} est obligatoire`,
                rule: ValidationType.REQUIRED,
                value,
                severity: rule.severity || 'error'
            };
        }

        return null;
    }

    /**
     * Valide le type d'un champ
     * @param field Nom du champ
     * @param value Valeur à valider
     * @param rule Règle de validation
     * @returns Erreur de validation ou null si valide
     */
    private validateType(
        field: string,
        value: unknown,
        rule: TypeRule
    ): ValidationError | null {
        // Si la valeur est undefined ou null, ne pas valider le type
        if (value === undefined || value === null) {
            return null;
        }

        const expectedTypes = Array.isArray(rule.dataType) ? rule.dataType : [rule.dataType];

        // Vérifier si le type correspond
        const actualType = this.getDataType(value);
        const isValidType = expectedTypes.some(type =>
            type === DataType.ANY || type === actualType
        );

        if (!isValidType) {
            return {
                field,
                message: rule.message || `Le champ ${field} doit être de type ${expectedTypes.join(' ou ')}`,
                rule: ValidationType.TYPE,
                value,
                expected: expectedTypes,
                severity: rule.severity || 'error'
            };
        }

        return null;
    }

    /**
     * Détermine le type de données JavaScript
     * @param value Valeur à analyser
     * @returns Type de données
     */
    private getDataType(value: unknown): DataType {
        if (value === null) {
            return DataType.NULL;
        }

        if (value === undefined) {
            return DataType.UNDEFINED;
        }

        if (Array.isArray(value)) {
            return DataType.ARRAY;
        }

        return typeof value as DataType;
    }

    /**
     * Valide la plage de valeurs d'un champ
     * @param field Nom du champ
     * @param value Valeur à valider
     * @param rule Règle de validation
     * @returns Erreur de validation ou null si valide
     */
    private validateRange(
        field: string,
        value: unknown,
        rule: RangeRule
    ): ValidationError | null {
        // Si la valeur est undefined ou null, ne pas valider la plage
        if (value === undefined || value === null) {
            return null;
        }

        // Valider selon le type
        if (typeof value === 'number') {
            // Valider les min/max numériques
            if (rule.min !== undefined && value < rule.min) {
                return {
                    field,
                    message: rule.message || `Le champ ${field} doit être supérieur ou égal à ${rule.min}`,
                    rule: ValidationType.RANGE,
                    value,
                    expected: { min: rule.min },
                    severity: rule.severity || 'error'
                };
            }

            if (rule.max !== undefined && value > rule.max) {
                return {
                    field,
                    message: rule.message || `Le champ ${field} doit être inférieur ou égal à ${rule.max}`,
                    rule: ValidationType.RANGE,
                    value,
                    expected: { max: rule.max },
                    severity: rule.severity || 'error'
                };
            }
        } else if (typeof value === 'string' || Array.isArray(value)) {
            // Valider les longueurs min/max
            const length = value.length;

            if (rule.minLength !== undefined && length < rule.minLength) {
                return {
                    field,
                    message: rule.message || `Le champ ${field} doit avoir au moins ${rule.minLength} caractères`,
                    rule: ValidationType.RANGE,
                    value,
                    expected: { minLength: rule.minLength },
                    severity: rule.severity || 'error'
                };
            }

            if (rule.maxLength !== undefined && length > rule.maxLength) {
                return {
                    field,
                    message: rule.message || `Le champ ${field} doit avoir au plus ${rule.maxLength} caractères`,
                    rule: ValidationType.RANGE,
                    value,
                    expected: { maxLength: rule.maxLength },
                    severity: rule.severity || 'error'
                };
            }
        }

        return null;
    }

    /**
     * Valide un champ avec une expression régulière
     * @param field Nom du champ
     * @param value Valeur à valider
     * @param rule Règle de validation
     * @returns Erreur de validation ou null si valide
     */
    private validatePattern(
        field: string,
        value: unknown,
        rule: PatternRule
    ): ValidationError | null {
        // Si la valeur est undefined ou null, ne pas valider le pattern
        if (value === undefined || value === null) {
            return null;
        }

        // Le pattern ne s'applique qu'aux chaînes
        if (typeof value !== 'string') {
            return null;
        }

        // Vérifier si la chaîne correspond au pattern
        if (!rule.pattern.test(value)) {
            return {
                field,
                message: rule.message || `Le champ ${field} ne correspond pas au format attendu`,
                rule: ValidationType.PATTERN,
                value,
                expected: rule.pattern.toString(),
                severity: rule.severity || 'error'
            };
        }

        return null;
    }

    /**
     * Valide qu'un champ a une des valeurs énumérées
     * @param field Nom du champ
     * @param value Valeur à valider
     * @param rule Règle de validation
     * @returns Erreur de validation ou null si valide
     */
    private validateEnum(
        field: string,
        value: unknown,
        rule: EnumRule
    ): ValidationError | null {
        // Si la valeur est undefined ou null, ne pas valider l'enum
        if (value === undefined || value === null) {
            return null;
        }

        // Vérifier si la valeur est dans la liste
        if (!rule.values.includes(value)) {
            return {
                field,
                message: rule.message || `Le champ ${field} doit être une des valeurs: ${rule.values.join(', ')}`,
                rule: ValidationType.ENUM,
                value,
                expected: rule.values,
                severity: rule.severity || 'error'
            };
        }

        return null;
    }

    /**
     * Valide une dépendance entre champs
     * @param field Nom du champ
     * @param value Valeur à valider
     * @param rule Règle de validation
     * @param data Données complètes
     * @returns Erreur de validation ou null si valide
     */
    private validateDependency(
        field: string,
        value: unknown,
        rule: DependencyRule,
        data: Record<string, unknown>
    ): ValidationError | null {
        // Récupérer la valeur du champ dépendant
        const dependentValue = data[rule.field];

        // Vérifier si la condition est remplie
        let isValid = true;

        if (rule.expectedValue !== undefined) {
            isValid = dependentValue === rule.expectedValue;
        } else if (rule.condition) {
            isValid = rule.condition(dependentValue);
        }

        if (!isValid) {
            return {
                field,
                message: rule.message || `Le champ ${field} dépend de ${rule.field}`,
                rule: ValidationType.DEPENDENCY,
                value,
                expected: rule.expectedValue,
                severity: rule.severity || 'error'
            };
        }

        return null;
    }

    /**
     * Valide un objet imbriqué
     * @param field Nom du champ
     * @param value Valeur à valider
     * @param rule Règle de validation
     * @returns Erreur de validation ou null si valide
     */
    private async validateNested(
        field: string,
        value: unknown,
        rule: NestedRule
    ): Promise<ValidationError | null> {
        // Si la valeur est undefined ou null, ne pas valider l'objet imbriqué
        if (value === undefined || value === null) {
            return null;
        }

        // La validation imbriquée ne s'applique qu'aux objets
        if (typeof value !== 'object' || Array.isArray(value)) {
            return {
                field,
                message: rule.message || `Le champ ${field} doit être un objet`,
                rule: ValidationType.NESTED,
                value,
                severity: rule.severity || 'error'
            };
        }

        // Valider l'objet imbriqué
        const result = await this.validateAgainstSchema(
            value as Record<string, unknown>,
            rule.schema,
            { validateAll: true, strictMode: false, removeExtraFields: false, debug: false }
        );

        if (!result.valid) {
            return {
                field,
                message: rule.message || `Le champ ${field} contient des erreurs de validation`,
                rule: ValidationType.NESTED,
                value,
                nested: result.errors,
                severity: rule.severity || 'error'
            };
        }

        return null;
    }

    /**
     * Valide un champ avec une fonction personnalisée
     * @param field Nom du champ
     * @param value Valeur à valider
     * @param rule Règle de validation
     * @param data Données complètes
     * @returns Erreur de validation ou null si valide
     */
    private async validateCustom(
        field: string,
        value: unknown,
        rule: CustomRule,
        data: Record<string, unknown>
    ): Promise<ValidationError | null> {
        try {
            // Exécuter la fonction de validation
            const isValid = await rule.validate(value, data);

            if (!isValid) {
                return {
                    field,
                    message: rule.message || `Le champ ${field} ne répond pas aux critères de validation personnalisés`,
                    rule: ValidationType.CUSTOM,
                    value,
                    severity: rule.severity || 'error'
                };
            }
        } catch (error) {
            // Une erreur dans la fonction de validation est considérée comme un échec
            return {
                field,
                message: rule.message || `Erreur lors de la validation personnalisée de ${field}: ${(error as Error).message}`,
                rule: ValidationType.CUSTOM,
                value,
                severity: rule.severity || 'error'
            };
        }

        return null;
    }

    /**
     * Supprime le schéma de validation pour un niveau
     * @param level Niveau de la pyramide
     * @param direction Direction (ou toutes si non spécifiée)
     * @returns true si le schéma a été supprimé avec succès
     */
    public removeSchema(level: PyramidLevelType, direction?: 'up' | 'down' | 'both'): boolean {
        if (!this.schemas.has(level)) {
            return false;
        }

        const levelSchemas = this.schemas.get(level)!;

        if (direction) {
            // Supprimer une direction spécifique
            const result = levelSchemas.delete(direction);

            // Si le niveau n'a plus de schémas, le supprimer
            if (levelSchemas.size === 0) {
                this.schemas.delete(level);
            }

            return result;
        } else {
            // Supprimer toutes les directions
            this.schemas.delete(level);
            return true;
        }
    }

    /**
     * Obtient tous les schémas enregistrés
     * @returns Map des schémas par niveau et direction
     */
    public getAllSchemas(): Map<PyramidLevelType, Map<string, ValidationSchema>> {
        return new Map(this.schemas);
    }

    /**
     * Obtient un schéma spécifique
     * @param level Niveau de la pyramide
     * @param direction Direction
     * @returns Schéma de validation ou undefined si non trouvé
     */
    public getSchema(level: PyramidLevelType, direction: 'up' | 'down' | 'both'): ValidationSchema | undefined {
        const levelSchemas = this.schemas.get(level);
        if (!levelSchemas) {
            return undefined;
        }

        return levelSchemas.get(direction);
    }
}