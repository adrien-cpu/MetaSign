/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/__tests__/utils/IntegrationTestUtils.ts
 * @description Utilitaires TypeScript stricts pour les tests d'intégration
 * 
 * Ce module fournit des utilitaires pour faciliter l'écriture et l'exécution
 * des tests d'intégration avec un typage strict et des vérifications robustes.
 * 
 * ## Utilitaires fournis :
 * - 🔍 **Vérification de méthodes** : Validation sûre de l'existence des méthodes
 * - 📞 **Appels sécurisés** : Exécution de méthodes avec gestion d'erreur
 * - 🎯 **Génération de paramètres** : Création de paramètres de test valides
 * - ⚡ **Mesures de performance** : Outils pour benchmarker les opérations
 * - 🧮 **Validation de types** : Guards et validateurs de types
 * 
 * @module IntegrationTestUtils
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Testing Division
 * 
 * @requires EmotionalTypes
 * @requires IntegrationTestTypes
 * 
 * @see {@link ../types/IntegrationTestTypes} - Types utilisés par les utilitaires
 * @see {@link ./IntegrationTestFactory} - Factory pour créer les instances
 */

import type {
    EmotionGenerationParams
} from '../types/IntegrationTestTypes';
import type {
    TestableEmotionalSystem,
    PerformanceMetrics,
    PerformanceTestResult,
    EmotionalAnalysis,
    EmotionalHistory,
    SystemStatistics
} from '../types/IntegrationTestTypes';

/**
 * Classe d'utilitaires statiques pour les tests d'intégration
 */
export class IntegrationTestUtils {
    /**
     * Vérifie si une méthode existe sur un objet de manière sûre
     * 
     * @param obj - Objet à vérifier
     * @param methodName - Nom de la méthode à chercher
     * @returns true si la méthode existe et est une fonction
     * 
     * @example
     * ```typescript
     * if (IntegrationTestUtils.hasMethod(system, 'getCurrentEmotionalState')) {
     *   const state = system.getCurrentEmotionalState('student1');
     * }
     * ```
     */
    public static hasMethod(obj: unknown, methodName: string): obj is Record<string, (...args: unknown[]) => unknown> {
        return Boolean(
            obj &&
            typeof obj === 'object' &&
            methodName in obj &&
            typeof (obj as Record<string, unknown>)[methodName] === 'function'
        );
    }

    /**
     * Appelle une méthode de manière sûre si elle existe
     * 
     * @param obj - Objet sur lequel appeler la méthode
     * @param methodName - Nom de la méthode à appeler
     * @param args - Arguments à passer à la méthode
     * @returns Résultat de la méthode ou undefined si la méthode n'existe pas
     * 
     * @example
     * ```typescript
     * const analysis = await IntegrationTestUtils.safeCall(
     *   system, 
     *   'performCompleteAnalysis', 
     *   'student1'
     * );
     * ```
     */
    public static async safeCall<T = unknown>(
        obj: unknown,
        methodName: string,
        ...args: unknown[]
    ): Promise<T | undefined> {
        if (this.hasMethod(obj, methodName)) {
            try {
                const method = (obj as Record<string, (...args: unknown[]) => unknown>)[methodName];
                const result = await method.apply(obj, args);
                return result as T;
            } catch {
                console.warn(`Erreur lors de l'appel de ${methodName}`);
                return undefined;
            }
        }
        return undefined;
    }

    /**
     * Génère des paramètres d'émotion valides pour les tests
     * 
     * @param overrides - Propriétés à surcharger dans les paramètres par défaut
     * @returns Paramètres d'émotion valides et typés
     * 
     * @example
     * ```typescript
     * const params = IntegrationTestUtils.createValidEmotionParams({
     *   learningOutcome: 'failure',
     *   stimulusIntensity: 0.9
     * });
     * ```
     */
    public static createValidEmotionParams(
        overrides: Partial<EmotionGenerationParams> = {}
    ): EmotionGenerationParams {
        const defaults: EmotionGenerationParams = {
            learningContext: 'test_context',
            stimulus: 'test_stimulus',
            stimulusIntensity: 0.5,
            learningOutcome: 'success',
            contextualFactors: ['integration_test']
        };

        return {
            ...defaults,
            ...overrides,
            // Validation des valeurs critiques
            stimulusIntensity: this.clampValue(overrides.stimulusIntensity ?? defaults.stimulusIntensity, 0, 1),
            contextualFactors: [
                ...(defaults.contextualFactors || []),
                ...(overrides.contextualFactors || [])
            ]
        };
    }

