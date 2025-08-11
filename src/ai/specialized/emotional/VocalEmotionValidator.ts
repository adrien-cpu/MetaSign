// src/ai/specialized/emotional/VocalEmotionValidator.ts

// Utilisation des alias pour les imports qui fonctionnent
import { ValidationService } from '@api/common/validation/ValidationService';
import { SystemeControleEthique } from '@ai/ethics/core/SystemeControleEthique';

// Définition locale des interfaces pour éviter les problèmes d'importation
interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings?: ValidationWarning[];
    metadata: ValidationMetadata;
}

interface ValidationError {
    code: string;
    message: string;
    severity: ErrorSeverity;
    field?: string;
    timestamp: number;
    details?: unknown;
}

interface ValidationWarning {
    code: string;
    message: string;
    impact: 'low' | 'medium' | 'high';
    suggestion: string;
    timestamp: number;
    context?: Record<string, unknown>;
    details?: unknown;
}

interface ValidationMetadata {
    validatedAt: number;
    duration: number;
    validator: string;
    version: string;
    configuration: {
        rules: {
            syntax: number;
            semantic: number;
            cultural: number;
        };
    };
    context: {
        environment: string;
        userContext?: Record<string, unknown>;
        systemContext?: Record<string, unknown>;
    };
}

enum ErrorSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

interface ValidationOptions {
    skipSyntaxValidation?: boolean;
    skipSemanticValidation?: boolean;
    skipCulturalValidation?: boolean;
    minErrorSeverity?: ErrorSeverity;
    context?: Record<string, unknown>;
}

// Interface pour définir la modalité vocale
interface VocalModality {
    type: 'vocal';
    prosody?: {
        pitch?: number;
        rate?: number;
        volume?: number;
    };
    emotion?: string;
    intensity?: number;
}

/**
 * Validateur d'émotions vocales
 * Vérifie la cohérence et la validité des émotions exprimées vocalement
 */
export class VocalEmotionValidator {
    constructor(
        private readonly validationService: ValidationService,
        private readonly ethicsSystem: SystemeControleEthique
    ) { }

    /**
     * Valide les données de modalité vocale
     * @param data Les données à valider
     * @param _options Options de validation (non utilisées)
     * @returns Résultat de la validation
     */
    async validate(data: unknown, _options?: ValidationOptions): Promise<ValidationResult> {
        const startTime = Date.now();

        // Vérifier que les données sont du type VocalModality
        if (!this.isVocalModality(data)) {
            const metadata = this.createMetadata(startTime, 'type_validation');

            return {
                isValid: false,
                errors: [{
                    code: 'INVALID_TYPE',
                    message: 'Les données ne sont pas une modalité vocale valide',
                    severity: ErrorSeverity.HIGH,
                    timestamp: Date.now()
                }],
                metadata
            };
        }

        const input = data as VocalModality;

        // Validation de base de la modalité vocale
        const vocalValidation = await this.validateVocalParameters(input);

        // Validation des aspects émotionnels
        const emotionalValidation = await this.validateEmotionalContent(input);

        // Vérification éthique - adapter si la méthode n'existe pas
        const ethicsValidation = await this.validateEmotions(input);

        // Combiner les résultats - adapter si la méthode n'existe pas
        return this.mergeValidationResults([
            vocalValidation,
            emotionalValidation,
            ethicsValidation
        ], startTime);
    }

    /**
     * Vérifie si les données correspondent à une modalité vocale
     * @param data Données à vérifier
     * @returns true si les données sont une modalité vocale valide
     */
    private isVocalModality(data: unknown): boolean {
        if (typeof data !== 'object' || data === null) return false;

        const modal = data as Partial<VocalModality>;
        // Vérification basique que c'est une modalité vocale
        return 'type' in modal && modal.type === 'vocal';
    }

    /**
     * Valide les paramètres vocaux
     * @param input Modalité vocale à valider
     * @returns Résultat de la validation
     */
    private async validateVocalParameters(input: VocalModality): Promise<ValidationResult> {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];
        const startTime = Date.now();

