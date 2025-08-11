/**
 * src/ai/api/common/validation/validators/SecurityValidator.ts
 * @file SecurityValidator.ts
 * @description
 * Implémente un validateur pour les contextes de sécurité. Ce validateur prend en charge
 * la validation des règles d'authentification, d'autorisation et de protection des données.
 * Il fournit également des statistiques de validation, un journal d'audit et des avertissements.
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
    SecurityContext,
    AuthenticationRule,
    AuthorizationRule,
    DataProtectionRule,
    SecurityAudit
} from '../types/SecurityTypes';
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
        result: { isValid: boolean; errors: ValidationError[]; metadata: ValidationMetadata };
    };
}

/**
 * Classe `SecurityValidator` pour valider les contextes de sécurité.
 */
export class SecurityValidator implements IValidator<SecurityContext> {
    private authRules: AuthenticationRule[] = [];
    private authzRules: AuthorizationRule[] = [];
    private dataProtectionRules: DataProtectionRule[] = [];
    private stats: ValidationStatistics;
    private auditLog: SecurityAudit[] = [];

    /**
     * Constructeur de la classe `SecurityValidator`.
     */
    constructor() {
        this.stats = this.initializeStats();
        this.initializeRules();
    }

    /**
     * Crée un objet `Record` vide et correctement typé.
     * 
     * @returns Un objet `Record` vide.
     */
    private createEmptyRecord<T>(): Record<string, T> {
        return Object.create(null);
    }

    /**
     * Initialise les statistiques de validation.
     * 
     * @returns Un objet contenant les statistiques initialisées.
     */
    private initializeStats(): ValidationStatistics {
        return {
            totalValidations: 0,
            successfulValidations: 0,
            failedValidations: 0,
            averageValidationTime: 0,
            averageExecutionTime: 0,
            errorsByType: this.createEmptyRecord<number>(),
            warningsByType: this.createEmptyRecord<number>(),
            mostFrequentRuleViolations: []
        };
    }

    /**
     * Initialise les règles d'authentification, d'autorisation et de protection des données.
     */
    private initializeRules(): void {
        this.initializeAuthRules();
        this.initializeAuthzRules();
        this.initializeDataProtectionRules();
    }

    /**
     * Valide un contexte de sécurité.
     * 
     * @param context Contexte de sécurité à valider.
     * @param options Options de validation (facultatif).
     * @returns Un résultat de validation.
     */
    async validate(context: SecurityContext, options?: ValidationOptions): Promise<ValidationResult> {
        const startTime = Date.now();
        try {
            if (options) {
                this.applyValidationOptions(options);
            }

            const authErrors = await this.validateAuthentication(context);
            const authzErrors = await this.validateAuthorization(context);
            const dataErrors = await this.validateDataProtection(context);

            const allErrors = [...authErrors, ...authzErrors, ...dataErrors];
            const isValid = allErrors.length === 0;

            this.updateStats(isValid, startTime);
            this.logAudit(context, isValid, allErrors);

            return {
                isValid,
                errors: allErrors,
                warnings: this.generateWarnings(context),
                metadata: this.createMetadata(startTime)
            };
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Unknown security validation error';
            return {
                isValid: false,
                errors: [{
                    code: 'SECURITY_VALIDATION_FAILED',
                    message: errorMessage,
                    severity: ErrorSeverity.CRITICAL,
                    timestamp: Date.now()
                }],
                metadata: this.createMetadata(startTime)
            };
        }
    }

