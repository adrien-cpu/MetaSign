//src/ai/system/expressions/cultural/__tests__/utils/core/TestBuilder.ts
import {
    TestScenario,
    TestResults,
    ValidationReport,
    TestReport
} from '../types';
import { ResultsValidator } from '../validators/ResultsValidator';
import { PerformanceAnalyzer } from '../analyzers/PerformanceAnalyzer';
import { ReportGenerator } from '../generators/ReportGenerator';
import { TestRegistry } from './TestRegistry';

/**
 * Builder pour création fluide de tests
 */
export class TestBuilder {
    private scenario?: TestScenario;
    private results?: TestResults;
    private validation?: ValidationReport;

    private readonly registry = TestRegistry.getInstance();
    private readonly validator = new ResultsValidator();
    private readonly analyzer = new PerformanceAnalyzer();
    private readonly reportGenerator = new ReportGenerator();

    /**
     * Définit le scénario de test
     */
    withScenario(scenario: TestScenario): TestBuilder {
        this.scenario = scenario;
        return this;
    }

    /**
     * Définit les résultats de test
     */
    withResults(results: TestResults): TestBuilder {
        this.results = results;
        return this;
    }

    /**
     * Définit le rapport de validation
     */
    withValidation(validation: ValidationReport): TestBuilder {
        this.validation = validation;
        return this;
    }

    /**
     * Valide les résultats par rapport au scénario
     */
    async validate(): Promise<TestBuilder> {
        if (!this.scenario || !this.results) {
            throw new Error('Scenario and results are required for validation');
        }

        // Appliquer les plugins
        const plugins = this.registry.getAllPlugins();
        let scenario = this.scenario;
        let results = this.results;

        for (const plugin of plugins) {
            scenario = await plugin.extendScenario(scenario);
            results = await plugin.analyzeResults(results);
        }

        this.validation = this.validator.validate(scenario, results);
        return this;
    }

    /**
     * Analyse les performances
     */
    analyzePerformance(): TestBuilder {
        if (!this.scenario || !this.results) {
            throw new Error('Scenario and results are required for performance analysis');
        }

        this.analyzer.measure(this.scenario, this.results);
        return this;
    }

    /**
     * Génère le rapport de test final
     */
    generateReport(): TestReport {
        if (!this.scenario || !this.results || !this.validation) {
            throw new Error('Scenario, results, and validation are required for report generation');
        }

        return this.reportGenerator.generate(this.scenario, this.results, this.validation);
    }

    /**
     * Exécute la séquence complète et retourne le rapport
     */
    async buildFullReport(): Promise<TestReport> {
        await this.validate();
        this.analyzePerformance();
        return this.generateReport();
    }
}