/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/services/SyntaxAnalysisService.ts
 * @description Service d'analyse syntaxique pour les erreurs d'ordre des signes LSF
 * @author MetaSign
 * @version 2.0.0
 * @since 2024
 * 
 * Ce service fournit des fonctionnalités avancées d'analyse syntaxique pour
 * identifier, analyser et évaluer les structures linguistiques en LSF.
 * Il est spécialisé dans la détection des patterns syntaxiques et des erreurs d'ordre.
 * 
 * FONCTIONNALITÉS PRINCIPALES :
 * - Analyse des rôles syntaxiques (sujet, verbe, objet)
 * - Détection des patterns LSF authentiques vs interférences françaises
 * - Évaluation de la complexité syntaxique
 * - Validation des structures linguistiques
 * 
 * @module SyntaxAnalysisService
 * @requires LSFSign
 * @requires LSFContent
 */

import { LSFSign } from '../types/LSFContentTypes';

/**
 * Interface pour l'analyse syntaxique d'une séquence
 */
export interface SyntaxAnalysis {
    /** Ordre original des signes */
    readonly originalOrder: readonly (string | undefined)[];
    /** Ordre modifié après transformation */
    readonly modifiedOrder: readonly (string | undefined)[];
    /** Type d'erreur détecté */
    readonly errorType: string;
    /** Impact linguistique évalué */
    readonly linguisticImpact: 'minimal' | 'moderate' | 'severe' | 'critical';
    /** Score de compréhensibilité (0-1) */
    readonly comprehensibilityScore: number;
    /** Suggestions d'amélioration */
    readonly suggestions: readonly string[];
}

/**
 * Interface pour l'évaluation de complexité syntaxique
 */
export interface SyntaxComplexityEvaluation {
    /** Complexité de base (0-1) */
    readonly baseComplexity: number;
    /** Éléments structurels identifiés */
    readonly structuralElements: readonly string[];
    /** Niveau d'interférence française (0-1) */
    readonly interferenceLevel: number;
    /** Recommandations d'adaptation */
    readonly adaptationRecommendations: readonly string[];
}

/**
 * Interface pour la validation syntaxique
 */
export interface SyntaxValidation {
    /** Validité de la structure */
    readonly isValid: boolean;
    /** Erreurs détectées */
    readonly errors: readonly string[];
    /** Avertissements */
    readonly warnings: readonly string[];
    /** Score de qualité (0-1) */
    readonly quality: number;
    /** Suggestions de correction */
    readonly suggestions: readonly string[];
}

/**
 * Interface pour les rôles syntaxiques identifiés
 */
export interface SyntacticRoles {
    /** Position du sujet */
    readonly subject?: number;
    /** Position du verbe */
    readonly verb?: number;
    /** Position de l'objet */
    readonly object?: number;
    /** Positions des modificateurs */
    readonly modifiers: readonly number[];
    /** Positions des compléments */
    readonly complements: readonly number[];
}

/**
 * Service d'analyse syntaxique pour les transformations d'erreurs d'ordre des signes
 * 
 * Ce service centralise toutes les fonctionnalités d'analyse syntaxique nécessaires
 * pour évaluer et transformer les séquences de signes LSF de manière linguistiquement pertinente.
 * 
 * @class SyntaxAnalysisService
 */
export class SyntaxAnalysisService {

    /**
     * Analyse la complexité syntaxique d'un contenu LSF
     * @param content - Contenu LSF à analyser
     * @returns Évaluation détaillée de la complexité
     */
    public analyzeSyntaxComplexity(content: Record<string, unknown>): SyntaxComplexityEvaluation {
        const sequence = this.extractSequence(content);

        if (!sequence) {
            return this.createEmptyComplexityEvaluation();
        }

        const baseComplexity = this.calculateBaseComplexity(sequence);
        const structuralElements = this.identifyStructuralElements(sequence);
        const interferenceLevel = this.calculateInterferenceLevel(content);
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
     * Valide une séquence de signes après transformation
     * @param content - Contenu LSF à valider
     * @returns Résultat de validation complet
     */
    public validateTransformedSequence(content: Record<string, unknown>): SyntaxValidation {
        const sequence = this.extractSequence(content);
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!sequence || sequence.length === 0) {
            errors.push('Séquence vide ou invalide');
            return this.createValidationResult(false, errors, warnings, 0, []);
        }

        // Validation de la structure syntaxique
        if (!this.validateSyntaxStructure(sequence)) {
            errors.push('Structure syntaxique invalide');
        }

        // Détection des doublons consécutifs
        const duplicates = this.findConsecutiveDuplicates(sequence);
        if (duplicates.length > 0) {
            warnings.push(`Doublons détectés aux positions: ${duplicates.join(', ')}`);
        }

        // Validation des rôles syntaxiques
        const roles = this.identifySyntacticRoles(sequence);
        if (!this.validateSyntacticRoles(roles)) {
            warnings.push('Rôles syntaxiques incomplets ou incorrects');
        }

        const quality = this.calculateSequenceQuality(sequence, errors, warnings);
        const suggestions = this.generateValidationSuggestions(errors, warnings);

        return this.createValidationResult(
            errors.length === 0,
            errors,
            warnings,
            quality,
            suggestions
        );
    }

