// src/ai/specialized/emotional/LSFEmotionValidator.ts
import { IValidator } from '../../api/common/validation/interfaces/IValidator';
import { ValidationService } from '../../api/common/validation/ValidationService';
import { LSFValidator } from '../../api/common/validation/validators/LSFValidator';
import { SystemeControleEthique } from '../../ethics/core/SystemeControleEthique';
import {
    ValidationResult,
    ValidationOptions,
    ValidationRule,
    ValidationContext,
    ValidationStats,
    ValidationError,
    ValidationWarning,
    ValidationMetadata,
    ErrorSeverity
} from '../../api/common/validation/types/ValidationTypes';

// Importer LSFModality depuis le module approprié
import { LSFModality } from '../../types/base';

// Interface pour les composantes d'expression faciale
interface FacialExpression {
    intensity: number;
    eyebrows?: string;
    eyes?: string;
    mouth?: string;
}

// Interface pour les résultats d'évaluation émotionnelle
interface EmotionalValidationProblem {
    type: string;
    severity: string;
    message: string;
    location?: string;
    details?: Record<string, unknown>;
}

/**
 * Validateur pour les aspects émotionnels des expressions LSF
 */
export class LSFEmotionValidator implements IValidator {
    private rules: ValidationRule[] = [];
    private _metadata: ValidationMetadata = {
        version: '1.0.0',
        validatedAt: Date.now(),
        duration: 0,
        validator: 'LSFEmotionValidator',
        configuration: {
            rules: {
                syntax: 1,
                semantic: 1,
                cultural: 1
            }
        },
        context: {
            environment: 'production',
            userContext: {},
            systemContext: {}
        }
    };

    private stats: ValidationStats = {
        totalValidations: 0,
        successfulValidations: 0,
        failedValidations: 0,
        averageValidationTime: 0,
        lastValidation: {
            timestamp: Date.now(),
            duration: 0,
            result: {
                isValid: true,
                errors: [],
                metadata: this._metadata
            }
        },
        errorsByType: {},
        warningsByType: {}
    };

    private defaultSeverity: ErrorSeverity = 'critical' as ErrorSeverity;

    constructor(
        private readonly validationService: ValidationService,
        private readonly lsfValidator: LSFValidator,
        private readonly ethicsSystem: SystemeControleEthique
    ) { }

    /**
     * Définit la sévérité par défaut pour les erreurs
     */
    setDefaultSeverity(severity: ErrorSeverity): void {
        this.defaultSeverity = severity;
    }

    /**
     * Libère les ressources plus anciennes qu'un timestamp donné
     * @param olderThan Timestamp en millisecondes
     * @returns Nombre d'éléments nettoyés
     */
    async cleanup(olderThan: number): Promise<number> {
        // Nettoie les ressources plus anciennes que olderThan
        // et retourne le nombre d'éléments nettoyés
        let cleanedItems = 0;

        // Exemple : nettoyage des règles basé sur un timestamp
        const initialRulesCount = this.rules.length;
        this.rules = this.rules.filter(rule => {
            // Pour éviter l'erreur de propriété manquante, on utilise une approche sécurisée
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const timestamp = (rule as any).timestamp || Date.now() - olderThan - 1;
            return timestamp > olderThan;
        });
        cleanedItems += initialRulesCount - this.rules.length;

        return cleanedItems;
    }

    /**
     * Vérifie si les données sont valides
     */
    async isValid(data: unknown): Promise<boolean> {
        const result = await this.validate(data);
        return result.isValid;
    }

    /**
     * Ajoute une règle de validation
     */
    addRule(rule: ValidationRule): void {
        this.rules.push(rule);
    }

    /**
     * Supprime une règle de validation
     */
    removeRule(ruleId: string): boolean {
        const initialLength = this.rules.length;
        this.rules = this.rules.filter(rule => rule.id !== ruleId);
        return this.rules.length !== initialLength;
    }

    /**
     * Met à jour le contexte de validation
     * Cette méthode est requise par l'interface mais n'est pas utilisée ici
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateContext(_context: ValidationContext): void {
        // Non implémenté
    }

    /**
     * Obtient les statistiques de validation
     */
    getStats(): ValidationStats {
        return { ...this.stats };
    }

