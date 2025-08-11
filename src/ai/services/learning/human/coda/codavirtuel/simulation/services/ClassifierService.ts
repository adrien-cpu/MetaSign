/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/services/ClassifierService.ts
 * @description Service de gestion et d'analyse des classificateurs LSF
 * @author MetaSign
 * @version 1.1.0
 * @since 2024
 * 
 * Ce service fournit des utilitaires pour analyser, suggérer et valider
 * les classificateurs en LSF, ainsi que pour générer des rapports d'analyse.
 * 
 * @module ClassifierService
 * @requires LSFClassifierSystem
 */

import { LSF_CLASSIFIER_SYSTEM } from '../classifiers/LSFClassifierSystem';
import type { LSFClassifiersParameter } from '../types/LSFContentTypes';

/**
 * Statistiques des classificateurs
 */
export interface ClassifierStats {
    readonly totalClassifiers: number;
    readonly byCategory: Record<string, number>;
    readonly byDifficulty: Record<string, number>;
    readonly commonMistakes: number;
    readonly specializedContexts: number;
}

/**
 * Analyse d'un classificateur
 */
export interface ClassifierAnalysis {
    readonly accuracy: number;
    readonly errorTypes: readonly string[];
    readonly severity: 'low' | 'medium' | 'high';
    readonly recommendations: readonly string[];
    readonly issues: readonly string[];
}

/**
 * Suggestion de classificateur
 */
export interface ClassifierSuggestion {
    readonly primary: string;
    readonly alternatives: readonly string[];
    readonly reason: string;
    readonly difficulty: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Confusion entre classificateurs
 */
export interface ClassifierConfusion {
    readonly from: string;
    readonly to: string;
    readonly reason: string;
}

/**
 * Substitution de classificateur
 */
export interface ClassifierSubstitution {
    readonly from: string;
    readonly to: string;
}

/**
 * Qualité de substitution
 */
export type SubstitutionQuality = 'good' | 'acceptable' | 'poor' | 'invalid';

/**
 * Service de gestion des classificateurs LSF
 * Fournit des utilitaires pour l'analyse et la suggestion de classificateurs
 */
export class ClassifierService {
    private static readonly QUALITY_IMPACT_MAP: Record<SubstitutionQuality, number> = {
        good: 0.1,
        acceptable: 0.3,
        poor: 0.6,
        invalid: 0.9
    } as const;

    private static readonly PLAUSIBLE_CONFUSIONS: readonly ClassifierConfusion[] = [
        { from: 'cylindrical', to: 'spherical', reason: 'confusion_forme_ronde' },
        { from: 'flat_surface', to: 'thin_object', reason: 'confusion_objet_plat' },
        { from: 'holding_small', to: 'holding_thin', reason: 'confusion_manipulation' },
        { from: 'person_walking', to: 'animal_moving', reason: 'confusion_mouvement' }
    ] as const;

    /**
     * Obtient tous les noms de classificateurs disponibles
     * @returns Liste des noms de classificateurs
     */
    public static getAllClassifierNames(): readonly string[] {
        const { classifierTypes } = LSF_CLASSIFIER_SYSTEM;
        const names: string[] = [];

        Object.values(classifierTypes).forEach(category => {
            names.push(...Object.keys(category));
        });

        return names;
    }

    /**
     * Vérifie si un classificateur est valide
     * @param classifier - Nom du classificateur
     * @returns true si le classificateur est valide
     */
    public static isValidClassifier(classifier: string): boolean {
        return this.getAllClassifierNames().includes(classifier);
    }

    /**
     * Obtient la catégorie d'un classificateur
     * @param classifier - Nom du classificateur
     * @returns Catégorie du classificateur ou undefined
     */
    public static getClassifierCategory(classifier: string): string | undefined {
        const { classifierTypes } = LSF_CLASSIFIER_SYSTEM;

        for (const [category, types] of Object.entries(classifierTypes)) {
            if (Object.keys(types).includes(classifier)) {
                return category;
            }
        }

        return undefined;
    }