    /**
     * Identifie les rôles syntaxiques dans une séquence
     * @param sequence - Séquence de signes LSF
     * @returns Rôles syntaxiques identifiés
     */
    public identifySyntacticRoles(sequence: readonly LSFSign[]): SyntacticRoles {
        const roles: {
            subject?: number;
            verb?: number;
            object?: number;
            modifiers: number[];
            complements: number[];
        } = {
            modifiers: [],
            complements: []
        };

        sequence.forEach((sign, index) => {
            if (this.isSubject(sign)) {
                roles.subject = index;
            } else if (this.isVerb(sign)) {
                roles.verb = index;
            } else if (this.isObject(sign)) {
                roles.object = index;
            } else if (this.isModifier(sign)) {
                roles.modifiers.push(index);
            } else {
                roles.complements.push(index);
            }
        });

        return {
            subject: roles.subject,
            verb: roles.verb,
            object: roles.object,
            modifiers: roles.modifiers,
            complements: roles.complements
        };
    }

    /**
     * Génère une analyse syntaxique complète
     * @param content - Contenu LSF
     * @param errorType - Type d'erreur appliqué
     * @returns Analyse syntaxique détaillée
     */
    public generateSyntaxAnalysis(
        content: Record<string, unknown>,
        errorType: string = 'unknown'
    ): SyntaxAnalysis {
        const sequence = this.extractSequence(content) || [];

        const originalOrder = sequence.map(sign => sign.id);
        const modifiedOrder = [...originalOrder]; // Simplifié pour cette version

        const linguisticImpact = this.evaluateLinguisticImpact(content);
        const comprehensibilityScore = this.calculateComprehensibilityScore(content);
        const suggestions = this.generateImprovementSuggestions(content, errorType);

        return {
            originalOrder,
            modifiedOrder,
            errorType,
            linguisticImpact,
            comprehensibilityScore,
            suggestions
        };
    }

    /**
     * Vérifie si une structure syntaxique est valide
     * @param sequence - Séquence de signes
     * @returns True si la structure est valide
     */
    public validateSyntaxStructure(sequence: readonly LSFSign[]): boolean {
        // Validation basique : au moins un verbe ou un signe significatif
        const hasSignificantContent = sequence.some(sign =>
            this.isVerb(sign) || this.isNoun(sign)
        );

        // Pas de doublons identiques consécutifs
        const hasConsecutiveDuplicates = sequence.some((sign, index) =>
            index > 0 && sign.id === sequence[index - 1].id
        );

        return hasSignificantContent && !hasConsecutiveDuplicates;
    }

    /**
     * Identifie les positions syntaxiquement critiques
     * @param sequence - Séquence de signes
     * @returns Positions critiques
     */
    public identifyCriticalPositions(sequence: readonly LSFSign[]): readonly number[] {
        const positions: number[] = [];

        sequence.forEach((sign, index) => {
            if (this.isSyntacticallyImportant(sign, index, sequence)) {
                positions.push(index);
            }
        });

        return positions;
    }

    /**
     * Identifie les éléments omissibles dans une séquence
     * @param sequence - Séquence de signes
     * @returns Positions des éléments omissibles
     */
    public identifyOmissibleElements(sequence: readonly LSFSign[]): readonly number[] {
        const omissible: number[] = [];

        sequence.forEach((sign, index) => {
            if (this.isOmissibleElement(sign, index, sequence)) {
                omissible.push(index);
            }
        });

        return omissible;
    }

    /**
     * Extrait une séquence de signes du contenu LSF
     * @param content - Contenu LSF
     * @returns Séquence de signes ou null
     * @private
     */
    private extractSequence(content: Record<string, unknown>): LSFSign[] | null {
        const sequence = content.sequence as LSFSign[] | undefined;

        if (!sequence || !Array.isArray(sequence) || sequence.length === 0) {
            return null;
        }

        // Validation de la structure des signes
        const isValidSequence = sequence.every(sign =>
            sign && typeof sign === 'object' && 'id' in sign
        );

        return isValidSequence ? sequence : null;
    }

