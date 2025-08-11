//src/ai/system/expressions/cultural/__tests__/utils/index.ts
// Point d'entrée principal
import { TestBuilder } from './core/TestBuilder';
import { TestRegistry } from './core/TestRegistry';
import { ScenarioGenerator } from './generators/ScenarioGenerator';
import { CULTURAL_TEST_CONSTANTS } from './constants/cultural-test-constants';
import { ValidationStrategyFactory } from './core/ValidationStrategy';
import { TestPlugin, BaseTestPlugin } from './core/TestPlugin';
import { TestParameters, TestScenario, TestResults, ValidationReport, TestReport } from './types';

/**
 * Classe façade modernisée pour les utilitaires de test culturel
 */
export class CulturalTestUtilities {
    private readonly scenarioGenerator: ScenarioGenerator;
    private readonly registry: TestRegistry;

    constructor() {
        this.scenarioGenerator = new ScenarioGenerator(CULTURAL_TEST_CONSTANTS);
        this.registry = TestRegistry.getInstance();
    }

    /**
     * Génère un scénario de test complet
     */
    generateTestScenario(testParams: TestParameters): TestScenario {
        return this.scenarioGenerator.generate(testParams);
    }

    /**
     * Crée un builder de test pour une API fluide
     */
    createTestBuilder(): TestBuilder {
        return new TestBuilder();
    }

    /**
     * Valide les résultats selon le processus complet
     */
    async validateTestResults(scenario: TestScenario, results: TestResults): Promise<ValidationReport> {
        return await this.createTestBuilder()
            .withScenario(scenario)
            .withResults(results)
            .validate()
            .then(builder => (builder as any).validation); // Cast temporaire pour accéder à la validation
    }

    /**
     * Génère un rapport de test complet
     */
    async generateTestReport(
        scenario: TestScenario,
        results: TestResults
    ): Promise<TestReport> {
        return await this.createTestBuilder()
            .withScenario(scenario)
            .withResults(results)
            .buildFullReport();
    }

    /**
     * Enregistre un plugin de test
     */
    registerPlugin(plugin: TestPlugin): void {
        this.registry.registerPlugin(plugin);
    }

    /**
     * Enregistre une stratégie de validation personnalisée
     */
    registerValidationStrategy<T, R>(name: string, strategy: any): void {
        this.registry.validationFactory.registerStrategy(name, strategy);
    }
}

// Exporter les classes principales pour l'extensibilité
export {
    TestBuilder,
    TestPlugin,
    BaseTestPlugin,
    CULTURAL_TEST_CONSTANTS
};

// Exporter tous les types
export * from './types';