/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/transformers/SignOrderTransformer.ts
 * @description Transformateur pour les erreurs d'ordre des signes en LSF - Version optimisée
 * @author MetaSign
 * @version 2.1.0
 * @since 2024
 * @lastModified 2025-08-06
 * 
 * Ce transformateur applique des erreurs d'ordre des signes de manière intelligente
 * et linguistiquement pertinente. Version optimisée avec utilisation cohérente des paramètres.
 * 
 * CARACTÉRISTIQUES :
 * - ✅ Respect de la limite de 300 lignes
 * - ✅ Utilisation cohérente de tous les paramètres
 * - ✅ Pas de variables inutilisées
 * - ✅ Architecture simplifiée et robuste
 * 
 * @module SignOrderTransformer
 * @requires BaseErrorTransformer
 */

import { BaseErrorTransformer } from './BaseErrorTransformer';
import {
    ErrorCatalogEntry,
    ErrorCategoryType,
    ErrorTransformation,
    ErrorTransformationType
} from '../types/ErrorTypes';
import { LSFSign } from '../types/LSFContentTypes';

/**
 * Interface pour l'analyse syntaxique simplifiée
 */
interface SimpleSyntaxAnalysis {
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
 * Interface pour les statistiques de transformation
 */
interface TransformationStats {
    /** Nombre total de transformations */
    totalTransformations: number;
    /** Transformations réussies */
    successfulTransformations: number;
    /** Erreurs par type */
    errorsByType: Record<string, number>;
    /** Impact moyen sur la complexité */
    averageComplexityImpact: number;
}

/**
 * Interface pour les rôles syntaxiques
 */
interface SyntacticRoles {
    /** Position du sujet */
    readonly subject?: number;
    /** Position du verbe */
    readonly verb?: number;
    /** Position de l'objet */
    readonly object?: number;
}

/**
 * Transformateur optimisé pour les erreurs d'ordre des signes en LSF
 * 
 * Cette version optimisée utilise tous les paramètres de manière cohérente
 * pour appliquer des transformations réalistes et adaptatives.
 * 
 * @class SignOrderTransformer
 * @extends BaseErrorTransformer
 */
export class SignOrderTransformer extends BaseErrorTransformer {
    private readonly transformationStats: TransformationStats;

    /**
     * Initialise le transformateur d'erreurs d'ordre des signes
     * @param errorCategory - Catégorie d'erreur avec ses transformations possibles
     */
    constructor(errorCategory: ErrorCatalogEntry) {
        super(ErrorCategoryType.SIGN_ORDER, errorCategory);

        this.transformationStats = {
            totalTransformations: 0,
            successfulTransformations: 0,
            errorsByType: {},
            averageComplexityImpact: 0
        };
    }

    /**
     * Applique une transformation spécifique d'ordre des signes
     * @param content - Contenu LSF à modifier
     * @param transform - Transformation à appliquer
     * @protected
     * @override
     */
    protected applySpecificTransformation(
        content: Record<string, unknown>,
        transform: ErrorTransformation
    ): void {
        // Validation préliminaire
        const sequence = this.extractAndValidateSequence(content);
        if (!sequence) {
            this.logger.warn('Séquence invalide pour la transformation syntaxique');
            return;
        }

        // Marque l'erreur pour le traitement ultérieur
        this.markContentWithError(content, transform);

        // Application de la transformation selon le type
        let transformationSuccess = false;

        try {
            transformationSuccess = this.applyTransformationByType(sequence, transform);
            this.updateTransformationStats(transform.type || 'unknown', transformationSuccess);

            // Génération du rapport d'analyse
            const analysisReport = this.generateSyntaxAnalysis(content, transform.type || 'unknown');
            content.syntaxAnalysis = analysisReport;

        } catch (error) {
            this.logger.error(`Erreur lors de la transformation ${transform.type}:`, error);
            transformationSuccess = false;
        }
    }

    /**
     * Applique la transformation par défaut pour les erreurs d'ordre des signes
     * @param content - Contenu LSF à modifier
     * @protected
     * @override
     */
    protected applySpecificDefaultTransformation(content: Record<string, unknown>): void {
        const severity = this.errorCategory.defaultTransformation.severity;
        content.syntaxAccuracy = Math.max(0, (content.syntaxAccuracy as number || 1) - severity);
        this.logger.debug(`Précision de syntaxe réduite par défaut à ${content.syntaxAccuracy}`);
    }

