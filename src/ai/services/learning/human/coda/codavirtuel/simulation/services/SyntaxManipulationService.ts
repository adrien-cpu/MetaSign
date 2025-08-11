/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/services/SyntaxManipulationService.ts
 * @description Service de manipulation syntaxique pour les transformations d'erreurs d'ordre des signes
 * @author MetaSign
 * @version 2.0.0
 * @since 2024
 * 
 * Ce service gère toutes les opérations de manipulation syntaxique sur les séquences
 * de signes LSF. Il fournit des méthodes pour appliquer différents types de transformations
 * d'erreurs de manière contrôlée et linguistiquement pertinente.
 * 
 * FONCTIONNALITÉS PRINCIPALES :
 * - Application d'inversions intelligentes
 * - Gestion des omissions contextuelles
 * - Ajouts stratégiques d'éléments superflus
 * - Répétitions réalistes
 * - Interférences structurelles françaises
 * 
 * @module SyntaxManipulationService
 * @requires LSFSign
 * @requires ErrorTransformation
 * @requires ErrorTransformationType
 */

import { LSFSign } from '../types/LSFContentTypes';
import { ErrorTransformation } from '../types/ErrorTypes';

/**
 * Interface pour les candidats de répétition
 */
interface RepetitionCandidate {
    /** Signe candidat */
    readonly sign: LSFSign;
    /** Position dans la séquence */
    readonly position: number;
    /** Priorité de répétition */
    readonly priority: number;
}

/**
 * Interface pour les résultats d'optimisation
 */
interface OptimizationResult {
    /** Succès de l'optimisation */
    readonly success: boolean;
    /** Nombre de modifications apportées */
    readonly modificationsCount: number;
    /** Description des modifications */
    readonly modifications: readonly string[];
}

/**
 * Service de manipulation syntaxique pour les transformations d'erreurs
 * 
 * Ce service centralise toutes les opérations de transformation et manipulation
 * des séquences de signes LSF pour simuler des erreurs réalistes d'ordre syntaxique.
 * 
 * @class SyntaxManipulationService
 */
export class SyntaxManipulationService {

    /**
     * Applique une inversion intelligente basée sur la linguistique LSF
     * @param sequence - Séquence de signes à modifier
     * @param transform - Transformation à appliquer
     * @returns Succès de la transformation
     */
    public applyIntelligentInversion(
        sequence: LSFSign[],
        transform: ErrorTransformation
    ): boolean {
        if (sequence.length < 2) return false;

        // Analyse des positions syntaxiquement sensibles
        const criticalPositions = this.identifyCriticalPositions(sequence);

        // Choix intelligent des positions à inverser
        let idx1: number, idx2: number;

        if (transform.factor && transform.factor > 0.7) {
            // Inversion critique (positions importantes)
            const positions = criticalPositions.slice(0, 2);
            [idx1, idx2] = positions.length >= 2 ? positions : [0, 1];
        } else {
            // Inversion modérée (positions adjacentes)
            idx1 = Math.floor(Math.random() * (sequence.length - 1));
            idx2 = idx1 + 1;
        }

        // Validation de l'inversion
        if (this.wouldCreateInvalidStructure(sequence, idx1, idx2)) {
            // Cherche une alternative valide
            const alternativePositions = this.findAlternativePositions(sequence);
            if (alternativePositions.length >= 2) {
                [idx1, idx2] = alternativePositions;
            } else {
                return false;
            }
        }

        // Application de l'inversion
        [sequence[idx1], sequence[idx2]] = [sequence[idx2], sequence[idx1]];

        return true;
    }

