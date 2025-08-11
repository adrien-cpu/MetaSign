// src/ai/systems/expressions/situations/educational/special_needs/adaptations/validation/EnhancedValidationService.ts

import { IValidationService } from '../interfaces/IAdaptationDependencies';
import {
    AdaptationStrategy,
    ContextAnalysisResult
} from '../types/adaptation-dependency-types';

/**
 * Interface pour le résultat de validation
 */
interface ValidationResult {
    /** Indique si la validation est réussie */
    valid: boolean;
    /** Problèmes identifiés (undefined si aucun problème) */
    issues?: string[] | undefined;
}

/**
 * Service de validation amélioré avec vérifications approfondies
 */
export class EnhancedValidationService implements IValidationService {
    /**
     * Valide les données selon les critères spécifiés
     * @param data - Données à valider
     * @param criteria - Critères de validation
     * @returns Résultat de la validation
     */
    async validate(data: unknown, criteria: Record<string, unknown>): Promise<ValidationResult> {
        // Traiter différents types de données à valider
        if (!data) {
            return {
                valid: false,
                issues: ["Données nulles ou non définies"]
            };
        }

        const dataObj = data as Record<string, unknown>;
        const issues: string[] = [];

        // Validation différente selon le type de données
        switch (criteria.type) {
            case 'adaptation_result':
                this.validateAdaptationResult(dataObj, issues, criteria.strictMode as boolean);
                break;

            case 'context_analysis':
                this.validateContextAnalysis(dataObj as unknown as ContextAnalysisResult, issues);
                break;

            case 'adaptation_strategy':
                this.validateAdaptationStrategy(dataObj as unknown as AdaptationStrategy, issues);
                break;

            default:
                // Validation basique pour types non spécifiés
                if (typeof dataObj.success === 'boolean' && !dataObj.success) {
                    issues.push("Les données indiquent un échec");
                }
        }

        // Renvoyer le résultat avec ou sans issues selon qu'il y en a ou non
        if (issues.length === 0) {
            return { valid: true };
        } else {
            return {
                valid: false,
                issues: issues
            };
        }
    }

    /**
     * Valide le résultat d'une adaptation
     * @param result - Résultat à valider
     * @param issues - Liste des problèmes identifiés
     * @param strictMode - Activer le mode de validation strict
     */
    private validateAdaptationResult(result: Record<string, unknown>, issues: string[], strictMode: boolean): void {
        // Vérification des champs obligatoires
        if (result.success === undefined) {
            issues.push("Champ 'success' manquant");
        }

        if (typeof result.effectiveness !== 'number') {
            issues.push("Champ 'effectiveness' non numérique");
        } else if (strictMode && result.effectiveness < 50) {
            issues.push("Efficacité trop basse en mode strict");
        }

        // Vérification des stratégies
        if (!result.strategies) {
            issues.push("Champ 'strategies' manquant");
        } else {
            const strategies = result.strategies as Record<string, unknown>;
            if (!Array.isArray(strategies.primary)) {
                issues.push("'strategies.primary' doit être un tableau");
            }
        }

        // Vérification des recommandations
        if (!result.recommendations || !Array.isArray(result.recommendations)) {
            issues.push("'recommendations' doit être un tableau");
        }
    }

    /**
     * Valide l'analyse de contexte
     * @param context - Analyse de contexte à valider
     * @param issues - Liste des problèmes identifiés
     */
    private validateContextAnalysis(context: ContextAnalysisResult, issues: string[]): void {
        // Vérification de la structure environmental
        if (!context.environmental) {
            issues.push("Champ 'environmental' manquant");
        } else {
            if (!context.environmental.lighting) {
                issues.push("'environmental.lighting' manquant");
            }
            if (!context.environmental.noise) {
                issues.push("'environmental.noise' manquant");
            }
            if (!context.environmental.spatial) {
                issues.push("'environmental.spatial' manquant");
            }
        }

        // Vérification de la structure learner
        if (!context.learner) {
            issues.push("Champ 'learner' manquant");
        } else {
            if (!context.learner.attention) {
                issues.push("'learner.attention' manquant");
            }
            if (!context.learner.visual) {
                issues.push("'learner.visual' manquant");
            }
            if (!context.learner.cognitive) {
                issues.push("'learner.cognitive' manquant");
            }
        }

        // Vérification du timestamp
        if (!context.timestamp) {
            issues.push("'timestamp' manquant");
        }
    }

    /**
     * Valide une stratégie d'adaptation
     * @param strategy - Stratégie à valider
     * @param issues - Liste des problèmes identifiés
     */
    private validateAdaptationStrategy(strategy: AdaptationStrategy, issues: string[]): void {
        if (!strategy.id) {
            issues.push("'id' manquant dans la stratégie");
        }

        if (!strategy.name) {
            issues.push("'name' manquant dans la stratégie");
        }

        if (!strategy.parameters) {
            issues.push("'parameters' manquant dans la stratégie");
        }
    }
}