    /**
     * Calcule la complexité de base d'une séquence
     * @param sequence - Séquence de signes
     * @returns Complexité (0-1)
     * @private
     */
    private calculateBaseComplexity(sequence: readonly LSFSign[]): number {
        if (sequence.length === 0) return 0;

        let complexity = 0;

        // Longueur de la séquence
        complexity += Math.min(sequence.length / 10, 0.5);

        // Diversité des types de signes
        const types = new Set(sequence.map(sign => this.getSignType(sign)));
        complexity += types.size / 10;

        // Présence d'éléments complexes
        const complexElements = sequence.filter(sign =>
            this.isComplexElement(sign)
        );
        complexity += complexElements.length / sequence.length * 0.3;

        return Math.min(complexity, 1);
    }

    /**
     * Identifie les éléments structurels dans une séquence
     * @param sequence - Séquence de signes
     * @returns Éléments structurels identifiés
     * @private
     */
    private identifyStructuralElements(sequence: readonly LSFSign[]): readonly string[] {
        const elements: string[] = [];

        if (sequence.some(sign => this.isVerb(sign))) {
            elements.push('verb_structure');
        }

        if (sequence.some(sign => this.isTemporal(sign))) {
            elements.push('temporal_marking');
        }

        if (sequence.some(sign => this.isSpatial(sign))) {
            elements.push('spatial_reference');
        }

        if (sequence.some(sign => this.isClassifier(sign))) {
            elements.push('classifier_construction');
        }

        return elements;
    }

