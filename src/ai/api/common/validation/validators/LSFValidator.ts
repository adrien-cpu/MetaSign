/**
 * src/ai/api/common/validation/validators/LSFValidator.ts
 * @file LSFValidator.ts
 * @description
 * Implémente un validateur pour les expressions en Langue des Signes Française (LSF).
 * Ce validateur prend en charge la validation syntaxique, sémantique et culturelle
 * des expressions LSF. Il fournit également des statistiques de validation,
 * un historique des validations et des avertissements récents.
 */

import { IValidator } from '../interfaces/IValidator';
import {
    ValidationResult,
    ValidationOptions,
    ValidationContext,
    ValidationWarning,
    ValidationMetadata,
    ValidationError,
    ErrorSeverity
} from '../types/ValidationTypes';
import {
    LSFExpression,
    LSFSyntaxRule,
    LSFSemanticRule,
    LSFCulturalRule
} from '../types/LSFTypes';
import { ValidationRuleDefinition } from '../interfaces/IValidator';

/**
 * Interface pour les statistiques de validation.
 */
interface ValidationStatistics {
    /**
     * Nombre total de validations effectuées.
     */
    totalValidations: number;

    /**
     * Nombre de validations réussies.
     */
    successfulValidations: number;

    /**
     * Nombre de validations échouées.
     */
    failedValidations: number;

    /**
     * Temps moyen de validation (en millisecondes).
     */
    averageValidationTime: number;

    /**
     * Temps moyen d'exécution (en millisecondes).
     */
    averageExecutionTime: number;

    /**
     * Nombre d'erreurs par type.
     */
    errorsByType: Record<string, number>;

    /**
     * Nombre d'avertissements par type.
     */
    warningsByType: Record<string, number>;

    /**
     * Liste des règles les plus fréquemment violées.
     */
    mostFrequentRuleViolations: Array<{
        /**
         * Identifiant de la règle.
         */
        ruleId: string;

        /**
         * Nombre de violations.
         */
        count: number;

        /**
         * Pourcentage de violations par rapport au total.
         */
        percentage: number;
    }>;

    /**
     * Dernière validation effectuée.
     */
    lastValidation?: {
        /**
         * Horodatage de la validation.
         */
        timestamp: number;

        /**
         * Durée de la validation (en millisecondes).
         */
        duration: number;

        /**
         * Résultat de la validation.
         */
        result: { success: boolean; isValid: boolean; errors: ValidationError[]; metadata: ValidationMetadata };
    };
}

/**
 * Classe `LSFValidator` pour valider les expressions en Langue des Signes Française (LSF).
 */
export class LSFValidator implements IValidator<LSFExpression> {
    private syntaxRules: LSFSyntaxRule[] = [];
    private semanticRules: LSFSemanticRule[] = [];
    private culturalRules: LSFCulturalRule[] = [];
    private context: ValidationContext;
    private stats: ValidationStatistics;
    private recentWarnings: ValidationWarning[] = [];
    private validationHistory: Array<{ timestamp: number, result: ValidationResult }> = [];
    private maxHistorySize = 100;
    private name = 'LSFValidator';

    /**
     * Constructeur de la classe `LSFValidator`.
     * 
     * @param context Contexte de validation initial.
     */
    constructor(context: ValidationContext) {
        this.context = context;
        this.stats = this.initializeStats();
        this.initializeRules();
    }

    /**
     * Vérifie si une erreur spécifique est présente dans le résultat de validation.
     * 
     * @param result Résultat de validation à vérifier.
     * @param errorCode Code d'erreur à rechercher.
     * @returns `true` si l'erreur est présente, sinon `false`.
     */
    hasError(result: ValidationResult, errorCode: string): boolean {
        if (!result.errors) {
            return false;
        }
        return result.errors.some(error => error.code === errorCode);
    }

    /**
     * Récupère le nom du validateur.
     */
    getName(): string {
        return this.name;
    }

    /**
     * Récupère les statistiques de validation.
     */
    getValidationStatistics(): ValidationStatistics {
        return this.stats;
    }