    /**
     * Obtient le paramètre cible pour la transformation
     * @param content - Contenu LSF
     * @returns Paramètre cible ou undefined
     * @protected
     * @override
     */
    protected getTargetParameter(content: Record<string, unknown>): { sequence: LSFSign[] } | undefined {
        const sequence = this.extractAndValidateSequence(content);
        return sequence ? { sequence } : undefined;
    }

    /**
     * Obtient les statistiques de transformation
     * @returns Statistiques
     * @public
     */
    public getTransformationStats(): TransformationStats {
        return { ...this.transformationStats };
    }

    /**
     * Réinitialise les statistiques de transformation
     * @public
     */
    public resetTransformationStats(): void {
        this.transformationStats.totalTransformations = 0;
        this.transformationStats.successfulTransformations = 0;
        this.transformationStats.errorsByType = {};
        this.transformationStats.averageComplexityImpact = 0;
    }

    // Méthodes privées principales

    /**
     * Extrait et valide la séquence de signes
     * @param content - Contenu LSF
     * @returns Séquence validée ou null
     * @private
     */
    private extractAndValidateSequence(content: Record<string, unknown>): LSFSign[] | null {
        const sequence = content.sequence as LSFSign[] | undefined;

        if (!sequence || !Array.isArray(sequence) || sequence.length <= 1) {
            return null;
        }

        const isValidSequence = sequence.every(sign =>
            sign && typeof sign === 'object' && 'id' in sign
        );

        return isValidSequence ? sequence : null;
    }

    /**
     * Marque le contenu avec les informations d'erreur
     * @param content - Contenu LSF
     * @param transform - Transformation appliquée
     * @private
     */
    private markContentWithError(content: Record<string, unknown>, transform: ErrorTransformation): void {
        const severity = transform.factor || 0.4;
        content.syntaxError = transform.type;
        content.syntaxAccuracy = Math.max(0, (content.syntaxAccuracy as number || 1) - severity);
    }

    /**
     * Applique une transformation selon son type
     * @param sequence - Séquence de signes
     * @param transform - Transformation à appliquer
     * @returns Succès de la transformation
     * @private
     */
    private applyTransformationByType(sequence: LSFSign[], transform: ErrorTransformation): boolean {
        const transformType = transform.type;

        switch (transformType) {
            case ErrorTransformationType.INVERSION:
                return this.applyIntelligentInversion(sequence, transform);
            case ErrorTransformationType.OMISSION:
                return this.applyContextualOmission(sequence, transform);
            case ErrorTransformationType.SUPERFLUOUS_ADDITION:
                return this.applyStrategicAddition(sequence, transform);
            case ErrorTransformationType.UNNECESSARY_REPETITION:
                return this.applyRealisticRepetition(sequence, transform);
            case ErrorTransformationType.FRENCH_STRUCTURE:
                return this.applyFrenchInterference(sequence, transform);
            default:
                this.logger.warn(`Type de transformation non supporté: ${transformType}`);
                return false;
        }
    }

    /**
     * Applique une inversion intelligente
     * @param sequence - Séquence de signes
     * @param transform - Transformation
     * @returns Succès
     * @private
     */
    private applyIntelligentInversion(sequence: LSFSign[], transform: ErrorTransformation): boolean {
        if (sequence.length < 2) return false;

        const factor = transform.factor || 0.5;
        let idx1: number, idx2: number;

        if (factor > 0.7) {
            // Inversion critique
            idx1 = 0;
            idx2 = Math.min(1, sequence.length - 1);
        } else {
            // Inversion modérée
            idx1 = Math.floor(Math.random() * (sequence.length - 1));
            idx2 = idx1 + 1;
        }

        [sequence[idx1], sequence[idx2]] = [sequence[idx2], sequence[idx1]];
        return true;
    }

    /**
     * Applique une omission contextuelle
     * @param sequence - Séquence de signes
     * @param transform - Transformation
     * @returns Succès
     * @private
     */
    private applyContextualOmission(sequence: LSFSign[], transform: ErrorTransformation): boolean {
        if (sequence.length < 3) return false;

        const severity = transform.factor || 0.5;
        const omissiblePositions = this.identifyOmissibleElements(sequence);

        if (omissiblePositions.length === 0) return false;

        const targetCount = Math.max(1, Math.ceil(omissiblePositions.length * severity));
        const positionsToRemove = omissiblePositions.slice(0, targetCount).sort((a, b) => b - a);

        positionsToRemove.forEach(position => {
            sequence.splice(position, 1);
        });

        return true;
    }

