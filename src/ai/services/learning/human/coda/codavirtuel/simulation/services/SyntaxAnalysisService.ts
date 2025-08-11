/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/services/SyntaxAnalysisService.ts
 * @description Service d'analyse et d'évaluation syntaxique LSF
 * @author MetaSign
 * @version 2.0.0
 * @since 2024
 * 
 * Ce service fournit des utilitaires pour analyser la complexité syntaxique,
 * valider les structures et générer des rapports d'évaluation.
 * 
 * @module SyntaxAnalysisService
 */

import { ErrorTransformationType } from '../types/ErrorTypes';
import type { LSFSign } from '../types/LSFContentTypes';
import type { ErrorTransformation } from '../types/ErrorTypes';

/**
 * Interface pour l'analyse syntaxique avancée
 */
export interface SyntaxAnalysis {
    readonly originalOrder: readonly (string | undefined)[];
    readonly modifiedOrder: readonly (string | undefined)[];
    readonly errorType: string;
    readonly linguisticImpact: 'minimal' | 'moderate' | 'severe' | 'critical';
    readonly comprehensibilityScore: number;
    readonly suggestions: readonly string[];
}

/**
 * Interface pour l'évaluation de la complexité syntaxique
 */
export interface SyntaxComplexityEvaluation {
    readonly baseComplexity: number;
    readonly structuralElements: readonly string[];
    readonly interferenceLevel: number;
    readonly adaptationRecommendations: readonly string[];
}

/**
 * Interface pour la validation syntaxique
 */
export interface SyntaxValidation {
    readonly isValid: boolean;
    readonly errors: readonly string[];
    readonly warnings: readonly string[];
    readonly quality: number;
    readonly suggestions: readonly string[];
}

/**
 * Interface pour les statistiques de transformation
 */
export interface TransformationStats {
    totalTransformations: number;
    successfulTransformations: number;
    errorsByType: Record<string, number>;
    averageComplexityImpact: number;
    mostCommonPatterns: readonly string[];
}

/**
 * Service d'analyse syntaxique LSF
 * Fournit des utilitaires pour l'évaluation de la qualité syntaxique
 */
export class SyntaxAnalysisService {
    /**
     * Analyse la complexité syntaxique du contenu
     * @param content - Contenu LSF
     * @returns Évaluation de complexité
     */
    public static analyzeSyntaxComplexity(content: Record<string, unknown>): SyntaxComplexityEvaluation {
        const sequence = content.sequence as LSFSign[] || [];

        // Calcul de la complexité de base
        const baseComplexity = this.calculateBaseComplexity(sequence);

        // Identification des éléments structurels
        const structuralElements = this.identifyStructuralElements(sequence);

        // Niveau d'interférence
        const interferenceLevel = this.calculateInterferenceLevel(content);

        // Recommandations d'adaptation
        const adaptationRecommendations = this.generateAdaptationRecommendations(
            baseComplexity,
            structuralElements,
            interferenceLevel
        );

        return {
            baseComplexity,
            structuralElements,
            interferenceLevel,
            adaptationRecommendations
        };
    }