    /**
     * Applique une omission contextuelle réaliste
     * @param sequence - Séquence de signes à modifier
     * @param transform - Transformation à appliquer
     * @returns Succès de la transformation
     */
    public applyContextualOmission(
        sequence: LSFSign[],
        transform: ErrorTransformation
    ): boolean {
        if (sequence.length < 3) return false;

        // Identifie les éléments omissibles sans nuire à la compréhension
        const omissiblePositions = this.identifyOmissibleElements(sequence);

        if (omissiblePositions.length === 0) {
            return false;
        }

        // Sélection intelligente basée sur la sévérité
        const severity = transform.factor || 0.5;
        const targetCount = Math.ceil(omissiblePositions.length * severity);

        // Tri par ordre de priorité d'omission (éléments les moins critiques d'abord)
        const sortedPositions = omissiblePositions.sort((a, b) =>
            this.calculateOmissionPriority(sequence, a) - this.calculateOmissionPriority(sequence, b)
        );

        // Application des omissions (en ordre inverse pour préserver les indices)
        const positionsToRemove = sortedPositions.slice(0, targetCount).sort((a, b) => b - a);

        positionsToRemove.forEach(position => {
            sequence.splice(position, 1);
        });

        return true;
    }

    /**
     * Applique un ajout stratégique d'éléments superflus
     * @param sequence - Séquence de signes à modifier
     * @param transform - Transformation à appliquer
     * @returns Succès de la transformation
     */
    public applyStrategicAddition(
        sequence: LSFSign[],
        transform: ErrorTransformation
    ): boolean {
        if (sequence.length === 0) return false;

        // Génère des ajouts réalistes basés sur les erreurs communes
        const additionType = this.selectAdditionType(transform);

        switch (additionType) {
            case 'duplication':
                return this.applyDuplicationAddition(sequence);
            case 'french_interference':
                return this.applyFrenchInterferenceAddition(sequence);
            case 'over_specification':
                return this.applyOverSpecificationAddition(sequence);
            default:
                return this.applyGenericAddition(sequence);
        }
    }

    /**
     * Applique une répétition inutile réaliste
     * @param sequence - Séquence de signes à modifier
     * @param transform - Transformation à appliquer
     * @returns Succès de la transformation
     */
    public applyRealisticRepetition(
        sequence: LSFSign[],
        transform: ErrorTransformation
    ): boolean {
        if (sequence.length === 0) return false;

        // Analyse des patterns de répétition typiques
        const repetitionCandidates = this.identifyRepetitionCandidates(sequence);

        if (repetitionCandidates.length === 0) {
            return false;
        }

        // Sélection basée sur la probabilité d'erreur réelle
        const selectedCandidate = this.selectRepetitionCandidate(repetitionCandidates, transform);

        // Clone profond pour éviter les références partagées
        const repeatedSign = this.deepCloneSign(selectedCandidate.sign);

        // Insertion stratégique
        const insertPosition = selectedCandidate.position + 1;
        sequence.splice(insertPosition, 0, repeatedSign);

        return true;
    }

    /**
     * Applique une interférence structurelle française
     * @param sequence - Séquence de signes à modifier
     * @param transform - Transformation à appliquer
     * @returns Succès de la transformation
     */
    public applyFrenchInterference(
        sequence: LSFSign[],
        transform: ErrorTransformation
    ): boolean {
        // Identifie le pattern français à appliquer
        const interferencePattern = this.selectFrenchInterferencePattern(sequence, transform);

        if (!interferencePattern) {
            return false;
        }

        // Application du pattern français selon le type
        switch (interferencePattern) {
            case 'svo_structure':
                return this.applySVOStructure(sequence);
            case 'auxiliary_verbs':
                return this.addFrenchAuxiliaries(sequence);
            case 'article_insertion':
                return this.addFrenchArticles(sequence);
            default:
                return false;
        }
    }

    /**
     * Optimise une séquence pour réduire les erreurs
     * @param sequence - Séquence de signes à optimiser
     * @returns Résultat de l'optimisation
     */
    public optimizeSequence(sequence: LSFSign[]): OptimizationResult {
        if (sequence.length === 0) {
            return { success: false, modificationsCount: 0, modifications: [] };
        }

        const modifications: string[] = [];
        let modificationsCount = 0;

        // Suppression des doublons consécutifs
        if (this.removeDuplicates(sequence)) {
            modifications.push('Doublons supprimés');
            modificationsCount++;
        }

        // Réorganisation vers une structure LSF correcte
        if (this.correctSyntaxOrder(sequence)) {
            modifications.push('Ordre syntaxique corrigé vers SOV');
            modificationsCount++;
        }

        // Suppression des éléments d'interférence française
        if (this.removeFrenchInterference(sequence)) {
            modifications.push('Éléments d\'interférence française supprimés');
            modificationsCount++;
        }

        return {
            success: modificationsCount > 0,
            modificationsCount,
            modifications
        };
    }