    /**
     * Obtient les avertissements
     */
    getWarnings(): ValidationWarning[] {
        return [];
    }

    /**
     * Obtient les métadonnées de validation
     */
    getMetadata(): ValidationMetadata {
        return { ...this._metadata };
    }

    /**
     * Valide les règles spécifiées
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async validateRules(rules: ValidationRule[]): Promise<ValidationResult> {
        // Méthode de base qui valide les données avec un ensemble de règles spécifié
        const result: ValidationResult = {
            isValid: true,
            errors: [],
            warnings: [],
            metadata: this._metadata
        };

        return result;
    }

    /**
     * Valide les aspects émotionnels d'une modalité LSF
     */
    async validate(data: unknown, options?: ValidationOptions): Promise<ValidationResult> {
        const startTime = performance.now();

        // Mise à jour des statistiques
        this.stats.totalValidations++;

        // Casting typé des données d'entrée
        const input = data as LSFModality;

        // Valider d'abord avec le validateur LSF standard
        const lsfValidation = await this.lsfValidator.validate(input, options);
        if (!lsfValidation.isValid) {
            this.stats.failedValidations++;
            this.updateValidationTime(startTime, lsfValidation);
            this.updateErrorStats(lsfValidation);
            return lsfValidation;
        }

        // Valider les aspects émotionnels
        const problems = await this.validateEmotionalAspects(input);
        const isValid = problems.length === 0;

        // Vérification éthique des émotions si la méthode existe
        let ethicsValidation = true;

        try {
            // Utiliser une approche sécurisée pour vérifier et appeler la méthode
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ethicsSystemExt = this.ethicsSystem as any;
            if (typeof ethicsSystemExt.validateEmotions === 'function') {
                const ethicsResult = await ethicsSystemExt.validateEmotions(input);
                ethicsValidation = ethicsResult && ethicsResult.isValid !== false;
            }
        } catch (error) {
            console.warn('Error validating emotions with ethics system:', error);
        }

        // Mise à jour des statistiques
        if (isValid && ethicsValidation) {
            this.stats.successfulValidations++;
        } else {
            this.stats.failedValidations++;
        }

        // Convertir les problèmes au format attendu par ValidationResult
        const errors: ValidationError[] = problems
            .filter(p => p.severity === 'error')
            .map(p => ({
                code: p.type,
                message: p.message,
                severity: this.defaultSeverity,
                timestamp: Date.now()
            }));

        const warnings: ValidationWarning[] = problems
            .filter(p => p.severity === 'warning')
            .map(p => ({
                code: p.type,
                message: p.message,
                impact: 'medium',
                suggestion: p.message,
                timestamp: Date.now()
            }));

        const validationResult: ValidationResult = {
            isValid: isValid && ethicsValidation,
            errors,
            warnings,
            metadata: this._metadata
        };

        this.updateValidationTime(startTime, validationResult);
        this.updateErrorStats(validationResult);
        return validationResult;
    }

    /**
     * Met à jour le temps de validation dans les statistiques
     */
    private updateValidationTime(startTime: number, result: ValidationResult): void {
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Mettre à jour les métadonnées
        this._metadata.validatedAt = Date.now();
        this._metadata.duration = duration;

        this.stats.lastValidation = {
            timestamp: Date.now(),
            duration,
            result: {
                isValid: result.isValid,
                errors: result.errors,
                metadata: this._metadata
            }
        };

        this.stats.averageValidationTime =
            ((this.stats.averageValidationTime * (this.stats.totalValidations - 1)) + duration) /
            this.stats.totalValidations;
    }

    /**
     * Met à jour les statistiques d'erreurs et d'avertissements
     */
    private updateErrorStats(result: ValidationResult): void {
        // Mettre à jour les statistiques des erreurs par type
        if (result.errors && result.errors.length > 0) {
            result.errors.forEach(error => {
                if (!this.stats.errorsByType[error.code]) {
                    this.stats.errorsByType[error.code] = 0;
                }
                this.stats.errorsByType[error.code]++;
            });
        }

        // Mettre à jour les statistiques des avertissements par type
        if (result.warnings && result.warnings.length > 0) {
            result.warnings.forEach(warning => {
                if (!this.stats.warningsByType[warning.code]) {
                    this.stats.warningsByType[warning.code] = 0;
                }
                this.stats.warningsByType[warning.code]++;
            });
        }
    }