    /**
     * Mesure les performances d'une opération
     * 
     * @param operation - Opération à mesurer
     * @param iterations - Nombre d'itérations à effectuer (défaut: 1)
     * @returns Métriques de performance détaillées
     * 
     * @example
     * ```typescript
     * const metrics = await IntegrationTestUtils.measurePerformance(async () => {
     *   return await system.generateEmotionalState('student1', params);
     * }, 100);
     * ```
     */
    public static async measurePerformance<T>(
        operation: () => Promise<T>,
        iterations: number = 1
    ): Promise<PerformanceMetrics> {
        const startTime = Date.now();
        const memoryBefore = process.memoryUsage().heapUsed;

        // Exécution des itérations
        for (let i = 0; i < iterations; i++) {
            await operation();
        }

        const endTime = Date.now();
        const memoryAfter = process.memoryUsage().heapUsed;

        const totalTime = endTime - startTime;
        const avgTimePerOperation = totalTime / iterations;
        const memoryIncrease = memoryAfter - memoryBefore;

        return {
            startTime,
            endTime,
            totalTime,
            totalOperations: iterations,
            avgTimePerOperation,
            memoryBefore,
            memoryAfter,
            memoryIncrease
        };
    }

    /**
     * Valide les performances selon des seuils prédéfinis
     * 
     * @param metrics - Métriques à valider
     * @param maxAvgTimePerOperation - Temps maximum par opération (ms)
     * @param maxTotalTime - Temps total maximum (ms)
     * @param maxMemoryIncrease - Augmentation mémoire maximum (bytes)
     * @returns Résultat de validation avec détails
     * 
     * @example
     * ```typescript
     * const result = IntegrationTestUtils.validatePerformance(metrics, 100, 60000, 50*1024*1024);
     * expect(result.passed).toBe(true);
     * ```
     */
    public static validatePerformance(
        metrics: PerformanceMetrics,
        maxAvgTimePerOperation: number = 100,
        maxTotalTime: number = 60000,
        maxMemoryIncrease: number = 100 * 1024 * 1024 // 100MB
    ): PerformanceTestResult {
        const thresholds = {
            maxAvgTimePerOperation,
            maxTotalTime,
            maxMemoryIncrease
        };

        const passed =
            metrics.avgTimePerOperation <= maxAvgTimePerOperation &&
            metrics.totalTime <= maxTotalTime &&
            metrics.memoryIncrease <= maxMemoryIncrease;

        return {
            metrics,
            passed,
            thresholds
        };
    }