    // Méthodes privées pour l'analyse et manipulation

    /**
     * Identifie les positions syntaxiquement critiques
     * @param sequence - Séquence de signes
     * @returns Positions critiques
     * @private
     */
    private identifyCriticalPositions(sequence: readonly LSFSign[]): number[] {
        const positions: number[] = [];

        sequence.forEach((sign, index) => {
            if (this.isSyntacticallyImportant(sign, index, sequence)) {
                positions.push(index);
            }
        });

        return positions;
    }

    /**
     * Vérifie si une inversion créerait une structure invalide
     * @param sequence - Séquence de signes
     * @param idx1 - Premier index
     * @param idx2 - Deuxième index
     * @returns True si l'inversion est problématique
     * @private
     */
    private wouldCreateInvalidStructure(sequence: LSFSign[], idx1: number, idx2: number): boolean {
        // Simule l'inversion temporairement
        const tempSequence = [...sequence];
        [tempSequence[idx1], tempSequence[idx2]] = [tempSequence[idx2], tempSequence[idx1]];

        // Valide la structure résultante
        return !this.validateBasicStructure(tempSequence);
    }

    /**
     * Trouve des positions alternatives pour l'inversion
     * @param sequence - Séquence de signes
     * @returns Positions alternatives
     * @private
     */
    private findAlternativePositions(sequence: LSFSign[]): number[] {
        const alternatives: number[] = [];

        for (let i = 0; i < sequence.length - 1; i++) {
            if (!this.wouldCreateInvalidStructure(sequence, i, i + 1)) {
                alternatives.push(i, i + 1);
                break;
            }
        }

        return alternatives;
    }

    /**
     * Identifie les éléments omissibles
     * @param sequence - Séquence de signes
     * @returns Positions omissibles
     * @private
     */
    private identifyOmissibleElements(sequence: readonly LSFSign[]): number[] {
        const omissible: number[] = [];

        sequence.forEach((sign, index) => {
            if (this.isOmissibleElement(sign, index, sequence)) {
                omissible.push(index);
            }
        });

        return omissible;
    }

    /**
     * Calcule la priorité d'omission d'un élément
     * @param sequence - Séquence de signes
     * @param position - Position de l'élément
     * @returns Priorité d'omission (plus bas = plus prioritaire)
     * @private
     */
    private calculateOmissionPriority(sequence: readonly LSFSign[], position: number): number {
        const sign = sequence[position];
        let priority = 0;

        // Position dans la phrase (milieu moins critique)
        if (position > 0 && position < sequence.length - 1) {
            priority += 1;
        }

        // Type de signe (modificateurs moins critiques que noms/verbes)
        if (this.isModifier(sign)) {
            priority += 2;
        }

        // Redondance contextuelle
        if (this.hasContextualRedundancy(sign, sequence)) {
            priority += 3;
        }

        return priority;
    }

    /**
     * Sélectionne le type d'ajout approprié
     * @param transform - Transformation
     * @returns Type d'ajout
     * @private
     */
    private selectAdditionType(transform: ErrorTransformation): string {
        const severity = transform.factor || 0.5;

        if (severity > 0.8) return 'french_interference';
        if (severity > 0.6) return 'over_specification';
        if (severity > 0.3) return 'duplication';
        return 'generic';
    }

    /**
     * Applique un ajout par duplication
     * @param sequence - Séquence de signes
     * @returns Succès
     * @private
     */
    private applyDuplicationAddition(sequence: LSFSign[]): boolean {
        const idxToDuplicate = Math.floor(Math.random() * sequence.length);
        const duplicatedSign = this.deepCloneSign(sequence[idxToDuplicate]);

        const insertIdx = Math.floor(Math.random() * (sequence.length + 1));
        sequence.splice(insertIdx, 0, duplicatedSign);

        return true;
    }

