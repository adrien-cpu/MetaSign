/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/utils/ErrorSimulationUtils.ts
 * @description Utilitaires avancés pour la simulation d'erreurs LSF
 * Fournit des méthodes statistiques, de validation et de manipulation pour le simulateur d'erreurs
 * @author MetaSign
 * @version 2.0.0
 * @since 2025-05-29
 */

import { ErrorSimulationConfig } from '../types/ErrorTypes';
import { LSFContent } from '../types/LSFContentTypes';

/**
 * Configuration pour la génération de nombres aléatoires
 */
interface RandomGenerationConfig {
    /** Graine pour la génération reproductible */
    seed?: number;
    /** Distribution à utiliser (normale, uniforme, etc.) */
    distribution?: 'uniform' | 'normal' | 'exponential';
    /** Paramètres spécifiques à la distribution */
    distributionParams?: Record<string, number>;
}

/**
 * Résultat d'une validation de contenu
 */
interface ContentValidationResult {
    /** Le contenu est-il valide */
    isValid: boolean;
    /** Messages d'erreur si invalide */
    errors: string[];
    /** Avertissements non bloquants */
    warnings: string[];
    /** Score de qualité (0-1) */
    qualityScore: number;
}

/**
 * Statistiques de simulation d'erreurs
 */
interface ErrorSimulationStats {
    /** Nombre total d'erreurs appliquées */
    totalErrorsApplied: number;
    /** Erreurs par catégorie */
    errorsByCategory: Record<string, number>;
    /** Taux d'erreur effectif */
    effectiveErrorRate: number;
    /** Temps d'exécution en millisecondes */
    executionTime: number;
}

/**
 * Utilitaires avancés pour la simulation d'erreurs
 * Fournit des méthodes statistiques, de clonage sécurisé et de manipulation probabiliste
 */
export class ErrorSimulationUtils {
    private static seedValue: number | undefined;
    private static readonly MAX_CLONE_DEPTH = 50;
    private static readonly CIRCULAR_REF_CACHE = new WeakMap();

    /**
     * Détermine si une erreur doit être appliquée selon le taux d'erreur configuré
     * @param config Configuration de la simulation d'erreurs
     * @param multiplier Multiplicateur optionnel pour ajuster la probabilité
     * @param context Contexte additionnel pour la décision
     * @returns true si une erreur doit être appliquée, false sinon
     */
    public static shouldApplyError(
        config: ErrorSimulationConfig,
        multiplier = 1,
        context?: { conceptDifficulty?: number; userLevel?: string }
    ): boolean {
        let effectiveRate = config.errorRate * multiplier;

        // Ajustement basé sur le contexte
        if (context) {
            if (context.conceptDifficulty !== undefined) {
                effectiveRate *= (1 + context.conceptDifficulty * 0.5);
            }

            if (context.userLevel) {
                const levelMultiplier = this.getLevelMultiplier(context.userLevel);
                effectiveRate *= levelMultiplier;
            }
        }

        return this.generateRandomNumber() < Math.min(1, effectiveRate);
    }

    /**
     * Obtient le multiplicateur de niveau pour l'utilisateur
     * @param userLevel Niveau de l'utilisateur
     * @returns Multiplicateur approprié
     * @private
     */
    private static getLevelMultiplier(userLevel: string): number {
        const levelMultipliers: Record<string, number> = {
            'A1': 1.5,
            'A2': 1.2,
            'B1': 1.0,
            'B2': 0.8,
            'C1': 0.6,
            'C2': 0.4
        };

        return levelMultipliers[userLevel] ?? 1.0;
    }

    /**
     * Vérifie si un contenu est exempt d'erreurs selon les concepts maîtrisés de l'utilisateur
     * @param content Contenu LSF à vérifier
     * @param config Configuration de la simulation d'erreurs
     * @returns true si le contenu doit être exempt d'erreurs, false sinon
     */
    public static isErrorExempt(content: LSFContent, config: ErrorSimulationConfig): boolean {
        // Si le contenu est une chaîne, pas d'exemption
        if (typeof content === 'string') {
            return false;
        }

        // Vérifie l'exemption par concept maîtrisé
        const conceptExempt = !!(content.conceptId &&
            config.userMasteredConcepts &&
            config.userMasteredConcepts.includes(content.conceptId));

        // Vérifie l'exemption par seuil de détection
        if (config.expectedDetectionThreshold !== undefined && content.exerciseParams) {
            const difficulty = content.exerciseParams.difficulty as number | undefined;
            if (difficulty !== undefined && difficulty < config.expectedDetectionThreshold) {
                return true;
            }
        }

        return conceptExempt;
    }