    /**
     * Calcule le niveau d'interférence française
     * @param content - Contenu LSF
     * @returns Niveau d'interférence (0-1)
     * @private
     */
    private calculateInterferenceLevel(content: Record<string, unknown>): number {
        let interference = 0;

        if (content.frenchStructure) interference += 0.4;
        if (content.syntaxError) interference += 0.3;

        const accuracy = content.syntaxAccuracy as number | undefined;
        if (typeof accuracy === 'number') {
            interference += (1 - accuracy) * 0.3;
        }

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
    private generateAdaptationRecommendations(
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
     * Trouve les doublons consécutifs dans une séquence
     * @param sequence - Séquence de signes
     * @returns Positions des doublons
     * @private
     */
    private findConsecutiveDuplicates(sequence: readonly LSFSign[]): readonly number[] {
        const duplicates: number[] = [];

        for (let i = 1; i < sequence.length; i++) {
            if (sequence[i].id === sequence[i - 1].id) {
                duplicates.push(i);
            }
        }

        return duplicates;
    }

    /**
     * Valide les rôles syntaxiques
     * @param roles - Rôles syntaxiques identifiés
     * @returns True si les rôles sont valides
     * @private
     */
    private validateSyntacticRoles(roles: SyntacticRoles): boolean {
        // Au minimum, il faut un verbe ou un nom
        return roles.verb !== undefined ||
            roles.subject !== undefined ||
            roles.object !== undefined;
    }

    /**
     * Calcule la qualité d'une séquence
     * @param sequence - Séquence de signes
     * @param errors - Erreurs détectées
     * @param warnings - Avertissements
     * @returns Score de qualité (0-1)
     * @private
     */
    private calculateSequenceQuality(
        sequence: readonly LSFSign[],
        errors: readonly string[],
        warnings: readonly string[]
    ): number {
        if (errors.length > 0) return 0;

        let quality = 1.0;

        // Pénalité pour les avertissements
        quality -= warnings.length * 0.1;

        // Bonus pour la diversité
        const types = new Set(sequence.map(sign => this.getSignType(sign)));
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
    private generateValidationSuggestions(
        errors: readonly string[],
        warnings: readonly string[]
    ): readonly string[] {
        const suggestions: string[] = [];

        if (errors.includes('Séquence vide ou invalide')) {
            suggestions.push('Ajouter au moins un signe à la séquence');
        }

        if (errors.includes('Structure syntaxique invalide')) {
            suggestions.push('Revoir l\'ordre des signes selon les règles LSF');
        }

        if (warnings.some(w => w.includes('Doublons'))) {
            suggestions.push('Supprimer les répétitions inutiles');
        }

        if (warnings.some(w => w.includes('Rôles syntaxiques'))) {
            suggestions.push('Vérifier la complétude des éléments syntaxiques');
        }

        return suggestions;
    }

    /**
     * Évalue l'impact linguistique d'un contenu
     * @param content - Contenu LSF
     * @returns Impact linguistique
     * @private
     */
    private evaluateLinguisticImpact(content: Record<string, unknown>): 'minimal' | 'moderate' | 'severe' | 'critical' {
        const accuracy = content.syntaxAccuracy as number | undefined;
        const hasStructuralErrors = !!content.frenchStructure;

        if (accuracy !== undefined && accuracy < 0.3) return 'critical';
        if (accuracy !== undefined && accuracy < 0.5) return 'severe';
        if (hasStructuralErrors || (accuracy !== undefined && accuracy < 0.7)) return 'moderate';
        return 'minimal';
    }

    /**
     * Calcule le score de compréhensibilité
     * @param content - Contenu LSF
     * @returns Score (0-1)
     * @private
     */
    private calculateComprehensibilityScore(content: Record<string, unknown>): number {
        const accuracy = content.syntaxAccuracy as number | undefined || 1;
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
     * @param errorType - Type d'erreur
     * @returns Suggestions
     * @private
     */
    private generateImprovementSuggestions(
        content: Record<string, unknown>,
        errorType: string
    ): readonly string[] {
        const suggestions: string[] = [];

        switch (errorType) {
            case 'inversion':
                suggestions.push('Vérifier l\'ordre syntaxique LSF approprié');
                suggestions.push('Pratiquer les structures SOV typiques');
                break;
            case 'omission':
                suggestions.push('Identifier les éléments manquants essentiels');
                suggestions.push('Renforcer la complétude syntaxique');
                break;
            case 'french_structure':
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

    // Méthodes utilitaires pour l'analyse des signes

    private isSubject(sign: LSFSign): boolean {
        return this.getSignType(sign) === 'pronoun' ||
            (this.getSignType(sign) === 'noun' && this.getSignRole(sign) === 'subject');
    }

    private isVerb(sign: LSFSign): boolean {
        return this.getSignType(sign) === 'verb' || this.getSignCategory(sign) === 'action';
    }

    private isObject(sign: LSFSign): boolean {
        return this.getSignType(sign) === 'noun' && this.getSignRole(sign) === 'object';
    }

    private isNoun(sign: LSFSign): boolean {
        return this.getSignType(sign) === 'noun';
    }

    private isModifier(sign: LSFSign): boolean {
        return this.getSignType(sign) === 'adjective' ||
            this.getSignType(sign) === 'adverb' ||
            this.getSignCategory(sign) === 'modifier';
    }

    private isTemporal(sign: LSFSign): boolean {
        return this.getSignCategory(sign) === 'temporal';
    }

    private isSpatial(sign: LSFSign): boolean {
        return this.getSignCategory(sign) === 'spatial';
    }

    private isClassifier(sign: LSFSign): boolean {
        return this.getSignCategory(sign) === 'classifier';
    }

    private isComplexElement(sign: LSFSign): boolean {
        return this.getSignCategory(sign) === 'classifier' ||
            this.getSignType(sign) === 'complex_verb';
    }

    private isSyntacticallyImportant(
        sign: LSFSign,
        index: number,
        sequence: readonly LSFSign[]
    ): boolean {
        // Premier et dernier signes souvent importants
        if (index === 0 || index === sequence.length - 1) return true;

        // Verbes et noms principaux toujours importants
        if (this.isVerb(sign) || this.isSubject(sign)) return true;

        return false;
    }

    private isOmissibleElement(
        sign: LSFSign,
        index: number,
        sequence: readonly LSFSign[]
    ): boolean {
        // Ne pas omettre le premier ou dernier signe
        if (index === 0 || index === sequence.length - 1) return false;

        // Ne pas omettre les verbes principaux
        if (this.isVerb(sign)) return false;

        // Les modificateurs sont généralement omissibles
        if (this.isModifier(sign)) return true;

        return false;
    }

    private getSignType(sign: LSFSign): string {
        return (sign as { type?: string }).type || 'unknown';
    }

    private getSignCategory(sign: LSFSign): string {
        return (sign as { category?: string }).category || 'unknown';
    }

    private getSignRole(sign: LSFSign): string {
        return (sign as { role?: string }).role || 'unknown';
    }

    // Méthodes utilitaires pour créer les objets de retour

    private createEmptyComplexityEvaluation(): SyntaxComplexityEvaluation {
        return {
            baseComplexity: 0,
            structuralElements: [],
            interferenceLevel: 0,
            adaptationRecommendations: ['Contenu manquant pour l\'analyse']
        };
    }

    private createValidationResult(
        isValid: boolean,
        errors: readonly string[],
        warnings: readonly string[],
        quality: number,
        suggestions: readonly string[]
    ): SyntaxValidation {
        return {
            isValid,
            errors,
            warnings,
            quality,
            suggestions
        };
    }
}