    /**
     * Applique un ajout d'interférence française
     * @param sequence - Séquence de signes
     * @returns Succès
     * @private
     */
    private applyFrenchInterferenceAddition(sequence: LSFSign[]): boolean {
        const frenchElements = this.generateFrenchInterferenceElements();

        if (frenchElements.length === 0) return false;

        const elementToAdd = frenchElements[Math.floor(Math.random() * frenchElements.length)];
        const insertPosition = this.findOptimalInsertPosition(sequence, elementToAdd);

        sequence.splice(insertPosition, 0, elementToAdd);
        return true;
    }

    /**
     * Applique un ajout de sur-spécification
     * @param sequence - Séquence de signes
     * @returns Succès
     * @private
     */
    private applyOverSpecificationAddition(sequence: LSFSign[]): boolean {
        const redundantElements = this.generateRedundantElements(sequence);

        if (redundantElements.length === 0) return false;

        const elementToAdd = redundantElements[0];
        const insertPosition = Math.floor(Math.random() * (sequence.length + 1));

        sequence.splice(insertPosition, 0, elementToAdd);
        return true;
    }

    /**
     * Applique un ajout générique
     * @param sequence - Séquence de signes
     * @returns Succès
     * @private
     */
    private applyGenericAddition(sequence: LSFSign[]): boolean {
        return this.applyDuplicationAddition(sequence);
    }

    /**
     * Identifie les candidats pour la répétition
     * @param sequence - Séquence de signes
     * @returns Candidats de répétition
     * @private
     */
    private identifyRepetitionCandidates(sequence: readonly LSFSign[]): RepetitionCandidate[] {
        return sequence
            .map((sign, position) => ({
                sign,
                position,
                priority: this.calculateRepetitionPriority(sign, position, sequence)
            }))
            .filter(candidate => candidate.priority > 0)
            .sort((a, b) => b.priority - a.priority);
    }

    /**
     * Sélectionne un candidat pour la répétition
     * @param candidates - Candidats disponibles
     * @param transform - Transformation
     * @returns Candidat sélectionné
     * @private
     */
    private selectRepetitionCandidate(
        candidates: RepetitionCandidate[],
        transform: ErrorTransformation
    ): RepetitionCandidate {
        const severity = transform.factor || 0.5;
        const targetIndex = Math.floor(candidates.length * (1 - severity));

        return candidates[Math.min(targetIndex, candidates.length - 1)];
    }

    /**
     * Calcule la priorité de répétition d'un signe
     * @param sign - Signe à évaluer
     * @param position - Position dans la séquence
     * @param sequence - Séquence complète
     * @returns Priorité (plus élevé = plus probable)
     * @private
     */
    private calculateRepetitionPriority(
        sign: LSFSign,
        position: number,
        sequence: readonly LSFSign[]
    ): number {
        let priority = 1;

        // Les verbes sont souvent répétés pour l'emphase
        if (this.isVerb(sign)) priority += 3;

        // Les signes en fin de phrase sont moins répétés
        if (position === sequence.length - 1) priority -= 2;

        // Les signes très courts sont plus facilement répétés
        if (this.isShortSign(sign)) priority += 1;

        return Math.max(0, priority);
    }

    /**
     * Clone profondément un signe LSF
     * @param sign - Signe à cloner
     * @returns Signe cloné
     * @private
     */
    private deepCloneSign(sign: LSFSign): LSFSign {
        return JSON.parse(JSON.stringify(sign)) as LSFSign;
    }

    /**
     * Sélectionne un pattern d'interférence française
     * @param sequence - Séquence de signes
     * @param transform - Transformation
     * @returns Pattern sélectionné ou null
     * @private
     */
    private selectFrenchInterferencePattern(
        sequence: readonly LSFSign[],
        transform: ErrorTransformation
    ): string | null {
        const severity = transform.factor || 0.5;

        if (severity > 0.7) {
            return 'svo_structure';
        } else if (severity > 0.4) {
            return 'auxiliary_verbs';
        } else {
            return 'article_insertion';
        }
    }