    /**
     * Détermine le niveau de difficulté d'un classificateur
     * @param classifier - Nom du classificateur
     * @returns Niveau de difficulté
     */
    public static getClassifierDifficulty(classifier: string): 'beginner' | 'intermediate' | 'advanced' {
        const { difficulty } = LSF_CLASSIFIER_SYSTEM;

        if (difficulty.beginner.includes(classifier)) return 'beginner';
        if (difficulty.intermediate.includes(classifier)) return 'intermediate';
        if (difficulty.advanced.includes(classifier)) return 'advanced';

        return 'intermediate'; // Fallback
    }

    /**
     * Génère une confusion plausible entre classificateurs
     * @returns Objet décrivant la confusion
     */
    public static generatePlausibleConfusion(): ClassifierConfusion {
        const randomIndex = Math.floor(Math.random() * this.PLAUSIBLE_CONFUSIONS.length);
        return this.PLAUSIBLE_CONFUSIONS[randomIndex];
    }

    /**
     * Génère une substitution aléatoire mais plausible
     * @returns Substitution générée
     */
    public static generateRandomSubstitution(): ClassifierSubstitution {
        const classifiers = this.getAllClassifierNames();
        const from = classifiers[Math.floor(Math.random() * classifiers.length)];
        let to = classifiers[Math.floor(Math.random() * classifiers.length)];

        // Évite la substitution identique
        while (to === from && classifiers.length > 1) {
            to = classifiers[Math.floor(Math.random() * classifiers.length)];
        }

        return { from, to };
    }

    /**
     * Évalue la qualité d'une substitution de classificateur
     * @param from - Classificateur source
     * @param to - Classificateur cible
     * @returns Qualité de la substitution
     */
    public static evaluateSubstitutionQuality(from: string, to: string): SubstitutionQuality {
        if (from === to) return 'good';

        const fromCategory = this.getClassifierCategory(from);
        const toCategory = this.getClassifierCategory(to);

        if (fromCategory === toCategory) return 'acceptable';
        if (fromCategory && toCategory) return 'poor';
        return 'invalid';
    }

    /**
     * Calcule l'impact sur la précision basé sur la qualité de substitution
     * @param quality - Qualité de la substitution
     * @returns Impact sur la précision (0-1)
     */
    public static calculateAccuracyImpact(quality: SubstitutionQuality): number {
        return this.QUALITY_IMPACT_MAP[quality];
    }

    /**
     * Obtient des statistiques sur les classificateurs supportés
     * @returns Statistiques des classificateurs
     */
    public static getClassifierStats(): ClassifierStats {
        const { classifierTypes, commonMistakes, difficulty, specializedContexts } = LSF_CLASSIFIER_SYSTEM;

        const byCategory: Record<string, number> = {};
        Object.entries(classifierTypes).forEach(([category, types]) => {
            byCategory[category] = Object.keys(types).length;
        });

        return {
            totalClassifiers: this.getAllClassifierNames().length,
            byCategory,
            byDifficulty: {
                beginner: difficulty.beginner.length,
                intermediate: difficulty.intermediate.length,
                advanced: difficulty.advanced.length
            },
            commonMistakes: Object.keys(commonMistakes).length,
            specializedContexts: Object.keys(specializedContexts).length
        };
    }