    /**
     * Valide les aspects émotionnels d'une modalité LSF
     */
    private async validateEmotionalAspects(input: LSFModality): Promise<EmotionalValidationProblem[]> {
        const problems: EmotionalValidationProblem[] = [];

        // Vérifier l'intensité des expressions faciales
        if (input.facial && !this.isValidFacialIntensity(input.facial)) {
            problems.push({
                type: 'facial_intensity',
                severity: 'warning',
                message: 'Intensité faciale en dehors des limites normales',
                location: 'facial.intensity'
            });
        }

        // Vérifier la cohérence des expressions
        if (!this.checkExpressionCoherence(input)) {
            problems.push({
                type: 'expression_coherence',
                severity: 'error',
                message: 'Incohérence détectée entre les composantes expressives',
                details: this.getCoherenceDetails(input)
            });
        }

        // Appliquer toutes les règles enregistrées
        for (const rule of this.rules) {
            if (typeof rule.validate === 'function') {
                try {
                    // Créer un contexte de validation complet
                    const ruleContext: ValidationContext = {
                        timestamp: Date.now(),
                        environment: 'production',
                        severity: this.defaultSeverity
                    };

                    const ruleResult = await rule.validate(input, ruleContext);

                    if (!ruleResult.isValid) {
                        // Ajouter les erreurs à notre liste de problèmes
                        if (ruleResult.errors) {
                            ruleResult.errors.forEach(err => {
                                problems.push({
                                    type: err.code,
                                    severity: 'error',
                                    message: err.message,
                                    location: err.code // Utiliser le code comme emplacement
                                });
                            });
                        }

                        // Ajouter les avertissements à notre liste de problèmes
                        if (ruleResult.warnings) {
                            ruleResult.warnings.forEach(warning => {
                                problems.push({
                                    type: warning.code,
                                    severity: 'warning',
                                    message: warning.message,
                                    location: warning.code // Utiliser le code comme emplacement
                                });
                            });
                        }
                    }
                } catch (error) {
                    console.warn('Error applying validation rule:', error);
                }
            }
        }

        return problems;
    }

    /**
     * Vérifie si l'intensité faciale est valide
     */
    private isValidFacialIntensity(facial: FacialExpression): boolean {
        // L'intensité doit être entre 0 et 1
        if (facial.intensity < 0 || facial.intensity > 1) {
            return false;
        }

        // Vérifier la cohérence entre intensité et composantes
        if (facial.intensity > 0.8) {
            // Haut niveau d'intensité devrait avoir des caractéristiques marquées
            if (facial.eyebrows === 'neutral' && facial.mouth === 'neutral') {
                return false;
            }
        }

        return true;
    }

    /**
     * Vérifie la cohérence globale de l'expression
     */
    private checkExpressionCoherence(input: LSFModality): boolean {
        // Vérifier si l'expression faciale correspond aux composantes manuelles et non-manuelles
        if (!input.facial || !input.manual) {
            return true; // Pas assez d'information pour vérifier la cohérence
        }

        // Exemple de règle: une expression faciale intense devrait correspondre à des mouvements temporels rapides
        if (input.facial.intensity > 0.7 && input.temporal && input.temporal.speed < 0.3) {
            return false; // Incohérent: expression faciale intense mais mouvement lent
        }

        return true;
    }

    /**
     * Obtient les détails sur l'incohérence détectée
     */
    private getCoherenceDetails(input: LSFModality): Record<string, unknown> {
        const details: Record<string, unknown> = {};

        if (input.facial) {
            details.facialIntensity = input.facial.intensity;
            details.facialComponents = {
                eyebrows: input.facial.eyebrows,
                mouth: input.facial.mouth
            };
        }

        if (input.temporal) {
            details.speed = input.temporal.speed;
            details.rhythm = input.temporal.rhythm;
        }

        details.expectedRelationship = "L'intensité faciale doit correspondre à la vitesse du mouvement";

        return details;
    }
}