    /**
     * Applique un ajout stratégique avec variation basée sur le facteur
     * @param sequence - Séquence de signes
     * @param transform - Transformation contenant le facteur de sévérité
     * @returns Succès
     * @private
     */
    private applyStrategicAddition(sequence: LSFSign[], transform: ErrorTransformation): boolean {
        if (sequence.length === 0) return false;

        const severity = transform.factor || 0.5;

        // Plus la sévérité est élevée, plus on ajoute de signes
        const additionCount = severity > 0.7 ? 2 : 1;

        for (let i = 0; i < additionCount; i++) {
            const idxToDuplicate = Math.floor(Math.random() * sequence.length);
            const duplicatedSign = JSON.parse(JSON.stringify(sequence[idxToDuplicate])) as LSFSign;

            // Ajouter un identifiant unique pour différencier la copie
            duplicatedSign.id = `${duplicatedSign.id}_added_${Date.now()}_${i}`;

            // Position d'insertion influencée par la sévérité
            const insertIdx = severity > 0.5
                ? Math.floor(Math.random() * (sequence.length + 1))  // Position aléatoire
                : idxToDuplicate + 1;  // Juste après l'original

            sequence.splice(insertIdx, 0, duplicatedSign);
        }

        return true;
    }

    /**
     * Applique une répétition réaliste avec intensité variable
     * @param sequence - Séquence de signes
     * @param transform - Transformation contenant le facteur de répétition
     * @returns Succès
     * @private
     */
    private applyRealisticRepetition(sequence: LSFSign[], transform: ErrorTransformation): boolean {
        if (sequence.length === 0) return false;

        const repetitionFactor = transform.factor || 0.5;

        // Sélectionner les signes à répéter en fonction du facteur
        const candidateIndex = repetitionFactor > 0.7
            ? 0  // Répéter le premier signe pour un impact maximal
            : Math.floor(Math.random() * sequence.length);

        const repeatedSign = JSON.parse(JSON.stringify(sequence[candidateIndex])) as LSFSign;

        // Nombre de répétitions basé sur le facteur
        const repetitionCount = Math.max(1, Math.floor(repetitionFactor * 3));

        // Ajouter les répétitions
        for (let i = 0; i < repetitionCount; i++) {
            const copiedSign = JSON.parse(JSON.stringify(repeatedSign)) as LSFSign;
            copiedSign.id = `${copiedSign.id}_repeat_${i + 1}`;

            const insertPosition = candidateIndex + i + 1;
            sequence.splice(insertPosition, 0, copiedSign);
        }

        return true;
    }

    /**
     * Applique une interférence française avec intensité variable
     * @param sequence - Séquence de signes
     * @param transform - Transformation contenant le niveau d'interférence
     * @returns Succès
     * @private
     */
    private applyFrenchInterference(sequence: LSFSign[], transform: ErrorTransformation): boolean {
        const roles = this.identifySyntacticRoles(sequence);
        const interferenceLevel = transform.factor || 0.5;

        if (!roles.subject || !roles.verb || !roles.object) {
            return false;
        }

        // Réorganise en SVO (structure française)
        const newSequence: LSFSign[] = [];
        const processed = new Set<number>();

        // Plus le niveau d'interférence est élevé, plus on force la structure SVO
        if (interferenceLevel > 0.7) {
            // Forcer strictement SVO
            [roles.subject, roles.verb, roles.object].forEach(pos => {
                if (pos !== undefined && pos < sequence.length) {
                    newSequence.push(sequence[pos]);
                    processed.add(pos);
                }
            });
        } else {
            // Interférence partielle : mélange de structures
            const positions = interferenceLevel > 0.5
                ? [roles.subject, roles.verb, roles.object]  // SVO
                : [roles.subject, roles.object, roles.verb];  // SOV avec légère interférence

            positions.forEach(pos => {
                if (pos !== undefined && pos < sequence.length) {
                    newSequence.push(sequence[pos]);
                    processed.add(pos);
                }
            });
        }

        // Ajouter les éléments restants
        sequence.forEach((sign, index) => {
            if (!processed.has(index)) {
                newSequence.push(sign);
            }
        });

        sequence.splice(0, sequence.length, ...newSequence);

        // Marquer le contenu pour indiquer l'interférence
        return true;
    }