    /**
     * Ajoute une règle au validateur.
     * 
     * @param rule La règle à ajouter.
     */
    addRule(rule: ValidationRuleDefinition): void {
        // Conversion générique vers les règles spécifiques LSF
        // Ceci est une implémentation simplifiée, à adapter selon les besoins
        const baseRule = {
            id: rule.id,
            description: rule.description,
            // Utilisez ErrorSeverity.MEDIUM comme valeur par défaut ou extrayez de rule si disponible
            severity: ErrorSeverity.MEDIUM,
            // Utilisez la description comme message d'erreur par défaut
            errorMessage: rule.description,
            isEnabled: true
        };

        // Déterminer le type de règle et ajouter les propriétés spécifiques
        // Ici, nous pourrions examiner d'autres propriétés de rule pour déterminer le type approprié
        // Pour simplifier, nous utilisons l'ID pour décider
        if (rule.id.startsWith('syntax')) {
            const syntaxRule: LSFSyntaxRule = {
                ...baseRule,
                type: 'sequence',
                conditions: [
                    // Fonction de validation par défaut pour les règles de syntaxe
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    (_expr) => true
                ]
            };
            this.syntaxRules.push(syntaxRule);
        } else if (rule.id.startsWith('cultural')) {
            const culturalRule: LSFCulturalRule = {
                ...baseRule,
                region: ['default'],
                context: ['general'],
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                validate: (_expr) => true
            };
            this.culturalRules.push(culturalRule);
        } else {
            // Par défaut, considérer comme une règle sémantique
            const semanticRule: LSFSemanticRule = {
                ...baseRule,
                context: ['general'],
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                validate: (_expr, _metadata) => true
            };
            this.semanticRules.push(semanticRule);
        }
    }

    /**
     * Crée un objet Record vide et correctement typé.
     * Cette fonction auxiliaire contourne le problème de compatibilité de TypeScript.
     */
    private createEmptyRecord<T>(): Record<string, T> {
        return Object.create(null) as Record<string, T>;
    }

    /**
     * Initialise les statistiques de validation.
     * 
     * @returns Un objet contenant les statistiques initialisées.
     */
    private initializeStats(): ValidationStatistics {
        const emptyRecordNumber: Record<string, number> = this.createEmptyRecord<number>();
        return {
            totalValidations: 0,
            successfulValidations: 0,
            failedValidations: 0,
            averageValidationTime: 0,
            averageExecutionTime: 0,
            errorsByType: emptyRecordNumber,
            warningsByType: emptyRecordNumber,
            mostFrequentRuleViolations: []
        };
    }

    /**
     * Initialise les règles de validation (syntaxiques, sémantiques et culturelles).
     */
    private initializeRules(): void {
        // Initialisation des règles syntaxiques
        // Exemple d'une règle de syntaxe (à compléter selon les besoins)
        this.syntaxRules.push({
            id: 'syntax_001',
            description: 'Vérification de la structure de base',
            severity: ErrorSeverity.HIGH,
            errorMessage: 'Structure de base incorrecte',
            isEnabled: true,
            type: 'sequence',
            conditions: [
                (expr) => expr.parameters !== undefined && expr.parameters !== null
            ]
        });

        // Initialisation des règles sémantiques
        // Exemple d'une règle sémantique (à compléter selon les besoins)
        this.semanticRules.push({
            id: 'semantic_001',
            description: 'Vérification de la cohérence sémantique',
            severity: ErrorSeverity.MEDIUM,
            errorMessage: 'Incohérence sémantique détectée',
            isEnabled: true,
            context: ['general'],
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            validate: (_expr, _metadata) => {
                // Logique de validation sémantique
                return true;
            }
        });

        // Initialisation des règles culturelles
        // Exemple d'une règle culturelle (à compléter selon les besoins)
        this.culturalRules.push({
            id: 'cultural_001',
            description: 'Vérification du contexte culturel',
            severity: ErrorSeverity.LOW,
            errorMessage: 'Considération culturelle à prendre en compte',
            isEnabled: true,
            region: ['default'],
            context: ['general'],
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            validate: (_expr) => {
                // Logique de validation culturelle
                return true;
            }
        });
    }

    /**
     * Valide une donnée en tant qu'expression LSF.
     * 
     * @param data Donnée à valider.
     * @param options Options de validation (facultatif).
     * @returns Un résultat de validation.
     */
    async validate(data: unknown, options?: ValidationOptions): Promise<ValidationResult> {
        const startTime = Date.now();
        const validationOptions = options || {};

        if (!this.isLSFExpression(data)) {
            return {
                success: false,
                isValid: false,
                errors: [{
                    code: 'INVALID_LSF_EXPRESSION',
                    message: 'La donnée n\'est pas une expression LSF valide.',
                    severity: ErrorSeverity.HIGH,
                    timestamp: Date.now()
                }],
                metadata: this.createMetadata(startTime)
            };
        }

        const expr = data as LSFExpression;

        const syntaxErrors = validationOptions.skipSyntaxValidation ? [] : await this.validateSyntax(expr);
        const semanticErrors = validationOptions.skipSemanticValidation ? [] : await this.validateSemantics(expr);
        const culturalWarnings = validationOptions.skipCulturalValidation ? [] : await this.validateCulturalContext(expr);

        const isValid = syntaxErrors.length === 0 && semanticErrors.length === 0;
        this.updateStats(isValid, startTime);

        const result: ValidationResult = {
            success: isValid,
            isValid,
            errors: [...syntaxErrors, ...semanticErrors],
            warnings: culturalWarnings,
            metadata: this.createMetadata(startTime)
        };

        this.addToHistory(result);
        this.recentWarnings = [...this.recentWarnings, ...culturalWarnings].slice(-50);

        return result;
    }