    /**
     * Clône profondément un objet de manière sécurisée en évitant les références circulaires
     * @param obj Objet à cloner
     * @param depth Profondeur actuelle (usage interne)
     * @returns Copie profonde de l'objet
     */
    public static deepClone<T>(obj: T, depth = 0): T {
        // Protection contre la profondeur excessive
        if (depth > this.MAX_CLONE_DEPTH) {
            throw new Error(`Profondeur de clonage excessive (${depth}). Possible référence circulaire.`);
        }

        // Cas de base : types primitifs ou null/undefined
        if (obj === null || obj === undefined || typeof obj !== 'object') {
            return obj;
        }

        // Gestion des types spéciaux
        if (obj instanceof Date) {
            return new Date(obj.getTime()) as unknown as T;
        }

        if (obj instanceof RegExp) {
            return new RegExp(obj.source, obj.flags) as unknown as T;
        }

        if (obj instanceof Map) {
            const clonedMap = new Map();
            for (const [key, value] of obj.entries()) {
                clonedMap.set(key, this.deepClone(value, depth + 1));
            }
            return clonedMap as unknown as T;
        }

        if (obj instanceof Set) {
            const clonedSet = new Set();
            for (const value of obj.values()) {
                clonedSet.add(this.deepClone(value, depth + 1));
            }
            return clonedSet as unknown as T;
        }

        // Détection des références circulaires
        if (this.CIRCULAR_REF_CACHE.has(obj as Record<string, unknown>)) {
            return this.CIRCULAR_REF_CACHE.get(obj as Record<string, unknown>) as T;
        }

        // Clonage des arrays
        if (Array.isArray(obj)) {
            const clonedArray: unknown[] = [];
            this.CIRCULAR_REF_CACHE.set(obj as Record<string, unknown>, clonedArray);

            for (let i = 0; i < obj.length; i++) {
                clonedArray[i] = this.deepClone(obj[i], depth + 1);
            }

            return clonedArray as unknown as T;
        }

        // Clonage des objets
        const clonedObj: Record<string, unknown> = {};
        this.CIRCULAR_REF_CACHE.set(obj as Record<string, unknown>, clonedObj);

        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                clonedObj[key] = this.deepClone((obj as Record<string, unknown>)[key], depth + 1);
            }
        }

        return clonedObj as T;
    }

    /**
     * Choisit aléatoirement un élément dans un tableau avec poids optionnels
     * @param array Tableau d'éléments
     * @param weights Poids optionnels pour chaque élément
     * @returns Un élément aléatoire du tableau ou undefined si le tableau est vide
     */
    public static getRandomElement<T>(array: T[], weights?: number[]): T | undefined {
        if (!array || array.length === 0) {
            return undefined;
        }

        // Sélection simple si pas de poids
        if (!weights || weights.length !== array.length) {
            const randomIndex = Math.floor(this.generateRandomNumber() * array.length);
            return array[randomIndex];
        }

        // Sélection pondérée
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        if (totalWeight <= 0) {
            return this.getRandomElement(array); // Fallback à la sélection uniforme
        }

        let randomValue = this.generateRandomNumber() * totalWeight;
        for (let i = 0; i < array.length; i++) {
            randomValue -= weights[i];
            if (randomValue <= 0) {
                return array[i];
            }
        }

        return array[array.length - 1]; // Fallback
    }

    /**
     * Génère un nombre aléatoire dans une plage donnée avec distribution configurable
     * @param min Valeur minimale (incluse)
     * @param max Valeur maximale (incluse)
     * @param config Configuration pour la génération
     * @returns Nombre aléatoire dans la plage spécifiée
     */
    public static getRandomInRange(
        min: number,
        max: number,
        config?: RandomGenerationConfig
    ): number {
        const distribution = config?.distribution ?? 'uniform';

        switch (distribution) {
            case 'uniform':
                return this.generateRandomNumber() * (max - min) + min;

            case 'normal':
                const mean = (min + max) / 2;
                const stdDev = (max - min) / 6; // 99.7% des valeurs dans la plage
                return this.generateNormalRandom(mean, stdDev, min, max);

            case 'exponential':
                const lambda = config?.distributionParams?.lambda ?? 1;
                return this.generateExponentialRandom(lambda, min, max);

            default:
                return this.generateRandomNumber() * (max - min) + min;
        }
    }

    /**
     * Applique une perturbation aléatoire à une valeur avec distribution gaussienne
     * @param value Valeur à perturber
     * @param maxPerturbation Perturbation maximale en pourcentage (0-1)
     * @param preserveBounds Préserver les limites logiques
     * @returns Valeur perturbée
     */
    public static applyRandomPerturbation(
        value: number,
        maxPerturbation = 0.1,
        preserveBounds = true
    ): number {
        const perturbation = this.generateNormalRandom(0, maxPerturbation / 3);
        let perturbedValue = value * (1 + perturbation);

        // Préservation des limites si demandée
        if (preserveBounds) {
            if (value >= 0 && value <= 1) {
                perturbedValue = Math.max(0, Math.min(1, perturbedValue));
            } else if (value >= 0) {
                perturbedValue = Math.max(0, perturbedValue);
            }
        }

        return perturbedValue;
    }

    /**
     * Valide la structure et le contenu d'un objet LSF
     * @param content Contenu à valider
     * @returns Résultat de validation détaillé
     */
    public static validateContent(content: LSFContent): ContentValidationResult {
        const result: ContentValidationResult = {
            isValid: true,
            errors: [],
            warnings: [],
            qualityScore: 1.0
        };

        // Validation basique
        if (!content) {
            result.isValid = false;
            result.errors.push('Contenu vide ou undefined');
            result.qualityScore = 0;
            return result;
        }

        // Validation pour contenu string
        if (typeof content === 'string') {
            if (content.trim().length === 0) {
                result.isValid = false;
                result.errors.push('Chaîne vide');
                result.qualityScore = 0;
            }
            return result;
        }

        // Validation pour contenu objet
        let qualityFactors = 0;
        const totalFactors = 4;

        // Facteur 1: Présence d'un ID
        if (content.id) {
            qualityFactors++;
        } else {
            result.warnings.push('Aucun ID défini');
        }

        // Facteur 2: Présence de paramètres
        if (content.parameters) {
            qualityFactors++;
        } else {
            result.warnings.push('Aucun paramètre LSF défini');
        }

        // Facteur 3: Concept ID pour traçabilité
        if (content.conceptId) {
            qualityFactors++;
        } else {
            result.warnings.push('Aucun concept ID pour la traçabilité');
        }

        // Facteur 4: Type défini
        if (content.type) {
            qualityFactors++;
        } else {
            result.warnings.push('Type de contenu non spécifié');
        }

        result.qualityScore = qualityFactors / totalFactors;

        return result;
    }

    /**
     * Calcule les statistiques d'une session de simulation
     * @param appliedErrors Erreurs appliquées durant la session
     * @param startTime Timestamp de début
     * @param totalContent Nombre total de contenus traités
     * @returns Statistiques détaillées
     */
    public static calculateSimulationStats(
        appliedErrors: Array<{ category: string; timestamp: number }>,
        startTime: number,
        totalContent: number
    ): ErrorSimulationStats {
        const errorsByCategory: Record<string, number> = {};

        for (const error of appliedErrors) {
            errorsByCategory[error.category] = (errorsByCategory[error.category] ?? 0) + 1;
        }

        return {
            totalErrorsApplied: appliedErrors.length,
            errorsByCategory,
            effectiveErrorRate: totalContent > 0 ? appliedErrors.length / totalContent : 0,
            executionTime: Date.now() - startTime
        };
    }

    /**
     * Configure la graine pour la génération de nombres aléatoires reproductibles
     * @param seed Graine à utiliser
     */
    public static setSeed(seed: number): void {
        this.seedValue = seed;
    }

    /**
     * Réinitialise le cache des références circulaires
     */
    public static clearCircularRefCache(): void {
        // Le WeakMap se nettoie automatiquement, mais on peut forcer si nécessaire
        Object.setPrototypeOf(this.CIRCULAR_REF_CACHE, WeakMap.prototype);
    }

    /**
     * Génère un nombre aléatoire (avec graine optionnelle)
     * @returns Nombre aléatoire entre 0 et 1
     * @private
     */
    private static generateRandomNumber(): number {
        if (this.seedValue !== undefined) {
            // Générateur pseudo-aléatoire simple basé sur la graine
            this.seedValue = (this.seedValue * 9301 + 49297) % 233280;
            return this.seedValue / 233280;
        }
        return Math.random();
    }

    /**
     * Génère un nombre aléatoire selon une distribution normale
     * @param mean Moyenne
     * @param stdDev Écart-type
     * @param min Valeur minimale
     * @param max Valeur maximale
     * @returns Nombre aléatoire normal dans les limites
     * @private
     */
    private static generateNormalRandom(mean: number, stdDev: number, min?: number, max?: number): number {
        // Méthode Box-Muller pour génération normale
        let u = 0, v = 0;
        while (u === 0) u = this.generateRandomNumber(); // Converting [0,1) to (0,1)
        while (v === 0) v = this.generateRandomNumber();

        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        let result = z * stdDev + mean;

        // Limitation aux bornes si spécifiées
        if (min !== undefined) result = Math.max(min, result);
        if (max !== undefined) result = Math.min(max, result);

        return result;
    }

    /**
     * Génère un nombre aléatoire selon une distribution exponentielle
     * @param lambda Paramètre lambda
     * @param min Valeur minimale
     * @param max Valeur maximale
     * @returns Nombre aléatoire exponentiel dans les limites
     * @private
     */
    private static generateExponentialRandom(lambda: number, min: number, max: number): number {
        const u = this.generateRandomNumber();
        let result = -Math.log(1 - u) / lambda;

        // Normalisation dans la plage [min, max]
        result = (result % (max - min)) + min;

        return result;
    }
}