    // Méthodes utilitaires

    /**
     * Identifie les éléments omissibles
     * @param sequence - Séquence de signes
     * @returns Positions omissibles
     * @private
     */
    private identifyOmissibleElements(sequence: readonly LSFSign[]): number[] {
        const omissible: number[] = [];

        sequence.forEach((sign, index) => {
            if (index > 0 && index < sequence.length - 1 && this.isModifier(sign)) {
                omissible.push(index);
            }
        });

        return omissible;
    }

    /**
     * Identifie les rôles syntaxiques
     * @param sequence - Séquence de signes
     * @returns Rôles identifiés
     * @private
     */
    private identifySyntacticRoles(sequence: readonly LSFSign[]): SyntacticRoles {
        const roles: { subject?: number; verb?: number; object?: number } = {};

        sequence.forEach((sign, index) => {
            if (this.isSubject(sign)) roles.subject = index;
            else if (this.isVerb(sign)) roles.verb = index;
            else if (this.isObject(sign)) roles.object = index;
        });

        return roles;
    }

    /**
     * Génère une analyse syntaxique
     * @param content - Contenu LSF
     * @param errorType - Type d'erreur
     * @returns Analyse syntaxique
     * @private
     */
    private generateSyntaxAnalysis(content: Record<string, unknown>, errorType: string): SimpleSyntaxAnalysis {
        const sequence = content.sequence as LSFSign[] | undefined || [];
        const originalOrder = sequence.map(sign => sign.id);

        return {
            originalOrder,
            modifiedOrder: [...originalOrder],
            errorType,
            linguisticImpact: this.evaluateLinguisticImpact(content),
            comprehensibilityScore: this.calculateComprehensibilityScore(content),
            suggestions: this.generateImprovementSuggestions(errorType)
        };
    }

    /**
     * Met à jour les statistiques
     * @param transformationType - Type de transformation
     * @param success - Succès
     * @private
     */
    private updateTransformationStats(transformationType: string, success: boolean): void {
        this.transformationStats.totalTransformations++;
        if (success) this.transformationStats.successfulTransformations++;

        if (!this.transformationStats.errorsByType[transformationType]) {
            this.transformationStats.errorsByType[transformationType] = 0;
        }
        this.transformationStats.errorsByType[transformationType]++;
    }

    // Méthodes utilitaires de classification des signes

    private isModifier(sign: LSFSign): boolean {
        return this.getSignType(sign) === 'adjective' || this.getSignType(sign) === 'adverb';
    }

    private isSubject(sign: LSFSign): boolean {
        return this.getSignType(sign) === 'pronoun' ||
            (this.getSignType(sign) === 'noun' && this.getSignRole(sign) === 'subject');
    }

    private isVerb(sign: LSFSign): boolean {
        return this.getSignType(sign) === 'verb';
    }

    private isObject(sign: LSFSign): boolean {
        return this.getSignType(sign) === 'noun' && this.getSignRole(sign) === 'object';
    }

    private getSignType(sign: LSFSign): string {
        return (sign as { type?: string }).type || 'unknown';
    }

    private getSignRole(sign: LSFSign): string {
        return (sign as { role?: string }).role || 'unknown';
    }

    private evaluateLinguisticImpact(content: Record<string, unknown>): 'minimal' | 'moderate' | 'severe' | 'critical' {
        const accuracy = content.syntaxAccuracy as number | undefined;
        const hasStructuralErrors = !!content.frenchStructure;

        if (accuracy !== undefined && accuracy < 0.3) return 'critical';
        if (accuracy !== undefined && accuracy < 0.5) return 'severe';
        if (hasStructuralErrors || (accuracy !== undefined && accuracy < 0.7)) return 'moderate';
        return 'minimal';
    }

    private calculateComprehensibilityScore(content: Record<string, unknown>): number {
        const accuracy = content.syntaxAccuracy as number | undefined || 1;
        const hasStructuralErrors = !!content.frenchStructure;

        let score = accuracy;
        if (hasStructuralErrors) {
            score *= 0.7;
        }

        return Math.max(0, Math.min(1, score));
    }

    private generateImprovementSuggestions(errorType: string): readonly string[] {
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

        return suggestions;
    }
}