    /**
     * Génère un rapport d'analyse de classificateur
     * @param classifiers - Paramètre de classificateurs
     * @returns Rapport d'analyse
     */
    public static generateClassifierAnalysis(classifiers: LSFClassifiersParameter): ClassifierAnalysis {
        const errorTypes: string[] = [];
        const issues: string[] = [];
        const recommendations: string[] = [];

        // Analyse des types d'erreurs
        if (classifiers.inappropriate) {
            errorTypes.push('Classificateur inapproprié');
            issues.push('Usage de classificateur inadapté au contexte');
            recommendations.push('Revoir la sélection du classificateur selon l\'objet');
        }

        if (classifiers.confusion) {
            errorTypes.push('Confusion entre classificateurs');
            issues.push('Mélange entre classificateurs similaires');
            recommendations.push('Distinguer clairement les caractéristiques des objets');
        }

        if (classifiers.oversimplified) {
            errorTypes.push('Simplification excessive');
            issues.push('Perte de spécificité dans la classification');
            recommendations.push('Utiliser des classificateurs plus précis');
        }

        if (classifiers.omission) {
            errorTypes.push('Omission de classificateur');
            issues.push('Classificateur manquant pour la description');
            recommendations.push('Intégrer systématiquement les classificateurs nécessaires');
        }

        if (classifiers.inconsistentUsage) {
            errorTypes.push('Usage inconsistant');
            issues.push('Variations inappropriées de classificateurs');
            recommendations.push('Maintenir la cohérence dans l\'usage');
        }

        // Évaluation de la sévérité
        const accuracy = classifiers.accuracy ?? 1;
        let severity: 'low' | 'medium' | 'high' = 'low';
        if (accuracy < 0.3) severity = 'high';
        else if (accuracy < 0.6) severity = 'medium';

        return {
            accuracy,
            errorTypes,
            severity,
            recommendations,
            issues
        };
    }

    /**
     * Suggère un classificateur approprié pour un objet donné
     * @param objectName - Nom de l'objet
     * @param context - Contexte d'usage
     * @returns Suggestion de classificateur
     */
    public static suggestClassifier(objectName: string, context: string = 'general'): ClassifierSuggestion {
        const suggestions = this.getObjectSuggestions();
        const suggestion = suggestions[objectName.toLowerCase()] ?? {
            primary: 'flat_surface',
            alternatives: ['spherical'],
            reason: 'Classificateur par défaut'
        };

        // Adapte selon le contexte si disponible
        let primaryClassifier = suggestion.primary;
        if (suggestion.contextVariations?.[context]) {
            primaryClassifier = suggestion.contextVariations[context];
        }

        return {
            primary: primaryClassifier,
            alternatives: suggestion.alternatives,
            reason: suggestion.reason,
            difficulty: this.getClassifierDifficulty(primaryClassifier)
        };
    }

    /**
     * Obtient les suggestions de classificateurs par objet
     * @returns Dictionnaire des suggestions
     * @private
     */
    private static getObjectSuggestions(): Record<string, {
        primary: string;
        alternatives: readonly string[];
        reason: string;
        contextVariations?: Record<string, string>;
    }> {
        return {
            'livre': {
                primary: 'flat_surface',
                alternatives: ['thin_object'],
                reason: 'Objet plat rectangulaire',
                contextVariations: {
                    'manipulation': 'holding_thin',
                    'spatial_description': 'flat_surface'
                }
            },
            'balle': {
                primary: 'spherical',
                alternatives: ['small_round'],
                reason: 'Objet sphérique',
                contextVariations: {
                    'manipulation': 'holding_large',
                    'movement': 'spherical'
                }
            },
            'voiture': {
                primary: 'vehicle',
                alternatives: [],
                reason: 'Véhicule en mouvement',
                contextVariations: {
                    'narrative_action': 'vehicle',
                    'spatial_description': 'flat_surface'
                }
            },
            'crayon': {
                primary: 'thin_object',
                alternatives: ['holding_thin'],
                reason: 'Objet fin et allongé',
                contextVariations: {
                    'manipulation': 'holding_thin',
                    'spatial_description': 'thin_object'
                }
            }
        };
    }

    /**
     * Sélectionne un classificateur inapproprié pour le contexte
     * @returns Nom du classificateur inapproprié
     */
    public static selectInappropriateClassifier(): string {
        const allClassifiers = this.getAllClassifierNames();
        const randomIndex = Math.floor(Math.random() * allClassifiers.length);
        return allClassifiers[randomIndex];
    }
}