    /**
     * Ajoute une validation à l'historique.
     * 
     * @param result Résultat de validation à ajouter.
     */
    private addToHistory(result: ValidationResult): void {
        this.validationHistory.push({
            timestamp: Date.now(),
            result
        });

        if (this.validationHistory.length > this.maxHistorySize) {
            this.validationHistory.shift();
        }
    }

    /**
     * Valide la syntaxe d'une expression LSF.
     * 
     * @param expr Expression à valider.
     * @returns Une liste d'erreurs de validation syntaxique.
     */
    private async validateSyntax(expr: LSFExpression): Promise<ValidationError[]> {
        const errors: ValidationError[] = [];
        for (const rule of this.syntaxRules) {
            const isValid = rule.conditions.every(condition => condition(expr));
            if (!isValid) {
                errors.push({
                    code: `SYNTAX_${rule.id}`,
                    message: `Erreur de syntaxe pour la règle ${rule.id}.`,
                    severity: this.mapSeverity(rule.severity),
                    field: rule.type,
                    timestamp: Date.now()
                });
            }
        }
        return errors;
    }

    /**
     * Mappe la sévérité des règles LSF vers ErrorSeverity.
     */
    private mapSeverity(severity: ErrorSeverity): ErrorSeverity {
        return severity;
    }

    /**
     * Valide la sémantique d'une expression LSF.
     * 
     * @param expr Expression à valider.
     * @returns Une liste d'erreurs de validation sémantique.
     */
    private async validateSemantics(expr: LSFExpression): Promise<ValidationError[]> {
        const errors: ValidationError[] = [];
        // Utilisation du contexte existant ou création d'un Record vide
        const contextMetadata = this.context.metadata ?? this.createEmptyRecord<unknown>();

        for (const rule of this.semanticRules) {
            if (!rule.validate(expr, contextMetadata)) {
                errors.push({
                    code: `SEMANTIC_${rule.id}`,
                    message: `Erreur sémantique dans le contexte ${rule.context.join(', ')}.`,
                    severity: this.mapSeverity(rule.severity),
                    timestamp: Date.now()
                });
            }
        }
        return errors;
    }

    /**
     * Valide le contexte culturel d'une expression LSF.
     * 
     * @param expr Expression à valider.
     * @returns Une liste d'avertissements de validation culturelle.
     */
    private async validateCulturalContext(expr: LSFExpression): Promise<ValidationWarning[]> {
        const warnings: ValidationWarning[] = [];
        for (const rule of this.culturalRules) {
            if (!rule.validate(expr)) {
                warnings.push({
                    code: `CULTURAL_${rule.id}`,
                    message: `Considération culturelle pour ${rule.region.join(', ')}.`,
                    impact: 'medium',
                    suggestion: rule.alternatives?.join(', ') || '',
                    timestamp: Date.now()
                });
            }
        }
        return warnings;
    }

    /**
     * Vérifie si une donnée est une expression LSF valide.
     * 
     * @param data Donnée à vérifier.
     * @returns `true` si la donnée est une expression LSF valide, sinon `false`.
     */
    private isLSFExpression(data: unknown): data is LSFExpression {
        return (
            typeof data === 'object' &&
            data !== null &&
            'type' in data &&
            'value' in data &&
            'parameters' in data &&
            'timing' in data
        );
    }

    /**
     * Crée les métadonnées pour un résultat de validation.
     * 
     * @param startTime Heure de début de la validation.
     * @returns Métadonnées de validation.
     */
    private createMetadata(startTime: number): ValidationMetadata {
        return {
            validatedAt: Date.now(),
            duration: Date.now() - startTime,
            validator: 'LSFValidator',
            version: '1.0.0',
            configuration: {
                rules: {
                    syntax: this.syntaxRules.length,
                    semantic: this.semanticRules.length,
                    cultural: this.culturalRules.length
                }
            },
            context: {
                environment: this.context.environment || 'default'
            }
        };
    }

    /**
     * Met à jour les statistiques de validation.
     * 
     * @param isValid Indique si la validation a réussi.
     * @param startTime Heure de début de la validation.
     */
    private updateStats(isValid: boolean, startTime: number): void {
        this.stats.totalValidations++;
        if (isValid) {
            this.stats.successfulValidations++;
        } else {
            this.stats.failedValidations++;
        }
        const duration = Date.now() - startTime;
        this.stats.averageValidationTime = (
            (this.stats.averageValidationTime * (this.stats.totalValidations - 1) + duration) /
            this.stats.totalValidations
        );
        this.stats.averageExecutionTime = this.stats.averageValidationTime;
        this.stats.lastValidation = {
            timestamp: Date.now(),
            duration,
            result: {
                success: isValid,
                isValid,
                errors: [],
                metadata: this.createMetadata(startTime)
            }
        };
    }
}