    /**
     * Valide les règles d'authentification.
     * 
     * @param context Contexte de sécurité.
     * @returns Une liste d'erreurs d'authentification.
     */
    private async validateAuthentication(context: SecurityContext): Promise<ValidationError[]> {
        const errors: ValidationError[] = [];
        for (const rule of this.authRules) {
            try {
                const isValid = await rule.validate(context);
                if (!isValid) {
                    errors.push({
                        code: `AUTH_${rule.id}`,
                        message: rule.errorMessage,
                        severity: this.mapSeverity(rule.severity),
                        timestamp: Date.now(),
                        details: {
                            method: context.auth.type,
                            requiredMFA: rule.requireMFA
                        }
                    });
                }
            } catch (e) {
                console.error(`Authentication validation error: ${e instanceof Error ? e.message : 'Unknown error'}`);
                errors.push({
                    code: 'AUTH_ERROR',
                    message: 'Authentication validation failed',
                    severity: ErrorSeverity.CRITICAL,
                    timestamp: Date.now()
                });
            }
        }
        return errors;
    }

    /**
     * Valide les règles d'autorisation.
     * 
     * @param context Contexte de sécurité.
     * @returns Une liste d'erreurs d'autorisation.
     */
    private async validateAuthorization(context: SecurityContext): Promise<ValidationError[]> {
        const errors: ValidationError[] = [];
        for (const rule of this.authzRules) {
            try {
                const isValid = await rule.validate(context);
                if (!isValid) {
                    errors.push({
                        code: `AUTHZ_${rule.id}`,
                        message: rule.errorMessage,
                        severity: this.mapSeverity(rule.severity),
                        timestamp: Date.now(),
                        details: {
                            requiredRoles: rule.requiredRoles,
                            userRoles: context.roles
                        }
                    });
                }
            } catch (e) {
                console.error(`Authorization validation error: ${e instanceof Error ? e.message : 'Unknown error'}`);
                errors.push({
                    code: 'AUTHZ_ERROR',
                    message: 'Authorization validation failed',
                    severity: ErrorSeverity.HIGH,
                    timestamp: Date.now()
                });
            }
        }
        return errors;
    }

    /**
     * Valide les règles de protection des données.
     * 
     * @param context Contexte de sécurité.
     * @returns Une liste d'erreurs de protection des données.
     */
    private async validateDataProtection(context: SecurityContext): Promise<ValidationError[]> {
        const errors: ValidationError[] = [];
        for (const rule of this.dataProtectionRules) {
            try {
                const isValid = await rule.validate(context);
                if (!isValid) {
                    errors.push({
                        code: `DATA_PROTECTION_${rule.id}`,
                        message: rule.errorMessage,
                        severity: this.mapSeverity(rule.severity),
                        timestamp: Date.now(),
                        details: {
                            requiredEncryption: rule.requiredEncryption,
                            currentEncryption: context.encryptionLevel
                        }
                    });
                }
            } catch (e) {
                console.error(`Data protection validation error: ${e instanceof Error ? e.message : 'Unknown error'}`);
                errors.push({
                    code: 'DATA_PROTECTION_ERROR',
                    message: 'Data protection validation failed',
                    severity: ErrorSeverity.HIGH,
                    timestamp: Date.now()
                });
            }
        }
        return errors;
    }

    private mapSeverity(severity: string): ErrorSeverity {
        const severityMap: Record<string, ErrorSeverity> = {
            'low': ErrorSeverity.LOW,
            'medium': ErrorSeverity.MEDIUM,
            'high': ErrorSeverity.HIGH,
            'critical': ErrorSeverity.CRITICAL
        };
        return severityMap[severity] || ErrorSeverity.MEDIUM;
    }

    private generateWarnings(context: SecurityContext): ValidationWarning[] {
        const warnings: ValidationWarning[] = [];

        // Vérifier l'expiration imminente
        if (context.auth.expires && context.auth.expires - Date.now() < 3600000) {
            warnings.push({
                code: 'AUTH_EXPIRING',
                message: 'Authentication token will expire soon',
                impact: 'medium',
                suggestion: 'Refresh your authentication token',
                timestamp: Date.now()
            });
        }

        return warnings;
    }

    private createMetadata(startTime: number): ValidationMetadata {
        return {
            validatedAt: Date.now(),
            duration: Date.now() - startTime,
            validator: 'SecurityValidator',
            version: '1.0.0',
            configuration: {
                rules: {
                    syntax: this.authRules.length,     // Adaptés pour correspondre à la structure attendue
                    semantic: this.authzRules.length,  // Adaptés pour correspondre à la structure attendue
                    cultural: this.dataProtectionRules.length  // Adaptés pour correspondre à la structure attendue
                }
            },
            context: {
                environment: 'security'
            }
        };
    }

