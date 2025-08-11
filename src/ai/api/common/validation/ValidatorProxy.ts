/**
 * src/ai/api/common/validation/ValidatorProxy.ts
 * 
 */
import { ValidationService } from './ValidationService';
import {
    IValidationContext,
    IValidationResult,
    IExpressionSystem,
    ILSFGrammarSystem,
    IEthicsChecker
} from './interfaces/ValidatorInterfaces';
import {
    ErrorSeverity,
    ValidationContext,
    // ValidationOptions  // Suppression de l'import non utilisé
} from './types/ValidationTypes';



import {
    ValidationResult,
    ValidationOptions,
    ValidationContext,
    ErrorSeverity
} from './types/ValidationTypes';
import { IValidator } from './interfaces/IValidator';

/**
 * Interface étendue pour les validateurs avec des fonctionnalités avancées.
 */
interface ExtendedValidator<T> extends IValidator<T> {
    /**
     * Met à jour le contexte de validation.
     * 
     * @param context Nouveau contexte de validation.
     */
    updateContext?(context: ValidationContext): void;

    /**
     * Nettoie les données anciennes.
     * 
     * @param olderThan Timestamp limite pour le nettoyage.
     * @returns Nombre d'éléments nettoyés.
     */
    cleanup?(olderThan: number): Promise<number>;
}

/**
 * Classe `ValidationService` pour gérer les validateurs et exécuter des validations.
 */
export class ValidationService {
    private validators: Map<string, ExtendedValidator<unknown>>;

    /**
     * Constructeur de la classe `ValidationService`.
     */
    constructor() {
        this.validators = new Map();
    }

    /**
     * Enregistre un validateur dans le service.
     * 
     * @param name Identifiant unique du validateur.
     * @param validator Instance du validateur.
     * @throws Une erreur si un validateur avec le même nom est déjà enregistré.
     */
    registerValidator<T>(name: string, validator: IValidator<T> | ExtendedValidator<T>): void {
        if (this.validators.has(name)) {
            throw new Error(`Validator ${name} already registered`);
        }
        this.validators.set(name, validator as ExtendedValidator<unknown>);
    }

    /**
     * Supprime un validateur du service.
     * 
     * @param name Identifiant du validateur.
     * @throws Une erreur si le validateur n'est pas trouvé.
     */
    unregisterValidator(name: string): void {
        if (!this.validators.has(name)) {
            throw new Error(`Validator ${name} not found`);
        }
        this.validators.delete(name);
    }

    /**
     * Valide des données avec un validateur spécifique.
     * 
     * @param name Identifiant du validateur.
     * @param data Données à valider.
     * @param options Options de validation (facultatif).
     * @returns Résultat de la validation.
     * @throws Une erreur si le validateur n'est pas trouvé.
     */
    async validate(name: string, data: unknown, options?: ValidationOptions): Promise<ValidationResult> {
        const validator = this.validators.get(name);
        if (!validator) {
            throw new Error(`Validator ${name} not found`);
        }
        return validator.validate(data, options);
    }

    /**
     * Valide des données avec tous les validateurs enregistrés.
     * 
     * @param data Données à valider.
     * @param options Options de validation (facultatif).
     * @returns Une map contenant les résultats de validation par validateur.
     */
    async validateAll(data: unknown, options?: ValidationOptions): Promise<Map<string, ValidationResult>> {
        const results = new Map<string, ValidationResult>();

        await Promise.all(
            Array.from(this.validators.entries()).map(async ([name, validator]) => {
                try {
                    const result = await validator.validate(data, options);
                    results.set(name, result);
                } catch (error) {
                    results.set(name, {
                        isValid: false,
                        errors: [{
                            code: 'VALIDATION_ERROR',
                            message: error instanceof Error ? error.message : 'Unknown validation error',
                            severity: ErrorSeverity.HIGH,
                            timestamp: Date.now()
                        }],
                        metadata: {
                            validatedAt: Date.now(),
                            duration: 0,
                            validator: name,
                            version: '1.0.0',
                            configuration: {
                                rules: {
                                    syntax: 0,
                                    semantic: 0,
                                    cultural: 0
                                }
                            },
                            context: {
                                environment: 'default'
                            }
                        }
                    });
                }
            })
        );

        return results;
    }

    /**
     * Met à jour le contexte pour tous les validateurs enregistrés.
     * 
     * @param context Nouveau contexte de validation.
     */
    updateContext(context: ValidationContext): void {
        for (const validator of this.validators.values()) {
            if (typeof validator.updateContext === 'function') {
                validator.updateContext(context);
            }
        }
    }

    /**
     * Vérifie si un validateur est enregistré.
     * 
     * @param name Identifiant du validateur.
     * @returns `true` si le validateur est enregistré, sinon `false`.
     */
    hasValidator(name: string): boolean {
        return this.validators.has(name);
    }

    /**
     * Récupère un validateur par son nom.
     * 
     * @param name Identifiant du validateur.
     * @returns L'instance du validateur ou `undefined` si non trouvé.
     */
    getValidator(name: string): ExtendedValidator<unknown> | undefined {
        return this.validators.get(name);
    }