    /**
     * Applique la structure SVO française
     * @param sequence - Séquence de signes
     * @returns Succès
     * @private
     */
    private applySVOStructure(sequence: LSFSign[]): boolean {
        const roles = this.identifySyntacticRoles(sequence);

        if (!roles.subject || !roles.verb || !roles.object) {
            return false;
        }

        // Réorganise en SVO
        const newSequence: LSFSign[] = [];
        const processed = new Set<number>();

        // Ajoute les éléments dans l'ordre SVO
        [roles.subject, roles.verb, roles.object].forEach(pos => {
            if (pos !== undefined && pos < sequence.length) {
                newSequence.push(sequence[pos]);
                processed.add(pos);
            }
        });

        // Ajoute les autres éléments
        sequence.forEach((sign, index) => {
            if (!processed.has(index)) {
                newSequence.push(sign);
            }
        });

        // Remplace la séquence originale
        sequence.splice(0, sequence.length, ...newSequence);
        return true;
    }

    /**
     * Ajoute des auxiliaires français
     * @param sequence - Séquence de signes
     * @returns Succès
     * @private
     */
    private addFrenchAuxiliaries(sequence: LSFSign[]): boolean {
        const verbPosition = this.findVerbPosition(sequence);

        if (verbPosition === -1) return false;

        const auxiliarySign = this.createAuxiliarySign();
        sequence.splice(verbPosition, 0, auxiliarySign);
        return true;
    }

    /**
     * Ajoute des articles français
     * @param sequence - Séquence de signes
     * @returns Succès
     * @private
     */
    private addFrenchArticles(sequence: LSFSign[]): boolean {
        const nounPositions = this.findNounPositions(sequence);

        if (nounPositions.length === 0) return false;

        const targetPosition = nounPositions[0];
        const articleSign = this.createArticleSign();

        sequence.splice(targetPosition, 0, articleSign);
        return true;
    }

    /**
     * Supprime les doublons d'une séquence
     * @param sequence - Séquence de signes
     * @returns True si des modifications ont été apportées
     * @private
     */
    private removeDuplicates(sequence: LSFSign[]): boolean {
        let removed = false;

        for (let i = sequence.length - 1; i > 0; i--) {
            if (sequence[i].id === sequence[i - 1].id) {
                sequence.splice(i, 1);
                removed = true;
            }
        }

        return removed;
    }

    /**
     * Corrige l'ordre syntaxique vers une structure LSF
     * @param sequence - Séquence de signes
     * @returns True si des modifications ont été apportées
     * @private
     */
    private correctSyntaxOrder(sequence: LSFSign[]): boolean {
        const roles = this.identifySyntacticRoles(sequence);

        if (!roles.subject || !roles.verb || !roles.object) {
            return false;
        }

        // Vérifie si déjà en ordre SOV
        if (roles.subject < roles.object && roles.object < roles.verb) {
            return false;
        }

        // Réorganise en SOV
        const newSequence: LSFSign[] = [];
        const processed = new Set<number>();

        [roles.subject, roles.object, roles.verb].forEach(pos => {
            if (pos !== undefined && pos < sequence.length) {
                newSequence.push(sequence[pos]);
                processed.add(pos);
            }
        });

        sequence.forEach((sign, index) => {
            if (!processed.has(index)) {
                newSequence.push(sign);
            }
        });

        sequence.splice(0, sequence.length, ...newSequence);
        return true;
    }

    /**
     * Supprime les éléments d'interférence française
     * @param sequence - Séquence de signes
     * @returns True si des modifications ont été apportées
     * @private
     */
    private removeFrenchInterference(sequence: LSFSign[]): boolean {
        let removed = false;

        for (let i = sequence.length - 1; i >= 0; i--) {
            const sign = sequence[i];

            if (this.isFrenchInterference(sign)) {
                sequence.splice(i, 1);
                removed = true;
            }
        }

        return removed;
    }

    // Méthodes utilitaires pour l'analyse des signes

    private isSyntacticallyImportant(
        sign: LSFSign,
        index: number,
        sequence: readonly LSFSign[]
    ): boolean {
        if (index === 0 || index === sequence.length - 1) return true;
        if (this.isVerb(sign) || this.isSubject(sign)) return true;
        return false;
    }

    private isOmissibleElement(
        sign: LSFSign,
        index: number,
        sequence: readonly LSFSign[]
    ): boolean {
        if (index === 0 || index === sequence.length - 1) return false;
        if (this.isVerb(sign)) return false;
        if (this.isModifier(sign)) return true;
        return false;
    }