    private logAudit(context: SecurityContext, isValid: boolean, errors: ValidationError[]): void {
        this.auditLog.push({
            timestamp: Date.now(),
            context: { ...context },
            rules: {
                passed: this.getRulesPassed(errors),
                failed: this.getRulesFailed(errors)
            },
            details: {
                isValid,
                errorCount: errors.length,
                errorTypes: this.getErrorTypes(errors)
            }
        });
    }

    private getRulesPassed(errors: ValidationError[]): string[] {
        const failedRules = new Set(errors.map(e => e.code));
        return [...this.authRules, ...this.authzRules, ...this.dataProtectionRules]
            .map(r => r.id)
            .filter(id => !failedRules.has(id));
    }

    private getRulesFailed(errors: ValidationError[]): string[] {
        return errors.map(e => e.code);
    }

    private getErrorTypes(errors: ValidationError[]): Record<string, number> {
        return errors.reduce((acc, error) => {
            const type = error.code.split('_')[0];
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, this.createEmptyRecord<number>());
    }

    // Implémentation des méthodes de l'interface IValidator
    addRule(ruleToAdd: ValidationRuleDefinition): void {
        console.log(`Adding rule: ${ruleToAdd.id}`);
        // Implémenter l'ajout de règle selon son type
    }

    removeRule(ruleIdToRemove: string): void {
        console.log(`Removing rule: ${ruleIdToRemove}`);
        // Implémenter la suppression de règle
    }

    updateContext(contextToUpdate: ValidationContext): void {
        console.log(`Updating context: ${JSON.stringify(contextToUpdate)}`);
        // Mettre à jour le contexte
    }

    getValidationStatistics(): ValidationStatistics {
        return { ...this.stats };
    }

    hasError(result: ValidationResult, errorCode: string): boolean {
        return result.errors.some(error => error.code === errorCode);
    }

    getName(): string {
        return 'SecurityValidator';
    }

    async isValid(data: unknown): Promise<boolean> {
        if (!this.isSecurityContext(data)) {
            return false;
        }
        const result = await this.validate(data);
        return result.isValid;
    }

    async validateRules(rulesToValidate: ValidationRuleDefinition[]): Promise<ValidationResult> {
        console.log(`Validating ${rulesToValidate.length} rules`);
        // Implémenter la validation des règles spécifiques
        return {
            isValid: true,
            errors: [],
            metadata: this.createMetadata(Date.now())
        };
    }

    getWarnings(): ValidationWarning[] {
        return [];
    }

    getMetadata(): ValidationMetadata {
        return this.createMetadata(Date.now());
    }

    setDefaultSeverity(severityLevel: ErrorSeverity): void {
        console.log(`Setting default severity to: ${severityLevel}`);
        // Implémenter le changement de sévérité par défaut
    }

    async cleanup(olderThan: number): Promise<number> {
        const initialLength = this.auditLog.length;
        this.auditLog = this.auditLog.filter(log => log.timestamp >= olderThan);
        return initialLength - this.auditLog.length;
    }

    private isSecurityContext(data: unknown): data is SecurityContext {
        return (
            typeof data === 'object' &&
            data !== null &&
            'roles' in data &&
            'permissions' in data &&
            'auth' in data
        );
    }

    private applyValidationOptions(options: ValidationOptions): void {
        // Appliquer les options spécifiques de validation
        console.log(`Applying validation options: ${JSON.stringify(options)}`);
    }

    private initializeAuthRules(): void {
        // Initialiser les règles d'authentification
    }

    private initializeAuthzRules(): void {
        // Initialiser les règles d'autorisation
    }

    private initializeDataProtectionRules(): void {
        // Initialiser les règles de protection des données
    }

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
    }
}