    /**
     * Récupère les noms de tous les validateurs enregistrés.
     * 
     * @returns Une liste des noms des validateurs.
     */
    getValidatorNames(): string[] {
        return Array.from(this.validators.keys());
    }

    /**
     * Récupère le nombre de validateurs enregistrés.
     * 
     * @returns Le nombre de validateurs enregistrés.
     */
    getValidatorCount(): number {
        return this.validators.size;
    }

    /**
     * Nettoie les données anciennes de tous les validateurs.
     * 
     * @param olderThan Timestamp limite pour le nettoyage.
     * @returns Une map contenant le nombre d'éléments nettoyés par validateur.
     */
    async cleanup(olderThan: number): Promise<Map<string, number>> {
        const cleanupResults = new Map<string, number>();

        await Promise.all(
            Array.from(this.validators.entries()).map(async ([name, validator]) => {
                try {
                    if (typeof validator.cleanup === 'function') {
                        const count = await validator.cleanup(olderThan);
                        cleanupResults.set(name, count);
                    } else {
                        cleanupResults.set(name, 0);
                    }
                } catch {
                    cleanupResults.set(name, 0);
                }
            })
        );

        return cleanupResults;
    }
}

export class ValidatorProxy {
    private expressionSystem: IExpressionSystem;
    private grammarSystem: ILSFGrammarSystem;
    private ethicsChecker: IEthicsChecker;
    private validationService: ValidationService;

    constructor(
        expressionSystem: IExpressionSystem,
        grammarSystem: ILSFGrammarSystem,
        ethicsChecker: IEthicsChecker,
        validationService: ValidationService
    ) {
        this.expressionSystem = expressionSystem;
        this.grammarSystem = grammarSystem;
        this.ethicsChecker = ethicsChecker;
        this.validationService = validationService;
    }

    async validateExpression(context: IValidationContext): Promise<IValidationResult> {
        try {
            // Validation éthique d'abord
            const ethicsResult = await this.ethicsChecker.validate(context);
            if (!ethicsResult.isValid) {
                return ethicsResult;
            }

            // Validation de l'expression
            const expressionResult = await this.expressionSystem.validateExpression(context);
            if (!expressionResult.isValid) {
                return expressionResult;
            }

            // Validation de la grammaire
            const grammarResult = await this.grammarSystem.validateGrammar(context);

            // Fusion des résultats
            return this.mergeResults([ethicsResult, expressionResult, grammarResult]);
        } catch (error) {
            return this.createErrorResult(error);
        }
    }

    async validateSequence(expressions: unknown[], context: IValidationContext): Promise<IValidationResult> {
        try {
            const startTime = Date.now();
            const results: IValidationResult[] = [];

            // Validation de chaque expression
            for (const expression of expressions) {
                const expressionContext = {
                    ...context,
                    metadata: {
                        ...context.metadata,
                        expression
                    }
                };
                results.push(await this.validateExpression(expressionContext));
            }

            // Validation de la séquence complète
            const sequenceResult = await this.expressionSystem.validateSequence(expressions, context);
            results.push(sequenceResult);

            // Validation de la structure grammaticale
            const structureResult = await this.grammarSystem.validateStructure(expressions, context);
            results.push(structureResult);

            return this.mergeResults(results, startTime);
        } catch (error) {
            return this.createErrorResult(error);
        }
    }

    private mergeResults(results: IValidationResult[], startTime: number = Date.now()): IValidationResult {
        const isValid = results.every(r => r.isValid);
        const errors = results.flatMap(r => r.errors);
        const warnings = results.flatMap(r => r.warnings || []);

        return {
            isValid,
            errors,
            warnings,
            metadata: {
                validatedAt: Date.now(),
                duration: Date.now() - startTime,
                validator: 'ValidatorProxy'
            }
        };
    }

    private createErrorResult(error: unknown): IValidationResult {
        const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
        return {
            isValid: false,
            errors: [{
                code: 'VALIDATION_ERROR',
                message: errorMessage,
                severity: ErrorSeverity.HIGH
            }],
            metadata: {
                validatedAt: Date.now(),
                duration: 0,
                validator: 'ValidatorProxy'
            }
        };
    }

    async validateWithService(data: unknown, context: IValidationContext): Promise<IValidationResult> {
        try {
            // On passe directement un objet d'options sans le typer
            const validationOptions = {
                strictMode: true,
                context: this.convertContext(context)
            };

            const results = await this.validationService.validateAll(data, validationOptions);

            const allResults = Array.from(results.values());
            return this.mergeResults(allResults);
        } catch (error) {
            return this.createErrorResult(error);
        }
    }

    private convertContext(context: IValidationContext): ValidationContext {
        return {
            timestamp: context.timestamp,
            environment: context.environment,
            severity: ErrorSeverity.MEDIUM,
            metadata: context.metadata
        };
    }

    getValidationService(): ValidationService {
        return this.validationService;
    }

    getExpressionSystem(): IExpressionSystem {
        return this.expressionSystem;
    }

    getGrammarSystem(): ILSFGrammarSystem {
        return this.grammarSystem;
    }

    getEthicsChecker(): IEthicsChecker {
        return this.ethicsChecker;
    }
}