    /**
     * Génère un ID unique pour les tests
     * 
     * @param prefix - Préfixe pour l'ID
     * @returns ID unique avec timestamp
     * 
     * @example
     * ```typescript
     * const studentId = IntegrationTestUtils.generateTestId('student');
     * // Résultat: 'student_1234567890123_abc'
     * ```
     */
    public static generateTestId(prefix: string = 'test'): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 5);
        return `${prefix}_${timestamp}_${random}`;
    }

    /**
     * Attend un délai spécifié de manière asynchrone
     * 
     * @param ms - Délai en millisecondes
     * @returns Promise qui se résout après le délai
     * 
     * @example
     * ```typescript
     * await IntegrationTestUtils.delay(1000); // Attend 1 seconde
     * ```
     */
    public static async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Valide qu'un objet implémente l'interface TestableEmotionalSystem
     * 
     * @param obj - Objet à valider
     * @returns true si l'objet a les méthodes requises
     * 
     * @example
     * ```typescript
     * if (IntegrationTestUtils.isTestableEmotionalSystem(system)) {
     *   const state = await system.generateEmotionalState('student1', params);
     * }
     * ```
     */
    public static isTestableEmotionalSystem(obj: unknown): obj is TestableEmotionalSystem {
        return Boolean(
            obj &&
            typeof obj === 'object' &&
            this.hasMethod(obj, 'generateEmotionalState')
        );
    }

    /**
     * Valide qu'un objet est une analyse émotionnelle valide
     * 
     * @param obj - Objet à valider
     * @returns true si l'objet a la structure d'EmotionalAnalysis
     */
    public static isValidAnalysis(obj: unknown): obj is EmotionalAnalysis {
        return Boolean(
            obj &&
            typeof obj === 'object' &&
            'currentState' in obj &&
            'recentHistory' in obj &&
            'patterns' in obj &&
            'recommendations' in obj &&
            'confidence' in obj &&
            typeof (obj as { confidence: unknown }).confidence === 'number'
        );
    }

    /**
     * Valide qu'un objet est un historique émotionnel valide
     * 
     * @param obj - Objet à valider
     * @returns true si l'objet a la structure d'EmotionalHistory
     */
    public static isValidHistory(obj: unknown): obj is EmotionalHistory {
        return Boolean(
            obj &&
            typeof obj === 'object' &&
            'studentId' in obj &&
            'stateHistory' in obj &&
            Array.isArray((obj as { stateHistory: unknown }).stateHistory)
        );
    }

    /**
     * Valide qu'un objet contient des statistiques système valides
     * 
     * @param obj - Objet à valider
     * @returns true si l'objet a la structure de SystemStatistics
     */
    public static isValidStatistics(obj: unknown): obj is SystemStatistics {
        return Boolean(
            obj &&
            typeof obj === 'object' &&
            'totalActiveStudents' in obj &&
            typeof (obj as { totalActiveStudents: unknown }).totalActiveStudents === 'number'
        );
    }

    /**
     * Limite une valeur entre un minimum et un maximum
     * 
     * @param value - Valeur à limiter
     * @param min - Valeur minimum
     * @param max - Valeur maximum
     * @returns Valeur limitée
     * @private
     */
    private static clampValue(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Calcule des statistiques sur un tableau de nombres
     * 
     * @param values - Tableau de valeurs numériques
     * @returns Statistiques descriptives
     * 
     * @example
     * ```typescript
     * const stats = IntegrationTestUtils.calculateStatistics([1, 2, 3, 4, 5]);
     * // { mean: 3, median: 3, min: 1, max: 5, std: 1.58 }
     * ```
     */
    public static calculateStatistics(values: ReadonlyArray<number>): {
        readonly mean: number;
        readonly median: number;
        readonly min: number;
        readonly max: number;
        readonly std: number;
    } {
        if (values.length === 0) {
            return { mean: 0, median: 0, min: 0, max: 0, std: 0 };
        }

        const sorted = [...values].sort((a, b) => a - b);
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const median = sorted.length % 2 === 0
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)];

        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const std = Math.sqrt(variance);

        return {
            mean: Number(mean.toFixed(3)),
            median: Number(median.toFixed(3)),
            min: sorted[0],
            max: sorted[sorted.length - 1],
            std: Number(std.toFixed(3))
        };
    }

    /**
     * Crée un rapport de performance formaté
     * 
     * @param metrics - Métriques de performance
     * @param operation - Nom de l'opération mesurée
     * @returns Rapport formaté pour les logs
     * 
     * @example
     * ```typescript
     * const report = IntegrationTestUtils.formatPerformanceReport(metrics, 'Génération d\'états émotionnels');
     * console.log(report);
     * ```
     */
    public static formatPerformanceReport(metrics: PerformanceMetrics, operation: string): string {
        const memoryMB = (metrics.memoryIncrease / (1024 * 1024)).toFixed(2);
        const avgTimeMs = metrics.avgTimePerOperation.toFixed(2);

        return [
            `📊 Rapport de performance - ${operation}`,
            `   Opérations: ${metrics.totalOperations}`,
            `   Temps total: ${metrics.totalTime}ms`,
            `   Temps moyen: ${avgTimeMs}ms/opération`,
            `   Mémoire utilisée: ${memoryMB}MB`,
            `   Débit: ${(metrics.totalOperations / (metrics.totalTime / 1000)).toFixed(2)} ops/sec`
        ].join('\n');
    }
}