    private validateBasicStructure(sequence: readonly LSFSign[]): boolean {
        const hasVerb = sequence.some(sign => this.isVerb(sign));
        const hasConsecutiveDuplicates = sequence.some((sign, index) =>
            index > 0 && sign.id === sequence[index - 1].id
        );
        return hasVerb && !hasConsecutiveDuplicates;
    }

    private isModifier(sign: LSFSign): boolean {
        return this.getSignType(sign) === 'adjective' ||
            this.getSignType(sign) === 'adverb' ||
            this.getSignCategory(sign) === 'modifier';
    }

    private isVerb(sign: LSFSign): boolean {
        return this.getSignType(sign) === 'verb' || this.getSignCategory(sign) === 'action';
    }

    private isSubject(sign: LSFSign): boolean {
        return this.getSignType(sign) === 'pronoun' ||
            (this.getSignType(sign) === 'noun' && this.getSignRole(sign) === 'subject');
    }

    private isNoun(sign: LSFSign): boolean {
        return this.getSignType(sign) === 'noun';
    }

    private isShortSign(sign: LSFSign): boolean {
        const duration = this.getSignDuration(sign);
        return duration < 0.5;
    }

    private isFrenchInterference(sign: LSFSign): boolean {
        return this.getSignCategory(sign) === 'french_interference' ||
            this.getSignType(sign) === 'auxiliary' ||
            this.getSignType(sign) === 'article';
    }

    private hasContextualRedundancy(sign: LSFSign, sequence: readonly LSFSign[]): boolean {
        const sameTypeCount = sequence.filter(s => this.getSignType(s) === this.getSignType(sign)).length;
        return sameTypeCount > 1;
    }

    private identifySyntacticRoles(sequence: readonly LSFSign[]): {
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

    private isObject(sign: LSFSign): boolean {
        return this.getSignType(sign) === 'noun' && this.getSignRole(sign) === 'object';
    }

    private findVerbPosition(sequence: readonly LSFSign[]): number {
        return sequence.findIndex(sign => this.isVerb(sign));
    }

    private findNounPositions(sequence: readonly LSFSign[]): number[] {
        const positions: number[] = [];
        sequence.forEach((sign, index) => {
            if (this.isNoun(sign)) {
                positions.push(index);
            }
        });
        return positions;
    }

    private generateFrenchInterferenceElements(): LSFSign[] {
        return [
            this.createAuxiliarySign(),
            this.createArticleSign()
        ];
    }

    private generateRedundantElements(sequence: readonly LSFSign[]): LSFSign[] {
        const redundantElements: LSFSign[] = [];
        const candidates = sequence.filter(sign => this.isModifier(sign));

        if (candidates.length > 0) {
            redundantElements.push(this.deepCloneSign(candidates[0]));
        }

        return redundantElements;
    }

    private findOptimalInsertPosition(sequence: readonly LSFSign[], element: LSFSign): number {
        if (this.getSignType(element) === 'article') {
            const nounPosition = this.findNounPositions(sequence)[0];
            return nounPosition || 0;
        }

        if (this.getSignType(element) === 'auxiliary') {
            const verbPosition = this.findVerbPosition(sequence);
            return verbPosition >= 0 ? verbPosition : sequence.length;
        }

        return Math.floor(Math.random() * (sequence.length + 1));
    }

    private createAuxiliarySign(): LSFSign {
        return {
            id: 'AUX_AVOIR',
            type: 'auxiliary',
            category: 'french_interference'
        };
    }

    private createArticleSign(): LSFSign {
        return {
            id: 'ART_LE',
            type: 'article',
            category: 'french_interference'
        };
    }

    // Méthodes d'accès aux propriétés des signes

    private getSignType(sign: LSFSign): string {
        return (sign as { type?: string }).type || 'unknown';
    }

    private getSignCategory(sign: LSFSign): string {
        return (sign as { category?: string }).category || 'unknown';
    }

    private getSignRole(sign: LSFSign): string {
        return (sign as { role?: string }).role || 'unknown';
    }

    private getSignDuration(sign: LSFSign): number {
        const parameters = (sign as { parameters?: { timing?: { duration?: number } } }).parameters;
        return parameters?.timing?.duration || 1.0;
    }
}