        // Vérifier les paramètres prosodiques
        if (input.prosody && !this.isValidProsody(input.prosody)) {
            warnings.push({
                code: 'INVALID_PROSODY',
                message: 'Paramètres prosodiques hors normes',
                impact: 'medium',
                suggestion: 'Ajuster les paramètres prosodiques dans les plages normales',
                timestamp: Date.now()
            });
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            metadata: this.createMetadata(startTime, 'vocal_parameters')
        };
    }

    /**
     * Valide le contenu émotionnel
     * @param input Modalité vocale à valider
     * @returns Résultat de la validation
     */
    private async validateEmotionalContent(input: VocalModality): Promise<ValidationResult> {
        const errors: ValidationError[] = [];
        const startTime = Date.now();

        // Vérifier la cohérence émotionnelle
        if (!this.checkEmotionalCoherence(input)) {
            errors.push({
                code: 'EMOTIONAL_INCOHERENCE',
                message: 'Incohérence émotionnelle détectée',
                severity: ErrorSeverity.MEDIUM,
                timestamp: Date.now()
            });
        }

        return {
            isValid: errors.length === 0,
            errors,
            metadata: this.createMetadata(startTime, 'emotional_content')
        };
    }

    /**
     * Valide les émotions selon les critères éthiques
     * @param input Modalité vocale à valider
     * @returns Résultat de la validation
     */
    private async validateEmotions(input: VocalModality): Promise<ValidationResult> {
        const startTime = Date.now();

        try {
            // Si validateEmotions existe sur ethicsSystem, l'utiliser
            if ('validateEmotions' in this.ethicsSystem &&
                typeof this.ethicsSystem.validateEmotions === 'function') {
                return await this.ethicsSystem.validateEmotions(input);
            }

            // Sinon, effectuer une validation basique
            const warnings: ValidationWarning[] = [];

            // Vérifier les émotions intenses
            if (input.intensity && input.intensity > 0.8) {
                warnings.push({
                    code: 'HIGH_INTENSITY',
                    message: 'Intensité émotionnelle élevée',
                    impact: 'medium',
                    suggestion: 'Considérer une réduction de l\'intensité émotionnelle',
                    timestamp: Date.now()
                });
            }

            return {
                isValid: true,
                errors: [],
                warnings,
                metadata: this.createMetadata(startTime, 'ethics_validation')
            };
        } catch (error) {
            return {
                isValid: false,
                errors: [{
                    code: 'ETHICS_VALIDATION_ERROR',
                    message: `Erreur lors de la validation éthique: ${error instanceof Error ? error.message : String(error)}`,
                    severity: ErrorSeverity.HIGH,
                    timestamp: Date.now()
                }],
                metadata: this.createMetadata(startTime, 'ethics_validation')
            };
        }
    }

    /**
     * Fusionne plusieurs résultats de validation
     * @param results Résultats à fusionner
     * @param startTime Heure de début pour le calcul de la durée
     * @returns Résultat fusionné
     */
    private mergeValidationResults(results: ValidationResult[], startTime: number): ValidationResult {
        // Si combineResults existe sur validationService, l'utiliser
        if ('combineResults' in this.validationService &&
            typeof this.validationService.combineResults === 'function') {
            return this.validationService.combineResults(results);
        }

        // Sinon, implémenter notre propre logique de fusion
        const isValid = results.every(result => result.isValid);
        const allErrors = results.flatMap(result => result.errors || []);
        const allWarnings = results.flatMap(result => result.warnings || []);

        return {
            isValid,
            errors: allErrors,
            warnings: allWarnings,
            metadata: this.createMetadata(startTime, 'merged_validation')
        };
    }

    /**
     * Crée les métadonnées de validation
     * @param startTime Heure de début pour le calcul de la durée
     * @param validatorName Nom du validateur
     * @returns Métadonnées de validation
     */
    private createMetadata(startTime: number, validatorName: string): ValidationMetadata {
        return {
            validatedAt: Date.now(),
            duration: Date.now() - startTime,
            validator: `VocalEmotionValidator_${validatorName}`,
            version: '1.0.0',
            configuration: {
                rules: {
                    syntax: 1,
                    semantic: 1,
                    cultural: 1
                }
            },
            context: {
                environment: 'production'
            }
        };
    }

    /**
     * Vérifie si les paramètres prosodiques sont valides
     * @param prosody Paramètres prosodiques à vérifier
     * @returns true si les paramètres sont valides
     */
    private isValidProsody(prosody: { pitch?: number; rate?: number; volume?: number }): boolean {
        // Implémentation de la validation prosodique
        // Vérifier que les valeurs sont dans des plages raisonnables
        if (prosody.pitch !== undefined && (prosody.pitch < 0 || prosody.pitch > 2)) {
            return false;
        }
        if (prosody.rate !== undefined && (prosody.rate < 0.5 || prosody.rate > 2)) {
            return false;
        }
        if (prosody.volume !== undefined && (prosody.volume < 0 || prosody.volume > 1)) {
            return false;
        }

        return true;
    }

    /**
     * Vérifie la cohérence entre l'émotion et la prosodie
     * @param input Modalité vocale à vérifier
     * @returns true si l'émotion est cohérente avec la prosodie
     */
    private checkEmotionalCoherence(input: VocalModality): boolean {
        // Implémentation de la vérification de cohérence émotionnelle
        // Par exemple, vérifier que l'émotion est cohérente avec la prosodie

        if (!input.emotion) return true; // Pas d'émotion spécifiée

        const emotion = input.emotion.toLowerCase();
        const prosody = input.prosody;

        if (!prosody) return true; // Pas de prosodie spécifiée

        // Vérifications de cohérence basiques
        if (emotion === 'happy' && prosody.pitch && prosody.pitch < 0.8) {
            return false; // Une émotion joyeuse devrait avoir un pitch plus élevé
        }

        if (emotion === 'sad' && prosody.rate && prosody.rate > 0.9) {
            return false; // Une émotion triste devrait avoir un débit plus lent
        }

        return true;
    }
}