    /**
     * Valide une séquence de signes
     * @param content - Contenu LSF
     * @returns Résultat de validation
     */
    public static validateTransformedSequence(content: Record<string, unknown>): SyntaxValidation {
        const sequence = content.sequence as LSFSign[] || [];
        const errors: string[] = [];
        const warnings: string[] = [];

        // Validation de base
        if (sequence.length === 0) {
            errors.push('Séquence vide');
        }

        // Validation syntaxique
        if (!this.validateSyntaxStructure(sequence)) {
            errors.push('Structure syntaxique invalide');
        }

        // Vérification des doublons
        const duplicates = this.findConsecutiveDuplicates(sequence);
        if (duplicates.length > 0) {
            warnings.push(`Doublons détectés aux positions: ${duplicates.join(', ')}`);
        }

        // Calcul de la qualité
        const quality = this.calculateSequenceQuality(sequence, errors, warnings);

        // Suggestions d'amélioration
        const suggestions = this.generateValidationSuggestions(errors, warnings);

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            quality,
            suggestions
        };
    }

    /**
     * Génère une analyse syntaxique complète
     * @param content - Contenu LSF
     * @param transform - Transformation appliquée
     * @returns Analyse syntaxique
     */
    public static generateSyntaxAnalysis(content: Record<string, unknown>, transform: ErrorTransformation): SyntaxAnalysis {
        const sequence = content.sequence as LSFSign[] || [];

        // Reconstruction de l'ordre original (conceptuel)
        const originalOrder = sequence.map(sign => sign.id);
        const modifiedOrder = [...originalOrder]; // Simplifié pour l'exemple

        // Évaluation de l'impact linguistique
        const linguisticImpact = this.evaluateLinguisticImpact(transform, content);

        // Score de compréhensibilité
        const comprehensibilityScore = this.calculateComprehensibilityScore(content);

        // Suggestions d'amélioration
        const suggestions = this.generateImprovementSuggestions(content, transform);

        return {
            originalOrder,
            modifiedOrder,
            errorType: transform.type || 'unknown',
            linguisticImpact,
            comprehensibilityScore,
            suggestions
        };
    }

    /**
     * Calcule la complexité de base d'une séquence
     * @param sequence - Séquence de signes
     * @returns Complexité (0-1)
     * @private
     */
    private static calculateBaseComplexity(sequence: LSFSign[]): number {
        if (sequence.length === 0) return 0;

        let complexity = 0;

        // Longueur de la séquence
        complexity += Math.min(sequence.length / 10, 0.5);

        // Diversité des types de signes
        const types = new Set(sequence.map(sign => sign.type));
        complexity += types.size / 10;

        // Présence d'éléments complexes
        const complexElements = sequence.filter(sign =>
            sign.category === 'classifier' ||
            sign.type === 'complex_verb'
        );
        complexity += complexElements.length / sequence.length * 0.3;

        return Math.min(complexity, 1);
    }

    /**
     * Identifie les éléments structurels
     * @param sequence - Séquence de signes
     * @returns Éléments identifiés
     * @private
     */
    private static identifyStructuralElements(sequence: LSFSign[]): readonly string[] {
        const elements: string[] = [];

        if (sequence.some(sign => this.isVerb(sign))) {
            elements.push('verb_structure');
        }

        if (sequence.some(sign => sign.category === 'temporal')) {
            elements.push('temporal_marking');
        }

        if (sequence.some(sign => sign.category === 'spatial')) {
            elements.push('spatial_reference');
        }

        if (sequence.some(sign => sign.category === 'classifier')) {
            elements.push('classifier_construction');
        }

        return elements;
    }

    /**
     * Calcule le niveau d'interférence
     * @param content - Contenu LSF
     * @returns Niveau d'interférence (0-1)
     * @private
     */
    private static calculateInterferenceLevel(content: Record<string, unknown>): number {
        let interference = 0;

        if (content.frenchStructure) interference += 0.4;
        if (content.syntaxError) interference += 0.3;

        const accuracy = content.syntaxAccuracy as number || 1;
        interference += (1 - accuracy) * 0.3;

        return Math.min(interference, 1);
    }

    /**
     * Génère des recommandations d'adaptation
     * @param complexity - Complexité de base
     * @param elements - Éléments structurels
     * @param interference - Niveau d'interférence
     * @returns Recommandations
     * @private
     */
    private static generateAdaptationRecommendations(
        complexity: number,
        elements: readonly string[],
        interference: number
    ): readonly string[] {
        const recommendations: string[] = [];

        if (complexity > 0.7) {
            recommendations.push('Simplifier la structure syntaxique');
        }

        if (interference > 0.5) {
            recommendations.push('Réduire l\'interférence française');
            recommendations.push('Renforcer les structures LSF authentiques');
        }

        if (elements.includes('classifier_construction')) {
            recommendations.push('Attention particulière aux classificateurs');
        }

        if (elements.length === 0) {
            recommendations.push('Enrichir la structure syntaxique');
        }

        return recommendations;
    }

    /**
     * Valide la structure syntaxique
     * @param sequence - Séquence à valider
     * @returns True si valide
     * @private
     */
    private static validateSyntaxStructure(sequence: LSFSign[]): boolean {
        // Validation basique : au moins un verbe
        const hasVerb = sequence.some(sign => this.isVerb(sign));

        // Pas de doublons identiques consécutifs
        const hasConsecutiveDuplicates = sequence.some((sign, index) =>
            index > 0 && sign.id === sequence[index - 1].id
        );

        return hasVerb && !hasConsecutiveDuplicates;
    }

    /**
     * Trouve les doublons consécutifs
     * @param sequence - Séquence de signes
     * @returns Positions des doublons
     * @private
     */
    private static findConsecutiveDuplicates(sequence: LSFSign[]): readonly number[] {
        const duplicates: number[] = [];

        for (let i = 1; i < sequence.length; i++) {
            if (sequence[i].id === sequence[i - 1].id) {
                duplicates.push(i);
            }
        }

        return duplicates;
    }

    /**
     * Calcule la qualité d'une séquence
     * @param sequence - Séquence de signes
     * @param errors - Erreurs détectées
     * @param warnings - Avertissements
     * @returns Qualité (0-1)
     * @private
     */
    private static calculateSequenceQuality(sequence: LSFSign[], errors: readonly string[], warnings: readonly string[]): number {
        if (errors.length > 0) return 0;

        let quality = 1.0;

        // Pénalité pour les avertissements
        quality -= warnings.length * 0.1;

        // Bonus pour la diversité
        const types = new Set(sequence.map(sign => sign.type));
        quality += (types.size / sequence.length) * 0.2;

        return Math.max(0, Math.min(1, quality));
    }

    /**
     * Génère des suggestions de validation
     * @param errors - Erreurs détectées
     * @param warnings - Avertissements
     * @returns Suggestions
     * @private
     */
    private static generateValidationSuggestions(errors: readonly string[], warnings: readonly string[]): readonly string[] {
        const suggestions: string[] = [];

        if (errors.includes('Séquence vide')) {
            suggestions.push('Ajouter au moins un signe à la séquence');
        }

        if (errors.includes('Structure syntaxique invalide')) {
            suggestions.push('Revoir l\'ordre des signes selon les règles LSF');
        }

        if (warnings.some(w => w.includes('Doublons'))) {
            suggestions.push('Supprimer les répétitions inutiles');
        }

        return suggestions;
    }

    /**
     * Évalue l'impact linguistique d'une transformation
     * @param transform - Transformation
     * @param content - Contenu
     * @returns Impact évalué
     * @private
     */
    private static evaluateLinguisticImpact(
        transform: ErrorTransformation,
        content: Record<string, unknown>
    ): 'minimal' | 'moderate' | 'severe' | 'critical' {
        const accuracy = content.syntaxAccuracy as number || 1;
        const severity = transform.factor || 0.5;

        if (accuracy < 0.3 || severity > 0.8) return 'critical';
        if (accuracy < 0.5 || severity > 0.6) return 'severe';
        if (accuracy < 0.7 || severity > 0.4) return 'moderate';
        return 'minimal';
    }

    /**
     * Calcule le score de compréhensibilité
     * @param content - Contenu LSF
     * @returns Score (0-1)
     * @private
     */
    private static calculateComprehensibilityScore(content: Record<string, unknown>): number {
        const accuracy = content.syntaxAccuracy as number || 1;
        const hasStructuralErrors = !!content.frenchStructure;

        let score = accuracy;

        if (hasStructuralErrors) {
            score *= 0.7;
        }

        return Math.max(0, Math.min(1, score));
    }

    /**
     * Génère des suggestions d'amélioration
     * @param content - Contenu LSF
     * @param transform - Transformation appliquée
     * @returns Suggestions
     * @private
     */
    private static generateImprovementSuggestions(
        content: Record<string, unknown>,
        transform: ErrorTransformation
    ): readonly string[] {
        const suggestions: string[] = [];

        const transformType = transform.type ?? 'unknown';

        switch (transformType) {
            case ErrorTransformationType.INVERSION:
                suggestions.push('Vérifier l\'ordre syntaxique LSF approprié');
                suggestions.push('Pratiquer les structures SOV typiques');
                break;

            case ErrorTransformationType.OMISSION:
                suggestions.push('Identifier les éléments manquants essentiels');
                suggestions.push('Renforcer la complétude syntaxique');
                break;

            case ErrorTransformationType.FRENCH_STRUCTURE:
                suggestions.push('Éviter les calques du français');
                suggestions.push('Adopter les structures syntaxiques LSF authentiques');
                break;

            default:
                suggestions.push('Améliorer la précision syntaxique générale');
                break;
        }

        if (content.frenchStructure) {
            suggestions.push('Déconstruire les habitudes syntaxiques françaises');
        }

        return suggestions;
    }

    /**
     * Vérifie si un signe est un verbe
     * @param sign - Signe à vérifier
     * @returns True si verbe
     * @private
     */
    private static isVerb(sign: LSFSign): boolean {
        return sign.type === 'verb' || sign.category === 'action';
    }

    /**
     * Identifie les patterns utilisés dans le contenu
     * @param content - Contenu LSF
     * @returns Patterns identifiés
     */
    public static identifyUsedPatterns(content: Record<string, unknown>): readonly string[] {
        const patterns: string[] = [];
        const sequence = content.sequence as LSFSign[] || [];

        // Analyse des patterns syntaxiques
        const roles = this.identifySyntacticRoles(sequence);

        if (roles.subject !== undefined && roles.object !== undefined && roles.verb !== undefined) {
            if (roles.subject < roles.object && roles.object < roles.verb) {
                patterns.push('SOV_structure');
            } else if (roles.subject < roles.verb && roles.verb < roles.object) {
                patterns.push('SVO_structure');
            }
        }

        // Détection d'interférences françaises
        if (content.frenchStructure) {
            patterns.push('french_interference');
        }

        // Détection de patterns complexes
        if (sequence.some(sign => sign.category === 'classifier')) {
            patterns.push('classifier_construction');
        }

        if (sequence.some(sign => sign.category === 'temporal')) {
            patterns.push('temporal_marking');
        }

        return patterns;
    }

    /**
     * Identifie les rôles syntaxiques dans la séquence
     * @param sequence - Séquence de signes
     * @returns Rôles identifiés
     * @private
     */
    private static identifySyntacticRoles(sequence: LSFSign[]): {
        subject?: number;
        verb?: number;
        object?: number;
    } {
        const roles: { subject?: number; verb?: number; object?: number } = {};

        sequence.forEach((sign, index) => {
            if (this.isSubject(sign)) roles.subject = index;
            else if (this.isVerb(sign)) roles.verb = index;
            else if (this.isObject(sign)) roles.object = index;
        });

        return roles;
    }

    /**
     * Vérifie si un signe est un sujet
     * @param sign - Signe à vérifier
     * @returns True si sujet
     * @private
     */
    private static isSubject(sign: LSFSign): boolean {
        return sign.type === 'pronoun' ||
            (sign.type === 'noun' && sign.role === 'subject');
    }

    /**
     * Vérifie si un signe est un objet
     * @param sign - Signe à vérifier
     * @returns True si objet
     * @private
     */
    private static isObject(sign: LSFSign): boolean {
        return sign.type === 'noun' && sign.role === 'object';
    }

    /**
     * Calcule la qualité globale
     * @param complexity - Évaluation de complexité
     * @param validation - Validation
     * @returns Score de qualité (0-1)
     */
    public static calculateOverallQuality(
        complexity: SyntaxComplexityEvaluation,
        validation: SyntaxValidation
    ): number {
        let quality = validation.quality * 0.6; // 60% basé sur la validation

        // 40% basé sur la complexité et l'interférence
        const complexityScore = Math.max(0, 1 - complexity.baseComplexity);
        const interferenceScore = Math.max(0, 1 - complexity.interferenceLevel);

        quality += (complexityScore * 0.2) + (interferenceScore * 0.2);

        return Math.min(1, quality);
    }
}