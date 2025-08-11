//src/ai/system/expressions/cultural/__tests__/utils/core/TestPlugin.ts
import { TestScenario, TestResults } from '../types';

export interface TestPlugin {
    /**
     * Nom unique du plugin
     */
    readonly name: string;

    /**
     * Priorité du plugin (ordre d'exécution)
     */
    readonly priority: number;

    /**
     * Initialise le plugin
     */
    initialize(): Promise<void>;

    /**
     * Étend ou modifie un scénario de test
     * @param scenario Scénario original
     * @returns Scénario modifié
     */
    extendScenario(scenario: TestScenario): Promise<TestScenario>;

    /**
     * Analyse ou enrichit les résultats de test
     * @param results Résultats originaux
     * @returns Résultats enrichis
     */
    analyzeResults(results: TestResults): Promise<TestResults>;

    /**
     * Libère les ressources utilisées par le plugin
     */
    dispose(): Promise<void>;
}

/**
 * Classe de base pour l'implémentation des plugins
 */
export abstract class BaseTestPlugin implements TestPlugin {
    constructor(
        public readonly name: string,
        public readonly priority: number = 100
    ) { }

    async initialize(): Promise<void> {
        // Implémentation par défaut
    }

    async extendScenario(scenario: TestScenario): Promise<TestScenario> {
        // Par défaut, retourne le scénario sans modification
        return scenario;
    }

    async analyzeResults(results: TestResults): Promise<TestResults> {
        // Par défaut, retourne les résultats sans modification
        return results;
    }

    async dispose(): Promise<void> {
        // Implémentation par défaut
    }
}